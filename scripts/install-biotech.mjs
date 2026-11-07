#!/usr/bin/env node
// Biotech root installer (Sprint V SV-17). One ordered, idempotent, interrupt-safe install of what the Biotech
// application needs, against DISPOSABLE loopback targets only (a PostgreSQL database named disposable_* and a local
// Neo4j; Aura and remote hosts are refused):
//
//   1. preflight        pins (KS component version + digest, MC lock file digest, BKS pinned release byte-verified)
//   2. component        knowledge_verification for application `biotech`, binding `biotech-graph`, via the KS CLI
//   3. component-grants the executor's component login may SET (never inherit, never administer) each bounded
//                       knowledge_verification_* role the KS bindings switch to per transaction (OVE-168). Default
//                       login: the component DSN's session user; `--component-login <name>` names a dedicated one.
//                       Biotech has no domain roles to carry them (AI Engineer reaches them through its own), and on
//                       PostgreSQL 16+ a non-superuser CREATEROLE admin holds the roles it created WITH ADMIN only
//                       (INHERIT FALSE, SET FALSE), so `set local role` is denied until this grant exists
//   4. seal-key         (OVE-169 W1 D25) pin the PUBLIC half of the KS executor's run-seal key in
//                       knowledge_verification.seal_signing_key via the KS CLI `knowledge-db seal-key` (derived from the
//                       private PEM path, never printed); current on repeat, refuses another key for the id, optionally
//                       retires earlier ids. Skipped when no seal key is named (report.seal then refuses
//                       `seal_key_unregistered`). Inputs: --seal-key-id/--seal-key-file/--seal-issuer/--retire-seal-key-ids,
//                       else KS_KNOWLEDGE_SEAL_KEY_ID/KS_KNOWLEDGE_SEAL_KEY_FILE/KS_KNOWLEDGE_SEAL_ISSUER/
//                       KS_KNOWLEDGE_SEAL_RETIRE_KEY_IDS (the generator's install.env). --remote-reinstall
//                       refuses SEAL_KEY_REQUIRED without a key unless --no-seal-key; local mode warns on stderr
//   5. mission-control  MC common release via `mission-db plan/apply/verify` with the Sprint V biotech target lock
//   6. graph-release    BKS SDL pin check: the target graph's latest KsReleaseMarker and writer DDL must equal the
//                       pinned release; a graph with no marker gets the release DDL + marker (disposable path)
//   7. executor-config  KS executor and BKS executor configuration by environment-variable NAME (values never read
//                       beyond presence; KS_KNOWLEDGE_BINDINGS_JSON holds ids and names only)
//   8. receipt          JSON receipt; `changed: false` when nothing was applied
//
// Ownership: this repository owns the Biotech domain schema (graph SDL, SV-D10) and its executor configuration, as
// ai-engineer-db-contract owns the AI Engineer domain schema and its installer; MC `deployments/` only carries
// app-neutral common-component manifests, so the Biotech recipe lives here.
//
// Remote reinstall (Sprint OC WI-24): `--remote-reinstall --target <deployments/biotech/target.toml>` replaces the
// disposable gates (DISPOSABLE_DATABASE_REQUIRED, DISPOSABLE_NEO4J_REQUIRED) with the target gates of
// scripts/install-target.mjs: the exact `--confirm-target <project_ref>:<installation_id>`, the credential endpoint
// named by `database_url_env` (TLS off loopback), live identity (installation row, or `--identity-evidence` for a
// legacy Mission Control), and `--confirm-graph <host>` (TLS for a remote graph). Mission Control then uses that target
// file and its installation id. `wipe [--dry-run]` drops the app-owned PostgreSQL schemas, then the graph content and
// KsReleaseMarker, behind the same gates (see scripts/install-target.mjs and the README).
//
//   node scripts/install-biotech.mjs --pg-admin-dsn-env <NAME> [--create-database] --neo4j-uri neo4j://127.0.0.1:7690 \
//     --neo4j-password-env <NAME> --component-installation-id <uuid> --mc-installation-id <uuid> --state-dir <dir> \
//     [--neo4j-user neo4j] [--ks-root <dir>] [--ks-component-root <dir>] [--mc-root <dir>] [--mc-lock <file>] [--mc-release-root <dir>]
//     [--component-login <login>] [--receipt <file>]
//     [--seal-key-id <id> --seal-key-file <executor PKCS#8 PEM> [--seal-issuer <name>] [--retire-seal-key-ids <a,b>]]
//     [--interrupt-after <step>]
//   node scripts/install-biotech.mjs --remote-reinstall --target <target.toml> --confirm-target <ref>:<installation_id> \
//     --neo4j-uri <neo4j+s://host> --neo4j-password-env <NAME> --confirm-graph <host> --component-installation-id <uuid> \
//     [--identity-evidence <json>] [--mc-installation-id <same as target>] [--state-dir <dir>] [--neo4j-user neo4j] \
//     [--ks-root] [--mc-root] [--mc-lock] [--component-login <login>] [--receipt <file>] [--interrupt-after <step>] \
//     (--seal-key-id <id> --seal-key-file <pem> [--seal-issuer <name>] [--retire-seal-key-ids <a,b>] | --no-seal-key)
//   node scripts/install-biotech.mjs wipe [--dry-run] --target <target.toml> --confirm-target <ref>:<installation_id> \
//     (--neo4j-uri <uri = $BKS_BIOTECH_GRAPH_URI> --neo4j-password-env <NAME> --confirm-graph <host> [--neo4j-user neo4j] | --skip-graph) \
//     [--identity-evidence <json>] [--schemas <a,b,...>] [--allow-sessions] [--allow-unmarked-graph] \
//     [--evidence-dir <git-ignored dir>] [--actor <name>] [--mc-root <dir>]
//     A real wipe also needs --from-dry-run <clean dry-run receipt.json> (same target and flags, under 2 h old); it
//     re-runs the whole plan as a dry-run first and commits nothing unless that is clean and unchanged.
// Exit: 0 passed, 2 refused gate, 1 error. DSNs and passwords are never printed.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  GRAPH_BATCH, Refused, assertIgnored, checkDryRunReceipt, confirmGraph, defaultActor, evaluateGraph, identifyTarget, inspectGraph,
  inventoryDigest, listSessions,
  loadIdentityEvidence, loadTarget, missionDbInspect, pgConfig, publicTarget, receiptStem, redactor, selectSchemas, summarize, wipeGraph,
  wipePostgres, writeJson,
} from "./install-target.mjs";

