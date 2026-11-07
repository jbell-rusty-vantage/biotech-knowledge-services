import { z } from "zod";
import { Digest, JsonValue, PropertyName, RelationshipType, Timestamp, TypeName, Uid } from "./common.js";
import { ConsistencyMode, ReadResultStatus } from "./custody.js";

/**
 * Native read contracts (S4; merged into @bks/contracts by S3, patch P-1). Formerly packages/kg-ops/src/read/contracts.ts,
 * which now re-exports this module. The executor, the Python client and the JSON Schema export import it from
 * @bks/contracts.
 *
 *   biotech-knowledge-read-intent.v2   typed operations (resolve | card | list | neighbors | assertion | evidence |
 *                                      history | report | association | status)
 *   biotech-cypher-read-intent.v1      one parameterized Cypher 5 statement, or one release catalog template by id
 *   biotech-knowledge-read-result.v2   status + typed reasons, rows in bks-read-values.v1, consistency, digest triple
 *
 * Common fields (SPECIFICATION 6.1): contract version, intentId, schema release / workspace / query-catalog pins,
 * purpose, optional question ids and context artifact, authorized binding reference, input artifact refs, limits and
 * consistency. The effective actor, application, tenant and database grants are derived by the service from the
 * authenticated principal; nothing in an artifact names a URI, credential or provider configuration.
 */

export const READ_INTENT_V2 = "biotech-knowledge-read-intent.v2" as const;
export const CYPHER_READ_INTENT_V1 = "biotech-cypher-read-intent.v1" as const;
export const READ_RESULT_V2 = "biotech-knowledge-read-result.v2" as const;
export const READ_EXPLAIN_V1 = "biotech-cypher-read-explain.v1" as const;
/** Value serialization of every row value in a read result (see read/values.ts). */
export const READ_VALUES_V1 = "bks-read-values.v1" as const;

/** Hard ceilings: a request may lower these, never raise them (SPECIFICATION 6.2 bounds). */
export const READ_CEILINGS = {
  rowCap: 2000,
  byteCap: 4 * 1024 * 1024,
  timeoutMs: 30_000,
  maxDepth: 6,
  listCap: 1000,
  nestingCap: 8,
} as const;

export const READ_DEFAULT_LIMITS = { rowCap: 100, byteCap: 1024 * 1024, timeoutMs: 10_000, maxDepth: 4, listCap: 200, nestingCap: 6 } as const;

export const ReadLimits = z.strictObject({
  rowCap: z.number().int().min(1).max(READ_CEILINGS.rowCap).default(READ_DEFAULT_LIMITS.rowCap),
  byteCap: z.number().int().min(1024).max(READ_CEILINGS.byteCap).default(READ_DEFAULT_LIMITS.byteCap),
  timeoutMs: z.number().int().min(100).max(READ_CEILINGS.timeoutMs).default(READ_DEFAULT_LIMITS.timeoutMs),
  maxDepth: z.number().int().min(1).max(READ_CEILINGS.maxDepth).default(READ_DEFAULT_LIMITS.maxDepth),
  listCap: z.number().int().min(1).max(READ_CEILINGS.listCap).default(READ_DEFAULT_LIMITS.listCap),
  nestingCap: z.number().int().min(1).max(READ_CEILINGS.nestingCap).default(READ_DEFAULT_LIMITS.nestingCap),
});
export type ReadLimits = z.infer<typeof ReadLimits>;
const limitsDefault = () => ReadLimits.parse({});

export const ReadConsistency = z.strictObject({
  mode: ConsistencyMode.default("observed"),
  /** Causal bookmarks of prior effects the read must observe (e.g. from an apply receipt). Not a historical snapshot. */
  bookmarks: z.array(z.string().min(1).max(500)).max(32).default([]),
  /** stable_revision: attempts before BKS_STALE_REVISION (each attempt starts with empty accumulators). */
  maxAttempts: z.number().int().min(1).max(5).default(3),
});
export type ReadConsistency = z.infer<typeof ReadConsistency>;

export const ArtifactRef = z.strictObject({ ref: z.string().min(1).max(200), digest: Digest });

