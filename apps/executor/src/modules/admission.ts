import { resolve } from "node:path";
import { z } from "zod";
import { BksServiceError, EffectKey, PartialPolicy, type Principal } from "@bks/contracts";
import { defaultCustodyRoot, parseSigningKey } from "@bks/kg-ops";
// The admission package is exported from @bks/kg-ops (S7 patch P1, applied by S3).
import {
  AdmissionService,
  CustodyEvidenceSource,
  FileAdmissionLedger,
  FileGrantSource,
  FileVerificationStateSource,
  HttpGrantSource,
  HttpVerificationStateSource,
  type GrantSource,
  type VerificationStateSource,
} from "@bks/kg-ops";
import { requireRole } from "../auth.js";
import type { ExecutorContext } from "../context.js";
import type { ExecutorModule } from "./module.js";

/**
 * Domain admission service surface (S7, SPECIFICATION 7.2). Production replacement of the development `/kg/admit`.
 *
 *   POST /kg/admission/witness       {planRef, effectKey, partialPolicy, grantRef, lifetimeSeconds?}  -> {witness, admission} (writer)
 *   POST /kg/admission/revocations   {kind: grant|effect|principal, target, reason, scoped?}          -> {generation, outboxId} (admin)
 *   POST /kg/admission/deliver       delivers pending revocations into KsRevocationFence (at least once)  (admin)
 *   POST /kg/admission/reconcile     ledger vs fence; redelivers after a regression                     (admin)
 *   GET  /kg/eligibility?effectKey=  serving-time recheck: revoked effects are denied although history is kept (reader)
 *
 * Semantics: authorization at issuance plus a bounded in-flight lease (<= 60 s); not atomic cross-store revocation.
 * Required authority unavailable -> BKS_AUTHORITY_UNAVAILABLE (503). No MCP tools: agents never admit their own effects.
 *
 * Configuration (host-side; names only):
 *   BKS_ADMISSION_ENABLED=1
 *   BKS_WITNESS_SIGNING_KEY=kid:<base64 PKCS8 DER Ed25519>   the admission issuer key; its public half must be pinned in
 *                                                           the executor's BKS_WITNESS_ISSUER_KEYS
 *   BKS_WITNESS_ISSUER                                      issuer name (default bks-admission)
 *   BKS_ADMISSION_GRANT_SOURCE=file:<path> | http(s)://...  Mission Control grant authority (BKS_ADMISSION_GRANT_TOKEN for http)
 *   BKS_ADMISSION_LEDGER=<path>                             durable ledger (default <custody root>/admission/ledger.json)
 *   BKS_ADMISSION_LEDGER_CREATE=1                           create the ledger if absent (first install only)
 *   BKS_ADMISSION_EVIDENCE=custody|none                     sealed verification authority (default custody)
 *   BKS_ADMISSION_VERIFICATION_STATE=file:<path> | http(s)://...  Knowledge Services current verification state (optional)
 */

const WitnessBody = z.strictObject({ planRef: z.string().min(1).max(200), effectKey: EffectKey, partialPolicy: PartialPolicy.default("all"), grantRef: z.string().min(1).max(400), lifetimeSeconds: z.number().int().min(1).max(60).optional() });
const RevocationBody = z.strictObject({ kind: z.enum(["grant", "effect", "principal"]), target: z.string().min(1).max(400), reason: z.string().min(1).max(2000), scoped: z.boolean().default(true) });

const services = new WeakMap<ExecutorContext, AdmissionService>();

export function admissionConfigured(env: NodeJS.ProcessEnv): { ok: boolean; missing: string[] } {
  if (env.BKS_ADMISSION_ENABLED !== "1") return { ok: false, missing: ["BKS_ADMISSION_ENABLED"] };
  const missing = ["BKS_WITNESS_SIGNING_KEY", "BKS_ADMISSION_GRANT_SOURCE"].filter((k) => !env[k]?.trim());
  return { ok: missing.length === 0, missing };
}

