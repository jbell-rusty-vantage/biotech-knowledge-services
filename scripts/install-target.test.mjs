// Wipe and remote-reinstall gates of the Biotech root installer (Sprint OC WI-24).
//
//   node --test scripts/install-target.test.mjs                        unit gates (no database)
//   INSTALL_WIPE_PG_ADMIN_DSN=<loopback admin DSN> node --test ...      + the real installer in --remote-reinstall mode
//                                                                       on a throwaway PostgreSQL database, dry-run,
//                                                                       wipe, legacy Mission Control with evidence
//   ... NEO4J_TEST_URI=neo4j://localhost:7690 NEO4J_TEST_PASSWORD=...    + the local graph (scripts/neo4j-test.sh up):
//                                                                       fresh / repeat / interrupted and graph wipe
//   INSTALL_SEAL_PG_ADMIN_DSN=<loopback admin DSN> [BKS_TEST_KS_ROOT=<KS checkout, dist built>]
//                                                                       + the seal-key step (OVE-169 W1 D25) on its own
//                                                                       throwaway database: applied, current, conflict,
//                                                                       rotation with retire
// Never a remote host: both URIs must be loopback.
//   BKS_TEST_MC_ROOT=<MC checkout>   the Mission Control checkout to test against (default ../../platform/mission-control;
//                                    a worktree holding a release before it is merged); passed as --mc-root.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, generateKeyPairSync, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  GRAPH_BATCH, MISSION_CONTROL_SCHEMAS, PROTECTED_SCHEMAS, Refused, WIPE_SCHEMAS, cascadeVerdict, checkDryRunReceipt, confirmGraph,
  confirmTarget, evaluateGraph, evaluateIdentity, graphHost, identifyTarget, inventoryDigest, isPlatformSession, isProtectedSchema,
  listSessions, loadTarget, normalizeFlags,
  resolveTargetDsn, routeProof, selectSchemas,
} from "./install-target.mjs";
import { COMPONENT_LOGIN_REFUSED, COMPONENT_SET_ROLES, KS_COMPONENT_PIN, PINS, componentCli, main, planComponentGrants, sealKey, sealKeyOptions, checkSealKeyInputs, scrubOutput } from "./install-biotech.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mcRoot = resolve(process.env.BKS_TEST_MC_ROOT ?? join(ROOT, "..", "..", "platform", "mission-control"));
const mcRootArgs = process.env.BKS_TEST_MC_ROOT ? ["--mc-root", mcRoot] : [];
const ksCli = resolve(ROOT, "..", "..", "platform", "knowledge-services", "packages", "knowledge-db-contract", "dist", "cli.js");
const missionDb = join(mcRoot, ".venv", process.platform === "win32" ? "Scripts/mission-db.exe" : "bin/mission-db");
const scratch = join(ROOT, ".scratch", "sprint-oc", "test-install-target");
const refusal = (code) => (error) => { assert.ok(error instanceof Refused, String(error)); assert.equal(error.code, code); return true; };

function targetToml({ ref, id, host = "127.0.0.1", port = 5432, user = "postgres", database = "postgres", env = "INSTALL_WIPE_TARGET_DSN", environment = "disposable", label = ref }) {
  return `format_version = 1

[target]
app = "biotech"
application_id = "biotech"
project_label = "${label}"
project_ref = "${ref}"
installation_id = "${id}"
environment = "${environment}"
database_host = "${host}"
database_port = ${port}
database_name = "${database}"
database_user = "${user}"
database_url_env = "${env}"

[approval]
approved_by = "install-target.test.mjs"
identity_evidence = "disposable loopback test database"
`;
}
function writeTarget(dir, name, fields) {
  mkdirSync(dir, { recursive: true });
  const path = join(dir, name);
  writeFileSync(path, targetToml(fields));
  return path;
}
const SYSID = "7400000000000000001";
const probe = (rows = [], missionControl = rows.length > 0) => ({ schemasPresent: [], missionControl, identityRows: rows, lastMissionControlMigration: missionControl ? "0034_provider_frame_lifecycle_body" : null, systemIdentifier: SYSID, systemIdentifierError: null });
const inspection = (target, matches = true) => ({ status: "inspected", target: { project_ref: target.project_ref, installation_id: target.installation_id }, identity_matches_target: matches });
const row = (ref, id, app = "biotech") => ({ installation_id: id, application_id: app, supabase_project_ref: ref, environment: "production" });

// --------------------------------------------------------------------------------------------------------- unit
describe("allow-list", () => {
  it("is the component and Mission Control schemas (incl. legacy capability_search), Mission Control last", () => {
    assert.deepEqual([...WIPE_SCHEMAS], ["knowledge_service", "knowledge_verification", ...MISSION_CONTROL_SCHEMAS]);
    assert.equal(WIPE_SCHEMAS.at(-1), "mission_control");
    assert.ok(WIPE_SCHEMAS.includes("capability_search"));
    for (const s of WIPE_SCHEMAS) assert.equal(isProtectedSchema(s), false, s);
    for (const s of [...PROTECTED_SCHEMAS, "pg_catalog", "supabase_functions"]) assert.equal(isProtectedSchema(s), true, s);
  });
  it("refuses any schema outside the allow-list", () => {
    for (const list of ["public", "auth", "storage", "extensions", "research", "mission_control,public", "pg_toast", ""]) {
      assert.throws(() => selectSchemas(list), refusal("WIPE_SCHEMA_NOT_ALLOWED"), list);
    }
    assert.deepEqual(selectSchemas("mission_control,capability_search"), ["capability_search", "mission_control"]);
  });
});

describe("target and graph gates", () => {
  const dir = mkdtempSync(join(tmpdir(), "bks-target-"));
  after(() => rmSync(dir, { recursive: true, force: true }));
  const ref = "bxnetwiimwhtlrjlbtab";
  const id = "01a103c0-9a9e-7a95-961b-29dda83c842b";
  const direct = loadTarget(writeTarget(dir, "direct.toml", { ref, id, host: `db.${ref}.supabase.co`, env: "BKS_TEST_URL", environment: "production", label: "biotech-research-ingestion" }), { app: "biotech" });
  const url = `postgresql://postgres:pw@db.${ref}.supabase.co:5432/postgres`;
  const evidence = (over = {}) => ({ source: "management-api", project_ref: ref, name: "biotech-research-ingestion", region: "us-east-1", installation_id: id, system_identifier: SYSID, observed_at: new Date().toISOString(), ...over });

  it("reads the real MC biotech target and refuses the AI Engineer one", { skip: !existsSync(join(mcRoot, "deployments", "biotech", "target.toml")) }, () => {
    const t = loadTarget(join(mcRoot, "deployments", "biotech", "target.toml"), { app: "biotech" });
    assert.ok(routeProof(t), "the real target's direct host carries its ref");
    assert.throws(() => loadTarget(join(mcRoot, "deployments", "ai-engineer", "target.toml"), { app: "biotech" }), refusal("TARGET_INVALID"));
  });
  it("requires --confirm-target and its exact value", () => {
    assert.throws(() => confirmTarget(undefined, direct), refusal("CONFIRM_TARGET_REQUIRED"));
    for (const wrong of [ref, `${id}:${ref}`, `wkythqbofmckbuoothhn:${id}`, `${ref}:01a103c0-9a9e-70f3-9398-eb1573a98324`]) {
      assert.throws(() => confirmTarget(wrong, direct), refusal("CONFIRM_TARGET_MISMATCH"), wrong);
    }
  });
  it("requires the declared endpoint, with TLS off loopback", () => {
    assert.throws(() => resolveTargetDsn(direct, {}), refusal("TARGET_DSN_MISSING"));
    assert.throws(() => resolveTargetDsn(direct, { BKS_TEST_URL: "postgresql://postgres:pw@db.other.supabase.co:5432/postgres?sslmode=require" }), refusal("TARGET_DSN_MISMATCH"));
    for (const mode of ["", "?sslmode=disable", "?sslmode=allow", "?sslmode=prefer"]) assert.throws(() => resolveTargetDsn(direct, { BKS_TEST_URL: `${url}${mode}` }), refusal("TARGET_DSN_TLS_REQUIRED"));
    assert.equal(resolveTargetDsn(direct, { BKS_TEST_URL: `${url}?sslmode=verify-full` }).sslmode, "verify-full");
  });
  it("identity: matched rows, mismatches, legacy MC needing fresh evidence, exact route otherwise", () => {
    assert.equal(evaluateIdentity({ probe: probe([row(ref, id)]), inspection: inspection(direct) }, direct).status, "matched");
    assert.throws(() => evaluateIdentity({ probe: probe([row(ref, randomUUID())]), inspection: inspection(direct) }, direct), refusal("TARGET_IDENTITY_MISMATCH"));
    assert.throws(() => evaluateIdentity({ probe: probe([row(ref, id, "ai-engineer")]), inspection: inspection(direct) }, direct), refusal("TARGET_IDENTITY_MISMATCH"));
    const legacy = { probe: probe([], true), inspection: null, inspectError: "legacy" };
    assert.throws(() => evaluateIdentity(legacy, direct), refusal("TARGET_IDENTITY_UNPROVEN"));
    assert.throws(() => evaluateIdentity({ ...legacy, evidence: evidence({ observed_at: new Date(Date.now() - 25 * 3600e3).toISOString() }) }, direct), refusal("TARGET_IDENTITY_UNPROVEN"));
    assert.throws(() => evaluateIdentity({ ...legacy, evidence: evidence({ project_ref: "wkythqbofmckbuoothhn" }) }, direct), refusal("TARGET_IDENTITY_UNPROVEN"));
    assert.throws(() => evaluateIdentity({ ...legacy, evidence: evidence({ installation_id: randomUUID() }) }, direct), refusal("TARGET_IDENTITY_UNPROVEN"));
    assert.throws(() => evaluateIdentity({ ...legacy, evidence: evidence({ system_identifier: undefined }) }, direct), refusal("TARGET_IDENTITY_UNPROVEN"));
    assert.throws(() => evaluateIdentity({ ...legacy, evidence: evidence({ system_identifier: "7400000000000000002" }) }, direct), refusal("TARGET_SYSTEM_IDENTIFIER_MISMATCH"));
    assert.throws(() => evaluateIdentity({ probe: probe([row(ref, id)]), inspection: inspection(direct), evidence: evidence({ system_identifier: "1" }) }, direct), refusal("TARGET_SYSTEM_IDENTIFIER_MISMATCH"));
    assert.equal(evaluateIdentity({ ...legacy, evidence: evidence() }, direct).status, "evidence");
    assert.equal(evaluateIdentity({ probe: probe(), inspection: inspection(direct) }, direct).status, "absent");
    const anonymous = { ...direct, database_host: `${ref}.example.com` };
    assert.throws(() => evaluateIdentity({ probe: probe(), inspection: inspection(anonymous) }, anonymous), refusal("TARGET_IDENTITY_UNPROVEN"));
  });
  it("checks the confirmation before connecting", async () => {
    let connected = 0;
    await assert.rejects(identifyTarget({ target: direct, confirmation: "nope", env: {}, connect: async () => { connected += 1; }, inspect: () => ({}) }), refusal("CONFIRM_TARGET_MISMATCH"));
    assert.equal(connected, 0);
  });
  it("graph: TLS off loopback, host pinned by flag and environment", () => {
    assert.equal(graphHost("neo4j+s://abcd1234.databases.neo4j.io"), "abcd1234.databases.neo4j.io");
    for (const uri of ["neo4j://abcd1234.databases.neo4j.io", "bolt://abcd1234.databases.neo4j.io", "neo4j+ssc://abcd1234.databases.neo4j.io"]) {
      assert.throws(() => graphHost(uri), refusal("NEO4J_TLS_REQUIRED"), uri);
    }
    assert.equal(graphHost("neo4j://localhost:7690"), "localhost");
    assert.throws(() => graphHost("http://x"), refusal("NEO4J_URI_INVALID"));
    const aura = "neo4j+s://abcd1234.databases.neo4j.io";
    assert.throws(() => confirmGraph(undefined, aura), refusal("CONFIRM_GRAPH_REQUIRED"));
    assert.throws(() => confirmGraph("abcd1234", aura), refusal("CONFIRM_GRAPH_MISMATCH"));
    assert.throws(() => confirmGraph("abcd1234.databases.neo4j.io", aura, { BKS_BIOTECH_GRAPH_URI: "neo4j+s://other.databases.neo4j.io" }, { requireEnv: true }), refusal("GRAPH_TARGET_MISMATCH"));
    assert.throws(() => confirmGraph("abcd1234.databases.neo4j.io", aura, {}, { requireEnv: true }), refusal("GRAPH_TARGET_MISMATCH"));
    assert.equal(confirmGraph("abcd1234.databases.neo4j.io", aura, { BKS_BIOTECH_GRAPH_URI: aura }, { requireEnv: true }), "abcd1234.databases.neo4j.io");
  });
  it("graph: Biotech markers or empty; content without a marker needs --allow-unmarked-graph", () => {
    assert.deepEqual(evaluateGraph({ nodes: 10, markers: [{ releaseId: "biotech-schema-v2.2.0" }] }), ["biotech-schema-v2.2.0"]);
    assert.deepEqual(evaluateGraph({ nodes: 0, markers: [] }), []);
    assert.throws(() => evaluateGraph({ nodes: 5, markers: [] }), refusal("GRAPH_UNMARKED"));
    assert.deepEqual(evaluateGraph({ nodes: 5, markers: [] }, { allowUnmarked: true }), []);
    assert.throws(() => evaluateGraph({ nodes: 5, markers: [{ releaseId: "other-graph" }] }, { allowUnmarked: true }), refusal("GRAPH_IDENTITY_MISMATCH"));
    assert.equal(GRAPH_BATCH, 1000);
  });
});

