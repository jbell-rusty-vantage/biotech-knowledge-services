---
id: "pred:OFFER_SUBSCRIPTION_TERMS"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#OFFER_SUBSCRIPTION_TERMS"]
aliases: ["offer subscription terms"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:7841adac8fe239c97f804bac4d0db3a842cf45fe6736011e38b765ae994f73a2"
---
# Predicate OFFER_SUBSCRIPTION_TERMS

| | |
| --- | --- |
| id | `pred:OFFER_SUBSCRIPTION_TERMS` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [Offer](../nodes/Offer.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D6-17` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#OFFER_SUBSCRIPTION_TERMS`
