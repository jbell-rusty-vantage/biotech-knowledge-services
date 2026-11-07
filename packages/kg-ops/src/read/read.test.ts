import neo4j from "neo4j-driver";
import { describe, expect, it } from "vitest";
import { canonicalDigest, canonicalize } from "@bks/contracts";
import { clearReleaseCache, loadRelease } from "@bks/schema-workspace";
import { checkCypherRead, statementDigestOf } from "./cypher-policy.js";
import { CypherReadIntentV1, ReadIntentV2 } from "./contracts.js";
import { functionDenied, readerRoleStatements } from "./rbac.js";
import { CatalogTemplates } from "./templates.js";
import { TypedCompiler } from "./typed.js";
import { aggregateReadStatus } from "./service.js";

describe("request-level status summarizes answered parts; part statuses stay independent", () => {
  it("one refused / failed / skipped part never turns the whole read forbidden or failed", () => {
    expect(aggregateReadStatus(["empty", "forbidden"])).toBe("empty");
    expect(aggregateReadStatus(["ok", "forbidden", "failed"])).toBe("ok");
    expect(aggregateReadStatus(["ok", "truncated", "skipped"])).toBe("truncated");
    expect(aggregateReadStatus(["empty", "empty"])).toBe("empty");
    expect(aggregateReadStatus(["forbidden", "unsupported"])).toBe("forbidden");
    expect(aggregateReadStatus(["skipped", "failed"])).toBe("failed");
    expect(aggregateReadStatus(["unsupported"])).toBe("unsupported");
    expect(aggregateReadStatus([])).toBe("empty");
  });
});
import { bindParameter, decodeReadValue, normalizeValue, ValueLimitError } from "./values.js";
import { ReadModel } from "./visibility.js";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { repoRoot } from "@bks/schema-workspace";

/** Unit tests of the read service pieces that need no database (policy, serialization, digests, catalog, compile). */

const model = ReadModel.fromRelease();
const check = (q: string, scope: "public" | "internal" = "internal", maxDepth = 4) => checkCypherRead(q, { model, scope, maxDepth });
const codes = (q: string, scope: "public" | "internal" = "internal") => check(q, scope).reasons.map((r) => r.code);

