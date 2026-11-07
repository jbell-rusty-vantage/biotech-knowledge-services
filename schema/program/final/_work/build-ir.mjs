#!/usr/bin/env node
// Builds the schema IR of an SDL with the same parseSchema call the `bks-schema map` command uses
// (packages/schema-workspace/src/cli.ts, case "map"): pinned sidecars for identity keys + validation params.
//   node schema/program/final/_work/build-ir.mjs <C:/abs/sdl.graphql> <C:/abs/out.ir.json>
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const root = resolve(new URL("../../../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const ws = await import(pathToFileURL(resolve(root, "packages/schema-workspace/dist/index.js")).href);
const [sdlPath, outPath] = process.argv.slice(2);
if (!sdlPath || !outPath) { console.error("usage: build-ir.mjs <sdl> <out.json>"); process.exit(1); }
const sidecars = ws.loadSidecars();
const params = ws.readValidationParams();
const identityKeys = Object.fromEntries(Object.entries(sidecars.identityRules.types).map(([t, r]) => [t, r.nameProperties ?? []]));
const ir = ws.parseSchema(readFileSync(resolve(sdlPath), "utf8"), { params, identityKeys });
writeFileSync(resolve(outPath), `${JSON.stringify(ir, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ok: true, out: resolve(outPath), schemaDigest: ir.schemaDigest, nodes: ir.nodes.length, keys: Object.keys(ir) }));
