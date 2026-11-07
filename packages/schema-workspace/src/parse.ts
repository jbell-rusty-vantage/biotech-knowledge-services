import {
  Kind,
  parse,
  print,
  type ConstDirectiveNode,
  type ConstValueNode,
  type DefinitionNode,
  type FieldDefinitionNode,
  type TypeNode,
} from "graphql";
import { digestOfText } from "@bks/contracts";
import type {
  Direction,
  EdgePropertyType,
  EnumType,
  Fragment,
  InterfaceType,
  PredicateEntry,
  NodeType,
  Property,
  PropertyGroup,
  RelationshipClass,
  RelationshipField,
  RelationshipTriple,
  RelationshipTypeSummary,
  SchemaIR,
  SearchIndex,
  Settable,
  UnionType,
  ValidationParams,
} from "./ir.js";

const BUILT_IN_SCALARS = new Set(["String", "Int", "Float", "Boolean", "ID"]);
const NEO4J_SCALARS = new Set(["DateTime", "Date", "Time", "LocalTime", "LocalDateTime", "Duration", "BigInt", "Point", "CartesianPoint"]);

const TEMPORAL_PROPS = new Set([
  "validFrom", "validTo", "validFromPrecision", "validToPrecision", "validFromBasis", "validToBasis",
  "recordedFrom", "recordedTo", "recordedAt", "statedAsOf", "statedAsOfPrecision", "createdAt", "updatedAt",
]);
const SEARCH_PROPS = new Set(["searchText", "searchFields", "embeddingModel", "embeddingDimensions", "searchEmbedding"]);
const OPERATIONAL_PROPS = new Set(["mongoResearchRunId", "privacyClass", "maturity", "schemaVersion", "entityType", "agentRunUid"]);
const IDENTITY_PROPS = new Set(["id", "uid", "externalId", "canonicalUri", "canonicalUrl", "scheme", "issuer", "value", "doi", "pmid", "nctId", "unii", "inchiKey", "gtin", "asin", "legalName"]);

export interface ParseOptions {
  params: ValidationParams;
  /** Extra identity keys per node type from the identity-rules sidecar. */
  identityKeys?: Record<string, string[]>;
  /** Release inputs (v2). When present, modules come from the assembly manifest and the IR is enriched from registers and vocabularies. */
  release?: ReleaseInputs;
}

type Row = Record<string, unknown>;

/** The release sources the v2 IR is built from (all parsed from the verified bundle; see release.ts). */
export interface ReleaseInputs {
  releaseId: string;
  /** sdl/assembled.manifest.json */
  assembly: {
    out?: string;
    parentBaseline?: string;
    modules: Array<{ id: string; file: string; sha256: string; lineStart: number; lineEnd: number; definitionNames: Array<{ name: string; kind: string; line: number }> }>;
  };
  /** release.json moduleOwnership (titles and owners). */
  moduleOwnership?: Record<string, { title?: string; owner?: string }>;
  nodeRegister: { nodes: Row[] };
  relationshipRegister: { relationships: Row[] };
  predicates?: { predicates: Row[] };
  qualifiers?: { qualifiers?: Record<string, Row> };
  assessments?: { kinds?: Record<string, Row>; subkinds?: Record<string, Row> };
  identifierSchemes?: { schemes: Row[] };
  ddl?: { statements: Array<{ name: string; entity: string; labelsOrTypes: string[]; properties: string[]; requirement: string }> };
  projectionRules?: { notReported?: Record<string, { values?: string[] }> };
}

