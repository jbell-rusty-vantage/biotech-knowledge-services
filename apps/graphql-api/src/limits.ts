import {
  GraphQLError,
  Kind,
  getNamedType,
  getNullableType,
  getVariableValues,
  isInputObjectType,
  isInterfaceType,
  isListType,
  isObjectType,
  isUnionType,
  valueFromAST,
  type DocumentNode,
  type FragmentDefinitionNode,
  type GraphQLField,
  type GraphQLInputType,
  type GraphQLNamedType,
  type GraphQLSchema,
  type OperationDefinitionNode,
  type SelectionSetNode,
  type ValidationRule,
} from "graphql";

/**
 * Operation admission for the consumer API (SPECIFICATION 5.2). The bounds reflect what the installed
 * @neo4j/graphql 7.6.3 actually generates, not what the schema text suggests:
 * - lists and connections to @node/interface targets get the injected @limit (default 25, max 100); nested pages are
 *   additionally capped at 25 here because the library cannot distinguish root and nested pages;
 * - union-target lists receive NO limit from the library unless `limit` is passed explicitly, so a union list without
 *   an explicit `limit` <= nestedMax is rejected; union connections collect every edge before paging and are rejected;
 * - every connection (union or not) collects the full relationship fanout before applying `first`/`after`
 *   (offset cursors, not keyset), so each connection is charged a fanout surcharge and `totalCount` a count cost;
 * - variable defaults and supplied values are coerced first, so `limit: $n` is charged at its real value;
 * - aliases, repeated fragments and inline fragments are summed; filter inputs are bounded by nesting depth and list
 *   length; offsets (`offset` and decoded `after` cursors) are capped; aggregates do not exist and are rejected.
 */
export interface AdmissionLimits {
  /** Deepest field nesting, counting the root field as 1; a connection hop costs 3 (connection, edges, node). */
  maxDepth: number;
  rootDefault: number;
  rootMax: number;
  nestedMax: number;
  /** Largest `offset` argument or decoded connection-cursor offset. */
  maxOffset: number;
  /** Ceiling on the estimated row cost of one operation. */
  maxCost: number;
  /** Deepest nesting of a `where`/`sort` input value. */
  maxFilterDepth: number;
  /** Longest list inside an input value (`in`, `OR`, `AND`, sort lists). */
  maxInputListLength: number;
  /** Cost charged per connection for materializing its relationship fanout. */
  connectionFanoutCost: number;
  /** Cost charged per selected `totalCount`. */
  countCost: number;
  /** Cost charged per relationship predicate inside a filter (an EXISTS subquery per candidate row). */
  relationshipFilterCost: number;
}

export const DEFAULT_ADMISSION_LIMITS: AdmissionLimits = {
  maxDepth: 8,
  rootDefault: 25,
  rootMax: 100,
  nestedMax: 25,
  maxOffset: 1000,
  maxCost: 5000,
  maxFilterDepth: 8,
  maxInputListLength: 50,
  connectionFanoutCost: 25,
  countCost: 25,
  relationshipFilterCost: 50,
};

export type AdmissionCode =
  | "QUERY_TOO_DEEP"
  | "QUERY_TOO_COSTLY"
  | "LIMIT_EXCEEDED"
  | "UNBOUNDED_UNION_FIELD"
  | "UNION_CONNECTION_UNSUPPORTED"
  | "OFFSET_EXCEEDED"
  | "CURSOR_INVALID"
  | "FILTER_TOO_DEEP"
  | "INPUT_LIST_TOO_LONG"
  | "AGGREGATE_UNSUPPORTED"
  | "VARIABLES_INVALID"
  | "OPERATION_INVALID";

export interface AdmissionViolation {
  code: AdmissionCode;
  message: string;
  path: string;
}

export interface AdmissionResult {
  cost: number;
  depth: number;
  violations: AdmissionViolation[];
  /** Coerced variables (defaults applied); what the library will execute with. */
  variables: Record<string, unknown>;
}

type FragmentMap = Map<string, FragmentDefinitionNode>;

function fragmentsOf(document: DocumentNode): FragmentMap {
  const fragments: FragmentMap = new Map();
  for (const definition of document.definitions) if (definition.kind === Kind.FRAGMENT_DEFINITION) fragments.set(definition.name.value, definition);
  return fragments;
}

