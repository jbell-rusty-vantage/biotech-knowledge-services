import {
  ADMISSION_ACK_V1,
  ADMISSION_CONSUME_REPORT_V1,
  ADMISSION_PAYLOAD_MEDIA_TYPE,
  ADMISSION_TARGET_BINDING,
  AdmissionDispatchV1,
  BksServiceError,
  boundEffectDigestOf,
  INTENT_MARKER_V2,
  markerDigestOf,
  canonicalize,
  rawBytesDigest,
  type AdmissionAcknowledgmentV1,
  type AdmissionConsumeReportV1,
  type DispatchOutcome,
  type IngestionPlanV2,
  type IngestionReceiptV2,
} from "@bks/contracts";
import { applyAdmittedV2, getReceiptV2, markerKeyOf, type AdmittedApplyRequest, type ApplyFaults, type ApplyOptions, type DispatchAuthorization, type ReceiptLookup } from "../apply.js";
import { intentDigestOf } from "../plan.js";
import type { KnowledgeWriter } from "../write/service.js";
import type { PrincipalCtx } from "../write/context.js";
import { AuthorityError, AuthorityUnavailableError, BKS_INTENT_MARKER_SCHEME, evaluateDecision, KS_INTENT_MARKER_SCHEME, ksIntentMarkerDigest, type OutboxAuthority, type OutboxRow } from "./verification.js";

/**
 * Knowledge Services dispatch outbox consumer (Sprint V SV-11, design section 7, section 9 K06).
 *
 *   claim_dispatches(tenant, limit)                          (PostgreSQL, outbox-worker role)
 *   for each claimed row, in order:
 *     1. payload: artifact_custody bytes whose sha256 = payload_digest, parsed as biotech-knowledge-admission.v1,
 *        bound to the row (tenant, dispatch id, effect key, target binding)
 *     2. row state recheck: `revoked` (revoke_pending_dispatches raced the claim) -> outcome revoked, no graph write
 *     3. bound effect: knowledge_verification.effect + origin identity reproduce the payload bound effect digest
 *        over the exact native intent bytes (bks-canonical-json.v2 of `intent`)
 *     4. existing KsIntentMarker for the effect: duplicate / reordered / lost-ack -> acknowledge again with the STORED
 *        marker digest, never re-apply
 *     5. exact-use recheck of the use decision (digest, bound effect, disposition, supersession, expiry, invalidation
 *        closure) at the current authoritative epoch: revoked -> outcome revoked; stale -> deferred / refused
 *     6. plan through the trusted v2 writer (planner clock = decidedAt: same graph state -> same plan digest), then
 *        apply effect + marker + Activity admission binding in ONE Neo4j write transaction (applyAdmittedV2)
 *     7. acknowledge_dispatch(tenant, dispatch id, ack digest[, ack record]) where the ack digest follows the row's
 *        marker scheme (component 2.2.0): `ks-intent-marker.v1` -> the component's expected digest, recomputed here from
 *        the row's bound fields; `bks-intent-marker-digest.v1` -> markerDigestOf(this row's payload digest, plan digest);
 *        no scheme (2.1.0) -> the native marker digest. The KsIntentMarker keeps the BKS-native marker digest, and the
 *        ack record carries it (with payload / plan digests and the graph commit reference) for provenance.
 *   graph unavailable / transaction failure / authority unavailable -> fail_dispatch(..., retry) and no marker.
 *
 * PostgreSQL and Neo4j are NOT one transaction. Revocation can race the graph commit; then the acknowledgment is
 * refused (DISPATCH_REVOKED), the marker stays, and official reads exclude the projection after revalidation.
 * A decision found revoked at the exact-use recheck is settled terminally with the component's settle_dispatch
 * (knowledge_verification 2.2.0); against a 2.1.0 component (no settle_dispatch) the row is parked with fail_dispatch
 * and a long retry, as before.
 */

