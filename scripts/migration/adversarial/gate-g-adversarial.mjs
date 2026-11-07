#!/usr/bin/env node
// Gate G adversarial checks against the integrated stack (executor + consumer GraphQL) on a migrated DISPOSABLE shadow.
//
//   Preconditions (run by the operator, one container): fresh local Enterprise shadow restored from the custody export,
//   `apply-release-ddl.mjs --phase pre`, `apply-migration.mjs --mode apply` (v2.0.2), then
//   `scripts/ops/aura-principals.mjs --apply --allow-local --out <dir>/principals-custody.json`.
//
//   node scripts/migration/adversarial/gate-g-adversarial.mjs --dir <custody dir> [--uri bolt://127.0.0.1:7703]
//
// The executor runs as bks_writer_svc with read bindings bks_reader_public_svc / bks_reader_internal_svc
// (database-role, database-rbac); GraphQL runs in production mode as bks_reader_public_svc. Principal passwords are
// read from the custody file and never printed. Admin (neo4j) is used only to inspect, tamper and restore the marker.
// Every probe that writes is aimed at the synthetic label AdvProbe; nothing legacy is touched.
import { createHash, generateKeyPairSync, randomBytes, randomUUID } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(here, "..", "..", "..");
const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const DIR = resolve(arg("--dir"));
const URI = arg("--uri", "bolt://127.0.0.1:7703");
const ONLY = arg("--only", null);
// --gql-principal reader (default: bks_reader_public_svc) | admin (neo4j, the fallback a misconfigured deployment would use)
const GQL_PRINCIPAL = arg("--gql-principal", "reader");
const ADMIN_PW = process.env.BKS_RESTORE_PASSWORD ?? "bks-test-password";
const host = new URL(URI.replace(/^(bolt|neo4j)(\+s|\+ssc)?:/, "http:")).hostname;
if (!["127.0.0.1", "localhost", "::1"].includes(host)) throw new Error(`refusing non-local target ${URI}`);
const imp = (p) => import(pathToFileURL(resolve(REPO, p)).href);
const requireKg = createRequire(resolve(REPO, "packages/kg-ops/package.json"));
const neo4j = requireKg("neo4j-driver");
const kg = await imp("packages/kg-ops/dist/index.js");
const fx = await imp("packages/kg-ops/dist/write/fixtures-v2.js");
const requireGql = createRequire(resolve(REPO, "apps/graphql-api/package.json"));
const { SignJWT } = await import(pathToFileURL(requireGql.resolve("jose")).href);
const gqlServer = await imp("apps/graphql-api/dist/server.js");
const gqlActor = await imp("apps/graphql-api/dist/actor.js");
const PLAN_DIR = resolve(REPO, "runs/release-v2/custody/backups/20261011T224403Z-aura-neo4j/plans/mig-0b2e97d4b8e0");
const EXPORT_DIR = resolve(REPO, "runs/release-v2/custody/backups/20261011T224403Z-aura-neo4j");
const plan = JSON.parse(readFileSync(resolve(PLAN_DIR, "migration-manifest.json"), "utf8"));
const MIG_RUN = plan.migrationRunId;
const secrets = JSON.parse(readFileSync(resolve(DIR, "principals-custody.json"), "utf8")).secrets;

const schema = kg.writeSchema();
const REL = schema.schemaReleaseDigest;
const stamp = `adv${Date.now().toString(36)}`;
const rows = [];
const started = new Date().toISOString();
const log = (m) => console.log(`[gate-g-adv] ${m}`);
const want = (area) => !ONLY || ONLY.split(",").includes(area);
function record(id, area, scenario, expect, observed, pass) {
  rows.push({ id, area, scenario, expect, observed, pass: Boolean(pass), at: new Date().toISOString() });
  log(`${pass ? "PASS" : "FAIL"} ${id} ${scenario} -> ${JSON.stringify(observed).slice(0, 260)}`);
}
const sha = (t) => createHash("sha256").update(t).digest("hex");

// ---------------------------------------------------------------------------------------------------------- graph
const admin = neo4j.driver(URI, neo4j.auth.basic("neo4j", ADMIN_PW));
const plain = (v) => {
  if (neo4j.isInt(v)) return v.toNumber();
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === "object" && v.constructor === Object) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
  return v;
};
async function q(cypher, params = {}, driver = admin, mode = "WRITE") {
  const s = driver.session({ database: "neo4j", defaultAccessMode: mode === "READ" ? neo4j.session.READ : neo4j.session.WRITE });
  try { return (await s.run(cypher, params)).records.map((r) => plain(r.toObject())); } finally { await s.close(); }
}
const one = async (c, p) => (await q(c, p))[0];
async function tryAs(user, cypher, mode = "WRITE", database = "neo4j") {
  const d = neo4j.driver(URI, neo4j.auth.basic(user, secrets[user]));
  const s = d.session({ database, defaultAccessMode: mode === "READ" ? neo4j.session.READ : neo4j.session.WRITE });
  try { const r = (await s.run(cypher)).records.map((x) => plain(x.toObject())); return { ok: true, rows: r }; }
  catch (e) { return { ok: false, code: e.code ?? null, message: String(e.message).slice(0, 200) }; }
  finally { await s.close(); await d.close(); }
}
const denied = (r) => !r.ok && /Forbidden|Security|permission|denied|not allowed|Unauthorized|AccessMode/i.test(`${r.code} ${r.message}`);
const fence = () => one("MATCH (f:KsWriteFence {id:'canonical'}) RETURN f.graphRevision AS rev, f.lastWriterRunId AS last");
const probeCount = async () => (await one("OPTIONAL MATCH (n:AdvProbe) WITH count(n) AS a OPTIONAL MATCH ()-[r:ADV_PROBE]->() WITH a, count(r) AS b OPTIONAL MATCH (p) WHERE p.adv IS NOT NULL WITH a, b, count(p) AS d OPTIONAL MATCH (x:Product) WHERE x.uid STARTS WITH 'hu:product:adv-probe' WITH a, b, d, count(x) AS e RETURN a + b + d + e AS c")).c;

