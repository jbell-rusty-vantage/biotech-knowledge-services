# D13 — retrieval patterns

Model stage (Wave 2), A7, 2026-10-08. One section per question in `02-questions.md`. Written against the kernel pattern published by A1 (`packets/K/09-reasoning.md`, `04-schema-proposal.graphql`) and this module's SDL (`04-schema-proposal.graphql`). Seam types (D3 `Study`, D7 `Organization` / `Person`, D9 `Chunk`) use the names their owners have announced; where an owner has not published a name yet the pattern says so.

Adversarial-review pass (A7, 2026-10-08): patterns rebased on the owners' published SDLs — D3 `Study -HAS_ARM-> StudyArm -HAS_COMPONENT-> InterventionComponent -ADMINISTERS-> x` and `Study -HAS_STUDY_ROLE {roleKind}-> Organization`; D9 `Chunk -CHUNK_OF-> SourceSnapshot` and `Chunk -COVERS_LOCATOR-> SourceLocator` (no DocumentTextVersion node); D8 `RegulatoryRecord -ISSUED_BY / ADDRESSED_TO-> Organization` reached through the now-typed `DOCUMENTED_BY_RECORD`; D9 `Channel` (EVENT_SERIES) for conferences; D2 `Condition` for adverse-effect concepts. Q-D13-23 is computed at query time; Q-D13-22 states its independence rule; Q-D13-33 (comparison) added.

## Conventions used in every pattern

- **Kernel path names.** `(a:Assertion)-[:HAS_SUBJECT]->(x)`, `(a)-[:HAS_OBJECT]->(y)`, `(a)-[:ASSERTED_BY]->(who)`, `(a)-[:HAS_EVIDENCE {role, origin}]->(l:SourceLocator)`, `(s:SourceSnapshot)-[:HAS_LOCATOR]->(l)`, `(src:Source)-[:HAS_SNAPSHOT]->(s)`, `(adj:Adjudication)-[:ASSESSES]->(a)`, `(x)-[:WAS_GENERATED_BY]->(act:Activity)`, `(as:Assessment)-[:ASSESSES]->(x)` (x a Subjectable; for a claim occurrence the Assessment ASSESSES its Claim, `(occ)-[:OCCURRENCE_OF]->(:Claim)`, and is DERIVED_FROM the occurrence; never ASSESSES an Assertion), `(r:Report)-[:ASSESSES]->(x)`.
- **LIVE(r, $asOf)** is shorthand for the recorded-time test on an asserted edge episode or an Assertion: `r.recordedFrom <= $asOf AND (r.recordedTo IS NULL OR r.recordedTo > $asOf)` (on an Assertion the start field is `recordedAt`). With `$asOf = datetime()` it selects the current belief. Every D13 edge is asserted and carries a recorded-time-only episode (kernel `AssertedRecordedProperties`, or its superset `EventRoleEdgeProperties` for INVOLVES; check stage 2026-10-08); valid time lives on the Event clocks and the authorizing Assertions (09-reasoning.md, bitemporal table).
- **T(event) — the standard trace.** Every answer row that shows an event cites, at minimum, the Assertion that licenses each clock it prints and every link it prints:

  ```cypher
  // T(e): clocks → assertions → located spans → captured bytes
  MATCH (a:Assertion)-[:HAS_SUBJECT]->(e)
  WHERE a.uid IN [e.timeAssertionUid, e.announcementAssertionUid, e.effectiveAssertionUid, e.scheduleAssertionUid]
  MATCH (a)-[ev:HAS_EVIDENCE {role: 'SUPPORTS'}]->(l:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
  OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
  RETURN a.uid, a.predicate, who.name, l.exact, l.selectorJson, s.contentHash, s.publishedAt, src.canonicalUri
  // T(link): the same from r.assertionUid of a LEADS_TO / RESPONDS_TO / INVOLVES / ON_FRONTIER episode, plus the SUPPORT adjudication:
  // MATCH (la:Assertion {uid: r.assertionUid})-[:HAS_EVIDENCE]->(l2:SourceLocator) OPTIONAL MATCH (adj:Adjudication {adjudicationKind: 'SUPPORT'})-[:ASSESSES]->(la)
  ```

  The answer cites `l.exact` + `selectorJson` + `s.contentHash`; the verifier re-selects the same `selectorJson` on the same snapshot bytes (00-DIRECTIVE 3.8).
- **Event time key.** `coalesce(e.startedAt, e.announcedAt)` orders events; PLANNED events order by `e.scheduledFrom` (or `scheduledTo` when the start is unknown) and are shown separately unless the question asks for them.
- **Admitted-status filter.** Investor-facing answers use only assertions with `status IN ['ACCEPTED']` (capture fidelity) and links whose SUPPORT adjudication verdict is `DIRECTLY_SUPPORTED` or `SUPPORTED_WITH_QUALIFICATION`; agent/researcher views may add `PROPOSED` with a flag.
- **Indexes the patterns assume** (operations file, executor-owned): range `:Event(eventKind, startedAt)`, `:Event(announcedAt)`, `:Event(scheduledTo)`, `:Event(identityKey)`; unique `:Frontier(key)`, range `:Frontier(parentKey)`; fulltext `FrontierSearch` on `:Frontier(name, definition)` plus the `synonyms` list projected into a text property by the executor (`synonymsText`, not an API field) — or the list itself on Neo4j versions that index string lists; relationship-property indexes on `assertionUid`, `recordedFrom` (kernel request P13); `:Assertion(predicate)`.
- **No GDS pattern is admitted.** No D13 question needs centrality, community detection or path finding beyond Cypher variable-length paths (09-reasoning.md, "Alternatives"). Vector search appears once (the 3.8 path, Q-D13-05) over D9's chunk index.

## Q-D13-01

- kind: cypher
- question: what happened on frontier F in the last N days, in order, with stated LEADS_TO / RESPONDS_TO links (temporal order shown separately).
- pattern:

```cypher
MATCH (f:Frontier) WHERE f.key = $frontierKey OR f.parentKey = $frontierKey
MATCH (e:Event)-[of:ON_FRONTIER]->(f)
WHERE of.recordedFrom <= $asOf AND (of.recordedTo IS NULL OR of.recordedTo > $asOf)
  AND e.eventStatus IN ['OCCURRED', 'IN_PROGRESS']
  AND coalesce(e.startedAt, e.announcedAt) >= $asOf - duration({days: $days})
  AND coalesce(e.startedAt, e.announcedAt) <= $asOf
OPTIONAL MATCH (e)-[lt:LEADS_TO]->(next:Event)
  WHERE lt.recordedFrom <= $asOf AND (lt.recordedTo IS NULL OR lt.recordedTo > $asOf)
OPTIONAL MATCH (e)-[rt:RESPONDS_TO]->(stim:Event)
  WHERE rt.recordedFrom <= $asOf AND (rt.recordedTo IS NULL OR rt.recordedTo > $asOf)
OPTIONAL MATCH (e)-[inv:INVOLVES]->(p)
  WHERE inv.recordedTo IS NULL OR inv.recordedTo > $asOf
WITH e, f, of,
     collect(DISTINCT {who: p.name, role: inv.role}) AS who,
     collect(DISTINCT {leadsTo: next.uid, kind: next.eventKind, assertion: lt.assertionUid}) AS leadsTo,
     collect(DISTINCT {respondsTo: stim.uid, kind: stim.eventKind, assertion: rt.assertionUid}) AS respondsTo
RETURN f.key, e.uid, e.eventKind, e.name, e.startedAt, e.startedAtPrecision, e.announcedAt, e.effectiveFrom,
       e.jurisdiction, who, leadsTo, respondsTo, of.assertionUid AS classification
ORDER BY coalesce(e.startedAt, e.announcedAt)
```

  The service layer adds a separate "temporal neighbours" column per row = FOLLOWS computed by the same ORDER BY within the frontier (never merged with `leadsTo`).
- trace: T(e) for each row's clocks; T(link) for every `leadsTo` / `respondsTo` / `classification` assertion uid.
- bitemporal episode needed on: none beyond recorded time; ON_FRONTIER, LEADS_TO, RESPONDS_TO and INVOLVES episodes are filtered by recordedFrom/recordedTo only. Valid time comes from the Event clocks (materialized from bitemporal Assertions).

## Q-D13-02

- kind: cypher (optionally a materialized projection `frontier-ladder/v1` if latency requires; not admitted now)
- question: furthest milestone rung on F as of T and the first event of each milestone kind.
- pattern:

