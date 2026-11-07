# D9 — retrieval patterns

Model stage, A8, 2026-10-08; adversarial review 2026-10-08 (CQ-CL-05, CQ-CL-06, Q-D9-02, Q-D9-05, Q-D9-07, Q-D9-11, Q-D9-12, Q-D9-13, Q-D9-19, Q-D9-20, Q-D9-21 rewritten). One section per question in `02-questions.md`. Shapes are Cypher 5 over the stored graph (valid on Neo4j 5.26 and also valid Cypher 25; no `CYPHER 25` prefix, which 5.26 rejects — close-out pattern lint 2026-10-09) (kernel pattern of `packets/K/09-reasoning.md`; D9 types from `04-schema-proposal.graphql`). GraphQL reads the same paths through the declared fields (`mediaWorks(where: { occurrences: { some: … } })`, `mediaWorks { sponsors }`, kernel `assertions(where: { subject: { some: { uid: { eq: $uid } } } })`).

## Conventions used below

- **Occurrence** = kernel `Assertion` with `assertionKind: 'CLAIM'` and the stored label `ClaimOccurrence`; `speechAct`, `basisKind`, `polarity`, `qualifiers`, `valueNumber`/`unitCode`, `validFrom`/`validTo`, `recordedAt`/`recordedTo`, `status` are kernel fields. Current records only: `o.recordedTo IS NULL` (as-of recorded time `$asOf`: `o.recordedAt <= $asOf AND (o.recordedTo IS NULL OR o.recordedTo > $asOf)`).
- **Recommendation convention (directive 3.9, D5 seam).** A recommendation occurrence has `speechAct: 'RECOMMENDS'`, `HAS_SUBJECT` → the recommended means (compound, product, protocol, device, food, service organization), `predicate` = a D5 target predicate (`INTENDED_FOR_TARGET`, `IMPROVES_TARGET`, …) with `HAS_OBJECT` → the D5 `Target` when the speaker names a goal, else `predicate: 'RECOMMENDS_USE'` with no object; dose and population in `qualifiers` / `valueNumber` + `unitCode` (population `UNSPECIFIED` when unstated, per D5). A practice report is the same shape with `speechAct: 'REPORTS_PRACTICE'` and the speaker as subject (`TAKES`).
- **Segment interim.** Until the kernel adds `Assertion.segmentKind` (11-open-questions K-5), a sponsor read is marked by the qualifier `segment:SPONSOR_READ` (also `segment:SHOW_NOTES`, `segment:CORRECTION_NOTE`, `segment:DISCLAIMER`).
- **Rendition interim.** A CONTENT_SPONSORED_BY authorizing assertion names the rendition(s) that carried the read with `rendition:<source uid>` qualifiers when its locator sits on evidence that is not itself a rendition (an RSS item describing the audio enclosure); fixtures write `rendition:<fixture source ref>` (11-open-questions K-9: rendition-level media facts).
- **Credited name.** An APPEARS_IN authorizing assertion keeps the name as credited in the qualifier `credited-name:<verbatim>` (kernel rule M11.3: wording is not an edge property).
- **TRACE** (how every answer cites bytes; used by every `cypher` pattern below):

```cypher
// TRACE(o, w): located span → snapshot → rendition of the container, plus the capture-fidelity verdict
MATCH (o)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
WHERE ev.role IN ['SUPPORTS','QUALIFIES']
OPTIONAL MATCH (src)-[:RENDITION_OF]->(rw:MediaWork)                    // rw = w, or a re-cut that re-publishes w (predicate-only REPUBLISHES)
OPTIONAL MATCH (o)<-[:ASSESSES]-(adj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})   // latest by recordedAt; superseded ones are named by supersedesUid
RETURN loc.selectorKind, loc.exact, loc.startOffset, loc.endOffset, loc.mediaStartSeconds, loc.mediaEndSeconds,
       loc.speakerLabelInSource, snap.contentHash, snap.retrievedAt, snap.captureCompleteness, src.canonicalUri, src.genre,
       rw.uid AS renditionOfWork, adj.verdict, adj.policyOutcome
```

- **Episodes.** CONTENT_SPONSORED_BY carries `AssertedEdgeProperties` (the only D9 edge with a valid-time episode); APPEARS_IN carries its D9 superset of the kernel `AssertedRecordedProperties` (recorded time only, kernel M10). Believed at `$asOf`: `r.recordedFrom <= $asOf AND (r.recordedTo IS NULL OR r.recordedTo > $asOf)`. Valid time is never tested inline: every "valid at T" read uses OVERLAP below and returns its verdict next to the row.
- **OVERLAP(r, obs, T)** (adversarial review; the same rule as D7 03 Conventions "OVERLAP", which D9 adopts rather than redefining). `r` = an episode edge or a predicate-only Assertion (both carry `validFrom`/`validTo`/precisions/bases); `obs` = the date a source last stated the fact held: the authorizing Assertion's `validObservedAt` (kernel change 5; D7's `r.observedAt` is not on kernel edge types), else the latest `observedAt` of its evidence snapshots; `T` = the container's `publishedAt` (OCCURS_IN → MediaWork). A null bound is **unknown, never ongoing** (kernel AssertedEdgeProperties rule); nothing is dropped for a null bound.

```cypher
// OVERLAP(r, obs, T) → 'OVERLAPS' | 'DISJOINT' | 'UNKNOWN'
CASE
  WHEN (r.validTo IS NOT NULL AND r.validTo <= T) OR (r.validFrom IS NOT NULL AND r.validFrom > T) THEN 'DISJOINT'
  WHEN r.validFrom IS NOT NULL AND r.validFrom <= T AND (r.validTo > T OR (r.validTo IS NULL AND obs >= T)) THEN 'OVERLAPS'
  ELSE 'UNKNOWN' END
// then D7's precision rule: a bound at YEAR / MONTH / DAY precision that equals T truncated to that precision → 'UNKNOWN'
```

  The verdict is the `temporalOverlap` facet (`OVERLAPS | DISJOINT | UNKNOWN`, D7 10-seams conflict-relevance codes) of every CONFLICT_RELEVANCE assessment D9 writes.
- **Predicate-only reads.** OPERATED_BY (channel → operator), REPUBLISHES (re-cut → original), LINKS_TO_OFFER, CITES_CONTENT, RECORDING_OF are Assertions read through the kernel pattern: `(x)<-[:HAS_SUBJECT]-(a:Assertion {predicate: $p})-[:HAS_OBJECT]->(y)`, valid time on the Assertion (adversarial review: OPERATED_BY and REPUBLISHES demoted from typed edges).
- **Indexes the patterns assume** (operations file; `neo4j-vector-index-skill`). Written for Neo4j 5.26: on Neo4j 2026.01+ the vector index adds the in-index filter properties `WITH [c.language, c.textBasis, c.workUid, c.channelUid, c.publishedAt]` (before `OPTIONS`) and Q-D9-20 moves to the `SEARCH` clause.

```cypher
CREATE VECTOR INDEX chunk_embedding IF NOT EXISTS FOR (c:Chunk) ON (c.embedding)
  OPTIONS { indexConfig: { `vector.dimensions`: 1536, `vector.similarity_function`: 'cosine' } };
CREATE FULLTEXT INDEX chunk_text IF NOT EXISTS FOR (c:Chunk) ON EACH [c.text];
CREATE FULLTEXT INDEX occurrence_proposition IF NOT EXISTS FOR (o:ClaimOccurrence) ON EACH [o.proposition];
CREATE FULLTEXT INDEX media_work_title IF NOT EXISTS FOR (w:MediaWork) ON EACH [w.name];
CREATE INDEX occurrence_speech_act IF NOT EXISTS FOR (o:ClaimOccurrence) ON (o.speechAct, o.predicate);
CREATE INDEX media_work_published IF NOT EXISTS FOR (w:MediaWork) ON (w.publishedAt);
CREATE INDEX channel_platform_account IF NOT EXISTS FOR (c:Channel) ON (c.platform, c.platformAccountId);
CREATE INDEX sponsored_by_valid IF NOT EXISTS FOR ()-[r:CONTENT_SPONSORED_BY]-() ON (r.validFrom, r.validTo);
```