export function parseSchema(sdl: string, options: ParseOptions): SchemaIR {
  const document = parse(sdl, { noLocation: false });
  const lines = sdl.split(/\r?\n/);
  const release = options.release;
  // Module of each definition: the release assembly manifest when present (never banner-name guessing); otherwise the
  // v1 fragment banners or, for an ad-hoc assembled SDL, its `# MODULE <id>` banners.
  const fragments = release ? moduleFragments(release, lines.length) : scanFragments(lines);
  const moduleOfDef = new Map<string, string>();
  if (release) for (const m of release.assembly.modules) for (const d of m.definitionNames) moduleOfDef.set(d.name, m.id);
  const fragmentOfLine = (line: number, name?: string): string => {
    if (release) {
      const id = name ? moduleOfDef.get(name) : undefined;
      if (!id) throw new Error(`release IR: definition ${name ?? `at line ${line}`} is not in the assembly manifest`);
      return id;
    }
    for (const f of fragments) if (line >= f.lineStart && line <= f.lineEnd) return f.id;
    return "SEAM";
  };

  const enumNames = new Set<string>();
  const unionDefs = new Map<string, string[]>();
  const interfaceNames = new Set<string>();
  const scalarNames = new Set<string>([...BUILT_IN_SCALARS, ...NEO4J_SCALARS]);
  const edgePropertyNames = new Set<string>();

  for (const def of document.definitions) {
    if (def.kind === Kind.ENUM_TYPE_DEFINITION) enumNames.add(def.name.value);
    if (def.kind === Kind.UNION_TYPE_DEFINITION) unionDefs.set(def.name.value, (def.types ?? []).map((t) => t.name.value));
    if (def.kind === Kind.INTERFACE_TYPE_DEFINITION) interfaceNames.add(def.name.value);
    if (def.kind === Kind.SCALAR_TYPE_DEFINITION) scalarNames.add(def.name.value);
    if (def.kind === Kind.OBJECT_TYPE_DEFINITION && hasDirective(def.directives, "relationshipProperties")) edgePropertyNames.add(def.name.value);
  }

  const nodes: NodeType[] = [];
  const interfaces: InterfaceType[] = [];
  const edgePropertyTypes: EdgePropertyType[] = [];
  const enums: EnumType[] = [];
  const unions: UnionType[] = [];
  const implementersOf = new Map<string, string[]>();
  const enumUsage = new Map<string, Array<{ type: string; field: string }>>();
  const unionUsage = new Map<string, Array<{ node: string; field: string }>>();
  const edgeUsage = new Map<string, Array<{ node: string; field: string; relationshipType: string }>>();

  const propertyOf = (field: FieldDefinitionNode, ownerName: string): Property => {
    const namedType = resolveNamedType(field.type);
    const kind = enumNames.has(namedType) ? "enum" : "scalar";
    if (kind === "enum") push(enumUsage, namedType, { type: ownerName, field: field.name.value });
    const settable = parseSettable(field.directives);
    const isId = hasDirective(field.directives, "id");
    const timestamp = parseTimestamp(field.directives);
    const alias = getDirective(field.directives, "alias");
    const storedName = alias ? String(argValue(alias, "property") ?? field.name.value) : field.name.value;
    const name = field.name.value;
    const readOnly = isId || timestamp !== null || (!settable.onCreate && !settable.onUpdate);
    return {
      name,
      type: print(field.type),
      namedType,
      kind,
      isList: isListType(field.type),
      isRequired: field.type.kind === Kind.NON_NULL_TYPE,
      description: cleanText(field.description?.value ?? ""),
      group: groupOf(name, isId),
      storedName,
      isId,
      timestamp,
      settable,
      readOnly,
      line: field.loc?.startToken.line ?? 0,
    };
  };

  const relationshipOf = (field: FieldDefinitionNode, ownerName: string): RelationshipField | null => {
    const rel = getDirective(field.directives, "relationship");
    const declared = getDirective(field.directives, "declareRelationship");
    if (!rel && !declared) return null;
    const namedType = resolveNamedType(field.type);
    const targetKind = unionDefs.has(namedType) ? "union" : interfaceNames.has(namedType) ? "interface" : "node";
    const meta = parseClassDoc(field.description?.value ?? "");
    const settable = parseSettable(field.directives);
    const propertiesType = rel ? (argValue(rel, "properties") as string | undefined) ?? null : null;
    const relationshipType = rel ? String(argValue(rel, "type")) : "";
    if (targetKind === "union") push(unionUsage, namedType, { node: ownerName, field: field.name.value });
    if (propertiesType) push(edgeUsage, propertiesType, { node: ownerName, field: field.name.value, relationshipType });
    return {
      fieldName: field.name.value,
      relationshipType,
      direction: rel ? (String(argValue(rel, "direction")) as Direction) : "OUT",
      targetType: namedType,
      targetKind,
      targetMembers: [],
      isList: isListType(field.type),
      isRequired: field.type.kind === Kind.NON_NULL_TYPE,
      propertiesType,
      relClass: meta.relClass,
      classNote: meta.classNote,
      cardinality: meta.cardinality,
      catalogNote: meta.catalogNote,
      description: meta.rest,
      settable,
      readOnly: meta.relClass === "derived" || (!settable.onCreate && !settable.onUpdate),
      line: field.loc?.startToken.line ?? 0,
    };
  };

  for (const def of document.definitions) {
    const line = def.loc?.startToken.line ?? 0;
    if (!("name" in def) || !def.name) continue;
    const fragment = fragmentOfLine(line, def.name.value);
    const sdlOf = (d: DefinitionNode) => sdl.slice(d.loc?.start ?? 0, d.loc?.end ?? 0);

    if (def.kind === Kind.ENUM_TYPE_DEFINITION) {
      const description = cleanText(def.description?.value ?? "");
      enums.push({
        name: def.name.value,
        fragment,
        description,
        summary: summarize(description),
        values: (def.values ?? []).map((v) => ({ name: v.name.value, description: cleanText(v.description?.value ?? "") })),
        usedBy: [],
        sdl: sdlOf(def),
        line,
      });
      continue;
    }

    if (def.kind === Kind.UNION_TYPE_DEFINITION) {
      const description = cleanText(def.description?.value ?? "");
      unions.push({
        name: def.name.value,
        fragment,
        description,
        summary: summarize(description),
        members: (def.types ?? []).map((t) => t.name.value),
        usedBy: [],
        sdl: sdlOf(def),
        line,
      });
      continue;
    }

    if (def.kind === Kind.INTERFACE_TYPE_DEFINITION) {
      const description = cleanText(def.description?.value ?? "");
      const properties: Property[] = [];
      const relationships: RelationshipField[] = [];
      for (const field of def.fields ?? []) {
        const rel = relationshipOf(field, def.name.value);
        if (rel) relationships.push(rel);
        else if (scalarNames.has(resolveNamedType(field.type)) || enumNames.has(resolveNamedType(field.type))) properties.push(propertyOf(field, def.name.value));
      }
      interfaces.push({
        name: def.name.value,
        fragment,
        description,
        summary: summarize(description),
        properties,
        relationships,
        implementers: [],
        sdl: sdlOf(def),
        line,
      });
      continue;
    }

    if (def.kind !== Kind.OBJECT_TYPE_DEFINITION) continue;

    if (hasDirective(def.directives, "relationshipProperties")) {
      const description = cleanText(def.description?.value ?? "");
      edgePropertyTypes.push({
        name: def.name.value,
        fragment,
        description,
        summary: summarize(description),
        properties: (def.fields ?? []).map((f) => propertyOf(f, def.name.value)),
        usedBy: [],
        sdl: sdlOf(def),
        line,
      });
      continue;
    }

    const nodeDirective = getDirective(def.directives, "node");
    if (!nodeDirective) continue;

    const labels = (argValue(nodeDirective, "labels") as string[] | undefined) ?? [def.name.value];
    const properties: Property[] = [];
    const relationships: RelationshipField[] = [];
    for (const field of def.fields ?? []) {
      const rel = relationshipOf(field, def.name.value);
      if (rel) {
        relationships.push(rel);
        continue;
      }
      const named = resolveNamedType(field.type);
      if (scalarNames.has(named) || enumNames.has(named)) properties.push(propertyOf(field, def.name.value));
    }
    const description = cleanText(def.description?.value ?? "");
    const ifaces = (def.interfaces ?? []).map((i) => i.name.value);
    for (const i of ifaces) push(implementersOf, i, def.name.value);
    const mutation = getDirective(def.directives, "mutation");
    const mutationOps = mutation ? ((argValue(mutation, "operations") as string[] | undefined) ?? []) : ["CREATE", "UPDATE", "DELETE"];
    const extraIdentity = options.identityKeys?.[def.name.value] ?? [];
    const identityKeys = unique([
      ...properties.filter((p) => p.isId || p.name === "uid").map((p) => p.name),
      ...properties.filter((p) => IDENTITY_PROPS.has(p.name) && p.name !== "id" && p.name !== "uid").map((p) => p.name),
      ...extraIdentity.filter((k) => properties.some((p) => p.name === k)),
    ]);
    nodes.push({
      name: def.name.value,
      fragment,
      description,
      summary: summarize(description),
      labels,
      primaryLabel: labels[0] ?? def.name.value,
      archetypeLabel: labels.length > 1 ? (labels[labels.length - 1] ?? null) : null,
      interfaces: ifaces,
      allowedMutations: {
        create: mutationOps.includes("CREATE"),
        update: mutationOps.includes("UPDATE"),
        delete: mutationOps.includes("DELETE"),
      },
      searchIndexes: parseSearchIndexes(def.directives),
      properties,
      relationships,
      uidToken: options.params.uidTypeTokens[def.name.value] ?? null,
      identityKeys,
      sdl: sdlOf(def),
      line,
      module: fragment,
      storedLabels: labels,
      archetype: labels.length > 1 ? (labels[labels.length - 1] ?? null) : null,
      identityRule: [],
      identifierSchemes: [],
      executorOps: [],
      executorPolicy: "",
      projectionGate: null,
      provenanceRequirement: "",
      temporalScope: temporalScopeOf(properties),
      exclusiveSlots: [],
      notReportedFields: [],
    });
  }

  // Resolve target members and usage back-references.
  const nodeNames = new Set(nodes.map((n) => n.name));
  const implementersLookup = (name: string) => (implementersOf.get(name) ?? []).filter((n) => nodeNames.has(n));
  const membersOf = (field: RelationshipField): string[] => {
    if (field.targetKind === "union") return (unionDefs.get(field.targetType) ?? []).filter((m) => nodeNames.has(m));
    if (field.targetKind === "interface") return implementersLookup(field.targetType);
    return nodeNames.has(field.targetType) ? [field.targetType] : [];
  };
  for (const node of nodes) for (const rel of node.relationships) rel.targetMembers = membersOf(rel);
  for (const iface of interfaces) {
    iface.implementers = implementersLookup(iface.name);
    for (const rel of iface.relationships) rel.targetMembers = membersOf(rel);
  }
  for (const e of enums) e.usedBy = enumUsage.get(e.name) ?? [];
  for (const u of unions) u.usedBy = unionUsage.get(u.name) ?? [];
  for (const ep of edgePropertyTypes) ep.usedBy = edgeUsage.get(ep.name) ?? [];

  // Fragment membership.
  for (const f of fragments) {
    f.nodeTypes = nodes.filter((n) => n.fragment === f.id).map((n) => n.name);
    f.interfaces = interfaces.filter((n) => n.fragment === f.id).map((n) => n.name);
    f.edgePropertyTypes = edgePropertyTypes.filter((n) => n.fragment === f.id).map((n) => n.name);
    f.enums = enums.filter((n) => n.fragment === f.id).map((n) => n.name);
    f.unions = unions.filter((n) => n.fragment === f.id).map((n) => n.name);
  }
  if (nodes.some((n) => n.fragment === "SEAM") || unions.some((u) => u.fragment === "SEAM") || enums.some((e) => e.fragment === "SEAM")) {
    fragments.push({
      id: "SEAM",
      title: "SEAM CLOSURE: definitions added at merge",
      modules: [],
      competencyQuestions: "",
      purpose: "Definitions appended at assembly (sole writer Fable); each names the request that needed it.",
      lineStart: fragments[fragments.length - 1]?.lineEnd ?? 0,
      lineEnd: lines.length,
      nodeTypes: nodes.filter((n) => n.fragment === "SEAM").map((n) => n.name),
      interfaces: interfaces.filter((n) => n.fragment === "SEAM").map((n) => n.name),
      edgePropertyTypes: edgePropertyTypes.filter((n) => n.fragment === "SEAM").map((n) => n.name),
      enums: enums.filter((n) => n.fragment === "SEAM").map((n) => n.name),
      unions: unions.filter((n) => n.fragment === "SEAM").map((n) => n.name),
    });
  }

  const relationshipTypes = buildRelationshipTypes(nodes, options.params);
  const moduleOrder = fragments.map((f) => f.id);
  for (const r of relationshipTypes) r.module = KERNEL_MEANING.has(r.type) && moduleOrder.includes("K") ? "K" : (moduleOrder.find((m) => r.fragments.includes(m)) ?? r.fragments[0] ?? "");

  const ir: SchemaIR = {
    irVersion: "bks-schema-ir.v2",
    schemaDigest: digestOfText(sdl),
    parsedAt: new Date().toISOString(),
    fragments,
    nodes: nodes.sort((a, b) => a.name.localeCompare(b.name)),
    interfaces: interfaces.sort((a, b) => a.name.localeCompare(b.name)),
    edgePropertyTypes: edgePropertyTypes.sort((a, b) => a.name.localeCompare(b.name)),
    enums: enums.sort((a, b) => a.name.localeCompare(b.name)),
    unions: unions.sort((a, b) => a.name.localeCompare(b.name)),
    scalars: [...scalarNames].filter((s) => !BUILT_IN_SCALARS.has(s)).sort(),
    relationshipTypes,
    params: options.params,
    release: null,
    modules: [],
    predicates: [],
    assessments: { kinds: enums.find((e) => e.name === "AssessmentKind")?.values.map((v) => v.name) ?? [], subkinds: [] },
    qualifierGrammar: {},
  };
  if (release) enrichFromRelease(ir, release, interfaceNames, unionDefs);
  return ir;
}

