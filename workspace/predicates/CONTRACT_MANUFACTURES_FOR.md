---
id: "pred:CONTRACT_MANUFACTURES_FOR"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CONTRACT_MANUFACTURES_FOR"]
aliases: ["contract manufactures for"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:65969bc025172f30a281ea1e248e16436b3b75e8440e8c6e3bdaf7691079b06a"
---
# Predicate CONTRACT_MANUFACTURES_FOR

| | |
| --- | --- |
| id | `pred:CONTRACT_MANUFACTURES_FOR` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Organization](../nodes/Organization.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | `product` |
| aliases | (none) |
| questions | `CQ-CL-05`, `CQ-CL-08`, `CQ-MF-01`, `Q-D10-21`, `Q-D7-18`, `Q-D9-01`, `Q-K-15` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'CONTRACT_MANUFACTURES_FOR'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named CONTRACT_MANUFACTURES_FOR.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CONTRACT_MANUFACTURES_FOR`
