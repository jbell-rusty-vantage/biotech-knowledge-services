#!/usr/bin/env node
// Re-paths every packet fixture into final/fixtures/<packet>/<folder>/ and applies the merge rulings' renames
// (final/_work/rulings.yaml) so assertions.yaml and intent*.json use the candidate's type / edge / enum / predicate names.
//
//   node schema/program/final/_work/repath-fixtures.mjs            copy + rewrite, then write final/_work/repath-manifest.json
//   node schema/program/final/_work/repath-fixtures.mjs --index    also render final/fixtures/README.md (needs the manifest,
//                                                                  and reads final/_work/plan-candidate-results.json if present)
//
// Rules (fixture-curator stage, 2026-10-09):
// - Every file of a fixture folder is copied. Text files that can carry path references (assertions.yaml, intent*.json,
//   locators.yaml, source.md, questions.md, *.yaml helpers) get path rewrites only where a path is written; everything else
//   (capture bodies *.txt, *.py) is copied byte for byte.
// - source.md and locators.yaml: path rewrites only. The script verifies every changed line held a path reference.
// - assertions.yaml and intent*.json: path rewrites + the rename table below (each rule cites its ruling). Nothing else.
//   Structural edits the rulings ask for (asserter swaps, dropped rows, field -> qualifier moves) are NOT renames; they are
//   listed per fixture in the README as pending, from the residual scan.
// - Rewritten intents must still parse as JSON.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const PROGRAM = resolve(here, "../..");                 // schema/program
const REPO = resolve(PROGRAM, "../..");                 // worktree root
const PACKETS = join(PROGRAM, "packets");
const FINAL = join(PROGRAM, "final");
const OUT = join(FINAL, "fixtures");
const MANIFEST = join(FINAL, "_work", "repath-manifest.json");
const PACKET_IDS = ["K", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13"];
const MODULE_SDL = (id) => (id === "K" ? "kernel.graphql" : `${id}.graphql`);
const sha = (b) => createHash("sha256").update(b).digest("hex");

// ------------------------------------------------------------------------------------------------ path rewrites
// Paths are written relative to the fixture folder (../, ../../), to schema/program (packets/...), or to the packet (07-fixtures/...).
// final/fixtures/<id>/<folder>/ is one level deeper than packets/<id>/07-fixtures/<folder>/ relative to schema/program.
function pathRules(id) {
  return [
    // schema/program-relative fixture paths -> final/fixtures
    { name: "packets/<P>/07-fixtures/ -> final/fixtures/<P>/", re: /\bpackets\/(K|D\d{1,2})\/07-fixtures\//g, to: (_m, p) => `final/fixtures/${p}/` },
    // schema/program-relative packet SDL -> the accepted module SDL
    { name: "packets/<P>/04-schema-proposal.graphql -> final/schema/<module>.graphql", re: /\bpackets\/(K|D\d{1,2})\/04-schema-proposal\.graphql/g, to: (_m, p) => `final/schema/${MODULE_SDL(p)}` },
    // packet-relative fixture path (no packets/<P>/ prefix)
    { name: "07-fixtures/<f> (packet-relative) -> final/fixtures/<P>/<f>", re: /(?<![\w/.-])07-fixtures\//g, to: () => `final/fixtures/${id}/` },
    // cross-packet relative path ../../../<P>/07-fixtures/<f>
    { name: "../../../<P>/07-fixtures/ -> ../../<P>/", re: /(?<!\.\.\/)\.\.\/\.\.\/\.\.\/(K|D\d{1,2})\/07-fixtures\//g, to: (_m, p) => `../../${p}/` },
    // own packet SDL two levels up -> accepted module SDL
    { name: "../../04-schema-proposal.graphql -> ../../../schema/<module>.graphql", re: /(?<!\.\.\/)\.\.\/\.\.\/04-schema-proposal\.graphql/g, to: () => `../../../schema/${MODULE_SDL(id)}` },
    // any other packet-level file two levels up -> the packet (packet docs are not copied to final/)
    { name: "../../<file> -> ../../../../packets/<P>/<file>", re: /(?<!\.\.\/)\.\.\/\.\.\/(?!\.\.\/|(?:K|D\d{1,2})\/)(?=[\w])/g, to: () => `../../../../packets/${id}/` },
  ];
}
const PATH_LINE = /\.\.\/|packets\/(K|D\d{1,2})\/|07-fixtures\//;

// ------------------------------------------------------------------------------------------------ rename table
// scope: optional { packets: [...], fixtures: ["<P>/<folder>"] }; line: optional regex a line must match for the rule to apply.
const RENAMES = [
  // predicates (R-52 registry; aliases are retired spellings)
  { ruling: "R-68", kind: "predicate", re: /\bMANUFACTURER_STATEMENT\b/g, to: "MANUFACTURER_UNNAMED" },
  { ruling: "R-68", kind: "predicate", re: /\bMANUFACTURES_MATERIAL\b/g, to: "MANUFACTURES" },
  { ruling: "R-68", kind: "predicate", re: /\b(SUPPLIES_INGREDIENT|EXCLUSIVE_SUPPLIER_OF|SOLE_SUPPLIER_OF)\b/g, to: "SUPPLIES_MATERIAL", note: "EXCLUSIVE_/SOLE_ also need qualifier exclusivity=SOLE" },
  { ruling: "R-80", kind: "predicate", re: /\bPROTOCOL_AUTHORED_BY\b/g, to: "AUTHORED_BY" },
  { ruling: "R-62", kind: "predicate", re: /\bPREPARED_WITH\b/g, to: "HAS_RECIPE_INGREDIENT" },
  { ruling: "R-73", kind: "predicate", re: /\bSAMPLE_POSITIVE_OUTBREAK_STRAIN\b/g, to: "SAMPLE_TESTED_POSITIVE_FOR" },
  { ruling: "R-82", kind: "predicate", re: /\b(COMPETING_INTEREST_STATED|DISCLOSES_SUPPORT_FROM|DECLARES_NO_COMPETING_INTEREST)\b/g, to: "DISCLOSES_INTEREST", note: "denial = polarity NEGATIVE, speechAct DENIES" },
  { ruling: "R-82", kind: "predicate", re: /\bFUNDER_ROLE_STATEMENT\b/g, to: "FUNDED_BY" },
  { ruling: "R-83", kind: "predicate", re: /\b(RECOMMENDS_FOR|ENDORSES_PRODUCT)\b/g, to: "RECOMMENDS_USE" },
  { ruling: "R-84", kind: "predicate", re: /\bREPORTS_ADVERSE_EXPERIENCE\b/g, to: "CAUSES_ADVERSE_EFFECT" },
  { ruling: "R-52", kind: "predicate", re: /\bD8\.([A-Z0-9]+(?:_[A-Z0-9]+)*)\b/g, to: "$1", note: "drop the D8. module prefix (SCREAMING names only; D8.<Type> references are untouched)" },
  { ruling: "R-53", kind: "predicate", re: /\bDERIVED_FROM_TAXON\b/g, to: "FOOD_FROM_TAXON", scope: { packets: ["D12"] }, note: "D12 food predicate only; DERIVED_FROM_TAXON stays the D1 typed edge" },
  // relationship types
  { ruling: "R-11", kind: "relationship", re: /\b(DERIVED_FROM_ASSERTION|CONSIDERS_ASSESSMENT|CITES_ASSERTION|CITES_ASSESSMENT)\b/g, to: "DERIVED_FROM" },
  { ruling: "R-53", kind: "relationship", re: /\bRESULT_FOR\b/g, to: "QUALITY_RESULT_FOR", scope: { fixtures: ["D12/acrylamide-fried-potato-harm"] }, note: "D8 QualityResult edge; RESULT_FOR elsewhere is D3's own type" },
  // edge-property types and enum type names
  { ruling: "R-10", kind: "edge-property-type", re: /\bStateEpisodeProperties\b/g, to: "AssertedEdgeProperties", note: "the register marks the type exclusive: true" },
  { ruling: "R-57", kind: "enum", re: /\b(ThresholdComparator|SpecComparator)\b/g, to: "QuantityComparator" },
  { ruling: "R-58", kind: "enum", re: /\bD3 QuantityBasis\b/g, to: "D6 AmountBasis" },
  { ruling: "R-58", kind: "enum", re: /\b(QuantityBasis|DosePeriod)\b/g, to: "AmountBasis" },
  { ruling: "R-59", kind: "enum", re: /\bMechanismDirection\b/g, to: "EstimateDirection" },
  { ruling: "R-44", kind: "enum", re: /\bPublicationRevisionStatus\b/g, to: "SourceRevisionKind" },
  { ruling: "R-66", kind: "enum", re: /\b(ApprovalPathway|DesignationType)\b/g, to: "RegulatoryPathway" },
  // enum values
  { ruling: "R-35", kind: "enum-value", re: /\bNORMALIZED_TEXT\b/g, to: "CANONICAL_PROJECTION", note: "contentHashBasis" },
  { ruling: "R-35", kind: "enum-value", re: /\b(EXTRACTOR_TEXT|EXTRACTED_TEXT_BYTES)\b/g, to: "TOOL_RENDITION", note: "contentHashBasis" },
  { ruling: "R-57", kind: "enum-value", re: /\bNOT_LESS_THAN\b/g, to: "GTE", line: /(spec|threshold|dose)Comparator/ },
  { ruling: "R-57", kind: "enum-value", re: /\bNOT_MORE_THAN\b/g, to: "LTE", line: /(spec|threshold|dose)Comparator/ },
  { ruling: "R-57", kind: "enum-value", re: /\bRANGE\b/g, to: "BETWEEN", line: /specComparator/ },
  { ruling: "R-57", kind: "enum-value", re: /\bEQUALS\b/g, to: "EQ", line: /specComparator/ },
  { ruling: "R-57", kind: "enum-value", re: /\bABSENT_IN\b/g, to: "ABSENT", line: /specComparator/ },
  { ruling: "R-59", kind: "enum-value", re: /\bINCREASES\b/g, to: "INCREASED", scope: { packets: ["D2"] }, line: /\bdirection"?:\s*"?INCREASES/ },
  { ruling: "R-59", kind: "enum-value", re: /\bDECREASES\b/g, to: "DECREASED", scope: { packets: ["D2"] }, line: /\bdirection"?:\s*"?DECREASES/ },
  { ruling: "R-44", kind: "enum-value", re: /\bRETRACTED\b/g, to: "RETRACTION", line: /revisionStatus"?:\s*"?RETRACTED\b/, note: "Publication.revisionStatus retyped PublicationRevisionStatus -> SourceRevisionKind" },
  { ruling: "R-44", kind: "enum-value", re: /\bWITHDRAWN\b/g, to: "WITHDRAWAL", line: /revisionStatus"?:\s*"?WITHDRAWN\b/, note: "as above" },
  { ruling: "R-44", kind: "enum-value", re: /"NONE_KNOWN"|\bNONE_KNOWN\b/g, to: "null", line: /revisionStatus"?:\s*"?NONE_KNOWN\b/, note: "SourceRevisionKind is nullable; null = none known" },
  { ruling: "R-66", kind: "enum-value", re: /(?<!US_)\bPRIORITY_REVIEW\b(?!_)/g, to: "US_PRIORITY_REVIEW", scope: { packets: ["D13"] }, line: /valueString"?:\s*"?PRIORITY_REVIEW|designationType = PRIORITY_REVIEW/, note: "OQ-D8-02 mapping" },
  { ruling: "R-66", kind: "enum-value", re: /\bACCELERATED\b(?!_)/g, to: "US_ACCELERATED_APPROVAL", scope: { packets: ["D13"] }, line: /valueString"?:\s*"?ACCELERATED\b|approvalPathway = ACCELERATED\b/, note: "OQ-D8-02 mapping" },
];

// Retired names the residual scan looks for after renaming (whatever is left needs a structural edit or is prose).
const RESIDUAL = [
  { re: /\bMention\b/, why: "R-09/R-27: no Mention node; a surface form is a SourceLocator + RESOLUTION Assessment (CONTEXT), derived MENTIONS from D9 Chunk" },
  { re: /\bStateEpisodeProperties\b/, why: "R-10" },
  { re: /\b(roleTitleVerbatim|stakeClassVerbatim)\b/, why: "R-30: removed edge fields; the printed text moves to the authorizing Assertion qualifiers roleText: / stakeClass:" },
  { re: /\b(declaredNameVerbatim|formVerbatim|statementVerbatim)\b/, why: "R-30: removed ComponentLineProperties fields; qualifiers declaredName: / form: / statement:" },
  { re: /\bnNoChangeContexts\b/, why: "R-47: removed from MechanismProjectionProperties (Q-D2-18 reads Associations)" },
  { re: /\brole[:=]\s*"?(AUTHOR|PUBLISHER)\b/, why: "R-44: EventRole AUTHOR/PUBLISHER removed; drop the INVOLVES rows (authors via D3 AUTHORED_BY)" },
  { re: /\bEventKind\b.*\bPUBLICATION\b|\beventKind"?:\s*"?PUBLICATION\b/, why: "R-44: EventKind PUBLICATION removed" },
  { re: /\bRECOMMENDS_AGAINST\b/, why: "R-83: registered by D9; never with a Target object" },
  { re: /\bHAS_INTEREST_IN\b/, why: "R-78: HOLDS_ROLE | HOLDS_STAKE | RECEIVES_VALUE_FROM" },
  { re: /\b(SPEAKS_AT|OPERATES_CHANNEL|AUTHORED)\b(?!_)/, why: "R-79/R-80/R-81 removed predicates" },
  { re: /\bFINANCING_AMOUNT_SOLD\b/, why: "R-92: FINANCING_AMOUNT with amountKind/amountBasis" },
  { re: /\bsupersedesUid\b/, why: "R-23: same-asserter only (check cross-asserter use)" },
  { re: /assessmentKind"?:\s*"?OTHER\b.*DISCOURSE|DISCOURSE_METRIC/, why: "R-49: discourse metrics are projection-cache properties" },
  { re: /\bderivedFrom=/, why: "R-21: derivedFrom= qualifier -> (a)-[:DERIVED_FROM]->(primary), basisKind CITED_FROM_PRIOR_WORK" },
  { re: /\bHAS_REVISION_STATUS\b/, why: "R-44: scholarly works use REVISES by the revising asserter; HAS_REVISION_STATUS only for non-scholarly Sources" },
  { re: /\bQualityResultFor\b|\bPatentTopic\b/, why: "R-73: unions removed" },
];

// Rulings that ask for fixture edits that are not renames (from rulings.yaml op: edit-fixture and the module runlogs).
const PENDING_EDITS = [
  { fixtures: ["D2/*", "D10/*"], ruling: "R-15", edit: "replace first-author asserters with the D3 Publication (multi-author paper)" },
  { fixtures: ["D2/*"], ruling: "R-58", edit: "cell-free contexts: route IN_MEDIUM, basis MEDIUM_CONCENTRATION" },
  { fixtures: ["D5/sirolimus-label-interactions-harm"], ruling: "R-23", edit: "drop cross-asserter supersedesUid (Greenstone -> Mylan label versions)" },
  { fixtures: ["D8/eurofins-coa-quantity-by-input"], ruling: "R-16", edit: "COA Assertions asserted by the issuing lab, not the executor agent" },
  { fixtures: ["D9/hl-essentials-recut-nmncom-retelling"], ruling: "R-49", edit: "remove the interim OTHER discourse-metric Assessment" },
  { fixtures: ["D9/*"], when: /RENDITION_OF/, ruling: "R-43", edit: "RENDITION_OF rows are asserted (AssertedRecordedProperties + authorizing Assertion), not structural" },
  { fixtures: ["D9/*", "D7/*"], when: /disclosureFinding/, ruling: "R-55", edit: "re-key disclosureFinding values to the merged D7.conflict-relevance list" },
  { fixtures: ["D11/resveratrol-retraction-integrity"], ruling: "R-44", edit: "resveratrol revision statuses -> REVISES by those asserters" },
  { fixtures: ["D12/predimed-retraction-disconfirmation"], ruling: "R-44", edit: "PREDIMED revision status -> REVISES" },
  { fixtures: ["D13/lesne-2006-retraction"], ruling: "R-44", edit: "drop INVOLVES PUBLISHER/AUTHOR rows; a09-a11 statuses -> REVISES" },
  { fixtures: ["D13/lesne-2006-retraction", "D13/bioage-strides-discontinuation"], ruling: "R-21", edit: "derivedFrom= qualifier -> DERIVED_FROM edge, basisKind CITED_FROM_PRIOR_WORK" },
  { fixtures: ["D4/hba1c-two-labs-interference"], ruling: "R-26/R-25", edit: "PERFORMED_BY_LAB d05 becomes asserted with basisKind CURATOR_CLASSIFICATION" },
  { fixtures: ["D1/vitamin-b6-threshold-harm"], ruling: "R-85", edit: "EXCEEDS_DOSE_THRESHOLD is written only inside a published Report, not as stored COMPUTATION Assertions" },
  { fixtures: ["D1/nr-salt-moiety-us-canada"], ruling: "R-68", edit: "SUPPLIES_MATERIAL free-text 'single supplier' -> qualifier exclusivity=SOLE" },
  { fixtures: ["D3/dq-bone-trial-unstructured"], ruling: "R-82", edit: "FUNDED_BY needs a D7.Organization object (funder) with roleText: qualifier; a64 names no funder" },
  { fixtures: ["D5/*"], when: /RECEIVES_VALUE_FROM/, ruling: "R-82", edit: "a stated non-affiliation written as RECEIVES_VALUE_FROM NEGATIVE re-keys to DISCLOSES_INTEREST NEGATIVE / DENIES (no edit-fixture row in rulings.yaml)" },
  { fixtures: ["D12/acrylamide-fried-potato-harm"], ruling: "R-73", edit: "QUALITY_RESULT_FOR -> D6.Product is cut in the candidate (Lot only); the fixture writes it for value-1 Q-D12-03/06 (module-D12 runlog conflict 1). acr-03 is NON-CONFORMING against the candidate until the owner rules R-95 (OD-10): re-key to the D1 predicate MEASURED_CONTENT_IN_PRODUCT, or reinstate the Product member" },
  { fixtures: ["*"], when: /ClaimOccurrence/, ruling: "F-05", edit: "notes or comments name the ClaimOccurrence label; a claim occurrence is Assertion {assertionKind: CLAIM} with no extra label (fix stage)" },
  { fixtures: ["*"], when: /\b(roleTitleVerbatim|stakeClassVerbatim|declaredNameVerbatim|formVerbatim|statementVerbatim|reasonsVerbatim)\b/, ruling: "R-30", edit: "verbatim edge fields (roleTitleVerbatim, stakeClassVerbatim, declaredNameVerbatim, formVerbatim, statementVerbatim) move to Assertion qualifiers" },
];

// ------------------------------------------------------------------------------------------------ helpers
const isText = (f) => /\.(md|ya?ml|json)$/i.test(f);
const isData = (f) => f === "assertions.yaml" || /^intent.*\.json$/.test(f);
const strictPathOnly = (f) => f === "source.md" || f === "locators.yaml";
function inScope(rule, id, folder) {
  if (!rule.scope) return true;
  if (rule.scope.packets && !rule.scope.packets.includes(id)) return false;
  if (rule.scope.fixtures && !rule.scope.fixtures.includes(`${id}/${folder}`)) return false;
  return true;
}
function applyRules(text, rules, counts, key) {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let l = lines[i];
    for (const r of rules) {
      if (r.line && !r.line.test(l)) continue;
      r.re.lastIndex = 0;
      const n = (l.match(r.re) || []).length;
      if (!n) continue;
      l = typeof r.to === "function" ? l.replace(r.re, r.to) : l.replace(r.re, r.to);
      counts[r[key]] = (counts[r[key]] ?? 0) + n;
    }
    lines[i] = l;
  }
  return lines.join("\n");
}
function walk(dir, base = dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, base));
    else out.push(relative(base, p).split("\\").join("/"));
  }
  return out.sort();
}

// ------------------------------------------------------------------------------------------------ copy + rewrite
function repath() {
  const manifest = { generatedBy: "final/_work/repath-fixtures.mjs", fixtures: [], totals: { fixtures: 0, files: 0, byteIdentical: 0, pathOnly: 0, renamed: 0 }, renameTotals: {}, pathTotals: {}, violations: [] };
  const ruleKey = (r) => `${r.ruling} ${r.re.source} -> ${r.to}`;
  for (const r of RENAMES) r.key = ruleKey(r);
  for (const id of PACKET_IDS) {
    const fxDir = join(PACKETS, id, "07-fixtures");
    if (!existsSync(fxDir)) continue;
    const prules = pathRules(id);
    for (const e of readdirSync(fxDir, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name.startsWith("_")) continue;
      const folder = e.name;
      const src = join(fxDir, folder);
      const dst = join(OUT, id, folder);
      const entry = { packet: id, folder, from: `packets/${id}/07-fixtures/${folder}`, to: `final/fixtures/${id}/${folder}`, files: [] };
      for (const rel of walk(src)) {
        const sp = join(src, rel);
        const dp = join(dst, rel);
        mkdirSync(dirname(dp), { recursive: true });
        const buf = readFileSync(sp);
        const base = rel.split("/").pop();
        const fe = { file: rel, srcSha256: sha(buf), pathRewrites: {}, renames: {} };
        let outBuf = buf;
        if (isText(base)) {
          const original = buf.toString("utf8");
          let text = applyRules(original, prules, fe.pathRewrites, "name");
          if (isData(base)) text = applyRules(text, RENAMES.filter((r) => inScope(r, id, folder)), fe.renames, "key");
          if (strictPathOnly(base)) {
            const a = original.split("\n");
            const b = text.split("\n");
            if (a.length !== b.length) manifest.violations.push(`${entry.to}/${rel}: line count changed`);
            for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && !PATH_LINE.test(a[i])) manifest.violations.push(`${entry.to}/${rel}:${i + 1}: non-path change`);
          }
          if (/\.json$/.test(base)) {
            try { JSON.parse(text); } catch (err) { manifest.violations.push(`${entry.to}/${rel}: JSON no longer parses (${err.message})`); }
          }
          outBuf = Buffer.from(text, "utf8");
        }
        writeFileSync(dp, outBuf);
        fe.dstSha256 = sha(outBuf);
        fe.status = fe.srcSha256 === fe.dstSha256 ? "byte-identical" : Object.keys(fe.renames).length ? "renamed" : "path-only";
        manifest.totals.files++;
        manifest.totals[{ "byte-identical": "byteIdentical", "path-only": "pathOnly", renamed: "renamed" }[fe.status]]++;
        for (const [k, v] of Object.entries(fe.renames)) manifest.renameTotals[k] = (manifest.renameTotals[k] ?? 0) + v;
        for (const [k, v] of Object.entries(fe.pathRewrites)) manifest.pathTotals[k] = (manifest.pathTotals[k] ?? 0) + v;
        entry.files.push(fe);
      }
      // residual scan over the rewritten data files and questions.md
      entry.residual = [];
      for (const f of entry.files) {
        if (!(isData(f.file.split("/").pop()) || f.file === "questions.md")) continue;
        const lines = readFileSync(join(dst, f.file), "utf8").split("\n");
        for (const r of RESIDUAL) {
          // code = the line without a full-line or trailing YAML comment; hits only in comments are prose, counted apart
          const hits = [];
          const prose = [];
          lines.forEach((l, i) => {
            const code = /^\s*#/.test(l) ? "" : l.replace(/\s#\s.*$/, "");
            if (r.re.test(code)) hits.push(i + 1);
            else if (r.re.test(l)) prose.push(i + 1);
          });
          if (hits.length) entry.residual.push({ file: f.file, pattern: r.re.source, why: r.why, lines: hits.length, firstLines: hits.slice(0, 5), proseLines: prose.length });
          else if (prose.length) (entry.prose ??= []).push({ file: f.file, pattern: r.re.source, lines: prose.length });
        }
      }
      const dataText = entry.files.filter((x) => isData(x.file.split("/").pop())).map((x) => readFileSync(join(dst, x.file), "utf8")).join("\n");
      entry.pendingEdits = PENDING_EDITS.filter((p) => p.fixtures.some((g) => g === "*" || g === `${id}/${folder}` || g === `${id}/*`) && (!p.when || p.when.test(dataText))).map(({ ruling, edit }) => ({ ruling, edit }));
      manifest.fixtures.push(entry);
      manifest.totals.fixtures++;
    }
  }
  manifest.renameRules = RENAMES.map((r) => ({ ruling: r.ruling, kind: r.kind, from: r.re.source, to: r.to, scope: r.scope ?? null, line: r.line?.source ?? null, note: r.note ?? null, applied: manifest.renameTotals[r.key] ?? 0 }));
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ ok: manifest.violations.length === 0, fixtures: manifest.totals.fixtures, files: manifest.totals.files, byteIdentical: manifest.totals.byteIdentical, pathOnly: manifest.totals.pathOnly, renamed: manifest.totals.renamed, renameApplications: Object.values(manifest.renameTotals).reduce((a, b) => a + b, 0), pathApplications: Object.values(manifest.pathTotals).reduce((a, b) => a + b, 0), violations: manifest.violations }, null, 1));
  return manifest;
}

