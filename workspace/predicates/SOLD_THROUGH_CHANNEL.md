---
id: "pred:SOLD_THROUGH_CHANNEL"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#SOLD_THROUGH_CHANNEL"]
aliases: ["sold through channel"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:ff06656248f089ec4c24caa36f178e3ec4e4bcc0a6fff65df7b563bc8592172e"
---
# Predicate SOLD_THROUGH_CHANNEL

| | |
| --- | --- |
| id | `pred:SOLD_THROUGH_CHANNEL` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [Organization](../nodes/Organization.md), [Product](../nodes/Product.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D6-04`, `Q-D6-16`, `Q-D6-20` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'SOLD_THROUGH_CHANNEL'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named SOLD_THROUGH_CHANNEL.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#SOLD_THROUGH_CHANNEL`
