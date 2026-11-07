#!/usr/bin/env node
/**
 * Planner probe: runs the CURRENT kg-ops planner (packages/kg-ops/dist, unchanged) over intents against two schema
 * models, the pinned v1 IR (workspace/schema-ir.json) and the candidate v2 IR (final/schema/final_biotech_schema_v2.ir.json),
 * both with the pinned sidecars. planIntent only reads the graph (client.read); nothing is applied.
 * A third model, v2sim, simulates three planner fixes (see below) to expose the next layer of breakage.
 * Then audits what the planner would WRITE under v2sim: every node label, property key and relationship type in the
 * planned statements, checked against the v2 IR.
 *
 *   NEO4J_PROBE_URI=bolt://localhost:7691 NEO4J_PROBE_PASSWORD=... node schema/program/final/_work/planner-probe-v2.mjs <out.json> <intent.json>...
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const finalDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const root = resolve(finalDir, "../../..");
const imp = (p) => import(pathToFileURL(resolve(root, p)).href);
const ops = await imp("packages/kg-ops/dist/index.js");
const ws = await imp("packages/schema-workspace/dist/index.js");
const [outPath, ...intentPaths] = process.argv.slice(2);
const sidecars = ws.loadSidecars();
const irV1 = JSON.parse(readFileSync(resolve(root, "workspace/schema-ir.json"), "utf8"));
const irV2 = JSON.parse(readFileSync(resolve(finalDir, "schema/final_biotech_schema_v2.ir.json"), "utf8"));
// v2sim simulates three planner changes so the rest of the path can be observed: executor creatability from the node
// register instead of the SDL @mutation directive (R-03), the kernel ActivityKind mapping EXTRACTION -> INGESTION (P3),
// and mention.stage proposals dropped (P8: no Mention node). Everything else is the unchanged planner.
const irV2sim = JSON.parse(JSON.stringify(irV2));
for (const n of irV2sim.nodes) n.allowedMutations = { ...n.allowedMutations, create: true, update: true };
const models = { v1: new ops.SchemaModel(irV1, sidecars, "probe-v1"), v2: new ops.SchemaModel(irV2, sidecars, "probe-v2"), v2sim: new ops.SchemaModel(irV2sim, sidecars, "probe-v2sim") };
const simIntent = (intent) => {
  const x = JSON.parse(JSON.stringify(intent));
  if (x.context && (x.context.activityKind === "EXTRACTION" || x.context.activityKind === undefined)) x.context.activityKind = "INGESTION";
  const dropped = new Set((x.proposals ?? []).filter((p) => p.kind === "mention.stage").map((p) => p.proposalId));
  x.proposals = (x.proposals ?? []).filter((p) => !dropped.has(p.proposalId)).map((p) => ({ ...p, dependsOn: (p.dependsOn ?? []).filter((d) => !dropped.has(d)) }));
  return x;
};
const client = new ops.GraphClient({ uri: process.env.NEO4J_PROBE_URI ?? "bolt://localhost:7691", username: process.env.NEO4J_PROBE_USER ?? "neo4j", password: process.env.NEO4J_PROBE_PASSWORD ?? "", database: "neo4j" });
const now = () => new Date("2026-10-09T00:00:00Z");
const code = (r) => String(r).split(/[:\s(]/)[0];

const v2Node = new Map(irV2.nodes.map((n) => [n.name, new Set(n.properties.map((p) => p.name))]));
const v2Rel = new Set(irV2.relationshipTypes.map((r) => r.type));
const v2EdgeProps = new Set(irV2.edgePropertyTypes.flatMap((e) => e.properties.map((p) => p.name)));
const audit = { labels: {}, nodePropsNotInV2: {}, relTypesNotInV2: {}, edgePropsNotInV2: {} };
const bump = (o, k, src) => { o[k] ??= { count: 0, intents: new Set() }; o[k].count++; o[k].intents.add(src); };

const results = [];
const samples = {};
const sample = (k, r) => { const v = String(r).replace(/hu:[a-z-]+:[^\s,;)]+/g, "<uid>").slice(0, 200); (samples[k] ??= {}); samples[k][v] = (samples[k][v] ?? 0) + 1; };
for (const p of intentPaths) {
  const src = relative(root, resolve(p)).replace(/\\/g, "/");
  let intent;
  try { intent = JSON.parse(readFileSync(resolve(p), "utf8")); } catch (e) { results.push({ intent: src, parseError: e.message }); continue; }
  const row = { intent: src };
  for (const [ver, model] of Object.entries(models)) {
    try {
      const plan = await ops.planIntent(client, model, ver === "v2sim" ? simIntent(intent) : intent, { agentUid: "hu:agent:bks-executor", now });
      const disp = {};
      const reasons = {};
      for (const pr of plan.proposals) { disp[pr.disposition] = (disp[pr.disposition] ?? 0) + 1; for (const r of pr.reasons) if (pr.disposition !== "admitted" && pr.disposition !== "no_op_duplicate") { reasons[code(r)] = (reasons[code(r)] ?? 0) + 1; sample(`${ver}|${code(r)}`, r); } }
      const subj = {};
      for (const s of plan.subjects) { subj[s.disposition] = (subj[s.disposition] ?? 0) + 1; if (s.disposition === "conflict" || s.disposition === "review_required") for (const r of s.reasons) { reasons[`subject:${code(r)}`] = (reasons[`subject:${code(r)}`] ?? 0) + 1; sample(`${ver}|subject:${code(r)}`, r); } }
      row[ver] = { outcome: plan.outcome, errors: [...new Set(plan.errors.map((e) => e.code))], proposals: disp, subjects: subj, reasons, statements: plan.statements.length };
      if (ver === "v2sim") {
        for (const s of plan.statements) {
          const m = /MERGE \((\w+):([A-Za-z:]+) \{uid/.exec(s.cypher);
          if (m) {
            const label = m[2].split(":")[0];
            bump(audit.labels, label, src);
            const keys = [...Object.keys(s.params.onCreate ?? {}), ...Object.keys(s.params.props ?? {}), ...Object.keys(s.params.temporal ?? {})];
            for (const ref of s.cypher.matchAll(new RegExp(`\\b${m[1]}\\.(\\w+)\\s*=`, "g"))) keys.push(ref[1]);
            const known = v2Node.get(label);
            for (const k of new Set(keys)) if (!known || !known.has(k)) bump(audit.nodePropsNotInV2, `${label}.${k}`, src);
          }
          for (const r of s.cypher.matchAll(/\[(?:\w+)?:([A-Z_]+)/g)) if (!v2Rel.has(r[1])) bump(audit.relTypesNotInV2, r[1], src);
          for (const r of s.cypher.matchAll(/\br\.(\w+)\s*=/g)) if (!v2EdgeProps.has(r[1])) bump(audit.edgePropsNotInV2, r[1], src);
        }
      }
    } catch (e) {
      row[ver] = { thrown: `${e.code ?? e.name}: ${String(e.message).slice(0, 200)}`, stack: String(e.stack ?? "").split("\n").slice(1, 3).join(" | ") };
    }
  }
  results.push(row);
}
await client.close();
const fin = (o) => Object.fromEntries(Object.entries(o).sort().map(([k, v]) => [k, { count: v.count, intents: v.intents.size }]));
const tally = (ver) => {
  const t = { intents: 0, applicable: 0, partial: 0, noop: 0, rejected: 0, thrown: 0, errorCodes: {}, reasonCodes: {}, thrownCodes: {} };
  for (const r of results) {
    const x = r[ver];
    if (!x) continue;
    t.intents++;
    if (x.thrown) { t.thrown++; const c = x.thrown.split(":")[0]; t.thrownCodes[c] = (t.thrownCodes[c] ?? 0) + 1; continue; }
    t[x.outcome]++;
    for (const e of x.errors) t.errorCodes[e] = (t.errorCodes[e] ?? 0) + 1;
    for (const [k, v] of Object.entries(x.reasons)) t.reasonCodes[k] = (t.reasonCodes[k] ?? 0) + v;
  }
  return t;
};
const out = { probe: { executor: ops.EXECUTOR_VERSION, v1Digest: irV1.schemaDigest, v2Digest: irV2.schemaDigest, now: now().toISOString(), intents: intentPaths.length }, totals: { v1: tally("v1"), v2: tally("v2"), v2sim: tally("v2sim") }, reasonSamples: Object.fromEntries(Object.entries(samples).sort().map(([k, v]) => [k, Object.entries(v).sort((a, b) => b[1] - a[1]).slice(0, 12)])), v2WriteAudit: { labels: fin(audit.labels), nodePropsNotInV2: fin(audit.nodePropsNotInV2), relTypesNotInV2: fin(audit.relTypesNotInV2), edgePropsNotInV2: fin(audit.edgePropsNotInV2) }, results };
writeFileSync(resolve(outPath), `${JSON.stringify(out, null, 1)}\n`, "utf8");
console.log(JSON.stringify({ totals: out.totals, audit: { nodePropsNotInV2: Object.keys(out.v2WriteAudit.nodePropsNotInV2).length, relTypesNotInV2: Object.keys(out.v2WriteAudit.relTypesNotInV2) } }, null, 1));
