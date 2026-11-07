---
id: "pred:HAS_RECIPE_INGREDIENT"
kind: "predicate"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_RECIPE_INGREDIENT"]
aliases: ["has recipe ingredient","PREPARED_WITH","prepared with"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:c33a604995ec873da44325fe7beba3a1af749b8057912e3a1f3ff67131774994"
---
# Predicate HAS_RECIPE_INGREDIENT

| | |
| --- | --- |
| id | `pred:HAS_RECIPE_INGREDIENT` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D12](../modules/D12.md) |
| subject types | [FoodItem](../nodes/FoodItem.md), [Product](../nodes/Product.md) |
| object types | [FoodItem](../nodes/FoodItem.md) |
| literal forms | `valueNumber` |
| qualifiers | (none) |
| aliases | [PREPARED_WITH](PREPARED_WITH.md) |
| questions | `Q-D12-05` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_RECIPE_INGREDIENT`
