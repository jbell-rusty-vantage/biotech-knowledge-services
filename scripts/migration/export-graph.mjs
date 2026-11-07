#!/usr/bin/env node
// Full streamed, read-only export of a Neo4j database into protected custody (bks-graph-export.v1).
//
//   node scripts/migration/export-graph.mjs [--out <dir>] [--label aura-neo4j] [--timeout-ms 600000]
//
// Source: the Biotech graph BKS_BIOTECH_GRAPH_URI / BKS_BIOTECH_GRAPH_USERNAME / BKS_BIOTECH_GRAPH_PASSWORD from .env
// (database BKS_BIOTECH_GRAPH_DATABASE or "neo4j"), or BKS_EXPORT_URI/BKS_EXPORT_USERNAME/BKS_EXPORT_PASSWORD/BKS_EXPORT_DATABASE.
// Sessions are opened with defaultAccessMode READ and the statements below are read-only; the script asserts
// that no result summary reports updates. Credentials are never written or printed.
//
// Output (default runs/release-v2/custody/backups/<UTC stamp>-<label>/):
//   nodes.jsonl          {elementId, labels[sorted], properties{encoded}}  ordered by elementId
//   relationships.jsonl  {elementId, type, start, end, properties{encoded}} ordered by elementId
//   schema.json          SHOW INDEXES / SHOW CONSTRAINTS rows (all columns) incl. createStatement
//   server.json          server identity (agent, components, db.info, procedure/function inventory), no credentials
//   tokens.json          db.labels / db.relationshipTypes / db.propertyKeys
//   manifest.json        counts, property schemas, per-file sha256, exportDigest
import fs from "node:fs";
import path from "node:path";
import {
  EXPORT_FORMAT, REPO_ROOT, JsonlWriter, canonical, encodeProps, encodedTypeName, labelKey, loadEnv, neo4j, openDriver,
  parseArgs, rowsToPlain, sha256, sourceConfig, stripVolatile, tripleKey, uriHost, utcStamp, writeJson,
} from "./lib/common.mjs";

const SCRIPT_VERSION = "1.0.0";
const WRITE_WORDS = /\b(CREATE|MERGE|SET|DELETE|DETACH|REMOVE|DROP|LOAD\s+CSV|FOREACH|GRANT|DENY|REVOKE|ALTER)\b/i;
function readOnly(statement) {
  // Statements are fixed literals in this file; the guard documents and enforces intent.
  const stripped = statement.replace(/'[^']*'/g, "''");
  if (WRITE_WORDS.test(stripped) && !/^\s*SHOW\b/i.test(stripped)) throw new Error(`export statement is not read-only: ${statement}`);
  return statement;
}

const args = parseArgs(process.argv.slice(2));
const env = loadEnv();
const cfg = sourceConfig(env);
const startedAt = new Date();
const label = args.label ?? (cfg.overridden ? "local-neo4j" : "aura-neo4j");
const outDir = path.resolve(args.out ?? path.join(REPO_ROOT, "runs", "release-v2", "custody", "backups", `${utcStamp(startedAt)}-${label}`));
const timeoutMs = Number(args["timeout-ms"] ?? 600_000);
if (fs.existsSync(outDir) && fs.readdirSync(outDir).length) throw new Error(`output directory not empty: ${outDir}`);
fs.mkdirSync(outDir, { recursive: true });

const driver = openDriver(cfg);
let updatesSeen = false;
const noteSummary = (summary) => {
  if (summary?.counters?.containsUpdates?.() || summary?.counters?.containsSystemUpdates?.()) updatesSeen = true;
};
async function autoRead(session, statement, params = {}) {
  const res = await session.run(readOnly(statement), params);
  noteSummary(res.summary);
  return res.records;
}

