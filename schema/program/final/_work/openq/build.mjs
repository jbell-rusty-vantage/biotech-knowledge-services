#!/usr/bin/env node
// Builds final/open-questions.md from template.md + mapping.tsv + values.json + decision-report.md.
//   node schema/program/final/_work/openq/values.mjs && node schema/program/final/_work/openq/build.mjs   (writes final/open-questions.md)
// Priority = lowest packet value among the question ids in an entry's "blocks" cell (GATE token -> "gate";
// "~vN" token forces value N, used where a packet counted the questions a tooling gap serves).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const finalDir = resolve(here, "..", "..");
const values = JSON.parse(readFileSync(resolve(here, "values.json"), "utf8"));
const template = readFileSync(resolve(here, "template.md"), "utf8");
const report = readFileSync(resolve(finalDir, "decision-report.md"), "utf8");

// ---- mapping
const mapping = [];
for (const line of readFileSync(resolve(here, "mapping.tsv"), "utf8").split(/\r?\n/)) {
  if (!line.trim() || line.startsWith("#")) continue;
  const [packet, item, targets] = line.split("\t");
  mapping.push({ packet, item, targets: targets.split(";").map((t) => t.trim()).filter(Boolean) });
}
const odAlias = { "R-01": "OD-01", "R-02": "OD-02", "R-03": "OD-03", "R-09": "OD-04", "R-10": "OD-05", "R-12": "OD-06", "R-13": "OD-07", "R-36": "OD-08", "R-40": "OD-09" };
for (const m of mapping) m.targets = [...new Set(m.targets.map((t) => odAlias[t] ?? t))];
const label = (m) => (/^OQ-/.test(m.item) ? m.item : /^\d+$/.test(m.item) ? `${m.packet} #${m.item}` : `${m.packet} ${m.item}`);

