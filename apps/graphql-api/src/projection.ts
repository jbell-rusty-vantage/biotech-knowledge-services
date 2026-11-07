import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { Neo4jGraphQL, type Neo4jGraphQLConstructor } from "@neo4j/graphql";

export type Neo4jFeaturesSettings = NonNullable<Neo4jGraphQLConstructor["features"]>;
import {
  Kind,
  parse,
  print,
  printSchema,
  visit,
  type ConstArgumentNode,
  type ConstDirectiveNode,
  type DefinitionNode,
  type DocumentNode,
  type FieldDefinitionNode,
  type GraphQLSchema,
  type InterfaceTypeDefinitionNode,
  type ObjectTypeDefinitionNode,
} from "graphql";
import type { Driver } from "neo4j-driver";
import { digestOfJson, sha256Digest } from "./hash.js";

/**
 * Consumer projection (SPECIFICATION 5.1): the executable product API is a separately fingerprinted build of the
 * canonical source SDL. Every transformation is declared in `projection/manifest.json`; the manifest may omit
 * operational/private fields, disable costly root entry points, cut unused scalar filters/sorts and add visibility,
 * but it never renames a domain type, field or relationship.
 *
 * `buildExecutable` is the only builder: the server, print-schema, the registry builder, the benchmarks and the tests
 * call it, so the printed executable is byte-identical to what the server executes.
 */

export interface FieldRule {
  /** `Type.field`, `*.field` (every object/interface/relationship-properties type) or `Type.*` is not allowed. */
  field: string;
  reason: string;
}

export interface ProjectionManifest {
  format: "bks-consumer-projection.v1";
  projectionVersion: string;
  neo4jGraphql: string;
  features: { excludeDeprecatedFields: Required<NonNullable<Neo4jFeaturesSettings["excludeDeprecatedFields"]>> };
  limits: { rootDefault: number; rootMax: number; nestedMax: number };
  stripDirectives: Array<{ directive: string; reason: string }>;
  omitTypes: Array<{ type: string; reason: string }>;
  omitFields: FieldRule[];
  /** Fields served only together with companion fields (e.g. MD-D10-06 publisherUid with its three provenance stamps). */
  conditionalFields?: Array<{ field: string; requires: string[]; reason: string }>;
  privateFieldPatterns: { patterns: string[]; reason: string };
  interfaceFields: Array<{ interface: string; field: string; type: string; reason: string }>;
  rootQueries: {
    unions: { read: boolean; reason: string };
    types: Array<{ type: string; read?: boolean; connection?: boolean; reason: string }>;
  };
  visibility: {
    field: string;
    publicValue: string;
    restricted: Array<{ value: string; claim: string }>;
    jwtType: string;
    reason: string;
  };
  scalarCuts: {
    rule: string;
    alwaysKeep: string[];
    /** Per type: scalar fields whose value filters are removed (`@filterable(byValue: false, byAggregate: false)`). */
    filter: Record<string, string[]>;
    /** Per type: scalar fields whose sort entries are removed (`@sortable(byValue: false)`). */
    sort: Record<string, string[]>;
  };
}

export interface ProjectionReport {
  omittedTypes: string[];
  omittedFields: string[];
  privateFieldsStripped: string[];
  strippedDirectives: Record<string, number>;
  limitedTypes: number;
  visibilityTypes: number;
  disabledRootQueries: string[];
  filterCuts: number;
  sortCuts: number;
}

export interface ExecutableBuild {
  neoSchema: Neo4jGraphQL;
  schema: GraphQLSchema;
  projectedSdl: string;
  printed: string;
  report: ProjectionReport;
  libraryFeatures: Neo4jFeaturesSettings;
  identity: {
    projectionManifestDigest: string;
    projectedSdlDigest: string;
    productProjectionDigest: string;
    executableGraphqlDigest: string;
  };
  buildMs: number;
}

const here = dirname(fileURLToPath(import.meta.url));

export function appRoot(): string {
  return resolve(here, "..");
}

export function defaultManifestPath(): string {
  return join(appRoot(), "projection", "manifest.json");
}

