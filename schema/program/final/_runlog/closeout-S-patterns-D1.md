# Close-out — S pattern writer, packet D1 (FU-04)

2026-10-09. Worktree `biotech-knowledge-services-S` (ft/schema-S, 31390a6). Not committed; SDL unchanged (sha256 `c7cf1235…4793`).

## Inputs

- `final/_work/pattern-lint.json` D1: total 36, failing 9 (packetBug 6, rulingBroken 3; CQ-ID-04 packetBug with alsoRulingBroken R-42).
- Owner's fixed `biotech-knowledge-services-A2/schema/program/packets/D1/03-retrieval-patterns.md` (head 6635197 + uncommitted close-out edits; `_runlog/closeout-A2-D1.md`: owner re-lint "36 total, 4 failing (0 packetBug, 4 rulingBroken)").
- Rulings read: R-30, R-42, R-68 (`decision-report.md`); `vocabularies/predicates.yaml` (MANUFACTURES_MATERIAL alias-of MANUFACTURES; SUPPLIES_MATERIAL qualifiers buyer, exclusivity; MARKETED_UNDER_MARK D1); `vocabularies/identifier-schemes.yaml` rules (identity, uniqueness, bridges).
- Qualifier spelling `declaredName:` / `form:` taken from the re-pathed fixtures (`fixtures/D10/mg-rankings-criteria-comparison`, `fixtures/cross-domain/product-comparison`, `fixtures/D1/*` after the FU-03 close-out).

## Output

`final/patterns-by-question/D1.md`: CQ-PF-01 (R-30), CQ-ID-03 (R-30), CQ-ID-04 (R-42), Q-D1-16 (R-68). 4 rewritten, 4/4 EXPLAIN ok, 0 static findings, 0 gds-unvalidated, 0 lost. CQ-ID-04 drops the `alsoAssignedTo` shared-Identifier column; disagreement is now same (scheme, value) from another issuer (value comparison of two Identifiers, never identity) plus RESOLUTION / EQUIVALENCE Assessments about the substance.

## Commands

```
docker ps --filter name=bks-neo4j-synth   -> Up 5 hours
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D1 --fill
  -> D1: {"questions":4,"ok":4,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":4,"statementsExplainOk":4,"staticFindings":0}
     report: final/_work/by-question/D1.json (Neo4j 5.26.31 community)
```

Plan probe (scratchpad driver script, EXPLAIN only) for CQ-ID-04's `sameValueElsewhere` subquery: `NodeUniqueIndexSeek UNIQUE oi:Identifier(scheme, issuer, value) WHERE scheme = i.scheme AND issuer IS NOT NULL AND value IS NOT NULL` then Filter on value / issuer. Cost grows with the size of the scheme; a `(scheme, value)` index would make it a point seek. That is executor DDL (EX-01), not SDL; noted in D1.md.

`validate-by-question.mjs` reused unchanged (shared). No other container touched; no volumes pruned.
