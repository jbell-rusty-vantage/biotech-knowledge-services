import { z } from "zod";
import { Digest, JsonValue, Ref, Timestamp, Uid } from "./common.js";
import { BksErrorCode } from "./errors.js";

/**
 * biotech-knowledge-plan.v2: a server-stored, compiler-owned plan (SPECIFICATION 7.2). Clients receive this view
 * with `planRef` + `planDigest`; apply accepts only those two (plus intent digest, effect key, partial policy and
 * witness), never statements. `planDigest` is the bks-canonical-json.v2 digest of the plan body (every field except
 * `schemaVersion`, `planRef` and `planDigest`).
 */
export const PLAN_V2 = "biotech-knowledge-plan.v2" as const;

/** `held` (additive, S3 follow-up): no errors, nothing admitted or rejected, at least one proposal held; nothing to apply. */
export const PlanOutcomeV2 = z.enum(["applicable", "partial", "noop", "held", "rejected"]);
export const ProposalDispositionV2 = z.enum(["admitted", "noop_duplicate", "held", "rejected"]);
export const SubjectDispositionV2 = z.enum(["use_existing", "create", "review_required", "conflict", "missing"]);

export const PlanIssue = z.strictObject({ code: z.string(), message: z.string(), details: JsonValue.optional() });
export type PlanIssue = z.infer<typeof PlanIssue>;

export const Principal = z.strictObject({
  principalId: z.string().min(1).max(200),
  installationId: z.string().min(1).max(200),
  applicationId: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(200),
  role: z.enum(["reader", "writer", "admin"]),
  /** Privileged proposal grants: adjudication.deliver, projection.write, report.publish, assessment.accept. */
  grants: z.array(z.string()).default([]),
  /**
   * Principal class (SV-11, additive): `agent` (default: an agent or human tool caller), `operator`, or `service`, a
   * machine binding such as the Knowledge Services biotech-graph binding. Only a `service` principal holding the grant
   * admission.dispatch may trigger the dispatch consumer. Executor-local opaque-token class, not the MC->KS issuer profile.
   */
  principalClass: z.enum(["agent", "operator", "service"]).optional(),
});
export type Principal = z.infer<typeof Principal>;

export const PlanBinding = z.strictObject({
  intentId: Ref,
  intentDigest: Digest,
  observationsDigest: Digest,
  observedGraphRevision: z.number().int().nonnegative(),
  plannedAt: Timestamp,
  executorVersion: z.string(),
  schemaReleaseDigest: Digest,
  schemaDigest: Digest,
  rulesDigest: Digest,
  policyVersion: z.string(),
  canonicalJson: z.literal("bks-canonical-json.v2"),
  basis: z.strictObject({
    kind: z.enum(["snapshot", "creationOnly"]),
    snapshotRef: z.string().optional(),
    snapshotDigest: Digest.optional(),
    snapshotGraphRevision: z.number().int().nonnegative().optional(),
    dependencyCheck: z.enum(["revision-equal", "dependencies-unchanged", "not-applicable"]),
    reason: z.string().optional(),
  }),
  principal: Principal.omit({ role: true }),
  /** Every custody artifact the plan relies on (snapshot, sealed verifications): ref + digest. */
  custodyRefs: z.array(z.strictObject({ kind: z.string(), ref: z.string(), digest: Digest })).default([]),
  /** Digest over the evidence the witness must bind (sorted locator selector digests, snapshot content hashes, custody refs). */
  evidenceDigest: Digest,
});
export type PlanBinding = z.infer<typeof PlanBinding>;

export const PlannedStatementV2 = z.strictObject({
  id: z.string(),
  proposalId: Ref.optional(),
  /** Statement group: activity | sources | subjects | proposal. Only proposal statements are filtered by partial policy. */
  group: z.enum(["activity", "sources", "subjects", "proposal"]),
  purpose: z.string(),
  cypher: z.string(),
  params: z.record(z.string(), JsonValue),
  /** Exact row count the statement must return (each MATCH found its nodes). */
  expectRows: z.number().int().nonnegative(),
  /** Exact nodes it must create; deletes are always 0. */
  expectNodesCreated: z.number().int().nonnegative(),
  expectRelationshipsCreated: z.number().int().nonnegative(),
  /** Uids/statement ids the statement needs to exist first (dependency closure for partial apply). */
  needs: z.array(z.string()).default([]),
});
export type PlannedStatementV2 = z.infer<typeof PlannedStatementV2>;

