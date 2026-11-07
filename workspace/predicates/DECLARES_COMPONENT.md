---
id: "pred:DECLARES_COMPONENT"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DECLARES_COMPONENT"]
aliases: ["declares component"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:8e9e697e93d81eb5a4a8a5d39f32c6a8ae1d263b087a4793f515747441037dd8"
---
# Predicate DECLARES_COMPONENT

| | |
| --- | --- |
| id | `pred:DECLARES_COMPONENT` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [LabelVersion](../nodes/LabelVersion.md) |
| object types | [Constituent](../nodes/Constituent.md), [FoodItem](../nodes/FoodItem.md), [IngredientMaterial](../nodes/IngredientMaterial.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-25`, `CQ-PF-01`, `CQ-PV-04`, `CQ-ST-02`, `Q-D1-19`, `Q-D10-07`, `Q-D6-02`, `Q-D6-08`, `Q-D6-09`, `Q-D6-11`, `Q-D6-12`, `Q-D6-21` |

## Typed edge or Assertion only

A typed edge exists: [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'DECLARES_COMPONENT'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DECLARES_COMPONENT`
