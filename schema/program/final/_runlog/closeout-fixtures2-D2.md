# Close-out (second attempt) — fixture editor (S) for final/fixtures/D2/ (FU-03)

Date: 2026-10-09. Scope: final/fixtures/D2/<folder>/ only (5 fixtures) and the 5 D2 rows of the fixtures/README.md FU-03 table.
No SDL change, no source.md / locators.yaml / snapshot digest / sourced value change, no commit. Recovery round: the folder
was reset to 31390a6; the lost first attempt's log (`_runlog/closeout-S-fixtures-D2.md`) was read as a guide and every edit
was re-applied and re-verified here. Scripts: only `final/_work/lint-fixtures.mjs --fixture D2/<folder>` (report mode, writes
nothing) was executed from final/_work; repath-fixtures.mjs was not run or imported (lint-fixtures reads its RESIDUAL as text).
Intent validation used a read-only scratchpad script (zod IngestionIntent + Ajv 2020-12 + ajv-formats@3.0.1 over the D2
intents only; writes nothing; final/_work/intent-validation.json not touched).

## Baseline (before edits)

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D2/<folder>`

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| dq-senescence-biomarker-path | 2 | 0 | edge-property 1, retired-name 1 (nNoChangeContexts) |
| metformin-exercise-harm | 4 | 0 | edge-property 2, retired-name 2 (nNoChangeContexts) |
| nr-muscle-unstructured | 7 | 0 | edge-property 3, retired-name 3 (nNoChangeContexts), predicate-alias 1 (HOLDS_EQUITY_IN) |
| reactome-chembl-reference | 2 | 0 | edge-property 1, retired-name 1 (nNoChangeContexts) |
| sirt1-activation-disconfirmation | 4 | 0 | edge-property 2, retired-name 2 (nNoChangeContexts) |
| **total** | **19** | **0** | |

Intent v1 (scratchpad validator) before edits: 5/5 zod ok, 5/5 JSON Schema ok; proposals dq 14, metformin 9, nr 11, reactome 13, sirt1 7.

Edit sources: FU-03 rows D2/* (R-47 nNoChangeContexts; R-15; R-58); predicates.yaml fixtureEdit for D2 (HOLDS_EQUITY_IN →
HOLDS_STAKE, nr-muscle A-nr-06); rulings.yaml D2 edit-fixture ops (R-15, R-58) plus D2 rulings that touch fixture data
(R-47 score null on AFFECTS_MECHANISM; R-26 mapping basis CURATOR_CLASSIFICATION; R-59 DECREASED in prose; R-30 stakeClass:
qualifier). Q-D2-21 patternEdit (R-89) belongs to the pattern owner, not applied here.

## Edits applied (assertions.yaml, intent.json, questions.md; source.md / locators.yaml untouched)

Applied with a scratchpad script that writes only final/fixtures/D2/<folder>/ files and asserts the exact count of every
replacement (dry run first, then write; 15 files). A close-out header comment was added to each assertions.yaml.

| fixture | edits |
| --- | --- |
| all 5 | R-47: `nNoChangeContexts` removed from all 9 AFFECTS_MECHANISM derived edges; `score` set to null on the 6 that carried a value (1.0 ×4, 0.5, 0.0; the other 3 were already null); comment above `derivedEdges:` |
| dq-senescence-biomarker-path | R-15: first-author Person `asserter-hickson2019` → D3.Publication `pub-hickson2019` (PMID 31542391, PMCID PMC6796530, DOI 10.1016/j.ebiom.2019.08.069, EBioMedicine 2019;47:446-456, all from source.md) as asserter of A-dq-01..07; intent.json subject replaced (nodeType Publication, identifiers, sorted) and both REFLECTS_MECHANISM edge.assert `asserterRef`; notes; R-59 prose DECREASES → DECREASED (crossDomainPath ×1, questions.md ×2) |
| metformin-exercise-harm | R-15: `pub-konopka2019` (PMID 30548390, PMCID PMC6351883, DOI 10.1111/acel.12880) asserts A-m-01/02/04/05; A-m-03 stays ChEMBL; intent notes (no asserter is expressed in this intent); R-59 prose ×3 in questions.md |
| nr-muscle-unstructured | predicates.yaml fixtureEdit: A-nr-06 HOLDS_EQUITY_IN → HOLDS_STAKE, `edgeProperties: { stakeKind: EQUITY }`, R-30 qualifier `stakeClass: owns stock` (verbatim from L-nr-09); R-15: A-nr-01..05 asserted by `pub-elhassan2019` (PMID 31412242, PMCID PMC6702140, DOI 10.1016/j.celrep.2019.07.043), A-nr-06 (one author's competing interest) asserted by the named Person `person-cb`; intent.json: new edge.assert `p-a-nr-06` HOLDS_STAKE person-cb → org-chromadex (asserterRef person-cb, evidence l-nr-09, stakeKind EQUITY, validFrom 2019-08-13 PUBLICATION_PROXY as in assertions.yaml); A-nr-06 removed from the notes' not-expressed list; questions.md CQ-MX-01 (asserter), Q-D2-21 (HOLDS_STAKE), Q-D2-01 (R-59) |
| reactome-chembl-reference | R-26: hallmark-mapping A-r-ref-03..06 basisKind EXPERT_OPINION → CURATOR_CLASSIFICATION (assertions.yaml ×4, intent.json edge.assert ×3; A-r-ref-03 has no proposal); header comment; notes; questions.md Q-D2-12 and R-59 ×1 |
| sirt1-activation-disconfirmation | R-15: `pub-pacholec2010` (PMID 20061378, PMCID PMC2832984, DOI 10.1074/jbc.M109.088682) asserts A-s-01..03, `pub-howitz2003` (PMID 12939617, DOI 10.1038/nature01960) asserts A-s-04 (author affiliations kept in the Publication notes); R-58: the 3 IN_VITRO_CELL_FREE contexts get route IN_MEDIUM + exposureBasis MEDIUM_CONCENTRATION (assertions.yaml + intent.json subjects; exposureAmount stays null, not stated); comment rewritten; questions.md Q-D2-05 (R-47 null count from A-s-01, R-58, R-15); notes |

Not invented: no concentration for the cell-free contexts; no publishedAt on the new Publications (only venue/citation and
the identifiers printed in source.md); no RENDITION_OF from the captured Sources to the Publications (not required by the rows).
Intent v1 gap recorded in nr-muscle notes: edge.assert has no qualifiers field, so `stakeClass: owns stock` lives only in
assertions.yaml. Q-D2-21 patternEdit (R-89) is the pattern owner's. R-58 is n/a for dq, metformin, nr-muscle, reactome (no
cell-free context); R-15 is n/a for reactome (no author asserter).

## Checks (after edits)

- `node .../_work/lint-fixtures.mjs --fixture D2/<folder>`: 0 errors, 0 warnings on all 5 (19 → 0).
- `node .../_work/lint-fixtures.mjs` (summary only, nothing written): byPacket D2 = {fixtures 5, clean 5, errors 0, warnings 0}.
- Intent v1 (scratchpad validator, read-only): 5/5 zod ok, 5/5 JSON Schema ok; proposals dq 14, metformin 9, nr 12 (+1), reactome 13, sirt1 7.
- YAML parse of all 5 assertions.yaml ok; every assertion asserter ref resolves to an entity; every intent asserterRef resolves to a subject; no derived edge carries nNoChangeContexts or a non-null score.
- `git status`: only the 15 D2 assertions/intent/questions files, README.md (D2 rows) and this log changed by this role; source.md and locators.yaml unchanged.
- fixtures/README.md FU-03 rows D2/* (5) rewritten to "applied …; owner-gated: none" (single read-modify-write of exactly those 5 lines; diff against a pre-edit copy shows only lines 198–202 changed).
