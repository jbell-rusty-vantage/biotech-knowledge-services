# D4 — retrieval patterns

Model stage (Wave 2) by A3, 2026-10-08; adversarial-review pass the same day (Q-D4-08/09/10/18/24/25 rewritten, Q-D4-26 added, predicate values in SCREAMING_SNAKE like the kernel). One section per question id in `02-questions.md` (35). Names follow `04-schema-proposal.graphql` and the kernel (`packets/K/04-schema-proposal.graphql`). Seam types (D1 `ChemicalSubstance`, D2 `Mechanism`, D3 `OutcomeDefinition`, D5 `Target`, D6 `Product`, D7 `Organization`, D8 regulatory records, D9 `Chunk`) are written with the names their owners' research notes use; final names follow their SDL.

## Shared fragments (referenced below by name)

**AS-OF(r)** — as-of filter on an episode edge (`AssertedEdgeProperties`), half-open, bitemporal. `$asOf` is the valid-time instant the question is about (a report date, a measurement date); `$knownAt` is the recorded-time instant (default `datetime()`, i.e. "what we know now"; a past `$knownAt` replays what the graph believed then). A null bound is unknown, never "ongoing" (kernel rule), so it is returned, not hidden:

```cypher
WHERE (r.validFrom IS NULL OR r.validFrom <= $asOf)
  AND (r.validTo   IS NULL OR r.validTo   >  $asOf)
  AND r.recordedFrom <= $knownAt
  AND (r.recordedTo IS NULL OR r.recordedTo > $knownAt)
// RETURN r.validFromBasis, r.validToBasis  -> answer says "start/end of validity unknown" when basis is UNKNOWN
```

**TRACE-EDGE(r)** — locators behind an asserted edge (every asserted or episode edge carries `assertionUid`):

```cypher
MATCH (a:Assertion {uid: r.assertionUid})-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
WHERE ev.role = 'SUPPORTS'
OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
OPTIONAL MATCH (a)<-[:ASSESSES]-(adj:Adjudication)
OPTIONAL MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity)
RETURN a.predicate, a.status, who.name, loc.selectorKind, loc.exact, loc.page, loc.startOffset, loc.endOffset,
       snap.contentHash, snap.retrievedAt, src.uid, adj.verdict, act.missionId, act.runId
```

**TRACE-NODE(n, $predicates)** — locators behind the properties of a record (definitions, assay fields, interval rows). The executor writes each extracted field as an Assertion whose subject is the record (predicate = field, e.g. `METRIC_DEFINITION_TEXT`, `ASSAY_METHOD_PRINCIPLE`, `INTERVAL_TEXT`, or the kernel convention `FIELD_NOT_REPORTED`; field predicates are SCREAMING_SNAKE like every predicate value), so the citation of any property is:

```cypher
MATCH (a:Assertion)-[:HAS_SUBJECT]->(n) WHERE a.predicate IN $predicates AND a.recordedTo IS NULL
MATCH (a)-[:HAS_EVIDENCE {role: 'SUPPORTS'}]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
RETURN a.predicate, coalesce(a.valueString, toString(a.valueNumber)), loc.exact, loc.selectorKind, snap.contentHash, snap.retrievedAt
```