describe("plan and session gates (F1, F2, F4)", () => {
  it("only Supabase platform sessions are allowlisted", () => {
    assert.equal(isPlatformSession({ usename: "authenticator" }), true);
    assert.equal(isPlatformSession({ usename: "postgres", application_name: "postgrest" }), true);
    assert.equal(isPlatformSession({ usename: "postgres", application_name: "psql" }), false);
    assert.equal(isPlatformSession({ usename: "mission_control_runtime" }), false);
  });
  it("a cascade into anything outside the allow-list blocks, whatever its kind", () => {
    const { forbidden } = cascadeVerdict([{ kind: "policy", schema: "public", name: "p on t" }, { kind: "view", schema: "public", name: "v" }, { kind: "function", schema: "public", name: "f()" }], {});
    assert.equal(forbidden.length, 3);
  });
  it("--from-dry-run must be a clean, fresh dry-run of this target", () => {
    const dir = mkdtempSync(join(tmpdir(), "bks-dry-"));
    const target = { project_ref: "r", installation_id: randomUUID(), path: "/t.toml" };
    const flags = { allowSessions: false, allowUnmarkedGraph: false, skipGraph: false };
    const ctx = { target, flags, requestedSchemas: [...WIPE_SCHEMAS], format: "biotech-wipe-receipt.v2" };
    const good = { format: "biotech-wipe-receipt.v2", dryRun: true, status: "dry-run-clear", blockers: [], finishedAt: new Date().toISOString(), target: { project_ref: "r", installation_id: target.installation_id, target_file: "/t.toml" }, flags, requestedSchemas: [...WIPE_SCHEMAS], inventoryDigest: `sha256:${"b".repeat(64)}` };
    const write = (body) => { const p = join(dir, `${randomUUID()}.json`); writeFileSync(p, JSON.stringify(body)); return p; };
    assert.throws(() => checkDryRunReceipt(undefined, ctx), refusal("WIPE_DRY_RUN_REQUIRED"));
    assert.throws(() => checkDryRunReceipt(write({ ...good, status: "dry-run-blocked" }), ctx), refusal("WIPE_DRY_RUN_BLOCKED"));
    assert.throws(() => checkDryRunReceipt(write({ ...good, finishedAt: new Date(Date.now() - 3 * 3600e3).toISOString() }), ctx), refusal("WIPE_DRY_RUN_STALE"));
    assert.throws(() => checkDryRunReceipt(write({ ...good, flags: { ...flags, allowUnmarkedGraph: true } }), ctx), refusal("WIPE_DRY_RUN_MISMATCH"));
    assert.equal(checkDryRunReceipt(write(good), ctx).inventoryDigest, good.inventoryDigest);
    rmSync(dir, { recursive: true, force: true });
  });
  it("lists client backends only: autovacuum and other background workers (NULL usename) are not sessions", async () => {
    const rows = [
      { pid: 1, usename: "postgres", application_name: "psql", state: "idle", backend_type: "client backend", backend_start: "t" },
      { pid: 2, usename: null, application_name: "", state: null, backend_type: "autovacuum worker", backend_start: "t" },
      { pid: 3, usename: null, application_name: "", state: null, backend_type: "parallel worker", backend_start: "t" },
    ];
    let seen = "";
    const fake = { query: async (text) => { seen = text; return { rows: /backend_type = 'client backend'/.test(text) ? rows.filter((r) => r.backend_type === "client backend") : rows }; } };
    const sessions = await listSessions(fake);
    assert.match(seen, /backend_type = 'client backend'/);
    assert.doesNotMatch(seen, /\bquery\b(?!_)/, "never selects query text");
    assert.deepEqual(sessions.map((s) => s.pid), [1]);
  });
  it("compares dry-run flags order-insensitively", () => {
    assert.deepEqual(normalizeFlags({ b: ["y", "x"], a: true }), normalizeFlags({ a: true, b: ["x", "y"] }));
    assert.notDeepEqual(normalizeFlags({ b: ["x"] }), normalizeFlags({ b: ["x", "y"] }));
  });
  it("cascade diff covers indexes, column defaults, rules and extended statistics", () => {
    const owned = { public: { relations: new Set(["t"]), parents: new Set(["m"]) } };
    const { forbidden, recorded, expected } = cascadeVerdict([
      { kind: "index", schema: "public", name: "t_idx on t" }, { kind: "column_default", schema: "public", name: "t.c" },
      { kind: "rule", schema: "public", name: "r on m" }, { kind: "statistics", schema: "public", name: "s on m" }, { kind: "index", schema: "public", name: "m_idx on m" },
      { kind: "index", schema: "public", name: "k_idx on keep_me" }, { kind: "column_default", schema: "public", name: "keep_me.c" },
      { kind: "rule", schema: "public", name: "r on keep_me" }, { kind: "statistics", schema: "public", name: "s on keep_me" },
    ], owned);
    assert.equal(expected, 2);
    assert.deepEqual(recorded.map((o) => o.name), ["r on m", "s on m", "m_idx on m"]);
    assert.deepEqual(forbidden.map((o) => `${o.kind}:${o.name}`), ["index:k_idx on keep_me", "column_default:keep_me.c", "rule:r on keep_me", "statistics:s on keep_me"]);
  });
  it("a dry-run against one graph never authorises a wipe of another (host in the receipt check and the digest)", () => {
    const dir = mkdtempSync(join(tmpdir(), "bks-host-"));
    const target = { project_ref: "r", installation_id: randomUUID(), path: "/t.toml" };
    const flags = { allowSessions: false, allowUnmarkedGraph: false, skipGraph: false };
    const base = { format: "biotech-wipe-receipt.v2", dryRun: true, status: "dry-run-clear", blockers: [], finishedAt: new Date().toISOString(), target: { project_ref: "r", installation_id: target.installation_id, target_file: "/t.toml" }, flags, requestedSchemas: [...WIPE_SCHEMAS], inventoryDigest: `sha256:${"c".repeat(64)}`, graphHost: "aaaa1111.databases.neo4j.io" };
    const write = (body) => { const p = join(dir, `${randomUUID()}.json`); writeFileSync(p, JSON.stringify(body)); return p; };
    const ctx = (graphHost) => ({ target, flags, requestedSchemas: [...WIPE_SCHEMAS], format: "biotech-wipe-receipt.v2", graphHost });
    assert.throws(() => checkDryRunReceipt(write(base), ctx("bbbb2222.databases.neo4j.io")), refusal("WIPE_DRY_RUN_MISMATCH"));
    assert.throws(() => checkDryRunReceipt(write(base), ctx(null)), refusal("WIPE_DRY_RUN_MISMATCH"));
    assert.throws(() => checkDryRunReceipt(write({ ...base, graphHost: null }), ctx("aaaa1111.databases.neo4j.io")), refusal("WIPE_DRY_RUN_MISMATCH"));
    assert.equal(checkDryRunReceipt(write(base), ctx("AAAA1111.databases.neo4j.io")).inventoryDigest, base.inventoryDigest);
    assert.equal(checkDryRunReceipt(write({ ...base, flags: { skipGraph: false, allowUnmarkedGraph: false, allowSessions: false } }), ctx("aaaa1111.databases.neo4j.io")).inventoryDigest, base.inventoryDigest, "flag order is irrelevant");
    const graph = (host) => [{ step: "graph", host, status: "would-delete", nodesBefore: 5, relationshipsBefore: 2, labels: { A: 5 }, markersBefore: ["biotech-schema-v2.2.0"] }];
    assert.notEqual(inventoryDigest(graph("aaaa1111.databases.neo4j.io")), inventoryDigest(graph("bbbb2222.databases.neo4j.io")));
    assert.equal(inventoryDigest(graph("aaaa1111.databases.neo4j.io")), inventoryDigest(graph("AAAA1111.databases.neo4j.io")));
    rmSync(dir, { recursive: true, force: true });
  });
});

