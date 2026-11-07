/**
 * Schema IR: the parsed, enriched form of the pinned release SDL (bks-schema-ir.v2).
 * Everything the workspace renderer, the slice builder and the kg-ops planner need is here; none of them re-parse the SDL.
 *
 * v2 (release biotech-schema-v2.0.0) adds module metadata from the release assembly manifest, register-derived fields
 * (executor operations, relationship class, endpoints, temporal/exclusivity scope), the predicate registry, the assessment
 * vocabulary and the qualifier grammar. Every v1 field is kept: `fragments` now holds one entry per module (K, D1..D13),
 * so `fragment` on a definition is its module id.
 */

export type RelationshipClass = "structural" | "asserted" | "derived" | "unknown";
export type Direction = "IN" | "OUT";

/** Executor operations a type admits (node register `mutations.executor`; GraphQL directives grant nothing, OD-03). */
export type ExecutorOp = "create" | "update" | "close" | "delete" | "delete-unreferenced";

/**
 * One assembly module (v2) or SDL fragment (v1 banner). In a release IR `id` is the module id (K, D1..D13) and the
 * membership comes from the assembly manifest, never from banner names.
 */
export interface Fragment {
  /** K, D1 .. D13 (release); W00 .. W23 or SEAM (v1 banner scan). */
  id: string;
  title: string;
  /** Canonical module names (v1 banner) or the module id (v2). */
  modules: string[];
  competencyQuestions: string;
  purpose: string;
  lineStart: number;
  lineEnd: number;
  nodeTypes: string[];
  interfaces: string[];
  edgePropertyTypes: string[];
  enums: string[];
  unions: string[];
}

/** Release module metadata (v2). */
export interface ModuleInfo {
  id: string;
  /** Release-relative module source path, e.g. `sdl/modules/D6.graphql`. */
  file: string;
  title: string;
  owner: string;
  sha256: string;
  lineStart: number;
  lineEnd: number;
  /** Names of every definition the module declares (assembly manifest). */
  definitions: string[];
}

export interface Settable {
  onCreate: boolean;
  onUpdate: boolean;
}

export type PropertyGroup = "identity" | "core" | "temporal" | "search" | "derived" | "operational";

export interface Property {
  name: string;
  /** Printed GraphQL type, e.g. `[String!]!`. */
  type: string;
  namedType: string;
  kind: "scalar" | "enum";
  isList: boolean;
  isRequired: boolean;
  description: string;
  group: PropertyGroup;
  /** Stored property name when @alias is present. */
  storedName: string;
  isId: boolean;
  timestamp: string[] | null;
  settable: Settable;
  /** True when the API never writes it (timestamp, @id, settable false on both). */
  readOnly: boolean;
  line: number;
}

export interface RelationshipField {
  fieldName: string;
  relationshipType: string;
  direction: Direction;
  targetType: string;
  targetKind: "node" | "union" | "interface";
  /** Concrete node types reachable (union members, interface implementers, or the node itself). */
  targetMembers: string[];
  isList: boolean;
  isRequired: boolean;
  propertiesType: string | null;
  relClass: RelationshipClass;
  classNote: string;
  cardinality: string;
  catalogNote: string;
  description: string;
  settable: Settable;
  /** Derived projections and @settable(false,false) fields are never written by an intent. */
  readOnly: boolean;
  line: number;
}

export interface SearchIndex {
  kind: "fulltext" | "vector";
  indexName: string;
  queryName: string;
  fields: string[];
  embeddingProperty: string | null;
}

