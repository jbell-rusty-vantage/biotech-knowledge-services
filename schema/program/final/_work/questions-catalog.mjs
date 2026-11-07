#!/usr/bin/env node
/**
 * Builds final/questions-catalog.md: every question row of every packet's 02-questions.md, de-duplicated, with
 * audience, value, polarity, answer kind (packet's declaration and D10's ruling), pattern reference, fixture status and
 * whether it survived synthesis. Deterministic (no timestamps); re-run after any input changes:
 *
 *   node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/questions-catalog.mjs
 *
 * Inputs (all read-only, paths relative to schema/program/):
 *   packets/<P>/02-questions.md            question rows (id · question · audience · value · polarity · answer kind · …)
 *   packets/<P>/03-retrieval-patterns.md   pattern headings (fallback pattern reference)
 *   packets/<P>/05-relationship-register.yaml  relationship types citing each question before synthesis
 *   packets/<P>/07-fixtures/<f>/questions.md   fixture folders citing each question
 *   packets/D10/answer-kind-table.md       D10's answer-kind ruling per (id, packet)
 *   PLAN.md                                domain names (table "| K | **Kernel …** |")
 *   final/relationship-register.yaml       relationship types citing each question after synthesis
 *   final/seams.yaml (cutEdges)            pairs cut in synthesis, with their questions and ruling
 *   final/_work/rulings.yaml               edit-question / edit-pattern ops per question
 *   final/decision-report.md               "Deciding question" lines per ruling
 *   final/query-patterns.md                (optional) canonical pattern sections; used when it mentions the id
 *   final/fixtures/cross-domain/<f>/questions.md (optional) cross-domain fixtures
 *
 * Matching (de-duplication):
 *   1. Same id in several packets = one question (shared catalog CQ-* ids). Value = lowest declared (R-08); audiences =
 *      union; polarity = harm if any packet declares harm (both shown when they differ); fixture = yes if any packet's
 *      row says yes; answer kind shown per packet. Exception: CQ-PF-03 is split per R-08 into CQ-PF-03a (D8) and
 *      CQ-PF-03b (D6), two rows.
 *   2. A row whose question cell names another packet's row id ("reuses CQ-…") is linked, not merged: the reusing row
 *      bundles several catalog questions or adds facets, so the two rows are listed with a cross-reference.
 *   3. Text check: word-set Jaccard >= 0.30 (stop words dropped, "reuses …" clauses dropped) between rows of different
 *      packets with different ids. Each pair is listed; pairs in REVIEWED below were read and kept separate.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const finalDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const programDir = resolve(finalDir, "..");
const packetsDir = resolve(programDir, "packets");
const require = createRequire(resolve(programDir, "../../packages/schema-workspace/package.json"));
const YAML = require("yaml");
const outFile = resolve(finalDir, "questions-catalog.md");

const PACKETS = ["K", ...Array.from({ length: 13 }, (_, i) => `D${i + 1}`)];
const AUDIENCES = ["biohacker", "investor", "researcher", "agent"];
const KINDS = ["retrieved", "materialized", "assessment", "published"];
const POLARITIES = ["harm", "benefit", "neutral"];
const ID_RE = /\b(?:Q-[A-Z0-9]+-\d+[a-z]?|CQ-[A-Z]{2}-\d+[a-z]?)\b/g;
const JACCARD_MIN = 0.3;
// Pattern status (close-out round 2026-10-09, FU-04). The fix stage hard-coded the broken list below; it is kept for the
// record only (PATTERN_BROKEN_FIX_STAGE, not read). The status is now computed from two generated reports:
//   final/_work/pattern-lint.json          lint-packet-patterns.mjs: one block per packet pattern, class ok | fragment |
//                                          gds-unvalidated | packetBug | rulingBroken (with the rulings that broke it)
//   final/_work/by-question/<P>.json       validate-by-question.mjs over final/patterns-by-question/<P>.md: the final-SDL
//                                          rewrite of a broken block, status ok | gds-unvalidated | fragment | failing
// Per (packet, id): "final" when a rewrite validated ok or gds-unvalidated; else "broken" when the lint class is packetBug
// or rulingBroken; else "ok" when a lint block exists (ok, fragment, gds-unvalidated); else "none". A question is
// "pattern broken" when any of its packet rows is broken; it has a "valid pattern" when it is not broken and some row is
// ok or final, or a final/query-patterns.md section names it.
const PATTERN_BROKEN_FIX_STAGE = {
  "CQ-ID-04": "D1 03 line 214 reads (Identifier)-[:HAS_IDENTIFIER]->(s); the SDL stores Subjectable-[:HAS_IDENTIFIER]->Identifier (Identifier.identifies is direction IN)",
  "Q-D1-06": "D1 03 line 234 reads (Identifier)-[:HAS_IDENTIFIER]->(x); stored direction is Subjectable → Identifier",
  "Q-D1-15": "D1 03 line 460 reads (Identifier)-[:HAS_IDENTIFIER]->(t); stored direction is Subjectable → Identifier",
  "Q-D1-26": "D1 03 lines 666 and 670 read (Identifier)-[:HAS_IDENTIFIER]->(node); stored direction is Subjectable → Identifier",
  "Q-D2-11": "D2 03 line 433 reads (Identifier)-[:HAS_IDENTIFIER]->(x); stored direction is Subjectable → Identifier",
  "Q-D2-16": "D2 03 line 526 reads (Assessment)-[:ASSESSES]->(cl:Assertion); Assessment.about targets Subjectable and Assertion implements Entity only, so asm.verdict is always null",
  "Q-D8-23": "D8 03 lines 622 and 624 read LegalStatus-[:STATUS_OF]->Device and RegulatoryRecord-[:CONCERNS]->Device; R-72 cut both pairs (LegalStatusSubject and RegulatoryRecordTopic have no Device member)",
  "Q-D12-03": "D12 03 line ~105 reads (QualityResult)-[:RESULT_FOR]->(Product); RESULT_FOR is D3 StudyResult → OutcomeDefinition and QUALITY_RESULT_FOR → Product was cut by R-73 (OD-10 / R-95)",
  "Q-D12-05": "D12 03 line 153 reads (Identifier)-[:HAS_IDENTIFIER]->(f); stored direction is Subjectable → Identifier",
  "Q-D12-06": "D12 03 line 169 reads (QualityResult)-[:RESULT_FOR]->(Product); see Q-D12-03 (R-73, OD-10 / R-95)",
  "Q-D12-34": "D12 03 line 761 reads (Identifier)-[:HAS_IDENTIFIER]->(n); stored direction is Subjectable → Identifier",
};
// Pairs found by matching rule 3 that were read and kept as separate questions (reason recorded).
const REVIEWED_RAW = {
  "Q-K-14|Q-D10-17": "K asks whether the verifier re-selects the span for an entity mention; D10 asks for the retrieval trace of an answer (which chunks were retrieved and which locator/snapshot backs each sentence). Same path, different payload.",
  "CQ-MF-01|Q-D1-16": "D1 asks which branded material is in product P and who owns the mark; CQ-MF-01 asks who manufactures, supplies or only markets X. Overlapping roles, different subject.",
  "Q-D2-28|Q-K-08": "D2 is restricted to a mechanism claim in humans; K is any claim, with the mission and report lineage.",
  "Q-D7-20|Q-D9-16": "Both are coverage-of-absence questions; D7 is about financial-interest disclosure sources, D9 about recommendation/disclosure containers and renditions.",
  "CQ-ID-06|CQ-ST-02": "CQ-ID-06 identifies the administered material; CQ-ST-02 matches it to a product on sale and checks delivered dose.",
};

const pairKey = (a, b) => [a, b].sort().join("|");
const REVIEWED = Object.fromEntries(Object.entries(REVIEWED_RAW).map(([k, v]) => [pairKey(...k.split("|")), v]));
const read = (p) => readFileSync(p, "utf8");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 12);
const rel = (p) => relative(programDir, p).replace(/\\/g, "/");
const inputs = [];
const use = (p) => { inputs.push(p); return p; };
const splitRow = (line) => line.split(/(?<![\\])\|/).slice(1, -1).map((c) => c.trim());
const slug = (h) => h.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
const esc = (s) => String(s).replace(/(?<![\\])\|/g, "\\|").replace(/\r?\n/g, " ");
const pct = (n, d) => (d ? `${((100 * n) / d).toFixed(1)}%` : "n/a");

// ---------- domains (PLAN.md) ----------
const domain = {};
for (const line of read(use(resolve(programDir, "PLAN.md"))).split(/\r?\n/)) {
  const m = line.match(/^\|\s*(K|D\d+)\s*\|\s*\*\*([^*]+)\*\*/);
  if (m && !domain[m[1]]) domain[m[1]] = m[2].trim();
}
for (const p of PACKETS) if (!domain[p]) throw new Error(`no domain name for ${p} in PLAN.md`);

