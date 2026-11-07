import { execute, parse } from "graphql";
import neo4j, { type Driver, type Transaction } from "neo4j-driver";
import { buildExecutable, loadProjectionManifest } from "../src/projection.js";
import { loadRegistry } from "../src/registry.js";
import { loadConsumerSourceSdl } from "../src/release.js";
import { benchDriver, collectSamples, writeOut } from "./common.js";

/**
 * For every safelisted operation: capture the Cypher @neo4j/graphql 7.6.3 generates (typical and hub variables),
 * then EXPLAIN and an isolated PROFILE of exactly that statement. Writes benchmarks/<date>-plans.json.
 */
interface PlanNode {
  operatorType: string;
  identifiers?: string[];
  arguments?: Record<string, unknown>;
  dbHits?: number;
  rows?: number;
  pageCacheHits?: number;
  pageCacheMisses?: number;
  children: PlanNode[];
}

function walk(plan: PlanNode, visit: (p: PlanNode, depth: number) => void, depth = 0) {
  visit(plan, depth);
  for (const c of plan.children ?? []) walk(c, visit, depth + 1);
}

function summarize(profile: PlanNode, explain: PlanNode) {
  const ops = new Map<string, number>();
  let dbHits = 0;
  let maxRows = 0;
  let pageCacheHits = 0;
  let pageCacheMisses = 0;
  const seeks: string[] = [];
  const scans: string[] = [];
  walk(profile, (p) => {
    const name = p.operatorType.replace(/@.*$/, "");
    ops.set(name, (ops.get(name) ?? 0) + 1);
    dbHits += Number(p.dbHits ?? 0);
    maxRows = Math.max(maxRows, Number(p.rows ?? 0));
    pageCacheHits += Number(p.pageCacheHits ?? 0);
    pageCacheMisses += Number(p.pageCacheMisses ?? 0);
    const details = String(p.arguments?.Details ?? "");
    if (/IndexSeek|IndexScan|UniqueIndexSeek/.test(name)) seeks.push(`${name}: ${details.slice(0, 140)}`);
    if (/NodeByLabelScan|AllNodesScan|DirectedRelationshipTypeScan|UndirectedRelationshipTypeScan/.test(name)) scans.push(`${name}: ${details.slice(0, 140)}`);
  });
  const count = (re: RegExp) => [...ops].filter(([k]) => re.test(k)).reduce((n, [, v]) => n + v, 0);
  const root = (explain.arguments ?? {}) as Record<string, unknown>;
  return {
    dbHits,
    resultRows: Number(profile.rows ?? 0),
    maxOperatorRows: maxRows,
    pageCacheHits,
    pageCacheMisses,
    indexSeeks: count(/IndexSeek/),
    labelOrAllNodeScans: count(/NodeByLabelScan|AllNodesScan/),
    relationshipTypeScans: count(/RelationshipTypeScan/),
    cartesianProducts: count(/CartesianProduct/),
    sorts: count(/^(Sort|PartialSort|Top|PartialTop)$/),
    expands: count(/Expand|OptionalExpand|VarLengthExpand/),
    operators: Object.fromEntries([...ops].sort(([a], [b]) => a.localeCompare(b))),
    seekDetails: seeks.slice(0, 12),
    scanDetails: scans.slice(0, 12),
    planner: root.planner ?? root.Planner ?? null,
    runtime: root.runtime ?? root["runtime-impl"] ?? null,
    estimatedRows: explain.arguments?.EstimatedRows ?? null,
  };
}

function plain(value: unknown): unknown {
  if (neo4j.isInt(value as never)) return (value as { toNumber(): number }).toNumber();
  if (Array.isArray(value)) return value.map(plain);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    if (typeof (value as { toString?: () => string }).toString === "function" && /DateTime|Date/.test(value.constructor?.name ?? "")) return String(value);
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v)]));
  }
  return value;
}

