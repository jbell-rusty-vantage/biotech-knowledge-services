---
id: "pattern:D9/Q-D9-19#drop"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/Q-D9-19#drop"]
aliases: ["d9/q-d9-19#drop","Q-D9-19"]
capabilities: ["get","pattern","status:unsupported"]
cardDigest: "sha256:99d8836062adc9a3dc70c0ead29a559a07659efb98a37d386ac8f8257589235a"
---
# Pattern D9/Q-D9-19#drop

| | |
| --- | --- |
| id | `pattern:D9/Q-D9-19#drop` |
| module | [D9](../../modules/D9.md) |
| status | **unsupported** — requires GDS, an optional analytics capability absent from the core release (OD-22); the projection source query is EXPLAIN-checked where it can be rewritten, algorithm/drop calls are not validated |
| questions | `Q-D9-19` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · gds |
| statement digest | `sha256:f408977a5ede8bc11e151edae34c7b90fa013b0c9587ef3473d1f7a7d7d6e249` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | (none) |
| validation | EXPLAIN skipped on 5.26.31 community; result assertions not-run (unsupported); gds-unavailable: CALL gds.* needs the optional GDS plugin (OD-22), not installed on the Community baseline |
| known gaps | MD-D9-03(c): the question weights retellings by accepted RETELLING_FIDELITY matches (deduplicated) as well as DERIVED_FROM; this statement counts DERIVED_FROM only. Not rewritten here (needs a validated statement); the D9 owner's choice. |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id Q-D9-19#drop
CALL gds.graph.drop('d9-retelling-' + $frontierUid, false) YIELD graphName
RETURN graphName
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `frontierUid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `graphName`

## Temporal notes

- refresh cadence: monthly per curated frontier (about 25, D13); drop the in-memory graph after the run.
- bitemporal episode needed on: none.

## Evidence and provenance notes

- trace: each score's inputs are the retold occurrences (`DERIVED_FROM`), each traceable by TRACE; the PROJECTION Activity records `methodVersion` `d9-influence/pagerank-v1`, frontier, window and the input digest.

## Notes

- **Ruling: F-05** (label). The owner removed `CYPHER 25`.

## Source

- `release:query-catalog/catalog.json#D9/Q-D9-19#drop` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/Q-D9-19#drop --json`)
