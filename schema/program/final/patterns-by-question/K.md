# K — final-SDL patterns for ruling-broken questions

Close-out round (FU-04), 2026-10-09. S pattern writer for packet K (owner A1). Research only, not medical advice.

- **Packet source.** The owner's fixed `biotech-knowledge-services-A1/schema/program/packets/K/03-retrieval-patterns.md` (branch `ft/schema-A1`, head 7aaeb2f, plus the uncommitted close-out edits in `_runlog/closeout-A1-K.md`: `CYPHER 25` prefixes removed, Q-K-14 and Q-K-16 fixed). That file stays the record of the packet SDL.
- **Target schema.** `final/schema/final_biotech_schema_v2.graphql` (SDL sha256 `c7cf1235…4793`, IR `final/schema/final_biotech_schema_v2.ir.json`). It is unchanged in this round. Labels, relationship types, directions, properties and enum values below are the final ones.
- **Lint input.** `final/_work/pattern-lint.json`: K has 36 blocks, 7 failing, all rulingBroken (owner re-lint: 0 packetBug).

## Counts

| item | n | questions |
|---|--:|---|
| K blocks failing in `pattern-lint.json` | 7 | Q-K-10, Q-K-15, Q-K-17, Q-K-21, Q-K-22, Q-K-23, CQ-AX-04 |
| packetBug left after the owner's fixes | 0 | — |
| **questions rewritten here** | **7** | Q-K-10 (R-44), Q-K-15 (R-15), Q-K-17 (R-44), Q-K-21 (R-43), Q-K-22 (R-44), Q-K-23 (R-15), CQ-AX-04 (R-09, R-41) |
| statements | 8 | Q-K-10 has two (the stale-capture listing and the failed re-anchor listing); the others one each |
| EXPLAIN ok on Neo4j 5.26 Community (`bks-neo4j-synth`) | see the `- EXPLAIN:` lines | written by the validator (`--fill`) |
| gds-unvalidated | 0 | no GDS call |
| questions lost to a ruling | 0 | none. CQ-AX-04 drops the `EMPTY_RESULT` attempt outcome, which the final `CaptureOutcome` enum no longer has (R-09, R-41); "searched, nothing found" is read from the RESEARCH Activity, as in the packet |

Rulings applied: R-44 (3 questions), R-15 (2), R-43 (1), R-09 with R-41 (1). R-42 and R-80 are applied where the rewrites read identifiers and authorship.

## Conventions (final SDL)

- **Lookup by uid.** As in the packet: `MATCH (x:$($label) {uid: $uid})` with a dynamic label (Neo4j 5.26+). The validator passes a sample label string. Plan note: on 5.26.31 Community a dynamic-label lookup that starts a query is planned as `AllNodesScan` plus a filter, not as the `uid` uniqueness-index seek the packet expects ("no label-free scan is ever needed"). The validator reports it on Q-K-23 and CQ-AX-04; Q-K-15 is planned from the Assertion side. A caller that knows the label at build time should write it as a static label. This is a K convention point for the executor, not an SDL change (FU-14).
- **Current.** "Current" is `recordedTo IS NULL` on a record (Assertion, Adjudication, Assessment, Report) or on an asserted edge episode, as in the packet. The as-of variant is the packet's (`recordedAt` / `recordedFrom <= $R AND (recordedTo IS NULL OR recordedTo > $R)`); the rewrites do not change it.
- **Revision mechanisms (R-44).** Three records can say a source was revised, and the rewrites read all three:
  1. `SNAPSHOT`: `SourceSnapshot.revisionKind` on a later capture of the same Source. It is a capture cache that R-44 keeps.
  2. `REVISES`: an identified notice or new version, D3 `(notice:Publication)-[:REVISES {revisionKind}]->(work:Publication)`, one episode per asserter (`RevisionEdgeProperties`, recorded time only). A Source reaches the work through `(src:Source)-[:RENDITION_OF]->(work)` (R-43; `AssertedRecordedProperties`). R-42 rules out the packet-era join through a shared DOI / PMID Identifier.
  3. `HAS_REVISION_STATUS`: a kernel literal Assertion about the Source, one per authority, for a flag with no identified notice (OpenAlex `is_retracted`, a PubMed publication type). Its value is `SourceRevisionKind` text in `valueString`.
  R-44 says a record is never written both ways for one (asserter, notice), so the branches do not double count one statement. They can return the same Source twice when two authorities used two mechanisms; the `mechanism` column keeps them apart.
- **Compromising revision kinds.** Where a pattern lists only compromising revisions it uses `['RETRACTION', 'EXPRESSION_OF_CONCERN', 'ERRATUM', 'WITHDRAWAL', 'CORRECTED_AND_REPUBLISHED']`, the packet's Q-K-10 list (all `SourceRevisionKind` values). `NEW_VERSION`, `SILENT_CONTENT_CHANGE` and `REINSTATEMENT` are not in it. Q-K-17 keeps the packet's wider rule (any revision kind marks the input).
- **Snapshot order.** Two captures are ordered by `coalesce(observedAt, retrievedAt)`, as the packet fixed in the fixtures stage (Q-K-10 note).
- **Authorship (R-15, R-80).** A multi-author work (a D3 Publication, or a D9 MediaWork with several bylines) asserts what it states in its own voice. Its authors are the objects of current `AUTHORED_BY` Assertions whose subject is the Publication (predicate registered by D3; object `Person | Organization`), or the Persons with a current D9 `APPEARS_IN {appearanceRole: 'AUTHOR'}` edge to the MediaWork. The interests read are the D7 edges `HOLDS_STAKE`, `RECEIVES_VALUE_FROM`, `HOLDS_ROLE` (Person or Organization → Organization) and `OWNS_BRAND` (Organization → Brand), each an episode with valid time.
- **Record kind.** Kind columns use `[l IN labels(x) WHERE l <> 'Entity'][0]`, because final domain nodes carry `Entity` as a second label.

