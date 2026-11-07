/**
 * Workspace v2 contract shapes (S2). These are the exact shapes proposed for `packages/contracts/src/workspace.ts`
 * (owned by the native-executor role, which merges them). Until that merge lands this package exports them so the
 * executor's `/schema/*` routes and MCP `schema_*` tools can validate against one definition.
 *
 * Versions:
 *   bks-schema-workspace.v2   manifest.json (inventory + identities; generatedAt outside the fingerprint)
 *   bks-schema-card.v1        one row of search/index.jsonl (machine authority for filters; front matter is a projection)
 *   bks-schema-slice.v2       slice request (budgeted, evidence-aware) and slice result
 *   biotech-schema-context.v1 advisory schema context artifact (grants no authority)
 */
import { z } from "zod";

const Digest = z.string().regex(/^sha256:[0-9a-f]{64}$/, "digest: sha256:<hex>");
const Timestamp = z.iso.datetime({ offset: true });

export const WORKSPACE_FORMAT_V2 = "bks-schema-workspace.v2" as const;
export const CARD_FORMAT = "bks-schema-card.v1" as const;
export const SLICE_FORMAT_V2 = "bks-schema-slice.v2" as const;
export const SCHEMA_CONTEXT_VERSION = "biotech-schema-context.v1" as const;
export const ADJACENCY_FORMAT = "bks-schema-adjacency.v1" as const;

/** Card kinds (files with front matter) and lookup kinds (index rows that resolve to a card or a migration page). */
export const CardKind = z.enum([
  "node",
  "relationship",
  "edge-properties",
  "interface",
  "union",
  "enum",
  "vocabulary",
  "predicate",
  "assessment",
  "module",
  "domain",
  "task",
  "rule",
  "pattern",
  "question-set",
  "migration",
  // lookup rows (no file of their own; `path` is the page they resolve to)
  "term",
  "question",
  "alias",
  "operational",
]);
export type CardKind = z.infer<typeof CardKind>;
export const LOOKUP_KINDS: readonly CardKind[] = ["term", "question", "alias", "operational"];

/** Id prefix per kind (`node:Product`, `rel:HAS_VARIANT`, `pred:INHIBITS`, ...). */
export const CARD_ID_PREFIX: Record<CardKind, string> = {
  node: "node",
  relationship: "rel",
  "edge-properties": "edge",
  interface: "iface",
  union: "union",
  enum: "enum",
  vocabulary: "vocab",
  predicate: "pred",
  assessment: "asmt",
  module: "mod",
  domain: "dom",
  task: "task",
  rule: "rule",
  pattern: "pattern",
  "question-set": "qset",
  migration: "migration",
  term: "term",
  question: "q",
  alias: "(old v1 id) | legacy",
  operational: "op",
};

/** One row of search/index.jsonl. Filter fields are optional and only present where meaningful for the kind. */
export const CardRecord = z.object({
  id: z.string().min(1),
  kind: CardKind,
  name: z.string().min(1),
  path: z.string().min(1),
  module: z.string().optional(),
  domain: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  tokens: z.array(z.string()).default([]),
  /** Field-level tokens (headings, code spans, link texts, field / type names) — weighted above body tokens. */
  keywords: z.array(z.string()).optional(),
  /** Remaining card body words (lowest search weight). */
  bodyTokens: z.array(z.string()).optional(),
  summary: z.string().default(""),
  /** Present on cards (files with front matter); absent on lookup rows. */
  cardDigest: Digest.optional(),
  capabilities: z.array(z.string()).default([]),
  sourceRefs: z.array(z.string()).default([]),
  // ---- structured filter fields (exact matching; see `bks-schema find`) ----
  properties: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  interfaces: z.array(z.string()).optional(),
  executorOps: z.array(z.string()).optional(),
  proposalKinds: z.array(z.string()).optional(),
  pendingProposalKinds: z.array(z.string()).optional(),
  readOperations: z.array(z.string()).optional(),
  identifierSchemes: z.array(z.string()).optional(),
  uidToken: z.string().optional(),
  archetype: z.string().optional(),
  temporalScope: z.string().optional(),
  relClass: z.string().optional(),
  temporal: z.string().optional(),
  exclusive: z.boolean().optional(),
  from: z.array(z.string()).optional(),
  to: z.array(z.string()).optional(),
  edgePropertyType: z.string().optional(),
  predicateKind: z.string().optional(),
  status: z.string().optional(),
  registrar: z.string().optional(),
  subjectTypes: z.array(z.string()).optional(),
  objectTypes: z.array(z.string()).optional(),
  typedEdge: z.string().optional(),
  questionIds: z.array(z.string()).optional(),
  templateIds: z.array(z.string()).optional(),
  requiredIndexes: z.array(z.string()).optional(),
  migrationKind: z.string().optional(),
  targets: z.array(z.string()).optional(),
  seeAlso: z.array(z.string()).optional(),
});
export type CardRecord = z.infer<typeof CardRecord>;

export const FileEntry = z.strictObject({ sha256: Digest, bytes: z.number().int().nonnegative() });

