# Close-out — final-SDL pattern writer S / D3 (FU-04)

2026-10-09. Worktree `biotech-knowledge-services-S` (ft/schema-S, 31390a6). No SDL change, nothing committed.

## Inputs
- `final/_work/pattern-lint.json` D3: `{"total":33,"failing":6,"packetBugs":5,"rulingBroken":1}`; `alsoRulingBroken` 1 (CQ-EV-05).
- Owner's fixed `biotech-knowledge-services-A4/schema/program/packets/D3/03-retrieval-patterns.md` (working tree over 44b87ff; owner log `_runlog/closeout-A4-D3.md`).

## State found
`final/patterns-by-question/D3.md` and the shared `final/_work/validate-by-question.mjs` already existed (written earlier in this round, 03:05). Re-verified rather than rewritten: rulings, final-SDL names, cited open-question ids, EXPLAIN.

## Commands and key outputs
```
docker ps --filter name=bks-neo4j-synth   -> Up 5 hours
node C:/.../final/_work/lint-packet-patterns.mjs --packets D3 --json <scratchpad>/lint-D3.json --md <scratchpad>/lint-D3.md
  -> selfCheckDiffs 0; non-ok blocks: Conventions TRACE (fragment), CQ-EV-05 rulingBroken (R-42 identifierJoin x2),
     CQ-ST-07 gds-unvalidated, Q-D3-04 rulingBroken (R-44 'RETRACTED' not a SourceRevisionKind value)
     => owner fixed all 5 packetBugs; 2 ruling-broken questions remain for S
grep SDL: RevisionEdgeProperties.revisionKind: SourceRevisionKind!; Publication.revisionStatus: SourceRevisionKind
  (+ revisionStatusMethodVersion); SourceRevisionKind has RETRACTION, WITHDRAWAL; OPERATIONALIZED_BY carries
  AssertedRecordedProperties; Publication.renditions = RENDITION_OF IN (R-43)
grep open-questions.md: FX-10, FU-03, OD-11, FX-01, MD-D10-04 all present
node C:/.../final/_work/validate-by-question.mjs --packets D3 --fill
  -> D3: {"questions":2,"ok":2,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":3,"statementsExplainOk":3,"staticFindings":0}
     exit 0; report final/_work/by-question/D3.json (Neo4j 5.26.31 community, schemaDigest c7cf1235…4793)
```

## Result
- CQ-EV-05 (R-42, R-43, R-44, R-45): Publication↔Source shared-Identifier joins replaced by `(p)<-[ro:RENDITION_OF]-(src:Source)` with ASOF(ro); flag branch returns a full TRACE. Answered in full; depends on writers asserting RENDITION_OF (fixture gap FX-10 / FU-03).
- Q-D3-04 (R-44, R-45): `'RETRACTED'` → `'RETRACTION'`; WITHDRAWAL deliberately not excluded (packet behavior kept); ASOF on OPERATIONALIZED_BY. Answered in full.
- Lost: 0. gds-unvalidated: 0 (CQ-ST-07 not ruling-broken, unchanged).
