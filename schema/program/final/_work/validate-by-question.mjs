#!/usr/bin/env node
// Validator for final/patterns-by-question/*.md (close-out round, FU-04): the final-SDL rewrites of packet patterns that
// final/_work/pattern-lint.json classed rulingBroken. Shared by every pattern writer; one .md per packet (D3.md, K.md, ...).
//
// File contract (each patterns-by-question/<packet>.md):
//   - one section per question: a heading `## <question id>` (the packet's id, stable);
//   - Cypher in ```cypher fences inside the section; statements end at a line ending in `;` (or at the fence end);
//   - optional first-line markers of a fence:
//       // @id <statement id>       names the first statement (default <question>#<n>)
//       // @gds                     the block calls gds.* / apoc.*: not run on Community, reported gds-unvalidated
//                                   (a gds.graph.project(...) source query is EXPLAINed after rewriting the call to a list)
//       // @fragment <reason>       illustrative fragment: static checks only, no EXPLAIN
//     and anywhere in a block:  // @param <name>:<string|int|float|bool|datetime|date|strings|floats|embedding|null>
//   - optional file-level macros in a ```cypher-macros fence: lines `NAME(a, b) = <body>` (a body may continue on the
//     following lines until the next definition); NAME(x, y) in a block is replaced by the body with the parameters
//     substituted (word-boundary), repeatedly (nested macros allowed, depth 6). Writers may also inline everything.
//   - a status line `- EXPLAIN: ...` after a block is rewritten with the result when --fill is given.
//
// Per statement it
//   1. EXPLAINs it on the disposable Neo4j 5.26 (bks-neo4j-synth, bolt://localhost:7691) with typed sample parameters
//      (name heuristics below, overridable with @param); a leading `CYPHER 25` is an error (5.26 accepts Cypher 5 only);
//   2. checks it statically against the FINAL assembled schema (final/schema/final_biotech_schema_v2.ir.json) and the
//      predicate registry (final/vocabularies/predicates.yaml):
//        label            every :Label in a node pattern or a `v:Label` predicate is a node type or interface
//        relType          every relationship type exists
//        pair             (a:A)-[:R]->(b:B): some declared triple of R matches the endpoint labels in the written direction
//                         (labels come from the pattern or from the variable's binding; interfaces expand to implementers)
//        property         v.prop / {prop: ...} exists on the variable's node types or on R's edge-properties type
//        enumValue        v.prop = 'X', v.prop <> 'X', v.prop IN ['X', ...], {prop: 'X'} on an enum-typed field: X is a value
//        predicate        Assertion predicate literals are registered (status registered, or a relationship type name, R-53);
//                         alias-of / retired-by / proposed-new are findings
//        identifierJoin   two holders joined through one Identifier node (R-42)
//      (negative self-test 2026-10-09: a scratch file with RETRACTED on revisionStatus, a shared-Identifier join, an
//      unknown label / type, a reversed RESULT_FOR, an undeclared property, a bad enum value and an alias predicate
//      raised all nine findings; a syntax error failed EXPLAIN)
//   3. classifies each question: ok | failing | gds-unvalidated | fragment.
//
// Usage (Git Bash; pass C:/ paths):
//   node C:/.../final/_work/validate-by-question.mjs [--packets D3,K] [--files C:/.../X.md,...] [--fill] [--no-db]
//        [--ddl [C:/.../patterns-ddl.cypher]] [--keep] [--out C:/.../dir]
// Defaults: every final/patterns-by-question/*.md; JSON per file in final/_work/by-question/<packet>.json (one file per
// packet, so writers of different packets never overwrite each other's report). --ddl executes the DDL file (default
// final/_work/patterns-ddl.cypher) before the patterns and drops what this run created unless --keep (use it only for
// patterns with index hints; another validator running at the same time may see those indexes come and go).
// Env (disposable only): NEO4J_TEST_URI (bolt://localhost:7691), NEO4J_TEST_USERNAME (neo4j), NEO4J_TEST_PASSWORD (bks-test-password).
// Exit code 1 when any question is failing.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const finalDir = path.resolve(here, '..');
const worktree = path.resolve(here, '../../../..');
const reqKg = createRequire(path.join(worktree, 'packages/kg-ops/package.json'));
const reqWs = createRequire(path.join(worktree, 'packages/schema-workspace/package.json'));
const neo4j = reqKg('neo4j-driver');
const YAML = reqWs('yaml');

