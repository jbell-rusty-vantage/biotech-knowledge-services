import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  ADMISSION_PAYLOAD_MEDIA_TYPE,
  AdmissionAcknowledgmentV1,
  AdmissionConsumeReportV1,
  boundEffectDigestOf,
  canonicalDigest,
  canonicalize,
  markerDigestOf,
  rawBytesDigest,
  type AdmissionDispatchV1Input,
  type IngestionPlanV2,
  type IngestionReceiptV2,
  type ReadPartV3,
} from "@bks/contracts";
import { DispatchConsumer, type DispatchGraph } from "./dispatch.js";
import { AuthorityError, evaluateDecision, ksIntentMarkerDigest, MemoryVerificationAuthority, type DecisionRecord } from "./verification.js";
import { applyEligibility } from "../read/eligibility.js";
import type { ReceiptLookup } from "../apply.js";

/**
 * T0 conformance of the SV-11 dispatch consumer and official-read eligibility against an in-memory component
 * (MemoryVerificationAuthority mirrors claim/acknowledge/fail/revoke of knowledge_verification 0003) and a fake graph
 * port. Stub conformance is NOT a graph qualification claim: the disposable Neo4j + PostgreSQL proof is
 * dispatch.integration.test.ts.
 */

const TENANT = "6f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b";
const RUN = "0b8c6f2e-3d4a-4b5c-9d6e-7f8a9b0c1d2e";
const dig = (s: string) => `sha256:${createHash("sha256").update(s).digest("hex")}`;
const ORIGIN_IDENTITY = { kind: "standalone", installationId: "inst-bt", applicationId: "biotech", tenantId: TENANT, issuer: "ks-test", subject: "ks-binding", mission: null, recoveryAuthorityRef: null };

function intentFor(kind: "evidence_report" | "study_appraisal", n: string): Record<string, unknown> {
  return {
    schemaVersion: "biotech-knowledge-intent.v2",
    intentId: `sv11-${kind.replace("_", "-")}-${n}`,
    pins: { schemaReleaseDigest: dig("release"), policyVersion: "bks-admission-policy/v1" },
    context: { actor: { kind: "agent", id: "ks-biotech-graph" }, run: { system: "ks-verification", runId: `${RUN}/${n}` }, activityKind: "EVIDENCE_MISSION" },
    basis: { creationOnly: { reason: "SV-11 synthetic dispatch fixture" } },
    proposals: [{ proposalId: "report", kind: "report.publish", reportKind: kind === "evidence_report" ? "EVIDENCE_REPORT" : "STUDY_APPRAISAL", name: `Synthetic ${kind} ${n}`, policyVersion: "bks-admission-policy/v1", bodyDigest: dig(`body-${n}`), about: [] }],
  };
}

interface Fixture {
  authority: MemoryVerificationAuthority;
  add(n: string, opts?: { effectKey?: string; kind?: "evidence_report" | "study_appraisal"; availableAt?: string; decision?: Partial<DecisionRecord>; tamper?: "payload" | "effect" }): { dispatchId: string; payloadDigest: string; effectKey: string };
}

