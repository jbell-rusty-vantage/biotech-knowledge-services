/**
 * Release loader (INTERFACES section 3): the only way services read the schema. Every byte is verified on load.
 *
 *   loadRelease()                      -> schema/pinned (PIN.json bks-pin.v2 + release/**), the default
 *   loadRelease({ dir })               -> an explicit pinned dir (PIN.json) or a raw upstream release dir (release.json)
 *   BKS_SCHEMA_RELEASE_DIR=<dir>       -> explicit override; set but missing is a hard RELEASE_MISSING error (TL-02)
 *
 * Errors: RELEASE_MISSING (nothing to load), RELEASE_TAMPERED (any byte, digest, identity or unlisted file mismatch),
 * RELEASE_INVALID (malformed manifest). There is no fallback to v1 file names anywhere.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { parse as parseYaml } from "yaml";
import { canonicalJson } from "@bks/contracts";
import type { OperationalNames, SchemaIR, ValidationParams } from "./ir.js";
import { parseSchema, type ReleaseInputs } from "./parse.js";

export type ReleaseErrorCode = "RELEASE_MISSING" | "RELEASE_TAMPERED" | "RELEASE_INVALID";

export class ReleaseError extends Error {
  /** INTERFACES section 5 error spelling (`BKS_` prefix). */
  readonly bksCode: string;
  constructor(
    readonly code: ReleaseErrorCode,
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ReleaseError";
    this.bksCode = `BKS_${code}`;
  }
}

export interface FileDigest {
  sha256: string;
  bytes: number;
}

/** schema/pinned/PIN.json (bks-pin.v2). */
export interface PinV2 {
  pinFormat: "bks-pin.v2";
  releaseId: string;
  schemaReleaseDigest: string;
  schemaDigest: string;
  queryCatalogDigest?: string;
  ddlDigest?: string;
  validationParamsDigest?: string;
  decisionLedgerDigest?: string;
  contentTreeDigest?: string;
  sourcePath: string;
  /** v2.0.x pins name the historical biotech-meta checkout; v2.1.0+ pins name the authoring repository (SV-D10). */
  sourceRevision: {
    biotechMeta?: string;
    biotechMetaHead?: string | null;
    biotechMetaReleaseDirClean?: boolean;
    sourceRepository?: string;
    sourcePath?: string;
    source?: string;
    sourceHead?: string | null;
    sourceReleaseDirClean?: boolean;
    bksCommit?: string;
  };
  pinnedAt: string;
  /** Directory under the pin root holding the bundle (`release`). */
  root: string;
  sdlKey: string;
  releaseKey: string;
  excludedFromFrozenDigestSet?: string[];
  files: Record<string, FileDigest>;
  provenance?: Record<string, unknown>;
}

/** release.json (bks-schema-release.v1); only the fields services read are typed. */
export interface ReleaseManifest {
  releaseFormat: "bks-schema-release.v1";
  releaseId: string;
  version: string;
  status: string;
  createdAt: string;
  parentBaseline: { schemaDigest: string; path: string; repository: string; commit: string; bytes: number };
  /** biotechMeta* fields: v2.0.x only; sourceRepository/sourcePath: releases authored in this repository (v2.1.0+). */
  sourceRevision: { bksCommit: string; biotechMetaCommit?: string; biotechMetaDirty?: boolean; sourceRepository?: string; sourcePath?: string; dirtySnapshotDigest: string; [k: string]: unknown };
  identities: { schemaDigest: string; queryCatalogDigest: string; ddlDigest: string; validationParamsDigest: string; decisionLedgerDigest: string; contentTreeDigest: string };
  decisionLedgerDigest: string;
  files: Record<string, FileDigest & { role: string }>;
  excludedFromFrozenDigestSet: Record<string, FileDigest & { role: string; owner: string; rule: string }>;
  moduleOwnership: Record<string, { file: string; sha256: string; owner: string; title: string; definitions: number; nodeTypes: string[] }>;
  contractVersions: Record<string, unknown>;
  compilerVersions: Record<string, unknown>;
  supportedMatrix: Record<string, unknown>;
  metrics: Record<string, unknown>;
  [k: string]: unknown;
}

