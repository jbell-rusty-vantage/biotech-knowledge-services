#!/usr/bin/env node
// Task-design check for cross-domain schema-discovery gold (does not change gold).
//
//   node evals/v2/check-path-reachability.mjs --suite <suiteDir> [--max-hops 3] [--out <file>]
//
// For every cross-domain task whose gold is a path: each hop must be a legal register relationship (from/to members,
// module prefixes and interface members expanded), the path must have <= max-hops hops, and the gold card set must be
// reachable from the named start type within max-hops over the register graph (either direction). Also reports how many
// distinct <= max-hops paths connect the named endpoints (ambiguity of a single gold path). Output names task ids and
// counts only; it never prints prompts (keeps blinded sets private).
import fs from "node:fs";
import path from "node:path";
import { YAML } from "../../scripts/migration/lib/common.mjs";

const args = {};
for (let i = 2; i < process.argv.length; i++) if (process.argv[i].startsWith("--")) args[process.argv[i].slice(2)] = process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[++i] : true;
const MAX = Number(args["max-hops"] ?? 3);
const { loadRelease } = await import(new URL("../../packages/schema-workspace/dist/index.js", import.meta.url).href);
const release = loadRelease();
const rels = YAML.parse(fs.readFileSync(path.join(release.dir, "registers", "relationship-register.yaml"), "utf8")).relationships;
const nodes = new Set(YAML.parse(fs.readFileSync(path.join(release.dir, "registers", "node-register.yaml"), "utf8")).nodes.map((n) => n.name));
const strip = (t) => String(t).replace(/^(K|D\d+)\./, "").replace(/\s*\(.*\)$/, "").trim();
const asList = (v) => (Array.isArray(v) ? v : String(v).split(/\s*\|\s*/)).map(strip);
// interface members (Subjectable etc.) from the IR so "Subjectable" endpoints are legal for any implementer
const ifaces = {};
for (const i of Object.values(release.ir.interfaces ?? {})) ifaces[i.name] = new Set(i.implementers ?? []);
const covers = (decl, t) => decl === t || ifaces[decl]?.has(t);
const legalHop = (type, from, to) => rels.some((r) => r.type === type && asList(r.from).some((f) => covers(f, from) || f === from) && asList(r.to).some((x) => covers(x, to) || x === to));
const edges = [];
for (const r of rels) for (const f of asList(r.from)) for (const t of asList(r.to)) edges.push({ type: r.type, from: f, to: t });
function pathsBetween(a, c, max) {
  const out = [];
  const walk = (cur, hops, seen) => {
    if (hops.length && cur === c) return out.push(hops.map((h) => h.type).join(">"));
    if (hops.length >= max) return;
    for (const e of edges) {
      const fwd = e.from === cur || covers(e.from, cur);
      const back = e.to === cur || covers(e.to, cur);
      if (fwd && !seen.has(e.to)) walk(e.to, [...hops, e], new Set([...seen, e.to]));
      if (back && !seen.has(e.from)) walk(e.from, [...hops, e], new Set([...seen, e.from]));
    }
  };
  walk(a, [], new Set([a]));
  return [...new Set(out)];
}
const dir = path.resolve(args.suite);
const tasks = JSON.parse(fs.readFileSync(path.join(dir, "tasks.json"), "utf8")).tasks;
const spec = JSON.parse(fs.readFileSync(path.join(dir, "gold-spec.json"), "utf8")).gold;
const rows = [];
for (const t of tasks.filter((x) => x.category === "cross-domain")) {
  const g = spec[t.id];
  if (g.kind !== "path") {
    rows.push({ id: t.id, kind: g.kind, note: "not a path gold" });
    continue;
  }
  const hops = g.hops.map(([type, from, to]) => ({ type, from, to }));
  const legal = hops.every((h) => legalHop(h.type, h.from, h.to));
  const a = hops[0].from;
  const c = hops.at(-1).to;
  const alt = pathsBetween(a, c, MAX);
  const goldSeq = hops.map((h) => h.type).join(">");
  rows.push({ id: t.id, hops: hops.length, legal, withinMaxHops: hops.length <= MAX, goldReachableWithinMax: alt.includes(goldSeq), distinctPathsWithinMax: alt.length, goldCardCount: new Set(hops.map((h) => h.type)).size });
}
const summary = { suite: path.basename(dir), maxHops: MAX, tasks: rows.length, allLegal: rows.every((r) => r.legal !== false), withinMax: rows.filter((r) => r.withinMaxHops).length, exceedMax: rows.filter((r) => r.withinMaxHops === false).map((r) => ({ id: r.id, hops: r.hops })), ambiguous: rows.filter((r) => (r.distinctPathsWithinMax ?? 0) > 1).map((r) => ({ id: r.id, paths: r.distinctPathsWithinMax })), rows };
if (args.out) fs.writeFileSync(path.resolve(args.out), JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));
