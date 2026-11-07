# Close-out — S fixture editor / D13 fixtures (FU-03)

2026-10-09. Scope: `final/fixtures/D13/<folder>/` only (5 fixtures). No SDL change (candidate c7cf1235…4793 untouched), no commit.
Inputs: FU-03 table rows for D13 in `final/fixtures/README.md`; `final/_work/rulings.yaml` modules.D13 edit-fixture ops
(R-44 lesne, R-21 lesne a10/a11 + bioage, R-35 already applied by the repath); `final/vocabularies/predicates.yaml`
(no alias-of / retired-by entry is used by a D13 fixture: every D13 predicate is `registered`).

## Baseline lint

```
$ for f in bioage-strides-discontinuation lesne-2006-retraction madrigal-financing-after-readout \
         madrigal-maestro-nash-topline-8k madrigal-pdufa-to-accelerated-approval; do
    node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D13/$f; done
D13/bioage-strides-discontinuation          errors 1  warnings 0   retired-name 1 (Mention, assertions.yaml:260)
D13/lesne-2006-retraction                   errors 22 warnings 13  retired-name 29 (role AUTHOR/PUBLISHER, derivedFrom=, HAS_REVISION_STATUS), enum-value 6
D13/madrigal-financing-after-readout        errors 0  warnings 0
D13/madrigal-maestro-nash-topline-8k        errors 0  warnings 0
D13/madrigal-pdufa-to-accelerated-approval  errors 0  warnings 1   retired-name 1 (supersedesUid, assertions.yaml:169)
total: 23 errors, 14 warnings
```

## Edits applied (11)

lesne-2006-retraction (assertions.yaml, intent.json, questions.md):
1. R-44: INVOLVES PUBLISHER (a05) and AUTHOR (a06, a07) dropped; intent p-a05..p-a07 dropped; Person entities / subjects
   `lesne`, `ashe` removed (no other user). Authors and publisher are reached through the D3 Publication.
2. R-44: new D3 Publication `notice` (Retraction Note, DOI 10.1038/s41586-024-07691-8 from the snapshot URI and l07/l08/l12,
   PMID 38914864 from l12, publishedAt 2024-06-24 from l04, citation from l12); intent subject mode new.
3. R-44: a09 (publisher) → REVISES notice → article, RevisionEdgeProperties revisionKind RETRACTION (evidence + l03).
4. R-44 + R-21: a10 (Retraction Watch) → REVISES, basisKind CITED_FROM_PRIOR_WORK, `derivedFrom: [a09]` (kernel DERIVED_FROM).
5. R-44 + R-21: a11 (NLM) → REVISES, same; validFromBasis PUBLICATION_PROXY kept.
6. R-44: a12 (Retraction Watch expression of concern) kept as K HAS_REVISION_STATUS: l09 names only the article DOI
   (no identified notice) — legitimate; note added.
7. R-44 (SDL EventKind.RETRACTION docstring "no second date Assertion is written"): a02 / p-a02 (Retraction Watch
   EVENT_OCCURRED on the RETRACTION Event, derived) dropped; a01 stays the one clock Assertion (cites the notice locator l04).
   R-21's own fixture list names only a10/a11, consistent with a02 not surviving R-44. Recorded for the D13 owner (FX-D13-01 d).
8. Prose blocks (kernelRevisionRecord, notStored, pubmedCorroboration, corroboration) and questions.md traces (CQ-EV-05,
   Q-D13-22, CQ-TM-01) updated to REVISES / DERIVED_FROM; intent notes record the v1 gap (no Assertion → Assertion DERIVED_FROM).

bioage-strides-discontinuation (assertions.yaml, intent.json):
9. R-09/R-27: a05's interim surface-form wording replaced; RESOLUTION Assessment r01 added (about the D2 Condition R74.01,
   evidence l04 CONTEXT, method = the ICD-10-CM lookup already recorded on the entity). Intent notes: v1 has no Assessment write.
10. R-21: no derived record exists in this fixture (BioPharma Dive asserts only REPORTED_MARKET_MOVE); corroboration note says so.

madrigal-pdufa-to-accelerated-approval (assertions.yaml):
11. R-23 check: a02 supersedes a01, both asserted by Madrigal → allowed; note records the check.

Already applied by the repath (no edit needed): R-35 CANONICAL_PROJECTION, R-66 US_PRIORITY_REVIEW / US_ACCELERATED_APPROVAL.
Not applicable to D13 (grep): R-30 verbatim fields, R-15, R-43/R-26 RENDITION_OF rows, R-47, R-49, R-55, R-58, F-05,
predicate aliases / retired names (none used by D13). Unchanged: every source.md, locators.yaml, snapshot digest, quote,
number and identifier (git diff touches no locators.yaml / source.md).

## Validation

```
$ node C:/Users/Pinda/AppData/Local/Temp/claude/.../scratchpad/d13fx-validate.mjs
  (zod IngestionIntent from packages/contracts/dist + Ajv 2020-12 over packages/contracts/json-schema/biotech-knowledge-intent.v1.json,
   ajv-formats; same method as final/_work/validate-intents.mjs, without rewriting _work/intent-validation.json)
bioage-strides-discontinuation/intent.json: zod ok; jsonSchema ok; proposals 11
lesne-2006-retraction/intent.json: zod ok; jsonSchema ok; proposals 7      (was 12: -p-a02, -p-a05..07; p-a09..11 edge.assert REVISES)
madrigal-financing-after-readout/intent.json: zod ok; jsonSchema ok; proposals 13
madrigal-maestro-nash-topline-8k/intent.json: zod ok; jsonSchema ok; proposals 9
madrigal-pdufa-to-accelerated-approval/intent.json: zod ok; jsonSchema ok; proposals 22

$ node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D13/<each>
D13/bioage-strides-discontinuation          errors 0 warnings 0
D13/lesne-2006-retraction                   errors 0 warnings 3   HAS_REVISION_STATUS a12 [assertions 442; intent 597, 602] — legitimate (R-44: no identified notice)
D13/madrigal-financing-after-readout        errors 0 warnings 0
D13/madrigal-maestro-nash-topline-8k        errors 0 warnings 0
D13/madrigal-pdufa-to-accelerated-approval  errors 0 warnings 1   supersedesUid a02 [169] — legitimate (R-23: same asserter)
total: 23 errors / 14 warnings -> 0 errors / 4 warnings (all 4 legitimate uses the lint flags as warnings by design)
```

`node final/_work/build-predicates.mjs --check` could not run at the time (YAMLParseError in
`fixtures/D5/sleep-toolkit-unstructured/assertions.yaml`, another editor's file mid-edit); the registry's `observed`
counts for HAS_REVISION_STATUS / REVISES / INVOLVES change with these edits, so the registry needs its regeneration.

## Bookkeeping
- `final/fixtures/README.md`: the three D13 rows of the FU-03 table set to applied (targeted line replacement, re-read first).
- `final/open-questions.md`: new row FX-D13-01 (section 6) for the gaps: (a) intent v1 cannot express DERIVED_FROM between
  Assertions; (b) author stances l05/l06 no longer on any Assertion, no author-list locator for AUTHORED_BY; (c) no
  RENDITION_OF article page Source → Publication (no locator ties URL to DOI); (d) a02 drop reading to confirm;
  (e) lesne source.md prose is stale (frozen this round).
- No SDL change; nothing committed.
