# D10 — report skeletons

Model stage (Wave 2), A1, 2026-10-08. A required D10 deliverable (directive 3.4–3.5; brief "three worked report skeletons"), referenced from `09-reasoning.md` and `03-retrieval-patterns.md`. Research is not medical advice; these are the shapes of published artifacts, not content.

A **skeleton** is the ordered list of sections a published artifact of one kind must have, what each section is about, what it must cite, and which retrieval pattern fills it. In the graph a published artifact is one kernel `Report` (reportKind, policyVersion, bodyDigest, verdict for an evidence report, WAS_GENERATED_BY the composing Activity) plus D10 `ReportItem`s:

```
(:Report {reportKind, policyVersion, bodyDigest, ledgerDigest, publishedAt, supersedesUid})
   -[:HAS_ITEM {orderIndex}]->(:ReportItem {itemKind: SECTION|ROW, sectionKind, itemKey, parentItemKey,
                                            disposition, rank, cellValues, reason, missingFactKeys,
                                            bodyStartOffset, bodyEndOffset, uncitedSentenceCount})
   (:ReportItem)-[:ASSESSES]->(option or section entity)          kernel type, "is about"
   (:ReportItem)-[:DERIVED_FROM]->(:Assertion | :Assessment)
   (:ReportItem)-[:BLOCKED_BY]->(:UseConstraint (D5) | :Assessment) BLOCKED rows only; UseConstraint <-[:RESOLVES_TO_CONSTRAINT]- Assertion
   (:Report)-[:USES_CRITERION]->(:DecisionCriterion)                 any report with an OPTIONS section
   (:Report)-[:ASSESSES]->(subject entities, Target, Claim)          kernel
   (:Report)-[:DERIVED_FROM]->(...) and -[:HAS_EVIDENCE]->(:SourceLocator)   kernel minimum citation set
```

## 0. Rules common to every skeleton

1. **Insert-only.** A report and its items are written once by the composing Activity (ANSWER or EVIDENCE_MISSION) in one transaction (`report.publish` intent). A revision is a new Report naming `supersedesUid`; items are never edited.
2. **Citation floor.** Every section whose `sectionKind` is in {EVIDENCE_FOR, EVIDENCE_AGAINST, HARMS_AND_AVOIDANCE, INTERACTIONS, VERDICT, OPTIONS, PROTOCOL_STEP, USES_BY_TARGET} must have `uncitedSentenceCount = 0` to publish under the publishing policy; SCOPE, IDENTITY, OPEN_QUESTIONS and CHANGES may carry uncited framing sentences, which are counted. The report-level `citationCompleteness` (verification.v1) is recorded on the Report and the item-level value on each item.
3. **Primaries, not retellings.** A sentence about a regulator's, grader's or trial's finding cites the Assertion captured from the primary (FDA letter, LiverTox monograph, JATS full text), never a secondary that retells it; a known misstatement is cited only inside a RETELLING_FIDELITY assessment (Q-D10-18).
4. **Most specific subject.** A harm or effect statement is about the entity the source names (green tea *extract*, magnesium *bisglycinate* at 250 mg/day elemental), and its item `ASSESSES` that entity; a compound-level page lists it under that subject and never rolls it up.
5. **Unknown is not absent.** Missing inputs are `missingFactKeys` and `NOT_EVALUATED` rows, never zeros or omitted rows.
6. **Direction, not virtue.** No item says an option is "good" or "bad"; it carries a rank under a named criteria set, a disposition with a reason, or cites an assessment whose `effectDirection` and `verdict` say what the evidence shows for which target and population.
7. **Staleness.** A published report is frozen; Q-D10-13 lists it in the stale-report queue as soon as any cited input is closed, rejected or re-adjudicated; the successor's CHANGES section lists what changed (Q-D10-12).
8. **Skeleton id.** Each skeleton has a key (`d10.compound-profile@1` …) written to the kernel field `Report.skeletonKey` (K 09 "Kernel pattern changes" 4; adversarial-review stage: this rule previously said the kernel had no such field).
9. **Row rule.** A ROW `ASSESSES` exactly one entity, its option (a product, form, compound, protocol step). The target, population or other context of a row is on the enclosing SECTION's or the Report's `ASSESSES`; the scope of a block (population, condition, dose band) is the blocking D5 `UseConstraint`'s. So `(row {itemKind:'ROW'})-[:ASSESSES]->(opt)` never returns a target or a population as an option (adversarial-review stage).
10. **Blocking.** A BLOCKED row has `BLOCKED_BY` to the D5 `UseConstraint` that states the concern (upper limit, contraindication, interaction) and/or to a harm Assessment when no source states a use concern; it also cites (DERIVED_FROM) the resolving Assertion and the fact that triggers the block (e.g. a CALCULATED daily amount).

