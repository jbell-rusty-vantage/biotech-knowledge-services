#!/usr/bin/env node
/**
 * Builds the cross-packet bio-medical tooling action space (packet D11, agent A8).
 *
 *   node schema/program/packets/D11/_notes/action-space/build-action-space.mjs [--suite C:/Users/Pinda/Proyectos/Biotech] [--check]
 *
 * Inputs (read only):
 *   - <suite>/biotech-knowledge-services-<agent>/schema/program/packets/<id>/08-sources-and-tools.md   (K, D1-D13; D11 via its local registry)
 *   - .../<id>/_notes/tool-log.md, .../<id>/05-relationship-register.yaml, .../<id>/02-questions.md, .../<id>/06-node-register.yaml
 *   - K identifier register: biotech-knowledge-services-A1/schema/program/packets/K/identifier-schemes.yaml
 *   - this folder: merge-spec.yaml (judgment) and d11-local-registry.yaml (D11's own scored entries)
 * Outputs (D11 only):
 *   - packets/D11/tooling/action-space.yaml          merged registry + aliases + gap clusters
 *   - packets/D11/tooling/readiness-scorecard.md     scorecard, prioritized gaps, custom tooling
 *   - packets/D11/identifier-bridges.yaml            only the generated block between the reconciliation markers
 * Deterministic: same inputs → byte-identical outputs (no timestamps beyond the spec's scoredAt date).
 * --check: build in memory and exit 1 if any output differs from the files on disk.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const worktree = resolve(here, "../../../../../..");
const args = process.argv.slice(2);
const suite = args.includes("--suite") ? args[args.indexOf("--suite") + 1] : dirname(worktree);
const CHECK = args.includes("--check");
const require = createRequire(resolve(worktree, "packages/schema-workspace/package.json"));
const YAML = require("yaml");

const SCORED_AT = "2026-10-08";
const PACKETS = { K: "A1", D1: "A2", D2: "A3", D3: "A4", D4: "A3", D5: "A5", D6: "A6", D7: "A6", D8: "A7", D9: "A8", D10: "A1", D11: "A8", D12: "A2", D13: "A7" };
const ORDER = ["K", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13"];
const pdir = (p) => `${suite}/biotech-knowledge-services-${PACKETS[p]}/schema/program/packets/${p}`;
const D11 = resolve(worktree, "schema/program/packets/D11");
const read = (f) => readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const errors = [];
const warnings = [];

const spec = YAML.parse(read(resolve(here, "merge-spec.yaml")));
const local = YAML.parse(read(resolve(here, "d11-local-registry.yaml")));
const kreg = YAML.parse(read(`${pdir("K")}/identifier-schemes.yaml`));

// ------------------------------------------------------------------ helpers
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const uniq = (a) => [...new Set(a)];
const re = (s) => new RegExp(s, "i");
const strip = (id) => id.replace(/★/g, "").trim().replace(/^(tool|src|job|agent|curation):/, "");
const KINDS = ["search", "fetch", "parse", "resolve", "verify", "compute"];
const SELECTORS = ["TEXT_QUOTE", "CHARACTER_POSITION", "MULTI_FRAGMENT_TEXT", "JSON_POINTER", "HTML", "PDF_TEXT", "BOUNDING_BOX", "TABLE", "MEDIA_TIMECODE", "REPOSITORY", "DATASET", "API_RECORD", "WHOLE_SNAPSHOT"];
const PRIO = ["P0", "P1", "P2", "P3"];
const WEIGHT = { 1: 3, 2: 2, 3: 1 };
const qsort = (a) => [...a].sort((x, y) => x.localeCompare(y, "en", { numeric: true }));
// TL-04: PyYAML (YAML 1.1) rejects some plain scalars that Node yaml 2.x emits inside flow collections (e.g. "(?)",
// "?updated=" in a flow sequence). Every string value inside a flow sequence or flow map is double-quoted; a flow-map
// key stays plain only when it is a bare word. Anywhere in the document, a string that YAML 1.1 implicit resolvers
// would read as a non-string (PyYAML resolver.py: bool yes/no/on/off, int/float incl. sexagesimal and 0-octal,
// null, merge, value, timestamp such as 2026-10-08) is double-quoted too, because Node yaml 2.x (YAML 1.2 core)
// leaves those plain. Applied after the flow/block choice, before toString, so the parsed content is unchanged and
// both parsers (Node yaml 2.x, PyYAML safe_load) read the same strings.
const BARE_KEY = /^[A-Za-z][A-Za-z0-9_]*$/;
const YAML11_NON_STRING = [
  /^(?:yes|Yes|YES|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF)$/,
  /^(?:[-+]?(?:[0-9][0-9_]*)\.[0-9_]*(?:[eE][-+][0-9]+)?|\.[0-9][0-9_]*(?:[eE][-+][0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*|[-+]?\.(?:inf|Inf|INF)|\.(?:nan|NaN|NAN))$/,
  /^(?:[-+]?0b[0-1_]+|[-+]?0[0-7_]+|[-+]?(?:0|[1-9][0-9_]*)|[-+]?0x[0-9a-fA-F_]+|[-+]?[1-9][0-9_]*(?::[0-5]?[0-9])+)$/,
  /^(?:~|null|Null|NULL|<<|=|)$/,
  /^(?:[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}(?:[Tt]|[ \t]+)[0-9]{1,2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]*)?(?:[ \t]*(?:Z|[-+][0-9]{1,2}(?::[0-9]{2})?))?|[0-9]{4}-[0-9]{2}-[0-9]{2})$/,
];
function quoteFlowScalars(doc) {
  YAML.visit(doc, {
    Scalar(key, node, path) {
      if (typeof node.value !== "string") return;
      const inFlow = path.some((p) => (YAML.isSeq(p) || YAML.isMap(p)) && p.flow);
      const yaml11 = YAML11_NON_STRING.some((r) => r.test(node.value));
      if (!yaml11 && (!inFlow || (key === "key" && BARE_KEY.test(node.value)))) return;
      node.type = "QUOTE_DOUBLE";
    },
  });
}

function splitRow(line) {
  const cells = [];
  let cur = "";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && line[i + 1] === "|") { cur += "|"; i++; continue; }
    if (ch === "|") { cells.push(cur.trim()); cur = ""; } else cur += ch;
  }
  cells.push(cur.trim());
  return cells.slice(1, -1);
}
function tables(text, isHeader) {
  const out = [];
  let hdr = null;
  for (const line of text.split("\n")) {
    if (!line.startsWith("|")) { hdr = null; continue; }
    const c = splitRow(line);
    if (isHeader(c)) { hdr = c; continue; }
    if (!hdr || c.every((x) => /^:?-+:?$/.test(x))) continue;
    const row = {};
    hdr.forEach((h, i) => (row[h] = c[i] ?? ""));
    out.push(row);
  }
  return out;
}
const readinessOf = (raw) => {
  const s = String(raw ?? "").trim();
  if (!s || /^(—|-|n\/a)$/i.test(s) || /unscored|not scored/i.test(s)) return null;
  const m = s.match(/\d(\.\d)?/);
  return m ? Math.floor(Number(m[0])) : null;
};
const exercisedOf = (raw) => {
  const s = String(raw ?? "").trim();
  return !(!s || /^(no\b|not (used|exercised|accessed|scored|loaded)|—|-|n\/a|none|desk|unscored)/i.test(s));
};
function normAccess(raw) {
  const s = String(raw ?? "");
  const out = [];
  if (/\bmcp\b/i.test(s)) out.push("mcp");
  if (/bulk|\.zip|\bzip\b|\bcsv\b|\bftp\b|dump/i.test(s)) out.push("bulk");
  if (/scrape|public web|\bweb\b|JS-rendered|paywall/i.test(s)) out.push("scrape");
  if (/internal|\blocal\b|executor|intent|library|projection job|curation|agent \+|service contract/i.test(s)) out.push("internal");
  if (/manual|not accessed/i.test(s)) out.push("manual");
  if (/\bapi\b|REST|JSON|HTTP|GraphQL|curl|\bCLI\b|\bXML\b/i.test(s)) out.push("api");
  return out;
}
const normKinds = (raw) => KINDS.filter((k) => new RegExp(`\\b${k}`, "i").test(String(raw ?? "")));
function normSelectors(raw) {
  const s = String(raw ?? "");
  const out = SELECTORS.filter((k) => new RegExp(`\\b${k}\\b`).test(s));
  if (/PDF_PAGE|PDF page/i.test(s)) out.push("PDF_TEXT");
  if (/IMAGE_REGION|bounding box/i.test(s)) out.push("BOUNDING_BOX");
  if (/TEXT_POSITION|character offsets?/i.test(s)) out.push("CHARACTER_POSITION");
  if (/JSON[ -]pointer/i.test(s)) out.push("JSON_POINTER");
  if (/XML element|section ?id|sec\/@id|nxml/i.test(s)) out.push("HTML");
  if (/TABLE rows/i.test(s)) out.push("TABLE");
  if (/media time|timecode/i.test(s)) out.push("MEDIA_TIMECODE");
  if (/GraphQL path|field name/i.test(s)) out.push("API_RECORD");
  return SELECTORS.filter((k) => out.includes(k));
}
function splitIds(raw) {
  return String(raw ?? "")
    .split(/[,;]\s*/)
    .map((x) => x.replace(/`/g, "").trim())
    .filter((x) => x && !/^(—|-|n\/a|none|\(none\)|—)$/i.test(x));
}
const prioIndex = (p) => (PRIO.includes(p) ? PRIO.indexOf(p) : 9);

// ------------------------------------------------------------------ canonical entries
const canon = new Map();
for (const e of local.entries) {
  canon.set(e.id, {
    id: e.id, class: "external", origin: "D11-local", base: e,
    kind: asList(e.kind), access: asList(e.access), provider: e.provider, auth: e.auth, rateLimits: e.rateLimits,
    ids: asList(e.identifiersEmitted).map(String), locText: asList(e.locatorKinds).join("; "),
    gap: e.gap, owner: e.owner, domains: asList(e.domains), seen: [], rows: [],
  });
}
for (const e of spec.entries) {
  if (canon.has(e.id)) errors.push(`spec entry ${e.id} duplicates a D11-local id`);
  canon.set(e.id, { id: e.id, class: e.class, origin: "spec", base: null, kind: asList(e.kind), access: asList(e.access), provider: e.provider, auth: null, rateLimits: null, ids: [], locText: "", gap: null, owner: null, domains: [], seen: [], rows: [] });
}
for (const r of spec.rules) if (!canon.has(r.to)) errors.push(`rule target ${r.to} is not a canonical entry`);

// D11's own rows: one per local entry
for (const e of local.entries) {
  const c = canon.get(e.id);
  c.seen.push({ alias: `D11:${e.id}`, readiness: String(e.readiness), priority: e.priority, exercised: e.tier === 1 });
}

// ------------------------------------------------------------------ packet rows (08)
const aliasMap = {}; // "P:localId" → canonical
for (const e of local.entries) aliasMap[`D11:${e.id}`] = e.id;
let rowCount = 0;
for (const p of ORDER) {
  if (p === "D11") continue;
  const rows = tables(read(`${pdir(p)}/08-sources-and-tools.md`), (c) => c[0] === "id" && c.includes("readiness"));
  for (const row of rows) {
    const text = Object.values(row).join(" | ");
    for (const rawId of row.id.split(/,\s*/)) {
      rowCount++;
      const localId = rawId.replace(/★/g, "").trim();
      const s = strip(localId);
      const rule = spec.rules.find((r) => r.ids.includes(s) && (!r.packets || r.packets.includes(p)) && (!r.when || re(r.when).test(text)));
      if (!rule) { errors.push(`unmatched row ${p}:${localId}`); continue; }
      const c = canon.get(rule.to);
      if (!c) continue;
      const key = `${p}:${localId}`;
      if (aliasMap[key] && aliasMap[key] !== rule.to) errors.push(`alias ${key} maps to two entries`);
      aliasMap[key] = rule.to;
      c.seen.push({ alias: key, readiness: row.readiness, priority: row.priority, exercised: exercisedOf(row.exercised) });
      c.rows.push({ packet: p, localId, row, text });
    }
  }
}

// ------------------------------------------------------------------ questions (02)
// S-key definitions in 01-ecosystem.md ("| S12 | url | title |" or "- [S12] url · title"), so that a sources cell
// citing "S12" or "[S28]–[S31]" is matched against what S12 is.
const skeys = new Map(); // packet → Map(n → definition line)
for (const p of ORDER) {
  const m = new Map();
  const f = `${pdir(p)}/01-ecosystem.md`;
  if (existsSync(f)) {
    for (const line of read(f).split("\n")) {
      const d = line.match(/^\s*(?:\|\s*|[-*]\s*)?\[?S0*(\d+)\]?\s*(?:\||·|:|—|\.|\])\s*(.*)$/);
      if (d && /https?:\/\//.test(d[2]) && !m.has(Number(d[1]))) m.set(Number(d[1]), d[2]);
    }
  }
  skeys.set(p, m);
}
function expandSources(p, text) {
  const keys = new Set();
  for (const r of text.matchAll(/S0*(\d+)\]?\s*[–-]\s*\[?S0*(\d+)/g)) for (let n = Number(r[1]); n <= Number(r[2]) && n - Number(r[1]) < 40; n++) keys.add(n);
  for (const r of text.matchAll(/\bS0*(\d+)\b/g)) keys.add(Number(r[1]));
  const defs = [...keys].map((n) => skeys.get(p).get(n)).filter(Boolean);
  return [text, ...defs].join(" ;; ");
}
const questions = new Map(); // id → { value, harm, packets }
const sourcesCells = []; // { packet, id, text }
for (const p of ORDER) {
  const rows = tables(read(`${pdir(p)}/02-questions.md`), (c) => c[0] === "id" && c.includes("question"));
  for (const r of rows) {
    const id = r.id.replace(/`/g, "").trim();
    if (!/^(Q|CQ)-/.test(id)) continue;
    const v = Number(String(r.value).match(/[123]/)?.[0] ?? 3);
    const q = questions.get(id) ?? { value: v, harm: false, packets: [] };
    q.value = Math.min(q.value, v);
    q.harm = q.harm || /harm/i.test(r.polarity ?? "");
    q.packets.push(p);
    questions.set(id, q);
    sourcesCells.push({ packet: p, id, text: expandSources(p, r.sources ?? "") });
  }
}

