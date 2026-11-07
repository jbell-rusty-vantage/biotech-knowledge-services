/**
 * `bks-schema slice`: a digest-bound, budgeted schema context (bks-schema-slice.v2).
 *
 * Selection: node / relationship types, domains, modules (v1 `fragments`; old W## ids resolve through aliases),
 * tasks, catalog questions (their templates' labels and relationship types) and predicates. Closure: endpoints to
 * `endpointDepth` (interface-declared kernel endpoints are recorded as omissions, never expanded into every
 * Subjectable), then edge-property types, enums, unions and interfaces of the selected elements.
 *
 * Budget: pages are added in priority order while they fit `maxTokens` (estimate ceil(chars/4)); every omitted page is
 * listed with its reason. Mandatory rules (identity + evidence path always; ingestion + temporal for a write slice)
 * are kept even beyond the budget and the overrun is reported; they are scoped to the selected types (rows for other
 * types are dropped and the omission recorded), never silently removed.
 *
 * Compileability: the combined SDL is referentially checked; a slice whose SDL references types outside it is a
 * bounded agent context and is never labeled compileable.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { digestOf, type SliceRequest } from "@bks/contracts";
import { parseCard } from "./card.js";
import { schemaContext } from "./context.js";
import type { NodeType, SchemaIR } from "./ir.js";
import { SLICE_FORMAT_V2, SliceRequestV2, type SchemaContext } from "./schema-contracts.js";
import type { Sidecars } from "./sidecars.js";
import { TOKEN_ESTIMATOR } from "./render.js";
import type { Workspace } from "./workspace.js";

export interface SliceTrace {
  element: string;
  reason: "selected" | "domain" | "fragment" | "module" | "task" | "question" | "predicate" | "endpoint" | "edge-properties" | "enum" | "union" | "interface";
  introducedBy: string;
}

export interface SliceOmission {
  element: string;
  reason: string;
}

export interface SlicePage {
  path: string;
  cardId?: string;
  cardDigest?: string;
  priority: number;
  tokens: number;
  mandatory: boolean;
  scoped?: boolean;
}

export interface SliceBundle {
  format: typeof SLICE_FORMAT_V2;
  sliceId: string;
  request: SliceRequestV2;
  purpose: "read" | "write";
  schemaDigest: string;
  schemaReleaseDigest: string;
  workspaceFingerprint: string;
  nodeTypes: string[];
  relationshipTypes: string[];
  edgePropertyTypes: string[];
  enums: string[];
  unions: string[];
  interfaces: string[];
  predicates: string[];
  patterns: string[];
  trace: SliceTrace[];
  included: SlicePage[];
  omissions: SliceOmission[];
  budget: { maxTokens: number; estimatedTokens: number; exceeded: boolean; overrunReason?: string; estimator: string };
  closure: { complete: boolean; missingTypes: string[]; compileable: boolean; note: string };
  /** Workspace pages copied into the bundle (path -> content). */
  pages: Map<string, string>;
  combinedSdl: string;
  context: SchemaContext;
}

const BUILTIN_SCALARS = new Set(["String", "Int", "Float", "Boolean", "ID"]);
export const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

