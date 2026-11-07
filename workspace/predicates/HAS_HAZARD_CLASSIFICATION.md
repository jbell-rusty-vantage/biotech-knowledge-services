---
id: "pred:HAS_HAZARD_CLASSIFICATION"
kind: "predicate"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_HAZARD_CLASSIFICATION"]
aliases: ["has hazard classification"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:c0ef887ee689c110027aec6a7a700b39fc94c645f0e6d2bacc7467474300f41d"
---
# Predicate HAS_HAZARD_CLASSIFICATION

| | |
| --- | --- |
| id | `pred:HAS_HAZARD_CLASSIFICATION` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D12](../modules/D12.md) |
| subject types | [FoodCategory](../nodes/FoodCategory.md), [FoodItem](../nodes/FoodItem.md) |
| object types | (none) |
| literal forms | `valueNumber`, `valueString` (unitCode %) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D12-08`, `Q-D12-15` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`, `valueString`, unit unitCode %) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_HAZARD_CLASSIFICATION`
