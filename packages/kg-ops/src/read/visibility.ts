import { loadRelease, type NodeType, type ReleaseBundle } from "@bks/schema-workspace";

/**
 * Read visibility and property policy (`bks-read-visibility.v1`, S4). Binding facts, in order:
 *
 *  1. Operational and legacy records are never visible to a read: every label and relationship type the release lists
 *     in `rules/operational-names.yaml` (Ks* markers, LegacyV0 / LegacyV0_<Label>, foreign Document /
 *     BellLabsSchemaDeploymentEvidence, MIGRATED_FROM) plus any `Ks*` / `LegacyV0*` label. Operational properties
 *     (legacyLabels, legacyExportDigest) are never projected.
 *  2. Scope `public`: only nodes whose `privacyClass` is exactly `PUBLIC` (the kernel says a null class is not public:
 *     fail closed). Scope `internal`: PUBLIC and INTERNAL (any v2 record).
 *  3. Property policy: a read projects release-declared properties of the record's type only (never `properties(n)`,
 *     never undeclared/legacy keys such as an old `searchEmbedding`). In scope `public`, verbatim source-span text
 *     (SourceLocator.exact / prefix / suffix / selectorJson) is restricted: identity, selectorDigest, quoteHash and
 *     offsets are projected, the text is not (no rights policy is published in the release yet, so fail closed).
 *
 * Enforcement points: typed operations compile these predicates into every node variable they match (intermediate
 * traversals, filters, aggregates and outputs). Arbitrary Cypher artifacts rely on database RBAC for scopes the
 * binding proves (`visibility: database-rbac`), plus the parser policy (labels, relationship types, functions,
 * procedures) as defense in depth; scopes without that proof get templates / typed reads only.
 */
export const READ_VISIBILITY_POLICY = "bks-read-visibility.v1" as const;

export type ReadScope = "public" | "internal";

/** Restricted (span-rights) properties in scope `public`. */
export const RESTRICTED_PUBLIC_PROPERTIES: Record<string, string[]> = {
  SourceLocator: ["exact", "prefix", "suffix", "selectorJson"],
};

/** Read-only procedures an artifact may call (explicit pure/read allowlist). Everything else is PROCEDURE_FORBIDDEN. */
export const PROCEDURE_ALLOWLIST = new Set(["db.index.fulltext.queryNodes"]);

/** Pure functions an artifact may call. Not listed (and refused): properties, keys, id, elementId, rand, randomUUID, apoc.*, gds.*, db.*, vector.*, genai.*, ai.*, file/network helpers. */
export const FUNCTION_ALLOWLIST = new Set(
  [
    "count", "collect", "sum", "avg", "min", "max", "stdev", "stdevp", "percentilecont", "percentiledisc",
    "size", "length", "head", "last", "tail", "reverse", "range", "coalesce", "isempty", "isnan",
    "tostring", "tostringornull", "tointeger", "tointegerornull", "tofloat", "tofloatornull", "toboolean", "tobooleanornull",
    "tolower", "toupper", "lower", "upper", "trim", "ltrim", "rtrim", "btrim", "replace", "substring", "left", "right", "split",
    "char_length", "character_length", "normalize", "valuetype",
    "abs", "ceil", "floor", "round", "sign", "sqrt", "exp", "log", "log10", "e", "pi",
    "type", "labels", "exists", "startnode", "endnode", "nodes", "relationships",
    "date", "datetime", "localdatetime", "time", "localtime", "duration",
    "date.truncate", "datetime.truncate", "localdatetime.truncate", "duration.between", "duration.indays", "duration.inmonths", "duration.inseconds",
    "date.statement", "datetime.statement", "point", "point.distance", "point.withinbbox",
  ].map((s) => s.toLowerCase()),
);
/** Functions whose result is (or contains) a whole entity; allowed only inside expressions, refused at runtime if returned. */
export const ENTITY_FUNCTIONS = new Set(["startnode", "endnode", "nodes", "relationships"]);

export class ReadModel {
  readonly releaseId: string;
  readonly schemaReleaseDigest: string;
  readonly schemaDigest: string;
  readonly queryCatalogDigest: string;
  readonly nodes = new Map<string, NodeType>();
  readonly nodeByLabel = new Map<string, NodeType>();
  /** Every label a v2 record may carry (primary + stored + archetype labels). */
  readonly labels = new Set<string>();
  readonly relationshipTypes = new Set<string>();
  readonly operationalLabels = new Set<string>();
  readonly operationalRelationshipTypes = new Set<string>();
  readonly operationalProperties = new Set<string>();
  readonly fulltextIndexes = new Map<string, { label: string; properties: string[] }>();
  readonly vectorIndexesEnabled = false;

