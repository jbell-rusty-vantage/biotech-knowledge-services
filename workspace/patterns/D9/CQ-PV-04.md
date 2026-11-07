---
id: "pattern:D9/CQ-PV-04"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/CQ-PV-04"]
aliases: ["d9/cq-pv-04","CQ-PV-04"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:cc732c2126418246217ab6ec663c0bfbd6dc6e24d872f7947c8013bd0e332744"
---
# Pattern D9/CQ-PV-04

| | |
| --- | --- |
| id | `pattern:D9/CQ-PV-04` |
| module | [D9](../../modules/D9.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-PV-04` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:63f118ffa17b087751e7d8f40c2a52adc6d7f24c2afdf018a5868053aabd612e` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `assessment_kind`, `uid_Assertion`, `uid_exists_Assertion`, `uid_type_Assertion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-PV-04
MATCH (o:Assertion {uid: $occUid, assertionKind: 'CLAIM'})<-[:DERIVED_FROM]-(qa:Assessment {assessmentKind: 'QUALITY'})
WHERE qa.assessmentSubkind = 'D9.capture-error' AND qa.recordedTo IS NULL
RETURN qa.uid AS assessment, qa.facets, qa.conclusionCode, qa.effectDirection, qa.summary,
       COLLECT { MATCH (qa)-[:ASSESSES]->(c:Claim) RETURN c.uid } AS claims,
       COLLECT { MATCH (o)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:COVERS_LOCATOR]-(ch:Chunk) RETURN DISTINCT ch.textBasis } AS textBases,
       COLLECT { MATCH (qa)-[qev:HAS_EVIDENCE]->(qloc:SourceLocator) RETURN {role: qev.role, exact: qloc.exact} } AS assessmentEvidence,
       COLLECT { MATCH (o)-[tEv:HAS_EVIDENCE]->(tLoc:SourceLocator)<-[:HAS_LOCATOR]-(tSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tSrc:Source)
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
| `occUid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `assessment`, `qa.facets`, `qa.conclusionCode`, `qa.effectDirection`, `qa.summary`, `claims`, `textBases`, `assessmentEvidence`, `trace`

## Temporal notes

- bitemporal episode needed on: none.

## Evidence and provenance notes

- trace: the assessment's HAS_EVIDENCE locators (FC-3 correction note; FC-5 OCR text) and the occurrence's TRACE.

## Notes

- **Ruling: F-05**, and **R-20** (an assessment of one occurrence ASSESSES the Claim and is DERIVED_FROM the occurrence and the correcting one; the packet shape stands). The chunk text bases are read through a subquery instead of an aggregate, so the TRACE stays per row.

## Source

- `release:query-catalog/catalog.json#D9/CQ-PV-04` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/CQ-PV-04 --json`)
