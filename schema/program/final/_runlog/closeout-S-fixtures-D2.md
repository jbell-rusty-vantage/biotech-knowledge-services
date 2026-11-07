# Close-out — fixture editor (S) for final/fixtures/D2/ (FU-03)

Date: 2026-10-09. Scope: final/fixtures/D2/<folder>/ only (5 fixtures). No SDL change, no source.md / locators.yaml / snapshot
digest / sourced value change, no commit.

## Baseline

`node C:/.../final/_work/lint-fixtures.mjs --fixture D2/<folder>` per fixture (before edits):

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| dq-senescence-biomarker-path | 2 | 0 | edge-property 1, retired-name 1 (nNoChangeContexts) |
| metformin-exercise-harm | 4 | 0 | edge-property 2, retired-name 2 (nNoChangeContexts) |
| nr-muscle-unstructured | 7 | 0 | edge-property 3, retired-name 3 (nNoChangeContexts), predicate-alias 1 (HOLDS_EQUITY_IN) |
| reactome-chembl-reference | 2 | 0 | edge-property 1, retired-name 1 (nNoChangeContexts) |
| sirt1-activation-disconfirmation | 4 | 0 | edge-property 2, retired-name 2 (nNoChangeContexts) |
| **total** | **19** | **0** | |

Edit sources: FU-03 table rows D2/* (R-47 nNoChangeContexts; R-15; R-58), predicates.yaml fixtureEdit for D2
(HOLDS_EQUITY_IN → HOLDS_STAKE, nr-muscle A-nr-06), rulings.yaml D2 edit-fixture ops (R-15, R-58) plus the D2 rulings that
touch fixture data (R-47 score stays null on AFFECTS_MECHANISM; R-26 curator mapping basis CURATOR_CLASSIFICATION; R-59
DECREASED in prose).

## Edits applied (assertions.yaml, intent.json, questions.md; no source.md / locators.yaml change)

| fixture | edits |
| --- | --- |
| all 5 | R-47: `nNoChangeContexts` removed from 9 AFFECTS_MECHANISM derived edges; `score` set to null on all 9 (was 1.0 ×4, 0.5, 0.0; R-47: executor keeps score null on AFFECTS_MECHANISM); comment under `derivedEdges:` |
| dq-senescence-biomarker-path | R-15: first-author Person → D3.Publication `pub-hickson2019` (PMID 31542391, PMCID PMC6796530, DOI from source.md) as asserter of A-dq-01..07; intent.json subject replaced (nodeType Publication + identifiers) and both REFLECTS_MECHANISM edge.assert `asserterRef`; R-59 prose DECREASES → DECREASED (crossDomainPath, questions.md ×2) |
| metformin-exercise-harm | R-15: `pub-konopka2019` (PMID 30548390) asserts A-m-01/02/04/05; A-m-03 stays ChEMBL; intent notes; R-59 prose ×3 |
| nr-muscle-unstructured | predicates.yaml fixtureEdit: A-nr-06 HOLDS_EQUITY_IN → HOLDS_STAKE (edgeProperties stakeKind EQUITY; qualifier `stakeClass: owns stock`); R-15: A-nr-01..05 asserted by `pub-elhassan2019` (PMID 31412242), A-nr-06 (one author's competing interest) asserted by the named Person C.B.; intent.json: new edge.assert `p-a-nr-06` HOLDS_STAKE person-cb → org-chromadex (asserterRef person-cb, edgeProperties stakeKind EQUITY), notes updated; questions.md CQ-MX-01 / Q-D2-21 |
| reactome-chembl-reference | R-26: hallmark-mapping Assertions A-r-ref-03..06 basisKind EXPERT_OPINION → CURATOR_CLASSIFICATION (assertions.yaml ×4, intent.json edge.assert ×3; A-r-ref-03 has no intent proposal); header comment; questions.md Q-D2-12; R-59 prose ×1 |
| sirt1-activation-disconfirmation | R-15: `pub-pacholec2010` (PMID 20061378) asserts A-s-01..03, `pub-howitz2003` (PMID 12939617) asserts A-s-04; R-58: 3 CELL_FREE contexts get route IN_MEDIUM + exposureBasis MEDIUM_CONCENTRATION (assertions.yaml + intent.json subjects; exposureAmount stays null, not stated); questions.md Q-D2-05 |

Not invented: no concentration for the cell-free contexts; no RENDITION_OF from the captured Source to the new Publication
records (not required by the rows; the Publication carries the identifiers printed in source.md); the R-26 curation-record
Source/snapshot is still uncaptured (11 item 12). Q-D2-21 patternEdit (R-89) is the pattern owners', not applied here.

## Checks

- `node .../_work/lint-fixtures.mjs --fixture D2/<folder>` after edits: 0 errors, 0 warnings on all 5 (19 → 0).
- Full summary (`lint-fixtures.mjs`, no --baseline, nothing written): byPacket D2 = 5 fixtures, 5 clean, 0 errors, 0 warnings.
- Intent v1 structural validation, D2 only (scratchpad copy of the validate-intents.mjs method, zod IngestionIntent + Ajv
  2020-12 + ajv-formats@3.0.1; final/_work/intent-validation.json not rewritten): 5/5 zod ok, 5/5 JSON Schema ok;
  proposals dq 14, metformin 9, nr-muscle 12 (+1), reactome 13, sirt1 7.
- YAML parse of all 5 assertions.yaml ok; every assertion asserter ref resolves to an entity.
- fixtures/README.md FU-03 rows D2/* (5) set to "applied", owner-gated: none.
