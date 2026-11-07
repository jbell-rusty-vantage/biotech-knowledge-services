#!/usr/bin/env node
// Skill digests for .agents/skills/skill-routing.json.
//
//   node scripts/migration/skill-digests.mjs                 # print {skill: {digest, files, version}} for every skill folder
//   node scripts/migration/skill-digests.mjs --check         # verify every dependency digest in skill-routing.json
//   node scripts/migration/skill-digests.mjs --snapshot <f>  # write per-file sha256 of the vendored Neo4j skills to <f>
//   node scripts/migration/skill-digests.mjs --compare <f>   # compare the vendored files with a snapshot (byte identity)
//
// Skill digest = sha256 over the LC_ALL=C-sorted lines "<file sha256>  <path relative to the skill folder>\n"
// (identical to `find . -type f | LC_ALL=C sort | xargs sha256sum | sha256sum` run inside the folder).
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { REPO_ROOT, parseArgs } from "./lib/common.mjs";

const SKILLS = path.join(REPO_ROOT, ".agents", "skills");
const sha = (b) => createHash("sha256").update(b).digest("hex");
function filesOf(dir, base = dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...filesOf(p, base));
    else if (e.isFile()) out.push(path.relative(base, p).split(path.sep).join("/"));
  }
  return out.sort((a, b) => (Buffer.from(a) < Buffer.from(b) ? -1 : Buffer.compare(Buffer.from(a), Buffer.from(b))));
}
export function skillDigest(name) {
  const dir = path.join(SKILLS, name);
  const files = filesOf(dir).sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
  const lines = files.map((f) => `${sha(fs.readFileSync(path.join(dir, f)))}  ${f}\n`).join("");
  const skillMd = path.join(dir, "SKILL.md");
  const version = fs.existsSync(skillMd) ? (/^version:\s*(.+)$/m.exec(fs.readFileSync(skillMd, "utf8"))?.[1] ?? null) : null;
  return { digest: "sha256:" + sha(lines), files: files.length, version };
}
const vendored = () => fs.readdirSync(SKILLS).filter((d) => /^neo4j-.*-skill$/.test(d)).sort();

const args = parseArgs(process.argv.slice(2));
if (args.snapshot || args.compare) {
  const rows = {};
  for (const s of [...vendored(), "_vendor-neo4j"]) for (const f of filesOf(path.join(SKILLS, s))) rows[`${s}/${f}`] = sha(fs.readFileSync(path.join(SKILLS, s, f)));
  if (args.snapshot) {
    fs.writeFileSync(path.resolve(args.snapshot), JSON.stringify(rows, null, 2) + "\n");
    console.log(JSON.stringify({ ok: true, files: Object.keys(rows).length, snapshot: args.snapshot }));
  } else {
    const before = JSON.parse(fs.readFileSync(path.resolve(args.compare), "utf8"));
    const diffs = [];
    for (const k of new Set([...Object.keys(before), ...Object.keys(rows)])) if (before[k] !== rows[k]) diffs.push({ file: k, before: before[k] ?? null, after: rows[k] ?? null });
    console.log(JSON.stringify({ ok: diffs.length === 0, files: Object.keys(rows).length, diffs }, null, 2));
    process.exit(diffs.length ? 1 : 0);
  }
} else if (args.check) {
  const routing = JSON.parse(fs.readFileSync(path.join(SKILLS, "skill-routing.json"), "utf8"));
  const problems = [];
  let checked = 0;
  for (const [name, dep] of Object.entries(routing.dependencySkills ?? {})) {
    const now = skillDigest(name);
    checked++;
    if (now.digest !== dep.digest) problems.push({ skill: name, recorded: dep.digest, actual: now.digest });
  }
  for (const r of routing.routes ?? []) for (const d of r.dependencies ?? []) if (!routing.dependencySkills?.[d.skill]) problems.push({ route: r.id, missingDependencyRecord: d.skill });
  const pending = [];
  for (const r of routing.routes ?? []) {
    if (fs.existsSync(path.join(SKILLS, r.entrySkill, "SKILL.md"))) continue;
    if (String(r.entrySkillStatus ?? "").startsWith("planned")) pending.push({ route: r.id, entrySkill: r.entrySkill, status: r.entrySkillStatus });
    else problems.push({ route: r.id, missingEntrySkill: r.entrySkill });
  }
  const bindings = {};
  for (const k of ["releaseId", "schemaReleaseDigest", "workspaceFingerprint"]) {
    const b = routing[k];
    if (!b || typeof b !== "object" || !b.bind) {
      problems.push({ binding: k, problem: "not a {bind} pointer" });
      continue;
    }
    const [file, ptr] = b.bind.split("#");
    const full = path.join(REPO_ROOT, file);
    if (!fs.existsSync(full)) {
      problems.push({ binding: k, problem: `missing ${file}` });
      continue;
    }
    const value = ptr.split("/").slice(1).reduce((o, p) => o?.[p], JSON.parse(fs.readFileSync(full, "utf8")));
    if (value == null) problems.push({ binding: k, problem: `pointer ${b.bind} unresolved` });
    bindings[k] = { current: value ?? null, observedAtBinding: b.observedAtBinding ?? null, changedSinceBinding: value !== b.observedAtBinding };
  }
  console.log(JSON.stringify({ ok: problems.length === 0, dependencyDigestsChecked: checked, routes: routing.routes?.length ?? 0, bindings, problems, pendingEntrySkills: pending }, null, 2));
  process.exit(problems.length ? 1 : 0);
} else {
  const out = {};
  for (const d of fs.readdirSync(SKILLS, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()) out[d] = skillDigest(d);
  console.log(JSON.stringify(out, null, 2));
}
