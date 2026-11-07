---
id: "pred:MARKED_WITH_PATENT"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MARKED_WITH_PATENT"]
aliases: ["marked with patent"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:ae417e326dc4fecbea76c7fb9f0ffb76a38d3696ce25a28e37920a38b98c8bcf"
---
# Predicate MARKED_WITH_PATENT

| | |
| --- | --- |
| id | `pred:MARKED_WITH_PATENT` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [Product](../nodes/Product.md) |
| object types | [Patent](../nodes/Patent.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D8-14` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'MARKED_WITH_PATENT'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named MARKED_WITH_PATENT.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MARKED_WITH_PATENT`
