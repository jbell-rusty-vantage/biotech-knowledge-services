import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { loadConsumerSourceSdl, defaultRepoRoot } from "../release.js";
import { appRoot, buildExecutable, libraryVersions, loadProjectionManifest, type ExecutableBuild } from "../projection.js";
import { buildRegistry, deriveScalarCuts } from "../registry-build.js";
import { defaultRegistryPath, loadRegistry } from "../registry.js";
import { sha256Digest } from "../hash.js";
import type { ConsumerSource } from "../release.js";

/**
 * Generated consumer artifacts (all deterministic, no timestamps):
 *   cuts      derive scalar filter/sort cuts from the operation inventory into projection/manifest.json
 *   print     write the printed executable schema (generated/schema.graphql) or `print <file>`
 *   registry  validate and write operations/operations.json, then generated/identity.json
 *   all       cuts, print, registry (the full pipeline; run before client codegen)
 *   check     fail when any generated artifact differs from a fresh generation
 *
 *   pnpm api:generate | pnpm api:projection:cuts | pnpm api:registry | pnpm api:print-schema [file] | pnpm api:check
 */

const app = appRoot();
const repoRoot = defaultRepoRoot();
const manifestPath = join(app, "projection", "manifest.json");
const catalogPath = join(app, "operations", "catalog.json");
const schemaOut = join(app, "generated", "schema.graphql");
const identityOut = join(app, "generated", "identity.json");
const registryOut = defaultRegistryPath();

function countKinds(printed: string): Record<string, number> {
  const counts: Record<string, number> = { type: 0, input: 0, enum: 0, interface: 0, union: 0, scalar: 0 };
  for (const line of printed.split("\n")) {
    const m = /^(type|input|enum|interface|union|scalar) /.exec(line);
    if (m) counts[m[1]!] = (counts[m[1]!] ?? 0) + 1;
  }
  return counts;
}

async function freshBuild(source: ConsumerSource): Promise<ExecutableBuild> {
  const { manifest, bytes } = loadProjectionManifest(manifestPath);
  return buildExecutable(source.sdl, manifest, {}, { manifestBytes: bytes });
}

function identityJson(source: ConsumerSource, build: ExecutableBuild, operationRegistryDigest: string): string {
  const counts = countKinds(build.printed);
  const versions = libraryVersions();
  delete (versions as Record<string, string | undefined>).node;
  const identity = {
    format: "bks-consumer-identity.v1",
    releaseId: source.releaseId,
    sourceMode: source.mode,
    sourcePath: relative(repoRoot, source.sdlPath).replace(/\\/g, "/"),
    schemaDigest: source.schemaDigest,
    schemaReleaseDigest: source.schemaReleaseDigest,
    projectionManifestDigest: build.identity.projectionManifestDigest,
    projectedSdlDigest: build.identity.projectedSdlDigest,
    productProjectionDigest: build.identity.productProjectionDigest,
    executableGraphqlDigest: build.identity.executableGraphqlDigest,
    operationRegistryDigest,
    libraryVersions: versions,
    executable: { bytes: Buffer.byteLength(build.printed), ...counts, queryRootFields: Object.keys(build.schema.getQueryType()!.getFields()).length, mutationRoot: false },
    projection: { ...build.report, omittedFields: build.report.omittedFields.length },
  };
  return `${JSON.stringify(identity, null, 2)}\n`;
}

function write(path: string, text: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text, "utf8");
  console.log(`wrote ${relative(repoRoot, path)} (${Buffer.byteLength(text)} B, ${sha256Digest(text).slice(0, 19)}...)`);
}

async function cuts(source: ConsumerSource): Promise<void> {
  const loaded = loadProjectionManifest(manifestPath);
  const uncutManifest = { ...loaded.manifest, scalarCuts: { ...loaded.manifest.scalarCuts, filter: {}, sort: {} } };
  const uncut = await buildExecutable(source.sdl, uncutManifest);
  const derived = deriveScalarCuts(uncut.schema, uncut.projectedSdl, catalogPath, loaded.manifest);
  const next = { ...loaded.manifest, scalarCuts: { ...loaded.manifest.scalarCuts, filter: derived.filter, sort: derived.sort } };
  const count = (r: Record<string, string[]>) => Object.values(r).reduce((n, l) => n + l.length, 0);
  write(manifestPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`scalar cuts: ${count(derived.filter)} filter, ${count(derived.sort)} sort; kept by inventory: ${derived.kept.filter.length} filter (${derived.kept.filter.join(", ")}), ${derived.kept.sort.length} sort (${derived.kept.sort.join(", ")})`);
}

async function registry(source: ConsumerSource, build: ExecutableBuild): Promise<void> {
  const { manifest } = loadProjectionManifest(manifestPath);
  const result = buildRegistry(catalogPath, build, source, manifest);
  if (result.errors.length) {
    for (const e of result.errors) console.error(`registry: ${e}`);
    throw new Error(`${result.errors.length} registry error(s)`);
  }
  write(registryOut, result.text);
  for (const op of result.registry.operations) console.log(`  ${op.name.padEnd(26)} ${op.id} cost ${op.staticCost} (${op.costClass}) depth ${op.depth}`);
  write(identityOut, identityJson(source, build, sha256Digest(result.text)));
}

async function check(source: ConsumerSource): Promise<void> {
  const build = await freshBuild(source);
  const problems: string[] = [];
  const current = (p: string) => {
    try {
      return readFileSync(p, "utf8");
    } catch {
      return "";
    }
  };
  if (current(schemaOut) !== build.printed) problems.push("generated/schema.graphql is stale");
  const { manifest } = loadProjectionManifest(manifestPath);
  const result = buildRegistry(catalogPath, build, source, manifest);
  if (result.errors.length) problems.push(...result.errors);
  if (current(registryOut) !== result.text) problems.push("operations/operations.json is stale");
  if (current(identityOut) !== identityJson(source, build, sha256Digest(result.text))) problems.push("generated/identity.json is stale");
  const loaded = loadRegistry(registryOut);
  console.log(`executable ${build.identity.executableGraphqlDigest}, registry ${loaded.operationRegistryDigest}`);
  if (problems.length) {
    for (const p of problems) console.error(`check: ${p}`);
    throw new Error("generated consumer artifacts are stale; run pnpm api:generate");
  }
  console.log("generated consumer artifacts are current");
}

const [command = "all", target] = process.argv.slice(2);
const source = loadConsumerSourceSdl();
console.log(`source ${source.mode} ${source.releaseId} ${source.schemaDigest} (${relative(repoRoot, source.sdlPath)})`);
switch (command) {
  case "cuts":
    await cuts(source);
    break;
  case "print": {
    const build = await freshBuild(source);
    write(target ? resolve(target) : schemaOut, build.printed);
    console.log(`executable ${build.identity.executableGraphqlDigest} built in ${Math.round(build.buildMs)} ms`);
    break;
  }
  case "registry": {
    const build = await freshBuild(source);
    await registry(source, build);
    break;
  }
  case "all": {
    await cuts(source);
    const build = await freshBuild(source);
    write(schemaOut, build.printed);
    await registry(source, build);
    console.log(`executable ${build.identity.executableGraphqlDigest} (${Buffer.byteLength(build.printed)} B) built in ${Math.round(build.buildMs)} ms`);
    break;
  }
  case "check":
    await check(source);
    break;
  default:
    console.error(`unknown command ${command}`);
    process.exit(2);
}
