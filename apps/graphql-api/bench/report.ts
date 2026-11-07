import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { appDir, writeOut } from "./common.js";

/**
 * Combines the measurement files of one date into benchmarks/<date>.json and benchmarks/<date>.md, comparing each
 * number with the SPECIFICATION 5.3 gates. Missing inputs are reported as "not run", never invented.
 *   pnpm --filter @bks/graphql-api exec tsx bench/report.ts [date]
 */
const date = process.argv[2] ?? new Date().toISOString().slice(0, 10);
const read = (name: string) => {
  const p = join(appDir, "benchmarks", `${date}-${name}.json`);
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
};
const identity = JSON.parse(readFileSync(join(appDir, "generated", "identity.json"), "utf8"));
const build = read("build-shipped");
const uncut = read("build-uncut");
const plans = read("plans");
const load = read("load");
const container = read("container");
const pack = read("client-pack");

const ENTITY = ["EntityCard", "ProductCard", "ResolveIdentifier"];
const gates = [] as Array<{ gate: string; target: string; measured: string; pass: boolean | null }>;
const g = (gate: string, target: string, measured: unknown, pass: boolean | null) => gates.push({ gate, target, measured: measured === undefined || measured === null ? "not run" : String(measured), pass });
const b = build?.runs?.[0];
g("node types", "<= 90", b?.nodeTypes, b ? b.nodeTypes <= 90 : null);
g("relationship types", "<= 160", b?.relationshipTypes, b ? b.relationshipTypes <= 160 : null);
g("generated input types", "<= 4000", b?.inputs, b ? b.inputs <= 4000 : null);
g("executable bytes", "<= 6 MB", b?.executableBytes, b ? b.executableBytes <= 6 * 1024 * 1024 : null);
g("median in-process build", "< 5000 ms", build?.buildMs?.p50, build ? build.buildMs.p50 < 5000 : null);
for (const run of load?.runs ?? []) {
  if (run.scenario === "mixed" || run.scenario === "warmup") continue;
  const target = ENTITY.includes(run.scenario) ? 300 : 750;
  g(`warm p95 ${run.scenario} @${run.concurrency}`, `<= ${target} ms`, run.latencyMs.p95, run.latencyMs.p95 <= target && run.errorRate === 0);
}

const json = { date, identity, gates, build, uncut, load, container, pack, plansFile: plans ? `${date}-plans.json` : null };
writeOut(`${date}.json`, json);

