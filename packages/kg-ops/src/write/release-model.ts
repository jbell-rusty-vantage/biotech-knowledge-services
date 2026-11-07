import { canonicalDigest } from "@bks/contracts";
import { parseSchema, type EdgePropertyType, type NodeType, type Property, type SchemaIR, type ValidationParams } from "@bks/schema-workspace";
import type { IdentifierSchemeEntry, PredicateEntry, ReleaseInputs } from "../release-adapter.js";

/**
 * Register-driven write model (SPECIFICATION 7.1 registry validation). Everything the compiler needs about a node
 * type, relationship type, predicate, identifier scheme or verdict mapping comes from the release registers through
 * this class; the planner never reads `@mutation` / `@fulltext` SDL directives or the v1 validation params.
 */

/** S1 executor operations (IR NodeType.executorOps). The writer issues create / update / close; deletes are never issued by intents. */
export type ExecutorOp = "create" | "update" | "close" | "delete" | "delete-unreferenced";

export interface ExecutorOpsDisagreement {
  type: string;
  release: string[];
  derived: string[];
  derivation: string;
}

const loggedCrossChecks = new Set<string>();

export interface NodeSpec {
  name: string;
  module: string;
  primaryLabel: string;
  /** Stored labels from @node(labels:), primary first. No :Entity assumption: kernel records carry their own labels. */
  labels: string[];
  uidToken: string;
  archetype: string;
  subjectable: boolean;
  executorOps: Set<ExecutorOp>;
  /** Restricted update set when the register names it (e.g. Source: logicalIdentity/genre); null = any author field. */
  updatableProperties: string[] | null;
  /** Written only by a projection Activity (Association, Chunk): ordinary intents cannot create/update it. */
  projectionOnly: boolean;
  /** Kernel record types created through proposal kinds, never declared as subjects. */
  kernelRecord: boolean;
  identityKeys: string[];
  identifierSchemes: string[];
  properties: Map<string, Property>;
  /** How executorOps were derived (register text, flags, default), for the S3 report. */
  derivation: string;
  /** Register-declared default privacy class (node register `privacy: privacyClass INTERNAL by default`); null = intent default. */
  defaultPrivacy: string | null;
  node: NodeType;
}

export interface RelSpec {
  type: string;
  relClass: "structural" | "asserted" | "derived";
  /** Edge-property profile names declared for the type (one per declaring field). */
  profiles: string[];
  temporal: "episode" | "recorded-only";
  exclusive: boolean;
  projectionGate: "SUPPORT" | null;
  /** Concrete (from, to) node-type pairs from the SDL (interface/union expanded). */
  triples: Set<string>;
  /** Profile per (from|to) pair. */
  profileByPair: Map<string, string | null>;
  /** Kernel plumbing edges the executor writes itself (HAS_SUBJECT, HAS_EVIDENCE, ...). */
  executorOwned: boolean;
  modules: string[];
}

export interface PredicateSpec {
  name: string;
  status: "registered" | "proposed-new" | "alias-of" | "retired-by";
  kind: PredicateEntry["kind"];
  aliasOf: string | null;
  replacedBy: string[];
  subjectTypes: Set<string>;
  objectTypes: Set<string>;
  valueFields: string[];
  qualifiers: Set<string>;
  requiredQualifiers: string[];
  field: string | null;
}

export interface SchemeSpec {
  code: string;
  rule: string;
  pattern: RegExp | null;
  usedBy: string[];
}

/** Executor-owned edges: only the compiler writes them, through proposal kinds. */
const EXECUTOR_OWNED_EDGES = new Set([
  "HAS_SUBJECT", "HAS_OBJECT", "ASSERTED_BY", "HAS_EVIDENCE", "ASSESSES", "DERIVED_FROM", "OCCURRENCE_OF", "WAS_GENERATED_BY",
  "WAS_ASSOCIATED_WITH", "WAS_INFORMED_BY", "HAS_SNAPSHOT", "HAS_LOCATOR", "HAS_IDENTIFIER", "HAS_ITEM", "OCCURS_IN",
]);
/** Kernel record node types (proposal kinds create them). */
const KERNEL_RECORDS = new Set(["Assertion", "Adjudication", "Assessment", "Report", "ReportItem", "Activity", "Identifier", "SourceSnapshot", "SourceLocator", "CaptureAttempt", "Association", "Chunk"]);
/** Asserter types (P20): Person, Organization, Agent, Publication / MediaWork (own voice, R-15), Channel with channelKind ACCOUNT. */
export const ASSERTER_TYPES = new Set(["Person", "Organization", "Agent", "Publication", "MediaWork", "Channel"]);

