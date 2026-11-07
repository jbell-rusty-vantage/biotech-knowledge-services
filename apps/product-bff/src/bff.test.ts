import { createSecretKey, generateKeyPairSync, randomUUID } from "node:crypto";
import { createServer, type IncomingHttpHeaders, type Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createLocalJWKSet, exportJWK, SignJWT, type JWK } from "jose";
import { compatibility } from "@bks/graphql-client";
import { createActorVerifier, type VerifiedActor } from "@bks/graphql-api/actor";
import { createBffApp } from "./app.js";
import { bffConfigFromEnv } from "./config.js";

/** BFF unit tests against a stub upstream that verifies the actor context with the GraphQL server's own verifier. */
const ISSUER = "https://project.supabase.co/auth/v1";
const SERVICE_KEY = "bff-test-service-key-0123456789abcdef0123";
const session = generateKeyPairSync("ec", { namedCurve: "P-256" });
const actorPair = generateKeyPairSync("ed25519");
const sessionJwk: JWK = { ...(await exportJWK(session.publicKey)), kid: "session-1", alg: "ES256", use: "sig" };
const sessionKeys = createLocalJWKSet({ keys: [sessionJwk] });
const actorVerifier = await createActorVerifier({ issuer: "bks-product-bff", audience: "bks-graphql-api", publicKey: actorPair.publicKey.export({ type: "spki", format: "pem" }).toString() });

interface Seen {
  headers: IncomingHttpHeaders;
  body: Record<string, unknown>;
  actor: VerifiedActor | null;
}
const seen: Seen[] = [];
let upstream: Server;
let upstreamUrl = "";

beforeAll(async () => {
  upstream = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const auth = req.headers.authorization?.replace(/^Bearer /, "") ?? null;
    let actor: VerifiedActor | null = null;
    try {
      actor = await actorVerifier.verify(auth);
    } catch {
      actor = null;
    }
    seen.push({ headers: req.headers, body: JSON.parse(Buffer.concat(chunks).toString("utf8")), actor });
    res.writeHead(actor ? 200 : 401, { "content-type": "application/json", "x-bks-executable-graphql-digest": compatibility.executableGraphqlDigest, "set-cookie": "leak=1" });
    res.end(JSON.stringify(actor ? { data: { ok: true } } : { errors: [{ message: "no actor" }] }));
  });
  await new Promise<void>((r) => upstream.listen(0, "127.0.0.1", r));
  const a = upstream.address();
  upstreamUrl = `http://127.0.0.1:${typeof a === "object" && a ? a.port : 0}/graphql`;
});
afterAll(() => upstream.close());

const env = () => ({
  BKS_BIOTECH_DB_JWKS_URL: "https://project.supabase.co/auth/v1/.well-known/jwks.json",
  BKS_BIOTECH_DB_URL: "https://project.supabase.co",
  BFF_ACTOR_PRIVATE_KEY: actorPair.privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  BKS_GRAPHQL_URL: upstreamUrl,
  BKS_GRAPHQL_SERVICE_KEY: SERVICE_KEY,
});
const bff = () => createBffApp(bffConfigFromEnv(env()), { sessionKeys, log: () => {} }).app;

async function sessionToken(options: { sub?: string; exp?: number; iss?: string; aud?: string; role?: string; app?: Record<string, unknown>; user?: Record<string, unknown>; key?: Parameters<SignJWT["sign"]>[0]; alg?: string } = {}) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ role: options.role ?? "authenticated", app_metadata: options.app ?? {}, user_metadata: options.user ?? {} })
    .setProtectedHeader({ alg: options.alg ?? "ES256", kid: "session-1" })
    .setIssuer(options.iss ?? ISSUER)
    .setAudience(options.aud ?? "authenticated")
    .setSubject(options.sub ?? "user-123")
    .setIssuedAt(now)
    .setExpirationTime(options.exp ?? now + 3600)
    .sign(options.key ?? session.privateKey);
}

