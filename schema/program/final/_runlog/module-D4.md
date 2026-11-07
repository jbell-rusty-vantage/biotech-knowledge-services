# Module D4: module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-03, R-06, R-25, R-26, R-28, R-42, R-52, R-53, R-54, R-55, R-56, R-70, R-72 and R-94 read in full for D4).
- `final/_work/rulings.yaml`: `global` and `modules.D4`, plus the rows in other modules that name a D4 type (D3 R-72 ADMINISTERS → Device; D5 R-26 / R-70 OPERATIONALIZED_BY and TargetMeasure; D8 R-72 unions).
- `final/schema/kernel.graphql`, and the kernel editor's notes in `_runlog/module-K.md`.

```
$ sha256sum packets/D4/04-schema-proposal.graphql packets/D4/05-relationship-register.yaml packets/D4/06-node-register.yaml packets/D4/10-seams.yaml final/schema/kernel.graphql final/_work/rulings.yaml final/decision-report.md
0b2925a1bea8158199922a9daf4edf384e80fc447c0e7719e810937ded6f3024  packets/D4/04-schema-proposal.graphql
05ead78938703bc42da9221e1853ed0e540ccb8810a0aeafc9f7a39ded30040f  packets/D4/05-relationship-register.yaml
223b34b32283c1e6709cf3867af46460a25d7a31aacc765fe6a71298861d0f18  packets/D4/06-node-register.yaml
01a278ca526939506105d4ff9967ede8915d07efe6eea359b5f616a7ca0379ef  packets/D4/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
19dba4c3c822d3cbee75f232a015ca4ca6719eb4e8b3dc508ecb1f218123ac81  final/_work/rulings.yaml
327c2c3d7b2c00bdcfa51935388194ef2eabae64a10b6b149d8edb9533c47762  final/decision-report.md
```

## Rulings applied

