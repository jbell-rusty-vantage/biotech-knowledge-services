---
id: "pred:EVENT_OCCURRED"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#EVENT_OCCURRED"]
aliases: ["event occurred"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:379e3cfa458d106fff27e0542a1c492cf6777ffb16bd0529fe0a83c4d8cac191"
---
# Predicate EVENT_OCCURRED

| | |
| --- | --- |
| id | `pred:EVENT_OCCURRED` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-EV-05`, `CQ-TM-01`, `CQ-TM-03`, `Q-D13-11`, `Q-D13-22` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'EVENT_OCCURRED'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named EVENT_OCCURRED.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#EVENT_OCCURRED`
