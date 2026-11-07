import "./load-env.js";
import { assertBiotechDbPlane, assertTargetAllowed } from "@bks/kg-ops";
import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { createContext } from "./context.js";
import { loadModules } from "./modules/loader.js";

/**
 * HTTP surface of the knowledge executor. Capability modules live in ./modules (discovered at startup); the MCP
 * surface (mcp.ts) registers the same modules' tools for one principal.
 *
 *   GET  /healthz                      liveness (no credentials)
 *   GET  /describe                     capability handshake for the calling principal (INTERFACES section 8)
 *   GET  /schema/manifest | /schema/search | /schema/page/:id    POST /schema/slice
 *   POST /kg/read                      typed read v1 (until the reads role ships v2)
 *   POST /kg/plan                      biotech-knowledge-intent.v2 -> planRef + planDigest + plan view (writer)
 *   POST /kg/admit                     development admission witness (BKS_LOCAL_DEV=1 + BKS_WITNESS_SIGNING_KEY only)
 *   POST /kg/apply                     biotech-knowledge-apply.v2 (writer; references only, no statements)
 *   GET  /kg/receipt?effectKey=        scoped receipt lookup (reader)
 *   POST /kg/verify-effects            paginated readback of all declared effects (reader)
 *   POST /cypher, GET /cypher/introspect   baseline tools: BKS_ENABLE_BASELINE_TOOLS=1 and admin tokens only
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
const modules = await loadModules();
const app = createApp(ctx, modules);
const port = Number(process.env.EXECUTOR_PORT ?? 4020);
serve({ fetch: app.fetch, port }, (info) => {
  const s = ctx.writeSchema();
  console.log(`bks executor ${ctx.executorVersion} on http://127.0.0.1:${info.port} release ${s.releaseId} ${s.schemaReleaseDigest.slice(0, 19)}... modules ${modules.filter((m) => m.enabled(ctx)).map((m) => m.id).join(",")} auth ${ctx.auth.localDev ? "local-dev" : `${ctx.auth.configuredPrincipals} principal(s)`}`);
});