// ---------- question rows ----------
const rows = []; // one per (packet, id)
for (const p of PACKETS) {
  const file = use(resolve(packetsDir, p, "02-questions.md"));
  let header = null, order = 0;
  for (const line of read(file).split(/\r?\n/)) {
    if (!line.startsWith("|")) { header = line.trim() === "" ? header : null; continue; }
    const c = splitRow(line);
    if (c[0] === "id") { header = c; continue; }
    if (!header || header[1] !== "question") continue;
    const id = c[0].replace(/[`*]/g, "");
    if (!/^(Q|CQ)-/.test(id)) continue;
    if (c.length !== header.length) throw new Error(`${p} ${id}: ${c.length} cells, header has ${header.length}`);
    const get = (k) => c[header.indexOf(k)];
    rows.push({
      packet: p, id, order: order++, question: get("question"),
      audiences: get("audience").split(/\s*,\s*/).map((a) => a.toLowerCase()).filter(Boolean),
      value: Number(get("value")), polarity: get("polarity").toLowerCase(), declared: get("answer kind").toLowerCase(),
      shape: get("answer shape"), sources: get("sources"), fixtureCell: get("fixture"),
    });
  }
}
for (const r of rows) {
  for (const a of r.audiences) if (!AUDIENCES.includes(a)) throw new Error(`${r.packet} ${r.id}: audience ${a}`);
  if (![1, 2, 3].includes(r.value)) throw new Error(`${r.packet} ${r.id}: value ${r.value}`);
  if (!POLARITIES.includes(r.polarity)) throw new Error(`${r.packet} ${r.id}: polarity ${r.polarity}`);
  if (!KINDS.includes(r.declared)) throw new Error(`${r.packet} ${r.id}: kind ${r.declared}`);
}

// ---------- D10 answer-kind rulings ----------
const d10 = new Map(); // `${packet}|${id}` -> ruling text
{
  const file = use(resolve(packetsDir, "D10", "answer-kind-table.md"));
  let inTable = false;
  for (const line of read(file).split(/\r?\n/)) {
    if (/^## Table/.test(line)) { inTable = true; continue; }
    if (!inTable || !line.startsWith("| ")) continue;
    const c = splitRow(line);
    if (c.length !== 11 || !/^(Q|CQ)-/.test(c[0])) continue;
    d10.set(`${c[1]}|${c[0]}`, c[7].replace(/\s*⚑\s*/g, " ").trim()); // D10 marks its own disagreements with ⚑
  }
}
const missingD10 = rows.filter((r) => !d10.has(`${r.packet}|${r.id}`)).map((r) => `${r.packet}:${r.id}`);

// ---------- pattern headings (packets) and final/query-patterns.md ----------
const patternRef = new Map(); // `${packet}|${id}` -> ref
const patternIssues = [];
for (const p of PACKETS) {
  const file = use(resolve(packetsDir, p, "03-retrieval-patterns.md"));
  const heads = new Map(), mentions = new Map();
  let cur = null;
  for (const line of read(file).split(/\r?\n/)) {
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      cur = h[2];
      for (const m of cur.matchAll(ID_RE)) if (!heads.has(m[0])) heads.set(m[0], cur);
      continue;
    }
    if (cur) for (const m of line.matchAll(ID_RE)) if (!mentions.has(m[0])) mentions.set(m[0], cur);
  }
  for (const r of rows.filter((x) => x.packet === p)) {
    const base = `packets/${p}/03-retrieval-patterns.md`;
    if (heads.has(r.id)) patternRef.set(`${p}|${r.id}`, `${base}#${slug(heads.get(r.id))}`);
    else if (mentions.has(r.id)) { patternRef.set(`${p}|${r.id}`, `${base}#${slug(mentions.get(r.id))}`); patternIssues.push(`${p}:${r.id} has no heading of its own; referenced under "${mentions.get(r.id)}"`); }
    else { patternRef.set(`${p}|${r.id}`, `${base} (not found)`); patternIssues.push(`${p}:${r.id} not found in ${base}`); }
  }
}
const qpFile = resolve(finalDir, "query-patterns.md");
const qpSections = new Map(); // id -> [slug]
const qpPresent = existsSync(qpFile);
if (qpPresent) {
  use(qpFile);
  let cur = null;
  for (const line of read(qpFile).split(/\r?\n/)) {
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) cur = h[2];
    if (!cur) continue;
    for (const m of line.matchAll(ID_RE)) {
      const l = qpSections.get(m[0]) ?? [];
      const s = slug(cur);
      if (!l.includes(s)) l.push(s);
      qpSections.set(m[0], l);
    }
  }
}

// ---------- pattern status: packet lint + validated final-SDL rewrites (FU-04) ----------
const lintFile = resolve(finalDir, "_work", "pattern-lint.json");
const lintPresent = existsSync(lintFile);
const lintBlocks = new Map(); // `${packet}|${id}` -> [{cls, rulings}]
if (lintPresent) {
  for (const b of JSON.parse(read(use(lintFile))).blocks ?? []) {
    if (!b.question) continue;
    const k = `${b.packet}|${b.question}`;
    const l = lintBlocks.get(k) ?? [];
    l.push({ cls: b.class, rulings: b.rulings ?? [] });
    lintBlocks.set(k, l);
  }
}
const pbqDir = resolve(finalDir, "patterns-by-question");
const finalVersions = new Map(); // `${packet}|${id}` -> {ref, status}
if (existsSync(pbqDir)) {
  for (const f of readdirSync(pbqDir).filter((x) => x.endsWith(".md")).sort()) {
    const p = f.replace(/\.md$/, "");
    const md = use(resolve(pbqDir, f));
    const heads = new Map();
    for (const line of read(md).split(/\r?\n/)) {
      const h = line.match(/^##\s+(.*)$/);
      if (h) for (const m of h[1].matchAll(ID_RE)) if (!heads.has(m[0])) heads.set(m[0], h[1]);
    }
    const jf = resolve(finalDir, "_work", "by-question", `${p}.json`);
    if (!existsSync(jf)) continue;
    for (const q of JSON.parse(read(use(jf))).questions ?? []) {
      if (!heads.has(q.id)) continue;
      finalVersions.set(`${p}|${q.id}`, { ref: `final/patterns-by-question/${f}#${slug(heads.get(q.id))}`, status: q.class ?? q.status });
    }
  }
}
const VALID_FINAL = new Set(["ok", "gds-unvalidated"]);
const rowPattern = (p, id) => {
  const fv = finalVersions.get(`${p}|${id}`);
  const bl = lintBlocks.get(`${p}|${id}`) ?? [];
  const bad = bl.filter((b) => b.cls === "packetBug" || b.cls === "rulingBroken");
  const rulings = [...new Set(bad.flatMap((b) => b.rulings))];
  if (fv && VALID_FINAL.has(fv.status)) return { status: "final", ref: fv.ref, rulings, finalStatus: fv.status };
  if (bad.length) return { status: "broken", cls: bad[0].cls, rulings, ref: fv?.ref, finalStatus: fv?.status };
  if (bl.length) return { status: "ok" };
  return { status: "none" };
};

// ---------- fixtures ----------
const fixtureFolders = new Map(); // id -> Set("P/folder")
const addFx = (id, label) => { const s = fixtureFolders.get(id) ?? new Set(); s.add(label); fixtureFolders.set(id, s); };
for (const p of PACKETS) {
  const dir = resolve(packetsDir, p, "07-fixtures");
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).sort()) {
    const q = resolve(dir, f, "questions.md");
    if (!existsSync(q)) continue;
    use(q);
    for (const m of new Set([...read(q).matchAll(ID_RE)].map((x) => x[0]))) addFx(m, `${p}/${f}`);
  }
}
const xdDir = resolve(finalDir, "fixtures", "cross-domain");
const xdFolders = [];
if (existsSync(xdDir)) {
  for (const f of readdirSync(xdDir).sort()) {
    const q = resolve(xdDir, f, "questions.md");
    if (!statSync(resolve(xdDir, f)).isDirectory() || !existsSync(q)) continue;
    use(q); xdFolders.push(f);
    for (const m of new Set([...read(q).matchAll(ID_RE)].map((x) => x[0]))) addFx(m, `final/cross-domain/${f}`);
  }
}

