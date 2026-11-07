/**
 * Opening, reading and verifying a generated workspace (bks-schema-workspace.v2). Everything here works on the
 * packaged tree alone (offline sandbox): manifest.json, search/index.jsonl, search/adjacency.json, cards, IR.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, normalize, relative, resolve, sep } from "node:path";
import type { SchemaIR } from "./ir.js";
import { defaultWorkspaceDir } from "./load.js";
import { parseCard, sectionSlug, sectionsOf } from "./card.js";
import { CardRecord, LOOKUP_KINDS, WorkspaceManifestV2, WORKSPACE_FORMAT_V2 } from "./schema-contracts.js";
import { compareHits, lexicalSearch, preparedIndexOf, reciprocalRankFusion, type PreparedIndex, type SearchFilters, type SearchHit } from "./search.js";
import { notConfiguredRetriever, validateHostedHits, type SemanticRetriever, type SemanticStatus } from "./semantic/retriever.js";
import { stepIndex, type Adjacency } from "./topology.js";
import { fingerprintOf } from "./render.js";
import { findPaths, type PathsResult } from "./path.js";

export type WorkspaceErrorCode = "WORKSPACE_MISSING" | "WORKSPACE_CORRUPT" | "WORKSPACE_UNSUPPORTED" | "RELEASE_MISMATCH" | "PAGE_NOT_FOUND" | "PAGE_PATH_INVALID" | "SECTION_NOT_FOUND" | "LIMIT_EXCEEDED";

export class WorkspaceError extends Error {
  readonly bksCode: string;
  constructor(
    public readonly code: WorkspaceErrorCode,
    message: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.bksCode = `BKS_${code}`;
  }
}

export interface QueryCatalog {
  format: string;
  releaseId: string;
  templates: Array<Record<string, unknown> & { id: string; questionIds: string[]; status: string; module: string }>;
  questions: Array<Record<string, unknown> & { id: string; templates: string[]; status: string; module: string }>;
  aliases: Array<{ alias: string; canonical: string[]; kind?: string }>;
}

export interface Workspace {
  readonly dir: string;
  readonly manifest: WorkspaceManifestV2;
  readonly index: readonly CardRecord[];
  /** Lazily parsed; the IR file is large. */
  ir(): SchemaIR;
  adjacency(): Adjacency;
  catalog(): QueryCatalog;
  prepared(): PreparedIndex;
  record(id: string): CardRecord | undefined;
  /** Resolves an id, a v1 id (`frag:D6`, `node:Mention`) or a card alias to its record. */
  resolve(idOrName: string): ResolvedId | undefined;
  cardDigest(id: string): string | undefined;
  /** Synchronous lexical search (v1-compatible signature). */
  search(query: string, limit?: number): SearchHit[];
  page(idOrPath: string, options?: PageOptions): Page;
}

export interface ResolvedId {
  record: CardRecord;
  /** How the input matched: the id itself, a card alias, or a lookup row (old id / term / question). */
  via: "id" | "card-alias" | "lookup";
}

export interface PageOptions {
  maxBytes?: number;
  /** `## ` heading text or its slug (`identity`, `outgoing-relationships`). */
  section?: string;
  /** A field of the card's index record (`properties`, `executorOps`, `relClass`, ...). */
  field?: string;
}

export interface Page {
  id?: string;
  path: string;
  bytes: number;
  truncated: boolean;
  text: string;
  kind?: string;
  cardDigest?: string;
  /** Present for lookup rows (old ids, terms, questions): the record itself, so callers see the disposition. */
  record?: CardRecord;
  section?: string;
  field?: { name: string; value: unknown };
}

const DEFAULT_MAX_BYTES = 24_000;
const HARD_MAX_BYTES = 512_000;