export { Refused };

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// KS knowledge_verification component pin: the one line to change for a new KS release (version + component digest,
// from `node <ks-root>/packages/knowledge-db-contract/dist/cli.js manifest` on the merged release).
export const KS_COMPONENT_PIN = Object.freeze({ version: "2.5.0", digest: "sha256:00550d59a2fe487a80e97d746d1897234e2f98c246091c06e5d2d5a07b108b88" });
export const PINS = Object.freeze({
  component: { name: "knowledge_verification", ...KS_COMPONENT_PIN, application: "biotech", binding: "biotech-graph" },
  // Sprint OC target lock (mission-db lock against releases/1.9.0/component, generated at its committed location under
  // sprint-oc/release/locks-190; the 1.8.0 locks stay for the installed W1 state). 1.9.0 adds 0066 and 0067 to the
  // installed 1.8.0, so an installed target upgrades in place by applying exactly those two. The
  // installer also passes the release root explicitly (same directory as the lock's release_root; a test pins that);
  // mission-db verifies every digest in the lock against it.
  missionControl: {
    version: "1.9.0",
    lockPath: "docs/specs/provider-consolidation-2026-10/sprint-oc/release/locks-190/biotech/release.lock.json",
    lockFileSha256: "7d00afb28d6295ba67545cca0e50b49687ca0dc03c6e12e760719e96f97497c0",
    releaseRoot: "packages/mission-control-db-contract/releases/1.9.0/component",
    readerVersion: "mission-control-runtime/1",
    writerVersion: "mission-control-runtime/1",
  },
  bks: { releaseId: "biotech-schema-v2.2.0", schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74", ddlDigest: "sha256:f0622dba117bd16236e575546764bd49444b604e95893eef665d1e796199ddb3" },
});
// Executor configuration by NAME (Sprint V E-KS, D2, D1). Presence is checked; values are never printed.
export const EXECUTOR_ENV = Object.freeze({
  ksExecutor: ["KS_KNOWLEDGE_BINDINGS_JSON", "KS_BIOTECH_EXECUTOR_URL", "KS_BIOTECH_EXECUTOR_TOKEN", "KS_BIOTECH_EXECUTOR_READ_TOKEN"],
  bksExecutor: ["BKS_BIOTECH_GRAPH_URI", "BKS_BIOTECH_GRAPH_USERNAME", "BKS_BIOTECH_GRAPH_PASSWORD", "BKS_EXECUTOR_TOKENS", "BKS_BIOTECH_DB_VERIFICATION_DSN", "BKS_VERIFICATION_TENANTS"],
});
// The bounded component roles the KS bindings `set local role` to (packages/bindings: biotech-graph admission and
// delivery use reader/writer, its research binding reader/writer/reviewer, the dispatch worker outbox_worker).
export const COMPONENT_SET_ROLES = Object.freeze([
  "knowledge_verification_reader", "knowledge_verification_writer", "knowledge_verification_reviewer", "knowledge_verification_outbox_worker",
]);
// Logins the grant must never widen: Supabase platform logins (PostgREST's authenticator could then SET them) and the
// API roles. A superuser needs nothing (SET is implicit) and is refused as an explicit --component-login.
export const COMPONENT_LOGIN_REFUSED = Object.freeze([
  "authenticator", "anon", "authenticated", "service_role", "supabase_admin", "supabase_auth_admin", "supabase_storage_admin",
  "supabase_realtime_admin", "supabase_replication_admin", "supabase_read_only_user", "dashboard_user", "pgbouncer",
]);
const STEPS = ["preflight", "component", "component-grants", "seal-key", "mission-control", "graph-release", "executor-config", "receipt"];
const ROLE_NAME = /^[a-z_][a-z0-9_]{0,62}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const DISPOSABLE_DB = /^disposable_[a-z0-9_]{3,48}$/;
const LOCAL_NEO4J = /^(neo4j|bolt):\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const option = (argv, name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };
function lastJson(text) { const i = text.indexOf("{"); if (i < 0) throw new Error("expected JSON output"); return JSON.parse(text.slice(i)); }
function run(command, args, { env, cwd, allowFailure = false } = {}) {
  const r = spawnSync(command, args, { cwd, env: { ...process.env, ...env }, encoding: "utf8", windowsHide: true, timeout: 600_000 });
  if (r.error) throw new Error(`${command} failed to start: ${r.error.message}`);
  if (!allowFailure && r.status !== 0) throw new Error(`${command} ${args[0] ?? ""} exited ${r.status}: ${scrubOutput((r.stderr || r.stdout || "").slice(-800), Object.values(env ?? {}))}`);
  return r;
}

function pgTarget(envName) {
  const dsn = process.env[envName ?? ""];
  if (!dsn) throw new Refused("ADMIN_DSN_MISSING", `environment variable ${envName} is not set`);
  const url = new URL(dsn);
  if (!["127.0.0.1", "localhost"].includes(url.hostname)) throw new Refused("LOOPBACK_REQUIRED", url.hostname);
  const database = decodeURIComponent(url.pathname.slice(1));
  if (!DISPOSABLE_DB.test(database)) throw new Refused("DISPOSABLE_DATABASE_REQUIRED", "database name must match disposable_*");
  return { dsn, host: "127.0.0.1", port: url.port || "5432", user: decodeURIComponent(url.username), database };
}

const require_ = createRequire(join(ROOT, "packages", "kg-ops", "package.json"));
async function withPg(dsn, fn) {
  const pg = require_("pg");
  const client = new pg.Client({ ...pgConfig(dsn), application_name: "install-biotech" });
  await client.connect();
  try { return await fn(client); } finally { await client.end(); }
}

async function ensureDatabase(target, create) {
  const server = new URL(target.dsn); server.pathname = "/postgres";
  const exists = await withPg(server.toString(), async (c) => (await c.query("select 1 from pg_database where datname = $1", [target.database])).rowCount === 1);
  if (exists) return false;
  if (!create) throw new Refused("DATABASE_MISSING", `${target.database} (pass --create-database)`);
  await withPg(server.toString(), (c) => c.query(`create database "${target.database}"`));
  return true;
}

function acquireLock(stateDir) {
  mkdirSync(stateDir, { recursive: true });
  const lockPath = join(stateDir, "install.lock");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const fd = openSync(lockPath, "wx"); writeFileSync(fd, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })); closeSync(fd);
      return { lockPath, tookOver: attempt > 0 };
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      let owner = {}; try { owner = JSON.parse(readFileSync(lockPath, "utf8")); } catch { /* unreadable: treat as dead */ }
      let alive = false; try { process.kill(owner.pid, 0); alive = true; } catch { alive = false; }
      if (alive) throw new Refused("INSTALL_IN_PROGRESS", `pid ${owner.pid}`);
      rmSync(lockPath, { force: true });
    }
  }
  throw new Refused("INSTALL_LOCK_UNAVAILABLE", lockPath);
}
const journal = (stateDir, entry) => writeFileSync(join(stateDir, "progress.jsonl"), `${JSON.stringify({ at: new Date().toISOString(), ...entry })}\n`, { flag: "a" });

// ---------------------------------------------------------------------------------------------------------- steps
export function componentCli(ksRoot) {
  const cli = join(ksRoot, "packages", "knowledge-db-contract", "dist", "cli.js");
  if (!existsSync(cli)) throw new Refused("TOOL_MISSING", "KS packages/knowledge-db-contract/dist/cli.js");
  return cli;
}