export const ReadPins = z.strictObject({
  schemaReleaseDigest: Digest,
  workspaceFingerprint: Digest.optional(),
  queryCatalogDigest: Digest.optional(),
});

const common = {
  intentId: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,119}$/),
  pins: ReadPins,
  purpose: z.string().min(1).max(1000),
  questionIds: z.array(z.string().regex(/^[A-Z][A-Za-z0-9.#-]{1,40}$/)).max(50).default([]),
  contextArtifact: ArtifactRef.optional(),
  /** Authorized binding reference (a service-configured read binding the principal may use); default: the principal's default binding. */
  bindingRef: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,63}$/).optional(),
  inputArtifacts: z.array(ArtifactRef).max(50).default([]),
  limits: ReadLimits.default(limitsDefault),
  consistency: ReadConsistency.default(() => ReadConsistency.parse({})),
  /** Persist the result in snapshot custody (SnapshotCustody.put) so an ingestion intent can cite it as basis.snapshotRef. */
  persistSnapshot: z.boolean().default(false),
};

// ---------------------------------------------------------------------------------------------------------------
// Typed operations (biotech-knowledge-read-intent.v2)
// ---------------------------------------------------------------------------------------------------------------

const OpId = z.string().regex(/^[a-z0-9][a-z0-9._-]{0,63}$/);
/** Temporal view: recorded-time ("what the graph knew as of") and valid-time ("true in the world at") are independent. */
export const TemporalView = z.strictObject({ recordedAsOf: Timestamp.optional(), validAt: Timestamp.optional() });
const view = { view: TemporalView.default({}) };

export const IdentifierRef = z.strictObject({ scheme: z.string().min(1).max(60), value: z.string().min(1).max(400), issuer: z.string().max(200).optional() });

export const TypedOperation = z.discriminatedUnion("op", [
  /** Identity resolution: uid > identifier (scheme, issuer, normalized value; open HAS_IDENTIFIER episode) > exact name; fulltext only as candidates. */
  z.strictObject({
    opId: OpId,
    op: z.literal("resolve"),
    mentions: z.array(z.strictObject({ mentionId: OpId, nodeType: TypeName.optional(), uid: Uid.optional(), name: z.string().max(400).optional(), identifiers: z.array(IdentifierRef).max(20).default([]) })).min(1).max(50),
    limitPerMention: z.number().int().min(1).max(25).default(5),
    /** KN-07 identifier chain: also return every other open identifier of each matched subject. */
    identifierChain: z.boolean().default(true),
  }),
  /** One node: projected release properties (property policy applies), identifiers, visible relationship counts. */
  z.strictObject({ opId: OpId, op: z.literal("card"), uid: Uid, neighborLimit: z.number().int().min(0).max(200).default(0), ...view }),
  /** Equality-filtered listing of one node type, ordered by uid, keyset-paginated. */
  z.strictObject({ opId: OpId, op: z.literal("list"), nodeType: TypeName, where: z.record(PropertyName, JsonValue).default({}), after: Uid.optional(), limit: z.number().int().min(1).max(500).default(50) }),
  /** Neighbours over release relationship types; asserted episodes filtered by the temporal view. */
  z.strictObject({ opId: OpId, op: z.literal("neighbors"), uid: Uid, relationshipTypes: z.array(RelationshipType).max(30).default([]), direction: z.enum(["OUT", "IN", "BOTH"]).default("BOTH"), limit: z.number().int().min(1).max(500).default(100), ...view }),
  /** Assertions by uid, or about a subject (optionally by predicate; predicate-only facts live here, not on typed edges). */
  z.strictObject({
    opId: OpId,
    op: z.literal("assertion"),
    assertionUids: z.array(Uid).max(100).default([]),
    about: z.strictObject({ uid: Uid, role: z.enum(["SUBJECT", "OBJECT", "EITHER"]).default("EITHER"), predicate: z.string().regex(/^[A-Z][A-Z0-9_]*$/).optional() }).optional(),
    includeSuperseded: z.boolean().default(false),
    limit: z.number().int().min(1).max(200).default(50),
    ...view,
  }),
  /** Evidence trace of one record (Assertion, Adjudication, Assessment, Report): HAS_EVIDENCE {role, origin} -> SourceLocator -> SourceSnapshot <- Source. */
  z.strictObject({ opId: OpId, op: z.literal("evidence"), uid: Uid, limit: z.number().int().min(1).max(200).default(50) }),
  /** Versioned-state history: every episode (open and closed) of one relationship type from a node, plus supersession chains. */
  z.strictObject({ opId: OpId, op: z.literal("history"), uid: Uid, relationshipType: RelationshipType, limit: z.number().int().min(1).max(200).default(50), ...view }),
  /** A published Report: about, cited assertions/assessments, quoted locators, composing Activity, ledger digest (KN-11). */
  z.strictObject({ opId: OpId, op: z.literal("report"), reportUid: Uid }),
  /** D10 Associations anchored on an entity, with members and inputs; optional ontology expansion (MD-D2-03). */
  z.strictObject({ opId: OpId, op: z.literal("association"), anchorUid: Uid, expansion: z.strictObject({ ontology: z.literal("MONDO"), artifact: ArtifactRef.optional() }).optional(), limit: z.number().int().min(1).max(200).default(50) }),
  /** Status records of a subject with the release status non-implication policy (MD-D10-05) attached. */
  z.strictObject({ opId: OpId, op: z.literal("status"), uid: Uid, limit: z.number().int().min(1).max(200).default(50), ...view }),
]);
export type TypedOperation = z.infer<typeof TypedOperation>;