// ------------------------------------------------------------------------------------------------- executor setup
const scope = { installationId: "adv-installation", applicationId: "biotech", tenantId: "adv-tenant" };
const other = { installationId: "adv-installation", applicationId: "biotech", tenantId: "adv-other-tenant" };
const tok = () => randomBytes(24).toString("hex");
const T = { writer: tok(), writer2: tok(), reader: tok(), readerInt: tok(), admin: tok() };
const tokenEntries = [
  { tokenSha256: sha(T.writer), role: "writer", principalId: "adv-writer", ...scope, grants: [] },
  { tokenSha256: sha(T.writer2), role: "writer", principalId: "adv-writer-other", ...other, grants: [] },
  { tokenSha256: sha(T.reader), role: "reader", principalId: "adv-reader", ...scope, grants: [] },
  { tokenSha256: sha(T.readerInt), role: "reader", principalId: "adv-reader-internal", ...scope, grants: ["read.internal"] },
  { tokenSha256: sha(T.admin), role: "admin", principalId: "adv-ops", ...scope, grants: [] },
];
const runDir = resolve(DIR, `executor-${stamp}`);
for (const d of ["custody", "admission"]) mkdirSync(resolve(runDir, d), { recursive: true });
const admissionKey = kg.generateWitnessKeyPair("adv-admission");
const verifierKey = kg.generateWitnessKeyPair("adv-verifier");
const grantRef = `grant-adv-${stamp}`;
const grantRefOther = `grant-adv-other-${stamp}`;
const grantsPath = resolve(runDir, "grants.json");
writeFileSync(grantsPath, JSON.stringify({ format: "bks-grant-registry.v1", decisionVersion: "adv/gate-g", grants: [
  { grantRef, ...scope, principalId: "adv-writer", operations: ["knowledge.ingestion_apply"], effectKeyPrefix: "adv/" },
  { grantRef: grantRefOther, ...other, principalId: "adv-writer-other", operations: ["knowledge.ingestion_apply"], effectKeyPrefix: "adv/" },
] }, null, 2));
const statePath = resolve(runDir, "verification-state.json");
writeFileSync(statePath, JSON.stringify({ format: "ks-verification-state.v1", results: [] }));
const PORT = Number(arg("--port", "4131"));
const exEnv = {
  PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, TEMP: process.env.TEMP, TMP: process.env.TMP,
  BKS_BIOTECH_GRAPH_URI: URI, BKS_BIOTECH_GRAPH_USERNAME: "bks_writer_svc", BKS_BIOTECH_GRAPH_PASSWORD: secrets.bks_writer_svc, BKS_BIOTECH_GRAPH_DATABASE: "neo4j",
  BKS_BIOTECH_GRAPH_READER_PUBLIC_USERNAME: "bks_reader_public_svc", BKS_BIOTECH_GRAPH_READER_PUBLIC_PASSWORD: secrets.bks_reader_public_svc,
  BKS_BIOTECH_GRAPH_READER_INTERNAL_USERNAME: "bks_reader_internal_svc", BKS_BIOTECH_GRAPH_READER_INTERNAL_PASSWORD: secrets.bks_reader_internal_svc,
  BKS_READ_BINDINGS: JSON.stringify([
    { ref: "public", scope: "public", uriEnv: "BKS_BIOTECH_GRAPH_URI", userEnv: "BKS_BIOTECH_GRAPH_READER_PUBLIC_USERNAME", passwordEnv: "BKS_BIOTECH_GRAPH_READER_PUBLIC_PASSWORD", readAuthority: "database-role", visibility: "database-rbac" },
    { ref: "internal", scope: "internal", uriEnv: "BKS_BIOTECH_GRAPH_URI", userEnv: "BKS_BIOTECH_GRAPH_READER_INTERNAL_USERNAME", passwordEnv: "BKS_BIOTECH_GRAPH_READER_INTERNAL_PASSWORD", readAuthority: "database-role", visibility: "database-rbac" },
  ]),
  EXECUTOR_PORT: String(PORT),
  BKS_EXECUTOR_TOKENS: JSON.stringify(tokenEntries),
  BKS_WITNESS_ISSUER_KEYS: `${admissionKey.kid}:${admissionKey.publicKeyDer}`,
  BKS_WITNESS_SIGNING_KEY: `${admissionKey.kid}:${admissionKey.privateKeyDer}`,
  BKS_WITNESS_ISSUER: "bks-admission-adv",
  BKS_ADMISSION_ENABLED: "1",
  BKS_ADMISSION_GRANT_SOURCE: `file:${grantsPath}`,
  BKS_ADMISSION_LEDGER: resolve(runDir, "admission", "ledger.json"),
  BKS_ADMISSION_LEDGER_CREATE: "1",
  BKS_ADMISSION_VERIFICATION_STATE: `file:${statePath}`,
  BKS_VERIFIER_ISSUER_KEYS: `${verifierKey.kid}:${verifierKey.publicKeyDer}`,
  BKS_RELEASE_RUNS_DIR: resolve(runDir, "custody"),
  BKS_DISABLE_READ_V1: "1",
  BKS_READ_V1_RETIRED: "1",
};
const execLogChunks = [];
const child = spawn(process.execPath, [resolve(REPO, "apps/executor/dist/index.js")], { cwd: runDir, env: exEnv, stdio: ["ignore", "pipe", "pipe"] });
child.stdout.on("data", (d) => execLogChunks.push(String(d)));
child.stderr.on("data", (d) => execLogChunks.push(String(d)));
process.on("exit", () => { try { child.kill(); } catch { /* gone */ } });
const EX = `http://127.0.0.1:${PORT}`;
for (let i = 0; ; i++) {
  try { if ((await fetch(`${EX}/healthz`)).ok) break; } catch { /* starting */ }
  if (i > 120) throw new Error(`executor did not start: ${execLogChunks.join("").slice(-1500)}`);
  await new Promise((r) => setTimeout(r, 500));
}
async function ex(method, path, body, token = T.writer) {
  const res = await fetch(`${EX}${path}`, { method, headers: { "content-type": "application/json", ...(token ? { "x-api-key": token } : {}) }, ...(body !== undefined ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {}) });
  let json = null;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, body: json };
}
const reasonCodes = (b) => [...new Set([...(b?.reasons ?? []), ...(b?.parts ?? []).flatMap((p) => p.reasons ?? [])].map((x) => x.code))];
const codeOf = (r) => r.body?.code ?? r.body?.failure?.code ?? r.body?.error?.code ?? reasonCodes(r.body)[0] ?? null;
const rowsOf = (b) => (b?.parts ?? []).flatMap((p) => p.rows ?? []);
log(`executor up at ${EX}`);

// ---------------------------------------------------------------------------------------------- data selection
const pub = await one("MATCH (n)-[:MIGRATED_FROM]->(l:LegacyV0) WHERE n.privacyClass = 'PUBLIC' AND n.uid IS NOT NULL AND n.name IS NOT NULL AND (n:Product OR n:Organization OR n:Brand OR n:Entity) RETURN n.uid AS uid, n.name AS name, labels(n) AS labels, labels(l) AS legacyLabels ORDER BY n.uid LIMIT 1");
const internalSource = await one("MATCH (s:Source) WHERE s.privacyClass = 'INTERNAL' RETURN s.uid AS uid LIMIT 1");
const counts = await one("MATCH (n) WITH count(n) AS nodes MATCH ()-[r]->() RETURN nodes, count(r) AS rels");
const legacyCount = (await one("MATCH (n:LegacyV0) RETURN count(n) AS c")).c;
const migratedFrom = (await one("MATCH ()-[r:MIGRATED_FROM]->() RETURN count(r) AS c")).c;
const sourceCount = (await one("MATCH (s:Source) RETURN count(s) AS c")).c;
const intentMarkers = (await one("MATCH (m:KsIntentMarker) RETURN count(m) AS c")).c;
const fence0 = await fence();
log(`graph ${JSON.stringify(counts)}, legacy ${legacyCount}, MIGRATED_FROM ${migratedFrom}, Source ${sourceCount}, markers ${intentMarkers}, fence ${JSON.stringify(fence0)}; public sample ${pub?.labels} ${pub?.uid}`);

let n = 0;
const cy = (statement, extra = {}) => ({ schemaVersion: "biotech-cypher-read-intent.v1", intentId: `adv-${stamp}-${n++}`, pins: { schemaReleaseDigest: REL }, purpose: "Gate G adversarial probe", bindingRef: "public", statement, ...extra });
const typed = (ops, extra = {}) => ({ schemaVersion: "biotech-knowledge-read-intent.v2", intentId: `adv-${stamp}-${n++}`, pins: { schemaReleaseDigest: REL }, purpose: "Gate G adversarial typed read", operations: ops, ...extra });
const notServed = (r) => r.status >= 400 || (r.body?.status && !["ok", "empty", "truncated"].includes(r.body.status));