function grantSourceFrom(spec: string, env: NodeJS.ProcessEnv): GrantSource {
  if (spec.startsWith("file:")) return new FileGrantSource(resolve(spec.slice(5)));
  if (/^https?:\/\//.test(spec)) return new HttpGrantSource(spec, env.BKS_ADMISSION_GRANT_TOKEN ?? null);
  throw new Error(`BKS_ADMISSION_GRANT_SOURCE must be file:<path> or an http(s) URL`);
}

function stateSourceFrom(spec: string | undefined, env: NodeJS.ProcessEnv): VerificationStateSource | null {
  if (!spec) return null;
  if (spec.startsWith("file:")) return new FileVerificationStateSource(resolve(spec.slice(5)));
  if (/^https?:\/\//.test(spec)) return new HttpVerificationStateSource(spec, env.BKS_ADMISSION_VERIFICATION_TOKEN ?? null);
  throw new Error("BKS_ADMISSION_VERIFICATION_STATE must be file:<path> or an http(s) URL");
}

export function admissionService(ctx: ExecutorContext): AdmissionService {
  let svc = services.get(ctx);
  if (svc) return svc;
  const env = ctx.env;
  const signer = parseSigningKey(env.BKS_WITNESS_SIGNING_KEY);
  if (!signer) throw new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", "admission signing key is not configured; admission fails closed");
  const writer = ctx.writer();
  const ledgerPath = resolve(env.BKS_ADMISSION_LEDGER ?? resolve(defaultCustodyRoot(env), "admission", "ledger.json"));
  svc = new AdmissionService({
    issuer: env.BKS_WITNESS_ISSUER ?? "bks-admission",
    signer,
    grants: grantSourceFrom(env.BKS_ADMISSION_GRANT_SOURCE ?? "", env),
    evidence: env.BKS_ADMISSION_EVIDENCE === "none" ? null : new CustodyEvidenceSource(writer.verifications, stateSourceFrom(env.BKS_ADMISSION_VERIFICATION_STATE, env)),
    ledger: new FileAdmissionLedger(ledgerPath, { create: env.BKS_ADMISSION_LEDGER_CREATE === "1" }),
    plans: writer.plans,
  });
  services.set(ctx, svc);
  return svc;
}

const scopeOf = (p: Principal) => ({ principalId: p.principalId, installationId: p.installationId, applicationId: p.applicationId, tenantId: p.tenantId });
let warned = false;

export const executorModule: ExecutorModule = {
  id: "admission",
  enabled: (ctx) => {
    const c = admissionConfigured(ctx.env);
    if (!c.ok && ctx.env.BKS_ADMISSION_ENABLED === "1" && !warned) {
      warned = true;
      console.warn(`admission module disabled (fail closed): missing ${c.missing.join(", ")}`);
    }
    return c.ok;
  },
  capabilities: () => [
    { name: "admission.witness", role: "writer", details: { contract: "bks-apply-witness.v1", semantics: "authorization at issuance plus bounded in-flight lease (<= 60 s); not atomic cross-store revocation", authorities: ["mission-control grant reference", "knowledge-services sealed verification custody"], failClosed: "BKS_AUTHORITY_UNAVAILABLE" } },
    { name: "admission.revocation", role: "admin", details: { delivery: "durable outbox, at least once, into KsRevocationFence; reconciled", newWitnesses: "refused immediately", inFlight: "valid until lease expiry unless the revocation reached the graph fence" } },
    { name: "serving.eligibility", role: "reader", details: { lookup: "effectKey", historyRetained: true, failClosed: true } },
  ],
  http(app, ctx) {
    app.post("/kg/admission/witness", async (c) => {
      const principal = c.get("principal");
      requireRole(principal, "writer", "admission.witness");
      const body = WitnessBody.parse(await c.req.json());
      const out = await admissionService(ctx).issue({ planRef: body.planRef, effectKey: body.effectKey, partialPolicy: body.partialPolicy, grantRef: body.grantRef, principal: scopeOf(principal), ...(body.lifetimeSeconds ? { lifetimeSeconds: body.lifetimeSeconds } : {}) });
      return c.json({ witness: out.witness, admission: out.admission });
    });
    app.post("/kg/admission/revocations", async (c) => {
      const principal = c.get("principal");
      requireRole(principal, "admin", "admission.revocation");
      const body = RevocationBody.parse(await c.req.json());
      return c.json(await admissionService(ctx).revoke({ kind: body.kind, target: body.target, reason: body.reason, scope: body.scoped ? scopeOf(principal) : null }));
    });
    app.post("/kg/admission/deliver", async (c) => {
      requireRole(c.get("principal"), "admin", "admission.revocation");
      return c.json(await admissionService(ctx).deliverRevocations(ctx.graph()));
    });
    app.post("/kg/admission/reconcile", async (c) => {
      requireRole(c.get("principal"), "admin", "admission.revocation");
      return c.json(await admissionService(ctx).reconcile(ctx.graph()));
    });
    app.get("/kg/eligibility", async (c) => {
      const principal = c.get("principal");
      requireRole(principal, "reader", "serving.eligibility");
      const effectKey = EffectKey.parse(c.req.query("effectKey"));
      const scope = scopeOf(principal);
      const result = await admissionService(ctx).isCurrentlyEligible(effectKey, scope, { receipt: (k) => ctx.writer().receipt({ ...scope, grants: principal.grants }, k) });
      return c.json(result, result.code === "BKS_AUTHORITY_UNAVAILABLE" ? 503 : 200);
    });
  },
};