```cypher
MATCH (f:Frontier {key: $frontierKey})
CALL (f) {
  MATCH (e:Event)-[of:ON_FRONTIER]->(f)
  WHERE of.recordedFrom <= $asOf AND (of.recordedTo IS NULL OR of.recordedTo > $asOf)
    AND e.eventStatus = 'OCCURRED' AND coalesce(e.startedAt, e.announcedAt) <= $asOf
  RETURN e
  UNION
  // studies on F contribute TRIAL_START events about them (first-in-human): Study -ON_FRONTIER-> F, Event -EVENT_ABOUT-> Study
  MATCH (st:Study)-[sof:ON_FRONTIER]->(f)
  WHERE sof.recordedTo IS NULL OR sof.recordedTo > $asOf
  MATCH (ab:Assertion {predicate: 'EVENT_ABOUT'})-[:HAS_OBJECT]->(st), (ab)-[:HAS_SUBJECT]->(e:Event {eventKind: 'TRIAL_START'})
  WHERE ab.recordedAt <= $asOf AND (ab.recordedTo IS NULL OR ab.recordedTo > $asOf)
    AND e.eventStatus = 'OCCURRED' AND coalesce(e.startedAt, e.announcedAt) <= $asOf
  RETURN e
}
WITH e ORDER BY coalesce(e.startedAt, e.announcedAt)
WITH e.eventKind AS kind, e.readoutStage AS stage, e.primaryEndpointStatement AS endpoint,
     e.approvalPathway AS pathway, e.designationType AS designation, e.jurisdiction AS jurisdiction,
     collect(e)[0] AS first
RETURN kind, stage, endpoint, pathway, designation, jurisdiction,
       first.uid, first.name, first.startedAt, first.startedAtPrecision
```

  The service maps (kind + qualifiers) → `milestoneKinds[].ladderRank` from `vocab-frontiers.yaml` section 4 and returns the highest rank reached plus the first event per rung. Firstness is computed (no earlier event of the same rung as of T); it is never stored.
- trace: T(e) for each `first` event; the ON_FRONTIER classification assertion (asserter = curation agent, qualifier `frontierVocabVersion`) is cited so a reader sees why the event counts for F.
- bitemporal episode needed on: none (recorded-time filter on ON_FRONTIER and on the EVENT_ABOUT Assertion).

## Q-D13-03

- kind: cypher
- question: organizations, compounds and studies active on F, each with its latest milestone.
- pattern:

```cypher
MATCH (f:Frontier {key: $frontierKey})<-[of:ON_FRONTIER]-(e:Event)-[inv:INVOLVES]->(o:Organization)
WHERE of.recordedTo IS NULL AND inv.recordedTo IS NULL
  AND inv.role IN ['SPONSOR', 'APPLICANT', 'ISSUER', 'BORROWER', 'ACQUIRER', 'PARTNER', 'INVESTOR', 'LEAD_INVESTOR']
  AND e.eventStatus = 'OCCURRED'
WITH f, o, e, inv ORDER BY coalesce(e.startedAt, e.announcedAt) DESC
WITH f, o, collect({event: e, role: inv.role})[0] AS latest, count(e) AS nEvents
WITH f, o, latest.event AS le, latest.role AS leRole, nEvents
// compounds and other subjects of the latest event (kernel subject/object pattern)
OPTIONAL MATCH (le)<-[:HAS_SUBJECT]-(ab:Assertion {predicate: 'EVENT_ABOUT'})-[:HAS_OBJECT]->(subj)
WHERE ab.recordedTo IS NULL
WITH f, o, le, leRole, nEvents, collect(DISTINCT {uid: subj.uid, name: subj.name, labels: labels(subj)}) AS subjects
// studies THIS organization sponsors on F: D3 HAS_STUDY_ROLE (StudyRoleEdgeProperties.roleKind), correlated with o
OPTIONAL MATCH (f)<-[sof:ON_FRONTIER]-(st:Study)-[sr:HAS_STUDY_ROLE]->(o)
WHERE sof.recordedTo IS NULL AND sr.recordedTo IS NULL AND sr.roleKind IN ['LEAD_SPONSOR', 'SPONSOR']
RETURN o.name, leRole, le.eventKind, le.name, le.startedAt, nEvents, subjects,
       collect(DISTINCT st.uid) AS studiesSponsoredOnFrontier
ORDER BY le.startedAt DESC
```

  Organizations active on F only through studies (no event yet) come from a second branch unioned in the service: `MATCH (f)<-[:ON_FRONTIER]-(st:Study)-[sr:HAS_STUDY_ROLE]->(o:Organization) WHERE sr.roleKind IN ['LEAD_SPONSOR', 'SPONSOR']` (adversarial-review pass: the earlier study list was not correlated with the organization row; D3 publishes HAS_STUDY_ROLE).
- trace: T(e) for `latest.event`; T(link) for the INVOLVES assertion (who said the organization was the sponsor/investor) and the ON_FRONTIER assertion.
- bitemporal episode needed on: none (recorded time only).

## Q-D13-04

- kind: cypher (criteria BC-DESIGNATION, BC-FIRST-IN-HUMAN, BC-FIRST-APPROVAL, BC-FIRST-POSITIVE-PIVOTAL) + kernel Assessment read (BC-ANALYST)
- question: which events on F are breakthroughs by a stated definition rather than press language.
- pattern:

```cypher
// (a) BC-DESIGNATION: by the regulator's own designation
MATCH (e:Event {eventKind: 'REGULATORY_DESIGNATION'})-[of:ON_FRONTIER]->(:Frontier {key: $frontierKey})
WHERE of.recordedTo IS NULL AND e.designationType IN ['BREAKTHROUGH_THERAPY', 'RMAT', 'PRIME', 'SAKIGAKE']
RETURN 'BC-DESIGNATION' AS criterion, e.uid, e.name, e.startedAt, e.jurisdiction
UNION
// (b) BC-FIRST-*: firstness (Q-D13-02) restricted to the criterion kinds; "registrational" for the pivotal readout is
//     checked in the service against the D3 Study phase of the readout's EVENT_ABOUT study (or the sponsor's statement)
MATCH (f:Frontier {key: $frontierKey})<-[of:ON_FRONTIER]-(e:Event)
WHERE of.recordedTo IS NULL AND e.eventStatus = 'OCCURRED'
  AND (e.eventKind = 'TRIAL_START'
       OR (e.eventKind = 'APPROVAL' AND (e.approvalPathway IS NULL OR e.approvalPathway <> 'CLEARANCE_510K'))
       OR (e.eventKind = 'READOUT' AND e.readoutStage IN ['TOPLINE', 'PRIMARY'] AND e.primaryEndpointStatement = 'MET'))
WITH e ORDER BY coalesce(e.startedAt, e.announcedAt)
WITH CASE e.eventKind WHEN 'TRIAL_START' THEN 'BC-FIRST-IN-HUMAN' WHEN 'APPROVAL' THEN 'BC-FIRST-APPROVAL'
          ELSE 'BC-FIRST-POSITIVE-PIVOTAL' END AS criterion,
     CASE e.eventKind WHEN 'APPROVAL' THEN e.jurisdiction ELSE null END AS scope,   // first approval is per jurisdiction
     collect(e)[0] AS e
RETURN criterion, e.uid, e.name, e.startedAt, e.jurisdiction
UNION
// (c) BC-ANALYST: an analyst judgment, never a property
MATCH (as:Assessment)-[:ASSESSES]->(e:Event)-[:ON_FRONTIER]->(:Frontier {key: $frontierKey})
WHERE as.assessmentKind = 'BREAKTHROUGH_JUDGMENT' AND as.conclusionCode = 'MEETS_CRITERION'
  AND as.status = 'ACCEPTED' AND as.recordedTo IS NULL
RETURN 'BC-ANALYST' AS criterion, e.uid, e.name, e.startedAt, e.jurisdiction
```

  Press language ("breakthrough", "first-ever", "historic") is listed in a separate column from claim occurrences (Q-D13-17), never merged into the criterion rows.
- trace: T(e) per row; for BC-DESIGNATION also the FIELD assertion carrying `designationType` (sponsor release for the grant date; the FDA BT approvals list row as later corroboration, FC4); for BC-ANALYST the Assessment's `evidence` (HAS_EVIDENCE → SourceLocator) and `methodVersion`.
- bitemporal episode needed on: none.

## Q-D13-05

- kind: cypher (chain) + vector (00-DIRECTIVE 3.8 entry path)
- question: timeline from first pivotal readout to approval to launch for compound X, with step durations.
- pattern (graph):

```cypher
MATCH (x {uid: $compoundUid})<-[:HAS_OBJECT]-(ab:Assertion {predicate: 'EVENT_ABOUT'})-[:HAS_SUBJECT]->(start:Event {eventKind: 'READOUT'})
WHERE ab.recordedTo IS NULL
MATCH p = (start)-[:LEADS_TO*1..6]->(end:Event)
WHERE end.eventKind IN ['APPROVAL', 'LAUNCH']
  AND all(r IN relationships(p) WHERE r.recordedTo IS NULL)
WITH p, start, end ORDER BY length(p) DESC, start.startedAt LIMIT 3
RETURN [n IN nodes(p) | {uid: n.uid, kind: n.eventKind, status: n.eventStatus,
                          at: coalesce(n.startedAt, n.announcedAt, n.scheduledFrom), precision: n.startedAtPrecision}] AS chain,
       [i IN range(0, length(p) - 1) |
          duration.inDays(coalesce(nodes(p)[i].startedAt, nodes(p)[i].announcedAt),
                          coalesce(nodes(p)[i+1].startedAt, nodes(p)[i+1].announcedAt)).days] AS stepDays,
       [r IN relationships(p) | r.assertionUid] AS linkEvidence
```

  When a step has no stated LEADS_TO (common: fixture madrigal-pdufa-to-accelerated-approval has stated readout → submission and readout → approval links, but no sentence linking submission → acceptance → approval → launch), the service fills the gap with the computed FOLLOWS neighbour among events about the same compound and labels it "temporal only".