// ------------------------------------------------------------------ needed-by questions
const need = new Map([...canon.keys()].map((k) => [k, { q: new Set(), via: { populatedBy: 0, sources: 0, rowText: 0 } }]));
const unknownQ = new Set();
const addQ = (cid, qid, via) => {
  if (!questions.has(qid)) { unknownQ.add(qid); return; }
  const n = need.get(cid);
  if (!n.q.has(qid)) n.via[via]++;
  n.q.add(qid);
};
// a. populatedBy
const unresolvedPopulatedBy = [];
for (const p of ORDER) {
  const doc = YAML.parse(read(`${pdir(p)}/05-relationship-register.yaml`));
  for (const rel of asList(doc.relationships)) {
    for (const pb of asList(rel.populatedBy)) {
      const key = `${p}:${String(pb).trim()}`;
      const cid = aliasMap[key];
      if (!cid) { unresolvedPopulatedBy.push(key); continue; }
      for (const q of asList(rel.questions)) addQ(cid, String(q).trim(), "populatedBy");
    }
  }
}
// b. sources column of 02
const aliasesOf = new Map([...canon.keys()].map((k) => [k, []]));
for (const [a, cid] of Object.entries(aliasMap)) aliasesOf.get(cid).push(a);
const wordRe = (w) => new RegExp(`(^|[^\\w:-])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\w-])`);
const tokenRes = new Map();
for (const [cid, al] of aliasesOf) {
  const toks = uniq([cid, ...al.map((a) => a.slice(a.indexOf(":") + 1)), ...al.map((a) => strip(a.slice(a.indexOf(":") + 1)))]).filter((t) => t.length > 3);
  tokenRes.set(cid, toks.map(wordRe));
}
for (const cell of sourcesCells) {
  for (const cid of canon.keys()) {
    const m = spec.match[cid];
    if ((m && re(m).test(cell.text)) || tokenRes.get(cid).some((r) => r.test(cell.text))) addQ(cid, cell.id, "sources");
  }
}
// c. question ids named in a packet's 08 row
for (const c of canon.values()) {
  for (const r of c.rows) for (const q of r.text.match(/\b(?:Q-[A-Z0-9]+-\d+|CQ-[A-Z]+-\d+)\b/g) ?? []) addQ(c.id, q, "rowText");
}
for (const g of local.gaps ?? []) for (const q of asList(g.blocks)) if (!questions.has(q)) unknownQ.add(q);

