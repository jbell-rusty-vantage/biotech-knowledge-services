import { spawn, type ChildProcess } from "node:child_process";
import { generateKeyPairSync, randomUUID, type KeyObject } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SignJWT } from "jose";
import neo4j, { type Driver } from "neo4j-driver";
import { encodeCursorOffset } from "../src/limits.js";

export const benchDir = dirname(fileURLToPath(import.meta.url));
export const appDir = join(benchDir, "..");
export const BENCH_URI = process.env.BENCH_NEO4J_URI ?? "neo4j://127.0.0.1:7692";
export const BENCH_PASSWORD = process.env.BENCH_NEO4J_PASSWORD ?? "bks-s6-password";
export const BENCH_SERVICE_KEY = "bench-service-key-0123456789abcdef0123456789";
if (!/^(neo4j|bolt):\/\/(127\.0\.0\.1|localhost|host\.docker\.internal)(:\d+)?$/.test(BENCH_URI)) throw new Error(`benchmarks run against the disposable local Neo4j only, not ${BENCH_URI}`);

export function benchDriver(): Driver {
  return neo4j.driver(BENCH_URI, neo4j.auth.basic("neo4j", BENCH_PASSWORD), { maxConnectionPoolSize: 20 });
}

export function writeOut(name: string, data: unknown): string {
  const path = join(appDir, "benchmarks", name);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, typeof data === "string" ? data : `${JSON.stringify(data, null, 2)}\n`);
  return path;
}

export function stats(values: number[]): { n: number; min: number; p50: number; p95: number; p99: number; max: number; mean: number } {
  const v = [...values].sort((a, b) => a - b);
  const q = (p: number) => (v.length ? v[Math.min(v.length - 1, Math.ceil((p / 100) * v.length) - 1)]! : NaN);
  const round = (x: number) => Math.round(x * 10) / 10;
  return { n: v.length, min: round(v[0] ?? NaN), p50: round(q(50)), p95: round(q(95)), p99: round(q(99)), max: round(v[v.length - 1] ?? NaN), mean: round(v.reduce((a, b) => a + b, 0) / Math.max(1, v.length)) };
}

export type Samples = Record<string, Array<Record<string, unknown>>>;

