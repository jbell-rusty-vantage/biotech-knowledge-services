import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { printExecutableGraphQLDocument } from "@graphql-tools/documents";
import {
  Kind,
  getNamedType,
  isInputObjectType,

  isObjectType,
  isInterfaceType,
  parse,
  print,
  specifiedRules,
  validate,
  type DocumentNode,
  type FragmentDefinitionNode,
  type GraphQLInputType,
  type GraphQLSchema,
  type OperationDefinitionNode,
  type SelectionSetNode,
  type TypeNode,
  type ValueNode,
} from "graphql";
import { sha256Digest } from "./hash.js";
import { DEFAULT_ADMISSION_LIMITS, admitOperation, depthLimitRule, encodeCursorOffset, type AdmissionLimits } from "./limits.js";
import type { ExecutableBuild, ProjectionManifest } from "./projection.js";
import type { ConsumerSource } from "./release.js";
import type { CostClass, OperationRegistry, RegisteredOperation, VariableSpec } from "./registry.js";

/** Build-time registry generation and lints (`pnpm api:registry`). Not imported by the server at runtime. */

interface CatalogVariable {
  ref?: string;
  type?: "String" | "Int" | "Boolean";
  required?: boolean;
  default?: unknown;
  min?: number;
  max?: number;
  maxLength?: number;
  pattern?: string;
  cursor?: boolean;
  bind?: "actor.visibility";
}

export interface OperationCatalog {
  format: "bks-operation-catalog.v1";
  documentsDir: string;
  fragmentsFile: string;
  costClasses: Record<string, CostClass>;
  variableTypes: Record<string, CatalogVariable>;
  operations: Array<{ name: string; file: string; costClass: string; questions: string[]; maxResponseBytes?: number; variables: Record<string, CatalogVariable> }>;
}

export const DEFAULT_MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

export function loadCatalog(path: string): { catalog: OperationCatalog; dir: string } {
  const catalog = JSON.parse(readFileSync(path, "utf8")) as OperationCatalog;
  if (catalog.format !== "bks-operation-catalog.v1") throw new Error(`${path}: unsupported catalog format`);
  return { catalog, dir: dirname(path) };
}

function spreadsOf(selectionSet: SelectionSetNode | undefined, out: Set<string>): void {
  if (!selectionSet) return;
  for (const s of selectionSet.selections) {
    if (s.kind === Kind.FRAGMENT_SPREAD) out.add(s.name.value);
    else spreadsOf(s.selectionSet, out);
  }
}

/** The operation plus every fragment it uses transitively (what codegen hashes for a persisted document). */
export function executableDocumentFor(operation: OperationDefinitionNode, fragments: Map<string, FragmentDefinitionNode>): DocumentNode {
  const used = new Set<string>();
  const queue: SelectionSetNode[] = [operation.selectionSet];
  while (queue.length) {
    const set = queue.pop()!;
    const found = new Set<string>();
    spreadsOf(set, found);
    for (const name of found) {
      if (used.has(name)) continue;
      const fragment = fragments.get(name);
      if (!fragment) throw new Error(`${operation.name?.value}: unknown fragment ${name}`);
      used.add(name);
      queue.push(fragment.selectionSet);
    }
  }
  return { kind: Kind.DOCUMENT, definitions: [operation, ...[...used].sort().map((n) => fragments.get(n)!)] };
}

/** Codegen-compatible normalization (client-preset `normalizeAndPrintDocumentNode` minus @client handling, unused here). */
export function normalizeDocument(document: DocumentNode): string {
  return printExecutableGraphQLDocument(document);
}

function namedTypeName(type: TypeNode): string {
  return type.kind === Kind.NAMED_TYPE ? type.name.value : namedTypeName(type.type);
}

function valueToJs(value: ValueNode): unknown {
  switch (value.kind) {
    case Kind.INT:
      return Number(value.value);
    case Kind.FLOAT:
      return Number(value.value);
    case Kind.STRING:
    case Kind.ENUM:
      return value.value;
    case Kind.BOOLEAN:
      return value.value;
    case Kind.NULL:
      return null;
    case Kind.LIST:
      return value.values.map(valueToJs);
    case Kind.OBJECT:
      return Object.fromEntries(value.fields.map((f) => [f.name.value, valueToJs(f.value)]));
    default:
      return undefined;
  }
}