Validation: `node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets K --fill`. It runs EXPLAIN on Neo4j 5.26 Community and a static check against the final IR and `vocabularies/predicates.yaml`. Its report is `final/_work/by-question/K.json`.

## Q-K-10

*Which current assertions rest on a capture of a source that has since been revised, and which locators failed to re-anchor on a newer capture?* Kind: cypher.

- **Ruling: R-44** (with R-43 and R-42). Q-K-10 must add the branch Source -RENDITION_OF-> Publication <-REVISES- notice.
- **What changed.**
  - Statement 1 is now a `UNION` of the three revision mechanisms (Conventions). The packet's branch (a) is kept unchanged as `SNAPSHOT`.
  - The new `REVISES` branch walks `(src)-[:RENDITION_OF]->(work)<-[:REVISES]-(notice)`. The revision's world time is the notice's `publishedAt`, and `learnedAt` is the REVISES episode's `recordedFrom`. Every current assertion on any capture of a rendition is listed. `capturedBeforeRevision` says whether that capture predates the notice; it is true when the notice date is unknown.
  - The `HAS_REVISION_STATUS` branch lists the assertions resting on a flagged Source. The packet left this to Q-K-22. It is added here because R-44 makes the flag the only record when no notice is identified. The flag's own Assertion and other flags are excluded from the affected list.
  - The union is wrapped in `CALL () { … }` so that the packet's `ORDER BY revisedAt DESC` applies to every branch.
  - Statement 2 (failed re-anchor) is the packet's branch (b) with aliased columns. No ruling touches it.
- **How the question is answered now:** in full. Nothing is lost. A Source flagged only through its work is found only when its `RENDITION_OF` edge is asserted; fixture coverage of RENDITION_OF Source → Publication is still open (FX-10).

```cypher
// @id Q-K-10#1
// assertions resting on a capture of a revised source, by mechanism (R-44): SNAPSHOT | REVISES | HAS_REVISION_STATUS
CALL () {
  MATCH (src:Source)-[:HAS_SNAPSHOT]->(rev:SourceSnapshot)
  WHERE rev.revisionKind IN ['RETRACTION', 'EXPRESSION_OF_CONCERN', 'ERRATUM', 'WITHDRAWAL', 'CORRECTED_AND_REPUBLISHED']
  MATCH (src)-[:HAS_SNAPSHOT]->(old:SourceSnapshot)-[:HAS_LOCATOR]->(loc:SourceLocator)<-[:HAS_EVIDENCE]-(a:Assertion)
  WHERE coalesce(old.observedAt, old.retrievedAt) < coalesce(rev.observedAt, rev.retrievedAt) AND a.recordedTo IS NULL
  RETURN 'SNAPSHOT' AS mechanism, src.canonicalUri AS source, null AS work, null AS notice, rev.revisionKind AS revisionKind,
         rev.publishedAt AS revisedAt, rev.retrievedAt AS learnedAt, null AS revisionRecord,
         a.uid AS assertion, a.predicate AS predicate, a.assertionKind AS assertionKind, loc.exact AS exact,
         true AS capturedBeforeRevision
  UNION
  // R-44 + R-43: an identified notice REVISES the work; the Source is a RENDITION_OF that work (no shared Identifier, R-42)
  MATCH (notice:Publication)-[rv:REVISES]->(pub:Publication)<-[ro:RENDITION_OF]-(src:Source)
  WHERE rv.recordedTo IS NULL AND ro.recordedTo IS NULL
    AND rv.revisionKind IN ['RETRACTION', 'EXPRESSION_OF_CONCERN', 'ERRATUM', 'WITHDRAWAL', 'CORRECTED_AND_REPUBLISHED']
  MATCH (src)-[:HAS_SNAPSHOT]->(old:SourceSnapshot)-[:HAS_LOCATOR]->(loc:SourceLocator)<-[:HAS_EVIDENCE]-(a:Assertion)
  WHERE a.recordedTo IS NULL AND NOT a.predicate IN ['HAS_REVISION_STATUS', 'RENDITION_OF']
  RETURN 'REVISES' AS mechanism, src.canonicalUri AS source, pub.uid AS work, notice.uid AS notice, rv.revisionKind AS revisionKind,
         notice.publishedAt AS revisedAt, rv.recordedFrom AS learnedAt, rv.assertionUid AS revisionRecord,
         a.uid AS assertion, a.predicate AS predicate, a.assertionKind AS assertionKind, loc.exact AS exact,
         (notice.publishedAt IS NULL OR coalesce(old.observedAt, old.retrievedAt) < notice.publishedAt) AS capturedBeforeRevision
  UNION
  // R-44: a status flag with no identified notice (kernel HAS_REVISION_STATUS on the Source, one per authority)
  MATCH (st:Assertion {predicate: 'HAS_REVISION_STATUS'})-[:HAS_SUBJECT]->(src:Source)
  WHERE st.recordedTo IS NULL
    AND st.valueString IN ['RETRACTION', 'EXPRESSION_OF_CONCERN', 'ERRATUM', 'WITHDRAWAL', 'CORRECTED_AND_REPUBLISHED']
  MATCH (src)-[:HAS_SNAPSHOT]->(old:SourceSnapshot)-[:HAS_LOCATOR]->(loc:SourceLocator)<-[:HAS_EVIDENCE]-(a:Assertion)
  WHERE a.recordedTo IS NULL AND a.predicate <> 'HAS_REVISION_STATUS'
  RETURN 'HAS_REVISION_STATUS' AS mechanism, src.canonicalUri AS source, null AS work, null AS notice, st.valueString AS revisionKind,
         st.validFrom AS revisedAt, st.recordedAt AS learnedAt, st.uid AS revisionRecord,
         a.uid AS assertion, a.predicate AS predicate, a.assertionKind AS assertionKind, loc.exact AS exact,
         (st.validFrom IS NULL OR coalesce(old.observedAt, old.retrievedAt) < st.validFrom) AS capturedBeforeRevision
}
RETURN mechanism, source, work, notice, revisionKind, revisedAt, learnedAt, revisionRecord,
       assertion, predicate, assertionKind, exact, capturedBeforeRevision
ORDER BY revisedAt DESC;

// @id Q-K-10#2
// (b) failed re-anchor: a newer capture exists and no locator on it re-anchors this one (unchanged from the packet)
MATCH (src:Source)-[:HAS_SNAPSHOT]->(old:SourceSnapshot)-[:HAS_LOCATOR]->(loc:SourceLocator)<-[:HAS_EVIDENCE]-(a:Assertion)
MATCH (src)-[:HAS_SNAPSHOT]->(newer:SourceSnapshot) WHERE coalesce(newer.observedAt, newer.retrievedAt) > coalesce(old.observedAt, old.retrievedAt)
  AND NOT EXISTS { MATCH (newer)-[:HAS_LOCATOR]->(l2:SourceLocator) WHERE l2.reanchorsLocatorUid = loc.uid }
RETURN DISTINCT a.uid AS assertion, loc.uid AS locator, old.contentHash AS oldCapture, newer.contentHash AS newerCapture;
```