describe("pins", () => {
  const mcLock = join(mcRoot, PINS.missionControl.lockPath);
  it("Mission Control 1.9.0: the Sprint OC lock's bytes and the release root agree", { skip: !existsSync(mcLock) && "MC Sprint OC lock not present" }, () => {
    const bytes = readFileSync(mcLock);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), PINS.missionControl.lockFileSha256);
    const lock = JSON.parse(bytes.toString("utf8"));
    assert.equal(lock.app, "biotech");
    assert.equal(lock.component_version, PINS.missionControl.version);
    assert.equal(resolve(dirname(mcLock), lock.release_root), resolve(mcRoot, PINS.missionControl.releaseRoot), "the lock's release_root is the explicit default");
    const release = JSON.parse(readFileSync(join(mcRoot, PINS.missionControl.releaseRoot, "manifest.json"), "utf8"));
    assert.equal(release.component_version, PINS.missionControl.version);
  });
  it("the KS pin is one line and matches the component at --ks-root (default: the KS main checkout)", { skip: !existsSync(ksCli) && "KS dist not built" }, () => {
    assert.deepEqual(Object.keys(KS_COMPONENT_PIN), ["version", "digest"]);
    assert.equal(componentCli(resolve(ROOT, "..", "..", "platform", "knowledge-services")), ksCli);
    const manifest = JSON.parse(spawnSync(process.execPath, [ksCli, "manifest"], { encoding: "utf8" }).stdout.replace(/^[^{]*/, ""));
    assert.equal(manifest.component_version, KS_COMPONENT_PIN.version, "update KS_COMPONENT_PIN when --ks-root moves to a new release");
    assert.equal(manifest.component_digest, KS_COMPONENT_PIN.digest);
  });
  it("--ks-root is honoured", () => {
    const empty = mkdtempSync(join(tmpdir(), "bks-ks-"));
    assert.throws(() => componentCli(empty), refusal("TOOL_MISSING"));
    rmSync(empty, { recursive: true, force: true });
  });
  it("ships biotech-schema-v2.2.0 for the graph release", () => {
    assert.equal(PINS.bks.releaseId, "biotech-schema-v2.2.0");
  });
});

describe("component-grants plan (OVE-168)", () => {
  // Supabase shape on PostgreSQL 16+: the non-superuser CREATEROLE admin that created the roles holds them WITH ADMIN
  // only (INHERIT FALSE, SET FALSE), granted by the bootstrap superuser.
  const adminOnly = { admin: true, inherit: false, set: false, grantor: "supabase_admin" };
  const setOnly = (grantor) => ({ admin: false, inherit: false, set: true, grantor });
  const state = (over = {}, role = () => ({})) => ({
    login: "postgres", sessionUser: "postgres", sessionSuperuser: false, explicit: false, account: { canLogin: true, superuser: false },
    roles: COMPONENT_SET_ROLES.map((r) => ({ role: r, exists: true, canSet: false, sessionAdmin: true, rows: [adminOnly], ...role(r) })), ...over,
  });
  it("covers the four bounded component roles", () => {
    assert.deepEqual([...COMPONENT_SET_ROLES], ["knowledge_verification_reader", "knowledge_verification_writer", "knowledge_verification_reviewer", "knowledge_verification_outbox_worker"]);
  });
  it("admin login with ADMIN-only memberships: one SET-only grant per role, no admin, no inherit", () => {
    const plan = planComponentGrants(state());
    assert.deepEqual(plan.grants.map((g) => g.sql), COMPONENT_SET_ROLES.map((r) => `grant "${r}" to "postgres" with inherit false, set true`));
    assert.deepEqual(plan.current, []);
  });
  it("repeat: SET already held (self-granted row beside the ADMIN row) issues nothing", () => {
    const plan = planComponentGrants(state({}, () => ({ canSet: true, rows: [adminOnly, setOnly("postgres")] })));
    assert.deepEqual(plan.grants, []);
    assert.deepEqual(plan.current, [...COMPONENT_SET_ROLES]);
  });
  it("partial: only the missing role is granted", () => {
    const plan = planComponentGrants(state({}, (r) => (r === "knowledge_verification_reviewer" ? {} : { canSet: true, rows: [adminOnly, setOnly("postgres")] })));
    assert.deepEqual(plan.grants.map((g) => g.role), ["knowledge_verification_reviewer"]);
  });
  it("dedicated --component-login: granted by the admin session user; repeat is current", () => {
    const dedicated = { login: "bks_verification", explicit: true };
    assert.deepEqual(planComponentGrants(state(dedicated, () => ({ rows: [] }))).grants.map((g) => g.sql),
      COMPONENT_SET_ROLES.map((r) => `grant "${r}" to "bks_verification" with inherit false, set true`));
    assert.deepEqual(planComponentGrants(state(dedicated, () => ({ canSet: true, rows: [setOnly("postgres")] }))).grants, []);
  });
  it("GRANTS_DRIFT: INHERIT on any login, ADMIN on a login other than the session user", () => {
    const inherit = { admin: false, inherit: true, set: true, grantor: "postgres" };
    assert.throws(() => planComponentGrants(state({}, (r) => (r.endsWith("reader") ? { canSet: true, rows: [adminOnly, inherit] } : {}))), refusal("GRANTS_DRIFT"));
    assert.throws(() => planComponentGrants(state({ login: "bks_verification", explicit: true }, () => ({ rows: [inherit] }))), refusal("GRANTS_DRIFT"));
    assert.throws(() => planComponentGrants(state({ login: "bks_verification", explicit: true }, () => ({ rows: [adminOnly] }))), refusal("GRANTS_DRIFT"));
  });
  it("refuses a missing component role before granting anything", () => {
    assert.throws(() => planComponentGrants(state({}, (r) => (r.endsWith("outbox_worker") ? { exists: false, rows: [] } : {}))), refusal("COMPONENT_ROLE_MISSING"));
  });
  it("superuser: the DSN's own superuser needs nothing; an explicit superuser login is refused", () => {
    const su = { account: { canLogin: true, superuser: true }, sessionSuperuser: true };
    assert.deepEqual(planComponentGrants(state(su)).grants, []);
    assert.throws(() => planComponentGrants(state({ ...su, login: "other_superuser", explicit: true })), refusal("COMPONENT_LOGIN_SUPERUSER"));
  });
  it("refuses platform/API logins, pg_* and component roles, absent or NOLOGIN logins", () => {
    for (const login of [...COMPONENT_LOGIN_REFUSED, "pg_monitor", "knowledge_verification_reader"]) {
      assert.throws(() => planComponentGrants(state({ login, explicit: true })), refusal("COMPONENT_LOGIN_REFUSED"), login);
    }
    assert.ok(COMPONENT_LOGIN_REFUSED.includes("authenticator"));
    assert.throws(() => planComponentGrants(state({ login: "ghost", explicit: true, account: null })), refusal("COMPONENT_LOGIN_INVALID"));
    assert.throws(() => planComponentGrants(state({ account: { canLogin: false, superuser: false } })), refusal("COMPONENT_LOGIN_INVALID"));
    assert.throws(() => planComponentGrants(state({ login: "Bad-Name" })), refusal("COMPONENT_LOGIN_INVALID"));
  });
  it("COMPONENT_GRANT_DENIED when the session user holds no ADMIN on a role that still needs the grant", () => {
    assert.throws(() => planComponentGrants(state({}, () => ({ sessionAdmin: false, rows: [] }))), refusal("COMPONENT_GRANT_DENIED"));
  });
});

describe("CLI refusals before any connection", () => {
  const dir = mkdtempSync(join(tmpdir(), "bks-cli-"));
  after(() => { rmSync(dir, { recursive: true, force: true }); delete process.env.BKS_BIOTECH_GRAPH_URI; });
  const id = randomUUID();
  const ref = "disposable-bks-cli";
  const target = writeTarget(dir, "t.toml", { ref, id });
  const evidence = join(scratch, "cli-evidence");
  const graph = ["--neo4j-uri", "neo4j://localhost:7690", "--neo4j-password-env", "UNSET_FOR_TEST", "--confirm-graph", "localhost"];
  it("wipe pins the graph host to BKS_BIOTECH_GRAPH_URI before anything else", async () => {
    delete process.env.BKS_BIOTECH_GRAPH_URI;
    await assert.rejects(main(["wipe", "--target", target, "--confirm-target", `${ref}:${id}`, ...graph, "--evidence-dir", evidence]), refusal("GRAPH_TARGET_MISMATCH"));
    process.env.BKS_BIOTECH_GRAPH_URI = "neo4j://127.0.0.1:7690";
    await assert.rejects(main(["wipe", "--target", target, "--confirm-target", `${ref}:${id}`, ...graph, "--evidence-dir", evidence]), refusal("GRAPH_TARGET_MISMATCH"));
    process.env.BKS_BIOTECH_GRAPH_URI = "neo4j://localhost:7690";
  });
  it("wipe without, or with a wrong, --confirm-target", { skip: !existsSync(missionDb) }, async () => {
    await assert.rejects(main(["wipe", "--target", target, ...graph, "--evidence-dir", evidence]), refusal("CONFIRM_TARGET_REQUIRED"));
    await assert.rejects(main(["wipe", "--dry-run", "--target", target, "--confirm-target", `${ref}:${randomUUID()}`, ...graph, "--evidence-dir", evidence]), refusal("CONFIRM_TARGET_MISMATCH"));
  });
  it("wipe without a graph decision, or with a wrong --confirm-graph", async () => {
    await assert.rejects(main(["wipe", "--target", target, "--confirm-target", `${ref}:${id}`, "--evidence-dir", evidence]), refusal("NEO4J_URI_REQUIRED"));
    await assert.rejects(main(["wipe", "--target", target, "--confirm-target", `${ref}:${id}`, "--neo4j-uri", "neo4j://localhost:7690", "--confirm-graph", "127.0.0.1", "--evidence-dir", evidence]), refusal("CONFIRM_GRAPH_MISMATCH"));
  });
  it("wipe of a schema outside the allow-list, or receipts into a tracked directory", async () => {
    await assert.rejects(main(["wipe", "--target", target, "--confirm-target", `${ref}:${id}`, "--skip-graph", "--schemas", "auth"]), refusal("WIPE_SCHEMA_NOT_ALLOWED"));
    await assert.rejects(main(["wipe", "--target", target, "--confirm-target", `${ref}:${id}`, "--skip-graph", "--evidence-dir", join(ROOT, "scripts")]), refusal("EVIDENCE_DIR_NOT_IGNORED"));
  });
  it("install keeps the disposable refusals without the flag, and refuses --target without it", async () => {
    process.env.BKS_TEST_REMOTE_DSN = "postgresql://postgres:pw@db.bxnetwiimwhtlrjlbtab.supabase.co:5432/postgres";
    await assert.rejects(main(["--pg-admin-dsn-env", "BKS_TEST_REMOTE_DSN"]), refusal("LOOPBACK_REQUIRED"));
    process.env.BKS_TEST_REMOTE_DSN = "postgresql://postgres:pw@127.0.0.1:5432/disposable_cli_x";
    await assert.rejects(main(["--pg-admin-dsn-env", "BKS_TEST_REMOTE_DSN", "--neo4j-uri", "neo4j+s://abcd1234.databases.neo4j.io"]), refusal("DISPOSABLE_NEO4J_REQUIRED"));
    delete process.env.BKS_TEST_REMOTE_DSN;
    await assert.rejects(main(["--target", target, "--confirm-target", `${ref}:${id}`]), refusal("REMOTE_REINSTALL_FLAG_REQUIRED"));
    process.env.BKS_TEST_REMOTE_DSN = "postgresql://postgres:pw@127.0.0.1:5432/disposable_cli_x";
    for (const login of ["Bad-Name", undefined]) {
      await assert.rejects(main(["--pg-admin-dsn-env", "BKS_TEST_REMOTE_DSN", "--neo4j-uri", "neo4j://localhost:7690", "--component-installation-id", randomUUID(),
        "--mc-installation-id", randomUUID(), "--component-login", ...(login ? [login] : [])]), refusal("COMPONENT_LOGIN_INVALID"), String(login));
    }
    delete process.env.BKS_TEST_REMOTE_DSN;
  });
  it("remote reinstall requires the graph and target confirmations, and TLS to a remote graph", { skip: !existsSync(missionDb) }, async () => {
    const base = ["--remote-reinstall", "--target", target, "--neo4j-uri", "neo4j+s://abcd1234.databases.neo4j.io", "--component-installation-id", randomUUID()];
    await assert.rejects(main(base), refusal("CONFIRM_GRAPH_REQUIRED"));
    await assert.rejects(main([...base, "--confirm-graph", "abcd1234.databases.neo4j.io"]), refusal("CONFIRM_TARGET_REQUIRED"));
    await assert.rejects(main([...base, "--confirm-graph", "abcd1234.databases.neo4j.io", "--confirm-target", `${ref}:${randomUUID()}`]), refusal("CONFIRM_TARGET_MISMATCH"));
    await assert.rejects(main([...base, "--confirm-graph", "abcd1234.databases.neo4j.io", "--pg-admin-dsn-env", "X"]), refusal("REMOTE_REINSTALL_CONFLICT"));
    await assert.rejects(main([...base.slice(0, 3), "--neo4j-uri", "neo4j://abcd1234.databases.neo4j.io", "--component-installation-id", randomUUID(), "--confirm-graph", "abcd1234.databases.neo4j.io"]), refusal("NEO4J_TLS_REQUIRED"));
  });
});

