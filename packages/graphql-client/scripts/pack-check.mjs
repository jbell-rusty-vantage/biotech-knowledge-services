#!/usr/bin/env node
/**
 * Packs @bks/graphql-client, installs the tarball into a fresh temp project OUTSIDE the monorepo, imports it, runs a
 * call through an injected transport, type-checks a consumer with DOM-only typings (no Node types), and scans the
 * packed JavaScript for anything that must never reach a web/Expo bundle.
 *   pnpm client:pack-check      (after pnpm build)
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkg = join(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" && cmd === "pnpm" });
const out = mkdtempSync(join(tmpdir(), "bks-client-pack-"));
run("pnpm", ["pack", "--pack-destination", out], pkg);
const tgz = readdirSync(out).find((f) => f.endsWith(".tgz"));
if (!tgz) throw new Error("pnpm pack produced no tarball");
const tarball = join(out, tgz);
const listing = run("tar", ["-tzf", tgz], out).split(/\r?\n/).filter(Boolean);

const consumer = mkdtempSync(join(tmpdir(), "bks-client-consumer-"));
writeFileSync(
  join(consumer, "package.json"),
  JSON.stringify({ name: "bks-client-consumer", private: true, type: "module", dependencies: { "@bks/graphql-client": `file:${tarball.replace(/\\/g, "/")}` }, devDependencies: { typescript: "5.9.3" } }, null, 2),
);
run("pnpm", ["install", "--prefer-offline", "--ignore-workspace", "--config.confirmModulesPurge=false"], consumer);
writeFileSync(
  join(consumer, "smoke.mjs"),
  `import { createBiotechClient, compatibility, ProductCardDocument, PartialDataError } from "@bks/graphql-client";
const transport = async (req) => ({ status: 200, headers: { get: (n) => n === "x-bks-executable-graphql-digest" ? compatibility.executableGraphqlDigest : null }, text: async () => JSON.stringify({ data: { products: [] }, echo: JSON.parse(req.body) }) });
const client = createBiotechClient({ endpoint: "https://bff.example/graphql", transport, credentials: () => "session" });
const data = await client.execute(ProductCardDocument, { uid: "hu:product:1" });
const partial = await createBiotechClient({ endpoint: "x", transport: async () => ({ status: 200, headers: { get: () => null }, text: async () => JSON.stringify({ data: { products: [] }, errors: [{ message: "x" }] }) }) }).execute(ProductCardDocument, { uid: "hu:product:1" }).catch((e) => e);
console.log(JSON.stringify({ ok: Array.isArray(data.products), partial: partial instanceof PartialDataError, releaseId: compatibility.releaseId, executableGraphqlDigest: compatibility.executableGraphqlDigest, operationRegistryDigest: compatibility.operationRegistryDigest, operations: Object.keys(compatibility.operations).length }));
`,
);
const smoke = JSON.parse(run(process.execPath, ["smoke.mjs"], consumer).trim());
writeFileSync(
  join(consumer, "typed.ts"),
  `import { createBiotechClient, ResolveIdentifierDocument, type ResolveIdentifierQuery } from "@bks/graphql-client";
const client = createBiotechClient({ endpoint: "https://bff.example/graphql" });
export async function lookup(): Promise<ResolveIdentifierQuery> {
  const r = await client.execute(ResolveIdentifierDocument, { scheme: "gtin", value: "1" });
  const first: string | undefined = r.identifiers[0]?.identifies[0]?.uid;
  void first;
  return r;
}
`,
);
writeFileSync(join(consumer, "tsconfig.json"), JSON.stringify({ compilerOptions: { strict: true, target: "ES2022", module: "NodeNext", moduleResolution: "NodeNext", lib: ["ES2022", "DOM"], types: [], noEmit: true, skipLibCheck: false }, files: ["typed.ts"] }));
let typecheck = "passed";
try {
  run(process.execPath, [join(consumer, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.json"], consumer);
} catch (error) {
  typecheck = `FAILED: ${error.stdout ?? error.message}`;
}

const installed = join(consumer, "node_modules", "@bks", "graphql-client", "dist");
const forbidden = [/from\s+["'](node:)?(fs|path|crypto|child_process|os|net|http|https)["']/, /neo4j-driver/, /@neo4j\/graphql/, /@apollo\/server/, /dotenv/, /process\.env/, /BEGIN [A-Z ]*PRIVATE KEY/, /express/];
const findings = [];
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(m?js|d\.ts)$/.test(e.name)) {
      const text = readFileSync(p, "utf8");
      for (const re of forbidden) if (re.test(text)) findings.push(`${p.slice(installed.length + 1)}: ${re}`);
    }
  }
};
walk(installed);
const deps = JSON.parse(readFileSync(join(consumer, "node_modules", "@bks", "graphql-client", "package.json"), "utf8")).dependencies ?? {};
const jsBytes = listing.filter((f) => f.endsWith(".js")).length;
const report = { tarball: tgz, files: listing.length, jsFiles: jsBytes, runtimeDependencies: deps, smoke, typecheck, forbiddenFindings: findings, consumerDir: "<os tmpdir>" };
console.log(JSON.stringify(report, null, 2));
if (findings.length || typecheck !== "passed" || !smoke.ok || !smoke.partial) process.exit(1);
mkdirSync(join(pkg, "..", "..", "apps", "graphql-api", "benchmarks"), { recursive: true });