export function openWorkspace(dir: string = process.env.BKS_WORKSPACE_DIR ?? defaultWorkspaceDir, options: { expectRelease?: string; expectFingerprint?: string } = {}): Workspace {
  const root = resolve(dir);
  const manifestPath = join(root, "manifest.json");
  if (!existsSync(manifestPath)) throw new WorkspaceError("WORKSPACE_MISSING", `no workspace at ${root} (run: pnpm workspace:build)`, { dir: root });
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    throw new WorkspaceError("WORKSPACE_CORRUPT", `manifest.json does not parse: ${(error as Error).message}`, { dir: root });
  }
  const format = (raw as { format?: unknown })?.format;
  if (format !== WORKSPACE_FORMAT_V2) throw new WorkspaceError("WORKSPACE_UNSUPPORTED", `unsupported workspace format ${String(format)} (this tool reads ${WORKSPACE_FORMAT_V2}; rebuild with pnpm workspace:build)`, { dir: root, format });
  const parsed = WorkspaceManifestV2.safeParse(raw);
  if (!parsed.success) throw new WorkspaceError("WORKSPACE_CORRUPT", `manifest.json is not a valid ${WORKSPACE_FORMAT_V2} manifest: ${parsed.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`, { dir: root });
  const manifest = parsed.data;
  if (options.expectRelease && options.expectRelease !== manifest.release.schemaReleaseDigest) {
    throw new WorkspaceError("RELEASE_MISMATCH", `workspace is bound to schemaReleaseDigest ${manifest.release.schemaReleaseDigest}, not the expected ${options.expectRelease}`, { expected: options.expectRelease, actual: manifest.release.schemaReleaseDigest, releaseId: manifest.release.releaseId });
  }
  if (options.expectFingerprint && options.expectFingerprint !== manifest.workspaceFingerprint) {
    throw new WorkspaceError("RELEASE_MISMATCH", `workspace fingerprint ${manifest.workspaceFingerprint} is not the expected ${options.expectFingerprint}`, { expected: options.expectFingerprint, actual: manifest.workspaceFingerprint });
  }
  let index: CardRecord[];
  try {
    const lines = readFileSync(join(root, "search", "index.jsonl"), "utf8").split("\n").filter(Boolean);
    index = lines.map((l) => CardRecord.parse(JSON.parse(l)));
  } catch (error) {
    throw new WorkspaceError("WORKSPACE_CORRUPT", `search/index.jsonl failed to load: ${(error as Error).message}`, { dir: root });
  }
  const byId = new Map(index.map((r) => [r.id, r]));
  const byAlias = new Map<string, CardRecord>();
  for (const r of index) if (!LOOKUP_KINDS.includes(r.kind)) for (const a of r.aliases) if (a.includes(":") && !byAlias.has(a.toLowerCase())) byAlias.set(a.toLowerCase(), r);
  let irCache: SchemaIR | null = null;
  let adjCache: Adjacency | null = null;
  let catCache: QueryCatalog | null = null;
  const ws: Workspace = {
    dir: root,
    manifest,
    index,
    ir: () => (irCache ??= JSON.parse(readFileSync(join(root, "schema-ir.json"), "utf8")) as SchemaIR),
    adjacency: () => (adjCache ??= JSON.parse(readFileSync(join(root, "search", "adjacency.json"), "utf8")) as Adjacency),
    catalog: () => (catCache ??= JSON.parse(readFileSync(join(root, "patterns", "catalog.json"), "utf8")) as QueryCatalog),
    prepared: () => preparedIndexOf(index),
    record: (id) => byId.get(id),
    resolve: (input) => {
      const exact = byId.get(input);
      if (exact) return { record: exact, via: LOOKUP_KINDS.includes(exact.kind) ? "lookup" : "id" };
      const alias = byAlias.get(input.toLowerCase());
      if (alias) return { record: alias, via: "card-alias" };
      const ci = index.find((r) => r.id.toLowerCase() === input.toLowerCase());
      return ci ? { record: ci, via: LOOKUP_KINDS.includes(ci.kind) ? "lookup" : "id" } : undefined;
    },
    cardDigest: (id) => byId.get(id)?.cardDigest,
    search: (query, limit = 10) => lexicalSearch(preparedIndexOf(index), query, { limit }),
    page: (idOrPath, opts = {}) => readPage(ws, idOrPath, opts),
  };
  return ws;
}

/** `node:Product` -> nodes/Product.md and the other id conventions (used for ids without an index row). */
export function conventionalPath(id: string): string | undefined {
  const i = id.indexOf(":");
  if (i < 0) return undefined;
  const kind = id.slice(0, i);
  const name = id.slice(i + 1);
  const dirs: Record<string, string> = { node: "nodes", rel: "relationships", edge: "edge-properties", enum: "vocabularies", union: "unions", iface: "interfaces", dom: "domains", frag: "modules", mod: "modules", task: "tasks", pred: "predicates", asmt: "assessments", rule: "rules", migration: "migrations" };
  if (kind === "sdl") return `sdl/${name}.graphql`;
  if (kind === "vocab") return `vocabularies/release/${name}.md`;
  if (kind === "qset") return `patterns/questions/${name}.md`;
  return dirs[kind] ? `${dirs[kind]}/${name}.md` : undefined;
}

function safeJoin(root: string, rel: string): string {
  const target = resolve(join(root, normalize(rel)));
  if (target !== root && !target.startsWith(`${root}${sep}`)) throw new WorkspaceError("PAGE_PATH_INVALID", "path escapes the workspace", { relative: rel });
  return target;
}

