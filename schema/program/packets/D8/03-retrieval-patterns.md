# D8 — retrieval patterns

MODEL stage, A7, 2026-10-08. One section per question in `02-questions.md`. Types and fields are those of `04-schema-proposal.graphql` (D8) and A1's kernel (`packets/K/04-schema-proposal.graphql`). Seam types (`Organization`, `Product`, `ProductVariant`, `ChemicalSubstance`, `IngredientMaterial`, `Constituent`, `Device`) are written with the names in `10-seams.yaml`; when their owners rename them the patterns change by name only. Some patterns also **read** relationships other modules declare (D9 `Chunk` `CHUNK_OF` / `COVERS_LOCATOR` / `MENTIONS`; D6 `HAS_VARIANT` / `HAS_PACKAGE` / `HAS_LABEL_VERSION` / `DECLARES_COMPONENT`; D1 `REALIZES_SUBSTANCE`; D5 predicate `INTENDED_FOR_TARGET`): those are read-only joins in Cypher, checked against the owners' SDL on 2026-10-08, and D8 declares nothing for them.

Adversarial-review revision (2026-10-08): `RESULT_FOR` → `QUALITY_RESULT_FOR`; Q-D8-02 filters moved before the OPTIONAL MATCH; Q-D8-03 uses D9's real names; Q-D8-05 and Q-D8-08 now traverse `QUALITY_RESULT_FOR` / `LOT_OF`; CQ-MF-06 no longer reads `COVERS → Organization`; Q-D8-16 reads `RATES_CLAIM`; Q-D8-18 reads ingredient- and substance-level standing; Q-D8-21 reads licence-term amendments; Q-D8-23 is new.

## Conventions used below

**Stored directions.** `(:RegulatoryRecord)-[:ISSUED_BY|ADDRESSED_TO|CONCERNS]->`, `(:LegalStatus)-[:STATUS_OF]->(subject)`, `(:LegalStatus)-[:STATUS_FROM]->(:RegulatoryRecord)`, `(:Lot)-[:LOT_OF]->`, `(:QualityResult)-[:QUALITY_RESULT_FOR|MEASURES_ANALYTE|ISSUED_BY]->`, `(:CertificationListing)-[:ISSUED_BY|COVERS]->`, `(:Patent)-[:ASSIGNED_TO|LICENSED_TO|CONCERNS]->`. Kernel: `(:Assertion)-[:HAS_SUBJECT|HAS_OBJECT|ASSERTED_BY]->`, `(:Assertion)-[:HAS_EVIDENCE {role, origin}]->(:SourceLocator)`, `(:Source)-[:HAS_SNAPSHOT]->(:SourceSnapshot)-[:HAS_LOCATOR]->(:SourceLocator)`, `(:Assessment)-[:ASSESSES]->`, `(:Assessment)-[:DERIVED_FROM]->(:Assertion)`, `(x)-[:WAS_GENERATED_BY]->(:Activity)`.

**AS_OF(r)** — an episode edge (STATUS_OF, COVERS, ASSIGNED_TO, LICENSED_TO) at valid time `$V` as recorded at `$R` (half-open; null `validFrom` = unknown start, returned with a flag, never treated as "always"; null `validTo` = no known end, never "ongoing"):

```cypher
WHERE (r.validFrom IS NULL OR r.validFrom <= $V) AND (r.validTo IS NULL OR $V < r.validTo)
  AND r.recordedFrom <= $R AND (r.recordedTo IS NULL OR $R < r.recordedTo)
```

**KNOWN_AT(r)** — a recorded-only edge (every other D8 edge; kernel `AssertedRecordedProperties`, no valid-time fields — any stated valid time is read from the authorizing Assertion) as recorded at `$R`: `r.recordedFrom <= $R AND (r.recordedTo IS NULL OR $R < r.recordedTo)`. Default `$R = datetime()`.

**TRACE(r)** — every asserted D8 edge carries `assertionUid`; the answer cites the locators of that Assertion and, through them, the snapshot bytes and the producing mission (00-DIRECTIVE 4):

```cypher
MATCH (a:Assertion {uid: r.assertionUid})-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity)
OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(a)
RETURN loc.exact, loc.page, loc.startOffset, snap.contentHash, snap.retrievedAt, src.canonicalUri,
       act.missionId, act.runId, adj.verdict
```

Property-level facts (an outcome sentence, a recall class, a result value) cite the Assertion that wrote them the same way: the executor writes a node's properties under an Assertion whose subject is the node (`HAS_SUBJECT`), so `TRACE_NODE(n)` = `MATCH (a:Assertion)-[:HAS_SUBJECT]->(n) WHERE a.predicate STARTS WITH 'D8.'` then TRACE on `a`.

**Record-kind → stage mapping** (fixed table in the answer layer, not stored; used by CQ-AX-23 and Q-D8-20): FILING = NDI_NOTIFICATION, GRAS_NOTICE, FOOD_ADDITIVE_PETITION, CITIZEN_PETITION; OPINION = SCIENTIFIC_OPINION; RESPONSE = NDI_RESPONSE, GRAS_RESPONSE, CITIZEN_PETITION_RESPONSE; ACT = NOVEL_FOOD_AUTHORISATION, NHP_LICENCE, DRUG_APPLICATION_ACTION, DEVICE_CLEARANCE, DESIGNATION, REGISTRATION; ENFORCEMENT = INSPECTION_CLASSIFICATION, FORM_483, WARNING_LETTER, CLOSE_OUT_LETTER, RECALL, IMPORT_ALERT, SAFETY_COMMUNICATION; DECISION = COURT_DECISION, PTAB_DECISION, PATENT_OFFICE_ACTION.

**Status → "is not" table** (answer layer, CQ-AX-23): NO_QUESTIONS ⇏ APPROVED, ⇏ "safe and effective", scope = the notified uses and levels; NOTIFICATION_ON_FILE ⇏ AUTHORISED; FAVOURABLE_OPINION_ONLY ⇏ AUTHORISED; REGISTERED ⇏ CLEARED or APPROVED; LICENSED ⇏ MARKETED (read `marketStatus`); NOT_EXCLUDED_FROM_DEFINITION ⇏ "lawful supplement" (NDI and safety obligations remain); PATENT_IN_FORCE ⇏ "claims valid" (look for CLAIMS_HELD_INVALID).