function fixture(): Fixture {
  const authority = new MemoryVerificationAuthority();
  return {
    authority,
    add(n, opts = {}) {
      const kind = opts.kind ?? "evidence_report";
      const effectKey = opts.effectKey ?? `ks:effect/${n}`;
      const intent = intentFor(kind, opts.effectKey ? opts.effectKey.replace(/[^a-z0-9]/g, "") : n);
      const semanticPayloadDigest = rawBytesDigest(Buffer.from(canonicalize(intent), "utf8"));
      const originDigest = canonicalDigest(ORIGIN_IDENTITY);
      const boundEffectDigest = boundEffectDigestOf(semanticPayloadDigest, ORIGIN_IDENTITY);
      const decisionId = `ud-${effectKey.replace(/[^a-z0-9]/g, "")}`;
      const decisionDigest = dig(`decision-${decisionId}`);
      const dispatchId = `dsp-${n}`;
      const payload: AdmissionDispatchV1Input = {
        schemaVersion: "biotech-knowledge-admission.v1",
        tenantId: TENANT,
        installationId: "inst-bt",
        applicationId: "biotech",
        targetBinding: "biotech-graph",
        dispatchId,
        effectKey,
        boundEffectDigest,
        semanticPayloadDigest,
        originatingOriginDigest: originDigest,
        useDecision: { id: decisionId, digest: decisionDigest },
        report: { reportRevisionId: `rr-${n}`, reportId: `report-${n}`, revision: 1, reportKind: kind, reportKindRef: `${kind}@1.0.0`, reportSchema: "research-report.v2", digest: dig(`rr-${n}`) },
        run: { runId: RUN, manifestDigest: dig("manifest"), sealKind: "decision_snapshot" },
        revocationEpochAtDecision: 0,
        decidedAt: "2026-10-25T10:00:00.000Z",
        intent: intent as never,
        custody: [],
        expectedMarkerSchemaVersion: "bks-intent-marker.v2",
      };
      const bytes = Buffer.from(canonicalize(payload), "utf8");
      const payloadDigest = rawBytesDigest(bytes);
      authority.add({
        row: { tenantId: TENANT, dispatchId, effectKey, targetBinding: "biotech-graph", payloadDigest, state: "pending", attempts: 0, availableAt: opts.availableAt ?? "2026-10-25T09:00:00.000Z", ackDigest: null, lastError: null, createdAt: opts.availableAt ?? "2026-10-25T09:00:00.000Z" },
        payload: { artifactId: `payload-${n}`, digest: payloadDigest, mediaType: ADMISSION_PAYLOAD_MEDIA_TYPE, custodyKind: "inline", bytes: opts.tamper === "payload" ? Buffer.from(`${bytes.toString("utf8")} `) : bytes, custodyUri: null },
        effect: { effectKey, semanticPayloadDigest, boundEffectDigest: opts.tamper === "effect" ? dig("other") : boundEffectDigest, originatingOriginDigest: originDigest, originIdentity: ORIGIN_IDENTITY },
      });
      if (!authority.decisionsById.has(decisionId)) {
        authority.decisionsById.set(decisionId, { useDecisionId: decisionId, digest: decisionDigest, disposition: "admitted", boundEffectDigest, revocationEpoch: 0, expiresAt: null, useName: "official.publication", audience: "biotech-public", subjectKind: "report", subjectId: `rr-${n}`, runId: RUN, superseded: false, invalidated: false, closureIncomplete: false, ...opts.decision });
      }
      return { dispatchId, payloadDigest, effectKey };
    },
  };
}

class FakeGraph implements DispatchGraph {
  readonly markers = new Map<string, IngestionReceiptV2>();
  readonly applied: string[] = [];
  unavailable = false;
  failBeforeMarker = false;
  revision = 0;

  async marker(_scope: unknown, effectKey: string): Promise<ReceiptLookup> {
    if (this.unavailable) throw Object.assign(new Error("Could not perform discovery: ServiceUnavailable"), { code: "ServiceUnavailable" });
    const r = this.markers.get(effectKey);
    return r ? { found: true, status: "applied", receipt: r, intentDigest: r.intent.intentDigest, planDigest: r.plan.planDigest } : { found: false };
  }

  async plan(intent: unknown): Promise<IngestionPlanV2> {
    const i = intent as { intentId: string };
    const planDigest = canonicalDigest({ intent, rev: this.revision });
    const { intentDigestOf } = await import("../plan.js");
    const { IngestionIntentV2 } = await import("@bks/contracts");
    return { planRef: `pl-${planDigest.slice(7, 20)}`, planDigest, outcome: "applicable", binding: { intentDigest: intentDigestOf(IngestionIntentV2.parse(intent)), intentId: i.intentId }, errors: [], proposals: [] } as unknown as IngestionPlanV2;
  }

