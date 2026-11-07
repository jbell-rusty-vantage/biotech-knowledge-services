import { z } from "zod";
import { canonicalDigest } from "./canonical.js";
import { Digest, Timestamp } from "./common.js";
import { EffectKey, IngestionIntentV2 } from "./intent-v2.js";

/**
 * biotech-knowledge-admission.v1 (Sprint V SV-11, design section 7 and section 9 K06).
 *
 * Biotech admits graph effects from the common PostgreSQL decision/outbox of the Knowledge Services component
 * `knowledge_verification` installed in the Biotech application PostgreSQL. Knowledge Services (bindings/biotech-graph)
 * writes one `dispatch_outbox` row per transmission and stores the dispatch payload below as an immutable
 * `artifact_custody` row whose `digest` equals `dispatch_outbox.payload_digest` (inline bytes, media type
 * ADMISSION_PAYLOAD_MEDIA_TYPE). The BKS outbox consumer claims the row, rechecks the decision, applies the exact graph
 * effect and its KsIntentMarker in ONE Neo4j transaction, and acknowledges with the marker digest. PostgreSQL and Neo4j
 * are not atomic together; official reads revalidate eligibility against the authority.
 *
 * Native payload of the effect (the bytes `knowledge_verification.effect.semantic_payload_digest` hashes and the bound
 * effect digest binds, K01 `boundEffectDigest`): the UTF-8 bytes of bks-canonical-json.v2 (no digest profile) of
 * `intent` exactly as carried in the payload JSON. Proposals are biotech-knowledge-intent.v2 proposals; no Cypher.
 */
export const ADMISSION_DISPATCH_V1 = "biotech-knowledge-admission.v1" as const;
export const ADMISSION_ACK_V1 = "biotech-knowledge-admission-ack.v1" as const;
export const ADMISSION_CONSUME_REQUEST_V1 = "biotech-knowledge-admission-consume-request.v1" as const;
export const ADMISSION_CONSUME_REPORT_V1 = "biotech-knowledge-admission-consume.v1" as const;
/** Marker shape written by a dispatch apply (rules/operational-names.yaml markerShapes, biotech-schema-v2.2.0, R-SV11). */
export const INTENT_MARKER_V2 = "bks-intent-marker.v2" as const;
/** Media type of the payload artifact_custody row. */
export const ADMISSION_PAYLOAD_MEDIA_TYPE = "application/vnd.belllabs.biotech-knowledge-admission.v1+json" as const;
/** `knowledge_verification.dispatch_outbox.target_binding` value of Biotech graph dispatches. */
export const ADMISSION_TARGET_BINDING = "biotech-graph" as const;
/** Canonicalization the bound effect digest is computed with (K01). Identical to bks-canonical-json.v2 for its value space. */
export const KOP_CANONICALIZATION = "kop-canonical-json.v1" as const;

export const TenantUuid = z.uuid();
export const DispatchId = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,199}$/, "dispatchId: K01 id");
/** Knowledge Services report kinds (K08 catalogue); the second is ReportKind.STUDY_APPRAISAL in biotech-schema-v2.2.0. */
export const AdmissionReportKind = z.enum(["evidence_report", "study_appraisal"]);
export type AdmissionReportKind = z.infer<typeof AdmissionReportKind>;
/** Graph ReportKind for each Knowledge Services report kind. */
export const GRAPH_REPORT_KIND: Record<AdmissionReportKind, string> = { evidence_report: "EVIDENCE_REPORT", study_appraisal: "STUDY_APPRAISAL" };

export const UseDecisionRef = z.strictObject({
  /** knowledge_verification.use_decision.use_decision_id */
  id: z.string().min(1).max(200),
  /** knowledge_verification.use_decision.digest */
  digest: Digest,
});
export type UseDecisionRef = z.infer<typeof UseDecisionRef>;

