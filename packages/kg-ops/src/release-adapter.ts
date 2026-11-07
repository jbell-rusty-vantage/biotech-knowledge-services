import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";
import { canonicalDigest, rawBytesDigest } from "@bks/contracts";
import { loadRelease, repoRoot, type ReleaseDdl } from "@bks/schema-workspace";

/**
 * The executor's view of a schema release: raw bytes plus parsed registers/vocabularies.
 *
 * This file is the ONE swap point for the release source. By default it serves the pinned release bundle through
 * the schema authority's verified `loadRelease()` (INTERFACES section 3); the wave-1 adapter over the frozen
 * candidate under `schema/program/final/` (SDL digest c7cf1235...) stays available for comparison. Both fill the same
 * `ReleaseInputs` shape (sdl, registers, vocabularies, digests); nothing else in the writer reads release files.
 */
export interface ReleaseInputs {
  releaseId: string;
  sourceKind: "candidate" | "release";
  /** sha256 of the assembled SDL bytes. */
  schemaDigest: string;
  /**
   * Candidate: bks-canonical-json.v2 digest of the input manifest (every file's raw-bytes digest).
   * Release: the S1 `schemaReleaseDigest` from release.json.
   */
  schemaReleaseDigest: string;
  files: Record<string, { sha256: string; bytes: number }>;
  sdl: string;
  nodeRegister: NodeRegisterFile;
  relationshipRegister: RelationshipRegisterFile;
  predicates: PredicateRegistryFile;
  identifierSchemes: IdentifierSchemeFile;
  verdictLattice: Record<string, unknown>;
  claimLifecycle: Record<string, unknown>;
  /** Qualifier prefix registry (release vocabularies/qualifiers.yaml); absent in the candidate. */
  qualifiers?: QualifierRegistryFile;
  /** Capture-method registry (release vocabularies/capture-methods.yaml, FU-06); absent in the candidate. */
  captureMethods?: CaptureMethodFile;
  /** S1 executor operations per node type (validation-params executorOps = IR NodeType.executorOps); absent in the candidate. */
  executorOps?: Record<string, { ops: string[]; policy: string; stated: boolean }>;
  /** The release DDL (ddl/ddl.json + required/enterprise/optional cypher): the single DDL authority; absent in the candidate. */
  ddl?: ReleaseDdl;
  /** Release bundle directory and source (pinned | override) when loaded through loadRelease(). */
  bundle?: { dir: string; source: "pinned" | "override" };
  /** ddl/ddl.json digest of the release (identities.ddlDigest); recorded on and checked against KsReleaseMarker. */
  ddlDigest?: string;
}

export interface QualifierRegistryFile {
  format?: string;
  qualifiers: Record<string, { name: string; separator: string; valueGrammar: string; status: string }>;
}
export interface CaptureMethodFile {
  entries: Array<{ id: string; aliases?: string[] }>;
}

export interface NodeRegisterEntry {
  module: string;
  name: string;
  uidToken: string;
  identityKeys?: string[];
  identifierSchemes?: string[];
  archetype?: string;
  mutations?: unknown;
  mutationsNote?: string;
  mutationNote?: string;
  labels?: string[];
  /** Register privacy rule, e.g. "privacyClass INTERNAL by default (R-41) ..." (CaptureAttempt). */
  privacy?: string;
}
export interface NodeRegisterFile {
  sdl?: { sha256?: string };
  nodes: NodeRegisterEntry[];
}
export interface RelationshipRegisterEntry {
  module: string;
  type: string;
  class: "structural" | "asserted" | "derived";
  from: unknown;
  to: unknown;
  edgeProperties: string | null;
  temporal?: string;
  exclusive?: boolean;
  projectionGate?: string;
  assertionKind?: string;
  qualifiers?: unknown;
  requiredQualifiers?: unknown;
}
export interface RelationshipRegisterFile {
  sdl?: { sha256?: string };
  relationships: RelationshipRegisterEntry[];
  predicateOnly?: Array<Record<string, unknown>>;
  authorizingPredicates?: Array<Record<string, unknown>>;
  moduleExtras?: Record<string, Record<string, unknown>>;
}
export interface PredicateEntry {
  predicate: string;
  status: string;
  kind: "relationship" | "authorizing" | "literal" | "field" | "computation" | "retired";
  registrar: string | null;
  subjectTypes: string[];
  objectTypes: string[];
  literal: { valueFields?: string[]; unit?: string | null } | null;
  observed?: { subjectTypes?: string[]; objectTypes?: string[] };
  replacedBy?: string[];
  qualifiers?: string[];
  requiredQualifiers?: string[];
  field?: string;
}
export interface PredicateRegistryFile {
  sdl?: { schemaDigest?: string };
  predicates: PredicateEntry[];
}
export interface IdentifierSchemeEntry {
  code: string;
  name?: string;
  authority?: string;
  pattern: string | null;
  normalization?: { rule?: string; text?: string };
  status?: string;
  usedByNodeTypes?: string[];
}
export interface IdentifierSchemeFile {
  schemes: IdentifierSchemeEntry[];
}

const CANDIDATE_FILES = {
  sdl: "schema/final_biotech_schema_v2.graphql",
  nodeRegister: "node-register.yaml",
  relationshipRegister: "relationship-register.yaml",
} as const;

export function candidateReleaseDir(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = env.BKS_CANDIDATE_RELEASE_DIR;
  if (explicit !== undefined) {
    if (!existsSync(explicit)) throw new Error(`BKS_CANDIDATE_RELEASE_DIR is set but missing: ${explicit}`);
    return resolve(explicit);
  }
  return resolve(repoRoot, "schema", "program", "final");
}

let cached: { dir: string; inputs: ReleaseInputs } | null = null;

