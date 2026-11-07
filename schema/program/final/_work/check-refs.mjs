// Dangling-reference check: every named type reference in an assembled SDL resolves to a declared type or a built-in / @neo4j/graphql scalar.
//   node schema/program/final/_work/check-refs.mjs <C:/abs/final_biotech_schema_v2.graphql>
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire("C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/packages/schema-workspace/package.json");
const { parse, visit } = require("graphql");
const text = readFileSync(process.argv[2], "utf8");
// module attribution by banner
const lines = text.split(/\r?\n/); let mod = null; const modOfLine = [];
for (const l of lines) { const m = /^# MODULE (\S+)/.exec(l); if (m) mod = m[1]; modOfLine.push(mod); }
const doc = parse(text);
const declared = new Map();
for (const d of doc.definitions) if (d.name) declared.set(d.name.value, modOfLine[d.loc.startToken.line - 1]);
const builtin = new Set(["String","Int","Float","Boolean","ID","DateTime","Date","LocalDateTime","Time","LocalTime","Duration","Point","CartesianPoint","BigInt"]);
const bad = [];
for (const d of doc.definitions) {
  if (!d.name) continue;
  visit(d, { NamedType(n) { const v = n.name.value; if (!declared.has(v) && !builtin.has(v)) bad.push(`${declared.get(d.name.value)}: ${d.name.value} -> ${v}`); } });
}
console.log(JSON.stringify({ declared: declared.size, dangling: bad }, null, 1));
