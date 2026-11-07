import { z } from "zod";
import { Actor, Digest, JsonValue, PropertyMap, Ref, RelationshipType, Timestamp, TypeName, Uid } from "./common.js";

/**
 * biotech-knowledge-intent.v2 (SPECIFICATION 7.1, INTERFACES 5, migration-notes 5.5, OD-09).
 *
 * The contract fixes structure only. Every vocabulary value (activity kind, source kind, selector kind, predicate,
 * relationship type, assessment kind, qualifier key) is validated by the planner against the pinned schema release,
 * so a release bump never needs a contract change. Production fields that v1 had and v2 removes: `onStale`,
 * `preconditions` (replaced by `basis`), `defaults.maturity` / `defaults.schemaVersion`, assertion `segmentKind`
 * (now the qualifier `segment:<KIND>`), `predicateClass`, `extractionMethod`, literal `quantityBasis` / `massBasis` /
 * `amountReferent` (now qualifiers), bare-uid evidence (evidence by uid must carry the locator's selectorDigest).
 */
export const INTENT_V2 = "biotech-knowledge-intent.v2" as const;

export const Screaming = z.string().regex(/^[A-Z][A-Z0-9_]*$/, "SCREAMING_SNAKE vocabulary value");
export const Predicate = z.string().regex(/^[A-Z][A-Z0-9_]*$/, "predicate: SCREAMING_SNAKE").max(120);
/** verification.v1 qualifier entry `<name><separator><value>`, separator `:` (kernel) or `=` (registered D7/D8/D13 keys); prefix and value grammar validated by the planner against the release qualifier registry. */
export const Qualifier = z.string().regex(/^[a-z][A-Za-z0-9]*[:=]\S.*$/, "qualifier: name:VALUE or name=VALUE").max(400);
/** Registry id `<tool>/<version>` (FU-06); free text belongs in captureMethodDescription. */
export const CaptureMethodId = z.string().regex(/^[a-z0-9][a-z0-9._-]*\/[A-Za-z0-9._+-]+$/, "captureMethod: <tool-id>/<version>").max(120);
export const EffectKey = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,199}$/, "effectKey: stable semantic effect id");
export const DateOrInstant = z.union([z.iso.date(), Timestamp]);

export const RunContextV2 = z.strictObject({
  /** externalRunSystem: mission-control | ks-verification | projection | manual | bks-local. */
  system: z.string().regex(/^[a-z0-9][a-z0-9.-]{0,59}$/),
  runId: z.string().min(1).max(200),
  missionId: z.string().max(200).optional(),
  activationId: z.string().max(200).optional(),
  attempt: z.number().int().nonnegative().optional(),
  /** Mission Control operation id; appended to Activity.operationIds (P14). */
  operationId: z.string().max(200).optional(),
});
export type RunContextV2 = z.infer<typeof RunContextV2>;

export const IntentContextV2 = z.strictObject({
  actor: Actor,
  run: RunContextV2,
  /** Kernel ActivityKind (P3); no default. */
  activityKind: Screaming,
  /** Activity.operationKind, e.g. knowledge.ingestion_apply. */
  operationKind: z.string().max(120).optional(),
  correlationId: z.string().max(200).optional(),
});

export const ReleasePins = z.strictObject({
  /** The release the author navigated; must equal the executor's pinned release (BKS_RELEASE_MISMATCH otherwise). */
  schemaReleaseDigest: Digest,
  /** Admission policy version the author expects; bound into the plan and the witness. */
  policyVersion: z.string().min(1).max(120),
  workspaceFingerprint: Digest.optional(),
  schemaDigest: Digest.optional(),
});
export type ReleasePins = z.infer<typeof ReleasePins>;

/** Basis of the intent: a custody-verified read snapshot, or an explicit creation-only declaration. */
export const IntentBasis = z.union([
  z.strictObject({
    snapshotRef: z.strictObject({
      /** Custody reference of a persisted read result (S4 read service). */
      ref: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/),
      /** Digest of the retained snapshot bytes. */
      digest: Digest,
    }),
  }),
  z.strictObject({
    creationOnly: z.strictObject({
      /** Why no prior snapshot exists. Creation-only proposals still undergo identity and negative-slot checks. */
      reason: z.string().min(8).max(1000),
      expectAbsent: z.array(Uid).max(500).default([]),
      expectPresent: z.array(Uid).max(500).default([]),
    }),
  }),
]);
export type IntentBasis = z.infer<typeof IntentBasis>;

