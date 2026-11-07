---
id: "pred:CITES_AS_EVIDENCE"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CITES_AS_EVIDENCE"]
aliases: ["cites as evidence"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:ccef44bf8ece88886ec77462a034ed753d6810a673b9ab26d288a8d2e83d5556"
---
# Predicate CITES_AS_EVIDENCE

| | |
| --- | --- |
| id | `pred:CITES_AS_EVIDENCE` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [RegulatoryRecord](../nodes/RegulatoryRecord.md) |
| object types | [RegulatoryRecord](../nodes/RegulatoryRecord.md), [Study](../nodes/Study.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D8-15` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'CITES_AS_EVIDENCE'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named CITES_AS_EVIDENCE.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CITES_AS_EVIDENCE`
