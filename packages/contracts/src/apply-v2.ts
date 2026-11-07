import { z } from "zod";
import { Digest, JsonValue, Ref, Timestamp, Uid } from "./common.js";
import { BksError } from "./errors.js";
import { EffectKey } from "./intent-v2.js";
import { DeclaredNodeEffect, DeclaredRelationshipEffect } from "./plan-v2.js";
import { ReceiptAdmission } from "./admission.js";

export const APPLY_V2 = "biotech-knowledge-apply.v2" as const;
export const RECEIPT_V2 = "biotech-knowledge-receipt.v2" as const;
export const WITNESS_V1 = "bks-apply-witness.v1" as const;
export const WITNESS_AUDIENCE = "bks-executor" as const;
export const WITNESS_MAX_LIFETIME_SECONDS = 60;

// ---------------------------------------------------------------------------------------------
// Admission witness (SPECIFICATION 7.2): authorization at issuance plus a bounded in-flight lease
// ---------------------------------------------------------------------------------------------

export const WitnessClaims = z.strictObject({
  iss: z.string().min(1).max(200),
  aud: z.literal(WITNESS_AUDIENCE),
  /** Witness id (unique per issuance). */
  jti: z.string().min(8).max(120),
  sub: z.string().min(1).max(200),
  scope: z.strictObject({ installationId: z.string(), applicationId: z.string(), tenantId: z.string() }),
  effectKey: EffectKey,
  intentDigest: Digest,
  planDigest: Digest,
  schemaReleaseDigest: Digest,
  evidenceDigest: Digest,
  partialPolicyDigest: Digest,
  policyVersion: z.string().min(1).max(120),
  decisionVersion: z.string().min(1).max(120),
  /** Seconds since the epoch. exp - iat is at most 60. */
  iat: z.number().int().nonnegative(),
  exp: z.number().int().nonnegative(),
  /** Authoritative revocation generation at issuance; the local KsRevocationFence must not be newer. */
  revocationGeneration: z.number().int().nonnegative(),
});
export type WitnessClaims = z.infer<typeof WitnessClaims>;

/** Compact signed envelope: payload is base64url(bks-canonical-json.v2 of the claims); signature is Ed25519 over the payload bytes. */
export const ApplyWitness = z.strictObject({
  format: z.literal(WITNESS_V1),
  alg: z.literal("Ed25519"),
  kid: z.string().min(1).max(120),
  payload: z.string().regex(/^[A-Za-z0-9_-]+$/),
  signature: z.string().regex(/^[A-Za-z0-9_-]+$/),
});
export type ApplyWitness = z.infer<typeof ApplyWitness>;

// ---------------------------------------------------------------------------------------------
// Apply request: references only, no statements
// ---------------------------------------------------------------------------------------------

export const PartialPolicy = z.union([z.literal("all"), z.strictObject({ include: z.array(Ref).min(1).max(500) })]);
export type PartialPolicy = z.infer<typeof PartialPolicy>;

export const ApplyRequestV2 = z.strictObject({
  schemaVersion: z.literal(APPLY_V2),
  planRef: z.string().min(1).max(200),
  expectedPlanDigest: Digest,
  intentDigest: Digest,
  intentId: Ref.optional(),
  effectKey: EffectKey,
  partialPolicy: PartialPolicy.default("all"),
  witness: ApplyWitness,
});
export type ApplyRequestV2 = z.infer<typeof ApplyRequestV2>;
export type ApplyRequestV2Input = z.input<typeof ApplyRequestV2>;

// ---------------------------------------------------------------------------------------------
// Receipt
// ---------------------------------------------------------------------------------------------

export const ReceiptOutcomeV2 = z.enum(["applied", "noop", "partial", "rejected", "failed", "duplicate", "unresolved"]);
export type ReceiptOutcomeV2 = z.infer<typeof ReceiptOutcomeV2>;

export const ProposalReceiptV2 = z.strictObject({
  proposalId: Ref,
  outcome: z.enum(["applied", "noop", "held", "rejected", "excluded", "failed"]),
  reason: z.string().optional(),
});

