import { afterAll, beforeAll, describe, expect, it } from "vitest";
import neo4j from "neo4j-driver";
import { createActorVerifier } from "./actor.js";
import { createConsumerApp, type ConsumerApp } from "./app.js";
import { configFromEnv } from "./config.js";
import { loadCompatibilityMatrix, loadRequiredIndexes } from "./readiness.js";
import { loadRegistry } from "./registry.js";
import { actorKeys, consumerBuild, ENGINEERING_KEY, mintActorToken, SERVICE_KEY } from "./test/helpers.js";

/** HTTP-level rejection paths. The driver points at a closed port: everything here must be refused before execution. */
const keys = actorKeys();
const registry = loadRegistry();
const id = (name: string) => registry.registry.operations.find((o) => o.name === name)!.id;
const servers: ConsumerApp[] = [];
const drivers: ReturnType<typeof neo4j.driver>[] = [];

async function start(env: Record<string, string>): Promise<string> {
  const { source, build } = await consumerBuild();
  const config = configFromEnv({ BKS_BIOTECH_GRAPH_URI: "neo4j://127.0.0.1:1", BKS_BIOTECH_GRAPH_READER_USERNAME: "r", BKS_BIOTECH_GRAPH_READER_PASSWORD: "p", GRAPHQL_ACTOR_PUBLIC_KEY: keys.publicPem, GRAPHQL_API_KEY: SERVICE_KEY, NEO4J_CONNECTION_TIMEOUT_MS: "500", ...env });
  const driver = neo4j.driver(config.neo4j.uri, neo4j.auth.basic("r", "p"), { connectionTimeout: 500, maxConnectionPoolSize: 2, connectionAcquisitionTimeout: 500 });
  drivers.push(driver);
  const app = await createConsumerApp({
    config,
    source,
    build,
    registry,
    driver,
    actorVerifier: config.actor ? await createActorVerifier(config.actor) : null,
    matrix: loadCompatibilityMatrix(),
    requiredIndexes: loadRequiredIndexes(),
    log: () => {},
  });
  servers.push(app);
  await new Promise<void>((resolve) => app.httpServer.listen(0, "127.0.0.1", resolve));
  const address = app.httpServer.address();
  return `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
}

let product = "";
let engineering = "";
beforeAll(async () => {
  product = await start({});
  engineering = await start({ GRAPHQL_PROFILE: "engineering", GRAPHQL_ENGINEERING_KEY: ENGINEERING_KEY });
}, 60_000);
afterAll(async () => {
  for (const s of servers) await s.stop().catch(() => undefined);
  for (const d of drivers) await d.close();
});

async function post(base: string, body: unknown, headers: Record<string, string> = {}, auth: string | null | undefined = undefined) {
  const token = auth === undefined ? await mintActorToken(keys) : auth;
  const res = await fetch(`${base}/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": SERVICE_KEY, ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json: { errors?: Array<{ extensions?: { code?: string; reason?: string } }> } = {};
  try {
    json = JSON.parse(text);
  } catch {
    // not JSON
  }
  return { status: res.status, code: json.errors?.[0]?.extensions?.code, reason: json.errors?.[0]?.extensions?.reason, headers: res.headers };
}

