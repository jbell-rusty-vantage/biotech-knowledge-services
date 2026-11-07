---
id: "pred:OFFER_PRICE_COUPON_ADJUSTED"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#OFFER_PRICE_COUPON_ADJUSTED"]
aliases: ["offer price coupon adjusted"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:d252e40ed0fda669e1299102aaf7f5c82ca1a9c7d661f79836e4cd99ebb36d85"
---
# Predicate OFFER_PRICE_COUPON_ADJUSTED

| | |
| --- | --- |
| id | `pred:OFFER_PRICE_COUPON_ADJUSTED` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | (none) |
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

- `release:vocabularies/predicates.yaml#OFFER_PRICE_COUPON_ADJUSTED`