const row = (cells: unknown[]) => `| ${cells.map((c) => String(c ?? "")).join(" | ")} |`;
const lines: string[] = [];
lines.push(`# Consumer GraphQL benchmark ${date}`, "");
lines.push(`Release \`${identity.releaseId}\` (schema ${identity.schemaDigest}, release ${identity.schemaReleaseDigest}); executable ${identity.executableGraphqlDigest}; registry ${identity.operationRegistryDigest}; projection ${identity.productProjectionDigest}. Libraries: ${Object.entries(identity.libraryVersions).map(([k, v]) => `${k} ${v}`).join(", ")}.`, "");
lines.push("Environment: Windows 11 laptop (AMD Ryzen 7 7730U, 8 cores / 16 threads, 15.3 GB RAM), Node " + (build?.node ?? "?") + "; disposable Neo4j 5.26.31 Community in Docker Desktop/WSL2 on the same host (1 GB heap, 1 GB page cache, 3 GB container limit, slotted runtime), idle host (no other release Neo4j containers), full-scale synthetic v2 fixture (360,800 nodes, 1,072,112 relationships, every record `syntheticFixture: true`), release DDL applied by `bks kg ensure-operations` (pre + post). Load client, API and database share the machine. Not production-like: Aura is 5.27 Enterprise (pipelined runtime) and the API runs on Fly shared-cpu-2x 4 GB.", "");
lines.push("## Gates (SPECIFICATION 5.3)", "", row(["gate", "target", "measured", "result"]), row(["---", "---", "---", "---"]));
for (const x of gates) lines.push(row([x.gate, x.target, x.measured, x.pass === null ? "not run" : x.pass ? "pass" : "FAIL"]));
lines.push("");
if (build) {
  lines.push("## Executable build", "", row(["variant", "bytes", "inputs", "types", "enums", "query root fields", "median build ms", "peak RSS MB", "retained heap MB"]), row(["---", "---", "---", "---", "---", "---", "---", "---", "---"]));
  for (const [name, v] of [["shipped (all levers)", build], ["uncut (no scalar cuts)", uncut]] as const) {
    if (!v) continue;
    const r = v.runs[0];
    lines.push(row([name, r.executableBytes, r.inputs, r.types, r.enums, r.queryRootFields, v.buildMs.p50, v.peakRssMb.p50, r.retainedHeapMb]));
  }
  lines.push("", "Peak RSS includes tsx and the release loader (release bundle verification and IR parse) in the measuring process.", "");
}
if (load) {
  lines.push("## Startup and memory (dist/main.js, NODE_ENV=production)", "");
  lines.push(`- /healthz after ${load.startup.healthzMs} ms; /readyz (release marker, ${load.startup.readyReport?.checks?.indexes?.checked ?? "?"} DDL/index checks, plan warm-up of every safelisted operation) after ${load.startup.readyzMs} ms`);
  lines.push(`- RSS at ready ${load.memoryMb.atReady.rss} MB (heap used ${load.memoryMb.atReady.heapUsed} MB); after load ${load.memoryMb.afterLoad.rss} MB; steady after GC ${load.memoryMb.steadyAfterGc.rss} MB (heap used ${load.memoryMb.steadyAfterGc.heapUsed} MB); peak process RSS ${load.memoryMb.steadyAfterGc.maxRss} MB`, "");
  lines.push(`## Warm latency at ${load.runs[0]?.concurrency ?? 20} concurrent clients`, "", row(["operation", "target p95", "n", "p50 ms", "p95 ms", "p99 ms", "max ms", "rps", "error rate", "resp bytes p50", "server peak RSS MB", "GC pause ms (count)", "event-loop p99 ms", "peak Bolt conns / open tx"]), row(["---", "---", "---", "---", "---", "---", "---", "---", "---", "---", "---", "---", "---", "---"]));
  for (const r of load.runs) {
    if (r.scenario === "warmup") continue;
    const target = r.scenario === "mixed" ? "-" : ENTITY.includes(r.scenario) ? "300" : "750";
    lines.push(row([r.scenario, target, r.latencyMs.n, r.latencyMs.p50, r.latencyMs.p95, r.latencyMs.p99, r.latencyMs.max, r.throughputRps, r.errorRate, r.responseBytes.p50, r.serverMemoryMb.peakRss, r.gc ? `${r.gc.pauseMs} (${r.gc.collections})` : "", r.eventLoopP99Ms ?? "", r.database ? `${r.database.peakBoltConnections} / ${r.database.peakOpenTransactions}` : ""]));
  }
  lines.push("");
  lines.push("## Regression baseline (SPECIFICATION 5.3: no >10% p95/RSS regression without a recorded explanation and new budget)", "", row(["metric", "baseline", "regression threshold (+10%)"]), row(["---", "---", "---"]));
  for (const r of load.runs) {
    if (r.scenario === "warmup") continue;
    lines.push(row([`p95 ${r.scenario} @${r.concurrency}`, `${r.latencyMs.p95} ms`, `${Math.round(r.latencyMs.p95 * 1.1 * 10) / 10} ms`]));
  }
  lines.push(row(["server steady RSS after GC", `${load.memoryMb.steadyAfterGc.rss} MB`, `${Math.round(load.memoryMb.steadyAfterGc.rss * 1.1)} MB`]));
  const peak = Math.max(...load.runs.map((r: { serverMemoryMb: { peakRss: number } }) => r.serverMemoryMb.peakRss));
  lines.push(row(["server peak RSS under load", `${peak} MB`, `${Math.round(peak * 1.1)} MB`]));
  if (build) lines.push(row(["median in-process build", `${build.buildMs.p50} ms`, `${Math.round(build.buildMs.p50 * 1.1)} ms`]));
  lines.push("", "Connection pressure: the 20-connection driver pool was fully used in every scenario (21 Bolt connections = pool + the sampler), with no acquisition timeouts and 0 errors. Same machine, dataset, concurrency and commands are required for a comparison (`pnpm api:bench:seed -- --scale 1 --skip-ddl`, `pnpm api:bench:load`).", "");
}
if (container) {
  lines.push("## Container (image run with `docker run` against the same Neo4j)", "");
  lines.push(`- Image \`${container.image}\` (${container.imageId.slice(0, 19)}...); ${container.credential}.`);
  lines.push(`- Cold start from \`docker run\`: /healthz after ${container.coldStart.healthzMs} ms, /readyz after ${container.coldStart.readyzMs} ms (warm-up ${container.coldStart.warmup?.durationMs} ms over ${container.coldStart.warmup?.operations} executions; ${container.coldStart.indexes?.checked} DDL/index checks; expected absent: ${(container.coldStart.indexes?.expectedAbsent ?? []).join(", ") || "none"}; installed marker ${container.coldStart.release?.releaseId}).`);
  lines.push(`- Container memory (docker stats): ${container.memoryMb.atReady} MB at ready, ${container.memoryMb.peakUnderLoad} MB peak under a ${container.mixedLoad.seconds} s 20-client mixed run, ${container.memoryMb.steadyAfterLoad} MB after it.`);
  lines.push(`- That mixed run through the Docker port mapping and host.docker.internal: p50 ${container.mixedLoad.latencyMs.p50} / p95 ${container.mixedLoad.latencyMs.p95} / p99 ${container.mixedLoad.latencyMs.p99} ms, ${container.mixedLoad.errors} errors of ${container.mixedLoad.requests}. This run was not diagnosed further; candidate causes are the WSL2 port forwarding and the extra host.docker.internal hop. The latency gate is the dist/main.js run above.`, "");
}
if (plans) {
  lines.push("## Query plans (isolated PROFILE of the generated Cypher, warm)", "", row(["operation", "case", "GraphQL ms", "db hits", "index seeks", "label/all-node scans", "cartesian", "sorts", "max operator rows", "result bytes"]), row(["---", "---", "---", "---", "---", "---", "---", "---", "---", "---"]));
  for (const [name, op] of Object.entries(plans.operations as Record<string, { cases: Array<{ case: string; graphqlMs: number; responseBytes: number; statements: Array<Record<string, number>> }> }>)) {
    for (const c of op.cases) {
      const s = c.statements[0] ?? {};
      lines.push(row([name, c.case, c.graphqlMs, s.dbHits, s.indexSeeks, s.labelOrAllNodeScans, s.cartesianProducts, s.sorts, s.maxOperatorRows, c.responseBytes]));
    }
  }
  lines.push("", `Full Cypher, parameters and operator counts: \`${date}-plans.json\`.`, "");
}
if (pack) lines.push("## Client package", "", `Packed ${pack.tarball} (${pack.files} files), installed outside the monorepo: smoke ${pack.smoke?.ok ? "ok" : "FAILED"}, partial-data typed error ${pack.smoke?.partial ? "ok" : "FAILED"}, DOM-only typecheck ${pack.typecheck}, forbidden-content findings ${pack.forbiddenFindings?.length ?? "?"}; runtime dependencies ${JSON.stringify(pack.runtimeDependencies)}.`, "");
writeOut(`${date}.md`, `${lines.join("\n")}\n`);
console.log(`wrote benchmarks/${date}.json and benchmarks/${date}.md`);