export const ReadIntentV2 = z.strictObject({
  schemaVersion: z.literal(READ_INTENT_V2),
  ...common,
  operations: z.array(TypedOperation).min(1).max(20),
});
export type ReadIntentV2 = z.infer<typeof ReadIntentV2>;
export type ReadIntentV2Input = z.input<typeof ReadIntentV2>;

// ---------------------------------------------------------------------------------------------------------------
// Cypher read artifacts (biotech-cypher-read-intent.v1)
// ---------------------------------------------------------------------------------------------------------------

/** A JSON-Schema-like parameter declaration; `neo4jType` binds an ISO string as a driver temporal value. */
export const ParameterSchema: z.ZodType<{ type: "string" | "integer" | "number" | "boolean" | "array" | "object" | "null"; items?: unknown; pattern?: string; enum?: unknown[]; neo4jType?: "DateTime" | "Date" | "Duration" | "LocalDateTime"; maxItems?: number; maxLength?: number }> = z.lazy(() =>
  z.object({
    type: z.enum(["string", "integer", "number", "boolean", "array", "object", "null"]),
    items: ParameterSchema.optional(),
    pattern: z.string().max(400).optional(),
    enum: z.array(JsonValue).max(200).optional(),
    neo4jType: z.enum(["DateTime", "Date", "Duration", "LocalDateTime"]).optional(),
    maxItems: z.number().int().min(0).max(5000).optional(),
    maxLength: z.number().int().min(0).max(100_000).optional(),
  }).passthrough(),
) as never;

export const OutputColumn = z.strictObject({ name: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/), type: z.string().max(80).optional(), nullable: z.boolean().default(true) });