async function preflight(ctx) {
  const manifest = lastJson(run(process.execPath, [componentCli(ctx.ksRoot), "manifest", ...ctx.ksComponentArgs]).stdout);
  if (manifest.component_version !== PINS.component.version || manifest.component_digest !== PINS.component.digest) {
    throw new Refused("COMPONENT_PIN_MISMATCH", `${manifest.component_version} ${manifest.component_digest}`);
  }
  const lockBytes = readFileSync(ctx.mcLock);
  const lock = JSON.parse(lockBytes.toString("utf8"));
  if (sha256(lockBytes) !== PINS.missionControl.lockFileSha256 || lock.component_version !== PINS.missionControl.version || lock.app !== "biotech") {
    throw new Refused("MISSION_CONTROL_LOCK_PIN_MISMATCH", `${lock.app}@${lock.component_version} sha256:${sha256(lockBytes)}`);
  }
  if (!existsSync(ctx.missionDb)) throw new Refused("TOOL_MISSING", "MC .venv mission-db");
  let mcRelease;
  try { mcRelease = JSON.parse(readFileSync(join(ctx.mcReleaseRoot, "manifest.json"), "utf8")); } catch { mcRelease = null; }
  if (mcRelease?.component_version !== PINS.missionControl.version) {
    throw new Refused("MISSION_CONTROL_RELEASE_MISSING", `${ctx.mcReleaseRoot} is not the ${PINS.missionControl.version} release`);
  }
  const { loadRelease } = await import(pathToFileURL(join(ROOT, "packages", "schema-workspace", "dist", "index.js")).href);
  const release = loadRelease(); // byte-verifies schema/pinned/** against PIN.json
  if (release.pin?.releaseId !== PINS.bks.releaseId || release.schemaReleaseDigest !== PINS.bks.schemaReleaseDigest) {
    throw new Refused("BKS_PIN_MISMATCH", `${release.pin?.releaseId} ${release.schemaReleaseDigest}`);
  }
  const createdDatabase = ctx.remote ? false : await ensureDatabase(ctx.pg, ctx.createDatabase);
  return { status: createdDatabase ? "applied" : "checked", details: { component: PINS.component.version, missionControlLock: `sha256:${sha256(lockBytes)}`, bksRelease: release.pin.releaseId, schemaReleaseDigest: release.schemaReleaseDigest, createdDatabase } };
}

function component(ctx) {
  const env = { KDB_INSTALL_ADMIN_DSN: ctx.pg.dsn };
  const common = ["--admin-dsn-env", "KDB_INSTALL_ADMIN_DSN"];
  const r = run(process.execPath, [componentCli(ctx.ksRoot), "install", ...common, ...ctx.ksComponentArgs, "--installation-id", ctx.componentInstallationId,
    "--application", PINS.component.application, "--binding", PINS.component.binding, "--applied-by", "install-biotech"], { env, allowFailure: true });
  const receipt = lastJson(r.stdout);
  if (r.status !== 0) throw new Refused(receipt.refused ?? "COMPONENT_INSTALL_FAILED", scrubOutput(receipt.detail ?? r.stderr.slice(-400), [ctx.pg.dsn]));
  if (receipt.componentVersion !== PINS.component.version || receipt.componentDigest !== PINS.component.digest) throw new Refused("COMPONENT_PIN_MISMATCH", receipt.componentDigest);
  const inspection = lastJson(run(process.execPath, [componentCli(ctx.ksRoot), "inspect", ...common, ...ctx.ksComponentArgs], { env }).stdout);
  if (!inspection.complete || inspection.installation?.application_id !== "biotech" || inspection.installation?.binding !== "biotech-graph") {
    throw new Refused("COMPONENT_INCOMPLETE", JSON.stringify(inspection.installation));
  }
  return { status: receipt.applied.length ? "applied" : "current", details: { applied: receipt.applied, skipped: receipt.skipped, componentDigest: receipt.componentDigest, installationId: receipt.installationId } };
}

// component-grants, pure decision over the catalog state read by `readGrantState`. Returns the GRANT statements still
// needed (none when every role is already SET-able) or refuses before anything is issued:
//   COMPONENT_LOGIN_INVALID   the login does not exist or cannot log in
//   COMPONENT_LOGIN_REFUSED   a Supabase platform/API login, a pg_* role or a component role
//   COMPONENT_LOGIN_SUPERUSER an explicit --component-login that is a superuser (the executor login must not be one)
//   COMPONENT_ROLE_MISSING    a knowledge_verification_* role is absent (the component is not installed)
//   GRANTS_DRIFT              a direct membership WITH INHERIT (any login), or WITH ADMIN on a login other than the
//                             installing session user (whose ADMIN-only membership from CREATE ROLE is expected);
//                             never silently widened or narrowed
//   COMPONENT_GRANT_DENIED    a grant is needed but the session user neither is superuser nor holds ADMIN on the role
export function planComponentGrants(state) {
  const { login, sessionUser, explicit = false, account, sessionSuperuser = false, roles } = state;
  if (!ROLE_NAME.test(login ?? "")) throw new Refused("COMPONENT_LOGIN_INVALID", String(login));
  if (!account || !account.canLogin) throw new Refused("COMPONENT_LOGIN_INVALID", `${login} ${account ? "cannot log in" : "does not exist"}`);
  if (COMPONENT_LOGIN_REFUSED.includes(login) || /^pg_/.test(login) || /^knowledge_verification_/.test(login)) throw new Refused("COMPONENT_LOGIN_REFUSED", login);
  const missing = roles.filter((r) => !r.exists).map((r) => r.role);
  if (missing.length) throw new Refused("COMPONENT_ROLE_MISSING", `${missing.join(",")} (install the knowledge_verification component first)`);
  if (account.superuser) {
    if (explicit && login !== sessionUser) throw new Refused("COMPONENT_LOGIN_SUPERUSER", `${login} is a superuser; name the executor's bounded login`);
    return { login, superuser: true, grants: [], current: roles.map((r) => r.role) };
  }
  const drift = [];
  for (const r of roles) {
    for (const m of r.rows) {
      if (m.inherit) drift.push(`${r.role}: ${login} WITH INHERIT (grantor ${m.grantor})`);
      if (m.admin && login !== sessionUser) drift.push(`${r.role}: ${login} WITH ADMIN (grantor ${m.grantor})`);
    }
  }
  if (drift.length) throw new Refused("GRANTS_DRIFT", drift.join("; "));
  const needed = roles.filter((r) => !r.canSet);
  const denied = needed.filter((r) => !r.sessionAdmin && !sessionSuperuser).map((r) => r.role);
  if (denied.length) throw new Refused("COMPONENT_GRANT_DENIED", `${sessionUser} holds no ADMIN OPTION on ${denied.join(",")}`);
  return {
    login, superuser: false,
    grants: needed.map((r) => ({ role: r.role, sql: `grant "${r.role}" to "${login}" with inherit false, set true` })),
    current: roles.filter((r) => r.canSet).map((r) => r.role),
  };
}

