import { z } from "zod";
import { ApplyRequestV2, BksServiceError, CONTRACT_VERSIONS, EffectKey, IngestionIntentV2, PartialPolicy, VerifyEffectsRequest, type IngestionPlanV2, type Principal } from "@bks/contracts";
import { ROLE_RANK, requireRole } from "../auth.js";
import type { ExecutorContext } from "../context.js";
import type { ExecutorModule } from "./module.js";

/**
 * Trusted native writer surfaces: plan (server-stored plan, planRef + digest), apply (references only, no statements),
 * scoped receipt lookup and paginated effect verification; plus the development admission endpoint when enabled.
 */
const principalCtx = (p: Principal) => ({ principalId: p.principalId, installationId: p.installationId, applicationId: p.applicationId, tenantId: p.tenantId, grants: p.grants });

/** Plan view returned to clients: the full compiler output (statements are visible, never submittable). */
function planView(plan: IngestionPlanV2) {
  return { planRef: plan.planRef, planDigest: plan.planDigest, outcome: plan.outcome, plan };
}

const AdmitRequest = z.strictObject({ planRef: z.string().min(1), effectKey: EffectKey, partialPolicy: PartialPolicy.default("all") });

export const executorModule: ExecutorModule = {
  id: "write",
  enabled: () => true,
  capabilities: (ctx) => [
    { name: "plan", role: "writer", details: { contract: CONTRACT_VERSIONS.ingestionIntent, plan: CONTRACT_VERSIONS.ingestionPlan } },
    { name: "apply", role: "writer", details: { contract: CONTRACT_VERSIONS.applyRequest, receipt: CONTRACT_VERSIONS.ingestionReceipt, witness: CONTRACT_VERSIONS.applyWitness, budgets: { maxProposals: 500, transactionMs: 30_000, witnessLifetimeSeconds: 60 } } },
    { name: "receipt.get", role: "reader", details: { lookup: "effectKey" } },
    { name: "verifyEffects", role: "reader", details: { contract: CONTRACT_VERSIONS.effectVerification, paginated: true } },
    ...(ctx.flags.devAdmission ? [{ name: "admission.dev", role: "writer" as const, details: { semantics: "authorization at issuance plus bounded in-flight lease (<= 60 s); local in-memory authority; development only" } }] : []),
  ],
  http(app, ctx) {
    app.post("/kg/plan", async (c) => {
      const principal = c.get("principal");
      requireRole(principal, "writer", "plan");
      const plan = await ctx.writer().plan(IngestionIntentV2.parse(await c.req.json()), principalCtx(principal));
      return c.json(planView(plan), plan.outcome === "rejected" ? 422 : 200);
    });
    app.post("/kg/admit", async (c) => {
      const principal = c.get("principal");
      requireRole(principal, "writer", "admission.dev");
      if (!ctx.flags.devAdmission) throw new BksServiceError("BKS_UNSUPPORTED", "the development admission endpoint is disabled (BKS_LOCAL_DEV=1 and BKS_WITNESS_SIGNING_KEY required); production witnesses come from the domain admission service");
      const req = AdmitRequest.parse(await c.req.json());
      return c.json(await ctx.writer().admit(req.planRef, { effectKey: req.effectKey, partialPolicy: req.partialPolicy }, principalCtx(principal)));
    });
    app.post("/kg/apply", async (c) => {
      const principal = c.get("principal");
      requireRole(principal, "writer", "apply");
      const body = (await c.req.json()) as unknown;
      const receipt = await ctx.writer().apply(body, principalCtx(principal));
      const status = receipt.outcome === "failed" ? 422 : receipt.outcome === "unresolved" ? 202 : 200;
      return c.json(receipt, status);
    });
    app.get("/kg/receipt", async (c) => {
      const principal = c.get("principal");
      requireRole(principal, "reader", "receipt.get");
      const effectKey = EffectKey.parse(c.req.query("effectKey"));
      const result = await ctx.writer().receipt(principalCtx(principal), effectKey);
      return c.json(result, result.found ? 200 : 404);
    });
    app.post("/kg/verify-effects", async (c) => {
      const principal = c.get("principal");
      requireRole(principal, "reader", "verifyEffects");
      const req = VerifyEffectsRequest.parse(await c.req.json());
      return c.json(await ctx.writer().verifyEffects(principalCtx(principal), req.effectKey, req.cursor, req.pageSize));
    });
  },
  mcp(server, ctx, principal) {
    const text = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v, null, 2) }] });
    const guard = async (f: () => Promise<unknown>) => {
      try {
        return text(await f());
      } catch (e) {
        return text(e instanceof BksServiceError ? { ok: false, ...e.toJSON() } : { ok: false, code: "ERROR", message: (e as Error).message });
      }
    };
    const p = principalCtx(principal);
    if (ROLE_RANK[principal.role] >= ROLE_RANK.writer) {
      server.registerTool("kg_plan", { description: "Compile a biotech-knowledge-intent.v2 into a server-stored plan. Returns planRef + planDigest + the plan view. Writes nothing to the graph.", inputSchema: { intent: IngestionIntentV2 } }, async ({ intent }) => guard(async () => planView(await ctx.writer().plan(intent, p))));
      server.registerTool("kg_apply", { description: "Apply a stored plan: biotech-knowledge-apply.v2 {planRef, expectedPlanDigest, intentDigest, effectKey, partialPolicy, witness}. Statements are never accepted. Retries with the same effectKey return the recorded receipt.", inputSchema: { request: ApplyRequestV2 } }, async ({ request }) => guard(() => ctx.writer().apply(request, p)));
      if (ctx.flags.devAdmission) server.registerTool("kg_admit", { description: "Development admission witness for a stored plan (<= 60 s lease).", inputSchema: AdmitRequest.shape }, async (req) => guard(() => ctx.writer().admit(req.planRef, { effectKey: req.effectKey, partialPolicy: req.partialPolicy ?? "all" }, p)));
    }
    server.registerTool("kg_receipt", { description: "Recorded receipt for an effectKey in this principal's scope (authoritative after a lost response).", inputSchema: { effectKey: EffectKey } }, async ({ effectKey }) => guard(() => ctx.writer().receipt(p, effectKey)));
    server.registerTool("kg_verify_effects", { description: "Paginated complete readback of every declared effect of an applied receipt.", inputSchema: VerifyEffectsRequest.shape }, async (req) => guard(() => ctx.writer().verifyEffects(p, req.effectKey, req.cursor ?? 0, req.pageSize ?? 100)));
  },
};

export type { ExecutorContext };
