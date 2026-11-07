# Close-out — S final-SDL pattern writer, packet D2

2026-10-09. Worktree `biotech-knowledge-services-S` (branch ft/schema-S, base 31390a6). No SDL change and no commit.

## Inputs

- `final/_work/pattern-lint.json`, D2 entry: total 39, failing 5. Of those, 3 are packetBug (Q-D2-11, Q-D2-16, and Q-D2-21, which is also ruling-broken under R-52/R-89) and 2 are rulingBroken:
  - Q-D2-10, R-59: `r.direction = 'DECREASES'` is not an EstimateDirection value.
  - Q-D2-18, R-47: reads `r.nNoChangeContexts`, and the R-47 edit-pattern is not applied (it still ranks the AFFECTS_MECHANISM edge).
- Owner log `_runlog/closeout-A3-D2.md`: the owner fixed Q-D2-11, Q-D2-16 and Q-D2-21 in A3, and the re-lint shows 2 failing, both rulingBroken. The owner did not rewrite Q-D2-10 or Q-D2-18.
- Owner patterns: `biotech-knowledge-services-A3/schema/program/packets/D2/03-retrieval-patterns.md` (f4fb477 plus the uncommitted close-out edits), sections Q-D2-10 (line 405) and Q-D2-18 (line 555).
- Rulings: decision-report R-47 and R-59, and `_work/rulings.yaml` lines 179–183. Final SDL: `MechanismProjectionProperties`, `EstimateDirection`, `Association`, `AssociationKind`. `vocabularies/predicates.yaml` lists MEDIATES_TARGET as registered (D2; Mechanism → Target).

## Output

`final/patterns-by-question/D2.md` has 2 sections:

- **Q-D2-10.** Uses `'DECREASED'`, adds AS-OF and status on the mediation Assertion, keeps polarity POSITIVE only, gives the modulator label `ChemicalSubstance|Intervention`, and adds TRACE on `med` and on the projection inputs.
- **Q-D2-18.** Ranks D10 `Association {associationKind: 'EVIDENCE_AGGREGATE'}` with `anchorUid` = the modulator, on `$methodVersion`. Joins the facet edge with `bestBasis = 'DIRECT_MEASUREMENT'`. Counts `nNoChangeContexts` at query time from the `DERIVED_FROM` inputs, and traces through `Association.inputs`.

No question is lost.

## Validator

`final/_work/validate-by-question.mjs` already existed (shared, written by another pattern writer). I reused it unchanged.

```
cd C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D2
# D2: {"questions":2,"ok":2,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":2,"statementsExplainOk":2,"staticFindings":0}
#   Q-D2-10: ok   Q-D2-18: ok

# negative control: a scratch copy with 'DECREASES' and r.nNoChangeContexts restored, --out <scratchpad>/neg
#   Q-D2-10 failing: enumValue `r.direction` = 'DECREASES': not a value of EstimateDirection
#   Q-D2-18 failing: property `r.nNoChangeContexts`: not a property of [:AFFECTS_MECHANISM] (MechanismProjectionProperties)

node .../validate-by-question.mjs --packets D2 --fill     # exit 0; wrote the two "- EXPLAIN:" lines; report final/_work/by-question/D2.json
```

Neo4j: bks-neo4j-synth 5.26.31 Community, bolt://localhost:7691. Run without `--ddl`, so the indexes were left untouched. No plan contains AllNodesScan or CartesianProduct.

## Open points (not SDL)

- The `Association.methodVersion` string for the Q-D2-18 support score is not named by any ruling. The pattern takes `$methodVersion`. D2 and D10 need to fix it; `bl-assoc/evidence-aggregate@1` (G-1) is a candidate.
- No D2 fixture writes the EVIDENCE_AGGREGATE Associations or the MEDIATES_TARGET Assertion, so both patterns return no rows on the current fixtures.

## Re-verification (second pass, same day)

- `pattern-lint.json` D2 classes re-read: rulingBroken = Q-D2-10 (R-59), Q-D2-18 (R-47). packetBug = Q-D2-11, Q-D2-16, Q-D2-21 (Q-D2-21 also lists R-52/R-89 predicate retirements). In A3, Q-D2-21 now reads HOLDS_STAKE|HOLDS_ROLE|RECEIVES_VALUE_FROM and SUPPLIES_MATERIAL. A3 Q-D2-10 and Q-D2-18 are unchanged in the owner file, so the final-SDL versions live only in `patterns-by-question/D2.md`.
- SDL sha256 prefix `c7cf1235dba8`, unchanged.
- Spot-checked these final SDL names by hand:
  - `Association`: anchorUid, score, components, inputCount, inputSetDigest, methodVersion, computedAt, staleAfter, recordedAt/To.
  - `Association.inputs` DERIVED_FROM OUT and `members` ASSOCIATES OUT.
  - `Activity`: runId, activityKind, methodVersion.
  - `Adjudication`: adjudicationKind, verdict, recordedTo.
  - `MechanismProjectionProperties`: no nNoChangeContexts; direction is EstimateDirection.
  - Enums AssertionStatus, Polarity, EstimateDirection, AssociationKind.
  - MEDIATES_TARGET and NO_CHANGE_IN are registered in `vocabularies/predicates.yaml`.
- `node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D2` returned `{"questions":2,"ok":2,"failing":0,"gdsUnvalidated":0,"statements":2,"statementsExplainOk":2,"staticFindings":0}`, exit 0.
- A run with no `--packets` filter (all `patterns-by-question/*.md`: D13, D2, D3, D5, D7 at that time) also passed with 0 failing.
