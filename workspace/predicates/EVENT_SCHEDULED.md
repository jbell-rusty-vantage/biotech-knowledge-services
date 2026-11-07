---
id: "pred:EVENT_SCHEDULED"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#EVENT_SCHEDULED"]
aliases: ["event scheduled"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:d6923f474047316060abc3052bc8913124bb70a83f70386082b7ed20eeb296e8"
---
# Predicate EVENT_SCHEDULED

| | |
| --- | --- |
| id | `pred:EVENT_SCHEDULED` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-TM-03`, `Q-D13-11` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'EVENT_SCHEDULED'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named EVENT_SCHEDULED.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#EVENT_SCHEDULED`
