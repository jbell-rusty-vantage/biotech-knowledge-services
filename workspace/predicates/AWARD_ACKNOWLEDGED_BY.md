---
id: "pred:AWARD_ACKNOWLEDGED_BY"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#AWARD_ACKNOWLEDGED_BY"]
aliases: ["award acknowledged by"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:c0cb089a5cb67c31c22661833ea220a74c44ad5d60585a509fa0ed2cc2d80d6c"
---
# Predicate AWARD_ACKNOWLEDGED_BY

| | |
| --- | --- |
| id | `pred:AWARD_ACKNOWLEDGED_BY` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Award](../nodes/Award.md) |
| object types | [Source](../nodes/Source.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'AWARD_ACKNOWLEDGED_BY'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named AWARD_ACKNOWLEDGED_BY.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#AWARD_ACKNOWLEDGED_BY`
