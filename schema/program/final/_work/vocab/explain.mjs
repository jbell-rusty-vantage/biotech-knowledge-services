// EXPLAIN every extracted .cypher on the disposable Neo4j (bks-neo4j-synth) with its parameters.
// usage: node explain.mjs <cypher-dir>
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const dir = process.argv[2];
const lit = (v) => (v === null ? "null" : Array.isArray(v) ? `[${v.map(lit).join(", ")}]` : typeof v === "string" ? JSON.stringify(v) : String(v));
let fail = 0;
for (const f of readdirSync(dir).filter((x) => x.endsWith(".cypher")).sort()) {
  const id = f.replace(/\.cypher$/, "");
  const params = JSON.parse(readFileSync(resolve(dir, `${id}.params`), "utf8"));
  const P = `{${Object.entries(params).map(([k, v]) => `${k}: ${lit(v)}`).join(", ")}}`;
  const r = spawnSync("docker", ["exec", "-i", "bks-neo4j-synth", "cypher-shell", "-u", "neo4j", "-p", "bks-test-password", "--format", "verbose", "-P", P], { input: readFileSync(resolve(dir, f), "utf8"), encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const ok = r.status === 0 && /Plan:\s*"EXPLAIN"|Plan: "EXPLAIN"|\+-+\+/.test(out);
  const warnings = [...new Set((out.match(/^.*(warn|deprecat|unknown).*$/gim) || []).map((l) => l.trim().slice(0, 160)))].slice(0, 4);
  const operator = (out.match(/\|\s*\+?(ProduceResults|Sort|Top|EagerAggregation|Projection)[^|]*/) || [""])[0].trim();
  if (!ok) fail++;
  console.log(`${id}: exit ${r.status} ${ok ? "PLANNED" : "FAILED"} ${operator ? "first operator " + operator.replace(/\s+/g, " ") : ""}${warnings.length ? " | notes: " + warnings.join(" / ") : ""}${ok ? "" : "\n" + out.slice(0, 800)}`);
}
console.log(`failed: ${fail}`);
process.exitCode = fail ? 1 : 0;
