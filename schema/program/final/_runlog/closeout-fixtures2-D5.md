# Close-out (second attempt): fixture editor (S) for final/fixtures/D5/ (FU-03)

Date: 2026-10-09. This is the recovery run after the first-round edits were wiped (repath-fixtures.mjs re-copy, coordinator reset to 31390a6).
Guide: the lost first attempt's log `_runlog/closeout-S-fixtures-D5.md`, read only as a guide. I re-applied and re-verified every edit here.
Scope: `final/fixtures/D5/<folder>/` (4 fixtures) and the D5 rows of the FU-03 table in `final/fixtures/README.md`.
Not changed: the SDL, source.md, locator quotes, snapshot digests, and any sourced value. Nothing committed.
I never ran or imported `repath-fixtures.mjs`. `lint-fixtures.mjs` only reads it as text (`readFileSync`, line 62), and I ran it only in `--fixture` report mode.

## Baseline (before edits)

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D5/<folder>`

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| antioxidant-exercise-disconfirmation | 4 | 0 | edge-property ×4 (`orderIndex` on OPERATIONALIZED_BY, now AssertedRecordedProperties) |
| pregnancy-magnesium-upper-limit | 1 | 0 | enum-value ×1 (`computedNotStored.Q-D5-06.verdict: ABOVE`) |
| sirolimus-label-interactions-harm | 0 | 14 | retired-name ×14 (`supersedesUid`) |
| sleep-toolkit-unstructured | 3 | 0 | retired-name ×3 (`Mention`) |
| **total** | **8** | **14** | **22 violations** |

Intent validation used a scratch, read-only copy of the `_work/validate-intents.mjs` method: zod `IngestionIntent` plus Ajv 2020-12 over `packages/contracts/json-schema/biotech-knowledge-intent.v1.json`. Script: `<scratchpad>/d5/vintent.mjs`, which writes nothing. Result before edits: 4/4 valid.

Edit sources:
- The FU-03 rows for D5: F-05; R-23; R-09/R-27 + R-82.
- The D5 edit-fixture ops in rulings.yaml: R-23 and R-35.
- predicates.yaml: no D5 fixture uses an alias, retired or proposed predicate, so nothing needed re-keying. The lint reports no predicate-* violation.
- D5 rulings that touch fixture data and that the lint surfaced or the task lists: R-26 (OPERATIONALIZED_BY asserted), R-15 (multi-author asserter) and R-80 (AUTHORED_BY).

## Edits

### sirolimus-label-interactions-harm

**R-23** (same-asserter supersession only):
- assertions.yaml:
  - Dropped `supersedesUid` on r01-v22-grapefruit and r04-v22-cbd-monitor. These Mylan records had pointed at Greenstone LLC records.
  - r00-v14 and r03-v15: status SUPERSEDED → PROPOSED, and `recordedTo` removed (R-24: recordedTo never fakes time). Their notes now say they leave "current" answers when their SPL label-version state episode closes. That episode is not built in this fixture.
  - Rewrote the 2 derived RESOLVES_TO_CONSTRAINT `asOfNote`s.
  - `labelVersionChange.supersessionChains` is now `[]`, with a `supersessionNote` and `labelerChangePairs` (the same pairs).
- intent.json:
  - 14 occurrences of `supersedesUid` removed: 2 `supersedesUid=` values in proposal rationales, 11 "cannot carry …/supersedesUid" phrases, and 1 in the notes. The lint had flagged 12 of them.
  - The notes now state R-23.
- questions.md:
  - Rewrote Q-D5-26: no supersession chains.
  - Aligned the stale UseConstraint uids in Q-D5-23 / Q-D5-24 with the assertions.yaml use-constraint-key/v2 uids. These are fixture-minted, not sourced: f6cf8fda…→e6da92cd…, 929b2183…→7813a0a6… (×2), c5a139b7…→4b268301…, 88af9983…→b70287a2….

**R-35:** 2 snapshots in locators.yaml, EXTRACTED_TEXT_BYTES → TOOL_RENDITION. intent.json was already TOOL_RENDITION.

### antioxidant-exercise-disconfirmation

- **F-05:** the x06 note no longer names an extra ClaimOccurrence label.
- **R-26:** the 4 structural OPERATIONALIZED_BY rows are now `edges.asserted`. Each carries AssertedRecordedProperties (relationshipUid, assertionUid, recordedFrom, lastWriterRunId); `orderIndex` was dropped. New Assertions o01–o04 authorize them:
  - asserter: Agent `hu:agent:ks-curation` (new entity, AUTOMATED_AGENT)
  - basisKind: CURATOR_CLASSIFICATION
  - recorded time only (no validity)
  - evidence: the former rationale locator
  - intent: edge.structural ×4 → edge.assert with asserterRef `agent-ks-curation` (new Agent subject).
- **R-15:** the first-author Person asserters are replaced by D3 Publications:
  - Ristow (x01–x03) → `hu:publication:doi-10.1073-pnas.0903485106`
  - Paulsen (x04, x05) → `hu:publication:doi-10.1113-jphysiol.2013.267419`
  - Titles, venue and PMID / DOI / PMCID are taken as printed in source.md.
  - The Person entities and intent subjects were replaced. The bylines stay in locators l09 / l17.
  - questions.md Q-D5-01 / Q-D5-02 updated.
- **R-35:** 1 snapshot (btsa) → TOOL_RENDITION in locators.yaml. intent.json was already TOOL_RENDITION.

### pregnancy-magnesium-upper-limit

- `computedNotStored.Q-D5-06.verdict: ABOVE` → `doseVsLimit: ABOVE`, plus a note. It is the pattern's computed string column, not a stored SemanticVerdict. questions.md Q-D5-06 / Q-D5-21 wording aligned.
- questions.md Q-D5-13: PROTOCOL_AUTHORED_BY → AUTHORED_BY (R-80).
- R-35: 2 snapshots → TOOL_RENDITION.

### sleep-toolkit-unstructured

- **R-09/R-27:**
  - Both `mention.stage` proposals removed from intent.json (50 → 48 proposals).
  - "most sleep medications" binds no assertion. Its surface form stays in locator l24-step11 (a07 note, questions.md Q-D5-02).
  - The "overly intense dreams" Condition that a04 binds to gets a RESOLUTION Assessment, `hu:assessment:d5-sleep-res-overly-intense-dreams`: evidence l18 / l33, role CONTEXT, status PROPOSED, no D2 code asserted. It has kernel ASSESSES and HAS_EVIDENCE rows (EvidenceEdgeProperties role / origin).
  - The Condition's name no longer says it was staged.
- **R-82:** a10 RECEIVES_VALUE_FROM NEGATIVE → DISCLOSES_INTEREST NEGATIVE / DENIES, in assertions.yaml, intent.json (relationshipType, predicate, rationale, notes) and questions.md Q-D5-13.
- **R-35:** 1 snapshot → TOOL_RENDITION.

## After

```
node C:/.../final/_work/lint-fixtures.mjs --fixture D5/antioxidant-exercise-disconfirmation   # errors 0, warnings 0
node C:/.../final/_work/lint-fixtures.mjs --fixture D5/pregnancy-magnesium-upper-limit        # errors 0, warnings 0
node C:/.../final/_work/lint-fixtures.mjs --fixture D5/sirolimus-label-interactions-harm      # errors 0, warnings 0
node C:/.../final/_work/lint-fixtures.mjs --fixture D5/sleep-toolkit-unstructured             # errors 0, warnings 0
node <scratchpad>/d5/vintent.mjs   # 4/4 zod true, JSON Schema true (proposals 10, 89, 11, 48)
python -I yaml.safe_load over the 8 assertions/locators files   # all parse
```

- Lint: 22 → 0 (errors 8 → 0, warnings 14 → 0).
- No owner-gated item remains for D5.
- FU-03 table: D5 rows for antioxidant, pregnancy (new row), sirolimus and sleep set to "applied 2026-10-09 … owner-gated: none". The edit was targeted: it re-read the table first and replaced only the D5 lines.

## Gaps recorded (no schema change proposed)

- intent v1 has no Assessment proposal kind, so the sleep RESOLUTION Assessment lives in assertions.yaml only (intent notes item 5).
- sirolimus: the R-23 "leaves current when the label-version episode closes" behaviour cannot be shown structurally, because the fixture has no label-version state episode for SPL v14 / v15 / v22. Notes document the as-of exit.
- Pattern owners' items, not fixture data:
  - Q-D5-13's assertion branch still names RECEIVES_VALUE_FROM NEGATIVE.
  - Q-D5-26 reads supersession chains.
  - The fixture answers now follow R-82 / R-23.