// ------------------------------------------------------------------ tool logs
const logHits = new Map([...canon.keys()].map((k) => [k, {}]));
for (const p of ORDER) {
  const f = `${pdir(p)}/_notes/tool-log.md`;
  if (!existsSync(f)) { warnings.push(`no tool-log for ${p}`); continue; }
  const lines = read(f).split("\n").filter((l) => /^\s*(\||[-*]|\d+\.)\s*\S/.test(l) && !/^\|\s*:?-{3,}/.test(l));
  for (const cid of canon.keys()) {
    const m = spec.match[cid];
    if (!m) continue;
    const r = re(m);
    const n = lines.filter((l) => r.test(l)).length;
    if (n) logHits.get(cid)[p] = n;
  }
}
for (const cid of canon.keys()) if (!spec.match[cid]) warnings.push(`no match pattern for ${cid}`);

// ------------------------------------------------------------------ assemble entries
const schemeCodes = new Set([...kreg.schemes.map((s) => s.code), ...Object.keys(spec.schemeDetect)]);
const detect = (code) => re(spec.schemeDetect[code] ?? `\\b${code.replace(/_/g, "[ _-]?")}\\b`);
const lowerMedian = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };

const entries = [];
for (const c of canon.values()) {
  const scores = c.seen.filter((s) => !s.alias.startsWith("D11:")).map((s) => readinessOf(s.readiness)).filter((x) => x != null);
  let readiness, basis;
  const ov = spec.overrides?.[c.id];
  if (ov) { readiness = ov.readiness; basis = `override (D11): ${ov.reason}`; }
  else if (c.base) { readiness = c.base.readiness; basis = "D11-local score (exercised or scored by D11; PLAN 6.3 definition)"; }
  else if (scores.length) { readiness = lowerMedian(scores); basis = `lower median of ${scores.length} packet score(s)`; }
  else { readiness = null; basis = "unscored (no packet gave a score)"; }

  // primary row: highest readiness, then longest auth+gap text
  const prim = [...c.rows].sort((a, b) => (readinessOf(b.row.readiness) ?? -1) - (readinessOf(a.row.readiness) ?? -1) || (b.row.gap?.length ?? 0) - (a.row.gap?.length ?? 0))[0];
  const provider = c.provider ?? prim?.row.provider ?? "";
  const auth = c.auth ?? prim?.row.auth ?? "";
  const rateLimits = c.rateLimits ?? prim?.row.rateLimits ?? "";
  const gap = c.gap ?? prim?.row.gap ?? "";
  const gapNotes = c.rows
    .filter((r) => r !== prim || c.base)
    .map((r) => [r, String(r.row.gap ?? "").trim()])
    .filter(([, g]) => g && !/^(—|-|n\/a|none( observed| needed)?\.?)$/i.test(g) && g !== gap)
    .map(([r, g]) => `${r.packet}:${r.localId}: ${g}`);

  const idsRaw = uniq([...c.ids, ...c.rows.flatMap((r) => splitIds(r.row.identifiersEmitted))]);
  const seenLower = new Set();
  const identifiersEmitted = idsRaw.filter((x) => { const k = x.toLowerCase(); if (seenLower.has(k)) return false; seenLower.add(k); return true; });
  const idText = identifiersEmitted.join(" ; ");
  const excluded = asList(spec.schemeExclude?.[c.id]);
  const included = asList(spec.schemeInclude?.[c.id]);
  const identifierSchemes = [...schemeCodes].filter((code) => included.includes(code) || (!excluded.includes(code) && detect(code).test(idText))).sort();
  const locatorKinds = normSelectors([c.locText, ...c.rows.map((r) => r.row.locatorKinds)].join(" ; "));
  const kind = KINDS.filter((k) => c.kind.includes(k) || c.rows.some((r) => normKinds(r.row.kind).includes(k)));
  const accessOrder = ["api", "mcp", "bulk", "scrape", "manual", "internal"];
  const access = accessOrder.filter((a) => c.access.includes(a) || (c.class === "external" && c.rows.some((r) => normAccess(r.row.access).includes(a) && a !== "internal")));

  const nq = need.get(c.id);
  const blockedQuestions = qsort(nq.q);
  const vals = blockedQuestions.map((q) => questions.get(q).value);
  const v1 = vals.filter((v) => v === 1).length;
  const v2 = vals.filter((v) => v === 2).length;
  const r = readiness ?? 0;
  let computed = "P3";
  if (v1 && r <= 1) computed = "P0";
  else if (v1 || (v2 && r <= 1)) computed = "P1";
  else if (v2) computed = "P2";
  const basePrio = c.base?.priority;
  const priority = basePrio && prioIndex(basePrio) < prioIndex(computed) ? basePrio : computed;

  const seenPackets = uniq(c.seen.map((s) => s.alias.split(":")[0]));
  const exercisedBy = ORDER.filter((p) => c.seen.some((s) => s.alias.startsWith(`${p}:`) && s.exercised) || logHits.get(c.id)[p]);
  const qPackets = uniq(blockedQuestions.flatMap((q) => questions.get(q).packets));
  const domains = ORDER.filter((p) => (p !== "D11" && seenPackets.includes(p)) || c.domains.includes(p) || qPackets.includes(p));
  let owner = c.owner;
  if (!owner) {
    const others = seenPackets.filter((p) => p !== "D11");
    if (c.class === "internal") owner = others.some((p) => p === "K" || p === "D10") || others.length > 1 ? "kernel" : others[0] ?? "kernel";
    else owner = others.length > 1 ? "tooling" : others[0] ?? "tooling";
  }

  entries.push({
    id: c.id,
    class: c.class,
    domains,
    kind,
    provider,
    access,
    auth,
    rateLimits,
    identifiersEmitted,
    identifierSchemes,
    locatorKinds,
    readiness,
    readinessBasis: basis,
    gap,
    priority,
    owner,
    exercisedBy,
    blockedQuestions,
    aliases: aliasesOf.get(c.id).sort((a, b) => ORDER.indexOf(a.split(":")[0]) - ORDER.indexOf(b.split(":")[0]) || a.localeCompare(b)),
    seenAs: c.seen,
    ...(gapNotes.length ? { gapNotes } : {}),
    evidence: {
      questionsVia: nq.via,
      ...(Object.keys(logHits.get(c.id)).length ? { toolLogLines: Object.fromEntries(ORDER.filter((p) => logHits.get(c.id)[p]).map((p) => [p, logHits.get(c.id)[p]])) } : {}),
    },
    _v1: v1, _v2: v2, _v3: vals.filter((v) => v === 3).length, _harm: blockedQuestions.filter((q) => questions.get(q).harm).length,
    _spread: scores.length ? Math.max(...scores) - Math.min(...scores) : 0, _scores: scores,
  });
}
entries.sort((a, b) => (a.class === b.class ? a.id.localeCompare(b.id) : a.class === "external" ? -1 : 1));
const byId = new Map(entries.map((e) => [e.id, e]));
const score = (qs) => qs.reduce((s, q) => s + WEIGHT[questions.get(q).value], 0);