export function loadProjectionManifest(path: string = defaultManifestPath()): { manifest: ProjectionManifest; bytes: Buffer; path: string } {
  const bytes = readFileSync(path);
  const manifest = JSON.parse(bytes.toString("utf8")) as ProjectionManifest;
  if (manifest.format !== "bks-consumer-projection.v1") throw new Error(`${path}: unsupported projection format ${String(manifest.format)}`);
  return { manifest, bytes, path };
}

const NODE = "node";
const REL_PROPS = "relationshipProperties";

function name(value: string) {
  return { kind: Kind.NAME, value } as const;
}

function intArg(argName: string, value: number): ConstArgumentNode {
  return { kind: Kind.ARGUMENT, name: name(argName), value: { kind: Kind.INT, value: String(value) } };
}

function boolArg(argName: string, value: boolean): ConstArgumentNode {
  return { kind: Kind.ARGUMENT, name: name(argName), value: { kind: Kind.BOOLEAN, value } };
}

function directive(directiveName: string, args: ConstArgumentNode[]): ConstDirectiveNode {
  return { kind: Kind.DIRECTIVE, name: name(directiveName), arguments: args };
}

function hasDirective(node: { directives?: readonly ConstDirectiveNode[] | undefined }, directiveName: string): boolean {
  return (node.directives ?? []).some((d) => d.name.value === directiveName);
}

/** Replaces (or adds) a directive, merging the given arguments over existing ones. */
function upsertDirective(directives: readonly ConstDirectiveNode[] | undefined, directiveName: string, args: ConstArgumentNode[]): ConstDirectiveNode[] {
  const list = [...(directives ?? [])];
  const index = list.findIndex((d) => d.name.value === directiveName);
  if (index < 0) return [...list, directive(directiveName, args)];
  const existing = list[index]!;
  const merged = new Map((existing.arguments ?? []).map((a) => [a.name.value, a] as const));
  for (const a of args) merged.set(a.name.value, a);
  list[index] = { ...existing, arguments: [...merged.values()] };
  return list;
}

function visibilityDirective(manifest: ProjectionManifest): ConstDirectiveNode {
  const v = manifest.visibility;
  const rules = [
    `{ operations: [READ], where: { node: { ${v.field}: { eq: ${v.publicValue} } } } }`,
    ...v.restricted.map((r) => `{ operations: [READ], where: { jwt: { ${r.claim}: { eq: true } }, node: { ${v.field}: { eq: ${r.value} } } } }`),
  ];
  const doc = parse(`type X @authorization(filter: [${rules.join(", ")}]) { x: Int }`);
  return (doc.definitions[0] as ObjectTypeDefinitionNode).directives![0]!;
}

function jwtTypeDefinition(manifest: ProjectionManifest): DefinitionNode {
  const claims = manifest.visibility.restricted.map((r) => `  ${r.claim}: Boolean`).join("\n");
  return parse(`"Verified BFF actor-context claims read by the visibility rules (consumer projection; not a graph type)."\ntype ${manifest.visibility.jwtType} @jwt {\n  sub: String\n${claims}\n}`).definitions[0]!;
}

function fieldMatches(rule: string, typeName: string, fieldName: string): boolean {
  const [t, f] = rule.split(".");
  return (t === "*" || t === typeName) && f === fieldName;
}