// ------------------------------------------------------------------------------------------- seal-key (W1 D25)
const SEAL_ADMIN = process.env.INSTALL_SEAL_PG_ADMIN_DSN;
const sealKsRoot = resolve(process.env.BKS_TEST_KS_ROOT ?? join(ROOT, "..", "..", "platform", "knowledge-services"));
const sealKsReady = existsSync(join(sealKsRoot, "packages", "knowledge-db-contract", "dist", "cli.js"));
function sealPem(dir, name) {
  const path = join(dir, name);
  writeFileSync(path, generateKeyPairSync("ed25519").privateKey.export({ format: "pem", type: "pkcs8" }));
  return path;
}
describe("seal-key step (OVE-169 W1 D25)", () => {
  const dir = mkdtempSync(join(tmpdir(), "bks-seal-"));
  after(() => rmSync(dir, { recursive: true, force: true }));
  it("takes flags first, else the generator's environment names, with the descriptor's default issuer", () => {
    const env = { KS_KNOWLEDGE_SEAL_KEY_ID: "ks-seal-env", KS_KNOWLEDGE_SEAL_KEY_FILE: "/runtime/ks-seal.pem", KS_KNOWLEDGE_SEAL_RETIRE_KEY_IDS: " " };
    assert.deepEqual(sealKeyOptions([], env), { keyId: "ks-seal-env", keyFile: "/runtime/ks-seal.pem", issuer: "knowledge-services", retire: undefined, skip: false, flagged: false });
    assert.deepEqual(sealKeyOptions(["--seal-key-id", "ks-seal-flag", "--seal-issuer", "ks-local", "--retire-seal-key-ids", "a,b"], env),
      { keyId: "ks-seal-flag", keyFile: "/runtime/ks-seal.pem", issuer: "ks-local", retire: "a,b", skip: false, flagged: true });
    assert.deepEqual(sealKeyOptions(["--no-seal-key"], {}), { keyId: undefined, keyFile: undefined, issuer: "knowledge-services", retire: undefined, skip: true, flagged: false });
  });
  it("remote mode requires a seal key or an explicit --no-seal-key; local mode warns (review S1)", () => {
    assert.throws(() => checkSealKeyInputs(sealKeyOptions([], {}), { remote: true }), refusal("SEAL_KEY_REQUIRED"));
    assert.equal(checkSealKeyInputs(sealKeyOptions(["--no-seal-key"], {}), { remote: true }), "skip");
    assert.throws(() => checkSealKeyInputs(sealKeyOptions(["--no-seal-key", "--seal-key-id", "ks-seal-a"], {}), { remote: true }), refusal("SEAL_KEY_FLAGS_CONFLICT"));
    // --no-seal-key wins over install.env's names (they are present whenever the generated file is loaded).
    assert.equal(checkSealKeyInputs(sealKeyOptions(["--no-seal-key"], { KS_KNOWLEDGE_SEAL_KEY_ID: "ks-seal-env", KS_KNOWLEDGE_SEAL_KEY_FILE: "/x.pem" }), { remote: true }), "skip");
    assert.equal(checkSealKeyInputs(sealKeyOptions([], {}), { remote: false }), "absent");
    const remote = { ksRoot: dir, pg: { dsn: "postgresql://postgres:x@127.0.0.1:1/none" }, remote: { target: {} } };
    assert.throws(() => sealKey({ ...remote, sealKey: sealKeyOptions([], {}) }), refusal("SEAL_KEY_REQUIRED"));
    assert.deepEqual(sealKey({ ...remote, sealKey: sealKeyOptions(["--no-seal-key"], {}) }), { status: "skipped", details: { reason: "--no-seal-key" } });
    const written = [];
    const write = process.stderr.write;
    process.stderr.write = (chunk) => { written.push(String(chunk)); return true; };
    try {
      assert.equal(sealKey({ ...remote, remote: null, sealKey: sealKeyOptions([], {}) }).status, "skipped");
    } finally { process.stderr.write = write; }
    assert.match(written.join(""), /warning: seal-key skipped/);
  });
  it("scrubs the DSN, its password and any URL credential from an output tail (review S2)", () => {
    const dsn = "postgresql://postgres.abcd:s3cr3t-pw@aws-0.pooler.supabase.com:5432/postgres?sslmode=require";
    const out = scrubOutput(`connect ${dsn} failed; password s3cr3t-pw; graph neo4j+s://neo4j:graph-pw@h.io`, [dsn]);
    assert.doesNotMatch(out, /s3cr3t-pw|graph-pw/);
    assert.match(out, /neo4j\+s:\/\/neo4j:<redacted>@h\.io/);
  });
  it("skips without a key, refuses half a key or a missing file before any connection", () => {
    const ctx = (sealKey) => ({ ksRoot: dir, pg: { dsn: "postgresql://postgres:x@127.0.0.1:1/none" }, sealKey });
    assert.equal(sealKey(ctx({ issuer: "knowledge-services" })).status, "skipped");
    assert.throws(() => sealKey(ctx({ keyId: "ks-seal-a", issuer: "knowledge-services" })), refusal("SEAL_KEY_INCOMPLETE"));
    assert.throws(() => sealKey(ctx({ keyFile: join(dir, "x.pem"), issuer: "knowledge-services" })), refusal("SEAL_KEY_INCOMPLETE"));
    assert.throws(() => sealKey(ctx({ keyId: "ks-seal-a", keyFile: join(dir, "missing.pem"), issuer: "knowledge-services" })), refusal("SEAL_KEY_FILE_MISSING"));
  });
  it("registers the public half on a real biotech component: applied, current, conflict, rotation", { skip: !(SEAL_ADMIN && sealKsReady) && "set INSTALL_SEAL_PG_ADMIN_DSN (loopback) with a KS checkout whose dist is built (BKS_TEST_KS_ROOT)" }, async () => {
    const pg = createRequire(join(ROOT, "packages", "kg-ops", "package.json"))("pg");
    const database = `bks_seal_${randomUUID().slice(0, 8)}`;
    const admin = new pg.Client({ connectionString: SEAL_ADMIN }); await admin.connect();
    await admin.query(`create database ${database}`);
    const url = new URL(SEAL_ADMIN); url.pathname = `/${database}`;
    const dsn = url.toString();
    try {
      const install = spawnSync(process.execPath, [componentCli(sealKsRoot), "install", "--admin-dsn-env", "KDB_INSTALL_ADMIN_DSN",
        "--installation-id", randomUUID(), "--application", PINS.component.application, "--binding", PINS.component.binding,
        "--applied-by", "install-target.test.mjs"], { env: { ...process.env, KDB_INSTALL_ADMIN_DSN: dsn }, encoding: "utf8" });
      assert.equal(install.status, 0, install.stderr);
      const ctx = (sealKey) => ({ ksRoot: sealKsRoot, pg: { dsn }, sealKey: { issuer: "knowledge-services", ...sealKey } });
      const keyFile = sealPem(dir, "executor.pem");
      const applied = sealKey(ctx({ keyId: "ks-seal-d25", keyFile }));
      assert.equal(applied.status, "applied");
      assert.equal(applied.details.keyId, "ks-seal-d25");
      assert.match(applied.details.publicKeySha256, /^sha256:[0-9a-f]{64}$/);
      assert.doesNotMatch(JSON.stringify(applied), /PRIVATE KEY/);
      assert.equal(sealKey(ctx({ keyId: "ks-seal-d25", keyFile })).status, "current");
      assert.throws(() => sealKey(ctx({ keyId: "ks-seal-d25", keyFile: sealPem(dir, "other.pem") })), refusal("SEAL_KEY_CONFLICT"));
      const rotated = sealKey(ctx({ keyId: "ks-seal-d25-2", keyFile: sealPem(dir, "next.pem"), retire: "ks-seal-d25" }));
      assert.deepEqual(rotated.details.retired, [{ keyId: "ks-seal-d25", status: "applied" }]);
      const c = new pg.Client({ connectionString: dsn }); await c.connect();
      const keys = (await c.query("select key_id, status from knowledge_verification.seal_signing_key order by key_id")).rows;
      await c.end();
      assert.deepEqual(keys, [{ key_id: "ks-seal-d25", status: "retiring" }, { key_id: "ks-seal-d25-2", status: "active" }]);
    } finally {
      await admin.query(`drop database if exists ${database} with (force)`);
      await admin.end();
    }
  });
});