// ------------------------------------------------------------------ gaps
const localGap = new Map((local.gaps ?? []).map((g) => [g.id, g]));
const gaps = spec.gaps.map((g) => {
  for (const e of asList(g.entries)) if (!byId.has(e)) errors.push(`gap ${g.id} names unknown entry ${e}`);
  const lg = localGap.get(g.id);
  const explicit = uniq([...asList(g.blocks), ...asList(lg?.blocks), ...asList(lg?.blocksOtherPackets).map((x) => String(x).replace(/^[A-Z0-9]+:/, ""))]);
  for (const q of explicit) if (!questions.has(q)) unknownQ.add(q);
  // scope: a gap blocks the questions of the packets that asked for it (requestedBy), plus ids named explicitly
  const scope = asList(g.scope ?? g.requestedBy);
  const inScope = (q) => questions.get(q).packets.some((p) => scope.includes(p));
  const qs = qsort(uniq([...explicit.filter((q) => questions.has(q)), ...asList(g.entries).flatMap((e) => byId.get(e)?.blockedQuestions ?? []).filter(inScope)]));
  const ents = asList(g.entries).map((e) => byId.get(e)).filter(Boolean);
  const weakest = ents.length ? Math.min(...ents.map((e) => e.readiness ?? 0)) : null;
  const v = (n) => qs.filter((q) => questions.get(q).value === n).length;
  return {
    id: g.id, title: g.title, entries: asList(g.entries), ...(g.allEntries ? { allEntries: true } : {}),
    requestedBy: g.requestedBy, owner: g.owner, build: g.build,
    blockedQuestions: qs, counts: { total: qs.length, value1: v(1), value2: v(2), value3: v(3), harm: qs.filter((q) => questions.get(q).harm).length, score: score(qs) },
    weakestEntryReadiness: weakest,
  };
});
gaps.sort((a, b) => b.counts.score - a.counts.score || b.counts.value1 - a.counts.value1 || b.counts.total - a.counts.total || a.id.localeCompare(b.id, "en", { numeric: true }));
gaps.forEach((g, i) => {
  g.rank = i + 1;
  g.priority = g.counts.value1 >= 1 && (g.weakestEntryReadiness ?? 0) <= 1 ? "P0" : g.counts.value1 >= 1 ? "P1" : g.counts.value2 >= 1 ? "P2" : "P3";
  if (g.allEntries && g.counts.value1) g.priority = "P0";
});

