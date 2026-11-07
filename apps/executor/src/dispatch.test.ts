/**
 * SV-11 executor surface (no database): the dispatch-consume operation is advertised only when configured, requires a
 * `service` principal with grant admission.dispatch for its own tenant, and fails closed when the verification
 * authority is unreachable; an official-use v3 read without an authority holds (nothing served as eligible).
 */
import { describe, expect, it } from "vitest";
import { GraphClient, KnowledgeWriter, MemoryPlanStore, writeSchema } from "@bks/kg-ops";
import { createApp } from "./app.js";
import { createContext } from "./context.js";
import { loadModules } from "./modules/loader.js";

const TENANT = "8a3e5c1d-2f4b-4c6d-9e8f-0a1b2c3d4e5f";
const scope = { installationId: "inst-sv11", applicationId: "biotech", tenantId: TENANT };
const tokens = JSON.stringify([
  { token: "agent-writer", role: "writer", principalId: "agent", ...scope, grants: ["admission.dispatch"] },
  { token: "service-no-grant", role: "writer", principalId: "ks-binding", class: "service", ...scope },
  { token: "service-ok", role: "writer", principalId: "ks-biotech-graph", class: "service", ...scope, grants: ["admission.dispatch"] },
  { token: "service-other-tenant", role: "writer", principalId: "ks-other", class: "service", ...scope, tenantId: "1b2c3d4e-5f60-4a7b-8c9d-0e1f2a3b4c5d", grants: ["admission.dispatch"] },
  { token: "reader", role: "reader", principalId: "reader", ...scope },
]);
const schema = writeSchema();

async function appWith(env: Record<string, string>) {
  const client = new GraphClient({ uri: "bolt://127.0.0.1:1", username: "neo4j", password: "unused", database: "neo4j" });
  const ctx = createContext({ ...env } as NodeJS.ProcessEnv, { graph: () => client, writer: () => new KnowledgeWriter(client, { schema, plans: new MemoryPlanStore(), witnessKeys: new Map() }) });
  return { app: createApp(ctx, await loadModules()), client };
}
const post = (app: Awaited<ReturnType<typeof appWith>>["app"], path: string, token: string, body: unknown) => app.request(path, { method: "POST", headers: { "x-api-key": token, "content-type": "application/json" }, body: JSON.stringify(body) });

describe("SV-11 executor: dispatch consume operation and official reads", () => {
  it("advertises admission.dispatch only when BKS_BIOTECH_DB_VERIFICATION_DSN and BKS_VERIFICATION_TENANTS are configured", async () => {
    const off = await appWith({ BKS_EXECUTOR_TOKENS: tokens });
    const d0 = (await (await off.app.request("/describe", { headers: { "x-api-key": "service-ok" } })).json()) as { capabilities: Record<string, unknown>; principal: { principalClass?: string } };
    expect(d0.capabilities["admission.dispatch"]).toBeUndefined();
    expect(d0.capabilities["read.official"]).toMatchObject({ available: true, authorityConfigured: false });
    expect(d0.principal.principalClass).toBe("service");
    expect((await post(off.app, "/kg/admission/dispatch/consume", "service-ok", { tenantId: TENANT })).status).toBe(404);
    await off.client.close();
    const on = await appWith({ BKS_EXECUTOR_TOKENS: tokens, BKS_BIOTECH_DB_VERIFICATION_DSN: "postgresql://nobody:x@127.0.0.1:1/none", BKS_VERIFICATION_TENANTS: TENANT, BKS_VERIFICATION_TIMEOUT_MS: "1000" });
    const d1 = (await (await on.app.request("/describe", { headers: { "x-api-key": "service-ok" } })).json()) as { capabilities: Record<string, Record<string, unknown>> };
    expect(d1.capabilities["admission.dispatch"]).toMatchObject({ available: true, contract: "biotech-knowledge-admission.v1", principal: "token class service + grant admission.dispatch" });
    await on.client.close();
  });

  it("requires a service principal with admission.dispatch for its own configured tenant; fails closed without the authority", async () => {
    const { app, client } = await appWith({ BKS_EXECUTOR_TOKENS: tokens, BKS_BIOTECH_DB_VERIFICATION_DSN: "postgresql://nobody:x@127.0.0.1:1/none", BKS_VERIFICATION_TENANTS: TENANT, BKS_VERIFICATION_TIMEOUT_MS: "1000" });
    const body = { tenantId: TENANT, limit: 5 };
    const agent = await post(app, "/kg/admission/dispatch/consume", "agent-writer", body);
    expect(agent.status).toBe(403);
    expect(((await agent.json()) as { message: string }).message).toMatch(/service principal/);
    expect((await post(app, "/kg/admission/dispatch/consume", "service-no-grant", body)).status).toBe(403);
    expect((await post(app, "/kg/admission/dispatch/consume", "service-other-tenant", body)).status).toBe(403);
    expect((await post(app, "/kg/admission/dispatch/consume", "reader", body)).status).toBe(403);
    const down = await post(app, "/kg/admission/dispatch/consume", "service-ok", body);
    expect(down.status).toBe(503);
    expect(((await down.json()) as { code: string }).code).toBe("BKS_AUTHORITY_UNAVAILABLE");
    await client.close();
  });
});
