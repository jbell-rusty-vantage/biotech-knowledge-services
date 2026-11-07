/**
 * Gate B read guarantees that need real database authority: Neo4j Enterprise evaluation image (Community has no roles).
 * Skipped unless BKS_INTEGRATION=1 and NEO4J_EE_TEST_URI.
 *
 *   BKS_NEO4J_EDITION=enterprise BKS_NEO4J_TEST_CONTAINER=bks-neo4j-s4-ee BKS_NEO4J_TEST_BOLT_PORT=7699 BKS_NEO4J_TEST_HTTP_PORT=7499 bash scripts/neo4j-test.sh up
 *   BKS_INTEGRATION=1 NEO4J_EE_TEST_URI=bolt://127.0.0.1:7699 NEO4J_TEST_PASSWORD=bks-test-password \
 *     npx vitest run --project kg-ops packages/kg-ops/src/read/read-enterprise.integration.test.ts
 *
 * Creates the reader roles from read/rbac.ts (bks_reader_internal, bks_reader_public) and test users, seeds the fixture
 * graph through the v2 writer as the admin principal, and reads ONLY as the reader principals.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GraphClient, toJson } from "../neo4j.js";
import { PRINCIPALS } from "../write/test-support.js";
import { correctionsFor } from "./catalog-corrections.js";
import { PROPOSED_TEMPLATES } from "./catalog-proposals.js";
import { CYPHER_READ_INTENT_V1, READ_INTENT_V2, type ReadResultV2 } from "./contracts.js";
import { assertLocalUri, seedFixtureGraph, seedOperationalRecords, type FixtureGraph } from "./fixture-graph.js";
import type { Promotion } from "./question-status.js";
import { ALLOWED_APOC_FUNCTIONS, functionDenied, READER_ROLES, readerRoleStatements, readerUserStatements } from "./rbac.js";
import { ReadService, type ReadPrincipal } from "./service.js";
import { ReadModel } from "./visibility.js";

const enabled = process.env.BKS_INTEGRATION === "1" && Boolean(process.env.NEO4J_EE_TEST_URI);
const d = enabled ? describe : describe.skip;
const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..", "..", "..", "..");
const EE_URI = process.env.NEO4J_EE_TEST_URI ?? "bolt://127.0.0.1:7699";
const PASSWORD = process.env.NEO4J_TEST_PASSWORD ?? "bks-test-password";
const evidenceDir = resolve(repo, "runs", "release-v2", "s4");
const stamp = `e${Date.now().toString(36)}`;
const evidence: Array<{ test: string; result: string; detail?: unknown }> = [];
const promotions: Promotion[] = [];
const record = (test: string, result: string, detail?: unknown) => evidence.push({ test, result, ...(detail === undefined ? {} : { detail }) });
const READER: ReadPrincipal = { principalId: "s4-ee-reader", installationId: PRINCIPALS.writer.installationId, applicationId: PRINCIPALS.writer.applicationId, tenantId: PRINCIPALS.writer.tenantId, role: "reader", grants: ["read.internal"] };

d("Gate B reads on Neo4j Enterprise: real read-only authority, RBAC visibility, governed Cypher artifacts", () => {
  const admin = enabled ? new GraphClient({ uri: EE_URI, username: "neo4j", password: PASSWORD, database: "neo4j" }) : (null as unknown as GraphClient);
  const model = ReadModel.fromRelease();
  const R = model.schemaReleaseDigest;
  const pw = { internal: `int-${stamp}-pw`, public: `pub-${stamp}-pw` };
  let rInternal: GraphClient;
  let rPublic: GraphClient;
  let fx: FixtureGraph;
  let svc: ReadService;
  let legacyUid: string;

  const cy = (statement: string, parameters: Record<string, unknown> = {}, o: { binding?: string; schema?: Record<string, unknown>; limits?: Record<string, unknown>; ordering?: "set" | "statement"; columns?: string[]; mode?: "observed" | "stable_revision" } = {}) =>
    svc.cypher({ schemaVersion: CYPHER_READ_INTENT_V1, intentId: `ee-${stamp}`, pins: { schemaReleaseDigest: R }, purpose: "Gate B Enterprise read", bindingRef: o.binding ?? "ee-internal", statement, parameters, parameterSchema: (o.schema ?? Object.fromEntries(Object.entries(parameters).map(([k, v]) => [k, { type: Array.isArray(v) ? "array" : typeof v === "number" ? (Number.isInteger(v) ? "integer" : "number") : typeof v }]))) as never, limits: { timeoutMs: 30_000, ...(o.limits ?? {}) }, ordering: o.ordering ?? "set", ...(o.columns ? { resultSchema: { columns: o.columns.map((name) => ({ name })) } } : {}), consistency: { mode: o.mode ?? "observed" } }, READER);
  const typed = (operations: Array<Record<string, unknown>>, binding = "ee-internal") => svc.typed({ schemaVersion: READ_INTENT_V2, intentId: `eet-${stamp}`, pins: { schemaReleaseDigest: R }, purpose: "Gate B Enterprise typed read", bindingRef: binding, operations, limits: { timeoutMs: 30_000 } }, READER);
  const uid = (k: string) => fx.uids[k]!;
  const mint = (k: string) => fx.mints[k]!;
  const raw = async (client: GraphClient, q: string, params: Record<string, unknown> = {}, mode: "READ" | "WRITE" = "READ") => {
    const s = client.session(mode);
    try {
      return (await s.run(q, params)).records.map((r) => toJson(r.toObject()) as Record<string, unknown>);
    } finally {
      await s.close();
    }
  };
  const refusal = async (client: GraphClient, q: string, mode: "READ" | "WRITE" = "WRITE") => {
    try {
      await raw(client, q, {}, mode);
      return null;
    } catch (e) {
      return `${String((e as { code?: string }).code ?? "")} ${String((e as Error).message).split("\n")[0]!.slice(0, 160)}`;
    }
  };

  beforeAll(async () => {
    assertLocalUri(EE_URI);
    await admin.verify();
    fx = await seedFixtureGraph(admin, { stamp, custodyRoot: resolve(evidenceDir, `custody-${stamp}`), includeFu03: process.env.BKS_S4_EE_FU03 === "1" });
    const op = await seedOperationalRecords(admin, uid("product"), stamp);
    legacyUid = op.legacyUid;
    record("legacy-edge-vs-enterprise-ddl", op.legacyEdgeNote ? "finding" : "none", op.legacyEdgeNote);
    const sys = admin.driver.session({ database: "system" });
    try {
      for (const role of Object.values(READER_ROLES)) await sys.run(`DROP ROLE ${role} IF EXISTS`);
      for (const q of [...readerRoleStatements(model, "internal"), ...readerRoleStatements(model, "public"), ...readerUserStatements("bks_reader_internal_test", pw.internal, READER_ROLES.internal), ...readerUserStatements("bks_reader_public_test", pw.public, READER_ROLES.public)]) await sys.run(q);
    } finally {
      await sys.close();
    }
    rInternal = new GraphClient({ uri: EE_URI, username: "bks_reader_internal_test", password: pw.internal, database: "neo4j" });
    rPublic = new GraphClient({ uri: EE_URI, username: "bks_reader_public_test", password: pw.public, database: "neo4j" });
    svc = new ReadService({
      model,
      bindings: [
        { ref: "ee-internal", scope: "internal", client: rInternal, readAuthority: "database-role", visibility: "database-rbac" },
        { ref: "ee-public", scope: "public", client: rPublic, readAuthority: "database-role", visibility: "database-rbac" },
        { ref: "ee-admin", scope: "internal", client: admin, readAuthority: "session-routing", visibility: "application" },
      ],
    });
    mkdirSync(evidenceDir, { recursive: true });
  }, 1_500_000);

  afterAll(async () => {
    if (!enabled) return;
    mkdirSync(evidenceDir, { recursive: true });
    const doc = { stamp, uri: EE_URI, edition: "enterprise", releaseId: model.releaseId, schemaReleaseDigest: R, roles: { internal: readerRoleStatements(model, "internal"), public: readerRoleStatements(model, "public") }, finishedAt: new Date().toISOString(), evidence, promotions };
    writeFileSync(resolve(evidenceDir, `gate-b-read-ee-${stamp}.json`), `${JSON.stringify(doc, null, 2)}\n`);
    writeFileSync(resolve(evidenceDir, "gate-b-read-ee-latest.json"), `${JSON.stringify(doc, null, 2)}\n`);
    await rInternal?.close();
    await rPublic?.close();
    await admin?.close();
  });

  it("the reader principals cannot write: CREATE / MERGE / SET / DELETE / CALL {} IN TRANSACTIONS / LOAD CSV / side-effect procedures are refused by the DATABASE, even in a WRITE session", async () => {
    const attempts: Record<string, string | null> = {};
    for (const [name, client] of [["internal", rInternal], ["public", rPublic]] as const) {
      for (const [k, q] of [
        ["create", "CREATE (:BksShouldNotExist {k: 1})"],
        ["merge", `MERGE (o:Organization {uid: '${uid("org")}'}) SET o.name = 'pwned'`],
        ["set", `MATCH (o:Organization {uid: '${uid("org")}'}) SET o.name = 'pwned'`],
        ["delete", `MATCH (o:Organization {uid: '${uid("org")}'}) DETACH DELETE o`],
        ["inTransactions", "UNWIND [1] AS x CALL { WITH x CREATE (:BksShouldNotExist {x: x}) } IN TRANSACTIONS RETURN 1"],
        ["loadCsv", "LOAD CSV FROM 'file:///etc/hostname' AS row RETURN row"],
        ["apocLoad", "CALL apoc.load.json('https://example.invalid/x') YIELD value RETURN value"],
        ["createLabel", "CALL db.createLabel('BksShouldNotExist')"],
        ["dbmsConfig", "CALL dbms.listConfig() YIELD name RETURN name"],
        ["apocFn", "RETURN apoc.text.join(['a', 'b'], ',') AS j"],
      ] as const) attempts[`${name}.${k}`] = await refusal(client, q);
    }
    for (const [k, v] of Object.entries(attempts)) expect(v, k).not.toBeNull();
    expect(Number((await raw(admin, "MATCH (n:BksShouldNotExist) RETURN count(n) AS c"))[0]!.c)).toBe(0);
    expect((await raw(admin, "MATCH (o:Organization {uid: $u}) RETURN o.name AS n", { u: uid("org") }))[0]!.n).not.toBe("pwned");
    // The same statements are refused by the parser policy before any database call.
    for (const q of ["CREATE (:Organization {uid: 'x'}) RETURN 1 AS x", "MATCH (o:Organization) SET o.name = 'x' RETURN o.uid AS u", "LOAD CSV FROM 'file:///x' AS row RETURN row", "CALL apoc.load.json('https://example.invalid') YIELD value RETURN value", "MATCH (o:Organization) CALL { WITH o MATCH (b:Brand) RETURN b.uid AS b } IN TRANSACTIONS RETURN o.uid AS u", "CALL db.labels() YIELD label RETURN label"]) {
      const r = await cy(q);
      expect(["forbidden", "failed"], q).toContain(r.status);
      expect(r.receipt.plan, q).toBeNull();
    }
    // The executor's read-only proof: a write attempt as the reader principal is refused (always rolled back).
    const tx = await rInternal.session("WRITE").beginTransaction();
    const probe = await tx.run("CREATE (:BksReadAuthorityProbe)").then(() => null, (e: Error & { code?: string }) => e.code);
    await tx.rollback().catch(() => undefined);
    expect(String(probe)).toMatch(/Security/);
    record("reader-cannot-write", "pass", attempts);
  });

  it("consumer GraphQL under bks_reader_public: dbms.components, SHOW INDEXES / CONSTRAINTS and the full release marker are readable; writes and admin procedures stay refused", async () => {
    for (const [name, c] of [["public", rPublic], ["internal", rInternal]] as const) {
      // the calls @neo4j/graphql 7.6.3 and the API readiness check make, in a READ session as the reader principal
      const comp = await raw(c, "CALL dbms.components() YIELD name, versions, edition RETURN name, versions[0] AS version, edition");
      expect(comp[0]!.edition, name).toBe("enterprise");
      expect((await raw(c, "SHOW INDEXES YIELD name, state RETURN count(*) AS n"))[0]!.n, name).toBeGreaterThan(0);
      expect((await raw(c, "SHOW CONSTRAINTS YIELD name RETURN count(*) AS n"))[0]!.n, name).toBeGreaterThan(0);
      const marker = (await raw(c, "MATCH (m:KsReleaseMarker) RETURN m.releaseId AS releaseId, m.schemaReleaseDigest AS d, m.installedAt AS installedAt, m.migrationRunId AS run, m.ddlDigest AS ddl"))[0]!;
      expect([marker.releaseId, marker.d, marker.run], name).toEqual([model.releaseId, R, `s4-fixture-${stamp}`]);
      expect(marker.installedAt, name).not.toBeNull();
      expect(marker.ddl, name).toMatch(/^sha256:/);
      expect(await refusal(c, "CREATE (:BksShouldNotExist {k: 2})"), name).not.toBeNull();
      expect(await refusal(c, "CALL dbms.listConfig() YIELD name RETURN name", "READ"), name).not.toBeNull();
      expect(await refusal(c, "CALL dbms.security.clearAuthCache()", "READ"), name).not.toBeNull();
      expect(await refusal(c, "CALL dbms.setConfigValue('db.logs.query.enabled', 'OFF')", "READ"), name).not.toBeNull();
    }
    expect(Number((await raw(admin, "MATCH (n:BksShouldNotExist) RETURN count(n) AS c"))[0]!.c)).toBe(0);
    // APOC functions: the one the library emits works; every other APOC function and every APOC procedure is refused.
    const apocNames = ((await raw(admin, "SHOW FUNCTIONS YIELD name WHERE name STARTS WITH 'apoc.' RETURN collect(name) AS n"))[0]!.n as string[]).sort();
    const uncovered = apocNames.filter((f) => !ALLOWED_APOC_FUNCTIONS.includes(f) && !functionDenied(f));
    expect(uncovered, "APOC functions on this server not covered by the reader deny list").toEqual([]);
    for (const [name, c] of [["public", rPublic], ["internal", rInternal]] as const) {
      const conv = await raw(c, "RETURN apoc.date.convertFormat('2026-10-12', 'date', 'yyyy-MM-dd') AS d");
      expect(conv[0]!.d, name).toBe("2026-10-12");
      for (const q of [
        "RETURN apoc.text.join(['a', 'b'], ',') AS j",
        "RETURN apoc.date.format(0, 'ms', 'yyyy') AS y",
        "RETURN apoc.cypher.runFirstColumnSingle('RETURN 1', {}) AS x",
        "CALL apoc.load.json('https://example.invalid/x') YIELD value RETURN value",
        "CALL apoc.cypher.run('MATCH (n) RETURN count(n) AS c', {}) YIELD value RETURN value",
        "CALL apoc.cypher.doIt('CREATE (:BksShouldNotExist)', {}) YIELD value RETURN value",
        "CALL apoc.create.node(['BksShouldNotExist'], {}) YIELD node RETURN node",
        "CALL apoc.periodic.iterate('RETURN 1', 'CREATE (:BksShouldNotExist)', {}) YIELD batches RETURN batches",
      ]) expect(await refusal(c, q, "READ"), `${name}: ${q}`).toMatch(/Security|not allowed|Forbidden/i);
    }
    expect(Number((await raw(admin, "MATCH (n:BksShouldNotExist) RETURN count(n) AS c"))[0]!.c)).toBe(0);
    record("graphql-reader-principal", "pass", { apocFunctionsOnServer: apocNames.length, apocAllowed: ALLOWED_APOC_FUNCTIONS, allowed: ["dbms.components", "SHOW INDEXES", "SHOW CONSTRAINTS", "KsReleaseMarker {releaseId, schemaReleaseDigest, installedAt, migrationRunId, ddlDigest}"], stillRefused: ["CREATE", "dbms.listConfig", "dbms.security.clearAuthCache", "dbms.setConfigValue"] });
  });

  it("RBAC visibility (bypassing the parser): cross-scope uid probing, existence/count inference, restricted-property filters and span projections are denied; legacy and operational records invisible to both roles", async () => {
    const secret = uid("secret");
    const probe = "MATCH (o:Organization {uid: $u}) RETURN count(o) AS c";
    expect(Number((await raw(rPublic, probe, { u: secret }))[0]!.c)).toBe(0);
    expect(Number((await raw(rInternal, probe, { u: secret }))[0]!.c)).toBe(1);
    const viaAssertion = "MATCH (a:Assertion)-[:HAS_SUBJECT]->(o:Organization) WHERE o.uid = $u RETURN count(a) AS c";
    expect(Number((await raw(rPublic, viaAssertion, { u: secret }))[0]!.c)).toBe(0);
    const total = "MATCH (o:Organization) RETURN count(o) AS c";
    const pubCount = Number((await raw(rPublic, total))[0]!.c);
    const intCount = Number((await raw(rInternal, total))[0]!.c);
    expect(intCount - pubCount).toBeGreaterThanOrEqual(1);
    const filter = "MATCH (l:SourceLocator) WHERE l.exact CONTAINS 'activates' RETURN count(l) AS c";
    expect(Number((await raw(rPublic, filter))[0]!.c)).toBe(0);
    expect(Number((await raw(rInternal, filter))[0]!.c)).toBeGreaterThanOrEqual(1);
    const span = "MATCH (l:SourceLocator {uid: $u}) RETURN l.exact AS exact, l.selectorDigest AS d";
    const ps = (await raw(rPublic, span, { u: fx.locators["l-claim"]!.uid }))[0]!;
    expect(ps.exact).toBeNull();
    expect(ps.d).toBeTruthy();
    for (const c of [rPublic, rInternal]) {
      const labels = (await raw(c, "MATCH (n) UNWIND labels(n) AS l RETURN collect(DISTINCT l) AS ls"))[0]!.ls as string[];
      expect(labels.filter((l) => /^LegacyV0|^KsIntentMarker$|^Document$/.test(l))).toEqual([]);
      expect(Number((await raw(c, "MATCH ()-[r:MIGRATED_FROM]->() RETURN count(r) AS c"))[0]!.c)).toBe(0);
      expect(Number((await raw(c, "MATCH (n {uid: $u}) RETURN count(n) AS c", { u: legacyUid }))[0]!.c)).toBe(0);
      expect((await raw(c, "MATCH (n) WHERE n.legacyLabels IS NOT NULL RETURN count(n) AS c"))[0]!.c).toBe(0);
    }
    // Aliasing defeats the static property check but not the database: the public role reads null.
    const alias = await cy("MATCH (l:SourceLocator {uid: $u}) WITH l AS z RETURN z.exact AS t", { u: fx.locators["l-claim"]!.uid }, { binding: "ee-public" });
    expect(alias.status).toBe("ok");
    expect(alias.parts[0]!.rows[0]!.t).toBeNull();
    // Through the service the static policy refuses the direct forms first.
    expect((await cy("MATCH (l:SourceLocator) WHERE l.exact CONTAINS $q RETURN l.uid AS u", { q: "activates" }, { binding: "ee-public" })).parts[0]!.reasons.map((x) => x.code)).toContain("PROPERTY_FORBIDDEN");
    expect((await cy("MATCH (n:LegacyV0_Product) RETURN n.name AS n", {}, { binding: "ee-internal" })).parts[0]!.reasons.map((x) => x.code)).toContain("LABEL_FORBIDDEN");
    const pubSvc = await cy("MATCH (o:Organization {uid: $u}) RETURN o.uid AS uid", { u: secret }, { binding: "ee-public" });
    expect(pubSvc.status).toBe("empty");
    record("rbac-visibility", "pass", { publicOrganizations: pubCount, internalOrganizations: intCount });
  });

  it("governed Cypher artifacts: SPECIFICATION 6.1 example runs with exact digest and declared columns; EXPLAIN route; template on an RBAC public binding", async () => {
    const stmt = "MATCH (p:Package {uid: $uid})-[:HAS_LABEL_VERSION]->(v:LabelVersion) RETURN v.uid AS uid ORDER BY uid LIMIT $limit";
    const r = await cy(stmt, { uid: uid("package"), limit: 25 }, { schema: { uid: { type: "string", pattern: "^hu:" }, limit: { type: "integer" } }, ordering: "statement", columns: ["uid"], limits: { rowCap: 25, byteCap: 262144, timeoutMs: 5000 } });
    expect(r.status, JSON.stringify(r.parts[0]!.reasons)).toBe("ok");
    expect(r.parts[0]!.rows.map((x) => x.uid)).toEqual([uid("lv1"), uid("lv2")].sort());
    expect(r.query.statementDigest).toMatch(/^sha256:/);
    expect((r.receipt.plan as Record<string, { operators: string[] }>).cypher!.operators.length).toBeGreaterThan(0);
    const wrongCols = await cy(stmt, { uid: uid("package"), limit: 25 }, { schema: { uid: { type: "string" }, limit: { type: "integer" } }, ordering: "statement", columns: ["notUid"] });
    expect([wrongCols.status, wrongCols.parts[0]!.reasons[0]!.code]).toEqual(["failed", "RESULT_SCHEMA_MISMATCH"]);
    const ex = await svc.explain({ schemaVersion: CYPHER_READ_INTENT_V1, intentId: "ex", pins: { schemaReleaseDigest: R }, purpose: "p", bindingRef: "ee-internal", statement: stmt, parameters: { uid: uid("package"), limit: 25 }, parameterSchema: { uid: { type: "string" }, limit: { type: "integer" } }, ordering: "statement" }, READER);
    expect(ex.accepted).toBe(true);
    expect(ex.plan).not.toBeNull();
    const bad = await svc.explain({ schemaVersion: CYPHER_READ_INTENT_V1, intentId: "ex2", pins: { schemaReleaseDigest: R }, purpose: "p", bindingRef: "ee-internal", statement: "MATCH (n) RETURN n" }, READER);
    expect(bad.accepted).toBe(false);
    const t = svc.catalog.get("K/Q-K-17")!;
    const tpl = await svc.cypher({ schemaVersion: CYPHER_READ_INTENT_V1, intentId: "tpl", pins: { schemaReleaseDigest: R }, purpose: "p", bindingRef: "ee-public", template: { id: t.id, statementDigest: t.statementDigest }, parameters: { reportUid: mint("r-report.report") } }, READER);
    expect(tpl.status).toBe("ok");
    const forgedTpl = await svc.cypher({ schemaVersion: CYPHER_READ_INTENT_V1, intentId: "tpl2", pins: { schemaReleaseDigest: R }, purpose: "p", bindingRef: "ee-public", template: { id: t.id, statementDigest: `sha256:${"a".repeat(64)}` }, parameters: { reportUid: mint("r-report.report") } }, READER);
    expect([forgedTpl.status, forgedTpl.parts[0]!.reasons[0]!.code]).toEqual(["stale", "CATALOG_MISMATCH"]);
    const adminAdhoc = await cy(stmt, { uid: uid("package"), limit: 25 }, { binding: "ee-admin", schema: { uid: { type: "string" }, limit: { type: "integer" } } });
    expect([adminAdhoc.status, adminAdhoc.parts[0]!.reasons[0]!.code]).toEqual(["unsupported", "READ_AUTHORITY_UNAVAILABLE"]);
    record("cypher-artifacts", "pass", { statementDigest: r.query.statementDigest, resultDigest: r.digests.resultDigest });
  });

  it("bounds on Cypher artifacts: high fanout collect capped (LIST_CAP), nested collected values capped, nesting cap, row overflow probe, byte cap, deadline", async () => {
    const fan = await cy("MATCH (a:Assertion) WITH collect(a.uid) AS uids MATCH (c:Claim {uid: $c}) RETURN uids, [{claim: c.uid, occurrences: COLLECT { MATCH (c)<-[:OCCURRENCE_OF]-(o:Assertion) RETURN o.uid }}] AS nested", { c: uid("claim") }, { limits: { listCap: 2 } });
    expect(fan.status, JSON.stringify(fan.parts[0]!.reasons)).toBe("truncated");
    expect((fan.parts[0]!.rows[0]!.uids as unknown[]).length).toBe(2);
    expect(((fan.parts[0]!.rows[0]!.nested as Array<{ occurrences: unknown[] }>)[0]!.occurrences).length).toBe(2);
    expect(fan.parts[0]!.reasons.map((r) => r.code)).toContain("LIST_CAP");
    const deep = await cy("MATCH (o:Organization {uid: $u}) RETURN [[[[[[o.uid]]]]]] AS deep", { u: uid("org") }, { limits: { nestingCap: 3 } });
    expect([deep.status, deep.parts[0]!.reasons[0]!.code]).toEqual(["failed", "NESTING_CAP"]);
    const rows = await cy("MATCH (a:Assertion) RETURN a.uid AS uid ORDER BY uid", {}, { limits: { rowCap: 5 }, ordering: "statement" });
    expect([rows.status, rows.parts[0]!.rows.length, rows.parts[0]!.reasons[0]!.code]).toEqual(["truncated", 5, "ROW_CAP"]);
    const bytes = await cy("MATCH (a:Assertion) RETURN a.uid AS uid, a.predicate AS p", {}, { limits: { byteCap: 1024 } });
    expect([bytes.status, bytes.parts[0]!.reasons[0]!.code]).toEqual(["truncated", "BYTE_CAP"]);
    const t0 = Date.now();
    const slow = await cy("UNWIND range(1, 10000) AS a UNWIND range(1, 10000) AS b WITH a, b WHERE a * b = $neg RETURN a AS x", { neg: -1 }, { limits: { timeoutMs: 800 } });
    expect([slow.status, slow.reasons[0]?.code ?? slow.parts[0]?.reasons[0]?.code]).toEqual(["failed", "TIMEOUT"]);
    expect(Date.now() - t0).toBeLessThan(15_000);
    const whole = await cy("MATCH (o:Organization {uid: $u}) WITH o AS z RETURN z AS z", { u: uid("org") });
    expect(whole.status).toBe("forbidden");
    record("cypher-bounds", "pass", { timeoutMs: Date.now() - t0 });
  });

  it("stable_revision as a reader principal: the fence is readable, the read is revision-stable; the probe sees no operational marker", async () => {
    const r = await cy("MATCH (o:Organization {uid: $u}) RETURN o.uid AS uid", { u: uid("org") }, { mode: "stable_revision" });
    expect(r.status).toBe("ok");
    expect(r.consistency.graphRevision).toBeGreaterThan(0);
    expect(r.consistency.snapshotClaim).toBe(true);
    const t = await typed([{ opId: "c", op: "card", uid: uid("org") }]);
    expect(t.status).toBe("ok");
    record("stable-revision-reader", "pass", { graphRevision: r.consistency.graphRevision });
  });

  it("typed and native Cypher routes agree on gold questions (provenance trace, identifiers, report citations, current label version); public typed == public RBAC Cypher", async () => {
    const occ = mint("p-claim-occ.assertion");
    const sorted = (xs: unknown[]) => [...new Set(xs.map(String))].sort();
    const ty = await typed([
      { opId: "occ", op: "assertion", assertionUids: [occ] },
      { opId: "card", op: "card", uid: uid("nr") },
      { opId: "rep", op: "report", reportUid: mint("r-report.report") },
      { opId: "hist", op: "history", uid: uid("package"), relationshipType: "HAS_LABEL_VERSION" },
    ]);
    const p = (k: string) => ty.parts.find((x) => x.opId === k)!.rows;
    const loc = await cy("MATCH (a:Assertion {uid: $u})-[:HAS_EVIDENCE]->(l:SourceLocator) RETURN l.selectorDigest AS d", { u: occ });
    expect(sorted(loc.parts[0]!.rows.map((x) => x.d))).toEqual(sorted((p("occ")[0]!.evidence as Array<{ locator: { selectorDigest: string } }>).map((e) => e.locator.selectorDigest)));
    const ids = await cy("MATCH (s:ChemicalSubstance {uid: $u})-[h:HAS_IDENTIFIER]->(i:Identifier) WHERE h.recordedTo IS NULL RETURN i.scheme + '|' + i.issuer + '|' + i.value AS k", { u: uid("nr") });
    expect(sorted(ids.parts[0]!.rows.map((x) => x.k))).toEqual(sorted((p("card")[0]!.identifiers as Array<{ scheme: string; issuer: string; value: string }>).map((i) => `${i.scheme}|${i.issuer}|${i.value}`)));
    const cites = await cy("MATCH (r:Report {uid: $u})-[:DERIVED_FROM]->(a:Assertion) RETURN a.uid AS a", { u: mint("r-report.report") });
    expect(sorted(cites.parts[0]!.rows.map((x) => x.a))).toEqual(sorted((p("rep")[0]!.citesAssertions as Array<{ uid: string }>).map((x) => x.uid)));
    const cur = await cy("MATCH (p:Package {uid: $u})-[r:HAS_LABEL_VERSION]->(v:LabelVersion) WHERE r.recordedTo IS NULL RETURN v.uid AS v", { u: uid("package") });
    expect(sorted(cur.parts[0]!.rows.map((x) => x.v))).toEqual(sorted(p("hist").filter((h) => h.recordedState === "OPEN").map((h) => (h.target as { uid: string }).uid)));
    // Public scope: application-enforced typed list == database-enforced Cypher (same visible set).
    const tl = await typed([{ opId: "l", op: "list", nodeType: "Organization", limit: 500 }], "ee-public");
    const cl = await cy("MATCH (o:Organization) RETURN o.uid AS uid", {}, { binding: "ee-public", limits: { rowCap: 500 } });
    expect(sorted(tl.parts[0]!.rows.map((x) => (x.node as { uid: string }).uid))).toEqual(sorted(cl.parts[0]!.rows.map((x) => x.uid)));
    expect(sorted(cl.parts[0]!.rows.map((x) => x.uid))).not.toContain(uid("secret"));
    record("typed-vs-cypher-gold", "pass");
  });

  it("held questions promoted with proposed templates (patch for the schema authority), executed as governed artifacts with gold assertions", async () => {
    const byId = new Map(PROPOSED_TEMPLATES.map((t) => [t.id, t]));
    const run = (id: string, params: Record<string, unknown>) => {
      const t = byId.get(id)!;
      return cy(t.statement, params, { schema: t.parameters, ordering: /ORDER BY/.test(t.statement) ? "statement" : "set", columns: t.outputColumns });
    };
    const k09 = await run("K/Q-K-09", { claimUid: uid("claim") });
    expect(k09.status, JSON.stringify(k09.parts[0]!.reasons)).toBe("ok");
    const rows = k09.parts[0]!.rows;
    expect(sorted(rows.map((r) => r.occurrence))).toEqual(sorted([mint("p-claim-occ.assertion"), mint("p-account-occ.assertion"), mint("s4-deny.assertion")]));
    expect(rows.every((r) => (r.spans as unknown[]).length >= 1)).toBe(true);
    expect((rows[0]!.vetting as Array<{ disposition: string }>).map((v) => v.disposition)).toContain("RESEARCH");
    promotions.push({ questionId: "Q-K-09", route: "proposed-template:K/Q-K-09", test: "read-enterprise.integration.test.ts held-question promotion", verified: true, detail: `${rows.length} occurrences, spans and vetting asserted` });
    const k12 = await run("K/Q-K-12#identifiers", { uid: uid("nr") });
    const k12b = await run("K/Q-K-12#carrier", { scheme: "UNII", value: String(k12.parts[0]!.rows[0]?.value ?? "") });
    const typedCard = await typed([{ opId: "c", op: "card", uid: uid("nr") }, { opId: "r", op: "resolve", mentions: [{ mentionId: "m", identifiers: [{ scheme: "UNII", value: String(k12.parts[0]!.rows[0]?.value ?? "") }] }] }]);
    expect(k12.parts[0]!.rows.map((r) => `${r.scheme}|${r.value}`)).toEqual((typedCard.parts[0]!.rows[0]!.identifiers as Array<{ scheme: string; value: string }>).map((i) => `${i.scheme}|${i.value}`));
    expect(k12b.parts[0]!.rows.map((r) => r.uid)).toEqual([uid("nr")]);
    expect(typedCard.parts[1]!.rows.map((r) => r.uid)).toEqual([uid("nr")]);
    promotions.push({ questionId: "Q-K-12", route: "typed:card+resolve", test: "read-enterprise.integration.test.ts held-question promotion", verified: true, detail: "identifiers (scheme, issuer, value, validity) and reverse carrier lookup; typed and proposed-template routes agree" });
    const k11 = await run("K/Q-K-11", {});
    expect(k11.status).toBe("ok");
    expect(k11.parts[0]!.rows.map((r) => [r.claim, r.verdict])).toContainEqual([uid("claim"), "NOT_SUPPORTED"]);
    promotions.push({ questionId: "Q-K-11", route: "proposed-template:K/Q-K-11", test: "read-enterprise.integration.test.ts held-question promotion", verified: true, detail: "NOT_SUPPORTED evidence report on the fixture claim; repeatedSince computed" });
    record("held-promotions", "pass", promotions.map((p) => p.questionId));
    function sorted(xs: unknown[]) {
      return [...xs.map(String)].sort();
    }
  });

  it("D9/Q-D9-02 cost (lead request): cold planning time of the released and the corrected statement, plan shape", async () => {
    const t = svc.catalog.get("D9/Q-D9-02")!;
    const fixed = correctionsFor(svc.catalog.templates).find((c) => c.id === "D9/Q-D9-02")!;
    const time = async (stmt: string) => {
      await raw(admin, "CALL db.clearQueryCaches()", {}, "WRITE");
      const t0 = Date.now();
      const res = await admin.read((tx) => tx.run(`EXPLAIN ${stmt}`, { personUid: uid("person") }));
      const ms = Date.now() - t0;
      const ops: string[] = [];
      const visit = (p: { operatorType?: string; children?: unknown[] } | undefined) => {
        if (!p) return;
        ops.push(String(p.operatorType).replace(/@.*$/, ""));
        for (const c of p.children ?? []) visit(c as never);
      };
      visit(res.summary.plan as never);
      const t1 = Date.now();
      await admin.read((tx) => tx.run(stmt, { personUid: uid("person") }));
      return { planMs: ms, warmRunMs: Date.now() - t1, operators: ops.length, varLength: ops.filter((o) => /VarLength|ShortestPath/.test(o)), allNodes: ops.includes("AllNodesScan") };
    };
    const released = await time(t.statement);
    const corrected = await time(fixed.statement);
    record("q-d9-02-cost", "measured", { released, corrected });
    expect(corrected.allNodes).toBe(false);
  }, 300_000);

  it("skill examples marked enterprise run against the RBAC bindings", async () => {
    const manifest = JSON.parse(readFileSync(resolve(repo, ".agents", "skills", "biotech-kg-query", "examples", "examples.json"), "utf8")) as { examples: Array<{ id: string; route: "typed" | "cypher" | "explain"; edition: string; artifact: Record<string, unknown>; expect: Array<{ path: string; equals?: unknown; contains?: unknown; gte?: number; oneOf?: unknown[] }> }> };
    const subst = (v: unknown): unknown => {
      if (typeof v === "string") return v.replace(/\{\{(uid|mint|loc)\.([^}]+)\}\}/g, (_m, kind: string, key: string) => (kind === "uid" ? uid(key) : kind === "mint" ? mint(key) : fx.locators[key]!.uid)).replace(/{{digest.([^}]+)}}/g, (_m, id: string) => svc.catalog.get(id)!.statementDigest).replace(/{{release}}/g, R).replace(/{{stamp}}/g, stamp);
      if (Array.isArray(v)) return v.map(subst);
      if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, subst(x)]));
      return v;
    };
    const ran: Array<{ id: string; status: string; elapsedMs: number }> = [];
    for (const ex of manifest.examples.filter((e) => e.edition === "enterprise")) {
      const artifact = subst(ex.artifact) as Record<string, unknown>;
      const res = (ex.route === "explain" ? await svc.explain(artifact, READER) : ex.route === "typed" ? await svc.typed(artifact, READER) : await svc.cypher(artifact, READER)) as ReadResultV2 & Record<string, unknown>;
      for (const a of ex.expect) {
        const value = a.path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[/^\d+$/.test(k) ? Number(k) : k], res);
        if ("equals" in a) expect(value, `${ex.id} ${a.path}`).toEqual(subst(a.equals));
        if ("contains" in a) expect(JSON.stringify(value), `${ex.id} ${a.path}`).toContain(String(subst(a.contains)));
        if ("gte" in a) expect(Number(value), `${ex.id} ${a.path}`).toBeGreaterThanOrEqual(a.gte!);
        if ("oneOf" in a) expect(a.oneOf, `${ex.id} ${a.path}`).toContain(value);
      }
      ran.push({ id: ex.id, status: String(res.status ?? (res as { accepted?: boolean }).accepted), elapsedMs: Number((res.receipt as { elapsedMs?: number } | undefined)?.elapsedMs ?? 0) });
    }
    expect(ran.length).toBeGreaterThanOrEqual(3);
    record("skill-examples-enterprise", "pass", ran);
  });
});