async function captureCypher(driver: Driver, schema: Parameters<typeof execute>[0]["schema"], document: string, variables: Record<string, unknown>, internal: boolean) {
  const session = driver.session({ database: "neo4j", defaultAccessMode: "READ" });
  const tx: Transaction = session.beginTransaction({ timeout: 30_000 });
  const captured: Array<{ query: string; params: Record<string, unknown> }> = [];
  const recorder = {
    run: (query: string, params: Record<string, unknown>) => {
      captured.push({ query, params });
      return tx.run(query, params);
    },
  };
  const started = performance.now();
  const result = await execute({ schema, document: parse(document), variableValues: variables, contextValue: { executionContext: recorder, jwt: { sub: "bench", internal }, sessionConfig: { database: "neo4j" } } });
  const ms = performance.now() - started;
  await tx.rollback();
  await session.close();
  return { captured, result, ms };
}

const source = loadConsumerSourceSdl({ log: () => {} });
const { manifest, bytes } = loadProjectionManifest();
const build = await buildExecutable(source.sdl, manifest, {}, { manifestBytes: bytes });
const registry = loadRegistry();
const driver = benchDriver();
const { samples, worst } = await collectSamples(driver, 10);
const out: Record<string, unknown> = {};
try {
  for (const op of registry.registry.operations) {
    const cases: Array<{ label: string; variables: Record<string, unknown> }> = [];
    const bind = (v: Record<string, unknown>) => ({ ...v, ...Object.fromEntries(Object.entries(op.variables).filter(([, s]) => s.bind).map(([n]) => [n, ["PUBLIC"]])) });
    const typical = samples[op.name]?.[0];
    if (typical) cases.push({ label: "typical", variables: bind(typical) });
    const hub = worst[op.name]?.[0];
    if (hub) cases.push({ label: "hub", variables: bind(hub) });
    const results = [];
    for (const c of cases) {
      // Warm once (plan cache), then capture.
      await captureCypher(driver, build.schema, op.document, c.variables, false);
      const { captured, result, ms } = await captureCypher(driver, build.schema, op.document, c.variables, false);
      const statements = [];
      for (const q of captured) {
        if (/dbms\.components/.test(q.query)) continue;
        const body = q.query.replace(/^CYPHER 5\s*\n?/, "");
        const s = driver.session({ database: "neo4j", defaultAccessMode: "READ" });
        try {
          const explain = await s.run(`CYPHER 5 EXPLAIN ${body}`, q.params);
          const profile = await s.run(`CYPHER 5 PROFILE ${body}`, q.params);
          const summary = summarize(profile.summary.profile as unknown as PlanNode, explain.summary.plan as unknown as PlanNode);
          statements.push({ cypher: q.query, params: plain(q.params), resultAvailableAfterMs: profile.summary.resultAvailableAfter.toNumber(), resultConsumedAfterMs: profile.summary.resultConsumedAfter.toNumber(), ...summary });
        } finally {
          await s.close();
        }
      }
      results.push({
        case: c.label,
        variables: c.variables,
        graphqlMs: Math.round(ms),
        responseBytes: Buffer.byteLength(JSON.stringify(result)),
        errors: result.errors?.map((e) => e.message) ?? [],
        statements,
      });
      const s0 = statements[0] as { dbHits?: number; indexSeeks?: number; labelOrAllNodeScans?: number; cartesianProducts?: number; sorts?: number; maxOperatorRows?: number } | undefined;
      console.log(`${op.name.padEnd(24)} ${c.label.padEnd(8)} ${String(Math.round(ms)).padStart(5)} ms  dbHits ${s0?.dbHits}  seeks ${s0?.indexSeeks}  scans ${s0?.labelOrAllNodeScans}  cartesian ${s0?.cartesianProducts}  sorts ${s0?.sorts}  maxRows ${s0?.maxOperatorRows}  bytes ${Buffer.byteLength(JSON.stringify(result))}`);
    }
    out[op.name] = { id: op.id, costClass: op.costClass, staticCost: op.staticCost, cases: results };
  }
} finally {
  await driver.close();
}
const date = new Date().toISOString().slice(0, 10);
const path = writeOut(`${date}-plans.json`, { generatedAt: new Date().toISOString(), releaseId: source.releaseId, schemaDigest: source.schemaDigest, executableGraphqlDigest: build.identity.executableGraphqlDigest, operationRegistryDigest: registry.operationRegistryDigest, neo4j: "5.26.31 community (disposable docker, slotted runtime)", operations: out });
console.log(`wrote ${path}`);
