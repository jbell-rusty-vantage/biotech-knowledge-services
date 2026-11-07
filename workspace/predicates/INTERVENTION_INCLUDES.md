---
id: "pred:INTERVENTION_INCLUDES"
kind: "predicate"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INTERVENTION_INCLUDES"]
aliases: ["intervention includes"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:db894d8d6cb46a9fcef2def3f58dc2a3da321e868f6c7f654a2a135535d39503"
---
# Predicate INTERVENTION_INCLUDES

| | |
| --- | --- |
| id | `pred:INTERVENTION_INCLUDES` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D5](../modules/D5.md) |
| subject types | [Intervention](../nodes/Intervention.md) |
| object types | [Intervention](../nodes/Intervention.md) |
| literal forms | (none) |
| qualifiers | `dose`, `role` |
| aliases | (none) |
| questions | `Q-D5-25`, `Q-D5-28` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'INTERVENTION_INCLUDES'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named INTERVENTION_INCLUDES.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INTERVENTION_INCLUDES`
