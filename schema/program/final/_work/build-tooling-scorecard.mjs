#!/usr/bin/env node
/**
 * Writes final/tooling/readiness-scorecard.md: the readiness scorecard of the merged action space and the gap list
 * prioritized by blocked questions, restricted to the questions that survived synthesis and re-ranked by value.
 *
 *   node schema/program/final/_work/build-tooling-scorecard.mjs [--check]
 *
 * Inputs (read only):
 *   final/tooling/action-space.yaml            D11's generator output, copied unchanged (entries, gaps, aliases)
 *   final/relationship-register.yaml           after _work/rewrite-populatedby.mjs (populatedBy = action-space ids)
 *   final/decision-report.md                   must state "No cut was made." (else the survivor rule below is wrong)
 *   packets/<id>/02-questions.md               question value (lowest any packet declares, R-08), polarity, packets
 * Survivor rule: the question catalog of every packet's 02, with CQ-PF-03 replaced by CQ-PF-03a (D8, v1) and CQ-PF-03b
 * (D6, v2) per R-08; no question is dropped because "Cuts to budget" records no cut. A D11 list naming CQ-PF-03 is
 * mapped to 03a when its scope (entry domains / gap requestedBy) includes D8 and to 03b when it includes D6.
 * Blocked questions after synthesis = D11's blockedQuestions (mapped to survivors) ∪ the questions of every final
 * register entry whose populatedBy names the entry (gaps: only questions of the requesting packets, D11's scope rule).
 * Re-ranking by value: value-1 count, then value-2, then value-3, then total (D11 ranked by score = 3·v1 + 2·v2 + v3).
 * Deterministic; --check exits 1 when the file on disk differs.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const finalDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const require = createRequire(resolve(finalDir, "../../../packages/schema-workspace/package.json"));
const YAML = require("yaml");
const CHECK = process.argv.includes("--check");
const packetsDir = resolve(finalDir, "../packets");
const ORDER = ["K", ...Array.from({ length: 13 }, (_, i) => `D${i + 1}`)];
const read = (f) => readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
const qsort = (a) => [...a].sort((x, y) => x.localeCompare(y, "en", { numeric: true }));
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const PRIO = ["P0", "P1", "P2", "P3"];

// ---------- inputs
const asFile = resolve(finalDir, "tooling/action-space.yaml");
const regFile = resolve(finalDir, "relationship-register.yaml");
const drFile = resolve(finalDir, "decision-report.md");
const space = YAML.parse(read(asFile));
const reg = YAML.parse(read(regFile));
if (!read(drFile).includes("**No cut was made.**")) { console.error("decision-report.md no longer says 'No cut was made.'; update the survivor rule"); process.exit(1); }

// ---------- question catalog (same table parse as D11's generator)
function splitRow(line) {
  const cells = []; let cur = "";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && line[i + 1] === "|") { cur += "|"; i++; continue; }
    if (ch === "|") { cells.push(cur.trim()); cur = ""; } else cur += ch;
  }
  cells.push(cur.trim());
  return cells.slice(1, -1);
}
const catalog = new Map(); // id → { value, harm, packets }
for (const p of ORDER) {
  const f = resolve(packetsDir, p, "02-questions.md");
  if (!existsSync(f)) continue;
  let hdr = null;
  for (const line of read(f).split("\n")) {
    if (!line.startsWith("|")) { hdr = null; continue; }
    const c = splitRow(line);
    if (c[0] === "id" && c.includes("question")) { hdr = c; continue; }
    if (!hdr || c.every((x) => /^:?-+:?$/.test(x))) continue;
    const row = Object.fromEntries(hdr.map((h, i) => [h, c[i] ?? ""]));
    const id = row.id.replace(/`/g, "").trim();
    if (!/^(Q|CQ)-/.test(id)) continue;
    const v = Number(String(row.value).match(/[123]/)?.[0] ?? 3);
    const q = catalog.get(id) ?? { value: v, harm: false, packets: [] };
    q.value = Math.min(q.value, v); q.harm = q.harm || /harm/i.test(row.polarity ?? ""); q.packets.push(p);
    catalog.set(id, q);
  }
}
const catalogSize = catalog.size;
const pf03 = catalog.get("CQ-PF-03");
const survivors = new Map([...catalog].filter(([id]) => id !== "CQ-PF-03"));
if (pf03) {
  survivors.set("CQ-PF-03a", { value: 1, harm: pf03.harm, packets: ["D8"] });
  survivors.set("CQ-PF-03b", { value: 2, harm: pf03.harm, packets: ["D6"] });
}
const splitPF = (ids, scope) => ids.flatMap((q) => {
  if (q !== "CQ-PF-03") return [q];
  const out = [...(scope.includes("D8") ? ["CQ-PF-03a"] : []), ...(scope.includes("D6") ? ["CQ-PF-03b"] : [])];
  return out.length ? out : ["CQ-PF-03a", "CQ-PF-03b"];
});
const val = (q) => survivors.get(q).value;
const counts = (qs) => {
  const v = (n) => qs.filter((q) => val(q) === n).length;
  return { total: qs.length, value1: v(1), value2: v(2), value3: v(3), harm: qs.filter((q) => survivors.get(q).harm).length, score: 3 * v(1) + 2 * v(2) + v(3) };
};
const byValue = (a, b) => b.c.value1 - a.c.value1 || b.c.value2 - a.c.value2 || b.c.value3 - a.c.value3 || b.c.total - a.c.total;

// ---------- final register needs (after the populatedBy rewrite)
const ids = new Set(space.entries.map((e) => e.id));
const regNeeds = new Map([...ids].map((id) => [id, new Set()]));
const unknownRegQ = new Set(), unresolvedPB = [];
const typeTools = new Map(); // relationship type → { tools:Set, questions:Set, modules:Set }
for (const r of reg.relationships ?? []) {
  const qs = asList(r.questions).map((q) => String(q).trim().replace(/^[A-Z0-9]+:/, ""));
  const t = typeTools.get(r.type) ?? { tools: new Set(), questions: new Set(), modules: new Set() };
  t.modules.add(r.module); qs.forEach((q) => t.questions.add(q));
  for (const pb of asList(r.populatedBy).map(String)) {
    if (!ids.has(pb)) { unresolvedPB.push(`${r.module} ${r.type}: ${pb}`); continue; }
    t.tools.add(pb);
    for (const q of qs) { if (survivors.has(q)) regNeeds.get(pb).add(q); else unknownRegQ.add(q); }
  }
  typeTools.set(r.type, t);
}

// ---------- entries after synthesis
const entries = space.entries.map((e) => {
  const scope = asList(e.domains);
  const base = splitPF(asList(e.blockedQuestions).map(String), scope).filter((q) => survivors.has(q));
  const added = [...regNeeds.get(e.id)].filter((q) => !base.includes(q));
  const qs = qsort(new Set([...base, ...added]));
  const c = counts(qs);
  const r = e.readiness ?? 0;
  let computed = "P3";
  if (c.value1 && r <= 1) computed = "P0"; else if (c.value1 || (c.value2 && r <= 1)) computed = "P1"; else if (c.value2) computed = "P2";
  const priority = PRIO.indexOf(e.priority) >= 0 && PRIO.indexOf(e.priority) < PRIO.indexOf(computed) ? e.priority : computed;
  return { e, qs, c, added: added.length, d11: asList(e.blockedQuestions).length, priority };
});
const entryById = new Map(entries.map((x) => [x.e.id, x]));

// ---------- gaps after synthesis
const d11Rank = new Map(space.gaps.map((g) => [g.id, g.rank]));
const gaps = space.gaps.map((g) => {
  const scope = asList(g.requestedBy);
  const base = splitPF(asList(g.blockedQuestions).map(String), scope).filter((q) => survivors.has(q));
  const inScope = (q) => survivors.get(q).packets.some((p) => scope.includes(p));
  const extra = asList(g.entries).flatMap((id) => [...(regNeeds.get(id) ?? [])]).filter((q) => inScope(q) && !base.includes(q));
  const qs = qsort(new Set([...base, ...extra]));
  const c = counts(qs);
  const weakest = g.weakestEntryReadiness;
  let priority = c.value1 >= 1 && (weakest ?? 0) <= 1 ? "P0" : c.value1 >= 1 ? "P1" : c.value2 >= 1 ? "P2" : "P3";
  if (g.allEntries && c.value1) priority = "P0";
  return { g, qs, c, added: new Set(extra).size, priority, weakest };
}).sort((a, b) => byValue(a, b) || a.g.id.localeCompare(b.g.id, "en", { numeric: true }));
const scoreRank = new Map([...gaps].sort((a, b) => b.c.score - a.c.score || b.c.value1 - a.c.value1 || b.c.total - a.c.total || a.g.id.localeCompare(b.g.id, "en", { numeric: true })).map((x, i) => [x.g.id, i + 1]));

// synthesis rulings whose subject is the gap's tooling (cross-reference by ruling title, decision-report.md)
const RELATED = {
  G2: "R-44 retraction and correction status", G4: "R-35 contentHashBasis; R-38 selector normalization basis",
  G11: "R-38 selector normalization basis", G12: "R-35 contentHashBasis; R-37 snapshot identity vs change detection",
  G13: "R-40 intent contract v1 cannot write the kernel evidence chain (owner decision)", G14: "R-36 tool-rendition evidence and ACCEPTED (owner decision)",
  G15: "R-22 projection gate; R-47 AFFECTS_MECHANISM vs Association", G17: "R-37 snapshot identity; archive copies",
};

// ---------- relationship types by tool readiness
const readinessOf = (id) => entryById.get(id).e.readiness;
const typeRows = [...typeTools].map(([type, t]) => {
  const tools = [...t.tools].sort();
  const rs = tools.map(readinessOf).filter((x) => x != null);
  const best = rs.length ? Math.max(...rs) : null;
  const vs = [...t.questions].filter((q) => survivors.has(q)).map(val);
  return { type, modules: [...t.modules].join(", "), tools, best, bestValue: vs.length ? Math.min(...vs) : null };
}).sort((a, b) => a.type.localeCompare(b.type));
const typesTotal = typeRows.length;
const typesBy = (pred) => typeRows.filter(pred);
const weakTypes = typesBy((r) => r.best == null || r.best <= 1).sort((a, b) => (a.bestValue ?? 9) - (b.bestValue ?? 9) || a.type.localeCompare(b.type));

// ---------- domain scorecard (external)
const external = entries.filter((x) => x.e.class === "external");
const internal = entries.filter((x) => x.e.class === "internal");
const lvl = (x) => (x.e.readiness == null ? "u" : String(x.e.readiness));
const domainRow = (d) => {
  const es = external.filter((x) => asList(x.e.domains).includes(d));
  const n = (k) => es.filter((x) => lvl(x) === k).length;
  const v1weak = new Set(external.filter((x) => x.e.readiness == null || x.e.readiness <= 1).flatMap((x) => x.qs).filter((q) => val(q) === 1 && survivors.get(q).packets.includes(d)));
  return [d, n("3"), n("2"), n("1"), n("0"), n("u"), es.length, es.filter((x) => x.priority === "P0").length, v1weak.size];
};
const needing = new Set(entries.flatMap((x) => x.qs));
const v1Survivors = [...survivors.values()].filter((q) => q.value === 1).length;
const v1Needing = [...needing].filter((q) => val(q) === 1).length;
const v1Weak = new Set(entries.filter((x) => (x.e.readiness ?? 0) <= 1).flatMap((x) => x.qs).filter((q) => val(q) === 1));
const prioDist = Object.fromEntries(PRIO.map((p) => [p, entries.filter((x) => x.priority === p).length]));
const prioChanged = entries.filter((x) => x.priority !== x.e.priority);
let rw = null;
try { rw = JSON.parse(read(resolve(finalDir, "_work/populatedby-rewrite-report.json"))); } catch { /* optional */ }