/** Representative variables per safelisted operation, drawn from the synthetic fixture (typical and hub records). */
export async function collectSamples(driver: Driver, perOp = 60): Promise<{ samples: Samples; worst: Samples }> {
  const s = driver.session({ database: "neo4j", defaultAccessMode: "READ" });
  const rows = async (q: string, p: Record<string, unknown> = {}) => (await s.run(q, { ...p, n: neo4j.int(perOp) })).records.map((r) => r.toObject() as Record<string, unknown>);
  const visible = "coalesce(x.privacyClass, '') = 'PUBLIC'";
  try {
    const typical = async (q: string) => rows(q);
    const samples: Samples = {};
    const worst: Samples = {};
    const entityUids = await typical(
      `CALL () { MATCH (x:Product) WHERE ${visible} RETURN x.uid AS uid LIMIT 20 UNION MATCH (x:Organization) WHERE ${visible} RETURN x.uid AS uid LIMIT 20 UNION MATCH (x:ChemicalSubstance) WHERE ${visible} RETURN x.uid AS uid LIMIT 10 UNION MATCH (x:Study) WHERE ${visible} RETURN x.uid AS uid LIMIT 10 } RETURN uid`,
    );
    samples.EntityCard = entityUids.map((r) => ({ uid: r.uid }));
    samples.ProductCard = (await typical(`MATCH (x:Product) WHERE ${visible} RETURN x.uid AS uid ORDER BY x.uid LIMIT $n`)).map((r) => ({ uid: r.uid }));
    const variants = await typical(`MATCH (x:Product)-[:HAS_VARIANT]->(v) WHERE ${visible} WITH x, count(v) AS c RETURN x.uid AS uid, c ORDER BY c DESC, uid LIMIT $n`);
    samples.ProductVariantsPage = variants.slice(3).map((r) => ({ uid: r.uid, first: 25 }));
    worst.ProductVariantsPage = variants.slice(0, 3).map((r) => ({ uid: r.uid, first: 25, after: encodeCursorOffset(24) }));
    const subjects = await typical(`MATCH (a:Assertion)-[:HAS_SUBJECT]->(x) WHERE ${visible} WITH x, count(a) AS c RETURN x.uid AS uid, c ORDER BY c DESC, uid LIMIT $n`);
    samples.SubjectAssertionsPage = subjects.slice(3).map((r) => ({ subjectUid: r.uid, first: 25 }));
    worst.SubjectAssertionsPage = subjects.slice(0, 3).map((r) => ({ subjectUid: r.uid, first: 25 }));
    const evidence = await typical(`MATCH (x:Assertion)-[:HAS_EVIDENCE]->(l) WHERE ${visible} WITH x, count(l) AS c RETURN x.uid AS uid, c ORDER BY c DESC, uid LIMIT $n`);
    samples.AssertionEvidenceTrace = evidence.slice(3).map((r) => ({ uid: r.uid, first: 10 }));
    worst.AssertionEvidenceTrace = evidence.slice(0, 3).map((r) => ({ uid: r.uid, first: 25 }));
    const histories = await typical(`MATCH (x:Product)-[:HAS_VARIANT]->()-[:HAS_PACKAGE]->(p)-[:HAS_LABEL_VERSION]->(l) WHERE ${visible} WITH x, count(l) AS c RETURN x.uid AS uid, c ORDER BY c DESC, uid LIMIT $n`);
    samples.ProductLabelHistory = histories.slice(3).map((r) => ({ uid: r.uid, first: 5 }));
    worst.ProductLabelHistory = histories.slice(0, 3).map((r) => ({ uid: r.uid, first: 10 }));
    const packages = await typical(`MATCH (x:Package)-[:HAS_LABEL_VERSION]->(l) WHERE ${visible} WITH x, count(l) AS c RETURN x.uid AS uid, c ORDER BY c DESC, uid LIMIT $n`);
    samples.PackageLabelHistoryPage = packages.slice(3).map((r) => ({ packageUid: r.uid, first: 10 }));
    worst.PackageLabelHistoryPage = packages.slice(0, 3).map((r) => ({ packageUid: r.uid, first: 25, after: encodeCursorOffset(10) }));
    const claims = await typical(`MATCH (a:Assertion)-[:OCCURRENCE_OF]->(x:Claim) WHERE ${visible} WITH x, count(a) AS c RETURN x.uid AS uid, c ORDER BY c DESC, uid LIMIT $n`);
    samples.ClaimView = claims.slice(3).map((r) => ({ uid: r.uid, first: 10 }));
    worst.ClaimView = claims.slice(0, 3).map((r) => ({ uid: r.uid, first: 25 }));
    const reports = await typical(`MATCH (x:Report) WHERE ${visible} OPTIONAL MATCH (x)-[:DERIVED_FROM]->(a:Assertion) WITH x, count(a) AS c RETURN x.uid AS uid, c ORDER BY c DESC, uid LIMIT $n`);
    samples.ReportView = reports.slice(3).map((r) => ({ uid: r.uid, first: 10 }));
    worst.ReportView = reports.slice(0, 3).map((r) => ({ uid: r.uid, first: 25 }));
    const idents = await typical(`MATCH (s)-[:HAS_IDENTIFIER]->(x:Identifier) WHERE ${visible} WITH x, count(s) AS c RETURN x.scheme AS scheme, x.value AS value, c ORDER BY c DESC, value LIMIT $n`);
    samples.ResolveIdentifier = idents.slice(3).map((r) => ({ scheme: r.scheme, value: r.value }));
    worst.ResolveIdentifier = idents.slice(0, 3).map((r) => ({ scheme: r.scheme, value: r.value }));
    return { samples, worst };
  } finally {
    await s.close();
  }
}

export interface ActorSigner {
  publicPem: string;
  token(vis?: string[]): Promise<string>;
}

