#!/usr/bin/env node
/**
 * Offline deny-list completeness check for the reader roles (packages/kg-ops/src/read/rbac.ts readerRoleStatements).
 *
 *   node packages/kg-ops/scripts/rbac-completeness.mjs <inventory.json> [--json]
 *
 * <inventory.json>: { functions: string[], procedures: string[] } (names, e.g. captured read-only with
 * `SHOW FUNCTIONS YIELD name` / `SHOW PROCEDURES YIELD name`). Needs `pnpm build` (imports packages/kg-ops/dist).
 *
 * For both roles (bks_reader_internal, bks_reader_public) it derives the DENY EXECUTE FUNCTION / PROCEDURE globs from
 * the generated statements and checks, with Neo4j glob semantics (`*` any sequence, `?` one character):
 *   - every apoc.* / gds.* / genai.* / ai.* function except the allowed APOC functions is denied;
 *   - every procedure except the read allowlist (db.index.fulltext.queryNodes + the informational dbms procedures)
 *     is denied.
 * Exit 0 when both roles have zero gaps; exit 1 otherwise (gaps printed).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const here = new URL(".", import.meta.url);
const file = process.argv[2];
if (!file) {
  console.error("usage: node packages/kg-ops/scripts/rbac-completeness.mjs <inventory.json> [--json]");
  process.exit(2);
}
const inv = JSON.parse(readFileSync(resolve(file), "utf8"));
const kg = await import(pathToFileURL(resolve(new URL("..", here).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "dist", "index.js")).href);
const model = kg.ReadModel.fromRelease();

const PROCEDURE_ALLOWLIST = [...kg.PROCEDURE_ALLOWLIST, ...kg.ALLOWED_DBMS_PROCEDURES].sort();
const FUNCTION_ALLOWLIST = [...kg.ALLOWED_APOC_FUNCTIONS].sort();
const GOVERNED_FUNCTION = /^(apoc|gds|genai|ai)\./;

const globRe = (g) => new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".")}$`);
const globsOf = (statements, kind) =>
  statements
    .filter((s) => s.startsWith(`DENY EXECUTE ${kind} `) && !s.startsWith("DENY EXECUTE BOOSTED"))
    .flatMap((s) => s.slice(`DENY EXECUTE ${kind} `.length).replace(/ ON DBMS TO .*$/, "").split(",").map((x) => x.trim()))
    .filter(Boolean);

const report = { inventory: resolve(file), server: inv.server ?? null, apocVersion: inv.apocVersion ?? null, releaseId: model.releaseId, roles: {} };
let total = 0;
for (const scope of ["internal", "public"]) {
  const st = kg.readerRoleStatements(model, scope);
  const fGlobs = globsOf(st, "FUNCTION").map(globRe);
  const pGlobs = globsOf(st, "PROCEDURE").map(globRe);
  const fGaps = (inv.functions ?? []).filter((f) => GOVERNED_FUNCTION.test(f) && !FUNCTION_ALLOWLIST.includes(f) && !fGlobs.some((g) => g.test(f))).sort();
  const pGaps = (inv.procedures ?? []).filter((p) => !PROCEDURE_ALLOWLIST.includes(p) && !pGlobs.some((g) => g.test(p))).sort();
  const deniedAllowed = [...(inv.functions ?? []).filter((f) => FUNCTION_ALLOWLIST.includes(f) && fGlobs.some((g) => g.test(f))), ...(inv.procedures ?? []).filter((p) => PROCEDURE_ALLOWLIST.includes(p) && pGlobs.some((g) => g.test(p)))];
  report.roles[kg.READER_ROLES[scope]] = { functionGaps: fGaps, procedureGaps: pGaps, allowlistAccidentallyDenied: deniedAllowed, functionsChecked: (inv.functions ?? []).filter((f) => GOVERNED_FUNCTION.test(f)).length, proceduresChecked: (inv.procedures ?? []).length };
  total += fGaps.length + pGaps.length + deniedAllowed.length;
}
report.gaps = total;
report.allowlists = { procedures: PROCEDURE_ALLOWLIST, functions: FUNCTION_ALLOWLIST };
if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
else {
  for (const [role, r] of Object.entries(report.roles)) {
    console.log(`${role}: ${r.functionGaps.length} function gaps / ${r.functionsChecked} governed functions, ${r.procedureGaps.length} procedure gaps / ${r.proceduresChecked} procedures, ${r.allowlistAccidentallyDenied.length} allowlisted names denied`);
    for (const g of r.functionGaps) console.log(`  function not denied: ${g}`);
    for (const g of r.procedureGaps) console.log(`  procedure not denied: ${g}`);
    for (const g of r.allowlistAccidentallyDenied) console.log(`  allowlisted but denied: ${g}`);
  }
  console.log(`total gaps: ${total}`);
}
process.exit(total ? 1 : 0);
