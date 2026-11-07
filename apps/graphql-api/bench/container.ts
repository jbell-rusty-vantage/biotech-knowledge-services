import { execFileSync, spawnSync } from "node:child_process";
import { loadRegistry } from "../src/registry.js";
import { actorSigner, BENCH_PASSWORD, BENCH_SERVICE_KEY, benchDriver, collectSamples, stats, writeOut } from "./common.js";

/**
 * Cold container startup and readiness of the API image against the disposable Neo4j, then a short warm 20-client
 * mixed run with docker stats sampling (container RSS). Community has no roles: the reader credential is the plain
 * test user.
 *   pnpm --filter @bks/graphql-api exec tsx bench/container.ts --image <tag built from the pinned release> [--seconds 30]
 * The 2026-10-12 benchmark (benchmarks/2026-10-12-container.json) used image bks-graphql-api:s6-v2.0.2 (release v2.0.2).
 */
const arg = (n: string, d: string) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1]! : d);
const image = arg("--image", "");
if (!image) throw new Error("--image <tag> is required (build the image from the pinned release; no stale default)");
const seconds = Number(arg("--seconds", "30"));
const name = "bks-graphql-api-s6-bench";
const port = 4710;
const docker = (args: string[]) => execFileSync("docker", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const memMb = () => {
  const raw = docker(["stats", "--no-stream", "--format", "{{.MemUsage}}", name]).split("/")[0]!.trim();
  const v = Number.parseFloat(raw);
  return /GiB/.test(raw) ? Math.round(v * 1024) : Math.round(v);
};

spawnSync("docker", ["rm", "-f", name], { stdio: "ignore" });
const signer = actorSigner();
const registry = loadRegistry();
const driver = benchDriver();
const { samples } = await collectSamples(driver, 60);
await driver.close();

const started = performance.now();
docker([
  "run", "-d", "--name", name, "-p", `${port}:4010`, "--add-host", "host.docker.internal:host-gateway",
  "-e", "BKS_BIOTECH_GRAPH_URI=neo4j://host.docker.internal:7692", "-e", "BKS_BIOTECH_GRAPH_READER_USERNAME=neo4j", "-e", `BKS_BIOTECH_GRAPH_READER_PASSWORD=${BENCH_PASSWORD}`,
  "-e", "BKS_BIOTECH_GRAPH_DATABASE=neo4j", "-e", `GRAPHQL_API_KEY=${BENCH_SERVICE_KEY}`, "-e", `GRAPHQL_ACTOR_PUBLIC_KEY=${signer.publicPem.replace(/\n/g, "\\n")}`,
  image,
]);
const url = `http://127.0.0.1:${port}`;
const until = async (path: string, timeoutMs: number) => {
  let last = "";
  for (;;) {
    try {
      const r = await fetch(url + path);
      last = await r.text();
      if (r.status === 200) return { ms: Math.round(performance.now() - started), body: JSON.parse(last) };
    } catch {
      // not up yet
    }
    if (performance.now() - started > timeoutMs) throw new Error(`${path} not ready: ${last.slice(0, 1500)} ${docker(["logs", "--tail", "20", name])}`);
    await new Promise((r) => setTimeout(r, 100));
  }
};
try {
  const health = await until("/healthz", 120_000);
  const ready = await until("/readyz", 600_000);
  const rssAtReady = memMb();
  const logs = docker(["logs", name]).split("\n").filter((l) => /bks-graphql-api|warning/.test(l)).slice(-4);
  const token = await signer.token();
  const latencies: number[] = [];
  let errors = 0;
  const rss: number[] = [];
  const deadline = performance.now() + seconds * 1000;
  const sampler = setInterval(() => {
    try {
      rss.push(memMb());
    } catch {
      // ignore
    }
  }, 3000);
  const ops = registry.registry.operations;
  await Promise.all(
    Array.from({ length: 20 }, async (_, w) => {
      let i = w;
      while (performance.now() < deadline) {
        const op = ops[i++ % ops.length]!;
        const list = samples[op.name]!;
        const t = performance.now();
        const res = await fetch(`${url}/graphql`, { method: "POST", headers: { "content-type": "application/json", "x-api-key": BENCH_SERVICE_KEY, authorization: `Bearer ${token}` }, body: JSON.stringify({ documentId: op.id, variables: list[Math.floor(Math.random() * list.length)] }) });
        const text = await res.text();
        latencies.push(performance.now() - t);
        if (res.status !== 200 || /"errors"/.test(text)) errors++;
      }
    }),
  );
  clearInterval(sampler);
  await new Promise((r) => setTimeout(r, 5000));
  const steady = memMb();
  const result = {
    generatedAt: new Date().toISOString(),
    image,
    imageId: docker(["image", "inspect", image, "--format", "{{.Id}}"]),
    credential: "Community edition has no roles: BKS_BIOTECH_GRAPH_READER_USERNAME is the plain test user (role enforcement is proven in Gate G)",
    coldStart: { healthzMs: health.ms, readyzMs: ready.ms, warmup: ready.body.checks?.warmup, indexes: { checked: ready.body.checks?.indexes?.checked, expectedAbsent: ready.body.checks?.indexes?.expectedAbsent }, release: ready.body.checks?.release?.installed },
    memoryMb: { atReady: rssAtReady, peakUnderLoad: Math.max(...rss, rssAtReady), steadyAfterLoad: steady },
    mixedLoad: { seconds, concurrency: 20, latencyMs: stats(latencies), errors, requests: latencies.length },
    startupLog: logs,
  };
  const path = writeOut(`${new Date().toISOString().slice(0, 10)}-container.json`, result);
  console.log(JSON.stringify(result, null, 2));
  console.log(`wrote ${path}`);
} finally {
  spawnSync("docker", ["rm", "-f", name], { stdio: "ignore" });
}
