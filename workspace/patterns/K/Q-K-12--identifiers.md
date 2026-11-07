---
id: "pattern:K/Q-K-12#identifiers"
kind: "pattern"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#K/Q-K-12#identifiers"]
aliases: ["k/q-k-12#identifiers","Q-K-12"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:9d88b0c1df3a37b326546cb7180ec1b6ac638bc05e9a45f5e05b9cabdca3b386"
---
# Pattern K/Q-K-12#identifiers

| | |
| --- | --- |
| id | `pattern:K/Q-K-12#identifiers` |
| module | [K](../../modules/K.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `Q-K-12` ([K question set](../questions/K.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:9b06b3a1c952b962438ff6ef9dc97a8dd2eb115a65c3ec83166811eef6e8bfd2` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `entity_uid` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions executed: result assertions: read-enterprise.integration.test.ts |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
MATCH (x:Entity {uid: $uid})-[h:HAS_IDENTIFIER]->(i:Identifier)
RETURN i.scheme AS scheme, i.issuer AS issuer, i.value AS value, h.isPrimary AS isPrimary, h.validFrom AS validFrom, h.validTo AS validTo,
  h.recordedFrom AS recordedFrom, h.recordedTo AS recordedTo, h.assertionUid AS authorizedBy
ORDER BY scheme, issuer, value, recordedFrom
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `uid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `scheme`, `issuer`, `value`, `isPrimary`, `validFrom`, `validTo`, `recordedFrom`, `recordedTo`, `authorizedBy`

## Temporal notes

(none)

## Evidence and provenance notes

(none)

## Notes

- which identifiers X carries, from which issuer, valid when (all episodes, open and closed)
- typed equivalent: card {uid} -> identifiers (open episodes); resolve {identifiers} for the reverse lookup

## Source

- `release:query-catalog/catalog.json#K/Q-K-12#identifiers` (machine form: `patterns/catalog.json`, `bks-schema pattern --template K/Q-K-12#identifiers --json`)