export const AdmissionReportRef = z.strictObject({
  reportRevisionId: z.string().min(1).max(200),
  reportId: z.string().min(1).max(200),
  revision: z.number().int().min(1),
  reportKind: AdmissionReportKind,
  /** Versioned report-kind reference (Report.reportKindRef), the Knowledge Services kind ref `<kind>@<semver>` (e.g. evidence_report@1.0.0, knowledge_verification.report_revision.report_kind_ref_id). */
  reportKindRef: z.string().min(1).max(200),
  /** research-report.v2 */
  reportSchema: z.string().min(1).max(120),
  /** knowledge_verification.report_revision.digest */
  digest: Digest,
});
export type AdmissionReportRef = z.infer<typeof AdmissionReportRef>;

export const AdmissionRunRef = z.strictObject({
  runId: z.uuid(),
  /** Head manifest digest the decision references (knowledge_verification.run_manifest.manifest_digest). */
  manifestDigest: Digest,
  sealKind: z.enum(["verification_snapshot", "decision_snapshot", "admission_snapshot"]),
});

export const CustodyRef = z.strictObject({
  role: z.enum(["report_body", "report_structured_body", "report_ledger", "evidence_bundle"]),
  digest: Digest,
  mediaType: z.string().min(1).max(200),
  byteLength: z.number().int().nonnegative(),
  locator: z.strictObject({
    kind: z.enum(["inline", "bucket", "volume", "external"]),
    /** knowledge_verification.artifact_custody.artifact_id */
    artifactId: z.string().min(1).max(200),
    uri: z.string().max(2000).nullable().default(null),
  }),
});
export type CustodyRef = z.infer<typeof CustodyRef>;

export const AdmissionDispatchV1 = z.strictObject({
  schemaVersion: z.literal(ADMISSION_DISPATCH_V1),
  /** knowledge_verification tenant (uuid); also the graph marker scope tenantId. */
  tenantId: TenantUuid,
  /** knowledge_verification.installation.installation_id; the graph marker scope installationId. */
  installationId: z.string().min(1).max(200),
  /** knowledge_verification.installation.application_id (biotech); the graph marker scope applicationId. */
  applicationId: z.string().regex(/^[a-z][a-z0-9_-]{0,59}$/),
  targetBinding: z.literal(ADMISSION_TARGET_BINDING),
  dispatchId: DispatchId,
  effectKey: EffectKey,
  boundEffectDigest: Digest,
  /** sha256 of the native payload bytes (= knowledge_verification.effect.semantic_payload_digest). */
  semanticPayloadDigest: Digest,
  /** knowledge_verification.effect.originating_origin_digest */
  originatingOriginDigest: Digest,
  useDecision: UseDecisionRef,
  /** The report revision the effect materializes (null for an effect that publishes no report). */
  report: AdmissionReportRef.nullable(),
  run: AdmissionRunRef,
  /** use_decision.revocation_epoch: the authoritative epoch the decision was taken at. */
  revocationEpochAtDecision: z.number().int().nonnegative(),
  /** Decision instant; the planner clock of the dispatch apply (same plan digest for the same graph state). */
  decidedAt: Timestamp,
  intent: IngestionIntentV2,
  /** Exact custody references of the report body, structured body and ledger (digest + media type + locator). */
  custody: z.array(CustodyRef).max(16).default([]),
  expectedMarkerSchemaVersion: z.literal(INTENT_MARKER_V2),
});
export type AdmissionDispatchV1 = z.infer<typeof AdmissionDispatchV1>;
export type AdmissionDispatchV1Input = z.input<typeof AdmissionDispatchV1>;

/**
 * Outcome of one dispatch at the consumer. applied / duplicate are acknowledged in PostgreSQL with the marker digest.
 * revoked: no graph write (or, when revocation raced the commit, the acknowledgment was refused and official reads
 * exclude the projection). refused: permanent, never applied. deferred: retried later through fail_dispatch.
 */