No D8 question needs GDS: D8 answers are as-of traversals over dated records (09-reasoning "GDS"). Vector and fulltext appear only where text is the entry point (Q-D8-03, Q-D8-04, Q-D8-07).

## CQ-MF-02

- kind: cypher
- pattern: standing of subject X in jurisdiction J at date V, with the record that produced it.

```cypher
MATCH (x {uid: $subjectUid})<-[r:STATUS_OF]-(s:LegalStatus {jurisdiction: $J})
WHERE s.statusFamily IN ['MARKET_ACCESS','EXCLUSIVITY'] AND /* AS_OF(r) */ true
MATCH (s)-[f:STATUS_FROM]->(rec:RegulatoryRecord)-[:ISSUED_BY]->(issuer:Organization)
RETURN s.statusKind, s.pathway, s.statusVerbatim, s.marketStatus, r.validFrom, r.validTo,
       rec.recordKind, rec.recordNumber, rec.issuedAt, rec.conditionsVerbatim, issuer.name, r.assertionUid, f.assertionUid
ORDER BY r.validFrom DESC
```

- trace: TRACE(r) (the standing and its valid time) and TRACE(f) (that this record establishes it); the record's `outcomeVerbatim` cites TRACE_NODE(rec).
- bitemporal episode needed on: STATUS_OF.

## Q-D8-01

- kind: cypher
- pattern: every status episode of X (all recorded versions), ordered, with superseded/superseding records; "as recorded then vs now" = run with `$R` = then and `$R` = now.

```cypher
MATCH (x {uid: $subjectUid})<-[r:STATUS_OF]-(s:LegalStatus {jurisdiction: $J})
OPTIONAL MATCH (s)-[:STATUS_FROM]->(rec:RegulatoryRecord)
RETURN s.statusKind, s.pathway, r.validFrom, r.validTo, r.recordedFrom, r.recordedTo,
       collect(DISTINCT {kind: rec.recordKind, number: rec.recordNumber, issuedAt: rec.issuedAt}) AS records
ORDER BY r.validFrom, r.recordedFrom
// as-of comparison: apply AS_OF(r) with ($V = D, $R = D) and with ($V = D, $R = datetime())
```

- trace: TRACE(r) per episode; for NMN the 2022 episode cites the NDI 1259 determination quote and the closing episode cites the 2025 petition-response quote (fixture nmn-us-exclusion-reversal).
- bitemporal episode needed on: STATUS_OF (valid time for when the standing held; recorded time for "what we would have answered").

## CQ-AX-23

- kind: cypher
- pattern: CQ-MF-02 for "is X approved", then the "is not" table above applied to each returned `statusKind`, plus the record's own scope-limiting sentence.

```cypher
MATCH (x {uid: $subjectUid})<-[r:STATUS_OF]-(s:LegalStatus) WHERE /* AS_OF(r) */ true
MATCH (s)-[:STATUS_FROM]->(rec:RegulatoryRecord)
RETURN s.jurisdiction, s.statusKind, rec.recordKind, rec.outcome, rec.scopeLimitVerbatim, rec.conditionsVerbatim, r.assertionUid
```

- trace: TRACE(r); the scope limit ("This letter is not an affirmation that … is GRAS") is quoted from TRACE_NODE(rec).
- bitemporal episode needed on: STATUS_OF.

## CQ-MF-03

- kind: cypher (retrieval of the inputs) + kernel Assessment (the verdict)
- pattern: company claim occurrences whose object is an agency record, paired with that record's own words and any RETELLING_FIDELITY assessment.

```cypher
MATCH (co:Assertion {assertionKind: 'CLAIM', predicate: 'CHARACTERIZES_REGULATORY_RECORD'})-[:HAS_OBJECT]->(rec:RegulatoryRecord)
MATCH (co)-[:ASSERTED_BY]->(company:Organization)
OPTIONAL MATCH (asm:Assessment {assessmentKind: 'RETELLING_FIDELITY'})-[:DERIVED_FROM]->(co)
WHERE asm.recordedTo IS NULL
RETURN company.name, co.proposition, rec.recordKind, rec.recordNumber, rec.outcomeVerbatim, rec.scopeLimitVerbatim,
       asm.verdict, asm.methodVersion, co.uid
```

- trace: TRACE on `co` (company page locator) and TRACE_NODE(rec) (agency letter locator); the assessment cites both through HAS_EVIDENCE.
- bitemporal episode needed on: none (claim occurrences carry their own valid time).

## CQ-PF-04

- kind: cypher + kernel Assessment (APPLICABILITY, subkind D8.conditions-of-use)
- pattern: conditions of use of the record behind X's standing, beside the product's dose and form from D6.

```cypher
MATCH (ing {uid: $ingredientUid})<-[r:STATUS_OF]-(s:LegalStatus {jurisdiction: $J})-[:STATUS_FROM]->(rec:RegulatoryRecord)
WHERE /* AS_OF(r) */ true AND rec.conditionsVerbatim IS NOT NULL
OPTIONAL MATCH (asm:Assessment {assessmentKind: 'APPLICABILITY', assessmentSubkind: 'D8.conditions-of-use'})-[:ASSESSES]->(p {uid: $productUid})
RETURN rec.recordNumber, rec.conditionsVerbatim, asm.verdict, asm.rationale
// product dose and form come from the D6 formulation of $productUid (D6 pattern)
```

- trace: TRACE_NODE(rec) for the conditions sentence; the assessment's HAS_EVIDENCE for the product label locator.
- bitemporal episode needed on: STATUS_OF.

## Q-D8-02

- kind: cypher
- pattern: enforcement records by issuer, addressee, product, category and date.