function readPage(ws: Workspace, idOrPath: string, options: PageOptions): Page {
  const maxBytes = Math.min(options.maxBytes ?? DEFAULT_MAX_BYTES, HARD_MAX_BYTES);
  const resolved = ws.resolve(idOrPath);
  const rec = resolved?.record;
  if (rec && LOOKUP_KINDS.includes(rec.kind)) {
    if (options.field) return fieldPage(rec, options.field);
    const text = lookupText(ws, rec);
    return { id: rec.id, kind: rec.kind, path: rec.path, bytes: Buffer.byteLength(text), truncated: false, text, record: rec };
  }
  if (rec && options.field) return fieldPage(rec, options.field);
  const rel = rec?.path ?? conventionalPath(idOrPath) ?? idOrPath;
  const target = safeJoin(ws.dir, rel);
  if (!existsSync(target) || !statSync(target).isFile()) {
    const suggestions = ws.search(idOrPath.replace(/^[a-z]+:/, ""), 5).map((h) => h.id);
    throw new WorkspaceError("PAGE_NOT_FOUND", `no page for ${idOrPath}`, { relative: rel, suggestions, hint: "search first; ids look like node:<Type>, rel:<TYPE>, pred:<NAME>, mod:<K|D1..D13>, dom:<slug>, task:<slug>, enum:<Enum>, pattern:<template>" });
  }
  let text = readFileSync(target, "utf8");
  let section: string | undefined;
  if (options.section) {
    const card = parseCard(text);
    const body = card ? card.body : text;
    const wanted = sectionSlug(options.section);
    const hit = sectionsOf(body).find((s) => s.heading && (sectionSlug(s.heading) === wanted || sectionSlug(s.heading).startsWith(wanted)));
    if (!hit) throw new WorkspaceError("SECTION_NOT_FOUND", `no section "${options.section}" in ${rel}`, { sections: sectionsOf(body).map((s) => s.heading).filter(Boolean) });
    text = hit.text;
    section = hit.heading;
  }
  const bytes = Buffer.byteLength(text);
  const truncated = bytes > maxBytes;
  if (truncated) text = Buffer.from(text).subarray(0, maxBytes).toString("utf8");
  return { ...(rec ? { id: rec.id, kind: rec.kind, ...(rec.cardDigest ? { cardDigest: rec.cardDigest } : {}) } : {}), path: rel.replaceAll("\\", "/"), bytes, truncated, text, ...(section ? { section } : {}) };
}

function fieldPage(rec: CardRecord, field: string): Page {
  if (!(field in rec)) throw new WorkspaceError("SECTION_NOT_FOUND", `record ${rec.id} has no field ${field}`, { fields: Object.keys(rec) });
  const value = (rec as Record<string, unknown>)[field];
  const text = `${JSON.stringify(value, null, 2)}\n`;
  return { id: rec.id, kind: rec.kind, path: rec.path, bytes: Buffer.byteLength(text), truncated: false, text, field: { name: field, value }, ...(rec.cardDigest ? { cardDigest: rec.cardDigest } : {}) };
}

