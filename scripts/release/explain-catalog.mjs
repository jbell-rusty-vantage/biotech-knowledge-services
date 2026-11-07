#!/usr/bin/env node
/**
 * EXPLAIN check for the release query catalog on a disposable Neo4j (never Aura).
 *
 *   node scripts/release/explain-catalog.mjs [--release <dir>] [--uri neo4j://localhost:7693] [--user neo4j]
 *        [--password bks-test-password] [--ddl <dir>/ddl/required.cypher] [--out <file>]
 *
 * Builds the templates with buildCatalog (explain: null), optionally applies the required DDL first, then runs
 * `EXPLAIN <statement>` per template with typed dummy parameters (empty graph; unknown label/property warnings are
 * expected). GDS algorithm/drop calls are skipped (GDS is optional, OD-22); a `gds.graph.project(...)` projection is
 * EXPLAINed as its source query with the call rewritten to a list. Writes bks-query-explain.v1 (sorted, no timestamps)
 * to --out (default runs/release-v2/custody/s1/explain-<releaseId>.json). It never writes into a release: a target
 * inside schema/pinned/** or inside any directory that holds a release.json or PIN.json is refused. A release's own
 * evidence (query-catalog/explain.json) is (re)written only by scripts/release/generate.mjs --explain-from <file>.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { createRequire } from "node:module";
import { relative, resolve } from "node:path";
import { arg, BKS_ROOT, CURRENT_RELEASE_DIR, prettyJson, writeFileEnsured, YAML } from "./lib/common.mjs";
import { buildCatalog, dummyValue } from "./lib/catalog.mjs";

const releaseDir = resolve(arg("--release", CURRENT_RELEASE_DIR));
const uri = arg("--uri", "neo4j://localhost:7693");
const user = arg("--user", "neo4j");
const password = arg("--password", process.env.NEO4J_TEST_PASSWORD ?? "bks-test-password");
const ddlPath = arg("--ddl", null);
const releaseIdOf = () => {
  try {
    return JSON.parse(readFileSync(resolve(releaseDir, "release.json"), "utf8")).releaseId;
  } catch {
    return "release";
  }
};
const outPath = resolve(arg("--out", resolve(BKS_ROOT, "runs", "release-v2", "custody", "s1", `explain-${releaseIdOf()}.json`)));
/** True when the path lies in schema/pinned or below a directory that holds a release (release.json / PIN.json). */
export function insideRelease(path) {
  const pinned = resolve(BKS_ROOT, "schema", "pinned");
  if (path === pinned || path.startsWith(`${pinned}\\`) || path.startsWith(`${pinned}/`)) return true;
  for (let d = dirname(path); ; d = dirname(d)) {
    if (existsSync(resolve(d, "release.json")) || existsSync(resolve(d, "PIN.json"))) return true;
    if (dirname(d) === d) return false;
  }
}
if (insideRelease(outPath)) {
  console.error(`refusing to write EXPLAIN output inside a release or the pin: ${outPath}; use --out under runs/ (then generate.mjs --explain-from <file> to adopt it as a release's evidence)`);
  process.exit(2);
}
if (/databases\.neo4j\.io/.test(uri)) {
  console.error("refusing to run against Aura; use the disposable test instance");
  process.exit(2);
}

const neo4j = createRequire(resolve(BKS_ROOT, "packages", "kg-ops", "package.json"))("neo4j-driver");
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const sdlPath = resolve(releaseDir, "sdl", "assembled.graphql");
// v2.0.2+: explain the statements the release actually ships (the reads role's catalog patch applied).
const cfgPath = resolve(releaseDir, "release-source.yaml");
const cfg = existsSync(cfgPath) ? YAML.parse(readFileSync(cfgPath, "utf8")) : null;
const catalogPatch = cfg?.catalogPatch ? { path: cfg.catalogPatch, patch: readJson(resolve(releaseDir, cfg.catalogPatch)) } : null;
const { catalog } = buildCatalog({
  releaseDir,
  sdlText: existsSync(sdlPath) ? readFileSync(sdlPath, "utf8") : null,
  ddl: readJson(resolve(releaseDir, "ddl", "ddl.json")),
  explain: null,
  catalogPatch,
});