| ruling | where | edit |
| --- | --- | --- |
| R-26 (change-edge-class) | SDL `AssayVersion.performingLab`; 05 PERFORMED_BY_LAB; seams | PERFORMED_BY_LAB: structural → asserted, `StructuralEdgeProperties` → `AssertedRecordedProperties`, `[CONNECT]` (unchanged). A curator inference uses basisKind CURATOR_CLASSIFICATION. `MeasurementField` docstring updated. This answers 11 #42. |
| R-26 (edit-text) | SDL banner; 05 header and the rationales of QUANTIFIES, HAS_ANALYTE, OUTPUTS_METRIC, REQUIRES_INPUT_METRIC, INTERVAL_FOR | These are identity-defining components. They stay structural only if the record's attach Assertion cites the defining span. QUANTIFIES's "no Assertion needed" was replaced. |
| R-52 (remove-predicate) | 05 predicateOnly; seams predicateSeams | FIELD_NOT_REPORTED is removed from predicateOnly (registrar K) and is read through a `predicateSeams` row. The 15 remaining entries carry `registrar: D4` and `module: D4`. |
| R-72 (close-oq #12) | 05 DELIVERS rationale; seams | There is one Device path. The CONCERNS / STATUS_OF → D6.Product rows are marked resolved. The ADMINISTERS D3.InterventionComponent → D4.Device row is **cut**. |
| R-94 (edit-seam) | seams | HAS_ITEM `from` is K.Report. The StepMeans union is dropped (STEP_USES → K.Subjectable, R-28). The RESOLUTION subkind `about` reads "surface-form SourceLocator", replacing Mention. Relationship seams and `predicateSeams` are now separate lists. |
| R-55 (edit-text) | seams registeredValues `D4.test-and-sell` | conclusionCodes are the D7.conflict-relevance codes [DIRECT, INDIRECT, NOT_RELEVANT, UNDETERMINED], with `conclusionCodesRegistrar: D7`. |
| R-03 | 06 `mutations` | Written as `{ graphql: none, executor: ... }`. The executor text comes from each node's archetype (insert-only versioned states: create only). |
| R-42 / R-70 | 06 Metric comment; seams | LOINC is on D4 Metric only (11 #37 closed). TargetMeasure and OutcomeMeasureTarget are now four-member unions. OPERATIONALIZED_BY is asserted with CURATOR_CLASSIFICATION (D5 R-26). |
| R-60 | seams sharedVocabularies | References point at `final/vocabularies/` (targets @0.2.2, frontiers @0.2.1). |
| R-94 (edit-pattern Q-D4-10), R-50 (Q-D4-08 retrieved → assessment) | none | Neither applies to the SDL or the registers. The word "RegulatoryStatus" does not occur in packets/D4 (`grep -rn RegulatoryStatus packets/D4` returns nothing). The answer kind lives in 02/03, which belong to the pattern and fixture editors. |

Checks with no change needed:
- R-02: every type has L1 `@filterable(byAggregate:false)` and `@mutation(operations: [])`.
- R-04: `@fulltext` / `@vector` count is 0.
- R-17: labels are `[X, Entity]`.
- R-56: no D4 enum name collides with the kernel or any packet SDL (a loop over the 21 D4 enums against `^enum|type|union|interface` returned no hits). SexScope is consumed from D3 and not redeclared.
- R-53: no D4 relationship type is declared by another packet. No predicateOnly value equals any of the 106 relationship-type names across the packet SDLs and the final kernel. No other packet registers a D4 predicateOnly name.
- R-06: every D4 relationship type appears in at least one D4 fixture (`grep -l` per type over `07-fixtures/*/assertions.yaml` and `intent.json`).

## Commands

```
$ python scratchpad/synth/module-D4/build_sdl.py packets/D4/04-schema-proposal.graphql final/schema/D4.graphql
ok 26992          # three asserted single-match replacements; banner '# ---- fragment D4 ----' stays on line 1
$ python scratchpad/synth/module-D4/build_regs.py packets/D4 final/_work/registers
rel ok            # 13 'module: D4' inserts, 13 fixture rewrites, 15 predicateOnly entries tagged, all asserted
node ok           # 7 'module: D4' inserts, 7 mutations rewrites
# D4.seams.yaml written with the Write tool from packets/D4/10-seams.yaml
$ python scratchpad/synth/module-D4/check.py final
rel {'relationships': 13, 'predicateOnly': 15, 'deferred': 40}
node {'nodes': 7, 'deferred': 5, 'mergedInto': 19}
seams {'seams': 29, 'predicateSeams': 5, 'registeredValues': 2, 'sharedVocabularies': 8}
rel missing [] | node missing [] | seam missing []
seam status {'accepted': 28, 'cut': 1}
SDL rel types 13 fields(pairs) 17 reg types 13 True     # edgeProperties and nestedOperations match the SDL for all 13
SDL node types 7 True | enums 21 unions 0
predicateOnly 15 False(FIELD_NOT_REPORTED) collide w/ D4 types set()
fixtures: final/fixtures/D4/{clock-noise-vs-retest-advice, consumer-panel-and-blood-clock, hba1c-two-labs-interference, nr-nad-compound-to-test, wearable-hrv-algorithm-changes}
@fulltext/@vector 0 0
```

## Compile check

The scratch files are in `scratchpad/synth/module-D4/`. `stubs.graphql` (sha256 85550f8b…) is the D4 packet's scratch stub set: D1 ChemicalSubstance, D2 Mechanism, D2 MolecularEntity, D6 Product, D7 Organization and the D3 enum SexScope. The stubs exist only in scratch.

```
$ cat final/schema/kernel.graphql > k.graphql
$ cat final/schema/kernel.graphql stubs.graphql > ks.graphql
$ cat final/schema/kernel.graphql stubs.graphql final/schema/D4.graphql > compile.graphql    # sha256 731f1d31…
$ BKS_SCHEMA_PATH=<scratch>/<x>.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <scratch>/out-<x>.graphql
k        exit 0, wall 7 s, "wrote …out-k.graphql (326571 chars) in 1s"
ks       exit 0, wall 8 s, "wrote …out-ks.graphql (352161 chars) in 1s"
compile  exit 0, wall 6 s, "wrote …out-compile.graphql (528061 chars) in 1s"
$ wc -c -l; grep -c '^input ' / '^type ' / '^enum '
```

| variant | printed bytes | lines | inputs | object types | enums |
| --- | ---: | ---: | ---: | ---: | ---: |
| kernel alone | 326,595 | 6,498 | 179 | 105 | 35 |
| kernel + stubs | 352,185 | 6,923 | 189 | 120 | 35 |
| kernel + stubs + final D4 | 528,111 | 10,490 | 293 | 177 | 57 |
| kernel + stubs + packet D4 (comparison) | 527,888 | 10,489 | 293 | — | — |

- **D4 marginal over kernel + stubs:** +175,926 B, +3,567 lines, +104 inputs.
- **Over the kernel alone, stubs included:** +201,516 B and +114 inputs.
- **Final D4 against packet D4:** +223 B, +1 line, 0 inputs. This comes from R-26 (PERFORMED_BY_LAB now prints `properties: AssertedRecordedProperties!`) plus docstrings.
- **The source is confirmed:** the output is 0.5 MB, not the ~55 MB pinned fallback. `out-compile.graphql` contains `type AssayVersionPerformingLabRelationship { … properties: AssertedRecordedProperties! }`, which exists only in the final D4 file.
- **Build:** 1 s (6 s wall).

```
$ node scripts/schema-size.mjs out-compile.graphql
printed size 0.5 MB | printed lines 10,491 | input types 293 | object types 177 | enums 57 | Query fields 50 | Mutation fields 0
(its "SDL node types 192 / pairs 3940" rows describe the pinned default SDL, not this file)
$ node packages/schema-workspace/dist/cli.js map --sdl compile.graphql   -> 23 node types, 49 rel fields, 26 rel types, 160 expanded pairs
$ node packages/schema-workspace/dist/cli.js map --sdl ks.graphql        -> 16 node types, 32 rel fields, 13 rel types, 87 expanded pairs
```

D4 module counts:
- 7 node types, 13 relationship types and 17 from→to pairs on the collapsed count (R-01). D4 has no union or interface targets, so collapsed = declared.
- Widest union: 0.
- The interface-expanded marginal is 160 − 87 = 73. It includes the kernel's Subjectable targets expanding to the 7 D4 implementers.

```
$ sha256sum final/schema/D4.graphql final/_work/registers/D4.*
b62054b09a7740809ade7b6f3f01c9c424b7097d312a101cb090182201a1bb00  final/schema/D4.graphql
20ba64489219e3fc44573d0888a0d214edfbd737ec883ca7edbbfc0601a0f2d9  final/_work/registers/D4.node.yaml
65d7e7fb576f1e2c9fea7cff7042763b5dcde7ccb1844b144df47dd1bffc60d9  final/_work/registers/D4.relationship.yaml
534c88c20715148c2a377c82065f7d7f3445801d882d6d8b129447bc17c96e5f  final/_work/registers/D4.seams.yaml
```

## Open items for other S stages

1. **Fixture editor.** `hba1c-two-labs-interference` d05 (PERFORMED_BY_LAB) still has `edgeClass: structural` and `basisKind: CALCULATED`. Under R-26 and R-25 it becomes asserted with `basisKind: CURATOR_CLASSIFICATION`. The other curator mappings (d02, c05, f01/f02) may need the same basis.
2. **Pattern editor.** Q-D4-08 answer kind is retrieved → assessment (R-50). The "RegulatoryStatus" rename in Q-D4-10 (R-94) has nothing to rename in packets/D4: grep finds 0 occurrences.
3. **Registry (R-52).** OUTCOME_MEASURED_WITH has only a D3 subject (OutcomeDefinition). Under the subject-owner rule its registrar could be D3. No ruling moved it, so it is kept as `registrar: D4`.
4. **R-55 reading.** `D4.test-and-sell` is kept as a D4 subkind that reuses the D7 codes. If R-55's "one register entry" means D4 should use `D7.conflict-relevance` itself, the assessment-vocabularies editor can merge it.
