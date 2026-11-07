# D10 — research notes for the model stage (2026-10-08)

Audience: the agent that writes D10's 03–11 files and `report-skeletons.md`. Read with `01-ecosystem.md` (evidence), `02-questions.md` (34 rows), `fixture-candidates.md` (10 candidates, quotes verified) and `tool-log.md`. Nothing here is a decision; it is the evidence and the options, with a lean where the evidence points one way.

## 0. State of dependencies when this stage ended

- **Kernel packet K** existed only as a skeleton in this worktree (files created 16:50, no content) — the kernel ownership map and subject/object pattern were **not published**. Everything below that touches K is written against PLAN 6.1/6.2, directive 3.4–3.8 and the coordinator's default ownership list ("Claim, ClaimOccurrence, assessments, reports, AnswerRecord, PolicyVersion, DecisionCriterion → K/D10 per A1's map"). Re-read `packets/K/09-reasoning.md` before writing SDL; where it disagrees, K wins and the disagreement goes to `11-open-questions.md`.
- **Sibling 02-questions.md** existed in A2 (D1 33, D12 34), A3 (D2 34, D4 34), A4 (D3 32), A5 (D5 34), A6 (D6 37, D7 33), A7 (D8 32, D13 32); A8's D9/D11 had only the template row at 17:0x. The answer-kind decision table is written in the model stage from whatever exists then.
- **Targets vocabulary** (D5 `vocab-targets.yaml`) and **frontiers vocabulary** (D13 `vocab-frontiers.yaml`): not checked in this stage; D10 needs both as seams (comparisons are "for target T"; clusters/rankings "in frontier F").

## 1. What the ecosystem says the model must do (evidence → requirement)

| finding (01-ecosystem section) | requirement on D10 |
| --- | --- |
| Three magnesium rankings, three criteria sets, three different winners; U.S. News #1 is magnesium oxide, which Examine/ODS call poorly absorbed (§3, FC-04/05) | A ranking is a function of (candidate set, criteria@version, inputs as of R). Never a stored "best" fact. Computed at query time; a BellLabs ranking becomes a published artifact whose rows cite assertions (directive 3.5 confirmed). |
| Every grader versions its method and edits published rows: Labdoor "update … at any time", 2017 rounding change; USPSTF grade definitions changed 2007/2012; USPSTF 2022 replaces 2014; ConsumerLab row → Not Approved; ODS dated history; Examine typed history; Open Targets release 26.09 (§1–4, §8.9) | DecisionCriterion carries a version and supersession; published artifacts are insert-only with SUPERSEDES; each published *row* (not just the report) needs its own citations so one row can be re-adjudicated. |
| Secondary reports mis-transmit primaries: ODS "FDA approved" vs FDA enforcement discretion; FDA letter "960 g/day"; PubMed "Case Reports" on an RCT (§1.4, §1.5, §8.10) | Every report sentence/row traces to assertion → locator in the *primary*; a "source-fidelity" assessment kind (secondary vs primary mismatch) is worth having (Q-D10-18). |
| Open Targets: association score "should not be interpreted as a confidence score"; FAERS signals include the indication (§4.1) | Association = materialized projection with method version, components by evidence kind and input digest; never an asserted edge, never named "confidence". Signals need an interpretation assessment before any harm answer uses them. |
| LiverTox grades green tea *extract* (A) while the beverage "has not been associated" (§1.6) | The subject of a harm assessment is the most specific entity the source supports (preparation/form/product); answers must not roll a preparation-level harm up to the compound or food. |
| FDA downgraded the petitioner's "supportive" to "inconsistent and inconclusive"; Cochrane "unlikely … clinically meaningful"; USPSTF grade D (§1.1, §1.3, §1.5) | The evidence report (directive 3.4) has: claim under test, who claimed it (interest), inputs, verdict, certainty, scope, mandated qualifier, producer, date, supersession. These real artifacts are the templates. |
| Consensus/Elicit answers are login-walled and unreproducible; Consensus admits population-scope errors; Elicit caps report inputs by plan (§5) | BellLabs' AnswerRecord/Report stores the viewpoint (recorded-as-of, valid-at, schema digest, query shape, policy version, input set) and per-sentence citations; third-party AI answers are never sources. |
| GraphRAG merges entities by title+type and summarizes communities without per-sentence locators (§6.1) | Communities and similarities are retrieval aids (materialized, method-versioned, read-only); a summary that leaves the graph must be re-grounded on assertions. |
| Repo: no read op for answers/reports/comparisons/associations; planner already rejects derived-edge writes (`DERIVED_EDGE_READ_ONLY`) (§6.4) | D10 retrieval patterns need new read kinds (or `@cypher` fields) — note for D11/executor; derived read-only rule is already enforced, so D10 can rely on it. |

