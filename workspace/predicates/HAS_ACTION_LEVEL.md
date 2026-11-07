---
id: "pred:HAS_ACTION_LEVEL"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_ACTION_LEVEL"]
aliases: ["has action level"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:c2bf694117911b411ab7dc19effcb78278076535e1e564be2832cd7c0c1f625d"
---
# Predicate HAS_ACTION_LEVEL

| | |
| --- | --- |
| id | `pred:HAS_ACTION_LEVEL` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| object types | [FoodCategory](../nodes/FoodCategory.md), [FoodItem](../nodes/FoodItem.md) |
| literal forms | `valueNumber` (unitCode) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D12-06`, `Q-D12-18` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`, unit unitCode) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_ACTION_LEVEL`