// ------------------------------------------------------------------------------------------------ index (README)
async function index() {
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const req = (await import("node:module")).createRequire(join(REPO, "packages/schema-workspace/package.json"));
  const YAML = req("yaml");
  const { parse } = req("graphql");
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
  const predicateNames = new Set([...(register.predicateOnly ?? []).map((p) => p.predicate), ...(register.authorizingPredicates ?? []).map((p) => p.predicate ?? p.name)].filter(Boolean));

  // per-fixture facts
  const rows = [];
  for (const fx of manifest.fixtures) {
    const dir = join(OUT, fx.packet, fx.folder);
    const src = readFileSync(join(dir, "source.md"), "utf8");
    const kind = /kind:\s*([a-z-]+)/.exec(src)?.[1] ?? "?";
    const urls = [...new Set([...src.matchAll(/https?:\/\/[^\s|)>`"']+/g)].map((m) => m[0].replace(/[.,;]+$/, "")))];
    const hosts = [...new Set(urls.map((u) => { try { return new URL(u).host.replace(/^www\./, ""); } catch { return u; } }))];
    const q = existsSync(join(dir, "questions.md")) ? readFileSync(join(dir, "questions.md"), "utf8") : "";
    const qids = [...new Set([...q.matchAll(/^\|\s*([^|]+?)\s*\|/gm)].flatMap((m) => [...m[1].matchAll(/\b(Q-[A-Z0-9]+-\d+[a-z]?|CQ-[A-Z]+-\d+[a-z]?)\b/g)].map((x) => x[1])))];
    const data = fx.files.filter((f) => isData(f.file.split("/").pop())).map((f) => readFileSync(join(dir, f.file), "utf8")).join("\n");
    const nonComment = data.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
    const rels = [...relTypes].filter((t) => new RegExp(`\\b${t}\\b`).test(nonComment)).sort();
    rows.push({ fx, kind, hosts, urls, qids, rels, nonComment, data });
  }
  const byPath = new Map(rows.map((r) => [`final/fixtures/${r.fx.packet}/${r.fx.folder}`, r]));

  const ends = (v) => (Array.isArray(v) ? v.map(String) : String(v).split("|")).map((s) => s.trim()).filter(Boolean);
  const show = (v) => ends(v).join(" / ");
  // register check: every entry's fixture path exists and its assertions exercise the relationship
  const regRows = [];
  for (const e of register.relationships) {
    const paths = [e.fixture, ...(e.otherFixtures ?? []), ...(e.exercisedIn ?? [])].filter((p, i, a) => p && a.indexOf(p) === i);
    const primary = e.fixture;
    const exists = existsSync(join(PROGRAM, primary));
    const r = byPath.get(primary) ?? (exists && existsSync(join(PROGRAM, primary, "assertions.yaml")) ? (() => {
      // a fixture outside the re-pathed packet set (final/fixtures/cross-domain/<f>): read its data files directly
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
    // pair evidence (heuristic): within ±8 lines of a non-comment line naming the type, are both endpoint types (or a member
    // of a union / an implementer of an interface endpoint) named? Only reported, never a violation by itself.
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

  // intent validation summary (structural) + planner results, if present
  void 0;
  const vPath = join(FINAL, "_work", "intent-validation.json");
  const validation = existsSync(vPath) ? JSON.parse(readFileSync(vPath, "utf8")) : null;
  const pPath = join(FINAL, "_work", "plan-candidate-results.json");
  const plan = existsSync(pPath) ? JSON.parse(readFileSync(pPath, "utf8")) : null;

  const L = [];
  const t = manifest.totals;
  L.push("# Fixtures (candidate v2)");
  L.push("");
  L.push(`Every packet fixture, re-pathed from \`packets/<packet>/07-fixtures/<folder>/\` to \`final/fixtures/<packet>/<folder>/\` by \`final/_work/repath-fixtures.mjs\` (re-run it to reproduce; \`--index\` re-renders this file). Generated; do not edit by hand. Research only, not medical advice.`);
  L.push("");
  L.push(`- **${t.fixtures} fixtures, ${t.files} files**: ${t.byteIdentical} byte-identical, ${t.pathOnly} with path references rewritten only, ${t.renamed} with ruling renames (assertions.yaml / intent*.json only). Copy violations: ${manifest.violations.length}.`);
  L.push("- **What changed.** Path references (`../../02-questions.md` → `../../../../packets/<P>/02-questions.md`; `../../04-schema-proposal.graphql` and `packets/<P>/04-schema-proposal.graphql` → the accepted module SDL in `final/schema/`; `packets/<P>/07-fixtures/<f>` → `final/fixtures/<P>/<f>`); sibling links `../<folder>` still resolve because the folder layout is kept. In assertions.yaml and intent*.json only, the renames in the table below. `source.md` and `locators.yaml` differ from the packet only on lines that carry a path (checked line by line by the script). Capture bodies (`*.txt`) and helper scripts are byte copies, so every quoteHash / contentHash still matches.");
  L.push("- **What did not change.** Structural edits the rulings ask for (asserter swaps, dropped rows, verbatim edge fields moved to qualifiers, cross-asserter supersession) are not renames; they are listed per fixture under *Pending ruling edits* and in the residual table. uids, hashes, offsets and question ids are untouched (CQ-PF-03 is shown with its R-08 split).");
  L.push("- **Three cross-domain fixtures** (compound profile, product comparison, claim-to-mission-to-report) are written by the synthesizer's own fixture authors under `cross-domain/`, not by this script; they are not in this index or the rename table. The relationship register check below reads a cross-domain fixture when a register entry names one.");
  L.push("- **Acceptance gate (FU-03).** These copies are not acceptance evidence yet. The structural edits about fifteen rulings require are not applied (table \"Residual non-final names and pending ruling edits\"), the D9 fixtures still carry the interim OTHER discourse assessments that R-49 removes, and 0 of 77 intents plan against the candidate (\"Planner check\"). They become acceptance evidence when that table is empty and the copies lint clean against the candidate SDL and the predicate registry.");
  L.push("");
  L.push("## Index");
  L.push("");
  L.push("| fixture | packet | kind | sources (hosts; URLs) | questions answered | relationships exercised (candidate types named in assertions / intents) |");
  L.push("| --- | --- | --- | --- | --- | --- |");
  const r08 = (id, pk) => (id === "CQ-PF-03" ? (pk === "D8" ? "CQ-PF-03→03a" : pk === "D6" ? "CQ-PF-03→03b" : id) : id);
  for (const r of rows) L.push(`| [${r.fx.folder}](${r.fx.packet}/${r.fx.folder}/) | ${r.fx.packet} | ${r.kind} | ${r.hosts.slice(0, 4).join(", ")}${r.hosts.length > 4 ? ` +${r.hosts.length - 4}` : ""}; ${r.urls.length} | ${r.qids.map((x) => r08(x, r.fx.packet)).join(", ") || "—"} | ${r.rels.join(", ") || "—"} |`);
  L.push("");
  const kinds = {};
  for (const r of rows) kinds[r.kind] = (kinds[r.kind] ?? 0) + 1;
  L.push(`Kinds: ${Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", ")}. Distinct question ids answered: ${new Set(rows.flatMap((r) => r.qids)).size}. Candidate relationship types named by at least one fixture: ${new Set(rows.flatMap((r) => r.rels)).size} of ${relTypes.size}.`);
  L.push("");
  L.push("## Renames applied (assertions.yaml, intent*.json)");
  L.push("");
  L.push("| ruling | kind | from (regex) | to | scope / line filter | applications |");
  L.push("| --- | --- | --- | --- | --- | --- |");
  for (const r of manifest.renameRules) L.push(`| ${r.ruling} | ${r.kind} | \`${r.from.replace(/\|/g, "\\|")}\` | ${r.to} | ${[r.scope ? JSON.stringify(r.scope).replace(/"/g, "") : "", r.line ? `line ~ \`${r.line.replace(/\|/g, "\\|")}\`` : "", r.note ?? ""].filter(Boolean).join("; ") || "all"} | ${r.applied} |`);
  L.push("");
  L.push("Not applied as a rename: R-30 `ValueEdgeProperties.currency → unitCode` (0 uses in fixture data; the `currency` keys in the D7 elysium fixture are `Award.currency`, a node property the candidate keeps). `DERIVED_FROM_TAXON` stays in D1 fixtures (D1 typed edge; only D12's food predicate became FOOD_FROM_TAXON, 0 uses). `RESULT_FOR` outside D12 acrylamide is D3's own type.");
  L.push("");
  L.push("Per-fixture rename counts:");
  L.push("");
  for (const r of rows) {
    const sums = {};
    for (const f of r.fx.files) for (const [k, v] of Object.entries(f.renames)) sums[`${f.file}: ${k.replace(/^(\S+) .* -> /, "$1 → ")}`] = v;
    if (Object.keys(sums).length) L.push(`- ${r.fx.packet}/${r.fx.folder}: ${Object.entries(sums).map(([k, v]) => `${k} ×${v}`).join("; ")}`);
  }
  L.push("");
  L.push("## Residual non-final names and pending ruling edits");
  L.push("");
  L.push("Residual = a retired name still present after the renames (comment-only hits are prose). Pending = an `edit-fixture` ruling (or a module-editor hand-off) that changes structure, not a name. Neither is applied here; both go to the fixture owners / the owner.");
  L.push("");
  L.push("| fixture | residual (file: pattern ×lines [first lines]; why) | pending ruling edits |");
  L.push("| --- | --- | --- |");
  for (const r of rows) {
    const res = r.fx.residual.map((x) => `${x.file}: \`${x.pattern.replace(/\|/g, "\\|")}\` ×${x.lines} [${x.firstLines.join(",")}]${x.proseLines ? ` (+${x.proseLines} in comments)` : ""}; ${x.why}`).join("<br>");
    const prose = (r.fx.prose ?? []).map((x) => `${x.file}: \`${x.pattern.replace(/\|/g, "\\|")}\` ×${x.lines} in comments only`).join("<br>");
    const pend = r.fx.pendingEdits.map((p) => `${p.ruling}: ${p.edit}`).join("<br>");
    if (res || pend || prose) L.push(`| ${r.fx.packet}/${r.fx.folder} | ${[res, prose && `<i>prose:</i> ${prose}`].filter(Boolean).join("<br>") || "—"} | ${pend || "—"} |`);
  }
  L.push("");
  L.push("## Relationship register check");
  L.push("");
  const lv = {};
  for (const x of regRows) lv[x.level] = (lv[x.level] ?? 0) + 1;
  L.push(`Every entry of \`final/relationship-register.yaml\` (${regRows.length} entries, ${new Set(regRows.map((x) => x.type)).size} types): does its \`fixture\` path exist, and do that fixture's assertions exercise the relationship? Levels: TYPE = the type name appears in a non-comment line of assertions.yaml; FIELD = a declaring field key (e.g. \`snapshots:\`) appears there; INTENT = only in intent*.json; COMMENT = only in assertions.yaml comments; ABSENT = nowhere; MISSING = path does not exist. Result: ${Object.entries(lv).map(([k, v]) => `${k} ${v}`).join(", ")}.`);
  L.push("");
  const viol = regRows.filter((x) => !["TYPE", "FIELD"].includes(x.level));
  L.push(`### Violations (${viol.length})`);
  L.push("");
  if (viol.length) {
    // hand-checked context for known violations (grep evidence in _runlog/fixtures.md)
    const NOTES = {
      "D3 RENDITION_OF": "No fixture writes RENDITION_OF Source → D3 Publication: the RENDITION_OF rows in the fixtures are D9's Source → MediaWork (6 D9 fixtures) plus one D11 prose note. K/resveratrol-sirt1-evidence-mission questions.md (Q-K-21) says no K fixture writes RENDITION_OF; K/hubbard-2013 describes the PMC/PubMed rendition trap in prose only. Deciding questions Q-K-21 and CQ-EV-05 are value 1, so under R-06 the pair needs a fixture or a numbered request in final/requests.md (R-43 named the K resveratrol PMC/PubMed renditions as its fixture).",
    };
    L.push("| module | type | from → to | fixture | level | also exercised in (otherFixtures / exercisedIn) | note |");
    L.push("| --- | --- | --- | --- | --- | --- | --- |");
    for (const x of viol) L.push(`| ${x.module} | ${x.type} | ${show(x.from)} → ${show(x.to)} | ${x.fixture.replace("final/fixtures/", "")} | ${x.level}${x.how ? ` (${x.how})` : ""} | ${x.others.map((o) => `${o.p.replace("final/fixtures/", "")}${o.exists ? (o.hit ? " ✓" : " ✗") : " (missing)"}`).join(", ") || "—"} | ${NOTES[`${x.module} ${x.type}`] ?? ""} |`);
  } else L.push("None.");
  L.push("");
  const weak = regRows.filter((x) => x.level === "TYPE" && x.pair !== "both endpoints named nearby");
  L.push(`Pair evidence (heuristic, not a violation): for ${regRows.filter((x) => x.level === "TYPE").length - weak.length} of ${regRows.filter((x) => x.level === "TYPE").length} TYPE-level entries both endpoint types (or a union member / interface implementer) are named within ±8 lines of a line naming the type; check by hand: ${weak.map((x) => `${x.module} ${x.type} ${show(x.from)}→${show(x.to)} (${x.fixture.replace("final/fixtures/", "")})`).join("; ") || "none"}.`);
  L.push("");
  L.push("<details><summary>All entries</summary>");
  L.push("");
  L.push("| module | type | from → to | fixture | level | pair evidence |");
  L.push("| --- | --- | --- | --- | --- | --- |");
  for (const x of regRows) L.push(`| ${x.module} | ${x.type} | ${show(x.from)} → ${show(x.to)} | ${x.fixture.replace("final/fixtures/", "")} | ${x.level} | ${x.pair} |`);
  L.push("");
  L.push("</details>");
  L.push("");
  if (validation) {
    L.push("## Intent validation (biotech-knowledge-intent.v1, structural)");
    L.push("");
    L.push(validation.summaryMarkdown);
    L.push("");
  }
  if (plan) {
    L.push("## Planner check (03-SYNTHESIS step 8)");
    L.push("");
    L.push(plan.summaryMarkdown);
    L.push("");
    // file count of edge.assert proposals whose relationshipType is not a candidate relationship type (fix stage, E-5):
    // the planner counts above are rejection reasons of one run, so an intent rejected earlier for another reason is not counted
    const nonV2 = {}; let nonV2n = 0;
    for (const fx of manifest.fixtures) for (const f of fx.files) {
      if (!/^intent.*\.json$/.test(f.file.split("/").pop())) continue;
      const j = JSON.parse(readFileSync(join(OUT, fx.packet, fx.folder, f.file), "utf8"));
      for (const p of j.proposals ?? []) if (p.kind === "edge.assert" && p.relationshipType && !relTypes.has(p.relationshipType)) { nonV2n++; nonV2[p.relationshipType] = (nonV2[p.relationshipType] ?? 0) + 1; }
    }
    L.push(`Reading the counts: the planner codes above are rejection reasons from this one run (an intent already rejected for another reason is not counted again), so RELATIONSHIP_NOT_IN_SCHEMA is not the number of such proposals. Counted in the files, ${nonV2n} \`edge.assert\` proposals name a relationshipType that is not a candidate relationship type, over ${Object.keys(nonV2).length} distinct predicates: ${Object.entries(nonV2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, v]) => `${k} ${v}`).join(", ")}.`);
    L.push("");
  }
  writeFileSync(join(OUT, "README.md"), `${L.join("\n")}\n`);
  writeFileSync(join(FINAL, "_work", "register-fixture-check.json"), `${JSON.stringify(regRows, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, readme: "final/fixtures/README.md", fixtures: rows.length, registerEntries: regRows.length, levels: lv, violations: viol.length, validation: !!validation, plan: !!plan }));
}

const args = process.argv.slice(2);
if (!args.includes("--index-only")) repath();
if (args.includes("--index") || args.includes("--index-only")) await index();
