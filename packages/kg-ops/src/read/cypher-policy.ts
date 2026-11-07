import { createHash } from "node:crypto";
import { CypherParser, lintCypherQuery, parse } from "@neo4j-cypher/language-support";
import type { ReadReason } from "./contracts.js";
import { ENTITY_FUNCTIONS, FUNCTION_ALLOWLIST, PROCEDURE_ALLOWLIST, type ReadModel, type ReadScope } from "./visibility.js";

/**
 * Cypher read policy (`bks-cypher-read-policy.v1`): a conservative accepted Cypher 5 read subset, checked on the
 * grammar parse tree of Neo4j's own Cypher parser (`@neo4j-cypher/language-support` 2.0.0-next.37, ANTLR grammar
 * covering Cypher 5 and Cypher 25). Regexes are not used for any decision. The policy is an allowlist of grammar rules:
 * a construct whose rule is not listed is rejected (CLAUSE_FORBIDDEN), so newer syntax is refused until qualified.
 *
 * Accepted: MATCH / OPTIONAL MATCH, WHERE, WITH, UNWIND, RETURN, ORDER BY / SKIP / LIMIT, UNION, CALL { } read
 * subqueries (no IN TRANSACTIONS), EXISTS / COUNT / COLLECT subqueries, pattern and list comprehensions, CASE, map
 * projections of named properties, bounded variable-length / quantified patterns, the allowlisted pure functions and the
 * allowlisted read procedures. Prefix `CYPHER 5` only.
 * Refused: every write clause (CREATE, MERGE, SET, REMOVE, DELETE, FOREACH, INSERT), LOAD CSV, USE, administration and
 * SHOW commands, CALL { } IN TRANSACTIONS, any procedure outside the allowlist (apoc.*, gds.*, dbms.*, db.* except the
 * fulltext query), file/network functions, CYPHER 25 and GQL-only clauses (LET, FILTER, FINISH, WHEN, SEARCH, NEXT),
 * EXPLAIN / PROFILE prefixes (use the explain route), dynamic labels / types / properties, unlabeled node patterns,
 * untyped relationship patterns, label wildcards and negation, unbounded or over-deep variable-length patterns,
 * `properties()` / `keys()` / `elementId()` / `id()`, `.*` map projections and whole-entity returns, restricted or
 * operational properties, operational labels and relationship types.
 */
export const CYPHER_READ_POLICY = "bks-cypher-read-policy.v1" as const;
export const CYPHER_PARSER = { package: "@neo4j-cypher/language-support", version: "2.0.0-next.37", grammar: "CypherCmdParser (Cypher 5 + 25)" } as const;

const RULES: readonly string[] = CypherParser.ruleNames;

const ALLOWED_RULES = new Set([
  "statementsOrCommands", "statementOrCommand", "preparsedStatement", "preparserOption", "cypherOptions", "cypher", "cypherVersion",
  "statement", "queryWithLocalDefinitions", "nextStatement", "regularQuery", "union", "singleQuery", "clause",
  "returnClause", "returnBody", "returnItem", "returnItems", "orderItem", "ascToken", "descToken", "orderBy", "skip", "limit",
  "whereClause", "withClause", "matchClause", "unwindClause", "callClause", "procedureName", "procedureArgument", "procedureResultItem",
  "subqueryClause", "subqueryScope", "patternList", "pattern", "quantifier", "anonymousPattern", "shortestPathPattern", "patternElement",
  "parenthesizedPath", "nodePattern", "nodeLabels", "nodeLabelsIs", "labelType", "relType", "labelOrRelType", "properties",
  "relationshipPattern", "leftArrow", "arrowLine", "rightArrow", "pathLength",
  "labelExpression", "labelExpression4", "labelExpression3", "labelExpression2", "labelExpression1",
  "expression", "expression11", "expression10", "expression9", "expression8", "expression7", "comparisonExpression6", "normalForm",
  "expression6", "expression5", "expression4", "expression3", "expression2", "postFix", "property", "expression1", "literal",
  "caseExpression", "caseAlternative", "listComprehension", "patternComprehension", "reduceExpression", "listItemsPredicate",
  "normalizeFunction", "trimFunction", "patternExpression", "shortestPathExpression", "parenthesizedExpression", "mapProjection",
  "mapProjectionElement", "countStar", "existsExpression", "countExpression", "collectExpression", "numberLiteral",
  "signedIntegerLiteral", "listLiteral", "propertyKeyName", "parameter", "parameterName", "functionInvocation", "functionArgument",
  "functionName", "namespace", "variable", "symbolicNameString", "escapedSymbolicNameString", "unescapedSymbolicNameString",
  "unescapedSymbolicNameString_", "symbolicVariableNameString", "escapedSymbolicVariableNameString", "unescapedSymbolicVariableNameString",
  "stringLiteral", "map", "endOfFile", "type", "typePart", "typeName", "typeNullability", "typeListSuffix",
]);

