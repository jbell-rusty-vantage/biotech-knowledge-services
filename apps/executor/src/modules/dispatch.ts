import { ADMISSION_ACK_V1, ADMISSION_CONSUME_REPORT_V1, ADMISSION_DISPATCH_V1, AdmissionConsumeRequestV1, BksServiceError, INTENT_MARKER_V2, READ_INTENT_V3 } from "@bks/contracts";
import { consumerConfigFromEnv, consumerConfigured, DispatchConsumer, PgVerificationAuthority, type OutboxAuthority } from "@bks/kg-ops";
import { requireRole, requireService } from "../auth.js";
import type { ExecutorContext } from "../context.js";
import type { ExecutorModule } from "./module.js";

/**
 * Knowledge Services dispatch admission (Sprint V SV-11; design section 7, K06 through the native executor).
 *
 *   POST /kg/admission/dispatch/consume   biotech-knowledge-admission-consume-request.v1 {tenantId, limit?}
 *                                         -> biotech-knowledge-admission-consume.v1 (one ack record per claimed dispatch)
 *                                         service principal (token class service) + role writer + grant admission.dispatch,
 *                                         for its own tenantId, which must be listed in BKS_VERIFICATION_TENANTS
 *
 * The consumer claims from knowledge_verification.dispatch_outbox in the Biotech application PostgreSQL
 * (BKS_BIOTECH_DB_VERIFICATION_DSN: a login role holding knowledge_verification_outbox_worker), applies each exact effect and its
 * KsIntentMarker in one Neo4j transaction and acknowledges with the marker digest. Calls are idempotent: a repeated or
 * concurrent trigger claims nothing new (claim_dispatches is SKIP LOCKED) or acknowledges duplicates with the stored
 * marker digest. The CLI equivalent is `bks admission consume --once`. No MCP tool: agents never admit effects.
 */

const consumers = new WeakMap<ExecutorContext, { authority: OutboxAuthority; consumer: DispatchConsumer }>();

export function dispatchConsumerFor(ctx: ExecutorContext): DispatchConsumer {
  let entry = consumers.get(ctx);
  if (!entry) {
    const authority = PgVerificationAuthority.fromEnv(ctx.env);
    if (!authority) throw new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", "BKS_BIOTECH_DB_VERIFICATION_DSN is not configured; the dispatch consumer fails closed");
    const cfg = consumerConfigFromEnv(ctx.env);
    entry = { authority, consumer: new DispatchConsumer({ authority, writer: ctx.writer(), ...(cfg.grants ? { grants: cfg.grants } : {}) }) };
    consumers.set(ctx, entry);
  }
  return entry.consumer;
}

export const executorModule: ExecutorModule = {
  id: "admission-dispatch",
  enabled: (ctx) => consumerConfigured(ctx.env).ok,
  capabilities: () => [
    {
      name: "admission.dispatch",
      role: "writer",
      details: {
        contract: ADMISSION_DISPATCH_V1,
        request: "biotech-knowledge-admission-consume-request.v1",
        report: ADMISSION_CONSUME_REPORT_V1,
        acknowledgment: ADMISSION_ACK_V1,
        marker: INTENT_MARKER_V2,
        officialReads: READ_INTENT_V3,
        principal: "token class service + grant admission.dispatch",
        authority: "knowledge_verification (common component) dispatch_outbox / use_decision in the Biotech application PostgreSQL",
        atomicity: "graph effect + KsIntentMarker in one Neo4j transaction; PostgreSQL and Neo4j are not atomic together",
      },
    },
  ],
  http(app, ctx) {
    app.post("/kg/admission/dispatch/consume", async (c) => {
      const principal = c.get("principal");
      requireRole(principal, "writer", "admission.dispatch");
      requireService(principal, "admission.dispatch", "admission.dispatch");
      const body = AdmissionConsumeRequestV1.parse(await c.req.json());
      if (principal.tenantId !== body.tenantId) throw new BksServiceError("BKS_FORBIDDEN_SCOPE", "a service principal consumes only its own tenant");
      if (!consumerConfigFromEnv(ctx.env).tenants.includes(body.tenantId)) throw new BksServiceError("BKS_FORBIDDEN_SCOPE", "tenant is not one of BKS_VERIFICATION_TENANTS");
      const report = await dispatchConsumerFor(ctx).consumeOnce(body.tenantId, body.limit);
      return c.json(report);
    });
  },
};
