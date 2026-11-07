#!/usr/bin/env node
// Structural validation of every fixture intent (intent*.json under final/fixtures/<packet>/<folder>/, and the packet originals
// for comparison) against biotech-knowledge-intent.v1:
//   (a) the zod contract IngestionIntent from packages/contracts/dist (what the planner parses first), and
//   (b) the exported JSON Schema packages/contracts/json-schema/biotech-knowledge-intent.v1.json (Ajv 2020-12).
// Structural only: names are not checked against any schema here (see plan-candidate.mjs for that).
//   node schema/program/final/_work/validate-intents.mjs   -> final/_work/intent-validation.json
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const PROGRAM = resolve(here, "../..");
const REPO = resolve(PROGRAM, "../..");
const FINAL = join(PROGRAM, "final");
const contracts = await import(pathToFileURL(join(REPO, "packages/contracts/dist/index.js")).href);
const req = createRequire(join(REPO, "packages/contracts/package.json"));
let Ajv2020;
try { Ajv2020 = req("ajv/dist/2020").default; } catch { Ajv2020 = createRequire(join(REPO, "node_modules/.pnpm/ajv@8.20.0/node_modules/ajv/package.json"))("./dist/2020").default; }
const schema = JSON.parse(readFileSync(join(REPO, "packages/contracts/json-schema/biotech-knowledge-intent.v1.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
let formats = "ajv-formats not found (formats ignored)";
try {
  const addFormats = createRequire(join(REPO, "node_modules/.pnpm/ajv-formats@3.0.1_ajv@8.20.0/node_modules/ajv-formats/package.json"))("./dist/index.js").default;
  addFormats(ajv);
  formats = "ajv-formats@3.0.1 (date-time etc. enforced)";
} catch { /* keep the note */ }
const validateJson = ajv.compile(schema);

function intentsUnder(root, layout) {
  const out = [];
  for (const p of readdirSync(root)) {
    const base = layout === "final" ? join(root, p) : join(root, p, "07-fixtures");
    if (!existsSync(base) || !/^(K|D\d{1,2})$/.test(p)) continue;
    for (const f of readdirSync(base, { withFileTypes: true })) {
      if (!f.isDirectory() || f.name.startsWith("_")) continue;
      for (const file of readdirSync(join(base, f.name))) if (/^intent.*\.json$/.test(file)) out.push({ packet: p, folder: f.name, file, path: join(base, f.name, file) });
    }
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

function check(list) {
  return list.map((x) => {
    const raw = JSON.parse(readFileSync(x.path, "utf8"));
    const z = contracts.IngestionIntent.safeParse(raw);
    const j = validateJson(raw);
    const zIssues = z.success ? [] : z.error.issues.slice(0, 8).map((i) => `${i.path.join(".")}: ${i.message}`);
    const jIssues = j ? [] : (validateJson.errors ?? []).slice(0, 8).map((e) => `${e.instancePath} ${e.message}`);
    const kinds = {};
    for (const pr of raw.proposals ?? []) kinds[pr.kind] = (kinds[pr.kind] ?? 0) + 1;
    return { packet: x.packet, folder: x.folder, file: x.file, zod: z.success, jsonSchema: j, proposals: (raw.proposals ?? []).length, subjects: (raw.subjects ?? []).length, sources: (raw.sources ?? []).length, kinds, zIssues, jIssues };
  });
}

const finals = check(intentsUnder(join(FINAL, "fixtures"), "final"));
const originals = check(intentsUnder(join(PROGRAM, "packets"), "packets"));
const count = (l) => ({ files: l.length, zodValid: l.filter((x) => x.zod).length, zodInvalid: l.filter((x) => !x.zod).length, jsonSchemaValid: l.filter((x) => x.jsonSchema).length, jsonSchemaInvalid: l.filter((x) => !x.jsonSchema).length, proposals: l.reduce((a, x) => a + x.proposals, 0) });
const kinds = {};
for (const x of finals) for (const [k, v] of Object.entries(x.kinds)) kinds[k] = (kinds[k] ?? 0) + v;
const cf = count(finals);
const co = count(originals);
const fixturesWithIntent = new Set(finals.map((x) => `${x.packet}/${x.folder}`)).size;
const md = [];
md.push(`Command: \`node schema/program/final/_work/validate-intents.mjs\` (zod \`IngestionIntent.safeParse\` from \`packages/contracts/dist\`, and Ajv 2020-12 over \`packages/contracts/json-schema/biotech-knowledge-intent.v1.json\` with ${formats}).`);
md.push("");
md.push(`| set | intent files | fixtures with an intent | zod valid / invalid | JSON Schema valid / invalid | proposals |`);
md.push(`| --- | --- | --- | --- | --- | --- |`);
md.push(`| final/fixtures (renamed) | ${cf.files} | ${fixturesWithIntent} | ${cf.zodValid} / ${cf.zodInvalid} | ${cf.jsonSchemaValid} / ${cf.jsonSchemaInvalid} | ${cf.proposals} |`);
md.push(`| packets (originals) | ${co.files} | ${new Set(originals.map((x) => `${x.packet}/${x.folder}`)).size} | ${co.zodValid} / ${co.zodInvalid} | ${co.jsonSchemaValid} / ${co.jsonSchemaInvalid} | ${co.proposals} |`);
md.push("");
md.push(`Proposal kinds in the final intents: ${Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", ")}. Structural validity says nothing about names: v1 cannot express Claim / Assessment / Adjudication / Report writes, so those records live in assertions.yaml only (K 08-sources-and-tools, tool:kg-executor gap).`);
const bad = finals.filter((x) => !x.zod || !x.jsonSchema);
if (bad.length) {
  md.push("");
  md.push("Invalid:");
  for (const x of bad) md.push(`- ${x.packet}/${x.folder}/${x.file}: zod ${x.zod ? "ok" : x.zIssues.join("; ")}; JSON Schema ${x.jsonSchema ? "ok" : x.jIssues.join("; ")}`);
}
const fixtureCount = readdirSync(join(FINAL, "fixtures")).filter((p) => /^(K|D\d{1,2})$/.test(p)).reduce((a, p) => a + readdirSync(join(FINAL, "fixtures", p), { withFileTypes: true }).filter((d) => d.isDirectory()).length, 0);
const missing = [];
for (const p of readdirSync(join(FINAL, "fixtures")).filter((p) => /^(K|D\d{1,2})$/.test(p))) for (const d of readdirSync(join(FINAL, "fixtures", p), { withFileTypes: true })) if (d.isDirectory() && !finals.some((x) => x.packet === p && x.folder === d.name)) missing.push(`${p}/${d.name}`);
md.push("");
md.push(`Fixtures without any intent file: ${missing.length ? missing.join(", ") : "none"} (of ${fixtureCount}).`);
const result = { generatedBy: "final/_work/validate-intents.mjs", final: cf, originals: co, fixturesWithIntent, fixturesWithoutIntent: missing, kinds, files: finals, originalFiles: originals.map(({ packet, folder, file, zod, jsonSchema, zIssues, jIssues }) => ({ packet, folder, file, zod, jsonSchema, zIssues, jIssues })), summaryMarkdown: md.join("\n") };
writeFileSync(join(FINAL, "_work", "intent-validation.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ final: cf, originals: co, fixturesWithIntent, fixturesWithoutIntent: missing.length, kinds, invalid: bad.map((x) => `${x.packet}/${x.folder}/${x.file}`) }, null, 1));