export const CypherReadIntentV1 = z
  .strictObject({
    schemaVersion: z.literal(CYPHER_READ_INTENT_V1),
    ...common,
    language: z.literal("CYPHER_5").default("CYPHER_5"),
    /** One Cypher 5 statement (UTF-8). Exactly one of `statement` or `template`. */
    statement: z.string().min(1).max(20_000).optional(),
    /** sha256 of the exact UTF-8 statement bytes; when given it must match (BKS_PARSE_REJECTED otherwise). */
    statementDigest: Digest.optional(),
    /** A release catalog template (immutable, audited): id plus its statementDigest. */
    template: z.strictObject({ id: z.string().min(1).max(120), statementDigest: Digest }).optional(),
    parameters: z.record(z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/), JsonValue).default({}),
    /** Declared parameter types; required for every `$param` of an ad hoc statement; templates carry their own. */
    parameterSchema: z.record(z.string(), ParameterSchema).default({}),
    /** Declared output columns (exact order) or a result schema reference. */
    resultSchema: z.strictObject({ columns: z.array(OutputColumn).min(1).max(100) }).optional(),
    resultSchemaRef: z.string().max(200).optional(),
    /** Permitted scope: labels / relationship types / procedures this statement may use (subset of the release and the service allowlist). */
    scope: z.strictObject({ labels: z.array(TypeName).max(80).default([]), relationshipTypes: z.array(RelationshipType).max(80).default([]), procedures: z.array(z.string().max(120)).max(5).default([]) }).default({ labels: [], relationshipTypes: [], procedures: [] }),
    /** `statement`: rows are ordered by the statement's final ORDER BY (required); `set`: rows are an unordered set (sorted canonically for the digest). */
    ordering: z.enum(["statement", "set"]).default("set"),
  })
  .superRefine((v, ctx) => {
    if (Boolean(v.statement) === Boolean(v.template)) ctx.addIssue({ code: "custom", message: "exactly one of statement or template is required" });
  });
export type CypherReadIntentV1 = z.infer<typeof CypherReadIntentV1>;
export type CypherReadIntentV1Input = z.input<typeof CypherReadIntentV1>;

// ---------------------------------------------------------------------------------------------------------------
// Result (biotech-knowledge-read-result.v2)
// ---------------------------------------------------------------------------------------------------------------

/** Typed reasons. None of failed/skipped/unsupported/stale/forbidden means absence; `empty` is the only "no record" answer. */
export const ReadReasonCode = z.enum([
  "ROW_CAP",
  "BYTE_CAP",
  "LIST_CAP",
  "NESTING_CAP",
  "TIMEOUT",
  "CONCURRENCY_LIMIT",
  "PARSE_REJECTED",
  "CLAUSE_FORBIDDEN",
  "PROCEDURE_FORBIDDEN",
  "FUNCTION_FORBIDDEN",
  "LABEL_FORBIDDEN",
  "RELATIONSHIP_FORBIDDEN",
  "PROPERTY_FORBIDDEN",
  "FULL_ENTITY_RETURN",
  "UNBOUNDED_PATTERN",
  "VISIBILITY_UNPROVEN",
  "READ_AUTHORITY_UNAVAILABLE",
  "BINDING_FORBIDDEN",
  "RELEASE_MISMATCH",
  "CATALOG_MISMATCH",
  "TEMPLATE_NOT_FOUND",
  "TEMPLATE_UNSUPPORTED",
  "PARAMETER_INVALID",
  "RESULT_SCHEMA_MISMATCH",
  "STALE_REVISION",
  "TRANSIENT_RETRIES_EXHAUSTED",
  "DATABASE_ERROR",
  "DATABASE_FORBIDDEN",
  "ONTOLOGY_ARTIFACT_ABSENT",
  "VECTOR_SEARCH_DISABLED",
  "UNKNOWN_TYPE",
  "NOT_ADJUDICATED",
  "AMBIGUOUS",
]);
export type ReadReasonCode = z.infer<typeof ReadReasonCode>;
export const ReadReason = z.strictObject({ code: ReadReasonCode, message: z.string().max(2000), path: z.string().max(400).optional(), limit: z.number().optional() });
export type ReadReason = z.infer<typeof ReadReason>;

export const Truncation = z.strictObject({ kind: z.enum(["rows", "bytes", "list"]), limit: z.number().int(), path: z.string().max(400).optional() });

export const ReadPart = z.strictObject({
  opId: z.string(),
  op: z.string(),
  status: ReadResultStatus,
  reasons: z.array(ReadReason),
  columns: z.array(z.string()),
  rows: z.array(z.record(z.string(), JsonValue)),
  rowCount: z.number().int(),
  truncations: z.array(Truncation),
  /** Semantic annotations of the operation (status meanings, temporal view, policy versions). */
  annotations: z.record(z.string(), JsonValue).optional(),
});
export type ReadPart = z.infer<typeof ReadPart>;

