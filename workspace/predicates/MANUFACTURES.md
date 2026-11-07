---
id: "pred:MANUFACTURES"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MANUFACTURES"]
aliases: ["manufactures","MANUFACTURES_MATERIAL","PROCESSED_INGREDIENT","manufactures material","processed ingredient"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:336372c89baf07b11f0d468f029675465718b30a48e70fa17c4ae5e535db0d56"
---
# Predicate MANUFACTURES

| | |
| --- | --- |
| id | `pred:MANUFACTURES` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Organization](../nodes/Organization.md) |
| object types | [IngredientMaterial](../nodes/IngredientMaterial.md), [Product](../nodes/Product.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | [MANUFACTURES_MATERIAL](MANUFACTURES_MATERIAL.md), [PROCESSED_INGREDIENT](PROCESSED_INGREDIENT.md) |
| questions | `CQ-CL-05`, `CQ-CL-08`, `CQ-MF-01`, `Q-D10-21`, `Q-D10-25`, `Q-D12-07`, `Q-D6-16`, `Q-D7-18`, `Q-D9-01`, `Q-K-15` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'MANUFACTURES'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named MANUFACTURES.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MANUFACTURES`
