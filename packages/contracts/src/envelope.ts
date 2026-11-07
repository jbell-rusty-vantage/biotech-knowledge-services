import { z } from "zod";
import { CANONICAL_JSON_V2, canonicalDigest, canonicalInstant, canonicalize, rawBytesDigest } from "./canonical.js";
import { Digest, Timestamp } from "./common.js";

/**
 * `mc.knowledge_request.v1`: the shared Mission Control / Knowledge Services request envelope (SPECIFICATION 8,
 * Mission Control KNOWLEDGE-SERVICES.md "Versioned intent artifacts"). Work package S7.
 *
 * The envelope WRAPS a native domain payload; it never translates it.
 *  - The native payload bytes travel unchanged (camelCase stays camelCase, no Unicode normalization, no re-encoding).
 *    `input.payloadDigest` is `rawBytesDigest` of exactly those bytes; `input.nativeDigest` is the native service's own
 *    semantic digest (for Biotech: the executor-reported `intentDigest`, bks-canonical-json.v2 with the intent profile).
 *    The wrapper never recomputes a native digest with another canonicalization.
 *  - The envelope digest (`envelopeDigest`) is bks-canonical-json.v2 of the parsed envelope. Every member is REQUIRED
 *    (nullable where absent) and every number is a safe integer, so TypeScript, Python and any JCS (RFC 8785)
 *    implementation produce the same bytes; golden vectors: `packages/contracts/golden/knowledge-request-envelope.v1.json`.
 *  - Wrapper digest and native digest are separate fields and are never interchangeable.
 *
 * Delivery and verification are separate state machines (KS ADR 0012): `delivery` is the domain-effect state
 * (`pending | applied | rejected | unresolved`), `verification` is the shared verification completion state. A completed
 * verification whose graph admission is held is `delivery: pending`, never a successful write.
 */
export const KNOWLEDGE_REQUEST_V1 = "mc.knowledge_request.v1" as const;
export const KNOWLEDGE_DELIVERY_V1 = "mc.knowledge_delivery.v1" as const;
export const ENVELOPE_CANONICALIZATION = CANONICAL_JSON_V2;

/** The 11 logical `knowledge.*` interfaces of Mission Control KNOWLEDGE-SERVICES.md (logical names, not endpoints). */
export const KNOWLEDGE_OPERATIONS = [
  "knowledge.describe",
  "knowledge.capture_prepare",
  "knowledge.verify",
  "knowledge.classify_propose",
  "knowledge.classify_admit",
  "knowledge.query",
  "knowledge.retrieve",
  "knowledge.ingestion_plan",
  "knowledge.ingestion_apply",
  "knowledge.receipt_get",
  "knowledge.verify_result",
] as const;
export const KnowledgeOperation = z.enum(KNOWLEDGE_OPERATIONS);
export type KnowledgeOperation = z.infer<typeof KnowledgeOperation>;

/** Operations that produce (or settle) a domain effect and therefore need a stable semantic effect key. */
export const EFFECT_OPERATIONS: readonly KnowledgeOperation[] = ["knowledge.ingestion_apply", "knowledge.receipt_get", "knowledge.verify_result", "knowledge.classify_admit"];

const Id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,199}$/, "id: ^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,199}$");
const ScopeId = z.string().min(1).max(200);
const SafeInt = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const RunSystem = z.string().regex(/^[a-z0-9][a-z0-9.-]{0,59}$/);
const RefDigest = z.strictObject({ ref: z.string().min(1).max(400), digest: Digest });
/** Same grammar as the Biotech native `effectKey` (biotech-knowledge-intent.v2 `EffectKey`). */
export const EnvelopeEffectKey = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,199}$/, "effectKey: stable semantic effect id");

export const MissionCorrelation = z.strictObject({
  missionId: Id,
  runId: Id,
  activationId: Id.nullable(),
  attempt: SafeInt,
});

