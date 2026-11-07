# D10 — summary: derived knowledge (associations, insights, reports, recommendations)

**What the domain is.** Everything BellLabs knows *by computing or judging* rather than by capturing: rankings and comparisons, the composition of published artifacts (profiles, comparisons, protocol reviews, evidence reports, frontier briefs, published answers), and materialized associations. After the kernel ownership map, Claim, Assessment and Report are kernel types; D10 owns the decision criteria, the composed parts of a report, and the association projection, plus three distinctions (directive 3.5, 3.6; PLAN 6.1): a ranking is computed until published; an external score is an assertion by its producer, never an Association; an association is a regenerable BellLabs projection, an insight is an assessment, a report cites both.

**Headline counts** (final state after the cross-packet answer-kind pass, 2026-10-08; packet-check `ok: true`, exit 0; budget 8 / 14 / 35): 3 node types (DecisionCriterion, ReportItem, Association), 6 relationship types (HAS_ITEM, ASSESSES*, DERIVED_FROM*, BLOCKED_BY, USES_CRITERION, ASSOCIATES; * kernel types with kernel meaning, so +4 to the assembled schema), 9 pairs, no unions; 36 questions (13 harm/disconfirmation under the rule stated in 02); 5 fixtures from real sources. Executable delta: +96,999 bytes, +42 input types over the kernel plus a scratch `UseConstraint` stub (the pre-review module costs +100,102 / +45 on the same kernel); measured on kernel SDL sha256:b2c2b1b0…d5c7, still the current K file at handoff. Re-measure in synthesis if the kernel changes.

**Adversarial review (2026-10-08)**: 25 findings plus the check-stage issues. 23 were fixed, 1 partly rebutted, and 1 was overtaken by a sibling change made in parallel; see RUNLOG. The main changes:
- `ReportItem.citesAssociations` cut.
- BLOCKED_BY now targets D5 `UseConstraint`.
- Association is BellLabs-computed only, no longer Subjectable.
- A ROW ASSESSES exactly its option.
- FDA fixture corrected: three qualified wordings, and the unit slip settled from the letter's own p. 22.
- Examine's "August 31" re-read as a stale Tavily extraction.

**Fixtures** (66 assertions, 7 assessments, 2 adjudications, 5 draft reports / 22 items, 6 criterion versions, 1 association, 2 D5 use constraints; 78 locators on 24 snapshots, every one computed from bytes; every item's body citations equal its ledger; intents validated against `IngestionIntent`):
- `mg-bisglycinate-rct-unstructured` (unstructured-to-entity). Question → JATS section chunk (BM25 rank 1, executed; the vector and MENTIONS hops are described, not executed) → ISI result and effect-size assertions → TEXT_QUOTE locators → snapshot sha256:85a35d77… → re-selection verdict. Includes a draft profile and the PubMed "Case Reports" mis-index as a fidelity assessment.
- `fda-qhc-magnesium-disconfirmation` (disconfirmation). "Supportive" vs "inconsistent and inconclusive" as two claim occurrences, and the three qualified wordings. Strength assessment MIXED_OR_CONFLICTING; draft evidence report. Two fidelity cases: the letter's p. 23 "960 g/day" against its own p. 22 "960 mg/day", and ODS calling the claim "approved".
- `livertox-green-tea-extract-harm` (harm). Likelihood A / B; the extract row is BLOCKED by a harm assessment (with LiverTox's "not observed" and "undoubtedly low" qualifiers); the ashwagandha row is BLOCKED by a D5 UseConstraint (cirrhosis).
- `mg-rankings-criteria-comparison`. Labdoor and U.S. News rows as producer assertions; versioned criteria; DSLD label facts; a draft comparison with SELECTED, ALTERNATIVE, BLOCKED (D5 UseConstraint, > 350 mg/day) and NOT_EVALUATED rows.
- `opentargets-association-signal`. Open Targets scores and the FAERS LRT as assertions by Open Targets. One BellLabs Association: PRR 76.4 for sirolimus and transplant rejection, from four openFDA counts. The signal is judged indication-confounded by an assessment about the drug and the event.

**Five highest-value questions**
1. CQ-RC-06 — can a contraindication or upper limit block an option rather than lower its score (BLOCKED rows with BLOCKED_BY to the D5 UseConstraint and its resolving, located Assertion)?
2. CQ-RC-01 / Q-D10-02 — why was one option preferred, which were rejected or blocked, under which criteria versions?
3. Q-D10-17 / CQ-AX-01 — for an answer, which chunk, assertion, locator, snapshot and verdict stand behind each sentence?
4. Q-D10-03 — what is the evidence *against* X for target T, with verdict and scope?
5. Q-D10-24 / Q-D10-01 — which published recommendations does a later constraint now block, and which option ranks best for target T under criteria version V (computed, labelled "not published")?

**Three biggest cuts**
1. No D10 Assessment, Report, AnswerRecord or Recommendation types: kernel Assessment (kind/subkind) and Report (reportKind, skeletonKey) carry them; D10 adds only ReportItem for composition.
2. No stored RECOMMENDS projection, no derived score edges, no ReportItem → Association citation: a person's recommendation is a claim occurrence read in two hops; a scored association is an Association record.
3. No PolicyVersion, RankingMethod, Comparison or community/similarity node: policy is a kernel string id, a criteria set is (criteriaSetKey, version) on DecisionCriterion, an unpublished comparison is not stored.

**Three biggest risks**
1. The write surface does not exist: biotech-knowledge-intent.v1 has no kinds for Report + items, Assessments or Associations, and none for a predicate-only assertion with an entity object (11-open-questions #27, #28).
2. Contested seams the synthesizer must rule on: BLOCKED_BY → UseConstraint vs D5's "Assertion is sufficient" (#19), and the method score on D2's AFFECTS_MECHANISM vs Association (#15, #37).
3. The comparison engine (rule grammar, BLOCK before SCORE, NOT_EVALUATED on unknown inputs) is new code; until it exists rankings are hand-built (fixture `computedRanking`). Identity seams (most-specific subject, label versions, product classes, author groups; #30–#33) decide whether derived records are correct.

**Files**: `report-skeletons.md` (compound profile, product comparison, protocol review, evidence report, frontier brief), `answer-kind-table.md` (method + cross-packet table over all 475 question rows of K and D1–D13: retrieved 345, materialized 20, assessment 90, published 20; 17 disagreements and 5 shared CQ ids declared with different kinds, for the synthesizer; regenerated by `_notes/answer_kind_extract.py` + `_notes/answer_kind_table.py`), `09-reasoning.md` (decisions, sizes, fixture evidence), `11-open-questions.md` (46 entries, 7 closed), `08-sources-and-tools.md` (25 rows). Research is not medical advice.
