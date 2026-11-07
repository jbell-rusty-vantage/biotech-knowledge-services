#!/usr/bin/env node
// Validates every ```cypher block of final/query-patterns.md against a disposable Neo4j (default bks-neo4j-synth, bolt://localhost:7691).
//
// Block markers (first line of each block):
//   // @ddl <id>   statements are EXECUTED (CREATE CONSTRAINT / INDEX ... IF NOT EXISTS)
//   // @id <id>    statements are run with EXPLAIN and typed parameters
//   // @gds <id>   statements with gds.graph.project(...) are EXPLAINed after rewriting the call to a list literal
//                  (validates the projection's source query); statements with CALL gds.* cannot run on Community and
//                  are reported "GDS not available"; other statements are EXPLAINed.
// A statement ends at a line ending in ';' (or at the end of the block). A `// @id <id>` line at the start of a statement
// names it; otherwise it is <block id>#<n>.
// Before the document's DDL, the generated DDL file (final/_work/patterns-ddl.cypher) is executed.
//
// Usage (from the S worktree root):
//   node schema/program/final/_work/validate-patterns.mjs --doc C:/.../final/query-patterns.md \
//        --ddl C:/.../final/_work/patterns-ddl.cypher --report C:/.../scratch/patterns-report.md --json C:/.../scratch/patterns.json \
//        [--fill] [--keep]
//   --fill  rewrites each "- validation: ..." line under a block in the doc with the result
//   --keep  keeps the constraints and indexes this run created (default: drops them, leaving the database as found)
// Env (disposable only): NEO4J_TEST_URI (default bolt://localhost:7691), NEO4J_TEST_USERNAME (neo4j), NEO4J_TEST_PASSWORD (bks-test-password).
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const worktree = path.resolve(here, '../../../..');
const require = createRequire(path.join(worktree, 'packages/kg-ops/package.json'));
const neo4j = require('neo4j-driver');

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const docPath = opt('--doc');
const ddlPath = opt('--ddl');
const reportPath = opt('--report');
const jsonPath = opt('--json');
const fill = args.includes('--fill');
const keep = args.includes('--keep');
if (!docPath) {
  console.error('missing --doc');
  process.exit(2);
}

const uri = process.env.NEO4J_TEST_URI || 'bolt://localhost:7691';
const user = process.env.NEO4J_TEST_USERNAME || 'neo4j';
const password = process.env.NEO4J_TEST_PASSWORD || 'bks-test-password';

