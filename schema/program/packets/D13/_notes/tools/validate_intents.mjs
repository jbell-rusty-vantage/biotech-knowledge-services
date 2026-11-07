import { readFileSync, readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
const root = process.argv[2];
const { IngestionIntent } = await import(pathToFileURL(root + "/packages/contracts/dist/index.js").href);
const dir = root + "/schema/program/packets/D13/07-fixtures";
let ok = true;
for (const f of readdirSync(dir)) {
  const j = JSON.parse(readFileSync(`${dir}/${f}/intent.json`, "utf8"));
  const r = IngestionIntent.safeParse(j);
  if (r.success) console.log(`OK   ${f}: ${j.proposals.length} proposals, ${j.subjects.length} subjects, ${j.sources.length} sources`);
  else { ok = false; console.log(`FAIL ${f}:`, JSON.stringify(r.error.issues.slice(0, 5), null, 1)); }
}
process.exit(ok ? 0 : 1);