// ---------------------------------------------------------------------------------------------
// Capture: sources, snapshots, attempts, locators
// ---------------------------------------------------------------------------------------------

export const LocatorDeclarationV2 = z.strictObject({
  ref: Ref,
  /** Optional explicit uid (`hu:locator:...`); identity is (snapshot, selectorKind, selectorDigest) regardless. */
  uid: Uid.optional(),
  selectorKind: Screaming,
  /** Full verification.v1 selector (offset basis, normalization, JSON pointer, table cell, ...). `basis` is mandatory (R-38). */
  selector: z.record(z.string(), JsonValue),
  exact: z.string().max(8000).optional(),
  prefix: z.string().max(400).optional(),
  suffix: z.string().max(400).optional(),
  quoteHash: Digest.optional(),
  startOffset: z.number().int().nonnegative().optional(),
  endOffset: z.number().int().nonnegative().optional(),
  page: z.number().int().positive().optional(),
  mediaStartSeconds: z.number().nonnegative().optional(),
  mediaEndSeconds: z.number().nonnegative().optional(),
  speakerLabelInSource: z.string().max(200).optional(),
  reanchorsLocatorRef: Ref.optional(),
  reanchorsLocatorUid: Uid.optional(),
  reanchorMatch: z.string().max(40).optional(),
  /** Copied to every HAS_EVIDENCE edge that cites this locator. */
  expectedSelectedContentDigest: Digest.optional(),
  /** OD-11: the fields this span reports (`Type.field` or `field`), used to build per-field evidence mappings. */
  reportsFields: z.array(z.string().max(120)).max(50).default([]),
});
export type LocatorDeclarationV2 = z.infer<typeof LocatorDeclarationV2>;

/** EX-03: every capture attempt, including partial and soft failures, with sanitized metadata. Becomes a D11 CaptureAttempt. */
export const CaptureAttemptDeclaration = z.strictObject({
  ref: Ref,
  toolId: z.string().min(1).max(120),
  toolVersion: z.string().max(60).optional(),
  outcome: Screaming,
  failureKind: Screaming.optional(),
  httpStatus: z.number().int().min(100).max(599).optional(),
  /** Normalized request URI with credentials and secret query values removed. */
  requestUri: z.string().max(2000).optional(),
  /** Canonical request digest: method, normalized URI, body digest, behavior-affecting non-secret headers. */
  requestDigest: Digest,
  attemptedAt: Timestamp,
  responseHash: Digest.optional(),
  retryAfterSeconds: z.number().int().nonnegative().optional(),
  errorText: z.string().max(2000).optional(),
});
export type CaptureAttemptDeclaration = z.infer<typeof CaptureAttemptDeclaration>;

export const SnapshotDeclarationV2 = z.strictObject({
  uid: Uid.optional(),
  retrievedAt: Timestamp,
  observedAt: Timestamp.optional(),
  publishedAt: DateOrInstant.optional(),
  contentHash: Digest,
  /** RAW_BYTES | CANONICAL_PROJECTION | TOOL_RENDITION | STORED_EXCERPT_TEXT | SYNTHETIC_FIXTURE (R-35). */
  contentHashBasis: Screaming,
  canonicalProjectionHash: Digest.optional(),
  captureMethod: CaptureMethodId.optional(),
  captureMethodDescription: z.string().max(400).optional(),
  captureCompleteness: z.enum(["COMPLETE", "PARTIAL_EXCERPT", "UNKNOWN"]).default("UNKNOWN"),
  storageUri: z.string().max(2000).optional(),
  archiveUri: z.string().max(2000).optional(),
  mimeType: z.string().max(120).optional(),
  language: z.string().max(35).optional(),
  revisionKind: Screaming.optional(),
  revisesSnapshotUid: Uid.optional(),
  revisesSnapshotRef: Ref.optional(),
  /** OD-14 custody of the issuer bytes: content-addressed object digest (raw bytes). */
  custodyArtifactDigest: Digest.optional(),
  /** Capture metadata the graph has no field for; retained in the plan and receipt, never written to the graph. */
  metadata: z.record(z.string(), JsonValue).default({}),
});
export type SnapshotDeclarationV2 = z.infer<typeof SnapshotDeclarationV2>;

