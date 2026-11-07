---
id: "pred:PRESENTED_AT_CONFERENCE"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PRESENTED_AT_CONFERENCE"]
aliases: ["presented at conference"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:c10aff2e260164c45f043e25a6aff8703694fc7cdc68b9785f17dd6e65eb9e0e"
---
# Predicate PRESENTED_AT_CONFERENCE

| | |
| --- | --- |
| id | `pred:PRESENTED_AT_CONFERENCE` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | [Channel](../nodes/Channel.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D13-25` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'PRESENTED_AT_CONFERENCE'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named PRESENTED_AT_CONFERENCE.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#PRESENTED_AT_CONFERENCE`
