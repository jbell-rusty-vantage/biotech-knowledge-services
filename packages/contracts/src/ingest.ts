import { z } from "zod";
import {
  Actor,
  Digest,
  JsonValue,
  PropertyMap,
  Ref,
  RelationshipType,
  RunContext,
  Timestamp,
  TypeName,
  Uid,
  Validity,
} from "./common.js";
import { CypherCounters } from "./cypher.js";
import { ReadIntent, TouchedNode } from "./read.js";

export const INTENT_VERSION = "biotech-knowledge-intent.v1" as const;
export const PLAN_VERSION = "biotech-knowledge-plan.v1" as const;
export const RECEIPT_VERSION = "biotech-knowledge-receipt.v1" as const;

// ---------------------------------------------------------------------------------------------
// Sources and evidence
// ---------------------------------------------------------------------------------------------

/** A locator inside a snapshot: the exact span evidence points at (W3C selector kinds). */
export const LocatorDeclaration = z.strictObject({
  ref: Ref,
  uid: Uid.optional(),
  selectorKind: z.string().min(1).max(40),
  uri: z.string().max(2000).optional(),
  section: z.string().max(400).optional(),
  page: z.number().int().nonnegative().optional(),
  quote: z.string().max(4000).optional(),
  quotePrefix: z.string().max(400).optional(),
  quoteSuffix: z.string().max(400).optional(),
  startOffset: z.number().int().nonnegative().optional(),
  endOffset: z.number().int().nonnegative().optional(),
  mediaStartSeconds: z.number().nonnegative().optional(),
  mediaEndSeconds: z.number().nonnegative().optional(),
  properties: PropertyMap.default({}),
});
export type LocatorDeclaration = z.infer<typeof LocatorDeclaration>;

export const SourceDeclaration = z.strictObject({
  ref: Ref,
  source: z.strictObject({
    uid: Uid.optional(),
    canonicalUri: z.string().min(1).max(2000),
    title: z.string().max(600).optional(),
    sourceKind: z.string().min(1).max(60),
    properties: PropertyMap.default({}),
  }),
  snapshot: z
    .strictObject({
      uid: Uid.optional(),
      observedAt: Timestamp,
      retrievedAt: Timestamp.optional(),
      contentHash: z.string().max(200).optional(),
      contentHashBasis: z.string().max(40).optional(),
      captureCompleteness: z.string().max(40).optional(),
      jurisdiction: z.string().max(10).optional(),
      properties: PropertyMap.default({}),
    })
    .optional(),
  locators: z.array(LocatorDeclaration).default([]),
});
export type SourceDeclaration = z.infer<typeof SourceDeclaration>;

/** Evidence = declared locator ref (`loc-1`) or an existing locator uid (`hu:locator:...`). */
export const EvidenceRef = z.union([Ref, Uid]);

// ---------------------------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------------------------

export const IdentifierDeclaration = z.strictObject({
  scheme: z.string().min(1).max(60),
  issuer: z.string().min(1).max(200),
  value: z.string().min(1).max(400),
  normalizationRule: z.string().max(120).optional(),
});
export type IdentifierDeclaration = z.infer<typeof IdentifierDeclaration>;

export const ResolvedSubject = z.strictObject({
  ref: Ref,
  mode: z.literal("resolved"),
  uid: Uid,
  nodeType: TypeName,
});
export const NewSubject = z.strictObject({
  ref: Ref,
  mode: z.literal("new"),
  nodeType: TypeName,
  name: z.string().min(1).max(600),
  /** Opaque uid segment to use; when omitted the planner derives one from the name (`hu:<token>:<slug>`). */
  uidSegment: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._\-/]*$/).max(200).optional(),
  properties: PropertyMap.default({}),
  identifiers: z.array(IdentifierDeclaration).default([]),
  /**
   * What to do when resolution finds an existing node for this subject:
   * review (default) holds the subject for a human/agent decision; use_existing adopts the best match;
   * fail rejects the intent; create_anyway creates a new node (use only when a match is a known different thing).
   */
  onMatch: z.enum(["review", "use_existing", "fail", "create_anyway"]).default("review"),
});
export const Subject = z.discriminatedUnion("mode", [ResolvedSubject, NewSubject]);
export type Subject = z.infer<typeof Subject>;
export type NewSubject = z.infer<typeof NewSubject>;