function lookupText(ws: Workspace, rec: CardRecord): string {
  const line = (id: string) => {
    const r = ws.record(id);
    return r ? `- \`${id}\` → ${r.path}${r.summary ? ` — ${r.summary}` : ""}` : `- \`${id}\` (no live card)`;
  };
  if (rec.kind === "operational") {
    return `# ${rec.id} (operational name, not domain ontology)

${rec.summary}

Operational names have no node or relationship card, no ordinary agent write capability and are excluded from the consumer projection, typed reads and catalog templates. Register: ${rec.path}
`;
  }
  if (rec.kind === "alias" && rec.id.startsWith("legacy:")) {
    return `# ${rec.id} (live legacy graph element)

${rec.summary}

${rec.targets?.length ? `## v2 targets\n\n${rec.targets.map(line).join("\n")}\n` : "## v2 targets\n\n(none: retained or quarantined as legacy; no v2 fact)\n"}
Legacy data is preserved (relabeled LegacyV0_<Label>), never deleted. Disposition table: ${rec.path}
`;
  }
  if (rec.kind === "alias") {
    return `# ${rec.id} (v1 id, ${rec.migrationKind})

This is not a live v2 element of release ${ws.manifest.release.releaseId}. ${rec.summary}

${rec.targets?.length ? `## v2 targets\n\n${rec.targets.map(line).join("\n")}\n` : "## v2 targets\n\n(none: removed; no substitute type)\n"}${rec.seeAlso?.length ? `\n## See also (related, not substitutes)\n\n${rec.seeAlso.map(line).join("\n")}\n` : ""}
Disposition table: ${rec.path}
`;
  }
  if (rec.kind === "term") return `# Term: ${rec.name}\n\n${rec.summary}\n\n${(rec.targets ?? []).map(line).join("\n")}\n`;
  return `# Question ${rec.name}\n\n${rec.summary}\n\nTemplates:\n${(rec.targets ?? []).map(line).join("\n") || "(none: held or unsupported)"}\n\nQuestion set: ${rec.path} · \`bks-schema pattern --question ${rec.name} --json\`\n`;
}

/** Back-compat helper: read one page by id or path from a workspace directory and its index. */
export function getPage(root: string, _index: readonly CardRecord[], idOrPath: string, options: PageOptions = {}): Page {
  return openWorkspace(root).page(idOrPath, options);
}

// =============================================================================================================
// Search entry point (lexical / semantic / hybrid)
// =============================================================================================================

export type SearchMode = "lexical" | "semantic" | "hybrid";

export interface SearchOptions extends SearchFilters {
  query: string;
  mode?: SearchMode;
  limit?: number;
  retriever?: SemanticRetriever;
  deadlineMs?: number;
  /** `paths`: structured discovery (search, then bounded schema-path expansion to 10 candidates). */
  expand?: "paths";
  /** Search cards kept before path expansion (default 5, the node-detection window; maximum 10). */
  baseLimit?: number;
}

export interface SearchResponse {
  query: string;
  requestedMode: SearchMode;
  mode: SearchMode | "lexical-only";
  status: "ok" | "degraded" | "unavailable";
  degradation?: { reason: string; fallback: "lexical-only" | "none"; semantic: SemanticStatus };
  retrievers: { lexical: "bks-lexical.v1"; semantic: { id: string; state: SemanticStatus["state"]; generationId: string | null } };
  release: { releaseId: string; schemaReleaseDigest: string; workspaceFingerprint: string };
  filters: SearchFilters;
  limit: number;
  hits: SearchHit[];
  rejectedHostedHits?: number;
  /** Structured discovery (`expand: "paths"`): which candidates came from search vs path expansion. */
  route?: RouteEntry[];
  /** The exact CLI calls an agent would make to reproduce the result. */
  calls?: string[];
  expansion?: { kind: "paths"; pathIntent: "none" | "named-types" | "wording" | "named-types+wording"; baseLimit: number; baseLimitRule: "no-expansion" | "explicit" | "adaptive" | "fallback"; shortestPathLength: number | null; endpointSource: "query" | "search"; nodesConsidered: string[]; pathRuns: Array<{ from: string; to: string; paths: number; truncated: boolean }>; instanceClaim: false };
  note: string;
}

export const SEARCH_NOTE = "Scores rank candidates; they are not schema validity. Rehydrate every hit from its local card.";

/** Search entry point: base search, or structured discovery with `expand: "paths"`. */
export async function searchWorkspace(ws: Workspace, options: SearchOptions): Promise<SearchResponse> {
  return options.expand === "paths" ? structuredSearch(ws, options) : baseSearch(ws, options);
}

async function baseSearch(ws: Workspace, options: SearchOptions): Promise<SearchResponse> {
  const query = options.query ?? "";
  const max = ws.manifest.limits.search;
  if (query.length > max.maxQueryChars) throw new WorkspaceError("LIMIT_EXCEEDED", `query longer than ${max.maxQueryChars} characters`, { length: query.length });
  const limit = options.limit ?? max.defaultLimit;
  if (limit < 1 || limit > max.maxLimit) throw new WorkspaceError("LIMIT_EXCEEDED", `--limit must be 1..${max.maxLimit}`, { limit });
  const requestedMode = options.mode ?? "lexical";
  const filters: SearchFilters = { ...(options.kind ? { kind: options.kind } : {}), ...(options.module ? { module: options.module } : {}), ...(options.domain ? { domain: options.domain } : {}) };
  const retriever = options.retriever ?? notConfiguredRetriever;
  const base = {
    query,
    requestedMode,
    release: { releaseId: ws.manifest.release.releaseId, schemaReleaseDigest: ws.manifest.release.schemaReleaseDigest, workspaceFingerprint: ws.manifest.workspaceFingerprint },
    filters,
    limit,
    note: SEARCH_NOTE,
  };
  const lexical = () => lexicalSearch(ws.prepared(), query, { ...filters, limit });
  if (requestedMode === "lexical") {
    const st = await retriever.status();
    return { ...base, mode: "lexical", status: "ok", retrievers: { lexical: "bks-lexical.v1", semantic: { id: retriever.id, state: st.state, generationId: st.generationId } }, hits: lexical() };
  }
  let semantic: Awaited<ReturnType<SemanticRetriever["search"]>>;
  try {
    semantic = await withDeadline(
      retriever.search({ query, limit: 20, filters: { ...(filters.kind ? { kind: arr(filters.kind) } : {}), ...(filters.module ? { module: arr(filters.module) } : {}) }, release: { schemaReleaseDigest: base.release.schemaReleaseDigest, workspaceFingerprint: base.release.workspaceFingerprint }, deadlineMs: options.deadlineMs ?? 5000 }),
      options.deadlineMs ?? 5000,
    );
  } catch (error) {
    semantic = { status: { state: "unavailable", generationId: null, reason: `semantic retriever failed: ${(error as Error).message}` }, hits: [] };
  }
  const st = semantic.status;
  const retrievers = { lexical: "bks-lexical.v1" as const, semantic: { id: retriever.id, state: st.state, generationId: st.generationId } };
  if (st.state !== "available") {
    const reason = st.reason ?? `semantic retriever ${st.state}`;
    if (requestedMode === "semantic") return { ...base, mode: "semantic", status: "unavailable", degradation: { reason, fallback: "none", semantic: st }, retrievers, hits: [] };
    return { ...base, mode: "lexical-only", status: "degraded", degradation: { reason, fallback: "lexical-only", semantic: st }, retrievers, hits: lexical() };
  }
  const { accepted, rejected } = validateHostedHits({ cardDigest: (id) => ws.cardDigest(id), schemaReleaseDigest: base.release.schemaReleaseDigest, workspaceFingerprint: base.release.workspaceFingerprint }, semantic.hits);
  const rehydrate = (id: string, score: number, matchedOn: string): SearchHit | undefined => {
    const r = ws.record(id);
    return r ? { id: r.id, kind: r.kind, name: r.name, path: r.path, ...(r.module ? { module: r.module } : {}), ...(r.domain ? { domain: r.domain } : {}), summary: r.summary.slice(0, 200), score, matchedOn, ...(r.cardDigest ? { cardDigest: r.cardDigest } : {}) } : undefined;
  };
  const semanticIds = [...new Set(accepted.map((h) => h.cardId))];
  if (requestedMode === "semantic") {
    const hits = semanticIds.map((id, i) => rehydrate(id, Math.round((1 / (60 + i + 1)) * 1e6) / 1e6, "semantic")).filter((h): h is SearchHit => Boolean(h)).slice(0, limit);
    return { ...base, mode: "semantic", status: "ok", retrievers, hits, rejectedHostedHits: rejected.length + (semantic.rejected ?? 0) };
  }
  const lex = lexicalSearch(ws.prepared(), query, { ...filters, limit: 20 });
  const exact = lex.filter((h) => h.score >= 900);
  const fused = reciprocalRankFusion([lex.map((h) => h.id), semanticIds]);
  const seen = new Set(exact.map((h) => h.id));
  const hits = [...exact];
  for (const f of fused) {
    if (seen.has(f.id)) continue;
    const lh = lex.find((h) => h.id === f.id);
    const h = lh ? { ...lh, score: Math.round(f.score * 1e6) / 1e6, matchedOn: `rrf(${lh.matchedOn}${semanticIds.includes(f.id) ? "+semantic" : ""})` } : rehydrate(f.id, Math.round(f.score * 1e6) / 1e6, "rrf(semantic)");
    if (h) {
      hits.push(h);
      seen.add(f.id);
    }
  }
  return { ...base, mode: "hybrid", status: "ok", retrievers, hits: hits.slice(0, limit), rejectedHostedHits: rejected.length + (semantic.rejected ?? 0) };
}

function arr(x: string | string[]): string[] {
  return Array.isArray(x) ? x : [x];
}

async function withDeadline<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([p, new Promise<T>((_, reject) => (timer = setTimeout(() => reject(new Error(`deadline ${ms} ms exceeded`)), ms)))]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export { compareHits };

// =============================================================================================================
// On-disk integrity (SPECIFICATION 3.3)
// =============================================================================================================

export interface IntegrityReport {
  ok: boolean;
  dir: string;
  manifestValid: boolean;
  format?: string;
  files: { expected: number; onDisk: number };
  missing: string[];
  altered: string[];
  unexpected: string[];
  fingerprint: { manifest?: string; recomputed?: string; matches: boolean };
  problems: string[];
}

export function listFiles(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir).sort()) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...listFiles(p, base));
    else out.push(relative(base, p).split(sep).join("/"));
  }
  return out;
}