export const EXECUTOR_EDGE_FIELDS = new Set(["relationshipUid", "assertionUid", "validFrom", "validTo", "validFromPrecision", "validToPrecision", "validFromBasis", "validToBasis", "recordedFrom", "recordedTo", "lastWriterRunId", "projectionOfAssertionUid", "derivationRule", "derivedFromAssertionUids", "derivedFromAssessmentUids", "derivedAt"]);
export const EXECUTOR_NODE_FIELDS = new Set(["id", "uid", "createdAt", "updatedAt", "lastWriterRunId", "privacyClass", "recordedAt", "recordedTo"]);

const EMPTY_PARAMS: ValidationParams = {
  uidTypeTokens: {}, assertedTypes: [], derivedTypes: [], ruleOnlyDerivedTypes: [], exclusiveTypes: [], implicationPairs: [],
  registeredPredicates: [], privateUidTokens: [], publicAnswerExcludedLabels: [], legacyTypes: [],
};

function parseExecutorOps(m: unknown, note: string): { ops: Set<ExecutorOp>; updatable: string[] | null; projectionOnly: boolean; derivation: string } {
  const exec = m && typeof m === "object" && "executor" in (m as Record<string, unknown>) ? String((m as Record<string, unknown>).executor ?? "") : "";
  const text = exec.toLowerCase();
  if (/projection job only/.test(text) || /projection output|written only by the chunking/.test(note.toLowerCase())) {
    return { ops: new Set(), updatable: null, projectionOnly: true, derivation: `projection-only: ${exec || note}`.slice(0, 160) };
  }
  if (!text || text === "unstated") {
    // R-03 reads the register as {graphql: none, executor: [...]}; where the executor list is unstated (D3 flags, D7, D9)
    // ADR 0003 applies: the executor is the only writer and may create and update; deletes are never issued.
    return { ops: new Set(["create", "update"]), updatable: null, projectionOnly: false, derivation: `default create+update (register executor ${text ? "unstated" : "absent"}; ADR 0003)` };
  }
  const ops = new Set<ExecutorOp>();
  if (/\bcreate\b/.test(text)) ops.add("create");
  const createOnly = /create only|never update|insert-only|immutable;|\(immutable/.test(text) && !/update (observation|descriptive|projection|endedat)/.test(text);
  let updatable: string[] | null = null;
  if (/\bupdate\b/.test(text) && !createOnly) {
    ops.add("update");
    const m2 = /update ([A-Za-z/ ,()]+?)(?:;|$| only| at apply)/.exec(exec);
    const words = m2 ? m2[1]!.split(/[\s/,()]+/).filter((w) => /^[a-z][a-zA-Z]+$/.test(w)) : [];
    if (words.length) updatable = words;
  } else if (/rewritten under field assertions|re-materialize/.test(text)) {
    // R-14 / R-45 property caches and EX-02 event clocks: updated only with the FIELD Assertions that authorize them.
    ops.add("update");
  }
  if (/\bclose\b/.test(text)) ops.add("close");
  return { ops, updatable, projectionOnly: false, derivation: `register executor: ${exec}`.slice(0, 200) };
}

function asArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return [v];
  return [];
}

