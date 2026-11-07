# D10 — retrieval patterns

Model stage (Wave 2), A1, 2026-10-08. Kernel names follow `packets/K/04-schema-proposal.graphql`: `(a:Assertion)-[:HAS_SUBJECT|HAS_OBJECT]->(x)`, `(a)-[:ASSERTED_BY]->(who)`, `(a|adj|s|r)-[:HAS_EVIDENCE {role, origin}]->(loc:SourceLocator)`, `(snap:SourceSnapshot)-[:HAS_LOCATOR]->(loc)`, `(src:Source)-[:HAS_SNAPSHOT]->(snap)`, `(adj:Adjudication)-[:ASSESSES]->(a)`, `(s:Assessment|r:Report)-[:ASSESSES]->(x)`, `(s|r|item|assoc)-[:DERIVED_FROM]->(a|s)`, `(a)-[:OCCURRENCE_OF]->(c:Claim)`, `(n)-[:WAS_GENERATED_BY]->(act:Activity)`, `(act)-[:WAS_INFORMED_BY]->(act0)`. D10 adds `(r:Report)-[:HAS_ITEM]->(i:ReportItem)`, `(i)-[:ASSESSES]->(option)` (a ROW ASSESSES exactly its option), `(i)-[:DERIVED_FROM]->(a|s)`, `(i)-[:BLOCKED_BY]->(uc:UseConstraint|s:Assessment)` (D5 `(uc)<-[:RESOLVES_TO_CONSTRAINT]-(a:Assertion)`), `(r)-[:USES_CRITERION]->(c:DecisionCriterion)`, `(assoc:Association)-[:ASSOCIATES]->(x)`, `(assoc)-[:DERIVED_FROM]->(a)`.

Shared fragments (written out once, referenced by name below):

- **ASOF(x)** — recorded-time as-of on any immutable record: `x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf)`. `$asOf` defaults to `datetime()`. Reports and report items are insert-only (no `recordedTo`); a report is current at `$asOf` when `NOT EXISTS { MATCH (r2:Report {supersedesUid: r.uid}) WHERE r2.recordedAt <= $asOf }`.
- **VALIDAT(a)** — optional valid-time point on an Assertion: `$validAt IS NULL OR ((a.validFrom IS NULL OR a.validFrom <= $validAt) AND (a.validTo IS NULL OR a.validTo > $validAt))`.
- **TRACE(a)** — provenance of one Assertion down to bytes, the path the verifier re-selects (directive 3.8, 3.10):
  ```cypher
  MATCH (a)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
  MATCH (a)-[:ASSERTED_BY]->(asserter)
  OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(a) WHERE ASOF(adj)
  OPTIONAL MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity)
  RETURN a.uid, a.predicate, a.status, asserter.uid, ev.role,
         loc.selectorKind, loc.exact, loc.page, loc.startOffset, snap.contentHash, snap.retrievedAt, src.canonicalUri,
         collect(adj{.verdict, .adjudicationKind, .methodVersion}) AS adjudications, act.missionId, act.runId
  ```
- **STRACE(s)** — an Assessment's trace: `(s)-[:DERIVED_FROM]->(in:Assertion)` then TRACE(in); `(s)-[:HAS_EVIDENCE]->(loc)` for the spans it quotes; `(s)-[:WAS_GENERATED_BY]->(act)-[:WAS_ASSOCIATED_WITH]->(agent)` for the producer.

Bitemporal summary: no D10 relationship carries an episode. Every D10 edge is part of an immutable record (a published report and its items, a criterion version, an association computed by one run); time lives on the record node (`recordedAt`, `recordedTo`, `supersedesUid`, and `validFrom/validTo` on DecisionCriterion). Patterns that need valid time read it from the kernel Assertion (VALIDAT). See 09-reasoning.md "Bitemporal decision per edge".

## CQ-AX-24

- kind: cypher
- question: how strong is the evidence for claim C (never a stored `evidenceStrength` attribute).
- pattern:

```cypher
MATCH (c:Claim {uid: $claimUid})
// BellLabs assessments: current (non-superseded) strength / synthesis assessments about the claim
OPTIONAL MATCH (s:Assessment)-[:ASSESSES]->(c)
WHERE s.assessmentKind = 'EVIDENCE_SYNTHESIS' AND s.status = 'ACCEPTED' AND ASOF(s)
// third-party graded verdicts captured as assertions (USPSTF, GRADE, LiverTox, FDA wording)
OPTIONAL MATCH (g:Assertion)-[:HAS_SUBJECT]->(c)
WHERE g.predicate IN ['ASSIGNS_GRADE','ASSIGNS_LIKELIHOOD_SCORE','CHARACTERIZES_EVIDENCE_STRENGTH'] AND ASOF(g)
// the latest evidence report on the claim, if any
OPTIONAL MATCH (r:Report {reportKind: 'EVIDENCE_REPORT'})-[:ASSESSES]->(c)
RETURN c.proposition,
       collect(DISTINCT s{.uid, .verdict, .assessmentSubkind, .methodVersion, .summary, .evidenceCutoffAt, .recordedAt}) AS assessments,
       collect(DISTINCT g{.uid, .predicate, .valueString, .qualifiers}) AS gradedByOthers,
       collect(DISTINCT r{.uid, .verdict, .publishedAt, .policyVersion}) AS reports
```

