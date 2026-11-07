---
id: "pred:DEVELOPED_WITH"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DEVELOPED_WITH"]
aliases: ["developed with"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:fdea06b112614079f59b148073257d0b2473f8fe6e38f5ec561c698822cd4570"
---
# Predicate DEVELOPED_WITH

| | |
| --- | --- |
| id | `pred:DEVELOPED_WITH` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [AlgorithmVersion](../nodes/AlgorithmVersion.md), [LabTest](../nodes/LabTest.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D4-20` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'DEVELOPED_WITH'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named DEVELOPED_WITH.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DEVELOPED_WITH`