// ---------------------------------------------------------------------------------------------
// Release enrichment (IR v2): registers, vocabularies, rules, DDL
// ---------------------------------------------------------------------------------------------

/** Relationship types whose meaning is the kernel's wherever they are declared (R-01 option A attribution). */
const KERNEL_MEANING = new Set(["ASSESSES", "DERIVED_FROM", "MENTIONS", "RENDITION_OF"]);

const PROVENANCE: Record<string, string> = {
  Entity: "WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version",
  InformationArtifact: "captured bytes: SourceSnapshot contentHash and capture Activity; locators reference exactly one snapshot; reports cite locators",
  Assertion: "ASSERTED_BY an asserter, HAS_EVIDENCE to a SourceLocator (role, origin), WAS_GENERATED_BY the writing Activity; status is capture fidelity, never truth",
  EvidenceAssessment: "ASSESSES its target, DERIVED_FROM its inputs, HAS_EVIDENCE for located support, WAS_GENERATED_BY the assessing Activity; method version recorded",
  Occurrence: "an Activity is one Mission Control run or a native namespaced run (OD-07); lineage via WAS_INFORMED_BY; capture attempts keep sanitized request metadata (EX-03)",
};

function moduleFragments(release: ReleaseInputs, totalLines: number): Fragment[] {
  return release.assembly.modules.map((m) => {
    const own = release.moduleOwnership?.[m.id];
    return {
      id: m.id,
      title: own?.title ? `${m.id}: ${own.title}` : `Module ${m.id}`,
      modules: [m.id],
      competencyQuestions: "",
      purpose: own?.title ?? "",
      lineStart: m.lineStart,
      lineEnd: Math.min(m.lineEnd, totalLines),
      nodeTypes: [],
      interfaces: [],
      edgePropertyTypes: [],
      enums: [],
      unions: [],
    };
  });
}

