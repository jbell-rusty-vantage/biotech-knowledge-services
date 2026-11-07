# Close-out: final-SDL pattern writer (S) — D6

2026-10-09. Worktree C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S (ft/schema-S). Writes: `final/patterns-by-question/D6.md`, `final/_work/by-question/D6.json` (validator report), this log. No SDL change, no commit.

Inputs:
- `final/_work/pattern-lint.json` perPacket D6: total 41, ok 29, fragment 4, packetBugs 3, rulingBroken 5, alsoRulingBroken 1, failing 8. RulingBroken blocks: CQ-PF-01 (L153), CQ-AX-25 (L173), Q-D6-08 (L466), Q-D6-10 (L505), Q-D6-11 (L524); alsoRulingBroken: Q-D6-01 (L61, packetBug L67 + R-30).
- Owner copy `biotech-knowledge-services-A6/schema/program/packets/D6/03-retrieval-patterns.md` after the A6 close-out (`_runlog/closeout-A6-D6.md`: packetBugs fixed; owner re-lint 0 packetBug, 6 rulingBroken = the six above).
- Rulings: R-30 (ComponentLineProperties `declaredNameVerbatim`, `formVerbatim`, `statementVerbatim` → line Assertion qualifiers `declaredName:` / `form:` / `statement:` and locator exact), R-62 (PREPARED_WITH retired → D12 HAS_RECIPE_INGREDIENT, subject FoodItem | Product, object FoodItem; `predicates.yaml` status alias-of).
- Final SDL checks done by hand: ComponentLineProperties fields (SDL line 4173); `Assertion.qualifiers: [String!]`; HAS_SUBJECT admits Product, ProductVariant, Package, FoodItem, LabelVersion; HAS_REFERENCE_FOOD Product → FoodItem; DECLARES_COMPONENT LabelVersion → Constituent | FoodItem | IngredientMaterial.

Commands:
- `docker ps --filter name=bks-neo4j-synth` → Up.
- `node C:/…/final/_work/validate-by-question.mjs --packets D6` (shared validator, reused unchanged)
  → D6: questions 6, ok 6, failing 0, statements 7, EXPLAIN ok 7, static findings 0; CQ-AX-25 planned a CartesianProduct (packet shape: unanchored DECLARES_COMPONENT scan joined to C).
- CQ-AX-25 rewritten as a scoped UNION anchored on C (`CALL (sub) { … UNION … UNION … }`), then
  `node C:/…/final/_work/validate-by-question.mjs --packets D6 --fill`
  → D6: {"questions":6,"ok":6,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":7,"statementsExplainOk":7,"staticFindings":0}; Neo4j 5.26.31 community; IR digest sha256:c7cf1235…4793; no AllNodesScan / CartesianProduct; Q-D6-08 DirectedRelationshipTypeScan (served by the planned DECLARES_COMPONENT(lineRole) relationship index).

Result: 6 questions rewritten (Q-D6-01, CQ-PF-01, CQ-AX-25, Q-D6-08, Q-D6-10, Q-D6-11), 7 statements EXPLAIN ok, 0 gds-unvalidated, 0 lost; Q-D6-11 preparation notes reanswered through HAS_RECIPE_INGREDIENT (R-62).

Issues for the coordinator (not edited here; FU-03 fixture work):
- D6 fixtures still write the R-30 edge fields on DECLARES_COMPONENT (already in `fixtures/README.md` residual table). The rewritten patterns return the located span beside the qualifier so pre-edit data still answers.
- `fixtures/D6/prepared-food-bigmac-mcdonalds` d03 was renamed PREPARED_WITH → HAS_RECIPE_INGREDIENT but keeps the LabelVersion as subject and the text in `valueString`; the registry admits Product | FoodItem subjects. This structural edit is not in the README residual table (only the rename is listed). Until it is applied, Q-D6-11 does not find d03.
- No qualifier-prefix registry in `final/vocabularies/` for `declaredName:` / `form:` / `statement:` (R-30 names them; K 11-OQ 22 "verbatim-base prefix" check is S's).