/**
 * Visibility lint: every relationship predicate inside a `where` literal must carry `<visibilityField>: { in: $v }`
 * with `$v` server-bound to the actor visibility, because 7.6.3 does not apply @authorization filter rules to the
 * nodes inside relationship filter predicates (an excluded record would otherwise be probe-able through a filter).
 * Whole `where` objects supplied as variables are not allowed in safelisted documents.
 */
export function lintVisibility(schema: GraphQLSchema, operation: OperationDefinitionNode, document: DocumentNode, boundVars: Set<string>, visibilityField: string): string[] {
  const errors: string[] = [];
  const hasVisibility = (node: ValueNode | undefined): boolean =>
    node?.kind === Kind.OBJECT &&
    node.fields.some(
      (f) => f.name.value === visibilityField && f.value.kind === Kind.OBJECT && f.value.fields.some((g) => g.name.value === "in" && g.value.kind === Kind.VARIABLE && boundVars.has(g.value.name.value)),
    );
  const lintValue = (value: ValueNode, type: GraphQLInputType, path: string): void => {
    const named = getNamedType(type);
    if (!isInputObjectType(named)) return;
    if (value.kind === Kind.VARIABLE) {
      errors.push(`${path}: input object ${named.name} must be written literally in a safelisted document (got $${value.name.value})`);
      return;
    }
    if (value.kind === Kind.LIST) {
      value.values.forEach((v, i) => lintValue(v, named, `${path}[${i}]`));
      return;
    }
    if (value.kind !== Kind.OBJECT) return;
    for (const field of value.fields) {
      const def = named.getFields()[field.name.value];
      if (!def) continue;
      const fieldType = getNamedType(def.type);
      const here = `${path}.${field.name.value}`;
      if (isInputObjectType(fieldType) && (fieldType.name.endsWith("RelationshipFilters") || fieldType.name.endsWith("ConnectionFilters"))) {
        if (field.value.kind !== Kind.OBJECT) {
          errors.push(`${here}: relationship filter must be a literal object`);
          continue;
        }
        for (const quantifier of field.value.fields) {
          const target = fieldType.name.endsWith("ConnectionFilters") && quantifier.value.kind === Kind.OBJECT ? quantifier.value.fields.find((f) => f.name.value === "node")?.value : quantifier.value;
          if (!hasVisibility(target)) errors.push(`${here}.${quantifier.name.value}: relationship predicate lacks ${visibilityField}: { in: $<actor.visibility> } (excluded records would be inferable through this filter)`);
        }
      }
      lintValue(field.value, def.type, here);
    }
  };
  const fragments = new Map(document.definitions.filter((d): d is FragmentDefinitionNode => d.kind === Kind.FRAGMENT_DEFINITION).map((f) => [f.name.value, f] as const));
  const walk = (selectionSet: SelectionSetNode | undefined, parentName: string, path: string, seen: Set<string>): void => {
    if (!selectionSet) return;
    const parent = schema.getType(parentName);
    for (const s of selectionSet.selections) {
      if (s.kind === Kind.INLINE_FRAGMENT) {
        walk(s.selectionSet, s.typeCondition?.name.value ?? parentName, path, seen);
        continue;
      }
      if (s.kind === Kind.FRAGMENT_SPREAD) {
        const f = fragments.get(s.name.value);
        if (f && !seen.has(f.name.value)) walk(f.selectionSet, f.typeCondition.name.value, path, new Set([...seen, f.name.value]));
        continue;
      }
      if (!parent || !(isObjectType(parent) || isInterfaceType(parent))) continue;
      const field = parent.getFields()[s.name.value];
      if (!field) continue;
      for (const arg of s.arguments ?? []) {
        const def = field.args.find((a) => a.name === arg.name.value);
        if (def && (arg.name.value === "where" || arg.name.value === "sort")) lintValue(arg.value, def.type, `${path}/${s.name.value}(${arg.name.value})`);
      }
      walk(s.selectionSet, getNamedType(field.type).name, `${path}/${s.name.value}`, seen);
    }
  };
  walk(operation.selectionSet, schema.getQueryType()!.name, "", new Set());
  return errors;
}

export interface RegistryBuildResult {
  registry: OperationRegistry;
  text: string;
  errors: string[];
}

