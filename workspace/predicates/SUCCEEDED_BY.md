---
id: "pred:SUCCEEDED_BY"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#SUCCEEDED_BY"]
aliases: ["succeeded by"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:75b427f8be3cc80e0e8a05c767728dcb54e19213967205ef02a5d63228c9cf57"
---
# Predicate SUCCEEDED_BY

| | |
| --- | --- |
| id | `pred:SUCCEEDED_BY` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [MerchantListing](../nodes/MerchantListing.md), [Organization](../nodes/Organization.md), [Package](../nodes/Package.md), [Product](../nodes/Product.md) |
| object types | [MerchantListing](../nodes/MerchantListing.md), [Organization](../nodes/Organization.md), [Package](../nodes/Package.md), [Product](../nodes/Product.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D6-19`, `Q-D7-09` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'SUCCEEDED_BY'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named SUCCEEDED_BY.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#SUCCEEDED_BY`
