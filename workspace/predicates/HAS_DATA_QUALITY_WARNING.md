---
id: "pred:HAS_DATA_QUALITY_WARNING"
kind: "predicate"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_DATA_QUALITY_WARNING"]
aliases: ["has data quality warning"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:b74ee9c507b69c7e2fe108cd2ac62c5fea4848db271e03e3afdd85e52b46183e"
---
# Predicate HAS_DATA_QUALITY_WARNING

| | |
| --- | --- |
| id | `pred:HAS_DATA_QUALITY_WARNING` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D12](../modules/D12.md) |
| subject types | [FoodItem](../nodes/FoodItem.md), [Product](../nodes/Product.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D12-24` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_DATA_QUALITY_WARNING`
