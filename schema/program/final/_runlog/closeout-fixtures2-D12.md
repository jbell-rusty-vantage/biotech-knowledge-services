# Close-out (second attempt): fixture editor (S) for final/fixtures/D12/ (FU-03)

Date: 2026-10-09. Recovery round: fixtures were reset to 31390a6; the first attempt's log (`closeout-S-fixtures-D12.md`) was
read as a guide and every edit was re-applied and re-verified here. Scope: `final/fixtures/D12/<folder>/` and the D12 rows
of `fixtures/README.md` only. No SDL change, no source.md / locators.yaml / snapshot digest / sourced value change, no
commit. No script other than `lint-fixtures.mjs --fixture` (read-only) was run inside the repo; `repath-fixtures.mjs` was
neither run nor imported. Edits were made by scratch Python scripts in the session scratchpad that open only D12 files.

## Edit sources

- FU-03 table rows: acrylamide (R-09/R-27 Mention; R-73/R-95 acr-03 owner-gated), predimed (R-44), upf (R-44).
- predicates.yaml: no alias / retired entry and no fixtureEdit names a D12 fixture (no predicate-* lint violation).
- rulings.yaml D12 edit-fixture: R-44 "PREDIMED revision status -> REVISES". Applied by principle where the D12 fixture has
  the shape: R-15 (first-author Person asserters), R-42 (PMID/DOI on the work), R-43/R-26 (RENDITION_OF asserted).

## Baseline

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D12/<folder>`

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| acrylamide-fried-potato-harm | 5 | 0 | edge-property-type 1, relationship-pair 2, retired-name 2 (Mention) |
| mcdonalds-fries-prepared-food | 2 | 0 | predicate-unregistered 1, relationship-type 1 (HAS_PACKAGE edge.assert on a structural type) |
| olive-oil-polyphenols-preparation | 0 | 0 | — |
| predimed-retraction-disconfirmation | 0 | 8 | retired-name 8 (HAS_REVISION_STATUS) |
| upf-diet-rct-unstructured | 2 | 3 | edge-property-type 1, relationship-pair 1 (STATED_IN StudyResult -> Source), retired-name 3 |
| **total** | **9** | **11** | 20 violations |

## Edits

- acrylamide: acr-03 edge AssertedEdgeProperties -> AssertedRecordedProperties, with an OWNER-GATED note (R-95 / OD-10);
  intent p03-result-for rationale marks the same; acr-04 note and intent p06 reason reworded (no surface-form node,
  SourceLocator + RESOLUTION Assessment, MENTIONS only from a D9 Chunk). The Product pair itself is not changed.
- mcdonalds: intent p03-package HAS_PACKAGE edge.assert -> edge.structural (no asserter / assertion; properties {}).
- predimed: pred-05 / 05b HAS_REVISION_STATUS FIELD -> D3 REVISES notice (pmid-29897867) -> 2013 article (pmid-23432189),
  revisionKind RETRACTION, by NLM and by NEJM; pred-06 -> REVISES 2018 article (pmid-29897866) -> 2013 article,
  CORRECTED_AND_REPUBLISHED, by NLM; three D3 Publications added, PMID/DOI moved off the Sources (R-42); pred-08..10
  RENDITION_OF Source -> Publication (curation agent, CURATOR_CLASSIFICATION, CONTEXT locator inside each record);
  R-15 pred-01..03, 07 asserter = 2018 Publication, pred-04 = 2013 Publication (Estruch Person removed). Intent: p05 /
  p05b / p06 edge.assert REVISES with edgeProperties.revisionKind; p08..p10 edge.assert RENDITION_OF; new subjects
  pub-2013, pub-2018, pub-notice, src-notice (canonicalUri = the captured notice efetch URI), agent-curation; `estruch`
  subject removed. questions.md Q-D12-09 / Q-D12-10 reworded to REVISES.
- upf: upf-07 (one status over two errata) -> upf-07 + upf-07b D3 REVISES ERRATUM by NLM (31269427 and 33027677 ->
  31105044; validFrom 2019-07-02 / 2020-10-06 = issue dates printed in the ErratumIn citations, PUBLICATION_PROXY; errata
  DOIs taken from the same citations); upf-08 RENDITION_OF JATS Source -> Publication; R-15 upf-01..06 asserter = the
  Publication (Hall Person removed); upf-02 STATED_IN object -> Publication, AssertedRecordedProperties; PMID/DOI moved to
  the Publication (PMCID stays on the Source); StudyResult keys pValueVerbatim / resultVerbatim -> pValueText / resultText
  (values unchanged). Intent: p08 / p08b REVISES, p09 RENDITION_OF, subjects pub-hall / pub-erratum-2019 /
  pub-erratum-2020 / agent-curation; `hall` subject removed. questions.md Q-D12-26 reworded.

Count: 36 structural edits (acrylamide 4, mcdonalds 1, predimed 18, upf 13) over assertions.yaml, intent.json, questions.md.

## Validation

- Intents, biotech-knowledge-intent.v1: zod IngestionIntent (packages/contracts/dist) + JSON Schema (Ajv 2020 +
  ajv-formats 3.0.1), same imports as `_work/validate-intents.mjs`, run from a scratch script
  (`<scratchpad>/d12/validate-d12.mjs`) so `_work/intent-validation.json` is not rewritten:
  acrylamide 7 proposals, mcdonalds 12, olive 6, predimed 11, upf 10 — all zod true, jsonSchema true.
- Residual scan over D12 non-comment lines (Mention, supersedesUid, HAS_REVISION_STATUS, R-30 verbatim fields,
  ClaimOccurrence, nNoChangeContexts, retired predicate names): 0 hits.

## After

| fixture | errors | warnings |
| --- | --- | --- |
| acrylamide-fried-potato-harm | 2 | 0 |
| mcdonalds-fries-prepared-food | 0 | 0 |
| olive-oil-polyphenols-preparation | 0 | 0 |
| predimed-retraction-disconfirmation | 0 | 0 |
| upf-diet-rct-unstructured | 0 | 0 |
| **total** | **2** | **0** |

Remaining, owner-gated: acrylamide acr-03 and intent p03-result-for, relationship-pair
QualityResult-[:QUALITY_RESULT_FOR]->Product (R-73 cut the Product member; R-95 / OD-10).

## Notes / gaps

- intent v1 cannot stage a StudyResult, so D3 STATED_IN (upf-02) stays in assertions.yaml only (stated in the intent notes).
- intent v1 has no evidence roles or Assertion qualifiers: CONTEXT / QUALIFIES roles and the renditionRule / erratumIn /
  issueDate qualifiers are carried in proposal rationales.
- acr-05 CAUSES_ADVERSE_EFFECT has no `population:` qualifier although the registry lists it as required (requiredQualifiers:
  population). The fixture says on purpose "no population qualifier" (laboratory animals, not a person-level population).
  The lint does not check it. Not changed here; the registrar (D5) or the owner should decide whether
  `population:laboratory animals` is expected.
- fixtures/README.md: D12 rows set to applied; a D12/mcdonalds-fries-prepared-food row added (it had no FU-03 row).