export interface DdlStatement {
  name: string;
  kind: "constraint" | "index";
  type: string;
  entity: "NODE" | "RELATIONSHIP";
  labelsOrTypes: string[];
  properties: string[];
  statement: string;
  requirement: "required" | "optional";
  edition: "community" | "enterprise";
  file: string;
  source: string;
  purpose: string;
  invariant: boolean;
  section: string;
}

export interface ReleaseDdl {
  manifest: { format: string; releaseId: string; schemaDigest: string; statements: DdlStatement[]; checks: Array<{ name: string; cypher: string; expect: string }>; bootstrap: Array<Record<string, unknown>>; counts: Record<string, unknown> };
  required: string;
  enterprise: string;
  optional: string;
}

export interface ReleaseBundle {
  /** Resolved bundle root (the directory holding release.json). */
  dir: string;
  /** `pinned`: schema/pinned (default); `override`: BKS_SCHEMA_RELEASE_DIR or an explicit dir. Overrides are visibly non-production. */
  source: "pinned" | "override";
  pin: PinV2 | null;
  manifest: ReleaseManifest;
  sdl: string;
  schemaDigest: string;
  schemaReleaseDigest: string;
  assembly: ReleaseInputs["assembly"] & { format: string; releaseId: string; sha256: string; schemaDigest: string };
  ir: SchemaIR;
  registers: { nodes: Record<string, unknown>; relationships: Record<string, unknown>; seams: Record<string, unknown> };
  /** Parsed vocabularies by name (`predicates`, `qualifiers`, `assessments`, `identifier-schemes`, ...). */
  vocabularies: Record<string, Record<string, unknown>>;
  /** Parsed rules by name (`identity-rules`, `projection-rules`, `temporal-rules`). */
  rules: Record<string, Record<string, unknown>>;
  ddl: ReleaseDdl;
  queryCatalog: Record<string, unknown>;
  /** Workspace inputs: absolute directory plus raw text and parsed YAML by file name. */
  workspaceInputs: { dir: string; text: Record<string, string>; parsed: Record<string, unknown> };
  /** validation/validation-params.json (bks-validation-params.v2) as read. */
  validationParams: Record<string, unknown>;
  /** The subset the services consume (v1 keys, v2 content). */
  params: ValidationParams;
  migration: { v1Map: Record<string, unknown> | null; legacyMap: Record<string, unknown> | null };
  /** Release-known operational names (v2.0.1+; null for v2.0.0). */
  operationalNames: OperationalNames | null;
  /** Every verified file (path relative to `dir`). */
  files: Record<string, FileDigest>;
  /** Raw text of a verified file. */
  text(path: string): string;
}

const sha256 = (b: Uint8Array | string) => createHash("sha256").update(b).digest("hex");

function listFiles(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir).sort()) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...listFiles(p, base));
    else out.push(relative(base, p).split(sep).join("/"));
  }
  return out;
}