export const MarkerAttempt = z.strictObject({
  attemptId: z.string(),
  at: Timestamp,
  outcome: z.enum(["applied", "failed", "unresolved"]),
  code: z.string().nullable(),
  message: z.string().nullable(),
  planDigest: Digest,
});
export type MarkerAttempt = z.infer<typeof MarkerAttempt>;

export const IngestionReceiptV2 = z.strictObject({
  schemaVersion: z.literal(RECEIPT_V2),
  receiptId: z.string(),
  outcome: ReceiptOutcomeV2,
  duplicateOf: z.string().nullable(),
  effect: z.strictObject({
    effectKey: EffectKey,
    markerKey: z.string(),
    scope: z.strictObject({ installationId: z.string(), applicationId: z.string(), tenantId: z.string() }),
  }),
  intent: z.strictObject({ intentId: Ref, intentDigest: Digest }),
  plan: z.strictObject({ planRef: z.string(), planDigest: Digest, partialPolicy: JsonValue }),
  release: z.strictObject({ schemaReleaseDigest: Digest, executorVersion: z.string(), rulesDigest: Digest }),
  attemptId: z.string(),
  priorGraphRevision: z.number().int().nullable(),
  nextGraphRevision: z.number().int().nullable(),
  witness: z.strictObject({ jti: z.string(), kid: z.string(), iss: z.string(), iat: z.number().int(), exp: z.number().int(), revocationGeneration: z.number().int(), digest: Digest }).nullable(),
  activityUid: Uid.nullable(),
  proposals: z.array(ProposalReceiptV2),
  /** Complete declared effects of the applied subset (verifyEffects pages over these). */
  effects: z.strictObject({ nodes: z.array(DeclaredNodeEffect), relationships: z.array(DeclaredRelationshipEffect), total: z.number().int() }),
  invariants: z.array(z.strictObject({ id: z.string(), ok: z.boolean(), detail: z.string().optional() })),
  counters: z.record(z.string(), z.number().int()).nullable(),
  failure: BksError.nullable(),
  recovery: z.strictObject({ effectKey: EffectKey, markerKey: z.string(), attemptId: z.string(), lookup: z.string() }),
  attempts: z.array(MarkerAttempt).default([]),
  /** Set when cancellation was requested after the commit: the effect stands and is reported. */
  cancellation: z.strictObject({ requestedAfterCommit: z.boolean() }).optional(),
  /** Set when a Knowledge Services dispatch (biotech-knowledge-admission.v1) applied the effect (SV-11; witness is then null). */
  admission: ReceiptAdmission.optional(),
  executedAt: Timestamp,
  durationMs: z.number().int().nonnegative().optional(),
});
export type IngestionReceiptV2 = z.infer<typeof IngestionReceiptV2>;

/** Receipt semantic digest excludes timing/attempt-local fields. */
export const RECEIPT_V2_NON_SEMANTIC = ["executedAt", "durationMs", "attempts"] as const;

// ---------------------------------------------------------------------------------------------
// Paginated complete readback of declared effects (SPECIFICATION 7.4)
// ---------------------------------------------------------------------------------------------

export const VerifyEffectsRequest = z.strictObject({
  effectKey: EffectKey,
  cursor: z.number().int().nonnegative().default(0),
  pageSize: z.number().int().min(1).max(500).default(100),
});
export const EffectCheck = z.strictObject({
  kind: z.enum(["node", "relationship"]),
  key: z.string(),
  ok: z.boolean(),
  checks: z.array(z.strictObject({ name: z.string(), ok: z.boolean(), detail: z.string().optional() })),
});
export const VerifyEffectsPage = z.strictObject({
  schemaVersion: z.literal("bks-effect-verification.v1"),
  effectKey: EffectKey,
  receiptId: z.string(),
  total: z.number().int(),
  cursor: z.number().int(),
  nextCursor: z.number().int().nullable(),
  complete: z.boolean(),
  checked: z.number().int(),
  failures: z.number().int(),
  items: z.array(EffectCheck),
});
export type VerifyEffectsPage = z.infer<typeof VerifyEffectsPage>;