export interface NodeType {
  name: string;
  /** Module id (v2) or fragment id (v1). Same value as `module` in a release IR. */
  fragment: string;
  description: string;
  summary: string;
  labels: string[];
  primaryLabel: string;
  archetypeLabel: string | null;
  interfaces: string[];
  /** GraphQL @mutation flags (v2: all false, lever L2). Executor creatability is `executorOps`, never this. */
  allowedMutations: { create: boolean; update: boolean; delete: boolean };
  searchIndexes: SearchIndex[];
  properties: Property[];
  relationships: RelationshipField[];
  uidToken: string | null;
  /** Property names that identify a record (uid, @id, materialized external keys, sidecar identity keys). */
  identityKeys: string[];
  sdl: string;
  line: number;
  // ---- v2 (release) -------------------------------------------------------------------------------
  /** Module id from the assembly manifest (K, D1..D13). */
  module: string;
  /** Every label a stored node of this type carries (`@node(labels)`), primary first. */
  storedLabels: string[];
  /** Archetype from the node register (Entity, InformationArtifact, Assertion, EvidenceAssessment, Occurrence, ...). */
  archetype: string | null;
  /** Identity rule components as the node register states them (may be prose, e.g. "(normalized name, class) provisional"). */
  identityRule: string[];
  /** Identifier schemes the type may hold (node register), with their release write status. */
  identifierSchemes: Array<{ scheme: string; writeStatus: "active" | "disabled" | "unregistered" }>;
  /** Executor operations (node register mutations.executor, normalized). Empty = not writable by the executor. */
  executorOps: ExecutorOp[];
  /** The register's executor policy text (scope of updates, close rules). */
  executorPolicy: string;
  /** Projection gate on writes of this type, if any (null for most types). */
  projectionGate: string | null;
  /** Provenance every write of this type must carry (kernel rule by archetype). */
  provenanceRequirement: string;
  /** `bitemporal` (validFrom/validTo + recorded time), `recorded` (recordedAt/recordedTo only) or `none`. */
  temporalScope: "bitemporal" | "recorded" | "none";
  /** Relationship types from this type whose episodes are exclusive per (subject, slot, asserter) (OD-05). */
  exclusiveSlots: string[];
  /** Fields the source may explicitly not report (rules/projection-rules.yaml notReported; OD-25). */
  notReportedFields: string[];
}

export interface InterfaceType {
  name: string;
  fragment: string;
  description: string;
  summary: string;
  properties: Property[];
  relationships: RelationshipField[];
  implementers: string[];
  sdl: string;
  line: number;
}

export interface EdgePropertyType {
  name: string;
  fragment: string;
  description: string;
  summary: string;
  properties: Property[];
  usedBy: Array<{ node: string; field: string; relationshipType: string }>;
  sdl: string;
  line: number;
}

export interface EnumType {
  name: string;
  fragment: string;
  description: string;
  summary: string;
  values: Array<{ name: string; description: string }>;
  usedBy: Array<{ type: string; field: string }>;
  sdl: string;
  line: number;
}

export interface UnionType {
  name: string;
  fragment: string;
  description: string;
  summary: string;
  members: string[];
  usedBy: Array<{ node: string; field: string }>;
  sdl: string;
  line: number;
}

export interface RelationshipTriple {
  from: string;
  to: string;
  /** The field(s) that declare this triple, from either end. */
  via: Array<{ node: string; field: string; direction: Direction; propertiesType: string | null; relClass: RelationshipClass; readOnly: boolean }>;
}

/** OD-45 classification of an interface (Entity / Subjectable) endpoint. */
export interface InterfaceEndpoint {
  interface: string;
  side: "from" | "to";
  /** kernel-traversal: K-owned or kernel-meaning type; registered-exception: the D5/D10 domain edges OD-45 accepts. */
  rule: "kernel-traversal" | "registered-exception";
  members: number;
}

export interface RelationshipTypeSummary {
  type: string;
  /** Authoritative class (relationship register in a release IR). */
  relClass: RelationshipClass;
  classes: RelationshipClass[];
  propertiesTypes: string[];
  triples: RelationshipTriple[];
  fragments: string[];
  description: string;
  /** Flags: asserted-registry, derived-registry, rule-only-derived, exclusive-episodes, projection-gate:<x>, interface-target. */
  flags: string[];
  // ---- v2 (release) -------------------------------------------------------------------------------
  /** Same as relClass (INTERFACES v1 name). */
  class: RelationshipClass;
  /** Owning module (metrics attribution: kernel-meaning types count in K). */
  module: string;
  /** Declared endpoint types as registered (may be an interface or union name). */
  from: string[];
  to: string[];
  /** Concrete node types after interface/union expansion. */
  fromMembers: string[];
  toMembers: string[];
  /** Edge-property type of the stored relationship (null when none). */
  edgePropertyType: string | null;
  /** Declaring fields `Type.field (DIR)`. */
  declaredOn: string[];
  /** Stored direction is always from -> to. */
  direction: "OUT";
  cardinality: string;
  /** recorded-only | episode | ... (relationship register). */
  temporal: string;
  questions: string[];
  /** DDL index/constraint names that serve this type (ddl/ddl.json). */
  requiredIndexes: string[];
  exclusive: boolean;
  projectionGate: string | null;
  interfaceEndpoints: InterfaceEndpoint[];
  /** True when the relationship register lists the type. */
  registered: boolean;
}

