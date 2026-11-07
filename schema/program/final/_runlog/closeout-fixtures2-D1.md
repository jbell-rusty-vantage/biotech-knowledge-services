# Close-out (second attempt) — fixture editor (S) for final/fixtures/D1 (FU-03), 2026-10-09

Scope: `final/fixtures/D1/<folder>/` (5 fixtures) and the 5 D1 rows of the FU-03 table in `final/fixtures/README.md`.
No SDL change; no source.md / locators.yaml / snapshot digest / sourced value changed. Nothing committed.
Guide used: the lost first attempt's log `_runlog/closeout-fixtures-D1.md` (same decisions re-applied and re-verified;
the R-85 Report was re-composed so that each ROW ASSESSES exactly one entity, per the ReportItem row rule).
Not run: `_work/repath-fixtures.mjs` (read as text only, by lint-fixtures.mjs itself); `_work/validate-intents.mjs`
(it rewrites the shared `intent-validation.json`; a scratchpad copy restricted to D1 was used instead).

## Inputs
- FU-03 rows D1/*: R-30 (ashwagandha, lgg, nr-salt, vitamin-b6), R-68 (nr-salt), R-85 (vitamin-b6); nr-trial prose only.
- `_work/rulings.yaml` `modules.D1`: no `edit-fixture` op. R-68 rename MANUFACTURES_MATERIAL → MANUFACTURES: no D1 fixture uses it.
- `vocabularies/predicates.yaml`: EXCEEDS_DOSE_THRESHOLD `storage: report-only`, fixtureEdit = vitamin-b6 c10a–d → Report;
  SUPPLIES_MATERIAL qualifiers `buyer`, `exclusivity`. No alias / retired predicate in D1 fixtures.
- decision-report R-15, R-26, R-30, R-42, R-43, R-68, R-85.

## Lint before — `node C:/.../final/_work/lint-fixtures.mjs --fixture D1/<folder>` (report mode)
| fixture | errors | warnings |
| --- | --- | --- |
| ashwagandha-plant-part-harm | 4 (edge-property 2, retired-name 2) | 0 |
| lgg-strain-resolution | 8 (edge-property 4, retired-name 4) | 4 |
| nr-salt-moiety-us-canada | 14 (edge-property 8, retired-name 6) | 8 |
| nr-trial-unstructured | 0 | 0 |
| vitamin-b6-threshold-harm | 22 (edge-property 10, retired-name 8, predicate-report-only 4) | 8 |
| **D1** | **48** | **20** |

## Edits
1. R-30 (scratchpad `d1-r30.mjs`, writes only under fixtures/D1): 12 verbatim fields on 8 DECLARES_COMPONENT line Assertions
   (w08; g08, g10; a10, a12; b11, b12, b14) moved from `edge.properties` to `qualifiers: ["declaredName:…", "form:…"]` on
   the same Assertion; same 12 removed from intent `edgeProperties`; each proposal's `rationale` now starts
   `qualifiers: declaredName:…; form:… |` (intent v1 edge.assert.assertion has no qualifiers field — gap noted in intent
   `notes`). nr-salt `"amount": 263.0` kept as written.
2. R-68 nr-salt p02 SUPPLIES_MATERIAL: `"single supplier"` → `exclusivity=SOLE`, `buyer=org-niagen-bio` (the 10-K filer:
   "We rely on a single supplier, W.R. Grace, for NRC", l-10k-single-supplier); note updated. p02 stays out of the intent
   (object-bearing predicate-only; unchanged v1 gap).
3. R-85 vitamin-b6: c10a–c10d removed from `assertions`; new `reports:` rpt-b6-threshold-screen (K.Report, COMPARISON,
   PROPOSED, policy:bl-publish@fixture, policyOutcome REVIEW, publishedAt null; ASSESSES con-b6 + both label versions;
   DERIVED_FROM c08, c09, d01, d02; generatedBy new Activity act-report ANSWER) with `items:` (HAS_ITEM) sec:scope,
   sec:threshold-screen (HARMS_AND_AVOIDANCE) and 4 ROW items with the ids c10a–c10d (source.md names them), each ASSESSES its
   one label version, cites its own daily amount + threshold, cellValues carry `EXCEEDS_DOSE_THRESHOLD=<bool>`, a
   non-property `screen:` keeps predicate/rule/value. Body file `composed-body-b6-threshold-screen.txt` (1,116 code points,
   LF, ASCII; sha256:7012659d1ec792b96e97408896a9301a04678350c33006e11c6978d7d74ba88d; section/row offsets computed from the
   file). Header comment, questions.md Q-D1-03 "answered through", intent notes updated.
4. R-15 / R-42 / R-43 nr-trial (ruling-wide; the first attempt applied it too): t01–t06 asserter person-conze → D3
   Publication pub-sr2019 (title, venue "Sci Rep", citationText from source.md; publicationKind ARTICLE); PMID/PMCID/DOI moved
   from the Source to the Publication; person-conze node dropped (no author-level statement); t00 RENDITION_OF src-sr2019 →
   pub-sr2019 (AssertedRecordedProperties, asserter K Agent agent-ingest, evidence l-epmc-ids) in assertions.yaml and as an
   intent `edge.assert`.

## Checks
- Intent v1 (scratchpad `val-d1.mjs`: zod `IngestionIntent` + Ajv 2020 over biotech-knowledge-intent.v1.json with
  ajv-formats): 5/5 valid both ways (proposals 11/12/13/9/15).
- `git status`: only D1 assertions.yaml ×5, intent.json ×5, vitamin-b6 questions.md, the new body file and the 5 D1 FU-03 rows.

## Lint after
| fixture | errors | warnings (all predicate-proposed, registrar-gated) |
| --- | --- | --- |
| ashwagandha-plant-part-harm | 0 | 0 |
| lgg-strain-resolution | 0 | 4 DECLARED_VIABLE_COUNT (D6) |
| nr-salt-moiety-us-canada | 0 | MOLECULAR_WEIGHT ×4, MOLECULAR_FORMULA ×2 (D1), MAX_DAILY_SERVINGS ×2 (D6) |
| nr-trial-unstructured | 0 | 0 |
| vitamin-b6-threshold-harm | 0 | MOLECULAR_WEIGHT ×4 (D1), MAX_DAILY_SERVINGS ×4 (D6) |
| **D1** | **0** (from 48) | **20** (unchanged) |

## For the coordinator
- README Index rows for D1 (relationships exercised) not regenerated: nr-trial now also RENDITION_OF; vitamin-b6 HAS_ITEM.
- vitamin-b6 source.md still describes c10a–d as CALCULATED Assertions (frozen; header + questions.md carry R-85).
- `_work/fixture-lint-baseline.json` and `_work/intent-validation.json` not rewritten (shared).
