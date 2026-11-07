# Close-out — packet owner A3, packet D4 (pattern lint)

2026-10-09. Worktree `biotech-knowledge-services-A3` (ft/schema-A3), writes under `schema/program/packets/D4/` only; not committed.

Input from `final/_work/pattern-lint.json`: D4 total 38, failing 3, packetBug 3, rulingBroken 0.

| Block | Finding | Fix |
|---|---|---|
| Q-D4-09 (L379) | `(Identifier)-[:HAS_IDENTIFIER]->(Device)` reversed | `(d)-[:HAS_IDENTIFIER]->(id:Identifier)` |
| Q-D4-14 (L469) | `od.measureText` not on OutcomeDefinition (D3) | `od.name, od.description, od.timepoint` |
| Q-D4-22 (L604) | `CYPHER 25` prefix + `SEARCH … VECTOR INDEX` syntax error on 5.26 | prefix removed; `CALL db.index.vector.queryNodes('metric_embedding', 20, $textEmbedding) YIELD node AS m, score AS vs` |

Grep for the same errors elsewhere in D4 (SDL docstrings, registers, 09/10/11, SUMMARY; `_notes/` excluded): none.

Commands and key outputs:

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D4 \
  --json <scratchpad>/lint-D4.json --md <scratchpad>/lint-D4.md
  -> "D4: 38 total, 0 failing (0 packetBug, 0 rulingBroken), 2 fragment, 1 gds"; selfCheckDiffs 0
  -> Q-D4-09 ok, Q-D4-14 ok, Q-D4-22 ok (EXPLAIN ok)
node scripts/packet-check.mjs D4   (in A3)
  -> ok: true, exit 0 (nodeTypes 7, relationshipTypes 13, pairs 17, questions 35, fixtures 7)
```

The per-packet run wrote its reports to the session scratchpad, not to `final/_work/pattern-lint.{json,md}`; the coordinator's full re-run refreshes the shared report. SDL unchanged.
