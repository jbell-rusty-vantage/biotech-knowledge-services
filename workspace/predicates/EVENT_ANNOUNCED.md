---
id: "pred:EVENT_ANNOUNCED"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#EVENT_ANNOUNCED"]
aliases: ["event announced"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:d174c93cd39e1aeee05005cd91763f70c05b95e0d7f59aa01b1dfacb5a330b01"
---
# Predicate EVENT_ANNOUNCED

| | |
| --- | --- |
| id | `pred:EVENT_ANNOUNCED` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-TM-03`, `Q-D13-22` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'EVENT_ANNOUNCED'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named EVENT_ANNOUNCED.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#EVENT_ANNOUNCED`