export async function readGrantState(c, { login, explicit }) {
  const version = Number((await c.query("select current_setting('server_version_num') as v")).rows[0].v);
  if (version < 160000) throw new Refused("COMPONENT_GRANTS_PG16_REQUIRED", `server_version_num ${version}: SET/INHERIT membership options need PostgreSQL 16+`);
  const session = (await c.query("select session_user::text as name, r.rolsuper as superuser from pg_roles r where r.rolname = session_user")).rows[0];
  const resolved = login ?? session.name;
  const account = (await c.query("select rolcanlogin as \"canLogin\", rolsuper as superuser from pg_roles where rolname = $1", [resolved])).rows[0] ?? null;
  const roles = account ? (await c.query(`select x.role, g.oid is not null as exists,
      coalesce(pg_has_role($1::name, g.oid, 'SET'), false) as "canSet",
      coalesce(pg_has_role(session_user, g.oid, 'MEMBER WITH ADMIN OPTION'), false) as "sessionAdmin",
      coalesce((select json_agg(json_build_object('admin', m.admin_option, 'inherit', m.inherit_option, 'set', m.set_option,
          'grantor', pg_get_userbyid(m.grantor)) order by pg_get_userbyid(m.grantor), m.set_option)
        from pg_auth_members m join pg_roles u on u.oid = m.member where m.roleid = g.oid and u.rolname = $1), '[]'::json) as rows
    from unnest($2::text[]) with ordinality as x(role, n) left join pg_roles g on g.rolname = x.role order by x.n`, [resolved, COMPONENT_SET_ROLES])).rows
    : COMPONENT_SET_ROLES.map((role) => ({ role, exists: false, canSet: false, sessionAdmin: false, rows: [] }));
  return { login: resolved, sessionUser: session.name, sessionSuperuser: session.superuser, explicit: Boolean(explicit), account, roles };
}

/** The seal-key inputs: flags first, else the generator's environment names (install.env). */
export function sealKeyOptions(argv, env = process.env) {
  const pick = (flag, name) => option(argv, flag) ?? (env[name]?.trim() || undefined);
  return {
    keyId: pick("seal-key-id", "KS_KNOWLEDGE_SEAL_KEY_ID"),
    keyFile: pick("seal-key-file", "KS_KNOWLEDGE_SEAL_KEY_FILE"),
    issuer: pick("seal-issuer", "KS_KNOWLEDGE_SEAL_ISSUER") ?? "knowledge-services",
    retire: pick("retire-seal-key-ids", "KS_KNOWLEDGE_SEAL_RETIRE_KEY_IDS"),
    skip: argv.includes("--no-seal-key"),
    flagged: ["--seal-key-id", "--seal-key-file", "--retire-seal-key-ids"].some((flag) => argv.includes(flag)),
  };
}

// Checked before any write (main) and again in the step: a remote reinstall names the executor's seal key, or says
// explicitly that it registers none (--no-seal-key); a local run without one only warns.
export function checkSealKeyInputs(inputs, { remote }) {
  const { keyId, keyFile, skip, flagged } = inputs ?? {};
  if (skip) {
    if (flagged) throw new Refused("SEAL_KEY_FLAGS_CONFLICT", "--no-seal-key with --seal-key-id/--seal-key-file/--retire-seal-key-ids");
    return "skip";
  }
  if (!keyId && !keyFile) {
    if (remote) {
      throw new Refused("SEAL_KEY_REQUIRED", "name the KS executor's seal key (--seal-key-id/--seal-key-file, or KS_KNOWLEDGE_SEAL_KEY_ID/_FILE from install.env) or pass --no-seal-key");
    }
    return "absent";
  }
  if (!keyId || !keyFile) throw new Refused("SEAL_KEY_INCOMPLETE", "name both the seal key id and its private key file");
  if (!existsSync(keyFile)) throw new Refused("SEAL_KEY_FILE_MISSING", keyFile);
  return "register";
}

// OVE-169 W1 D25 review S2: a child's output tail never carries the DSN, its password or any URL credential.
const URL_CREDENTIALS = /([a-z][a-z0-9+.-]*:\/\/[^\s:/@]*):[^\s@]*@/gi;
export function scrubOutput(text, secrets = []) {
  const scrubbed = secrets.filter(Boolean).reduce((out, secret) => redactor(secret)(out), String(text ?? ""));
  return scrubbed.replace(URL_CREDENTIALS, "$1:<redacted>@");
}

// OVE-169 W1 D25: the executor's seal key, registered by the component owner's CLI (one implementation for both apps).
export function sealKey(ctx) {
  const { keyId, keyFile, issuer, retire } = ctx.sealKey ?? {};
  const decision = checkSealKeyInputs(ctx.sealKey, { remote: Boolean(ctx.remote) });
  if (decision === "skip") return { status: "skipped", details: { reason: "--no-seal-key" } };
  if (decision === "absent") {
    process.stderr.write("warning: seal-key skipped: no seal key named; report.seal refuses seal_key_unregistered until one is registered\n");
    return { status: "skipped", details: { reason: "no seal key named; report.seal refuses seal_key_unregistered until one is registered" } };
  }
  const args = [componentCli(ctx.ksRoot), "seal-key", "--admin-dsn-env", "KDB_INSTALL_ADMIN_DSN", ...(ctx.ksComponentArgs ?? []),
    "--key-id", keyId, "--key-file", keyFile, "--issuer", issuer, ...(retire ? ["--retire", retire] : [])];
  const r = run(process.execPath, args, { env: { KDB_INSTALL_ADMIN_DSN: ctx.pg.dsn }, allowFailure: true });
  if (r.status === 2) {
    const body = lastJson(r.stdout);
    throw new Refused(body.refused ?? "SEAL_KEY_REFUSED", scrubOutput(body.detail ?? "", [ctx.pg.dsn]));
  }
  if (r.status !== 0) throw new Error(`knowledge-db seal-key exited ${r.status}: ${scrubOutput((r.stderr || "").slice(-400), [ctx.pg.dsn])}`);
  const receipt = lastJson(r.stdout);
  return { status: receipt.status, details: { keyId: receipt.keyId, issuer: receipt.issuer, publicKeySha256: receipt.publicKeySha256, registered: receipt.registered, retired: receipt.retired } };
}

async function componentGrants(ctx) {
  const explicit = Boolean(ctx.componentLogin);
  return withPg(ctx.pg.dsn, async (c) => {
    const issued = [];
    await c.query("begin");
    let plan;
    try {
      plan = planComponentGrants(await readGrantState(c, { login: ctx.componentLogin, explicit }));
      for (const g of plan.grants) { await c.query(g.sql); issued.push(g.sql); }
      const after = planComponentGrants(await readGrantState(c, { login: plan.login, explicit }));
      if (after.grants.length) throw new Refused("COMPONENT_GRANTS_UNVERIFIED", after.grants.map((g) => g.role).join(","));
      await c.query("commit");
    } catch (error) {
      await c.query("rollback").catch(() => {});
      if (error instanceof Refused) throw error;
      throw new Refused("COMPONENT_GRANT_FAILED", `SQLSTATE ${error?.code ?? "?"}: ${error instanceof Error ? error.message : String(error)}`.slice(0, 300));
    }
    const state = await readGrantState(c, { login: plan.login, explicit });
    // Proof by use when the login is this session's own user: `set local role` each role in a rolled-back transaction.
    let setProof = "not-session-user";
    if (state.login === state.sessionUser) {
      for (const role of COMPONENT_SET_ROLES) {
        await c.query("begin");
        try {
          await c.query(`set local role "${role}"`);
          const now = (await c.query("select current_user::text as u")).rows[0].u;
          if (now !== role) throw new Refused("COMPONENT_GRANTS_UNVERIFIED", `set local role ${role} left current_user ${now}`);
        } catch (error) {
          await c.query("rollback").catch(() => {});
          if (error instanceof Refused) throw error;
          throw new Refused("COMPONENT_GRANTS_UNVERIFIED", `set local role ${role}: SQLSTATE ${error?.code ?? "?"}`);
        }
        await c.query("rollback");
      }
      setProof = "set-local-role";
    }
    return {
      status: issued.length ? "applied" : "current",
      details: {
        login: plan.login, loginSource: explicit ? "--component-login" : "component DSN session user", sessionUser: state.sessionUser,
        superuser: plan.superuser, issued, current: plan.current, setProof,
        memberships: Object.fromEntries(state.roles.map((r) => [r.role, r.rows])),
      },
    };
  });
}

