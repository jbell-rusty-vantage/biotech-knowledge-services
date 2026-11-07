# Module D1 — module editor run log (S team, 2026-10-08/09)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-03, R-06, R-07, R-10, R-14, R-27, R-28, R-30, R-42, R-47, R-50, R-52 to R-58, R-64, R-68, R-72, R-73, R-84 to R-94 read for D1); `final/_work/rulings.yaml` (`global`, `modules.D1`, and the rows of D2, D3, D5, D6, D8, D12, D13 that name a D1 type or a D1 seam); `final/schema/kernel.graphql`; `final/_runlog/module-K.md` "Kernel changes in synthesis"; `packets/D1/` 04, 05, 06, 10, 09, 11; `scratchpad/inv/review-open-issues.json` (D1).

```
$ sha256sum packets/D1/04-schema-proposal.graphql packets/D1/05-relationship-register.yaml packets/D1/06-node-register.yaml packets/D1/10-seams.yaml final/schema/kernel.graphql final/_work/rulings.yaml
1c677704dddce7c0fab179dc1645573b8c56e715a3ae0c42702677476c678e0d  packets/D1/04-schema-proposal.graphql
32ff110c0afa6c8f061eb8b341d6f4e69a881ceb3794304f688b5cfa74f52911  packets/D1/05-relationship-register.yaml
05a604428b6f0e2343279e627de336a3fa14d3a7a51b6cc71e8c4c1d871ec8c8  packets/D1/06-node-register.yaml
2ae098bb26ec1e5d16964efdb90f2628be2f3462423d6d2bdcace9920e7e6612  packets/D1/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
19dba4c3c822d3cbee75f232a015ca4ca6719eb4e8b3dc508ecb1f218123ac81  final/_work/rulings.yaml
$ cp packets/D1/04-schema-proposal.graphql final/schema/D1.graphql
```

## SDL edits (`final/schema/D1.graphql`, banner `# ---- fragment D1 ----` kept on line 1)

