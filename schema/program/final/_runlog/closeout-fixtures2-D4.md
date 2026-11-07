# Close-out (second attempt): fixture editor (S), final/fixtures/D4/ (FU-03)

2026-10-09. This is the recovery round, run after the coordinator reset final/fixtures/ to 31390a6. Writes went only to `final/fixtures/D4/<folder>/` (assertions.yaml and intent.json) and the D4 rows of the FU-03 table in `final/fixtures/README.md`. source.md, locators.yaml, quotes, snapshot digests and sourced numbers and identifiers are untouched. The SDL is unchanged and nothing is committed. Guide: `_runlog/closeout-fixture-editor-D4.md` (the lost first attempt). I re-applied its decisions and verified each one again.

Scripts executed: only `_work/lint-fixtures.mjs --fixture D4/<folder>`, which runs in report mode and writes nothing. I also ran three scratchpad scripts:

- `edit-d4.mjs` wrote the D4 edits.
- `val-d4.mjs` validates the D4 intents only and writes nothing.
- `readme-d4.mjs` replaced the one D4 row of the table and inserted three new D4 rows.

I did not run or import `repath-fixtures.mjs` or `validate-intents.mjs`, since the latter writes `_work/intent-validation.json`.

## Inputs (re-checked)

- **FU-03 table:** one D4 row, `D4/hba1c-two-labs-interference`. R-26/R-25 make PERFORMED_BY_LAB d05 asserted with basisKind CURATOR_CLASSIFICATION.
- **predicates.yaml:** D4/dunedinpace-paper-unstructured has two aliases under R-52:
  - `AlgorithmVersion.inputFeatureCount` is an alias of INPUT_FEATURE_COUNT.
  - `AlgorithmVersion.inputPlatforms` is an alias of INPUT_PLATFORMS.
- **rulings.yaml, D4 section:** no `edit-fixture` op. R-26 change-edge-class is the d05 edit above. The other D4 ops are text, pattern, question or seam edits, not fixture edits.
- **R-15 (general):** three D4 fixtures used a first-author Person "asserter for the author group". The title, venue and PMID/PMCID/DOI are printed in each source.md (snapshot title and Citation), so the edit needs no new fact.
- **Other typical rulings:** a grep of D4 for Mention, nNoChangeContexts, supersedesUid, ClaimOccurrence, HAS_REVISION_STATUS, R-30 verbatim fields and retired predicates returned no hits.

## Baseline

```
lint-fixtures.mjs --fixture D4/<folder> (x7)
  dunedinpace-paper-unstructured: errors 2 (predicate-alias: AlgorithmVersion.inputFeatureCount, AlgorithmVersion.inputPlatforms); other six 0/0
```

## Edits

| fixture | edit |
|---|---|
| dunedinpace-paper-unstructured | a04 predicate re-keyed to INPUT_FEATURE_COUNT and a05 to INPUT_PLATFORMS (R-52). The intent names no predicate for these, because p04 and p05 are node.upsert. |
| dunedinpace-paper-unstructured | R-15: Person person-belsky becomes D3 Publication pub-belsky-2022 (uid hu:publication:pmid-35029144; publicationKind ARTICLE, venueName, citationText; identifiers PMID 35029144, PMCID PMC8853656, DOI 10.7554/eLife.73420). Applied to asserters a01–a06 and to the intent subject plus asserterRef ×2. |
| clock-noise-vs-retest-advice | R-15: person-higgins-chen becomes pub-higgins-chen-2022 (hu:publication:pmid-36277076; PMCID PMC9586209; DOI 10.1038/s43587-022-00248-2). Applied to b04 and b05, and to intent asserterRef ×2. |
| nr-nad-compound-to-test | R-15: person-martens becomes pub-martens-2018 (hu:publication:pmid-29599478, the same uid as D11/nr-trial-jats-unstructured; PMCID PMC5876407; DOI 10.1038/s41467-018-03421-7). Applied to e03–e05, and to intent asserterRef ×2. |
| hba1c-two-labs-interference | d05 PERFORMED_BY_LAB in assertions.yaml: edgeClass changes from structural to asserted, with edgePropertiesType AssertedRecordedProperties, assertionKind RELATIONSHIP, speechAct STATES and polarity POSITIVE. basisKind changes from CALCULATED to CURATOR_CLASSIFICATION. validTime is OBSERVATION_ONLY as of the snap-labcorp capture time, 2026-10-08T17:40:00-04:00, matching d01/d02. Asserter agent-curation, locator lc-testno, derivationRule and notes are kept. A closeoutNote was added. |
| hba1c-two-labs-interference | intent p05-d05: kind changes from edge.structural to edge.assert, with assertion {POSITIVE, CURATOR_CLASSIFICATION, STATES, validity as above} and asserterRef agent-curation. v1 AssertionCore has no derivationRule field, so the inference rule moved into the rationale. The `notes` field was updated. |

The three intents touched for R-15 round-trip byte-identically through JSON.stringify(…, null, 2), so the script rewrote them. The hba1c intent was edited by targeted text replacement.

## After

```
lint-fixtures.mjs --fixture D4/<folder> (x7)
  errors 0 on all 7; warnings 2 (dunedinpace: predicate-proposed INPUT_FEATURE_COUNT, INPUT_PLATFORMS)
val-d4.mjs (zod IngestionIntent + Ajv 2020 over biotech-knowledge-intent.v1.json): 7/7 zod true, json true
git status final/fixtures: only assertions.yaml / intent.json in 4 D4 folders + README.md (D4 rows)
```

In the FU-03 table, the hba1c row is set to applied, and applied rows were added for clock-noise-vs-retest-advice, dunedinpace-paper-unstructured and nr-nad-compound-to-test.

## Owner-gated / recorded, not changed

- **Proposed-new predicates:** INPUT_FEATURE_COUNT and INPUT_PLATFORMS stay `proposed-new` in predicates.yaml until the D4 registrar accepts them. They account for the 2 lint warnings.
- **MD-D4-03:** nr-nad s02 keeps `assessmentSubkind: D4.test-and-sell`, because the R-55 question of one register entry versus a D4 subkind is still open. No conclusionCode was added.
- **Publication identifiers:** they are stated on the entity and the intent subject without evidence locators. There is no identifier span in locators.yaml, and this round may not change that file.