## 2. Candidate node types (D10 budget ≤ 8; lean is 5)

Default answer is "no node". Each candidate names the questions that must filter/join/traverse through it.

| candidate | lean | questions that traverse it | merges / replaces (pinned) | notes |
| --- | --- | --- | --- | --- |
| **Assessment** (one type, `assessmentKind` enum) | **node** | CQ-AX-24, Q-D10-03, -07, -09, -15, -18, CQ-RC-02 | EvidenceSynthesis, EvidenceStrengthAssessment, ClaimEvidenceAssessment (pinned W10/W21) and the brief's "Insight"; vetting (directive 3.4) as kind VETTING | One node with kind instead of 3–5 types. Must not re-declare kernel fields if K defines an assessment archetype/interface. Applicability (EvidenceApplicability/ApplicabilityDimension), ResultInterpretation, EndpointClassification stay with D3 — contest in 11 if D3 pushes them here. |
| **Report** (published artifact, `reportKind` enum) | **node** | CQ-AX-01, CQ-AX-03 (catalog; no packet row), CQ-AX-11, CQ-RC-01/02/03/07, Q-D10-02, -04, -12, -13, -14, -16, -23 | AnswerRecord (W23) as kind ANSWER — or keep AnswerRecord and add Report; see option below | Insert-only skeleton; body in store (`bodyUri`, `bodyDigest`). Viewpoint fields from pinned AnswerRecord (recordedAsOf, validAt, schemaDigest, queryShapeId/Version, accessTier, traceDepth, publishedAt). Kinds: EVIDENCE_REPORT, COMPARISON, COMPOUND_PROFILE, PROTOCOL_REVIEW, ANSWER. |
| **ReportItem** (row or sentence of a report) | **node, contested** | CQ-AX-01 (per-sentence trace), CQ-RC-01/06 (row disposition, rank, block), Q-D10-13 (which row is stale), ConsumerLab-style per-row re-adjudication (FC-10) | pinned RecommendationOption (private-store design, CQ-RC-01 trace) for public comparisons | Alternative: citations as edge properties `{itemKey, role}` on Report→Assertion with row data in the body. That fails CQ-RC-06 (filter blocked rows) and per-row supersession without parsing the body. Lean: node. |
| **DecisionCriterion** | **node (keep)** | CQ-RC-01/02, Q-D10-01, -10, -22 | pinned DecisionCriterion (W23) | Fields to add: `version`, `kind` (SCORE / BLOCK / FILTER / TIEBREAK), `direction` (HIGHER_BETTER / LOWER_BETTER), `inputPredicates` (which Assertion.predicate values it reads), `unitCode`, definition text; SUPERSEDES between versions. Labdoor's five criteria and USPSTF grade definitions are the real-world shape. |
| **Association** (materialized projection record) | **node, read-only** | Q-D10-05, -06, -19 (optional), CQ-AX-08, CQ-EV-02 | revives the retired `Association`; replaces typed derived shortcut edges (AFFECTS_MECHANISM, INFLUENCES_OUTCOME, ASSOCIATED_WITH_*, INCREASES_RISK_FOR …) *if* D2 agrees | Endpoints through the kernel subject/object pattern (no new union); properties: `associationKind` (EVIDENCE_AGGREGATE, SIGNAL_DISPROPORTIONALITY, CO_MENTION, SIMILARITY), `score`, `components` ("literature:0.99" …), `statistic`, `threshold`, `methodVersion`, `inputDigest`, `inputCount`, `computedAt`; WAS_GENERATED_BY a projection Activity. `@mutation(operations: [])` — only the projection job writes. The alternative (derived edges with DerivedEdgeProperties) multiplies pairs per type pair and cannot hold the breakdown cleanly. |
| PolicyVersion | **K** (lean) | CQ-AX-03, CQ-RC-02 | pinned PolicyVersion | PLAN 6.2 maps policy outcome to PolicyVersion — kernel. D10 references it. If A1's map gives it to D10, it is node 6. |
| Claim, ClaimOccurrence | **K / D9** | Q-D10-04, -21, -23 | — | D10 never declares them; seams only. |
| Insight | **no** | — | merged into Assessment (kind INSIGHT) | PLAN 6.1 rule: an Insight is an Assessment. |
| Recommendation | **no** | CQ-RC-05 | — | BellLabs recommendation = Report(kind COMPARISON/ANSWER) rows with disposition SELECTED; a person's recommendation = ClaimOccurrence (D9); RECOMMENDS stays a derived projection. |
| Community / Cluster / Similarity | **no** | Q-D10-19, -20 | — | GDS outputs streamed at query time or written as properties (`communityId`, with the projection Activity carrying method version). Expansion questions (value 3). |
| EntitySnapshot (frozen state) | **defer to K** | — | — | PLAN 6.2 open item; if K adds it, a compound profile Report could cite it. |
| UseContextProfile | **defer** | — | pinned W10 | Flagged "possibly never used" in OPEN-QUESTIONS; personalization is out of scope. Comparisons take their context as query parameters recorded on the Report. |

