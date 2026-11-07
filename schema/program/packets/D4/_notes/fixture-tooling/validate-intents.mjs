// node validate-intents.mjs <worktree> <fixtures dir>
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const [wt, fxdir] = process.argv.slice(2);
const { IngestionIntent } = await import(pathToFileURL(join(wt, "packages/contracts/dist/index.js")).href);
let bad = 0;
for (const d of readdirSync(fxdir)) {
  const f = join(fxdir, d, "intent.json");
  if (!existsSync(f)) { console.log(d, "no intent.json"); continue; }
  const j = JSON.parse(readFileSync(f, "utf8"));
  if (!j.schemaVersion) { console.log(d, "note only"); continue; }
  const r = IngestionIntent.safeParse(j);
  if (r.success) console.log(d, "OK", "sources", j.sources.length, "subjects", j.subjects.length, "proposals", j.proposals.length);
  else { bad++; console.log(d, "INVALID", JSON.stringify(r.error.issues.slice(0, 6), null, 0)); }
}
process.exit(bad ? 1 : 0);
