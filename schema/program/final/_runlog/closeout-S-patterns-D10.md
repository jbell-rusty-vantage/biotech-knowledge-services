# Close-out — S pattern writer / packet D10 (FU-04)

2026-10-09. Worktree C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S (ft/schema-S @ 31390a6). Wrote `final/patterns-by-question/D10.md` and this log; `final/_work/by-question/D10.json` is the validator's report. No SDL change (sha256 c7cf1235dba876b2… unchanged); nothing committed. Shared validator `final/_work/validate-by-question.mjs` reused unchanged.

## Inputs

- `final/_work/pattern-lint.json` D10: 37 blocks, 7 failing = 4 packetBug (CQ-RC-06, Q-D10-07, Q-D10-11, Q-D10-17; fixed by owner A1, see `closeout-A1-D10.md`) + 3 rulingBroken: Q-D10-03 (R-83), Q-D10-08 (R-83), Q-D10-21 (R-94).
- Owner patterns: `biotech-knowledge-services-A1/schema/program/packets/D10/03-retrieval-patterns.md` (7aaeb2f + uncommitted close-out edits).
- Rulings: decision-report R-83, R-94, R-19, R-34, R-78/R-89; `_work/rulings.yaml` lines 354-360; `vocabularies/predicates.yaml` (RECOMMENDS_AGAINST registrar D9; CHARACTERIZES_EVIDENCE_STRENGTH subject Claim; USE_CONSTRAINED_IN object Condition; HOLDS_ROLE / HOLDS_STAKE / RECEIVES_VALUE_FROM registered).
- Final IR pairs checked: OCCURS_IN Assertion→MediaWork; RENDITION_OF Source→MediaWork|Publication; BLOCKED_BY ReportItem→UseConstraint|Assessment; ASSESSES Assessment|Report|ReportItem→Target|Claim; RESOLVES_TO_CONSTRAINT Assertion→UseConstraint.

## Commands and key outputs

1. `node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D10`
   → `D10: {"questions":3,"ok":3,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":3,"statementsExplainOk":3,"staticFindings":0}`.
2. Negative self-test on a scratch copy (scratchpad, `--no-db`): OCCURS_IN → Publication, `HAS_INTEREST_IN` predicate, `tloc.exactX` → 5 findings (pair, retired-by:R-78 predicate, property ×3), all 3 questions failing. Confirms macro-expanded static checks run on this file.
3. `node …/validate-by-question.mjs --packets D10 --fill` → same counts, exit 0; status lines filled ("EXPLAIN: ok on Neo4j 5.26.31 community (1/1 statement); final-SDL static check clean").
4. `sha256sum final/schema/final_biotech_schema_v2.graphql` → c7cf1235dba876b2… (unchanged).

## Result

3 questions rewritten, 3/3 EXPLAIN ok, 0 GDS, 0 lost. Q-D10-03 / Q-D10-08: guideline branch → WORSENS_TARGET | NO_EFFECT_ON_TARGET with speechAct CAUTIONS | RECOMMENDS, USE_CONSTRAINED_IN population guidance, D9 RECOMMENDS_AGAINST via `target:<key>` qualifier (no Target object). Q-D10-21: container from OCCURS_IN (R-94), statement time per R-19, RECOMMENDS_USE subject only (R-83), interest families HOLDS_ROLE | HOLDS_STAKE | RECEIVES_VALUE_FROM.

Note for open-questions (not edited by this role): the `target:<key>` qualifier prefix used by R-83 is not among the "registered prefixes" listed in the Assertion.qualifiers docstring of the final SDL; worth registering in the qualifier vocabulary (no SDL change needed now).
