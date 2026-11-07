#!/usr/bin/env node
// Read-only snapshot of migration state on a shadow graph (markers, fence, run nodes, per-batch marker status).
//   BKS_RESTORE_URI=... BKS_RESTORE_PASSWORD=... node scripts/migration/migration-state.mjs --plan <planDir> [--out <file>]
import fs from "node:fs";
import path from "node:path";
import { assertDisposableTarget, loadEnv, neo4j, openDriver, parseArgs, readJsonl, rowsToPlain, targetConfig, writeJson } from "./lib/common.mjs";

const args = parseArgs(process.argv.slice(2));
const planDir = path.resolve(args.plan);
const manifest = JSON.parse(fs.readFileSync(path.join(planDir, "migration-manifest.json"), "utf8"));
const batches = [...readJsonl(path.join(planDir, "batches.jsonl"))];
const env = loadEnv();
const cfg = targetConfig(env);
assertDisposableTarget(cfg, env);
const run = manifest.migrationRunId;
const d = openDriver(cfg);
const s = d.session({ database: cfg.database, defaultAccessMode: neo4j.session.READ });
try {
  const one = async (c, p = {}) => rowsToPlain((await s.run(c, { run, ...p })).records)[0];
  const markers = rowsToPlain((await s.run("MATCH (m:KsIntentMarker {planRef: $run}) RETURN m.intentId AS batchId, m.status AS status, m.intentDigest AS digest, m.markerKey AS markerKey, m.attempts AS attempts, m.graphRevision AS rev ORDER BY rev", { run })).records);
  const byBatch = new Map(markers.map((m) => [m.batchId, m]));
  const state = {
    at: new Date().toISOString(),
    migrationRunId: run,
    fence: await one("MATCH (f:KsWriteFence {id: 'canonical'}) RETURN f.graphRevision AS graphRevision, f.lockSeq AS lockSeq, f.lastEffectKey AS lastEffectKey"),
    runNodes: (await one("MATCH (n) WHERE n.lastWriterRunId = $run RETURN count(n) AS c")).c,
    uidNodes: (await one("MATCH (n) WHERE n.uid IS NOT NULL RETURN count(n) AS c")).c,
    legacyNodes: (await one("MATCH (n) WHERE n.uid IS NULL AND NOT n:KsWriteFence AND NOT n:KsRevocationFence AND NOT n:KsIntentMarker AND NOT n:KsReleaseMarker RETURN count(n) AS c")).c,
    markers: { total: markers.length, applied: markers.filter((m) => m.status === "applied").length, withoutMarkerKey: markers.filter((m) => !m.markerKey).length, multiAttempt: markers.filter((m) => JSON.parse(m.attempts ?? "[]").length > 1).map((m) => m.batchId) },
    batches: batches.map((b) => ({ batchId: b.batchId, marker: byBatch.get(b.batchId)?.status ?? "none", digestMatches: byBatch.has(b.batchId) ? byBatch.get(b.batchId).digest === b.batchDigest : null, attempts: byBatch.has(b.batchId) ? JSON.parse(byBatch.get(b.batchId).attempts).length : 0 })),
  };
  state.firstUnapplied = state.batches.find((b) => b.marker !== "applied")?.batchId ?? null;
  if (args.out) writeJson(path.resolve(args.out), state);
  const { batches: _, ...brief } = state;
  console.log(JSON.stringify(brief, null, 2));
} finally {
  await s.close();
  await d.close();
}
