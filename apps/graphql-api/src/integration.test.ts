import { afterAll, beforeAll, describe, expect, it } from "vitest";
import neo4j, { type Driver } from "neo4j-driver";
import { createActorVerifier } from "./actor.js";
import { createConsumerApp, type ConsumerApp } from "./app.js";
import { configFromEnv } from "./config.js";
import { encodeCursorOffset } from "./limits.js";
import { loadCompatibilityMatrix, loadRequiredIndexes, type CompatibilityMatrix } from "./readiness.js";
import { loadRegistry } from "./registry.js";
import { actorKeys, consumerBuild, ENGINEERING_KEY, mintActorToken, SERVICE_KEY } from "./test/helpers.js";
import { generateFixture, loadFixture, loadFixtureIr, uniquePropertiesFromDdl, wipeSyntheticFixture, type Fixture, type FixtureNode } from "../bench/fixture.js";

/**
 * Integration (BKS_INTEGRATION=1, disposable Neo4j at NEO4J_TEST_URI): every safelisted operation on synthetic v2
 * fixtures, pagination correctness, visibility through counts/filters/cards/identifiers, readiness against the
 * release marker, response-size cap, end-to-end deadline and the database time limit.
 */
const enabled = process.env.BKS_INTEGRATION === "1" && Boolean(process.env.NEO4J_TEST_URI);
const URI = process.env.NEO4J_TEST_URI ?? "neo4j://127.0.0.1:7692";
const PASSWORD = process.env.NEO4J_TEST_PASSWORD ?? "bks-test-password";
const SET = "s6-itest";
const keys = actorKeys();
const registry = loadRegistry();
const id = (name: string) => registry.registry.operations.find((o) => o.name === name)!.id;

let driver: Driver;
let fixture: Fixture;
const apps: ConsumerApp[] = [];

async function start(env: Record<string, string> = {}, matrix?: CompatibilityMatrix, requirements = true): Promise<{ base: string; app: ConsumerApp }> {
  const built = await consumerBuild();
  const build = built.build;
  // Without requirements the readiness check ignores both the consumer index list and the release DDL (the itest
  // graph is not migrated); the default path checks everything.
  const source = requirements ? built.source : { ...built.source, ddl: [] };
  const config = configFromEnv({ BKS_BIOTECH_GRAPH_URI: URI, BKS_BIOTECH_GRAPH_READER_USERNAME: "neo4j", BKS_BIOTECH_GRAPH_READER_PASSWORD: PASSWORD, BKS_BIOTECH_GRAPH_DATABASE: "neo4j", GRAPHQL_ACTOR_PUBLIC_KEY: keys.publicPem, GRAPHQL_API_KEY: SERVICE_KEY, ...env });
  const app = await createConsumerApp({
    config,
    source,
    build,
    registry,
    driver,
    actorVerifier: config.actor ? await createActorVerifier(config.actor) : null,
    matrix: matrix ?? loadCompatibilityMatrix(),
    requiredIndexes: requirements ? loadRequiredIndexes() : { format: "bks-consumer-index-requirements.v1", requirements: [] },
    log: () => {},
  });
  apps.push(app);
  await new Promise<void>((r) => app.httpServer.listen(0, "127.0.0.1", r));
  const a = app.httpServer.address();
  return { base: `http://127.0.0.1:${typeof a === "object" && a ? a.port : 0}`, app };
}

