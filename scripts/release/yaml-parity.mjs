#!/usr/bin/env node
/**
 * TL-04: Node `yaml` 2.x versus PyYAML parse equivalence.
 *
 *   node scripts/release/yaml-parity.mjs <file.yaml> [...] [--json]
 *
 * Each file is parsed by the Node `yaml` package of packages/schema-workspace (YAML 1.2 core schema) and by PyYAML
 * `safe_load` (YAML 1.1) in a throwaway uv environment (`uv run --no-project --with pyyaml python -I`). Both results
 * are serialized as canonical JSON (sorted keys, no whitespace, non-ASCII kept). PyYAML date/datetime values and Node
 * Date values are normalized to ISO strings on both sides and counted (`normalizedDates`); no other normalization is
 * applied, so a YAML 1.1 vs 1.2 difference (yes/no/on/off booleans, sexagesimal or octal numbers) shows as a mismatch.
 * PyYAML date-only values are written back as YYYY-MM-DD (the YAML 1.2 string), datetimes as ISO-8601 UTC with
 * milliseconds; Node strings that YAML 1.1 reads as datetimes get the same ISO form. This is a typing difference
 * (date object vs string) with equal text, reported per file; any other difference is a real mismatch.
 * Prints one row per file {file, nodeSha, pySha, equal, normalizedDates, firstDifference?}; exits 1 on any mismatch
 * or parse failure.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { canonicalJson, sha256Hex, YAML } from "./lib/common.mjs";

const PY = String.raw`
import sys, json, datetime, yaml
counter = [0]
def norm(v):
    if isinstance(v, datetime.datetime):
        counter[0] += 1
        if v.tzinfo is not None:
            v = v.astimezone(datetime.timezone.utc).replace(tzinfo=None)
            s = v.isoformat(timespec="milliseconds") + "Z"
        else:
            s = v.isoformat(timespec="milliseconds") + "Z"
        return s
    if isinstance(v, datetime.date):
        counter[0] += 1
        return v.isoformat()
    if isinstance(v, dict):
        return {str(k) if not isinstance(k, (datetime.date, datetime.datetime)) else norm(k): norm(x) for k, x in v.items()}
    if isinstance(v, list):
        return [norm(x) for x in v]
    return v
out = {}
for path in sys.argv[1:]:
    counter[0] = 0
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = norm(yaml.safe_load(f))
        out[path] = {"ok": True, "json": json.dumps(data, sort_keys=True, ensure_ascii=False, separators=(",", ":")), "dates": counter[0]}
    except Exception as e:
        out[path] = {"ok": False, "error": type(e).__name__ + ": " + str(e)[:500]}
sys.stdout.buffer.write(json.dumps(out, ensure_ascii=False).encode("utf-8"))
`;

/** YAML 1.1 timestamp with a time part (PyYAML resolves these to datetime; YAML 1.2 core keeps a string). */
const TIMESTAMP = /^d{4}-dd?-dd?([Tt]|[ 	]+)dd?:dd:dd(.d+)?([ 	]*(Z|[-+]dd?(:dd)?))?$/;
/**
 * Node side: a Date -> ISO string; a string that YAML 1.1 would read as a timestamp-with-time -> the same ISO form
 * PyYAML datetimes are normalized to (counted). Date-only scalars need no change: PyYAML dates are written back as
 * YYYY-MM-DD, the string YAML 1.2 keeps.
 */
function normNode(v, counter) {
  if (v instanceof Date) {
    counter.n++;
    return v.toISOString();
  }
  if (typeof v === "string" && TIMESTAMP.test(v)) {
    const d = new Date(v.replace(/[ 	]+(?=dd?:)/, "T").replace(/[ 	]+(?=Z|[-+])/, ""));
    if (!Number.isNaN(d.getTime())) {
      counter.n++;
      return d.toISOString();
    }
  }
  if (Array.isArray(v)) return v.map((x) => normNode(x, counter));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, normNode(x, counter)]));
  return v;
}

function firstDiff(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i >= a.length && i >= b.length ? null : { offset: i, node: a.slice(Math.max(0, i - 60), i + 60), python: b.slice(Math.max(0, i - 60), i + 60) };
}

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const files = args.filter((a) => a !== "--json").map((f) => resolve(f));
if (!files.length) {
  console.error("usage: node scripts/release/yaml-parity.mjs <file.yaml> [...] [--json]");
  process.exit(2);
}
let py;
try {
  const stdout = execFileSync("uv", ["run", "--no-project", "--quiet", "--with", "pyyaml", "python", "-I", "-c", PY, ...files], { encoding: "utf8", maxBuffer: 1 << 30, env: { ...process.env, PYTHONUTF8: "1" } });
  py = JSON.parse(stdout);
} catch (error) {
  console.error(`PyYAML run failed: ${error.message}`);
  process.exit(1);
}
const rows = [];
for (const file of files) {
  const counter = { n: 0 };
  let nodeJson;
  let nodeError;
  try {
    nodeJson = canonicalJson(normNode(YAML.parse(readFileSync(file, "utf8")), counter));
  } catch (error) {
    nodeError = error.message;
  }
  const p = py[file];
  // Python json.dumps(sort_keys) and canonicalJson both sort keys by code point; Python writes 1.0 for floats where JS writes 1.
  // Re-serialize the Python JSON through JS so number formatting is identical (the values themselves are compared).
  const pyJson = p?.ok ? canonicalJson(JSON.parse(p.json)) : null;
  const equal = !nodeError && p?.ok && nodeJson === pyJson;
  const row = { file, nodeSha: nodeJson ? sha256Hex(nodeJson) : null, pySha: pyJson ? sha256Hex(pyJson) : null, equal: Boolean(equal), normalizedDates: { node: counter.n, python: p?.dates ?? null } };
  if (nodeError) row.nodeError = nodeError;
  if (p && !p.ok) row.pythonError = p.error;
  if (!equal && nodeJson && pyJson) row.firstDifference = firstDiff(nodeJson, pyJson);
  rows.push(row);
}
if (asJson) console.log(JSON.stringify(rows, null, 2));
else for (const r of rows) console.log(JSON.stringify(r));
process.exit(rows.every((r) => r.equal) ? 0 : 1);
