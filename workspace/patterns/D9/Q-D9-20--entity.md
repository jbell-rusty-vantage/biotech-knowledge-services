---
id: "pattern:D9/Q-D9-20#entity"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/Q-D9-20#entity"]
aliases: ["d9/q-d9-20#entity","Q-D9-20"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:45cccdb13b7a354900a927d77818153c68c0506466d0bbb77f2ed171c548eb69"
---
# Pattern D9/Q-D9-20#entity

| | |
| --- | --- |
| id | `pattern:D9/Q-D9-20#entity` |
| module | [D9](../../modules/D9.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `Q-D9-20` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:ce7e0fbbc8d608ba29eb79bc858d193484c49a0b7b804bfb151079e8ac00bc9f` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `entity_uid` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id Q-D9-20#entity
MATCH (x:Entity {uid: $entityUid})<-[m:MENTIONS]-(c:Chunk)                 // derived, entity-link/vN; never evidence (R-27)
MATCH (c)-[:COVERS_LOCATOR]->(loc:SourceLocator)<-[ev:HAS_EVIDENCE {role: 'SUPPORTS'}]-(o:Assertion {assertionKind: 'CLAIM'})
WHERE o.status = 'ACCEPTED' AND o.recordedTo IS NULL
MATCH (loc)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:CHUNK_OF]-(c)
MATCH (snap)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (o)<-[:ASSESSES]-(adj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[av:HAS_EVIDENCE]->(loc)
RETURN m.derivationRule, c.text, o.uid AS occurrence, o.proposition, o.speechAct, loc.exact, loc.selectorDigest, snap.contentHash, src.canonicalUri,
       adj.verdict, av.origin
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `entityUid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `m.derivationRule`, `c.text`, `occurrence`, `o.proposition`, `o.speechAct`, `loc.exact`, `loc.selectorDigest`, `snap.contentHash`, `src.canonicalUri`, `adj.verdict`, `av.origin`

## Temporal notes

- bitemporal episode needed on: none.

## Evidence and provenance notes

- trace: chunk → locator → occurrence → snapshot digest → source; the verifier's adjudication HAS_EVIDENCE on the **same** locator (`selectorDigest` equal). FC-1: "What does David Sinclair say he takes for NAD?" → transcript chunk covering [71636, 71692) → REPORTS_PRACTICE occurrence → snapshot `3158acee…`.

## Notes

- **Ruling: F-05** (label), both blocks. The owner replaced the 2026.01+ `SEARCH` clause with `db.index.vector.queryNodes` (the `SEARCH` form stays a comment, as final P-04a) and removed `CYPHER 25`. The source URI is added to the chain so the row carries the full TRACE (chunk → locator → occurrence → snapshot → source); the chunk itself is never cited.

## Source

- `release:query-catalog/catalog.json#D9/Q-D9-20#entity` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/Q-D9-20#entity --json`)