async function call(body: unknown, headers: Record<string, string> = {}) {
  const res = await bff().request("/graphql", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
  const json = (await res.json()) as { data?: unknown; errors?: Array<{ extensions?: { code?: string } }> };
  return { status: res.status, code: json.errors?.[0]?.extensions?.code, json, headers: res.headers };
}
const op = { documentId: compatibility.operations.ProductCard.id, variables: { uid: "hu:product:1" } };

describe("reference product BFF", () => {
  it("valid session -> forwards with the service credential and a verified, short-lived actor context", async () => {
    const before = seen.length;
    const r = await call(op, { authorization: `Bearer ${await sessionToken()}` });
    expect(r.status).toBe(200);
    expect(r.json).toEqual({ data: { ok: true } });
    expect(r.headers.get("set-cookie")).toBeNull();
    expect(r.headers.get("x-bks-executable-graphql-digest")).toBe(compatibility.executableGraphqlDigest);
    const s = seen[before]!;
    expect(s.headers["x-api-key"]).toBe(SERVICE_KEY);
    expect(s.actor).toMatchObject({ sub: "user-123", visibility: ["PUBLIC"], app: "bks-reference-bff" });
    expect(s.actor!.expiresAt - s.actor!.issuedAt).toBeLessThanOrEqual(120);
    expect(s.body).toEqual({ documentId: op.documentId, operationName: "ProductCard", variables: op.variables });
  });

  it("maps server-controlled entitlements (app_metadata) to visibility and ignores user_metadata", async () => {
    const before = seen.length;
    await call(op, { authorization: `Bearer ${await sessionToken({ app: { bks_entitlements: ["biotech:internal"] } })}` });
    expect(seen[before]!.actor!.visibility).toEqual(["INTERNAL", "PUBLIC"]);
    await call(op, { authorization: `Bearer ${await sessionToken({ user: { bks_entitlements: ["biotech:internal"] } })}` });
    expect(seen[before + 1]!.actor!.visibility).toEqual(["PUBLIC"]);
  });

  it("forged actor header -> denied before any upstream call", async () => {
    const before = seen.length;
    for (const h of ["x-user-id", "x-bks-actor", "x-bks-visibility", "x-api-key", "x-forwarded-user"]) {
      const r = await call(op, { authorization: `Bearer ${await sessionToken()}`, [h]: "INTERNAL" });
      expect(r, h).toMatchObject({ status: 400, code: "ACTOR_HEADER_REJECTED" });
    }
    expect(seen.length).toBe(before);
  });

  it("expired, missing, foreign-issuer, wrong-audience and forged sessions -> denied before any upstream call", async () => {
    const before = seen.length;
    expect(await call(op)).toMatchObject({ status: 401, code: "SESSION_MISSING" });
    expect(await call(op, { authorization: `Bearer ${await sessionToken({ exp: Math.floor(Date.now() / 1000) - 10 })}` })).toMatchObject({ status: 401, code: "SESSION_EXPIRED" });
    expect(await call(op, { authorization: `Bearer ${await sessionToken({ iss: "https://evil.example/auth/v1" })}` })).toMatchObject({ status: 401, code: "SESSION_INVALID" });
    expect(await call(op, { authorization: `Bearer ${await sessionToken({ aud: "service_role" })}` })).toMatchObject({ status: 401, code: "SESSION_INVALID" });
    const other = generateKeyPairSync("ec", { namedCurve: "P-256" }).privateKey;
    expect(await call(op, { authorization: `Bearer ${await sessionToken({ key: other })}` })).toMatchObject({ status: 401, code: "SESSION_INVALID" });
    expect(await call(op, { authorization: `Bearer ${await sessionToken({ key: createSecretKey(Buffer.from("guess")), alg: "HS256" })}` })).toMatchObject({ status: 401, code: "SESSION_INVALID" });
    expect(await call(op, { authorization: `Bearer ${await sessionToken({ role: "anon" })}` })).toMatchObject({ status: 403, code: "SESSION_ROLE" });
    expect(seen.length).toBe(before);
  });

  it("forwards safelisted persisted operations only", async () => {
    const before = seen.length;
    const auth = { authorization: `Bearer ${await sessionToken()}` };
    expect(await call({ query: "{ products { uid } }" }, auth)).toMatchObject({ status: 400, code: "PERSISTED_QUERY_REQUIRED" });
    expect(await call({ documentId: `sha256:${"f".repeat(64)}` }, auth)).toMatchObject({ status: 404, code: "PERSISTED_QUERY_NOT_FOUND" });
    expect(await call({ documentId: op.documentId, variables: [1] }, auth)).toMatchObject({ status: 400, code: "VARIABLES_INVALID" });
    expect(seen.length).toBe(before);
  });

  it("refuses incomplete configuration and over-long actor lifetimes", () => {
    expect(() => bffConfigFromEnv({ ...env(), BKS_BIOTECH_DB_JWKS_URL: "" })).toThrow(/BKS_BIOTECH_DB_JWKS_URL/);
    expect(() => bffConfigFromEnv({ ...env(), BFF_ACTOR_TTL_SECONDS: "600" })).toThrow(/\[5, 120\]/);
    expect(() => bffConfigFromEnv({ ...env(), BKS_GRAPHQL_SERVICE_KEY: "short", GRAPHQL_API_KEY: "" })).toThrow(/GRAPHQL_API_KEY/);
    expect(bffConfigFromEnv({ ...env(), GRAPHQL_URL: "http://x/graphql" }).upstream.url).toBe("http://x/graphql");
    expect(() => bffConfigFromEnv({ ...env(), NODE_ENV: "production", BKS_GRAPHQL_URL: "http://example.com/graphql" })).toThrow(/https/);
    expect(randomUUID()).toBeTruthy();
  });
});

/**
 * End to end (BKS_INTEGRATION=1): application session -> BFF -> GraphQL consumer API -> disposable Neo4j. Proves a
 * valid session gets data and that an excluded record is not inferable through counts or cards.
 */
const e2e = process.env.BKS_INTEGRATION === "1" && Boolean(process.env.NEO4J_TEST_URI);
describe.skipIf(!e2e)("BFF -> GraphQL -> Neo4j (integration)", () => {
  const SET = "s6-bff-itest";
  let graphqlUrl = "";
  let stop: (() => Promise<void>) | null = null;
  let driver: import("neo4j-driver").Driver | null = null;

  beforeAll(async () => {
    const api = await import("@bks/graphql-api");
    const server = await api.startServer({
      port: 0,
      log: () => {},
      env: {
        BKS_BIOTECH_GRAPH_URI: process.env.NEO4J_TEST_URI!,
        BKS_BIOTECH_GRAPH_READER_USERNAME: "neo4j",
        BKS_BIOTECH_GRAPH_READER_PASSWORD: process.env.NEO4J_TEST_PASSWORD ?? "bks-test-password",
        BKS_BIOTECH_GRAPH_DATABASE: "neo4j",
        GRAPHQL_API_KEY: SERVICE_KEY,
        GRAPHQL_ACTOR_PUBLIC_KEY: actorPair.publicKey.export({ type: "spki", format: "pem" }).toString(),
        GRAPHQL_READINESS_RELEASE_CHECK: "skip",
        GRAPHQL_WARMUP: "false",
      },
    });
    graphqlUrl = `http://127.0.0.1:${server.port}/graphql`;
    driver = server.driver;
    stop = async () => {
      await server.stop();
      await server.driver.close();
    };
    const s = server.driver.session({ database: "neo4j" });
    try {
      await s.run("MATCH (n {fixtureSet: $set}) DETACH DELETE n", { set: SET });
      const product = (uid: string, pc: string) =>
        s.run("CREATE (p:Product:Entity {uid: $uid, id: $uid, name: 'bff product', privacyClass: $pc, productKind: 'DIETARY_SUPPLEMENT', marketedName: 'BFF', syntheticFixture: true, fixtureSet: $set})", { uid, pc, set: SET });
      await product("hu:product:bff-pub", "PUBLIC");
      await product("hu:product:bff-int", "INTERNAL");
      for (const [uid, pc] of [["hu:product-variant:bff-v-pub", "PUBLIC"], ["hu:product-variant:bff-v-int", "INTERNAL"]] as const) {
        await s.run(
          "MATCH (p:Product {uid: 'hu:product:bff-pub'}) CREATE (p)-[:HAS_VARIANT {orderIndex: 0, syntheticFixture: true}]->(:ProductVariant:Entity {uid: $uid, id: $uid, name: 'v', privacyClass: $pc, syntheticFixture: true, fixtureSet: $set})",
          { uid, pc, set: SET },
        );
      }
    } finally {
      await s.close();
    }
  }, 180_000);

  afterAll(async () => {
    if (driver) {
      const s = driver.session({ database: "neo4j" });
      await s.run("MATCH (n {fixtureSet: $set}) DETACH DELETE n", { set: SET });
      await s.close();
    }
    await stop?.();
  });

  const e2eCall = async (operation: keyof typeof compatibility.operations, variables: Record<string, unknown>, app: Record<string, unknown> = {}) => {
    const { app: bffApp } = createBffApp(bffConfigFromEnv({ ...env(), BKS_GRAPHQL_URL: graphqlUrl }), { sessionKeys, log: () => {} });
    const res = await bffApp.request("/graphql", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${await sessionToken({ app })}` },
      body: JSON.stringify({ documentId: compatibility.operations[operation].id, variables }),
    });
    return { status: res.status, body: (await res.json()) as { data?: Record<string, any>; errors?: unknown[] } };
  };

  it("valid session -> data through the real consumer API", async () => {
    const r = await e2eCall("ProductVariantsPage", { uid: "hu:product:bff-pub" });
    expect(r.status).toBe(200);
    expect(r.body.errors).toBeUndefined();
    expect(r.body.data!.products[0].uid).toBe("hu:product:bff-pub");
  });

  it("excluded records are not inferable through counts or cards; entitlement widens visibility", async () => {
    expect((await e2eCall("ProductVariantsPage", { uid: "hu:product:bff-pub" })).body.data!.products[0].variantsConnection.totalCount).toBe(1);
    expect((await e2eCall("ProductVariantsPage", { uid: "hu:product:bff-pub" }, { bks_entitlements: ["biotech:internal"] })).body.data!.products[0].variantsConnection.totalCount).toBe(2);
    expect((await e2eCall("ProductVariantsPage", { uid: "hu:product:bff-int" })).body.data!.products).toEqual([]);
    expect((await e2eCall("ProductVariantsPage", { uid: "hu:product:bff-int" }, { bks_entitlements: ["biotech:internal"] })).body.data!.products).toHaveLength(1);
  });
});