// ------------------------------------------------------------------------------------------ 1. read authority
if (want("read")) {
  const describe = await ex("GET", "/describe", undefined, T.reader);
  const cypherCap = describe.body?.capabilities?.["read.cypher"];
  record("R0", "read authority", "read.cypher is advertised only over database-role bindings that refused a probe write", "read.cypher available over public + internal (database-role)", { available: Boolean(cypherCap?.available), bindings: cypherCap?.bindings ?? null }, cypherCap?.available && (cypherCap.bindings ?? []).length === 2);
  const writeProbes = [
    ["R1", "plain CREATE", "MATCH (p:Product) CREATE (:AdvProbe {k: 1}) RETURN p.uid AS uid"],
    ["R2", "FOREACH write", "MATCH (p:Product) FOREACH (x IN [1] | CREATE (:AdvProbe {k: 2})) RETURN p.uid AS uid"],
    ["R3", "CALL {} write subquery", "CALL { CREATE (:AdvProbe {k: 3}) } RETURN 1 AS x"],
    ["R4", "CALL {} IN TRANSACTIONS", "UNWIND [1] AS x CALL { WITH x CREATE (:AdvProbe {k: x}) } IN TRANSACTIONS RETURN x"],
    ["R5", "LOAD CSV", "LOAD CSV FROM 'file:///etc/passwd' AS r RETURN r[0] AS x"],
    ["R6", "apoc.export procedure", "CALL apoc.export.json.all('adv.json', {}) YIELD file RETURN file"],
    ["R7", "dbms.* procedure", "CALL dbms.listConfig() YIELD name RETURN name"],
    ["R8", "db.create* procedure", "CALL db.createLabel('AdvProbe')"],
    ["R9", "second statement after ;", "MATCH (p:Product) RETURN p.uid AS uid; CREATE (:AdvProbe {k: 9})"],
    ["R10", "write in a UNION branch", "MATCH (p:Product) RETURN p.uid AS uid UNION ALL MATCH (p:Product) SET p.adv = 1 RETURN p.uid AS uid"],
    ["R11", "write after a line comment", "MATCH (p:Product) // harmless\nCREATE (:AdvProbe {k: 11}) RETURN p.uid AS uid"],
    ["R12", "write after a block comment and a unicode line separator", "MATCH (p:Product) /* RETURN */ MERGE (p)-[:ADV_PROBE]->(p) RETURN p.uid AS uid"],
    ["R13", "DETACH DELETE", "MATCH (p:AdvProbe) DETACH DELETE p RETURN 1 AS x"],
    ["R14", "apoc.cypher.doIt", "MATCH (p:Product) CALL apoc.cypher.doIt('CREATE (:AdvProbe)', {}) YIELD value RETURN 1 AS x"],
    ["R15", "whole-entity return", "MATCH (p:Product) RETURN p"],
    ["R16", "unlabelled full scan", "MATCH (n) RETURN count(n) AS c"],
    ["R17", "fullwidth-letter keyword (unicode confusable)", "MATCH (p:Product) ＣＲＥＡＴＥ (:AdvProbe) RETURN p.uid AS uid"],
  ];
  for (const [id, name, stmt] of writeProbes) {
    const r = await ex("POST", "/kg/read/cypher", cy(stmt), T.reader);
    record(id, "read authority", `${name} through /kg/read/cypher`, "refused (typed reason), no effect", { http: r.status, status: r.body?.status ?? null, reasons: reasonCodes(r.body), code: r.body?.code ?? null }, notServed(r));
  }
  {
    const r = await ex("POST", "/kg/read/cypher", cy("MATCH (p:Product) WHERE p.uid = $u RETURN p.uid AS uid", { parameters: { u: "x'}) CREATE (:AdvProbe) //" }, parameterSchema: { u: { type: "string" } } }), T.reader);
    record("R18", "read authority", "parameter-injection value is bound as data", "status ok or empty, no effect", { http: r.status, status: r.body?.status ?? null, reasons: reasonCodes(r.body) }, ["ok", "empty"].includes(r.body?.status));
  }
  const bp = [
    ["R19", "bks_reader_public_svc", "CREATE (:AdvProbe {k: 19})", "WRITE"],
    ["R20", "bks_reader_internal_svc", "CREATE (:AdvProbe {k: 20})", "WRITE"],
    ["R21", "bks_reader_public_svc", "MATCH (p:Product) SET p.adv = 21", "WRITE"],
    ["R21b", "bks_reader_public_svc", "CREATE (:Product {uid: 'hu:product:adv-probe-21b'})", "WRITE"],
    ["R21c", "bks_reader_internal_svc", "MATCH (p:Product) WITH p LIMIT 1 SET p.name = p.name", "WRITE"],
    ["R21d", "bks_reader_public_svc", "MATCH (p:Product) WITH p LIMIT 1 DETACH DELETE p", "WRITE"],
    ["R22", "bks_reader_public_svc", "CALL dbms.listConfig() YIELD name RETURN name LIMIT 1", "READ"],
    ["R23", "bks_reader_public_svc", "LOAD CSV FROM 'file:///etc/hosts' AS r RETURN r LIMIT 1", "READ"],
    ["R24", "bks_writer_svc", "CREATE INDEX adv_probe_idx IF NOT EXISTS FOR (n:AdvProbe) ON (n.k)", "WRITE"],
  ];
  for (const [id, user, stmt, mode] of bp) {
    const r = await tryAs(user, stmt, mode);
    record(id, "read authority", `parser bypassed: ${user} runs \`${stmt.slice(0, 70)}\``, "denied by the database principal", r.ok ? { ok: true } : r, denied(r));
  }
  for (const [id, user, stmt] of [
    ["R25", "bks_writer_svc", "CREATE USER adv_probe_user IF NOT EXISTS SET PASSWORD 'adv-probe-password-1' CHANGE NOT REQUIRED"],
    ["R26", "bks_migrator_svc", "GRANT ROLE admin TO bks_migrator_svc"],
    ["R27", "bks_migrator_svc", "CREATE USER adv_probe_user2 IF NOT EXISTS SET PASSWORD 'adv-probe-password-2' CHANGE NOT REQUIRED"],
  ]) {
    const r = await tryAs(user, stmt, "WRITE", "system");
    record(id, "read authority", `${user} attempts user/role management`, "denied", r.ok ? { ok: true } : r, denied(r));
  }
  const probes1 = await probeCount();
  const counts1 = await one("MATCH (n) WITH count(n) AS nodes MATCH ()-[r]->() RETURN nodes, count(r) AS rels");
  const fence1 = await fence();
  const s = admin.session({ database: "system" });
  const advUsers = (await s.run("SHOW USERS YIELD user WHERE user STARTS WITH 'adv_probe' RETURN count(*) AS c")).records[0].get("c").toNumber();
  const migRoles = (await s.run("SHOW USERS YIELD user, roles WHERE user = 'bks_migrator_svc' RETURN roles")).records[0].get("roles");
  await s.close();
  const advIdx = (await one("SHOW INDEXES YIELD name WHERE name = 'adv_probe_idx' RETURN count(*) AS c")).c;
  record("R28", "read authority", "zero effects after every read-authority probe", "0 AdvProbe nodes/edges/properties; fence unchanged; no probe users, index or role grant", { probes: probes1, graph: [counts, counts1], fenceBefore: fence0, fenceAfter: fence1, advUsers, advIdx, migratorRoles: migRoles }, probes1 === 0 && counts1.nodes === counts.nodes && counts1.rels === counts.rels && fence1.rev === fence0.rev && advUsers === 0 && advIdx === 0 && !migRoles.includes("admin"));
}

