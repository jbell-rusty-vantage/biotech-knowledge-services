# Query patterns — candidate v2

Synthesizer stage S (query patterns), fast-track 2026-10-08/09. Candidate, not final: nothing here is accepted until the owner accepts it on measurements and fixtures.

These are the canonical query shapes of the assembled candidate `final/schema/final_biotech_schema_v2.graphql` (IR digest `sha256:c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793` since the fix stage, which added the R-49 cache properties and reworded the claim-occurrence docstring with no label, type or relationship change; first validated on `sha256:d233930272c7…d705`; 69 node types and 106 relationship types read from `final_biotech_schema_v2.ir.json`; 64 asserted, 7 derived and 35 structural relationship types by `relClass`). Size numbers are in `size-report.md`. Every label, relationship type and property below is a name of the assembled schema, not the pinned v1 proposal. Each pattern names the packet questions it serves. The packet patterns (`packets/*/03-retrieval-patterns.md`) remain the per-question detail. Where a packet pattern still uses a pre-synthesis name (`ClaimOccurrence`, `RECOMMENDS_AGAINST` with a Target object, `$($label)` lookups), the form here wins.

**Validation.** Every `cypher` block below was run on the disposable Neo4j 5.26.31 Community (+APOC, no GDS) by `final/_work/validate-patterns.mjs`. DDL blocks were executed. Query statements were run with `EXPLAIN` and typed parameters. Projection statements in the GDS section were run with `EXPLAIN` after their `gds.graph.project(...)` call was rewritten to a list. `CALL gds.*` statements could not run. The per-pattern result is the `validation:` line under each block. The full output, including the plan operators of each statement, is in `_runlog/patterns.md`. The statement and pass counts are in the summary at the end of this file. An empty database only raises `UnknownLabel`, `UnknownRelationshipType` and `UnknownPropertyKey` warnings, and those are expected.

## Conventions used by every pattern

- **Dialect.** Cypher 5, and every form used is also valid Cypher 25. Neo4j 5.26 rejects a `CYPHER 25` prefix ("25 is not a valid option for cypher version"), so the blocks carry none, and a deployment on Neo4j 2025.x or later may add it. The patterns use quantified path patterns (`-[:R]->{1,4}`), `CALL (x) { … }`, `COLLECT { … }`, `COUNT { … }` and `EXISTS { … }`. Vector search uses `db.index.vector.queryNodes` because the `SEARCH` clause needs Neo4j 2026.01+. That procedure is deprecated from 2026.04, and its `SEARCH` equivalent is given in prose under P-04a.
- **Labels (assembled IR).**
  - Every type that implements `Subjectable` carries its own label plus `Entity`, and so does `Identifier` (R-17).
  - `Activity` and `CaptureAttempt` carry `Occurrence`.
  - `SourceSnapshot`, `SourceLocator`, `Report` and `ReportItem` carry `InformationArtifact`.
  - `Adjudication` and `Assessment` carry `EvidenceAssessment`.
  - `Assertion`, `Chunk`, `Association` and `MechanismEvidenceContext` carry only their own label. A claim occurrence is an `Assertion` with `assertionKind: 'CLAIM'` and no extra label (ruling F-05 in decision-report; the kernel docstring and the claim fixture loader no longer write `ClaimOccurrence`).
- **Entry by uid.** A pattern that starts from "any entity X" matches `(x:Entity {uid: $uid})`, which seeks through the `entity_uid` constraint (D-1). The kernel's `MATCH (x:$($label) {uid: $uid})` was measured on 5.26.31: it plans `AllNodesScan` + `Filter`, while a static label plans `NodeUniqueIndexSeek`. The static `Entity` label replaces it. Kernel records (Assertion, Report, Activity …) are always matched by their own label.
- **AS-OF(x)** (recorded time, any record with `recordedAt`/`recordedTo`: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion): `x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf)`. "Current" is `x.recordedTo IS NULL`. **EPISODE-AT(r)** on an asserted edge: the same with `r.recordedFrom`.
- **VALID-AT(x, $V)** (valid time; half-open; a null bound is *unknown*, never "ongoing", and is returned flagged): `(x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V)`. Valid time is on the Assertion and on 26 relationship types whose edge properties carry `validFrom` + `recordedFrom`: ASSIGNED_TO, BRANDED_AS, CONTENT_SPONSORED_BY, COVERS, HAS_EDITION, HAS_IDENTIFIER, HAS_LABEL_VERSION, HAS_REFERENCE_FOOD, HAS_REGISTRATION_VERSION, HAS_STUDY_ROLE, HOLDS_ROLE, HOLDS_STAKE, IN_FOOD_CATEGORY, INCLUDES_TEST, LICENSED_TO, LISTING_FOR, MATERIAL_CONTAINS, MEASURES_METRIC, OWNS_BRAND, PARENT_OF, PARENT_TAXON, PERFORMED_WITH_VERSION, RECEIVES_VALUE_FROM, RUNS_ON_DEVICE, SELLER_OF_RECORD and STATUS_OF. Another 37 types carry recorded time only (`recordedFrom`/`recordedTo`).
- **KIND(x)** is `[lbl IN labels(x) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0]`. Label order is not guaranteed, so `labels(x)[0]` is wrong. In the smoke run on the cross-domain fixture graph, `labels(who)[0]` returned `Entity` for an Organization asserter and `EvidenceAssessment` for an Adjudication. The packet patterns that use `labels(x)[0]` (K Q-K-04 … Q-K-07, D10 CQ-EV-02 and others) carry the same defect.
- **TRACE(a)**, the citation chain every answer row carries (directive 3.8, 3.10), is P-01b. Answers cite `SourceLocator` + `SourceSnapshot.contentHash`, never a `Chunk`, a `MENTIONS` edge or an `Association`.
- **Asserted edge → its Assertion.** Every asserted edge carries `assertionUid` (63 types, all indexed) and `lastWriterRunId` (97 types, all indexed). `MATCH (a:Assertion {uid: r.assertionUid})` resolves an edge to its authorizing Assertion through `uid_Assertion`.

## 0. Constraints and indexes the patterns rely on

R-04 puts fulltext and vector indexes in deployment DDL, not in the SDL. This section is that DDL for the query patterns. It has four parts:

- **D-1**: hand-chosen constraints and range indexes.
- **D-2**: generated mechanically from the IR by `final/_work/gen-patterns-ddl.mjs` into `final/_work/patterns-ddl.cypher`. That file holds 229 statements: one `uid` uniqueness constraint per node type (69), 63 `assertionUid` and 97 `lastWriterRunId` relationship-property indexes. The validator executes it before D-1.
- **D-3**: fulltext indexes.
- **D-4**: vector indexes.

The migration notes should adopt this section and the generated file as the deployment index plan.

```cypher
// @ddl D-1 kernel and pattern constraints and range indexes
CREATE CONSTRAINT entity_uid IF NOT EXISTS FOR (n:Entity) REQUIRE n.uid IS UNIQUE;
CREATE CONSTRAINT activity_run IF NOT EXISTS FOR (n:Activity) REQUIRE (n.externalRunSystem, n.runId) IS UNIQUE;
CREATE CONSTRAINT claim_proposition_hash IF NOT EXISTS FOR (n:Claim) REQUIRE n.propositionHash IS UNIQUE;
CREATE CONSTRAINT identifier_key IF NOT EXISTS FOR (n:Identifier) REQUIRE (n.scheme, n.issuer, n.value) IS UNIQUE;
CREATE CONSTRAINT target_key IF NOT EXISTS FOR (n:Target) REQUIRE n.key IS UNIQUE;
CREATE CONSTRAINT frontier_key IF NOT EXISTS FOR (n:Frontier) REQUIRE n.key IS UNIQUE;
CREATE CONSTRAINT use_constraint_identity IF NOT EXISTS FOR (n:UseConstraint) REQUIRE n.identityKeyHash IS UNIQUE;
CREATE INDEX activity_run_id IF NOT EXISTS FOR (n:Activity) ON (n.runId);
CREATE INDEX activity_mission IF NOT EXISTS FOR (n:Activity) ON (n.missionId);
CREATE INDEX activity_kind IF NOT EXISTS FOR (n:Activity) ON (n.activityKind);
CREATE INDEX assertion_predicate IF NOT EXISTS FOR (n:Assertion) ON (n.predicate, n.status);
CREATE INDEX assertion_speech_act IF NOT EXISTS FOR (n:Assertion) ON (n.speechAct, n.predicate);
CREATE INDEX assertion_recorded IF NOT EXISTS FOR (n:Assertion) ON (n.recordedAt);
CREATE INDEX assertion_recorded_to IF NOT EXISTS FOR (n:Assertion) ON (n.recordedTo);
CREATE INDEX assertion_writer IF NOT EXISTS FOR (n:Assertion) ON (n.lastWriterRunId);
CREATE INDEX assessment_kind IF NOT EXISTS FOR (n:Assessment) ON (n.assessmentKind, n.disposition);
CREATE INDEX assessment_recorded_to IF NOT EXISTS FOR (n:Assessment) ON (n.recordedTo);
CREATE INDEX adjudication_kind IF NOT EXISTS FOR (n:Adjudication) ON (n.adjudicationKind);
CREATE INDEX report_kind IF NOT EXISTS FOR (n:Report) ON (n.reportKind);
CREATE INDEX report_supersedes IF NOT EXISTS FOR (n:Report) ON (n.supersedesUid);
CREATE INDEX claim_refines IF NOT EXISTS FOR (n:Claim) ON (n.refinesClaimUid);
CREATE INDEX snapshot_revision IF NOT EXISTS FOR (n:SourceSnapshot) ON (n.revisionKind);
CREATE INDEX locator_reanchors IF NOT EXISTS FOR (n:SourceLocator) ON (n.reanchorsLocatorUid);
CREATE INDEX chunk_text_version IF NOT EXISTS FOR (n:Chunk) ON (n.textVersionHash);
CREATE INDEX association_anchor IF NOT EXISTS FOR (n:Association) ON (n.associationKind, n.anchorUid);
CREATE INDEX criterion_set IF NOT EXISTS FOR (n:DecisionCriterion) ON (n.criteriaSetKey, n.criteriaSetVersion);
CREATE INDEX target_parent IF NOT EXISTS FOR (n:Target) ON (n.parentKey);
CREATE INDEX frontier_parent IF NOT EXISTS FOR (n:Frontier) ON (n.parentKey);
CREATE INDEX event_kind_started IF NOT EXISTS FOR (n:Event) ON (n.eventKind, n.startedAt);
CREATE INDEX event_announced IF NOT EXISTS FOR (n:Event) ON (n.announcedAt);
CREATE INDEX media_work_published IF NOT EXISTS FOR (n:MediaWork) ON (n.publishedAt);
CREATE INDEX capture_subject IF NOT EXISTS FOR (n:CaptureAttempt) ON (n.subjectUid);
```

