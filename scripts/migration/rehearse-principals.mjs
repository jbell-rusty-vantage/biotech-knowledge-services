#!/usr/bin/env node
// Rehearses the bks_reader / bks_writer / bks_migrator role separation on a DISPOSABLE Enterprise instance and proves
// enforcement by attempting forbidden operations with each principal. Never targets Aura (guard) and never prints passwords.
//
//   BKS_RESTORE_URI=neo4j://localhost:7691 BKS_RESTORE_PASSWORD=<admin pw> node scripts/migration/rehearse-principals.mjs [--database bksprincipals]
//
// Uses its own scratch database (created and dropped) so the restored copies are untouched. Output: JSON proof on stdout.
import { randomBytes } from "node:crypto";
import { assertDisposableTarget, loadEnv, neo4j, parseArgs, targetConfig } from "./lib/common.mjs";

const args = parseArgs(process.argv.slice(2));
const env = loadEnv();
const admin = targetConfig(env);
assertDisposableTarget(admin, env);
const db = args.database ?? "bksprincipals";
if (!/^[a-z][a-z0-9]{2,30}$/.test(db)) throw new Error("bad database name");
const pw = Object.fromEntries(["bks_reader", "bks_writer", "bks_migrator"].map((u) => [u, randomBytes(12).toString("hex")]));
const adminDriver = neo4j.driver(admin.uri, neo4j.auth.basic(admin.username, admin.password));
const sys = adminDriver.session({ database: "system" });
const ROLE_DDL = [
  `CREATE DATABASE ${db} IF NOT EXISTS WAIT`,
  "CREATE ROLE bks_reader IF NOT EXISTS",
  `GRANT ACCESS ON DATABASE ${db} TO bks_reader`,
  `GRANT MATCH {*} ON GRAPH ${db} TO bks_reader`,
  "CREATE ROLE bks_writer IF NOT EXISTS",
  `GRANT ACCESS ON DATABASE ${db} TO bks_writer`,
  `GRANT MATCH {*} ON GRAPH ${db} TO bks_writer`,
  `GRANT WRITE ON GRAPH ${db} TO bks_writer`,
  "CREATE ROLE bks_migrator IF NOT EXISTS",
  `GRANT ACCESS ON DATABASE ${db} TO bks_migrator`,
  `GRANT MATCH {*} ON GRAPH ${db} TO bks_migrator`,
  `GRANT WRITE ON GRAPH ${db} TO bks_migrator`,
  `GRANT INDEX MANAGEMENT ON DATABASE ${db} TO bks_migrator`,
  `GRANT CONSTRAINT MANAGEMENT ON DATABASE ${db} TO bks_migrator`,
  `GRANT NAME MANAGEMENT ON DATABASE ${db} TO bks_migrator`,
];
const proof = { database: db, statements: ROLE_DDL.length, checks: [] };
try {
  for (const s of ROLE_DDL) await sys.run(s);
  for (const u of Object.keys(pw)) {
    await sys.run(`DROP USER ${u} IF EXISTS`);
    await sys.run(`CREATE USER ${u} SET PASSWORD $p CHANGE NOT REQUIRED`, { p: pw[u] });
    await sys.run(`GRANT ROLE ${u} TO ${u}`);
  }
  const seed = adminDriver.session({ database: db });
  await seed.run("MERGE (:BksPrincipalProbe {synthetic: true, key: 'p1'})");
  await seed.close();
  const attempt = async (user, label, statement, mode) => {
    const d = neo4j.driver(admin.uri, neo4j.auth.basic(user, pw[user]));
    const s = d.session({ database: db, defaultAccessMode: mode === "READ" ? neo4j.session.READ : neo4j.session.WRITE });
    try {
      // Deliberately use a WRITE-routed session for write attempts: enforcement must come from the principal, not routing.
      await s.run(statement);
      return { user, label, allowed: true };
    } catch (e) {
      return { user, label, allowed: false, code: e.code ?? null };
    } finally {
      await s.close();
      await d.close();
    }
  };
  const expect = (r, allowed) => proof.checks.push({ ...r, expected: allowed ? "allowed" : "denied", ok: r.allowed === allowed });
  expect(await attempt("bks_reader", "read", "MATCH (n:BksPrincipalProbe) RETURN count(n)", "READ"), true);
  expect(await attempt("bks_reader", "write via WRITE session", "CREATE (:BksPrincipalProbe {synthetic: true, key: 'r'})", "WRITE"), false);
  expect(await attempt("bks_reader", "create index", "CREATE INDEX probe_reader IF NOT EXISTS FOR (n:BksPrincipalProbe) ON (n.key)", "WRITE"), false);
  expect(await attempt("bks_writer", "write", "CREATE (:BksPrincipalProbe {synthetic: true, key: 'w'})", "WRITE"), true);
  expect(await attempt("bks_writer", "create index", "CREATE INDEX probe_writer IF NOT EXISTS FOR (n:BksPrincipalProbe) ON (n.key)", "WRITE"), false);
  expect(await attempt("bks_writer", "create constraint", "CREATE CONSTRAINT probe_writer_c IF NOT EXISTS FOR (n:BksPrincipalProbe) REQUIRE n.key IS UNIQUE", "WRITE"), false);
  expect(await attempt("bks_writer", "create user", "CREATE USER mallory SET PASSWORD 'x' CHANGE NOT REQUIRED", "WRITE"), false);
  expect(await attempt("bks_migrator", "create constraint", "CREATE CONSTRAINT probe_migrator_c IF NOT EXISTS FOR (n:BksPrincipalProbe) REQUIRE n.key IS UNIQUE", "WRITE"), true);
  expect(await attempt("bks_migrator", "write", "CREATE (:BksPrincipalProbe {synthetic: true, key: 'm'})", "WRITE"), true);
  expect(await attempt("bks_migrator", "grant role", "GRANT ROLE admin TO bks_migrator", "WRITE"), false);
  proof.ok = proof.checks.every((c) => c.ok);
} finally {
  // cleanup of the scratch database and principals (disposable instance)
  for (const u of Object.keys(pw)) await sys.run(`DROP USER ${u} IF EXISTS`).catch(() => {});
  for (const r of Object.keys(pw)) await sys.run(`DROP ROLE ${r} IF EXISTS`).catch(() => {});
  await sys.run(`DROP DATABASE ${db} IF EXISTS WAIT`).catch(() => {});
  await sys.close();
  await adminDriver.close();
}
console.log(JSON.stringify(proof, null, 2));
process.exit(proof.ok ? 0 : 1);
