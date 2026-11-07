---
id: "pattern:K/Q-K-12#carrier"
kind: "pattern"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#K/Q-K-12#carrier"]
aliases: ["k/q-k-12#carrier","Q-K-12"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:6991cda5a333fa7f9e898b32f611d901d6dd4879a9597a509fec5720cd8316de"
---
# Pattern K/Q-K-12#carrier

| | |
| --- | --- |
| id | `pattern:K/Q-K-12#carrier` |
| module | [K](../../modules/K.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `Q-K-12` ([K question set](../questions/K.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:a55241f7df154d4e99b24364b52f49867be4692919c2aa6d9d21b75b68c81165` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `identifier_key`, `identifier_scheme_value` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions executed: result assertions: read-enterprise.integration.test.ts |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
MATCH (i:Identifier {scheme: $scheme, value: $value})<-[h:HAS_IDENTIFIER]-(x:Entity)
WHERE h.recordedTo IS NULL
RETURN x.uid AS uid, x.name AS name, i.issuer AS issuer, h.isPrimary AS isPrimary, h.assertionUid AS authorizedBy
ORDER BY uid, issuer
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `scheme` | string |  | default |
| `value` | string |  | default |

## Output contract

Columns: `uid`, `name`, `issuer`, `isPrimary`, `authorizedBy`

## Temporal notes

(none)

## Evidence and provenance notes

(none)

## Notes

- which entity carries identifier (scheme, value): normalized value; one Identifier identifies at most one record (R-42); several issuers are listed, never merged
- typed equivalent: resolve {mentions: [{identifiers: [{scheme, value}]}]}

## Source

- `release:query-catalog/catalog.json#K/Q-K-12#carrier` (machine form: `patterns/catalog.json`, `bks-schema pattern --template K/Q-K-12#carrier --json`)