export const EnvelopeIdentity = z.strictObject({
  requestId: Id,
  installationId: ScopeId,
  applicationId: ScopeId,
  tenantId: ScopeId,
  correlationId: Id.nullable(),
  /** Mission Control correlation; `null` for a standalone operation (no fictitious mission is minted). */
  mission: MissionCorrelation.nullable(),
  /**
   * Native namespaced run identity. Mission-correlated: `{system: "mission-control", runId: mission.runId}` (one graph
   * Activity per actual run, OD-07). Standalone: a native namespace (e.g. `bks-native`), never `mission-control`.
   */
  nativeRun: z.strictObject({ system: RunSystem, runId: Id }),
  /** Monotonic request generation (a corrected proposal is a new generation and a new logical action). */
  generation: SafeInt,
  /** Stable semantic effect key; required for effect operations, identical across technical retries. */
  effectKey: EnvelopeEffectKey.nullable(),
});

export const CapabilityBindingRef = z.strictObject({
  bindingId: Id,
  revision: SafeInt.min(1),
  /** Digest of the capability descriptor the binding pinned (`descriptorDigest`). */
  digest: Digest,
});

export const EnvelopeTarget = z.strictObject({
  capabilityBinding: CapabilityBindingRef,
  /** Endpoint audience the binding authorizes (Biotech executor: `bks-executor`). */
  audience: z.string().min(1).max(120),
  operation: KnowledgeOperation,
  /** The native route/tool the adapter invokes, e.g. `POST /kg/plan`. */
  nativeOperation: z.string().min(1).max(200),
  executorVersion: z.string().min(1).max(60),
  schemaReleaseDigest: Digest,
});

export const NativeContractRef = z.strictObject({
  /** Native contract name without its version suffix, e.g. `biotech-knowledge-intent`. */
  name: z.string().regex(/^[a-z][a-z0-9_.-]{0,119}$/),
  /** Native contract version, e.g. `v2`; `${name}.${version}` is the payload's schemaVersion. */
  version: z.string().regex(/^v[0-9]+$/),
});

export const EnvelopeInput = z.strictObject({
  nativeContract: NativeContractRef,
  /** Immutable registered artifact reference of the payload bytes (`null` only for payload-free reads such as describe). */
  payloadRef: z.string().min(1).max(400).nullable(),
  /** rawBytesDigest of the exact native payload bytes. */
  payloadDigest: Digest.nullable(),
  payloadBytes: SafeInt.nullable(),
  mediaType: z.literal("application/json"),
  /** Canonicalization algorithm of the NATIVE digest (Biotech: bks-canonical-json.v2). */
  canonicalization: z.literal(CANONICAL_JSON_V2),
  /** Native semantic digest reported by the domain service (e.g. plan.binding.intentDigest); null until known. */
  nativeDigest: Digest.nullable(),
  upstreamRefs: z.array(z.strictObject({ kind: z.string().min(1).max(60), ref: z.string().min(1).max(400), digest: Digest })).max(200),
});

export const EnvelopeAuthority = z.strictObject({
  actor: z.strictObject({ kind: z.enum(["agent", "human", "service"]), id: z.string().min(1).max(200) }),
  /** Requested domain scopes; effective grants are resolved again at invocation. */
  requestedScopes: z.array(z.string().regex(/^[a-z][a-z0-9_.:-]{0,119}$/)).max(50),
  /** Originating Mission Control admission reference (operation/reservation admission). */
  admissionRef: z.string().min(1).max(400).nullable(),
  /** Grant reference the domain admission service rechecks before issuing a witness. */
  grantRef: z.string().min(1).max(400).nullable(),
});

export const EnvelopePreconditions = z.strictObject({
  releasePins: z.strictObject({ schemaReleaseDigest: Digest, policyVersion: z.string().min(1).max(120).nullable(), workspaceFingerprint: Digest.nullable() }),
  snapshotRef: RefDigest.nullable(),
  /** Native graph revision the caller observed (Biotech KsWriteFence.graphRevision); not a knowledge sequence. */
  graphRevision: SafeInt.nullable(),
  planRef: z.string().min(1).max(200).nullable(),
  expectedPlanDigest: Digest.nullable(),
  approvalRefs: z.array(RefDigest).max(50),
});

