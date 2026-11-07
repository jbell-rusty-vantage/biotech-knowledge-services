---
id: "pattern:D9/Q-D9-19#projection"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/Q-D9-19#projection"]
aliases: ["d9/q-d9-19#projection","Q-D9-19"]
capabilities: ["get","pattern","status:unsupported"]
cardDigest: "sha256:f2728ffe6169f4828ebef5b073374ca427a19b35bcf719992bb39cdffbb9f988"
---
# Pattern D9/Q-D9-19#projection

| | |
| --- | --- |
| id | `pattern:D9/Q-D9-19#projection` |
| module | [D9](../../modules/D9.md) |
| status | **unsupported** — requires GDS, an optional analytics capability absent from the core release (OD-22); the projection source query is EXPLAIN-checked where it can be rewritten, algorithm/drop calls are not validated |
| questions | `Q-D9-19` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · gds-projection |
| statement digest | `sha256:d292465e8f500a1e30ed6f5bb3f355af27ccce3222e7c6fb3a3347f9a6eb5118` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `media_work_published`, `uid_Frontier`, `uid_exists_Frontier`, `uid_type_Frontier` |
| validation | EXPLAIN ok on 5.26.31 community (plan flags CartesianProduct); result assertions not-run (unsupported) |
| known gaps | MD-D9-03(c): the question weights retellings by accepted RETELLING_FIDELITY matches (deduplicated) as well as DERIVED_FROM; this statement counts DERIVED_FROM only. Not rewritten here (needs a validated statement); the D9 owner's choice. |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @gds
// @id Q-D9-19#projection
MATCH (f:Frontier {uid: $frontierUid})
MATCH (orig:Assertion)<-[:DERIVED_FROM]-(ret:Assertion {assertionKind: 'CLAIM'})-[:OCCURS_IN]->(w:MediaWork)
WHERE w.publishedAt >= datetime() - duration({months: 24}) AND ret.recordedTo IS NULL
  AND EXISTS { MATCH (ret)-[:HAS_SUBJECT|HAS_OBJECT]->(x)
               WHERE x = f OR EXISTS { (x)-[:ON_FRONTIER]->(f) } OR EXISTS { (x)<-[:INVOLVES]-(:Event)-[:ON_FRONTIER]->(f) } }
MATCH (orig)-[:ASSERTED_BY]->(source), (ret)-[:ASSERTED_BY]->(target)
WHERE source <> target AND (source:Person OR source:Channel) AND (target:Person OR target:Channel)
WITH source, target, count(*) AS weight
RETURN gds.graph.project('d9-retelling-' + $frontierUid, target, source, { relationshipProperties: { weight: weight } })
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `frontierUid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `gds.graph.project('' + $frontierUid, target, source, { relationshipProperties: { weight: weight } })`

## Temporal notes

- refresh cadence: monthly per curated frontier (about 25, D13); drop the in-memory graph after the run.
- bitemporal episode needed on: none.

## Evidence and provenance notes

- trace: each score's inputs are the retold occurrences (`DERIVED_FROM`), each traceable by TRACE; the PROJECTION Activity records `methodVersion` `d9-influence/pagerank-v1`, frontier, window and the input digest.

## Notes

- **Ruling: F-05** (label). The owner removed `CYPHER 25`.

## Source

- `release:query-catalog/catalog.json#D9/Q-D9-19#projection` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/Q-D9-19#projection --json`)
