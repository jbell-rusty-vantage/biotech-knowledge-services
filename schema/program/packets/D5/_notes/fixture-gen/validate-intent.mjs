import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const repo = process.argv[2];
const m = await import(pathToFileURL(repo + "/packages/contracts/dist/index.js").href);
for (const f of process.argv.slice(3)) {
  const j = JSON.parse(readFileSync(f, "utf8"));
  const r = m.IngestionIntent.safeParse(j);
  console.log(f.split(/[\/]/).slice(-2).join("/"), r.success ? "VALID" : "INVALID", r.success ? `${j.proposals.length} proposals` : JSON.stringify(r.error.issues.slice(0, 5)));
}
