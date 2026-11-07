# Module D12 — module editor run log (S team, 2026-10-08/09)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-01 to R-06, R-09, R-10, R-14, R-17, R-28, R-42 to R-46, R-50 to R-64, R-72, R-73, R-85, R-87, R-93, R-94 read); `final/_work/rulings.yaml` (`global`, `modules.D12`, and every other module's row naming a D12 type or a D12 seam target: D1, D3, D5, D6, D8, D10).
- `final/schema/kernel.graphql` (sha256 ec981e2a…), the kernel editor's notes (`_runlog/module-K.md`), `final/_work/registers/K.*.yaml` (format).
- `scratchpad/inv/review-open-issues.json` (D12 open list), `scratchpad/inv/inventory-final.md` (D12 rows).

```
$ git rev-parse --short HEAD; git branch --show-current
e484fd2
ft/schema-S
$ sha256sum packets/D12/04-schema-proposal.graphql packets/D12/05-relationship-register.yaml packets/D12/06-node-register.yaml packets/D12/10-seams.yaml final/schema/kernel.graphql
3c302e083c7867ae7b26fc76b4daabb332bccbccb1d664db21f52e1c677469d3  packets/D12/04-schema-proposal.graphql
35779635fc4b106cf9e090247d189d3add26d4c3e1c135e7c349bcb81548d4a5  packets/D12/05-relationship-register.yaml
034af8dfff49b092c1e902d28a8f1668615d005c9ed6a59ee5df397454858efa  packets/D12/06-node-register.yaml
285c0a45246244806a03c5df231202d5fcbe99bde229c3bca69cbad626f37f4a  packets/D12/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
```

## Rulings that touch D12, and what each changed

`modules.D12` in rulings.yaml has 11 rows. None changes a type, field, union, enum or relationship of the D12 SDL; the SDL edits are docstrings only.

| ruling | file | change |
| --- | --- | --- |
| R-63 | SDL, node reg, seams | DietaryPattern docstring: the only node for any eating pattern (TRE, fasting-mimicking included), administered by D3 as a DietaryPattern, admissible STEP_USES target; OQ-D12-03 closed |
| R-46 | SDL, node reg, rel reg (deferred DEFINED_BY) | definedBySourceUid = frozen identity key; the defined-by trace is the attach Assertion's HAS_EVIDENCE |
| R-62 | SDL (referencedByProducts), rel reg, node reg (deferred), seams | HAS_REFERENCE_FOOD licensed by a RESOLUTION Assessment when a resolver chose it; only link, never a merge; HAS_RECIPE_INGREDIENT subject FoodItem \| D6.Product, alias PREPARED_WITH |
| R-57 | SDL (FoodContentProperties docstring), rel reg qualifierGrammar | `comparator:` values are D1 QuantityComparator values (GTE/LTE, not GE/LE) |
| R-58 | SDL (amountBasis docstring), rel reg | AmountBasis is D6's single enum (D12 still writes PER_100G, PER_100ML, PER_SERVING) |
| R-52 | rel reg, seams | `registrar: D12` on the 11 D12 predicates; target predicates + CAUSES_ADVERSE_EFFECT moved to `removedRegistrations` (registrar D5) and to `predicateSeams` |
| R-85 | seams | FoodCategory admitted as subject of target predicates and INTERACTS_WITH; FoodItem/FoodCategory of CAUSES_ADVERSE_EFFECT (OQ-D12-28 closed) |
| R-53 | rel reg, seams | FOOD_FROM_TAXON alias DERIVED_FROM_TAXON; RESULT_FOR → QUALITY_RESULT_FOR |
| R-51 | rel reg (IN_FOOD_CATEGORY rationale, deferred COMPUTED_FOOD_CATEGORY) | CALCULATED Assertion authorizes IN_FOOD_CATEGORY; patterns return basisKind + derivationRule |
| R-64 | rel reg (FOOD_CONTAINS rationale, deferred QUANTITATIVELY_CONTAINS) | two types kept; canonical read `[:MATERIAL_CONTAINS\|FOOD_CONTAINS]` |
| R-03 | node reg | `mutations: { graphql: none, executor: "create; update; never delete" }` |
| R-42 | node reg | "(requested)" markers dropped on the seven D12 food schemes (K adds them) |
| R-72 | seams, rel reg (deferred ADMINISTERS_PATTERN) | AdministeredMaterial = IngredientMaterial \| ProductVariant \| Intervention \| FoodItem \| DietaryPattern; RegulatoryRecordTopic includes Product \| Lot |
| R-73 | seams | QUALITY_RESULT_FOR → D8.Lot accepted; → D6.Product **cut (contested, see Issues)**; MEASURED_CONTENT_IN_PRODUCT (D1) predicate seam added |
| R-87 | seams | DECLARES_COMPONENT: one Assertion per line (OQ-D12-32 closed) |
| R-93 | seams | HAS_ACTION_LEVEL / HAS_CLAIM_CONDITION (registrar D8) (OQ-D12-31 closed) |
| R-43, R-44 | seams | added RENDITION_OF Source → D3.Publication and REVISES Publication → Publication rows; HAS_REVISION_STATUS (registrar K) only for flags with no identified notice |
| R-94 | seams | `seams` / `predicateSeams` split; StepMeans note dropped (STEP_USES → K.Subjectable incl. DietaryPattern, FoodCategory); ASSOCIATES → FoodItem row recorded as cut |
| R-60 | seams | targets @0.2.2, frontiers @0.2.1, files under final/vocabularies/ |
| R-06 | rel reg (fixture comments) | every typed pair is fixtured: 8 of 8 (checked below) |