export class WriteSchema {
  readonly ir: SchemaIR;
  readonly nodes = new Map<string, NodeSpec>();
  readonly nodeByToken = new Map<string, NodeSpec>();
  readonly nodeByLabel = new Map<string, NodeSpec>();
  readonly rels = new Map<string, RelSpec>();
  readonly predicates = new Map<string, PredicateSpec>();
  readonly schemes = new Map<string, SchemeSpec>();
  readonly enums = new Map<string, Set<string>>();
  readonly profiles = new Map<string, EdgePropertyType>();
  readonly captureFidelity: { rows: Array<{ verdicts: string[]; status: Record<"passing" | "held" | "failing", string> }>; columns: Record<"passing" | "held" | "failing", string[]> };
  readonly admittingVerdicts: string[];
  readonly schemaDigest: string;
  readonly schemaReleaseDigest: string;
  readonly releaseId: string;
  readonly qualifierGrammar: QualifierGrammar;
  /** FU-06 capture-method registry ids and aliases (empty for the candidate). */
  readonly captureMethods = new Set<string>();
  /** Where the register-text derivation (kept only as a cross-check) disagrees with the release executorOps. */
  readonly executorOpsDisagreements: ExecutorOpsDisagreement[] = [];
  /** "release" when executorOps come from the release (S1 params.executorOps), "derived" for the candidate. */
  readonly executorOpsSource: "release" | "derived";