  async apply(req: { planRef: string; expectedPlanDigest: string; intentDigest: string; effectKey: string }, admission: { dispatchId: string; payloadDigest: string; boundEffectDigest: string; useDecision: { id: string; digest: string }; revocationEpoch: number }): Promise<IngestionReceiptV2> {
    if (this.unavailable) throw Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:1"), { code: "ServiceUnavailable" });
    const prior = this.markers.get(req.effectKey);
    if (prior) return { ...prior, outcome: "duplicate", duplicateOf: prior.receiptId };
    if (this.failBeforeMarker) return { outcome: "failed", failure: { code: "BKS_STALE_PRECONDITION", message: "simulated failure before the marker; rolled back" }, plan: { planRef: req.planRef, planDigest: req.expectedPlanDigest, partialPolicy: "all" }, nextGraphRevision: null } as unknown as IngestionReceiptV2;
    this.revision++;
    const receipt = {
      outcome: "applied",
      receiptId: `rc-${req.effectKey}`,
      intent: { intentId: "x", intentDigest: req.intentDigest },
      plan: { planRef: req.planRef, planDigest: req.expectedPlanDigest, partialPolicy: "all" },
      nextGraphRevision: this.revision,
      failure: null,
      admission: { markerSchemaVersion: "bks-intent-marker.v2", dispatchId: admission.dispatchId, markerDigest: markerDigestOf(admission.payloadDigest, req.expectedPlanDigest), payloadDigest: admission.payloadDigest, boundEffectDigest: admission.boundEffectDigest, useDecision: admission.useDecision, revocationEpoch: admission.revocationEpoch, appliedAt: "2026-10-25T10:00:01.000Z" },
    } as unknown as IngestionReceiptV2;
    this.markers.set(req.effectKey, receipt);
    this.applied.push(admission.dispatchId);
    return receipt;
  }
}

const NOW = new Date("2026-10-25T10:00:00.000Z");
const consumer = (f: Fixture, g: FakeGraph, hooks?: ConstructorParameters<typeof DispatchConsumer>[0]["hooks"]) => new DispatchConsumer({ authority: f.authority, graph: g, now: () => NOW, ...(hooks ? { hooks } : {}) });

/** Gives a fixture row the component 2.2.0 dispatch binding (what enqueue_dispatch records). */
function bind22(f: Fixture, x: { dispatchId: string; effectKey: string }, scheme: "ks-intent-marker.v1" | "bks-intent-marker-digest.v1", epoch = 0): void {
  const row = f.authority.rows.get(x.dispatchId)!;
  row.markerScheme = scheme;
  row.boundEffectDigest = f.authority.effects.get(x.effectKey)!.boundEffectDigest;
  row.useDecisionId = `ud-${x.effectKey.replace(/[^a-z0-9]/g, "")}`;
  row.revocationEpoch = epoch;
  row.expectedMarkerDigest = scheme === "ks-intent-marker.v1" ? ksIntentMarkerDigest(row) : null;
}

describe("R1 F1/F13: component verdicts and terminal settlement (T0)", () => {
  it("reviewer grant revoked after admission: the pre-apply recheck sees REVIEW_REQUIRED and settles the dispatch revoked", async () => {
    const f = fixture();
    const g = new FakeGraph();
    const x = f.add("rev", { decision: { component: { state: "held", reason: "REVIEW_REQUIRED" } } });
    const out = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    expect(out.results[0]).toMatchObject({ outcome: "revoked", reason: { code: "REVIEW_REQUIRED" }, componentState: "revoked" });
    expect(f.authority.calls).toContain("settle");
    expect(f.authority.calls).not.toContain("fail");
    expect(g.applied).toEqual([]);
    expect(f.authority.rows.get(x.dispatchId)!.state).toBe("revoked");
  });

  it("a permanent refusal is settled `refused` (terminal), not parked for retry", async () => {
    const f = fixture();
    const g = new FakeGraph();
    const x = f.add("tamper", { tamper: "payload" });
    const out = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    expect(out.results[0]).toMatchObject({ outcome: "refused", reason: { code: "PAYLOAD_DIGEST_MISMATCH" }, componentState: "refused", retryAfterSeconds: null });
    expect(f.authority.calls).toContain("settle");
    expect(f.authority.calls).not.toContain("fail");
    expect(f.authority.rows.get(x.dispatchId)!.state).toBe("refused");
  });
});

