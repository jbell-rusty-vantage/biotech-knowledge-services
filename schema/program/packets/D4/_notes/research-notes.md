# D4 — research notes for the model stage (A3, 2026-10-08)

Inputs: `01-ecosystem.md` (sources S1–S43), `02-questions.md` (34 rows), `_notes/fixture-candidates.md` (FC-1…FC-9), pinned W07/W08 cards, CQ-DX-01..09, OPEN-QUESTIONS Priority-1 diagnostics, and the D2 packet's research notes in this worktree (same agent, parallel stage). Kernel pattern (A1) not yet published at time of writing; subject/object edges below are written against the placeholder `Subjectable`.

## 1. What the evidence says (the eight findings that should drive the model)

1. **"Not reported" is the normal case.** On 9 coded public artifacts, instrument model, software/algorithm version and reference-interval derivation were never reported; method principle usually was (01-ecosystem, coded sample). Every identity-relevant field needs a `ReportedStatus` companion (`REPORTED / NOT_REPORTED / NOT_APPLICABLE`), and CQ-DX-03 must default to `UNKNOWN`. Two NOT_REPORTED assay versions never merge (pinned rule — keep it).
2. **One biomarker, several metrics, different result kinds.** HbA1c is measured as LOINC 4548-4 (NGSP %, mass fraction) [S1], reported by IFCC protocol as 59261-8 (mmol/mol) [S3], and *inferred* as "DNAm logA1C" inside GrimAge2 [S20]; CRP and IL-6 likewise appear as DNAm surrogates in TruAge [S24][S25]; Oura PWV is "derived from vascular age" [S35]. `Biomarker ← QUANTIFIES ← Metric` with `Metric.metricKind` and a default `resultKind` keeps them apart (CQ-DX-02, Q-D4-16).
3. **Consumer longevity metrics mostly have no LOINC code.** No LOINC hit for RMSSD, "epigenetic", "DNA methylation age" or NAD+ as an analyte in the NLM index [S3]. `Metric` must support BellLabs definitions (`definitionText` verbatim + UCUM unit + `unitStatus`) as a first-class path, with LOINC as an optional identifier.
4. **Compartment decides comparability.** NAD+ "measurable in … PBMCs, but undetectable in plasma and urine" in the NR trial [S31]; the consumer test measures "inside your red blood cells" [S30]. Compartment belongs on the **Metric** (LOINC "system" — Bld, Ser/Plas) and the specimen on the **AssayVersion**; both need ontology ids (UBERON/CL) so D2 can compare a mechanism step's compartment with a biomarker measurement's compartment by equality (D2 asked for this; see §6).
5. **Algorithms change without versions.** WHOOP changed its heart-rate algorithm twice in 2026 without labels and says Strain "may shift" [S39]; InsideTracker says its inputs "may" change [S28]; vendors sell "DunedinPACE™" with no version [S24][S25]. Only Oura stamps `sleep_algorithm_version` per record [S35]. `AlgorithmVersion` must allow an unlabeled version pinned by change date or retrieval date (pinned `SERVICE_ENDPOINT_UNVERSIONED`; add `CHANGE_EVENT_UNLABELED`).
6. **Reliability is the disconfirmation lever.** Replicate deviations up to 8.6 years for CpG clocks [S19] vs vendor advice to "retest every 3 months" [S25]. Reliability is a located assertion on an AlgorithmVersion (or AssayVersion) that the comparability/change assessment consumes (CQ-DX-05, Q-D4-05, Q-D4-15) — not a property of the clock.
7. **Device = instrument here, product in D6, regulated object in D8.** One device model (Stelo) has four 510(k) clearances and two product codes [S12]; recalls attach to model + REF + UDI-DI + K number [S13]. D4 needs the model as the thing that *produces* a metric (via an algorithm version); everything regulatory is a seam.
8. **The harm cases are concrete and public.** FDA's non-invasive glucose warning [S11]; CGM sensor recall for "incorrect low glucose results" [S13]; HbA1c method interference by HbF/variants [S5][S8]; test-and-sell bundles with vendor-defined "optimal" ranges [S30]. Each is a located assertion or regulator record attached to Metric / AssayVersion / Device — no "good/bad" property anywhere.

