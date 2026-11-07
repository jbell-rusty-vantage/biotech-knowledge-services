# Close-out: pattern lint — packet owner A7, packet D8 (2026-10-09)

Worktree `biotech-knowledge-services-A7` (branch ft/schema-A7, HEAD 10ef1ea); wrote only `schema/program/packets/D8/{03-retrieval-patterns.md, RUNLOG.md}`. Not committed. SDL unchanged.

Input: `final/_work/pattern-lint.json` D8 = 35 total, 8 failing, 2 packetBug, 6 rulingBroken.

## Fixes (03-retrieval-patterns.md)

1. Q-D8-03 statement 2 (line ~153): `CYPHER 25` prefix + Cypher 25 `SEARCH c IN (VECTOR INDEX chunk_embedding FOR $questionEmbedding LIMIT 20) SCORE AS score`
   (SyntaxError "Invalid input 'SEARCH'") ->
   `CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS c, score`. Statements (1)/(2) now end with `;`.
2. CQ-EC-01 (line ~547): the shared post-UNION AS_OF filter read `r.validFrom`/`r.validTo` on ADDRESSED_TO|ISSUED_BY (and CONCERNS,
   QUALITY_RESULT_FOR, LOT_OF), which carry `AssertedRecordedProperties` (no valid time). Filters moved into each UNION branch:
   AS_OF on STATUS_OF|COVERS and ASSIGNED_TO|LICENSED_TO (AssertedEdgeProperties); KNOWN_AT on CONCERNS|QUALITY_RESULT_FOR|LOT_OF,
   ADDRESSED_TO|ISSUED_BY and the intermediate CONCERNS hop.
3. TRACE convention fragment (static finding, not counted): `adj.semanticVerdict` -> `adj.verdict` (kernel `Adjudication.verdict: SemanticVerdict!`).

grep of D8 (04 SDL, 05/06 registers, 09, 10, fixtures) for `CYPHER 25`, `SEARCH c IN`, `semanticVerdict`: no other occurrence.
rulingBroken blocks (CQ-MF-01, Q-D8-10, Q-D8-13 [R-68]; Q-D8-18, Q-D8-19 [R-73]; Q-D8-23 [R-72]) left untouched by design.

## Commands

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D8 \
  --json <scratchpad>/d8-lint.json --md <scratchpad>/d8-lint.md
# -> D8: total 35, ok 27, fragment 2, gdsUnvalidated 0, packetBugs 0, rulingBroken 6, failing 6, cypher25 0; selfCheckDiffs 0
node scripts/packet-check.mjs D8      # (A7) -> exit 0, "ok": true, nodeTypes 6, relationshipTypes 11, pairs 29, questions 33, fixtures 6
```

The shared `final/_work/pattern-lint.{json,md}` were not overwritten (D8-only run written to scratch); the coordinator's full re-run will pick up the fix.