export const EnvelopePartialPolicy = z.union([z.literal("all"), z.strictObject({ include: z.array(z.string().regex(/^[a-z0-9][a-z0-9._-]{0,63}$/)).min(1).max(500) })]);

export const EnvelopeGovernors = z.strictObject({
  reservationRef: z.string().min(1).max(400).nullable(),
  /** UTC instant in canonical spelling (`canonicalInstant`). */
  deadline: Timestamp.refine((t) => { try { return canonicalInstant(t) === t; } catch { return false; } }, "deadline: canonical UTC instant (canonicalInstant)").nullable(),
  timeoutMs: SafeInt.nullable(),
  maxItems: SafeInt.nullable(),
  partialPolicy: EnvelopePartialPolicy.nullable(),
});

function checkEnvelope(env: { identity: z.infer<typeof EnvelopeIdentity>; target: z.infer<typeof EnvelopeTarget>; input: z.infer<typeof EnvelopeInput>; preconditions: z.infer<typeof EnvelopePreconditions> }, ctx: z.RefinementCtx): void {
  const { identity, target, input, preconditions } = env;
  if (identity.mission) {
    if (identity.nativeRun.system !== "mission-control" || identity.nativeRun.runId !== identity.mission.runId) ctx.addIssue({ code: "custom", path: ["identity", "nativeRun"], message: "a mission-correlated request uses nativeRun {system: mission-control, runId: mission.runId}" });
  } else if (identity.nativeRun.system === "mission-control") {
    ctx.addIssue({ code: "custom", path: ["identity", "nativeRun", "system"], message: "a standalone request uses a native run namespace, never mission-control (no fictitious mission)" });
  }
  if (EFFECT_OPERATIONS.includes(target.operation) && !identity.effectKey) ctx.addIssue({ code: "custom", path: ["identity", "effectKey"], message: `${target.operation} requires a stable semantic effectKey` });
  if (target.operation === "knowledge.ingestion_apply" && (!preconditions.planRef || !preconditions.expectedPlanDigest)) ctx.addIssue({ code: "custom", path: ["preconditions"], message: "knowledge.ingestion_apply requires planRef and expectedPlanDigest" });
  if (target.schemaReleaseDigest !== preconditions.releasePins.schemaReleaseDigest) ctx.addIssue({ code: "custom", path: ["preconditions", "releasePins", "schemaReleaseDigest"], message: "release pin differs from the target binding release" });
  const hasPayload = input.payloadRef !== null || input.payloadDigest !== null || input.payloadBytes !== null;
  if (hasPayload && (input.payloadRef === null || input.payloadDigest === null || input.payloadBytes === null)) ctx.addIssue({ code: "custom", path: ["input"], message: "payloadRef, payloadDigest and payloadBytes are set together" });
}

export const KnowledgeRequestEnvelope = z
  .strictObject({
    schemaVersion: z.literal(KNOWLEDGE_REQUEST_V1),
    identity: EnvelopeIdentity,
    target: EnvelopeTarget,
    input: EnvelopeInput,
    authority: EnvelopeAuthority,
    preconditions: EnvelopePreconditions,
    governors: EnvelopeGovernors,
  })
  .superRefine(checkEnvelope);
export type KnowledgeRequestEnvelope = z.infer<typeof KnowledgeRequestEnvelope>;

/** bks-canonical-json.v2 text of a validated envelope (all members present; no profile). */
export function envelopeCanonical(envelope: unknown): string {
  return canonicalize(KnowledgeRequestEnvelope.parse(envelope));
}

/** The wrapper digest. Never equal in meaning to `input.payloadDigest` (raw bytes) or `input.nativeDigest` (native). */
export function envelopeDigest(envelope: unknown): string {
  return canonicalDigest(KnowledgeRequestEnvelope.parse(envelope));
}