interface Ctx {
  ruleIndex?: number;
  children?: Ctx[] | null;
  symbol?: { text: string; type: number };
  getText(): string;
  start?: { start: number };
  stop?: { stop: number };
}

export interface PolicyFacts {
  statementDigest: string;
  cypherVersionPrefix: string | null;
  labels: string[];
  relationshipTypes: string[];
  functions: string[];
  procedures: string[];
  parameters: string[];
  properties: string[];
  hasFinalOrderBy: boolean;
  maxPathDepth: number;
  nodeVariables: Record<string, string[]>;
}

export interface PolicyVerdict {
  accepted: boolean;
  reasons: ReadReason[];
  facts: PolicyFacts;
}

export interface PolicyOptions {
  model: ReadModel;
  scope: ReadScope;
  maxDepth: number;
  /** Labels / relationship types / procedures the artifact declares as its permitted scope (empty = the release set). */
  declared?: { labels: string[]; relationshipTypes: string[]; procedures: string[] };
}

const ruleOf = (c: Ctx): string | null => (typeof c.ruleIndex === "number" ? RULES[c.ruleIndex] ?? null : null);
const unquote = (s: string) => (s.startsWith("`") && s.endsWith("`") ? s.slice(1, -1).replace(/``/g, "`") : s);

function* walk(c: Ctx): Generator<Ctx> {
  yield c;
  for (const ch of c.children ?? []) yield* walk(ch);
}
function descendants(c: Ctx, rule: string): Ctx[] {
  const out: Ctx[] = [];
  for (const d of walk(c)) if (d !== c && ruleOf(d) === rule) out.push(d);
  return out;
}
function child(c: Ctx, rule: string): Ctx | undefined {
  return (c.children ?? []).find((x) => ruleOf(x) === rule);
}
const SUBQUERY_EXPRESSIONS = new Set(["existsExpression", "countExpression", "collectExpression", "patternExpression", "patternComprehension"]);
function ancestors(c: Ctx): string[] {
  const out: string[] = [];
  for (let p = (c as unknown as { parentCtx?: Ctx | null }).parentCtx; p; p = (p as unknown as { parentCtx?: Ctx | null }).parentCtx) {
    const r = ruleOf(p);
    if (r) out.push(r);
  }
  return out;
}
function terminals(c: Ctx): string[] {
  const out: string[] = [];
  for (const d of walk(c)) if (d.symbol && !d.children) out.push(d.symbol.text);
  return out;
}

export function statementDigestOf(statement: string): string {
  return `sha256:${createHash("sha256").update(Buffer.from(statement, "utf8")).digest("hex")}`;
}

