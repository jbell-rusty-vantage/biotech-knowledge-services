---
id: "pred:DEPICTS"
kind: "predicate"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DEPICTS"]
aliases: ["depicts"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:8fc3db7ab5aa37a87d5b6d51cc46c8f34e763d9c23a7ee790d19af6f1664b20a"
---
# Predicate DEPICTS

| | |
| --- | --- |
| id | `pred:DEPICTS` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D9](../modules/D9.md) |
| subject types | [MediaWork](../nodes/MediaWork.md) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'DEPICTS'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named DEPICTS.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DEPICTS`
