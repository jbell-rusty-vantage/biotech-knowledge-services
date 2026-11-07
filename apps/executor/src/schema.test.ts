import { describe as suite, expect, it } from "vitest";
import { z } from "zod";
import * as contracts from "@bks/contracts";
import { CardRecord, SchemaContext, WorkspaceManifestV2 } from "@bks/contracts";
import * as workspace from "@bks/schema-workspace";
import { GraphClient, KnowledgeWriter, MemoryPlanStore, writeSchema } from "@bks/kg-ops";
import { createApp } from "./app.js";
import { createContext } from "./context.js";
import { loadModules } from "./modules/loader.js";

/** Schema workspace v2 routes against the generated workspace/ (bks-schema-workspace.v2, S2). No database. */
const tokens = JSON.stringify([{ token: "reader-token", role: "reader", principalId: "r", installationId: "i", applicationId: "a", tenantId: "t" }]);

async function appWith(env: Record<string, string>) {
  const client = new GraphClient({ uri: "bolt://127.0.0.1:1", username: "neo4j", password: "unused", database: "neo4j" });
  const ctx = createContext({ ...env } as NodeJS.ProcessEnv, { graph: () => client, writer: () => new KnowledgeWriter(client, { schema: writeSchema(), plans: new MemoryPlanStore(), witnessKeys: new Map() }) });
  return { app: createApp(ctx, await loadModules()), client, ctx };
}

