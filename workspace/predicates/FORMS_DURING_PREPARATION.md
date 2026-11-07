---
id: "pred:FORMS_DURING_PREPARATION"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#FORMS_DURING_PREPARATION"]
aliases: ["forms during preparation"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:abf6c5ef2bb4023d1f09916e102ab30d5e346744cfbe71b4a6f81383d93253c2"
---
# Predicate FORMS_DURING_PREPARATION

| | |
| --- | --- |
| id | `pred:FORMS_DURING_PREPARATION` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| object types | [FoodCategory](../nodes/FoodCategory.md), [FoodItem](../nodes/FoodItem.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D12-03` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'FORMS_DURING_PREPARATION'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named FORMS_DURING_PREPARATION.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#FORMS_DURING_PREPARATION`
