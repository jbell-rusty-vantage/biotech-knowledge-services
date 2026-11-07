# Close-out (second attempt) — S fixture editor / D13 fixtures (FU-03)

2026-10-09. Recovery round after `final/fixtures/` was reset to 31390a6. Scope: `final/fixtures/D13/<folder>/` (5 fixtures)
and the three D13 rows of the FU-03 table in `final/fixtures/README.md`. No SDL change, no commit. `repath-fixtures.mjs`
and every other writing script were read as text only; the only project script executed was `lint-fixtures.mjs --fixture`
(report mode). Guide: the lost first attempt's log `_runlog/closeout-S-fixtures-D13.md` (same decisions re-applied and
re-verified here). `open-questions.md` already holds FX-D13-01 from that attempt; its content still matches, so it was
not edited.

Inputs: FU-03 rows for D13; `_work/rulings.yaml` modules.D13 edit-fixture ops (R-44 lesne; R-21 lesne a10/a11 + bioage;
R-35 already applied by the repath); R-92 (FINANCING_AMOUNT already uses amountKind/amountBasis qualifiers, no edit);
`vocabularies/predicates.yaml` via the lint (no alias / retired / report-only predicate in any D13 fixture).

## Baseline lint

```
$ node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D13/<folder>
D13/bioage-strides-discontinuation          E 1  W 0   retired-name Mention [assertions 260]
D13/lesne-2006-retraction                   E 22 W 13  retired-name 29 (role=AUTHOR/PUBLISHER, derivedFrom=, HAS_REVISION_STATUS), enum-value 6
D13/madrigal-financing-after-readout        E 0  W 0
D13/madrigal-maestro-nash-topline-8k        E 0  W 0
D13/madrigal-pdufa-to-accelerated-approval  E 0  W 1   supersedesUid [169]
total 23 errors / 14 warnings
```

## Edits applied (10)

lesne-2006-retraction (assertions.yaml, intent.json, questions.md):
1. R-44: INVOLVES PUBLISHER (a05) and AUTHOR (a06, a07) dropped, with p-a05..p-a07; Person entities/subjects `lesne`,
   `ashe` removed (no other use).
2. R-44: new D3 Publication `notice` (RETRACTION_NOTICE; DOI 10.1038/s41586-024-07691-8 from the notice snapshot URI
   and l07/l08/l12; PMID 38914864 from l12; publishedAt 2024-06-24 from l04; venue Nature); intent subject mode new
   (DOI issuer Crossref, PMID issuer NLM).
3. R-44: a09 (publisher) -> REVISES notice -> article, RevisionEdgeProperties revisionKind RETRACTION; evidence l03, l04, l07, l15.
4. R-44 + R-21: a10 (Retraction Watch) -> REVISES, basisKind CITED_FROM_PRIOR_WORK, `derivedFrom: [hu:assertion:fx-d13-lesne-a09]`.
5. R-44 + R-21: a11 (NLM) -> REVISES, same; validFromBasis PUBLICATION_PROXY kept.
6. R-44: a12 (Retraction Watch EXPRESSION_OF_CONCERN) kept as HAS_REVISION_STATUS: l09 names only the article DOI
   (no identified notice) — the case R-44 reserves it for; note added.
7. R-44 (EventKind.RETRACTION: clock cites the notice locator, no second date Assertion): a02 / p-a02 dropped.
8. Prose (kernelRevisionRecord.noticeSource, pubmedCorroboration, corroboration) and questions.md (CQ-EV-05, Q-D13-22,
   CQ-TM-01) updated to REVISES / DERIVED_FROM; intent notes + p-a10/p-a11 rationale record the v1 gap (no
   Assertion -> Assertion DERIVED_FROM field).

bioage-strides-discontinuation (assertions.yaml, intent.json):
9. R-09/R-27: a05 note's interim surface-form wording replaced; RESOLUTION Assessment r01 added (about the D2 Condition
   R74.01, evidence l04 CONTEXT, status PROPOSED, methodVersion = the ICD-10-CM lookup recorded on the entity,
   facet surfaceForm). R-21 checked: no derived record (corroboration.derivedRecords note). Intent notes: v1 has no
   Assessment write.

madrigal-pdufa-to-accelerated-approval (assertions.yaml):
10. R-23 check: a02 supersedes a01, both asserted by Madrigal -> allowed; note added.

Not applicable to D13 (grep + lint): R-30, R-15, R-43/R-26, R-47, R-49, R-55, R-58, R-68/R-73/R-80/R-82/R-85 re-keys,
F-05, predicate aliases / retired names. Unchanged: every source.md, locators.yaml, snapshot digest, quote, number and
identifier (`git status` lists no locators.yaml / source.md under D13).

## Validation

```
$ node <scratchpad>/d13v.mjs   (zod IngestionIntent from packages/contracts/dist + Ajv 2020-12 + ajv-formats over
                                packages/contracts/json-schema/biotech-knowledge-intent.v1.json; same method as
                                _work/validate-intents.mjs, read-only, does not write _work/intent-validation.json;
                                also YAML-parses each assertions.yaml)
bioage-strides-discontinuation: zod ok; jsonSchema ok; proposals 11; yaml ok
lesne-2006-retraction: zod ok; jsonSchema ok; proposals 7; yaml ok        (was 11: -p-a02, -p-a05..07; p-a09..11 edge.assert REVISES)
madrigal-financing-after-readout: zod ok; jsonSchema ok; proposals 13; yaml ok
madrigal-maestro-nash-topline-8k: zod ok; jsonSchema ok; proposals 9; yaml ok
madrigal-pdufa-to-accelerated-approval: zod ok; jsonSchema ok; proposals 22; yaml ok

$ node .../final/_work/lint-fixtures.mjs --fixture D13/<folder>
D13/bioage-strides-discontinuation          E 0 W 0
D13/lesne-2006-retraction                   E 0 W 3   HAS_REVISION_STATUS a12 [assertions 430; intent 596, 601] — legitimate (R-44)
D13/madrigal-financing-after-readout        E 0 W 0
D13/madrigal-maestro-nash-topline-8k        E 0 W 0
D13/madrigal-pdufa-to-accelerated-approval  E 0 W 1   supersedesUid a02 [169] — legitimate (R-23 same asserter)
total 23 errors / 14 warnings -> 0 errors / 4 warnings (all legitimate; no owner-gated item)
```

## Bookkeeping
- `final/fixtures/README.md`: the three D13 FU-03 rows replaced in one read-modify-write (rows matched by their
  `| D13/<folder> |` prefix; other rows untouched).
- Registry `observed` counts for HAS_REVISION_STATUS / REVISES / INVOLVES change with these edits; `build-predicates.mjs`
  was not run (it writes outside D13) — the coordinator's regeneration picks them up.
- Q-D13-22 pattern (R-21 edit-pattern, collapse DERIVED_FROM chains) is a pattern-owner item, not edited here.
