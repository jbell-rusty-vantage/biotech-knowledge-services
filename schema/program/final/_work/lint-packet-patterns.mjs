#!/usr/bin/env node
// Packet pattern linter (close-out round, FU-04): lints every ```cypher block of every packet's 03-retrieval-patterns.md,
// read from the OWNER worktrees (biotech-knowledge-services-A1 … -A8), never from the S copies under schema/program/packets/.
//
// For each block it
//   1. extracts the block with its question heading (## <id>) and fence line;
//   2. runs every statement on the disposable Neo4j 5.26 (bks-neo4j-synth, bolt://localhost:7691) with EXPLAIN:
//      a leading `CYPHER 25` is stripped and flagged; $params get typed sample values (retyped on a planner type mismatch);
//      the packet's documented macros (ASOF, LIVE, VALID, VALIDAT, AS_OF, AS_OF_REC, TRACE, ...) are expanded from the
//      definitions in each packet's Conventions section (table MACROS below); before the packets, the generated DDL
//      (final/_work/patterns-ddl.cypher) and the D-1/D-3/D-4 DDL blocks of final/query-patterns.md are executed so
//      index-backed calls and hints resolve; packet DDL statements are executed (IF NOT EXISTS); `CALL gds.*` /
//      `CALL apoc.*` cannot run on Community and are classified gds-unvalidated (a gds.graph.project(...) source query is
//      EXPLAINed after rewriting the call to a list literal);
//   3. checks every label, relationship type, relationship direction / endpoint pair, node and relationship property,
//      enum literal and Assertion.predicate literal the statement names against
//        (a) the packet world: the packet's own SDL + the K kernel (own) plus the sibling packets' SDLs for seam names,
//            and the packets' 05 registers for predicates;
//        (b) the FINAL assembled schema: final/schema/final_biotech_schema_v2.ir.json (cross-checked against the printed
//            SDL by the self-check below) and the merged final/relationship-register.yaml for predicates.
//      Interface labels (Entity, Subjectable) count as labels; the stored direction comes from @relationship(direction)
//      on the declaring field (IN on X.f: T means (T)-[:R]->(X)).
//   4. classifies each block:
//        ok                 EXPLAIN ok and no finding
//        fragment           an illustrative fragment that cannot run alone (reason given; static findings listed, not counted)
//        gds-unvalidated    the only problem is a GDS/APOC call Community cannot plan
//        packetBug          fails against its own packet SDL + kernel (+ sibling seams): syntax/planner error, CYPHER 25 prefix,
//                           wrong direction, undeclared name/pair/property/enum value, unregistered predicate
//        rulingBroken       valid against the packet, but uses a name / pair / property / predicate a synthesis ruling renamed,
//                           cut or moved, or a ruling's edit-pattern op is not applied (ruling id named when found)
//      A block with packet-level and ruling-level problems is classed packetBug and listed with both (alsoRulingBroken).
//
// Usage (Git Bash; pass C:/ paths):
//   node C:/.../final/_work/lint-packet-patterns.mjs [--packets K,D1,...] [--no-db] [--keep]
//        [--json C:/.../pattern-lint.json] [--md C:/.../pattern-lint.md]
// Defaults: all 14 packets; reports in final/_work/pattern-lint.{json,md}; DDL created by the run is dropped afterwards.
// Env (disposable only): NEO4J_TEST_URI (bolt://localhost:7691), NEO4J_TEST_USERNAME (neo4j), NEO4J_TEST_PASSWORD (bks-test-password),
//      BKS_PACKET_WORKTREE_PREFIX (default <Biotech>/biotech-knowledge-services-).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const finalDir = path.resolve(here, '..');
const worktree = path.resolve(here, '../../../..');
const biotech = path.resolve(worktree, '..');
const reqKg = createRequire(path.join(worktree, 'packages/kg-ops/package.json'));
const reqWs = createRequire(path.join(worktree, 'packages/schema-workspace/package.json'));
const neo4j = reqKg('neo4j-driver');
const { parse: parseGraphql } = reqWs('graphql');
const YAML = reqWs('yaml');