## CQ-CL-01

- kind: cypher
- pattern: speaker → occurrences in one container → located span on each rendition.

```cypher
MATCH (s {uid: $speakerUid})<-[:ASSERTED_BY]-(o:ClaimOccurrence)-[:OCCURS_IN]->(w:MediaWork {uid: $workUid})
WHERE o.recordedTo IS NULL
CALL (o, w) { /* TRACE(o, w) */ }
RETURN o.uid, o.proposition, o.speechAct, loc.exact, loc.speakerLabelInSource, src.canonicalUri, snap.contentHash
ORDER BY loc.startOffset
```

- trace: every row returns the locator (selector kind, exact, offsets or media time), the speaker label as printed, the rendition URI, the snapshot digest and the capture-fidelity verdict. A re-cut's evidence appears with `renditionOfWork` ≠ `w` (the re-cut REPUBLISHES `w`).
- bitemporal episode needed on: none (OCCURS_IN is part of the immutable occurrence record).

## CQ-CL-02

- kind: cypher
- pattern: read `speechAct` and `basisKind` per occurrence with the extraction method.

```cypher
MATCH (o:ClaimOccurrence)-[:OCCURS_IN]->(w:MediaWork {uid: $workUid})
MATCH (o)-[:WAS_GENERATED_BY]->(act:Activity)
RETURN o.uid, o.speechAct, o.basisKind, o.extractionConfidence, act.operationKind, act.runId, o.status
```

- trace: TRACE(o, w). A practice report (REPORTS_PRACTICE, e.g. FC-1 quote 1) is never returned for a recommendation filter; `extractionConfidence` is interpretable only with the Activity's method version.
- bitemporal episode needed on: none.

## CQ-CL-03

- kind: cypher
- pattern: qualifier text and its own span. Interim (until kernel QUALIFIED_BY, 11-open-questions K-2): `qualifiers` on the occurrence plus `HAS_EVIDENCE {role: 'QUALIFIES'}` to the qualifier's locator; qualification kind is the qualifier prefix (`population:`, `individual-variation:`, `dose-basis:`).

```cypher
MATCH (o:ClaimOccurrence {uid: $occUid})-[q:HAS_EVIDENCE {role: 'QUALIFIES'}]->(qloc:SourceLocator)
RETURN o.qualifiers, qloc.exact, qloc.startOffset, qloc.endOffset   // FC-1: "I'm not the same as everybody else…"
```

- trace: the qualifier locator is returned directly with its snapshot (TRACE).
- bitemporal episode needed on: none.

## CQ-CL-04

- kind: cypher (reads an assessment)
- pattern: retelling-fidelity assessments for a retelling or an original. Interim shape (kernel requests K-1, K-3, K-4): `Assessment {assessmentKind: 'RETELLING_FIDELITY'}` `DERIVED_FROM` the retelling occurrence and the original span's assertion, `ASSESSES` the original's Claim; `facets` carry `retelling=<uid>`, `original=<uid>`, `linkBasis=EXPLICIT_CITATION|BELLLABS_MATCH`, `lostQualification=…`, `speechActFrom/To`, `amountChanged`.

```cypher
MATCH (ret:ClaimOccurrence {uid: $retellingUid})<-[:DERIVED_FROM]-(fa:Assessment {assessmentKind: 'RETELLING_FIDELITY'})
WHERE fa.recordedTo IS NULL AND fa.status = 'ACCEPTED'
MATCH (fa)-[:DERIVED_FROM]->(orig:Assertion) WHERE orig <> ret
RETURN fa.uid, fa.methodVersion, fa.facets, fa.summary, orig.uid, orig.proposition
```

- trace: both inputs resolve to their locators (TRACE on `ret` and `orig`); `fa` carries `HAS_EVIDENCE` to the compared spans.
- bitemporal episode needed on: none (assessments are immutable, superseded by `supersedesUid`).

## CQ-CL-05

- kind: cypher (reads D7 episodes; the judgment is a kernel CONFLICT_RELEVANCE assessment)
- pattern: occurrence → OCCURS_IN → container time T = `w.publishedAt` (the definition K Q-K-09 and D7 CQ-CL-05 are asked to share, 11-open-questions D7-5) → (a) the speaker's D7 interest episodes, each with its OVERLAP verdict at T; (b) the channel's operators (predicate-only OPERATED_BY Assertions) with their OVERLAP verdict; (c) the work's sponsors (CONTENT_SPONSORED_BY) with their OVERLAP verdict; then disclosure: a D7 interest Assertion by the speaker about the same organization whose evidence lies in a rendition of the same work (`RENDITION_OF → w`) **dated at or before T** (D7 DISCLOSURE TIMING: `coalesce(dsnap.publishedAt, dsnap.observedAt) <= T`; a later rendition gives DISCLOSED_IN_LATER_REVISION), or on a snapshot of a self-disclosure Source observed at or before T (DISCLOSED_ELSEWHERE_AT_TIME, Q-D9-03).

```cypher
MATCH (o:ClaimOccurrence {uid: $occUid})-[:OCCURS_IN]->(w:MediaWork)<-[:PUBLISHES]-(ch:Channel)
MATCH (o)-[:ASSERTED_BY]->(p)
WITH o, w, ch, p, w.publishedAt AS T
RETURN o.uid, w.uid, T,
  COLLECT {                                                     // (a) speaker interests: never filtered on null bounds
    MATCH (p)-[i:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(org:Organization) WHERE i.recordedTo IS NULL
    MATCH (ia:Assertion {uid: i.assertionUid})
    OPTIONAL MATCH (da:Assertion)-[:HAS_OBJECT]->(org)
      WHERE da.predicate = type(i) AND EXISTS { (da)-[:ASSERTED_BY]->(p) }
    OPTIONAL MATCH (da)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(dsnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)-[:RENDITION_OF]->(w)
    WITH i, org, ia, min(coalesce(dsnap.publishedAt, dsnap.observedAt)) AS disclosedAt
    RETURN { org: org.name, family: type(i), validFrom: i.validFrom, validTo: i.validTo, bases: [i.validFromBasis, i.validToBasis],
             overlap: /* OVERLAP(i, ia.validObservedAt, T) */ null,
             inContainer: CASE WHEN disclosedAt IS NULL THEN null WHEN disclosedAt <= T THEN 'DISCLOSED_IN_CONTAINER' ELSE 'DISCLOSED_IN_LATER_REVISION' END }
  } AS interests,
  COLLECT {                                                     // (b) channel operators: predicate-only Assertions
    MATCH (ch)<-[:HAS_SUBJECT]-(opA:Assertion {predicate: 'OPERATED_BY'})-[:HAS_OBJECT]->(operator) WHERE opA.recordedTo IS NULL
    RETURN { operator: operator.name, overlap: /* OVERLAP(opA, opA.validObservedAt, T) */ null }
  } AS operators,
  COLLECT {                                                     // (c) sponsors of the work (episode edge)
    MATCH (w)-[sp:CONTENT_SPONSORED_BY]->(sponsor) WHERE sp.recordedTo IS NULL
    MATCH (spa:Assertion {uid: sp.assertionUid})
    RETURN { sponsor: sponsor.name, overlap: /* OVERLAP(sp, spa.validObservedAt, T) */ null, qualifiers: spa.qualifiers }
  } AS sponsors,
  COLLECT {
    MATCH (cr:Assessment {assessmentKind: 'CONFLICT_RELEVANCE'})-[:DERIVED_FROM]->(o) WHERE cr.recordedTo IS NULL
    RETURN { level: cr.conclusionCode, facets: cr.facets }
  } AS judgments
```