describe("SV-12 acknowledgment under the component 2.2.0 marker schemes (T0)", () => {
  it("ks-intent-marker.v1: acknowledges with the expected digest; the native marker digest stays on the marker and in the ack record", async () => {
    const f = fixture();
    const g = new FakeGraph();
    const x = f.add("ks1");
    bind22(f, x, "ks-intent-marker.v1", 3);
    const out = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    const r = out.results[0]!;
    const row = f.authority.rows.get(x.dispatchId)!;
    expect(r).toMatchObject({ outcome: "applied", acknowledged: true, componentState: "acknowledged" });
    expect(row.ackDigest).toBe(row.expectedMarkerDigest);
    expect(row.ackDigest).not.toBe(r.markerDigest);
    expect(r.markerDigest).toBe(markerDigestOf(x.payloadDigest, r.planDigest!));
    expect(g.markers.get(x.effectKey)!.admission!.markerDigest).toBe(r.markerDigest);
    expect(row.ackRecord).toMatchObject({ outcome: "applied", markerDigest: r.markerDigest, payloadDigest: x.payloadDigest, planDigest: r.planDigest, markerSchemaVersion: "bks-intent-marker.v2" });
  });

  it("ks-intent-marker.v1 redelivery: a second dispatch of the applied effect acknowledges its own expected digest", async () => {
    const f = fixture();
    const g = new FakeGraph();
    const a = f.add("r1", { effectKey: "ks:effect/redeliver" });
    bind22(f, a, "ks-intent-marker.v1");
    await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    const b = f.add("r2", { effectKey: "ks:effect/redeliver", availableAt: "2026-10-25T09:30:00.000Z" });
    bind22(f, b, "ks-intent-marker.v1");
    const out = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    expect(out.results[0]).toMatchObject({ dispatchId: b.dispatchId, outcome: "duplicate", acknowledged: true });
    expect(f.authority.rows.get(b.dispatchId)!.ackDigest).toBe(f.authority.rows.get(b.dispatchId)!.expectedMarkerDigest);
    expect(f.authority.rows.get(b.dispatchId)!.ackDigest).not.toBe(f.authority.rows.get(a.dispatchId)!.ackDigest);
    expect(g.applied).toEqual([a.dispatchId]);
  });

  it("an expected digest that does not recompute from the row is never acknowledged (row stays claimed)", async () => {
    const f = fixture();
    const g = new FakeGraph();
    const x = f.add("bad");
    bind22(f, x, "ks-intent-marker.v1");
    f.authority.rows.get(x.dispatchId)!.expectedMarkerDigest = dig("forged");
    const out = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    expect(out.results[0]).toMatchObject({ outcome: "deferred", acknowledged: false, reason: { code: "EXPECTED_MARKER_UNVERIFIED" } });
    expect(out.results[0]!.markerDigest).toMatch(/^sha256:/); // the graph commit is reported, as a confirmation only
    expect(f.authority.rows.get(x.dispatchId)!.state).toBe("dispatched");
    expect(f.authority.calls).not.toContain("acknowledge");
  });

  it("bks-intent-marker-digest.v1: acknowledges with markerDigestOf(this row's payload digest, plan digest) and the record", async () => {
    const f = fixture();
    const g = new FakeGraph();
    const x = f.add("bks1");
    bind22(f, x, "bks-intent-marker-digest.v1");
    const out = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    const r = out.results[0]!;
    expect(r).toMatchObject({ outcome: "applied", acknowledged: true });
    expect(f.authority.rows.get(x.dispatchId)).toMatchObject({ ackDigest: markerDigestOf(x.payloadDigest, r.planDigest!), ackRecord: { payloadDigest: x.payloadDigest, planDigest: r.planDigest } });
  });
});