// ------------------------------------------------------------------------------------------- real PostgreSQL (+ graph)
const ADMIN = process.env.INSTALL_WIPE_PG_ADMIN_DSN;
const GRAPH_URI = process.env.NEO4J_TEST_URI;
const withGraph = Boolean(GRAPH_URI && process.env.NEO4J_TEST_PASSWORD) && /^neo4j:\/\/(localhost|127\.0\.0\.1):\d+$/.test(GRAPH_URI);
const realReady = Boolean(ADMIN) && existsSync(missionDb) && existsSync(ksCli);
describe(`real installer in remote-reinstall mode${withGraph ? " with the local graph" : " (graph absent: --skip-graph, interrupt before graph-release)"}`, { skip: !realReady && "set INSTALL_WIPE_PG_ADMIN_DSN (loopback) with MC .venv and KS dist built" }, () => {
  const suffix = randomUUID().slice(0, 8);
  const database = `disposable_bwipe_${suffix}`;
  const ref = `disposable-bwipe-${suffix}`;
  const id = randomUUID();
  const componentId = randomUUID();
  const dir = join(scratch, suffix);
  const evidence = join(dir, "evidence");
  const graphHostName = withGraph ? new URL(GRAPH_URI).hostname : null;
  let pg;
  let dsn;
  let targetPath;
  const sql = async (text, params) => {
    const c = new pg.Client({ connectionString: dsn }); await c.connect();
    try { return (await c.query(text, params)).rows; } finally { await c.end(); }
  };
  const schemaPresent = async (name) => (await sql("select 1 from pg_namespace where nspname = $1", [name])).length === 1;
  const graphArgs = () => (withGraph ? ["--neo4j-uri", GRAPH_URI, "--neo4j-password-env", "NEO4J_TEST_PASSWORD", "--confirm-graph", graphHostName] : ["--skip-graph"]);
  const wipeArgs = (extra = []) => ["wipe", "--target", targetPath, "--confirm-target", `${ref}:${id}`, ...graphArgs(), "--evidence-dir", evidence, ...mcRootArgs, ...extra];
  const dryRun = (extra = []) => main(wipeArgs(["--dry-run", ...extra]));
  // A real wipe: its own fresh dry-run first (F1), then the wipe from that receipt.
  const wipeNow = async (extra = []) => {
    const dry = await dryRun(extra);
    assert.equal(dry.status, "dry-run-clear", JSON.stringify(dry.blockers));
    return main(wipeArgs([...extra, "--from-dry-run", dry.path]));
  };
  const executorEnv = () => ({
    KS_KNOWLEDGE_BINDINGS_JSON: JSON.stringify([{ application: "biotech", binding: "biotech-graph", installationId: componentId, databaseUrlEnv: "INSTALL_WIPE_TARGET_DSN" }]),
    KS_BIOTECH_EXECUTOR_URL: "http://127.0.0.1:1", KS_BIOTECH_EXECUTOR_TOKEN: "test", KS_BIOTECH_EXECUTOR_READ_TOKEN: "test",
    BKS_BIOTECH_GRAPH_URI: GRAPH_URI ?? "neo4j://localhost:7690", BKS_BIOTECH_GRAPH_USERNAME: "neo4j", BKS_BIOTECH_GRAPH_PASSWORD: process.env.NEO4J_TEST_PASSWORD ?? "",
    BKS_EXECUTOR_TOKENS: "test", BKS_BIOTECH_DB_VERIFICATION_DSN: "test", BKS_VERIFICATION_TENANTS: "test",
  });
  const stopAt = withGraph ? [] : ["--interrupt-after", "mission-control"];
  const install = (stateDir, extra = []) => {
    const args = ["scripts/install-biotech.mjs", "--remote-reinstall", "--no-seal-key", "--target", targetPath, "--confirm-target", `${ref}:${id}`,
      "--component-installation-id", componentId, "--state-dir", stateDir,
      ...(withGraph ? ["--neo4j-uri", GRAPH_URI, "--neo4j-password-env", "NEO4J_TEST_PASSWORD", "--confirm-graph", graphHostName] : ["--neo4j-uri", "neo4j://localhost:7690", "--confirm-graph", "localhost"]), ...mcRootArgs, ...extra];
    const r = spawnSync(process.execPath, args, { cwd: ROOT, env: { ...process.env, ...executorEnv() }, encoding: "utf8", windowsHide: true, timeout: 900_000 });
    assert.ok(!(r.stdout + r.stderr).includes(dsn), "no credential in installer output");
    let body = null;
    try { body = JSON.parse(r.stdout.trim().split("\n").at(-1)); } catch { /* crashed */ }
    return { status: r.status, body, out: (r.stdout + r.stderr).slice(-800) };
  };
  const journal = (stateDir) => readFileSync(join(stateDir, "progress.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const graphSession = async (cypher) => {
    const { GraphClient } = await import(pathToFileURL(join(ROOT, "packages", "kg-ops", "dist", "index.js")).href);
    const c = new GraphClient({ uri: GRAPH_URI, username: "neo4j", password: process.env.NEO4J_TEST_PASSWORD, database: "neo4j" });
    try { const s = c.session("WRITE"); const r = await s.run(cypher); await s.close(); return r.records.map((x) => x.toObject()); } finally { await c.close(); }
  };
  const graphNodes = async () => Number((await graphSession("MATCH (n) RETURN count(n) AS n"))[0].n);

  before(async () => {
    pg = createRequire(join(ROOT, "packages", "kg-ops", "package.json"))("pg");
    assert.ok(["127.0.0.1", "localhost"].includes(new URL(ADMIN).hostname), "loopback only");
    const admin = new pg.Client({ connectionString: ADMIN }); await admin.connect();
    await admin.query(`create database ${database}`); await admin.end();
    const url = new URL(ADMIN); url.pathname = `/${database}`; url.hostname = "127.0.0.1";
    dsn = url.toString();
    process.env.INSTALL_WIPE_TARGET_DSN = dsn;
    process.env.BKS_BIOTECH_GRAPH_URI = GRAPH_URI ?? "neo4j://localhost:7690";
    targetPath = writeTarget(dir, "target.toml", { ref, id, port: Number(url.port || 5432), user: decodeURIComponent(url.username), database });
    if (withGraph) await graphSession("MATCH (n) DETACH DELETE n");
  });
  after(async () => {
    delete process.env.BKS_BIOTECH_GRAPH_URI;
    if (!pg) return;
    const admin = new pg.Client({ connectionString: ADMIN }); await admin.connect();
    await admin.query(`drop database if exists ${database} with (force)`); await admin.end();
  });

  it("refuses SEAL_KEY_REQUIRED after the identity gates and before any write without a seal key or --no-seal-key", async () => {
    const stateDir = join(dir, "install-noseal");
    const env = { ...process.env, ...executorEnv() };
    for (const name of ["KS_KNOWLEDGE_SEAL_KEY_ID", "KS_KNOWLEDGE_SEAL_KEY_FILE"]) delete env[name];
    const r = spawnSync(process.execPath, ["scripts/install-biotech.mjs", "--remote-reinstall", "--target", targetPath, "--confirm-target", `${ref}:${id}`,
      "--component-installation-id", componentId, "--state-dir", stateDir, "--neo4j-uri", "neo4j://localhost:7690", "--confirm-graph", "localhost", ...mcRootArgs],
    { cwd: ROOT, env, encoding: "utf8", windowsHide: true, timeout: 900_000 });
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stdout + r.stderr, /SEAL_KEY_REQUIRED/);
    assert.ok(!existsSync(stateDir), "no state, lock or receipt");
    const c = new pg.Client({ connectionString: dsn }); await c.connect();
    const schemas = (await c.query("select count(*)::int as n from pg_namespace where nspname in ('knowledge_verification', 'mission_control')")).rows[0].n;
    await c.end();
    assert.equal(schemas, 0, "nothing installed");
  });

  it("interrupted fresh install: crash mid-run leaves the lock, the rerun takes it over and completes", async () => {
    const stateDir = join(dir, "install-1");
    const crashed = install(stateDir, ["--interrupt-after", "component"]);
    assert.notEqual(crashed.status, 0, crashed.out);
    assert.ok(existsSync(join(stateDir, "install.lock")));
    const resumed = install(stateDir, stopAt);
    const events = journal(stateDir);
    assert.deepEqual(events.filter((e) => e.event === "start").map((e) => [e.mode, e.resumedAfterInterruption]), [["remote-reinstall", false], ["remote-reinstall", true]]);
    assert.deepEqual(events.filter((e) => e.step === "component").map((e) => e.status), ["applied", "current"]);
    assert.equal(events.find((e) => e.step === "mission-control").status, "applied");
    if (withGraph) {
      assert.equal(resumed.status, 0, resumed.out);
      assert.equal(resumed.body.changed, true);
      assert.ok(resumed.body.steps.includes("graph-release:applied"));
    } else assert.notEqual(resumed.status, 0);
  });
  it("repeat install observes changed: false", async () => {
    const stateDir = join(dir, "install-2");
    const repeat = install(stateDir, stopAt);
    const statuses = journal(stateDir).filter((e) => e.event === "step").map((e) => `${e.step}:${e.status}`);
    assert.deepEqual(statuses.slice(0, 5), ["preflight:checked", "component:current", "component-grants:current", "seal-key:skipped", "mission-control:current"]);
    if (withGraph) { assert.equal(repeat.status, 0, repeat.out); assert.equal(repeat.body.changed, false); }
  });
  it("dry-run of a remote-like state (legacy capability_search, sessions, graph content) changes nothing", async () => {
    await sql("create schema capability_search; create table capability_search.documents (id int); insert into capability_search.documents values (1)");
    if (withGraph) await graphSession("CREATE (:Compound {name: 'x'})-[:RELATES_TO]->(:Gene {symbol: 'y'})");
    const other = new pg.Client({ connectionString: dsn, application_name: "other-session" }); await other.connect();
    const rest = new pg.Client({ connectionString: dsn, application_name: "postgrest" }); await rest.connect();
    try {
      const receipt = await dryRun();
      assert.equal(receipt.status, "dry-run-blocked");
      assert.equal(receipt.identity.status, "matched");
      assert.deepEqual(receipt.blockers.map((b) => `${b.step}:${b.code}`), ["sessions:WIPE_SESSIONS_ACTIVE"]);
      // Locally both log in as the container superuser, so neither is allowlisted (only postgres + PostgREST is).
      assert.deepEqual(receipt.blockers[0].objects.map((o) => o.split(":").at(-1)).sort(), ["other-session", "postgrest"]);
      assert.ok(receipt.sessions.every((s) => typeof s.backend_start === "string" && !("query" in s) && s.backend_type === "client backend"));
      assert.deepEqual(receipt.steps.filter((s) => s.step.startsWith("schema:")).map((s) => `${s.step}:${s.status}`),
        ["schema:knowledge_service:absent", "schema:knowledge_verification:would-drop", "schema:capability_search:would-drop", "schema:mission_control_runtime:absent", "schema:mission_control_search:would-drop", "schema:mission_control:would-drop"]);
      assert.deepEqual(receipt.steps.find((s) => s.step === "schema:capability_search").relations, ["documents"]);
      if (withGraph) {
        const graph = receipt.steps.find((s) => s.step === "graph");
        assert.equal(graph.status, "would-delete");
        assert.equal(graph.labels.Compound, 1);
        assert.ok(graph.markersBefore.includes("biotech-schema-v2.2.0"));
      }
      assert.match(readFileSync(receipt.summaryPath, "utf8"), /lock_timeout: 5 s/);
      for (const s of ["knowledge_verification", "capability_search", "mission_control"]) assert.ok(await schemaPresent(s), s);
      await assert.rejects(main(wipeArgs(["--from-dry-run", receipt.path])), refusal("WIPE_DRY_RUN_BLOCKED"));
    } finally { await other.end(); await rest.end(); }
    if (withGraph) assert.equal((await graphSession("MATCH (n:Compound) RETURN count(n) AS n"))[0].n.toNumber(), 1);
  });
  it("F1: no receipt, a changed graph, or a late blocker commits nothing", async () => {
    await assert.rejects(main(wipeArgs()), refusal("WIPE_DRY_RUN_REQUIRED"));
    const clean = await dryRun();
    assert.equal(clean.status, "dry-run-clear", JSON.stringify(clean.blockers));
    if (withGraph) {
      await graphSession("CREATE (:Compound {name: 'late'})");
      await assert.rejects(main(wipeArgs(["--from-dry-run", clean.path])), (e) => refusal("WIPE_DRY_RUN_MISMATCH")(e) && /nothing was changed/.test(e.detail));
      await graphSession("MATCH (n:Compound {name: 'late'}) DETACH DELETE n");
    }
    await sql(`do $do$ begin if not exists (select 1 from pg_roles where rolname = 'wipe_test_owner_b') then create role wipe_test_owner_b nologin; end if; end $do$;
      alter schema mission_control owner to wipe_test_owner_b`);
    try {
      await assert.rejects(main(wipeArgs(["--from-dry-run", clean.path])), (e) => refusal("WIPE_PLAN_BLOCKED")(e) && /schema:mission_control:WIPE_SCHEMA_OWNER_UNEXPECTED/.test(e.detail));
      for (const s of ["knowledge_verification", "capability_search", "mission_control_search", "mission_control"]) assert.ok(await schemaPresent(s), s);
      if (withGraph) assert.ok((await graphNodes()) > 0, "graph untouched");
    } finally {
      await sql("alter schema mission_control owner to current_user; drop role wipe_test_owner_b");
    }
  });
  it("refuses when live identity disagrees with target.toml, touching nothing", async () => {
    const otherId = randomUUID();
    const url = new URL(dsn);
    const other = writeTarget(dir, "other.toml", { ref, id: otherId, port: Number(url.port || 5432), user: decodeURIComponent(url.username), database });
    await assert.rejects(main(["wipe", "--dry-run", "--target", other, "--confirm-target", `${ref}:${otherId}`, "--skip-graph", "--evidence-dir", evidence]), refusal("TARGET_IDENTITY_MISMATCH"));
    assert.ok(await schemaPresent("mission_control"));
  });
  it("dry-run blocks a cascade that would remove a column outside the allow-list", async () => {
    await sql("create type knowledge_verification.wipe_probe as enum ('a'); create table public.uses_probe (id int, p knowledge_verification.wipe_probe)");
    const dry = await main(["wipe", "--dry-run", "--target", targetPath, "--confirm-target", `${ref}:${id}`, "--skip-graph", "--evidence-dir", evidence]);
    assert.ok(dry.blockers.some((b) => b.step === "schema:knowledge_verification" && b.objects?.includes("column public.uses_probe.p")), JSON.stringify(dry.blockers));
    assert.ok(await schemaPresent("knowledge_verification"));
    await sql("drop table public.uses_probe; drop type knowledge_verification.wipe_probe");
  });
  it("wipes PostgreSQL first, then the graph, with a secret-free receipt", async () => {
    const receipt = await wipeNow(["--actor", "install-target.test"]);
    assert.equal(receipt.status, "complete");
    assert.equal(receipt.changed, true);
    assert.equal(receipt.preCheck.inventoryDigest, receipt.fromDryRun.inventoryDigest);
    assert.deepEqual(receipt.steps.map((s) => `${s.step}:${s.status}`), ["schema:knowledge_service:absent", "schema:knowledge_verification:dropped", "schema:capability_search:dropped",
      "schema:mission_control_runtime:absent", "schema:mission_control_search:dropped", "schema:mission_control:dropped", ...(withGraph ? ["graph:deleted"] : [])]);
    for (const s of WIPE_SCHEMAS) assert.equal(await schemaPresent(s), false, s);
    assert.ok(await schemaPresent("extensions"));
    if (withGraph) assert.equal(receipt.steps.at(-1).nodesAfter, 0);
    const text = readFileSync(receipt.path, "utf8");
    assert.ok(!text.includes(dsn) && !text.includes(decodeURIComponent(new URL(dsn).password)), "no credential");
    if (process.env.NEO4J_TEST_PASSWORD) assert.ok(!text.includes(process.env.NEO4J_TEST_PASSWORD), "no graph password");
    assert.equal(spawnSync("git", ["-C", ROOT, "check-ignore", "-q", receipt.path]).status, 0, "receipt is git-ignored");
    const journalText = readFileSync(receipt.path.replace(/\.json$/, ".journal.jsonl"), "utf8");
    assert.ok(journalText.indexOf('"step":"pre-check"') < journalText.indexOf('"step":"schema:mission_control"'));
    if (withGraph) assert.ok(journalText.indexOf('"step":"schema:mission_control"') < journalText.indexOf('"step":"graph"'), "graph after PostgreSQL");
  });
  it("is idempotent: a re-wipe finds nothing, proving identity by route", async () => {
    const receipt = await wipeNow();
    assert.equal(receipt.identity.status, "absent");
    assert.equal(receipt.changed, false);
    assert.ok(receipt.steps.filter((s) => s.step.startsWith("schema:")).every((s) => s.status === "absent"));
    if (withGraph) assert.equal(receipt.steps.at(-1).status, "empty");
  });
  it("graph content without a marker refuses unless --allow-unmarked-graph", { skip: !withGraph }, async () => {
    await graphSession("CREATE (:Stray {id: 1})");
    await assert.rejects(dryRun(), refusal("GRAPH_UNMARKED"));
    assert.equal(await graphNodes(), 1);
    const receipt = await wipeNow(["--allow-unmarked-graph"]);
    assert.equal(receipt.steps.at(-1).status, "deleted");
  });
  it("fresh after wipe (no mission_control, no identity row) is gated by identity evidence, re-creates the same installation id and applies v2.2.0 to the empty graph", async () => {
    assert.equal(await schemaPresent("mission_control"), false);
    const sysid = (await sql("select system_identifier::text as id from pg_control_system()"))[0].id;
    const evidenceFile = join(dir, "reinstall-evidence.json");
    const write = (over = {}) => writeFileSync(evidenceFile, JSON.stringify({ source: "management-api", project_ref: ref, name: ref, region: "local", installation_id: id, system_identifier: sysid, observed_at: new Date().toISOString(), ...over }));
    write({ system_identifier: "7000000000000000000" });
    const wrong = install(join(dir, "install-3-wrong"), ["--identity-evidence", evidenceFile, ...stopAt]);
    assert.equal(wrong.status, 2);
    assert.equal(wrong.body.code, "TARGET_SYSTEM_IDENTIFIER_MISMATCH");
    write();
    if (withGraph) assert.equal(await graphNodes(), 0, "the wipe left an empty graph");
    const fresh = install(join(dir, "install-3"), ["--identity-evidence", evidenceFile, ...stopAt]);
    const statuses = journal(join(dir, "install-3")).filter((e) => e.event === "step").map((e) => `${e.step}:${e.status}`);
    assert.deepEqual(statuses.slice(1, 5), ["component:applied", "component-grants:current", "seal-key:skipped", "mission-control:applied"]);
    assert.deepEqual((await sql("select installation_id::text as id from mission_control.application_installation")).map((r) => r.id), [id]);
    if (withGraph) {
      assert.equal(fresh.status, 0, fresh.out);
      assert.equal(fresh.body.changed, true);
      assert.ok(fresh.body.steps.includes("graph-release:applied"));
      const markers = await graphSession("MATCH (m:KsReleaseMarker) RETURN m.releaseId AS releaseId");
      assert.deepEqual(markers.map((m) => m.releaseId), ["biotech-schema-v2.2.0"]);
      const receipt = JSON.parse(readFileSync(join(dir, "install-3", "install-receipt.json"), "utf8"));
      assert.equal(receipt.target.postgres.identity.status, "evidence");
      assert.equal(receipt.pins.missionControl.version, "1.9.0");
      const again = install(join(dir, "install-4"), ["--identity-evidence", evidenceFile]);
      assert.equal(again.status, 0, again.out);
      assert.equal(again.body.changed, false);
    }
  });
});

