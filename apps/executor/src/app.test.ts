import { describe as suite, expect, it } from "vitest";
import { GraphClient, KnowledgeWriter, MemoryPlanStore, writeSchema } from "@bks/kg-ops";
import { createApp } from "./app.js";
import { AuthRegistry } from "./auth.js";
import { createContext } from "./context.js";
import { loadModules } from "./modules/loader.js";

const tokens = JSON.stringify([
  { token: "reader-token", role: "reader", principalId: "r", installationId: "i", applicationId: "a", tenantId: "t" },
  { token: "writer-token", role: "writer", principalId: "w", installationId: "i", applicationId: "a", tenantId: "t" },
  { token: "admin-token", role: "admin", principalId: "x", installationId: "i", applicationId: "a", tenantId: "t" },
]);

async function appWith(env: Record<string, string>) {
  const e = { ...env } as NodeJS.ProcessEnv;
  // A driver that is never connected: these tests stay off the database.
  const client = new GraphClient({ uri: "bolt://127.0.0.1:1", username: "neo4j", password: "unused", database: "neo4j" });
  const ctx = createContext(e, { graph: () => client, writer: () => new KnowledgeWriter(client, { schema: writeSchema(), plans: new MemoryPlanStore(), witnessKeys: new Map() }) });
  return { app: createApp(ctx, await loadModules()), client };
}
const get = (app: Awaited<ReturnType<typeof appWith>>["app"], path: string, token?: string) => app.request(path, { headers: token ? { "x-api-key": token } : {} });

suite("executor surfaces", () => {
  it("production guard: Aura hosts are refused unless BKS_TARGET=production; local hosts are accepted", () => {
    const cfg = (uri: string) => ({ uri, username: "neo4j", password: "unused", database: "neo4j" });
    expect(() => new GraphClient(cfg("neo4j+s://abcd1234.databases.neo4j.io"), {} as NodeJS.ProcessEnv)).toThrowError(/BKS_TARGET guard/);
    expect(() => new GraphClient(cfg("bolt://abcd1234.databases.neo4j.io:7687"), { BKS_TARGET: "staging" } as NodeJS.ProcessEnv)).toThrowError(/BKS_TARGET guard/);
    const prod = new GraphClient(cfg("neo4j+s://abcd1234.databases.neo4j.io"), { BKS_TARGET: "production" } as NodeJS.ProcessEnv);
    void prod.close();
    const local = new GraphClient(cfg("bolt://127.0.0.1:7712"), {} as NodeJS.ProcessEnv);
    void local.close();
  });

  it("/healthz is liveness with an honest database probe; /readyz is 503 while the database is unreachable", { timeout: 30_000 }, async () => {
    const { app, client } = await appWith({ BKS_EXECUTOR_TOKENS: tokens });
    const t0 = Date.now();
    const h = await app.request("/healthz");
    expect(h.status).toBe(200);
    expect(((await h.json()) as { database: string }).database).toBe("unreachable");
    const r = await app.request("/readyz");
    expect(r.status).toBe(503);
    const body = (await r.json()) as { ready: boolean; checks: Array<{ name: string; ok: boolean }> };
    expect(body.ready).toBe(false);
    expect(body.checks.find((c) => c.name === "database")?.ok).toBe(false);
    expect(Date.now() - t0).toBeLessThan(15_000);
    await client.close();
  });

  it("refuses to start without credentials outside BKS_LOCAL_DEV=1", () => {
    expect(() => new AuthRegistry({} as NodeJS.ProcessEnv)).toThrowError(/authentication is mandatory/);
    expect(new AuthRegistry({ BKS_LOCAL_DEV: "1" } as NodeJS.ProcessEnv).devPrincipal?.principalId).toBe("local-dev");
  });

  it("requires a token, keeps /healthz open and advertises only the caller's capabilities", async () => {
    const { app, client } = await appWith({ BKS_EXECUTOR_TOKENS: tokens });
    expect((await get(app, "/healthz")).status).toBe(200);
    expect((await get(app, "/describe")).status).toBe(401);
    expect((await get(app, "/describe", "bogus")).status).toBe(401);
    const reader = (await (await get(app, "/describe", "reader-token")).json()) as { capabilities: Record<string, unknown>; recovery: unknown; contracts: Record<string, string> };
    expect(Object.keys(reader.capabilities)).toEqual(expect.arrayContaining(["schema.search", "schema.get", "receipt.get", "verifyEffects", "read.typed"]));
    expect(reader.capabilities.plan).toBeUndefined();
    expect(reader.capabilities.apply).toBeUndefined();
    expect(reader.capabilities["baseline.cypher"]).toBeUndefined();
    expect(reader.capabilities.retrieve).toEqual({ available: false });
    expect(reader.recovery).toEqual({ receiptLookup: true, atomicCrossStore: false });
    expect(reader.contracts.ingestionIntent).toBe("biotech-knowledge-intent.v2");
    const writer = (await (await get(app, "/describe", "writer-token")).json()) as { capabilities: Record<string, unknown> };
    expect(writer.capabilities.plan).toBeTruthy();
    expect(writer.capabilities.apply).toBeTruthy();
    expect(writer.capabilities["baseline.cypher"]).toBeUndefined();
    await client.close();
  });

  it("role gating: readers cannot plan or apply; raw Cypher is absent by default and admin-only in the evaluation profile", async () => {
    const { app, client } = await appWith({ BKS_EXECUTOR_TOKENS: tokens });
    const post = (path: string, token: string, body: unknown) => app.request(path, { method: "POST", headers: { "x-api-key": token, "content-type": "application/json" }, body: JSON.stringify(body) });
    expect((await post("/kg/plan", "reader-token", {})).status).toBe(403);
    expect((await post("/kg/apply", "reader-token", {})).status).toBe(403);
    expect((await post("/cypher", "admin-token", { mode: "read", cypher: "RETURN 1" })).status).toBe(404);
    const forged = await post("/kg/apply", "writer-token", { statements: [{ cypher: "CREATE (:X)" }] });
    expect(forged.status).toBe(422);
    expect(((await forged.json()) as { code: string }).code).toBe("BKS_PLAN_FORGED");
    await client.close();
    const evaluation = await appWith({ BKS_EXECUTOR_TOKENS: tokens, BKS_ENABLE_BASELINE_TOOLS: "1" });
    const p2 = (path: string, token: string, body: unknown) => evaluation.app.request(path, { method: "POST", headers: { "x-api-key": token, "content-type": "application/json" }, body: JSON.stringify(body) });
    expect((await p2("/cypher", "writer-token", { mode: "write", cypher: "CREATE (:X)" })).status).toBe(403);
    const admin = (await (await get(evaluation.app, "/describe", "admin-token")).json()) as { capabilities: Record<string, unknown> };
    expect(admin.capabilities["baseline.cypher"]).toBeTruthy();
    await evaluation.client.close();
  });

  it("local dev profile: no token needed, admission endpoint off without a signing key", async () => {
    const { app, client } = await appWith({ BKS_LOCAL_DEV: "1" });
    const d = (await (await get(app, "/describe")).json()) as { principal: { principalId: string }; capabilities: Record<string, unknown> };
    expect(d.principal.principalId).toBe("local-dev");
    expect(d.capabilities["admission.dev"]).toBeUndefined();
    const r = await app.request("/kg/admit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ planRef: "pl-x", effectKey: "ek-1" }) });
    expect(r.status).toBe(501);
    await client.close();
  });
});