describe("SV-11 DispatchConsumer (T0: in-memory component + fake graph)", () => {
  it("applies both report kinds and acknowledges each with its marker digest", async () => {
    const f = fixture();
    const g = new FakeGraph();
    const a = f.add("ev1", { kind: "evidence_report" });
    const b = f.add("sa1", { kind: "study_appraisal", availableAt: "2026-10-25T09:00:01.000Z" });
    const report = AdmissionConsumeReportV1.parse(await consumer(f, g).consumeOnce(TENANT, 10, NOW));
    expect(report.claimed).toBe(2);
    expect(report.results.map((r) => [r.dispatchId, r.outcome, r.acknowledged])).toEqual([[a.dispatchId, "applied", true], [b.dispatchId, "applied", true]]);
    for (const r of report.results) {
      AdmissionAcknowledgmentV1.parse(r);
      expect(r.markerDigest).toBe(markerDigestOf(r.payloadDigest!, r.planDigest!));
      expect(f.authority.rows.get(r.dispatchId)).toMatchObject({ state: "acknowledged", ackDigest: r.markerDigest });
    }
  });

  it("duplicate delivery of an applied effect acknowledges again with the stored marker digest and never re-applies", async () => {
    const f = fixture();
    const g = new FakeGraph();
    f.add("d1", { effectKey: "ks:effect/dup" });
    const first = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    f.add("d2", { effectKey: "ks:effect/dup", availableAt: "2026-10-25T09:30:00.000Z" });
    const second = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    expect(g.applied).toEqual(["dsp-d1"]);
    expect(second.results[0]).toMatchObject({ dispatchId: "dsp-d2", outcome: "duplicate", acknowledged: true, markerDigest: first.results[0]!.markerDigest });
  });

  it("reordered delivery: the later dispatch applies first, the earlier one is a duplicate of it", async () => {
    const f = fixture();
    const g = new FakeGraph();
    f.add("late", { effectKey: "ks:effect/reorder", availableAt: "2026-10-25T08:00:00.000Z" });
    f.add("early", { effectKey: "ks:effect/reorder", availableAt: "2026-10-25T09:00:00.000Z" });
    const out = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    expect(out.results.map((r) => [r.dispatchId, r.outcome])).toEqual([["dsp-late", "applied"], ["dsp-early", "duplicate"]]);
    expect(out.results[1]!.markerDigest).toBe(out.results[0]!.markerDigest);
    expect(g.applied).toEqual(["dsp-late"]);
  });

  it("revoked in transit (revoke_pending_dispatches after claim): outcome revoked, no graph write, no acknowledgment", async () => {
    const f = fixture();
    const g = new FakeGraph();
    const d = f.add("rv", { effectKey: "ks:effect/revoked" });
    const out = await consumer(f, g, { afterClaim: () => void f.authority.revokePending(d.effectKey) }).consumeOnce(TENANT, 10, NOW);
    expect(out.results[0]).toMatchObject({ outcome: "revoked", acknowledged: false, componentState: "revoked" });
    expect(g.applied).toEqual([]);
    expect(f.authority.calls).not.toContain("acknowledge");
  });

  it("decision invalidated after claim (epoch advanced): outcome revoked, nothing written, row settled revoked (2.2.0)", async () => {
    const f = fixture();
    const g = new FakeGraph();
    f.add("inv");
    const out = await consumer(f, g, {
      afterClaim: () => {
        f.authority.epoch = 1;
        for (const rec of f.authority.decisionsById.values()) rec.invalidated = true;
      },
    }).consumeOnce(TENANT, 10, NOW);
    expect(out.results[0]).toMatchObject({ outcome: "revoked", reason: { code: "DECISION_INVALIDATED" }, componentState: "revoked", retryAfterSeconds: null });
    expect(f.authority.calls).toContain("settle");
    expect(f.authority.calls).not.toContain("fail");
    expect(g.applied).toEqual([]);
  });

  it("decision invalidated against a 2.1.0 component (no settle_dispatch): falls back to the fail_dispatch park", async () => {
    const f = fixture();
    const g = new FakeGraph();
    f.add("inv21");
    f.authority.settle = async () => {
      throw new AuthorityError("42883", "function knowledge_verification.settle_dispatch(uuid, text, text, jsonb) does not exist", "42883");
    };
    const out = await consumer(f, g, {
      afterClaim: () => {
        f.authority.epoch = 1;
        for (const rec of f.authority.decisionsById.values()) rec.invalidated = true;
      },
    }).consumeOnce(TENANT, 10, NOW);
    expect(out.results[0]).toMatchObject({ outcome: "revoked", reason: { code: "DECISION_INVALIDATED" }, componentState: "pending" });
    expect(g.applied).toEqual([]);
  });

  it("revocation racing the graph commit: acknowledgment refused (DISPATCH_REVOKED), marker stays, outcome revoked", async () => {
    const f = fixture();
    const g = new FakeGraph();
    const d = f.add("race");
    const apply = g.apply.bind(g);
    g.apply = async (...args: Parameters<FakeGraph["apply"]>) => {
      const r = await apply(...args);
      f.authority.revokePending(d.effectKey); // the writer revokes after the graph commit, before the acknowledgment
      return r;
    };
    const out = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    expect(out.results[0]).toMatchObject({ outcome: "revoked", acknowledged: false, componentState: "revoked", reason: { code: "REVOKED_AFTER_APPLY" } });
    expect(g.markers.has(d.effectKey)).toBe(true);
    expect(f.authority.rows.get(d.dispatchId)!.state).toBe("revoked");
  });

  it("lost acknowledgment: the effect is committed, the next claim finds the marker and acknowledges", async () => {
    const f = fixture();
    const g = new FakeGraph();
    f.add("lost");
    f.authority.failNextAcknowledge = true;
    const first = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    expect(first.results[0]).toMatchObject({ outcome: "deferred", acknowledged: false, reason: { code: "ACK_PENDING" } });
    expect(f.authority.rows.get("dsp-lost")!.state).toBe("dispatched");
    const later = new Date(NOW.getTime() + 61_000);
    const second = await consumer(f, g).consumeOnce(TENANT, 10, later);
    expect(second.results[0]).toMatchObject({ outcome: "duplicate", acknowledged: true, markerDigest: first.results[0]!.markerDigest });
    expect(g.applied).toEqual(["dsp-lost"]);
  });

  it("graph unavailable: fail_dispatch with retry, no marker; a later claim applies", async () => {
    const f = fixture();
    const g = new FakeGraph();
    f.add("down");
    g.unavailable = true;
    const out = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    expect(out.results[0]).toMatchObject({ outcome: "deferred", reason: { code: "GRAPH_UNAVAILABLE" }, componentState: "pending" });
    expect(g.markers.size).toBe(0);
    g.unavailable = false;
    f.authority.rows.get("dsp-down")!.availableAt = NOW.toISOString();
    const retry = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    expect(retry.results[0]).toMatchObject({ outcome: "applied", acknowledged: true });
  });

  it("transaction failure before the marker: deferred, nothing persisted, fail_dispatch called", async () => {
    const f = fixture();
    const g = new FakeGraph();
    f.add("rb");
    g.failBeforeMarker = true;
    const out = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    expect(out.results[0]).toMatchObject({ outcome: "deferred", reason: { code: "BKS_STALE_PRECONDITION" }, componentState: "pending" });
    expect(g.markers.size).toBe(0);
    expect(f.authority.calls).toContain("fail");
  });

  it("authority unavailable at claim: BKS_AUTHORITY_UNAVAILABLE, nothing applied", async () => {
    const f = fixture();
    const g = new FakeGraph();
    f.add("pgdown");
    f.authority.unavailable = true;
    await expect(consumer(f, g).consumeOnce(TENANT, 10, NOW)).rejects.toMatchObject({ code: "BKS_AUTHORITY_UNAVAILABLE" });
    expect(g.applied).toEqual([]);
  });

  it("refuses a payload whose bytes do not hash to payload_digest, and an unbound effect digest", async () => {
    const f = fixture();
    const g = new FakeGraph();
    f.add("tp", { tamper: "payload" });
    f.add("te", { tamper: "effect", availableAt: "2026-10-25T09:00:02.000Z" });
    const out = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    expect(out.results.map((r) => [r.outcome, r.reason?.code])).toEqual([["refused", "PAYLOAD_DIGEST_MISMATCH"], ["refused", "EFFECT_CONFLICT"]]);
    expect(g.applied).toEqual([]);
  });

  it("held decision defers, expired decision refuses; neither writes", async () => {
    const f = fixture();
    const g = new FakeGraph();
    f.add("held", { decision: { disposition: "held" } });
    f.add("exp", { decision: { expiresAt: "2026-10-25T09:59:59.000Z" }, availableAt: "2026-10-25T09:00:05.000Z" });
    const out = await consumer(f, g).consumeOnce(TENANT, 10, NOW);
    expect(out.results.map((r) => [r.outcome, r.reason?.code])).toEqual([["deferred", "DECISION_HELD"], ["refused", "DECISION_EXPIRED"]]);
    expect(g.applied).toEqual([]);
  });
});

