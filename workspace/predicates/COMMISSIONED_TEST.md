---
id: "pred:COMMISSIONED_TEST"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#COMMISSIONED_TEST"]
aliases: ["commissioned test"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:ebb3a2dd18d2cf46b20b9b7d30ece00342dffc7b6baba3b5a4f474d625526ff7"
---
# Predicate COMMISSIONED_TEST

| | |
| --- | --- |
| id | `pred:COMMISSIONED_TEST` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Organization](../nodes/Organization.md) |
| object types | [QualityResult](../nodes/QualityResult.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'COMMISSIONED_TEST'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named COMMISSIONED_TEST.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#COMMISSIONED_TEST`
