---
id: "pred:HAS_MIXTURE_COMPONENT"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_MIXTURE_COMPONENT"]
aliases: ["has mixture component"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:e0d94a924dc56430e333bef95e43a7a15bdcaf92d482822b86a9831b2ae306db"
---
# Predicate HAS_MIXTURE_COMPONENT

| | |
| --- | --- |
| id | `pred:HAS_MIXTURE_COMPONENT` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [IngredientMaterial](../nodes/IngredientMaterial.md) |
| object types | [IngredientMaterial](../nodes/IngredientMaterial.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'HAS_MIXTURE_COMPONENT'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named HAS_MIXTURE_COMPONENT.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_MIXTURE_COMPONENT`