/** Field nesting depth; introspection (`__*`) fields are ignored and fragment cycles stop expansion. */
export function selectionDepth(selectionSet: SelectionSetNode | undefined, fragments: FragmentMap, visiting: Set<string> = new Set()): number {
  if (!selectionSet) return 0;
  let deepest = 0;
  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      if (selection.name.value.startsWith("__")) continue;
      deepest = Math.max(deepest, 1 + selectionDepth(selection.selectionSet, fragments, visiting));
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      deepest = Math.max(deepest, selectionDepth(selection.selectionSet, fragments, visiting));
    } else {
      const fragmentName = selection.name.value;
      const fragment = fragments.get(fragmentName);
      if (!fragment || visiting.has(fragmentName)) continue;
      visiting.add(fragmentName);
      deepest = Math.max(deepest, selectionDepth(fragment.selectionSet, fragments, visiting));
      visiting.delete(fragmentName);
    }
  }
  return deepest;
}

export function operationDepth(operation: OperationDefinitionNode, document: DocumentNode): number {
  return selectionDepth(operation.selectionSet, fragmentsOf(document));
}

/** Validation rule rejecting operations nested deeper than maxDepth (runs before execution, in Apollo validation). */
export function depthLimitRule(maxDepth: number): ValidationRule {
  return (context) => ({
    OperationDefinition(node) {
      const depth = operationDepth(node, context.getDocument());
      if (depth > maxDepth) {
        context.reportError(new GraphQLError(`Query depth ${depth} exceeds the maximum of ${maxDepth}.`, { nodes: [node], extensions: { code: "QUERY_TOO_DEEP", depth, maxDepth } }));
      }
    },
  });
}

/** Validation rule rejecting introspection (product profile). */
export const noIntrospectionRule: ValidationRule = (context) => ({
  Field(node) {
    if (node.name.value === "__schema" || node.name.value === "__type") {
      context.reportError(new GraphQLError("Introspection is disabled in the product profile; the executable schema is published at /schema.graphql.", { nodes: [node], extensions: { code: "INTROSPECTION_DISABLED" } }));
    }
  },
});

export function isConnectionType(type: GraphQLNamedType): boolean {
  return (isObjectType(type) || isInterfaceType(type)) && type.name.endsWith("Connection") && "edges" in type.getFields() && "pageInfo" in type.getFields();
}

/** Decodes a graphql-relay `arrayconnection:<n>` cursor (the format @neo4j/graphql 7 emits); null when malformed. */
export function decodeCursorOffset(cursor: string): number | null {
  if (typeof cursor !== "string" || cursor.length > 128) return null;
  let decoded: string;
  try {
    decoded = Buffer.from(cursor, "base64").toString("utf8");
  } catch {
    return null;
  }
  const match = /^arrayconnection:(\d{1,9})$/.exec(decoded);
  return match ? Number(match[1]) : null;
}

export function encodeCursorOffset(offset: number): string {
  return Buffer.from(`arrayconnection:${offset}`, "utf8").toString("base64");
}

function inputShape(value: unknown, depth = 0): { depth: number; longestList: number } {
  if (Array.isArray(value)) {
    let d = depth;
    let longest = value.length;
    for (const item of value) {
      const s = inputShape(item, depth);
      d = Math.max(d, s.depth);
      longest = Math.max(longest, s.longestList);
    }
    return { depth: d, longestList: longest };
  }
  if (value && typeof value === "object") {
    let d = depth + 1;
    let longest = 0;
    for (const v of Object.values(value as Record<string, unknown>)) {
      const s = inputShape(v, depth + 1);
      d = Math.max(d, s.depth);
      longest = Math.max(longest, s.longestList);
    }
    return { depth: d, longestList: longest };
  }
  return { depth, longestList: 0 };
}

/** Counts relationship predicates in a where value by walking it with its input type. */
function relationshipPredicates(value: unknown, type: GraphQLInputType): number {
  const named = getNamedType(type);
  if (value === null || value === undefined || !isInputObjectType(named)) return 0;
  if (Array.isArray(value)) return value.reduce((n: number, v) => n + relationshipPredicates(v, named), 0);
  if (typeof value !== "object") return 0;
  let count = 0;
  const fields = named.getFields();
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    const field = fields[key];
    if (!field) continue;
    const fieldType = getNamedType(field.type);
    if (isInputObjectType(fieldType) && (fieldType.name.endsWith("RelationshipFilters") || fieldType.name.endsWith("ConnectionFilters"))) count++;
    count += relationshipPredicates(v, field.type);
  }
  return count;
}