/** Payload binding for exact native bytes (no parsing, no normalization). */
export function payloadBinding(bytes: Uint8Array): { payloadDigest: string; payloadBytes: number } {
  return { payloadDigest: rawBytesDigest(bytes), payloadBytes: bytes.byteLength };
}

/** True when `bytes` are exactly the bytes the envelope binds. */
export function verifyEnvelopePayload(envelope: KnowledgeRequestEnvelope, bytes: Uint8Array): boolean {
  return envelope.input.payloadDigest === rawBytesDigest(bytes) && envelope.input.payloadBytes === bytes.byteLength;
}

// ---------------------------------------------------------------------------------------------
// Delivery and verification states (separate machines) and the Biotech outcome mapping
// ---------------------------------------------------------------------------------------------

export const DELIVERY_STATES = ["pending", "applied", "rejected", "unresolved"] as const;
export const DeliveryState = z.enum(DELIVERY_STATES);
export type DeliveryState = z.infer<typeof DeliveryState>;

/** Shared verification completion (Knowledge Services verification), independent of domain delivery. */
export const VERIFICATION_STATES = ["not_required", "pending", "completed", "failed"] as const;
export const VerificationState = z.enum(VERIFICATION_STATES);
export type VerificationState = z.infer<typeof VerificationState>;

/** Native failure codes after which nothing committed and the SAME effect identity may be retried (fresh witness). */
export const RETRYABLE_NO_EFFECT_CODES = ["BKS_WITNESS_EXPIRED", "BKS_TIMEOUT", "BKS_AUTHORITY_UNAVAILABLE", "BKS_EFFECT_PENDING"] as const;

/**
 * Biotech `biotech-knowledge-receipt.v2` outcome -> delivery state.
 *   applied | partial | noop | duplicate -> applied   (the effect is settled; partial = an admitted closed subset applied,
 *                                                      noop = nothing new to write, duplicate = the recorded receipt)
 *   rejected                             -> rejected
 *   failed + retryable no-effect code    -> pending    (rolled back; same effect key may be retried with a new witness)
 *   failed (any other code)              -> rejected   (typed domain outcome: re-plan / remediation, not blind retry)
 *   unresolved                           -> unresolved (commit outcome unknown: receipt lookup with the original key)
 * A missing receipt is never evidence that no write occurred (KS ADR 0012): a lost response stays `unresolved`.
 */
export function deliveryStateOfBiotechOutcome(outcome: string, failureCode?: string | null): DeliveryState {
  switch (outcome) {
    case "applied":
    case "partial":
    case "noop":
    case "duplicate":
      return "applied";
    case "rejected":
      return "rejected";
    case "failed":
      return failureCode && (RETRYABLE_NO_EFFECT_CODES as readonly string[]).includes(failureCode) ? "pending" : "rejected";
    case "unresolved":
      return "unresolved";
    default:
      throw new Error(`unknown biotech receipt outcome ${outcome}`);
  }
}

/** `mc.knowledge_delivery.v1`: the settled (or unsettled) state of one enveloped request, as Mission Control records it. */
export const KnowledgeDelivery = z.strictObject({
  schemaVersion: z.literal(KNOWLEDGE_DELIVERY_V1),
  requestId: Id,
  envelopeDigest: Digest,
  payloadDigest: Digest.nullable(),
  nativeDigest: Digest.nullable(),
  effectKey: EnvelopeEffectKey.nullable(),
  delivery: DeliveryState,
  verification: VerificationState,
  /** Native outcome string exactly as the domain service reported it (`null` when no receipt is known). */
  nativeOutcome: z.string().max(60).nullable(),
  nativeReceipt: z.strictObject({ receiptId: z.string().min(1).max(200), digest: Digest, lookup: z.string().max(400) }).nullable(),
  /** Items held by the domain (graph admission held) even though the request otherwise settled. */
  heldItems: z.array(z.string().max(120)).max(500),
  reason: z.string().max(2000).nullable(),
});
export type KnowledgeDelivery = z.infer<typeof KnowledgeDelivery>;