Not done here (other deliverables): R-44 fixture edit (PREDIMED → REVISES), R-93 / R-51 pattern edits (Q-D12-06, Q-D12-18, Q-D12-14), R-50 question kind (Q-D12-08), OQ closures in 11-open-questions.

## Commands

```
$ cp packets/D12/04-schema-proposal.graphql final/schema/D12.graphql      # banner '# ---- fragment D12 ----' kept on line 1
  (docstring edits with the Edit tool, table above)
$ grep -n "OQ-D12\|RESULT_FOR\|StepMeans\|DERIVED_FROM_TAXON\|PREPARED_WITH\|Mention\|StateEpisode\|@fulltext\|@vector" final/schema/D12.graphql
189: ... FOOD_FROM_TAXON (predicate-only; renamed from DERIVED_FROM_TAXON, which is a D1 edge type)   # history note, kept
266: ... (R-63; OQ-D12-03 closed) ...
```

Name checks (R-53, R-56):

```
$ grep -ho 'type: "[A-Z_]*"' packets/*/04-schema-proposal.graphql final/schema/*.graphql | sort -u   -> 106 relationship type names
  none of the 11 D12 predicateOnly names is a relationship type name                                  -> "checked" (0 collisions)
$ grep -l FOOD_CONTAINS|IN_FOOD_CATEGORY|HAS_REFERENCE_FOOD|PATTERN_COMPONENT packets/*/04 final/schema/*  -> D12 only
$ for each of the 12 D12 type/enum/union names: grep -lE "^(type|enum|union|interface) <name>\b"     -> D12 only (packet + final)
```

Fixture coverage of typed pairs (R-06), from `packets/D12/07-fixtures/*/assertions.yaml` subject/object types:

| pair | fixture assertion |
| --- | --- |
| FoodItem -FOOD_CONTAINS-> D1.Constituent | mcd-02, mcd-03, mcd-04 |
| FoodItem -FOOD_CONTAINS-> D1.ChemicalSubstance | olive-01, olive-02 |
| FoodItem -IN_FOOD_CATEGORY-> FoodCategory | mcd-06 |
| D6.Product -IN_FOOD_CATEGORY-> FoodCategory | mcd-08, acr-02 |
| D6.Product -HAS_REFERENCE_FOOD-> FoodItem | mcd-01 |
| DietaryPattern -PATTERN_COMPONENT-> FoodItem | pred-01, pred-02 |
| DietaryPattern -PATTERN_COMPONENT-> D1.Constituent | pred-03 |
| DietaryPattern -PATTERN_COMPONENT-> FoodCategory | upf-03, upf-04 |

