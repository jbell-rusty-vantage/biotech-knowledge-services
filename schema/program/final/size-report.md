# Size report: candidate schema v2 (assembled)

Integrator stage, S team, 2026-10-09; **re-measured by the fix stage the same day** after three SDL changes that add no type, relationship or pair: the R-49 discourse projection-cache properties (Claim, Person, Channel; FU-01) and two docstring edits (ruling F-05). Every number below comes from a command in `_runlog/fix.md` section 3 (the integrator's first measurement is in `_runlog/integrate.md`). SDL: `schema/final_biotech_schema_v2.graphql` (sha256 `c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793`, 387,615 B, 7,295 lines, 14 modules, 300 named definitions). IR: `schema/final_biotech_schema_v2.ir.json` (built by `_work/build-ir.mjs` with the same `parseSchema` call as `bks-schema map`).

**Caveats.** (1) The IR inherits the pinned `validation-params.json` (FU-08), so its relationship class disagrees with the merged register for three types: MEASURES (IR derived, register asserted), HAS_VARIANT and REQUIRES_INPUT_METRIC (IR asserted, register structural). No count below uses the class; `schema-map.md` shows the IR class. (2) The fixtures do not yet lint against this candidate (FU-03, gate); the numbers here are measurements of the SDL and its executable, not acceptance evidence. Re-measure after FU-08.

Printers:
- **Deployed options**: `pnpm --filter @bks/graphql-api print-schema` with `BKS_SCHEMA_PATH` set to the assembled SDL (the server's `createNeo4jGraphQL` + `schemaOptionsFromEnv()`; `excludeDeprecatedFields` not set). It logged "in 2s". The output carries the new R-49 fields (27 matches), so it is not the pinned fallback.
- **In-process lever printer** (`packets/K/lever/print2.mjs`, re-pointed at this worktree's `apps/graphql-api`): `none` mode output is byte-identical to the pnpm print (`cmp`); `all` mode sets the five `excludeDeprecatedFields` flags (L3 server lever: `mutationOperations`, `aggregationFilters`, `aggregationFiltersOutsideConnection`, `relationshipFilters`, `attributeFilters`; R-02: owner lever, not adopted by default).
- **Pinned baseline**: the lever printer in `none` mode over `schema/pinned/final_biotech_schema_proposal.graphql`.

**Build time, defined.** The budget line "< 5 s build" is read as *in-process build*: `new Neo4jGraphQL(...)`, `getSchema()` and `printSchema()` in one warm Node process, timed by the lever printer, median of three runs. The deployed recipe's wall time (`time pnpm … print-schema`, which adds pnpm and Node start-up and the file write) is reported beside it; the owner decides which one the budget means.

## Headline against the budget and the pinned proposal

| measure | candidate v2, deployed options | candidate v2, L3 (excludeDeprecatedFields) | budget (00-DIRECTIVE) | pinned proposal |
| --- | ---: | ---: | ---: | ---: |
| node types (`@node`) | 69 | 69 | ≤ 90 | 192 |
| relationship types | 106 | 106 | ≤ 160 | 393 |
| from→to pairs, **expanded** (R-01 option B, = `bks-schema map`; the method that reproduces the directive's 3,940) | **848 — over by 248** | 848 | ≤ 600 | 3,940 |
| from→to pairs, collapsed (R-01 option A: interface target = 1, kernel-meaning types once) | 181 | 181 | ≤ 600 if the owner adopts A | 3,883 |
| widest union used as a relationship target | 5 (AdministeredMaterial) | 5 | ≤ 6 | 144 (AssertionSubjectTarget) |
| interface targets (not unions; rule 1, see R-28 / R-96) | Entity: 69 implementers, 1 field (`Activity.generated`, WAS_GENERATED_BY); Subjectable: 56 implementers, 11 fields | same | — | — |
| unions | 16 | 16 | — | 39 |
| executable input types | 960 | 960 | ≤ 4,000 | 38,034 |
| executable size | 1,743,672 B (1.74 MB) | 732,065 B (0.73 MB) | ≤ 6 MB | 57,908,325 B (57.9 MB) |
| executable lines (`wc -l`) | 34,492 | 22,873 | — | 693,830 |
| object types / enums | 524 / 196 | 524 / 196 | — | not counted |
| Mutation fields | 0 | 0 | — | — |
| build, in-process (construction + print), median of 3 | 1.46 s (runs 1.53, 1.46, 1.41 s) | 1.07 s (runs 1.07, 1.04, 1.18 s) | < 5 s | 24.65 s (runs 25.06, 24.65, 23.22 s) |
| deployed recipe wall time (`time pnpm … print-schema`), median of 3 | 4.98 s (runs 4.98, 4.97, 5.14 s) | — | (< 5 s if the budget means wall time) | — |

**Verdict.** On the directive's own pair metric, the expanded count that reproduces its 3,940 baseline, the candidate is **over budget: 848 of 600 (+248)**. It is within every budget line only if the owner adopts R-01 option A (181 of 600). Every other line passes. The recipe's wall time is at the 5 s line (one run of three above it); the in-process build is 1.46 s. This is owner decision OD-01 (R-01).

**R-01's option-B cuts, measured** (`$SP/whatif-cuts.mjs`, in memory on the assembled SDL, nothing applied; same counting rule as `count-schema.mjs`):

| step | cut | expanded pairs | Δ |
| --- | --- | ---: | ---: |
| 0 | candidate as assembled | 848 | — |
| 1 | drop the inverse `Activity.generated` (WAS_GENERATED_BY → Entity, 69 implementers) | 783 | −65 |
| 2 | + retarget D5 STEP_USES to a 6-member union (the pre-review StepMeans: ChemicalSubstance, IngredientMaterial, Product, FoodItem, Intervention, Metric; drops DietaryPattern, FoodCategory and Device from the admissible list) | 733 | −50 |
| 3 | + remove Subjectable from record types under R-18: 55 implementers remove 10 pairs each and one removes 8; **14 implementers** must go | 593 | −140 |

Step 3 is a modeling pass, not arithmetic: which 14 implementers lose Subjectable depends on R-18's test (no registered question uses the type as subject or object of an Assertion, target of an Assessment, or identifier holder), and no module has run that test yet (R-18, FU-12).

Against the pinned proposal (deployed options): node types −123 (−64%), relationship types −287 (−73%), expanded pairs −3,092 (−78%), input types −37,074 (−97.5%), printed bytes −56,164,653 (−97.0%), in-process build 24.65 s → 1.46 s (both medians of 3).

L3 removes 1,011,607 B (−58%) and 11,619 lines but **no input types** (960 in both): the deprecated `_EQ`/aggregation filter fields it drops are fields inside the same input types. The `Where` family goes from 13,818 to 2,192 lines.

Line counts: `wc -l` counts newline characters (34,492); `schema-size.mjs` and the lever printer count lines with `split("\n")` (34,493). printSchema output has no trailing newline, so the second is always the first + 1.

Per-module counts (`_work/count-schema.mjs`, R-01 option A attribution: ASSESSES, DERIVED_FROM, MENTIONS and RENDITION_OF count in K; any other type in the first module, in assembly order, that declares a field with it). Budgets (00-DIRECTIVE section 2): K ≤ 12 node types, ≤ 14 relationship types, ≤ 40 pairs; each domain module ≤ 8, ≤ 14, ≤ 35. "Declared" = collapsed pairs produced by fields on the module's own node types, whatever module owns the type.

| module | node types | relationship types | pairs collapsed (A) | pairs expanded (B) | declared collapsed |
| --- | ---: | ---: | ---: | ---: | ---: |
| K | 11 | **15** | 36 | **593** | 29 |
| D1 | 4 | 6 | 7 | 7 | 7 |
| D2 | 5 | 6 | 10 | 10 | 10 |
| D3 | 8 | 14 | 30 | 30 | 31 |
| D4 | 7 | 13 | 17 | 17 | 17 |
| D5 | 6 | 6 | 9 | **64** | 9 |
| D6 | 6 | 9 | 11 | 11 | 11 |
| D7 | 4 | 7 | 9 | 9 | 9 |
| D8 | 6 | 11 | 25 | 25 | 25 |
| D9 | 3 | 6 | 7 | 7 | 9 |
| D10 | 3 | 4 | 5 | **60** | 9 |
| D11 | 1 | 0 | 0 | 0 | 0 |
| D12 | 3 | 4 | 8 | 8 | 8 |
| D13 | 2 | 5 | 7 | 7 | 7 |
| **total** | **69** | **106** | **181** | **848** | |

Excess rows (contract rule 5: each excess element is justified or ruled):

| module | element | measured | budget | justification / ruling |
| --- | --- | ---: | ---: | --- |
| K | relationship types (option A attribution) | 15 | 14 | EXCESS: R-01 A counts the kernel-meaning types once, in K. Two of them are declared only on domain fields (MENTIONS on D9 Chunk, R-27; RENDITION_OF on D3 Publication and D9 MediaWork, R-43), so they move out of D9 and D3 into K. Under the integrator's first-declarer attribution K holds 13 and D3 holds 15 (`count-schema.mjs --first-declarer`). Either way one module is one type over 14; the assembled total (106 ≤ 160) is unchanged. Owner decision R-97. |
| K | pairs, expanded | 593 | 40 | Only under option B: 11 Subjectable-target fields × 56 implementers and `Activity.generated` × 69. Option-B cuts above. OD-01 / R-01. |
| D5 | pairs, expanded | 64 | 35 | Only under option B: STEP_USES → Subjectable (R-28 registered exception). Cut 2 above. |
| D10 | pairs, expanded | 60 | 35 | Only under option B: ASSOCIATES → Subjectable (R-28 registered exception). OD-01 / R-96. |

D3 reconciliation: D3 holds 14 relationship types and 30 collapsed pairs under R-01 A, matching `_runlog/module-D3.md` (14 / 30). The integrator's 15 / 32 counted RENDITION_OF (both of its pairs) in D3; 31 is the count of pairs produced by D3's own fields (it includes Publication.renditions, Source → Publication).

The two sections below are the unedited output of `node scripts/schema-size.mjs <printed> --ir schema/final_biotech_schema_v2.ir.json`, deployed options first. Their "SDL from→to pairs" line is the expanded count (option B), and their "printed lines" use `split("\n")`.

## A. Deployed options (schema-size.mjs output)

Printed schema: `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/fix/printed-deployed.graphql` · SDL digest `sha256:c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793`.

### Headline

| measure | value |
| --- | ---: |
| printed size | 1.7 MB |
| printed lines | 34,493 |
| input types | 960 |
| object types | 524 |
| enums | 196 |
| Query fields | 158 |
| Mutation fields | 0 |
| SDL node types | 69 |
| SDL relationship fields | 148 |
| SDL from→to pairs | 848 |
| input types per SDL pair | 1.1 |

### Input types by family

| family | input types | lines |
| --- | ---: | ---: |
| Where | 107 | 13,818 |
| ConnectionFilters | 148 | 3,108 |
| Sort | 91 | 1,500 |
| ConnectionWhere | 203 | 1,353 |
| RelationshipFilters | 64 | 1,000 |
| EnumScalarFilters | 190 | 760 |
| ConnectionSort | 148 | 545 |
| Filters | 9 | 57 |

### Generated lines attributed to the declaring SDL node type (top 40)

A generated type is attributed to the SDL node type whose name prefixes it; `(shared)` collects kernel scalars, enums and interface/union families.

| node type | generated types | generated lines | SDL relationship fields | widest target |
| --- | ---: | ---: | ---: | --- |
| (shared) | 358 | 3,794 |  |  |
| Assertion | 50 | 1,045 | 8 | Subjectable (56) |
| Event | 45 | 946 | 6 | — |
| Study | 38 | 745 | 6 | StudyParty (3) |
| ReportItem | 37 | 741 | 6 | Subjectable (56) |
| Report | 35 | 735 | 5 | Subjectable (56) |
| Assessment | 35 | 721 | 5 | Subjectable (56) |
| Mechanism | 38 | 673 | 3 | MechanismModulator (2) |
| RegulatoryRecord | 34 | 645 | 3 | RegulatoryRecordTopic (4) |
| MediaWork | 32 | 615 | 5 | ContentSponsor (2) |
| ProtocolStep | 16 | 589 | 2 | Subjectable (56) |
| AlgorithmVersion | 28 | 569 | 4 | — |
| Activity | 27 | 562 | 4 | Entity (69) |
| LabTest | 33 | 561 | 5 | — |
| IngredientMaterial | 25 | 535 | 4 | — |
| Chunk | 20 | 531 | 3 | Subjectable (56) |
| MechanismEvidenceContext | 23 | 530 | 3 | ContextExposure (3) |
| Adjudication | 25 | 516 | 3 | — |
| StudyResult | 24 | 514 | 3 | StatingRecord (2) |
| Claim | 27 | 490 | 3 | — |
| LabelVersion | 19 | 478 | 2 | DeclaredComponentTarget (3) |
| QualityResult | 23 | 468 | 3 | QualityAnalyte (3) |
| FoodItem | 22 | 457 | 3 | FoodComponentTarget (2) |
| Patent | 23 | 435 | 3 | — |
| Award | 22 | 424 | 3 | — |
| Association | 17 | 412 | 2 | Subjectable (56) |
| Publication | 23 | 407 | 3 | — |
| LegalStatus | 26 | 400 | 2 | LegalStatusSubject (4) |
| Biomarker | 23 | 396 | 3 | — |
| Person | 20 | 392 | 3 | — |
| Organization | 22 | 391 | 2 | — |
| ReferenceIntervalVersion | 15 | 380 | 2 | — |
| SourceSnapshot | 15 | 369 | 1 | — |
| DecisionCriterion | 9 | 350 | 1 | — |
| OutcomeDefinition | 22 | 345 | 2 | OutcomeMeasureTarget (4) |
| CertificationListing | 20 | 344 | 2 | CertificationCoverageTarget (3) |
| StudyArm | 22 | 335 | 2 | StatingRecord (2) |
| MerchantListing | 15 | 330 | 2 | — |
| ChemicalSubstance | 16 | 329 | 2 | — |
| Metric | 17 | 323 | 1 | — |

### Largest generated types (top 25)

| type | kind | lines |
| --- | --- | ---: |
| AssertionWhere | input | 515 |
| ReportItemWhere | input | 365 |
| AssessmentWhere | input | 359 |
| ReportWhere | input | 347 |
| EventWhere | input | 331 |
| ProtocolStepWhere | input | 319 |
| StudyWhere | input | 296 |
| MediaWorkWhere | input | 290 |
| ChunkWhere | input | 279 |
| ActivityWhere | input | 278 |
| AlgorithmVersionWhere | input | 276 |
| IngredientMaterialWhere | input | 270 |
| MechanismEvidenceContextWhere | input | 267 |
| AdjudicationWhere | input | 262 |
| LabTestWhere | input | 256 |
| LabelVersionWhere | input | 253 |
| StudyResultWhere | input | 246 |
| RegulatoryRecordWhere | input | 224 |
| AssociationWhere | input | 222 |
| FoodItemWhere | input | 212 |
| ReferenceIntervalVersionWhere | input | 212 |
| ClaimWhere | input | 210 |
| QualityResultWhere | input | 209 |
| PatentWhere | input | 207 |
| AwardWhere | input | 201 |

## B. L3: excludeDeprecatedFields, all five flags (schema-size.mjs output)

Printed schema: `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/fix/printed-L3.graphql` · SDL digest `sha256:c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793`.

### Headline

| measure | value |
| --- | ---: |
| printed size | 0.7 MB |
| printed lines | 22,874 |
| input types | 960 |
| object types | 524 |
| enums | 196 |
| Query fields | 158 |
| Mutation fields | 0 |
| SDL node types | 69 |
| SDL relationship fields | 148 |
| SDL from→to pairs | 848 |
| input types per SDL pair | 1.1 |

### Input types by family

| family | input types | lines |
| --- | ---: | ---: |
| ConnectionFilters | 148 | 3,108 |
| Where | 107 | 2,199 |
| Sort | 91 | 1,500 |
| ConnectionWhere | 203 | 1,353 |
| RelationshipFilters | 64 | 1,000 |
| EnumScalarFilters | 190 | 760 |
| ConnectionSort | 148 | 545 |
| Filters | 9 | 57 |

### Generated lines attributed to the declaring SDL node type (top 40)

A generated type is attributed to the SDL node type whose name prefixes it; `(shared)` collects kernel scalars, enums and interface/union families.

| node type | generated types | generated lines | SDL relationship fields | widest target |
| --- | ---: | ---: | ---: | --- |
| (shared) | 358 | 3,143 |  |  |
| Event | 45 | 624 | 6 | — |
| Assertion | 50 | 587 | 8 | Subjectable (56) |
| RegulatoryRecord | 34 | 451 | 3 | RegulatoryRecordTopic (4) |
| Report | 35 | 431 | 5 | Subjectable (56) |
| Study | 38 | 429 | 6 | StudyParty (3) |
| ReportItem | 37 | 414 | 6 | Subjectable (56) |
| Mechanism | 38 | 411 | 3 | MechanismModulator (2) |
| Assessment | 35 | 404 | 5 | Subjectable (56) |
| MediaWork | 32 | 358 | 5 | ContentSponsor (2) |
| LabTest | 33 | 333 | 5 | — |
| AlgorithmVersion | 28 | 326 | 4 | — |
| ProtocolStep | 16 | 324 | 2 | Subjectable (56) |
| Activity | 27 | 320 | 4 | Entity (69) |
| Claim | 27 | 309 | 3 | — |
| StudyResult | 24 | 302 | 3 | StatingRecord (2) |
| MechanismEvidenceContext | 23 | 300 | 3 | ContextExposure (3) |
| IngredientMaterial | 25 | 297 | 4 | — |
| Adjudication | 25 | 292 | 3 | — |
| Chunk | 20 | 289 | 3 | Subjectable (56) |
| QualityResult | 23 | 287 | 3 | QualityAnalyte (3) |
| FoodItem | 22 | 274 | 3 | FoodComponentTarget (2) |
| LegalStatus | 26 | 271 | 2 | LegalStatusSubject (4) |
| LabelVersion | 19 | 263 | 2 | DeclaredComponentTarget (3) |
| Patent | 23 | 252 | 3 | — |
| Organization | 22 | 251 | 2 | — |
| Publication | 23 | 251 | 3 | — |
| Award | 22 | 249 | 3 | — |
| Person | 20 | 232 | 3 | — |
| Biomarker | 23 | 230 | 3 | — |
| SourceSnapshot | 15 | 225 | 1 | — |
| Association | 17 | 221 | 2 | Subjectable (56) |
| OutcomeDefinition | 22 | 217 | 2 | OutcomeMeasureTarget (4) |
| StudyArm | 22 | 214 | 2 | StatingRecord (2) |
| CertificationListing | 20 | 210 | 2 | CertificationCoverageTarget (3) |
| StudyPopulation | 19 | 205 | 1 | StatingRecord (2) |
| Metric | 17 | 202 | 1 | — |
| ReferenceIntervalVersion | 15 | 200 | 2 | — |
| ProtocolEdition | 15 | 192 | 1 | — |
| ChemicalSubstance | 16 | 191 | 2 | — |

### Largest generated types (top 25)

| type | kind | lines |
| --- | --- | ---: |
| Query | type | 160 |
| Event | type | 154 |
| Assertion | type | 132 |
| ProtocolStep | type | 121 |
| RegulatoryRecord | type | 110 |
| Report | type | 104 |
| ReportItem | type | 95 |
| Chunk | type | 90 |
| QualityResult | type | 87 |
| Assessment | type | 83 |
| FoodItem | type | 82 |
| MechanismEvidenceContext | type | 82 |
| Claim | type | 80 |
| DecisionCriterion | type | 79 |
| StudyResult | type | 78 |
| Activity | type | 77 |
| MediaWork | type | 76 |
| Study | type | 75 |
| LabelVersion | type | 73 |
| EntityImplementation | enum | 71 |
| SourceSnapshot | type | 69 |
| Adjudication | type | 67 |
| IngredientMaterial | type | 67 |
| Association | type | 66 |
| CaptureAttempt | type | 65 |
