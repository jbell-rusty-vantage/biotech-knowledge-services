#!/usr/bin/env node
// Executes a bks-migration-manifest.v1 plan on a DISPOSABLE shadow graph (BKS_RESTORE_* only; Aura and the production
// host are refused by the target guard).
//
//   apply (one transaction per batch, S3 writer fence + KsIntentMarker checkpoint per batch, Enterprise DDL phase after
//   the batches, invariants, KsReleaseMarker last):
//     BKS_RESTORE_URI=neo4j://localhost:7703 BKS_RESTORE_PASSWORD=... BKS_MIGRATION_APPLY_AUTHORIZED=1 \
//       node packages/kg-ops/src/migration/apply-migration.mjs --plan <planDir> --export <exportDir> --mode apply [--crash-in-batch <batchId>]
//   dry run (everything in ONE transaction, then rolled back):   --mode dry-run-rollback
//
// Batch transaction: lock fence (locked=true; lockSeq+1) -> marker lookup by markerKey (applied with the same digest:
// skip and roll back the lock; different digest: BKS_EFFECT_CONFLICT) -> uid precondition -> statements -> graphRevision+1
// -> marker applied (markerKey, effectKey migration:<runId>:<batchId>, attempts JSON) -> commit. --crash-in-batch
// terminates the process after the batch statements ran but before commit (a kill mid-transaction); a rerun with the
// same plan resumes: committed batches are skipped by marker, the killed batch re-executes.
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assertDisposableTarget, canonical, decodeValue, loadEnv, neo4j, openDriver, readJsonl, rowsToPlain, sha256, sha256File, targetConfig, writeJson, utcStamp } from "../../../../scripts/migration/lib/common.mjs";
import { applyPhase, hasPhases, verifyPhases } from "../../../../scripts/migration/lib/release-ddl.mjs";
import { FENCE_ADVANCE, FENCE_LOCK_1, FENCE_LOCK_2, MARKER_APPLIED, MARKER_LOOKUP, RELEASE_MARKER, preconditionFor, statementsFor } from "./statements.mjs";
import { PLANNER_VERSION } from "./transforms.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..", "..", "..");
const { loadRelease } = await import(pathToFileURL(path.join(REPO, "packages", "schema-workspace", "dist", "index.js")).href);
const kgOps = await import(pathToFileURL(path.join(REPO, "packages", "kg-ops", "dist", "index.js")).href);
export const MIGRATOR_SCOPE = { installationId: "belllabs-biotech", applicationId: "bks-migrator", tenantId: "biotech" };

