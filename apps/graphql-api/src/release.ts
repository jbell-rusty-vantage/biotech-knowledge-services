import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRelease, ReleaseError as SchemaReleaseError, type ReleaseBundle } from "@bks/schema-workspace";
import { sha256Digest } from "./hash.js";

/**
 * Source-schema loading for the consumer API (INTERFACES v0 section 3, TL-02).
 *
 * The consumer projection is built from exactly one source SDL, resolved here and nowhere else:
 * - `schema/pinned/PIN.json` with `pinFormat: "bks-pin.v2"`: the pinned release bundle, loaded and byte-verified by
 *   the schema authority's `loadRelease()` (@bks/schema-workspace); any mismatch is BKS_RELEASE_TAMPERED;
 * - otherwise, outside production only: the frozen v2 candidate SDL
 *   (`schema/program/final/schema/final_biotech_schema_v2.graphql`, sha256 c7cf1235...), with a loud non-production
 *   warning. Production refuses to start without the pinned release.
 *
 * Overrides are explicit and visibly non-production: `BKS_SCHEMA_RELEASE_DIR` (a pinned directory with PIN.json) and
 * `BKS_CONSUMER_CANDIDATE_SDL`. An override that is set but missing is a hard error, never a fallback. Production
 * refuses both. There is no v1 filename anywhere in this loader.
 */

export const CANDIDATE_RELEASE_ID = "biotech-schema-v2.0.0-candidate";
export const CANDIDATE_SDL_RELATIVE = "schema/program/final/schema/final_biotech_schema_v2.graphql";
export const CANDIDATE_SDL_DIGEST = "sha256:c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793";

export type ReleaseErrorCode = "BKS_RELEASE_MISSING" | "BKS_RELEASE_TAMPERED" | "BKS_RELEASE_MISMATCH";

export class ReleaseError extends Error {
  constructor(
    readonly code: ReleaseErrorCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "ReleaseError";
  }
}

/** One entry of the release `ddl/ddl.json` statement list (S1 DdlStatement). Unknown fields are preserved. */
export interface DdlEntry {
  name: string;
  kind: string;
  type?: string;
  labelsOrTypes?: string[];
  properties?: string[];
  statement?: string;
  required: boolean;
  edition: string;
  [key: string]: unknown;
}

export interface ConsumerSource {
  mode: "release" | "candidate";
  releaseId: string;
  /** `sha256:` of the SDL bytes. */
  schemaDigest: string;
  /** `sha256:` of canonical release.json; null for the candidate (no release bundle exists). */
  schemaReleaseDigest: string | null;
  sdl: string;
  sdlPath: string;
  releaseDir: string | null;
  /** DDL statements of the release `ddl/ddl.json`; empty for the candidate. */
  ddl: DdlEntry[];
  /** `supportedMatrix` from release.json (neo4j, cypher, apoc, neo4jGraphql). */
  supportedMatrix: Record<string, unknown> | null;
  /** The verified release bundle (IR, registers, vocabularies, ...) when loaded from a pinned release. */
  bundle: ReleaseBundle | null;
  /** The release's own `compatibility.json` (bks-release-compatibility.v1): capabilities, parent release, read compatibility. */
  releaseCompatibility: ReleaseCompatibility | null;
  warnings: string[];
}

export interface ReleaseCompatibility {
  format: string;
  releaseId: string;
  schemaDigest: string;
  capabilities?: Record<string, { status: string; reason: string }>;
  parentRelease?: { releaseId: string; schemaDigest: string; schemaReleaseDigest: string };
  readCompatibility?: { schemaDigestEqualToParent?: boolean; rule?: string };
  [key: string]: unknown;
}

export interface LoadOptions {
  env?: NodeJS.ProcessEnv;
  /** Repository root holding `schema/`; defaults to three levels above this module (apps/graphql-api/{src,dist}). */
  repoRoot?: string;
  log?: (message: string) => void;
}

const here = dirname(fileURLToPath(import.meta.url));

export function defaultRepoRoot(): string {
  return resolve(here, "..", "..", "..");
}

function mapSchemaError(error: unknown): never {
  if (error instanceof SchemaReleaseError) {
    const code: ReleaseErrorCode = error.code === "RELEASE_TAMPERED" ? "BKS_RELEASE_TAMPERED" : error.code === "RELEASE_MISSING" ? "BKS_RELEASE_MISSING" : "BKS_RELEASE_MISMATCH";
    throw new ReleaseError(code, error.message);
  }
  throw error;
}

/**
 * The single loader for the consumer source SDL. The server, the generators, the registry builder, the benchmarks and
 * the tests all call it.
 */
