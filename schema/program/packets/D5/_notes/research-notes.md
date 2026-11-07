# D5 — research notes for the model stage (A5, research stage, 2026-10-08)

Inputs: `01-ecosystem.md` (sources S1–S35), `02-questions.md` (34 questions), `_notes/fixture-candidates.md` (FC-01…FC-08), `vocab-targets.yaml` 0.1.0 and `_notes/vocab-targets-notes.md` (Wave 0). Kernel pattern (packets/K) was not yet published at the end of this stage: everything below that touches subject/object/qualifier is written against pinned kernel names and must be rebased on A1's pattern. Budget for a domain module: ≤ 8 node types, ≤ 14 relationship types, ≤ 35 pairs, unions ≤ 6.

## 1. What the evidence says about the shape of the domain

1. **Protocols mix every intervention kind in one ordered list.** Huberman's sleep toolkit interleaves light exposure, caffeine avoidance, temperature, an app-based self-hypnosis practice and supplement intake (S1); Blueprint mixes exercise prescriptions, meal timing, laser procedures, prescription drugs (tretinoin, oral minoxidil), supplements and measurement (S4); AgelessRx is a drug program with titration and lab monitoring (S5). No question needs to traverse "Treatment" separately from "Procedure" or "Lifestyle"; the kind matters only for which sources exist (labels for drugs, monographs for NHPs, nothing regulatory for lifestyle) — Q-D5-28.
2. **Harm sits in three places, with different strength words.** Formal contraindications can be minimal (sirolimus: hypersensitivity only) while the real constraints sit in interactions, warnings and population sections (S6); monographs separate "Caution(s) and warning(s)", "Contraindication(s)" and "Known adverse reaction(s)" (S12); protocols state their own cautions in prose ("Don't take theanine if …", S1) and population avoid-lists (S4).
3. **The same interaction is asserted by many parties with different directives.** Grapefruit/CYP3A4 with sirolimus: label "must not be taken" (S6); clinic lists it as an interaction (S5); community uses it to cut cost (S30). St. John's wort: label (drug side, S6) and NCCIH (herb side, S11). The interaction is one identity; directives and stances are per asserter.
4. **Over-dosing is a dose band × population × basis.** ODS UL 350 mg applies to supplemental magnesium only, per life stage incl. pregnancy (S10); HC melatonin dose ranges are per subpopulation and per use (S12). A protocol dose (Blueprint pregnancy "Magnesium 500-600 mg daily", S4) can only be judged by a query-time comparison of two located assertions (Q-D5-06).
5. **Interventions interact with interventions, not only drugs with drugs.** Vitamin C+E blunted exercise-induced insulin-sensitivity gains (S24) and mitochondrial-biogenesis markers but not VO2max (S25) — direction is per outcome, so the target-level direction is MIXED, and the co-intervention (exercise) is a lifestyle practice.
6. **Protocol pages are versioned in place and the displayed date lies.** "September 20, 2021" stays on a page whose commercial partner changed from Thorne to Momentous (S1, S2); steps and doses were unchanged. Editions must come from dated captures (snapshot diff) and a canonical payload hash; the pinned `changeProvenance` (SOURCE_VERSIONED / SNAPSHOT_DIFF / THIRD_PARTY_REPORTED) fits. Labels are natively versioned (SPL set id + integer version, S7) and ODS publishes a change history (S10).
7. **Spontaneous reports are inputs, never findings.** CAERS/FAERS publishers deny causality and incidence (S14, S17); terms need normalization (S15). Surveillance reports (MMWR) are assessment-grade and get errata (S28).
8. **Targets.** Examine mixes goals and diseases in one tree (S32); 21 CFR 101.93 draws the structure/function vs disease line (S13) — a principled boundary for Target vs Condition; HC uses decompose sleep into "aspects" (S12); MeSH has free, exact descriptors for most targets (S33).

## 2. Decision recommended: collapse Treatment, Procedure, Lifestyle into one `Intervention` with a `kind`

