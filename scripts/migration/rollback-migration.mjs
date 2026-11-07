#!/usr/bin/env node
// Reverse-mapping rehearsal: returns a migrated DISPOSABLE shadow graph to its exported legacy state.
//
//   BKS_RESTORE_URI=... BKS_RESTORE_PASSWORD=... node scripts/migration/rollback-migration.mjs \
//       --plan <planDir> --export <exportDir> [--drop-release-ddl] [--remove-fences]
//
// Steps (refuses on any precondition failure; nothing legacy is deleted):
//   1. guard: target is disposable; the last canonical writer on the fence is this migration run (no later v2 writes,
//      otherwise forward repair is the rule); no run node carries a legacy label; no uid-bearing node of another run
//      is attached to a run node.
//   2. archive the run's KsIntentMarkers and KsReleaseMarker to <planDir>/rollbacks/<stamp>/ (custody) before removal.
//   3. --drop-release-ddl: drop release constraints/indexes the export did not have (constraints first), so legacy
//      labels can return without violating v2 existence constraints. Dropping a schema rule changes no data.
//   4. one fenced transaction: DETACH DELETE only nodes with lastWriterRunId = run (v2 elements of this run; their
//      MIGRATED_FROM and kernel edges go with them); delete this run's markers and release marker; reverse every relabel
//      and tag from the manifest (legacyLabels / legacyExportDigest removed).
//   5. --remove-fences: remove the KsWriteFence / KsRevocationFence bootstrap nodes when the export had none.
// Then run verify-restore.mjs with the original restore id map: counts, deep equality and reconstructed digests.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { REPO_ROOT, assertDisposableTarget, loadEnv, neo4j, openDriver, parseArgs, q, readJsonl, rowsToPlain, targetConfig, utcStamp, writeJson } from "./lib/common.mjs";

