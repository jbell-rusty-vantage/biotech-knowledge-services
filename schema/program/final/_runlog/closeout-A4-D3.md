# Close-out — packet owner A4 / D3 (pattern lint, FU-04)

2026-10-09. Worktree `biotech-knowledge-services-A4` (ft/schema-A4, base 44b87ff). Edited only `schema/program/packets/D3/03-retrieval-patterns.md` and appended `RUNLOG.md` ("Close-out: pattern lint"). No SDL change; nothing committed.

## Input
`final/_work/pattern-lint.json`: D3 `{"total":33,"failing":6,"packetBugs":5,"rulingBroken":1}`. packetBug blocks: CQ-EV-05 (UNION column names differ), Q-D3-11 and Q-D3-12 (`r.recordedTo` — iterator `r` shadowed the StudyResult variable), Q-D3-13 (implicit grouping key `loc.selectorDigest` inside an aggregate), Q-D3-14 (`CYPHER 25` + `SEARCH` clause).

## Fixes
- CQ-EV-05: aliased both UNION branches of statement 2 (`kind, uid, predicate, recordedAt, dependants`); `;` after statement 1.
- Q-D3-11 / Q-D3-12: `all(rv IN relationships(path) WHERE ASOF(rv))`.
- Q-D3-13: `WITH … collect(aloc.selectorDigest) AS verifierDigests` then `loc.selectorDigest IN verifierDigests`.
- Q-D3-14: `CALL db.index.vector.queryNodes('chunk_embedding', 50, $queryEmbedding) YIELD node AS ch, score`; header text "Cypher 25" → "Cypher 5 (Neo4j 5.26)".
- grep of D3 (excluding `_notes/`) for `CYPHER 25` / `SEARCH` / the shadowed filter: no other occurrences in SDL, registers or seams.

## Commands and key outputs
```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D3 \
  --json <scratchpad>/lint-D3.json --md <scratch>/lint-D3.md
  -> "D3: 33 total, 2 failing (0 packetBug, 2 rulingBroken), 1 fragment, 1 gds"; selfCheckDiffs 0
node scripts/packet-check.mjs D3   (in A4)
  -> "ok": true, exit 0
```
Lint reports went to the session scratchpad so the shared `final/_work/pattern-lint.{json,md}` were not overwritten; the coordinator's full re-run will refresh them.

## Left for S
rulingBroken (not rewritten, packet stays a record of its SDL): CQ-EV-05 shared-Identifier Publication↔Source join (R-42); Q-D3-04 `rec.revisionStatus = 'RETRACTED'` vs SourceRevisionKind (R-44). Fragment (Conventions `TRACE` body, needs outer `e`) and gds-unvalidated CQ-ST-07 unchanged.
