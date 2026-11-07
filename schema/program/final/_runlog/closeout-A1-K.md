# Close-out: pattern lint — A1 / packet K (2026-10-09)

Worktree `biotech-knowledge-services-A1` (ft/schema-A1 @ 7aaeb2f, uncommitted edits). Written only under `schema/program/packets/K/` there; SDL untouched.

## Input

Linter report `final/_work/pattern-lint.md`: K 36 blocks, 1 ok, 35 packetBug, 0 rulingBroken (7 "also ruling"). All 35 carried the `CYPHER 25` prefix; EXPLAIN errors after stripping it:
- Q-K-14: `SyntaxError: Invalid input 'SEARCH'` (Cypher 25 vector SEARCH clause, Neo4j 2026.01+).
- Q-K-16: `In a WITH/RETURN with DISTINCT or an aggregation, it is not possible to access variables declared before the WITH/RETURN: adj` (ORDER BY adj.recordedAt after collect()).

## Commands

```
sed -i '/^CYPHER 25$/d' schema/program/packets/K/03-retrieval-patterns.md     # 35 lines removed
python (exact-string replacements): header prose, dynamic-label note, Q-K-14 prose + block, Q-K-16 block
grep -rn -i "cypher 25" schema/program/packets/K   # only the explanatory prose mentions remain; no SDL/register hits
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs \
  --packets K --json <scratchpad>/lint-K.json --md <scratchpad>/lint-K.md
  -> "K: 36 total, 7 failing (0 packetBug, 7 rulingBroken), 0 fragment, 0 gds"; selfCheckDiffs 0; CYPHER 25 prefix: no
node scripts/packet-check.mjs K
  -> {"ok": true, nodeTypes 11, relationshipTypes 13, pairs 32, questions 35, fixtures 6}; exit 0
```

Linter outputs went to the scratchpad so the shared all-packet `pattern-lint.{json,md}` was not overwritten by a K-only run; the coordinator re-runs the full lint.

## Result

- Blocks fixed: 35 (35 prefix removals; Q-K-14 rewritten to `CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS c, score WHERE c:Chunk AND c.language = 'en'`; Q-K-16 projects `adj.recordedAt AS adjRecordedAt` before ORDER BY).
- Remaining: 0 packetBug; 7 rulingBroken left as the packet record (R-44 Q-K-10/Q-K-17/Q-K-22, R-15 Q-K-15/Q-K-23, R-43 Q-K-21, R-09 CQ-AX-04); S writes the final-SDL versions.
- No schema change needed.
