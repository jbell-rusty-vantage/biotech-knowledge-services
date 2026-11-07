#!/usr/bin/env node
/**
 * Checks the consumers of the schema in this repo and the biotech-meta replay set against candidate v2.
 * Static and read-only: nothing is written outside the output file, no database is touched.
 *
 *   node schema/program/final/_work/consumer-check-v2.mjs <C:/abs/printed-v2.graphql> <C:/abs/biotech-meta/docs/schema> <C:/abs/out.json>
 *
 * Sections:
 *   sidecars      validateSidecars(v2 IR, pinned sidecars) (the check `pnpm workspace:build` runs) + renderWorkspace on v2
 *   operations    schema/pinned/operations.cypher statements whose labels / relationship types / properties are absent in v2
 *   validationParams  uid tokens and predicate registry that the v2 IR inherits from schema/pinned/validation-params.json
 *   graphqlOps    every GraphQL operation in the biotech-meta replay set validated (graphql.validate) against the printed v2 API
 *   cypherFixtures  every .cypher file of the replay set: labels and relationship types classified by final/_work/diff-v1-v2.json
 *   evals / skills / examples  v1-only names referenced by evals/baseline-comparison/tasks.json, .agents/skills/biotech-*, examples/
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, relative, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const finalDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const root = resolve(finalDir, "../../..");
const require = createRequire(resolve(root, "apps/graphql-api/package.json"));
const { buildSchema, parse, validate } = require("graphql");
const ws = await import(pathToFileURL(resolve(root, "packages/schema-workspace/dist/index.js")).href);
const [printedV2, metaSchemaDir, outPath] = process.argv.slice(2);
const v1 = JSON.parse(readFileSync(resolve(root, "workspace/schema-ir.json"), "utf8"));
const v2 = JSON.parse(readFileSync(resolve(finalDir, "schema/final_biotech_schema_v2.ir.json"), "utf8"));
const diff = JSON.parse(readFileSync(resolve(finalDir, "_work/diff-v1-v2.json"), "utf8"));
const out = {};
const walk = (dir, pred) => { const acc = []; for (const e of readdirSync(dir)) { const p = join(dir, e); const s = statSync(p); if (s.isDirectory()) acc.push(...walk(p, pred)); else if (pred(p)) acc.push(p); } return acc; };
const rel = (p) => relative(resolve(metaSchemaDir, "../.."), p).replace(/\\/g, "/");

// ---------------- sidecars + renderer
const sidecars = ws.loadSidecars();
const sidecarErrors = ws.validateSidecars(v2, sidecars);
const byFile = {};
for (const e of sidecarErrors) { const f = e.split(/[: ]/)[0]; byFile[f] = (byFile[f] ?? 0) + 1; }
let render;
try { const pin = ws.readPin(); const r = ws.renderWorkspace(v2, sidecars, pin, "2026-10-09T00:00:00Z"); render = { ok: true, files: r.files?.size ?? Object.keys(r.files ?? {}).length }; }
catch (e) { render = { ok: false, error: String(e.message).slice(0, 300) }; }
out.sidecars = { errors: sidecarErrors.length, byFile, all: sidecarErrors, render, v1ErrorsForReference: ws.validateSidecars(v1, sidecars).length };

// ---------------- operations.cypher (pinned)
const v2Labels = new Set(v2.nodes.flatMap((n) => n.labels));
const v1Labels = new Set(v1.nodes.flatMap((n) => n.labels));
const v2Rels = new Set(v2.relationshipTypes.map((r) => r.type));
const opsText = readFileSync(resolve(root, "schema/pinned/operations.cypher"), "utf8");
const stmts = opsText.replace(/\/\*[\s\S]*?\*\//g, "").split(/;\s*\n/).map((s) => s.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n").trim()).filter(Boolean);
const opsRows = { total: stmts.length, kinds: {}, labelAbsentInV2: 0, relAbsentInV2: 0, mongoResearchRunId: 0, absentLabels: {}, absentRels: {} };
for (const s of stmts) {
  const kind = /^CREATE\s+(CONSTRAINT|FULLTEXT INDEX|VECTOR INDEX|INDEX|RANGE INDEX|TEXT INDEX)/i.exec(s)?.[1]?.toUpperCase() ?? "OTHER";
  opsRows.kinds[kind] = (opsRows.kinds[kind] ?? 0) + 1;
  const labels = [...s.matchAll(/\(\s*\w*\s*:\s*`?(\w+)`?/g)].map((m) => m[1]).concat([...s.matchAll(/ON EACH \[[^\]]*\]|FOR \(\w+:(\w+(?:\|\w+)*)\)/g)].flatMap((m) => (m[1] ?? "").split("|")).filter(Boolean));
  const rels = [...s.matchAll(/\[\s*\w*\s*:\s*`?(\w+)`?/g)].map((m) => m[1]);
  const badL = labels.filter((l) => !v2Labels.has(l)), badR = rels.filter((r) => !v2Rels.has(r));
  if (badL.length) { opsRows.labelAbsentInV2++; for (const l of badL) opsRows.absentLabels[l] = (opsRows.absentLabels[l] ?? 0) + 1; }
  if (badR.length) { opsRows.relAbsentInV2++; for (const r of badR) opsRows.absentRels[r] = (opsRows.absentRels[r] ?? 0) + 1; }
  if (/mongoResearchRunId/.test(s)) opsRows.mongoResearchRunId++;
}
opsRows.absentLabelCount = Object.keys(opsRows.absentLabels).length;
opsRows.absentRelCount = Object.keys(opsRows.absentRels).length;
delete opsRows.absentRels;
out.operations = opsRows;

// ---------------- validation params inherited by the v2 IR
const tokenless = v2.nodes.filter((n) => !n.uidToken && !v2.params.uidTypeTokens[n.name]).map((n) => n.name).sort();
const v2Assertion = v2.nodes.find((n) => n.name === "Assertion");
out.validationParams = {
  uidTypeTokensFromPinnedParams: Object.keys(v2.params.uidTypeTokens).length,
  tokensForTypesAbsentInV2: Object.keys(v2.params.uidTypeTokens).filter((t) => !v2.nodes.some((n) => n.name === t)).length,
  v2NodeTypesWithoutToken: tokenless,
  registeredPredicates: v2.params.registeredPredicates.length,
  assertedTypesAbsentInV2: (v2.params.assertedTypes ?? []).filter((t) => !v2Rels.has(t)).length,
  derivedTypesAbsentInV2: (v2.params.derivedTypes ?? []).filter((t) => !v2Rels.has(t)).length,
  exclusiveTypesAbsentInV2: (v2.params.exclusiveTypes ?? []).filter((t) => !v2Rels.has(t)).length,
  legacyTypes: v2.params.legacyTypes,
  nodesWithCreateAllowed: v2.nodes.filter((n) => n.allowedMutations?.create).length,
  assertionFields: v2Assertion?.properties.length,
};

// ---------------- GraphQL operations of the replay set against the printed v2 API
const schemaV2 = buildSchema(readFileSync(printedV2, "utf8"));
const gqlFiles = walk(metaSchemaDir, (p) => /graphql-ops-.*\.json$|roundtrip-ops\.json$/.test(p));
const gql = { files: gqlFiles.length, operations: 0, valid: 0, invalid: 0, parseErrors: 0, firstErrors: {}, perFile: [] };
for (const f of gqlFiles) {
  let ops; try { ops = JSON.parse(readFileSync(f, "utf8")); } catch { continue; }
  const list = Array.isArray(ops) ? ops : ops.operations ?? Object.values(ops);
  let ok = 0, bad = 0;
  for (const op of list) {
    const q = op.query ?? op.document ?? op;
    if (typeof q !== "string") continue;
    gql.operations++;
    let doc; try { doc = parse(q); } catch { gql.parseErrors++; bad++; continue; }
    // graphql.validate has no rule for an operation type the schema lacks; execution would fail, so count it here
    const errs = doc.definitions.some((d) => d.kind === "OperationDefinition" && d.operation === "mutation") && !schemaV2.getMutationType() ? [{ message: 'Schema has no Mutation root ("mutation" operation)' }] : validate(schemaV2, doc);
    if (errs.length) { gql.invalid++; bad++; const k = errs[0].message.replace(/"[^"]*"/g, '"…"').slice(0, 90); gql.firstErrors[k] = (gql.firstErrors[k] ?? 0) + 1; } else { gql.valid++; ok++; }
  }
  gql.perFile.push({ file: rel(f), ok, bad });
}
gql.firstErrors = Object.fromEntries(Object.entries(gql.firstErrors).sort((a, b) => b[1] - a[1]).slice(0, 12));
out.graphqlOps = gql;

// ---------------- Cypher fixtures and suites of the replay set
const nodeCls = (l) => {
  if (diff.nodes[l]) { const m = diff.nodes[l]; return m.cls === "kept" ? "kept" : m.cls === "removed" ? "removed" : m.cls; }
  if (v2Labels.has(l)) return "kept";
  if (v1Labels.has(l)) return "retiredLabel";
  return "unknown";
};
const relCls = (t) => { const m = diff.relationshipTypes[t]; if (!m) return v2Rels.has(t) ? "kept" : "unknown"; return m.cls === "removed" ? "removed" : m.cls; };
const cypherFiles = walk(metaSchemaDir, (p) => p.endsWith(".cypher") && !/[\\/]neo4j[\\/]|operations|generated-label-checks/.test(p));
const groupOf = (p) => { const r = rel(p); if (r.includes("/schema/examples/")) return "examples (0.2.0)"; if (r.includes("/validation/fixtures-final/")) return "fixtures-final (translated 0.2.0)"; if (/\/workers\/W\d+\/fixtures\//.test(r)) return /queries/.test(r) ? "worker queries" : /must-fail|invalid|negative|-neg/.test(r) ? "worker negatives" : "worker fixtures"; if (r.includes("/validation/")) return "validation suites"; return "other"; };
const fixtures = [];
for (const f of cypherFiles) {
  const text = readFileSync(f, "utf8").replace(/\/\/.*$/gm, "");
  const labels = {}, rels = {};
  for (const m of text.matchAll(/\(\s*`?\w*`?\s*((?::\s*`?[A-Z]\w*`?)+)/g)) for (const l of m[1].split(":").map((x) => x.replace(/[`\s]/g, "")).filter(Boolean)) labels[l] = (labels[l] ?? 0) + 1;
  for (const m of text.matchAll(/\b(?:SET|REMOVE)\s+\w+((?::`?[A-Z]\w*`?)+)/g)) for (const l of m[1].split(":").filter(Boolean)) labels[l] = (labels[l] ?? 0) + 1;
  for (const m of text.matchAll(/\[\s*\w*\s*:\s*((?:`?[A-Z][A-Z0-9_]*`?\s*\|?\s*)+)/g)) for (const t of m[1].split("|").map((x) => x.replace(/[`\s:]/g, "")).filter(Boolean)) rels[t] = (rels[t] ?? 0) + 1;
  const cls = {};
  const add = (k, n, c) => { cls[c] ??= { names: new Set(), occ: 0 }; cls[c].names.add(k); cls[c].occ += n; };
  for (const [l, n] of Object.entries(labels)) add(`:${l}`, n, `node:${nodeCls(l)}`);
  for (const [t, n] of Object.entries(rels)) add(t, n, `rel:${relCls(t)}`);
  const mongo = (text.match(/mongoResearchRunId/g) ?? []).length;
  const total = Object.values(cls).reduce((a, c) => a + c.occ, 0);
  const occ = (re) => Object.entries(cls).filter(([k]) => re.test(k)).reduce((a, [, c]) => a + c.occ, 0);
  const removed = occ(/:(removed|retiredLabel)$/), remodel = occ(/:(merged|demoted)$/), renamed = occ(/:renamed$/), unknown = occ(/:unknown$/);
  let verdict;
  if (!total) verdict = "no schema references";
  else if (removed / total > 0.5) verdict = "lost (most references to removed types)";
  else if (removed + remodel > 0) verdict = (total - removed - remodel - renamed - unknown) / total >= 0.5 ? "rewrite: remodel (>= half of references unchanged)" : "rewrite: remodel (< half of references unchanged)";
  else if (renamed > 0 || mongo > 0) verdict = "rewrite: mechanical";
  else verdict = "replays (names unchanged)";
  fixtures.push({ file: rel(f), group: groupOf(f), verdict, refs: total, keptShare: total ? +((total - removed - remodel - renamed - unknown) / total).toFixed(2) : 0, removedShare: total ? +(removed / total).toFixed(2) : 0, unknownRefs: unknown, mongoResearchRunId: mongo, byClass: Object.fromEntries(Object.entries(cls).map(([k, c]) => [k, { occ: c.occ, names: [...c.names].sort().slice(0, 12) }])) });
}
const tallyBy = (key) => fixtures.reduce((a, f) => { a[f[key]] = (a[f[key]] ?? 0) + 1; return a; }, {});
const groups = {};
for (const f of fixtures) { groups[f.group] ??= {}; groups[f.group][f.verdict] = (groups[f.group][f.verdict] ?? 0) + 1; }
const topRemoved = {};
for (const f of fixtures) for (const [k, c] of Object.entries(f.byClass)) if (/:(removed|retiredLabel)$/.test(k)) for (const n of c.names) topRemoved[n] = (topRemoved[n] ?? 0) + 1;
out.cypherFixtures = { files: fixtures.length, verdicts: tallyBy("verdict"), byGroup: groups, mostCommonRemovedNames: Object.fromEntries(Object.entries(topRemoved).sort((a, b) => b[1] - a[1]).slice(0, 25)), keptShareMedian: (() => { const a = fixtures.filter((f) => f.refs).map((f) => f.keptShare).sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; })(), files_: fixtures.map((f) => ({ file: f.file, group: f.group, verdict: f.verdict, refs: f.refs, keptShare: f.keptShare, removedShare: f.removedShare, mongo: f.mongoResearchRunId, removed: Object.entries(f.byClass).filter(([k]) => /:(removed|retiredLabel)$/.test(k)).flatMap(([, c]) => c.names).slice(0, 10), remodel: Object.entries(f.byClass).filter(([k]) => /:(merged|demoted)$/.test(k)).flatMap(([, c]) => c.names).slice(0, 10) })) };

// ---------------- evals, skills, examples in this repo
const v1OnlyNodes = Object.entries(diff.nodes).filter(([, m]) => m.cls !== "kept").map(([n]) => n);
const v1OnlyRels = Object.entries(diff.relationshipTypes).filter(([, m]) => m.cls !== "kept").map(([n]) => n);
const scan = (files) => {
  const hits = {};
  for (const f of files) {
    const t = readFileSync(f, "utf8");
    const found = new Set();
    // quoted or label-like uses only (`:Name`, `"Name"`, `'Name'`, `` `Name` ``, `nodeType: Name`), so prose words such as "Community" do not count
    for (const n of v1OnlyNodes) if (new RegExp("(?::|[\"'`])" + n + "\\b|nodeType\\W+" + n + "\\b").test(t)) found.add(n);
    for (const r of v1OnlyRels) if (new RegExp("(?::|\\[|[\"'`])" + r + "\\b").test(t)) found.add(r);
    for (const w of ["mongoResearchRunId", "externalRunId", "SUPPORTED_BY", "TradeItemIdentifier", "biotech-knowledge-intent.v1", "final_biotech_schema_proposal"]) if (t.includes(w)) found.add(w);
    if (found.size) hits[relative(root, f).replace(/\\/g, "/")] = [...found].sort();
  }
  return hits;
};
const skillFiles = walk(resolve(root, ".agents/skills"), (p) => relative(root, p).replace(/\\/g, "/").startsWith(".agents/skills/biotech-") && /\.(md|ya?ml|json|cypher)$/.test(p));
out.repoConsumers = {
  evals: scan([resolve(root, "evals/baseline-comparison/tasks.json"), resolve(root, "evals/baseline-comparison/README.md"), resolve(root, "evals/baseline-comparison/score.py")]),
  examples: scan(walk(resolve(root, "examples"), () => true)),
  skills: scan(skillFiles),
  python: scan(walk(resolve(root, "python/biotech-knowledge-client"), (p) => p.endsWith(".py"))),
  graphqlApi: scan(walk(resolve(root, "apps/graphql-api/src"), () => true).concat(["Dockerfile", "fly.toml", "package.json"].map((f) => resolve(root, "apps/graphql-api", f)).filter((f) => existsSync(f)))),
  executorApp: scan(walk(resolve(root, "apps/executor/src"), () => true)),
  kgOpsSrc: scan(walk(resolve(root, "packages/kg-ops/src"), (p) => p.endsWith(".ts"))),
  contractsSrc: scan(walk(resolve(root, "packages/contracts/src"), (p) => p.endsWith(".ts"))),
  sidecarFiles: scan(walk(resolve(root, "schema/sidecars"), () => true)),
};
out.repoConsumers.counts = Object.fromEntries(Object.entries(out.repoConsumers).map(([k, v]) => [k, { files: Object.keys(v).length, names: new Set(Object.values(v).flat()).size }]));
writeFileSync(resolve(outPath), `${JSON.stringify(out, null, 1)}\n`, "utf8");
console.log(JSON.stringify({ sidecars: { errors: out.sidecars.errors, byFile, render, v1: out.sidecars.v1ErrorsForReference }, operations: { ...opsRows, absentLabels: undefined }, validationParams: { ...out.validationParams, legacyTypes: undefined }, graphqlOps: { ...gql, perFile: undefined }, cypherFixtures: { files: fixtures.length, verdicts: out.cypherFixtures.verdicts, byGroup: groups, keptShareMedian: out.cypherFixtures.keptShareMedian, mostCommonRemovedNames: out.cypherFixtures.mostCommonRemovedNames }, repoConsumers: out.repoConsumers.counts }, null, 1));
