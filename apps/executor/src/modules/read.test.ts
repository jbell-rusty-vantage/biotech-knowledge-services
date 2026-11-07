import { describe as suite, expect, it } from "vitest";
import { GraphClient, KnowledgeWriter, MemoryPlanStore, writeSchema } from "@bks/kg-ops";
import { loadRelease } from "@bks/schema-workspace";
import { createApp } from "../app.js";
import { createContext } from "../context.js";
import { loadModules } from "./loader.js";

/** Read module surfaces without a database (the Gate B read behaviour is proven in packages/kg-ops read*.integration.test.ts). */
const tokens = JSON.stringify([
  { token: "reader-token", role: "reader", principalId: "r", installationId: "i", applicationId: "a", tenantId: "t" },
  { token: "writer-token", role: "writer", principalId: "w", installationId: "i", applicationId: "a", tenantId: "t" },
]);

async function appWith(env: Record<string, string>) {
  const client = new GraphClient({ uri: "bolt://127.0.0.1:1", username: "neo4j", password: "unused", database: "neo4j" });
  const ctx = createContext({ BKS_EXECUTOR_TOKENS: tokens, BKS_DISABLE_READ_V1: "1", ...env } as NodeJS.ProcessEnv, { graph: () => client, writer: () => new KnowledgeWriter(client, { schema: writeSchema(), plans: new MemoryPlanStore(), witnessKeys: new Map() }) });
  return { app: createApp(ctx, await loadModules()), client };
}

suite("executor read module (S4)", () => {
  it("advertises read.typed v2 with both consistency modes and the catalog digest; read.cypher only with a proven read-only principal", async () => {
    const { app, client } = await appWith({});
    const d = (await (await app.request("/describe", { headers: { "x-api-key": "reader-token" } })).json()) as { capabilities: Record<string, Record<string, unknown>> };
    const typed = d.capabilities["read.typed"]!;
    expect(typed.contract).toBe("biotech-knowledge-read-intent.v2");
    expect(typed.readModes).toEqual(["observed", "stable_revision"]);
    expect(String(typed.queryCatalogDigest)).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(d.capabilities["read.templates"]).toBeTruthy();
    expect(d.capabilities["read.cypher"]).toBeUndefined();
    await client.close();
    const declared = await appWith({ BKS_READ_AUTHORITY: "database-role" });
    const d2 = (await (await declared.app.request("/describe", { headers: { "x-api-key": "reader-token" } })).json()) as { capabilities: Record<string, Record<string, unknown>> };
    expect((d2.capabilities["read.cypher"] as { language: string }).language).toBe("CYPHER_5");
    await declared.client.close();
  });

  it("serves the release catalog to readers and requires a token", async () => {
    const { app, client } = await appWith({});
    expect((await app.request("/kg/catalog/templates")).status).toBe(401);
    const r = (await (await app.request("/kg/catalog/templates?status=supported", { headers: { "x-api-key": "reader-token" } })).json()) as { count: number; templates: Array<{ id: string; statement: string; statementDigest: string; servable: boolean }> };
    const raw = (loadRelease().queryCatalog as { templates: Array<{ status: string }> }).templates;
    expect(r.count).toBe(raw.filter((t) => t.status === "supported").length);
    expect(r.count).toBeGreaterThan(0);
    expect(r.templates.every((t) => /^sha256:/.test(t.statementDigest))).toBe(true);
    // native vectors are disabled: any supported template that needs one is listed but not servable
    for (const t of r.templates) if (/db.index.vector|vector.similarity/.test(t.statement)) expect(t.servable, t.id).toBe(false);
    await client.close();
  });

  it("rejects malformed artifacts with BKS_PARSE_REJECTED and keeps the v1 contract decodable unless retired", async () => {
    const { app, client } = await appWith({ BKS_READ_V1_RETIRED: "1" });
    const post = (path: string, body: unknown) => app.request(path, { method: "POST", headers: { "x-api-key": "reader-token", "content-type": "application/json" }, body: JSON.stringify(body) });
    const bad = await post("/kg/read", { schemaVersion: "biotech-knowledge-read-intent.v2", intentId: "x", operations: [] });
    expect(bad.status).toBe(400);
    expect(((await bad.json()) as { code: string }).code).toBe("BKS_PARSE_REJECTED");
    const two = await post("/kg/read/cypher", { schemaVersion: "biotech-cypher-read-intent.v1", intentId: "x", pins: { schemaReleaseDigest: `sha256:${"0".repeat(64)}` }, purpose: "p" });
    expect(two.status).toBe(400);
    const v1 = await post("/kg/read", { schemaVersion: "biotech-knowledge-read-intent.v1", intentId: "v1" });
    expect(v1.status).toBe(501);
    await client.close();
  });
});
