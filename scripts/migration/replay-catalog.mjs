#!/usr/bin/env node
// Supported-question replay over a migrated shadow graph (no assertions; S4's template runner supersedes this when it lands).
//
//   BKS_RESTORE_URI=... BKS_RESTORE_PASSWORD=... node scripts/migration/replay-catalog.mjs --plan <planDir> [--out <file>] [--bindings 8]
//
// For every `supported` template of the pinned release query catalog: EXPLAIN (plan compiles on this server), then
// execute in a READ transaction with the template timeout under up to N deterministic parameter bindings drawn from the
// migration uid map (uid-lookup parameters take uids of the label the statement matches; temporal parameters take the
// replay instant; other parameters take neutral values). Records rows per binding, whether any binding returned rows,
// and errors. READ sessions only; templates are read statements.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { REPO_ROOT, assertDisposableTarget, loadEnv, neo4j, openDriver, parseArgs, readJsonl, targetConfig, writeJson } from "./lib/common.mjs";

const { loadRelease } = await import(pathToFileURL(path.join(REPO_ROOT, "packages", "schema-workspace", "dist", "index.js")).href);
const args = parseArgs(process.argv.slice(2));
if (!args.plan) throw new Error("--plan <planDir> is required");
const planDir = path.resolve(args.plan);
const nBind = Number(args.bindings ?? 8);
const release = loadRelease();
const catalog = release.queryCatalog?.templates ? release.queryCatalog : JSON.parse(fs.readFileSync(path.join(release.dir, "query-catalog", "catalog.json"), "utf8"));
const templates = catalog.templates.filter((t) => t.status === "supported");
const uidMap = [...readJsonl(path.join(planDir, "uid-map.jsonl"))];
const manifest = JSON.parse(fs.readFileSync(path.join(planDir, "migration-manifest.json"), "utf8"));
const byLabel = new Map();
const add = (label, uid) => (byLabel.get(label) ?? byLabel.set(label, []).get(label)).push(uid);
for (const e of uidMap) {
  if (e.kind === "node") add(e.v2Type, e.uid);
  else if (e.kind === "assertion") add("Assertion", e.uid);
  else if (e.kind === "locator") add("SourceLocator", e.uid);
  else if (e.kind === "identifier") add("Identifier", e.uid);
}
const p = manifest.provenance;
add("Agent", p.agentUid);
add("Activity", p.activityUid);
for (const u of p.researchActivityUids) add("Activity", u);
add("Source", p.sourceUid);
add("SourceSnapshot", p.snapshotUid);
for (const v of byLabel.values()) v.sort();
const allUids = [...new Set([...byLabel.values()].flat())].sort();
const instant = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

function labelFor(statement, param) {
  const re = new RegExp(`\\(\\s*\\w*\\s*:\\s*\`?(\\w+)\`?[^)]*\\{[^}]*uid:\\s*\\$${param}\\b`);
  const m = re.exec(statement);
  if (m) return m[1];
  const w = new RegExp(`(\\w+)\\.uid\\s*=\\s*\\$${param}\\b`).exec(statement);
  if (w) {
    const v = new RegExp(`\\(\\s*${w[1]}\\s*:\\s*\`?(\\w+)`).exec(statement);
    if (v) return v[1];
  }
  return null;
}
function bindings(t) {
  const params = t.parameters ?? {};
  const out = [];
  const dyn = /\$\(\$label\)/.test(t.statement);
  for (let i = 0; i < nBind; i++) {
    const b = {};
    let usable = true;
    for (const [k, spec] of Object.entries(params)) {
      if (spec.inferredFrom === "uid lookup" || spec.pattern === "^hu:") {
        const lbl = labelFor(t.statement, k);
        const pool = lbl ? byLabel.get(lbl) ?? [] : allUids;
        if (!pool.length) {
          b[k] = `hu:replay:none-${k}`;
          continue;
        }
        b[k] = pool[i % pool.length];
        if (dyn && !b.label) b.label = [...byLabel.entries()].find(([, us]) => us.includes(b[k]))?.[0] ?? "Entity";
      } else if (spec.type === "array") b[k] = spec.items?.type === "number" ? Array(1536).fill(0) : [];
      else if (spec.neo4jType === "DateTime") b[k] = neo4j.types.DateTime.fromStandardDate(new Date(instant));
      else if (spec.inferredFrom === "temporal name" || /^(asOf|validAt|recAt|R|V|V1|V2)$/.test(k)) b[k] = instant;
      else if (/^(queryText|q|query|text|searchText)$/.test(k)) b[k] = "test";
      else if (k === "label") continue;
      else if (spec.type === "integer" || spec.type === "number") b[k] = neo4j.int(10);
      else if (spec.type === "boolean") b[k] = false;
      else if (!(k in b)) b[k] = spec.default ?? "";
    }
    if (usable) out.push(b);
    if (!Object.values(params).some((s) => s.inferredFrom === "uid lookup" || s.pattern === "^hu:")) break; // one binding suffices
  }
  return out;
}

