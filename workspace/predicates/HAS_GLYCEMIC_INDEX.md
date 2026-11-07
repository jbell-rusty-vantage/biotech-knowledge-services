---
id: "pred:HAS_GLYCEMIC_INDEX"
kind: "predicate"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_GLYCEMIC_INDEX"]
aliases: ["has glycemic index"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:37b35b8d9ec1b56ecee14a2902484a6c1806fa444787a3851e477c85f4515b50"
---
# Predicate HAS_GLYCEMIC_INDEX

| | |
| --- | --- |
| id | `pred:HAS_GLYCEMIC_INDEX` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D12](../modules/D12.md) |
| subject types | [FoodItem](../nodes/FoodItem.md) |
| object types | (none) |
| literal forms | `valueNumber` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D12-08` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_GLYCEMIC_INDEX`
