// Scratch printer: same library and @limit preparation as apps/graphql-api, plus optional excludeDeprecatedFields.
// usage: node print2.mjs <sdl> <out> [all|none]
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const WT = "C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A1/apps/graphql-api/";
const require = createRequire(WT + "package.json");
const { Neo4jGraphQL } = require("@neo4j/graphql");
const { printSchema } = require("graphql");
const { prepareTypeDefs, schemaOptionsFromEnv } = await import(pathToFileURL(WT + "dist/server.js").href);
const [sdlPath, out, mode = "none"] = process.argv.slice(2);
const opts = schemaOptionsFromEnv({});
const excl = mode === "all" ? { mutationOperations: true, aggregationFilters: true, aggregationFiltersOutsideConnection: true, relationshipFilters: true, attributeFilters: true } : {};
const t0 = Date.now();
const neo = new Neo4jGraphQL({ typeDefs: prepareTypeDefs(readFileSync(sdlPath, "utf8"), opts), features: { excludeDeprecatedFields: excl } });
const schema = await neo.getSchema();
const printed = printSchema(schema);
writeFileSync(out, printed);
const inputs = (printed.match(/^input /gm) || []).length;
console.log(JSON.stringify({ bytes: printed.length, lines: printed.split("\n").length, inputs, ms: Date.now() - t0 }));
