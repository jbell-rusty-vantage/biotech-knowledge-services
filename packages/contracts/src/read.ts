import { z } from "zod";
import {
  Actor,
  Digest,
  JsonValue,
  PropertyName,
  Ref,
  RelationshipType,
  RunContext,
  Timestamp,
  TypeName,
  Uid,
} from "./common.js";

export const READ_INTENT_VERSION = "biotech-knowledge-read-intent.v1" as const;
export const READ_SNAPSHOT_VERSION = "biotech-knowledge-read-snapshot.v1" as const;

export const IdentifierMention = z.strictObject({
  scheme: z.string().min(1).max(60),
  value: z.string().min(1).max(400),
  issuer: z.string().max(200).optional(),
});
export type IdentifierMention = z.infer<typeof IdentifierMention>;

export const Mention = z.strictObject({
  mentionId: Ref,
  nodeType: TypeName.optional(),
  uid: Uid.optional(),
  name: z.string().max(400).optional(),
  aliases: z.array(z.string().max(400)).default([]),
  identifiers: z.array(IdentifierMention).default([]),
});
export type Mention = z.infer<typeof Mention>;

const opBase = { opId: Ref, purpose: z.string().max(500).optional() };

export const ReadOperation = z.discriminatedUnion("kind", [
  // Identity resolution: which existing nodes match these mentions? Basis order: uid > identifier > exact name/alias > fulltext.
  z.strictObject({
    ...opBase,
    kind: z.literal("node.resolve"),
    mentions: z.array(Mention).min(1).max(50),
    limitPerMention: z.number().int().min(1).max(25).default(5),
  }),
  // One node by uid: properties, labels, relationship counts, optionally 1-hop neighbours.
  z.strictObject({
    ...opBase,
    kind: z.literal("node.card"),
    uid: Uid,
    neighbors: z.boolean().default(false),
    neighborLimit: z.number().int().min(1).max(200).default(50),
  }),
  // Fulltext search on one node type (its @fulltext index when it has one; else CONTAINS on name/description).
  z.strictObject({
    ...opBase,
    kind: z.literal("node.search"),
    nodeType: TypeName,
    phrase: z.string().min(1).max(400),
    limit: z.number().int().min(1).max(100).default(10),
  }),
  // Equality-filter listing on one node type.
  z.strictObject({
    ...opBase,
    kind: z.literal("node.list"),
    nodeType: TypeName,
    where: z.record(PropertyName, JsonValue).default({}),
    limit: z.number().int().min(1).max(500).default(50),
  }),
  // Neighbours of a node, optionally restricted by relationship type and direction; edge properties included.
  z.strictObject({
    ...opBase,
    kind: z.literal("node.neighbors"),
    uid: Uid,
    relationshipTypes: z.array(RelationshipType).default([]),
    direction: z.enum(["OUT", "IN", "BOTH"]).default("BOTH"),
    limit: z.number().int().min(1).max(500).default(100),
  }),
  // QS-1: assertion -> subject/object -> locator -> snapshot -> source, plus adjudications reviewed by recordedAsOf.
  z.strictObject({
    ...opBase,
    kind: z.literal("assertion.trace"),
    assertionUids: z.array(Uid).min(1).max(100),
    recordedAsOf: Timestamp.optional(),
  }),
  // Assertions about a node (as subject or object), newest first.
  z.strictObject({
    ...opBase,
    kind: z.literal("assertion.about"),
    uid: Uid,
    predicate: z.string().max(120).optional(),
    limit: z.number().int().min(1).max(200).default(50),
  }),
  // State episodes (HAS_STATE or another StateEpisodeProperties attachment) of a node as of a valid/recorded viewpoint.
  z.strictObject({
    ...opBase,
    kind: z.literal("state.asOf"),
    uid: Uid,
    relationshipType: RelationshipType.default("HAS_STATE"),
    validAt: Timestamp.optional(),
    recordedAsOf: Timestamp.optional(),
  }),
  // Node counts per primary label (cheap orientation).
  z.strictObject({ ...opBase, kind: z.literal("count.byType"), nodeTypes: z.array(TypeName).default([]) }),
  // Relationship counts per type, optionally restricted to one node.
  z.strictObject({ ...opBase, kind: z.literal("count.relationships"), uid: Uid.optional() }),
]);
export type ReadOperation = z.infer<typeof ReadOperation>;
export type ReadOperationKind = ReadOperation["kind"];

export const ReadIntent = z.strictObject({
  schemaVersion: z.literal(READ_INTENT_VERSION),
  intentId: Ref,
  context: z
    .strictObject({ actor: Actor, run: RunContext.optional(), correlationId: z.string().max(200).optional() })
    .optional(),
  operations: z.array(ReadOperation).min(1).max(40),
  limits: z
    .strictObject({
      rowCap: z.number().int().min(1).max(2000).default(200),
      timeoutMs: z.number().int().min(100).max(120_000).default(15_000),
    })
    .default({ rowCap: 200, timeoutMs: 15_000 }),
});
export type ReadIntent = z.infer<typeof ReadIntent>;
export type ReadIntentInput = z.input<typeof ReadIntent>;

export const TouchedNode = z.strictObject({
  uid: Uid,
  labels: z.array(z.string()),
  updatedAt: z.string().nullable(),
});
export type TouchedNode = z.infer<typeof TouchedNode>;

export const ReadOperationResult = z.strictObject({
  opId: Ref,
  kind: z.string(),
  status: z.enum(["ok", "empty", "truncated", "failed", "skipped"]),
  rows: z.array(z.record(z.string(), JsonValue)),
  rowCount: z.number().int(),
  truncated: z.boolean().default(false),
  elapsedMs: z.number().int().optional(),
  error: z.string().optional(),
  cypher: z.string().optional(),
});
export type ReadOperationResult = z.infer<typeof ReadOperationResult>;

/** What a read returned, with the touched set an ingestion intent can pin as preconditions. */
export const ReadSnapshot = z.strictObject({
  schemaVersion: z.literal(READ_SNAPSHOT_VERSION),
  snapshotId: z.string(),
  intentId: Ref,
  intentDigest: Digest,
  schemaDigest: Digest,
  executedAt: Timestamp,
  database: z.string(),
  operations: z.array(ReadOperationResult),
  touched: z.array(TouchedNode),
  snapshotDigest: Digest,
});
export type ReadSnapshot = z.infer<typeof ReadSnapshot>;
