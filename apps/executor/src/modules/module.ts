import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Principal } from "@bks/contracts";
import type { Hono } from "hono";
import type { Role } from "../auth.js";
import type { ExecutorContext } from "../context.js";

/**
 * One executor capability module. Every `*.ts` file in this directory that exports `executorModule` is discovered at
 * startup (HTTP and MCP), so another role adds a surface (e.g. `read.ts` with `read.typed` v2 / `read.cypher`) by
 * adding a file here, without editing the existing modules, the app or the MCP server.
 */
export interface CapabilityDescriptor {
  /** Capability name advertised by GET /describe (INTERFACES section 8). */
  name: string;
  /** Minimum role allowed to use it. */
  role: Role;
  /** Advertised details (contract versions, modes); `available: false` entries are advertised as unavailable. */
  details?: Record<string, unknown>;
}

export type HonoEnv = { Variables: { principal: Principal } };

export interface ExecutorModule {
  id: string;
  /** Whether the module is enabled in this process (e.g. baseline tools only with BKS_ENABLE_BASELINE_TOOLS=1). */
  enabled(ctx: ExecutorContext): boolean;
  capabilities(ctx: ExecutorContext): CapabilityDescriptor[];
  http?(app: Hono<HonoEnv>, ctx: ExecutorContext): void;
  /** Registers MCP tools for a principal; only tools the principal's role may use are registered. */
  mcp?(server: McpServer, ctx: ExecutorContext, principal: Principal): void;
}
