# Close-out — fixture editor (S) for final/fixtures/D12/ (FU-03)

Date: 2026-10-09. Scope: final/fixtures/D12/<folder>/ only (5 fixtures). No SDL change, no source.md / locators.yaml /
snapshot digest / sourced value change, no commit.

## Edit sources

- FU-03 table rows D12/* in fixtures/README.md: acrylamide (R-09/R-27 Mention; R-73/R-95 acr-03), predimed (R-44),
  upf (R-44 residual HAS_REVISION_STATUS).
- predicates.yaml: no fixtureEdit / alias / retired entry names a D12 fixture (lint shows no predicate-* violation).
- rulings.yaml D12 edit-fixture ops: R-44 "PREDIMED revision status -> REVISES". Rulings applied by principle where a D12
  fixture carries the shape: R-15 (first-author asserters, predimed + upf), R-43/R-26 (RENDITION_OF asserted), R-42
  (PMID/DOI on the work, not on the rendition).

## Baseline

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D12/<folder>`

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| acrylamide-fried-potato-harm | 5 | 0 | edge-property-type 1, relationship-pair 2 (QUALITY_RESULT_FOR -> Product), retired-name 2 (Mention) |
| mcdonalds-fries-prepared-food | 2 | 0 | predicate-unregistered 1 + relationship-type 1 (HAS_PACKAGE edge.assert on a structural type) |
| olive-oil-polyphenols-preparation | 0 | 0 | — |
| predimed-retraction-disconfirmation | 0 | 8 | retired-name 8 (HAS_REVISION_STATUS) |
| upf-diet-rct-unstructured | 2 | 3 | edge-property-type 1 + relationship-pair 1 (STATED_IN StudyResult -> Source), retired-name 3 (HAS_REVISION_STATUS) |
| **total** | **9** | **11** | 20 violations |

## Edits

- acrylamide: acr-04 note and intent p06 mention.stage reason reworded (no Mention node; RESOLUTION Assessment on the
  SourceLocator; MENTIONS only from D9 Chunk). acr-03 edge typed AssertedRecordedProperties (validTime stays on the
  Assertion); intent p03 rationale marks the Product end OWNER-GATED (R-95 / OD-10). The pair itself is not changed.
- mcdonalds: intent p03-package edge.assert -> edge.structural (HAS_PACKAGE is structural in the candidate; no asserter).
- predimed: pred-05/05b/06 HAS_REVISION_STATUS FIELD -> D3 REVISES RELATIONSHIP (notice 29897867 -> 2013 RETRACTION by
  NLM and by NEJM; 2018 29897866 -> 2013 CORRECTED_AND_REPUBLISHED by NLM; edge RevisionEdgeProperties.revisionKind);
  new D3 Publications pmid-23432189 / -29897866 / -29897867 (PMID/DOI moved from the Sources, R-42); new pred-08..10
  RENDITION_OF Source -> Publication (asserter hu:agent:d12-curation-agent, CONTEXT locator inside each record, qualifier
  rendition-rule); R-15 pred-01..04, 07 asserter = the Publication (Estruch Person removed); intent mirrors all of it
  (p05/p05b/p06 edge.assert REVISES with edgeProperties.revisionKind, p08..p10 edge.assert RENDITION_OF, subjects
  pub-2013 / pub-2018 / pub-notice / src-notice (canonicalUri = the captured efetch URI of snap-predimed-notice) /
  agent-curation); questions.md Q-D12-09/10 reworded.
- upf: upf-07 (one HAS_REVISION_STATUS, two errata) -> upf-07 + upf-07b D3 REVISES ERRATUM by NLM (erratum 31269427 and
  correction 33027677 -> article 31105044; validFrom = issue dates printed in the ErratumIn citations 2019-07-02 and
  2020-10-06, PUBLICATION_PROXY); upf-08 RENDITION_OF JATS Source -> Publication; R-15 upf-01..06 asserter = the
  Publication (Hall Person removed); upf-02 STATED_IN object -> Publication, AssertedRecordedProperties; PMID/DOI moved to
  the Publication (PMCID stays on the Source); StudyResult entity keys pValueVerbatim/resultVerbatim -> pValueText/
  resultText (values unchanged); intent mirrors it (p08/p08b REVISES, p09 RENDITION_OF, subjects pub-hall /
  pub-erratum-2019 / pub-erratum-2020 / agent-curation); questions.md Q-D12-26 reworded.

Counts: 34 structural edits (acrylamide 4, mcdonalds 1, predimed 17, upf 12) across assertions.yaml, intent.json and
questions.md.

## Validation

- Intents: biotech-knowledge-intent.v1, zod IngestionIntent (packages/contracts/dist) + JSON Schema (Ajv 2020, ajv-formats),
  same imports as _work/validate-intents.mjs, run from a scratch script so the shared intent-validation.json is not
  rewritten: all 5 D12 intents zod valid, jsonSchema valid (acrylamide 7 proposals, mcdonalds 12, olive 6, predimed 11, upf 10).
- Residual scan (RESIDUAL of _work/repath-fixtures.mjs) over D12 assertions.yaml / intent.json / questions.md,
  non-comment lines: 0 hits.

## After

| fixture | errors | warnings |
| --- | --- | --- |
| acrylamide-fried-potato-harm | 2 | 0 |
| mcdonalds-fries-prepared-food | 0 | 0 |
| olive-oil-polyphenols-preparation | 0 | 0 |
| predimed-retraction-disconfirmation | 0 | 0 |
| upf-diet-rct-unstructured | 0 | 0 |
| **total** | **2** | **0** |

Remaining (owner-gated): acrylamide acr-03 / intent p03-result-for relationship-pair QualityResult-[:QUALITY_RESULT_FOR]->
Product (R-73 cut the Product member; R-95 / OD-10 decides: re-key to MEASURED_CONTENT_IN_PRODUCT or reinstate Product).

## Notes / gaps

- intent v1 still has no StudyResult staging in the upf intent: D3 STATED_IN (upf-02) stays in assertions.yaml only (unchanged
  gap, now stated in the intent notes).
- The RENDITION_OF evidence is a CONTEXT locator inside each record; no selector on the identifier blocks was captured and
  none was added (locators.yaml is frozen in the close-out).
- fixtures/README.md: D12 rows set to applied; a D12/mcdonalds-fries-prepared-food row added (it had no FU-03 row).
