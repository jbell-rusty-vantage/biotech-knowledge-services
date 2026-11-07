import { execFileSync } from "node:child_process";
import { parse, Kind } from "graphql";
import { buildExecutable, loadProjectionManifest } from "../src/projection.js";
import { loadConsumerSourceSdl } from "../src/release.js";
import { stats } from "./common.js";

/**
 * Executable-schema build measurement (SPECIFICATION 5.3). The parent runs three fresh child processes per variant
 * (each: one in-process build, then peak RSS and retained heap after GC) and reports the median build time.
 *   pnpm api:bench:build            -> JSON on stdout
 */
const variant = process.argv.includes("--uncut") ? "uncut" : "shipped";

async function child(): Promise<void> {
  const source = loadConsumerSourceSdl({ log: () => {} });
  const { manifest, bytes } = loadProjectionManifest();
  const m = variant === "uncut" ? { ...manifest, scalarCuts: { ...manifest.scalarCuts, filter: {}, sort: {} } } : manifest;
  const rssBefore = process.memoryUsage().rss;
  const build = await buildExecutable(source.sdl, m, {}, { manifestBytes: bytes });
  (globalThis as { gc?: () => void }).gc?.();
  const mem = process.memoryUsage();
  const doc = parse(build.projectedSdl);
  const nodeTypes = doc.definitions.filter((d) => d.kind === Kind.OBJECT_TYPE_DEFINITION && (d.directives ?? []).some((x) => x.name.value === "node")).length;
  const relTypes = new Set<string>();
  for (const d of doc.definitions) {
    if (d.kind !== Kind.OBJECT_TYPE_DEFINITION && d.kind !== Kind.INTERFACE_TYPE_DEFINITION) continue;
    for (const f of d.fields ?? []) {
      const v = f.directives?.find((x) => x.name.value === "relationship")?.arguments?.find((a) => a.name.value === "type")?.value;
      if (v?.kind === Kind.STRING) relTypes.add(v.value);
    }
  }
  const lines = build.printed.split("\n");
  const count = (k: string) => lines.filter((l) => l.startsWith(`${k} `)).length;
  console.log(
    JSON.stringify({
      buildMs: Math.round(build.buildMs),
      peakRssMb: Math.round(process.resourceUsage().maxRSS / 1024),
      rssBeforeMb: Math.round(rssBefore / 1024 / 1024),
      retainedHeapMb: Math.round(mem.heapUsed / 1024 / 1024),
      rssAfterGcMb: Math.round(mem.rss / 1024 / 1024),
      executableBytes: Buffer.byteLength(build.printed),
      types: count("type"),
      inputs: count("input"),
      enums: count("enum"),
      interfaces: count("interface"),
      unions: count("union"),
      queryRootFields: Object.keys(build.schema.getQueryType()!.getFields()).length,
      nodeTypes,
      relationshipTypes: relTypes.size,
      executableGraphqlDigest: build.identity.executableGraphqlDigest,
      releaseId: source.releaseId,
      schemaDigest: source.schemaDigest,
    }),
  );
}

if (process.argv.includes("--child")) {
  await child();
} else {
  const runs: Array<Record<string, number | string>> = [];
  for (let i = 0; i < 3; i++) {
    const out = execFileSync(process.execPath, ["--expose-gc", "--import", "tsx", new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "--child", ...(variant === "uncut" ? ["--uncut"] : [])], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    runs.push(JSON.parse(out.trim().split("\n").pop()!));
  }
  const ms = runs.map((r) => Number(r.buildMs));
  const peak = runs.map((r) => Number(r.peakRssMb));
  console.log(JSON.stringify({ variant, runs, buildMs: stats(ms), peakRssMb: stats(peak), cpu: process.arch, node: process.version }, null, 2));
}