export const ReadResultV2 = z.strictObject({
  schemaVersion: z.literal(READ_RESULT_V2),
  intentId: z.string(),
  intentKind: z.enum([READ_INTENT_V2, CYPHER_READ_INTENT_V1]),
  status: ReadResultStatus,
  reasons: z.array(ReadReason),
  parts: z.array(ReadPart),
  serialization: z.literal(READ_VALUES_V1),
  ordering: z.enum(["statement", "set", "operation"]),
  pins: z.strictObject({ releaseId: z.string(), schemaReleaseDigest: Digest, schemaDigest: Digest, queryCatalogDigest: Digest, workspaceFingerprint: Digest.nullable() }),
  binding: z.strictObject({ ref: z.string(), scope: z.enum(["public", "internal"]), readAuthority: z.enum(["database-role", "session-routing"]), visibility: z.enum(["database-rbac", "application"]) }),
  consistency: z.strictObject({ mode: ConsistencyMode, graphRevision: z.number().int().nullable(), attempts: z.number().int(), bookmarks: z.array(z.string()), readInterval: z.strictObject({ startedAt: Timestamp, finishedAt: Timestamp }), snapshotClaim: z.boolean() }),
  query: z.strictObject({ statementDigest: Digest.nullable(), templateId: z.string().nullable(), language: z.literal("CYPHER_5") }),
  digests: z.strictObject({ queryDigest: Digest, resultDigest: Digest, receiptDigest: Digest }),
  /** Retained bytes of this result in snapshot custody (only when persisted). */
  snapshot: z.strictObject({ ref: z.string(), bytesDigest: Digest }).nullable(),
  receipt: z.strictObject({ requestId: z.string(), principalId: z.string(), startedAt: Timestamp, finishedAt: Timestamp, elapsedMs: z.number(), attempts: z.number().int(), server: z.strictObject({ agent: z.string().nullable(), edition: z.string().nullable() }), plan: z.record(z.string(), JsonValue).nullable() }),
});
export type ReadResultV2 = z.infer<typeof ReadResultV2>;

export const ExplainResultV1 = z.strictObject({
  schemaVersion: z.literal(READ_EXPLAIN_V1),
  intentId: z.string(),
  accepted: z.boolean(),
  reasons: z.array(ReadReason),
  statementDigest: Digest.nullable(),
  policy: z.record(z.string(), JsonValue),
  plan: z.record(z.string(), JsonValue).nullable(),
  planFlags: z.array(z.string()),
  estimatedRows: z.number().nullable(),
});
export type ExplainResultV1 = z.infer<typeof ExplainResultV1>;

// ---------------------------------------------------------------------------------------------------------------
// Official-use typed reads (biotech-knowledge-read-intent.v3 / biotech-knowledge-read-result.v3, Sprint V SV-11)
// ---------------------------------------------------------------------------------------------------------------

/**
 * v3 = v2 typed operations + the `marker` lookup + a `use` declaration. When `use.officialUse` is true the service
 * revalidates every returned report / assertion that carries a use decision reference against the PostgreSQL authority
 * (Knowledge Services component knowledge_verification): ineligible items are excluded and listed; when the authority
 * is unavailable every eligibility-scoped part is held (status skipped, READ_AUTHORITY_UNAVAILABLE) and nothing is
 * served as eligible. Non-official v3 reads return the v2 rows plus the admission fields of the generating Activity.
 */
export const READ_INTENT_V3 = "biotech-knowledge-read-intent.v3" as const;
export const READ_RESULT_V3 = "biotech-knowledge-read-result.v3" as const;
export const ELIGIBILITY_V1 = "bks-read-eligibility.v1" as const;

export const ReadUse = z.strictObject({
  /** Official / consequential use: revalidate eligibility; authority unavailable holds. */
  officialUse: z.boolean().default(false),
  /** Declared use and audience (recorded; official when officialUse is true or the use name starts with `official.`). */
  useName: z.string().min(1).max(120).optional(),
  audience: z.string().min(1).max(120).optional(),
});
export type ReadUse = z.infer<typeof ReadUse>;