/** One predicate registry entry (vocabularies/predicates.yaml). */
export interface PredicateEntry {
  name: string;
  kind: "relationship" | "authorizing" | "literal" | "field" | "computation" | "retired";
  /** registered | alias-of:<p> | retired-by:<ruling>. */
  status: string;
  registrar: string | null;
  subjectTypes: string[];
  objectTypes: string[];
  literalForms: { valueFields: string[]; unit: string | null } | null;
  qualifiers: string[];
  requiredQualifiers: string[];
  aliasOf: string | null;
  replacedBy: string[];
  questions: string[];
  /** SDL field a FIELD predicate certifies (`Type.field`). */
  field: string | null;
}

export interface AssessmentSubkind {
  kind: string;
  subkind: string;
  registrar: string | null;
  status: string;
  conclusionCodes: string[];
  facets: Record<string, { values: string[]; owner?: string }>;
  admissibleSubjects: string[];
  methodVersions: string[];
}

export interface AssessmentVocabulary {
  kinds: string[];
  subkinds: AssessmentSubkind[];
}

/** Qualifier grammar entry (vocabularies/qualifiers.yaml), keyed by `name + separator`. */
export interface QualifierRule {
  name: string;
  separator: string;
  valueGrammar: string;
  owner: string | null;
  status: string;
  description: string;
}

export interface ReleaseIdentity {
  releaseId: string;
  /** Release-relative path of the assembled SDL. */
  sdlPath: string;
  parentBaseline: string | null;
}

export interface SchemaIR {
  irVersion: "bks-schema-ir.v2";
  schemaDigest: string;
  parsedAt: string;
  fragments: Fragment[];
  nodes: NodeType[];
  interfaces: InterfaceType[];
  edgePropertyTypes: EdgePropertyType[];
  enums: EnumType[];
  unions: UnionType[];
  scalars: string[];
  relationshipTypes: RelationshipTypeSummary[];
  params: ValidationParams;
  // ---- v2 (release) -------------------------------------------------------------------------------
  release: ReleaseIdentity | null;
  modules: ModuleInfo[];
  predicates: PredicateEntry[];
  assessments: AssessmentVocabulary;
  qualifierGrammar: Record<string, QualifierRule>;
}

/** The subset of `validation/validation-params.json` the services consume (v1 keys kept; v2 content only). */
export interface ValidationParams {
  uidTypeTokens: Record<string, string>;
  assertedTypes: string[];
  derivedTypes: string[];
  ruleOnlyDerivedTypes: string[];
  exclusiveTypes: string[];
  implicationPairs: string[][];
  registeredPredicates: string[];
  privateUidTokens: string[];
  publicAnswerExcludedLabels: string[];
  legacyTypes: string[];
  // ---- v2 ----
  structuralTypes?: string[];
  predicateAliases?: Record<string, string>;
  retiredPredicates?: Record<string, { ruling: string; replacedBy: string[] }>;
  activeIdentifierSchemes?: string[];
  executorOps?: Record<string, { ops: ExecutorOp[]; policy: string; stated: boolean }>;
  projectionGates?: Record<string, string>;
  /** v2.0.1+: release-known operational names (not SDL types; excluded from projection; no agent writes). */
  operationalNames?: OperationalNames;
}

/** Operational names registered by a release (rules/operational-names.yaml, v2.0.1+). Not domain ontology. */
export interface OperationalNames {
  class: "operational";
  labels: string[];
  relationshipTypes: string[];
  properties: string[];
  /** Qualifier keys including the separator, e.g. `legacy:recordedFrom=`. */
  qualifierPrefixes: string[];
  projection: "excluded";
  agentWrite: "forbidden";
  writers: string[];
  source: string;
}