describe("cypher read policy (grammar parser, conservative Cypher 5 subset)", () => {
  it("accepts a parameterized labelled read and records facts", () => {
    const v = check("MATCH (p:Package {uid: $uid})-[:HAS_LABEL_VERSION]->(v:LabelVersion) RETURN v.uid AS uid ORDER BY uid LIMIT $limit");
    expect(v.reasons).toEqual([]);
    expect(v.accepted).toBe(true);
    expect(v.facts.labels).toEqual(["LabelVersion", "Package"]);
    expect(v.facts.relationshipTypes).toEqual(["HAS_LABEL_VERSION"]);
    expect(v.facts.parameters).toEqual(["limit", "uid"]);
    expect(v.facts.hasFinalOrderBy).toBe(true);
    expect(v.facts.statementDigest).toBe(statementDigestOf("MATCH (p:Package {uid: $uid})-[:HAS_LABEL_VERSION]->(v:LabelVersion) RETURN v.uid AS uid ORDER BY uid LIMIT $limit"));
  });

  it("accepts CYPHER 5, subqueries, comprehensions, aggregates and bounded variable length", () => {
    for (const q of [
      "CYPHER 5 MATCH (a:Assertion {uid: $u}) RETURN a.predicate AS p",
      "MATCH (a:Assertion {uid: $u}) CALL { WITH a MATCH (a)-[:HAS_EVIDENCE]->(l:SourceLocator) RETURN count(l) AS n } RETURN n",
      "MATCH (a:Assertion {uid: $u}) MATCH (a)-[:HAS_SUBJECT]->(s:Entity) RETURN s.uid AS s",
      "MATCH (a:Assertion {uid: $u}) RETURN COUNT { (a)-[:HAS_EVIDENCE]->(:SourceLocator) } AS n, [x IN a.qualifiers WHERE x STARTS WITH 'segment:'] AS segs",
      "MATCH (c:Claim)<-[:OCCURRENCE_OF]-(a:Assertion) WITH c, collect(a.uid) AS occ RETURN c.uid AS claim, size(occ) AS n ORDER BY n DESC LIMIT 10",
      "MATCH (o:Organization {uid: $u})-[:OWNS_BRAND*1..2]->(b:Brand) RETURN DISTINCT b.uid AS brand",
      "MATCH (x:Assertion) WHERE x.uid IN $uids AND EXISTS { (x)-[:ASSERTED_BY]->(:Organization) } RETURN x.uid AS uid",
      "UNWIND $uids AS u MATCH (n:Entity {uid: u}) RETURN n {.uid, .name} AS n",
      "CALL db.index.fulltext.queryNodes('assertion_proposition', $q) YIELD node, score WITH node, score WHERE node:Assertion RETURN node.uid AS uid, score ORDER BY score DESC LIMIT 5",
    ]) expect(check(q).reasons, q).toEqual([]);
  });

  it("subquery expressions re-use outer labelled variables; the final ORDER BY is the outer RETURN's, not a subquery's", () => {
    const q = "MATCH (c:Claim {uid: $u}) RETURN c.uid AS claim, COLLECT { MATCH (c)<-[:OCCURRENCE_OF]-(o:Assertion) RETURN o.uid } AS occ ORDER BY claim";
    const v = check(q);
    expect(v.reasons).toEqual([]);
    expect(v.facts.hasFinalOrderBy).toBe(true);
    expect(check("MATCH (c:Claim {uid: $u}) RETURN c.uid AS claim, COLLECT { MATCH (c)<-[:OCCURRENCE_OF]-(o:Assertion) RETURN o.uid ORDER BY o.uid } AS occ").facts.hasFinalOrderBy).toBe(false);
    expect(codes("MATCH (c:Claim {uid: $u}) RETURN COUNT { MATCH (z)-[:OCCURRENCE_OF]->(c) } AS n")).toContain("LABEL_FORBIDDEN");
  });

  it.each([
    ["MATCH (n:Product) SET n.x = 1 RETURN n.uid", "CLAUSE_FORBIDDEN"],
    ["CREATE (n:Product {uid: 'hu:product:x'}) RETURN n.uid", "CLAUSE_FORBIDDEN"],
    ["MATCH (n:Product) DETACH DELETE n RETURN 1 AS x", "CLAUSE_FORBIDDEN"],
    ["MERGE (n:Product {uid: $u}) RETURN n.uid", "CLAUSE_FORBIDDEN"],
    ["MATCH (n:Product) REMOVE n.name RETURN n.uid", "CLAUSE_FORBIDDEN"],
    ["MATCH (n:Product) FOREACH (x IN [1] | SET n.k = x) RETURN n.uid", "CLAUSE_FORBIDDEN"],
    ["LOAD CSV FROM 'file:///etc/passwd' AS row RETURN row", "CLAUSE_FORBIDDEN"],
    ["MATCH (n:Product) CALL { WITH n MATCH (m:Brand) RETURN m } IN TRANSACTIONS RETURN n.uid", "CLAUSE_FORBIDDEN"],
    ["CALL apoc.load.json('https://example.test/x') YIELD value RETURN value", "PROCEDURE_FORBIDDEN"],
    ["CALL dbms.listConfig() YIELD name RETURN name", "PROCEDURE_FORBIDDEN"],
    ["CALL gds.graph.list() YIELD graphName RETURN graphName", "PROCEDURE_FORBIDDEN"],
    ["CALL db.labels() YIELD label RETURN label", "PROCEDURE_FORBIDDEN"],
    ["MATCH (n:Product) RETURN apoc.text.join([n.name], ',') AS j", "FUNCTION_FORBIDDEN"],
    ["MATCH (n:Product) RETURN properties(n) AS p", "FUNCTION_FORBIDDEN"],
    ["MATCH (n:Product) RETURN keys(n) AS k", "FUNCTION_FORBIDDEN"],
    ["MATCH (n:Product) RETURN elementId(n) AS id", "FUNCTION_FORBIDDEN"],
    ["MATCH (n:Product) RETURN n", "FULL_ENTITY_RETURN"],
    ["MATCH p = (n:Product)-[:HAS_VARIANT]->(v:ProductVariant) RETURN p", "FULL_ENTITY_RETURN"],
    ["MATCH (n:Product) RETURN *", "FULL_ENTITY_RETURN"],
    ["MATCH (n:Product) RETURN n {.*} AS m", "PROPERTY_FORBIDDEN"],
    ["MATCH (n:Product) RETURN n[$k] AS v", "PROPERTY_FORBIDDEN"],
    ["MATCH (n) RETURN n.uid AS uid", "LABEL_FORBIDDEN"],
    ["MATCH (n:LegacyV0) RETURN n.name AS name", "LABEL_FORBIDDEN"],
    ["MATCH (n:LegacyV0_Product) RETURN n.name AS name", "LABEL_FORBIDDEN"],
    ["MATCH (m:KsIntentMarker) RETURN m.effectKey AS k", "LABEL_FORBIDDEN"],
    ["MATCH (f:KsWriteFence) RETURN f.graphRevision AS r", "LABEL_FORBIDDEN"],
    ["MATCH (n:!Product) RETURN n.uid AS uid", "LABEL_FORBIDDEN"],
    ["MATCH (n:%) RETURN n.uid AS uid", "LABEL_FORBIDDEN"],
    ["MATCH (n:$($label)) RETURN n.uid AS uid", "LABEL_FORBIDDEN"],
    ["MATCH (n:Product)-[r]->(m:Brand) RETURN m.uid AS uid", "RELATIONSHIP_FORBIDDEN"],
    ["MATCH (n:Product)-[:MIGRATED_FROM]->(m:Product) RETURN m.uid AS uid", "RELATIONSHIP_FORBIDDEN"],
    ["MATCH (n:Product)-[:NOT_A_TYPE]->(m:Brand) RETURN m.uid AS uid", "RELATIONSHIP_FORBIDDEN"],
    ["MATCH (o:Organization)-[:OWNS_BRAND*]->(b:Brand) RETURN b.uid AS uid", "UNBOUNDED_PATTERN"],
    ["MATCH (o:Organization)-[:OWNS_BRAND*1..9]->(b:Brand) RETURN b.uid AS uid", "UNBOUNDED_PATTERN"],
    ["MATCH (o:Organization)(()-[:OWNS_BRAND]->(:Brand))+ RETURN o.uid AS uid", "UNBOUNDED_PATTERN"],
    ["CYPHER 25 MATCH (n:Product) RETURN n.uid AS uid", "CLAUSE_FORBIDDEN"],
    ["CYPHER runtime=parallel MATCH (n:Product) RETURN n.uid AS uid", "CLAUSE_FORBIDDEN"],
    ["CYPHER 25 MATCH (n:Product) LET x = n.uid RETURN x", "CLAUSE_FORBIDDEN"],
    ["MATCH (n:Product) LET x = n.uid RETURN x", "PARSE_REJECTED"],
    ["MATCH (a:Assertion) WITH count(*) AS c MATCH (a) RETURN a.uid AS uid", "LABEL_FORBIDDEN"],
    ["MATCH (a:Assertion) WITH a AS z RETURN z", "FULL_ENTITY_RETURN"],
    ["CYPHER 25 MATCH (n:Product) FILTER n.uid IS NOT NULL RETURN n.uid AS uid", "CLAUSE_FORBIDDEN"],
    ["EXPLAIN MATCH (n:Product) RETURN n.uid AS uid", "CLAUSE_FORBIDDEN"],
    ["PROFILE MATCH (n:Product) RETURN n.uid AS uid", "CLAUSE_FORBIDDEN"],
    ["USE system MATCH (n:Product) RETURN n.uid AS uid", "CLAUSE_FORBIDDEN"],
    ["SHOW USERS", "CLAUSE_FORBIDDEN"],
    ["CREATE USER x SET PASSWORD 'y'", "CLAUSE_FORBIDDEN"],
    ["GRANT ROLE admin TO bks_reader_test", "CLAUSE_FORBIDDEN"],
    ["MATCH (n:Product) RETURN n.uid AS uid; MATCH (m:Product) DETACH DELETE m", "PARSE_REJECTED"],
    ["MATCH (n:Product RETURN n", "PARSE_REJECTED"],
    ["MATCH (n:Product) RETURN n.legacyLabels AS l", "PROPERTY_FORBIDDEN"],
  ])("refuses %s (%s)", (q, code) => {
    const v = check(q);
    expect(v.accepted, q).toBe(false);
    expect(v.reasons.map((r) => r.code), q).toContain(code);
  });

  it("refuses restricted span properties in scope public (projection and filter) but not in scope internal", () => {
    const proj = "MATCH (a:Assertion {uid: $u})-[:HAS_EVIDENCE]->(l:SourceLocator) RETURN l.exact AS text";
    const filt = "MATCH (l:SourceLocator) WHERE l.exact CONTAINS $needle RETURN l.uid AS uid";
    const mapf = "MATCH (l:SourceLocator {exact: $t}) RETURN l.uid AS uid";
    const mapp = "MATCH (l:SourceLocator) RETURN l {.uid, .prefix} AS l";
    for (const q of [proj, filt, mapf, mapp]) {
      expect(codes(q, "public"), q).toContain("PROPERTY_FORBIDDEN");
      expect(codes(q, "internal"), q).toEqual([]);
    }
  });

  it("CALL { } IN TRANSACTIONS with a write and a disguised write in a subquery are both refused", () => {
    expect(codes("MATCH (n:Product) CALL { WITH n SET n.x = 1 } IN TRANSACTIONS OF 10 ROWS RETURN n.uid AS uid")).toEqual(expect.arrayContaining(["CLAUSE_FORBIDDEN"]));
    expect(codes("MATCH (n:Product) CALL { WITH n MERGE (m:Brand {uid: 'x'}) RETURN m } RETURN n.uid AS uid")).toContain("CLAUSE_FORBIDDEN");
  });
});

