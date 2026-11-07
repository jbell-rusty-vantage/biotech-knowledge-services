---
id: "pred:CAUSES_ADVERSE_EFFECT"
kind: "predicate"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CAUSES_ADVERSE_EFFECT"]
aliases: ["causes adverse effect","ASSOCIATED_WITH_ADVERSE_EFFECT","REPORTS_ADVERSE_EXPERIENCE","associated with adverse effect","reports adverse experience"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:89dd212e38dfdf64c1977b7f72a3163a8fbaed6d379ab256f50b0d782fdc9937"
---
# Predicate CAUSES_ADVERSE_EFFECT

| | |
| --- | --- |
| id | `pred:CAUSES_ADVERSE_EFFECT` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D5](../modules/D5.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [FoodCategory](../nodes/FoodCategory.md), [FoodItem](../nodes/FoodItem.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Intervention](../nodes/Intervention.md), [Product](../nodes/Product.md) |
| object types | [Condition](../nodes/Condition.md) |
| literal forms | `valueNumber`, `valueString` |
| qualifiers | `context`, `dose`, `population`, `route`, `schedule`, `scheme`, `severity`, `sourceKind` · required `population` |
| aliases | [ASSOCIATED_WITH_ADVERSE_EFFECT](ASSOCIATED_WITH_ADVERSE_EFFECT.md), [REPORTS_ADVERSE_EXPERIENCE](REPORTS_ADVERSE_EXPERIENCE.md) |
| questions | `CQ-RC-06`, `Q-D10-08`, `Q-D10-24`, `Q-D11-18`, `Q-D12-03`, `Q-D2-15`, `Q-D5-02`, `Q-D5-06`, `Q-D5-07`, `Q-D5-09`, `Q-D5-16`, `Q-D5-20`, `Q-D5-24`, `Q-D5-26`, `Q-D9-11` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`, `valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CAUSES_ADVERSE_EFFECT`
