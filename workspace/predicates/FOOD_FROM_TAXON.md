---
id: "pred:FOOD_FROM_TAXON"
kind: "predicate"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#FOOD_FROM_TAXON"]
aliases: ["food from taxon"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:5d28e2744e056a024337539dff546c1ee1c3d497982317daf977dcd8cc92daea"
---
# Predicate FOOD_FROM_TAXON

| | |
| --- | --- |
| id | `pred:FOOD_FROM_TAXON` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D12](../modules/D12.md) |
| subject types | [FoodItem](../nodes/FoodItem.md) |
| object types | [Taxon](../nodes/Taxon.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D12-34` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'FOOD_FROM_TAXON'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named FOOD_FROM_TAXON.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#FOOD_FROM_TAXON`