export const DeclaredNodeEffect = z.strictObject({
  uid: Uid,
  label: z.string(),
  op: z.enum(["create", "update"]),
  proposalId: Ref.optional(),
  statementId: z.string(),
  /** Properties the effect sets (names only) for readback. */
  properties: z.array(z.string()).default([]),
});
export const DeclaredRelationshipEffect = z.strictObject({
  key: z.string(),
  type: z.string(),
  fromUid: Uid,
  toUid: Uid,
  relationshipUid: z.string().nullable(),
  op: z.enum(["create", "close"]),
  proposalId: Ref.optional(),
  statementId: z.string(),
  /** Authorizing Assertion of an asserted episode. */
  assertionUid: Uid.nullable().default(null),
});
export type DeclaredNodeEffect = z.infer<typeof DeclaredNodeEffect>;
export type DeclaredRelationshipEffect = z.infer<typeof DeclaredRelationshipEffect>;

export const PlanInvariant = z.strictObject({
  id: z.string(),
  kind: z.enum(["uid-absent", "uid-present", "identifier-owner", "slot-free", "episode-absent", "assertion-open", "evidence-chain", "asserted-edge-provenance", "no-derived-write"]),
  proposalId: Ref.optional(),
  /** Failure code when the invariant does not hold at apply. */
  failure: BksErrorCode,
  params: z.record(z.string(), JsonValue),
});
export type PlanInvariant = z.infer<typeof PlanInvariant>;

export const SubjectPlanV2 = z.strictObject({
  ref: Ref,
  nodeType: z.string(),
  disposition: SubjectDispositionV2,
  uid: Uid.nullable(),
  labels: z.array(z.string()),
  matches: z.array(z.strictObject({ uid: Uid, basis: z.enum(["uid", "identifier", "name_exact"]), detail: z.string().optional() })).default([]),
  reasons: z.array(z.string()).default([]),
  rewrites: z.array(z.strictObject({ field: z.string(), from: JsonValue, to: JsonValue, rule: z.string() })).default([]),
});
export type SubjectPlanV2 = z.infer<typeof SubjectPlanV2>;

export const ProposalPlanV2 = z.strictObject({
  proposalId: Ref,
  kind: z.string(),
  disposition: ProposalDispositionV2,
  reasons: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  rewrites: z.array(z.strictObject({ field: z.string(), from: JsonValue, to: JsonValue, rule: z.string() })).default([]),
  mints: z.record(z.string(), z.string()).default({}),
  /** Explicit plus implicit proposal dependencies (closure basis for partial apply). */
  dependsOn: z.array(Ref).default([]),
  statementIds: z.array(z.string()).default([]),
});
export type ProposalPlanV2 = z.infer<typeof ProposalPlanV2>;

export const IngestionPlanV2 = z.strictObject({
  schemaVersion: z.literal(PLAN_V2),
  planRef: z.string(),
  planDigest: Digest,
  binding: PlanBinding,
  outcome: PlanOutcomeV2,
  activity: z.strictObject({ uid: Uid, agentUid: Uid, system: z.string(), runId: z.string(), exists: z.boolean() }),
  sources: z.array(z.strictObject({
    ref: Ref,
    sourceUid: Uid,
    canonicalUri: z.string(),
    snapshotUid: Uid.nullable(),
    locators: z.array(z.strictObject({ ref: Ref, uid: Uid, selectorDigest: Digest, exists: z.boolean() })),
    captureAttempts: z.array(z.strictObject({ ref: Ref, uid: Uid })).default([]),
    retainedMetadata: z.record(z.string(), JsonValue).default({}),
  })),
  subjects: z.array(SubjectPlanV2),
  proposals: z.array(ProposalPlanV2),
  effects: z.strictObject({ nodes: z.array(DeclaredNodeEffect), relationships: z.array(DeclaredRelationshipEffect) }),
  invariants: z.array(PlanInvariant),
  statements: z.array(PlannedStatementV2),
  errors: z.array(PlanIssue),
  warnings: z.array(PlanIssue),
});
export type IngestionPlanV2 = z.infer<typeof IngestionPlanV2>;

/** Fields excluded from the plan digest (envelope). */
export const PLAN_V2_ENVELOPE = ["schemaVersion", "planRef", "planDigest"] as const;

export const PLAN_V2_DIGEST_PROFILE = { sets: ["binding.principal.grants"] };
