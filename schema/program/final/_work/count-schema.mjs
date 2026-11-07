#!/usr/bin/env node
// Counts an assembled candidate SDL by module (module = the "# MODULE <id>" banner written by scripts/assemble-schema.mjs).
//   node schema/program/final/_work/count-schema.mjs <C:/abs/final_biotech_schema_v2.graphql> [--json <out.json>] [--matrix <out.md>] [--append-map <schema-map.md>]
// --append-map replaces (or appends) the section "## Module seam matrix (integrator)" at the end of a map file.
// Pairs: "collapsed" (R-01 option A) counts an interface target once and does not double inverse fields;
// "expanded" (R-01 option B, = schema-workspace map) counts one pair per implementer of an interface target.
// Both count a union target once per member and de-duplicate (TYPE, from, to) across inverse declarations.
// Module attribution (R-01 option A, fix stage 2026-10-09): the kernel-meaning relationship types ASSESSES, DERIVED_FROM,
// MENTIONS and RENDITION_OF (R-43) belong to K wherever they are declared; every other type belongs to the first module
// (assembly order) that declares a field with it. --first-declarer restores the integrator's attribution (no K override).
// perModule also reports expandedPairs (option B) by the same attribution and declaredCollapsedPairs (pairs produced by
// fields declared on the module's own node types, whatever the owner of the type).
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(new URL("../../../../packages/schema-workspace/package.json", import.meta.url));
const { parse } = require("graphql");
const args = process.argv.slice(2);
const sdlPath = args.find((a) => !a.startsWith("--") && !/\.(json|md)$/.test(a));
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const text = readFileSync(sdlPath, "utf8");
const lines = text.split(/\r?\n/);
let mod = null; const modAt = [];
for (const l of lines) { const m = /^# MODULE (\S+)/.exec(l); if (m) mod = m[1] === "kernel" ? "K" : m[1]; modAt.push(mod); }
const doc = parse(text);
const moduleOf = {}; const unions = {}; const ifaces = new Set(); const impl = {}; const nodes = []; const enums = [];
for (const d of doc.definitions) {
  if (!d.name) continue;
  moduleOf[d.name.value] = modAt[d.loc.startToken.line - 1];
  if (d.kind === "UnionTypeDefinition") unions[d.name.value] = d.types.map((t) => t.name.value);
  if (d.kind === "InterfaceTypeDefinition") ifaces.add(d.name.value);
  if (d.kind === "EnumTypeDefinition") enums.push(d.name.value);
  if (d.kind === "ObjectTypeDefinition") {
    for (const i of d.interfaces || []) (impl[i.name.value] ??= []).push(d.name.value);
    if ((d.directives || []).some((x) => x.name.value === "node")) nodes.push(d.name.value);
  }
}
const relTypes = new Map(); const collapsed = new Set(); const expanded = new Set(); const fields = [];
const usedUnions = new Map();
for (const d of doc.definitions) {
  if (d.kind !== "ObjectTypeDefinition" || !nodes.includes(d.name.value)) continue;
  for (const f of d.fields || []) {
    const r = (f.directives || []).find((x) => x.name.value === "relationship");
    if (!r) continue;
    const a = (n) => r.arguments.find((x) => x.name.value === n)?.value;
    const type = a("type").value; const dir = a("direction").value; const props = a("properties")?.value ?? null;
    let t = f.type; while (t.type) t = t.type; const tn = t.name.value;
    if (unions[tn]) usedUnions.set(tn, unions[tn].length);
    const tc = unions[tn] ?? [tn]; const te = unions[tn] ?? (ifaces.has(tn) ? impl[tn] : [tn]);
    const rec = relTypes.get(type) ?? { type, modules: new Set(), fields: [], props: new Set() };
    rec.modules.add(moduleOf[d.name.value]); rec.fields.push(`${d.name.value}.${f.name.value}`); if (props) rec.props.add(props);
    relTypes.set(type, rec);
    fields.push({ module: moduleOf[d.name.value], node: d.name.value, field: f.name.value, type, dir, target: tn, targets: tc });
    for (const x of tc) collapsed.add(dir === "OUT" ? `${type}|${d.name.value}|${x}` : `${type}|${x}|${d.name.value}`);
    for (const x of te) expanded.add(dir === "OUT" ? `${type}|${d.name.value}|${x}` : `${type}|${x}|${d.name.value}`);
  }
}
const mods = [...new Set(Object.values(moduleOf))];
const perModule = Object.fromEntries(mods.map((m) => [m, { nodes: nodes.filter((n) => moduleOf[n] === m).length, relTypesDeclared: 0, collapsedPairs: 0 }]));
// a relationship type belongs to the first module (assembly order) that declares a field with it
const KERNEL_MEANING = args.includes("--first-declarer") ? [] : ["ASSESSES", "DERIVED_FROM", "MENTIONS", "RENDITION_OF"];
const relOwner = {};
for (const [t, r] of relTypes) { relOwner[t] = KERNEL_MEANING.includes(t) && mods.includes("K") ? "K" : mods.find((m) => r.modules.has(m)); perModule[relOwner[t]].relTypesDeclared++; }
for (const m of mods) Object.assign(perModule[m], { expandedPairs: 0, declaredCollapsedPairs: 0 });
for (const p of collapsed) { const [t] = p.split("|"); perModule[relOwner[t]].collapsedPairs++; }
for (const p of expanded) { const [t] = p.split("|"); perModule[relOwner[t]].expandedPairs++; }
{ const seen = new Set(); for (const f of fields) for (const x of f.targets) { const k = f.dir === "OUT" ? `${f.type}|${f.node}|${x}` : `${f.type}|${x}|${f.node}`; const key = `${f.module}|${k}`; if (seen.has(key)) continue; seen.add(key); perModule[f.module].declaredCollapsedPairs++; } }
const widest = [...usedUnions.entries()].sort((a, b) => b[1] - a[1]);
const allUnionsWidest = Object.entries(unions).map(([k, v]) => [k, v.length]).sort((a, b) => b[1] - a[1]);
const result = {
  nodeTypes: nodes.length, interfaces: [...ifaces].map((i) => ({ name: i, implementers: (impl[i] || []).length })),
  relationshipTypes: relTypes.size, relationshipFields: fields.length, pairsCollapsed: collapsed.size, pairsExpanded: expanded.size,
  unions: Object.keys(unions).length, widestUnionAsTarget: widest[0] ?? null, widestUnionDeclared: allUnionsWidest[0] ?? null, enums: enums.length, perModule,
};
console.log(JSON.stringify(result, null, 1));
if (opt("--json")) writeFileSync(opt("--json"), JSON.stringify({ ...result, moduleOf, relationshipTypesList: [...relTypes.values()].map((r) => ({ type: r.type, owner: relOwner[r.type], modules: [...r.modules], fields: r.fields, properties: [...r.props] })), nodesList: nodes.map((n) => ({ name: n, module: moduleOf[n] })), fields, collapsedPairs: [...collapsed].sort() }, null, 1) + "\n");
if (opt("--matrix")) {
  // seam matrix: declared relationship fields whose concrete targets (union members expanded, interfaces = their declaring module) fall in the column module
  const order = mods; const cell = {};
  for (const f of fields) { const seen = new Set(); for (const x of f.targets) { const tm = moduleOf[x]; if (seen.has(tm)) continue; seen.add(tm); const k = `${f.module}|${tm}`; cell[k] = (cell[k] ?? 0) + 1; } }
  let md = `| from \ to | ${order.join(" | ")} |\n| --- | ${order.map(() => "---:").join(" | ")} |\n`;
  for (const r of order) md += `| ${r} | ${order.map((c) => cell[`${r}|${c}`] ?? "·").join(" | ")} |\n`;
  const crossPairs = [...collapsed].filter((p) => { const [, a, b] = p.split("|"); return moduleOf[a] !== moduleOf[b]; });
  md += `\nCross-module from→to pairs (collapsed, interface targets attributed to K): ${crossPairs.length} of ${collapsed.size}.\n`;
  writeFileSync(opt("--matrix"), md);
}
if (opt("--append-map")) {
  const order = mods; const cell = {};
  for (const f of fields) { const seen = new Set(); for (const x of f.targets) { const tm = moduleOf[x]; if (seen.has(tm)) continue; seen.add(tm); const k = `${f.module}|${tm}`; cell[k] = (cell[k] ?? 0) + 1; } }
  const crossPairs = [...collapsed].filter((p) => { const [, a, b] = p.split("|"); return moduleOf[a] !== moduleOf[b]; });
  const pm = Object.fromEntries(order.map((m) => [m, 0])); for (const p of crossPairs) { const [t, a] = p.split("|"); pm[moduleOf[a]]++; }
  const NL = "\n";
  let md = "## Module seam matrix (integrator)" + NL + NL;
  md += "Added by `schema/program/final/_work/count-schema.mjs --append-map` because the map renderer above numbers the fragments D1–D14 in file order (its \"D1\" is fragment K, its \"D2\" is fragment D1, and so on) and expands interface targets into every implementing domain. This matrix uses the module ids of the assembled file's `# MODULE` banners. ";
  md += NL + NL + "**Caveats (fix stage, 2026-10-09).** (1) The candidate measured here includes the R-49 projection-cache properties (FU-01 applied by the fix stage). (2) The relationship class shown by the map above comes from the IR, which still inherits the pinned `validation-params.json` (FU-08); for three types it disagrees with the merged register, and the register wins: MEASURES (map: derived, register: asserted), HAS_VARIANT and REQUIRES_INPUT_METRIC (map: asserted, register: structural). (3) The map's pair counts are the expanded count (R-01 option B); the module table below gives both. Re-measure after FU-08 lands." + NL + NL;
  md += "A cell counts the declared relationship fields on node types of the row module whose concrete targets include a type of the column module (a union counts once per target module; an interface target counts once, for K, where it is declared). The diagonal is the module's internal edges. Every cross-module pair with its questions is in `final/seams.yaml` (`crossModuleEdges`)." + NL + NL;
  md += `| from (row) → to (column) | ${order.join(" | ")} |` + NL + `| --- | ${order.map(() => "---:").join(" | ")} |` + NL;
  for (const r of order) md += `| ${r} | ${order.map((c) => cell[`${r}|${c}`] ?? "·").join(" | ")} |` + NL;
  md += NL + `From→to pairs (collapsed): ${collapsed.size}; cross-module: ${crossPairs.length}. Cross-module pairs by the module of the stored "from" type: ${order.map((m) => `${m} ${pm[m]}`).join(", ")}.` + NL;
  md += NL + "Per-module counts (R-01 option A attribution: ASSESSES, DERIVED_FROM, MENTIONS and RENDITION_OF count in K; any other type in the first module that declares it). Budgets from 00-DIRECTIVE section 2: K ≤ 12 node types, ≤ 14 relationship types, ≤ 40 pairs; each domain module ≤ 8, ≤ 14, ≤ 35. \"declared\" = collapsed pairs produced by fields on the module's own node types." + NL + NL;
  md += "| module | node types | relationship types | pairs collapsed (A) | pairs expanded (B) | declared collapsed | over budget |" + NL + "| --- | ---: | ---: | ---: | ---: | ---: | --- |" + NL;
  for (const m of order) { const x = perModule[m]; const b = m === "K" ? [12, 14, 40] : [8, 14, 35]; const over = [x.nodes > b[0] && `nodes ${x.nodes}>${b[0]}`, x.relTypesDeclared > b[1] && `rel types ${x.relTypesDeclared}>${b[1]}`, x.collapsedPairs > b[2] && `pairs A ${x.collapsedPairs}>${b[2]}`, x.expandedPairs > b[2] && `pairs B ${x.expandedPairs}>${b[2]}`].filter(Boolean).join("; ") || "—"; md += `| ${m} | ${x.nodes} | ${x.relTypesDeclared} | ${x.collapsedPairs} | ${x.expandedPairs} | ${x.declaredCollapsedPairs} | ${over} |` + NL; }
  md += `| **total** | **${nodes.length}** | **${relTypes.size}** | **${collapsed.size}** | **${expanded.size}** | | |` + NL;
  const file = opt("--append-map"); const prev = readFileSync(file, "utf8");
  const i = prev.indexOf("## Module seam matrix (integrator)");
  writeFileSync(file, (i >= 0 ? prev.slice(0, i) : prev.replace(/\s*$/, NL + NL)) + md);
}
