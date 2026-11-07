---
id: "pred:PLANT_PART"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PLANT_PART"]
aliases: ["plant part"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:81ba4d8df8930665e8170aee91b144283e4d728fed39ef049f7cf6e57e959391"
---
# Predicate PLANT_PART

| | |
| --- | --- |
| id | `pred:PLANT_PART` |
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

- `release:vocabularies/predicates.yaml#PLANT_PART`
