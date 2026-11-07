---
id: "pred:LISTING_COVERS_FACILITY_OF"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#LISTING_COVERS_FACILITY_OF"]
aliases: ["listing covers facility of"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:ec2a60394f2cf858203b1ecd6d90551b448722e905ebfd6519d3eea5845a8469"
---
# Predicate LISTING_COVERS_FACILITY_OF

| | |
| --- | --- |
| id | `pred:LISTING_COVERS_FACILITY_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | (none) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-MF-06` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'LISTING_COVERS_FACILITY_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named LISTING_COVERS_FACILITY_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#LISTING_COVERS_FACILITY_OF`
