---
id: "pred:SUPPLIES_MATERIAL"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#SUPPLIES_MATERIAL"]
aliases: ["supplies material","EXCLUSIVE_SUPPLIER_OF","SOLE_SOURCE_SUPPLIER_DEPENDENCE","SOLE_SUPPLIER_OF","SUPPLIED_INGREDIENT","SUPPLIES","SUPPLIES_INGREDIENT","exclusive supplier of","sole source supplier dependence","sole supplier of","supplied ingredient","supplies","supplies ingredient"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:31f733f7207831d06f00cbac09e9d2a76c62bc1bf48f6807fdf3c8673f99ed35"
---
# Predicate SUPPLIES_MATERIAL

| | |
| --- | --- |
| id | `pred:SUPPLIES_MATERIAL` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Organization](../nodes/Organization.md) |
| object types | [IngredientMaterial](../nodes/IngredientMaterial.md) |
| literal forms | (none) |
| qualifiers | `buyer`, `exclusivity` |
| aliases | [EXCLUSIVE_SUPPLIER_OF](EXCLUSIVE_SUPPLIER_OF.md), [SOLE_SOURCE_SUPPLIER_DEPENDENCE](SOLE_SOURCE_SUPPLIER_DEPENDENCE.md), [SOLE_SUPPLIER_OF](SOLE_SUPPLIER_OF.md), [SUPPLIED_INGREDIENT](SUPPLIED_INGREDIENT.md), [SUPPLIES](SUPPLIES.md), [SUPPLIES_INGREDIENT](SUPPLIES_INGREDIENT.md) |
| questions | `CQ-CL-05`, `CQ-CL-08`, `CQ-MF-01`, `Q-D1-16`, `Q-D1-17`, `Q-D10-21`, `Q-D12-07`, `Q-D2-21`, `Q-D7-21`, `Q-D9-01`, `Q-K-15` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'SUPPLIES_MATERIAL'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named SUPPLIES_MATERIAL.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#SUPPLIES_MATERIAL`