// ---------- render
const L = [];
const cut = (s, n = 140) => { const t = String(s ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim(); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };
const row = (cells) => L.push(`| ${cells.join(" | ")} |`);
L.push("# Readiness scorecard: bio-medical tooling action space (synthesis)");
L.push("");
L.push("Synthesizer stage `tooling`, 2026-10-09. **Generated** by `final/_work/build-tooling-scorecard.mjs`; do not edit by hand. The registry is `final/tooling/action-space.yaml`, which is D11's generator output copied byte for byte (a re-run of D11's `build-action-space.mjs` against the packets in this worktree reproduced it exactly; see `_runlog/tooling.md`). This page differs from D11's `readiness-scorecard.md` in three ways:");
L.push("");
L.push("1. Blocked questions are restricted to the questions that survived synthesis.");
L.push("2. They include the questions of every final relationship-register entry whose rewritten `populatedBy` names the tool.");
L.push("3. The gap list is re-ranked by value: value-1 count first, then value-2, value-3 and total. D11 ranked by the weighted score.");
L.push("");
L.push("Readiness scale (PLAN 6.3) for external tools: **0** blocked · **1** scrape-only · **2** API without stable locators · **3** agent-ready. Internal BellLabs tools use K's scale: 0 not built · 1 designed · 2 partially built · 3 in use.");
L.push("");
L.push("## 1. Summary");
L.push("");
L.push(`- **${space.entries.length} merged entries** (${external.length} external, ${internal.length} internal) under **${Object.keys(space.aliases).length} packet-local aliases**.`);
L.push(`- External readiness: 3 → ${external.filter((x) => lvl(x) === "3").length} · 2 → ${external.filter((x) => lvl(x) === "2").length} · 1 → ${external.filter((x) => lvl(x) === "1").length} · 0 → ${external.filter((x) => lvl(x) === "0").length} · unscored → ${external.filter((x) => lvl(x) === "u").length}.`);
L.push(`- Internal readiness (K scale): 3 → ${internal.filter((x) => lvl(x) === "3").length} · 2 → ${internal.filter((x) => lvl(x) === "2").length} · 1 → ${internal.filter((x) => lvl(x) === "1").length} · 0 → ${internal.filter((x) => lvl(x) === "0").length}.`);
L.push(`- **Surviving questions: ${survivors.size}.** The packets' catalog holds ${catalogSize} ids. R-08 splits CQ-PF-03 into CQ-PF-03a (D8, v1) and CQ-PF-03b (D6, v2). "Cuts to budget" in \`decision-report.md\` records no cut, so no question was dropped. Value 1: ${v1Survivors}; value 2: ${[...survivors.values()].filter((q) => q.value === 2).length}; value 3: ${[...survivors.values()].filter((q) => q.value === 3).length}.`);
L.push(`- **${needing.size} surviving questions need at least one tool**, ${v1Needing} of them value 1. Of the value-1 questions, **${v1Weak.size} need at least one tool at readiness ≤ 1** (unscored counts as 0).`);
L.push(`- Priority after synthesis (same rule as D11, never less urgent than D11's own score): P0 ${prioDist.P0} · P1 ${prioDist.P1} · P2 ${prioDist.P2} · P3 ${prioDist.P3}. Priority changed from the registry's value for ${prioChanged.length} entr${prioChanged.length === 1 ? "y" : "ies"}${prioChanged.length ? ` (${prioChanged.map((x) => `\`${x.e.id}\` ${x.e.priority}→${x.priority}`).join(", ")})` : ""}.`);
L.push(`- Final register additions: ${entries.filter((x) => x.added).length} entries gained questions from the final relationship register that D11's packet-level pass did not credit to them (${entries.reduce((s, x) => s + x.added, 0)} entry-question links in all). ${gaps.filter((x) => x.added).length} gap clusters gained questions this way.`);
if (rw) L.push(`- \`populatedBy\` rewrite (R-39, \`_work/rewrite-populatedby.mjs\`): ${rw.entriesWithPopulatedBy} register entries and ${rw.valuesIn} values. ${rw.viaAlias} values were resolved through the alias map, ${rw.renamed} were renamed, and ${rw.duplicatesDropped} duplicates were dropped where several local ids merge into one tool. The result is ${rw.valuesOut} values over ${rw.distinctActionSpaceIdsUsed} distinct action-space ids, with **${rw.unresolved.length} unresolved**.`);
L.push(`- Verified against the register now on disk: ${unresolvedPB.length} \`populatedBy\` ids are not action-space entries${unresolvedPB.length ? ` (${unresolvedPB.join("; ")})` : ""}. ${unknownRegQ.size} register question ids are not surviving questions${unknownRegQ.size ? ` (${qsort(unknownRegQ).join(", ")})` : ""}.`);
L.push("");
L.push("## 2. Scorecard by readiness level and domain (external entries)");
L.push("");
L.push("An entry counts in every domain that lists it (`domains` in the registry), so the rows do not sum to the total. The last column counts the surviving value-1 questions of that domain that need at least one external entry at readiness ≤ 1.");
L.push("");
row(["domain", "3 agent-ready", "2 API, no locators", "1 scrape-only", "0 blocked", "unscored", "entries", "P0", "value-1 questions needing a readiness ≤ 1 entry"]);
row(["---", "---:", "---:", "---:", "---:", "---:", "---:", "---:", "---:"]);
for (const d of ORDER) row(domainRow(d));
row(["**all**", ...["3", "2", "1", "0", "u"].map((k) => `**${external.filter((x) => lvl(x) === k).length}**`), `**${external.length}**`, `**${external.filter((x) => x.priority === "P0").length}**`, `**${new Set(external.filter((x) => x.e.readiness == null || x.e.readiness <= 1).flatMap((x) => x.qs).filter((q) => val(q) === 1)).size}**`]);
L.push("");
L.push("## 3. Final relationship types by the readiness of their populating tools");
L.push("");
L.push(`The final register has ${typesTotal} relationship types. "Best readiness" is the highest readiness among the action-space ids in the type's rewritten \`populatedBy\`, across all of the type's register entries. Internal tools are read on K's scale.`);
L.push("");
L.push(`- Best readiness 3: ${typesBy((r) => r.best === 3).length} · 2: ${typesBy((r) => r.best === 2).length} · 1: ${typesBy((r) => r.best === 1).length} · 0: ${typesBy((r) => r.best === 0).length} · no scored tool: ${typesBy((r) => r.best == null).length}.`);
L.push(`- **${weakTypes.length} types have no populating tool above readiness 1.** Until a tool for them moves to readiness 2 or higher, these edges can only be written by scraping, by hand, or by an internal tool that is designed but not built. They are listed by their best question value:`);
L.push("");
row(["type", "module(s)", "best question value", "populatedBy (readiness)"]);
row(["---", "---", "---:", "---"]);
for (const r of weakTypes) row([`\`${r.type}\``, r.modules, r.bestValue ?? "?", r.tools.map((t) => `\`${t}\` (${readinessOf(t) ?? "?"})`).join(", ")]);
L.push("");
L.push("## 4. Internal BellLabs tooling (K scale)");
L.push("");
row(["id", "readiness", "priority", "surviving questions (value-1)", "of which from the final register only", "gap"]);
row(["---", "---:", "---", "---:", "---:", "---"]);
for (const x of [...internal].sort((a, b) => b.c.value1 - a.c.value1 || b.c.total - a.c.total || a.e.id.localeCompare(b.e.id))) row([`\`${x.e.id}\``, x.e.readiness ?? "—", x.priority, `${x.c.total} (${x.c.value1})`, x.added, cut(x.e.gap)]);
L.push("");
L.push("## 5. Prioritized gap list (custom-tooling clusters, surviving questions, re-ranked by value)");
L.push("");
L.push("A gap blocks the surviving questions that need any of its entries and that belong to a packet that requested the gap, plus the question ids the requesters named explicitly (D11's scope rule). The ranking is by value-1 count, then value-2 count, value-3 count and total. The table also shows D11's rank by weighted score and the rank this page's counts give under that score (`score rank`). Priority is P0 when a value-1 question is blocked and the weakest entry is at readiness ≤ 1. \"Related rulings\" are a cross-reference by ruling title from `decision-report.md`.");
L.push("");
row(["rank", "gap", "title", "blocked", "value-1", "value-2", "value-3", "harm", "score", "score rank", "D11 rank", "+ from final register", "weakest readiness", "priority", "owner", "related rulings"]);
row(["---:", "---", "---", "---:", "---:", "---:", "---:", "---:", "---:", "---:", "---:", "---:", "---:", "---", "---", "---"]);
gaps.forEach((x, i) => row([i + 1, x.g.id, cut(x.g.title, 110), x.c.total, x.c.value1, x.c.value2, x.c.value3, x.c.harm, x.c.score, scoreRank.get(x.g.id), d11Rank.get(x.g.id), x.added, x.weakest ?? "—", x.priority, x.g.owner, RELATED[x.g.id] ?? ""]));
L.push("");
L.push("Entries of each gap, in rank order:");
L.push("");
gaps.forEach((x, i) => L.push(`${i + 1}. **${x.g.id}**: ${asList(x.g.entries).map((id) => `\`${id}\` (${entryById.get(id)?.e.readiness ?? "?"})`).join(", ")}${x.g.build ? `. Build: ${cut(x.g.build, 400)}` : ""}`));
L.push("");
L.push("## 6. Entry-level gaps (readiness ≤ 2 or unscored, surviving questions, re-ranked by value)");
L.push("");
const weakEntries = entries.filter((x) => (x.e.readiness == null || x.e.readiness <= 2) && x.c.total > 0).sort((a, b) => byValue(a, b) || a.e.id.localeCompare(b.e.id));
L.push(`${weakEntries.length} entries are at readiness ≤ 2 or unscored and block at least one surviving question.`);
L.push("");
row(["rank", "id", "class", "readiness", "priority", "blocked", "value-1", "value-2", "value-3", "harm", "D11 count", "+ final register", "owner", "gap"]);
row(["---:", "---", "---", "---:", "---", "---:", "---:", "---:", "---:", "---:", "---:", "---:", "---", "---"]);
weakEntries.forEach((x, i) => row([i + 1, `\`${x.e.id}\``, x.e.class, x.e.readiness ?? "—", x.priority, x.c.total, x.c.value1, x.c.value2, x.c.value3, x.c.harm, x.d11, x.added, x.e.owner, cut(x.e.gap, 120)]));
L.push("");
L.push("## 7. Method, inputs and caveats");
L.push("");
L.push(`- Inputs (sha256): \`final/tooling/action-space.yaml\` ${sha(asFile)}; \`final/relationship-register.yaml\` ${sha(regFile)}; \`final/decision-report.md\` ${sha(drFile)}.`);
L.push("- Question values are the lowest value any packet's `02-questions.md` declares (R-08), parsed with D11's table rules. Harm is \"polarity contains harm\" in any packet.");
L.push("- Questions are credited to an entry by D11's rules (a 05 `populatedBy`, the `02` sources column, or an id in the `08` row) plus the final register's `populatedBy`. Matching on the sources column is approximate, as D11's own caveat says. A tool can be credited for a question that a source it reaches merely mentions.");
L.push("- The final register adds questions only where synthesis changed which tool populates a type, or which questions a type carries. Nothing is removed from D11's sets except non-surviving ids. Because no question was cut, only CQ-PF-03 is affected.");
L.push("- `aliases` merges source families into one provider id (for example, D7's SEC form sources into `sec-edgar`, and D8's NSF and Informed Sport listings into `certification-databases`). Under R-39 `captureMethod` = `<action-space id>/<version>`, so the form or programme must be read from the Source record, not from the tool id.");
L.push("- Readiness and gap text are D11's (cross-packet pass, 2026-10-08). Synthesis re-ranks the gaps but does not re-score readiness. Section 8 of D11's scorecard records the readiness disagreements across packets.");
L.push("");
const md = L.join("\n");
const outFile = resolve(finalDir, "tooling/readiness-scorecard.md");
if (CHECK) { const same = existsSync(outFile) && read(outFile) === md; console.log(same ? "no drift" : "drift"); process.exit(same ? 0 : 1); }
writeFileSync(outFile, md, "utf8");
console.log(JSON.stringify({
  entries: space.entries.length, survivors: survivors.size, catalog: catalogSize, needing: needing.size, v1Survivors, v1Needing, v1NeedingWeakTool: v1Weak.size,
  priority: prioDist, priorityChanged: prioChanged.map((x) => `${x.e.id} ${x.e.priority}->${x.priority}`),
  entriesWithRegisterAdditions: entries.filter((x) => x.added).length, entryQuestionLinksAdded: entries.reduce((s, x) => s + x.added, 0),
  gapsWithAdditions: gaps.filter((x) => x.added).length, relationshipTypes: typesTotal, typesBestReadinessLe1: weakTypes.length,
  unresolvedPopulatedBy: unresolvedPB, unknownRegisterQuestions: qsort(unknownRegQ), weakEntries: weakEntries.length,
  topGaps: gaps.slice(0, 8).map((x, i) => `${i + 1}. ${x.g.id} ${x.c.total}q v1=${x.c.value1} v2=${x.c.value2} v3=${x.c.value3} score=${x.c.score} (D11 rank ${d11Rank.get(x.g.id)}) ${x.priority}`),
}, null, 1));
