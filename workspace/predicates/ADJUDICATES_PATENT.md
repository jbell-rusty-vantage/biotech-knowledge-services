---
id: "pred:ADJUDICATES_PATENT"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ADJUDICATES_PATENT"]
aliases: ["adjudicates patent"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:738aecefeaa377da831a894c6bee5277a76a7d5c9e0335587c5bf7ec874939b2"
---
# Predicate ADJUDICATES_PATENT

| | |
| --- | --- |
| id | `pred:ADJUDICATES_PATENT` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [RegulatoryRecord](../nodes/RegulatoryRecord.md) |
| object types | [Patent](../nodes/Patent.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'ADJUDICATES_PATENT'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named ADJUDICATES_PATENT.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ADJUDICATES_PATENT`
