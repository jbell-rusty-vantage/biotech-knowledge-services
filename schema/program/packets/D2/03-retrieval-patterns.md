# D2 — retrieval patterns

Model stage (Wave 2), A3, 2026-10-08. One section per question in `02-questions.md`. Rebased on the kernel pattern published by A1 (`packets/K/09-reasoning.md`): mechanism findings are kernel `Assertion`s whose subject/object are reached through `HAS_SUBJECT` / `HAS_OBJECT`, located through `HAS_EVIDENCE` → `SourceLocator`, judged by `Adjudication` (`ASSESSES` → Assertion). Names from other modules are taken from their SDLs and were re-verified in the adversarial review (2026-10-08) against D1 (A2), D3 (A4), D4 (A3), D5 (A5), D6 (A6), D9 (A8), D10 (A1) and D13 (A7): D3 `Study.studyKind`, `HAS_ARM`, `HAS_OUTCOME`, `HAS_COMPONENT`, `InterventionComponent`, `ADMINISTERS`, `MEASURES`, `RESULT_FOR`, `RESULT_FOR_ARM`; D6 `HAS_VARIANT`, `HAS_PACKAGE`, `HAS_LABEL_VERSION` (Package → LabelVersion), `DECLARES_COMPONENT` (ComponentLineProperties amount/unitCode); D1 `REALIZES_SUBSTANCE`; D4 `Biomarker`, `REFLECTS_MECHANISM` (recorded only), `HAS_ANALYTE`, `Metric.systemOntologyId`, `QUANTIFIES`, `MEASURES_METRIC`, `LabTest`, `PERFORMED_WITH_VERSION`; D5 `Target.label`; D9 `Chunk`, `CHUNK_OF`, `COVERS_LOCATOR`; D10 `Association`, `ASSOCIATES`; D13 `Frontier.name`, `ON_FRONTIER` (recorded only), `Event.eventKind` (`READOUT`, `PROGRAM_DISCONTINUATION`), `INVOLVES`.

Adversarial review (2026-10-08): `INFLUENCES_OUTCOME` is no longer a relationship (Q-D2-14 and Q-D2-26 read mechanism → outcome Assertions, plus D10 Association records); `AFFECTS_MECHANISM` targets Mechanisms only (molecular-target objects roll up through `PARTICIPATES_IN`); `PART_OF_MECHANISM` and `PARTICIPATES_IN` are asserted, recorded-only edges, so "current" is `recordedTo IS NULL` and the trace of a reference edge is its `assertionUid`.

## Shared fragments (every pattern below uses them)

**D2 predicate set** (registered `Assertion.predicate` values; closed list, see `05-relationship-register.yaml` `predicateOnly`):

- `$mechPredicates` (subject = D1 ChemicalSubstance or IngredientMaterial, or D5 Intervention; object = Mechanism, MolecularEntity, or a D1 metabolite that `PARTICIPATES_IN` a Mechanism): `INCREASES_ACTIVITY_OF`, `DECREASES_ACTIVITY_OF`, `INCREASES_LEVEL_OF`, `DECREASES_LEVEL_OF`, `NO_CHANGE_IN`, `MIXED_EFFECT_ON`, `ATTENUATES_INDUCTION_OF` (context has a `BACKGROUND` exposure that induces the response), `INHIBITS`, `ACTIVATES`, `BINDS`.
- `$outcomePredicates` (subject = Mechanism, or a MolecularEntity / D1 metabolite that `PARTICIPATES_IN` it; object = Outcome or Condition): `MECHANISM_OF`, `INCREASES_RISK_OF`, `DECREASES_RISK_OF`, `INCREASES_LEVEL_OF`, `DECREASES_LEVEL_OF`, `NO_CHANGE_IN`, `MIXED_EFFECT_ON`. Read at query time (Q-D2-14, Q-D2-26); there is no mechanism → outcome edge.
- Null rule: a **measured null** is `NO_CHANGE_IN` with `polarity: POSITIVE` and `basisKind: DIRECT_MEASUREMENT` (the source affirms that nothing changed); `polarity: NEGATIVE` is reserved for a source that denies an effect without its own measurement. "Not reported" is never asserted.
- Basis: kernel `Assertion.basisKind` (`DIRECT_MEASUREMENT` measured, `INFERRED_FROM_MEASUREMENT` inferred incl. orthology with `derivationRule: orthology/<authority>`, `CITED_FROM_PRIOR_WORK` cited, `MANUFACTURER_CLAIM`, `EXPERT_OPINION`, `HYPOTHESIS` hypothesized, `CALCULATED`).

**ASOF** (recorded-time as-of; valid time is null for almost every mechanism fact, so only recorded time applies):

```cypher
WHERE a.recordedAt <= $asOf AND (a.recordedTo IS NULL OR a.recordedTo > $asOf)
  AND a.status IN ['ACCEPTED', 'DISPUTED']          // REJECTED / UNRESOLVED / PROPOSED excluded unless the question asks
```

**TRACE** (how every answer cites located bytes; the same path the verifier re-selects):

```cypher
MATCH (a)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(a)
  WHERE NOT EXISTS { MATCH (:Adjudication {supersedesUid: adj.uid}) }   // current judgment only
RETURN ..., who.name, ev.role, loc.selectorKind, loc.exact, loc.startOffset, loc.endOffset,
       snap.contentHash, snap.retrievedAt, src.canonicalUri, adj.verdict
```

**CTX** (the evidence context of an observation):

```cypher
OPTIONAL MATCH (a)-[:OBSERVED_IN_CONTEXT]->(ctx:MechanismEvidenceContext)
OPTIONAL MATCH (ctx)-[x:EXPOSED_TO]->(exp)            // x.exposureRole TESTED | BACKGROUND | COMPARATOR
```

**DOSE** (adversarial review: a registered group's dose of record is D3's InterventionComponent; context exposure fields are filled only for unregistered contexts):

```cypher
CALL (ctx) {
  OPTIONAL MATCH (ctx)-[:EXPOSED_TO {exposureRole: 'TESTED'}]->(exp)
  OPTIONAL MATCH (ctx)-[:IN_STUDY_ARM]->(:StudyArm)-[:HAS_COMPONENT]->(ic:InterventionComponent)-[:ADMINISTERS]->(mat)   // D3
    WHERE mat = exp OR (mat)-[:REALIZES_SUBSTANCE]->(exp)                                                                 // D1 roll-up
  WITH ctx, exp, ic LIMIT 1           // one TESTED exposure; a combination returns one row per component (drop LIMIT, group by exp)
  RETURN exp, coalesce(ctx.exposureAmount, ic.quantity) AS amount, coalesce(ctx.exposureUnitCode, ic.unitCode) AS unit,
         coalesce(ctx.exposureBasis, ic.quantityBasis) AS basis, coalesce(ctx.route, ic.route) AS route,
         coalesce(ctx.exposureDurationIso, ic.durationIso) AS duration
}
```

**Bitemporal:** no D2 edge carries an episode (09-reasoning "Bitemporal decision per edge"). Time-sensitivity of mechanism knowledge lives on the kernel Assertion (recorded time, supersession) and on the recorded-time episodes of the asserted reference edges (`recordedTo IS NULL` = current; `referenceRelease` names the release). Every section below therefore says "none" unless it names a kernel or other-module edge.

---

## CQ-MX-01

- kind: cypher
- pattern: per-step basis table for a compound's mechanism story. Steps are the objects of the compound's mechanism Assertions (Mechanism, MolecularEntity, or D1 metabolite resolved to its Mechanism through `PARTICIPATES_IN`).

```cypher
MATCH (c {uid: $compoundUid})<-[:HAS_SUBJECT]-(a:Assertion)-[:HAS_OBJECT]->(step)
WHERE a.predicate IN $mechPredicates   // + ASOF
OPTIONAL MATCH (step)-[p:PARTICIPATES_IN]->(m:Mechanism) WHERE p.recordedTo IS NULL
OPTIONAL MATCH (a)-[:OBSERVED_IN_CONTEXT]->(ctx:MechanismEvidenceContext)
WITH a, step, collect(DISTINCT m.name) AS mechanisms, ctx
// TRACE
RETURN coalesce(step.name) AS step, mechanisms, a.predicate, a.polarity, a.basisKind, a.speechAct,
       ctx.organism, ctx.compartmentLabel, ctx.setting, who.name, loc.exact, snap.contentHash, adj.verdict
ORDER BY CASE a.basisKind WHEN 'DIRECT_MEASUREMENT' THEN 0 WHEN 'INFERRED_FROM_MEASUREMENT' THEN 1 WHEN 'CITED_FROM_PRIOR_WORK' THEN 2 ELSE 3 END
```

