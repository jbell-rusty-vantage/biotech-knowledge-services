#!/usr/bin/env node
// OD-35 discourse-independence review set: builds the sampling frame and a seeded stratified draw of 30 claims.
//
//   node evals/v2/od35/build-frame.mjs            # writes evals/v2/od35/frame.json and review-set.json
//   node evals/v2/od35/build-frame.mjs --check    # freeze check
//
// Frame = every CLAIM-kind assertion in schema/program/final/fixtures (sourced fixtures; research only). Stratum flags
// are SCREENING heuristics only; the human annotators decide the final stratum labels (see od35-review-set.md). The
// draw never invents claims: if the frame cannot fill a stratum the shortfall is reported, not padded.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { YAML, canonical, sha256 } from "../../../scripts/migration/lib/common.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..", "..");
const FIX = path.join(REPO, "schema", "program", "final", "fixtures");
const SEED = 20261011;
const TARGET = { total: 30, retelling: 10, ambiguousAuthority: 10 };

const frame = [];
for (const mod of fs.readdirSync(FIX).filter((d) => fs.statSync(path.join(FIX, d)).isDirectory()).sort()) {
  for (const f of fs.readdirSync(path.join(FIX, mod)).sort()) {
    const p = path.join(FIX, mod, f, "assertions.yaml");
    if (!fs.existsSync(p)) continue;
    const a = YAML.parse(fs.readFileSync(p, "utf8"));
    for (const x of a.assertions ?? []) {
      if (x.assertionKind !== "CLAIM") continue;
      const text = JSON.stringify(x);
      const quals = (x.qualifiers ?? []).join(" ");
      const retelling = mod === "D9" || /RENDITION_OF|REPUBLISH|OCCURS_IN|retell|syndicat|rendition:/i.test(text);
      const ambiguousAuthority = !x.asserter || /asserterBasis:(PUBLISHER_DEFAULT|INFERRED)/.test(quals) || /PUBLISHER_DEFAULT|INFERRED/.test(JSON.stringify(x.asserter ?? {})) || /speaker|host|guest|unattributed|pseudonym/i.test(text);
      frame.push({ claimRef: `${mod}/${f}#${x.id}`, assertionUid: x.uid ?? null, module: mod, fixture: `${mod}/${f}`, predicate: x.predicate ?? null, claimType: x.claimType ?? null, screen: { retelling, ambiguousAuthority } });
    }
  }
}
frame.sort((a, b) => (a.claimRef < b.claimRef ? -1 : 1));

// seeded draw: fill retelling, then ambiguous authority (overlap allowed), then the remaining slots stratified by module
let x = SEED;
const rnd = () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 2 ** 32);
const shuffled = frame.map((c) => ({ c, k: rnd() })).sort((a, b) => a.k - b.k).map((o) => o.c);
const chosen = [];
const take = (pred, n) => {
  for (const c of shuffled) {
    if (chosen.filter(pred).length >= n || chosen.length >= TARGET.total) break;
    if (pred(c) && !chosen.includes(c)) chosen.push(c);
  }
};
take((c) => c.screen.retelling, TARGET.retelling);
take((c) => c.screen.ambiguousAuthority, TARGET.ambiguousAuthority);
const modules = [...new Set(shuffled.map((c) => c.module))].sort();
while (chosen.length < Math.min(TARGET.total, frame.length)) {
  let added = false;
  for (const m of modules) {
    const c = shuffled.find((z) => z.module === m && !chosen.includes(z));
    if (c && chosen.length < TARGET.total) {
      chosen.push(c);
      added = true;
    }
  }
  if (!added) break;
}
const count = (pred) => chosen.filter(pred).length;
const reviewSet = {
  format: "bks-od35-review-set.v1",
  seed: SEED,
  target: TARGET,
  frame: { size: frame.length, retellingCandidates: frame.filter((c) => c.screen.retelling).length, ambiguousAuthorityCandidates: frame.filter((c) => c.screen.ambiguousAuthority).length, digest: "sha256:" + sha256(canonical(frame)) },
  drawn: { total: chosen.length, retelling: count((c) => c.screen.retelling), ambiguousAuthority: count((c) => c.screen.ambiguousAuthority), byModule: Object.fromEntries(modules.map((m) => [m, count((c) => c.module === m)])) },
  shortfall: {
    total: Math.max(0, TARGET.total - chosen.length),
    retelling: Math.max(0, TARGET.retelling - count((c) => c.screen.retelling)),
    ambiguousAuthority: Math.max(0, TARGET.ambiguousAuthority - count((c) => c.screen.ambiguousAuthority)),
  },
  claims: chosen.map((c) => c.claimRef).sort(),
  status: "frame drawn; human annotation not started (no labels, no gold)",
};
const outs = [["frame.json", { format: "bks-od35-frame.v1", claims: frame }], ["review-set.json", reviewSet]];
let drift = 0;
for (const [name, obj] of outs) {
  const text = JSON.stringify(JSON.parse(canonical(obj)), null, 2) + "\n";
  const file = path.join(HERE, name);
  if (process.argv.includes("--check")) {
    if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text) drift++;
  } else fs.writeFileSync(file, text);
}
console.log(JSON.stringify({ ok: drift === 0, frame: reviewSet.frame, drawn: reviewSet.drawn, shortfall: reviewSet.shortfall }, null, 2));
process.exit(drift ? 1 : 0);