function repoRootDir(): string {
  // packages/schema-workspace/src|dist -> repo root
  return resolve(new URL("../../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
}

export const pinnedRoot = (): string => resolve(repoRootDir(), "schema", "pinned");

/** Resolves the directory to load: opts.dir, else BKS_SCHEMA_RELEASE_DIR (explicit), else schema/pinned. */
export function resolveReleaseDir(opts: { dir?: string } = {}): { dir: string; source: "pinned" | "override"; explicit: boolean } {
  const env = process.env.BKS_SCHEMA_RELEASE_DIR;
  if (opts.dir !== undefined) return { dir: resolve(opts.dir), source: resolve(opts.dir) === pinnedRoot() ? "pinned" : "override", explicit: true };
  if (env !== undefined && env !== "") return { dir: resolve(env), source: "override", explicit: true };
  return { dir: pinnedRoot(), source: "pinned", explicit: false };
}

const cache = new Map<string, ReleaseBundle>();

/** Loads and fully verifies a release bundle; throws ReleaseError. Results are memoized per directory unless `cache: false`. */
export function loadRelease(opts: { dir?: string; cache?: boolean } = {}): ReleaseBundle {
  const { dir, source, explicit } = resolveReleaseDir(opts);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    throw new ReleaseError("RELEASE_MISSING", explicit ? `explicit schema release directory does not exist: ${dir} (BKS_SCHEMA_RELEASE_DIR / dir is set; there is no fallback)` : `no pinned release at ${dir} (run: pnpm schema:pin -- --release <dir>)`, { dir, explicit });
  }
  const useCache = opts.cache !== false;
  const key = `${dir}|${source}`;
  if (useCache && cache.has(key)) return cache.get(key)!;
  const bundle = verifyAndLoad(dir, source);
  if (useCache) cache.set(key, bundle);
  return bundle;
}

/** Drops memoized bundles (tests). */
export function clearReleaseCache(): void {
  cache.clear();
}

function verifyAndLoad(dir: string, source: "pinned" | "override"): ReleaseBundle {
  let pin: PinV2 | null = null;
  let root = dir;
  let expected: Record<string, FileDigest>;
  const pinPath = join(dir, "PIN.json");
  if (existsSync(pinPath)) {
    try {
      pin = JSON.parse(readFileSync(pinPath, "utf8")) as PinV2;
    } catch (e) {
      throw new ReleaseError("RELEASE_INVALID", `PIN.json does not parse: ${(e as Error).message}`, { dir });
    }
    if (pin.pinFormat !== "bks-pin.v2") throw new ReleaseError("RELEASE_INVALID", `unsupported pin format ${String(pin.pinFormat)} (expected bks-pin.v2; v1 pins are retired)`, { dir });
    root = join(dir, pin.root ?? "release");
    if (!existsSync(root)) throw new ReleaseError("RELEASE_MISSING", `pinned bundle directory missing: ${root}`, { dir });
    expected = pin.files;
  } else if (existsSync(join(dir, "release.json"))) {
    expected = {};
  } else {
    throw new ReleaseError("RELEASE_MISSING", `no PIN.json or release.json in ${dir}`, { dir });
  }

  const releaseBytes = readFileSync(join(root, "release.json"));
  let manifest: ReleaseManifest;
  try {
    manifest = JSON.parse(releaseBytes.toString("utf8")) as ReleaseManifest;
  } catch (e) {
    throw new ReleaseError("RELEASE_INVALID", `release.json does not parse: ${(e as Error).message}`, { dir: root });
  }
  if (manifest.releaseFormat !== "bks-schema-release.v1") throw new ReleaseError("RELEASE_INVALID", `unsupported release format ${String(manifest.releaseFormat)}`, { dir: root });
  const listed: Record<string, FileDigest> = { ...manifest.files };
  for (const [p, e] of Object.entries(manifest.excludedFromFrozenDigestSet ?? {})) listed[p] = e;
  if (!pin) expected = { ...listed, "release.json": { sha256: sha256(releaseBytes), bytes: releaseBytes.length } };

  // 1. Every expected byte, and no unexpected file.
  const tampered: string[] = [];
  const bytes = new Map<string, Buffer>();
  const onDisk = new Set(listFiles(root));
  for (const p of onDisk) if (!(p in expected)) tampered.push(`unlisted file ${p}`);
  for (const [p, e] of Object.entries(expected)) {
    if (!onDisk.has(p)) {
      tampered.push(`missing file ${p}`);
      continue;
    }
    const b = readFileSync(join(root, p));
    bytes.set(p, b);
    if (b.length !== e.bytes || sha256(b) !== e.sha256) tampered.push(`digest mismatch ${p}`);
  }
  // 2. The pin and the manifest agree file by file; identities match their files.
  if (pin) {
    for (const [p, e] of Object.entries(listed)) if (!pin.files[p] || pin.files[p]!.sha256 !== e.sha256 || pin.files[p]!.bytes !== e.bytes) tampered.push(`PIN.json and release.json disagree on ${p}`);
    for (const p of Object.keys(pin.files)) if (p !== "release.json" && !(p in listed)) tampered.push(`PIN.json lists ${p}, release.json does not`);
  }
  const schemaReleaseDigest = `sha256:${sha256(canonicalJson(manifest))}`;
  if (pin && pin.schemaReleaseDigest !== schemaReleaseDigest) tampered.push(`schemaReleaseDigest ${schemaReleaseDigest} != pinned ${pin.schemaReleaseDigest}`);
  const id = manifest.identities;
  const tag = (p: string) => (bytes.has(p) ? `sha256:${sha256(bytes.get(p)!)}` : null);
  const idChecks: Array<[string, string | null]> = [
    ["schemaDigest", tag("sdl/assembled.graphql")],
    ["queryCatalogDigest", tag("query-catalog/catalog.json")],
    ["ddlDigest", tag("ddl/ddl.json")],
    ["validationParamsDigest", tag("validation/validation-params.json")],
    ["decisionLedgerDigest", tag("decisions/DECISIONS.md")],
    ["contentTreeDigest", `sha256:${sha256(Object.entries(manifest.files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([p, e]) => `${p}\u0000${e.sha256}\n`).join(""))}`],
  ];
  for (const [k, v] of idChecks) if ((id as Record<string, string>)[k] !== v) tampered.push(`identity ${k} mismatch`);
  if (pin && pin.schemaDigest !== id.schemaDigest) tampered.push("PIN.json schemaDigest != release identity");
  if (tampered.length) throw new ReleaseError("RELEASE_TAMPERED", `schema release at ${root} failed verification: ${tampered.slice(0, 5).join("; ")}${tampered.length > 5 ? ` (+${tampered.length - 5} more)` : ""}`, { dir: root, problems: tampered });

  // 3. Parse the verified bytes.
  const text = (p: string): string => {
    const b = bytes.get(p);
    if (!b) throw new ReleaseError("RELEASE_INVALID", `release file not present: ${p}`, { dir: root });
    return b.toString("utf8");
  };
  const yamlOf = (p: string) => parseYaml(text(p)) as Record<string, unknown>;
  const jsonOf = (p: string) => JSON.parse(text(p)) as Record<string, unknown>;
  const has = (p: string) => bytes.has(p);
  const sdl = text("sdl/assembled.graphql");
  const assembly = jsonOf("sdl/assembled.manifest.json") as unknown as ReleaseBundle["assembly"];
  const vocabularies: Record<string, Record<string, unknown>> = {};
  const rules: Record<string, Record<string, unknown>> = {};
  for (const p of bytes.keys()) {
    const m = /^vocabularies\/([a-z0-9-]+)\.yaml$/.exec(p);
    if (m) vocabularies[m[1]!] = yamlOf(p);
    const r = /^rules\/([a-z0-9-]+)\.yaml$/.exec(p);
    if (r) rules[r[1]!] = yamlOf(p);
  }
  const registers = { nodes: yamlOf("registers/node-register.yaml"), relationships: yamlOf("registers/relationship-register.yaml"), seams: has("registers/seams.yaml") ? yamlOf("registers/seams.yaml") : {} };
  const validationParams = jsonOf("validation/validation-params.json");
  const params = toValidationParams(validationParams);
  const ddlManifest = jsonOf("ddl/ddl.json") as unknown as ReleaseDdl["manifest"];
  const workspaceText: Record<string, string> = {};
  const workspaceParsed: Record<string, unknown> = {};
  for (const p of bytes.keys()) {
    const m = /^workspace-inputs\/([^/]+)$/.exec(p);
    if (!m) continue;
    workspaceText[m[1]!] = text(p);
    if (p.endsWith(".yaml")) workspaceParsed[m[1]!] = parseYaml(text(p));
  }
  const release: ReleaseInputs = {
    releaseId: manifest.releaseId,
    assembly,
    moduleOwnership: manifest.moduleOwnership,
    nodeRegister: registers.nodes as ReleaseInputs["nodeRegister"],
    relationshipRegister: registers.relationships as ReleaseInputs["relationshipRegister"],
    predicates: vocabularies.predicates as ReleaseInputs["predicates"],
    qualifiers: vocabularies.qualifiers as ReleaseInputs["qualifiers"],
    assessments: vocabularies.assessments as ReleaseInputs["assessments"],
    identifierSchemes: vocabularies["identifier-schemes"] as ReleaseInputs["identifierSchemes"],
    ddl: ddlManifest,
    projectionRules: rules["projection-rules"] as ReleaseInputs["projectionRules"],
  };
  const identityKeys = identityKeysFromWorkspace(workspaceParsed["identity-rules.yaml"]);
  const ir = parseSchema(sdl, { params, identityKeys, release });
  if (ir.schemaDigest !== id.schemaDigest) throw new ReleaseError("RELEASE_TAMPERED", "parsed SDL digest disagrees with the release identity", { dir: root });
  return {
    dir: root,
    source,
    pin,
    manifest,
    sdl,
    schemaDigest: id.schemaDigest,
    schemaReleaseDigest,
    assembly,
    ir,
    registers,
    vocabularies,
    rules,
    ddl: { manifest: ddlManifest, required: text("ddl/required.cypher"), enterprise: text("ddl/enterprise.cypher"), optional: has("ddl/optional.cypher") ? text("ddl/optional.cypher") : "" },
    queryCatalog: jsonOf("query-catalog/catalog.json"),
    workspaceInputs: { dir: join(root, "workspace-inputs"), text: workspaceText, parsed: workspaceParsed },
    validationParams,
    params,
    operationalNames: params.operationalNames ?? null,
    migration: { v1Map: has("migration/v1-map.yaml") ? yamlOf("migration/v1-map.yaml") : null, legacyMap: has("migration/legacy-map.yaml") ? yamlOf("migration/legacy-map.yaml") : null },
    files: Object.fromEntries([...bytes.entries()].map(([p, b]) => [p, { sha256: sha256(b), bytes: b.length }])),
    text,
  };
}

/** Maps validation-params.json (v2) onto the ValidationParams the services consume. */
export function toValidationParams(raw: Record<string, unknown>): ValidationParams {
  const arr = (k: string) => (raw[k] as string[] | undefined) ?? [];
  return {
    uidTypeTokens: (raw.uidTypeTokens as Record<string, string>) ?? {},
    assertedTypes: arr("assertedTypes"),
    derivedTypes: arr("derivedTypes"),
    ruleOnlyDerivedTypes: arr("ruleOnlyDerivedTypes"),
    exclusiveTypes: arr("exclusiveTypes"),
    implicationPairs: (raw.implicationPairs as string[][]) ?? [],
    registeredPredicates: arr("registeredPredicates"),
    privateUidTokens: arr("privateUidTokens"),
    publicAnswerExcludedLabels: arr("publicAnswerExcludedLabels"),
    legacyTypes: arr("legacyTypes"),
    structuralTypes: arr("structuralTypes"),
    predicateAliases: (raw.predicateAliases as Record<string, string>) ?? {},
    retiredPredicates: (raw.retiredPredicates as ValidationParams["retiredPredicates"]) ?? {},
    activeIdentifierSchemes: arr("activeIdentifierSchemes"),
    executorOps: (raw.executorOps as ValidationParams["executorOps"]) ?? {},
    projectionGates: (raw.projectionGates as Record<string, string>) ?? {},
    ...(raw.operationalNames ? { operationalNames: raw.operationalNames as ValidationParams["operationalNames"] } : {}),
  };
}

function identityKeysFromWorkspace(identityRules: unknown): Record<string, string[]> {
  const types = (identityRules as { types?: Record<string, { nameProperties?: string[] }> } | undefined)?.types ?? {};
  return Object.fromEntries(Object.entries(types).map(([t, r]) => [t, r.nameProperties ?? []]));
}

export type NameClass = "node-type" | "label" | "relationship-type" | "operational-label" | "operational-relationship" | "operational-property" | "operational-qualifier" | "unknown";

/**
 * Classifies a graph name against a release: a v2 domain name (SDL node type, stored label, relationship type), a
 * release-known operational name (v2.0.1+: LegacyV0*, MIGRATED_FROM, legacy: qualifiers, Ks* markers) or unknown.
 * Operational names are never domain types: no projection, no typed read, no agent write.
 */
export function classifyName(bundle: Pick<ReleaseBundle, "ir" | "operationalNames">, name: string): NameClass {
  const ir = bundle.ir;
  if (ir.nodes.some((n) => n.name === name)) return "node-type";
  if (ir.nodes.some((n) => n.storedLabels.includes(name))) return "label";
  if (ir.relationshipTypes.some((r) => r.type === name)) return "relationship-type";
  const op = bundle.operationalNames;
  if (op) {
    if (op.labels.includes(name)) return "operational-label";
    if (op.relationshipTypes.includes(name)) return "operational-relationship";
    if (op.properties.includes(name)) return "operational-property";
    if (op.qualifierPrefixes.some((q) => name === q || name.startsWith(q))) return "operational-qualifier";
  }
  return "unknown";
}
