# K — retrieval patterns

A1 model stage, 2026-10-08; adversarial review 2026-10-08 (Q-K-06, Q-K-09, Q-K-13, Q-K-15, Q-K-21 rewritten). One section per question in `02-questions.md`. Every query is Cypher 5 as Neo4j 5.26 plans it (close-out 2026-10-09: the `CYPHER 25` prefix was removed from every block; 5.26 rejects it) against the kernel SDL in `04-schema-proposal.graphql` (labels as declared there: `Assertion`; `Source`, `Claim`, `Agent`, `Identifier` carry `Entity`; `SourceSnapshot`, `SourceLocator`, `Report` carry `InformationArtifact`; `Adjudication`, `Assessment` carry `EvidenceAssessment`; `Activity` carries `Occurrence`). Domain types carry their own label plus `Entity`. Seam types used in patterns (never declared by K): D9 `Chunk` (`CHUNK_OF`, `COVERS_LOCATOR`, `MENTIONS`), D9 `MediaWork` (`OCCURS_IN` from a claim occurrence, the container; `RENDITION_OF` from Source, rendition grouping only), D7 `Organization` / `Person` and D9 `Channel` (ACCOUNT) as asserters.

## Conventions used by every pattern

- **Lookup by uid.** A uid is `hu:<token>:<opaque>`; the caller maps the token to its label through the node registers (`06-node-register.yaml uidToken`) and matches `MATCH (x:$($label) {uid: $uid})` (dynamic label, Neo4j 5.26+), so no label-free scan is ever needed. Every node type has a uniqueness constraint on `uid`.
- **Current vs as-of.** "Current" = `recordedTo IS NULL` on the record (Assertion, Adjudication, Assessment, Report) or the episode. As-of recorded time `$R`: `x.recordedAt <= $R AND (x.recordedTo IS NULL OR x.recordedTo > $R)` (episodes use `recordedFrom`). Valid-time overlap with `[$V1, $V2)`: `(x.validFrom IS NULL OR x.validFrom < $V2) AND (x.validTo IS NULL OR x.validTo > $V1)`; a null bound is unknown, never "ongoing", so strict as-of answers add `x.validFromBasis <> 'UNKNOWN'` when the caller asks for known validity only.
- **Asserted edge from its Assertion.** An asserted edge is found from its authorizing Assertion with both endpoints bound — `MATCH (a)-[:HAS_SUBJECT]->(s), (a)-[:HAS_OBJECT]->(o) MATCH (s)-[r:$(a.predicate)]->(o) WHERE r.assertionUid = a.uid` — so lineage over edges needs no relationship scan.
- **Trace to bytes.** The citation chain is always `(record)-[:HAS_EVIDENCE {role}]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)`, returning `loc.exact`, `loc.selectorKind`, `loc.selectorDigest`, offsets/page/media time, `snap.contentHash`, `snap.retrievedAt`, `src.canonicalUri`. That is what an answer cites and what the verifier re-selects (`expectedSelectedContentDigest` on the edge).
- **Indexes the patterns assume** (operations file, executor change P13 in `11-open-questions.md`):

```cypher
CREATE CONSTRAINT assertion_uid IF NOT EXISTS FOR (n:Assertion) REQUIRE n.uid IS UNIQUE;   // one per node label
CREATE CONSTRAINT activity_run IF NOT EXISTS FOR (n:Activity) REQUIRE (n.externalRunSystem, n.runId) IS UNIQUE;
CREATE CONSTRAINT claim_hash IF NOT EXISTS FOR (n:Claim) REQUIRE n.propositionHash IS UNIQUE;
CREATE CONSTRAINT identifier_key IF NOT EXISTS FOR (n:Identifier) REQUIRE (n.scheme, n.issuer, n.value) IS UNIQUE;
CREATE INDEX activity_mission IF NOT EXISTS FOR (n:Activity) ON (n.missionId);
CREATE INDEX assertion_predicate IF NOT EXISTS FOR (n:Assertion) ON (n.predicate, n.status);
CREATE INDEX assertion_recorded IF NOT EXISTS FOR (n:Assertion) ON (n.recordedAt);
CREATE INDEX assertion_writer IF NOT EXISTS FOR (n:Assertion) ON (n.lastWriterRunId);
CREATE INDEX assessment_kind IF NOT EXISTS FOR (n:Assessment) ON (n.assessmentKind, n.disposition);
CREATE INDEX report_kind IF NOT EXISTS FOR (n:Report) ON (n.reportKind);
CREATE INDEX snapshot_revision IF NOT EXISTS FOR (n:SourceSnapshot) ON (n.revisionKind);
CREATE FULLTEXT INDEX claim_proposition IF NOT EXISTS FOR (n:Claim) ON EACH [n.proposition];
// generated per asserted / state / derived relationship type from the assembled 05 registers:
CREATE INDEX rel_<TYPE>_writer IF NOT EXISTS FOR ()-[r:<TYPE>]-() ON (r.lastWriterRunId);
CREATE INDEX rel_<TYPE>_assertion IF NOT EXISTS FOR ()-[r:<TYPE>]-() ON (r.assertionUid);
```

## Q-K-01

- kind: cypher
- pattern: assertion → asserter, evidence locators → snapshot → source; current adjudications → their VERIFICATION Activity (policy version, bundle).

```cypher
MATCH (a:Assertion {uid: $assertionUid})-[:ASSERTED_BY]->(who)
MATCH (a)-[e:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(a) WHERE adj.recordedTo IS NULL
OPTIONAL MATCH (adj)-[:WAS_GENERATED_BY]->(vrun:Activity)
RETURN a.status, a.predicate, labels(who)[0] AS asserterKind, who.uid, who.name,
       e.role, e.origin, e.authority, e.independence,
       loc.selectorKind, loc.exact, loc.startOffset, loc.endOffset, loc.page, loc.mediaStartSeconds,
       snap.contentHash, snap.retrievedAt, src.canonicalUri,
       adj.adjudicationKind, adj.verdict, adj.policyOutcome, adj.judgeKind, vrun.policyVersion, vrun.bundleDigest
ORDER BY e.role, loc.uid;
```

- as-of: add the as-of predicate on `a` and on `adj` (`adj.recordedAt <= $R AND (adj.recordedTo IS NULL OR adj.recordedTo > $R)`) to see what the adjudication said at R.
- trace: one row per located span: quote + selector + snapshot digest + retrieval time; the verdict cites the same locators through the Adjudication's own HAS_EVIDENCE.
- bitemporal episode needed on: none (time is on the Assertion and Adjudication nodes).

## Q-K-02

- kind: cypher
- pattern: assertions and asserted-edge episodes about X, as of recorded date R for validity window V; the diff between R1 and R2 lists opened and closed records.

```cypher
MATCH (x:$($label) {uid: $uid})<-[:HAS_SUBJECT|HAS_OBJECT]-(a:Assertion)
WHERE a.recordedAt <= $R AND (a.recordedTo IS NULL OR a.recordedTo > $R)
  AND (a.validFrom IS NULL OR a.validFrom < $V2) AND (a.validTo IS NULL OR a.validTo > $V1)
RETURN a.uid, a.predicate, a.valueString, a.valueNumber, a.unitCode,
       a.validFrom, a.validTo, a.validFromBasis, a.validObservedAt, a.recordedAt, a.status
ORDER BY a.predicate, a.validFrom;

// asserted episodes on X's own edges (any domain type; endpoints bound, no scan)
MATCH (x:$($label) {uid: $uid})-[r]-(y)
WHERE r.assertionUid IS NOT NULL AND r.recordedFrom <= $R AND (r.recordedTo IS NULL OR r.recordedTo > $R)
RETURN type(r), y.uid, r.validFrom, r.validTo, r.recordedFrom, r.recordedTo, r.assertionUid;

// diff R1 → R2 (recorded time)
MATCH (x:$($label) {uid: $uid})<-[:HAS_SUBJECT|HAS_OBJECT]-(a:Assertion)
WHERE (a.recordedAt > $R1 AND a.recordedAt <= $R2) OR (a.recordedTo > $R1 AND a.recordedTo <= $R2)
RETURN a.uid, a.predicate, CASE WHEN a.recordedAt > $R1 THEN 'OPENED' ELSE 'CLOSED' END AS change, a.supersedesUid;
```