export const SourceDeclarationV2 = z.strictObject({
  ref: Ref,
  source: z.strictObject({
    uid: Uid.optional(),
    /** Post-redirect endpoint; normalized by the executor's canonical-URI rule (EX-04) before identity is derived. */
    canonicalUri: z.string().min(1).max(2000),
    title: z.string().max(600).optional(),
    sourceKind: Screaming,
    genre: z.string().max(80).optional(),
    logicalIdentity: z.string().max(400).optional(),
  }),
  snapshot: SnapshotDeclarationV2.optional(),
  captureAttempts: z.array(CaptureAttemptDeclaration).max(50).default([]),
  locators: z.array(LocatorDeclarationV2).max(500).default([]),
});
export type SourceDeclarationV2 = z.infer<typeof SourceDeclarationV2>;

// ---------------------------------------------------------------------------------------------
// Evidence references (by declared ref, or existing locator uid + selector digest)
// ---------------------------------------------------------------------------------------------

export const EvidenceRole = z.enum(["SUPPORTS", "CONTRADICTS", "QUALIFIES", "CONTEXT"]);
export const EvidenceTarget = z.union([
  Ref,
  z.strictObject({ uid: Uid, selectorDigest: Digest }),
]);
export const EvidenceSelector = z.union([
  EvidenceTarget,
  z.strictObject({ locator: EvidenceTarget, role: EvidenceRole.default("SUPPORTS") }),
]);
export type EvidenceSelector = z.infer<typeof EvidenceSelector>;

// ---------------------------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------------------------

export const IdentifierDeclarationV2 = z.strictObject({
  scheme: z.string().regex(/^[A-Z][A-Z0-9_]*$/).max(60),
  issuer: z.string().min(1).max(200),
  value: z.string().min(1).max(400),
  /**
   * Optional (additive, S3 follow-up): the locator(s) that state this identifier. On a subject the plan creates, a
   * declared identifier with evidence and an active scheme is attached in the same plan (Identifier node + asserted
   * HAS_IDENTIFIER, KN-06 / R-42); without evidence it stays a resolution key only (warning IDENTIFIER_NOT_ATTACHED).
   */
  evidence: z.array(EvidenceSelector).max(20).optional(),
});
export type IdentifierDeclarationV2 = z.infer<typeof IdentifierDeclarationV2>;

export const ResolvedSubjectV2 = z.strictObject({ ref: Ref, mode: z.literal("resolved"), uid: Uid, nodeType: TypeName });
export const NewSubjectV2 = z.strictObject({
  ref: Ref,
  mode: z.literal("new"),
  nodeType: TypeName,
  name: z.string().min(1).max(600),
  uidSegment: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._\-/]*$/).max(200).optional(),
  properties: PropertyMap.default({}),
  /** Resolution keys (exact scheme + issuer + normalized value). With `evidence`, a created subject also gets them attached (Identifier + HAS_IDENTIFIER). */
  identifiers: z.array(IdentifierDeclarationV2).max(50).default([]),
  onMatch: z.enum(["review", "use_existing", "fail", "create_anyway"]).default("review"),
});
export const SubjectV2 = z.discriminatedUnion("mode", [ResolvedSubjectV2, NewSubjectV2]);
export type SubjectV2 = z.infer<typeof SubjectV2>;
export type NewSubjectV2 = z.infer<typeof NewSubjectV2>;

// ---------------------------------------------------------------------------------------------
// Assertion core
// ---------------------------------------------------------------------------------------------