Size sketch at the lean (to be measured in the model stage): 5 node types (Assessment, Report, ReportItem, DecisionCriterion, Association); ~9–10 relationship types; ~20 pairs; no unions (all any-entity endpoints through the kernel pattern).

## 3. Candidate relationships (each needs question, pattern, source/tool, fixture)

| relationship | from → to | class | questions | lean |
| --- | --- | --- | --- | --- |
| ASSESSES | Assessment → Claim, Assessment → Assertion | structural | CQ-AX-24, Q-D10-03/04/09 | keep (2 pairs). If K's pattern routes "assessment subject" through the generic subject pattern, drop. |
| CONSIDERS (inputs) | Assessment → Assertion, Assessment → Assessment | structural, edge props {role: INCLUDED/EXCLUDED/CONTEXT, weight?} | Q-D10-15, CQ-RC-02 | keep; replaces pinned CONSIDERS / CONSIDERS_ASSESSMENT / INCLUDES_RESULT / BASED_ON_EVIDENCE (StudyResult inputs arrive as assertions about results). |
| SUPPORTED_BY | Assessment → SourceLocator | structural (kernel type reused) | CQ-AX-01, Q-D10-07 | reuse kernel relationship type; D10 adds pairs only. |
| SUPERSEDES | Assessment→Assessment, Report→Report, DecisionCriterion→DecisionCriterion | structural, SupersessionProperties | Q-D10-12, -13, CQ-RC-07 | keep; probably a kernel relationship type with D10 pairs. |
| HAS_ITEM | Report → ReportItem | structural | CQ-AX-01, CQ-RC-01 | keep if ReportItem is a node. |
| CITES | ReportItem → Assertion, ReportItem → Assessment, ReportItem → Association | structural, edge props {role: SUPPORTS / QUALIFIES / CONTRADICTS / CONTEXT} | CQ-AX-01, CQ-AX-11, Q-D10-13 | keep; replaces pinned CITES_ASSERTION + CITES_ASSESSMENT (two types → one type, three pairs). |
| USES_CRITERION | Report → DecisionCriterion | structural | CQ-RC-01/02, Q-D10-01/02 | keep. Alternative: PolicyVersion DECLARES_CRITERION only (pinned) — but a comparison may use a criterion subset; lean: keep both or move DECLARES_CRITERION to K with PolicyVersion. |
| UNDER_POLICY | Report → PolicyVersion | structural | CQ-AX-03, CQ-RC-02 | keep (pinned had Activity AUTHORIZED_BY PolicyVersion; a Report-level link is the one questions traverse). |
| TESTS_CLAIM / evidence report → Claim | Report(EVIDENCE_REPORT) → Claim | structural | Q-D10-04, -23 | needed unless the evidence report reaches the claim through its Assessment (Report CITES Assessment ASSESSES Claim). Lean: no new type; use the 2-hop path. |
| FOR_TARGET (seam) | Report → D5.Target; Assessment → D5.Target | structural | Q-D10-01, -08, CQ-RC-01 | needed for "for target T" filters and "what to avoid for T"; alternatively a kernel subject/object role. Decide against D5's vocab pattern. |
| BLOCKED_BY (seam) | ReportItem → D5 constraint/contraindication type | structural | CQ-RC-06 | lean: property `blockingConstraintUids` + CITES role BLOCKS instead of a typed seam (saves a seam); test against CQ-RC-06 retrieval. |
| WAS_GENERATED_BY | Assessment, Report, Association, DecisionCriterion → Activity | structural (kernel type) | directive §4 lineage | kernel type, D10 pairs. |
| ASSESSED_BY | Assessment → Agent (/Person) | structural | Q-D10-15 | possibly redundant with Activity→Agent; lean drop and read producer through WAS_GENERATED_BY Activity. |
| RECOMMENDS | Person → any | derived | Q-D10-21 | D9 owns the record (ClaimOccurrence); keep RECOMMENDS out of the GraphQL projection (stored, read through `@cypher`) or defer; pinned target union of 10 members must not return. |
| MENTIONS | Chunk → any | derived | Q-D10-17 | kernel (directive 3.8). D10 only uses it in retrieval patterns. |
| ABOUT (Report/Assessment → subject entity) | — | — | Q-D10-14, -03 | through the kernel subject pattern; never a D10 union. |

