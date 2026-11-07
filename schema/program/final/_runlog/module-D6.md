# Module D6 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-01 to R-10, R-18, R-26, R-30, R-39, R-52 to R-58, R-62, R-67, R-68, R-72 to R-74, R-87, R-88, R-94 read in full); `final/_work/rulings.yaml` (`global`, `modules.D6`); `final/_runlog/module-K.md` (kernel changes 1 to 10); `final/schema/kernel.graphql`; `packets/D6/` 04, 05, 06, 10, 09, 11, RUNLOG; `review-open-issues.json` (D6); `inventory-final.md` (D6 rows).

```
$ sha256sum packets/D6/04-schema-proposal.graphql packets/D6/05-relationship-register.yaml packets/D6/06-node-register.yaml packets/D6/10-seams.yaml final/schema/kernel.graphql final/_work/rulings.yaml
5145271961dea2c7e218dd43f62a4fc514240aef4b415e28aded42692c055881  packets/D6/04-schema-proposal.graphql
d81ff877b2f16ba9d009685a1c7a61964241ce40ef1e182438ec047ce5c07ad6  packets/D6/05-relationship-register.yaml
b27093a8a355922565ab2bc565c6664306a46e983d5be2b1832afa79553ab001  packets/D6/06-node-register.yaml
2a867d1ed7866da29345d044f68e11a53a74d7e2ae342b676ff8aa44a8034e2a  packets/D6/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
19dba4c3c822d3cbee75f232a015ca4ca6719eb4e8b3dc508ecb1f218123ac81  final/_work/rulings.yaml
```

Scratch: `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/module-D6/` (`$D` below). Build scripts `build_sdl.py`, `build_rel.py`, `build_node.py` copy the packet file and apply string replacements; each replacement asserts its exact match count and cites its ruling. `D6.seams.yaml` was written by hand from packet 10.

## Fixture check before editing (R-06)

Every D6 pair has a fixture, so R-06 cuts nothing in D6:

```
$ for r in HAS_VARIANT … SELLER_OF_RECORD; do grep -l "$r" packets/D6/07-fixtures/*/*.yaml …; done
HAS_VARIANT: 5 folders · HAS_PACKAGE: 6 · HAS_LABEL_VERSION: 5 · DECLARES_COMPONENT: 5 · NAMES_RESPONSIBLE_PARTY: 3 · BRANDED_AS: 4 · LISTING_FOR: 4 · HAS_OFFER: 3 · SELLER_OF_RECORD: 2
$ grep -h -A8 "predicate: DECLARES_COMPONENT" */assertions.yaml | grep -o "uid: hu:[a-z-]*:" | sort | uniq -c
      4 uid: hu:constituent:      10 uid: hu:food:      20 uid: hu:material:     (all three union members fixtured)
```

## SDL: `final/schema/D6.graphql`

```
$ python -I $D/build_sdl.py C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S
ok header · ok header-kernel-path · ok R-30 docstring · ok R-30 declaredNameVerbatim · ok R-30 formVerbatim/statementVerbatim
ok R-88 ProductKind · ok R-88 PanelKind · ok R-88 ComponentLineRole · ok R-58 AmountBasis · ok R-10 labelVersions
ok R-08/R-18 LabelVersion docstring · ok R-08 seals
wrote …\final\schema\D6.graphql 26137 bytes
```

The banner `# ---- fragment D6 ----` stays on line 1.

| ruling | SDL edit |
| --- | --- |
| R-10 | `Package.labelVersions` (HAS_LABEL_VERSION): `properties: "AssertedEdgeProperties"` (was StateEpisodeProperties); docstring names `exclusive: true` and R-22 |
| R-30 | `ComponentLineProperties`: removed `declaredNameVerbatim`, `formVerbatim`, `statementVerbatim`; docstring says the locator exact text and qualifiers `declaredName:`, `form:`, `statement:` carry them |
| R-58 | `AmountBasis` + PER_DOSE, PER_DAY, PER_WEEK, PER_CYCLE, PER_KG_BODY_WEIGHT_PER_DAY, PER_KG_DIET, SINGLE_DOSE, MEDIUM_CONCENTRATION, NOT_STATED, OTHER (16 values); docstring names owner D6 and consumers D2, D3, D5, D12 |
| R-88 | ProductKind PRESCRIPTION_DRUG, PanelKind PRESCRIBING_INFORMATION, ComponentLineRole ACTIVE_INGREDIENT |
| R-08 | LabelVersion questions and `seals` docstring: CQ-PF-03 → CQ-PF-03b |
| R-18 | LabelVersion docstring: implements Subjectable under the kernel versioned-state rule |
| header | synthesis-edit list; kernel path points at `final/schema/kernel.graphql` |