export const ValidityV2 = z.strictObject({
  validFrom: Timestamp.nullable().optional(),
  validTo: Timestamp.nullable().optional(),
  validFromPrecision: Screaming.optional(),
  validToPrecision: Screaming.optional(),
  validFromBasis: Screaming.optional(),
  validToBasis: Screaming.optional(),
  validObservedAt: Timestamp.optional(),
  validObservedAtPrecision: Screaming.optional(),
});
export type ValidityV2 = z.infer<typeof ValidityV2>;

/** An Assertion of this intent (by proposal id) or an existing one (by uid). */
export const AssertionRef = z.union([z.strictObject({ proposal: Ref }), z.strictObject({ uid: Uid })]);
export type AssertionRef = z.infer<typeof AssertionRef>;

export const AssertionCoreV2 = z.strictObject({
  /** Required on assertion.relate / assertion.literal; for edge.assert it defaults to the relationship type. */
  predicate: Predicate.optional(),
  /** FIELD | CLAIM | METRIC | RELATIONSHIP | COMPUTATION; defaulted by proposal kind and predicate kind. */
  assertionKind: Screaming.optional(),
  /** Required when assertionKind is CLAIM. */
  claimType: Screaming.optional(),
  polarity: Screaming.optional(),
  speechAct: Screaming.optional(),
  basisKind: Screaming.optional(),
  proposition: z.string().max(4000).optional(),
  qualifiers: z.array(Qualifier).max(40).default([]),
  validity: ValidityV2.default({}),
  extractionConfidence: z.number().min(0).max(1).optional(),
  riskClass: z.enum(["low", "medium", "high", "critical"]).optional(),
  /** Opaque uid segment; otherwise derived from the assertion's identity tuple. */
  uidSegment: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._\-/]*$/).max(200).optional(),
  /** Claim occurrence binding (assertionKind CLAIM): the Claim subject ref of this intent or an existing claim uid. */
  occurrenceOf: z.union([z.strictObject({ claimRef: Ref }), z.strictObject({ claimUid: Uid })]).optional(),
  /** D9 OCCURS_IN: the MediaWork subject ref the occurrence appears in. */
  occursInRef: Ref.optional(),
  /** CALCULATED derivation (derivationRule + DERIVED_FROM inputs) or a retelling's primary occurrence. */
  derivation: z.strictObject({ rule: z.string().max(200).optional(), from: z.array(AssertionRef).min(1).max(100) }).optional(),
  /** Same-asserter supersession (R-23): the older Assertion this one replaces (recordedTo + SUPERSEDED on commit). */
  supersedes: AssertionRef.optional(),
});
export type AssertionCoreV2 = z.infer<typeof AssertionCoreV2>;

// ---------------------------------------------------------------------------------------------
// Proposals
// ---------------------------------------------------------------------------------------------

const base = {
  proposalId: Ref,
  rationale: z.string().max(4000).optional(),
  dependsOn: z.array(Ref).max(100).default([]),
  /** R-22 hold flag: the proposal is recorded as held with this reason and nothing is written for it. */
  hold: z.strictObject({ reason: z.string().min(1).max(2000) }).optional(),
};
const evidenceList = z.array(EvidenceSelector).max(100).default([]);

export const NodeUpsertProposal = z.strictObject({
  ...base,
  kind: z.literal("node.upsert"),
  subjectRef: Ref,
  properties: PropertyMap.default({}),
  /** Default evidence for factual fields (batch mapping, OD-11). */
  evidence: evidenceList,
  /** Per-field evidence: property name -> locators. Each factual field becomes its own FIELD Assertion. */
  fieldEvidence: z.record(z.string(), z.array(EvidenceSelector).min(1).max(20)).default({}),
  asserterRef: Ref.optional(),
});

export const IdentifierAttachProposal = z.strictObject({
  ...base,
  kind: z.literal("identifier.attach"),
  subjectRef: Ref,
  identifier: IdentifierDeclarationV2,
  isPrimary: z.boolean().optional(),
  validity: ValidityV2.default({}),
  evidence: evidenceList,
  asserterRef: Ref.optional(),
  qualifiers: z.array(Qualifier).max(20).default([]),
});