---

## 1. Compound profile — `d10.compound-profile@1` (reportKind PROFILE)

Serves Q-D10-14 (and CQ-AX-01, Q-D10-03, Q-D10-07, Q-D10-08 when published). Worked example: magnesium.

| # | sectionKind | item kind | ASSESSES (about) | must cite (DERIVED_FROM) | filled by (03 pattern) | magnesium example (fixture) |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | SCOPE | SECTION | the compound | none (framing; counted) | — | which forms and targets the profile covers; recorded as-of; policy version |
| 2 | IDENTITY | SECTION | the compound and its forms (D1) | identity Assertions (D1), identifier links (kernel) | D1 patterns | magnesium; forms oxide, citrate, glycinate/bisglycinate, threonate (D1 form records) |
| 3 | USES_BY_TARGET | SECTION (+ ROW per target) | Target nodes (D5 vocabulary) | `INTENDED_FOR_TARGET` / `IMPROVES_TARGET` Assertions with their asserter (label, source, author) | QP-TARGET-01 (D5), "what is this for" | sleep, cramps, blood pressure; each row says who claims it |
| 4 | EVIDENCE_FOR | SECTION (+ ROW per target × form) | form + Target | Assessments (EVIDENCE_SYNTHESIS) and the trial-result Assertions they rest on | Q-D10-03 (benefit direction), CQ-AX-24 | bisglycinate, 250 mg/day elemental, adults with self-reported poor sleep: ISI −3.9 vs −2.3 at week 4, p = 0.049, Cohen's d = 0.2 ("small") — fixture `mg-bisglycinate-rct-unstructured` |
| 5 | EVIDENCE_AGAINST | SECTION (+ ROW per finding) | form or Claim + Target | null or negative Assessments; EVIDENCE_REPORT verdicts; `NO_EFFECT_ON_TARGET` and `CHARACTERIZES_EVIDENCE_STRENGTH` Assertions | Q-D10-03 | FDA: the blood-pressure evidence "is inconclusive because the results of the studies are inconsistent" — fixture `fda-qhc-magnesium-disconfirmation`; the Cochrane cramps review (FC-01) |
| 6 | HARMS_AND_AVOIDANCE | SECTION (+ ROW per harm × population; BLOCKED rows) | SECTION: preparation or form + population; ROW: the preparation or form only (rule 9) | harm Assessments (effectDirection HARM), upper-limit and contraindication Assertions; BLOCKED_BY → D5 UseConstraint or harm Assessment on blocked rows | Q-D10-07, Q-D10-08, CQ-RC-06 | supplements "do not provide more than 350 mg magnesium combined" (FDA p. 24); diarrhea by salt form (ODS) |
| 7 | INTERACTIONS | SECTION (+ ROW per interacting agent) | the compound + the interacting entity | D5 interaction Assertions or interaction-risk Assessments | D5 patterns | D5 records |
| 8 | OPTIONS | SECTION + ROWs | each form | the computed comparison inputs (Q-D10-01) frozen as rows; USES_CRITERION on the Report | Q-D10-01 | forms compared under `bl:compare:mg-forms-for-sleep@1` (elemental amount, absorption evidence, UL block) |
| 9 | PRODUCTS_AND_QUALITY | SECTION (+ ROW per product) | products (D6) | D6 label Assertions, D8 quality, COA and enforcement Assertions | D6, D8 patterns | products using bisglycinate; the trial material's manufacturer named in the paper (D6 seam) |
| 10 | OPEN_QUESTIONS | SECTION | the compound | none, or the Assertions that show the gap | CQ-RC-03 | the RCT has no objective sleep measure; it co-delivers 1.5 g/day glycine (attribution caveat) |
| 11 | CHANGES | SECTION | the compound | the closed and new inputs since the superseded profile | Q-D10-12 | first version: none |

Rules specific to the profile: sections 4–6 list findings per form and target, never "magnesium helps sleep" at compound level; section 8 is a frozen copy of a computed comparison, so it obeys skeleton 2's row rules.

---

## 2. Product comparison — `d10.product-comparison@1` (reportKind COMPARISON)

Serves CQ-RC-01, CQ-RC-02, CQ-RC-03, CQ-RC-06, Q-D10-02 and the published variants of Q-D1-19, Q-D4-24, Q-D5-18, Q-D6-03, Q-D8-19, Q-D12-19. Worked example: magnesium products for sleep. Directive 3.5: this artifact exists only when BellLabs publishes a comparison; until then the same rows are computed by Q-D10-01 and labeled "not published".