const args = process.argv.slice(2);
const opt = (n) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : undefined;
};
const fill = args.includes('--fill');
const noDb = args.includes('--no-db');
const keep = args.includes('--keep');
const ddlPath = args.includes('--ddl') ? opt('--ddl') || path.join(here, 'patterns-ddl.cypher') : null;
const outDir = opt('--out') || path.join(here, 'by-question');
const pbqDir = path.join(finalDir, 'patterns-by-question');
let files;
if (opt('--files')) files = opt('--files').split(',');
else {
  const all = existsSync(pbqDir) ? readdirSync(pbqDir).filter((f) => f.endsWith('.md')).map((f) => path.join(pbqDir, f)) : [];
  const want = opt('--packets') ? new Set(opt('--packets').split(',')) : null;
  files = all.filter((f) => !want || want.has(path.basename(f, '.md')));
}
if (!files.length) {
  console.error('no patterns-by-question files to validate');
  process.exit(2);
}

// ------------------------------------------------------------------------------------------------ final schema model
const irPath = path.join(finalDir, 'schema/final_biotech_schema_v2.ir.json');
const ir = JSON.parse(readFileSync(irPath, 'utf8'));
const enums = new Map(ir.enums.map((e) => [e.name, new Set(e.values.map((v) => v.name))]));
const nodeProps = new Map(); // type or interface -> Map(prop -> namedType)
for (const t of [...ir.nodes, ...ir.interfaces]) nodeProps.set(t.name, new Map(t.properties.map((p) => [p.name, p.namedType])));
const edgeProps = new Map(ir.edgePropertyTypes.map((t) => [t.name, new Map(t.properties.map((p) => [p.name, p.namedType]))]));
const implementers = new Map(ir.interfaces.map((i) => [i.name, new Set(i.implementers)]));
const relTypes = new Map(ir.relationshipTypes.map((r) => [r.type, r]));
const expand = (labels) => {
  const out = new Set();
  for (const l of labels) {
    if (implementers.has(l)) for (const x of implementers.get(l)) out.add(x);
    else out.add(l);
  }
  return out;
};
const predRegistry = new Map();
{
  const doc = YAML.parse(readFileSync(path.join(finalDir, 'vocabularies/predicates.yaml'), 'utf8'));
  const list = Object.values(doc).find((v) => Array.isArray(v) && v.length && v[0] && v[0].predicate) || [];
  for (const p of list) predRegistry.set(p.predicate, p.status);
}

// ------------------------------------------------------------------------------------------------ parse the .md files
function parseDoc(file) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const macros = new Map();
  const sections = [];
  let sec = null;
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^## (\S+)\s*$/);
    if (h) {
      sec = { id: h[1], line: i + 1, blocks: [] };
      sections.push(sec);
      continue;
    }
    const f = lines[i].trim();
    if (f === '```cypher-macros' || f === '```cypher') {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() !== '```') j++;
      const body = lines.slice(i + 1, j);
      if (f === '```cypher-macros') {
        let cur = null;
        for (const l of body) {
          const m = l.match(/^([A-Z][A-Z0-9_]*)\(([^)]*)\)\s*=\s*(.*)$/);
          if (m) {
            cur = { name: m[1], params: m[2].split(',').map((s) => s.trim()).filter(Boolean), body: [m[3]] };
            macros.set(cur.name, cur);
          } else if (cur && !/^\s*\/\//.test(l)) cur.body.push(l);
        }
      } else if (sec) sec.blocks.push({ start: i + 1, end: j + 1, body });
      i = j;
    }
  }
  return { file, text, lines, macros, sections };
}

