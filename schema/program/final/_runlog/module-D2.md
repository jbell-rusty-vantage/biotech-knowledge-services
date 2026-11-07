# Module D2 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md`: R-01–R-08, R-15, R-17, R-25, R-26, R-29, R-42, R-47, R-50, R-52–R-60, R-70, R-83–R-90, R-94 read in full.
- `final/_work/rulings.yaml`: `global` and `modules.D2`, plus every other module row naming a D2 type (D3 R-70/R-07, D5 R-70/R-84, D8 R-88, D10 R-47).
- `final/_runlog/module-K.md` (the kernel changes), `final/schema/kernel.graphql`, `final/_work/registers/K.*.yaml`.
- `packets/D2/` 04, 05, 06, 10, 03 (Q-D2-14 and Q-D2-18), and the fixtures; `review-open-issues.json` D2; `inventory-final.md`; `packets/D10/answer-kind-table.md` (Q-D2-14, Q-D2-18).

```
$ sha256sum packets/D2/04-schema-proposal.graphql packets/D2/05-relationship-register.yaml packets/D2/06-node-register.yaml packets/D2/10-seams.yaml final/schema/kernel.graphql
1796b1114aa50b9e5369006213b78ca74f9837cebec7ceb0a4a9e57dcfa16bfa  packets/D2/04-schema-proposal.graphql
26339e16831c7008269721c769010ee287c1070d12de62af7133a9a5ddc7b7ff  packets/D2/05-relationship-register.yaml
3bbb38e4fb0bbe9f97566599f45480f9b06ddbdba1255fb0b724e597e2294c04  packets/D2/06-node-register.yaml
ebd97e2d16eb8adab047eebd1b2ea48ee1a3d81d822573d87ddf17d6f3574c0d  packets/D2/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
```

## SDL: `final/schema/D2.graphql`

```
$ cp packets/D2/04-schema-proposal.graphql final/schema/D2.graphql
```

Edits were made with the Edit tool. The banner `# ---- fragment D2 ----` stays on line 1, and a synthesis block was added to the header.

| ruling | SDL edit |
| --- | --- |
| R-47 | `MechanismProjectionProperties.nNoChangeContexts` removed. The docstring now says: a superset of kernel DerivedEdgeProperties (an M11 base); `score` stays null (executor-validated); the Q-D2-18 ranking reads D10 Association. Q-D2-18 is dropped from the `questions` of the edge-property docstring and of `Mechanism.affectedBy` |
| R-59 | `enum MechanismDirection` removed; `direction: EstimateDirection` (D3) |
| R-58 | `exposureBasis: AmountBasis` (D6), replacing D3 QuantityBasis; the header and the enum note are rewritten |
| R-17 | `MechanismEvidenceContext @node(labels: ["MechanismEvidenceContext"])`, with no Entity label |
| R-25 | `bestBasis` docstring: ranked by the one kernel basis order |
| R-25, R-26 | MechanismReferenceProperties docstring: the hallmark-mapping curation file is a kernel Source with a snapshot per version, and the mapping basis is CURATOR_CLASSIFICATION |
| R-29 | `MechanismEvidenceContext.assertions` docstring: written in the Assertion's intent, corrected by supersession |
| R-86, R-26 | `exposures` docstring: structural, and written alongside IN_STUDY_ARM (confirm; no type change) |
| R-90 | MechanismEvidenceContext docstring: species join on ncbiTaxonId (confirm) |
| R-70, R-84 | Condition docstring: a TargetMeasure member through D5 OPERATIONALIZED_BY, and the CAUSES_ADVERSE_EFFECT object. Outcome docstring: TargetMeasure, no LOINC (R-42) |
| R-03 | no change: asserted `[CONNECT]`, structural to foreign or kernel records `[CONNECT]`, derived `[]` (verified below) |

One fix during the compile check. The Outcome docstring had a line starting with `union TargetMeasure; R-70) and`. It was valid GraphQL, but `grep '^union '` counted it in the printed schema (3 instead of 2). The line was reflowed, and every `^(union|type|enum|input|interface) ` line in D2.graphql is now a real declaration (21 lines: 11 enums, 3 edge-property types, 2 unions, 5 nodes).

```
$ grep -n 'QuantityBasis\|MechanismDirection\|nNoChange\|LOINC' final/schema/D2.graphql   -> header/docstring mentions only (no type use)
$ wc -c -l final/schema/D2.graphql   -> 452 lines, 24350 bytes (packet: 438 lines)
$ sha256sum final/schema/D2.graphql  -> 3d1f1a729fcd2ec595e875abcabe9d3b7de1931496120cfbe5f7d0d3b8421b71
```

M11 verbatim-base prefix (Python, regex over kernel.graphql and D2.graphql):