function missionDb(ctx, args) {
  // A remote target names its own credential variable (database_url_env), already present in this environment.
  const r = run(ctx.missionDb, args, { env: ctx.remote ? {} : { MC_INSTALL_DISPOSABLE_DSN: ctx.pg.dsn }, cwd: ctx.mcRoot, allowFailure: true });
  let body; try { body = lastJson(r.stdout); } catch { body = { raw: (r.stdout + r.stderr).slice(-600) }; }
  return { code: r.status, body };
}

// Supabase provisions schema `extensions` with vector/pg_trgm; a plain disposable PostgreSQL does not. The release
// manifest names what must precede `mission-db apply` (its plan holds otherwise); provision exactly that.
async function provisionExtensions(ctx) {
  const manifest = JSON.parse(readFileSync(join(ctx.mcReleaseRoot, "manifest.json"), "utf8"));
  const required = manifest.required_extensions ?? [];
  return withPg(ctx.pg.dsn, async (c) => {
    const created = [];
    for (const ext of required) {
      if (!/^[a-z_][a-z0-9_]*$/.test(ext.name) || !/^[a-z_][a-z0-9_]*$/.test(ext.schema)) throw new Refused("RELEASE_EXTENSION_INVALID", JSON.stringify(ext));
      const row = (await c.query("select n.nspname from pg_extension e join pg_namespace n on n.oid = e.extnamespace where e.extname = $1", [ext.name])).rows[0];
      if (row && row.nspname !== ext.schema) throw new Refused("EXTENSION_IN_OTHER_SCHEMA", `${ext.name} in ${row.nspname}`);
      if (!row) {
        await c.query(`create schema if not exists ${ext.schema}`);
        await c.query(`create extension if not exists ${ext.name} with schema ${ext.schema}`);
        created.push(ext.name);
      }
    }
    return created;
  });
}

export async function missionControl(ctx) {
  const extensionsCreated = await provisionExtensions(ctx);
  const ref = ctx.remote ? ctx.remote.target.project_ref : `disposable-${ctx.pg.database.replaceAll("_", "-")}`.slice(0, 63);
  const targetPath = ctx.remote ? ctx.remote.target.path : join(ctx.stateDir, "mc-target.toml");
  if (!ctx.remote) writeFileSync(targetPath, `# Written by install-biotech.mjs for a DISPOSABLE loopback database; never a live target.
format_version = 1

[target]
app = "biotech"
application_id = "biotech"
project_label = "${ref}"
project_ref = "${ref}"
installation_id = "${ctx.mcInstallationId}"
environment = "disposable"
database_host = "${ctx.pg.host}"
database_port = ${Number(ctx.pg.port)}
database_name = "${ctx.pg.database}"
database_user = "${ctx.pg.user}"
database_url_env = "MC_INSTALL_DISPOSABLE_DSN"

[approval]
approved_by = "install-biotech.mjs disposable proof target"
identity_evidence = "loopback host and disposable_ database name checked by install-biotech.mjs"
`);
  const versions = ["--reader-version", PINS.missionControl.readerVersion, "--writer-version", PINS.missionControl.writerVersion];
  const selection = ["--target", targetPath, "--lock", ctx.mcLock, "--release-root", ctx.mcReleaseRoot];
  const plan = missionDb(ctx, ["plan", ...selection, ...versions, "--out", join(ctx.stateDir, "mc-plan.json")]);
  if (plan.code !== 0) throw new Refused("MISSION_CONTROL_PLAN_BLOCKED", JSON.stringify(plan.body).slice(0, 600));
  const pending = plan.body.plan?.pending_migrations ?? plan.body.pending_migrations ?? [];
  if (pending.length) {
    const apply = missionDb(ctx, ["apply", ...selection, ...versions, "--confirm-target", `${ref}:${ctx.mcInstallationId}`, "--expected-plan-digest", plan.body.plan_digest]);
    if (apply.code !== 0) throw new Refused("MISSION_CONTROL_APPLY_BLOCKED", JSON.stringify(apply.body).slice(0, 600));
    writeFileSync(join(ctx.stateDir, "mc-apply.json"), JSON.stringify(apply.body, null, 2));
  }
  const verify = missionDb(ctx, ["verify", ...selection, ...versions]);
  if (verify.code !== 0) throw new Refused("MISSION_CONTROL_VERIFY_BLOCKED", JSON.stringify(verify.body).slice(0, 600));
  writeFileSync(join(ctx.stateDir, "mc-verify.json"), JSON.stringify(verify.body, null, 2));
  return { status: pending.length || extensionsCreated.length ? "applied" : "current", details: { componentVersion: verify.body.component_version, schemaFingerprint: verify.body.schema_fingerprint, applied: pending.length, extensionsCreated, installationId: ctx.mcInstallationId } };
}

