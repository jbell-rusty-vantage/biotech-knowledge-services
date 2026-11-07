# D3 — research notes for the model stage

Agent A4 · Wave 1 · 2026-10-08. Observations from the ecosystem survey (`../01-ecosystem.md`), the questions (`../02-questions.md`) and the fixture candidates (`fixture-candidates.md`), written for the agent that drafts `04-schema-proposal.graphql` and the registers. Positions here are proposals with reasons, not decisions. The kernel pattern (A1, `packets/K/09-reasoning.md`) was **not yet published** when this was written; subject/object/identifier/mention edges below are written against the placeholder interface `Subjectable` and must be rebased.

## 1. What the research changed in my picture of the domain

1. **Registry history is the hardest source, not the hardest model.** ClinicalTrials.gov history is not agent-reachable (all tools 403; `tool-log.md`); ISRCTN states history in prose (dated Editorial Notes and "Provided at time of registration / Updated as of / Amended" blocks). So `RegistrationVersion` must support two populating modes: (a) **observed** — a version BellLabs captured itself (valid time = registry's last-update date, recorded time = capture); (b) **reconstructed** — a past version stated inside a later snapshot (ASPREE 2008/2009 text inside a 2026 ISRCTN page). Both are registry assertions with locators; only (a) has its own snapshot. This answers PLAN 6.2's open "is a version a snapshot?" for D3: **not always**.
2. **Two asserters per study are the norm, and they disagree.** Registry vs paper disagree on arms (fisetin arm only in registry results), on sponsor (ASPREE: Monash vs Hennepin; Bayer collaborator vs "provided the study drug, but did not fund"), on dispersion (registry "Full Range" vs paper interquartile range for the same median −4.1%), on n analyzed (28 vs 30). The model must hold both, attributed, never overwrite.
3. **Null primary + favorable secondary/subgroup is the dominant pattern** in longevity trials (Farr 2024, urolithin A 2022, PEARL 2025). `analysisKind`, `comparisonKind`, `statisticalConclusion` and per-source outcome priority are the four filters the product cannot ship without (CQ-ST-05).
4. **Harm sits in secondary outcomes, unreported arms and preclinical diets**: ASPREE bleeding and mortality, a gastric hemorrhage in the dropped fisetin arm, ITP NR diet delivering 67–89% of nominal.
5. **Corrections and retractions arrive as conflicting metadata from three asserters** (NLM publication types and CommentsCorrections; Crossref publisher deposits; Retraction Watch via Crossref with reasons). One notice DOI is labelled "retraction" by Retraction Watch and "erratum" by the publisher.
6. **Version chains are everywhere**: registry versions, preprint versions (PEARL v1–v4, NMNH-Ca two rows both "v1"), Cochrane review versions (pub1 → pub2), corrigenda. One relationship type with a kind enum can carry all publication-level chains.

## 2. Candidate node types (budget ≤ 8) — proposal

| # | type | why a node (question that filters/joins/traverses through it) | identity | notes |
| --- | --- | --- | --- | --- |
| 1 | `Study` | every D3 question starts or joins here; investors filter by status/phase/sponsor; U2E path lands on it | registry id(s) via kernel Identifier (NCT, ISRCTN, EUCT, ITP cohort id) or (first publication + design) for unregistered/preclinical studies | absorbs pinned `TrialRegistration` (registration identity becomes kernel Identifier + `registry` property on RegistrationVersion). `studyKind` must include preclinical animal designs (ITP). Current status/enrollment are **derived** from the latest RegistrationVersion, read-only. |
| 2 | `RegistrationVersion` | CQ-ST-04, CQ-ST-08, Q-D3-16, Q-D3-02, Q-D3-18 traverse versions in time order | (registry, registrationId, versionDate or registryVersionNumber, populatingMode observed/reconstructed) | keeps the pinned property set (status, enrollment + type, dates + type, resultsPosted, design fields, verbatim sponsor/condition/intervention names). Add: `populatingMode`, `resultsSubmissionEvents` (RELEASE/RESET with dates, from CTG annotation), `whyStopped`. Absorbs pinned `ProtocolVersion` as `documentKind` PROTOCOL/SAP? — no: protocol/SAP documents are Publications (see 8) or kernel Sources. |
| 3 | `StudyArm` | CQ-ST-01, CQ-ST-06, Q-D3-01; results and AEs are per arm | (study, arm label, asserting source) | absorbs pinned `StudyIntervention` as properties (route, dosageForm, schedule, dosesPerDay, durationIso, registryInterventionType, comparatorType, armType, plannedSize). Arms differ by asserter (registry 3 arms, paper 2) → one arm node per asserted arm with `assertedBy` via its Assertion; `armStatus` (PLANNED / ENROLLED / DROPPED). |
| 4 | `StudyPopulation` | Q-D3-17, Q-D3-06 (species/sex), applicability population dimension; D5 qualifier assertions name a D3 StudyPopulation as object (`vocab-targets.yaml` APPLIES_TO_POPULATION) | (study, populationKind, analysisSet, asserting source) | `populationKind` ELIGIBLE / ENROLLED / RANDOMIZED / ANALYZED; species/strain as properties (NCBI Taxonomy id string) for preclinical, so no taxon seam is spent; enrichment criteria text (p16-high). Three pinned edges collapse into one `HAS_POPULATION`. |
| 5 | `OutcomeDefinition` | CQ-ST-04/05, Q-D3-04/05/16; seam to D2 Outcome / D4 Biomarker; D5 targets reach study evidence through it | (study, measure name normalized, timepoint) — the same measure at 2, 4 and 20 weeks are three definitions (NCT04313634 lists P1NP three times) | `priority` stays a derived read-only projection of per-source declarations (never a single stored boolean). |
| 6 | `StudyResult` | CQ-ST-05/06, Q-D3-04/05/06/15; the unit a number is cited from | (outcome definition, arm set, analysis set, timepoint, asserting source) — one node **per source** (registry results vs paper) so disagreements are visible | absorbs pinned `AdverseEventResult` (label kept, `resultKind` ADVERSE_EVENT_COUNT with optional AE properties: eventTerm, organSystem, seriousness, participantsAffected/AtRisk, eventCount, collectionMethod). Add `dispersionKind` (FULL_RANGE, IQR, SD, SE, CI) — observed missing. |
| 7 | `Publication` | CQ-EV-05, Q-D3-03, Q-D3-11, Q-D3-12, CQ-ST-07; U2E path (paper → study) | DOI / PMID / PMCID (kernel Identifier); version suffix for preprints and Cochrane `.pubN` | kinds: ARTICLE, PREPRINT_VERSION, SYSTEMATIC_REVIEW, PROTOCOL, SAP, CORRECTION_NOTICE, RETRACTION_NOTICE, EXPRESSION_OF_CONCERN, CONFERENCE_ABSTRACT, REGISTRY_RESULTS? (no — registry results are RegistrationVersion content). **Ownership contested** (D9 "publication" container; kernel Source) — see 6. |
| 8 | `Dataset` (optional) | CQ-ST-07 / CQ-AX-05 independence counting when several studies analyze one cohort (UK Biobank, NHANES, a trial's IPD) | repository id / DOI / accession | if budget forces a cut, independence counting falls back to Publication→Study clusters plus a `datasetIdentifier` property on Study; record as EXCESS candidate or defer. |

Pinned types merged or deferred (for `06-node-register.yaml`):

| pinned type | proposal | reason |
| --- | --- | --- |
| TrialRegistration | mergedInto Study (+ kernel Identifier) and RegistrationVersion (`registry`, `registrationId`) | no question needs the registration as a separate hop; cross-registration (NCT01038583 = ISRCTN83772183) is two identifiers on one Study |
| ProtocolVersion | mergedInto Publication (`publicationKind` PROTOCOL / SAP) or kernel Source | a protocol PDF is a document with versions; Farr 2024 ships protocol + SAP as a supplement |
| StudyIntervention | mergedInto StudyArm | 1:1 with arm in every instance read; dose detail lives on the administered-material edge |
| InterventionComponent | **option A** (slim): replaced by edge properties on `ADMINISTERS` (StudyArm → material/product/lot/device); **option B**: keep as node when a component needs its own assertions (measured delivery, resolution hypotheses) | ITP NR "1,000 ppm, measured 67–89%" and PEARL "5 mg compounded ≈ 1.43 mg generic" are both assertions *about the component*; option B keeps them traversable. Decide in the model stage with the D1 seam (A2). |
| AdverseEventResult | mergedInto StudyResult | same identity pattern; pinned already labelled it `:StudyResult` |
| EvidenceApplicability, ApplicabilityDimension, UseContextProfile, EndpointClassification, ResultInterpretation, EvidenceSynthesis, EvidenceStrengthAssessment | **defer to K/D10's assessment pattern** (default owner map: assessments → K/D10); D3 contributes kind-specific enums and the dimension vocabulary | seven W10 node types would blow the D3 budget alone; they are all "Assessment with kind + method version + inputs + locators". D3 keeps the questions (CQ-EV-04/06, CQ-ST-03/09/10, CQ-AX-24) and their seams. If A1 rejects a generic assessment node, the minimum D3 set is `EvidenceApplicability` (with dimensions as child assessments, not a separate type). |

## 3. Candidate relationship types (budget ≤ 14, pairs ≤ 35)

| type | from → to | class | questions | temporal | notes |
| --- | --- | --- | --- | --- | --- |
| HAS_REGISTRATION_VERSION | Study → RegistrationVersion | structural | CQ-ST-04, CQ-ST-08, Q-D3-16 | **episode** (valid time = registry version date; reconstructed versions get valid time from the note date) | exclusive episodes per registry |
| HAS_ARM | Study → StudyArm | structural | CQ-ST-01, Q-D3-01 | recorded-only | |
| ADMINISTERS | StudyArm → D1 material / chemical form, D6 product variant, D8 lot, D4 device, D5 protocol (lifestyle arm) | asserted | CQ-ST-01, CQ-ST-02, CQ-EV-04 | recorded-only | ≤ 5 targets (union ≤ 6); edge properties: quantity, unitCode, quantityBasis, massBasis, verbatimDoseText, supplierStatement? (or option B node) |
| HAS_POPULATION | Study → StudyPopulation | structural | Q-D3-17, Q-D3-06, CQ-EV-04 | recorded-only | replaces 3 pinned edges |
| DEFINES_OUTCOME | Study → OutcomeDefinition | structural | CQ-ST-04/05 | recorded-only | |
| DECLARED_IN | OutcomeDefinition → RegistrationVersion \| Publication | asserted (edge property `priority`) | CQ-ST-04, CQ-ST-05, Q-D3-16 | recorded-only (time comes from the version node) | replaces pinned DEFINED_IN + DECLARES_OUTCOME_PRIORITY predicate; 2 pairs |
| RESULT_FOR | StudyResult → OutcomeDefinition | structural | CQ-ST-05, Q-D3-04/05 | recorded-only | |
| RESULT_FOR_ARM | StudyResult → StudyArm (edge `armRole` INTERVENTION/COMPARATOR) | structural | CQ-ST-06, Q-D3-01 | recorded-only | |
| REPORTS_ON | Publication → Study | asserted | CQ-ST-07, Q-D3-13/14, CQ-EV-05 | recorded-only | registry `referencesModule` and paper "ClinicalTrials.gov identifier" text both populate it |
| REVISES | Publication → Publication (edge `revisionKind`: CORRECTION, RETRACTION, EXPRESSION_OF_CONCERN, WITHDRAWAL, NEW_VERSION, UPDATE, PUBLISHED_AS) | asserted (one per asserter: NLM, publisher, Retraction Watch, preprint server) | CQ-EV-05, Q-D3-03, Q-D3-11, Q-D3-12 | recorded-only (notice date is a property) | replaces pinned CORRECTS + RETRACTS and covers preprint→journal and Cochrane pub1→pub2; seam to kernel `SourceRevisionEvent` (snapshot level) must be decided with A1 |
| HAS_STUDY_ROLE | Study → D7 Organization \| D7 Person (edge `role`: LEAD_SPONSOR, SPONSOR, COLLABORATOR, FUNDER, MATERIAL_PROVIDER, OPERATOR_CRO, SITE, PRINCIPAL_INVESTIGATOR, RESPONSIBLE_PARTY) | asserted (per registry / per paper) | Q-D3-08, Q-D3-09, Q-D3-02 | **episode** (ISRCTN removed a funder in 2018) | replaces pinned derived SPONSORED_BY / OPERATED_BY / INVESTIGATED_BY; who owns it (D3 vs D7) is a seam decision — D7 owns the actor and financial interest |
| INVESTIGATES | Study → D2 Condition | asserted | Q-D3-10, Q-D3-04 | recorded-only | could stay predicate-only if D13 frontiers carry the investor filter |
| MEASURES | OutcomeDefinition → D2 Outcome \| D4 Biomarker | structural (curated mapping) | Q-D3-04/05, CQ-ST-03; D5 targets seam | recorded-only | D5's `OPERATIONALIZED_BY` (Target → Outcome/Biomarker) closes the path to targets |
| ANALYZES_DATASET (only with Dataset) | Publication \| Study → Dataset | asserted | CQ-ST-07 | recorded-only | 2 pairs |

Rough size: 8 node types (with Dataset), 13–14 relationship types, ≈ 26–30 pairs depending on ADMINISTERS targets (5) and kernel provenance fields (SUPPORTED_BY / WAS_GENERATED_BY are kernel-owned). Widest union: ADMINISTERS (5). Within budget if W10 moves to K/D10.

## 4. Properties, enums and predicate-only values

- **StudyResult filter properties** (from the matrix in `02-questions.md`): analysisKind, comparisonKind, statisticalConclusion, direction, resultKind, sampleSize, analysisPopulation; range comparisons on estimate/ciLower/ciUpper only for pooled results. Everything else is `otherProperties`. Cut candidate: `isStatisticallySignificant` (duplicates `statisticalConclusion`). Add: `dispersionKind`.
- **OutcomeDefinition filter properties**: priority (derived, per source), measureKind, timepoint.
- **AdverseEvent (as StudyResult) filter properties**: seriousness, collectionMethod, participantsAffected.
- **RegistrationVersion filter properties**: versionDate, observedAt, overallStatus, resultsPosted, primaryCompletionDate (+type), enrollmentCount (+type), populatingMode.
- **Study filter properties**: studyKind (RCT, NON_RANDOMIZED, OBSERVATIONAL_COHORT, CASE_REPORT, PRECLINICAL_ANIMAL, IN_VITRO, SYSTEMATIC_REVIEW? — no, reviews are Publications), phase, masking, allocation.
- **Publication filter properties**: publicationKind, publishedAt, isRetracted (derived read-only projection over REVISES; regenerable), version.
- **Enums needed**: StudyKind, PopulationKind, AnalysisSetKind, ArmStatus, AnalysisKind, ComparisonKind, StatisticalConclusion, OutcomeDirection, StudyResultKind, DispersionKind, AeSeriousness, AeCollectionMethod, MeasureKind, OutcomePriority, RevisionKind, StudyRole, RegistrationPopulatingMode, ResultsSubmissionEventKind.
- **Assertion.predicate-only values** (cost nothing; promote only with a question): `MEASURED_DELIVERY_FRACTION` (ITP diet assay; promote with Q-D3-06 if option B is not taken), `DOSE_EQUIVALENT_TO` (PEARL compounded vs generic; CQ-EV-04 dose dimension), `ARM_DROPPED_REASON` (Q-D3-01), `STOPPED_EARLY_REASON` (Q-D3-18), `SHARES_PARTICIPANTS_WITH` (independence; promote if Dataset is cut), `DISCLOSES_FINANCIAL_INTEREST` (D7 owns), `REGISTERED_RETROSPECTIVELY`, `RESULTS_SUBMISSION_RESET`.

## 5. Bitemporal needs (directive rule 9)

Episodes only where a question asks "as of when": HAS_REGISTRATION_VERSION (registry history) and HAS_STUDY_ROLE (funders/sponsors change; ISRCTN 2018 note). Everything else recorded-only: results, arms, outcome declarations and revisions are immutable per source; a changed value is a new node from a new source or a new registration version. Status and enrollment are not on Study as facts; they are read from the version valid at T.

## 6. Seams and contested ownership

| concept | proposed owner | D3 needs | contest / note |
| --- | --- | --- | --- |
| Publication (scholarly work) | **D3** | REVISES, REPORTS_ON, DECLARED_IN | default map gives "publication" (media container) to D9 and documents/chunks to D9/K. Proposal: D3 owns the scholarly `Publication` (article, preprint version, review, notice); D9 owns media containers (podcast, channel, newsletter) and Document/Chunk. Needs A8 + A1 agreement on whether Publication specializes kernel `Source` (one identity, not two). Write in `11-open-questions.md`. |
| Assessments (applicability, interpretation, endpoint classification, synthesis, strength) | K/D10 (A1) | the questions and enums | see section 2; D3 should not declare these types unless A1 says so |
| Material, chemical form | D1 (A2) | ADMINISTERS target | resolution of "which NR material" (ChromaDex chloride) stays in D1 |
| ProductVariant, label | D6 (A6) | ADMINISTERS target; CQ-ST-02 | |
| Lot / COA | D8 (A7) | ADMINISTERS target (investigational lot) | |
| Device | D4 (A3) | ADMINISTERS target (device trials, measurement devices) | |
| Biomarker; Outcome; Condition | D4; D2 | MEASURES, INVESTIGATES | |
| Target vocabulary | D5 (A5) | via MEASURES → Outcome/Biomarker ← OPERATIONALIZED_BY | `vocab-targets.yaml` already assumes `StudyResult → OutcomeDefinition → Outcome`; names must match |
| Protocol / lifestyle intervention | D5 | ADMINISTERS target for exercise/diet arms | |
| Organization, Person, financial interest | D7 (A6) | HAS_STUDY_ROLE | Mayo patent COI and ASPREE "provided the study drug" are D7 facts reached from the Study |
| Frontier, Event (readout, termination, approval) | D13 (A7) | Study → Frontier attachment owned by D13 | trial readouts/terminations as Events reference Study |
| Claim, ClaimOccurrence, retelling chain | K/D9/D10 | Q-D3-09 (company claims), CQ-ST-07 retellings | |
| SafetySignal | D5 | inputs are StudyResults (AE kind) | pinned OQ "SafetySignal as an assessment over AdverseEventResults" |
| Chunk / DocumentTextVersion / MENTIONS | K/D9 | U2E path for FC-3 | |

## 7. Retrieval-pattern notes (for `03-retrieval-patterns.md`)

- CQ-ST-04: `MATCH (s:Study)-[e:HAS_REGISTRATION_VERSION]->(v)` ordered by `e.validFrom`; `(od)-[d:DECLARED_IN]->(v)` with `d.priority`; compare earliest vs latest vs publication.
- CQ-EV-05 / Q-D3-03: `(n:Publication)-[r:REVISES {revisionKind:'RETRACTION'}]->(p)`, group by asserter; downstream: `(a:Assertion)-[:SUPPORTED_BY]->(:SourceLocator)-[:IN_SNAPSHOT]->(:SourceSnapshot)-[:OF_SOURCE]->(p)` (kernel names pending).
- CQ-ST-07 independence: GDS WCC over a projection {Publication-REPORTS_ON-Study, Study-ANALYZES_DATASET-Dataset, optional same-sponsor edges}, materialized with a method version (D10 association pattern); answer is a lower bound.
- Q-D3-14 U2E: vector index over chunk text of `DocumentTextVersion`s whose source is a Publication; MENTIONS (derived) to Study/OutcomeDefinition; then assertions with locators in that chunk's snapshot.
- Q-D3-04 ranking: computed at query time, never stored (directive 3.5); sort keys: study design (studyKind, masking), sampleSize, statisticalConclusion, OD.measureKind (clinical > biomarker).

## 8. Open questions (to carry into `11-open-questions.md`)

1. **Contract conflict:** the packet direction asks for a fixture from "ClinicalTrials.gov v2 history endpoints". The v2 API has no history endpoint (OpenAPI spec) and the website-internal history endpoints return 403 to all automated clients. Proposed resolution: the version-history fixture uses ISRCTN (ASPREE, FC-1), with the CTG current record and annotation events as the second registry; CTG history needs a human-browser capture or an NLM request. Owner: owner + D11.
2. Is a reconstructed registration version (stated inside a later snapshot) a `RegistrationVersion` node with its own valid time, or an Assertion about the observed version? (kernel + D3)
3. Does `Publication` specialize kernel `Source` (one node per work) and who owns it (D3 vs D9)? (kernel, D9)
4. Per-source `StudyResult` nodes vs one result with competing assertions: identity rule and how the verifier treats two numbers for one estimate. (D3, kernel)
5. Option A (dose on ADMINISTERS edge) vs option B (InterventionComponent node) — depends on whether measured delivery and resolution hypotheses must hang off the component. (D3 with D1)
6. W10 assessment types: generic K/D10 assessment vs D3-specific types. (kernel/D10)
7. Retraction propagation: query-time traversal vs a derived `isRetracted`/`restsOnRetracted` projection on assertions (regenerable). (D10)
8. Registry personal data (PI email/phone in CTG `pointOfContact`, `contactsLocationsModule`): ingestion must drop it; privacyClass rule. (kernel)
9. Crossref Labs reasons are unstable and corrupted (first character dropped): ingest from the Retraction Watch CSV instead? (D11)
10. NCBI E-utilities rate limit (3 req/s without key) under team load; add `NCBI_API_KEY`. (owner, D11)
