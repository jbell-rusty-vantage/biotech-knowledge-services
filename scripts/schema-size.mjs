#!/usr/bin/env node
/**
 * Executable-schema size report. Reads a schema printed by `pnpm --filter @bks/graphql-api print-schema <abs path>`
 * and the schema IR, and writes a Markdown report attributing generated types and lines to input families and to
 * the declaring node types. Deterministic for a given printed schema.
 *
 *   node scripts/schema-size.mjs runs/executable-schema.graphql [--ir workspace/schema-ir.json] [--out schema/program/size-report.md]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const printed = args.find((a) => !a.startsWith("--"));
if (!printed) {
  console.error("usage: node scripts/schema-size.mjs <printed-schema.graphql> [--ir <schema-ir.json>] [--out <report.md>]");
  process.exit(1);
}
const opt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const irPath = resolve(opt("--ir", "workspace/schema-ir.json"));
const outPath = opt("--out", null);

const text = readFileSync(resolve(printed), "utf8");
const lines = text.split("\n");
const ir = JSON.parse(readFileSync(irPath, "utf8"));
const nodeNames = ir.nodes.map((n) => n.name).sort((a, b) => b.length - a.length);

const FAMILIES = [
  "ConnectOrCreateFieldInput", "CreateFieldInput", "ConnectFieldInput", "DisconnectFieldInput", "DeleteFieldInput", "UpdateFieldInput",
  "UpdateConnectionInput", "ConnectionWhere", "ConnectionSort", "NodeAggregationWhereInput", "AggregationWhereInput", "AggregateInput",
  "SubscriptionWhere", "RelationshipCreateInput", "ConnectOrCreateInput", "ConnectOrCreateWhere", "OnCreateInput", "UniqueWhere", "ConnectWhere",
  "CreateInput", "UpdateInput", "DeleteInput", "DisconnectInput", "ConnectInput", "Where", "Sort", "FieldInput",
  "EnumScalarMutations", "EnumScalarFilters", "RelationshipFilters", "ConnectionFilters", "Filters", "Mutations",
];

const kinds = { input: 0, type: 0, enum: 0, interface: 0, union: 0, scalar: 0 };
const familyCount = new Map();
const familyLines = new Map();
const byNode = new Map();
let current = null;
let currentKind = null;
let currentLines = 0;
const topTypes = [];
const flush = () => {
  if (!current) return;
  if (currentKind === "input") {
    const fam = FAMILIES.find((f) => current.endsWith(f)) ?? "other";
    familyCount.set(fam, (familyCount.get(fam) ?? 0) + 1);
    familyLines.set(fam, (familyLines.get(fam) ?? 0) + currentLines);
  }
  const node = nodeNames.find((n) => current.startsWith(n)) ?? "(shared)";
  const rec = byNode.get(node) ?? { types: 0, lines: 0 };
  rec.types++;
  rec.lines += currentLines;
  byNode.set(node, rec);
  topTypes.push({ name: current, kind: currentKind, lines: currentLines });
  current = null;
};
for (const line of lines) {
  const m = /^(input|type|enum|interface|union|scalar) ([A-Za-z0-9_]+)/.exec(line);
  if (m) {
    flush();
    kinds[m[1]]++;
    current = m[2];
    currentKind = m[1];
    currentLines = 0;
  }
  if (current) currentLines++;
  if (/^}/.test(line)) flush();
}
flush();

const countFields = (typeName) => {
  const start = lines.findIndex((l) => l.startsWith(`type ${typeName} {`) || l.startsWith(`type ${typeName}{`));
  if (start < 0) return 0;
  let n = 0;
  for (let i = start + 1; i < lines.length && !lines[i].startsWith("}"); i++) if (/\(|:/.test(lines[i]) && !lines[i].trim().startsWith('"')) n++;
  return n;
};

const relFields = ir.nodes.reduce((a, n) => a + n.relationships.length, 0);
const triples = ir.relationshipTypes.reduce((a, r) => a + r.triples.length, 0);
const out = [];
out.push("# Executable schema size report");
out.push("");
out.push(`Printed schema: \`${printed}\` · SDL digest \`${ir.schemaDigest}\`.`);
out.push("");
out.push("## Headline");
out.push("");
out.push("| measure | value |");
out.push("| --- | ---: |");
out.push(`| printed size | ${(Buffer.byteLength(text) / 1_048_576).toFixed(1)} MB |`);
out.push(`| printed lines | ${lines.length.toLocaleString("en-US")} |`);
out.push(`| input types | ${kinds.input.toLocaleString("en-US")} |`);
out.push(`| object types | ${kinds.type.toLocaleString("en-US")} |`);
out.push(`| enums | ${kinds.enum} |`);
out.push(`| Query fields | ${countFields("Query")} |`);
out.push(`| Mutation fields | ${countFields("Mutation")} |`);
out.push(`| SDL node types | ${ir.nodes.length} |`);
out.push(`| SDL relationship fields | ${relFields} |`);
out.push(`| SDL from→to pairs | ${triples} |`);
out.push(`| input types per SDL pair | ${(kinds.input / triples).toFixed(1)} |`);
out.push("");
out.push("## Input types by family");
out.push("");
out.push("| family | input types | lines |");
out.push("| --- | ---: | ---: |");
for (const [fam, c] of [...familyCount.entries()].sort((a, b) => (familyLines.get(b[0]) ?? 0) - (familyLines.get(a[0]) ?? 0))) out.push(`| ${fam} | ${c.toLocaleString("en-US")} | ${(familyLines.get(fam) ?? 0).toLocaleString("en-US")} |`);
out.push("");
out.push("## Generated lines attributed to the declaring SDL node type (top 40)");
out.push("");
out.push("A generated type is attributed to the SDL node type whose name prefixes it; `(shared)` collects kernel scalars, enums and interface/union families.");
out.push("");
out.push("| node type | generated types | generated lines | SDL relationship fields | widest target |");
out.push("| --- | ---: | ---: | ---: | --- |");
for (const [node, rec] of [...byNode.entries()].sort((a, b) => b[1].lines - a[1].lines).slice(0, 40)) {
  const n = ir.nodes.find((x) => x.name === node);
  const widest = n ? n.relationships.reduce((best, f) => (f.targetKind !== "node" && f.targetMembers.length > best.size ? { name: f.targetType, size: f.targetMembers.length } : best), { name: "—", size: 0 }) : { name: "", size: 0 };
  out.push(`| ${node} | ${rec.types.toLocaleString("en-US")} | ${rec.lines.toLocaleString("en-US")} | ${n ? n.relationships.length : ""} | ${widest.size ? `${widest.name} (${widest.size})` : widest.name} |`);
}
out.push("");
out.push("## Largest generated types (top 25)");
out.push("");
out.push("| type | kind | lines |");
out.push("| --- | --- | ---: |");
for (const t of topTypes.sort((a, b) => b.lines - a.lines).slice(0, 25)) out.push(`| ${t.name} | ${t.kind} | ${t.lines.toLocaleString("en-US")} |`);
out.push("");
const report = `${out.join("\n")}\n`;
if (outPath) {
  mkdirSync(dirname(resolve(outPath)), { recursive: true });
  writeFileSync(resolve(outPath), report, "utf8");
  console.log(`wrote ${resolve(outPath)}`);
} else process.stdout.write(report);