// ---------- relationships before and after synthesis ----------
const stripPrefix = (q) => String(q).trim().replace(/^[A-Z0-9]+:(?=(?:Q|CQ)-)/, "");
const addTo = (m, q, v) => { const k = stripPrefix(q); const s = m.get(k) ?? new Set(); s.add(v); m.set(k, s); };
const isPredicateRow = (t) => /predicate/i.test(String(t));
const isCut = (st) => /^cut/i.test(String(st ?? ""));
// before: typed relationships each packet's register declares, plus typed seam rows of its 10-seams.yaml
const before = new Map(); // id -> Set("P:TYPE")
const beforeReg = new Map(); // id -> Set("P:TYPE"), packet registers only
const afterReg = new Map(); // id -> Set("P:TYPE"), merged register only
for (const p of PACKETS) {
  const reg = YAML.parse(read(use(resolve(packetsDir, p, "05-relationship-register.yaml"))));
  for (const e of reg.relationships ?? []) for (const q of e.questions ?? []) { addTo(before, q, `${p}:${e.type}`); addTo(beforeReg, q, `${p}:${e.type}`); }
  const sm = YAML.parse(read(use(resolve(packetsDir, p, "10-seams.yaml"))));
  for (const s of sm.seams ?? []) if (!isPredicateRow(s.type)) for (const q of s.questions ?? []) addTo(before, q, `${p}:${String(s.type).split(" ")[0]}`);
}
// after: typed relationships of the merged register and live (not cut) relationship seam rows
const finalReg = YAML.parse(read(use(resolve(finalDir, "relationship-register.yaml"))));
const after = new Map(); // id -> Set("TYPE")
for (const e of finalReg.relationships) for (const q of e.questions ?? []) { addTo(after, q, String(e.type)); addTo(afterReg, q, `${e.module}:${e.type}`); }
const seams = YAML.parse(read(use(resolve(finalDir, "seams.yaml"))));
for (const s of seams.seams ?? []) if (!isCut(s.status) && !isPredicateRow(s.type)) for (const q of s.questions ?? []) addTo(after, q, String(s.type).split(" ")[0]);
// crossModuleEdges is not read: its questions are the union over every seam row of a pair, cut rows included
// predicate routes after synthesis (fallbacks for a cut edge)
const predicates = new Map(); // id -> Set("PREDICATE")
for (const s of seams.predicateSeams ?? []) for (const q of s.questions ?? []) addTo(predicates, q, String(s.predicate ?? s.type).split(" ")[0]);
for (const e of finalReg.predicateOnly ?? []) for (const m of `${e.promoteWhen ?? ""} ${(e.questions ?? []).join(" ")}`.matchAll(ID_RE)) addTo(predicates, m[0], String(e.predicate).split(" ")[0]);
const seamCutStatus = (c) => (seams.seams ?? []).find((s) => s.module === c.module && s.type === c.type && s.from === c.from && isCut(s.status))?.status;
const cutBy = new Map(); // id -> [{label, ruling, contested}]
for (const c of seams.cutEdges ?? []) {
  const st = String(seamCutStatus(c) ?? "");
  const stRuling = [...st.matchAll(/R-\d+/g)].map((m) => m[0]).join(", ");
  const noteRuling = (String(c.note ?? "").match(/R-\d+/) ?? [])[0];
  const contested = /contested/i.test(st) || (!c.ruling && !stRuling);
  const ruling = c.ruling ? String(c.ruling) : stRuling ? `${stRuling}${contested ? " (contested)" : ""}` : noteRuling ? `${noteRuling} (contested: seam row has no ruling)` : "no ruling";
  for (const q of c.questions ?? []) {
    const l = cutBy.get(stripPrefix(q)) ?? [];
    l.push({ label: `${c.type} ${String(c.from).split(" ")[0]}→${String(c.to).split(" (")[0]} (${c.module} row)`, ruling, contested });
    cutBy.set(stripPrefix(q), l);
  }
}

