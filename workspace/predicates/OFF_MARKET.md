---
id: "pred:OFF_MARKET"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#OFF_MARKET"]
aliases: ["off market"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:33918407d0b7794a6dd648790c2028b2f932056af206c9a3fdfb1655768d2dd3"
---
# Predicate OFF_MARKET

| | |
| --- | --- |
| id | `pred:OFF_MARKET` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [LabelVersion](../nodes/LabelVersion.md), [Product](../nodes/Product.md) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D6-19` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'OFF_MARKET'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named OFF_MARKET.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#OFF_MARKET`