describe("bks-read-values.v1 serialization round trip", () => {
  const limits = { listCap: 5, nestingCap: 4 };
  const norm = (v: unknown) => normalizeValue(v, limits, { truncations: [] });

  it("null, booleans, strings, safe and unsafe integers, floats", () => {
    expect(norm(null)).toBeNull();
    expect(norm(true)).toBe(true);
    expect(norm("ä́")).toBe("ä́"); // no Unicode normalization
    expect(norm(neo4j.int(42))).toBe(42);
    expect(norm(neo4j.int("9007199254740993"))).toEqual({ $type: "Integer", value: "9007199254740993" });
    expect(norm(neo4j.int("-9223372036854775808"))).toEqual({ $type: "Integer", value: "-9223372036854775808" });
    expect(norm(2.5)).toBe(2.5);
    expect(norm(2)).toEqual({ $type: "Float", value: "2" });
    expect(norm(-0)).toEqual({ $type: "Float", value: "-0" });
    expect(norm(NaN)).toEqual({ $type: "Float", value: "NaN" });
    expect(norm(Infinity)).toEqual({ $type: "Float", value: "Infinity" });
    for (const v of [neo4j.int(42), neo4j.int("9007199254740993"), 2.5, NaN, -Infinity]) {
      const back = decodeReadValue(norm(v));
      expect(norm(back)).toEqual(norm(v));
    }
  });

  it("UTC instants, zoned datetimes, date-only values, durations and points", () => {
    const dt = new neo4j.types.DateTime(2026, 10, 1, 10, 0, 0, 500_000_000, 7200, null);
    expect(norm(dt)).toEqual({ $type: "DateTime", value: "2026-10-01T08:00:00.5Z", offsetSeconds: 7200 });
    const zoned = new neo4j.types.DateTime(2026, 3, 29, 3, 30, 0, 0, null, "Europe/Berlin");
    const z = norm(zoned) as { $type: string; value: string; zone: string };
    expect(z.zone).toBe("Europe/Berlin");
    const d = new neo4j.types.Date(2024, 2, 29);
    expect(norm(d)).toEqual({ $type: "Date", value: "2024-02-29" });
    const dur = new neo4j.types.Duration(14, 3, 3600, 5);
    expect(norm(dur)).toEqual({ $type: "Duration", value: "P14M3DT3600.000000005S" });
    const pt = new neo4j.types.Point(neo4j.int(4326), 13.4, 52.5);
    expect(norm(pt)).toEqual({ $type: "Point", srid: 4326, x: 13.4, y: 52.5 });
    for (const v of [dt, d, dur, pt]) expect(norm(decodeReadValue(norm(v)))).toEqual(norm(v));
  });

  it("caps lists (recorded truncation), refuses deep nesting and whole entities", () => {
    const state = { truncations: [] as Array<{ kind: "list"; limit: number; path: string }> };
    expect(normalizeValue([1, 2, 3, 4, 5, 6, 7].map((x) => neo4j.int(x)), limits, state, "$.x")).toEqual([1, 2, 3, 4, 5]);
    expect(state.truncations).toEqual([{ kind: "list", limit: 5, path: "$.x" }]);
    expect(() => norm([[[[[["deep"]]]]]])).toThrowError(ValueLimitError);
    const node = new neo4j.types.Node(neo4j.int(1), ["Product"], { uid: "hu:product:x" }, "4:x:1");
    expect(() => norm(node)).toThrowError(/whole node/);
  });

  it("binds catalog neo4jType DateTime parameters as driver temporal values", () => {
    const v = bindParameter("2026-10-01T00:00:00Z", { type: "string", neo4jType: "DateTime" });
    expect(neo4j.isDateTime(v as never)).toBe(true);
    expect(neo4j.isInt(bindParameter(5, { type: "integer" }) as never)).toBe(true);
    expect(bindParameter(0.5, { type: "number" })).toBe(0.5);
  });

  it("semantic digests are stable under key order and exclude nothing they should include", () => {
    const a = canonicalDigest({ status: "ok", rows: [{ b: 1, a: { $type: "Date", value: "2024-02-29" } }] });
    const b = canonicalDigest({ rows: [{ a: { value: "2024-02-29", $type: "Date" }, b: 1 }], status: "ok" });
    expect(a).toBe(b);
    expect(canonicalize({ x: { $type: "Integer", value: "9007199254740993" } })).toBe('{"x":{"$type":"Integer","value":"9007199254740993"}}');
  });
});

