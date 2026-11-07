import { loadSidecars, openWorkspace, type IdentityRulesSidecar, type IngestionRulesSidecar, type NodeType, type Property, type RelationshipField, type RelationshipTypeSummary, type SchemaIR, type Sidecars } from "@bks/schema-workspace";

/** Read model over the pinned schema IR for the planner and read executor. */
export class SchemaModel {
  readonly nodeByName = new Map<string, NodeType>();
  readonly nodeByPrimaryLabel = new Map<string, NodeType>();
  readonly relByType = new Map<string, RelationshipTypeSummary>();
  readonly enumValues = new Map<string, Set<string>>();
  readonly identityRules: IdentityRulesSidecar;
  readonly ingestionRules: IngestionRulesSidecar;
  readonly forbiddenImplications: Map<string, string[]>;

  constructor(
    readonly ir: SchemaIR,
    readonly sidecars: Sidecars,
    readonly workspaceFingerprint: string,
  ) {
    for (const n of ir.nodes) {
      this.nodeByName.set(n.name, n);
      this.nodeByPrimaryLabel.set(n.primaryLabel, n);
    }
    for (const r of ir.relationshipTypes) this.relByType.set(r.type, r);
    for (const e of ir.enums) this.enumValues.set(e.name, new Set(e.values.map((v) => v.name)));
    this.identityRules = sidecars.identityRules;
    this.ingestionRules = sidecars.ingestionRules;
    this.forbiddenImplications = new Map();
    for (const [premise, conclusion] of ir.params.implicationPairs) {
      if (!premise || !conclusion) continue;
      const list = this.forbiddenImplications.get(premise) ?? [];
      list.push(conclusion);
      this.forbiddenImplications.set(premise, list);
    }
  }

  static fromWorkspace(dir?: string): SchemaModel {
    const ws = openWorkspace(dir);
    return new SchemaModel(ws.ir(), loadSidecars(), ws.manifest.workspaceFingerprint);
  }

  get schemaDigest(): string {
    return this.ir.schemaDigest;
  }

  node(name: string): NodeType {
    const n = this.nodeByName.get(name);
    if (!n) throw new SchemaError("UNKNOWN_NODE_TYPE", `unknown node type ${name}`, { nodeType: name, suggestions: this.suggestNode(name) });
    return n;
  }

  suggestNode(name: string): string[] {
    const q = name.toLowerCase();
    return [...this.nodeByName.keys()].filter((n) => n.toLowerCase().includes(q) || q.includes(n.toLowerCase())).slice(0, 5);
  }

  relationship(type: string): RelationshipTypeSummary | undefined {
    return this.relByType.get(type);
  }

  /** The declaring field for (from, TYPE, to), if the schema allows that triple. */
  findRelationshipField(from: string, type: string, to: string): { node: NodeType; field: RelationshipField; declaredOn: "from" | "to" } | null {
    const fromNode = this.nodeByName.get(from);
    const toNode = this.nodeByName.get(to);
    if (!fromNode || !toNode) return null;
    const outgoing = fromNode.relationships.find((r) => r.relationshipType === type && r.direction === "OUT" && r.targetMembers.includes(to));
    if (outgoing) return { node: fromNode, field: outgoing, declaredOn: "from" };
    const incoming = toNode.relationships.find((r) => r.relationshipType === type && r.direction === "IN" && r.targetMembers.includes(from));
    if (incoming) return { node: toNode, field: incoming, declaredOn: "to" };
    return null;
  }

  property(nodeType: string, name: string): Property | undefined {
    return this.nodeByName.get(nodeType)?.properties.find((p) => p.name === name);
  }

  /** Validates a property value against the declared GraphQL type; returns an error message or null. */
  validatePropertyValue(p: Property, value: unknown): string | null {
    if (value === null || value === undefined) return null;
    const check = (v: unknown): string | null => {
      switch (p.namedType) {
        case "String":
        case "ID":
          return typeof v === "string" ? null : `expected string for ${p.name}`;
        case "Int":
          return Number.isInteger(v) ? null : `expected integer for ${p.name}`;
        case "Float":
          return typeof v === "number" ? null : `expected number for ${p.name}`;
        case "Boolean":
          return typeof v === "boolean" ? null : `expected boolean for ${p.name}`;
        case "DateTime":
        case "Date":
          return typeof v === "string" && !Number.isNaN(Date.parse(v)) ? null : `expected ISO datetime string for ${p.name}`;
        default: {
          const values = this.enumValues.get(p.namedType);
          if (values) return typeof v === "string" && values.has(v) ? null : `invalid ${p.namedType} value ${JSON.stringify(v)} for ${p.name}; allowed: ${[...values].join(", ")}`;
          return null;
        }
      }
    };
    if (p.isList) {
      if (!Array.isArray(value)) return `expected list for ${p.name}`;
      for (const v of value) {
        const err = check(v);
        if (err) return err;
      }
      return null;
    }
    return check(value);
  }

  isTemporalProperty(p: Property): boolean {
    return p.namedType === "DateTime" || p.namedType === "Date";
  }

  uidToken(nodeType: string): string {
    const token = this.nodeByName.get(nodeType)?.uidToken ?? this.ir.params.uidTypeTokens[nodeType];
    if (!token) throw new SchemaError("NO_UID_TOKEN", `node type ${nodeType} has no registered uid token`, { nodeType });
    return token;
  }

  identityRule(nodeType: string): { identifierSchemes: string[]; nameProperties: string[]; uidSlugFrom: string } {
    const r = this.identityRules.types[nodeType];
    return {
      identifierSchemes: r?.identifierSchemes ?? [],
      nameProperties: r?.nameProperties ?? this.identityRules.defaults.nameProperties,
      uidSlugFrom: r?.uidSlugFrom ?? this.identityRules.defaults.uidSlugFrom,
    };
  }

  normalizeIdentifier(scheme: string, value: string): string {
    const rule = this.identityRules.defaults.identifierNormalization[scheme.toUpperCase()] ?? "as-is";
    const v = value.trim();
    switch (rule) {
      case "lowercase":
        return v.toLowerCase();
      case "uppercase":
        return v.toUpperCase();
      case "digits":
        return v.replace(/\D/g, "");
      case "lowercase-url":
        return v.toLowerCase().replace(/\/+$/, "");
      case "lowercase-host":
        return v.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
      default:
        return v;
    }
  }

  /** Fulltext index name and query name for a node type, if declared. */
  fulltextIndex(nodeType: string): { indexName: string; fields: string[] } | null {
    const idx = this.nodeByName.get(nodeType)?.searchIndexes.find((s) => s.kind === "fulltext");
    return idx ? { indexName: idx.indexName, fields: idx.fields } : null;
  }
}

export class SchemaError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }
}