// ---------- rulings touching questions ----------
const rulings = YAML.parse(read(use(resolve(finalDir, "_work", "rulings.yaml"))));
const edits = new Map(); // id -> [ "R-xx op: change" ]
for (const [mod, list] of Object.entries(rulings.modules ?? {})) for (const e of list ?? []) {
  const qs = [...(e.questions ?? []), ...(e.question ? [e.question] : [])];
  if (!qs.length || !/^edit-(question|pattern)$/.test(e.op)) continue;
  for (const q of qs) {
    const l = edits.get(q) ?? [];
    const t = `${e.ruling} ${e.op} (${mod}): ${e.change ?? e.note ?? ""}`;
    if (!l.includes(t)) l.push(t);
    edits.set(q, l);
  }
}
const deciding = new Map(); // id -> Set(R-xx)
{
  let cur = null;
  for (const line of read(use(resolve(finalDir, "decision-report.md"))).split(/\r?\n/)) {
    const h = line.match(/^#### (R-\d+|I-\d+) /);
    if (h) { cur = h[1]; continue; }
    if (cur && /^- \*\*Deciding question:\*\*/.test(line)) for (const m of line.matchAll(ID_RE)) {
      const s = deciding.get(m[0]) ?? new Set(); s.add(cur); deciding.set(m[0], s);
    }
  }
}

// module-editor runlogs: the ruling that dropped question q from type T is the last R-xx before q on a line naming T
const runlogLines = new Map();
const runlogRuling = (mod, type, q) => {
  if (!runlogLines.has(mod)) {
    const f = resolve(finalDir, "_runlog", `module-${mod}.md`);
    runlogLines.set(mod, existsSync(f) ? read(use(f)).split(/\r?\n/) : []);
  }
  const out = [];
  for (const line of runlogLines.get(mod)) {
    const at = line.indexOf(q);
    if (at < 0 || !line.includes(type)) continue;
    const r = [...line.slice(0, at).matchAll(/R-\d+/g)].pop();
    if (r) out.push(r[0]);
  }
  return out;
};

// ---------- merge into catalog entries ----------
const SPLIT = { "CQ-PF-03": { D8: "CQ-PF-03a", D6: "CQ-PF-03b" } }; // R-08
const entries = new Map(); // catalog id -> entry
for (const r of rows) {
  const cid = SPLIT[r.id]?.[r.packet] ?? r.id;
  const e = entries.get(cid) ?? { id: cid, rows: [] };
  e.rows.push(r);
  entries.set(cid, e);
}
const kindOf = (r) => d10.get(`${r.packet}|${r.id}`) ?? "(no D10 row)";
const kindBase = (k) => k.split(" ")[0];
for (const e of entries.values()) {
  const rs = e.rows;
  e.owner = rs[0].packet;
  e.packets = rs.map((r) => r.packet);
  e.sourceIds = [...new Set(rs.map((r) => r.id))];
  e.value = Math.min(...rs.map((r) => r.value));
  e.audiences = AUDIENCES.filter((a) => rs.some((r) => r.audiences.includes(a)));
  e.firstAudience = rs[0].audiences[0];
  e.polarity = rs.some((r) => r.polarity === "harm") ? "harm" : rs.some((r) => r.polarity === "benefit") ? "benefit" : "neutral";
  e.polarityText = new Set(rs.map((r) => r.polarity)).size > 1 ? rs.map((r) => `${r.polarity} (${r.packet})`).join(" / ") : e.polarity;
  e.valueText = new Set(rs.map((r) => r.value)).size > 1 ? `${e.value} (${rs.map((r) => `${r.packet} v${r.value}`).join(", ")}; R-08)` : String(e.value);
  e.kinds = rs.map((r) => ({ packet: r.packet, declared: r.declared, ruling: kindOf(r) }));
  e.ruling = kindBase(e.kinds[0].ruling);
  e.rulingVariants = [...new Set(e.kinds.map((k) => k.ruling))];
  e.disagree = e.kinds.some((k) => kindBase(k.ruling) !== k.declared);
  e.kindText = e.kinds.map((k) => {
    const pre = rs.length > 1 ? `${k.packet}: ` : "";
    return kindBase(k.ruling) === k.declared && k.ruling === k.declared ? `${pre}${k.declared}` : `${pre}${k.declared} → ${k.ruling}${kindBase(k.ruling) !== k.declared ? " ⚑" : ""}`;
  }).join("; ");
  e.question = rs[0].question;
  e.altQuestions = rs.slice(1).filter((r) => r.question !== rs[0].question).map((r) => ({ packet: r.packet, question: r.question }));
  // pattern
  const qp = qpSections.get(e.id) ?? (e.id !== rs[0].id ? qpSections.get(rs[0].id) : undefined);
  e.patternRefs = qp ? qp.slice(0, 2).map((s) => `final/query-patterns.md#${s}`) : rs.map((r) => patternRef.get(`${r.packet}|${r.id}`));
  e.patternInFinal = Boolean(qp);
  e.rowPatterns = rs.map((r) => ({ packet: r.packet, id: r.id, ...rowPattern(r.packet, r.id) }));
  const finalRefs = e.rowPatterns.filter((x) => x.status === "final").map((x) => x.ref);
  if (finalRefs.length) e.patternRefs = [...new Set([...finalRefs, ...e.patternRefs])];
  e.patternBroken = e.rowPatterns.filter((x) => x.status === "broken");
  e.patternFinal = e.rowPatterns.filter((x) => x.status === "final");
  e.patternValid = !e.patternBroken.length && (e.patternInFinal || e.rowPatterns.some((x) => x.status === "ok" || x.status === "final"));
  // fixtures
  const declaredYes = rs.filter((r) => /^yes/i.test(r.fixtureCell)).map((r) => r.packet);
  const folders = [...(fixtureFolders.get(e.id) ?? []), ...(e.id !== rs[0].id ? fixtureFolders.get(rs[0].id) ?? [] : [])];
  e.fixtureFolders = [...new Set(folders)].sort();
  e.fixture = declaredYes.length ? "yes" : "no";
  e.fixtureNote = !declaredYes.length && e.fixtureFolders.length ? "declared no; named in a fixture questions.md" : declaredYes.length && !e.fixtureFolders.length ? "declared yes; no fixture questions.md names the id" : "";
  e.fixtureText = rs.length > 1 && new Set(rs.map((r) => /^yes/i.test(r.fixtureCell))).size > 1 ? `yes (${declaredYes.join(", ")}); no (${rs.filter((r) => !/^yes/i.test(r.fixtureCell)).map((r) => r.packet).join(", ")})` : e.fixture;
  // survival
  const ids = e.sourceIds.concat(e.id !== rs[0].id ? [e.id] : []);
  const aft = new Set(ids.flatMap((i) => [...(after.get(i) ?? [])]));
  // a split id (R-08) keeps only the relationships its own packet's register cited
  const bef = new Set(ids.flatMap((i) => [...(before.get(i) ?? [])]).filter((t) => e.id === rs[0].id || e.packets.includes(t.split(":")[0])));
  const cuts = ids.flatMap((i) => cutBy.get(i) ?? []);
  // a split id (R-08) keeps only the edits made in its own packet's module
  const ed = ids.flatMap((i) => edits.get(i) ?? []).filter((x) => e.id === rs[0].id || e.packets.some((p) => x.includes(` (${p}):`)));
  e.typesAfter = [...aft].sort();
  e.predicatesAfter = [...new Set(ids.flatMap((i) => [...(predicates.get(i) ?? [])]))].sort();
  e.cuts = cuts;
  e.edits = [...new Set(ed)];
  e.deciding = [...new Set(ids.flatMap((i) => [...(deciding.get(i) ?? [])]))].sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)));
  const cutRulings = [...new Set(cuts.map((c) => c.ruling))];
  const regAfter = new Set(ids.flatMap((i) => [...(afterReg.get(i) ?? [])]));
  const lost = [...new Set(ids.flatMap((i) => [...(beforeReg.get(i) ?? [])]))].filter((t) => (e.id === rs[0].id || e.packets.includes(t.split(":")[0])) && !regAfter.has(t));
  let edR = [...new Set(e.edits.map((x) => x.split(" ")[0]))];
  if (lost.length && !edR.length) edR = [...new Set(lost.flatMap((t) => ids.flatMap((i) => runlogRuling(t.split(":")[0], t.split(":")[1], i))))];
  if (aft.size && !cuts.length && lost.length) e.survival = { code: "rerouted", text: `yes, rerouted${edR.length ? ` (${edR.join(", ")})` : " (no ruling found)"}: no longer cited by ${lost.join(", ")}` };
  else if (aft.size && !cuts.length) e.survival = { code: "kept", text: "yes" };
  else if (aft.size && cuts.length) e.survival = { code: "partial", text: `yes, pair cut: ${cuts.map((c) => `${c.label} ${c.ruling}`).join("; ")}` };
  else if (!aft.size && cuts.length) e.survival = { code: "cut", text: `CUT ${cutRulings.join(", ")}: only typed edge(s) ${cuts.map((c) => c.label).join("; ")} cut; ${e.predicatesAfter.length ? `predicate route(s) left: ${e.predicatesAfter.join(", ")}` : "no predicate route registered"}` };
  else if (!aft.size && bef.size) {
    const r = [...new Set(ed.map((x) => x.split(" ")[0]))];
    e.survival = { code: "rerouted", text: `yes, rerouted${r.length ? ` (${r.join(", ")})` : ""}: left ${[...bef].join(", ")}` };
  } else e.survival = { code: "noedge", text: "yes (no typed edge: kernel records, predicates or properties)" };
  e.survival.rulings = e.survival.code === "rerouted" ? (edR.length ? edR : [...new Set(ed.map((x) => x.split(" ")[0]))]) : [];
  if (e.patternBroken.length) {
    e.survival.broken = e.patternBroken.map((x) => `packets/${x.packet}/03 ${x.id}: ${x.cls}${x.rulings.length ? ` (${x.rulings.join(", ")})` : ""}${x.ref ? `; final rewrite ${x.ref} is ${x.finalStatus}` : "; no validated final-SDL rewrite"}`).join("; ");
    e.survival.text = `pattern broken (${e.survival.broken}); ${e.survival.text}`;
  } else if (e.patternFinal.length) {
    e.survival.text = `${e.survival.text}; final-SDL pattern: ${e.patternFinal.map((x) => `${x.ref} (${x.finalStatus}; packet pattern broken by ${x.rulings.join(", ") || "a ruling"})`).join("; ")}`;
  }
  e.contested = cuts.some((c) => c.contested);
}
const list = [...entries.values()];
const packetIndex = (p) => PACKETS.indexOf(p);
const byPacketOrder = (a, b) => packetIndex(a.owner) - packetIndex(b.owner) || a.rows[0].order - b.rows[0].order;
list.sort(byPacketOrder);