export const DispatchOutcome = z.enum(["applied", "duplicate", "revoked", "refused", "deferred"]);
export type DispatchOutcome = z.infer<typeof DispatchOutcome>;

export const AdmissionAcknowledgmentV1 = z.strictObject({
  schemaVersion: z.literal(ADMISSION_ACK_V1),
  tenantId: TenantUuid,
  dispatchId: DispatchId,
  effectKey: z.string().max(200),
  outcome: DispatchOutcome,
  /** markerDigestOf(payloadDigest, planDigest); null when no marker exists. */
  markerDigest: Digest.nullable(),
  payloadDigest: Digest.nullable(),
  planDigest: Digest.nullable(),
  receiptId: z.string().nullable(),
  /** Graph commit reference: Neo4j exposes no transaction id, so the causal bookmark and the graph revision stand in. */
  graph: z.strictObject({ bookmark: z.string().nullable(), graphRevision: z.number().int().nullable(), markerKey: z.string().nullable() }),
  appliedAt: Timestamp.nullable(),
  /** knowledge_verification.dispatch_outbox.state after the consumer's call (null when it could not be read). */
  componentState: z.enum(["pending", "dispatched", "acknowledged", "failed", "revoked", "refused"]).nullable(),
  acknowledged: z.boolean(),
  reason: z.strictObject({ code: z.string().max(80), message: z.string().max(2000) }).nullable(),
  retryAfterSeconds: z.number().int().nonnegative().nullable(),
  processedAt: Timestamp,
});
export type AdmissionAcknowledgmentV1 = z.infer<typeof AdmissionAcknowledgmentV1>;

export const AdmissionConsumeRequestV1 = z.strictObject({
  schemaVersion: z.literal(ADMISSION_CONSUME_REQUEST_V1).default(ADMISSION_CONSUME_REQUEST_V1),
  /** Tenant to consume for; must be one of the executor's configured verification tenants. */
  tenantId: TenantUuid,
  limit: z.number().int().min(1).max(100).default(10),
});
export type AdmissionConsumeRequestV1 = z.infer<typeof AdmissionConsumeRequestV1>;

export const AdmissionConsumeReportV1 = z.strictObject({
  schemaVersion: z.literal(ADMISSION_CONSUME_REPORT_V1),
  tenantId: TenantUuid,
  claimed: z.number().int().nonnegative(),
  results: z.array(AdmissionAcknowledgmentV1),
  startedAt: Timestamp,
  finishedAt: Timestamp,
});
export type AdmissionConsumeReportV1 = z.infer<typeof AdmissionConsumeReportV1>;

/** Admission fields recorded on the receipt of a dispatch apply (additive, optional on biotech-knowledge-receipt.v2). */
export const ReceiptAdmission = z.strictObject({
  markerSchemaVersion: z.literal(INTENT_MARKER_V2),
  dispatchId: DispatchId,
  markerDigest: Digest,
  payloadDigest: Digest,
  boundEffectDigest: Digest,
  useDecision: UseDecisionRef,
  revocationEpoch: z.number().int().nonnegative(),
  appliedAt: Timestamp,
});
export type ReceiptAdmission = z.infer<typeof ReceiptAdmission>;

/** Marker digest recorded on the KsIntentMarker and sent as `acknowledge_dispatch(..., p_ack_digest)`. */
export function markerDigestOf(payloadDigest: string, planDigest: string): string {
  return canonicalDigest({ format: "bks-intent-marker-digest.v1", payloadDigest, planDigest });
}

/** K01 bound effect digest: canonical {canonicalization, payloadDigest, originatingOrigin identity} (KS knowledge-operation-protocol effect.ts). */
export function boundEffectDigestOf(semanticPayloadDigest: string, originIdentity: unknown): string {
  return canonicalDigest({ canonicalization: KOP_CANONICALIZATION, payloadDigest: semanticPayloadDigest, originatingOrigin: originIdentity });
}