// ---- decision report rulings
const rulings = new Map();
{
  const blocks = report.split(/\n(?=#### )/);
  for (const b of blocks) {
    const h = b.match(/^#### ((?:R|I)-\d+) · (.+)/);
    if (!h) continue;
    const field = (name) => (b.match(new RegExp(`- \\*\\*${name}:\\*\\* (.+)`)) ?? [])[1] ?? "";
    rulings.set(h[1], { id: h[1], title: h[2].trim(), packets: field("Packets"), deciding: field("Deciding question"), owner: field("Owner decision") });
  }
}

// ---- priority
const idRe = /\b(?:Q|CQ)-[A-Z0-9]+-\d+[ab]?\b/g;
function priority(cell) {
  const ids = [...new Set(cell.match(idRe) ?? [])];
  const forced = [...cell.matchAll(/~v([123])/g)].map((m) => Number(m[1]));
  const vals = [...ids.map((id) => values[id]).filter((v) => v != null), ...forced];
  const gate = /\bGATE\b/.test(cell);
  const best = vals.length ? Math.min(...vals) : null;
  const catalogOnly = ids.filter((id) => values[id] == null);
  let p = best ? `P${best}` : "none";
  if (gate) p = best ? `gate · P${best}` : "gate";
  return { p, best, gate, ids, catalogOnly };
}

// ---- fill template rows
const entryRe = /^\| ((?:OD|KN|EX|BM|MD|FX|FU|TL)-[A-Z0-9-]+) \|/;
const entries = new Map();
const out = [];
for (const line of template.split("\n")) {
  const m = line.match(entryRe);
  if (!m) { out.push(line); continue; }
  const id = m[1];
  const cells = line.split(" | ");
  // cells[0] = "| id", 1 question, 2 evidence, 3 owner, 4 status, 5 priority, 6 blocks, 7 "from |"
  if (cells.length !== 8) throw new Error(`row ${id}: expected 8 cells, got ${cells.length}`);
  const pr = priority(cells[6]);
  cells[5] = pr.p;
  if (pr.catalogOnly.length && !pr.best) cells[5] = `none (catalog id only)`;
  const mapped = mapping.filter((x) => x.targets.includes(id)).map(label);
  let from = cells[7].replace(/ \|$/, "");
  if (from.includes("~")) {
    from = from.replace("~", mapped.join(", "));
    from = from.replace(/; $/, "").replace(/^; /, "").trim();
    if (!from) from = "—";
  }
  cells[7] = `${from} |`;
  if (entries.has(id)) throw new Error(`duplicate entry ${id}`);
  entries.set(id, { id, owner: cells[3], status: cells[4], priority: cells[5], best: pr.best, gate: pr.gate, mapped: mapped.length, section: id.split("-")[0] });
  out.push(cells.join(" | "));
}
let doc = out.join("\n");

// ---- validation
const problems = [];
for (const m of mapping) for (const t of m.targets) {
  if (t === "CLOSED" || t === "MEAS") continue;
  if (/^R-\d+$/.test(t)) { if (!rulings.has(t)) problems.push(`${label(m)} -> unknown ruling ${t}`); continue; }
  if (!entries.has(t)) problems.push(`${label(m)} -> unknown entry ${t}`);
}

// ---- resolved section (rulings in report order that close at least one packet item)
const resolvedRows = [];
for (const r of rulings.values()) {
  const items = mapping.filter((m) => m.targets.includes(r.id));
  if (!items.length) continue;
  const pr = priority(r.deciding);
  const od = /^yes/.test(r.owner) ? "yes" : "no";
  if (od === "yes") { problems.push(`owner-decision ruling ${r.id} still mapped`); continue; }
  resolvedRows.push({ r, items, pr, od });
}
const esc = (s) => s.replace(/\|/g, "/");
const resolvedTable = [
  "| ruling | question resolved | owner of the question (packets) | deciding question | priority | owner decision | packet items closed |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  ...resolvedRows.map(({ r, items, pr, od }) => `| ${r.id} | ${esc(r.title)} | ${esc(r.packets.replace(/\.$/, ""))} | ${esc(r.deciding.replace(/\.$/, ""))} | ${pr.best ? `P${pr.best}` : "none"} | ${od} | ${items.map(label).join(", ")} |`),
].join("\n");
doc = doc.replace("<!-- RESOLVED -->", resolvedTable);

// ---- closed section
const packets = [...new Set(mapping.map((m) => m.packet))];
const closedLines = [];
for (const p of packets) {
  const c = mapping.filter((m) => m.packet === p && m.targets.includes("CLOSED")).map((m) => m.item);
  const me = mapping.filter((m) => m.packet === p && m.targets.includes("MEAS")).map((m) => m.item);
  if (!c.length && !me.length) continue;
  const parts = [];
  if (c.length) parts.push(c.map((i) => (/^\d+$/.test(i) ? `#${i}` : i)).join(", "));
  if (me.length) parts.push(`measured: ${me.map((i) => (/^\d+$/.test(i) ? `#${i}` : i)).join(", ")}`);
  closedLines.push(`- **${p}**: ${parts.join("; ")}`);
}
doc = doc.replace("<!-- CLOSED -->", closedLines.join("\n"));

// ---- counts
const E = [...entries.values()];
const by = (f) => E.reduce((a, e) => ((a[f(e)] = (a[f(e)] ?? 0) + 1), a), {});
const od = E.filter((e) => e.section === "OD");
// conflicts found after the rulings (section 1.2); since the fix stage each carries an owner-decision ruling R-95..R-98
const conflictIds = ["OD-10", "OD-11", "OD-45", "OD-46"];
const odRuling = od.filter((e) => /R-\d+/.test(e.status) && !conflictIds.includes(e.id)).length;
const odConflict = conflictIds.filter((x) => entries.has(x)).length;
const primary = (m) => m.targets[0];
const prim = mapping.reduce((a, m) => { const t = primary(m); const k = t === "CLOSED" ? "closed in packet" : t === "MEAS" ? "closed by measurement" : /^R-/.test(t) ? "resolved by a ruling" : "open entry"; a[k] = (a[k] ?? 0) + 1; return a; }, {});
const anyOpen = mapping.filter((m) => m.targets.some((t) => entries.has(t))).length;
const anyRuling = mapping.filter((m) => m.targets.some((t) => /^R-/.test(t))).length;
const prio = by((e) => e.priority.replace(/ \(catalog id only\)/, ""));
const prioLine = Object.entries(prio).sort().map(([k, v]) => `${k} ${v}`).join(", ");
const secName = { OD: "owner decisions", KN: "kernel", EX: "executor", BM: "biotech-meta", MD: "modules", FX: "fixture gaps", FU: "follow-ups", TL: "tooling" };
const secLine = Object.entries(by((e) => e.section)).map(([k, v]) => `${secName[k]} ${v}`).join(", ");
const odGate = od.filter((e) => e.gate).length, odP1 = od.filter((e) => e.best === 1).length;
const counts = [
  "**Counts** (computed by `build.mjs` from the mapping; reproduce with the commands in `_runlog/openq.md`):",
  "",
  `- Packet items read: ${mapping.length} across ${packets.length} packets. By primary target: ${Object.entries(prim).map(([k, v]) => `${k} ${v}`).join(", ")}. Items touching at least one open entry: ${anyOpen}; items closed or narrowed by at least one ruling: ${anyRuling}.`,
  `- Open entries after de-duplication: ${E.length} (${secLine}).`,
  `- Decisions the owner must make: ${od.length} — ${odRuling} rulings with owner decision = yes, ${odConflict} conflicts found after the rulings (ruled into decision-report R-95 to R-98 by the fix stage, owner decision = yes), ${od.length - odRuling - odConflict} carried from the packets and the other synthesis stages; ${odGate} of them gate acceptance, ${odP1} block a value-1 question.`,
  `- Priority of open entries: ${prioLine}.`,
  `- Rulings that close packet items (section 8): ${resolvedRows.length} of ${[...rulings.keys()].filter((k) => k.startsWith("R-")).length}.`,
].join("\n");
doc = doc.replace("<!-- COUNTS -->", counts);

writeFileSync(resolve(finalDir, "open-questions.md"), doc, "utf8");
console.log(JSON.stringify({ mappingItems: mapping.length, packets: packets.length, primary: prim, anyOpen, anyRuling, entries: E.length, bySection: by((e) => e.section), ownerDecisions: od.length, odRuling, odConflict, odGate, odP1, priority: prio, resolvedRulings: resolvedRows.length, rulingsInReport: rulings.size, problems }, null, 1));
const unmappedEntries = E.filter((e) => e.mapped === 0).map((e) => e.id);
console.log("entries with no packet item (synthesis-sourced):", unmappedEntries.join(" "));
if (problems.length) process.exitCode = 1;