export const WorkspaceManifestV2 = z.strictObject({
  format: z.literal(WORKSPACE_FORMAT_V2),
  rendererVersion: z.string(),
  /** Frozen generation timestamp (default: the release's createdAt). Outside the fingerprint. */
  generatedAt: Timestamp,
  release: z.strictObject({
    releaseId: z.string(),
    schemaDigest: Digest,
    schemaReleaseDigest: Digest,
    queryCatalogDigest: Digest.optional(),
    irVersion: z.string(),
    /** Repository-relative path of the assembled SDL the workspace was rendered from. */
    sdlPath: z.string(),
    pinnedAt: z.string(),
    source: z.enum(["pinned", "override"]),
  }),
  /** Digests of the release workspace-inputs/*.yaml (v1 name: `sidecars`). */
  workspaceInputs: z.record(z.string(), Digest),
  workspaceFingerprint: Digest,
  fingerprintRule: z.string(),
  counts: z.record(z.string(), z.number().int()),
  layers: z.array(z.strictObject({ depth: z.number().int(), name: z.string(), path: z.string(), purpose: z.string() })),
  entryPoints: z.array(z.string()),
  domains: z.array(z.strictObject({ slug: z.string(), title: z.string(), modules: z.array(z.string()), nodeCount: z.number().int() })),
  modules: z.array(z.strictObject({ id: z.string(), title: z.string(), owner: z.string(), nodeCount: z.number().int() })),
  cardIdPrefixes: z.record(z.string(), z.string()),
  limits: z.strictObject({
    policyVersion: z.string(),
    search: z.strictObject({ defaultLimit: z.number().int(), maxLimit: z.number().int(), maxQueryChars: z.number().int() }),
    traversal: z.strictObject({ defaultDepth: z.number().int(), maxDepth: z.number().int(), maxNodes: z.number().int(), maxArcs: z.number().int() }),
    paths: z.strictObject({ defaultMaxHops: z.number().int(), maxHops: z.number().int(), maxPaths: z.number().int() }),
    slice: z.strictObject({ targetTokens: z.number().int(), estimator: z.string() }),
  }),
  semantic: z.strictObject({ status: z.enum(["not-configured", "available", "unavailable"]), generationId: z.string().nullable(), note: z.string() }),
  /** compatibility.json capabilities of the release (v2.0.1+), when present. */
  compatibility: z.record(z.string(), z.strictObject({ status: z.string(), reason: z.string() })).optional(),
  contracts: z.record(z.string(), z.string()),
  /** Every generated file except manifest.json itself. */
  inventory: z.record(z.string(), FileEntry),
});
export type WorkspaceManifestV2 = z.infer<typeof WorkspaceManifestV2>;

/** Budgeted, evidence-aware slice request (v1 SliceRequest fields kept; v2 fields optional). */
export const SliceRequestV2 = z.strictObject({
  intent: z.string().max(500).optional(),
  nodeTypes: z.array(z.string()).default([]),
  relationshipTypes: z.array(z.string()).default([]),
  domains: z.array(z.string()).default([]),
  /** v1 name for modules (K, D1..D13); old W## ids resolve through aliases. */
  fragments: z.array(z.string()).default([]),
  modules: z.array(z.string()).default([]),
  tasks: z.array(z.string()).default([]),
  questions: z.array(z.string()).default([]),
  predicates: z.array(z.string()).default([]),
  endpointDepth: z.number().int().min(0).max(5).default(1),
  includeSdl: z.boolean().default(true),
  /** Context budget (estimated tokens). Default policy 12,000; callers may request a larger admitted budget. */
  maxTokens: z.number().int().min(1000).max(200_000).default(12_000),
  /** `write` retains identity/admission rules regardless of budget; `auto` infers it from the tasks' proposal kinds. */
  purpose: z.enum(["auto", "read", "write"]).default("auto"),
});
export type SliceRequestV2 = z.infer<typeof SliceRequestV2>;

export const SchemaContextSelected = z.strictObject({
  cardId: z.string(),
  cardDigest: Digest.optional(),
  path: z.string(),
  sections: z.array(z.string()).default([]),
  reason: z.string(),
});

/** biotech-schema-context.v1: advisory planning context. It informs planning and grants no authority. */
export const SchemaContext = z.strictObject({
  schemaVersion: z.literal(SCHEMA_CONTEXT_VERSION),
  contextId: Digest,
  advisory: z.literal(true),
  grantsAuthority: z.literal(false),
  producer: z.strictObject({ tool: z.string(), version: z.string() }),
  release: z.strictObject({
    releaseId: z.string(),
    schemaDigest: Digest,
    schemaReleaseDigest: Digest,
    workspaceFingerprint: Digest,
    queryCatalogDigest: Digest.optional(),
  }),
  intent: z.string().optional(),
  taskIds: z.array(z.string()),
  questionIds: z.array(z.string()),
  selected: z.array(SchemaContextSelected),
  decisions: z.strictObject({
    identity: z.array(z.strictObject({ type: z.string(), uidToken: z.string().nullable(), rule: z.array(z.string()), identifierSchemes: z.array(z.string()), executorOps: z.array(z.string()) })),
    predicates: z.array(z.strictObject({ name: z.string(), kind: z.string(), status: z.string(), route: z.enum(["typed-edge", "assertion-only", "literal", "field", "computation", "alias", "retired"]), typedEdge: z.string().nullable() })),
    temporal: z.array(z.strictObject({ element: z.string(), temporal: z.string(), exclusive: z.boolean(), scope: z.string().nullable() })),
  }),
  route: z.strictObject({
    operation: z.enum(["navigation", "read", "write", "read+write"]),
    readOperations: z.array(z.string()),
    proposalKinds: z.array(z.string()),
    pendingProposalKinds: z.array(z.string()),
    patternTemplates: z.array(z.string()),
  }),
  scope: z.strictObject({ modules: z.array(z.string()), domains: z.array(z.string()), nodeTypes: z.array(z.string()), relationshipTypes: z.array(z.string()) }),
  omissions: z.array(z.strictObject({ element: z.string(), reason: z.string() })),
  unresolved: z.array(z.string()),
  budget: z.strictObject({ maxTokens: z.number().int(), estimatedTokens: z.number().int(), exceeded: z.boolean(), estimator: z.string() }).optional(),
});
export type SchemaContext = z.infer<typeof SchemaContext>;
