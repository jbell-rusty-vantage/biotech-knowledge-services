import { randomUUID, type KeyObject } from "node:crypto";
import { BksServiceError, WITNESS_AUDIENCE, WITNESS_MAX_LIFETIME_SECONDS, type ApplyWitness, type IngestionReceiptV2, type PartialPolicy, type WitnessClaims } from "@bks/contracts";
import type { PlanStore } from "../custody.js";
import { deliverRevocation, readFence } from "../fence.js";
import type { GraphClient } from "../neo4j.js";
import { decodeWitnessClaims, partialPolicyDigest, signWitness } from "../witness.js";
import { scopeKeyOf, type AdmissionLedger, type IssuanceEntry, type LedgerState, type RevocationKind } from "./ledger.js";
import { authorityUnavailable, type EvidenceDecision, type EvidenceSource, type GrantSource, type PrincipalScope } from "./sources.js";

/**
 * Domain admission service (S7, SPECIFICATION 7.2 "External authority consistency").
 *
 * SEMANTICS: AUTHORIZATION AT ISSUANCE PLUS A BOUNDED IN-FLIGHT LEASE. NOT ATOMIC CROSS-STORE REVOCATION.
 *  1. `issue` checks the authoritative grant (Mission Control grant reference) and the sealed verification evidence the
 *     plan relies on (Knowledge Services custody + current state), refuses revoked effects/grants/principals from the
 *     durable ledger, records the issuance durably, and only then signs a `bks-apply-witness.v1` (Ed25519, audience
 *     `bks-executor`, lifetime <= 60 s) bound to the ledger's current revocation generation. Unavailable required
 *     authority fails closed (BKS_AUTHORITY_UNAVAILABLE); no witness, no apply.
 *  2. `revoke` advances the generation and appends an OUTBOX entry durably. New witnesses for the revoked target are
 *     refused immediately. A witness issued earlier stays valid for its lease UNLESS the revocation has reached the
 *     graph: the executor refuses any witness whose generation is older than the local `KsRevocationFence` (checked in
 *     the apply transaction under the writer fence).
 *  3. `deliverRevocations` delivers the outbox at least once (generation is max-monotonic, so redelivery is idempotent);
 *     `reconcile` compares ledger and fence and repairs either side's view (redelivers after a fence regression).
 *  4. `isCurrentlyEligible` is the serving/publication recheck: an effect retained in graph history is denied when its
 *     effect, grant or principal is revoked, when the grant authority no longer allows it, or when the authority is
 *     unavailable (fail closed). History is never rewritten; compensation is a new admitted action.
 * Neo4j and the ledger never share a transaction; nothing here claims instantaneous cross-database authorization.
 */

export const ADMISSION_SEMANTICS = "authorization-at-issuance-plus-bounded-lease" as const;

export interface AdmissionServiceOptions {
  issuer: string;
  signer: { kid: string; key: KeyObject };
  grants: GrantSource;
  /** Required when a plan cites sealed verifications; `null` makes such plans fail closed. */
  evidence: EvidenceSource | null;
  ledger: AdmissionLedger;
  plans: PlanStore;
  now?: () => Date;
  defaultLifetimeSeconds?: number;
}

export interface WitnessRequest {
  planRef: string;
  effectKey: string;
  partialPolicy: PartialPolicy;
  grantRef: string;
  principal: PrincipalScope;
  lifetimeSeconds?: number;
}

export interface AdmissionRecord {
  admissionRef: string;
  semantics: typeof ADMISSION_SEMANTICS;
  issuer: string;
  grantRef: string;
  decisionVersion: string;
  revocationGeneration: number;
  lease: { iat: number; exp: number; seconds: number };
  verifications: EvidenceDecision["items"];
}

export interface AdmissionResult {
  witness: ApplyWitness;
  claims: WitnessClaims;
  admission: AdmissionRecord;
}

export interface Eligibility {
  effectKey: string;
  eligible: boolean;
  code: "ELIGIBLE" | "NOT_ADMITTED" | "EFFECT_REVOKED" | "GRANT_REVOKED" | "PRINCIPAL_REVOKED" | "GRANT_DENIED" | "NOT_APPLIED" | "BKS_AUTHORITY_UNAVAILABLE";
  reason: string;
  /** The effect's receipt is retained either way (history is not rewritten). */
  receipt: { found: boolean; status?: string; receiptId?: string } | null;
  admissions: number;
  ledgerGeneration: number | null;
  checkedAt: string;
}

export interface DeliveryReport {
  ledgerGeneration: number;
  fenceGeneration: number | null;
  delivered: Array<{ id: string; generation: number }>;
  pending: Array<{ id: string; generation: number }>;
  errors: string[];
}

