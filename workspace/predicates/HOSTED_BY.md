---
id: "pred:HOSTED_BY"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HOSTED_BY"]
aliases: ["hosted by"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:e02eba2a3968c99d1c437f99062f04c3dd2d7bdcbc48cd36656ea4dbc3f6667d"
---
# Predicate HOSTED_BY

| | |
| --- | --- |
| id | `pred:HOSTED_BY` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [MerchantListing](../nodes/MerchantListing.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'HOSTED_BY'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named HOSTED_BY.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HOSTED_BY`