// ------------------------------------------------------------------------------------------------ 2. visibility
if (want("visibility")) {
  {
    const r = await ex("POST", "/kg/read/cypher", cy("MATCH (s:Source) RETURN count(s) AS c"), T.reader);
    const c = rowsOf(r.body)[0]?.c;
    record("V1", "visibility", "INTERNAL migrated Source nodes counted through the public binding", `count 0 (admin sees ${sourceCount}) or refused`, { http: r.status, status: r.body?.status ?? null, rows: rowsOf(r.body), reasons: reasonCodes(r.body) }, sourceCount > 0 && (c === 0 || notServed(r)));
  }
  for (const [id, stmt, what] of [["V2", "MATCH (n:LegacyV0) RETURN count(n) AS c", "LegacyV0 label"], ["V3", "MATCH ()-[r:MIGRATED_FROM]->() RETURN count(r) AS c", "MIGRATED_FROM"], ["V4", "MATCH (f:KsWriteFence) RETURN f.graphRevision AS c", "KsWriteFence"], ["V5", "MATCH (m:KsIntentMarker) RETURN count(m) AS c", "KsIntentMarker"]]) {
    for (const binding of ["public", "internal"]) {
      const r = await ex("POST", "/kg/read/cypher", cy(stmt, { bindingRef: binding }), binding === "internal" ? T.readerInt : T.reader);
      const vals = rowsOf(r.body).map((x) => x.c ?? null);
      record(`${id}-${binding}`, "visibility", `${what} through /kg/read/cypher (${binding} binding)`, "refused, or nothing visible", { http: r.status, status: r.body?.status ?? null, values: vals, reasons: reasonCodes(r.body) }, notServed(r) || vals.every((v) => v === 0 || v === null));
    }
  }
  for (const user of ["bks_reader_public_svc", "bks_reader_internal_svc"]) {
    const r = await tryAs(user, "OPTIONAL MATCH (n:LegacyV0) WITH count(n) AS a OPTIONAL MATCH ()-[m:MIGRATED_FROM]->() WITH a, count(m) AS b OPTIONAL MATCH (k:KsIntentMarker) RETURN a, b, count(k) AS c", "READ");
    const v = r.rows?.[0];
    record(`V6-${user.replace(/^bks_|_svc$/g, "")}`, "visibility", `parser bypassed: ${user} counts LegacyV0 / MIGRATED_FROM / KsIntentMarker`, `0 / 0 / 0 (admin sees ${legacyCount} / ${migratedFrom} / ${intentMarkers})`, r.ok ? v : r, r.ok && v.a === 0 && v.b === 0 && v.c === 0);
  }
  {
    const r = await tryAs("bks_reader_public_svc", "MATCH (s:Source) RETURN count(s) AS c", "READ");
    record("V7", "visibility", "parser bypassed: public reader counts INTERNAL Source nodes", "0", r.ok ? r.rows[0] : r, r.ok && r.rows[0].c === 0);
  }
  if (internalSource) {
    const r = await ex("POST", "/kg/read", typed([{ opId: "c1", op: "card", uid: internalSource.uid }]), T.reader);
    record("V8", "visibility", "typed card of an INTERNAL migrated Source as a public reader", "no record returned", { http: r.status, status: r.body?.status ?? null, rows: rowsOf(r.body).length, reasons: reasonCodes(r.body) }, rowsOf(r.body).length === 0);
  }
  {
    const r = await ex("POST", "/kg/read", typed([{ opId: "c1", op: "card", uid: internalSource?.uid ?? "hu:source:none" }], { bindingRef: "internal" }), T.reader);
    record("V9", "visibility", "reader without read.internal asks for the internal binding", "forbidden / VISIBILITY_DENIED", { http: r.status, status: r.body?.status ?? null, code: codeOf(r) }, r.status === 403 || r.body?.status === "forbidden" || /VISIBILITY/.test(String(codeOf(r))));
  }
  if (pub) {
    const r = await ex("POST", "/kg/read", typed([{ opId: "r1", op: "resolve", mentions: [{ mentionId: "m1", name: pub.name }] }]), T.reader);
    const text = JSON.stringify(r.body ?? {});
    const uids = [...new Set(text.match(/hu:[a-z-]+:[A-Za-z0-9._:-]+/g) ?? [])];
    const legacyHits = uids.length ? (await one("MATCH (n:LegacyV0) WHERE n.uid IN $u RETURN count(n) AS c", { u: uids })).c : 0;
    const leaks = /LegacyV0|MIGRATED_FROM|KsIntentMarker|KsWriteFence/.test(text);
    record("V10", "visibility", "resolving a name carried over from legacy data", "the v2 node only; no LegacyV0 / MIGRATED_FROM / Ks names", { http: r.status, status: r.body?.status ?? null, uids: uids.slice(0, 5), expected: pub.uid, legacyHits, leaks }, r.status === 200 && legacyHits === 0 && !leaks && uids.includes(pub.uid));
  }
}

// ---------------------------------------------------------------------------------------------------- 3. bounds
if (want("bounds")) {
  {
    const r = await ex("POST", "/kg/read/cypher", cy("MATCH (p:Product) UNWIND range(1, 1000) AS x RETURN p.uid AS uid, x AS x", { limits: { rowCap: 20 } }), T.reader);
    record("L1", "bounds", "fan-out beyond rowCap", "truncated with ROW_CAP, never ok", { http: r.status, status: r.body?.status ?? null, rows: rowsOf(r.body).length, reasons: reasonCodes(r.body) }, r.body?.status === "truncated" && reasonCodes(r.body).includes("ROW_CAP"));
  }
  {
    const r = await ex("POST", "/kg/read/cypher", cy("MATCH (p:Product) UNWIND range(1, 2000) AS x RETURN p.uid AS uid, x AS x, reduce(s = '', i IN range(1, 60) | s + 'xxxxxxxxxx') AS big", { limits: { byteCap: 2048, rowCap: 2000 } }), T.reader);
    record("L2", "bounds", "oversized output beyond byteCap", "truncated with BYTE_CAP, never ok", { http: r.status, status: r.body?.status ?? null, rows: rowsOf(r.body).length, reasons: reasonCodes(r.body) }, r.body?.status === "truncated" && reasonCodes(r.body).includes("BYTE_CAP"));
  }
  {
    const r = await ex("POST", "/kg/read/cypher", cy("MATCH (p:Product) UNWIND range(1, 50000000) AS x WITH x WHERE x % 7 = 99 RETURN count(x) AS c", { limits: { timeoutMs: 100 } }), T.reader);
    record("L3", "bounds", "long scan with timeoutMs 100", "failed with TIMEOUT, no partial answer", { http: r.status, status: r.body?.status ?? null, rows: rowsOf(r.body), reasons: reasonCodes(r.body) }, r.body?.status !== "ok" && rowsOf(r.body).length === 0 && (reasonCodes(r.body).includes("TIMEOUT") || r.status === 504));
  }
  {
    const r = await ex("POST", "/kg/read", typed([{ opId: "l1", op: "list", nodeType: "Product", limit: 5000 }]), T.reader);
    record("L4", "bounds", "typed list above the contract ceiling", "400 BKS_PARSE_REJECTED", { http: r.status, code: codeOf(r) }, r.status === 400);
  }
}