## 4. Properties, enums and Assertion.predicate values

- **Enums (D10):** `AssessmentKind` {VETTING, SYNTHESIS, STRENGTH, INSIGHT, HARM_CAUSALITY, SIGNAL_INTERPRETATION, SOURCE_FIDELITY}; `VettingDisposition` {IGNORE, MONITOR, RESEARCH} (directive 3.4); `Certainty` {HIGH, MODERATE, LOW, VERY_LOW, NOT_GRADED}; `EffectDirection` {BENEFIT, HARM, NO_EFFECT, MIXED, UNKNOWN} (directive 3.2: direction of effect on a target, never "good/bad" on an entity); `ReportKind` {EVIDENCE_REPORT, COMPARISON, COMPOUND_PROFILE, PROTOCOL_REVIEW, ANSWER}; `ReportItemKind` {SENTENCE, ROW, SECTION}; `OptionDisposition` {SELECTED, ALTERNATIVE, REJECTED, BLOCKED, NOT_EVALUATED} (CQ-RC-01/06; NOT_EVALUATED for Labdoor-style "X … Upcoming"); `CitationRole` {SUPPORTS, QUALIFIES, CONTRADICTS, BLOCKS, CONTEXT}; `CriterionKind` {SCORE, BLOCK, FILTER, TIEBREAK}; `AssociationKind` {EVIDENCE_AGGREGATE, SIGNAL_DISPROPORTIONALITY, CO_MENTION, SIMILARITY}. Kernel-owned and reused: verification verdict lattice (15 values incl. `directly_supported`, `contradicted`, `mixed_or_conflicting`, `insufficient_evidence`), policy outcome (`pass` … `abstain`), AccessTier, TraceDepth.
- **Properties, not nodes:** grading `scheme` + `schemeVersion` + `grade` (GRADE / USPSTF-2012 / LIVERTOX-LIKELIHOOD / OCEBM / BELLLABS-x) on Assessment; `populationScope`, `doseScope` text on Assessment (the subject carries preparation/form); `evidenceCutoff`; Report `missingFactKeys`, `candidateSetRule`, `uncitedSentenceCount`; ReportItem `rank`, `criterionValues` (JSON string or list of "criterionUid@v=value"), `rejectionReason`, `blockingConstraintUids`.
- **Assertion.predicate values (no typed edges), for third-party derived knowledge captured as evidence:** `assigns_grade` (USPSTF row, Examine grade), `assigns_likelihood_score` (LiverTox), `recommends_against` / `recommends_for` (guideline bodies), `requires_qualified_claim_wording` (FDA), `ranks_option` (third-party ranking row: rank, score, list, list date), `reports_association_score` (Open Targets: score, release, components), `reports_disproportionality_signal` (FAERS via openFDA/Open Targets), `classifies_citation_stance` (scite-style; only if ever ingested). Promotion to a typed edge only if a question traverses it repeatedly (e.g. if "all bodies that recommend against X" becomes value 1).

## 5. Pinned types from my fragments: merge / defer map (for 06-node-register)

