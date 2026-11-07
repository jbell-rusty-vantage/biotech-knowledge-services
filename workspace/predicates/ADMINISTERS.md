---
id: "pred:ADMINISTERS"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ADMINISTERS"]
aliases: ["administers"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:f74f521f48a42b3b90bee830ebcba9814a4c22b5839956c0b8cf00f4333450c1"
---
# Predicate ADMINISTERS

| | |
| --- | --- |
| id | `pred:ADMINISTERS` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [InterventionComponent](../nodes/InterventionComponent.md) |
| object types | [DietaryPattern](../nodes/DietaryPattern.md), [FoodItem](../nodes/FoodItem.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Intervention](../nodes/Intervention.md), [ProductVariant](../nodes/ProductVariant.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-ST-01`, `CQ-ST-02`, `Q-D11-03`, `Q-D3-04`, `Q-D3-05`, `Q-D3-06` |

## Typed edge or Assertion only

A typed edge exists: [ADMINISTERS](../relationships/ADMINISTERS.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'ADMINISTERS'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ADMINISTERS`
