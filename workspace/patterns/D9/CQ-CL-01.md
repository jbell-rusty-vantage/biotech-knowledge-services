---
id: "pattern:D9/CQ-CL-01"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/CQ-CL-01"]
aliases: ["d9/cq-cl-01","CQ-CL-01"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:b4dc55284e71f2d3661f316884366cdff2a4c65a3732dd5d70c34c99d379c211"
---
# Pattern D9/CQ-CL-01

| | |
| --- | --- |
| id | `pattern:D9/CQ-CL-01` |
| module | [D9](../../modules/D9.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-CL-01` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:4b13c152456ff1f96255c28e9e96af784b4ec8961fd6025381fb37f58a065d16` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `entity_uid`, `uid_MediaWork`, `uid_exists_MediaWork`, `uid_type_MediaWork` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-CL-01
MATCH (s:Entity {uid: $speakerUid})<-[:ASSERTED_BY]-(o:Assertion {assertionKind: 'CLAIM'})-[:OCCURS_IN]->(w:MediaWork {uid: $workUid})
WHERE o.recordedTo IS NULL
MATCH (o)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
WHERE ev.role IN ['SUPPORTS', 'QUALIFIES']
OPTIONAL MATCH (src)-[:RENDITION_OF]->(rw:MediaWork)
RETURN o.uid AS occurrence, o.proposition, o.speechAct, ev.role, loc.selectorKind, loc.exact, loc.startOffset, loc.endOffset,
       loc.mediaStartSeconds, loc.mediaEndSeconds, loc.speakerLabelInSource, snap.contentHash, snap.retrievedAt, snap.captureCompleteness,
       src.canonicalUri, src.genre, rw.uid AS renditionOfWork,
       COLLECT { MATCH (adj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(o) WHERE adj.recordedTo IS NULL
                 RETURN adj {.uid, .verdict, .policyOutcome} } AS captureFidelity
ORDER BY loc.startOffset, loc.mediaStartSeconds
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `speakerUid` | string | `^hu:` | uid lookup |
| `workUid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `occurrence`, `o.proposition`, `o.speechAct`, `ev.role`, `loc.selectorKind`, `loc.exact`, `loc.startOffset`, `loc.endOffset`, `loc.mediaStartSeconds`, `loc.mediaEndSeconds`, `loc.speakerLabelInSource`, `snap.contentHash`, `snap.retrievedAt`, `snap.captureCompleteness`, `src.canonicalUri`, `src.genre`, `renditionOfWork`, `captureFidelity`

## Temporal notes

- bitemporal episode needed on: none (OCCURS_IN is part of the immutable occurrence record).

## Evidence and provenance notes

- trace: the row is the trace (locator, snapshot digest, rendition URI, capture-fidelity verdict). A re-cut's evidence shows `renditionOfWork` ≠ `w` (the re-cut REPUBLISHES `w`).

## Notes

- **Ruling: F-05.** `ClaimOccurrence` → `Assertion {assertionKind: 'CLAIM'}`.

## Source

- `release:query-catalog/catalog.json#D9/CQ-CL-01` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/CQ-CL-01 --json`)
