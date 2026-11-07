# Close-out — S final-SDL pattern writer, packet D13

2026-10-09. Worktree `biotech-knowledge-services-S` (branch ft/schema-S, base 31390a6). No SDL change and no commit.

## Inputs

- `final/_work/pattern-lint.json`, D13 entry: 35 total, 9 failing (5 packetBug, 4 rulingBroken). The rulingBroken blocks are Q-D13-04 L132 (R-66, the designationType literals), Q-D13-12 L366 (R-66, the approvalPathway literals), Q-D13-14 L421 (R-44, PUBLISHER) and Q-D13-22 L609 (R-21, the edit-pattern is not applied).
- Owner log `_runlog/closeout-A7-D13.md`: the owner fixed all 5 packetBug blocks in A7 (Q-D13-05, -16, -17, -24, -25). The re-lint shows 4 failing, all rulingBroken.
- Owner patterns: `biotech-knowledge-services-A7/schema/program/packets/D13/03-retrieval-patterns.md` (10ef1ea plus the uncommitted close-out edits).
- Rulings: decision-report R-21, R-44, R-45 and R-66. Final SDL: RegulatoryPathway, EventRole, Publication, RevisionEdgeProperties. Also `vocabularies/frontiers.yaml` `breakthroughCriteria` and `synthesis.regulatoryPathwayMapping`, and `vocabularies/predicates.yaml`.

## Output

`final/patterns-by-question/D13.md`: a header with counts and 4 sections (Q-D13-04, Q-D13-12, Q-D13-14, Q-D13-22). A draft of this file from an earlier attempt in this round was already on disk with its EXPLAIN lines unfilled. I checked it against the owner copy, the rulings, the SDL and the vocabularies, and made these edits:

- **Q-D13-04.** BC-FIRST-APPROVAL keeps 510(k) on a diagnostic frontier (frontiers.yaml), so the `US_DEVICE_510K` exclusion now has `OR $diagnosticFrontier` (`// @param diagnosticFrontier:bool`).
- **Q-D13-14.** R-44 says the publisher is reached "through the Publication". The final Publication has no publisher edge, so the revision-actor row also carries `work.venueName`. The publisher actor is still the asserter of the primary REVISES episode (the one not DERIVED_FROM another).

No question is lost. One part of a question is answered by another route: the PUBLISHER actor in Q-D13-14 (R-44).

## Validator

`final/_work/validate-by-question.mjs` already existed (shared). I reused it unchanged.

```
cd C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D13 --out <scratchpad>/bq
# D13: {"questions":4,"ok":4,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":4,"statementsExplainOk":4,"staticFindings":0}

node .../validate-by-question.mjs --packets D13 --fill      # after the edits; exit 0
# D13: {"questions":4,"ok":4,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":4,"statementsExplainOk":4,"staticFindings":0}
#   wrote 4 "- EXPLAIN: ok on Neo4j 5.26.31 community (1/1 statement); final-SDL static check clean" lines
#   report final/_work/by-question/D13.json; no plan contains AllNodesScan or CartesianProduct

# negative control: a scratch copy with BREAKTHROUGH_THERAPY, ACCELERATED/CONDITIONAL and PUBLISHER restored (--files <scratchpad>/neg/D13.md --out <scratchpad>/neg/out)
#   Q-D13-04 failing: enumValue `e.designationType` = 'BREAKTHROUGH_THERAPY': not a value of RegulatoryPathway
#   Q-D13-12 failing: 4 enumValue findings (e.approvalPathway and r0.pathway: 'ACCELERATED', 'CONDITIONAL')
#   Q-D13-14 failing: enumValue `inv.role` = 'PUBLISHER': not a value of EventRole
```

Neo4j: bks-neo4j-synth 5.26.31 Community, bolt://localhost:7691. Run without `--ddl`, so the indexes were left untouched.

## Open points (not SDL)

- Q-D13-22 depends on an Assertion → Assertion DERIVED_FROM, which intent contract v1 cannot write (FX-D13-01 (a), OD-09). On the current fixtures the lesne relays are carried in `rationale` only.
- No field on Frontier marks a diagnostic frontier. The caller supplies `$diagnosticFrontier`.
- A Publication has no publisher Organization edge, only `venueName`. The publisher actor therefore comes from the REVISES asserter.