```cypher
MATCH (rec:RegulatoryRecord {recordFamily: 'ENFORCEMENT'})
WHERE ($category IS NULL OR $category IN rec.violationCategories) AND rec.issuedAt >= $from
WITH rec                                         // filters bind to the record, not to the optional product leg
MATCH (rec)-[i:ISSUED_BY]->(issuer:Organization)
MATCH (rec)-[a:ADDRESSED_TO]->(firm:Organization)
OPTIONAL MATCH (rec)-[c:CONCERNS]->(p:Product)
RETURN issuer.name, rec.recordKind, rec.recordNumber, rec.issuedAt, firm.name, collect(p.name) AS products,
       rec.violationCategories, rec.recallClass, rec.recallStatus, a.assertionUid
ORDER BY rec.issuedAt DESC
```

- trace: TRACE(a) (addressee), TRACE(c) (product), TRACE_NODE(rec) (category, class, status).
- bitemporal episode needed on: none (records are immutable; KNOWN_AT for "as recorded").

## Q-D8-03

- kind: vector + cypher (the 00-DIRECTIVE 3.8 demonstrator, fixture imu-tek-warning-letter-recall)
- pattern: (1) structured: every record addressed to the firm, ordered by date, with the inspection window from the warning letter; (2) unstructured entry: chunks of the letter found by MENTIONS or by vector search, then the assertions their spans support.

```cypher
// (1) structured chain
MATCH (rec:RegulatoryRecord)-[a:ADDRESSED_TO]->(firm:Organization {uid: $firmUid})
RETURN rec.recordKind, rec.recordNumber, rec.issuedAt, rec.inspectionStartedAt, rec.inspectionEndedAt, rec.outcome, a.assertionUid
ORDER BY coalesce(rec.inspectionStartedAt, rec.issuedAt);

// (2) question → chunk → locator → assertion → snapshot. D9-declared, read only: Chunk CHUNK_OF → SourceSnapshot
//     (structural), COVERS_LOCATOR → SourceLocator (derived span-overlap/v1, offsets compared by D9 in one basis),
//     MENTIONS (derived); index chunk_embedding is D9's. D8 declares nothing for these.
//     Neo4j 5.26 (Cypher 5): the vector index is queried through the db.index.vector.queryNodes procedure.
CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS c, score
MATCH (c)-[:MENTIONS]->(firm:Organization {uid: $firmUid})           // or start from MENTIONS alone
MATCH (c)-[:CHUNK_OF]->(snap:SourceSnapshot)
MATCH (c)-[:COVERS_LOCATOR]->(loc:SourceLocator)<-[ev:HAS_EVIDENCE {role: 'SUPPORTS'}]-(a:Assertion)
RETURN score, c.uid, a.predicate, a.proposition, loc.exact, loc.startOffset, snap.contentHash;
// (3) entity hop for records whose text no chunk covers (the recall JSON): the firm reached in (2) →
//     (rec:RegulatoryRecord)-[:ADDRESSED_TO]->(firm), then TRACE on its edges (fixture walk step2b)
```

- trace: the path itself ends at the locator and the snapshot digest; the verifier re-selects `loc.selectorJson` on `snap` and must find the same `exact` (quotes 1–5 of FC-2). Chunks are only the entry point; they are never cited. The recall steps of the chain (initiated, classified, terminated) are reached by the entity hop (3), not by a chunk: the fixture walk records it as `step2b_entity_hop` with the recall snapshot in step 3.
- bitemporal episode needed on: none.

## Q-D8-04

- kind: cypher + fulltext fallback
- pattern: (1) resolved lot → recall records that CONCERN it; (2) lot not resolved → fulltext over the recall's verbatim lot text for the product's records.

```cypher
// (1)
MATCH (lot:Lot {lotCode: $lotCode})-[:LOT_OF]->(p {uid: $productUid})
MATCH (rec:RegulatoryRecord {recordKind: 'RECALL'})-[c:CONCERNS]->(lot)
RETURN rec.recordNumber, rec.recallClass, rec.recallStatus, rec.reasonVerbatim, rec.issuedAt, rec.terminatedAt, c.assertionUid

// (2) fulltext index: CREATE FULLTEXT INDEX reg_record_lot_text IF NOT EXISTS FOR (r:RegulatoryRecord) ON EACH [r.lotCodesVerbatim, r.productDescriptionVerbatim]
CALL db.index.fulltext.queryNodes('reg_record_lot_text', '"' + $lotCode + '"') YIELD node AS rec, score
MATCH (rec)-[:CONCERNS]->(p {uid: $productUid})
RETURN rec.recordNumber, rec.lotCodesVerbatim, score
```

- trace: TRACE(c) (the code_info locator, a JSON-pointer selector on the openFDA snapshot); a "no record found" answer names the sources and their latest `snap.retrievedAt` and only if `captureCompleteness = COMPLETE`.
- bitemporal episode needed on: none.

## CQ-AX-19

- kind: cypher
- pattern: results for the lot (and product-level results when no lot-level result exists), split by resultBasis, beside the label claim (D6) and the tester.

```cypher
MATCH (lot:Lot {uid: $lotUid})-[:LOT_OF]->(p)
OPTIONAL MATCH (q1:QualityResult)-[r1:QUALITY_RESULT_FOR]->(lot)
OPTIONAL MATCH (q2:QualityResult)-[r2:QUALITY_RESULT_FOR]->(p) WHERE q1 IS NULL
WITH coalesce(q1, q2) AS q, coalesce(r1, r2) AS r
OPTIONAL MATCH (q)-[:ISSUED_BY]->(lab:Organization)          // zero_or_one: a COA can name no issuer
OPTIONAL MATCH (q)-[:MEASURES_ANALYTE]->(an)
RETURN q.analyteVerbatim, an.name, q.resultBasis, q.value, q.unitCode, q.valueQualifier, q.labelClaimValue,
       q.method, q.testedAt, lab.name, r.assertionUid
ORDER BY q.resultBasis = 'MEASURED' DESC
```

- trace: TRACE(r) — the table row locator (PDF page + row selector, extraction mode recorded) on the COA or report snapshot.
- bitemporal episode needed on: none.

## Q-D8-05

- kind: cypher (rows) + kernel Assessment QUALITY subkind D8.coa-classification (document verdict)
- pattern: rows of one COA Source with their basis; the document-level classification is the assessment over those rows.

