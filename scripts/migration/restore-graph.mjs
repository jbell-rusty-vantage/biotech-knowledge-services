#!/usr/bin/env node
// Restores a bks-graph-export.v1 export into an EMPTY disposable target database.
//
//   BKS_RESTORE_URI=neo4j://localhost:7690 BKS_RESTORE_PASSWORD=... \
//     node scripts/migration/restore-graph.mjs --export <exportDir> [--label community-5.26] [--batch 500]
//
// Target env: BKS_RESTORE_URI, BKS_RESTORE_USERNAME (default neo4j), BKS_RESTORE_PASSWORD, BKS_RESTORE_DATABASE (default neo4j).
// There is no fallback to NEO4J_* and the script refuses the production host and any Aura host.
// Steps: verify export file digests -> refuse a non-empty target -> recreate tokens -> nodes (grouped by label set)
// -> relationships (grouped by type, endpoints via the elementId map) -> constraints -> indexes -> await ONLINE.
// Unsupported constraints/indexes (edition or version) are reported, never silently dropped.
// Output: <exportDir>/restores/<UTC stamp>-<label>/{restore-report.json, idmap-nodes.jsonl, idmap-relationships.jsonl}
import fs from "node:fs";
import path from "node:path";
import {
  REPO_ROOT, JsonlWriter, assertDisposableTarget, decodeProps, loadEnv, neo4j, openDriver, parseArgs, q, readJsonl,
  rowsToPlain, targetConfig, utcStamp, verifyExportFiles, writeJson,
} from "./lib/common.mjs";

const SCRIPT_VERSION = "1.0.0";
const args = parseArgs(process.argv.slice(2));
if (!args.export) throw new Error("--export <dir> is required");
const exportDir = path.resolve(args.export);
const batchSize = Number(args.batch ?? 500);
const env = loadEnv();
const cfg = targetConfig(env);
const manifest = JSON.parse(fs.readFileSync(path.join(exportDir, "manifest.json"), "utf8"));
const targetHost = assertDisposableTarget(cfg, env, { sourceHost: manifest.source?.host, sourceDatabase: manifest.source?.database });

// 1. Export integrity
const integrity = verifyExportFiles(exportDir, manifest);
if (!integrity.ok) throw new Error(`export integrity failure: ${JSON.stringify(integrity.mismatches)}`);

const startedAt = new Date();
const label = args.label ?? targetHost;
const outDir = path.join(exportDir, "restores", `${utcStamp(startedAt)}-${label}`);
fs.mkdirSync(outDir, { recursive: true });

const driver = openDriver(cfg);
const report = {
  format: "bks-graph-restore-report.v1",
  scriptVersion: SCRIPT_VERSION,
  exportId: manifest.exportId,
  exportDigest: manifest.exportDigest,
  exportIntegrity: integrity,
  target: { host: targetHost, database: cfg.database },
  startedAt: startedAt.toISOString(),
  tokens: {},
  created: { nodes: 0, relationships: 0 },
  schema: { constraints: [], indexes: [] },
};

