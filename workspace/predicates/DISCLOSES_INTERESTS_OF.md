---
id: "pred:DISCLOSES_INTERESTS_OF"
kind: "predicate"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DISCLOSES_INTERESTS_OF"]
aliases: ["discloses interests of"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:f9c5e04600b032464c5d230f8eefb20f98e1c6c11d3065213f2a540644a8785d"
---
# Predicate DISCLOSES_INTERESTS_OF

| | |
| --- | --- |
| id | `pred:DISCLOSES_INTERESTS_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [K](../modules/K.md) |
| subject types | [Source](../nodes/Source.md) |
| object types | [Person](../nodes/Person.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D7-20` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'DISCLOSES_INTERESTS_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named DISCLOSES_INTERESTS_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DISCLOSES_INTERESTS_OF`