## 2. Candidate node types (target ≤ 8; argue each)

| type | verdict | questions that filter/join/traverse through it | notes |
| --- | --- | --- | --- |
| `Biomarker` | keep | Q-D4-01, Q-D4-16, CQ-DX-01, Q-D4-03 (coverage), Q-D4-17 | Biological referent (NAD+, HbA1c, IgG glycan profile, "pace of aging"?). Identity: curated uid; analyte identifiers (ChEBI / UniProt / HGNC) as properties unless a question traverses to D1/D2 (see HAS_ANALYTE below). `biomarkerKind` enum (METABOLITE, PROTEIN, PROTEIN_MODIFICATION, CELL_TYPE, DNA_METHYLATION_PATTERN, GLYCAN_PROFILE, PHYSIOLOGICAL_SIGNAL, COMPOSITE_AGING_INDEX). Strip all legacy display properties. |
| `Metric` | keep | CQ-DX-01/02/04, Q-D4-07, Q-D4-16, Q-D4-21, Q-D4-22, Q-D4-17 | Measurand or feature definition. Identity: LOINC code when one exists, else `definitionKey` (issuer + verbatim name + unit). Properties: `metricKind` enum (MEASURAND, ALGORITHM_OUTPUT, DEVICE_ESTIMATE, CALCULATED_QUANTITY, MODEL_FEATURE), `defaultResultKind` (MEASURED/CALCULATED/INFERRED), `loincCode`, LOINC parts (`propertyKind`, `systemKind`, `scaleKind`, `timeKind`), `systemOntologyId` (UBERON/CL, new — D2 seam), `canonicalUnitCode` + `unitStatus`, `definitionText`, `methodText` (e.g. "RMSSD" vs "SDNN"; NOT_REPORTED for Oura `average_hrv`), searchText/embedding for Q-D4-22. Vector index candidate. |
| `LabTest` | keep (absorbs `PanelDefinition`) | CQ-DX-01, Q-D4-03, Q-D4-12/13, Q-D4-19, Q-D4-25, Q-D4-01 | The orderable/purchasable test as an issuer offers it (Labcorp 001453, Quest 496, Jinfiniti iNAD, TruAge). `testKind` enum (SINGLE, PANEL, ALGORITHM_REPORT). Panel composition = self-edge with an episode (replaces PanelDefinition versions). Properties: `localTestCode`, `issuerUid`, `cptCode`, `collectionMode` enum (VENIPUNCTURE, CAPILLARY_FINGERPRICK, DRIED_BLOOD_SPOT, SALIVA, URINE, AT_HOME_KIT…), pre-analytical text (`stabilityText`, `rejectionText`) for Q-D4-19, `disclaimerText` (Q-D4-18). Price and offers are D6. |
| `AssayVersion` | keep (absorbs MeasurementMethod, Specimen, ReferenceSystem, ToolOrInstrument-as-text, FirmwareVersion-for-lab-analyzers) | CQ-DX-01/03/06, Q-D4-02, Q-D4-11, Q-D4-23, CQ-AX-21 | How one lab ran one procedure. Properties with ReportedStatus each: `methodPrinciple` enum (IMMUNOASSAY_TURBIDIMETRIC, IMMUNOASSAY_OTHER, ION_EXCHANGE_HPLC, BORONATE_AFFINITY, ENZYMATIC, CAPILLARY_ELECTROPHORESIS, LC_MS, DNA_METHYLATION_ARRAY, DNA_METHYLATION_SEQUENCING, GLYCAN_CHROMATOGRAPHY, OTHER, NOT_REPORTED) + `methodText`; `instrumentModelText`; `kitText` (e.g. "Tina-quant HbA1c Gen.3"); `softwareVersion`; `platformKind` (ILLUMINA_450K, ILLUMINA_EPIC_V1, ILLUMINA_EPIC_V2, …); `specimenKinds` (enum list) + `specimenOntologyIds`; `calibrationTraceability` enum (NGSP, IFCC_RMP, JDS_JSCC, NONE_STATED) + `traceabilityCertificateText`; `reportedUnitCode`. Identity = payloadHash (pinned rule). |
| `AlgorithmVersion` | keep (absorbs `Algorithm` family as properties, and `FirmwareVersion`) | CQ-DX-02/04/05/07/09, Q-D4-04/06/14/15/20/23 | One realization of a clock, risk score, wearable score or signal-processing/firmware build. `algorithmFamily` (+ `familyKey`) replaces the Algorithm node (questions filter/group by family; none traverses *from* the family). `algorithmKind` enum (EPIGENETIC_CLOCK, BLOOD_PANEL_CLOCK, GLYCAN_CLOCK, RISK_SCORE, WEARABLE_SCORE, SIGNAL_PROCESSING, FIRMWARE). `versionLabel`, `versionBasis` (pinned enum + new CHANGE_EVENT_UNLABELED), `outputKind`, `outputUnitCode`, `inputPlatformKind`, `inputFeatureCount` (173 for DunedinPACE [S18]), `trainingPopulationText`, `retrievedAt`, `componentLabel` (firmware component), `changeAnnouncedAt`. |
| `ReferenceIntervalVersion` | keep (absorbs legacy `ReferenceRange`) | CQ-DX-06, Q-D4-12 | Pinned design is right (kind, derivation, partition, bounds, verbatim `intervalText`). Add `intervalKind` value VENDOR_TARGET (Jinfiniti "Optimal 40–100 μM" [S30]); derivation NOT_REPORTED is the common case. A Labcorp page yields four RIVs from one list (interval, two decision limits, a glycemic target) [S5]. Metric reference can become a property (`metricUid`) if FOR_METRIC is cut. |
| `Device` | keep (absorbs ToolOrInstrument, Sensor, Modality, TechnologyPlatform) | CQ-DX-09, Q-D4-07, Q-D4-08/09/10, Q-D4-17 | A device or instrument MODEL as its maker designates it (Oura Ring Gen3, WHOOP MG, Dexcom G7, Stelo, FreeStyle Libre 3 sensor, Roche cobas c513, Illumina iScan). `deviceKind` enum (WEARABLE_RING, WEARABLE_WRIST, CGM, LAB_ANALYZER, ARRAY_SCANNER, HOME_METER, OTHER); `sensingModalities` enum list (PPG, ECG, ACCELEROMETRY, SKIN_TEMPERATURE, INTERSTITIAL_GLUCOSE_ELECTROCHEMICAL, BIOIMPEDANCE …); `deviceFamily`; `generationLabel`. Regulatory identity (K numbers, product codes, UDI-DI) stays with D8 records; product/offer with D6. |
| `ComparabilityAssessment` | keep **or** move to the kernel assessment archetype (contest, see §6) | CQ-DX-03/05, CQ-AX-21, Q-D4-02, Q-D4-05, Q-D4-15 | The pinned node is sound (verdict lattice, dimensions, conversion rule, replicateNoiseBasis). If A1's kernel publishes a generic Assessment with `assessmentKind`, D4 contributes kind COMPARABILITY, the dimension properties and the `COMPARES` edge; D4 node count drops to 7. |