// ---------------------------------------------------------------------------------------------
// Assertion core (what every source-derived write carries)
// ---------------------------------------------------------------------------------------------

export const AssertionCore = z.strictObject({
  /** Defaults to the relationship type for edge.assert / state.attach. */
  predicate: z.string().max(120).optional(),
  polarity: z.string().max(40).optional(),
  basisKind: z.string().max(60).optional(),
  predicateClass: z.string().max(40).optional(),
  assertionBasis: z.string().max(60).optional(),
  speechAct: z.string().max(40).optional(),
  extractionMethod: z.string().max(200).optional(),
  extractionConfidence: z.number().min(0).max(1).optional(),
  jurisdiction: z.string().max(10).optional(),
  statedTense: z.string().max(20).optional(),
  segmentKind: z.string().max(40).optional(),
  validity: Validity.default({}),
  /** Optional opaque uid segment for the Assertion node; otherwise derived deterministically from the proposal. */
  uidSegment: z.string().max(200).optional(),
});
export type AssertionCore = z.infer<typeof AssertionCore>;

// ---------------------------------------------------------------------------------------------
// Proposals
// ---------------------------------------------------------------------------------------------

const proposalBase = {
  proposalId: Ref,
  rationale: z.string().max(2000).optional(),
  /** Locator refs/uids that support the proposal. Required for every source-derived write. */
  evidence: z.array(EvidenceRef).default([]),
  dependsOn: z.array(Ref).default([]),
};

export const Proposal = z.discriminatedUnion("kind", [
  // "Subject S exists (create if new) and has these properties."  Property names are validated against the schema.
  z.strictObject({ ...proposalBase, kind: z.literal("node.upsert"), subjectRef: Ref, properties: PropertyMap.default({}) }),
  // "S is identified by <scheme>:<value> issued by <issuer>" -> Identifier node + HAS_IDENTIFIER edge.
  z.strictObject({ ...proposalBase, kind: z.literal("identifier.attach"), subjectRef: Ref, identifier: IdentifierDeclaration }),
  // "A -[TYPE]-> B according to <locators>" for an asserted relationship class: creates the Assertion and the edge episode.
  z.strictObject({
    ...proposalBase,
    kind: z.literal("edge.assert"),
    relationshipType: RelationshipType,
    fromRef: Ref,
    toRef: Ref,
    assertion: AssertionCore.default({ validity: {} }),
    edgeProperties: PropertyMap.default({}),
    /** Subject ref of the asserter (Person / Organization / Agent). Defaults to the executor agent. */
    asserterRef: Ref.optional(),
  }),
  // "A -[TYPE]-> B" for a structural relationship class (curated reference links, containment, provenance plumbing).
  z.strictObject({
    ...proposalBase,
    kind: z.literal("edge.structural"),
    relationshipType: RelationshipType,
    fromRef: Ref,
    toRef: Ref,
    properties: PropertyMap.default({}),
  }),
  // "S <predicate> = <value>" with no object node (quantities, attributes stated by a source).
  z.strictObject({
    ...proposalBase,
    kind: z.literal("assertion.literal"),
    subjectRef: Ref,
    predicate: z.string().min(1).max(120),
    valueString: z.string().max(4000).optional(),
    valueNumber: z.number().optional(),
    valueBoolean: z.boolean().optional(),
    unitCode: z.string().max(40).optional(),
    quantityBasis: z.string().max(60).optional(),
    massBasis: z.string().max(40).optional(),
    amountReferent: z.string().max(60).optional(),
    assertion: AssertionCore.default({ validity: {} }),
    asserterRef: Ref.optional(),
  }),
  // "S has state V (a VersionedState node) from/until" -> one StateEpisodeProperties episode plus its Assertion.
  z.strictObject({
    ...proposalBase,
    kind: z.literal("state.attach"),
    subjectRef: Ref,
    stateRef: Ref,
    relationshipType: RelationshipType.default("HAS_STATE"),
    assertion: AssertionCore.default({ validity: {} }),
    edgeProperties: PropertyMap.default({}),
  }),
  // Close an episode (write recordedTo once). Never deletes.
  z.strictObject({
    ...proposalBase,
    kind: z.literal("edge.close"),
    relationshipUid: z.string().min(1).max(300),
    reason: z.string().min(1).max(600),
  }),
  // "I found <surfaceForm> at <locator> but cannot resolve or place it" -> Mention node under the locator.
  z.strictObject({
    ...proposalBase,
    kind: z.literal("mention.stage"),
    locatorRef: EvidenceRef,
    surfaceForm: z.string().min(1).max(600),
    candidateNodeType: TypeName.optional(),
    reason: z.string().min(1).max(600),
    context: z.string().max(2000).optional(),
  }),
]);
export type Proposal = z.infer<typeof Proposal>;
export type ProposalKind = Proposal["kind"];