// ------------------------------------------------------------------ identifier reconciliation
const kByCode = new Map(kreg.schemes.map((s) => [s.code, s]));
const nodeSchemes = new Map(); // code → [P.Type]
for (const p of ORDER) {
  const doc = YAML.parse(read(`${pdir(p)}/06-node-register.yaml`));
  for (const n of asList(doc.nodes)) {
    for (const s of asList(n.identifierSchemes)) {
      const m = String(s).match(/^([A-Z][A-Z0-9_]+)/);
      if (!m || !/^[A-Z0-9_]+$/.test(m[1]) || m[1].length < 2) continue;
      if (!nodeSchemes.has(m[1])) nodeSchemes.set(m[1], []);
      nodeSchemes.get(m[1]).push(`${p}.${n.name}`);
    }
  }
}
const bridges = YAML.parse(read(resolve(D11, "identifier-bridges.yaml")));
const d11Rows = new Map(); // code → [{scheme, pattern, requested}]
for (const s of asList(bridges.schemes)) {
  const kc = String(s.kernelCode ?? "");
  let code = null;
  if (/^[A-Z][A-Z0-9_]+$/.test(kc)) code = kc;
  else if (/^\(requested: ([A-Z][A-Z0-9_]+)/.test(kc)) code = kc.match(/^\(requested: ([A-Z][A-Z0-9_]+)/)[1];
  if (!code) continue;
  if (!d11Rows.has(code)) d11Rows.set(code, []);
  // routes D11 observed for the scheme (authorityRoute names registry ids or aliases)
  const routeText = String(s.authorityRoute ?? "");
  const observed = [...canon.keys()].filter((cid) => wordRe(cid).test(routeText));
  d11Rows.get(code).push({ scheme: s.scheme, pattern: s.pattern, observed });
}
// equivalent character classes ([A-Z0-9] = [0-9A-Z]) are not a difference
const normPattern = (p) => String(p).replace(/\[([^\]]+)\]/g, (_, body) => `[${(body.match(/.-.|./g) ?? []).sort().join("")}]`);
const optionalD11 = ["NCIT"];
const allCodes = uniq([...kByCode.keys(), ...nodeSchemes.keys(), ...d11Rows.keys(), ...optionalD11]).sort();
const recon = allCodes.map((code) => {
  const k = kByCode.get(code);
  const d11 = d11Rows.get(code) ?? [];
  const observedIds = new Set(d11.flatMap((r) => r.observed));
  const routes = entries.filter((e) => e.class === "external" && (e.identifierSchemes.includes(code) || observedIds.has(e.id))).sort((a, b) => (b.readiness ?? -1) - (a.readiness ?? -1) || a.id.localeCompare(b.id));
  const diffs = d11.filter((r) => k?.pattern && r.pattern && normPattern(r.pattern) !== normPattern(k.pattern) && !/after normalization|free text|UUID|issuer-specific|layouts|grammar|activity code/i.test(r.pattern)).map((r) => `D11 '${r.pattern}' vs K '${k.pattern}'`);
  return {
    code,
    kernel: k ? (k.status ?? "seed") : "missing",
    usedByNodeTypes: nodeSchemes.get(code) ?? [],
    d11BridgeRow: d11.map((r) => r.scheme),
    routes: routes.map((e) => `${e.id} (${e.readiness ?? "?"})`).slice(0, 6),
    bestRouteReadiness: routes.length ? routes[0].readiness : null,
    ...(diffs.length ? { patternDiff: diffs } : {}),
  };
});
const missingFromK = recon.filter((r) => r.kernel === "missing");

// ------------------------------------------------------------------ write action-space.yaml
const external = entries.filter((e) => e.class === "external");
const internal = entries.filter((e) => e.class === "internal");
const dist = (list) => Object.fromEntries([3, 2, 1, 0, null].map((r) => [r == null ? "unscored" : `r${r}`, list.filter((e) => e.readiness === r).length]));
const prioDist = Object.fromEntries(PRIO.map((p) => [p, entries.filter((e) => e.priority === p).length]));
const clean = (e) => Object.fromEntries(Object.entries(e).filter(([k]) => !k.startsWith("_")));
const header = `# BellLabs bio-medical tooling action space — merged cross-packet registry (PLAN 6.3 schema)
# Packet D11, agent A8, ${SCORED_AT}. GENERATED by _notes/action-space/build-action-space.mjs — do not edit by hand;
# change _notes/action-space/merge-spec.yaml (judgment) or d11-local-registry.yaml (D11's own scores) and re-run.
#
# Inputs: the scored tables of every packet's 08-sources-and-tools.md (K, D1-D13 from their worktrees; D11 from its
# local registry), every packet's _notes/tool-log.md, 05-relationship-register.yaml (populatedBy) and 02-questions.md.
#
# Entry fields (PLAN 6.3 + the cross-packet pass):
#   id                 canonical id = toolId / SourceSnapshot.captureMethod prefix ("<id>/<version>"); D11-local ids kept
#   class              external (provider API, data, pages, third-party tool) | internal (BellLabs writer, job, local parser)
#   domains            packets that list the tool in 08 or whose questions need it (D11 omitted unless its questions need it)
#   kind               search | fetch | parse | resolve | verify | compute
#   access             api | mcp | bulk | scrape | manual | internal (internal = BellLabs-built, K's extension of the enum)
#   identifiersEmitted union of the packets' free-text lists; identifierSchemes = kernel register codes detected in it
#   locatorKinds       kernel SelectorKind values detected in the packets' locator columns
#   readiness          0 blocked · 1 scrape-only · 2 API without stable locators · 3 agent-ready (external);
#                      internal entries use K's scale 0 not built · 1 designed · 2 partially built · 3 in use.
#                      readinessBasis says which rule decided it: D11-local score, a D11 override with its reason, or the
#                      lower median of the packets' current scores (first number of each packet's readiness cell).
#   priority           P0 a value-1 question needs it and readiness <= 1 · P1 a value-1 question needs it (or value-2
#                      at readiness <= 1) · P2 value-2 · P3 otherwise; never less urgent than D11's own score.
#   owner              tooling (shared backlog) | kernel | owner (licence/keys) | a packet id
#   exercisedBy        packets whose 08 row marks it exercised or whose tool-log has a line matching the entry's pattern
#   blockedQuestions   question ids (02 of any packet) that need the tool: populatedBy of a 05 relationship, the 02
#                      sources column (pattern or id match), or a question id named in the packet's 08 row
#   aliases            every packet-local id ("<packet>:<id as written in 08>") merged into this entry
#   seenAs             per alias: the packet's own readiness / priority cells and whether it exercised the tool
#   gapNotes           the other packets' gap text, verbatim, when it differs from \`gap\`
# Top-level \`aliases\` maps every packet-local id to its canonical id (rewrite populatedBy with it). \`gaps\` are the
# custom-tooling clusters ranked by blocked questions (score = 3 per value-1, 2 per value-2, 1 per value-3 question).
`;
const out = {
  version: 2,
  registry: "biotech-action-space",
  scoredAt: SCORED_AT,
  scoredBy: "A8 (D11), cross-packet pass",
  generatedBy: "schema/program/packets/D11/_notes/action-space/build-action-space.mjs",
  inputs: { packets: ORDER, packetRows: rowCount, d11LocalEntries: local.entries.length },
  summary: {
    entries: entries.length, external: external.length, internal: internal.length, aliases: Object.keys(aliasMap).length,
    readinessExternal: dist(external), readinessInternal: dist(internal), priority: prioDist,
    exercised: entries.filter((e) => e.exercisedBy.length).length,
    neededByQuestions: entries.filter((e) => e.blockedQuestions.length).length,
    questionsInCatalog: questions.size,
    questionsNeedingATool: new Set(entries.flatMap((e) => e.blockedQuestions)).size,
  },
  entries: entries.map(clean),
  gaps: gaps.map((g) => ({ rank: g.rank, id: g.id, title: g.title, priority: g.priority, owner: g.owner, requestedBy: g.requestedBy, entries: g.entries, ...(g.allEntries ? { allEntries: true } : {}), weakestEntryReadiness: g.weakestEntryReadiness, counts: g.counts, blockedQuestions: g.blockedQuestions, build: g.build })),
  mcpRecommendation: local.mcpRecommendation,
  aliases: Object.fromEntries(Object.entries(aliasMap).sort(([a], [b]) => ORDER.indexOf(a.split(":")[0]) - ORDER.indexOf(b.split(":")[0]) || a.localeCompare(b))),
};
const doc = new YAML.Document(out);
YAML.visit(doc, {
  // flow style for short scalar lists (ids, kinds, schemes); block style for lists of sentences (gapNotes)
  Seq(_, node) { if (node.items.every((i) => YAML.isScalar(i) && String(i.value).length <= 90)) node.flow = true; },
  Map(_, node) {
    const keys = node.items.map((p) => p.key?.value);
    if (keys.includes("alias") || keys.includes("populatedBy") || keys.every((k) => /^(K|D\d+)$/.test(k)) || (keys.length <= 6 && keys.every((k) => /^(r[0-3]|unscored|P[0-3]|total|value[123]|harm|score)$/.test(k)))) node.flow = true;
  },
});
quoteFlowScalars(doc);
const actionSpace = header + "\n" + doc.toString({ lineWidth: 0 });

// ------------------------------------------------------------------ scorecard
const md = [];
const L = (s = "") => md.push(s);
const trunc = (s, n) => { const t = String(s ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 1) + "…" : t; };
const rr = (r) => (r == null ? "–" : String(r));
L("# Readiness scorecard — bio-medical tooling action space");
L();
L(`Packet D11, agent A8, ${SCORED_AT}. **Generated** by \`_notes/action-space/build-action-space.mjs\` from \`tooling/action-space.yaml\`'s inputs; do not edit by hand. Readiness scale (PLAN 6.3): **0** blocked · **1** scrape-only · **2** API without stable locators · **3** agent-ready. Internal BellLabs tools use K's scale (0 not built … 3 in use) and are scored separately in section 4.`);
L();
L("## 1. Summary");
L();
const de = dist(external), di = dist(internal);
L(`- **${entries.length} merged entries** (${external.length} external, ${internal.length} internal) from ${rowCount} packet rows in 13 sibling \`08\` tables plus D11's ${local.entries.length} local entries, under **${Object.keys(aliasMap).length} packet-local aliases** (top-level \`aliases\` in the registry).`);
L(`- External readiness: 3 → ${de.r3} · 2 → ${de.r2} · 1 → ${de.r1} · 0 → ${de.r0} · unscored → ${de.unscored}. Internal (K scale): 3 → ${di.r3} · 2 → ${di.r2} · 1 → ${di.r1} · 0 → ${di.r0} · unscored → ${di.unscored}.`);
L(`- Priority: P0 ${prioDist.P0} · P1 ${prioDist.P1} · P2 ${prioDist.P2} · P3 ${prioDist.P3}. Exercised by at least one packet: ${out.summary.exercised}. Needed by at least one question: ${out.summary.neededByQuestions}.`);
L(`- ${out.summary.questionsNeedingATool} of the ${questions.size} catalogued questions (all packets' \`02\`) name a tool or source the registry resolves.`);
const p0 = entries.filter((e) => e.priority === "P0");
L(`- P0 entries: ${p0.map((e) => `\`${e.id}\` (${rr(e.readiness)})`).join(", ")}.`);
L();
L("## 2. Scorecard by readiness level and domain (external entries)");
L();
L("An entry counts in every domain that lists it in `08` or whose questions need it, so rows do not sum to the total.");
L();
L("| domain | 3 agent-ready | 2 API, no locators | 1 scrape-only | 0 blocked | unscored | entries | P0 | value-1 questions needing a readiness ≤ 1 entry |");
L("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
for (const p of ORDER) {
  const es = external.filter((e) => e.domains.includes(p));
  const c = (r) => es.filter((e) => e.readiness === r).length;
  const weakQ = new Set(es.filter((e) => (e.readiness ?? 0) <= 1).flatMap((e) => e.blockedQuestions).filter((q) => questions.get(q).value === 1 && questions.get(q).packets.includes(p)));
  L(`| ${p} | ${c(3)} | ${c(2)} | ${c(1)} | ${c(0)} | ${c(null)} | ${es.length} | ${es.filter((e) => e.priority === "P0").length} | ${weakQ.size} |`);
}
L(`| **all** | **${de.r3}** | **${de.r2}** | **${de.r1}** | **${de.r0}** | **${de.unscored}** | **${external.length}** | **${external.filter((e) => e.priority === "P0").length}** | |`);
L();
L("## 3. External entries by readiness level");
L();
for (const r of [3, 2, 1, 0, null]) {
  const es = external.filter((e) => e.readiness === r);
  L(`**${r == null ? "unscored" : `readiness ${r}`}** (${es.length}): ${es.map((e) => `\`${e.id}\``).join(", ") || "none"}.`);
  L();
}
L("## 4. Internal BellLabs tooling (K scale: 0 not built · 1 designed · 2 partially built · 3 in use)");
L();
L("| id | readiness | priority | questions needing it (value-1) | registered by | gap |");
L("| --- | ---: | --- | ---: | --- | --- |");
for (const e of [...internal].sort((a, b) => b._v1 - a._v1 || b.blockedQuestions.length - a.blockedQuestions.length || a.id.localeCompare(b.id))) {
  L(`| \`${e.id}\` | ${rr(e.readiness)} | ${e.priority} | ${e.blockedQuestions.length} (${e._v1}) | ${uniq(e.aliases.map((a) => a.split(":")[0])).join(", ")} | ${trunc(e.gap, 160)} |`);
}
L();
L("## 5. Prioritized gap list (custom-tooling clusters, ranked by number and value of blocked questions)");
L();
L("A gap blocks the questions that need any of its entries (plus question ids named by the requesting packets). Score = 3 per value-1, 2 per value-2, 1 per value-3 question; ties break on value-1 count, then total. Priority: P0 when a value-1 question is blocked and the weakest entry is at readiness ≤ 1.");
L();
L("| rank | gap | title | blocked | value-1 | value-2 | value-3 | harm | score | weakest readiness | priority | owner | requested by |");
L("| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |");
for (const g of gaps) L(`| ${g.rank} | ${g.id} | ${trunc(g.title, 110)} | ${g.counts.total} | ${g.counts.value1} | ${g.counts.value2} | ${g.counts.value3} | ${g.counts.harm} | ${g.counts.score} | ${rr(g.weakestEntryReadiness)} | ${g.priority} | ${g.owner} | ${g.requestedBy.join(", ")} |`);
L();
L("## 6. Entry-level gaps (readiness ≤ 2, ranked by blocked questions)");
L();
L("| rank | id | class | readiness | priority | questions | value-1 | harm | score | gap |");
L("| ---: | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | --- |");
const lowEntries = entries.filter((e) => (e.readiness ?? 0) <= 2 && e.blockedQuestions.length).sort((a, b) => score(b.blockedQuestions) - score(a.blockedQuestions) || b._v1 - a._v1 || a.id.localeCompare(b.id));
lowEntries.slice(0, 40).forEach((e, i) => L(`| ${i + 1} | \`${e.id}\` | ${e.class} | ${rr(e.readiness)} | ${e.priority} | ${e.blockedQuestions.length} | ${e._v1} | ${e._harm} | ${score(e.blockedQuestions)} | ${trunc(e.gap, 170)} |`));
L();
L(`${lowEntries.length} entries at readiness ≤ 2 are needed by at least one question; the 40 highest are listed.`);
L();
L("## 7. Custom tooling to build (in gap-rank order)");
L();
for (const g of gaps) {
  const v1 = g.blockedQuestions.filter((q) => questions.get(q).value === 1);
  L(`${g.rank}. **${g.id} — ${g.title}** (${g.priority}; owner ${g.owner}; requested by ${g.requestedBy.join(", ")}). ${g.build}`);
  L(`   - Entries: ${g.allEntries ? "every adapter" : g.entries.map((e) => `\`${e}\` (${rr(byId.get(e)?.readiness)})`).join(", ")}.`);
  L(`   - Blocks ${g.counts.total} questions, ${v1.length} of value 1${v1.length ? `: ${v1.slice(0, 18).join(", ")}${v1.length > 18 ? `, … (+${v1.length - 18})` : ""}` : ""}.`);
}
L();
L("## 8. Readiness disagreements across packets (spread ≥ 2 among the packets' own scores)");
L();
L("| id | merged readiness | packet scores | basis |");
L("| --- | ---: | --- | --- |");
for (const e of entries.filter((e) => e._spread >= 2)) {
  L(`| \`${e.id}\` | ${rr(e.readiness)} | ${e.seenAs.filter((s) => !s.alias.startsWith("D11:")).map((s) => `${s.alias.split(":")[0]} ${trunc(s.readiness, 40)}`).join("; ")} | ${trunc(e.readinessBasis, 120)} |`);
}
L();
L("## 9. Identifier schemes: kernel register coverage and tool routes");
L();
L(`Reconciled ${recon.length} scheme codes (K register v${kreg.version}: ${kreg.schemes.length} codes, ${kreg.schemes.filter((s) => s.status === "requested").length} of them \`requested\`; node registers of all packets: ${nodeSchemes.size} codes; D11 bridge rows). Full table: generated block at the end of \`identifier-bridges.yaml\`.`);
L();
L(`- **Missing from the K register** (requests to K in \`11-open-questions.md\`): ${missingFromK.map((r) => `\`${r.code}\` (${[...r.usedByNodeTypes, ...(r.d11BridgeRow.length ? ["D11 bridge"] : []), ...(optionalD11.includes(r.code) ? ["D11 optional"] : [])].join(", ")})`).join("; ")}.`);
const noRoute = recon.filter((r) => r.usedByNodeTypes.length && !r.routes.length);
L(`- **Used by a node register but no registry entry emits it** (no detected authority route): ${noRoute.map((r) => `\`${r.code}\``).join(", ") || "none"}.`);
const weakRoute = recon.filter((r) => r.usedByNodeTypes.length && r.routes.length && (r.bestRouteReadiness ?? 0) <= 1);
L(`- **Best route at readiness ≤ 1**: ${weakRoute.map((r) => `\`${r.code}\` (${r.routes[0]})`).join(", ") || "none"}.`);
const diffs = recon.filter((r) => r.patternDiff);
L(`- **Pattern differences between D11 bridge rows and K**: ${diffs.map((r) => `\`${r.code}\`: ${r.patternDiff.join("; ")}`).join(" · ") || "none"}.`);
L();
L("## 10. Method and caveats");
L();
L("- Deduplication is a judgment recorded line by line in `_notes/action-space/merge-spec.yaml` (`rules`); the script refuses any packet row no rule matches. Source families reached through one provider API (SEC forms, Europe PMC JATS sections, FDA web pages) merge into the provider entry; distinct routes with different readiness (CT.gov v2 vs its blocked history, FDC API vs its undocumented portal JSON, Europe PMC metadata vs JATS full text) stay separate.");
L("- `blockedQuestions` means \"questions that need it\" (populatedBy, `02` sources column, or a question id in the `08` row). S-key citations in the sources column (`S12`, `[S28]–[S31]`) are expanded to their definition lines in the packet's `01-ecosystem.md` (URL and title) before matching; K and D10 name sources in words. Pattern matching is approximate: it can credit a tool that a source was merely fetched through.");
L("- `exercisedBy` combines each packet's own `exercised` cell with tool-log pattern hits; a hit is a log line that mentions the tool, which includes recorded failures (a failed call is still an exercise and a readiness finding).");
L("- Readiness when packets disagree: D11's score stands for D11-local entries unless an override with a reason is listed; other entries take the lower median of the packets' current scores (\"0 today / 3 with a key\" counts as 0).");
L(`- Unresolved references: ${unresolvedPopulatedBy.length} populatedBy ids not found in any \`08\` row${unresolvedPopulatedBy.length ? ` (${unresolvedPopulatedBy.join(", ")})` : ""}; ${unknownQ.size} question ids named in rows or gaps but absent from every \`02\`${unknownQ.size ? ` (${qsort(unknownQ).join(", ")})` : ""}.`);
L();
const scorecard = md.join("\n");

