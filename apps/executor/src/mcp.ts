import "./load-env.js";
import { assertBiotechDbPlane, assertTargetAllowed } from "@bks/kg-ops";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ROLE_RANK } from "./auth.js";
import { describe } from "./app.js";
import { createContext } from "./context.js";
import { loadModules } from "./modules/loader.js";

/**
 * MCP (stdio) surface. The process acts as ONE principal: BKS_MCP_TOKEN must match a configured token
 * (BKS_EXECUTOR_TOKENS / EXECUTOR_API_KEY), or BKS_LOCAL_DEV=1 gives the local-dev principal. Only the tools that
 * principal's role may use are registered (a reader never sees kg_plan / kg_apply; baseline Cypher tools exist only for
 * admin tokens with BKS_ENABLE_BASELINE_TOOLS=1). Register as:
 *   { "mcpServers": { "bks": { "command": "node", "args": ["apps/executor/dist/mcp.js"], "cwd": "<repo>", "env": { "BKS_MCP_TOKEN": "..." } } } }
 */
// Startup guards (never print a URI or DSN): refuse an Aura host unless BKS_TARGET=production, and refuse Biotech
// database values that do not name BKS_BIOTECH_DB_PROJECT_REF.
try {
  if (process.env.BKS_BIOTECH_GRAPH_URI) assertTargetAllowed(process.env.BKS_BIOTECH_GRAPH_URI, process.env);
  assertBiotechDbPlane(process.env);
} catch (e) {
  console.error(`[bks-executor] refusing to start: ${(e as Error).message}`);
  process.exit(78);
}
const ctx = createContext(process.env);
const principal = ctx.auth.authenticate(process.env.BKS_MCP_TOKEN ?? null);
const modules = await loadModules();
const server = new McpServer({ name: "bks-knowledge-executor", version: ctx.executorVersion });
server.registerTool("describe", { description: "Capability handshake: contracts, release identities and the capabilities this principal may use.", inputSchema: {} }, async () => ({ content: [{ type: "text" as const, text: JSON.stringify(describe(modules, ctx, principal), null, 2) }] }));
for (const m of modules) {
  if (!m.enabled(ctx) || !m.mcp) continue;
  const minRole = Math.min(...m.capabilities(ctx).map((c) => ROLE_RANK[c.role]));
  if (ROLE_RANK[principal.role] < minRole) continue;
  m.mcp(server, ctx, principal);
}
await server.connect(new StdioServerTransport());