| # | sectionKind | item kind | ASSESSES | must cite | filled by | magnesium example |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | SCOPE | SECTION | the Target (`target:sleep`) and the category | the candidate-set rule (in the body) and the read-intent digest (`Report.queryDigest`) | Q-D10-01 step 2 | products declaring a magnesium form and asserted `INTENDED_FOR_TARGET target:sleep`, US market, as of R |
| 2 | CRITERIA | SECTION | none | USES_CRITERION → each DecisionCriterion version (declared on the Report) | Q-D10-01 step 1 | `bl:compare:mg-forms-for-sleep@1`: SCORE elemental magnesium per maximum daily dose; SCORE absorption evidence (assessment verdict); BLOCK daily supplemental dose above 350 mg; TIEBREAK price per 100 mg elemental (D6) |
| 3 | OPTIONS | SECTION + ROW per option | the option (product or form) | per cell, the Assertion or Assessment named in `cellValues`; DERIVED_FROM all of them | Q-D10-01 step 3 + engine | rows with disposition SELECTED / ALTERNATIVE / REJECTED / NOT_EVALUATED, rank, cellValues |
| 4 | OPTIONS (blocked) | ROW (`parentItemKey` = the OPTIONS section) | the option | BLOCKED_BY → the D5 UseConstraint (or a harm Assessment); DERIVED_FROM the resolving Assertion and the triggering fact; rank null | CQ-RC-06 | a product whose maximum daily serving exceeds 350 mg supplemental magnesium |
| 5 | MISSING_OR_DISPUTED | SECTION | options with gaps | the disputed Assertions; `missingFactKeys` on rows | CQ-RC-03 | products a ranker lists without a score ("Upcoming" on Labdoor) are NOT_EVALUATED, not last |
| 6 | INTERESTS | SECTION | producers (D7) | D7 interest Assertions for every third-party ranker cited, and BellLabs' own disclosure | Q-D10-10 | Labdoor certification status shown beside grades; U.S. News affiliate links |
| 7 | CHANGES | SECTION | none | inputs closed since the previous version | Q-D10-12, CQ-RC-07 | none |

Row rules: `rank` is unique among SELECTED, ALTERNATIVE and REJECTED rows; BLOCKED and NOT_EVALUATED rows have rank null; every `cellValues` entry names one criterion uid@version present in CRITERIA; third-party rankings appear only as cited `RANKS_OPTION` Assertions in a cell or in INTERESTS, never as BellLabs rows. Example: U.S. News's first-ranked magnesium oxide product is a pharmacist-survey result asserted by U.S. News, which itself states it "does not recommend or endorse any health products listed here"; under an absorption criterion (Examine: oxide has "extremely poor absorption") it does not rank first (Q-D10-11).

---

## 3. Protocol review — `d10.protocol-review@1` (reportKind PROFILE about a D5 protocol edition)

Serves Q-D10-16 and the published variants of Q-D5-06, CQ-EV-04 (D3/D5 row), Q-D5-11. Worked example: a public sleep protocol step "magnesium 500–600 mg/day" (the D5 Q-D5-06 example).

| # | sectionKind | item kind | ASSESSES | must cite | filled by | example |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | SCOPE | SECTION | the protocol edition (D5 state) | the edition's state-attachment Assertion | D5 patterns | protocol author, edition, captured version |
| 2 | PROTOCOL_STEP | SECTION per step (ordered by orderIndex) | the step (D5) and its means | evidence Assessments for the step's means × target (supports / contradicts / none found); applicability Assessments (D3) for dose, form and population | Q-D10-03, CQ-EV-04 (D3/D5), Q-D10-16 | step "magnesium glycinate 500–600 mg/day for sleep": cites the 250 mg/day bisglycinate RCT with an APPLICABILITY assessment noting the dose mismatch |
| 3 | PROTOCOL_STEP (constraint rows) | ROW per constraint under its step | the step | BLOCKED_BY → the UL or contraindication UseConstraint (D5; BLOCKED for the population in its scope), or cites a caution (ALTERNATIVE with reason) | CQ-RC-06, Q-D5-06 | a dose above the 350 mg supplemental UL is BLOCKED for the population the UL applies to |
| 4 | INTERACTIONS | SECTION | pairs of steps | D5 interaction Assertions between the steps' means | Q-D5-19 (co-occurrence) + the D5 interaction pattern | none in the example |
| 5 | VERDICT | SECTION | the protocol edition | the step-level Assessments and one overall Assessment (EVIDENCE_SYNTHESIS, subkind D10.protocol-review) with its verdict | Q-D10-16 | overall MIXED_OR_CONFLICTING; one step blocked for one population |
| 6 | OPEN_QUESTIONS | SECTION | none | what would change the verdict (missing trials, dose-matched evidence) | CQ-RC-03 | none |

