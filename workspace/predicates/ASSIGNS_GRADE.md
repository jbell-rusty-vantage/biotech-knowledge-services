---
id: "pred:ASSIGNS_GRADE"
kind: "predicate"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ASSIGNS_GRADE"]
aliases: ["assigns grade"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:51c19346d628c57e1eb376fa224780d866f16946115c71f3d5d8680bc13c5b8c"
---
# Predicate ASSIGNS_GRADE

| | |
| --- | --- |
| id | `pred:ASSIGNS_GRADE` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D10](../modules/D10.md) |
| subject types | (none) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-24`, `Q-D10-07` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'ASSIGNS_GRADE'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named ASSIGNS_GRADE.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ASSIGNS_GRADE`