Deferred / merged (for `06-node-register.yaml`): `Algorithm` → AlgorithmVersion.family props; `PanelDefinition` → LabTest(testKind PANEL) + composition episodes; `MeasurementMethod` → enum + text on AssayVersion; `Specimen` → enum + ontology ids (no question traverses a specimen node; D2 needs equality on an ontology id, not a node); `ReferenceSystem` → enum + certificate text (NGSP/IFCC are a handful of values; certification lists are sources, not nodes); `ReferenceRange` → ReferenceIntervalVersion (derivation NOT_REPORTED, partition text); `TechnologyPlatform` → `platformKind` enum; `ToolOrInstrument` → Device(deviceKind LAB_ANALYZER/ARRAY_SCANNER) or `instrumentModelText`; `Modality`, `Sensor` → enum lists on Device; `FirmwareVersion` → AlgorithmVersion(algorithmKind FIRMWARE, componentLabel). `DiagnosticResult` interface → stays a private-store contract document only (CQ-DX-08; no personal results in the shared graph).

What would reverse a merge: a question that traverses *from* a specimen, method, platform or algorithm family to something else (e.g. "all labs using method M" — currently answered by a property filter on AssayVersion); a second identifier scheme per instrument model that D8 needs to join on (then ToolOrInstrument/Device identity matters more).

