# Module D10 — module editor run log (S team, 2026-10-08/09)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-01, R-03, R-06, R-11, R-15, R-17, R-24, R-26, R-28, R-31–R-35, R-45–R-53, R-60, R-68, R-72, R-75, R-83, R-91, R-94 read in full); `final/_work/rulings.yaml` (`global`, `modules.D10`); `final/schema/kernel.graphql`; `final/_runlog/module-K.md` ("Kernel changes in synthesis").
- `packets/D10/` 04, 05, 06, 10, 03 (pattern lines for predicate reads), 11; `review-open-issues.json` D10 block; `inventory-final.md`.

```
$ sha256sum packets/D10/04-schema-proposal.graphql packets/D10/05-relationship-register.yaml packets/D10/06-node-register.yaml packets/D10/10-seams.yaml final/schema/kernel.graphql
9b67b502733a88ef465977b3d7bdea5743f022dd16372a9538166df940008e12  packets/D10/04-schema-proposal.graphql
771da5d819c2776da001573bff2e22c1022c9f6b1e748ae2209d891d7f98df1f  packets/D10/05-relationship-register.yaml
3ea63fd63e738b1f021ef20806144599ea5c15d1f648e6e65da8f813fca3913c  packets/D10/06-node-register.yaml
a8f2c0bc7e136f50b4ae6019ab666d6ac594bfb1b7cdd8dd005c9f699cf04a55  packets/D10/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
$ git rev-parse --short HEAD   -> e484fd2
```

## Checks before editing

```
$ grep -n 'DERIVED_FROM\|ASSESSES' final/schema/kernel.graphql      # kernel declares both with no properties -> D10 fields match (R-53)
$ for e in CriterionKind CriterionDirection ReportItemKind ReportSectionKind OptionDisposition AssociationKind DecisionCriterion ReportItem Association; do grep -l "^(enum|type) $e" packets/*/04* final/schema/kernel.graphql; done
  -> each declared only in packets/D10 (R-56: no enum/type collision)
$ for p in <11 D10 predicateOnly names>; do grep -l "type: \"$p\"" packets/*/04*; grep -l "predicate: $p" packets/*/05*; done
  -> 0 relationship types with those names (R-53); each registered only by D10
$ for p in FORM_OF PREPARATION_OF CONTAINS_INGREDIENT USE_CONSTRAINED_IN HAS_UPPER_LIMIT MANUFACTURES RECOMMENDS_USE RECOMMENDS_AGAINST WORSENS_TARGET NO_EFFECT_ON_TARGET IMPROVES_TARGET INTENDED_FOR_TARGET DECLARES_AMOUNT RATES_CLAIM; do grep -l "predicate: $p" packets/*/05*; done
  USE_CONSTRAINED_IN: D5 | HAS_UPPER_LIMIT: D5 | MANUFACTURES: D6 D7 D8 | RECOMMENDS_USE: D7 D9 | RECOMMENDS_AGAINST: D10
  WORSENS_TARGET / NO_EFFECT_ON_TARGET / IMPROVES_TARGET: D5 | INTENDED_FOR_TARGET: D1 D5 D6 D8 | RATES_CLAIM: D8 K
  FORM_OF, PREPARATION_OF, CONTAINS_INGREDIENT, DECLARES_AMOUNT: registered nowhere (open issue, see below)
$ awk (heading of 03 lines 265, 322, 420, 424, 445, 453, 518, 830)
  -> Q-D10-01, Q-D10-03, Q-D10-07, Q-D10-07, Q-D10-08, Q-D10-08, Q-D10-11, Q-D10-25
$ grep -l "^type <T> " packets/*/04*   # every seam target type exists: ChemicalSubstance, IngredientMaterial (D1); Product (D6);
  Intervention, ProtocolStep, Target, UseConstraint (D5); FoodItem (D12); Device, LabTest, Biomarker (D4); Outcome, Mechanism,
  Condition, MolecularEntity (D2); Organization, Person (D7); RegulatoryRecord (D8); Event, Frontier (D13); Study (D3)
$ grep -n 'type: "CONCERNS"\|type: "ADDRESSED_TO"\|type: "ON_FRONTIER"\|type: "OCCURRENCE_OF"' packets/*/04* final/schema/kernel.graphql
  -> CONCERNS, ADDRESSED_TO in D8 (RegulatoryRecord.concerns / addressedTo); ON_FRONTIER in D13; OCCURRENCE_OF in the final kernel
$ grep -l USE_CONSTRAINED_IN / HAS_UPPER_LIMIT packets/D10/07-fixtures/*/*
  -> livertox-green-tea-extract-harm / mg-rankings-criteria-comparison; no D10 fixture uses RECOMMENDS_FOR or RECOMMENDS_AGAINST
```

