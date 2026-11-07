---
id: "pred:CITES_CONTENT"
kind: "predicate"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CITES_CONTENT"]
aliases: ["cites content"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:1308bd5feb7d281abade46d46962de541aa19c3ceb140eb7df9512b83eae3ea5"
---
# Predicate CITES_CONTENT

| | |
| --- | --- |
| id | `pred:CITES_CONTENT` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D9](../modules/D9.md) |
| subject types | (none) |
| object types | [MediaWork](../nodes/MediaWork.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D9-12` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'CITES_CONTENT'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named CITES_CONTENT.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CITES_CONTENT`
