---
id: "pred:EVENT_CANCELLED"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#EVENT_CANCELLED"]
aliases: ["event cancelled"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:760b27664d19a7de54fd4e753888a6bf67ce0f1e93938ce19e7120d545da53ef"
---
# Predicate EVENT_CANCELLED

| | |
| --- | --- |
| id | `pred:EVENT_CANCELLED` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | (none) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-TM-03`, `Q-D13-11` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'EVENT_CANCELLED'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named EVENT_CANCELLED.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#EVENT_CANCELLED`