## Commands and edits

```
$ cp packets/D10/04-schema-proposal.graphql final/schema/D10.graphql
```

SDL edits (Edit tool; banner `# ---- fragment D10 ----` kept on line 1):

| ruling | SDL edit |
| --- | --- |
| R-17, R-48 | `Association @node(labels: ["Association"])` (was `["Association", "Entity"]`) |
| R-48, R-28 | ASSOCIATES field docstring: no score on the edge, score on the node only, superseded uncited Associations removable, registered Subjectable exception |
| R-48, R-49, R-51, R-47 | Association type docstring: lifecycle; discourse metrics and rule-based classifications are not Associations; AFFECTS_MECHANISM unscored, Q-D2-18 on Associations |
| R-46, R-45 | DecisionCriterion type docstring and `publisherUid` docstring: cache only; authority = authorizing Assertion ASSERTED_BY / WAS_GENERATED_BY |
| R-24 | `validFrom` docstring: BellLabs policy validity, not world valid time |
| R-60 | `targetKeys` docstring: targets@0.2.2; acknowledged exception OQ-D5-47 |
| (header) | synthesis line listing the rulings |

No type, field, enum value, directive, edge-property type or nestedOperations changed (R-03 check: HAS_ITEM, USES_CRITERION, ASSESSES, DERIVED_FROM, BLOCKED_BY reach kernel or other-module records -> [CONNECT]; ASSOCIATES derived -> []).

```
$ diff packets/D10/04-schema-proposal.graphql final/schema/D10.graphql            # docstrings, header and the one label line only
$ diff <(grep -v '^\s*#\|"' packets/D10/04…) <(grep -v '^\s*#\|"' final/schema/D10.graphql)   # only docstring continuation lines differ
```

Registers written by hand from 05, 06 and 10 (Write tool), every contract field kept, `module: D10` added, `fixture` / `exercisedIn` rewritten to `final/fixtures/D10/<folder>`:
- `D10.relationship.yaml`: 6 relationships (rationales cite R-11, R-53, R-26, R-75, R-48, R-28, R-47, R-33); `kernelMeaning` on ASSESSES and DERIVED_FROM; predicateOnly 11 entries with `registrar: D10` (R-52); RECOMMENDS_FOR and RECOMMENDS_AGAINST moved to a new `mergedInto` list (registrar D9, R-83); deferred 16 (AFFECTS_MECHANISM row rewritten per R-47; DISCOURSE_METRIC per R-49 and COMPUTED_FOOD_CATEGORY per R-51 added).
- `D10.node.yaml`: 3 nodes; `labels` per node (R-17); `mutations` as `{ graphql: none, executor: … }` (R-03); publisherUid cache (R-46); deferred 9, mergedInto 9.
- `D10.seams.yaml`: 14 relationship seams (13 accepted, 1 cut: ASSOCIATES -> D12.FoodItem, R-94); "CONCERNS / ADDRESSED_TO" split into two rows (R-94); 9 predicateSeams (R-83, R-52, R-68); vocabulary pins targets@0.2.2, frontiers@0.2.1 under final/vocabularies/ (R-60).