/** The graph side of the consumer: the trusted v2 writer (plan / admitted apply / marker lookup). A fake serves T0. */
export interface DispatchGraph {
  marker(scope: { installationId: string; applicationId: string; tenantId: string }, effectKey: string): Promise<ReceiptLookup>;
  plan(intent: unknown, principal: PrincipalCtx, now: () => Date): Promise<IngestionPlanV2>;
  apply(request: AdmittedApplyRequest, admission: DispatchAuthorization, opts: ApplyOptions): Promise<IngestionReceiptV2>;
}

/** The production graph port: KnowledgeWriter + applyAdmittedV2 (one Neo4j write transaction under the marker). */
export function writerGraph(w: KnowledgeWriter): DispatchGraph {
  return {
    marker: (scope, effectKey) => getReceiptV2(w.client, scope, effectKey),
    plan: (intent, principal, now) => w.plan(intent, principal, now),
    apply: (request, admission, opts) => applyAdmittedV2(w.client, { schema: w.schema, plans: w.plans, snapshots: w.snapshots, witnessKeys: w.witnessKeys, ...(w.receipts ? { receipts: w.receipts } : {}), localDev: w.localDev }, request, admission, opts),
  };
}

export interface DispatchConsumerOptions {
  authority: OutboxAuthority;
  /** The trusted writer; or `graph` (a DispatchGraph) for tests. */
  writer?: KnowledgeWriter;
  graph?: DispatchGraph;
  /** Grants of the dispatch principal (the planner checks report.publish / assessment.accept / ...). */
  grants?: string[];
  principalId?: string;
  now?: () => Date;
  retry?: { transientSeconds?: number; heldSeconds?: number; terminalSeconds?: number };
  /** Test hooks (never set in production). */
  hooks?: { afterClaim?: (rows: OutboxRow[]) => Promise<void> | void; beforeApply?: (row: OutboxRow) => Promise<void> | void; applyFaults?: ApplyFaults };
}

const DEFAULT_GRANTS = ["report.publish", "assessment.accept", "adjudication.deliver"];

interface Ctx {
  row: OutboxRow;
  started: Date;
  /** The parsed dispatch payload (set once it verified against the row). */
  payload?: AdmissionDispatchV1;
}

export class DispatchConsumer {
  private readonly now: () => Date;
  private readonly retry: Required<NonNullable<DispatchConsumerOptions["retry"]>>;
  private readonly graph: DispatchGraph;

  constructor(readonly opts: DispatchConsumerOptions) {
    this.now = opts.now ?? (() => new Date());
    const graph = opts.graph ?? (opts.writer ? writerGraph(opts.writer) : null);
    if (!graph) throw new Error("DispatchConsumer needs a writer or a graph port");
    this.graph = graph;
    this.retry = { transientSeconds: 30, heldSeconds: 300, terminalSeconds: 86_400, ...(opts.retry ?? {}) };
  }

  /** `bks admission consume --once`: claim and process one batch. */
  async consumeOnce(tenantId: string, limit = 10, claimAt?: Date): Promise<AdmissionConsumeReportV1> {
    const startedAt = this.now();
    let rows: OutboxRow[];
    try {
      rows = await this.opts.authority.claim(tenantId, limit, claimAt);
    } catch (e) {
      if (e instanceof AuthorityUnavailableError) throw new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", e.message);
      throw e;
    }
    await this.opts.hooks?.afterClaim?.(rows);
    const results: AdmissionAcknowledgmentV1[] = [];
    for (const row of rows) results.push(await this.process(row));
    return { schemaVersion: ADMISSION_CONSUME_REPORT_V1, tenantId, claimed: rows.length, results, startedAt: startedAt.toISOString(), finishedAt: this.now().toISOString() };
  }

  private principal(scope: { installationId: string; applicationId: string; tenantId: string }): PrincipalCtx {
    return { principalId: this.opts.principalId ?? "bks-admission-consumer", ...scope, grants: [...(this.opts.grants ?? DEFAULT_GRANTS)].sort() };
  }

