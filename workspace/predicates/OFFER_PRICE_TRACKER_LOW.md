---
id: "pred:OFFER_PRICE_TRACKER_LOW"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#OFFER_PRICE_TRACKER_LOW"]
aliases: ["offer price tracker low"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:ba2230554af78fedc633907f4708f648bf7ea5fcc19c8b8e6e6c92a859acd0b0"
---
# Predicate OFFER_PRICE_TRACKER_LOW

| | |
| --- | --- |
| id | `pred:OFFER_PRICE_TRACKER_LOW` |
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

- `release:vocabularies/predicates.yaml#OFFER_PRICE_TRACKER_LOW`
