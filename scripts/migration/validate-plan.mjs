#!/usr/bin/env node
// Validates a migration plan directory against the bks-migration-manifest.v1 and bks-migration-accounting.v1 JSON Schemas
// and re-checks that the accounting records reconcile to the export counts.
//
//   node scripts/migration/validate-plan.mjs --plan <planDir>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { REPO_ROOT, parseArgs, readJsonl } from "./lib/common.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.plan) throw new Error("--plan <planDir> is required");
const planDir = path.resolve(args.plan);
// ajv is present in the pnpm store as a transitive dependency; it is resolved from there (no new dependency is added).
const store = path.join(REPO_ROOT, "node_modules", ".pnpm");
const ajvDir = fs.readdirSync(store).find((d) => /^ajv@8\./.test(d));
if (!ajvDir) throw new Error("ajv@8 not found in the pnpm store; install dependencies with pnpm");
const require = createRequire(path.join(store, ajvDir, "node_modules", "ajv", "package.json"));
const Ajv2020 = require("ajv/dist/2020").default;
const ajv = new Ajv2020({ allErrors: true, strict: false });
const load = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const schemaDir = path.join(REPO_ROOT, "scripts", "migration", "schemas");
const manifestSchema = load(path.join(schemaDir, "bks-migration-manifest.v1.schema.json"));
const accountingSchema = load(path.join(schemaDir, "bks-migration-accounting.v1.schema.json"));
const vManifest = ajv.compile(manifestSchema);
const vAccounting = ajv.compile(accountingSchema);
const vRecord = ajv.compile({ ...accountingSchema.$defs.record, $defs: accountingSchema.$defs });

const manifest = load(path.join(planDir, "migration-manifest.json"));
const accounting = load(path.join(planDir, "accounting.json"));
const results = [];
results.push({ check: "manifest.schema", ok: vManifest(manifest), errors: vManifest.errors?.slice(0, 10) ?? [] });
results.push({ check: "accounting.schema", ok: vAccounting(accounting), errors: vAccounting.errors?.slice(0, 10) ?? [] });
let bad = 0;
const totals = { node: {}, relationship: {} };
let lines = 0;
for (const rec of readJsonl(path.join(planDir, "accounting-records.jsonl"))) {
  lines++;
  if (!vRecord(rec)) bad++;
  totals[rec.record][rec.category] = (totals[rec.record][rec.category] ?? 0) + 1;
}
results.push({ check: "records.schema", ok: bad === 0, invalid: bad, lines });
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
results.push({ check: "records.reconcile.nodes", ok: sum(totals.node) === manifest.source.counts.nodes, expected: manifest.source.counts.nodes, actual: sum(totals.node) });
results.push({ check: "records.reconcile.relationships", ok: sum(totals.relationship) === manifest.source.counts.relationships, expected: manifest.source.counts.relationships, actual: sum(totals.relationship) });
for (const k of ["migrated", "unchanged-retained", "held", "excluded"]) {
  results.push({ check: `records.totals.nodes.${k}`, ok: (totals.node[k] ?? 0) === accounting.totals.nodes[k] });
  results.push({ check: `records.totals.relationships.${k}`, ok: (totals.relationship[k] ?? 0) === accounting.totals.relationships[k] });
}
const ok = results.every((r) => r.ok);
console.log(JSON.stringify({ ok, passed: results.filter((r) => r.ok).length, total: results.length, failed: results.filter((r) => !r.ok) }, null, 2));
process.exit(ok ? 0 : 1);
