#!/usr/bin/env node
/**
 * Validates a domain packet against schema/program/fast-track/01-PACKET-CONTRACT.md.
 *
 *   node scripts/packet-check.mjs D6 [--budget-nodes 8 --budget-rels 14 --budget-pairs 35]
 *
 * Exit 0 when every check passes, 1 otherwise. Checks are structural (files, SDL parse, register cross-references,
 * directive discipline, budgets with EXCESS justifications, fixtures, seams); judgment stays with the synthesizer.
 *
 *   node scripts/packet-check.mjs --release <release dir>      (TL-01: SDL discipline of every release module)
 *
 * Kernel references (TL-01, release v2): the kernel allowlist is read from the release kernel module
 * (sdl/modules/kernel.graphql of --kernel-release, default ../biotech-meta/docs/schema/releases/biotech-schema-v2.0.0,
 * falling back to schema/program/final/schema/kernel.graphql): its interfaces, node types, edge-property types and
 * enums. Mention and StateEpisodeProperties are removed in v2 (R-09, R-10) and fail when referenced. Edge-property
 * types (@relationship properties) and enum-typed fields must resolve to the module or the kernel.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(new URL("../packages/schema-workspace/package.json", import.meta.url));
const { parse: parseGraphql, Kind } = require("graphql");
const { parse: parseYaml } = require("yaml");

const args = process.argv.slice(2);
const sopt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const RETIRED_KERNEL = new Set(["Mention", "StateEpisodeProperties"]);
const BUILTIN = new Set(["String", "Int", "Float", "Boolean", "ID", "DateTime", "Date", "Time", "LocalTime", "LocalDateTime", "Duration", "BigInt", "Point", "CartesianPoint"]);
const kernelPath = [resolve(sopt("--kernel-release", "../biotech-meta/docs/schema/releases/biotech-schema-v2.0.0"), "sdl/modules/kernel.graphql"), resolve("schema/program/final/schema/kernel.graphql")].find(existsSync);
const kernelDefs = new Map();
if (kernelPath) for (const d of parseGraphql(readFileSync(kernelPath, "utf8").replace(/^#.*$/gm, ""), { noLocation: true }).definitions) if (d.name) kernelDefs.set(d.name.value, d.kind);
if (sopt("--release")) releaseMode(resolve(sopt("--release")));
const id = args.find((a) => !a.startsWith("--") && a !== sopt("--release") && a !== sopt("--kernel-release"));
if (!id) {
  console.error("usage: node scripts/packet-check.mjs <packet id> [--budget-nodes n --budget-rels n --budget-pairs n]");
  process.exit(1);
}
const opt = (name, def) => (args.includes(name) ? Number(args[args.indexOf(name) + 1]) : def);
const budget = id === "K" ? { nodes: opt("--budget-nodes", 12), rels: opt("--budget-rels", 14), pairs: opt("--budget-pairs", 40) } : { nodes: opt("--budget-nodes", 8), rels: opt("--budget-rels", 14), pairs: opt("--budget-pairs", 35) };
const root = resolve("schema/program/packets", id);
const problems = [];
const warn = [];
const fail = (m) => problems.push(m);

const REQUIRED = ["SUMMARY.md", "01-ecosystem.md", "02-questions.md", "03-retrieval-patterns.md", "04-schema-proposal.graphql", "05-relationship-register.yaml", "06-node-register.yaml", "08-sources-and-tools.md", "09-reasoning.md", "10-seams.yaml", "11-open-questions.md", "RUNLOG.md"];
for (const f of REQUIRED) if (!existsSync(resolve(root, f))) fail(`missing file ${f}`);
if (problems.length) report();

const read = (f) => readFileSync(resolve(root, f), "utf8");

// ---- questions
const questionIds = new Set();
const questionsWithoutKind = [];
for (const line of read("02-questions.md").split("\n")) {
  const m = /^\|\s*(Q-[A-Z0-9]+-\d+|CQ-[A-Z]+-\d+[a-z]?)\s*\|/.exec(line);
  if (!m) continue;
  questionIds.add(m[1]);
  const cells = line.split("|").map((c) => c.trim());
  const kind = cells[6] ?? "";
  if (!/^(retrieved|materialized|assessment|published)$/.test(kind)) questionsWithoutKind.push(m[1]);
}
if (questionIds.size < 15) warn.push(`02-questions.md has ${questionIds.size} questions (contract asks for 15–40)`);
for (const q of questionsWithoutKind) fail(`question ${q} has no valid answer kind (retrieved|materialized|assessment|published)`);

// ---- SDL
const sdlText = read("04-schema-proposal.graphql");
if (!new RegExp(`^# ---- fragment ${id} ----`, "m").test(sdlText)) fail(`04-schema-proposal.graphql must start with the banner "# ---- fragment ${id} ----"`);
let doc;
try {
  doc = parseGraphql(sdlText.replace(/^#.*$/gm, ""), { noLocation: true });
} catch (e) {
  fail(`SDL does not parse: ${e.message}`);
}
const sdlNodes = new Map();
const sdlRels = new Map();
const unionSizes = new Map();
if (doc) {
  for (const def of doc.definitions) {
    if (def.kind === Kind.UNION_TYPE_DEFINITION) unionSizes.set(def.name.value, def.types?.length ?? 0);
  }
  for (const def of doc.definitions) {
    const isNode = def.kind === Kind.OBJECT_TYPE_DEFINITION && (def.directives ?? []).some((d) => d.name.value === "node");
    if (!isNode) continue;
    sdlNodes.set(def.name.value, def);
    let relFields = 0;
    for (const field of def.fields ?? []) {
      const rel = (field.directives ?? []).find((d) => d.name.value === "relationship");
      if (!rel) continue;
      relFields++;
      const argOf = (n) => rel.arguments?.find((a) => a.name.value === n);
      const type = argOf("type")?.value?.value;
      if (!type) {
        fail(`${def.name.value}.${field.name.value}: @relationship without type`);
        continue;
      }
      const agg = argOf("aggregate");
      if (!agg || agg.value.kind !== Kind.BOOLEAN || agg.value.value !== false) fail(`${def.name.value}.${field.name.value} (${type}): @relationship must set aggregate: false`);
      if (!argOf("nestedOperations")) fail(`${def.name.value}.${field.name.value} (${type}): @relationship must declare nestedOperations`);
      let target = field.type;
      while (target.kind === Kind.NON_NULL_TYPE || target.kind === Kind.LIST_TYPE) target = target.type;
      const targetName = target.name.value;
      const width = unionSizes.get(targetName) ?? 1;
      if (width > 6) fail(`${def.name.value}.${field.name.value} (${type}): union target ${targetName} has ${width} members (max 6)`);
      const desc = field.description?.value ?? "";
      const cls = /class:\s*(structural|asserted|derived)/.exec(desc)?.[1];
      if (!cls) fail(`${def.name.value}.${field.name.value} (${type}): field docstring must state class: structural|asserted|derived`);
      if (cls === "derived") {
        const settable = (field.directives ?? []).find((d) => d.name.value === "settable");
        const ops = argOf("nestedOperations");
        const emptyOps = ops && ops.value.kind === Kind.LIST && ops.value.values.length === 0;
        if (!settable || !emptyOps) fail(`${def.name.value}.${field.name.value} (${type}): derived field must be @settable(onCreate: false, onUpdate: false) with nestedOperations: []`);
      }
      sdlRels.set(type, (sdlRels.get(type) ?? 0) + width);
    }
    if (relFields > 12) fail(`${def.name.value} declares ${relFields} relationship fields (max 12; split by role)`);
    const q = (def.directives ?? []).find((d) => d.name.value === "query");
    const qAgg = q?.arguments?.find((a) => a.name.value === "aggregate");
    if (!qAgg || qAgg.value.value !== false) fail(`${def.name.value}: must carry @query(aggregate: false)`);
  }
}
const pairs = [...sdlRels.values()].reduce((a, b) => a + b, 0);

// ---- registers
let relRegister = { relationships: [] };
let nodeRegister = { nodes: [] };
try { relRegister = parseYaml(read("05-relationship-register.yaml")) ?? relRegister; } catch (e) { fail(`05-relationship-register.yaml: ${e.message}`); }
try { nodeRegister = parseYaml(read("06-node-register.yaml")) ?? nodeRegister; } catch (e) { fail(`06-node-register.yaml: ${e.message}`); }
const regRels = new Map((relRegister.relationships ?? []).map((r) => [r.type, r]));
for (const type of sdlRels.keys()) if (!regRels.has(type)) fail(`relationship ${type} is in the SDL but not in 05-relationship-register.yaml`);
for (const [type, r] of regRels) {
  if (!sdlRels.has(type)) fail(`relationship ${type} is in the register but not in the SDL`);
  for (const k of ["questions", "pattern", "populatedBy", "fixture"]) {
    const v = r[k];
    if (v == null || (Array.isArray(v) && v.length === 0) || v === "") fail(`relationship ${type}: register field "${k}" is empty`);
  }
  for (const q of r.questions ?? []) if (!questionIds.has(q)) fail(`relationship ${type}: question ${q} not in 02-questions.md`);
  if (r.fixture && !existsSync(resolve(root, r.fixture))) fail(`relationship ${type}: fixture path ${r.fixture} does not exist`);
}
const regNodes = new Map((nodeRegister.nodes ?? []).map((n) => [n.name, n]));
for (const name of sdlNodes.keys()) if (!regNodes.has(name)) fail(`node type ${name} is in the SDL but not in 06-node-register.yaml`);
for (const [name, n] of regNodes) {
  if (!sdlNodes.has(name)) fail(`node type ${name} is in the register but not in the SDL`);
  if (!n.whyNode) fail(`node type ${name}: whyNode is empty`);
  if (!n.identityKeys?.length) fail(`node type ${name}: identityKeys is empty`);
}

// ---- budgets with EXCESS justifications
const reasoning = read("09-reasoning.md");
const excessLines = reasoning.split("\n").filter((l) => /^\s*(-\s*)?EXCESS:/.test(l)).length;
const over = Math.max(0, sdlNodes.size - budget.nodes) + Math.max(0, sdlRels.size - budget.rels) + (pairs > budget.pairs ? 1 : 0);
if (over > excessLines) fail(`budget exceeded (nodes ${sdlNodes.size}/${budget.nodes}, rels ${sdlRels.size}/${budget.rels}, pairs ${pairs}/${budget.pairs}) with ${excessLines} EXCESS: justification line(s); need at least ${over}`);

// ---- fixtures
const fixturesDir = resolve(root, "07-fixtures");
const fixtures = existsSync(fixturesDir) ? readdirSync(fixturesDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : [];
if (fixtures.length < 3) fail(`07-fixtures has ${fixtures.length} fixture folder(s); need at least 3`);
const kinds = new Set();
for (const f of fixtures) {
  const src = resolve(fixturesDir, f, "source.md");
  if (!existsSync(src)) { fail(`fixture ${f}: source.md missing`); continue; }
  const text = readFileSync(src, "utf8");
  const kind = /kind:\s*([a-z-]+)/.exec(text)?.[1];
  if (kind) kinds.add(kind);
  if (!/url:\s*https?:\/\//.test(text)) fail(`fixture ${f}: source.md has no url`);
  if (!/retrieved:\s*\d{4}-\d{2}-\d{2}/.test(text)) fail(`fixture ${f}: source.md has no retrieval date`);
  for (const sub of ["locators.yaml", "assertions.yaml", "questions.md"]) if (!existsSync(resolve(fixturesDir, f, sub))) fail(`fixture ${f}: ${sub} missing`);
}
if (!kinds.has("unstructured-to-entity")) fail("no fixture of kind unstructured-to-entity (00-DIRECTIVE 3.8)");
if (!kinds.has("harm") && !kinds.has("disconfirmation")) fail("no fixture of kind harm or disconfirmation");

// ---- seams: every referenced type outside the module must be in 10-seams.yaml
let seams = { seams: [] };
try { seams = parseYaml(read("10-seams.yaml")) ?? seams; } catch (e) { fail(`10-seams.yaml: ${e.message}`); }
const seamTypes = new Set((seams.seams ?? []).map((s) => s.type));
if (doc) {
  const declared = new Set([...sdlNodes.keys()]);
  for (const def of doc.definitions) if (def.name?.value) declared.add(def.name.value);
  // TL-01: the kernel allowlist is the release kernel module (no Mention, no StateEpisodeProperties; includes
  // AssertedRecordedProperties, IdentifierLinkProperties, EvidenceEdgeProperties and every kernel enum).
  const KERNEL = new Set([...kernelDefs.keys(), ...BUILTIN]);
  for (const k of RETIRED_KERNEL) KERNEL.delete(k);
  // A packet may name another module's provided vocabulary (a seam): warn when the name exists in the release modules.
  const releaseDefs = new Set();
  const relModules = resolve(dirname(kernelPath ?? "."));
  if (kernelPath && existsSync(relModules)) for (const f of readdirSync(relModules).filter((x) => x.endsWith(".graphql"))) for (const d of parseGraphql(readFileSync(resolve(relModules, f), "utf8").replace(/^#.*$/gm, ""), { noLocation: true }).definitions) if (d.name) releaseDefs.add(d.name.value);
  if (id !== "K") for (const issue of kernelReferenceIssues(doc, declared, KERNEL)) {
    const m = /type ([A-Za-z0-9_]+) is neither declared/.exec(issue);
    if (m && releaseDefs.has(m[1])) warn.push(`${issue} (it is a release module type: cross-module vocabulary, list it as a seam)`);
    else fail(issue);
  }
  for (const [name, def] of sdlNodes) {
    for (const field of def.fields ?? []) {
      const rel = (field.directives ?? []).find((d) => d.name.value === "relationship");
      if (!rel) continue;
      let target = field.type;
      while (target.kind === Kind.NON_NULL_TYPE || target.kind === Kind.LIST_TYPE) target = target.type;
      const t = target.name.value;
      const type = rel.arguments?.find((a) => a.name.value === "type")?.value?.value;
      if (!declared.has(t) && !KERNEL.has(t) && !seamTypes.has(type)) fail(`${name}.${field.name.value} targets ${t}, which is outside the module and not listed in 10-seams.yaml under type ${type}`);
    }
  }
}

report();

/** TL-01: edge-property types, enum-typed fields and retired kernel names must resolve to the module or the kernel. */
function kernelReferenceIssues(document, declared, kernel) {
  const issues = [];
  for (const def of document.definitions) {
    for (const field of def.fields ?? []) {
      let target = field.type;
      while (target.kind === Kind.NON_NULL_TYPE || target.kind === Kind.LIST_TYPE) target = target.type;
      const t = target.name.value;
      const owner = `${def.name.value}.${field.name.value}`;
      if (RETIRED_KERNEL.has(t)) issues.push(`${owner} references ${t}, removed in v2 (R-09 / R-10)`);
      const rel = (field.directives ?? []).find((d) => d.name.value === "relationship");
      const props = rel?.arguments?.find((a) => a.name.value === "properties")?.value?.value;
      if (props && RETIRED_KERNEL.has(props)) issues.push(`${owner}: edge-property type ${props} removed in v2 (R-10)`);
      else if (props && !declared.has(props) && !kernel.has(props)) issues.push(`${owner}: edge-property type ${props} is neither declared in the module nor a kernel edge-property type`);
      if (!rel && !BUILTIN.has(t) && !declared.has(t) && !kernel.has(t)) issues.push(`${owner}: type ${t} is neither declared in the module nor a kernel type or enum`);
    }
  }
  return issues;
}