describe("consumer API HTTP surface", () => {
  it("serves liveness without the database, and readiness reports the unreachable database", async () => {
    const live = await fetch(`${product}/healthz`);
    expect(live.status).toBe(200);
    const ready = await fetch(`${product}/readyz`);
    expect(ready.status).toBe(503);
    expect((await ready.json()).checks.connectivity.ok).toBe(false);
  });

  it("publishes the executable schema and identities", async () => {
    const { build, source } = await consumerBuild();
    const res = await fetch(`${product}/schema.graphql`);
    expect(await res.text()).toBe(build.printed);
    expect(res.headers.get("x-bks-executable-graphql-digest")).toBe(build.identity.executableGraphqlDigest);
    expect(res.headers.get("x-bks-operation-registry-digest")).toBe(registry.operationRegistryDigest);
    expect(res.headers.get("x-bks-release-id")).toBe(source.releaseId);
    const identity = await (await fetch(`${product}/identity`)).json();
    expect(identity).toMatchObject({
      schemaDigest: source.schemaDigest,
      productProjectionDigest: build.identity.productProjectionDigest,
      executableGraphqlDigest: build.identity.executableGraphqlDigest,
      operationRegistryDigest: registry.operationRegistryDigest,
      capabilities: { mutations: false, vector: "unsupported", persistedOperationsOnly: true },
    });
    expect(identity.libraryVersions["@neo4j/graphql"]).toBe("7.6.3");
  });

  it("requires the service credential and a verified actor context", async () => {
    const body = { documentId: id("ProductCard"), variables: { uid: "hu:product:x" } };
    expect((await post(product, body, { "x-api-key": "wrong" })).status).toBe(401);
    expect(await post(product, body, {}, null)).toMatchObject({ status: 401, reason: "ACTOR_TOKEN_MISSING" });
    expect(await post(product, body, {}, await mintActorToken(keys, { iatOffsetSeconds: -300 }))).toMatchObject({ status: 401, reason: "ACTOR_TOKEN_EXPIRED" });
    expect(await post(product, body, {}, await mintActorToken(actorKeys()))).toMatchObject({ status: 401, reason: "ACTOR_TOKEN_INVALID" });
  });

  it("rejects forged actor headers even with a valid token", async () => {
    const r = await post(product, { documentId: id("ProductCard"), variables: { uid: "hu:product:x" } }, { "x-user-id": "admin", "x-bks-visibility": "INTERNAL" });
    expect(r).toMatchObject({ status: 400, code: "ACTOR_HEADER_REJECTED" });
  });

  it("executes safelisted operations only", async () => {
    expect(await post(product, { query: "{ products { uid } }" })).toMatchObject({ status: 400, code: "PERSISTED_QUERY_REQUIRED" });
    expect(await post(product, { documentId: `sha256:${"a".repeat(64)}` })).toMatchObject({ status: 404, code: "PERSISTED_QUERY_NOT_FOUND" });
    expect(await post(product, { extensions: { persistedQuery: { version: 1, sha256Hash: "b".repeat(64) } }, query: "{ x }" })).toMatchObject({ status: 400 });
    expect(await post(product, { documentId: id("ProductCard"), variables: { uid: "hu:product:x", actorVisibility: ["INTERNAL"] } })).toMatchObject({ status: 400, code: "VARIABLES_INVALID" });
    expect(await post(product, { documentId: id("ProductVariantsPage"), variables: { uid: "hu:product:x", first: 500 } })).toMatchObject({ status: 400, code: "VARIABLES_OUT_OF_BOUNDS" });
  });

  it("answers vector/phrase requests with an explicit UNSUPPORTED before any provider or database work", async () => {
    expect(await post(product, { query: '{ productsVectorSearch(phrase: "sleep") { uid } }' })).toMatchObject({ status: 400, code: "BKS_UNSUPPORTED" });
    expect(await post(engineering, { query: '{ productsBySearch(phrase: "sleep") { uid } }' }, { "x-bks-engineering-key": ENGINEERING_KEY })).toMatchObject({ status: 400, code: "BKS_UNSUPPORTED" });
  });

  it("bounds the request: 256 KiB body, POST only, no batching", async () => {
    const big = JSON.stringify({ documentId: id("ProductCard"), variables: { uid: "hu:product:x" }, padding: "x".repeat(300 * 1024) });
    expect(await post(product, big)).toMatchObject({ status: 413, code: "REQUEST_TOO_LARGE" });
    expect((await fetch(`${product}/graphql?query=%7Bproducts%7Buid%7D%7D`)).status).toBe(405);
    expect(await post(product, [{ documentId: id("ProductCard") }, { documentId: id("ProductCard") }])).toMatchObject({ status: 400, code: "BAD_REQUEST" });
  });

  it("engineering profile: separately authenticated, free-form but still admission-bounded and read-only", async () => {
    const eng = { "x-bks-engineering-key": ENGINEERING_KEY };
    expect((await post(engineering, { query: "{ products(limit: 1) { uid } }" }, {}, null)).status).toBe(401);
    expect(await post(engineering, { query: "mutation { x }" }, eng)).toMatchObject({ status: 400, code: "BKS_UNSUPPORTED" });
    expect(await post(engineering, { query: "{ studyArms(limit: 2) { statedIn { __typename } } }" }, eng)).toMatchObject({ status: 400, code: "UNBOUNDED_UNION_FIELD" });
    expect(await post(engineering, { query: "{ products(limit: 101) { uid } }" }, eng)).toMatchObject({ status: 400, code: "LIMIT_EXCEEDED" });
    const deep = "{ products(limit: 1) { variants(limit: 1) { packages(limit: 1) { labelVersions(limit: 1) { responsibleParty(limit: 1) { holdsStakes(limit: 1) { subsidiaries(limit: 1) { holdsStakes(limit: 1) { uid } } } } } } } } }";
    const r = await fetch(`${engineering}/graphql`, { method: "POST", headers: { "content-type": "application/json", "x-api-key": SERVICE_KEY, ...eng }, body: JSON.stringify({ query: deep }) });
    expect(r.status).toBe(400);
    expect(JSON.stringify(await r.json())).toMatch(/Query depth 9 exceeds the maximum of 8/);
  });
});
