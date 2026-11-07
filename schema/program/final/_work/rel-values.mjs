#!/usr/bin/env node
// For every relationship type of the assembled SDL: the questions its merged register entries cite and the best
// (lowest) value among them, read from packets/*/02-questions.md (column "value"; a shared id takes the lowest value
// any packet declares, R-08). Lists the step-7 demotion candidates (all questions value 3) and ids with no value.
//   node schema/program/final/_work/rel-values.mjs   (run after merge-registers.mjs)
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
const finalDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const require = createRequire(resolve(finalDir, "../../../packages/schema-workspace/package.json"));
const YAML = require("yaml");
const packetsDir = resolve(finalDir, "../packets");
const value = new Map();
for (const p of readdirSync(packetsDir)) {
  let text; try { text = readFileSync(resolve(packetsDir, p, "02-questions.md"), "utf8"); } catch { continue; }
  let vi = -1;
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("|")) { vi = line.trim() === "" ? vi : -1; continue; }
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells[0] === "id") { vi = cells.indexOf("value"); continue; }
    if (vi < 0 || /^-+:?$/.test(cells[0])) continue;
    const id = cells[0].replace(/[`*]/g, ""), v = Number(cells[vi]);
    if (!/^(Q|CQ)-/.test(id) || !Number.isFinite(v)) continue;
    value.set(id, Math.min(value.get(id) ?? 9, v));
  }
}
// R-08: CQ-PF-03 is split; 03a is D8's (v1, retrieved), 03b is D6's (v2, assessment)
if (!value.has("CQ-PF-03a")) value.set("CQ-PF-03a", 1);
if (!value.has("CQ-PF-03b")) value.set("CQ-PF-03b", 2);
const reg = YAML.parse(readFileSync(resolve(finalDir, "relationship-register.yaml"), "utf8"));
const types = new Map();
for (const e of reg.relationships) {
  const t = String(e.type).trim();
  const r = types.get(t) ?? { modules: [], questions: new Set() };
  r.modules.push(e.module); for (const q of e.questions ?? []) r.questions.add(String(q).replace(/^[A-Z0-9]+:/, ""));
  types.set(t, r);
}
const rows = [...types].map(([t, r]) => {
  const qs = [...r.questions]; const vs = qs.map((q) => value.get(q)).filter((v) => v != null);
  return { type: t, modules: r.modules.join(","), questions: qs.length, best: vs.length ? Math.min(...vs) : null, unknown: qs.filter((q) => !value.has(q)) };
}).sort((a, b) => (b.best ?? 9) - (a.best ?? 9) || a.type.localeCompare(b.type));
const by = (v) => rows.filter((r) => r.best === v).length;
const nreg = YAML.parse(readFileSync(resolve(finalDir, "node-register.yaml"), "utf8"));
const thin = nreg.nodes.filter((n) => (n.filterProperties ?? []).length < 2).map((n) => `${n.name} (${n.module}, ${(n.filterProperties ?? []).length})`);
console.log("node types with < 2 filterProperties in the register:", thin.length ? thin.join(", ") : "none");
console.log(JSON.stringify({ questionIdsWithValue: value.size, relationshipTypes: rows.length, bestValue1: by(1), bestValue2: by(2), bestValue3: by(3), noValue: by(null) }));
for (const r of rows.filter((r) => r.best !== 1)) console.log(`${r.best ?? "?"}\t${r.type}\t${r.modules}\tq=${r.questions}\tunknown=${r.unknown.join(" ")}`);
const unk = rows.filter((r) => r.unknown.length);
if (unk.length) console.log("ids without a value:", unk.map((r) => `${r.type}: ${r.unknown.join(" ")}`).join(" | "));
