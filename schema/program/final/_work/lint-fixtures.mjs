#!/usr/bin/env node
/**
 * Lints the candidate fixtures (final/fixtures/<P>/<folder>/assertions.yaml and intent*.json) against the candidate SDL
 * (its IR, final/schema/final_biotech_schema_v2.ir.json) and the predicate registry (final/vocabularies/predicates.yaml).
 *
 *   node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs
 *        [--baseline]            write final/_work/fixture-lint-baseline.json (default: print the summary only)
 *        [--fixture <P>/<folder>] lint one fixture and print its violations
 *        [--out <C:/abs/file.json>]
 *   Exit code: 1 when any linted fixture has an error (full suite and --fixture alike), else 0. Warnings never fail.
 *
 * Exports lintFixture(dir, ctx), lintFixtures(ctx) and loadLintContext() for other scripts (fixture editors re-run it
 * after each edit). Deterministic: no timestamps.
 *
 * Checks (category, severity):
 *   node-type (error)            a `type` / `nodeType` / `candidateNodeType` naming a type that is not a node, interface
 *                                or union of the candidate (module prefixes K. / Dn. are stripped first)
 *   node-type-module (warn)      the prefix names another module than the one that owns the type in the candidate
 *   relationship-type (error)    a relationship type (`edge.type`, `relationshipType`, `relationship`, SCREAMING `type`,
 *                                intent edge.structural / state.attach / edge.assert relationshipType) that is not a
 *                                candidate relationship type; an edge.assert on a registered predicate-only name is
 *                                allowed (no edge is written) but may not carry edgeProperties
 *   edge-property-type (error)   an edge-property type name that is not in the candidate or not used by that relationship
 *   edge-property (error)        an edge property key the relationship's edge-property type(s) do not declare
 *   node-property (error)        an intent subject / node.upsert property the node type does not declare
 *   enum-value (error)           a SCREAMING value of a key that is an enum-typed field in the candidate, not a value of
 *                                that enum (type-aware for intent node / edge properties, else the union over every enum
 *                                field of that name)
 *   relationship-pair (error)    a typed edge between two types the candidate does not declare for it (cut pairs, R-06)
 *   predicate-unregistered (error) an Assertion predicate (also inputPredicates, binding.predicate) that is neither in the
 *                                registry nor an asserted relationship type
 *   predicate-alias (error)      a registry alias: re-key to the canonical name
 *   predicate-retired (error)    a retired name: apply the registry's replacedBy / fixtureEdit
 *   predicate-report-only (error) a report-only predicate (R-85) written as a stored Assertion
 *   predicate-mismatch (error)   an intent edge.assert whose assertion.predicate differs from its typed relationshipType
 *   predicate-proposed (warn)    a proposed-new predicate (registrar has not accepted it)
 *   retired-name (error | warn)  the FU-03 residual scan (RESIDUAL of _work/repath-fixtures.mjs) over non-comment lines;
 *                                supersedesUid and HAS_REVISION_STATUS are warnings (a use may be legitimate)
 * Categories overlap by design: a removed edge field (R-30) is both an edge-property and a retired-name violation.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const FINAL = resolve(here, "..");
const PROGRAM = resolve(FINAL, "..");
const require = createRequire(resolve(PROGRAM, "../../packages/schema-workspace/package.json"));
const YAML = require("yaml");
const sha = (t) => createHash("sha256").update(t).digest("hex");
const SCREAM = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;
const PASCAL = /^(?:(K|D\d{1,2})\.)?([A-Z][a-z][A-Za-z0-9]*)$/;
const PACKETS = ["K", ...Array.from({ length: 13 }, (_, i) => `D${i + 1}`), "cross-domain"];

// ------------------------------------------------------------------------------------------------ context
export function loadLintContext() {
  const irText = readFileSync(join(FINAL, "schema", "final_biotech_schema_v2.ir.json"), "utf8");
  const ir = JSON.parse(irText);
  const regText = readFileSync(join(FINAL, "vocabularies", "predicates.yaml"), "utf8");
  const reg = YAML.parse(regText);
  const repathText = readFileSync(join(here, "repath-fixtures.mjs"), "utf8");
  const i = repathText.indexOf("const RESIDUAL = [");
  const j = repathText.indexOf("\n];", i);
  const RESIDUAL = new Function(`return ${repathText.slice(i + "const RESIDUAL = ".length, j + 2)};`)();
  const nodes = Object.fromEntries(ir.nodes.map((n) => [n.name, n]));
  const owner = Object.fromEntries([...ir.nodes, ...ir.interfaces, ...ir.unions].map((n) => [n.name, n.fragment]));
  const edgeTypes = Object.fromEntries(ir.edgePropertyTypes.map((e) => [e.name, e]));
  const enums = Object.fromEntries(ir.enums.map((e) => [e.name, new Set(e.values.map((v) => v.name))]));
  const enumFields = {}; // field name -> Set(values) (union over every enum used by a field of that name)
  for (const e of ir.enums) for (const u of e.usedBy ?? []) { const s = (enumFields[u.field] ??= new Set()); for (const v of enums[e.name]) s.add(v); }
  const fieldsOf = (props) => Object.fromEntries((props ?? []).map((p) => [p.name, p]));
  return {
    ir, reg, RESIDUAL, nodes, owner, edgeTypes, enums, enumFields, fieldsOf,
    // a type is asserted when its relClass is, or when a declaring field's docstring says class: asserted (IR `classes`;
    // MEASURES is relClass derived with flag derived-registry but declared asserted)
    rels: Object.fromEntries(ir.relationshipTypes.map((r) => [r.type, { ...r, asserted: r.relClass === "asserted" || (r.classes ?? []).includes("asserted") }])),
    preds: Object.fromEntries(reg.predicates.map((p) => [p.predicate, p])),
    inputs: { sdl: ir.schemaDigest, predicatesYamlSha256: sha(regText), residualFrom: "final/_work/repath-fixtures.mjs RESIDUAL" },
  };
}

// ------------------------------------------------------------------------------------------------ checks
const WARN_RESIDUAL = /supersedesUid|HAS_REVISION_STATUS/;

function checkPredicate(ctx, name, push, where, stored = true) {
  if (typeof name !== "string" || !name) return;
  const p = ctx.preds[name];
  const r = ctx.rels[name];
  if (!p) {
    if (r && !r.asserted) push("predicate-unregistered", "error", where, name, `${name} is a ${r.relClass} relationship type: it has no authorizing Assertion`);
    else if (!r) push("predicate-unregistered", "error", where, name, `${name} is not in final/vocabularies/predicates.yaml (R-52)`);
    return;
  }
  const st = p.status;
  if (st.startsWith("alias-of:")) push("predicate-alias", "error", where, name, `alias: re-key to ${st.slice(9)}${p.fixtureEdit ? ` — ${p.fixtureEdit}` : ""}`);
  else if (st.startsWith("retired-by:")) push("predicate-retired", "error", where, name, `retired (${st.slice(11)}) → ${(p.replacedBy ?? []).join(" | ")}${p.fixtureEdit ? ` — ${p.fixtureEdit}` : ""}`);
  else if (st === "proposed-new") push("predicate-proposed", "warn", where, name, `proposed-new: registrar ${p.registrar} has not registered it${p.candidate ? ` (candidate: ${p.candidate})` : ""}`);
  else if (p.storage === "report-only" && stored) push("predicate-report-only", "error", where, name, `${name} is report-only (R-85): written only inside a published Report`);
}

function checkNodeType(ctx, raw, push, where) {
  if (typeof raw !== "string") return;
  const m = raw.match(PASCAL);
  if (!m) return;
  const [, mod, t] = m;
  if (!ctx.owner[t]) { if (!ctx.edgeTypes[t] && !ctx.enums[t]) push("node-type", "error", where, raw, `${t} is not a node, interface or union of the candidate`); return; }
  if (mod && ctx.owner[t] !== mod && !(mod === "K" && ctx.owner[t] === "K")) push("node-type-module", "warn", where, raw, `${t} is owned by ${ctx.owner[t]} in the candidate, not ${mod}`);
}

const leadRel = (v) => (typeof v === "string" ? (v.match(/^(?:(?:K|D\d{1,2})\s+)?([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+|[A-Z]{3,})\b/) ?? [])[1] : undefined);

function checkRel(ctx, name, push, where, { allowPredicate = true } = {}) {
  if (!name) return false;
  if (ctx.rels[name]) return true;
  const p = ctx.preds[name];
  if (allowPredicate && p && p.kind !== "authorizing") { checkPredicate(ctx, name, push, where); return false; }
  push("relationship-type", "error", where, name, p ? `${name} is a registered predicate (${p.status}), not a relationship type` : `${name} is not a relationship type of the candidate`);
  return false;
}

// the (from, to) pair must be one the candidate declares for that type (IR triples are expanded over unions and
// interfaces); pairs cut in synthesis (R-06, R-73) show up here
function checkPair(ctx, relName, from, to, push, where) {
  const r = ctx.rels[relName];
  if (!r || !ctx.nodes[from] || !ctx.nodes[to]) return;
  if (!r.triples.some((t) => t.from === from && t.to === to)) push("relationship-pair", "error", where, `${from}-[:${relName}]->${to}`, `${relName} is not declared from ${from} to ${to} in the candidate`);
}

function edgeFields(ctx, relName) {
  const r = ctx.rels[relName];
  if (!r) return null;
  const types = r.propertiesTypes ?? [];
  if (!types.length) return null;
  const f = {};
  for (const t of types) for (const p of ctx.edgeTypes[t]?.properties ?? []) f[p.name] = p;
  return { types, fields: f };
}

function checkEdgeProps(ctx, relName, props, push, where) {
  if (!props) return;
  const sub = (k) => (where && typeof where === "object" ? { ...(where.line ? { line: where.line } : {}), path: `${where.path ?? ""}.${k}` } : { path: `${where}.${k}` });
  const ef = edgeFields(ctx, relName);
  if (typeof props === "string") {
    if (!PASCAL.test(props)) return;
    const t = props.replace(/^(?:K|D\d{1,2})\./, "");
    if (!ctx.edgeTypes[t]) push("edge-property-type", "error", where, props, `${t} is not an edge-property type of the candidate`);
    else if (ef && !ef.types.includes(t)) push("edge-property-type", "error", where, props, `${relName} uses ${ef.types.join(" | ")}, not ${t}`);
    return;
  }
  if (typeof props !== "object" || Array.isArray(props) || !ef) return;
  for (const [k, v] of Object.entries(props)) {
    const f = ef.fields[k];
    if (!f) { push("edge-property", "error", sub(k), k, `${relName} edge properties (${ef.types.join(" | ")}) declare no field ${k}`); continue; }
    if (f.kind === "enum") for (const x of [v].flat()) if (typeof x === "string" && SCREAM.test(x) && !ctx.enums[f.namedType]?.has(x)) push("enum-value", "error", sub(k), x, `${x} is not a ${f.namedType} value`);
  }
}

// `where` is a base path string (intent) or a function key -> location (assertions.yaml, with lines)
function checkGenericEnums(ctx, obj, push, where, skip = new Set()) {
  const loc = typeof where === "function" ? where : (k) => ({ path: `${where}.${k}` });
  for (const [k, v] of Object.entries(obj)) {
    if (skip.has(k) || !ctx.enumFields[k]) continue;
    for (const x of [v].flat()) if (typeof x === "string" && SCREAM.test(x) && !ctx.enumFields[k].has(x)) push("enum-value", "error", loc(k), x, `${x} is not a value of any enum the candidate uses for a field named ${k}`);
  }
}

const EDGE_PROP_KEYS = ["edgeProperties", "props", "properties"];
const REL_KEYS = ["relationshipType", "relationship"];

function lintAssertions(ctx, text, push) {
  const doc = YAML.parseDocument(text, { maxAliasCount: -1 });
  const data = doc.toJS({ maxAliasCount: -1 });
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") lineStarts.push(i + 1);
  const lineOf = (path) => { const n = doc.getIn(path, true); const off = n?.range?.[0]; if (off === undefined) return null; let lo = 0, hi = lineStarts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStarts[mid] <= off) lo = mid; else hi = mid - 1; } return lo + 1; };
  const at = (path) => ({ line: lineOf(path), path: path.join(".") });
  const strip = (t) => (typeof t === "string" ? t.replace(/^(?:K|D\d{1,2})\./, "") : undefined);
  const refType = {};
  (function idx(n) { if (Array.isArray(n)) n.forEach(idx); else if (n && typeof n === "object") { const t = strip(n.type); if (t && ctx.owner[t]) for (const k of [n.ref, n.id, n.uid]) if (typeof k === "string") refType[k] = t; Object.values(n).forEach(idx); } })(data);
  const typeOf = (x) => (x && typeof x === "object" ? strip(x.type) ?? refType[x.ref] ?? refType[x.uid] : refType[x]);
  (function walk(n, path, inReport) {
    if (Array.isArray(n)) { n.forEach((x, i) => walk(x, [...path, i], inReport)); return; }
    if (!n || typeof n !== "object") return;
    const P = (k) => at([...path, k]);
    // node / relationship types
    if (typeof n.type === "string") { if (PASCAL.test(n.type)) checkNodeType(ctx, n.type, push, P("type")); else { const r = leadRel(n.type); if (r && checkRel(ctx, r, push, P("type"))) for (const k of EDGE_PROP_KEYS) checkEdgeProps(ctx, r, n[k], push, P(k)); } }
    for (const k of ["nodeType", "candidateNodeType"]) checkNodeType(ctx, n[k], push, P(k));
    for (const k of REL_KEYS) { const r = leadRel(n[k]); if (r && checkRel(ctx, r, push, P(k))) for (const e of EDGE_PROP_KEYS) checkEdgeProps(ctx, r, n[e], push, P(e)); }
    if (n.edge && typeof n.edge === "object" && !Array.isArray(n.edge)) { const r = leadRel(n.edge.type); if (r && checkRel(ctx, r, push, at([...path, "edge", "type"]))) for (const e of EDGE_PROP_KEYS) checkEdgeProps(ctx, r, n.edge[e], push, at([...path, "edge", e])); }
    else if (typeof n.edge === "string") { const r = leadRel(n.edge); if (r) checkRel(ctx, r, push, P("edge")); }
    if (typeof n.edgePropertiesType === "string") checkEdgeProps(ctx, leadRel(n.predicate) ?? leadRel(n.relationshipType) ?? null, n.edgePropertiesType, push, P("edgePropertiesType"));
    // predicates; an Assertion whose predicate is a typed relationship type carries the edge's properties beside it
    const report = inReport || /report/i.test(String(path[path.length - 1] ?? "")) || /Report$/.test(String(n.type ?? ""));
    const structuralRow = /^structural/.test(String(n.edgeClass ?? n.class ?? ""));
    const relOfRow = (n.edge && typeof n.edge === "object" ? leadRel(n.edge.type) : null) ?? leadRel(n.relationshipType) ?? leadRel(n.relationship) ?? (typeof n.predicate === "string" && ctx.rels[n.predicate] ? n.predicate : null);
    if (relOfRow && (n.subject || n.from) && (n.object || n.to)) checkPair(ctx, relOfRow, typeOf(n.subject ?? n.from), typeOf(n.object ?? n.to), push, P(n.subject ? "subject" : "from"));
    if (typeof n.predicate === "string" && structuralRow) checkRel(ctx, n.predicate, push, P("predicate"), { allowPredicate: false });
    else if (typeof n.predicate === "string") {
      checkPredicate(ctx, n.predicate, push, P("predicate"), !report);
      if (ctx.rels[n.predicate] && !n.edge && !REL_KEYS.some((k) => n[k])) for (const e of ["edgeProperties"]) checkEdgeProps(ctx, n.predicate, n[e], push, P(e));
    }
    if (Array.isArray(n.inputPredicates)) n.inputPredicates.forEach((x, i) => checkPredicate(ctx, x, push, at([...path, "inputPredicates", i]), false));
    if (n.predicateOnly && typeof n.predicateOnly === "object" && !Array.isArray(n.predicateOnly)) for (const x of Object.keys(n.predicateOnly)) checkPredicate(ctx, x, push, P("predicateOnly"), false);
    checkGenericEnums(ctx, n, push, P, new Set(["type", "predicate", "kind", "class", "edgeClass"]));
    for (const [k, v] of Object.entries(n)) {
      if (k === "edge" || (EDGE_PROP_KEYS.includes(k) && typeof v === "string")) continue;
      walk(v, [...path, k], report);
    }
  })(data, [], false);
  return { lineOf };
}

function lintIntent(ctx, j, push) {
  const nodeTypeOf = {};
  (j.subjects ?? []).forEach((s, i) => {
    const w = { path: `subjects[${i}](${s.ref})` };
    nodeTypeOf[s.ref] = s.nodeType;
    checkNodeType(ctx, s.nodeType, push, w);
    checkNodeProps(ctx, s.nodeType, s.properties, push, w);
  });
  for (const s of j.sources ?? []) {
    checkGenericEnums(ctx, s.source ?? {}, push, `sources(${s.ref}).source`);
    checkGenericEnums(ctx, s.source?.properties ?? {}, push, `sources(${s.ref}).source.properties`);
    checkGenericEnums(ctx, s.snapshot ?? {}, push, `sources(${s.ref}).snapshot`);
    (s.locators ?? []).forEach((l) => checkGenericEnums(ctx, l, push, `sources(${s.ref}).locators(${l.ref})`));
  }
  (j.proposals ?? []).forEach((pr, i) => {
    const w = (k) => ({ path: `proposals[${i}](${pr.proposalId})${k ? `.${k}` : ""}` });
    if (pr.kind === "edge.assert") {
      const typed = !!ctx.rels[pr.relationshipType];
      if (typed) {
        checkPair(ctx, pr.relationshipType, nodeTypeOf[pr.fromRef], nodeTypeOf[pr.toRef], push, w("relationshipType"));
        if (!ctx.rels[pr.relationshipType].asserted) push("relationship-type", "error", w("relationshipType"), pr.relationshipType, `edge.assert on a ${ctx.rels[pr.relationshipType].relClass} relationship type`);
        checkEdgeProps(ctx, pr.relationshipType, pr.edgeProperties, push, w("edgeProperties"));
        if (pr.assertion?.predicate && pr.assertion.predicate !== pr.relationshipType) push("predicate-mismatch", "error", w("assertion.predicate"), pr.assertion.predicate, `the authorizing predicate of a ${pr.relationshipType} edge is ${pr.relationshipType}`);
        else checkPredicate(ctx, pr.assertion?.predicate ?? pr.relationshipType, push, w("assertion.predicate"));
      } else {
        // predicate-only edge.assert: no edge is written; the name must be a registered predicate
        checkRel(ctx, pr.relationshipType, push, w("relationshipType"));
        if (pr.assertion?.predicate && pr.assertion.predicate !== pr.relationshipType) checkPredicate(ctx, pr.assertion.predicate, push, w("assertion.predicate"));
        if (pr.edgeProperties && Object.keys(pr.edgeProperties).length) push("edge-property", "error", w("edgeProperties"), Object.keys(pr.edgeProperties).join(","), `${pr.relationshipType} is not a typed relationship: edgeProperties have nowhere to go`);
      }
    } else if (pr.kind === "edge.structural" || pr.kind === "state.attach") {
      if (checkRel(ctx, pr.relationshipType, push, w("relationshipType"), { allowPredicate: false })) { checkEdgeProps(ctx, pr.relationshipType, pr.properties, push, w("properties")); checkPair(ctx, pr.relationshipType, nodeTypeOf[pr.fromRef ?? pr.subjectRef], nodeTypeOf[pr.toRef ?? pr.stateRef], push, w("relationshipType")); }
      if (pr.assertion?.predicate) checkPredicate(ctx, pr.assertion.predicate, push, w("assertion.predicate"));
    } else if (pr.kind === "assertion.literal") {
      checkPredicate(ctx, pr.predicate, push, w("predicate"));
      if (pr.assertion?.predicate && pr.assertion.predicate !== pr.predicate) checkPredicate(ctx, pr.assertion.predicate, push, w("assertion.predicate"));
      checkGenericEnums(ctx, pr, push, w().path, new Set(["kind", "predicate"]));
    } else if (pr.kind === "node.upsert") {
      checkNodeProps(ctx, nodeTypeOf[pr.subjectRef], pr.properties, push, w("properties"));
    } else if (pr.kind === "mention.stage") {
      checkNodeType(ctx, pr.candidateNodeType, push, w("candidateNodeType"));
    }
    if (pr.assertion) { checkGenericEnums(ctx, pr.assertion, push, w("assertion").path, new Set(["predicate"])); checkGenericEnums(ctx, pr.assertion.validity ?? {}, push, w("assertion.validity").path); }
    if (pr.identifier) checkGenericEnums(ctx, pr.identifier, push, w("identifier").path);
  });
}

function checkNodeProps(ctx, nodeType, props, push, where) {
  if (!props || typeof props !== "object") return;
  const n = ctx.nodes[nodeType];
  if (!n) return;
  const f = ctx.fieldsOf(n.properties);
  for (const [k, v] of Object.entries(props)) {
    const p = f[k];
    if (!p) { push("node-property", "error", { path: `${where.path}.${k}` }, k, `${nodeType} declares no property ${k}`); continue; }
    if (p.kind === "enum") for (const x of [v].flat()) if (typeof x === "string" && SCREAM.test(x) && !ctx.enums[p.namedType]?.has(x)) push("enum-value", "error", { path: `${where.path}.${k}` }, x, `${x} is not a ${p.namedType} value`);
    if (k === "inputPredicates") for (const x of [v].flat()) checkPredicate(ctx, x, push, { path: `${where.path}.${k}` }, false);
  }
}

function residualScan(ctx, file, text, push) {
  const lines = text.split("\n");
  for (const r of ctx.RESIDUAL) {
    lines.forEach((l, i) => {
      const code = /^\s*#/.test(l) ? "" : l.replace(/\s#\s.*$/, "");
      const m = code.match(r.re);
      if (m) push("retired-name", WARN_RESIDUAL.test(r.re.source) ? "warn" : "error", { line: i + 1 }, m[0], r.why);
    });
  }
}

// ------------------------------------------------------------------------------------------------ per fixture
export function lintFixture(dir, ctx) {
  const fx = relative(join(FINAL, "fixtures"), dir).split(sep).join("/");
  const violations = [];
  const files = readdirSync(dir).filter((f) => f === "assertions.yaml" || /^intent.*\.json$/.test(f)).sort();
  for (const file of files) {
    const text = readFileSync(join(dir, file), "utf8");
    const seen = new Set();
    let lineOf = null;
    const push = (category, severity, where, value, message) => {
      let loc = where && typeof where === "object" ? where : { path: String(where) };
      if (!loc.line && lineOf && loc.path) { const parts = loc.path.split(".").map((x) => (/^\d+$/.test(x) ? Number(x) : x)); loc = { line: lineOf(parts), path: loc.path }; }
      const key = `${category}|${loc.line ?? ""}|${loc.path ?? ""}|${value}`;
      if (seen.has(key)) return;
      seen.add(key);
      violations.push({ file, ...(loc.line ? { line: loc.line } : {}), ...(loc.path ? { path: loc.path } : {}), category, severity, value: String(value), message });
    };
    if (file === "assertions.yaml") { ({ lineOf } = lintAssertions(ctx, text, (c, s, w, v, m) => push(c, s, w, v, m))); }
    else { let j; try { j = JSON.parse(text); } catch (e) { push("parse", "error", { path: "" }, file, e.message); continue; } lintIntent(ctx, j, push); }
    residualScan(ctx, file, text, push);
  }
  violations.sort((a, b) => a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0) || (a.path ?? "").localeCompare(b.path ?? "") || a.category.localeCompare(b.category) || a.value.localeCompare(b.value));
  const byCategory = {};
  for (const v of violations) byCategory[v.category] = (byCategory[v.category] ?? 0) + 1;
  return { fixture: fx, packet: fx.split("/")[0], files, errors: violations.filter((v) => v.severity === "error").length, warnings: violations.filter((v) => v.severity === "warn").length, byCategory: sortObj(byCategory), violations };
}
const sortObj = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

export function lintFixtures(ctx = loadLintContext()) {
  const root = join(FINAL, "fixtures");
  const dirs = [];
  for (const p of readdirSync(root).sort()) { const d = join(root, p); if (!statSync(d).isDirectory()) continue; for (const f of readdirSync(d).sort()) { const fd = join(d, f); if (statSync(fd).isDirectory()) dirs.push(fd); } }
  const fixtures = dirs.map((d) => lintFixture(d, ctx));
  const byPacket = {};
  for (const p of PACKETS) {
    const fs = fixtures.filter((f) => f.packet === p);
    if (!fs.length) continue;
    const cat = {};
    for (const f of fs) for (const [k, v] of Object.entries(f.byCategory)) cat[k] = (cat[k] ?? 0) + v;
    byPacket[p] = { fixtures: fs.length, clean: fs.filter((f) => !f.errors).length, errors: fs.reduce((a, f) => a + f.errors, 0), warnings: fs.reduce((a, f) => a + f.warnings, 0), byCategory: sortObj(cat) };
  }
  const cat = {};
  for (const f of fixtures) for (const [k, v] of Object.entries(f.byCategory)) cat[k] = (cat[k] ?? 0) + v;
  const predCount = {};
  for (const f of fixtures) for (const v of f.violations) if (v.category.startsWith("predicate-")) predCount[`${v.category} ${v.value}`] = (predCount[`${v.category} ${v.value}`] ?? 0) + 1;
  return {
    generatedBy: "final/_work/lint-fixtures.mjs",
    inputs: ctx.inputs,
    note: "Categories overlap by design (a removed R-30 edge field is both edge-property and retired-name). Severity warn = proposed-new predicates, module-prefix drift, and residual names whose use may be legitimate (supersedesUid, HAS_REVISION_STATUS).",
    summary: { fixtures: fixtures.length, clean: fixtures.filter((f) => !f.errors).length, errors: fixtures.reduce((a, f) => a + f.errors, 0), warnings: fixtures.reduce((a, f) => a + f.warnings, 0), byCategory: sortObj(cat), byPacket },
    predicateViolations: sortObj(predCount),
    fixtures,
  };
}

// ------------------------------------------------------------------------------------------------ CLI
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const ctx = loadLintContext();
  if (args.includes("--fixture")) {
    const r = lintFixture(join(FINAL, "fixtures", args[args.indexOf("--fixture") + 1]), ctx);
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.errors ? 1 : 0);
  }
  const res = lintFixtures(ctx);
  const out = args.includes("--out") ? args[args.indexOf("--out") + 1] : args.includes("--baseline") ? join(here, "fixture-lint-baseline.json") : null;
  if (out) writeFileSync(out, JSON.stringify(res, null, 2) + "\n");
  console.log(JSON.stringify({ ...res.summary, predicateViolations: res.predicateViolations }, null, 2));
  process.exit(res.summary.errors ? 1 : 0); // close-out fix 2026-10-09: the full suite used to exit 0 with errors present
}
