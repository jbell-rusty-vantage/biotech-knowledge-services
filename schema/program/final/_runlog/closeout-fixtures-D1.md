# Close-out — fixture editor (S) for final/fixtures/D1 (FU-03), 2026-10-09

Scope: `final/fixtures/D1/<folder>/` only (5 fixtures). No SDL change, no source.md / locators.yaml / snapshot digest /
sourced-value change. Nothing committed (the coordinator commits).

## Inputs read
- FU-03 table rows `D1/*` in `final/fixtures/README.md` (R-30 on 4 fixtures; R-68 nr-salt; R-85 vitamin-b6; nr-trial prose only).
- `final/_work/rulings.yaml` `modules.D1`: no `edit-fixture` op (register / question / seam edits only).
- `final/vocabularies/predicates.yaml`: entries whose `fixtureEdit` names D1 fixtures: EXCEEDS_DOSE_THRESHOLD (R-85, report-only);
  SUPPLIES_MATERIAL qualifiers (R-68). No alias / retired predicate is used by D1 fixtures (lint before: 0 predicate-alias, 0 predicate-retired).
- decision-report R-15, R-30, R-42, R-43, R-68, R-85.

## Lint before (`node C:/.../final/_work/lint-fixtures.mjs --fixture D1/<folder>`)
| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| ashwagandha-plant-part-harm | 4 | 0 | edge-property 2, retired-name 2 (R-30) |
| lgg-strain-resolution | 8 | 4 | edge-property 4, retired-name 4 (R-30); predicate-proposed 4 |
| nr-salt-moiety-us-canada | 14 | 8 | edge-property 8, retired-name 6 (R-30); predicate-proposed 8 |
| nr-trial-unstructured | 0 | 0 | — |
| vitamin-b6-threshold-harm | 22 | 8 | edge-property 10, retired-name 8 (R-30); predicate-report-only 4 (R-85); predicate-proposed 8 |
| **D1** | **48** | **20** | |

## Edits
1. **R-30** (scratchpad `d1-r30.mjs`): 12 DECLARES_COMPONENT verbatim edge fields moved in assertions.yaml (w08; g08, g10; a10, a12;
   b11, b12, b14) to a `qualifiers: ["declaredName:<text>", "form:<text>"]` line on the same (authorizing) Assertion, and the
   same 12 removed from intent `edgeProperties`. Intent v1 `edge.assert.assertion` has no `qualifiers` field
   (additionalProperties false), so each proposal's `rationale` is prefixed `qualifiers: declaredName:…; form:…` (precedent:
   cross-domain intent-r2 `roleText:`); intent `notes` record the gap. nr-salt `"amount": 263.0` kept as written.
2. **R-68** nr-salt p02 SUPPLIES_MATERIAL: qualifier "single supplier" → `exclusivity=SOLE` plus `buyer=org-niagen-bio`
   (the 10-K filer, "We rely on a single supplier, W.R. Grace, for NRC", l-10k-single-supplier); note updated. p02 stays out
   of the intent (object-bearing predicate-only; unchanged v1 gap).
3. **R-85** vitamin-b6: c10a–c10d removed from `assertions` (no stored EXCEEDS_DOSE_THRESHOLD Assertion); added `reports:`
   rpt-b6-threshold-screen (K.Report, reportKind COMPARISON, status PROPOSED, ASSESSES con-b6, DERIVED_FROM c08, c09, d01, d02,
   s01) with `items:` (HAS_ITEM) c10a–c10d as ROW items (same ids, since source.md names them; predicate EXCEEDS_DOSE_THRESHOLD,
   valueBoolean, cellValues, ASSESSES the label version + con-b6, DERIVED_FROM their own daily amount and threshold, body
   offsets). New file `composed-body-b6-threshold-screen.txt` (BellLabs-composed body, 1,164 code points),
   bodyDigest sha256:7ff64a042018db335b107ff5b799c02c96fd23967a937d88d10d10a70df56f8c (re-verified; row offsets re-sliced).
   Activity act-report (ANSWER) added. questions.md Q-D1-03 "answered through" now: retrieved over c06/c08/c09/d01/d02 at query
   time + the published Report rows. intent notes: c10a–d dropped from the CALCULATED list, Report noted as not expressible in v1.
   Items nest under the Report: the lint flags a top-level `reportItems:` array's `predicate` as stored (its report detection
   reads the parent key only for objects, not array elements) — recorded here, lint not changed.
4. **R-15 / R-42 / R-43** nr-trial (not listed in the table's pending column, but the ruling covers it: person-conze "stands for
   the author group"): t01–t06 asserter → D3 Publication pub-sr2019 (title from source.md; publicationKind ARTICLE, venueName
   Sci Rep); PMID / PMCID / DOI moved from the K Source to the Publication (one identifier, one Subjectable); person-conze node
   dropped (no author-level statement); t00 RENDITION_OF src-sr2019 → pub-sr2019 (AssertedRecordedProperties, asserter K Agent
   agent-ingest, evidence l-epmc-ids) in assertions.yaml and as an intent `edge.assert`. Gives FX-10 one more
   Source → Publication RENDITION_OF fixture row.

## Checks
- Intent v1 (zod `IngestionIntent` + JSON Schema biotech-knowledge-intent.v1, Ajv 2020 + ajv-formats; scratchpad `val-d1.mjs`,
  same method as `_work/validate-intents.mjs` without rewriting the shared `intent-validation.json`): 5/5 valid both ways.
- `git status`: only assertions.yaml, intent.json, vitamin-b6 questions.md, the new body file, and the 5 D1 rows of
  fixtures/README.md changed; source.md / locators.yaml untouched.

## Lint after
| fixture | errors | warnings (all predicate-proposed, registrar-gated) |
| --- | --- | --- |
| ashwagandha-plant-part-harm | 0 | 0 |
| lgg-strain-resolution | 0 | 4 DECLARED_VIABLE_COUNT (D6) |
| nr-salt-moiety-us-canada | 0 | 8 MOLECULAR_WEIGHT ×4, MOLECULAR_FORMULA ×2 (D1), MAX_DAILY_SERVINGS ×2 (D6) |
| nr-trial-unstructured | 0 | 0 |
| vitamin-b6-threshold-harm | 0 | 8 MOLECULAR_WEIGHT ×4 (D1), MAX_DAILY_SERVINGS ×4 (D6) |
| **D1** | **0** (from 48) | **20** (unchanged; owner/registrar-gated) |

## Not changed / for others
- README Index rows (relationships exercised) for D1 not regenerated: nr-trial now also exercises RENDITION_OF; vitamin-b6
  HAS_ITEM / ASSESSES / DERIVED_FROM from a Report.
- source.md of vitamin-b6 still says "threshold screens c10a–c10d (one CALCULATED Assertion per label × threshold)"; source.md
  is frozen, the assertions.yaml header and questions.md carry the R-85 reading.
- `_work/fixture-lint-baseline.json` not rewritten (shared; coordinator re-runs `--baseline`).
