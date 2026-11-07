---
id: "pred:CITES_AS_SUPPORT"
kind: "predicate"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CITES_AS_SUPPORT"]
aliases: ["cites as support"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:3fa1857ab6807ca0f5114c0d909ddad51b80d55e526f3b93b4cd910a5e256158"
---
# Predicate CITES_AS_SUPPORT

| | |
| --- | --- |
| id | `pred:CITES_AS_SUPPORT` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [K](../modules/K.md) |
| subject types | (none) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'CITES_AS_SUPPORT'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named CITES_AS_SUPPORT.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CITES_AS_SUPPORT`