Registers (Python string-replace scripts in `scratchpad/synth/module-D12/build_rel.py` and `build_node.py`; each replace asserted to match exactly once; seams written by hand):

```
$ python build_rel.py  final/_work/registers/D12.relationship.yaml   -> ok 25014
$ python build_node.py final/_work/registers/D12.node.yaml           -> ok 9581
$ python -c "yaml.safe_load(...)"
D12.relationship.yaml {'version': 1, 'module': 'D12', 'relationships': 4, 'predicateOnly': 11, 'removedRegistrations': 6, 'deferred': 12}
  contract fields missing per relationship: FOOD_CONTAINS [], IN_FOOD_CATEGORY [], HAS_REFERENCE_FOOD [], PATTERN_COMPONENT []
  every predicateOnly entry has registrar: True
D12.node.yaml {'version': 1, 'module': 'D12', 'nodes': 3, 'deferred': 8, 'mergedInto': 6}
  contract fields missing per node: FoodItem [], FoodCategory [], DietaryPattern []
D12.seams.yaml {'seams': 21, 'predicateSeams': 13, 'sharedVocabularies': 9}
  seams accepted 19, cut 2 (QUALITY_RESULT_FOR -> D6.Product R-73 contested; ASSOCIATES -> FoodItem R-94); predicateSeams accepted 13
```

## Compile check

Scratch stubs only (`scratchpad/synth/module-D12/stubs-D12.graphql`, 65 lines): D1 ChemicalSubstance, D1 Constituent, D6 Product (7 Entity fields, Entity & Subjectable, no relationships), enums D1 ContentStatementKind (packet D1 values) and D6 AmountBasis (16 values, R-58).

```
$ cat final/schema/kernel.graphql stubs-D12.graphql                  > K+stubs.graphql       # 57,595 B
$ cat final/schema/kernel.graphql stubs-D12.graphql final/schema/D12.graphql > K+stubs+D12.graphql  # 75,933 B
$ BKS_SCHEMA_PATH=C:/.../synth/module-D12/<name>.graphql NODE_OPTIONS=--max-old-space-size=8192 \
    pnpm --filter @bks/graphql-api print-schema C:/.../synth/module-D12/<name>.printed.graphql
kernel        : wrote ... (326571 chars) in 2s   wall 12 s
K+stubs       : wrote ... (341900 chars) in 3s   wall 60 s
K+stubs+D12   : wrote ... (424366 chars) in 1s   wall 63 s   (final; first run 2s / 19 s)
K+stubs+D12packet (packet SDL, for comparison): wrote ... (423860 chars) in 2s
```

The wall times include pnpm/tsx start-up while other S agents run print-schema in parallel; the build itself reports 1–3 s. The output is 0.4 MB, not the ~55 MB pinned fallback, and contains the string "R-63; OQ-D12-03 closed", which exists only in `final/schema/D12.graphql`.

```
$ wc -c / wc -l / grep -c '^input ' / '^enum ' / '^type ' / '^union ' / '^type Mutation'
kernel             326,595 B  6,498 lines  179 inputs  35 enums  105 types  0 unions  0 Mutation
K+stubs            341,924 B  6,753 lines  185 inputs  35 enums  114 types  0 unions  0 Mutation
K+stubs+D12        424,398 B  8,332 lines  231 inputs  43 enums  136 types  2 unions  0 Mutation
K+stubs+D12packet  423,892 B  8,329 lines  231 inputs  43 enums  136 types
$ node scripts/schema-size.mjs .../K+stubs+D12.printed.graphql
printed size 0.4 MB | printed lines 8,333 | input types 231 | object types 136 | enums 43 | Query fields 40 | Mutation fields 0
(its "SDL node types 192 / pairs 3940" rows describe the pinned default SDL, not this file)
```

(The two stub enums do not print in K+stubs because nothing references them there; that is why K+stubs shows 35 enums.)

