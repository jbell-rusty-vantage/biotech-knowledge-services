#!/usr/bin/env node
// Compares a source export manifest with a restored target (READ session only on the target).
//
//   BKS_RESTORE_URI=... BKS_RESTORE_PASSWORD=... \
//     node scripts/migration/verify-restore.mjs --export <exportDir> --restore <exportDir>/restores/<run> [--sample N]
//   node scripts/migration/verify-restore.mjs --export <exportDir> --export-only     # integrity of the export alone
//
// Checks: export file digests; node/relationship totals; counts per label, label set, type and (labelSet)-[type]->(labelSet)
// triple; property-key sets and value types per label set / type; deep equality of every (or a seeded sample of) node and
// relationship through the restore elementId map; a reconstructed nodes/relationships digest in source order (equals the
// source file digest iff every element is identical); index/constraint names present and ONLINE, minus those the
// restore reported unsupported (listed as expected gaps with reasons).
// Output: <restoreDir>/verify-report.json; exit code 1 on any failed check.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  REPO_ROOT, canonical, encodeProps, encodedTypeName, labelKey, loadEnv, neo4j, openDriver, parseArgs, readJsonl, rowsToPlain,
  targetConfig, tripleKey, verifyExportFiles, writeJson,
} from "./lib/common.mjs";

const SCRIPT_VERSION = "1.0.0";
const args = parseArgs(process.argv.slice(2));
if (!args.export) throw new Error("--export <dir> is required");
const exportDir = path.resolve(args.export);
const manifest = JSON.parse(fs.readFileSync(path.join(exportDir, "manifest.json"), "utf8"));
const startedAt = new Date().toISOString();
const checks = [];
let target = {};
const check = (name, ok, detail = {}) => checks.push({ name, ok: Boolean(ok), ...detail });

const integrity = verifyExportFiles(exportDir, manifest);
check("export.fileDigests", integrity.ok, { filesChecked: integrity.filesChecked, mismatches: integrity.mismatches });

if (args["export-only"]) {
  // Recount the export files against the manifest counts.
  let nodes = 0;
  let rels = 0;
  for (const _ of readJsonl(path.join(exportDir, "nodes.jsonl"))) nodes++;
  for (const _ of readJsonl(path.join(exportDir, "relationships.jsonl"))) rels++;
  check("export.nodeCount", nodes === manifest.counts.nodes, { expected: manifest.counts.nodes, actual: nodes });
  check("export.relationshipCount", rels === manifest.counts.relationships, { expected: manifest.counts.relationships, actual: rels });
  finish(null);
}

if (!args.restore) throw new Error("--restore <restoreDir> is required unless --export-only");
const restoreDir = path.resolve(args.restore);
const restoreReport = JSON.parse(fs.readFileSync(path.join(restoreDir, "restore-report.json"), "utf8"));
const env = loadEnv();
const cfg = targetConfig(env);
const nodeMap = new Map();
for (const m of readJsonl(path.join(restoreDir, "idmap-nodes.jsonl"))) nodeMap.set(m.target, m.source);
const relMap = new Map();
for (const m of readJsonl(path.join(restoreDir, "idmap-relationships.jsonl"))) relMap.set(m.target, m.source);