  private result(c: Ctx, outcome: DispatchOutcome, extra: Partial<AdmissionAcknowledgmentV1> = {}): AdmissionAcknowledgmentV1 {
    return {
      schemaVersion: ADMISSION_ACK_V1,
      tenantId: c.row.tenantId,
      dispatchId: c.row.dispatchId,
      effectKey: c.row.effectKey,
      outcome,
      markerDigest: null,
      payloadDigest: c.row.payloadDigest,
      planDigest: null,
      receiptId: null,
      graph: { bookmark: null, graphRevision: null, markerKey: null },
      appliedAt: null,
      componentState: null,
      acknowledged: false,
      reason: null,
      retryAfterSeconds: null,
      processedAt: this.now().toISOString(),
      ...extra,
    };
  }

  /** Not applied: park the row with fail_dispatch (retry later) and report the outcome. */
  private async park(c: Ctx, outcome: DispatchOutcome, code: string, message: string, seconds: number, extra: Partial<AdmissionAcknowledgmentV1> = {}): Promise<AdmissionAcknowledgmentV1> {
    // A permanent refusal of this consumer's own dispatch is terminal (R1 F13): settle_dispatch(..., 'refused'). A row of
    // another target binding (claimed only by a 2.1.0 component) is never settled by this consumer.
    if (outcome === "refused" && code !== "TARGET_BINDING_MISMATCH") return this.settleTerminal(c, "refused", code, message, extra, seconds);
    let componentState: AdmissionAcknowledgmentV1["componentState"] = null;
    try {
      componentState = (await this.opts.authority.fail(c.row.tenantId, c.row.dispatchId, `${code}: ${message}`, seconds)).state;
    } catch (e) {
      // DISPATCH_NOT_CLAIMED: the row moved on (e.g. revoked); an unavailable authority leaves the claim to expire.
      if (e instanceof AuthorityError && e.code === "DISPATCH_NOT_CLAIMED") componentState = (await this.opts.authority.row(c.row.tenantId, c.row.dispatchId).catch(() => null))?.state ?? null;
    }
    return this.result(c, outcome, { reason: { code, message: message.slice(0, 2000) }, retryAfterSeconds: seconds, componentState, ...extra });
  }

  /** Revoked at the recheck: settle terminally (2.2.0); park with fail_dispatch when the component has no settle_dispatch. */
  private settleRevoked(c: Ctx, code: string, message: string): Promise<AdmissionAcknowledgmentV1> {
    return this.settleTerminal(c, "revoked", code, message, {}, this.retry.terminalSeconds);
  }

  /** settle_dispatch (2.2.0) with a reason record; a pre-2.2.0 component (42883) falls back to the fail_dispatch park. */
  private async settleTerminal(c: Ctx, outcome: "revoked" | "refused", code: string, message: string, extra: Partial<AdmissionAcknowledgmentV1>, fallbackSeconds: number): Promise<AdmissionAcknowledgmentV1> {
    const settle = this.opts.authority.settle?.bind(this.opts.authority);
    if (settle) {
      try {
        const row = await settle(c.row.tenantId, c.row.dispatchId, outcome, { reason: code, message: message.slice(0, 2000), consumer: this.opts.principalId ?? "bks-admission-consumer" });
        return this.result(c, outcome, { reason: { code, message: message.slice(0, 2000) }, componentState: row.state, ...extra });
      } catch (e) {
        if (!(e instanceof AuthorityError && (e.sqlState === "42883" || e.code === "42883"))) throw e;
      }
    }
    let componentState: AdmissionAcknowledgmentV1["componentState"] = null;
    try {
      componentState = (await this.opts.authority.fail(c.row.tenantId, c.row.dispatchId, `${code}: ${message}`, fallbackSeconds)).state;
    } catch (e) {
      if (e instanceof AuthorityError && e.code === "DISPATCH_NOT_CLAIMED") componentState = (await this.opts.authority.row(c.row.tenantId, c.row.dispatchId).catch(() => null))?.state ?? null;
    }
    return this.result(c, outcome, { reason: { code, message: message.slice(0, 2000) }, retryAfterSeconds: fallbackSeconds, componentState, ...extra });
  }