/** Reads the frozen candidate release (SDL + registers + vocabularies) and digests every input byte. */
export function loadCandidateRelease(dir: string = candidateReleaseDir()): ReleaseInputs {
  if (cached && cached.dir === dir) return cached.inputs;
  const files: ReleaseInputs["files"] = {};
  const read = (rel: string): string => {
    const buf = readFileSync(resolve(dir, rel));
    files[rel] = { sha256: rawBytesDigest(buf).slice("sha256:".length), bytes: buf.byteLength };
    return buf.toString("utf8");
  };
  const sdl = read(CANDIDATE_FILES.sdl);
  const nodeRegister = YAML.parse(read(CANDIDATE_FILES.nodeRegister)) as NodeRegisterFile;
  const relationshipRegister = YAML.parse(read(CANDIDATE_FILES.relationshipRegister)) as RelationshipRegisterFile;
  const vocabDir = resolve(dir, "vocabularies");
  const vocab: Record<string, unknown> = {};
  for (const f of readdirSync(vocabDir).filter((x) => x.endsWith(".yaml")).sort()) {
    vocab[f.replace(/\.yaml$/, "")] = YAML.parse(read(`vocabularies/${f}`));
  }
  const schemaDigest = `sha256:${files[CANDIDATE_FILES.sdl]!.sha256}`;
  const manifest = { releaseId: "biotech-schema-v2.0.0-candidate", schemaDigest, files };
  const inputs: ReleaseInputs = {
    releaseId: "biotech-schema-v2.0.0-candidate",
    sourceKind: "candidate",
    schemaDigest,
    schemaReleaseDigest: canonicalDigest(manifest),
    files,
    sdl,
    nodeRegister,
    relationshipRegister,
    predicates: vocab.predicates as PredicateRegistryFile,
    identifierSchemes: vocab["identifier-schemes"] as IdentifierSchemeFile,
    verdictLattice: (vocab["verdict-lattice"] ?? {}) as Record<string, unknown>,
    claimLifecycle: (vocab["claim-lifecycle"] ?? {}) as Record<string, unknown>,
  };
  for (const [name, stamped] of [["node-register", nodeRegister.sdl?.sha256], ["relationship-register", relationshipRegister.sdl?.sha256]] as const) {
    if (stamped && `sha256:${stamped}` !== schemaDigest) throw new Error(`RELEASE_TAMPERED: ${name} stamps SDL ${stamped}, assembled SDL is ${schemaDigest}`);
  }
  cached = { dir, inputs };
  return inputs;
}

const releaseCache = new Map<string, ReleaseInputs>();

/**
 * Adapter over the schema authority's verified release bundle (`loadRelease()`, INTERFACES section 3): the pinned
 * release by default, or `loadRelease({dir})` for an explicit override directory (tests prove the writer against a
 * staged release this way).
 */
export function loadPinnedRelease(opts: { dir?: string } = {}): ReleaseInputs {
  const key = opts.dir ?? "<pinned>";
  const hit = releaseCache.get(key);
  if (hit) return hit;
  const b = loadRelease(opts.dir ? { dir: opts.dir } : {});
  const files: ReleaseInputs["files"] = {};
  for (const [path, f] of Object.entries((b.pin?.files ?? {}) as Record<string, { sha256: string; bytes: number }>)) files[path] = { sha256: f.sha256, bytes: f.bytes };
  const inputs: ReleaseInputs = {
    releaseId: b.manifest.releaseId,
    sourceKind: "release",
    schemaDigest: b.schemaDigest,
    schemaReleaseDigest: b.schemaReleaseDigest,
    files,
    sdl: b.sdl,
    nodeRegister: b.registers.nodes as unknown as NodeRegisterFile,
    relationshipRegister: b.registers.relationships as unknown as RelationshipRegisterFile,
    predicates: b.vocabularies.predicates as unknown as PredicateRegistryFile,
    identifierSchemes: b.vocabularies["identifier-schemes"] as unknown as IdentifierSchemeFile,
    verdictLattice: b.vocabularies["verdict-lattice"] ?? {},
    claimLifecycle: b.vocabularies["claim-lifecycle"] ?? {},
    ...(b.vocabularies.qualifiers ? { qualifiers: b.vocabularies.qualifiers as unknown as QualifierRegistryFile } : {}),
    ...(b.vocabularies["capture-methods"] ? { captureMethods: b.vocabularies["capture-methods"] as unknown as CaptureMethodFile } : {}),
    ...(b.params.executorOps ? { executorOps: b.params.executorOps as ReleaseInputs["executorOps"] } : {}),
    ddl: b.ddl,
    bundle: { dir: b.dir, source: b.source },
    ...(b.manifest.identities?.ddlDigest ?? b.pin?.ddlDigest ? { ddlDigest: (b.manifest.identities?.ddlDigest ?? b.pin?.ddlDigest) as string } : {}),
  };
  releaseCache.set(key, inputs);
  return inputs;
}

/**
 * The release the writer serves. Default: the pinned release bundle verified by `loadRelease()` (fails closed on
 * RELEASE_MISSING / RELEASE_TAMPERED). `BKS_WRITE_RELEASE_SOURCE=candidate` serves the frozen schema/program/final
 * candidate instead (comparison and replay of the wave-1 inputs only; never production).
 */
export function loadWriteRelease(env: NodeJS.ProcessEnv = process.env): ReleaseInputs {
  const source = env.BKS_WRITE_RELEASE_SOURCE ?? "pinned";
  if (source === "candidate") return loadCandidateRelease();
  if (source !== "pinned") throw new Error(`BKS_WRITE_RELEASE_SOURCE must be pinned or candidate (got ${source})`);
  return loadPinnedRelease();
}
