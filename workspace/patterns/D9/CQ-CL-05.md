---
id: "pattern:D9/CQ-CL-05"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/CQ-CL-05"]
aliases: ["d9/cq-cl-05","CQ-CL-05"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:00f01ab9f882972938ba33c3d5d157e0355fe8a8b807f08a3a76500d70273ab0"
---
# Pattern D9/CQ-CL-05

| | |
| --- | --- |
| id | `pattern:D9/CQ-CL-05` |
| module | [D9](../../modules/D9.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-CL-05` ([D7 question set](../questions/D7.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:4f02340a603af9990d0985c67e465405d500f69605c479991d4a340b6d1109e3` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `assertion_predicate`, `assessment_kind`, `sponsored_by_valid`, `uid_Assertion`, `uid_exists_Assertion`, `uid_type_Assertion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-CL-05
MATCH (o:Assertion {uid: $occUid, assertionKind: 'CLAIM'})-[:ASSERTED_BY]->(p)
OPTIONAL MATCH (o)-[:OCCURS_IN]->(w:MediaWork)
OPTIONAL MATCH (w)<-[:PUBLISHES]-(ch:Channel)
OPTIONAL MATCH (o)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(osnap:SourceSnapshot)
WITH o, p, w, ch, min(coalesce(osnap.publishedAt, osnap.observedAt)) AS snapT
WITH o, p, w, ch, CASE WHEN w IS NULL THEN snapT ELSE w.publishedAt END AS T,
     CASE WHEN w IS NULL THEN 'SNAPSHOT_FALLBACK' ELSE 'OCCURS_IN_MEDIAWORK' END AS tBasis
RETURN o.uid AS occurrence, w.uid AS container, ch.uid AS channel, T, tBasis,
  COLLECT {                                                     // (a) speaker interests: never filtered on null bounds
    MATCH (p)-[i:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(org:Organization) WHERE i.recordedTo IS NULL
    OPTIONAL MATCH (ia:Assertion {uid: i.assertionUid})
    RETURN {org: org.uid, orgName: org.name, family: type(i), kind: coalesce(i.roleKind, i.stakeKind, i.valueKind),
            validFrom: i.validFrom, validTo: i.validTo, bases: [i.validFromBasis, i.validToBasis], interestAssertion: i.assertionUid,
            temporalOverlap: CASE
      WHEN T IS NULL THEN 'UNKNOWN'
      WHEN CASE WHEN i.validFromPrecision IN ['YEAR', 'MONTH', 'DAY'] AND i.validFrom IS NOT NULL
                THEN datetime.truncate(toLower(i.validFromPrecision), i.validFrom) = datetime.truncate(toLower(i.validFromPrecision), T) ELSE false END
        OR CASE WHEN i.validToPrecision IN ['YEAR', 'MONTH', 'DAY'] AND i.validTo IS NOT NULL
                THEN datetime.truncate(toLower(i.validToPrecision), i.validTo) = datetime.truncate(toLower(i.validToPrecision), T) ELSE false END THEN 'UNKNOWN'
      WHEN (i.validTo IS NOT NULL AND i.validTo <= T) OR (i.validFrom IS NOT NULL AND i.validFrom > T) THEN 'DISJOINT'
      WHEN i.validFrom IS NOT NULL AND i.validFrom <= T AND (i.validTo > T OR (i.validTo IS NULL AND ia.validObservedAt >= T)) THEN 'OVERLAPS'
      ELSE 'UNKNOWN' END,
            disclosures: COLLECT { MATCH (dDa:Assertion)-[:HAS_OBJECT]->(org)
      WHERE dDa.recordedTo IS NULL
        AND ((dDa.predicate = type(i) AND EXISTS { (dDa)-[:ASSERTED_BY]->(p) })
             OR (dDa.predicate = 'DISCLOSES_INTEREST' AND coalesce(dDa.polarity, 'POSITIVE') <> 'NEGATIVE'
                 AND (EXISTS { (dDa)-[:HAS_SUBJECT]->(p) } OR EXISTS { (dDa)-[:HAS_SUBJECT]->(w) })))
      MATCH (dDa)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(dSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(dSrc:Source)
      WITH dDa, dSrc, coalesce(dSnap.publishedAt, dSnap.observedAt) AS dAt, EXISTS { (dSrc)-[:RENDITION_OF]->(w) } AS dInContainer
      RETURN {disclosure: dDa.uid, predicate: dDa.predicate, at: dAt, source: dSrc.canonicalUri,
              timing: CASE WHEN dAt IS NULL OR T IS NULL THEN 'TIMING_UNKNOWN'
                           WHEN dInContainer AND dAt <= T THEN 'DISCLOSED_IN_CONTAINER'
                           WHEN dInContainer THEN 'DISCLOSED_IN_LATER_REVISION'
                           WHEN dAt <= T THEN 'DISCLOSED_ELSEWHERE_AT_TIME'
                           ELSE 'DISCLOSED_ELSEWHERE' END} },
            interestTrace: COLLECT { MATCH (ia)-[tEv:HAS_EVIDENCE]->(tLoc:SourceLocator)<-[:HAS_LOCATOR]-(tSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tSrc:Source)
      WHERE tEv.role IN ['SUPPORTS', 'QUALIFIES']
      OPTIONAL MATCH (tSrc)-[:RENDITION_OF]->(tRw:MediaWork)
      RETURN {role: tEv.role, selectorKind: tLoc.selectorKind, exact: tLoc.exact, startOffset: tLoc.startOffset, endOffset: tLoc.endOffset,
              mediaStartSeconds: tLoc.mediaStartSeconds, mediaEndSeconds: tLoc.mediaEndSeconds, speakerLabel: tLoc.speakerLabelInSource,
              contentHash: tSnap.contentHash, retrievedAt: tSnap.retrievedAt, captureCompleteness: tSnap.captureCompleteness,
              uri: tSrc.canonicalUri, genre: tSrc.genre, renditionOfWork: tRw.uid,
              captureFidelity: COLLECT { MATCH (tAdj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(ia) WHERE tAdj.recordedTo IS NULL
                                         RETURN tAdj {.uid, .verdict, .policyOutcome} }} }}
  } AS interests,
  COLLECT {                                                     // (b) channel operators: predicate-only Assertions (R-79)
    MATCH (ch)<-[:HAS_SUBJECT]-(opA:Assertion {predicate: 'OPERATED_BY'})-[:HAS_OBJECT]->(operator)
    WHERE opA.recordedTo IS NULL
    RETURN {operator: operator.uid, name: operator.name, operatorAssertion: opA.uid, temporalOverlap: CASE
      WHEN T IS NULL THEN 'UNKNOWN'
      WHEN CASE WHEN opA.validFromPrecision IN ['YEAR', 'MONTH', 'DAY'] AND opA.validFrom IS NOT NULL
                THEN datetime.truncate(toLower(opA.validFromPrecision), opA.validFrom) = datetime.truncate(toLower(opA.validFromPrecision), T) ELSE false END
        OR CASE WHEN opA.validToPrecision IN ['YEAR', 'MONTH', 'DAY'] AND opA.validTo IS NOT NULL
                THEN datetime.truncate(toLower(opA.validToPrecision), opA.validTo) = datetime.truncate(toLower(opA.validToPrecision), T) ELSE false END THEN 'UNKNOWN'
      WHEN (opA.validTo IS NOT NULL AND opA.validTo <= T) OR (opA.validFrom IS NOT NULL AND opA.validFrom > T) THEN 'DISJOINT'
      WHEN opA.validFrom IS NOT NULL AND opA.validFrom <= T AND (opA.validTo > T OR (opA.validTo IS NULL AND opA.validObservedAt >= T)) THEN 'OVERLAPS'
      ELSE 'UNKNOWN' END}
  } AS operators,
  COLLECT {                                                     // (c) sponsors of the work (episode edge)
    MATCH (w)-[sp:CONTENT_SPONSORED_BY]->(sponsor) WHERE sp.recordedTo IS NULL
    OPTIONAL MATCH (spa:Assertion {uid: sp.assertionUid})
    RETURN {sponsor: sponsor.uid, name: sponsor.name, validFrom: sp.validFrom, validTo: sp.validTo, qualifiers: spa.qualifiers,
            temporalOverlap: CASE
      WHEN T IS NULL THEN 'UNKNOWN'
      WHEN CASE WHEN sp.validFromPrecision IN ['YEAR', 'MONTH', 'DAY'] AND sp.validFrom IS NOT NULL
                THEN datetime.truncate(toLower(sp.validFromPrecision), sp.validFrom) = datetime.truncate(toLower(sp.validFromPrecision), T) ELSE false END
        OR CASE WHEN sp.validToPrecision IN ['YEAR', 'MONTH', 'DAY'] AND sp.validTo IS NOT NULL
                THEN datetime.truncate(toLower(sp.validToPrecision), sp.validTo) = datetime.truncate(toLower(sp.validToPrecision), T) ELSE false END THEN 'UNKNOWN'
      WHEN (sp.validTo IS NOT NULL AND sp.validTo <= T) OR (sp.validFrom IS NOT NULL AND sp.validFrom > T) THEN 'DISJOINT'
      WHEN sp.validFrom IS NOT NULL AND sp.validFrom <= T AND (sp.validTo > T OR (sp.validTo IS NULL AND spa.validObservedAt >= T)) THEN 'OVERLAPS'
      ELSE 'UNKNOWN' END}
  } AS sponsors,
  COLLECT { MATCH (cr:Assessment {assessmentKind: 'CONFLICT_RELEVANCE'})-[:DERIVED_FROM]->(o) WHERE cr.recordedTo IS NULL
            RETURN {assessment: cr.uid, subkind: cr.assessmentSubkind, level: cr.conclusionCode, facets: cr.facets} } AS judgments,
  COLLECT { MATCH (o)-[tEv:HAS_EVIDENCE]->(tLoc:SourceLocator)<-[:HAS_LOCATOR]-(tSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tSrc:Source)
      WHERE tEv.role IN ['SUPPORTS', 'QUALIFIES']
      OPTIONAL MATCH (tSrc)-[:RENDITION_OF]->(tRw:MediaWork)
      RETURN {role: tEv.role, selectorKind: tLoc.selectorKind, exact: tLoc.exact, startOffset: tLoc.startOffset, endOffset: tLoc.endOffset,
              mediaStartSeconds: tLoc.mediaStartSeconds, mediaEndSeconds: tLoc.mediaEndSeconds, speakerLabel: tLoc.speakerLabelInSource,
              contentHash: tSnap.contentHash, retrievedAt: tSnap.retrievedAt, captureCompleteness: tSnap.captureCompleteness,
              uri: tSrc.canonicalUri, genre: tSrc.genre, renditionOfWork: tRw.uid,
              captureFidelity: COLLECT { MATCH (tAdj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(o) WHERE tAdj.recordedTo IS NULL
                                         RETURN tAdj {.uid, .verdict, .policyOutcome} }} } AS statementTrace
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `occUid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `occurrence`, `container`, `channel`, `T`, `tBasis`, `interests`, `operators`, `sponsors`, `judgments`, `statementTrace`

## Temporal notes

- bitemporal episode needed on: **CONTENT_SPONSORED_BY** (D9) and D7 HOLDS_ROLE / HOLDS_STAKE / RECEIVES_VALUE_FROM; the operator's valid time is on its OPERATED_BY Assertion.

## Evidence and provenance notes

- trace: `statementTrace` (the statement span), `interests[].interestTrace` (the interest's authorizing locator: self-disclosure line, filing, letter), `interests[].disclosures[]` (the disclosure Assertions with their source and timing). Absence of a disclosure is qualified by Q-D9-16 coverage (NOT_FOUND_IN_COMPLETE_CAPTURE / NOT_FOUND_IN_PARTIAL_CAPTURE are the Assessment's facet values, not computed here).

## Notes

- **Rulings: F-05** (label); **R-19** (T = `publishedAt` of the OCCURS_IN MediaWork, snapshot only without a container; in-container disclosure through `Source -RENDITION_OF-> w`; OVERLAP reads `validObservedAt` of the authorizing Assertion through `assertionUid`); **R-79** (OPERATED_BY stays a predicate-only Assertion with subject Channel); **R-82** (a disclosure is also `DISCLOSES_INTEREST`, subj…

## Source

- `release:query-catalog/catalog.json#D9/CQ-CL-05` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/CQ-CL-05 --json`)
