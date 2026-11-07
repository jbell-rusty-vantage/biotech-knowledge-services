# Close-out — S final-SDL pattern writer, packet D5

2026-10-09. Worktree `biotech-knowledge-services-S` (branch ft/schema-S, base 31390a6). No SDL change and no commit.

## Inputs

- `final/_work/pattern-lint.json` (generated 2026-10-09T06:48:53Z), D5 entry: total 35, ok 23, fragment 7, gds-unvalidated 1 (Q-D5-19), failing 4.
  - packetBug 2: CQ-RC-06 (`(ReportItem)-[:BLOCKED_BY]->(Assertion)`, R-09 pair) and Q-D5-13 (`i.observedAt` on the D7 interest edges). Q-D5-13 is also flagged `alsoRulingBroken`: `PROTOCOL_AUTHORED_BY` was retired by R-80 and replaced with `AUTHORED_BY`.
  - rulingBroken 2: Q-D5-17 (R-80, `PROTOCOL_AUTHORED_BY`) and Q-D5-20 (R-42, the effect→measure join through a shared Identifier).
- Owner patterns: `biotech-knowledge-services-A5/schema/program/packets/D5/03-retrieval-patterns.md` (A5 head 53b6a9f plus the owner's uncommitted close-out edits).
  - The owner fixed both packet bugs: CQ-RC-06 now uses `ReportItem -BLOCKED_BY-> UseConstraint`, and Q-D5-13 now reads `ia.validObservedAt`.
  - The owner left `PROTOCOL_AUTHORED_BY` in Q-D5-13 and Q-D5-17 and the shared-Identifier join in Q-D5-20. These are in packet SDL, so the final-SDL versions are written here.
  - Re-read in this session: sections Q-D5-13 (line 479), Q-D5-17 (line 621) and Q-D5-20 (line 687).
- Rulings:
  - R-80 (decision-report line 1274): D5 renames PROTOCOL_AUTHORED_BY. `predicates.yaml` line 834 marks it `alias-of:AUTHORED_BY`.
  - R-94 / R-52: `questions-catalog.md` line 1187 marks Q-D5-17 "CUT R-94, R-52", with the predicate route OFFERS_INTERVENTION left.
  - R-42 (decision-report line 605, OQ-D5-45).
  - R-70 (decision-report line 1125: "Q-D5-20 (v3) uses the same join").
- Registry checks:
  - `OFFERS_INTERVENTION` and the `OFFER_PRICE_{BUNDLE, COUPON_ADJUSTED, LIST, ONE_TIME, PER_UNIT, SUBSCRIPTION}` predicates are registered (predicates.yaml lines 9883 and 9967–10173).
  - `PriceObservation` appears only in an SDL comment (line 4142, "What is NOT here, on purpose"). It is not a type.

## Output

`final/patterns-by-question/D5.md` has a header with counts and 3 sections:

- **Q-D5-13 (R-80).** Uses `AUTHORED_BY` with subject Protocol or the current ProtocolEdition, and object `Person|Organization`. Reads the episode as-of. TRACE of the interest Assertion is inlined.
- **Q-D5-17 (R-80, R-94/R-52).** Answered by the predicate route `OFFERS_INTERVENTION` (subject `Offer|Organization|Product`). The offerer is the Offer's open SELLER_OF_RECORD seller. Monitoring is read through `AUTHORED_BY`. The price is read from `OFFER_PRICE_*` Assertions on the Offer (`valueNumber`, `unitCode`, `validObservedAt`). TRACE(o) is inlined.
  - Not answered: a price for an offer asserted on an Organization or a Product with no Offer. Those rows return `prices = []`.
- **Q-D5-20 (R-42, R-70).** The shared-Identifier join is replaced by the typed member `Target -OPERATIONALIZED_BY-> Condition` (open episode). The causality framing comes from CAUTIONS Assertions on the same snapshot, and TRACE(ae) is inlined.
  - Narrowed: an effect that relates to the target only through an Outcome, Metric or Biomarker returns no row (OQ-D5-45, closed by R-42 / R-70). The question is not lost.

Counts: 3 questions rewritten (2 rulingBroken plus 1 alsoRulingBroken), 3/3 EXPLAIN ok, 0 GDS, 0 lost.

## Validator

`final/_work/validate-by-question.mjs` already existed (shared). I reused it unchanged.

```
cd C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S
docker ps --filter name=bks-neo4j-synth   # Up 5 hours
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D5 --fill
# D5: {"questions":3,"ok":3,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":3,"statementsExplainOk":3,"staticFindings":0}
#   Q-D5-13: ok   Q-D5-17: ok   Q-D5-20: ok          exit 0; report final/_work/by-question/D5.json

# negative control: a scratchpad copy with PROTOCOL_AUTHORED_BY, (pr:PriceObservation) and the shared-Identifier join restored
node .../validate-by-question.mjs --files <scratchpad>/negD5/D5.md --out <scratchpad>/negD5/out
#   Q-D5-13 failing: predicate 'PROTOCOL_AUTHORED_BY' has status alias-of:AUTHORED_BY
#   Q-D5-17 failing: :PriceObservation is not a node type or interface of the final SDL
#   Q-D5-20 failing: identifierJoin: 2 holders joined through one Identifier (id); R-42
#   exit 1
```

Neo4j: bks-neo4j-synth 5.26.31 Community, bolt://localhost:7691. Run without `--ddl`, so the indexes were left untouched.

## Open points (not SDL; open-questions.md not edited)

- The fixtures do not write `OFFERS_INTERVENTION`, `OFFER_PRICE_*` on an offered intervention, or a curated `Target -OPERATIONALIZED_BY-> Condition` for an adverse-effect pair. As a result, Q-D5-17 and Q-D5-20 return no rows on the current fixtures.
  - The R-70 / R-06 fixture request (ASPREE hemorrhage or dementia → a target) is still open with D5.
- Q-D5-17 has no price for offers asserted on an Organization or a Product without an Offer node. That is a D6 modeling choice, not a schema defect.