describe("real PostgreSQL: legacy Mission Control (0034) needs identity evidence bound to the database", { skip: !realReady && "set INSTALL_WIPE_PG_ADMIN_DSN" }, () => {
  const suffix = randomUUID().slice(0, 8);
  const database = `disposable_blegacy_${suffix}`;
  const ref = `disposable-blegacy-${suffix}`;
  const id = randomUUID();
  const dir = join(scratch, `legacy-${suffix}`);
  let pg;
  let dsn;
  let targetPath;
  let systemIdentifier;
  const sql = async (text) => { const c = new pg.Client({ connectionString: dsn }); await c.connect(); try { return (await c.query(text)).rows; } finally { await c.end(); } };
  const args = (extra) => ["wipe", "--target", targetPath, "--confirm-target", `${ref}:${id}`, "--skip-graph", "--evidence-dir", join(dir, "evidence"), ...extra];
  const evidenceFile = (over = {}) => {
    const path = join(dir, `ev-${randomUUID().slice(0, 6)}.json`);
    writeFileSync(path, JSON.stringify({ source: "management-api", project_ref: ref, name: "biotech-legacy", region: "local", installation_id: id, system_identifier: systemIdentifier, observed_at: new Date().toISOString(), ...over }));
    return path;
  };
  before(async () => {
    pg = createRequire(join(ROOT, "packages", "kg-ops", "package.json"))("pg");
    const admin = new pg.Client({ connectionString: ADMIN }); await admin.connect();
    await admin.query(`create database ${database}`); await admin.end();
    const url = new URL(ADMIN); url.pathname = `/${database}`; url.hostname = "127.0.0.1";
    dsn = url.toString();
    process.env.INSTALL_WIPE_TARGET_DSN = dsn;
    targetPath = writeTarget(dir, "target.toml", { ref, id, port: Number(url.port || 5432), user: decodeURIComponent(url.username), database, label: "biotech-legacy" });
    await sql(`create schema mission_control; create table mission_control.component_release (component_version text, migration_key text primary key, migration_digest text);
      insert into mission_control.component_release select '1.3.' || g, lpad(g::text, 4, '0') || '_legacy', md5(g::text) from generate_series(1, 34) g;
      create schema capability_search; create table capability_search.generations (id int); create table capability_search.schema_migrations (v text);`);
    systemIdentifier = (await sql("select system_identifier::text as id from pg_control_system()"))[0].id;
  });
  after(async () => {
    if (!pg) return;
    const admin = new pg.Client({ connectionString: ADMIN }); await admin.connect();
    await admin.query(`drop database if exists ${database} with (force)`); await admin.end();
  });
  it("refuses without, with stale, wrong or other-database evidence; with bound evidence it dry-runs, then wipes", async () => {
    await assert.rejects(main(args(["--dry-run"])), refusal("TARGET_IDENTITY_UNPROVEN"));
    await assert.rejects(main(args(["--dry-run", "--identity-evidence", evidenceFile({ observed_at: new Date(Date.now() - 48 * 3600e3).toISOString() })])), refusal("TARGET_IDENTITY_UNPROVEN"));
    await assert.rejects(main(args(["--dry-run", "--identity-evidence", evidenceFile({ name: "someone-else" })])), refusal("TARGET_IDENTITY_UNPROVEN"));
    await assert.rejects(main(args(["--dry-run", "--identity-evidence", evidenceFile({ system_identifier: "7000000000000000000" })])), refusal("TARGET_SYSTEM_IDENTIFIER_MISMATCH"));
    const ev = evidenceFile();
    const dry = await main(args(["--dry-run", "--identity-evidence", ev]));
    assert.equal(dry.identity.status, "evidence");
    assert.equal(dry.identity.legacyMissionControl, "0034_legacy");
    assert.equal(dry.identity.evidence.system_identifier, systemIdentifier);
    assert.equal(dry.status, "dry-run-clear");
    const done = await main(args(["--identity-evidence", ev, "--from-dry-run", dry.path]));
    assert.equal(done.status, "complete");
    assert.deepEqual(done.steps.filter((s) => s.status === "dropped").map((s) => s.step), ["schema:capability_search", "schema:mission_control"]);
  });
});

