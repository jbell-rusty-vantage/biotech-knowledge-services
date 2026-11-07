# Close-out: pattern lint — packet owner A2, packet D12 (2026-10-09)

Scope: fix every packetBug block of `biotech-knowledge-services-A2/schema/program/packets/D12/03-retrieval-patterns.md` (lint class packetBug); write only under `packets/D12/` in A2; no SDL change; no commit.

Input: `final/_work/pattern-lint.json` D12 = {total 36, failing 9, packetBugs 9, rulingBroken 0}.
packetBug blocks (question → finding): Q-D12-03 (RESULT_FOR pair, rf.assertionUid), Q-D12-04 (lv.asOfStatement), Q-D12-05 (HAS_IDENTIFIER direction), Q-D12-06 (RESULT_FOR pair, HAS_ACTION_LEVEL unregistered), Q-D12-07 (SUPPLIED_INGREDIENT/PROCESSED_INGREDIENT retired), Q-D12-16 (u.exposureChange), Q-D12-18 (HAS_CLAIM_CONDITION unregistered), Q-D12-26 (implicit grouping), Q-D12-34 (implicit grouping + HAS_IDENTIFIER direction).

Commands and key outputs:

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D12 --json <scratchpad>/lint-D12.json --md <scratchpad>/lint-D12.md
  -> "D12: 36 total, 3 failing (0 packetBug, 3 rulingBroken), 2 fragment, 0 gds"; selfCheckDiffs 0
  rulingBroken left for S: Q-D12-03 / Q-D12-06 (QualityResult)-[:QUALITY_RESULT_FOR]->(Product) pair cut [R-73/R-95]; Q-D12-18 dc.statementVerbatim [R-30]
(cd biotech-knowledge-services-A2) node scripts/packet-check.mjs D12
  -> {"ok": true, "packet": "D12", nodeTypes 3, relationshipTypes 4, pairs 8, questions 34, fixtures 5}; exit 0
```

The re-run wrote its reports to the session scratchpad, not over the shared `final/_work/pattern-lint.{json,md}`.

Files changed (A2, uncommitted): `packets/D12/03-retrieval-patterns.md` (9 blocks + header convention line), `05-relationship-register.yaml` (predicateOnly: HAS_ACTION_LEVEL | HAS_CLAIM_CONDITION consumed from D8 per R-93), `10-seams.yaml` (D8 seam RESULT_FOR -> QUALITY_RESULT_FOR), `11-open-questions.md` (OQ-D12-31 close-out note), `RUNLOG.md` ("Close-out: pattern lint").

Not changed: `04-schema-proposal.graphql` (no docstring repeated an error); fixture `07-fixtures/acrylamide-fried-potato-harm` still writes D8 `RESULT_FOR` (the S re-pathed fixtures own that, FU-03). The A2 worktree also shows uncommitted D1 edits by the D1 owner; untouched.