describe("contracts and catalog", () => {
  it("decodes the SPECIFICATION 6.1 Cypher artifact shape and the typed intent", () => {
    const c = CypherReadIntentV1.parse({ schemaVersion: "biotech-cypher-read-intent.v1", intentId: "inspect-label-01", pins: { schemaReleaseDigest: model.schemaReleaseDigest }, purpose: "Inspect known label versions", language: "CYPHER_5", statement: "MATCH (p:Package {uid: $uid})-[:HAS_LABEL_VERSION]->(v:LabelVersion) RETURN v.uid AS uid ORDER BY uid LIMIT $limit", parameters: { uid: "hu:package:x", limit: 25 }, parameterSchema: { uid: { type: "string", pattern: "^hu:" }, limit: { type: "integer" } }, resultSchemaRef: "bks.read.label-version-uids.v1", limits: { rowCap: 25, byteCap: 262144, timeoutMs: 5000 }, consistency: { mode: "observed" }, ordering: "statement" });
    expect(c.limits.listCap).toBe(200);
    expect(() => CypherReadIntentV1.parse({ ...c, template: { id: "K/Q-K-15", statementDigest: c.pins.schemaReleaseDigest } })).toThrow(/exactly one/);
    expect(() => CypherReadIntentV1.parse({ ...c, limits: { rowCap: 100000 } })).toThrow();
    const t = ReadIntentV2.parse({ schemaVersion: "biotech-knowledge-read-intent.v2", intentId: "t1", pins: { schemaReleaseDigest: model.schemaReleaseDigest }, purpose: "p", operations: [{ opId: "c", op: "card", uid: "hu:package:x" }] });
    expect(t.consistency.mode).toBe("observed");
  });

  it("catalog: every release template is loaded with its status and exact statement digest; parameter validation and binding", () => {
    const cat = new CatalogTemplates(model);
    const raw = (model.release.queryCatalog as { templates: Array<{ id: string; status: string }> }).templates;
    expect(cat.templates.length).toBe(raw.length);
    expect(cat.templates.length).toBeGreaterThan(0);
    expect(cat.templates.filter((t) => t.status === "supported").length).toBe(raw.filter((t) => t.status === "supported").length);
    for (const t of cat.templates) expect(t.statementDigest, t.id).toBe(statementDigestOf(t.statement));
    const t = cat.get("K/Q-K-15")!;
    expect(cat.unsupportedReason(t)).toBeNull();
    expect(cat.bind(t, {}).ok).toBe(false);
    const ok = cat.bind(t, { label: "Assertion", uid: "hu:assertion:x" });
    expect(ok.ok).toBe(true);
    expect(cat.bind(t, { label: "Assertion", uid: "not-a-uid" }).ok).toBe(false);
    expect(cat.unsupportedReason(cat.get("QP/G-2#2")!)?.code).toBe("TEMPLATE_UNSUPPORTED");
    // a vector template is never servable (release status unsupported, or native vectors disabled)
    expect(["TEMPLATE_UNSUPPORTED", "VECTOR_SEARCH_DISABLED"]).toContain(cat.unsupportedReason(cat.get("QP/P-04a")!)?.code);
  });

  it("typed compile: visibility predicates on every node variable, release properties only, no caller text", () => {
    const lim = ReadIntentV2.parse({ schemaVersion: "biotech-knowledge-read-intent.v2", intentId: "t", pins: { schemaReleaseDigest: model.schemaReleaseDigest }, purpose: "p", operations: [{ opId: "c", op: "card", uid: "hu:package:x" }] }).limits;
    const pub = new TypedCompiler(model, "public", lim);
    const card = pub.compile({ opId: "c", op: "card", uid: "hu:locator:x", neighborLimit: 0, view: {} } as never);
    expect(card.steps.length).toBe(1);
    const st = card.steps[0]!.statement;
    expect(st).toContain("privacyClass = 'PUBLIC'");
    expect(st).not.toContain(".exact");
    expect(st).not.toContain("properties(");
    const internal = new TypedCompiler(model, "internal", lim).compile({ opId: "c", op: "card", uid: "hu:locator:x", neighborLimit: 0, view: {} } as never);
    expect(internal.steps[0]!.statement).toContain(".exact");
    const list = pub.compile({ opId: "l", op: "list", nodeType: "SourceLocator", where: { exact: "x" }, limit: 5 } as never);
    expect(list.refused?.status).toBe("forbidden");
    const nb = pub.compile({ opId: "n", op: "neighbors", uid: "hu:package:x", relationshipTypes: ["MIGRATED_FROM"], direction: "BOTH", limit: 5, view: {} } as never);
    expect(nb.refused?.reasons[0]?.code).toBe("RELATIONSHIP_FORBIDDEN");
    // resolve: every mention runs a query; name without nodeType fans out over Entity with a per-mention overflow probe
    const byName = pub.compile({ opId: "r", op: "resolve", mentions: [{ mentionId: "m", name: "Acme", identifiers: [] }], limitPerMention: 5, identifierChain: true } as never);
    expect(byName.refused).toBeUndefined();
    expect(byName.steps.length).toBe(1);
    expect(byName.steps[0]!.statement).toContain("MATCH (n:`Entity`)");
    expect([byName.steps[0]!.rowCap, byName.steps[0]!.perStep]).toEqual([5, true]);
    const nothing = pub.compile({ opId: "r", op: "resolve", mentions: [{ mentionId: "m", identifiers: [] }], limitPerMention: 5, identifierChain: true } as never);
    expect([nothing.refused?.status, nothing.refused?.reasons[0]?.code]).toEqual(["unsupported", "PARAMETER_INVALID"]);
    const badUid = pub.compile({ opId: "r", op: "resolve", mentions: [{ mentionId: "m", uid: "hu:not-a-token:x", identifiers: [] }], limitPerMention: 5, identifierChain: true } as never);
    expect(badUid.refused?.reasons[0]?.code).toBe("UNKNOWN_TYPE");
    // documented contract limits: at most 50 mentions per resolve, lower-case mentionId / opId
    const base = { schemaVersion: "biotech-knowledge-read-intent.v2", intentId: "t", pins: { schemaReleaseDigest: model.schemaReleaseDigest }, purpose: "p" };
    expect(() => ReadIntentV2.parse({ ...base, operations: [{ opId: "r", op: "resolve", mentions: Array.from({ length: 51 }, (_, i) => ({ mentionId: `m${i}`, name: "x" })) }] })).toThrow();
    expect(() => ReadIntentV2.parse({ ...base, operations: [{ opId: "r", op: "resolve", mentions: [{ mentionId: "Mixed", name: "x" }] }] })).toThrow();
    expect(() => ReadIntentV2.parse({ ...base, operations: [{ opId: "r", op: "resolve", mentions: Array.from({ length: 50 }, (_, i) => ({ mentionId: `m${i}`, name: "x" })) }] })).not.toThrow();
    const assoc = pub.compile({ opId: "a", op: "association", anchorUid: "hu:condition:x", expansion: { ontology: "MONDO" }, limit: 5 } as never);
    expect(assoc.refused?.reasons[0]?.code).toBe("ONTOLOGY_ARTIFACT_ABSENT");
  });

  it("RBAC statements: public role is property-gated, span text denied, operational labels denied, no write grants", () => {
    const s = readerRoleStatements(model, "public").join("\n");
    expect(s).toContain("FOR (n) WHERE n.privacyClass = 'PUBLIC'");
    expect(s).toMatch(/DENY READ \{exact, prefix, suffix, selectorJson\} ON GRAPH `neo4j` NODES SourceLocator/);
    expect(s).toMatch(/DENY TRAVERSE ON GRAPH `neo4j` NODES .*LegacyV0.*KsIntentMarker|DENY TRAVERSE ON GRAPH `neo4j` NODES .*KsIntentMarker.*LegacyV0/);
    expect(s).toContain("DENY TRAVERSE ON GRAPH `neo4j` RELATIONSHIPS MIGRATED_FROM");
    expect(s).not.toMatch(/GRANT (WRITE|ALL|CREATE|SET|DELETE|MERGE|NAME)/);
    // consumer API needs: dbms.components stays executable, schema metadata readable, the full release marker readable
    expect(s).toContain("GRANT SHOW INDEX ON DATABASE `neo4j`");
    expect(s).toContain("GRANT SHOW CONSTRAINT ON DATABASE `neo4j`");
    expect(s).toMatch(/GRANT READ \{releaseId, schemaReleaseDigest, installedAt, migrationRunId, ddlDigest\} ON GRAPH `neo4j` NODES KsReleaseMarker/);
    const denyProc = s.split("\n").find((l) => l.startsWith("DENY EXECUTE PROCEDURE") && !l.includes("BOOSTED"))!;
    expect(denyProc).not.toMatch(/dbms\.\*|dbms\.components|dbms\.info\b|dbms\.routing/);
    expect(denyProc).toMatch(/dbms\.security\.\*.*dbms\.setConfigValue|dbms\.setConfigValue.*dbms\.security/s);
    expect(denyProc).toContain("apoc.*"); // every APOC procedure stays denied
    // functions: only the pure apoc.date.convertFormat (emitted by @neo4j/graphql) is executable
    const denyFn = s.split("\n").find((l) => l.startsWith("DENY EXECUTE FUNCTION"))!;
    expect(denyFn).not.toContain("apoc.*");
    expect(denyFn).not.toContain("apoc.date.convertFormat");
    expect(functionDenied("apoc.date.convertFormat")).toBe(false);
    for (const f of ["apoc.date.format", "apoc.date.parse", "apoc.text.join", "apoc.cypher.runFirstColumnSingle", "apoc.util.validatePredicate", "apoc.load.jsonParams", "apoc.version", "gds.util.asNode", "genai.vector.encode", "ai.text.embed"]) expect(functionDenied(f), f).toBe(true);
  });
});

