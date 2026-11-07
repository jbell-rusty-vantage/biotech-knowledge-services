---
id: "pred:PRICE_SERIES_METHOD_CHANGE"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PRICE_SERIES_METHOD_CHANGE"]
aliases: ["price series method change"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:f12e623e1644c832a14ba41100aba6ab3e53740d024c6986d8dd6f5d09711c8b"
---
# Predicate PRICE_SERIES_METHOD_CHANGE

| | |
| --- | --- |
| id | `pred:PRICE_SERIES_METHOD_CHANGE` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [MerchantListing](../nodes/MerchantListing.md), [Offer](../nodes/Offer.md), [Package](../nodes/Package.md), [Product](../nodes/Product.md), [ProductVariant](../nodes/ProductVariant.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D6-13` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#PRICE_SERIES_METHOD_CHANGE`
