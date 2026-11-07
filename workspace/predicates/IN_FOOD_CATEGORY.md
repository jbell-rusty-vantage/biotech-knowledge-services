---
id: "pred:IN_FOOD_CATEGORY"
kind: "predicate"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#IN_FOOD_CATEGORY"]
aliases: ["in food category"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:545907d1f40c9b0e29f97135d09db796dc7371f3d72e72ba0b178b22bc7f98e6"
---
# Predicate IN_FOOD_CATEGORY

| | |
| --- | --- |
| id | `pred:IN_FOOD_CATEGORY` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D12](../modules/D12.md) |
| subject types | [FoodItem](../nodes/FoodItem.md), [Product](../nodes/Product.md) |
| object types | [FoodCategory](../nodes/FoodCategory.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D12-08`, `Q-D12-14`, `Q-D12-15`, `Q-D12-26`, `Q-D12-28`, `Q-D12-31` |

## Typed edge or Assertion only

A typed edge exists: [IN_FOOD_CATEGORY](../relationships/IN_FOOD_CATEGORY.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'IN_FOOD_CATEGORY'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#IN_FOOD_CATEGORY`