// ---------- matching rules 2 and 3 ----------
const rowIds = new Set(rows.map((r) => r.id));
const links = []; // {from: "P:id", to: id, packets}
for (const r of rows) {
  const refs = [...new Set([...r.question.matchAll(ID_RE)].map((m) => m[0]))].filter((x) => x !== r.id && rowIds.has(x));
  for (const x of refs) {
    const others = rows.filter((o) => o.id === x && o.packet !== r.packet).map((o) => o.packet);
    if (others.length) links.push({ from: `${r.packet}:${r.id}`, to: x, packets: others });
  }
}
const linkMap = new Map();
for (const l of links) {
  const a = l.from.split(":")[1];
  for (const [k, v] of [[a, l.to], [l.to, a]]) { const s = linkMap.get(k) ?? new Set(); s.add(v); linkMap.set(k, s); }
}
const STOP = new Set("the a an of and or for to in on is are was were which what who how does do did with by from at as it its this that be any each their there than when whose under over into".split(" "));
const tok = (s) => new Set(s.toLowerCase().replace(/reuses[^.;)]*[.;)]/g, " ").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));
const toks = rows.map((r) => tok(r.question));
const similar = [];
for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
  if (rows[i].packet === rows[j].packet || rows[i].id === rows[j].id) continue;
  let n = 0; for (const w of toks[i]) if (toks[j].has(w)) n++;
  const J = n / (toks[i].size + toks[j].size - n);
  if (J >= JACCARD_MIN) similar.push({ J, a: rows[i], b: rows[j], key: pairKey(rows[i].id, rows[j].id) });
}
similar.sort((x, y) => y.J - x.J);

