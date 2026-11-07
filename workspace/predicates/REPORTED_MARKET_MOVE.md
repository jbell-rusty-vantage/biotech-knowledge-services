---
id: "pred:REPORTED_MARKET_MOVE"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REPORTED_MARKET_MOVE"]
aliases: ["reported market move"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:4efbf13772c99cf816ffa8d66af648c8a2b403895eb49d635919ce518584655c"
---
# Predicate REPORTED_MARKET_MOVE

| | |
| --- | --- |
| id | `pred:REPORTED_MARKET_MOVE` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D13-14`, `Q-D13-21` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'REPORTED_MARKET_MOVE'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named REPORTED_MARKET_MOVE.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REPORTED_MARKET_MOVE`