## 3. Candidate relationship types (target ≤ 14)

| relationship | class | from → to | questions | populated by | fixture | temporal |
| --- | --- | --- | --- | --- | --- | --- |
| QUANTIFIES | structural | Metric → Biomarker | CQ-DX-01, Q-D4-01, Q-D4-16 | curation; LOINC component parts [S1][S2]; publications | FC-1, FC-3, FC-7 | recorded-only |
| MEASURES_METRIC | asserted | LabTest → Metric | CQ-DX-01, Q-D4-03, Q-D4-21 | lab LOINC maps [S5]; vendor pages [S24][S30] | FC-1, FC-7 | episode (labs remap) |
| PERFORMED_WITH_ASSAY_VERSION | asserted | LabTest → AssayVersion | CQ-DX-01, CQ-DX-03, Q-D4-23 | lab test pages, package-insert footnotes, method-change notices | FC-1, FC-2 | **episode** (method changes split trends) |
| INCLUDES_TEST | structural | LabTest(panel) → LabTest | Q-D4-03, Q-D4-25 | vendor panel pages [S29][S28] | — (needs one) | **episode** (panel composition versions) |
| FOR_ASSAY_VERSION | structural | ReferenceIntervalVersion → AssayVersion | CQ-DX-06, Q-D4-12 | lab pages / reports [S5][S6][S7] | FC-1, FC-7 | recorded-only (RIV is itself versioned) |
| OUTPUTS_METRIC | structural | AlgorithmVersion → Metric | CQ-DX-02, CQ-DX-04, Q-D4-16 | publications [S18][S20]; APIs [S35][S38] | FC-3, FC-6 | recorded-only |
| REQUIRES_INPUT_METRIC | asserted | AlgorithmVersion → Metric | CQ-DX-04, Q-D4-16, CQ-DX-07 | publications (GrimAge2 components [S20]); InnerAge biomarker list [S28] | FC-3 | recorded-only |
| DERIVED_FROM_ALGORITHM_VERSION | asserted | AlgorithmVersion → AlgorithmVersion | Q-D4-06, CQ-DX-04, Q-D4-20 | vendor docs naming publications [S24][S26]; GrimAge → GrimAge2 [S20] | FC-9, FC-3 | recorded-only |
| RUNS_ON_DEVICE (new name; replaces RUNS_FIRMWARE_VERSION + device side of PERFORMED_WITH_ASSAY_VERSION) | asserted | AlgorithmVersion → Device | CQ-DX-09, Q-D4-07, Q-D4-23 | vendor changelogs [S39], API schemas [S35], community [S40] | FC-6 | **episode** (which algorithm ran on the device model when) |
| COMPARES | structural | ComparabilityAssessment → AssayVersion / AlgorithmVersion / ReferenceIntervalVersion (union of 3) | CQ-DX-03, CQ-DX-05, CQ-AX-21, Q-D4-02 | BellLabs assessment activity | FC-1, FC-4, FC-7 | recorded-only (assessment supersedes) |
| REFLECTS_MECHANISM (seam, D4-owned, declared on Biomarker; D2 consumes) | structural (curated) or asserted — decide with D2 | Biomarker → D2.Mechanism | Q-D4-01, D2 Q-D2-03/04/22 | curated from publications (NAAD as NR-utilization marker cited in D2 FC-1; Martens [S31]) | FC-7 + D2 FC-1/FC-7 | recorded-only |
| ISSUED_BY (or kernel role pattern) | asserted | LabTest → D7.Organization | Q-D4-12, Q-D4-13, Q-D4-20 | vendor pages | FC-7 | recorded-only |
| OPERATED_BY (pinned ASSAY_OPERATED_BY) | structural | AssayVersion → D7.Organization | CQ-DX-01, CQ-DX-03 (two labs = two assay versions) | lab reports (performing lab) [S6] | FC-1 | recorded-only |
| HAS_ANALYTE (optional) | structural | Biomarker → D1.Compound (or D2.MolecularEntity) | Q-D4-01, Q-D4-16 | ChEBI/UniProt ids on LOINC parts [S2] | FC-7 | recorded-only |