- as-of: the pattern is the as-of (recorded time R, valid window [V1, V2)).
- trace: each row's `assertionUid` resolves to Q-K-01's locator rows.
- bitemporal episode needed on: every domain asserted edge (`AssertedEdgeProperties`), state attachment (`StateEpisodeProperties`) and `HAS_IDENTIFIER` (`IdentifierLinkProperties`); edges using `AssertedRecordedProperties` answer the recorded-time half only.

## Q-K-03

- kind: cypher
- pattern: record → WAS_GENERATED_BY → Activity → WAS_ASSOCIATED_WITH → Agent; for an edge, its `lastWriterRunId` (or its authorizing Assertion's generator).

```cypher
MATCH (n:$($label) {uid: $uid})-[:WAS_GENERATED_BY]->(act:Activity)
OPTIONAL MATCH (act)-[:WAS_ASSOCIATED_WITH]->(ag:Agent)
RETURN act.missionId, act.runId, act.activityKind, act.operationKind, act.startedAt, act.endedAt,
       act.intentDigests, act.planDigests, act.receiptIds, act.bundleDigest, act.policyVersion,
       collect(ag {.agentKind, .model, .promptVersion, .skillVersion, .toolVersion}) AS agents
ORDER BY act.startedAt;

// for an asserted edge: its authorizing Assertion's runs, plus the last writer
MATCH (a:Assertion {uid: $assertionUid})-[:WAS_GENERATED_BY]->(act:Activity)
RETURN act.runId, act.bundleDigest, $edgeLastWriterRunId AS lastWriterRunId;
```

- as-of: not applicable (lineage facts never change).
- trace: replay = the Activity's `intentDigests` + `planDigests` (KS receipts) and `bundleDigest` (sealed verification bundle).
- bitemporal episode needed on: none.

## Q-K-04

- kind: cypher
- pattern: Activities of mission M → nodes generated (created vs updated: created when no earlier Activity generated the node) → asserted edges through their Assertions → derived edges by `lastWriterRunId` of projection runs.

```cypher
MATCH (act:Activity {missionId: $missionId})<-[:WAS_GENERATED_BY]-(n)
WITH act, n, NOT EXISTS {
  MATCH (n)-[:WAS_GENERATED_BY]->(prior:Activity) WHERE prior.startedAt < act.startedAt } AS created
RETURN act.runId, act.activityKind, labels(n)[0] AS label,
       sum(CASE WHEN created THEN 1 ELSE 0 END) AS createdCount,
       sum(CASE WHEN created THEN 0 ELSE 1 END) AS updatedCount
ORDER BY act.runId, label;

// asserted edges the mission's runs authorized
MATCH (act:Activity {missionId: $missionId})<-[:WAS_GENERATED_BY]-(a:Assertion)
MATCH (a)-[:HAS_SUBJECT]->(s), (a)-[:HAS_OBJECT]->(o)
MATCH (s)-[r]->(o) WHERE type(r) = a.predicate AND r.assertionUid = a.uid
RETURN act.runId, type(r), count(r) AS edges;

// reports and assessments, explicitly (the published outputs)
MATCH (act:Activity {missionId: $missionId})<-[:WAS_GENERATED_BY]-(out)
WHERE out:Report OR out:Assessment OR out:Adjudication
RETURN act.runId, labels(out)[0], out.uid, coalesce(out.reportKind, out.assessmentKind, out.adjudicationKind) AS kind;
```

- as-of: optional `n.createdAt <= $R`.
- trace: reconcile with the KS receipts named in `act.receiptIds` (created/affected lists); outputs cite locators per Q-K-01.
- bitemporal episode needed on: none (reads `recordedFrom` only to report episodes).

## Q-K-05

- kind: cypher
- pattern: union of four roles — wrote X (WAS_GENERATED_BY, incl. updates), asserted about X (HAS_SUBJECT/HAS_OBJECT), assessed X (ASSESSES from Assessment, Report, Adjudication or a D10 ReportItem), chartered about X (Activity ASSESSES), plus projection runs that wrote MENTIONS to X.

```cypher
MATCH (x:$($label) {uid: $uid})
CALL (x) {
  MATCH (x)-[:WAS_GENERATED_BY]->(act:Activity) RETURN act, 'WROTE' AS role
  UNION
  MATCH (x)<-[:HAS_SUBJECT|HAS_OBJECT]-(:Assertion)-[:WAS_GENERATED_BY]->(act:Activity) RETURN act, 'ASSERTED_ABOUT' AS role
  UNION
  MATCH (x)<-[:ASSESSES]-(j)-[:WAS_GENERATED_BY]->(act:Activity) RETURN act, 'ASSESSED' AS role
  UNION
  MATCH (x)<-[:ASSESSES]-(act:Activity) RETURN act, 'CHARTERED_ABOUT' AS role
  UNION
  MATCH (x)<-[m:MENTIONS]-() MATCH (act:Activity {runId: m.lastWriterRunId}) RETURN act, 'LINKED_MENTION' AS role
}
RETURN act.missionId, act.runId, act.activityKind, act.startedAt, collect(DISTINCT role) AS roles
ORDER BY act.startedAt;
```

- as-of: `act.startedAt <= $R`.
- trace: each role row resolves to the record it wrote, which cites locators.
- bitemporal episode needed on: none.

## Q-K-06

- kind: cypher
- pattern: blast radius. M's outputs are the kernel records (Assertion, Assessment, Adjudication, Report, Claim) whose creating Activity (the earliest WAS_GENERATED_BY) belongs to M; records M only updated, and domain entities M created or touched, are not walked. Dependants are found up to 4 hops over the kernel dependency types, where a `DERIVED_FROM` hop may reach any input and an `ASSESSES` hop counts only when it ends at a Claim or an Assertion (adversarial review: with WAS_GENERATED_BY written on update and ASSESSES aimed at any Subjectable, walking from domain entities would make every later judgment about a popular entity a "dependant"). Domain entities M created or updated are returned as a separate list. Plus derived edges whose input lists cite M's records, and downstream runs.

```cypher
// M's outputs: kernel records M created
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
RETURN DISTINCT labels(dep)[0] AS kind, dep.uid, dep.recordedTo IS NULL AS current, min(length(p)) AS depth
ORDER BY depth, kind
LIMIT 500;

// touched entities: domain entities M created or updated, listed (with their runs), never walked
MATCH (act:Activity {missionId: $missionId})<-[:WAS_GENERATED_BY]-(x:Entity)
WHERE NOT (x:Claim OR x:Source OR x:Agent OR x:Identifier)
RETURN labels(x)[0] AS kind, x.uid, collect(DISTINCT act.runId) AS runs;

// derived edges citing M's records (per derived type listed in the assembled registers)
MATCH (:Activity {missionId: $missionId})<-[:WAS_GENERATED_BY]-(a:Assertion)
WITH collect(a.uid) AS outUids
MATCH ()-[r:$($derivedType)]->() WHERE any(u IN r.derivedFromAssertionUids WHERE u IN outUids)
RETURN type(r), count(r);

// downstream runs started from M's runs (WAS_INFORMED_BY, run → the run it was started from): their outputs are
// the next ring of the blast radius even where no record-level DERIVED_FROM / ASSESSES edge exists
MATCH (m:Activity {missionId: $missionId})
MATCH p = (d:Activity)-[:WAS_INFORMED_BY]->{1,4}(m)
WHERE d.missionId <> $missionId           // runs of other missions; M's own runs are already in outs
RETURN DISTINCT d.missionId, d.runId, d.activityKind, min(length(p)) AS depth
ORDER BY depth;
```

- run-scoped variant (fixture `two-run-lineage`): bind the outputs with `(:Activity {runId: $runId})` and keep `out` when its earliest Activity has that runId; filter `d.runId <> $runId` instead (later runs of the same mission count).
- as-of: dependants current at R: `dep.recordedAt <= $R AND (dep.recordedTo IS NULL OR dep.recordedTo > $R)`.
- trace: dependants are records that themselves cite locators; the answer lists which of their citations came from M.
- bitemporal episode needed on: none.

## Q-K-07

- kind: cypher
- pattern: no database `as-of`/`since` exists (Neo4j; the Mission Control annex forbids inventing a knowledge sequence), so the diff is built from `WAS_GENERATED_BY` (multi-valued, written on create and update), `recordedAt`/`recordedTo`, `supersedesUid`, and episodes' `recordedFrom`/`recordedTo`. `lastWriterRunId` is overwritten by later runs and is used only for "last touched by".

```cypher
MATCH (r1:Activity {runId: $r1}), (r2:Activity {runId: $r2})
// (1) created by R2: generated by R2 and by no Activity that started before R2
MATCH (r2)<-[:WAS_GENERATED_BY]-(n)
WITH r1, r2, n, NOT EXISTS { MATCH (n)-[:WAS_GENERATED_BY]->(p:Activity) WHERE p.startedAt < r2.startedAt } AS created
RETURN labels(n)[0] AS label, n.uid,
       CASE WHEN created AND n.supersedesUid IS NOT NULL THEN 'SUPERSEDES'
            WHEN created THEN 'CREATED'
            WHEN n.recordedTo IS NOT NULL THEN 'CLOSED'
            ELSE 'UPDATED' END AS change,
       n.supersedesUid, EXISTS { (n)-[:WAS_GENERATED_BY]->(r1) } AS alsoWrittenByR1
ORDER BY change, label;

// (2) asserted episodes opened or closed by R2 (through the Assertions R2 generated)
MATCH (r2:Activity {runId: $r2})<-[:WAS_GENERATED_BY]-(a:Assertion)
MATCH (a)-[:HAS_SUBJECT]->(s), (a)-[:HAS_OBJECT]->(o)
MATCH (s)-[e]->(o) WHERE type(e) = a.predicate AND e.assertionUid = a.uid
RETURN type(e), e.relationshipUid, CASE WHEN e.recordedTo IS NULL THEN 'OPEN' ELSE 'CLOSED' END AS state,
       e.recordedFrom, e.recordedTo;
```

- as-of: the two runs' windows (`startedAt`, `endedAt`) bound the recorded times; runs that overlap in time are separated by `WAS_GENERATED_BY`, not by clocks.
- trace: every CREATED/SUPERSEDES Assertion cites its locators (Q-K-01).
- bitemporal episode needed on: reads `recordedFrom`/`recordedTo` of asserted episodes (present on both AssertedEdgeProperties and AssertedRecordedProperties); no valid time needed.

## Q-K-08

- kind: cypher
- pattern: Claim ← ASSESSES ← EVIDENCE_MISSION Activity; its Report (WAS_GENERATED_BY the mission, ASSESSES the Claim); refined variants (`refinesClaimUid`) included so a report on the narrower proposition is shown with its exact Claim.

```cypher
MATCH (c0:Claim {uid: $claimUid})
CALL (c0) {
  RETURN c0 AS c
  UNION
  MATCH (v:Claim {refinesClaimUid: c0.uid}) RETURN v AS c
}
OPTIONAL MATCH (c)<-[:ASSESSES]-(m:Activity {activityKind: 'EVIDENCE_MISSION'})
OPTIONAL MATCH (m)<-[:WAS_GENERATED_BY]-(r:Report {reportKind: 'EVIDENCE_REPORT'})-[:ASSESSES]->(c)
WHERE r.recordedTo IS NULL
OPTIONAL MATCH (m)-[:WAS_INFORMED_BY]->(vr:Activity {activityKind: 'VETTING'})   // the vetting run that queued C
RETURN c.uid, c.proposition, m.missionId, m.runId, m.startedAt, m.endedAt, vr.runId AS queuedByRun,
       r.uid, r.verdict, r.worldCorrectness, r.policyVersion, r.publishedAt, r.bundleDigest
ORDER BY m.startedAt DESC;
```

- as-of: `r.recordedAt <= $R` for "what verdict had we published at R".
- trace: the Report's minimum citation set (Q-K-17) and its sealed ledger; "untested" when no mission row.
- bitemporal episode needed on: none.

## Q-K-09

- kind: cypher
- pattern: Claim ← OCCURRENCE_OF ← claim-occurrence Assertions → asserter, locator → snapshot → source; the container is D9 `OCCURS_IN` (seam; exactly one per occurrence, optional until D9 writes it; never derived from RENDITION_OF); the current VETTING assessment.

```cypher
MATCH (c:Claim {uid: $claimUid})<-[:OCCURRENCE_OF]-(o:Assertion)-[:ASSERTED_BY]->(who)
WHERE o.recordedTo IS NULL
MATCH (o)-[:HAS_EVIDENCE {role: 'SUPPORTS', origin: 'DECLARED'}]->(loc:SourceLocator)
      <-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (o)-[:OCCURS_IN]->(work)                 // D9 MediaWork (seam): the container
CALL (c) {
  OPTIONAL MATCH (c)<-[:ASSESSES]-(v:Assessment {assessmentKind: 'VETTING'}) WHERE v.recordedTo IS NULL
  RETURN v ORDER BY v.recordedAt DESC LIMIT 1
}
RETURN who.uid, who.name, o.speechAct, o.basisKind, o.polarity, o.status,
       coalesce(o.validFrom, o.validObservedAt, snap.publishedAt) AS saidAt, o.validFromBasis,
       work.uid AS container, src.canonicalUri, loc.exact, snap.contentHash,
       v.disposition, v.recordedAt AS vettedAt
ORDER BY saidAt;
```

- as-of: as-of predicate on `o` and `v`.
- trace: every occurrence row carries its quote and snapshot digest.
- bitemporal episode needed on: none (occurrence time on the Assertion).

## Q-K-10

- kind: cypher
- pattern: (a) assertions resting on a snapshot of a Source that later captured a revision (`revisionKind` set on a newer snapshot); (b) locators on an older snapshot that no newer-snapshot locator re-anchors.

```cypher
// (a) revision on a later capture of the same Source
MATCH (src:Source)-[:HAS_SNAPSHOT]->(rev:SourceSnapshot)
WHERE rev.revisionKind IN ['RETRACTION', 'EXPRESSION_OF_CONCERN', 'ERRATUM', 'WITHDRAWAL', 'CORRECTED_AND_REPUBLISHED']
MATCH (src)-[:HAS_SNAPSHOT]->(old:SourceSnapshot)-[:HAS_LOCATOR]->(loc:SourceLocator)<-[:HAS_EVIDENCE]-(a:Assertion)
WHERE coalesce(old.observedAt, old.retrievedAt) < coalesce(rev.observedAt, rev.retrievedAt) AND a.recordedTo IS NULL
RETURN src.canonicalUri, rev.revisionKind, rev.publishedAt AS revisedAt, rev.retrievedAt AS learnedAt,
       a.uid, a.predicate, a.assertionKind, loc.exact
ORDER BY revisedAt DESC;

// (b) failed re-anchor: a newer snapshot exists, no locator on it names this one
MATCH (src:Source)-[:HAS_SNAPSHOT]->(old:SourceSnapshot)-[:HAS_LOCATOR]->(loc:SourceLocator)<-[:HAS_EVIDENCE]-(a:Assertion)
MATCH (src)-[:HAS_SNAPSHOT]->(newer:SourceSnapshot) WHERE coalesce(newer.observedAt, newer.retrievedAt) > coalesce(old.observedAt, old.retrievedAt)
  AND NOT EXISTS { MATCH (newer)-[:HAS_LOCATOR]->(l2:SourceLocator) WHERE l2.reanchorsLocatorUid = loc.uid }
RETURN DISTINCT a.uid, loc.uid, old.contentHash, newer.contentHash;
```

- as-of: `rev.retrievedAt <= $R` (what we knew at R); the revision's world time is `rev.publishedAt` and the HAS_REVISION_STATUS Assertion's `validFrom` (Q-K-22).
- snapshot order (fixtures stage, 2026-10-08): two captures are ordered by `coalesce(observedAt, retrievedAt)`, never by `retrievedAt` alone — an archive capture (Internet Archive replay) fetched in the same run as the live page has the same `retrievedAt` but an older `observedAt` (fixture `07-fixtures/retracted-sah-2017-stale-evidence`: 2024-08-16 vs 2026-10-08).
- trace: the stale assertion's own locator plus the revising snapshot's digest (the notice is its own Source and locator).
- bitemporal episode needed on: none.

## Q-K-11

- kind: cypher
- pattern: current EVIDENCE_REPORTs with a negative verdict → their Claim → occurrences said after the report's publication.

```cypher
MATCH (c:Claim)<-[:ASSESSES]-(r:Report {reportKind: 'EVIDENCE_REPORT'})
WHERE r.recordedTo IS NULL AND r.verdict IN ['CONTRADICTED', 'NOT_SUPPORTED', 'MIXED_OR_CONFLICTING', 'PARTIALLY_SUPPORTED']
MATCH (c)<-[:OCCURRENCE_OF]-(o:Assertion)-[:ASSERTED_BY]->(who)
WITH c, r, o, who, coalesce(o.validFrom, o.validObservedAt) AS saidAt
WHERE saidAt > r.publishedAt OR (saidAt IS NULL AND o.recordedAt > r.publishedAt)
RETURN c.proposition, r.verdict, r.publishedAt, who.uid, who.name, saidAt, o.recordedAt, o.uid
ORDER BY r.publishedAt, saidAt;
```

- as-of: `r.recordedAt <= $R`.
- trace: report → its citation set; each repetition → its locator (Q-K-01). An undated occurrence counts only by recorded time and is flagged as such.
- bitemporal episode needed on: none.

## Q-K-12

- kind: cypher
- pattern: X → HAS_IDENTIFIER episodes → Identifier; the episode's Assertion → locator; reverse lookup by the unique (scheme, issuer, value).

```cypher
MATCH (x:$($label) {uid: $uid})-[h:HAS_IDENTIFIER]->(i:Identifier)
WHERE h.recordedFrom <= $R AND (h.recordedTo IS NULL OR h.recordedTo > $R)
OPTIONAL MATCH (a:Assertion {uid: h.assertionUid})-[:ASSERTED_BY]->(stater)
OPTIONAL MATCH (a)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
RETURN i.scheme, i.issuer, i.value, h.isPrimary, h.validFrom, h.validTo, stater.name, src.canonicalUri, loc.exact;

// reverse: which entity carries (scheme, issuer, value) now
MATCH (i:Identifier {scheme: $scheme, issuer: $issuer, value: $value})<-[h:HAS_IDENTIFIER]-(x)
WHERE h.recordedTo IS NULL
RETURN labels(x)[0], x.uid, x.name, h.validFrom, h.validTo;
```

- as-of: the episode predicate above (recorded R) plus valid-time overlap for "valid when".
- trace: each identifier row cites the locator that stated it (registry page, Wikidata statement).
- bitemporal episode needed on: **HAS_IDENTIFIER** (assignment validity: GTIN reassigned, code deprecated).

## Q-K-13

- kind: cypher
- pattern: a surface form is a SourceLocator (its `exact`); the competing hypotheses are the RESOLUTION / EQUIVALENCE Assessments that cite that span (HAS_EVIDENCE role CONTEXT) and ASSESS candidate entities; the accepted, current one is the licence of the derived D9 Chunk `MENTIONS` (named in `derivedFromAssessmentUids`). No Mention node (cut in the adversarial review).

```cypher
MATCH (loc:SourceLocator {uid: $locatorUid})            // or: a locator found by its exact / quoteHash
MATCH (h:Assessment)-[:HAS_EVIDENCE {role: 'CONTEXT'}]->(loc)
WHERE h.assessmentKind IN ['RESOLUTION', 'EQUIVALENCE']
MATCH (h)-[:ASSESSES]->(cand)
OPTIONAL MATCH (:Chunk)-[mr:MENTIONS]->(cand) WHERE h.uid IN mr.derivedFromAssessmentUids
RETURN loc.exact AS surfaceForm, h.facets, cand.uid, cand.name, h.uid, h.status, h.score, h.methodVersion,
       h.conclusionCode, h.recordedTo IS NULL AS current,
       h.status = 'ACCEPTED' AND h.recordedTo IS NULL AS licensed, count(mr) AS licensedMentionEdges
ORDER BY h.score DESC;
```

- as-of: as-of predicate on `h`.
- trace: the shared span (`loc`) plus any further evidence the assessment cites; "still a hypothesis" = no current ACCEPTED assessment for the span, or two current ones with different candidates.
- bitemporal episode needed on: none.

## Q-K-14

- kind: vector (+ cypher hop) — the 00-DIRECTIVE 3.8 effectiveness path
- pattern: question embedding → D9 chunks (vector index `chunk_embedding` through `db.index.vector.queryNodes`; the Cypher 25 `SEARCH` clause with in-index filtering is Neo4j 2026.01+ and does not plan on 5.26) **or** entity X ← `MENTIONS` ← chunks → `COVERS_LOCATOR` (derived span overlap) → SourceLocator ← `HAS_EVIDENCE` ← accepted Assertion → snapshot; re-selection check: a SUPPORT or CAPTURE_FIDELITY Adjudication of that Assertion cites the same locator with the same `expectedSelectedContentDigest`.

```cypher
CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS c, score
WHERE c:Chunk AND c.language = 'en'   // post-filter on 5.26 (fewer than 20 rows when other languages rank high)
// alternative entry: MATCH (x:$($label) {uid: $entityUid})<-[:MENTIONS]-(c:Chunk)
MATCH (c)-[:COVERS_LOCATOR]->(loc:SourceLocator)<-[e:HAS_EVIDENCE {role: 'SUPPORTS'}]-(a:Assertion)
WHERE a.status = 'ACCEPTED' AND a.recordedTo IS NULL
MATCH (loc)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
OPTIONAL MATCH (a)<-[:ASSESSES]-(adj:Adjudication)-[e2:HAS_EVIDENCE]->(loc)
WHERE adj.recordedTo IS NULL
RETURN score, c.uid, loc.exact, loc.selectorDigest, a.uid, a.predicate, snap.contentHash,
       e.expectedSelectedContentDigest = e2.expectedSelectedContentDigest AS verifierReselectsSameSpan
ORDER BY score DESC;
```

- as-of: chunks are regenerable (`c.recordedTo IS NULL`); the assertion as-of predicate applies to `a`.
- trace: the answer cites `loc` (never the chunk); `snap.contentHash` is the byte digest the verifier re-selects against.
- bitemporal episode needed on: none (MENTIONS and COVERS_LOCATOR are derived, recorded-only).

## Q-K-15

- kind: cypher
- pattern: current assertions about X → the spans each assertion declared → the verifier's per-evidence `authority` / `independence` on the current Adjudications' VERIFIER_FOUND edges to those same spans (any adjudication kind: verification.v1 puts the SourceAuthorityVector on every EvidenceEdge) → flag when no span is INDEPENDENT, or when any is PROMOTIONAL; an assertion with no vector is "not yet verified". The Assertion's own DECLARED edges never carry authority (adversarial review). Optional D7/D6 enrichment of the asserter's interest (seam).

```cypher
MATCH (x:$($label) {uid: $uid})<-[:HAS_SUBJECT]-(a:Assertion)-[:ASSERTED_BY]->(who)
WHERE a.recordedTo IS NULL
OPTIONAL MATCH (a)-[:HAS_EVIDENCE {origin: 'DECLARED'}]->(loc:SourceLocator)
      <-[e:HAS_EVIDENCE {origin: 'VERIFIER_FOUND'}]-(adj:Adjudication)-[:ASSESSES]->(a)
WHERE adj.recordedTo IS NULL
WITH a, who, [v IN collect(e.independence) WHERE v IS NOT NULL] AS independence,
     [v IN collect(e.authority) WHERE v IS NOT NULL] AS authority
RETURN a.uid, a.predicate, who.uid, who.name, independence, authority,
       size(authority) = 0 AS notYetVerified,
       size(independence) > 0 AND NOT 'INDEPENDENT' IN independence AS noIndependentSupport,
       'PROMOTIONAL' IN authority AS restsOnPromotional
ORDER BY noIndependentSupport DESC, notYetVerified;
// D7/D6 enrichment (seam): EXISTS { (who)-[:HOLDS_STAKE|RECEIVES_VALUE_FROM|OWNS_BRAND]->() } or (offer)-[:SELLER_OF_RECORD]->(who) for a product whose ingredient is X.
```

- as-of: as-of predicate on `a` and `adj`.
- trace: the evidence spans with their authority/independence vectors; the asserter's interest rows come from D7 assertions with their own locators.
- bitemporal episode needed on: D7's interest edges (their episodes say whether the interest held when the claim was made); none in K.

## Q-K-16

- kind: cypher
- pattern: current CAPTURE_FIDELITY adjudications whose assertion is REJECTED or DISPUTED.

```cypher
MATCH (adj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(a:Assertion)
WHERE adj.recordedTo IS NULL AND a.status IN ['REJECTED', 'DISPUTED']
OPTIONAL MATCH (adj)-[e:HAS_EVIDENCE]->(loc:SourceLocator)
RETURN a.uid, a.predicate, a.status, adj.verdict, adj.policyOutcome, adj.unsupportedFacets, adj.judgeKind,
       adj.decision, adj.decisionProvenance, adj.rationale, adj.recordedAt AS adjRecordedAt,
       collect(e.role + ':' + loc.exact) AS spans
ORDER BY adjRecordedAt DESC LIMIT 100;
```

- as-of: as-of predicate on `adj`.
- trace: the judged span(s) on the Adjudication itself.
- bitemporal episode needed on: none.

## Q-K-17

- kind: cypher
- pattern: Report → its minimum citation set (DERIVED_FROM Assertions and Assessments, HAS_EVIDENCE locators) → current status of each input; locators whose Source later captured a revision.

```cypher
MATCH (r:Report {uid: $reportUid})
CALL (r) {
  MATCH (r)-[:DERIVED_FROM]->(a:Assertion)
  RETURN 'ASSERTION' AS kind, a.uid AS uid, a.status AS state, a.recordedTo AS closedAt, null AS revision
  UNION
  MATCH (r)-[:DERIVED_FROM]->(s:Assessment)
  RETURN 'ASSESSMENT' AS kind, s.uid AS uid, s.status AS state, s.recordedTo AS closedAt, null AS revision
  UNION
  MATCH (r)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
  OPTIONAL MATCH (src)-[:HAS_SNAPSHOT]->(rev:SourceSnapshot)
  WHERE coalesce(rev.observedAt, rev.retrievedAt) > coalesce(snap.observedAt, snap.retrievedAt) AND rev.revisionKind IS NOT NULL
  RETURN 'LOCATOR' AS kind, loc.uid AS uid, null AS state, null AS closedAt, rev.revisionKind AS revision
  UNION
  // a cited Assertion whose own evidence rests on a Source with a later revision or a HAS_REVISION_STATUS Assertion
  MATCH (r)-[:DERIVED_FROM]->(a:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
  OPTIONAL MATCH (src)-[:HAS_SNAPSHOT]->(rev:SourceSnapshot)
  WHERE coalesce(rev.observedAt, rev.retrievedAt) > coalesce(snap.observedAt, snap.retrievedAt) AND rev.revisionKind IS NOT NULL
  OPTIONAL MATCH (src)<-[:HAS_SUBJECT]-(st:Assertion {predicate: 'HAS_REVISION_STATUS'}) WHERE st.recordedTo IS NULL
  WITH a, coalesce(rev.revisionKind, st.valueString) AS revision WHERE revision IS NOT NULL
  RETURN DISTINCT 'ASSERTION_SOURCE' AS kind, a.uid AS uid, a.status AS state, a.recordedTo AS closedAt, revision
}
RETURN kind, uid, state, closedAt, revision,
       (closedAt IS NOT NULL OR state IN ['REJECTED', 'SUPERSEDED', 'WITHDRAWN'] OR revision IS NOT NULL) AS compromised;
```

- as-of: compare `closedAt` and `rev.retrievedAt` with `r.publishedAt` to separate "was already stale when published" from "became stale later".
- fixtures stage (2026-10-08): the `ASSERTION_SOURCE` branch was added because a report cites most inputs through DERIVED_FROM, not by quoting their spans; without it the retracted occurrence cited by the fixture report (`07-fixtures/retracted-sah-2017-stale-evidence`) is not flagged. Snapshot order uses `coalesce(observedAt, retrievedAt)` (see Q-K-10).
- trace: the rows are the report's citations.
- bitemporal episode needed on: none.

## Q-K-18

- kind: cypher
- pattern: computed state (any domain state or profile node, label from its uid token) → DERIVED_FROM → input Assertions; stale when any input closed; the PROJECTION Activity names the method.

```cypher
MATCH (s:$($stateLabel) {uid: $stateUid})-[:DERIVED_FROM]->(a:Assertion)
MATCH (s)-[:WAS_GENERATED_BY]->(p:Activity {activityKind: 'PROJECTION'})
RETURN s.uid, p.methodVersion, p.runId, count(a) AS inputs,
       [x IN collect(a) WHERE x.recordedTo IS NOT NULL OR x.status IN ['REJECTED', 'SUPERSEDED'] | x.uid] AS staleInputs;
```

- as-of: as-of predicate on inputs reproduces the state's input set at R (compare with the stored `inputSetDigest`).
- trace: each input Assertion cites locators.
- bitemporal episode needed on: none.

## Q-K-19

- kind: cypher
- pattern: current VETTING assessments with disposition RESEARCH whose Claim has no EVIDENCE_MISSION Activity about it; reach = occurrence count and latest occurrence.

```cypher
MATCH (c:Claim)<-[:ASSESSES]-(v:Assessment {assessmentKind: 'VETTING', disposition: 'RESEARCH'})
WHERE v.recordedTo IS NULL
  AND NOT EXISTS { (c)<-[:ASSESSES]-(:Activity {activityKind: 'EVIDENCE_MISSION'}) }
CALL (c) {
  MATCH (c)<-[:OCCURRENCE_OF]-(o:Assertion) WHERE o.recordedTo IS NULL
  RETURN count(o) AS occurrences, max(coalesce(o.validFrom, o.validObservedAt, o.recordedAt)) AS lastSaid
}
RETURN c.uid, c.proposition, v.recordedAt AS vettedAt, occurrences, lastSaid
ORDER BY occurrences DESC, lastSaid DESC LIMIT 50;
```

- as-of: as-of predicate on `v`.
- trace: the queue row links to the vetting assessment's inputs (DERIVED_FROM occurrences).
- bitemporal episode needed on: none.

## Q-K-20

- kind: cypher
- pattern: ANSWER Report → DERIVED_FROM assertions → locators → snapshots; the chunks that covered those spans (D9 COVERS_LOCATOR, inverse); the composing and producing runs. Sentence-level offsets come from the sealed ledger (`ledgerDigest`).

```cypher
MATCH (r:Report {uid: $answerUid, reportKind: 'ANSWER'})-[:WAS_GENERATED_BY]->(ans:Activity)
MATCH (r)-[:DERIVED_FROM]->(a:Assertion)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
OPTIONAL MATCH (loc)<-[:COVERS_LOCATOR]-(ch:Chunk)
OPTIONAL MATCH (a)-[:WAS_GENERATED_BY]->(prod:Activity)
RETURN r.queryDigest, r.ledgerDigest, ans.runId, a.uid, a.status, loc.exact, snap.contentHash,
       collect(DISTINCT ch.uid) AS chunks, collect(DISTINCT prod.runId) AS producingRuns;
```

- as-of: the answer is a frozen artifact; staleness of its inputs is Q-K-17.
- trace: this is the trace.
- bitemporal episode needed on: none.

## Q-K-21

- kind: cypher
- pattern: Claim → current occurrences → their retelling root (DERIVED_FROM chain to an occurrence that derives from nothing) → the root's source family → role from polarity → two counts per role: `distinctFamilies` (every family) and `independentFamilies` (families whose primary's own spans carry the verifier's `independence: INDEPENDENT` on a current Adjudication, and nothing else; unverified primaries do not count). Source family (09 "Occurrence container and source family"): the D9 work the primary OCCURS_IN; when it has none (scholarly records), the D9 work the evidence Source is a RENDITION_OF; else the Source.

```cypher
MATCH (c:Claim {uid: $claimUid})<-[:OCCURRENCE_OF]-(o:Assertion)
WHERE o.recordedTo IS NULL
OPTIONAL MATCH (o)-[:DERIVED_FROM]->+(root:Assertion) WHERE NOT EXISTS { (root)-[:DERIVED_FROM]->(:Assertion) }
WITH o, coalesce(root, o) AS primary
OPTIONAL MATCH (primary)-[:OCCURS_IN]->(container)                       // D9 (seam): the container, one per occurrence
MATCH (primary)-[:HAS_EVIDENCE {origin: 'DECLARED'}]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (src)-[:RENDITION_OF]->(work)                             // D9 (seam): rendition grouping only
OPTIONAL MATCH (loc)<-[v:HAS_EVIDENCE {origin: 'VERIFIER_FOUND'}]-(adj:Adjudication)-[:ASSESSES]->(primary)
WHERE adj.recordedTo IS NULL
WITH o, primary, coalesce(container.uid, work.uid, src.uid) AS family, collect(v.independence) AS ind,
     CASE o.polarity WHEN 'POSITIVE' THEN 'SUPPORTS' WHEN 'NEGATIVE' THEN 'CONTRADICTS' ELSE 'QUALIFIES' END AS role
WITH role, o, primary, family, size(ind) > 0 AND all(i IN ind WHERE i = 'INDEPENDENT') AS independent
RETURN role, count(DISTINCT o) AS occurrences, count(DISTINCT family) AS distinctFamilies,
       count(DISTINCT CASE WHEN independent THEN family END) AS independentFamilies,
       collect(DISTINCT {occurrence: o.uid, primary: primary.uid, family: family, retelling: o <> primary, independent: independent}) AS rows;
```

- as-of: as-of predicate on `o` and `adj`.
- trace: each row's primary occurrence cites its locator; retellings point at their primary and count in its family. The latest EVIDENCE_SYNTHESIS Assessment and the report-wide `independentSourceFamilyCount` are the assessed versions of the same count (they can merge families the graph cannot yet join, e.g. shared authors, until the D7 author seam exists).
- bitemporal episode needed on: none.

## Q-K-22

- kind: cypher
- pattern: HAS_REVISION_STATUS Assertions (one per authority) about Sources our assertions cite → authority, dates → affected assertions.

```cypher
MATCH (st:Assertion {predicate: 'HAS_REVISION_STATUS'})-[:HAS_SUBJECT]->(src:Source)
WHERE st.recordedTo IS NULL
MATCH (st)-[:ASSERTED_BY]->(auth)
MATCH (src)-[:HAS_SNAPSHOT]->(:SourceSnapshot)-[:HAS_LOCATOR]->(:SourceLocator)<-[:HAS_EVIDENCE]-(a:Assertion)
WHERE a.predicate <> 'HAS_REVISION_STATUS' AND a.recordedTo IS NULL   // fixtures stage: other authorities' status assertions are not 'affected'
RETURN src.canonicalUri, st.valueString AS status, auth.name AS assertedBy, st.validFrom AS since,
       st.validFromBasis, st.recordedAt AS learnedAt, count(DISTINCT a) AS affectedAssertions
ORDER BY since DESC;
```

- as-of: `st.recordedAt <= $R` (CQ-TM-02: a retraction learned on 2026-10-08 is invisible at R = 2026-01-01 even though `since` is 2025-06-30).
- trace: each status cites the notice's locator (Crossref `updated-by` JSON pointer, PubMed `PublicationType`).
- bitemporal episode needed on: none (valid time on the status Assertion node).

## Q-K-23

- kind: cypher
- pattern: asserter P → claim occurrences → Claims → current evidence reports and third-party ratings; each verdict compared with the occurrence date.

```cypher
MATCH (p:$($label) {uid: $asserterUid})<-[:ASSERTED_BY]-(o:Assertion {assertionKind: 'CLAIM'})-[:OCCURRENCE_OF]->(c:Claim)
OPTIONAL MATCH (c)<-[:ASSESSES]-(r:Report {reportKind: 'EVIDENCE_REPORT'}) WHERE r.recordedTo IS NULL
OPTIONAL MATCH (c)<-[:HAS_SUBJECT]-(rv:Assertion {predicate: 'RATES_CLAIM'})-[:ASSERTED_BY]->(reviewer)
WITH p, o, c, r, collect(DISTINCT {reviewer: reviewer.name, rating: rv.valueString}) AS ratings,
     coalesce(o.validFrom, o.validObservedAt) AS saidAt
RETURN c.proposition, saidAt, r.verdict, r.publishedAt, saidAt > r.publishedAt AS saidAfterReport, ratings
ORDER BY saidAt;
```

- as-of: as-of predicates on `o`, `r`, `rv`.
- trace: occurrences and reports cite locators; ratings cite the review page's locator.
- bitemporal episode needed on: none.

## Q-K-24

- kind: cypher (materialized by a PROJECTION Activity into a QUALITY Assessment about the Agent, `methodVersion: producer-error-rate/v1`)
- pattern: Agent ← WAS_ASSOCIATED_WITH ← Activity ← WAS_GENERATED_BY ← Assertion ← current CAPTURE_FIDELITY Adjudication.

```cypher
MATCH (ag:Agent)<-[:WAS_ASSOCIATED_WITH]-(act:Activity)<-[:WAS_GENERATED_BY]-(a:Assertion)
OPTIONAL MATCH (a)<-[:ASSESSES]-(adj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'}) WHERE adj.recordedTo IS NULL
WITH ag, count(DISTINCT a) AS produced, count(DISTINCT adj) AS adjudicated,
     count(DISTINCT CASE WHEN a.status = 'REJECTED' THEN a END) AS rejected,
     count(DISTINCT CASE WHEN a.status = 'DISPUTED' THEN a END) AS disputed
RETURN ag.uid, ag.model, ag.promptVersion, ag.skillVersion, produced, adjudicated, rejected, disputed,
       CASE WHEN adjudicated = 0 THEN null ELSE toFloat(rejected + disputed) / adjudicated END AS errorRate
ORDER BY errorRate DESC;
```

- as-of: restrict `act.startedAt` to a window; the materialized Assessment records `evidenceCutoffAt`.
- trace: the QUALITY Assessment DERIVED_FROM a sample of the rejected Assertions (bounded list) so the rate is checkable.
- bitemporal episode needed on: none.

## Q-K-25

- kind: cypher
- pattern: EVIDENCE_REPORT → DERIVED_FROM Assertions → their current SUPPORT Adjudications → five orthogonal properties, abstentions.

```cypher
MATCH (r:Report {uid: $reportUid})-[:DERIVED_FROM]->(a:Assertion)
OPTIONAL MATCH (a)<-[:ASSESSES]-(adj:Adjudication {adjudicationKind: 'SUPPORT'}) WHERE adj.recordedTo IS NULL
RETURN a.uid, adj.verdict, adj.evidenceSupport, adj.worldCorrectness, adj.attributionFaithfulness, adj.sourceAuthority,
       adj.provenanceIntegrity, adj.policyOutcome, adj.unsupportedFacets, adj.rationale,
       r.citationCompleteness, r.citationCorrectness, r.independentSourceFamilyCount, r.unsupportedHighSeverityCount
ORDER BY adj.verdict;
```

- as-of: the report's own `recordedAt`.
- trace: each adjudication's HAS_EVIDENCE spans (Q-K-01).
- bitemporal episode needed on: none.

## Q-K-26

- kind: cypher
- pattern: current EVIDENCE_REPORTs → their Claim → occurrences or SUPPORT-adjudication evidence recorded after `publishedAt`; revisions of cited sources after publication.

```cypher
MATCH (c:Claim)<-[:ASSESSES]-(r:Report {reportKind: 'EVIDENCE_REPORT'})
WHERE r.recordedTo IS NULL
CALL (c, r) {
  MATCH (c)<-[:OCCURRENCE_OF]-(o:Assertion) WHERE o.recordedAt > r.publishedAt
  RETURN count(o) AS newOccurrences
}
CALL (r) {
  MATCH (r)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)-[:HAS_SNAPSHOT]->(rev:SourceSnapshot)
  WHERE rev.retrievedAt > r.publishedAt AND rev.revisionKind IS NOT NULL
  RETURN count(DISTINCT rev) AS newRevisions
}
WITH c, r, newOccurrences, newRevisions WHERE newOccurrences > 0 OR newRevisions > 0
RETURN c.proposition, r.uid, r.publishedAt, r.verdict, newOccurrences, newRevisions
ORDER BY newRevisions DESC, newOccurrences DESC;
```

- as-of: `$R` replaces "now" for "was it stale at R".
- trace: the new occurrences' locators.
- bitemporal episode needed on: none.

## Q-K-27

- kind: cypher
- pattern: Claim ← HAS_SUBJECT ← RATES_CLAIM Assertions (third-party verdicts) → reviewer; the D10 mapping rule (versioned table passed as `$ratingMap`, `$mapVersion`) maps rating text to a lattice value; compare with our current EVIDENCE_REPORT.

```cypher
MATCH (c:Claim {uid: $claimUid})<-[:HAS_SUBJECT]-(rv:Assertion {predicate: 'RATES_CLAIM'})-[:ASSERTED_BY]->(reviewer)
WHERE rv.recordedTo IS NULL
MATCH (rv)-[:HAS_EVIDENCE]->(loc:SourceLocator)
OPTIONAL MATCH (c)<-[:ASSESSES]-(r:Report {reportKind: 'EVIDENCE_REPORT'}) WHERE r.recordedTo IS NULL
WITH reviewer, rv, loc, r, $ratingMap[rv.valueString] AS mapped
RETURN reviewer.name, rv.valueString AS rating, rv.qualifiers AS scale, mapped, $mapVersion AS mapVersion,
       r.verdict AS ours, mapped = r.verdict AS agrees, loc.exact, rv.validFrom AS reviewedAt
ORDER BY reviewedAt DESC;
```

- as-of: as-of predicate on `rv`.
- trace: the rating span on the review page (ClaimReview JSON-LD `reviewRating`).
- bitemporal episode needed on: none.

## Q-K-28

- kind: cypher + fulltext
- pattern: write precheck — exact proposition by `propositionHash`; near duplicates by the `claim_proposition` fulltext index; locator and snapshot presence for the declared span.

```cypher
OPTIONAL MATCH (c:Claim {propositionHash: $propositionHash})
OPTIONAL MATCH (loc:SourceLocator {uid: $locatorUid})<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
RETURN c.uid AS existingClaim, loc IS NOT NULL AS locatorPresent, snap.contentHash AS snapshotDigest,
       (loc IS NOT NULL AND snap.storageUri IS NOT NULL) AS citationGuardPasses;

CALL db.index.fulltext.queryNodes('claim_proposition', $propositionText) YIELD node, score
WHERE score > $threshold
RETURN node.uid, node.proposition, score ORDER BY score DESC LIMIT 5;
```

- as-of: current only.
- trace: the guard result names the locator and snapshot digest the new assertion will cite.
- bitemporal episode needed on: none.

## Q-K-29

- kind: cypher
- pattern: three conflict checks over open HAS_IDENTIFIER episodes: one Identifier on two entities; two values of a single-valued scheme (from `identifier-schemes.yaml`, passed as `$singleValued`) on one entity; values failing the scheme pattern.

```cypher
MATCH (i:Identifier)<-[h:HAS_IDENTIFIER]-(x)
WHERE h.recordedTo IS NULL
WITH i, collect(DISTINCT x.uid) AS holders WHERE size(holders) > 1
RETURN 'SHARED' AS conflict, i.scheme, i.issuer, i.value, holders;

MATCH (x)-[h:HAS_IDENTIFIER]->(i:Identifier)
WHERE h.recordedTo IS NULL AND i.scheme IN $singleValued
WITH x, i.scheme AS scheme, i.issuer AS issuer, collect(DISTINCT i.value) AS values WHERE size(values) > 1
RETURN 'MULTI_VALUED' AS conflict, x.uid, scheme, issuer, values;

UNWIND $schemePatterns AS sp
MATCH (i:Identifier {scheme: sp.code}) WHERE NOT i.value =~ sp.pattern
RETURN 'PATTERN' AS conflict, i.uid, i.scheme, i.value;
```

- as-of: episode as-of predicate instead of `recordedTo IS NULL`.
- trace: each holder's HAS_IDENTIFIER Assertion → locator (Q-K-12).
- bitemporal episode needed on: **HAS_IDENTIFIER**.

## Q-K-30

- kind: cypher
- pattern: retelling occurrence → DERIVED_FROM → the primary occurrence it cites; the SUPPORT Adjudication of the retelling, whose verifier-found evidence sits in the cited work; a D9 RETELLING_FIDELITY Assessment DERIVED_FROM both.

```cypher
MATCH (o:Assertion {uid: $occurrenceUid})-[:DERIVED_FROM]->(prim:Assertion)
MATCH (prim)-[:HAS_EVIDENCE {origin: 'DECLARED'}]->(ploc:SourceLocator)
OPTIONAL MATCH (o)<-[:ASSESSES]-(adj:Adjudication {adjudicationKind: 'SUPPORT'})-[e:HAS_EVIDENCE]->(vloc:SourceLocator)
WHERE adj.recordedTo IS NULL
OPTIONAL MATCH (f:Assessment {assessmentKind: 'RETELLING_FIDELITY'})-[:DERIVED_FROM]->(o)
WHERE (f)-[:DERIVED_FROM]->(prim) AND f.recordedTo IS NULL
RETURN o.proposition, prim.proposition, ploc.exact AS primarySpan, adj.verdict, e.role, vloc.exact AS verifierSpan,
       f.conclusionCode AS fidelity, f.summary;
```

- as-of: as-of predicates on `adj`, `f`.
- trace: both spans (the retelling's and the cited work's).
- bitemporal episode needed on: none.

## CQ-TM-02

- kind: cypher
- pattern: a late-arriving fact has `validFrom` in the past (basis STATED_BY_SOURCE) and `recordedAt` = ingestion; the as-of recorded-time predicate hides it before ingestion.

```cypher
MATCH (st:Assertion {predicate: 'HAS_REVISION_STATUS'})-[:HAS_SUBJECT]->(src:Source {uid: $sourceUid})
RETURN st.validFrom, st.recordedAt,
       (st.recordedAt <= $R AND (st.recordedTo IS NULL OR st.recordedTo > $R)) AS knownAtR,
       (st.validFrom <= $V) AS trueAtV;
```

- as-of: the pattern is the as-of; the expected FC-3 answer at R = 2026-01-01, V = 2026-01-01: `trueAtV = true`, `knownAtR = false`.
- trace: the notice locator.
- bitemporal episode needed on: none (node-level bitemporal Assertion).

## CQ-TM-03

- kind: cypher
- pattern: the five clocks side by side for one assertion.

```cypher
MATCH (a:Assertion {uid: $assertionUid})-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity)
RETURN snap.publishedAt AS publicationTime, snap.observedAt AS observationTime, a.validFrom AS effectiveFrom,
       a.validFromBasis, a.validObservedAt, snap.retrievedAt AS captureTime, a.recordedAt AS ingestionTime,
       act.startedAt AS runStarted;
```

- as-of: not applicable.
- trace: the snapshot digest.
- bitemporal episode needed on: none.

## CQ-AX-04

- kind: cypher
- pattern: classify an empty answer about X for predicate P: measured absent (a POSITIVE NO_* assertion), not reported (FIELD_NOT_REPORTED assertion), searched but nothing found (a RESEARCH Activity ASSESSES X, or a D11 `CaptureAttempt` with `subjectUid` = X and outcome EMPTY_RESULT), blocked (a D11 CaptureAttempt with outcome FAILED), unknown (nothing), out of scope (the caller's predicate is not registered).

```cypher
MATCH (x:$($label) {uid: $uid})
RETURN
  EXISTS { (x)<-[:HAS_SUBJECT]-(a:Assertion) WHERE a.predicate = $predicate AND a.recordedTo IS NULL } AS hasAnswer,
  EXISTS { (x)<-[:HAS_SUBJECT]-(a:Assertion) WHERE a.predicate IN $absencePredicates AND a.polarity = 'POSITIVE' } AS measuredAbsent,
  EXISTS { (x)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'FIELD_NOT_REPORTED'}) WHERE a.valueString = $field } AS notReported,
  EXISTS { (x)<-[:ASSESSES]-(:Activity {activityKind: 'RESEARCH'}) } AS searched,
  COLLECT { MATCH (ca:CaptureAttempt {subjectUid: x.uid}) RETURN DISTINCT ca.outcome } AS attemptOutcomes;   // D11 seam (property join)
```

- as-of: as-of predicate on the assertions.
- trace: the FIELD_NOT_REPORTED assertion cites the section read (or WHOLE_SNAPSHOT); "searched" cites the Activity.
- bitemporal episode needed on: none.

## CQ-AX-07

- kind: cypher
- pattern: audit of accepted, current assertions lacking a locator, a reproducible snapshot, or any adjudication.

```cypher
MATCH (a:Assertion {status: 'ACCEPTED'}) WHERE a.recordedTo IS NULL
WITH a,
  NOT EXISTS { (a)-[:HAS_EVIDENCE]->(:SourceLocator) } AS noLocator,
  NOT EXISTS { (a)<-[:ASSESSES]-(:Adjudication) } AS noAdjudication,
  EXISTS { (a)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)
           WHERE s.storageUri IS NULL AND s.archiveUri IS NULL } AS irreproducible,
  NOT EXISTS { (a)-[:WAS_GENERATED_BY]->(:Activity) } AS noLineage
WHERE noLocator OR noAdjudication OR irreproducible OR noLineage
RETURN a.uid, a.predicate, noLocator, noAdjudication, irreproducible, noLineage LIMIT 500;
```

- as-of: current only.
- trace: the audit row names the missing link.
- bitemporal episode needed on: none.

## CQ-AX-08

- kind: cypher (run per derived relationship type of the assembled registers)
- pattern: derived edges whose cited inputs are missing, closed or rejected, or that lack a method version.

```cypher
MATCH ()-[r:$($derivedType)]->()
WITH r, coalesce(r.derivedFromAssertionUids, []) + CASE WHEN r.projectionOfAssertionUid IS NULL THEN [] ELSE [r.projectionOfAssertionUid] END AS inputs
OPTIONAL MATCH (a:Assertion) WHERE a.uid IN inputs AND a.recordedTo IS NULL AND NOT a.status IN ['REJECTED', 'SUPERSEDED']
WITH r, inputs, count(a) AS liveInputs
WHERE r.derivationRule IS NULL AND r.projectionOfAssertionUid IS NULL
   OR (size(inputs) > 0 AND liveInputs < size(inputs))
RETURN type(r), elementId(r), r.derivationRule, size(inputs) AS inputs, liveInputs, r.lastWriterRunId LIMIT 500;
```

- as-of: current only.
- trace: the projection Activity (`r.lastWriterRunId`) and its method version.
- bitemporal episode needed on: none (derived edges are recorded-only and regenerable).