// ---------------------------------------------------------------------------------------------
// Intent
// ---------------------------------------------------------------------------------------------

export const Precondition = z.strictObject({
  uid: Uid,
  /** `null` means "must not exist". A string is the updatedAt observed in the read snapshot. */
  expectedUpdatedAt: z.string().nullable(),
});
export type Precondition = z.infer<typeof Precondition>;

export const IngestionIntent = z.strictObject({
  schemaVersion: z.literal(INTENT_VERSION),
  intentId: Ref,
  context: z.strictObject({
    actor: Actor,
    run: RunContext,
    correlationId: z.string().max(200).optional(),
    activityKind: z.string().max(40).default("EXTRACTION"),
  }),
  /** Pin of the schema the author navigated; the planner rejects a mismatch with the executor's pinned schema. */
  schemaDigest: Digest.optional(),
  inputSnapshot: z.strictObject({ snapshotId: z.string(), snapshotDigest: Digest }).optional(),
  preconditions: z.array(Precondition).default([]),
  onStale: z.enum(["fail", "proceed"]).default("fail"),
  defaults: z
    .strictObject({
      privacyClass: z.enum(["PUBLIC", "INTERNAL"]).default("PUBLIC"),
      maturity: z.string().max(20).default("PROVISIONAL"),
      schemaVersion: z.string().max(20).default("0.2.0"),
    })
    .default({ privacyClass: "PUBLIC", maturity: "PROVISIONAL", schemaVersion: "0.2.0" }),
  sources: z.array(SourceDeclaration).default([]),
  subjects: z.array(Subject).default([]),
  proposals: z.array(Proposal).min(1).max(200),
  notes: z.string().max(4000).optional(),
});
export type IngestionIntent = z.infer<typeof IngestionIntent>;
export type IngestionIntentInput = z.input<typeof IngestionIntent>;

// ---------------------------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------------------------

export const SubjectDisposition = z.enum(["use_existing", "create", "review_required", "conflict", "missing"]);
export const ProposalDisposition = z.enum(["admitted", "no_op_duplicate", "review_required", "held", "rejected"]);
export const PlanOutcome = z.enum(["applicable", "partial", "noop", "rejected"]);

export const SubjectMatch = z.strictObject({
  uid: Uid,
  nodeType: z.string(),
  name: z.string().nullable(),
  basis: z.enum(["uid", "identifier", "name_exact", "alias", "fulltext"]),
  score: z.number(),
});

export const SubjectPlan = z.strictObject({
  ref: Ref,
  nodeType: TypeName,
  disposition: SubjectDisposition,
  uid: Uid.nullable(),
  labels: z.array(z.string()),
  matches: z.array(SubjectMatch).default([]),
  reasons: z.array(z.string()).default([]),
});
export type SubjectPlan = z.infer<typeof SubjectPlan>;