| pinned type (fragment) | proposal |
| --- | --- |
| EvidenceSynthesis (W10) | mergedInto Assessment (kind SYNTHESIS) |
| EvidenceStrengthAssessment (W10) | mergedInto Assessment (kind STRENGTH; `scheme`, `level` → `scheme`, `grade`) |
| ClaimEvidenceAssessment (W21, referenced via CLAIM_EVIDENCE_BASED_ON) | mergedInto Assessment (kind SYNTHESIS or VETTING) — confirm with D9/K |
| EvidenceApplicability, ApplicabilityDimension, EndpointClassification, ResultInterpretation (W10) | owned by D3 (evidence domain); D10 cites them as assessments. Contest if D3 declines. |
| UseContextProfile (W10) | deferred (personalization out of scope; context recorded as Report query parameters) |
| AnswerRecord (W23) | mergedInto Report (kind ANSWER) — or kept if K/owner prefers; decision in 09 with pair counts |
| PolicyVersion (W23) | K (lean) |
| DecisionCriterion (W23) | keep in D10, add version/kind/direction |
| retired `Association` | revived as read-only Association projection record |
| derived edges ABOUT, MENTIONS_ENTITY, SUPPORTED_BY_CHUNK (W20/W21/…) | K / D9 (directive 3.8: MENTIONS derived retrieval projection; a chunk is never a locator, so SUPPORTED_BY_CHUNK should go) |
| RECOMMENDS (W01, union of 10) | D9 record + D10 derived projection, out of the GraphQL projection |
| AFFECTS_MECHANISM, INFLUENCES_OUTCOME, ASSOCIATED_WITH_*, INCREASES_RISK_FOR … (AssociationProjectionProperties) | propose to D2/D5: replace by Association records; contest in 11 |

## 6. Seams expected (10-seams.yaml)

- Kernel: Assertion, Claim, SourceLocator, Activity, Agent, PolicyVersion, subject/object pattern, SUPERSEDES/WAS_GENERATED_BY/SUPPORTED_BY relationship types.
- D5: Target (goal vocabulary) — FOR_TARGET from Report and Assessment; constraints/contraindications for blocked rows; Protocol for protocol-review reports.
- D9: ClaimOccurrence (recommendations by people, company claims), media containers as Sources of third-party rankings.
- D7: Organization as producer of a ranking/report and its financial interests (Labdoor certification, affiliate links, petitioner).
- D3: StudyResult / applicability assessments as cited inputs (through assertions).
- D13: Frontier vocabulary (Q-D10-20, -22).
- D1/D6/D12: subjects of comparisons and harm assessments (forms, products, preparations) — through the kernel subject pattern, not typed seams, if K's pattern allows.

## 7. Answer-kind method (for the cross-packet decision table)

Proposed rule, applied per question id:
1. **retrieved** if the answer is a set of asserted facts or a computation over them that is cheap at query time and whose correctness is fully determined by its inputs and declared criteria (includes ad hoc rankings/comparisons under DecisionCriterion@version).
2. **materialized** only if the computation is expensive or graph-global (GDS over a projection, aggregate scores over thousands of assertions) and is reused across queries; must carry method version, input digest, computing Activity, refresh cadence and a staleness bound.
3. **assessment** if the answer is a judgment that could be wrong, has a producer who answers for it, weighs inputs, and must be supersedable (synthesis, strength, harm causality, vetting, insight, source fidelity).
4. **published** only if BellLabs signs it for an audience at a time under a policy version (reports, published comparisons, answer records).
Staleness tolerance column: retrieved = live; materialized = method-specific bound (e.g. Open Targets-like release cadence); assessment = until superseded (show recorded time); published = frozen at publication (show "changed since" via Q-D10-12).

Early observation from sibling packets: several "rank/compare" questions are tagged `published` (Q-D4-24, Q-D5-18, Q-D6-03, Q-D8-19) or `materialized` (Q-D1-19, Q-D12-19, Q-D2-18). Under directive 3.5 the default for an ad hoc ranking is **retrieved** (computed under criteria), with a published variant only when BellLabs signs it; `materialized` only when the ranking input is a global score (e.g. Q-D2-18 independent-support counts). The table should record both the default and the published variant.

## 8. Report skeletons — material for `report-skeletons.md`