// ---------------------------------------------------------------------------------------------- 4. writes
const planOf = async (intent, token = T.writer) => ex("POST", "/kg/plan", intent, token);
const witnessFor = async (p, effectKey, extra = {}, token = T.writer, g = grantRef) => ex("POST", "/kg/admission/witness", { planRef: p.planRef, effectKey, partialPolicy: "all", grantRef: g, ...extra }, token);
const applyBody = (p, effectKey, witness) => ({ schemaVersion: "biotech-knowledge-apply.v2", planRef: p.planRef, expectedPlanDigest: p.planDigest, intentDigest: p.plan.binding.intentDigest, effectKey, partialPolicy: "all", witness });
const markers = async (k) => (await one("MATCH (m:KsIntentMarker) WHERE m.effectKey = $k RETURN count(m) AS c", { k })).c;
const failedOutcome = (r) => r.status >= 400 || ["failed", "rejected"].includes(r.body?.outcome);
if (want("writes")) {
  const pA = (await planOf(fx.smallIntent(REL, stamp, "a"))).body;
  record("W0a", "writes", "plan a small synthetic intent on the migrated graph", "applicable", { outcome: pA?.outcome ?? null, code: pA?.code ?? null }, pA?.outcome === "applicable");
  const kA = `adv/${stamp}/a`;
  const wA = (await witnessFor(pA, kA)).body;
  const fBeforeA = await fence();
  const rA = await ex("POST", "/kg/apply", applyBody(pA, kA, wA.witness));
  const fAfterA = await fence();
  record("W0b", "writes", "admitted apply", "applied; graphRevision +1", { http: rA.status, outcome: rA.body?.outcome ?? null, code: codeOf(rA), rev: [fBeforeA.rev, fAfterA.rev] }, rA.body?.outcome === "applied" && fAfterA.rev === fBeforeA.rev + 1);
  {
    const r = await ex("POST", "/kg/apply", applyBody(pA, kA, wA.witness));
    const f = await fence();
    const m = await markers(kA);
    record("W1", "writes", "duplicate apply (same effectKey, same plan)", "recorded receipt, no second effect", { http: r.status, outcome: r.body?.outcome ?? null, rev: f.rev, markers: m }, ["duplicate", "applied"].includes(r.body?.outcome) && f.rev === fAfterA.rev && m === 1);
  }
  const pB = (await planOf(fx.smallIntent(REL, stamp, "b"))).body;
  {
    const w = await witnessFor(pB, kA);
    let r = w;
    if (w.status === 200) r = await ex("POST", "/kg/apply", applyBody(pB, kA, w.body.witness));
    const f = await fence();
    record("W2", "writes", "changed payload under an already applied effectKey", "refused (effect conflict), no effect", { witnessHttp: w.status, witnessCode: codeOf(w), http: r.status, outcome: r.body?.outcome ?? null, code: codeOf(r), rev: f.rev }, f.rev === fAfterA.rev && failedOutcome(r) && r.body?.outcome !== "applied");
  }
  const kB = `adv/${stamp}/b`;
  const wB = (await witnessFor(pB, kB)).body;
  for (const [id, name, mutate] of [
    ["W3", "forged expectedPlanDigest", (b) => ({ ...b, expectedPlanDigest: `sha256:${"0".repeat(64)}` })],
    ["W4", "forged intentDigest", (b) => ({ ...b, intentDigest: `sha256:${"1".repeat(64)}` })],
    ["W5", "witness of plan B presented for plan A", () => applyBody(pA, kB, wB.witness)],
    ["W6", "tampered witness signature", (b) => ({ ...b, witness: { ...b.witness, signature: (b.witness.signature[0] === "A" ? "B" : "A") + b.witness.signature.slice(1) } })],
    ["W7", "statements smuggled into the apply request", (b) => ({ ...b, statements: [{ cypher: "CREATE (:AdvProbe)" }] })],
  ]) {
    const r = await ex("POST", "/kg/apply", mutate(applyBody(pB, kB, wB.witness)));
    const f = await fence();
    const m = await markers(kB);
    record(id, "writes", name, "refused, no marker, no effect", { http: r.status, outcome: r.body?.outcome ?? null, code: codeOf(r), rev: f.rev, markers: m }, failedOutcome(r) && f.rev === fAfterA.rev && m === 0);
  }
  {
    const kE = `adv/${stamp}/expired`;
    const pE = (await planOf(fx.smallIntent(REL, stamp, "e"))).body;
    const w = (await witnessFor(pE, kE, { lifetimeSeconds: 1 })).body;
    await new Promise((r) => setTimeout(r, 2500));
    const r = await ex("POST", "/kg/apply", applyBody(pE, kE, w.witness));
    const m = await markers(kE);
    record("W8", "writes", "expired witness (1 s lease presented after 2.5 s)", "BKS_WITNESS_EXPIRED, no effect", { http: r.status, outcome: r.body?.outcome ?? null, code: codeOf(r), markers: m }, codeOf(r) === "BKS_WITNESS_EXPIRED" && m === 0);
  }
  {
    const kR = `adv/${stamp}/revoked`;
    const pR = (await planOf(fx.smallIntent(REL, stamp, "r"))).body;
    const w = (await witnessFor(pR, kR)).body;
    const rv = await ex("POST", "/kg/admission/revocations", { kind: "effect", target: kR, reason: "Gate G adversarial revocation" }, T.admin);
    const dl = await ex("POST", "/kg/admission/deliver", undefined, T.admin);
    const r = await ex("POST", "/kg/apply", applyBody(pR, kR, w.witness));
    const again = await witnessFor(pR, kR);
    const applied = (await one("MATCH (m:KsIntentMarker {effectKey: $k, status: 'applied'}) RETURN count(m) AS c", { k: kR })).c;
    record("W9", "writes", "witness issued, effect revoked and delivered, then applied", "refused (revoked); a new witness is refused", { revocation: rv.status, deliver: dl.status, http: r.status, outcome: r.body?.outcome ?? null, code: codeOf(r), reissue: [again.status, codeOf(again)], applied }, r.body?.outcome !== "applied" && applied === 0 && /REVOKED/.test(String(codeOf(r))) && again.status >= 400);
  }
  {
    const r = await planOf(fx.smallIntent(`sha256:${"2".repeat(64)}`, stamp, "x"));
    const hit = /BKS_RELEASE_MISMATCH/.test(JSON.stringify(r.body ?? {}));
    record("W10", "writes", "intent pinned to another release", "plan rejected with BKS_RELEASE_MISMATCH", { http: r.status, outcome: r.body?.outcome ?? null, releaseMismatch: hit }, r.status >= 400 && hit);
  }
  {
    const kL = `adv/${stamp}/lost`;
    const pL = (await planOf(fx.smallIntent(REL, stamp, "l"))).body;
    const w = (await witnessFor(pL, kL)).body;
    const first = await ex("POST", "/kg/apply", applyBody(pL, kL, w.witness));
    const lookup = await ex("GET", `/kg/receipt?effectKey=${encodeURIComponent(kL)}`, undefined, T.reader);
    const retry = await ex("POST", "/kg/apply", applyBody(pL, kL, w.witness));
    const foreign = await ex("GET", `/kg/receipt?effectKey=${encodeURIComponent(kL)}`, undefined, T.writer2);
    const m = await markers(kL);
    const rec = lookup.body?.receipt ?? lookup.body;
    record("W11", "writes", "lost response: receipt lookup settles the effect; the retry does not duplicate", "lookup found (applied); retry recorded; other tenant 404", { first: first.body?.outcome ?? null, lookup: [lookup.status, rec?.outcome ?? null], retry: retry.body?.outcome ?? null, foreign: foreign.status, markers: m }, lookup.status === 200 && first.body?.outcome === "applied" && ["duplicate", "applied"].includes(retry.body?.outcome) && foreign.status === 404 && m === 1);
  }
  {
    const pX = (await planOf(fx.smallIntent(REL, stamp, "t"))).body;
    const w = await witnessFor(pX, `adv/${stamp}/cross`, {}, T.writer2, grantRefOther);
    record("W12", "writes", "another tenant's writer requests a witness for this tenant's plan", "BKS_FORBIDDEN_SCOPE", { http: w.status, code: codeOf(w) }, w.status === 403);
  }
  {
    const a = await planOf(fx.smallIntent(REL, stamp, "z"), T.reader);
    const b = await planOf(fx.smallIntent(REL, stamp, "z"), null);
    const c = await planOf(fx.smallIntent(REL, stamp, "z"), "not-a-token");
    record("W13", "writes", "reader token plans; no token; unknown token", "403 / 401 / 401", [a.status, b.status, c.status], a.status === 403 && b.status === 401 && c.status === 401);
  }
  {
    const intent = fx.smallIntent(REL, stamp, "measures");
    intent.subjects.push(
      { ref: "od", mode: "new", nodeType: "OutcomeDefinition", name: `Synthetic outcome definition ${stamp}`, uidSegment: `syn-od-${stamp}`, properties: { outcomeKey: `syn-od-${stamp}`, priority: "PRIMARY", measureKind: "BIOMARKER" }, onMatch: "use_existing" },
      { ref: "bm", mode: "new", nodeType: "Biomarker", name: `Synthetic biomarker ${stamp}`, uidSegment: `syn-bm-${stamp}`, properties: { biomarkerKind: "METABOLITE" }, onMatch: "use_existing" },
    );
    const structural = JSON.parse(JSON.stringify(intent));
    structural.intentId += "-structural";
    structural.proposals.push({ proposalId: "p-measures-structural", kind: "edge.structural", relationshipType: "MEASURES", fromRef: "od", toRef: "bm" });
    const s = await planOf(structural);
    const sp = s.body?.plan?.proposals?.find((x) => x.proposalId === "p-measures-structural");
    record("W14a", "writes", "MEASURES proposed as an un-asserted structural edge (no Assertion, no assertionUid)", "never admitted (rejected / held / parse error)", { http: s.status, outcome: s.body?.outcome ?? null, disposition: sp?.disposition ?? null, code: codeOf(s), reasons: (sp?.reasons ?? []).slice(0, 2) }, s.status >= 400 || (sp && sp.disposition !== "admitted"));
    intent.proposals.push({ proposalId: "p-measures", kind: "edge.assert", relationshipType: "MEASURES", fromRef: "od", toRef: "bm", asserterRef: "org", evidence: ["l"], assertion: { validity: {} } });
    const pm = await planOf(intent);
    const km = `adv/${stamp}/measures`;
    let applied = null;
    if (pm.body?.outcome === "applicable") {
      const w = (await witnessFor(pm.body, km)).body;
      applied = (await ex("POST", "/kg/apply", applyBody(pm.body, km, w.witness))).body?.outcome ?? null;
    }
    const edges = await one("MATCH (:OutcomeDefinition)-[r:MEASURES]->(:Biomarker) WHERE coalesce(r.lastWriterRunId, '') <> $mig RETURN count(r) AS c, sum(CASE WHEN r.assertionUid IS NULL THEN 1 ELSE 0 END) AS missing", { mig: MIG_RUN });
    const graphWide = await one("MATCH ()-[r:MEASURES]->() RETURN count(r) AS c, sum(CASE WHEN r.assertionUid IS NULL THEN 1 ELSE 0 END) AS missing");
    record("W14b", "writes", "asserted MEASURES through the executor on Enterprise, where the existence constraint is release-blocked", "applied; every executor-written MEASURES edge carries assertionUid", { plan: pm.body?.outcome ?? null, applied, executorEdges: edges.c, missingAssertionUid: edges.missing, graphWideMeasures: graphWide }, applied === "applied" && edges.c >= 1 && edges.missing === 0);
  }
}