// ------------------------------------------------------------------ identifier-bridges generated block
const BEGIN = "# >>> GENERATED: kernel-register reconciliation (build-action-space.mjs; do not edit inside the markers)";
const END = "# <<< GENERATED: kernel-register reconciliation";
const reconDoc = new YAML.Document({
  reconciliation: {
    generatedBy: "schema/program/packets/D11/_notes/action-space/build-action-space.mjs",
    kernelRegister: `packets/K/identifier-schemes.yaml v${kreg.version} (${kreg.schemes.length} codes)`,
    legend: "kernel: seed | requested | missing (not in K). usedByNodeTypes: every packet's 06-node-register identifierSchemes. d11BridgeRow: D11 scheme rows whose kernelCode is this code. routes: action-space entries whose identifiersEmitted mention the scheme (heuristic; readiness in brackets).",
    missingFromKernel: missingFromK.map((r) => r.code),
    schemes: recon,
  },
});
YAML.visit(reconDoc, { Seq(_, node) { if (node.items.every((i) => YAML.isScalar(i))) node.flow = true; }, Map(_, node) { if (node.items.some((p) => p.key?.value === "code")) node.flow = true; } });
quoteFlowScalars(reconDoc);
const bridgesText = read(resolve(D11, "identifier-bridges.yaml"));
const block = `${BEGIN}\n${reconDoc.toString({ lineWidth: 0 })}${END}\n`;
const newBridges = bridgesText.includes(BEGIN)
  ? bridgesText.slice(0, bridgesText.indexOf(BEGIN)) + block + bridgesText.slice(bridgesText.indexOf(END) + END.length + 1)
  : bridgesText.replace(/\n*$/, "\n\n") + block;

