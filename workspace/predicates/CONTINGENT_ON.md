---
id: "pred:CONTINGENT_ON"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CONTINGENT_ON"]
aliases: ["contingent on"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:6a068f0e0769d3d25c0ede0110fa7a7e1ec77b7202462717588c82a934c359d7"
---
# Predicate CONTINGENT_ON

| | |
| --- | --- |
| id | `pred:CONTINGENT_ON` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | [Study](../nodes/Study.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D13-12` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'CONTINGENT_ON'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named CONTINGENT_ON.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CONTINGENT_ON`