try {
  await driver.verifyConnectivity({ database: cfg.database });
  const session = driver.session({ database: cfg.database, defaultAccessMode: neo4j.session.WRITE });
  try {
    const comps = rowsToPlain((await session.run("CALL dbms.components() YIELD name, versions, edition RETURN name, versions, edition")).records);
    report.target.components = comps;
    report.target.edition = comps[0]?.edition ?? "unknown";
    const info = await driver.getServerInfo({ database: cfg.database });
    report.target.agent = info.agent ?? null;

    // 2. Empty-target guard
    const existing = (await session.run("MATCH (n) RETURN count(n) AS c")).records[0].get("c").toNumber();
    const preIdx = rowsToPlain((await session.run("SHOW INDEXES YIELD name, type RETURN name, type")).records);
    const preCons = rowsToPlain((await session.run("SHOW CONSTRAINTS YIELD name RETURN name")).records);
    const userIdx = preIdx.filter((i) => i.type !== "LOOKUP");
    if (existing > 0 || userIdx.length || preCons.length) {
      throw new Error(`target is not empty (nodes=${existing}, non-lookup indexes=${userIdx.length}, constraints=${preCons.length}); restore only into a fresh disposable database`);
    }

    // 3. Tokens (labels/types/property keys that exist only as tokens are recreated when the procedures exist)
    const tokens = JSON.parse(fs.readFileSync(path.join(exportDir, "tokens.json"), "utf8"));
    for (const [kind, proc, list] of [["labels", "db.createLabel", tokens.labels], ["relationshipTypes", "db.createRelationshipType", tokens.relationshipTypes], ["propertyKeys", "db.createProperty", tokens.propertyKeys]]) {
      let ok = 0;
      let error = null;
      for (const name of list) {
        try {
          await session.run(`CALL ${proc}($name)`, { name });
          ok++;
        } catch (e) {
          error = { code: e.code ?? null, message: String(e.message).slice(0, 200) };
          break;
        }
      }
      report.tokens[kind] = { expected: list.length, created: ok, ...(error ? { unsupported: error } : {}) };
    }

    // 4. Nodes grouped by label set
    const nodeMap = new Map();
    const nodeIdWriter = new JsonlWriter(path.join(outDir, "idmap-nodes.jsonl"));
    const groups = new Map();
    for (const node of readJsonl(path.join(exportDir, "nodes.jsonl"))) {
      const key = node.labels.join("\u0000");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(node);
    }
    for (const [key, nodes] of groups) {
      const labels = key ? key.split("\u0000") : [];
      const labelExpr = labels.map((l) => ":" + q(l)).join("");
      const stmt = `UNWIND $rows AS row CREATE (n${labelExpr}) SET n = row.p RETURN row.s AS s, elementId(n) AS t`;
      for (let i = 0; i < nodes.length; i += batchSize) {
        const chunk = nodes.slice(i, i + batchSize);
        const rows = chunk.map((x) => ({ s: x.elementId, p: decodeProps(x.properties) }));
        const res = await session.executeWrite((tx) => tx.run(stmt, { rows }));
        if (res.records.length !== chunk.length) throw new Error(`node batch returned ${res.records.length}/${chunk.length}`);
        for (const r of res.records) {
          nodeMap.set(r.get("s"), r.get("t"));
          nodeIdWriter.write({ source: r.get("s"), target: r.get("t") });
        }
        report.created.nodes += chunk.length;
      }
    }
    const nodeIdFile = nodeIdWriter.close();

    // 5. Relationships grouped by type
    const relIdWriter = new JsonlWriter(path.join(outDir, "idmap-relationships.jsonl"));
    const relGroups = new Map();
    for (const rel of readJsonl(path.join(exportDir, "relationships.jsonl"))) {
      if (!relGroups.has(rel.type)) relGroups.set(rel.type, []);
      relGroups.get(rel.type).push(rel);
    }
    for (const [type, rels] of relGroups) {
      const stmt = `UNWIND $rows AS row MATCH (a) WHERE elementId(a) = row.a MATCH (b) WHERE elementId(b) = row.b CREATE (a)-[r:${q(type)}]->(b) SET r = row.p RETURN row.s AS s, elementId(r) AS t`;
      for (let i = 0; i < rels.length; i += batchSize) {
        const chunk = rels.slice(i, i + batchSize);
        const rows = chunk.map((x) => {
          const a = nodeMap.get(x.start);
          const b = nodeMap.get(x.end);
          if (!a || !b) throw new Error(`relationship ${x.elementId} references an unmapped endpoint`);
          return { s: x.elementId, a, b, p: decodeProps(x.properties) };
        });
        const res = await session.executeWrite((tx) => tx.run(stmt, { rows }));
        if (res.records.length !== chunk.length) throw new Error(`relationship batch returned ${res.records.length}/${chunk.length}`);
        for (const r of res.records) relIdWriter.write({ source: r.get("s"), target: r.get("t") });
        report.created.relationships += chunk.length;
      }
    }
    const relIdFile = relIdWriter.close();
    report.idMaps = { "idmap-nodes.jsonl": nodeIdFile, "idmap-relationships.jsonl": relIdFile };

    // 6. Constraints, then indexes not owned by a constraint
    const schema = JSON.parse(fs.readFileSync(path.join(exportDir, "schema.json"), "utf8"));
    const present = async () => new Set(rowsToPlain((await session.run("SHOW INDEXES YIELD name RETURN name")).records).map((r) => r.name)
      .concat(rowsToPlain((await session.run("SHOW CONSTRAINTS YIELD name RETURN name")).records).map((r) => r.name)));
    for (const c of schema.constraints) report.schema.constraints.push(await applyDdl(session, c, await present()));
    for (const ix of schema.indexes) {
      if (ix.owningConstraint) {
        report.schema.indexes.push({ name: ix.name, type: ix.type, outcome: "owned-by-constraint", owningConstraint: ix.owningConstraint });
        continue;
      }
      report.schema.indexes.push(await applyDdl(session, ix, await present()));
    }
    try {
      await session.run("CALL db.awaitIndexes(600)");
      report.awaitIndexes = "ok";
    } catch (e) {
      report.awaitIndexes = { code: e.code ?? null, message: String(e.message).slice(0, 300) };
    }
    report.targetIndexStates = rowsToPlain((await session.run("SHOW INDEXES YIELD name, type, state RETURN name, type, state ORDER BY name")).records);
  } finally {
    await session.close();
  }
  report.finishedAt = new Date().toISOString();
  const tally = (list) => list.reduce((acc, x) => ((acc[x.outcome] = (acc[x.outcome] ?? 0) + 1), acc), {});
  report.summary = {
    nodes: `${report.created.nodes}/${manifest.counts.nodes}`,
    relationships: `${report.created.relationships}/${manifest.counts.relationships}`,
    constraints: tally(report.schema.constraints),
    indexes: tally(report.schema.indexes),
    unsupported: [...report.schema.constraints, ...report.schema.indexes].filter((x) => x.outcome === "unsupported").map((x) => ({ name: x.name, type: x.type, code: x.error?.code })),
    failed: [...report.schema.constraints, ...report.schema.indexes].filter((x) => x.outcome === "failed").map((x) => ({ name: x.name, type: x.type, code: x.error?.code })),
  };
  writeJson(path.join(outDir, "restore-report.json"), report);
  console.log(JSON.stringify({ ok: report.created.nodes === manifest.counts.nodes && report.created.relationships === manifest.counts.relationships && report.summary.failed.length === 0, restoreDir: path.relative(REPO_ROOT, outDir), edition: report.target.edition, agent: report.target.agent, ...report.summary, startedAt: report.startedAt, finishedAt: report.finishedAt }, null, 2));
} finally {
  await driver.close();
}