function splitArgs(s) {
  const out = [];
  let depth = 0;
  let cur = '';
  let q = null;
  for (const c of s) {
    if (q) {
      cur += c;
      if (c === q) q = null;
      continue;
    }
    if (c === "'" || c === '"') q = c;
    if ('([{'.includes(c)) depth++;
    if (')]}'.includes(c)) depth--;
    if (c === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
function expandMacros(stmt, macros) {
  if (!macros.size) return stmt;
  let s = stmt;
  for (let depth = 0; depth < 6; depth++) {
    let changed = false;
    for (const m of macros.values()) {
      const re = new RegExp(`\\b${m.name}\\(`, 'g');
      let hit;
      while ((hit = re.exec(s))) {
        let d = 0;
        let k = hit.index + m.name.length;
        for (; k < s.length; k++) {
          if (s[k] === '(') d++;
          else if (s[k] === ')' && --d === 0) break;
        }
        const argv = splitArgs(s.slice(hit.index + m.name.length + 1, k));
        let body = m.body.join('\n').trim();
        m.params.forEach((p, i) => {
          body = body.replace(new RegExp(`\\b${p}\\b`, 'g'), argv[i] ?? p);
        });
        s = s.slice(0, hit.index) + body + s.slice(k + 1);
        re.lastIndex = hit.index + body.length;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return s;
}
function splitStatements(lines) {
  const out = [];
  let cur = [];
  for (const l of lines) {
    cur.push(l);
    if (/;\s*(\/\/.*)?$/.test(l) && !/^\s*\/\//.test(l)) {
      out.push(cur.join('\n').replace(/;\s*(\/\/.*)?$/, ''));
      cur = [];
    }
  }
  if (cur.join('').trim()) out.push(cur.join('\n'));
  return out.map((s) => s.trim()).filter((s) => s.replace(/\/\/.*$/gm, '').trim());
}

// ------------------------------------------------------------------------------------------------ static analysis
// strip comments, mask strings ('S#<n>' tokens; values kept)
function mask(stmt) {
  let out = '';
  const strings = [];
  for (let i = 0; i < stmt.length; i++) {
    const c = stmt[i];
    if (c === '/' && stmt[i + 1] === '/') {
      while (i < stmt.length && stmt[i] !== '\n') i++;
      out += '\n';
      continue;
    }
    if (c === '/' && stmt[i + 1] === '*') {
      i += 2;
      while (i < stmt.length && !(stmt[i] === '*' && stmt[i + 1] === '/')) i++;
      i++;
      out += ' ';
      continue;
    }
    if (c === "'" || c === '"') {
      let j = i + 1;
      let v = '';
      while (j < stmt.length && stmt[j] !== c) {
        if (stmt[j] === '\\') {
          v += stmt[j + 1];
          j += 2;
          continue;
        }
        v += stmt[j++];
      }
      strings.push(v);
      out += `'S#${strings.length - 1}'`;
      i = j;
      continue;
    }
    if (c === '`') {
      let j = i + 1;
      while (j < stmt.length && stmt[j] !== '`') j++;
      out += stmt.slice(i, j + 1);
      i = j;
      continue;
    }
    out += c;
  }
  return { masked: out, strings };
}
const NODE_RE = /\(\s*([A-Za-z_]\w*)?\s*((?::\s*[A-Za-z_]\w*(?:\s*[|&]\s*[A-Za-z_]\w*)*\s*)*)(\{(?:[^{}]|\{[^{}]*\})*\})?\s*(?:WHERE\b[^()]*)?\)/y;
const REL_RE = /\s*(<)?-\s*(?:\[\s*([A-Za-z_]\w*)?\s*(?::\s*([A-Za-z_]\w*(?:\s*\|\s*:?\s*[A-Za-z_]\w*)*))?\s*(\*[\d.]*)?\s*(\{(?:[^{}]|\{[^{}]*\})*\})?\s*\])?\s*-(>)?/y;
const labelList = (s) => (s ? s.split(/[:|&]/).map((x) => x.trim()).filter(Boolean) : []);
function mapEntries(m) {
  if (!m) return [];
  const inner = m.slice(1, -1);
  return splitArgs(inner)
    .map((kv) => kv.match(/^([A-Za-z_]\w*)\s*:\s*([\s\S]*)$/))
    .filter(Boolean)
    .map((x) => ({ key: x[1], value: x[2].trim() }));
}

function analyze(stmt) {
  const findings = [];
  const add = (kind, detail) => findings.push({ kind, detail });
  const { masked, strings } = mask(stmt);
  const lit = (tok) => {
    const m = tok.match(/^'S#(\d+)'$/);
    return m ? strings[+m[1]] : null;
  };
  // UNION branches bind independently
  for (const branch of masked.split(/\bUNION(?:\s+ALL)?\b/)) {
    const nodeVars = new Map(); // var -> Set(labels)
    const relVars = new Map(); // var -> Set(types)
    const whereLabels = new Map();
    const nodes = [];
    for (let i = 0; i < branch.length; i++) {
      if (branch[i] !== '(') continue;
      NODE_RE.lastIndex = i;
      const m = NODE_RE.exec(branch);
      if (!m) continue;
      const n = { start: i, end: NODE_RE.lastIndex, v: m[1], labels: labelList(m[2]), map: m[3] };
      // skip function calls such as count(x), labels(dep): preceded by an identifier character
      if (/[\w.]$/.test(branch.slice(0, i))) continue;
      nodes.push(n);
      if (n.v && n.labels.length) {
        if (!nodeVars.has(n.v)) nodeVars.set(n.v, new Set());
        for (const l of n.labels) nodeVars.get(n.v).add(l);
      }
    }
    // v:Label predicates (WHERE dep:Assertion OR dep:Assessment)
    for (const m of branch.matchAll(/(?<![\w.$])([A-Za-z_]\w*)\s*:\s*([A-Z]\w*)\b(?!\s*[:(])/g)) {
      const before = branch.slice(0, m.index);
      // ignore map entries {key: Value} and pattern contents
      const lastOpenBrace = before.lastIndexOf('{');
      const lastCloseBrace = before.lastIndexOf('}');
      if (lastOpenBrace > lastCloseBrace) continue;
      const lastOpenParen = before.lastIndexOf('(');
      const lastCloseParen = before.lastIndexOf(')');
      if (lastOpenParen > lastCloseParen && /^\(\s*$/.test(before.slice(lastOpenParen))) {
        // `(v:Label ...)` is a node pattern (already read) unless it is a parenthesized predicate `(v:A OR v:B)`
        NODE_RE.lastIndex = lastOpenParen;
        if (NODE_RE.exec(branch)) continue;
      }
      if (!/\b(WHERE|AND|OR|NOT|WHEN|XOR)\s*\(?\s*$/i.test(before) && !/\(\s*$/.test(before)) continue;
      if (!whereLabels.has(m[1])) whereLabels.set(m[1], new Set());
      whereLabels.get(m[1]).add(m[2]);
    }
    for (const [v, ls] of whereLabels) if (!nodeVars.has(v)) nodeVars.set(v, ls);
    const nodeLabelsOf = (n) => (n.labels.length ? new Set(n.labels) : n.v && nodeVars.has(n.v) ? nodeVars.get(n.v) : null);
    // labels
    const allLabels = new Set([...nodes.flatMap((n) => n.labels), ...[...whereLabels.values()].flatMap((s) => [...s])]);
    for (const l of allLabels) if (!nodeProps.has(l)) add('label', `:${l} is not a node type or interface of the final SDL`);
    // relationships and chains
    const rels = [];
    for (const n of nodes) {
      REL_RE.lastIndex = n.end;
      const r = REL_RE.exec(branch);
      if (!r || r[0].trim() === '' || !/-/.test(r[0])) continue;
      const next = nodes.find((x) => x.start >= REL_RE.lastIndex && /^\s*$/.test(branch.slice(REL_RE.lastIndex, x.start)));
      if (!next) continue;
      const rel = { v: r[2], types: r[3] ? r[3].split('|').map((x) => x.replace(':', '').trim()) : [], varLen: !!r[4], map: r[5], left: !!r[1], right: !!r[6], from: n, to: next };
      rels.push(rel);
      if (rel.v && rel.types.length) {
        if (!relVars.has(rel.v)) relVars.set(rel.v, new Set());
        for (const t of rel.types) relVars.get(rel.v).add(t);
      }
    }
    for (const rel of rels) {
      for (const t of rel.types) if (!relTypes.has(t)) add('relType', `[:${t}] is not a relationship type of the final SDL`);
      const known = rel.types.filter((t) => relTypes.has(t));
      if (!known.length || rel.varLen) continue;
      const a = nodeLabelsOf(rel.from);
      const b = nodeLabelsOf(rel.to);
      if (!a && !b) continue;
      if ([...(a || [])].some((l) => !nodeProps.has(l)) || [...(b || [])].some((l) => !nodeProps.has(l))) continue;
      const A = a ? expand(a) : null;
      const B = b ? expand(b) : null;
      const fits = (from, to) => known.some((t) => relTypes.get(t).triples.some((tr) => (!from || from.has(tr.from)) && (!to || to.has(tr.to))));
      let ok;
      if (rel.right && !rel.left) ok = fits(A, B);
      else if (rel.left && !rel.right) ok = fits(B, A);
      else ok = fits(A, B) || fits(B, A);
      if (!ok) {
        const show = (s) => (s ? [...s].join('|') : '()');
        const arrow = rel.left && !rel.right ? `<-[:${known.join('|')}]-` : rel.right && !rel.left ? `-[:${known.join('|')}]->` : `-[:${known.join('|')}]-`;
        add('pair', `(${show(a)})${arrow}(${show(b)}): no declared triple in that direction`);
      }
    }
    // R-42: no join of two holders through one Identifier node
    const idIn = new Map();
    for (const rel of rels) {
      if (!rel.types.includes('HAS_IDENTIFIER')) continue;
      const idNode = rel.right && !rel.left ? rel.to : rel.left && !rel.right ? rel.from : null;
      if (!idNode) continue;
      const key = idNode.v || `@${idNode.start}`;
      idIn.set(key, (idIn.get(key) || 0) + 1);
    }
    for (const [k, c] of idIn) if (c > 1) add('identifierJoin', `${c} holders joined through one Identifier (${k.startsWith('@') ? 'anonymous' : k}); R-42: no cross-type joins through a shared Identifier`);
    // property and enum checks
    const propTypeOf = (v, prop) => {
      // returns { declared: bool, types: Set(namedType) } or null when the variable is not typed
      if (nodeVars.has(v)) {
        const ls = [...nodeVars.get(v)].filter((l) => nodeProps.has(l));
        if (!ls.length) return null;
        const types = new Set(ls.map((l) => nodeProps.get(l).get(prop)).filter(Boolean));
        return { declared: types.size > 0, types, owner: ls.join('|') };
      }
      if (relVars.has(v)) {
        const ts = [...relVars.get(v)].filter((t) => relTypes.has(t));
        if (!ts.length) return null;
        const pts = ts.flatMap((t) => relTypes.get(t).propertiesTypes || []);
        const types = new Set(pts.map((p) => edgeProps.get(p)?.get(prop)).filter(Boolean));
        return { declared: types.size > 0, types, owner: `[:${ts.join('|')}]` + (pts.length ? ` (${[...new Set(pts)].join(', ')})` : ' (no edge properties)') };
      }
      return null;
    };
    const checkEnum = (where, types, values) => {
      const es = [...types].filter((t) => enums.has(t));
      if (!es.length || es.length !== types.size) return;
      for (const val of values) if (val !== null && !es.some((e) => enums.get(e).has(val))) add('enumValue', `${where} = '${val}': not a value of ${es.join('|')}`);
    };
    const checkPredicate = (val) => {
      if (val === null) return;
      if (relTypes.has(val)) return;
      const st = predRegistry.get(val);
      if (!st) add('predicate', `predicate '${val}' is not in the predicate registry`);
      else if (st !== 'registered') add('predicate', `predicate '${val}' has status ${st}`);
    };
    const seenProp = new Set();
    for (const m of branch.matchAll(/(?<![\w$.])([A-Za-z_]\w*)\.([A-Za-z_]\w*)\b(?!\s*\()/g)) {
      const [, v, prop] = m;
      const t = propTypeOf(v, prop);
      if (!t) continue;
      const key = `${v}.${prop}`;
      if (!t.declared && !seenProp.has(key)) add('property', `\`${key}\`: not a property of ${t.owner}`);
      seenProp.add(key);
      if (!t.declared) continue;
      const rest = branch.slice(m.index + m[0].length);
      const eq = rest.match(/^\s*(?:=|<>)\s*('S#\d+')/);
      if (eq) {
        checkEnum(`\`${key}\``, t.types, [lit(eq[1])]);
        if (prop === 'predicate') checkPredicate(lit(eq[1]));
      }
      const inl = rest.match(/^\s+IN\s+\[([^\]]*)\]/);
      if (inl) {
        const vals = [...inl[1].matchAll(/'S#\d+'/g)].map((x) => lit(x[0]));
        checkEnum(`\`${key}\``, t.types, vals);
        if (prop === 'predicate') vals.forEach(checkPredicate);
      }
    }
    // map entries of node and relationship patterns
    for (const n of nodes) {
      const ls = nodeLabelsOf(n);
      for (const { key, value } of mapEntries(n.map)) {
        if (!ls) continue;
        const known = [...ls].filter((l) => nodeProps.has(l));
        if (!known.length) continue;
        const types = new Set(known.map((l) => nodeProps.get(l).get(key)).filter(Boolean));
        if (!types.size) add('property', `{${key}: ...} on (${known.join('|')}): not a property`);
        else {
          checkEnum(`{${key}} on ${known.join('|')}`, types, [lit(value)].filter((x) => x !== null));
          if (key === 'predicate') checkPredicate(lit(value));
        }
      }
    }
    for (const r of rels) {
      const known = r.types.filter((t) => relTypes.has(t));
      if (!known.length) continue;
      for (const { key, value } of mapEntries(r.map)) {
        const pts = known.flatMap((t) => relTypes.get(t).propertiesTypes || []);
        const types = new Set(pts.map((p) => edgeProps.get(p)?.get(key)).filter(Boolean));
        if (!types.size) add('property', `{${key}: ...} on [:${known.join('|')}]: not an edge property`);
        else checkEnum(`{${key}} on [:${known.join('|')}]`, types, [lit(value)].filter((x) => x !== null));
      }
    }
  }
  if (/^\s*CYPHER\s+25\b/i.test(masked)) add('cypher25', '`CYPHER 25` prefix (Neo4j 5.26 accepts only Cypher 5)');
  const dedup = new Map(findings.map((f) => [`${f.kind}|${f.detail}`, f]));
  return [...dedup.values()];
}

// ------------------------------------------------------------------------------------------------ parameters
const dt = (iso) => neo4j.types.DateTime.fromStandardDate(new Date(iso));
const emb = Array.from({ length: 1536 }, (_, i) => ((i % 7) + 1) / 100);
const TYPED = {
  string: () => 'hu:x:1', int: () => neo4j.int(10), float: () => 0.5, bool: () => true,
  datetime: () => dt('2026-10-01T00:00:00Z'), date: () => new neo4j.types.Date(2026, 1, 1), strings: () => ['hu:x:1', 'hu:x:2'],
  floats: () => [0.1, 0.2], embedding: () => emb, null: () => null,
};
function guessType(name) {
  if (/^(recAt|validAt|asOf|R\d?|V\d?)$/.test(name) || /(At|Time|From|To|Since|Until|Cutoff)$/.test(name)) return 'datetime';
  if (/[Ee]mbedding$/.test(name)) return 'embedding';
  if (/^(k|n|limit|topK|top|skip|offset|days|depth|hops)$/i.test(name) || /(Limit|Count|Days|Size|Hops|Depth)$/.test(name)) return 'int';
  if (/(Uids|Ids|Keys|Predicates|Labels|Kinds|Values|Codes|Names|Schemes|List)$/.test(name)) return 'strings';
  if (/(Score|Threshold|Weight|Ratio|Min|Max)$/.test(name) || /^(min|max)[A-Z]/.test(name)) return 'float';
  if (/^(is|has|include|only|human)[A-Z]|Only$/.test(name)) return 'bool';
  return 'string';
}
function paramsFor(stmt, overrides) {
  const p = {};
  for (const m of stmt.matchAll(/\$([A-Za-z_]\w*)/g)) {
    const t = overrides[m[1]] || guessType(m[1]);
    p[m[1]] = (TYPED[t] || TYPED.string)();
  }
  return p;
}
function rewriteProject(stmt) {
  const key = 'gds.graph.project(';
  let s = stmt;
  let idx = s.indexOf(key);
  while (idx >= 0) {
    let depth = 0;
    let k = idx + key.length - 1;
    for (; k < s.length; k++) {
      if (s[k] === '(') depth++;
      else if (s[k] === ')' && --depth === 0) break;
    }
    s = s.slice(0, idx) + '[' + s.slice(idx + key.length, k) + ']' + s.slice(k + 1);
    idx = s.indexOf(key);
  }
  return s;
}
const TOKEN_WARN = /UnknownLabelWarning|UnknownRelationshipTypeWarning|UnknownPropertyKeyWarning/;
function ops(plan, acc = new Set()) {
  if (!plan) return acc;
  acc.add(plan.operatorType.replace(/@.*$/, ''));
  for (const c of plan.children || []) ops(c, acc);
  return acc;
}

// ------------------------------------------------------------------------------------------------ run
const driver = noDb ? null : neo4j.driver(process.env.NEO4J_TEST_URI || 'bolt://localhost:7691',
  neo4j.auth.basic(process.env.NEO4J_TEST_USERNAME || 'neo4j', process.env.NEO4J_TEST_PASSWORD || 'bks-test-password'));
const session = driver ? driver.session() : null;
let version = 'not run (--no-db)';
let exitCode = 0;
try {
  let preexisting = new Set();
  const ddl = [];
  if (session) {
    const v = await session.run('CALL dbms.components() YIELD versions, edition RETURN versions[0] AS v, edition');
    version = `${v.records[0].get('v')} ${v.records[0].get('edition')}`;
    if (ddlPath) {
      const pi = await session.run('SHOW INDEXES YIELD name RETURN collect(name) AS n');
      const pc = await session.run('SHOW CONSTRAINTS YIELD name RETURN collect(name) AS n');
      preexisting = new Set([...pi.records[0].get('n'), ...pc.records[0].get('n')]);
      const stmts = splitStatements(readFileSync(ddlPath, 'utf8').split(/\r?\n/).filter((l) => !l.trim().startsWith('//')));
      for (const s of stmts) {
        try {
          await session.run(s);
          ddl.push({ ok: true });
        } catch (e) {
          ddl.push({ ok: false, error: `${e.code}: ${e.message.split('\n')[0]}`, stmt: s });
        }
      }
      try {
        await session.run('CALL db.awaitIndexes(300)');
      } catch {}
    }
  }
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  for (const file of files) {
    const doc = parseDoc(file);
    const packet = path.basename(file, '.md');
    const questions = [];
    for (const sec of doc.sections) {
      if (!sec.blocks.length) continue;
      const q = { id: sec.id, line: sec.line, statements: [], blocks: [] };
      for (const b of sec.blocks) {
        const marker = b.body[0]?.match(/^\s*\/\/\s*@(id|gds|fragment)\b\s*(.*)$/);
        const overrides = {};
        for (const l of b.body) for (const m of l.matchAll(/@param\s+([A-Za-z_]\w*)\s*:\s*(\w+)/g)) overrides[m[1]] = m[2];
        const stmts = splitStatements(b.body);
        const blockRec = { line: b.start, marker: marker ? marker[1] : null, ids: [] };
        let n = 0;
        for (const raw of stmts) {
          n++;
          const idm = raw.match(/^\s*\/\/\s*@id\s+(\S+)/m);
          const id = idm ? idm[1] : `${sec.id}#${q.statements.length + 1}`;
          const stmt = expandMacros(raw, doc.macros);
          const rec = { id, line: b.start, findings: analyze(stmt), explain: null };
          if (marker?.[1] === 'fragment') rec.explain = { status: 'fragment', note: marker[2] };
          else if (/\bCALL\s+(gds|apoc)\./.test(stmt) && !stmt.includes('gds.graph.project(')) rec.explain = { status: 'gds-unvalidated', note: 'GDS/APOC call not available on Community' };
          else if (session) {
            const text = stmt.includes('gds.graph.project(') ? rewriteProject(stmt) : stmt;
            try {
              const r = await session.run('EXPLAIN ' + text.replace(/^\s*CYPHER\s+25\s+/i, ''), paramsFor(text, overrides));
              const notes = (r.summary.notifications || []).map((x) => x.code);
              rec.explain = { status: 'ok', operators: [...ops(r.summary.plan)], tokenWarnings: notes.filter((c) => TOKEN_WARN.test(c)).length,
                otherNotifications: [...new Set(notes.filter((c) => !TOKEN_WARN.test(c)))], projectionSource: text !== stmt };
            } catch (e) {
              rec.explain = { status: 'error', error: `${e.code}: ${e.message.split('\n')[0]}` };
            }
          } else rec.explain = { status: 'not-run' };
          q.statements.push(rec);
          blockRec.ids.push(id);
        }
        q.blocks.push(blockRec);
      }
      const st = q.statements;
      const anyErr = st.some((s) => s.explain.status === 'error' || s.findings.length);
      q.class = anyErr ? 'failing'
        : st.some((s) => s.explain.status === 'gds-unvalidated') ? 'gds-unvalidated'
          : st.every((s) => s.explain.status === 'fragment') ? 'fragment'
            : st.some((s) => s.explain.status === 'not-run') ? 'static-only' : 'ok';
      questions.push(q);
    }
    const blockStatus = (q, b) => {
      const rs = b.ids.map((id) => q.statements.find((s) => s.id === id));
      const ok = rs.filter((s) => s.explain.status === 'ok');
      const bad = rs.filter((s) => s.explain.status === 'error');
      const finds = rs.flatMap((s) => s.findings.map((f) => `${s.id} ${f.kind}: ${f.detail}`));
      const gds = rs.filter((s) => s.explain.status === 'gds-unvalidated');
      const parts = [];
      if (ok.length) {
        const flags = [...new Set(ok.flatMap((s) => s.explain.operators.filter((o) => ['AllNodesScan', 'CartesianProduct'].includes(o))))];
        parts.push(`ok on Neo4j ${version} (${ok.length}/${rs.length} statement${rs.length > 1 ? 's' : ''}${ok.some((s) => s.explain.projectionSource) ? ', GDS projection source query' : ''})` + (flags.length ? `; plan contains ${flags.join(', ')}` : ''));
      }
      if (bad.length) parts.push(`ERROR ${bad.map((s) => `${s.id} ${s.explain.error}`).join('; ')}`);
      if (gds.length) parts.push(`gds-unvalidated (${gds.length} statement${gds.length > 1 ? 's' : ''}: GDS/APOC not available on Community)`);
      if (rs.some((s) => s.explain.status === 'fragment')) parts.push('fragment (not run)');
      parts.push(finds.length ? `final-SDL static check FAILED: ${finds.join('; ')}` : 'final-SDL static check clean (labels, types, pairs, properties, enum values, predicates)');
      return parts.join('; ');
    };
    if (fill) {
      const lines = [...doc.lines];
      for (const q of questions) {
        const sec = doc.sections.find((s) => s.id === q.id);
        const nextSec = doc.sections.find((s) => s.line > sec.line);
        const limit = nextSec ? nextSec.line - 1 : lines.length;
        q.blocks.forEach((b, bi) => {
          const nextBlock = q.blocks[bi + 1];
          const stop = nextBlock ? nextBlock.line - 1 : limit;
          const end = sec.blocks[bi].end;
          for (let i = end; i < stop; i++) {
            if (/^- EXPLAIN:/.test(lines[i])) {
              lines[i] = `- EXPLAIN: ${blockStatus(q, b)}`;
              break;
            }
          }
        });
      }
      writeFileSync(file, lines.join('\n'));
    }
    const counts = {
      questions: questions.length,
      ok: questions.filter((q) => q.class === 'ok').length,
      failing: questions.filter((q) => q.class === 'failing').length,
      gdsUnvalidated: questions.filter((q) => q.class === 'gds-unvalidated').length,
      fragment: questions.filter((q) => q.class === 'fragment').length,
      statements: questions.reduce((a, q) => a + q.statements.length, 0),
      statementsExplainOk: questions.reduce((a, q) => a + q.statements.filter((s) => s.explain.status === 'ok').length, 0),
      staticFindings: questions.reduce((a, q) => a + q.statements.reduce((b, s) => b + s.findings.length, 0), 0),
    };
    if (counts.failing) exitCode = 1;
    const report = { tool: 'final/_work/validate-by-question.mjs', generatedAt: new Date().toISOString(), neo4j: version,
      file: path.relative(worktree, file).split(path.sep).join('/'), finalIr: { path: path.relative(worktree, irPath).split(path.sep).join('/'), schemaDigest: ir.schemaDigest },
      ddl: ddlPath ? { path: ddlPath, executed: ddl.length, failed: ddl.filter((d) => !d.ok).length } : null, counts, questions };
    writeFileSync(path.join(outDir, `${packet}.json`), JSON.stringify(report, null, 2) + '\n');
    console.log(`${packet}: ${JSON.stringify(counts)}`);
    for (const q of questions) {
      console.log(`  ${q.id}: ${q.class}`);
      for (const s of q.statements) {
        console.log(`    ${s.id}: EXPLAIN ${s.explain.status}${s.explain.error ? ' ' + s.explain.error : ''}${s.explain.operators?.includes('CartesianProduct') ? ' [CartesianProduct]' : ''}`);
        for (const f of s.findings) console.log(`      ${f.kind}: ${f.detail}`);
      }
    }
  }
  if (session && ddlPath && !keep) {
    for (const [show, drop] of [['SHOW CONSTRAINTS', 'DROP CONSTRAINT'], ['SHOW INDEXES', 'DROP INDEX']]) {
      const r = await session.run(`${show} YIELD name RETURN collect(name) AS n`);
      for (const name of r.records[0].get('n')) if (!preexisting.has(name)) await session.run(`${drop} \`${name}\` IF EXISTS`);
    }
  }
} finally {
  if (session) await session.close();
  if (driver) await driver.close();
}
process.exitCode = exitCode;
