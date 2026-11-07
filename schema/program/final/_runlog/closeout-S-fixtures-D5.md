# Close-out — fixture editor (S) for final/fixtures/D5/ (FU-03)

Date: 2026-10-09. Scope: final/fixtures/D5/<folder>/ only (4 fixtures) plus the D5 rows of the FU-03 table in
final/fixtures/README.md. No SDL change, no source.md / locator quote / snapshot digest / sourced value change, no commit.

## Baseline

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D5/<folder>` (before edits):

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| antioxidant-exercise-disconfirmation | 4 | 0 | edge-property 4 (orderIndex on OPERATIONALIZED_BY, now AssertedRecordedProperties) |
| pregnancy-magnesium-upper-limit | 1 | 0 | enum-value 1 (computedNotStored.Q-D5-06.verdict ABOVE) |
| sirolimus-label-interactions-harm | 0 | 14 | retired-name 14 (supersedesUid) |
| sleep-toolkit-unstructured | 3 | 0 | retired-name 3 (Mention) |
| **total** | **8** | **14** | 22 violations |

Intent validation (zod IngestionIntent + JSON Schema biotech-knowledge-intent.v1, same method as `_work/validate-intents.mjs`,
run from a scratch copy that writes nothing): 4/4 valid before.

Edit sources: FU-03 rows D5/* (F-05; R-23; R-09/R-27; R-82), rulings.yaml D5 edit-fixture ops (R-23, R-35), predicates.yaml
(no alias / retired / proposed-new predicate is used by a D5 fixture: nothing to re-key), and the D5 rulings that touch fixture
data and that the lint surfaced (R-26 OPERATIONALIZED_BY asserted; R-15 multi-author asserter; R-80 AUTHORED_BY).

## Edits

- **sirolimus-label-interactions-harm** — R-23: `supersedesUid` dropped on r01-v22-grapefruit and r04-v22-cbd-monitor (Mylan
  records pointed at Greenstone records); r00-v14 and r03-v15 status SUPERSEDED → PROPOSED, `recordedTo` removed, notes say they
  leave "current" answers when their SPL label-version state episode closes (that episode is not built in this fixture);
  derived-edge asOfNotes and `labelVersionChange.supersessionChains` (now `[]` + `labelerChangePairs`) rewritten; intent.json
  rationales no longer carry `supersedesUid=` and the notes state R-23; questions.md Q-D5-26 rewritten (no supersession chains).
  Also aligned the stale UseConstraint uids in questions.md Q-D5-23 / Q-D5-24 with the assertions.yaml uids (use-constraint-key/v2).
  R-35: 2 snapshots EXTRACTED_TEXT_BYTES → TOOL_RENDITION (locators.yaml; intent.json already TOOL_RENDITION).
- **antioxidant-exercise-disconfirmation** — F-05: x06 note no longer names the ClaimOccurrence label. R-26: the 4 structural
  OPERATIONALIZED_BY rows become asserted rows (AssertedRecordedProperties: relationshipUid, assertionUid, recordedFrom,
  lastWriterRunId; `orderIndex` dropped) authorized by new Assertions o01–o04 (asserter Agent `hu:agent:ks-curation`, basisKind
  CURATOR_CLASSIFICATION, recorded time only, evidence = the former rationale locator); intent edge.structural ×4 → edge.assert
  with an Agent subject. R-15: Ristow / Paulsen first-author asserters → D3 Publications `hu:publication:pmid-19433800` and
  `hu:publication:pmid-24492839` (identifiers PMID / DOI / PMCID as printed in source.md) in assertions.yaml (5 assertions) and
  intent.json (Publication subjects). questions.md Q-D5-01 / Q-D5-02 updated. R-35: 1 snapshot → TOOL_RENDITION.
- **pregnancy-magnesium-upper-limit** — computedNotStored.Q-D5-06 `verdict: ABOVE` → `doseVsLimit: ABOVE` + note (the pattern's
  computed string column, not a stored SemanticVerdict). questions.md Q-D5-13 PROTOCOL_AUTHORED_BY → AUTHORED_BY (R-80).
  R-35: 2 snapshots → TOOL_RENDITION.
- **sleep-toolkit-unstructured** — R-09/R-27: both `mention.stage` proposals removed from intent.json; "most sleep medications"
  binds no assertion (surface form stays in locator l24-step11); the "overly intense dreams" Condition that a04 binds to gets a
  RESOLUTION Assessment `hu:assessment:d5-sleep-res-overly-intense-dreams` (evidence l18 / l33, role CONTEXT, PROPOSED) with kernel
  ASSESSES / HAS_EVIDENCE rows; Condition name no longer says "Mention". R-82: a10 RECEIVES_VALUE_FROM NEGATIVE → DISCLOSES_INTEREST
  NEGATIVE / DENIES (assertions.yaml, intent.json, questions.md Q-D5-13). R-35: 1 snapshot → TOOL_RENDITION.

## After

```
node C:/.../final/_work/lint-fixtures.mjs --fixture D5/<folder>     # each: errors 0, warnings 0
node <scratchpad>/vintent.mjs                                        # 4/4 zod true, json true (proposals 10, 89, 11, 48)
```

Lint 22 → 0 (errors 8 → 0, warnings 14 → 0). No owner-gated item remains for D5.

## Gaps recorded (not schema changes)

- intent v1 has no Assessment proposal kind: the sleep RESOLUTION Assessment lives in assertions.yaml only (intent notes say so).
- sirolimus: R-23's "leaves current when the label-version episode closes" cannot be shown structurally here: the fixture has no
  label-version state episode for the SPL versions; the as-of exit is documented in notes only.
- The D5 retrieval patterns (Q-D5-13 assertion branch on RECEIVES_VALUE_FROM NEGATIVE; Q-D5-26 supersession chains) are pattern
  owners' items; the fixture answers now follow R-82 / R-23.

FU-03 table: D5 rows (antioxidant, pregnancy — new row, sirolimus, sleep) set to "applied 2026-10-09 … owner-gated: none".