/** --release: SDL discipline of every release module; references resolve within the release, kernel names in K. */
function releaseMode(dir) {
  const modulesDir = resolve(dir, "sdl/modules");
  const files = readdirSync(modulesDir).filter((f) => f.endsWith(".graphql")).sort();
  const all = new Map();
  const docs = new Map();
  for (const f of files) {
    const d = parseGraphql(readFileSync(resolve(modulesDir, f), "utf8").replace(/^#.*$/gm, ""), { noLocation: true });
    docs.set(f, d);
    for (const def of d.definitions) if (def.name) all.set(def.name.value, f);
  }
  const results = [];
  let failures = 0;
  for (const [f, d] of docs) {
    const issues = [];
    const declared = new Set([...all.keys()]);
    issues.push(...kernelReferenceIssues(d, declared, new Set([...kernelDefs.keys(), ...BUILTIN])));
    for (const def of d.definitions) {
      const isNode = def.kind === Kind.OBJECT_TYPE_DEFINITION && (def.directives ?? []).some((x) => x.name.value === "node");
      if (!isNode) continue;
      const q = (def.directives ?? []).find((x) => x.name.value === "query");
      if (q?.arguments?.find((a) => a.name.value === "aggregate")?.value?.value !== false) issues.push(`${def.name.value}: must carry @query(aggregate: false)`);
      const m = (def.directives ?? []).find((x) => x.name.value === "mutation");
      const ops = m?.arguments?.find((a) => a.name.value === "operations")?.value;
      if (!ops || ops.values?.length !== 0) issues.push(`${def.name.value}: must carry @mutation(operations: []) (L2)`);
      for (const field of def.fields ?? []) {
        const rel = (field.directives ?? []).find((x) => x.name.value === "relationship");
        if (!rel) continue;
        const argOf = (n) => rel.arguments?.find((a) => a.name.value === n);
        const type = argOf("type")?.value?.value;
        if (argOf("aggregate")?.value?.value !== false) issues.push(`${def.name.value}.${field.name.value} (${type}): aggregate: false required`);
        if (!argOf("nestedOperations")) issues.push(`${def.name.value}.${field.name.value} (${type}): nestedOperations required`);
        if (!/class:\s*(structural|asserted|derived)/.test(field.description?.value ?? "")) issues.push(`${def.name.value}.${field.name.value} (${type}): docstring must state class`);
      }
    }
    failures += issues.length;
    results.push({ module: f, definitions: d.definitions.length, issues });
  }
  for (const res of results) for (const i of res.issues) console.log(`FAIL: ${res.module}: ${i}`);
  console.log(JSON.stringify({ ok: failures === 0, release: dir, kernel: kernelPath, modules: results.map((res) => ({ module: res.module, definitions: res.definitions, issues: res.issues.length })) }, null, 2));
  process.exit(failures ? 1 : 0);
}

function report() {
  const counts = { nodeTypes: sdlNodes.size, relationshipTypes: sdlRels.size, pairs, questions: questionIds.size, fixtures: fixtures?.length ?? 0, budget };
  for (const w of warn) console.log(`warn: ${w}`);
  for (const p of problems) console.log(`FAIL: ${p}`);
  console.log(JSON.stringify({ ok: problems.length === 0, packet: id, counts }, null, 2));
  process.exit(problems.length ? 1 : 0);
}
