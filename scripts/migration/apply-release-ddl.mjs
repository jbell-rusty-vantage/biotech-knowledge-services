#!/usr/bin/env node
// Installs / verifies the pinned release DDL on a DISPOSABLE shadow graph (BKS_RESTORE_* only; Aura refused).
//
//   node scripts/migration/apply-release-ddl.mjs --phase required     # ddl/required.cypher + bootstrap (both fences)
//   node scripts/migration/apply-release-ddl.mjs --phase enterprise   # ddl/enterprise.cypher (Enterprise server only)
//   node scripts/migration/apply-release-ddl.mjs --phase verify [--with-enterprise] [--report <file>]
//
// The release (loadRelease) is the only DDL authority. Ordering for a legacy graph: required BEFORE the migration
// (no required statement conflicts with preserved legacy data), enterprise AFTER it (relabeling clears the uid
// existence conflicts; anything legacy data still violates is reported blocked-by-legacy-data, never forced).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { REPO_ROOT, assertDisposableTarget, loadEnv, neo4j, openDriver, parseArgs, rowsToPlain, targetConfig, writeJson } from "./lib/common.mjs";
import { applyPhase, verifyPhases } from "./lib/release-ddl.mjs";

const { loadRelease } = await import(pathToFileURL(path.join(REPO_ROOT, "packages", "schema-workspace", "dist", "index.js")).href);
const args = parseArgs(process.argv.slice(2));
const env = loadEnv();
const cfg = targetConfig(env);
const host = assertDisposableTarget(cfg, env);
const release = loadRelease(args["release-dir"] ? { dir: path.resolve(args["release-dir"]) } : {});
const ddl = release.ddl.manifest;
const driver = openDriver(cfg);
const started = new Date().toISOString();
let result;
try {
  const s = driver.session({ database: cfg.database });
  const edition = rowsToPlain((await s.run("CALL dbms.components() YIELD edition RETURN edition")).records)[0].edition;
  await s.close();
  const phase = args.phase;
  if (["required", "enterprise", "pre", "post"].includes(phase)) {
    if (phase === "enterprise" && edition !== "enterprise") throw new Error("enterprise phase needs an Enterprise server");
    result = await applyPhase(driver, cfg.database, ddl, phase, edition);
  } else if (phase === "verify") {
    const phases = args.phases ? String(args.phases).split(",") : args["with-enterprise"] ? ["required", "enterprise"] : ["required"];
    const allow = new Set(String(args["allow-blocked"] ?? "").split(",").filter(Boolean));
    result = await verifyPhases(driver, cfg.database, ddl, phases, allow, edition);
  } else throw new Error("--phase pre|post|verify (v2.0.2+), or required|enterprise (v2.0.1)");
  result = { format: "bks-release-ddl-report.v1", releaseId: release.pin?.releaseId, schemaReleaseDigest: release.schemaReleaseDigest, ddlDigest: release.manifest?.identities?.ddlDigest, target: { host, database: cfg.database, edition }, startedAt: started, finishedAt: new Date().toISOString(), ...result };
  if (args.report) writeJson(path.resolve(args.report), result);
  const { statements, ...brief } = result;
  console.log(JSON.stringify({ ...brief, blocked: (result.blocked ?? []).map((b) => `${b.name} (${b.violations})`), releaseBlocked: (result.releaseBlocked ?? []).map((b) => b.name), failed: (result.failed ?? []).map((f) => `${f.name}: ${f.code}`), equivalent: (result.equivalent ?? []).map((e) => e.name) }, null, 2));
  process.exit(result.failed?.length || result.ok === false ? 1 : 0);
} finally {
  await driver.close();
}
void fs;