`NOT_REPORTED` is itself cited: a `FIELD_NOT_REPORTED` Assertion locates the section of the source that was read (WHOLE_SNAPSHOT or the section's TEXT_QUOTE), so "the lab does not report its instrument" is traceable to captured bytes like any positive fact.

**Bitemporal episodes** (09-reasoning): only `MEASURES_METRIC`, `PERFORMED_WITH_VERSION` (both fields), `INCLUDES_TEST`, `RUNS_ON_DEVICE`. All other D4 edges are recorded-only (structural edges: `StructuralEdgeProperties`; asserted recorded-only edges REFLECTS_MECHANISM, DERIVED_FROM_ALGORITHM_VERSION, DELIVERS: kernel `AssertedRecordedProperties`, no valid-time fields).

**Indexes the patterns assume** (Cypher DDL for the deployment, not GraphQL): range on `Metric.systemOntologyId`, `AssayVersion.payloadHash`, `AlgorithmVersion.familyKey`, `ReferenceIntervalVersion.payloadHash`; relationship range indexes on `assertionUid` and `relationshipUid` for the four episode types (kernel executor obligation); fulltext `d4_measure_names` on `Metric.searchText`, `Biomarker.searchText`, `AlgorithmVersion.algorithmFamily`, `LabTest.name`, `Device.name`; vector `metric_embedding` on `Metric.embedding` (DB-only property, not in the GraphQL projection).

---

## CQ-DX-01

- kind: cypher
- pattern: what a test measures as of date D (measurand, LOINC, compartment, specimen, method, instrument, lab), each field REPORTED or NOT_REPORTED.

```cypher
MATCH (t:LabTest {uid: $testUid})-[mm:MEASURES_METRIC]->(m:Metric)-[:QUANTIFIES]->(b:Biomarker)
WHERE /* AS-OF(mm) */ true
OPTIONAL MATCH (m)-[:HAS_IDENTIFIER]->(loinc:Identifier {scheme: 'LOINC'})
OPTIONAL MATCH (t)-[pw:PERFORMED_WITH_VERSION]->(av:AssayVersion)          // AS-OF(pw)
OPTIONAL MATCH (av)-[:PERFORMED_BY_LAB]->(lab:Organization)
RETURN b.name, m.name, loinc.value, m.systemText, m.systemOntologyId, m.propertyText, m.canonicalUnitCode,
       av.methodPrinciple, av.methodText, av.instrumentModelText, av.reagentKitText, av.softwareVersion,
       av.specimenKinds, lab.name, m.notReported + av.notReported AS notReported,
       mm.validFromBasis, pw.validFrom, pw.validTo
```

- trace: TRACE-EDGE(mm) (the lab's LOINC map row, e.g. Labcorp "| 001453 | Hemoglobin A1c | 4548-4 |"), TRACE-EDGE(pw) (methodology section), TRACE-NODE(av, assay field predicates) for each field and each NOT_REPORTED.
- bitemporal episode needed on: MEASURES_METRIC, PERFORMED_WITH_VERSION.

## CQ-DX-02

- kind: cypher
- pattern: is a value measured, calculated or inferred, and by which version.

```cypher
MATCH (m:Metric {uid: $metricUid})
OPTIONAL MATCH (av:AlgorithmVersion)-[:OUTPUTS_METRIC]->(m)
OPTIONAL MATCH (t:LabTest)-[pw:PERFORMED_WITH_VERSION]->(av)                // AS-OF(pw) when a report date is given
OPTIONAL MATCH (lt:LabTest)-[mm:MEASURES_METRIC]->(m)                        // measured path (no algorithm): AS-OF(mm)
OPTIONAL MATCH (lt)-[lpw:PERFORMED_WITH_VERSION]->(asv:AssayVersion)         // AS-OF(lpw)
RETURN m.metricKind, m.defaultResultKind, av.familyKey, av.versionLabel, av.versionBasis, av.realization,
       collect(DISTINCT t.name) AS reportedBy, collect(DISTINCT asv.uid) AS assayVersions
```

- result rule: `defaultResultKind` INFERRED for DNAm surrogates (DNAm logA1C, DNAm CRP) and device estimates; the private result's own `resultKind` overrides it.
- trace: TRACE-NODE(m, [METRIC_DEFINITION_TEXT, METRIC_RESULT_KIND]) (e.g. TruDiagnostic "estimated directly from your DNA methylation"); TRACE-EDGE(pw).
- bitemporal episode needed on: PERFORMED_WITH_VERSION (when asked as of a report date).

## CQ-DX-03

- kind: cypher (lookup of an assessment) + assessment production
- pattern: can two tests (or one test before/after a method change) share a trend axis.

```cypher
// 1. resolve both sides to assay versions as of each result date
MATCH (t1:LabTest {uid: $t1})-[p1:PERFORMED_WITH_VERSION]->(a1:AssayVersion)   // AS-OF(p1) at $date1
MATCH (t2:LabTest {uid: $t2})-[p2:PERFORMED_WITH_VERSION]->(a2:AssayVersion)   // AS-OF(p2) at $date2
// 2. same metric? same performing lab? (the lab is part of an AssayVersion's identity)
MATCH (t1)-[:MEASURES_METRIC]->(m1:Metric), (t2)-[:MEASURES_METRIC]->(m2:Metric)
OPTIONAL MATCH (a1)-[:PERFORMED_BY_LAB]->(lab1:Organization)
OPTIONAL MATCH (a2)-[:PERFORMED_BY_LAB]->(lab2:Organization)
// 3. the current comparability assessment about both
OPTIONAL MATCH (ca:Assessment)-[:ASSESSES]->(a1), (ca)-[:ASSESSES]->(a2)
WHERE ca.assessmentKind = 'COMPARABILITY' AND ca.assessmentSubkind = 'D4.comparability'
  AND ca.status = 'ACCEPTED' AND ca.recordedTo IS NULL
RETURN m1 = m2 AS sameMetric, lab1.uid = lab2.uid AS sameLab, a1.notReported, a2.notReported,
       coalesce(ca.conclusionCode, 'UNKNOWN') AS verdict, ca.rationale, ca.methodVersion
```

- default: no assessment, or either side with METHOD_PRINCIPLE / CALIBRATION_TRACEABILITY / INSTRUMENT_MODEL in `notReported` → UNKNOWN (research finding: the normal answer). Different Metric uids → NOT_COMPARABLE unless a COMPARABLE_WITH_CONVERSION assessment (rule in `rationale`, e.g. NGSP % ↔ IFCC mmol/mol master equation) ASSESSES both Metrics.
- trace: the Assessment's HAS_EVIDENCE locators and its DERIVED_FROM input Assertions (method fields, certificates) → TRACE-EDGE.
- bitemporal episode needed on: PERFORMED_WITH_VERSION.

## CQ-DX-04

- kind: cypher
- pattern: which algorithm version produced a score, stated / inferred / unknown.

```cypher
MATCH (av:AlgorithmVersion)-[:OUTPUTS_METRIC]->(m:Metric {uid: $metricUid})
OPTIONAL MATCH (av)-[d:DERIVED_FROM_ALGORITHM_VERSION]->(pub:AlgorithmVersion)
OPTIONAL MATCH (av)-[:REQUIRES_INPUT_METRIC]->(inp:Metric)
OPTIONAL MATCH (x:Assertion)-[:HAS_OBJECT]->(av) WHERE x.status = 'UNRESOLVED'   // competing hypotheses (registry text)
OPTIONAL MATCH (t:LabTest)-[pw:PERFORMED_WITH_VERSION]->(av)                        // AS-OF(pw): the reports that print this score
RETURN av.algorithmFamily, av.versionLabel, av.versionBasis, av.inputPlatforms, av.inputFeatureCount,
       pub.versionLabel AS derivedFromVersion, collect(DISTINCT inp.name) AS inputs, collect(DISTINCT x.uid) AS unresolved,
       collect(DISTINCT t.name) AS reportedBy
```

- trace: TRACE-NODE(av, [ALGORITHM_VERSION_LABEL, ALGORITHM_INPUT_PLATFORM, ALGORITHM_FEATURE_COUNT]) (DunedinPACE: "The resulting algorithm included 173 CpG sites."); TRACE-EDGE(d).
- bitemporal episode needed on: PERFORMED_WITH_VERSION for the `reportedBy` column only (versions themselves are insert-only states).

## CQ-DX-05

- kind: cypher (assessment lookup) + assessment production
- pattern: is a difference between two scores larger than the documented technical noise of that version.

```cypher
MATCH (av:AlgorithmVersion {uid: $avUid})
OPTIONAL MATCH (rel:Assertion {predicate: 'REPORTS_RELIABILITY'})-[:HAS_SUBJECT]->(av)
OPTIONAL MATCH (rel2:Assertion {predicate: 'REPORTS_RELIABILITY'})-[:HAS_SUBJECT]->(:AlgorithmVersion)<-[:DERIVED_FROM_ALGORITHM_VERSION]-(av)
OPTIONAL MATCH (cd:Assessment {assessmentSubkind: 'D4.change-detectability'})-[:ASSESSES]->(av) WHERE cd.recordedTo IS NULL
RETURN av.familyKey, av.realization, collect(DISTINCT rel{.valueNumber,.unitCode,.qualifiers}) AS ownReliability,
       collect(DISTINCT rel2{.valueNumber,.unitCode,.qualifiers}) AS publicationReliability, cd.conclusionCode AS verdict, cd.summary
```

- rule: |Δ| ≤ replicate deviation of *this* version → "not established as a change"; reliability only on the publication version (`rel2`) → "no reliability source for this pipeline"; none → "no reliability source".
- trace: TRACE-NODE on the reliability Assertions (Higgins-Chen: "median deviations range from 0.9 to 2.4 years and maxima range from 4.5 to 8.6 years").
- bitemporal episode needed on: none.

## CQ-DX-06

- kind: cypher
- pattern: which reference interval applied when a result was reported.

```cypher
MATCH (t:LabTest {uid: $testUid})-[pw:PERFORMED_WITH_VERSION]->(av:AssayVersion)   // AS-OF(pw) at $reportDate
MATCH (ri:ReferenceIntervalVersion)-[:INTERVAL_FOR]->(av)
MATCH (ri)-[:INTERVAL_FOR]->(m:Metric {uid: $metricUid})
WHERE (ri.effectiveFrom IS NULL OR ri.effectiveFrom <= date($reportDate))
  AND (ri.effectiveTo IS NULL OR ri.effectiveTo > date($reportDate))
  AND ($sex IS NULL OR ri.sex IN ['ALL', 'NOT_REPORTED', $sex])          // D3 SexScope; NOT_REPORTED rows are returned and flagged
RETURN ri.intervalKind, ri.derivation, ri.intervalText, ri.lowerBound, ri.upperBound, ri.unitCode, ri.sex, ri.minAgeYears, ri.maxAgeYears, ri.partitionText, ri.notReported
ORDER BY ri.intervalKind
```

- trace: TRACE-NODE(ri, [INTERVAL_TEXT]) — the verbatim list items ("• Hemoglobin (Hb) A1c: 4.8% to 5.6%", "• Prediabetes: 5.7% to 6.4%"); the kind (reference interval vs decision limit vs guideline target) is itself an Assertion with that locator.
- bitemporal episode needed on: PERFORMED_WITH_VERSION (interval effective dates are payload).

## CQ-DX-07

- kind: cypher
- pattern: what a model-derived feature service establishes (cohort, definition, unit, version) and what it does not.

```cypher
MATCH (av:AlgorithmVersion {realization: 'SERVICE_ENDPOINT'})-[:OUTPUTS_METRIC]->(m:Metric)
WHERE av.uid = $avUid
OPTIONAL MATCH (av)-[:REQUIRES_INPUT_METRIC]->(inp:Metric)
RETURN av.versionBasis, av.versionPinnedAt, av.trainingPopulationText, m.definitionText, m.canonicalUnitCode,
       av.notReported + m.notReported AS cannotEstablish, collect(inp.name)
```

- trace: TRACE-NODE(av) + TRACE-NODE(m) on the API schema snapshot (JSON_POINTER selectors, e.g. Oura OpenAPI `PublicSleepAlgorithmVersion`).
- bitemporal episode needed on: none (the service state is pinned by `versionPinnedAt` = retrieval date with basis SERVICE_ENDPOINT_UNVERSIONED).

## CQ-DX-09

- kind: cypher
- pattern: which device model and algorithm/firmware state produced a wearable metric on date D, and when the vendor changed it.

```cypher
MATCH (d:Device {uid: $deviceUid})<-[r:RUNS_ON_DEVICE]-(av:AlgorithmVersion)-[:OUTPUTS_METRIC]->(m:Metric {uid: $metricUid})
WITH d, av, m, r,
     ((r.validFrom IS NULL OR r.validFrom <= $asOf) AND (r.validTo IS NULL OR r.validTo > $asOf)) AS activeAtD
WHERE r.recordedTo IS NULL
RETURN av.componentLabel, av.versionLabel, av.versionBasis, av.versionPinnedAt, r.validFrom, r.validTo,
       r.validFromBasis, activeAtD
ORDER BY r.validFrom   // the change history; rows with activeAtD = true answer "on date D"
```

- trace: TRACE-EDGE(r) — vendor changelog ("WHOOP has a new heart rate algorithm that improves accuracy …", 2026-07-06) or a forum post for firmware numbers (asserter = forum member, low authority; open question for K/D9).
- bitemporal episode needed on: RUNS_ON_DEVICE.

## CQ-AX-21

- kind: cypher
- pattern: from two AssayVersion or AlgorithmVersion uids supplied by the private store, return the shared comparability assessment — never a personal value.

```cypher
MATCH (x {uid: $uid1}), (y {uid: $uid2})
WHERE (x:AssayVersion OR x:AlgorithmVersion) AND (y:AssayVersion OR y:AlgorithmVersion)
OPTIONAL MATCH (ca:Assessment)-[:ASSESSES]->(x), (ca)-[:ASSESSES]->(y)
WHERE ca.assessmentKind = 'COMPARABILITY' AND ca.status = 'ACCEPTED' AND ca.recordedTo IS NULL
RETURN coalesce(ca.conclusionCode, 'UNKNOWN') AS verdict, ca.rationale, ca.uid
```

- trace: the Assessment's HAS_EVIDENCE locators; the request carries no result value (privacy: only shared-graph uids cross the boundary).
- bitemporal episode needed on: none.

## Q-D4-01

- kind: cypher (one pattern spanning D1 → D2 → D3 → D4; agreed with the D2 packet in this worktree, D2 `_notes/research-notes.md` §7)
- pattern: compound → mechanism → biomarker → metric → orderable test, with the compartment/method match against the human evidence.

```cypher
// hop 1 (D2 derived projection): compound -> mechanism, measured in humans
MATCH (c:ChemicalSubstance {uid: $compoundUid})-[am:AFFECTS_MECHANISM]->(mech:Mechanism)
WHERE am.derivationRule STARTS WITH $d2Method
// hop 2 (D4, asserted): biomarker reflects mechanism
MATCH (b:Biomarker)-[rm:REFLECTS_MECHANISM]->(mech)
// alternative direct branch (D4 HAS_ANALYTE, structural): the biomarker's analyte is the compound itself or its product
//   (NR -> NAD+); the precursor link is a D1/D2 predicate-only Assertion:
//   MATCH (b:Biomarker)-[:HAS_ANALYTE]->(an:ChemicalSubstance)
//   WHERE an = c OR EXISTS { (pa:Assertion {predicate: 'IS_PRECURSOR_OF'})-[:HAS_SUBJECT]->(c), (pa)-[:HAS_OBJECT]->(an) }
// hop 3 (D3 seam; D3 SDL 2026-10-08: OutcomeDefinition.measures -> Metric | Biomarker | Outcome | Condition):
// what the human study measured, at metric precision when the source states it, else at biomarker level
OPTIONAL MATCH (od:OutcomeDefinition)-[:MEASURES]->(sm:Metric)-[:QUANTIFIES]->(b)
OPTIONAL MATCH (odb:OutcomeDefinition)-[:MEASURES]->(b)
// hop 4 (D4): orderable tests for the same biomarker, as of now
MATCH (b)<-[:QUANTIFIES]-(tm:Metric)<-[mm:MEASURES_METRIC]-(t:LabTest)              // AS-OF(mm)
OPTIONAL MATCH (t)-[pw:PERFORMED_WITH_VERSION]->(av:AssayVersion)                  // AS-OF(pw)
OPTIONAL MATCH (p:Product)-[:DELIVERS]->(t)
RETURN c.name, mech.name, b.name, sm.name AS studyMetric, sm.systemOntologyId AS studyCompartment,
       tm.name AS testMetric, tm.systemOntologyId AS testCompartment, t.name, av.methodPrinciple, p.name,
       CASE WHEN sm IS NULL THEN 'UNKNOWN'
            WHEN sm = tm THEN 'SAME_METRIC'
            WHEN sm.systemOntologyId <> tm.systemOntologyId THEN 'NOT_COMPARABLE_COMPARTMENT'
            ELSE 'CHECK_ASSESSMENT' END AS matchFlag
```

- expected (fixture `nr-nad-compound-to-test`): NR → NAD+ metabolism → Biomarker NAD+ → study Metric "NAD+ in PBMC (pmol/mg protein)" (CL:0000842, LC-MS) vs test Metric "NAD+ in red blood cells (µM)" (CL:0000232) → `NOT_COMPARABLE_COMPARTMENT`: a test exists, but it does not measure what the trial measured.
- trace: per hop — D2 `am.derivedFromAssertionUids` → TRACE-EDGE on each; TRACE-EDGE(rm) (the paper that establishes the marker); D3 outcome locator (CT.gov JSON_POINTER, paper Results TEXT_QUOTE "measurable in circulating peripheral blood mononuclear cells (PBMCs), but undetectable in plasma and urine"); TRACE-EDGE(mm) (Jinfiniti "This test measures NAD+ intracellularly, meaning inside your red blood cells.").
- bitemporal episode needed on: MEASURES_METRIC, PERFORMED_WITH_VERSION (hop 4 only). REFLECTS_MECHANISM is recorded-only (`AssertedRecordedProperties`); `rm.assertionUid` is still on the edge for TRACE-EDGE.
- **One pattern with D2 (check stage).** The merged D2 ∪ D4 form is written in D2 `03-retrieval-patterns.md` § Q-D2-03 "Joint D2 ∪ D4 pattern" (D2's two hop-2 branches: `REFLECTS_MECHANISM`, and `HAS_ANALYTE` → ChemicalSubstance | MolecularEntity `-PARTICIPATES_IN->` Mechanism, which replaces this section's `IS_PRECURSOR_OF` sketch) with D4's hops 3–4. The synthesizer keeps that one pattern under both ids (Q-D2-03 = Q-D4-01), with one change from this section: hop 3 reads the study metric through D3 `OutcomeDefinition -MEASURES-> Metric` (D3 SDL now admits Metric) instead of the `$studyMetricUids` parameter. Fixtures: D4 `nr-nad-compound-to-test` (non-empty hop 4, NOT_COMPARABLE) and D2 `dq-senescence-biomarker-path` (NO_ORDERABLE_TEST).

## Q-D4-02

- kind: cypher + assessment
- pattern: does the test a consumer can buy measure what the study measured.

```cypher
MATCH (sm:Metric {uid: $studyMetricUid}), (t:LabTest {uid: $testUid})-[mm:MEASURES_METRIC]->(tm:Metric)   // AS-OF(mm)
OPTIONAL MATCH (t)-[pw:PERFORMED_WITH_VERSION]->(tav:AssayVersion)                                      // AS-OF(pw)
OPTIONAL MATCH (ca:Assessment)-[:ASSESSES]->(sm), (ca)-[:ASSESSES]->(tm)
WHERE ca.assessmentKind = 'COMPARABILITY' AND ca.recordedTo IS NULL
RETURN sm.systemOntologyId, tm.systemOntologyId, sm.canonicalUnitCode, tm.canonicalUnitCode, tav.methodPrinciple,
       tav.specimenOntologyIds, coalesce(ca.conclusionCode,
         CASE WHEN sm.systemOntologyId <> tm.systemOntologyId THEN 'NOT_COMPARABLE' ELSE 'UNKNOWN' END) AS verdict
```

- trace: TRACE-NODE(sm) and TRACE-NODE(tm) for the compartment fields; the Assessment's evidence when one exists.
- bitemporal episode needed on: MEASURES_METRIC, PERFORMED_WITH_VERSION.

## Q-D4-03

- kind: cypher
- pattern: what consumer panel P measures as of D, mapped to Metric/LOINC and to aging biomarkers.

```cypher
MATCH (p:LabTest {uid: $panelUid, testKind: 'PANEL'})-[inc:INCLUDES_TEST]->(t:LabTest)        // AS-OF(inc)
OPTIONAL MATCH (t)-[mm:MEASURES_METRIC]->(m:Metric)-[:QUANTIFIES]->(b:Biomarker)               // AS-OF(mm)
OPTIONAL MATCH (m)-[:HAS_IDENTIFIER]->(l:Identifier {scheme: 'LOINC'})
RETURN t.name, m.name, l.value, b.name, b.uid IN $agingBiomarkerUids AS agingBiomarker
```

- trace: TRACE-EDGE(inc) (the vendor's panel list), TRACE-EDGE(mm).
- bitemporal episode needed on: INCLUDES_TEST, MEASURES_METRIC.

## Q-D4-04

- kind: cypher
- pattern: which consumer biological-age products report which algorithm family, and what each discloses.

```cypher
MATCH (t:LabTest {testKind: 'ALGORITHM_REPORT'})-[pw:PERFORMED_WITH_VERSION]->(av:AlgorithmVersion)   // AS-OF(pw), $asOf = now
WHERE av.algorithmKind IN ['EPIGENETIC_CLOCK', 'GLYCAN_CLOCK', 'BLOOD_CHEMISTRY_CLOCK']
OPTIONAL MATCH (t)-[:PERFORMED_WITH_VERSION]->(asv:AssayVersion)-[:PERFORMED_BY_LAB]->(lab:Organization)
OPTIONAL MATCH (prod:Product)-[:DELIVERS]->(t)
RETURN prod.name, t.name, av.algorithmFamily, av.versionLabel, av.versionBasis, asv.platform, asv.specimenKinds, lab.name,
       av.notReported + coalesce(asv.notReported, []) AS notDisclosed
```

- trace: TRACE-EDGE(pw) per cell; NOT_REPORTED cells cite the read section (TruAge sample report: the string "version" does not occur — WHOLE_SNAPSHOT `FIELD_NOT_REPORTED`).
- bitemporal episode needed on: PERFORMED_WITH_VERSION.

## Q-D4-05

- kind: cypher + assessment
- pattern: does a vendor's retest interval let a user detect real change.

```cypher
MATCH (t:LabTest {uid: $testUid})-[pw:PERFORMED_WITH_VERSION]->(av:AlgorithmVersion)                 // AS-OF(pw)
OPTIONAL MATCH (adv:Assertion {predicate: 'RECOMMENDS_RETEST_INTERVAL'})-[:HAS_SUBJECT]->(t)   // asserter = the vendor
OPTIONAL MATCH (cd:Assessment {assessmentSubkind: 'D4.change-detectability'})-[:ASSESSES]->(av) WHERE cd.recordedTo IS NULL
OPTIONAL MATCH (cd)-[:DERIVED_FROM]->(input:Assertion)
RETURN adv.valueString AS advisedInterval, coalesce(cd.conclusionCode, 'NOT_ASSESSED') AS verdict, cd.summary, collect(input.predicate) AS weighed
```

- trace: TRACE-NODE on the advice ("Be sure to retest every 3 months to track your progress.") and on the reliability inputs; the Assessment's HAS_EVIDENCE.
- bitemporal episode needed on: PERFORMED_WITH_VERSION.

## Q-D4-06

- kind: cypher + assessment
- pattern: is a vendor implementation a distinct version from the publication.

```cypher
MATCH (v:AlgorithmVersion {realization: 'VENDOR_IMPLEMENTATION', familyKey: $family})
OPTIONAL MATCH (v)-[d:DERIVED_FROM_ALGORITHM_VERSION]->(pub:AlgorithmVersion {realization: 'PUBLICATION_REFERENCE'})
OPTIONAL MATCH (eq:Assessment {assessmentSubkind: 'D4.algorithm-equivalence'})-[:ASSESSES]->(v)
WHERE (eq)-[:ASSESSES]->(pub) AND eq.recordedTo IS NULL
OPTIONAL MATCH (t:LabTest)-[pw:PERFORMED_WITH_VERSION]->(v)                         // AS-OF(pw): the vendor test that runs v
RETURN v.name, v.versionBasis, pub.name, collect(DISTINCT t.name) AS vendorTests,
       coalesce(eq.conclusionCode, 'UNRESOLVED') AS relation, eq.summary
```

- trace: TRACE-EDGE(d) (TruAge "Pace of Aging (DunedinPACE™)"; DunedinPACE paper "Code to compute DunedinPACE is publicly available on GitHub").
- bitemporal episode needed on: PERFORMED_WITH_VERSION (`vendorTests` as of today or a report date).

## Q-D4-07

- kind: cypher
- pattern: are two wearable values sold under one name the same metric.

```cypher
MATCH (m:Metric) WHERE m.uid IN $metricUids    // e.g. WHOOP hrv_rmssd_milli, Apple heartRateVariabilitySDNN, Oura average_hrv
OPTIONAL MATCH (av:AlgorithmVersion)-[:OUTPUTS_METRIC]->(m)
OPTIONAL MATCH (av)-[r:RUNS_ON_DEVICE]->(d:Device)                                     // AS-OF(r)
RETURN m.name, m.definitionIssuerName, m.methodText, m.canonicalUnitCode, m.timeAspect, m.notReported, d.name,
       size(collect(DISTINCT [m.methodText, m.canonicalUnitCode, m.timeAspect])) = 1 AS sameDefinition
```

- trace: TRACE-NODE(m, [METRIC_DEFINITION_TEXT, METRIC_METHOD]) per metric (JSON_POINTER into OpenAPI / doc JSON).
- bitemporal episode needed on: RUNS_ON_DEVICE (only when asked for a date).

## Q-D4-08

- kind: cypher
- pattern: devices or tests that claim to measure a quantity they do not measure or that is unauthorized, and what the regulator said. Starts from the SAFETY_SIGNAL Assessment (it ASSESSES the Claim and the Metric), because claim occurrences are often not captured (FDA only retells the sellers' claim); occurrences, the means they name and third-party ratings are optional joins. Adversarial-review pass: the model-stage form started from a `CLAIMS_TO_MEASURE` claim occurrence that the fixture never writes.

```cypher
MATCH (sig:Assessment {assessmentKind: 'SAFETY_SIGNAL', assessmentSubkind: 'D4.unauthorized-measurement'})-[:ASSESSES]->(cl:Claim)
MATCH (sig)-[:ASSESSES]->(m:Metric)
WHERE sig.effectDirection = 'HARM' AND sig.recordedTo IS NULL
OPTIONAL MATCH (occ:Assertion {assertionKind: 'CLAIM'})-[:OCCURRENCE_OF]->(cl)            // who claimed it, where (D9 containers)
OPTIONAL MATCH (occ)-[:HAS_SUBJECT]->(means) WHERE means:Device OR means:LabTest OR means:Product
OPTIONAL MATCH (means)<-[:DELIVERS]-(p:Product)                                             // the purchasable item when the means is a Device / LabTest
OPTIONAL MATCH (rate:Assertion {predicate: 'RATES_CLAIM'})-[:HAS_SUBJECT]->(cl)            // kernel convention: third-party verdicts
OPTIONAL MATCH (rate)-[:ASSERTED_BY]->(rater:Organization)
RETURN cl.name, m.name, sig.verdict, sig.summary, sig.evidenceCutoffAt,
       collect(DISTINCT {who: rater.name, rating: rate.valueString, validFrom: rate.validFrom}) AS ratings,
       collect(DISTINCT coalesce(p.name, means.name)) AS namedMeans, count(DISTINCT occ) AS occurrences
```

- expected (fixture `noninvasive-glucose-cgm-recall`): Claim "smartwatches or smart rings measure blood glucose without piercing the skin" × Metric glucose-in-blood → s01 verdict CONTRADICTED, HARM; ratings c01–c03 by FDA (NOT_AUTHORIZED, CAPABILITY_DENIED, HARMFUL_IF_RELIED_ON, valid from 2024-02-21); occurrences 0 and namedMeans empty (no seller page captured; FDA scope is "any smartwatch or smart ring, regardless of brand").
- trace: the Assessment's HAS_EVIDENCE (FDA: "The FDA has not authorized, cleared, or approved any smartwatch or smart ring that is intended to measure or estimate blood glucose values on its own.", "Date Issued: February 21, 2024") and TRACE-NODE on the RATES_CLAIM Assertions; claim occurrences, when captured, through their own locators.
- bitemporal episode needed on: none (the assessment and ratings carry valid time on kernel records).

## Q-D4-09

- kind: cypher (spans D6 and D8)
- pattern: recalls, safety communications, adverse-event counts affecting the device model that produced metric M. D8 records attach to the D6 Product (D8 `RegulatoryRecordTopic` already admits Product), which DELIVERS the Device; UDI-DI / REF / 510(k) identifiers on the Device disambiguate which model a record names. Adversarial-review pass: no D8 union change is needed (the model-stage form required a `CONCERNS -> Device` edge that does not exist).

```cypher
MATCH (d:Device)<-[r:RUNS_ON_DEVICE]-(:AlgorithmVersion)-[:OUTPUTS_METRIC]->(m:Metric {uid: $metricUid})   // AS-OF(r)
MATCH (d)<-[:DELIVERS]-(p:Product)<-[:CONCERNS]-(rec:RegulatoryRecord)                                     // D6 + D8 SDL 2026-10-08
OPTIONAL MATCH (d)-[:HAS_IDENTIFIER]->(id:Identifier) WHERE id.scheme IN ['UDI_DI', 'FDA_510K']   // kernel stores Subjectable -> Identifier
OPTIONAL MATCH (err:Assertion {predicate: 'REPORTED_MEASUREMENT_ERROR'})-[:HAS_SUBJECT]->(d)
RETURN d.name, p.name, rec.recordKind, rec.recordNumber, rec.issuedAt, rec.recallClass, rec.reasonVerbatim,
       collect(DISTINCT id.scheme + ':' + id.value) AS deviceIds, collect(DISTINCT err.valueString) AS deviceLevelErrors
```

- expected (fixture `noninvasive-glucose-cgm-recall`): FreeStyle Libre 3 sensor ← DELIVERS ← Product "FreeStyle Libre 3 CGM System" (c04); the openFDA recall Z-1020-2026 (event 98049, "incorrect low glucose results") is a D8 record about that Product; device ids UDI-DI 00357599818005, K212132 (c08, c09); device-level statement c07.
- trace: D8 record locators (openFDA API_RECORD / JSON_POINTER, e.g. recall 98049 `reason_for_recall`); TRACE-EDGE on DELIVERS; TRACE-NODE on REPORTED_MEASUREMENT_ERROR.
- bitemporal episode needed on: RUNS_ON_DEVICE (D8 records carry their own dates).
- promote to a `CONCERNS -> Device` target (D8 union 5 -> 6) only if recalls that cannot be attributed to any Product become common.

## Q-D4-10

- kind: cypher (D6 + D8 seams)
- pattern: regulatory state of a device or test as of D. A Device reaches D8 `LegalStatus` through the D6 Product that DELIVERS it (`LegalStatusSubject` already admits Product); a LabTest reaches it the same way when it is sold as a Product, and its laboratory standing (CLIA / LDT) reaches it through the performing lab Organization (`AssayVersion -PERFORMED_BY_LAB->`, D8 `RegulatoryRecord -ADDRESSED_TO-> Organization`). No D8 union change (adversarial-review pass).

```cypher
MATCH (x {uid: $uid}) WHERE x:Device OR x:LabTest
OPTIONAL MATCH (x)<-[:DELIVERS]-(p:Product)<-[s:STATUS_OF]-(ls:LegalStatus)              // D8 episode edge; AS-OF(s)
OPTIONAL MATCH (ls)-[:STATUS_FROM]->(rec:RegulatoryRecord)
OPTIONAL MATCH (x)-[pw:PERFORMED_WITH_VERSION]->(:AssayVersion)-[:PERFORMED_BY_LAB]->(lab:Organization)<-[:ADDRESSED_TO]-(labRec:RegulatoryRecord)   // LabTest only; AS-OF(pw)
RETURN x.name, p.name, ls.statusKind, ls.pathway, ls.marketStatus, rec.recordNumber, s.validFrom, s.validTo,
       lab.name, labRec.recordKind, labRec.recordNumber
```

- trace: D8 record locators (510(k) record JSON_POINTER; Federal Register LDT vacatur document); TRACE-EDGE on DELIVERS and PERFORMED_WITH_VERSION.
- bitemporal episode needed on: the D8 status edge (owned by D8); PERFORMED_WITH_VERSION for the lab branch.

## Q-D4-11

- kind: cypher
- pattern: which methods give falsely high/low results under condition C, and which method my lab uses.

```cypher
MATCH (t:LabTest {uid: $testUid})-[pw:PERFORMED_WITH_VERSION]->(av:AssayVersion)                  // AS-OF(pw)
OPTIONAL MATCH (i:Assertion {predicate: 'INTERFERES_WITH'})-[:HAS_SUBJECT]->(av)
OPTIONAL MATCH (g:Assertion {predicate: 'INTERFERES_WITH'})-[:HAS_SUBJECT]->(:AssayVersion {methodPrinciple: av.methodPrinciple})
WHERE g.proposition CONTAINS $condition
RETURN av.methodPrinciple, av.methodText, av.notReported, collect(DISTINCT i{.proposition,.qualifiers}) AS labSpecific,
       collect(DISTINCT g{.proposition,.qualifiers}) AS methodClass
// answer: "risk not excludable" when the lab's method is known only by principle (NGSP footnote: "it can generally be
// assumed that immunoassay, boronate affinity and enzymatic methods show interference from elevated HbF levels")
```

- trace: TRACE-NODE on each interference Assertion (Labcorp "Specimens containing high amounts of HbF (>10 %) may result in lower than expected HbA1c values."; NGSP table row).
- bitemporal episode needed on: PERFORMED_WITH_VERSION.

## Q-D4-12

- kind: cypher
- pattern: is a vendor "optimal range" a reference interval, decision limit or vendor target; who set it, from what population; does the vendor sell the product used to reach it.

```cypher
MATCH (ri:ReferenceIntervalVersion)-[:INTERVAL_FOR]->(m:Metric {uid: $metricUid})
OPTIONAL MATCH (ri)-[:INTERVAL_FOR]->(av:AssayVersion)-[:PERFORMED_BY_LAB]->(lab:Organization)
OPTIONAL MATCH (setBy:Assertion {predicate: 'SETS_REFERENCE_RANGE'})-[:HAS_SUBJECT]->(ri)
OPTIONAL MATCH (setBy)-[:ASSERTED_BY]->(issuer:Organization)
OPTIONAL MATCH (prod:Product)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)<-[:LISTING_FOR]-(:MerchantListing)-[:HAS_OFFER]->(:Offer)-[:SELLER_OF_RECORD]->(issuer)   // D6 SDL 2026-10-08
RETURN ri.intervalKind, ri.derivation, ri.intervalText, ri.partitionText, lab.name, issuer.name, collect(prod.name) AS sellerProducts
```

- trace: TRACE-NODE(ri) (Jinfiniti "optimal NAD+ levels (40–100 μM)"; "Jinfiniti pioneered NAD testing, established the reference ranges and guidelines …").
- bitemporal episode needed on: none.

## Q-D4-13

- kind: cypher (spans D6/D7)
- pattern: organizations selling both a test and the product the test is used to optimize.

```cypher
MATCH (testProd:Product)-[:DELIVERS]->(t:LabTest)-[:MEASURES_METRIC]->(:Metric)-[:QUANTIFIES]->(b:Biomarker)
MATCH (testProd)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)<-[:LISTING_FOR]-(:MerchantListing)-[:HAS_OFFER]->(:Offer)-[:SELLER_OF_RECORD]->(org:Organization)
MATCH (other:Product)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)<-[:LISTING_FOR]-(:MerchantListing)-[:HAS_OFFER]->(:Offer)-[:SELLER_OF_RECORD]->(org)
WHERE other <> testProd                                                    // D6 seller path, D6 SDL 2026-10-08
OPTIONAL MATCH (claim:Assertion)-[:HAS_SUBJECT]->(other)            // D5 IMPROVES_TARGET; D2 INCREASES_LEVEL_OF (registered by D2, object D4 Biomarker)
WHERE claim.predicate = 'IMPROVES_TARGET' OR (claim.predicate = 'INCREASES_LEVEL_OF' AND (claim)-[:HAS_OBJECT]->(b))
RETURN org.name, t.name, b.name, other.name, claim.proposition
```

- trace: TRACE-EDGE on DELIVERS and on D6's SELLER_OF_RECORD episodes; the claim occurrence locator (Jinfiniti "… conducted on our own Vitality↑® NAD+ Booster …").
- bitemporal episode needed on: none (current state).

## Q-D4-14

- kind: cypher (D3 seam)
- pattern: registered trials using biomarker or clock B as an outcome; do they state version, lab, specimen.

```cypher
MATCH (b:Biomarker {uid: $biomarkerUid})
MATCH (od:OutcomeDefinition)-[:MEASURES]->(y) WHERE y = b OR EXISTS { (y:Metric)-[:QUANTIFIES]->(b) }   // D3 measures -> Biomarker | Metric
OPTIONAL MATCH (x:Assertion {predicate: 'OUTCOME_MEASURED_WITH'})-[:HAS_SUBJECT]->(od)
OPTIONAL MATCH (x)-[:HAS_OBJECT]->(target)            // AlgorithmVersion | AssayVersion | Metric
RETURN od.name, od.description, od.timepoint, x.status, labels(target)[0], target.name, x.status = 'UNRESOLVED' AS versionUnresolved
```

- trace: CT.gov JSON_POINTER locators (NCT07220473 `/protocolSection/outcomesModule/primaryOutcomes/0/description`: "… (DNAmAge, DNAm PhenoAge, DNAm GrimAge, and DunedinPACE) …"); UNRESOLVED assertions carry both hypotheses (GrimAge vs GrimAge2).
- bitemporal episode needed on: none (D3 registry versions handle time).

## Q-D4-15

- kind: cypher + assessment (disconfirmation)
- pattern: do "reverses biological age" claims rest on one clock, one timepoint, an unstated version, or a change within noise.

```cypher
MATCH (occ:Assertion {assertionKind: 'CLAIM'})-[:OCCURRENCE_OF]->(cl:Claim {uid: $claimUid})
OPTIONAL MATCH (dis:Assessment {assessmentSubkind: 'D4.bio-age-claim-disconfirmation'})-[:ASSESSES]->(cl) WHERE dis.recordedTo IS NULL
OPTIONAL MATCH (dis)-[:DERIVED_FROM]->(inp:Assertion)-[:HAS_SUBJECT]->(av:AlgorithmVersion)
OPTIONAL MATCH (dis)-[:DERIVED_FROM]->(cd:Assessment {assessmentSubkind: 'D4.change-detectability'})
RETURN cl.name, count(DISTINCT occ) AS occurrences, dis.verdict, collect(DISTINCT av.familyKey) AS clocks,
       collect(DISTINCT av.versionBasis) AS versionBases, collect(DISTINCT cd.summary) AS noiseChecks
```

- trace: the Assessment's HAS_EVIDENCE (role CONTRADICTS / QUALIFIES) to the noise locators and the claim occurrences' locators; Report (EVIDENCE_REPORT) if a mission published it.
- bitemporal episode needed on: none.

## Q-D4-16

- kind: cypher
- pattern: which metrics quantify the same biomarker, measured versus inferred.

```cypher
MATCH (b:Biomarker {uid: $biomarkerUid})<-[:QUANTIFIES]-(m:Metric)
OPTIONAL MATCH (av:AlgorithmVersion)-[:OUTPUTS_METRIC]->(m)
OPTIONAL MATCH (b)-[:HAS_ANALYTE]->(c:ChemicalSubstance)
RETURN b.name, c.name, m.name, m.metricKind, m.defaultResultKind, m.systemText, collect(DISTINCT av.familyKey) AS producedBy
ORDER BY m.defaultResultKind
```

- trace: TRACE-NODE(m, [METRIC_DEFINITION_TEXT]) (LOINC 4548-4 page; GrimAge2 component list for DNAm logA1C).
- bitemporal episode needed on: none.

## Q-D4-17

- kind: cypher (D5 seam)
- pattern: for target T, which metrics operationalize it and which tests and devices measure them.

```cypher
MATCH (tg:Target {uid: $targetUid})-[:OPERATIONALIZED_BY]->(x)                 // D5 TargetMeasure = Biomarker | Metric | Outcome
MATCH (m:Metric)-[:QUANTIFIES]->(b:Biomarker) WHERE x = b OR x = m
OPTIONAL MATCH (t:LabTest)-[mm:MEASURES_METRIC]->(m)                                           // AS-OF(mm)
OPTIONAL MATCH (av:AlgorithmVersion)-[:OUTPUTS_METRIC]->(m)
OPTIONAL MATCH (av)-[r:RUNS_ON_DEVICE]->(d:Device)                                              // AS-OF(r)
RETURN b.name, m.name, m.metricKind, m.definitionText, collect(DISTINCT t.name) AS tests, collect(DISTINCT d.name) AS devices
```

- trace: D5's OPERATIONALIZED_BY is curated (structural); TRACE-EDGE(mm), TRACE-EDGE(r).
- bitemporal episode needed on: MEASURES_METRIC, RUNS_ON_DEVICE.

## Q-D4-18

- kind: cypher (D5 + D6 + D8 seams)
- pattern: tests/devices marketed for target T that are unauthorized, not run in a certified lab, or disclaim being diagnostic. D5 registers `INTENDED_FOR_TARGET` with subjects including Device and D6 Product (not LabTest), so a LabTest is reached through the Product that DELIVERS it; D8 status through that Product (D8 `LegalStatus -STATUS_OF-> Product`).

```cypher
MATCH (intent:Assertion {predicate: 'INTENDED_FOR_TARGET'})-[:HAS_OBJECT]->(:Target {uid: $targetUid})
MATCH (intent)-[:HAS_SUBJECT]->(s) WHERE s:Device OR s:Product
OPTIONAL MATCH (s)-[:DELIVERS]->(t:LabTest)                                   // Product -> LabTest (D4 DELIVERS, direction IN on LabTest)
WITH intent, s, t, CASE WHEN s:Product THEN s ELSE null END AS sp
OPTIONAL MATCH (s)<-[:DELIVERS]-(dp:Product) WHERE s:Device
WITH intent, coalesce(t, s) AS x, coalesce(sp, dp) AS p
OPTIONAL MATCH (dis:Assertion {predicate: 'DISCLAIMS_DIAGNOSTIC_USE'})-[:HAS_SUBJECT]->(x)
OPTIONAL MATCH (p)<-[st:STATUS_OF]-(ls:LegalStatus)                           // D8; AS-OF(st)
RETURN x.name, labels(x)[0], p.name, dis.valueString, ls.statusKind, CASE WHEN ls IS NULL THEN 'NOT_REPORTED' END AS regulatoryState
```

- trace: TRACE-NODE on disclaimers (GlycanAge "not a diagnostic" FAQ); D8 record locators; the INTENDED_FOR_TARGET occurrence's locator.
- bitemporal episode needed on: none in D4 (the D8 status edge has its own).

## Q-D4-19

- kind: cypher
- pattern: pre-analytical conditions that can invalidate a result; do two labs differ.

```cypher
MATCH (t:LabTest) WHERE t.uid IN [$t1, $t2]
OPTIONAL MATCH (t)-[pw:PERFORMED_WITH_VERSION]->(av:AssayVersion)                              // AS-OF(pw)
RETURN t.name, t.collectionModes, t.specimenText, t.preAnalyticalText, av.specimenKinds, av.notReported
```

- trace: TRACE-NODE(t, [TEST_SPECIMEN_TEXT, TEST_PREANALYTICAL_TEXT]) (Labcorp / Quest specimen sections).
- bitemporal episode needed on: PERFORMED_WITH_VERSION.

## Q-D4-20

- kind: cypher
- pattern: which clock is offered by which vendors, which publication backs each, which academic groups are named as co-developers.

```cypher
MATCH (v:AlgorithmVersion {familyKey: $family})
OPTIONAL MATCH (v)-[d:DERIVED_FROM_ALGORITHM_VERSION]->(pub:AlgorithmVersion)
OPTIONAL MATCH (t:LabTest)-[:PERFORMED_WITH_VERSION]->(v)
OPTIONAL MATCH (prod:Product)-[:DELIVERS]->(t)
OPTIONAL MATCH (dw:Assertion {predicate: 'DEVELOPED_WITH'})-[:HAS_SUBJECT]->(v)
OPTIONAL MATCH (dw)-[:HAS_OBJECT]->(acad:Organization)
OPTIONAL MATCH (pubSrc:Assertion {predicate: 'IMPLEMENTS_PUBLICATION'})-[:HAS_SUBJECT]->(pub)
RETURN v.realization, v.name, pub.name, collect(DISTINCT prod.name) AS products, collect(DISTINCT acad.name) AS coDevelopers
```

- trace: TRACE-EDGE(d); TRACE-NODE on DEVELOPED_WITH ("developed with Harvard/Yale/Duke" marketing text).
- bitemporal episode needed on: none (current offering uses PERFORMED_WITH_VERSION AS-OF now).

## Q-D4-21

- kind: cypher
- pattern: LOINC / UCUM codes for metric M; which consumer metrics lack a standard code.

```cypher
MATCH (m:Metric)
OPTIONAL MATCH (m)-[:HAS_IDENTIFIER]->(l:Identifier {scheme: 'LOINC'})
WITH m, l WHERE $metricUid IS NULL OR m.uid = $metricUid
RETURN m.name, m.definitionSource, l.value AS loinc, m.canonicalUnitCode AS ucum,
       l IS NULL AND m.definitionSource <> 'LOINC' AS lacksStandardCode
```

- trace: identifier assignment through the kernel HAS_IDENTIFIER episode (`IdentifierLinkProperties.assertionUid` → TRACE-EDGE); NLM Clinical Tables search snapshot for "no LOINC hit".
- bitemporal episode needed on: kernel HAS_IDENTIFIER (kernel-owned).

## Q-D4-22

- kind: fulltext + vector (hybrid, rank fusion)
- pattern: resolve a free-text measurement name ("biological age", "NAD level", "HRV", "A1c") to candidate Metrics with an ambiguity flag.

```cypher
CALL db.index.fulltext.queryNodes('d4_measure_names', $text) YIELD node, score
WITH collect({n: node, r: score}) AS ft
CALL db.index.vector.queryNodes('metric_embedding', 20, $textEmbedding) YIELD node AS m, score AS vs   // Neo4j 5.26 (Cypher 5) vector procedure
WITH ft, collect({n: m, r: vs}) AS vec
// reciprocal-rank fusion (scores are not comparable; fuse by rank, k = 60)
WITH [i IN range(0, size(ft) - 1) | {n: ft[i].n, rr: 1.0 / (60 + i)}] + [i IN range(0, size(vec) - 1) | {n: vec[i].n, rr: 1.0 / (60 + i)}] AS ranked
UNWIND ranked AS x
WITH x.n AS hit, sum(x.rr) AS rrf ORDER BY rrf DESC LIMIT 10
OPTIONAL MATCH (hit)-[:QUANTIFIES]->(b:Biomarker)          // Metric hits; Biomarker hits expand to their Metrics
OPTIONAL MATCH (hit)<-[:QUANTIFIES]-(viaB:Metric)
WITH coalesce(viaB, hit) AS cand, b, rrf WHERE cand:Metric
RETURN cand.name, cand.systemOntologyId, cand.methodText, b.name, rrf,
       size(collect(DISTINCT [cand.systemOntologyId, cand.methodText])) > 1 AS ambiguous
```

- indexes: fulltext `d4_measure_names` (Metric.searchText, Biomarker.searchText, AlgorithmVersion.algorithmFamily, LabTest.name, Device.name); vector `metric_embedding` on Metric (text = name + LOINC long/consumer names + vendor field name + definitionText; DB-only property). Accepted resolutions are kernel RESOLUTION Assessments licensing `Mention.resolvedTo` / D9 `Chunk.mentions` (derived).
- trace: the Mention's span (HAS_EVIDENCE role CONTEXT) → locator → snapshot; this is the 00-DIRECTIVE 3.8 path demonstrated by fixture `dunedinpace-paper-unstructured`: question → chunk (vector/MENTIONS) → Assertions the chunk's locator supports → SourceLocator → snapshot bytes.
- bitemporal episode needed on: none.

## Q-D4-23

- kind: cypher
- pattern: which assay/method/algorithm changes happened for test or score T and when, so a trend splits at the change.

```cypher
MATCH (t:LabTest {uid: $testUid})-[pw:PERFORMED_WITH_VERSION]->(v)
WHERE pw.recordedTo IS NULL
RETURN labels(v)[0], v.name, v.methodText, v.versionLabel, pw.validFrom, pw.validFromBasis, pw.validTo, pw.validToBasis
ORDER BY pw.validFrom
// devices: same shape over (av:AlgorithmVersion)-[r:RUNS_ON_DEVICE]->(:Device {uid: $deviceUid})
// "change date unknown" when validFromBasis = 'UNKNOWN' (e.g. Gen.3 package insert on Labcorp vs Gen. IV certification at NGSP)
```

- trace: TRACE-EDGE(pw) per episode (changelog / method-change notice locator).
- bitemporal episode needed on: PERFORMED_WITH_VERSION, RUNS_ON_DEVICE.

## Q-D4-24

- kind: cypher (retrieved by default; published variant via D10)
- pattern: rank or compare consumer biological-age tests or CGMs. Answer kind **retrieved** since the adversarial-review pass (accepting D10 11 #4 / `answer-kind-table.md`): computed at query time under a `DecisionCriterion@version` (D10 Q-D10-01 pattern) from the Q-D4-04 / Q-D4-09 / Q-D4-10 rows plus D6 price. Once BellLabs publishes it, it is a kernel `Report` (reportKind COMPARISON, D10 skeleton `d10.product-comparison@1`) whose rows are D10 `ReportItem`s; each row ASSESSES the option (LabTest or Device) and cites its Assertions with `DERIVED_FROM`. The published variant is read like this:

```cypher
MATCH (r:Report {reportKind: 'COMPARISON'})-[:HAS_ITEM]->(ri:ReportItem {itemKind: 'ROW'})-[:ASSESSES]->(x)
WHERE (x:LabTest OR x:Device) AND x.uid IN $optionUids AND r.status = 'ACCEPTED' AND r.recordedTo IS NULL
OPTIONAL MATCH (ri)-[:DERIVED_FROM]->(a:Assertion)
OPTIONAL MATCH (p:Product)-[:DELIVERS]->(x)                                          // D6 price/offer rows join here
RETURN r.uid, r.policyVersion, ri.rank, ri.disposition, ri.cellValues, x.name, labels(x)[0],
       collect(DISTINCT p.uid) AS products, count(DISTINCT a) AS citedAssertions
ORDER BY ri.rank
```

- trace: ReportItem DERIVED_FROM Assertions → TRACE-EDGE / TRACE-NODE; the Report's HAS_EVIDENCE locators.
- bitemporal episode needed on: none (the report and its items are insert-only).

## Q-D4-25

- kind: gds
- algorithm: `gds.nodeSimilarity.stream` (Jaccard) over a Cypher projection of the bipartite graph LabTest(PANEL) → Metric, built from current INCLUDES_TEST + MEASURES_METRIC episodes:

```cypher
MATCH (p:LabTest {testKind: 'PANEL'})-[inc:INCLUDES_TEST]->(:LabTest)-[mm:MEASURES_METRIC]->(m:Metric)
WHERE /* AS-OF(inc) and AS-OF(mm) with $asOf = datetime() ("current"), $knownAt = datetime(); a null validTo is unknown, not ongoing, so such rows are kept and flagged */ true
WITH gds.graph.project('d4-panel-metric', p, m, {}, {undirectedRelationshipTypes: ['*']}) AS g
RETURN g.graphName;
CALL gds.nodeSimilarity.stream('d4-panel-metric', {similarityCutoff: 0.3, topK: 10})
YIELD node1, node2, similarity
WHERE gds.util.asNode(node1).uid = $panelUid
RETURN gds.util.asNode(node2).name, similarity ORDER BY similarity DESC;
```

- refresh cadence: none stored — projected per request (panels are few, hundreds at most); method version `d4.panel-similarity/v1` recorded on the answer's Activity. If a published comparison needs it stored, it becomes a derived projection edge (deferred in 05).
- use: "near-substitutes for panel P" suggestions; never evidence.
- trace: each shared Metric cites TRACE-EDGE(mm) and TRACE-EDGE(inc).
- bitemporal episode needed on: INCLUDES_TEST, MEASURES_METRIC (current episodes only).

## Q-D4-26

- kind: cypher (added in the adversarial-review pass; the question that earns REQUIRES_INPUT_METRIC)
- pattern: which composite scores (blood-chemistry or epigenetic clocks, wearable scores) take as input a metric that carries a HARM safety signal (interference, measurement-error recall, unauthorized measurement), so the score inherits the risk. Traverses REQUIRES_INPUT_METRIC in reverse; an input matches the signalled Metric directly or through a RESOLUTION assessment (one per candidate pair, subkind D4.measurement-name-resolution, conclusionCode RESOLVED or CANDIDATE).

```cypher
MATCH (sig:Assessment {assessmentKind: 'SAFETY_SIGNAL'})-[:ASSESSES]->(m:Metric)
WHERE sig.effectDirection = 'HARM' AND sig.recordedTo IS NULL
MATCH (av:AlgorithmVersion)-[:REQUIRES_INPUT_METRIC]->(inp:Metric)
OPTIONAL MATCH (res:Assessment {assessmentKind: 'RESOLUTION', assessmentSubkind: 'D4.measurement-name-resolution'})-[:ASSESSES]->(inp)
WHERE (res)-[:ASSESSES]->(m) AND res.recordedTo IS NULL AND res.conclusionCode IN ['RESOLVED', 'CANDIDATE']
WITH sig, m, av, inp, res WHERE inp = m OR res IS NOT NULL
OPTIONAL MATCH (av)-[:OUTPUTS_METRIC]->(out:Metric)
OPTIONAL MATCH (t:LabTest)-[pw:PERFORMED_WITH_VERSION]->(av)                       // AS-OF(pw), $asOf = now
RETURN av.name, av.notReported, out.name AS score, inp.name AS input, m.name AS signalledMetric,
       coalesce(res.conclusionCode, 'SAME_METRIC') AS inputMatch, sig.assessmentSubkind, sig.summary,
       collect(DISTINCT t.name) AS testsThatReportIt
```

- expected (fixtures `consumer-panel-and-blood-clock` + `hba1c-two-labs-interference`): InnerAge 2.0 REQUIRES_INPUT_METRIC "InnerAge input: Hemoglobin A1c" (g16) → RESOLUTION s08 CANDIDATE → Metric LOINC 4548-4 ← SAFETY_SIGNAL `D4.interference-risk` (hba1c s02: elevated HbF > 10 % → falsely low HbA1c on Labcorp's immunoassay; NGSP: immunoassays generally) → score InnerAge (years), test "InsideTracker InnerAge 2.0". Answer: the score inherits an interference risk for people with elevated HbF; its direction and size on InnerAge are not published (input weights not reported) and the lab and method InsideTracker uses are not reported → "risk inherited, size unknown", inputMatch CANDIDATE (name-level).
- trace: TRACE-EDGE does not apply (structural edge); the REQUIRES_INPUT_METRIC row's locator (the vendor's input list), the RESOLUTION assessment's HAS_EVIDENCE, the SAFETY_SIGNAL's HAS_EVIDENCE (Labcorp "Specimens containing high amounts of HbF (>10 %) may result in lower than expected HbA1c values.").
- bitemporal episode needed on: PERFORMED_WITH_VERSION (the `testsThatReportIt` column only).