export const MarkerOperation = z
  .strictObject({
    opId: OpId,
    op: z.literal("marker"),
    /** Exactly one selector: the dispatch that applied the effect, the acknowledgment digest, or the effect key. */
    dispatchId: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,199}$/).optional(),
    markerDigest: Digest.optional(),
    effectKey: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,199}$/).optional(),
  })
  .superRefine((v, ctx) => {
    if ([v.dispatchId, v.markerDigest, v.effectKey].filter(Boolean).length !== 1) ctx.addIssue({ code: "custom", message: "marker needs exactly one of dispatchId, markerDigest or effectKey" });
  });
export type MarkerOperation = z.infer<typeof MarkerOperation>;

export const TypedOperationV3 = z.union([TypedOperation, MarkerOperation]);
export type TypedOperationV3 = z.infer<typeof TypedOperationV3>;

export const ReadIntentV3 = z.strictObject({
  schemaVersion: z.literal(READ_INTENT_V3),
  ...common,
  use: ReadUse.default(() => ReadUse.parse({})),
  operations: z.array(TypedOperationV3).min(1).max(20),
});
export type ReadIntentV3 = z.infer<typeof ReadIntentV3>;
export type ReadIntentV3Input = z.input<typeof ReadIntentV3>;

/** Item eligibility (per returned record that an official use depends on). */
export const EligibilityItemState = z.enum(["eligible", "revoked", "stale", "unadmitted", "authority_unavailable"]);
export const EligibilityState = z.enum(["eligible", "revoked", "stale", "authority_unavailable"]);
export type EligibilityState = z.infer<typeof EligibilityState>;

export const EligibilityItem = z.strictObject({
  opId: z.string(),
  /** uid of the returned record (Report or Assertion uid; the marker key for `marker`). */
  recordUid: z.string(),
  useDecisionId: z.string().nullable(),
  useDecisionDigest: Digest.nullable(),
  state: EligibilityItemState,
  served: z.boolean(),
  reason: z.string().max(400).nullable(),
  decisionEpoch: z.number().int().nullable(),
  disposition: z.string().nullable(),
  expiresAt: z.string().nullable(),
});
export type EligibilityItem = z.infer<typeof EligibilityItem>;

export const ReadEligibility = z.strictObject({
  format: z.literal(ELIGIBILITY_V1),
  checkedAt: Timestamp,
  /** current_revocation_epoch(tenant) observed during the check; null when the authority was unavailable. */
  authoritativeEpoch: z.number().int().nullable(),
  /** Lowest decision epoch among the checked decisions (null when none was found). */
  decisionEpoch: z.number().int().nullable(),
  state: EligibilityState,
  authority: z.strictObject({ component: z.literal("knowledge_verification"), available: z.boolean(), tenantId: z.string().nullable(), detail: z.string().max(400).nullable() }),
  items: z.array(EligibilityItem),
  excluded: z.number().int().nonnegative(),
  held: z.number().int().nonnegative(),
});
export type ReadEligibility = z.infer<typeof ReadEligibility>;

export const ReadReasonCodeV3 = z.enum([...ReadReasonCode.options, "USE_INELIGIBLE", "USE_UNADMITTED"]);
export const ReadReasonV3 = z.strictObject({ code: ReadReasonCodeV3, message: z.string().max(2000), path: z.string().max(400).optional(), limit: z.number().optional() });
export const ReadPartV3 = ReadPart.extend({ reasons: z.array(ReadReasonV3) });
export type ReadPartV3 = z.infer<typeof ReadPartV3>;

export const ReadResultV3 = ReadResultV2.extend({
  schemaVersion: z.literal(READ_RESULT_V3),
  intentKind: z.literal(READ_INTENT_V3),
  parts: z.array(ReadPartV3),
  use: z.strictObject({ officialUse: z.boolean(), useName: z.string().nullable(), audience: z.string().nullable() }),
  /** Present for official use (null otherwise). */
  eligibility: ReadEligibility.nullable(),
});
export type ReadResultV3 = z.infer<typeof ReadResultV3>;
