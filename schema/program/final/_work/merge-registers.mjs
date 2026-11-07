#!/usr/bin/env node
/**
 * Merges the per-module register fragments (final/_work/registers/<M>.{node,relationship,seams}.yaml) into
 * final/node-register.yaml, final/relationship-register.yaml and final/seams.yaml, and checks them against the
 * assembled SDL (final/schema/final_biotech_schema_v2.graphql). Deterministic: no timestamps.
 *
 *   node schema/program/final/_work/merge-registers.mjs [--check-only] [--report <C:/abs/report.json>]
 *
 * Merge rule: every list-valued top-level key of a fragment is concatenated in module order (K, D1 … D13); each object
 * item is stamped with `module: <fragment module>` (kept if already present; a differing value is reported). Scalar or
 * map-valued keys other than version/module go to `moduleExtras.<module>.<key>`.
 * seams.yaml additionally gets `crossModuleEdges`: one row per cross-module from→to pair of the assembled SDL
 * (collapsed count, interface targets attributed to K) with the union of questions from every seam row and register
 * entry that names it; and `cutEdges`: every seam row with status cut.
 * Checks (exit 1 when any violation): every relationship type in the SDL has a register entry with non-empty questions,
 * pattern, populatedBy and fixture; every node type has whyNode and identityKeys; every cross-module SDL pair has a seam
 * row; register entries naming types absent from the SDL are listed (stale).
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const finalDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const require = createRequire(resolve(finalDir, "../../../packages/schema-workspace/package.json"));
const YAML = require("yaml");
const { parse } = require("graphql");
const args = process.argv.slice(2);
const checkOnly = args.includes("--check-only");
const reportPath = args.includes("--report") ? args[args.indexOf("--report") + 1] : null;
const regDir = resolve(finalDir, "_work/registers");
const sdlFile = resolve(finalDir, "schema/final_biotech_schema_v2.graphql");

const MODULES = ["K", ...Array.from({ length: 13 }, (_, i) => `D${i + 1}`)];
const sha = (t) => createHash("sha256").update(t).digest("hex");

// ---------- SDL ----------
const sdlText = readFileSync(sdlFile, "utf8");
const sdlLines = sdlText.split(/\r?\n/);
let cur = null;
const modAt = sdlLines.map((l) => {
  const m = /^# MODULE (\S+)/.exec(l);
  if (m) cur = m[1] === "kernel" ? "K" : m[1];
  return cur;
});
const doc = parse(sdlText);
const moduleOf = {}, unions = {}, ifaces = new Set(), impl = {}, nodes = [];
for (const d of doc.definitions) {
  if (!d.name) continue;
  moduleOf[d.name.value] = modAt[d.loc.startToken.line - 1];
  if (d.kind === "UnionTypeDefinition") unions[d.name.value] = d.types.map((t) => t.name.value);
  if (d.kind === "InterfaceTypeDefinition") ifaces.add(d.name.value);
  if (d.kind === "ObjectTypeDefinition") {
    for (const i of d.interfaces || []) (impl[i.name.value] ??= []).push(d.name.value);
    if ((d.directives || []).some((x) => x.name.value === "node")) nodes.push(d.name.value);
  }
}
const sdlRelTypes = new Map(); // type -> {fields:[], pairs:Set}
const pairs = new Map(); // "T|from|to" -> {type, from, to, declaredOn:[]}
for (const d of doc.definitions) {
  if (d.kind !== "ObjectTypeDefinition" || !nodes.includes(d.name.value)) continue;
  for (const f of d.fields || []) {
    const r = (f.directives || []).find((x) => x.name.value === "relationship");
    if (!r) continue;
    const a = (n) => r.arguments.find((x) => x.name.value === n)?.value?.value;
    const type = a("type"), dir = a("direction");
    let t = f.type;
    while (t.type) t = t.type;
    const targets = unions[t.name.value] ?? [t.name.value];
    const rec = sdlRelTypes.get(type) ?? { fields: [], pairs: new Set() };
    rec.fields.push(`${d.name.value}.${f.name.value}`);
    for (const x of targets) {
      const [from, to] = dir === "OUT" ? [d.name.value, x] : [x, d.name.value];
      const k = `${type}|${from}|${to}`;
      rec.pairs.add(k);
      const p = pairs.get(k) ?? { type, from, to, declaredOn: [] };
      p.declaredOn.push(`${d.name.value}.${f.name.value} (${dir}${unions[t.name.value] ? `, union ${t.name.value}` : ""})`);
      pairs.set(k, p);
    }
    sdlRelTypes.set(type, rec);
  }
}
const typeNames = new Set([...nodes, ...Object.keys(unions), ...ifaces]);
const namesIn = (v) => {
  // type names mentioned in a register/seam from/to value (string, list or object); "Module.Type" and bare "Type"
  // parenthetical remarks ("D7.Organization (member of union X)", "Source (K)") are comments, not endpoints
  const s = (typeof v === "string" ? v : JSON.stringify(v ?? "")).replace(/\([^)]*\)/g, " ");
  const out = new Set();
  for (const m of s.matchAll(/(?:\b(?:K|D\d+)\.)?\b([A-Z][A-Za-z0-9]+)\b/g)) if (typeNames.has(m[1])) out.add(m[1]);
  return [...out];
};
const expand = (names) => names.flatMap((n) => unions[n] ?? [n]);
// for register coverage only: an interface named in a register entry covers its implementers
const expandIface = (names) => expand(names).flatMap((n) => (ifaces.has(n) ? [n, ...(impl[n] ?? [])] : [n]));

// ---------- fragments ----------
const sources = [];
const load = (kind) => {
  const merged = {};
  const extras = {};
  const stampIssues = [];
  for (const m of MODULES) {
    const file = resolve(regDir, `${m}.${kind}.yaml`);
    let text;
    try { text = readFileSync(file, "utf8"); } catch { continue; }
    sources.push({ module: m, file: `_work/registers/${m}.${kind}.yaml`, sha256: sha(text) });
    const d = YAML.parse(text, { uniqueKeys: false });
    for (const [k, v] of Object.entries(d)) {
      if (k === "version" || k === "module") continue;
      if (Array.isArray(v)) {
        merged[k] ??= [];
        for (const item of v) {
          if (item && typeof item === "object" && !Array.isArray(item)) {
            if (item.module && item.module !== m) stampIssues.push(`${kind}.${k}: item ${item.type ?? item.name ?? "?"} in ${m} fragment has module ${item.module}`);
            const { module: _drop, ...rest } = item;
            merged[k].push({ module: m, ...rest });
          } else merged[k].push({ module: m, value: item });
        }
      } else (extras[m] ??= {})[k] = v;
    }
  }
  return { merged, extras, stampIssues };
};
const nodeReg = load("node");
const relReg = load("relationship");
const seamReg = load("seams");

// ---------- checks ----------
const violations = [];
const warnings = [];
const empty = (v) => v == null || (Array.isArray(v) && v.length === 0) || (typeof v === "string" && v.trim() === "");

// relationship types
const relEntries = relReg.merged.relationships ?? [];
const byType = new Map();
for (const e of relEntries) {
  const t = String(e.type).trim();
  (byType.get(t) ?? byType.set(t, []).get(t)).push(e);
}
for (const [t] of sdlRelTypes) {
  const es = byType.get(t);
  if (!es) { violations.push(`relationship ${t}: in SDL, no register entry`); continue; }
  for (const e of es) for (const f of ["questions", "pattern", "populatedBy", "fixture"]) if (empty(e[f])) violations.push(`relationship ${t} (${e.module}): empty ${f}${f === "fixture" && e.fixtureRequest ? ` (fixtureRequest: ${JSON.stringify(e.fixtureRequest)})` : ""}`);
}
for (const e of relEntries) for (const f of [].concat(e.fixture ?? [])) if (!/^final\/fixtures\/(K|D\d+|cross-domain)\//.test(String(f))) warnings.push(`relationship ${e.type} (${e.module}): fixture path ${f} is not under final/fixtures/<module>/ or final/fixtures/cross-domain/`);
for (const [t, es] of byType) if (!sdlRelTypes.has(t)) warnings.push(`relationship register entry ${t} (${es.map((e) => e.module).join(", ")}) has no field in the SDL`);
for (const [t, es] of byType) if (es.length > 1) warnings.push(`relationship ${t} has ${es.length} register entries (${es.map((e) => e.module + (e.registrar ? `, registrar ${e.registrar}` : "")).join("; ")})`);
// pair coverage by register from/to
const pairCoveredByReg = new Set();
for (const e of relEntries) {
  const fr = expandIface(namesIn(e.from)), to = expandIface(namesIn(e.to));
  for (const a of fr) for (const b of to) pairCoveredByReg.add(`${String(e.type).trim()}|${a}|${b}`);
  for (const p of e.pairs ?? []) { const ns = expand(namesIn(p)); if (ns.length >= 2) pairCoveredByReg.add(`${String(e.type).trim()}|${ns[0]}|${ns[1]}`); }
}
const isIfaceTarget = (k) => { const [, a, b] = k.split("|"); return ifaces.has(a) || ifaces.has(b); };
for (const [k] of pairs) if (!pairCoveredByReg.has(k)) {
  const [t, a, b] = k.split("|");
  // an interface target is covered when the entry names the interface
  warnings.push(`pair ${t} ${a}→${b}: no register entry names this from/to${isIfaceTarget(k) ? " (interface target)" : ""}`);
}

// predicates (R-52 one registrar per predicate; R-53 no predicateOnly value equals a relationship type name)
const predEntries = [...(relReg.merged.predicateOnly ?? []), ...(relReg.merged.authorizingPredicates ?? [])].filter((e) => e.predicate);
const byPred = new Map();
for (const e of predEntries) (byPred.get(e.predicate) ?? byPred.set(e.predicate, []).get(e.predicate)).push(e);
for (const [p, es] of byPred) if (es.length > 1) warnings.push(`predicate ${p} registered ${es.length} times (${es.map((e) => `${e.module}${e.registrar ? `/registrar ${e.registrar}` : ""}`).join("; ")})`);
for (const e of relReg.merged.predicateOnly ?? []) if (e.predicate && sdlRelTypes.has(e.predicate)) warnings.push(`predicateOnly ${e.predicate} (${e.module}) equals an SDL relationship type name (R-53)`);

// node types
const nodeEntries = nodeReg.merged.nodes ?? [];
const byNode = new Map();
for (const e of nodeEntries) (byNode.get(e.name) ?? byNode.set(e.name, []).get(e.name)).push(e);
for (const n of nodes) {
  const es = byNode.get(n);
  if (!es) { violations.push(`node ${n}: in SDL, no register entry`); continue; }
  for (const e of es) for (const f of ["whyNode", "identityKeys"]) if (empty(e[f])) violations.push(`node ${n} (${e.module}): empty ${f}`);
  if (es.length > 1) warnings.push(`node ${n} has ${es.length} register entries (${es.map((e) => e.module).join(", ")})`);
  if (es.some((e) => e.module !== moduleOf[n])) warnings.push(`node ${n}: SDL module ${moduleOf[n]}, register module ${es.map((e) => e.module).join(", ")}`);
}
for (const [n, es] of byNode) if (!nodes.includes(n)) warnings.push(`node register entry ${n} (${es.map((e) => e.module).join(", ")}) is not an SDL node type`);

// seams: cross-module edges
const seamRows = seamReg.merged.seams ?? [];
const rowPairs = (row, viaIface = true) => {
  const fr = expand(namesIn(row.from)), to = expand(namesIn(row.to));
  const out = [];
  // a row naming a concrete implementer also matches the SDL pair whose endpoint is the interface it implements
  const up = (n) => (viaIface ? [n, ...[...ifaces].filter((i) => (impl[i] ?? []).includes(n))] : [n]);
  for (const a of fr) for (const b of to) for (const a2 of up(a)) for (const b2 of up(b)) out.push(`${String(row.type).trim()}|${a2}|${b2}`);
  return out;
};
const crossModuleEdges = [];
for (const [k, p] of [...pairs.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const mf = moduleOf[p.from], mt = moduleOf[p.to];
  if (mf === mt) continue;
  const rows = seamRows.filter((r) => rowPairs(r).includes(k));
  const regs = relEntries.filter((e) => String(e.type).trim() === p.type && expandIface(namesIn(e.from)).includes(p.from) && expandIface(namesIn(e.to)).includes(p.to));
  const questions = [...new Set([...rows.flatMap((r) => r.questions ?? []), ...regs.flatMap((e) => e.questions ?? [])])].sort();
  const word = (r) => /^\w+/.exec(String(r.status ?? "accepted"))[0];
  const statuses = [...new Set(rows.map(word))];
  const exactCut = rows.some((r) => word(r) === "cut" && rowPairs(r, false).includes(k));
  if (rows.length === 0) violations.push(`cross-module pair ${p.type} ${mf}.${p.from}→${mt}.${p.to}: no seam row in any module`);
  // a cut row that names a concrete member of an interface target is an admission rule, not an SDL pair; warn only on exact matches
  if (exactCut) warnings.push(`cross-module pair ${p.type} ${mf}.${p.from}→${mt}.${p.to}: a seam row says cut but the SDL declares it (${rows.filter((r) => r.status === "cut").map((r) => r.module).join(", ")})`);
  if (questions.length === 0) violations.push(`cross-module pair ${p.type} ${mf}.${p.from}→${mt}.${p.to}: no question on any seam row or register entry`);
  crossModuleEdges.push({
    type: p.type, from: `${mf}.${p.from}`, to: `${mt}.${p.to}`, declaredOn: p.declaredOn, registeredBy: [...new Set(regs.map((e) => e.module))],
    status: rows.length === 0 ? "no seam row" : exactCut ? "contested (a seam row says cut)" : "accepted", rowStatuses: statuses, seamRows: [...new Set(rows.map((r) => r.module))],
    bothSides: rows.some((r) => r.module === mf) && rows.some((r) => r.module === mt), questions,
  });
}
const cutEdges = seamRows.filter((r) => /^cut/.test(String(r.status ?? ""))).map((r) => ({ module: r.module, type: r.type, from: r.from, to: r.to, questions: r.questions ?? [], ruling: r.ruling ?? null, note: r.note ?? null, inSdl: rowPairs(r).some((k) => pairs.has(k)) }));

const allIssues = [...nodeReg.stampIssues, ...relReg.stampIssues, ...seamReg.stampIssues];
const summary = {
  sdl: { file: "schema/final_biotech_schema_v2.graphql", sha256: sha(sdlText), nodeTypes: nodes.length, relationshipTypes: sdlRelTypes.size, pairsCollapsed: pairs.size, crossModulePairs: crossModuleEdges.length },
  nodeRegister: Object.fromEntries(Object.entries(nodeReg.merged).map(([k, v]) => [k, v.length])),
  relationshipRegister: Object.fromEntries(Object.entries(relReg.merged).map(([k, v]) => [k, v.length])),
  seams: { ...Object.fromEntries(Object.entries(seamReg.merged).map(([k, v]) => [k, v.length])), crossModuleEdges: crossModuleEdges.length, crossModuleEdgesOneSided: crossModuleEdges.filter((e) => !e.bothSides).length, cutEdges: cutEdges.length },
  violations: violations.length, warnings: warnings.length, stampIssues: allIssues.length,
};

// ---------- write ----------
const header = (title) => `# ${title}\n# GENERATED by final/_work/merge-registers.mjs from final/_work/registers/*.yaml; do not edit, edit the fragment and re-run.\n# Module order: ${MODULES.join(", ")}. Each item is stamped with the module whose fragment it came from.\n`;
const dump = (o) => YAML.stringify(o, { lineWidth: 0, aliasDuplicateObjects: false });
if (!checkOnly) {
  const srcOf = (kind) => sources.filter((s) => s.file.endsWith(`.${kind}.yaml`));
  writeFileSync(resolve(finalDir, "node-register.yaml"), header("Merged node register (candidate v2)") + dump({ version: 1, sdl: summary.sdl, sources: srcOf("node"), ...nodeReg.merged, moduleExtras: nodeReg.extras }), "utf8");
  writeFileSync(resolve(finalDir, "relationship-register.yaml"), header("Merged relationship register (candidate v2)") + dump({ version: 1, sdl: summary.sdl, sources: srcOf("relationship"), ...relReg.merged, moduleExtras: relReg.extras }), "utf8");
  writeFileSync(resolve(finalDir, "seams.yaml"), header("Merged seams (candidate v2): every cross-module edge, accepted or cut, with its questions") + dump({ version: 1, sdl: summary.sdl, sources: srcOf("seams"), crossModuleEdges, cutEdges, ...seamReg.merged, moduleExtras: seamReg.extras }), "utf8");
}
if (reportPath) writeFileSync(reportPath, JSON.stringify({ summary, violations, warnings, stampIssues: allIssues }, null, 1) + "\n");
console.log(JSON.stringify(summary, null, 1));
for (const v of violations) console.log("VIOLATION", v);
for (const w of warnings) console.log("WARN", w);
for (const s of allIssues) console.log("STAMP", s);
process.exit(violations.length ? 1 : 0);