- validation: executed on Neo4j 5.26.31 community. The first run accepted 32 of 32 statements; the database held 0 nodes before it. The final run accepted 31 of 32: `identifier_key` (D-1#4) was rejected (ConstraintCreationFailed) by duplicate Identifier keys in the fixture graph another S agent had loaded into the shared instance (Q-7). See _runlog/patterns.md.

The fulltext indexes keep the packet names because the packet patterns call them by name. There is one exception. D9's `occurrence_proposition` on the retired `ClaimOccurrence` label becomes `assertion_proposition` on `Assertion`, because a claim occurrence is an `Assertion` with `OCCURRENCE_OF` in the assembled schema. `d2_names` is a synthesizer addition: no packet declared a name index for Mechanism, MolecularEntity, Condition and Outcome, and P-12 enters by mechanism name. Two caveats apply:

- **List properties.** Fulltext on list properties (`synonyms`) indexes string lists on the versions that support them. D13's note says to project `synonymsText` otherwise.
- **Unverified indexing.** The disposable run proves only that the DDL is accepted. It does not prove that list values are indexed.

```cypher
// @ddl D-3 fulltext indexes (entry by text)
CREATE FULLTEXT INDEX claim_proposition IF NOT EXISTS FOR (n:Claim) ON EACH [n.proposition];
CREATE FULLTEXT INDEX assertion_proposition IF NOT EXISTS FOR (n:Assertion) ON EACH [n.proposition];
CREATE FULLTEXT INDEX chunk_text IF NOT EXISTS FOR (n:Chunk) ON EACH [n.text];
CREATE FULLTEXT INDEX d1_identity_fulltext IF NOT EXISTS FOR (n:ChemicalSubstance|IngredientMaterial|Constituent|Taxon) ON EACH [n.name, n.searchText];
CREATE FULLTEXT INDEX d2_names IF NOT EXISTS FOR (n:Mechanism|MolecularEntity|Condition|Outcome) ON EACH [n.name, n.key, n.synonyms, n.geneSymbol];
CREATE FULLTEXT INDEX d4_measure_names IF NOT EXISTS FOR (n:Metric|Biomarker|AlgorithmVersion|LabTest|Device) ON EACH [n.name, n.searchText, n.algorithmFamily];
CREATE FULLTEXT INDEX TargetSearch IF NOT EXISTS FOR (n:Target) ON EACH [n.label, n.definition, n.synonyms];
CREATE FULLTEXT INDEX FrontierSearch IF NOT EXISTS FOR (n:Frontier) ON EACH [n.name, n.definition, n.synonyms];
CREATE FULLTEXT INDEX orgBrandNames IF NOT EXISTS FOR (n:Organization|Brand) ON EACH [n.name, n.legalName];
CREATE FULLTEXT INDEX product_text IF NOT EXISTS FOR (n:Product) ON EACH [n.name, n.marketedName];
CREATE FULLTEXT INDEX food_item_search IF NOT EXISTS FOR (n:FoodItem) ON EACH [n.name, n.descriptionVerbatim, n.synonyms, n.brandNameVerbatim];
CREATE FULLTEXT INDEX dietary_pattern_search IF NOT EXISTS FOR (n:DietaryPattern) ON EACH [n.name, n.synonyms, n.definitionVerbatim];
CREATE FULLTEXT INDEX reg_record_lot_text IF NOT EXISTS FOR (n:RegulatoryRecord) ON EACH [n.lotCodesVerbatim, n.productDescriptionVerbatim];
CREATE FULLTEXT INDEX media_work_title IF NOT EXISTS FOR (n:MediaWork) ON EACH [n.name];
```

- validation: executed on Neo4j 5.26.31 community (14 of 14 statements accepted)

The vector properties are database-only and executor-set. They are not GraphQL fields (R-04), and `Chunk.embeddingModel` records the model. No packet pins an embedding model, so 1536 dimensions is D9's placeholder and must equal the chosen model's output (open question Q-1 below).

The 2026.01+ form adds in-index filter properties, for example `WITH [c.language, c.textBasis, c.workUid, c.channelUid, c.publishedAt]` (D9). Neo4j 5.26 does not accept that form, and the patterns post-filter instead. D12's `food_item_embedding` is a 2026.01+ fallback only and is not created.

```cypher
// @ddl D-4 vector indexes
CREATE VECTOR INDEX chunk_embedding IF NOT EXISTS FOR (c:Chunk) ON (c.embedding) OPTIONS { indexConfig: { `vector.dimensions`: 1536, `vector.similarity_function`: 'cosine' } };
CREATE VECTOR INDEX metric_embedding IF NOT EXISTS FOR (m:Metric) ON (m.embedding) OPTIONS { indexConfig: { `vector.dimensions`: 1536, `vector.similarity_function`: 'cosine' } };
CREATE VECTOR INDEX mechanism_embedding IF NOT EXISTS FOR (m:Mechanism) ON (m.descriptionEmbedding) OPTIONS { indexConfig: { `vector.dimensions`: 1536, `vector.similarity_function`: 'cosine' } };
```

- validation: executed on Neo4j 5.26.31 community (3 of 3 statements accepted)

## P-01 Provenance trace: answer → assertion → locator → snapshot → adjudication → activity

Questions: Q-K-01, Q-K-20, CQ-AX-01, CQ-AX-07; directive 3.8, 3.10.

**P-01a. From a published answer or report.** The report cites its Assertions directly or through Assessments (`DERIVED_FROM`, up to three hops) and through its items. Each Assertion leads to its locators, its snapshot bytes and source, its asserter, its producing runs, and its current adjudications with their verification run. The `reselectsSameSpan` field shows the verifier citing the same span with the same expected digest.

```cypher
// @id P-01a
MATCH (r:Report {uid: $answerUid})
OPTIONAL MATCH (r)-[:WAS_GENERATED_BY]->(composer:Activity)
CALL (r) {
  MATCH (r)-[:DERIVED_FROM]->{1,3}(a:Assertion) RETURN a
  UNION
  MATCH (r)-[:HAS_ITEM]->(:ReportItem)-[:DERIVED_FROM]->{1,3}(a:Assertion) RETURN a
}
MATCH (a)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
RETURN r.reportKind, r.policyVersion, r.ledgerDigest, composer.runId AS composedByRun,
       a.uid AS assertionUid, a.predicate, a.status, [lbl IN labels(who) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS asserterKind, who.uid AS asserterUid,
       ev.role, ev.origin, loc.uid AS locatorUid, loc.selectorKind, loc.selectorDigest, loc.exact, loc.page,
       loc.startOffset, loc.endOffset, loc.mediaStartSeconds,
       snap.contentHash, snap.contentHashBasis, snap.retrievedAt, snap.storageUri, src.canonicalUri,
       COLLECT { MATCH (a)-[:WAS_GENERATED_BY]->(p:Activity) RETURN p.runId } AS producingRuns,
       COLLECT { MATCH (adj:Adjudication)-[:ASSESSES]->(a) WHERE adj.recordedTo IS NULL
                 OPTIONAL MATCH (adj)-[:WAS_GENERATED_BY]->(vrun:Activity)
                 RETURN adj {.adjudicationKind, .verdict, .policyOutcome, .judgeKind, .methodVersion,
                             verificationRun: vrun.runId, bundleDigest: vrun.bundleDigest,
                             reselectsSameSpan: EXISTS { MATCH (adj)-[e2:HAS_EVIDENCE]->(loc)
                                                         WHERE e2.expectedSelectedContentDigest = ev.expectedSelectedContentDigest }} } AS adjudications
ORDER BY assertionUid, ev.role
LIMIT 500
```

- validation: EXPLAIN ok on Neo4j 5.26.31
- as-of: add AS-OF on `a` and on `adj` (`$asOf` in place of "current") to see what the record said at a given recorded time. A Report is insert-only and is current at `$asOf` when no Report with `supersedesUid = r.uid` and `recordedAt <= $asOf` exists.
- answer kind: retrieved. The sentence-level map (which sentence rests on which citation) lives in the sealed ledger, `Report.ledgerDigest`, plus `ReportItem.bodyStartOffset`/`bodyEndOffset`.

**P-01b. TRACE(a): one assertion down to bytes.** This is the fragment every other pattern means by "trace".

```cypher
// @id P-01b
MATCH (a:Assertion {uid: $assertionUid})
MATCH (a)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
OPTIONAL MATCH (a)-[:OCCURS_IN]->(work:MediaWork)
RETURN a.uid, a.predicate, a.status, a.assertionKind, [lbl IN labels(who) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS asserterKind, who.uid AS asserterUid,
       work.uid AS container, ev.role, ev.origin, ev.authority, ev.independence,
       loc.selectorKind, loc.selectorJson, loc.selectorDigest, loc.exact, loc.quoteHash,
       snap.contentHash, snap.contentHashBasis, snap.retrievedAt, snap.observedAt, snap.storageUri, src.canonicalUri,
       COLLECT { MATCH (adj:Adjudication)-[:ASSESSES]->(a) WHERE adj.recordedTo IS NULL
                 RETURN adj {.uid, .adjudicationKind, .verdict, .policyOutcome, .methodVersion} } AS adjudications,
       COLLECT { MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity)
                 RETURN act {.missionId, .runId, .activityKind, .startedAt} } AS runs
ORDER BY ev.role
```

- validation: EXPLAIN ok on Neo4j 5.26.31

**P-01c. Audit: accepted assertions that break the chain** (CQ-AX-07). This finds accepted, current assertions with no locator, no adjudication, a snapshot that cannot be reproduced, or no lineage.

```cypher
// @id P-01c
MATCH (a:Assertion {status: 'ACCEPTED'})
WHERE a.recordedTo IS NULL
WITH a,
     NOT EXISTS { (a)-[:HAS_EVIDENCE]->(:SourceLocator) } AS noLocator,
     NOT EXISTS { (a)<-[:ASSESSES]-(:Adjudication) } AS noAdjudication,
     EXISTS { MATCH (a)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)
              WHERE s.storageUri IS NULL AND s.archiveUri IS NULL } AS irreproducible,
     NOT EXISTS { (a)-[:WAS_GENERATED_BY]->(:Activity) } AS noLineage
WHERE noLocator OR noAdjudication OR irreproducible OR noLineage
RETURN a.uid, a.predicate, noLocator, noAdjudication, irreproducible, noLineage
LIMIT 500
```

- validation: EXPLAIN ok on Neo4j 5.26.31

## P-02 As-of and diff: valid time vs recorded time

Questions: Q-K-02, CQ-TM-02, CQ-TM-03, Q-D10-12; 00-DIRECTIVE rule 9.

Recorded time answers "what did the graph believe at R". Valid time answers "what was true in the world at V". Nothing is deleted:

- A closed record keeps `recordedTo`, and its successor names it in `supersedesUid`.
- A closed episode keeps `recordedTo` on the edge.

**P-02a. What we believed about X at recorded time R, for the validity window [V1, V2).**

```cypher
// @id P-02a
MATCH (x:Entity {uid: $uid})<-[:HAS_SUBJECT|HAS_OBJECT]-(a:Assertion)
WHERE a.recordedAt <= $R AND (a.recordedTo IS NULL OR a.recordedTo > $R)
  AND (a.validFrom IS NULL OR a.validFrom < $V2) AND (a.validTo IS NULL OR a.validTo > $V1)
RETURN a.uid, a.predicate, a.valueString, a.valueNumber, a.unitCode, a.status,
       a.validFrom, a.validTo, a.validFromBasis, a.validObservedAt, a.recordedAt, a.recordedTo,
       (a.validFrom IS NULL OR a.validTo IS NULL) AS validityPartlyUnknown
ORDER BY a.predicate, a.validFrom
LIMIT 200
```

- validation: EXPLAIN ok on Neo4j 5.26.31

**P-02b. X's typed edges as episodes at R and [V1, V2).** The pattern is anchored on X, and every asserted edge type carries `assertionUid`. A recorded-only type has no `validFromBasis`, so its validity is reported as `RECORDED_ONLY`, never as "always".

```cypher
// @id P-02b
MATCH (x:Entity {uid: $uid})-[r]-(y)
WHERE r.assertionUid IS NOT NULL
  AND r.recordedFrom <= $R AND (r.recordedTo IS NULL OR r.recordedTo > $R)
  AND (r.validFrom IS NULL OR r.validFrom < $V2) AND (r.validTo IS NULL OR r.validTo > $V1)
RETURN type(r) AS relType, startNode(r) = x AS outgoing, y.uid AS otherUid,
       CASE WHEN r.validFromBasis IS NULL THEN 'RECORDED_ONLY' ELSE 'BITEMPORAL' END AS episodeKind,
       r.validFrom, r.validTo, r.validFromBasis, r.recordedFrom, r.recordedTo, r.assertionUid, r.lastWriterRunId
ORDER BY relType, r.validFrom
LIMIT 200
```

- validation: EXPLAIN ok on Neo4j 5.26.31

**P-02c. Late-arriving fact: true at V, not yet known at R** (CQ-TM-02).

```cypher
// @id P-02c
MATCH (a:Assertion {uid: $assertionUid})
RETURN a.uid, a.predicate, a.validFrom, a.validTo, a.validFromBasis, a.recordedAt, a.recordedTo,
       (a.recordedAt <= $R AND (a.recordedTo IS NULL OR a.recordedTo > $R)) AS knownAtR,
       CASE WHEN a.validFrom IS NULL THEN null
            ELSE a.validFrom <= $V AND (a.validTo IS NULL OR a.validTo > $V) END AS trueAtV
```

- validation: EXPLAIN ok on Neo4j 5.26.31

**P-02d. What changed about X between recorded dates D1 and D2** (`$R1`, `$R2`). The pattern lists records and episodes opened or closed in (D1, D2]: assertions, assessments, adjudications, reports, and asserted episodes on X's own edges.

```cypher
// @id P-02d
MATCH (x:Entity {uid: $uid})
CALL (x) {
  MATCH (x)<-[:HAS_SUBJECT|HAS_OBJECT]-(a:Assertion)
  WHERE (a.recordedAt > $R1 AND a.recordedAt <= $R2) OR (a.recordedTo > $R1 AND a.recordedTo <= $R2)
  RETURN 'ASSERTION' AS kind, a.uid AS uid, a.predicate AS what, a.recordedAt AS opened, a.recordedTo AS closed, a.supersedesUid AS basis
  UNION
  MATCH (x)<-[:ASSESSES]-(s:Assessment)
  WHERE (s.recordedAt > $R1 AND s.recordedAt <= $R2) OR (s.recordedTo > $R1 AND s.recordedTo <= $R2)
  RETURN 'ASSESSMENT' AS kind, s.uid AS uid, s.assessmentKind AS what, s.recordedAt AS opened, s.recordedTo AS closed, s.supersedesUid AS basis
  UNION
  MATCH (x)<-[:HAS_SUBJECT|HAS_OBJECT]-(:Assertion)<-[:ASSESSES]-(adj:Adjudication)
  WHERE (adj.recordedAt > $R1 AND adj.recordedAt <= $R2) OR (adj.recordedTo > $R1 AND adj.recordedTo <= $R2)
  RETURN 'ADJUDICATION' AS kind, adj.uid AS uid, adj.verdict AS what, adj.recordedAt AS opened, adj.recordedTo AS closed, adj.supersedesUid AS basis
  UNION
  MATCH (x)<-[:ASSESSES]-(rep:Report)
  WHERE rep.recordedAt > $R1 AND rep.recordedAt <= $R2
  RETURN 'REPORT' AS kind, rep.uid AS uid, rep.reportKind AS what, rep.recordedAt AS opened, rep.recordedTo AS closed, rep.supersedesUid AS basis
  UNION
  MATCH (x)-[e]-()
  WHERE e.assertionUid IS NOT NULL
    AND ((e.recordedFrom > $R1 AND e.recordedFrom <= $R2) OR (e.recordedTo > $R1 AND e.recordedTo <= $R2))
  RETURN 'EPISODE' AS kind, e.relationshipUid AS uid, type(e) AS what, e.recordedFrom AS opened, e.recordedTo AS closed, e.assertionUid AS basis
}
RETURN kind, uid, what, opened, closed, basis,
       CASE WHEN opened > $R1 AND opened <= $R2 AND closed IS NOT NULL AND closed <= $R2 THEN 'OPENED_AND_CLOSED'
            WHEN opened > $R1 AND opened <= $R2 THEN 'OPENED'
            ELSE 'CLOSED' END AS change
ORDER BY coalesce(opened, closed)
```

- validation: EXPLAIN ok on Neo4j 5.26.31
- `basis` is the predecessor (`supersedesUid`) for records and the authorizing Assertion for episodes. "Since my last report" sets `$R1 = report.recordedAt`.

**P-02e. What became true or stopped being true between valid times V1 and V2**, read with current knowledge. This is the valid-time half of the diff.

```cypher
// @id P-02e
MATCH (x:Entity {uid: $uid})<-[:HAS_SUBJECT|HAS_OBJECT]-(a:Assertion)
WHERE a.recordedTo IS NULL AND a.status IN ['ACCEPTED', 'DISPUTED']
WITH a,
     (a.validFrom IS NULL OR a.validFrom <= $V1) AND (a.validTo IS NULL OR a.validTo > $V1) AS atV1,
     (a.validFrom IS NULL OR a.validFrom <= $V2) AND (a.validTo IS NULL OR a.validTo > $V2) AS atV2
WHERE atV1 <> atV2
RETURN a.uid, a.predicate, a.valueString, a.valueNumber, a.validFrom, a.validTo, a.validFromBasis,
       CASE WHEN atV2 THEN 'BECAME_TRUE' ELSE 'CEASED' END AS change
ORDER BY coalesce(a.validFrom, a.validTo)
```

- validation: EXPLAIN ok on Neo4j 5.26.31

## P-03 Applicability: does study S apply to use context U

Questions: CQ-EV-04 (D3, and D5's variant), CQ-RC-02.

Applicability is a kernel `Assessment` of kind `APPLICABILITY`. It ASSESSES both the Study and the use context (a D6 ProductVariant, a D5 Intervention, Protocol or ProtocolStep). Its dimension children (`assessmentSubkind: 'D3.applicability.dimension'`, one per form, dose, schedule, duration, population and outcome) cite their input assertions. The weakest dimension comes first.

```cypher
// @id P-03
MATCH (app:Assessment {assessmentKind: 'APPLICABILITY'})-[:ASSESSES]->(:Study {uid: $studyUid})
MATCH (app)-[:ASSESSES]->(use:Entity {uid: $useContextUid})
WHERE app.recordedTo IS NULL
MATCH (app)-[:DERIVED_FROM]->(dim:Assessment {assessmentKind: 'APPLICABILITY', assessmentSubkind: 'D3.applicability.dimension'})
WHERE dim.recordedTo IS NULL
RETURN app.uid, app.conclusionCode AS overall, app.methodVersion,
       [f IN coalesce(app.facets, []) WHERE f STARTS WITH 'contextOfUse=' | substring(f, 13)] AS contextOfUse,
       [lbl IN labels(use) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS useKind,
       [f IN coalesce(dim.facets, []) WHERE f STARTS WITH 'dimension=' | substring(f, 10)][0] AS dimension,
       dim.conclusionCode AS dimensionVerdict, dim.score AS ratio, dim.summary,
       [f IN coalesce(dim.facets, []) WHERE f STARTS WITH 'missing=' | substring(f, 8)] AS missingFacts,
       COLLECT { MATCH (dim)-[:DERIVED_FROM]->(inp:Assertion) RETURN inp.uid } AS inputs,
       COLLECT { MATCH (dim)-[ev:HAS_EVIDENCE]->(loc:SourceLocator) RETURN {role: ev.role, exact: loc.exact} } AS evidence
ORDER BY CASE dimensionVerdict WHEN 'DOES_NOT_APPLY' THEN 0 WHEN 'UNKNOWN_MISSING_FACTS' THEN 1
                               WHEN 'APPLIES_WITH_ADJUSTMENT' THEN 2 ELSE 3 END
```

- validation: EXPLAIN ok on Neo4j 5.26.31
- trace: each input → P-01b. The dose ratio is the method's own number (`dim.score`), and its dimension inputs are the `STATED_IN` assertions of the InterventionComponent and StudyPopulation and the D6 label assertions.

## P-04 Unstructured to entity (directive 3.8): question → chunk → assertion → locator → snapshot bytes

Questions: Q-K-14, Q-D10-17, Q-D9-21, Q-D11-03, Q-D13-05; every domain's 3.8 fixture.

The path has four steps:

1. A chunk is found by the vector index, by `MENTIONS` or by BM25. A chunk is a retrieval structure under a snapshot (`CHUNK_OF`) and is never a locator.
2. The derived `COVERS_LOCATOR` (span overlap) leads to the `SourceLocator` that an accepted Assertion cites through `HAS_EVIDENCE`.
3. The locator leads to its snapshot bytes (`contentHash`, `storageUri`).
4. The verifier re-selects the same `selectorJson` on the same bytes. The check is a current CAPTURE_FIDELITY or SUPPORT Adjudication citing the same locator with the same `expectedSelectedContentDigest`.

`MENTIONS` and `COVERS_LOCATOR` are never cited (R-27).

**P-04a. Vector entry.** The 2026.01+ form is `MATCH (c:Chunk) SEARCH c IN (VECTOR INDEX chunk_embedding FOR $questionEmbedding WHERE c.language = $language LIMIT $k) SCORE AS score`. It is not validated here, because 5.26 has no `SEARCH` clause.

```cypher
// @id P-04a
CALL db.index.vector.queryNodes('chunk_embedding', $k, $questionEmbedding) YIELD node AS c, score
WITH c, score WHERE $language IS NULL OR c.language = $language
MATCH (c)-[:CHUNK_OF]->(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
MATCH (c)-[:COVERS_LOCATOR]->(loc:SourceLocator)<-[ev:HAS_EVIDENCE]-(a:Assertion)
WHERE (snap)-[:HAS_LOCATOR]->(loc)
  AND ev.role IN ['SUPPORTS', 'QUALIFIES'] AND a.status = 'ACCEPTED' AND a.recordedTo IS NULL
RETURN score, c.uid AS chunkUid, c.chunkIndex, a.uid AS assertionUid, a.predicate,
       COLLECT { MATCH (a)-[:HAS_SUBJECT|HAS_OBJECT]->(e) RETURN e.uid } AS entities,
       loc.uid AS locatorUid, loc.exact, loc.selectorDigest, snap.contentHash, snap.storageUri, src.canonicalUri,
       COLLECT { MATCH (adj:Adjudication)-[:ASSESSES]->(a)
                 WHERE adj.recordedTo IS NULL AND adj.adjudicationKind IN ['CAPTURE_FIDELITY', 'SUPPORT']
                 MATCH (adj)-[e2:HAS_EVIDENCE]->(loc)
                 RETURN {adjudication: adj.uid, kind: adj.adjudicationKind, verdict: adj.verdict,
                         sameDigest: e2.expectedSelectedContentDigest = ev.expectedSelectedContentDigest} } AS reselection
ORDER BY score DESC
LIMIT 50
```

- validation: EXPLAIN ok on Neo4j 5.26.31

**P-04b. MENTIONS entry: chunks that the entity linker tied to X.** MENTIONS only finds candidates. The answer rows are every accepted assertion whose span the chunk covers. `aboutX` marks the ones whose subject or object is X; the rest are what else the passage says. In the fixture graph, the chunk that mentions NR chloride covers spans whose assertions are about the trial's intervention component, not about the substance itself.

```cypher
// @id P-04b
MATCH (x:Entity {uid: $entityUid})<-[m:MENTIONS]-(c:Chunk)
WHERE m.derivationRule STARTS WITH 'entity-link/'
WITH x, c, m ORDER BY m.score DESC LIMIT 50
MATCH (c)-[:COVERS_LOCATOR]->(loc:SourceLocator)<-[ev:HAS_EVIDENCE]-(a:Assertion)
WHERE a.status = 'ACCEPTED' AND a.recordedTo IS NULL
MATCH (loc)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
RETURN c.uid AS chunkUid, m.derivationRule AS linker, m.score AS linkScore, a.uid AS assertionUid, a.predicate,
       EXISTS { (a)-[:HAS_SUBJECT|HAS_OBJECT]->(x) } AS aboutX,
       ev.role, loc.exact, loc.selectorDigest, snap.contentHash
ORDER BY aboutX DESC, linkScore DESC
```

- validation: EXPLAIN ok on Neo4j 5.26.31

**P-04c. Lexical (BM25) entry over chunk text.** This is the hop the packet fixtures actually executed (D10 review note). Fulltext and vector scores are not comparable. A hybrid ranks each source on its own and fuses by rank, following `neo4j-vector-index-skill` § Hybrid.

```cypher
// @id P-04c
CALL db.index.fulltext.queryNodes('chunk_text', $queryText) YIELD node AS c, score
WITH c, score ORDER BY score DESC LIMIT 50
MATCH (c)-[:COVERS_LOCATOR]->(loc:SourceLocator)<-[ev:HAS_EVIDENCE]-(a:Assertion)
WHERE a.status = 'ACCEPTED' AND a.recordedTo IS NULL
MATCH (loc)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
RETURN score, c.uid AS chunkUid, a.uid AS assertionUid, a.predicate, loc.exact, snap.contentHash
ORDER BY score DESC
```

- validation: EXPLAIN ok on Neo4j 5.26.31

**P-04d. The verifier's re-selection request** for one assertion. This is exactly what `verification.v1` re-runs: the same `selectorJson` (its `basis` names the text projection, R-38) against the same stored bytes, expecting the same selected-content digest.

```cypher
// @id P-04d
MATCH (a:Assertion {uid: $assertionUid})-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
RETURN a.uid, ev.role, ev.origin, loc.uid AS locatorUid, loc.selectorKind, loc.selectorJson, loc.selectorDigest,
       ev.expectedSelectedContentDigest, snap.uid AS snapshotUid, snap.contentHash, snap.contentHashBasis,
       snap.canonicalProjectionHash, snap.storageUri, snap.archiveUri
```

- validation: EXPLAIN ok on Neo4j 5.26.31

**P-04e. Span-overlap fallback when `COVERS_LOCATOR` is not yet projected** (D13 note). This is valid only when the chunk's text basis (`textVersionHash`) is the projection that the locator's `selectorJson.basis` names. The query returns both so the caller can compare them.

```cypher
// @id P-04e
MATCH (c:Chunk {uid: $chunkUid})-[:CHUNK_OF]->(snap:SourceSnapshot)-[:HAS_LOCATOR]->(loc:SourceLocator)
WHERE loc.startOffset >= c.startOffset AND loc.endOffset <= c.endOffset
MATCH (loc)<-[ev:HAS_EVIDENCE]-(a:Assertion)
WHERE a.status = 'ACCEPTED' AND a.recordedTo IS NULL
RETURN a.uid, a.predicate, loc.uid AS locatorUid, loc.selectorJson, c.textVersionHash, c.chunkerVersion, snap.contentHash
```

- validation: EXPLAIN ok on Neo4j 5.26.31

## P-05 Ranking and comparison: computed, then published

Questions: Q-D10-01, Q-D10-02, CQ-RC-01, CQ-RC-02, CQ-RC-03, CQ-RC-07, Q-D1-19, Q-D6-03; directive 3.5.

A comparison is computed at query time under `DecisionCriterion@version`. It is never stored until it is published as a `Report` (reportKind `COMPARISON` or `RECOMMENDATION`), whose `ReportItem` rows (`itemKind: 'ROW'`) ASSESS exactly their option and cite their inputs through `DERIVED_FROM`.

**P-05a. Computed: the inputs per (option, criterion) for the ranking engine.** Candidates come from the caller or from P-06a. The engine evaluates BLOCK, then FILTER, then SCORE, then TIEBREAK. A missing input is `NOT_EVALUATED` with `missingFactKeys`, never zero. Rows are labeled `computed: true, published: false`.

```cypher
// @id P-05a
MATCH (c:DecisionCriterion {criteriaSetKey: $set, criteriaSetVersion: $ver})
WHERE c.recordedAt <= $asOf AND (c.recordedTo IS NULL OR c.recordedTo > $asOf)
  AND ($targetKey IS NULL OR c.targetKeys IS NULL OR $targetKey IN c.targetKeys)
WITH collect(c) AS criteria
MATCH (opt:Entity) WHERE opt.uid IN $candidateUids
UNWIND criteria AS c
RETURN opt.uid AS optionUid, opt.name, c.uid AS criterionUid, c.criterionKey, c.version, c.criterionKind, c.direction,
       c.weight, c.rule, c.evaluationOrder,
       COLLECT { MATCH (opt)<-[:HAS_SUBJECT]-(v:Assertion)
                 WHERE v.predicate IN coalesce(c.inputPredicates, []) AND v.status IN ['ACCEPTED', 'DISPUTED']
                   AND v.recordedAt <= $asOf AND (v.recordedTo IS NULL OR v.recordedTo > $asOf)
                   AND (v.validFrom IS NULL OR v.validFrom <= $validAt) AND (v.validTo IS NULL OR v.validTo > $validAt)
                 RETURN v {.uid, .predicate, .valueNumber, .valueString, .unitCode, .qualifiers, .status} } AS values,
       COLLECT { MATCH (s:Assessment)-[:ASSESSES]->(opt)
                 WHERE (s.assessmentKind + '/' + coalesce(s.assessmentSubkind, '')) IN coalesce(c.inputAssessmentKinds, [])
                   AND s.status = 'ACCEPTED' AND s.recordedAt <= $asOf AND (s.recordedTo IS NULL OR s.recordedTo > $asOf)
                 RETURN s {.uid, .verdict, .effectDirection, .score, .conclusionCode} } AS assessments,
       true AS computed, false AS published
ORDER BY optionUid, c.evaluationOrder
```

- validation: EXPLAIN ok on Neo4j 5.26.31

**P-05b. Published: the comparison current at date D**, about Target T or a set of options.

```cypher
// @id P-05b
MATCH (r:Report)-[:ASSESSES]->(subject:Entity {uid: $subjectUid})
WHERE r.reportKind IN ['COMPARISON', 'RECOMMENDATION'] AND r.recordedAt <= $asOf
  AND NOT EXISTS { MATCH (r2:Report {supersedesUid: r.uid}) WHERE r2.recordedAt <= $asOf }
OPTIONAL MATCH (r)-[:WAS_GENERATED_BY]->(act:Activity)
RETURN r.uid, r.reportKind, r.publishedAt, r.policyVersion, r.citationCompleteness, act.missionId, act.runId,
       COLLECT { MATCH (r)-[:USES_CRITERION]->(c:DecisionCriterion) RETURN c.criterionKey + '@' + c.version } AS criteria,
       COLLECT { MATCH (r)-[h:HAS_ITEM]->(i:ReportItem {itemKind: 'ROW'})-[:ASSESSES]->(o)
                 RETURN {row: i.itemKey, option: o.uid, disposition: i.disposition, rank: i.rank, cells: i.cellValues, order: h.orderIndex} } AS rows
ORDER BY r.publishedAt DESC
```

- validation: EXPLAIN ok on Neo4j 5.26.31

**P-05c. Published row → cited rows.** For each row the pattern returns its disposition, rank and cells, the Assertions it cites with their spans, the Assessments it cites, its blockers and the criteria used. Each `cellValues` entry names `<criterion uid>=<value>|<assertion or assessment uid>`.

```cypher
// @id P-05c
MATCH (r:Report {uid: $reportUid})-[h:HAS_ITEM]->(row:ReportItem {itemKind: 'ROW'})-[:ASSESSES]->(opt)
OPTIONAL MATCH (r)-[:WAS_GENERATED_BY]->(act:Activity)
RETURN opt.uid AS optionUid, opt.name, row.disposition, row.rank, row.cellValues, row.reason, row.missingFactKeys, h.orderIndex,
       COLLECT { MATCH (row)-[:DERIVED_FROM]->(a:Assertion)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
                 RETURN {assertion: a.uid, predicate: a.predicate, status: a.status, current: a.recordedTo IS NULL,
                         role: ev.role, exact: loc.exact, snapshot: snap.contentHash} } AS assertionCitations,
       COLLECT { MATCH (row)-[:DERIVED_FROM]->(s:Assessment)
                 RETURN {assessment: s.uid, kind: s.assessmentKind, verdict: s.verdict, current: s.recordedTo IS NULL} } AS assessmentCitations,
       COLLECT { MATCH (row)-[:BLOCKED_BY]->(b) RETURN {blocker: b.uid, kind: [lbl IN labels(b) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0]} } AS blockedBy,
       COLLECT { MATCH (r)-[:USES_CRITERION]->(c:DecisionCriterion) RETURN c.criterionKey + '@' + c.version } AS criteria,
       act.missionId, act.runId, r.policyVersion
ORDER BY coalesce(row.rank, 999), h.orderIndex
```

- validation: EXPLAIN ok on Neo4j 5.26.31
- "would it differ now" (CQ-RC-07): re-run P-05a with the report's criteria versions and `$asOf = datetime()`, then diff the ranks. The rows whose inputs have since closed are listed by P-10c (dependants) or Q-D10-13.

## P-06 Target-centric: what helps or hurts target T, by what evidence, for whom

Questions: Q-D5-01, Q-D5-02, Q-D5-03, Q-D10-03, CQ-RC-05; directive 3.1, 3.2.

T is a curated `Target` node (`key`, `parentKey` 2-level hierarchy). Effects are the five D5 goal predicates on Assertions with a Target object: INTENDED_FOR_TARGET, IMPROVES_TARGET, WORSENS_TARGET, NO_EFFECT_ON_TARGET and MIXED_EFFECT_ON_TARGET (R-83). "For whom" is the mandatory `population:<PopulationGroup>` qualifier. "Good" and "bad" are never entity properties.

**P-06a. Asserted effects of means on T, with population, evidence, verdicts and weighed BellLabs assessments.** Pass `$goalPredicates`:

- **Helps:** `['IMPROVES_TARGET']`
- **Hurts:** `['WORSENS_TARGET', 'MIXED_EFFECT_ON_TARGET']`
- **Null:** `['NO_EFFECT_ON_TARGET']`
- **Stated purpose:** `['INTENDED_FOR_TARGET']`

```cypher
// @id P-06a
MATCH (t:Target) WHERE t.key = $targetKey OR t.parentKey = $targetKey
MATCH (t)<-[:HAS_OBJECT]-(a:Assertion)-[:HAS_SUBJECT]->(means)
WHERE a.predicate IN $goalPredicates AND a.status IN ['ACCEPTED', 'DISPUTED']
  AND a.recordedAt <= $asOf AND (a.recordedTo IS NULL OR a.recordedTo > $asOf)
  AND (a.validFrom IS NULL OR a.validFrom <= $validAt) AND (a.validTo IS NULL OR a.validTo > $validAt)
  AND EXISTS { (a)-[:HAS_EVIDENCE]->(:SourceLocator) }
WITH t, a, means, [q IN coalesce(a.qualifiers, []) WHERE q STARTS WITH 'population:'] AS forWhom
WHERE $pop IS NULL OR any(q IN forWhom WHERE q IN ['population:' + $pop, 'population:UNSPECIFIED'])
OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
RETURN t.key, [lbl IN labels(means) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS meansType, means.uid AS meansUid, means.name, a.uid AS assertionUid, a.predicate,
       a.basisKind, a.speechAct, forWhom, [lbl IN labels(who) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS asserterKind, who.uid AS asserterUid,
       COLLECT { MATCH (a)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
                 RETURN {role: ev.role, exact: loc.exact, snapshot: snap.contentHash} } AS evidence,
       COLLECT { MATCH (adj:Adjudication)-[:ASSESSES]->(a) WHERE adj.recordedTo IS NULL RETURN adj.verdict } AS verdicts,
       COLLECT { MATCH (s:Assessment)-[:ASSESSES]->(means)
                 WHERE (s)-[:ASSESSES]->(t) AND s.status = 'ACCEPTED' AND s.recordedTo IS NULL
                 RETURN {assessment: s.uid, effectDirection: s.effectDirection, certainty: s.certainty, method: s.methodVersion} } AS weighed,
       COLLECT { MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity) RETURN act.runId } AS runs
ORDER BY meansType, means.name
LIMIT 200
```

- validation: EXPLAIN ok on Neo4j 5.26.31

**P-06b. Study branch: results measured on the measures that operationalize T.** A result row has its direction and statistical conclusion. One result is never a "helps" verdict. The study's populations answer "for whom".

```cypher
// @id P-06b
MATCH (t:Target) WHERE t.key = $targetKey OR t.parentKey = $targetKey
MATCH (t)-[:OPERATIONALIZED_BY]->(measure)<-[:MEASURES]-(od:OutcomeDefinition)<-[:RESULT_FOR]-(res:StudyResult)
MATCH (res)-[:RESULT_FOR_ARM]->(arm:StudyArm)-[:HAS_COMPONENT]->(ic:InterventionComponent)-[:ADMINISTERS]->(means)
MATCH (study:Study)-[:HAS_ARM]->(arm)
WHERE $meansUid IS NULL OR means.uid = $meansUid
RETURN t.key, [lbl IN labels(measure) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS measureKind, measure.name AS measure, study.uid AS studyUid, study.studyKind,
       arm.armType, [lbl IN labels(means) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS meansType, means.uid AS meansUid, means.name, ic.quantity, ic.unitCode, ic.route,
       res.resultKind, res.direction, res.estimate, res.intervalLower, res.intervalUpper, res.statisticalConclusion, res.pValue,
       COLLECT { MATCH (res)-[st:STATED_IN]->(rec) RETURN {record: rec.uid, assertion: st.assertionUid} } AS statedIn,
       COLLECT { MATCH (study)-[:HAS_POPULATION]->(pop:StudyPopulation)
                 RETURN {kind: pop.populationKind, sex: pop.sexScope, minAge: pop.minAgeYears, maxAge: pop.maxAgeYears,
                         healthy: pop.healthyVolunteers} } AS forWhom,
       COLLECT { MATCH (ra:Assessment)-[:ASSESSES]->(res) WHERE ra.recordedTo IS NULL
                 RETURN {assessment: ra.uid, kind: ra.assessmentKind, effectDirection: ra.effectDirection} } AS assessments
LIMIT 200
```

- validation: EXPLAIN ok on Neo4j 5.26.31
- trace: `STATED_IN.assertionUid` → P-01b gives the registry JSON pointer or the paper's results sentence.

## P-07 Harm and avoidance for a target

Questions: Q-D10-08, Q-D5-02, Q-D5-06, Q-D5-07, Q-D10-24, CQ-RC-06; directive 3.2; R-76, R-83, R-84.

The pattern asks what a person pursuing T should avoid, and why. It returns six kinds of reason:

1. Means asserted to worsen T, to have no effect on it, or to have mixed effects on it, including guideline wording (speechAct `CAUTIONS` or `RECOMMENDS`).
2. Recommendations against a means for this goal (predicate `RECOMMENDS_AGAINST`, qualifier `target:<key>`; the subject is the means, never the Target, R-83).
3. BellLabs HARM assessments about a means and T.
4. Use constraints on means used for T that cover the asker's population (UseConstraint is projection-minted from safety Assertions, R-76).
5. Adverse effects of means used for T (`CAUSES_ADVERSE_EFFECT` → Condition, R-84).
6. Published BLOCKED rows of reports about T.

```cypher
// @id P-07
MATCH (t:Target) WHERE t.key = $targetKey OR t.parentKey = $targetKey
CALL (t) {
  MATCH (t)<-[:HAS_OBJECT]-(a:Assertion)-[:HAS_SUBJECT]->(m)
  WHERE a.predicate IN ['WORSENS_TARGET', 'NO_EFFECT_ON_TARGET', 'MIXED_EFFECT_ON_TARGET']
    AND a.status IN ['ACCEPTED', 'DISPUTED'] AND a.recordedAt <= $asOf AND (a.recordedTo IS NULL OR a.recordedTo > $asOf)
    AND ($pop IS NULL OR any(q IN coalesce(a.qualifiers, []) WHERE q IN ['population:' + $pop, 'population:UNSPECIFIED']))
  RETURN m, 'ASSERTED_EFFECT' AS basis, a.uid AS uid, a.predicate + '/' + coalesce(a.speechAct, 'STATES') AS detail, a.qualifiers AS scope
  UNION
  MATCH (a:Assertion {speechAct: 'RECOMMENDS', predicate: 'RECOMMENDS_AGAINST'})-[:HAS_SUBJECT]->(m)
  WHERE ('target:' + t.key) IN coalesce(a.qualifiers, []) AND a.recordedTo IS NULL AND a.status IN ['ACCEPTED', 'DISPUTED']
  RETURN m, 'RECOMMENDED_AGAINST' AS basis, a.uid AS uid, a.predicate AS detail, a.qualifiers AS scope
  UNION
  MATCH (t)<-[:ASSESSES]-(s:Assessment {effectDirection: 'HARM'})-[:ASSESSES]->(m)
  WHERE m <> t AND s.status = 'ACCEPTED' AND s.recordedTo IS NULL
  RETURN m, 'HARM_ASSESSMENT' AS basis, s.uid AS uid, coalesce(s.certainty, s.verdict) AS detail, s.facets AS scope
  UNION
  MATCH (t)<-[:HAS_OBJECT]-(g:Assertion)-[:HAS_SUBJECT]->(m)
  WHERE g.predicate IN ['IMPROVES_TARGET', 'INTENDED_FOR_TARGET'] AND g.recordedTo IS NULL
  MATCH (m)<-[:HAS_SUBJECT]-(ua:Assertion)-[:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint)
  WHERE ua.recordedTo IS NULL AND ua.status IN ['ACCEPTED', 'DISPUTED']
    AND ($pop IS NULL OR $pop IN coalesce(uc.scopePopulations, []))
  RETURN m, 'USE_CONSTRAINT' AS basis, uc.uid AS uid, uc.constraintKind + ': ' + coalesce(uc.summary, '') AS detail, uc.scopePopulations AS scope
  UNION
  MATCH (t)<-[:HAS_OBJECT]-(g:Assertion)-[:HAS_SUBJECT]->(m)
  WHERE g.predicate IN ['IMPROVES_TARGET', 'INTENDED_FOR_TARGET'] AND g.recordedTo IS NULL
  MATCH (m)<-[:HAS_SUBJECT]-(ae:Assertion {predicate: 'CAUSES_ADVERSE_EFFECT'})-[:HAS_OBJECT]->(cond:Condition)
  WHERE ae.recordedTo IS NULL AND ae.status IN ['ACCEPTED', 'DISPUTED']
  RETURN m, 'ADVERSE_EFFECT' AS basis, ae.uid AS uid, cond.name AS detail, ae.qualifiers AS scope
  UNION
  MATCH (t)<-[:ASSESSES]-(:Report)-[:HAS_ITEM]->(i:ReportItem {disposition: 'BLOCKED'})-[:ASSESSES]->(m)
  MATCH (i)-[:BLOCKED_BY]->(b)
  RETURN m, 'PUBLISHED_BLOCK' AS basis, b.uid AS uid, [lbl IN labels(b) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS detail, null AS scope
}
WITH m, collect({basis: basis, uid: uid, detail: detail, scope: scope}) AS reasons
RETURN [lbl IN labels(m) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS meansType, m.uid AS meansUid, m.name, reasons, size(reasons) AS nReasons
ORDER BY nReasons DESC
LIMIT 100
```

- validation: EXPLAIN ok on Neo4j 5.26.31
- trace: an Assertion uid goes to P-01b, an Assessment uid to its `DERIVED_FROM` inputs and then P-01b, and a UseConstraint to `(uc)<-[:RESOLVES_TO_CONSTRAINT]-(a:Assertion)` and then P-01b. Severity ordering comes from the constraint Assertions' `severity` qualifier, and certainty from the assessment.

## P-08 Frontier-centric: events on frontier F, in order; leads-to and responds-to; who is active

Questions: Q-D13-01, Q-D13-02, Q-D13-03, Q-D10-22; directive 3.7; R-22, R-91.

Only `Event` and `Study` reach a `Frontier`, through `ON_FRONTIER` (recorded-time episodes). Organizations and people are reached through `INVOLVES` (role on the edge) and `HAS_STUDY_ROLE`. `LEADS_TO` and `RESPONDS_TO` are projected only from a current POSITIVE Assertion with a SUPPORT adjudication (R-22 projection gate). Temporal order is computed and is never merged with the stated links.

**P-08a. What happened on F in the last N days, in order.**

```cypher
// @id P-08a
MATCH (f:Frontier) WHERE f.key = $frontierKey OR f.parentKey = $frontierKey
MATCH (e:Event)-[of:ON_FRONTIER]->(f)
WHERE of.recordedFrom <= $asOf AND (of.recordedTo IS NULL OR of.recordedTo > $asOf)
  AND e.eventStatus IN ['OCCURRED', 'IN_PROGRESS']
WITH f, e, of, coalesce(e.startedAt, e.announcedAt) AS at
WHERE at <= $asOf AND at >= $asOf - duration({days: $days})
RETURN f.key, e.uid AS eventUid, e.eventKind, e.name, at, e.startedAtPrecision, e.announcedAt, e.effectiveFrom, e.jurisdiction,
       of.assertionUid AS classifiedBy,
       COLLECT { MATCH (e)-[lt:LEADS_TO]->(n:Event)
                 WHERE lt.recordedFrom <= $asOf AND (lt.recordedTo IS NULL OR lt.recordedTo > $asOf)
                 RETURN {event: n.uid, kind: n.eventKind, assertion: lt.assertionUid} } AS leadsTo,
       COLLECT { MATCH (p:Event)-[lf:LEADS_TO]->(e)
                 WHERE lf.recordedFrom <= $asOf AND (lf.recordedTo IS NULL OR lf.recordedTo > $asOf)
                 RETURN {event: p.uid, kind: p.eventKind, assertion: lf.assertionUid} } AS ledFrom,
       COLLECT { MATCH (e)-[rt:RESPONDS_TO]->(s:Event)
                 WHERE rt.recordedFrom <= $asOf AND (rt.recordedTo IS NULL OR rt.recordedTo > $asOf)
                 RETURN {event: s.uid, kind: s.eventKind, assertion: rt.assertionUid} } AS respondsTo,
       COLLECT { MATCH (e)-[inv:INVOLVES]->(w)
                 WHERE inv.recordedFrom <= $asOf AND (inv.recordedTo IS NULL OR inv.recordedTo > $asOf)
                 RETURN {who: w.uid, name: w.name, kind: [lbl IN labels(w) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0], role: inv.role} } AS involved
ORDER BY at
```

- validation: EXPLAIN ok on Neo4j 5.26.31
- trace: each event's clocks resolve through `timeAssertionUid`, `announcementAssertionUid` and `effectiveAssertionUid` to P-01b. Each link resolves through its `assertionUid` to P-01b and to its SUPPORT adjudication.

**P-08b. Who is active on F: organizations and people with their latest event and role, plus the studies they sponsor on F.**

```cypher
// @id P-08b
MATCH (f:Frontier {key: $frontierKey})<-[of:ON_FRONTIER]-(e:Event)-[inv:INVOLVES]->(w)
WHERE of.recordedTo IS NULL AND inv.recordedTo IS NULL AND e.eventStatus = 'OCCURRED'
WITH f, w, e, inv ORDER BY coalesce(e.startedAt, e.announcedAt) DESC
WITH f, w, collect({event: e.uid, kind: e.eventKind, at: coalesce(e.startedAt, e.announcedAt), role: inv.role})[0] AS latest, count(e) AS nEvents
RETURN [lbl IN labels(w) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS actorKind, w.uid AS actorUid, w.name, latest, nEvents,
       COLLECT { MATCH (f)<-[sof:ON_FRONTIER]-(st:Study)-[sr:HAS_STUDY_ROLE]->(w)
                 WHERE sof.recordedTo IS NULL AND sr.recordedTo IS NULL AND sr.roleKind IN ['LEAD_SPONSOR', 'SPONSOR']
                 RETURN st.uid } AS studiesSponsoredOnFrontier
ORDER BY latest.at DESC
LIMIT 100
```

- validation: EXPLAIN ok on Neo4j 5.26.31
- Organizations active only through studies (no event yet) come from the second form of Q-D13-03: `(f)<-[:ON_FRONTIER]-(:Study)-[:HAS_STUDY_ROLE]->(o:Organization)`.

**P-08c. The stated causal chain from one event**, for example readout → approval → launch → financing. Every hop is a current episode.

```cypher
// @id P-08c
MATCH p = (e0:Event {uid: $eventUid})(()-[r:LEADS_TO|RESPONDS_TO WHERE r.recordedTo IS NULL]-()){1,6}(eN:Event)
RETURN [n IN nodes(p) | {event: n.uid, kind: n.eventKind, at: coalesce(n.startedAt, n.announcedAt)}] AS chain,
       [x IN relationships(p) | {type: type(x), assertion: x.assertionUid, forward: startNode(x) <> endNode(x)}] AS links,
       length(p) AS hops
ORDER BY hops
LIMIT 50
```

- validation: EXPLAIN ok on Neo4j 5.26.31
- The pattern is undirected on purpose: `RESPONDS_TO` points from response to stimulus. The `links` list carries each hop's type, so the reader can orient the chain.

## P-09 Recommendation with conflict of interest

Questions: Q-D9-01, CQ-CL-05, CQ-CL-08, Q-D10-21, Q-K-15; directive 3.9; R-19, R-78, R-82, R-83.

A recommendation is a claim-occurrence `Assertion` with speechAct `RECOMMENDS` and predicate `RECOMMENDS_USE`. Its subject is the recommended means, and the goal is a `target:<key>` qualifier. It has one asserter (`ASSERTED_BY`), one container (`OCCURS_IN` MediaWork), and one located span. No `RECOMMENDS` edge is stored.

The statement time T is the container's `publishedAt`, else the snapshot's (R-19). The pattern finds the organizations behind the recommended item: brand owner, named manufacturer or distributor, seller of record, or the item itself. It reaches the recommender's interests in them (`HOLDS_ROLE | HOLDS_STAKE | RECEIVES_VALUE_FROM`, also through up to two `PARENT_OF` hops) and tests their overlap with T. The overlap reads the authorizing Assertion's `validObservedAt` (R-19). The pattern also returns any disclosure (`DISCLOSES_INTEREST`, R-82) in the same container or source, and any CONFLICT_RELEVANCE assessment.

```cypher
// @id P-09
MATCH (x:Entity {uid: $itemUid})<-[:HAS_SUBJECT]-(o:Assertion)-[:ASSERTED_BY]->(p:Person)
WHERE o.speechAct = 'RECOMMENDS' AND o.predicate = 'RECOMMENDS_USE'
  AND o.recordedTo IS NULL AND o.status IN ['ACCEPTED', 'PROPOSED']
  AND NOT 'segment:SPONSOR_READ' IN coalesce(o.qualifiers, [])
OPTIONAL MATCH (o)-[:OCCURS_IN]->(w:MediaWork)
MATCH (o)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
WITH x, o, p, w, loc, snap, src, coalesce(w.publishedAt, snap.publishedAt, snap.observedAt) AS saidAt
WITH x, o, p, w, loc, snap, src, saidAt,
     COLLECT {
       MATCH (x)-[:BRANDED_AS]->(:Brand)<-[:OWNS_BRAND]-(org:Organization) RETURN org
       UNION
       MATCH (x)<-[:HAS_VARIANT]-(:Product)-[:BRANDED_AS]->(:Brand)<-[:OWNS_BRAND]-(org:Organization) RETURN org
       UNION
       MATCH (x)<-[:HAS_OBJECT]-(mf:Assertion)-[:HAS_SUBJECT]->(org:Organization)
       WHERE mf.predicate IN ['MANUFACTURES', 'CONTRACT_MANUFACTURES_FOR', 'DISTRIBUTES', 'SUPPLIES_MATERIAL'] AND mf.recordedTo IS NULL
       RETURN org
       UNION
       MATCH (x)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)<-[:LISTING_FOR]-(:MerchantListing)-[:HAS_OFFER]->(:Offer)-[:SELLER_OF_RECORD]->(org:Organization)
       RETURN org
       UNION
       WITH x AS org WHERE org:Organization RETURN org
     } AS behind
RETURN p.uid AS recommenderUid, p.name AS recommender, o.uid AS occurrenceUid, o.qualifiers, loc.exact, loc.mediaStartSeconds,
       w.uid AS containerUid, w.publishedAt, saidAt, src.canonicalUri,
       COLLECT { MATCH (p)-[r:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(org:Organization)
                 WHERE r.recordedTo IS NULL
                 MATCH (org)-[:PARENT_OF]-{0,2}(o2:Organization) WHERE o2 IN behind
                 OPTIONAL MATCH (ia:Assertion {uid: r.assertionUid})
                 RETURN DISTINCT {family: type(r), kind: coalesce(r.roleKind, r.stakeKind, r.valueKind), org: org.uid, via: o2.uid,
                         validFrom: r.validFrom, validTo: r.validTo, observedAt: ia.validObservedAt, interestAssertion: r.assertionUid,
                         overlap: CASE
                           WHEN saidAt IS NULL THEN 'UNKNOWN'
                           WHEN (r.validTo IS NOT NULL AND r.validTo <= saidAt) OR (r.validFrom IS NOT NULL AND r.validFrom > saidAt) THEN 'DISJOINT'
                           WHEN r.validFrom IS NOT NULL AND r.validFrom <= saidAt
                                AND (r.validTo > saidAt OR (r.validTo IS NULL AND ia.validObservedAt >= saidAt)) THEN 'OVERLAPS'
                           ELSE 'UNKNOWN' END} } AS interests,
       COLLECT { MATCH (src)-[:HAS_SNAPSHOT]->(:SourceSnapshot)-[:HAS_LOCATOR]->(:SourceLocator)<-[:HAS_EVIDENCE]-(da:Assertion {predicate: 'DISCLOSES_INTEREST'})
                 WHERE (da)-[:ASSERTED_BY]->(p) RETURN da.uid AS d
                 UNION
                 MATCH (w)<-[:OCCURS_IN]-(da:Assertion {predicate: 'DISCLOSES_INTEREST'}) WHERE (da)-[:ASSERTED_BY]->(p) RETURN da.uid AS d } AS disclosures,
       COLLECT { MATCH (cra:Assessment {assessmentKind: 'CONFLICT_RELEVANCE'})-[:DERIVED_FROM]->(o) WHERE cra.recordedTo IS NULL
                 RETURN {assessment: cra.uid, level: cra.conclusionCode, facets: cra.facets} } AS conflictRelevance
ORDER BY saidAt DESC
LIMIT 100
```

- validation: EXPLAIN ok on Neo4j 5.26.31
- The relevance and disclosure verdicts are the CONFLICT_RELEVANCE Assessment's (`conclusionCode`, `facets`). `overlap` and `behind` are retrieval aids. For a compound X, the makers are the makers of the products that declare it (`(:LabelVersion)-[:DECLARES_COMPONENT]->(x)` up the D6 chain). That hop is left to the caller to bound fan-out.

## P-10 Mission lineage

Questions: Q-K-03, Q-K-04, Q-K-05, Q-K-06, Q-K-07; directive 4; R-12, R-13, R-17.

One `Activity` per Mission Control run, identified by (`externalRunSystem`, `runId`), carries `missionId`. Nodes point at every run that created or updated them (`WAS_GENERATED_BY`). Edges name their last writer (`lastWriterRunId`) and their authorizing Assertion (`assertionUid`). Runs chain through `WAS_INFORMED_BY`. Lineage traverses `WAS_GENERATED_BY` from the Activity and never scans `:Entity` (R-17).

**P-10a. What mission M produced: nodes by run and label (created vs updated), asserted edges, published outputs, derived edges.**

```cypher
// @id P-10a
MATCH (act:Activity {missionId: $missionId})<-[:WAS_GENERATED_BY]-(n)
WITH act, n, NOT EXISTS { MATCH (n)-[:WAS_GENERATED_BY]->(prior:Activity) WHERE prior.startedAt < act.startedAt } AS created
RETURN act.runId, act.activityKind, [lbl IN labels(n) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS label,
       sum(CASE WHEN created THEN 1 ELSE 0 END) AS createdCount,
       sum(CASE WHEN created THEN 0 ELSE 1 END) AS updatedCount
ORDER BY act.runId, label;

// @id P-10a.2 asserted edges authorized by the mission's Assertions (endpoints bound, no relationship scan), HAS_IDENTIFIER episodes included
MATCH (act:Activity {missionId: $missionId})<-[:WAS_GENERATED_BY]-(a:Assertion)
CALL (a) {
  MATCH (a)-[:HAS_SUBJECT]->(s), (a)-[:HAS_OBJECT]->(o)
  MATCH (s)-[r]->(o) WHERE type(r) = a.predicate AND r.assertionUid = a.uid
  RETURN r
  UNION
  MATCH (a)-[:HAS_SUBJECT]->(s)-[r:HAS_IDENTIFIER]->(:Identifier) WHERE r.assertionUid = a.uid
  RETURN r
}
RETURN act.runId, type(r) AS relType, count(DISTINCT r) AS edges
ORDER BY act.runId, relType;

// @id P-10a.3 published and judged outputs
MATCH (act:Activity {missionId: $missionId})<-[:WAS_GENERATED_BY]-(out)
WHERE out:Report OR out:Assessment OR out:Adjudication OR out:Association
RETURN act.runId, [lbl IN labels(out) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS kind, out.uid,
       coalesce(out.reportKind, out.assessmentKind, out.adjudicationKind, out.associationKind) AS subkind;

// @id P-10a.4 derived edges written by the mission's projection runs
MATCH (act:Activity {missionId: $missionId})
WITH collect(act.runId) AS runs
MATCH ()-[r:MENTIONS|COVERS_LOCATOR|AFFECTS_MECHANISM|ASSOCIATES|RESOLVES_TO_CONSTRAINT|STATES_CONSTRAINT]->()
WHERE r.lastWriterRunId IN runs
RETURN r.lastWriterRunId AS runId, type(r) AS relType, count(r) AS edges
```

- validation: EXPLAIN ok on Neo4j 5.26.31 (4 statements)
- `MEASURES` is not in the derived list (fix stage, 2026-10-09). The merged register classes it asserted (`AssertedRecordedProperties`), so P-10a.2 already counts it through its authorizing Assertion, and listing it here as well counted it twice. The IR still classes it `derived` because it inherits the pinned validation params (open issue Q-3, FU-08).
- P-10a.2's second branch counts `HAS_IDENTIFIER` episodes. `identifier.attach` writes them with the attaching Assertion's uid in `assertionUid`, but their object is the `Identifier` node, which the first branch's `type(r) = a.predicate` test does not reach. The compound-profile walk found 22 such episodes uncounted.

**P-10b. Which missions touched entity X, and when.** There are six roles: the run wrote X, asserted about X, recorded a statement X made (X is the asserter, `ASSERTED_BY`), assessed X, was chartered about X (Activity ASSESSES), or linked a MENTIONS edge to X.

```cypher
// @id P-10b
MATCH (x:Entity {uid: $uid})
CALL (x) {
  MATCH (x)-[:WAS_GENERATED_BY]->(act:Activity) RETURN act, 'WROTE' AS role
  UNION
  MATCH (x)<-[:HAS_SUBJECT|HAS_OBJECT]-(:Assertion)-[:WAS_GENERATED_BY]->(act:Activity) RETURN act, 'ASSERTED_ABOUT' AS role
  UNION
  MATCH (x)<-[:ASSERTED_BY]-(:Assertion)-[:WAS_GENERATED_BY]->(act:Activity) RETURN act, 'RECORDED_STATEMENT_BY' AS role
  UNION
  MATCH (x)<-[:ASSESSES]-(j)-[:WAS_GENERATED_BY]->(act:Activity) WHERE j:Assessment OR j:Report OR j:ReportItem RETURN act, 'ASSESSED' AS role
  UNION
  MATCH (x)<-[:ASSESSES]-(act:Activity) RETURN act, 'CHARTERED_ABOUT' AS role
  UNION
  MATCH (x)<-[m:MENTIONS]-(:Chunk) MATCH (act:Activity {runId: m.lastWriterRunId}) RETURN act, 'LINKED_MENTION' AS role
}
RETURN act.missionId, act.runId, act.activityKind, act.startedAt, act.endedAt, collect(DISTINCT role) AS roles
ORDER BY act.startedAt
```

- validation: EXPLAIN ok on Neo4j 5.26.31

**P-10c. What depends on M's outputs (blast radius).** M's outputs are the kernel records whose earliest run belongs to M. Dependants are found up to four hops: a `DERIVED_FROM` hop may reach any input, and an `ASSESSES` hop counts only when it ends at a Claim or an Assertion (Q-K-06). The pattern also returns derived edges whose input lists cite M's Assertions, and downstream runs started from M's runs.

```cypher
// @id P-10c
MATCH (:Activity {missionId: $missionId})<-[:WAS_GENERATED_BY]-(out)
WHERE out:Assertion OR out:Assessment OR out:Adjudication OR out:Report OR out:Claim
CALL (out) {
  MATCH (out)-[:WAS_GENERATED_BY]->(a0:Activity) RETURN a0 ORDER BY a0.startedAt LIMIT 1
}
WITH out, a0 WHERE a0.missionId = $missionId
WITH collect(DISTINCT out) AS outs
UNWIND outs AS out
MATCH p = (dep)-[:DERIVED_FROM|ASSESSES]->{1,4}(out)
WHERE NOT dep IN outs
  AND all(r IN relationships(p) WHERE type(r) = 'DERIVED_FROM' OR endNode(r):Claim OR endNode(r):Assertion)
RETURN [lbl IN labels(dep) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS kind, dep.uid, dep.recordedTo IS NULL AS current, min(length(p)) AS depth
ORDER BY depth, kind
LIMIT 500;

// @id P-10c.2 derived edges citing M's Assertions
MATCH (:Activity {missionId: $missionId})<-[:WAS_GENERATED_BY]-(a:Assertion)
WITH collect(a.uid) AS outUids
MATCH ()-[r:MENTIONS|COVERS_LOCATOR|AFFECTS_MECHANISM|ASSOCIATES|RESOLVES_TO_CONSTRAINT|STATES_CONSTRAINT]->()
WHERE r.projectionOfAssertionUid IN outUids OR any(u IN coalesce(r.derivedFromAssertionUids, []) WHERE u IN outUids)
RETURN type(r) AS relType, count(r) AS edges;

// @id P-10c.3 downstream runs of other missions started from M's runs
MATCH (m:Activity {missionId: $missionId})
MATCH p = (d:Activity)-[:WAS_INFORMED_BY]->{1,4}(m)
WHERE d.missionId <> $missionId
RETURN d.missionId, d.runId, d.activityKind, min(length(p)) AS depth
ORDER BY depth
```

- validation: EXPLAIN ok on Neo4j 5.26.31 (3 statements)
- run-scoped variant: bind with `(:Activity {runId: $runId})`, keep `out` when its earliest run is `$runId`, and filter `d.runId <> $runId`. P-10c.2 scans the derived types, which suits an audit. A per-type index seek is not possible on list membership.

**P-10d. What changed between two runs.** "Created by R2" means generated by R2 and by no run that started earlier. The second statement lists the asserted episodes R2 opened or closed.

```cypher
// @id P-10d
MATCH (r1:Activity {runId: $r1}), (r2:Activity {runId: $r2})
MATCH (r2)<-[:WAS_GENERATED_BY]-(n)
WITH r1, r2, n, NOT EXISTS { MATCH (n)-[:WAS_GENERATED_BY]->(p:Activity) WHERE p.startedAt < r2.startedAt } AS created
RETURN [lbl IN labels(n) WHERE NOT lbl IN ['Entity', 'Occurrence', 'InformationArtifact', 'EvidenceAssessment']][0] AS label, n.uid,
       CASE WHEN created AND n.supersedesUid IS NOT NULL THEN 'SUPERSEDES'
            WHEN created THEN 'CREATED'
            WHEN n.recordedTo IS NOT NULL THEN 'CLOSED'
            ELSE 'UPDATED' END AS change,
       n.supersedesUid, EXISTS { (n)-[:WAS_GENERATED_BY]->(r1) } AS alsoWrittenByR1
ORDER BY change, label;

// @id P-10d.2 asserted episodes R2 opened or closed
MATCH (r2:Activity {runId: $r2})<-[:WAS_GENERATED_BY]-(a:Assertion)
MATCH (a)-[:HAS_SUBJECT]->(s), (a)-[:HAS_OBJECT]->(o)
MATCH (s)-[e]->(o) WHERE type(e) = a.predicate AND e.assertionUid = a.uid
RETURN type(e) AS relType, e.relationshipUid, CASE WHEN e.recordedTo IS NULL THEN 'OPEN' ELSE 'CLOSED' END AS state,
       e.recordedFrom, e.recordedTo
```

- validation: EXPLAIN ok on Neo4j 5.26.31 (2 statements); plan contains CartesianProduct
- No database-level as-of exists. The diff is built from `WAS_GENERATED_BY` (multi-valued, written on create and on update), `recordedAt`/`recordedTo`, `supersedesUid`, and the episodes' `recordedFrom`/`recordedTo`. `lastWriterRunId` is overwritten by later runs and means only "last touched by".

**P-10e. Record → runs → agents** (Q-K-03). Replay goes through `intentDigests`, `planDigests`, `receiptIds` and `bundleDigest`.

```cypher
// @id P-10e
MATCH (n:Entity {uid: $uid})-[:WAS_GENERATED_BY]->(act:Activity)
RETURN act.missionId, act.runId, act.activityKind, act.operationKind, act.startedAt, act.endedAt,
       act.intentDigests, act.planDigests, act.receiptIds, act.bundleDigest, act.policyVersion,
       COLLECT { MATCH (act)-[:WAS_ASSOCIATED_WITH]->(ag:Agent)
                 RETURN ag {.uid, .agentKind, .model, .promptVersion, .skillVersion, .toolVersion} } AS agents
ORDER BY act.startedAt
```

- validation: EXPLAIN ok on Neo4j 5.26.31
- For kernel records, replace `(n:Entity …)` with the record's own label, for example `(n:Assertion {uid: $uid})`, because records do not carry `Entity`.

## P-11 Claim → evidence mission → evidence report with verdict

Questions: Q-K-08, Q-K-19, Q-D10-04, Q-D10-23, CQ-AX-24; directive 3.4; R-12, R-32.

A Claim goes through four stages:

1. It is vetted by an Assessment of kind `VETTING` (`disposition` IGNORE, MONITOR or RESEARCH).
2. It is attacked by an `Activity` of kind `EVIDENCE_MISSION` that ASSESSES exactly that Claim and `WAS_INFORMED_BY` the vetting run.
3. It receives a `Report` of kind `EVIDENCE_REPORT` that is `WAS_GENERATED_BY` the mission, ASSESSES the Claim, and states a `verdict` from the `SemanticVerdict` lattice.
4. The report's VERDICT section cites the assessments it rests on.

Refinements (`refinesClaimUid`) are shown with their exact Claim.

```cypher
// @id P-11a
MATCH (c0:Claim {uid: $claimUid})
CALL (c0) {
  RETURN c0 AS c
  UNION
  MATCH (v:Claim {refinesClaimUid: c0.uid}) RETURN v AS c
}
OPTIONAL MATCH (c)<-[:ASSESSES]-(m:Activity {activityKind: 'EVIDENCE_MISSION'})
OPTIONAL MATCH (m)<-[:WAS_GENERATED_BY]-(r:Report {reportKind: 'EVIDENCE_REPORT'})-[:ASSESSES]->(c)
WHERE r.recordedTo IS NULL
OPTIONAL MATCH (m)-[:WAS_INFORMED_BY]->(vr:Activity {activityKind: 'VETTING'})
RETURN c.uid, c.proposition, c.lifecycleState, c.latestVerdict,
       COLLECT { MATCH (c)<-[:ASSESSES]-(v:Assessment {assessmentKind: 'VETTING'}) WHERE v.recordedTo IS NULL
                 RETURN {vetting: v.uid, disposition: v.disposition, at: v.recordedAt} } AS vetting,
       m.missionId, m.runId, m.startedAt, m.endedAt, vr.runId AS queuedByRun,
       r.uid AS reportUid, r.verdict, r.worldCorrectness, r.policyVersion, r.publishedAt, r.bundleDigest,
       r.independentSourceFamilyCount, r.citationCompleteness,
       COUNT { (r)-[:DERIVED_FROM]->() } AS citedRecords, COUNT { (r)-[:HAS_EVIDENCE]->() } AS quotedSpans,
       COLLECT { MATCH (r)-[:HAS_ITEM]->(vi:ReportItem {sectionKind: 'VERDICT'})-[:DERIVED_FROM]->(s:Assessment) RETURN s.uid } AS verdictBasis
ORDER BY m.startedAt DESC
```

- validation: EXPLAIN ok on Neo4j 5.26.31
- Untested means there is no mission row. "What verdict had we published at R" adds `r.recordedAt <= $asOf`.

**P-11b. The research queue: claims vetted RESEARCH with no evidence mission yet**, by reach (Q-K-19).

```cypher
// @id P-11b
MATCH (c:Claim)<-[:ASSESSES]-(v:Assessment {assessmentKind: 'VETTING', disposition: 'RESEARCH'})
WHERE v.recordedTo IS NULL
  AND NOT EXISTS { (c)<-[:ASSESSES]-(:Activity {activityKind: 'EVIDENCE_MISSION'}) }
RETURN c.uid, c.proposition, v.recordedAt AS vettedAt,
       COUNT { MATCH (c)<-[:OCCURRENCE_OF]-(o:Assertion) WHERE o.recordedTo IS NULL } AS occurrences
ORDER BY occurrences DESC, vettedAt
LIMIT 50
```

- validation: EXPLAIN ok on Neo4j 5.26.31

## P-12 Compound → mechanism → biomarker → test (D1 → D2 → D4, with D3's study metric)

Questions: Q-D2-03 = Q-D4-01, Q-D1-08, Q-D2-02, Q-D4-17; R-47, R-70.

The path has five hops:

- **Hop 0 (D1).** The start (an IngredientMaterial, ChemicalSubstance or Intervention) resolves to modulators: itself, the substance it realizes, the substance's active moiety, or the constituents it contains.
- **Hop 1 (D2, derived).** `AFFECTS_MECHANISM`, with method `d2.affects-mechanism/v1`, `direction`, `bestBasis` and `humanMeasured`. Its context comes from the input Assertions' `MechanismEvidenceContext`.
- **Hop 2 (D4).** The Biomarker `REFLECTS_MECHANISM` M, or has an analyte that `PARTICIPATES_IN` M.
- **Hop 3 (D3).** What a study measured (`OutcomeDefinition -MEASURES-> Metric -QUANTIFIES-> Biomarker`).
- **Hop 4 (D4).** Orderable tests with a current `MEASURES_METRIC` episode, their assay version, and the Product that delivers them. The compartment of the test metric is compared with the finding's compartment.

```cypher
// @id P-12
MATCH (start:Entity {uid: $startUid})
CALL (start) {
  MATCH (start) WHERE start:ChemicalSubstance OR start:Intervention RETURN start AS c, 'self' AS via
  UNION
  MATCH (start)-[:HAS_ACTIVE_MOIETY]->(c:ChemicalSubstance) RETURN c, 'active-moiety' AS via
  UNION
  MATCH (start:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(c:ChemicalSubstance) RETURN c, 'realizes' AS via
  UNION
  MATCH (start:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(:ChemicalSubstance)-[:HAS_ACTIVE_MOIETY]->(c:ChemicalSubstance) RETURN c, 'realizes+moiety' AS via
  UNION
  MATCH (start:IngredientMaterial)-[mc:MATERIAL_CONTAINS]->(c:ChemicalSubstance) WHERE mc.recordedTo IS NULL RETURN c, 'contains' AS via
}
MATCH (c)-[am:AFFECTS_MECHANISM]->(m:Mechanism)
WHERE am.derivationRule STARTS WITH 'd2.affects-mechanism/' AND (NOT $humanOnly OR am.humanMeasured)
WITH start, c, via, am, m,
     COLLECT { UNWIND coalesce(am.derivedFromAssertionUids, []) AS au
               MATCH (a:Assertion {uid: au})-[:OBSERVED_IN_CONTEXT]->(ctx:MechanismEvidenceContext)
               RETURN {assertion: a.uid, organism: ctx.organism, setting: ctx.setting, compartment: ctx.compartmentOntologyId} } AS contexts
OPTIONAL CALL (m) {
  MATCH (b:Biomarker)-[rm:REFLECTS_MECHANISM]->(m) WHERE rm.recordedTo IS NULL
  RETURN b, 'reflects' AS hop2, rm.assertionUid AS hop2Assertion
  UNION
  MATCH (b:Biomarker)-[:HAS_ANALYTE]->(an)-[pi:PARTICIPATES_IN]->(m) WHERE pi.recordedTo IS NULL
  RETURN b, 'analyte-participates' AS hop2, pi.assertionUid AS hop2Assertion
}
RETURN start.uid AS startUid, via, c.uid AS modulatorUid, c.name AS modulator, m.uid AS mechanismUid, m.name AS mechanism,
       am.direction, am.bestBasis, am.humanMeasured, am.nHumanContexts, contexts,
       b.uid AS biomarkerUid, b.name AS biomarker, hop2, hop2Assertion,
       COLLECT { MATCH (od:OutcomeDefinition)-[:MEASURES]->(sm:Metric)-[:QUANTIFIES]->(b)
                 RETURN {outcomeDefinition: od.uid, metric: sm.uid, compartment: sm.systemOntologyId} } AS studyMetrics,
       COLLECT { MATCH (b)<-[:QUANTIFIES]-(tm:Metric)<-[mm:MEASURES_METRIC]-(t:LabTest)
                 WHERE mm.recordedTo IS NULL AND (mm.validTo IS NULL OR mm.validTo > $asOf)
                 OPTIONAL MATCH (t)-[pw:PERFORMED_WITH_VERSION]->(av:AssayVersion) WHERE pw.recordedTo IS NULL
                 OPTIONAL MATCH (prod:Product)-[:DELIVERS]->(t)
                 RETURN {test: t.uid, testName: t.name, metric: tm.uid, compartment: tm.systemOntologyId,
                         assay: av.methodPrinciple, product: prod.uid, measuresAssertion: mm.assertionUid,
                         sameCompartmentAsFinding: tm.systemOntologyId IN [x IN contexts | x.compartment]} } AS tests
ORDER BY mechanism, biomarker
LIMIT 200
```

- validation: EXPLAIN ok on Neo4j 5.26.31
- Hop 2 is optional (`OPTIONAL CALL`, Neo4j 5.24+ and Cypher 25). `biomarker = null` means the mechanism has no biomarker in the graph, and the row still shows the measured mechanism. The compound-profile fixture graph has no Biomarker, and with a mandatory hop 2 the pattern returned 0 rows there. `tests = []` means `NO_ORDERABLE_TEST`. A test whose compartment differs from both the finding and the study metric means `NOT_COMPARABLE_COMPARTMENT`, as in fixture `nr-nad-compound-to-test`: NAD+ measured in PBMC in the trial, in red blood cells by the test.
- trace: hop 1 goes from `am.derivedFromAssertionUids` to P-01b. Hops 2 and 4 go from the edge `assertionUid` to P-01b.

## P-13 GDS projections

Questions: Q-D10-05, Q-D10-19, Q-D10-20, CQ-ST-07, Q-D9-19, Q-D2-19, Q-D4-25, Q-D12-20, Q-D5-19, Q-D7-23; directive 3.5, 3.6; R-47, R-48, R-49, R-50.

GDS is not available on the disposable instance (Neo4j Community without the plugin), and the production target's GDS availability is open (D10 open question 22: Aura Pro with GDS, AuraDS, Aura Graph Analytics, or self-managed Enterprise).

Each projection statement below was validated by `EXPLAIN` of its source query, with `gds.graph.project(...)` rewritten to a list. Algorithm and drop calls are "GDS not available on the disposable instance; syntax reviewed against the neo4j-gds-skill", which uses `gds.graph.project` Cypher aggregation, `stream` mode, `gds.util.asNode`, and drops the graph after use.

Results feed one of four things:

- A D10 `Association` (one per pair, `methodVersion`, `inputSetDigest`, `WAS_GENERATED_BY` a PROJECTION Activity, the previous one closed). See G-0.
- An `Assessment` (D7 leads).
- Projection-cache properties (R-49, discourse metrics).
- Nothing at all: streamed at query time and returned with the method version.

| id | question | projection (nodes · relationships · properties) | algorithm | refresh | result feeds |
| --- | --- | --- | --- | --- | --- |
| G-1 | Q-D10-05 | no GDS: current accepted effect assertions per (exposure, outcome-or-target) | Cypher aggregation, harmonic-sum per evidence kind (`bl-assoc/evidence-aggregate@1`) | weekly, or when > 1% of a pair's inputs changed | Association `EVIDENCE_AGGREGATE` |
| G-2 | Q-D10-19 | subject Entity → feature Entity · one type per predicate · none | Node Similarity (Jaccard), topK 10, cutoff 0.2 | weekly | Association `SIMILARITY` (`gds-nodesimilarity/jaccard@1;features=…`), retrieval aid, "not evidence" |
| G-3 | Q-D10-20 | Entity–Entity co-assertion, undirected, scoped to `$scopeUids` · `CO_ASSERTED` · none | Leiden, seed 42 | per query (stream) | nothing stored; a published PROFILE Report may cite member assertions |
| G-4 | CQ-ST-07 | Publication, Study · `REPORTS_ON` + accepted `SHARES_PARTICIPANTS_WITH`, undirected · none | WCC | per request (stream) | answer + input to an EVIDENCE_SYNTHESIS Assessment (`d3-independence/v1`) |
| G-5 | Q-D9-19 | asserters (Person, Channel) · retelling (reteller → original) · `weight` | PageRank (weighted), damping 0.85 | monthly per curated frontier | projection-cache properties on Person / Channel (R-49): `influenceScore`, `influenceMethodVersion`, `influenceDerivedAt`, declared since the fix stage; they hold one graph-wide score, so a per-frontier score has no write target (FU-11) |
| G-6 | Q-D2-19 | ChemicalSubstance → MolecularEntity · `HITS` from target Assertions · none | Node Similarity (Jaccard), topK 10, cutoff 0.2 | nightly, after the AFFECTS_MECHANISM refresh | Association `LINK_PREDICTION` (suggestion, research-mission queue) |
| G-7 | Q-D4-25 | LabTest (PANEL) → Metric, undirected · current INCLUDES_TEST + MEASURES_METRIC · none | Node Similarity (Jaccard), cutoff 0.3 | per request (stream) | nothing stored (`d4.panel-similarity/v1` on the answer) |
| G-8 | Q-D12-20 | FoodItem → ChemicalSubstance / Constituent · FOOD_CONTAINS PER_100G · `weight` (max-normalized quantity) | Node Similarity (weighted Jaccard), topK 10 | graph rebuilt weekly and after each composition import; queried by stream | nothing stored (`food-similarity/v1`) |
| G-9 | Q-D5-19 | means → ProtocolEdition (current HAS_EDITION) · `IN_EDITION` · none | Node Similarity (Jaccard), cutoff 0.1 | on demand (stream); weekly if materialized | optional Association `CO_OCCURRENCE` (`d5-stack-cooccurrence/v1`) |
| G-10 | Q-D7-23 | Person–Organization, undirected · current HOLDS_ROLE / HOLDS_STAKE / RECEIVES_VALUE_FROM as `TIE` · none | Node Similarity (Jaccard), topK 10, cutoff 0.2; betweenness for connectors | weekly (ties), monthly (betweenness) | INSIGHT Assessment per accepted lead (`D7.undisclosed-tie-lead`); betweenness served, not stored |

**G-0. Writing a projection result as an Association.** This is the single write shape every materialized projection uses, and it is EXPLAIN-validated. `$rows` are the stream rows (`anchorUid`, `memberUid`, `score`, `inputSetDigest`, optional `inputAssertionUids` ≤ 5,000). `$runId` names the PROJECTION Activity.

```cypher
// @id G-0
MATCH (run:Activity {runId: $runId}) WHERE run.activityKind = 'PROJECTION'
UNWIND $rows AS row
MATCH (x:Entity {uid: row.anchorUid}), (y:Entity {uid: row.memberUid})
OPTIONAL MATCH (prev:Association {associationKind: $associationKind, anchorUid: row.anchorUid})-[:ASSOCIATES]->(y)
WHERE prev.recordedTo IS NULL
SET prev.recordedTo = $computedAt
CREATE (s:Association {uid: row.uid, id: row.id, associationKind: $associationKind, anchorUid: row.anchorUid,
                       score: row.score, inputSetDigest: row.inputSetDigest, inputCount: row.inputCount,
                       methodVersion: $methodVersion, computedAt: $computedAt, staleAfter: $staleAfter,
                       recordedAt: $computedAt, supersedesUid: prev.uid, lastWriterRunId: $runId})
CREATE (s)-[:ASSOCIATES {derivationRule: $methodVersion, derivedAt: $computedAt, lastWriterRunId: $runId}]->(x)
CREATE (s)-[:ASSOCIATES {derivationRule: $methodVersion, derivedAt: $computedAt, lastWriterRunId: $runId}]->(y)
CREATE (s)-[:WAS_GENERATED_BY]->(run)
WITH s, row
UNWIND coalesce(row.inputAssertionUids, []) AS au
MATCH (a:Assertion {uid: au})
CREATE (s)-[:DERIVED_FROM]->(a)
```

- validation: EXPLAIN ok on Neo4j 5.26.31; plan contains CartesianProduct
- The executor's apply path writes this under the `KsIntentMarker`. The ASSOCIATES edges carry no score (R-48), so the score is on the node only.

**G-1. Evidence aggregate inputs (no GDS).**

```cypher
// @gds G-1 input query; the aggregation and G-0 write run in the projection job
MATCH (x:Entity)<-[:HAS_SUBJECT]-(a:Assertion)-[:HAS_OBJECT]->(y:Entity)
WHERE a.predicate IN $effectPredicates AND a.status = 'ACCEPTED' AND a.recordedTo IS NULL
WITH x, y, collect(a) AS inputs WHERE size(inputs) >= 2
RETURN x.uid AS anchorUid, y.uid AS memberUid, size(inputs) AS inputCount,
       [i IN inputs | {uid: i.uid, basis: i.basisKind, predicate: i.predicate}] AS inputRows
```

- validation: EXPLAIN ok on Neo4j 5.26.31

**G-2. Similarity retrieval aid** (Q-D10-19).

```cypher
// @gds G-2
MATCH (a:Assertion)-[:HAS_SUBJECT]->(s:Entity), (a)-[:HAS_OBJECT]->(f:Entity)
WHERE a.status = 'ACCEPTED' AND a.recordedTo IS NULL AND a.predicate IN $featurePredicates
  AND any(l IN labels(s) WHERE l IN $subjectLabels)
RETURN gds.graph.project('d10-sim', s, f, {relationshipType: a.predicate});
CALL gds.nodeSimilarity.stream('d10-sim', {topK: 10, similarityCutoff: 0.2})
YIELD node1, node2, similarity
RETURN gds.util.asNode(node1).uid AS anchorUid, gds.util.asNode(node2).uid AS memberUid, similarity AS score;
CALL gds.graph.drop('d10-sim', false)
```

- validation: EXPLAIN ok on Neo4j 5.26.31 (projection source query); 2 CALL gds.* statement(s): GDS not available on the disposable instance; syntax reviewed against the neo4j-gds-skill

**G-3. Evidence clusters around a scope** (Q-D10-20).

```cypher
// @gds G-3
MATCH (a:Assertion)-[:HAS_SUBJECT]->(s:Entity), (a)-[:HAS_OBJECT]->(o:Entity)
WHERE a.status = 'ACCEPTED' AND a.recordedTo IS NULL AND s.uid IN $scopeUids AND o.uid IN $scopeUids
RETURN gds.graph.project('d10-cl', s, o, {relationshipType: 'CO_ASSERTED'}, {undirectedRelationshipTypes: ['*']});
CALL gds.leiden.stream('d10-cl', {randomSeed: 42, includeIntermediateCommunities: false})
YIELD nodeId, communityId
RETURN communityId, collect(gds.util.asNode(nodeId).uid) AS members;
CALL gds.graph.drop('d10-cl', false)
```

- validation: EXPLAIN ok on Neo4j 5.26.31 (projection source query); 2 CALL gds.* statement(s): GDS not available on the disposable instance; syntax reviewed against the neo4j-gds-skill

**G-4. Independent evidence clusters for claim C** (CQ-ST-07).

```cypher
// @gds G-4
MATCH (c:Claim {uid: $claimUid})<-[:ASSESSES]-(sy:Assessment {assessmentKind: 'EVIDENCE_SYNTHESIS'})
      -[:DERIVED_FROM]->(:Assertion)-[:HAS_SUBJECT]->(:StudyResult)-[:STATED_IN]->(p:Publication)
WHERE sy.recordedTo IS NULL
WITH collect(DISTINCT p) AS pubs
CALL (pubs) {
  UNWIND pubs AS p
  MATCH (p)-[r:REPORTS_ON]->(s:Study) WHERE r.recordedTo IS NULL
  RETURN p AS source, s AS target
  UNION
  UNWIND pubs AS p
  MATCH (p)-[:REPORTS_ON]->(s1:Study)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'SHARES_PARTICIPANTS_WITH', status: 'ACCEPTED'})-[:HAS_OBJECT]->(s2:Study)
  RETURN s1 AS source, s2 AS target
}
RETURN gds.graph.project('d3-independence-' + $requestId, source, target, {}, {undirectedRelationshipTypes: ['*']});
CALL gds.wcc.stream('d3-independence-' + $requestId)
YIELD nodeId, componentId
RETURN count(DISTINCT componentId) AS independentClusters, collect({node: gds.util.asNode(nodeId).uid, cluster: componentId}) AS members;
CALL gds.graph.drop('d3-independence-' + $requestId, false)
```

- validation: EXPLAIN ok on Neo4j 5.26.31 (projection source query); 2 CALL gds.* statement(s): GDS not available on the disposable instance; syntax reviewed against the neo4j-gds-skill

**G-5. Voice influence on frontier F** (Q-D9-19). A retelling is an occurrence `Assertion` that `DERIVED_FROM` an earlier one.

```cypher
// @gds G-5
MATCH (orig:Assertion)<-[:DERIVED_FROM]-(ret:Assertion)-[:OCCURS_IN]->(w:MediaWork)
WHERE (ret)-[:OCCURRENCE_OF]->(:Claim) AND w.publishedAt >= $asOf - duration({months: 24})
  AND EXISTS { MATCH (ret)-[:HAS_SUBJECT|HAS_OBJECT]->(x)
               WHERE EXISTS { (x)-[:ON_FRONTIER]->(:Frontier {key: $frontierKey}) }
                  OR EXISTS { (x)<-[:INVOLVES]-(:Event)-[:ON_FRONTIER]->(:Frontier {key: $frontierKey}) } }
MATCH (orig)-[:ASSERTED_BY]->(source), (ret)-[:ASSERTED_BY]->(target)
WHERE source <> target AND (source:Person OR source:Channel) AND (target:Person OR target:Channel)
WITH source, target, count(*) AS weight
RETURN gds.graph.project('d9-retelling-' + $frontierKey, target, source, {relationshipProperties: {weight: weight}});
CALL gds.pageRank.stream('d9-retelling-' + $frontierKey, {relationshipWeightProperty: 'weight', dampingFactor: 0.85})
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).uid AS voiceUid, score ORDER BY score DESC LIMIT 50;
CALL gds.graph.drop('d9-retelling-' + $frontierKey, false)
```

- validation: EXPLAIN ok on Neo4j 5.26.31 (projection source query); 2 CALL gds.* statement(s): GDS not available on the disposable instance; syntax reviewed against the neo4j-gds-skill

**G-6. Candidate modulators by shared molecular targets** (Q-D2-19).

```cypher
// @gds G-6
MATCH (s:ChemicalSubstance)<-[:HAS_SUBJECT]-(a:Assertion)-[:HAS_OBJECT]->(t:MolecularEntity)
WHERE a.predicate IN ['INHIBITS', 'ACTIVATES', 'BINDS', 'INCREASES_ACTIVITY_OF', 'DECREASES_ACTIVITY_OF']
  AND a.basisKind IN ['DIRECT_MEASUREMENT', 'INFERRED_FROM_MEASUREMENT', 'CITED_FROM_PRIOR_WORK']
  AND a.status IN ['ACCEPTED', 'DISPUTED'] AND a.recordedTo IS NULL
WITH DISTINCT s, t
RETURN gds.graph.project('d2-substance-target', s, t, {relationshipType: 'HITS'});
CALL gds.nodeSimilarity.stream('d2-substance-target', {similarityCutoff: 0.2, topK: 10})
YIELD node1, node2, similarity
WITH gds.util.asNode(node1) AS s, gds.util.asNode(node2) AS s2, similarity
MATCH (s2)-[r2:AFFECTS_MECHANISM]->(m:Mechanism) WHERE r2.bestBasis = 'DIRECT_MEASUREMENT' AND NOT (s)-[:AFFECTS_MECHANISM]->(m)
RETURN s.uid AS anchorUid, m.uid AS memberUid, max(similarity) AS score, collect(s2.uid)[0..5] AS becauseOf;
CALL gds.graph.drop('d2-substance-target', false)
```

- validation: EXPLAIN ok on Neo4j 5.26.31 (projection source query); 2 CALL gds.* statement(s): GDS not available on the disposable instance; syntax reviewed against the neo4j-gds-skill

**G-7. Near-substitute panels** (Q-D4-25).

```cypher
// @gds G-7
MATCH (p:LabTest {testKind: 'PANEL'})-[inc:INCLUDES_TEST]->(:LabTest)-[mm:MEASURES_METRIC]->(m:Metric)
WHERE inc.recordedTo IS NULL AND mm.recordedTo IS NULL
RETURN gds.graph.project('d4-panel-metric', p, m, {}, {undirectedRelationshipTypes: ['*']});
CALL gds.nodeSimilarity.stream('d4-panel-metric', {similarityCutoff: 0.3, topK: 10})
YIELD node1, node2, similarity
WITH gds.util.asNode(node1) AS a, gds.util.asNode(node2) AS b, similarity WHERE a.uid = $panelUid
RETURN b.uid, b.name, similarity ORDER BY similarity DESC;
CALL gds.graph.drop('d4-panel-metric', false)
```

- validation: EXPLAIN ok on Neo4j 5.26.31 (projection source query); 2 CALL gds.* statement(s): GDS not available on the disposable instance; syntax reviewed against the neo4j-gds-skill

**G-8. Food substitution by composition** (Q-D12-20).

```cypher
// @gds G-8
MATCH (f:FoodItem)-[r:FOOD_CONTAINS]->(c)
WHERE r.recordedTo IS NULL AND r.amountBasis = 'PER_100G' AND r.quantity IS NOT NULL
  AND f.definingSystem IN $definingSystems
WITH c, r.unitCode AS unit, collect({f: f, v: r.quantity}) AS rows, max(r.quantity) AS mx
UNWIND rows AS row
WITH row.f AS f, c, CASE WHEN mx > 0 THEN row.v / mx ELSE 0.0 END AS w
RETURN gds.graph.project('food-composition', f, c, {relationshipProperties: {weight: w}});
CALL gds.nodeSimilarity.stream('food-composition', {topK: 10, relationshipWeightProperty: 'weight'})
YIELD node1, node2, similarity
RETURN gds.util.asNode(node1).uid AS food, gds.util.asNode(node2).uid AS substitute, similarity;
CALL gds.graph.drop('food-composition', false)
```

- validation: EXPLAIN ok on Neo4j 5.26.31 (projection source query); 2 CALL gds.* statement(s): GDS not available on the disposable instance; syntax reviewed against the neo4j-gds-skill

**G-9. Stack co-occurrence for target T** (Q-D5-19).

```cypher
// @gds G-9
MATCH (:Protocol)-[he:HAS_EDITION]->(e:ProtocolEdition)-[:HAS_STEP]->(s:ProtocolStep)-[:STEP_USES]->(m)
WHERE he.recordedTo IS NULL AND (he.validTo IS NULL OR he.validTo > $asOf)
  AND ($targetKey IS NULL OR $targetKey IN s.targetKeys) AND s.stepKind IN ['TAKE', 'PRACTICE']
RETURN gds.graph.project('d5-stack-cooccurrence', m, e, {relationshipType: 'IN_EDITION'});
CALL gds.nodeSimilarity.stream('d5-stack-cooccurrence', {similarityCutoff: 0.1, topK: 10})
YIELD node1, node2, similarity
RETURN gds.util.asNode(node1).uid AS anchorUid, gds.util.asNode(node2).uid AS memberUid, similarity AS score;
CALL gds.graph.drop('d5-stack-cooccurrence', false)
```

- validation: EXPLAIN ok on Neo4j 5.26.31 (projection source query); 2 CALL gds.* statement(s): GDS not available on the disposable instance; syntax reviewed against the neo4j-gds-skill

**G-10. Undisclosed-tie leads and connector people** (Q-D7-23 and the Q-D7 discovery variant).

```cypher
// @gds G-10
MATCH (p:Person)-[r:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(o:Organization)
WHERE r.recordedTo IS NULL
RETURN gds.graph.project('d7-ties', p, o, {relationshipType: 'TIE'}, {undirectedRelationshipTypes: ['*']});
CALL gds.nodeSimilarity.stream('d7-ties', {topK: 10, similarityCutoff: 0.2})
YIELD node1, node2, similarity
WITH gds.util.asNode(node1) AS p, gds.util.asNode(node2) AS peer, similarity WHERE p:Person AND peer:Person
MATCH (peer)-[:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(o:Organization)
WHERE NOT (p)-[:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(o)
RETURN p.uid, o.uid, sum(similarity) AS leadScore ORDER BY leadScore DESC LIMIT 200;
CALL gds.betweenness.stream('d7-ties')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS n, score WHERE n:Person
RETURN n.uid, score ORDER BY score DESC LIMIT 50;
CALL gds.graph.drop('d7-ties', false)
```

- validation: EXPLAIN ok on Neo4j 5.26.31 (projection source query); 3 CALL gds.* statement(s): GDS not available on the disposable instance; syntax reviewed against the neo4j-gds-skill

## Validation summary

All numbers are from `final/_work/validate-patterns.mjs` and `final/_work/gen-patterns-ddl.mjs` runs logged in `_runlog/patterns.md`. The final run was at 2026-10-09T04:39Z on Neo4j 5.26.31 Community.

**Fix-stage re-run (2026-10-09, `_runlog/fix.md` section 6).** After the P-10a.2, P-10a.4 and P-10b edits and the IR change (R-49 properties), `validate-patterns.mjs` was run twice against the regenerated `patterns-ddl.cypher` (229 statements, from IR `c7cf1235…4793`). Both runs: 278 DDL statements executed, 0 failed; 39 of 39 query statements EXPLAIN ok; 9 of 9 projection sources and 1 of 1 input query ok; 19 `CALL gds.*` not run. On the empty store (0 nodes), `withAllNodesScan` was P-10c.2. With the claim fixture loaded (203 nodes), it was none. Both runs dropped their 278 schema objects afterwards.

**Blocks validated: 46.**

- 3 DDL blocks (D-1, D-3, D-4).
- 33 query-pattern blocks: P-01a … P-12 and G-0.
- 10 GDS blocks: G-1 … G-10.

**Query statements: 39, all EXPLAIN ok, 0 errors.** The P-blocks hold 38 statements and G-0 holds 1.

**GDS blocks.**

- 9 projection source queries and 1 input query (G-1) are EXPLAIN ok.
- 19 `CALL gds.*` statements could not run: GDS is not available on the disposable instance, and their syntax was reviewed against the neo4j-gds-skill.

**EXPLAIN-validated statements: 49 in total, 0 errors.**

**DDL: 278 statements**, 229 generated and 49 hand-written.

- On the first run all 278 were accepted. The database held 0 nodes just before that run and 354 nodes from another S agent's fixture load just after it.
- On the final run, with 681 fixture nodes present, 277 were accepted. `identifier_key` was refused: the loaded fixture graph holds four pairs of `Identifier` nodes with the same (scheme, issuer, value), which R-42 forbids (Q-7).
- After `db.awaitIndexes`, 279 of 279 indexes were ONLINE.
- Every schema object this stage created was dropped after each run (277 or 278 per run), so the instance is left with its own two lookup indexes.

**Plan red flags (EXPLAIN on an empty or small store, so these indicate shape, not cost).**

- No statement plans an `AllNodesScan` on a store that holds a fixture graph. On an empty store P-10c.2 does: `MATCH ()-[r:A|B|…]->()` binds no endpoint, and with no relationships of those types to count the planner picks `AllNodesScan` + `Expand(All)` (fix-stage re-run with 0 nodes, `_runlog/fix.md` section 6). It is an audit scan by design (see "Label or type scans" below).
- `CartesianProduct` appears in three places, and each is a join of single-row index seeks:
  - P-10d: two Activity seeks.
  - G-0: two Entity seeks per row.
  - G-5: a notification inside the frontier `EXISTS`.
- Label or type scans are deliberate:
  - P-01c is an audit over all accepted assertions.
  - P-10c.2 scans the derived relationship types.
  - G-5 … G-10 are graph-global projection jobs.

**Smoke execution (read-only, not a fixture verdict).** The cross-domain compound-profile fixture graph (`mission:ft-S-xfx-fixtures`) was loaded by another S agent during this stage. Against it:

- P-01b, P-02a, P-02b, P-02d, P-04b, P-04e, P-10a … P-10e and P-12 ran and returned rows.
- P-09 returned 0 rows (that fixture has no recommendation).
- P-10c returned 0 rows (no other mission depends on it).

The run found two defects that EXPLAIN cannot find, and both are fixed above:

- `labels(x)[0]` returned archetype labels (`Entity`, `EvidenceAssessment`), which led to the KIND convention.
- A mandatory biomarker hop returned 0 rows for a mechanism with no biomarker, so P-12's hop 2 is now an `OPTIONAL CALL`.

The row counts are in `_runlog/patterns.md`. They describe an in-progress graph and are not acceptance evidence.

## Open questions raised by this stage

- **Q-1 (owner).** The embedding model and its dimensions are not pinned by any packet. D-4 uses D9's 1536-dimension placeholder. It must equal the chosen model's output, `Chunk.embeddingModel` must record it, and a model change means drop, recreate and re-embed.
- **Q-2 (owner / migration).** Entry by uid uses a new `entity_uid` uniqueness constraint on `:Entity`, because the kernel's dynamic-label lookup plans an `AllNodesScan` on 5.26.31. This is zero schema cost and one extra index over the Subjectable nodes. An alternative is caller-side templating of the static label from the uid token. Whether Neo4j 2025.x+ seeks on dynamic labels was not measured here.
- **Q-3 (integrator).** The IR classes `MEASURES` (OutcomeDefinition → Metric/Biomarker/Outcome/Condition) as `derived` but gives it `AssertedRecordedProperties`. It also classes `HAS_VARIANT` and `REQUIRES_INPUT_METRIC` as `asserted` but gives them `StructuralEdgeProperties`, so they have no `assertionUid` or episode. The generated DDL follows the properties, which gives 63 `assertionUid` indexes against 64 asserted types. The relClass and the properties should agree.
- **Q-4 (K / D9).** R-49 rules that discourse metrics (G-5) are projection-cache properties on Person, Channel and Claim, with `methodVersion` and `derivedAt`. Since the fix stage (2026-10-09) the SDL declares them: `Claim.discourse*` (counts, first occurrence, method version, derivedAt) and `influenceScore`, `influenceMethodVersion`, `influenceDerivedAt` on `Person` and `Channel`. G-5 streams one score per frontier, but the cache holds one graph-wide score per voice, so the per-frontier write target stays open (open-questions FU-11).
- **Q-5 (production).** GDS availability on the deployment target is open (D10 open question 22). Without it G-2 to G-10 run offline or not at all, while G-0 and G-1 need only Cypher.
- **Q-6 (production).** The validated forms are Cypher 5 on Neo4j 5.26. On Neo4j 2026.01+, P-04a should move to the `SEARCH` clause and D-4 should add the in-index filter properties (`WITH [...]`).
- **Q-7 (fixtures / K).** The fixture graph loaded into the shared instance during this stage holds duplicate `Identifier` keys. Two minting conventions produce them:
  - The cross-domain fixture's `hu:identifier:xfx-cp-ident-sub-nrcl-unii`.
  - The packet fixture's `hu:identifier:unii-8xm2xt8vwi`.

  Both mint (UNII, FDA GSRS, 8XM2XT8VWI), and the same happens for one more UNII, one PubChem CID and one DSLD id. This breaks R-42 and K's `identifier_key`. The Identifier uid should be minted deterministically from the normalized (scheme, issuer, value), so that fixtures and runs MERGE onto one node.