export const EdgeAssertProposal = z.strictObject({
  ...base,
  kind: z.literal("edge.assert"),
  relationshipType: RelationshipType,
  fromRef: Ref,
  toRef: Ref,
  assertion: AssertionCoreV2.default({ qualifiers: [], validity: {} }),
  /** Author-settable fields of the edge-property profile (roleKind, stakePercent, ...). Executor fields are refused. */
  edgeProperties: PropertyMap.default({}),
  /** Typed values stated on the authorizing assertion (D12: values on edge.assert). */
  value: z.strictObject({ valueString: z.string().max(4000).optional(), valueNumber: z.number().optional(), valueBoolean: z.boolean().optional(), unitCode: z.string().max(60).optional() }).optional(),
  evidence: evidenceList,
  asserterRef: Ref.optional(),
});

/** Predicate-only relation with an object node and no typed edge (R-40). */
export const AssertionRelateProposal = z.strictObject({
  ...base,
  kind: z.literal("assertion.relate"),
  subjectRef: Ref,
  objectRef: Ref,
  assertion: AssertionCoreV2.extend({ predicate: Predicate }),
  value: z.strictObject({ valueString: z.string().max(4000).optional(), valueNumber: z.number().optional(), valueBoolean: z.boolean().optional(), unitCode: z.string().max(60).optional() }).optional(),
  evidence: evidenceList,
  asserterRef: Ref.optional(),
});

export const AssertionLiteralProposal = z.strictObject({
  ...base,
  kind: z.literal("assertion.literal"),
  subjectRef: Ref,
  assertion: AssertionCoreV2.extend({ predicate: Predicate }),
  value: z.strictObject({ valueString: z.string().max(4000).optional(), valueNumber: z.number().optional(), valueBoolean: z.boolean().optional(), unitCode: z.string().max(60).optional() }).default({}),
  evidence: evidenceList,
  asserterRef: Ref.optional(),
});

export const EdgeStructuralProposal = z.strictObject({
  ...base,
  kind: z.literal("edge.structural"),
  relationshipType: RelationshipType,
  fromRef: Ref,
  toRef: Ref,
  properties: PropertyMap.default({}),
});

export const EdgeCloseProposal = z.strictObject({
  ...base,
  kind: z.literal("edge.close"),
  relationshipUid: z.string().min(1).max(300),
  reason: z.string().min(1).max(600),
  /** Asserter whose episode this is (closing another asserter's episode is refused, R-23). */
  asserterRef: Ref.optional(),
});

export const AssessmentRef = z.union([z.strictObject({ proposal: Ref }), z.strictObject({ uid: Uid })]);

export const AssessmentRecordProposal = z.strictObject({
  ...base,
  kind: z.literal("assessment.record"),
  assessmentKind: Screaming,
  assessmentSubkind: z.string().max(120).optional(),
  /** ASSESSES targets (subject refs): Claim, domain entity, Source or Agent. */
  about: z.array(Ref).min(1).max(50),
  methodVersion: z.string().min(1).max(200),
  /** PROPOSED by default; ACCEPTED needs the assessment.accept grant. */
  status: z.enum(["PROPOSED", "ACCEPTED"]).default("PROPOSED"),
  disposition: Screaming.optional(),
  verdict: Screaming.optional(),
  effectDirection: Screaming.optional(),
  score: z.number().optional(),
  gradeScheme: z.string().max(120).optional(),
  grade: z.string().max(60).optional(),
  certainty: Screaming.optional(),
  conclusionCode: z.string().max(120).optional(),
  /** Registered `<facet>=<value>` codes. */
  facets: z.array(z.string().regex(/^[A-Za-z][A-Za-z0-9.]*=\S.*$/).max(400)).max(50).default([]),
  summary: z.string().max(4000).optional(),
  rationaleText: z.string().max(4000).optional(),
  evidenceCutoffAt: Timestamp.optional(),
  inputs: z.strictObject({ assertions: z.array(AssertionRef).max(200).default([]), assessments: z.array(AssessmentRef).max(100).default([]) }).default({ assertions: [], assessments: [] }),
  evidence: evidenceList,
  supersedesUid: Uid.optional(),
  uidSegment: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._\-/]*$/).max(200).optional(),
});

