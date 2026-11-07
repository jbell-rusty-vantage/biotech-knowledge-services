# Close-out — fixture editor (S) for final/fixtures/D11/ (FU-03)

Date: 2026-10-09. Scope: final/fixtures/D11/<folder>/ only (5 fixtures). No SDL change. No change to source.md, to locators.yaml
quotes, to snapshot digests or to any sourced number, identifier or quote. No commit.

## Baseline

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D11/<folder>` per fixture (before edits):

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| capture-failures-coverage | 0 | 0 | — |
| nr-chloride-gsrs-identifier-bridge | 8 | 0 | retired-name 4 (Mention), node-type 3 (Mention), edge-property-type 1 (HAS_ACTIVE_MOIETY AssertedEdgeProperties) |
| nr-trial-jats-unstructured | 6 | 3 | edge-property-type 3 (ADMINISTERS, REALIZES_SUBSTANCE, REPORTS_ON AssertedEdgeProperties), edge-property 3 (intent HAS_STUDY_ROLE roleTextVerbatim), predicate-proposed 3 (WELL_TOLERATED_AT_DOSE ×2, DOSE_EXCEEDS_LABEL_RECOMMENDATION) |
| resveratrol-retraction-integrity | 1 | 2 | edge-property 1 (intent REVISES reasonsVerbatim), predicate-proposed 2 (PRECONDITIONS_HEART) |
| sirolimus-spl-boxed-warning | 4 | 0 | retired-name 2 (declaredNameVerbatim), edge-property-type 1 (REALIZES_SUBSTANCE AssertedEdgeProperties), edge-property 1 (intent DECLARES_COMPONENT declaredNameVerbatim) |
| **total** | **19** | **5** | |

Intent validation (scratchpad `validate-d11.mjs`: zod `IngestionIntent` from packages/contracts/dist + Ajv 2020 on
packages/contracts/json-schema/biotech-knowledge-intent.v1.json, the same two checks as `_work/validate-intents.mjs`):
5/5 intent.json valid (zod true, JSON Schema true) before edits.

Edit sources:
- FU-03 table rows D11/* in `fixtures/README.md`: R-09/R-27 (chloride Mention), R-44 + R-30 (resveratrol), R-30 (sirolimus).
- `vocabularies/predicates.yaml`: no `fixtureEdit` names a D11 fixture; no alias-of / retired-by predicate is used by a D11
  fixture (lint: 0 predicate-alias, 0 predicate-retired). The proposed-new rows used by D11 fixtures are registrar-gated (D3).
- `_work/rulings.yaml` D11 edit-fixture ops: R-44 only ("resveratrol revision statuses -> REVISES by those asserters").
- Rulings that touch D11 fixture data although no row names them: R-10/R-26 (AssertedRecordedProperties on asserted
  recorded-only types; DECLARES_COMPONENT is asserted in the candidate), R-15 (multi-author paper asserter = the D3
  Publication), R-35 (a Firecrawl rendition is TOOL_RENDITION, not CANONICAL_PROJECTION), R-42/R-43 (no Identifier shared by a
  Source and a work; renditions are grouped by asserted RENDITION_OF).
