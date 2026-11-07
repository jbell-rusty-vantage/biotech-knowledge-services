---
id: "pred:EVENT_EFFECTIVE"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#EVENT_EFFECTIVE"]
aliases: ["event effective"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:e8574bb1548b025f43d86faa98fe6f92a15458184142e4d8aab1916b2965b5db"
---
# Predicate EVENT_EFFECTIVE

| | |
| --- | --- |
| id | `pred:EVENT_EFFECTIVE` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | (none) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-TM-03` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'EVENT_EFFECTIVE'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named EVENT_EFFECTIVE.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#EVENT_EFFECTIVE`
