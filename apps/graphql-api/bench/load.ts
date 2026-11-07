import { loadRegistry } from "../src/registry.js";
import { actorSigner, BENCH_SERVICE_KEY, benchDriver, collectSamples, startServerChild, stats, writeOut } from "./common.js";

/**
 * Warm latency at 20 concurrent clients through the real HTTP path (service credential, actor verification,
 * safelist, admission, @neo4j/graphql, Neo4j), against dist/main.js in its own process (NODE_ENV=production).
 *   pnpm api:bench:load [--seconds 20] [--concurrency 20] [--port 4610]
 */
const arg = (name: string, fallback: number) => (process.argv.includes(name) ? Number(process.argv[process.argv.indexOf(name) + 1]) : fallback);
const seconds = arg("--seconds", 20);
const concurrency = arg("--concurrency", 20);
const port = arg("--port", 4610);

const registry = loadRegistry();
const signer = actorSigner();
const driver = benchDriver();
const { samples } = await collectSamples(driver, 60);
// Connection pressure: Bolt connections and open transactions on the database, sampled during each scenario.
const pressure = async () => {
  const s = driver.session({ database: "neo4j", defaultAccessMode: "READ" });
  try {
    const c = await s.run("CALL dbms.listConnections() YIELD connectionId RETURN count(*) AS n");
    const t = await s.run("SHOW TRANSACTIONS YIELD transactionId RETURN count(*) AS n");
    return { connections: Number(c.records[0]!.get("n")), transactions: Number(t.records[0]!.get("n")) - 1 };
  } finally {
    await s.close();
  }
};

const server = await startServerChild(signer, port);
console.log(`server healthz after ${Math.round(server.healthzMs)} ms, readyz (incl. plan warm-up) after ${Math.round(server.readyzMs)} ms`);
const memoryAtReady = await server.memory();

let tokens: string[] = [];
const refreshTokens = async () => {
  tokens = await Promise.all(Array.from({ length: concurrency }, () => signer.token(["PUBLIC"])));
};
await refreshTokens();
const refresher = setInterval(() => void refreshTokens(), 60_000);

interface Sample {
  ms: number;
  status: number;
  bytes: number;
  errors: number;
}

async function scenario(name: string, ops: string[], durationS: number) {
  const results: Sample[] = [];
  const perOp = new Map<string, Sample[]>();
  const memory: Array<{ rss: number; heapUsed: number; eventLoopP99Ms: number; gc: { count: number; totalMs: number; maxMs: number } }> = [];
  const db: Array<{ connections: number; transactions: number }> = [];
  const gcBefore = (await server.memory()).gc;
  const deadline = performance.now() + durationS * 1000;
  const memTimer = setInterval(async () => {
    memory.push(await server.memory());
    db.push(await pressure().catch(() => ({ connections: -1, transactions: -1 })));
  }, 2000);
  const worker = async (w: number) => {
    let i = w;
    while (performance.now() < deadline) {
      const opName = ops[i++ % ops.length]!;
      const op = registry.registry.operations.find((o) => o.name === opName)!;
      const list = samples[opName]!;
      const variables = list[Math.floor(Math.random() * list.length)]!;
      const started = performance.now();
      let status = 0;
      let bytes = 0;
      let errors = 0;
      try {
        const res = await fetch(`${server.url}/graphql`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-api-key": BENCH_SERVICE_KEY, authorization: `Bearer ${tokens[w % tokens.length]}` },
          body: JSON.stringify({ documentId: op.id, variables }),
        });
        const text = await res.text();
        status = res.status;
        bytes = Buffer.byteLength(text);
        if (/"errors"/.test(text)) errors = 1;
      } catch {
        status = -1;
        errors = 1;
      }
      const sample = { ms: performance.now() - started, status, bytes, errors };
      results.push(sample);
      const l = perOp.get(opName) ?? [];
      l.push(sample);
      perOp.set(opName, l);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, (_, w) => worker(w)));
  clearInterval(memTimer);
  const summarize = (list: Sample[]) => ({
    latencyMs: stats(list.map((s) => s.ms)),
    throughputRps: Math.round((list.length / durationS) * 10) / 10,
    errorRate: Math.round((list.filter((s) => s.errors || s.status !== 200).length / Math.max(1, list.length)) * 10000) / 10000,
    statuses: Object.fromEntries([...new Set(list.map((s) => s.status))].map((st) => [st, list.filter((s) => s.status === st).length])),
    responseBytes: stats(list.map((s) => s.bytes)),
  });
  return {
    scenario: name,
    durationS,
    concurrency,
    ...summarize(results),
    perOperation: Object.fromEntries([...perOp].map(([k, v]) => [k, summarize(v)])),
    serverMemoryMb: { peakRss: Math.max(...memory.map((m) => m.rss), 0), peakHeapUsed: Math.max(...memory.map((m) => m.heapUsed), 0) },
    eventLoopP99Ms: Math.max(...memory.map((m) => m.eventLoopP99Ms), 0),
    gc: (() => {
      const last = memory[memory.length - 1]?.gc ?? gcBefore;
      return { collections: last.count - gcBefore.count, pauseMs: last.totalMs - gcBefore.totalMs, maxPauseMs: last.maxMs };
    })(),
    database: { peakBoltConnections: Math.max(...db.map((d) => d.connections), 0), peakOpenTransactions: Math.max(...db.map((d) => d.transactions), 0) },
  };
}

const runs = [];
try {
  // Warm-up pass over every operation (not measured).
  await scenario("warmup", registry.registry.operations.map((o) => o.name), 5);
  for (const op of registry.registry.operations) {
    const r = await scenario(op.name, [op.name], seconds);
    console.log(`${op.name.padEnd(24)} p50 ${r.latencyMs.p50} p95 ${r.latencyMs.p95} p99 ${r.latencyMs.p99} ms  ${r.throughputRps} rps  errors ${r.errorRate}  peak RSS ${r.serverMemoryMb.peakRss} MB  gc ${r.gc.pauseMs} ms  bolt ${r.database.peakBoltConnections}`);
    runs.push(r);
  }
  const mixed = await scenario("mixed", registry.registry.operations.map((o) => o.name), seconds * 2);
  console.log(`mixed                    p50 ${mixed.latencyMs.p50} p95 ${mixed.latencyMs.p95} p99 ${mixed.latencyMs.p99} ms  ${mixed.throughputRps} rps  errors ${mixed.errorRate}`);
  runs.push(mixed);
} finally {
  clearInterval(refresher);
}
const memoryAfterLoad = await server.memory();
await new Promise((r) => setTimeout(r, 3000));
const steady = await new Promise<Awaited<ReturnType<typeof server.memory>>>((resolve) => {
  const id = 999999;
  const onMessage = (m: { id?: number; memory?: never }) => {
    if (m.id !== id) return;
    server.child.off("message", onMessage);
    resolve(m.memory!);
  };
  server.child.on("message", onMessage);
  server.child.send({ id, op: "memory", gc: true });
});
await server.stop();
await driver.close();
const date = new Date().toISOString().slice(0, 10);
const path = writeOut(`${date}-load.json`, {
  generatedAt: new Date().toISOString(),
  target: "dist/main.js child process, NODE_ENV=production, product profile, disposable Neo4j 5.26 community (docker, 1 GB heap) on the same host",
  startup: { healthzMs: Math.round(server.healthzMs), readyzMs: Math.round(server.readyzMs), readyReport: server.readyReport },
  memoryMb: { atReady: memoryAtReady, afterLoad: memoryAfterLoad, steadyAfterGc: steady },
  runs,
});
console.log(`wrote ${path}`);
process.exit(0);
