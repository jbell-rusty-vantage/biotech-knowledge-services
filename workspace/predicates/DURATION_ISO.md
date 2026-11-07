---
id: "pred:DURATION_ISO"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DURATION_ISO"]
aliases: ["duration iso"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:efcd2981b48f41b2bb70acaf18ac10b8c13425484681f3f5ad72362f080cc6f7"
---
# Predicate DURATION_ISO

| | |
| --- | --- |
| id | `pred:DURATION_ISO` |
| kind | **field** |
| route | **field** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [InterventionComponent](../nodes/InterventionComponent.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

FIELD predicate: an Assertion certifying a node field (`InterventionComponent.durationIso`); the value is written to the node and the Assertion carries its evidence.

## Write route

Proposal kinds: `node.upsert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DURATION_ISO`
