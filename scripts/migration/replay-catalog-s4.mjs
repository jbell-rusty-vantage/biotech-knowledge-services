#!/usr/bin/env node
// Supported-question replay WITH assertions over a migrated shadow graph, using S4's runner
// (packages/kg-ops/src/read/catalog-run.ts `runCatalogAssertions`) and read service, unchanged.
//
//   BKS_RESTORE_URI=... BKS_RESTORE_PASSWORD=... node scripts/migration/replay-catalog-s4.mjs --plan <planDir> [--out <file>]
//
// Binding: one `internal` binding over the shadow (scope internal, session-routing read authority, application
// visibility; the same shape S4's Community integration suite uses), principal role reader with grant read.internal.
// Positive bindings prefer the migration's uids (from the plan uid map). Outcomes follow S4: fixture-positive (rows with
// matching columns, absent binding differs), contract-only (executes, no non-empty answer on this data), failed,
// unsupported. Disposable targets only.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { REPO_ROOT, assertDisposableTarget, loadEnv, parseArgs, readJsonl, targetConfig, writeJson } from "./lib/common.mjs";

const kg = await import(pathToFileURL(path.join(REPO_ROOT, "packages", "kg-ops", "dist", "index.js")).href);
const { runCatalogAssertions } = await import(pathToFileURL(path.join(REPO_ROOT, "packages", "kg-ops", "dist", "read", "catalog-run.js")).href);
const args = parseArgs(process.argv.slice(2));
if (!args.plan) throw new Error("--plan <planDir> is required");
const planDir = path.resolve(args.plan);
const manifest = JSON.parse(fs.readFileSync(path.join(planDir, "migration-manifest.json"), "utf8"));
const preferredUids = [...readJsonl(path.join(planDir, "uid-map.jsonl"))].map((e) => e.uid).filter((u) => u?.startsWith("hu:")).sort();
const env = loadEnv();
const cfg = targetConfig(env);
const host = assertDisposableTarget(cfg, env);
const client = new kg.GraphClient({ uri: cfg.uri, username: cfg.username, password: cfg.password, database: cfg.database });
const model = kg.ReadModel.fromRelease();
const svc = new kg.ReadService({ model, bindings: [{ ref: "internal", scope: "internal", client, readAuthority: "session-routing", visibility: "application" }], issuer: "bks-read-service" });
const principal = { principalId: "s8-replay-reader", installationId: "belllabs-biotech", applicationId: "bks-migrator", tenantId: "biotech", role: "reader", grants: ["read.internal"] };
const started = new Date().toISOString();
let runs;
try {
  runs = await runCatalogAssertions(svc, principal, "internal", client, { maxCombinations: 60, timeoutMs: 20_000, preferredUids });
} finally {
  await client.close();
}
const tally = {};
for (const r of runs) tally[r.outcome] = (tally[r.outcome] ?? 0) + 1;
const report = {
  format: "bks-catalog-replay-s4.v1",
  runner: "packages/kg-ops/src/read/catalog-run.ts runCatalogAssertions (S4)",
  release: { releaseId: model.releaseId, schemaReleaseDigest: model.schemaReleaseDigest, queryCatalogDigest: model.queryCatalogDigest },
  migrationRunId: manifest.migrationRunId,
  manifestDigest: manifest.manifestDigest,
  target: { host, database: cfg.database },
  startedAt: started,
  finishedAt: new Date().toISOString(),
  templates: runs.length,
  tally,
  failed: runs.filter((r) => r.outcome === "failed").map((r) => ({ id: r.id, reasons: r.reasons.slice(0, 2) })),
  fixturePositive: runs.filter((r) => r.outcome === "fixture-positive").map((r) => ({ id: r.id, rows: r.positive?.rowCount, columnsMatch: r.columnsMatch })),
  runs,
};
const out = path.resolve(args.out ?? path.join(planDir, "runs", `catalog-replay-s4-${host}-${cfg.uri.split(":").pop()}.json`));
fs.mkdirSync(path.dirname(out), { recursive: true });
writeJson(out, report);
console.log(JSON.stringify({ templates: report.templates, tally, failed: report.failed.slice(0, 10), fixturePositive: report.fixturePositive.length, columnsMismatch: report.fixturePositive.filter((r) => r.columnsMatch === false).length, report: path.relative(REPO_ROOT, out) }, null, 2));