That is 14 with HAS_ANALYTE; the first cuts if over budget are HAS_ANALYTE (→ `analyteIdentifiers` property: ChEBI/UniProt, D2 already prefers a property), FOR_METRIC (already cut → property), ASSAY_FOR_METRIC (cut: derivable LabTest → Metric + LabTest → AssayVersion; reverse only if an assay version reports two metrics a question must separate — HbA1c NGSP % and IFCC mmol/mol is that case, so keep as a property list `metricUids` on AssayVersion first), ISSUED_BY (use kernel role pattern if A1 provides one).

Seams owned by other modules that D4 questions need (D4 lists them in `10-seams.yaml`, does not declare them): D3 `OutcomeDefinition → Metric/Biomarker` (Q-D4-14; registry free text must resolve to an AlgorithmVersion or stay UNRESOLVED [S33]); D5 `Target → Metric` (Q-D4-17; OPERATIONALIZED_BY); D6 `Product → LabTest` and `Product → Device` (DELIVERS_LABTEST, EMBODIES_MODEL); D8 regulatory status/recall/clearance → Device / AssayVersion (Q-D4-09/10); K Claim/ClaimOccurrence about a Metric (FDA "claims to measure glucose" case, Q-D4-08).

### Predicate-only values (stay `Assertion.predicate`; the question that would promote each)

- `interferes_with` (AssayVersion or method → Condition; qualifiers: direction, threshold) — Q-D4-11; promote if a question must traverse condition → affected methods across labs at scale.
- `reports_reliability` (AlgorithmVersion/AssayVersion → value ICC / replicate deviation; qualifiers: replicate design, platform) — CQ-DX-05; consumed by ComparabilityAssessment.replicateNoiseBasis.
- `claims_to_measure` (Product/Device/LabTest → Metric) — Q-D4-08; the FDA harm case is the contradiction of this predicate.
- `recommends_retest_interval` (issuer → LabTest; value ISO duration) — Q-D4-05.
- `names_publication` / `implements_publication` (vendor AlgorithmVersion → Source) — Q-D4-06; weaker than DERIVED_FROM.
- `developed_with` (Algorithm/LabTest → Organization) — Q-D4-20 (marketing "developed with Harvard/Yale/Duke" [S24]).
- `sets_reference_range` (Organization → ReferenceIntervalVersion) — Q-D4-12.
- `disclaims_diagnostic_use` (LabTest → —) — Q-D4-18 [S27].
- `outcome_measured_by` (registry outcome text → Metric/AlgorithmVersion) — handled by D3 OutcomeDefinition seam.

## 4. Bitemporal decisions (proposal)

