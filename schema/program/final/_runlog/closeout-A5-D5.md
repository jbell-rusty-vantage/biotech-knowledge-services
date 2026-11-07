# Close-out: pattern lint — packet owner A5, packet D5

Date: 2026-10-09. Worktree `biotech-knowledge-services-A5` (branch ft/schema-A5, HEAD 53b6a9f). Writes only under `schema/program/packets/D5/`. No SDL change, nothing committed.

## Input

`final/_work/pattern-lint.json` D5: total 35, failing 4, packetBug 2, rulingBroken 2.

- L164 CQ-RC-06 packetBug: `(ReportItem)-[:BLOCKED_BY]->(Assertion)` no such pair; D10 SDL has ReportItem→UseConstraint (`blockedBy`) and ReportItem→Assessment (`blockedByAssessments`).
- L481 Q-D5-13 packetBug (+ruling R-80): `i.observedAt` not a property of D7 Role/Stake/ValueEdgeProperties (D7 header: observedAt removed; use the authorizing Assertion's `validObservedAt` via `assertionUid`).
- L621 Q-D5-17 rulingBroken (R-80), L687 Q-D5-20 rulingBroken (R-42): left as is (S writes final-SDL versions).

## Fixes (A5 worktree, packets/D5)

- 03 CQ-RC-06 (b): `MATCH (i)-[:BLOCKED_BY]->(uc:UseConstraint)` + `OPTIONAL MATCH (i)-[:DERIVED_FROM]->(b:Assertion)-[:RESOLVES_TO_CONSTRAINT]->(uc)`; D10-writes comment and trace line rewritten.
- 03 Q-D5-13: `OPTIONAL MATCH (ia:Assertion {uid: i.assertionUid})`, `ia.validObservedAt AS observedAt`; comment and bitemporal note rewritten.
- Same BLOCKED_BY→Assertion text repeated in 10-seams.yaml (ASSESSES note; BLOCKED_BY row now `to: "D5.UseConstraint | D10.Assessment"`, direction IN), 02-questions.md (CQ-RC-06 answer shape), 11-open-questions.md (OQ-D5-39 marked superseded). 03 header gained a close-out note; RUNLOG entry "Close-out: pattern lint".

## Commands and outputs

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D5 \
  --json <scratchpad>/lint-D5.json --md <scratchpad>/lint-D5.md
# outputs to scratch so the full-suite final/_work/pattern-lint.{json,md} is not overwritten by a single-packet run
# selfCheckDiffs 0; exit 0
# D5: total 35, ok 24, fragment 7, gdsUnvalidated 1, packetBugs 0, rulingBroken 3, failing 3, cypher25 0
#   rulingBroken: Q-D5-13 (R-80 PROTOCOL_AUTHORED_BY), Q-D5-17 (R-80), Q-D5-20 (R-42 identifier join)

cd C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A5 && node scripts/packet-check.mjs D5
# {"ok": true, "packet": "D5", counts nodeTypes 6, relationshipTypes 6, pairs 8, questions 34, fixtures 4}; exit 0
```

Files modified (A5): 02-questions.md, 03-retrieval-patterns.md, 10-seams.yaml, 11-open-questions.md, RUNLOG.md.
