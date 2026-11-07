// Dump facts from the assembled SDL that the vocabulary files must agree with.
// usage: node sdl-facts.mjs <worktree> <out.json>
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const wt = process.argv[2];
const out = process.argv[3];
const require = createRequire(resolve(wt, "packages/schema-workspace/package.json"));
const { parse } = require("graphql");
const sdlPath = resolve(wt, "schema/program/final/schema/final_biotech_schema_v2.graphql");
const text = readFileSync(sdlPath, "utf8");
const doc = parse(text);
const enums = {};
const types = {};
const relTypes = {};
const labels = new Set();
const unions = {};
const unwrap = (t) => (t.kind === "NamedType" ? t.name.value : unwrap(t.type));
for (const d of doc.definitions) {
  if (d.kind === "EnumTypeDefinition") enums[d.name.value] = d.values.map((v) => v.name.value);
  if (d.kind === "UnionTypeDefinition") unions[d.name.value] = d.types.map((t) => t.name.value);
  if (d.kind === "ObjectTypeDefinition" || d.kind === "InterfaceTypeDefinition") {
    const fields = {};
    let nodeLabels = null;
    for (const dir of d.directives || []) {
      if (dir.name.value === "node") {
        const a = dir.arguments.find((x) => x.name.value === "labels");
        if (a) nodeLabels = a.value.values.map((v) => v.value);
      }
    }
    if (nodeLabels) nodeLabels.forEach((l) => labels.add(l));
    for (const f of d.fields || []) {
      const rel = (f.directives || []).find((x) => x.name.value === "relationship");
      let relInfo = null;
      if (rel) {
        const get = (n) => rel.arguments.find((x) => x.name.value === n)?.value;
        relInfo = { type: get("type").value, direction: get("direction").value, properties: get("properties")?.value ?? null };
        (relTypes[relInfo.type] ||= []).push({ from: d.name.value, field: f.name.value, to: unwrap(f.type), direction: relInfo.direction, properties: relInfo.properties });
      }
      fields[f.name.value] = { type: unwrap(f.type), rel: relInfo };
    }
    types[d.name.value] = { kind: d.kind, labels: nodeLabels, fields, interfaces: (d.interfaces || []).map((i) => i.name.value) };
  }
}
const facts = {
  sdl: sdlPath.replace(/\\/g, "/"),
  sha256: createHash("sha256").update(text).digest("hex"),
  bytes: Buffer.byteLength(text),
  enums, unions, labels: [...labels].sort(), relTypes, types,
};
writeFileSync(out, JSON.stringify(facts, null, 1));
console.log(JSON.stringify({ sha256: facts.sha256, bytes: facts.bytes, enums: Object.keys(enums).length, unions: Object.keys(unions).length, nodeTypes: Object.values(types).filter((t) => t.labels).length, relationshipTypes: Object.keys(relTypes).length, labels: facts.labels.length }));