export interface ReconcileReport extends DeliveryReport {
  inSync: boolean;
  /** Entries the ledger thought delivered while the fence is behind (fence regression, e.g. a restore): redelivered. */
  regressed: Array<{ id: string; generation: number }>;
  /** Fence ahead of the ledger: the ledger lost revocations. Admission must stay closed until an operator reconciles. */
  ledgerBehindFence: boolean;
}

export class AdmissionService {
  readonly now: () => Date;
  constructor(readonly opts: AdmissionServiceOptions) {
    this.now = opts.now ?? (() => new Date());
  }

  private revokedFor(state: LedgerState, effectKey: string, scopeKey: string, grantRef: string, principalId: string, afterGeneration = -1) {
    return state.revocations.find(
      (r) =>
        r.generation > afterGeneration &&
        ((r.kind === "effect" && r.target === effectKey && (r.scopeKey === null || r.scopeKey === scopeKey)) ||
          (r.kind === "grant" && r.target === grantRef && (r.scopeKey === null || r.scopeKey === scopeKey)) ||
          (r.kind === "principal" && r.target === principalId && (r.scopeKey === null || r.scopeKey === scopeKey))),
    );
  }

  /** Checks authority for the stored plan and signs a witness for exactly this apply. */
  async issue(req: WitnessRequest): Promise<AdmissionResult> {
    const record = await this.opts.plans.get(req.planRef);
    if (!record) throw new BksServiceError("BKS_PLAN_NOT_FOUND", `no stored plan ${req.planRef}`);
    const plan = record.plan;
    const b = plan.binding;
    const scope = { installationId: req.principal.installationId, applicationId: req.principal.applicationId, tenantId: req.principal.tenantId };
    if (b.principal.installationId !== scope.installationId || b.principal.applicationId !== scope.applicationId || b.principal.tenantId !== scope.tenantId) throw new BksServiceError("BKS_FORBIDDEN_SCOPE", "the plan was compiled for another scope");
    if (plan.outcome === "rejected") throw new BksServiceError("BKS_PLAN_REJECTED", "a rejected plan is not admitted");
    const scopeKey = scopeKeyOf(scope);
    const now = this.now();
    // 1. Durable ledger (authoritative revocation state). Unreadable ledger: fail closed.
    const state = await this.opts.ledger.read();
    const revoked = this.revokedFor(state, req.effectKey, scopeKey, req.grantRef, req.principal.principalId);
    if (revoked) throw new BksServiceError("BKS_FORBIDDEN_SCOPE", `admission denied: ${revoked.kind} ${revoked.target} was revoked at generation ${revoked.generation} (${revoked.reason})`, { revocationGeneration: revoked.generation });
    // 2. Mission Control grant reference (authoritative; unavailable -> fail closed).
    let decision;
    try {
      decision = await this.opts.grants.check({ grantRef: req.grantRef, principal: req.principal, effectKey: req.effectKey, operation: "knowledge.ingestion_apply", planDigest: plan.planDigest, now });
    } catch (e) {
      throw e instanceof BksServiceError ? e : authorityUnavailable(`grant authority failed: ${(e as Error).message}`);
    }
    if (!decision.allowed) throw new BksServiceError("BKS_FORBIDDEN_SCOPE", `admission denied: ${decision.reason ?? "not granted"}`, { grantRef: req.grantRef });
    // 3. Sealed verification evidence from Knowledge Services custody (required whenever the plan cites any).
    const verificationRefs = b.custodyRefs.filter((c) => c.kind === "sealed-verification").map((c) => ({ ref: c.ref, digest: c.digest }));
    let evidence: EvidenceDecision = { ok: true, items: [] };
    if (verificationRefs.length) {
      if (!this.opts.evidence) throw authorityUnavailable("the plan cites sealed verifications but no verification evidence authority is configured; failing closed");
      evidence = await this.opts.evidence.check(verificationRefs);
      if (!evidence.ok) throw new BksServiceError("BKS_EVIDENCE_UNVERIFIED", `admission denied: ${evidence.reason}`, { items: evidence.items });
    }
    // 4. Sign, then record the issuance durably before the witness leaves the service (a lost ledger write = no witness).
    const lifetime = Math.max(1, Math.min(req.lifetimeSeconds ?? this.opts.defaultLifetimeSeconds ?? 45, WITNESS_MAX_LIFETIME_SECONDS));
    const iat = Math.floor(now.getTime() / 1000);
    const jti = randomUUID();
    const generation = state.generation;
    const witness = signWitness(
      {
        iss: this.opts.issuer,
        aud: WITNESS_AUDIENCE,
        jti,
        sub: req.principal.principalId,
        scope,
        effectKey: req.effectKey,
        intentDigest: b.intentDigest,
        planDigest: plan.planDigest,
        schemaReleaseDigest: b.schemaReleaseDigest,
        evidenceDigest: b.evidenceDigest,
        partialPolicyDigest: partialPolicyDigest(req.partialPolicy),
        policyVersion: b.policyVersion,
        decisionVersion: decision.decisionVersion,
        iat,
        exp: iat + lifetime,
        revocationGeneration: generation,
      },
      this.opts.signer,
    );
    const admissionRef = `adm-${jti}`;
    const entry: IssuanceEntry = { jti, admissionRef, effectKey: req.effectKey, scopeKey, principalId: req.principal.principalId, grantRef: req.grantRef, planRef: plan.planRef, planDigest: plan.planDigest, intentDigest: b.intentDigest, generation, iat, exp: iat + lifetime, issuer: this.opts.issuer, kid: this.opts.signer.kid, decisionVersion: decision.decisionVersion, verificationRefs };
    await this.opts.ledger.update((s) => {
      // A revocation that landed between the read and this write wins: refuse rather than issue a stale-generation witness.
      if (s.generation !== generation) throw new BksServiceError("BKS_WITNESS_REVOKED", `revocation generation moved to ${s.generation} during admission; request a new witness`);
      s.issuances.push(entry);
    });
    return {
      witness,
      claims: decodeWitnessClaims(witness),
      admission: { admissionRef, semantics: ADMISSION_SEMANTICS, issuer: this.opts.issuer, grantRef: req.grantRef, decisionVersion: decision.decisionVersion, revocationGeneration: generation, lease: { iat, exp: iat + lifetime, seconds: lifetime }, verifications: evidence.items },
    };
  }

