# D3 — retrieval patterns

Agent A4 · model stage · 2026-10-08; adversarial-review stage 2026-10-08 (neutral result fields: `StudyResult.direction` is an EstimateDirection and `statisticalConclusion` has no favorable / unfavorable values, so harm is read by the event-risk rule or an interpretation Assessment; assessment reads use the kernel's typed slots `conclusionCode` / `gradeScheme` / `grade` / `certainty` / `facets` with the vocabularies registered in `09-reasoning.md`; status-only revision flags are kernel `HAS_REVISION_STATUS` Assertions). One section per question of `02-questions.md` (ids stable). Shapes are Cypher 5 (Neo4j 5.26; no `CYPHER 25` prefix, no `SEARCH` clause) against the module SDL (`04-schema-proposal.graphql`) and the kernel (A1, `packets/K/04-schema-proposal.graphql`). Other modules' type and edge names follow their SDLs as published in their worktrees on 2026-10-08 (10-seams.yaml) and are marked `(seam)`.

## Conventions used below

- `$recAt` (recorded-time slice, default `datetime()`) and `$validAt` (valid-time point) are parameters of every pattern.
- `ASOF(e)` on any asserted edge (`AssertedRecordedProperties` on STATED_IN, ADMINISTERS, MEASURES, REPORTS_ON, INVESTIGATES; `RevisionEdgeProperties` on REVISES; `StateEpisodeProperties` on HAS_REGISTRATION_VERSION; `StudyRoleEdgeProperties` on HAS_STUDY_ROLE): `e.recordedFrom <= $recAt AND (e.recordedTo IS NULL OR e.recordedTo > $recAt)`. Every asserted edge is read through it (nothing is deleted; a superseded episode has `recordedTo`). Check stage 2026-10-08: the recorded-only edges moved to the kernel's `AssertedRecordedProperties` (no valid-time fields); any valid time a source states stays on the authorizing Assertion.
- `VALID(e)`: `(e.validFrom IS NULL OR e.validFrom <= $validAt) AND (e.validTo IS NULL OR e.validTo > $validAt)`. Used **only** on the two episode edges of this module, `HAS_REGISTRATION_VERSION` and `HAS_STUDY_ROLE` (09-reasoning.md, bitemporal decision), and on other modules' state edges (D6 `HAS_LABEL_VERSION`).
- `LIVE(a)` on a kernel Assertion: `a.status = 'ACCEPTED' AND a.recordedAt <= $recAt AND (a.recordedTo IS NULL OR a.recordedTo > $recAt)`. Answers for end users use `LIVE`; agent and audit views also show `PROPOSED` / `DISPUTED` with their status.
- `TRACE(e)` — the provenance tail every answer returns (directive 3.10). For an asserted edge `e`:

```cypher
CALL (e) {
  MATCH (a:Assertion {uid: e.assertionUid})-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
  WHERE ev.role = 'SUPPORTS'
  OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
  OPTIONAL MATCH (adj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(a) WHERE adj.recordedTo IS NULL
  RETURN collect({assertion: a.uid, status: a.status, asserter: who.uid, selectorKind: loc.selectorKind,
                  selector: loc.selectorJson, exact: loc.exact, start: loc.startOffset, end: loc.endOffset,
                  page: loc.page, snapshot: snap.contentHash, retrievedAt: snap.retrievedAt,
                  uri: src.canonicalUri, verdict: adj.verdict}) AS trace
}
```

  Structural edges (`HAS_ARM`, `HAS_COMPONENT`, `HAS_POPULATION`, `HAS_OUTCOME`, `RESULT_FOR`, `RESULT_FOR_ARM`) have no Assertion; their facts are traced through the `STATED_IN` episode of the element they bind, whose Assertion carries one locator per number (registry JSON pointer, JATS section + exact quote + offsets over normalized text content).
- Indexes this module needs (DDL in the synthesis): range on `Study.studyKind`, `Study.overallStatus`, `OutcomeDefinition.outcomeKey`, `StudyResult.statisticalConclusion`, `Publication.revisionStatus`, `RegistrationVersion(registry, registrationId)`; relationship-property range indexes on `assertionUid` of `STATED_IN`, `ADMINISTERS`, `REVISES`, `HAS_STUDY_ROLE` and on `HAS_STUDY_ROLE.roleKind`, `REVISES.revisionKind` (the kernel's risk note on Q-K-04/Q-K-07 applies); fulltext `d3_outcome_text` (OutcomeDefinition.name, description), `d3_component_text` (InterventionComponent.materialTextVerbatim, verbatimDoseText), `d3_population_criteria` (StudyPopulation.eligibilityCriteriaText, enrichmentText), `d3_registry_text` (RegistrationVersion.officialTitle, conditionsVerbatim, interventionNamesVerbatim). Chunk vector index is D9's.

## CQ-ST-01

- kind: cypher
- pattern: study → arm per stating record → components → resolved material, with dose as stated.

```cypher
MATCH (s:Study {uid: $study})-[:HAS_ARM]->(arm:StudyArm)-[st:STATED_IN]->(rec)
WHERE ASOF(st)
MATCH (arm)-[:HAS_COMPONENT]->(c:InterventionComponent)
OPTIONAL MATCH (c)-[ad:ADMINISTERS]->(m) WHERE ASOF(ad)
OPTIONAL MATCH (mp:Assertion {predicate: 'MATERIAL_PROVIDED_BY'})-[:HAS_SUBJECT]->(c) WHERE LIVE(mp)
OPTIONAL MATCH (mp)-[:HAS_OBJECT]->(supplier)
RETURN labels(rec)[0] AS statedIn, rec.uid, arm.name, arm.armType, c.componentRole, c.materialTextVerbatim,
       labels(m)[0] AS materialKind, m.uid, c.quantity, c.unitCode, c.quantityBasis, c.massBasis, c.dosageForm,
       c.route, c.scheduleText, c.durationIso, c.verbatimDoseText,
       coalesce(supplier.name, c.supplierNameVerbatim) AS supplier, TRACE(st) AS armTrace, TRACE(ad) AS resolutionTrace
ORDER BY statedIn, arm.armKey
```

- trace: arm and dose facts → the arm's `STATED_IN` Assertion locators (CTG `/protocolSection/armsInterventionsModule/armGroups/i`, JATS Methods); material resolution → `ADMINISTERS` Assertion (+ its RESOLUTION Assessment); supplier → `MATERIAL_PROVIDED_BY` locator.
- bitemporal episode needed on: none (recorded-time slice only).

## CQ-ST-02

- kind: cypher (assessment read; path type computed when no assessment exists)
- pattern: classify how a study component reaches a product on sale — SAME_LOT, SAME_PRODUCT_VARIANT, SAME_MATERIAL (the label current at `$validAt` declares the administered material), SAME_SUBSTANCE_ONLY — then attach dose-delivery assertions and the EQUIVALENCE / APPLICABILITY assessment. D6 path (worktree A6 SDL): ProductVariant -HAS_PACKAGE-> Package -HAS_LABEL_VERSION {StateEpisodeProperties}-> LabelVersion -DECLARES_COMPONENT-> IngredientMaterial; D8: Lot -LOT_OF-> Product | ProductVariant, Lot.lotCode.

```cypher
MATCH (c:InterventionComponent {uid: $component})
OPTIONAL MATCH (c)-[ad:ADMINISTERS]->(m) WHERE ASOF(ad)
MATCH (pv:ProductVariant {uid: $productVariant})                                                  // (seam) D6
CALL (c, m, pv) {
  MATCH (lot:Lot)-[:LOT_OF]->(pv) WHERE lot.lotCode = c.lotCodeVerbatim                           // (seam) D8, property join
  RETURN 'SAME_LOT' AS pathType, 1 AS rank
  UNION
  WITH m, pv WHERE m = pv RETURN 'SAME_PRODUCT_VARIANT' AS pathType, 2 AS rank
  UNION
  MATCH (pv)-[:HAS_PACKAGE]->(:Package)-[hl:HAS_LABEL_VERSION]->(:LabelVersion)-[:DECLARES_COMPONENT]->(m:IngredientMaterial)
  WHERE VALID(hl) RETURN 'SAME_MATERIAL' AS pathType, 3 AS rank
  UNION
  MATCH (pv)-[:HAS_PACKAGE]->(:Package)-[hl:HAS_LABEL_VERSION]->(:LabelVersion)-[:DECLARES_COMPONENT]->(:IngredientMaterial)
        -[:REALIZES_SUBSTANCE]->(sub)<-[:REALIZES_SUBSTANCE]-(m:IngredientMaterial)                // (seam) D1
  WHERE VALID(hl) RETURN 'SAME_SUBSTANCE_ONLY' AS pathType, 4 AS rank
}
WITH c, pathType, rank ORDER BY rank LIMIT 1
OPTIONAL MATCH (d:Assertion)-[:HAS_SUBJECT]->(c)
  WHERE d.predicate IN ['MEASURED_DELIVERY_FRACTION', 'DOSE_EQUIVALENT_TO'] AND LIVE(d)
OPTIONAL MATCH (eq:Assessment)-[:ASSESSES]->(c)
  WHERE eq.assessmentKind IN ['EQUIVALENCE', 'APPLICABILITY'] AND eq.recordedTo IS NULL
RETURN pathType, c.quantity, c.unitCode, c.quantityBasis, c.massBasis, c.lotCodeVerbatim,
       collect(DISTINCT {predicate: d.predicate, value: d.valueNumber, text: d.proposition}) AS delivery,
       eq.verdict, eq.summary, eq.methodVersion
```

- trace: `ADMINISTERS` Assertion locators; D6 label-version episode Assertion; delivery assertions (ITP JATS Methods "Assaying four different batches …"); the assessment's `HAS_EVIDENCE` and `DERIVED_FROM` inputs.
- bitemporal episode needed on: D6 `HAS_LABEL_VERSION` (valid at `$validAt`, owned by D6); no D3 edge.

## CQ-ST-04

- kind: cypher
- pattern: primary outcome set per registry version in valid-time order, compared with the earliest and with each publication's declared primary.

```cypher
MATCH (s:Study {uid: $study})-[rv:HAS_REGISTRATION_VERSION]->(v:RegistrationVersion)
WHERE ASOF(rv)
OPTIONAL MATCH (od:OutcomeDefinition {priority: 'PRIMARY'})-[st:STATED_IN]->(v) WHERE ASOF(st)
WITH s, v, rv, collect(od.outcomeKey) AS primaries
ORDER BY v.registry, rv.validFrom
WITH s, v.registry AS registry,
     collect({version: v.uid, mode: v.populatingMode, validFrom: rv.validFrom, recordedFrom: rv.recordedFrom,
              primaries: primaries}) AS history
OPTIONAL MATCH (s)<-[ro:REPORTS_ON]-(p:Publication)<-[pst:STATED_IN]-(pod:OutcomeDefinition {priority: 'PRIMARY'})
WHERE ASOF(ro) AND ASOF(pst)
WITH registry, history, collect(DISTINCT {publication: p.uid, primary: pod.outcomeKey}) AS published
RETURN registry, history,
       [i IN range(1, size(history) - 1) WHERE history[i].primaries <> history[i - 1].primaries |
        {from: history[i - 1].primaries, to: history[i].primaries, at: history[i].validFrom}] AS switches,
       [x IN published WHERE NOT x.primary IN history[0].primaries] AS publishedPrimaryNotFirstRegistered
```

- trace: each `STATED_IN` Assertion; for a RECONSTRUCTED version the locator is the dated span inside the later snapshot (ISRCTN "Updated as of 14/03/2008:", "Amended 02/03/2009:"); `HAS_REGISTRATION_VERSION` Assertion for the version itself.
- bitemporal episode needed on: **HAS_REGISTRATION_VERSION** — `validFrom` is the registry's date (2005-07-14, 2008-03-14, 2009-03-02), `recordedFrom` our capture (2026-10-08); the question asks for both ("registry date vs our capture date").

## CQ-ST-05

- kind: cypher
- pattern: when the primary result is null, list every result by priority and confirmatory status, and flag claim occurrences and vetting that rest on a non-confirmatory result.

```cypher
MATCH (s:Study {uid: $study})
WHERE EXISTS { (s)-[:HAS_OUTCOME]->(:OutcomeDefinition {priority: 'PRIMARY'})<-[:RESULT_FOR]-(p:StudyResult)
               WHERE p.statisticalConclusion = 'NOT_SIGNIFICANT' }
MATCH (s)-[:HAS_OUTCOME]->(od:OutcomeDefinition)<-[:RESULT_FOR]-(r:StudyResult)-[st:STATED_IN]->(rec)
WHERE ASOF(st)
WITH s, od, r, rec, st,
     (r.analysisKind <> 'PRIMARY_PRESPECIFIED' OR r.comparisonKind <> 'BETWEEN_ARM' OR r.subgroupLabel IS NOT NULL) AS nonConfirmatory
OPTIONAL MATCH (vet:Assessment {assessmentKind: 'VETTING'})-[:DERIVED_FROM]->(:Assertion {uid: st.assertionUid})
OPTIONAL MATCH (vet)-[:ASSESSES]->(claim:Claim)
RETURN od.name, od.priority, od.timepoint, r.analysisKind, r.comparisonKind, r.subgroupLabel, r.statisticalConclusion,
       r.estimate, r.intervalLower, r.intervalUpper, r.pValueText, r.sampleSize, labels(rec)[0] AS statedIn,
       nonConfirmatory, collect(DISTINCT claim.proposition) AS claimsRestingOnIt, TRACE(st)
ORDER BY CASE od.priority WHEN 'PRIMARY' THEN 0 WHEN 'SECONDARY' THEN 1 ELSE 2 END, nonConfirmatory
```

- trace: per result the `STATED_IN` Assertion locators (Farr 2024 JATS `sec#S4` "did not differ", `sec#S5` "+16%, P = 0.020"); claims via the vetting Assessment's `DERIVED_FROM` and the claim occurrences' own locators (kernel).
- bitemporal episode needed on: none.

## CQ-ST-06

- kind: cypher
- pattern: adverse-event results per arm and per stating source; "not reported" is computed per source, never stored as zero.

```cypher
MATCH (s:Study {uid: $study})-[:HAS_OUTCOME]->(od:OutcomeDefinition {measureKind: 'ADVERSE_EVENT'})
      <-[:RESULT_FOR]-(r:StudyResult {resultKind: 'ADVERSE_EVENT_COUNT'})-[:RESULT_FOR_ARM]->(arm:StudyArm)
MATCH (r)-[st:STATED_IN]->(rec) WHERE ASOF(st)
OPTIONAL MATCH (od)-[me:MEASURES]->(effect:Condition) WHERE ASOF(me)                // (seam) D2 Condition (adverse-effect term)
RETURN labels(rec)[0] AS statedIn, rec.uid, arm.name, arm.armType, od.name AS term, effect.uid AS effect,
       r.seriousness, r.participantsAffected, r.participantsAtRisk, r.eventCount, r.collectionMethod, od.timepoint,
       TRACE(st)
ORDER BY r.seriousness, arm.armKey
// per-source gap: arms a source states with no AE row stated by the same source → 'NOT_REPORTED'
// MATCH (arm2:StudyArm)-[:STATED_IN]->(rec2) WHERE NOT EXISTS {
//   (:StudyResult {resultKind:'ADVERSE_EVENT_COUNT'})-[:RESULT_FOR_ARM]->(arm2), (x)-[:STATED_IN]->(rec2) }
// cross-study: group by effect.uid with the arm's ADMINISTERS material and InterventionComponent dose
```

- trace: CTG `resultsSection/adverseEventsModule` JSON pointers (NCT04313634 fisetin group gastric hemorrhage, `seriousNumAffected 1`, `seriousNumAtRisk 14`); the paper's safety sentence (JATS `sec#S6`).
- bitemporal episode needed on: none.

## Q-D3-01

- kind: cypher
- pattern: set difference of arms by stating source (matched on `armKey`), with the stated reason and the dropped arm's serious events.

```cypher
MATCH (s:Study {uid: $study})-[:HAS_ARM]->(arm:StudyArm)-[st:STATED_IN]->(rec)
WHERE ASOF(st)
WITH arm.armKey AS key, collect(DISTINCT CASE WHEN rec:RegistrationVersion THEN 'REGISTRY' ELSE 'PUBLICATION' END) AS statedBy,
     collect(DISTINCT arm) AS arms
WHERE size(statedBy) = 1
UNWIND arms AS a
OPTIONAL MATCH (why:Assertion {predicate: 'ARM_DROPPED_REASON'})-[:HAS_SUBJECT]->(a) WHERE LIVE(why)
OPTIONAL MATCH (sae:StudyResult {resultKind: 'ADVERSE_EVENT_COUNT', seriousness: 'SERIOUS'})-[:RESULT_FOR_ARM]->(a)
RETURN key, statedBy[0] AS onlyIn, a.name, why.valueString AS statedReason, sum(sae.participantsAffected) AS seriousAffected
```

- trace: each arm's `STATED_IN` locators (registry `"title":"Fisetin Treatment Group"`; JATS `sec#S3` "modified to a two-arm study"); `ARM_DROPPED_REASON` Assertion locator.
- bitemporal episode needed on: none.

## CQ-ST-08

- kind: cypher
- pattern: the registry version valid at `$validAt` as recorded at `$recAt`, per registry, then registry-vs-publication disagreements (Q-D3-15 pattern).

```cypher
MATCH (s:Study {uid: $study})-[rv:HAS_REGISTRATION_VERSION]->(v:RegistrationVersion)
WHERE ASOF(rv) AND VALID(rv)
RETURN v.registry, v.registrationId, v.populatingMode, v.overallStatus, v.overallStatusVerbatim, v.enrollmentCount,
       v.enrollmentCountType, v.resultsPosted, v.resultsFirstPostedDate, v.resultsSubmissionEvents,
       v.primaryCompletionDate, v.primaryCompletionDateType, rv.validFrom, rv.recordedFrom, TRACE(rv)
```

- trace: the `HAS_REGISTRATION_VERSION` Assertion's locator (WHOLE_SNAPSHOT or JSON_POINTER on the CTG capture; TEXT_QUOTE on the ISRCTN page for reconstructed versions); `resultsSubmissionEvents` from CTG `annotationSection` (NCT02678611 RELEASE 2018-03-14 / RESET 2018-10-12).
- bitemporal episode needed on: **HAS_REGISTRATION_VERSION** (valid × recorded).

## Q-D3-02

- kind: cypher
- pattern: completed studies administering compound X, past primary completion by N years, no posted results and no reporting publication, with sponsor and submission events.

```cypher
MATCH (x {uid: $substance})<-[:REALIZES_SUBSTANCE]-(:IngredientMaterial)<-[ad:ADMINISTERS]-(:InterventionComponent)
      <-[:HAS_COMPONENT]-(:StudyArm)<-[:HAS_ARM]-(s:Study)                          // (seam) D1
WHERE ASOF(ad)
WITH DISTINCT s
WHERE s.overallStatus = 'COMPLETED' AND coalesce(s.resultsPosted, false) = false
  AND s.primaryCompletionDate < datetime() - duration({years: $n})
  AND NOT EXISTS { (s)<-[ro:REPORTS_ON]-(p:Publication) WHERE p.publicationKind IN ['ARTICLE', 'PREPRINT'] AND ro.recordedTo IS NULL }
MATCH (v:RegistrationVersion {uid: s.projectionOfRegistrationVersionUid})<-[rv:HAS_REGISTRATION_VERSION]-(s)
OPTIONAL MATCH (s)-[sp:HAS_STUDY_ROLE]->(sponsor) WHERE sp.roleKind IN ['LEAD_SPONSOR', 'SPONSOR'] AND ASOF(sp) AND VALID(sp)
RETURN s.uid, s.name, collect(DISTINCT sponsor.name) AS sponsors, v.primaryCompletionDate, v.resultsSubmissionEvents,
       TRACE(rv)
```

- trace: the projected version's Assertion; absence of a publication is reported with its search coverage (PubMed DataBank NCT search and Europe PMC text-mined accessions as of `$recAt`); a PARTIAL capture never supports an absence claim (kernel `captureCompleteness`).
- bitemporal episode needed on: **HAS_STUDY_ROLE** (sponsor valid at the completion date, `$validAt = v.primaryCompletionDate`); **HAS_REGISTRATION_VERSION** behind the Study projection cache.

## CQ-EV-05

- kind: cypher
- pattern: revisions of a publication per asserter, then everything resting on its captured renditions.

```cypher
MATCH (p:Publication {uid: $publication})<-[rv:REVISES]-(n:Publication)
WHERE ASOF(rv)
MATCH (a:Assertion {uid: rv.assertionUid})-[:ASSERTED_BY]->(who)
RETURN n.uid AS uid, n.publicationKind AS publicationKind, n.publishedAt AS publishedAt, who.name AS asserter,
       rv.revisionKind AS revisionKind, [q IN a.qualifiers WHERE q STARTS WITH 'reason:' | substring(q, 7)] AS reasons, TRACE(rv) AS trace
UNION
// status-only flags without an identified notice (OpenAlex is_retracted): kernel convention HAS_REVISION_STATUS on any
// Source that shares the work's DOI / PMID (the same branch kernel Q-K-10 / Q-K-22 match from the Source side)
MATCH (p:Publication {uid: $publication})-[:HAS_IDENTIFIER]->(:Identifier)<-[:HAS_IDENTIFIER]-(src:Source)
      <-[:HAS_SUBJECT]-(hs:Assertion {predicate: 'HAS_REVISION_STATUS'})-[:ASSERTED_BY]->(who)
WHERE LIVE(hs)
RETURN null AS uid, null AS publicationKind, null AS publishedAt, who.name AS asserter, hs.valueString AS revisionKind,
       [q IN hs.qualifiers WHERE q STARTS WITH 'reason:' | substring(q, 7)] AS reasons, hs.uid AS trace;

// downstream (second statement): assertions, assessments and reports citing a locator on any rendition of p,
// plus the D3 elements p states
MATCH (p:Publication {uid: $publication})-[:HAS_IDENTIFIER]->(:Identifier)<-[:HAS_IDENTIFIER]-(src:Source)
      -[:HAS_SNAPSHOT]->(:SourceSnapshot)-[:HAS_LOCATOR]->(loc:SourceLocator)<-[:HAS_EVIDENCE]-(dep)
WHERE dep:Assertion OR dep:Assessment OR dep:Report
OPTIONAL MATCH (up)-[:DERIVED_FROM]->(dep) WHERE up:Assessment OR up:Report
RETURN labels(dep)[0] AS kind, dep.uid AS uid, dep.predicate AS predicate, dep.recordedAt AS recordedAt,
       collect(DISTINCT up.uid) AS dependants
UNION
MATCH (e)-[st:STATED_IN]->(p:Publication {uid: $publication})
OPTIONAL MATCH (up)-[:DERIVED_FROM]->(:Assertion {uid: st.assertionUid})
RETURN labels(e)[0] AS kind, e.uid AS uid, 'STATED_IN' AS predicate, st.recordedFrom AS recordedAt,
       collect(DISTINCT up.uid) AS dependants
```

- trace: each `REVISES` Assertion carries the notice locator (PubMed `CommentsCorrections RefType="RetractionOf"`; Crossref `updated-by[i]` JSON pointer with `source`); each `HAS_REVISION_STATUS` Assertion its flag locator (OpenAlex `/is_retracted`); historical assertions are kept and listed, never deleted. `revisionKind` values on both branches are the kernel's SourceRevisionKind (RETRACTION, ERRATUM, EXPRESSION_OF_CONCERN, …). `Publication.revisionStatus` is a read-only cache over both branches (method `publication-revision-status/v2` in `revisionStatusMethodVersion`).
- bitemporal episode needed on: none (notice dates are properties of the notice Publication; the revision is immutable per asserter).

## Q-D3-03

- kind: cypher
- pattern: publications behind claim C that share an author with retracted work on the same substance.

```cypher
MATCH (c:Claim {uid: $claim})<-[:ASSESSES]-(sy:Assessment {assessmentKind: 'EVIDENCE_SYNTHESIS'}) WHERE sy.recordedTo IS NULL
MATCH (sy)-[:DERIVED_FROM]->(:Assertion)-[:HAS_SUBJECT]->(:StudyResult)-[:STATED_IN]->(p:Publication)
MATCH (p)-[:REPORTS_ON]->(:Study)-[:HAS_ARM]->()-[:HAS_COMPONENT]->()-[:ADMINISTERS]->(:IngredientMaterial)
      -[:REALIZES_SUBSTANCE]->(sub)                                                  // (seam) D1
MATCH (p)<-[:HAS_SUBJECT]-(au:Assertion {predicate: 'AUTHORED_BY'})-[:HAS_OBJECT]->(person)               // predicate-only
      <-[:HAS_OBJECT]-(au2:Assertion {predicate: 'AUTHORED_BY'})-[:HAS_SUBJECT]->(bad:Publication)
WHERE bad <> p AND LIVE(au) AND LIVE(au2)
  AND EXISTS { (bad)<-[r:REVISES]-(:Publication) WHERE r.revisionKind = 'RETRACTION' AND r.recordedTo IS NULL }
  AND EXISTS { (bad)-[:REPORTS_ON]->(:Study)-[:HAS_ARM]->()-[:HAS_COMPONENT]->()-[:ADMINISTERS]->(:IngredientMaterial)
               -[:REALIZES_SUBSTANCE]->(sub) }
RETURN p.uid, p.name, person.name, count(DISTINCT bad) AS retractedSameSubstance, collect(DISTINCT bad.uid)
ORDER BY retractedSameSubstance DESC
```

- trace: `AUTHORED_BY` Assertions (predicate-only; PubMed AuthorList locator), `REVISES` Assertions (notice), synthesis inputs (kernel). Same-author identity rests on D7 Person resolution (ORCID where present) — reported with its RESOLUTION Assessment.
- bitemporal episode needed on: none.

## CQ-ST-07

- kind: gds (stream per request; no stored result)
- pattern: weakly connected components over the evidence set of claim C. Projection (Cypher projection, undirected): nodes = the Publications and Studies reachable from C's synthesis inputs; relationships = `REPORTS_ON` (open episodes) plus accepted `SHARES_PARTICIPANTS_WITH` Assertions between Studies (and, optionally, D9 retelling links between claim occurrences that cite the same publication).

```cypher
MATCH (c:Claim {uid: $claim})<-[:ASSESSES]-(sy:Assessment {assessmentKind: 'EVIDENCE_SYNTHESIS'})
      -[:DERIVED_FROM]->(:Assertion)-[:HAS_SUBJECT]->(:StudyResult)-[:STATED_IN]->(p:Publication)
WHERE sy.recordedTo IS NULL
WITH collect(DISTINCT p) AS pubs
CALL (pubs) {
  UNWIND pubs AS p MATCH (p)-[r:REPORTS_ON]->(s:Study) WHERE r.recordedTo IS NULL RETURN p AS source, s AS target
  UNION
  UNWIND pubs AS p MATCH (p)-[:REPORTS_ON]->(s1:Study)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'SHARES_PARTICIPANTS_WITH', status: 'ACCEPTED'})
        -[:HAS_OBJECT]->(s2:Study) RETURN s1 AS source, s2 AS target
}
WITH gds.graph.project('d3-independence-' + $requestId, source, target, {}, {undirectedRelationshipTypes: ['*']}) AS g
CALL gds.wcc.stream(g.graphName) YIELD nodeId, componentId
RETURN count(DISTINCT componentId) AS independentClusters,
       collect({node: gds.util.asNode(nodeId).uid, cluster: componentId}) AS members
// then CALL gds.graph.drop(g.graphName)
```

- refresh cadence: per request (the evidence set of one claim is small, typically < 1,000 nodes; sub-second); no nightly job, nothing written back. Method version `d3-independence/v1` is returned with the answer and recorded on the Report when published (D10). The count is a **lower bound on dependence** (shared sponsors and undeclared cohort overlaps are not edges).
- use: CQ-ST-07 answer; input to EVIDENCE_SYNTHESIS assessments (counts as `DERIVED_FROM` inputs plus `methodVersion`).
- trace: each cluster lists its publications and studies; each `REPORTS_ON` edge has `TRACE`.
- bitemporal episode needed on: none.

## CQ-EV-03

- kind: cypher (assessment read)
- pattern: per study behind proposition P: design, analyzed population, direction and conclusion, and the role (supports / contradicts / qualifies) the synthesis gave to its located result.

```cypher
MATCH (c:Claim {uid: $claim})<-[:ASSESSES]-(sy:Assessment {assessmentKind: 'EVIDENCE_SYNTHESIS'}) WHERE sy.recordedTo IS NULL
MATCH (sy)-[:DERIVED_FROM]->(ia:Assertion)-[:HAS_SUBJECT]->(r:StudyResult)-[:RESULT_FOR]->(:OutcomeDefinition)<-[:HAS_OUTCOME]-(s:Study)
MATCH (ia)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[ev:HAS_EVIDENCE]-(sy)
OPTIONAL MATCH (s)-[:HAS_POPULATION]->(pop:StudyPopulation {populationKind: 'ANALYZED'})
RETURN s.uid, s.studyKind, pop.ncbiTaxonId, pop.sexScope, pop.size, r.direction, r.statisticalConclusion,
       ev.role AS roleInSynthesis, loc.exact, sy.verdict, sy.methodVersion
ORDER BY ev.role, s.studyKind
```

- trace: the synthesis' `HAS_EVIDENCE {role}` to each result locator (the verifier's support/contradiction; never a document → entity edge, directive 3.8).
- bitemporal episode needed on: none.

## Q-D3-04

- kind: cypher (ranking computed at query time, never stored; directive 3.5)
- pattern: from intervention X (material, substance or D5 Intervention) and outcome concept Y — or target T through D5 `OPERATIONALIZED_BY` — to between-arm human results, ranked by design, confirmatory status, directness of outcome and size.

```cypher
MATCH (t:Target {uid: $target})-[:OPERATIONALIZED_BY]->(y)                           // (seam) D5; or bind y = $outcomeConcept
MATCH (od:OutcomeDefinition)-[me:MEASURES]->(y) WHERE ASOF(me)
MATCH (s:Study)-[:HAS_OUTCOME]->(od)<-[:RESULT_FOR]-(r:StudyResult)-[st:STATED_IN]->(rec)
WHERE ASOF(st) AND r.comparisonKind = 'BETWEEN_ARM' AND r.subgroupLabel IS NULL
  AND NOT (rec:Publication AND rec.revisionStatus = 'RETRACTED')
MATCH (r)-[:RESULT_FOR_ARM]->(:StudyArm)-[:HAS_COMPONENT]->(c:InterventionComponent {componentRole: 'ACTIVE'})-[ad:ADMINISTERS]->(m)
WHERE ASOF(ad) AND (m.uid = $intervention OR EXISTS { (m)-[:REALIZES_SUBSTANCE]->({uid: $intervention}) })
MATCH (s)-[:HAS_POPULATION]->(pop:StudyPopulation) WHERE pop.ncbiTaxonId = '9606'
WITH DISTINCT s, r, od, pop, rec, st,
  CASE s.studyKind WHEN 'META_ANALYSIS' THEN 0 WHEN 'SYSTEMATIC_REVIEW' THEN 0 WHEN 'INTERVENTIONAL_RANDOMIZED' THEN 1
                   WHEN 'INTERVENTIONAL_NONRANDOMIZED' THEN 2 WHEN 'OBSERVATIONAL_COHORT' THEN 3 ELSE 4 END AS designRank,
  CASE r.analysisKind WHEN 'PRIMARY_PRESPECIFIED' THEN 0 WHEN 'SECONDARY_PRESPECIFIED' THEN 1 ELSE 2 END AS confirmatoryRank,
  CASE od.measureKind WHEN 'CLINICAL_EVENT' THEN 0 WHEN 'SURVIVAL' THEN 0 WHEN 'BIOMARKER' THEN 2 ELSE 1 END AS directnessRank
OPTIONAL MATCH (rob:Assessment {assessmentKind: 'QUALITY'})-[:ASSESSES]->(s) WHERE rob.recordedTo IS NULL
RETURN s.uid, s.studyKind, r.sampleSize, od.name, od.measureKind, r.resultKind, r.estimate, r.intervalLower, r.intervalUpper,
       r.statisticalConclusion, r.direction, pop.sexScope, pop.minAgeYears, pop.maxAgeYears, rob.verdict AS riskOfBias, TRACE(st)
ORDER BY designRank, confirmatoryRank, directnessRank, r.sampleSize DESC
LIMIT 25
```

- trace: per row `TRACE(st)`; the ranking method `d3-evidence-rank/v1` is returned with the rows; a published version is a D10 COMPARISON Report citing the rows' Assertions.
- bitemporal episode needed on: none.

## Q-D3-05

- kind: cypher
- pattern: Q-D3-04's path restricted to the harmful direction, read without any stored good / bad value (directive 3.2): (a) the **event-risk rule** `d3-event-risk-reading/v1` — on an outcome of measureKind CLINICAL_EVENT, SURVIVAL or ADVERSE_EVENT, an event-risk result kind (hazard, risk, odds, rate, proportion, AE count) whose EstimateDirection is INCREASED means more events on the intervention, and any serious AE count above zero is reported; (b) every other measure (biomarkers, performance outcomes, survival time) only through a `D3.result-interpretation` Assessment with `effectDirection: HARM`; pooled results of reviews included. The rule's method version is returned with the rows.

```cypher
MATCH (s:Study)-[:HAS_ARM]->(:StudyArm)-[:HAS_COMPONENT]->(c:InterventionComponent {componentRole: 'ACTIVE'})-[ad:ADMINISTERS]->(m)
WHERE ASOF(ad) AND (m.uid = $intervention OR EXISTS { (m)-[:REALIZES_SUBSTANCE]->({uid: $intervention}) })
MATCH (s)-[:HAS_OUTCOME]->(od:OutcomeDefinition)<-[:RESULT_FOR]-(r:StudyResult)-[st:STATED_IN]->(rec)
WHERE ASOF(st)
OPTIONAL MATCH (ri:Assessment {assessmentSubkind: 'D3.result-interpretation'})-[:ASSESSES]->(r) WHERE ri.recordedTo IS NULL
WITH s, od, r, st, ri,
     (od.measureKind IN ['CLINICAL_EVENT', 'SURVIVAL', 'ADVERSE_EVENT']
      AND r.resultKind IN ['HAZARD_RATIO', 'RISK_RATIO', 'ODDS_RATIO', 'RISK_DIFFERENCE', 'RATE', 'PROPORTION', 'ADVERSE_EVENT_COUNT']
      AND r.direction = 'INCREASED') AS moreEvents,
     (r.resultKind = 'ADVERSE_EVENT_COUNT' AND r.seriousness = 'SERIOUS' AND r.participantsAffected > 0) AS seriousAe
WHERE moreEvents OR seriousAe OR ri.effectDirection = 'HARM'
OPTIONAL MATCH (s)-[:HAS_POPULATION]->(pop:StudyPopulation {populationKind: 'ELIGIBLE'})
OPTIONAL MATCH (od)-[:MEASURES]->(effect)
RETURN s.uid, s.studyKind, od.name, od.measureKind, effect.uid, r.resultKind, r.direction, r.estimate, r.intervalLower,
       r.intervalUpper, r.statisticalConclusion, r.analysisKind, r.subgroupLabel,
       CASE WHEN ri IS NOT NULL THEN 'assessment:' + ri.methodVersion ELSE 'd3-event-risk-reading/v1' END AS harmReading,
       pop.minAgeYears, pop.healthyVolunteers, pop.eligibilityCriteriaText, TRACE(st)
ORDER BY CASE s.studyKind WHEN 'META_ANALYSIS' THEN 0 WHEN 'SYSTEMATIC_REVIEW' THEN 0 ELSE 1 END, r.analysisKind
```

- GraphQL equivalent of the event-risk filter: `studyResults(where: { direction: { eq: INCREASED }, resultKind: { in: [HAZARD_RATIO, …] }, outcome: { some: { measureKind: { in: [CLINICAL_EVENT, SURVIVAL, ADVERSE_EVENT] } } } })`.
- trace: ASPREE NEJM abstract locators (mortality HR 1.14, 95% CI 1.01 to 1.29, conclusion NOT_REPORTED — found by the rule, missed by any significance filter; major hemorrhage HR 1.38, SIGNIFICANT); Cochrane pooled RR per supplement form (FC-6).
- bitemporal episode needed on: none.

## CQ-EV-04

- kind: cypher (assessment read)
- pattern: the current APPLICABILITY assessment of study S to use context U and its dimension children, weakest first.

```cypher
MATCH (app:Assessment {assessmentKind: 'APPLICABILITY'})-[:ASSESSES]->(:Study {uid: $study})
MATCH (app)-[:ASSESSES]->(use {uid: $useContext})                                    // (seam) D6 ProductVariant | D5 Intervention/Protocol
WHERE app.recordedTo IS NULL
MATCH (app)-[:DERIVED_FROM]->(dim:Assessment {assessmentKind: 'APPLICABILITY', assessmentSubkind: 'D3.applicability.dimension'})
WHERE dim.recordedTo IS NULL
OPTIONAL MATCH (dim)-[:DERIVED_FROM]->(inp:Assertion)
OPTIONAL MATCH (dim)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)
RETURN app.conclusionCode AS overall, [f IN app.facets WHERE f STARTS WITH 'contextOfUse=' | substring(f, 13)] AS contextOfUse,
       [f IN dim.facets WHERE f STARTS WITH 'dimension=' | substring(f, 10)][0] AS dimension, dim.conclusionCode AS dimensionVerdict,
       [f IN dim.facets WHERE f STARTS WITH 'missing=' | substring(f, 8)] AS missingFacts, dim.score AS ratio, dim.summary,
       collect(DISTINCT inp.uid) AS inputs, collect(DISTINCT {role: ev.role, exact: loc.exact}) AS evidence
ORDER BY CASE dim.conclusionCode WHEN 'DOES_NOT_APPLY' THEN 0 WHEN 'UNKNOWN_MISSING_FACTS' THEN 1
                                 WHEN 'APPLIES_WITH_ADJUSTMENT' THEN 2 ELSE 3 END
```

- GraphQL (value-1 filter, no summary parsing): `assessments(where: { assessmentSubkind: { eq: "D3.applicability.dimension" }, conclusionCode: { in: ["DOES_NOT_APPLY", "UNKNOWN_MISSING_FACTS"] }, facets: { includes: "dimension=dose" } })`.
- trace: dimension inputs are the InterventionComponent / StudyPopulation `STATED_IN` Assertions and the D6 label Assertions; locators through `HAS_EVIDENCE`. Vocabularies (conclusionCode, facet codes) are registered in `09-reasoning.md` "Assessment vocabularies"; the dose ratio is the kernel `score` (the method's own number). Still missing as typed fields: numeric HED bounds for dose translation (11-open-questions #6).
- bitemporal episode needed on: none (assessments carry recordedAt / supersedesUid).

## CQ-ST-03

- kind: cypher (assessment read)
- pattern: per outcome definition: measure kind, resolved concept, and the current endpoint classification with its classifier.

```cypher
MATCH (:Study {uid: $study})-[:HAS_OUTCOME]->(od:OutcomeDefinition)
OPTIONAL MATCH (od)-[me:MEASURES]->(y) WHERE ASOF(me)
OPTIONAL MATCH (ec:Assessment {assessmentSubkind: 'D3.endpoint-classification'})-[:ASSESSES]->(od)
  WHERE ec.recordedTo IS NULL
OPTIONAL MATCH (ec)-[:WAS_GENERATED_BY]->(:Activity)-[:WAS_ASSOCIATED_WITH]->(ag:Agent)
RETURN od.name, od.measureKind, od.priority, labels(y)[0] AS conceptKind, y.uid, ec.conclusionCode AS endpointClass,
       [f IN ec.facets WHERE f STARTS WITH 'bestCategory=' | substring(f, 13)] AS bestCategory,
       [f IN ec.facets WHERE f STARTS WITH 'contextOfUse=' | substring(f, 13)] AS contextOfUse, ec.methodVersion, ag.uid AS classifier
```

- trace: `MEASURES` Assertion locator (outcome title span); classification Assessment `HAS_EVIDENCE` (e.g. FDA surrogate table row, D4). Filterable in GraphQL on `conclusionCode` (e.g. all OutcomeDefinitions classified `CANDIDATE_SURROGATE`) and `facets` (`bestCategory=PHARMACODYNAMIC_RESPONSE`).
- bitemporal episode needed on: none.

## CQ-ST-10

- kind: cypher (assessment read)
- pattern: the result, the authors' own meaningfulness statement (Assertion), and the BellLabs interpretation assessment with its threshold source.

```cypher
MATCH (r:StudyResult {uid: $result})-[st:STATED_IN]->(rec)
OPTIONAL MATCH (auth:Assertion {predicate: 'CLINICALLY_MEANINGFUL'})-[:HAS_SUBJECT]->(r) WHERE LIVE(auth)
OPTIONAL MATCH (ri:Assessment)-[:ASSESSES]->(r)
  WHERE ri.assessmentSubkind STARTS WITH 'D3.result-interpretation' AND ri.recordedTo IS NULL
OPTIONAL MATCH (ri)-[ev:HAS_EVIDENCE]->(thr:SourceLocator) WHERE ev.role = 'CONTEXT'
RETURN r.estimate, r.unitCode, r.intervalLower, r.intervalUpper, r.direction, auth.polarity AS authorsSay,
       ri.conclusionCode AS interpretation, ri.effectDirection, ri.summary, thr.exact AS thresholdSource, TRACE(st)
```

- trace: result locators; threshold source locator (MCID paper) with role CONTEXT.
- bitemporal episode needed on: none.

## Q-D3-06

- kind: cypher
- pattern: preclinical survival results of substance X that are null, unfavorable, mixed or sex/site-limited, with model, dose (nominal and measured) and per-subgroup heterogeneity.

```cypher
MATCH (x {uid: $substance})<-[:REALIZES_SUBSTANCE]-(:IngredientMaterial)<-[ad:ADMINISTERS]-(c:InterventionComponent)
      <-[:HAS_COMPONENT]-(arm:StudyArm)<-[:HAS_ARM]-(s:Study {studyKind: 'PRECLINICAL_IN_VIVO'})     // (seam) D1
WHERE ASOF(ad)
MATCH (s)-[:HAS_OUTCOME]->(od:OutcomeDefinition {measureKind: 'SURVIVAL'})<-[:RESULT_FOR]-(r:StudyResult)-[:RESULT_FOR_ARM]->(arm)
MATCH (r)-[st:STATED_IN]->(rec) WHERE ASOF(st)
WITH s, c, r, od, st
WHERE r.statisticalConclusion = 'NOT_SIGNIFICANT' OR r.direction IN ['MIXED', 'NO_CHANGE'] OR r.subgroupLabel IS NOT NULL
   OR (r.direction = 'DECREASED' AND r.resultKind IN ['MEAN', 'MEDIAN', 'MEAN_DIFFERENCE', 'PERCENT_CHANGE'])     // shorter survival time
   OR (r.direction = 'INCREASED' AND r.resultKind IN ['HAZARD_RATIO', 'RISK_RATIO', 'ODDS_RATIO', 'RATE', 'PROPORTION'])  // more deaths
OPTIONAL MATCH (s)-[:HAS_POPULATION]->(pop:StudyPopulation {populationKind: 'RANDOMIZED'})
OPTIONAL MATCH (md:Assertion {predicate: 'MEASURED_DELIVERY_FRACTION'})-[:HAS_SUBJECT]->(c) WHERE LIVE(md)
RETURN s.uid, pop.ncbiTaxonId, pop.strainOrLine, pop.sexScope, c.quantity, c.unitCode, c.quantityBasis, md.valueNumber AS measuredFraction,
       r.subgroupLabel, r.resultKind, r.estimate, r.pValueText, r.statisticalConclusion, r.resultText, TRACE(st)
ORDER BY s.uid, r.subgroupLabel
```

- trace: ITP JATS locators (Discussion "failed to increase lifespan"; Methods dose and diet assay; Results "marginally significant increase in female lifespan at one site … decline … at another").
- bitemporal episode needed on: none.

## Q-D3-07

- kind: cypher (assessment read + range filter)
- pattern: the dose-translation assessment of an animal component, then human components of the same substance within the human-equivalent range.

```cypher
MATCH (tr:Assessment)-[:ASSESSES]->(ac:InterventionComponent {uid: $animalComponent})
WHERE tr.assessmentSubkind = 'D3.dose-translation' AND tr.recordedTo IS NULL
MATCH (ac)-[:ADMINISTERS]->(:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(x)<-[:REALIZES_SUBSTANCE]-(:IngredientMaterial)
      <-[:ADMINISTERS]-(hc:InterventionComponent)<-[:HAS_COMPONENT]-(:StudyArm)<-[:HAS_ARM]-(hs:Study)
WHERE EXISTS { (hs)-[:HAS_POPULATION]->(:StudyPopulation {ncbiTaxonId: '9606'}) }
  AND hc.unitCode = $hedUnit AND hc.quantityBasis = $hedBasis AND hc.quantity >= $hedLow AND hc.quantity <= $hedHigh
RETURN tr.summary AS methodAndHed, tr.methodVersion, collect(DISTINCT {study: hs.uid, dose: hc.quantity, unit: hc.unitCode}) AS humanTrialsInRange
```

- trace: translation assessment `HAS_EVIDENCE` (animal dose locator, FDA HED guidance locator); human components' `STATED_IN` locators. `$hedLow/$hedHigh` come from the assessment until the kernel grants typed fields (11-open-questions.md).
- bitemporal episode needed on: none.

## Q-D3-08

- kind: cypher
- pattern: every role on study S, per asserter and valid interval (typed HAS_STUDY_ROLE with roleKind), the component-level material provider, the authors (predicate-only), then each party's D7 interests.

```cypher
MATCH (s:Study {uid: $study})
CALL (s) {
  MATCH (s)-[r:HAS_STUDY_ROLE]->(who) WHERE ASOF(r)
  MATCH (ra:Assertion {uid: r.assertionUid})
  RETURN r.roleKind AS role, [q IN ra.qualifiers WHERE q STARTS WITH 'roleText:' | substring(q, 9)] AS asPrinted, who, r.assertionUid AS au, r.validFrom AS from, r.validTo AS to
  UNION
  MATCH (s)-[:HAS_ARM]->()-[:HAS_COMPONENT]->(c)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'MATERIAL_PROVIDED_BY'})-[:HAS_OBJECT]->(who)
  WHERE LIVE(a) RETURN 'MATERIAL_PROVIDER:' + c.materialTextVerbatim AS role, null AS asPrinted, who, a.uid AS au, a.validFrom AS from, a.validTo AS to
  UNION
  MATCH (s)<-[:REPORTS_ON]-(p:Publication)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'AUTHORED_BY'})-[:HAS_OBJECT]->(who)
  WHERE LIVE(a) RETURN 'AUTHOR' AS role, null AS asPrinted, who, a.uid AS au, p.publishedAt AS from, null AS to
}
MATCH (a:Assertion {uid: au})-[:ASSERTED_BY]->(asserter)
OPTIONAL MATCH (fi:Assertion)-[:HAS_SUBJECT]->(who) WHERE fi.predicate IN $d7InterestPredicates AND LIVE(fi)   // (seam) D7
RETURN role, asPrinted, labels(who)[0] AS partyKind, who.uid, who.name, asserter.name AS according_to, from, to,
       collect(DISTINCT {interest: fi.predicate, assertion: fi.uid}) AS interests
ORDER BY role
```

- trace: CTG `sponsorCollaboratorsModule` JSON pointers; ISRCTN Editorial Notes ("Bayer AG (Australia) was removed as a funder. Bayer provided the study drug, but did not fund the trial." — a record correction: the earlier FUNDER listing Assertion is SUPERSEDED at the registry's record time and never projected, the denial is a NEGATIVE Assertion, and a MATERIAL_PROVIDER episode is asserted; no valid-time episode is closed); JATS competing-interests `fn-group` for authors; D7 interest assertions.
- bitemporal episode needed on: **HAS_STUDY_ROLE** (roles over time, per registry).

## Q-D3-09

- kind: cypher
- pattern: company C → studies it sponsors → primary results null or absent → C's own claim occurrences about those studies.

```cypher
MATCH (org {uid: $company})<-[sp:HAS_STUDY_ROLE]-(s:Study)                                              // (seam) D7
WHERE sp.roleKind IN ['LEAD_SPONSOR', 'SPONSOR', 'FUNDER'] AND ASOF(sp)
OPTIONAL MATCH (s)-[:HAS_OUTCOME]->(:OutcomeDefinition {priority: 'PRIMARY'})<-[:RESULT_FOR]-(r:StudyResult)
WITH org, s, collect(r.statisticalConclusion) AS primary
WHERE size(primary) = 0 OR all(x IN primary WHERE x IN ['NOT_SIGNIFICANT', 'NOT_REPORTED', 'NOT_TESTED'])
OPTIONAL MATCH (occ:Assertion {assertionKind: 'CLAIM'})-[:ASSERTED_BY]->(org)
WHERE EXISTS { (occ)-[:HAS_SUBJECT|HAS_OBJECT]->(s) } AND LIVE(occ)
RETURN s.uid, s.overallStatus, s.resultsPosted, primary, collect(DISTINCT occ.proposition) AS companySays
```

- trace: `HAS_STUDY_ROLE` Assertion; result `STATED_IN`; claim occurrences' locators (D9 containers). Product P is joined through D6 (product of C administered in the study: `ADMINISTERS → ProductVariant`).
- bitemporal episode needed on: **HAS_STUDY_ROLE**.

## Q-D3-10

- kind: cypher
- pattern: studies on frontier F, investigating condition C, or administering X (`$x` is any of the three), that are recruiting or active, with phase, sponsor, primary outcome and expected completion.

```cypher
CALL () {
  MATCH (f:Frontier {uid: $x})<-[on:ON_FRONTIER]-(s:Study) WHERE ASOF(on) RETURN s                        // (seam) D13
  UNION
  MATCH (c:Condition {uid: $x})<-[inv:INVESTIGATES]-(s:Study) WHERE ASOF(inv) RETURN s                     // (seam) D2
  UNION
  MATCH (s:Study)-[:HAS_ARM]->()-[:HAS_COMPONENT]->()-[ad:ADMINISTERS]->(m)
  WHERE ASOF(ad) AND (m.uid = $x OR EXISTS { (m)-[:REALIZES_SUBSTANCE]->({uid: $x}) }) RETURN s
}
WITH s WHERE s.overallStatus IN ['NOT_YET_RECRUITING', 'RECRUITING', 'ENROLLING_BY_INVITATION', 'ACTIVE_NOT_RECRUITING']
OPTIONAL MATCH (s)-[sp:HAS_STUDY_ROLE]->(sponsor) WHERE sp.roleKind = 'LEAD_SPONSOR' AND ASOF(sp) AND VALID(sp)
OPTIONAL MATCH (s)-[:HAS_OUTCOME]->(od:OutcomeDefinition {priority: 'PRIMARY'})
MATCH (v:RegistrationVersion {uid: s.projectionOfRegistrationVersionUid})
RETURN s.uid, s.name, s.phase, s.overallStatus, s.primaryCompletionDate, v.primaryCompletionDateType,
       collect(DISTINCT sponsor.name) AS sponsors, collect(DISTINCT od.name) AS primaryOutcomes
ORDER BY s.primaryCompletionDate
```

- trace: the projected version's `HAS_REGISTRATION_VERSION` Assertion (CTG capture date); `ON_FRONTIER` Assertion (curation agent, frontierVocabVersion); `INVESTIGATES` Assertion (registry conditions module).
- bitemporal episode needed on: **HAS_STUDY_ROLE**; the Study projection cache reads **HAS_REGISTRATION_VERSION**.

## CQ-ST-09

- kind: cypher (assessment read)
- pattern: synthesis versions recorded in a period, the inputs new in each version, and the verdict change.

```cypher
MATCH (c:Claim {uid: $claim})<-[:ASSESSES]-(sy:Assessment {assessmentKind: 'EVIDENCE_SYNTHESIS'})
WHERE sy.recordedAt >= $from AND sy.recordedAt < $to AND sy.supersedesUid IS NOT NULL
MATCH (old:Assessment {uid: sy.supersedesUid})
MATCH (sy)-[:DERIVED_FROM]->(ia:Assertion) WHERE NOT EXISTS { (old)-[:DERIVED_FROM]->(ia) }
OPTIONAL MATCH (ia)-[:HAS_SUBJECT]->(:StudyResult)-[:STATED_IN]->(p:Publication)
RETURN sy.uid, old.verdict AS before, sy.verdict AS after, sy.methodVersion AS criterion, sy.evidenceCutoffAt,
       collect({input: ia.uid, publication: p.uid, publishedAt: p.publishedAt, recordedAt: ia.recordedAt}) AS triggers
```

- trace: new inputs' locators; `recordedAt` vs `publishedAt` answers "found when vs published when".
- bitemporal episode needed on: none (assessment recorded time).

## Q-D3-11

- kind: cypher
- pattern: the version chain of a review (REVISES from newer to older), pooled results and included-study counts per version.

```cypher
MATCH path = (newest:Publication {uid: $review})-[:REVISES*0..6]->(older:Publication)
WHERE all(rv IN relationships(path) WHERE ASOF(rv))
UNWIND nodes(path) AS version
WITH DISTINCT version
OPTIONAL MATCH (r:StudyResult)-[:STATED_IN]->(version) WHERE r.comparisonKind = 'BETWEEN_ARM'
OPTIONAL MATCH (r)-[:RESULT_FOR]->(od:OutcomeDefinition)
OPTIONAL MATCH (pop:StudyPopulation {populationKind: 'ANALYZED'})-[:STATED_IN]->(version)
OPTIONAL MATCH (cnt:Assertion {predicate: 'INCLUDED_STUDY_COUNT'})-[:HAS_SUBJECT]->(version) WHERE LIVE(cnt)
RETURN version.versionLabel, version.publishedAt, cnt.valueNumber AS includedStudies, pop.size AS participants,
       collect({outcome: od.name, kind: r.resultKind, estimate: r.estimate, lower: r.intervalLower, upper: r.intervalUpper,
                subgroup: r.subgroupLabel}) AS pooled
ORDER BY version.publishedAt
```

- trace: PubMed `CommentsCorrections` UpdateIn / UpdateOf for the REVISES Assertions; MAIN RESULTS locators per version (FC-6).
- bitemporal episode needed on: none.

## Q-D3-12

- kind: cypher
- pattern: preprint version chain to the journal version; field-level differences per version (title, authors, arms/doses, results); link status by asserter.

```cypher
MATCH path = (j:Publication)-[:REVISES*1..6]->(v1:Publication {publicationKind: 'PREPRINT'})
WHERE j.uid = $publication AND all(rv IN relationships(path) WHERE ASOF(rv))
UNWIND relationships(path) AS link
MATCH (a:Assertion {uid: link.assertionUid})-[:ASSERTED_BY]->(linker)
WITH path, collect({from: startNode(link).versionLabel, to: endNode(link).versionLabel, assertedBy: linker.name}) AS links
UNWIND nodes(path) AS p
OPTIONAL MATCH (p)<-[:HAS_SUBJECT]-(:Assertion {predicate: 'AUTHORED_BY'})-[:HAS_OBJECT]->(au)      // predicate-only
OPTIONAL MATCH (arm:StudyArm)-[:STATED_IN]->(p)
OPTIONAL MATCH (arm)-[:HAS_COMPONENT]->(c:InterventionComponent)
OPTIONAL MATCH (r:StudyResult)-[:STATED_IN]->(p)
RETURN p.versionLabel, p.publicationKind, p.publishedAt, p.name AS title, collect(DISTINCT au.uid) AS authors,
       collect(DISTINCT c.verbatimDoseText) AS doseStatements, count(DISTINCT r) AS results, links
ORDER BY p.publishedAt
```

- trace: medRxiv API `collection[i]` JSON pointers per version (`"published":"NA"` means no server-asserted link; a BellLabs curation Assertion supplies it and says so); PubMed record for the journal version.
- bitemporal episode needed on: none.

## Q-D3-13

- kind: cypher
- pattern: every number of a result → its locator → snapshot digest → capture-fidelity adjudication and whether the verifier re-selected the same span.

```cypher
MATCH (r:StudyResult {uid: $result})-[st:STATED_IN]->(rec)
MATCH (a:Assertion {uid: st.assertionUid})-[ev:HAS_EVIDENCE {role: 'SUPPORTS'}]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
OPTIONAL MATCH (adj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(a) WHERE adj.recordedTo IS NULL
OPTIONAL MATCH (adj)-[:HAS_EVIDENCE]->(aloc:SourceLocator)
WITH r, a, loc, snap, adj, collect(aloc.selectorDigest) AS verifierDigests
RETURN r.estimate, r.intervalLower, r.intervalUpper, r.pValueText, r.sampleSize,
       loc.selectorKind, loc.selectorJson, loc.exact, loc.startOffset, loc.endOffset, snap.contentHash, snap.retrievedAt,
       a.status, adj.verdict, adj.policyOutcome, loc.selectorDigest IN verifierDigests AS verifierReselectedSameSpan
```

- trace: is the answer. Convention for the fixtures and the executor: one locator per reported number on the `STATED_IN` Assertion, `selectorJson` naming the field (`estimate`, `ciLower`, `pValue`, `n`) — registry numbers by JSON_POINTER, paper numbers by TEXT_QUOTE over normalized JATS text content (raw offset kept as a hint).
- bitemporal episode needed on: none.

## Q-D3-14

- kind: vector (with fulltext fallback) then cypher
- pattern: directive 3.8 path — chunks of trial documents near the question that MENTION intervention X and an outcome or study, then the assertions whose locators fall inside those chunks.

```cypher
CALL db.index.vector.queryNodes('chunk_embedding', 50, $queryEmbedding) YIELD node AS ch, score         // (seam) D9 Chunk
MATCH (ch)-[mx:MENTIONS]->(x) WHERE x.uid IN $interventionUids                                           // derived, entity-link/vN
MATCH (ch)-[my:MENTIONS]->(y) WHERE y:OutcomeDefinition OR y:Study
MATCH (ch)-[:CHUNK_OF]->(snap:SourceSnapshot)                                                           // (seam) D9 Chunk.snapshot
MATCH (ch)-[cv:COVERS_LOCATOR]->(loc:SourceLocator)                                                        // (seam) D9 derived span-overlap/v1
MATCH (a:Assertion)-[:HAS_EVIDENCE]->(loc)
RETURN ch.uid, score, labels(y)[0], y.uid, a.predicate, a.uid, a.status, loc.exact, snap.contentHash
ORDER BY score DESC
```

- vector entry: the Neo4j 5.26 procedure `db.index.vector.queryNodes` on D9's `chunk_embedding`; the 2026.01+ `SEARCH ch IN (VECTOR INDEX …)` clause is the equivalent later form and is not used here (close-out pattern lint).
- fulltext fallback: `CALL db.index.fulltext.queryNodes('d9_chunk_text', $terms)` over the same chunks; `d3_outcome_text` to find OutcomeDefinitions by measure name.
- trace: chunk → locator (D9's derived `COVERS_LOCATOR`, span overlap in the same snapshot and text version, `derivationRule` span-overlap/v1) → Assertion → snapshot digest; the chunk is never the locator, MENTIONS and COVERS_LOCATOR are never evidence (directive 3.8). Fixture `dq-bone-trial-unstructured`.
- bitemporal episode needed on: none (MENTIONS is derived, recorded-only).

## Q-D3-15

- kind: cypher
- pattern: pairs of results for the same outcome key and result kind stated by different records that disagree on estimate, dispersion, n or analysis set; plus sponsor disagreement by asserter.

```cypher
MATCH (s:Study {uid: $study})-[:HAS_OUTCOME]->(od1:OutcomeDefinition)<-[:RESULT_FOR]-(r1:StudyResult)-[st1:STATED_IN]->(rec1)
MATCH (s)-[:HAS_OUTCOME]->(od2:OutcomeDefinition {outcomeKey: od1.outcomeKey})<-[:RESULT_FOR]-(r2:StudyResult)-[st2:STATED_IN]->(rec2)
WHERE rec1 <> rec2 AND elementId(r1) < elementId(r2) AND ASOF(st1) AND ASOF(st2)
  AND r1.resultKind = r2.resultKind AND coalesce(r1.subgroupLabel, '') = coalesce(r2.subgroupLabel, '')
  AND (r1.estimate <> r2.estimate OR r1.dispersionKind <> r2.dispersionKind OR r1.sampleSize <> r2.sampleSize
       OR r1.analysisPopulation <> r2.analysisPopulation)
RETURN od1.outcomeKey, labels(rec1)[0], r1.estimate, r1.dispersionKind, r1.sampleSize, r1.analysisPopulation, TRACE(st1),
       labels(rec2)[0], r2.estimate, r2.dispersionKind, r2.sampleSize, r2.analysisPopulation, TRACE(st2)
// design facts: (s)-[r:HAS_STUDY_ROLE {roleKind:'LEAD_SPONSOR'}]->(o) grouped by the ASSERTED_BY of r.assertionUid; masking: v.masking vs MASKING_STATED
```

- trace: both sides' locators, side by side (registry "Full Range" vs paper interquartile range for the same median; n 28 vs 30).
- bitemporal episode needed on: none (HAS_STUDY_ROLE read as-of when the design facts are included).

## CQ-AX-24

- kind: cypher (assessment read)
- pattern: the current strength assessment of claim C under a named scheme, with inputs and assessor; no stored strength attribute exists to read instead.

```cypher
MATCH (c:Claim {uid: $claim})<-[:ASSESSES]-(q:Assessment {assessmentKind: 'QUALITY', assessmentSubkind: 'D3.evidence-strength'})
WHERE q.recordedTo IS NULL AND ($scheme IS NULL OR q.gradeScheme = $scheme)
OPTIONAL MATCH (q)-[:DERIVED_FROM]->(inp)
OPTIONAL MATCH (q)-[:WAS_GENERATED_BY]->(:Activity)-[:WAS_ASSOCIATED_WITH]->(ag:Agent)
RETURN q.gradeScheme AS scheme, q.grade AS level, q.certainty, q.facets AS criteria, q.summary, q.methodVersion,
       ag.uid AS assessor, collect(DISTINCT inp.uid) AS inputs, q.supersedesUid
```

- trace: inputs' locators; empty result means "not assessed", never a default level. Filterable in GraphQL on `gradeScheme` (GRADE, OCEBM-2011, …), `grade` and `certainty`; criteria as registered facets (`downgrade=imprecision`, `downgrade=risk-of-bias`).
- bitemporal episode needed on: none.

## Q-D3-16

- kind: cypher
- pattern: union of outcome keys registered in any version minus keys with any result or any publication declaration, and the reverse.

```cypher
MATCH (s:Study {uid: $study})-[rv:HAS_REGISTRATION_VERSION]->(v:RegistrationVersion) WHERE ASOF(rv)
MATCH (s)-[:HAS_OUTCOME]->(od:OutcomeDefinition)-[st:STATED_IN]->(v) WHERE ASOF(st)
WITH s, collect(DISTINCT od.outcomeKey) AS registered
OPTIONAL MATCH (s)-[:HAS_OUTCOME]->(od2:OutcomeDefinition)<-[:RESULT_FOR]-(:StudyResult)
WITH s, registered, collect(DISTINCT od2.outcomeKey) AS withResults
OPTIONAL MATCH (s)-[:HAS_OUTCOME]->(od3:OutcomeDefinition)-[:STATED_IN]->(:Publication)
WITH registered, withResults, collect(DISTINCT od3.outcomeKey) AS publishedDeclared
RETURN [k IN registered WHERE NOT k IN withResults AND NOT k IN publishedDeclared] AS registeredNeverReported,
       [k IN withResults + publishedDeclared WHERE NOT k IN registered] AS reportedNeverRegistered
```

- trace: `STATED_IN` locators on both sides; caveat that outcomeKey normalization can split or merge outcomes (09-reasoning risks) and that absence needs complete captures.
- bitemporal episode needed on: **HAS_REGISTRATION_VERSION** (versions as recorded at `$recAt`).

## Q-D3-17

- kind: cypher (+ fulltext for cross-study exclusion search)
- pattern: populations per kind and stating record, with criteria text.

```cypher
MATCH (s:Study {uid: $study})-[:HAS_POPULATION]->(pop:StudyPopulation)-[st:STATED_IN]->(rec)
WHERE ASOF(st)
RETURN pop.populationKind, pop.analysisSet, pop.size, pop.sexScope, pop.minAgeYears, pop.maxAgeYears, pop.healthyVolunteers,
       pop.ncbiTaxonId, pop.eligibilityCriteriaText, pop.enrichmentText, labels(rec)[0] AS statedIn, TRACE(st)
ORDER BY CASE pop.populationKind WHEN 'ELIGIBLE' THEN 0 WHEN 'ENROLLED' THEN 1 WHEN 'RANDOMIZED' THEN 2 ELSE 3 END
// cross-study: CALL db.index.fulltext.queryNodes('d3_population_criteria', 'anticoagulant*') YIELD node, score ...
```

- trace: CTG `eligibilityModule` JSON pointer; ISRCTN participant inclusion/exclusion criteria spans.
- bitemporal episode needed on: none.

## Q-D3-18

- kind: cypher
- pattern: studies whose registry history reaches TERMINATED / SUSPENDED / WITHDRAWN (first valid date), registry reason, paper-stated reason and interim statements.

```cypher
MATCH (s:Study)-[rv:HAS_REGISTRATION_VERSION]->(v:RegistrationVersion)
WHERE ASOF(rv) AND v.overallStatus IN ['TERMINATED', 'SUSPENDED', 'WITHDRAWN']
WITH s, min(rv.validFrom) AS stoppedAt, collect(v.whyStopped) AS registryReasons
OPTIONAL MATCH (why:Assertion {predicate: 'STOPPED_EARLY_REASON'})-[:HAS_SUBJECT]->(s) WHERE LIVE(why)
OPTIONAL MATCH (s)<-[:REPORTS_ON]-(p:Publication)
RETURN s.uid, stoppedAt, registryReasons, why.valueString AS paperReason, collect(DISTINCT p.uid) AS reports
UNION
MATCH (why:Assertion {predicate: 'STOPPED_EARLY_REASON'})-[:HAS_SUBJECT]->(s:Study) WHERE LIVE(why)     // stopped early but registry says COMPLETED (ASPREE)
RETURN s.uid, why.validFrom AS stoppedAt, [] AS registryReasons, why.valueString AS paperReason, [] AS reports
```

- trace: CTG `statusModule.whyStopped`; NEJM ASPREE "terminated at a median of 4.7 years of follow-up … no benefit" locator.
- bitemporal episode needed on: **HAS_REGISTRATION_VERSION** (status as of each version's valid time).