// ---------- counts ----------
const N = list.length;
const count = (f) => list.filter(f).length;
const harm = count((e) => e.polarity === "harm");
const audienceStats = AUDIENCES.map((a) => {
  const l = list.filter((e) => e.audiences.includes(a));
  return { a, n: l.length, first: l.filter((e) => e.firstAudience === a).length, v1: l.filter((e) => e.value === 1).length,
    v2: l.filter((e) => e.value === 2).length, v3: l.filter((e) => e.value === 3).length,
    harm: l.filter((e) => e.polarity === "harm").length, benefit: l.filter((e) => e.polarity === "benefit").length,
    neutral: l.filter((e) => e.polarity === "neutral").length,
    kinds: KINDS.map((k) => l.filter((e) => e.ruling === k).length) };
});
const declaredKindCount = (k) => rows.filter((r) => r.declared === k).length;
const rulingKindCountRows = (k) => rows.filter((r) => kindBase(kindOf(r)) === k).length;
const survivalCodes = ["kept", "partial", "rerouted", "noedge", "cut"];
const survivalLabel = { kept: "kept, typed edge(s) after synthesis", partial: "kept, but a pair it cited was cut", rerouted: "kept, pattern rerouted to another record", noedge: "kept, no typed edge ever (kernel records, predicates, properties)", cut: "only typed edge(s) cut" };

// ---------- render ----------
const L = [];
const P = (s = "") => L.push(s);
const aud = (e) => e.audiences.join(", ");
const idCell = (e) => {
  const extra = e.sourceIds.filter((x) => x !== e.id);
  return `**${e.id}**${extra.length ? ` (packet id ${extra.join(", ")})` : ""}`;
};
const pk = (e) => e.packets.join(" + ");
const surv = (e) => (e.survival.broken ? "**pattern broken**; " : "") + survCode(e);
const survCode = (e) => (e.survival.code === "kept" || e.survival.code === "noedge" ? "yes" : e.survival.code === "cut" ? `**CUT** ${[...new Set(e.cuts.map((c) => c.ruling))].join(", ")}` : e.survival.code === "partial" ? `partial (${[...new Set(e.cuts.map((c) => c.ruling))].join(", ")})` : `rerouted (${e.survival.rulings.join(", ") || "no ruling found"})`);

