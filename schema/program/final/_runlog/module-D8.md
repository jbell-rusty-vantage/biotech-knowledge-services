# Module D8 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- Read: `final/decision-report.md` (R-01 to R-08, R-14 to R-16, R-23, R-31, R-52 to R-57, R-66 to R-68, R-72 to R-74, R-84, R-88, R-93, R-94), `final/_work/rulings.yaml` (`global`, `modules.D8`, and other modules' rows naming D8), `final/schema/kernel.graphql`, `final/_runlog/module-K.md` ("Kernel changes in synthesis"), `packets/D8/04`, `05`, `06`, `10`, `11` (OQ-D8-02), fixture predicate scan.

```
$ sha256sum packets/D8/04-schema-proposal.graphql packets/D8/05-relationship-register.yaml packets/D8/06-node-register.yaml packets/D8/10-seams.yaml final/schema/kernel.graphql final/_work/rulings.yaml final/decision-report.md
2656eda17ac00c47817eb822c7b3b264de49637ac0d5f44b79dec5185b2bd6c0  packets/D8/04-schema-proposal.graphql
9e70e0868d573ad57ff18fd6141e247751d86bcfa9c2af3648f1673e32091ce3  packets/D8/05-relationship-register.yaml
aac6d4a3a8f905840746c9245145fdf14db561af0651b8747070c0408ac69e70  packets/D8/06-node-register.yaml
d0beff5d1b1cba12eff9d3d1e6ba8790e5fb44dc2690a9d5eead1495c71314ea  packets/D8/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
19dba4c3c822d3cbee75f232a015ca4ca6719eb4e8b3dc508ecb1f218123ac81  final/_work/rulings.yaml
327c2c3d7b2c00bdcfa51935388194ef2eabae64a10b6b149d8edb9533c47762  final/decision-report.md
```

Kernel changes 1 to 10 (module-K.md) checked against D8: D8 never used StateEpisodeProperties, RENDITION_OF, contentHashBasis or a Subjectable target; it registered RATES_CLAIM (removed, item 7). No other kernel change touches D8.

## Commands

```
$ cp packets/D8/04-schema-proposal.graphql final/schema/D8.graphql      # banner "# ---- fragment D8 ----" kept on line 1
```

SDL edits were made with the Edit tool, plus one Python string-replace pass (11 replacements, each asserted to match once).

| ruling | SDL edit |
| --- | --- |
| R-57 | `enum SpecComparator` deleted; `QualityResult.specComparator: QuantityComparator` (D1). Field docstring carries the UNKNOWN rationale |
| R-72 | `RegulatoryRecordTopic = ChemicalSubstance \| IngredientMaterial \| Product \| Lot` (5 → 4); `LegalStatusSubject = ChemicalSubstance \| IngredientMaterial \| Product \| Patent` (5 → 4); RegulatoryRecord.concerns and LegalStatus docstrings name the Product -DELIVERS-> Device path |
| R-73 | `union QualityResultFor` deleted, `QualityResult.resultFor: [Lot!]!`; `union PatentTopic` deleted, `Patent.concerns: [ChemicalSubstance!]!`; QualityResult docstring: a survey row without a lot is a D1 predicate; identity rule uses the lot uid |
| R-88 | `LegalStatusKind.PRESCRIPTION_ONLY` |
| R-66 | RegulatoryPathway docstring: D13 deletes ApprovalPathway / DesignationType and retypes its Event fields; OQ-D8-02 mapping published in final/vocabularies |
| R-08 | CQ-PF-03 → CQ-PF-03a in the Lot and CertificationListing docstrings and two field docstrings |
| header | synthesis edit list; counts point at this run log |

Registers were built from the packet's 05, 06 and 10. Every entry keeps every contract field and adds `module: D8`.
- `D8.relationship.yaml`: scratch `synth/module-D8/build_rel.py` (string replaces asserted to match once; regex adds `module: D8` and rewrites `fixture:` to `final/fixtures/D8/<folder>`).
- `D8.node.yaml`: scratch `synth/module-D8/build_node.py` (same method).
- `D8.seams.yaml`: written by hand from 10.

```
$ python build_rel.py  C:/Users/.../schema/program     -> ok
$ python build_node.py C:/Users/.../schema/program     -> first run AssertionError (match string lacked "it"); fixed with sed; rerun -> ok
```

Register edits, by ruling:

| ruling | edit |
| --- | --- |
| R-72 | CONCERNS and STATUS_OF `to` lose D4.Device; rationales name the Product -DELIVERS-> Device path; seams rows `cut`; new seam row DELIVERS D6.Product → D4.Device (owner other, declared by D4) |
| R-73 | QUALITY_RESULT_FOR `to: Lot`; CONCERNS cardinality notes Patent → D1.ChemicalSubstance only; `fixtureRequest` on STATUS_OF (LNHPD NPN, CQ-MF-02) and COVERS (NSF variant listing, CQ-PF-03a); deferred rows for the cut pairs; seams rows `cut`; predicate SAMPLE_TESTED_POSITIVE_FOR (registrar D8) |
| R-07 | `demotionCandidate` on ASSIGNED_TO, LICENSED_TO, MEASURES_ANALYTE |
| R-52 | `D8.` prefix dropped on 13 literal predicates; `registrar: D8` on every predicateOnly row; RATES_CLAIM (K) and INTENDED_FOR_TARGET (D5) removed and listed in seams `predicateSeams` |
| R-68 | MANUFACTURES, CONTRACT_MANUFACTURES_FOR, DISTRIBUTES, SUPPLIES_INGREDIENT, EXCLUSIVE_SUPPLIER_OF removed (D7 registers MANUFACTURES, CONTRACT_MANUFACTURES_FOR, SUPPLIES_MATERIAL, DISTRIBUTES); predicateSeams rows |
| R-88 | HAS_APPROVED_INDICATION `ruling: R-88` (subject D6.Product \| D1.ChemicalSubstance, object D2.Condition) |
| R-93 | HAS_ACTION_LEVEL, HAS_CLAIM_CONDITION added (registrar D8) |
| R-03 | node `mutations` rewritten `{ graphql: none, executor: "..." }`; executor text restates each type's docstring write rule |
| R-67 | Facility deferred row and LISTING_COVERS_FACILITY_OF promoteWhen: D8 is the designated future owner, promotion trigger |
| R-08 | CQ-PF-03 → CQ-PF-03a (ISSUED_BY, COVERS, CertificationListing whyNode, seams) |
| R-60, R-94 | seams: `seams` / `predicateSeams` split; vocabulary files under final/; pins targets 0.2.2, frontiers 0.2.1; new rows quantity-comparator (D1, R-57) and predicates (R-52) |

## Checks

```
$ python -c "yaml.safe_load(...)"  (per file)
D8.relationship.yaml {'version': 1, 'module': 'D8', 'relationships': 11, 'predicateOnly': 27, 'deferred': 24}
D8.node.yaml         {'version': 1, 'module': 'D8', 'nodes': 6, 'deferred': 9, 'mergedInto': 35}
D8.seams.yaml        {'version': 1, 'module': 'D8', 'seams': 29, 'predicateSeams': 12, 'sharedVocabularies': 8}
seams by (owner, status): (this, accepted) 20, (other, accepted) 5, (this, cut) 4
rel missing [] · node missing [] · seam missing [] · pseam missing []
11 True     # relationship types in SDL == register entries
6 True      # node types in SDL == node register
predicateOnly & reltypes set()     # R-53: against 106 relationship type names in all packet SDLs + final kernel
filterProperties checked           # every filterProperty exists in the SDL and is not @filterable(byValue: false)
```

R-53 / R-52 collision scan: no D8 predicateOnly name equals any relationship type in `packets/*/04-schema-proposal.graphql` or `final/schema/kernel.graphql`, and no other packet's 05 registers any of the 27 D8 predicate names.

Module counts (scratch `synth/module-D8/count.mjs`, graphql parser over the SDL; union members expanded; no interface targets, so collapsed = expanded):

```
$ node count.mjs final/schema/D8.graphql
nodeTypes 6, relationshipTypes 11, pairs 25, widestUnion 4, enums 20, maxRelFieldsOnType 3
pairsPerType ISSUED_BY 3, ADDRESSED_TO 1, CONCERNS 5, STATUS_OF 4, STATUS_FROM 1, LOT_OF 2, QUALITY_RESULT_FOR 1,
             MEASURES_ANALYTE 3, COVERS 3, ASSIGNED_TO 1, LICENSED_TO 1
unions RegulatoryRecordTopic 4, LegalStatusSubject 4, LotOfTarget 2, QualityAnalyte 3, CertificationCoverageTarget 3
$ node count.mjs packets/D8/04-schema-proposal.graphql
nodeTypes 6, relationshipTypes 11, pairs 29, widestUnion 5, enums 21, unions 7
```