// ------------------------------------------------------------------------- component-grants as a Supabase-like admin
// The remote admin `postgres` is not a superuser: CREATEROLE, CREATEDB, BYPASSRLS, and (PostgreSQL 16+) it holds the
// component roles it created WITH ADMIN only. A throwaway login of that shape installs the component; `set local role`
// is denied until component-grants, then allowed for each bounded role, and a repeat changes nothing.
describe("real PostgreSQL: component-grants for a non-superuser admin login (OVE-168)", { skip: !realReady && "set INSTALL_WIPE_PG_ADMIN_DSN" }, () => {
  const suffix = randomUUID().slice(0, 8);
  const database = `disposable_bgrant_${suffix}`;
  const ref = `disposable-bgrant-${suffix}`;
  const login = `bks_grant_admin_${suffix}`;
  const dedicated = `bks_grant_exec_${suffix}`;
  const drifted = `bks_grant_drift_${suffix}`;
  const password = randomUUID();
  const id = randomUUID();
  const componentId = randomUUID();
  const dir = join(scratch, `grants-${suffix}`);
  let pg;
  let dsn;
  let targetPath;
  const asAdmin = async (text, db = "postgres") => {
    const url = new URL(ADMIN); url.pathname = `/${db}`;
    const c = new pg.Client({ connectionString: url.toString() }); await c.connect();
    try { return (await c.query(text)).rows; } finally { await c.end(); }
  };
  const asLogin = async (fn) => { const c = new pg.Client({ connectionString: dsn }); await c.connect(); try { return await fn(c); } finally { await c.end(); } };
  const memberships = (member) => asLogin(async (c) => (await c.query(`select g.rolname as role, pg_get_userbyid(m.grantor) as grantor, m.admin_option as admin,
      m.inherit_option as inherit, m.set_option as set from pg_auth_members m join pg_roles g on g.oid = m.roleid
     where m.member = (select oid from pg_roles where rolname = $1) and g.rolname like 'knowledge_verification_%' order by 1, 2`, [member])).rows);
  const setRole = (role) => asLogin(async (c) => {
    await c.query("begin");
    try { await c.query(`set local role "${role}"`); return (await c.query("select current_user::text as u")).rows[0].u; } finally { await c.query("rollback"); }
  });
  const run = (stateDir, stopAfter, extra = []) => {
    const r = spawnSync(process.execPath, ["scripts/install-biotech.mjs", "--remote-reinstall", "--no-seal-key", "--target", targetPath, "--confirm-target", `${ref}:${id}`,
      "--component-installation-id", componentId, "--state-dir", stateDir, "--neo4j-uri", "neo4j://localhost:7690", "--confirm-graph", "localhost",
      "--interrupt-after", stopAfter, ...mcRootArgs, ...extra], { cwd: ROOT, env: { ...process.env, INSTALL_GRANT_TARGET_DSN: dsn }, encoding: "utf8", windowsHide: true, timeout: 900_000 });
    assert.ok(!(r.stdout + r.stderr).includes(password), "no credential in installer output");
    const journal = existsSync(join(stateDir, "progress.jsonl")) ? readFileSync(join(stateDir, "progress.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l)) : [];
    let body = null;
    try { body = JSON.parse(r.stdout.trim().split("\n").at(-1)); } catch { /* interrupted */ }
    return { status: r.status, body, out: (r.stdout + r.stderr).slice(-1200), steps: journal.filter((e) => e.event === "step").map((e) => `${e.step}:${e.status}`) };
  };

  before(async () => {
    pg = createRequire(join(ROOT, "packages", "kg-ops", "package.json"))("pg");
    await asAdmin(`create role ${login} login password '${password}' createrole createdb bypassrls`);
    await asAdmin(`create database ${database} owner ${login}`);
    // Roles are cluster-wide: where an earlier install created them, give this login the membership PostgreSQL 16+
    // records when a CREATEROLE non-superuser creates a role (ADMIN only, granted by a superuser).
    const existing = (await asAdmin(`select rolname from pg_roles where rolname like 'knowledge_verification_%'`)).map((r) => r.rolname);
    for (const role of existing) await asAdmin(`grant "${role}" to ${login} with admin true, inherit false, set false`);
    const url = new URL(ADMIN); url.pathname = `/${database}`; url.hostname = "127.0.0.1"; url.username = login; url.password = password;
    dsn = url.toString();
    targetPath = writeTarget(dir, "target.toml", { ref, id, port: Number(url.port || 5432), user: login, database, env: "INSTALL_GRANT_TARGET_DSN" });
  });
  after(async () => {
    if (!pg) return;
    await asAdmin(`drop database if exists ${database} with (force)`);
    for (const role of [dedicated, drifted, login]) await asAdmin(`drop role if exists ${role}`);
  });

  it("the component installs as the admin login, whose set local role is then denied", async () => {
    const first = run(join(dir, "install-1"), "component");
    assert.deepEqual(first.steps, ["preflight:checked", "component:applied"], first.out);
    for (const m of await memberships(login)) assert.deepEqual([m.admin, m.inherit, m.set], [true, false, false], JSON.stringify(m));
    await assert.rejects(setRole("knowledge_verification_reader"), (e) => e.code === "42501" && /permission denied to set role/.test(e.message));
  });
  it("component-grants adds one SET-only self-granted row per role; set local role then works for each", async () => {
    const r = run(join(dir, "install-2"), "component-grants");
    assert.deepEqual(r.steps, ["preflight:checked", "component:current", "component-grants:applied"], r.out);
    const rows = await memberships(login);
    for (const role of COMPONENT_SET_ROLES) {
      const own = rows.filter((m) => m.role === role);
      assert.equal(own.length, 2, JSON.stringify(own));
      assert.ok(own.some((m) => m.admin && !m.inherit && !m.set), "the ADMIN-only row stays");
      assert.ok(own.some((m) => m.grantor === login && !m.admin && !m.inherit && m.set), "self-granted SET row");
      assert.equal(await setRole(role), role);
    }
  });
  it("repeat is current and changes no membership", async () => {
    const before_ = await memberships(login);
    const r = run(join(dir, "install-3"), "component-grants");
    assert.deepEqual(r.steps, ["preflight:checked", "component:current", "component-grants:current"], r.out);
    assert.deepEqual(await memberships(login), before_);
  });
  it("--component-login: a dedicated login gets SET-only rows granted by the admin; drift and superusers are refused", async () => {
    await asLogin((c) => c.query(`create role ${dedicated} login noinherit; create role ${drifted} login;
      grant knowledge_verification_reader to ${drifted} with inherit true, set true`));
    const r = run(join(dir, "install-4"), "component-grants", ["--component-login", dedicated]);
    assert.deepEqual(r.steps.at(-1), "component-grants:applied", r.out);
    assert.deepEqual((await memberships(dedicated)).map((m) => [m.role, m.grantor, m.admin, m.inherit, m.set]),
      [...COMPONENT_SET_ROLES].sort().map((role) => [role, login, false, false, true]));
    assert.equal(run(join(dir, "install-5"), "component-grants", ["--component-login", dedicated]).steps.at(-1), "component-grants:current");
    const drift = run(join(dir, "install-6"), "component-grants", ["--component-login", drifted]);
    assert.equal(drift.status, 2, drift.out);
    assert.equal(drift.body.code, "GRANTS_DRIFT");
    assert.equal((await memberships(drifted)).length, 1, "nothing granted beside the drifted row");
    const superuser = decodeURIComponent(new URL(ADMIN).username);
    const su = run(join(dir, "install-7"), "component-grants", ["--component-login", superuser]);
    assert.equal(su.body?.code, "COMPONENT_LOGIN_SUPERUSER", su.out);
  });
});

// ------------------------------------------------------------------------------------- KS component upgrade in place
// The remotes run KS 2.4.0; the pin is 2.5.0. A copy of this installer that differs only in the KS pin line installs
// 2.4.0 (component tree from KS history); the real installer then upgrades in place and repeats. Without a local
// graph each run stops after the mission-control step (the graph is not part of this proof).
const KS_ROOT = resolve(ROOT, "..", "..", "platform", "knowledge-services");
const KS_240 = { rev: "b45adf5", version: "2.4.0", digest: "sha256:309a8c9b8ac792a9f9cf1d6b9ff1070bba763f6c7113750847680d4c9c5c64c7" };
const ksHistory = spawnSync("git", ["-C", KS_ROOT, "cat-file", "-e", `${KS_240.rev}^{commit}`]).status === 0;
// The component tree at `rev`, byte for byte from git objects (no tar: portable on Windows).
function extractComponent(rev, dest) {
  const prefix = "packages/knowledge-db-contract/component";
  const list = spawnSync("git", ["-C", KS_ROOT, "ls-tree", "-r", "--name-only", rev, prefix], { encoding: "utf8" });
  assert.equal(list.status, 0, "git ls-tree");
  for (const file of list.stdout.split("\n").filter(Boolean)) {
    const blob = spawnSync("git", ["-C", KS_ROOT, "show", `${rev}:${file}`], { maxBuffer: 64 * 1024 * 1024 });
    assert.equal(blob.status, 0, `git show ${file}`);
    mkdirSync(dirname(join(dest, file)), { recursive: true });
    writeFileSync(join(dest, file), blob.stdout);
  }
  return join(dest, ...prefix.split("/"));
}
function pinnedInstallerCopy(dest, pin) {
  let src = readFileSync(join(ROOT, "scripts", "install-biotech.mjs"), "utf8");
  const line = /^export const KS_COMPONENT_PIN = .*$/m;
  assert.match(src, line);
  src = src.replace(line, `export const KS_COMPONENT_PIN = Object.freeze({ version: ${JSON.stringify(pin.version)}, digest: ${JSON.stringify(pin.digest)} });`);
  src = src.replace('} from "./install-target.mjs";', `} from ${JSON.stringify(pathToFileURL(join(ROOT, "scripts", "install-target.mjs")).href)};`);
  src = src.replace('const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");', `const ROOT = ${JSON.stringify(ROOT)};`);
  writeFileSync(dest, src);
  return dest;
}

describe("real PostgreSQL: KS component 2.4.0 → 2.5.0 upgrade in place (with MC 1.9.0)", { skip: (!realReady || !ksHistory) && "needs INSTALL_WIPE_PG_ADMIN_DSN and KS git history" }, () => {
  const suffix = randomUUID().slice(0, 8);
  const database = `disposable_bksup_${suffix}`;
  const ref = `disposable-bksup-${suffix}`;
  const id = randomUUID();
  const componentId = randomUUID();
  const dir = join(scratch, `ksup-${suffix}`);
  let pg;
  let dsn;
  let targetPath;
  let component240;
  let copy;
  const sql = async (text) => { const c = new pg.Client({ connectionString: dsn }); await c.connect(); try { return (await c.query(text)).rows; } finally { await c.end(); } };
  const run = (script, stateDir, extra = []) => {
    const r = spawnSync(process.execPath, [script, "--remote-reinstall", "--no-seal-key", "--target", targetPath, "--confirm-target", `${ref}:${id}`, "--component-installation-id", componentId, "--state-dir", stateDir,
      "--neo4j-uri", "neo4j://localhost:7690", "--confirm-graph", "localhost", "--interrupt-after", "mission-control", ...mcRootArgs, ...extra],
    { cwd: ROOT, env: process.env, encoding: "utf8", windowsHide: true, timeout: 900_000 });
    const journal = existsSync(join(stateDir, "progress.jsonl")) ? readFileSync(join(stateDir, "progress.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l)) : [];
    return { status: r.status, out: (r.stdout + r.stderr).slice(-1200), steps: journal.filter((e) => e.event === "step").map((e) => `${e.step}:${e.status}`) };
  };
  const componentKeys = async () => (await sql("select migration_key from knowledge_verification.component_release order by 1")).map((r) => r.migration_key);

  before(async () => {
    pg = createRequire(join(ROOT, "packages", "kg-ops", "package.json"))("pg");
    const admin = new pg.Client({ connectionString: ADMIN }); await admin.connect();
    await admin.query(`create database ${database}`); await admin.end();
    const url = new URL(ADMIN); url.pathname = `/${database}`; url.hostname = "127.0.0.1";
    dsn = url.toString();
    process.env.INSTALL_WIPE_TARGET_DSN = dsn;
    targetPath = writeTarget(dir, "target.toml", { ref, id, port: Number(url.port || 5432), user: decodeURIComponent(url.username), database });
    component240 = extractComponent(KS_240.rev, join(dir, "ks-2.4.0"));
    copy = pinnedInstallerCopy(join(dir, "install-biotech.ks-2.4.0.mjs"), KS_240);
  });
  after(async () => {
    if (!pg) return;
    const admin = new pg.Client({ connectionString: ADMIN }); await admin.connect();
    await admin.query(`drop database if exists ${database} with (force)`); await admin.end();
  });

  it("installs 2.4.0 + MC 1.9.0, upgrades to 2.5.0 applying only 0008, then repeats with everything current", async () => {
    assert.equal(PINS.component.version, "2.5.0");
    const first = run(copy, join(dir, "install-240"), ["--ks-component-root", component240]);
    assert.deepEqual(first.steps, ["preflight:checked", "component:applied", "component-grants:current", "seal-key:skipped", "mission-control:applied"], first.out);
    assert.equal((await componentKeys()).at(-1), "0007_server_clock_and_required_values_digest");
    const upgrade = run(join(ROOT, "scripts", "install-biotech.mjs"), join(dir, "install-250"));
    assert.deepEqual(upgrade.steps, ["preflight:checked", "component:applied", "component-grants:current", "seal-key:skipped", "mission-control:current"], upgrade.out);
    const keys = await componentKeys();
    assert.equal(keys.length, 8);
    assert.equal(keys.at(-1), "0008_effect_dispatch_journal");
    const repeat = run(join(ROOT, "scripts", "install-biotech.mjs"), join(dir, "install-250-repeat"));
    assert.deepEqual(repeat.steps, ["preflight:checked", "component:current", "component-grants:current", "seal-key:skipped", "mission-control:current"], repeat.out);
  });
});

// ----------------------------------------------------------------------------------- MC common upgrade in place
// The remotes run MC 1.8.0; the pin is 1.9.0. A copy of this installer that differs only in the MC pin (the Sprint OC
// 1.8.0 lock, kept beside the 1.9.0 one) installs 1.8.0; the real installer then upgrades in place and repeats.
const MC_180 = {
  version: "1.8.0",
  lockPath: "docs/specs/provider-consolidation-2026-10/sprint-oc/release/locks-180/biotech/release.lock.json",
  lockFileSha256: "da57143ef5baf2b91f73ef3be1434487521b31fe5699616d03e9e05b1c68016c",
  releaseRoot: "packages/mission-control-db-contract/releases/1.8.0/component",
};
function mcPinnedInstallerCopy(dest, pin) {
  let src = readFileSync(pinnedInstallerCopy(dest, KS_COMPONENT_PIN), "utf8");
  for (const key of ["version", "lockPath", "lockFileSha256", "releaseRoot"]) {
    const field = new RegExp(`(missionControl: \\{[\\s\\S]*?\\n    ${key}: )"[^"]*"`);
    assert.match(src, field);
    src = src.replace(field, `$1${JSON.stringify(pin[key])}`);
  }
  writeFileSync(dest, src);
  return dest;
}

describe("real PostgreSQL: MC common 1.8.0 → 1.9.0 upgrade in place", { skip: (!realReady || !existsSync(join(mcRoot, MC_180.lockPath))) && "needs INSTALL_WIPE_PG_ADMIN_DSN and both Sprint OC locks" }, () => {
  const suffix = randomUUID().slice(0, 8);
  const database = `disposable_bksmc_${suffix}`;
  const ref = `disposable-bksmc-${suffix}`;
  const id = randomUUID();
  const componentId = randomUUID();
  const dir = join(scratch, `mcup-${suffix}`);
  let pg;
  let dsn;
  let targetPath;
  let copy;
  const sql = async (text) => { const c = new pg.Client({ connectionString: dsn }); await c.connect(); try { return (await c.query(text)).rows; } finally { await c.end(); } };
  const run = (script, stateDir) => {
    const r = spawnSync(process.execPath, [script, "--remote-reinstall", "--no-seal-key", "--target", targetPath, "--confirm-target", `${ref}:${id}`, "--component-installation-id", componentId, "--state-dir", stateDir,
      "--neo4j-uri", "neo4j://localhost:7690", "--confirm-graph", "localhost", "--interrupt-after", "mission-control", ...mcRootArgs],
    { cwd: ROOT, env: process.env, encoding: "utf8", windowsHide: true, timeout: 900_000 });
    const journal = existsSync(join(stateDir, "progress.jsonl")) ? readFileSync(join(stateDir, "progress.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l)) : [];
    return { status: r.status, out: (r.stdout + r.stderr).slice(-1200), steps: journal.filter((e) => e.event === "step").map((e) => `${e.step}:${e.status}`), entries: journal };
  };
  const mcKeys = async () => (await sql("select migration_key from mission_control.component_release order by 1")).map((r) => r.migration_key);

  before(async () => {
    pg = createRequire(join(ROOT, "packages", "kg-ops", "package.json"))("pg");
    const admin = new pg.Client({ connectionString: ADMIN }); await admin.connect();
    await admin.query(`create database ${database}`); await admin.end();
    const url = new URL(ADMIN); url.pathname = `/${database}`; url.hostname = "127.0.0.1";
    dsn = url.toString();
    process.env.INSTALL_WIPE_TARGET_DSN = dsn;
    targetPath = writeTarget(dir, "target.toml", { ref, id, port: Number(url.port || 5432), user: decodeURIComponent(url.username), database });
    copy = mcPinnedInstallerCopy(join(dir, "install-biotech.mc-1.8.0.mjs"), MC_180);
  });
  after(async () => {
    if (!pg) return;
    const admin = new pg.Client({ connectionString: ADMIN }); await admin.connect();
    await admin.query(`drop database if exists ${database} with (force)`); await admin.end();
  });

  it("installs MC 1.8.0, upgrades to 1.9.0 applying only 0066 and 0067, then repeats with everything current", async () => {
    assert.equal(PINS.missionControl.version, "1.9.0");
    const first = run(copy, join(dir, "install-180"));
    assert.deepEqual(first.steps, ["preflight:checked", "component:applied", "component-grants:current", "seal-key:skipped", "mission-control:applied"], first.out);
    assert.equal((await mcKeys()).at(-1), "0064_search_extension_privileges");
    const upgrade = run(join(ROOT, "scripts", "install-biotech.mjs"), join(dir, "install-190"));
    assert.deepEqual(upgrade.steps, ["preflight:checked", "component:current", "component-grants:current", "seal-key:skipped", "mission-control:applied"], upgrade.out);
    const installed = (await mcKeys()).length;
    assert.deepEqual((await mcKeys()).slice(-2), ["0066_collection_member_assessments", "0067_knowledge_handle_trusted_operations"]);
    assert.equal(installed, 58);
    assert.match((await sql("select pg_get_constraintdef(oid) as d from pg_constraint where conname = 'knowledge_operation_handle_operation_check'"))[0].d, /'report[.]observe'/);
    const repeat = run(join(ROOT, "scripts", "install-biotech.mjs"), join(dir, "install-190-repeat"));
    assert.deepEqual(repeat.steps, ["preflight:checked", "component:current", "component-grants:current", "seal-key:skipped", "mission-control:current"], repeat.out);
  });
});