| measure | kernel alone | K + stubs | K + stubs + D12 | D12 marginal over K + stubs | over kernel alone |
| --- | ---: | ---: | ---: | ---: | ---: |
| printed bytes | 326,595 | 341,924 | 424,398 | +82,474 | +97,803 |
| printed lines | 6,498 | 6,753 | 8,332 | +1,579 | +1,834 |
| input types | 179 | 185 | 231 | +46 | +52 |
| enums | 35 | 35 | 43 | +8 | +8 |
| object types | 105 | 114 | 136 | +22 | +31 |

Final vs packet D12 (same kernel + stubs): +506 printed bytes, +3 lines, 0 inputs (docstrings only). The FoodContentProperties docstring edit (R-57) does not print.

Schema map (pairs):

```
$ node packages/schema-workspace/dist/cli.js map --sdl .../K+stubs.graphql     --out .../K+stubs-map.md
node types 14 | relationship fields 32 | distinct relationship types 13 | pairs after expansion 71
$ node packages/schema-workspace/dist/cli.js map --sdl .../K+stubs+D12.graphql --out .../K+stubs+D12-map.md
node types 17 | relationship fields 37 | distinct relationship types 17 | pairs after expansion 103
D12 rows: PATTERN_COMPONENT 3 (PatternComponentTarget ∪3) | FOOD_CONTAINS 2 (FoodComponentTarget ∪2) | IN_FOOD_CATEGORY 2 | HAS_REFERENCE_FOOD 1
```

D12 own: 3 node types, 4 relationship types, 5 relationship fields, 8 from→to pairs (collapsed = expanded; no interface target), widest union 3. The other +24 expanded pairs are kernel edges to Subjectable/Entity gaining 3 implementers (counted in K under R-01 collapsed).

Cypher validation on the disposable Neo4j (container bks-neo4j-synth):

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p *** "EXPLAIN MATCH (f:FoodItem)-[r:MATERIAL_CONTAINS|FOOD_CONTAINS]->(c) WHERE r.recordedTo IS NULL AND r.amountBasis = 'PER_100G' AND r.quantity >= 0.5 MATCH (a:Assertion {uid: r.assertionUid}) OPTIONAL MATCH (p:Product)-[h:HAS_REFERENCE_FOOD]->(f) RETURN ..."
Plan: "EXPLAIN" | Statement: "READ_ONLY" | Planner: "COST"   (exit 0)
```

Digests of the outputs:

```
f7c6b4107e27f4db9f787db9de971e344522da674b6f1631e7c6132483fec4c0  final/schema/D12.graphql (309 lines, 18,338 B)
bf4e027d8ef1ad4c89e3d648983fd03038ce5707e201ea8cbc99294ce4710c77  final/_work/registers/D12.node.yaml
7c6e6b6394631a8298cd62c31488da33ebeb380333ff384cc633f1d8a8f4edea  final/_work/registers/D12.relationship.yaml
698d74005d7538db14670e9af377482e661b591e40827d5bfdcfd3c52c9489af  final/_work/registers/D12.seams.yaml
```

## Issues for the chief synthesizer

1. **R-73 conflicts with a D12 fixture.** R-73 cuts QUALITY_RESULT_FOR → D6.Product on the premise that no fixture writes it, citing D8 fixtures only. D12 `acrylamide-fried-potato-harm` acr-03 writes QualityResult → Product (FDA 2004 survey, 428 ug/kg, "one individual purchased product; no lot") for Q-D12-03 and Q-D12-06, both value 1. The seam row is marked "cut (R-73) — contested". Either re-key acr-03 to the D1 predicate MEASURED_CONTENT_IN_PRODUCT (R-73's fallback), or keep the Product member under R-06 and R-73's own clause "until a survey fixture promotes the Product member".
2. **Qualifier key `comparator` has two meanings.** The 05 grammar defines it as a comparison operator, but the predimed and upf fixtures write `comparator:hu:...` (a comparator-arm uid) on target-effect Assertions. Fixture or grammar editors should rename one of them (e.g. `comparatorArm:`).
3. USED_FOOD_CLASSIFICATION / USED_COMPOSITION_DATABASE keep registrar D12 (no ruling moves them), but R-52 rule 3 (owner of the subject type, D3.Study) would name D3 (OQ-D12-27).