```
MechanismReferenceProperties <- AssertedRecordedProperties True 5 8
ExposureRoleProperties <- StructuralEdgeProperties True 2 3
MechanismProjectionProperties <- DerivedEdgeProperties True 7 14
```

## Compile check (kernel + scratch stubs + D2)

The stubs live in scratch only: `scratchpad/synth/module-D2/stubs.graphql`. They define:
- the D3 enums AdministrationRoute, SexScope and EstimateDirection, and the D6 enum AmountBasis, copied by `awk` from the in-progress `final/schema/D3.graphql` and `D6.graphql`;
- four minimal `@node` types implementing `Entity & Subjectable` (ChemicalSubstance, IngredientMaterial, Intervention, StudyArm), each with only the 7 Entity fields.

```
$ cat final/schema/kernel.graphql stubs.graphql > kernel+stubs.graphql
$ cat final/schema/kernel.graphql stubs.graphql final/schema/D2.graphql > kernel+stubs+D2.graphql
$ BKS_SCHEMA_PATH=<C:/ abs>/<file>.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <C:/ abs scratch>/<file>.printed.graphql
kernel           wrote ... (326571 chars) in 3s   wall 19 s
kernel+stubs     wrote ... (347193 chars) in 2s   wall 20 s
kernel+stubs+D2  wrote ... (457476 chars) in 2s   wall 15 s   (final D2 file, after the docstring reflow)
packet D2 (kernel + stubs + D3 QuantityBasis stub + packets/D2/04)  wrote ... (457612 chars) in 1s
```

There were no errors. Each output is 0.3–0.5 MB, not the ~55 MB pinned fallback. The D2 output contains `MechanismEvidenceContext` (124 occurrences) and `EstimateDirection` (9). It has 0 occurrences of `nNoChangeContexts`, `MechanismDirection` and `QuantityBasis`, so the file that was printed is the final D2 file.

| printed schema | bytes | lines | input types | enums | object types | unions | Mutation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kernel alone | 326,595 | 6,498 | 179 | 35 | 105 | 0 | 0 |
| kernel + stubs | 347,217 | 6,838 | 187 | 35 | 117 | 0 | 0 |
| kernel + stubs + final D2 | 457,533 | 8,976 | 251 | 50 | 149 | 2 | 0 |
| kernel + stubs + packet D2 (comparison) | 457,669 | 8,971 | 251 | 50 | 149 | — | — |

Marginal cost:
- **Final D2 over kernel alone** (includes the stubs): +130,938 B, +2,478 lines, +72 inputs.
- **D2 over kernel + stubs**: +110,316 B, +2,138 lines, +64 inputs, +15 enums.
- **Synthesis vs packet D2**: −136 B, +5 lines, 0 inputs.

```
$ node packages/schema-workspace/dist/cli.js map --sdl .../kernel+stubs.graphql    -> 15 node types | 32 rel fields | 13 rel types | 79 expanded pairs
$ node packages/schema-workspace/dist/cli.js map --sdl .../kernel+stubs+D2.graphql -> 20 node types | 39 rel fields | 19 rel types | 122 expanded pairs  (schemaDigest sha256:0c1b9b24…)
D2 rows: EXPOSED_TO 3 (ContextExposure 3) | AFFECTS_MECHANISM 2 (MechanismModulator 2) | PARTICIPATES_IN 2 | IN_STUDY_ARM 1 | OBSERVED_IN_CONTEXT 1 | PART_OF_MECHANISM 1  = 10 pairs
```

The +43 expanded pairs are D2's 10 own pairs plus the kernel's Subjectable-target fields expanded over D2's 4 new Subjectable implementers and the stubs. Under R-01 the collapsed count is D2's own 10 pairs.

## Registers

The registers were built with Python string-replace scripts in scratch (`build_rel.py`, `build_node.py`). Each replace asserts an exact match count. `D2.seams.yaml` was written by hand from 10-seams, and the R-55 rename was then applied with an asserted replace.

- **D2.relationship.yaml**
  - `module: D2` on all 6 entries; fixtures rewritten to `final/fixtures/D2/<folder>`.
  - AFFECTS_MECHANISM: Q-D2-18 removed from `questions` and the rationale rewritten (R-47, R-59).
  - Rationale notes added: PART_OF_MECHANISM (R-25, R-26), OBSERVED_IN_CONTEXT (R-29), EXPOSED_TO (R-86).
  - predicateOnly: `registrar: D2` on all 17 rows. NO_CHANGE_IN: promoteWhen updated (R-47). MEDIATES_TARGET admitted (R-83). DEVELOPS_THERAPY_TARGETING flagged (R-52 rule 3 would name D7).
  - deferred OPERATIONALIZED_BY reason (R-70, R-26, R-42).