Episodes (valid time) only on: PERFORMED_WITH_ASSAY_VERSION (lab method changes; CQ-DX-01 example "until 2025-06-01"), RUNS_ON_DEVICE (WHOOP 2026-02-25 / 2026-07-06 changes [S39]), INCLUDES_TEST (panel composition), MEASURES_METRIC (labs remap LOINC). Everything else recorded-only; ReferenceIntervalVersion and AlgorithmVersion carry source-stated `effectiveFrom/To` as payload (pinned rule), not query validity.

## 5. Retrieval-pattern sketches (for 03)

- **Compound → mechanism → biomarker → test (Q-D4-01; aligned with D2 research notes §7).** D2 hops 1–2 as drafted there (`Compound -AFFECTS_MECHANISM-> Mechanism <-REFLECTS_MECHANISM- Biomarker`); D4 hop 3: `(b)<-[:QUANTIFIES]-(m:Metric)<-[:MEASURES_METRIC]-(t:LabTest)-[pw:PERFORMED_WITH_ASSAY_VERSION]->(av:AssayVersion)` with `pw` valid at `$asOf`; compartment check `m.systemOntologyId = ctx.compartmentOntologyId` (D2 context) else flag NOT_COMPARABLE; optional `(ca:ComparabilityAssessment)-[:COMPARES]->(av)` for the study-vs-test assessment. Trace: assertions behind MEASURES_METRIC/PERFORMED_WITH → locators → snapshots. D2 drafted `(t:LabTest)-[:MEASURES]->(b)` — replace with the Metric hop (MEASURES derived LabTest→Biomarker is cut).
- **Comparability lookup (CQ-DX-03, CQ-AX-21):** given two AssayVersion uids → `MATCH (ca:ComparabilityAssessment)-[:COMPARES]->(a1), (ca)-[:COMPARES]->(a2) WHERE ca.status = 'CURRENT'`; none → UNKNOWN.
- **As-of interval (CQ-DX-06):** `(t)-[pw]->(av)<-[:FOR_ASSAY_VERSION]-(ri)` filtered by report date against `pw` episode and `ri.effectiveFrom/To`.
- **Version as-of on a device (CQ-DX-09):** `(av:AlgorithmVersion)-[r:RUNS_ON_DEVICE]->(d:Device)` with `r.validFrom <= $d < r.validTo`; `versionBasis = CHANGE_EVENT_UNLABELED` returned with the changelog locator.
- **GDS (Q-D4-25):** node similarity (Jaccard) on the bipartite projection LabTest(panel) → Metric (via INCLUDES_TEST + MEASURES_METRIC), method-versioned, written as a read-only derived projection; refresh on panel episode change.
- **Vector/fulltext (Q-D4-22):** index on `Metric.searchText` (names, LOINC long/short/consumer names [S1], verbatim vendor names, definitionText) for entity linking of measurement mentions; ambiguity when top hits differ in `systemOntologyId` or `methodText`.

## 6. Seams and contested ownership

| topic | position | counterpart |
| --- | --- | --- |
| Device model vs Product | D4 owns `Device` (model as instrument); D6 owns Product/offer and declares `EMBODIES_MODEL` (Product → Device) | A6 (D6) |
| Regulatory records (510(k), recall, MAUDE, CLIA, LDT) | D8 owns; D4 questions Q-D4-09/10 consume via seams on Device/AssayVersion | A7 (D8) |
| Endogenous metabolites (NAD+, NAAD) | Agree with D2: D1 owns compound identity; D4 Biomarker references the analyte (property or HAS_ANALYTE); D2 Mechanism is the process | A2 (D1), D2 |
| Compartment / specimen vocabulary | D4 carries `Metric.systemOntologyId` and `AssayVersion.specimenOntologyIds` (UBERON/CL); D2 compares by equality — proposed as a shared vocabulary in `10-seams.yaml` | D2 (same worktree) |
| ComparabilityAssessment | D4 if kernel has no generic assessment; otherwise kernel archetype + D4 kind and dimensions | A1 (K/D10) |
| REFLECTS_MECHANISM | D4 declares on Biomarker; D2 consumes (D2 notes agree) | D2 |
| Target → Metric | D5 declares OPERATIONALIZED_BY; D4 provides Metric | A5 (D5) |
| OutcomeDefinition → Metric/AlgorithmVersion | D3 declares; unresolved clock names need the kernel's UNRESOLVED assertion pattern | A4 (D3), A1 |
| Lab/vendor organizations, conflicts | D7 owns Organization and financial-interest; test-and-sell detection (Q-D4-13) is a D7/D6 join on the issuer uid | A6 (D7) |
| Locator kinds | D4 needs JSON-pointer selectors (CT.gov, openFDA, Oura OpenAPI), PDF page+text, and text-position on tag-stripped XML | A1 (K) |
| Comparison reports (Q-D4-24) | D10 published-artifact pattern | A1 (D10) |