describe("release-agnostic: the staged/raw release override loads and drives the same model", () => {
  const dir = resolve(repoRoot, "..", "biotech-meta", "docs", "schema", "releases", "biotech-schema-v2.0.0");
  it.skipIf(!existsSync(resolve(dir, "release.json")))("v2.0.0 (parent, byte-identical SDL and templates) as an override", () => {
    const other = new ReadModel(loadRelease({ dir }));
    expect(other.releaseId).toBe("biotech-schema-v2.0.0");
    expect(other.schemaReleaseDigest).not.toBe(model.schemaReleaseDigest);
    // Release-agnostic invariants (later releases may add or correct templates): the same code loads both catalogs,
    // every template keeps id -> exact statement digest, and ids present in both releases keep their digest unless the
    // later release corrected them.
    const older = new CatalogTemplates(other);
    const pinned = new CatalogTemplates(model);
    for (const t of older.templates) expect(t.statementDigest, t.id).toBe(statementDigestOf(t.statement));
    const shared = older.templates.filter((t) => pinned.get(t.id));
    expect(shared.length).toBeGreaterThan(0);
    const changed = shared.filter((t) => pinned.get(t.id)!.statementDigest !== t.statementDigest).map((t) => t.id);
    expect(changed.length).toBeLessThan(shared.length);
    expect(checkCypherRead("MATCH (p:Package {uid: $u}) RETURN p.uid AS uid", { model: other, scope: "internal", maxDepth: 4 }).accepted).toBe(true);
    clearReleaseCache();
  });
});

