#!/usr/bin/env node
/**
 * S0/S1 promotion: frozen candidate (schema/program/final @ BKS 431c8a7) + recorded corrections -> upstream release
 * source tree in biotech-meta/docs/schema/releases/<releaseId>/. Deterministic and re-runnable: the same frozen inputs
 * produce the same bytes. Owned-upstream files that are authored in biotech-meta (workspace-inputs/**, README.md,
 * migration/legacy-map.yaml once S8 fills it) are never overwritten.
 *
 *   node scripts/release/promote.mjs [--release <dir>] [--check]
 *
 * --check exits 1 when the release tree differs from what promotion would write (no files written).
 * After promotion run scripts/release/generate.mjs to (re)generate the derived artifacts and release.json.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { arg, DEFAULT_RELEASE_DIR, FINAL_DIR, flag, listFiles, PLAN_DIR, readText, writeTree } from "./lib/common.mjs";
import { applyCorrections } from "./lib/corrections.mjs";

const releaseDir = resolve(arg("--release", DEFAULT_RELEASE_DIR));
const check = flag("--check");

/** Plain copies: [source under FINAL_DIR (or absolute), target under the release dir]. */
const COPIES = [
  ...["kernel", ...Array.from({ length: 13 }, (_, i) => `D${i + 1}`)].map((m) => [`schema/${m}.graphql`, `sdl/modules/${m}.graphql`]),
  ["node-register.yaml", "registers/node-register.yaml"],
  ["relationship-register.yaml", "registers/relationship-register.yaml"],
  ["seams.yaml", "registers/seams.yaml"],
  ...["predicates", "identifier-schemes", "targets", "claim-lifecycle", "verdict-lattice", "answer-kinds", "goal-polarity", "frontiers"].map((v) => [`vocabularies/${v}.yaml`, `vocabularies/${v}.yaml`]),
  ["tooling/action-space.yaml", "tooling/action-space.yaml"],
  ["query-patterns.md", "query-catalog/sources/query-patterns.md"],
  ["questions-catalog.md", "query-catalog/sources/questions-catalog.md"],
  ...listFiles(resolve(FINAL_DIR, "patterns-by-question")).map((f) => [`patterns-by-question/${f}`, `query-catalog/sources/patterns-by-question/${f}`]),
  [resolve(PLAN_DIR, "DECISIONS.md"), "decisions/DECISIONS.md"],
];

/** Files authored upstream (never written by promotion once they exist). */
const UPSTREAM_AUTHORED = [/^workspace-inputs\//, /^README\.md$/, /^migration\/legacy-map\.yaml$/];

const files = new Map();
for (const [from, to] of COPIES) {
  const src = from.includes(":") || from.startsWith("/") ? from : resolve(FINAL_DIR, from);
  files.set(to, readText(src));
}

// Source corrections (SPECIFICATION 2.4 + S0/S1 decisions) and promotion-time registries. Every edit is logged in
// reports/corrections.json with its decision id; anchors must match exactly once or promotion fails.
const { files: corrected, log } = await applyCorrections(files, { finalDir: FINAL_DIR, releaseDir });

const out = new Map();
for (const [path, content] of corrected) {
  if (UPSTREAM_AUTHORED.some((re) => re.test(path)) && existsSync(resolve(releaseDir, path))) continue;
  out.set(path, content);
}

if (check) {
  const drift = [];
  for (const [path, content] of out) {
    const target = resolve(releaseDir, path);
    if (!existsSync(target) || !readFileSync(target).equals(Buffer.from(content, "utf8"))) drift.push(path);
  }
  console.log(JSON.stringify({ ok: drift.length === 0, releaseDir, files: out.size, drift }, null, 2));
  process.exit(drift.length ? 1 : 0);
}
const changed = writeTree(releaseDir, out);
console.log(JSON.stringify({ ok: true, releaseDir, files: out.size, changed: changed.length, corrections: log.length }, null, 2));