async function applyDdl(session, row, presentNames) {
  const base = { name: row.name, type: row.type, entityType: row.entityType ?? null };
  if (presentNames.has(row.name)) return { ...base, outcome: "already-present" };
  if (row.type === "LOOKUP") {
    // Token lookup indexes are created by default; a differently named default is equivalent.
    const lookups = rowsToPlain((await session.run("SHOW INDEXES YIELD name, type, entityType WHERE type = 'LOOKUP' RETURN name, entityType")).records);
    const same = lookups.find((l) => l.entityType === row.entityType);
    if (same) return { ...base, outcome: "equivalent-present", targetName: same.name };
  }
  if (!row.createStatement) return { ...base, outcome: "failed", error: { code: null, message: "no createStatement in export" } };
  try {
    await session.run(row.createStatement);
    return { ...base, outcome: "created" };
  } catch (e) {
    const code = e.code ?? "";
    const msg = String(e.message);
    const unsupported = /Enterprise|enterprise edition|not supported|Unsupported|unknown index provider|requires Neo4j Enterprise|SyntaxError|Invalid input/i.test(msg) || /Statement\.(SyntaxError|NotSystemDatabaseError|UnsupportedOperationError)/.test(code) || /Schema\.(ConstraintCreationFailed)/.test(code) && /edition/i.test(msg);
    return { ...base, outcome: unsupported ? "unsupported" : "failed", error: { code, message: msg.slice(0, 400) }, createStatement: row.createStatement };
  }
}

