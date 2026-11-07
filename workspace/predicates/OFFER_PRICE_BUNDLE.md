---
id: "pred:OFFER_PRICE_BUNDLE"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#OFFER_PRICE_BUNDLE"]
aliases: ["offer price bundle"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:39f8a4600f31d40abe5e32af9e0b6f16d855c632153bfa383fbf5f67622eb8bf"
---
# Predicate OFFER_PRICE_BUNDLE

| | |
| --- | --- |
| id | `pred:OFFER_PRICE_BUNDLE` |
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

- `release:vocabularies/predicates.yaml#OFFER_PRICE_BUNDLE`
