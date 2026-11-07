---
id: "pattern:D9/Q-D9-20#vector"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/Q-D9-20#vector"]
aliases: ["d9/q-d9-20#vector","Q-D9-20"]
capabilities: ["get","pattern","status:unsupported"]
cardDigest: "sha256:80939b3937eeaadc59b8aeed989acaff358a1abe16d174be097e2b9f0d9647cf"
---
# Pattern D9/Q-D9-20#vector

| | |
| --- | --- |
| id | `pattern:D9/Q-D9-20#vector` |
| module | [D9](../../modules/D9.md) |
| status | **unsupported** — requires the optional capability vectors.native (disabled in this release: its index is optional and not installed); EXPLAIN ok on a database where the index exists |
| questions | `Q-D9-20` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:5722a6d5ea228433eb7999154046be6c6f45eb1f1ee2fb09d63e5dff7f3a6239` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `chunk_embedding` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions unsupported |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id Q-D9-20#vector
// 2026.01+ form: MATCH (c:Chunk) SEARCH c IN (VECTOR INDEX chunk_embedding FOR $questionEmbedding WHERE c.language = 'en' LIMIT 20) SCORE AS score
CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS c, score
WITH c, score WHERE c.language = 'en'
MATCH (c)-[:COVERS_LOCATOR]->(loc:SourceLocator)<-[ev:HAS_EVIDENCE {role: 'SUPPORTS'}]-(o:Assertion {assertionKind: 'CLAIM'})
WHERE o.status = 'ACCEPTED' AND o.recordedTo IS NULL
MATCH (loc)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:CHUNK_OF]-(c)
MATCH (snap)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (o)<-[:ASSESSES]-(adj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[av:HAS_EVIDENCE]->(loc)
RETURN score, c.text, o.uid AS occurrence, o.proposition, o.speechAct, loc.exact, loc.selectorDigest, snap.contentHash, src.canonicalUri,
       adj.verdict, av.origin
ORDER BY score DESC
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `questionEmbedding` | array<number> |  | name |

## Output contract

Columns: `score`, `c.text`, `occurrence`, `o.proposition`, `o.speechAct`, `loc.exact`, `loc.selectorDigest`, `snap.contentHash`, `src.canonicalUri`, `adj.verdict`, `av.origin`

## Temporal notes

(none)

## Evidence and provenance notes

(none)

## Notes

- **Ruling: F-05** (label), both blocks. The owner replaced the 2026.01+ `SEARCH` clause with `db.index.vector.queryNodes` (the `SEARCH` form stays a comment, as final P-04a) and removed `CYPHER 25`. The source URI is added to the chain so the row carries the full TRACE (chunk → locator → occurrence → snapshot → source); the chunk itself is never cited.

## Source

- `release:query-catalog/catalog.json#D9/Q-D9-20#vector` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/Q-D9-20#vector --json`)