export const PlannedStatement = z.strictObject({
  id: z.string(),
  proposalId: Ref.optional(),
  purpose: z.string(),
  cypher: z.string(),
  params: z.record(z.string(), JsonValue),
});
export type PlannedStatement = z.infer<typeof PlannedStatement>;

export const Rewrite = z.strictObject({ field: z.string(), from: JsonValue, to: JsonValue, reason: z.string() });

export const ProposalPlan = z.strictObject({
  proposalId: Ref,
  kind: z.string(),
  disposition: ProposalDisposition,
  reasons: z.array(z.string()).default([]),
  rewrites: z.array(Rewrite).default([]),
  /** Uids this proposal will mint (assertion, relationship, identifier, mention). */
  mints: z.record(z.string(), z.string()).default({}),
  statementIds: z.array(z.string()).default([]),
});
export type ProposalPlan = z.infer<typeof ProposalPlan>;

export const PlanError = z.strictObject({ code: z.string(), message: z.string(), details: JsonValue.optional() });

export const IngestionPlan = z.strictObject({
  schemaVersion: z.literal(PLAN_VERSION),
  planId: z.string(),
  intentId: Ref,
  intentDigest: Digest,
  schemaDigest: Digest,
  plannedAt: Timestamp,
  executorVersion: z.string(),
  outcome: PlanOutcome,
  activity: z.strictObject({ uid: Uid, agentUid: Uid, externalRunSystem: z.string(), externalRunId: z.string() }),
  sources: z.array(
    z.strictObject({
      ref: Ref,
      sourceUid: Uid,
      snapshotUid: Uid.nullable(),
      locators: z.array(z.strictObject({ ref: Ref, uid: Uid })),
    }),
  ),
  subjects: z.array(SubjectPlan),
  proposals: z.array(ProposalPlan),
  preconditions: z.array(
    z.strictObject({ uid: Uid, expectedUpdatedAt: z.string().nullable(), observedUpdatedAt: z.string().nullable(), status: z.enum(["ok", "stale", "missing", "unexpected"]) }),
  ),
  statements: z.array(PlannedStatement),
  errors: z.array(PlanError),
  planDigest: Digest,
});
export type IngestionPlan = z.infer<typeof IngestionPlan>;

// ---------------------------------------------------------------------------------------------
// Receipt
// ---------------------------------------------------------------------------------------------

export const ReceiptOutcome = z.enum(["applied", "noop", "partial", "rejected", "failed", "duplicate"]);

export const ProposalReceipt = z.strictObject({
  proposalId: Ref,
  outcome: z.enum(["applied", "noop", "held", "rejected", "failed", "skipped"]),
  created: z.strictObject({ nodes: z.array(z.string()).default([]), relationships: z.array(z.string()).default([]) }).default({ nodes: [], relationships: [] }),
  reason: z.string().optional(),
});

export const IngestionReceipt = z.strictObject({
  schemaVersion: z.literal(RECEIPT_VERSION),
  receiptId: z.string(),
  intentId: Ref,
  intentDigest: Digest,
  planId: z.string(),
  planDigest: Digest,
  outcome: ReceiptOutcome,
  duplicateOf: z.string().nullable(),
  executedAt: Timestamp,
  executorVersion: z.string(),
  database: z.string(),
  markerUid: z.string(),
  activityUid: Uid.nullable(),
  counters: CypherCounters.nullable(),
  proposals: z.array(ProposalReceipt),
  subjects: z.array(z.strictObject({ ref: Ref, uid: Uid.nullable(), created: z.boolean() })),
  affected: z.array(TouchedNode),
  failure: PlanError.nullable(),
  verify: z.strictObject({ suggestedReadIntent: ReadIntent }).nullable(),
});
export type IngestionReceipt = z.infer<typeof IngestionReceipt>;
