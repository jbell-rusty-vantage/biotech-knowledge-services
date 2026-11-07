#!/usr/bin/env node
/**
 * Type-level diff: pinned v1 (workspace/schema-ir.json, parsed from schema/pinned/final_biotech_schema_proposal.graphql)
 * -> candidate v2 (final/schema/final_biotech_schema_v2.ir.json). Deterministic: no timestamps, sorted output.
 *
 *   node schema/program/final/_work/diff-v1-v2.mjs [--json <C:/abs/out.json>] [--md <C:/abs/out.md>]
 *   (defaults: final/_work/diff-v1-v2.json and final/_work/diff-v1-v2.tables.md)
 *
 * Mapping evidence, in precedence order (first hit decides the class; every hit is kept in `evidence`):
 *   nodes:  1 same name in v2 -> kept
 *           2 final/node-register.yaml mergedInto (every packet's 06 mergedInto, module-stamped, 227 rows); the key
 *             (pinned|from|type|name) is tokenized, the `into` text is scanned for the first v2 node type
 *             -> renamed (sole v1 source of a v2 name absent from v1) | merged (into a v2 type) |
 *                removed:folded (into text starts with string/property/enum/predicate/config/deferred, or names no v2 type)
 *           3 final/node-register.yaml deferred (+ every packet's 06 deferred) -> removed:deferred
 *           4 none -> removed:unmapped (no register names it; endpoint/fragment context printed)
 *   relationship types:
 *           1 same name -> kept
 *           2 rulings.yaml global.names.relationshipTypes replaces / replacesPinned, noModuleEdit R-11 -> merged/renamed
 *           3 relationship-register deferred reason "merged into X" / "-> X" / "replaced by X" ... (X a v2 type),
 *             and node-register mergedInto how/note arrows OLD_REL -> NEW_REL -> merged/renamed
 *           4 relationship-register predicateOnly (+ aliases, renamedFrom, mergedInto predicates) or an arrow
 *             "OLD -> predicate-only NEW" -> demoted (now an Assertion.predicate value)
 *           5 deferred reason without a v2 target -> removed:deferred
 *           6 every v1 triple touches a removed node type -> removed:endpoints
 *           7 none -> removed:unmapped
 *   properties: per kept or mapped node type, v1 fields vs v2 fields of its target; renames are verified pairs
 *     (old in v1 type, new in v2 target, old absent from v2 target) found as `old -> new`, `new (replaces old)`, or
 *     `old renamed to new` in register texts, packet 06/09 files and v2 docstrings.
 *   enums / unions / interfaces / edge-property types: kept (value or member diff), removed (with replacement when a
 *     register, ruling or arrow names one), new.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const finalDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const root = resolve(finalDir, "../../..");
const require = createRequire(resolve(root, "packages/schema-workspace/package.json"));
const YAML = require("yaml");
const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? resolve(args[args.indexOf(n) + 1]) : d);
const jsonOut = opt("--json", resolve(finalDir, "_work/diff-v1-v2.json"));
const mdOut = opt("--md", resolve(finalDir, "_work/diff-v1-v2.tables.md"));

const v1 = JSON.parse(readFileSync(resolve(root, "workspace/schema-ir.json"), "utf8"));
const v2 = JSON.parse(readFileSync(resolve(finalDir, "schema/final_biotech_schema_v2.ir.json"), "utf8"));
const nodeReg = YAML.parse(readFileSync(resolve(finalDir, "node-register.yaml"), "utf8"));
const relReg = YAML.parse(readFileSync(resolve(finalDir, "relationship-register.yaml"), "utf8"));
const rulings = YAML.parse(readFileSync(resolve(finalDir, "_work/rulings.yaml"), "utf8"));
const MODULES = ["K", ...Array.from({ length: 13 }, (_, i) => `D${i + 1}`)];
const packetText = {};
const packetReg = {};
for (const m of MODULES) {
  const dir = resolve(root, "schema/program/packets", m);
  packetText[m] = ["06-node-register.yaml", "05-relationship-register.yaml", "09-reasoning.md"].map((f) => (existsSync(resolve(dir, f)) ? readFileSync(resolve(dir, f), "utf8") : "")).join("\n");
  packetReg[m] = {
    node: YAML.parse(readFileSync(resolve(dir, "06-node-register.yaml"), "utf8")),
    rel: YAML.parse(readFileSync(resolve(dir, "05-relationship-register.yaml"), "utf8")),
  };
}

const byName = (arr, k = "name") => new Map(arr.map((x) => [x[k], x]));
const v1Nodes = byName(v1.nodes), v2Nodes = byName(v2.nodes);
const v1Rels = byName(v1.relationshipTypes, "type"), v2Rels = byName(v2.relationshipTypes, "type");
const v1Enums = byName(v1.enums), v2Enums = byName(v2.enums);
const v1Unions = byName(v1.unions), v2Unions = byName(v2.unions);
const v1Ifaces = byName(v1.interfaces), v2Ifaces = byName(v2.interfaces);
const v1Edge = byName(v1.edgePropertyTypes), v2Edge = byName(v2.edgePropertyTypes);
const sorted = (it) => [...it].sort((a, b) => a.localeCompare(b));
const pascal = (s) => (String(s).match(/[A-Z][A-Za-z0-9]+/g) ?? []);
const screaming = (s) => (String(s).match(/\b[A-Z][A-Z0-9]*_[A-Z0-9_]+\b|\b[A-Z]{3,}\b/g) ?? []);
const short = (s, n = 220) => { const t = String(s ?? "").replace(/\s+/g, " ").trim(); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };
const FOLDED = /^\s*(string|a string|property|properties|a property|enum|an enum|qualifier|a qualifier|predicate|predicate-only|deferred|not modeled|dropped|cut|config|registry|D11 action-space|literal|typed-literal|value|values|kernel Identifier per)/i;
const isFolded = (into) => FOLDED.test(String(into ?? "")) || /^\s*(kernel\s+)?(string id|string|property|properties|enum|qualifier|predicate)\b/i.test(String(into ?? ""));

// ---------------------------------------------------------------- node mapping
const mergedRows = nodeReg.mergedInto ?? [];
const deferredRows = [...(nodeReg.deferred ?? [])];
for (const m of MODULES) for (const d of packetReg[m].node.deferred ?? []) if (!deferredRows.some((x) => x.module === m && x.name === d.name)) deferredRows.push({ module: m, ...d });
const keyOf = (row) => row.pinned ?? row.from ?? row.type ?? row.name ?? "";
const intoTargets = (into) => {
  const out = [];
  for (const m of String(into ?? "").matchAll(/(?:\b(?:K|D\d{1,2})\.)?([A-Z][A-Za-z0-9]+)/g)) if (v2Nodes.has(m[1]) && !out.includes(m[1])) out.push(m[1]);
  return out;
};
const v1DefNames = new Set([...v1Nodes.keys(), ...v1Ifaces.keys(), ...v1Unions.keys(), ...v1Enums.keys(), ...v1Edge.keys()]);
const mentions = new Map(); // v1 name -> [{module, into, note, targets}]
for (const row of mergedRows) {
  const key = String(keyOf(row));
  const names = new Set(pascal(key).filter((t) => v1DefNames.has(t)));
  for (const n of names) {
    const list = mentions.get(n) ?? [];
    list.push({ module: row.module, key: short(key, 120), into: row.into, note: row.how ?? row.note ?? row.reason ?? "", targets: intoTargets(row.into) });
    mentions.set(n, list);
  }
}
const deferredOf = new Map();
for (const row of deferredRows) {
  const head = String(row.name ?? "").split("(")[0];
  for (const n of pascal(head)) if (v1DefNames.has(n)) (deferredOf.get(n) ?? deferredOf.set(n, []).get(n)).push({ module: row.module, reason: row.reason, owner: row.owner });
}

const nodeMap = {};
for (const name of sorted(v1Nodes.keys())) {
  const ev = { mergedInto: mentions.get(name) ?? [], deferred: deferredOf.get(name) ?? [] };
  if (v2Nodes.has(name)) { nodeMap[name] = { cls: "kept", target: name, evidence: ev }; continue; }
  const withTarget = ev.mergedInto.filter((e) => e.targets.length && !isFolded(e.into));
  if (withTarget.length) {
    const targets = [...new Set(withTarget.flatMap((e) => e.targets.slice(0, 1)))];
    nodeMap[name] = { cls: "merged", target: targets[0], targets, via: withTarget.map((e) => `${e.module}: ${short(e.into, 160)}`), evidence: ev };
    continue;
  }
  if (ev.mergedInto.length) { nodeMap[name] = { cls: "removed", sub: "folded", target: null, via: ev.mergedInto.map((e) => `${e.module}: ${short(e.into, 200)}`), evidence: ev }; continue; }
  if (ev.deferred.length) { nodeMap[name] = { cls: "removed", sub: "deferred", target: null, via: ev.deferred.map((e) => `${e.module}: ${short(e.reason, 200)}`), evidence: ev }; continue; }
  nodeMap[name] = { cls: "removed", sub: "unmapped", target: null, via: [`fragment ${v1Nodes.get(name).fragment}; no packet register names it`], evidence: ev };
}
// renamed = the sole v1 source of a v2 type that does not exist in v1
const sourcesOf = {};
for (const [n, m] of Object.entries(nodeMap)) if (m.cls === "merged") (sourcesOf[m.target] ??= []).push(n);
for (const [t, srcs] of Object.entries(sourcesOf)) if (!v1Nodes.has(t) && srcs.length === 1) nodeMap[srcs[0]].cls = "renamed";
const newNodes = sorted([...v2Nodes.keys()].filter((n) => !v1Nodes.has(n)));
const newNodeRows = newNodes.map((n) => ({ name: n, fragment: v2Nodes.get(n).fragment, absorbs: sorted(sourcesOf[n] ?? []), renamedFrom: (sourcesOf[n] ?? []).length === 1 ? sourcesOf[n][0] : null }));

// ---------------------------------------------------------------- relationship mapping
const relEvidence = new Map();
const addRel = (n, e) => (relEvidence.get(n) ?? relEvidence.set(n, []).get(n)).push(e);
for (const [t, spec] of Object.entries(rulings.global?.names?.relationshipTypes ?? {})) {
  for (const old of [...(spec.replaces ?? []), ...(spec.replacesPinned ?? [])]) for (const o of screaming(String(old).split("(")[0])) addRel(o, { kind: "ruling", target: t, text: `${spec.ruling}: ${t} replaces ${old}` });
}
const r11 = rulings.global?.noModuleEdit?.["R-11"];
if (r11) for (const o of screaming(r11.split("->")[0])) addRel(o, { kind: "ruling", target: "DERIVED_FROM", text: `R-11: ${r11}` });
const ARROW_KW = /(merged into|merges into|merge into|replaced by|renamed to|renamed|folded into|becomes|became|is now)\s+(?:the\s+|a\s+|one\s+|kernel\s+|typed\s+|derived\s+|asserted\s+)*`?([A-Z][A-Z0-9_]{2,})`?/g;
const relDeferred = [...(relReg.deferred ?? [])];
for (const m of MODULES) for (const d of packetReg[m].rel.deferred ?? []) {
  const row = typeof d === "string" ? { module: m, value: d } : { module: m, ...d };
  relDeferred.push(row);
}
const seenDef = new Set();
for (const row of relDeferred) {
  let head, reason;
  if (row.value !== undefined) { const s = String(row.value); const i = s.search(/\s[—–-]\s/); head = i > 0 ? s.slice(0, i) : s; reason = i > 0 ? s.slice(i + 3) : s; }
  else { head = String(row.type ?? ""); reason = String(row.reason ?? Object.entries(row).filter(([k]) => !["module", "type"].includes(k)).map(([k, v]) => `${k} ${v}`).join(" ")); }
  for (const o of screaming(head.split("(")[0])) {
    const sig = `${row.module}|${o}|${short(reason, 80)}`;
    if (seenDef.has(sig)) continue;
    seenDef.add(sig);
    let target = null;
    for (const m of reason.matchAll(ARROW_KW)) if (v2Rels.has(m[2]) && m[2] !== o) { target = m[2]; break; }
    // an arrow counts only when the deferred type itself stands on its left ("INVOLVES_PATHWAY → PART_OF_MECHANISM")
    if (!target) for (const m of reason.matchAll(new RegExp("(?:^|[^A-Z0-9_])" + o + "\\s*(?:→|->)\\s*`?([A-Z][A-Z0-9_]{2,})", "g"))) if (v2Rels.has(m[1]) && m[1] !== o) { target = m[1]; break; }
    // a reason that IS a v2 type ("ASSESSES", "HAS_EVIDENCE {role: SUPPORTS}", "kernel DERIVED_FROM") names the replacement
    const lead = /^\s*(?:the\s+|a\s+|kernel\s+|K\s+|D\d{1,2}\s+)*`?([A-Z][A-Z0-9_]{2,})`?\s*(?:\{[^}]*\}|\([^)]*\))?\s*(?:$|[;,.]|\+|with|from|on|to|→|->)/.exec(reason);
    if (!target && lead && v2Rels.has(lead[1]) && lead[1] !== o) target = lead[1];
    addRel(o, { kind: target ? "deferred-merge" : "deferred", target, module: row.module, text: short(reason, 240) });
  }
}
// v2 relationship register entries and v2 relationship docstrings that say "Replaces A, B and C"
const replacesTexts = [
  ...(relReg.relationships ?? []).map((r) => ({ type: r.type, module: r.module, text: Object.values(r).filter((v) => typeof v === "string").join(" ") })),
  ...v2.nodes.flatMap((n) => n.relationships.map((f) => ({ type: f.relationshipType, module: n.fragment, text: String(f.description ?? "") }))),
];
for (const { type, module, text } of replacesTexts) {
  for (const m of text.matchAll(/\b(?:Replaces|replaces|replacing|absorbs|subsumes)\s+(?:the\s+)?(?:pinned\s+)?([^.;]{3,240})/g)) {
    for (const o of screaming(m[1])) if (v1Rels.has(o) && !v2Rels.has(o) && o !== type) addRel(o, { kind: "register-replaces", target: type, module, text: short(`${type}: ${m[0]}`, 200) });
  }
}
const arrowTexts = [];
for (const row of mergedRows) arrowTexts.push({ module: row.module, text: `${row.into ?? ""} ${row.how ?? ""} ${row.note ?? ""} ${row.reason ?? ""}` });
for (const t of arrowTexts) {
  for (const m of t.text.matchAll(/\b([A-Z][A-Z0-9_]{2,})\b\s*(?:→|->)\s*(predicate(?:-only)?\s+)?`?([A-Z][A-Z0-9_]{2,})`?/g)) {
    const [, from, pred, to] = m;
    if (!v1Rels.has(from) || from === to) continue;
    if (pred) addRel(from, { kind: "arrow-predicate", target: null, predicate: to, module: t.module, text: short(m[0], 160) });
    else if (v2Rels.has(to)) addRel(from, { kind: "arrow", target: to, module: t.module, text: short(m[0], 160) });
  }
}
const predicateRows = [...(relReg.predicateOnly ?? []), ...(relReg.mergedInto ?? []).map((x) => ({ ...x, predicate: x.into, aliases: [x.predicate] }))];
for (const m of MODULES) for (const p of packetReg[m].rel.predicateOnly ?? []) predicateRows.push({ module: m, ...p });
for (const p of predicateRows) {
  const names = new Set([...screaming(String(p.predicate ?? "").split("(")[0]), ...(p.aliases ?? []).flatMap((a) => screaming(String(a).split("(")[0])), ...(p.renamedFrom ? screaming(String(p.renamedFrom)) : [])]);
  const main = screaming(String(p.predicate ?? "").split("(")[0])[0] ?? null;
  for (const n of names) if (v1Rels.has(n)) addRel(n, { kind: "predicate", target: null, predicate: main && n !== main && !screaming(String(p.predicate)).includes(n) ? main : n, module: p.module, text: short(p.promoteWhen ?? p.use ?? p.note ?? p.meaning ?? "", 200), registrar: p.registrar ?? null });
}
for (const [alias, spec] of Object.entries(rulings.global?.names?.predicates ?? {})) {
  for (const a of spec.aliases ?? []) for (const o of screaming(String(a).split("(")[0])) if (v1Rels.has(o)) addRel(o, { kind: "predicate", target: null, predicate: alias, module: spec.registrar, text: `${spec.ruling}: alias of predicate ${alias}` });
  if (v1Rels.has(alias) && !v2Rels.has(alias)) addRel(alias, { kind: "predicate", target: null, predicate: alias, module: spec.registrar, text: `${spec.ruling}: registered predicate (registrar ${spec.registrar})` });
}
const PRED = new Set([
  ...(relReg.predicateOnly ?? []).flatMap((p) => [...screaming(String(p.predicate ?? "").split("(")[0]), ...(p.aliases ?? []).flatMap((a) => screaming(String(a)))]),
  ...Object.keys(rulings.global?.names?.predicates ?? {}),
  ...(rulings.global?.names?.predicates?.kernelConventions?.names ?? []),
  ...(relReg.authorizingPredicates ?? []).flatMap((p) => screaming(typeof p === "string" ? p : String(p.predicate ?? ""))),
]);
const packetAll = Object.fromEntries(MODULES.map((m) => {
  const dir = resolve(root, "schema/program/packets", m);
  return [m, readdirSync(dir).filter((f) => /\.(md|ya?ml|graphql)$/.test(f)).map((f) => readFileSync(resolve(dir, f), "utf8")).join("\n")];
}));
const removedNodeSet = new Set(Object.entries(nodeMap).filter(([, m]) => m.cls === "removed").map(([n]) => n));
const relMap = {};
for (const type of sorted(v1Rels.keys())) {
  const r1 = v1Rels.get(type);
  const ev = relEvidence.get(type) ?? [];
  if (v2Rels.has(type)) {
    const r2 = v2Rels.get(type);
    const p1 = new Set(r1.triples.map((t) => `${t.from}->${t.to}`)), p2 = new Set(r2.triples.map((t) => `${t.from}->${t.to}`));
    relMap[type] = { cls: "kept", target: type, v1Class: r1.relClass, v2Class: r2.relClass, v1Props: r1.propertiesTypes, v2Props: r2.propertiesTypes, v1Pairs: p1.size, v2Pairs: p2.size, pairsKept: [...p1].filter((x) => p2.has(x)).length, evidence: ev };
    continue;
  }
  const hit = ev.find((e) => e.kind === "ruling") ?? ev.find((e) => e.kind === "register-replaces") ?? ev.find((e) => e.kind === "deferred-merge" || e.kind === "arrow");
  if (hit) { relMap[type] = { cls: "merged", target: hit.target, via: `${hit.module ? `${hit.module}: ` : ""}${hit.text}`, evidence: ev }; continue; }
  const pred = ev.find((e) => e.kind === "predicate" || e.kind === "arrow-predicate");
  if (pred) { relMap[type] = { cls: "demoted", target: null, predicate: pred.predicate, via: `${pred.module ?? ""}: ${pred.text}`, evidence: ev }; continue; }
  const defs = ev.filter((e) => e.kind === "deferred");
  if (defs.length) {
    // a deferred reason that names a registered predicate next to the word "predicate" -> demoted to that predicate
    let demoteTo = null;
    for (const d of defs) {
      for (const m of d.text.matchAll(/predicate(?:-only| family| value)?\s+`?([A-Z][A-Z0-9_]{2,})`?/g)) if (PRED.has(m[1])) { demoteTo = { p: m[1], d }; break; }
      if (!demoteTo && /^\s*predicate(-only)?\b/i.test(d.text)) demoteTo = { p: type, d };
      if (demoteTo) break;
    }
    if (demoteTo) { relMap[type] = { cls: "demoted", target: null, predicate: demoteTo.p, via: `${demoteTo.d.module}: ${demoteTo.d.text}`, evidence: ev }; continue; }
    const named = sorted(new Set(defs.flatMap((d) => screaming(d.text).filter((t) => v2Rels.has(t) && t !== type))));
    const via = defs.slice(0, 2).map((d) => `${d.module}: ${d.text}`).join(" ‖ ");
    relMap[type] = named.length ? { cls: "removed", sub: "pattern", target: null, carriedBy: named, via, evidence: ev } : { cls: "removed", sub: "deferred", target: null, via, evidence: ev };
    continue;
  }
  const ends = new Set(r1.triples.flatMap((t) => [t.from, t.to]));
  const allRemoved = r1.triples.every((t) => removedNodeSet.has(t.from) || removedNodeSet.has(t.to));
  if (allRemoved) { relMap[type] = { cls: "removed", sub: "endpoints", target: null, via: `every v1 triple has a removed endpoint (${short(sorted([...ends].filter((e) => removedNodeSet.has(e))).join(", "), 160)})`, evidence: ev }; continue; }
  const mentionedIn = MODULES.filter((m) => new RegExp(`\\b${type}\\b`).test(packetAll[m]));
  const endFate = sorted(new Set(r1.triples.map((t) => `${t.from}(${nodeMap[t.from]?.cls ?? "?"})→${t.to}(${nodeMap[t.to]?.cls ?? (v1Unions.has(t.to) ? "union" : "?")})`))).slice(0, 3).join("; ");
  relMap[type] = { cls: "removed", sub: "unmapped", target: null, via: `no register or ruling row; v1 fragments ${r1.fragments.join(",")}; triples ${endFate}${mentionedIn.length ? `; name appears in packets ${mentionedIn.join(",")}` : "; name appears in no packet file"}`, evidence: ev };
}
const relSources = {};
for (const [t, m] of Object.entries(relMap)) if (m.cls === "merged") (relSources[m.target] ??= []).push(t);
for (const [t, srcs] of Object.entries(relSources)) if (!v1Rels.has(t) && srcs.length === 1) relMap[srcs[0]].cls = "renamed";
const newRels = sorted([...v2Rels.keys()].filter((t) => !v1Rels.has(t))).map((t) => ({ type: t, fragments: v2Rels.get(t).fragments, relClass: v2Rels.get(t).relClass, absorbs: sorted(relSources[t] ?? []) }));

// ---------------------------------------------------------------- property diff + renames
const propsOf = (ir, n) => new Set((ir.nodes.find((x) => x.name === n)?.properties ?? []).map((p) => p.name));
const renameCandidates = new Map();
const scanTexts = [
  ...arrowTexts.map((t) => ({ src: `node-register mergedInto (${t.module})`, text: t.text })),
  ...MODULES.map((m) => ({ src: `packets/${m} 05/06/09`, text: packetText[m] })),
  ...v2.nodes.map((n) => ({ src: `v2 SDL ${n.name}`, text: [n.description, ...n.properties.map((p) => `${p.name}: ${p.description}`)].join("\n") })),
  ...v2.interfaces.map((n) => ({ src: `v2 SDL ${n.name}`, text: [n.description, ...n.properties.map((p) => `${p.name}: ${p.description}`)].join("\n") })),
  ...v2.edgePropertyTypes.map((n) => ({ src: `v2 SDL ${n.name}`, text: [n.description, ...n.properties.map((p) => `${p.name}: ${p.description}`)].join("\n") })),
];
const addRename = (oldN, newN, src, snippet) => { if (oldN === newN) return; const k = `${oldN}->${newN}`; if (!renameCandidates.has(k)) renameCandidates.set(k, { old: oldN, new: newN, sources: [] }); const e = renameCandidates.get(k); if (e.sources.length < 3 && !e.sources.some((s) => s.src === src)) e.sources.push({ src, snippet: short(snippet, 140) }); };
for (const { src, text } of scanTexts) {
  // `a/b → c/d` pairs positionally
  for (const m of text.matchAll(/`?([a-z][A-Za-z0-9]{2,}(?:`?\s*\/\s*`?[a-z][A-Za-z0-9]{2,})+)`?\s*(?:→|->)\s*`?([a-z][A-Za-z0-9]{2,}(?:`?\s*\/\s*`?[a-z][A-Za-z0-9]{2,})+)`?/g)) {
    const a = m[1].split("/").map((x) => x.replace(/[`\s]/g, "")), b = m[2].split("/").map((x) => x.replace(/[`\s]/g, ""));
    if (a.length === b.length) a.forEach((x, i) => addRename(x, b[i], src, m[0]));
  }
  for (const m of text.matchAll(/`?\b([a-z][A-Za-z0-9]{2,})\b`?\s*(?:→|->)\s*`?\b([a-z][A-Za-z0-9]{2,})\b`?/g)) {
    const before = text.slice(Math.max(0, m.index - 2), m.index), after = text.slice(m.index + m[0].length, m.index + m[0].length + 2);
    if (/\//.test(before) || /^`?\//.test(after)) continue; // part of a slash list, handled above
    addRename(m[1], m[2], src, m[0]);
  }
  for (const m of text.matchAll(/`?\b([a-z][A-Za-z0-9]{2,})\b`?[^.\n]{0,40}?\((?:replaces|was|formerly|renamed from)\s+`?\b([a-z][A-Za-z0-9]{2,})\b`?/g)) addRename(m[2], m[1], src, m[0]);
  for (const m of text.matchAll(/`?\b([a-z][A-Za-z0-9]{2,})\b`?\s+(?:is\s+)?renamed\s+(?:to\s+)?`?\b([a-z][A-Za-z0-9]{2,})\b`?/g)) addRename(m[1], m[2], src, m[0]);
  for (const m of text.matchAll(/replaces\s+`([a-z][A-Za-z0-9]{2,})`/g)) {
    const before = text.slice(Math.max(0, m.index - 160), m.index);
    const cand = [...before.matchAll(/`([a-z][A-Za-z0-9]{2,})`/g)].pop();
    if (cand) addRename(m[1], cand[1], src, `${cand[0]} … ${m[0]}`);
  }
}
const typePairs = []; // [v1Type, v2Type, kind]
for (const [n, m] of Object.entries(nodeMap)) if (m.target) typePairs.push([n, m.target, "node"]);
for (const n of v1Ifaces.keys()) if (v2Ifaces.has(n)) typePairs.push([n, n, "interface"]);
for (const n of v1Edge.keys()) if (v2Edge.has(n)) typePairs.push([n, n, "edge"]);
const fieldsOf = (ir, kind, n) => new Set(((kind === "node" ? ir.nodes : kind === "interface" ? ir.interfaces : ir.edgePropertyTypes).find((x) => x.name === n)?.properties ?? []).map((p) => p.name));
const verifiedRenames = [];
for (const c of renameCandidates.values()) {
  const at = [];
  for (const [a, b, kind] of typePairs) {
    const f1 = fieldsOf(v1, kind, a), f2 = fieldsOf(v2, kind, b);
    if (f1.has(c.old) && f2.has(c.new) && !f2.has(c.old)) at.push(a === b ? a : `${a}→${b}`);
  }
  if (at.length) verifiedRenames.push({ old: c.old, new: c.new, at: sorted(at), sources: c.sources });
}
verifiedRenames.sort((x, y) => x.old.localeCompare(y.old) || x.new.localeCompare(y.new));
const renamedOld = (type, f) => verifiedRenames.find((r) => r.old === f && r.at.some((a) => a === type || a.startsWith(`${type}→`)));
const propDiff = [];
for (const [a, b, kind] of typePairs) {
  const f1 = fieldsOf(v1, kind, a), f2 = fieldsOf(v2, kind, b);
  const removed = sorted([...f1].filter((x) => !f2.has(x)));
  const added = sorted([...f2].filter((x) => !f1.has(x)));
  const renames = removed.map((x) => renamedOld(a, x)).filter(Boolean).map((r) => `${r.old}→${r.new}`);
  propDiff.push({ kind, v1: a, v2: b, mapping: kind === "node" ? nodeMap[a].cls : "kept", v1Fields: f1.size, v2Fields: f2.size, kept: [...f1].filter((x) => f2.has(x)).length, removed, added, renames });
}
propDiff.sort((x, y) => x.kind.localeCompare(y.kind) || x.v1.localeCompare(y.v1));
const mongoUse = {
  v1Nodes: v1.nodes.filter((n) => n.properties.some((p) => p.name === "mongoResearchRunId")).length,
  v1EdgeTypes: v1.edgePropertyTypes.filter((e) => e.properties.some((p) => p.name === "mongoResearchRunId")).length,
  v2Nodes: v2.nodes.filter((n) => n.properties.some((p) => p.name === "mongoResearchRunId")).length,
  v2NodesLastWriter: v2.nodes.filter((n) => n.properties.some((p) => p.name === "lastWriterRunId")).length,
  v2EdgeTypesLastWriter: v2.edgePropertyTypes.filter((e) => e.properties.some((p) => p.name === "lastWriterRunId")).length,
  v2EdgeTypes: v2.edgePropertyTypes.length,
};

// ---------------------------------------------------------------- enums, unions, interfaces, edge-property types
const enumReplacement = new Map();
for (const [n, spec] of Object.entries(rulings.global?.names?.enums ?? {})) for (const o of spec.replaces ?? []) enumReplacement.set(String(o).split(" ")[0], `${n} (${spec.ruling})`);
for (const r of nodeReg.retiredEnums ?? []) enumReplacement.set(r.name, `${short(r.into, 120)} (${r.ruling})`);
for (const [n, list] of mentions) if (v1Enums.has(n)) { const t = list.map((e) => (String(e.into).match(/[A-Z][A-Za-z0-9]+/g) ?? []).find((x) => v2Enums.has(x))).find(Boolean); if (t && !enumReplacement.has(n)) enumReplacement.set(n, `${t} (${list[0].module} mergedInto)`); }
for (const t of arrowTexts) for (const m of t.text.matchAll(/\b([A-Z][a-z][A-Za-z0-9]+)\b[^→;\n]{0,60}?(?:→|->)\s*`?(?:(?:K|D\d{1,2})\.)?([A-Z][a-z][A-Za-z0-9]+)/g)) if (v1Enums.has(m[1]) && !v2Enums.has(m[1]) && v2Enums.has(m[2]) && !enumReplacement.has(m[1])) enumReplacement.set(m[1], `${m[2]} (${t.module} arrow)`);
const enumDiff = { kept: [], removed: [], added: [] };
for (const n of sorted(v1Enums.keys())) {
  const a = new Set(v1Enums.get(n).values.map((v) => v.name));
  if (v2Enums.has(n)) {
    const b = new Set(v2Enums.get(n).values.map((v) => v.name));
    const rem = sorted([...a].filter((x) => !b.has(x))), add = sorted([...b].filter((x) => !a.has(x)));
    enumDiff.kept.push({ name: n, v1Values: a.size, v2Values: b.size, removed: rem, added: add, changed: rem.length + add.length > 0 });
  } else {
    const usedBy = (v1Enums.get(n).usedBy ?? []).map((u) => `${u.type}.${u.field}`);
    const owners = new Set((v1Enums.get(n).usedBy ?? []).map((u) => u.type));
    const ownerFate = sorted([...owners].map((o) => `${o}:${nodeMap[o]?.cls ?? (v1Ifaces.has(o) ? (v2Ifaces.has(o) ? "kept-iface" : "removed-iface") : v1Edge.has(o) ? (v2Edge.has(o) ? "kept-edge" : "removed-edge") : "?")}`));
    enumDiff.removed.push({ name: n, values: a.size, replacement: enumReplacement.get(n) ?? null, usedBy: usedBy.slice(0, 4), ownerFate });
  }
}
for (const n of sorted(v2Enums.keys())) if (!v1Enums.has(n)) enumDiff.added.push({ name: n, values: v2Enums.get(n).values.length, fragment: v2Enums.get(n).fragment });
const unionDiff = { kept: [], removed: [], added: [] };
const retiredUnion = new Map((nodeReg.unionsRetired ?? []).flatMap((u) => String(u.union).split("/").map((x) => [x.trim(), `${u.module}: ${u.replacedBy}`])));
for (const n of sorted(v1Unions.keys())) {
  if (v2Unions.has(n)) { const a = new Set(v1Unions.get(n).members), b = new Set(v2Unions.get(n).members); unionDiff.kept.push({ name: n, v1Members: a.size, v2Members: b.size, removed: sorted([...a].filter((x) => !b.has(x))), added: sorted([...b].filter((x) => !a.has(x))) }); }
  else unionDiff.removed.push({ name: n, members: v1Unions.get(n).members.length, replacedBy: retiredUnion.get(n) ?? (mentions.get(n)?.map((e) => `${e.module}: ${short(e.into, 120)}`).join(" | ") || null) });
}
for (const n of sorted(v2Unions.keys())) if (!v1Unions.has(n)) unionDiff.added.push({ name: n, members: v2Unions.get(n).members, fragment: v2Unions.get(n).fragment });
const ifaceDiff = { kept: sorted([...v1Ifaces.keys()].filter((n) => v2Ifaces.has(n))), removed: sorted([...v1Ifaces.keys()].filter((n) => !v2Ifaces.has(n))).map((n) => ({ name: n, replacedBy: mentions.get(n)?.map((e) => `${e.module}: ${short(e.into, 140)}`).join(" | ") ?? null })), added: sorted([...v2Ifaces.keys()].filter((n) => !v1Ifaces.has(n))) };
const edgeReplacement = new Map(Object.entries(rulings.global?.names?.edgePropertyTypes?.retired ?? {}));
const edgeDiff = { kept: sorted([...v1Edge.keys()].filter((n) => v2Edge.has(n))), removed: sorted([...v1Edge.keys()].filter((n) => !v2Edge.has(n))).map((n) => ({ name: n, replacedBy: edgeReplacement.get(n) ?? mentions.get(n)?.map((e) => `${e.module}: ${short(e.into, 120)}`).join(" | ") ?? null, usedBy: sorted(new Set(v1.relationshipTypes.filter((r) => r.propertiesTypes.includes(n)).map((r) => r.type))).length })), added: sorted([...v2Edge.keys()].filter((n) => !v1Edge.has(n))) };

// ---------------------------------------------------------------- counts + output
const count = (obj, key = "cls") => Object.values(obj).reduce((a, m) => { const k = m.sub ? `${m[key]}:${m.sub}` : m[key]; a[k] = (a[k] ?? 0) + 1; return a; }, {});
const summary = {
  inputs: { v1: { file: "workspace/schema-ir.json", schemaDigest: v1.schemaDigest, nodes: v1.nodes.length, relationshipTypes: v1.relationshipTypes.length, enums: v1.enums.length, unions: v1.unions.length, interfaces: v1.interfaces.length, edgePropertyTypes: v1.edgePropertyTypes.length }, v2: { file: "final/schema/final_biotech_schema_v2.ir.json", schemaDigest: v2.schemaDigest, nodes: v2.nodes.length, relationshipTypes: v2.relationshipTypes.length, enums: v2.enums.length, unions: v2.unions.length, interfaces: v2.interfaces.length, edgePropertyTypes: v2.edgePropertyTypes.length }, mergedIntoRows: mergedRows.length, nodeDeferredRows: deferredRows.length, relDeferredRows: relDeferred.length, predicateRows: predicateRows.length },
  nodes: { ...count(nodeMap), new: newNodeRows.filter((r) => !r.absorbs.length).length, newAbsorbing: newNodeRows.filter((r) => r.absorbs.length > 1).length, newByRename: newNodeRows.filter((r) => r.renamedFrom).length },
  relationshipTypes: { ...count(relMap), new: newRels.filter((r) => !r.absorbs.length).length, newAbsorbing: newRels.filter((r) => r.absorbs.length > 1).length, newByRename: newRels.filter((r) => r.absorbs.length === 1).length },
  keptRelationshipTypes: { classChanged: Object.values(relMap).filter((m) => m.cls === "kept" && m.v1Class !== m.v2Class).length, edgePropsChanged: Object.values(relMap).filter((m) => m.cls === "kept" && JSON.stringify(m.v1Props) !== JSON.stringify(m.v2Props)).length },
  properties: { verifiedRenames: verifiedRenames.length, typesCompared: propDiff.length, fieldsRemoved: propDiff.reduce((a, p) => a + p.removed.length, 0), fieldsAdded: propDiff.reduce((a, p) => a + p.added.length, 0), mongoResearchRunId: mongoUse },
  enums: { kept: enumDiff.kept.length, keptChanged: enumDiff.kept.filter((e) => e.changed).length, removed: enumDiff.removed.length, removedWithReplacement: enumDiff.removed.filter((e) => e.replacement).length, added: enumDiff.added.length },
  unions: { kept: unionDiff.kept.length, removed: unionDiff.removed.length, added: unionDiff.added.length },
  interfaces: { kept: ifaceDiff.kept.length, removed: ifaceDiff.removed.length, added: ifaceDiff.added.length },
  edgePropertyTypes: { kept: edgeDiff.kept.length, removed: edgeDiff.removed.length, added: edgeDiff.added.length },
};
writeFileSync(jsonOut, `${JSON.stringify({ summary, nodes: nodeMap, newNodes: newNodeRows, relationshipTypes: relMap, newRelationshipTypes: newRels, verifiedRenames, propertyDiff: propDiff, enums: enumDiff, unions: unionDiff, interfaces: ifaceDiff, edgePropertyTypes: edgeDiff }, null, 1)}\n`, "utf8");

// Markdown tables (embedded verbatim in migration-notes.md appendices)
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const L = [];
L.push("<!-- GENERATED by final/_work/diff-v1-v2.mjs; do not edit, re-run the script -->");
L.push("", "### A1. Node types: pinned v1 (192) → candidate v2", "", "| v1 node type | v1 fragment | class | v2 type | evidence (register row / reason) |", "| --- | --- | --- | --- | --- |");
for (const [n, m] of Object.entries(nodeMap)) L.push(`| ${n} | ${v1Nodes.get(n).fragment} | ${m.sub ? `${m.cls}:${m.sub}` : m.cls} | ${m.cls === "kept" ? n : m.target ?? "—"}${m.targets && m.targets.length > 1 ? ` (also ${m.targets.slice(1).join(", ")})` : ""} | ${esc(m.cls === "kept" ? (m.evidence.mergedInto[0] ? `${m.evidence.mergedInto[0].module}: ${short(m.evidence.mergedInto[0].note || m.evidence.mergedInto[0].into, 140)}` : "") : short((m.via ?? []).join(" ‖ "), 260))} |`);
L.push("", "### A2. Node types new in v2 (not in v1)", "", "| v2 node type | module | absorbs v1 types |", "| --- | --- | --- |");
for (const r of newNodeRows) L.push(`| ${r.name} | ${r.fragment} | ${r.absorbs.join(", ") || "— (new)"}${r.renamedFrom ? " (rename)" : ""} |`);
L.push("", "### A3. Relationship types: pinned v1 (393) → candidate v2", "", "| v1 relationship type | class | v2 type / predicate | evidence |", "| --- | --- | --- | --- |");
for (const [t, m] of Object.entries(relMap)) {
  const tgt = m.cls === "kept" ? `${t}${m.v1Class !== m.v2Class ? ` (class ${m.v1Class}→${m.v2Class})` : ""}; pairs ${m.v1Pairs}→${m.v2Pairs}` : m.cls === "demoted" ? `Assertion.predicate ${m.predicate}` : m.target ?? "—";
  L.push(`| ${t} | ${m.sub ? `${m.cls}:${m.sub}` : m.cls} | ${esc(tgt)} | ${esc(m.cls === "kept" ? (JSON.stringify(m.v1Props) !== JSON.stringify(m.v2Props) ? `edge props ${m.v1Props.join("+") || "none"} → ${m.v2Props.join("+") || "none"}` : "") : short(m.via, 220))} |`);
}
L.push("", "### A4. Relationship types new in v2", "", "| v2 relationship type | class | modules | absorbs v1 types |", "| --- | --- | --- | --- |");
for (const r of newRels) L.push(`| ${r.type} | ${r.relClass} | ${r.fragments.join(", ")} | ${r.absorbs.join(", ") || "— (new)"} |`);
L.push("", "### A5. Verified property renames (old in the v1 type, new in its v2 target, old absent there)", "", "| v1 property | v2 property | where (v1 type → v2 type) | evidence |", "| --- | --- | --- | --- |");
for (const r of verifiedRenames) L.push(`| ${r.old} | ${r.new} | ${esc(short(r.at.join(", "), 200))} | ${esc(r.sources.map((s) => `${s.src}: \`${s.snippet.replace(/`/g, "")}\``).join(" ‖ "))} |`);
L.push("", "### A6. Field diff per kept or mapped type (v1 fields → v2 fields of the target)", "", "| kind | v1 type | v2 type | map | v1 / v2 / kept | removed | added |", "| --- | --- | --- | --- | --- | --- | --- |");
for (const p of propDiff) L.push(`| ${p.kind} | ${p.v1} | ${p.v2} | ${p.mapping} | ${p.v1Fields} / ${p.v2Fields} / ${p.kept} | ${esc(p.removed.map((x) => (p.renames.find((r) => r.startsWith(`${x}→`)) ?? x)).join(", "))} | ${esc(p.added.join(", "))} |`);
L.push("", "### A7. Enums", "", `Kept by name: ${enumDiff.kept.length} (${enumDiff.kept.filter((e) => e.changed).length} with value changes). Removed: ${enumDiff.removed.length}. New: ${enumDiff.added.length}.`, "", "Kept enums with value changes:", "", "| enum | v1 → v2 values | removed values | added values |", "| --- | --- | --- | --- |");
for (const e of enumDiff.kept.filter((x) => x.changed)) L.push(`| ${e.name} | ${e.v1Values} → ${e.v2Values} | ${esc(short(e.removed.join(", "), 300))} | ${esc(short(e.added.join(", "), 300))} |`);
L.push("", "Removed enums:", "", "| enum | values | replacement | v1 owner types (fate) |", "| --- | --- | --- | --- |");
for (const e of enumDiff.removed) L.push(`| ${e.name} | ${e.values} | ${esc(e.replacement ?? "— (owner type or field removed)")} | ${esc(short(e.ownerFate.join(", "), 160))} |`);
L.push("", "New enums:", "", `${enumDiff.added.map((e) => `${e.name} (${e.fragment}, ${e.values})`).join(", ")}`);
L.push("", "### A8. Unions, interfaces, edge-property types", "", "| kind | name | fate | detail |", "| --- | --- | --- | --- |");
for (const u of unionDiff.removed) L.push(`| union | ${u.name} | removed (${u.members} members) | ${esc(u.replacedBy ?? "—")} |`);
for (const u of unionDiff.kept) L.push(`| union | ${u.name} | kept (${u.v1Members}→${u.v2Members}) | ${esc(`-${u.removed.join(",")} +${u.added.join(",")}`)} |`);
for (const u of unionDiff.added) L.push(`| union | ${u.name} | new (${u.fragment}) | ${esc(u.members.join(" \\| "))} |`);
for (const i of ifaceDiff.removed) L.push(`| interface | ${i.name} | removed | ${esc(i.replacedBy ?? "—")} |`);
for (const i of ifaceDiff.kept) L.push(`| interface | ${i} | kept | |`);
for (const i of ifaceDiff.added) L.push(`| interface | ${i} | new | |`);
for (const e of edgeDiff.removed) L.push(`| edge props | ${e.name} | removed (used by ${e.usedBy} v1 types) | ${esc(e.replacedBy ?? "—")} |`);
for (const e of edgeDiff.kept) L.push(`| edge props | ${e} | kept | |`);
for (const e of edgeDiff.added) L.push(`| edge props | ${e} | new | |`);
writeFileSync(mdOut, `${L.join("\n")}\n`, "utf8");
console.log(JSON.stringify(summary, null, 1));