- Proposed node `Intervention` (uid token `intervention`), identity: normalized name + kind (+ regimen qualifier when the regimen is the identity, e.g. "intermittent low-dose rapamycin" vs "sirolimus for transplant prophylaxis").
- `kind` enum (closed): DRUG, SUPPLEMENT_REGIMEN, BIOLOGIC_OR_CELL_GENE, PROCEDURE, DEVICE_BASED, LIFESTYLE_PRACTICE, COMBINATION, OTHER. Keep pinned `TreatmentModality` values as `modalities` only if a question filters on them (none found; candidate to cut).
- **When NOT to mint an Intervention:** simple intake of a compound or product inside a protocol step. The step references the D1 compound/form or D6 product directly with dose properties. An Intervention node exists for (a) non-substance practices (sunlight viewing, sauna, time-restricted eating, resistance training, laser), (b) named regimens that sources, clinics and trials treat as one thing (Q-D5-17 offerings, Q-D5-25 identity with a D3 study intervention), (c) combinations.
- Merges: pinned `Treatment`, `Procedure`, `Lifestyle` (W05), and the practice side of `Exposure` (W05) → `Intervention`. Dietary patterns: contested with D12 (D12 owns "dietary pattern composition"; D5 can reference a D12 pattern as the subject of a step or constraint).
- Pinned questions this keeps: biotech-meta catalog ST-01 (not a D5 question) / FOLLOWS_INTERVENTION_DEFINITION (D3 seam, Q-D5-25), OFFERS_* (D6/D7 seam, Q-D5-17).

## 3. Candidate node types (≤ 8) and the questions that need them

| candidate | why a node (question needs filter/join/traverse) | pinned types merged | notes |
| --- | --- | --- | --- |
| `Target` | every target question (Q-D5-01, 02, 15, 18, 19, 28); shared vocabulary node per directive 3.1 | FunctionalGoal | defined in `vocab-targets.yaml`; add identifier scheme MESH (S33); pinned W16 `Target` (numeric metric threshold) must be renamed away (see §5) |
| `Intervention` | Q-D5-17, 25, 28; subject of constraints and target assertions for non-substance means | Treatment, Procedure, Lifestyle, Exposure (practice part) | §2 |
| `Protocol` | enduring identity; Q-D5-12, 13 | Protocol | identity: publisher + canonical URL or title; `protocolType` enum can shrink |
| `ProtocolEdition` | Q-D5-10, CQ-PR-01, Q-D5-13 (interest per edition interval) | ProtocolEdition | immutable payload; `payloadHash`, `changeProvenance`, `observedFrom/To` from captures; drop the 20+ cadence fields from Edition (they belong on steps) |
| `ProtocolStep` | Q-D5-10, CQ-PR-02, Q-D5-11, Q-D5-12, Q-D5-06 (dose per step) | ProtocolStep, MeasurementPlan (as step kind MEASURE), Target (numeric threshold → step properties `thresholdLow/High/unit/comparator`), ProtocolAdjustmentRule (stop rules → step kind REVIEW or constraint) | stepKey + payloadHash; dose as ranges (min/max/unit/basis), never midpoints; `alternativeGroup` property for "A or B" (S1 threonate or bisglycinate); timing relative to anchor (`anchor: BEDTIME/WAKE/MEAL`, offset min/max minutes); cadence ranges ("3-4 nights per week") |
| `UseConstraint` | Q-D5-03, 04, 05, 21, 23, CQ-RC-06: the **shared blocking identity** many sources resolve to; interaction = constraint with a CO_EXPOSURE scope member | UseConstraint, Constraint (protocol-stated conditions), Contraindication/Interaction specializations' scope fields | identity key: subject means + dose band + route + jurisdiction + sorted scope members (population, condition, co-exposure); the level is NOT part of identity (different sources state different levels for the same concern) |
| `AdverseEffect` | Q-D5-07, 08, 20: filter/join by effect across labels, trials, reports | AdverseEffect | **contested with D2 Condition** (nausea, liver injury, hypermagnesemia are conditions/phenotypes). Option A: keep in D5 with MedDRA/MeSH ids; Option B: D2 `Condition` with `conditionClass: ADVERSE_EFFECT_TERM`. Recommend B if D2 accepts (saves a type) |
| (none for SafetySignal) | Q-D5-08 is an assessment | SafetySignal → D10 assessment kind SAFETY_SIGNAL | D5 requests properties: signalStatus (pinned `SignalStatus`), severity + severityScheme (CTCAE v5/v6, label wording, S23), evidenceCutoff, subject/effect/co-exposure scope |

