# Close-out — FINAL-SDL PATTERN WRITER (S) for D8 — 2026-10-09

Scope: FU-04 follow-through for packet D8. No SDL edit, no commit.

## Inputs read
- `final/_work/pattern-lint.json` D8: total 35, failing 8 (packetBug 2, rulingBroken 6). rulingBroken: CQ-MF-01 (R-68, L333), Q-D8-10 (R-68, L350), Q-D8-13 (R-68, L399), Q-D8-18 (R-73, L483), Q-D8-19 (R-73, L512), Q-D8-23 (R-72 + R-94, L620, incl. pendingEdit R-72).
- Owner copy `biotech-knowledge-services-A7/schema/program/packets/D8/03-retrieval-patterns.md` (head 10ef1ea + owner's uncommitted close-out edits: Q-D8-03 off CYPHER 25, CQ-EC-01 AS_OF/KNOWN_AT, TRACE adj.verdict; the six ruling-broken blocks left as packet record).
- decision-report R-68, R-72, R-73, R-94; `final/vocabularies/predicates.yaml` (SUPPLIES_MATERIAL qualifiers buyer/exclusivity; MANUFACTURER_UNNAMED literal on Organization; CONTRACT_MANUFACTURES_FOR Org→Org qualifier product; MEASURED_CONTENT_IN_PRODUCT / CONTAINS_UNDECLARED_SUBSTANCE subject Product|ProductVariant, object ChemicalSubstance); final SDL (QualityResult.resultFor: [Lot]; LotOfTarget = Product | ProductVariant; DELIVERS stored Product → Device; RegulatoryRecordTopic / LegalStatusSubject without Device; CertificationCoverageTarget = Product | ProductVariant | Lot); fixtures D7/niagen-ownership-brand-history n-19/n-20 (qualifier spelling `exclusivity=SOLE`, `buyer=<uid>`), D4/noninvasive-glucose-cgm-recall (recall → Product, DELIVERS c04).

## Written
- `final/patterns-by-question/D8.md` — header + counts, 6 sections (## CQ-MF-01, Q-D8-10, Q-D8-13, Q-D8-18, Q-D8-19, Q-D8-23), TRACE inlined as `CALL (…) {…}` or carried as assertionUid per row.
- Reused shared validator `final/_work/validate-by-question.mjs` (unchanged).

## Commands and key outputs
- `docker ps --filter name=bks-neo4j-synth` → Up; `CALL dbms.components()` → Neo4j Kernel 5.26.31 community.
- `node C:/…/S/schema/program/final/_work/validate-by-question.mjs --packets D8 --out <scratch>/bq` → D8: questions 6, ok 6, failing 0, statements 6, EXPLAIN ok 6, staticFindings 0.
- Plan check: Q-D8-23 plan had DirectedRelationshipTypeScan (LOT_OF with `lt = p OR lt IN variants`); rewritten to UNWIND lot targets → no scans.
- Negative test: `validate-by-question.mjs --files <scratch>/neg/D8.md --no-db` with SUPPLIES_INGREDIENT, QUALITY_RESULT_FOR→Product and reversed DELIVERS → 4 failing (alias-of predicate, 3 pair findings). Validator catches the ruling breaks.
- `node C:/…/S/schema/program/final/_work/validate-by-question.mjs --packets D8 --fill` → exit 0; 6/6 ok; report `final/_work/by-question/D8.json`; no AllNodesScan / CartesianProduct / label or type scan in any plan.

## Results
- Rewritten 6; answered through another path 3 (Q-D8-18, Q-D8-19 via Lot + D1 survey predicates, R-73; Q-D8-23 via Product -DELIVERS-> Device, R-72); lost 0; EXPLAIN ok 6/6; gds-unvalidated 0.
- Applied alongside (not flagged by lint because X was unlabeled): R-73 patent leg of Q-D8-10 / Q-D8-13 through IngredientMaterial -REALIZES_SUBSTANCE-> ChemicalSubstance <-CONCERNS- Patent.
- No SDL change needed; nothing added to open-questions.md.
