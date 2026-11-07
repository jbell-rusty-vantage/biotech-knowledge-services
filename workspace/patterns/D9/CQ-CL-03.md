---
id: "pattern:D9/CQ-CL-03"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/CQ-CL-03"]
aliases: ["d9/cq-cl-03","CQ-CL-03"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:e42b586d5b45d909ad4a31224f3167ed9687c863c02f837bffbee6ceb5203854"
---
# Pattern D9/CQ-CL-03

| | |
| --- | --- |
| id | `pattern:D9/CQ-CL-03` |
| module | [D9](../../modules/D9.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-CL-03` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:7b9901eed6a13e1c4b5dc6608d2c57735769a8a337436b786b3dba26c6bfad63` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `uid_Assertion`, `uid_exists_Assertion`, `uid_type_Assertion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-CL-03
MATCH (o:Assertion {uid: $occUid, assertionKind: 'CLAIM'})-[q:HAS_EVIDENCE {role: 'QUALIFIES'}]->(qloc:SourceLocator)
MATCH (qloc)<-[:HAS_LOCATOR]-(qsnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(qsrc:Source)
RETURN o.uid AS occurrence, o.qualifiers,
       [x IN coalesce(o.qualifiers, []) WHERE x STARTS WITH 'population:' OR x STARTS WITH 'individual-variation:' OR x STARTS WITH 'dose-basis:'] AS qualificationKinds,
       qloc.exact, qloc.startOffset, qloc.endOffset, qloc.mediaStartSeconds, qsnap.contentHash, qsrc.canonicalUri,
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

Columns: `occurrence`, `o.qualifiers`, `qualificationKinds`, `qloc.exact`, `qloc.startOffset`, `qloc.endOffset`, `qloc.mediaStartSeconds`, `qsnap.contentHash`, `qsrc.canonicalUri`, `statementTrace`

## Temporal notes

- bitemporal episode needed on: none.

## Evidence and provenance notes

- trace: the qualifier locator with its snapshot (FC-1: "I'm not the same as everybody else…"), plus the statement's own TRACE.

## Notes

- **Ruling: F-05**, and **R-20**, which makes the packet's interim the kernel convention: no QUALIFIED_BY type; a qualification is `HAS_EVIDENCE {role: 'QUALIFIES'}` to the qualifier's locator plus qualifier prefixes (`population:`, `individual-variation:`, `dose-basis:`). D9 K-2 is closed.

## Source

- `release:query-catalog/catalog.json#D9/CQ-CL-03` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/CQ-CL-03 --json`)
