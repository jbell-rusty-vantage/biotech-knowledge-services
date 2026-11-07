---
id: "pred:REVISES_DETERMINATION_OF"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REVISES_DETERMINATION_OF"]
aliases: ["revises determination of"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:0e259f8922cc36cedafaad1e3f6446c89445c8cc06abb42787f05def53283de9"
---
# Predicate REVISES_DETERMINATION_OF

| | |
| --- | --- |
| id | `pred:REVISES_DETERMINATION_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [RegulatoryRecord](../nodes/RegulatoryRecord.md) |
| object types | [RegulatoryRecord](../nodes/RegulatoryRecord.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'REVISES_DETERMINATION_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named REVISES_DETERMINATION_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REVISES_DETERMINATION_OF`