try {
  await driver.verifyConnectivity({ database: cfg.database });
  const info = await driver.getServerInfo({ database: cfg.database });
  const session = driver.session({ database: cfg.database, defaultAccessMode: neo4j.session.READ });
  const server = { agent: info.agent ?? null, protocolVersion: info.protocolVersion ?? null, host: uriHost(cfg.uri), database: cfg.database, scheme: cfg.uri.split(":")[0] };
  try {
    // ---- server identity and capability inventory (auto-commit READ; failures recorded, not fatal) ----
    const optional = async (key, statement, map = (r) => rowsToPlain(r)) => {
      try {
        server[key] = map(await autoRead(session, statement));
      } catch (e) {
        server[key] = { unavailable: true, code: e.code ?? null, message: String(e.message).slice(0, 300) };
      }
    };
    await optional("components", "CALL dbms.components() YIELD name, versions, edition RETURN name, versions, edition");
    await optional("dbInfo", "CALL db.info() YIELD id, name, creationDate RETURN id, name, creationDate");
    await optional("procedures", "SHOW PROCEDURES YIELD name RETURN name ORDER BY name", (r) => summarizeNames(r.map((x) => x.get("name"))));
    await optional("functions", "SHOW FUNCTIONS YIELD name RETURN name ORDER BY name", (r) => summarizeNames(r.map((x) => x.get("name"))));
    await optional("gdsVersion", "RETURN gds.version() AS version", (r) => r[0]?.get("version") ?? null);
    await optional("apocVersion", "RETURN apoc.version() AS version", (r) => r[0]?.get("version") ?? null);

    const tokens = {
      labels: (await autoRead(session, "CALL db.labels() YIELD label RETURN label ORDER BY label")).map((r) => r.get("label")),
      relationshipTypes: (await autoRead(session, "CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType ORDER BY relationshipType")).map((r) => r.get("relationshipType")),
      propertyKeys: (await autoRead(session, "CALL db.propertyKeys() YIELD propertyKey RETURN propertyKey ORDER BY propertyKey")).map((r) => r.get("propertyKey")),
    };
    const indexes = rowsToPlain(await autoRead(session, "SHOW INDEXES YIELD * RETURN * ORDER BY name")).map(stripVolatileKeep);
    const constraints = rowsToPlain(await autoRead(session, "SHOW CONSTRAINTS YIELD * RETURN * ORDER BY name")).map(stripVolatileKeep);

    // ---- data: one explicit READ transaction for counts + nodes + relationships ----
    const tx = session.beginTransaction({ timeout: timeoutMs });
    const counts = {};
    let nodeWriter;
    let relWriter;
    const perLabel = {};
    const perLabelSet = {};
    const perType = {};
    const perTriple = {};
    const nodeProps = {}; // labelSet -> key -> {count, types:Set}
    const relProps = {}; // type -> key -> {count, types:Set}
    const labelSetOf = new Map();
    const allKeysUsed = new Set();
    let nodesWithUid = 0;
    try {
      const c1 = await tx.run(readOnly("MATCH (n) RETURN count(n) AS c"));
      counts.nodesCounted = c1.records[0].get("c").toNumber();
      const c2 = await tx.run(readOnly("MATCH ()-[r]->() RETURN count(r) AS c"));
      counts.relationshipsCounted = c2.records[0].get("c").toNumber();

      nodeWriter = new JsonlWriter(path.join(outDir, "nodes.jsonl"));
      const nodeResult = tx.run(readOnly("MATCH (n) RETURN elementId(n) AS id, labels(n) AS labels, properties(n) AS props ORDER BY id"));
      for await (const rec of nodeResult) {
        const labels = [...rec.get("labels")].sort();
        const properties = encodeProps(rec.get("props"));
        const id = rec.get("id");
        const lk = labelKey(labels) || "(no label)";
        labelSetOf.set(id, lk);
        for (const l of labels) perLabel[l] = (perLabel[l] ?? 0) + 1;
        perLabelSet[lk] = (perLabelSet[lk] ?? 0) + 1;
        if ("uid" in properties) nodesWithUid++;
        accumulate(nodeProps, lk, properties, allKeysUsed);
        nodeWriter.write({ elementId: id, labels, properties });
      }
      noteSummary(await nodeResult.summary());

      relWriter = new JsonlWriter(path.join(outDir, "relationships.jsonl"));
      const relResult = tx.run(readOnly("MATCH (a)-[r]->(b) RETURN elementId(r) AS id, type(r) AS type, elementId(a) AS s, elementId(b) AS e, properties(r) AS props ORDER BY id"));
      for await (const rec of relResult) {
        const type = rec.get("type");
        const properties = encodeProps(rec.get("props"));
        const s = rec.get("s");
        const e = rec.get("e");
        perType[type] = (perType[type] ?? 0) + 1;
        const tk = tripleKey(labelSetOf.get(s) ?? "?", type, labelSetOf.get(e) ?? "?");
        perTriple[tk] = (perTriple[tk] ?? 0) + 1;
        accumulate(relProps, type, properties, allKeysUsed);
        relWriter.write({ elementId: rec.get("id"), type, start: s, end: e, properties });
      }
      noteSummary(await relResult.summary());
      await tx.commit(); // read-only transaction: commit only closes it
    } catch (e) {
      await tx.rollback().catch(() => {});
      throw e;
    }

    const files = {};
    const nf = nodeWriter.close();
    const rf = relWriter.close();
    files["nodes.jsonl"] = { sha256: nf.sha256, bytes: nf.bytes, lines: nf.lines };
    files["relationships.jsonl"] = { sha256: rf.sha256, bytes: rf.bytes, lines: rf.lines };
    const schemaDoc = { indexes, constraints };
    files["schema.json"] = writeJson(path.join(outDir, "schema.json"), schemaDoc);
    files["server.json"] = writeJson(path.join(outDir, "server.json"), server);
    files["tokens.json"] = writeJson(path.join(outDir, "tokens.json"), tokens);

    if (nf.lines !== counts.nodesCounted || rf.lines !== counts.relationshipsCounted) {
      throw new Error(`streamed counts differ from counted: nodes ${nf.lines}/${counts.nodesCounted}, relationships ${rf.lines}/${counts.relationshipsCounted}`);
    }
    if (updatesSeen) throw new Error("a result summary reported updates during a read-only export");

    const finishedAt = new Date();
    const exportDigest = "sha256:" + sha256(canonical({ format: EXPORT_FORMAT, files: Object.fromEntries(Object.entries(files).map(([k, v]) => [k, { sha256: v.sha256, bytes: v.bytes }])) }));
    const schemaDigest = "sha256:" + sha256(canonical({
      indexes: indexes.map(schemaComparable).sort((a, b) => a.name.localeCompare(b.name)),
      constraints: constraints.map(schemaComparable).sort((a, b) => a.name.localeCompare(b.name)),
    }));
    const manifest = {
      format: EXPORT_FORMAT,
      scriptVersion: SCRIPT_VERSION,
      exportId: path.basename(outDir),
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      source: {
        host: server.host,
        database: cfg.database,
        agent: server.agent,
        components: server.components,
        dbInfo: server.dbInfo,
        configuredFrom: cfg.overridden ? "BKS_EXPORT_*" : "NEO4J_* (.env)",
        accessMode: "READ",
      },
      consistency: "single explicit READ transaction for counts, nodes and relationships (read-committed isolation; concurrent writers were not fenced; Aura writers were not active per S0)",
      counts: {
        nodes: nf.lines,
        relationships: rf.lines,
        labels: sortObj(perLabel),
        labelSets: sortObj(perLabelSet),
        relationshipTypes: sortObj(perType),
        relationshipTriples: sortObj(perTriple),
        nodesWithUid,
        indexes: indexes.length,
        constraints: constraints.length,
        propertyKeyTokens: tokens.propertyKeys.length,
        propertyKeysInUse: allKeysUsed.size,
      },
      propertySchemas: { nodes: finishSchema(nodeProps), relationships: finishSchema(relProps) },
      propertyKeysInUse: [...allKeysUsed].sort(),
      tokenOnlyPropertyKeys: tokens.propertyKeys.filter((k) => !allKeysUsed.has(k)),
      indexNames: indexes.map((i) => i.name).sort(),
      constraintNames: constraints.map((c) => c.name).sort(),
      schemaDigest,
      files,
      exportDigest,
      readOnlyAssertion: { sessionAccessMode: "READ", updatesReported: updatesSeen },
      custody: "protected custody (runs/ is gitignored); never commit; rollback material for Gate F",
    };
    writeJson(path.join(outDir, "manifest.json"), manifest);
    console.log(JSON.stringify({ ok: true, outDir: path.relative(REPO_ROOT, outDir), exportDigest, nodes: nf.lines, relationships: rf.lines, labels: Object.keys(perLabel).length, types: Object.keys(perType).length, indexes: indexes.length, constraints: constraints.length, startedAt: manifest.startedAt, finishedAt: manifest.finishedAt }, null, 2));
  } finally {
    await session.close();
  }
} finally {
  await driver.close();
}

