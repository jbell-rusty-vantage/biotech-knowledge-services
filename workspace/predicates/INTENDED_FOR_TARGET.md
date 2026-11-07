---
id: "pred:INTENDED_FOR_TARGET"
kind: "predicate"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INTENDED_FOR_TARGET"]
aliases: ["intended for target"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:35e1f712bce8c9107a697d595ec2ade4aea9b0edb27fb8d03ee73915acd269af"
---
# Predicate INTENDED_FOR_TARGET

| | |
| --- | --- |
| id | `pred:INTENDED_FOR_TARGET` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D5](../modules/D5.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Device](../nodes/Device.md), [DietaryPattern](../nodes/DietaryPattern.md), [FoodCategory](../nodes/FoodCategory.md), [FoodItem](../nodes/FoodItem.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Intervention](../nodes/Intervention.md), [Protocol](../nodes/Protocol.md), [ProtocolEdition](../nodes/ProtocolEdition.md) |
| object types | [Target](../nodes/Target.md) |
| literal forms | (none) |
| qualifiers | `claimClass`, `population` · required `population` |
| aliases | (none) |
| questions | `CQ-RC-05`, `CQ-RC-06`, `Q-D10-01`, `Q-D10-03`, `Q-D10-08`, `Q-D10-24`, `Q-D12-09`, `Q-D12-11`, `Q-D12-32`, `Q-D4-18`, `Q-D5-01`, `Q-D5-02`, `Q-D5-03`, `Q-D5-06`, `Q-D5-07`, `Q-D5-14`, `Q-D5-15`, `Q-D5-16`, `Q-D5-20`, `Q-D6-03`, `Q-D7-24`, `Q-D8-18` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'INTENDED_FOR_TARGET'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named INTENDED_FOR_TARGET.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INTENDED_FOR_TARGET`