const { loadRelease } = await import(pathToFileURL(path.join(REPO_ROOT, "packages", "schema-workspace", "dist", "index.js")).href);
const args = parseArgs(process.argv.slice(2));
if (!args.plan || !args.export) throw new Error("--plan <planDir> --export <exportDir> are required");
const planDir = path.resolve(args.plan);
const exportDir = path.resolve(args.export);
const manifest = JSON.parse(fs.readFileSync(path.join(planDir, "migration-manifest.json"), "utf8"));
const exportManifest = JSON.parse(fs.readFileSync(path.join(exportDir, "manifest.json"), "utf8"));
const exportSchema = JSON.parse(fs.readFileSync(path.join(exportDir, "schema.json"), "utf8"));
const batches = [...readJsonl(path.join(planDir, "batches.jsonl"))].filter((b) => b.kind === "relabel");
const env = loadEnv();
const cfg = targetConfig(env);
const host = assertDisposableTarget(cfg, env, { sourceHost: exportManifest.source.host, sourceDatabase: exportManifest.source.database });
const run = manifest.migrationRunId;
const stamp = utcStamp();
const outDir = path.join(planDir, "rollbacks", stamp);
fs.mkdirSync(outDir, { recursive: true });
const toNum = (x) => (neo4j.isInt(x) ? x.toNumber() : x);
const driver = openDriver(cfg);
const report = { format: "bks-migration-rollback-report.v1", migrationRunId: run, manifestDigest: manifest.manifestDigest, exportDigest: exportManifest.exportDigest, target: { host, database: cfg.database }, startedAt: new Date().toISOString(), guards: [], steps: {} };
try {
  const s = driver.session({ database: cfg.database, defaultAccessMode: neo4j.session.WRITE });
  try {
    const one = async (cypher, p = {}) => rowsToPlain((await s.run(cypher, { run, ...p })).records)[0];
    const fence = await one("OPTIONAL MATCH (f:KsWriteFence {id: 'canonical'}) RETURN f.lastWriterRunId AS last, f.graphRevision AS rev");
    report.guards.push({ id: "fence.lastWriterIsRun", ok: fence.last === run, detail: fence });
    const legacyRun = await one("MATCH (n:LegacyV0) WHERE n.lastWriterRunId = $run RETURN count(n) AS c");
    report.guards.push({ id: "runNodes.notLegacy", ok: legacyRun.c === 0, detail: legacyRun });
    const foreign = await one("MATCH (n)--(m) WHERE n.lastWriterRunId = $run AND m.uid IS NOT NULL AND coalesce(m.lastWriterRunId, '') <> $run RETURN count(DISTINCT m) AS c");
    report.guards.push({ id: "noForeignV2Neighbours", ok: foreign.c === 0, detail: foreign });
    const foreignMarkers = await one("MATCH (m:KsIntentMarker) WHERE coalesce(m.planRef, '') <> $run RETURN count(m) AS c");
    report.guards.push({ id: "noOtherEffects", ok: foreignMarkers.c === 0, detail: foreignMarkers });
    if (report.guards.some((g) => !g.ok)) {
      report.outcome = "refused (forward repair required)";
      throw Object.assign(new Error("rollback guard failed"), { soft: true });
    }
    // archive
    const markers = rowsToPlain((await s.run("MATCH (m:KsIntentMarker {planRef: $run}) RETURN m {.*} AS m ORDER BY m.effectKey", { run })).records).map((r) => r.m);
    const releaseMarkers = rowsToPlain((await s.run("MATCH (m:KsReleaseMarker {migrationRunId: $run}) RETURN m {.*} AS m", { run })).records).map((r) => r.m);
    report.steps.archive = { markers: markers.length, releaseMarkers: releaseMarkers.length, file: "archived-markers.json" };
    writeJson(path.join(outDir, "archived-markers.json"), { migrationRunId: run, markers, releaseMarkers });
    // DDL rollback
    if (args["drop-release-ddl"]) {
      const release = loadRelease();
      const keep = new Set([...exportSchema.indexes.map((i) => i.name), ...exportSchema.constraints.map((c) => c.name)]);
      const relNames = new Set(release.ddl.manifest.statements.map((st) => st.name));
      const cons = rowsToPlain((await s.run("SHOW CONSTRAINTS YIELD name RETURN name")).records).map((r) => r.name).filter((n) => relNames.has(n) && !keep.has(n));
      for (const n of cons) await s.run(`DROP CONSTRAINT ${q(n)} IF EXISTS`);
      const idx = rowsToPlain((await s.run("SHOW INDEXES YIELD name, owningConstraint WHERE owningConstraint IS NULL RETURN name")).records).map((r) => r.name).filter((n) => relNames.has(n) && !keep.has(n));
      for (const n of idx) await s.run(`DROP INDEX ${q(n)} IF EXISTS`);
      report.steps.ddl = { droppedConstraints: cons.length, droppedIndexes: idx.length };
    }
    // data rollback in one fenced transaction
    const tx = s.beginTransaction({ timeout: 300_000 });
    try {
      await tx.run("MATCH (f:KsWriteFence {id: 'canonical'}) SET f.locked = true, f.lockSeq = coalesce(f.lockSeq, 0) + 1");
      const del = await tx.run("MATCH (n) WHERE n.lastWriterRunId = $run AND n.uid IS NOT NULL AND NOT n:LegacyV0 DETACH DELETE n", { run });
      const delM = await tx.run("MATCH (m:KsIntentMarker {planRef: $run}) DELETE m", { run });
      const delR = await tx.run("MATCH (m:KsReleaseMarker {migrationRunId: $run}) DELETE m", { run });
      let relabeled = 0;
      for (const b of batches) {
        const lbl = b.label;
        const stmt = b.mode === "relabel"
          ? `MATCH (l:${q("LegacyV0_" + lbl)}:LegacyV0) WHERE l.legacyExportDigest = $d AND l[$keyProp] IN $keys REMOVE l:${q("LegacyV0_" + lbl)}:LegacyV0 SET l:${q(lbl)} REMOVE l.legacyLabels, l.legacyExportDigest RETURN count(l) AS c`
          : `MATCH (l:${q(lbl)}:LegacyV0) WHERE l.legacyExportDigest = $d AND l[$keyProp] IN $keys REMOVE l:LegacyV0 REMOVE l.legacyLabels, l.legacyExportDigest RETURN count(l) AS c`;
        const r = await tx.run(stmt, { d: manifest.source.exportDigest, keyProp: b.keyProp, keys: b.keys });
        const c = toNum(r.records[0].get("c"));
        if (c !== b.keys.length) throw new Error(`reverse relabel ${lbl}: ${c}/${b.keys.length}`);
        relabeled += c;
      }
      const u = (x) => x.summary.counters.updates();
      report.steps.data = { v2NodesDeleted: u(del).nodesDeleted, v2RelationshipsDeleted: u(del).relationshipsDeleted, markersDeleted: u(delM).nodesDeleted, releaseMarkersDeleted: u(delR).nodesDeleted, legacyNodesRestoredLabels: relabeled };
      await tx.commit();
    } catch (e) {
      await tx.rollback().catch(() => {});
      throw e;
    }
    if (args["remove-fences"]) {
      const hadFence = exportManifest.counts.labels.KsWriteFence || exportManifest.counts.labels.KsRevocationFence;
      if (hadFence) report.steps.fences = "kept (the export already had fences)";
      else {
        const r = await s.run("MATCH (f) WHERE (f:KsWriteFence OR f:KsRevocationFence) AND f.id = 'canonical' DELETE f");
        report.steps.fences = { removed: r.summary.counters.updates().nodesDeleted };
      }
    }
    const legacy = await one("MATCH (n) WHERE n.uid IS NULL RETURN count(n) AS nodes");
    const legacyRels = await one("MATCH ()-[r]->() RETURN count(r) AS rels");
    report.after = { nodes: legacy.nodes, relationships: legacyRels.rels, exportNodes: exportManifest.counts.nodes, exportRelationships: exportManifest.counts.relationships };
    report.outcome = legacy.nodes === exportManifest.counts.nodes && legacyRels.rels === exportManifest.counts.relationships ? "rolled-back" : "count-mismatch";
  } catch (e) {
    if (!e.soft) {
      report.outcome = "failed";
      report.error = String(e.message).slice(0, 400);
    }
  } finally {
    await s.close();
  }
} finally {
  await driver.close();
}
report.finishedAt = new Date().toISOString();
writeJson(path.join(outDir, "rollback-report.json"), report);
console.log(JSON.stringify({ outcome: report.outcome, guards: report.guards.filter((g) => !g.ok).map((g) => g.id), steps: report.steps, after: report.after, error: report.error, report: path.relative(REPO_ROOT, path.join(outDir, "rollback-report.json")) }, null, 2));
process.exit(report.outcome === "rolled-back" ? 0 : 1);
