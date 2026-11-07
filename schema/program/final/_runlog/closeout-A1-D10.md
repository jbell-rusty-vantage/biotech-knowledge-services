# Close-out — A1 / packet D10 (pattern lint, FU-05)

2026-10-09. Worktree C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A1 (ft/schema-A1, HEAD 7aaeb2f). Wrote only `schema/program/packets/D10/03-retrieval-patterns.md` and `schema/program/packets/D10/RUNLOG.md` there (plus this log). No SDL change; nothing committed. (Uncommitted K/03 + K/RUNLOG changes in the same worktree belong to the K owner's close-out, not this role.)

## Commands and key outputs

1. Read D10 entries of `final/_work/pattern-lint.json`: 37 blocks, 7 failing = 4 packetBug (CQ-RC-06 property `assessmentSubkind` on UseConstraint; Q-D10-07 unregistered PREPARATION_OF/FORM_OF/CONTAINS_INGREDIENT; Q-D10-11 unregistered FORM_OF; Q-D10-17 `CYPHER 25` + SEARCH syntax error) + 3 rulingBroken (Q-D10-03, Q-D10-08 R-83; Q-D10-21 R-94).
2. Edited 03 (4 blocks):
   - CQ-RC-06: separate `uc:UseConstraint` / `bs:Assessment` BLOCKED_BY targets; `coalesce(uc.constraintKind, bs.assessmentSubkind)`.
   - Q-D10-07: predicates → `REALIZES_SUBSTANCE, HAS_ACTIVE_MOIETY, MATERIAL_CONTAINS` (D1), `FOOD_CONTAINS` (D12), `DECLARES_COMPONENT` (D6) — all registered in owner 05 registers.
   - Q-D10-11: `EXISTS { MATCH … WHERE predicate IN ['HAS_ACTIVE_MOIETY','REALIZES_SUBSTANCE'] }`.
   - Q-D10-17: `CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS ch, score AS sim`.
3. `node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D10 --json <scratchpad>/lint-D10.json --md <scratchpad>/lint-D10.md`
   → `D10: 37 total, 3 failing (0 packetBug, 3 rulingBroken), 0 fragment, 0 gds`; selfCheckDiffs 0; fixed blocks all `ok`. (Shared pattern-lint.json/.md not overwritten; the linter owner's full re-run will pick up the change.)
4. `node scripts/packet-check.mjs D10` (A1) → `{"ok": true, … nodeTypes 3, relationshipTypes 6, pairs 9, questions 36, fixtures 5}`, exit 0.
5. FU-05: `python C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A1/schema/program/packets/D10/_notes/answer_kind_table.py C:/Users/Pinda/Proyectos/Biotech` → exit 0, no stderr warnings; `answer-kind-table.md` byte-identical to committed (`cmp` identical; sha256 73bd9020bdf1ce21…). 475 rows, 17 disagreements, 5 conflicts, 6 variants. Owner HEADs read: A1 7aaeb2f, A2 6635197, A3 f4fb477, A4 44b87ff, A5 53b6a9f, A6 2ca247a, A7 10ef1ea, A8 5b9788a.
   - Drift: A5 `D5/02-questions.md` has one uncommitted edit (CQ-RC-06 answer-shape text only; kind unchanged `published`) — no table effect.

## Result

packetBug 4 → 0; rulingBroken 3 unchanged (S stage writes final-SDL versions). FU-05 reproduced. RUNLOG entry "Close-out: pattern lint" appended in packets/D10/RUNLOG.md.