  /** The acknowledgment digest and record the row's marker scheme requires; a refusal code when it cannot verify. */
  private ackFor(c: Ctx, outcome: "applied" | "duplicate", markerDigest: string, extra: Partial<AdmissionAcknowledgmentV1>): { ackDigest: string; record?: Record<string, unknown> } | { refuse: string; message: string } {
    const row = c.row;
    if (!row.markerScheme) return { ackDigest: markerDigest };
    const planDigest = extra.planDigest ?? null;
    const graphTxRef = extra.graph?.bookmark ?? (extra.graph?.graphRevision !== null && extra.graph?.graphRevision !== undefined ? `graph-revision:${extra.graph.graphRevision}` : null);
    const record: Record<string, unknown> = {
      outcome: "applied",
      delivery: outcome,
      markerSchemaVersion: INTENT_MARKER_V2,
      markerDigest,
      payloadDigest: row.payloadDigest,
      planDigest,
      markerKey: extra.graph?.markerKey ?? null,
      receiptId: extra.receiptId ?? null,
      ...(graphTxRef ? { graphTxRef } : {}),
    };
    if (row.markerScheme === KS_INTENT_MARKER_SCHEME) {
      const recomputed = ksIntentMarkerDigest(row);
      if (recomputed === null || recomputed !== row.expectedMarkerDigest) return { refuse: "EXPECTED_MARKER_UNVERIFIED", message: "dispatch_outbox.expected_marker_digest does not recompute from the row's bound fields (ks-intent-marker.v1)" };
      const d = c.payload;
      if (d && (row.boundEffectDigest !== d.boundEffectDigest || row.useDecisionId !== d.useDecision.id)) return { refuse: "OUTBOX_BINDING_MISMATCH", message: "the outbox row binds another effect digest or decision than the dispatch payload" };
      return { ackDigest: recomputed, record };
    }
    if (row.markerScheme === BKS_INTENT_MARKER_SCHEME) {
      if (!planDigest) return { refuse: "PLAN_DIGEST_MISSING", message: "bks-intent-marker-digest.v1 acknowledges with the plan digest" };
      return { ackDigest: markerDigestOf(row.payloadDigest, planDigest), record };
    }
    return { refuse: "MARKER_SCHEME_UNKNOWN", message: `marker scheme ${row.markerScheme} is not supported by this consumer` };
  }

  /** Acknowledge under the row's marker scheme; DISPATCH_REVOKED means the revocation won the race. */
  private async acknowledge(c: Ctx, outcome: "applied" | "duplicate", markerDigest: string, extra: Partial<AdmissionAcknowledgmentV1>): Promise<AdmissionAcknowledgmentV1> {
    const ack = this.ackFor(c, outcome, markerDigest, extra);
    // `applied` / `duplicate` are reported only for a PostgreSQL acknowledgment that verified (R1 F14): the graph commit
    // and its marker are a confirmation; until the acknowledgment holds, the outcome is `deferred` (graph fields kept).
    if ("refuse" in ack) {
      // The effect is committed; nothing unverifiable is acknowledged. The row stays claimed and is redelivered.
      return this.result(c, "deferred", { markerDigest, acknowledged: false, reason: { code: ack.refuse, message: ack.message }, ...extra });
    }
    try {
      const row = await this.opts.authority.acknowledge(c.row.tenantId, c.row.dispatchId, ack.ackDigest, undefined, ack.record);
      const verified = row.state === "acknowledged" && row.ackDigest === ack.ackDigest && (row.markerScheme !== KS_INTENT_MARKER_SCHEME || row.ackDigest === row.expectedMarkerDigest);
      if (!verified) return this.result(c, "deferred", { markerDigest, acknowledged: false, componentState: row.state, reason: { code: "ACK_UNVERIFIED", message: "the component row does not carry the expected acknowledgment digest" }, ...extra });
      return this.result(c, outcome, { markerDigest, acknowledged: true, componentState: row.state, ...extra });
    } catch (e) {
      if (e instanceof AuthorityError && e.code === "DISPATCH_REVOKED") {
        return this.result(c, "revoked", { markerDigest, componentState: "revoked", reason: { code: "REVOKED_AFTER_APPLY", message: "the decision was revoked while in transit; the graph projection exists but official reads exclude it after revalidation" }, ...extra });
      }
      // Lost acknowledgment: the effect is committed; the next claim finds the marker and acknowledges again.
      return this.result(c, "deferred", { markerDigest, acknowledged: false, reason: { code: "ACK_PENDING", message: (e as Error).message.slice(0, 2000) }, ...extra });
    }
  }