Neo4j (disposable `bks-neo4j-synth`, 5.26): the R-72 device path plans without error.

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p bks-test-password "EXPLAIN MATCH (d:Device {uid: $uid})<-[:DELIVERS]-(p:Product)<-[e:STATUS_OF]-(s:LegalStatus) WHERE ... MATCH (s)-[:STATUS_FROM]->(r:RegulatoryRecord) OPTIONAL MATCH (rec:RegulatoryRecord {recordKind:'RECALL'})-[:CONCERNS]->(p) RETURN ..."
Statement: "READ_ONLY" · Planner: "COST" · Runtime: "SLOTTED"
```

## Compile check

Scratch `synth/module-D8/`: `stubs.graphql` (sha256 `44d2bbb6…`) = 6 stub node types (ChemicalSubstance, IngredientMaterial, Constituent, Product, ProductVariant, Organization; Entity & Subjectable, 7 Entity fields) + `enum QuantityComparator` with the R-57 values. Stubs stay in scratch.

```
$ cat kernel.graphql stubs.graphql            > kernel-stubs.graphql
$ cat kernel.graphql stubs.graphql D8.graphql > kernel-stubs-D8.graphql
$ BKS_SCHEMA_PATH=<C:/ abs>/kernel-stubs.graphql    NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <C:/ abs>/kernel-stubs.printed.graphql
wrote ...\kernel-stubs.printed.graphql (357427 chars) in 2s            (wall 16 s incl. pnpm/tsx start)
$ BKS_SCHEMA_PATH=<C:/ abs>/kernel-stubs-D8.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <C:/ abs>/kernel-stubs-D8.printed.graphql
wrote ...\kernel-stubs-D8.printed.graphql (510116 chars) in 3s         (wall 16 s)
$ BKS_SCHEMA_PATH=<C:/ abs>/kernel-only.graphql ... print-schema .../kernel-only.printed.graphql
wrote ...\kernel-only.printed.graphql (326571 chars) in 1s
# packet baseline: kernel + stubs without QuantityComparator + a Device stub + packets/D8/04
$ BKS_SCHEMA_PATH=<C:/ abs>/kernel-stubs-D8packet.graphql ... print-schema .../kernel-stubs-D8packet.printed.graphql
wrote ...\kernel-stubs-D8packet.printed.graphql (516743 chars) in 1s
```

No errors. Every print is 0.3–0.5 MB, not the ~55 MB pinned fallback. The final print contains `PRESCRIPTION_ONLY` (2), `QuantityComparator` (3), `resultFor(... ): [Lot!]!`, and 0 occurrences of SpecComparator / QualityResultFor / PatentTopic, so it was built from this SDL.

```
$ wc -c, wc -l, grep -c '^input ' / '^enum ' / '^type ' / '^union '
kernel-only           326595 B   6498 lines  179 inputs  35 enums  105 types  0 unions
kernel-stubs          357451 B   7008 lines  191 inputs  35 enums  123 types  0 unions
kernel-stubs-D8       510156 B  10334 lines  299 inputs  56 enums  171 types  5 unions
kernel-stubs-D8packet 516783 B  10477 lines  309 inputs  56 enums  174 types  7 unions
```

| measure | value |
| --- | ---: |
| final/schema/D8.graphql | 34,793 B, 689 lines (packet 33,616 B, 694 lines) |
| D8 marginal over kernel + stubs | +152,705 B, +3,326 lines, +108 inputs |
| D8 + stubs marginal over kernel alone | +183,561 B, +120 inputs |
| final vs packet baseline (same kernel; the packet baseline also carries a Device stub) | −6,627 B, −10 inputs, −2 unions |

The −10 inputs include the Device stub's own inputs, so they are not all from the R-72/R-73 cuts.

## Left for other stages (not D8 files)

- `final/requests.md`: two numbered fixture requests (R-73): COVERS → D6.ProductVariant (NSF variant listing, CQ-PF-03a) and STATUS_OF → D6.Product (LNHPD NPN, CQ-MF-02). They are recorded as `fixtureRequest` in the register, but the file is not written.
- `final/fixtures/D8/`: rename the 14 `D8.`-prefixed predicate uses (13 names) (R-52); COA assertions in eurofins-coa-quantity-by-input asserted by the issuing lab (R-16). A grep of the D8 fixtures' assertions.yaml found no use of SUPPLIES_INGREDIENT, EXCLUSIVE_SUPPLIER_OF, MANUFACTURES, DISTRIBUTES or INTENDED_FOR_TARGET, and one fixture (imu-tek-warning-letter-recall) uses RATES_CLAIM, which is unchanged.
- `final/vocabularies/`: the R-57 comparator mapping, the OQ-D8-02 RegulatoryPathway mapping (R-66), and the D8 predicate rows (R-52, R-73, R-88, R-93).
- Packet text outside the deliverables: 03 Q-D8-23 pattern (R-72), Q-D8-19 answer kind (R-50), CQ-PF-03a (R-08), and closing OQ-D8-29, OQ-D8-31 and OQ-D8-34.