suite("schema workspace v2 routes", () => {
  it("contracts workspace v2 shapes equal the @bks/schema-workspace shapes (merge parity)", () => {
    for (const name of ["CardRecord", "WorkspaceManifestV2", "SliceRequestV2", "SchemaContext", "CardKind", "FileEntry"] as const) {
      const a = z.toJSONSchema((contracts as unknown as Record<string, z.ZodType>)[name]!, { io: "input", unrepresentable: "any" });
      const b = z.toJSONSchema((workspace as unknown as Record<string, z.ZodType>)[name]!, { io: "input", unrepresentable: "any" });
      expect(a, name).toEqual(b);
    }
    expect(contracts.CONTRACT_VERSIONS.workspace).toBe(workspace.WORKSPACE_FORMAT_V2);
    expect(contracts.CONTRACT_VERSIONS.schemaContext).toBe(workspace.SCHEMA_CONTEXT_VERSION);
    expect(contracts.CARD_ID_PREFIX).toEqual(workspace.CARD_ID_PREFIX);
  });

  it("manifest without the inventory, search modes, find, neighbors, path, pattern, doctor, context, page and slice (v1 + v2)", { timeout: 120_000 }, async () => {
    const { app, client, ctx } = await appWith({ BKS_EXECUTOR_TOKENS: tokens });
    const h = { "x-api-key": "reader-token" };
    const get = async (path: string) => {
      const r = await app.request(path, { headers: h });
      return { status: r.status, body: (await r.json()) as Record<string, any> };
    };
    const post = async (path: string, body: unknown) => {
      const r = await app.request(path, { method: "POST", headers: { ...h, "content-type": "application/json" }, body: JSON.stringify(body) });
      return { status: r.status, body: (await r.json()) as Record<string, any> };
    };
    const ws = ctx.workspace();
    expect(WorkspaceManifestV2.safeParse(ws.manifest).success).toBe(true);

    // Manifest: identities and counts, no ~1,336-entry inventory.
    const manifest = await get("/schema/manifest");
    expect(manifest.status).toBe(200);
    expect(manifest.body.format).toBe("bks-schema-workspace.v2");
    expect(manifest.body.workspaceFingerprint).toBe(ws.manifest.workspaceFingerprint);
    expect(manifest.body.workspaceFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/); // the regenerated workspace/ (fingerprint changes with each render)
    expect(manifest.body.inventory).toBeUndefined();
    expect(manifest.body.inventoryCount).toBe(Object.keys(ws.manifest.inventory).length);

    // /describe advertises lexical only while no semantic retriever is configured.
    const describe = await get("/describe");
    expect(describe.body.capabilities["schema.search"].modes).toEqual(["lexical"]);
    for (const cap of ["schema.find", "schema.neighbors", "schema.path", "schema.pattern", "schema.doctor", "schema.context", "schema.slice"]) expect(describe.body.capabilities[cap]).toBeTruthy();

    // Search: lexical ok; kind / module filters; semantic unavailable and hybrid degraded without a retriever.
    const lexical = await get("/schema/search?q=product%20variant&kind=node&limit=5");
    expect(lexical.status).toBe(200);
    expect(lexical.body.status).toBe("ok");
    expect(lexical.body.hits.length).toBeGreaterThan(0);
    expect(lexical.body.hits.every((x: { kind: string }) => x.kind === "node")).toBe(true);
    expect(lexical.body.release.workspaceFingerprint).toBe(ws.manifest.workspaceFingerprint);
    const hybrid = await get("/schema/search?q=product&mode=hybrid");
    expect(hybrid.body.status).toBe("degraded");
    expect(hybrid.body.degradation.fallback).toBe("lexical-only");
    const semantic = await get("/schema/search?q=product&mode=semantic");
    expect(semantic.body.status).toBe("unavailable");
    expect((await get("/schema/search?q=x&limit=100000")).status).toBe(400);

    // Find: structured filters over CardRecord.
    const find = await get("/schema/find?kind=node&executorOp=create&limit=500");
    expect(find.status).toBe(200);
    expect(find.body.results.some((r: { id: string }) => r.id === "node:Product")).toBe(true);
    for (const r of find.body.results.slice(0, 5)) expect(CardRecord.safeParse({ ...r, tokens: [] }).success).toBe(true);

    // Neighbors / path / pattern.
    const nb = await get("/schema/neighbors/node:Product?depth=1");
    expect(nb.status).toBe(200);
    expect(nb.body.start).toBe("node:Product");
    expect((await get("/schema/neighbors/node:NoSuchType")).status).toBe(404);
    const path = await get("/schema/path?from=Product&to=Organization&maxHops=3");
    expect(path.status).toBe(200);
    expect(Array.isArray(path.body.paths)).toBe(true);
    const q = ws.index.find((r) => r.kind === "question")!;
    const pat = await get(`/schema/pattern?question=${encodeURIComponent(q.name)}`);
    expect(pat.status).toBe(200);
    expect(pat.body.release.releaseId).toBe(ws.manifest.release.releaseId);
    expect((await get("/schema/pattern")).status).toBe(400);

    // Doctor and advisory context.
    const doc = await get("/schema/doctor");
    expect(doc.status).toBe(200);
    expect(doc.body.workspaceFingerprint).toBe(ws.manifest.workspaceFingerprint);
    const context = await post("/schema/context", { intent: "attach an identifier to a product", taskIds: ["task:attach-identifier"], cardIds: ["node:Product"] });
    expect(context.status).toBe(200);
    expect(SchemaContext.safeParse(context.body).success).toBe(true);
    expect(context.body.advisory).toBe(true);
    expect(context.body.grantsAuthority).toBe(false);

    // Page and slice (v1 request still accepted; v2 request with modules / purpose / maxTokens).
    const page = await get("/schema/page/node:Product?maxBytes=4000");
    expect(page.status).toBe(200);
    const v1 = await post("/schema/slice", { nodeTypes: ["Product"], endpointDepth: 0 });
    expect(v1.status).toBe(200);
    expect(Object.keys(v1.body.pages).length).toBeGreaterThan(0);
    const v2 = await post("/schema/slice", { nodeTypes: ["Product"], predicates: [], purpose: "read", maxTokens: 8000, endpointDepth: 0 });
    expect(v2.status).toBe(200);
    expect((await post("/schema/slice", { nodeTypes: ["Product"], maxTokens: 10 })).status).toBe(400);
    await client.close();
  });
});