- trace: STRACE(s) for each assessment; TRACE(g) for each third-party grade (the locator is the grader's own page: USPSTF table cell, LiverTox `nxml` section, FDA letter page).
- bitemporal episode needed on: none (assessments and assertions carry recorded time; `$asOf` replays "what did we say on date D").

## CQ-AX-01

- kind: cypher
- question: for each factual sentence in a published answer or report, which assertion, locator and adjudication stands behind it, and which sentences have none.
- pattern:

```cypher
MATCH (r:Report {uid: $reportUid})-[h:HAS_ITEM]->(i:ReportItem)
OPTIONAL MATCH (i)-[:DERIVED_FROM]->(a:Assertion)
OPTIONAL MATCH (i)-[:DERIVED_FROM]->(s:Assessment)
RETURN i.itemKey, i.sectionKind, h.orderIndex, i.bodyStartOffset, i.bodyEndOffset,
       i.uncitedSentenceCount, i.citationCompleteness,
       collect(DISTINCT a.uid) AS assertions, collect(DISTINCT s.uid) AS assessments
ORDER BY h.orderIndex
// then, per assertion uid: TRACE(a)
```

- Sentence level: the sealed report ledger (`Report.ledgerDigest`, verification.v1 `report_assertion` with offsets and citations) maps each sentence to citation uids; the item's body offsets place each sentence in an item; `uncitedSentenceCount` is the per-item count of ledger sentences with no citation. The graph answers "which sections have uncited sentences" without the ledger; "which exact sentence" reads the ledger by digest.
- trace: item → DERIVED_FROM → Assertion → TRACE; item → Assessment → STRACE; report-level `Report.evidence` (HAS_EVIDENCE) lists every quoted span.
- bitemporal episode needed on: none.

## CQ-EV-02

- kind: cypher
- question: is this proposition a source assertion, a BellLabs assessment, a derived shortcut, or a published row.
- pattern (label switch over the records returned by any answer):

```cypher
UNWIND $uids AS u
MATCH (n {uid: u})
RETURN u, CASE
  WHEN n:Assertion   THEN 'asserted: ' + n.predicate + ' by ' + head([(n)-[:ASSERTED_BY]->(w) | w.uid])
  WHEN n:Adjudication THEN 'adjudication: ' + n.verdict
  WHEN n:Assessment  THEN 'assessment: ' + n.assessmentKind + ' @' + n.methodVersion
  WHEN n:Association THEN 'materialized projection: ' + n.associationKind + ' @' + n.methodVersion + ' (not evidence)'
  WHEN n:ReportItem  THEN 'published row/section of ' + head([(r:Report)-[:HAS_ITEM]->(n) | r.uid])
  WHEN n:Report      THEN 'published ' + n.reportKind
  ELSE 'entity' END AS kind
// derived edges (MENTIONS) are labeled from DerivedEdgeProperties.derivationRule on the relationship
```

- trace: per kind as in TRACE / STRACE / Q-D10-05 / CQ-AX-01.
- bitemporal episode needed on: none.

## CQ-RC-01

- kind: cypher
- question: why was one option preferred over another, and which options were rejected or blocked and why (published BellLabs comparison).
- pattern:

```cypher
MATCH (r:Report {uid: $reportUid})-[h:HAS_ITEM]->(row:ReportItem {itemKind: 'ROW'})-[:ASSESSES]->(opt)
OPTIONAL MATCH (r)-[:USES_CRITERION]->(c:DecisionCriterion)
OPTIONAL MATCH (row)-[:BLOCKED_BY]->(b)
RETURN opt.uid, opt.name, row.disposition, row.rank, row.cellValues, row.reason, row.missingFactKeys,
       collect(DISTINCT b.uid) AS blockedBy,
       collect(DISTINCT c{.uid, .criterionKey, .version, .criterionKind, .direction, .weight}) AS criteria
ORDER BY coalesce(row.rank, 999), row.disposition
```

- trace: every `cellValues` entry names `<criterion uid>=<value>|<assertion or assessment uid>`; each uid → TRACE / STRACE; blocked rows → CQ-RC-06.
- bitemporal episode needed on: none (the report is frozen at publication; "would it differ now" is CQ-RC-07).

## CQ-RC-02

- kind: cypher
- question: which evidence, applicability assessments, constraints, observations and policy version affected the decision.
- pattern:

```cypher
MATCH (r:Report {uid: $reportUid})
OPTIONAL MATCH (r)-[:HAS_ITEM]->(i:ReportItem)-[:DERIVED_FROM]->(in)
OPTIONAL MATCH (r)-[:USES_CRITERION]->(c:DecisionCriterion)
OPTIONAL MATCH (r)-[:WAS_GENERATED_BY]->(act:Activity)
RETURN r.policyVersion, act.runId, act.missionId, act.bundleDigest,
       collect(DISTINCT {item: i.itemKey, input: in.uid, kind: labels(in)[0],
                         sub: coalesce(in.assessmentKind, in.predicate)}) AS inputs,
       collect(DISTINCT c.uid + '@' + c.version) AS criteria,
       max(in.recordedAt) AS evidenceRecordedAsOf
```

- trace: input manifest uids → TRACE / STRACE; applicability assessments are kernel Assessments of kind APPLICABILITY (D3 content); price and availability observations are D6 Assertions.
- bitemporal episode needed on: none.

## CQ-RC-03

- kind: cypher
- question: which missing or disputed facts could change the ranking.
- pattern:

```cypher
MATCH (r:Report {uid: $reportUid})-[:HAS_ITEM]->(i:ReportItem)
OPTIONAL MATCH (i)-[:DERIVED_FROM]->(a:Assertion)
WHERE a.status IN ['DISPUTED','REJECTED','SUPERSEDED'] OR a.recordedTo IS NOT NULL
RETURN i.itemKey, i.disposition, i.rank, i.missingFactKeys,
       collect(a{.uid, .status, .recordedTo}) AS disputedOrClosedInputs
```

- trace: disputed inputs → TRACE (the adjudication that disputed them).
- bitemporal episode needed on: none; "disputed now" reads current Assertion status (a projection of adjudications), not the report's frozen view.

## CQ-RC-05

- kind: cypher
- question: distinguish "evidence favors", "BellLabs recommends", "a source recommends", "a user selected".
- pattern (four separate sub-queries, returned as four typed lists):

```cypher
// 1 evidence favors: current assessments about option X for target T
MATCH (s:Assessment)-[:ASSESSES]->(x {uid: $x}) MATCH (s)-[:ASSESSES]->(:Target {key: $targetKey})
WHERE s.status = 'ACCEPTED' AND ASOF(s) RETURN 'evidence' AS kind, s.uid, s.verdict, s.effectDirection
// 2 BellLabs recommends: SELECTED rows of current published reports
MATCH (r:Report)-[:HAS_ITEM]->(i:ReportItem {disposition: 'SELECTED'})-[:ASSESSES]->(x {uid: $x})
RETURN 'bellLabsPublished' AS kind, r.uid, r.reportKind, i.rank, r.publishedAt
// 3 a source recommends: claim occurrences with speechAct RECOMMENDS (kernel; D9 container)
MATCH (a:Assertion {speechAct: 'RECOMMENDS'})-[:HAS_SUBJECT|HAS_OBJECT]->(x {uid: $x}) MATCH (a)-[:ASSERTED_BY]->(who)
RETURN 'sourceRecommends' AS kind, a.uid, who.uid
// 4 a user selected: never in the shared graph (private store); the answer states that
```

- trace: TRACE for 3, STRACE for 1, CQ-RC-01 for 2.
- bitemporal episode needed on: none.

## CQ-RC-06

- kind: cypher
- question: can contraindications or interaction uncertainty block an option rather than lower its score.
- pattern:

```cypher
MATCH (r:Report {uid: $reportUid})-[:HAS_ITEM]->(row:ReportItem {disposition: 'BLOCKED'})-[:ASSESSES]->(opt)
MATCH (row)-[:BLOCKED_BY]->(b)                       // b: UseConstraint (D5) or Assessment (K)
OPTIONAL MATCH (r)-[:USES_CRITERION]->(c:DecisionCriterion {criterionKind: 'BLOCK'})
OPTIONAL MATCH (row)-[:BLOCKED_BY]->(uc:UseConstraint) WHERE uc = b
OPTIONAL MATCH (row)-[:BLOCKED_BY]->(bs:Assessment) WHERE bs = b
OPTIONAL MATCH (uc)<-[:RESOLVES_TO_CONSTRAINT]-(src:Assertion)
RETURN opt.uid, row.reason, row.rank /* null */, labels(b)[0] AS blockerKind, b.uid,
       coalesce(uc.constraintKind, bs.assessmentSubkind) AS blocker, collect(DISTINCT src.uid) AS stating,
       collect(DISTINCT c.uid + '@' + c.version) AS blockRules
// computed (unpublished) variant: Q-D10-01 with BLOCK criteria evaluated first
```

- trace: blocker UseConstraint (D5; e.g. "supplemental magnesium above 350 mg/day in adults", "ashwagandha in cirrhosis") → `(b)<-[:RESOLVES_TO_CONSTRAINT]-(a:Assertion)` → TRACE(a) (ODS UL; LiverTox "should be avoided in patients with cirrhosis"); blocker Assessment (D5 interaction risk, D10 harm causality) → STRACE. The row's DERIVED_FROM citations add the triggering fact (e.g. the CALCULATED 500 mg/day) and related conditions (FDA p. 24).
- bitemporal episode needed on: none on D10 edges; the population and dose scope of the blocker is the UseConstraint's (scopePopulations, dose band), the source wording the resolving Assertion's.

## CQ-RC-07

- kind: cypher
- question: which past recommendations relied on evidence or criteria since corrected, superseded or re-adjudicated, and would the decision differ now.
- pattern:

```cypher
MATCH (r:Report)-[:HAS_ITEM]->(i:ReportItem)-[:DERIVED_FROM]->(in)
WHERE r.reportKind IN ['COMPARISON','RECOMMENDATION','ANSWER']
  AND (in.recordedTo IS NOT NULL                                   // input superseded / closed
       OR EXISTS { MATCH (adj:Adjudication)-[:ASSESSES]->(in) WHERE adj.recordedAt > r.publishedAt })
WITH r, collect(DISTINCT {item: i.itemKey, input: in.uid, closedAt: in.recordedTo}) AS changed
OPTIONAL MATCH (r)-[:USES_CRITERION]->(c:DecisionCriterion) WHERE c.recordedTo IS NOT NULL
RETURN r.uid, r.publishedAt, changed, collect(c.uid) AS supersededCriteria
// "would it differ now": re-run Q-D10-01 with the report's criteria versions and $asOf = now; diff ranks
```

- trace: changed inputs → TRACE (new adjudication) or successor via `supersedesUid`.
- bitemporal episode needed on: none (recorded time on inputs is enough).

## CQ-AX-08

- kind: cypher
- question: which derived records cannot be regenerated or cite a withdrawn or mismatched assertion.
- pattern:

```cypher
MATCH (x:Association) WHERE x.recordedTo IS NULL
OPTIONAL MATCH (x)-[:DERIVED_FROM]->(a:Assertion) WHERE a.recordedTo IS NOT NULL OR a.status IN ['REJECTED','SUPERSEDED']
OPTIONAL MATCH (x)-[:WAS_GENERATED_BY]->(act:Activity)
WITH x, act, collect(a.uid) AS withdrawn
WHERE size(withdrawn) > 0 OR act IS NULL OR act.methodVersion <> x.methodVersion OR x.staleAfter < datetime()
RETURN 'Association' AS kind, x.uid AS uid, x.methodVersion AS methodVersion, act.runId AS runId, withdrawn, x.staleAfter AS staleAfter
UNION
MATCH ()-[m:MENTIONS]->() WHERE m.derivedAt IS NULL OR m.derivationRule IS NULL      // kernel/D9 derived edges
RETURN 'MENTIONS' AS kind, m.lastWriterRunId AS uid, m.derivationRule AS methodVersion, null AS runId, [] AS withdrawn, null AS staleAfter
```

- Input-digest mismatch: the projection job recomputes `inputSetDigest` from the DERIVED_FROM set (or the stored input list when > 5,000) and reports records whose digest differs.
- trace: Association → Activity (methodVersion, runId) → inputs → TRACE.
- bitemporal episode needed on: none.

## CQ-AX-11

- kind: cypher
- question: which published answers or reports depend on assertion A.
- pattern:

```cypher
MATCH (a {uid: $assertionUid})
MATCH (dep)-[:DERIVED_FROM*1..3]->(a)                    // items, assessments, reports, associations citing A directly or through an assessment
OPTIONAL MATCH (r:Report)-[:HAS_ITEM]->(dep)
WITH coalesce(r, dep) AS art, dep
WHERE art:Report
RETURN DISTINCT art.uid, art.reportKind, art.publishedAt, art.policyVersion,
       CASE WHEN dep:ReportItem THEN dep.itemKey END AS itemKey
```

- trace: the reverse of TRACE; A's locator is the shared anchor.
- bitemporal episode needed on: none.

## Q-D10-01

- kind: cypher (candidate and input retrieval) + rule evaluation in the comparison engine (read intent `comparison.compute`, tool:bks-comparison-engine)
- question: which option ranks best for target T under criteria version V, row by row, each value citing its assertion; labeled "computed, not published".
- pattern:

```cypher
// 1 criteria set at version
MATCH (c:DecisionCriterion {criteriaSetKey: $set, criteriaSetVersion: $ver})
WHERE ASOF(c) AND ($targetKey IS NULL OR c.targetKeys IS NULL OR $targetKey IN c.targetKeys)   // DecisionCriterion.targetKeys
WITH collect(c) AS criteria
// 2 candidate set: caller-given uids, or means with a target assertion for T (D5 seam rule)
MATCH (t:Target {key: $targetKey})<-[:HAS_OBJECT]-(ta:Assertion)-[:HAS_SUBJECT]->(opt)
WHERE ta.predicate IN ['INTENDED_FOR_TARGET','IMPROVES_TARGET'] AND ASOF(ta) AND VALIDAT(ta)
  AND ($candidateUids IS NULL OR opt.uid IN $candidateUids)
WITH criteria, collect(DISTINCT opt) AS options
UNWIND options AS opt UNWIND criteria AS c
// 3 inputs per (option, criterion): current assertions with the criterion's predicates, and current assessments
OPTIONAL MATCH (opt)<-[:HAS_SUBJECT]-(v:Assertion)
  WHERE v.predicate IN c.inputPredicates AND v.status IN ['ACCEPTED','DISPUTED'] AND ASOF(v) AND VALIDAT(v)
OPTIONAL MATCH (s:Assessment)-[:ASSESSES]->(opt)
  WHERE (s.assessmentKind + '/' + coalesce(s.assessmentSubkind, '')) IN c.inputAssessmentKinds AND s.status = 'ACCEPTED' AND ASOF(s)
RETURN opt.uid, c.uid, c.criterionKind, c.direction, c.weight, c.rule, c.evaluationOrder,
       collect(DISTINCT v{.uid, .predicate, .valueNumber, .valueString, .unitCode, .qualifiers}) AS values,
       collect(DISTINCT s{.uid, .verdict, .effectDirection, .score}) AS assessments
```

- Engine: evaluates BLOCK criteria first (disposition BLOCKED, rank null, blocker uids), then FILTER, then SCORE (weighted by `weight`, ordered by `direction`), then TIEBREAK by `evaluationOrder`; a missing input is `NOT_EVALUATED` with `missingFactKeys`, never zero (unknown ≠ absent). Output rows have the ReportItem shape (disposition, rank, cellValues) without being stored; the response carries `computed: true, published: false, criteria: set@ver, asOf`.
- trace: each cell cites the `v.uid` / `s.uid` it used → TRACE / STRACE.
- bitemporal episode needed on: none (inputs are Assertions with their own valid and recorded time; criteria carry recorded time).

## Q-D10-02

- kind: cypher
- question: BellLabs' published comparison of magnesium products for sleep as of date D.
- pattern:

```cypher
MATCH (r:Report {reportKind: 'COMPARISON'})-[:ASSESSES]->(:Target {key: $targetKey})
WHERE r.recordedAt <= $asOf
  AND NOT EXISTS { MATCH (r2:Report {supersedesUid: r.uid}) WHERE r2.recordedAt <= $asOf }
  AND EXISTS { MATCH (r)-[:HAS_ITEM]->(:ReportItem)-[:ASSESSES]->(o) WHERE o.uid IN $optionUids OR $optionUids IS NULL }
MATCH (r)-[:WAS_GENERATED_BY]->(act:Activity)
MATCH (r)-[h:HAS_ITEM]->(i:ReportItem)
OPTIONAL MATCH (r)-[:USES_CRITERION]->(c:DecisionCriterion)
RETURN r.uid, r.publishedAt, r.policyVersion, act.missionId, act.runId,
       collect(DISTINCT c.uid + '@' + c.version) AS criteria,
       collect(i{.itemKey, .itemKind, .disposition, .rank, .cellValues, order: h.orderIndex}) AS items
```

- trace: per item CQ-AX-01; report-level `Report.evidence`.
- bitemporal episode needed on: none (insert-only reports; `supersedesUid` gives as-of).

## Q-D10-03

- kind: cypher
- question: what is the evidence against using X for target T — null, inconsistent, or harmful verdicts with certainty and scope.
- pattern:

```cypher
MATCH (x {uid: $x})
// BellLabs assessments with a negative or null direction / verdict
OPTIONAL MATCH (s:Assessment)-[:ASSESSES]->(x)
WHERE s.status = 'ACCEPTED' AND ASOF(s)
  AND (s.effectDirection IN ['NO_EFFECT','HARM','MIXED']
       OR s.verdict IN ['CONTRADICTED','NOT_SUPPORTED','MIXED_OR_CONFLICTING','INSUFFICIENT_EVIDENCE'])
  AND ($targetKey IS NULL OR EXISTS { MATCH (s)-[:ASSESSES]->(:Target {key: $targetKey}) })
// evidence reports that failed to confirm a claim about X
OPTIONAL MATCH (r:Report {reportKind: 'EVIDENCE_REPORT'})-[:ASSESSES]->(c:Claim)<-[:OCCURRENCE_OF]-(:Assertion)-[:HAS_SUBJECT]->(x)
WHERE r.verdict IN ['CONTRADICTED','NOT_SUPPORTED','MIXED_OR_CONFLICTING','INSUFFICIENT_EVIDENCE']
// third-party null/negative statements (D5 seam predicate; FDA, Cochrane, USPSTF)
OPTIONAL MATCH (n:Assertion)-[:HAS_SUBJECT]->(x)
WHERE n.predicate IN ['NO_EFFECT_ON_TARGET','WORSENS_TARGET','RECOMMENDS_AGAINST','CHARACTERIZES_EVIDENCE_STRENGTH'] AND ASOF(n)
RETURN collect(DISTINCT s{.uid, .verdict, .effectDirection, .assessmentSubkind, .summary}) AS assessments,
       collect(DISTINCT r{.uid, .verdict, .publishedAt}) AS reports,
       collect(DISTINCT n{.uid, .predicate, .valueString, .qualifiers}) AS statements
```

- trace: STRACE / TRACE; scope (population, dose, preparation) is the Assertion `qualifiers` and the assessment's ASSESSES targets (the most specific subject: the preparation, not the compound).
- bitemporal episode needed on: none.

## Q-D10-04

- kind: cypher
- question: which claims about X were vetted, sent to an evidence mission, and what verdict the evidence report reached.
- pattern (kernel claim lifecycle, extended with report items):

```cypher
MATCH (x {uid: $x})<-[:HAS_SUBJECT]-(:Assertion {assertionKind: 'CLAIM'})-[:OCCURRENCE_OF]->(c:Claim)
OPTIONAL MATCH (v:Assessment {assessmentKind: 'VETTING'})-[:ASSESSES]->(c)
OPTIONAL MATCH (m:Activity {activityKind: 'EVIDENCE_MISSION'})-[:ASSESSES]->(c)          // kernel Activity.about (K 09 change 7, M2)
OPTIONAL MATCH (m)-[:WAS_INFORMED_BY]->(vet:Activity)<-[:WAS_GENERATED_BY]-(v)             // only to show which vetting run spawned it
OPTIONAL MATCH (r:Report {reportKind: 'EVIDENCE_REPORT'})-[:ASSESSES]->(c)
OPTIONAL MATCH (r)-[:HAS_ITEM]->(vi:ReportItem {sectionKind: 'VERDICT'})-[:DERIVED_FROM]->(s:Assessment)
RETURN c.uid, c.proposition, v.disposition, v.recordedAt, m.missionId, m.runId,
       r.uid, r.verdict, r.publishedAt, collect(DISTINCT s.uid) AS verdictBasis
ORDER BY r.publishedAt DESC
```

- trace: verdict basis → STRACE; report → `Report.evidence`.
- bitemporal episode needed on: none.

## Q-D10-05

- kind: cypher (read of a materialized projection); the projection itself is computed offline or by GDS (see below)
- question: association between X and Y by evidence kind, with method version and inputs.
- pattern:

```cypher
MATCH (x {uid: $x})<-[:ASSOCIATES]-(assoc:Association)-[:ASSOCIATES]->(y {uid: $y})
WHERE assoc.recordedTo IS NULL AND ($kind IS NULL OR assoc.associationKind = $kind)
OPTIONAL MATCH (assoc)-[:WAS_GENERATED_BY]->(act:Activity)
OPTIONAL MATCH (assoc)-[:DERIVED_FROM]->(a:Assertion)
// external scores for the same pair, captured as assertions (never merged with ours)
OPTIONAL MATCH (ext:Assertion {predicate: 'REPORTS_ASSOCIATION_SCORE'})-[:HAS_SUBJECT]->(x)
  WHERE EXISTS { (ext)-[:HAS_OBJECT]->(y) } AND ASOF(ext)
RETURN assoc{.uid, .associationKind, .anchorUid, .score, .components, .inputCount, .inputSetDigest,
             .methodVersion, .computedAt, .staleAfter} AS association,
       act.runId, collect(DISTINCT a.uid)[..50] AS inputSample, collect(DISTINCT ext.uid) AS externalScores,
       'score is a method score, not a confidence and not evidence' AS label
```

- Projections are BellLabs-computed only (external scores are the `externalScores` column, never Association records). Fixture: `bl-assoc/faers-prr@1` (`opentargets-association-signal`: PRR from four openFDA count Assertions, components = the 2×2 cells). Planned evidence aggregate (refresh weekly or when > 1% of the pair's input assertions changed; one PROJECTION Activity per run, `methodVersion bl-assoc/evidence-aggregate@1`): for each (exposure, outcome-or-target) pair with ≥ 2 current accepted assertions (`IMPROVES_TARGET`, `WORSENS_TARGET`, D3 result predicates, D2 mechanism predicates), compute per-evidence-kind components (human RCT, observational, animal, in vitro, mechanism) from the asserting source kind and the D3 design of the cited study, a harmonic-sum score in the Open Targets style, and the input digest; write one Association per pair, close the previous one.
- trace: Association → DERIVED_FROM → inputs → TRACE; Activity → methodVersion.
- bitemporal episode needed on: none (recorded-only, `computedAt`; regenerable).

## Q-D10-06

- kind: cypher (read) over captured signal Assertions and BellLabs-computed Association records
- question: which harms are statistically associated with X in surveillance data, and which are likely confounding by indication.
- pattern (adversarial-review stage: external signals are Assertions by their producer; the interpretation ASSESSES the drug and the event):

```cypher
MATCH (x {uid: $x})
CALL (x) {
  // external signals, captured as Assertions by their producer (Open Targets FAERS LRT, openFDA, a regulator's signal list)
  MATCH (x)<-[:HAS_SUBJECT]-(sig:Assertion {predicate: 'REPORTS_DISPROPORTIONALITY_SIGNAL'})-[:HAS_OBJECT]->(ev)
  WHERE ASOF(sig)
  OPTIONAL MATCH (sig)-[:ASSERTED_BY]->(producer)
  RETURN ev, 'external' AS origin, sig.uid AS signalUid, producer.name AS producer, sig.valueNumber AS value, sig.valueString AS detail
  UNION
  // BellLabs-computed signals: Association records (method version, inputs)
  MATCH (x)<-[:ASSOCIATES]-(assoc:Association {associationKind: 'SIGNAL_DISPROPORTIONALITY'})-[:ASSOCIATES]->(ev)
  WHERE ev <> x AND assoc.recordedTo IS NULL AND assoc.anchorUid = x.uid AND assoc.statisticValue >= assoc.threshold
  RETURN ev, 'bellLabsProjection' AS origin, assoc.uid AS signalUid, assoc.methodVersion AS producer, assoc.statisticValue AS value,
         assoc.statistic + ' ' + toString(assoc.statisticValue) + ' (threshold ' + toString(assoc.threshold) + ')' AS detail
}
OPTIONAL MATCH (interp:Assessment {assessmentKind: 'SAFETY_SIGNAL'})-[:ASSESSES]->(x)
  WHERE EXISTS { (interp)-[:ASSESSES]->(ev) } AND ASOF(interp)
RETURN ev.uid, ev.name, collect({origin: origin, uid: signalUid, producer: producer, value: value, detail: detail}) AS signals,
       collect(DISTINCT interp{.uid, .assessmentSubkind, .verdict, .summary, .status}) AS interpretations
ORDER BY ev.name
```

- Projection (BellLabs, `bl-assoc/faers-prr@1`): four openFDA FAERS count Assertions per (drug, event) (`REPORTS_REPORT_COUNT`: a, a+b, a+c, N) → PRR, 95% CI, ROR, Yates chi-square; signal rule PRR ≥ 2, chi-square ≥ 4, a ≥ 3; refresh with each FAERS data cut (`last_updated`). External statistics are never copied into Associations.
- trace: external signal → TRACE (JSON_POINTER locator into the captured API response); BellLabs signal → inputs (DERIVED_FROM) → TRACE; interpretation → STRACE (quotes such as Open Targets' "it's relatively common for the indication … to appear", the label's indication).
- bitemporal episode needed on: none.

## Q-D10-07

- kind: cypher
- question: which specific preparation of X carries a harm grade, under which scheme, from which body, last updated when.
- pattern:

```cypher
MATCH (x {uid: $x})
// preparations / forms / products that are X or contain X: kernel assertions whose predicates D1/D12/D6 register
// (D1 REALIZES_SUBSTANCE material->substance, HAS_ACTIVE_MOIETY salt/form->moiety, MATERIAL_CONTAINS;
//  D12 FOOD_CONTAINS; D6 DECLARES_COMPONENT label version->ingredient material/constituent/food)
OPTIONAL MATCH (x)<-[:HAS_OBJECT]-(p:Assertion)-[:HAS_SUBJECT]->(prep)
WHERE p.predicate IN ['REALIZES_SUBSTANCE','HAS_ACTIVE_MOIETY','MATERIAL_CONTAINS','FOOD_CONTAINS','DECLARES_COMPONENT'] AND ASOF(p)
WITH x, collect(DISTINCT prep) + [x] AS subjects
UNWIND subjects AS subj
OPTIONAL MATCH (g:Assertion)-[:HAS_SUBJECT]->(subj)
WHERE g.predicate IN ['ASSIGNS_LIKELIHOOD_SCORE','ASSIGNS_GRADE','RECOMMENDS_AGAINST'] AND ASOF(g)
OPTIONAL MATCH (g)-[:ASSERTED_BY]->(body)
OPTIONAL MATCH (s:Assessment)-[:ASSESSES]->(subj) WHERE s.effectDirection = 'HARM' AND s.status = 'ACCEPTED' AND ASOF(s)
RETURN subj.uid, subj.name, g.predicate, g.valueString AS grade, g.qualifiers, body.name, g.validFrom AS monographUpdated,
       collect(DISTINCT s{.uid, .assessmentSubkind, .methodVersion, .summary}) AS bellLabsHarmAssessments
```

- The grade never rolls up from the preparation to the compound: the answer lists the subject it was given for ("green tea extract: A"; "green tea beverage: has not been associated").
- trace: TRACE(g) (LiverTox `nxml` section selector; the monograph update date is the Assertion's valid-from with basis STATED_BY_SOURCE).
- bitemporal episode needed on: none on D10 edges (the grade's validity is the Assertion's valid time).

## Q-D10-08

- kind: cypher (retrieved avoid-list; published variant = HARMS_AND_AVOIDANCE rows of a profile or comparison)
- question: what should a person pursuing target T avoid, by severity and certainty, including "recommend against" statements.
- pattern:

```cypher
MATCH (t:Target {key: $targetKey})
CALL (t) {
  // means asserted to worsen T (D5 seam predicate)
  MATCH (t)<-[:HAS_OBJECT]-(a:Assertion {predicate: 'WORSENS_TARGET'})-[:HAS_SUBJECT]->(m) WHERE ASOF(a) AND VALIDAT(a)
  RETURN m, 'assertion' AS basis, a.uid AS uid, a.qualifiers AS scope, null AS certainty
  UNION
  // BellLabs harm assessments about a means and the target
  MATCH (t)<-[:ASSESSES]-(s:Assessment {effectDirection: 'HARM'})-[:ASSESSES]->(m) WHERE m <> t AND s.status = 'ACCEPTED' AND ASOF(s)
  RETURN m, 'assessment' AS basis, s.uid AS uid, null AS scope, s.verdict AS certainty
  UNION
  // guideline bodies recommending against, for a population matching the asker (qualifiers)
  MATCH (a:Assertion {predicate: 'RECOMMENDS_AGAINST'})-[:HAS_SUBJECT]->(m) WHERE ASOF(a)
    AND EXISTS { (a)-[:HAS_OBJECT]->(t) } RETURN m, 'guideline' AS basis, a.uid AS uid, a.qualifiers AS scope, null AS certainty
  UNION
  // published BLOCKED rows whose report is about T
  MATCH (t)<-[:ASSESSES]-(:Report)-[:HAS_ITEM]->(i:ReportItem {disposition: 'BLOCKED'})-[:ASSESSES]->(m)
  MATCH (i)-[:BLOCKED_BY]->(b) RETURN m, 'publishedBlock' AS basis, b.uid AS uid, null AS scope, null AS certainty
}
RETURN m.uid, m.name, collect({basis: basis, uid: uid, scope: scope, certainty: certainty}) AS reasons
```

- Ordering: severity from D5 constraint assertions (`severity` qualifier), certainty from the assessment verdict; rows with no locator are not returned.
- trace: TRACE / STRACE per reason uid.
- bitemporal episode needed on: none.

## Q-D10-09

- kind: cypher
- question: where does a regulator or grader disagree with a petitioner's or seller's characterization of evidence strength.
- pattern:

```cypher
MATCH (c:Claim)<-[:HAS_SUBJECT]-(p:Assertion {predicate: 'CHARACTERIZES_EVIDENCE_STRENGTH'})-[:ASSERTED_BY]->(party)
MATCH (c)<-[:HAS_SUBJECT]-(q:Assertion {predicate: 'CHARACTERIZES_EVIDENCE_STRENGTH'})-[:ASSERTED_BY]->(assessor)
WHERE party <> assessor AND p.valueString <> q.valueString AND ASOF(p) AND ASOF(q)
  AND ($assessorUid IS NULL OR assessor.uid = $assessorUid)
OPTIONAL MATCH (w:Assertion {predicate: 'REQUIRES_QUALIFIED_CLAIM_WORDING'})-[:HAS_SUBJECT]->(c) WHERE ASOF(w)
RETURN c.proposition, party.name, p.valueString AS claimed, assessor.name, q.valueString AS assessed,
       w.valueString AS mandatedQualifier, q.validFrom AS decisionDate
```

- Changed from `assessment` to `retrieved` in this stage: both characterizations are captured assertions by named parties (FDA letter pp. 1, 27, 28); no BellLabs judgment is needed to see the disagreement.
- trace: TRACE(p), TRACE(q), TRACE(w).
- bitemporal episode needed on: none.

## Q-D10-10

- kind: cypher
- question: for a third-party ranking, which criteria and candidate set produced it, who produced it, and with what commercial interest.
- pattern:

```cypher
MATCH (row:Assertion {predicate: 'RANKS_OPTION'})-[:ASSERTED_BY]->(ranker)
WHERE row.uid IN $rowUids OR EXISTS { (row)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source {canonicalUri: $rankingUri}) }
WITH ranker, collect(row) AS rows
OPTIONAL MATCH (c:DecisionCriterion {publisherUid: ranker.uid}) WHERE ASOF(c)
OPTIONAL MATCH (m:Assertion {predicate: 'USES_RANKING_CRITERION'})-[:HAS_SUBJECT]->(c)
// commercial ties: D7 financial-interest assertions where the ranker is subject (certification fees, affiliate, membership)
OPTIONAL MATCH (fi:Assertion)-[:HAS_SUBJECT]->(ranker) WHERE fi.predicate IN $d7InterestPredicates AND ASOF(fi) AND VALIDAT(fi)
RETURN ranker.uid, ranker.name, size(rows) AS rowCount,
       collect(DISTINCT c{.criterionKey, .version, .weight, .definition, .validFrom}) AS criteria,
       collect(DISTINCT m.uid) AS methodStatements, collect(DISTINCT fi{.predicate, .valueString}) AS interests
```

- trace: criteria → method-statement Assertions → TRACE (Labdoor "Our scoring process" page); rows → TRACE; interests → TRACE (D7 predicates named in the D7 SDL).
- bitemporal episode needed on: none on D10 edges (interest validity is on D7's asserted edges / Assertions).

## Q-D10-11

- kind: cypher
- question: do two rankings of one category disagree, and which criteria differences explain it.
- pattern:

```cypher
MATCH (r1:Assertion {predicate: 'RANKS_OPTION'})-[:ASSERTED_BY]->(k1 {uid: $rankerA}), (r1)-[:HAS_OBJECT]->(opt)
MATCH (r2:Assertion {predicate: 'RANKS_OPTION'})-[:ASSERTED_BY]->(k2 {uid: $rankerB}), (r2)-[:HAS_OBJECT]->(opt2)
WHERE (opt = opt2 OR EXISTS {   // two forms of one substance (D1 HAS_ACTIVE_MOIETY salt->moiety, REALIZES_SUBSTANCE material->substance)
         MATCH (opt)<-[:HAS_SUBJECT]-(f1:Assertion)-[:HAS_OBJECT]->(f)<-[:HAS_OBJECT]-(f2:Assertion)-[:HAS_SUBJECT]->(opt2)
         WHERE f1.predicate IN ['HAS_ACTIVE_MOIETY','REALIZES_SUBSTANCE'] AND f2.predicate IN ['HAS_ACTIVE_MOIETY','REALIZES_SUBSTANCE'] })
  AND ASOF(r1) AND ASOF(r2)
WITH opt, opt2, r1.valueNumber AS rankA, r2.valueNumber AS rankB, k1, k2
OPTIONAL MATCH (ca:DecisionCriterion {publisherUid: k1.uid}) WHERE ASOF(ca)
OPTIONAL MATCH (cb:DecisionCriterion {publisherUid: k2.uid}) WHERE ASOF(cb)
// evidence on the disputed criterion (e.g. absorption of magnesium oxide)
OPTIONAL MATCH (e:Assertion)-[:HAS_SUBJECT]->(opt) WHERE e.predicate IN $evidencePredicates AND ASOF(e)
RETURN opt.name, rankA, rankB, collect(DISTINCT ca.criterionKey) AS criteriaA, collect(DISTINCT cb.criterionKey) AS criteriaB,
       collect(DISTINCT e.uid) AS evidenceOnDisputedCriterion
```

- trace: TRACE for ranking rows, method statements and evidence (U.S. News "We surveyed 357 pharmacists …"; Examine "magnesium oxide … extremely poor absorption").
- bitemporal episode needed on: none.

## Q-D10-12

- kind: cypher
- question: what changed about X between recorded times R1 and R2.
- pattern:

```cypher
MATCH (x {uid: $x})
CALL (x) {
  MATCH (x)<-[:HAS_SUBJECT|HAS_OBJECT]-(a:Assertion)
  WHERE (a.recordedAt > $r1 AND a.recordedAt <= $r2) OR (a.recordedTo > $r1 AND a.recordedTo <= $r2)
  RETURN 'assertion' AS kind, a.uid AS uid, a.recordedAt AS added, a.recordedTo AS closed, a.supersedesUid AS supersedes
  UNION
  MATCH (x)<-[:ASSESSES]-(s:Assessment)
  WHERE (s.recordedAt > $r1 AND s.recordedAt <= $r2) OR (s.recordedTo > $r1 AND s.recordedTo <= $r2)
  RETURN 'assessment' AS kind, s.uid AS uid, s.recordedAt AS added, s.recordedTo AS closed, s.supersedesUid AS supersedes
  UNION
  MATCH (x)<-[:HAS_SUBJECT|HAS_OBJECT]-(a:Assertion)<-[:ASSESSES]-(adj:Adjudication)
  WHERE adj.recordedAt > $r1 AND adj.recordedAt <= $r2
  RETURN 'adjudication' AS kind, adj.uid AS uid, adj.recordedAt AS added, null AS closed, adj.supersedesUid AS supersedes
  UNION
  MATCH (x)<-[:ASSESSES]-(r:Report) WHERE r.recordedAt > $r1 AND r.recordedAt <= $r2
  RETURN 'report' AS kind, r.uid AS uid, r.recordedAt AS added, null AS closed, r.supersedesUid AS supersedes
}
RETURN kind, uid, added, closed, supersedes ORDER BY coalesce(added, closed)
```

- trace: each uid → TRACE / STRACE; "since my last report" sets `$r1 = report.recordedAt`.
- bitemporal episode needed on: none on D10 edges; the kernel's recorded time on records is sufficient (asserted domain edges keep their own episodes for D1–D9 questions).

## Q-D10-13

- kind: cypher
- question: which published reports cite an assertion or assessment that has since been superseded, retracted or re-adjudicated (stale-report queue).
- pattern:

```cypher
MATCH (r:Report)-[:HAS_ITEM]->(i:ReportItem)-[:DERIVED_FROM]->(in)
WHERE NOT EXISTS { MATCH (:Report {supersedesUid: r.uid}) }          // only current reports
  AND (in.recordedTo IS NOT NULL
       OR in.status IN ['REJECTED','DISPUTED','SUPERSEDED','WITHDRAWN']
       OR EXISTS { MATCH (adj:Adjudication)-[:ASSESSES]->(in) WHERE adj.recordedAt > r.recordedAt })
RETURN r.uid, r.reportKind, r.publishedAt, i.itemKey, i.sectionKind, in.uid AS staleInput, labels(in)[0] AS inputKind,
       coalesce(in.recordedTo, in.updatedAt) AS changedAt
ORDER BY changedAt DESC
// also: Report-level DERIVED_FROM (kernel minimum citation set) for reports without items
```

- trace: stale input → successor (`MATCH (n {supersedesUid: in.uid})`) → TRACE / STRACE.
- bitemporal episode needed on: none.
- index: relationship index not needed; node range indexes on `Assertion(recordedTo)`, `Assessment(recordedTo)` (kernel operations file).

## Q-D10-14

- kind: cypher
- question: give me a compound profile report for X, section by section, with uncited sentences.
- pattern:

```cypher
MATCH (r:Report {reportKind: 'PROFILE'})-[:ASSESSES]->(x {uid: $x})
WHERE NOT EXISTS { MATCH (:Report {supersedesUid: r.uid}) }
MATCH (r)-[h:HAS_ITEM]->(i:ReportItem)
OPTIONAL MATCH (i)-[:DERIVED_FROM]->(in)
RETURN r.uid, r.publishedAt, r.bodyUri, r.citationCompleteness,
       i.sectionKind, i.itemKey, i.parentItemKey, i.uncitedSentenceCount, h.orderIndex, count(in) AS citations
ORDER BY h.orderIndex
```

- Skeleton: `report-skeletons.md` §1 (compound profile). If no published profile exists the answer is assembled live from the section patterns listed there (each section names its pattern), labeled "not published".
- trace: CQ-AX-01 per item.
- bitemporal episode needed on: none.

## Q-D10-15

- kind: cypher
- question: what insights exist about X, with inputs, producer and supersession history.
- pattern:

```cypher
MATCH (s:Assessment {assessmentKind: 'INSIGHT'})-[:ASSESSES]->(x {uid: $x})
WHERE ASOF(s) OR $includeHistory
OPTIONAL MATCH (s)-[:DERIVED_FROM]->(in)
OPTIONAL MATCH (s)-[:WAS_GENERATED_BY]->(act:Activity)-[:WAS_ASSOCIATED_WITH]->(agent:Agent)
OPTIONAL MATCH (older:Assessment {uid: s.supersedesUid})
RETURN s.uid, s.summary, s.verdict, s.recordedAt, s.recordedTo, agent.uid, act.runId,
       collect(DISTINCT in.uid) AS inputs, older.uid AS supersedes
ORDER BY s.recordedAt DESC
```

- trace: STRACE.
- bitemporal episode needed on: none.

## Q-D10-16

- kind: cypher
- question: for protocol P, which steps have supporting, contradicting or no evidence, and which contraindications apply per step.
- pattern (published protocol review; the live variant runs the inner queries per step):

```cypher
MATCH (r:Report {reportKind: 'PROFILE'})-[:ASSESSES]->(p {uid: $protocolUid})
WHERE NOT EXISTS { MATCH (:Report {supersedesUid: r.uid}) }
MATCH (r)-[h:HAS_ITEM]->(i:ReportItem {sectionKind: 'PROTOCOL_STEP'})-[:ASSESSES]->(step)
OPTIONAL MATCH (i)-[:DERIVED_FROM]->(s:Assessment)
OPTIONAL MATCH (i)-[:BLOCKED_BY]->(b)
RETURN step.uid, step.name, h.orderIndex, i.disposition,
       collect(DISTINCT s{.uid, .verdict, .effectDirection}) AS evidence,
       collect(DISTINCT coalesce(b.constraintKind + ': ' + b.summary, b.assessmentSubkind)) AS constraints   // b: D5 UseConstraint or harm Assessment
ORDER BY h.orderIndex
// live: per step (D5 protocol edition → steps), Q-D10-03 + Q-D10-08 + D5 dose-vs-UL check (Q-D5-06)
```

- trace: STRACE per evidence assessment; TRACE per constraint.
- bitemporal episode needed on: none on D10 edges (protocol edition attachment is a D5 state episode).

## Q-D10-17

- kind: vector + cypher
- question: for a user question, which chunks are retrieved, which assertions they support, which locator and snapshot ground them, and does the verifier re-select the same span.
- pattern:

```cypher
CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS ch, score AS sim   // D9 index (Neo4j 5.26 procedure form)
OPTIONAL MATCH (ch)-[m:MENTIONS]->(e) WHERE e.uid IN $linkedEntityUids                      // derived, entity-link/vN
// chunk → assertions whose locator the chunk covers (D9 SDL, A8 worktree 2026-10-08: Chunk -CHUNK_OF-> SourceSnapshot,
// Chunk -COVERS_LOCATOR-> SourceLocator, derived span-overlap/v1); fixture mg-bisglycinate-rct-unstructured walks it
MATCH (ch)-[:CHUNK_OF]->(snap:SourceSnapshot)
MATCH (ch)-[:COVERS_LOCATOR]->(loc:SourceLocator)<-[:HAS_EVIDENCE]-(a:Assertion)
WHERE a.status IN ['ACCEPTED','DISPUTED']
OPTIONAL MATCH (adj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(a)
RETURN ch.uid, sim, collect(DISTINCT e.uid) AS mentioned, a.uid, a.predicate, loc.exact, loc.selectorDigest,
       snap.contentHash, adj.verdict, adj.methodVersion
ORDER BY sim DESC
```

- Re-selection flag: the verifier re-runs `loc.selectorJson` against `snap` bytes; the answer shows `selectorDigest` and the latest CAPTURE_FIDELITY verdict (`DIRECTLY_SUPPORTED` = same span re-selected).
- index: D9 vector index `chunk_embedding` on `Chunk.embedding` (cosine); D10 adds none.
- trace: the pattern is the trace.
- bitemporal episode needed on: none.

## Q-D10-18

- kind: cypher
- question: which secondary reports misstate a primary source (status, units, design label).
- pattern:

```cypher
MATCH (s:Assessment {assessmentKind: 'RETELLING_FIDELITY'})-[:DERIVED_FROM]->(sec:Assertion)
MATCH (s)-[:DERIVED_FROM]->(pri:Assertion)
WHERE pri <> sec AND s.status = 'ACCEPTED' AND ASOF(s) AND s.verdict IN ['CONTRADICTED','PARTIALLY_SUPPORTED','NOT_SUPPORTED']
  AND ($subjectUid IS NULL OR EXISTS { (s)-[:ASSESSES]->({uid: $subjectUid}) })
RETURN s.assessmentSubkind AS mismatchKind, s.summary, sec.uid, pri.uid, s.verdict
```

- Primary vs secondary: the input order is recorded in `Assessment.inputSetDigest`'s canonical form; the assertion whose asserter is the primary issuer (FDA) is the primary. Kinds (subkind): `D10.fidelity.status` (ODS "approved" vs FDA enforcement discretion), `D10.fidelity.unit` (FDA "960 g/day"), `D10.fidelity.design-label` (PubMed "Case Reports" on an RCT).
- trace: TRACE(sec), TRACE(pri).
- bitemporal episode needed on: none.

## Q-D10-19

- kind: gds (Node Similarity) + cypher read of the materialized records
- question: which entities are most similar to X as a retrieval aid, under which projection and method version.
- projection (Cypher projection over current accepted assertions; bipartite entity → feature):

```cypher
MATCH (a:Assertion)-[:HAS_SUBJECT]->(s), (a)-[:HAS_OBJECT]->(f)
WHERE a.status = 'ACCEPTED' AND a.recordedTo IS NULL AND a.predicate IN $featurePredicates   // e.g. AFFECTS / IMPROVES_TARGET / MEASURES
  AND any(l IN labels(s) WHERE l IN $subjectLabels)
RETURN gds.graph.project('d10-sim', s, f, {relationshipType: a.predicate})
```

- algorithm: `gds.nodeSimilarity.stream('d10-sim', {topK: 10, similarityCutoff: 0.2})` (Jaccard); the projection job writes one Association of kind SIMILARITY per (node, neighbour) pair with `methodVersion gds-nodesimilarity/jaccard@1;features=<predicates>`, `score` = similarity, `inputSetDigest` over the projected assertion uids (no DERIVED_FROM edges: inputs above the 5,000 bound). Refresh weekly; drop the in-memory graph after the run.
- read: `MATCH (x {uid:$x})<-[:ASSOCIATES]-(s:Association {associationKind:'SIMILARITY'})-[:ASSOCIATES]->(y) WHERE s.recordedTo IS NULL AND y <> x RETURN y, s.score, s.methodVersion ORDER BY s.score DESC LIMIT 10`.
- use: retrieval aid only (label "not evidence"); never an input to an assessment.
- trace: method version + projection definition; per neighbour, the shared features are recomputable by Cypher (shared HAS_OBJECT targets) with TRACE on each assertion.
- bitemporal episode needed on: none.

## Q-D10-20

- kind: gds (Leiden community detection)
- question: which evidence clusters exist around X or frontier F, and which assertions ground each cluster's summary.
- projection: undirected co-assertion graph limited to the 2-hop neighbourhood of X, or to entities reached from frontier F through D13 `ON_FRONTIER` events and studies:

```cypher
MATCH (a:Assertion)-[:HAS_SUBJECT]->(s), (a)-[:HAS_OBJECT]->(o)
WHERE a.status = 'ACCEPTED' AND a.recordedTo IS NULL AND s.uid IN $scopeUids AND o.uid IN $scopeUids
RETURN gds.graph.project('d10-cl', s, o, {relationshipType: 'CO_ASSERTED'}, {undirectedRelationshipTypes: ['*']})
```

- algorithm: `gds.leiden.stream('d10-cl', {randomSeed: 42, includeIntermediateCommunities: false})` per question (scope ≤ 50,000 nodes; estimate memory first). Not stored: a community is an answer to this query only. Cluster summaries are written only as a published Report (PROFILE about the Frontier) whose items cite the member assertions (re-grounded, GraphRAG summaries are never sources).
- refresh: per query (stream); a nightly write of community ids would be a PROJECTION Activity writing non-schema properties, not exposed in GraphQL.
- trace: per community, the member assertions (`a.uid` collected from the projection query) → TRACE.
- bitemporal episode needed on: none.

## Q-D10-21

- kind: cypher (retrieved; no RECOMMENDS projection is stored — changed from `materialized` in this stage)
- question: which named people recommend X, where, and does any recommender have a financial interest in X valid at the time.
- pattern:

```cypher
MATCH (x {uid: $x})<-[:HAS_SUBJECT|HAS_OBJECT]-(a:Assertion {assertionKind: 'CLAIM', speechAct: 'RECOMMENDS'})-[:ASSERTED_BY]->(p)
WHERE ASOF(a)
MATCH (a)-[:HAS_EVIDENCE]->(loc:SourceLocator)
// financial interest valid at the statement time (D7 asserted interest assertions; names per D7 SDL)
OPTIONAL MATCH (fi:Assertion)-[:HAS_SUBJECT]->(p) WHERE fi.predicate IN $d7InterestPredicates
  AND EXISTS { (fi)-[:HAS_OBJECT]->(org) WHERE org.uid IN $makersOfX }
  AND (fi.validFrom IS NULL OR fi.validFrom <= a.validFrom) AND (fi.validTo IS NULL OR fi.validTo > a.validFrom)
RETURN p.uid, p.name, a.uid, loc.exact, loc.mediaStartSeconds, collect(DISTINCT fi{.predicate, .uid}) AS interests
```

- trace: TRACE(a); D9 container through the locator's snapshot → Source → D9 Episode/Publication (`RENDITION_OF`).
- bitemporal episode needed on: none on D10 edges (D7 interest edges carry episodes in D7).

## Q-D10-22

- kind: cypher (retrieved under DecisionCriterion@version; published variant = COMPARISON report)
- question: rank companies in frontier F by most advanced clinical stage and by claims that survived evidence missions.
- pattern:

```cypher
MATCH (f:Frontier {key: $frontierKey})<-[:ON_FRONTIER]-(e)                         // D13 Events and D3 Studies
MATCH (e)<-[:HAS_SUBJECT|HAS_OBJECT]-(inv:Assertion)-[:HAS_SUBJECT|HAS_OBJECT]->(o:Organization)
WHERE inv.predicate IN $involvementPredicates AND ASOF(inv)
WITH f, o, collect(DISTINCT e) AS events
OPTIONAL MATCH (o)<-[:ASSERTED_BY]-(:Assertion {assertionKind: 'CLAIM'})-[:OCCURRENCE_OF]->(c:Claim)<-[:ASSESSES]-(r:Report {reportKind: 'EVIDENCE_REPORT'})
WITH o, events, collect(DISTINCT {claim: c.uid, verdict: r.verdict}) AS tested
MATCH (crit:DecisionCriterion {criteriaSetKey: $set, criteriaSetVersion: $ver})
RETURN o.uid, o.name, [ev IN events | ev.stage] AS stages, tested, collect(crit.uid) AS criteria
// engine: rank by max stage (ordinal from D3/D13 stage assertions), then survived = verdict in supported values
```

- trace: TRACE for stage assertions; evidence reports → Q-D10-04.
- bitemporal episode needed on: none on D10 edges (ON_FRONTIER is D13's asserted edge).

## Q-D10-23

- kind: cypher
- question: which claims made by company C in investor or marketing material were disqualified or found inconclusive by an evidence report.
- pattern:

```cypher
MATCH (o {uid: $orgUid})<-[:ASSERTED_BY]-(occ:Assertion {assertionKind: 'CLAIM'})-[:OCCURRENCE_OF]->(c:Claim)
MATCH (r:Report {reportKind: 'EVIDENCE_REPORT'})-[:ASSESSES]->(c)
WHERE r.verdict IN ['CONTRADICTED','NOT_SUPPORTED','MIXED_OR_CONFLICTING','INSUFFICIENT_EVIDENCE']
  AND NOT EXISTS { MATCH (:Report {supersedesUid: r.uid}) }
MATCH (r)-[:WAS_GENERATED_BY]->(m:Activity)
MATCH (occ)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap)<-[:HAS_SNAPSHOT]-(src:Source)
RETURN c.proposition, src.canonicalUri, src.genre, loc.exact, r.verdict, r.publishedAt, m.missionId, m.runId
```

- trace: TRACE(occ); report → Q-D10-04.
- bitemporal episode needed on: none.

## Q-D10-24

- kind: cypher
- question: which published SELECTED or ALTERNATIVE rows now face a blocking input recorded after publication (re-review queue).
- pattern:

```cypher
MATCH (r:Report)-[:HAS_ITEM]->(row:ReportItem {itemKind: 'ROW'})-[:ASSESSES]->(opt)
WHERE row.disposition IN ['SELECTED', 'ALTERNATIVE'] AND r.publishedAt IS NOT NULL
  AND NOT EXISTS { MATCH (:Report {supersedesUid: r.uid}) }
CALL (opt, r) {
  // a D5 use concern about the option, stated (resolved) after publication
  MATCH (opt)<-[:HAS_SUBJECT]-(a:Assertion)-[rt:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint)
  WHERE a.recordedAt > r.publishedAt AND a.status IN ['ACCEPTED', 'DISPUTED']
  RETURN 'useConstraint' AS kind, uc.uid AS blockerUid, a.uid AS statingUid, a.recordedAt AS recordedAt
  UNION
  // a harm assessment about the option, recorded after publication
  MATCH (opt)<-[:ASSESSES]-(s:Assessment {effectDirection: 'HARM'})
  WHERE s.recordedAt > r.publishedAt AND s.status = 'ACCEPTED' AND s.recordedTo IS NULL
  RETURN 'harmAssessment' AS kind, s.uid AS blockerUid, null AS statingUid, s.recordedAt AS recordedAt
}
RETURN r.uid, r.publishedAt, row.itemKey, opt.uid, row.disposition, kind, blockerUid, statingUid, recordedAt
ORDER BY recordedAt DESC
// whether the new concern applies to the row's dose and population is decided by re-running the report's BLOCK criteria (Q-D10-01 with $asOf = now)
```

- trace: statingUid → TRACE; harm assessment → STRACE.
- bitemporal episode needed on: none (recorded time on the stating Assertion and the Assessment).

## Q-D10-25

- kind: cypher
- question: which options in a published comparison or recommendation carry a recall, safety alert or enforcement action, before or after publication.
- pattern:

```cypher
MATCH (r:Report {uid: $reportUid})-[:HAS_ITEM]->(row:ReportItem {itemKind: 'ROW'})-[:ASSESSES]->(opt)
CALL (opt) {
  // D8 enforcement records about the product (RegulatoryRecord family ENFORCEMENT: RECALL, WARNING_LETTER, IMPORT_ALERT, FORM_483 ...)
  MATCH (rec:RegulatoryRecord {recordFamily: 'ENFORCEMENT'})-[:CONCERNS]->(opt)
  RETURN rec, 'product' AS via, null AS maker
  UNION
  // ... or addressed to its maker (D6 predicate-only MANUFACTURES: Organization -> Product)
  MATCH (maker)<-[:HAS_SUBJECT]-(:Assertion {predicate: 'MANUFACTURES'})-[:HAS_OBJECT]->(opt)
  MATCH (rec:RegulatoryRecord {recordFamily: 'ENFORCEMENT'})-[:ADDRESSED_TO]->(maker)
  RETURN rec, 'maker' AS via, maker.uid AS maker
}
OPTIONAL MATCH (rec)-[:ISSUED_BY]->(issuer)
RETURN row.itemKey, opt.uid, via, maker, rec.uid, rec.recordKind, rec.issuedAt, issuer.name,
       CASE WHEN rec.issuedAt > r.publishedAt THEN 'after publication' ELSE 'before publication' END AS timing
```

- trace: the RegulatoryRecord's own Assertions and locators (D8; openFDA enforcement JSON_POINTER or warning-letter text).
- bitemporal episode needed on: none on D10 edges (D8 keeps the record's dates and any status episode).