describe("reader roles: deny-list completeness against a captured server inventory (Aura 5.27 / APOC 2026.09)", () => {
  const inventory = resolve(repoRoot, "runs", "release-v2", "custody", "s9", "aura-functions-procedures.json");
  it.skipIf(!existsSync(inventory))("every governed function and every non-allowlisted procedure is denied for both roles", async () => {
    const { readFileSync } = await import("node:fs");
    const { PROCEDURE_ALLOWLIST } = await import("./visibility.js");
    const { ALLOWED_APOC_FUNCTIONS, ALLOWED_DBMS_PROCEDURES } = await import("./rbac.js");
    const inv = JSON.parse(readFileSync(inventory, "utf8")) as { functions: string[]; procedures: string[] };
    const globRe = (g: string) => new RegExp("^" + g.split("*").map((part) => part.replace(/[.+?^$()|[\]{}\\]/g, (c) => "\\" + c)).join(".*") + "$");
    for (const scope of ["internal", "public"] as const) {
      const st = readerRoleStatements(model, scope);
      const globs = (kind: string) => st.filter((x) => x.startsWith(`DENY EXECUTE ${kind} `)).flatMap((x) => x.slice(`DENY EXECUTE ${kind} `.length).replace(/ ON DBMS TO .*$/, "").split(",").map((y) => globRe(y.trim())));
      const f = globs("FUNCTION");
      const p = globs("PROCEDURE");
      const allowP = [...PROCEDURE_ALLOWLIST, ...ALLOWED_DBMS_PROCEDURES];
      expect(inv.functions.filter((n) => /^(apoc|gds|genai|ai)\./.test(n) && !ALLOWED_APOC_FUNCTIONS.includes(n) && !f.some((g) => g.test(n))), scope).toEqual([]);
      expect(inv.procedures.filter((n) => !allowP.includes(n) && !p.some((g) => g.test(n))), scope).toEqual([]);
      expect(inv.procedures.filter((n) => allowP.includes(n) && p.some((g) => g.test(n))), scope).toEqual([]);
    }
  });
});