export function loadConsumerSourceSdl(options: LoadOptions = {}): ConsumerSource {
  const env = options.env ?? process.env;
  const log = options.log ?? ((message: string) => console.warn(message));
  const repoRoot = options.repoRoot ?? defaultRepoRoot();
  const production = env.NODE_ENV === "production";
  const warnings: string[] = [];

  const overrideDir = env.BKS_SCHEMA_RELEASE_DIR?.trim();
  const overrideCandidate = env.BKS_CONSUMER_CANDIDATE_SDL?.trim();
  if (env.BKS_SCHEMA_PATH?.trim()) {
    // TL-02: the v1 single-file override is retired for the consumer API; refuse rather than silently ignore it.
    throw new ReleaseError(
      "BKS_RELEASE_MISMATCH",
      "BKS_SCHEMA_PATH is not supported by the consumer API; use BKS_SCHEMA_RELEASE_DIR (pinned release) or BKS_CONSUMER_CANDIDATE_SDL (non-production)",
    );
  }
  if (production && (overrideDir || overrideCandidate)) {
    throw new ReleaseError("BKS_RELEASE_MISMATCH", "production starts only from the image's pinned release; BKS_SCHEMA_RELEASE_DIR / BKS_CONSUMER_CANDIDATE_SDL overrides are refused");
  }

  const pinnedDir = overrideDir ? resolve(overrideDir) : join(repoRoot, "schema", "pinned");
  if (overrideDir && !existsSync(pinnedDir)) throw new ReleaseError("BKS_RELEASE_MISSING", `BKS_SCHEMA_RELEASE_DIR=${overrideDir} does not exist`);
  const pinPath = join(pinnedDir, "PIN.json");
  let pinFormat = "absent";
  if (existsSync(pinPath)) {
    try {
      pinFormat = (JSON.parse(readFileSync(pinPath, "utf8")) as { pinFormat?: string }).pinFormat ?? "legacy-v1";
    } catch {
      throw new ReleaseError("BKS_RELEASE_TAMPERED", `${pinPath} does not parse`);
    }
  }

  if (pinFormat === "bks-pin.v2" && !overrideCandidate) {
    let bundle: ReleaseBundle;
    try {
      bundle = loadRelease({ dir: pinnedDir });
    } catch (error) {
      mapSchemaError(error);
    }
    if (overrideDir) warnings.push(`NON-PRODUCTION override: release loaded from BKS_SCHEMA_RELEASE_DIR=${overrideDir}`);
    for (const w of warnings) log(`[bks-graphql-api] ${w}`);
    const ddl: DdlEntry[] = bundle.ddl.manifest.statements.map((s) => ({ ...s, required: s.requirement === "required" }));
    let releaseCompatibility: ReleaseCompatibility | null = null;
    if (bundle.files["compatibility.json"]) releaseCompatibility = JSON.parse(bundle.text("compatibility.json")) as ReleaseCompatibility;
    return {
      mode: "release",
      releaseId: bundle.manifest.releaseId,
      schemaDigest: bundle.schemaDigest,
      schemaReleaseDigest: bundle.schemaReleaseDigest,
      sdl: bundle.sdl,
      sdlPath: join(bundle.dir, bundle.pin?.sdlKey ?? "sdl/assembled.graphql"),
      releaseDir: bundle.dir,
      ddl,
      supportedMatrix: (bundle.manifest as unknown as { supportedMatrix?: Record<string, unknown> }).supportedMatrix ?? null,
      bundle,
      releaseCompatibility,
      warnings,
    };
  }

  if (production) {
    throw new ReleaseError(
      "BKS_RELEASE_MISSING",
      `production requires the pinned v2 release (schema/pinned/PIN.json with pinFormat bks-pin.v2); found pin format "${pinFormat}" in ${pinnedDir}`,
    );
  }

  const candidatePath = overrideCandidate ? resolve(overrideCandidate) : join(repoRoot, CANDIDATE_SDL_RELATIVE);
  if (!existsSync(candidatePath) || !statSync(candidatePath).isFile()) {
    throw new ReleaseError(
      "BKS_RELEASE_MISSING",
      `${overrideCandidate ? "BKS_CONSUMER_CANDIDATE_SDL" : "candidate SDL"} ${candidatePath} does not exist and no bks-pin.v2 release is pinned`,
    );
  }
  const bytes = readFileSync(candidatePath);
  const schemaDigest = sha256Digest(bytes);
  if (!overrideCandidate && schemaDigest !== CANDIDATE_SDL_DIGEST) {
    throw new ReleaseError("BKS_RELEASE_TAMPERED", `candidate SDL ${candidatePath} has digest ${schemaDigest}, expected the frozen ${CANDIDATE_SDL_DIGEST}`);
  }
  warnings.push(
    `NON-PRODUCTION: ${overrideCandidate ? "BKS_CONSUMER_CANDIDATE_SDL override" : `no bks-pin.v2 release is pinned (pin format "${pinFormat}")`}; serving the v2 CANDIDATE SDL ${candidatePath} (${schemaDigest}). ` +
      "This build is not a release and must not be deployed.",
  );
  for (const w of warnings) log(`[bks-graphql-api] !!!!!!!! ${w}`);
  return { mode: "candidate", releaseId: CANDIDATE_RELEASE_ID, schemaDigest, schemaReleaseDigest: null, sdl: bytes.toString("utf8"), sdlPath: candidatePath, releaseDir: null, ddl: [], supportedMatrix: null, bundle: null, releaseCompatibility: null, warnings };
}