function stripVolatileKeep(row) {
  return stripVolatile(row);
}
function schemaComparable(row) {
  const { name, type, entityType, labelsOrTypes, properties, createStatement, owningConstraint, indexProvider, options } = row;
  return { name, type, entityType, labelsOrTypes, properties, createStatement, owningConstraint: owningConstraint ?? null, indexProvider: indexProvider ?? null, options: options ?? null };
}
function accumulate(acc, key, properties, allKeys) {
  const slot = (acc[key] ??= { count: 0, keys: {} });
  slot.count++;
  for (const [k, v] of Object.entries(properties)) {
    allKeys.add(k);
    const p = (slot.keys[k] ??= { present: 0, types: new Set(), maxListLength: 0 });
    p.present++;
    p.types.add(encodedTypeName(v));
    if (Array.isArray(v)) p.maxListLength = Math.max(p.maxListLength, v.length);
  }
}
function finishSchema(acc) {
  const out = {};
  for (const key of Object.keys(acc).sort()) {
    const slot = acc[key];
    const keys = {};
    for (const k of Object.keys(slot.keys).sort()) {
      const p = slot.keys[k];
      keys[k] = { present: p.present, types: [...p.types].sort(), ...(p.maxListLength ? { maxListLength: p.maxListLength } : {}) };
    }
    out[key] = { count: slot.count, keys };
  }
  return out;
}
function sortObj(o) {
  return Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}
function summarizeNames(names) {
  const byPrefix = {};
  for (const n of names) {
    const p = n.includes(".") ? n.split(".")[0] : n;
    byPrefix[p] = (byPrefix[p] ?? 0) + 1;
  }
  return { total: names.length, byPrefix: sortObj(byPrefix), digest: "sha256:" + sha256(names.join("\n")), names };
}