Rules: a step with no located evidence is "none found" (an item with no evidence citation and a `missingFactKeys` entry), never omitted; cautions a protocol omits are listed under the step (D5 Q-D5-11).

---

## 4. Evidence report — `d10.evidence-report@1` (reportKind EVIDENCE_REPORT; directive 3.4)

Serves Q-D10-04, Q-D10-23, Q-D2-28, Q-D9-22: the outcome of an evidence mission that tried to disqualify a vetted claim. Worked example: the FDA magnesium letter is the external analog (fixture `fda-qhc-magnesium-disconfirmation`); a BellLabs report has the same shape with BellLabs as producer.

| # | sectionKind | item kind | ASSESSES | must cite | example |
| ---: | --- | --- | --- | --- | --- |
| 1 | CLAIM_UNDER_TEST | SECTION | the Claim | the claim occurrences (Assertions, assertionKind CLAIM) with their locators; the VETTING Assessment (disposition RESEARCH) | the petitioner's proposed wording "Supportive but inconclusive scientific evidence suggests …" (FDA p. 1) |
| 2 | INTERESTS | SECTION | the claimant (D7) | D7 interest Assertions of the claimant | the petitioner as an interested party |
| 3 | EVIDENCE_FOR / EVIDENCE_AGAINST | SECTION (+ ROW per input) | the Claim | the Assertions and Assessments the mission weighed; the Assessment's HAS_EVIDENCE roles SUPPORTS / CONTRADICTS | "this evidence is inconclusive because the results of the studies are inconsistent" (p. 22) |
| 4 | VERDICT | SECTION | the Claim | the mission's EVIDENCE_SYNTHESIS Assessment (verdict on the verification.v1 lattice, scope, certainty); the Report's own `verdict` mirrors it | "describing the level of evidence for the claim as "supportive" overstates and therefore mischaracterizes the strength of the evidence" (p. 27) → MIXED_OR_CONFLICTING |
| 5 | HARMS_AND_AVOIDANCE | SECTION or ROW | the claim's subject + population (a ROW: the subject only) | conditions attached to the outcome (UL, population) | "do not provide more than 350 mg magnesium combined" (p. 24), a factor FDA intends to consider in its enforcement discretion |
| 6 | OPEN_QUESTIONS | SECTION | the Claim | what would overturn the verdict | none |

Lineage: the Report is WAS_GENERATED_BY the EVIDENCE_MISSION Activity (missionId, runId), which ASSESSES the Claim (kernel `Activity.about`) and WAS_INFORMED_BY the VETTING Activity (kernel Q-K-08). The mandated qualifiers (three wordings FDA lists on p. 28, the first "Inconsistent and inconclusive scientific evidence suggests …") are `REQUIRES_QUALIFIED_CLAIM_WORDING` Assertions cited in EVIDENCE_AGAINST.

---

## 5. Frontier progress brief — `d10.frontier-brief@1` (reportKind PROFILE about a D13 Frontier)

Added in the adversarial-review stage (11-open-questions #17) so that D13's seam for Q-D13-29 names a skeleton that exists. Uses existing `ReportSectionKind` values only; no fixture in this run.

| # | sectionKind | item kind | ASSESSES | must cite | filled by |
| ---: | --- | --- | --- | --- | --- |
| 1 | SCOPE | SECTION | the Frontier (D13) | none (framing; counted): the frontier definition, as-of, policy version | — |
| 2 | OPTIONS | SECTION (+ ROW per milestone event, ordered by the event's valid time) | SECTION: the Frontier; ROW: the milestone Event (D13) | the event's time, link and ON_FRONTIER Assertions (D13) | D13 milestone patterns (Q-D13-29) |
| 3 | EVIDENCE_AGAINST | SECTION (+ ROW per setback event) | SECTION: the Frontier; ROW: the setback Event | the setback Assertions and any EVENT_IMPACT Assessment (kernel kind) | D13 patterns |
| 4 | INTERESTS | SECTION | the organizations behind the milestones (D7) | D7 financing and role Assertions; financing totals are read at query time (Q-D13-23 retrieved), never a stored aggregate | D13/D7 patterns |
| 5 | OPEN_QUESTIONS | SECTION | the Frontier | scheduled milestones not yet reached (announced readouts, PDUFA dates) as Assertions with their own valid time | D13 patterns |
| 6 | CHANGES | SECTION | the Frontier | what changed since the superseded brief (Q-D10-12) | Q-D10-12 |

Rules: a milestone row cites the Assertions that date and classify the event, never the frontier's narrative; "breakthrough" is a BREAKTHROUGH_JUDGMENT Assessment (kernel kind) cited by the row, never a property of the event.