- pattern (unstructured entry, 3.8; FC1): the user's phrase ("resmetirom topline results") retrieves chunks from D9's vector index, then walks to the assertions whose locator falls inside the chunk's span on the same snapshot:

```cypher
// Neo4j 5.26 (Cypher 5) vector call; D9's vector index chunk_embedding on the executor-owned Chunk embedding
CALL db.index.vector.queryNodes('chunk_embedding', 8, $queryEmbedding) YIELD node AS c, score
// D9's published names (adversarial-review pass): Chunk -COVERS_LOCATOR-> SourceLocator is D9's derived span-overlap/v1
// projection (locators whose offsets lie inside the chunk on the same snapshot and text version); CHUNK_OF names the snapshot
// (Chunk carries no recorded-time episode in D9's SDL; only the Assertion is filtered to the current belief)
MATCH (c:Chunk)-[:COVERS_LOCATOR]->(l:SourceLocator)<-[:HAS_EVIDENCE {role: 'SUPPORTS'}]-(a:Assertion)-[:HAS_SUBJECT]->(e:Event)
WHERE a.recordedTo IS NULL
MATCH (s:SourceSnapshot)-[:HAS_LOCATOR]->(l)
RETURN e.uid, e.eventKind, a.uid, a.predicate, l.exact, l.selectorJson, s.uid, s.contentHash, s.contentHashBasis, score
ORDER BY score DESC
```

  Without the derived COVERS_LOCATOR projection the same walk is `(c)-[:CHUNK_OF]->(s:SourceSnapshot)-[:HAS_LOCATOR]->(l) WHERE l.startOffset >= c.startOffset AND l.endOffset <= c.endOffset`, valid only when the chunk's `textVersionHash` equals the snapshot's canonical projection (for EDGAR HTML the h2t-v1 hash, which is also the snapshot identity), so both offsets count the same code points. Chunk `MENTIONS` (derived, D9) may be used instead of the vector index to find chunks that mention resmetirom; neither is evidence — the answer cites the Assertion's locator. Fixture walk: madrigal-maestro-nash-topline-8k `path38` (chunk c02 → l03–l06 → ten assertions).
- trace: T(e) for every chain node; T(link) for every `linkEvidence` uid (with its SUPPORT adjudication); the 3.8 entry returns the locator and snapshot digest that the verifier re-selects.
- bitemporal episode needed on: none (recorded time on LEADS_TO); step durations use the Events' valid-time clocks.

## Q-D13-06

- kind: cypher
- question: financings, partnerships, acquisitions after a readout or approval on F within N days; stated basis separate from temporal pairs.
- pattern:

```cypher
MATCH (f:Frontier {key: $frontierKey})<-[:ON_FRONTIER]-(r:Event)
WHERE r.eventKind IN ['READOUT', 'APPROVAL'] AND r.eventStatus = 'OCCURRED'
MATCH (r)-[:INVOLVES {role: 'SPONSOR'}]->(o:Organization)<-[:INVOLVES]-(d:Event)
WHERE d.eventKind IN ['FINANCING', 'PARTNERSHIP', 'ACQUISITION']
  AND coalesce(d.startedAt, d.announcedAt) >= coalesce(r.startedAt, r.announcedAt)
  AND coalesce(d.startedAt, d.announcedAt) <= coalesce(r.startedAt, r.announcedAt) + duration({days: $days})
OPTIONAL MATCH (r)-[lt:LEADS_TO]->(d) WHERE lt.recordedTo IS NULL
OPTIONAL MATCH (d)-[dinv:INVOLVES]->(cp) WHERE dinv.role IN ['INVESTOR', 'LEAD_INVESTOR', 'LENDER', 'UNDERWRITER', 'ACQUIRER', 'PARTNER']
OPTIONAL MATCH (amt:Assertion {predicate: 'FINANCING_AMOUNT'})-[:HAS_SUBJECT]->(d) WHERE amt.recordedTo IS NULL
RETURN r.uid, r.eventKind, r.startedAt, d.uid, d.eventKind, d.startedAt,
       CASE WHEN lt IS NOT NULL THEN 'stated (LEADS_TO)'
            WHEN d.startedAt = r.startedAt THEN 'temporal, same day (FOLLOWS, computed; order within the day not stated)'
            ELSE 'temporal (FOLLOWS, computed)' END AS linkKind,
       lt.assertionUid, collect(DISTINCT {who: cp.name, role: dinv.role}) AS counterparties,
       collect(DISTINCT {value: amt.valueNumber, unit: amt.unitCode, assertion: amt.uid,
                         amountKind: head([q IN amt.qualifiers WHERE q STARTS WITH 'amountKind=']),
                         amountBasis: head([q IN amt.qualifiers WHERE q STARTS WITH 'amountBasis='])}) AS amounts
ORDER BY r.startedAt, d.startedAt
```