/** Builds a budgeted slice. Accepts the v1 contracts SliceRequest or the v2 request (superset). */
export function buildSlice(workspace: Workspace, ir: SchemaIR, sidecars: Sidecars, requestInput: SliceRequest | Partial<SliceRequestV2>): SliceBundle {
  const request = SliceRequestV2.parse({ ...requestInput });
  const nodeByName = new Map(ir.nodes.map((n) => [n.name, n]));
  const trace: SliceTrace[] = [];
  const omissions: SliceOmission[] = [];
  const nodes = new Set<string>();
  const rels = new Set<string>();
  const preds = new Set<string>();
  const patterns = new Set<string>();
  const add = (set: Set<string>, element: string, reason: SliceTrace["reason"], introducedBy: string) => {
    if (set.has(element)) return;
    set.add(element);
    trace.push({ element, reason, introducedBy });
  };
  const fail = (msg: string): never => {
    throw new SliceError(msg);
  };

  for (const t of request.nodeTypes) (nodeByName.has(t) ? add(nodes, t, "selected", "request") : fail(`unknown node type ${t}`));
  for (const r of request.relationshipTypes) (ir.relationshipTypes.some((x) => x.type === r) ? add(rels, r, "selected", "request") : fail(`unknown relationship type ${r}`));
  for (const slug of request.domains) {
    const d = sidecars.domains.find((x) => x.slug === slug) ?? fail(`unknown domain ${slug}`);
    for (const n of ir.nodes.filter((x) => d.fragments.includes(x.module || x.fragment))) add(nodes, n.name, "domain", slug);
  }
  for (const id of [...request.fragments, ...request.modules]) {
    const moduleId = resolveModule(workspace, id) ?? fail(`unknown module ${id}`);
    for (const n of ir.nodes.filter((x) => (x.module || x.fragment) === moduleId)) add(nodes, n.name, id === moduleId ? "module" : "fragment", id);
  }
  for (const slug of request.tasks) {
    const t = sidecars.tasks.find((x) => x.slug === slug) ?? fail(`unknown task ${slug}`);
    for (const n of t.nodeTypes) add(nodes, n, "task", slug);
    for (const r of t.relationshipTypes) add(rels, r, "task", slug);
  }
  const catalog = workspace.catalog();
  for (const q of request.questions) {
    const question = catalog.questions.find((x) => x.id === q) ?? catalog.questions.find((x) => catalog.aliases.some((a) => a.alias === q && a.canonical.includes(x.id))) ?? fail(`unknown question ${q}`);
    for (const tid of question.templates) {
      add(patterns, tid, "question", q);
      const rec = workspace.record(`pattern:${tid}`);
      for (const l of rec?.labels ?? []) add(nodes, l, "question", q);
      const stmt = String(catalog.templates.find((t) => t.id === tid)?.statement ?? "");
      for (const m of stmt.matchAll(/:([A-Z][A-Z0-9_]+)\b/g)) if (ir.relationshipTypes.some((r) => r.type === m[1])) add(rels, m[1]!, "question", q);
    }
    if (!question.templates.length) omissions.push({ element: `question ${question.id}`, reason: `status ${question.status}: no release template (${String(question.reason ?? "")})` });
  }
  for (const p of request.predicates) {
    const e = ir.predicates.find((x) => x.name === p) ?? fail(`unknown predicate ${p}`);
    add(preds, p, "selected", "request");
    for (const t of [...e.subjectTypes, ...e.objectTypes]) if (nodeByName.has(t)) add(nodes, t, "predicate", p);
    if (ir.relationshipTypes.some((r) => r.type === p)) add(rels, p, "predicate", p);
  }
  // Relationship types pull their endpoints (interface endpoints are not expanded).
  for (const r of [...rels]) {
    const summary = ir.relationshipTypes.find((x) => x.type === r)!;
    for (const side of ["from", "to"] as const) {
      for (const declared of summary[side] ?? []) {
        if (nodeByName.has(declared)) add(nodes, declared, "endpoint", `rel:${r}`);
        else if (ir.unions.some((u) => u.name === declared)) for (const m of ir.unions.find((u) => u.name === declared)!.members) add(nodes, m, "endpoint", `rel:${r} (${declared})`);
        else omissions.push({ element: `${declared} implementers (${side} of ${r})`, reason: "interface endpoint: kernel traversal reaches every implementer; not expanded (bks-schema neighbors rel:" + r + " --expand)" });
      }
    }
  }
  // Endpoint closure to depth.
  let frontier = [...nodes];
  for (let depth = 0; depth < request.endpointDepth; depth++) {
    const next: string[] = [];
    for (const name of frontier) {
      const node = nodeByName.get(name);
      if (!node) continue;
      for (const rel of node.relationships) {
        if (rel.targetKind === "interface") {
          omissions.push({ element: `${name}.${rel.fieldName} -> ${rel.targetType}`, reason: `interface target (${rel.targetMembers.length} implementers) not expanded` });
          continue;
        }
        add(rels, rel.relationshipType, "endpoint", `node:${name}`);
        for (const m of rel.targetMembers) {
          if (!nodes.has(m)) next.push(m);
          add(nodes, m, "endpoint", `${name}.${rel.fieldName}`);
        }
      }
    }
    frontier = next;
  }
  for (const name of nodes) {
    const node = nodeByName.get(name);
    for (const rel of node?.relationships ?? []) if (rel.targetMembers.some((m) => nodes.has(m)) && rel.targetKind !== "interface") add(rels, rel.relationshipType, "endpoint", `node:${name}`);
  }
  // Required closure: edge properties, enums, unions, interfaces.
  const edgeProps = new Set<string>();
  const enums = new Set<string>();
  const unions = new Set<string>();
  const interfaces = new Set<string>();
  const selectedNodes = [...nodes].map((n) => nodeByName.get(n)).filter((n): n is NodeType => Boolean(n));
  for (const node of selectedNodes) {
    for (const p of node.properties) if (p.kind === "enum") add(enums, p.namedType, "enum", `${node.name}.${p.name}`);
    for (const i of node.interfaces) add(interfaces, i, "interface", node.name);
    for (const rel of node.relationships) {
      if (!rels.has(rel.relationshipType)) continue;
      if (rel.propertiesType) add(edgeProps, rel.propertiesType, "edge-properties", `${node.name}.${rel.fieldName}`);
      if (rel.targetKind === "union") add(unions, rel.targetType, "union", `${node.name}.${rel.fieldName}`);
      if (rel.targetKind === "interface") add(interfaces, rel.targetType, "interface", `${node.name}.${rel.fieldName}`);
    }
  }
  for (const ep of ir.edgePropertyTypes.filter((e) => edgeProps.has(e.name))) for (const p of ep.properties) if (p.kind === "enum") add(enums, p.namedType, "enum", `${ep.name}.${p.name}`);
  for (const i of ir.interfaces.filter((x) => interfaces.has(x.name))) for (const p of i.properties) if (p.kind === "enum") add(enums, p.namedType, "enum", `${i.name}.${p.name}`);

  const tasks = request.tasks.map((s) => sidecars.tasks.find((t) => t.slug === s)!);
  const purpose: "read" | "write" = request.purpose === "auto" ? (tasks.some((t) => t.proposalKinds.length) ? "write" : "read") : request.purpose;
  const sorted = (s: Set<string>) => [...s].sort();
  const selectedTypes = new Set([...nodes, ...rels]);

  // ---- pages by priority ------------------------------------------------------------------------------------
  interface Candidate { path: string; priority: number; mandatory: boolean; scope?: boolean }
  const candidates: Candidate[] = [];
  const seenPath = new Set<string>();
  const cand = (path: string, priority: number, mandatory = false, scope = false) => {
    if (seenPath.has(path)) return;
    seenPath.add(path);
    candidates.push({ path, priority, mandatory, scope });
  };
  cand("rules/identity-rules.md", 0, true, true);
  cand("rules/evidence-path.md", 0, true, true);
  if (purpose === "write") {
    cand("rules/ingestion-rules.md", 0, true);
    cand("rules/temporal-rules.md", 0, true, true);
  }
  for (const s of request.tasks) cand(`tasks/${s}.md`, 1);
  for (const s of request.domains) cand(`domains/${s}.md`, 1);
  const primary = new Set(trace.filter((t) => ["selected", "task", "domain", "module", "fragment", "question", "predicate"].includes(t.reason)).map((t) => t.element));
  // Primary elements in the order the request / task route names them (task routes list the decisive types first).
  for (const t of trace) {
    if (!primary.has(t.element)) continue;
    if (nodes.has(t.element) && nodeByName.has(t.element)) cand(`nodes/${t.element}.md`, 2);
    else if (rels.has(t.element)) cand(`relationships/${t.element}.md`, 2);
  }
  for (const p of sorted(preds)) cand(`predicates/${p}.md`, 3);
  for (const t of sorted(patterns)) {
    const rec = workspace.record(`pattern:${t}`);
    if (rec) cand(rec.path, 3);
  }
  for (const r of sorted(rels)) {
    const authorizing = ir.predicates.find((p) => p.name === r);
    if (authorizing && primary.has(r)) cand(`predicates/${r}.md`, 3);
  }
  for (const n of sorted(nodes)) cand(`nodes/${n}.md`, 4);
  for (const r of sorted(rels)) cand(`relationships/${r}.md`, 4);
  for (const e of sorted(edgeProps)) cand(`edge-properties/${e}.md`, 5);
  for (const u of sorted(unions)) cand(`unions/${u}.md`, 5);
  for (const i of sorted(interfaces)) cand(`interfaces/${i}.md`, 5);
  for (const e of sorted(enums)) cand(`vocabularies/${e}.md`, 6);
  // stable: insertion order inside a priority (request / task order first, then sorted closure)
  candidates.sort((a, b) => a.priority - b.priority || candidates.indexOf(a) - candidates.indexOf(b));

  const pages = new Map<string, string>();
  const included: SlicePage[] = [];
  let used = 0;
  let overrun = false;
  for (const c of candidates) {
    let text: string;
    try {
      text = workspace.page(c.path, { maxBytes: 512_000 }).text;
    } catch {
      omissions.push({ element: c.path, reason: "page absent in this workspace build" });
      continue;
    }
    let scoped = false;
    if (c.scope) {
      const s = scopeRulePage(text, selectedTypes);
      if (s.dropped) {
        omissions.push({ element: `${c.path} rows`, reason: `${s.dropped} per-type rows for types outside the slice dropped (rules for every selected type kept); full card ${c.path}` });
        text = s.text;
        scoped = true;
      }
    }
    let tokens = estimateTokens(text);
    if (!c.mandatory && used + tokens > request.maxTokens) {
      // Progressive disclosure: fall back to the card's head (title, description, first section) before omitting.
      const head = excerptOf(text);
      const headTokens = head ? estimateTokens(head) : Infinity;
      if (head && used + headTokens <= request.maxTokens) {
        omissions.push({ element: `${c.path} sections`, reason: `budget: full card needs ~${tokens} tokens; head excerpt (~${headTokens}) included, later sections omitted (bks-schema get ${c.path})` });
        text = head;
        tokens = headTokens;
        scoped = true;
      } else {
        omissions.push({ element: c.path, reason: `budget: needs ~${tokens} tokens, ${Math.max(0, request.maxTokens - used)} remaining of ${request.maxTokens}` });
        continue;
      }
    }
    if (c.mandatory && used + tokens > request.maxTokens) overrun = true;
    used += tokens;
    const card = parseCard(text);
    pages.set(c.path, text);
    included.push({ path: c.path, ...(card ? { cardId: card.frontMatter.id, cardDigest: card.frontMatter.cardDigest } : {}), priority: c.priority, tokens, mandatory: c.mandatory, ...(scoped ? { scoped } : {}) });
  }

  // ---- SDL and closure -----------------------------------------------------------------------------------------
  const defs = new Map<string, string>();
  for (const i of ir.interfaces.filter((x) => interfaces.has(x.name))) defs.set(i.name, i.sdl);
  for (const e of ir.enums.filter((x) => enums.has(x.name))) defs.set(e.name, e.sdl);
  for (const ep of ir.edgePropertyTypes.filter((x) => edgeProps.has(x.name))) defs.set(ep.name, ep.sdl);
  for (const u of ir.unions.filter((x) => unions.has(x.name))) defs.set(u.name, u.sdl);
  for (const n of selectedNodes.sort((a, b) => (a.name < b.name ? -1 : 1))) defs.set(n.name, n.sdl);
  const known = new Set([...defs.keys(), ...BUILTIN_SCALARS, ...ir.scalars]);
  const missing = new Set<string>();
  for (const sdl of defs.values()) for (const ref of referencedTypes(sdl)) if (!known.has(ref)) missing.add(ref);
  let combinedSdl = "";
  if (request.includeSdl) {
    const sdl = `${[...defs.values()].join("\n\n")}\n`;
    const tokens = estimateTokens(sdl);
    if (used + tokens > request.maxTokens) omissions.push({ element: "schema.graphql", reason: `budget: combined SDL needs ~${tokens} tokens, ${Math.max(0, request.maxTokens - used)} remaining; read sdl/<Name>.graphql per type` });
    else {
      combinedSdl = sdl;
      used += tokens;
    }
  }
  const complete = missing.size === 0;
  const closure = {
    complete,
    missingTypes: [...missing].sort(),
    compileable: complete && combinedSdl.length > 0,
    note: complete && combinedSdl ? "the combined SDL is referentially closed (every referenced type is defined in the slice)" : "bounded agent context, NOT a compileable SDL slice: referenced types outside the slice are listed in missingTypes",
  };

  const budget = { maxTokens: request.maxTokens, estimatedTokens: used, exceeded: used > request.maxTokens, ...(overrun ? { overrunReason: "mandatory identity/admission rules retained beyond the budget" } : {}), estimator: TOKEN_ESTIMATOR };
  const meta = {
    format: SLICE_FORMAT_V2,
    request,
    purpose,
    schemaDigest: ir.schemaDigest,
    schemaReleaseDigest: workspace.manifest.release.schemaReleaseDigest,
    workspaceFingerprint: workspace.manifest.workspaceFingerprint,
    nodeTypes: sorted(nodes),
    relationshipTypes: sorted(rels),
    edgePropertyTypes: sorted(edgeProps),
    enums: sorted(enums),
    unions: sorted(unions),
    interfaces: sorted(interfaces),
    predicates: sorted(preds),
    patterns: sorted(patterns),
    trace,
    included,
    omissions: dedupeOmissions(omissions),
    budget,
    closure,
  };
  const sliceId = digestOf(meta);
  const context = schemaContext(workspace, {
    ...(request.intent ? { intent: request.intent } : {}),
    taskIds: request.tasks,
    questionIds: request.questions,
    cardIds: included.map((p) => p.cardId).filter((x): x is string => Boolean(x)),
    reasons: Object.fromEntries(included.filter((p) => p.cardId).map((p) => [p.cardId!, p.mandatory ? "mandatory rule" : `priority ${p.priority}`])),
    omissions: meta.omissions,
    budget: { maxTokens: budget.maxTokens, estimatedTokens: budget.estimatedTokens, exceeded: budget.exceeded, estimator: budget.estimator },
  });
  return { ...meta, sliceId, pages, combinedSdl, context };
}

