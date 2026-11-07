---
id: "pred:RETAILER_DISCONTINUED"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#RETAILER_DISCONTINUED"]
aliases: ["retailer discontinued"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:7ca194de8958342997ff6ff2015dc69e032a40b4f6a8b763dcbb45c6667571d1"
---
# Predicate RETAILER_DISCONTINUED

| | |
| --- | --- |
| id | `pred:RETAILER_DISCONTINUED` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [MerchantListing](../nodes/MerchantListing.md) |
| object types | (none) |
| literal forms | `valueBoolean` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-CM-05`, `Q-D6-19` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueBoolean`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#RETAILER_DISCONTINUED`