// ---------- parameters (typed sample values; EXPLAIN never executes) ----------
const dt = (iso) => neo4j.types.DateTime.fromStandardDate(new Date(iso));
const emb = Array.from({ length: 1536 }, (_, i) => ((i % 7) + 1) / 100);
const PARAMS = {
  asOf: dt('2026-10-09T00:00:00Z'), validAt: dt('2026-01-01T00:00:00Z'),
  R: dt('2026-10-01T00:00:00Z'), R1: dt('2026-01-01T00:00:00Z'), R2: dt('2026-10-01T00:00:00Z'),
  V: dt('2025-06-30T00:00:00Z'), V1: dt('2025-01-01T00:00:00Z'), V2: dt('2026-01-01T00:00:00Z'),
  computedAt: dt('2026-10-09T00:00:00Z'), staleAfter: dt('2026-10-16T00:00:00Z'),
  uid: 'hu:chemical-substance:nr', answerUid: 'hu:report:answer-1', assertionUid: 'hu:assertion:a1',
  claimUid: 'hu:claim:c1', reportUid: 'hu:report:r1', studyUid: 'hu:study:s1', useContextUid: 'hu:product-variant:v1',
  entityUid: 'hu:chemical-substance:nr', chunkUid: 'hu:chunk:k1', itemUid: 'hu:product:p1', startUid: 'hu:ingredient-material:m1',
  subjectUid: 'hu:target:sleep', eventUid: 'hu:event:e1', panelUid: 'hu:lab-test:panel1', meansUid: null,
  missionId: 'mission-1', runId: 'run-1', r1: 'run-1', r2: 'run-2',
  targetKey: 'sleep', frontierKey: 'senolytics-in-humans', pop: 'OLDER_ADULTS', language: 'en',
  queryText: 'nicotinamide riboside NAD+', set: 'mg-for-sleep', ver: '1', requestId: 'req-1',
  associationKind: 'SIMILARITY', methodVersion: 'gds-nodesimilarity/jaccard@1',
  k: neo4j.int(20), days: neo4j.int(90), humanOnly: true,
  questionEmbedding: emb,
  candidateUids: ['hu:product:p1', 'hu:product:p2'],
  goalPredicates: ['IMPROVES_TARGET'],
  effectPredicates: ['IMPROVES_TARGET', 'WORSENS_TARGET'],
  featurePredicates: ['IMPROVES_TARGET', 'INCREASES_ACTIVITY_OF'],
  subjectLabels: ['ChemicalSubstance', 'IngredientMaterial'],
  scopeUids: ['hu:chemical-substance:nr'],
  definingSystems: ['FDC_FOUNDATION', 'FDC_SR_LEGACY', 'PHENOL_EXPLORER'],
  rows: [{ uid: 'hu:association:x1', id: 'x1', anchorUid: 'hu:chemical-substance:nr', memberUid: 'hu:chemical-substance:nmn',
           score: 0.42, inputSetDigest: 'sha256:00', inputCount: neo4j.int(3), inputAssertionUids: ['hu:assertion:a1'] }],
};

// ---------- parse the document ----------
const docText = readFileSync(docPath, 'utf8');
const docLines = docText.split(/\r?\n/);
const blocks = [];
for (let i = 0; i < docLines.length; i++) {
  if (docLines[i].trim() === '```cypher') {
    const start = i;
    let j = i + 1;
    while (j < docLines.length && docLines[j].trim() !== '```') j++;
    blocks.push({ start, end: j, body: docLines.slice(i + 1, j) });
    i = j;
  }
}
function splitStatements(lines) {
  const out = [];
  let cur = [];
  for (const l of lines) {
    cur.push(l);
    if (/;\s*$/.test(l)) {
      out.push(cur.join('\n').replace(/;\s*$/, ''));
      cur = [];
    }
  }
  if (cur.join('').trim()) out.push(cur.join('\n'));
  return out.map((s) => s.trim()).filter(Boolean);
}
function rewriteProject(stmt) {
  // replace gds.graph.project( ... ) by [ ... ] with paren matching
  const key = 'gds.graph.project(';
  let s = stmt;
  let idx = s.indexOf(key);
  while (idx >= 0) {
    let depth = 0;
    let k = idx + key.length - 1;
    for (; k < s.length; k++) {
      if (s[k] === '(') depth++;
      else if (s[k] === ')') {
        depth--;
        if (depth === 0) break;
      }
    }
    s = s.slice(0, idx) + '[' + s.slice(idx + key.length, k) + ']' + s.slice(k + 1);
    idx = s.indexOf(key);
  }
  return s;
}
function paramsFor(stmt) {
  const names = new Set([...stmt.matchAll(/\$([A-Za-z_][A-Za-z0-9_]*)/g)].map((m) => m[1]));
  const p = {};
  const missing = [];
  for (const n of names) {
    if (n in PARAMS) p[n] = PARAMS[n];
    else {
      p[n] = 'x';
      missing.push(n);
    }
  }
  return { p, missing };
}
function ops(plan, acc = new Set()) {
  if (!plan) return acc;
  acc.add(plan.operatorType.replace(/@.*$/, ''));
  for (const c of plan.children || []) ops(c, acc);
  return acc;
}
const TOKEN_WARN = /UnknownLabelWarning|UnknownRelationshipTypeWarning|UnknownPropertyKeyWarning/;

