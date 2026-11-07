#!/usr/bin/env node
/**
 * Applies a release DDL file to a DISPOSABLE Neo4j and verifies that every expected constraint and index exists and is
 * ONLINE. Refuses Aura / remote hosts (never run against production).
 *
 *   node scripts/release/apply-ddl.mjs [--release <dir>] [--file ddl/required.cypher] [--edition community|enterprise]
 *        [--uri neo4j://localhost:7693] [--user neo4j] [--password bks-test-password] [--out <evidence.json>]
 *
 * Exit 0 when every statement of the file applied and every expected name is present and ONLINE.
 */
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { arg, BKS_ROOT, CURRENT_RELEASE_DIR, prettyJson, readJson, readText, writeFileEnsured } from "./lib/common.mjs";

const neo4j = createRequire(resolve(BKS_ROOT, "packages", "kg-ops", "package.json"))("neo4j-driver");
const releaseDir = resolve(arg("--release", CURRENT_RELEASE_DIR));
const file = arg("--file", "ddl/required.cypher");
const uri = arg("--uri", "neo4j://localhost:7693");
const user = arg("--user", "neo4j");
const password = arg("--password", process.env.NEO4J_TEST_PASSWORD ?? "bks-test-password");
const outPath = arg("--out");
if (!/^(neo4j|bolt):\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(uri)) {
  console.error(`refusing non-local URI ${uri}: this script only targets a disposable local Neo4j`);
  process.exit(2);
}
const ddl = readJson(resolve(releaseDir, "ddl", "ddl.json"));
const expected = ddl.statements.filter((s) => s.file === file || s.phaseFile === file);
const text = readText(resolve(releaseDir, file));
const statements = text.split(/;\s*\n/).map((s) => s.split("\n").filter((l) => !l.trim().startsWith("//")).join("\n").trim()).filter(Boolean);

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session({ database: "neo4j" });
const result = { file, uri, releaseId: ddl.releaseId, schemaDigest: ddl.schemaDigest, applied: 0, failed: [], missing: [], notOnline: [], expected: expected.length };
try {
  const comp = await session.run("CALL dbms.components() YIELD name, versions, edition RETURN versions[0] AS version, edition");
  result.neo4j = { version: comp.records[0].get("version"), edition: comp.records[0].get("edition") };
  const started = Date.now();
  for (const st of statements) {
    try {
      await session.run(st);
      result.applied++;
    } catch (e) {
      result.failed.push({ statement: st.slice(0, 200), error: String(e.message).split("\n")[0] });
    }
  }
  result.applyMs = Date.now() - started;
  // Wait for population, then verify presence and state.
  await session.run("CALL db.awaitIndexes(300)");
  const idx = await session.run("SHOW INDEXES YIELD name, state, type, entityType, labelsOrTypes, properties, owningConstraint RETURN name, state, type, entityType, labelsOrTypes, properties, owningConstraint");
  const con = await session.run("SHOW CONSTRAINTS YIELD name, type, entityType, labelsOrTypes, properties RETURN name, type, entityType, labelsOrTypes, properties");
  const indexes = new Map(idx.records.map((r) => [r.get("name"), { state: r.get("state"), type: r.get("type"), owningConstraint: r.get("owningConstraint") }]));
  const constraints = new Map(con.records.map((r) => [r.get("name"), { type: r.get("type") }]));
  for (const s of expected) {
    if (s.kind === "constraint") {
      if (!constraints.has(s.name)) result.missing.push(s.name);
      const backing = [...indexes.entries()].find(([, v]) => v.owningConstraint === s.name);
      if (backing && backing[1].state !== "ONLINE") result.notOnline.push({ name: s.name, index: backing[0], state: backing[1].state });
    } else {
      const i = indexes.get(s.name);
      if (!i) result.missing.push(s.name);
      else if (i.state !== "ONLINE") result.notOnline.push({ name: s.name, state: i.state });
    }
  }
  result.indexesOnServer = indexes.size;
  result.constraintsOnServer = constraints.size;
  result.onlineIndexes = [...indexes.values()].filter((v) => v.state === "ONLINE").length;
} finally {
  await session.close();
  await driver.close();
}
result.ok = result.failed.length === 0 && result.missing.length === 0 && result.notOnline.length === 0 && result.applied === statements.length;
result.statements = statements.length;
if (outPath) writeFileEnsured(resolve(outPath), prettyJson(result));
console.log(JSON.stringify({ ...result, failed: result.failed.slice(0, 10) }, null, 2));
process.exit(result.ok ? 0 : 1);