export class SliceError extends Error {
  readonly code = "SLICE_INVALID";
}

function resolveModule(ws: Workspace, id: string): string | undefined {
  if (ws.record(`mod:${id}`)) return id;
  const r = ws.resolve(id.includes(":") ? id : `frag:${id}`);
  if (!r) return undefined;
  if (r.record.kind === "module") return r.record.id.slice(4);
  const t = (r.record.targets ?? []).find((x) => x.startsWith("mod:"));
  return t?.slice(4);
}

/** Type names an SDL definition references (field types, implements, union members, relationship properties). */
export function referencedTypes(sdl: string): string[] {
  const out = new Set<string>();
  let body = sdl.replace(/"""[\s\S]*?"""/g, "").replace(/"(?:[^"\\]|\\.)*"/g, '""');
  // directive and field arguments (direction: OUT, type: "X") are not type references
  for (let i = 0; i < 3; i++) body = body.replace(/\([^()]*\)/g, "");
  for (const m of body.matchAll(/:\s*\[?\s*([A-Z][A-Za-z0-9_]*)/g)) out.add(m[1]!);
  for (const m of body.matchAll(/implements\s+([A-Za-z0-9_&\s]+?)(?:@|\{)/g)) for (const n of m[1]!.split("&")) if (n.trim()) out.add(n.trim());
  const union = /^\s*union\s+\w+[^=]*=\s*([\s\S]*)$/m.exec(body);
  if (union) for (const n of union[1]!.split("|")) if (/^\s*[A-Z]\w*\s*$/.test(n)) out.add(n.trim());
  for (const m of sdl.matchAll(/properties:\s*"([A-Z][A-Za-z0-9_]*)"/g)) out.add(m[1]!);
  return [...out];
}

/** Keeps every table row of per-type sections that names a selected type; returns the scoped text and the drop count. */
function scopeRulePage(text: string, selected: Set<string>): { text: string; dropped: number } {
  const lines = text.split("\n");
  const out: string[] = [];
  let inScoped = false;
  let dropped = 0;
  for (const line of lines) {
    if (line.startsWith("## ")) inScoped = /^## (Per type|Relationship types|Provenance requirement by archetype)/.test(line);
    if (inScoped && line.startsWith("| ") && !line.startsWith("| ---")) {
      const named = [...line.matchAll(/\[([A-Za-z0-9_]+)\]\(/g)].map((m) => m[1]!);
      if (named.length && !named.some((n) => selected.has(n))) {
        dropped++;
        continue;
      }
    }
    out.push(line);
  }
  return { text: dropped ? out.join("\n") + `\n\n> Scoped excerpt for this slice: ${dropped} rows for types outside the slice were omitted; the full card is in the workspace.\n` : text, dropped };
}

/** Front matter + title + description (capped) + the first `## ` section of a card; null when not a card. */
function excerptOf(text: string): string | null {
  const card = parseCard(text);
  if (!card) return null;
  const header = text.slice(0, text.length - card.body.length);
  const parts = card.body.split(/\n(?=## )/);
  const lead = parts[0] ?? "";
  const leadCapped = lead.length > 900 ? `${lead.slice(0, 899)}…\n` : lead;
  const first = parts[1] ?? "";
  return `${header}${leadCapped}\n${first}\n\n> Excerpt for a budgeted slice: later sections omitted; the full card is in the workspace.\n`;
}

function dedupeOmissions(xs: SliceOmission[]): SliceOmission[] {
  const seen = new Set<string>();
  return xs.filter((x) => {
    const k = `${x.element}|${x.reason}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Writes a slice bundle to `outDir` (never into the workspace itself). */
export function writeSlice(bundle: SliceBundle, outDir: string, workspaceDir?: string): string[] {
  const out = resolve(outDir);
  if (workspaceDir && (out === resolve(workspaceDir) || out.startsWith(`${resolve(workspaceDir)}${sep}`))) throw new SliceError(`refusing to write a slice inside the generated workspace (${out})`);
  const written: string[] = [];
  const put = (rel: string, content: string) => {
    const target = join(out, ...rel.split("/"));
    if (!resolve(target).startsWith(`${out}${sep}`)) throw new SliceError(`slice path escapes the output directory: ${rel}`);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, "utf8");
    written.push(rel);
  };
  const { pages, combinedSdl, context, ...meta } = bundle;
  put("slice.json", `${JSON.stringify(meta, null, 2)}\n`);
  put("schema-context.json", `${JSON.stringify(context, null, 2)}\n`);
  if (combinedSdl) put("schema.graphql", combinedSdl);
  for (const [path, content] of pages) put(path, content);
  put(
    "START_HERE.md",
    `# Scoped schema slice (${bundle.purpose})

Slice \`${bundle.sliceId}\` · release digest \`${bundle.schemaReleaseDigest}\` · workspace \`${bundle.workspaceFingerprint}\`
Intent: ${bundle.request.intent ?? "(none)"}

Budget: ~${bundle.budget.estimatedTokens} of ${bundle.budget.maxTokens} tokens (${bundle.budget.estimator})${bundle.budget.exceeded ? ` — EXCEEDED: ${bundle.budget.overrunReason ?? "see slice.json"}` : ""}.
Closure: ${bundle.closure.note}${bundle.closure.missingTypes.length ? ` (${bundle.closure.missingTypes.length} missing types)` : ""}.

## Included pages (${bundle.included.length})

${bundle.included.map((p) => `- [${p.path}](${p.path})${p.mandatory ? " (mandatory rule)" : ""}${p.scoped ? " (scoped excerpt)" : ""} ~${p.tokens} tokens`).join("\n")}

## Omitted (${bundle.omissions.length})

${bundle.omissions.map((o) => `- ${o.element}: ${o.reason}`).join("\n") || "(none)"}

Omission is not permission or prohibition: an element missing from this slice may still exist in the full workspace. \`schema-context.json\` (biotech-schema-context.v1) records the selection; it is advisory and grants no authority.
`,
  );
  return written;
}
