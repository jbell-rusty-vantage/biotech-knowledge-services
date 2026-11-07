---
id: "pred:IMPLEMENTS_PUBLICATION"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#IMPLEMENTS_PUBLICATION"]
aliases: ["implements publication"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:03411080716e55f406626aede81d991ca5471fcb7da467b15e7eae56fdbd42fb"
---
# Predicate IMPLEMENTS_PUBLICATION

| | |
| --- | --- |
| id | `pred:IMPLEMENTS_PUBLICATION` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [AlgorithmVersion](../nodes/AlgorithmVersion.md) |
| object types | [Source](../nodes/Source.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D4-06`, `Q-D4-20` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'IMPLEMENTS_PUBLICATION'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named IMPLEMENTS_PUBLICATION.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#IMPLEMENTS_PUBLICATION`