async function gql(base: string, name: string, variables: Record<string, unknown>, vis: string[] = ["PUBLIC"]) {
  const res = await fetch(`${base}/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": SERVICE_KEY, authorization: `Bearer ${await mintActorToken(keys, { vis })}` },
    body: JSON.stringify({ documentId: id(name), variables }),
  });
  return { status: res.status, body: (await res.json()) as { data?: Record<string, any>; errors?: Array<{ message: string; extensions?: { code?: string } }> } };
}

function clone(template: FixtureNode, uid: string, privacyClass: string | null): Record<string, unknown> {
  const props: Record<string, unknown> = { ...template.props, uid, id: uid.split(":").pop(), fixtureSet: SET, syntheticFixture: true };
  if (privacyClass) props.privacyClass = privacyClass;
  else delete props.privacyClass;
  return props;
}

let base = "";
const U = {
  pub: "hu:product:itest-vis-pub",
  int: "hu:product:itest-vis-int",
  hub: "hu:product:itest-hub",
};

describe.skipIf(!enabled)("consumer API integration (disposable Neo4j)", () => {
  beforeAll(async () => {
    driver = neo4j.driver(URI, neo4j.auth.basic("neo4j", PASSWORD), { maxConnectionPoolSize: 10 });
    await wipeSyntheticFixture(driver, "neo4j", SET);
    const { source } = await consumerBuild();
    const ir = loadFixtureIr(source);
    fixture = generateFixture(ir, { counts: {}, defaultCount: 12, fixtureSet: SET, uidPrefix: "itest", seed: 7, publicShare: 1, internalShare: 0, uniqueProperties: uniquePropertiesFromDdl(source.ddl) });
    await loadFixture(driver, "neo4j", fixture);
    const t = (type: string) => fixture.byType.get(type)![0]!;
    const s = driver.session({ database: "neo4j" });
    try {
      const create = (label: string, props: Record<string, unknown>) => s.run(`CREATE (n:\`${label}\`:Entity) SET n = $props`, { props });
      await create("Product", clone(t("Product"), U.pub, "PUBLIC"));
      await create("Product", clone(t("Product"), U.int, "INTERNAL"));
      await create("Product", clone(t("Product"), U.hub, "PUBLIC"));
      const variants: Array<[string, string | null]> = [["hu:product-variant:itest-v-pub", "PUBLIC"], ["hu:product-variant:itest-v-int", "INTERNAL"], ["hu:product-variant:itest-v-null", null]];
      for (const [uid, pc] of variants) await create("ProductVariant", clone(t("ProductVariant"), uid, pc));
      await s.run("MATCH (p:Product {uid: $p}), (v:ProductVariant) WHERE v.uid IN $vs CREATE (p)-[:HAS_VARIANT {orderIndex: 0, syntheticFixture: true}]->(v)", { p: U.pub, vs: variants.map((v) => v[0]) });
      for (let i = 0; i < 60; i++) await create("ProductVariant", clone(t("ProductVariant"), `hu:product-variant:itest-hub-${String(i).padStart(2, "0")}`, "PUBLIC"));
      await s.run("MATCH (p:Product {uid: $p}), (v:ProductVariant) WHERE v.uid STARTS WITH 'hu:product-variant:itest-hub-' CREATE (p)-[:HAS_VARIANT {orderIndex: 0, syntheticFixture: true}]->(v)", { p: U.hub });
      const assertion = t("Assertion");
      await s.run("CREATE (a:Assertion) SET a = $props", { props: clone(assertion, "hu:assertion:itest-about-int", "PUBLIC") });
      await s.run("CREATE (a:Assertion) SET a = $props", { props: clone(assertion, "hu:assertion:itest-about-pub", "PUBLIC") });
      await s.run("MATCH (a:Assertion {uid: 'hu:assertion:itest-about-int'}), (p:Product {uid: $p}) CREATE (a)-[:HAS_SUBJECT {syntheticFixture: true}]->(p)", { p: U.int });
      await s.run("MATCH (a:Assertion {uid: 'hu:assertion:itest-about-pub'}), (p:Product {uid: $p}) CREATE (a)-[:HAS_SUBJECT {syntheticFixture: true}]->(p)", { p: U.pub });
      const ident = t("Identifier");
      await s.run("CREATE (i:Identifier:Entity) SET i = $props", { props: { ...clone(ident, "hu:identifier:itest-1", "PUBLIC"), scheme: "gtin", value: "itest-vis-1" } });
      await s.run("CREATE (i:Identifier:Entity) SET i = $props", { props: { ...clone(ident, "hu:identifier:itest-2", "INTERNAL"), scheme: "gtin", value: "itest-vis-2" } });
      const link = { relationshipUid: "hu:relationship:itest", assertionUid: "hu:assertion:itest-about-pub", validFromBasis: "STATED_BY_SOURCE", validToBasis: "UNKNOWN", recordedFrom: neo4j.types.DateTime.fromStandardDate(new Date()), isPrimary: true, syntheticFixture: true };
      await s.run("MATCH (i:Identifier {uid: 'hu:identifier:itest-1'}), (p:Product) WHERE p.uid IN $ps CREATE (p)-[e:HAS_IDENTIFIER]->(i) SET e = $link", { ps: [U.pub, U.int], link });
      await s.run("MATCH (i:Identifier {uid: 'hu:identifier:itest-2'}), (p:Product {uid: $p}) CREATE (p)-[e:HAS_IDENTIFIER]->(i) SET e = $link", { p: U.pub, link });
    } finally {
      await s.close();
    }
    const first = await start();
    base = first.base;
    // Plan warm-up first: cold plans of the 69-branch Entity union can exceed the 5 s database limit.
    const warm = await first.app.awaitWarmup();
    expect(warm.state, warm.error).toBe("done");
  }, 600_000);

  afterAll(async () => {
    for (const a of apps) await a.stop().catch(() => undefined);
    if (driver) {
      await wipeSyntheticFixture(driver, "neo4j", SET);
      const s = driver.session({ database: "neo4j" });
      await s.run("MATCH (m:KsReleaseMarker {migrationRunId: 's6-itest'}) DELETE m");
      await s.close();
      await driver.close();
    }
  });

  it("executes every safelisted operation on v2 fixtures without errors", async () => {
    const first = (type: string) => fixture.byType.get(type)![0]!.uid;
    const ident = fixture.byType.get("Identifier")![0]!;
    const cases: Array<[string, Record<string, unknown>]> = [
      ["EntityCard", { uid: U.pub }],
      ["ProductCard", { uid: U.pub }],
      ["ProductVariantsPage", { uid: U.hub, first: 25 }],
      ["AssertionEvidenceTrace", { uid: first("Assertion") }],
      ["ProductLabelHistory", { uid: first("Product") }],
      ["PackageLabelHistoryPage", { packageUid: first("Package") }],
      ["ClaimView", { uid: first("Claim") }],
      ["ReportView", { uid: first("Report") }],
      ["ResolveIdentifier", { scheme: String(ident.props.scheme), value: String(ident.props.value) }],
    ];
    expect(cases.map((c) => c[0]).sort()).toEqual(registry.registry.operations.map((o) => o.name).sort());
    for (const [name, vars] of cases) {
      const r = await gql(base, name, vars, ["PUBLIC", "INTERNAL"]);
      expect(r.body.errors, `${name}: ${JSON.stringify(r.body.errors)}`).toBeUndefined();
      expect(r.status, name).toBe(200);
    }
  });

  it("paginates correctly: stable order, no duplicates, consistent totalCount and hasNextPage", async () => {
    const seen: string[] = [];
    let after: string | undefined;
    let pages = 0;
    for (;;) {
      const r = await gql(base, "ProductVariantsPage", { uid: U.hub, first: 25, ...(after ? { after } : {}) });
      const conn = r.body.data!.products[0].variantsConnection;
      expect(conn.totalCount).toBe(60);
      seen.push(...conn.edges.map((e: { node: { uid: string } }) => e.node.uid));
      pages++;
      if (!conn.pageInfo.hasNextPage) break;
      after = conn.pageInfo.endCursor;
    }
    expect(pages).toBe(3);
    expect(seen).toHaveLength(60);
    expect(new Set(seen).size).toBe(60);
    expect([...seen]).toEqual([...seen].sort());
    const beyond = await gql(base, "ProductVariantsPage", { uid: U.hub, first: 25, after: encodeCursorOffset(5000) });
    expect(beyond.status).toBe(400);
  });

  it("excluded records are not inferable through counts, filters, cards or identifiers", async () => {
    const pubVariants = await gql(base, "ProductVariantsPage", { uid: U.pub });
    expect(pubVariants.body.data!.products[0].variantsConnection.totalCount).toBe(1);
    const intVariants = await gql(base, "ProductVariantsPage", { uid: U.pub }, ["PUBLIC", "INTERNAL"]);
    expect(intVariants.body.data!.products[0].variantsConnection.totalCount).toBe(2); // null privacyClass stays hidden


    expect((await gql(base, "EntityCard", { uid: U.int })).body.data!.entities).toEqual([]);
    expect((await gql(base, "EntityCard", { uid: U.int }, ["PUBLIC", "INTERNAL"])).body.data!.entities).toHaveLength(1);
    expect((await gql(base, "ProductCard", { uid: U.int })).body.data!.products).toEqual([]);

    const one = await gql(base, "ResolveIdentifier", { scheme: "gtin", value: "itest-vis-1" });
    expect(one.body.data!.identifiers[0].identifies.map((e: { uid: string }) => e.uid)).toEqual([U.pub]);
    expect((await gql(base, "ResolveIdentifier", { scheme: "gtin", value: "itest-vis-1" }, ["PUBLIC", "INTERNAL"])).body.data!.identifiers[0].identifies).toHaveLength(2);
    expect((await gql(base, "ResolveIdentifier", { scheme: "gtin", value: "itest-vis-2" })).body.data!.identifiers).toEqual([]);
  });

  it("readiness compares the installed release marker with the compatibility matrix", { timeout: 300_000 }, async () => {
    const s = driver.session({ database: "neo4j" });
    await s.run("CREATE (:KsReleaseMarker {releaseId: 's6-itest-release', schemaReleaseDigest: 'sha256:itest', installedAt: datetime() + duration('P3650D'), migrationRunId: 's6-itest', syntheticFixture: true})");
    await s.close();
    const accepting = { ...loadCompatibilityMatrix(), accept: [{ releaseId: "s6-itest-release", schemaReleaseDigest: "sha256:itest", reason: "test" }], candidate: { releaseId: "s6-itest-release", schemaReleaseDigest: "sha256:itest", reason: "test" } };
    const okBase = (await start({}, accepting, false)).base;
    const ok = await (await fetch(`${okBase}/readyz`)).json();
    expect(ok.checks.release.ok, JSON.stringify(ok.checks)).toBe(true);
    expect(ok.checks.indexes.ok).toBe(true);
    // Readiness also waits for the plan warm-up of every safelisted operation.
    let ready = ok;
    for (let i = 0; i < 480 && !ready.ready; i++) {
      await new Promise((r) => setTimeout(r, 500));
      ready = await (await fetch(`${okBase}/readyz`)).json();
    }
    expect(ready.checks.warmup.state, JSON.stringify(ready.checks.warmup)).toBe("done");
    expect(ready.ready).toBe(true);
    const rejecting = await fetch(`${(await start({}, undefined, false)).base}/readyz`);
    expect(rejecting.status).toBe(503);
    expect((await rejecting.json()).checks.release.error).toMatch(/BKS_RELEASE_MISMATCH/);
    const skipped = await (await fetch(`${(await start({ GRAPHQL_READINESS_RELEASE_CHECK: "skip" }, undefined, false)).base}/readyz`)).json();
    expect(skipped.checks.release.skipped).toBe(true);
  });

  it("caps the response size", async () => {
    const small = (await start({ GRAPHQL_MAX_RESPONSE_BYTES: "300" })).base;
    const r = await gql(small, "ProductVariantsPage", { uid: U.hub, first: 25 });
    expect(r.status).toBe(400);
    expect(r.body.errors![0]!.extensions!.code).toBe("RESPONSE_TOO_LARGE");
  });

  it("enforces the end-to-end deadline and the database time limit", async () => {
    const tight = (await start({ GRAPHQL_DEADLINE_MS: "2", GRAPHQL_TX_TIMEOUT_MS: "1" })).base;
    const late = await fetch(`${tight}/graphql`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": SERVICE_KEY, authorization: `Bearer ${await mintActorToken(keys)}` },
      body: JSON.stringify({ documentId: id("ProductVariantsPage"), variables: { uid: U.hub } }),
    });
    expect(late.status).toBe(504);
    expect(((await late.json()) as { errors: Array<{ extensions: { code: string } }> }).errors[0]!.extensions.code).toBe("BKS_TIMEOUT");

    const eng = (await start({ GRAPHQL_PROFILE: "engineering", GRAPHQL_ENGINEERING_KEY: ENGINEERING_KEY, GRAPHQL_TX_TIMEOUT_MS: "1" })).base;
    // Admission-cheap but database-heavy: the relationship filter anchors on a full :Assertion scan with one EXISTS per
    // Subjectable implementer (the shape excluded from the safelist), so a 1 ms transaction limit always trips.
    const heavy = '{ assertionsConnection(first: 1, where: { subject: { some: { uid: { eq: "hu:none:none" } } } }) { totalCount } }';
    const res = await fetch(`${eng}/graphql`, { method: "POST", headers: { "content-type": "application/json", "x-api-key": SERVICE_KEY, "x-bks-engineering-key": ENGINEERING_KEY }, body: JSON.stringify({ query: heavy }) });
    const body = (await res.json()) as { errors?: Array<{ extensions?: { code?: string } }> };
    expect(body.errors?.[0]?.extensions?.code).toBe("BKS_TIMEOUT");
  });
});