/** Trusted adjudication delivery: the verdict is hydrated from a sealed verification result in custody, never declared here. */
export const AdjudicationProposal = z.strictObject({
  ...base,
  kind: z.literal("adjudication"),
  verificationRef: z.strictObject({ ref: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/), digest: Digest }),
});

export const ReportItemDeclaration = z.strictObject({
  itemKey: z.string().min(1).max(200),
  itemKind: Screaming,
  sectionKind: Screaming.optional(),
  parentItemKey: z.string().max(200).optional(),
  disposition: Screaming.optional(),
  rank: z.number().int().optional(),
  cellValues: z.array(z.string().max(400)).max(50).optional(),
  reason: z.string().max(2000).optional(),
  about: z.array(Ref).max(20).default([]),
  derivedFrom: z.array(AssertionRef).max(100).default([]),
});

export const ReportPublishProposal = z.strictObject({
  ...base,
  kind: z.literal("report.publish"),
  reportKind: Screaming,
  name: z.string().min(1).max(600),
  skeletonKey: z.string().max(120).optional(),
  policyVersion: z.string().min(1).max(120),
  bodyDigest: Digest,
  bodyUri: z.string().max(2000).optional(),
  ledgerDigest: Digest.optional(),
  bundleDigest: Digest.optional(),
  verdict: Screaming.optional(),
  worldCorrectness: Screaming.optional(),
  policyOutcome: Screaming.optional(),
  citationCompleteness: z.number().min(0).max(1).optional(),
  citationCorrectness: z.number().min(0).max(1).optional(),
  queryDigest: Digest.optional(),
  publishedAt: Timestamp.optional(),
  about: z.array(Ref).max(50).default([]),
  citesAssertions: z.array(AssertionRef).max(500).default([]),
  citesAssessments: z.array(AssessmentRef).max(200).default([]),
  evidence: evidenceList,
  items: z.array(ReportItemDeclaration).max(200).default([]),
  supersedesUid: Uid.optional(),
  uidSegment: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._\-/]*$/).max(200).optional(),
  /** Knowledge Services report revision binding (Report fields of biotech-schema-v2.1.0, R-SV10; additive, optional). */
  reportRevisionRef: z.string().min(1).max(200).optional(),
  reportSchema: z.string().min(1).max(120).optional(),
  reportKindRef: z.string().min(1).max(200).optional(),
  structuredBodyDigest: Digest.optional(),
  supersedesReportRevisionRef: z.string().min(1).max(200).optional(),
  custodyKind: z.string().min(1).max(120).optional(),
});

/** Separately privileged projection writes: derived edges and D10 Associations (projection.write grant). */
export const ProjectionWriteProposal = z.strictObject({
  ...base,
  kind: z.literal("projection.write"),
  projection: z.discriminatedUnion("target", [
    z.strictObject({
      target: z.literal("derived-edge"),
      relationshipType: RelationshipType,
      fromRef: Ref,
      toRef: Ref,
      derivationRule: z.string().min(1).max(200),
      projectionOfAssertion: AssertionRef.optional(),
      derivedFromAssertions: z.array(AssertionRef).max(200).default([]),
      derivedFromAssessments: z.array(AssessmentRef).max(100).default([]),
      score: z.number().optional(),
      properties: PropertyMap.default({}),
    }),
    z.strictObject({
      target: z.literal("association"),
      associationKind: Screaming,
      anchorRef: Ref,
      memberRefs: z.array(Ref).min(1).max(100),
      score: z.number(),
      methodVersion: z.string().min(1).max(200),
      statistic: z.string().max(120).optional(),
      statisticValue: z.number().optional(),
      threshold: z.number().optional(),
      components: z.array(z.string().max(200)).max(50).optional(),
      inputs: z.array(AssertionRef).max(500).default([]),
      inputAssessments: z.array(AssessmentRef).max(100).default([]),
      staleAfter: Timestamp.optional(),
    }),
  ]),
});