const args = process.argv.slice(2);
const opt = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : undefined;
};
const PACKET_WORKTREE = { K: 'A1', D10: 'A1', D1: 'A2', D12: 'A2', D2: 'A3', D4: 'A3', D3: 'A4', D5: 'A5', D6: 'A6', D7: 'A6', D8: 'A7', D13: 'A7', D9: 'A8', D11: 'A8' };
const ALL_PACKETS = ['K', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13'];
const packets = opt('--packets') ? opt('--packets').split(',') : ALL_PACKETS;
const noDb = args.includes('--no-db');
const keep = args.includes('--keep');
const jsonPath = opt('--json') || path.join(here, 'pattern-lint.json');
const mdPath = opt('--md') || path.join(here, 'pattern-lint.md');
const wtPrefix = process.env.BKS_PACKET_WORKTREE_PREFIX || path.join(biotech, 'biotech-knowledge-services-');
const wtRoot = (id) => `${wtPrefix}${PACKET_WORKTREE[id]}`;
const packetDir = (id) => path.join(wtRoot(id), 'schema/program/packets', id);
const sha256 = (t) => createHash('sha256').update(t).digest('hex');
const rel = (p) => path.relative(worktree, p).split(path.sep).join('/');

// ------------------------------------------------------------------------------------------------ inputs
const input = {};
function readInput(key, p) {
  const t = readFileSync(p, 'utf8');
  input[key] = { path: p.split(path.sep).join('/'), sha256: sha256(t) };
  return t;
}
const irText = readInput('finalIr', path.join(finalDir, 'schema/final_biotech_schema_v2.ir.json'));
const ir = JSON.parse(irText);
const finalSdlText = readInput('finalSdl', path.join(finalDir, 'schema/final_biotech_schema_v2.graphql'));
const mergedRegister = YAML.parse(readInput('mergedRegister', path.join(finalDir, 'relationship-register.yaml')));
const rulingsText = readInput('rulings', path.join(here, 'rulings.yaml'));
const rulings = YAML.parse(rulingsText);
const decisionReport = readInput('decisionReport', path.join(finalDir, 'decision-report.md'));
const queryPatternsDoc = readInput('queryPatterns', path.join(finalDir, 'query-patterns.md'));
const patternsDdl = readInput('patternsDdl', path.join(here, 'patterns-ddl.cypher'));

const pk = {};
for (const id of ALL_PACKETS) {
  const dir = packetDir(id);
  let head = null;
  try {
    head = execFileSync('git', ['-C', wtRoot(id), 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    head = null;
  }
  const sdl = readFileSync(path.join(dir, '04-schema-proposal.graphql'), 'utf8');
  const patterns = readFileSync(path.join(dir, '03-retrieval-patterns.md'), 'utf8');
  let register = null;
  let registerError = null;
  try {
    register = YAML.parse(readFileSync(path.join(dir, '05-relationship-register.yaml'), 'utf8'));
  } catch (e) {
    registerError = e.message.split('\n')[0];
  }
  pk[id] = { id, worktree: wtRoot(id).split(path.sep).join('/'), head, dir, sdl, patterns, register, registerError,
    sha: { sdl: sha256(sdl), patterns: sha256(patterns) } };
}

// ------------------------------------------------------------------------------------------------ schema models
// model = { name, nodeTypes: Map(type -> {labels:Set, props:Map(name -> {namedType,isList}), relFields:Set, computed:Set, module}),
//           interfaces: Map(name -> Set(impl)), unions: Map(name -> [members]), labelTypes: Map(label -> Set(type)),
//           relTypes: Map(type -> {triples: Map('A>B' -> via), propTypes:Set, modules:Set}), relPropTypes: Map(name -> Map(prop -> {...})),
//           enums: Map(name -> Set(values)), typeModule: Map(name -> module) }
function namedTypeOf(t) {
  while (t.kind !== 'NamedType') t = t.type;
  return t.name.value;
}
function isListType(t) {
  while (t.kind === 'NonNullType') t = t.type;
  return t.kind === 'ListType';
}
function gqlValue(v) {
  switch (v.kind) {
    case 'StringValue':
    case 'EnumValue':
      return v.value;
    case 'ListValue':
      return v.values.map(gqlValue);
    case 'BooleanValue':
      return v.value;
    case 'IntValue':
    case 'FloatValue':
      return Number(v.value);
    case 'ObjectValue':
      return Object.fromEntries(v.fields.map((f) => [f.name.value, gqlValue(f.value)]));
    default:
      return null;
  }
}
const dirArgs = (d) => Object.fromEntries((d.arguments || []).map((a) => [a.name.value, gqlValue(a.value)]));

function buildSdlModel(name, sources) {
  const objects = new Map();
  const ifaces = new Map();
  const unions = new Map();
  const enums = new Map();
  const typeModule = new Map();
  const errors = [];
  const addFields = (o, fields, module) => {
    for (const f of fields || []) {
      const fd = { name: f.name.value, namedType: namedTypeOf(f.type), isList: isListType(f.type), rel: null, computed: false, storedName: f.name.value, module };
      for (const d of f.directives || []) {
        const a = dirArgs(d);
        if (d.name.value === 'relationship') fd.rel = { type: a.type, direction: a.direction, properties: a.properties || null };
        if (d.name.value === 'cypher' || d.name.value === 'customResolver') fd.computed = true;
        if (d.name.value === 'alias' && a.property) fd.storedName = a.property;
      }
      if (!o.fields.has(fd.name)) o.fields.set(fd.name, fd);
    }
  };
  for (const { module, text } of sources) {
    let doc;
    try {
      doc = parseGraphql(text, { noLocation: true });
    } catch (e) {
      errors.push(`${module}: ${e.message}`);
      continue;
    }
    for (const d of doc.definitions) {
      const n = d.name?.value;
      if (n && !typeModule.has(n)) typeModule.set(n, module);
      if (d.kind === 'ObjectTypeDefinition' || d.kind === 'ObjectTypeExtension') {
        if (['Query', 'Mutation', 'Subscription'].includes(n)) continue;
        const o = objects.get(n) || { name: n, labels: new Set(), interfaces: new Set(), fields: new Map(), relProps: false, module };
        for (const dir of d.directives || []) {
          if (dir.name.value === 'relationshipProperties') o.relProps = true;
          if (dir.name.value === 'node') {
            const a = dirArgs(dir);
            if (Array.isArray(a.labels)) a.labels.forEach((l) => o.labels.add(l));
          }
        }
        for (const i of d.interfaces || []) o.interfaces.add(i.name.value);
        addFields(o, d.fields, module);
        objects.set(n, o);
      } else if (d.kind === 'InterfaceTypeDefinition' || d.kind === 'InterfaceTypeExtension') {
        const o = ifaces.get(n) || { name: n, fields: new Map(), module };
        addFields(o, d.fields, module);
        ifaces.set(n, o);
      } else if (d.kind === 'UnionTypeDefinition' || d.kind === 'UnionTypeExtension') {
        const u = unions.get(n) || [];
        for (const t of d.types || []) if (!u.includes(t.name.value)) u.push(t.name.value);
        unions.set(n, u);
      } else if (d.kind === 'EnumTypeDefinition' || d.kind === 'EnumTypeExtension') {
        const e = enums.get(n) || new Set();
        for (const v of d.values || []) e.add(v.name.value);
        enums.set(n, e);
      }
    }
  }
  const m = { name, nodeTypes: new Map(), interfaces: new Map(), unions, labelTypes: new Map(), relTypes: new Map(), relPropTypes: new Map(), enums, typeModule, errors };
  for (const o of objects.values()) {
    if (o.relProps) {
      const props = new Map();
      for (const f of o.fields.values()) props.set(f.storedName, { namedType: f.namedType, isList: f.isList });
      m.relPropTypes.set(o.name, props);
      continue;
    }
    const nt = { labels: o.labels.size ? new Set(o.labels) : new Set([o.name]), props: new Map(), relFields: new Set(), computed: new Set(), module: o.module, interfaces: o.interfaces };
    m.nodeTypes.set(o.name, nt);
  }
  for (const [iname] of ifaces) m.interfaces.set(iname, new Set());
  for (const [tname, nt] of m.nodeTypes) for (const i of nt.interfaces) if (m.interfaces.has(i)) m.interfaces.get(i).add(tname);
  const expand = (x, seen = new Set()) => {
    if (seen.has(x)) return [];
    seen.add(x);
    if (m.nodeTypes.has(x)) return [x];
    if (m.interfaces.has(x)) return [...m.interfaces.get(x)];
    if (m.unions.has(x)) return m.unions.get(x).flatMap((y) => expand(y, seen));
    return [x];
  };
  const addField = (tname, f) => {
    const nt = m.nodeTypes.get(tname);
    if (f.rel) {
      nt.relFields.add(f.name);
      const rt = m.relTypes.get(f.rel.type) || { triples: new Map(), propTypes: new Set(), modules: new Set() };
      if (f.rel.properties) rt.propTypes.add(f.rel.properties);
      rt.modules.add(f.module);
      for (const tgt of expand(f.namedType)) {
        const key = f.rel.direction === 'IN' ? `${tgt}>${tname}` : `${tname}>${tgt}`;
        if (!rt.triples.has(key)) rt.triples.set(key, `${tname}.${f.name} (${f.rel.direction})`);
      }
      m.relTypes.set(f.rel.type, rt);
    } else if (f.computed) nt.computed.add(f.name);
    else nt.props.set(f.storedName, { namedType: f.namedType, isList: f.isList });
  };
  for (const o of objects.values()) if (!o.relProps) for (const f of o.fields.values()) addField(o.name, f);
  for (const [iname, io] of ifaces) for (const impl of m.interfaces.get(iname)) for (const f of io.fields.values()) {
    const nt = m.nodeTypes.get(impl);
    if (!nt.props.has(f.storedName) && !nt.relFields.has(f.name)) addField(impl, f);
  }
  finishLabels(m);
  return m;
}
function finishLabels(m) {
  for (const [tname, nt] of m.nodeTypes) for (const l of nt.labels) {
    if (!m.labelTypes.has(l)) m.labelTypes.set(l, new Set());
    m.labelTypes.get(l).add(tname);
  }
  for (const [iname, impls] of m.interfaces) {
    if (!m.labelTypes.has(iname)) m.labelTypes.set(iname, new Set());
    for (const t of impls) m.labelTypes.get(iname).add(t);
  }
}
function buildIrModel(irj) {
  const m = { name: 'final', nodeTypes: new Map(), interfaces: new Map(), unions: new Map(), labelTypes: new Map(), relTypes: new Map(), relPropTypes: new Map(), enums: new Map(), typeModule: new Map(), errors: [] };
  for (const n of irj.nodes) {
    m.typeModule.set(n.name, n.fragment);
    m.nodeTypes.set(n.name, {
      labels: new Set(n.labels?.length ? n.labels : [n.name]),
      props: new Map(n.properties.map((p) => [p.storedName || p.name, { namedType: p.namedType, isList: p.isList }])),
      relFields: new Set((n.relationships || []).map((r) => r.fieldName)),
      computed: new Set(),
      module: n.fragment,
      interfaces: new Set(n.interfaces || []),
    });
  }
  for (const i of irj.interfaces) {
    m.typeModule.set(i.name, i.fragment);
    m.interfaces.set(i.name, new Set(i.implementers || []));
  }
  for (const u of irj.unions) {
    m.typeModule.set(u.name, u.fragment);
    m.unions.set(u.name, u.members || []);
  }
  for (const e of irj.enums) {
    m.typeModule.set(e.name, e.fragment);
    m.enums.set(e.name, new Set(e.values.map((v) => v.name)));
  }
  for (const ep of irj.edgePropertyTypes) {
    m.typeModule.set(ep.name, ep.fragment);
    m.relPropTypes.set(ep.name, new Map(ep.properties.map((p) => [p.storedName || p.name, { namedType: p.namedType, isList: p.isList }])));
  }
  const expand = (x) => (m.nodeTypes.has(x) ? [x] : m.interfaces.has(x) ? [...m.interfaces.get(x)] : m.unions.has(x) ? m.unions.get(x).flatMap(expand) : [x]);
  for (const r of irj.relationshipTypes) {
    const rt = { triples: new Map(), propTypes: new Set(r.propertiesTypes || []), modules: new Set(r.fragments || []) };
    for (const t of r.triples) for (const a of expand(t.from)) for (const b of expand(t.to)) {
      const via = (t.via || []).map((v) => `${v.node}.${v.field} (${v.direction})`).join(', ');
      rt.triples.set(`${a}>${b}`, via);
    }
    m.relTypes.set(r.type, rt);
  }
  finishLabels(m);
  return m;
}

const finalModel = buildIrModel(ir);
const finalSdlModel = buildSdlModel('final-sdl', [{ module: 'final', text: finalSdlText }]);
const worldModel = buildSdlModel('packet-world', ALL_PACKETS.map((id) => ({ module: id, text: pk[id].sdl })));
const ownModels = Object.fromEntries(ALL_PACKETS.map((id) => [id, buildSdlModel(`own-${id}`, id === 'K' ? [{ module: 'K', text: pk.K.sdl }] : [{ module: id, text: pk[id].sdl }, { module: 'K', text: pk.K.sdl }])]));

// labels a packet SDL documents as stored extra labels in a type docstring ("stored extra label `ClaimOccurrence`" on
// Assertion): valid for the packet world (mapped to that type), so a final-level failure is ruling-broken, not a packet bug
const documentedLabels = [];
for (const id of ALL_PACKETS) {
  const text = pk[id].sdl;
  for (const m of text.matchAll(/stored (?:extra )?label `?([A-Z][A-Za-z]+)`?/g)) {
    const before = text.slice(0, m.index);
    if ((before.match(/"""/g) || []).length % 2 === 0) continue; // only inside a """ docstring
    const next = text.slice(m.index).match(/^type\s+(\w+)/m);
    if (!next || worldModel.labelTypes.has(m[1])) continue;
    worldModel.labelTypes.set(m[1], new Set([next[1]]));
    documentedLabels.push({ label: m[1], type: next[1], packet: id, line: before.split('\n').length });
  }
}

// self-check: the SDL reader on the printed final SDL must reproduce the IR's labels, triples and properties
function selfCheck() {
  const diffs = [];
  for (const [l, ts] of finalModel.labelTypes) {
    const o = finalSdlModel.labelTypes.get(l);
    if (!o || [...ts].some((t) => !o.has(t)) || o.size !== ts.size) diffs.push(`label ${l}`);
  }
  for (const [t, rt] of finalModel.relTypes) {
    const o = finalSdlModel.relTypes.get(t);
    if (!o) {
      diffs.push(`relType ${t} missing in SDL read`);
      continue;
    }
    for (const k of rt.triples.keys()) if (!o.triples.has(k)) diffs.push(`triple ${t} ${k} missing in SDL read`);
    for (const k of o.triples.keys()) if (!rt.triples.has(k)) diffs.push(`triple ${t} ${k} extra in SDL read`);
  }
  for (const [t, nt] of finalModel.nodeTypes) {
    const o = finalSdlModel.nodeTypes.get(t);
    if (!o) {
      diffs.push(`node ${t} missing in SDL read`);
      continue;
    }
    for (const p of nt.props.keys()) if (!o.props.has(p)) diffs.push(`prop ${t}.${p} missing in SDL read`);
    for (const p of o.props.keys()) if (!nt.props.has(p)) diffs.push(`prop ${t}.${p} extra in SDL read`);
  }
  return {
    irNodeTypes: finalModel.nodeTypes.size, irRelationshipTypes: finalModel.relTypes.size, sdlNodeTypes: finalSdlModel.nodeTypes.size,
    sdlRelationshipTypes: finalSdlModel.relTypes.size, sdlParseErrors: finalSdlModel.errors, worldParseErrors: worldModel.errors,
    worldNodeTypes: worldModel.nodeTypes.size, worldRelationshipTypes: worldModel.relTypes.size, diffs: diffs.length, sample: diffs.slice(0, 15),
  };
}
const selfCheckResult = selfCheck();

// ------------------------------------------------------------------------------------------------ predicate registries
const SNAKE = /^[A-Z][A-Z0-9_]*[A-Z0-9]$/;
function collectPredicates(node, out, parentKey = '') {
  if (Array.isArray(node)) {
    for (const x of node) collectPredicates(x, out, parentKey);
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (/^(predicate|predicates|authorizingPredicate|authorizingPredicates|alsoFamily|fieldPredicates)$/.test(k) || (k === 'type' && parentKey === 'relationships')) {
        const vals = Array.isArray(v) ? v : [v];
        for (const x of vals) {
          if (typeof x === 'string') for (const tok of x.split(/[\s/|,()]+/)) if (SNAKE.test(tok)) out.add(tok);
          else if (x && typeof x === 'object') collectPredicates(x, out, k);
        }
      } else collectPredicates(v, out, k);
    }
  }
}
const packetPredicates = new Set();
for (const id of ALL_PACKETS) if (pk[id].register) collectPredicates(pk[id].register, packetPredicates);
const finalPredicates = new Set();
for (const sec of ['relationships', 'predicateOnly', 'authorizingPredicates', 'registeredElsewhere']) collectPredicates({ [sec]: mergedRegister[sec] || [] }, finalPredicates);
for (const r of mergedRegister.relationships || []) if (r.type) finalPredicates.add(r.type);
// retired spellings: predicate -> { ruling, now }
const retiredPredicates = new Map();
for (const r of mergedRegister.removedPredicates || []) for (const p of String(r.predicate).split(/[\s|]+/).filter((t) => SNAKE.test(t))) retiredPredicates.set(p, { ruling: String(r.ruling), now: r.now });
for (const r of mergedRegister.mergedInto || []) if (r.into && r.into !== r.predicate) retiredPredicates.set(r.predicate, { ruling: r.ruling, now: r.into });
for (const [canon, v] of Object.entries(rulings.global?.names?.predicates || {})) for (const a of v.aliases || []) {
  const tok = String(a).split(/\s+/)[0];
  if (SNAKE.test(tok) && tok !== canon) retiredPredicates.set(tok, { ruling: v.ruling, now: canon });
}
for (const [mod, edits] of Object.entries(rulings.modules || {})) for (const e of edits || []) if (e.op === 'rename-predicate') retiredPredicates.set(e.from, { ruling: e.ruling, now: e.to, module: mod });
// the R-52 registry, when written (final/vocabularies/predicates.yaml), replaces the merged register as the final predicate list
let finalPredicateSource = 'the merged final register';
const proposedPredicates = new Set();
const registryPath = path.join(finalDir, 'vocabularies/predicates.yaml');
if (existsSync(registryPath)) {
  const reg = YAML.parse(readInput('predicateRegistry', registryPath));
  finalPredicates.clear();
  for (const e of reg.predicates || []) {
    const st = String(e.status || '');
    if (st === 'registered') finalPredicates.add(e.predicate);
    else if (st === 'proposed-new') {
      finalPredicates.add(e.predicate);
      proposedPredicates.add(e.predicate);
    } else if (st.startsWith('alias-of:') || st.startsWith('retired-by:')) {
      const now = st.startsWith('alias-of:') ? st.slice('alias-of:'.length) : (e.replacedBy || []).join(' | ') || 'none';
      const ruling = st.startsWith('retired-by:') ? st.slice('retired-by:'.length) : e.sources?.rulings?.[0] || retiredPredicates.get(e.predicate)?.ruling || 'R-52';
      retiredPredicates.set(e.predicate, { ruling, now, status: st });
    }
  }
  finalPredicateSource = 'final/vocabularies/predicates.yaml';
}
const ruleNotes = mergedRegister.ruleNotes || [];

// ------------------------------------------------------------------------------------------------ ruling index (attribution)
const rulingEdits = [];
for (const r of rulings.global?.rules || []) rulingEdits.push({ ruling: r.ruling, module: 'global', text: JSON.stringify(r) });
for (const [k, v] of Object.entries(rulings.global?.names || {})) for (const [n, d] of Object.entries(v || {})) rulingEdits.push({ ruling: d?.ruling || null, module: 'global', text: `${n} ${JSON.stringify(d)}` });
for (const [mod, edits] of Object.entries(rulings.modules || {})) for (const e of edits || []) rulingEdits.push({ ruling: e.ruling, module: mod, text: JSON.stringify(e), edit: e });
const drSections = [];
{
  const lines = decisionReport.split(/\r?\n/);
  let cur = null;
  for (const l of lines) {
    const m = l.match(/^#### ((?:R|I|F)-\d+)\s*·?\s*(.*)$/);
    if (m) {
      cur = { id: m[1], title: m[2], text: '' };
      drSections.push(cur);
    } else if (/^##+ /.test(l)) cur = null;
    else if (cur) cur.text += l + '\n';
  }
}
const wordRe = (w) => new RegExp(`(^|[^A-Za-z0-9_])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9_]|$)`);
function attributeRuling(names, packet, question, pairType = null, strict = false) {
  const [primary, ...rest] = names.filter(Boolean);
  if (!primary) return [];
  const pre = wordRe(primary);
  const pairRe = pairType ? new RegExp(`${pairType}[^\\n]{0,40}?(?:→|->)\\s*(?:D\\d+\\.)?(?:${rest.join('|') || '_none_'})\\b`) : null;
  const scores = new Map();
  const strong = new Set();
  const bump = (id, s, isStrong) => {
    if (!id) return;
    scores.set(id, (scores.get(id) || 0) + s);
    if (isStrong) strong.add(id);
  };
  for (const e of rulingEdits) {
    if (!e.ruling || !pre.test(e.text)) continue;
    let s = 4;
    for (const n of rest) if (wordRe(n).test(e.text)) s += 2;
    if (question && e.text.includes(question)) s += 3;
    if (e.module === packet) s += 2;
    if (pairRe && pairRe.test(e.text)) s += 6;
    bump(e.ruling, s, (question && e.text.includes(question)) || (pairRe && pairRe.test(e.text)) || (!pairType && e.module === packet));
  }
  for (const sec of drSections) {
    const hits = (sec.text.match(new RegExp(pre.source, 'g')) || []).length + (pre.test(sec.title) ? 2 : 0);
    if (!hits) continue;
    let s = 2 + Math.min(hits, 3);
    if (question && sec.text.includes(question)) s += 3;
    if (packet && new RegExp(`\\b${packet}\\b`).test(sec.text)) s += 1;
    for (const n of rest) if (wordRe(n).test(sec.text)) s += 2;
    if (pairRe && pairRe.test(sec.text)) s += 6;
    bump(sec.id, s, (question && sec.text.includes(question)) || (pairRe && pairRe.test(sec.text)));
  }
  if (!scores.size && rest.length && !strict) return attributeRuling(rest, packet, question);
  return [...scores.entries()].filter(([id]) => !strict || strong.has(id)).sort((a, b) => b[1] - a[1]).slice(0, 2).filter(([, s], i, arr) => i === 0 || s >= arr[0][1] - 1).map(([id]) => id);
}

// ------------------------------------------------------------------------------------------------ ruling edit-pattern ops
// Each edit-pattern op of _work/rulings.yaml (and the FU-04 rows that have no op) with a textual test of whether the
// owner's section still shows the pre-ruling form. `notApplied(sectionText)` true => the block is ruling-broken.
const PENDING = [
  { ruling: 'R-09', packet: 'K', questions: ['CQ-AX-04'], notApplied: (t) => /EMPTY_RESULT/.test(t), why: 'section still reads CaptureAttempt outcome EMPTY_RESULT' },
  { ruling: 'R-15', packet: 'K', questions: ['Q-K-15'], notApplied: (t) => !/AUTHORED_BY/.test(t) || !/HOLDS_ROLE/.test(t), why: 'no AUTHORED_BY -> Person -> D7 interest branch (and no HOLDS_ROLE)' },
  { ruling: 'R-15', packet: 'K', questions: ['Q-K-23'], notApplied: (t) => !/AUTHORED_BY/.test(t), why: 'no AUTHORED_BY branch' },
  { ruling: 'R-19', packet: 'K', questions: ['Q-K-09'], notApplied: null, why: 'no textual marker distinguishes the applied form' },
  { ruling: 'R-43', packet: 'K', questions: ['Q-K-21'], notApplied: (t) => !/Publication/.test(t), why: 'family step does not reach a D3 Publication through RENDITION_OF' },
  { ruling: 'R-44', packet: 'K', questions: ['Q-K-10', 'Q-K-17', 'Q-K-22'], notApplied: (t) => !/REVISES/.test(t), why: 'no Source -RENDITION_OF-> Publication <-REVISES- notice branch' },
  { ruling: 'R-47', packet: 'D2', questions: ['Q-D2-18'], notApplied: (t) => /AFFECTS_MECHANISM/.test(t) && !/Association/.test(t), why: 'still ranks the AFFECTS_MECHANISM edge, not a D10 Association' },
  { ruling: 'R-89', packet: 'D2', questions: ['Q-D2-21'], notApplied: (t) => /HOLDS_EQUITY_IN|CONSULTS_FOR|INVENTOR_OF_PATENT_LICENSED_TO/.test(t) || !/HOLDS_STAKE/.test(t), why: 'reads HOLDS_EQUITY_IN / CONSULTS_FOR / INVENTOR_OF_PATENT_LICENSED_TO instead of D7 HOLDS_STAKE|HOLDS_ROLE|RECEIVES_VALUE_FROM' },
  { ruling: 'R-94', packet: 'D4', questions: ['Q-D4-10'], notApplied: (t) => /RegulatoryStatus/.test(t), why: "still names 'RegulatoryStatus'" },
  { ruling: 'R-19', packet: 'D7', questions: ['CQ-CL-05', 'Q-D7-06'], notApplied: (t) => !/OCCURS_IN/.test(t), why: 'statement time T not read from OCCURS_IN MediaWork.publishedAt' },
  { ruling: 'R-72', packet: 'D8', questions: ['Q-D8-23'], notApplied: (t) => /STATUS_OF/.test(t) && !/DELIVERS/.test(t), why: 'reads LegalStatus STATUS_OF Device directly (R-72: via Product -DELIVERS-> Device)' },
  { ruling: 'R-83', packet: 'D10', questions: ['Q-D10-08', 'Q-D10-03'], notApplied: (t) => /RECOMMENDS_AGAINST/.test(t), why: 'guideline branch still reads RECOMMENDS_AGAINST (R-83: WORSENS_TARGET | NO_EFFECT_ON_TARGET with speechAct CAUTIONS | RECOMMENDS; no RECOMMENDS_AGAINST -> Target)' },
  { ruling: 'R-93', packet: 'D12', questions: ['Q-D12-06', 'Q-D12-18'], notApplied: (t) => /unregistered: D8 has no/.test(t) || !/HAS_ACTION_LEVEL|HAS_CLAIM_CONDITION/.test(t), why: "still marks HAS_ACTION_LEVEL / HAS_CLAIM_CONDITION 'unregistered: D8 has no ... predicate yet'" },
  { ruling: 'R-51', packet: 'D12', questions: ['Q-D12-14'], notApplied: (t) => !/basisKind/.test(t) || !/derivationRule/.test(t), why: 'does not return basisKind and derivationRule' },
  { ruling: 'R-21', packet: 'D13', questions: ['Q-D13-22'], notApplied: (t) => !/DERIVED_FROM/.test(t), why: 'origins not counted by collapsing DERIVED_FROM chains' },
  // FU-04 rows without an edit-pattern op in rulings.yaml
  { ruling: 'R-42', packet: 'D3', questions: ['CQ-EV-05'], fu04: true, notApplied: (t) => /HAS_IDENTIFIER\]->\([^)]*\)<-\[:HAS_IDENTIFIER/.test(t), why: 'joins a Publication and a Source through one shared Identifier (R-42: no cross-type joins through a shared Identifier)' },
  { ruling: 'R-42', packet: 'D11', questions: ['CQ-PV-05'], fu04: true, notApplied: (t) => /share an identifier/i.test(t) && /<-\[:HAS_IDENTIFIER\]-\(\w*:Source\)/.test(t), why: 'two Sources renditions of one record share an Identifier (R-42: one (scheme, issuer, value) identifies at most one Subjectable)' },
  { ruling: 'R-30', packet: 'D6', questions: ['Q-D6-01'], fu04: true, notApplied: (t) => /declaredNameVerbatim/.test(t), why: 'reads the removed DECLARES_COMPONENT property declaredNameVerbatim' },
  { ruling: 'R-94', packet: 'D10', questions: [], line: 744, fu04: true, notApplied: (t) => /D9 Episode\/Publication|D9 Episode\b/.test(t), why: "trace names 'D9 Episode/Publication' (R-94: take the container from OCCURS_IN)" },
  { ruling: 'R-94', packet: 'D13', questions: [], line: 188, fu04: true, notApplied: (t) => /DocumentTextVersion|\bEpisode\b/.test(t), why: 'names DocumentTextVersion / Episode' },
  { ruling: 'R-95', packet: 'D12', questions: ['Q-D12-03', 'Q-D12-06'], fu04: true, notApplied: (t) => /-\[\w*:RESULT_FOR\]->\(\w*:Product\)/.test(t), why: '(QualityResult)-[:RESULT_FOR]->(Product): RESULT_FOR is QUALITY_RESULT_FOR (R-53) and the Product pair was cut (R-73, R-95)' },
];
// sanity: every edit-pattern op of rulings.yaml is covered by PENDING
const editPatternOps = [];
for (const [mod, edits] of Object.entries(rulings.modules || {})) for (const e of edits || []) if (e.op === 'edit-pattern') {
  const qs = e.questions || (e.question ? [e.question] : []);
  editPatternOps.push({ module: mod, ruling: e.ruling, questions: qs, change: e.change, covered: qs.every((q) => PENDING.some((p) => p.ruling === e.ruling && p.questions.includes(q))) });
}

// ------------------------------------------------------------------------------------------------ macros (packet Conventions)
const recAt = (a, p) => `(${a}.recordedFrom <= ${p} AND (${a}.recordedTo IS NULL OR ${a}.recordedTo > ${p}))`;
const recAtNode = (a, p) => `(${a}.recordedAt <= ${p} AND (${a}.recordedTo IS NULL OR ${a}.recordedTo > ${p}))`;
const validAt = (a, p) => `((${a}.validFrom IS NULL OR ${a}.validFrom <= ${p}) AND (${a}.validTo IS NULL OR ${a}.validTo > ${p}))`;
// value macros (a provenance subquery) become a null whose text is unique per call, so two TRACE(x) columns keep distinct names
const traceStub = (a) => `head([null, 'TRACE_${String(a).replace(/[^\w]/g, '_')}'])`;
const MACROS = {
  // D3 03 "Conventions used below" lines 8-11
  D3: { ASOF: (a) => recAt(a, '$recAt'), VALID: (a) => validAt(a, '$validAt'), LIVE: (a) => `(${a}.status = 'ACCEPTED' AND ${recAtNode(a, '$recAt')})`, TRACE: traceStub },
  // D10 03 conventions lines 7-19
  D10: { ASOF: (a) => recAtNode(a, '$asOf'), VALIDAT: (a) => `($validAt IS NULL OR ${validAt(a, '$validAt')})`, TRACE: traceStub, STRACE: traceStub },
  // D12 03 "Conventions used in every pattern" lines 9-33 (AS_OF on an Assertion reads recordedAt)
  D12: {
    AS_OF: (a, ctx) => `(${ctx.isRel(a) ? recAt(a, '$asOf') : recAtNode(a, '$asOf')} AND ($validAt IS NULL OR ${validAt(a, '$validAt')}))`,
    AS_OF_REC: (a) => recAt(a, '$asOf'),
    TRACE: traceStub,
  },
  // D8 03 conventions lines 11-20
  D8: { AS_OF: (a) => `((${a}.validFrom IS NULL OR ${a}.validFrom <= $V) AND (${a}.validTo IS NULL OR $V < ${a}.validTo) AND ${a}.recordedFrom <= $R AND (${a}.recordedTo IS NULL OR $R < ${a}.recordedTo))`, KNOWN_AT: (a) => `(${a}.recordedFrom <= $R AND (${a}.recordedTo IS NULL OR $R < ${a}.recordedTo))`, TRACE: traceStub },
  D7: { OVERLAP: () => "'UNKNOWN'", TRACE: traceStub },
  D9: { OVERLAP: () => "'UNKNOWN'", TRACE: traceStub },
};

// ------------------------------------------------------------------------------------------------ Cypher lexing
// lex: strips comments (positions and newlines preserved), masks string literals as '@@<i>' and returns the table.
function lex(text) {
  let out = '';
  const strings = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    const n = text[i + 1];
    if (c === '/' && n === '/') {
      while (i < text.length && text[i] !== '\n') {
        out += ' ';
        i++;
      }
    } else if (c === '/' && n === '*') {
      const e = text.indexOf('*/', i + 2);
      const end = e < 0 ? text.length : e + 2;
      out += text.slice(i, end).replace(/[^\n]/g, ' ');
      i = end;
    } else if (c === "'" || c === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== c) j += text[j] === '\\' ? 2 : 1;
      const lit = text.slice(i, j + 1);
      strings.push(lit);
      out += `'@@${strings.length - 1}'`;
      i = j + 1;
    } else if (c === '`') {
      const j = text.indexOf('`', i + 1);
      const id = text.slice(i + 1, j < 0 ? text.length : j);
      out += /^[A-Za-z_]\w*$/.test(id) ? id : `__bt${strings.push('`' + id + '`') - 1}`;
      i = j < 0 ? text.length : j + 1;
    } else {
      out += c;
      i++;
    }
  }
  return { masked: out, strings };
}
const unmask = (s, strings) => s.replace(/'@@(\d+)'/g, (_, i) => strings[+i]).replace(/__bt(\d+)/g, (_, i) => strings[+i]);
const strVal = (tok, strings) => {
  const m = tok.match(/^'@@(\d+)'$/);
  return m ? strings[+m[1]].slice(1, -1) : null;
};
function findClose(s, i, open, close) {
  let d = 0;
  for (let k = i; k < s.length; k++) {
    if (s[k] === open) d++;
    else if (s[k] === close && --d === 0) return k;
  }
  return -1;
}
function findOpen(s, i, open, close) {
  let d = 0;
  for (let k = i; k >= 0; k--) {
    if (s[k] === close) d++;
    else if (s[k] === open && --d === 0) return k;
  }
  return -1;
}
function parseLabelExpr(le) {
  // operators only between names: `A|B`, `A:B`, `A&B`, `!A`; `A OR x:B` is a boolean expression, not a label expression
  if (!/^\s*\(?\s*!?[A-Za-z_]\w*\s*(?:[|&:]\s*\(?\s*!?[A-Za-z_]\w*\s*\)?\s*)*\)?\s*$/.test(le)) return null;
  const s = le.replace(/\s+/g, '');
  const toks = s.replace(/[()]/g, '').split(/[|&:]/);
  const any = s.includes('|');
  return { mode: any ? 'any' : 'all', list: toks.filter((t) => !t.startsWith('!')), negated: toks.filter((t) => t.startsWith('!')).map((t) => t.slice(1)) };
}
function parseNodeContent(c) {
  let s = c.trim();
  const r = { var: null, labels: null, map: null, mapOffset: -1, dynamic: false };
  let m = s.match(/^([A-Za-z_]\w*)/);
  if (m && !/^WHERE$/i.test(m[1])) {
    r.var = m[1];
    s = s.slice(m[0].length);
  }
  let ws = s.length - s.trimStart().length;
  s = s.trimStart();
  if (s.startsWith(':')) {
    let end = s.length;
    const b = s.indexOf('{');
    const w = s.search(/\sWHERE\b/i);
    if (b >= 0) end = Math.min(end, b);
    if (w >= 0) end = Math.min(end, w);
    const le = s.slice(1, end).trim();
    if (le.startsWith('$')) r.dynamic = true;
    else {
      r.labels = parseLabelExpr(le);
      if (!r.labels) return null;
    }
    s = s.slice(end).trimStart();
  }
  if (s.startsWith('{')) {
    const e = findClose(s, 0, '{', '}');
    if (e < 0) return null;
    r.map = s.slice(1, e);
    r.mapOffset = c.indexOf(s) + 1;
    s = s.slice(e + 1).trim();
  } else if (s.startsWith('$')) s = s.replace(/^\$\w+/, '').trim();
  if (s && !/^WHERE\b/i.test(s)) return null;
  return r;
}
function parseRelContent(c) {
  let s = c.trim();
  const r = { var: null, types: null, varLen: false, map: null, mapOffset: -1 };
  let m = s.match(/^([A-Za-z_]\w*)/);
  if (m && !/^WHERE$/i.test(m[1])) {
    r.var = m[1];
    s = s.slice(m[0].length).trimStart();
  }
  if (s.startsWith(':')) {
    const m2 = s.match(/^:\s*(!?[A-Za-z_]\w*(?:\s*[|:&]\s*!?[A-Za-z_]\w*)*)/);
    if (!m2) return null;
    r.types = m2[1].replace(/\s+/g, '').split(/[|:&]/).map((t) => t.replace(/^!/, ''));
    s = s.slice(m2[0].length).trimStart();
  }
  if (s.startsWith('*')) {
    r.varLen = true;
    s = s.replace(/^\*\s*\d*\s*(?:\.\.\s*\d*)?/, '').trimStart();
  }
  if (s.startsWith('{')) {
    const e = findClose(s, 0, '{', '}');
    if (e < 0) return null;
    r.map = s.slice(1, e);
    r.mapOffset = c.indexOf(s) + 1;
    s = s.slice(e + 1).trim();
  }
  if (s && !/^WHERE\b/i.test(s)) return null;
  return r;
}
function mapEntries(map) {
  const out = [];
  let depth = 0;
  let start = 0;
  const parts = [];
  for (let i = 0; i <= map.length; i++) {
    const ch = map[i];
    if (ch === '{' || ch === '[' || ch === '(') depth++;
    else if (ch === '}' || ch === ']' || ch === ')') depth--;
    if ((ch === ',' && depth === 0) || i === map.length) {
      parts.push([map.slice(start, i), start]);
      start = i + 1;
    }
  }
  for (const [p, off] of parts) {
    const m = p.match(/^\s*([A-Za-z_]\w*)\s*:\s*([\s\S]*?)\s*$/);
    if (m) out.push({ key: m[1], value: m[2], offset: off + p.indexOf(m[1]) });
  }
  return out;
}

// analyze one statement (masked text): nodes, relationships, bindings, property reads, literal comparisons
function analyze(s) {
  const nodes = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '(' || /[\w.$]/.test(s[i - 1] || '')) continue;
    const e = findClose(s, i, '(', ')');
    if (e < 0) continue;
    const p = parseNodeContent(s.slice(i + 1, e));
    if (p) nodes.push({ ...p, start: i, end: e });
  }
  const byEnd = new Map(nodes.map((n) => [n.end, n]));
  const byStart = new Map(nodes.map((n) => [n.start, n]));
  const rels = [];
  for (const m of s.matchAll(/(<)?-\[([^\[\]]*)\]-(>)?/g)) {
    const p = parseRelContent(m[2]);
    if (!p) continue;
    let k = m.index - 1;
    while (k >= 0 && /\s/.test(s[k])) k--;
    const left = s[k] === ')' ? byEnd.get(k) || { opaque: true } : null;
    let j = m.index + m[0].length;
    while (j < s.length && /\s/.test(s[j])) j++;
    const q = s.slice(j).match(/^(\{\s*\d*\s*,?\s*\d*\s*\}|\+|\*)/);
    if (q) {
      j += q[0].length;
      while (j < s.length && /\s/.test(s[j])) j++;
    }
    const right = s[j] === '(' ? byStart.get(j) || { opaque: true } : null;
    const dir = m[1] && !m[3] ? 'in' : m[3] && !m[1] ? 'out' : 'both';
    rels.push({ ...p, dir, left, right, start: m.index, contentStart: m.index + m[0].indexOf('[') + 1 });
  }
  // spans of node/rel patterns (for label-predicate and map-projection scans)
  let spans = s.split('');
  const blank = (a, b) => {
    for (let i = a; i <= b && i < spans.length; i++) if (spans[i] !== '\n') spans[i] = ' ';
  };
  for (const n of nodes) if (n.labels || n.map || n.dynamic) blank(n.start, n.end);
  for (const m of s.matchAll(/(<)?-\[([^\[\]]*)\]-(>)?/g)) blank(m.index, m.index + m[0].length - 1);
  spans = spans.join('');
  // bindings, scoped by UNION branch (a variable bound in one branch is unknown in another)
  const unions = [...s.matchAll(/\bUNION\b/gi)].map((m) => m.index);
  const seg = (pos) => unions.filter((u) => u < pos).length;
  const nodeVars = new Map();
  const relVars = new Map();
  const bindNode = (v, labels, pos, fromPattern) => {
    if (!v) return;
    const k = `${seg(pos)}|${v}`;
    if (!nodeVars.has(k)) nodeVars.set(k, { exprs: [], fromPattern: false, rebound: false });
    const e = nodeVars.get(k);
    if (labels) e.exprs.push(labels);
    e.fromPattern = e.fromPattern || fromPattern;
  };
  for (const n of nodes) if (n.var && (n.labels || n.map || n.dynamic || rels.some((r) => r.left === n || r.right === n))) bindNode(n.var, n.labels, n.start, true);
  for (const r of rels) if (r.var) {
    const k = `${seg(r.start)}|${r.var}`;
    const cur = relVars.get(k) || { types: new Set(), varLen: false, rebound: false };
    for (const t of r.types || []) cur.types.add(t);
    cur.varLen = cur.varLen || r.varLen;
    relVars.set(k, cur);
  }
  const nodeVar = (v, pos) => {
    const e = v ? nodeVars.get(`${seg(pos)}|${v}`) : null;
    return e && !e.rebound ? e : null;
  };
  const relVar = (v, pos) => {
    const e = v ? relVars.get(`${seg(pos)}|${v}`) : null;
    return e && !e.rebound ? e : null;
  };
  const labelPreds = [];
  for (const m of spans.matchAll(/(?<![\w.$@'])([A-Za-z_]\w*)(\s*):(\s*)(!?[A-Z]\w*(?:\s*[|&]\s*!?[A-Z]\w*)*)/g)) {
    const v = m[1];
    if ((m[2] || m[3]) && !nodeVar(v, m.index)) continue;
    if (relVar(v, m.index) || /^(WHEN|THEN|ELSE|AND|OR|NOT|WHERE|XOR)$/i.test(v)) continue;
    const labels = parseLabelExpr(m[4]);
    if (!labels) continue;
    labelPreds.push({ var: v, labels, pos: m.index });
    bindNode(v, labels, m.index, false);
  }
  // aliases (x AS y copies a binding) and rebinding (expr AS y hides a pattern binding of y)
  for (const m of s.matchAll(/([\w.$@')\]}]+)\s+AS\s+([A-Za-z_]\w*)\b/gi)) {
    const [, src, dst] = m;
    if (src === dst) continue;
    const pos = m.index;
    const k = `${seg(pos)}|${dst}`;
    if (/^[A-Za-z_]\w*$/.test(src) && nodeVar(src, pos) && !nodeVars.has(k) && !relVars.has(k)) nodeVars.set(k, { ...nodeVar(src, pos), fromPattern: false });
    else if (/^[A-Za-z_]\w*$/.test(src) && relVar(src, pos) && !relVars.has(k) && !nodeVars.has(k)) relVars.set(k, relVar(src, pos));
    else {
      if (nodeVars.get(k)?.fromPattern) nodeVars.get(k).rebound = true;
      if (relVars.has(k)) relVars.get(k).rebound = true;
    }
  }
  // property reads
  const props = [];
  for (const m of s.matchAll(/(?<![\w.$@])([A-Za-z_]\w*)\.([A-Za-z_]\w*)\b(?!\s*\()/g)) props.push({ var: m[1], prop: m[2], pos: m.index });
  for (const n of nodes) if (n.map) for (const e of mapEntries(n.map)) props.push({ var: n.var, labels: n.labels, prop: e.key, pos: n.start + 1 + n.mapOffset + e.offset, literal: /^'@@\d+'$/.test(e.value) ? e.value : null, inPattern: 'node', anchor: n.start });
  for (const r of rels) if (r.map) for (const e of mapEntries(r.map)) props.push({ var: r.var, types: r.types, prop: e.key, pos: r.contentStart + r.mapOffset + e.offset, literal: /^'@@\d+'$/.test(e.value) ? e.value : null, inPattern: 'rel', anchor: r.start });
  for (const m of spans.matchAll(/(?<![\w.$@])([A-Za-z_]\w*)\s*\{([^{}]*)\}/g)) {
    if (!nodeVar(m[1], m.index) && !relVar(m[1], m.index)) continue;
    for (const e of m[2].matchAll(/(?:^|,)\s*\.([A-Za-z_]\w*)/g)) props.push({ var: m[1], prop: e[1], pos: m.index });
  }
  // literal comparisons var.prop vs 'string'
  const cmps = [];
  for (const m of s.matchAll(/(?<![\w.$@])([A-Za-z_]\w*)\.([A-Za-z_]\w*)\s*(?:=|<>)\s*('@@\d+')/g)) cmps.push({ var: m[1], prop: m[2], lits: [m[3]], pos: m.index });
  for (const m of s.matchAll(/('@@\d+')\s*(?:=|<>)\s*([A-Za-z_]\w*)\.([A-Za-z_]\w*)/g)) cmps.push({ var: m[2], prop: m[3], lits: [m[1]], pos: m.index });
  for (const m of s.matchAll(/(?<![\w.$@])([A-Za-z_]\w*)\.([A-Za-z_]\w*)\s+IN\s*\[([^\]]*)\]/gi)) {
    const lits = [...m[3].matchAll(/'@@\d+'/g)].map((x) => x[0]);
    if (lits.length) cmps.push({ var: m[1], prop: m[2], lits, pos: m.index });
  }
  for (const m of s.matchAll(/('@@\d+')\s+IN\s+([A-Za-z_]\w*)\.([A-Za-z_]\w*)/gi)) cmps.push({ var: m[2], prop: m[3], lits: [m[1]], pos: m.index });
  for (const p of props) if (p.literal) cmps.push({ var: p.var, labels: p.labels, types: p.types, prop: p.prop, lits: [p.literal], pos: p.pos, inPattern: p.inPattern, anchor: p.anchor });
  return { nodes, rels, nodeVar, relVar, labelPreds, props, cmps };
}

// ------------------------------------------------------------------------------------------------ evaluation against a model
function typeSetOf(model, labels) {
  if (!labels || !labels.list.length) return null;
  const sets = labels.list.map((l) => model.labelTypes.get(l) || new Set());
  if (labels.mode === 'all') return sets.reduce((a, b) => new Set([...a].filter((x) => b.has(x))));
  return new Set(sets.flatMap((x) => [...x]));
}
// union of the types of every label expression bound to a variable; an expression naming an undeclared label makes the
// variable's type unknown (the label finding is reported once; nothing is inferred from the remaining expressions)
function typesOfExprs(model, exprs) {
  const out = new Set();
  for (const e of exprs) {
    const ts = typeSetOf(model, e);
    if (!ts || !ts.size) return new Set();
    for (const t of ts) out.add(t);
  }
  return out;
}
function endpointTypes(model, a, node) {
  if (!node || node.opaque) return null;
  if (node.labels) {
    const ts = typeSetOf(model, node.labels);
    return ts && ts.size ? ts : 'unknownLabel';
  }
  const b = node.var ? a.nodeVar(node.var, node.start) : null;
  if (!b || !b.exprs.length) return null;
  const out = typesOfExprs(model, b.exprs);
  return out.size ? out : 'unknownLabel';
}
function varTypes(model, a, v, inlineLabels, pos) {
  if (inlineLabels) return typeSetOf(model, inlineLabels);
  const b = v ? a.nodeVar(v, pos) : null;
  if (!b || !b.exprs.length) return null;
  return typesOfExprs(model, b.exprs);
}
const fmtSet = (s) => [...s].sort().join('|');
function evaluate(model, a, ctx) {
  const F = [];
  const add = (kind, name, detail, pos, extra = {}) => F.push({ kind, name, detail, pos, ...extra });
  const seenLabel = new Set();
  const checkLabels = (labels, pos) => {
    if (!labels) return;
    for (const l of [...labels.list, ...labels.negated]) {
      if (model.labelTypes.has(l) || seenLabel.has(l)) continue;
      seenLabel.add(l);
      add('label', l, `label \`${l}\` is not declared`, pos);
    }
  };
  for (const n of a.nodes) checkLabels(n.labels, n.start);
  for (const p of a.labelPreds) checkLabels(p.labels, p.pos);
  const seenType = new Set();
  for (const r of a.rels) {
    for (const t of r.types || []) {
      if (!model.relTypes.has(t)) {
        if (!seenType.has(t)) add('relType', t, `relationship type \`${t}\` is not declared`, r.start);
        seenType.add(t);
        continue;
      }
      if (r.varLen) continue; // endpoints of a variable-length pattern are not the ends of one hop
      const L = endpointTypes(model, a, r.left);
      const R = endpointTypes(model, a, r.right);
      if (L === 'unknownLabel' || R === 'unknownLabel') continue;
      const triples = model.relTypes.get(t).triples;
      const match = (src, tgt) => {
        for (const k of triples.keys()) {
          const [x, y] = k.split('>');
          if ((!src || src.has(x)) && (!tgt || tgt.has(y))) return k;
        }
        return null;
      };
      const [src, tgt] = r.dir === 'in' ? [R, L] : [L, R];
      const ok = r.dir === 'both' ? match(L, R) || match(R, L) : match(src, tgt);
      if (ok) continue;
      const rev = r.dir === 'both' ? null : match(tgt, src);
      const show = (S) => (S ? fmtSet(S).slice(0, 80) : '*');
      const pat = `(${show(src)})-[:${t}]->(${show(tgt)})`;
      const ends = [...(src || []), ...(tgt || [])].slice(0, 4);
      if (rev) add('direction', t, `${pat}: direction reversed; the SDL stores (${rev.replace('>', `)-[:${t}]->(`)}) [declared on ${triples.get(rev)}]`, r.start, { pair: pat, ends });
      else {
        const sample = [...triples.keys()].slice(0, 6).map((k) => k.replace('>', '→')).join(', ');
        add('pair', t, `${pat}: no such pair; ${t} connects ${sample}${triples.size > 6 ? `, … (${triples.size})` : ''}`, r.start, { pair: pat, ends });
      }
    }
  }
  // properties
  const seenProp = new Set();
  for (const p of a.props) {
    const pos = p.anchor ?? p.pos;
    const rvar = p.inPattern ? null : a.relVar(p.var, pos);
    const nvar = p.inPattern ? null : a.nodeVar(p.var, pos);
    const isRel = p.inPattern === 'rel' || (!p.inPattern && rvar && !nvar);
    if (isRel) {
      const rv = p.inPattern === 'rel' ? { types: new Set(p.types || []), varLen: false } : rvar;
      if (!rv || rv.varLen || !rv.types.size) continue;
      const known = [...rv.types].filter((t) => model.relTypes.has(t));
      if (!known.length) continue;
      const allowed = new Set();
      const ptypes = new Set();
      for (const t of known) for (const pt of model.relTypes.get(t).propTypes) {
        ptypes.add(pt);
        for (const k of (model.relPropTypes.get(pt) || new Map()).keys()) allowed.add(k);
      }
      if (allowed.has(p.prop)) continue;
      const key = `r|${p.var}|${p.prop}|${fmtSet(rv.types)}`;
      if (seenProp.has(key)) continue;
      seenProp.add(key);
      add('relProperty', p.prop, `\`${p.var || '(anonymous)'}.${p.prop}\`: not a property of ${known.join('|')} (${ptypes.size ? [...ptypes].join('|') : 'no edge-property type'})`, p.pos, { owner: [...ptypes, ...known].join('|') });
      continue;
    }
    if (!p.inPattern && !nvar) continue;
    const ts = varTypes(model, a, p.var, p.inPattern === 'node' ? p.labels : null, pos);
    if (!ts || !ts.size) continue;
    let found = false;
    let relField = null;
    let computed = null;
    for (const t of ts) {
      const nt = model.nodeTypes.get(t);
      if (!nt) {
        found = true; // seam type with no declaration in this model: nothing to check against
        break;
      }
      if (nt.props.has(p.prop)) {
        found = true;
        break;
      }
      if (nt.relFields.has(p.prop)) relField = t;
      if (nt.computed.has(p.prop)) computed = t;
      for (const l of nt.labels) if (ctx.ddlProps.has(`${l}.${p.prop}`)) found = true;
    }
    if (found) continue;
    const key = `n|${p.var}|${p.prop}|${fmtSet(ts)}`;
    if (seenProp.has(key)) continue;
    seenProp.add(key);
    const owner = fmtSet(ts).slice(0, 120);
    if (relField) add('property', p.prop, `\`${p.var || '(anonymous)'}.${p.prop}\`: \`${p.prop}\` is a relationship field of ${relField}, not a stored property`, p.pos, { owner });
    else if (computed) add('property', p.prop, `\`${p.var}.${p.prop}\`: computed (@cypher) field of ${computed}, not stored`, p.pos, { owner });
    else add('property', p.prop, `\`${p.var || '(anonymous)'}.${p.prop}\`: not a property of ${owner}`, p.pos, { owner });
  }
  // enum literals and Assertion.predicate literals
  for (const c of a.cmps) {
    const pos = c.anchor ?? c.pos;
    const rvar = c.inPattern ? null : a.relVar(c.var, pos);
    const nvar = c.inPattern ? null : a.nodeVar(c.var, pos);
    const isRel = c.inPattern === 'rel' || (!c.inPattern && rvar && !nvar);
    const fieldTypes = [];
    if (isRel) {
      const types = c.inPattern === 'rel' ? new Set(c.types || []) : rvar?.types || new Set();
      for (const t of types) for (const pt of model.relTypes.get(t)?.propTypes || []) {
        const f = model.relPropTypes.get(pt)?.get(c.prop);
        if (f) fieldTypes.push(f.namedType);
      }
    } else {
      const ts = varTypes(model, a, c.var, c.inPattern === 'node' ? c.labels : null, pos);
      if (!ts) continue;
      for (const t of ts) {
        const f = model.nodeTypes.get(t)?.props.get(c.prop);
        if (f) fieldTypes.push(f.namedType);
      }
      if (c.prop === 'predicate' && ts.has('Assertion')) {
        for (const lit of c.lits) {
          const v = strVal(lit, ctx.strings);
          if (!v || !SNAKE.test(v)) continue;
          if (!ctx.predicates.has(v)) add('predicate', v, `predicate '${v}' is not registered in ${ctx.predicateSource}`, c.pos);
        }
        continue;
      }
    }
    if (!fieldTypes.length || !fieldTypes.every((t) => model.enums.has(t))) continue;
    for (const lit of c.lits) {
      const v = strVal(lit, ctx.strings);
      if (v === null) continue;
      if (fieldTypes.some((t) => model.enums.get(t).has(v))) continue;
      const enums = [...new Set(fieldTypes)];
      add('enumValue', v, `\`${c.var || '(anonymous)'}.${c.prop}\` = '${v}': not a value of ${enums.join('|')}`, c.pos, { enums });
    }
  }
  return F;
}
// R-42: one Identifier reached by HAS_IDENTIFIER from two holders in one statement
function identifierJoins(a) {
  const holders = new Map();
  for (const r of a.rels) {
    if (!(r.types || []).includes('HAS_IDENTIFIER') || r.types.length !== 1) continue;
    const isId = (n) => n && !n.opaque && ((n.labels && n.labels.list.includes('Identifier')) || (n.var && (a.nodeVar(n.var, n.start)?.exprs || []).some((e) => e.list.includes('Identifier'))));
    const [idn, other] = isId(r.right) ? [r.right, r.left] : isId(r.left) ? [r.left, r.right] : [null, null];
    if (!idn) continue;
    const key = idn.var || `@${idn.start}`;
    const okey = other && !other.opaque ? other.var || `@${other.start}` : `?${r.start}`;
    if (!holders.has(key)) holders.set(key, { pos: r.start, others: new Set() });
    holders.get(key).others.add(okey);
  }
  return [...holders.entries()].filter(([, v]) => v.others.size >= 2).map(([k, v]) => ({ key: k, pos: v.pos, n: v.others.size }));
}

// ------------------------------------------------------------------------------------------------ block extraction
const QID = /^([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-\d+[a-z]?)\b/;
const CLAUSE = /^(MATCH|OPTIONAL|CALL|WITH|UNWIND|RETURN|CREATE|MERGE|USE|SHOW|DROP|FOREACH|LOAD|CYPHER|EXPLAIN|PROFILE|DETACH|DELETE|SET|REMOVE|FINISH|LET|FILTER)\b/i;
function extractBlocks(id) {
  const lines = pk[id].patterns.split(/\r?\n/);
  const sections = [];
  let sec = { heading: '(preamble)', question: null, start: 1, lines: [] };
  sections.push(sec);
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^##\s+(.*)$/);
    if (h) {
      const q = h[1].trim().match(QID);
      sec = { heading: h[1].trim(), question: q ? q[1] : null, start: i + 1, lines: [] };
      sections.push(sec);
    }
    sec.lines.push(lines[i]);
    if (/^\s*```\s*cypher\b/i.test(lines[i])) {
      let j = i + 1;
      while (j < lines.length && !/^\s*```\s*$/.test(lines[j])) j++;
      blocks.push({ packet: id, line: i + 1, endLine: j + 1, section: sec, body: lines.slice(i + 1, j).join('\n') });
      for (let k = i + 1; k <= j && k < lines.length; k++) sec.lines.push(lines[k]);
      i = j;
    }
  }
  for (const s of sections) s.text = s.lines.join('\n');
  return { blocks, sections };
}

// text of a packet's non-question sections (preamble, Conventions, Shared fragments): where named fragments are defined
const conventionCache = new Map();
function conventionText(id) {
  if (!conventionCache.has(id)) {
    const { sections } = extractBlocks(id);
    conventionCache.set(id, sections.filter((s) => !s.question).map((s) => s.text).join('\n'));
  }
  return conventionCache.get(id);
}

// split a block (masked) into statements: ';' at end of statement, and a new top-level reading clause after a top-level RETURN
function splitStatements(masked) {
  const out = [];
  let startOff = 0;
  const parts = [];
  let depth = 0;
  for (let i = 0; i < masked.length; i++) {
    const ch = masked[i];
    if ('({['.includes(ch)) depth++;
    else if (')}]'.includes(ch)) depth--;
    else if (ch === ';' && depth <= 0) {
      parts.push([masked.slice(startOff, i), startOff]);
      startOff = i + 1;
    }
  }
  parts.push([masked.slice(startOff), startOff]);
  for (const [p, off] of parts) {
    if (!p.trim()) continue;
    // heuristic split after RETURN
    const lines = p.split('\n');
    let d = 0;
    let seenReturn = false;
    let cur = [];
    let curOff = off;
    let lineOff = off;
    for (const l of lines) {
      const t = l.trim();
      if (d === 0 && seenReturn && /^(MATCH|OPTIONAL\s+MATCH|UNWIND|CALL|CREATE|MERGE|WITH|CYPHER)\b/i.test(t)) {
        out.push({ text: cur.join('\n'), offset: curOff, splitNoSemicolon: true });
        cur = [];
        curOff = lineOff;
        seenReturn = false;
      }
      // RETURN / UNION seen at depth 0 anywhere on the line (a RETURN may close a line that starts with WHERE)
      for (let i = 0; i < l.length; i++) {
        const ch = l[i];
        if ('({['.includes(ch)) d++;
        else if (')}]'.includes(ch)) d--;
        else if (d === 0 && /[A-Za-z]/.test(ch) && !/[\w$.]/.test(l[i - 1] || '')) {
          const w = l.slice(i).match(/^[A-Za-z_]\w*/)[0].toUpperCase();
          if (w === 'RETURN') seenReturn = true;
          else if (w === 'UNION') seenReturn = false;
          i += w.length - 1;
        }
      }
      cur.push(l);
      lineOff += l.length + 1;
    }
    out.push({ text: cur.join('\n'), offset: curOff });
  }
  return out.filter((s) => s.text.trim());
}

// ------------------------------------------------------------------------------------------------ params
const dt = (iso) => neo4j.types.DateTime.fromStandardDate(new Date(iso));
const EMB = Array.from({ length: 1536 }, (_, i) => ((i % 7) + 1) / 100);
function sampleParam(name) {
  if (/embedding|vector/i.test(name)) return EMB;
  if (/^(asOf|recAt|validAt|rt|vt|V|R|[RVT]\d|T|t|at|now|since|until|from|to|start|end|cutoff|asAt|D)$/.test(name) || /(At|Date|Time|Since|Until)$/.test(name)) return dt('2026-01-01T00:00:00Z');
  if (/^(k|n|limit|top|topK|topN|skip|days|depth|hops|maxHops|minCount|windowDays|windowYears|years|months|minSources|minStudies)$/.test(name) || /(Limit|Count|Days|Years|Hops)$/.test(name)) return neo4j.int(10);
  if (/(Uids|Ids|Keys|Predicates|Labels|Kinds|List|Codes|Schemes|Types|Roles|Statuses|Names|Values|Units|Countries|Jurisdictions|Fields|Families|Contaminants|Measurands)$/.test(name)) return ['x'];
  if (/^(humanOnly|includeRetracted|strict)$/.test(name)) return true;
  return 'x';
}
function retype(err, params) {
  const m = err.match(/Type mismatch for parameter '(\w+)': expected (\w+)/);
  if (!m) return false;
  const [, n, t] = m;
  const v = { Integer: neo4j.int(10), Float: 0.5, Boolean: true, String: 'x', Map: {}, List: ['x'], DateTime: dt('2026-01-01T00:00:00Z'), Date: neo4j.types.Date.fromStandardDate(new Date('2026-01-01')), Number: 1 }[t];
  if (v === undefined) return false;
  params[n] = v;
  return true;
}

// ------------------------------------------------------------------------------------------------ DDL properties (database-only)
function ddlStatements(text) {
  const { masked, strings } = lex(text);
  return masked.split(';').map((s) => unmask(s.trim(), strings)).filter((s) => /^CREATE\s/i.test(s));
}
function ddlPropsOf(stmts, set) {
  for (const s of stmts) {
    const m = s.match(/FOR\s*\(\s*(\w+)\s*:\s*([\w|]+)\s*\)/i);
    if (!m) continue;
    const props = [...s.matchAll(new RegExp(`\\b${m[1]}\\.(\\w+)`, 'g'))].map((x) => x[1]);
    for (const l of m[2].split('|')) for (const p of props) set.add(`${l}.${p}`);
  }
}
const globalDdl = [];
{
  globalDdl.push(...ddlStatements(patternsDdl).map((s) => ({ id: 'D-2', stmt: s })));
  const qp = queryPatternsDoc.split(/\r?\n/);
  for (let i = 0; i < qp.length; i++) {
    if (qp[i].trim() !== '```cypher') continue;
    let j = i + 1;
    while (j < qp.length && qp[j].trim() !== '```') j++;
    const m = qp[i + 1]?.match(/^\s*\/\/\s*@ddl\s+(D-[134])\b/);
    if (m) for (const s of ddlStatements(qp.slice(i + 1, j).join('\n'))) globalDdl.push({ id: m[1], stmt: unmask(s, []) });
    i = j;
  }
}
const globalDdlProps = new Set();
ddlPropsOf(globalDdl.map((d) => d.stmt), globalDdlProps);

// ------------------------------------------------------------------------------------------------ prose (stale module-qualified type names)
function proseFindings(id, sec, block) {
  const out = [];
  const lines = sec.lines;
  const blockLines = new Set();
  for (let k = block.line; k <= block.endLine; k++) blockLines.add(k);
  // the block's own trailing prose (until the next block or heading) and its in-block comments
  const lineNo = (idx) => sec.start + idx;
  for (let idx = 0; idx < lines.length; idx++) {
    const ln = lineNo(idx);
    if (ln < block.line) continue;
    const inBlock = blockLines.has(ln);
    if (!inBlock && /^\s*```/.test(lines[idx])) break;
    const text = inBlock ? (lines[idx].match(/\/\/(.*)$/) || [])[1] || '' : lines[idx];
    for (const m of text.matchAll(/\b(K|D\d{1,2})[ .]([A-Z][a-z]+[A-Za-z]*(?:\/[A-Z][a-z]+[A-Za-z]*)*)\b/g)) {
      for (const raw of m[2].split('/')) {
        // plural prose ("D6 Products", "D3 Studies") names the singular type
        const known = (x) => finalModel.typeModule.has(x) || worldModel.typeModule.has(x);
        const t = known(raw) ? raw : [raw.replace(/ies$/, 'y'), raw.replace(/s$/, '')].find(known) || raw;
        const fmod = finalModel.typeModule.get(t);
        if (fmod === m[1]) continue;
        const wmod = worldModel.typeModule.get(t);
        if (fmod === 'K') continue; // "D6 Assertions", "D10 Report": a module's records of a kernel type, not an ownership claim
        if (fmod && wmod && fmod !== m[1] && wmod === fmod) {
          out.push({ kind: 'prose', name: `${m[1]} ${t}`, line: ln, detail: `prose names \`${m[1]} ${t}\`; ${t} is declared by ${fmod} (final and packets)`, level: 'packet' });
        } else if (!fmod) {
          out.push({ kind: 'prose', name: `${m[1]} ${t}`, line: ln, detail: `prose names \`${m[1]} ${t}\`; no type ${t} in the final schema${wmod ? ` (packet ${wmod} declares it)` : ' nor in any packet SDL'}`, level: wmod ? 'final' : 'packet' });
        } else if (fmod !== m[1]) {
          out.push({ kind: 'prose', name: `${m[1]} ${t}`, line: ln, detail: `prose names \`${m[1]} ${t}\`; the final schema assigns ${t} to ${fmod}`, level: 'final' });
        }
      }
    }
  }
  const seen = new Set();
  return out.filter((f) => !seen.has(f.name + f.line) && seen.add(f.name + f.line));
}

// inline-code Cypher in the prose of 03 (outside fences), e.g. a convention line `(i:Identifier)-[:HAS_IDENTIFIER]->(entity)`:
// labels, relationship types, directions and pairs only (reported separately; never counted as blocks)
function inlinePatternFindings(id) {
  const out = [];
  const lines = pk[id].patterns.split(/\r?\n/);
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    for (const m of lines[i].matchAll(/`([^`]*-\[[^`\]]*\]-[^`]*)`/g)) {
      const { masked, strings } = lex(m[1]);
      const a = analyze(masked);
      const ctx = (pred) => ({ strings, ddlProps: globalDdlProps, predicates: pred, predicateSource: '' });
      const keep = (f) => ['relType', 'direction', 'pair'].includes(f.kind) || (f.kind === 'label' && /^[A-Z]/.test(f.name));
      const fp = evaluate(worldModel, a, ctx(packetPredicates)).filter(keep);
      const pkeys = new Set(fp.map((f) => `${f.kind}|${f.name}|${f.pos}`));
      for (const f of fp) out.push({ packet: id, line: i + 1, code: m[1].slice(0, 160), level: 'packet', kind: f.kind, name: f.name, detail: f.detail });
      for (const f of evaluate(finalModel, a, ctx(finalPredicates)).filter(keep)) {
        if (pkeys.has(`${f.kind}|${f.name}|${f.pos}`)) continue;
        out.push({ packet: id, line: i + 1, code: m[1].slice(0, 160), level: 'final', kind: f.kind, name: f.name, detail: f.detail, ruling: attributeRuling([f.name, ...(f.ends || [])], id, null, f.kind === 'pair' ? f.name : null) });
      }
    }
  }
  return out;
}
const inlineOut = [];

// ------------------------------------------------------------------------------------------------ run
const uri =process.env.NEO4J_TEST_URI || 'bolt://localhost:7691';
const driver = noDb ? null : neo4j.driver(uri, neo4j.auth.basic(process.env.NEO4J_TEST_USERNAME || 'neo4j', process.env.NEO4J_TEST_PASSWORD || 'bks-test-password'));
const session = driver ? driver.session() : null;
const db = { version: null, preexisting: [], ddl: [], created: [], dropped: 0, nodesAtStart: null };
const blocksOut = [];
const lineOf = (text, pos) => text.slice(0, pos).split('\n').length - 1;

async function execDdl(id, stmt) {
  try {
    await session.run(stmt);
    db.ddl.push({ id, ok: true, stmt });
    return { ok: true };
  } catch (e) {
    const code = e.code || '';
    const dataConflict = /ConstraintCreationFailed/.test(code);
    const exists = /AlreadyExists|EquivalentSchemaRule/.test(code);
    db.ddl.push({ id, ok: dataConflict || exists ? null : false, dataConflict, exists, error: `${code}: ${e.message.split('\n')[0]}`, stmt });
    return { ok: dataConflict || exists, error: `${code}: ${e.message.split('\n')[0]}` };
  }
}
async function explain(text) {
  const names = [...new Set([...text.matchAll(/\$([A-Za-z_]\w*)/g)].map((m) => m[1]))];
  const params = Object.fromEntries(names.map((n) => [n, sampleParam(n)]));
  // shape hints from use: `UNWIND $p AS v ... v.key` -> list of maps; `$p.key` -> map
  for (const m of text.matchAll(/UNWIND\s+\$(\w+)\s+AS\s+(\w+)/gi)) if (new RegExp(`\\b${m[2]}\\.\\w`).test(text)) params[m[1]] = [{}];
  for (const m of text.matchAll(/\$(\w+)\.\w/g)) params[m[1]] = {};
  let last = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const r = await session.run('EXPLAIN ' + text, params);
      const notes = [...new Set((r.summary.notifications || []).map((n) => n.code).filter((c) => !/Unknown(Label|RelationshipType|PropertyKey)Warning/.test(c)))];
      return { ok: true, notifications: notes, retries: attempt };
    } catch (e) {
      last = `${e.code}: ${e.message.split('\n')[0]}`;
      if (!retype(last, params)) break;
    }
  }
  return { ok: false, error: last };
}

try {
  if (session) {
    const v = await session.run('CALL dbms.components() YIELD versions, edition RETURN versions[0] AS v, edition');
    db.version = `${v.records[0].get('v')} ${v.records[0].get('edition')}`;
    db.nodesAtStart = (await session.run('MATCH (n) RETURN count(n) AS n')).records[0].get('n').toNumber();
    const preI = await session.run('SHOW INDEXES YIELD name RETURN collect(name) AS n');
    const preC = await session.run('SHOW CONSTRAINTS YIELD name RETURN collect(name) AS n');
    db.preexisting = [...preI.records[0].get('n'), ...preC.records[0].get('n')];
    for (const d of globalDdl) await execDdl(d.id, d.stmt);
    try {
      await session.run('CALL db.awaitIndexes(300)');
    } catch {
      /* reported by SHOW INDEXES below */
    }
  }

  for (const id of packets) {
    const { blocks, sections } = extractBlocks(id);
    inlineOut.push(...inlinePatternFindings(id));
    const ownDdlProps = new Set(globalDdlProps);
    for (const b of blocks) ddlPropsOf(ddlStatements(b.body).map((s) => s), ownDdlProps);
    for (const b of blocks) {
      const sec = b.section;
      const rec = {
        packet: id, worktree: PACKET_WORKTREE[id], file: `${rel(path.join(pk[id].dir, '03-retrieval-patterns.md')).replace(/^\.\.\//, '')}`, line: b.line,
        question: sec.question, section: sec.heading, statements: [], findings: [], notes: [], fragment: null, cypher25: false, gds: false,
      };
      const { masked: m0, strings } = lex(b.body);
      // CALL (vars) { } emptied by a /* TRACE(...) */ placeholder
      let masked = m0.replace(/CALL\s*\(([^()]*)\)\s*\{\s*\}/g, (_, v) => {
        rec.notes.push('empty CALL body (TRACE placeholder) stubbed as RETURN null AS trace');
        return `CALL (${v}) { RETURN null AS trace }`;
      });
      // macros
      const mac = MACROS[id] || {};
      const relVarNames = new Set([...masked.matchAll(/\[\s*([A-Za-z_]\w*)/g)].map((x) => x[1]));
      const used = new Set();
      for (let pass = 0; pass < 3; pass++) {
        masked = masked.replace(/\b([A-Z][A-Z_]*[A-Z])\s*\(([^()]*)\)/g, (all, name, arg) => {
          if (!mac[name]) return all;
          used.add(name);
          return mac[name](arg.split(',')[0].trim(), { isRel: (x) => relVarNames.has(x) });
        });
      }
      if (used.size) rec.notes.push(`macros expanded: ${[...used].join(', ')}`);
      const first = masked.trim().split(/\s+/)[0] || '';
      const isQuestion = !!sec.question;
      if (!CLAUSE.test(first) && !/^CREATE$/i.test(first)) rec.fragment = `starts with \`${first.slice(0, 30)}\`: an expression or clause fragment, not a statement`;
      if (/…|(?<!\.)\.\.\.(?!\.)/.test(masked.replace(/'@@\d+'/g, ''))) rec.fragment = rec.fragment || 'contains an elision (… / ...)';
      const stmts = splitStatements(masked);
      if (stmts.some((s) => s.splitNoSemicolon)) rec.notes.push(`${stmts.length} statements in one block without ';' (split after a top-level RETURN)`);
      for (const [si, st] of stmts.entries()) {
        let text = st.text;
        const lineOffset = lineOf(masked, st.offset + (text.length - text.trimStart().length));
        const srec = { index: si + 1, line: b.line + 1 + lineOffset, cypher25: false, explain: null, kind: 'query' };
        const lead = text.match(/^\s*CYPHER\s+25\b/i);
        if (lead) {
          srec.cypher25 = rec.cypher25 = true;
          text = text.replace(/^\s*CYPHER\s+25\b/i, (x) => ' '.repeat(x.length));
        }
        const trimmed = text.trim();
        if (/<[A-Z][A-Z_]*>/.test(trimmed)) {
          // a generator template (`rel_<TYPE>_writer`), not a statement
          srec.kind = 'template';
          srec.explain = { ok: null, note: 'template with a <PLACEHOLDER>; not run' };
          rec.notes.push(`statement ${si + 1} (line ${srec.line}) is a template with <PLACEHOLDER>s; not run`);
          rec.statements.push(srec);
          continue;
        }
        const isDdl =/^(CREATE|DROP)\s+(OR\s+REPLACE\s+)?(FULLTEXT\s+|VECTOR\s+|RANGE\s+|TEXT\s+|POINT\s+|LOOKUP\s+)?(INDEX|CONSTRAINT)\b/i.test(trimmed);
        const a = analyze(text);
        const posLine = (pos) => b.line + 1 + lineOf(masked, st.offset + pos);
        // static: packet world and final
        const ctxP = { strings, ddlProps: ownDdlProps, predicates: packetPredicates, predicateSource: 'any packet 05 register' };
        const ctxF = { strings, ddlProps: globalDdlProps, predicates: finalPredicates, predicateSource: finalPredicateSource };
        for (const c of a.cmps) if (c.prop === 'predicate') for (const l of c.lits) { const v = strVal(l, strings); if (v && proposedPredicates.has(v)) rec.notes.push(`predicate ${v} is proposed-new in predicates.yaml (not yet accepted by its registrar)`); }
        let fp = evaluate(worldModel, a, ctxP);
        let ff = evaluate(finalModel, a, ctxF);
        if (isDdl) {
          fp = fp.filter((f) => f.kind === 'label');
          ff = ff.filter((f) => f.kind === 'label');
          srec.kind = 'ddl';
        }
        const key = (f) => `${f.kind}|${f.name}|${f.pos}`;
        const pKeys = new Set(fp.map(key));
        const own = ownModels[id];
        for (const f of fp) {
          const line = posLine(f.pos);
          let origin = '';
          if (f.kind === 'pair' || f.kind === 'direction') origin = '';
          const names = f.kind === 'enumValue' ? [...f.enums, f.name] : [f.name, ...(f.owner ? f.owner.split('|').slice(0, 3) : []), ...(f.ends || [])];
          rec.findings.push({ level: 'packet', kind: f.kind, name: f.name, detail: f.detail + origin, line, statement: si + 1, related: attributeRuling(names, id, sec.question, f.kind === 'pair' || f.kind === 'direction' ? f.name : null, true) });
        }
        for (const f of ff) {
          if (pKeys.has(key(f))) continue;
          const names = f.kind === 'enumValue' ? [...f.enums, f.name] : [f.name, ...(f.owner ? f.owner.split('|').slice(0, 3) : []), ...(f.ends || [])];
          let ruling = attributeRuling(names, id, sec.question, f.kind === 'pair' || f.kind === 'direction' ? f.name : null);
          if (f.kind === 'predicate' && retiredPredicates.has(f.name)) {
            const r = retiredPredicates.get(f.name);
            ruling = [String(r.ruling).split(/[,\s]+/)[0], ...ruling.filter((x) => x !== r.ruling)].slice(0, 2);
            f.detail += `; retired (${r.ruling}) -> ${r.now}`;
          }
          rec.findings.push({ level: 'final', kind: f.kind, name: f.name, detail: f.detail, line: posLine(f.pos), statement: si + 1, ruling });
        }
        // seam origin notes for packet-level names that the own packet + kernel do not declare
        for (const n of a.nodes) for (const l of n.labels?.list || []) if (!own.labelTypes.has(l) && worldModel.labelTypes.has(l)) rec.notes.push(`seam label ${l} (${worldModel.typeModule.get([...worldModel.labelTypes.get(l)][0]) || '?'})`);
        for (const r of a.rels) for (const t of r.types || []) if (!own.relTypes.has(t) && worldModel.relTypes.has(t)) rec.notes.push(`seam relationship ${t} (${[...worldModel.relTypes.get(t).modules].join('|')})`);
        // predicate retired in final while registered by a packet: attach ruling
        for (const f of rec.findings) if (f.kind === 'predicate' && f.level === 'packet' && retiredPredicates.has(f.name) && !f.ruling) {
          const r = retiredPredicates.get(f.name);
          f.ruling = [String(r.ruling).split(/[,\s]+/)[0]];
          f.detail += `; retired (${r.ruling}) -> ${r.now}`;
        }
        // R-42 identifier joins
        for (const j of identifierJoins(a)) rec.findings.push({ level: 'final', kind: 'identifierJoin', name: 'HAS_IDENTIFIER', detail: `joins ${j.n} holders through one Identifier (${j.key.startsWith('@') ? 'anonymous' : j.key}); R-42: no cross-type joins through a shared Identifier`, line: posLine(j.pos), statement: si + 1, ruling: ['R-42'] });
        // R-83 rule note: RECOMMENDS_AGAINST with a Target object
        for (const c of a.cmps) if (c.prop === 'predicate' && c.lits.some((l) => strVal(l, strings) === 'RECOMMENDS_AGAINST') && /:Target\b/.test(text)) {
          rec.findings.push({ level: 'final', kind: 'ruleNote', name: 'RECOMMENDS_AGAINST', detail: `RECOMMENDS_AGAINST read together with a Target; ${ruleNotes.find((r) => /RECOMMENDS_AGAINST/.test(r.predicate))?.status?.slice(0, 160) || 'R-83'}`, line: posLine(c.pos), statement: si + 1, ruling: ['R-83'] });
          break;
        }
        // run
        if (session) {
          const gdsCall = /\bCALL\s+(gds|apoc)\./i.test(trimmed);
          if (isDdl) {
            const before = new Set((await session.run('SHOW INDEXES YIELD name RETURN collect(name) AS n')).records[0].get('n').concat((await session.run('SHOW CONSTRAINTS YIELD name RETURN collect(name) AS n')).records[0].get('n')));
            const r = await execDdl(`${id}@${srec.line}`, unmask(trimmed, strings));
            srec.explain = r.ok ? { ok: true, executed: true } : { ok: false, error: r.error };
            if (r.ok && db.ddl.at(-1).ok) {
              const after = (await session.run('SHOW INDEXES YIELD name RETURN collect(name) AS n')).records[0].get('n').concat((await session.run('SHOW CONSTRAINTS YIELD name RETURN collect(name) AS n')).records[0].get('n'));
              for (const n of after) if (!before.has(n)) db.created.push(n);
            }
            if (db.ddl.at(-1).exists) srec.explain.note = 'an equivalent index/constraint already exists';
          } else {
            const unm = unmask(trimmed, strings);
            const usesPlugin = /\b(gds|apoc)\./i.test(unm);
            if (/gds\.graph\.project\(/.test(trimmed) && !gdsCall) {
              rec.gds = true;
              srec.kind = 'gds-projection';
              srec.explain = await explain(unmask(rewriteProject(trimmed), strings));
              srec.explain.note = 'projection source query EXPLAINed (gds.graph.project(...) rewritten to a map literal)';
            } else if (gdsCall) {
              srec.kind = 'gds-call';
              rec.gds = true;
              srec.explain = { ok: null, note: 'GDS/APOC procedure: not available on Community; not planned' };
            } else {
              srec.explain = await explain(unm);
              const err = srec.explain.error || '';
              if (!srec.explain.ok && usesPlugin && /ProcedureNotFound|Unknown function/.test(err)) {
                srec.kind = 'gds-call';
                rec.gds = true;
                srec.explain = { ok: null, note: `GDS/APOC function or procedure not available on Community (${err.slice(0, 80)})` };
              } else if (!srec.explain.ok && /Variable `\w+` not defined/.test(err) && /\bgds\./.test(b.body)) {
                srec.kind = 'gds-dependent';
                rec.gds = true;
                srec.explain = { ok: null, note: `reads columns a GDS call yields (the call is commented out or in another statement): ${err.slice(0, 90)}` };
              }
            }
          }
        }
        rec.statements.push(srec);
      }
      // pending ruling edits (section text, owner copy)
      for (const p of PENDING) {
        if (p.packet !== id || !p.notApplied) continue;
        const hitsSection = p.questions.includes(sec.question);
        const hitsLine = p.line && b.line <= p.line + 15 && p.line <= b.endLine + 15 && (p.line >= b.line || sec.lines.length);
        if (!hitsSection && !(p.line && sec.start <= p.line && p.line <= sec.start + sec.lines.length && hitsLine)) continue;
        // attribute to the block that shows the old form, else to the first block of the section
        const blockShows = p.notApplied(b.body);
        const sectionShows = p.notApplied(sec.text);
        const firstOfSection = blocks.find((x) => x.section === sec) === b;
        if (blockShows || (sectionShows && firstOfSection && !blocks.some((x) => x.section === sec && x !== b && p.notApplied(x.body)))) {
          if (p.line && !(b.line <= p.line + 15 && p.line <= b.endLine + 15)) continue;
          rec.findings.push({ level: 'final', kind: 'pendingEdit', name: p.ruling, detail: `${p.ruling} edit-pattern not applied: ${p.why}${blockShows ? '' : ' (in the section prose)'}`, line: b.line, statement: null, ruling: [p.ruling] });
        }
      }
      rec.prose = proseFindings(id, sec, b);
      for (const f of rec.prose) f.ruling = f.level === 'final' ? attributeRuling([f.name.split(' ')[1], f.name.split(' ')[0]], id, sec.question) : [];
      // fragments that fail to plan in a non-question section, or correlated subquery bodies
      const explainErrors = rec.statements.filter((s) => s.explain && s.explain.ok === false && s.kind !== 'ddl');
      if (!rec.fragment && explainErrors.length) {
        const firstStmt = stmts[0]?.text.trim() || '';
        const undefinedVar = explainErrors.map((s) => (s.explain.error || '').match(/Variable `(\w+)` not defined/)).find(Boolean);
        // a block that elides a named convention fragment (`// + TRACE(a)`, `// DOSE (shared fragment)`) and reads its variables
        const placeholders = [...new Set([...b.body.matchAll(/\/\/\s*\+?\s*([A-Z][A-Z_]{2,})\b|\/\*\s*([A-Z][A-Z_]{2,})\s*\(/g)].map((m) => m[1] || m[2]))];
        const elided = placeholders.filter((n) => conventionText(id).includes(n));
        if (/^CALL\s*\([^)]*\w[^)]*\)\s*\{/i.test(firstStmt) && undefinedVar) rec.fragment = `correlated subquery body: needs the outer variable \`${undefinedVar[1]}\``;
        else if (undefinedVar && elided.length) {
          rec.fragment = `elides the convention fragment ${elided.join(', ')} and reads its variable \`${undefinedVar[1]}\``;
          rec.softFragment = isQuestion; // a question pattern: its static findings still classify it
        }
        else if (!isQuestion && undefinedVar) rec.fragment = `convention fragment (section "${sec.heading.slice(0, 40)}"): needs the outer variable \`${undefinedVar[1]}\``;
        else if (!isQuestion) rec.fragment = `convention fragment (section "${sec.heading.slice(0, 40)}"): ${explainErrors[0].explain.error.slice(0, 120)}`;
      }
      classify(rec);
      blocksOut.push(rec);
    }
  }

  if (session) {
    if (!keep) {
      const created = [...new Set(db.created.concat(db.ddl.filter((d) => d.ok).map((d) => (d.stmt.match(/(?:INDEX|CONSTRAINT)\s+(\S+)\s+IF NOT EXISTS/i) || [])[1]).filter(Boolean)))].filter((n) => !db.preexisting.includes(n));
      const postC = (await session.run('SHOW CONSTRAINTS YIELD name RETURN collect(name) AS n')).records[0].get('n');
      const postI = (await session.run('SHOW INDEXES YIELD name RETURN collect(name) AS n')).records[0].get('n');
      for (const n of created) {
        if (postC.includes(n)) await session.run(`DROP CONSTRAINT \`${n}\` IF EXISTS`);
        else if (postI.includes(n)) await session.run(`DROP INDEX \`${n}\` IF EXISTS`);
        else continue;
        db.dropped++;
      }
    }
    const post = await session.run('SHOW INDEXES YIELD name RETURN count(*) AS n');
    db.indexesAfterCleanup = post.records[0].get('n').toNumber();
  }
} finally {
  if (session) await session.close();
  if (driver) await driver.close();
}

function rewriteProject(stmt) {
  const key = 'gds.graph.project(';
  let s = stmt;
  let idx = s.indexOf(key);
  while (idx >= 0) {
    const k = findClose(s, idx + key.length - 1, '(', ')');
    if (k < 0) break;
    // a map literal keeps `g.graphName` / `g.nodeCount` reads plannable; the arguments stay so their variables are checked
    s = s.slice(0, idx) + "{graphName: '', nodeCount: 0, relationshipCount: 0, projectionArgs: [" + s.slice(idx + key.length, k) + ']}' + s.slice(k + 1);
    idx = s.indexOf(key);
  }
  return s;
}

function classify(rec) {
  const packetIssues = [];
  const rulingIssues = [];
  if (rec.cypher25) packetIssues.push('`CYPHER 25` prefix (Neo4j 5.26 accepts only Cypher 5)');
  for (const s of rec.statements) {
    if (s.explain && s.explain.ok === false) packetIssues.push(`EXPLAIN${rec.statements.length > 1 ? ` (statement ${s.index}, line ${s.line})` : ''}: ${s.explain.error}`);
  }
  for (const f of rec.findings) {
    const txt = `L${f.line} ${f.kind}: ${f.detail}${f.ruling?.length ? ` [${f.ruling.join(', ')}]` : f.related?.length ? ` (related: ${f.related.join(', ')})` : ''}`;
    (f.level === 'packet' ? packetIssues : rulingIssues).push(txt);
  }
  rec.packetIssues = packetIssues;
  rec.rulingIssues = rulingIssues;
  rec.rulings = [...new Set(rec.findings.flatMap((f) => f.ruling || []))];
  if (rec.fragment && rec.softFragment) {
    // the EXPLAIN failure is explained by the elision; classify on the static findings (and the CYPHER 25 prefix)
    const staticPacket = packetIssues.filter((x) => !/^EXPLAIN/.test(x));
    if (staticPacket.length || rulingIssues.length) {
      rec.class = staticPacket.length ? 'packetBug' : 'rulingBroken';
      rec.alsoRulingBroken = rec.class === 'packetBug' && rulingIssues.length > 0;
      rec.reason = `${[...staticPacket, ...rulingIssues].join(' | ')} | not planned: ${rec.fragment}`;
      rec.packetIssues = staticPacket;
      return;
    }
  }
  if (rec.fragment) {
    rec.class = 'fragment';
    const notCounted = [...packetIssues.filter((x) => !/^EXPLAIN/.test(x)), ...rulingIssues];
    rec.reason = rec.fragment + (notCounted.length ? ` | static (not counted): ${notCounted.join(' | ')}` : '');
    return;
  }
  if (packetIssues.length) rec.class = 'packetBug';
  else if (rulingIssues.length) rec.class = 'rulingBroken';
  else if (rec.statements.some((s) => s.kind === 'gds-call' || s.kind === 'gds-dependent')) rec.class = 'gds-unvalidated';
  else rec.class = 'ok';
  rec.alsoRulingBroken = rec.class === 'packetBug' && rulingIssues.length > 0;
  rec.reason = [...packetIssues, ...rulingIssues].join(' | ') || (rec.class === 'gds-unvalidated' ? 'GDS/APOC call not available on Community' : '');
}

// ------------------------------------------------------------------------------------------------ FU-04 confirmation
const B = (pred) => blocksOut.filter(pred);
const has = (rec, pred) => rec.findings.some(pred);
const fu04 = [
  { item: 'R-42', what: 'D3 CQ-EV-05 and D11 CQ-PV-05 join through a shared Identifier',
    hits: B((r) => (r.packet === 'D3' && r.question === 'CQ-EV-05') || (r.packet === 'D11' && r.question === 'CQ-PV-05')).filter((r) => has(r, (f) => (f.ruling || []).includes('R-42'))),
    expect: [['D3', 'CQ-EV-05'], ['D11', 'CQ-PV-05']] },
  { item: 'R-83', what: 'D10 Q-D10-08 and Q-D10-03 guideline branches (RECOMMENDS_AGAINST)',
    hits: B((r) => r.packet === 'D10' && ['Q-D10-08', 'Q-D10-03'].includes(r.question)).filter((r) => has(r, (f) => (f.ruling || []).includes('R-83'))),
    expect: [['D10', 'Q-D10-08'], ['D10', 'Q-D10-03']] },
  { item: 'R-94', what: 'D10 03 line ~744 (trace names D9 Episode/Publication); D13 03 line ~188 (DocumentTextVersion / Episode)',
    hits: B((r) => (r.packet === 'D10' && r.line <= 744 && 744 <= r.line + 25) || (r.packet === 'D13' && r.line <= 188 && 188 <= r.line + 25)).filter((r) => has(r, (f) => (f.ruling || []).includes('R-94')) || r.prose.some((p) => /Episode|Publication|DocumentTextVersion/.test(p.name))),
    expect: [['D10', 744], ['D13', 188]],
    // the D13 part: the owner copy no longer names DocumentTextVersion / Episode anywhere in 03 (already applied)
    applied: (p) => p === 'D13' && !/DocumentTextVersion|\bEpisode\b/.test(pk.D13.patterns.split(/\r?\n/).slice(6).join('\n')) },
  { item: 'R-89', what: 'Q-D2-21 reads D7 interest predicates that do not exist',
    hits: B((r) => r.packet === 'D2' && r.question === 'Q-D2-21').filter((r) => has(r, (f) => (f.ruling || []).includes('R-89') || (f.kind === 'predicate' && /HOLDS_EQUITY_IN|CONSULTS_FOR|INVENTOR_OF_PATENT_LICENSED_TO/.test(f.name)))),
    expect: [['D2', 'Q-D2-21']] },
  { item: 'R-47', what: 'Q-D2-18 ranks the AFFECTS_MECHANISM edge instead of a D10 Association',
    hits: B((r) => r.packet === 'D2' && r.question === 'Q-D2-18').filter((r) => has(r, (f) => (f.ruling || []).includes('R-47') || f.name === 'AFFECTS_MECHANISM')), expect: [['D2', 'Q-D2-18']] },
  { item: 'R-30', what: 'Q-D6-01 reads the removed declaredNameVerbatim',
    hits: B((r) => r.packet === 'D6' && r.question === 'Q-D6-01').filter((r) => has(r, (f) => f.name === 'declaredNameVerbatim' || (f.ruling || []).includes('R-30'))), expect: [['D6', 'Q-D6-01']] },
  { item: 'R-09', what: 'K CQ-AX-04 still reads EMPTY_RESULT',
    hits: B((r) => r.packet === 'K' && r.question === 'CQ-AX-04').filter((r) => has(r, (f) => (f.ruling || []).includes('R-09'))), expect: [['K', 'CQ-AX-04']] },
  { item: 'fix-1 HAS_IDENTIFIER direction', what: '(Identifier)-[:HAS_IDENTIFIER]->(x) in D1 03 lines 214, 234, 460, 666, 670; D2 433; D12 3, 153, 761',
    lines: { D1: [214, 234, 460, 666, 670], D2: [433], D12: [3, 153, 761] } },
  { item: 'fix-2 RESULT_FOR', what: 'Q-D12-03 and Q-D12-06 read (QualityResult)-[:RESULT_FOR]->(Product) (R-73 cut, R-95)',
    hits: B((r) => r.packet === 'D12' && ['Q-D12-03', 'Q-D12-06'].includes(r.question)).filter((r) => has(r, (f) => f.name === 'RESULT_FOR')), expect: [['D12', 'Q-D12-03'], ['D12', 'Q-D12-06']] },
  { item: 'fix-3 Q-D8-23', what: 'LegalStatus STATUS_OF Device and RegulatoryRecord CONCERNS Device (pairs R-72 cut)',
    hits: B((r) => r.packet === 'D8' && r.question === 'Q-D8-23').filter((r) => has(r, (f) => ['STATUS_OF', 'CONCERNS'].includes(f.name) && f.kind === 'pair') ), expect: [['D8', 'Q-D8-23']] },
  { item: 'fix-4 Q-D2-16', what: '(Assessment)-[:ASSESSES]->(Assertion): Assertion is not Subjectable',
    hits: B((r) => r.packet === 'D2' && r.question === 'Q-D2-16').filter((r) => has(r, (f) => f.name === 'ASSESSES' && ['pair', 'direction'].includes(f.kind))), expect: [['D2', 'Q-D2-16']] },
];
for (const it of fu04) {
  if (it.lines) {
    const found = [];
    const missing = [];
    for (const [p, ls] of Object.entries(it.lines)) for (const l of ls) {
      const r = blocksOut.find((x) => x.packet === p && x.findings.some((f) => f.kind === 'direction' && f.name === 'HAS_IDENTIFIER' && Math.abs(f.line - l) <= 1));
      const inl = inlineOut.find((x) => x.packet === p && x.kind === 'direction' && x.name === 'HAS_IDENTIFIER' && x.line === l);
      if (r) found.push(`${p}:${l} (block L${r.line} ${r.question || ''})`);
      else if (inl) found.push(`${p}:${l} (inline code in prose)`);
      else {
        const lines = pk[p]?.patterns.split(/\r?\n/) || [];
        const text = (lines[l - 1] || '').trim();
        missing.push(`${p}:${l} ("${text.slice(0, 70)}")`);
      }
    }
    it.missing = missing;
    it.detected = missing.length === 0 ? 'yes' : found.length ? 'partly' : 'no';
    it.evidence = `direction findings at ${found.join(', ')}${missing.length ? `; not at ${missing.join('; ')}` : ''}`;
  } else {
    const appliedParts = it.expect.filter(([p]) => it.applied?.(p)).map((e) => e.join(' '));
    const got = it.expect.map(([p, q]) => it.applied?.(p) || (typeof q === 'number' ? it.hits.some((r) => r.packet === p && r.line <= q && q <= r.line + 25) : it.hits.some((r) => r.packet === p && r.question === q)));
    it.detected = got.every(Boolean) ? 'yes' : got.some(Boolean) ? 'partly' : 'no';
    if (appliedParts.length) it.alreadyApplied = appliedParts;
    delete it.applied;
    it.evidence = it.hits.map((r) => `${r.packet} L${r.line} ${r.question || ''} ${r.class}: ${r.findings.filter((f) => (f.ruling || []).length || f.kind !== 'property').slice(0, 2).map((f) => f.detail.slice(0, 110)).join('; ') || r.prose.map((p) => p.detail).join('; ')}`).join(' || ') +
      (appliedParts.length ? ` || already applied in the owner copy: ${appliedParts.join(', ')} (no DocumentTextVersion / Episode in D13 03 below its header)` : '');
    it.missing = it.expect.filter((e, i) => !got[i]).map((e) => e.join(' '));
    delete it.hits;
  }
}
const c25 = blocksOut.filter((r) => r.cypher25);
fu04.push({ item: 'CYPHER 25 prefix', what: 'packet patterns prefixed CYPHER 25, which Neo4j 5.26 rejects', detected: c25.length ? 'yes' : 'no',
  evidence: Object.entries(c25.reduce((a, r) => ((a[r.packet] = (a[r.packet] || 0) + 1), a), {})).map(([p, n]) => `${p}: ${n}`).join(', ') });

// ------------------------------------------------------------------------------------------------ reports
const perPacket = packets.map((id) => {
  const bs = blocksOut.filter((r) => r.packet === id);
  const c = (k) => bs.filter((r) => r.class === k).length;
  return { id, worktree: PACKET_WORKTREE[id], head: pk[id].head, total: bs.length, ok: c('ok'), fragment: c('fragment'), gdsUnvalidated: c('gds-unvalidated'),
    packetBugs: c('packetBug'), rulingBroken: c('rulingBroken'), failing: c('packetBug') + c('rulingBroken'),
    alsoRulingBroken: bs.filter((r) => r.alsoRulingBroken).length, cypher25: bs.filter((r) => r.cypher25).length, proseFindings: bs.reduce((a, r) => a + r.prose.length, 0) };
});
const totals = perPacket.reduce((a, p) => {
  for (const k of ['total', 'ok', 'fragment', 'gdsUnvalidated', 'packetBugs', 'rulingBroken', 'failing', 'alsoRulingBroken', 'cypher25', 'proseFindings']) a[k] = (a[k] || 0) + p[k];
  return a;
}, {});
const kindCounts = {};
for (const r of blocksOut) for (const f of r.findings) {
  const k = `${f.level}:${f.kind}`;
  kindCounts[k] = (kindCounts[k] || 0) + 1;
}
const rulingCounts = {};
for (const r of blocksOut) if (r.class === 'rulingBroken' || r.alsoRulingBroken) for (const id of r.rulings) rulingCounts[id] = (rulingCounts[id] || 0) + 1;

const report = {
  tool: 'final/_work/lint-packet-patterns.mjs', generatedAt: new Date().toISOString(), neo4j: db.version, uri: noDb ? null : uri,
  inputs: { ...input, packets: Object.fromEntries(ALL_PACKETS.map((id) => [id, { worktree: pk[id].worktree, head: pk[id].head, patternsSha256: pk[id].sha.patterns, sdlSha256: pk[id].sha.sdl, registerError: pk[id].registerError }])) },
  selfCheck: selfCheckResult, documentedLabels, predicateRegistries: { packetPredicates: packetPredicates.size, finalPredicates: finalPredicates.size, finalSource: finalPredicateSource, proposedNew: proposedPredicates.size, retiredPredicates: retiredPredicates.size },
  editPatternOps, db: { ...db, ddl: db.ddl.filter((d) => d.ok !== true), ddlExecuted: db.ddl.length, ddlAccepted: db.ddl.filter((d) => d.ok === true).length },
  totals, perPacket, kindCounts, rulingCounts, fu04, inlinePatterns: inlineOut, blocks: blocksOut.map((r) => ({ ...r, section: r.section })),
};
writeFileSync(jsonPath, JSON.stringify(report, null, 2) + '\n');

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/\n/g, ' ');
const md = [];
md.push('# Packet pattern lint (FU-04)');
md.push('');
md.push(`Generated by \`final/_work/lint-packet-patterns.mjs\` on ${report.generatedAt.slice(0, 10)} against the owner worktrees (A1–A8), Neo4j ${db.version || '(not run: --no-db)'} at ${noDb ? '-' : uri}. Machine-readable twin: \`final/_work/pattern-lint.json\`.`);
md.push('');
md.push('Each fenced `cypher` block of `packets/<id>/03-retrieval-patterns.md` (owner copy) is EXPLAINed (leading `CYPHER 25` stripped and flagged; packet macros expanded; typed sample parameters) and its labels, relationship types, directions, endpoint pairs, properties, enum literals and `Assertion.predicate` literals are checked against (a) the packet world (own SDL + K kernel, sibling SDLs for seams, packet 05 registers) and (b) the final IR / merged register.');
md.push('');
md.push('Classes: **packetBug** fails against the packet SDL + kernel (or does not plan on 5.26); **rulingBroken** valid for the packet but broken by a synthesis ruling (ruling named when found); **fragment** not runnable alone (static findings listed, not counted); **gds-unvalidated** GDS/APOC call that Community cannot plan; **ok**. `failing` = packetBug + rulingBroken. A packetBug block that also has ruling-level findings is counted once (as packetBug) and listed in "also ruling".');
md.push('');
md.push('## Summary');
md.push('');
md.push('| packet | worktree@HEAD | blocks | ok | fragment | gds-unvalidated | packetBug | rulingBroken | failing | also ruling | CYPHER 25 | prose |');
md.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const p of perPacket) md.push(`| ${p.id} | ${p.worktree}@${p.head} | ${p.total} | ${p.ok} | ${p.fragment} | ${p.gdsUnvalidated} | ${p.packetBugs} | ${p.rulingBroken} | ${p.failing} | ${p.alsoRulingBroken} | ${p.cypher25} | ${p.proseFindings} |`);
md.push(`| **all** | | ${totals.total} | ${totals.ok} | ${totals.fragment} | ${totals.gdsUnvalidated} | ${totals.packetBugs} | ${totals.rulingBroken} | ${totals.failing} | ${totals.alsoRulingBroken} | ${totals.cypher25} | ${totals.proseFindings} |`);
md.push('');
md.push(`Findings by level and kind: ${Object.entries(kindCounts).sort().map(([k, v]) => `${k} ${v}`).join(', ')}.`);
md.push('');
md.push(`Rulings named on ruling-broken blocks: ${Object.entries(rulingCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} (${v})`).join(', ') || 'none'}.`);
md.push('');
md.push(`Self-check (SDL reader on the printed final SDL vs the IR): ${selfCheckResult.diffs} differences${selfCheckResult.diffs ? ` (${selfCheckResult.sample.join('; ')})` : ''}; packet world ${selfCheckResult.worldNodeTypes} node types, ${selfCheckResult.worldRelationshipTypes} relationship types${selfCheckResult.worldParseErrors.length ? `; parse errors: ${selfCheckResult.worldParseErrors.join('; ')}` : ''}. Packet-documented extra labels accepted for the packet world: ${documentedLabels.map((d) => `${d.label} on ${d.type} (${d.packet} 04 line ${d.line})`).join(", ") || "none"}. Predicate registries: ${packetPredicates.size} packet (05 registers), ${finalPredicates.size} final (${finalPredicateSource}; ${proposedPredicates.size} of them proposed-new), ${retiredPredicates.size} retired or alias spellings.`);
md.push('');
md.push(`DDL: ${report.db.ddlExecuted} statements executed (${report.db.ddlAccepted} accepted; ${db.ddl.filter((d) => d.exists).length} already present; ${db.ddl.filter((d) => d.dataConflict).length} data conflicts; ${db.ddl.filter((d) => d.ok === false).length} errors); ${db.dropped} indexes/constraints created by the run dropped afterwards${keep ? ' (--keep: none dropped)' : ''}.`);
md.push('');
md.push('## FU-04 items');
md.push('');
md.push('| item | what | detected | evidence |');
md.push('| --- | --- | --- | --- |');
for (const it of fu04) md.push(`| ${esc(it.item)} | ${esc(it.what)} | ${it.detected}${it.missing?.length ? ` (missing: ${esc(it.missing.join(', '))})` : ''} | ${esc(String(it.evidence).slice(0, 900))} |`);
md.push('');
md.push('## Inline-code patterns in the prose of 03 (outside fences)');
md.push('');
md.push('Convention lines and prose quote patterns in backticks; these are checked for labels, relationship types, directions and pairs only and are not counted as blocks.');
md.push('');
md.push('| packet | line | level | kind | finding | code |');
md.push('| --- | --- | --- | --- | --- | --- |');
for (const f of inlineOut) md.push(`| ${f.packet} | ${f.line} | ${f.level === 'packet' ? 'packetBug' : 'rulingBroken'} | ${f.kind} | ${esc(f.detail)}${f.ruling?.length ? ` [${f.ruling.join(', ')}]` : ''} | \`${esc(f.code)}\` |`);
if (!inlineOut.length) md.push('| — | | | | none | |');
md.push('');
md.push('## Ruling edit-pattern ops (rulings.yaml)');
md.push('');
md.push('| module | ruling | questions | change | linter test |');
md.push('| --- | --- | --- | --- | --- |');
for (const o of editPatternOps) {
  const tests = PENDING.filter((p) => p.ruling === o.ruling && p.questions.some((q) => o.questions.includes(q)));
  const state = o.questions.map((q) => {
    const bs = blocksOut.filter((r) => r.question === q && r.packet === o.module);
    const pend = bs.some((r) => r.findings.some((f) => f.kind === 'pendingEdit' && f.name === o.ruling));
    const t = tests.find((p) => p.questions.includes(q));
    return `${q}: ${!t?.notApplied ? 'not testable' : pend ? 'NOT applied' : 'applied'}`;
  });
  md.push(`| ${o.module} | ${o.ruling} | ${o.questions.join(', ')} | ${esc(o.change)} | ${esc(state.join('; '))} |`);
}
md.push('');
for (const id of packets) {
  const p = perPacket.find((x) => x.id === id);
  md.push(`## ${id} (${p.worktree} \`${pk[id].worktree.replace(/^.*\//, '')}\`@${p.head}: ${p.total} blocks, ${p.failing} failing)`);
  md.push('');
  md.push('| line | question | class | reason |');
  md.push('| --- | --- | --- | --- |');
  for (const r of blocksOut.filter((x) => x.packet === id)) {
    const extra = [r.notes.length ? `notes: ${[...new Set(r.notes)].join('; ')}` : '', r.prose.length ? `prose: ${r.prose.map((f) => `L${f.line} ${f.detail}${f.ruling?.length ? ` [${f.ruling.join(', ')}]` : ''}`).join('; ')}` : ''].filter(Boolean).join(' · ');
    md.push(`| ${r.line} | ${esc(r.question || r.section.slice(0, 40))} | ${r.class}${r.alsoRulingBroken ? ' (+ruling)' : ''} | ${esc(r.reason)}${extra ? `${r.reason ? ' · ' : ''}<small>${esc(extra)}</small>` : ''} |`);
  }
  md.push('');
}
writeFileSync(mdPath, md.join('\n'));

console.log(JSON.stringify({ neo4j: db.version, totals, perPacket: perPacket.map((p) => `${p.id}: ${p.total} total, ${p.failing} failing (${p.packetBugs} packetBug, ${p.rulingBroken} rulingBroken), ${p.fragment} fragment, ${p.gdsUnvalidated} gds`), fu04: fu04.map((f) => `${f.item}: ${f.detected}`), selfCheckDiffs: selfCheckResult.diffs, json: jsonPath, md: mdPath }, null, 2));