- **Compound profile** (Q-D10-14; magnesium as the worked example): identity and forms (D1) · what it is used for, by target (D5 vocab; Examine's "most often used for Sleep") · evidence for, per target/outcome, with assessment verdict + certainty (Assessment) · evidence against / null (Cochrane cramps, FDA "inconsistent and inconclusive") · harms, upper limits and avoid-list (ODS UL 350 mg supplemental; diarrhea by salt form) · interactions (D5) · forms compared (computed, criteria shown) · products (D6) and quality findings (D8) · open questions and missing facts · change log since last version. Every sentence is a ReportItem with CITES.
- **Product comparison** (CQ-RC-01, Q-D10-02; magnesium products for sleep): candidate-set rule · criteria table (DecisionCriterion@version, kind, direction) · rows (option, disposition, rank, criterion values each citing assertions) · blocked rows with constraint · missing/disputed facts (CQ-RC-03) · producer interests (BellLabs and any cited third-party ranker) · policy version · as-of.
- **Protocol review** (Q-D10-16): protocol edition (D5) · per step: evidence verdict (supports / contradicts / none found) with locators · per step: constraints and cautions (stated vs omitted, Q-D5-11) · dose checks against ULs (Q-D5-06) · overall verdict with certainty · what would change it.
- **Evidence report** (directive 3.4, Q-D10-04): claim under test · claimant and interest · vetting disposition and date · mission run id · inputs considered (with roles) · verdict on the lattice + certainty + scope · qualifier wording (FDA pattern) · what would overturn it.

## 9. Fixture plan (for the fixtures stage)

- fixture-01 **unstructured-to-entity**: FC-02 (bisglycinate RCT) — question → chunk ("Primary Endpoint: Insomnia Severity Index") → assertion → locator (quote 4 / abstract quote 3) → snapshot sha256 `85a35d77…`.
- fixture-02 **disconfirmation**: FC-03 (FDA magnesium QHC letter) as an external evidence report: Claim (proposed wording) → Assessment (STRENGTH: inconsistent and inconclusive) → Report (EVIDENCE_REPORT) citing locators on pp. 1, 22, 27–28; plus the 960 g/day unit slip as a SOURCE_FIDELITY assessment.
- fixture-03 **harm**: FC-06 (LiverTox green tea extract A / ashwagandha B) → Assessment (HARM_CAUSALITY, scheme LIVERTOX-LIKELIHOOD) on the preparation; avoid-list row for cirrhosis.
- fixture-04 **comparison**: FC-04 + FC-05 → two third-party rankings as `ranks_option` assertions; a BellLabs computed comparison under DecisionCriterion@v1 citing ODS form-bioavailability assertions; shows why the winners differ.
- optional fixture-05 **association**: FC-08 (Open Targets) — external score captured as `reports_association_score` assertion vs a BellLabs Association record.
Every `assertions.yaml` needs `producedBy: { missionId, runId }` (directive §4); use the run's placeholder mission/run ids until K defines the format.

## 10. Open questions to carry into 11-open-questions.md

1. Report granularity: ReportItem nodes per sentence/row vs citation edge properties — decided by CQ-RC-06 filtering and per-row re-adjudication (FC-10). Owner: D10 (with K for CITES).
2. AnswerRecord vs Report: one type with kind ANSWER, or two types? Evidence: field overlap (viewpoint fields) and whether answer logs (OPEN-QUESTIONS "ad hoc answer logs") are ever stored. Owner: K/D10.
3. Evidence-report verdict vocabulary: the verification.v1 semantic lattice judges support of a claim by located evidence; an evidence mission's outcome ("claim survived the disqualification attempt") is closer to the `worldCorrectness` orthogonal property in `JudgmentSchema`. Map or add a D10 enum (SURVIVED / DISQUALIFIED / INCONCLUSIVE)? Owner: K.
4. Association node vs derived edges: does D2 accept replacing AFFECTS_MECHANISM / INFLUENCES_OUTCOME shortcuts with Association records read through the subject pattern? Evidence: pair counts both ways. Owner: D2/D10.
5. GDS availability: which Neo4j edition/deployment runs GDS (Aura Graph Analytics vs AuraDS vs self-managed EE with license key)? Decides whether materialized associations and similarities are in-DB or offline. Owner: owner/D11.
6. External derived scores (Open Targets, FAERS signals, third-party rankings): stored as assertions by the external producer (lean) or ignored and recomputed? Owner: D10/D11.
7. Where does PolicyVersion live, and is DECLARES_CRITERION (PolicyVersion→DecisionCriterion) kernel or D10? Owner: K.
8. Target seam form: typed FOR_TARGET edge vs kernel subject role. Owner: D5/K.
9. Read surface: new executor read kinds (`report.read`, `comparison.compute`, `association.read`) vs `@cypher` fields — the slim GraphQL budget favors read intents. Owner: D11/K.
10. Directive conflict to record: the contract's polarity column has three values; disconfirmation rows are tagged `harm` in 02-questions.md — confirm that is acceptable to the synthesizer.