/** A surface form at a located span (no Mention node, OD-04): SourceLocator + RESOLUTION Assessment (P8). */
export const MentionStageProposal = z.strictObject({
  ...base,
  kind: z.literal("mention.stage"),
  locator: EvidenceTarget,
  surfaceForm: z.string().min(1).max(600),
  normalizedForm: z.string().max(600).optional(),
  typeHint: TypeName.optional(),
  /** Candidate entities (subject refs); each is ASSESSED by the RESOLUTION Assessment. */
  candidates: z.array(Ref).max(20).default([]),
  score: z.number().optional(),
  reason: z.string().min(1).max(600),
  context: z.string().max(2000).optional(),
});

/** Trusted mission-start lineage (OD-06, P15): Activity ASSESSES its charter subjects; WAS_INFORMED_BY prior runs. */
export const LineageStartProposal = z.strictObject({
  ...base,
  kind: z.literal("lineage.start"),
  about: z.array(Ref).max(50).default([]),
  informedBy: z.array(z.strictObject({ system: z.string().regex(/^[a-z0-9][a-z0-9.-]{0,59}$/), runId: z.string().min(1).max(200) })).max(20).default([]),
});

export const ProposalV2 = z.discriminatedUnion("kind", [
  NodeUpsertProposal,
  IdentifierAttachProposal,
  EdgeAssertProposal,
  AssertionRelateProposal,
  AssertionLiteralProposal,
  EdgeStructuralProposal,
  EdgeCloseProposal,
  AssessmentRecordProposal,
  AdjudicationProposal,
  ReportPublishProposal,
  ProjectionWriteProposal,
  MentionStageProposal,
  LineageStartProposal,
]);
export type ProposalV2 = z.infer<typeof ProposalV2>;
export type ProposalKindV2 = ProposalV2["kind"];
export const PROPOSAL_KINDS_V2 = ProposalV2.options.map((o) => o.shape.kind.value) as ProposalKindV2[];

// ---------------------------------------------------------------------------------------------
// Provenance of a migrated or edited intent (FU-03)
// ---------------------------------------------------------------------------------------------

export const IntentProvenance = z.strictObject({
  derivedFrom: z.strictObject({ schemaVersion: z.string(), path: z.string().max(400).optional(), rawBytesDigest: Digest }).optional(),
  migrator: z.string().max(120).optional(),
  edits: z.array(z.strictObject({ at: z.string().max(400), rule: z.string().max(120), from: JsonValue.optional(), to: JsonValue.optional(), note: z.string().max(1000).optional() })).max(5000).default([]),
});

// ---------------------------------------------------------------------------------------------
// Intent
// ---------------------------------------------------------------------------------------------

export const MAX_PROPOSALS_PER_INTENT = 500;

export const IngestionIntentV2 = z.strictObject({
  schemaVersion: z.literal(INTENT_V2),
  intentId: Ref,
  pins: ReleasePins,
  context: IntentContextV2,
  basis: IntentBasis,
  defaults: z.strictObject({ privacyClass: z.enum(["PUBLIC", "INTERNAL"]).default("PUBLIC") }).default({ privacyClass: "PUBLIC" }),
  sources: z.array(SourceDeclarationV2).max(200).default([]),
  subjects: z.array(SubjectV2).max(1000).default([]),
  proposals: z.array(ProposalV2).min(1).max(MAX_PROPOSALS_PER_INTENT),
  /** Free text for humans; never interpreted (no notes-only semantics). */
  notes: z.string().max(8000).optional(),
  provenance: IntentProvenance.optional(),
});
export type IngestionIntentV2 = z.infer<typeof IngestionIntentV2>;
export type IngestionIntentV2Input = z.input<typeof IngestionIntentV2>;

/** Semantic sets of the intent's canonical digest profile (order is meaningless; everything else is a sequence). */
export const INTENT_V2_DIGEST_PROFILE = {
  sets: [
    "proposals[].dependsOn",
    "proposals[].assertion.qualifiers",
    "proposals[].qualifiers",
    "proposals[].facets",
    "basis.creationOnly.expectAbsent",
    "basis.creationOnly.expectPresent",
    "sources[].locators[].reportsFields",
  ],
};
