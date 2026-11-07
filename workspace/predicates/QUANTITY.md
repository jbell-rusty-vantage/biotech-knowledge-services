---
id: "pred:QUANTITY"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#QUANTITY"]
aliases: ["quantity"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:efefb8c8f34ea46c28b638546917b93ada1feb6a12e9e439ef6c5e9b9cfa2e1d"
---
# Predicate QUANTITY

| | |
| --- | --- |
| id | `pred:QUANTITY` |
| kind | **field** |
| route | **field** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [InterventionComponent](../nodes/InterventionComponent.md) |
| object types | (none) |
| literal forms | `valueNumber` |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

FIELD predicate: an Assertion certifying a node field (`InterventionComponent.quantity`); the value is written to the node and the Assertion carries its evidence.

## Write route

Proposal kinds: `node.upsert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#QUANTITY`