/** Replaces every gds.graph.project(args) call with [args] (the source query is what can be planned without GDS). */
function rewriteProjection(text) {
  let out = text;
  for (;;) {
    const i = out.search(/gds\.graph\.project\s*\(/);
    if (i < 0) return out;
    const open = out.indexOf("(", i);
    let depth = 0;
    let close = -1;
    for (let j = open; j < out.length; j++) {
      if (out[j] === "(") depth++;
      else if (out[j] === ")" && --depth === 0) {
        close = j;
        break;
      }
    }
    if (close < 0) return out;
    out = `${out.slice(0, i)}[${out.slice(open + 1, close)}]${out.slice(close + 1)}`;
  }
}

function operators(plan, acc = new Set()) {
  if (!plan) return acc;
  acc.add(String(plan.operatorType).replace(/@.*$/, ""));
  for (const c of plan.children ?? []) operators(c, acc);
  return acc;
}

const toDateTime = (iso) => neo4j.types.DateTime.fromStandardDate(new Date(iso));
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const out = { format: "bks-query-explain.v1", neo4j: null, results: {} };
try {
  const session = driver.session();
  try {
    const comp = await session.run("CALL dbms.components() YIELD name, versions, edition RETURN versions[0] AS version, edition");
    out.neo4j = { version: comp.records[0].get("version"), edition: comp.records[0].get("edition") };

    if (ddlPath) {
      const text = readFileSync(resolve(ddlPath), "utf8").replace(/\r\n/g, "\n");
      const statements = text
        .split(/;\s*\n/)
        .map((s) => s.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n").trim())
        .filter(Boolean);
      const failed = [];
      for (const s of statements) {
        try {
          await session.run(s);
        } catch (e) {
          if (!/already exists|equivalent/i.test(e.message)) failed.push({ statement: s.slice(0, 160), error: e.message.split("\n")[0] });
        }
      }
      out.ddl = { file: relative(releaseDir, resolve(ddlPath)).split("\\").join("/"), statements: statements.length, failed };
    }

    for (const t of catalog.templates) {
      const digest = t.statementDigest.replace(/^sha256:/, "");
      if (t.statementKind === "gds") {
        out.results[t.id] = { statementDigest: digest, ok: false, skipped: "gds-unavailable: CALL gds.* needs the optional GDS plugin (OD-22), not installed on the Community baseline" };
        continue;
      }
      const statement = t.statementKind === "gds-projection" ? rewriteProjection(t.statement) : t.statement;
      const params = Object.fromEntries(Object.entries(t.parameters).map(([k, p]) => [k, dummyValue(p, toDateTime)]));
      try {
        const res = await session.run(`EXPLAIN ${statement}`, params);
        const ops = operators(res.summary.plan);
        const planFlags = ["AllNodesScan", "CartesianProduct"].filter((o) => ops.has(o));
        out.results[t.id] = {
          statementDigest: digest,
          ok: true,
          ...(t.statementKind === "gds-projection" ? { explainedForm: "projection source query (gds.graph.project rewritten to a list)" } : {}),
          ...(planFlags.length ? { planFlags } : {}),
        };
      } catch (e) {
        out.results[t.id] = { statementDigest: digest, ok: false, error: `${e.code ?? "error"}: ${e.message.split("\n")[0]}` };
      }
    }
  } finally {
    await session.close();
  }
} finally {
  await driver.close();
}

const target = outPath;
writeFileEnsured(target, prettyJson(out));
const vals = Object.values(out.results);
console.log(
  JSON.stringify(
    {
      ok: true,
      out: target,
      neo4j: out.neo4j,
      templates: vals.length,
      explainOk: vals.filter((r) => r.ok).length,
      failed: Object.entries(out.results).filter(([, r]) => !r.ok && !r.skipped).map(([id, r]) => ({ id, error: r.error })),
      skipped: vals.filter((r) => r.skipped).length,
      ddl: out.ddl ?? null,
    },
    null,
    2,
  ),
);