## 7. Open questions (seed for 11-open-questions.md)

1. Does the coded sample hold at n = 25 (20 lab reports + 5 consumer reports)? If yes, CQ-DX-03 answers are mostly UNKNOWN — is that an acceptable product answer, or must BellLabs buy tests to fill AssayVersion fields? (owner)
2. Vendor clock ≠ publication version by default (Q-D4-06)? Evidence: vendor technical docs or shared-sample reproducibility (OPEN-QUESTIONS P1 #2). (owner/D4)
3. Is "DunedinPACE™" as a trademarked vendor output an Algorithm family or a Product name (D6)? (D4/D6)
4. ComparabilityAssessment in K or D4? (A1)
5. Should `Biomarker` exist separately from `Metric` for consumer composites ("biological age")? Current position: yes — Biomarker "biological aging" is the referent, each clock output is a Metric — but this may be one node too many for composites. Evidence: whether any question groups different clocks under one referent (Q-D4-04 does). (D4 model stage)
6. Is a firmware/algorithm change reported only by community members admissible as an assertion (asserter = forum member, authority low) for CQ-DX-09? (K / D9)
7. LOINC licence terms for redistributing LOINC names inside BellLabs answers (Quest's page reproduces the LOINC notice: "available at no cost under the license at http://loinc.org/license") — confirm attribution obligations. (owner)
8. The NCBI Bookshelf (FDA-NIH BEST glossary) blocked automated access; BEST categories (monitoring, pharmacodynamic/response, surrogate) belong to D3 EndpointClassification anyway — confirm D3 owns them. (A4)

## 8. Readiness findings (feed 08 and D11)

- Agent-ready (3): openFDA 510(k)/recall/event (no key; recall query returned 7.3 MB for limit=3 — very large embedded fields), Federal Register API, ClinicalTrials.gov v2 (`query.outc` param; `query.outcome` fails), Europe PMC fullTextXML (failed for PMC9586209: 150-byte response), PubMed MCP full text (succeeded for PMC9586209), NLM Clinical Tables LOINC/UCUM (null SYSTEM/SCALE fields), Oura OpenAPI JSON (versioned file name `openapi-1.41.json` discovered from the docs HTML), Apple doc JSON endpoint.
- Scrape (2): LOINC term pages, Labcorp test pages + sample PDFs, NGSP PDFs (Firecrawl parsed tables), FDA safety communications, vendor pages, WHOOP changelog/API docs, Dexcom docs.
- Gated/blocked (1/0): Quest directory LOINC/performing lab (service-area selection), FDA CLIA database (HTML form only), LOINC FHIR server (302 without account), NCBI Bookshelf (reCAPTCHA).
- Tooling problems: `tvly` on Windows emitted cp1252 bytes (JSON decode failures) and intermittently crashed with a Python traceback and empty stdout; fixed with a wrapper that retries and decodes cp1252. `firecrawl` CLI without `-o` writes to `.firecrawl/` in cwd (ran from scratch to avoid writing into the repo).
