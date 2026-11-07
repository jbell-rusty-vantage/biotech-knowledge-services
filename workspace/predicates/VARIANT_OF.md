---
id: "pred:VARIANT_OF"
kind: "predicate"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#VARIANT_OF"]
aliases: ["variant of"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:a239e026101f1e0334eb04a85bb9804f0e78aaddbb573d0ca14da96cd85c7b6f"
---
# Predicate VARIANT_OF

| | |
| --- | --- |
| id | `pred:VARIANT_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D12](../modules/D12.md) |
| subject types | [FoodItem](../nodes/FoodItem.md) |
| object types | [FoodItem](../nodes/FoodItem.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D12-02` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'VARIANT_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named VARIANT_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#VARIANT_OF`
