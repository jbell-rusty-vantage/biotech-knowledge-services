#!/usr/bin/env node
/**
 * Re-renders the generated sections of final/fixtures/README.md from the CURRENT fixture copies, without touching any
 * fixture file (close-out round 2026-10-09, REFRESH stage).
 *
 * Why this script exists: final/_work/repath-fixtures.mjs renders the same sections, but its repath step re-copies the
 * packet fixtures over final/fixtures/ and once destroyed a round of FU-03 edits. Do not run, import or require it.
 * This script contains its own copy of the index logic and only reads fixture files.
 *
 *   node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/fixtures-readme-index.mjs [--check]
 *
 * Reads (read-only): final/fixtures/<P>/<folder>/{source.md,questions.md,assertions.yaml,intent*.json} (packet fixtures,
 * K and D1..D13; cross-domain only where a register entry names one), final/schema/final_biotech_schema_v2.graphql,
 * final/relationship-register.yaml, final/_work/intent-validation.json (validate-intents.mjs) and
 * final/_work/plan-candidate-results.json (plan-candidate.mjs).
 * Writes: final/fixtures/README.md (ONLY these sections, everything else is kept byte for byte: the header, "Renames
 * applied" (a record of the repath run) and "Residual non-final names and pending ruling edits" (edited by the fixture
 * editors)):
 *   ## Index                        up to "## Renames applied"
 *   ## Relationship register check  up to "## Intent validation"
 *   ## Intent validation ...        up to "## Planner check"
 *   ## Planner check ...            to the end of the file
 * and final/_work/register-fixture-check.json. --check writes nothing and exits 1 if README.md would change.
 * Deterministic: no timestamps.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const PROGRAM = resolve(here, "../..");
const REPO = resolve(PROGRAM, "../..");
const FINAL = join(PROGRAM, "final");
const OUT = join(FINAL, "fixtures");
const README = join(OUT, "README.md");
const CHECK = process.argv.includes("--check");
const req = createRequire(join(REPO, "packages/schema-workspace/package.json"));
const YAML = req("yaml");
const { parse } = req("graphql");
const PACKETS = ["K", ...Array.from({ length: 13 }, (_, i) => `D${i + 1}`)];
const isData = (f) => f === "assertions.yaml" || /^intent.*\.json$/.test(f);

// candidate vocabulary
const sdl = readFileSync(join(FINAL, "schema/final_biotech_schema_v2.graphql"), "utf8");
const relFields = {}; const relTypes = new Set(); const unions = {}; const impls = {};
for (const d of parse(sdl).definitions) {
  if (d.kind === "UnionTypeDefinition") unions[d.name.value] = d.types.map((x) => x.name.value);
  if (d.kind === "ObjectTypeDefinition") for (const i of d.interfaces ?? []) (impls[i.name.value] ??= []).push(d.name.value);
  if (d.kind !== "ObjectTypeDefinition") continue;
  for (const f of d.fields ?? []) {
    const r = (f.directives ?? []).find((x) => x.name.value === "relationship");
    if (!r) continue;
    const t = r.arguments.find((a) => a.name.value === "type").value.value;
    relTypes.add(t);
    (relFields[t] ??= new Set()).add(f.name.value);
  }
}
const register = YAML.parse(readFileSync(join(FINAL, "relationship-register.yaml"), "utf8"));

// fixtures (packet order, folders sorted, as the repath manifest lists them)
const walkFiles = (dir, base = "") => readdirSync(dir).sort().flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walkFiles(p, `${base}${f}/`) : [`${base}${f}`];
});
const fixtures = [];
for (const packet of PACKETS) {
  const pd = join(OUT, packet);
  if (!existsSync(pd)) continue;
  for (const folder of readdirSync(pd).sort()) {
    if (!statSync(join(pd, folder)).isDirectory()) continue;
    fixtures.push({ packet, folder, files: walkFiles(join(pd, folder)) });
  }
}
const rows = [];
for (const fx of fixtures) {
  const dir = join(OUT, fx.packet, fx.folder);
  const src = existsSync(join(dir, "source.md")) ? readFileSync(join(dir, "source.md"), "utf8") : "";
  const kind = /kind:\s*([a-z-]+)/.exec(src)?.[1] ?? "?";
  const urls = [...new Set([...src.matchAll(/https?:\/\/[^\s|)>`"']+/g)].map((m) => m[0].replace(/[.,;]+$/, "")))];
  const hosts = [...new Set(urls.map((u) => { try { return new URL(u).host.replace(/^www\./, ""); } catch { return u; } }))];
  const q = existsSync(join(dir, "questions.md")) ? readFileSync(join(dir, "questions.md"), "utf8") : "";
  const qids = [...new Set([...q.matchAll(/^\|\s*([^|]+?)\s*\|/gm)].flatMap((m) => [...m[1].matchAll(/\b(Q-[A-Z0-9]+-\d+[a-z]?|CQ-[A-Z]+-\d+[a-z]?)\b/g)].map((x) => x[1])))];
  const dataFiles = fx.files.filter((f) => isData(f.split("/").pop()));
  const data = dataFiles.map((f) => readFileSync(join(dir, f), "utf8")).join("\n");
  const nonComment = data.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
  const rels = [...relTypes].filter((t) => new RegExp(`\\b${t}\\b`).test(nonComment)).sort();
  rows.push({ fx, kind, hosts, urls, qids, rels, nonComment, dataFiles });
}
const byPath = new Map(rows.map((r) => [`final/fixtures/${r.fx.packet}/${r.fx.folder}`, r]));

// relationship register check (same levels and pair heuristic as the repath index)
const ends = (v) => (Array.isArray(v) ? v.map(String) : String(v).split("|")).map((s) => s.trim()).filter(Boolean);
const show = (v) => ends(v).join(" / ");
const regRows = [];
for (const e of register.relationships) {
  const paths = [e.fixture, ...(e.otherFixtures ?? []), ...(e.exercisedIn ?? [])].filter((p, i, a) => p && a.indexOf(p) === i);
  const primary = e.fixture;
  const exists = existsSync(join(PROGRAM, primary));
  const r = byPath.get(primary) ?? (exists && existsSync(join(PROGRAM, primary, "assertions.yaml")) ? (() => {
    const dir = join(PROGRAM, primary);
    const data = readdirSync(dir).filter((f) => /^(assertions\.yaml|intent.*\.json)$/.test(f)).map((f) => readFileSync(join(dir, f), "utf8")).join("\n");
    return { nonComment: data.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n") };
  })() : undefined);
  let level = "MISSING";
  let how = "";
  if (exists && r) {
    const token = new RegExp(`\\b${e.type}\\b`);
    const fieldKeys = [...(relFields[e.type] ?? [])];
    const asserts = readFileSync(join(PROGRAM, primary, "assertions.yaml"), "utf8");
    const assertsNC = asserts.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
    if (token.test(assertsNC)) { level = "TYPE"; how = "type name in assertions.yaml"; }
    else if (fieldKeys.some((k) => new RegExp(`(^|[\\s{,])${k}:`, "m").test(assertsNC))) { level = "FIELD"; how = `field key ${fieldKeys.filter((k) => new RegExp(`(^|[\\s{,])${k}:`, "m").test(assertsNC)).join("/")}: in assertions.yaml`; }
    else if (token.test(r.nonComment)) { level = "INTENT"; how = "type name only in intent*.json"; }
    else if (token.test(asserts)) { level = "COMMENT"; how = "type name only in assertions.yaml comments"; }
    else level = "ABSENT";
  }
  let pair = "n/a";
  if (level === "TYPE") {
    const lines = readFileSync(join(PROGRAM, primary, "assertions.yaml"), "utf8").split("\n");
    const names = (end) => {
      const base = ends(end).map((s) => s.trim().replace(/^(K|D\d{1,2})\./, "").replace(/\s*\(.*$/, ""));
      return [...new Set(base.flatMap((b) => unions[b] ?? impls[b] ?? [b]))];
    };
    const fromN = names(e.from);
    const toN = names(e.to);
    const tokenRe = new RegExp(`\\b${e.type}\\b`);
    const near = (i, ns) => ns.some((n) => lines.slice(Math.max(0, i - 8), i + 9).some((l) => new RegExp(`\\b${n}\\b`, "i").test(l) || new RegExp(`\\b${n.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}\\b`).test(l)));
    const hit = lines.some((l, i) => !/^\s*#/.test(l) && tokenRe.test(l) && near(i, fromN) && near(i, toN));
    pair = hit ? "both endpoints named nearby" : "endpoint names not found near the type (check by hand)";
  }
  const others = paths.filter((p) => p !== primary).map((p) => ({ p, exists: existsSync(join(PROGRAM, p)), hit: (() => { const rr = byPath.get(p) ?? (existsSync(join(PROGRAM, p, "assertions.yaml")) ? { nonComment: readFileSync(join(PROGRAM, p, "assertions.yaml"), "utf8") } : null); return rr ? new RegExp(`\\b${e.type}\\b`).test(rr.nonComment) : false; })() }));
  regRows.push({ module: e.module, type: e.type, from: e.from, to: e.to, fixture: primary, exists, level, how, pair, others });
}

const vPath = join(FINAL, "_work", "intent-validation.json");
const validation = existsSync(vPath) ? JSON.parse(readFileSync(vPath, "utf8")) : null;
const pPath = join(FINAL, "_work", "plan-candidate-results.json");
const plan = existsSync(pPath) ? JSON.parse(readFileSync(pPath, "utf8")) : null;

// ---- render the four sections
const r08 = (id, pk) => (id === "CQ-PF-03" ? (pk === "D8" ? "CQ-PF-03→03a" : pk === "D6" ? "CQ-PF-03→03b" : id) : id);
const sec = {};
{
  const L = [];
  L.push("## Index");
  L.push("");
  L.push("Re-rendered from the current fixture copies by `final/_work/fixtures-readme-index.mjs` (read-only over the fixtures).");
  L.push("");
  L.push("| fixture | packet | kind | sources (hosts; URLs) | questions answered | relationships exercised (candidate types named in assertions / intents) |");
  L.push("| --- | --- | --- | --- | --- | --- |");
  for (const r of rows) L.push(`| [${r.fx.folder}](${r.fx.packet}/${r.fx.folder}/) | ${r.fx.packet} | ${r.kind} | ${r.hosts.slice(0, 4).join(", ")}${r.hosts.length > 4 ? ` +${r.hosts.length - 4}` : ""}; ${r.urls.length} | ${r.qids.map((x) => r08(x, r.fx.packet)).join(", ") || "—"} | ${r.rels.join(", ") || "—"} |`);
  L.push("");
  const kinds = {};
  for (const r of rows) kinds[r.kind] = (kinds[r.kind] ?? 0) + 1;
  L.push(`Kinds: ${Object.entries(kinds).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, v]) => `${k} ${v}`).join(", ")}. Distinct question ids answered: ${new Set(rows.flatMap((r) => r.qids)).size}. Candidate relationship types named by at least one fixture: ${new Set(rows.flatMap((r) => r.rels)).size} of ${relTypes.size}.`);
  L.push("");
  sec.index = L.join("\n");
}
const lv = {};
for (const x of regRows) lv[x.level] = (lv[x.level] ?? 0) + 1;
const viol = regRows.filter((x) => !["TYPE", "FIELD"].includes(x.level));
{
  const L = [];
  L.push("## Relationship register check");
  L.push("");
  L.push(`Every entry of \`final/relationship-register.yaml\` (${regRows.length} entries, ${new Set(regRows.map((x) => x.type)).size} types): does its \`fixture\` path exist, and do that fixture's assertions exercise the relationship? Levels: TYPE = the type name appears in a non-comment line of assertions.yaml; FIELD = a declaring field key (e.g. \`snapshots:\`) appears there; INTENT = only in intent*.json; COMMENT = only in assertions.yaml comments; ABSENT = nowhere; MISSING = path does not exist. Result: ${Object.entries(lv).map(([k, v]) => `${k} ${v}`).join(", ")}.`);
  L.push("");
  L.push(`### Violations (${viol.length})`);
  L.push("");
  if (viol.length) {
    L.push("| module | type | from → to | fixture | level | also exercised in (otherFixtures / exercisedIn) |");
    L.push("| --- | --- | --- | --- | --- | --- |");
    for (const x of viol) L.push(`| ${x.module} | ${x.type} | ${show(x.from)} → ${show(x.to)} | ${x.fixture.replace("final/fixtures/", "")} | ${x.level}${x.how ? ` (${x.how})` : ""} | ${x.others.map((o) => `${o.p.replace("final/fixtures/", "")}${o.exists ? (o.hit ? " ✓" : " ✗") : " (missing)"}`).join(", ") || "—"} |`);
  } else L.push("None.");
  L.push("");
  const typeRows = regRows.filter((x) => x.level === "TYPE");
  const weak = typeRows.filter((x) => x.pair !== "both endpoints named nearby");
  L.push(`Pair evidence (heuristic, not a violation): for ${typeRows.length - weak.length} of ${typeRows.length} TYPE-level entries both endpoint types (or a union member / interface implementer) are named within ±8 lines of a line naming the type; check by hand: ${weak.map((x) => `${x.module} ${x.type} ${show(x.from)}→${show(x.to)} (${x.fixture.replace("final/fixtures/", "")})`).join("; ") || "none"}.`);
  L.push("");
  L.push("<details><summary>All entries</summary>");
  L.push("");
  L.push("| module | type | from → to | fixture | level | pair evidence |");
  L.push("| --- | --- | --- | --- | --- | --- |");
  for (const x of regRows) L.push(`| ${x.module} | ${x.type} | ${show(x.from)} → ${show(x.to)} | ${x.fixture.replace("final/fixtures/", "")} | ${x.level} | ${x.pair} |`);
  L.push("");
  L.push("</details>");
  L.push("");
  sec.register = L.join("\n");
}
sec.validation = validation ? ["## Intent validation (biotech-knowledge-intent.v1, structural)", "", validation.summaryMarkdown, ""].join("\n") : null;
if (plan) {
  const L = ["## Planner check (03-SYNTHESIS step 8)", "", plan.summaryMarkdown, ""];
  const nonV2 = {}; let nonV2n = 0;
  for (const r of rows) for (const f of r.dataFiles) {
    if (!/^intent.*\.json$/.test(f.split("/").pop())) continue;
    const j = JSON.parse(readFileSync(join(OUT, r.fx.packet, r.fx.folder, f), "utf8"));
    for (const p of j.proposals ?? []) if (p.kind === "edge.assert" && p.relationshipType && !relTypes.has(p.relationshipType)) { nonV2n++; nonV2[p.relationshipType] = (nonV2[p.relationshipType] ?? 0) + 1; }
  }
  L.push(`Reading the counts: the planner codes above are rejection reasons from this one run (an intent already rejected for another reason is not counted again), so RELATIONSHIP_NOT_IN_SCHEMA is not the number of such proposals. Counted in the files, ${nonV2n} \`edge.assert\` proposals name a relationshipType that is not a candidate relationship type, over ${Object.keys(nonV2).length} distinct predicates: ${Object.entries(nonV2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, v]) => `${k} ${v}`).join(", ")}. A predicate-only registered name sent as \`edge.assert\` is allowed by the fixture lint (no edge is written); see \`_work/fixture-lint.json\`.`);
  L.push("");
  sec.plan = L.join("\n");
}

// ---- splice into README.md
const before = readFileSync(README, "utf8");
const lines = before.split("\n");
const at = (re) => lines.findIndex((l) => re.test(l));
const marks = [
  { key: "index", start: at(/^## Index\s*$/), end: at(/^## Renames applied/) },
  { key: "register", start: at(/^## Relationship register check\s*$/), end: at(/^## Intent validation/) },
  { key: "validation", start: at(/^## Intent validation/), end: at(/^## Planner check/) },
  { key: "plan", start: at(/^## Planner check/), end: lines.length },
];
for (const m of marks) if (m.start < 0 || m.end < 0 || m.end < m.start) throw new Error(`README section ${m.key} not found (start ${m.start}, end ${m.end})`);
for (let i = 1; i < marks.length; i++) if (marks[i].start < marks[i - 1].end) throw new Error("README sections out of order");
const outLines = [];
let cursor = 0;
for (const m of marks) {
  outLines.push(...lines.slice(cursor, m.start));
  const body = sec[m.key];
  if (body != null) outLines.push(...body.replace(/\n+$/, "").split("\n"), "");
  else outLines.push(...lines.slice(m.start, m.end));
  cursor = m.end;
}
let after = outLines.join("\n").replace(/\n+$/, "") + "\n";
const changed = after !== before;
const summary = {
  readme: "final/fixtures/README.md", changed, fixtures: rows.length, distinctQuestionIds: new Set(rows.flatMap((r) => r.qids)).size,
  relTypesNamed: `${new Set(rows.flatMap((r) => r.rels)).size}/${relTypes.size}`, registerEntries: regRows.length, levels: lv, violations: viol.length,
  validation: !!validation, plan: !!plan,
};
if (CHECK) { console.log(JSON.stringify(summary, null, 1)); process.exit(changed ? 1 : 0); }
writeFileSync(README, after);
writeFileSync(join(FINAL, "_work", "register-fixture-check.json"), `${JSON.stringify(regRows, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 1));
