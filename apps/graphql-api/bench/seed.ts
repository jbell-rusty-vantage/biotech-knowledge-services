import neo4j from "neo4j-driver";
import { loadConsumerSourceSdl } from "../src/release.js";
import { loadCompatibilityMatrix, loadRequiredIndexes } from "../src/readiness.js";
import { applyBenchmarkDdl, generateFixture, loadFixture, loadFixtureIr, uniquePropertiesFromDdl, wipeSyntheticFixture, writeReleaseMarker } from "./fixture.js";

/**
 * Seeds the DISPOSABLE local Neo4j with the synthetic v2 benchmark fixture (refuses any non-local URI).
 *   BENCH_NEO4J_URI=neo4j://127.0.0.1:7692 BENCH_NEO4J_PASSWORD=... pnpm api:bench:seed [--scale 1] [--no-marker]
 */
const uri = process.env.BENCH_NEO4J_URI ?? "neo4j://127.0.0.1:7692";
if (!/^(neo4j|bolt):\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(uri)) throw new Error(`refusing to seed a non-local database: ${uri}`);
const password = process.env.BENCH_NEO4J_PASSWORD ?? "bks-s6-password";
const database = process.env.BENCH_NEO4J_DATABASE ?? "neo4j";
const args = process.argv.slice(2);
const scale = Number(args.includes("--scale") ? args[args.indexOf("--scale") + 1] : "1");

const source = loadConsumerSourceSdl({ log: () => {} });
if (args.includes("--marker-only")) {
  // The migrator's last step on a real graph; here a labeled test marker for the disposable synthetic graph.
  const driver = neo4j.driver(uri, neo4j.auth.basic("neo4j", password));
  try {
    await writeReleaseMarker(driver, database, { releaseId: source.releaseId, schemaReleaseDigest: source.schemaReleaseDigest ?? "", migrationRunId: "s6-synthetic-benchmark", ddlDigest: (source.bundle?.pin as { ddlDigest?: string } | null)?.ddlDigest });
    console.log(`wrote test :KsReleaseMarker ${source.releaseId} ${source.schemaReleaseDigest}`);
  } finally {
    await driver.close();
  }
  process.exit(0);
}
if (args.includes("--ddl-and-marker-only")) {
  // Upgrade an already seeded disposable graph to the pinned release: migration commands, required DDL, marker.
  const driver = neo4j.driver(uri, neo4j.auth.basic("neo4j", password));
  const s = driver.session({ database });
  try {
    const commands = ((source.releaseCompatibility?.migrationCommands as Array<{ cypher: string; name: string }> | undefined) ?? []);
    for (const c of commands) await s.run(c.cypher);
    let n = 0;
    for (const entry of source.ddl.filter((e) => e.required && e.edition === "community")) {
      await s.run(String(entry.statement));
      n++;
    }
    await s.run("CALL db.awaitIndexes(1800)");
    await s.run("MATCH (m:KsReleaseMarker) WHERE m.syntheticFixture = true DELETE m");
    await writeReleaseMarker(driver, database, { releaseId: source.releaseId, schemaReleaseDigest: source.schemaReleaseDigest ?? "", migrationRunId: "s6-synthetic-benchmark" });
    console.log(`applied ${commands.length} migration commands and ${n} required DDL statements; marker ${source.releaseId} ${source.schemaReleaseDigest}`);
  } finally {
    await s.close();
    await driver.close();
  }
  process.exit(0);
}
const ir = loadFixtureIr(source);
const required = loadRequiredIndexes();
const driver = neo4j.driver(uri, neo4j.auth.basic("neo4j", password));
try {
  const t0 = Date.now();
  await wipeSyntheticFixture(driver, database);
  let ddl = 0;
  const skipDdl = args.includes("--skip-ddl"); // DDL applied by `bks kg ensure-operations --phase pre|post` instead
  if (skipDdl) {
    console.log("DDL left to kg ensure-operations");
  } else if (source.mode === "release") {
    // The release's own required community DDL (what the S1/S8 migration job applies), on the disposable DB only.
    const s = driver.session({ database });
    try {
      // Phase 1: uid constraints (the loader matches relationship endpoints by uid); the rest after the load, so
      // index population runs once instead of slowing every write.
      for (const entry of source.ddl.filter((e) => e.required && e.edition === "community" && JSON.stringify(e.properties) === '["uid"]')) {
        await s.run(String(entry.statement));
        ddl++;
      }
      await s.run("CALL db.awaitIndexes(600)");
    } finally {
      await s.close();
    }
  } else {
    const extra = required.requirements
      .filter((r) => !(r.properties.length === 1 && r.properties[0] === "uid"))
      .map((r) => ({ name: `bench_${r.id.replace(/[^A-Za-z0-9]/g, "_")}`, label: r.label, properties: r.properties }));
    ddl = await applyBenchmarkDdl(driver, database, ir, extra);
  }
  const { BENCH_COUNTS, BENCH_DEFAULT_COUNT } = await import("./fixture.js");
  const counts = Object.fromEntries(Object.entries(BENCH_COUNTS).map(([k, v]) => [k, Math.max(1, Math.round(v * scale))]));
  const fixture = generateFixture(ir, { counts, defaultCount: Math.max(1, Math.round(BENCH_DEFAULT_COUNT * scale)), uniqueProperties: uniquePropertiesFromDdl(source.ddl) });
  console.log(`generated ${fixture.nodes.length} nodes, ${fixture.rels.length} relationships (scale ${scale}) in ${Date.now() - t0} ms`);
  const report = await loadFixture(driver, database, fixture);
  if (source.mode === "release" && !skipDdl) {
    const s = driver.session({ database });
    try {
      for (const entry of source.ddl.filter((e) => e.required && e.edition === "community" && JSON.stringify(e.properties) !== '["uid"]')) {
        await s.run(String(entry.statement));
        ddl++;
      }
      await s.run("CALL db.awaitIndexes(1800)");
    } finally {
      await s.close();
    }
  }
  console.log(`loaded in ${report.ms} ms; ${ddl} DDL statements applied (disposable DB only)`);
  if (!args.includes("--no-marker")) {
    const matrix = loadCompatibilityMatrix();
    const marker = source.mode === "candidate" ? matrix.candidate : { releaseId: source.releaseId, schemaReleaseDigest: source.schemaReleaseDigest ?? "" };
    await writeReleaseMarker(driver, database, { releaseId: marker.releaseId, schemaReleaseDigest: marker.schemaReleaseDigest, migrationRunId: "s6-synthetic-benchmark", ddlDigest: (source.bundle?.pin as { ddlDigest?: string } | null)?.ddlDigest });
    console.log(`wrote test :KsReleaseMarker ${marker.releaseId} ${marker.schemaReleaseDigest}`);
  }
  const s = driver.session({ database });
  const counts2 = await s.run("MATCH (n) WHERE n.syntheticFixture = true RETURN count(n) AS nodes");
  const rels = await s.run("MATCH ()-[r]->() WHERE r.syntheticFixture = true RETURN count(r) AS rels");
  await s.close();
  console.log(`database now holds ${counts2.records[0]!.get("nodes")} synthetic nodes, ${rels.records[0]!.get("rels")} synthetic relationships`);
} finally {
  await driver.close();
}
