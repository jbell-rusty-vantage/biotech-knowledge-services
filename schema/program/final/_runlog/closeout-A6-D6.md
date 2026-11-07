# Close-out: pattern lint — A6 / D6

2026-10-09. Worktree C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A6 (ft/schema-A6, HEAD 2ca247a, uncommitted). Writes only under schema/program/packets/D6/.

Input (S pattern-lint.json, 2026-10-09T06:48Z): D6 total 41, failing 8, packetBug 3 (Q-D6-01 L67, CQ-AX-19 L704, Q-D6-18 L756), rulingBroken 5.

Fixes (03-retrieval-patterns.md):
1. Q-D6-01 — `r.validObservedAt` not on HAS_LABEL_VERSION (StateEpisodeProperties); kernel field is Assertion.validObservedAt → join `(ea:Assertion {uid: r.assertionUid})`, coalesce `ea.validObservedAt`.
2. CQ-AX-19 — `RESULT_FOR` → `QUALITY_RESULT_FOR` (D8 rename, OQ-D8-30). Also 10-seams.yaml inbound row and 11-open-questions.md OQ-D6-13.
3. Q-D6-18 — "Aggregation column contains implicit grouping expressions" (`xs + collect(...)`) → `WITH p, xs, collect(DISTINCT pk) AS pks, … ` then `WITH p, xs + pks + lvs + ls AS scope`.

Commands:
- `node C:/…/final/_work/lint-packet-patterns.mjs --packets D6 --json <scratch>/lint-D6.json --md <scratch>/lint-D6.md`
  → D6: total 41, ok 31, fragment 4, gdsUnvalidated 0, packetBugs 0, rulingBroken 6, cypher25 0, selfCheckDiffs 0. (Scratch output used so the shared final/_work/pattern-lint.{json,md} was not overwritten mid-round.)
- `node scripts/packet-check.mjs D6` (A6) → ok true, exit 0 (nodeTypes 6, relationshipTypes 9, pairs 11, questions 37, fixtures 7).

Remaining rulingBroken (6, left for S): Q-D6-01, CQ-PF-01, CQ-AX-25, Q-D6-08, Q-D6-10 (R-30 DECLARES_COMPONENT declaredNameVerbatim / formVerbatim / statementVerbatim), Q-D6-11 (R-30 + predicate PREPARED_WITH not in final predicate vocabulary).
No SDL change. No commit.