  constructor(readonly release: ReleaseInputs) {
    this.ir = parseSchema(release.sdl, { params: EMPTY_PARAMS });
    if (this.ir.schemaDigest !== release.schemaDigest) throw new Error(`RELEASE_TAMPERED: parsed SDL digest ${this.ir.schemaDigest} != ${release.schemaDigest}`);
    this.schemaDigest = release.schemaDigest;
    this.schemaReleaseDigest = release.schemaReleaseDigest;
    this.releaseId = release.releaseId;
    for (const e of this.ir.enums) this.enums.set(e.name, new Set(e.values.map((v) => v.name)));
    for (const p of this.ir.edgePropertyTypes) this.profiles.set(p.name, p);

    this.executorOpsSource = release.executorOps ? "release" : "derived";
    const regByName = new Map(release.nodeRegister.nodes.map((n) => [n.name, n]));
    for (const node of this.ir.nodes) {
      const reg = regByName.get(node.name);
      if (!reg) throw new Error(`RELEASE_TAMPERED: SDL node ${node.name} has no node-register row`);
      const note = String(reg.mutationsNote ?? reg.mutationNote ?? "");
      const parsed = parseExecutorOps(reg.mutations, note);
      const stated = release.executorOps?.[node.name];
      if (release.executorOps && !stated) throw new Error(`RELEASE_TAMPERED: release executorOps has no entry for node type ${node.name}`);
      if (stated) {
        // The release is the authority (S1 params.executorOps); the register-text derivation is a cross-check only.
        const releaseOps = new Set(stated.ops as ExecutorOp[]);
        const comparable = (ops: Iterable<string>) => [...ops].filter((o) => o === "create" || o === "update" || o === "close").sort().join("+");
        if (comparable(releaseOps) !== comparable(parsed.ops)) this.executorOpsDisagreements.push({ type: node.name, release: [...stated.ops].sort(), derived: [...parsed.ops].sort(), derivation: parsed.derivation });
        parsed.ops = releaseOps;
        parsed.projectionOnly = parsed.projectionOnly || /projection job only/i.test(stated.policy);
        parsed.derivation = `release executorOps ${[...stated.ops].sort().join("+")}: ${stated.policy}`.slice(0, 200);
      }
      const spec: NodeSpec = {
        name: node.name,
        module: reg.module,
        primaryLabel: node.primaryLabel,
        labels: node.labels,
        uidToken: reg.uidToken,
        archetype: String(reg.archetype ?? node.archetypeLabel ?? ""),
        subjectable: node.interfaces.includes("Subjectable"),
        executorOps: parsed.ops,
        // Only words that are real properties of the type restrict the update set ("update descriptive fields" restricts nothing).
        updatableProperties: parsed.updatable && parsed.updatable.some((w) => node.properties.some((p) => p.name === w)) ? parsed.updatable.filter((w) => node.properties.some((p) => p.name === w)) : null,
        projectionOnly: parsed.projectionOnly,
        kernelRecord: KERNEL_RECORDS.has(node.name),
        identityKeys: asArray(reg.identityKeys),
        identifierSchemes: asArray(reg.identifierSchemes),
        properties: new Map(node.properties.map((p) => [p.name, p])),
        derivation: parsed.derivation,
        defaultPrivacy: /privacyClass\s+([A-Z_]+)\s+by default/.exec(String(reg.privacy ?? ""))?.[1] ?? null,
        node,
      };
      if (this.nodeByToken.has(spec.uidToken)) throw new Error(`RELEASE_TAMPERED: uid token ${spec.uidToken} is used by ${this.nodeByToken.get(spec.uidToken)!.name} and ${node.name}`);
      this.nodes.set(node.name, spec);
      this.nodeByToken.set(spec.uidToken, spec);
      this.nodeByLabel.set(spec.primaryLabel, spec);
    }

    if (this.executorOpsDisagreements.length && !loggedCrossChecks.has(release.schemaReleaseDigest)) {
      loggedCrossChecks.add(release.schemaReleaseDigest);
      console.warn(`[bks-writer] executorOps cross-check (${release.releaseId}): ${this.executorOpsDisagreements.length} node type(s) where the register-text derivation disagrees with the release; the release wins: ${this.executorOpsDisagreements.map((d) => `${d.type} release=${d.release.join("+")} derived=${d.derived.join("+")}`).join("; ")}`);
    }
    const regRels = new Map<string, typeof release.relationshipRegister.relationships>();
    for (const r of release.relationshipRegister.relationships) regRels.set(r.type, [...(regRels.get(r.type) ?? []), r]);
    for (const summary of this.ir.relationshipTypes) {
      const rows = regRels.get(summary.type) ?? [];
      const classes = new Set(rows.map((r) => r.class));
      const relClass = (rows[0]?.class ?? (summary.relClass === "unknown" ? "structural" : summary.relClass)) as RelSpec["relClass"];
      if (classes.size > 1) throw new Error(`RELEASE_TAMPERED: ${summary.type} has conflicting register classes ${[...classes].join(",")}`);
      const triples = new Set<string>();
      const profileByPair = new Map<string, string | null>();
      for (const t of summary.triples) {
        triples.add(`${t.from}|${t.to}`);
        profileByPair.set(`${t.from}|${t.to}`, t.via[0]?.propertiesType ?? null);
      }
      this.rels.set(summary.type, {
        type: summary.type,
        relClass,
        profiles: [...new Set(summary.propertiesTypes)],
        temporal: rows.some((r) => r.temporal === "episode") ? "episode" : "recorded-only",
        exclusive: rows.some((r) => r.exclusive === true),
        projectionGate: rows.some((r) => r.projectionGate === "SUPPORT") ? "SUPPORT" : null,
        triples,
        profileByPair,
        executorOwned: EXECUTOR_OWNED_EDGES.has(summary.type),
        modules: [...new Set(rows.map((r) => r.module))],
      });
    }

    for (const p of release.predicates.predicates) {
      const [status, target] = p.status.split(":") as [string, string | undefined];
      this.predicates.set(p.predicate, {
        name: p.predicate,
        status: (status === "alias-of" || status === "retired-by" || status === "proposed-new" ? status : "registered") as PredicateSpec["status"],
        kind: p.kind,
        aliasOf: status === "alias-of" ? (target ?? null) : null,
        replacedBy: p.replacedBy ?? [],
        subjectTypes: new Set([...(p.subjectTypes ?? []), ...(p.observed?.subjectTypes ?? [])]),
        objectTypes: new Set([...(p.objectTypes ?? []), ...(p.observed?.objectTypes ?? [])]),
        valueFields: p.literal?.valueFields ?? [],
        qualifiers: new Set(p.qualifiers ?? []),
        requiredQualifiers: p.requiredQualifiers ?? [],
        field: p.field ?? null,
      });
    }

    for (const s of release.identifierSchemes.schemes) {
      let pattern: RegExp | null = null;
      try {
        pattern = s.pattern ? new RegExp(s.pattern) : null;
      } catch {
        pattern = null;
      }
      this.schemes.set(s.code, { code: s.code, rule: s.normalization?.rule ?? "verbatim-v1", pattern, usedBy: s.usedByNodeTypes ?? [] });
    }

    const lattice = release.verdictLattice as { captureFidelityMapping?: { columns: Record<string, string[]>; rows: Array<{ verdicts: string[]; status: Record<string, string> }> }; projectionGate?: { admittingVerdicts?: string[] } };
    const mapping = lattice.captureFidelityMapping;
    if (!mapping) throw new Error("RELEASE_TAMPERED: verdict-lattice has no captureFidelityMapping");
    this.captureFidelity = { columns: mapping.columns as WriteSchema["captureFidelity"]["columns"], rows: mapping.rows as WriteSchema["captureFidelity"]["rows"] };
    this.admittingVerdicts = lattice.projectionGate?.admittingVerdicts ?? ["DIRECTLY_SUPPORTED", "SUPPORTED_WITH_QUALIFICATION"];
    this.qualifierGrammar = new QualifierGrammar(this);
    for (const m of release.captureMethods?.entries ?? []) {
      this.captureMethods.add(m.id);
      for (const a of m.aliases ?? []) this.captureMethods.add(a);
    }
  }

