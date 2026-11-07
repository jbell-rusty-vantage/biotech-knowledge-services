import { describe, expect, it } from "vitest";
import { AdmissionDispatchV1, boundEffectDigestOf, markerDigestOf } from "./admission.js";
import { canonicalDigest, canonicalize, rawBytesDigest } from "./canonical.js";

/**
 * Cross-repository vector (SV-11): computed on 2026-10-25 with Knowledge Services
 * packages/knowledge-operation-protocol `boundEffectDigest(nativePayload, origin)` / `originDigest(origin)` over the
 * same inputs (receipt .scratch/sprint-v/proofs/SV-11/run-1/kop-bound-effect-vector.json). BKS must reproduce it.
 */
const identity = { kind: "standalone", installationId: "3c1f0e9a-7b2d-4e6f-8a1c-5d9e0f2b4a6c", applicationId: "biotech", tenantId: "8a3e5c1d-2f4b-4c6d-9e8f-0a1b2c3d4e5f", issuer: "sv11-fixture", subject: "ks-biotech-graph", mission: null, recoveryAuthorityRef: null };
const intent = { schemaVersion: "biotech-knowledge-intent.v2", intentId: "vector", proposals: [{ proposalId: "p", kind: "report.publish", score: 0.5 }] };

describe("biotech-knowledge-admission.v1", () => {
  it("reproduces the Knowledge Services K01 bound effect and origin digests", () => {
    const semantic = rawBytesDigest(Buffer.from(canonicalize(intent), "utf8"));
    expect(semantic).toBe("sha256:82ec3b9bcb5845504ec29a76544a6ae9519bb33bb419dd01348b51569cc2683c");
    expect(canonicalDigest(identity)).toBe("sha256:6d1b276c4e11c973988732f49e49c23d60795460e959b179a88f1769421ed541");
    expect(boundEffectDigestOf(semantic, identity)).toBe("sha256:a83d384ff467d0be57381cede45fdea61aee0312c7a065b4e6664714a945ec52");
  });

  it("marker digest binds the payload digest and the plan digest", () => {
    const a = markerDigestOf(`sha256:${"1".repeat(64)}`, `sha256:${"2".repeat(64)}`);
    expect(a).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(markerDigestOf(`sha256:${"1".repeat(64)}`, `sha256:${"3".repeat(64)}`)).not.toBe(a);
  });

  it("refuses free Cypher and unknown fields in a dispatch payload", () => {
    const base = { schemaVersion: "biotech-knowledge-admission.v1", tenantId: "8a3e5c1d-2f4b-4c6d-9e8f-0a1b2c3d4e5f", installationId: "i", applicationId: "biotech", targetBinding: "biotech-graph", dispatchId: "d", effectKey: "e", boundEffectDigest: `sha256:${"a".repeat(64)}`, semanticPayloadDigest: `sha256:${"b".repeat(64)}`, originatingOriginDigest: `sha256:${"c".repeat(64)}`, useDecision: { id: "ud", digest: `sha256:${"d".repeat(64)}` }, report: null, run: { runId: "5e2d7c1b-9a8f-4e3d-8c2b-1a0f9e8d7c6b", manifestDigest: `sha256:${"e".repeat(64)}`, sealKind: "decision_snapshot" }, revocationEpochAtDecision: 0, decidedAt: "2026-10-25T10:00:00.000Z", expectedMarkerSchemaVersion: "bks-intent-marker.v2" };
    expect(AdmissionDispatchV1.safeParse({ ...base, cypher: "MATCH (n) DETACH DELETE n", intent: {} }).success).toBe(false);
    expect(AdmissionDispatchV1.safeParse({ ...base, intent: { schemaVersion: "biotech-knowledge-intent.v2" } }).success).toBe(false);
  });
});