// ------------------------------------------------------------------ write / check
if (errors.length) { console.error("ERRORS:\n  " + errors.join("\n  ")); process.exit(1); }
const outputs = [
  [resolve(D11, "tooling/action-space.yaml"), actionSpace],
  [resolve(D11, "tooling/readiness-scorecard.md"), scorecard],
  [resolve(D11, "identifier-bridges.yaml"), newBridges],
];
let drift = 0;
for (const [f, text] of outputs) {
  if (CHECK) { if (!existsSync(f) || read(f) !== text) { console.error(`drift: ${f}`); drift++; } }
  else writeFileSync(f, text, "utf8");
}
YAML.parse(actionSpace); // the output must parse
YAML.parse(newBridges);
console.log(JSON.stringify({ entries: entries.length, external: external.length, internal: internal.length, aliases: Object.keys(aliasMap).length, packetRows: rowCount, readinessExternal: de, readinessInternal: di, priority: prioDist, topGaps: gaps.slice(0, 6).map((g) => `${g.id} ${g.counts.total}q/${g.counts.value1}v1 score ${g.counts.score}`), missingFromK: missingFromK.map((r) => r.code), unknownQuestionIds: qsort(unknownQ), unresolvedPopulatedBy, warnings }, null, 1));
if (CHECK && drift) process.exit(1);
