#!/usr/bin/env node
// SYNTHETIC fixture. Seeds a DISPOSABLE local database with nodes/relationships covering every Neo4j property value type
// (integers beyond 2^53, NaN/±Infinity/-0.0, temporal with offsets/zone ids/nanoseconds, durations, 2D/3D cartesian and
// WGS-84 points, byte arrays, typed and empty arrays, unicode) plus edition-specific constraints and indexes.
// Every node carries the label BksSyntheticTypeFidelity and synthetic=true. It is never sourced knowledge and must never
// be loaded into a production or shared graph (the target guard refuses Aura and the production host).
//
//   BKS_RESTORE_URI=neo4j://localhost:7691 BKS_RESTORE_PASSWORD=... BKS_RESTORE_DATABASE=bkssynthsrc \
//     node scripts/migration/fixtures/seed-type-fidelity.mjs [--create-database] [--community]
import { assertDisposableTarget, loadEnv, neo4j, openDriver, parseArgs, targetConfig } from "../lib/common.mjs";

const args = parseArgs(process.argv.slice(2));
const env = loadEnv();
const cfg = targetConfig(env);
assertDisposableTarget(cfg, env);
const driver = openDriver(cfg);
const T = neo4j.types;
const i = neo4j.int;
try {
  if (args["create-database"]) {
    const sys = driver.session({ database: "system" });
    await sys.run(`CREATE DATABASE ${cfg.database} IF NOT EXISTS WAIT`);
    await sys.close();
  }
  const s = driver.session({ database: cfg.database, defaultAccessMode: neo4j.session.WRITE });
  try {
    const existing = (await s.run("MATCH (n) RETURN count(n) AS c")).records[0].get("c").toNumber();
    if (existing) throw new Error("target not empty");
    const embedding = Array.from({ length: 1536 }, (_, k) => Math.sin(k + 0.5) / 7);
    await s.run(
      `CREATE (a:BksSyntheticTypeFidelity:SynthA {synthetic: true, key: 'a', bigPos: $bigPos, bigNeg: $bigNeg, small: $small,
          nan: $nan, inf: $inf, ninf: $ninf, negZero: $negZero, pi: 3.141592653589793, tiny: 5e-324,
          s: 'Grüße ✓ 漢字 🧬', empty: '', flag: true, flags: [true, false],
          ints: $ints, floats: [1.0, 2.5, -0.125], strs: ['x', 'y'], emptyList: [],
          d: date('2024-02-29'), lt: localtime('23:59:59.123456789'), t: time('12:34:56.000000001+05:30'),
          ldt: localdatetime('1999-12-31T23:59:59.999999999'), dtOff: datetime('2026-10-11T10:00:00.5-03:00'),
          dtZone: datetime({year: 2026, month: 3, day: 29, hour: 2, minute: 30, timezone: 'Europe/Stockholm'}),
          dtUtc: datetime('1970-01-01T00:00:00Z'), dur: duration('P1Y2M3DT4H5M6.000000007S'), durNeg: duration('-PT1.5S'),
          p2: point({x: 1.5, y: -2.25}), p3: point({x: 1, y: 2, z: 3}), g2: point({longitude: 18.07, latitude: 59.33}),
          g3: point({longitude: -77.0, latitude: 38.9, height: 12.5}), pts: [point({x: 0, y: 0}), point({x: 1, y: 1})],
          dates: [date('2020-01-01'), date('2021-06-30')], bytes: $bytes, searchEmbedding: $embedding})
       CREATE (b:BksSyntheticTypeFidelity:SynthB:SynthMulti {synthetic: true, key: 'b', id: 'synthetic-b'})
       CREATE (c {synthetic: true, key: 'c-unlabeled'})
       CREATE (a)-[:SYNTH_REL {synthetic: true, relKey: 'r1', confidence: 0.75, since: date('2020-05-05'), weight: $bigPos, tags: ['p', 'q']}]->(b)
       CREATE (b)-[:SYNTH_REL {synthetic: true, relKey: 'r2'}]->(a)
       CREATE (b)-[:SYNTH_SELF {synthetic: true}]->(b)
       CREATE (a)-[:SYNTH_EMPTY]->(c)`,
      {
        bigPos: i("9007199254740993"), bigNeg: i("-9223372036854775808"), small: i(42), nan: NaN, inf: Infinity, ninf: -Infinity, negZero: -0,
        ints: [i("9223372036854775807"), i(0), i(-1)], bytes: Int8Array.from([0, 1, 127, -128, -1]), embedding,
      },
    );
    const ddl = [
      "CREATE CONSTRAINT synth_key_unique FOR (n:SynthA) REQUIRE n.key IS UNIQUE",
      "CREATE CONSTRAINT synth_rel_unique FOR ()-[r:SYNTH_REL]-() REQUIRE r.relKey IS UNIQUE",
      "CREATE INDEX synth_range_composite FOR (n:SynthB) ON (n.key, n.id)",
      "CREATE TEXT INDEX synth_text FOR (n:SynthB) ON (n.id)",
      "CREATE POINT INDEX synth_point FOR (n:SynthA) ON (n.p2)",
      "CREATE FULLTEXT INDEX synth_fulltext FOR (n:SynthA|SynthB) ON EACH [n.s, n.id]",
      "CREATE VECTOR INDEX synth_vector FOR (n:SynthA) ON (n.searchEmbedding) OPTIONS {indexConfig: {`vector.dimensions`: 1536, `vector.similarity_function`: 'cosine'}}",
      "CREATE INDEX synth_rel_range FOR ()-[r:SYNTH_REL]-() ON (r.confidence)",
    ];
    if (!args.community) {
      ddl.push(
        "CREATE CONSTRAINT synth_node_key FOR (n:SynthMulti) REQUIRE (n.id) IS NODE KEY",
        "CREATE CONSTRAINT synth_exists FOR (n:BksSyntheticTypeFidelity) REQUIRE n.synthetic IS NOT NULL",
        "CREATE CONSTRAINT synth_type FOR (n:SynthA) REQUIRE n.pi IS :: FLOAT",
        "CREATE CONSTRAINT synth_rel_exists FOR ()-[r:SYNTH_REL]-() REQUIRE r.synthetic IS NOT NULL",
        "CREATE CONSTRAINT synth_rel_key FOR ()-[r:SYNTH_SELF]-() REQUIRE r.synthetic IS RELATIONSHIP KEY",
      );
    }
    for (const stmt of ddl) await s.run(stmt);
    await s.run("CALL db.awaitIndexes(300)");
    console.log(JSON.stringify({ ok: true, database: cfg.database, synthetic: true, ddl: ddl.length }));
  } finally {
    await s.close();
  }
} finally {
  await driver.close();
}
