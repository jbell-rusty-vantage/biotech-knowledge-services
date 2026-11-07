#!/usr/bin/env node
/**
 * Assembles the candidate schema from module files: header, kernel, then modules in domain order, then an optional
 * seam-closure file. Deterministic; the output records the module list and each module's digest.
 *
 *   node scripts/assemble-schema.mjs [--modules schema/program/final/schema] [--out schema/program/final/schema/final_biotech_schema_v2.graphql]
 *
 * Module file names: kernel.graphql, D1.graphql … D13.graphql (or <id>-<slug>.graphql), seam-closure.graphql (optional).
 * Fails when two modules declare the same type name. This script keeps the candidate run-record format (it reproduces
 * the baseline sha256 c7cf1235… from schema/program/final/schema); release assembly is scripts/release/generate.mjs,
 * which shares the same assembler (scripts/release/lib/assemble.mjs) and adds per-definition module metadata.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { assembleModules, candidateHeader } from "./release/lib/assemble.mjs";

const args = process.argv.slice(2);
const opt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const modulesDir = resolve(opt("--modules", "schema/program/final/schema"));
const out = resolve(opt("--out", resolve(modulesDir, "final_biotech_schema_v2.graphql")));
if (!existsSync(modulesDir)) {
  console.error(`modules directory not found: ${modulesDir}`);
  process.exit(1);
}
const files = readdirSync(modulesDir).filter((f) => f.endsWith(".graphql") && !f.startsWith("final_"));
let assembled;
try {
  assembled = assembleModules(files.map((f) => ({ file: f, text: readFileSync(resolve(modulesDir, f), "utf8") })), { header: candidateHeader });
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
writeFileSync(out, assembled.text, "utf8");
const manifest = { out: basename(out), modules: assembled.modules.map((m) => ({ file: m.file, sha256: m.sha256, definitions: m.definitions })), sha256: assembled.sha256 };
writeFileSync(`${out}.manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ok: true, out, modules: assembled.modules.length, types: assembled.types, sha256: assembled.sha256 }, null, 2));
