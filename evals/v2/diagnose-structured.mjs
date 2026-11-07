#!/usr/bin/env node
// Diagnoses structured-discovery misses on a schema-discovery suite (gold owner's tool; no LLM, no network).
//
//   node evals/v2/diagnose-structured.mjs --suite <suiteDir> [--base-limits 3,5,7,10] [--out <custody file>]
//
// Calls the workspace's own structured search (`searchWorkspace(..., {expand: "paths", baseLimit})`, the same code as
// `bks-schema search --expand paths`) with explicit base limits, because `bks-schema eval --mode structured` does not
// forward --base-limit (it runs with the default, which equals the 10-candidate cap). Recall@10 follows the eval
// definition: per task |gold cards in the top-10 candidates| / |gold cards|, averaged. Every missed cross-domain gold card
// is classified mechanically:
//   A endpoint: a gold path endpoint type is not a node card in the top nodeWindow search cards
//   P pairing:  both endpoints are in the node window but the expansion never runs a path between them (it pairs top1 with
//               top2 and top1 with top3 only)
//   B paths:    the endpoints were paired but the gold path is not among the `--limit` paths returned
//   C length:   the gold path is longer than the expansion's maxHops
//   D kinds:    the gold card is a predicate/assessment/other card the expansion does not add
//   E cap:      the gold card is on a returned path but the 10-candidate cap displaced it
//   F other
// stdout carries aggregates only; per-task detail goes to --out (protected custody).
import fs from "node:fs";
import path from "node:path";

const args = {};
for (let i = 2; i < process.argv.length; i++) if (process.argv[i].startsWith("--")) args[process.argv[i].slice(2)] = process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[++i] : true;
const ws_ = await import(new URL("../../packages/schema-workspace/dist/index.js", import.meta.url).href);
const { openWorkspace, searchWorkspace, findPaths, STRUCTURED_EXPANSION } = ws_;
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const ws = openWorkspace(path.join(REPO, "workspace"));
const dir = path.resolve(args.suite);
const tasks = JSON.parse(fs.readFileSync(path.join(dir, "tasks.json"), "utf8")).tasks;
const gold = JSON.parse(fs.readFileSync(path.join(dir, "gold.json"), "utf8")).gold;
const spec = JSON.parse(fs.readFileSync(path.join(dir, "gold-spec.json"), "utf8")).gold;
const PREFIX = { relationship: "rel", predicate: "pred", node: "node", enum: "enum", interface: "iface", union: "union", edge: "edge", module: "mod", domain: "dom", task: "task", assessment: "asmt" };
const norm = (id) => {
  const i = id.indexOf(":");
  return `${PREFIX[id.slice(0, i)] ?? id.slice(0, i)}:${id.slice(i + 1)}`;
};
const queryOf = (p) => p.replace(/^Release under test:.*?card id\.\s*/s, "");
const limits = String(args["base-limits"] ?? "3,5,7,10").split(",").map(Number);
const W = STRUCTURED_EXPANSION.nodeWindow;
const runs = {};
for (const bl of limits) {
  const per = [];
  for (const t of tasks) {
    const g = (gold[t.id]?.cardIds ?? []).map(norm);
    const res = await searchWorkspace(ws, { query: queryOf(t.prompt), mode: "lexical", expand: "paths", baseLimit: bl });
    const top = res.hits.slice(0, 10).map((h) => h.id);
    const found = g.filter((c) => top.includes(c));
    const row = { id: t.id, category: t.category, gold: g.length, found: found.length, recall: g.length ? found.length / g.length : 0, fromPath: (res.route ?? []).filter((r) => r.source === "path").length };
    if (t.category === "cross-domain" && spec[t.id]?.kind === "path") {
      const hops = spec[t.id].hops;
      const A = hops[0][1];
      const C = hops.at(-1)[2];
      const nodes = res.expansion?.nodesConsidered ?? [];
      const windowNodes = [...new Set(res.hits.filter((h, i) => (res.route?.[i]?.source ?? "search") === "search").slice(0, W).filter((h) => h.kind === "node").map((h) => h.name))];
      const pairs = (res.expansion?.pathRuns ?? []).map((p) => [p.from, p.to]);
      const paired = pairs.some(([f, to]) => (f === A && to === C) || (f === C && to === A));
      let returned = [];
      if (paired) {
        const [f, to] = pairs.find(([f, to]) => (f === A && to === C) || (f === C && to === A));
        try {
          returned = findPaths(ws.adjacency(), f, to, { maxHops: STRUCTURED_EXPANSION.maxHops, limit: STRUCTURED_EXPANSION.pathLimit, joins: STRUCTURED_EXPANSION.joins }).paths;
        } catch {
          returned = [];
        }
      }
      const onReturned = new Set(returned.flatMap((p) => p.hops.map((h) => `${h.kind === "predicate-join" ? "pred" : "rel"}:${h.type}`)));
      row.modes = g.filter((c) => !top.includes(c)).map((c) => {
        if (hops.length > STRUCTURED_EXPANSION.maxHops) return "C";
        if (!c.startsWith("rel:") && !c.startsWith("pred:")) return "D";
        if (!windowNodes.includes(A) || !windowNodes.includes(C)) return "A";
        if (!paired) return "P";
        if (!onReturned.has(c)) return "B";
        return "E";
      });
      row.detail = { endpointsInWindow: [windowNodes.includes(A), windowNodes.includes(C)], endpointSearchRank: [res.hits.findIndex((h) => h.id === `node:${A}`) + 1, res.hits.findIndex((h) => h.id === `node:${C}`) + 1], nodesConsidered: nodes.length, pairs: pairs.length, paired, returnedPaths: returned.length, hops: hops.length };
    }
    per.push(row);
  }
  const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const cd = per.filter((r) => r.category === "cross-domain");
  const modes = {};
  for (const r of cd) for (const m of r.modes ?? []) modes[m] = (modes[m] ?? 0) + 1;
  const tasksByMode = {};
  for (const r of cd) for (const m of new Set(r.modes ?? [])) tasksByMode[m] = (tasksByMode[m] ?? 0) + 1;
  const byCat = {};
  for (const r of per) (byCat[r.category] ??= []).push(r.recall);
  runs[bl] = {
    baseLimit: bl,
    recallAt10: mean(per.map((r) => r.recall)),
    byCategory: Object.fromEntries(Object.entries(byCat).map(([k, v]) => [k, mean(v)])),
    crossDomain: { tasks: cd.length, recall: mean(cd.map((r) => r.recall)), hit: mean(cd.map((r) => (r.found ? 1 : 0))), goldCardsPerTask: mean(cd.map((r) => r.gold)), missedCards: cd.reduce((a, r) => a + (r.gold - r.found), 0), modesByCard: modes, tasksByMode, avgFromPath: mean(cd.map((r) => r.fromPath)) },
    perTask: per,
  };
}
const brief = Object.fromEntries(Object.entries(runs).map(([k, v]) => [k, { recallAt10: v.recallAt10, byCategory: v.byCategory, crossDomain: v.crossDomain }]));
if (args.out) fs.writeFileSync(path.resolve(args.out), JSON.stringify({ workspaceFingerprint: ws.manifest.workspaceFingerprint, suite: path.basename(dir), runs }, null, 2) + "\n");
console.log(JSON.stringify({ workspaceFingerprint: ws.manifest.workspaceFingerprint, expansion: STRUCTURED_EXPANSION, runs: brief }, null, 2));