- trace: each interest cites its authorizing Assertion's locator (D7 self-disclosure snapshot, FC-2); in-container disclosure cites the episode span and the rendition snapshot's date (FC-1 quote 3); absence is qualified by Q-D9-16 coverage. The `/* OVERLAP(…) */` placeholders are the CASE of Conventions with the named arguments.
- bitemporal episode needed on: **CONTENT_SPONSORED_BY** (D9) and D7 HOLDS_ROLE / HOLDS_STAKE / RECEIVES_VALUE_FROM (D7); the operator's valid time is on its OPERATED_BY Assertion. "Valid at the time of the statement" is a valid-time question answered by OVERLAP, "what did we know then" a recorded-time one ($asOf).

## CQ-CL-06

- kind: cypher → materialized (projection `discourse-independence/v1`)
- pattern: for claim C, an occurrence is **not independent** when (a) it `DERIVED_FROM` another assertion (explicit retelling), (b) a RETELLING_FIDELITY assessment names it as a retelling (BellLabs match), or (c) its container is itself a re-publication (`w.republicationKind IS NOT NULL`). Test (c) is a fallback: under convention 3 (09-reasoning.md) an occurrence OCCURS_IN the original work whenever the predicate-only REPUBLISHES Assertion exists, so (c) fires only for occurrences extracted from a re-cut whose original is not in the graph; re-cut echoes are otherwise not separate occurrences at all (they are extra HAS_EVIDENCE locators on the same occurrence). Count first-hand occurrences by distinct asserter.

```cypher
MATCH (c:Claim {uid: $claimUid})<-[:OCCURRENCE_OF]-(o:ClaimOccurrence)-[:OCCURS_IN]->(w:MediaWork)
WHERE o.recordedTo IS NULL
OPTIONAL MATCH (o)-[:DERIVED_FROM]->(src:Assertion)
OPTIONAL MATCH (o)<-[:DERIVED_FROM]-(fa:Assessment {assessmentKind: 'RETELLING_FIDELITY'}) WHERE any(f IN fa.facets WHERE f = 'retelling=' + o.uid)
MATCH (o)-[:ASSERTED_BY]->(a)
WITH c, a, o, w, (src IS NULL AND fa IS NULL AND w.republicationKind IS NULL) AS firstHand
RETURN c.uid, count(DISTINCT CASE WHEN firstHand THEN a END) AS independentAsserters,
       count(DISTINCT CASE WHEN NOT firstHand THEN o END) AS echoes
```

- materialization: written monthly (and on demand) as a kernel `Assessment` (kind requested `DISCOURSE_METRIC`, subkind `D9.independence`; interim `OTHER`) about the Claim with `score` = independent asserters, `methodVersion`, `inputSetDigest`, `DERIVED_FROM` the occurrences counted.
- trace: the assessment's inputs are the occurrences; each resolves by TRACE.
- bitemporal episode needed on: none.

## CQ-CL-07

- kind: cypher
- pattern: pseudonymous asserter = `Channel {channelKind: 'ACCOUNT', isPseudonymous: true}` (kernel request K-6, admitted by A1 in the adversarial review: ASSERTED_BY now names D9 Channel ACCOUNT, executor change P20); links to a real identity are kernel RESOLUTION assessments, never an OPERATED_BY Assertion.

```cypher
MATCH (acct:Channel {channelKind: 'ACCOUNT'})<-[:ASSERTED_BY]-(o:ClaimOccurrence {uid: $occUid})
OPTIONAL MATCH (h:Assessment {assessmentKind: 'RESOLUTION'})-[:ASSESSES]->(acct)
OPTIONAL MATCH (h)-[:ASSESSES]->(cand:Person)
RETURN acct.handle, acct.platform, acct.homeUrl, acct.isPseudonymous, cand.name, h.status, h.score, h.methodVersion
```

- trace: handle and profile come from the forum snapshot (TRACE on the occurrence); hypotheses cite their own evidence locators.
- bitemporal episode needed on: none (an OPERATED_BY Assertion is written only once a source asserts an operator).

## CQ-CL-08

- kind: cypher
- pattern: segment of the span (interim qualifier `segment:SPONSOR_READ`, kernel request K-5), reader = the occurrence's asserter, else the APPEARS_IN HOST/READER of the work; sponsor via the CONTENT_SPONSORED_BY whose authorizing assertion shares the locator.

```cypher
MATCH (o:ClaimOccurrence {uid: $occUid})-[:OCCURS_IN]->(w:MediaWork)
OPTIONAL MATCH (o)-[:ASSERTED_BY]->(reader)
OPTIONAL MATCH (w)<-[ap:APPEARS_IN]-(host:Person) WHERE ap.appearanceRole IN ['HOST','READER']
OPTIONAL MATCH (w)-[sp:CONTENT_SPONSORED_BY]->(sponsor)
OPTIONAL MATCH (spa:Assertion {uid: sp.assertionUid})-[:HAS_EVIDENCE]->(sloc:SourceLocator)<-[:HAS_EVIDENCE]-(o)
RETURN any(q IN o.qualifiers WHERE q = 'segment:SPONSOR_READ') AS sponsorRead, reader.name, host.name, sponsor.name, sloc IS NOT NULL AS sameSpan
```

- trace: TRACE(o, w) gives the rendition and observation time; the sponsor episode gives the observed window.
- bitemporal episode needed on: **CONTENT_SPONSORED_BY** (the read belongs to a rendition window).

## CQ-PV-02

- kind: cypher
- pattern: re-find a cited span in a later snapshot of the same Source (`reanchorsLocatorUid`) or in another rendition of the same work (Sources RENDITION_OF the same MediaWork); chunks of the other rendition give the candidate text (`COVERS_LOCATOR` after re-anchoring).

```cypher
MATCH (loc:SourceLocator {uid: $locUid})<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)-[:RENDITION_OF]->(w:MediaWork)
OPTIONAL MATCH (re:SourceLocator {reanchorsLocatorUid: loc.uid})<-[:HAS_LOCATOR]-(snap2:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src2:Source)
OPTIONAL MATCH (src2)-[:RENDITION_OF]->(w)
RETURN loc.exact, re.exact, re.reanchorMatch, src2.canonicalUri, snap2.contentHash, (src2 = src) AS sameEndpoint
```

- trace: both locators and both snapshot digests are returned; "not re-found" = no `re` row after a re-anchoring Activity ran (its Activity is the evidence of the attempt).
- bitemporal episode needed on: none.

## CQ-PV-04

- kind: cypher (reads an assessment)
- pattern: kernel `Assessment {assessmentKind: 'QUALITY', assessmentSubkind: 'D9.capture-error'}` about the Claim, `DERIVED_FROM` the affected occurrence and the correcting one; facets `errorKind=OCR|ASR|UNIT|QUANTITY_BASIS|ATTRIBUTION|TRANSCRIPT_DIVERGENCE`; the chunk's `textBasis` (OCR / ASR / AUTO_CAPTIONS) is the prior that flags candidates.