| ruling | edit |
| --- | --- |
| R-57 | `QuantityComparator` + OUTSIDE_REFERENCE_RANGE, ABSENT, CONFORMS_TO_DESCRIPTION, REFERENCE_ONLY, UNKNOWN (appended after the seven existing values, so existing values keep their order); docstring names the consumers D5, D8, D12 and the D8 mapping |
| — | header comment: synthesis line (rulings applied; registers carry the predicate and seam rulings; DERIVED_FROM_TAXON stays D1's typed edge, R-53) |

Nothing else changed in the SDL. Checked against the global rules: no `@fulltext`/`@vector` (R-04); `@filterable(byAggregate:false)` and `@mutation(operations: [])` on every type and relationship (R-02); every D1 edge is asserted with `[CONNECT]` (R-03); no StateEpisodeProperties (R-10); D1 declares no relationship to a type outside D1 (no union, no Subjectable target, R-05/R-28); MassBasis and ContentStatementKind declared once, here (R-56). The retired enum names appear nowhere in the SDL (docstrings say "retired D5 threshold / D8 spec enum").

## Registers (`final/_work/registers/D1.{node,relationship,seams}.yaml`)

Written by hand from 06, 05 and 10; every entry keeps the contract fields and adds `module: D1`; fixtures point at `final/fixtures/D1/<folder>`.

- **relationship:** 6 types unchanged. predicateOnly: + PHYSICAL_FORM, MATERIAL_GRADE, PLANT_PART, EXTRACT_RATIO as FIELD predicates of the IngredientMaterial properties (R-14); + SOURCED_FROM_COUNTRY (R-52); + EXCEEDS_DOSE_THRESHOLD with `storage: report-only` (R-85); − SUPPLIES_MATERIAL, MANUFACTURES_MATERIAL (R-68, D7 registers SUPPLIES_MATERIAL / MANUFACTURES); − the five target predicates (R-52, D5 registers); MEASURED_CONTENT_IN_PRODUCT / CONTAINS_UNDECLARED_SUBSTANCE subject D6 Product | ProductVariant, surveys without a lot only (R-73). Every predicateOnly entry carries `registrar: D1`. MATERIAL_CONTAINS rationale now states the four ContentEdgeProperties qualifiers the SDL declares and the R-64 alignment with D12 (the packet 05 text still described the statementKind-only option). Deferred list + MANUFACTURES_MATERIAL, SUPPLIES_MATERIAL, target predicates.
- **node:** 4 types unchanged. `mutations` → `{ graphql: none, executor: [create, update] }` (R-03, from the packet mutationNote). whyNode text: R-73 (patents concern only ChemicalSubstance), R-14, R-85 (Constituent subject of HAS_UPPER_LIMIT), R-90 (Taxon = source organisms only).
- **seams:** relationship `seams` (21 rows; 19 accepted, 2 cut: AFFECTS_MECHANISM → D2.MolecularEntity, R-94; CONCERNS D8.Patent → D1.IngredientMaterial, R-73), `predicateSeams` (30 rows, all accepted, registrar per R-52; new rows SAMPLE_TESTED_POSITIVE_FOR R-73, HAS_APPROVED_INDICATION R-88, HAS_ACTION_LEVEL R-93, SOURCED_FROM_COUNTRY R-52), `facetSeams` (plantPart= on D5 SAFETY_SIGNAL, R-54), sharedVocabularies pointing at `final/vocabularies/` and `final/schema/kernel.graphql`, providedVocabularies (QuantityComparator consumers D5, D8, D12). Each row carries `status` and `ruling` (`none` = no ruling touches the row).

Cross-check (Python, yaml + regex):

```
node {'version': 1, 'module': 'D1', 'nodes': 4, 'deferred': 4, 'mergedInto': 12}
relationship {'version': 1, 'module': 'D1', 'relationships': 6, 'predicateOnly': 18, 'deferred': 18}
seams {'version': 1, 'module': 'D1', 'seams': 21, 'predicateSeams': 30, 'facetSeams': 1, 'sharedVocabularies': 6, 'providedVocabularies': 4}
rel types 6 True          # SDL relationship types == register entries
nodes 4 True              # SDL node types == node register
rel missing [] / node missing [] / seam missing [] / pseam missing []
predicateOnly & all relationship types (packets/*/04 + final/schema/*.graphql): set()
status counts {'accepted': 50, 'cut': 2}
D1-registrar predicateSeams not in predicateOnly: []
name collisions with kernel: set() ; with other final modules present (D2, D3, D5, D7, D12, D13): set()
```

## Compile check

D1 declares no edge to another module's type, so no seam stubs were needed: kernel + D1 only.

```
$ SYN=C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/module-D1
$ cp final/schema/kernel.graphql final/schema/D1.graphql $SYN/mods/
$ node scripts/assemble-schema.mjs --modules $SYN/mods --out $SYN/K+D1.graphql
{ "ok": true, "modules": 2, "types": 70 }
$ BKS_SCHEMA_PATH=$SYN/K+D1.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema $SYN/K+D1.printed.graphql
wrote ...\module-D1\K+D1.printed.graphql (425403 chars) in 1s          # wall 21 s incl. pnpm/tsx start-up
$ BKS_SCHEMA_PATH=$SYN/mods/kernel.graphql ... print-schema $SYN/kernel.printed.graphql
wrote ...\module-D1\kernel.printed.graphql (326571 chars) in 2s
$ # packet D1 SDL against the final kernel, for comparison
$ BKS_SCHEMA_PATH=$SYN/K+D1packet.graphql ... print-schema $SYN/K+D1packet.printed.graphql
wrote ...\module-D1\K+D1packet.printed.graphql (424864 chars) in 2s
```

Source confirmed: outputs are 0.3–0.4 MB (not the ~55 MB pinned fallback) and `K+D1.printed.graphql` contains `CONFORMS_TO_DESCRIPTION` (2 hits), a value that exists only in `final/schema/D1.graphql`. The print-schema log does not name the SDL path.

| measure | kernel alone | kernel + D1 (final) | marginal D1 | kernel + D1 (packet) |
| --- | ---: | ---: | ---: | ---: |
| SDL bytes / lines | 56,040 / 1,190 | 77,829 / 1,620 (assembled) | D1.graphql 21,114 / 417 | packet 04: 20,064 / 401 |
| printed bytes | 326,595 | 425,451 | **+98,856** | 424,910 |
| printed lines | 6,498 | 8,373 | +1,875 | 8,363 |
| input types | 179 | 230 | **+51** | 230 |
| enums | 35 | 48 | +13 | 48 |
| object types | 105 | 134 | +29 | — |

The final D1 costs +541 printed bytes and 0 inputs over the packet SDL on the same kernel (the 5 enum values and docstring). `wc` / `grep -c '^input '` / `grep -c '^enum '` / `grep -c '^type '` on each printed file.

```
$ node packages/schema-workspace/dist/cli.js map --sdl $SYN/mods/D1.graphql --out $SYN/D1-map.md
"schemaDigest": "sha256:eb0537ff69c0a19719440daeae0241ba77769ecf35460534402c628b4b587e0c"
node types 4 | relationship fields 7 | distinct relationship types 6 | from→to pairs 7 | edge property profiles 1 | unions 0 | enums 14
$ node packages/schema-workspace/dist/cli.js map --sdl $SYN/K+D1.graphql --out $SYN/K+D1-map.md
"schemaDigest": "sha256:a3d710e2296dbfe5a1b8db2f3006dcb0e91c5a2e87dd40ee10192b27ea16a431"
node types 15 | relationship fields 39 | distinct relationship types 19 | from→to pairs 86 (kernel alone 47: Subjectable grows from 3 to 7 implementers) | enums 46
$ node scripts/schema-size.mjs $SYN/K+D1.printed.graphql
printed size 0.4 MB | printed lines 8,374 | input types 230 | object types 134 | enums 48 | Query fields 34 | Mutation fields 0
(its "SDL node types 192 / pairs 3940" rows describe the pinned default SDL, not this file)
```

Cypher shape check of the Q-D1-11 filter on the disposable Neo4j (bks-neo4j-synth, 5.26):

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p *** "EXPLAIN MATCH (t:Taxon)<-[:PARENT_TAXON*0..3]-(s:Taxon)<-[:DERIVED_FROM_TAXON]-(m:IngredientMaterial)-[c:MATERIAL_CONTAINS]->(k:Constituent) WHERE t.uid = 'hu:taxon:x' AND c.recordedTo IS NULL AND c.statementKind = 'STANDARDIZATION_CLAIM' AND c.comparator IN ['GTE','GT','EQ','APPROX'] AND c.quantity >= 2.5 AND c.unitCode = '%' RETURN m.uid, k.uid, c.quantity"
Planner: "COST" / Runtime: "SLOTTED"   exit 0
```

```
$ sha256sum final/schema/D1.graphql final/_work/registers/D1.*.yaml
eb0537ff69c0a19719440daeae0241ba77769ecf35460534402c628b4b587e0c  final/schema/D1.graphql
d68c2ca2e75eadcb6a3c10d54fae5baf58da01c9be62628c5e77db2650e844e1  final/_work/registers/D1.node.yaml
436b618d7fa750b4f7dc4fa0d87b552c12f3f61ea24bf02afe4d94fdcae96e6e  final/_work/registers/D1.relationship.yaml
7f7dfa3839fee6a20c6cf86d1646c33bb76810ff598c195c65005eb93f1b6c19  final/_work/registers/D1.seams.yaml
```

## Open for other S stages

1. Fixtures (not edited here): vitamin-b6-threshold-harm c10a–c10d write EXCEEDS_DOSE_THRESHOLD as stored COMPUTATION Assertions; R-85 puts them inside a published Report. nr-salt-moiety-us-canada p02 SUPPLIES_MATERIAL carries the free-text qualifier "single supplier"; D7's registration (R-68) uses `exclusivity=SOLE|NON_EXCLUSIVE|UNSTATED`, so the fixture editor re-keys it.
2. EXCEEDS_DOSE_THRESHOLD had no registrar in any packet; registered here as D1 report-only (R-85 assigns the edit to D1's register). Registry builder to confirm.
3. `global.retiredNames` lists DERIVED_FROM_TAXON; that is the retired D12 predicate spelling (R-53). D1's typed edge keeps the name; a name lint must not flag `@relationship(type: "DERIVED_FROM_TAXON")`.
4. D12 05 qualifier `comparator` still lists "GE | GT | LE | LT | APPROX" (D12's register); R-57 spelling is GTE / LTE (D12 editor).
5. Unfixtured D1 predicates: MEASURED_CONTENT_IN_PRODUCT / CONTAINS_UNDECLARED_SUBSTANCE (OQ-D1-30), no typed pair affected.
6. Q-D1-03 / Q-D1-19 / CQ-ST-02 answer kinds (R-50) live in the question catalog, not in these registers.
