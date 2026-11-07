#!/usr/bin/env node
// Read-only analytics capability probe for biotech-graph-analyze.
//
//   node .agents/skills/biotech-graph-analyze/scripts/capability-probe.mjs --export <exportDir>   # offline, from server.json
//   node .agents/skills/biotech-graph-analyze/scripts/capability-probe.mjs --live                 # READ session, SHOW PROCEDURES only
//
// Prints the capability object the service must advertise. Installed procedures are NOT admission: the release
// admission list below is the authority, and the pinned release admits no analytics route (OD-22). The release identity
// is read from the pinned bundle at run time (loadRelease() verifies its bytes); it is never a literal here.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { REPO_ROOT, loadEnv, neo4j, openDriver, parseArgs, sourceConfig } from "../../../../scripts/migration/lib/common.mjs";

const { loadRelease } = await import(pathToFileURL(path.join(REPO_ROOT, "packages", "schema-workspace", "dist", "index.js")).href);
const pinned = loadRelease();

// Admission and serving state of the pinned release: no analytics route is admitted and native data vectors are not served
// (OD-22, OD-44). A release that admits a route changes this list together with its own release identity.
const RELEASE = { releaseId: pinned.pin?.releaseId ?? null, schemaReleaseDigest: pinned.schemaReleaseDigest, admittedAnalytics: [], nativeVectorsServed: false, od44Profile: { model: "text-embedding-3-small", dimensions: 1536, similarity: "cosine", state: "recorded, not served" } };
const args = parseArgs(process.argv.slice(2));
let evidence;
if (args.export) {
  const server = JSON.parse(fs.readFileSync(path.join(path.resolve(args.export), "server.json"), "utf8"));
  evidence = { source: "export server.json", agent: server.agent, gdsProcedures: server.procedures?.byPrefix?.gds ?? 0, genaiProcedures: server.procedures?.byPrefix?.genai ?? 0, gdsVersion: server.gdsVersion };
} else if (args.live) {
  const cfg = sourceConfig(loadEnv());
  const driver = openDriver(cfg);
  const s = driver.session({ database: cfg.database, defaultAccessMode: neo4j.session.READ });
  try {
    const r = await s.run("SHOW PROCEDURES YIELD name RETURN sum(CASE WHEN name STARTS WITH 'gds.' THEN 1 ELSE 0 END) AS gds, sum(CASE WHEN name STARTS WITH 'genai.' THEN 1 ELSE 0 END) AS genai");
    evidence = { source: "live SHOW PROCEDURES (READ)", agent: (await driver.getServerInfo({ database: cfg.database })).agent, gdsProcedures: r.records[0].get("gds").toNumber(), genaiProcedures: r.records[0].get("genai").toNumber() };
  } finally {
    await s.close();
    await driver.close();
  }
} else {
  console.error("usage: capability-probe.mjs --export <dir> | --live");
  process.exit(2);
}
const reasons = [];
if (!RELEASE.admittedAnalytics.length) reasons.push("no analytics route admitted in this release (OD-22: feature/budget admission required)");
if (!evidence.gdsProcedures) reasons.push("no gds procedures installed");
const capability = {
  releaseId: RELEASE.releaseId,
  schemaReleaseDigest: RELEASE.schemaReleaseDigest,
  analytics: { available: false, installed: evidence.gdsProcedures > 0, admitted: RELEASE.admittedAnalytics, reasons },
  retrieve: { available: false, reasons: ["native data vectors disabled; OD-44 profile recorded, not served"], od44Profile: RELEASE.od44Profile },
  evidence,
};
console.log(JSON.stringify(capability, null, 2));