  node(name: string): NodeSpec | undefined {
    return this.nodes.get(name);
  }

  /** Release-validated token -> primary-label routing (no :Entity assumption). */
  nodeForUid(uid: string): NodeSpec | undefined {
    const m = /^hu:([a-z0-9-]+):/.exec(uid);
    return m ? this.nodeByToken.get(m[1]!) : undefined;
  }

  enumHas(enumName: string, value: string): boolean {
    return this.enums.get(enumName)?.has(value) ?? false;
  }

  /** Property type check against the SDL (scalars, enums, lists). Returns an error message or null. */
  checkValue(p: Property, value: unknown): string | null {
    if (value === null || value === undefined) return p.isRequired ? `${p.name} is required` : null;
    const one = (v: unknown): string | null => {
      switch (p.namedType) {
        case "String":
        case "ID":
          return typeof v === "string" ? null : `${p.name}: expected string`;
        case "Int":
          return Number.isSafeInteger(v) ? null : `${p.name}: expected integer`;
        case "Float":
          return typeof v === "number" && Number.isFinite(v) ? null : `${p.name}: expected number`;
        case "Boolean":
          return typeof v === "boolean" ? null : `${p.name}: expected boolean`;
        case "DateTime":
          return typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/i.test(v) ? null : `${p.name}: expected RFC 3339 instant with offset`;
        case "Date":
          return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? null : `${p.name}: expected YYYY-MM-DD`;
        default: {
          const values = this.enums.get(p.namedType);
          if (values) return typeof v === "string" && values.has(v) ? null : `${p.name}: ${JSON.stringify(v)} is not a ${p.namedType} value`;
          return `${p.name}: unsupported property type ${p.namedType}`;
        }
      }
    };
    if (p.isList) {
      if (!Array.isArray(value)) return `${p.name}: expected list`;
      for (const v of value) {
        const e = one(v);
        if (e) return e;
      }
      return null;
    }
    if (Array.isArray(value)) return `${p.name}: list given for a scalar`;
    return one(value);
  }

  enumCheck(enumName: string, value: string | undefined | null, field: string): string | null {
    if (value === undefined || value === null) return null;
    return this.enumHas(enumName, value) ? null : `${field}: ${JSON.stringify(value)} is not a ${enumName} value`;
  }

  /** Field predicate registered for (nodeType, property), if any (OD-11). */
  fieldPredicate(nodeType: string, property: string): PredicateSpec | null {
    const screaming = property.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
    for (const p of this.predicates.values()) {
      if (p.kind !== "field" || p.status === "retired-by" || p.status === "alias-of") continue;
      if (p.field === `${nodeType}.${property}`) return p;
      if (!p.field && p.name === screaming && p.subjectTypes.has(nodeType)) return p;
    }
    return null;
  }

