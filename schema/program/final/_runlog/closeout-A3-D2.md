# Close-out — packet owner A3, packet D2 (pattern lint)

2026-10-09. Worktree `biotech-knowledge-services-A3` (branch ft/schema-A3, head f4fb477, uncommitted edits under `schema/program/packets/D2/` only). No SDL change.

## Baseline (S `final/_work/pattern-lint.json`)

D2: total 39, failing 5 — packetBug 3 (Q-D2-11, Q-D2-16, Q-D2-21 [alsoRulingBroken R-52/R-89]), rulingBroken 2 (Q-D2-10 R-59, Q-D2-18 R-47).

## Edits (A3 worktree, `schema/program/packets/D2/`)

| Block | Finding | Fix |
|---|---|---|
| Q-D2-11 (03 l.433) | HAS_IDENTIFIER direction reversed | `(x)-[:HAS_IDENTIFIER]->(id:Identifier)` |
| Q-D2-16 (03 l.526) | no pair Assessment→Assertion for ASSESSES | `(cl)-[:OCCURRENCE_OF]->(:Claim)<-[:ASSESSES]-(asm:Assessment {assessmentKind:'EVIDENCE_SYNTHESIS'})` |
| Q-D2-21 (03 l.628-629) | 4 unregistered predicates (HOLDS_EQUITY_IN, CONSULTS_FOR, INVENTOR_OF_PATENT_LICENSED_TO, SUPPLIES) | D7 typed `HOLDS_STAKE|HOLDS_ROLE|RECEIVES_VALUE_FROM` (Person→Organization, `recordedTo IS NULL`) + D7 predicate-only `SUPPLIES_MATERIAL` (Organization→IngredientMaterial, D1 REALIZES_SUBSTANCE roll-up); section prose reworded |

Also: `11-open-questions.md` item 19 marked resolved; `10-seams.yaml` ASSESSES seam names K.Claim. `RUNLOG.md` entry "Close-out: pattern lint".

## Commands and outputs

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D2 \
  --json <scratchpad>/lint-D2.json --md <scratchpad>/lint-D2.md
# run 1 (after query fixes): D2: 39 total, 3 failing (0 packetBug, 3 rulingBroken) — Q-D2-21 prose still named the old predicates (R-89 pending-edit check reads prose)
# run 2 (prose reworded):    D2: 39 total, 2 failing (0 packetBug, 2 rulingBroken), 10 fragment, 1 gds; ok 26; cypher25 0; selfCheckDiffs 0
#                            Q-D2-11 ok, Q-D2-16 ok, Q-D2-21 ok

cd C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A3 && node scripts/packet-check.mjs D2
# {"ok": true, "packet": "D2", counts: nodeTypes 5, relationshipTypes 6, pairs 10, questions 34, fixtures 5}  exit 0
```

The per-packet lint reports went to the session scratchpad, not to `final/_work/pattern-lint.{json,md}` (shared report left for the linter owner to regenerate).

## Remaining

- rulingBroken (not rewritten here, by instruction): Q-D2-10 (R-59: `r.direction = 'DECREASES'` not in final EstimateDirection), Q-D2-18 (R-47: `nNoChangeContexts`; ranks AFFECTS_MECHANISM, not a D10 Association).
- Fixture `07-fixtures/nr-muscle-unstructured` A-nr-06 still uses the draft predicate `HOLDS_EQUITY_IN` (FU-03 re-path; D7 form is a HOLDS_STAKE {stakeKind: EQUITY} episode).