export function buildRegistry(catalogPath: string, build: ExecutableBuild, source: ConsumerSource, manifest: ProjectionManifest, limits: AdmissionLimits = DEFAULT_ADMISSION_LIMITS): RegistryBuildResult {
  const { catalog, dir } = loadCatalog(catalogPath);
  const documentsDir = join(dir, catalog.documentsDir);
  const errors: string[] = [];
  const fragmentDoc = parse(readFileSync(join(documentsDir, catalog.fragmentsFile), "utf8"));
  const fragments = new Map<string, FragmentDefinitionNode>();
  for (const d of fragmentDoc.definitions) {
    if (d.kind !== Kind.FRAGMENT_DEFINITION) errors.push(`${catalog.fragmentsFile}: only fragments are allowed`);
    else fragments.set(d.name.value, d);
  }
  const schema = build.schema;
  const operations: RegisteredOperation[] = [];
  for (const entry of catalog.operations) {
    const where = `${entry.name} (${entry.file})`;
    const costClass = catalog.costClasses[entry.costClass];
    if (!costClass) {
      errors.push(`${where}: unknown cost class ${entry.costClass}`);
      continue;
    }
    const parsed = parse(readFileSync(join(documentsDir, entry.file), "utf8"));
    const ops = parsed.definitions.filter((d): d is OperationDefinitionNode => d.kind === Kind.OPERATION_DEFINITION);
    if (ops.length !== 1 || parsed.definitions.length !== 1) {
      errors.push(`${where}: a document file holds exactly one operation and no fragments`);
      continue;
    }
    const operation = ops[0]!;
    if (operation.operation !== "query") errors.push(`${where}: only query operations are allowed`);
    if (operation.name?.value !== entry.name) errors.push(`${where}: operation name ${operation.name?.value} differs from the catalog name`);
    let document: DocumentNode;
    try {
      document = executableDocumentFor(operation, fragments);
    } catch (error) {
      errors.push(`${where}: ${(error as Error).message}`);
      continue;
    }
    const validation = validate(schema, document, [...specifiedRules, depthLimitRule(limits.maxDepth)]);
    for (const e of validation) errors.push(`${where}: ${e.message}`);
    if (validation.length) continue;

    // Variables: declared in the document, bounded in the catalog.
    const variables: Record<string, VariableSpec> = {};
    const declared = new Map((operation.variableDefinitions ?? []).map((v) => [v.variable.name.value, v] as const));
    for (const name of Object.keys(entry.variables)) if (!declared.has(name)) errors.push(`${where}: catalog variable $${name} is not declared in the document`);
    const bound = new Set<string>();
    for (const [name, def] of declared) {
      const raw = entry.variables[name];
      if (!raw) {
        errors.push(`${where}: variable $${name} has no catalog bounds`);
        continue;
      }
      const spec: CatalogVariable = { ...(raw.ref ? catalog.variableTypes[raw.ref] : {}), ...raw };
      if (raw.ref && !catalog.variableTypes[raw.ref]) errors.push(`${where}: unknown variable type ${raw.ref}`);
      const graphqlType = print(def.type);
      const isList = def.type.kind === Kind.LIST_TYPE || (def.type.kind === Kind.NON_NULL_TYPE && def.type.type.kind === Kind.LIST_TYPE);
      const named = namedTypeName(def.type);
      const docDefault = def.defaultValue ? valueToJs(def.defaultValue) : undefined;
      if (spec.bind) {
        if (spec.bind !== "actor.visibility" || graphqlType !== "[PrivacyClass!]!") errors.push(`${where}: $${name} bound to ${spec.bind} must be declared [PrivacyClass!]!`);
        bound.add(name);
        variables[name] = { graphqlType, type: "List", bind: spec.bind, required: true };
        continue;
      }
      if (isList) {
        errors.push(`${where}: list variable $${name} must be server-bound`);
        continue;
      }
      const type = named === "Int" ? "Int" : named === "Boolean" ? "Boolean" : named === "String" || named === "ID" ? "String" : null;
      if (!type || (spec.type && spec.type !== type)) {
        errors.push(`${where}: variable $${name}: ${graphqlType} is not a supported bounded scalar (catalog says ${spec.type})`);
        continue;
      }
      if (type === "Int" && (spec.min === undefined || spec.max === undefined)) errors.push(`${where}: Int variable $${name} needs min and max`);
      if (type === "String" && spec.maxLength === undefined) errors.push(`${where}: String variable $${name} needs maxLength`);
      if (spec.default !== undefined && docDefault !== undefined && spec.default !== docDefault) errors.push(`${where}: $${name} default differs between catalog (${String(spec.default)}) and document (${String(docDefault)})`);
      const required = def.type.kind === Kind.NON_NULL_TYPE && docDefault === undefined;
      if (Boolean(spec.required) !== required) errors.push(`${where}: $${name} required=${String(spec.required)} differs from the document type ${graphqlType}`);
      variables[name] = {
        graphqlType,
        type,
        ...(required ? { required: true } : {}),
        ...(spec.default !== undefined || docDefault !== undefined ? { default: spec.default ?? docDefault } : {}),
        ...(spec.min !== undefined ? { min: spec.min } : {}),
        ...(spec.max !== undefined ? { max: spec.max } : {}),
        ...(spec.maxLength !== undefined ? { maxLength: spec.maxLength } : {}),
        ...(spec.pattern !== undefined ? { pattern: spec.pattern } : {}),
        ...(spec.cursor ? { cursor: true } : {}),
      };
    }

    for (const e of lintVisibility(schema, operation, document, bound, manifest.visibility.field)) errors.push(`${where}: ${e}`);

    const normalized = normalizeDocument(document);
    const normalizedDoc = parse(normalized);
    const normalizedOp = normalizedDoc.definitions.find((d): d is OperationDefinitionNode => d.kind === Kind.OPERATION_DEFINITION)!;
    // Static admission at the declared upper bounds (largest pages, deepest cursor, widest visibility).
    const worst: Record<string, unknown> = {};
    for (const [name, spec] of Object.entries(variables)) {
      if (spec.bind) worst[name] = ["PUBLIC", "INTERNAL"];
      else if (spec.type === "Int") worst[name] = spec.max;
      else if (spec.cursor) worst[name] = encodeCursorOffset(limits.maxOffset);
      else if (spec.type === "String") worst[name] = "hu:product:x";
    }
    const admission = admitOperation(schema, normalizedDoc, normalizedOp, worst, limits);
    for (const v of admission.violations) errors.push(`${where}: admission ${v.code} at ${v.path || "/"}: ${v.message}`);
    if (admission.cost > costClass.maxEstimatedCost) errors.push(`${where}: static cost ${admission.cost} exceeds cost class ${entry.costClass} (${costClass.maxEstimatedCost})`);
    operations.push({
      id: sha256Digest(normalized),
      name: entry.name,
      document: normalized,
      costClass: entry.costClass,
      staticCost: admission.cost,
      depth: admission.depth,
      maxResponseBytes: entry.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES,
      fragments: document.definitions.filter((d): d is FragmentDefinitionNode => d.kind === Kind.FRAGMENT_DEFINITION).map((f) => f.name.value),
      questions: entry.questions,
      variables,
    });
  }
  operations.sort((a, b) => a.name.localeCompare(b.name));
  const registry: OperationRegistry = {
    format: "bks-operation-registry.v1",
    generatedBy: "pnpm api:registry (apps/graphql-api/src/tools/generate.ts) from operations/catalog.json",
    releaseCompatibility: {
      releaseId: source.releaseId,
      schemaDigest: source.schemaDigest,
      schemaReleaseDigest: source.schemaReleaseDigest,
      productProjectionDigest: build.identity.productProjectionDigest,
      executableGraphqlDigest: build.identity.executableGraphqlDigest,
    },
    limits,
    costClasses: catalog.costClasses,
    operations,
  };
  return { registry, text: `${JSON.stringify(registry, null, 2)}\n`, errors };
}

