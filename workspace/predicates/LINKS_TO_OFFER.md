---
id: "pred:LINKS_TO_OFFER"
kind: "predicate"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#LINKS_TO_OFFER"]
aliases: ["links to offer"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:c448ac34162af1de23eb7665a96c4ae2277094aead12b1978272f73c13a626ad"
---
# Predicate LINKS_TO_OFFER

| | |
| --- | --- |
| id | `pred:LINKS_TO_OFFER` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D9](../modules/D9.md) |
| subject types | [MediaWork](../nodes/MediaWork.md) |
| object types | [MerchantListing](../nodes/MerchantListing.md), [Offer](../nodes/Offer.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-CM-01`, `CQ-CM-04`, `Q-D9-21` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'LINKS_TO_OFFER'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named LINKS_TO_OFFER.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#LINKS_TO_OFFER`