const env = loadEnv();
const cfg = targetConfig(env);
const host = assertDisposableTarget(cfg, env);
const driver = openDriver(cfg);
const results = [];
const started = new Date().toISOString();
const optionalNames = new Set(release.ddl.manifest.statements.filter((st) => st.file === "ddl/optional.cypher").map((st) => st.name));
let presentIndexes = new Set();
{
  const s0 = driver.session({ database: cfg.database, defaultAccessMode: neo4j.session.READ });
  presentIndexes = new Set((await s0.run("SHOW INDEXES YIELD name RETURN name")).records.map((r) => r.get("name")));
  await s0.close();
}
try {
  for (const t of templates) {
    const r = { id: t.id, module: t.module, questionIds: t.questionIds, explain: null, executions: 0, rowsMax: 0, nonEmptyBindings: 0, errors: [] };
    const bs = bindings(t);
    for (const b of bs) if (/$($label)/.test(t.statement) && !b.label) b.label = "Entity";
    const s = driver.session({ database: cfg.database, defaultAccessMode: neo4j.session.READ });
    try {
      const missingOptional = (t.requiredIndexes ?? []).filter((n) => !presentIndexes.has(n) && optionalNames.has(n));
      if (missingOptional.length) {
        r.explain = "skipped";
        r.skipped = `capability disabled: optional index ${missingOptional.join(", ")} not installed (ddl/optional.cypher; OD-44)`;
        results.push(r);
        continue;
      }
      try {
        await s.executeRead((tx) => tx.run(`EXPLAIN ${t.statement}`, bs[0] ?? {}), { timeout: 15000 });
        r.explain = "ok";
      } catch (e) {
        r.explain = "failed";
        r.errors.push({ phase: "explain", code: e.code ?? null, message: String(e.message).slice(0, 240) });
      }
      if (r.explain === "ok")
        for (const b of bs) {
          try {
            const res = await s.executeRead((tx) => tx.run(t.statement, b), { timeout: t.limits?.timeoutMs ?? 15000 });
            r.executions++;
            r.rowsMax = Math.max(r.rowsMax, res.records.length);
            if (res.records.length) r.nonEmptyBindings++;
          } catch (e) {
            r.errors.push({ phase: "execute", code: e.code ?? null, message: String(e.message).slice(0, 240) });
          }
        }
    } finally {
      await s.close();
    }
    results.push(r);
  }
} finally {
  await driver.close();
}
const summary = {
  templates: results.length,
  explainOk: results.filter((r) => r.explain === "ok").length,
  skippedCapability: results.filter((r) => r.explain === "skipped").map((r) => ({ id: r.id, reason: r.skipped })),
  executedWithoutError: results.filter((r) => r.explain === "ok" && r.errors.length === 0).length,
  returnedRows: results.filter((r) => r.nonEmptyBindings > 0).length,
  failing: results.filter((r) => r.errors.length).map((r) => ({ id: r.id, errors: r.errors.slice(0, 2) })),
  rowsByModule: results.reduce((o, r) => ((o[r.module] ??= { templates: 0, returnedRows: 0 }), o[r.module].templates++, r.nonEmptyBindings && o[r.module].returnedRows++, o), {}),
};
const report = { format: "bks-catalog-replay.v1", assertions: false, note: "EXPLAIN + execution only; answers are not asserted (S4 runner pending)", release: { releaseId: release.pin?.releaseId, schemaReleaseDigest: release.schemaReleaseDigest, queryCatalogDigest: release.manifest?.identities?.queryCatalogDigest }, migrationRunId: manifest.migrationRunId, target: { host, database: cfg.database }, startedAt: started, finishedAt: new Date().toISOString(), summary, results };
const outFile = path.resolve(args.out ?? path.join(planDir, "runs", `catalog-replay-${host}-${cfg.uri.split(":").pop()}.json`));
fs.mkdirSync(path.dirname(outFile), { recursive: true });
writeJson(outFile, report);
console.log(JSON.stringify({ ...summary, failing: summary.failing.slice(0, 10), report: path.relative(REPO_ROOT, outFile) }, null, 2));