  constructor(readonly release: ReleaseBundle) {
    this.releaseId = String(release.manifest.releaseId);
    this.schemaReleaseDigest = release.schemaReleaseDigest;
    this.schemaDigest = release.schemaDigest;
    const ids = (release.manifest as unknown as { identities?: { queryCatalogDigest?: string } }).identities;
    this.queryCatalogDigest = String(ids?.queryCatalogDigest ?? release.pin?.queryCatalogDigest ?? "");
    for (const n of release.ir.nodes) {
      this.nodes.set(n.name, n);
      this.nodeByLabel.set(n.primaryLabel, n);
      for (const l of [n.primaryLabel, ...n.storedLabels]) this.labels.add(l);
      if (n.archetypeLabel) this.labels.add(n.archetypeLabel);
    }
    for (const r of release.ir.relationshipTypes) this.relationshipTypes.add(r.type);
    const op = release.operationalNames;
    for (const l of op?.labels ?? ["KsWriteFence", "KsIntentMarker", "KsReleaseMarker", "KsRevocationFence", "LegacyV0", "Document", "BellLabsSchemaDeploymentEvidence"]) this.operationalLabels.add(l);
    for (const t of op?.relationshipTypes ?? ["MIGRATED_FROM"]) this.operationalRelationshipTypes.add(t);
    for (const p of op?.properties ?? ["legacyLabels", "legacyExportDigest"]) this.operationalProperties.add(p);
    for (const l of this.operationalLabels) this.labels.delete(l);
    for (const t of this.operationalRelationshipTypes) this.relationshipTypes.delete(t);
    const ddl = release.ddl.manifest as unknown as { statements?: Array<{ name: string; type?: string; statement: string; labelsOrTypes?: string[] | string; properties?: string[] | string; requirement?: string }> };
    for (const s of ddl.statements ?? []) {
      if (/FULLTEXT/i.test(`${s.type ?? ""} ${s.statement}`) && /INDEX/i.test(s.statement)) {
        const labels = Array.isArray(s.labelsOrTypes) ? s.labelsOrTypes : String(s.labelsOrTypes ?? "").split(",");
        const props = Array.isArray(s.properties) ? s.properties : String(s.properties ?? "").split(",");
        this.fulltextIndexes.set(s.name, { label: String(labels[0] ?? "").trim(), properties: props.map((p) => p.trim()).filter(Boolean) });
      }
    }
  }

  static fromRelease(opts?: { dir?: string }): ReadModel {
    return new ReadModel(loadRelease(opts));
  }

  isOperationalLabel(label: string): boolean {
    return this.operationalLabels.has(label) || /^Ks[A-Z]/.test(label) || label.startsWith("LegacyV0");
  }

  isPermittedLabel(label: string): boolean {
    return this.labels.has(label) && !this.isOperationalLabel(label);
  }

  isPermittedRelationshipType(type: string): boolean {
    return this.relationshipTypes.has(type) && !this.operationalRelationshipTypes.has(type);
  }

  node(typeName: string): NodeType | undefined {
    return this.nodes.get(typeName) ?? this.nodeByLabel.get(typeName);
  }

  /** Stored property names a read may project for a type in a scope (release-declared, minus operational / restricted). */
  projectableProperties(typeName: string, scope: ReadScope): string[] {
    const n = this.node(typeName);
    if (!n) return ["uid", "name"];
    const restricted = scope === "public" ? new Set(RESTRICTED_PUBLIC_PROPERTIES[n.name] ?? []) : new Set<string>();
    return n.properties.map((p) => p.storedName).filter((p) => !this.operationalProperties.has(p) && !restricted.has(p)).sort();
  }

  /** Restricted properties of a type in a scope (projection refused). */
  restrictedProperties(typeName: string, scope: ReadScope): string[] {
    if (scope !== "public") return [];
    const n = this.node(typeName);
    return n ? RESTRICTED_PUBLIC_PROPERTIES[n.name] ?? [] : [];
  }

  /** Primary type name of a node from its labels (most specific stored label that is a release node type). */
  primaryType(labels: string[]): string | null {
    for (const l of labels) if (this.nodeByLabel.has(l)) return this.nodeByLabel.get(l)!.name;
    return null;
  }

  /**
   * Cypher predicate making node variable `v` visible in `scope` (compiled into typed operations by construction,
   * never inserted into caller text).
   */
  visible(v: string, scope: ReadScope): string {
    const base = `(${v}.uid IS NOT NULL AND NOT ${v}:LegacyV0 AND NONE(__lbl IN labels(${v}) WHERE __lbl STARTS WITH 'Ks' OR __lbl STARTS WITH 'LegacyV0' OR __lbl IN $__opLabels))`;
    return scope === "public" ? `(${base} AND ${v}.privacyClass = 'PUBLIC')` : base;
  }

  /** Relationship-type predicate excluding operational types (for typed traversals over "any" type). */
  visibleRel(r: string): string {
    return `(NOT type(${r}) IN $__opRels)`;
  }

  /** Type name for a uid (`hu:<token>:<opaque>`, token from validation-params uidTypeTokens). */
  typeOfUid(uid: string): NodeType | null {
    const token = uid.split(":")[1] ?? "";
    if (!this.tokenTypes) {
      this.tokenTypes = new Map();
      const tokens = (this.release.validationParams as { uidTypeTokens?: Record<string, string> }).uidTypeTokens ?? this.release.ir.params.uidTypeTokens ?? {};
      for (const [type, tok] of Object.entries(tokens)) this.tokenTypes.set(tok, type);
    }
    const t = this.tokenTypes.get(token);
    return t ? this.nodes.get(t) ?? null : null;
  }
  private tokenTypes: Map<string, string> | null = null;

  /** Union of the stored edge-property fields of the given relationship types (all release types when empty). */
  edgeFields(types: string[]): string[] {
    const wanted = types.length ? new Set(types) : null;
    const byName = new Map(this.release.ir.edgePropertyTypes.map((e) => [e.name, e]));
    const out = new Set<string>();
    for (const r of this.release.ir.relationshipTypes) {
      if (wanted && !wanted.has(r.type)) continue;
      const ep = r.edgePropertyType ? byName.get(r.edgePropertyType) : undefined;
      for (const p of ep?.properties ?? []) if (!this.operationalProperties.has(p.storedName)) out.add(p.storedName);
    }
    return [...out].sort();
  }

  relationshipClass(type: string): string | null {
    return this.release.ir.relationshipTypes.find((r) => r.type === type)?.relClass ?? null;
  }

  /** Parameters every compiled typed statement needs for the visibility predicates. */
  visibilityParams(): Record<string, unknown> {
    return { __opLabels: [...this.operationalLabels].sort(), __opRels: [...this.operationalRelationshipTypes].sort() };
  }
}