/** Hashes every file on disk against the manifest inventory: missing, altered and unexpected files are reported. */
export function verifyWorkspaceFiles(dir: string = defaultWorkspaceDir): IntegrityReport {
  const root = resolve(dir);
  const report: IntegrityReport = { ok: false, dir: root, manifestValid: false, files: { expected: 0, onDisk: 0 }, missing: [], altered: [], unexpected: [], fingerprint: { matches: false }, problems: [] };
  if (!existsSync(join(root, "manifest.json"))) {
    report.problems.push("manifest.json missing");
    return report;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
  } catch (error) {
    report.problems.push(`manifest.json does not parse: ${(error as Error).message}`);
    return report;
  }
  report.format = String((raw as { format?: unknown }).format);
  const parsed = WorkspaceManifestV2.safeParse(raw);
  if (!parsed.success) {
    report.problems.push(`manifest.json is not ${WORKSPACE_FORMAT_V2}: ${parsed.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    return report;
  }
  report.manifestValid = true;
  const inventory = parsed.data.inventory;
  const onDisk = new Set(listFiles(root).filter((p) => p !== "manifest.json"));
  report.files = { expected: Object.keys(inventory).length, onDisk: onDisk.size };
  for (const p of [...onDisk].sort()) if (!(p in inventory)) report.unexpected.push(p);
  for (const [p, e] of Object.entries(inventory).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (!onDisk.has(p)) {
      report.missing.push(p);
      continue;
    }
    const bytes = readFileSync(join(root, ...p.split("/")));
    if (bytes.length !== e.bytes || `sha256:${createHash("sha256").update(bytes).digest("hex")}` !== e.sha256) report.altered.push(p);
  }
  const recomputed = fingerprintOf(inventory);
  report.fingerprint = { manifest: parsed.data.workspaceFingerprint, recomputed, matches: recomputed === parsed.data.workspaceFingerprint };
  if (!report.fingerprint.matches) report.problems.push("manifest workspaceFingerprint does not match its inventory");
  report.ok = report.missing.length === 0 && report.altered.length === 0 && report.unexpected.length === 0 && report.fingerprint.matches;
  return report;
}

export function sortHits(hits: SearchHit[]): SearchHit[] {
  return [...hits].sort(compareHits);
}

// =============================================================================================================
// Structured discovery: search, then bounded schema-path expansion (`search --expand paths`)
// =============================================================================================================

export const STRUCTURED_EXPANSION = { candidates: 10, defaultBaseLimit: 5, minBaseLimit: 4, maxBaseLimit: 7, nodeWindow: 5, maxEndpoints: 3, maxHops: 3, pathLimit: 2, joins: "fill" } as const;

/** Explicit path wording: "between", "path(s)", "trace/traced/tracing", or "from ... to". A lone "to" is not enough. */
export const PATH_WORDING = /\bbetween\b|\bpaths?\b|\btrac(?:e|es|ed|ing)\b|\bfrom\b[\s\S]*\bto\b/i;

export interface RouteEntry {
  id: string;
  rank: number;
  source: "search" | "path" | "reference";
  /** path: the `bks-schema path` call that produced the card; reference: the relationship card that references it. */
  via?: string;
}

interface Endpoint {
  name: string;
  /** 1-based rank among the endpoints (query order when taken from the query text, hit rank otherwise). */
  rank: number;
}

/** Node types named in the query text itself: exact type names (code-like) or registered aliases, in query order. */
export function queryNodeTypes(ws: Workspace, query: string): string[] {
  const q = ` ${query.toLowerCase().replace(/[^a-z0-9+]+/g, " ")} `;
  const found: Array<{ name: string; at: number }> = [];
  for (const r of ws.index) {
    if (r.kind !== "node") continue;
    const exact = new RegExp(`(^|[^A-Za-z0-9_])${r.name}([^A-Za-z0-9_]|$)`).exec(query);
    let at = exact ? exact.index : -1;
    if (at < 0)
      for (const a of r.aliases) {
        const norm = a.toLowerCase().replace(/[^a-z0-9+]+/g, " ").trim();
        if (norm.length < 4 || (!norm.includes(" ") && !/[A-Z]/.test(a) && norm !== r.name.toLowerCase())) continue;
        const i = q.indexOf(` ${norm} `);
        if (i >= 0 && (at < 0 || i < at)) at = i;
      }
    if (at >= 0) found.push({ name: r.name, at });
  }
  return found.sort((a, b) => a.at - b.at || (a.name < b.name ? -1 : 1)).map((f) => f.name).filter((n, i, all) => all.indexOf(n) === i);
}

/** Shortest legal schema path length between two node types (BFS over the topology, any step kind); null when none within maxHops. */
export function shortestPathLength(adj: Adjacency, from: string, to: string, maxHops: number): number | null {
  if (!adj.nodes[from] || !adj.nodes[to]) return null;
  if (from === to) return 0;
  const steps = stepIndex(adj);
  let frontier = [from];
  const seen = new Set([from]);
  for (let d = 1; d <= maxHops && frontier.length; d++) {
    const next: string[] = [];
    for (const at of frontier)
      for (const s of steps.get(at) ?? []) {
        if (s.other === to) return d;
        if (!seen.has(s.other)) {
          seen.add(s.other);
          next.push(s.other);
        }
      }
    frontier = next;
  }
  return null;
}

/** Adaptive base limit: 10 − pathLimit × shortest path length, clamped to [4, 7]; 5 when no path is known. */
export function adaptiveBaseLimit(shortest: number | null): number {
  const x = STRUCTURED_EXPANSION;
  return shortest === null ? x.defaultBaseLimit : Math.min(x.maxBaseLimit, Math.max(x.minBaseLimit, x.candidates - x.pathLimit * shortest));
}

/**
 * Structured discovery (deterministic, budget-capped; never task-aware):
 *   1. base search (lexical, or hybrid for structured-hybrid) with limit 10; candidates are cards (lookup rows are
 *      dropped after their targets are expanded).
 *   2. path intent: two or more node types named in the query text (exact names or registered aliases), or explicit
 *      path wording (`PATH_WORDING`). Without path intent the plain top 10 search cards are returned.
 *   3. endpoints: the query-named node types (query order) when there are two or more; otherwise the distinct node types
 *      among the top 5 search cards (rank order). At most 3.
 *   4. adaptive base limit: 10 − pathLimit (2) × shortest legal path length among the endpoint pairs, clamped to
 *      [4, 7]; 5 when no path is known. An explicit `baseLimit` overrides it.
 *   5. `path a b --max-hops 3 --limit 2 --joins fill` for every endpoint pair (1-2, 1-3, 2-3); paths ranked
 *      direction-first (see path.ts).
 *   6. fill order: the relationship (and predicate-join) cards of all returned paths, then the node cards on them,
 *      each ordered by (against-direction hops, length, category, endpoint ranks, path, position); then, while slots
 *      remain, the predicate / assessment cards those relationship cards reference.
 *   7. cap 10 candidates; `route` (search / path / reference), the exact CLI calls, and `expansion` details.
 * Paths are schema possibilities, never instance claims.
 */
async function structuredSearch(ws: Workspace, options: SearchOptions): Promise<SearchResponse> {
  const cap = STRUCTURED_EXPANSION.candidates;
  const { expand: _e, baseLimit: explicitBase, ...rest } = options;
  const base = await baseSearch(ws, { ...rest, limit: 10 });
  const cards = base.hits.filter((h) => !LOOKUP_KINDS.includes(h.kind)).filter((h, i, a) => a.findIndex((x) => x.id === h.id) === i);
  const quote = (s: string) => `"${s.replace(/(["\\$`])/g, "\\$1")}"`;
  const modeFlag = base.requestedMode === "lexical" ? "" : ` --mode ${base.requestedMode}`;
  const calls = [`bks-schema search ${quote(options.query)}${modeFlag} --limit 10 --json`];
  const named = queryNodeTypes(ws, options.query);
  const wording = PATH_WORDING.test(options.query);
  const pathIntent = named.length >= 2 || wording;
  const fromQuery = named.length >= 2;
  const endpointNames = pathIntent ? (fromQuery ? named : [...new Set(cards.slice(0, STRUCTURED_EXPANSION.nodeWindow).filter((h) => h.kind === "node").map((h) => h.name))]).slice(0, STRUCTURED_EXPANSION.maxEndpoints) : [];
  const endpoints: Endpoint[] = endpointNames.map((name, i) => ({ name, rank: i + 1 }));
  const pairs: Array<[Endpoint, Endpoint]> = [];
  for (let i = 0; i < endpoints.length; i++) for (let j = i + 1; j < endpoints.length; j++) pairs.push([endpoints[i]!, endpoints[j]!]);
  const adj = pairs.length ? ws.adjacency() : null;
  const shortest = adj ? pairs.map(([a, b]) => shortestPathLength(adj, a.name, b.name, STRUCTURED_EXPANSION.maxHops)).filter((x): x is number => x !== null).reduce<number | null>((m, x) => (m === null || x < m ? x : m), null) : null;
  const adaptive = adaptiveBaseLimit(shortest);
  const baseLimit = !pairs.length ? cap : Math.min(Math.max(explicitBase ?? adaptive, 1), cap);
  const hits: SearchHit[] = cards.slice(0, baseLimit);
  const route: RouteEntry[] = hits.map((h, i) => ({ id: h.id, rank: i + 1, source: "search" }));
  const pathRuns: Array<{ from: string; to: string; paths: number; truncated: boolean }> = [];
  const card = (id: string): SearchHit | undefined => {
    const r = ws.record(id);
    return r ? { id: r.id, kind: r.kind, name: r.name, path: r.path, ...(r.module ? { module: r.module } : {}), ...(r.domain ? { domain: r.domain } : {}), summary: r.summary.length > 200 ? `${r.summary.slice(0, 199)}…` : r.summary, score: 0, matchedOn: "", ...(r.cardDigest ? { cardDigest: r.cardDigest } : {}) } : undefined;
  };
  if (adj && pairs.length) {
    const CAT = { typed: 0, "interface-join": 1, "predicate-join": 2 } as const;
    const items: Array<{ id: string; isEdge: boolean; against: number; length: number; cat: number; ra: number; rb: number; path: number; pos: number; via: string }> = [];
    const relsOnPaths: string[] = [];
    for (const [a, b] of pairs) {
      const call = `bks-schema path node:${a.name} node:${b.name} --max-hops ${STRUCTURED_EXPANSION.maxHops} --limit ${STRUCTURED_EXPANSION.pathLimit} --joins ${STRUCTURED_EXPANSION.joins} --json`;
      calls.push(call);
      let result: PathsResult;
      try {
        result = findPaths(adj, a.name, b.name, { maxHops: STRUCTURED_EXPANSION.maxHops, limit: STRUCTURED_EXPANSION.pathLimit, joins: STRUCTURED_EXPANSION.joins });
      } catch {
        pathRuns.push({ from: a.name, to: b.name, paths: 0, truncated: false });
        continue;
      }
      pathRuns.push({ from: a.name, to: b.name, paths: result.paths.length, truncated: result.truncated });
      result.paths.forEach((p, pi) => {
        const key = { against: p.againstDirection, length: p.length, cat: CAT[p.category], ra: a.rank, rb: b.rank, path: pi, via: call };
        let pos = 0;
        items.push({ id: `node:${p.nodes[0]}`, isEdge: false, ...key, pos: pos++ });
        p.hops.forEach((h, i) => {
          const id = h.kind === "predicate-join" ? `pred:${h.type}` : `rel:${h.type}`;
          items.push({ id, isEdge: true, ...key, pos: pos++ });
          if (h.kind === "typed" && !relsOnPaths.includes(id)) relsOnPaths.push(id);
          items.push({ id: `node:${p.nodes[i + 1]}`, isEdge: false, ...key, pos: pos++ });
        });
      });
    }
    const order = (x: (typeof items)[number], y: (typeof items)[number]) => x.against - y.against || x.length - y.length || x.cat - y.cat || x.ra - y.ra || x.rb - y.rb || x.path - y.path || x.pos - y.pos;
    const ordered = [...items.filter((i) => i.isEdge).sort(order), ...items.filter((i) => !i.isEdge).sort(order)];
    for (const it of ordered) {
      if (hits.length >= cap) break;
      if (hits.some((h) => h.id === it.id)) continue;
      const h = card(it.id);
      if (!h) continue;
      hits.push({ ...h, matchedOn: "path" });
      route.push({ id: h.id, rank: hits.length, source: "path", via: it.via });
    }
    for (const relId of relsOnPaths) {
      if (hits.length >= cap) break;
      for (const ref of referencedCards(ws, relId)) {
        if (hits.length >= cap) break;
        if (hits.some((h) => h.id === ref)) continue;
        const h = card(ref);
        if (!h) continue;
        hits.push({ ...h, matchedOn: "reference" });
        route.push({ id: h.id, rank: hits.length, source: "reference", via: relId });
      }
    }
  }
  return {
    ...base,
    limit: cap,
    hits: hits.slice(0, cap),
    route: route.slice(0, cap),
    calls,
    expansion: { kind: "paths", pathIntent: pathIntent ? (fromQuery ? (wording ? "named-types+wording" : "named-types") : "wording") : "none", baseLimit, baseLimitRule: !pairs.length ? "no-expansion" : explicitBase !== undefined ? "explicit" : shortest === null ? "fallback" : "adaptive", shortestPathLength: shortest, endpointSource: fromQuery ? "query" : "search", nodesConsidered: endpointNames, pathRuns, instanceClaim: false },
  };
}

/** Predicate and assessment cards a relationship card references: its same-name predicate, then linked cards. */
function referencedCards(ws: Workspace, relId: string): string[] {
  const out: string[] = [];
  const type = relId.slice(4);
  const sameName = ws.index.find((r) => r.kind === "predicate" && (r.typedEdge === type || r.name === type));
  if (sameName) out.push(sameName.id);
  let text = "";
  try {
    text = ws.page(relId, { maxBytes: 512_000 }).text;
  } catch {
    return out;
  }
  for (const m of text.matchAll(/\]\(\.\.\/(predicates|assessments)\/([^)]+)\.md\)/g)) {
    const id = `${m[1] === "predicates" ? "pred" : "asmt"}:${m[2]}`;
    if (!out.includes(id)) out.push(id);
  }
  return out;
}
