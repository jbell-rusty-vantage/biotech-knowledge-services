---
id: "pred:FOOD_CONTAINS"
kind: "predicate"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#FOOD_CONTAINS"]
aliases: ["food contains"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:887352f944d86c8f07a5e3a279fb13c998687c19201b642b256d71fe96f5beae"
---
# Predicate FOOD_CONTAINS

| | |
| --- | --- |
| id | `pred:FOOD_CONTAINS` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D12](../modules/D12.md) |
| subject types | [FoodItem](../nodes/FoodItem.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Constituent](../nodes/Constituent.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-PF-01`, `Q-D1-02`, `Q-D1-03`, `Q-D1-11`, `Q-D1-12`, `Q-D1-15`, `Q-D1-19`, `Q-D1-24`, `Q-D10-07`, `Q-D12-01`, `Q-D12-02`, `Q-D12-20`, `Q-D12-21`, `Q-D12-24` |

## Typed edge or Assertion only

A typed edge exists: [FOOD_CONTAINS](../relationships/FOOD_CONTAINS.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'FOOD_CONTAINS'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#FOOD_CONTAINS`