  /** Identifier normalization (identifier-schemes.yaml normalization.rule) before the uniqueness check (R-42). */
  normalizeIdentifier(scheme: SchemeSpec, raw: string): string {
    const v = raw.trim();
    const rule = scheme.rule;
    if (rule === "gtin14-v1") return v.replace(/\D/g, "").padStart(14, "0");
    if (rule === "cik10-v1") return v.replace(/\D/g, "").padStart(10, "0");
    if (rule === "doi-lowercase-v1") return v.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:/i, "").toLowerCase();
    if (rule === "web-domain-v1") return v.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
    if (rule === "orcid-v1") return v.replace(/^https?:\/\/orcid\.org\//i, "").toUpperCase();
    if (rule === "uuid-lower-v1") return v.toLowerCase();
    if (rule === "casrn-v1") return v.replace(/\s+/g, "");
    if (/digits/.test(rule)) return v.replace(/\D/g, "");
    if (/upper/.test(rule)) return v.toUpperCase().replace(/\s+/g, "");
    return v;
  }

  /** Executor rule versions bound into every plan (rulesDigest). */
  rulesDigest(): string {
    return canonicalDigest({
      schemaReleaseDigest: this.schemaReleaseDigest,
      kn15: KN15_TABLE_VERSION,
      uri: "bks-canonical-uri/v1",
      qualifiers: QUALIFIER_GRAMMAR_VERSION,
      uids: "bks-uid-mint/v2",
      contact: "od17-contact-strip/v1",
      renditionException: "od08/v1",
      fieldEvidence: "od11/v1",
      slots: "od05-subject-slot-asserter/v1",
    });
  }

  /** Derivation notes of executorOps per node type (for the report). */
  executorOpsTable(): Array<{ type: string; ops: string[]; projectionOnly: boolean; updatable: string[] | null; derivation: string }> {
    // ops come from the release (S1 executorOps) when present; executorOpsDisagreements lists the cross-check deltas.
    return [...this.nodes.values()].map((n) => ({ type: n.name, ops: [...n.executorOps], projectionOnly: n.projectionOnly, updatable: n.updatableProperties, derivation: n.derivation }));
  }
}

export const KN15_TABLE_VERSION = "kn15-assertion-status/v1";
export const QUALIFIER_GRAMMAR_VERSION = "bks-qualifier-grammar/v1";

/**
 * Qualifier grammar (D12 qualifierGrammar rule, adopted kernel-wide): `key:VALUE`, key lowerCamel, VALUE an enum
 * value when the key names one, otherwise a token without spaces; free text only under keys ending in `Verbatim`.
 * Typed keys: comparator (operator), comparatorArm (an arm uid), segment (D9 segment kind), asserterBasis, population,
 * jurisdiction, basis, massBasis, referent, scale.
 */
export class QualifierGrammar {
  private readonly typed: Record<string, (value: string) => string | null>;
  /** Release qualifier registry (prefix -> entry); null for the candidate (built-in grammar). */
  readonly registry: Record<string, { name: string; separator: string; valueGrammar: string; status: string }> | null;
  private readonly registryKeys: string[];
  constructor(private readonly schema: WriteSchema) {
    this.registry = schema.release.qualifiers?.qualifiers ?? null;
    this.registryKeys = Object.keys(this.registry ?? {}).sort((a, b) => b.length - a.length);
    const enumOrToken = (enumName: string) => (v: string) => (schema.enums.has(enumName) ? (schema.enumHas(enumName, v) ? null : `not a ${enumName} value`) : /^\S+$/.test(v) ? null : "must be a token");
    this.typed = {
      comparator: (v) => (["GT", "GTE", "LT", "LTE", "EQ", "NE", "APPROX"].includes(v) ? null : "comparator is one of GT|GTE|LT|LTE|EQ|NE|APPROX (MD-D12-02: GE/LE are GTE/LTE)"),
      comparatorArm: (v) => (/^hu:study-arm:[A-Za-z0-9][A-Za-z0-9._\-/]*$/.test(v) ? null : "comparatorArm names a StudyArm uid (hu:study-arm:...)"),
      segment: enumOrToken("SegmentKind"),
      asserterBasis: (v) => (["PUBLISHER_DEFAULT", "INFERRED", "EXECUTOR_DEFAULT", "SELF_IDENTIFIED", "BYLINE"].includes(v) ? null : "asserterBasis is PUBLISHER_DEFAULT|INFERRED|EXECUTOR_DEFAULT|SELF_IDENTIFIED|BYLINE"),
      basis: enumOrToken("AmountBasis"),
      massBasis: enumOrToken("MassBasis"),
      referent: enumOrToken("AmountReferent"),
      jurisdiction: (v) => (/^[A-Z]{2}(-[A-Z0-9]{1,3})?$|^EU$|^INTL$/.test(v) ? null : "jurisdiction is ISO 3166 alpha-2 (or EU/INTL)"),
    };
  }