function decodeDeep(v) {
  if (v === null || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(decodeDeep);
  if (typeof v.$t === "string") return decodeValue(v);
  const o = {};
  for (const [k, x] of Object.entries(v)) o[k] = decodeDeep(x);
  return o;
}
const toNum = (x) => (neo4j.isInt(x) ? x.toNumber() : x);

/** Legacy counts by ORIGINAL label/type (relabeled rows count under legacyLabels[0]); v2 and operational nodes excluded. */
export async function legacyCounts(runner) {
  const labels = rowsToPlain((await runner.run("MATCH (n) WHERE n.uid IS NULL AND NOT n:KsWriteFence AND NOT n:KsRevocationFence AND NOT n:KsIntentMarker AND NOT n:KsReleaseMarker RETURN CASE WHEN n:LegacyV0 THEN n.legacyLabels[0] ELSE head(labels(n)) END AS label, count(*) AS c ORDER BY label")).records);
  const types = rowsToPlain((await runner.run("MATCH (a)-[r]->(b) WHERE a.uid IS NULL AND b.uid IS NULL RETURN type(r) AS type, count(*) AS c ORDER BY type")).records);
  const v2 = toNum((await runner.run("MATCH (n) WHERE n.uid IS NOT NULL RETURN count(n) AS c")).records[0].get("c"));
  return { labels: Object.fromEntries(labels.map((r) => [r.label, r.c])), types: Object.fromEntries(types.map((r) => [r.type, r.c])), v2NodesWithUid: v2 };
}
export function deltaVsExport(counts, exportManifest) {
  const diffs = [];
  const want = exportManifest.counts;
  for (const k of new Set([...Object.keys(want.labels), ...Object.keys(counts.labels)])) if ((want.labels[k] ?? 0) !== (counts.labels[k] ?? 0)) diffs.push({ label: k, export: want.labels[k] ?? 0, target: counts.labels[k] ?? 0 });
  for (const k of new Set([...Object.keys(want.relationshipTypes), ...Object.keys(counts.types)])) if ((want.relationshipTypes[k] ?? 0) !== (counts.types[k] ?? 0)) diffs.push({ type: k, export: want.relationshipTypes[k] ?? 0, target: counts.types[k] ?? 0 });
  return diffs;
}

export function loadPlan(planDir, exportDir) {
  const manifest = JSON.parse(fs.readFileSync(path.join(planDir, "migration-manifest.json"), "utf8"));
  const exportManifest = JSON.parse(fs.readFileSync(path.join(exportDir, "manifest.json"), "utf8"));
  if (manifest.source.exportDigest !== exportManifest.exportDigest) throw new Error("plan was made from a different export");
  for (const [name, digest] of Object.entries(manifest.files)) if (sha256File(path.join(planDir, name)) !== digest) throw new Error(`plan file tampered: ${name}`);
  if ("sha256:" + sha256(canonical({ ...manifest, manifestDigest: undefined })) !== manifest.manifestDigest) throw new Error("manifest digest mismatch");
  return { manifest, exportManifest, batches: [...readJsonl(path.join(planDir, "batches.jsonl"))] };
}

export async function run({ planDir, exportDir, mode, crashInBatch = null, releaseDir = null }) {
  const { manifest, exportManifest, batches } = loadPlan(planDir, exportDir);
  const release = loadRelease(releaseDir ? { dir: releaseDir } : {});
  const releaseId = release.pin?.releaseId ?? release.manifest?.releaseId;
  const ddlDigest = release.manifest?.identities?.ddlDigest ?? release.pin?.ddlDigest;
  const env = loadEnv();
  const cfg = targetConfig(env);
  const host = assertDisposableTarget(cfg, env, { sourceHost: exportManifest.source.host, sourceDatabase: exportManifest.source.database });
  const driver = openDriver(cfg);
  const runId = manifest.migrationRunId;
  const ctx = { runId, exportDigest: manifest.source.exportDigest, mapVersion: manifest.map.mapVersion };
  const report = { format: "bks-migration-apply-report.v2", mode, migrationRunId: runId, manifestDigest: manifest.manifestDigest, plannerVersion: PLANNER_VERSION, release: { releaseId, schemaReleaseDigest: release.schemaReleaseDigest, ddlDigest }, target: { host, database: cfg.database }, startedAt: new Date().toISOString(), pid: process.pid, batches: [], invariants: [], prerequisites: [], ddl: {} };
  try {
    const session = driver.session({ database: cfg.database, defaultAccessMode: neo4j.session.WRITE });
    try {
      report.target.components = rowsToPlain((await session.run("CALL dbms.components() YIELD name, versions, edition RETURN name, versions, edition")).records);
      report.target.edition = report.target.components[0]?.edition;
      const before = await legacyCounts(session);
      const delta = deltaVsExport(before, exportManifest);
      report.preflight = { legacyMatchesExport: delta.length === 0, delta, v2NodesWithUid: before.v2NodesWithUid };
      if (delta.length) throw new Error(`target legacy graph differs from the export (re-export and re-plan): ${JSON.stringify(delta).slice(0, 400)}`);

      // release binding: the plan's release must be the pinned release now (never a literal)
      const pre = [];
      pre.push({ id: "release.bound", ok: manifest.target.schemaReleaseDigestBound === true && manifest.target.schemaReleaseDigest === release.schemaReleaseDigest, detail: `${manifest.target.schemaReleaseDigest} vs pinned ${release.schemaReleaseDigest}` });
      pre.push({ id: "release.ddlDigest", ok: manifest.target.ddlDigest === ddlDigest, detail: `${manifest.target.ddlDigest} vs pinned ${ddlDigest}` });

      if (mode === "apply") {
        const phased = hasPhases(release.ddl.manifest);
        const edition = report.target.edition === "enterprise" ? "enterprise" : "community";
        const req = await verifyPhases(driver, cfg.database, release.ddl.manifest, [phased ? "pre" : "required"], new Set(), edition);
        report.ddl.phased = phased;
        pre.push({ id: phased ? "ddl.preMigration.online" : "ddl.required.online", ok: req.ok, detail: req.ok ? `${req.presentCount}/${req.expected} present, all ONLINE` : { missing: req.missing.slice(0, 20), notOnline: req.notOnline } });
        pre.push({ id: "fence.present", ok: req.fence?.n === 1 && req.revocationFence?.n === 1, detail: { writeFence: req.fence, revocationFence: req.revocationFence } });
        const markers = rowsToPlain((await session.run("MATCH (r:KsReleaseMarker) RETURN r.releaseId AS releaseId, r.migrationRunId AS run")).records);
        pre.push({ id: "releaseMarker.absentOrSameRun", ok: markers.every((m) => m.run === runId), detail: markers });
        const auth = env.BKS_MIGRATION_APPLY_AUTHORIZED;
        pre.push({ id: "operator.authorization", ok: auth === runId || auth === "1", detail: "BKS_MIGRATION_APPLY_AUTHORIZED (lead: '1' accepted on disposable shadows; the run id for any other target)" });
        report.prerequisites = pre;
        report.ddl.requiredBefore = { expected: req.expected, present: req.presentCount };
        if (pre.some((p) => !p.ok)) {
          report.outcome = "refused";
          return finish(report, planDir, 3);
        }
        for (const b of batches) {
          const res = await applyBatchTx(driver, cfg.database, b, manifest, ctx, crashInBatch === b.batchId);
          report.batches.push(res);
          if (!res.ok) {
            report.outcome = "batch-failed";
            return finish(report, planDir, 1);
          }
        }
        // Post-migration DDL after the batches (v2.0.2+: phase post-migration, release-blocked statements skipped;
        // v2.0.1: the whole enterprise file, with live legacy-violation detection). Relabeling cleared the uid conflicts.
        if (phased || report.target.edition === "enterprise") {
          const ent = await applyPhase(driver, cfg.database, release.ddl.manifest, phased ? "post" : "enterprise", edition);
          report.ddl.enterprise = { phase: phased ? "post" : "enterprise", tally: ent.tally, releaseBlocked: (ent.releaseBlocked ?? []).map((b) => ({ name: b.name, status: b.status })), blocked: ent.blocked.map((b) => ({ name: b.name, violations: b.violations, labelsOrTypes: b.labelsOrTypes })), failed: ent.failed };
        }
        const phases = phased ? ["pre", "post"] : report.target.edition === "enterprise" ? ["required", "enterprise"] : ["required"];
        const blockedNames = new Set((report.ddl.enterprise?.blocked ?? []).map((b) => b.name));
        const ver = await verifyPhases(driver, cfg.database, release.ddl.manifest, phases, blockedNames, edition);
        report.ddl.verify = ver;
        report.invariants = await evaluateInvariants(session, manifest, ctx, false);
        const failed = report.invariants.filter((i) => !i.ok);
        if (failed.length || !ver.ok || (report.ddl.enterprise?.failed?.length ?? 0) > 0) {
          report.outcome = "checks-failed";
          return finish(report, planDir, 1);
        }
        // KsReleaseMarker last, under the fence
        const tx = session.beginTransaction();
        try {
          await lockFence(tx);
          const r = await tx.run(RELEASE_MARKER, { releaseId, schemaReleaseDigest: release.schemaReleaseDigest, ddlDigest, run: runId, exportDigest: ctx.exportDigest, manifestDigest: manifest.manifestDigest });
          if (r.records[0].get("run") !== runId) throw new Error(`KsReleaseMarker ${releaseId} belongs to run ${r.records[0].get("run")}`);
          await tx.commit();
        } catch (e) {
          await tx.rollback().catch(() => {});
          throw e;
        }
        report.releaseMarker = rowsToPlain((await session.run("MATCH (r:KsReleaseMarker {releaseId: $id}) RETURN r {.*} AS m", { id: releaseId })).records)[0]?.m;
        const markerInv = await evaluateInvariants(session, manifest, ctx, true);
        report.invariants = markerInv;
        report.fence = rowsToPlain((await session.run("MATCH (f:KsWriteFence {id: 'canonical'}) RETURN f.graphRevision AS graphRevision, f.lockSeq AS lockSeq, f.lastWriterRunId AS lastWriterRunId")).records)[0];
        report.markers = rowsToPlain((await session.run("MATCH (m:KsIntentMarker {planRef: $run}) RETURN count(m) AS n, collect(DISTINCT m.status) AS statuses, sum(CASE WHEN m.markerKey IS NULL THEN 1 ELSE 0 END) AS withoutMarkerKey", { run: runId })).records)[0];
        report.totals = sumCounters(report.batches);
        report.outcome = markerInv.every((i) => i.ok) ? "applied" : "checks-failed";
        return finish(report, planDir, report.outcome === "applied" ? 0 : 1);
      }

      if (mode !== "dry-run-rollback") throw new Error(`unknown mode ${mode}`);
      report.prerequisites = pre;
      const tx = session.beginTransaction({ timeout: 300_000 });
      try {
        await tx.run("CYPHER 5 MERGE (f:KsWriteFence {id: 'canonical'}) ON CREATE SET f.graphRevision = 0, f.lockSeq = 0, f.dryRun = true");
        await tx.run("CYPHER 5 MERGE (r:KsRevocationFence {id: 'canonical'}) ON CREATE SET r.generation = 0, r.dryRun = true");
        for (const b of batches) report.batches.push(await batchBody(tx, b, manifest, ctx));
        await lockFence(tx);
        await tx.run(RELEASE_MARKER, { releaseId, schemaReleaseDigest: release.schemaReleaseDigest, ddlDigest, run: runId, exportDigest: ctx.exportDigest, manifestDigest: manifest.manifestDigest });
        report.invariants = await evaluateInvariants(tx, manifest, ctx, true);
      } finally {
        await tx.rollback();
      }
      const after = await legacyCounts(session);
      const leftovers = toNum((await session.run("MATCH (n) WHERE n.lastWriterRunId = $run OR n:KsReleaseMarker OR (n:KsWriteFence AND n.dryRun) OR n:LegacyV0 OR n.markerKey STARTS WITH 'mk-' AND n.planRef = $run RETURN count(n) AS c", { run: runId })).records[0].get("c"));
      report.rollback = { legacyUnchanged: deltaVsExport(after, exportManifest).length === 0, leftovers, ok: deltaVsExport(after, exportManifest).length === 0 && leftovers === 0 };
      report.totals = sumCounters(report.batches);
      report.outcome = report.invariants.every((i) => i.ok) && report.rollback.ok && pre.every((p) => p.ok) ? "dry-run-passed" : "dry-run-failed";
      return finish(report, planDir, report.outcome === "dry-run-passed" ? 0 : 1);
    } finally {
      await session.close();
    }
  } finally {
    await driver.close();
  }
}

async function lockFence(tx) {
  const a = await tx.run(FENCE_LOCK_1);
  if (toNum(a.records[0]?.get("c")) !== 1) throw new Error("BKS_RELEASE_MISMATCH: KsWriteFence {id:'canonical'} is not installed");
  const b = await tx.run(FENCE_LOCK_2);
  return { graphRevision: toNum(b.records[0].get("graphRevision")), lockSeq: toNum(b.records[0].get("lockSeq")) };
}

/** Batch statements inside an open transaction; returns counters. */
async function batchBody(tx, b, manifest, ctx) {
  const counters = {};
  const add = (summary) => {
    for (const [k, v] of Object.entries(summary.counters.updates())) if (v) counters[k] = (counters[k] ?? 0) + v;
  };
  const now = neo4j.types.DateTime.fromStandardDate(new Date());
  await lockFence(tx);
  const pre = preconditionFor(b);
  if (pre) {
    const r = await tx.run(pre.statement, pre.params);
    const existing = toNum(r.records[0].get("existing"));
    if (existing) throw new Error(`BKS_STALE_PRECONDITION: ${existing} uid(s) of ${b.batchId} already exist`);
  }
  for (const st of statementsFor({ ...b, rows: decodeDeep(b.rows) }, ctx)) add((await tx.run(st.statement, { ...st.params, now })).summary);
  return { batchId: b.batchId, kind: b.kind, count: b.count, ok: true, counters };
}

/** One transaction per batch with fence, checkpoint marker and optional crash fault. */
async function applyBatchTx(driver, database, b, manifest, ctx, crash) {
  const session = driver.session({ database, defaultAccessMode: neo4j.session.WRITE });
  const markerKey = kgOps.markerKeyOf(MIGRATOR_SCOPE, b.effectKey);
  const attemptId = `at-${randomUUID()}`;
  const tx = session.beginTransaction({ timeout: 120_000 });
  try {
    const fence = await lockFence(tx);
    const m = rowsToPlain((await tx.run(MARKER_LOOKUP, { markerKey })).records)[0];
    if (m && m.intentDigest !== b.batchDigest) {
      await tx.rollback();
      return { batchId: b.batchId, ok: false, error: "BKS_EFFECT_CONFLICT", markerKey };
    }
    if (m && m.status === "applied") {
      await tx.rollback(); // nothing to write; the lock-only update is discarded
      return { batchId: b.batchId, kind: b.kind, ok: true, skipped: true, reason: "marker applied with the same batch digest", markerKey, receiptId: m.receiptId };
    }
    const prior = m?.attempts ? JSON.parse(m.attempts) : [];
    const body = await batchBody(tx, b, manifest, ctx);
    const rev = toNum((await tx.run(FENCE_ADVANCE, { effectKey: b.effectKey, run: ctx.runId })).records[0].get("rev"));
    const receiptId = `rc-${sha256(`${markerKey}\n${b.batchDigest}`).slice(0, 32)}`;
    const attempts = [...prior, { attemptId, outcome: "applied", pid: process.pid, priorGraphRevision: fence.graphRevision, graphRevision: rev }];
    await tx.run(MARKER_APPLIED, { markerKey, effectKey: b.effectKey, ...MIGRATOR_SCOPE, batchId: b.batchId, batchDigest: b.batchDigest, runId: ctx.runId, manifestDigest: manifest.manifestDigest, receiptId, receipt: canonical({ batchId: b.batchId, counters: body.counters, graphRevision: rev }), attempts: JSON.stringify(attempts), attemptId, rev: neo4j.int(rev), executorVersion: `bks-migration/${PLANNER_VERSION}` });
    if (crash) {
      // Simulated kill mid-transaction: statements executed, no commit, process terminates without cleanup.
      process.stderr.write(`CRASH-FAULT: terminating pid ${process.pid} inside ${b.batchId} before commit\n`);
      process.exit(137);
    }
    await tx.commit();
    return { ...body, skipped: false, markerKey, receiptId, graphRevision: rev, attemptId };
  } catch (e) {
    await tx.rollback().catch(() => {});
    return { batchId: b.batchId, ok: false, error: String(e.message).slice(0, 400) };
  } finally {
    await session.close();
  }
}

async function evaluateInvariants(runner, manifest, ctx, includeMarker) {
  const res = [];
  for (const inv of manifest.invariants) {
    if (inv.phase === "after-marker" && !includeMarker) continue;
    const r = await runner.run("CYPHER 5 " + inv.statement, { run: ctx.runId, ...(inv.params ?? {}) });
    const value = toNum(r.records[0]?.get("value"));
    res.push({ id: inv.id, expect: inv.expect, value, ok: value === inv.expect });
  }
  return res;
}

function sumCounters(batches) {
  const t = { batches: batches.length, executed: batches.filter((b) => b.ok && !b.skipped).length, skipped: batches.filter((b) => b.skipped).length };
  for (const b of batches) for (const [k, v] of Object.entries(b.counters ?? {})) t[k] = (t[k] ?? 0) + v;
  return t;
}

function finish(report, planDir, code) {
  report.finishedAt = new Date().toISOString();
  const dir = path.join(planDir, "runs");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${utcStamp()}-${report.mode}-${report.target.host}-${report.target.edition ?? "x"}-${process.pid}.json`);
  writeJson(file, report);
  const failedInv = report.invariants.filter((i) => !i.ok);
  console.log(JSON.stringify({ outcome: report.outcome, report: path.relative(REPO, file), batches: report.batches.length, batchFailures: report.batches.filter((b) => !b.ok).map((b) => `${b.batchId}: ${b.error}`), invariants: `${report.invariants.length - failedInv.length}/${report.invariants.length}`, failedInvariants: failedInv, totals: report.totals, ddl: { phased: report.ddl.phased, post: report.ddl.enterprise?.tally, releaseBlocked: report.ddl.enterprise?.releaseBlocked, blocked: report.ddl.enterprise?.blocked, verify: report.ddl.verify && { ok: report.ddl.verify.ok, expected: report.ddl.verify.expected, present: report.ddl.verify.presentCount, missing: report.ddl.verify.missing?.slice(0, 10), blockedAccepted: report.ddl.verify.blockedAccepted } }, fence: report.fence, markers: report.markers, rollback: report.rollback, prerequisites: report.prerequisites.filter((p) => !p.ok).map((p) => p.id) }, null, 2));
  return code;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
  if (!args.plan || !args.export || !args.mode) {
    console.error("usage: apply-migration.mjs --plan <planDir> --export <exportDir> --mode apply|dry-run-rollback [--crash-in-batch <batchId>] [--release-dir <dir>]");
    process.exit(2);
  }
  run({ planDir: path.resolve(args.plan), exportDir: path.resolve(args.export), mode: args.mode, crashInBatch: args["crash-in-batch"] ?? null, releaseDir: args["release-dir"] ? path.resolve(args["release-dir"]) : null }).then((code) => process.exit(code), (e) => {
    console.error(JSON.stringify({ ok: false, error: e.message }));
    process.exit(1);
  });
}
