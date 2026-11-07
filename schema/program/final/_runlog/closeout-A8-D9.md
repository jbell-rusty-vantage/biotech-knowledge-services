# Close-out — packet owner A8, packet D9 (pattern lint)

Date: 2026-10-09. Worktree: C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A8 (ft/schema-A8 @ 5b9788a, uncommitted edits under schema/program/packets/D9/ only).

## Input

`final/_work/pattern-lint.json` D9: total 40, failing 30, packetBug 5, rulingBroken 25. The 5 packetBug blocks (all also rulingBroken for F-05 `ClaimOccurrence`):

| line | block | packet issue |
|---|---|---|
| 41 | Conventions index DDL | `CYPHER 25`; `CREATE VECTOR INDEX … WITH [...]` syntax error on 5.26 |
| 118 | CQ-CL-05 | `CYPHER 25` |
| 304 | Q-D9-02 | `CYPHER 25` |
| 591 | Q-D9-19 | `CYPHER 25` |
| 616 | Q-D9-20 | `CYPHER 25`; `SEARCH` clause syntax error on 5.26 |

## Edits (schema/program/packets/D9/03-retrieval-patterns.md)

- Removed the `CYPHER 25` prefix from all 5 blocks; header text says Cypher 5 (also valid Cypher 25).
- `chunk_embedding` DDL: dropped the 2026.01+ `WITH [ … ]` in-index filter clause; prose names it as the 2026.01+ addition.
- Q-D9-20: `SEARCH` → `CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS c, score` + `WITH c, score WHERE c.language = 'en'`; SEARCH form kept as a comment (as final P-04a).
- No SDL / register / docstring change (grep for `CYPHER 25` / `SEARCH` in D9 found none outside 03 and RUNLOG history). rulingBroken blocks untouched.

## Commands and key outputs

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D9 --json <scratchpad>/lint-D9.json --md <scratchpad>/lint-D9.md
  → "D9: 40 total, 30 failing (0 packetBug, 30 rulingBroken), 1 fragment, 0 gds"; cypher25 0; selfCheckDiffs 0
  → blocks 41, CQ-CL-05, Q-D9-02, Q-D9-19 (projection), Q-D9-20: EXPLAIN ok
node scripts/packet-check.mjs D9   (in A8)
  → ok: nodeTypes 3, relationshipTypes 8, pairs 9, questions 36, fixtures 6; exit 0
```

The shared `final/_work/pattern-lint.{json,md}` were not overwritten (reports went to the scratchpad); the coordinator re-runs the full lint.

Files written: A8 `schema/program/packets/D9/03-retrieval-patterns.md`, `schema/program/packets/D9/RUNLOG.md`; this log. Nothing committed.