// --------------------------------------------------------------------------------------- 5. marker and readiness
const actor = generateKeyPairSync("ed25519");
const actorPem = actor.publicKey.export({ type: "spki", format: "pem" }).toString();
const SERVICE_KEY = randomBytes(24).toString("hex");
const gqlEnv = {
  NODE_ENV: "production", GRAPHQL_PROFILE: "product", PORT: "4132",
  BKS_BIOTECH_GRAPH_URI: URI, BKS_BIOTECH_GRAPH_READER_USERNAME: GQL_PRINCIPAL === "admin" ? "neo4j" : "bks_reader_public_svc", BKS_BIOTECH_GRAPH_READER_PASSWORD: GQL_PRINCIPAL === "admin" ? ADMIN_PW : secrets.bks_reader_public_svc, BKS_BIOTECH_GRAPH_DATABASE: "neo4j",
  GRAPHQL_API_KEY: SERVICE_KEY, GRAPHQL_ACTOR_PUBLIC_KEY: actorPem, GRAPHQL_READINESS_CACHE_MS: "1",
};
const gqlLog = [];
let gql = null;
if (want("marker") || want("consumer")) {
  try { gql = await gqlServer.startServer({ env: gqlEnv, port: 0, log: (m) => gqlLog.push(m) }); }
  catch (e) { record("G0", "consumer API", "production GraphQL starts as bks_reader_public_svc", "starts", { error: String(e.message).slice(0, 300) }, false); }
}
const G = gql ? `http://127.0.0.1:${gql.port}` : null;
const mint = async ({ vis = ["PUBLIC"], key = actor.privateKey, aud = "bks-graphql-api", iss = "bks-product-bff", ttl = 60, iatOffset = 0 } = {}) => {
  const now = Math.floor(Date.now() / 1000) + iatOffset;
  return new SignJWT({ vis, ctx: gqlActor.ACTOR_CONTEXT_VERSION }).setProtectedHeader({ alg: "EdDSA", typ: gqlActor.ACTOR_TOKEN_TYPE }).setIssuer(iss).setAudience(aud).setSubject("adv-user").setJti(randomUUID()).setIssuedAt(now).setExpirationTime(now + ttl).sign(key);
};
const registry = JSON.parse(readFileSync(resolve(REPO, "apps/graphql-api/operations/operations.json"), "utf8"));
const opId = (name) => registry.operations.find((o) => o.name === name).id;
async function gq(body, { token, apiKey = SERVICE_KEY } = {}) {
  const auth = token === null ? {} : { authorization: `Bearer ${token ?? (await mint())}` };
  const res = await fetch(`${G}/graphql`, { method: "POST", headers: { "content-type": "application/json", ...(apiKey ? { "x-api-key": apiKey } : {}), ...auth }, body: typeof body === "string" ? body : JSON.stringify(body) });
  let json = null;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, body: json };
}
const readyz = async () => { const r = await fetch(`${G}/readyz`); return { status: r.status, body: await r.json() }; };
const freshApply = async (label) => {
  const p = (await planOf(fx.smallIntent(REL, stamp, label))).body;
  if (!p?.planRef) return { stage: "plan", outcome: p?.outcome ?? null, code: p?.code ?? null };
  const k = `adv/${stamp}/${label}`;
  const w = await witnessFor(p, k);
  if (w.status !== 200) return { stage: "witness", http: w.status, code: codeOf(w) };
  const r = await ex("POST", "/kg/apply", applyBody(p, k, w.body.witness));
  return { stage: "apply", http: r.status, outcome: r.body?.outcome ?? null, code: codeOf(r) };
};
if (want("marker")) {
  let baseReady = false;
  if (gql) {
    let rz = await readyz();
    for (let i = 0; i < 480 && !rz.body.ready; i++) { await new Promise((r) => setTimeout(r, 500)); rz = await readyz(); }
    baseReady = rz.status === 200 && rz.body.ready;
    record("M0", "release marker", `baseline: production GraphQL /readyz on the migrated graph (principal: ${GQL_PRINCIPAL})`, "200 ready (marker matches, DDL ONLINE, warm-up done)", { status: rz.status, ready: rz.body.ready, connectivity: rz.body.checks.connectivity.ok, release: rz.body.checks.release.ok, releaseError: rz.body.checks.release.error ?? null, indexes: { ok: rz.body.checks.indexes.ok, checked: rz.body.checks.indexes.checked, missing: (rz.body.checks.indexes.missing ?? []).slice(0, 4), error: rz.body.checks.indexes.error ?? null }, warmup: rz.body.checks.warmup?.state ?? null }, baseReady);
  }
  const marker = (await one("MATCH (m:KsReleaseMarker) RETURN m {.*} AS m")).m;
  const markerProps = await q("MATCH (m:KsReleaseMarker) RETURN properties(m) AS p");
  const rawMarker = (await (async () => { const s = admin.session({ database: "neo4j" }); try { return (await s.run("MATCH (m:KsReleaseMarker) RETURN properties(m) AS p")).records[0].get("p"); } finally { await s.close(); } })());
  void markerProps;
  const rzState = async () => (gql && baseReady ? await readyz() : null);
  const ctl = await freshApply("m0");
  const writeEvaluable = ctl.outcome === "applied";
  record("M0w", "release marker", "control: a fresh admitted apply before any tamper", "applied (otherwise the write half of M1-M3 is not evaluable in this run)", ctl, writeEvaluable || ctl.code === "BKS_WITNESS_REVOKED");
  const tamper = [
    ["M1", "tampered KsReleaseMarker.schemaReleaseDigest", async () => q("MATCH (m:KsReleaseMarker {releaseId: $id}) SET m.schemaReleaseDigest = $bad", { id: marker.releaseId, bad: `sha256:${"3".repeat(64)}` }), async () => q("MATCH (m:KsReleaseMarker {releaseId: $id}) SET m.schemaReleaseDigest = $good", { id: marker.releaseId, good: marker.schemaReleaseDigest })],
    ["M2", "KsReleaseMarker deleted", async () => q("MATCH (m:KsReleaseMarker {releaseId: $id}) DELETE m", { id: marker.releaseId }), async () => { const s = admin.session({ database: "neo4j" }); try { await s.run("CREATE (m:KsReleaseMarker) SET m = $p", { p: rawMarker }); } finally { await s.close(); } }],
    ["M3", "a second, newer, foreign KsReleaseMarker next to the correct one", async () => q("CREATE (:KsReleaseMarker {releaseId: 'adv-foreign-release', schemaReleaseDigest: $d, installedAt: datetime() + duration('P1D'), migrationRunId: 'adv-foreign', ddlDigest: $dd})", { d: `sha256:${"4".repeat(64)}`, dd: marker.ddlDigest }), async () => q("MATCH (m:KsReleaseMarker {releaseId: 'adv-foreign-release'}) DELETE m")],
  ];
  for (const [id, name, doTamper, undo] of tamper) {
    await doTamper();
    const rz = await rzState();
    const ap = writeEvaluable ? await freshApply(`${id.toLowerCase()}-${GQL_PRINCIPAL}`) : null;
    await undo();
    const back = await rzState();
    if (rz) record(`${id}r`, "release marker", `${name}: consumer readiness (GraphQL as ${GQL_PRINCIPAL})`, "/readyz 503 with a release error; 200 again after restore", { readyz: [rz.status, (rz.body.checks.release.error ?? "").slice(0, 70)], restored: back.status }, rz.status === 503 && !rz.body.checks.release.ok && back.status === 200);
    if (ap) record(`${id}w`, "release marker", `${name}: executor write`, "apply refused (BKS_RELEASE_MISMATCH)", ap, ap.outcome !== "applied" && /RELEASE_MISMATCH/.test(String(ap.code)));
  }
  const restored = await q("MATCH (m:KsReleaseMarker) RETURN m.releaseId AS releaseId, m.schemaReleaseDigest AS d, m.migrationRunId AS run");
  record("M4", "release marker", "marker state restored after the tamper probes", "exactly the original marker", restored, restored.length === 1 && restored[0].d === marker.schemaReleaseDigest && restored[0].run === marker.migrationRunId);
}