Mechanical checks (Python over the final files):

```
SDL rel types 9 [BRANDED_AS, DECLARES_COMPONENT, HAS_LABEL_VERSION, HAS_OFFER, HAS_PACKAGE, HAS_VARIANT, LISTING_FOR, NAMES_RESPONSIBLE_PARTY, SELLER_OF_RECORD]
SDL nodes ['Product', 'ProductVariant', 'Package', 'LabelVersion', 'MerchantListing', 'Offer']
props used ['AssertedEdgeProperties', 'AssertedRecordedProperties', 'ComponentLineProperties', 'StructuralEdgeProperties']
M11 prefix ok True        (ComponentLineProperties starts with AssertedRecordedProperties' 5 fields, in order)
union DeclaredComponentTarget = IngredientMaterial | Constituent | FoodItem   (width 3)
$ wc -c -l packets/D6/04-schema-proposal.graphql final/schema/D6.graphql
  487 23841 packets/D6/04-schema-proposal.graphql
  517 26137 final/schema/D6.graphql
```

## Compile check

Inputs (scratch only): `$D/k.graphql` = kernel; `$D/ks.graphql` = kernel + `$D/stubs.graphql` (stubs for the seam targets IngredientMaterial, Constituent, FoodItem, Brand, Organization, each `Entity & Subjectable` with the 7 Entity fields, plus D1's 5-value `enum MassBasis`); `$D/ksd6.graphql` = kernel + stubs + `final/schema/D6.graphql`.

```
$ for v in k ks ksd6; do BKS_SCHEMA_PATH=$D/$v.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema $D/out-$v.graphql; done
k    rc=0 wall=31s  "wrote …\out-k.graphql (326571 chars) in 3s"
ks   rc=0 wall=18s  "wrote …\out-ks.graphql (352024 chars) in 2s"
ksd6 rc=0 wall=12s  "wrote …\out-ksd6.graphql (493844 chars) in 2s"
$ tail -c +<size of ks.graphql + 1> $D/ksd6.graphql | cmp - final/schema/D6.graphql   -> compiled D6 == final D6
```

The print-schema log does not name the SDL. The source is confirmed because every output is 0.3 to 0.5 MB, not the ~55 MB pinned fallback, and `out-ksd6` holds D6-only names (`ComponentLinePropertiesWhere`, PRESCRIPTION_DRUG). Wall time includes pnpm start-up; the build itself reports 2 to 3 s.

```
$ for v in k ks ksd6; do wc -c; wc -l; grep -c '^input '; grep -c '^type '; grep -c '^enum '; grep -c '^union '; done
$ grep -c "PRESCRIPTION_DRUG\|MEDIUM_CONCENTRATION\|ACTIVE_INGREDIENT" out-ksd6.graphql   -> 4
$ grep -c "type Mutation" out-ksd6.graphql                                                -> 0
$ grep -n "declaredNameVerbatim\|StateEpisodeProperties" out-ksd6.graphql                 -> 1 (the labelVersions docstring text "StateEpisodeProperties retired")
```

| printed | bytes | lines | input types | object types | enums | unions |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| kernel alone | 326,595 | 6,498 | 179 | 105 | 35 | 0 |
| kernel + stubs | 352,048 | 6,923 | 189 | 120 | 35 | 0 |
| kernel + stubs + D6 | 493,891 | 9,556 | 258 | 158 | 48 | 1 |
| **D6 marginal (vs kernel + stubs)** | **+141,843** | **+2,633** | **+69** | **+38** | **+13** | **+1** |
| D6 + stubs marginal (vs kernel alone) | +167,296 | +3,058 | +79 | +53 | +13 | +1 |

Packet-reported D6 marginal (packet 09, against the A1 kernel 790e7244 + stubs) was +150,147 B and +71 inputs. The final module costs 8,304 B and 2 inputs less. Two of the causes are certain: `StateEpisodePropertiesSort/Where` no longer exist (R-10), and three String fields left the edge-property inputs (R-30). The 10 AmountBasis values and the 3 R-88 values cost bytes in the other direction. The kernels differ too, so this is not a controlled comparison: the packet SDL cannot be compiled against the final kernel, because the final kernel has no StateEpisodeProperties.

```
$ node packages/schema-workspace/dist/cli.js map --sdl $D/ks.graphql   --out $D/map-ks.md     # sha256:7fc602a2…
$ node packages/schema-workspace/dist/cli.js map --sdl $D/ksd6.graphql --out $D/map-ksd6.md   # sha256:d190df19…
```

| map | node types | rel. fields | rel. types | pairs (expanded) | unions |
| --- | ---: | ---: | ---: | ---: | ---: |
| kernel + stubs | 16 | 32 | 13 | 87 | 0 |
| kernel + stubs + D6 | 22 | 41 | 22 | 146 | 1 |
| D6 marginal | +6 | +9 | +9 | +59 | +1 |

D6 contributes 11 collapsed pairs (R-01): 5 intra-module, 3 DECLARES_COMPONENT union members, BRANDED_AS, NAMES_RESPONSIBLE_PARTY and SELLER_OF_RECORD. The expanded +59 is those 11 plus 48 = 6 new Subjectable implementers × 8 kernel fields that target Subjectable in this assembly.

## Registers

```
$ python -I $D/build_rel.py <worktree>
module lines added: 9 · ok fixture paths x9 · ok R-10 HAS_LABEL_VERSION · ok R-10 rationale · ok R-30/R-58/R-87/R-88 DECLARES_COMPONENT rationale
ok R-67 NAMES_RESPONSIBLE_PARTY · predicateOnly entries: 26 with registrar: 26
ok removed INTENDED_FOR_TARGET (R-52) · ok removed PREPARED_WITH (R-62) · ok removed MANUFACTURES (R-68) · ok removed MANUFACTURER_STATEMENT (R-68)
ok R-52 OFFERS_INTERVENTION · ok R-52 SUCCEEDED_BY · ok R-74 LISTING_PACKAGE_SIZES · ok R-08 BEARS_SEAL · ok R-10 LABEL_FOR · ok R-94 MediaWork
ok R-68 MANUFACTURES deferred · ok R-68 CONTRACTS_MANUFACTURING · ok R-74 CERTIFIED_UNDER · ok R-68 DISTRIBUTES_PRODUCT · ok R-83 ENDORSES_PRODUCT
$ python -I $D/build_node.py <worktree>
ok header · module lines added: 6 · ok R-03 mutations x5 · ok R-03 LabelVersion mutations · ok R-18/R-08 LabelVersion whyNode · ok R-74 ProductLot · ok R-94 LabelSnapshot
```

Validation (Python, PyYAML safe_load plus regex over the SDL):

```
D6.relationship.yaml {'version': 1, 'module': 'D6', 'relationships': 9, 'predicateOnly': 22, 'registeredElsewhere': 8, 'deferred': 58}
  every entry has type, class, from, to, edgeProperties, cardinality, temporal, questions, pattern, populatedBy, fixture, nestedOperations, aggregate, rationale, module (MISSING [] x9)
  HAS_LABEL_VERSION AssertedEdgeProperties exclusive=True
  predicateOnly names 31, collide with relationship types (all packet 04 + final/schema): []      (R-53)
  reg==sdl True
D6.node.yaml {'version': 1, 'module': 'D6', 'nodes': 6, 'deferred': 5, 'mergedInto': 16}; nodes==sdl True; no field missing
D6.seams.yaml {'version': 1, 'module': 'D6', 'seams': 29, 'predicateSeams': 13, 'sharedVocabularies': 8}
  seams: accepted 28, cut 1 (QUALITY_RESULT_FOR → D6.Product, R-73); predicateSeams: accepted 13
  seam type refs not in final SDLs (K + D1..D13 present on 2026-10-08): []
  out seams == SDL cross-module targets: BRANDED_AS→Brand, DECLARES_COMPONENT→Constituent|IngredientMaterial|FoodItem, NAMES_RESPONSIBLE_PARTY→Organization, SELLER_OF_RECORD→Organization
```

The seam targets were checked against the final SDLs on disk: D8's RegulatoryRecordTopic, LegalStatusSubject, LotOfTarget and CertificationCoverageTarget; D3's AdministeredMaterial; D12's referencedByProducts and memberProducts; D4's DELIVERS; D5's STEP_USES → Subjectable; D1's Constituent.

Register edits, in summary:
- **Relationship register:**
  - Every entry gets `module: D6`, and `fixture` becomes `final/fixtures/D6/<folder>`.
  - HAS_LABEL_VERSION gets AssertedEdgeProperties, `exclusive: true` and an `exclusiveNote` (see issues).
  - DECLARES_COMPONENT's rationale cites R-30, R-58, R-87 and R-88. NAMES_RESPONSIBLE_PARTY's cites R-67.
  - Every predicateOnly entry gets `registrar: D6`. OFFERS_INTERVENTION gets its subjects (R-52), SUCCEEDED_BY the D7 Organization pair (R-52), LISTING_PACKAGE_SIZES the R-74 text, and BEARS_SEAL CQ-PF-03b.
  - Four entries move to a new `registeredElsewhere` list of 8 rows: INTENDED_FOR_TARGET, PREPARED_WITH→HAS_RECIPE_INGREDIENT, MANUFACTURES and MANUFACTURER_STATEMENT→MANUFACTURER_UNNAMED. The list also holds SUPPLIES_MATERIAL, SAMPLE_TESTED_POSITIVE_FOR, SOURCED_FROM_COUNTRY and DISTRIBUTES.
  - Stale deferred reasons are updated: LABEL_FOR, REGION_HAS_DECLARATION, MANUFACTURES, CONTRACTS_MANUFACTURING, CERTIFIED_UNDER, DISTRIBUTES_PRODUCT and ENDORSES_PRODUCT.
- **Node register:**
  - `module: D6` on every node.
  - `mutations` is read as `{ graphql: none, executor: … }` (R-03).
  - LabelVersion whyNode follows R-18 and R-08. ProductLot follows R-74, and the LabelSnapshot mergedInto row follows R-94.
- **Seams:**
  - Each row carries `status` and `ruling`.
  - RESULT_FOR becomes QUALITY_RESULT_FOR, and the row is cut (R-73).
  - OFFERS_INTERVENTION and LINKS_TO_OFFER move to `predicateSeams` (R-94).
  - Union notes are refreshed to the final D8 and D3 SDLs (R-72, R-67).
  - STEP_USES goes to K.Subjectable (R-28).
  - Eleven `predicateSeams` rows are added for the registrars named by R-52, R-62, R-68, R-73, R-88 and R-18.
  - sharedVocabularies point at `final/`. AmountBasis is listed as provided by D6. Pins are targets 0.2.2 and frontiers 0.2.1 (R-60).

```
$ sha256sum final/schema/D6.graphql final/_work/registers/D6.*.yaml
6b14b735ef1a80f479264325feb62140ee078a81082661f79e78253d3abd1523  final/schema/D6.graphql
a744c4277bdeab867cca8d58261c085be13ae275b648ae3f16b88f26a1037b0f  final/_work/registers/D6.node.yaml
aa00bd63fe1fa380f1ca17e3189a9ef8a3cb72d694299130eec4f32f23cd2452  final/_work/registers/D6.relationship.yaml
93d43143f4d68c4b675b54f4f8c426917c1e17253892e602787d5c6ece0623b9  final/_work/registers/D6.seams.yaml
```

Note: the D6.seams.yaml hash above was taken after the MANUFACTURER_UNNAMED row was corrected to D7's registration (subject Organization, object literal; packet D7 05 line 178).

## Issues for the integrator and owner

1. **R-10 vs D6's NON-EXCLUSIVE design.** The ruling sets `exclusive: true` on HAS_LABEL_VERSION. The packet had declared it non-exclusive: parallel open episodes per asserting source (packet 03 Q-D6-01; adversarial fix M14). With R-22 (one episode per (from, to, type, asserter)), the fixtures are consistent only if the executor checks non-overlap per (package, type, asserter). R-10 does not fix that scope.
2. **Q-D6-01 pattern.** The pattern in packet 03 reads `c.declaredNameVerbatim`, which R-30 removed. The query-patterns editor must read the line Assertion's locator text or its `declaredName:` qualifier instead.
3. **R-39.** The `populatedBy` rewrite to action-space ids is not in modules.D6, and K did not apply it either. The measured alias map is in the D6.relationship.yaml header.
4. **Fixture re-keys belong to the fixtures editor:** MANUFACTURER_STATEMENT→MANUFACTURER_UNNAMED (filing-channels-niagen-10k), PREPARED_WITH→HAS_RECIPE_INGREDIENT (prepared-food-bigmac-mcdonalds), SAMPLE_POSITIVE_OUTBREAK_STRAIN→SAMPLE_TESTED_POSITIVE_FOR (recall-moringa-mogo e14, e15, e19), and the per-line verbatim fields → qualifiers (R-30).
5. **Other modules' seams that still name StateEpisodeProperties for HAS_LABEL_VERSION:** packet D1 10-seams line 19. That row belongs to the D1 editor.