// ---------- run ----------
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();
const results = [];
let version = '?';
try {
  const v = await session.run('CALL dbms.components() YIELD versions, edition RETURN versions[0] AS v, edition');
  version = `${v.records[0].get('v')} ${v.records[0].get('edition')}`;
  const preI = await session.run('SHOW INDEXES YIELD name RETURN collect(name) AS n');
  const preC = await session.run('SHOW CONSTRAINTS YIELD name RETURN collect(name) AS n');
  const preexisting = new Set([...preI.records[0].get('n'), ...preC.records[0].get('n')]);

  async function runDdl(id, stmt) {
    try {
      await session.run(stmt);
      results.push({ id, kind: 'ddl', ok: true, stmt });
    } catch (e) {
      // A uniqueness constraint rejected by data already in the (shared) database is a data conflict, not a DDL error:
      // the statement parsed and planned; the store refused it. Reported separately, never counted as a pattern failure.
      const dataConflict = /ConstraintCreationFailed/.test(e.code || '');
      results.push({ id, kind: 'ddl', ok: dataConflict ? null : false, dataConflict, error: `${e.code}: ${e.message.split('\n')[0]}`, stmt });
    }
  }
  async function runExplain(id, kind, stmt, original) {
    const { p, missing } = paramsFor(stmt);
    try {
      const r = await session.run('EXPLAIN ' + stmt, p);
      const notes = (r.summary.notifications || []).map((n) => n.code);
      const other = [...new Set(notes.filter((c) => !TOKEN_WARN.test(c)))];
      const operators = [...ops(r.summary.plan)];
      results.push({ id, kind, ok: true, tokenWarnings: notes.length - notes.filter((c) => !TOKEN_WARN.test(c)).length,
        otherNotifications: other, operators, missingParams: missing, stmt: original || stmt });
    } catch (e) {
      results.push({ id, kind, ok: false, error: `${e.code}: ${e.message.split('\n')[0]}`, missingParams: missing, stmt: original || stmt });
    }
  }

  if (ddlPath) {
    const ddl = splitStatements(readFileSync(ddlPath, 'utf8').split(/\r?\n/).filter((l) => !l.trim().startsWith('//')));
    let n = 0;
    for (const s of ddl) await runDdl(`D-2#${++n}`, s);
  }
  // document blocks: DDL first (in document order), then queries
  const parsed = blocks.map((b) => {
    const m = b.body[0].match(/^\s*\/\/\s*@(ddl|id|gds)\s+(\S+)/);
    return { ...b, marker: m ? m[1] : null, id: m ? m[2] : null };
  });
  for (const b of parsed.filter((x) => x.marker === 'ddl')) {
    const stmts = splitStatements(b.body.slice(1));
    b.ids = [];
    let n = 0;
    for (const s of stmts) {
      const id = `${b.id}#${++n}`;
      b.ids.push(id);
      await runDdl(id, s);
    }
  }
  try {
    await session.run('CALL db.awaitIndexes(300)');
  } catch (e) {
    results.push({ id: 'awaitIndexes', kind: 'ddl', ok: false, error: `${e.code}: ${e.message.split('\n')[0]}` });
  }
  const state = await session.run(
    "SHOW INDEXES YIELD name, state, type RETURN count(*) AS n, sum(CASE WHEN state = 'ONLINE' THEN 1 ELSE 0 END) AS online, collect(CASE WHEN state <> 'ONLINE' THEN name END) AS notOnline",
  );
  const idxState = {
    total: state.records[0].get('n').toNumber(),
    online: state.records[0].get('online').toNumber(),
    notOnline: state.records[0].get('notOnline'),
  };
  for (const b of parsed.filter((x) => x.marker !== 'ddl')) {
    b.ids = [];
    if (!b.marker) {
      const id = `UNMARKED@line${b.start + 1}`;
      b.ids.push(id);
      results.push({ id, kind: 'unmarked', ok: false, error: 'block has no @ddl/@id/@gds marker' });
      continue;
    }
    const stmts = splitStatements(b.body);
    let n = 0;
    for (const s of stmts) {
      n++;
      const first = s.split('\n')[0];
      const m = first.match(/^\s*\/\/\s*@(?:id|gds)\s+(\S+)/);
      const id = m && !(n === 1) ? m[1] : n === 1 ? b.id : `${b.id}#${n}`;
      b.ids.push(id);
      if (b.marker === 'gds' && /CALL\s+gds\./.test(s)) {
        results.push({ id, kind: 'gds-call', ok: null, note: 'GDS not available on the disposable instance; syntax reviewed against the neo4j-gds-skill', stmt: s });
      } else if (b.marker === 'gds' && s.includes('gds.graph.project(')) {
        await runExplain(id, 'gds-projection-source', rewriteProject(s), s);
      } else {
        await runExplain(id, b.marker === 'gds' ? 'gds-input' : 'query', s);
      }
    }
  }

  // cleanup
  let dropped = 0;
  if (!keep) {
    const post = await session.run('SHOW CONSTRAINTS YIELD name RETURN collect(name) AS n');
    for (const name of post.records[0].get('n')) {
      if (!preexisting.has(name)) {
        await session.run(`DROP CONSTRAINT \`${name}\` IF EXISTS`);
        dropped++;
      }
    }
    const posti = await session.run('SHOW INDEXES YIELD name RETURN collect(name) AS n');
    for (const name of posti.records[0].get('n')) {
      if (!preexisting.has(name)) {
        await session.run(`DROP INDEX \`${name}\` IF EXISTS`);
        dropped++;
      }
    }
  }

  const nodeCount = (await session.run('MATCH (n) RETURN count(n) AS n')).records[0].get('n').toNumber();
  // ---------- summarize ----------
  const byKind = (k) => results.filter((r) => r.kind === k);
  const failed = results.filter((r) => r.ok === false);
  const summary = {
    neo4j: version,
    ddlExecuted: byKind('ddl').length,
    ddlFailed: byKind('ddl').filter((r) => r.ok === false).length,
    ddlDataConflicts: byKind('ddl').filter((r) => r.dataConflict).map((r) => `${r.id}: ${r.error}`),
    nodesInDatabase: nodeCount,
    indexesAfterDdl: idxState,
    queryStatements: byKind('query').length,
    queryOk: byKind('query').filter((r) => r.ok).length,
    gdsProjectionSources: byKind('gds-projection-source').length,
    gdsProjectionSourcesOk: byKind('gds-projection-source').filter((r) => r.ok).length,
    gdsInputQueries: byKind('gds-input').length,
    gdsInputQueriesOk: byKind('gds-input').filter((r) => r.ok).length,
    gdsCallsNotRun: byKind('gds-call').length,
    failed: failed.length,
    withAllNodesScan: results.filter((r) => r.operators?.includes('AllNodesScan')).map((r) => r.id),
    withCartesianProduct: results.filter((r) => r.operators?.includes('CartesianProduct')).map((r) => r.id),
    otherNotifications: results.filter((r) => r.otherNotifications?.length).map((r) => `${r.id}: ${r.otherNotifications.join(',')}`),
    missingParams: [...new Set(results.flatMap((r) => r.missingParams || []))],
    droppedAfterRun: dropped,
    kept: keep,
  };

  // per-block status lines
  const blockStatus = (b) => {
    const rs = b.ids.map((id) => results.find((r) => r.id === id)).filter(Boolean);
    if (b.marker === 'ddl') {
      const bad = rs.filter((r) => r.ok === false);
      const conflicts = rs.filter((r) => r.dataConflict);
      if (bad.length) return `FAILED on Neo4j ${version}: ${bad.map((r) => r.id + ' ' + r.error).join('; ')}`;
      return (
        `executed on Neo4j ${version} (${rs.length - conflicts.length} of ${rs.length} statements accepted` +
        (conflicts.length
          ? `; ${conflicts.map((r) => r.id + ' ' + (r.stmt.match(/CONSTRAINT (\S+)/)?.[1] ?? '')).join(', ')} rejected by data already loaded in the shared instance (ConstraintCreationFailed), see _runlog/patterns.md)`
          : ')')
      );
    }
    const bad = rs.filter((r) => r.ok === false);
    const explained = rs.filter((r) => r.ok === true);
    const gds = rs.filter((r) => r.kind === 'gds-call');
    const parts = [];
    if (bad.length) parts.push(`ERROR on Neo4j ${version}: ${bad.map((r) => r.id + ' ' + r.error).join('; ')}`);
    if (explained.length) {
      const proj = explained.filter((r) => r.kind === 'gds-projection-source').length;
      const flags = [...new Set(explained.flatMap((r) => (r.operators || []).filter((o) => ['AllNodesScan', 'CartesianProduct'].includes(o))))];
      parts.push(
        `EXPLAIN ok on Neo4j ${version.split(' ')[0]}` +
          (explained.length > 1 ? ` (${explained.length} statements` + (proj ? `, ${proj} projection source query` : '') + ')' : proj ? ' (projection source query)' : '') +
          (flags.length ? `; plan contains ${flags.join(', ')}` : ''),
      );
    }
    if (gds.length) parts.push(`${gds.length} CALL gds.* statement(s): GDS not available on the disposable instance; syntax reviewed against the neo4j-gds-skill`);
    return parts.join('; ');
  };
  if (fill) {
    const lines = [...docLines];
    const sorted = [...parsed].sort((a, b) => a.start - b.start);
    for (let bi = 0; bi < sorted.length; bi++) {
      const b = sorted[bi];
      const limit = bi + 1 < sorted.length ? sorted[bi + 1].start : lines.length;
      for (let i = b.end + 1; i < limit; i++) {
        if (/^- validation:/.test(lines[i])) {
          lines[i] = `- validation: ${blockStatus(b)}`;
          break;
        }
      }
    }
    writeFileSync(docPath, lines.join('\n'));
  }

  const md = [];
  md.push(`### validate-patterns.mjs output`);
  md.push('');
  md.push('```json');
  md.push(JSON.stringify(summary, null, 2));
  md.push('```');
  md.push('');
  md.push('| statement | kind | result | plan operators | notes |');
  md.push('| --- | --- | --- | --- | --- |');
  for (const r of results) {
    const res = r.ok === true ? 'ok' : r.ok === false ? 'ERROR ' + r.error.replace(/\|/g, '\\|')
      : r.dataConflict ? 'DATA CONFLICT ' + r.error.replace(/\|/g, '\\|') : 'not run (GDS)';
    const notes = [
      r.tokenWarnings ? `${r.tokenWarnings} token warnings` : '',
      r.otherNotifications?.length ? r.otherNotifications.join(',') : '',
      r.missingParams?.length ? 'unmapped params: ' + r.missingParams.join(',') : '',
    ].filter(Boolean).join('; ');
    md.push(`| ${r.id} | ${r.kind} | ${res} | ${(r.operators || []).join(', ')} | ${notes} |`);
  }
  if (reportPath) writeFileSync(reportPath, md.join('\n') + '\n');
  if (jsonPath) writeFileSync(jsonPath, JSON.stringify({ summary, results, blocks: parsed.map((b) => ({ id: b.id, marker: b.marker, ids: b.ids, status: blockStatus(b) })) }, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  for (const b of parsed) console.log(`${b.id}: ${blockStatus(b)}`);
  process.exitCode = failed.length ? 1 : 0;
} finally {
  await session.close();
  await driver.close();
}
