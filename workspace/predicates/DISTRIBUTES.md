---
id: "pred:DISTRIBUTES"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DISTRIBUTES"]
aliases: ["distributes","OFFERS_FOR_SALE","offers for sale"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:62f81d36745f924676c3cdd7bd4139de35b230ad2d08fe0b5d5ddad1e4fc3620"
---
# Predicate DISTRIBUTES

| | |
| --- | --- |
| id | `pred:DISTRIBUTES` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Organization](../nodes/Organization.md) |
| object types | [Product](../nodes/Product.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | [OFFERS_FOR_SALE](OFFERS_FOR_SALE.md) |
| questions | `CQ-CL-05`, `CQ-CL-08`, `CQ-MF-01`, `Q-D10-21`, `Q-D9-01`, `Q-K-15` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'DISTRIBUTES'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named DISTRIBUTES.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DISTRIBUTES`