describe("SV-11 exact-use predicate and official-read eligibility (T0)", () => {
  const rec = (over: Partial<DecisionRecord> = {}): DecisionRecord => ({ useDecisionId: "ud-1", digest: dig("d1"), disposition: "admitted", boundEffectDigest: dig("e1"), revocationEpoch: 2, expiresAt: null, useName: "official", audience: "a", subjectKind: "report", subjectId: "r", runId: RUN, superseded: false, invalidated: false, closureIncomplete: false, ...over });

  it("evaluates the admit_exact_use predicate", () => {
    expect(evaluateDecision(rec(), { digest: dig("d1") }, NOW).state).toBe("eligible");
    expect(evaluateDecision(undefined, {}, NOW)).toEqual({ state: "revoked", reason: "DECISION_NOT_FOUND" });
    expect(evaluateDecision(rec(), { digest: dig("other") }, NOW)).toEqual({ state: "revoked", reason: "DECISION_DIGEST_MISMATCH" });
    expect(evaluateDecision(rec({ invalidated: true }), {}, NOW).reason).toBe("DECISION_INVALIDATED");
    expect(evaluateDecision(rec({ superseded: true }), {}, NOW)).toEqual({ state: "stale", reason: "STALE_DECISION" });
    expect(evaluateDecision(rec({ closureIncomplete: true }), {}, NOW)).toEqual({ state: "stale", reason: "INVALIDATION_CLOSURE_INCOMPLETE" });
    expect(evaluateDecision(rec({ expiresAt: "2026-01-01T00:00:00Z" }), {}, NOW)).toEqual({ state: "stale", reason: "DECISION_EXPIRED" });
  });

  const reportPart = (rows: Array<{ uid: string; ref?: string; digest?: string }>): ReadPartV3 => ({
    opId: "r",
    op: "report",
    status: "ok",
    reasons: [],
    columns: ["report", "generatedBy"],
    rows: rows.map((r) => ({ report: { uid: r.uid }, generatedBy: [], admission: r.ref ? [{ effectKey: "ks:e", useDecisionRef: r.ref, useDecisionDigest: r.digest ?? null }] : [] })),
    rowCount: rows.length,
    truncations: [],
  });

  it("authority unavailable: every part of the official read is held, every operation (R1 F8), nothing served", () => {
    const card = { ...reportPart([]), op: "card", opId: "c", rows: [{ node: { uid: "hu:claim:z" } }], rowCount: 1 };
    const list = { ...reportPart([]), op: "list", opId: "l", rows: [{ node: { uid: "hu:assessment:q", useDecisionRef: "ud-1", useDecisionDigest: dig("d1") } }, { node: { uid: "hu:study:s" } }], rowCount: 2 };
    const out = applyEligibility([reportPart([{ uid: "hu:report:a", ref: "ud-1", digest: dig("d1") }]), card, list], { lookup: null, detail: "connection refused", tenantId: TENANT }, NOW);
    expect(out.eligibility).toMatchObject({ state: "authority_unavailable", held: 4, authoritativeEpoch: null });
    for (const p of out.parts) {
      expect(p).toMatchObject({ status: "skipped", rows: [], rowCount: 0 });
      expect(p.reasons.at(-1)!.code).toBe("READ_AUTHORITY_UNAVAILABLE");
    }
    expect(out.eligibility.items.map((i) => [i.opId, i.recordUid, i.state])).toEqual([["r", "hu:report:a", "authority_unavailable"], ["l", "hu:assessment:q", "authority_unavailable"]]);
  });

  it("non-scoped official operations (card, list, neighbors, ...) revalidate every row carrying a decision reference (R1 F8)", () => {
    const lookup = { authoritativeEpoch: 3, records: new Map([["ud-1", rec()], ["ud-2", rec({ useDecisionId: "ud-2", digest: dig("d2"), invalidated: true })]]) };
    const card = { ...reportPart([]), op: "card", opId: "c", rows: [{ node: { uid: "hu:report:x" }, neighbors: [{ uid: "hu:activity:x", useDecisionRef: "ud-2", useDecisionDigest: dig("d2") }] }], rowCount: 1 };
    const neighbors = { ...reportPart([]), op: "neighbors", opId: "n", rows: [{ target: { uid: "hu:assessment:ok", useDecisionRef: "ud-1", useDecisionDigest: dig("d1") } }, { target: { uid: "hu:study:plain" } }], rowCount: 2 };
    const out = applyEligibility([card, neighbors], { lookup, detail: null, tenantId: TENANT }, NOW);
    expect(out.parts[0]).toMatchObject({ status: "forbidden", rowCount: 0 });
    expect(out.parts[1]!.rows).toHaveLength(2); // the eligible admitted row and the plain graph-context row
    expect(out.parts[1]!.annotations).toMatchObject({ officialUse: expect.stringContaining("graph context") });
    expect(out.eligibility.items.map((i) => [i.opId, i.recordUid, i.state, i.served])).toEqual([["c", "hu:report:x", "revoked", false], ["n", "hu:assessment:ok", "eligible", true]]);
    expect(out.eligibility).toMatchObject({ state: "revoked", excluded: 1 });
  });

  it("the component verdict is the one authority: review withdrawn (grant revoked) is revoked, holds are stale (R1 F1)", () => {
    expect(evaluateDecision(rec({ component: { state: "admitted", reason: "OK" } }), { digest: dig("d1") }, NOW)).toEqual({ state: "eligible", reason: "OK" });
    expect(evaluateDecision(rec({ component: { state: "held", reason: "REVIEW_REQUIRED" } }), {}, NOW)).toEqual({ state: "revoked", reason: "REVIEW_REQUIRED" });
    expect(evaluateDecision(rec({ component: { state: "rejected", reason: "DECISION_INVALIDATED" } }), {}, NOW)).toEqual({ state: "revoked", reason: "DECISION_INVALIDATED" });
    expect(evaluateDecision(rec({ component: { state: "held", reason: "INVALIDATION_CLOSURE_INCOMPLETE" } }), {}, NOW)).toEqual({ state: "stale", reason: "INVALIDATION_CLOSURE_INCOMPLETE" });
    // The component verdict overrides the local mirror (it was taken on the full rule), and the reference still binds.
    expect(evaluateDecision(rec({ superseded: true, component: { state: "admitted", reason: "OK" } }), {}, NOW).state).toBe("eligible");
    expect(evaluateDecision(rec({ component: { state: "admitted", reason: "OK" } }), { digest: dig("other") }, NOW).reason).toBe("DECISION_DIGEST_MISMATCH");
  });

  it("excludes a revoked item and an unadmitted item, serves the eligible one", () => {
    const lookup = { authoritativeEpoch: 3, records: new Map([["ud-1", rec()], ["ud-2", rec({ useDecisionId: "ud-2", digest: dig("d2"), invalidated: true })]]) };
    const out = applyEligibility([reportPart([{ uid: "hu:report:ok", ref: "ud-1", digest: dig("d1") }, { uid: "hu:report:rev", ref: "ud-2", digest: dig("d2") }, { uid: "hu:report:legacy" }])], { lookup, detail: null, tenantId: TENANT }, NOW);
    expect(out.parts[0]!.rows.map((r) => (r.report as { uid: string }).uid)).toEqual(["hu:report:ok"]);
    expect(out.eligibility.items.map((i) => [i.recordUid, i.state, i.served])).toEqual([["hu:report:ok", "eligible", true], ["hu:report:rev", "revoked", false], ["hu:report:legacy", "unadmitted", false]]);
    expect(out.eligibility).toMatchObject({ state: "revoked", excluded: 2, authoritativeEpoch: 3, decisionEpoch: 2 });
    expect(out.parts[0]!.reasons.map((r) => r.code)).toEqual(["USE_INELIGIBLE"]);
  });
});