/** Applies the manifest to the source SDL. Pure and deterministic; throws when a rule references something absent. */
export function applyProjection(sourceSdl: string, manifest: ProjectionManifest): { sdl: string; report: ProjectionReport } {
  const source = parse(sourceSdl, { noLocation: true });
  const report: ProjectionReport = {
    omittedTypes: [],
    omittedFields: [],
    privateFieldsStripped: [],
    strippedDirectives: {},
    limitedTypes: 0,
    visibilityTypes: 0,
    disabledRootQueries: [],
    filterCuts: 0,
    sortCuts: 0,
  };

  const typeNames = new Set<string>();
  const fieldsByType = new Map<string, Set<string>>();
  for (const d of source.definitions) {
    if (d.kind === Kind.OBJECT_TYPE_DEFINITION || d.kind === Kind.INTERFACE_TYPE_DEFINITION) {
      typeNames.add(d.name.value);
      fieldsByType.set(d.name.value, new Set((d.fields ?? []).map((f) => f.name.value)));
    } else if (d.kind === Kind.UNION_TYPE_DEFINITION || d.kind === Kind.ENUM_TYPE_DEFINITION) {
      typeNames.add(d.name.value);
    }
  }
  const assertType = (t: string, where: string) => {
    if (!typeNames.has(t)) throw new Error(`projection manifest ${where} references unknown type ${t}`);
  };
  const assertField = (rule: string, where: string) => {
    const [t, f] = rule.split(".");
    if (!t || !f || f === "*") throw new Error(`projection manifest ${where} has malformed field rule ${rule}`);
    if (t === "*") {
      if (![...fieldsByType.values()].some((fs) => fs.has(f))) throw new Error(`projection manifest ${where} rule ${rule} matches no field`);
      return;
    }
    assertType(t, where);
    if (!fieldsByType.get(t)?.has(f)) throw new Error(`projection manifest ${where} references unknown field ${rule}`);
  };

  // Conditional fields: omitted unless every companion field is present in the source type.
  const conditionalOmissions: FieldRule[] = [];
  for (const rule of manifest.conditionalFields ?? []) {
    const [t, f] = rule.field.split(".");
    const fields = fieldsByType.get(t!);
    if (!fields?.has(f!)) continue;
    if (!rule.requires.every((r) => fields.has(r))) conditionalOmissions.push({ field: rule.field, reason: rule.reason });
  }
  const omitFieldRules = [...manifest.omitFields, ...conditionalOmissions];
  const omitTypes = new Set(manifest.omitTypes.map((o) => o.type));
  for (const t of omitTypes) assertType(t, "omitTypes");
  for (const rule of manifest.omitFields) assertField(rule.field, "omitFields");
  for (const [t, fields] of Object.entries(manifest.scalarCuts.filter)) for (const f of fields) assertField(`${t}.${f}`, "scalarCuts.filter");
  for (const [t, fields] of Object.entries(manifest.scalarCuts.sort)) for (const f of fields) assertField(`${t}.${f}`, "scalarCuts.sort");
  for (const r of manifest.rootQueries.types) assertType(r.type, "rootQueries.types");
  for (const add of manifest.interfaceFields) assertType(add.interface, "interfaceFields");
  const privatePatterns = manifest.privateFieldPatterns.patterns.map((p) => new RegExp(p, "i"));
  const stripDirectiveNames = new Set(manifest.stripDirectives.map((s) => s.directive));
  const rootRules = new Map(manifest.rootQueries.types.map((r) => [r.type, r] as const));
  const filterCuts = new Map(Object.entries(manifest.scalarCuts.filter).map(([t, fs]) => [t, new Set(fs)] as const));
  const sortCuts = new Map(Object.entries(manifest.scalarCuts.sort).map(([t, fs]) => [t, new Set(fs)] as const));
  const limits = manifest.limits;
  const limitDirective = directive("limit", [intArg("default", limits.rootDefault), intArg("max", limits.rootMax)]);
  const auth = visibilityDirective(manifest);

  const namedTypeOf = (field: FieldDefinitionNode): string => {
    let t = field.type;
    while (t.kind !== Kind.NAMED_TYPE) t = t.type;
    return t.name.value;
  };

  const shapeFields = (typeName: string, fields: readonly FieldDefinitionNode[] | undefined, isRelProps: boolean, isNodeOrRel: boolean): FieldDefinitionNode[] => {
    const out: FieldDefinitionNode[] = [];
    for (const field of fields ?? []) {
      const fieldName = field.name.value;
      if (omitFieldRules.some((r) => fieldMatches(r.field, typeName, fieldName))) {
        report.omittedFields.push(`${typeName}.${fieldName}`);
        continue;
      }
      if (privatePatterns.some((p) => p.test(fieldName))) {
        report.privateFieldsStripped.push(`${typeName}.${fieldName}`);
        continue;
      }
      // Relationship fields to an omitted type disappear with it.
      if (omitTypes.has(namedTypeOf(field))) {
        report.omittedFields.push(`${typeName}.${fieldName}`);
        continue;
      }
      let directives = (field.directives ?? []).filter((d) => {
        if (!stripDirectiveNames.has(d.name.value)) return true;
        report.strippedDirectives[d.name.value] = (report.strippedDirectives[d.name.value] ?? 0) + 1;
        return false;
      });
      const isRelationship = directives.some((d) => d.name.value === "relationship");
      if (isNodeOrRel && !isRelationship) {
        if (filterCuts.get(typeName)?.has(fieldName)) {
          directives = upsertDirective(directives, "filterable", [boolArg("byValue", false), boolArg("byAggregate", false)]);
          report.filterCuts++;
        }
        if (sortCuts.get(typeName)?.has(fieldName)) {
          directives = upsertDirective(directives, "sortable", [boolArg("byValue", false)]);
          report.sortCuts++;
        }
      }
      void isRelProps;
      out.push({ ...field, directives });
    }
    return out;
  };

  const definitions: DefinitionNode[] = [];
  for (const d of source.definitions) {
    if (d.kind === Kind.OBJECT_TYPE_DEFINITION) {
      if (omitTypes.has(d.name.value)) {
        report.omittedTypes.push(d.name.value);
        continue;
      }
      const isNode = hasDirective(d, NODE);
      const isRelProps = hasDirective(d, REL_PROPS);
      let directives = (d.directives ?? []).filter((x) => !stripDirectiveNames.has(x.name.value));
      if (isNode) {
        if (!hasDirective(d, "limit")) {
          directives = [...directives, limitDirective];
          report.limitedTypes++;
        }
        // L2: zero generated mutations, whatever the source says.
        directives = upsertDirective(directives, "mutation", [{ kind: Kind.ARGUMENT, name: name("operations"), value: { kind: Kind.LIST, values: [] } }]);
        directives = [...directives, auth];
        report.visibilityTypes++;
        const rule = rootRules.get(d.name.value);
        if (rule) {
          directives = upsertDirective(directives, "query", [
            ...(rule.read !== undefined ? [boolArg("read", rule.read)] : []),
            ...(rule.connection !== undefined ? [boolArg("connection", rule.connection)] : []),
            boolArg("aggregate", false),
          ]);
          report.disabledRootQueries.push(d.name.value);
        }
      }
      const node: ObjectTypeDefinitionNode = {
        ...d,
        directives,
        interfaces: (d.interfaces ?? []).filter((i) => !omitTypes.has(i.name.value)),
        fields: shapeFields(d.name.value, d.fields, isRelProps, isNode || isRelProps),
      };
      definitions.push(node);
      continue;
    }
    if (d.kind === Kind.INTERFACE_TYPE_DEFINITION) {
      if (omitTypes.has(d.name.value)) throw new Error(`projection cannot omit interface ${d.name.value}`);
      let directives = d.directives ?? [];
      if (!hasDirective(d, "limit")) {
        directives = [...directives, limitDirective];
        report.limitedTypes++;
      }
      const rule = rootRules.get(d.name.value);
      if (rule) {
        directives = upsertDirective(directives, "query", [
          ...(rule.read !== undefined ? [boolArg("read", rule.read)] : []),
          ...(rule.connection !== undefined ? [boolArg("connection", rule.connection)] : []),
          boolArg("aggregate", false),
        ]);
        report.disabledRootQueries.push(d.name.value);
      }
      let fields = shapeFields(d.name.value, d.fields, false, false);
      for (const add of manifest.interfaceFields.filter((a) => a.interface === d.name.value)) {
        if (fields.some((f) => f.name.value === add.field)) continue;
        const parsed = parse(`interface X { ${add.field}: ${add.type} }`).definitions[0] as InterfaceTypeDefinitionNode;
        fields = [...fields, parsed.fields![0]!];
      }
      definitions.push({ ...d, directives, fields } satisfies InterfaceTypeDefinitionNode);
      continue;
    }
    if (d.kind === Kind.UNION_TYPE_DEFINITION) {
      const types = (d.types ?? []).filter((t) => !omitTypes.has(t.name.value));
      if (types.length === 0) {
        report.omittedTypes.push(d.name.value);
        continue;
      }
      const directives = manifest.rootQueries.unions.read ? (d.directives ?? []) : upsertDirective(d.directives, "query", [boolArg("read", false)]);
      if (!manifest.rootQueries.unions.read) report.disabledRootQueries.push(d.name.value);
      definitions.push({ ...d, types, directives });
      continue;
    }
    definitions.push(d);
  }
  definitions.push(jwtTypeDefinition(manifest));

  // Drop interface implementations of omitted types (already filtered) and verify no dangling reference remains.
  const projected: DocumentNode = { kind: Kind.DOCUMENT, definitions };
  const sdl = print(
    visit(projected, {
      Directive(node) {
        if (!stripDirectiveNames.has(node.name.value)) return undefined;
        report.strippedDirectives[node.name.value] = (report.strippedDirectives[node.name.value] ?? 0) + 1;
        return null;
      },
    }),
  );
  return { sdl, report };
}

