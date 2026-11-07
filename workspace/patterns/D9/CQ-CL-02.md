---
id: "pattern:D9/CQ-CL-02"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/CQ-CL-02"]
aliases: ["d9/cq-cl-02","CQ-CL-02"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:eb681d8c6e4d041ea558054042ae185c06ee481fdf09ec851d5c000ed3ed13d6"
---
# Pattern D9/CQ-CL-02

| | |
| --- | --- |
| id | `pattern:D9/CQ-CL-02` |
| module | [D9](../../modules/D9.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-CL-02` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:316ac3c61178bffd1d4861f676a3ed5f11ca65ff318ff3aa8728ec65371715d1` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `uid_MediaWork`, `uid_exists_MediaWork`, `uid_type_MediaWork` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-CL-02
MATCH (o:Assertion {assertionKind: 'CLAIM'})-[:OCCURS_IN]->(w:MediaWork {uid: $workUid})
WHERE o.recordedTo IS NULL
MATCH (o)-[:WAS_GENERATED_BY]->(act:Activity)
RETURN o.uid AS occurrence, o.speechAct, o.basisKind, o.predicate, o.extractionConfidence, o.status,
       act.activityKind, act.operationKind, act.methodVersion, act.runId, COLLECT { MATCH (o)-[tEv:HAS_EVIDENCE]->(tLoc:SourceLocator)<-[:HAS_LOCATOR]-(tSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tSrc:Source)
      WHERE tEv.role IN ['SUPPORTS', 'QUALIFIES']
      OPTIONAL MATCH (tSrc)-[:RENDITION_OF]->(tRw:MediaWork)
      RETURN {role: tEv.role, selectorKind: tLoc.selectorKind, exact: tLoc.exact, startOffset: tLoc.startOffset, endOffset: tLoc.endOffset,
              mediaStartSeconds: tLoc.mediaStartSeconds, mediaEndSeconds: tLoc.mediaEndSeconds, speakerLabel: tLoc.speakerLabelInSource,
              contentHash: tSnap.contentHash, retrievedAt: tSnap.retrievedAt, captureCompleteness: tSnap.captureCompleteness,
              uri: tSrc.canonicalUri, genre: tSrc.genre, renditionOfWork: tRw.uid,
              captureFidelity: COLLECT { MATCH (tAdj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(o) WHERE tAdj.recordedTo IS NULL
                                         RETURN tAdj {.uid, .verdict, .policyOutcome} }} } AS trace
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `workUid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `occurrence`, `o.speechAct`, `o.basisKind`, `o.predicate`, `o.extractionConfidence`, `o.status`, `act.activityKind`, `act.operationKind`, `act.methodVersion`, `act.runId`, `trace`

## Temporal notes

- bitemporal episode needed on: none.

## Evidence and provenance notes

- trace: `trace` per occurrence. A practice report (REPORTS_PRACTICE, FC-1 quote 1) is never returned by a recommendation filter.

## Notes

- **Ruling: F-05.** Label replaced; current records only (`o.recordedTo IS NULL`, the packet convention the pattern had left out).

## Source

- `release:query-catalog/catalog.json#D9/CQ-CL-02` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/CQ-CL-02 --json`)
