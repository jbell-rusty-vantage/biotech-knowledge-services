---
id: "pred:PATTERN_COMPONENT"
kind: "predicate"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PATTERN_COMPONENT"]
aliases: ["pattern component"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:ca9315a187e552f37a3264e0a11e9e76f0364bdef30723c06687ec26c19584d4"
---
# Predicate PATTERN_COMPONENT

| | |
| --- | --- |
| id | `pred:PATTERN_COMPONENT` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D12](../modules/D12.md) |
| subject types | [DietaryPattern](../nodes/DietaryPattern.md) |
| object types | [Constituent](../nodes/Constituent.md), [FoodCategory](../nodes/FoodCategory.md), [FoodItem](../nodes/FoodItem.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D12-08`, `Q-D12-11`, `Q-D12-23`, `Q-D12-25` |

## Typed edge or Assertion only

A typed edge exists: [PATTERN_COMPONENT](../relationships/PATTERN_COMPONENT.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'PATTERN_COMPONENT'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#PATTERN_COMPONENT`
