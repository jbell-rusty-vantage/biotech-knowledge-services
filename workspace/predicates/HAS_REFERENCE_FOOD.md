---
id: "pred:HAS_REFERENCE_FOOD"
kind: "predicate"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_REFERENCE_FOOD"]
aliases: ["has reference food"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:6a3f2f71913f4b5100ed88c80ea5fa6b5d90d279323ddb9302f0c9242a77e8f3"
---
# Predicate HAS_REFERENCE_FOOD

| | |
| --- | --- |
| id | `pred:HAS_REFERENCE_FOOD` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D12](../modules/D12.md) |
| subject types | [Product](../nodes/Product.md) |
| object types | [FoodItem](../nodes/FoodItem.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D12-03`, `Q-D12-04`, `Q-D12-05`, `Q-D12-30`, `Q-D12-34` |

## Typed edge or Assertion only

A typed edge exists: [HAS_REFERENCE_FOOD](../relationships/HAS_REFERENCE_FOOD.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'HAS_REFERENCE_FOOD'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_REFERENCE_FOOD`