```cypher
MATCH (o:ClaimOccurrence {uid: $occUid})<-[:DERIVED_FROM]-(qa:Assessment {assessmentKind: 'QUALITY'})
WHERE qa.assessmentSubkind = 'D9.capture-error' AND qa.recordedTo IS NULL
OPTIONAL MATCH (o)-[:HAS_EVIDENCE]->(loc)<-[:COVERS_LOCATOR]-(ch:Chunk)
RETURN qa.facets, qa.effectDirection, qa.summary, collect(DISTINCT ch.textBasis) AS textBases
```

- trace: the assessment's HAS_EVIDENCE locators (FC-3 correction note; FC-5 OCR text).
- bitemporal episode needed on: none.

## CQ-PV-05

- kind: cypher
- pattern: primary vs retelling vs aggregator: follow `DERIVED_FROM` from the occurrence to assertions it retells, to the one with no further outgoing retelling; the Source genre / Channel kind tells an aggregator.

```cypher
MATCH path = (o:ClaimOccurrence {uid: $occUid})-[:DERIVED_FROM*0..4]->(root:Assertion)
WHERE NOT (root)-[:DERIVED_FROM]->(:Assertion)
WITH o, root, length(path) AS hops
MATCH (root)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(rs:Source)
RETURN CASE hops WHEN 0 THEN 'PRIMARY' ELSE 'RETELLING' END AS position, hops, rs.canonicalUri, rs.genre, o.basisKind
```

- trace: the chain's root locator and snapshot (FC-4: Attia → RAPA-EX-01 results span; FC-8: Topol → Nature DOI).
- bitemporal episode needed on: none.

## CQ-CM-04

- kind: cypher
- pattern: affiliate / discount links are predicate-only Assertions (`predicate: 'LINKS_TO_OFFER'`, subject = the MediaWork, object = a D6 Offer or MerchantListing, qualifier `linkKind:AFFILIATE|DISCOUNT_CODE|STORE`), read through the kernel pattern; joined to recommendations in the same work about the offer's product.

```cypher
MATCH (w:MediaWork {uid: $workUid})<-[:HAS_SUBJECT]-(l:Assertion {predicate: 'LINKS_TO_OFFER'})-[:HAS_OBJECT]->(offer)
OPTIONAL MATCH (w)<-[:OCCURS_IN]-(o:ClaimOccurrence {speechAct: 'RECOMMENDS'})-[:HAS_SUBJECT]->(item)
RETURN offer.uid, l.qualifiers, l.validFrom, o.uid, item.name
```

- trace: the link assertion's locator on the show-notes rendition (FC-3 quote 4 "insidetracker.com/sinclair").
- bitemporal episode needed on: none in D9 (the Assertion carries its own valid time: when the link was observed).

## CQ-RC-05

- kind: cypher
- pattern: label the provenance of an answer line by the record type it rests on: "a source recommends" = ClaimOccurrence `speechAct RECOMMENDS` ASSERTED_BY a Person / Organization / Channel; "evidence favors" = Assessment `EVIDENCE_SYNTHESIS` with `effectDirection`; "BellLabs recommends" = Report `reportKind RECOMMENDATION`; "a user selected" is session state, never graph.

```cypher
MATCH (r) WHERE r.uid IN $answerInputUids
RETURN r.uid, CASE
  WHEN r:ClaimOccurrence AND r.speechAct = 'RECOMMENDS' THEN 'SOURCE_RECOMMENDS'
  WHEN r:Assessment AND r.assessmentKind = 'EVIDENCE_SYNTHESIS' THEN 'EVIDENCE_FAVORS'
  WHEN r:Report AND r.reportKind = 'RECOMMENDATION' THEN 'BELLLABS_RECOMMENDS'
  ELSE 'OTHER' END AS provenanceKind
```

- trace: a SOURCE_RECOMMENDS line cites TRACE(o, w); the others cite their own HAS_EVIDENCE.
- bitemporal episode needed on: none.

## Q-D9-01

- kind: cypher (+ vector entry)
- pattern: who recommends X: index seek on `ClaimOccurrence(speechAct, predicate)`, subject X, excluding sponsor reads; container and date from OCCURS_IN. No stored RECOMMENDS edge exists (09-reasoning.md); this two-hop path is the retrieval index.

```cypher
MATCH (x {uid: $itemUid})<-[:HAS_SUBJECT]-(o:ClaimOccurrence {speechAct: 'RECOMMENDS'})-[:ASSERTED_BY]->(who)
WHERE o.recordedTo IS NULL AND o.status IN ['ACCEPTED','PROPOSED']
  AND NOT any(q IN coalesce(o.qualifiers, []) WHERE q = 'segment:SPONSOR_READ')
MATCH (o)-[:OCCURS_IN]->(w:MediaWork)
RETURN who.name, w.name, w.workKind, w.publishedAt, o.basisKind, o.predicate, o.qualifiers
ORDER BY w.publishedAt DESC
```

- trace: TRACE(o, w) per row (FC-1 quote 5; FC-7 quote 1).
- bitemporal episode needed on: none.

## Q-D9-02

- kind: cypher (path) feeding an assessment (CONFLICT_RELEVANCE)
- pattern: recommendation occurrences of P → recommended item → the organization behind it (D6 `NAMES_RESPONSIBLE_PARTY` / `SELLER_OF_RECORD` / `BRANDED_AS` → D7 Brand ← `OWNS_BRAND`, or the item is the Organization itself) → P's D7 interest episodes with their OVERLAP verdict at the container time T (never filtered on null bounds) → disclosure with the DISCLOSURE TIMING rule of CQ-CL-05. Bounded path (≤ 4 hops from the item), never an open-ended traversal.

```cypher
MATCH (p:Person {uid: $personUid})<-[:ASSERTED_BY]-(o:ClaimOccurrence {speechAct: 'RECOMMENDS'})-[:OCCURS_IN]->(w:MediaWork)
MATCH (o)-[:HAS_SUBJECT]->(item)
WITH p, o, w, item, w.publishedAt AS T
MATCH (p)-[i:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(org:Organization)
WHERE i.recordedTo IS NULL
MATCH rel = (item)-[:NAMES_RESPONSIBLE_PARTY|SELLER_OF_RECORD|HAS_VARIANT|HAS_PACKAGE|HAS_LABEL_VERSION|BRANDED_AS|OWNS_BRAND*0..4]-(org)
MATCH (ia:Assertion {uid: i.assertionUid})
OPTIONAL MATCH (da:Assertion)-[:HAS_OBJECT]->(org) WHERE da.predicate = type(i) AND EXISTS { (da)-[:ASSERTED_BY]->(p) }
OPTIONAL MATCH (da)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(dsnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)-[:RENDITION_OF]->(w)
WITH o, item, org, i, ia, T, min(length(rel)) AS relationHops, min(coalesce(dsnap.publishedAt, dsnap.observedAt)) AS disclosedAt
RETURN o.uid, item.name, org.name, type(i), i.validFrom, i.validTo, relationHops,
       /* OVERLAP(i, ia.validObservedAt, T) */ null AS temporalOverlap,
       CASE WHEN disclosedAt IS NULL THEN null WHEN disclosedAt <= T THEN 'DISCLOSED_IN_CONTAINER' ELSE 'DISCLOSED_IN_LATER_REVISION' END AS inContainer
```

- trace: the occurrence (TRACE), the interest's authorizing assertion locator (D7), the in-container disclosure span with its rendition date if found; when not found, the answer carries the Q-D9-16 coverage record ("not found in partial capture").
- bitemporal episode needed on: D7 interest edges (OVERLAP at T); CONTENT_SPONSORED_BY when the recommendation is a sponsor read.

## Q-D9-03

