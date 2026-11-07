import { ReadIntent } from "@bks/contracts";
import { executeReadIntent } from "@bks/kg-ops";
import type { ExecutorModule } from "./module.js";

/**
 * Legacy typed reads (biotech-knowledge-read-intent.v1), MCP only. The HTTP route `POST /kg/read` belongs to the reads
 * module (`read.ts`, S4), which decodes v1 bodies as well as v2; registering a v1 route here first would reject v2
 * bodies with 400 (S4 patch P-2). Advertised as `read.typed.v1` with its exact contract version.
 */
export const executorModule: ExecutorModule = {
  id: "read-v1",
  enabled: (ctx) => ctx.env.BKS_DISABLE_READ_V1 !== "1",
  capabilities: () => [{ name: "read.typed.v1", role: "reader", details: { contract: "biotech-knowledge-read-intent.v1", consistency: ["observed"], surfaces: ["mcp:kg_read"] } }],
  mcp(server, ctx) {
    server.registerTool(
      "kg_read",
      { description: "Legacy typed read (biotech-knowledge-read-intent.v1): node.resolve, node.card, node.search, node.list, node.neighbors, assertion.trace, assertion.about, state.asOf, count.*. Prefer kg_read_v2.", inputSchema: { intent: ReadIntent } },
      async ({ intent }) => ({ content: [{ type: "text" as const, text: JSON.stringify(await executeReadIntent(ctx.graph(), ctx.readModel(), intent), null, 2) }] }),
    );
  },
};
