// Question id -> lowest declared value across packets/*/02-questions.md (same parse as final/_work/rel-values.mjs; R-08 split ids added).
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const packetsDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../../packets");
const value = new Map(), owner = new Map();
for (const p of readdirSync(packetsDir)) {
  let text; try { text = readFileSync(resolve(packetsDir, p, "02-questions.md"), "utf8"); } catch { continue; }
  let vi = -1;
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("|")) { vi = line.trim() === "" ? vi : -1; continue; }
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells[0] === "id") { vi = cells.indexOf("value"); continue; }
    if (vi < 0 || /^-+:?$/.test(cells[0])) continue;
    const id = cells[0].replace(/[`*]/g, ""), v = Number(cells[vi]);
    if (!/^(Q|CQ)-/.test(id) || !Number.isFinite(v)) continue;
    if (!value.has(id) || v < value.get(id)) { value.set(id, v); }
    owner.set(id, [...new Set([...(owner.get(id) ?? []), p])]);
  }
}
if (!value.has("CQ-PF-03a")) value.set("CQ-PF-03a", 1);
if (!value.has("CQ-PF-03b")) value.set("CQ-PF-03b", 2);
writeFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "values.json"), JSON.stringify(Object.fromEntries([...value].sort()), null, 0));
const ask = process.argv.slice(2);
console.log("ids with a value:", value.size);
for (const id of ask) console.log(id, value.get(id) ?? "NONE", (owner.get(id) ?? []).join(","));
