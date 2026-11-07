import { z } from "zod";
import { Digest, JsonValue, Timestamp, Uid } from "./common.js";

/**
 * Shared read-result status (INTERFACES 5 `biotech-knowledge-read-result.v2`). None of the non-`ok`/`empty` values
 * means absence. The read role owns the full read-result contract; this enum and the digest triple are shared.
 */
export const ReadResultStatus = z.enum(["ok", "empty", "truncated", "failed", "skipped", "unsupported", "stale", "forbidden"]);
export type ReadResultStatus = z.infer<typeof ReadResultStatus>;

/** Separate identities of a read (SPECIFICATION 6.2): query shape, semantic result, full receipt. */
export const ReadDigests = z.strictObject({ queryDigest: Digest, resultDigest: Digest, receiptDigest: Digest });
export type ReadDigests = z.infer<typeof ReadDigests>;

export const ConsistencyMode = z.enum(["observed", "stable_revision"]);

/**
 * bks-custody-snapshot.v1: the custody record of a read result an ingestion intent cites as `basis.snapshotRef`.
 * Written by the read service (S4) through `SnapshotCustody.put`; the executor verifies issuer, scope, pins and the
 * digest of the retained bytes before planning (BKS_SNAPSHOT_UNVERIFIED otherwise).
 */
export const CUSTODY_SNAPSHOT_V1 = "bks-custody-snapshot.v1" as const;
export const CustodySnapshotRecord = z.strictObject({
  format: z.literal(CUSTODY_SNAPSHOT_V1),
  ref: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/),
  /** rawBytesDigest of the retained snapshot bytes (the bytes file next to the record). */
  bytesDigest: Digest,
  issuer: z.string().min(1).max(200),
  scope: z.strictObject({ installationId: z.string(), applicationId: z.string(), tenantId: z.string() }),
  pins: z.strictObject({ schemaReleaseDigest: Digest }),
  consistency: z.strictObject({ mode: ConsistencyMode, graphRevision: z.number().int().nonnegative().nullable(), bookmarks: z.array(z.string()).default([]) }),
  /** Read dependencies: the nodes the result relied on, with the updatedAt observed. `complete` = every dependency is listed. */
  dependencies: z.strictObject({ complete: z.boolean(), nodes: z.array(z.strictObject({ uid: Uid, updatedAt: z.string().nullable() })).max(5000) }),
  digests: ReadDigests.optional(),
  createdAt: Timestamp,
});
export type CustodySnapshotRecord = z.infer<typeof CustodySnapshotRecord>;

/**
 * bks-sealed-verification.v1: a sealed verification result (verification.v1 judgment) delivered by the trusted
 * verification service. The executor hydrates `adjudication` proposals from it; an intent never declares a verdict.
 * The record is signed by a pinned verifier key (BKS_VERIFIER_ISSUER_KEYS) over its canonical body.
 */
export const SEALED_VERIFICATION_V1 = "bks-sealed-verification.v1" as const;
export const SealedVerificationBody = z.strictObject({
  format: z.literal(SEALED_VERIFICATION_V1),
  ref: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/),
  issuer: z.string().min(1).max(200),
  judgmentId: z.string().min(1).max(200),
  assertionUid: Uid,
  adjudicationKind: z.enum(["CAPTURE_FIDELITY", "SUPPORT"]),
  verdict: z.string().regex(/^[A-Z][A-Z_]*$/),
  mechanicalStatus: z.enum(["passed", "failed", "review_required"]).optional(),
  policyOutcome: z.enum(["PASS", "PASS_WITH_WARNINGS", "REVIEW", "FAIL", "ABSTAIN"]),
  judgeKind: z.enum(["DETERMINISTIC", "NLI", "LLM", "HUMAN", "POLICY", "STATISTICAL"]),
  methodVersion: z.string().min(1).max(200),
  properties: z.strictObject({
    evidenceSupport: z.string().optional(),
    worldCorrectness: z.string().optional(),
    attributionFaithfulness: z.string().optional(),
    sourceAuthority: z.string().optional(),
    provenanceIntegrity: z.string().optional(),
  }).default({}),
  unsupportedFacets: z.array(z.string()).default([]),
  calibratedProbability: z.number().min(0).max(1).optional(),
  rationale: z.string().max(4000).optional(),
  decision: z.enum(["AFFIRM", "REJECT", "DEFER"]).optional(),
  decisionProvenance: z.enum(["HUMAN_ORIGIN", "SYNTHETIC_ENGINEERING"]).optional(),
  /** uid of the held Adjudication this decision supersedes (human review of a held result). */
  supersedesAdjudicationUid: Uid.optional(),
  evidence: z.array(z.strictObject({
    locatorUid: Uid,
    selectorDigest: Digest,
    role: z.enum(["SUPPORTS", "CONTRADICTS", "QUALIFIES", "CONTEXT"]),
    origin: z.enum(["DECLARED", "VERIFIER_FOUND"]),
    authority: z.string().optional(),
    independence: z.string().optional(),
    facet: z.string().optional(),
  })).max(200).default([]),
  run: z.strictObject({ system: z.string().default("ks-verification"), runId: z.string().min(1), bundleDigest: Digest.optional(), policyVersion: z.string().optional() }),
  /** OD-08: whether policy admits a tool-rendition-only acceptance (PASS_WITH_WARNINGS) when issuer bytes are unavailable. */
  policy: z.strictObject({ toolRenditionException: z.boolean().default(false) }).default({ toolRenditionException: false }),
  sealedAt: Timestamp,
  extra: z.record(z.string(), JsonValue).optional(),
});
export type SealedVerificationBody = z.infer<typeof SealedVerificationBody>;

export const SealedVerification = z.strictObject({
  body: SealedVerificationBody,
  kid: z.string().min(1).max(120),
  /** base64url Ed25519 signature over bks-canonical-json.v2 of `body`. */
  signature: z.string().regex(/^[A-Za-z0-9_-]+$/),
});
export type SealedVerification = z.infer<typeof SealedVerification>;