```
$ python - (yaml.safe_load + contract-field and SDL cross-check)
rel {'version': 1, 'module': 'D10', 'relationships': 6, 'predicateOnly': 11, 'mergedInto': 2, 'deferred': 16}
node {'version': 1, 'module': 'D10', 'nodes': 3, 'deferred': 9, 'mergedInto': 9}
seam {'version': 1, 'module': 'D10', 'seams': 14, 'predicateSeams': 9, 'sharedVocabularies': 9}
rel missing [] | node missing [] | seam missing []
SDL rel types == register types: True (ASSESSES, ASSOCIATES, BLOCKED_BY, DERIVED_FROM, HAS_ITEM, USES_CRITERION)
SDL nodes ['DecisionCriterion', 'ReportItem', 'Association'] == register
relationship fields 9 | predicateOnly & relTypes: set() | @fulltext 0 | @vector 0
labels ['["DecisionCriterion", "Entity"]', '["ReportItem", "InformationArtifact"]', '["Association"]']
```

## Compile check

Scratch (`…/scratchpad/synth/module-D10/`): `stubs.graphql` = one stub `type UseConstraint implements Entity & Subjectable` with the 7 Entity fields (the only seam target a D10 field names outside the kernel). Assembled by `cat`: `k-stub.graphql` = kernel + stub; `k-stub-d10.graphql` = kernel + stub + D10.

```
$ BKS_SCHEMA_PATH=C:/…/final/schema/kernel.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema C:/…/synth/module-D10/kernel.printed.graphql
wrote …\kernel.printed.graphql (326571 chars) in 3s            wall 44 s (first run, cold tsx)
$ BKS_SCHEMA_PATH=C:/…/synth/module-D10/k-stub.graphql … print-schema C:/…/synth/module-D10/k-stub.printed.graphql
wrote …\k-stub.printed.graphql (331796 chars) in 2s            wall 20 s
$ BKS_SCHEMA_PATH=C:/…/synth/module-D10/k-stub-d10.graphql … print-schema C:/…/synth/module-D10/k-stub-d10.printed.graphql
wrote …\k-stub-d10.printed.graphql (430289 chars) in 2s        wall 12 s
$ wc -c / wc -l / grep -c '^input ' / '^enum ' / '^type '
kernel:      bytes 326595 lines 6498 inputs 179 enums 35 types 105
k-stub:      bytes 331820 lines 6586 inputs 181 enums 35 types 108
k-stub-d10:  bytes 430321 lines 8400 inputs 223 enums 41 types 136
$ grep -c "R-46\|R-48\|targets@0.2.2" k-stub-d10.printed.graphql   -> 5     (final D10 docstrings are in the output)
$ grep -c "^type DecisionCriterion \|^type ReportItem \|^type Association " k-stub-d10.printed.graphql -> 3
```

Source confirmation: outputs are 0.3–0.4 MB (not the ~55 MB pinned fallback); the kernel output equals the kernel editor's measurement (326,595 B, 179 inputs); the D10 output contains text that exists only in `final/schema/D10.graphql`. No compile errors.

| measure | kernel alone | kernel + stub | kernel + stub + D10 | D10 marginal (over kernel + stub) |
| --- | ---: | ---: | ---: | ---: |
| printed bytes | 326,595 | 331,820 | 430,321 | +98,501 |
| printed lines | 6,498 | 6,586 | 8,400 | +1,814 |
| input types | 179 | 181 | 223 | +42 |
| enums | 35 | 35 | 41 | +6 |
| object types | 105 | 108 | 136 | +28 |
| build ("in Ns") | 3 s | 2 s | 2 s | — |

Over the kernel alone (stub included): +103,726 B, +44 inputs. The packet's own measurement against the earlier kernel was +96,999 B, +42 inputs (packets/D10/11 #39); the +1,502 B difference over kernel + stub comes from the synthesis docstrings and the kernel version, inputs unchanged.

