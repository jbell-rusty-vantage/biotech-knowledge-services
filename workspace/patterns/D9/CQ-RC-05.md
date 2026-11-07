---
id: "pattern:D9/CQ-RC-05"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/CQ-RC-05"]
aliases: ["d9/cq-rc-05","CQ-RC-05"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:30d526a928db99336fe6b48ae4354df0dcc5d15a5b67d27345837ef05372db5b"
---
# Pattern D9/CQ-RC-05

| | |
| --- | --- |
| id | `pattern:D9/CQ-RC-05` |
| module | [D9](../../modules/D9.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-RC-05` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:fa6caf3e6aca0f6f0e2baf97f1e7c831c6500cf690e42f1a5b4006614dcca6eb` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `assertion_speech_act`, `assessment_kind`, `report_kind`, `uid_Assertion`, `uid_Assessment`, `uid_Report`, `uid_exists_Assertion`, `uid_exists_Assessment`, `uid_exists_Report`, `uid_type_Assertion`, `uid_type_Assessment`, `uid_type_Report` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-RC-05
UNWIND $answerInputUids AS inputUid
CALL (inputUid) {
  MATCH (r:Assertion {uid: inputUid}) RETURN r
  UNION
  MATCH (r:Assessment {uid: inputUid}) RETURN r
  UNION
  MATCH (r:Report {uid: inputUid}) RETURN r
}
RETURN r.uid, CASE
  WHEN r:Assertion AND r.assertionKind = 'CLAIM' AND r.speechAct = 'RECOMMENDS' THEN 'SOURCE_RECOMMENDS'
  WHEN r:Assessment AND r.assessmentKind = 'EVIDENCE_SYNTHESIS' THEN 'EVIDENCE_FAVORS'
  WHEN r:Report AND r.reportKind = 'RECOMMENDATION' THEN 'BELLLABS_RECOMMENDS'
  ELSE 'OTHER' END AS provenanceKind,
  CASE WHEN r:Assessment THEN r.effectDirection END AS effectDirection,
  COLLECT { MATCH (r)-[tEv:HAS_EVIDENCE]->(tLoc:SourceLocator)<-[:HAS_LOCATOR]-(tSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tSrc:Source)
      WHERE tEv.role IN ['SUPPORTS', 'QUALIFIES']
      OPTIONAL MATCH (tSrc)-[:RENDITION_OF]->(tRw:MediaWork)
      RETURN {role: tEv.role, selectorKind: tLoc.selectorKind, exact: tLoc.exact, startOffset: tLoc.startOffset, endOffset: tLoc.endOffset,
              mediaStartSeconds: tLoc.mediaStartSeconds, mediaEndSeconds: tLoc.mediaEndSeconds, speakerLabel: tLoc.speakerLabelInSource,
              contentHash: tSnap.contentHash, retrievedAt: tSnap.retrievedAt, captureCompleteness: tSnap.captureCompleteness,
              uri: tSrc.canonicalUri, genre: tSrc.genre, renditionOfWork: tRw.uid,
              captureFidelity: COLLECT { MATCH (tAdj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(r) WHERE tAdj.recordedTo IS NULL
                                         RETURN tAdj {.uid, .verdict, .policyOutcome} }} } AS trace
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `answerInputUids` | array<string> |  | IN / plural name |

## Output contract

Columns: `r.uid`, `provenanceKind`, `effectDirection`, `trace`

## Temporal notes

- bitemporal episode needed on: none.

## Evidence and provenance notes

- trace: `trace` is TRACE on the record itself (a SOURCE_RECOMMENDS line cites the occurrence's span; Assessments and Reports cite their own HAS_EVIDENCE). "A user selected" is session state, never graph.

## Notes

- **Ruling: F-05.** `r:ClaimOccurrence` → `r:Assertion AND r.assertionKind = 'CLAIM'`. The input match is limited to the three record labels so the planner seeks the uid constraints instead of scanning all nodes. "BellLabs recommends" stays a `Report {reportKind: 'RECOMMENDATION'}` (R-83: never a stored RECOMMENDS edge).

## Source

- `release:query-catalog/catalog.json#D9/CQ-RC-05` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/CQ-RC-05 --json`)