- trace: T(link) on `lt.assertionUid` (FC2 quote 1 "as a result of the Company’s announcement …"); amounts cite their own assertions and keep their amount kind; temporal rows cite T(e) of both events only (fixture: the ATM sales of the readout day and the registered direct two days later are temporal; the CEO's "following" sentence is CONTEXT_ONLY for both).
- bitemporal episode needed on: none.

## Q-D13-07

- kind: cypher (kernel claims and assessments; D13 supplies the split time)
- question: claims about F or its subjects before vs after event E; which were contradicted.
- pattern:

```cypher
MATCH (e:Event {uid: $eventUid})
OPTIONAL MATCH (e)-[:ON_FRONTIER]->(f:Frontier)
OPTIONAL MATCH (e)<-[:HAS_SUBJECT]-(ab:Assertion {predicate: 'EVENT_ABOUT'})-[:HAS_OBJECT]->(subj)
WITH e, collect(DISTINCT f) + collect(DISTINCT subj) AS about
UNWIND about AS t
MATCH (occ:Assertion {assertionKind: 'CLAIM'})-[:HAS_SUBJECT|HAS_OBJECT]->(t)
MATCH (occ)-[:OCCURRENCE_OF]->(cl:Claim)
MATCH (occ)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)
WITH e, cl, occ, s, CASE WHEN coalesce(s.publishedAt, s.retrievedAt) < e.announcedAt THEN 'before' ELSE 'after' END AS side
OPTIONAL MATCH (adj:Adjudication {adjudicationKind: 'SUPPORT'})-[:ASSESSES]->(occ)
OPTIONAL MATCH (adj)-[hv:HAS_EVIDENCE]->(el:SourceLocator)<-[:HAS_EVIDENCE]-(ta:Assertion)-[:HAS_SUBJECT]->(e)
OPTIONAL MATCH (as:Assessment)-[:ASSESSES]->(cl) WHERE as.recordedTo IS NULL
RETURN side, cl.proposition, occ.uid, s.publishedAt,
       collect(DISTINCT {verdict: adj.verdict, role: hv.role, citesEventSpan: el.exact}) AS adjudications,
       collect(DISTINCT {kind: as.assessmentKind, verdict: as.verdict}) AS assessments
ORDER BY side, s.publishedAt
```

  "Contradicted by E" = an adjudication or assessment whose `HAS_EVIDENCE {role: 'CONTRADICTS'}` points at a locator that also supports one of E's assertions; "not addressed" = no such row. No event → claim edge exists (00-DIRECTIVE 3.8).
- trace: the claim occurrence's locator; the adjudication's contradicting locator (which is one of E's own spans); T(e).
- bitemporal episode needed on: none (claim occurrences and adjudications are immutable records with recordedAt).

## Q-D13-08

- kind: cypher
- question: what went wrong on F (harm channel) and what each led to.
- pattern:

```cypher
MATCH (e:Event)-[of:ON_FRONTIER]->(f:Frontier)
WHERE (f.key = $frontierKey OR f.parentKey = $frontierKey) AND of.recordedTo IS NULL
  AND (e.eventKind IN ['SAFETY_SIGNAL', 'CLINICAL_HOLD', 'REJECTION', 'PROGRAM_DISCONTINUATION', 'RETRACTION',
                       'ENFORCEMENT_ACTION', 'RECALL', 'MARKET_WITHDRAWAL']
       OR (e.eventKind = 'READOUT' AND e.primaryEndpointStatement IN ['NOT_MET', 'MIXED']))
OPTIONAL MATCH (resp:Event)-[rt:RESPONDS_TO]->(e) WHERE rt.recordedTo IS NULL
OPTIONAL MATCH (e)-[lt:LEADS_TO]->(next:Event) WHERE lt.recordedTo IS NULL
OPTIONAL MATCH (e)-[:INVOLVES {role: 'SPONSOR'}]->(o:Organization)
RETURN e.uid, e.eventKind, e.name, e.startedAt, o.name AS sponsor,
       collect(DISTINCT {response: resp.uid, kind: resp.eventKind, at: resp.startedAt, assertion: rt.assertionUid}) AS responses,
       collect(DISTINCT {next: next.uid, kind: next.eventKind, assertion: lt.assertionUid}) AS ledTo
ORDER BY e.startedAt DESC
```

  The "stated reason" column is the EVENT_OCCURRED locator's exact quote (FC6 quote 1) or ClinicalTrials.gov `whyStopped` (a second asserter); BellLabs never writes a reason of its own.
- trace: T(e); T(link) for each response and next link.
- bitemporal episode needed on: none.

## Q-D13-09

- kind: cypher
- question: which frontiers does target T depend on, and what happened on them recently.
- pattern:

```cypher
MATCH (f:Frontier) WHERE $targetKey IN f.targetKeys AND f.curationStatus <> 'DEPRECATED'
CALL (f) {
  MATCH (e:Event)-[of:ON_FRONTIER]->(f)
  WHERE of.recordedTo IS NULL AND e.eventStatus = 'OCCURRED'
  RETURN e ORDER BY coalesce(e.startedAt, e.announcedAt) DESC LIMIT 5
}
RETURN f.key, f.name, f.level, collect({uid: e.uid, kind: e.eventKind, at: coalesce(e.startedAt, e.announcedAt)}) AS recent
```

- trace: the targetKeys mapping cites `vocab-frontiers.yaml@<version>` (curation, not an effect claim); events cite T(e).
- bitemporal episode needed on: none.

## Q-D13-10

- kind: cypher
- question: scheduled milestones on F or for organization X; who announced each and when.
- pattern:

```cypher
MATCH (e:Event {eventStatus: 'PLANNED'})
WHERE ($frontierKey IS NULL OR EXISTS { (e)-[of:ON_FRONTIER]->(:Frontier {key: $frontierKey}) WHERE of.recordedTo IS NULL })
  AND ($orgUid IS NULL OR EXISTS { (e)-[:INVOLVES]->(:Organization {uid: $orgUid}) })
MATCH (sa:Assertion {uid: e.scheduleAssertionUid})-[:HAS_EVIDENCE]->(l:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)
OPTIONAL MATCH (sa)-[:ASSERTED_BY]->(who)
RETURN e.uid, e.eventKind, e.name, e.scheduledFrom, e.scheduledFromPrecision, e.scheduledTo, e.scheduledToPrecision,
       who.name AS announcedBy, s.publishedAt AS statedOn, l.exact,
       CASE WHEN e.scheduledTo IS NOT NULL AND e.scheduledTo <= $asOf THEN 'window passed, no occurrence recorded' ELSE 'open' END AS state
ORDER BY coalesce(e.scheduledFrom, e.scheduledTo)
```

  A PDUFA goal date D is the window [D, D+1 day) with DAY precision (FC3 quote 1); "first half of 2023" is [2023-01-01, 2023-07-01) with MONTH precision on both bounds (FC1 quote 3). No HALF_YEAR precision is needed.
- trace: the EVENT_SCHEDULED assertion's locator and the snapshot's publishedAt (statement time).
- bitemporal episode needed on: none on edges; the schedule history is the recorded time of the EVENT_SCHEDULED Assertions (Q-D13-11).

## Q-D13-11

- kind: cypher (over Assertions, not over the Event's materialized properties)
- question: guided milestones that slipped, were missed or silently dropped.
- pattern:

```cypher
MATCH (e:Event)<-[:HAS_SUBJECT]-(sa:Assertion {predicate: 'EVENT_SCHEDULED'})
WHERE ($orgUid IS NULL OR EXISTS { (e)-[:INVOLVES]->(:Organization {uid: $orgUid}) })
MATCH (sa)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)
WITH e, sa, coalesce(s.publishedAt, s.retrievedAt) AS statedOn ORDER BY statedOn
WITH e, collect({uid: sa.uid, from: sa.validFrom, to: sa.validTo, statedOn: statedOn, recordedTo: sa.recordedTo}) AS windows
OPTIONAL MATCH (e)<-[:HAS_SUBJECT]-(oa:Assertion {predicate: 'EVENT_OCCURRED'}) WHERE oa.recordedTo IS NULL AND oa.status = 'ACCEPTED'
OPTIONAL MATCH (e)<-[:HAS_SUBJECT]-(ca:Assertion {predicate: 'EVENT_CANCELLED'}) WHERE ca.recordedTo IS NULL
WITH e, windows, windows[0] AS first, windows[-1] AS latest, oa, ca
RETURN e.uid, e.eventKind, e.name, first, latest, oa.validFrom AS occurredAt,
       CASE
         WHEN ca IS NOT NULL THEN 'cancelled'
         WHEN oa IS NOT NULL AND first.to IS NOT NULL AND oa.validFrom >= first.to THEN 'occurred late'
         WHEN oa IS NOT NULL THEN 'occurred in first window'
         WHEN latest.to IS NOT NULL AND latest.to <= $asOf THEN 'missed (window passed, no occurrence)'
         WHEN first.to IS NOT NULL AND latest.from IS NOT NULL AND latest.from >= first.to THEN 're-guided later'
         WHEN first.to IS NOT NULL AND first.to <= $asOf AND size(windows) = 1 THEN 'silently dropped?'
         ELSE 'on track' END AS slipStatus,
       size(windows) AS restatements
```

  "Silently dropped" is a flag for review, not a verdict: absence claims need COMPLETE captures of later sponsor statements (kernel `captureCompleteness`).
- trace: every window cites its EVENT_SCHEDULED assertion and locator (FC10 Loyal guidance vs later status; FC1 → FC3 "first half of 2023" → filed and accepted 2023-09-13).
- bitemporal episode needed on: none on edges; this question is the reason EVENT_SCHEDULED stays an Assertion (each restatement a new record, the old one closed by recordedTo or kept parallel when two asserters differ) rather than an Event property overwritten in place.

## Q-D13-12

- kind: cypher
- question: accelerated or conditional approvals on F and the status of their confirmatory obligations.
- pattern:

```cypher
MATCH (e:Event {eventKind: 'APPROVAL'})-[of:ON_FRONTIER]->(:Frontier {key: $frontierKey})
WHERE of.recordedTo IS NULL AND e.approvalPathway IN ['ACCELERATED', 'CONDITIONAL']
OPTIONAL MATCH (e)<-[:HAS_SUBJECT]-(c:Assertion {predicate: 'CONTINGENT_ON'})
  WHERE c.recordedTo IS NULL
OPTIONAL MATCH (c)-[:HAS_OBJECT]->(st:Study)
OPTIONAL MATCH (c)-[:HAS_EVIDENCE]->(cl:SourceLocator)
// the D8 record of the act (typed DOCUMENTED_BY_RECORD since the adversarial-review pass); regulator and holder are the record's
OPTIONAL MATCH (e)-[dr:DOCUMENTED_BY_RECORD]->(rec:RegulatoryRecord) WHERE dr.recordedTo IS NULL
OPTIONAL MATCH (rec)-[:ISSUED_BY]->(regulator:Organization)
OPTIONAL MATCH (rec)-[:ADDRESSED_TO]->(holder:Organization)
RETURN e.uid, e.name, e.startedAt, e.jurisdiction, e.approvalPathway, cl.exact AS contingency,
       collect(DISTINCT {study: st.uid, status: st.overallStatus}) AS confirmatory,   // D3 Study.overallStatus (projection cache)
       collect(DISTINCT {record: rec.uid, kind: rec.recordKind, number: rec.recordNumber, issuedAt: rec.issuedAt,
                         issuedBy: regulator.name, addressedTo: holder.name, link: dr.assertionUid}) AS regulatoryRecords
```

- trace: T(e); the CONTINGENT_ON assertion's locator (FC3 quote 3: "Continued approval for this indication may be contingent upon verification and description of clinical benefit in ongoing confirmatory trials."); T(link) on `dr.assertionUid` (fixture a16, rule event-record-match/v1); the record's own ISSUED_BY / ADDRESSED_TO assertions (D8); D3 study status cites its own registry assertions.
- bitemporal episode needed on: none in D13 (D3's registry status has its own versions).

## CQ-EV-05

- kind: cypher
- question (D13 reading): which frontier events, readouts and claims cited the retracted work, and when did the record change.
- pattern:

```cypher
// the publisher revision record (kernel) and its frontier-milestone view (D13)
MATCH (src:Source)-[:HAS_SNAPSHOT]->(rs:SourceSnapshot {revisionKind: 'RETRACTION'})
WHERE src.uid = $sourceUid OR rs.revisesSnapshotUid IN $originalSnapshotUids
// kernel M6: one HAS_REVISION_STATUS Assertion per authority (publisher, Retraction Watch via Crossref, PubMed), each with its own date
OPTIONAL MATCH (rv:Assertion {predicate: 'HAS_REVISION_STATUS'})-[:HAS_SUBJECT]->(src)
OPTIONAL MATCH (rv)-[:ASSERTED_BY]->(rvBy)
OPTIONAL MATCH (rs)-[:HAS_LOCATOR]->(rl:SourceLocator)<-[:HAS_EVIDENCE]-(ra:Assertion {predicate: 'EVENT_OCCURRED'})-[:HAS_SUBJECT]->(re:Event {eventKind: 'RETRACTION'})
OPTIONAL MATCH (ra)-[:ASSERTED_BY]->(revAsserter)
// dependents: assertions (incl. event assertions and claim occurrences) whose evidence sits on the retracted snapshots
MATCH (orig:SourceSnapshot) WHERE orig.uid IN $originalSnapshotUids
MATCH (orig)-[:HAS_LOCATOR]->(:SourceLocator)<-[:HAS_EVIDENCE]-(dep:Assertion)
OPTIONAL MATCH (dep)-[:HAS_SUBJECT]->(depEvent:Event)
RETURN rs.publishedAt AS revisedOn, rs.revisionKind, re.uid AS retractionEvent, collect(DISTINCT revAsserter.name) AS revisionAsserters,
       collect(DISTINCT {status: rv.valueString, by: rvBy.name, validFrom: rv.validFrom}) AS revisionStatusByAuthority,
       collect(DISTINCT {assertion: dep.uid, predicate: dep.predicate, kind: dep.assertionKind, event: depEvent.uid,
                         recordedAt: dep.recordedAt, recordedTo: dep.recordedTo}) AS dependents
```

  Nothing is deleted: dependents keep their records; the recorded-time view before and after is the same query with `$asOf` filters (CQ-TM-01). Contradiction of earlier claims is an adjudication/assessment row (Q-D13-07), not an edge from the retraction.
- trace: the retraction notice locator (FC5 quote 1) on its snapshot; the Crossref `updated-by` fragment as a second asserter's locator (FC5 quote 3); each dependent's own locator.
- bitemporal episode needed on: none (immutable revision snapshot + assertion recorded time).

## Q-D13-14

- kind: cypher
- question: after a safety signal, hold or failed readout on F, how did sponsor, regulator and market respond, in order.
- pattern:

```cypher
MATCH (stim:Event {uid: $stimulusUid})
MATCH p = (resp:Event)-[:RESPONDS_TO*1..3]->(stim)
WHERE all(r IN relationships(p) WHERE r.recordedTo IS NULL)
WITH stim, resp, p
OPTIONAL MATCH (resp)-[inv:INVOLVES]->(actor) WHERE inv.role IN ['SPONSOR', 'REGULATOR', 'INVESTOR', 'LENDER', 'PUBLISHER']
// a regulator documented by a D8 record is read from the record, not from an INVOLVES role (adversarial-review pass)
OPTIONAL MATCH (resp)-[:DOCUMENTED_BY_RECORD]->(rec:RegulatoryRecord)-[:ISSUED_BY]->(regulator:Organization)
OPTIONAL MATCH (resp)<-[:HAS_SUBJECT]-(mm:Assertion {predicate: 'REPORTED_MARKET_MOVE'})-[:ASSERTED_BY]->(reporter)
RETURN resp.uid, resp.eventKind, resp.startedAt, length(p) AS hops,
       collect(DISTINCT {actor: actor.name, role: inv.role}) +
         collect(DISTINCT CASE WHEN regulator IS NULL THEN null ELSE {actor: regulator.name, role: 'REGULATOR', record: rec.recordNumber} END) AS actors,
       [r IN relationships(p) | r.assertionUid] AS stated,
       collect(DISTINCT {move: mm.valueString, reportedBy: reporter.name, assertion: mm.uid}) AS marketMoves
ORDER BY resp.startedAt
```

- trace: T(link) for every RESPONDS_TO hop (FC6 quote 1); market moves cite the reporting source's locator (FC6 quote 3) and are attributed to that asserter, never to BellLabs.
- bitemporal episode needed on: none.

## Q-D13-15

- kind: cypher
- question: discontinued programs on F, stated reason, and whether the sponsor survived.
- pattern:

```cypher
MATCH (d:Event {eventKind: 'PROGRAM_DISCONTINUATION'})-[of:ON_FRONTIER]->(:Frontier {key: $frontierKey})
WHERE of.recordedTo IS NULL
MATCH (d)-[:INVOLVES {role: 'SPONSOR'}]->(o:Organization)
OPTIONAL MATCH (d)-[rt:RESPONDS_TO]->(cause:Event)
OPTIONAL MATCH (later:Event {eventKind: 'PROGRAM_DISCONTINUATION', discontinuationScope: 'COMPANY'})-[:INVOLVES {role: 'SPONSOR'}]->(o)
  WHERE coalesce(later.startedAt, later.announcedAt) >= coalesce(d.startedAt, d.announcedAt)
MATCH (ta:Assertion {uid: d.timeAssertionUid})-[:HAS_EVIDENCE]->(rl:SourceLocator)
RETURN o.name, d.uid, d.discontinuationScope, d.startedAt, rl.exact AS statedReason,
       collect(DISTINCT {cause: cause.uid, kind: cause.eventKind}) AS respondsTo,
       collect(DISTINCT {wind: later.uid, at: later.startedAt, effective: later.effectiveFrom, tz: later.localTimeZone}) AS corporateOutcome
```

  Dissolution, deregistration and workforce reduction are PROGRAM_DISCONTINUATION events with `discontinuationScope: COMPANY` (FC7: certificate of dissolution "effective as of 5:00 p.m. Eastern Time on September 26, 2025" → effectiveFrom INSTANT + localTimeZone America/New_York).
- trace: T(e) for both events; the stated reason is the discontinuation's own locator.
- bitemporal episode needed on: none.

## Q-D13-16

- kind: cypher
- question: for intervention I on F, has anything reached humans in a registered trial or an approval, or is it announcement-level only?
- pattern:

```cypher
MATCH (x {uid: $interventionUid})
OPTIONAL MATCH (x)<-[:HAS_OBJECT]-(ab:Assertion {predicate: 'EVENT_ABOUT'})-[:HAS_SUBJECT]->(e:Event)
  WHERE ab.recordedTo IS NULL AND e.eventStatus = 'OCCURRED'
    AND e.eventKind IN ['TRIAL_START', 'READOUT', 'REGULATORY_ACCEPTANCE', 'APPROVAL', 'LAUNCH']
    // scope to frontier F when given: the event's live ON_FRONTIER classification (Event.frontiers)
    AND ($frontierKey IS NULL OR EXISTS {
          MATCH (e)-[of:ON_FRONTIER]->(:Frontier {key: $frontierKey}) WHERE of.recordedTo IS NULL })
WITH x, e ORDER BY coalesce(e.startedAt, e.announcedAt) DESC
WITH x, collect(e) AS events
// registered human studies testing x, on D3's published path (adversarial-review pass: the HAS_COMPONENT hop was missing,
// which made every study list empty and the absence note false): Study -HAS_ARM-> StudyArm -HAS_COMPONENT->
// InterventionComponent -ADMINISTERS-> x; scoped to F through the Study side of ON_FRONTIER (Frontier.studies, direction IN)
OPTIONAL MATCH (st:Study)-[:HAS_ARM]->(:StudyArm)-[:HAS_COMPONENT]->(:InterventionComponent)-[adm:ADMINISTERS]->(x)
  WHERE adm.recordedTo IS NULL
    AND ($frontierKey IS NULL OR EXISTS {
          MATCH (st)-[os:ON_FRONTIER]->(:Frontier {key: $frontierKey}) WHERE os.recordedTo IS NULL })
WITH x, events, collect(DISTINCT st.uid) AS registeredStudies
RETURN x.name, [ev IN events | {uid: ev.uid, kind: ev.eventKind, at: ev.startedAt, jurisdiction: ev.jurisdiction}][0..5] AS milestones,
       registeredStudies,
       CASE WHEN size(events) = 0 AND size(registeredStudies) = 0 THEN 'no human trial registered or approval recorded as of ' + toString($asOf)
            ELSE null END AS absenceNote
```

  The absence note is shown only when the D3/D13 captures for x are COMPLETE (kernel `captureCompleteness`); otherwise "unknown".
- trace: T(e) for each milestone; D3 study registry assertions for each study.
- bitemporal episode needed on: none.

## Q-D13-17

- kind: cypher (kernel claims) + kernel Assessment (`D13.press-language-check`)
- question: "first-ever / breakthrough / historic" statements that match no stated criterion.
- pattern:

```cypher
MATCH (occ:Assertion {assertionKind: 'CLAIM'})-[:HAS_SUBJECT]->(e:Event)
WHERE occ.speechAct = 'STATES'
  AND any(w IN ['breakthrough', 'first-ever', 'first ever', 'historic', 'unprecedented', 'first-in-class']
          WHERE toLower(occ.proposition) CONTAINS w)
// kernel rule: an assessment judging one occurrence ASSESSES that occurrence's Claim and is DERIVED_FROM the occurrence
OPTIONAL MATCH (occ)-[:OCCURRENCE_OF]->(:Claim)<-[:ASSESSES]-(as:Assessment)-[:DERIVED_FROM]->(occ)
  WHERE as.assessmentSubkind = 'D13.press-language-check' AND as.recordedTo IS NULL
OPTIONAL MATCH (occ)-[:ASSERTED_BY]->(who)
RETURN e.uid, e.eventKind, occ.proposition, who.name, as.verdict, as.summary
```

  The criteria check itself is Q-D13-04's computed rows; an Assessment records the comparison (matches / does not match / not checkable) with `methodVersion`. FC3 quote 5 ("This is a historic moment for the NASH field …") is the worked case.
- trace: the claim occurrence's locator; the Q-D13-04 criterion rows' traces; the Assessment's HAS_EVIDENCE.
- bitemporal episode needed on: none.

## CQ-TM-03

- kind: cypher
- question (D13 reading): for event E, when it happened, was announced, took legal effect, what the registry said, and when BellLabs recorded each.
- pattern:

```cypher
MATCH (e:Event {uid: $eventUid})<-[:HAS_SUBJECT]-(a:Assertion)
WHERE a.predicate IN ['EVENT_OCCURRED', 'EVENT_ANNOUNCED', 'EVENT_EFFECTIVE', 'EVENT_SCHEDULED', 'EVENT_CANCELLED']
MATCH (a)-[:HAS_EVIDENCE]->(l:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
RETURN a.predicate, a.validFrom, a.validFromPrecision, a.validFromBasis, a.validTo, who.name AS asserter,
       src.sourceKind, s.publishedAt AS documentTime,      // e.g. 8-K filing/acceptance time vs the event date it reports
       a.recordedAt, a.recordedTo, a.status,
       a.uid IN [e.timeAssertionUid, e.announcementAssertionUid, e.effectiveAssertionUid, e.scheduleAssertionUid] AS materialized,
       e.clockRule
ORDER BY a.predicate, a.validFrom
```

  Five clocks are kept apart: event date (EVENT_OCCURRED validFrom), document/filing time (SourceSnapshot.publishedAt of the 8-K or registry record), announcement (EVENT_ANNOUNCED), legal effect (EVENT_EFFECTIVE, may be INSTANT with `localTimeZone`), and recorded time (Assertion.recordedAt). A registry start date and a sponsor's "first participant dosed" are two EVENT_OCCURRED assertions from two asserters; `materialized` shows which one the Event displays under `clockRule`.
- trace: every row is its own trace (locator + snapshot).
- bitemporal episode needed on: none on edges; this is the question the Assertion's bitemporal fields serve.

## CQ-TM-01

- kind: cypher
- question (D13 reading): what did the frontier F timeline look like as recorded on date R?
- pattern:

```cypher
MATCH (f:Frontier {key: $frontierKey})<-[of:ON_FRONTIER]-(e:Event)
WHERE of.recordedFrom <= $R AND (of.recordedTo IS NULL OR of.recordedTo > $R) AND e.createdAt <= $R
// clocks as believed at R: re-materialize from the assertions live at R instead of reading e.startedAt
OPTIONAL MATCH (e)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'EVENT_OCCURRED'})
WHERE a.recordedAt <= $R AND (a.recordedTo IS NULL OR a.recordedTo > $R) AND a.status <> 'REJECTED'
WITH f, e, of, a ORDER BY a.recordedAt DESC
WITH f, e, of, collect(a)[0] AS occurredAtR
RETURN e.uid, e.eventKind, occurredAtR.validFrom AS startedAtAsOfR, e.startedAt AS startedAtNow,
       occurredAtR.validFrom <> e.startedAt AS changedSince, of.assertionUid
ORDER BY startedAtAsOfR
```

  Rows that exist today but not at R (classified later) and rows closed since R (reclassified, recordedTo set) are returned by running the query at R and at now and diffing in the service.
- trace: the assertion live at R and the one live now, each with its locator.
- bitemporal episode needed on: ON_FRONTIER needs its recorded-time episode (recordedFrom/recordedTo) — this is the reason D13 edges keep the kernel episode fields even though valid time is unused.

## Q-D13-20

- kind: cypher (expansion; predicate-only FORECASTS)
- question: forecasts for milestone M and how they moved after event E.
- pattern:

```cypher
MATCH (m:Event {uid: $plannedEventUid})<-[:HAS_OBJECT]-(fa:Assertion {predicate: 'FORECASTS'})
MATCH (fa)-[:HAS_EVIDENCE]->(l:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (fa)-[:ASSERTED_BY]->(platform)
RETURN src.canonicalUri, platform.name, fa.valueNumber, fa.valueString, fa.qualifiers, s.retrievedAt AS capturedAt,
       CASE WHEN s.retrievedAt < $eventAnnouncedAt THEN 'before' ELSE 'after' END AS side
ORDER BY s.retrievedAt
```

  A forecast with no PLANNED Event yet (e.g. "first approval on F by 2030") uses the Frontier as the object.
- trace: the snapshot of the forecast page at capture time (FC11; values change daily, so the snapshot is the only citable state).
- bitemporal episode needed on: none.

## Q-D13-21

- kind: cypher (predicate-only REPORTED_MARKET_MOVE; D7 market data seam)
- question: events that coincided with a large share-price move for X; stated attribution vs coincidence.
- pattern:

```cypher
MATCH (o:Organization {uid: $orgUid})<-[inv:INVOLVES]-(e:Event)
OPTIONAL MATCH (e)<-[:HAS_SUBJECT]-(mm:Assertion {predicate: 'REPORTED_MARKET_MOVE'})-[:HAS_OBJECT]->(o)
OPTIONAL MATCH (mm)-[:ASSERTED_BY]->(reporter)
OPTIONAL MATCH (mm)-[:HAS_EVIDENCE]->(l:SourceLocator)
RETURN e.uid, e.eventKind, e.startedAt, inv.role,
       collect(DISTINCT {move: mm.valueString, reportedBy: reporter.name, quote: l.exact}) AS statedAttributions
ORDER BY e.startedAt
// temporal coincidence (no attribution) = D7 price series joined on date by the service, flagged 'coincidence only'
```

- trace: the reporter's locator (FC6 quote 3: "Shares in BioAge … plunged by two-thirds in post-market trading Friday."); T(e).
- bitemporal episode needed on: none.

## Q-D13-22

- kind: cypher
- question: events resting on a single non-primary source or only a press release (corroboration gap).
- pattern:

```cypher
MATCH (e:Event)-[of:ON_FRONTIER]->(:Frontier {key: $frontierKey})
WHERE of.recordedTo IS NULL
MATCH (e)<-[:HAS_SUBJECT]-(a:Assertion)
WHERE a.predicate IN ['EVENT_OCCURRED', 'EVENT_ANNOUNCED'] AND a.recordedTo IS NULL
MATCH (a)-[:ASSERTED_BY]->(who)
MATCH (a)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
// independence rule: an assertion counts with its ORIGIN, not its asserter (qualifier derivedFrom=<uid>, below)
WITH e, a, who, src,
     coalesce(head([q IN a.qualifiers WHERE q STARTS WITH 'derivedFrom=' | substring(q, 12)]), who.uid) AS origin
OPTIONAL MATCH (e)-[dr:DOCUMENTED_BY_RECORD]->(:RegulatoryRecord) WHERE dr.recordedTo IS NULL
WITH e, collect(DISTINCT origin) AS origins, collect(DISTINCT who.uid) AS asserters,
     collect(DISTINCT src.sourceKind) AS sourceKinds, collect(DISTINCT src.genre) AS genres, count(dr) > 0 AS hasRecord
WITH e, origins, asserters, sourceKinds, genres,
     hasRecord OR any(g IN genres WHERE g IN ['REGULATORY_FILING', 'REGULATORY_RECORD', 'RETRACTION_NOTICE']) AS authorityRecord
RETURN e.uid, e.eventKind, e.startedAt, size(origins) AS independentOrigins, size(asserters) AS asserters,
       sourceKinds, genres, authorityRecord,
       CASE WHEN size(origins) = 1 AND NOT authorityRecord THEN 'single origin, no authority record'
            WHEN size(origins) = 1 THEN 'single origin (the authority of record)' END AS gap
ORDER BY independentOrigins, e.startedAt DESC
```

  **Independence rule (adversarial-review pass; applied to every fixture).** An Assertion counts with its origin: its asserter, unless it carries the qualifier `derivedFrom=<uid>`, written when the asserter's record was gathered or copied from another asserter's artifact — an aggregator (Retraction Watch: "The database contains retractions gathered from publisher websites", Crossref S26; PubMed RetractionIn, which points at the publisher's notice), a syndicated copy of a press release (BioSpace, Yahoo), or a re-telling by trade press. Sponsor-entered registry text (ClinicalTrials.gov `whyStopped`) is the sponsor's own statement and is asserted by the sponsor. An **authority record** is a document by the party whose act the event is, in an authority genre: an SEC filing, a regulator record (or a typed DOCUMENTED_BY_RECORD), a publisher's retraction notice. The gap flag is "single origin, no authority record"; a single origin that is itself the authority of record is shown, not flagged. Worked cases: lesne-2006-retraction (one origin, the publisher, corroborated by two derived records; not flagged) and bioage-strides-discontinuation (one origin, BioAge, press release and its own registry text, no 8-K; flagged).
- trace: the per-asserter assertions and their sources.
- bitemporal episode needed on: none.

## Q-D13-23

- kind: cypher, computed at query time (adversarial-review pass: answer kind retrieved; the D10 materialized row and its seam were dropped — D10 declares no such type, and dozens to hundreds of financings per frontier per year need no projection)
- question: disclosed capital into F by period, by financing event, amount kind and investor type.
- pattern:

```cypher
MATCH (f:Frontier {key: $frontierKey})<-[of:ON_FRONTIER]-(e:Event)
WHERE of.recordedTo IS NULL AND e.eventKind = 'FINANCING' AND e.eventStatus = 'OCCURRED'
  AND e.startedAt >= $from AND e.startedAt < $to
MATCH (e)<-[:HAS_SUBJECT]-(amt:Assertion {predicate: 'FINANCING_AMOUNT'})
WHERE amt.recordedTo IS NULL AND amt.status = 'ACCEPTED'
WITH f, e, amt,
     head([q IN amt.qualifiers WHERE q STARTS WITH 'amountKind=' | substring(q, 11)]) AS amountKind,
     head([q IN amt.qualifiers WHERE q STARTS WITH 'amountBasis=' | substring(q, 12)]) AS amountBasis
// one value per (event, kind, basis, unit): several artifacts of one financing are several assertions on ONE Event
WITH f, e, amountKind, amountBasis, amt.unitCode AS unit, max(amt.valueNumber) AS value, collect(amt.uid) AS amountAssertions,
     COLLECT { MATCH (e)-[inv:INVOLVES]->(o:Organization)
               WHERE inv.role IN ['INVESTOR', 'LEAD_INVESTOR', 'LENDER'] AND inv.recordedTo IS NULL
               RETURN o.name + ' (' + inv.role + ')' } AS counterparties
RETURN f.key, date.truncate('quarter', e.startedAt) AS period, amountKind, amountBasis, unit,
       sum(value) AS total, collect(e.uid) AS events, collect(counterparties) AS counterpartiesPerEvent,
       collect(amountAssertions) AS inputAssertions
ORDER BY period, amountKind, amountBasis
```

  Amount kinds (GROSS_PROCEEDS, NET_PROCEEDS, BORROWING_CAPACITY, …) and bases (OFFERED, SOLD, COMMITTED, AVAILABLE) are never summed together: the fixture's Madrigal filing is USD 259.1M gross equity (159.1M SOLD + 100M COMMITTED) and USD 50M borrowing capacity, two rows. AWARD events are excluded: a prize or grant amount is D7 `Award.amount`, reached from an AWARD Event through EVENT_ABOUT, and shown as a separate column when asked. A published total is a D10 Report citing `inputAssertions`.
- trace: each total cites its amount assertions → locators; disagreeing values for one (event, kind, basis) are shown side by side by the service.
- bitemporal episode needed on: none.

## Q-D13-24

- kind: cypher (kernel claims) + assessment
- question: aggregate sector statements that disagree, with counting rules and BellLabs recomputation.
- pattern:

```cypher
MATCH (occ:Assertion {assertionKind: 'CLAIM'})-[:HAS_SUBJECT]->(f:Frontier)
WHERE occ.claimType = 'MEASUREMENT' AND occ.valueNumber IS NOT NULL
OPTIONAL MATCH (occ)-[:ASSERTED_BY]->(who)
// kernel rule: the check ASSESSES the occurrence's Claim (an Assessment never ASSESSES an Assertion)
OPTIONAL MATCH (occ)-[:OCCURRENCE_OF]->(:Claim)<-[:ASSESSES]-(as:Assessment) WHERE as.recordedTo IS NULL
RETURN f.key, occ.proposition, occ.valueNumber, occ.unitCode, occ.qualifiers AS countingRule, who.name,
       collect({assessment: as.uid, verdict: as.verdict, summary: as.summary}) AS checks
// recomputation from events = the Q-D13-23 projection for the same period and rule, shown beside each claim
```

- trace: each claim occurrence's locator (FC12, FC4 "Total of 337 Approvals").
- bitemporal episode needed on: none.

## Q-D13-25

- kind: cypher (expansion; predicate-only PRESENTED_AT_CONFERENCE)
- question: presentations on F at which conference edition, and which readout each presents.
- pattern:

```cypher
MATCH (e:Event {eventKind: 'DATA_PRESENTATION'})-[:ON_FRONTIER]->(:Frontier {key: $frontierKey})
// object = D9 Channel with channelKind EVENT_SERIES (the recurring meeting); edition and session are Assertion qualifiers
OPTIONAL MATCH (e)<-[:HAS_SUBJECT]-(pa:Assertion {predicate: 'PRESENTED_AT_CONFERENCE'})-[:HAS_OBJECT]->(series:Channel)
OPTIONAL MATCH (e)-[:LEADS_TO|RESPONDS_TO]-(r:Event {eventKind: 'READOUT'})
OPTIONAL MATCH (e)-[pr:INVOLVES {role: 'PRESENTER'}]->(who)
RETURN e.uid, e.startedAt, e.eventStatus, series.name AS meeting, series.channelKind,
       [q IN coalesce(pa.qualifiers, []) WHERE q STARTS WITH 'edition=' OR q STARTS WITH 'session='] AS edition,
       collect(DISTINCT who.name) AS presenters, collect(DISTINCT r.uid) AS readouts,
       coalesce(e.startedAt, e.scheduledFrom) AS orderAt
ORDER BY orderAt
```

  A recording of the presentation is D9's `RECORDING_OF` predicate (MediaWork → this Event), read from the Assertion side when the row needs it.
- trace: T(e); the PRESENTED_AT_CONFERENCE assertion's locator (conference program or sponsor release).
- bitemporal episode needed on: none.

## Q-D13-26

- kind: cypher
- question: programs on any longevity frontier that reported the same kind of safety signal, with stated frequency and what happened after.
- pattern:

```cypher
MATCH (s:Event {eventKind: 'SAFETY_SIGNAL'})<-[:HAS_SUBJECT]-(ab:Assertion {predicate: 'EVENT_ABOUT'})-[:HAS_OBJECT]->(ae:Condition)
WHERE ab.recordedTo IS NULL AND ae.uid IN $adverseEffectUids          // D2 Condition (conditionKind PHENOTYPE), e.g. ICD-10-CM R74.01
MATCH (s)-[:ON_FRONTIER]->(f:Frontier)
WHERE f.key IN $frontierKeys OR f.parentKey IN $frontierKeys
OPTIONAL MATCH (s)<-[:HAS_SUBJECT]-(fq:Assertion {predicate: 'STATED_CASE_COUNT'}) WHERE fq.recordedTo IS NULL   // "11 of 204"
OPTIONAL MATCH (resp:Event)-[:RESPONDS_TO]->(s)
RETURN ae.name, f.key, s.uid, s.startedAt,
       collect(DISTINCT {value: fq.valueNumber, unit: fq.unitCode, qualifiers: fq.qualifiers}) AS statedFrequency,
       collect(DISTINCT {response: resp.uid, kind: resp.eventKind}) AS responses
ORDER BY ae.name, s.startedAt
```

- trace: T(e) for the signal; the STATED_CASE_COUNT assertion's locator (FC6 quote 2; denominator and group are its qualifiers); T(link) for responses.
- bitemporal episode needed on: none.

## Q-D13-27

- kind: cypher + kernel Assessment (`D13.hypothesis-disconfirmation`)
- question: for a failed pivotal readout, what earlier evidence it rested on and which evidence types it disconfirmed.
- pattern:

```cypher
MATCH (r:Event {uid: $readoutUid, eventKind: 'READOUT'})
WHERE r.primaryEndpointStatement IN ['NOT_MET', 'MIXED']
// stated basis of the program: LEADS_TO links into the readout's trial start or the program, and CLAIM occurrences
OPTIONAL MATCH (earlier:Event)-[lt:LEADS_TO*1..3]->(r)
OPTIONAL MATCH (occ:Assertion {assertionKind: 'CLAIM'})-[:HAS_SUBJECT]->(r)
OPTIONAL MATCH (as:Assessment)-[:ASSESSES]->(r)
  WHERE as.assessmentSubkind = 'D13.hypothesis-disconfirmation' AND as.recordedTo IS NULL
OPTIONAL MATCH (as)-[:DERIVED_FROM]->(input:Assertion)
RETURN r.uid, r.name, collect(DISTINCT earlier.uid) AS statedPredecessors, collect(DISTINCT occ.proposition) AS statedBasis,
       as.summary, collect(DISTINCT {input: input.uid, kind: input.assertionKind, basis: input.basisKind}) AS weighedEvidence
```

  Which evidence types were disconfirmed (real-world, preclinical, post-hoc, biomarker) is the Assessment's content, never an edge (FC8 evoke/evoke+, FC7 UBX0101).
- trace: the Assessment's DERIVED_FROM inputs and HAS_EVIDENCE locators; T(e).
- bitemporal episode needed on: none.

## Q-D13-28

- kind: cypher (agent)
- question: events or studies reclassified after a vocabulary change, and what the old classification said.
- pattern:

```cypher
MATCH (x)-[of:ON_FRONTIER]->(f:Frontier)
WHERE of.recordedTo IS NOT NULL                                    // closed episodes
MATCH (old:Assertion {uid: of.assertionUid})
OPTIONAL MATCH (new:Assertion {supersedesUid: old.uid})-[:HAS_OBJECT]->(f2:Frontier)
RETURN x.uid, labels(x)[0] AS kind, f.key AS from, f2.key AS to,
       [q IN old.qualifiers WHERE q STARTS WITH 'frontierVocabVersion='] AS oldVersion,
       [q IN new.qualifiers WHERE q STARTS WITH 'frontierVocabVersion='] AS newVersion,
       of.recordedTo AS changedAt, of.lastWriterRunId
```

- trace: both classification assertions and the Activities that wrote them.
- bitemporal episode needed on: ON_FRONTIER recorded-time episode (closed on reclassification).

## Q-D13-29

- kind: cypher (kernel Report read) — published
- question: publish a frontier progress brief for F as of T.
- pattern:

```cypher
// composition (D10 method, ANSWER / PROFILE Activity) gathers Q-D13-01 + Q-D13-08 + Q-D13-10 rows for F as of T,
// i.e. the events reached by (e:Event)-[of:ON_FRONTIER]->(f:Frontier {key: $frontierKey}) with LIVE(of, $asOf),
// and cites each ON_FRONTIER episode's of.assertionUid beside the events' time and link assertions;
// the published skeleton is then read as:
MATCH (rep:Report)-[:ASSESSES]->(f:Frontier {key: $frontierKey})
WHERE rep.reportKind = 'PROFILE' AND rep.skeletonKey STARTS WITH 'd10.frontier-brief@' AND rep.status = 'ACCEPTED'
OPTIONAL MATCH (rep)-[:DERIVED_FROM]->(a:Assertion)-[:HAS_SUBJECT]->(e:Event)
OPTIONAL MATCH (rep)-[:WAS_GENERATED_BY]->(act:Activity)
RETURN rep.uid, rep.publishedAt, rep.policyVersion, rep.bodyDigest, act.runId, act.missionId,
       collect(DISTINCT {event: e.uid, assertion: a.uid, predicate: a.predicate}) AS citedRows
```

- trace: the Report's DERIVED_FROM assertions (each event's time and link assertions), HAS_EVIDENCE locators and composing Activity (kernel minimum citation set).
- bitemporal episode needed on: none.

## Q-D13-30

- kind: cypher (kernel Assessment, `assessmentKind: BREAKTHROUGH_JUDGMENT`; kernel model stage change 4)
- question: was E a breakthrough for F under criterion version v; who judged it; superseded?
- pattern:

```cypher
MATCH (as:Assessment)-[:ASSESSES]->(e:Event {uid: $eventUid})
WHERE as.assessmentKind = 'BREAKTHROUGH_JUDGMENT'
OPTIONAL MATCH (as)-[:ASSESSES]->(f:Frontier)
OPTIONAL MATCH (as)-[:HAS_EVIDENCE]->(l:SourceLocator)
OPTIONAL MATCH (as)-[:WAS_GENERATED_BY]->(act:Activity)-[:WAS_ASSOCIATED_WITH]->(ag:Agent)
OPTIONAL MATCH (next:Assessment {supersedesUid: as.uid})
// conclusionCode is the D13-registered outcome (MEETS_CRITERION | DOES_NOT_MEET | NOT_CHECKABLE); methodVersion names the criterion set
RETURN as.uid, f.key, as.methodVersion AS criterionVersion, as.conclusionCode, as.summary, as.recordedAt, as.recordedTo,
       next.uid AS supersededBy, ag.name AS judgedBy, collect(l.exact) AS evidence
ORDER BY as.recordedAt
```

- trace: the Assessment's HAS_EVIDENCE locators; its supersession chain.
- bitemporal episode needed on: none.

## Q-D13-31

- kind: cypher (kernel Assessment, `assessmentKind: EVENT_IMPACT`; kernel model stage change 4)
- question: how significant was E for a stated domain, by whose method, and do two assessments disagree?
- pattern:

```cypher
MATCH (as:Assessment)-[:ASSESSES]->(e:Event {uid: $eventUid})
WHERE as.assessmentKind = 'EVENT_IMPACT' AND as.recordedTo IS NULL
OPTIONAL MATCH (as)-[:WAS_GENERATED_BY]->(:Activity)-[:WAS_ASSOCIATED_WITH]->(ag:Agent)
RETURN [x IN as.facets WHERE x STARTS WITH 'impactDomain='] AS domain, as.methodVersion, as.conclusionCode, as.score, as.summary, ag.name
ORDER BY domain, as.recordedAt
// disagreement = two live assessments on the same (event, domain) from different methods or agents, shown side by side
```

  Impact domain (MARKET, CLINICAL_PRACTICE, REGULATORY, SCIENTIFIC, COMMERCIAL, PATIENT_ACCESS) is the kernel `facets` code `impactDomain=<value>` (kernel M9; check stage 2026-10-08 replaced the earlier `assessmentSubkind` suffix).
- trace: the Assessment's inputs and evidence.
- bitemporal episode needed on: none.

## Q-D13-32

- kind: cypher (kernel lineage)
- question: which mission and run created or reclassified the events and frontier links on F, and what else that run wrote.
- pattern:

```cypher
MATCH (f:Frontier {key: $frontierKey})<-[of:ON_FRONTIER]-(e:Event)
OPTIONAL MATCH (e)-[:WAS_GENERATED_BY]->(nodeRun:Activity)
WITH collect(DISTINCT nodeRun.runId) + collect(DISTINCT of.lastWriterRunId) AS runIds
UNWIND runIds AS rid
WITH DISTINCT rid WHERE rid IS NOT NULL
MATCH (act:Activity {runId: rid})
OPTIONAL MATCH (act)<-[:WAS_GENERATED_BY]-(other)
RETURN act.missionId, act.runId, act.activityKind, act.startedAt,
       count(DISTINCT other) AS nodesWritten, collect(DISTINCT labels(other)[0])[0..10] AS kinds
ORDER BY act.startedAt
```

  Edge lineage is `lastWriterRunId` on each episode resolved to the Activity with that `runId` (kernel rule); node lineage is WAS_GENERATED_BY.
- trace: Activity (missionId, runId) per row — the kernel lineage spine (00-DIRECTIVE section 4).
- bitemporal episode needed on: none.

## Q-D13-33

- kind: cypher, computed at query time (00-DIRECTIVE 3.5 comparison; added in the adversarial-review pass). A published comparison is a D10 Report under a named DecisionCriterion version; D10 Q-D10-22 ranks companies on F by clinical stage from the same assertions.
- question: compare the programs on frontier F — which reached which milestone rung, in what order, and how long from pivotal readout to approval.
- ranks on: eventKind + readoutStage + primaryEndpointStatement + approvalPathway + jurisdiction (→ `milestoneKinds[].ladderRank`, vocab-frontiers.yaml section 4), then the clocks (`startedAt`, else `announcedAt`); never on a stored score.
- pattern:

```cypher
MATCH (f:Frontier {key: $frontierKey})<-[of:ON_FRONTIER]-(e:Event)
WHERE of.recordedTo IS NULL AND e.eventStatus = 'OCCURRED'
  AND e.eventKind IN ['TRIAL_START', 'READOUT', 'REGULATORY_SUBMISSION', 'REGULATORY_ACCEPTANCE',
                      'REGULATORY_DESIGNATION', 'APPROVAL', 'LAUNCH']
  AND coalesce(e.startedAt, e.announcedAt) <= $asOf
// program = the intervention the event is about (a readout's primary subject is its study, so programs are keyed by the
// substance / product / intervention object of any live EVENT_ABOUT, not by the primary subject)
MATCH (e)<-[:HAS_SUBJECT]-(ab:Assertion {predicate: 'EVENT_ABOUT'})-[:HAS_OBJECT]->(prog)
WHERE ab.recordedTo IS NULL AND any(l IN labels(prog) WHERE l IN ['ChemicalSubstance', 'Product', 'Intervention'])
OPTIONAL MATCH (e)-[sp:INVOLVES]->(sponsor:Organization) WHERE sp.role IN ['SPONSOR', 'APPLICANT'] AND sp.recordedTo IS NULL
WITH prog, e, collect(DISTINCT sponsor.name) AS sponsorsOfEvent ORDER BY coalesce(e.startedAt, e.announcedAt)
WITH prog, collect({uid: e.uid, kind: e.eventKind, stage: e.readoutStage, endpoint: e.primaryEndpointStatement,
                    pathway: e.approvalPathway, jurisdiction: e.jurisdiction, at: coalesce(e.startedAt, e.announcedAt),
                    sponsors: sponsorsOfEvent}) AS rungs
WITH prog, rungs,
     head([r IN rungs WHERE r.kind = 'READOUT' AND r.stage IN ['TOPLINE', 'PRIMARY'] AND r.endpoint = 'MET']) AS pivotal,
     head([r IN rungs WHERE r.kind = 'APPROVAL']) AS approval
RETURN prog.uid, prog.name, rungs, pivotal.at AS pivotalReadout, approval.at AS firstApproval, approval.jurisdiction,
       CASE WHEN pivotal IS NOT NULL AND approval IS NOT NULL
            THEN duration.inDays(pivotal.at, approval.at).days END AS readoutToApprovalDays
// service: map each rung to ladderRank, rank programs (furthest rung, then earliest date) under the named D10 criterion
// version, and label each step stated (LEADS_TO, Q-D13-05) or temporal (FOLLOWS)
```

- trace: T(e) for every rung; T(link) for each stated step; the criterion version for the ranking.
- bitemporal episode needed on: none.