/** Parses and checks one statement against the accepted subset and the release / scope policy. */
export function checkCypherRead(statement: string, opts: PolicyOptions): PolicyVerdict {
  const reasons: ReadReason[] = [];
  const add = (code: ReadReason["code"], message: string, path?: string) => {
    if (!reasons.some((r) => r.code === code && r.message === message)) reasons.push({ code, message, ...(path ? { path } : {}) });
  };
  const facts: PolicyFacts = { statementDigest: statementDigestOf(statement), cypherVersionPrefix: null, labels: [], relationshipTypes: [], functions: [], procedures: [], parameters: [], properties: [], hasFinalOrderBy: false, maxPathDepth: 0, nodeVariables: {} };
  let trees: Ctx[];
  try {
    trees = parse(statement) as unknown as Ctx[];
  } catch (e) {
    add("PARSE_REJECTED", `statement does not parse: ${(e as Error).message}`);
    return { accepted: false, reasons, facts };
  }
  const nonEmpty = trees.filter((t) => t.getText().replace(/<EOF>/g, "").trim() !== "" && ruleOf(t) !== "endOfFile");
  if (nonEmpty.length !== 1) {
    add("PARSE_REJECTED", `exactly one statement is accepted (found ${nonEmpty.length}); remove ';' separators`);
    return { accepted: false, reasons, facts };
  }
  const root = nonEmpty[0]!;
  // Syntax errors come from the parser's own diagnostics (parameter-definition notices are not errors here).
  const lint = lintCypherQuery(statement, {}) as unknown as { diagnostics: Array<{ severity: number; message: string }>; symbolTables?: Array<Array<{ variable: string; definitionPosition: number; references: number[]; types?: string[] }>> };
  // Scope-resolved symbols from the language service: a variable reference resolves to its definition site.
  const symbols = lint.symbolTables?.[0] ?? [];
  const symbolAt = (pos: number) => symbols.find((x) => x.references.includes(pos) || x.definitionPosition === pos);
  const posOf = (c: Ctx) => (c as unknown as { start?: { start: number } }).start?.start ?? -1;
  const syntax = lint.diagnostics.filter((d) => d.severity === 1 && !/^Parameter \$\S+ is not defined/.test(d.message));
  if (syntax.length) {
    add("PARSE_REJECTED", `Cypher syntax error: ${syntax[0]!.message.slice(0, 400)}`);
    return { accepted: false, reasons, facts };
  }

  const { model, scope, maxDepth } = opts;
  const declared = opts.declared ?? { labels: [], relationshipTypes: [], procedures: [] };
  const declaredLabels = new Set(declared.labels);
  const declaredTypes = new Set(declared.relationshipTypes);

  for (const d of walk(root)) {
    const r = ruleOf(d);
    if (r === null) {
      const t = d.symbol?.text?.toUpperCase();
      if (t === "EXPLAIN" || t === "PROFILE") add("CLAUSE_FORBIDDEN", `${t} is not part of an artifact; use POST /kg/read/explain`);
      continue;
    }
    if (!ALLOWED_RULES.has(r)) add(r === "callClause" ? "PROCEDURE_FORBIDDEN" : "CLAUSE_FORBIDDEN", `construct '${r}' is outside the accepted Cypher 5 read subset`, r);
  }

  // Preparser: CYPHER 5 only, no options.
  for (const v of descendants(root, "cypherVersion")) {
    facts.cypherVersionPrefix = v.getText();
    if (v.getText() !== "5") add("CLAUSE_FORBIDDEN", `CYPHER ${v.getText()} is not the release baseline; only CYPHER 5 is accepted`);
  }
  for (const o of descendants(root, "cypherOptions")) if (descendants(o, "cypherOption").length) add("CLAUSE_FORBIDDEN", "Cypher preparser options (runtime, planner, ...) are not accepted");
  for (const q of descendants(root, "queryWithLocalDefinitions")) if (descendants(q, "localDefinition").length) add("CLAUSE_FORBIDDEN", "local procedure/function definitions are not accepted");
  // CALL { } IN TRANSACTIONS
  for (const s of descendants(root, "subqueryClause")) if (descendants(s, "subqueryInTransactionsParameters").length || terminals(s).some((t) => t.toUpperCase() === "TRANSACTIONS")) add("CLAUSE_FORBIDDEN", "CALL { } IN TRANSACTIONS is not accepted");
  if (descendants(root, "loadCSVClause").length) add("CLAUSE_FORBIDDEN", "LOAD CSV is not accepted");
  if (descendants(root, "useClause").length) add("CLAUSE_FORBIDDEN", "USE is not accepted (the binding selects the database)");

  // Label expressions: positive names only, joined by | or &; dynamic labels refused.
  const checkLabelExpr = (le: Ctx, where: "node" | "relationship" | "predicate") => {
    const toks = terminals(le);
    if (toks.includes("!")) add("LABEL_FORBIDDEN", "label/type negation (!) is not accepted");
    if (toks.includes("%")) add("LABEL_FORBIDDEN", "label/type wildcard (%) is not accepted");
    if (descendants(le, "dynamicExpression").length || descendants(le, "dynamicLabelType").length || descendants(le, "dynamicAnyAllExpression").length || toks.includes("$(")) add("LABEL_FORBIDDEN", "dynamic labels/types are template-only");
    const names = descendants(le, "labelExpression1").map((l1) => {
      const s = child(l1, "symbolicNameString");
      return s ? unquote(s.getText()) : null;
    });
    const out: string[] = [];
    for (const n of names) {
      if (n === null) continue;
      out.push(n);
      if (where === "relationship") {
        if (!model.isPermittedRelationshipType(n)) add("RELATIONSHIP_FORBIDDEN", `relationship type ${n} is not a readable release type`, n);
        else if (declaredTypes.size && !declaredTypes.has(n)) add("RELATIONSHIP_FORBIDDEN", `relationship type ${n} is outside the artifact's declared scope`, n);
      } else if (where === "node") {
        if (!model.isPermittedLabel(n)) add("LABEL_FORBIDDEN", `label ${n} is not a readable release label`, n);
        else if (declaredLabels.size && !declaredLabels.has(n)) add("LABEL_FORBIDDEN", `label ${n} is outside the artifact's declared scope`, n);
      } else if (!model.isPermittedLabel(n) && !model.isPermittedRelationshipType(n)) add("LABEL_FORBIDDEN", `label/type ${n} is not readable`, n);
    }
    return out;
  };
  const labelsOfNodeLabels = (nl: Ctx) => descendants(nl, "labelType").concat(descendants(nl, "labelOrRelType")).map((x) => unquote((child(x, "symbolicNameString") ?? x).getText().replace(/^:/, "")));

  // Pass 1: labelled node-pattern definitions by variable offset.
  const labelledDefs = new Map<number, string[]>();
  const nodeVarNames = new Map<number, string>();
  const nodePatterns = descendants(root, "nodePattern");
  for (const np of nodePatterns) {
    const v = child(np, "variable");
    const le = child(np, "labelExpression");
    const nl = child(np, "nodeLabels") ?? child(np, "nodeLabelsIs");
    const names = le ? descendants(le, "labelExpression1").map((l1) => child(l1, "symbolicNameString")).filter(Boolean).map((x) => unquote(x!.getText())) : nl ? labelsOfNodeLabels(nl) : [];
    if (v && names.length) {
      labelledDefs.set(posOf(v), names);
      nodeVarNames.set(posOf(v), v.getText());
    }
  }
  for (const np of nodePatterns) {
    const le = child(np, "labelExpression");
    const nl = child(np, "nodeLabels") ?? child(np, "nodeLabelsIs");
    let labels: string[] = [];
    if (le) labels = checkLabelExpr(le, "node");
    else if (nl) {
      labels = labelsOfNodeLabels(nl);
      for (const l of labels) if (!model.isPermittedLabel(l)) add("LABEL_FORBIDDEN", `label ${l} is not a readable release label`, l);
      if (descendants(nl, "dynamicLabelType").length || descendants(nl, "dynamicExpression").length) add("LABEL_FORBIDDEN", "dynamic labels are template-only");
    }
    if (!labels.length) {
      // An unlabelled pattern is accepted only as a REFERENCE to a variable whose definition (resolved by the parser's
      // scope analysis, not by name) is a labelled node pattern; a fresh unlabelled node is refused.
      const vv = child(np, "variable");
      const sym = vv ? symbolAt(posOf(vv)) : undefined;
      let def = vv && sym && sym.definitionPosition !== posOf(vv) ? labelledDefs.get(sym.definitionPosition) : undefined;
      // Inside EXISTS / COUNT / COLLECT / pattern expressions every outer variable is in scope and cannot be redefined
      // (Neo4j refuses shadowing), so a name defined earlier by a labelled pattern is that same node.
      if (!def && vv && ancestors(np).some((r) => SUBQUERY_EXPRESSIONS.has(r))) {
        const earlier = [...labelledDefs.entries()].filter(([pos]) => pos < posOf(vv)).map(([pos, ls]) => ({ pos, ls, name: nodeVarNames.get(pos) })).filter((x) => x.name === vv.getText());
        if (earlier.length) def = earlier[earlier.length - 1]!.ls;
      }
      if (def) labels = def;
      else add("LABEL_FORBIDDEN", `every node pattern must carry a readable release label or re-use a labelled variable in scope (found '${np.getText()}'); unlabelled patterns can reach operational or legacy records`);
    }
    facts.labels.push(...labels);
    const v = child(np, "variable");
    if (v) facts.nodeVariables[v.getText()] = [...new Set([...(facts.nodeVariables[v.getText()] ?? []), ...labels])];
    const props = child(np, "properties");
    if (props) for (const k of descendants(props, "propertyKeyName")) checkProperty(k.getText(), labels);
    if (props && (descendants(props, "parameter").length && !child(props, "map"))) add("PROPERTY_FORBIDDEN", "a parameter map as node properties is not accepted; name each property");
  }
  for (const rp of descendants(root, "relationshipPattern")) {
    const le = child(rp, "labelExpression");
    const types = le ? checkLabelExpr(le, "relationship") : [];
    if (!types.length) add("RELATIONSHIP_FORBIDDEN", `every relationship pattern must name release relationship types (found '${rp.getText()}')`);
    facts.relationshipTypes.push(...types);
    const pl = child(rp, "pathLength");
    if (pl) {
      const depth = pathLengthUpper(pl.getText());
      if (depth === null) add("UNBOUNDED_PATTERN", `variable-length relationship '${pl.getText()}' needs an explicit upper bound <= ${maxDepth}`);
      else {
        facts.maxPathDepth = Math.max(facts.maxPathDepth, depth);
        if (depth > maxDepth) add("UNBOUNDED_PATTERN", `variable-length upper bound ${depth} exceeds maxDepth ${maxDepth}`);
      }
    }
  }
  for (const q of descendants(root, "quantifier")) {
    const depth = quantifierUpper(q.getText());
    if (depth === null) add("UNBOUNDED_PATTERN", `quantified path '${q.getText()}' needs an explicit upper bound <= ${maxDepth}`);
    else {
      facts.maxPathDepth = Math.max(facts.maxPathDepth, depth);
      if (depth > maxDepth) add("UNBOUNDED_PATTERN", `quantifier upper bound ${depth} exceeds maxDepth ${maxDepth}`);
    }
  }
  for (const s of [...descendants(root, "shortestPathPattern"), ...descendants(root, "shortestPathExpression")]) {
    if (!descendants(s, "pathLength").length) add("UNBOUNDED_PATTERN", "shortestPath needs an explicit bounded relationship length");
  }
  // Label predicates in expressions (n:Label).
  for (const nl of [...descendants(root, "nodeLabels"), ...descendants(root, "nodeLabelsIs")]) {
    if (nl && !descendants(root, "nodePattern").some((np) => child(np, "nodeLabels") === nl || child(np, "nodeLabelsIs") === nl)) {
      for (const l of labelsOfNodeLabels(nl)) if (!model.isPermittedLabel(l) && !model.isPermittedRelationshipType(l)) add("LABEL_FORBIDDEN", `label/type ${l} is not readable`, l);
    }
  }

  // Functions.
  for (const fi of descendants(root, "functionInvocation")) {
    const fnCtx = child(fi, "functionName");
    const name = (fnCtx ? fnCtx.getText() : fi.getText().split("(")[0]!).replace(/`/g, "").toLowerCase();
    facts.functions.push(name);
    if (!FUNCTION_ALLOWLIST.has(name)) add("FUNCTION_FORBIDDEN", `function ${name}() is not on the read allowlist (pure functions only; properties()/keys()/elementId()/id()/apoc/gds/db/vector/genai are refused)`, name);
  }
  // Procedures.
  for (const cc of descendants(root, "callClause")) {
    const pn = child(cc, "procedureName");
    const name = pn ? pn.getText().replace(/`/g, "") : cc.getText();
    facts.procedures.push(name);
    if (!PROCEDURE_ALLOWLIST.has(name)) add("PROCEDURE_FORBIDDEN", `procedure ${name} is not on the read allowlist (${[...PROCEDURE_ALLOWLIST].join(", ")})`, name);
    else if (declared.procedures.length && !declared.procedures.includes(name)) add("PROCEDURE_FORBIDDEN", `procedure ${name} is outside the artifact's declared scope`, name);
    if (!descendants(cc, "procedureResultItem").length) add("PROCEDURE_FORBIDDEN", `procedure ${name} must YIELD named columns`);
  }
  // Map projections: no `.*`, no dynamic properties.
  for (const mp of descendants(root, "mapProjectionElement")) if (mp.getText() === ".*") add("PROPERTY_FORBIDDEN", "the all-properties map projection {.*} is refused; name the release properties to project");
  if (descendants(root, "dynamicProperty").length) add("PROPERTY_FORBIDDEN", "dynamic property access n[$key] is refused (the property policy cannot verify it)");

  // Property access n.prop: operational properties refused; restricted properties refused in the binding scope.
  function checkProperty(prop: string, labels: string[]) {
    const p = unquote(prop);
    facts.properties.push(p);
    if (model.operationalProperties.has(p)) add("PROPERTY_FORBIDDEN", `operational property ${p} is never readable`, p);
    for (const l of labels) {
      const t = model.node(l);
      if (t && model.restrictedProperties(t.name, scope).includes(p)) add("PROPERTY_FORBIDDEN", `${t.name}.${p} is restricted source-span text in scope ${scope}`, `${t.name}.${p}`);
    }
  }
  for (const e1 of descendants(root, "expression2")) {
    const kids = e1.children ?? [];
    const base = kids[0];
    const v = base && ruleOf(base) === "expression1" ? child(base, "variable") : undefined;
    for (const pf of kids.slice(1)) {
      if (terminals(pf)[0] === "[" && v) {
        const sym = symbolAt(posOf(v));
        if (facts.nodeVariables[v.getText()] || sym?.types?.some((t) => /^(Node|Relationship|Map|Any)$/.test(t))) add("PROPERTY_FORBIDDEN", `subscript access ${v.getText()}[...] on an entity or map is refused (dynamic property; the property policy cannot verify it)`);
      }
      const prop = child(pf, "property");
      if (!prop) continue;
      const key = child(prop, "propertyKeyName");
      if (key) checkProperty(key.getText(), v ? facts.nodeVariables[v.getText()] ?? [] : []);
    }
  }
  for (const mp of descendants(root, "mapProjection")) {
    const v = child(mp, "variable");
    for (const el of descendants(mp, "mapProjectionElement")) {
      const prop = child(el, "property");
      const key = prop ? child(prop, "propertyKeyName") : child(el, "expression") ? undefined : child(el, "propertyKeyName");
      if (key) checkProperty(key.getText(), v ? facts.nodeVariables[v.getText()] ?? [] : []);
    }
  }

  // Whole-entity returns (static check; the serializer refuses any that slip through, e.g. via aliasing).
  const entityVars = new Set<string>(Object.keys(facts.nodeVariables));
  for (const rp of descendants(root, "relationshipPattern")) {
    const v = child(rp, "variable");
    if (v) entityVars.add(v.getText());
  }
  for (const pat of descendants(root, "pattern")) {
    const v = child(pat, "variable");
    if (v) entityVars.add(v.getText());
  }
  const returns = descendants(root, "returnClause");
  for (const rc of returns) {
    for (const item of descendants(rc, "returnItem")) {
      const ex = child(item, "expression");
      const text = ex?.getText() ?? "";
      const sym = ex && /^[A-Za-z_][A-Za-z0-9_]*$/.test(text) ? symbols.find((x) => x.variable === text && x.references.includes(posOf(ex))) : undefined;
      const entityTyped = Boolean(sym?.types?.length && sym.types.every((t) => /^(Node|Relationship|Path|List<Node>|List<Relationship>|List<Path>)$/.test(t)));
      if (entityVars.has(text) || entityTyped) add("FULL_ENTITY_RETURN", `RETURN ${text} returns a whole node/relationship/path; project named release properties instead`, text);
      for (const fi of descendants(item, "functionInvocation")) {
        const fn = (child(fi, "functionName")?.getText() ?? "").toLowerCase();
        if (ENTITY_FUNCTIONS.has(fn) && descendants(item, "functionInvocation")[0] === fi && text.toLowerCase().startsWith(fn)) add("FULL_ENTITY_RETURN", `RETURN ${fn}(...) returns whole entities`, fn);
      }
    }
    for (const ri of descendants(rc, "returnItems")) if (terminals(ri)[0] === "*") add("FULL_ENTITY_RETURN", "RETURN * may return whole entities; name the returned columns");
  }
  // Final ORDER BY (ordering policy).
  const topReturns = returns.filter((r) => !ancestors(r).some((a) => SUBQUERY_EXPRESSIONS.has(a) || a === "subqueryClause"));
  const lastReturn = topReturns[topReturns.length - 1];
  facts.hasFinalOrderBy = Boolean(lastReturn && child(child(lastReturn, "returnBody") ?? lastReturn, "orderBy"));
  facts.parameters = [...new Set(descendants(root, "parameterName").map((p) => unquote(p.getText())))].sort();
  facts.labels = [...new Set(facts.labels)].sort();
  facts.relationshipTypes = [...new Set(facts.relationshipTypes)].sort();
  facts.functions = [...new Set(facts.functions)].sort();
  facts.procedures = [...new Set(facts.procedures)].sort();
  facts.properties = [...new Set(facts.properties)].sort();
  if (!returns.length) add("CLAUSE_FORBIDDEN", "a read artifact must end in RETURN");
  return { accepted: reasons.length === 0, reasons, facts };
}

