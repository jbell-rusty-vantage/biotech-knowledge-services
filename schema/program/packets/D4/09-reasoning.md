# D4 — reasoning

Model stage (Wave 2) by A3, 2026-10-08. Inputs: `01-ecosystem.md`, `02-questions.md`, `_notes/research-notes.md`, `_notes/fixture-candidates.md`, the pinned W07/W08 fragments (19 node types, 49 relationship types), the kernel pattern (A1, `packets/K/09-reasoning.md`, `04-schema-proposal.graphql`, `domain-template.graphql`), the D5 targets and D13 frontiers vocabularies, sibling research notes (D1, D3, D5, D6, D7, D8) and the D2 model stage running in this worktree. Skills loaded: neo4j-modeling, neo4j-graphql, neo4j-cypher (query shapes), neo4j-gds (node similarity), neo4j-vector-index (SEARCH clause, hybrid rank fusion).

## Size estimate

- node types: **7** (budget 8) — Biomarker, Metric, LabTest, AssayVersion, AlgorithmVersion, ReferenceIntervalVersion, Device. Pinned W07 + W08: 19.
- relationship types: **13** (budget 14) — QUANTIFIES, HAS_ANALYTE, REFLECTS_MECHANISM, MEASURES_METRIC, PERFORMED_WITH_VERSION, INCLUDES_TEST, DELIVERS, PERFORMED_BY_LAB, OUTPUTS_METRIC, REQUIRES_INPUT_METRIC, DERIVED_FROM_ALGORITHM_VERSION, RUNS_ON_DEVICE, INTERVAL_FOR. Pinned W07 + W08: 49.
- from→to pairs: **17** (budget 35), computed as `packet-check` computes them: one per relationship field, union width per field (no unions here; an interface target counts 1). Four types carry two fields each (PERFORMED_WITH_VERSION, DELIVERS, INTERVAL_FOR, HAS_ANALYTE → 8 pairs) + 9 single-field types = 17. `schema-workspace map` (which expands interface targets per implementer) reports 154 pairs for kernel + stubs + D4 against 82 for kernel + stubs: the +72 are mostly the kernel's Subjectable/Entity edges re-counted for 7 new implementers, which the measurement below shows cost ≈ 0 in the executable (A1 lever experiment R1).
- widest union target: **none** (0 unions; the widest target is a single type). Relationship fields per type: LabTest 5, AlgorithmVersion 4, Biomarker 3, ReferenceIntervalVersion 2, AssayVersion 1, Metric 1, Device 1 (limit 12).
- enums: 22 (controlled vocabularies; four extend pinned enums: AlgorithmVersionBasis + CHANGE_EVENT_UNLABELED, ReferenceIntervalKind + VENDOR_TARGET, ReferenceIntervalDerivation + VENDOR_DEFINED; MeasurementField is new and replaces per-field ReportedStatus companions).
- packet-check (adversarial-review pass, 2026-10-08): `{"ok": true, "nodeTypes": 7, "relationshipTypes": 13, "pairs": 17, "questions": 35, "fixtures": 7}` against budget nodes 8 / rels 14 / pairs 35 (check stage: same, with 34 questions; Q-D4-26 added). The estimate above equals packet-check's counts.

### Measured executable cost (compile check)

**Adversarial-review pass (re-run 2026-10-08 ~22:10 EDT).** The kernel SDL had changed since the check stage (A1 `packets/K/04-schema-proposal.graphql` now sha256 `b2c2b1b0…d5c7`). Assembled in scratch `…\scratchpad\ft\D4\compile3\compile.graphql` (sha256 `a31264b1…807a`) = kernel + the same five stub `@node` types + a stub of D3's enum `SexScope` (now used by `ReferenceIntervalVersion.sex`) + this module (sha256 `0b2925a1…3024`). Same command (`BKS_SCHEMA_PATH=<C:/… compile.graphql> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <C:/… out>`), exit 0, ≈ 1 s build each (9–10 s wall with pnpm/tsx start-up); the output is 524 KB, not the pinned 55 MB schema, so the path resolved.