- EXPLAIN: ok on Neo4j 5.26.31 community (2/2 statements); final-SDL static check clean (labels, types, pairs, properties, enum values, predicates)
- as-of: the packet's (`rev.retrievedAt <= $R`, `rv.recordedFrom <= $R`, `st.recordedAt <= $R` for what was known at R).
- trace: each row's `exact` is the stale assertion's own span. `revisionRecord` is the REVISES or HAS_REVISION_STATUS Assertion, which cites the notice locator (Crossref `updated-by` JSON pointer, PubMed `CommentsCorrections`) or the flag locator (OpenAlex `/is_retracted`). For `SNAPSHOT` rows the revising capture's digest is the evidence.
- fixture: `final/fixtures/K/retracted-sah-2017-stale-evidence` (snapshot order: archive capture 2024-08-16 vs live page 2026-10-08), `final/fixtures/D11/resveratrol-retraction-integrity` (REVISES per asserter, RENDITION_OF from the PubMed Source), `final/fixtures/D3/resveratrol-retraction`.
- bitemporal episode needed on: none (REVISES and RENDITION_OF are recorded-time only; the flag's valid time is on its Assertion).

## Q-K-15

*Which current assertions about X rest on no independent support or on promotional sources, and what interest does the asserter, or the authors of an asserting work, hold?* Kind: cypher.

- **Ruling: R-15** (with R-80). A multi-author work asserts in its own voice. Q-K-15 must add the branch asserter → AUTHORED_BY → Person → D7 interest edges, including HOLDS_ROLE.
- **What changed.**
  - The verifier-vector part (authority and independence from the current Adjudications' `VERIFIER_FOUND` evidence edges) is the packet's, unchanged.
  - New `authors` subquery: when the asserter is a Publication, the objects of its current `AUTHORED_BY` Assertions; when it is a MediaWork, the Persons with a current `APPEARS_IN {appearanceRole: 'AUTHOR'}` edge.
  - New `interests` subquery. It covers the asserter when it is a Person or Organization, and every author. For each it reads the current D7 interest episodes `HOLDS_STAKE`, `RECEIVES_VALUE_FROM` and `HOLDS_ROLE`, and `OWNS_BRAND` for an Organization. It returns the kind (`stakeKind`, `valueKind`, `roleKind`), the valid-time bounds and the authorizing Assertion. Whether an interest held when the statement was made is read from those bounds against the assertion's own `validFrom`: a null bound is unknown, never ongoing (the packet's rule).
  - The packet's D6 seller enrichment (`(offer)-[:SELLER_OF_RECORD]->(who)` for a product containing X) stays a separate seam read, as in the packet comment.
- **How the question is answered now:** in full. Nothing is lost. Author identity behind an `AUTHORED_BY` object comes from D7 RESOLUTION Assessments (R-80); an unresolved byline is an author with no interest rows.

```cypher
// @id Q-K-15
// @param label:string
MATCH (x:$($label) {uid: $uid})<-[:HAS_SUBJECT]-(a:Assertion)-[:ASSERTED_BY]->(who)
WHERE a.recordedTo IS NULL
OPTIONAL MATCH (a)-[:HAS_EVIDENCE {origin: 'DECLARED'}]->(loc:SourceLocator)
      <-[e:HAS_EVIDENCE {origin: 'VERIFIER_FOUND'}]-(adj:Adjudication)-[:ASSESSES]->(a)
WHERE adj.recordedTo IS NULL
WITH a, who, [v IN collect(e.independence) WHERE v IS NOT NULL] AS independence,
     [v IN collect(e.authority) WHERE v IS NOT NULL] AS authority
// R-15 / R-80: the authors of an asserting work (D3 AUTHORED_BY on a Publication; D9 APPEARS_IN {AUTHOR} on a MediaWork)
CALL (who) {
  OPTIONAL MATCH (au:Assertion {predicate: 'AUTHORED_BY'})-[:HAS_SUBJECT]->(who)
  WHERE au.recordedTo IS NULL AND au.status <> 'REJECTED'
  OPTIONAL MATCH (au)-[:HAS_OBJECT]->(byline)
  OPTIONAL MATCH (person:Person)-[ap:APPEARS_IN]->(mw:MediaWork)
  WHERE mw = who AND ap.appearanceRole = 'AUTHOR' AND ap.recordedTo IS NULL
  RETURN [w IN collect(DISTINCT byline) + collect(DISTINCT person) WHERE w IS NOT NULL] AS authors
}
WITH a, who, independence, authority, authors,
     CASE WHEN who:Person OR who:Organization THEN [who] ELSE [] END + authors AS holders
// D7 interest episodes of the asserter and of each author (HOLDS_STAKE, RECEIVES_VALUE_FROM, HOLDS_ROLE; OWNS_BRAND)
CALL (holders) {
  UNWIND holders AS h
  OPTIONAL MATCH (h)-[st:HOLDS_STAKE]->(so:Organization) WHERE st.recordedTo IS NULL
  OPTIONAL MATCH (h)-[vt:RECEIVES_VALUE_FROM]->(vo:Organization) WHERE vt.recordedTo IS NULL
  OPTIONAL MATCH (h)-[rl:HOLDS_ROLE]->(ro:Organization) WHERE rl.recordedTo IS NULL
  OPTIONAL MATCH (h)-[ob:OWNS_BRAND]->(br:Brand) WHERE ob.recordedTo IS NULL
  WITH h,
       collect(DISTINCT CASE WHEN st IS NULL THEN null ELSE {holder: h.uid, interest: 'HOLDS_STAKE', counterparty: so.name, kind: st.stakeKind,
               validFrom: st.validFrom, validTo: st.validTo, assertion: st.assertionUid} END) +
       collect(DISTINCT CASE WHEN vt IS NULL THEN null ELSE {holder: h.uid, interest: 'RECEIVES_VALUE_FROM', counterparty: vo.name, kind: vt.valueKind,
               validFrom: vt.validFrom, validTo: vt.validTo, assertion: vt.assertionUid} END) +
       collect(DISTINCT CASE WHEN rl IS NULL THEN null ELSE {holder: h.uid, interest: 'HOLDS_ROLE', counterparty: ro.name, kind: rl.roleKind,
               validFrom: rl.validFrom, validTo: rl.validTo, assertion: rl.assertionUid} END) +
       collect(DISTINCT CASE WHEN ob IS NULL THEN null ELSE {holder: h.uid, interest: 'OWNS_BRAND', counterparty: br.name, kind: null,
               validFrom: ob.validFrom, validTo: ob.validTo, assertion: ob.assertionUid} END) AS rows
  UNWIND rows AS row
  RETURN collect(row) AS interests
}
RETURN a.uid AS assertion, a.predicate AS predicate, a.validFrom AS statedAt,
       [l IN labels(who) WHERE l <> 'Entity'][0] AS asserterKind, who.uid AS asserterUid, who.name AS asserter,
       [p IN authors | p.uid] AS authors, independence, authority, interests,
       size(authority) = 0 AS notYetVerified,
       size(independence) > 0 AND NOT 'INDEPENDENT' IN independence AS noIndependentSupport,
       'PROMOTIONAL' IN authority AS restsOnPromotional,
       size(interests) > 0 AS asserterOrAuthorHasInterest
ORDER BY noIndependentSupport DESC, notYetVerified
```

- EXPLAIN: ok on Neo4j 5.26.31 community (1/1 statement); final-SDL static check clean (labels, types, pairs, properties, enum values, predicates)
- as-of: the packet's predicate on `a` and `adj`; the same on `au`, `ap` and each interest episode for what was known at R.
- trace: the evidence spans with their authority and independence vectors (verification.v1); each `AUTHORED_BY` Assertion cites the byline locator (JATS `contrib-group`, Crossref `/author`); each interest row's `assertion` is the D7 Assertion with its own locators (SEC filing, Open Payments row, company page).
- fixture: `final/fixtures/K/seller-claim-occurrences`, `final/fixtures/D11/nr-trial-jats-unstructured` (Publication asserter with AUTHORED_BY bylines, R-15), `final/fixtures/D7/elysium-paper-funding-award` and `final/fixtures/D7/niagen-ownership-brand-history` (D7 interest episodes).
- bitemporal episode needed on: D7 `HOLDS_STAKE` (`StakeEdgeProperties`), `RECEIVES_VALUE_FROM` (`ValueEdgeProperties`), `HOLDS_ROLE` (`RoleEdgeProperties`) and `OWNS_BRAND` (`AssertedEdgeProperties`), all episodes with valid time already. None in K.

## Q-K-17

*For a Report, which inputs of its citation set are closed, rejected or rest on a source that was later revised?* Kind: cypher.

- **Ruling: R-44** (with R-43). Q-K-17 must add the branch Source -RENDITION_OF-> Publication <-REVISES- notice.
- **What changed.**
  - The packet's four branches are kept unchanged (`ASSERTION`, `ASSESSMENT`, `LOCATOR`, `ASSERTION_SOURCE`). `ASSERTION_SOURCE` already reads the capture cache and the kernel HAS_REVISION_STATUS flag.
  - Two branches are added for the identified-notice mechanism:
    - `LOCATOR_WORK`: a locator the Report cites directly, on a capture of a Source that is a `RENDITION_OF` a Publication some notice `REVISES`.
    - `ASSERTION_WORK`: a `DERIVED_FROM` input Assertion whose own evidence is on such a Source.
    The revision returned is the REVISES episode's `revisionKind`, and `revisionRecord` names its authorizing Assertion.
  - `revisionRecord` is a new column on every branch (null where the packet had none).
  - The packet's `compromised` test keeps its statuses: it mixes Assertion and Assessment statuses (`REJECTED`, `SUPERSEDED` and the AssessmentStatus `WITHDRAWN`), which matches the two kinds of input. The status test is wrapped in `coalesce(…, false)`: a LOCATOR row has no status, and the packet's form returned null instead of false for an uncompromised locator (found by the runtime smoke test, see `_runlog/closeout-fix.md`).
- **How the question is answered now:** in full. Nothing is lost.

```cypher
// @id Q-K-17
MATCH (r:Report {uid: $reportUid})
CALL (r) {
  MATCH (r)-[:DERIVED_FROM]->(a:Assertion)
  RETURN 'ASSERTION' AS kind, a.uid AS uid, a.status AS state, a.recordedTo AS closedAt, null AS revision, null AS revisionRecord
  UNION
  MATCH (r)-[:DERIVED_FROM]->(s:Assessment)
  RETURN 'ASSESSMENT' AS kind, s.uid AS uid, s.status AS state, s.recordedTo AS closedAt, null AS revision, null AS revisionRecord
  UNION
  MATCH (r)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
  OPTIONAL MATCH (src)-[:HAS_SNAPSHOT]->(rev:SourceSnapshot)
  WHERE coalesce(rev.observedAt, rev.retrievedAt) > coalesce(snap.observedAt, snap.retrievedAt) AND rev.revisionKind IS NOT NULL
  RETURN 'LOCATOR' AS kind, loc.uid AS uid, null AS state, null AS closedAt, rev.revisionKind AS revision, null AS revisionRecord
  UNION
  // a cited Assertion whose own evidence rests on a Source with a later revised capture or a HAS_REVISION_STATUS flag
  MATCH (r)-[:DERIVED_FROM]->(a:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
  OPTIONAL MATCH (src)-[:HAS_SNAPSHOT]->(rev:SourceSnapshot)
  WHERE coalesce(rev.observedAt, rev.retrievedAt) > coalesce(snap.observedAt, snap.retrievedAt) AND rev.revisionKind IS NOT NULL
  OPTIONAL MATCH (src)<-[:HAS_SUBJECT]-(st:Assertion {predicate: 'HAS_REVISION_STATUS'}) WHERE st.recordedTo IS NULL
  WITH a, coalesce(rev.revisionKind, st.valueString) AS revision, CASE WHEN rev IS NULL THEN st.uid END AS revisionRecord
  WHERE revision IS NOT NULL
  RETURN DISTINCT 'ASSERTION_SOURCE' AS kind, a.uid AS uid, a.status AS state, a.recordedTo AS closedAt, revision, revisionRecord
  UNION
  // R-44 + R-43: a locator the Report cites, on a rendition of a Publication that an identified notice REVISES
  MATCH (r)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
        -[ro:RENDITION_OF]->(:Publication)<-[rv:REVISES]-(:Publication)
  WHERE ro.recordedTo IS NULL AND rv.recordedTo IS NULL
  RETURN DISTINCT 'LOCATOR_WORK' AS kind, loc.uid AS uid, null AS state, null AS closedAt, rv.revisionKind AS revision, rv.assertionUid AS revisionRecord
  UNION
  // R-44 + R-43: a cited Assertion whose evidence is on a rendition of a revised Publication
  MATCH (r)-[:DERIVED_FROM]->(a:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
        -[ro:RENDITION_OF]->(:Publication)<-[rv:REVISES]-(:Publication)
  WHERE ro.recordedTo IS NULL AND rv.recordedTo IS NULL
  RETURN DISTINCT 'ASSERTION_WORK' AS kind, a.uid AS uid, a.status AS state, a.recordedTo AS closedAt, rv.revisionKind AS revision, rv.assertionUid AS revisionRecord
}
RETURN kind, uid, state, closedAt, revision, revisionRecord,
       (closedAt IS NOT NULL OR coalesce(state IN ['REJECTED', 'SUPERSEDED', 'WITHDRAWN'], false) OR revision IS NOT NULL) AS compromised;
```

- EXPLAIN: ok on Neo4j 5.26.31 community (1/1 statement); final-SDL static check clean (labels, types, pairs, properties, enum values, predicates)
- as-of: as in the packet, compare `closedAt`, `rev.retrievedAt` and the REVISES `recordedFrom` with `r.publishedAt` to separate "already stale when published" from "became stale later".
- trace: the rows are the report's citations. `revisionRecord` points at the REVISES or HAS_REVISION_STATUS Assertion and its notice or flag locator.
- fixture: `final/fixtures/K/retracted-sah-2017-stale-evidence` (the report cites the retracted occurrence through DERIVED_FROM); `final/fixtures/cross-domain/claim-mission-report`.
- bitemporal episode needed on: none.

## Q-K-21

*For a claim, how many distinct and how many independent source families support, contradict or qualify it?* Kind: cypher.

- **Ruling: R-43.** RENDITION_OF (Source → work) has kernel meaning and is declared by D9 (MediaWork) and D3 (Publication). K's source-family rule is: the OCCURS_IN work; else the RENDITION_OF work (MediaWork or Publication); else the Source.
- **What changed.**
  - The family step now reaches a D3 Publication: `(src)-[ro:RENDITION_OF]->(work) WHERE work:MediaWork OR work:Publication`. The packet's unlabeled `work` could only mean a D9 MediaWork when it was written.
  - The `RENDITION_OF` episode is read current (`ro.recordedTo IS NULL`). Regrouping is a supersession (R-26, R-43), so a closed grouping no longer merges families.
  - `OCCURS_IN` is typed to its only final target, `MediaWork`.
  - A new `familyBasis` value (`OCCURS_IN`, `RENDITION_OF` or `SOURCE`) is returned per row, so a reader sees which rule built each family.
  - The counts and the independence rule (only primaries whose spans all carry a current verifier `INDEPENDENT`) are the packet's.
- **How the question is answered now:** in full. Nothing is lost. Scholarly records (no OCCURS_IN) now collapse into their Publication instead of counting each rendition (PubMed, PMC, publisher PDF) as its own family. That is what R-43 asked for.

```cypher
// @id Q-K-21
MATCH (c:Claim {uid: $claimUid})<-[:OCCURRENCE_OF]-(o:Assertion)
WHERE o.recordedTo IS NULL
OPTIONAL MATCH (o)-[:DERIVED_FROM]->+(root:Assertion) WHERE NOT EXISTS { (root)-[:DERIVED_FROM]->(:Assertion) }
WITH o, coalesce(root, o) AS primary
OPTIONAL MATCH (primary)-[:OCCURS_IN]->(container:MediaWork)              // D9: the container, one per occurrence (R-19)
MATCH (primary)-[:HAS_EVIDENCE {origin: 'DECLARED'}]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
// R-43: the RENDITION_OF work is a D9 MediaWork or a D3 Publication (asserted, recorded time only)
OPTIONAL MATCH (src)-[ro:RENDITION_OF]->(work)
WHERE (work:MediaWork OR work:Publication) AND ro.recordedTo IS NULL
OPTIONAL MATCH (loc)<-[v:HAS_EVIDENCE {origin: 'VERIFIER_FOUND'}]-(adj:Adjudication)-[:ASSESSES]->(primary)
WHERE adj.recordedTo IS NULL
WITH o, primary, coalesce(container.uid, work.uid, src.uid) AS family,
     CASE WHEN container IS NOT NULL THEN 'OCCURS_IN' WHEN work IS NOT NULL THEN 'RENDITION_OF' ELSE 'SOURCE' END AS familyBasis,
     collect(v.independence) AS ind,
     CASE o.polarity WHEN 'POSITIVE' THEN 'SUPPORTS' WHEN 'NEGATIVE' THEN 'CONTRADICTS' ELSE 'QUALIFIES' END AS role
WITH role, o, primary, family, familyBasis, size(ind) > 0 AND all(i IN ind WHERE i = 'INDEPENDENT') AS independent
RETURN role, count(DISTINCT o) AS occurrences, count(DISTINCT family) AS distinctFamilies,
       count(DISTINCT CASE WHEN independent THEN family END) AS independentFamilies,
       collect(DISTINCT {occurrence: o.uid, primary: primary.uid, family: family, familyBasis: familyBasis,
                         retelling: o <> primary, independent: independent}) AS rows;
```

- EXPLAIN: ok on Neo4j 5.26.31 community (1/1 statement); final-SDL static check clean (labels, types, pairs, properties, enum values, predicates)
- as-of: the packet's predicate on `o` and `adj`; `ro.recordedFrom <= $R AND (ro.recordedTo IS NULL OR ro.recordedTo > $R)` for the grouping as known at R.
- trace: each row's primary occurrence cites its locator; retellings point at their primary and count in its family. `Report.distinctSourceFamilyCount` and `independentSourceFamilyCount` use the same family rule (R-43). An EVIDENCE_SYNTHESIS Assessment can still merge families the graph does not join (shared authors), now through the D3 `AUTHORED_BY` predicate (R-80).
- fixture: `final/fixtures/K/hubbard-2013-unstructured-to-entity`, `final/fixtures/K/resveratrol-sirt1-evidence-mission` (its RENDITION_OF Source → Publication rows are still missing: FX-10), `final/fixtures/cross-domain/claim-mission-report`.
- bitemporal episode needed on: none (RENDITION_OF is recorded-time only).

## Q-K-22

*Which sources that our assertions cite carry a revision status, from which authority, since when, and how many assertions does each affect?* Kind: cypher.

- **Ruling: R-44** (with R-43). Q-K-22 must add the branch Source -RENDITION_OF-> Publication <-REVISES- notice. HAS_REVISION_STATUS is written only for non-scholarly Sources and for flags with no identified notice.
- **What changed.**
  - The packet's statement is kept as the `HAS_REVISION_STATUS` branch. Its exclusion of other authorities' status assertions from the affected count is kept too.
  - A new `REVISES` branch reads each identified notice per asserter: the authority is the asserter of the REVISES Assertion (`rv.assertionUid`), and `since` is the notice's `publishedAt`. REVISES carries no valid time (`RevisionEdgeProperties`), so `sinceBasis` is the literal `notice.publishedAt`. `learnedAt` is the episode's `recordedFrom`. The affected assertions are those on any capture of any current rendition of the revised work.
  - Both branches are wrapped in `CALL () { … UNION … }` so the packet's `ORDER BY since DESC` covers both. New columns: `mechanism`, `work`, `notice` and `statusRecord`.
- **How the question is answered now:** in full. Nothing is lost. A scholarly retraction that only an identified notice records was invisible to the packet query; it now appears.

```cypher
// @id Q-K-22
CALL () {
  // kernel flag, one per authority (non-scholarly Sources, or no identified notice)
  MATCH (st:Assertion {predicate: 'HAS_REVISION_STATUS'})-[:HAS_SUBJECT]->(src:Source)
  WHERE st.recordedTo IS NULL
  MATCH (st)-[:ASSERTED_BY]->(auth)
  MATCH (src)-[:HAS_SNAPSHOT]->(:SourceSnapshot)-[:HAS_LOCATOR]->(:SourceLocator)<-[:HAS_EVIDENCE]-(a:Assertion)
  WHERE a.predicate <> 'HAS_REVISION_STATUS' AND a.recordedTo IS NULL
  RETURN 'HAS_REVISION_STATUS' AS mechanism, src.canonicalUri AS source, null AS work, null AS notice, st.uid AS statusRecord,
         st.valueString AS status, auth.uid AS asserterUid, auth.name AS assertedBy, st.validFrom AS since,
         toString(st.validFromBasis) AS sinceBasis, st.recordedAt AS learnedAt, count(DISTINCT a) AS affectedAssertions
  UNION
  // R-44 + R-43: identified notice (D3 REVISES, per asserter) on a work the cited Source is a rendition of
  MATCH (notice:Publication)-[rv:REVISES]->(pub:Publication)<-[ro:RENDITION_OF]-(src:Source)
  WHERE rv.recordedTo IS NULL AND ro.recordedTo IS NULL
  MATCH (ra:Assertion {uid: rv.assertionUid})-[:ASSERTED_BY]->(auth)
  MATCH (src)-[:HAS_SNAPSHOT]->(:SourceSnapshot)-[:HAS_LOCATOR]->(:SourceLocator)<-[:HAS_EVIDENCE]-(a:Assertion)
  WHERE a.recordedTo IS NULL AND NOT a.predicate IN ['HAS_REVISION_STATUS', 'RENDITION_OF']
  RETURN 'REVISES' AS mechanism, src.canonicalUri AS source, pub.uid AS work, notice.uid AS notice, ra.uid AS statusRecord,
         toString(rv.revisionKind) AS status, auth.uid AS asserterUid, auth.name AS assertedBy, notice.publishedAt AS since,
         'notice.publishedAt' AS sinceBasis, rv.recordedFrom AS learnedAt, count(DISTINCT a) AS affectedAssertions
}
RETURN mechanism, source, work, notice, statusRecord, status, asserterUid, assertedBy, since, sinceBasis, learnedAt, affectedAssertions
ORDER BY since DESC;
```

- EXPLAIN: ok on Neo4j 5.26.31 community (1/1 statement); final-SDL static check clean (labels, types, pairs, properties, enum values, predicates)
- as-of: `st.recordedAt <= $R` and `rv.recordedFrom <= $R` (CQ-TM-02: a retraction learned on 2026-10-08 is invisible at R = 2026-01-01 even when `since` is earlier).
- trace: each status cites the notice's locator (Crossref `updated-by` JSON pointer, PubMed `CommentsCorrections` / `PublicationType`) through `statusRecord`.
- fixture: `final/fixtures/D11/resveratrol-retraction-integrity` (REVISES per asserter: NLM, Crossref, the publisher), `final/fixtures/D3/resveratrol-retraction`, `final/fixtures/D13/lesne-2006-retraction` (REVISES; its HAS_REVISION_STATUS rows are kept by R-44 for status-only flags), `final/fixtures/K/retracted-sah-2017-stale-evidence`.
- bitemporal episode needed on: none (valid time on the status Assertion; REVISES recorded-time only).

## Q-K-23

*What has asserter P claimed, and what do current evidence reports and third-party ratings say about each claim, compared with when it was said?* Kind: cypher.

- **Ruling: R-15** (with R-80). Q-K-23 must add the AUTHORED_BY branch: a Person's claims include those made in the voice of a multi-author work the Person authored.
- **What changed.**
  - The occurrences of P are a `CALL (p) { … UNION … }` with three branches, and `via` says which one gave each row:
    - `ASSERTER`: P is the asserter (the packet's only path).
    - `AUTHORED_BY`: P is the object of a current `AUTHORED_BY` Assertion whose subject is the asserting Publication (D3).
    - `APPEARS_IN_AUTHOR`: P has a current `APPEARS_IN {appearanceRole: 'AUTHOR'}` edge to the asserting MediaWork (D9).
  - `work` names the work for the two new branches.
  - Occurrences and ratings are read current (`recordedTo IS NULL`), the packet's default. Empty rating rows are dropped.
  - The claim uid, occurrence uid and report uid are returned so each row can be traced.
- **How the question is answered now:** in full. Nothing is lost. For an Organization or Agent asserter only the `ASSERTER` branch can match.

```cypher
// @id Q-K-23
// @param label:string
MATCH (p:$($label) {uid: $asserterUid})
CALL (p) {
  MATCH (o:Assertion {assertionKind: 'CLAIM'})-[:ASSERTED_BY]->(p)
  WHERE o.recordedTo IS NULL
  RETURN o, 'ASSERTER' AS via, null AS work
  UNION
  // R-15 / R-80: claims stated in the voice of a Publication that P authored
  MATCH (au:Assertion {predicate: 'AUTHORED_BY'})-[:HAS_OBJECT]->(p)
  WHERE au.recordedTo IS NULL AND au.status <> 'REJECTED'
  MATCH (au)-[:HAS_SUBJECT]->(w:Publication)<-[:ASSERTED_BY]-(o:Assertion {assertionKind: 'CLAIM'})
  WHERE o.recordedTo IS NULL
  RETURN o, 'AUTHORED_BY' AS via, w.uid AS work
  UNION
  // R-15: claims stated in the voice of a MediaWork that P authored (D9 APPEARS_IN {AUTHOR})
  MATCH (p)-[ap:APPEARS_IN]->(w:MediaWork)<-[:ASSERTED_BY]-(o:Assertion {assertionKind: 'CLAIM'})
  WHERE ap.appearanceRole = 'AUTHOR' AND ap.recordedTo IS NULL AND o.recordedTo IS NULL
  RETURN o, 'APPEARS_IN_AUTHOR' AS via, w.uid AS work
}
MATCH (o)-[:OCCURRENCE_OF]->(c:Claim)
OPTIONAL MATCH (c)<-[:ASSESSES]-(r:Report {reportKind: 'EVIDENCE_REPORT'}) WHERE r.recordedTo IS NULL
OPTIONAL MATCH (c)<-[:HAS_SUBJECT]-(rv:Assertion {predicate: 'RATES_CLAIM'})-[:ASSERTED_BY]->(reviewer)
WHERE rv.recordedTo IS NULL
WITH o, via, work, c, r,
     collect(DISTINCT CASE WHEN rv IS NULL THEN null ELSE {reviewer: reviewer.name, rating: rv.valueString, ratingAssertion: rv.uid} END) AS ratings,
     coalesce(o.validFrom, o.validObservedAt) AS saidAt
RETURN c.uid AS claim, c.proposition AS proposition, o.uid AS occurrence, via, work, saidAt,
       r.uid AS report, r.verdict AS verdict, r.publishedAt AS reportPublishedAt, saidAt > r.publishedAt AS saidAfterReport, ratings
ORDER BY saidAt
```

- EXPLAIN: ok on Neo4j 5.26.31 community (1/1 statement); plan contains AllNodesScan; final-SDL static check clean (labels, types, pairs, properties, enum values, predicates)
- as-of: the packet's predicates on `o`, `r` and `rv`, plus the same on `au` and `ap`.
- trace: occurrences and reports cite locators; ratings cite the review page's locator; the `AUTHORED_BY` Assertion cites the byline locator.
- fixture: `final/fixtures/K/seller-claim-occurrences`, `final/fixtures/D9/rapa-ex-01-attia-retelling` and `final/fixtures/D9/hl-essentials-recut-nmncom-retelling` (APPEARS_IN with role AUTHOR), `final/fixtures/D11/nr-trial-jats-unstructured` (Publication asserter with AUTHORED_BY bylines), `final/fixtures/D10/fda-qhc-magnesium-disconfirmation` (RATES_CLAIM).
- bitemporal episode needed on: none.

## CQ-AX-04

*Why is the answer about X for predicate P empty: measured absent, not reported, searched and found nothing, blocked, unknown, or out of scope?* Kind: cypher (+ client registry check).

- **Ruling: R-09** (with R-41). Read "not reported" through the FIELD_NOT_REPORTED branch, and read CaptureAttempt (PARTIAL or FAILED) only for "blocked". Drop EMPTY_RESULT. R-41 keeps CaptureAttempt for FAILED and PARTIAL attempts only. The final `CaptureOutcome` enum is `PARTIAL | FAILED`.
- **What changed.**
  - "Searched but nothing found" no longer reads a CaptureAttempt with outcome `EMPTY_RESULT`, a value the final enum does not have. It reads only the RESEARCH Activity that `ASSESSES` X (the packet's first source for it).
  - "Blocked" reads the CaptureAttempts with `subjectUid` = X and outcome `FAILED` or `PARTIAL` (D11 property join, R-41). The attempts come back with `toolId`, `failureKind`, `httpStatus` and `attemptedAt`, so the answer can name the block.
  - "Not reported" reads only current `FIELD_NOT_REPORTED` Assertions about X whose `valueString` names the field. They are returned as uids for the trace.
  - "Measured absent" adds the packet's own "current" rule (`recordedTo IS NULL`), which the packet block left out.
  - A single `emptyAnswerKind` column applies the packet's classification in a fixed order: `ANSWERED`, `MEASURED_ABSENT`, `NOT_REPORTED`, `BLOCKED`, `SEARCHED_NOTHING_FOUND`, `UNKNOWN`.
  - "Out of scope" is unchanged: the client checks the predicate against `final/vocabularies/predicates.yaml` before the query runs.
- **How the question is answered now:** in full. Nothing is lost: an empty search is the RESEARCH Activity with no answer, and a capture that returned nothing is a COMPLETE snapshot with a FIELD_NOT_REPORTED Assertion, not an attempt record.

```cypher
// @id CQ-AX-04
// @param label:string
// @param absencePredicates:strings
MATCH (x:$($label) {uid: $uid})
WITH x,
  EXISTS { (x)<-[:HAS_SUBJECT]-(a:Assertion) WHERE a.predicate = $predicate AND a.recordedTo IS NULL } AS hasAnswer,
  EXISTS { (x)<-[:HAS_SUBJECT]-(a:Assertion) WHERE a.predicate IN $absencePredicates AND a.polarity = 'POSITIVE' AND a.recordedTo IS NULL } AS measuredAbsent,
  COLLECT { MATCH (x)<-[:HAS_SUBJECT]-(f:Assertion {predicate: 'FIELD_NOT_REPORTED'})
            WHERE f.valueString = $field AND f.recordedTo IS NULL RETURN f.uid } AS notReportedBy,
  COLLECT { MATCH (x)<-[:ASSESSES]-(act:Activity {activityKind: 'RESEARCH'}) RETURN act.uid } AS searchedBy,
  // R-09 / R-41: a CaptureAttempt (PARTIAL or FAILED) only ever means "blocked"; D11 property join on subjectUid
  COLLECT { MATCH (ca:CaptureAttempt {subjectUid: x.uid}) WHERE ca.outcome IN ['FAILED', 'PARTIAL']
            RETURN ca {.uid, .toolId, .outcome, .failureKind, .httpStatus, .attemptedAt} } AS blockedAttempts
RETURN x.uid AS subject, hasAnswer, measuredAbsent, notReportedBy, searchedBy, blockedAttempts,
       CASE WHEN hasAnswer THEN 'ANSWERED'
            WHEN measuredAbsent THEN 'MEASURED_ABSENT'
            WHEN size(notReportedBy) > 0 THEN 'NOT_REPORTED'
            WHEN size(blockedAttempts) > 0 THEN 'BLOCKED'
            WHEN size(searchedBy) > 0 THEN 'SEARCHED_NOTHING_FOUND'
            ELSE 'UNKNOWN' END AS emptyAnswerKind
```

- EXPLAIN: ok on Neo4j 5.26.31 community (1/1 statement); plan contains AllNodesScan; final-SDL static check clean (labels, types, pairs, properties, enum values, predicates)
- as-of: the packet's predicate on the assertions; `ca.attemptedAt <= $R` for the attempts.
- trace: the FIELD_NOT_REPORTED Assertion cites the section read (or WHOLE_SNAPSHOT); "searched" cites the Activity; "blocked" cites the attempt (`requestDigest`, `responseHash`, `httpStatus`; no snapshot when the response was hashed and not kept).
- fixture: `final/fixtures/D11/capture-failures-coverage` (attempts ca-01..03, 403), `final/fixtures/D11/nr-trial-jats-unstructured` (FIELD_NOT_REPORTED on the COMPLETE PubMed snapshot, read as NOT_REPORTED).
- bitemporal episode needed on: none.
