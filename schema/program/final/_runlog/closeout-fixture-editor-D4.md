# Close-out — fixture editor (S), final/fixtures/D4/ (FU-03)

2026-10-09. Writes under `final/fixtures/D4/<folder>/` (assertions.yaml, intent.json) and the D4 rows of the FU-03 table in `final/fixtures/README.md` only. source.md, locators.yaml, quotes, snapshot digests and sourced numbers/identifiers untouched. SDL unchanged. Not committed.

## Inputs

- FU-03 table (README "Residual non-final names and pending ruling edits"): one D4 row, `D4/hba1c-two-labs-interference` — R-26/R-25 PERFORMED_BY_LAB d05 becomes asserted with basisKind CURATOR_CLASSIFICATION.
- `vocabularies/predicates.yaml` fixtureEdit for D4: `AlgorithmVersion.inputFeatureCount` (alias-of INPUT_FEATURE_COUNT), `AlgorithmVersion.inputPlatforms` (alias-of INPUT_PLATFORMS), both D4/dunedinpace-paper-unstructured (R-52).
- `_work/rulings.yaml` D4 section: no `edit-fixture` op; R-26 `change-edge-class` PERFORMED_BY_LAB is the d05 edit above. R-55 (edit-text), R-94 (edit-pattern Q-D4-10), R-50 (edit-question) are not fixture edits.
- R-15 (decision report: "never by the first of several"): three D4 fixtures used a first-author Person "asserter for the author group". Not listed for D4 in the FU-03 table; applied because the ruling is general and the edit needs no new fact (title, venue and identifiers are printed in the snapshot title / source.md citation).

## Baseline

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D4/<folder>   (x7)
  -> dunedinpace-paper-unstructured: errors 2 (predicate-alias x2: a04 L156, a05 L177); other six: 0 / 0
scratchpad val-d4.mjs (same zod IngestionIntent + Ajv 2020 json-schema check as _work/validate-intents.mjs, D4 only; does not rewrite _work/intent-validation.json)
  -> 7/7 zod true, json true
```

## Edits

| fixture | edit | files |
|---|---|---|
| dunedinpace-paper-unstructured | a04 predicate `AlgorithmVersion.inputFeatureCount` -> `INPUT_FEATURE_COUNT`; a05 `AlgorithmVersion.inputPlatforms` -> `INPUT_PLATFORMS` (intent p04/p05 are node.upsert and name no predicate) | assertions.yaml |
| hba1c-two-labs-interference | R-26 d05 PERFORMED_BY_LAB: edgeClass structural -> asserted, assertionKind RELATIONSHIP, polarity POSITIVE, speechAct STATES, basisKind CALCULATED -> CURATOR_CLASSIFICATION, validFromBasis UNKNOWN, edgePropertiesType AssertedRecordedProperties; asserter agent-curation and locator lc-testno kept; derivationRule kept | assertions.yaml |
| hba1c-two-labs-interference | p05-d05 edge.structural -> edge.assert (assertion.predicate PERFORMED_BY_LAB, CURATOR_CLASSIFICATION, asserterRef agent-curation, edgeProperties {}); derivation rule moved into rationale (v1 AssertionCore has no derivationRule field); notes updated | intent.json |
| dunedinpace-paper-unstructured | R-15 asserter person-belsky -> pub-belsky-2022 (D3 Publication, hu:publication:pmid-35029144; PMID 35029144, PMCID PMC8853656, DOI 10.7554/eLife.73420) on a01-a06; Person entity/subject replaced; intent asserterRef x2 | assertions.yaml, intent.json |
| clock-noise-vs-retest-advice | R-15 person-higgins-chen -> pub-higgins-chen-2022 (hu:publication:pmid-36277076; PMID 36277076, PMCID PMC9586209, DOI 10.1038/s43587-022-00248-2) on b04, b05; intent asserterRef x2 | assertions.yaml, intent.json |
| nr-nad-compound-to-test | R-15 person-martens -> pub-martens-2018 (hu:publication:pmid-29599478, the uid D11 nr-trial-jats-unstructured uses; PMID 29599478, PMCID PMC5876407, DOI 10.1038/s41467-018-03421-7) on e03, e04, e05; intent asserterRef x2 | assertions.yaml, intent.json |

R-15 edits were applied with a scratchpad script (string replacement of the entity block and `ref: <person>\n type: Person` asserter pairs; intent rewritten with JSON.stringify(…, null, 2) after checking the three files round-trip byte-identically). hba1c intent.json does not round-trip, so it was edited by text replacement.

## After

```
lint-fixtures.mjs --fixture D4/<folder> (x7)
  -> errors 0 on all 7; warnings 2 (dunedinpace: predicate-proposed INPUT_FEATURE_COUNT, INPUT_PLATFORMS — registrar D4 has not accepted them)
val-d4.mjs -> 7/7 zod true, json true
git status: only assertions.yaml / intent.json in 4 D4 folders + fixtures/README.md
```

FU-03 table: hba1c row set to applied; rows added (applied) for clock-noise-vs-retest-advice, dunedinpace-paper-unstructured, nr-nad-compound-to-test.

## Owner-gated / recorded, not changed

- INPUT_FEATURE_COUNT / INPUT_PLATFORMS are `proposed-new` in predicates.yaml (2 lint warnings) until the D4 registrar accepts them.
- MD-D4-03: nr-nad s02 keeps `assessmentSubkind: D4.test-and-sell` (R-55 one register entry vs D4 subkind is open); no conclusionCode added (would be a new judgment).
- FU-08 (already open): the IR marks REQUIRES_INPUT_METRIC asserted while its field/register is structural; consumer-panel g15-g23 stay structural (they match the register and the edge-property type).
- Publication identifiers are written on the subject without evidence locators (no identifier span exists in locators.yaml, which this round may not change); the values are those printed in the snapshot title.
