# Close-out: pattern lint — packet owner A6, packet D7 (2026-10-09)

Worktree `biotech-knowledge-services-A6` (branch ft/schema-A6, HEAD 2ca247a); wrote only `schema/program/packets/D7/{03-retrieval-patterns.md, RUNLOG.md}`. Not committed.

Input: `final/_work/pattern-lint.json` D7 = 34 total, 8 failing, 1 packetBug, 7 rulingBroken.

## Fix

Q-D7-04 (03 line ~310): `Neo.ClientError.Statement.SyntaxError: Type mismatch: inv defined with conflicting type Relationship (expected Node)`.
Variable `inv` bound both to the issuer `INVOLVES` edge and to the investor node. Change:

```
- MATCH (x:Organization {uid: $issuer})<-[inv:INVOLVES]-(e)
- WHERE e.eventKind = 'FINANCING'
+ MATCH (x:Organization {uid: $issuer})<-[iss:INVOLVES]-(e)
+ WHERE e.eventKind = 'FINANCING' AND iss.role = 'ISSUER'
```

(D13 `EventRoleEdgeProperties.role: EventRole!` declares `ISSUER`.) No other D7 text repeats the error.

## Commands

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D7 \
  --json <scratchpad>/lint-D7.json --md <scratchpad>/lint-D7.md
# -> "D7: 34 total, 7 failing (0 packetBug, 7 rulingBroken), 0 fragment, 2 gds"; selfCheckDiffs 0; Q-D7-04 class ok
node scripts/packet-check.mjs D7      # (A6) -> exit 0, "ok": true, nodeTypes 4, relationshipTypes 7, pairs 9, questions 33, fixtures 6
```

The shared `final/_work/pattern-lint.{json,md}` were not overwritten (D7-only run written to scratch); the coordinator's full re-run will pick up the fix.

Remaining rulingBroken (unchanged by instruction): R-19 pendingEdit, R-30 `roleTitleVerbatim`, R-80 predicate `AUTHORED`.
