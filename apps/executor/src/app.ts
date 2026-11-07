import { Hono } from "hono";
import { z } from "zod";
import { BksServiceError, CONTRACT_VERSIONS, type Principal } from "@bks/contracts";
import { NeighborError, PathError, SliceError, WorkspaceError } from "@bks/schema-workspace";
import { checkWriterReadiness, databaseReachable } from "@bks/kg-ops";
import { ROLE_RANK } from "./auth.js";
import type { ExecutorContext } from "./context.js";
import type { CapabilityDescriptor, ExecutorModule, HonoEnv } from "./modules/module.js";

const STATUS: Partial<Record<string, number>> = {
  BKS_UNAUTHORIZED: 401,
  BKS_FORBIDDEN_SCOPE: 403,
  BKS_VISIBILITY_DENIED: 403,
  BKS_PLAN_NOT_FOUND: 404,
  BKS_EFFECT_CONFLICT: 409,
  BKS_EFFECT_PENDING: 409,
  BKS_PARSE_REJECTED: 400,
  BKS_UNSUPPORTED: 501,
  BKS_AUTHORITY_UNAVAILABLE: 503,
  BKS_LIMIT_EXCEEDED: 413,
  BKS_TIMEOUT: 504,
};

/** Capabilities a principal may use, from enabled modules only (nothing planned-but-absent is advertised). */
export function capabilitiesFor(modules: ExecutorModule[], ctx: ExecutorContext, principal: Principal | null): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const m of modules) {
    if (!m.enabled(ctx)) continue;
    for (const cap of m.capabilities(ctx) as CapabilityDescriptor[]) {
      if (principal && ROLE_RANK[principal.role] < ROLE_RANK[cap.role]) continue;
      out[cap.name] = { available: true, role: cap.role, ...(cap.details ?? {}) };
    }
  }
  out.retrieve = { available: false };
  out.analytics = { available: false };
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => (a < b ? -1 : 1)));
}

export function describe(modules: ExecutorModule[], ctx: ExecutorContext, principal: Principal | null): Record<string, unknown> {
  const write = ctx.writeSchema();
  let workspaceFingerprint: string | null = null;
  try {
    workspaceFingerprint = ctx.workspace().manifest.workspaceFingerprint;
  } catch {
    workspaceFingerprint = null;
  }
  // Read identities come from the reads module (S4 patch P-3): its read.typed capability carries the release query
  // catalog digest and the consistency modes it serves; the handshake no longer hard-codes them.
  const allCaps = capabilitiesFor(modules, ctx, null);
  const readTyped = allCaps["read.typed"] as { queryCatalogDigest?: string | null; readModes?: string[] } | undefined;
  return {
    service: "biotech-knowledge-services",
    contracts: CONTRACT_VERSIONS,
    releaseId: write.releaseId,
    schemaReleaseDigest: write.schemaReleaseDigest,
    schemaDigest: write.schemaDigest,
    releaseSource: write.release.sourceKind,
    workspaceFingerprint,
    queryCatalogDigest: readTyped?.queryCatalogDigest ?? null,
    executorVersion: ctx.executorVersion,
    capabilities: capabilitiesFor(modules, ctx, principal),
    consistency: { readModes: readTyped?.readModes ?? ["observed"] },
    recovery: { receiptLookup: true, atomicCrossStore: false },
    ...(principal ? { principal: { principalId: principal.principalId, role: principal.role, ...(principal.principalClass ? { principalClass: principal.principalClass } : {}), scope: { installationId: principal.installationId, applicationId: principal.applicationId, tenantId: principal.tenantId }, grants: principal.grants } } : {}),
  };
}

export function createApp(ctx: ExecutorContext, modules: ExecutorModule[]): Hono<HonoEnv> {
  const app = new Hono<HonoEnv>();

  app.onError((error, c) => {
    if (error instanceof BksServiceError) return c.json({ ok: false, ...error.toJSON() }, (STATUS[error.code] ?? 422) as 400);
    if (error instanceof WorkspaceError) {
      // RELEASE_MISMATCH is the service-wide BKS_RELEASE_MISMATCH; other workspace codes keep their workspace name.
      const code = error.code === "RELEASE_MISMATCH" ? "BKS_RELEASE_MISMATCH" : error.code;
      const status = { PAGE_NOT_FOUND: 404, SECTION_NOT_FOUND: 404, PAGE_PATH_INVALID: 400, LIMIT_EXCEEDED: 400, RELEASE_MISMATCH: 409 }[error.code as string] ?? 500;
      return c.json({ ok: false, code, workspaceCode: error.code, message: error.message, details: error.details }, status as 400);
    }
    if (error instanceof NeighborError || error instanceof PathError || error instanceof SliceError) {
      const code = (error as { code: string }).code;
      return c.json({ ok: false, code, message: error.message }, (code === "UNKNOWN_ID" || code === "UNKNOWN_TYPE" ? 404 : 400) as 400);
    }
    if (error instanceof z.ZodError) return c.json({ ok: false, code: "BKS_PARSE_REJECTED", issues: error.issues.slice(0, 50) }, 400);
    console.error(error);
    return c.json({ ok: false, code: "ERROR", message: (error as Error).message }, 500);
  });

  // Liveness without credentials; everything else is authenticated (mandatory outside BKS_LOCAL_DEV=1).
  // Liveness (always 200 while the process serves) with an honest, bounded database probe; readiness is /readyz.
  app.get("/healthz", async (c) => {
    let database: "reachable" | "unreachable" | "unconfigured" = "unreachable";
    try {
      database = (await databaseReachable(ctx.graph(), 2_000)) ? "reachable" : "unreachable";
    } catch {
      database = "unconfigured";
    }
    return c.json({ ok: true, executorVersion: ctx.executorVersion, database });
  });
  // Readiness (same semantics as the GraphQL API): database answers, latest KsReleaseMarker is the served release,
  // writer fences and writer-required DDL are present / ONLINE. 503 otherwise.
  app.get("/readyz", async (c) => {
    try {
      const report = await checkWriterReadiness(ctx.graph(), ctx.writeSchema(), 7_000);
      return c.json(report, report.ready ? 200 : 503);
    } catch (e) {
      return c.json({ ready: false, checks: [{ name: "configuration", ok: false, detail: (e as Error).message.slice(0, 300) }] }, 503);
    }
  });
  app.use("*", async (c, next) => {
    const presented = c.req.header("x-api-key") ?? c.req.header("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
    c.set("principal", ctx.auth.authenticate(presented));
    await next();
  });
  app.get("/describe", (c) => c.json(describe(modules, ctx, c.get("principal"))));
  for (const m of modules) if (m.enabled(ctx)) m.http?.(app, ctx);
  return app;
}
