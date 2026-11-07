import { CypherRequest } from "@bks/contracts";
import { cypherGuardFromEnv, introspectDatabase, runCypher } from "@bks/kg-ops";
import { requireRole } from "../auth.js";
import type { ExecutorModule } from "./module.js";

/**
 * Baseline ad hoc Cypher (including raw writes) for the paired evaluation profile ONLY: absent from default HTTP / MCP /
 * CLI capabilities, registered only with BKS_ENABLE_BASELINE_TOOLS=1 and only for admin tokens. Never evidence, never a
 * substitute for plan/apply. The reads role ships the governed `read.cypher` capability separately.
 */
export const executorModule: ExecutorModule = {
  id: "baseline",
  enabled: (ctx) => ctx.flags.baselineTools,
  capabilities: () => [{ name: "baseline.cypher", role: "admin", details: { profile: "evaluation", writes: true } }],
  http(app, ctx) {
    app.post("/cypher", async (c) => {
      requireRole(c.get("principal"), "admin", "baseline.cypher");
      const result = await runCypher(ctx.graph(), CypherRequest.parse(await c.req.json()), cypherGuardFromEnv(ctx.env));
      return c.json(result, result.ok ? 200 : 422);
    });
    app.get("/cypher/introspect", async (c) => {
      requireRole(c.get("principal"), "admin", "baseline.cypher");
      return c.json(await introspectDatabase(ctx.graph()));
    });
  },
  mcp(server, ctx, principal) {
    if (principal.role !== "admin") return;
    server.registerTool("cypher_run", { description: "EVALUATION PROFILE baseline tool: ad hoc Cypher under the delete caps. Never evidence; never a substitute for kg_plan/kg_apply.", inputSchema: CypherRequest.shape }, async (request) => ({ content: [{ type: "text" as const, text: JSON.stringify(await runCypher(ctx.graph(), CypherRequest.parse(request), cypherGuardFromEnv(ctx.env)), null, 2) }] }));
    server.registerTool("cypher_introspect", { description: "EVALUATION PROFILE baseline tool: database labels, relationship types, counts and indexes.", inputSchema: {} }, async () => ({ content: [{ type: "text" as const, text: JSON.stringify(await introspectDatabase(ctx.graph()), null, 2) }] }));
  },
};
