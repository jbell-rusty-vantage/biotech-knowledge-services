---
id: "pattern:D9/CQ-CL-04"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/CQ-CL-04"]
aliases: ["d9/cq-cl-04","CQ-CL-04"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:16e47105141a263488b33925788b9918b948bf3f7a754a8476aab5958a7a1411"
---
# Pattern D9/CQ-CL-04

| | |
| --- | --- |
| id | `pattern:D9/CQ-CL-04` |
| module | [D9](../../modules/D9.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-CL-04` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:b217888d588abfdff4a33f4204847ad9592c5680ec5b6fb9193bcd43cfd0279d` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `assessment_kind`, `uid_Assertion`, `uid_exists_Assertion`, `uid_type_Assertion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-CL-04
MATCH (ret:Assertion {uid: $retellingUid, assertionKind: 'CLAIM'})<-[:DERIVED_FROM]-(fa:Assessment {assessmentKind: 'RETELLING_FIDELITY'})
WHERE fa.recordedTo IS NULL AND fa.status = 'ACCEPTED'
  AND ('retelling=' + ret.uid) IN coalesce(fa.facets, [])
MATCH (fa)-[:DERIVED_FROM]->(orig:Assertion) WHERE orig <> ret
RETURN fa.uid AS assessment, fa.methodVersion, fa.facets, fa.conclusionCode, fa.summary,
       ('original=' + orig.uid) IN coalesce(fa.facets, []) AS namedOriginal, orig.uid AS original, orig.proposition,
       COLLECT { MATCH (fa)-[:ASSESSES]->(c:Claim) RETURN c.uid } AS claims,
       COLLECT { MATCH (fa)-[:ASSESSES]->(spk) WHERE spk:Person OR spk:Organization OR spk:Channel RETURN spk.uid } AS speakers,
       COLLECT { MATCH (fa)-[fev:HAS_EVIDENCE]->(floc:SourceLocator) RETURN {role: fev.role, exact: floc.exact} } AS comparedSpans,
       COLLECT { MATCH (ret)-[tEv:HAS_EVIDENCE]->(tLoc:SourceLocator)<-[:HAS_LOCATOR]-(tSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tSrc:Source)
      WHERE tEv.role IN ['SUPPORTS', 'QUALIFIES']
      OPTIONAL MATCH (tSrc)-[:RENDITION_OF]->(tRw:MediaWork)
      RETURN {role: tEv.role, selectorKind: tLoc.selectorKind, exact: tLoc.exact, startOffset: tLoc.startOffset, endOffset: tLoc.endOffset,
              mediaStartSeconds: tLoc.mediaStartSeconds, mediaEndSeconds: tLoc.mediaEndSeconds, speakerLabel: tLoc.speakerLabelInSource,
              contentHash: tSnap.contentHash, retrievedAt: tSnap.retrievedAt, captureCompleteness: tSnap.captureCompleteness,
              uri: tSrc.canonicalUri, genre: tSrc.genre, renditionOfWork: tRw.uid,
              captureFidelity: COLLECT { MATCH (tAdj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(ret) WHERE tAdj.recordedTo IS NULL
                                         RETURN tAdj {.uid, .verdict, .policyOutcome} }} } AS retellingTrace, COLLECT { MATCH (orig)-[tEv:HAS_EVIDENCE]->(tLoc:SourceLocator)<-[:HAS_LOCATOR]-(tSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tSrc:Source)
      WHERE tEv.role IN ['SUPPORTS', 'QUALIFIES']
      OPTIONAL MATCH (tSrc)-[:RENDITION_OF]->(tRw:MediaWork)
      RETURN {role: tEv.role, selectorKind: tLoc.selectorKind, exact: tLoc.exact, startOffset: tLoc.startOffset, endOffset: tLoc.endOffset,
              mediaStartSeconds: tLoc.mediaStartSeconds, mediaEndSeconds: tLoc.mediaEndSeconds, speakerLabel: tLoc.speakerLabelInSource,
              contentHash: tSnap.contentHash, retrievedAt: tSnap.retrievedAt, captureCompleteness: tSnap.captureCompleteness,
              uri: tSrc.canonicalUri, genre: tSrc.genre, renditionOfWork: tRw.uid,
              captureFidelity: COLLECT { MATCH (tAdj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(orig) WHERE tAdj.recordedTo IS NULL
                                         RETURN tAdj {.uid, .verdict, .policyOutcome} }} } AS originalTrace
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `retellingUid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `assessment`, `fa.methodVersion`, `fa.facets`, `fa.conclusionCode`, `fa.summary`, `namedOriginal`, `original`, `orig.proposition`, `claims`, `speakers`, `comparedSpans`, `retellingTrace`, `originalTrace`

## Temporal notes

- bitemporal episode needed on: none (assessments are superseded by `supersedesUid`).

## Evidence and provenance notes

- trace: both inputs resolve by TRACE; `comparedSpans` is the assessment's own `HAS_EVIDENCE`.

## Notes

- **Ruling: F-05**, and **R-20** (closes D9 K-1 / K-3 / K-4 as kernel conventions): the `RETELLING_FIDELITY` Assessment `ASSESSES` the Claim (and the speaker), is `DERIVED_FROM` the judged occurrences, and carries the facets `retelling=<uid>`, `original=<uid>`, `occurrence=<uid>`. The packet's interim shape is now the convention; the pattern adds the facet test for the retelling and returns the ass…

## Source

- `release:query-catalog/catalog.json#D9/CQ-CL-04` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/CQ-CL-04 --json`)
