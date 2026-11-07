---
id: "pred:SOURCED_FROM_COUNTRY"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#SOURCED_FROM_COUNTRY"]
aliases: ["sourced from country"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:d6eef0efebc00913950fc92814c4e71c30ad4c9124f6e508f9f0f9e45fc1f89d"
---
# Predicate SOURCED_FROM_COUNTRY

| | |
| --- | --- |
| id | `pred:SOURCED_FROM_COUNTRY` |
| kind | **field** |
| route | **field** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [IngredientMaterial](../nodes/IngredientMaterial.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

FIELD predicate: an Assertion certifying a node field; the value is written to the node and the Assertion carries its evidence.

## Write route

Proposal kinds: `node.upsert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#SOURCED_FROM_COUNTRY`