| SDL printed (adversarial-review pass) | bytes | lines | `grep -c '^input '` | build |
| --- | ---: | ---: | ---: | --- |
| kernel alone (`b2c2b1b0…`) | 322,904 | 6,466 | 179 | 1 s |
| kernel + 5 seam stubs + SexScope stub | 348,494 | 6,891 | 189 | 1 s |
| kernel + stubs + D4 (`out-compile.graphql`, sha256 `a98e4a25…e1de4`) | 524,197 | 10,457 | 293 | 1 s |
| **D4 marginal** (row 3 − row 2) | **175,703** | **3,566** | **104** | |

Against the check-stage measurement (+175,096 B / +3,559 lines / +104 inputs on kernel `790e7244…`): +607 bytes, same input count. The changes of this pass that print are the longer docstrings and `SexScope` replacing `PartitionSex` (one enum filter input either way; `SexScopeEnumScalarFilters` is shared with D3 in the assembled schema, so D4's true marginal there is 103 inputs). Projection: ≈ 2.9 % of the 6 MB ceiling and 2.6 % of the 4,000-input ceiling, unchanged. The check-stage table below is kept for the record.

**Check stage (superseded by the table above):**

Re-run in the check stage against the kernel as it is now (A1 `packets/K/04-schema-proposal.graphql`, model stage, sha256 `790e7244…8c71`; the model-stage measurement used the Wave 0 kernel `0ad41559…ea2c`). Assembled in scratch `…\scratchpad\ft\D4\compile2\compile.graphql` (sha256 `4d09f4a7…3ce9`) = kernel + the same five stub `@node` types for seam targets (ChemicalSubstance, Mechanism, MolecularEntity, Product, Organization; each implements Entity & Subjectable with the 7 Entity fields only; stubs never leave scratch) + this module (sha256 `ea1867e9…e5f9`). Printed from the worktree with `BKS_SCHEMA_PATH=<compile.graphql> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <out.graphql>` (deployed server options; `@neo4j/graphql` 7.6.3). Built first time, no errors; output byte-identical on a second run.

| SDL printed | bytes | lines | `grep -c '^input '` | build |
| --- | ---: | ---: | ---: | --- |
| kernel alone | 345,273 | 6,927 | 192 | 0 s (print-schema's own timer) |
| kernel + 5 seam stubs | 370,863 | 7,352 | 202 | 1 s |
| kernel + stubs + D4 (`out-compile.graphql`, sha256 `8eacf16b…b3b3`) | 545,959 | 10,911 | 306 | 1 s (4.3 s wall with pnpm/tsx start-up) |
| **D4 marginal** (row 3 − row 2) | **175,096** | **3,559** | **104** | |
| variant: the 4 recorded-only asserted fields on AssertedEdgeProperties (model-stage SDL) | 541,860 | 10,854 | 304 | 1 s |

Model stage on the Wave 0 kernel: marginal 171,042 B / 3,502 lines / 102 inputs. The +4.1 KB / +2 inputs now are `AssertedRecordedPropertiesWhere` and `AssertedRecordedPropertiesSort`: the kernel declares `AssertedRecordedProperties` but no kernel relationship uses it, so D4 is the first module in this compile to instantiate its filter inputs. In the assembled schema D6 and D8 already use the type (their SDLs, 2026-10-08), so those two inputs are shared and the switch is about neutral; it is kept because 00-DIRECTIVE rule 9 asks for recorded time only where no question reads valid time.

Per node type: ≈ 25.0 KB and ≈ 14.9 input types (model stage: 24.4 KB / 14.6; A1's template type: 17.7 KB / 12 inputs with three relationships). The by-type split that follows is the model-stage measurement (not re-split in the check stage). By type (bytes of printed types whose name starts with the type name): AlgorithmVersion 30.6 K, LabTest 27.7 K + the DELIVERS/INCLUDES fields, ReferenceIntervalVersion 24.0 K, Metric 18.6 K, AssayVersion 16.8 K, Biomarker 15.5 K (+ the MolecularEntity field), Device 12.4 K. Of the 102 new inputs, 23 are enum scalar filters (one per enum property type; MeasurementPlatform appears twice, as a scalar and as a list), 1 is DateScalarFilters, 5 are RelationshipFilters for the stub seam types, and the rest are the Where/Sort/ConnectionWhere/RelationshipFilters families per relationship field. Projection: at this cost the 7 D4 types are ≈ 2.9 % of the 6 MB executable ceiling and ≈ 2.6 % of the 4,000-input ceiling (check-stage numbers).

## Decisions (alternatives considered, what was cut and why)

### Node types

1. **Biomarker — kept.** (Adversarial-review pass: it carries no identifier schemes; CHEBI / UNIPROT / HGNC / MESH identify the analyte reached by HAS_ANALYTE, and one (scheme, value) must identify one entity for the kernel identifier lookup.) Alternative: fold into Metric (one node for "NAD+ in RBC µM" and "NAD+"). Rejected: four cross-domain paths need a referent that is not a measurement — D2 REFLECTS_MECHANISM, D1 HAS_ANALYTE, D3 OutcomeDefinition MEASURES (studies often name the biomarker, not the measurand), D5 OPERATIONALIZED_BY — and Q-D4-16 must list several Metrics (HbA1c %, HbA1c mmol/mol, DNAm logA1C) under one referent without merging their series. Research open question 5 (is Biomarker one node too many for composites such as "biological age"?) resolved as: keep; composites are BiomarkerKind COMPOSITE_AGING_INDEX ("pace of biological aging") with each clock's output a separate Metric, because Q-D4-04 groups clocks under that referent.
2. **Metric — kept, made the comparability anchor.** Alternatives: (a) LOINC code only (rejected: NLM's LOINC index has no term for RMSSD, epigenetic age or NAD+ as an analyte — BellLabs definitions must be first-class, `definitionSource` BELLLABS/VENDOR/PUBLICATION); (b) compartment on Biomarker (rejected: the same biomarker is measured in different compartments — that is the NR finding). Compartment (`systemOntologyId`, UBERON/CL) and in-definition method (`methodText`: RMSSD vs SDNN) are on Metric so "same Metric" is the default comparability test and the D2 compartment check is one equality. The LOINC code moved to a kernel Identifier (kernel rule: identifiers never as fields); LOINC parts stay as properties because questions filter on them.
3. **LabTest — kept, absorbs PanelDefinition.** Alternative: keep PanelDefinition as a versioned state node (pinned). Rejected: the only questions about panels (Q-D4-03 coverage, Q-D4-25 similarity) need composition as of D, which INCLUDES_TEST episodes give without a second type, and a panel is ordered exactly like a test. Price/offer stays D6.
4. **AssayVersion — kept, absorbs MeasurementMethod, Specimen, ReferenceSystem, instrument-as-text.** Alternatives: keep Specimen as a node (D2 asked whether D4 would; it would only if a question traversed specimen → stability / collection device — none does), keep MeasurementMethod (only filtered, never traversed: "all labs using method M" is a property filter), keep ToolOrInstrument edge (instrument model NOT_REPORTED on 9/9 coded artifacts; a typed edge would be empty). Identity = payloadHash including the snapshot digest whenever an identity field is NOT_REPORTED (pinned rule "two NOT_REPORTED versions never merge", kept).
5. **AlgorithmVersion — kept, absorbs Algorithm (family) and FirmwareVersion.** Alternative: keep the Algorithm family node with VERSION_OF_ALGORITHM. Rejected: every family question filters or groups (`familyKey`), none traverses from the family to something else. FirmwareVersion is the same thing (a fixed software state that produces values) with `algorithmKind FIRMWARE`; WHOOP's unlabeled 2026 heart-rate changes need `versionBasis CHANGE_EVENT_UNLABELED` pinned by `versionPinnedAt` (research finding 5). `realization` (PUBLICATION_REFERENCE / VENDOR_IMPLEMENTATION / DEVICE_SOFTWARE / SERVICE_ENDPOINT) makes "vendor DunedinPACE™ ≠ published DunedinPACE" (Q-D4-06) a default rather than an assertion.
6. **ReferenceIntervalVersion — kept, absorbs ReferenceRange.** Alternative: intervals as properties of AssayVersion (list of strings). Rejected: CQ-DX-06 filters by kind, partition and effective period, and one Labcorp page yields four intervals for one (assay version, metric) pair; Q-D4-12 must distinguish a vendor "optimal" band (VENDOR_TARGET, VENDOR_DEFINED) from a reference interval. The pinned decision "ReferenceRange is a projection of ReferenceIntervalVersion" (brief's open question) resolved: no separate type; a legacy range is a ReferenceIntervalVersion with derivation NOT_REPORTED and no INTERVAL_FOR → AssayVersion edge.
7. **Device — kept, absorbs ToolOrInstrument, Modality, Sensor, TechnologyPlatform.** A device or instrument model as the thing software runs on and regulators act on (D8 attaches clearances and recalls). Alternative: let D6 Product carry it (rejected: one model has several products and four 510(k)s; recall identity is model + REF + UDI-DI). Modality/Sensor/Platform are enum lists: no question traverses from a modality.
8. **ComparabilityAssessment — moved to the kernel** (`Assessment`, assessmentKind COMPARABILITY since the kernel model stage, subkind `D4.comparability`, verdict in `conclusionCode`), per A1's ownership map (equivalence assessments are kernel; kind values and questions belong to the domain). Its targets are the kernel ASSESSES → Subjectable edge, so the pinned COMPARES relationship and ComparableVersionTarget union disappear. The model stage's cost (no typed verdict field, interim `assessmentSubkind = "D4.comparability:<VERDICT>"`) is gone: A1 answered D4 #1 with AssessmentKind COMPARABILITY and the shared slot `conclusionCode` (K 09 M9, change 4); patterns, seams and fixtures were moved to it in the check stage.
9. **ReportedStatus → `notReported: [MeasurementField!]`.** The research recommendation was a ReportedStatus companion per identity field (≈ 18 extra properties across types). Chosen instead: one enum-list property per type naming the fields the source was read for and did not report (null + listed = not reported; null + not listed = not yet extracted). Same information, one property, one filter (`notReported: {includes: INSTRUMENT_MODEL}`), and every NOT_REPORTED stays cited through a `FIELD_NOT_REPORTED` Assertion (03, TRACE-NODE; a kernel-wide predicate convention since the K model stage, accepted from D4 #16). Risk: NOT_APPLICABLE is not distinguished from NOT_REPORTED (accepted: no question asks for it).

### Relationship types

- **QUANTIFIES** (Metric → Biomarker, structural): the hinge of every path. Alternative: Biomarker as a property of Metric (`biomarkerUid`) — rejected, D3/D5/D2 seams traverse into Biomarker and back out to tests.
- **HAS_ANALYTE** (Biomarker → D1 ChemicalSubstance | D2 MolecularEntity, structural, two fields): first drafted as one field to D1 with protein analytes as identifiers; changed when the D2 model stage (same worktree) published Q-D2-03/04/22 patterns that traverse `Biomarker -HAS_ANALYTE-> x -PARTICIPATES_IN-> Mechanism` for both kinds. Two fields of one type instead of a 2-member union (same pairs, no union type).
- **REFLECTS_MECHANISM** (Biomarker → D2 Mechanism, asserted): D2 proposed structural/curated; made asserted because "NAAD is a sensitive marker of NR utilization" is a citable, contestable claim with an asserter and a locator. Recorded-only.
- **MEASURES_METRIC** (LabTest → Metric, asserted, episode): device metrics deliberately do not use it — every device value is an algorithm output (AlgorithmVersion → OUTPUTS_METRIC), even when the algorithm is unlabeled. One path for every computed value instead of two.
- **PERFORMED_WITH_VERSION** (LabTest → AssayVersion | AlgorithmVersion, asserted, episode, two fields): replaces pinned PERFORMED_WITH_ASSAY_VERSION and adds the algorithm side (TruAge report → vendor DunedinPACE™). Alternative: a separate PERFORMED_WITH_ALGORITHM_VERSION type (+1 type, same pairs) — rejected; the episode semantics ("this test used this version from…to") are identical.
- **INCLUDES_TEST** (LabTest → LabTest, asserted, episode): panel composition versions.
- **DELIVERS** (D6 Product → LabTest | Device, asserted, declared on the D4 side with direction IN): D6's research notes cut DELIVERS_LABTEST and EMBODIES_MODEL as "D4/D5 device and service semantics"; without it nothing joins what is sold to what it measures (Q-D4-13 test-and-sell, Q-D4-24 price comparisons, Q-D4-01 "a test someone can buy"). Declared on LabTest/Device so the D6 Product hub gains no field. D6 lists both seams as consumed (resolved, 11 #8). Adversarial-review pass: it is also the free route from D8 regulatory records (which attach to Product) to a device or test, so the D8 union change requested in the check stage is withdrawn.
- **PERFORMED_BY_LAB** (AssayVersion → D7 Organization, structural): pinned ASSAY_OPERATED_BY renamed; identity-bearing. Adversarial-review pass: the only fixture row (hba1c d05) rested on a synthetic sample report whose lab block is a 2018 placeholder; it is now an organization-level curator inference from the test menu, with PERFORMING_LAB kept in `notReported` (11 #42).
- **OUTPUTS_METRIC**, **REQUIRES_INPUT_METRIC** (AlgorithmVersion → Metric, structural): definitional parts of a version; an input set that changes is a new version. CpG-level inputs stay a count (`inputFeatureCount`), never 173 nodes. Adversarial-review pass: a reviewer showed REQUIRES_INPUT_METRIC only filled a display column (CQ-DX-04, CQ-DX-07) while `REPORTS_INPUT_SET` already held the fact. Two options: demote it to a predicate (13 → 12 types) or give it a question that traverses it. Chosen: Q-D4-26 (value 2, harm) — which scores inherit a HARM signal on one of their inputs — traverses it in reverse and filters on it; the fixture shows InnerAge 2.0 inheriting the HbF interference risk of HbA1c. The type stays (13/14), and the question also restores an honest harm share (13/35 after Q-D4-23 was retagged neutral).
- **DERIVED_FROM_ALGORITHM_VERSION** (asserted, recorded-only): vendor → publication, successor → predecessor. Numerical sameness is an Assessment, not this edge.
- **RUNS_ON_DEVICE** (AlgorithmVersion → Device, asserted, episode): which software state produced a value on date D.
- **INTERVAL_FOR** (ReferenceIntervalVersion → AssayVersion | Metric, structural, two fields): merges FOR_ASSAY_VERSION, FOR_METRIC, HAS_REFERENCE_RANGE. Alternative: keep only → AssayVersion and infer the metric from the LabTest (rejected: one assay version can report two metrics, NGSP % and IFCC mmol/mol).

### Cuts (from the pinned 19 types / 49 relationship types)

- 12 node types merged or moved (see `06-node-register.yaml mergedInto`); DiagnosticResult interface deferred to the private-store contract.
- 36 pinned relationship types cut or merged, one line each in `05-relationship-register.yaml deferred`; 13 assertion predicates kept predicate-only with the question that would promote each.
- Model-stage candidates cut: OFFERED_BY (LabTest → Organization; issuer reachable through D6 Product or the LAB_TEST_CODE identifier issuer — this freed the 14th type slot), PANEL_SIMILAR_TO (Q-D4-25 computed at query time with GDS, answer kind changed to retrieved in 02), SUCCEEDS_ASSAY_VERSION (episode order), Device → Metric MEASURES_METRIC, AssayVersion → Device (instrument).
- No GraphQL `@fulltext`/`@vector` directives: the D4 search indexes (fulltext `d4_measure_names`, vector `metric_embedding`) are Cypher-side only (Q-D4-22 runs in the retrieval service, not through generated GraphQL), so they add nothing to the executable. The embedding property is DB-only, not in the SDL.
- No inverse relationship fields (e.g. `Metric.measuredBy`): GraphQL reads them as filters from the declaring side (`labTests(where: {metrics: {some: {uid: {eq: $m}}}})`); each inverse field would cost ≈ 15–20 KB.

## Bitemporal decision per edge

| relationship | temporal | why |
| --- | --- | --- |
| MEASURES_METRIC | **episode** | labs remap result codes to LOINC; a historic result's meaning depends on the mapping valid at its date (CQ-DX-01) |
| PERFORMED_WITH_VERSION (both fields) | **episode** | method / kit / instrument / algorithm changes split trends (Q-D4-23); "version as of report date" (CQ-DX-01, CQ-DX-06, Q-D4-04) |
| INCLUDES_TEST | **episode** | panel composition versions (Q-D4-03) |
| RUNS_ON_DEVICE | **episode** | which software state produced a wearable/CGM value on date D (CQ-DX-09); WHOOP 2026-02-25 and 2026-07-06 changes |
| REFLECTS_MECHANISM, DERIVED_FROM_ALGORITHM_VERSION, DELIVERS | recorded-only (asserted, kernel `AssertedRecordedProperties` since the check stage) | no question filters on valid time; supersession by recorded time; the authorizing Assertion keeps any valid time the source states |
| QUANTIFIES, HAS_ANALYTE, PERFORMED_BY_LAB, OUTPUTS_METRIC, REQUIRES_INPUT_METRIC, INTERVAL_FOR | recorded-only (structural) | definitional or part of an insert-only record's identity; a change makes a new record, not a new episode |

Source-stated dates that are payload, not query validity: `ReferenceIntervalVersion.effectiveFrom/To`, `AlgorithmVersion.versionPinnedAt` (pinned rule kept).

## Coordination record

- **D2 (same worktree, model stage in parallel).** The compound → mechanism → biomarker → test path is one pattern written on both sides (D4 03#Q-D4-01, D2 03#Q-D2-03): D2 hop 1 `AFFECTS_MECHANISM` (derived), D4 hops 2–4 `REFLECTS_MECHANISM` / `HAS_ANALYTE`, `QUANTIFIES`, `MEASURES_METRIC`, `PERFORMED_WITH_VERSION`; compartment equality `Metric.systemOntologyId = MechanismEvidenceContext.compartmentOntologyId` (same UBERON/CL convention). Under FC-7 the NR path ends in NOT_COMPARABLE: the trial measured NAD+ in PBMCs by LC-MS, the consumer test measures red blood cells. Name drift to reconcile at synthesis (D2 files are not edited from here): D2's 03 calls the episode edge `PERFORMED_WITH_ASSAY_VERSION` (now `PERFORMED_WITH_VERSION`) and the GraphQL field `reflectsMechanism` (now `reflectsMechanisms`).
- **D1** names its compound type `ChemicalSubstance` and planned `Biomarker -HAS_ANALYTE-> ChemicalSubstance` (matches). **D3** plans `OutcomeDefinition -MEASURES-> Outcome | Biomarker` (consumed). **D5** `Target -OPERATIONALIZED_BY-> Outcome | Biomarker` (consumed). **D6** cut DELIVERS_LABTEST / EMBODIES_MODEL (D4 now declares DELIVERS). **D7** Organization (PERFORMED_BY_LAB target). **D8** will attach regulatory records to Device (consumed). **D13**: clocks are measures, not frontiers (no edge). No sibling SDL declares any of the seven D4 type names (checked A1, A2, A4–A8 worktrees at 17:20).

### Coordination record, check stage (2026-10-08, sibling SDLs read 18:09–18:14)

- **D2**: its check stage wrote the joint D2 ∪ D4 pattern in D2 03 § Q-D2-03 (both hop-2 branches, D4 hops 3–4); D4 03 § Q-D4-01 now points at it and names the one change (hop 3 through D3 `MEASURES → Metric`). D2's line saying REFLECTS_MECHANISM is an AssertedEdgeProperties episode is stale after this stage's switch (D2 files not edited from here; 11 #33).
- **D3** SDL: `OutcomeDefinition.measures` → `Metric | Biomarker | Outcome | Condition` — D4's request (11 #9) accepted; `ADMINISTERS` → D4.Device declared in D3 seams. Both added to 10-seams as consumed.
- **D5** SDL: `OPERATIONALIZED_BY` → `Biomarker | Metric | Outcome`; `STEP_USES` → Metric. Added to 10-seams; Q-D4-17 pattern reads both target kinds.
- **D6** SDL: no DELIVERS, no D4 mention in its seams or open questions (11 #8 still open). *Adversarial-review pass: superseded; D6 10-seams now lists both DELIVERS seams as consumed (11 #8 resolved).* Seller path for Q-D4-12/13 rewritten to D6's real names (Product → ProductVariant → Package ← MerchantListing → Offer → SELLER_OF_RECORD → Organization).
- **D8** SDL: RegulatoryRecord `CONCERNS` union has no Device; D8 OQ-D8-29 measured adding Device (+1 pair, union at cap 6) and LabTest via the lab Organization. 10-seams rows now carry D8's names with `status: requested`; D4's `noninvasive-glucose-cgm-recall` is the device fixture D8 asked for. *Adversarial-review pass: superseded; the requested seams are withdrawn and D4 reaches D8 records through the D6 Product (11 #12).*
- **K** (model stage): `AssertedRecordedProperties`, `COMPARABILITY` + `conclusionCode`, `FIELD_NOT_REPORTED`, identifier schemes LAB_TEST_CODE / CPT / UDI_DI / FDA_510K / FDA_PRODUCT_CODE added as `requested` — all adopted here.

## Registered assessment vocabulary (conclusionCode)

K asks each domain to register its subkind vocabulary in 09 (K 09 item 8). Same table in `10-seams.yaml registeredValues`.

| assessmentSubkind | assessmentKind | conclusionCode values | questions |
| --- | --- | --- | --- |
| D4.comparability | COMPARABILITY | COMPARABLE, COMPARABLE_WITH_CONVERSION, NOT_COMPARABLE, UNKNOWN | CQ-DX-03, CQ-AX-21, Q-D4-02 |
| D4.algorithm-equivalence | EQUIVALENCE | SAME, DISTINCT, UNRESOLVED | Q-D4-06 |
| D4.change-detectability | QUALITY | CHANGE_DETECTABLE, NOT_ESTABLISHED, NO_RELIABILITY_SOURCE | CQ-DX-05, Q-D4-05 |
| D4.measurement-name-resolution | RESOLUTION | RESOLVED, CANDIDATE, AMBIGUOUS, NO_MATCH (CANDIDATE added and used in the adversarial-review pass: one assessment per candidate pair, consumer-panel s01–s08) | Q-D4-22, Q-D4-26 |
| D4.bio-age-claim-disconfirmation | EVIDENCE_SYNTHESIS | none: kernel `verdict` (SemanticVerdict) | Q-D4-15 |
| D4.unauthorized-measurement, D4.measurement-error-recall, D4.interference-risk | SAFETY_SIGNAL (effectDirection HARM) | none: kernel `verdict` where a claim is judged | Q-D4-08, Q-D4-09, Q-D4-11, Q-D4-18, Q-D4-26 |
| D4.test-and-sell | CONFLICT_RELEVANCE (effectDirection HARM) | D7's relevance-level vocabulary | Q-D4-12, Q-D4-13 |

## Check stage (A3, 2026-10-08): what the audit changed

- `05`: question lists trimmed where the cited 03 section did not traverse the type (REFLECTS_MECHANISM −Q-D4-02, MEASURES_METRIC −Q-D4-21, DELIVERS −Q-D4-17, REQUIRES_INPUT_METRIC −Q-D4-16, INTERVAL_FOR −Q-D4-02; same in 04 docstrings and 10); 03 sections CQ-DX-03, CQ-DX-04, Q-D4-06, Q-D4-24 now traverse PERFORMED_BY_LAB / PERFORMED_WITH_VERSION / DELIVERS, which their register entries cite.
- `07-fixtures/hba1c-two-labs-interference`: asserters added to INTERVAL_FOR rows d06–d11 (Labcorp, Quest); d17–d20 add the `metrics` side for the three Labcorp limits and the Quest range (SDL cardinality exactly_one); d21 exercises `Biomarker.analyteEntities` (HAS_ANALYTE → D2 MolecularEntity "hemoglobin A1c", cited to the LOINC component), the one relationship field no fixture exercised. Regenerated with the fixtures-stage generator (deterministic: a re-run on unchanged specs is byte-identical); 122/122 locators re-select, 7/7 intents valid.
- All fixtures: comparability and other verdicts moved from `assessmentSubkind "<subkind>:<CODE>"` + `verdictValue` to `conclusionCode`; `field_not_reported` → `FIELD_NOT_REPORTED`.
- 03 patterns: `RECOMMENDS_RETEST_INTERVAL` and `SETS_REFERENCE_RANGE` read through HAS_SUBJECT (the register's subject) and ASSERTED_BY (the issuer), not HAS_OBJECT.
- External ids no longer cited as if they were D4 rows: biotech-meta DX-08 (06 deferred DiagnosticResult) and ST-03 (02 notes) are named in prose.

## Budget excess

None. No element exceeds a budget (7/8 node types, 13/14 relationship types, 17/35 pairs, 0 unions, max 5 relationship fields per type).

## Risks

1. **Comparability answers will mostly be UNKNOWN.** With instrument, software and interval derivation never reported on 9/9 coded artifacts, CQ-DX-03 is honest but rarely decisive. The model makes the gap visible (notReported, cited) but cannot fill it; buying tests or vendor documentation requests are the only remedy (owner decision, 11).
2. **Seams still to be confirmed by their owners** (rewritten in the adversarial-review pass). D6 has adopted DELIVERS (its 10-seams lists both seams as consumed). D8 needs no change: its unions already admit Product, and Q-D4-08/09/10/18 now reach a device or test through the Product that DELIVERS it (the check-stage request for a Device member, and its "cheapest route" claim, are withdrawn). Open: D10 still names `D4.PanelDefinition`, claims Q-D4-25 as a stored Association and omits `D4.LabTest` from ReportItem targets (11 #38); D2 lists LOINC on Outcome (11 #37). (The model-stage risk "verdict encoded in a string" is closed by the kernel's `conclusionCode`.)
3. **Metric proliferation.** BellLabs-defined Metrics (no LOINC) can multiply per vendor field; identity relies on (issuer, verbatim name, unit) and curation. Q-D4-22 resolution quality depends on the fulltext/vector index and RESOLUTION assessments.
4. **Seam names not final.** ChemicalSubstance, Mechanism, MolecularEntity, Product, Organization, OutcomeDefinition, Target, D3 SexScope, D10 ReportItem and D8 record types are taken from the sibling SDLs of 2026-10-08; a rename there breaks D4 patterns until synthesis.
5. **Unlabeled algorithm changes depend on vendor changelogs and forums.** RUNS_ON_DEVICE episodes start at announced dates; silent changes are invisible, and community-reported firmware numbers need an admissibility rule (K/D9).

## With twice the budget

- A typed `ComparabilityAssessment` subtype with dimension properties (method, calibration, specimen, unit, conversion rule) instead of a kernel Assessment + string convention.
- `Specimen` as a node with stability, tube and collection-device relationships (Q-D4-19 at scale) and `MeasurementMethod` with method-class interference records (`INTERFERED_BY` → D2 Condition) so Q-D4-11 becomes a traversal.
- `AssayVersion → Device` (RUNS_ON_INSTRUMENT) so lab-analyzer recalls reach lab results.
- A stored, method-versioned `PANEL_SIMILAR_TO` projection and a `CLAIMS_TO_MEASURE` derived projection for catalog-scale harm screening (Q-D4-08).
- `OFFERED_BY` for test issuers that sell no D6 Product.

## Adversarial-review pass (A3, 2026-10-08): what changed and why

Two reviewers (evidence integrity, model discipline) filed 12 + 15 findings; each was verified against the captures (re-fetched where the finding was about a source) or the sibling SDLs. Per-finding outcomes are in `RUNLOG.md` ("Adversarial review"). Model changes:

- **Kernel discipline.** Biomarker identifier schemes → none (11 #37). Every CLAIM-kind fixture assertion links to a kernel `Claim` through `occurrenceOf` (b03, b06, g28); source facts were re-kinded (d13/d14 RELATIONSHIP, e13 FIELD); FDA statements about the glucose Claim use the kernel `RATES_CLAIM` instead of a D4 predicate (REGULATORY_STATEMENT withdrawn). Predicate values are SCREAMING_SNAKE like the kernel and siblings. 03 uses `adj.verdict` (kernel field), D8 `LegalStatus`, and AS-OF for "current" in Q-D4-25.
- **Seams.** D8 reached through the D6 Product (no union change); D10 comparison rows through `ReportItem` (Q-D4-24 now retrieved by default, D10's proposal accepted); D5 `INTENDED_FOR_TARGET` subjects respected (LabTest through its Product); D3 `SexScope` and `minAgeYears` / `maxAgeYears` adopted (D4 `PartitionSex` removed); D5 Target → Metric rule written (11 #11).
- **Questions.** Q-D4-26 added (harm, value 2; earns REQUIRES_INPUT_METRIC); Q-D4-23 retagged neutral; harm share 13/35 = 37 %.
- **Evidence.** hba1c d05 is a curator inference (sample report lab block is a placeholder); d02 cites the gated LOINC section; the Labcorp assay records its cited reagent kit (Tina Quant Gen.3 insert, 2017-06) and the comparability assessment weighs it against NGSP's Gen. 3 / Gen. IV listings; WHOOP's RMSSD definition now cites WHOOP's OpenAPI (JSON_POINTER) rather than a field name; WHOOP heart-rate episodes say "date stated, device attachment inferred"; f03 dated 2025-05-20 (DAY); Oura's version is recorded as a "Sleep Staging" algorithm with the HRV attribution marked as inference; the clock-noise fixture is a reliability gap, not a disconfirmation (Higgins-Chen never evaluates DunedinPACE; its noise data QUALIFY), and records the vendor's "*Based on the last 2-3 months".
- Counts unchanged: 7 node types, 13 relationship types, 17 pairs, 0 unions; questions 35; fixtures 7 (132 locators, 96 assertions, 18 assessments).