Deferred / cut candidates: `Observation` and `ProtocolResult` (public before/after numbers such as Blueprint's biomarker percentiles, S4) → kernel Assertions with a D4 metric seam until a question needs traversal; `ProtocolAdjustmentRule` (CQ-PR-04 is value 3) → step kind REVIEW + constraint; `MeasurementPlan` → step kind MEASURE; `ContraindicationAssertion`/`InteractionAssertion` specializations → kernel Assertion predicate values (they re-declare subject/object, the bloat named in PLAN §1 item 3); `Exposure` (characterized exposure) → D12/D2 if needed for contaminants, else property bag on constraint.

## 4. Relationships: typed vs predicate vs property

Typed relationship candidates (each needs question + pattern + source + fixture):

| relationship | from → to | class | questions | fixture | temporal |
| --- | --- | --- | --- | --- | --- |
| HAS_EDITION | Protocol → ProtocolEdition | asserted (or structural if editions are minted only from snapshots) | Q-D5-10, CQ-PR-01, Q-D5-13 | FC-01 | **episode** (edition valid interval; exclusive per protocol in valid × recorded time) |
| HAS_STEP | ProtocolEdition → ProtocolStep (props: order, section) | structural | Q-D5-10, CQ-PR-02 | FC-01, FC-03 | recorded-only (edition immutable) |
| STEP_USES | ProtocolStep → D1 Compound/form ∪ D6 Product ∪ Intervention ∪ D12 FoodItem (≤ 6) | structural | Q-D5-10, 12, 06, 11 | FC-01, FC-03 | recorded-only |
| STEP_FOR_TARGET | ProtocolStep (or Edition) → Target | structural | Q-D5-10, 12, 01 | FC-01, FC-03 | recorded-only — **conflicts with vocab seamRule** (§5) |
| CONSTRAINS_USE_OF | UseConstraint → subject means (Compound ∪ Product ∪ Intervention ∪ FoodItem) | structural | Q-D5-03, 23, CQ-RC-06 | FC-02, FC-07 | recorded-only (identity) |
| CONSTRAINT_SCOPE | UseConstraint → D2 Condition ∪ population (D3 population or D5 property) ∪ co-exposure means | structural (role prop: CONDITION_PRESENT, POPULATION, CO_EXPOSURE) | Q-D5-03, 04, 21 | FC-02, FC-03 | recorded-only |
| RESOLVES_TO_CONSTRAINT | Assertion → UseConstraint | derived (read-only) | Q-D5-05, 23, CQ-RC-06 | FC-02, FC-05 | derived, method version |
| OPERATIONALIZED_BY | Target → D2 Outcome ∪ D4 Biomarker | structural (curated) | Q-D5-01, 14 | FC-04, FC-07 | recorded-only |
| STEP_DEPENDS_ON | ProtocolStep → ProtocolStep | structural | CQ-PR-02 (value 2) | FC-01 (weak) | candidate to make a property (`dependsOnStepKeys`) |
| INTERVENTION_COMPONENT | Intervention → Compound ∪ Product ∪ Intervention | structural | Q-D5-25, 28 | FC-06 | candidate to cut |

Predicate-only (`Assertion.predicate` values, no typed edge): the five target predicates from `vocab-targets.yaml` (INTENDED_FOR_TARGET, IMPROVES_TARGET, WORSENS_TARGET, NO_EFFECT_ON_TARGET, MIXED_EFFECT_ON_TARGET); CONTRAINDICATED_IN / USE_CONSTRAINED_IN / INTERACTS_WITH (subject means, object condition/population/co-exposure; resolves to a UseConstraint); CAUSES_ADVERSE_EFFECT (object AdverseEffect/Condition, with dose and frequency qualifiers); HAS_UPPER_LIMIT (value, unit, basis, population); OFFERS_INTERVENTION (D6/D7 own); RECOMMENDS (D9, derived only); FINANCIAL_INTEREST_IN (D7).

Properties / enums (proposal):
- Constraint level: reuse pinned `ConstraintLevel` and **add** `ADJUST_DOSE` (cannabidiol "dose reduction … should be considered", S6), `SEPARATE_ADMINISTRATION` (bisphosphonates "at least 2 hours before or after", S10; cyclosporine "4 hours after", S6), `DISCONTINUE_BEFORE` (AgelessRx "Stop taking … at least one month before surgery", S5); keep `levelVerbatim` and add a time-window pair (`windowMin/Max`, unit) for "avoid driving … for 5 hours" (S12).
- Interaction: `exposureChange` enum INCREASES_EXPOSURE, DECREASES_EXPOSURE, REDUCES_ABSORPTION, ADDITIVE_EFFECT, ANTAGONIZES_EFFECT, UNKNOWN; `mechanismText`; perpetrator/victim roles = subject/co-exposure scope.
- Dose: min, max, unit (UCUM), `doseBasis` (SUPPLEMENTAL_ONLY, TOTAL_INTAKE, PER_DOSE, PER_DAY, PER_WEEK), never midpoints.
- Severity: value + `severityScheme` (CTCAE_V5, CTCAE_V6, LABEL_TEXT, SOURCE_TEXT) — pinned `SafetySeverity` lacks the scheme.
- Source/evidence class on assertions (kernel `assertionBasis`): regulator label, government reference, monograph, trial, case report, spontaneous report, protocol author, clinic, community — needed for Q-D5-05, Q-D5-27.
- Target-claim class on INTENDED_FOR_TARGET: STRUCTURE_FUNCTION, DISEASE_CLAIM, APPROVED_INDICATION, PERMITTED_NHP_CLAIM, NONE_STATED (S13, S12, S6) — seam with D8 (regulatory) and D6 (label claims).

## 5. Conflicts and contested ownership to settle (copy to 11-open-questions.md)

1. **Step → Target edge vs the vocab seam rule.** `vocab-targets.yaml` forbids typed edges from a means to a Target. A protocol step is captured edition content (immutable, hashed), not a means; the step's goal ("for sleep") is part of the edition payload. Recommendation for the model stage (A5 maintains the vocab): amend `seamRule` to allow one D5-internal structural edge `ProtocolStep|ProtocolEdition -[:FOR_TARGET]-> Target` for protocol content only; every other means keeps the Assertion-only rule. Alternative: an INTENDED_FOR_TARGET assertion per step (heavier writes, no new type).
2. **Name clash "Target".** Three meanings: goal (vocab), pinned W16 metric threshold, D2 molecular target. Vocab OQ-T1 already open; the pinned numeric target becomes step threshold properties.
3. **AdverseEffect owner** (D5 vs D2 Condition) — §3.
4. **SafetySignal** as D10 assessment kind (recommended) vs D5 node (pinned OQ-L2-10).
5. **Population** as scope of constraints: D3 owns study populations; constraints need non-study populations (pregnant, < 18, on immunosuppressants, pre-surgery). Option: property-level population code list on UseConstraint scope (enum + text) vs a shared `Population` node (D3). Kernel qualifier pattern (vocab OQ-T2) must decide how a target assertion is scoped to a population.
6. **Edition boundary**: does a change only in disclosures (sponsor Thorne → Momentous) mint a new ProtocolEdition? Recommend: no — edition payload = steps + constraints; disclosures are D7 financial-interest assertions with valid time on the Protocol, so Q-D5-13 still answers "changed between editions" by interval overlap. Needs owner confirmation because CQ-PR-01 users may expect it in the diff.
7. **stepKey across in-place editions** (OPEN-QUESTIONS P2-4): FC-01 shows steps numbered 1–12 stable across 2021→2026; Blueprint list numbering restarts within sections in the extracted markdown (S4: "1. … 2. … 3. … 1. …"). Pilot: stepKey = section slug + normalized action text hash, alignment version recorded.
8. **Food as perpetrator** (grapefruit juice): D12 FoodItem as CO_EXPOSURE scope member (seam D12).
9. **Labels as sources**: SPL label versions are Sources/Snapshots (kernel/D9); regulatory status and approved indication are D8. D5 consumes label sections as locators only.
10. **Clinic programs** (AgelessRx $65/month): offering and price are D6, organization D7; D5 owns only the intervention and its constraints.
11. **Licensing**: Natural Medicines, DrugBank, Lexicomp, MedDRA are licensed (S22; MedDRA licence not checked this stage) — owner decision before they become `populatedBy` sources.

## 6. Seams expected (for 10-seams.yaml)

D1 (Compound/form as step use, constraint subject, interaction co-exposure; UL subject), D2 (Condition as constraint scope; Outcome for OPERATIONALIZED_BY; possibly AdverseEffect), D3 (StudyIntervention ↔ Intervention identity; adverse-event results as SafetySignal inputs; StudyPopulation for scoping), D4 (Biomarker for OPERATIONALIZED_BY; measurement steps), D6 (Product as step use and constraint subject; offerings/price), D7 (Person/Organization as protocol author and clinic; financial interest), D8 (approved indication, regulatory status, label claim class), D9 (protocol pages and community threads as Sources/ClaimOccurrence; recommendations), D10 (SafetySignal and applicability assessments; comparison reports; recommendation blocking), D12 (FoodItem as co-exposure and step use; dietary patterns), D13 (frontier "rapamycin in healthy humans" attaches PEARL-type events). Shared vocabularies consumed: none besides own targets; frontiers (D13) only for linking.

## 7. Retrieval-pattern hints for 03-retrieval-patterns.md

- Q-D5-01/02: QP-TARGET-01 from `vocab-targets.yaml` (direction filter), plus the protocol branch (edition → step → FOR_TARGET → Target, step → STEP_USES → means).
- Q-D5-06: two-assertion join at query time: step dose range (max) vs HAS_UPPER_LIMIT assertion for the same compound (D1 identity incl. form/moiety basis) and matching population; return NOT_COMPARABLE when basis or population differ; never store the verdict unless published.
- Q-D5-05/23: group assertions by RESOLVES_TO_CONSTRAINT target (UseConstraint identity), split by asserter and level.
- CQ-PR-01: diff two editions by stepKey and payloadHash; report snapshot timestamps; flag unobserved intervals (Wayback gaps).
- Q-D5-19: GDS — project (ProtocolEdition)-[:HAS_STEP]->(ProtocolStep)-[:STEP_USES]->(means) to a means–means co-occurrence graph (node similarity / Jaccard), method-versioned, refreshed on new editions; join pairs to INTERACTS_WITH assertions.
- Q-D5-08: assessment lookup by subject/effect with method version; inputs listed with locators.
- Bitemporal: only HAS_EDITION needs an episode; constraint and target assertions carry valid time on the Assertion (label version effective dates; monograph dates).

## 8. Readiness findings to carry into 08-sources-and-tools.md

openFDA, DailyMed (incl. history), eCFR (needs `--compressed`), CT.gov v2, E-utilities, MeSH lookup: agent-ready. ODS API: 403 Cloudflare (Tavily works). LiverTox/NCBI Bookshelf: reCAPTCHA for Tavily, Firecrawl and curl → browser fallback or bulk. Health Canada NHPID: correct `atid` needed; wrong id returns a 404 page with HTTP 200. Wayback CDX: intermittent "Temporarily Offline". `tvly` on Windows needs `PYTHONUTF8=1`. RxNav interactions discontinued 2024-01-02. No free authoritative supplement–drug interaction API.