// ------------------------------------------------------------------------------------------- 6. consumer API
if (want("consumer") && gql && pub) {
  const pubOk = await gq({ documentId: opId("EntityCard"), variables: { uid: pub.uid } });
  record("C0", "consumer API", "positive control: EntityCard of a migrated PUBLIC entity", "one entity", { status: pubOk.status, n: pubOk.body?.data?.entities?.length ?? null, errors: (pubOk.body?.errors ?? []).map((e) => e.extensions?.code ?? e.message?.slice(0, 80)) }, pubOk.status === 200 && pubOk.body?.data?.entities?.length === 1);
  if (internalSource) {
    const a = await gq({ documentId: opId("EntityCard"), variables: { uid: internalSource.uid } });
    const b = await gq({ documentId: opId("EntityCard"), variables: { uid: internalSource.uid } }, { token: await mint({ vis: ["PUBLIC", "INTERNAL"] }) });
    record("C1", "consumer API", "EntityCard of an INTERNAL migrated Source (PUBLIC actor, then an actor claiming INTERNAL)", GQL_PRINCIPAL === "admin" ? "[] for the PUBLIC actor (application filter); the actor's signed INTERNAL claim is honoured" : "[] both times (the database principal hides INTERNAL even when the actor claims it)", { principal: GQL_PRINCIPAL, public: a.body?.data?.entities?.length ?? null, claimedInternal: b.body?.data?.entities?.length ?? null }, Array.isArray(a.body?.data?.entities) && a.body.data.entities.length === 0 && Array.isArray(b.body?.data?.entities) && b.body.data.entities.length === (GQL_PRINCIPAL === "admin" ? 1 : 0));
  }
  const sdl = readFileSync(resolve(REPO, "apps/graphql-api/generated/schema.graphql"), "utf8").replace(/"""[^]*?"""/g, "").replace(/"[^"\n]*"/g, "");
  record("C2", "consumer API", "executable SDL exposes no operational or legacy names and no Mutation root", "no LegacyV0 / MIGRATED_FROM / Ks* type or field names (descriptions excluded) and no type Mutation", { legacy: /LegacyV0/.test(sdl), migratedFrom: /MIGRATED_FROM|migratedFrom/.test(sdl), ks: /\bKs[A-Z]/.test(sdl), mutation: /type Mutation\b/.test(sdl) }, !/LegacyV0|MIGRATED_FROM|migratedFrom|\bKs[A-Z]|type Mutation\b/.test(sdl));
  const cases = [
    ["C3", "unknown persisted documentId", { documentId: `sha256:${"5".repeat(64)}`, variables: {} }, {}],
    ["C4", "raw introspection query in the product profile", { query: "{ __schema { types { name } } }" }, {}],
    ["C5", "batched request array", JSON.stringify([{ documentId: opId("EntityCard"), variables: { uid: pub.uid } }, { documentId: opId("EntityCard"), variables: { uid: pub.uid } }]), {}],
    ["C6", "mutation document", { query: "mutation { createProducts(input: []) { info { nodesCreated } } }" }, {}],
    ["C7", "persisted id plus a smuggled query text", { documentId: opId("EntityCard"), query: "{ products { uid } }", variables: { uid: pub.uid } }, {}],
    ["C8", "missing x-api-key", { documentId: opId("EntityCard"), variables: { uid: pub.uid } }, { apiKey: null }],
    ["C9", "wrong x-api-key", { documentId: opId("EntityCard"), variables: { uid: pub.uid } }, { apiKey: "w".repeat(48) }],
    ["C10", "missing actor token", { documentId: opId("EntityCard"), variables: { uid: pub.uid } }, { token: null }],
    ["C11", "actor token signed by another key", { documentId: opId("EntityCard"), variables: { uid: pub.uid } }, { token: await mint({ key: generateKeyPairSync("ed25519").privateKey }) }],
    ["C12", "expired actor token", { documentId: opId("EntityCard"), variables: { uid: pub.uid } }, { token: await mint({ iatOffset: -600, ttl: 60 }) }],
    ["C13", "actor token for another audience", { documentId: opId("EntityCard"), variables: { uid: pub.uid } }, { token: await mint({ aud: "someone-else" }) }],
    ["C14", "page size above the operation bound", { documentId: opId("ProductVariantsPage"), variables: { uid: pub.uid, first: 5000 } }, {}],
  ];
  for (const [id, name, body, opts] of cases) {
    const r = await gq(body, opts);
    record(id, "consumer API", name, "rejected (4xx), no data", { status: r.status, code: r.body?.errors?.[0]?.extensions?.code ?? null, data: r.body?.data ? Object.keys(r.body.data) : null }, r.status >= 400 && r.status < 500 && !r.body?.data);
  }
  for (const [id, name, mutate] of [
    ["C15", "operation registry entry whose document no longer matches its id", (reg) => { reg.operations[0].document = `${reg.operations[0].document} `; }],
    ["C16", "operation registry generated for another executable", (reg) => { reg.releaseCompatibility.executableGraphqlDigest = `sha256:${"6".repeat(64)}`; }],
  ]) {
    const reg = JSON.parse(JSON.stringify(registry));
    mutate(reg);
    const p = resolve(DIR, `tampered-registry-${id}.json`);
    writeFileSync(p, JSON.stringify(reg, null, 2));
    let err = null;
    try { const s = await gqlServer.startServer({ env: gqlEnv, port: 0, log: () => {}, registryPath: p }); await s.stop(); await s.driver.close(); } catch (e) { err = String(e.message).slice(0, 160); }
    record(id, "consumer API", name, "startup refused", { error: err }, Boolean(err));
  }
}