```cypher
MATCH (src:Source {uid: $coaSourceUid})-[:HAS_SNAPSHOT]->(:SourceSnapshot)-[:HAS_LOCATOR]->(loc:SourceLocator)
MATCH (a:Assertion)-[:HAS_EVIDENCE]->(loc)
MATCH (a)-[:HAS_SUBJECT]->(q:QualityResult)
OPTIONAL MATCH (q)-[:ISSUED_BY]->(lab:Organization)          // "who issued it": null is itself an answer (no issuer named)
OPTIONAL MATCH (q)-[:QUALITY_RESULT_FOR]->(t)                 // the lot (or product) the certificate is for
OPTIONAL MATCH (asm:Assessment {assessmentSubkind: 'D8.coa-classification'})-[:ASSESSES]->(src)
RETURN q.analyteVerbatim, q.resultBasis, q.valueVerbatim, q.method, q.reportNumber, lab.name, t.lotCode,
       count(CASE WHEN q.resultBasis = 'MEASURED' THEN 1 END) AS measuredRows, asm.summary, asm.methodVersion
```

- trace: each row's locator; the assessment cites the rows it read (DERIVED_FROM) and the title locator ("Certificate of Analysis").
- bitemporal episode needed on: none.

## Q-D8-06

- kind: cypher
- pattern: results for analyte X at < 10 % of claim or not detected, by product, with the tester and the tester's financial interests (D7 pattern).

```cypher
MATCH (q:QualityResult)-[:MEASURES_ANALYTE]->(an {uid: $analyteUid})
MATCH (q)-[rf:QUALITY_RESULT_FOR]->(target)
OPTIONAL MATCH (target:Lot)-[:LOT_OF]->(prod)
WITH q, rf, coalesce(prod, target) AS product
WHERE q.resultBasis = 'MEASURED'
  AND (q.valueQualifier IN ['NOT_DETECTED','BELOW_DETECTION_LIMIT','BELOW_REPORTING_LIMIT']
       OR coalesce(q.percentOfLabelClaimStated, 100.0 * q.value / q.labelClaimValue) < 10)
OPTIONAL MATCH (q)-[:ISSUED_BY]->(tester:Organization)
RETURN product.name, q.value, q.unitCode, q.valueQualifier, q.labelClaimValue, q.method, tester.uid, tester.name, rf.assertionUid
// then D7: tester.uid → financial-interest edges valid at q.testedAt (D7-owned financial-interest pattern, read from the D7 Organization; D8 declares no edge for it)
```