/**
 * Scalar filter/sort cuts derived from the operation inventory (OD-02): every scalar field of an @node or
 * edge-properties type that no catalog document filters (resp. sorts) on, except `alwaysKeep`, is cut. Computed
 * against the uncut executable so that adding an operation can restore a cut field.
 */
export function deriveScalarCuts(uncutSchema: GraphQLSchema, projectedSdl: string, catalogPath: string, manifest: ProjectionManifest): { filter: Record<string, string[]>; sort: Record<string, string[]>; kept: { filter: string[]; sort: string[] } } {
  const { catalog, dir } = loadCatalog(catalogPath);
  const documentsDir = join(dir, catalog.documentsDir);
  const usedFilter = new Set<string>();
  const usedSort = new Set<string>();
  const candidates = new Map<string, { filter: string[]; sort: string[] }>();
  const sdl = parse(projectedSdl);
  for (const d of sdl.definitions) {
    if (d.kind !== Kind.OBJECT_TYPE_DEFINITION) continue;
    const isNode = (d.directives ?? []).some((x) => x.name.value === "node");
    const isRel = (d.directives ?? []).some((x) => x.name.value === "relationshipProperties");
    if (!isNode && !isRel) continue;
    const filter: string[] = [];
    const sort: string[] = [];
    for (const f of d.fields ?? []) {
      const dirs = f.directives ?? [];
      if (dirs.some((x) => x.name.value === "relationship")) continue;
      const arg = (dn: string, an: string) => dirs.find((x) => x.name.value === dn)?.arguments?.find((a) => a.name.value === an)?.value;
      const byValueF = arg("filterable", "byValue");
      const byValueS = arg("sortable", "byValue");
      const isList = f.type.kind === Kind.LIST_TYPE || (f.type.kind === Kind.NON_NULL_TYPE && f.type.type.kind === Kind.LIST_TYPE);
      if (!(byValueF?.kind === Kind.BOOLEAN && byValueF.value === false)) filter.push(f.name.value);
      if (!isList && !(byValueS?.kind === Kind.BOOLEAN && byValueS.value === false)) sort.push(f.name.value);
    }
    candidates.set(d.name.value, { filter, sort });
  }
  const recordValue = (value: ValueNode, type: GraphQLInputType): void => {
    const named = getNamedType(type);
    if (!isInputObjectType(named)) return;
    if (value.kind === Kind.LIST) {
      for (const v of value.values) recordValue(v, named);
      return;
    }
    if (value.kind !== Kind.OBJECT) return;
    const owner = named.name.endsWith("Where") ? named.name.slice(0, -"Where".length) : named.name.endsWith("Sort") ? named.name.slice(0, -"Sort".length) : null;
    for (const field of value.fields) {
      const def = named.getFields()[field.name.value];
      if (!def) continue;
      if (owner && candidates.has(owner)) (named.name.endsWith("Where") ? usedFilter : usedSort).add(`${owner}.${field.name.value}`);
      recordValue(field.value, def.type);
    }
  };
  const fragmentsDoc = parse(readFileSync(join(documentsDir, catalog.fragmentsFile), "utf8"));
  const docs = [fragmentsDoc, ...catalog.operations.map((o) => parse(readFileSync(join(documentsDir, o.file), "utf8")))];
  const walk = (selectionSet: SelectionSetNode | undefined, parentName: string): void => {
    if (!selectionSet) return;
    const parent = uncutSchema.getType(parentName);
    for (const s of selectionSet.selections) {
      if (s.kind === Kind.INLINE_FRAGMENT) {
        walk(s.selectionSet, s.typeCondition?.name.value ?? parentName);
        continue;
      }
      if (s.kind === Kind.FRAGMENT_SPREAD) continue; // fragments are walked from their own definitions
      if (!parent || !(isObjectType(parent) || isInterfaceType(parent))) continue;
      const field = parent.getFields()[s.name.value];
      if (!field) continue;
      for (const arg of s.arguments ?? []) {
        const def = field.args.find((a) => a.name === arg.name.value);
        if (def) recordValue(arg.value, def.type);
      }
      walk(s.selectionSet, getNamedType(field.type).name);
    }
  };
  for (const doc of docs) {
    for (const d of doc.definitions) {
      if (d.kind === Kind.OPERATION_DEFINITION) walk(d.selectionSet, uncutSchema.getQueryType()!.name);
      if (d.kind === Kind.FRAGMENT_DEFINITION) walk(d.selectionSet, d.typeCondition.name.value);
    }
  }
  const keep = (type: string, field: string, used: Set<string>) =>
    used.has(`${type}.${field}`) || manifest.scalarCuts.alwaysKeep.some((rule) => {
      const [t, f] = rule.split(".");
      return (t === "*" || t === type) && f === field;
    });
  const filter: Record<string, string[]> = {};
  const sort: Record<string, string[]> = {};
  for (const [type, c] of [...candidates].sort(([a], [b]) => a.localeCompare(b))) {
    const fc = c.filter.filter((f) => !keep(type, f, usedFilter)).sort();
    const sc = c.sort.filter((f) => !keep(type, f, usedSort)).sort();
    if (fc.length) filter[type] = fc;
    if (sc.length) sort[type] = sc;
  }
  return { filter, sort, kept: { filter: [...usedFilter].sort(), sort: [...usedSort].sort() } };
}
