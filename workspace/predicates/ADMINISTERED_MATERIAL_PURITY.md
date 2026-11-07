---
id: "pred:ADMINISTERED_MATERIAL_PURITY"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ADMINISTERED_MATERIAL_PURITY"]
aliases: ["administered material purity"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:64200865f12660f0e2a4a5d50685694aaf7da910568cf4c06469eb3d07a44ae8"
---
# Predicate ADMINISTERED_MATERIAL_PURITY

| | |
| --- | --- |
| id | `pred:ADMINISTERED_MATERIAL_PURITY` |
| kind | **field** |
| route | **field** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [InterventionComponent](../nodes/InterventionComponent.md) |
| object types | [Assertion](../nodes/Assertion.md) |
| literal forms | `valueNumber` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-ID-06`, `Q-D1-08` |

## Typed edge or Assertion only

FIELD predicate: an Assertion certifying a node field; the value is written to the node and the Assertion carries its evidence.

## Write route

Proposal kinds: `node.upsert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ADMINISTERED_MATERIAL_PURITY`