const driver = openDriver(cfg);
try {
  const session = driver.session({ database: cfg.database, defaultAccessMode: neo4j.session.READ });
  try {
    target.components = rowsToPlain((await session.run("CALL dbms.components() YIELD name, versions, edition RETURN name, versions, edition")).records);
    // Reconstruct the target graph in source identity space.
    const tNodes = new Map();
    const perLabel = {};
    const perLabelSet = {};
    const nodeKeys = {};
    let unmappedNodes = 0;
    for await (const rec of session.run("MATCH (n) RETURN elementId(n) AS id, labels(n) AS labels, properties(n) AS props")) {
      const src = nodeMap.get(rec.get("id"));
      if (!src) {
        unmappedNodes++;
        continue;
      }
      const labels = [...rec.get("labels")].sort();
      const properties = encodeProps(rec.get("props"));
      tNodes.set(src, { elementId: src, labels, properties });
      for (const l of labels) perLabel[l] = (perLabel[l] ?? 0) + 1;
      const lk = labelKey(labels) || "(no label)";
      perLabelSet[lk] = (perLabelSet[lk] ?? 0) + 1;
      typeAcc(nodeKeys, lk, properties);
    }
    const tRels = new Map();
    const perType = {};
    const perTriple = {};
    const relKeys = {};
    let unmappedRels = 0;
    for await (const rec of session.run("MATCH (a)-[r]->(b) RETURN elementId(r) AS id, type(r) AS type, elementId(a) AS s, elementId(b) AS e, properties(r) AS props")) {
      const src = relMap.get(rec.get("id"));
      if (!src) {
        unmappedRels++;
        continue;
      }
      const type = rec.get("type");
      const start = nodeMap.get(rec.get("s")) ?? `unmapped:${rec.get("s")}`;
      const end = nodeMap.get(rec.get("e")) ?? `unmapped:${rec.get("e")}`;
      const properties = encodeProps(rec.get("props"));
      tRels.set(src, { elementId: src, type, start, end, properties });
      perType[type] = (perType[type] ?? 0) + 1;
      const lk = (id) => (tNodes.has(id) ? labelKey(tNodes.get(id).labels) || "(no label)" : "?");
      const tk = tripleKey(lk(start), type, lk(end));
      perTriple[tk] = (perTriple[tk] ?? 0) + 1;
      typeAcc(relKeys, type, properties);
    }
    check("target.unmappedNodes", unmappedNodes === 0, { actual: unmappedNodes });
    check("target.unmappedRelationships", unmappedRels === 0, { actual: unmappedRels });
    check("counts.nodes", tNodes.size === manifest.counts.nodes, { expected: manifest.counts.nodes, actual: tNodes.size });
    check("counts.relationships", tRels.size === manifest.counts.relationships, { expected: manifest.counts.relationships, actual: tRels.size });
    cmpMap("counts.perLabel", manifest.counts.labels, perLabel);
    cmpMap("counts.perLabelSet", manifest.counts.labelSets, perLabelSet);
    cmpMap("counts.perRelationshipType", manifest.counts.relationshipTypes, perType);
    cmpMap("counts.perTriple", manifest.counts.relationshipTriples, perTriple);
    cmpMap("propertySchema.nodes", flattenSchema(manifest.propertySchemas.nodes), flattenAcc(nodeKeys));
    cmpMap("propertySchema.relationships", flattenSchema(manifest.propertySchemas.relationships), flattenAcc(relKeys));

    // Deep equality (all elements, or a seeded sample) plus reconstructed digests in source order.
    const sample = args.sample ? Number(args.sample) : Infinity;
    const deep = (file, tMap, label) => {
      const h = createHash("sha256");
      let compared = 0;
      let diffs = [];
      let i = 0;
      const all = [...readJsonl(file)];
      const pick = sampleIndexes(all.length, sample, 20261011);
      for (const src of all) {
        const t = tMap.get(src.elementId);
        const line = t ? canonical(t) + "\n" : "";
        h.update(line);
        if (pick.has(i)) {
          compared++;
          if (canonical(src) !== (t ? canonical(t) : "")) diffs.push(src.elementId);
        }
        i++;
      }
      const digest = h.digest("hex");
      const expected = manifest.files[path.basename(file)].sha256;
      check(`deepEquality.${label}`, diffs.length === 0, { compared, total: all.length, differing: diffs.slice(0, 20), differingCount: diffs.length });
      check(`reconstructedDigest.${label}`, digest === expected, { expected, actual: digest });
    };
    deep(path.join(exportDir, "nodes.jsonl"), tNodes, "nodes");
    deep(path.join(exportDir, "relationships.jsonl"), tRels, "relationships");

    // Indexes / constraints
    const schema = JSON.parse(fs.readFileSync(path.join(exportDir, "schema.json"), "utf8"));
    const tIdx = rowsToPlain((await session.run("SHOW INDEXES YIELD name, type, state, entityType, labelsOrTypes, properties RETURN *")).records);
    const tCons = rowsToPlain((await session.run("SHOW CONSTRAINTS YIELD name, type RETURN *")).records);
    const tIdxNames = new Map(tIdx.map((i) => [i.name, i]));
    const tConsNames = new Set(tCons.map((c) => c.name));
    const consOutcomes = new Map(restoreReport.schema.constraints.map((x) => [x.name, x]));
    const idxOutcomes = new Map(restoreReport.schema.indexes.map((x) => [x.name, x]));
    const missing = [];
    const expectedGaps = [];
    const notOnline = [];
    for (const c of schema.constraints) {
      if (tConsNames.has(c.name)) continue;
      const o = consOutcomes.get(c.name);
      if (o?.outcome === "unsupported") expectedGaps.push({ name: c.name, type: c.type, reason: o.error?.message?.slice(0, 160) });
      else missing.push({ name: c.name, type: c.type, outcome: o?.outcome ?? "unknown" });
    }
    for (const ix of schema.indexes) {
      const t = tIdxNames.get(ix.name);
      if (t) {
        if (t.state !== "ONLINE") notOnline.push({ name: ix.name, state: t.state });
        continue;
      }
      const o = idxOutcomes.get(ix.name);
      if (o?.outcome === "equivalent-present") continue;
      if (o?.outcome === "unsupported") expectedGaps.push({ name: ix.name, type: ix.type, reason: o.error?.message?.slice(0, 160) });
      else if (o?.outcome === "owned-by-constraint" && consOutcomes.get(ix.owningConstraint)?.outcome === "unsupported") expectedGaps.push({ name: ix.name, type: ix.type, reason: `backing index of unsupported constraint ${ix.owningConstraint}` });
      else missing.push({ name: ix.name, type: ix.type, outcome: o?.outcome ?? "unknown" });
    }
    check("schema.namesPresent", missing.length === 0, { expectedConstraints: schema.constraints.length, expectedIndexes: schema.indexes.length, missing });
    check("schema.allOnline", notOnline.length === 0, { notOnline });
    target.expectedSchemaGaps = expectedGaps;
  } finally {
    await session.close();
  }
} finally {
  await driver.close();
}
finish(restoreDir);