async function graphRelease(ctx) {
  const kg = await import(pathToFileURL(join(ROOT, "packages", "kg-ops", "dist", "index.js")).href);
  const password = process.env[ctx.neo4j.passwordEnv ?? ""];
  if (!password) throw new Refused("NEO4J_PASSWORD_MISSING", `environment variable ${ctx.neo4j.passwordEnv} is not set`);
  const client = new kg.GraphClient({ uri: ctx.neo4j.uri, username: ctx.neo4j.user, password, database: "neo4j" });
  try {
    await client.verify();
    const schema = kg.writeSchema();
    if (schema.releaseId !== PINS.bks.releaseId || schema.schemaReleaseDigest !== PINS.bks.schemaReleaseDigest) throw new Refused("BKS_PIN_MISMATCH", schema.releaseId);
    const expected = { releaseId: PINS.bks.releaseId, schemaReleaseDigest: PINS.bks.schemaReleaseDigest, ddlDigest: PINS.bks.ddlDigest };
    const markers = async () => {
      const rows = await client.read(async (tx) => (await tx.run(
        "MATCH (m:KsReleaseMarker) RETURN m.releaseId AS releaseId, m.schemaReleaseDigest AS schemaReleaseDigest, m.ddlDigest AS ddlDigest, toString(m.installedAt) AS installedAt")).records.map((r) => r.toObject()));
      const t = (r) => (r.installedAt ? Date.parse(r.installedAt) : Number.NEGATIVE_INFINITY);
      const max = Math.max(...rows.map(t));
      return rows.filter((r) => t(r) === max);
    };
    const ddlMissing = async () => {
      const present = await client.read(async (tx) => {
        const c = (await tx.run("SHOW CONSTRAINTS YIELD name RETURN collect(name) AS n")).records[0].get("n");
        const i = (await tx.run("SHOW INDEXES YIELD name, state WHERE state = 'ONLINE' RETURN collect(name) AS n")).records[0].get("n");
        return new Set([...c, ...i]);
      });
      return kg.writerDdlNames(schema).filter((n) => !present.has(n));
    };
    let latest = await markers();
    let applied = false;
    if (latest.length === 0) {
      await kg.ensureOperationalState(client, schema, { phase: "all" });
      await kg.installReleaseMarker(client, { releaseId: expected.releaseId, schemaReleaseDigest: expected.schemaReleaseDigest, ddlDigest: expected.ddlDigest }, "install-biotech");
      applied = true;
      latest = await markers();
    }
    const verdict = kg.releaseMarkerVerdict(latest, expected);
    if (verdict) throw new Refused("GRAPH_RELEASE_MISMATCH", `${verdict} (migrating an installed graph is the migrator's job)`);
    let missing = await ddlMissing();
    if (missing.length && !applied) {
      // Marker present but writer DDL incomplete (an interrupted ensure): re-run the idempotent DDL, never the marker.
      await kg.ensureOperationalState(client, schema, { phase: "all" });
      applied = true;
      missing = await ddlMissing();
    }
    if (missing.length) throw new Refused("GRAPH_DDL_INCOMPLETE", missing.slice(0, 10).join(","));
    return { status: applied ? "applied" : "current", details: { releaseId: latest[0].releaseId, schemaReleaseDigest: latest[0].schemaReleaseDigest, ddlDigest: latest[0].ddlDigest, writerDdlNames: kg.writerDdlNames(schema).length } };
  } finally {
    await client.close();
  }
}

function executorConfig(ctx) {
  const names = [...EXECUTOR_ENV.ksExecutor, ...EXECUTOR_ENV.bksExecutor];
  const missing = names.filter((n) => !process.env[n]);
  let binding = null;
  if (process.env.KS_KNOWLEDGE_BINDINGS_JSON) {
    let parsed;
    try { parsed = JSON.parse(process.env.KS_KNOWLEDGE_BINDINGS_JSON); } catch { throw new Refused("EXECUTOR_CONFIG_INVALID", "KS_KNOWLEDGE_BINDINGS_JSON is not JSON"); }
    binding = (Array.isArray(parsed) ? parsed : []).find((b) => b.application === "biotech" && b.binding === "biotech-graph") ?? null;
    if (!binding) missing.push("KS_KNOWLEDGE_BINDINGS_JSON[biotech/biotech-graph]");
    else {
      if (binding.installationId !== ctx.componentInstallationId) throw new Refused("EXECUTOR_INSTALLATION_MISMATCH", `${binding.installationId} != component installation`);
      if (!binding.databaseUrlEnv || !/^[A-Z][A-Z0-9_]*$/.test(binding.databaseUrlEnv)) missing.push("KS_KNOWLEDGE_BINDINGS_JSON[biotech].databaseUrlEnv");
      else if (!process.env[binding.databaseUrlEnv]) missing.push(binding.databaseUrlEnv);
    }
  }
  if (ctx.remote) {
    let host = null;
    try { host = new URL(process.env.BKS_BIOTECH_GRAPH_URI ?? "").hostname; } catch { /* reported as missing/mismatched below */ }
    if (process.env.BKS_BIOTECH_GRAPH_URI && host !== ctx.neo4j.host) throw new Refused("EXECUTOR_TARGET_MISMATCH", "BKS_BIOTECH_GRAPH_URI host differs from the confirmed graph");
  } else if (process.env.BKS_BIOTECH_GRAPH_URI && !LOCAL_NEO4J.test(process.env.BKS_BIOTECH_GRAPH_URI)) throw new Refused("EXECUTOR_TARGET_NOT_DISPOSABLE", "BKS_BIOTECH_GRAPH_URI is not a local Neo4j");
  if (missing.length) throw new Refused("EXECUTOR_CONFIG_MISSING", missing.join(","));
  return { status: "verified", details: { names, bindingDatabaseUrlEnv: binding?.databaseUrlEnv ?? null, installationId: binding?.installationId ?? null } };
}

// ---------------------------------------------------------------------------------------------------------- main
const missionDbPath = (mcRoot) => join(mcRoot, ".venv", process.platform === "win32" ? "Scripts/mission-db.exe" : "bin/mission-db");
const DEFAULT_EVIDENCE = join(ROOT, ".scratch", "sprint-oc", "evidence");

function loadRemoteTarget(argv) {
  const targetArg = option(argv, "target");
  if (!targetArg) throw new Refused("TARGET_REQUIRED", "--target <deployments/biotech/target.toml>");
  return loadTarget(resolve(targetArg), { app: "biotech" });
}

// PostgreSQL gates 1–3 of install-target.mjs for a remote target file (the confirmation is checked before connecting).
async function remoteGate(argv, mcRoot, target = loadRemoteTarget(argv)) {
  const missionDb = missionDbPath(mcRoot);
  if (!existsSync(missionDb)) throw new Refused("TOOL_MISSING", "MC .venv mission-db (identity inspection)");
  const gate = await identifyTarget({
    target, confirmation: option(argv, "confirm-target"), evidence: loadIdentityEvidence(option(argv, "identity-evidence")),
    connect: (endpoint, fn) => withPg(endpoint.dsn, fn),
    inspect: ({ scrub }) => missionDbInspect({ missionDb, mcRoot, targetPath: target.path, scrub }),
  });
  return { target, ...gate };
}

async function graphClient(neo4j) {
  const kg = await import(pathToFileURL(join(ROOT, "packages", "kg-ops", "dist", "index.js")).href);
  const password = process.env[neo4j.passwordEnv ?? ""];
  if (!password) throw new Refused("NEO4J_PASSWORD_MISSING", `environment variable ${neo4j.passwordEnv} is not set`);
  const client = new kg.GraphClient({ uri: neo4j.uri, username: neo4j.user, password, database: "neo4j" });
  await client.verify();
  return client;
}