```
$ node packages/schema-workspace/dist/cli.js map --sdl C:/…/synth/module-D10/k-stub.graphql --out …/k-stub-map.md
  node types 12 | relationship fields 32 | distinct relationship types 13 | pairs after expansion 55
$ node packages/schema-workspace/dist/cli.js map --sdl C:/…/synth/module-D10/k-stub-d10.graphql --out …/k-stub-d10-map.md
  node types 15 | relationship fields 41 | distinct relationship types 17 | pairs after expansion 82   (Subjectable 5 implementers)
  D10 rows: ASSESSES 21 (8 fields, D10+K), DERIVED_FROM 8 (8 fields, D10+K), ASSOCIATES 5, BLOCKED_BY 2, HAS_ITEM 1, USES_CRITERION 1
```

D10 module counts: 3 node types; 6 relationship types declared, 4 new to the assembled schema (ASSESSES and DERIVED_FROM counted once in K, R-01/R-53); 9 relationship fields = 9 from→to pairs collapsed (R-01: HAS_ITEM 1, USES_CRITERION 1, ASSESSES 1, DERIVED_FROM 3, BLOCKED_BY 2, ASSOCIATES 1); 0 unions. Expanded marginal on this stub assembly: +27 (55 -> 82), of which the Subjectable targets grow with every implementer added later.

Cypher spot check on the disposable Neo4j (bks-neo4j-synth, 5.26):

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p … "EXPLAIN MATCH (row:ReportItem {itemKind:'ROW', disposition:'BLOCKED'})-[:BLOCKED_BY]->(uc:UseConstraint)<-[:RESOLVES_TO_CONSTRAINT]-(a:Assertion)-[:HAS_EVIDENCE]->(loc:SourceLocator) RETURN …"
  Planner: "COST"  Runtime: "SLOTTED"        (BLOCKED_BY rationale trace parses)
$ docker exec bks-neo4j-synth cypher-shell … "EXPLAIN MATCH (as:Association {associationKind:'EVIDENCE_AGGREGATE'})-[:ASSOCIATES]->(m) WHERE as.recordedTo IS NULL OPTIONAL MATCH (as)-[:DERIVED_FROM]->(i:Assertion) RETURN …"
  Planner: "COST"  Runtime: "SLOTTED"        (Association read without the Entity label parses)
```

```
$ sha256sum final/schema/D10.graphql final/_work/registers/D10.*.yaml
356dbffe86c067f2121af2e3d19bcc24a78debc291ffacfacac2c916a841b08e  final/schema/D10.graphql      (308 lines, 19,249 bytes)
321d51b3343e649fbdb1c0a77c79002affadb3546323c27807f7b239c45bb469  final/_work/registers/D10.node.yaml
3df0639293b36bd73c4b063cb39651c5c31575f39719937bb3b47426797769a9  final/_work/registers/D10.relationship.yaml
04a74d6e4b10e7449b889e3869ac94e4553c6a9798c9e6d5c094e710056a6ed6  final/_work/registers/D10.seams.yaml
```

## Open items (not in this editor's file set)

- D10 rulings that edit packet text outside the SDL and registers were not applied here: R-83 rewrite of the Q-D10-08 / Q-D10-03 guideline branches (03 line 453 still reads `RECOMMENDS_AGAINST` with a Target object), R-94 03 line ~744 (container from OCCURS_IN), R-50 answer-kind-table re-run, R-15 fixture asserters (first author -> D3 Publication), R-75 / R-20 close-oq in 11, R-47 / R-49 / R-51 text in 09.
- D10 patterns read four predicates no packet registers: FORM_OF, PREPARATION_OF, CONTAINS_INGREDIENT (Q-D10-07, Q-D10-11) and DECLARES_AMOUNT (criteria inputPredicates example). Under R-52 the executor rejects unregistered predicates; the registry builder must assign a registrar or the patterns must be renamed.
- `publisherUid` as a cache (R-46) has no `methodVersion` / `derivedAt` as R-45 condition 3 asks; no ruling adds the fields, so none were added.
- The fixture folders are referenced as `final/fixtures/D10/<folder>`; copying them there is the fixtures stage's job.