// ------------------------------------------------------------------------------- 7. migration semantics after writes
if (want("migration")) {
  const res = [];
  for (const inv of plan.invariants) {
    const r = await q(`CYPHER 5 ${inv.statement}`, { run: MIG_RUN, ...(inv.params ?? {}) });
    const value = r[0]?.value;
    res.push({ id: inv.id, expect: inv.expect, value, ok: value === inv.expect });
  }
  const failed = res.filter((x) => !x.ok);
  writeFileSync(resolve(DIR, "invariants-after-executor-writes.json"), JSON.stringify(res, null, 2));
  record("S1", "migration semantics", "all migration invariants after executor writes on the migrated graph", "59/59", { passed: res.length - failed.length, total: res.length, failed: failed.slice(0, 5) }, failed.length === 0 && res.length === 59);
  const f = await fence();
  record("S2", "migration semantics", "fence advanced past the migration; the executor is the last writer", `graphRevision > ${fence0.rev}; lastWriterRunId is not ${MIG_RUN}`, f, f.rev > fence0.rev && f.last !== MIG_RUN);
  const before = await one("MATCH (n) WITH count(n) AS n MATCH ()-[r]->() RETURN n, count(r) AS r");
  const rb = spawnSync(process.execPath, [resolve(REPO, "scripts/migration/rollback-migration.mjs"), "--plan", PLAN_DIR, "--export", EXPORT_DIR, "--drop-release-ddl"], { cwd: REPO, env: { ...process.env, BKS_RESTORE_URI: URI, BKS_RESTORE_PASSWORD: ADMIN_PW }, encoding: "utf8", timeout: 300_000 });
  const after = await one("MATCH (n) WITH count(n) AS n MATCH ()-[r]->() RETURN n, count(r) AS r");
  const out = `${rb.stdout ?? ""}\n${rb.stderr ?? ""}`;
  writeFileSync(resolve(DIR, "rollback-attempt.txt"), out);
  const indexesAfter = (await one("SHOW CONSTRAINTS YIELD name RETURN count(*) AS c")).c;
  record("S3", "migration semantics", "rollback-migration.mjs after a v2 write", "refused (forward repair required); nothing deleted, no DDL dropped", { exit: rb.status, refused: /forward repair/.test(out), graph: [before, after], constraints: indexesAfter }, rb.status !== 0 && /forward repair/.test(out) && before.n === after.n && before.r === after.r);
}

// --------------------------------------------------------------------------------------- 8. optional capabilities
if (want("optional")) {
  const d = (await ex("GET", "/describe", undefined, T.reader)).body;
  const unsupported = (await ex("GET", "/kg/catalog/templates?status=unsupported", undefined, T.reader)).body;
  const vector = (unsupported?.templates ?? []).filter((t) => /vector|embedding/i.test(JSON.stringify(t)));
  record("O1", "optional capabilities", "describe advertises retrieve / analytics as unavailable; vector templates are unsupported", "retrieve and analytics available=false; the vector templates are unsupported", { retrieve: d?.capabilities?.retrieve ?? null, analytics: d?.capabilities?.analytics ?? null, releaseId: d?.releaseId ?? null, unsupported: unsupported?.count ?? null, vectorUnsupported: vector.map((t) => t.id) }, d?.capabilities?.retrieve?.available === false && d?.capabilities?.analytics?.available === false && vector.length >= 2);
}

// ------------------------------------------------------------------------------------------------------ teardown
child.kill();
writeFileSync(resolve(runDir, "executor.log"), execLogChunks.join(""));
if (gql) { await gql.stop().catch(() => undefined); await gql.driver.close().catch(() => undefined); }
writeFileSync(resolve(DIR, "graphql.log"), gqlLog.join("\n"));
await admin.close();
const evidence = { format: "bks-gate-g-adversarial.v1", stamp, startedAt: started, finishedAt: new Date().toISOString(), target: URI, releaseId: schema.releaseId, schemaReleaseDigest: REL, migrationRunId: MIG_RUN, graph: { ...counts, legacy: legacyCount, migratedFrom, intentMarkers, fenceAtStart: fence0 }, principals: "scripts/ops/aura-principals.mjs --apply --allow-local (secrets only in the custody file)", rows };
writeFileSync(resolve(DIR, `evidence-${stamp}.json`), JSON.stringify(evidence, null, 2));
const failedRows = rows.filter((r) => !r.pass);
log(`${rows.length - failedRows.length}/${rows.length} pass${failedRows.length ? `; failed: ${failedRows.map((r) => r.id).join(", ")}` : ""}; evidence evidence-${stamp}.json`);
process.exit(failedRows.length ? 1 : 0);