// `wipe [--dry-run]`: the allow-listed PostgreSQL schemas (Mission Control last), then — only after they succeed — the
// graph content and KsReleaseMarker. Receipt (JSON + .txt summary) and step journal are written in `finally`.
export async function wipe(argv) {
  const dryRun = argv.includes("--dry-run");
  const mcRoot = resolve(option(argv, "mc-root") ?? join(ROOT, "..", "..", "platform", "mission-control"));
  const schemas = selectSchemas(option(argv, "schemas"));
  const evidenceDir = resolve(option(argv, "evidence-dir") ?? join(DEFAULT_EVIDENCE, "wipe"));
  assertIgnored(ROOT, evidenceDir);
  const skipGraph = argv.includes("--skip-graph");
  const neo4j = { uri: option(argv, "neo4j-uri"), user: option(argv, "neo4j-user") ?? "neo4j", passwordEnv: option(argv, "neo4j-password-env") };
  if (skipGraph && neo4j.uri) throw new Refused("WIPE_GRAPH_CONFLICT", "--skip-graph with --neo4j-uri");
  if (!skipGraph && !neo4j.uri) throw new Refused("NEO4J_URI_REQUIRED", "--neo4j-uri <uri> --confirm-graph <host> (or --skip-graph)");
  if (!skipGraph) neo4j.host = confirmGraph(option(argv, "confirm-graph"), neo4j.uri, process.env, { requireEnv: true });
  const target = loadRemoteTarget(argv);
  const startedAt = new Date().toISOString();
  const stem = receiptStem(evidenceDir, dryRun ? "dry-run" : "wipe", target.project_ref, startedAt);
  const journalPath = `${stem}.journal.jsonl`;
  const journalLine = (entry) => writeFileSync(journalPath, `${JSON.stringify({ at: new Date().toISOString(), ...entry })}\n`, { flag: "a" });
  const flags = { allowSessions: argv.includes("--allow-sessions"), allowUnmarkedGraph: argv.includes("--allow-unmarked-graph"), skipGraph };
  const receipt = {
    format: "biotech-wipe-receipt.v2", dryRun, status: "started", target: publicTarget(target), graphHost: skipGraph ? null : neo4j.host,
    actor: option(argv, "actor") ?? defaultActor(), requestedSchemas: schemas, flags, steps: [], startedAt,
  };
  let scrub = (t) => t;
  let current = null;
  let client = null;
  try {
    journalLine({ event: "start", dryRun });
    current = "identity";
    const gate = await remoteGate(argv, mcRoot, target);
    scrub = gate.scrub;
    receipt.identity = gate.identity;
    receipt.probe = { schemasPresent: gate.probe.schemasPresent, lastMissionControlMigration: gate.probe.lastMissionControlMigration };
    journalLine({ event: "done", step: "identity", status: gate.identity.status });
    let graphState = null;
    if (!skipGraph) {
      current = "graph-identity";
      client = await graphClient(neo4j);
      graphState = await inspectGraph(client);
      receipt.graph = { host: neo4j.host, nodes: graphState.nodes, relationships: graphState.relationships, labels: graphState.labels, markers: evaluateGraph(graphState, { allowUnmarked: flags.allowUnmarkedGraph }) };
      journalLine({ event: "done", step: "graph-identity", nodes: graphState.nodes });
    }
    current = "sessions";
    receipt.sessions = await withPg(gate.endpoint.dsn, listSessions);
    const application = receipt.sessions.filter((x) => !x.platform);
    const sessionBlocker = application.length && !flags.allowSessions
      ? [{ step: "sessions", code: "WIPE_SESSIONS_ACTIVE", objects: application.map((x) => `${x.usename ?? "?"}:${x.pid}:${x.application_name || "-"}`), total: application.length }] : [];
    const plan = (results, asDryRun, onStep = () => {}) => withPg(gate.endpoint.dsn, (pgClient) => wipePostgres(pgClient, {
      schemas, expectedOwner: target.database_session_user, dryRun: asDryRun, results, onStep,
    }));
    const graphStep = (status) => ({ step: "graph", host: neo4j.host, nodesBefore: graphState.nodes, relationshipsBefore: graphState.relationships, labels: graphState.labels, markersBefore: receipt.graph.markers, status, batchSize: GRAPH_BATCH });
    const blockersOf = (steps) => [...steps.flatMap((x) => (x.blockers ?? []).map((b) => ({ step: x.step, ...b }))), ...sessionBlocker];
    if (!dryRun) {
      // F1: all-or-nothing. A clean dry-run receipt for this exact target and these flags, then an internal dry-run of
      // the whole plan (PostgreSQL steps rolled back, graph counted) whose inventory digest must equal the receipt's.
      current = "dry-run-receipt";
      receipt.fromDryRun = checkDryRunReceipt(option(argv, "from-dry-run"), { target, flags, requestedSchemas: schemas, format: receipt.format, graphHost: receipt.graphHost });
      if (sessionBlocker.length) throw new Refused("WIPE_SESSIONS_ACTIVE", `${application.length} other application session(s) on the database (see the receipt); stop them or pass --allow-sessions`);
      current = "pre-check";
      journalLine({ event: "start", step: "pre-check" });
      const preSteps = [];
      await plan(preSteps, true);
      if (!skipGraph) preSteps.push(graphStep(graphState.nodes ? "would-delete" : "empty"));
      const preBlockers = blockersOf(preSteps);
      receipt.preCheck = { inventoryDigest: inventoryDigest(preSteps), blockers: preBlockers, steps: preSteps.map((x) => `${x.step}:${x.status}`) };
      journalLine({ event: "done", step: "pre-check", blockers: preBlockers.length });
      if (preBlockers.length) throw new Refused("WIPE_PLAN_BLOCKED", `nothing was changed; blockers: ${preBlockers.map((b) => `${b.step}:${b.code}`).join(", ")}`);
      if (receipt.preCheck.inventoryDigest !== receipt.fromDryRun.inventoryDigest) {
        throw new Refused("WIPE_DRY_RUN_MISMATCH", "nothing was changed; the target's inventory differs from the dry-run's (dry-run again)");
      }
    }
    current = null;
    await plan(receipt.steps, dryRun, (e) => { current = e.event === "start" ? e.step : null; journalLine(e); });
    if (!skipGraph) {
      if (dryRun) receipt.steps.push(graphStep(graphState.nodes ? "would-delete" : "empty"));
      else {
        current = "graph";
        journalLine({ event: "start", step: "graph", nodes: graphState.nodes });
        const after = graphState.nodes ? await wipeGraph(client) : graphState;
        receipt.steps.push({ ...graphStep(graphState.nodes ? "deleted" : "empty"), nodesAfter: after.nodes });
        journalLine({ event: "done", step: "graph", status: receipt.steps.at(-1).status });
        current = null;
      }
    }
    receipt.blockers = blockersOf(receipt.steps);
    receipt.inventoryDigest = dryRun ? inventoryDigest(receipt.steps) : receipt.preCheck.inventoryDigest;
    receipt.status = dryRun ? (receipt.blockers.length ? "dry-run-blocked" : "dry-run-clear") : "complete";
    receipt.changed = !dryRun && receipt.steps.some((x) => ["dropped", "deleted"].includes(x.status));
    return receipt;
  } catch (error) {
    receipt.status = "failed";
    receipt.failedStep = current;
    receipt.error = { code: error instanceof Refused ? error.code : "ERROR", message: scrub(error instanceof Error ? error.message : String(error)).slice(0, 800) };
    receipt.changed = receipt.steps.some((x) => ["dropped", "deleted"].includes(x.status));
    throw error;
  } finally {
    if (client) await client.close().catch(() => {});
    receipt.finishedAt = new Date().toISOString();
    receipt.path = writeJson(`${stem}.json`, receipt);
    receipt.summaryPath = `${stem}.txt`;
    writeFileSync(receipt.summaryPath, summarize(receipt));
    journalLine({ event: "receipt", status: receipt.status });
  }
}