  async process(row: OutboxRow): Promise<AdmissionAcknowledgmentV1> {
    const c: Ctx = { row, started: this.now() };
    const { authority } = this.opts;
    try {
      // 1. payload
      if (row.targetBinding !== ADMISSION_TARGET_BINDING) return await this.park(c, "refused", "TARGET_BINDING_MISMATCH", `dispatch targets ${row.targetBinding}, not ${ADMISSION_TARGET_BINDING}`, this.retry.terminalSeconds);
      const artifact = await authority.payload(row.tenantId, row.payloadDigest);
      if (!artifact) return await this.park(c, "deferred", "PAYLOAD_NOT_FOUND", `no artifact_custody row with digest ${row.payloadDigest}`, this.retry.heldSeconds);
      if (!artifact.bytes) return await this.park(c, "refused", "PAYLOAD_CUSTODY_UNSUPPORTED", `payload custody ${artifact.custodyKind} is not inline; the consumer reads inline payload bytes only`, this.retry.terminalSeconds);
      if (rawBytesDigest(artifact.bytes) !== row.payloadDigest) return await this.park(c, "refused", "PAYLOAD_DIGEST_MISMATCH", "payload bytes do not hash to dispatch_outbox.payload_digest", this.retry.terminalSeconds);
      if (artifact.mediaType !== ADMISSION_PAYLOAD_MEDIA_TYPE) return await this.park(c, "refused", "PAYLOAD_MEDIA_TYPE", `payload media type ${artifact.mediaType}`, this.retry.terminalSeconds);
      let raw: { intent?: unknown };
      try {
        raw = JSON.parse(artifact.bytes.toString("utf8")) as { intent?: unknown };
      } catch {
        return await this.park(c, "refused", "PAYLOAD_PARSE", "payload is not JSON", this.retry.terminalSeconds);
      }
      const parsed = AdmissionDispatchV1.safeParse(raw);
      if (!parsed.success) return await this.park(c, "refused", "PAYLOAD_CONTRACT", `payload does not match biotech-knowledge-admission.v1: ${parsed.error.issues.slice(0, 3).map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`, this.retry.terminalSeconds);
      const d = parsed.data;
      c.payload = d;
      if (d.tenantId !== row.tenantId || d.dispatchId !== row.dispatchId || d.effectKey !== row.effectKey) return await this.park(c, "refused", "PAYLOAD_ROW_MISMATCH", "payload tenant / dispatch id / effect key differ from the outbox row", this.retry.terminalSeconds);

      // 2. row state recheck (revocation between claim and processing)
      const current = await authority.row(row.tenantId, row.dispatchId);
      if (current?.state === "revoked") return this.result(c, "revoked", { componentState: "revoked", reason: { code: "DISPATCH_REVOKED", message: "revoke_pending_dispatches revoked this dispatch in transit; nothing was written to the graph" } });
      if (current?.state === "acknowledged") {
        const native = typeof current.ackRecord?.markerDigest === "string" ? (current.ackRecord.markerDigest as string) : current.ackDigest;
        return this.result(c, "duplicate", { componentState: "acknowledged", acknowledged: true, markerDigest: native });
      }

      // 3. bound effect over the exact native bytes
      const nativeDigest = rawBytesDigest(Buffer.from(canonicalize(raw.intent), "utf8"));
      if (nativeDigest !== d.semanticPayloadDigest) return await this.park(c, "refused", "NATIVE_PAYLOAD_MISMATCH", "sha256 of the canonical intent bytes differs from semanticPayloadDigest", this.retry.terminalSeconds);
      const effect = await authority.effect(row.tenantId, row.effectKey);
      if (!effect) return await this.park(c, "refused", "EFFECT_NOT_BOUND", `no knowledge_verification.effect ${row.effectKey}`, this.retry.terminalSeconds);
      if (effect.boundEffectDigest !== d.boundEffectDigest || effect.semanticPayloadDigest !== d.semanticPayloadDigest || effect.originatingOriginDigest !== d.originatingOriginDigest) return await this.park(c, "refused", "EFFECT_CONFLICT", "the bound effect row differs from the payload binding", this.retry.terminalSeconds);
      if (effect.originIdentity === null || boundEffectDigestOf(d.semanticPayloadDigest, effect.originIdentity) !== d.boundEffectDigest) return await this.park(c, "refused", "BOUND_EFFECT_UNVERIFIED", "the bound effect digest is not reproduced from the native bytes and the originating origin identity", this.retry.terminalSeconds);

      const scope = { installationId: d.installationId, applicationId: d.applicationId, tenantId: d.tenantId };
      const principal = this.principal(scope);
      const markerKey = markerKeyOf(scope, d.effectKey);
      const intentDigest = intentDigestOf(AdmissionDispatchV1.shape.intent.parse(raw.intent));

      // 4. existing marker: duplicate, reordered or lost acknowledgment
      const existing = await this.graph.marker(scope, d.effectKey);
      if (existing.found && existing.status === "applied") {
        const prior = existing.receipt;
        if (existing.intentDigest !== intentDigest) return await this.park(c, "refused", "EFFECT_CONFLICT", `effect ${d.effectKey} was applied with intent ${existing.intentDigest}`, this.retry.terminalSeconds, { graph: { bookmark: null, graphRevision: null, markerKey } });
        if (!prior?.admission) return await this.park(c, "refused", "MARKER_NOT_ADMITTED", `effect ${d.effectKey} was applied without a dispatch admission (witness path); no marker digest to acknowledge`, this.retry.terminalSeconds);
        return await this.acknowledge(c, "duplicate", prior.admission.markerDigest, { planDigest: prior.plan.planDigest, receiptId: prior.receiptId, appliedAt: prior.admission.appliedAt, graph: { bookmark: null, graphRevision: prior.nextGraphRevision, markerKey } });
      }

      // 5. exact-use recheck
      const lookup = await authority.decisions(row.tenantId, [d.useDecision.id]);
      const verdict = evaluateDecision(lookup.records.get(d.useDecision.id), { digest: d.useDecision.digest, boundEffectDigest: d.boundEffectDigest }, this.now());
      if (verdict.state === "revoked") return await this.settleRevoked(c, verdict.reason, `use decision ${d.useDecision.id} is not eligible at epoch ${lookup.authoritativeEpoch}; nothing was written to the graph`);
      if (verdict.state === "stale") {
        const terminal = verdict.reason === "DECISION_EXPIRED" || verdict.reason === "STALE_DECISION";
        return await this.park(c, terminal ? "refused" : "deferred", verdict.reason, `use decision ${d.useDecision.id} is ${verdict.reason} at epoch ${lookup.authoritativeEpoch}`, terminal ? this.retry.terminalSeconds : this.retry.heldSeconds);
      }

      // 6. plan + apply (one Neo4j transaction)
      const plan = await this.graph.plan(d.intent, principal, () => new Date(d.decidedAt));
      if (plan.outcome === "rejected" || plan.outcome === "held") return await this.park(c, "refused", "PLAN_NOT_APPLICABLE", `plan ${plan.planRef} is ${plan.outcome}: ${[...plan.errors.map((e) => e.message), ...plan.proposals.flatMap((p) => p.reasons)].slice(0, 3).join("; ")}`, this.retry.terminalSeconds, { planDigest: plan.planDigest });
      if (plan.outcome === "partial") return await this.park(c, "refused", "PLAN_PARTIAL", `plan ${plan.planRef} is partial; a dispatch applies its exact effect or nothing: ${plan.proposals.filter((p) => p.disposition === "held" || p.disposition === "rejected").map((p) => `${p.proposalId} ${p.disposition}: ${p.reasons.slice(0, 2).join("; ")}`).join(" | ")}`.slice(0, 2000), this.retry.terminalSeconds, { planDigest: plan.planDigest });
      await this.opts.hooks?.beforeApply?.(row);
      const admission: DispatchAuthorization = {
        dispatchId: d.dispatchId,
        payloadDigest: row.payloadDigest,
        boundEffectDigest: d.boundEffectDigest,
        useDecision: d.useDecision,
        revocationEpoch: lookup.authoritativeEpoch,
        verificationRunRef: d.run.runId,
        runManifestDigest: d.run.manifestDigest,
        runSealKind: d.run.sealKind.toUpperCase() as DispatchAuthorization["runSealKind"],
        originatingOrigin: d.originatingOriginDigest,
      };
      let bookmark: string | null = null;
      const receipt: IngestionReceiptV2 = await this.graph.apply(
        { planRef: plan.planRef, expectedPlanDigest: plan.planDigest, intentDigest: plan.binding.intentDigest, effectKey: d.effectKey },
        admission,
        { principal, now: this.now, onCommitted: (info) => (bookmark = info.bookmarks.at(-1) ?? null), ...(this.opts.hooks?.applyFaults ? { faults: this.opts.hooks.applyFaults } : {}) },
      );
      const graph = { bookmark, graphRevision: receipt.nextGraphRevision, markerKey };
      if (receipt.outcome === "applied" || receipt.outcome === "noop" || receipt.outcome === "duplicate") {
        const adm = receipt.admission;
        if (!adm) return await this.park(c, "refused", "MARKER_NOT_ADMITTED", `effect ${d.effectKey} carries no dispatch admission`, this.retry.terminalSeconds);
        return await this.acknowledge(c, receipt.outcome === "duplicate" ? "duplicate" : "applied", adm.markerDigest, { planDigest: receipt.plan.planDigest, receiptId: receipt.receiptId, appliedAt: adm.appliedAt, graph });
      }
      if (receipt.outcome === "unresolved") return await this.park(c, "deferred", "EFFECT_UNRESOLVED", receipt.failure?.message ?? "commit outcome unknown; the next claim reconciles through the marker", this.retry.transientSeconds, { planDigest: plan.planDigest, graph });
      const code = receipt.failure?.code ?? "APPLY_FAILED";
      const permanent = ["BKS_EFFECT_CONFLICT", "BKS_IDENTITY_CONFLICT", "BKS_SLOT_CONFLICT", "BKS_PLAN_REJECTED", "BKS_RELEASE_MISMATCH", "BKS_PARTIAL_REFUSED"].includes(code);
      return await this.park(c, permanent ? "refused" : "deferred", code, receipt.failure?.message ?? "apply failed; nothing was committed", permanent ? this.retry.terminalSeconds : this.retry.transientSeconds, { planDigest: plan.planDigest });
    } catch (e) {
      if (e instanceof AuthorityUnavailableError) return this.result(c, "deferred", { reason: { code: "AUTHORITY_UNAVAILABLE", message: e.message.slice(0, 2000) }, retryAfterSeconds: 60 });
      const code = e instanceof BksServiceError ? e.code : graphUnavailable(e) ? "GRAPH_UNAVAILABLE" : "CONSUMER_ERROR";
      const permanent = e instanceof BksServiceError && ["BKS_EFFECT_CONFLICT", "BKS_PARSE_REJECTED", "BKS_PLAN_REJECTED", "BKS_FORBIDDEN_SCOPE", "BKS_RELEASE_MISMATCH"].includes(e.code);
      return await this.park(c, permanent ? "refused" : "deferred", code, (e as Error).message, permanent ? this.retry.terminalSeconds : this.retry.transientSeconds);
    }
  }
}

function graphUnavailable(e: unknown): boolean {
  const s = `${(e as { code?: string }).code ?? ""} ${(e as Error)?.message ?? ""}`;
  return /ServiceUnavailable|SessionExpired|ECONNREFUSED|ETIMEDOUT|Could not perform discovery|connect/i.test(s);
}