/**
 * Admission of one operation. `rawVariables` are the request's supplied values; they are coerced with the operation's
 * variable definitions (defaults applied) before any bound is evaluated.
 */
export function admitOperation(schema: GraphQLSchema, document: DocumentNode, operation: OperationDefinitionNode, rawVariables: Record<string, unknown>, limits: AdmissionLimits = DEFAULT_ADMISSION_LIMITS): AdmissionResult {
  const violations: AdmissionViolation[] = [];
  const coerced = getVariableValues(schema, operation.variableDefinitions ?? [], rawVariables, { maxErrors: 10 });
  if (coerced.errors) {
    return { cost: 0, depth: 0, variables: {}, violations: coerced.errors.map((e) => ({ code: "VARIABLES_INVALID", message: e.message, path: "$" })) };
  }
  const variables = coerced.coerced;
  if (operation.operation !== "query") {
    return { cost: 0, depth: 0, variables, violations: [{ code: "OPERATION_INVALID", message: `${operation.operation} operations are not supported; the consumer API is read-only`, path: "" }] };
  }
  const fragments = fragmentsOf(document);
  const root = schema.getQueryType();
  if (!root) return { cost: 0, depth: 0, variables, violations: [{ code: "OPERATION_INVALID", message: "schema has no Query root", path: "" }] };
  const depth = selectionDepth(operation.selectionSet, fragments);
  if (depth > limits.maxDepth) violations.push({ code: "QUERY_TOO_DEEP", message: `depth ${depth} exceeds ${limits.maxDepth}`, path: "" });

  const costOf = (selectionSet: SelectionSetNode | undefined, parent: GraphQLNamedType, path: string, isRoot: boolean, insideConnection: boolean, visiting: Set<string>): number => {
    if (!selectionSet) return 0;
    let total = 0;
    for (const selection of selectionSet.selections) {
      if (selection.kind === Kind.INLINE_FRAGMENT) {
        const scope = selection.typeCondition ? (schema.getType(selection.typeCondition.name.value) ?? parent) : parent;
        total += costOf(selection.selectionSet, scope, path, isRoot, insideConnection, visiting);
        continue;
      }
      if (selection.kind === Kind.FRAGMENT_SPREAD) {
        const fragmentName = selection.name.value;
        const fragment = fragments.get(fragmentName);
        if (!fragment || visiting.has(fragmentName)) continue;
        visiting.add(fragmentName);
        total += costOf(fragment.selectionSet, schema.getType(fragment.typeCondition.name.value) ?? parent, path, isRoot, insideConnection, visiting);
        visiting.delete(fragmentName);
        continue;
      }
      const fieldName = selection.name.value;
      if (fieldName.startsWith("__")) continue;
      if (!(isObjectType(parent) || isInterfaceType(parent))) continue;
      const field: GraphQLField<unknown, unknown> | undefined = parent.getFields()[fieldName];
      if (!field) continue;
      const here = `${path}/${selection.alias?.value ?? fieldName}`;
      if (/Aggregate$|^aggregate$/.test(fieldName)) {
        violations.push({ code: "AGGREGATE_UNSUPPORTED", message: `${fieldName}: aggregates are not part of the consumer API`, path: here });
        continue;
      }
      const named = getNamedType(field.type);
      const args: Record<string, unknown> = {};
      for (const argNode of selection.arguments ?? []) {
        const def = field.args.find((a) => a.name === argNode.name.value);
        if (!def) continue;
        args[def.name] = valueFromAST(argNode.value, def.type, variables);
      }
      // Filter and sort inputs: bounded shape; relationship predicates are charged per candidate row below.
      let filterCost = 0;
      for (const key of ["where", "sort"]) {
        if (args[key] === undefined || args[key] === null) continue;
        const shape = inputShape(args[key]);
        if (shape.depth > limits.maxFilterDepth) violations.push({ code: "FILTER_TOO_DEEP", message: `${key} nesting ${shape.depth} exceeds ${limits.maxFilterDepth}`, path: here });
        if (shape.longestList > limits.maxInputListLength) violations.push({ code: "INPUT_LIST_TOO_LONG", message: `${key} contains a list of ${shape.longestList} items (max ${limits.maxInputListLength})`, path: here });
        if (key === "where") {
          const def = field.args.find((a) => a.name === "where");
          if (def) filterCost += relationshipPredicates(args[key], def.type) * limits.relationshipFilterCost;
        }
      }
      const offset = args.offset;
      if (typeof offset === "number" && offset > limits.maxOffset) violations.push({ code: "OFFSET_EXCEEDED", message: `offset ${offset} exceeds ${limits.maxOffset}`, path: here });
      if (!selection.selectionSet) continue; // scalar or enum
      const pageMax = isRoot ? limits.rootMax : limits.nestedMax;

      if (isConnectionType(named)) {
        const edgesField = (isObjectType(named) || isInterfaceType(named)) ? named.getFields().edges : undefined;
        const edgeType = edgesField ? getNamedType(edgesField.type) : undefined;
        const nodeType = edgeType && (isObjectType(edgeType) || isInterfaceType(edgeType)) ? getNamedType(edgeType.getFields().node?.type ?? edgeType) : undefined;
        if (nodeType && isUnionType(nodeType)) {
          violations.push({ code: "UNION_CONNECTION_UNSUPPORTED", message: `${fieldName}: union connections collect every edge before paging in @neo4j/graphql 7.6.3; use the list field with an explicit limit`, path: here });
        }
        const first = args.first;
        if (typeof first === "number" && first > pageMax) violations.push({ code: "LIMIT_EXCEEDED", message: `first ${first} exceeds ${pageMax} for a ${isRoot ? "root" : "nested"} connection`, path: here });
        if (typeof first === "number" && first < 0) violations.push({ code: "LIMIT_EXCEEDED", message: `first must not be negative`, path: here });
        const after = args.after;
        if (typeof after === "string") {
          const decoded = decodeCursorOffset(after);
          if (decoded === null) violations.push({ code: "CURSOR_INVALID", message: "after is not a cursor issued by this API", path: here });
          else if (decoded > limits.maxOffset) violations.push({ code: "OFFSET_EXCEEDED", message: `cursor offset ${decoded} exceeds ${limits.maxOffset}; narrow the query instead of paging deeper`, path: here });
        }
        const page = Math.max(1, Math.min(typeof first === "number" ? first : limits.rootDefault, pageMax));
        const counts = selection.selectionSet.selections.some((s) => s.kind === Kind.FIELD && s.name.value === "totalCount") ? limits.countCost : 0;
        total += page * (1 + costOf(selection.selectionSet, named, here, false, true, visiting)) + limits.connectionFanoutCost + counts + filterCost;
        continue;
      }

      const listed = isListType(getNullableType(field.type));
      if (listed && !insideConnection) {
        const requested = args.limit;
        if (isUnionType(named) && typeof requested !== "number") {
          violations.push({ code: "UNBOUNDED_UNION_FIELD", message: `${fieldName} targets union ${named.name}; @neo4j/graphql 7.6.3 applies no @limit to unions, so an explicit limit <= ${limits.nestedMax} is required`, path: here });
        }
        if (typeof requested === "number" && requested > pageMax) violations.push({ code: "LIMIT_EXCEEDED", message: `limit ${requested} exceeds ${pageMax} for a ${isRoot ? "root" : "nested"} list`, path: here });
        if (typeof requested === "number" && requested < 0) violations.push({ code: "LIMIT_EXCEEDED", message: `limit must not be negative`, path: here });
        const page = Math.max(1, Math.min(typeof requested === "number" ? requested : limits.rootDefault, pageMax));
        total += page * (1 + costOf(selection.selectionSet, named, here, false, false, visiting)) + filterCost;
        continue;
      }
      // edges inside a connection, pageInfo, node, single objects
      total += (isConnectionType(parent) || insideConnection ? 0 : 1) + costOf(selection.selectionSet, named, here, false, insideConnection && fieldName === "edges", visiting) + filterCost;
    }
    return total;
  };

  const cost = costOf(operation.selectionSet, root, "", true, false, new Set());
  if (cost > limits.maxCost) violations.push({ code: "QUERY_TOO_COSTLY", message: `estimated cost ${cost} exceeds ${limits.maxCost}; lower limit/first or select fewer nested lists`, path: "" });
  return { cost, depth, violations, variables };
}