export async function main(argv = process.argv.slice(2)) {
  if (argv[0] === "wipe") return wipe(argv.slice(1));
  const remoteMode = argv.includes("--remote-reinstall");
  if (!remoteMode && (option(argv, "target") || option(argv, "confirm-target") || option(argv, "confirm-graph"))) {
    throw new Refused("REMOTE_REINSTALL_FLAG_REQUIRED", "--target/--confirm-target/--confirm-graph install only with --remote-reinstall");
  }
  const mcRoot = resolve(option(argv, "mc-root") ?? join(ROOT, "..", "..", "platform", "mission-control"));
  const uri = option(argv, "neo4j-uri") ?? "";
  let pg;
  let remote = null;
  let graphHostName = null;
  let mcInstallationId = option(argv, "mc-installation-id");
  if (remoteMode) {
    if (option(argv, "pg-admin-dsn-env") || argv.includes("--create-database")) throw new Refused("REMOTE_REINSTALL_CONFLICT", "--pg-admin-dsn-env/--create-database name a disposable database; the target file names the credential");
    graphHostName = confirmGraph(option(argv, "confirm-graph"), uri);
  } else {
    pg = pgTarget(option(argv, "pg-admin-dsn-env"));
    if (!LOCAL_NEO4J.test(uri)) throw new Refused("DISPOSABLE_NEO4J_REQUIRED", "--neo4j-uri must be a local neo4j:// or bolt:// URI");
  }
  const componentInstallationId = option(argv, "component-installation-id");
  if (!UUID.test(componentInstallationId ?? "")) throw new Refused("INSTALLATION_ID_REQUIRED", "--component-installation-id (uuid)");
  if (!remoteMode && !UUID.test(mcInstallationId ?? "")) throw new Refused("INSTALLATION_ID_REQUIRED", "--component-installation-id and --mc-installation-id (uuid)");
  const componentLogin = option(argv, "component-login");
  if (argv.includes("--component-login") && !ROLE_NAME.test(componentLogin ?? "")) throw new Refused("COMPONENT_LOGIN_INVALID", "--component-login <PostgreSQL login name>");
  const interruptAfter = option(argv, "interrupt-after");
  if (interruptAfter && !STEPS.includes(interruptAfter)) throw new Refused("UNKNOWN_STEP", interruptAfter);
  if (remoteMode) {
    remote = await remoteGate(argv, mcRoot);
    if (mcInstallationId && mcInstallationId !== remote.target.installation_id) throw new Refused("MC_INSTALLATION_ID_MISMATCH", "--mc-installation-id differs from target.toml");
    mcInstallationId = remote.target.installation_id;
    pg = remote.endpoint;
  }
  const sealKeyInputs = sealKeyOptions(argv);
  checkSealKeyInputs(sealKeyInputs, { remote: remoteMode });
  const stateArg = option(argv, "state-dir") ?? (remote ? join(DEFAULT_EVIDENCE, "install-state", remote.target.project_ref) : undefined);
  if (!stateArg) throw new Refused("STATE_DIR_REQUIRED", "--state-dir <dir>");
  const ctx = {
    pg, remote, createDatabase: argv.includes("--create-database"), componentInstallationId, mcInstallationId, componentLogin,
    neo4j: { uri, host: graphHostName, user: option(argv, "neo4j-user") ?? "neo4j", passwordEnv: option(argv, "neo4j-password-env") },
    ksRoot: resolve(option(argv, "ks-root") ?? join(ROOT, "..", "..", "platform", "knowledge-services")),
    // --ks-component-root: the KS CLI's --component-root (default: the component inside --ks-root); the pin still applies.
    ksComponentArgs: option(argv, "ks-component-root") ? ["--component-root", resolve(option(argv, "ks-component-root"))] : [],
    mcRoot, mcLock: resolve(option(argv, "mc-lock") ?? join(mcRoot, PINS.missionControl.lockPath)),
    mcReleaseRoot: resolve(option(argv, "mc-release-root") ?? join(mcRoot, PINS.missionControl.releaseRoot)),
    missionDb: missionDbPath(mcRoot),
    stateDir: resolve(stateArg),
    sealKey: sealKeyInputs,
  };
  const receiptPath = resolve(option(argv, "receipt") ?? join(ctx.stateDir, "install-receipt.json"));
  const lock = acquireLock(ctx.stateDir);
  const startedAt = new Date().toISOString();
  try {
    const handlers = { preflight, component, "component-grants": componentGrants, "seal-key": sealKey, "mission-control": missionControl, "graph-release": graphRelease, "executor-config": executorConfig };
    const steps = [];
    journal(ctx.stateDir, { event: "start", pid: process.pid, resumedAfterInterruption: lock.tookOver, mode: remote ? "remote-reinstall" : "disposable" });
    for (const name of STEPS.slice(0, -1)) {
      const t0 = Date.now();
      const outcome = await handlers[name](ctx);
      steps.push({ step: name, ...outcome, ms: Date.now() - t0 });
      journal(ctx.stateDir, { event: "step", step: name, status: outcome.status });
      if (interruptAfter === name) { journal(ctx.stateDir, { event: "interrupt", after: name }); process.kill(process.pid, "SIGKILL"); }
    }
    const receipt = {
      format: "biotech-install-receipt.v1",
      target: remote
        ? { mode: "remote-reinstall", postgres: { ...publicTarget(remote.target), identity: remote.identity }, neo4j: { host: graphHostName }, environment: remote.target.environment }
        : { postgres: { host: pg.host, port: pg.port, database: pg.database }, neo4j: { uri }, environment: "disposable" },
      pins: PINS, executorEnvNames: EXECUTOR_ENV, steps,
      changed: steps.some((s) => s.status === "applied"),
      resumedAfterInterruption: lock.tookOver, startedAt, finishedAt: new Date().toISOString(),
    };
    writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    journal(ctx.stateDir, { event: "receipt", path: receiptPath, changed: receipt.changed });
    return receipt;
  } finally {
    rmSync(lock.lockPath, { force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(
    (r) => {
      if (r.format === "biotech-wipe-receipt.v2") process.stderr.write(summarize(r));
      const summary = r.format === "biotech-wipe-receipt.v2"
        ? { status: r.status, changed: r.changed, identity: r.identity.status, steps: r.steps.map((s) => `${s.step}:${s.status}`), blockers: r.blockers.length, receipt: r.path, summary: r.summaryPath }
        : { status: "installed", changed: r.changed, steps: r.steps.map((s) => `${s.step}:${s.status}`) };
      process.stdout.write(`${JSON.stringify(summary)}\n`); process.exit(0);
    },
    (error) => {
      if (error instanceof Refused) { process.stdout.write(`${JSON.stringify({ status: "refused", code: error.code, detail: error.detail })}\n`); process.exit(2); }
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exit(1);
    },
  );
}
