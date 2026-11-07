// Validate every 07-fixtures/*/intent*.json of packet D3 against packages/contracts IngestionIntent (zod).
// usage (from the worktree root): node schema/program/packets/D3/_notes/tools/validate_intents.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const root = process.cwd();
const { IngestionIntent } = await import(pathToFileURL(resolve(root, "packages/contracts/dist/index.js")).href);
const dir = resolve(root, "schema/program/packets/D3/07-fixtures");
let ok = true;
for (const f of readdirSync(dir)) {
  for (const file of readdirSync(resolve(dir, f)).filter((n) => /^intent.*\.json$/.test(n))) {
    const j = JSON.parse(readFileSync(resolve(dir, f, file), "utf8"));
    const r = IngestionIntent.safeParse(j);
    if (r.success) console.log(`OK   ${f}/${file}: ${j.proposals.length} proposals, ${j.subjects.length} subjects, ${j.sources.length} sources, ${j.sources.reduce((n, s) => n + s.locators.length, 0)} locators`);
    else { ok = false; console.log(`FAIL ${f}/${file}:`, JSON.stringify(r.error.issues.slice(0, 8), null, 1)); }
  }
}
process.exit(ok ? 0 : 1);