export function actorSigner(): ActorSigner {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const key: KeyObject = privateKey;
  return {
    publicPem: publicKey.export({ type: "spki", format: "pem" }).toString(),
    async token(vis = ["PUBLIC"]) {
      const now = Math.floor(Date.now() / 1000);
      return new SignJWT({ ctx: "bks-actor-context.v1", vis, app: "bench" })
        .setProtectedHeader({ alg: "EdDSA", typ: "bks-actor+jwt" })
        .setIssuer("bks-product-bff")
        .setAudience("bks-graphql-api")
        .setSubject("bench-user")
        .setJti(randomUUID())
        .setIssuedAt(now)
        .setExpirationTime(now + 110)
        .sign(key);
    },
  };
}

export interface ServerChild {
  child: ChildProcess;
  url: string;
  healthzMs: number;
  readyzMs: number;
  readyReport: unknown;
  memory(): Promise<{ rss: number; heapUsed: number; heapTotal: number; maxRss: number; eventLoopP99Ms: number; gc: { count: number; totalMs: number; maxMs: number } }>;
  stop(): Promise<void>;
}

/** Starts dist/main.js as a separate process (NODE_ENV=production) with an IPC memory probe preloaded. */
export async function startServerChild(signer: ActorSigner, port: number, extraEnv: Record<string, string> = {}): Promise<ServerChild> {
  const started = performance.now();
  const env = {
    PATH: process.env.PATH ?? "",
    SystemRoot: process.env.SystemRoot ?? "",
    NODE_ENV: "production",
    PORT: String(port),
    BKS_BIOTECH_GRAPH_URI: BENCH_URI,
    BKS_BIOTECH_GRAPH_READER_USERNAME: "neo4j",
    BKS_BIOTECH_GRAPH_READER_PASSWORD: BENCH_PASSWORD,
    BKS_BIOTECH_GRAPH_DATABASE: "neo4j",
    GRAPHQL_API_KEY: BENCH_SERVICE_KEY,
    GRAPHQL_ACTOR_PUBLIC_KEY: signer.publicPem,
    ...extraEnv,
  };
  const child = spawn(process.execPath, ["--expose-gc", "--import", pathToFileURL(join(benchDir, "probe.mjs")).href, join(appDir, "dist", "main.js")], { env, stdio: ["ignore", "pipe", "pipe", "ipc"] });
  let log = "";
  child.stdout!.on("data", (d) => (log += d));
  child.stderr!.on("data", (d) => (log += d));
  const url = `http://127.0.0.1:${port}`;
  let lastBody = "";
  const until = async (path: string, timeoutMs: number) => {
    for (;;) {
      if (child.exitCode !== null) throw new Error(`server exited: ${log.slice(-2000)}`);
      try {
        const r = await fetch(url + path);
        const text = await r.text();
        lastBody = text;
        if (r.status === 200) return { ms: performance.now() - started, body: JSON.parse(text) };
      } catch {
        // not listening yet
      }
      if (performance.now() - started > timeoutMs) throw new Error(`${path} not ready after ${timeoutMs} ms: ${lastBody.slice(0, 3000)} ${log.slice(-2000)}`);
      await new Promise((r) => setTimeout(r, 50));
    }
  };
  const health = await until("/healthz", 120_000);
  const ready = await until("/readyz", Number(process.env.BENCH_READY_TIMEOUT_MS ?? 600_000));
  let seq = 0;
  const memory = () =>
    new Promise<{ rss: number; heapUsed: number; heapTotal: number; maxRss: number; eventLoopP99Ms: number; gc: { count: number; totalMs: number; maxMs: number } }>((resolve) => {
      const id = ++seq;
      const onMessage = (m: { id?: number; memory?: never }) => {
        if (m.id !== id) return;
        child.off("message", onMessage);
        resolve(m.memory!);
      };
      child.on("message", onMessage);
      child.send({ id, op: "memory" });
    });
  return {
    child,
    url,
    healthzMs: health.ms,
    readyzMs: ready.ms,
    readyReport: ready.body,
    memory,
    stop: async () => {
      child.kill("SIGTERM");
      await new Promise((r) => child.once("exit", r));
    },
  };
}
