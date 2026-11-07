# Close-out — A7 / D13 pattern lint

2026-10-09. Worktree `biotech-knowledge-services-A7` (ft/schema-A7, HEAD 10ef1ea). Wrote only `schema/program/packets/D13/03-retrieval-patterns.md` and `schema/program/packets/D13/RUNLOG.md` there; this log in S. No commit. SDL unchanged.

## Input
`final/_work/pattern-lint.json`: D13 total 35, failing 9, packetBug 5, rulingBroken 4.

## packetBug blocks fixed (5)
- L187 Q-D13-05: removed `CYPHER 25` + `SEARCH c IN (VECTOR INDEX ...)`; now `CALL db.index.vector.queryNodes('chunk_embedding', 8, $queryEmbedding) YIELD node AS c, score`; dropped `c.recordedTo` (not a D9 Chunk property).
- L470 Q-D13-16: implicit grouping (`events` with `count(st)`) → `WITH x, events, collect(DISTINCT st.uid) AS registeredStudies`.
- L503 Q-D13-17: `(Assessment)-[:ASSESSES]->(Assertion)` → `(occ)-[:OCCURRENCE_OF]->(:Claim)<-[:ASSESSES]-(as:Assessment)-[:DERIVED_FROM]->(occ)` (kernel Assessment docstring rule).
- L671 Q-D13-24: same pair → via OCCURRENCE_OF Claim.
- L690 Q-D13-25: ORDER BY on `e` after aggregation → projected `orderAt`.
- Conventions "Kernel path names" bullet clarified (no Assessment→Assertion).

## Commands
```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D13 --json <scratch>/lint-D13.json --md <scratch>/lint-D13.md
  -> "D13: 35 total, 4 failing (0 packetBug, 4 rulingBroken), 0 fragment, 0 gds"; cypher25 0; selfCheckDiffs 0
  -> fixed blocks Q-D13-05/16/17/24/25: class ok, EXPLAIN ok
cd biotech-knowledge-services-A7 && node scripts/packet-check.mjs D13
  -> exit 0; {"ok": true, "packet": "D13", counts nodeTypes 2, relationshipTypes 5, pairs 7, questions 33, fixtures 5}
```
Report written to scratch (not over `final/_work/pattern-lint.json`); the S coordinator's full re-lint will pick up the A7 change.

## Remaining (rulingBroken, left for S final-SDL versions)
Q-D13-04 L132 (R-66), Q-D13-12 L366 (R-66), Q-D13-14 L421 (R-44 PUBLISHER), Q-D13-22 L611 (R-21 pending edit-pattern).