  /** Returns errors for one entry (empty when valid). Registry mode when the release ships qualifiers.yaml. */
  check(entry: string): string[] {
    if (this.registry) return this.checkRegistered(entry);
    const i = entry.indexOf(":");
    if (i <= 0) return [`qualifier ${JSON.stringify(entry)} is not key:VALUE`];
    const key = entry.slice(0, i);
    const value = entry.slice(i + 1);
    const errors: string[] = [];
    if (!/^[a-z][A-Za-z0-9]*$/.test(key)) errors.push(`qualifier key ${key} is not lowerCamel`);
    if (!value) errors.push(`qualifier ${key} has an empty value`);
    if (!key.endsWith("Verbatim") && /\s/.test(value)) errors.push(`qualifier ${key}: value has spaces (free text goes under a key ending in Verbatim)`);
    const typed = this.typed[key];
    if (typed && value) {
      const e = typed(value);
      if (e) errors.push(`qualifier ${key}: ${e}`);
    }
    return errors;
  }

  /** Registered prefix (name + separator) for an entry, longest match first; alias entries resolve to their target. */
  prefixOf(entry: string): { key: string; grammar: string; alias: string | null } | null {
    if (!this.registry) return null;
    for (const key of this.registryKeys) {
      if (!entry.startsWith(key)) continue;
      const e = this.registry[key]!;
      const alias = /^alias-of:(.+)$/.exec(e.status ?? "")?.[1] ?? null;
      const target = alias ? this.registry[alias] : e;
      return { key, grammar: String((target ?? e).valueGrammar ?? "text"), alias };
    }
    return null;
  }

  /** Whether a prefix (e.g. `dose:`, `exclusivity=`) is registered. */
  registered(prefix: string): boolean {
    return Boolean(this.registry && this.registry[prefix]);
  }

  private checkRegistered(entry: string): string[] {
    const p = this.prefixOf(entry);
    if (!p) return [`QUALIFIER_UNREGISTERED: ${JSON.stringify(entry.slice(0, 40))} has no registered prefix in vocabularies/qualifiers.yaml (the executor refuses unregistered prefixes)`];
    const value = entry.slice(p.key.length);
    if (!value) return [`qualifier ${p.key} has an empty value`];
    if (/^\s/.test(value)) return [`qualifier ${p.key}: no space after the separator`];
    const atoms = p.grammar.replace(/\([^)]*\)/g, "").split(" | ").map((a) => a.trim()).filter(Boolean);
    if (atoms.some((a) => this.atomMatches(a, value))) return [];
    return [`qualifier ${p.key}: ${JSON.stringify(value.slice(0, 60))} does not match ${p.grammar}`];
  }

  private atomMatches(atom: string, v: string): boolean {
    if (atom === "text") return v.length > 0;
    if (atom === "uid") return /^hu:[a-z0-9-]+:[A-Za-z0-9][A-Za-z0-9._\-/]*$/.test(v);
    if (atom === "number") return /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(v);
    if (atom === "iso-date") return /^\d{4}-\d{2}-\d{2}$/.test(v);
    if (atom === "iso-duration") return /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?$/.test(v);
    if (atom === "ucum-unit") return /^\S+$/.test(v);
    if (atom.startsWith("enum:[")) return atom.slice(6, atom.lastIndexOf("]")).split("|").map((x) => x.trim()).includes(v);
    if (atom.startsWith("enum:")) {
      const name = atom.slice(5).trim();
      return this.schema.enums.has(name) ? this.schema.enumHas(name, v) : /^\S+$/.test(v);
    }
    if (atom.startsWith("key:") || atom.startsWith("code:")) return /^\S+$/.test(v);
    return /^\S+$/.test(v);
  }
}

export type { IdentifierSchemeEntry };