export function featuresFromManifest(manifest: ProjectionManifest): Neo4jFeaturesSettings {
  return {
    excludeDeprecatedFields: { ...manifest.features.excludeDeprecatedFields },
    // Library token decoding is deliberately unusable: visibility reads only the pre-verified actor JWT that the
    // server places in `context.jwt` after its own verification (src/actor.ts). A random per-process key means a raw
    // `context.token` can never authenticate, and the library's missing-settings warning stays quiet.
    authorization: { key: randomBytes(32).toString("hex") },
  };
}

export interface BuildOptions {
  driver?: Driver;
  /** Bytes of the manifest file; digests use them when present (otherwise canonical JSON of the manifest object). */
  manifestBytes?: Uint8Array;
}

/**
 * The one executable builder. `features` overrides the manifest-derived library features (tests only); production
 * passes none. Vector/OpenAI wiring does not exist in the consumer path: no `vector` feature is ever passed.
 */
export async function buildExecutable(sourceSdl: string, manifest: ProjectionManifest, features: Partial<Neo4jFeaturesSettings> = {}, options: BuildOptions = {}): Promise<ExecutableBuild> {
  if ("vector" in features) throw new Error("product vector search is unsupported in this release; the consumer build never enables the vector feature");
  const started = performance.now();
  const { sdl: projectedSdl, report } = applyProjection(sourceSdl, manifest);
  const libraryFeatures: Neo4jFeaturesSettings = { ...featuresFromManifest(manifest), ...features };
  const neoSchema = new Neo4jGraphQL({ typeDefs: projectedSdl, ...(options.driver ? { driver: options.driver } : {}), features: libraryFeatures });
  const schema = await neoSchema.getSchema();
  const buildMs = performance.now() - started;
  if (schema.getMutationType()) throw new Error("consumer executable must not have a Mutation root");
  if (schema.getSubscriptionType()) throw new Error("consumer executable must not have a Subscription root");
  const printed = printSchema(schema);
  const projectionManifestDigest = options.manifestBytes ? sha256Digest(options.manifestBytes) : digestOfJson(manifest);
  const projectedSdlDigest = sha256Digest(projectedSdl);
  return {
    neoSchema,
    schema,
    projectedSdl,
    printed,
    report,
    libraryFeatures,
    identity: {
      projectionManifestDigest,
      projectedSdlDigest,
      productProjectionDigest: digestOfJson({ projectionManifestDigest, projectedSdlDigest }),
      executableGraphqlDigest: sha256Digest(printed),
    },
    buildMs,
  };
}

const require = createRequire(import.meta.url);

function packageVersion(pkg: string): string {
  try {
    let dir = dirname(require.resolve(pkg));
    for (let i = 0; i < 6; i++) {
      try {
        const json = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as { name?: string; version?: string };
        if (json.name === pkg && json.version) return json.version;
      } catch {
        // keep walking up
      }
      dir = dirname(dir);
    }
  } catch {
    // unresolvable
  }
  return "unknown";
}

/** Resolved library versions of the running build (reported by /identity and every benchmark). */
export function libraryVersions(): Record<string, string> {
  return {
    "@neo4j/graphql": packageVersion("@neo4j/graphql"),
    "@apollo/server": packageVersion("@apollo/server"),
    graphql: packageVersion("graphql"),
    "neo4j-driver": packageVersion("neo4j-driver"),
    jose: packageVersion("jose"),
    express: packageVersion("express"),
    node: process.versions.node,
  };
}