  /** Records a revocation (new generation + outbox entry). Takes effect for NEW witnesses at once; the graph fence on delivery. */
  async revoke(r: { kind: RevocationKind; target: string; scope?: { installationId: string; applicationId: string; tenantId: string } | null; reason: string }): Promise<{ generation: number; outboxId: string }> {
    const at = this.now().toISOString();
    return this.opts.ledger.update((s) => {
      s.generation += 1;
      s.revocations.push({ generation: s.generation, at, kind: r.kind, target: r.target, scopeKey: r.scope ? scopeKeyOf(r.scope) : null, reason: r.reason });
      const id = `rv-${s.generation}`;
      s.outbox.push({ id, generation: s.generation, createdAt: at, attempts: [], deliveredAt: null });
      return { generation: s.generation, outboxId: id };
    });
  }

  /** At-least-once delivery of pending outbox entries into KsRevocationFence (ordered by generation). */
  async deliverRevocations(client: GraphClient, faults: { afterGraphWrite?: (generation: number) => Promise<void> | void } = {}): Promise<DeliveryReport> {
    const state = await this.opts.ledger.read();
    const pending = state.outbox.filter((o) => !o.deliveredAt).sort((a, b) => a.generation - b.generation);
    const delivered: DeliveryReport["delivered"] = [];
    const errors: string[] = [];
    let fenceGeneration: number | null = null;
    if (pending.length) {
      const target = pending[pending.length - 1]!.generation;
      const at = this.now().toISOString();
      try {
        fenceGeneration = await deliverRevocation(client, target);
      } catch (e) {
        const msg = (e as Error).message;
        errors.push(msg);
        await this.opts.ledger.update((s) => {
          for (const o of s.outbox) if (!o.deliveredAt && o.generation <= target) o.attempts.push({ at, ok: false, fenceGeneration: null, error: msg.slice(0, 500) });
        });
      }
      if (fenceGeneration !== null) {
        await faults.afterGraphWrite?.(fenceGeneration);
        const fg = fenceGeneration;
        await this.opts.ledger.update((s) => {
          for (const o of s.outbox) {
            if (o.deliveredAt || o.generation > fg) continue;
            o.attempts.push({ at, ok: true, fenceGeneration: fg, error: null });
            o.deliveredAt = at;
            delivered.push({ id: o.id, generation: o.generation });
          }
        });
      }
    } else {
      fenceGeneration = await this.fenceGeneration(client).catch(() => null);
    }
    const after = await this.opts.ledger.read();
    return { ledgerGeneration: after.generation, fenceGeneration, delivered, pending: after.outbox.filter((o) => !o.deliveredAt).map((o) => ({ id: o.id, generation: o.generation })), errors };
  }

  private async fenceGeneration(client: GraphClient): Promise<number | null> {
    const fence = await client.read((tx) => readFence(tx));
    return fence ? fence.revocationGeneration : null;
  }