P("# Questions catalog (candidate v2)");
P();
P("GENERATED by `final/_work/questions-catalog.mjs` from the packets and the synthesis outputs; do not edit by hand. Edit a packet's `02-questions.md` (through its owner) or a synthesis input, then re-run:");
P();
P("```");
P("node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/questions-catalog.mjs");
P("```");
P();
P("Paths are relative to `schema/program/`. Every number on this page is computed by the script from the inputs listed at the end (with their sha256 prefixes).");
P();
P("## Header");
P();
P(`- **Distinct questions:** ${N}, from ${rows.length} question rows in ${PACKETS.length} packets (${new Set(rows.map((r) => r.id)).size} distinct packet ids). ${count((e) => e.packets.length > 1)} questions are asked by two or more packets and have one row here; CQ-PF-03 is split into CQ-PF-03a (D8) and CQ-PF-03b (D6) per R-08.`);
P(`- **Value:** 1 essential ${count((e) => e.value === 1)} · 2 foundational ${count((e) => e.value === 2)} · 3 expansion ${count((e) => e.value === 3)}. A shared id carries the lowest value any packet declares (R-08).`);
P(`- **Polarity:** harm ${harm} · benefit ${count((e) => e.polarity === "benefit")} · neutral ${count((e) => e.polarity === "neutral")}. **Harm share ${pct(harm, N)}** (directive floor: at least a third of the rows). A shared id counts as harm if any packet declares harm.`);
P(`- **Answer kind (D10 ruling, per question; first packet's ruling for shared ids):** ${KINDS.map((k) => `${k} ${count((e) => e.ruling === k)}`).join(" · ")}. ${count((e) => e.rulingVariants.some((v) => /published variant/.test(v)))} retrieved questions also have a published variant. ${count((e) => e.disagree)} questions carry a D10 ruling that differs from a packet's declaration (⚑, adopted by R-50).`);
P(`- **Answer kind per packet row (${rows.length} rows):** declared ${KINDS.map((k) => `${k} ${declaredKindCount(k)}`).join(" · ")}; D10 ruling ${KINDS.map((k) => `${k} ${rulingKindCountRows(k)}`).join(" · ")}.`);
P(`- **Fixture:** ${count((e) => e.fixture === "yes")} questions have a fixture (a packet row says yes), ${count((e) => e.fixture === "no")} do not. ${count((e) => e.fixtureNote.startsWith("declared yes"))} declared yes but no fixture \`questions.md\` names the id; ${count((e) => e.fixtureNote.startsWith("declared no"))} declared no but a fixture \`questions.md\` names the id (both lists under "Data checks"; the packet's column is what this catalog reports).`);
P(`- **Survived synthesis:** ${survivalCodes.map((c) => `${survivalLabel[c]} ${count((e) => e.survival.code === c)}`).join(" · ")}.`);
P(`- **Patterns (FU-04; ${lintPresent ? "`final/_work/pattern-lint.json` and `final/_work/by-question/*.json`" : "pattern-lint.json not present"}):** questions with a valid pattern ${count((e) => e.patternValid)} / ${N} (value 1: ${count((e) => e.value === 1 && e.patternValid)} / ${count((e) => e.value === 1)}). A pattern is valid when no packet row of the question is packetBug or rulingBroken in the lint, or when the broken row has a final-SDL rewrite in \`final/patterns-by-question/\` that validated ok (or gds-unvalidated); a question that only a \`final/query-patterns.md\` section names also counts. Validated final-SDL rewrites: ${count((e) => e.patternFinal.length)} questions. **Pattern broken** (a packet pattern cannot return rows against the assembled SDL and has no validated rewrite): ${count((e) => e.survival.broken)}${count((e) => e.survival.broken) ? ` (${list.filter((e) => e.survival.broken).map((e) => `${e.id} v${e.value}`).join(", ")})` : ""}. No pattern found: ${count((e) => !e.patternValid && !e.patternBroken.length)}${count((e) => !e.patternValid && !e.patternBroken.length) ? ` (${list.filter((e) => !e.patternValid && !e.patternBroken.length).map((e) => e.id).join(", ")})` : ""}.`);
P(`- **Pattern reference:** ${qpPresent ? `${count((e) => e.patternInFinal)} questions are covered by a section of \`final/query-patterns.md\`; the rest cite their packet's \`03-retrieval-patterns.md\`.` : "`final/query-patterns.md` was not present when this file was generated, so every question cites its packet's `03-retrieval-patterns.md` heading. Re-run the script after query-patterns.md lands to pick up its sections."}`);
P();
P("By audience (a question tagged with several audiences counts once in each; *first* = the audience its packet listed first; kinds are D10 rulings):");
P();
P("| audience | questions | listed first | value 1 | value 2 | value 3 | harm | benefit | neutral | harm share | retrieved | materialized | assessment | published |");
P("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
for (const s of audienceStats) P(`| ${s.a} | ${s.n} | ${s.first} | ${s.v1} | ${s.v2} | ${s.v3} | ${s.harm} | ${s.benefit} | ${s.neutral} | ${pct(s.harm, s.n)} | ${s.kinds.join(" | ")} |`);
P(`| **all** | ${N} | ${N} | ${count((e) => e.value === 1)} | ${count((e) => e.value === 2)} | ${count((e) => e.value === 3)} | ${harm} | ${count((e) => e.polarity === "benefit")} | ${count((e) => e.polarity === "neutral")} | ${pct(harm, N)} | ${KINDS.map((k) => count((e) => e.ruling === k)).join(" | ")} |`);
P();
P("By domain (owner packet; a shared question counts under each packet that asks it):");
P();
P("| packet | domain | questions | value 1 | harm | harm share | fixture yes | not kept (cut) | partial | rerouted |");
P("| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
for (const p of PACKETS) {
  const l = list.filter((e) => e.packets.includes(p));
  const h = l.filter((e) => e.polarity === "harm").length;
  P(`| ${p} | ${domain[p]} | ${l.length} | ${l.filter((e) => e.value === 1).length} | ${h} | ${pct(h, l.length)} | ${l.filter((e) => e.fixture === "yes").length} | ${l.filter((e) => e.survival.code === "cut").length} | ${l.filter((e) => e.survival.code === "partial").length} | ${l.filter((e) => e.survival.code === "rerouted").length} |`);
}
P();
P("### How the columns are read");
P();
P("- **id(s):** the catalog id; when it differs from the packet id (the R-08 split) the packet id follows. **Packets** lists every packet that asks the question; the first is the row whose wording is shown.");
P("- **kind:** `declared → D10 ruling`; a bare kind means the two agree. ⚑ marks a disagreement; R-50 adopts the D10 ruling. *(+ published variant)* means the default answer is retrieved and a signed Report{COMPARISON} or avoidance Report is the published variant.");
P("- **pattern:** `final/patterns-by-question/<P>.md#<id>` first when the packet pattern was broken by a ruling and its final-SDL rewrite validated; then `final/query-patterns.md#section` when the canonical pattern file covers the question, else `packets/<P>/03-retrieval-patterns.md#<heading>`.");
P("- **fixture:** the packet's own fixture column (yes when any packet asking it says yes); the master table also names the fixture folders whose `questions.md` cite the id.");
P("- **survived:** *yes* when the question keeps a typed edge (cited by \`final/relationship-register.yaml\` or a live row of \`final/seams.yaml\`) or never had one; *partial (R-xx)* when one pair it cited was cut but other typed edges remain; *rerouted (R-xx)* when its pattern moved to another record by ruling; ***CUT* R-xx** when every typed edge it cited was cut (the ruling names the predicate fallback, see \"Synthesis effects\").");
P();
P("### Matching (how duplicates were found)");
P();
P(`1. **Same id** in several packets is one question (shared catalog \`CQ-*\` ids): ${count((e) => e.packets.length > 1)} questions. Value is the lowest declared (R-08), audiences are the union, polarity is harm if any packet says harm, answer kind is shown per packet. CQ-PF-03 is the exception: D8 and D6 ask different things under one id, so R-08 splits it into CQ-PF-03a (D8) and CQ-PF-03b (D6).`);
P(`2. **Declared reuse:** a row whose question cell names another packet's row id (\"reuses CQ-…\") is cross-referenced, not merged, because the reusing row bundles several catalog questions or adds facets: ${links.length} links (listed under \"Linked questions\").`);
P(`3. **Text similarity:** word-set Jaccard ≥ ${JACCARD_MIN} between rows of different packets with different ids: ${similar.length} pairs, each read; ${similar.filter((s) => REVIEWED[s.key]).length} kept separate with a reason, ${similar.filter((s) => !REVIEWED[s.key]).length} not yet reviewed (listed under \"Similar wording\").`);
P();

// value-1 list
const v1 = list.filter((e) => e.value === 1);
P(`## Value-1 questions (${v1.length})`);
P();
P("Essential: the product cannot ship without them. Ordered by domain, then the packet's row order.");
P();
P("| id(s) | packets | question | audience | polarity | kind | fixture | survived |");
P("| --- | --- | --- | --- | --- | --- | --- | --- |");
for (const e of v1) P(`| ${idCell(e)} | ${pk(e)} | ${esc(e.question)} | ${aud(e)} | ${e.polarityText} | ${e.kindText} | ${e.fixtureText} | ${surv(e)} |`);
P();

// audience views
P("## By audience");
P();
P("Each question appears under every audience it is tagged with. Within an audience: value, then harm before benefit before neutral, then domain order.");
P();
const polRank = { harm: 0, benefit: 1, neutral: 2 };
for (const s of audienceStats) {
  const l = list.filter((e) => e.audiences.includes(s.a)).sort((x, y) => x.value - y.value || polRank[x.polarity] - polRank[y.polarity] || byPacketOrder(x, y));
  P(`### ${s.a[0].toUpperCase()}${s.a.slice(1)} (${s.n}; value 1: ${s.v1}; harm share ${pct(s.harm, s.n)})`);
  P();
  P("| id(s) | packets | question | value | polarity | kind | fixture | survived |");
  P("| --- | --- | --- | ---: | --- | --- | --- | --- |");
  for (const e of l) P(`| ${idCell(e)} | ${pk(e)} | ${esc(e.question)} | ${e.value} | ${e.polarity} | ${e.ruling}${e.disagree ? " ⚑" : ""} | ${e.fixture} | ${surv(e)} |`);
  P();
}

// domain views (master)
P("## By domain (master table)");
P();
P("Each packet's own questions in its row order. A shared question is listed in full under the first packet that asks it and as a cross-reference under the others.");
P();
for (const p of PACKETS) {
  const own = list.filter((e) => e.owner === p);
  const shared = list.filter((e) => e.owner !== p && e.packets.includes(p));
  P(`### ${p}: ${domain[p]} (${own.length + shared.length})`);
  P();
  P("| id(s) | question | audience | value | polarity | kind (declared → D10) | pattern | fixture | survived | typed edges after synthesis | linked |");
  P("| --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |");
  for (const e of own) {
    const fx = `${e.fixtureText}${e.fixtureFolders.length ? `: ${e.fixtureFolders.join(", ")}` : ""}${e.fixtureNote ? ` (${e.fixtureNote})` : ""}`;
    const alt = e.altQuestions.length ? `<br>${e.altQuestions.map((a) => `*${a.packet} wording:* ${esc(a.question)}`).join("<br>")}` : "";
    const lk = [...(linkMap.get(e.id) ?? []), ...e.sourceIds.flatMap((i) => [...(linkMap.get(i) ?? [])])];
    const pkts = e.packets.length > 1 ? ` *(also ${e.packets.slice(1).join(", ")})*` : "";
    P(`| ${idCell(e)}${pkts} | ${esc(e.question)}${alt} | ${aud(e)} | ${e.valueText} | ${e.polarityText} | ${e.kindText} | ${e.patternRefs.map((x) => `\`${x}\``).join(", ")} | ${fx} | ${esc(e.survival.text)} | ${e.typesAfter.join(", ") || "none"} | ${[...new Set(lk)].filter((x) => x !== e.id).join(", ")} |`);
  }
  for (const e of shared) P(`| ${idCell(e)} | see ${e.owner} (shared id; ${p} asks it too) | ${aud(e)} | ${e.valueText} | ${e.polarityText} | ${e.kindText} | ${e.patternRefs.map((x) => `\`${x}\``).join(", ")} | ${e.fixtureText} | ${surv(e)} | ${e.typesAfter.join(", ") || "none"} | |`);
  P();
}

// synthesis effects
P("## Synthesis effects on questions");
P();
const notKept = list.filter((e) => e.survival.code !== "kept" && e.survival.code !== "noedge");
P(`### Questions that lost a typed edge (${notKept.length})`);
P();
P("Read from `final/seams.yaml` `cutEdges` (pairs cut, with their questions and ruling; the ruling of a cut row without one is taken from its seam row status). *Typed edges after synthesis* = relationship types whose entry in `final/relationship-register.yaml` or whose live (not cut) row in `final/seams.yaml` `seams` cites the question. *Predicate routes* = `predicateSeams` rows and `predicateOnly` entries (their `promoteWhen`) that cite it.");
P();
P("| id | value | packets | status | cut pair(s) and ruling | typed edges after synthesis | predicate routes |");
P("| --- | ---: | --- | --- | --- | --- | --- |");
for (const e of notKept.sort((a, b) => a.value - b.value || byPacketOrder(a, b))) P(`| ${e.id} | ${e.value} | ${pk(e)} | ${surv(e)} | ${esc(e.cuts.map((c) => `${c.label}: ${c.ruling}`).join("; ") || e.survival.text)} | ${e.typesAfter.join(", ") || "none"} | ${e.predicatesAfter.join(", ") || "none"} |`);
P();
const cutV1 = notKept.filter((e) => e.survival.code === "cut" && e.value === 1);
if (cutV1.length) {
  P(`**Value-1 questions whose only typed edge was cut (${cutV1.length}):** ${cutV1.map((e) => `${e.id} (${[...new Set(e.cuts.map((c) => c.ruling))].join(", ")})`).join(", ")}. Predicate routes left: ${cutV1.map((e) => `${e.id}: ${e.predicatesAfter.join(", ") || "none"}`).join("; ")}. Contested (the cut seam row's status says contested or it carries no ruling): ${cutV1.filter((e) => e.contested).map((e) => e.id).join(", ") || "none"}.`);
  P();
}
const touched = list.filter((e) => e.edits.length || e.deciding.length);
P(`### Questions that decide or are edited by a ruling (${touched.length})`);
P();
P("*Deciding* is read from the \"Deciding question\" line of each ruling in `final/decision-report.md`; edits are `edit-question` / `edit-pattern` ops in `final/_work/rulings.yaml`.");
P();
P("| id | value | deciding for | edits |");
P("| --- | ---: | --- | --- |");
for (const e of touched) P(`| ${e.id} | ${e.value} | ${e.deciding.join(", ")} | ${esc(e.edits.join("; "))} |`);
P();
const dis = list.filter((e) => e.disagree);
P(`### Answer-kind disagreements adopted (${dis.length})`);
P();
P("| id | packets | declared → D10 ruling |");
P("| --- | --- | --- |");
for (const e of dis) P(`| ${e.id} | ${pk(e)} | ${e.kindText} |`);
P();
P(`### Linked questions (matching rule 2: ${links.length})`);
P();
P("| row | names | asked by |");
P("| --- | --- | --- |");
for (const l of links) P(`| ${l.from} | ${l.to} | ${l.packets.join(", ")} |`);
P();
P(`### Similar wording (matching rule 3: ${similar.length} pairs)`);
P();
P("| Jaccard | row A | row B | decision |");
P("| ---: | --- | --- | --- |");
for (const s of similar) P(`| ${s.J.toFixed(2)} | ${s.a.packet}:${s.a.id} | ${s.b.packet}:${s.b.id} | ${REVIEWED[s.key] ? `kept separate: ${esc(REVIEWED[s.key])}` : "NOT REVIEWED"} |`);
P();
P("### Data checks");
P();
P(`- Rows without a D10 answer-kind row: ${missingD10.length ? missingD10.join(", ") : "none"}.`);
P(`- Pattern references: ${patternIssues.length ? patternIssues.join("; ") : `every row's id is a heading in its packet's \`03-retrieval-patterns.md\``}.`);
P(`- Fixture column declared yes, but no fixture \`questions.md\` names the id (${list.filter((e) => e.fixtureNote.startsWith("declared yes")).length}): ${list.filter((e) => e.fixtureNote.startsWith("declared yes")).map((e) => `${e.packets.join("+")}:${e.id}`).join(", ") || "none"}.`);
P(`- Fixture column declared no, but a fixture \`questions.md\` names the id (${list.filter((e) => e.fixtureNote.startsWith("declared no")).length}; a fixture may name a question it does not answer, e.g. as out of scope): ${list.filter((e) => e.fixtureNote.startsWith("declared no")).map((e) => `${e.packets.join("+")}:${e.id} (${e.fixtureFolders.join(", ")})`).join(", ") || "none"}.`);
P(`- Cross-domain fixtures read from \`final/fixtures/cross-domain/\`: ${xdFolders.length ? xdFolders.join(", ") : "none present when generated"}.`);
P();
P("## Inputs");
P();
P("| file | sha256 (12) |");
P("| --- | --- |");
for (const f of [...new Set(inputs)]) P(`| ${rel(f)} | ${sha(f)} |`);
P();

writeFileSync(outFile, L.join("\n"));
console.log(JSON.stringify({
  out: rel(outFile), bytes: Buffer.byteLength(L.join("\n")), rows: rows.length, packetIds: new Set(rows.map((r) => r.id)).size,
  distinct: N, shared: count((e) => e.packets.length > 1), value1: v1.length, value2: count((e) => e.value === 2), value3: count((e) => e.value === 3),
  harm, harmShare: pct(harm, N), audience: Object.fromEntries(audienceStats.map((s) => [s.a, { n: s.n, harm: s.harm, share: pct(s.harm, s.n), v1: s.v1 }])),
  kinds: Object.fromEntries(KINDS.map((k) => [k, count((e) => e.ruling === k)])), disagreements: dis.length,
  fixtureYes: count((e) => e.fixture === "yes"), survival: Object.fromEntries(survivalCodes.map((c) => [c, count((e) => e.survival.code === c)])),
  cutValue1: cutV1.map((e) => e.id), links: links.length, similar: similar.length, unreviewed: similar.filter((s) => !REVIEWED[s.key]).length,
  missingD10: missingD10.length, patternIssues: patternIssues.length, queryPatternsPresent: qpPresent, crossDomainFixtures: xdFolders,
}, null, 1));