function finish(dir) {
  const ok = checks.every((c) => c.ok);
  const report = { format: "bks-graph-verify-report.v1", scriptVersion: SCRIPT_VERSION, exportId: manifest.exportId, exportDigest: manifest.exportDigest, startedAt, finishedAt: new Date().toISOString(), target, ok, checks };
  if (dir) writeJson(path.join(dir, "verify-report.json"), report);
  console.log(JSON.stringify({ ok, exportDigest: manifest.exportDigest, failed: checks.filter((c) => !c.ok).map((c) => c.name), passed: checks.filter((c) => c.ok).length, total: checks.length, expectedSchemaGaps: target.expectedSchemaGaps?.length ?? 0, report: dir ? path.relative(REPO_ROOT, path.join(dir, "verify-report.json")) : null }, null, 2));
  process.exit(ok ? 0 : 1);
}
function cmpMap(name, expected, actual) {
  const keys = new Set([...Object.keys(expected ?? {}), ...Object.keys(actual ?? {})]);
  const diffs = [];
  for (const k of keys) if (canonical(expected?.[k] ?? null) !== canonical(actual?.[k] ?? null)) diffs.push({ key: k, expected: expected?.[k] ?? null, actual: actual?.[k] ?? null });
  check(name, diffs.length === 0, { keys: keys.size, diffs: diffs.slice(0, 30) });
}
function typeAcc(acc, key, props) {
  const slot = (acc[key] ??= {});
  for (const [k, v] of Object.entries(props)) {
    const p = (slot[k] ??= { present: 0, types: new Set() });
    p.present++;
    p.types.add(encodedTypeName(v));
  }
}
function flattenAcc(acc) {
  const out = {};
  for (const [key, slot] of Object.entries(acc)) for (const [k, p] of Object.entries(slot)) out[`${key}.${k}`] = { present: p.present, types: [...p.types].sort() };
  return out;
}
function flattenSchema(s) {
  const out = {};
  for (const [key, slot] of Object.entries(s)) for (const [k, p] of Object.entries(slot.keys)) out[`${key}.${k}`] = { present: p.present, types: p.types };
  return out;
}
function sampleIndexes(n, k, seed) {
  if (k >= n) return new Set([...Array(n).keys()]);
  let x = seed >>> 0;
  const rnd = () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const idx = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return new Set(idx.slice(0, k));
}