- trace: TRACE(rf) (row locator, e.g. "Elysium Health Basis Capsule 250 261" with extraction mode raw).
- bitemporal episode needed on: none in D8 (D7's interest edges carry episodes).

## Q-D8-07

- kind: cypher (kernel assertions) + fulltext on locators
- pattern: counterfeit reports are predicate-only Assertions.

```cypher
MATCH (a:Assertion {predicate: 'REPORTED_COUNTERFEIT'})-[:HAS_SUBJECT]->(t)
WHERE (t:Lot AND (t)-[:LOT_OF]->(:Product {uid: $productUid})) OR (t:Product AND t.uid = $productUid)
MATCH (a)-[:ASSERTED_BY]->(reporter)
RETURN t.uid, a.proposition, a.qualifiers, reporter.name, a.uid
```

- trace: TRACE on `a` (indicator sentence, e.g. "outdated and out-of-market lot numbers"); the reporter's interest is a D7 join.
- bitemporal episode needed on: none.

## CQ-PF-03

- kind: cypher
- pattern: listing → covered targets with their coverage episodes as of V.

```cypher
MATCH (cl:CertificationListing)-[r:COVERS]->(t)
WHERE t.uid = $targetUid OR (t:Lot AND (t)-[:LOT_OF]->({uid: $targetUid}))
MATCH (cl)-[:ISSUED_BY]->(certifier:Organization)
WITH cl, certifier, t, r WHERE /* AS_OF(r) */ true
RETURN certifier.name, cl.programme, cl.standard, cl.coverageKind, cl.scopeVerbatim, labels(t), t.name, r.validFrom, r.validTo, r.assertionUid
```

- trace: TRACE(r) (the listing page locator for the product row or the lot row); scope sentence via TRACE_NODE(cl).
- bitemporal episode needed on: COVERS.

## Q-D8-08

- kind: cypher
- pattern: is lot L covered at V; did coverage end; diff between two observation dates.

```cypher
MATCH (lot:Lot {lotCode: $lotCode})-[:LOT_OF]->(prod {uid: $productUid})   // the buyer holds a product and a printed lot code
MATCH (cl:CertificationListing)-[r:COVERS]->(lot)
RETURN cl.programme, cl.status, r.validFrom, r.validTo, r.validFromBasis, r.recordedFrom, r.recordedTo, r.assertionUid
ORDER BY r.recordedFrom
// dropped off: an episode whose validTo is set (last observed) and no later episode for the same lot
```

- trace: TRACE(r) on both observations (two snapshots of the same Source with different `contentHash`); change detection from `tool:firecrawl-change-tracking`.
- bitemporal episode needed on: COVERS.

## CQ-MF-06

- kind: cypher + kernel Assessment QUALITY subkind D8.gmp-signal
- pattern: the signals for a firm: enforcement records with CGMP categories, facility-level certifier listings (predicate-only LISTING_COVERS_FACILITY_OF; COVERS no longer targets Organization), self-claims (claim occurrences CLAIMS_CGMP_COMPLIANCE); the conclusion is an assessment.

```cypher
MATCH (firm:Organization {uid: $firmUid})
OPTIONAL MATCH (rec:RegulatoryRecord)-[:ADDRESSED_TO]->(firm)
  WHERE any(v IN rec.violationCategories WHERE v IN ['CGMP_DIETARY_SUPPLEMENT','CGMP_DRUG'])
OPTIONAL MATCH (fa:Assertion {predicate: 'LISTING_COVERS_FACILITY_OF'})-[:HAS_OBJECT]->(firm)
OPTIONAL MATCH (fa)-[:HAS_SUBJECT]->(cl:CertificationListing {coverageKind: 'FACILITY'})
  WHERE fa.recordedTo IS NULL AND (fa.validTo IS NULL OR datetime() < fa.validTo)
OPTIONAL MATCH (asm:Assessment {assessmentSubkind: 'D8.gmp-signal'})-[:ASSESSES]->(firm)
RETURN collect(DISTINCT rec.recordNumber), collect(DISTINCT cl.programme), collect(DISTINCT cl.scopeVerbatim), asm.verdict, asm.rationale
```

- trace: TRACE_NODE(rec) for the finding quote (e.g. "you have not established finished product specifications"); TRACE on `fa` for the listing.
- bitemporal episode needed on: none in D8 (the listing assertion carries its valid time).

## Q-D8-09

- kind: cypher
- pattern: the criterion printed beside a result, its setter and period, and the stated verdict; evaluated verdicts from the assessment.

```cypher
MATCH (q:QualityResult)-[r:QUALITY_RESULT_FOR]->({uid: $lotOrProductUid})
OPTIONAL MATCH (asm:Assessment {assessmentSubkind: 'D8.spec-conformance'})-[:DERIVED_FROM]->(:Assertion)-[:HAS_SUBJECT]->(q)
RETURN q.analyteVerbatim, q.value, q.unitCode, q.specComparator, q.specLow, q.specHigh, q.specVerbatim,
       q.specBasis, q.specPeriod, q.statedVerdict, asm.verdict, r.assertionUid
```

- trace: TRACE(r) (row locator; a comparator lost in extraction is UNKNOWN and the answer says so). Regulator-set specs come from TRACE_NODE(rec).conditionsVerbatim on the authorisation record.
- bitemporal episode needed on: none.

## CQ-MF-01

- kind: cypher (kernel assertions; predicate-only roles)
- pattern: role assertions about X with valid time.

```cypher
MATCH (a:Assertion)-[:HAS_OBJECT]->(x {uid: $uid})
WHERE a.predicate IN ['MANUFACTURES','CONTRACT_MANUFACTURES_FOR','SUPPLIES_INGREDIENT','EXCLUSIVE_SUPPLIER_OF','DISTRIBUTES']
  AND (a.validFrom IS NULL OR a.validFrom <= $V) AND (a.validTo IS NULL OR $V < a.validTo) AND a.recordedTo IS NULL
MATCH (a)-[:HAS_SUBJECT]->(org:Organization), (a)-[:ASSERTED_BY]->(asserter)
RETURN org.name, a.predicate, asserter.name, a.validFrom, a.validTo, a.uid
// also: recall/warning-letter addressees for the product (ADDRESSED_TO) as "named by the regulator" evidence
```

- trace: TRACE on `a` (10-K sentence, GRAS letter manufacturing paragraph, recall `recalling_firm` field).
- bitemporal episode needed on: none in D8 (the Assertion carries valid time).

## Q-D8-10

- kind: cypher (kernel assertions)
- pattern: EXCLUSIVE_SUPPLIER_OF / SUPPLIES_INGREDIENT assertions for ingredient X, counted per supplier, with term end; plus patents ASSIGNED_TO the supplier that CONCERN X (blocking IP).

```cypher
MATCH (a:Assertion)-[:HAS_SUBJECT]->(sup:Organization)
WHERE a.predicate IN ['EXCLUSIVE_SUPPLIER_OF','SUPPLIES_INGREDIENT'] AND a.recordedTo IS NULL
  AND (a)-[:HAS_OBJECT]->({uid: $ingredientUid})   // buyer, when stated, is an Assertion qualifier
OPTIONAL MATCH (pt:Patent)-[:ASSIGNED_TO]->(sup), (pt)-[:CONCERNS]->({uid: $ingredientUid})
RETURN sup.name, a.predicate, a.validTo, a.proposition, collect(pt.publicationNumber), a.uid
```

- trace: TRACE on `a` (10-K risk-factor sentence).
- bitemporal episode needed on: ASSIGNED_TO (AS_OF on the patent leg).

## Q-D8-11

- kind: cypher
- pattern: patents around X owned or licensed by C, with expiry, as known at R; "disappeared between filings" = KNOWN_AT diff of the LICENSED_TO/ASSIGNED_TO episodes at two recorded times.

```cypher
MATCH (pt:Patent)-[:CONCERNS]->(x {uid: $ingredientUid})
MATCH (pt)-[h:ASSIGNED_TO|LICENSED_TO]->(c:Organization {uid: $companyUid})
WHERE /* AS_OF(h) */ true
OPTIONAL MATCH (pt)-[own:ASSIGNED_TO]->(owner:Organization)
RETURN pt.office + pt.publicationNumber + pt.kindCode AS number, type(h) AS role, pt.expiresAt, pt.expiryBasis,
       owner.name AS assignee, h.validFrom, h.validTo, h.assertionUid
```

- trace: TRACE(h) (10-K patent table or licence note locator); exclusivity/field/territory read from the authorizing Assertion's `qualifiers`.
- bitemporal episode needed on: ASSIGNED_TO, LICENSED_TO.

## Q-D8-12

- kind: cypher
- pattern: claim-level statuses of patent P and the decisions behind them, beside the aggregator text.

```cypher
MATCH (pt:Patent {uid: $patentUid})
OPTIONAL MATCH (pt)<-[r:STATUS_OF]-(s:LegalStatus {statusFamily: 'IP_RIGHT'})-[:STATUS_FROM]->(dec:RegulatoryRecord)
OPTIONAL MATCH (dec)-[:ISSUED_BY]->(tribunal:Organization)
RETURN pt.aggregatorStatusVerbatim, pt.aggregatorStatusObservedAt, s.statusKind, s.claimNumbers,
       dec.recordKind, dec.recordNumber, dec.issuedAt, dec.outcomeVerbatim, tribunal.name, r.validFrom, r.assertionUid
```

- trace: TRACE(r) (the opinion's conclusion sentence, fixture us8197807-claims-held-invalid) and TRACE_NODE(pt) for the aggregator text with its own disclaimer locator ("The legal status is an assumption …").
- bitemporal episode needed on: STATUS_OF.

## Q-D8-13

- kind: cypher
- pattern: latest end date per protection kind around ingredient X: patent expiry (Patent.expiresAt, or PATENT_EXPIRED / PATENT_LAPSED status), regulatory data protection (DATA_PROTECTED / MARKET_EXCLUSIVITY episode validTo), supply exclusivity (EXCLUSIVE_SUPPLIER_OF assertion validTo).

```cypher
MATCH (x {uid: $ingredientUid})
OPTIONAL MATCH (pt:Patent)-[:CONCERNS]->(x)
OPTIONAL MATCH (x)<-[r:STATUS_OF]-(s:LegalStatus {statusFamily: 'EXCLUSIVITY'})
OPTIONAL MATCH (a:Assertion {predicate: 'EXCLUSIVE_SUPPLIER_OF'})-[:HAS_OBJECT]->(x)
RETURN max(pt.expiresAt) AS latestPatentExpiry, collect({kind: s.statusKind, ends: r.validTo, j: s.jurisdiction}) AS dataProtection,
       max(a.validTo) AS supplyExclusivityEnds
```

- trace: TRACE(r) ("End date of the data protection: 20 February 2025."), TRACE_NODE(pt) for the expiry and its basis, TRACE on `a`.
- bitemporal episode needed on: STATUS_OF.

## Q-D8-14

- kind: cypher
- pattern: MARKED_WITH_PATENT assertions for the product (predicate-only), each joined to Patent statuses.

```cypher
MATCH (a:Assertion {predicate: 'MARKED_WITH_PATENT'})-[:HAS_SUBJECT]->(p {uid: $productUid})
MATCH (a)-[:HAS_OBJECT]->(pt:Patent)
OPTIONAL MATCH (pt)<-[r:STATUS_OF]-(s:LegalStatus) WHERE /* AS_OF(r) */ true
RETURN pt.publicationNumber, pt.expiresAt, collect(s.statusKind) AS statuses, a.uid
// "unmapped": the marking page does not say which claim covers which product — returned as such, never inferred
```

- trace: TRACE on `a` (marking page locator), TRACE(r).
- bitemporal episode needed on: STATUS_OF.

## Q-D8-15

- kind: cypher + kernel Assessment RESOLUTION
- pattern: citations from a regulator's record (predicate-only CITES_AS_EVIDENCE) to D3 studies, with the record's printed title vs the registry title.

```cypher
MATCH (a:Assertion {predicate: 'CITES_AS_EVIDENCE'})-[:HAS_SUBJECT]->(rec:RegulatoryRecord {uid: $recordUid})
MATCH (a)-[:HAS_OBJECT]->(study)
OPTIONAL MATCH (asm:Assessment {assessmentKind: 'RESOLUTION'})-[:DERIVED_FROM]->(a)
RETURN study.uid, study.name, a.valueString AS titleAsCited, asm.verdict, asm.rationale, a.uid
```

- trace: TRACE on `a` (footnote locator with the cited URL and title); the registry title cites the D3 snapshot (NCT05038488, NCT05040321, NCT04817111 JSON). Fixture nmn-us-exclusion-reversal: all three resolve to FDA's titles; the research-stage "mismatch" was a parser error (E6).
- bitemporal episode needed on: none.

## Q-D8-16

- kind: cypher
- pattern: authorised claim texts of the product's licence(s) in J, and claims quoted as drug claims by enforcement records about the product.

```cypher
MATCH (rec:RegulatoryRecord)-[c:CONCERNS]->(p:Product {uid: $productUid})
WHERE rec.jurisdiction = $J AND (rec.recordKind = 'NHP_LICENCE' OR rec.recordFamily = 'ENFORCEMENT')
MATCH (rec)-[:ISSUED_BY]->(reg:Organization)
// a regulator's finding on a claim is kernel RATES_CLAIM by the regulator (K item 9): subject the Claim, object the record
OPTIONAL MATCH (rc:Assertion {predicate: 'RATES_CLAIM'})-[:HAS_OBJECT]->(rec)
OPTIONAL MATCH (rc)-[:HAS_SUBJECT]->(cl:Claim), (rc)-[:ASSERTED_BY]->(reg)
OPTIONAL MATCH (occ:Assertion {assertionKind: 'CLAIM'})-[:OCCURRENCE_OF]->(cl)
RETURN rec.recordKind, rec.recordNumber, rec.authorisedClaimsVerbatim,
       CASE WHEN rec.recordFamily = 'ENFORCEMENT' THEN 'enforcement-cited' ELSE 'authorised' END AS basis,
       collect(DISTINCT {claim: cl.proposition, rating: rc.valueString, occurrenceBasis: occ.basisKind}) AS ratedClaims, c.assertionUid
```

- trace: LNHPD JSON-pointer locators for purposes; for an enforcement record, TRACE on `rc` (the regulator's characterization) and on `occ` (the quoted claim). When only the regulator's letter is captured, the occurrence is the regulator's retelling (asserter the regulator, `basisKind: CITED_FROM_PRIOR_WORK`, K M5); a later capture of the firm's own page adds the primary occurrence and the retelling gains `DERIVED_FROM` → it (fixture imu-tek-warning-letter-recall i12, i17).
- bitemporal episode needed on: none.

## Q-D8-17

- kind: cypher
- pattern: warning letters with COMPOUNDING_INELIGIBLE_SUBSTANCE or STERILITY, addressed firms, the substances concerned.

```cypher
MATCH (rec:RegulatoryRecord {recordKind: 'WARNING_LETTER'})-[:ADDRESSED_TO]->(firm:Organization)
WHERE any(v IN rec.violationCategories WHERE v IN ['COMPOUNDING_INELIGIBLE_SUBSTANCE','STERILITY'])
OPTIONAL MATCH (rec)-[c:CONCERNS]->(sub:ChemicalSubstance)
RETURN firm.name, rec.recordNumber, rec.issuedAt, collect(sub.name), rec.outcomeVerbatim, c.assertionUid
```

- trace: TRACE_NODE(rec) for the eligibility sentence; TRACE(c).
- bitemporal episode needed on: none.

## Q-D8-18

- kind: cypher (computed at query time; nothing stored as "avoid")
- pattern: products intended for target T (D5 seam: Assertion predicate INTENDED_FOR_TARGET), then D8 negative signals per product, each with issuer, date and locator.

```cypher
MATCH (ta:Assertion {predicate: 'INTENDED_FOR_TARGET'})-[:HAS_OBJECT]->(:Target {uid: $targetUid})
MATCH (ta)-[:HAS_SUBJECT]->(p:Product)
OPTIONAL MATCH (rec:RegulatoryRecord {recordFamily: 'ENFORCEMENT'})-[:CONCERNS]->(p)
OPTIONAL MATCH (lot:Lot)-[:LOT_OF]->(p) OPTIONAL MATCH (rr:RegulatoryRecord {recordKind: 'RECALL'})-[:CONCERNS]->(lot)
OPTIONAL MATCH (q:QualityResult)-[:QUALITY_RESULT_FOR]->(p) WHERE q.valueQualifier = 'NOT_DETECTED' OR q.percentOfLabelClaimStated < 50
// standing is often held by the ingredient or substance, not the product (NMN: STATUS_OF the D1 ChemicalSubstance,
// fixture nmn n04/n14), so read it on the product AND on what its current label declares (D6 → D1, read only)
OPTIONAL MATCH (p)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[lv:HAS_LABEL_VERSION]->(:LabelVersion)
               -[:DECLARES_COMPONENT]->(m:IngredientMaterial)
  WHERE lv.recordedTo IS NULL AND (lv.validTo IS NULL OR $V < lv.validTo)
OPTIONAL MATCH (m)-[:REALIZES_SUBSTANCE]->(cs:ChemicalSubstance)
WITH p, collect(DISTINCT rec.recordNumber) AS enforcement, collect(DISTINCT rr.recordNumber) AS recalls,
     collect(DISTINCT q.uid) AS failedTests, [p] + collect(DISTINCT m) + collect(DISTINCT cs) AS subjects
UNWIND subjects AS subj
OPTIONAL MATCH (subj)<-[r:STATUS_OF]-(s:LegalStatus {jurisdiction: $J})
  WHERE s.statusKind IN ['NOT_AUTHORISED','EXCLUDED_FROM_DEFINITION','REVOKED','WITHDRAWN'] AND /* AS_OF(r) */ true
RETURN p.name, enforcement, recalls, failedTests,
       collect(DISTINCT CASE WHEN s IS NOT NULL THEN {subject: subj.name, status: s.statusKind, assertionUid: r.assertionUid} END) AS standingSignals
```

- trace: each signal cites its own edge TRACE (the composition hop cites D6's label episode); the list is an answer (Report kind ANSWER if published), never a stored flag (00-DIRECTIVE 3.2). As of 2026-10-08 the NMN exclusion episode is closed (valid to 2025-09-29), so an NMN product is not on the avoid list for that reason at `$V` = today but is at `$V` = 2024-01-01.
- bitemporal episode needed on: STATUS_OF.

## Q-D8-19

- kind: cypher (inputs) → published kernel Report COMPARISON (D10 method)
- pattern: per product of ingredient X, the D8 rows the comparison criteria rank on (measured content vs claim, certification coverage as of V, enforcement count); the ranking itself is D10's DecisionCriterion version.

```cypher
MATCH (p:Product) WHERE p.uid IN $productUids
OPTIONAL MATCH (q:QualityResult {resultBasis: 'MEASURED'})-[:QUALITY_RESULT_FOR]->(p)
OPTIONAL MATCH (cl:CertificationListing)-[cv:COVERS]->(p)
OPTIONAL MATCH (rec:RegulatoryRecord {recordFamily: 'ENFORCEMENT'})-[:CONCERNS]->(p)
RETURN p.uid, collect(DISTINCT q.uid), collect(DISTINCT cl.uid), count(DISTINCT rec)
// published: (rep:Report {reportKind: 'COMPARISON'})-[:DERIVED_FROM]->(the row Assertions)
```

- trace: each report row cites the Assertions (DERIVED_FROM) and locators (HAS_EVIDENCE) it rests on.
- bitemporal episode needed on: COVERS.

## Q-D8-20

- kind: cypher
- pattern: per pathway, the latest record behind X's standing and its stage from the record-kind mapping; flag when the latest is FILING or OPINION.

```cypher
MATCH (x {uid: $subjectUid})<-[r:STATUS_OF]-(s:LegalStatus) WHERE /* AS_OF(r) */ true
MATCH (s)-[:STATUS_FROM]->(rec:RegulatoryRecord)
WITH s, rec ORDER BY rec.issuedAt DESC
WITH s, collect(rec)[0] AS latest
RETURN s.jurisdiction, s.pathway, s.statusKind, latest.recordKind, latest.recordNumber, latest.issuedAt
// stage(latest.recordKind) via the mapping table; FILING / OPINION ⇒ "standing backed only by a filing or an opinion"
// also: records CONCERNING x with no status at all (filed, never answered)
```

- trace: TRACE_NODE(latest) (e.g. the EFSA opinion's conclusion sentence vs the absence of an implementing act).
- bitemporal episode needed on: STATUS_OF.

## CQ-EC-01

- kind: cypher (bounded neighbourhood, bitemporally filtered)
- pattern: from X, one hop over every D8 edge type, valid at V and recorded at R, plus the D7 organizations reached.

```cypher
MATCH (x {uid: $uid})
CALL (x) {
  // episode edges (AssertedEdgeProperties): AS_OF(r)
  MATCH (x)<-[r:STATUS_OF|COVERS]-(n)
  WHERE (r.validFrom IS NULL OR r.validFrom <= $V) AND (r.validTo IS NULL OR $V < r.validTo)
    AND r.recordedFrom <= $R AND (r.recordedTo IS NULL OR $R < r.recordedTo)
  RETURN r, n
  UNION
  // recorded-only edges (AssertedRecordedProperties): KNOWN_AT(r)
  MATCH (x)<-[r:CONCERNS|QUALITY_RESULT_FOR|LOT_OF]-(n)
  WHERE r.recordedFrom <= $R AND (r.recordedTo IS NULL OR $R < r.recordedTo)
  RETURN r, n
  UNION
  MATCH (x)<-[c:CONCERNS]-(pt:Patent)-[r:ASSIGNED_TO|LICENSED_TO]->(n)
  WHERE c.recordedFrom <= $R AND (c.recordedTo IS NULL OR $R < c.recordedTo)
    AND (r.validFrom IS NULL OR r.validFrom <= $V) AND (r.validTo IS NULL OR $V < r.validTo)
    AND r.recordedFrom <= $R AND (r.recordedTo IS NULL OR $R < r.recordedTo)
  RETURN r, n
  UNION
  MATCH (x)<-[c:CONCERNS]-(rec:RegulatoryRecord)-[r:ADDRESSED_TO|ISSUED_BY]->(n)
  WHERE c.recordedFrom <= $R AND (c.recordedTo IS NULL OR $R < c.recordedTo)
    AND r.recordedFrom <= $R AND (r.recordedTo IS NULL OR $R < r.recordedTo)
  RETURN r, n
}
RETURN type(r), labels(n), n.uid, n.name, r.assertionUid
```

- trace: TRACE(r) per returned edge.
- bitemporal episode needed on: STATUS_OF, COVERS, ASSIGNED_TO, LICENSED_TO (recorded-only edges use KNOWN_AT).

## CQ-MF-04

- kind: cypher (kernel assertions; predicate-only HAS_CAPABILITY_STAGE)
- pattern: capability-stage assertions about an organization with valid time.

```cypher
MATCH (a:Assertion {predicate: 'HAS_CAPABILITY_STAGE'})-[:HAS_SUBJECT]->(org:Organization {uid: $orgUid})
OPTIONAL MATCH (a)-[:HAS_OBJECT]->(material)
RETURN material.name, a.valueString AS stage, a.validFrom, a.validTo, a.recordedAt, a.uid ORDER BY a.validFrom
```

- trace: TRACE on `a`.
- bitemporal episode needed on: none (Assertion carries valid time).

## Q-D8-21

- kind: cypher + kernel Assessment APPLICABILITY subkind D8.licence-coverage
- pattern: LICENSED_TO episodes of the company's patents with their qualifiers over time, plus the coverage assessment.

```cypher
MATCH (pt:Patent)-[h:LICENSED_TO]->(c:Organization {uid: $companyUid})
MATCH (a:Assertion {uid: h.assertionUid})
// term changes that neither start nor end the licence are dated literals on the patent (never a new episode)
OPTIONAL MATCH (amd:Assertion {predicate: 'D8.LICENCE_TERMS_AMENDED'})-[:HAS_SUBJECT]->(pt)
  WHERE amd.recordedTo IS NULL
OPTIONAL MATCH (asm:Assessment {assessmentSubkind: 'D8.licence-coverage'})-[:ASSESSES]->(pt)
RETURN pt.publicationNumber, h.validFrom, h.validTo, h.recordedFrom, h.recordedTo, a.qualifiers, a.proposition,
       collect(DISTINCT {amendedFrom: amd.validFrom, terms: amd.valueString, qualifiers: amd.qualifiers}) AS amendments, asm.verdict
ORDER BY h.recordedFrom
// "terms not public" when qualifiers are empty — returned as such
```

- trace: TRACE(h) per licence (10-K note: "licensed exclusively to Niagen Bioscience"); TRACE on each `amd` (Supplemental Agreement passage, fixture us8197807 p05, held PROPOSED because the passage names "Dartmouth Patents", not patent numbers).
- bitemporal episode needed on: LICENSED_TO.

## Q-D8-22

- kind: cypher
- pattern: identity lookup before a write (the executor's precondition).

```cypher
MATCH (rec:RegulatoryRecord {recordKind: $kind, recordNumber: $number})-[:ISSUED_BY]->(:Organization {uid: $issuerUid})
OPTIONAL MATCH (a:Assertion)-[:HAS_SUBJECT]->(rec)
OPTIONAL MATCH (a)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
RETURN rec.uid, max(snap.retrievedAt) AS lastCapture, collect(DISTINCT snap.contentHash) AS digests
// same digest ⇒ confirm (no write); new digest ⇒ new snapshot + re-anchored locators; changed outcome ⇒ new record or status episode, never an edit
```

- trace: the digests themselves.
- bitemporal episode needed on: none.

## Q-D8-23

- kind: cypher
- pattern: standing of device model D as of V (STATUS_OF episode, pathway, the clearance record behind it) plus recalls and safety communications that CONCERN the device. D4 owns `Device` (seam); D8 owns the records and statuses.

```cypher
MATCH (d:Device {uid: $deviceUid})
OPTIONAL MATCH (d)<-[r:STATUS_OF]-(s:LegalStatus {jurisdiction: 'US'})-[f:STATUS_FROM]->(clr:RegulatoryRecord)
  WHERE /* AS_OF(r) */ true
OPTIONAL MATCH (rec:RegulatoryRecord)-[c:CONCERNS]->(d)
  WHERE rec.recordKind IN ['RECALL', 'SAFETY_COMMUNICATION', 'WARNING_LETTER']
RETURN s.statusKind, s.pathway, clr.recordKind, clr.recordNumber, clr.issuedAt, r.validFrom, r.assertionUid,
       collect(DISTINCT {kind: rec.recordKind, number: rec.recordNumber, issuedAt: rec.issuedAt, class: rec.recallClass,
                         status: rec.recallStatus, reason: rec.reasonVerbatim, assertionUid: c.assertionUid}) AS harmRecords
// no STATUS_OF row: "no authorisation record found in sources S as of V" (never "not authorised" unless a record says so)
```

- trace: TRACE(r) and TRACE(f) for the clearance (510(k) record JSON pointer); TRACE(c) per recall (openFDA device/recall JSON pointer; D4 fixture noninvasive-glucose-cgm-recall: Z-1020-2026, "Open, Classified"). The safety communication's scope sentence is TRACE_NODE(rec).
- bitemporal episode needed on: STATUS_OF.