- kind: cypher (bitemporal as-of)
- pattern: the self-disclosure page is one kernel Source with snapshots over time (current + Wayback `observedAt`); D7 role episodes authorized by assertions located on each snapshot. As-of T = assertions whose evidence snapshot has the greatest `observedAt` ≤ T; compare with the current snapshot. Recorded vs valid time separates "added later" from "began later".

```cypher
MATCH (src:Source {canonicalUri: $disclosureUri})-[:HAS_SNAPSHOT]->(snap:SourceSnapshot)
WITH src, snap ORDER BY coalesce(snap.observedAt, snap.retrievedAt)
WITH src, [s IN collect(snap) WHERE coalesce(s.observedAt, s.retrievedAt) <= $T][-1] AS thenSnap, collect(snap)[-1] AS nowSnap
UNWIND [['then', thenSnap], ['now', nowSnap]] AS pick
WITH pick[0] AS version, pick[1] AS s
MATCH (s)-[:HAS_LOCATOR]->(loc)<-[:HAS_EVIDENCE]-(a:Assertion)-[:HAS_OBJECT]->(org)
RETURN version, a.predicate, org.name, a.validFrom, a.validTo, a.qualifiers, loc.exact
```

- trace: per row the locator on the dated snapshot (FC-2: 2021-12-09 Wayback copy without Tally Health but with Levels vs current "(2021-2024) F,I,E"). An archive copy becomes a snapshot only after its served `memento-datetime` equals the requested CDX timestamp and the SHA1-base32 of the served payload equals the CDX digest (adversarial review: a Wayback `id_` request can serve another capture with HTTP 200).
- bitemporal episode needed on: D7 role episodes (valid time from the page's year bounds; recorded time from our capture).

## Q-D9-04

- kind: cypher
- pattern: the publisher's correction is its own occurrence (asserter = publisher Organization or Channel, `segment:CORRECTION_NOTE`) in the same work. Interim link (kernel request K-2 `CORRECTS`): `(corr)-[:DERIVED_FROM]->(orig)` with `corr.predicate = 'CORRECTS'`; the corrected values are the two occurrences' literals.

```cypher
MATCH (w:MediaWork {uid: $workUid})<-[:OCCURS_IN]-(corr:ClaimOccurrence {predicate: 'CORRECTS'})-[:DERIVED_FROM]->(orig:ClaimOccurrence)
RETURN orig.proposition, orig.valueNumber, orig.unitCode, corr.proposition, corr.valueNumber, corr.unitCode, corr.qualifiers
```

- trace: both spans: the original at media time (FC-3 "At time point 1:07:37") and the correction in the RSS description (FC-3 quote 1).
- bitemporal episode needed on: none.

## Q-D9-05

- kind: cypher → assessment (kernel `Assessment {assessmentKind: 'QUALITY', assessmentSubkind: 'D9.dose-statement-risk'}` about the **statement**, never about the compound: interim it ASSESSES the occurrence's Claim and DERIVED_FROM the occurrence and its correction (kernel request K-3), `effectDirection` null, `conclusionCode` CORRECTED_QUANTITY | UNSPECIFIED_BASIS, `facets` `errorKind=QUANTITY_BASIS|UNIT`; adversarial review: a HARM direction about the compound would read as "X is harmful" in every target-harm query)
- pattern: occurrences that state a quantity of compound X (`valueNumber` + `unitCode`), and either are corrected (Q-D9-04) or lack a `dose-basis:` qualifier; the existing risk assessment if one was written.

```cypher
MATCH (x {uid: $compoundUid})<-[:HAS_SUBJECT|HAS_OBJECT]-(o:ClaimOccurrence)
WHERE o.valueNumber IS NOT NULL AND o.unitCode IS NOT NULL AND o.recordedTo IS NULL
OPTIONAL MATCH (o)<-[:DERIVED_FROM]-(corr:ClaimOccurrence {predicate: 'CORRECTS'})
OPTIONAL MATCH (qa:Assessment {assessmentKind: 'QUALITY', assessmentSubkind: 'D9.dose-statement-risk'})-[:DERIVED_FROM]->(o)
  WHERE qa.recordedTo IS NULL
RETURN o.uid, o.valueNumber, o.unitCode, corr.valueNumber AS correctedValue, corr.unitCode AS correctedUnit,
       NOT any(q IN coalesce(o.qualifiers, []) WHERE q STARTS WITH 'dose-basis:') AS basisUnspecified,
       qa.conclusionCode, qa.facets
```

- trace: occurrence and correction locators; the assessment DERIVED_FROM both. Research, not medical advice; the answer never states what an amount does.
- bitemporal episode needed on: none.

## Q-D9-06

- kind: cypher
- pattern: sponsors per rendition. The rendition that carried a read is a Source RENDITION_OF this work: either the Source the authorizing assertion's locator sits on, or (when the locator sits on evidence that is not itself a rendition, e.g. the RSS feed item describing the audio enclosure) the rendition named by the assertion's `rendition:<source uid>` qualifier (interim, see Conventions). Group by rendition, order by valid window.

```cypher
MATCH (w:MediaWork {uid: $workUid})-[sp:CONTENT_SPONSORED_BY]->(sponsor)
WHERE sp.recordedTo IS NULL
MATCH (a:Assertion {uid: sp.assertionUid})-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(ev:Source)
MATCH (w)<-[:RENDITION_OF]-(rend:Source)
WHERE rend = ev OR ('rendition:' + rend.uid) IN a.qualifiers
RETURN rend.canonicalUri AS rendition, sponsor.name, sp.validFrom, sp.validTo, ev.canonicalUri AS evidenceSource,
       loc.exact, loc.mediaStartSeconds, snap.retrievedAt
ORDER BY rendition, sp.validFrom
```

- trace: FC-1: web page chapter "ROKA, InsideTracker, Magic Spoon", YouTube caption "brought to us by InsideTracker", RSS re-cut "AG1, LMNT & Waking Up" (enclosure `?updated=` 2025-05-21 = validFrom of the re-cut window).
- bitemporal episode needed on: **CONTENT_SPONSORED_BY** (valid window per rendition ≠ when we recorded it).

## Q-D9-07

- kind: cypher
- pattern: the predicate-only `REPUBLISHES` Assertion from the re-cut to the original (adversarial review: no typed edge; only this value-2 question reads it), and the occurrences of the original whose evidence also lies on the re-cut's renditions (the same act, not a new occurrence).

```cypher
MATCH (recut:MediaWork {uid: $workUid})<-[:HAS_SUBJECT]-(rp:Assertion {predicate: 'REPUBLISHES'})-[:HAS_OBJECT]->(orig:MediaWork)
WHERE rp.recordedTo IS NULL
OPTIONAL MATCH (orig)<-[:OCCURS_IN]-(o:ClaimOccurrence)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)-[:RENDITION_OF]->(recut)
RETURN recut.republicationKind, recut.publishedAt, orig.publishedAt, rp.status, rp.qualifiers, collect(DISTINCT o.uid) AS sharedOccurrences
```

- trace: the REPUBLISHES assertion's locators (feed item titles "Essentials" vs original, the re-cut's YouTube title) and the shared occurrences' re-cut locators (FC-9).
- bitemporal episode needed on: none (the Assertion's recorded time).

## Q-D9-08

- kind: cypher (retrieved at query time); optional materialization `claim-spread/v1`
- pattern: claims about X with occurrences ordered by container time; first asserter; amplification by retelling and re-publication.

```cypher
MATCH (x {uid: $compoundUid})<-[:HAS_SUBJECT|HAS_OBJECT]-(:ClaimOccurrence)-[:OCCURRENCE_OF]->(c:Claim)
MATCH (c)<-[:OCCURRENCE_OF]-(o:ClaimOccurrence)-[:OCCURS_IN]->(w:MediaWork)
WHERE w.publishedAt >= datetime() - duration({months: $n})
MATCH (o)-[:ASSERTED_BY]->(a)
OPTIONAL MATCH (o)-[:DERIVED_FROM]->(prev:Assertion)
WITH c, o, w, a, prev ORDER BY w.publishedAt
RETURN c.uid, c.proposition, collect({at: w.publishedAt, who: a.name, kind: w.workKind, retells: prev.uid, recut: w.republicationKind})[..50] AS spread
```

- materialization (when Q-D9-08 rises to a dashboard): monthly projection writing an Assessment (`DISCOURSE_METRIC`, subkind `D9.claim-spread`) per Claim with counts per month and container kind; `DERIVED_FROM` the occurrences.
- trace: each point is an occurrence (TRACE).
- bitemporal episode needed on: none.

## Q-D9-09

- kind: cypher (reads a RETELLING_FIDELITY assessment)
- pattern: retelling occurrence `DERIVED_FROM` the study-result assertion (D3, located in the paper); compare `valueNumber`; where the paper itself has two spans for the same result (abstract vs results), both are assertions and the retelling's match is the span with equal value.

```cypher
MATCH (ret:ClaimOccurrence)-[:OCCURS_IN]->(:MediaWork {uid: $workUid})
MATCH (ret)-[:HAS_SUBJECT]->(subj)<-[:HAS_SUBJECT]-(span:Assertion)
WHERE span.predicate = ret.predicate AND span.uid <> ret.uid
MATCH (span)-[:HAS_EVIDENCE]->(sl:SourceLocator)
RETURN ret.uid, ret.valueNumber, span.uid, span.valueNumber, sl.exact,
       abs(coalesce(ret.valueNumber, 0) - coalesce(span.valueNumber, 0)) AS diff,
       EXISTS { (ret)-[:DERIVED_FROM]->(span) } AS citedSpan
ORDER BY diff
```

- trace: FC-4: Attia "−1.19 kg" matches the results span (−1.19) not the abstract (−1.13); the HbA1c finding is in the results only. The judgment is the assessment (CQ-CL-04 shape) with facets `matchedSpan=…`, `omittedFindings=…`.
- bitemporal episode needed on: none.

## Q-D9-10

- kind: cypher
- pattern: media occurrences that retell a D3 null/negative result about intervention X; the discussant's stance is the retelling's own `speechAct` / `polarity` (accept = STATES with same polarity; qualify = CAUTIONS or a QUALIFIES span; contest = DENIES or opposite polarity), never a BellLabs judgment.

```cypher
MATCH (x {uid: $interventionUid})<-[:HAS_SUBJECT]-(res:Assertion) WHERE res.polarity IN ['NEGATIVE','MIXED']
MATCH (res)<-[:DERIVED_FROM]-(o:ClaimOccurrence)-[:OCCURS_IN]->(w:MediaWork)
MATCH (o)-[:ASSERTED_BY]->(who)
RETURN who.name, w.name, w.publishedAt, o.speechAct, o.polarity, o.proposition
```

- trace: TRACE on `o` (FC-4 quote 4 "a long way from the death knell…") and on `res`.
- bitemporal episode needed on: none.

## Q-D9-11

- kind: cypher
- pattern: community adverse-experience reports use D5's predicate (adversarial review: one harm predicate across D5 and D9, so D5's harm queries such as Q-D5-07 see them): occurrences with `predicate CAUSES_ADVERSE_EFFECT`, `basisKind PERSONAL_EXPERIENCE`, qualifier `sourceKind:COMMUNITY`, subject = X (or the combination), object = the D2 `Condition` adverse-effect term, in FORUM_THREAD / SOCIAL_POST works; distinct asserters (accounts); counter-reports have `polarity NEGATIVE` (a denial) on the same subject/predicate/object. The "anecdote, not evidence" label comes from `basisKind`.

```cypher
MATCH (x {uid: $itemUid})<-[:HAS_SUBJECT]-(o:ClaimOccurrence {predicate: 'CAUSES_ADVERSE_EFFECT', basisKind: 'PERSONAL_EXPERIENCE'})-[:OCCURS_IN]->(w:MediaWork)
WHERE w.workKind IN ['FORUM_THREAD','SOCIAL_POST'] AND o.recordedTo IS NULL
MATCH (o)-[:ASSERTED_BY]->(acct)
OPTIONAL MATCH (o)-[:HAS_OBJECT]->(effect)                       // D2 Condition (adverse-effect term)
RETURN effect.name, o.polarity, count(DISTINCT acct) AS asserters, min(w.publishedAt) AS first,
       collect(DISTINCT w.uid) AS threads, 'ANECDOTE_NOT_EVIDENCE' AS label
```

- trace: FC-6 post #1 and counter-report post #2 locators.
- bitemporal episode needed on: none.

## Q-D9-12

- kind: cypher
- pattern: the regulator letter is a D8 `RegulatoryRecord`; the posts it cites are linked by a predicate-only Assertion (`predicate: 'CITES_CONTENT'`, subject = the record, object = the MediaWork) located in the letter; post ← PUBLISHES ← account Channel ← predicate-only OPERATED_BY Assertion → Person (OVERLAP at the post time); paying party = the record's D8 `ADDRESSED_TO` / the D7 `RECEIVES_VALUE_FROM {PAID_ENDORSEMENT}` assertion the letter supports.

```cypher
MATCH (rr {uid: $recordUid})<-[:HAS_SUBJECT]-(c:Assertion {predicate: 'CITES_CONTENT'})-[:HAS_OBJECT]->(post:MediaWork)
MATCH (post)<-[:PUBLISHES]-(acct:Channel)
OPTIONAL MATCH (acct)<-[:HAS_SUBJECT]-(opA:Assertion {predicate: 'OPERATED_BY'})-[:HAS_OBJECT]->(p:Person) WHERE opA.recordedTo IS NULL
OPTIONAL MATCH (p)-[v:RECEIVES_VALUE_FROM]->(payer:Organization)
RETURN post.name, post.publishedAt, acct.handle, p.name, /* OVERLAP(opA, opA.validObservedAt, post.publishedAt) */ null AS operatorOverlap,
       payer.name, v.validFrom, c.qualifiers   // deficiency kinds as qualifiers
```

- trace: the CITES_CONTENT assertion's locator in the letter PDF text version (FC-5, not built as a fixture; OCR text basis recorded on the chunk).
- bitemporal episode needed on: none in D9 (the operator's valid time is on its Assertion); D7 RECEIVES_VALUE_FROM.

## Q-D9-13

- kind: cypher → assessment (CONFLICT_RELEVANCE with facets `selfRetelling=true`)
- pattern: a D3 `Publication` author (D3's predicate-only `AUTHORED_BY` Assertion, subject Publication, object D7 Person; D3 04 Publication docstring) who is also an asserter of media occurrences that `DERIVED_FROM` result assertions located in a rendition of that publication (D3 joins renditions to the Publication through shared kernel Identifiers: DOI, PMID, PMCID); compare values (Q-D9-09) and run the disclosure check (CQ-CL-05).

```cypher
MATCH (pub:Publication)<-[:HAS_SUBJECT]-(:Assertion {predicate: 'AUTHORED_BY'})-[:HAS_OBJECT]->(author:Person)
MATCH (pub)-[:HAS_IDENTIFIER]->(:Identifier)<-[:HAS_IDENTIFIER]-(pubSrc:Source)
MATCH (res:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(pubSrc)
MATCH (author)<-[:ASSERTED_BY]-(o:ClaimOccurrence)-[:DERIVED_FROM]->(res)
MATCH (o)-[:OCCURS_IN]->(w:MediaWork)
RETURN author.name, pub.uid, w.name, o.valueNumber, res.valueNumber
```

- trace: both spans (FC-4 COI statement "B.S. receives advertising revenue from his YouTube channel…").
- bitemporal episode needed on: D7 interest edges.

## Q-D9-14

- kind: cypher (reads assessments; register content from `vocab-source-genres.yaml`)
- pattern: kernel `Assessment {assessmentKind: 'SOURCE_AUTHORITY', assessmentSubkind: <claim kind>}` ASSESSES a Source (or a Channel for all its works); never a global trust score.

```cypher
MATCH (sa:Assessment {assessmentKind: 'SOURCE_AUTHORITY'})-[:ASSESSES]->(s)
WHERE (s:Source OR s:Channel) AND sa.recordedTo IS NULL AND sa.assessmentSubkind = $claimKind
RETURN s.uid, coalesce(s.canonicalUri, s.name), sa.verdict, sa.score, sa.methodVersion, sa.rationale
```

- trace: the assessment's HAS_EVIDENCE (e.g. the publisher's transcript caveat "under human review").
- bitemporal episode needed on: none.

## Q-D9-15

- kind: cypher + registry lookup (D11 action-space registry; not graph)
- pattern: capture outcomes per endpoint are the D11 registry's (`readiness`, last attempt, outcome); the graph part is the latest snapshot per Source and the capturing Activity.

```cypher
MATCH (src:Source) WHERE src.canonicalUri STARTS WITH $hostPrefix
OPTIONAL MATCH (src)-[:HAS_SNAPSHOT]->(snap:SourceSnapshot)-[:WAS_GENERATED_BY]->(act:Activity)
WITH src, snap, act ORDER BY snap.retrievedAt DESC
RETURN src.canonicalUri, head(collect({at: snap.retrievedAt, completeness: snap.captureCompleteness, method: snap.captureMethod, run: act.runId})) AS lastCapture
```

- trace: snapshot digests; blocked attempts (Reddit 403, Altmetric key) exist only in the D11 registry and the Activity logs.
- bitemporal episode needed on: none.

## Q-D9-16

- kind: cypher (coverage; the answer's Report records it)
- pattern: the denominator for an absence statement about person P: every work P APPEARS_IN, its renditions, the latest snapshot's `captureCompleteness`, whether text was extracted (chunks), and archive snapshots consulted. "Not found" is allowed only over works whose searched renditions are COMPLETE and chunked.

```cypher
MATCH (p:Person {uid: $personUid})-[:APPEARS_IN]->(w:MediaWork)
OPTIONAL MATCH (w)<-[:RENDITION_OF]-(src:Source)-[:HAS_SNAPSHOT]->(snap:SourceSnapshot)
OPTIONAL MATCH (snap)<-[:CHUNK_OF]-(ch:Chunk)
WITH w, src, snap, count(ch) AS chunks
RETURN w.uid, w.name, collect({rendition: src.canonicalUri, completeness: snap.captureCompleteness, archived: snap.archiveUri IS NOT NULL, chunks: chunks}) AS coverage
```

- trace: per work and rendition, the snapshot digests consulted; the answer Report cites them (`HAS_EVIDENCE` role CONTEXT).
- bitemporal episode needed on: none (APPEARS_IN recorded time only).

## Q-D9-17

- kind: cypher
- pattern: the evidence locator is a `BOUNDING_BOX` on an image rendition; the image is a `MediaWork {workKind: IMAGE}` whose other renditions show reuse; generation mode and rights are its properties.

```cypher
MATCH (a:Assertion {uid: $assertionUid})-[:HAS_EVIDENCE]->(loc:SourceLocator {selectorKind: 'BOUNDING_BOX'})<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)-[:RENDITION_OF]->(img:MediaWork {workKind: 'IMAGE'})
OPTIONAL MATCH (img)<-[:RENDITION_OF]-(other:Source) WHERE other <> src
RETURN img.uid, img.generationMode, img.rightsStatementVerbatim, collect(other.canonicalUri) AS reusedAt, loc.selectorJson
```

- trace: the region locator and both image snapshots (FC-8 "(Figure from the Nature paper)", "made with ChatGPT").
- bitemporal episode needed on: none.

## Q-D9-18

- kind: cypher
- pattern: D13 `Event` (DATA_PRESENTATION at a conference) ← predicate-only Assertion `RECORDING_OF` (subject = the talk MediaWork, object = the Event) → occurrences in the recording; frontier via D13 `ON_FRONTIER`.

```cypher
MATCH (f {uid: $frontierUid})<-[:ON_FRONTIER]-(ev)<-[:HAS_OBJECT]-(:Assertion {predicate: 'RECORDING_OF'})-[:HAS_SUBJECT]->(talk:MediaWork)
OPTIONAL MATCH (talk)<-[ap:APPEARS_IN]-(sp:Person) WHERE ap.appearanceRole IN ['PRESENTER','PANELIST']
OPTIONAL MATCH (talk)<-[:OCCURS_IN]-(o:ClaimOccurrence)
RETURN ev.name, talk.name, collect(DISTINCT sp.name) AS speakers, count(o) AS occurrences, [(talk)<-[:RENDITION_OF]-(s:Source) | s.canonicalUri] AS recordings
```

- trace: talk renditions and occurrence locators.
- bitemporal episode needed on: none.

## Q-D9-19

- kind: gds — the D9 **ranking** question (directive 3.5): criterion = weighted PageRank over the retelling graph restricted to frontier F and a 24-month window, method version `d9-influence/pagerank-v1`; computed, never a stored fact, never a ranking of truth.
- pattern: Cypher projection (monthly, `neo4j-gds-skill`): nodes = asserters (Person, Channel); relationship original-asserter → retelling-asserter weighted by the number of retold occurrences (explicit DERIVED_FROM plus accepted RETELLING_FIDELITY matches) **whose subject or object reaches F** through D13 (directly ON_FRONTIER, or involved in an Event ON_FRONTIER F, D13 INVOLVES; D13 vocab-frontiers section 8: claims reach a frontier only through events, studies and the kernel subject pattern); weighted PageRank, stream mode only.

```cypher
MATCH (f:Frontier {uid: $frontierUid})
MATCH (orig:Assertion)<-[:DERIVED_FROM]-(ret:ClaimOccurrence)-[:OCCURS_IN]->(w:MediaWork)
WHERE w.publishedAt >= datetime() - duration({months: 24})
  AND EXISTS { MATCH (ret)-[:HAS_SUBJECT|HAS_OBJECT]->(x)
               WHERE EXISTS { (x)-[:ON_FRONTIER]->(f) } OR EXISTS { (x)<-[:INVOLVES]-(:Event)-[:ON_FRONTIER]->(f) } }
MATCH (orig)-[:ASSERTED_BY]->(source), (ret)-[:ASSERTED_BY]->(target)
WHERE source <> target
WITH source, target, count(*) AS weight
RETURN gds.graph.project('d9-retelling-' + $frontierUid, target, source, { relationshipProperties: { weight: weight } })
// retellers point at the voice they retell; then
CALL gds.pageRank.stream('d9-retelling-' + $frontierUid, { relationshipWeightProperty: 'weight', dampingFactor: 0.85 }) YIELD nodeId, score
```

- refresh cadence: monthly per curated frontier (about 25, D13); drop the in-memory graph after the run.
- use: the stream is written by a PROJECTION Activity as kernel Assessments about each Person / Channel with `score`, `methodVersion`, frontier, window, `inputSetDigest`: `assessmentKind: OTHER`, `assessmentSubkind: D9.influence/pagerank-v1` until the kernel accepts `DISCOURSE_METRIC` (K-10); never a property on Person.
- trace: each score's inputs are the retold occurrences (DERIVED_FROM), each traceable.
- bitemporal episode needed on: none.

## Q-D9-20

- kind: vector (+ cypher hop) — the directive 3.8 effectiveness path
- pattern: question embedding → chunks (vector index; language filter applied after the index call on 5.26, in-index on 2026.01+) → `COVERS_LOCATOR` (derived span overlap) → the accepted occurrences whose `HAS_EVIDENCE` is that locator → snapshot bytes; alternative entry: entity X → `MENTIONS` ← chunks.

```cypher
// Neo4j 5.26 form. On 2026.01+: MATCH (c:Chunk) SEARCH c IN (VECTOR INDEX chunk_embedding FOR $questionEmbedding WHERE c.language = 'en' LIMIT 20) SCORE AS score
CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS c, score
WITH c, score WHERE c.language = 'en'
MATCH (c)-[:COVERS_LOCATOR]->(loc:SourceLocator)<-[ev:HAS_EVIDENCE {role: 'SUPPORTS'}]-(o:ClaimOccurrence)
WHERE o.status = 'ACCEPTED' AND o.recordedTo IS NULL
MATCH (loc)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:CHUNK_OF]-(c)
OPTIONAL MATCH (o)<-[:ASSESSES]-(adj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[av:HAS_EVIDENCE]->(loc)
RETURN score, c.text, o.uid, o.proposition, o.speechAct, loc.exact, loc.selectorDigest, snap.contentHash, adj.verdict, av.origin
ORDER BY score DESC
```

Entity entry (no embedding), the same continuation written out:

```cypher
MATCH (x {uid: $entityUid})<-[m:MENTIONS]-(c:Chunk)                 // derived, entity-link/vN; never evidence
MATCH (c)-[:COVERS_LOCATOR]->(loc:SourceLocator)<-[ev:HAS_EVIDENCE {role: 'SUPPORTS'}]-(o:ClaimOccurrence)
WHERE o.status = 'ACCEPTED' AND o.recordedTo IS NULL
MATCH (loc)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:CHUNK_OF]-(c)
OPTIONAL MATCH (o)<-[:ASSESSES]-(adj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[av:HAS_EVIDENCE]->(loc)
RETURN m.derivationRule, c.text, o.uid, o.proposition, o.speechAct, loc.exact, loc.selectorDigest, snap.contentHash, adj.verdict
```

- trace: chunk → locator → occurrence → snapshot digest; the verifier's adjudication HAS_EVIDENCE on the **same** locator (`selectorDigest` equal) shows that the verifier re-selects the span the answer cites. The chunk is never cited. FC-1: "What does David Sinclair say he takes for NAD?" → transcript chunk covering [71636, 71692) → REPORTS_PRACTICE occurrence → snapshot `3158acee…`.
- bitemporal episode needed on: none.

## Q-D9-21

- kind: cypher → assessment (CONFLICT_RELEVANCE, facets `relevanceBasis=SAME_ORGANIZATION|SAME_BRAND`, `rx=true`)
- pattern: recommendation occurrences whose subject is a prescription-only product, asserted by a person whose D7 `publicActorBasis` lacks `CLINICIAN_PUBLIC_COMMENTATOR` (D7 enum PublicActorBasis), in a work that links (predicate-only LINKS_TO_OFFER) to a D6 Offer, or to a D6 MerchantListing and its offers (`HAS_OFFER`; D6's answer to D6-1), whose `SELLER_OF_RECORD` is an organization tied to the asserter. **Blocked on D8:** D8 has no prescription-only status (its LegalStatusKind has no RX value; 11-open-questions D8-2), so the Rx set is a parameter until D8 defines it.

```cypher
MATCH (p:Person)<-[:ASSERTED_BY]-(o:ClaimOccurrence {speechAct: 'RECOMMENDS'})-[:HAS_SUBJECT]->(prod)
WHERE prod.uid IN $rxProductUids                                         // D8-2 open: supplied by D8's prescription status once defined
  AND NOT 'CLINICIAN_PUBLIC_COMMENTATOR' IN coalesce(p.publicActorBasis, [])
MATCH (o)-[:OCCURS_IN]->(w:MediaWork)<-[:HAS_SUBJECT]-(:Assertion {predicate: 'LINKS_TO_OFFER'})-[:HAS_OBJECT]->(target)
OPTIONAL MATCH (target:MerchantListing)-[:HAS_OFFER]->(lo:Offer)
WITH p, o, prod, w, coalesce(lo, target) AS offer
MATCH (offer:Offer)-[:SELLER_OF_RECORD]->(seller:Organization)
OPTIONAL MATCH (p)-[tie:HOLDS_ROLE|HOLDS_STAKE]->(seller)
RETURN p.name, prod.name, seller.name, type(tie), w.uid
```

- trace: FC-7 quotes 2–3 (Rx items linked to immortals.com) and quote 5 ("Trusted by Bryan Johnson") in `_notes/fixture-candidates.md`; FC-7 was not built as a fixture; ownership of the seller is an open D7 question (D7-4).
- bitemporal episode needed on: D7 tie edges (OVERLAP at w.publishedAt).

## Q-D9-22

- kind: cypher (published)
- pattern: recommendation occurrence → Claim → vetting Assessment / evidence-mission Activity → evidence Report verdict (kernel Q-K-08).

```cypher
MATCH (p:Person {uid: $personUid})<-[:ASSERTED_BY]-(o:ClaimOccurrence {speechAct: 'RECOMMENDS'})-[:OCCURRENCE_OF]->(c:Claim)
OPTIONAL MATCH (c)<-[:ASSESSES]-(v:Assessment {assessmentKind: 'VETTING'})
OPTIONAL MATCH (c)<-[:ASSESSES]-(r:Report {reportKind: 'EVIDENCE_REPORT'})-[:WAS_GENERATED_BY]->(m:Activity)
RETURN c.proposition, v.disposition, m.missionId, m.runId, r.verdict, r.publishedAt
```

- trace: the report's own citation set (kernel); the occurrence via TRACE.
- bitemporal episode needed on: none.

## Q-D9-23

- kind: cypher
- pattern: P's practice and recommendation occurrences ordered by container time; a reversal is a later occurrence by P on the same subject and predicate with opposite polarity or `speechAct DENIES`, or a practice report with `validTo` set.

```cypher
MATCH (p:Person {uid: $personUid})<-[:ASSERTED_BY]-(o:ClaimOccurrence)-[:OCCURS_IN]->(w:MediaWork)
WHERE o.speechAct IN ['RECOMMENDS','REPORTS_PRACTICE','DENIES','CAUTIONS']
MATCH (o)-[:HAS_SUBJECT]->(x)
WITH x, o, w ORDER BY w.publishedAt
WITH x, collect({at: w.publishedAt, act: o.speechAct, polarity: o.polarity, validTo: o.validTo, uid: o.uid}) AS history
RETURN x.name, history, any(i IN range(1, size(history) - 1) WHERE history[i].polarity <> history[i-1].polarity OR history[i].act = 'DENIES') AS reversed
```

- trace: each history entry's occurrence (TRACE); Reddit evidence for Attia stopping rapamycin was not capturable (S30) — absence of a capture is reported, not a reversal.
- bitemporal episode needed on: none (the practice's own valid time is on the Assertion).