function pathLengthUpper(text: string): number | null {
  // *  *n  *n..m  *..m  *n..
  const m = /^\*(\d+)?(\.\.(\d+)?)?$/.exec(text);
  if (!m) return null;
  if (!m[2]) return m[1] !== undefined ? Number(m[1]) : null;
  return m[3] !== undefined ? Number(m[3]) : null;
}

function quantifierUpper(text: string): number | null {
  if (text === "+" || text === "*") return null;
  const m = /^\{(\d+)?(,(\d+)?)?\}$/.exec(text);
  if (!m) return null;
  if (!m[2]) return m[1] !== undefined ? Number(m[1]) : null;
  return m[3] !== undefined ? Number(m[3]) : null;
}

/** EXPLAIN plan operators that must never appear in a read plan (defense in depth behind the parser and the role). */
export const FORBIDDEN_PLAN_OPERATORS = /^(Create|Merge|SetProperty|SetProperties|SetLabels|SetNodeProperty|SetRelationshipProperty|RemoveLabels|Delete|DetachDelete|DeleteNode|DeleteRelationship|LoadCSV|Foreach|TransactionApply|TransactionForeach|EmptyResult|LockingMerge)/;

export function planOperators(plan: unknown): string[] {
  const out: string[] = [];
  const visit = (p: unknown) => {
    if (!p || typeof p !== "object") return;
    const o = p as { operatorType?: string; children?: unknown[] };
    if (o.operatorType) out.push(String(o.operatorType).replace(/@.*$/, ""));
    for (const c of o.children ?? []) visit(c);
  };
  visit(plan);
  return out;
}
