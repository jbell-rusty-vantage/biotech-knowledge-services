---
id: "pred:OFFER_PRICE_TRACKER_HIGH"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#OFFER_PRICE_TRACKER_HIGH"]
aliases: ["offer price tracker high"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:45b852c2ce0f2f35d7d97807a7885673b6faeed3a5756670cef5c2e45d96f6d0"
---
# Predicate OFFER_PRICE_TRACKER_HIGH

| | |
| --- | --- |
| id | `pred:OFFER_PRICE_TRACKER_HIGH` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [MerchantListing](../nodes/MerchantListing.md), [Offer](../nodes/Offer.md) |
| object types | (none) |
| literal forms | `valueNumber` (unitCode = iso4217:<CODE>) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`, unit unitCode = iso4217:<CODE>) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#OFFER_PRICE_TRACKER_HIGH`