  /** Compares ledger and graph fence; marks fence-acknowledged entries delivered, redelivers after a regression. */
  async reconcile(client: GraphClient): Promise<ReconcileReport> {
    let fence = await this.fenceGeneration(client);
    const regressed: ReconcileReport["regressed"] = [];
    const at = this.now().toISOString();
    await this.opts.ledger.update((s) => {
      for (const o of s.outbox) {
        if (o.deliveredAt && (fence ?? 0) < o.generation) {
          o.deliveredAt = null;
          o.attempts.push({ at, ok: false, fenceGeneration: fence, error: "reconcile: fence is behind a delivered generation (regression); redelivering" });
          regressed.push({ id: o.id, generation: o.generation });
        } else if (!o.deliveredAt && fence !== null && fence >= o.generation) {
          o.deliveredAt = at;
          o.attempts.push({ at, ok: true, fenceGeneration: fence, error: null });
        }
      }
    });
    const report = await this.deliverRevocations(client);
    fence = report.fenceGeneration ?? fence;
    const ledgerBehindFence = fence !== null && fence > report.ledgerGeneration;
    return { ...report, fenceGeneration: fence, regressed, ledgerBehindFence, inSync: !ledgerBehindFence && report.pending.length === 0 && (fence ?? 0) >= report.ledgerGeneration };
  }

  /**
   * Serving / publication recheck for an effect that may be retained in graph history. Fails closed: any authority
   * failure is `eligible: false` with code BKS_AUTHORITY_UNAVAILABLE. `receipt` (optional) supplies the scoped receipt
   * lookup; an effect without an applied receipt is not served.
   */
  async isCurrentlyEligible(
    effectKey: string,
    principal: PrincipalScope,
    opts: { receipt?: (effectKey: string) => Promise<{ found: boolean; status?: string; receipt?: IngestionReceiptV2 }> } = {},
  ): Promise<Eligibility> {
    const checkedAt = this.now().toISOString();
    const scopeKey = scopeKeyOf(principal);
    const base = { effectKey, checkedAt };
    let receipt: Eligibility["receipt"] = null;
    if (opts.receipt) {
      try {
        const r = await opts.receipt(effectKey);
        receipt = { found: r.found, ...(r.status ? { status: r.status } : {}), ...(r.receipt ? { receiptId: r.receipt.receiptId } : {}) };
      } catch (e) {
        return { ...base, eligible: false, code: "BKS_AUTHORITY_UNAVAILABLE", reason: `receipt lookup failed: ${(e as Error).message}`, receipt: null, admissions: 0, ledgerGeneration: null };
      }
    }
    let state: LedgerState;
    try {
      state = await this.opts.ledger.read();
    } catch (e) {
      return { ...base, eligible: false, code: "BKS_AUTHORITY_UNAVAILABLE", reason: (e as Error).message, receipt, admissions: 0, ledgerGeneration: null };
    }
    const deny = (code: Eligibility["code"], reason: string, admissions: number): Eligibility => ({ ...base, eligible: false, code, reason, receipt, admissions, ledgerGeneration: state.generation });
    const issued = state.issuances.filter((i) => i.effectKey === effectKey && i.scopeKey === scopeKey);
    if (!issued.length) return deny("NOT_ADMITTED", "no witness for this effect was issued by this admission authority", 0);
    for (const i of issued) {
      const r = this.revokedFor(state, effectKey, scopeKey, i.grantRef, i.principalId);
      if (r) return deny(r.kind === "effect" ? "EFFECT_REVOKED" : r.kind === "grant" ? "GRANT_REVOKED" : "PRINCIPAL_REVOKED", `${r.kind} ${r.target} revoked at generation ${r.generation}: ${r.reason}`, issued.length);
    }
    const latest = issued[issued.length - 1]!;
    try {
      const d = await this.opts.grants.check({ grantRef: latest.grantRef, principal: { ...principal, principalId: latest.principalId }, effectKey, operation: "serving", now: this.now() });
      if (!d.allowed) return deny("GRANT_DENIED", d.reason ?? "grant no longer allows serving", issued.length);
    } catch (e) {
      return deny("BKS_AUTHORITY_UNAVAILABLE", (e as Error).message, issued.length);
    }
    if (receipt && !(receipt.found && receipt.status === "applied")) return deny("NOT_APPLIED", "no applied receipt for this effect", issued.length);
    return { ...base, eligible: true, code: "ELIGIBLE", reason: "admitted, not revoked, grant still allows serving", receipt, admissions: issued.length, ledgerGeneration: state.generation };
  }
}