function temporalScopeOf(properties: Property[]): "bitemporal" | "recorded" | "none" {
  const names = new Set(properties.map((p) => p.name));
  if ((names.has("validFrom") || names.has("validTo")) && (names.has("recordedAt") || names.has("recordedFrom"))) return "bitemporal";
  if (names.has("recordedAt") || names.has("recordedTo") || names.has("recordedFrom")) return "recorded";
  return "none";
}

const str = (v: unknown): string => (v === undefined || v === null ? "" : String(v));
const list = (v: unknown): unknown[] => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v]);
const strs = (v: unknown): string[] => list(v).map((x) => str(x)).filter(Boolean);
/** "D4.Metric" | "Source (K)" | "Subjectable (K interface)" -> SDL type name. */
export function registerTypeName(s: string): string {
  return s.replace(/\s*\(.*\)\s*$/, "").replace(/^(K|D\d+)\./, "").trim();
}

function enrichFromRelease(ir: SchemaIR, release: ReleaseInputs, interfaceNames: Set<string>, unionDefs: Map<string, string[]>): void {
  const p = ir.params;
  ir.release = { releaseId: release.releaseId, sdlPath: release.assembly.out ?? "sdl/assembled.graphql", parentBaseline: release.assembly.parentBaseline ?? null };
  ir.modules = release.assembly.modules.map((m) => ({
    id: m.id,
    file: m.file,
    title: release.moduleOwnership?.[m.id]?.title ?? m.id,
    owner: release.moduleOwnership?.[m.id]?.owner ?? m.id,
    sha256: m.sha256,
    lineStart: m.lineStart,
    lineEnd: m.lineEnd,
    definitions: m.definitionNames.map((d) => d.name),
  }));

  // Relationship types (register class, endpoints, temporal, exclusivity, indexes, OD-45 interface endpoints).
  const regByType = new Map<string, Row[]>();
  for (const r of release.relationshipRegister.relationships) {
    const t = str(r.type);
    regByType.set(t, [...(regByType.get(t) ?? []), r]);
  }
  const ddl = release.ddl?.statements ?? [];
  const exclusive = new Set(p.exclusiveTypes);
  for (const r of ir.relationshipTypes) {
    const rows = regByType.get(r.type) ?? [];
    r.registered = rows.length > 0;
    const from = unique(rows.flatMap((x) => strs(x.from)).map(registerTypeName));
    const to = unique(rows.flatMap((x) => strs(x.to)).map(registerTypeName));
    r.from = from.length ? from : unique(r.triples.map((t) => t.from));
    r.to = to.length ? to : unique(r.triples.map((t) => t.to));
    r.fromMembers = unique(r.triples.map((t) => t.from)).sort();
    r.toMembers = unique(r.triples.map((t) => t.to)).sort();
    r.edgePropertyType = r.propertiesTypes[0] ?? null;
    r.declaredOn = unique(r.triples.flatMap((t) => t.via.map((v) => `${v.node}.${v.field} (${v.direction})`))).sort();
    r.cardinality = unique(rows.map((x) => str(x.cardinality)).filter(Boolean)).join(" | ");
    r.temporal = unique(rows.map((x) => str(x.temporal)).filter(Boolean)).join(" | ");
    r.questions = unique(rows.flatMap((x) => strs(x.questions))).sort();
    r.requiredIndexes = ddl.filter((s) => s.entity === "RELATIONSHIP" && s.labelsOrTypes.includes(r.type) && s.requirement === "required").map((s) => s.name).sort();
    r.exclusive = exclusive.has(r.type);
    r.projectionGate = p.projectionGates?.[r.type] ?? null;
    r.interfaceEndpoints = [];
    for (const [side, names] of [["from", r.from], ["to", r.to]] as const) {
      for (const name of names) {
        if (!interfaceNames.has(name)) continue;
        const ownerModules = rows.map((x) => str(x.module));
        const kernel = r.module === "K" || ownerModules.includes("K") || KERNEL_MEANING.has(r.type);
        r.interfaceEndpoints.push({
          interface: name,
          side,
          rule: kernel ? "kernel-traversal" : "registered-exception",
          members: (side === "from" ? r.fromMembers : r.toMembers).length,
        });
      }
    }
    if (r.interfaceEndpoints.length && !r.flags.includes("interface-target")) r.flags.push("interface-target");
    if (r.projectionGate) r.flags.push(`projection-gate:${r.projectionGate}`);
  }
  void unionDefs;

  // Nodes (register archetype, identity, identifier schemes, executor operations, slots, notReported).
  const regNode = new Map(release.nodeRegister.nodes.map((n) => [str(n.name), n]));
  const schemeStatus = new Map((release.identifierSchemes?.schemes ?? []).map((s) => [str(s.code), str(s.writeStatus) === "active" ? "active" : "disabled"] as const));
  for (const n of ir.nodes) {
    const reg = regNode.get(n.name);
    n.module = n.fragment;
    n.archetype = reg ? str(reg.archetype) || n.archetype : n.archetype;
    n.identityRule = strs(reg?.identityKeys);
    n.identityKeys = unique([...n.identityKeys, ...n.identityRule.filter((k) => n.properties.some((q) => q.name === k))]);
    // Register rows may carry prose next to codes ("SUPPLIER_CODE (requested)", "every ... scheme"): keep scheme codes only.
    n.identifierSchemes = unique(strs(reg?.identifierSchemes).map((s) => s.split(/[\s(]/)[0] ?? s).filter((s) => /^[A-Z][A-Z0-9_]+$/.test(s))).map((scheme) => ({
      scheme,
      writeStatus: (schemeStatus.get(scheme) ?? "unregistered") as "active" | "disabled" | "unregistered",
    }));
    const ops = p.executorOps?.[n.name];
    n.executorOps = ops?.ops ?? [];
    n.executorPolicy = ops?.policy ?? "";
    n.provenanceRequirement = PROVENANCE[n.archetype ?? ""] ?? PROVENANCE.Entity!;
    n.exclusiveSlots = ir.relationshipTypes.filter((r) => r.exclusive && r.fromMembers.includes(n.name)).map((r) => r.type).sort();
    n.notReportedFields = strs(release.projectionRules?.notReported?.[n.name]?.values);
  }

  // Predicates.
  ir.predicates = (release.predicates?.predicates ?? []).map((x) => {
    const status = str(x.status);
    const lit = x.literal as Row | null | undefined;
    return {
      name: str(x.predicate),
      kind: str(x.kind) as PredicateEntry["kind"],
      status,
      registrar: x.registrar ? str(x.registrar) : null,
      subjectTypes: strs(x.subjectTypes).map(registerTypeName),
      objectTypes: strs(x.objectTypes).map(registerTypeName),
      literalForms: lit ? { valueFields: strs(lit.valueFields), unit: lit.unit ? str(lit.unit) : null } : null,
      qualifiers: strs(x.qualifiers),
      requiredQualifiers: strs(x.requiredQualifiers),
      aliasOf: status.startsWith("alias-of:") ? status.slice("alias-of:".length) : null,
      replacedBy: strs(x.replacedBy),
      questions: strs(x.questions),
      field: x.field ? str(x.field) : null,
    };
  });

  // Assessment vocabulary.
  const kinds = release.assessments?.kinds ? Object.keys(release.assessments.kinds) : ir.assessments.kinds;
  ir.assessments = {
    kinds,
    subkinds: Object.values(release.assessments?.subkinds ?? {}).map((s) => ({
      kind: str(s.kind),
      subkind: str(s.subkind),
      registrar: s.registrar ? str(s.registrar) : null,
      status: str(s.status),
      conclusionCodes: strs(s.conclusionCodes),
      facets: Object.fromEntries(Object.entries((s.facets as Record<string, Row> | undefined) ?? {}).map(([k, v]) => [k, { values: strs(v?.values), ...(v?.owner ? { owner: str(v.owner) } : {}) }])),
      admissibleSubjects: strs(s.admissibleSubjects),
      methodVersions: strs(s.methodVersions),
    })),
  };

  // Qualifier grammar.
  ir.qualifierGrammar = Object.fromEntries(
    Object.entries(release.qualifiers?.qualifiers ?? {}).map(([key, q]) => [key, { name: str(q.name), separator: str(q.separator), valueGrammar: str(q.valueGrammar), owner: q.owner ? str(q.owner) : null, status: str(q.status), description: str(q.description) }]),
  );
}

// ---------------------------------------------------------------------------------------------
// Fragments (domain banners in the SDL comments)
// ---------------------------------------------------------------------------------------------

function scanFragments(lines: string[]): Fragment[] {
  const starts: Array<{ id: string; line: number }> = [];
  lines.forEach((text, i) => {
    const m = /^# ---- fragment ([A-Z][A-Z0-9]{0,3}) ----/.exec(text);
    if (m?.[1]) starts.push({ id: m[1], line: i + 1 });
  });
  const seamLine = lines.findIndex((t) => /^# SEAM CLOSURE/.test(t));
  const fragments: Fragment[] = [];
  starts.forEach((start, idx) => {
    const next = starts[idx + 1];
    const lineEnd = next ? next.line - 1 : seamLine > 0 ? seamLine : lines.length;
    // Banner lines sit just above the fragment marker: title "(W##)", purpose, CQs, modules.
    let title = start.id;
    let purpose = "";
    let cqs = "";
    let modules: string[] = [];
    for (let j = start.line - 2; j >= Math.max(0, start.line - 12); j--) {
      const t = lines[j] ?? "";
      const titleMatch = new RegExp(`^# (.+?)\\s*\\(${start.id}\\)\\s*$`).exec(t);
      if (titleMatch?.[1]) title = titleMatch[1].trim();
      const cq = /^# Competency questions:\s*(.*)$/.exec(t);
      if (cq?.[1]) cqs = cq[1].trim();
      const mod = /^# Canonical module\(s\):\s*(.*)$/.exec(t);
      if (mod?.[1]) modules = mod[1].split(",").map((s) => s.trim()).filter(Boolean);
      if (titleMatch) {
        const p = lines[j + 1] ?? "";
        if (p.startsWith("# ") && !p.startsWith("# Competency") && !p.startsWith("# Canonical")) purpose = p.slice(2).trim();
      }
    }
    fragments.push({ id: start.id, title, modules, competencyQuestions: cqs, purpose, lineStart: start.line, lineEnd, nodeTypes: [], interfaces: [], edgePropertyTypes: [], enums: [], unions: [] });
  });
  return fragments;
}

// ---------------------------------------------------------------------------------------------
// Relationship type summaries
// ---------------------------------------------------------------------------------------------

function buildRelationshipTypes(nodes: NodeType[], params: ValidationParams): RelationshipTypeSummary[] {
  const byType = new Map<string, RelationshipTypeSummary>();
  const tripleKey = (from: string, to: string) => `${from}->${to}`;
  const triplesByType = new Map<string, Map<string, RelationshipTriple>>();
  for (const node of nodes) {
    for (const rel of node.relationships) {
      if (!rel.relationshipType) continue;
      const summary = byType.get(rel.relationshipType) ?? {
        type: rel.relationshipType,
        relClass: "unknown",
        classes: [],
        propertiesTypes: [],
        triples: [],
        fragments: [],
        description: "",
        flags: [],
        class: "unknown",
        module: "",
        from: [],
        to: [],
        fromMembers: [],
        toMembers: [],
        edgePropertyType: null,
        declaredOn: [],
        direction: "OUT",
        cardinality: "",
        temporal: "",
        questions: [],
        requiredIndexes: [],
        exclusive: false,
        projectionGate: null,
        interfaceEndpoints: [],
        registered: false,
      };
      if (!summary.classes.includes(rel.relClass)) summary.classes.push(rel.relClass);
      if (rel.propertiesType && !summary.propertiesTypes.includes(rel.propertiesType)) summary.propertiesTypes.push(rel.propertiesType);
      if (!summary.fragments.includes(node.fragment)) summary.fragments.push(node.fragment);
      if (!summary.description && rel.catalogNote) summary.description = rel.catalogNote;
      byType.set(rel.relationshipType, summary);
      const triples = triplesByType.get(rel.relationshipType) ?? new Map<string, RelationshipTriple>();
      const targets = rel.targetMembers.length ? rel.targetMembers : [rel.targetType];
      for (const target of targets) {
        const from = rel.direction === "OUT" ? node.name : target;
        const to = rel.direction === "OUT" ? target : node.name;
        const key = tripleKey(from, to);
        const triple = triples.get(key) ?? { from, to, via: [] };
        triple.via.push({ node: node.name, field: rel.fieldName, direction: rel.direction, propertiesType: rel.propertiesType, relClass: rel.relClass, readOnly: rel.readOnly });
        triples.set(key, triple);
      }
      triplesByType.set(rel.relationshipType, triples);
    }
  }
  for (const [type, summary] of byType) {
    summary.triples = [...(triplesByType.get(type)?.values() ?? [])].sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
    summary.relClass = dominantClass(summary.classes, type, params);
    summary.class = summary.relClass;
    if (params.assertedTypes.includes(type)) summary.flags.push("asserted-registry");
    if (params.derivedTypes.includes(type)) summary.flags.push("derived-registry");
    if (params.ruleOnlyDerivedTypes.includes(type)) summary.flags.push("rule-only-derived");
    if (params.exclusiveTypes.includes(type)) summary.flags.push("exclusive-episodes");
    if (params.legacyTypes.includes(type)) summary.flags.push("legacy-read-only");
    summary.fragments.sort();
  }
  return [...byType.values()].sort((a, b) => a.type.localeCompare(b.type));
}

function dominantClass(classes: RelationshipClass[], type: string, params: ValidationParams): RelationshipClass {
  if (params.derivedTypes.includes(type)) return "derived";
  if (params.assertedTypes.includes(type)) return "asserted";
  if (params.structuralTypes?.includes(type)) return "structural";
  const known = classes.filter((c) => c !== "unknown");
  if (known.includes("asserted")) return "asserted";
  if (known.includes("derived") && !known.includes("structural")) return "derived";
  if (known.includes("structural")) return "structural";
  return "unknown";
}

// ---------------------------------------------------------------------------------------------
// Directive and text helpers
// ---------------------------------------------------------------------------------------------

function hasDirective(directives: readonly ConstDirectiveNode[] | undefined, name: string): boolean {
  return (directives ?? []).some((d) => d.name.value === name);
}

function getDirective(directives: readonly ConstDirectiveNode[] | undefined, name: string): ConstDirectiveNode | undefined {
  return (directives ?? []).find((d) => d.name.value === name);
}

function argValue(directive: ConstDirectiveNode, name: string): unknown {
  const arg = directive.arguments?.find((a) => a.name.value === name);
  return arg ? valueOf(arg.value) : undefined;
}

function valueOf(node: ConstValueNode): unknown {
  switch (node.kind) {
    case Kind.STRING:
    case Kind.ENUM:
      return node.value;
    case Kind.INT:
      return Number.parseInt(node.value, 10);
    case Kind.FLOAT:
      return Number.parseFloat(node.value);
    case Kind.BOOLEAN:
      return node.value;
    case Kind.NULL:
      return null;
    case Kind.LIST:
      return node.values.map(valueOf);
    case Kind.OBJECT:
      return Object.fromEntries(node.fields.map((f) => [f.name.value, valueOf(f.value)]));
    default:
      return undefined;
  }
}

function parseSettable(directives: readonly ConstDirectiveNode[] | undefined): Settable {
  const d = getDirective(directives, "settable");
  if (!d) return { onCreate: true, onUpdate: true };
  const onCreate = argValue(d, "onCreate");
  const onUpdate = argValue(d, "onUpdate");
  return { onCreate: onCreate === undefined ? true : Boolean(onCreate), onUpdate: onUpdate === undefined ? true : Boolean(onUpdate) };
}

function parseTimestamp(directives: readonly ConstDirectiveNode[] | undefined): string[] | null {
  const d = getDirective(directives, "timestamp");
  if (!d) return null;
  return (argValue(d, "operations") as string[] | undefined) ?? ["CREATE", "UPDATE"];
}

function parseSearchIndexes(directives: readonly ConstDirectiveNode[] | undefined): SearchIndex[] {
  const out: SearchIndex[] = [];
  const ft = getDirective(directives, "fulltext");
  for (const idx of (ft ? (argValue(ft, "indexes") as Array<Record<string, unknown>>) : []) ?? []) {
    out.push({ kind: "fulltext", indexName: String(idx.indexName), queryName: String(idx.queryName ?? ""), fields: (idx.fields as string[]) ?? [], embeddingProperty: null });
  }
  const vec = getDirective(directives, "vector");
  for (const idx of (vec ? (argValue(vec, "indexes") as Array<Record<string, unknown>>) : []) ?? []) {
    out.push({ kind: "vector", indexName: String(idx.indexName), queryName: String(idx.queryName ?? ""), fields: [], embeddingProperty: idx.embeddingProperty ? String(idx.embeddingProperty) : null });
  }
  return out;
}

function resolveNamedType(type: TypeNode): string {
  if (type.kind === Kind.NAMED_TYPE) return type.name.value;
  return resolveNamedType(type.type);
}

function isListType(type: TypeNode): boolean {
  if (type.kind === Kind.LIST_TYPE) return true;
  if (type.kind === Kind.NON_NULL_TYPE) return isListType(type.type);
  return false;
}

function groupOf(name: string, isId: boolean): PropertyGroup {
  if (isId || name === "uid" || name === "id") return "identity";
  if (TEMPORAL_PROPS.has(name)) return "temporal";
  if (SEARCH_PROPS.has(name)) return "search";
  if (OPERATIONAL_PROPS.has(name)) return "operational";
  if (IDENTITY_PROPS.has(name)) return "identity";
  return "core";
}

/** Parses the relationship-field docstring convention `class: X (note); cardinality: Y; catalog: Z`. */
export function parseClassDoc(doc: string): { relClass: RelationshipClass; classNote: string; cardinality: string; catalogNote: string; rest: string } {
  const text = cleanText(doc);
  let relClass: RelationshipClass = "unknown";
  let classNote = "";
  let cardinality = "";
  let catalogNote = "";
  const rest: string[] = [];
  for (const segment of splitTopLevel(text)) {
    const m = /^(class|cardinality|catalog)\s*:\s*(.*)$/i.exec(segment.trim());
    if (!m) {
      if (segment.trim()) rest.push(segment.trim());
      continue;
    }
    const key = m[1]!.toLowerCase();
    const value = m[2]!.trim();
    if (key === "class") {
      const cm = /^(structural|asserted|derived)\b\s*(.*)$/i.exec(value);
      if (cm) {
        relClass = cm[1]!.toLowerCase() as RelationshipClass;
        classNote = cm[2]!.replace(/^\(|\)$/g, "").trim();
      } else classNote = value;
    } else if (key === "cardinality") cardinality = value;
    else catalogNote = value;
  }
  return { relClass, classNote, cardinality, catalogNote, rest: rest.join(" ") };
}

/** Splits on `;` that are not inside parentheses. */
function splitTopLevel(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === ";" && depth === 0) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current) out.push(current);
  return out;
}

export function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** First sentence, trimmed to ~200 chars, for one-line index rows. */
export function summarize(description: string, max = 200): string {
  const text = cleanText(description);
  if (!text) return "";
  const sentenceEnd = text.search(/\.\s+(?=[A-Z`'"(])/);
  let s = sentenceEnd > 0 && sentenceEnd < max ? text.slice(0, sentenceEnd + 1) : text;
  if (s.length > max) s = `${s.slice(0, max - 1).trimEnd()}…`;
  return s;
}

function push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