- trace: TRACE per row (one locator per Assertion; product-page claims trace to the page snapshot, measurements to the paper's Results span).
- bitemporal episode needed on: none.

## CQ-MX-02

- kind: cypher
- pattern: all context fields of every measured step.

```cypher
MATCH (c {uid: $compoundUid})<-[:HAS_SUBJECT]-(a:Assertion)-[:OBSERVED_IN_CONTEXT]->(ctx:MechanismEvidenceContext)
WHERE a.predicate IN $mechPredicates AND a.basisKind = 'DIRECT_MEASUREMENT'   // + ASOF
MATCH (a)-[:HAS_OBJECT]->(step)
// DOSE (shared fragment): TESTED exposure + coalesced dose of record (context fields, or D3 InterventionComponent)
OPTIONAL MATCH (ctx)-[x:EXPOSED_TO]->(anyExp)
OPTIONAL MATCH (ctx)-[:IN_STUDY_ARM]->(arm:StudyArm)                          // D3
RETURN step.name, a.predicate, ctx.setting, ctx.organism, ctx.ncbiTaxonId, ctx.strainOrLine, ctx.sexScope, ctx.sampleSize,
       ctx.compartmentKind, ctx.compartmentOntologyId, ctx.compartmentLabel,
       collect(DISTINCT {material: anyExp.name, role: x.exposureRole}) AS exposures,
       amount, unit, basis, route, duration, ctx.assayText, collect(DISTINCT arm.uid) AS arms
```

- trace: TRACE on `a`; the context itself is a structural part of the Assertion's record and cites the same snapshot (its Methods span is a second `HAS_EVIDENCE {role: CONTEXT}` locator). A registered group's dose traces through D3's InterventionComponent STATED_IN Assertion. `sampleSize` is the n of the analysis the Assertion reports (Konopka 2019 respiration: 26 metformin, 24 placebo), not the randomized n.
- bitemporal episode needed on: none.

## CQ-MX-03

- kind: cypher
- pattern: transfer check — same Mechanism, contexts grouped by organism, including nulls.

```cypher
MATCH (c {uid: $compoundUid})<-[:HAS_SUBJECT]-(a:Assertion)-[:HAS_OBJECT]->(step)
WHERE a.predicate IN $mechPredicates AND a.basisKind = 'DIRECT_MEASUREMENT'   // + ASOF
MATCH (a)-[:OBSERVED_IN_CONTEXT]->(ctx)
OPTIONAL MATCH (step)-[:PARTICIPATES_IN]->(pm:Mechanism)
WITH coalesce(pm, step) AS m, ctx.organism AS organism, a, ctx
WHERE m.uid = $mechanismUid OR $mechanismUid IS NULL
RETURN m.name, organism,
       collect({predicate: a.predicate, compartment: ctx.compartmentLabel, setting: ctx.setting, assertion: a.uid}) AS findings,
       any(f IN collect(a.predicate) WHERE f = 'NO_CHANGE_IN') AS hasMeasuredNull
ORDER BY m.name, organism
```

- trace: TRACE per finding. Expected (FC-1, FC-4): NR → NAD+ metabolism: HUMAN muscle NAAD up, NAD+ `NO_CHANGE_IN`; sirtuin deacylation (pan-acetylation proxy) `NO_CHANGE_IN` in human muscle; MOUSE lifespan: ITP UM-HET3, both sexes, not significant (D3 result, joined through Outcome); DrugAge also lists a non-ITP C57BL/6JRj row, +5 % average lifespan, marked significant, so the mouse lifespan picture is mixed by setting, with the ITP null as the strongest test.
- bitemporal episode needed on: none.

## CQ-MX-04

- kind: cypher (inputs) + assessment (kernel `Assessment` kind APPLICABILITY, D10 method)
- pattern: gather the study context exposure and the product's delivered amount, then read or create the applicability assessment.

```cypher
MATCH (p:Product {uid: $productUid})-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)
      -[hl:HAS_LABEL_VERSION]->(lv:LabelVersion)-[line:DECLARES_COMPONENT]->(mat:IngredientMaterial)       // D6 → D1
WHERE hl.recordedTo IS NULL                                                                                 // current label episode (StateEpisodeProperties)
MATCH (ctx:MechanismEvidenceContext)-[x:EXPOSED_TO {exposureRole: 'TESTED'}]->(e)
WHERE e = mat OR (mat)-[:REALIZES_SUBSTANCE]->(e)                                                           // D1 roll-up
MATCH (a:Assertion)-[:OBSERVED_IN_CONTEXT]->(ctx)
// DOSE (shared fragment) for ctx
OPTIONAL MATCH (asm:Assessment {assessmentKind: 'APPLICABILITY'})-[:ASSESSES]->(p)
  WHERE (asm)-[:DERIVED_FROM]->(a)
RETURN amount, unit, basis, route, duration, ctx.organism,
       line.amount AS labelAmount, line.unitCode AS labelUnit, line.amountBasis, asm.conclusionCode, asm.effectDirection, asm.methodVersion
```

- trace: assessment → `DERIVED_FROM` the context Assertions and the label Assertion → TRACE on each. Exposure ratios are CALCULATED Assertions (never inferred across `exposureBasis` values).
- bitemporal episode needed on: none in D2 (D6 `HAS_LABEL_VERSION` carries its own `StateEpisodeProperties` episode; filter it as of `$asOf`).

## CQ-MX-05

- kind: cypher over a derived projection (materialized)
- pattern: projection edges whose best basis is not a measurement.

```cypher
MATCH (c)-[r:AFFECTS_MECHANISM]->(m)
WHERE r.derivationRule = 'd2.affects-mechanism/v1'
  AND r.bestBasis IN ['CITED_FROM_PRIOR_WORK', 'HYPOTHESIS', 'MANUFACTURER_CLAIM', 'EXPERT_OPINION', 'PERSONAL_EXPERIENCE', 'UNSTATED']
RETURN c.name, m.name, r.bestBasis, r.direction, r.nContexts, r.derivedAt, r.derivedFromAssertionUids
```

Retracted sources (kernel convention, pattern item 12: `SourceSnapshot.revisionKind` cache, or a `HAS_REVISION_STATUS` Assertion per authority whose `valueString` is a `SourceRevisionKind`): add `OR ANY(u IN r.derivedFromAssertionUids WHERE EXISTS { MATCH (x:Assertion {uid: u})-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(s:Source) WHERE EXISTS { MATCH (s)-[:HAS_SNAPSHOT]->(later:SourceSnapshot) WHERE later.revisionKind IN ['RETRACTION', 'WITHDRAWAL', 'EXPRESSION_OF_CONCERN'] } OR EXISTS { MATCH (s)<-[:HAS_SUBJECT]-(rs:Assertion {predicate: 'HAS_REVISION_STATUS'}) WHERE rs.valueString IN ['RETRACTION', 'WITHDRAWAL'] AND rs.recordedTo IS NULL } })`.

- trace: `derivedFromAssertionUids` → each Assertion → TRACE. Method spec: 09-reasoning "Derived projection method spec".
- bitemporal episode needed on: none (derived, recorded only; refreshed nightly and on every admitted mechanism Assertion).

## CQ-MX-06

- kind: cypher
- pattern: contexts of one compound × mechanism ordered by exposure, sign changes flagged; only comparable bases are ordered together.

```cypher
MATCH (c {uid: $compoundUid})<-[:HAS_SUBJECT]-(a:Assertion)-[:HAS_OBJECT]->(step)
WHERE a.predicate IN ['INCREASES_ACTIVITY_OF','DECREASES_ACTIVITY_OF','INCREASES_LEVEL_OF','DECREASES_LEVEL_OF','NO_CHANGE_IN']
MATCH (a)-[:OBSERVED_IN_CONTEXT]->(ctx)
// DOSE (shared fragment) for ctx
WITH step, basis, unit, ctx.organism AS org, a, amount ORDER BY amount
WITH step, basis, unit, org, collect({amount: amount, predicate: a.predicate, uid: a.uid}) AS series
RETURN step.name, org, basis, unit, series,
       size([i IN range(1, size(series)-1) WHERE series[i].predicate <> series[i-1].predicate]) > 0 AS directionChanges
```

- trace: TRACE per series element. Gene-dose cases (GenAge cardiac SIRT1 low vs high overexpression) use `geneticManipulation` contexts with the MolecularEntity as subject.
- bitemporal episode needed on: none.

## Q-D2-01

- kind: cypher (GraphQL-expressible)
- pattern: mechanisms a compound is claimed to act through, grouped by claimant kind, with the strongest basis per mechanism.

```cypher
MATCH (c {uid: $compoundUid})<-[:HAS_SUBJECT]-(a:Assertion)-[:HAS_OBJECT]->(o)
WHERE a.predicate IN $mechPredicates   // + ASOF (status filter relaxed to include PROPOSED claims if asked)
OPTIONAL MATCH (o)-[:PARTICIPATES_IN]->(pm:Mechanism)
WITH coalesce(pm, o) AS m, a
MATCH (a)-[:ASSERTED_BY]->(who)
RETURN m.name, labels(who)[0] AS claimantKind, who.name, a.assertionKind, a.speechAct,
       min(CASE a.basisKind WHEN 'DIRECT_MEASUREMENT' THEN 0 WHEN 'INFERRED_FROM_MEASUREMENT' THEN 1 WHEN 'CITED_FROM_PRIOR_WORK' THEN 2 WHEN 'MANUFACTURER_CLAIM' THEN 3 ELSE 4 END) AS bestBasisRank,
       collect(a.uid) AS assertions
```

Fast path (no per-claimant split): `(c)-[r:AFFECTS_MECHANISM]->(m)` with `r.bestBasis`. Claimant kind comes from the asserter's label (D7 Organization/Person, kernel Agent, kernel Source for KB records) and the source's genre (D9).

- trace: TRACE on the best Assertion per (mechanism, claimant).
- bitemporal episode needed on: none.

## Q-D2-02

- kind: cypher over derived projection (+ reference hierarchy)
- pattern: modulators of a pathway or hallmark including its sub-mechanisms (reference hierarchy, current release only).

```cypher
MATCH (top:Mechanism {uid: $mechanismUid})
MATCH (m:Mechanism)-[p:PART_OF_MECHANISM*0..4]->(top)
WHERE all(e IN p WHERE e.recordedTo IS NULL)                                     // current reference episodes only
MATCH (mod)-[r:AFFECTS_MECHANISM]->(m)          // ChemicalSubstance or Intervention
WHERE r.derivationRule = 'd2.affects-mechanism/v1'
RETURN mod.name, labels(mod)[0] AS modulatorKind, m.name, r.direction, r.highestSetting, r.humanMeasured, r.nContexts, r.bestBasis
ORDER BY r.humanMeasured DESC, r.nContexts DESC
```

Molecular-target cases (sirolimus INHIBITS FKBP1A, a participant of MTOR signalling) need no variant: the projection already rolls a molecular-target object up to its Mechanisms (`r.viaParticipant = true`); the ChemicalSubstance → MolecularEntity pair was cut in the adversarial review.

- trace: `r.derivedFromAssertionUids` → TRACE.
- bitemporal episode needed on: none.

## Q-D2-03

- kind: cypher (spans D1 → D2 → D4; the packet's cross-domain path)
- pattern: compound → mechanism (derived) → biomarker (D4-owned `REFLECTS_MECHANISM`) → metric → test, with the compartment check and the trace of hop 1. Three entry shapes for hop 2, because a biomarker can reflect a mechanism, be the analyte of a molecular entity, or be the level of a D1 metabolite that participates in the mechanism.

```cypher
// hop 1: compound -> mechanism (projection; keep human-measured or all, per $humanOnly)
MATCH (c:ChemicalSubstance {uid: $compoundUid})-[am:AFFECTS_MECHANISM]->(m:Mechanism)
WHERE am.derivationRule = 'd2.affects-mechanism/v1' AND (NOT $humanOnly OR am.humanMeasured)
// hop 2: mechanism -> biomarker (D4 declares both edges on Biomarker)
CALL (m) {
  MATCH (b:Biomarker)-[:REFLECTS_MECHANISM]->(m) RETURN b, 'reflects' AS via
  UNION
  MATCH (b:Biomarker)-[:HAS_ANALYTE]->(x)-[:PARTICIPATES_IN]->(m) RETURN b, 'analyte-participant' AS via
}
// hop 3: biomarker -> metric -> test (D4 names)
OPTIONAL MATCH (b)<-[:QUANTIFIES]-(met:Metric)<-[:MEASURES_METRIC]-(t:LabTest)
// trace hop 1 and compare compartments
UNWIND am.derivedFromAssertionUids AS au
MATCH (a:Assertion {uid: au})-[:OBSERVED_IN_CONTEXT]->(ctx:MechanismEvidenceContext)
// TRACE on a
RETURN c.name, m.name, am.direction, am.bestBasis, b.name, via, met.name, met.systemOntologyId, t.name,
       ctx.organism, ctx.compartmentLabel,
       CASE WHEN met.systemOntologyId = ctx.compartmentOntologyId THEN 'SAME_COMPARTMENT' ELSE 'DIFFERENT_COMPARTMENT' END AS compartmentMatch,
       loc.exact, snap.contentHash
```

Expected (fixtures): NR → NAD+ metabolism (Reactome R-HSA-196807) → muscle NAAD / blood NAD+ (D4 biomarkers; analyte = D1 NAAD / NAD+, participants of R-HSA-196807) → LC-MS/MS metabolomics (research) or the consumer intracellular NAD test (FC-8, whole blood — `DIFFERENT_COMPARTMENT` from the muscle finding); dasatinib + quercetin → cellular senescence (GO:0090398) → p16INK4A+ cells, SA-β-gal, plasma IL-6 → IHC on adipose biopsy, multiplex plasma assay (FC-7).

- trace: hop 1 by TRACE on the projection's input Assertions; hops 2–3 by the D4 edges' own assertions (D4 TRACE). GraphQL equivalent: `mechanisms(where: {affectedByConnection ...})` then `biomarkers(where: {reflectsMechanisms: {some: {uid: {in: $mUids}}}})` (D4 field `Biomarker.reflectsMechanisms`, checked against the D4 SDL in the check stage).
- bitemporal episode needed on: none in D2. On the D4 side (D4 SDL, re-checked 2026-10-08) `REFLECTS_MECHANISM` is asserted and recorded-only (`AssertedRecordedProperties`: filter `rm.recordedTo IS NULL`, no valid-time as-of), while `MEASURES_METRIC` / `PERFORMED_WITH_VERSION` (LabTest → Metric / AssayVersion) carry `AssertedEdgeProperties` episodes for "what did this test measure, with which assay, at T"; filter those two with the as-of predicate when `$asOf` is given.

- **Joint D2 ∪ D4 pattern (check stage, 2026-10-08).** Q-D2-03 and D4's Q-D4-01 are one path; this is the merged form the synthesizer should keep (one pattern, both question ids). It takes D2's hop 2 (both branches; `HAS_ANALYTE` targets D1 ChemicalSubstance or D2 MolecularEntity, and both are `PARTICIPATES_IN` sources, so the one branch covers metabolite and protein analytes without D4's `is_precursor_of` predicate) and D4's hops 3–4 (the D3 study metric and the as-of orderable test with its assay). It compiles: kernel + D2 + D4 (+ stubs) builds with print-schema (09-reasoning, compile table, last row).

```cypher
// Q-D2-03 = Q-D4-01. Params: $modulatorUid (D1 substance or D5 regimen), $humanOnly, $asOf (null = now), $studyMetricUids (from D3 outcome_measured_with)
MATCH (c {uid: $modulatorUid})-[am:AFFECTS_MECHANISM]->(m:Mechanism)                                // D2 derived, hop 1
WHERE (c:ChemicalSubstance OR c:Intervention)                                                       // union MechanismModulator
  AND am.derivationRule = 'd2.affects-mechanism/v1' AND (NOT $humanOnly OR am.humanMeasured)
CALL (m) {                                                                                          // hop 2: D4 edges into D2
  MATCH (b:Biomarker)-[rm:REFLECTS_MECHANISM]->(m) WHERE rm.recordedTo IS NULL RETURN b, 'reflects' AS via, rm.assertionUid AS hop2Assertion
  UNION
  MATCH (b:Biomarker)-[:HAS_ANALYTE]->(x)-[:PARTICIPATES_IN]->(m) RETURN b, 'analyte-participant' AS via, null AS hop2Assertion
}
OPTIONAL MATCH (sm:Metric)-[:QUANTIFIES]->(b) WHERE sm.uid IN $studyMetricUids                   // hop 3: what the study measured (D3 seam)
OPTIONAL MATCH (b)<-[:QUANTIFIES]-(tm:Metric)<-[mm:MEASURES_METRIC]-(t:LabTest)                    // hop 4: orderable test, AS-OF(mm); optional so 'no test' shows
OPTIONAL MATCH (t)-[pw:PERFORMED_WITH_VERSION]->(av:AssayVersion)                                   // AS-OF(pw)
UNWIND am.derivedFromAssertionUids AS au
MATCH (a:Assertion {uid: au})-[:OBSERVED_IN_CONTEXT]->(ctx:MechanismEvidenceContext)                  // D2 context of hop 1
// TRACE on a (hop 1), TRACE-EDGE on rm (hop 2), mm and pw (hop 4)
RETURN c.name, m.name, am.direction, am.bestBasis, am.humanMeasured, b.name, via, hop2Assertion,
       ctx.organism, ctx.compartmentOntologyId AS findingCompartment,
       sm.systemOntologyId AS studyCompartment, tm.name AS testMetric, tm.systemOntologyId AS testCompartment,
       t.name, av.methodPrinciple,
       CASE WHEN t IS NULL THEN 'NO_ORDERABLE_TEST'
            WHEN tm.systemOntologyId = ctx.compartmentOntologyId THEN 'SAME_COMPARTMENT_AS_FINDING'
            WHEN sm IS NOT NULL AND sm = tm THEN 'SAME_METRIC_AS_STUDY'
            ELSE 'DIFFERENT_COMPARTMENT' END AS compartmentMatch
```

  Fixture walk (D2 `dq-senescence-biomarker-path`): D+Q regimen (D5 Intervention, the `MechanismModulator` member the fixture uses for a combination, 11 item 24) → cellular senescence GO:0090398 (DECREASES, human-measured) → p16INK4A, SA-β-gal, IL-6 Biomarkers (`REFLECTS_MECHANISM`; IL-6 also `HAS_ANALYTE` → MolecularEntity IL6) → research-only assays; no orderable LabTest, so p16 returns `NO_ORDERABLE_TEST` (11 item 23). D4 fixture `nr-nad-compound-to-test` shows a non-empty hop 4 (`NOT_COMPARABLE_COMPARTMENT`).

## Q-D2-04

- kind: cypher
- pattern: proxy check — for biomarker B, the downstream mechanism steps measured in the same human contexts where B moved, with polarity; steps never measured are listed as "not shown".

```cypher
MATCH (b:Biomarker {uid: $biomarkerUid})-[:HAS_ANALYTE|REFLECTS_MECHANISM]->(x)        // D4 edges
MATCH (aB:Assertion)-[:HAS_OBJECT]->(x) WHERE aB.predicate IN ['INCREASES_LEVEL_OF','INCREASES_ACTIVITY_OF']
MATCH (aB)-[:OBSERVED_IN_CONTEXT]->(ctxB:MechanismEvidenceContext {organism: 'HUMAN'})
MATCH (ctxB)-[:EXPOSED_TO {exposureRole: 'TESTED'}]->(e)
// same study arm or same exposure group, any compartment
MATCH (ctxS:MechanismEvidenceContext)-[:EXPOSED_TO {exposureRole: 'TESTED'}]->(e)
WHERE ctxS.organism = 'HUMAN' AND (EXISTS { (ctxS)-[:IN_STUDY_ARM]->(:StudyArm)<-[:IN_STUDY_ARM]-(ctxB) } OR ctxS = ctxB)
MATCH (aS:Assertion)-[:OBSERVED_IN_CONTEXT]->(ctxS) WHERE aS <> aB
MATCH (aS)-[:HAS_OBJECT]->(step)
RETURN step.name, aS.predicate, ctxS.compartmentLabel, ctxB.compartmentLabel AS biomarkerCompartment, aS.uid
// "not shown": mechanisms the vendor/claim names (claim occurrences about b or e) with no row above
```

Expected (FC-1): muscle NAAD up; NAD+ `NO_CHANGE_IN`; pan-acetylation `NO_CHANGE_IN`; complex I/II respiration `NO_CHANGE_IN`; serum IL-6 down.

- trace: TRACE on every `aS` and on `aB`.
- bitemporal episode needed on: none.

## Q-D2-05

- kind: cypher
- pattern: conflict pairs on one (compound, step): opposite predicates or POSITIVE vs NEGATIVE polarity; the measuring side flagged.

```cypher
MATCH (c {uid: $compoundUid})<-[:HAS_SUBJECT]-(a1:Assertion)-[:HAS_OBJECT]->(step)<-[:HAS_OBJECT]-(a2:Assertion)-[:HAS_SUBJECT]->(c)
WHERE a1.uid < a2.uid AND a1.predicate IN $mechPredicates AND a2.predicate IN $mechPredicates
  AND ( (a1.predicate STARTS WITH 'INCREASES' AND a2.predicate IN ['DECREASES_ACTIVITY_OF','DECREASES_LEVEL_OF','NO_CHANGE_IN'])
     OR (a2.predicate STARTS WITH 'INCREASES' AND a1.predicate IN ['DECREASES_ACTIVITY_OF','DECREASES_LEVEL_OF','NO_CHANGE_IN'])
     OR (a1.predicate = a2.predicate AND a1.polarity <> a2.polarity) )
OPTIONAL MATCH (a1)-[:OBSERVED_IN_CONTEXT]->(c1) OPTIONAL MATCH (a2)-[:OBSERVED_IN_CONTEXT]->(c2)
RETURN step.name, a1.predicate, a1.basisKind, c1.setting, a2.predicate, a2.basisKind, c2.setting,
       a1.basisKind = 'DIRECT_MEASUREMENT' AS a1Measured, a2.basisKind = 'DIRECT_MEASUREMENT' AS a2Measured
```

Expected (FC-2 + FC-10/FC-9): KEGG `INCREASES_ACTIVITY_OF` SIRT1 by resveratrol (CITED_FROM_PRIOR_WORK) vs Pacholec `NO_CHANGE_IN` SIRT1 activity with native substrates (DIRECT_MEASUREMENT, IN_VITRO_CELL_FREE). A kernel `Assessment` of kind CONFLICT_RELEVANCE may record the adjudicated conflict.

- trace: TRACE on both sides.
- bitemporal episode needed on: none.

## Q-D2-06

- kind: cypher over derived projection, joined with D3 (materialized per mechanism)
- pattern: per mechanism, counts of contexts by setting and whether any human context exists; D3 join for registered human studies.

```cypher
MATCH (m:Mechanism) WHERE m.mechanismKind IN ['HALLMARK','PROCESS','PATHWAY']
OPTIONAL MATCH (mod)-[r:AFFECTS_MECHANISM]->(m)
WITH m, sum(r.nHumanContexts) AS humanContexts, sum(r.nContexts) AS allContexts, collect(DISTINCT r.highestSetting) AS settings
OPTIONAL MATCH (m)<-[:AFFECTS_MECHANISM]-(mod2)
OPTIONAL MATCH (ctx:MechanismEvidenceContext)-[:IN_STUDY_ARM]->(arm:StudyArm)<-[:HAS_ARM]-(s:Study)      // D3
WHERE (ctx)-[:EXPOSED_TO]->(mod2)
RETURN m.name, humanContexts > 0 AS hasHumanEvidence, humanContexts, allContexts, settings, count(DISTINCT s) AS registeredStudies
```

- trace: per mechanism, the projection inputs (`derivedFromAssertionUids`) → TRACE; studies through D3's registry snapshots.
- bitemporal episode needed on: none (D3 registration versions carry episodes on their side).

## Q-D2-07

- kind: cypher (spans D2 projections and D3 results)
- pattern: compounds with lifespan nulls in robust designs beside their mechanism projections.

```cypher
MATCH (o:Outcome {key: 'bellabs:outcome:lifespan'})<-[:MEASURES]-(od:OutcomeDefinition)<-[:HAS_OUTCOME]-(s:Study)     // D3
MATCH (res:StudyResult)-[:RESULT_FOR]->(od)                                                                         // D3
WHERE res.statisticalConclusion = 'NOT_SIGNIFICANT' AND s.studyKind IN $robustKinds   // e.g. ['INTERVENTIONAL_RANDOMIZED', 'PRECLINICAL_IN_VIVO'] + ITP flag
MATCH (res)-[:RESULT_FOR_ARM]->(:StudyArm)-[:HAS_COMPONENT]->(:InterventionComponent {componentRole: 'ACTIVE'})-[:ADMINISTERS]->(mat)
OPTIONAL MATCH (mat)-[:REALIZES_SUBSTANCE]->(sub)
WITH coalesce(sub, mat) AS compound, s, res
OPTIONAL MATCH (compound)-[am:AFFECTS_MECHANISM]->(m:Mechanism)
RETURN compound.name, s.name, res.uid, collect({mechanism: m.name, direction: am.direction, basis: am.bestBasis}) AS mechanismStory
```

Expected (FC-4): nicotinamide riboside, UM-HET3, both sexes, lifespan change 0 / −3 % NS (ITP; DrugAge Build 5 rows), beside NR → Nicotinate metabolism (MIXED under v1, human measured; 11 item 21). DrugAge's non-ITP C57BL/6JRj row (+5 %, significant) is not a null and does not match this question; CQ-MX-03 shows it.

- trace: D3 result → its Assertion → TRACE; mechanism side as CQ-MX-05.
- bitemporal episode needed on: none.

## Q-D2-08

- kind: cypher
- pattern: curated authority mechanism-of-action (ChEMBL/Open Targets asserted INHIBITS/ACTIVATES/BINDS on a MolecularEntity) beside marketing claim occurrences.

```cypher
MATCH (c {uid: $compoundUid})<-[:HAS_SUBJECT]-(a:Assertion)-[:HAS_OBJECT]->(t:MolecularEntity)
WHERE a.predicate IN ['INHIBITS','ACTIVATES','BINDS'] AND a.basisKind <> 'MANUFACTURER_CLAIM'
OPTIONAL MATCH (t)-[p:PARTICIPATES_IN]->(m:Mechanism)
WITH c, collect({target: t.geneSymbol, action: a.predicate, pathways: m.name, asserter: a.uid}) AS curated
OPTIONAL MATCH (c)<-[:HAS_SUBJECT]-(cl:Assertion {assertionKind: 'CLAIM'})-[:HAS_OBJECT]->(mm)
WHERE cl.basisKind = 'MANUFACTURER_CLAIM'
RETURN curated, collect({marketed: mm.name, claim: cl.uid}) AS marketed
```

Expected (FC-5): ChEMBL sirolimus `INHIBITS` FKBP1A ("FK506-binding protein 1A inhibitor"); FKBP1A and MTOR participate in "MTOR signalling" (Reactome R-HSA-165159); marketing says "mTOR inhibition".

- trace: TRACE on curated and claim Assertions (ChEMBL JSON locator `JSON_POINTER` selector).
- bitemporal episode needed on: none.

## Q-D2-09

- kind: cypher
- pattern: interaction-by-mechanism — contexts with a BACKGROUND exposure (the adaptation inducer) where the tested agent attenuates or decreases the induced step.

```cypher
MATCH (ctx:MechanismEvidenceContext)-[:EXPOSED_TO {exposureRole: 'BACKGROUND'}]->(bg)
MATCH (ctx)-[:EXPOSED_TO {exposureRole: 'TESTED'}]->(agent)
MATCH (a:Assertion)-[:OBSERVED_IN_CONTEXT]->(ctx)
WHERE a.predicate IN ['ATTENUATES_INDUCTION_OF','DECREASES_ACTIVITY_OF','DECREASES_LEVEL_OF']   // + ASOF
MATCH (a)-[:HAS_OBJECT]->(step)
RETURN agent.name, bg.name AS counteractedAdaptationInducer, step.name, ctx.organism, ctx.ageDescriptor, ctx.sampleSize,
       ctx.compartmentLabel, a.predicate, a.uid
```

Expected (FC-3): metformin (TESTED, titrated to 2000 mg/day, dose of record from D3) with aerobic exercise training (BACKGROUND, D5 Intervention) → `ATTENUATES_INDUCTION_OF` skeletal muscle mitochondrial respiration, older adults; respiration analysis n 26 (metformin) vs 24 (placebo), randomized 27 vs 26. In the placebo context AET increased CI-linked respiration in the ADP-titration protocol and only trended up in SUIT1 (p = 0.07), so AET → mitochondrial respiration projects MIXED. The harm-relevant D5 record (interaction, safety assessment with `effectDirection: HARM` on target endurance) cites this Assertion through `DERIVED_FROM`.

- trace: TRACE on `a`; ChEMBL "Mitochondrial complex I (NADH dehydrogenase) inhibitor" as the mechanism-side curated Assertion.
- bitemporal episode needed on: none.

## Q-D2-10

- kind: cypher (spans D5 targets)
- pattern: mechanisms asserted to mediate a target (predicate `MEDIATES_TARGET`, subject Mechanism, object D5 Target — predicate-only), then modulators of those mechanisms whose projected direction is opposite to the mediation direction.

```cypher
MATCH (t:Target {key: $targetKey})<-[:HAS_OBJECT]-(med:Assertion {predicate: 'MEDIATES_TARGET'})-[:HAS_SUBJECT]->(m:Mechanism)
// med.polarity POSITIVE: higher mechanism activity supports the target
MATCH (mod)-[r:AFFECTS_MECHANISM]->(m)
WHERE r.direction = 'DECREASES'
RETURN t.label, m.name, mod.name, r.direction, r.bestBasis, r.humanMeasured, med.uid
```

Weighed harm conclusions (what to avoid for T) are kernel Assessments with `effectDirection: HARM` about the Target (D5/D10), citing these rows.

- trace: TRACE on `med` and on the projection inputs.
- bitemporal episode needed on: none.

## Q-D2-11

- kind: cypher (GraphQL-expressible)
- pattern: curated participants of mechanism M at the current release.

```cypher
MATCH (m:Mechanism {uid: $mechanismUid})
MATCH (x)-[p:PARTICIPATES_IN]->(m)                         // MolecularEntity or D1 metabolite
WHERE p.recordedTo IS NULL                                  // current episode (asserted, recorded only)
OPTIONAL MATCH (x)-[:HAS_IDENTIFIER]->(id:Identifier)          // kernel stores Subjectable → Identifier (Identifier.identifies is IN)
RETURN labels(x)[0] AS kind, x.name, x.geneSymbol, p.participantRole, p.referenceScheme, p.referenceRelease, p.assertionUid, collect(id.value) AS identifiers
```

GraphQL: `molecularEntities(where: {participatesIn: {some: {uid: {eq: $m}}}}) { geneSymbol participatesInConnection { edges { properties { participantRole referenceRelease } } } }`.

- trace: `p.assertionUid` → the authorizing Assertion (asserter Reactome / GO / UniProt) → TRACE (JSON_POINTER locator into the authority record at that release); `p.lastWriterRunId` → the ingestion Activity.
- bitemporal episode needed on: none (recorded-only episodes; a release that drops the edge closes it, nothing is deleted).

## Q-D2-12

- kind: cypher
- pattern: hallmark ancestry of a compound's mechanisms or of one mechanism.

```cypher
MATCH (m:Mechanism {uid: $mechanismUid})-[p:PART_OF_MECHANISM*1..4]->(h:Mechanism {mechanismKind: 'HALLMARK'})
WHERE all(e IN p WHERE e.recordedTo IS NULL)
RETURN h.name, [e IN p | e.referenceScheme] AS mappingSources, [e IN p | e.assertionUid] AS mappingAssertions
// compound variant: MATCH (c {uid:$c})-[r:AFFECTS_MECHANISM]->(m) ... then as above, with r.direction, r.bestBasis
```

- trace: each hallmark mapping edge's `assertionUid` → an Assertion asserted by the curation Agent (`referenceScheme: BELLLABS_CURATED`, basis EXPERT_OPINION) whose locator is the curation record (JSON_POINTER into the versioned mapping file, written by a curation Activity); the hallmark vocabulary traces to FC-12 (Lopez-Otin 2023 quote). Whether the mapping is also a published Report is 11 item 12.
- bitemporal episode needed on: none.

## Q-D2-13

- kind: cypher (GraphQL-expressible on MechanismEvidenceContext)
- pattern: organism × compartment matrix for one mechanism.

```cypher
MATCH (a:Assertion)-[:HAS_OBJECT]->(step)
WHERE step.uid = $mechanismUid OR EXISTS { (step)-[:PARTICIPATES_IN]->(:Mechanism {uid: $mechanismUid}) }
MATCH (a)-[:OBSERVED_IN_CONTEXT]->(ctx) WHERE a.basisKind = 'DIRECT_MEASUREMENT'
RETURN ctx.organism, ctx.compartmentKind, ctx.compartmentLabel, count(*) AS n, collect(a.uid)[0..5] AS examples
ORDER BY ctx.organism, ctx.compartmentKind
```

- trace: TRACE on each example.
- bitemporal episode needed on: none.

## Q-D2-14

- kind: cypher over Assertions (retrieved) + D10 Association records (materialized)
- pattern: outcomes and conditions linked to M, with the link kind. Adversarial review: the `INFLUENCES_OUTCOME` projection branch is gone; asserted links come from Assertions on M or on its participants, computed links from D10 `Association` records.

```cypher
MATCH (m:Mechanism {uid: $mechanismUid})
CALL (m) {
  MATCH (s)<-[:HAS_SUBJECT]-(a:Assertion)-[:HAS_OBJECT]->(x)
  WHERE (s = m OR EXISTS { (s)-[pp:PARTICIPATES_IN]->(m) WHERE pp.recordedTo IS NULL })
    AND (x:Outcome OR x:Condition) AND a.predicate IN $outcomePredicates   // + ASOF
  RETURN x, CASE WHEN a.basisKind = 'CALCULATED' THEN 'computed-by-authority' ELSE 'asserted' END AS linkKind, null AS method, a.predicate AS direction, a.uid AS assertion
  UNION
  MATCH (assoc:Association)-[:ASSOCIATES]->(m), (assoc)-[:ASSOCIATES]->(x)                                  // D10
  WHERE (x:Outcome OR x:Condition) AND assoc.recordedTo IS NULL
  RETURN x, 'computed-by-BellLabs' AS linkKind, assoc.methodVersion AS method, null AS direction, assoc.uid AS assertion
}
RETURN x.name, labels(x)[0], linkKind, method, direction, assertion
```

- trace: asserted rows → TRACE directly; Open Targets association scores enter as Assertions `basisKind: CALCULATED` asserted by Open Targets with their own locator; D10 rows → `Association.inputs` (kernel DERIVED_FROM) → TRACE.
- bitemporal episode needed on: none.

## Q-D2-15

- kind: cypher (spans D5)
- pattern: adverse phenotypes asserted for modulating M (subject Mechanism or a modulator, predicate `INCREASES_RISK_OF`, object Condition of kind PHENOTYPE/DISEASE), plus D5 adverse-effect knowledge through the compounds that modulate M.

```cypher
MATCH (m:Mechanism {uid: $mechanismUid})
OPTIONAL MATCH (m)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'INCREASES_RISK_OF'})-[:HAS_OBJECT]->(cond:Condition)
OPTIONAL MATCH (m)<-[r:AFFECTS_MECHANISM]-(mod)<-[:HAS_SUBJECT]-(ae:Assertion {predicate: 'CAUSES_ADVERSE_EFFECT'})-[:HAS_OBJECT]->(aeCond)   // D5 predicate
RETURN cond.name, a.basisKind, mod.name, aeCond.name, ae.basisKind,
       [q IN ae.qualifiers WHERE q STARTS WITH 'population:'] AS aePopulation, ae.uid      // D5 population qualifier, never a D2 context
```

Expected (PEARL, 01-ecosystem S35): low-dose sirolimus adverse events in humans; mTOR inhibition → glucose effects asserted in reviews (`CITED_FROM_PRIOR_WORK`).

- trace: TRACE on `a` and `ae`.
- bitemporal episode needed on: none.

## Q-D2-16

- kind: assessment (kernel `Assessment`, kind EVIDENCE_SYNTHESIS, subkind `D2.marketing-mechanism-support`), inputs by cypher
- pattern: for each mechanism claim occurrence on a product page, find the best human measured Assertion on the same step for the product's active substance.

```cypher
MATCH (p {uid: $productUid})<-[:HAS_SUBJECT]-(cl:Assertion {assertionKind: 'CLAIM'})-[:HAS_OBJECT]->(step)
OPTIONAL MATCH (p)-[:HAS_VARIANT]->()-[:HAS_PACKAGE]->()-[hl:HAS_LABEL_VERSION]->(:LabelVersion)-[:DECLARES_COMPONENT]->(:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(sub)  // D6/D1
  WHERE hl.recordedTo IS NULL
OPTIONAL MATCH (sub)<-[:HAS_SUBJECT]-(m:Assertion)-[:HAS_OBJECT]->(step2)
WHERE m.basisKind = 'DIRECT_MEASUREMENT' AND (step2 = step OR EXISTS { (step2)-[:PARTICIPATES_IN]->(step) })
  AND EXISTS { (m)-[:OBSERVED_IN_CONTEXT]->(:MechanismEvidenceContext {organism: 'HUMAN'}) }
OPTIONAL MATCH (cl)-[:OCCURRENCE_OF]->(:Claim)<-[:ASSESSES]-(asm:Assessment {assessmentKind: 'EVIDENCE_SYNTHESIS'})   // kernel: an Assessment ASSESSES the occurrence's Claim (Subjectable), never the Assertion
RETURN cl.proposition, step.name, collect({finding: m.predicate, uid: m.uid}) AS humanMeasured, asm.verdict
```

Expected (FC-6 + FC-1): "Boosted NAD+ activates sirtuins" → human muscle pan-acetylation `NO_CHANGE_IN`; "improved mitochondrial function" → respiration `NO_CHANGE_IN`. (FC-6 is a research-stage capture; the product label path is D6's.)

- trace: claim occurrence TRACE (product page snapshot) + measured Assertion TRACE; the assessment `DERIVED_FROM` both.
- bitemporal episode needed on: none (the page versions in place; D9/D6 change tracking makes new snapshots, the claim occurrence cites one).

## Q-D2-17

- kind: cypher (spans D7, D13, D3)
- pattern: organization → thesis mechanism (predicate-only `DEVELOPS_THERAPY_TARGETING`, subject Organization, object Mechanism/MolecularEntity) → disconfirming readouts (D13 events / D3 results on studies of the organization's compounds whose mechanism projection hits the thesis).

```cypher
MATCH (org:Organization {uid: $orgUid})<-[:HAS_SUBJECT]-(th:Assertion {predicate: 'DEVELOPS_THERAPY_TARGETING'})-[:HAS_OBJECT]->(m)
OPTIONAL MATCH (ev:Event)-[inv:INVOLVES]->(org) WHERE ev.eventKind IN ['READOUT','PROGRAM_DISCONTINUATION'] AND inv.recordedTo IS NULL   // D13
OPTIONAL MATCH (x)-[:AFFECTS_MECHANISM]->(m) WHERE x:ChemicalSubstance
OPTIONAL MATCH (x)<-[:HAS_SUBJECT]-(d:Assertion)-[:HAS_OBJECT]->(m) WHERE d.predicate = 'NO_CHANGE_IN'
RETURN m.name, th.uid, collect(DISTINCT ev.name) AS readouts, collect(DISTINCT d.uid) AS mechanismNulls
```

Expected (FC-2, FC-11): Sirtris/GSK thesis "direct SIRT1 activation" vs Pacholec 2010 nulls; UNITY UBX0101 senolytic OA readout null at 12 weeks.

- trace: TRACE on `th`, `d`; events trace through D13.
- bitemporal episode needed on: none in D2 (D7 ownership/role edges carry their own episodes).

## Q-D2-18

- kind: materialized ranking (D10 method over D2 projection properties)
- pattern: rank modulators of M by independent measured support.

```cypher
MATCH (mod)-[r:AFFECTS_MECHANISM]->(m:Mechanism {uid: $mechanismUid})
WHERE r.derivationRule = 'd2.affects-mechanism/v1' AND r.bestBasis = 'DIRECT_MEASUREMENT'
RETURN mod.name, r.direction, r.nContexts, r.nHumanContexts, r.nNoChangeContexts, r.score
ORDER BY r.score DESC
```

`score` = method `d2.affects-mechanism/v1` support score (09-reasoning). A published ranking is a kernel `Report` (reportKind COMPARISON) under a D10 `DecisionCriterion` version; never a stored edge between modulators.

- trace: each row's `derivedFromAssertionUids` → TRACE; the report's citation set (`DERIVED_FROM`) when published.
- bitemporal episode needed on: none.

## Q-D2-19

- kind: gds (suggestion only; never an Assertion, never a D2 edge)
- pattern: link prediction compound → mechanism from shared molecular targets.
  - projection (Cypher projection, nightly after the AFFECTS_MECHANISM refresh):

```cypher
// projection: substance -> molecular target (bipartite) read from the target Assertions (no stored substance -> target edge)
MATCH (s:ChemicalSubstance)<-[:HAS_SUBJECT]-(a:Assertion)-[:HAS_OBJECT]->(t:MolecularEntity)
WHERE a.predicate IN ['INHIBITS', 'ACTIVATES', 'BINDS', 'INCREASES_ACTIVITY_OF', 'DECREASES_ACTIVITY_OF']
  AND a.basisKind IN ['DIRECT_MEASUREMENT', 'INFERRED_FROM_MEASUREMENT', 'CITED_FROM_PRIOR_WORK']
  AND a.status IN ['ACCEPTED', 'DISPUTED'] AND a.recordedTo IS NULL
WITH DISTINCT s, t
RETURN gds.graph.project('d2-substance-target', s, t, {relationshipType: 'HITS'});

// algorithm: Node Similarity (Jaccard) between substances by shared targets
CALL gds.nodeSimilarity.stream('d2-substance-target', {similarityCutoff: 0.2, topK: 10})
YIELD node1, node2, similarity
WITH gds.util.asNode(node1) AS s, gds.util.asNode(node2) AS s2, similarity
// candidate: s2 has a measured projection to m, s has none
MATCH (s2)-[r2:AFFECTS_MECHANISM]->(m:Mechanism) WHERE r2.bestBasis = 'DIRECT_MEASUREMENT'
  AND NOT (s)-[:AFFECTS_MECHANISM]->(m)
RETURN s.name, m.name, max(similarity) AS suggestionScore, collect(s2.name)[0..5] AS becauseOf
ORDER BY suggestionScore DESC;
CALL gds.graph.drop('d2-substance-target');
```

  - algorithm: Node Similarity (Jaccard) over substances by shared molecular targets; a candidate is (substance s, mechanism m) where a similar substance has a measured `AFFECTS_MECHANISM` to m and s has none. Second path without GDS: (s)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_OBJECT]->(:MolecularEntity)-[:PARTICIPATES_IN]->(m) with no s→m projection (pure Cypher, query time). Leiden over the MolecularEntity–Mechanism co-membership graph is a curation aid for the hallmark mapping only (not a question).
  - refresh: nightly; output stored only as a D10 `Association` record (method `gds-nodesimilarity/jaccard@1`, `score`, `inputSetDigest`) flagged suggestion, or returned at query time.
  - use: research-agent queue for evidence missions ("test whether s affects m"), never shown as evidence.
- trace: none (a suggestion has no locator); each supporting edge in the explanation traces through its own projection inputs.
- bitemporal episode needed on: none.

## Q-D2-20

- kind: cypher (GraphQL-expressible)
- pattern: genetic manipulation contexts of a gene and its orthologs with lifespan/healthspan outcomes.

```cypher
MATCH (g:MolecularEntity) WHERE g.geneSymbol =~ $symbolCaseInsensitive     // e.g. '(?i)sirt1' covers Sirt1 / sir-2.1 via synonyms
MATCH (g)<-[:HAS_SUBJECT]-(a:Assertion)-[:HAS_OBJECT]->(o:Outcome)
MATCH (a)-[:OBSERVED_IN_CONTEXT]->(ctx) WHERE ctx.geneticManipulation <> 'NONE'
RETURN ctx.organism, ctx.strainOrLine, ctx.sexScope, ctx.geneticManipulation, o.name, a.predicate, a.valueNumber, a.unitCode, a.uid
```

Expected (FC-9): GenAge SIRT1 — fly/worm homologue overexpression extends lifespan ("questioned by other studies"); mouse whole-body moderate overexpression `NO_CHANGE_IN` lifespan.

- trace: TRACE (GenAge HTML text-quote locators).
- bitemporal episode needed on: none.

## Q-D2-21

- kind: cypher (spans D7, D9)
- pattern: mechanism Assertions whose asserter (or the source's authors) has a disclosed financial interest in the compound.

```cypher
MATCH (c {uid: $compoundUid})<-[:HAS_SUBJECT]-(a:Assertion)-[:ASSERTED_BY]->(who:Person)
WHERE a.predicate IN $mechPredicates
MATCH (who)-[fi:HOLDS_STAKE|HOLDS_ROLE|RECEIVES_VALUE_FROM]->(org:Organization)   // D7 financial-interest family (typed, asserted episodes)
WHERE fi.recordedTo IS NULL
MATCH (org)<-[:HAS_SUBJECT]-(:Assertion {predicate: 'SUPPLIES_MATERIAL'})-[:HAS_OBJECT]->(mat:IngredientMaterial)   // D7 predicate-only
WHERE mat = c OR (mat)-[:REALIZES_SUBSTANCE]->(c)                                                                  // D1 roll-up
RETURN a.uid, a.predicate, who.name, type(fi) AS interest, org.name, fi.assertionUid
```

Expected (FC-1): Declaration of Interests — "C.B. is the inventor of patents licensed by ChromaDex, owns stock in ChromaDex …".

- trace: TRACE on `a`; `fi.assertionUid` → the authorizing D7 Assertion → TRACE (Declaration of Interests span). Close-out 2026-10-09 (pattern lint): the earlier draft read four interest/supply predicates that no packet 05 register declares; it now reads D7's own typed family (`HOLDS_STAKE` / `HOLDS_ROLE` / `RECEIVES_VALUE_FROM`, Person → Organization) and D7's predicate-only `SUPPLIES_MATERIAL` (Organization → IngredientMaterial).
- bitemporal episode needed on: none in D2 (the D7 interest edges carry their own episodes; `recordedTo IS NULL` = current).

## Q-D2-22

- kind: cypher (spans D4)
- pattern: mechanism-specific biomarker endpoints moved in humans for senolytics / NAD+ boosters.

```cypher
MATCH (c {uid: $compoundUid})-[:AFFECTS_MECHANISM]->(m:Mechanism)<-[:REFLECTS_MECHANISM]-(b:Biomarker)     // D4 edge
MATCH (c)<-[:HAS_SUBJECT]-(a:Assertion)-[:HAS_OBJECT]->(x)
WHERE (x = b OR (b)-[:HAS_ANALYTE]->(x)) AND a.predicate IN ['INCREASES_LEVEL_OF','DECREASES_LEVEL_OF','NO_CHANGE_IN']
MATCH (a)-[:OBSERVED_IN_CONTEXT]->(ctx {organism: 'HUMAN'})
// DOSE (shared fragment) for ctx
RETURN b.name, ctx.compartmentLabel, a.predicate, amount, unit, duration, a.uid
```

Expected (FC-7): D + Q (100 mg + 1000 mg, 3 days) → adipose p16INK4A+ and p21CIP1+ cells, SA-β-gal+ cells `DECREASES_LEVEL_OF` within 11 days.

- trace: TRACE.
- bitemporal episode needed on: none.

## Q-D2-23

- kind: cypher (the 00-DIRECTIVE 3.8 locator path; kernel-shaped)
- pattern: from one mechanism Assertion to the located span, its snapshot bytes and the current adjudication; the verifier re-selects exactly `loc.selectorJson` on `snap`.

```cypher
MATCH (a:Assertion {uid: $assertionUid})-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(a)
RETURN a.predicate, a.basisKind, ev.role, ev.origin, loc.selectorKind, loc.selectorJson, loc.exact, loc.startOffset, loc.endOffset,
       snap.contentHash, snap.canonicalProjectionHash, adj.adjudicationKind, adj.verdict, adj.mechanicalStatus
// contradicting evidence for the same assertion: ev.role = 'CONTRADICTS' rows (verifier-found, origin VERIFIER_FOUND)
```

Normalization: JATS text uses U+00A0/U+202F/U+2010 (01-ecosystem, tool-log); the selector JSON records `normalization: nbsp-nnbsp-hyphen/v1`.

- trace: this is the trace.
- bitemporal episode needed on: none (kernel `HAS_IDENTIFIER` episodes are not involved).

## Q-D2-24

- kind: vector + cypher (D9 chunks; derived MENTIONS)
- pattern: chunks mentioning both C and M (retrieval only), flagged with whether an Assertion was built from their span.

```cypher
// 1. candidate chunks: derived MENTIONS (entity-link/vN) or vector search on chunk text (D9 index chunk_embedding)
MATCH (ch:Chunk)-[mc:MENTIONS]->(c {uid: $compoundUid})
MATCH (ch)-[mm:MENTIONS]->(m) WHERE m.uid = $mechanismUid OR EXISTS { (m)-[:PARTICIPATES_IN]->(:Mechanism {uid: $mechanismUid}) }
// 2. does a verified assertion sit on this span? D9's derived COVERS_LOCATOR (span-overlap/v1) already joins chunk and locator
OPTIONAL MATCH (ch)-[:COVERS_LOCATOR]->(loc:SourceLocator)<-[:HAS_EVIDENCE]-(a:Assertion)
RETURN ch.uid, mc.derivationRule, collect(DISTINCT a.uid) AS assertions, count(a) > 0 AS hasAssertion
```

Vector variant: `CYPHER 25 MATCH (ch:Chunk) SEARCH ch IN (VECTOR INDEX chunk_embedding FOR $questionEmbedding LIMIT 50) SCORE AS s` then the same step 2. MENTIONS is never evidence (FC-1b shows Europe PMC linking "NR" to NorRed and "nicotinamide riboside" to dihydrozeatin riboside).

- trace: through step 2 to locator, then `(loc)<-[:HAS_LOCATOR]-(snap)` (and `(ch)-[:CHUNK_OF]->(snap)` for the chunk's own snapshot); a chunk with no Assertion has no trace and is shown as "unverified context".
- bitemporal episode needed on: none (MENTIONS and COVERS_LOCATOR are derived, recorded only).

## Q-D2-25

- kind: cypher
- pattern: curated reference statements (asserter = a reference authority: KEGG, GenAge, Reactome narrative) vs a primary study that measured the same step with the opposite or null result.

```cypher
MATCH (ref:Assertion)-[:ASSERTED_BY]->(auth) WHERE auth.uid IN $referenceAuthorityUids AND ref.predicate IN $mechPredicates
MATCH (ref)-[:HAS_SUBJECT]->(c), (ref)-[:HAS_OBJECT]->(step)
MATCH (c)<-[:HAS_SUBJECT]-(d:Assertion)-[:HAS_OBJECT]->(step)
WHERE d.basisKind = 'DIRECT_MEASUREMENT' AND d.predicate IN ['NO_CHANGE_IN','DECREASES_ACTIVITY_OF','DECREASES_LEVEL_OF'] AND ref.predicate STARTS WITH 'INCREASES'
OPTIONAL MATCH (adj:Adjudication {adjudicationKind: 'SUPPORT'})-[:ASSESSES]->(ref)
RETURN auth.name, ref.uid, step.name, d.uid, adj.verdict
```

Expected (FC-10 vs FC-2): KEGG hsa04211 "resveratrol, by activating SIRT1 activity" vs Pacholec "not direct activators of SIRT1". Licence caveat: KEGG may be cited only if the owner accepts academic-use terms (11-open-questions); GenAge SIRT1 narrative is the substitute.

- trace: TRACE on both.
- bitemporal episode needed on: none.

## Q-D2-26

- kind: cypher (spans D3 via Outcome)
- pattern: ordered chain compound → mechanism(s) → outcome, per-step human basis, first unmeasured step highlighted. Hop 1 is the `AFFECTS_MECHANISM` projection; hop 2 is query-time aggregation over mechanism → outcome Assertions and their contexts (adversarial review: `INFLUENCES_OUTCOME` demoted to predicates; one compound × one outcome bounds the work).

```cypher
MATCH (c {uid: $compoundUid})-[am:AFFECTS_MECHANISM]->(m:Mechanism)
MATCH (o:Outcome {uid: $outcomeUid})
OPTIONAL MATCH (s)<-[:HAS_SUBJECT]-(h2:Assertion)-[:HAS_OBJECT]->(o)                           // hop 2, query time
  WHERE (s = m OR EXISTS { (s)-[pp:PARTICIPATES_IN]->(m) WHERE pp.recordedTo IS NULL })
    AND h2.predicate IN $outcomePredicates AND h2.status IN ['ACCEPTED', 'DISPUTED'] AND h2.recordedTo IS NULL
OPTIONAL MATCH (h2)-[:OBSERVED_IN_CONTEXT]->(h2ctx:MechanismEvidenceContext)
WITH c, am, m, o, collect(h2) AS hop2, any(x IN collect(h2ctx) WHERE x.organism = 'HUMAN' AND x IS NOT NULL) AS hop2Human
WHERE size(hop2) > 0 OR $includeUnlinked
OPTIONAL MATCH (c)<-[:HAS_SUBJECT]-(direct:Assertion)-[:HAS_OBJECT]->(o)                       // direct compound → outcome findings
OPTIONAL MATCH (direct)-[:OBSERVED_IN_CONTEXT]->(dctx)
RETURN m.name, am.direction, [x IN hop2 | x.predicate] AS hop2Predicates,
       [am.humanMeasured, hop2Human] AS humanMeasuredPerHop,
       CASE WHEN NOT am.humanMeasured THEN 'compound→mechanism' WHEN size(hop2) = 0 THEN 'mechanism→outcome (no assertion)'
            WHEN NOT hop2Human THEN 'mechanism→outcome' ELSE null END AS firstUnmeasuredHop,
       collect({finding: direct.predicate, organism: dctx.organism}) AS directOutcomeFindings
```

D3 join for registered human endpoints: `(o)<-[:MEASURES]-(:OutcomeDefinition)<-[:RESULT_FOR]-(res:StudyResult)-[:RESULT_FOR_ARM]->(:StudyArm)`. D5 entry point: a user's Target reaches `o` through `(t:Target)-[:OPERATIONALIZED_BY]->(o)` (declared by D5).

- trace: hop 1 projection inputs → TRACE; hop 2 Assertions → TRACE; D3 results → their TRACE.
- bitemporal episode needed on: none.

## Q-D2-27

- kind: cypher (spans D13 → D3 → D2)
- pattern: frontier → recent readout events → study → arms → mechanism contexts → findings.

```cypher
MATCH (f:Frontier {key: $frontierKey})<-[of:ON_FRONTIER]-(s:Study) WHERE of.recordedTo IS NULL     // D13 → D3
MATCH (s)-[:HAS_ARM]->(arm:StudyArm)<-[:IN_STUDY_ARM]-(ctx:MechanismEvidenceContext)<-[:OBSERVED_IN_CONTEXT]-(a:Assertion)
WHERE a.recordedAt >= $since AND a.basisKind = 'DIRECT_MEASUREMENT' AND ctx.organism = 'HUMAN'
MATCH (a)-[:HAS_OBJECT]->(step)
RETURN f.name, s.name, step.name, a.predicate, ctx.compartmentLabel, a.recordedAt, a.uid ORDER BY a.recordedAt DESC
```

Frontiers never point at mechanisms (D13 seam rule); frontier → mechanism relevance is this computed path.

- trace: TRACE on `a`; frontier classification traces through D13's ON_FRONTIER assertion.
- bitemporal episode needed on: none. ON_FRONTIER (D13) is asserted and recorded-only (`AssertedRecordedProperties`; reclassification closes the episode), so only `of.recordedTo IS NULL` applies; none in D2.

## Q-D2-28

- kind: cypher over kernel Report (published)
- pattern: evidence report about the Claim "C acts via M in humans".

```cypher
MATCH (cl:Claim)<-[:OCCURRENCE_OF]-(occ:Assertion)-[:HAS_SUBJECT]->(c {uid: $compoundUid})
MATCH (occ)-[:HAS_OBJECT]->(step) WHERE step.uid = $mechanismUid OR EXISTS { (step)-[:PARTICIPATES_IN]->(:Mechanism {uid: $mechanismUid}) }
MATCH (cl)<-[:ASSESSES]-(r:Report {reportKind: 'EVIDENCE_REPORT'})-[:WAS_GENERATED_BY]->(mission:Activity)
RETURN cl.uid, r.verdict, r.policyVersion, r.publishedAt, mission.missionId, mission.runId, r.uid ORDER BY r.publishedAt DESC
```

- trace: report → `DERIVED_FROM` cited Assertions/Assessments → TRACE; report `HAS_EVIDENCE` → quoted locators (kernel Q-K-08 shape).
- bitemporal episode needed on: none.

## Indexes these patterns assume (D2 labels)

- Uniqueness: `Mechanism.uid`, `Mechanism.key`, `MolecularEntity.uid`, `MechanismEvidenceContext.uid`, `MechanismEvidenceContext.contextKey`, `Condition.uid`, `Outcome.uid`, `Outcome.key`.
- Range: `MechanismEvidenceContext(organism, compartmentKind)`, `MechanismEvidenceContext.compartmentOntologyId`, `MolecularEntity.geneSymbol`, `Mechanism.mechanismKind`; relationship range on `AFFECTS_MECHANISM.derivationRule`, `AFFECTS_MECHANISM.bestBasis`, `PARTICIPATES_IN.recordedTo`, `PART_OF_MECHANISM.recordedTo`.
- Fulltext (entity linking of free-text mechanism/condition/outcome mentions in claims): `mechanism_text` on `Mechanism(name, description, synonyms)`, `condition_text` on `Condition(name, synonyms)`, `outcome_text` on `Outcome(name, synonyms)`.
- Vector (brief: vector search over mechanism descriptions): `mechanism_embedding` on `Mechanism.descriptionEmbedding` (executor-set property, not exposed in GraphQL), 1024–1536 dims cosine, `WITH [m.mechanismKind]` filterable; used to resolve paraphrased claim objects ("helps your cells make energy") to a curated Mechanism before an Assertion is written, followed by the fulltext index as a lexical check. Re-embed when `description` changes (`updatedAt`).