- **D2.node.yaml**
  - `module: D2` on all 5 entries.
  - Outcome: LOINC dropped (R-42, R-70) and whyNode updated (R-70). Condition whyNode (R-84, R-88, R-70). Mechanism whyNode (R-47, Q-D2-18).
  - MechanismEvidenceContext: `labels: [MechanismEvidenceContext]` (R-17) and the AmountBasis comment (R-58).
  - `mutations` rewritten to `{ graphql: none, executor: [...] }` (R-03).
  - deferred Association reason (R-47).
- **D2.seams.yaml**
  - 22 seams: 8 owned by this module, 14 owned by others. Each has `module`, `status` and `ruling`, and all 22 are accepted.
  - New row: OPERATIONALIZED_BY D5.Target → D2.Condition (R-70). The Target → Outcome row was updated, and Q-D2-18 was added to ASSOCIATES (R-47).
  - 6 predicateSeams: USE_CONSTRAINED_IN and CAUSES_ADVERSE_EFFECT split (R-84, R-85); HAS_APPROVED_INDICATION added (R-88).
  - 10 sharedVocabularies:
    - re-pinned targets@0.2.2 and frontiers@0.2.1 (R-60);
    - re-homed d3-enums (EstimateDirection), d6-enums (AmountBasis) and ModelOrganism (R-56);
    - added predicates and assessment-vocabularies. The conflict subkind is `D7.conflict-relevance` (R-55).

Foreign seam types were checked against the final module SDLs (`grep -l 'type: "<T>"' final/schema/*.graphql`). REFLECTS_MECHANISM and HAS_ANALYTE are in D4; MEASURES and INVESTIGATES in D3; OPERATIONALIZED_BY in D5 (AssertedRecordedProperties, `union TargetMeasure = Biomarker | Metric | Outcome | Condition`); ASSOCIATES in D10; MENTIONS and COVERS_LOCATOR in D9; HAS_SUBJECT, HAS_OBJECT and OCCURRENCE_OF in the kernel; ASSESSES in the kernel and D10.

R-53 lint: D2's 17 predicate names were checked against the 106 relationship type names in every 04 and final SDL (`comm -12`), and none matched. No other packet's 05 registers a D2 predicate name.

R-06 fixture check (`grep` over `packets/D2/07-fixtures/*/assertions.yaml`): every D2 pair has a fixture edge except **EXPOSED_TO → D1.IngredientMaterial**. Its deciding question CQ-MX-04 is value 1, so the pair is kept under the R-06 exception and needs a numbered request in `final/requests.md`.

Validation (PyYAML, regex over D2.graphql):

```
rel {'relationships': 6, 'predicateOnly': 17, 'deferred': 26}   node {'nodes': 5, 'deferred': 6, 'mergedInto': 5}
seam {'seams': 22, 'predicateSeams': 6, 'sharedVocabularies': 10}
rel missing [] | node missing [] | seam missing [] | predseam missing []
SDL rel types 6 == register | SDL node types 5 == register | edgeProperties resolve
predOnly & relTypes set() | registrar {'D2'} | pairs (register from x to) 10 | non-accepted seams []
nested: asserted [CONNECT] x2, structural [CONNECT] x3, derived [] x1
$ sha256sum
a5cb746f173fc4fca87afc45514ad64e759fb8bf5cdaf531cab9dccce9bb4784  _work/registers/D2.node.yaml
30f5130f2aaaaab6c05a289c6bd4984f77c4551fdb9b53a07d5823fdd34d26d6  _work/registers/D2.relationship.yaml
4a35ef36a0b28ab748ef64d73c60e37eb471ab6b94b80118793f749393999cba  _work/registers/D2.seams.yaml
```

## Not done here (other deliverables or owner)

- 03-pattern edits go to query-patterns:
  - Q-D2-18 ranking on Association (R-47);
  - MechanismDirection values → EstimateDirection (INCREASES → INCREASED and so on, R-59);
  - Q-D2-21 → HOLDS_STAKE | HOLDS_ROLE | RECEIVES_VALUE_FROM (R-89).
- The Q-D2-14 answer kind (materialized → retrieved, R-50) goes to the questions catalog.
- Fixture edits go to the fixtures stage:
  - first-author asserters → D3 Publication (R-15);
  - cell-free contexts route IN_MEDIUM and basis MEDIUM_CONCENTRATION (R-58);
  - `direction` values (R-59).
- Open-question closures (items 1, 30 and 33) go to open-questions.
- The fixture requests for EXPOSED_TO → IngredientMaterial and OPERATIONALIZED_BY → Condition go to the owner of `final/requests.md`.
