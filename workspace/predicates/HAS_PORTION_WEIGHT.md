---
id: "pred:HAS_PORTION_WEIGHT"
kind: "predicate"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_PORTION_WEIGHT"]
aliases: ["has portion weight"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:db8ddc46e2d027f5cfac73fa9ad817db694cdc714f929860385aa299b000adb2"
---
# Predicate HAS_PORTION_WEIGHT

| | |
| --- | --- |
| id | `pred:HAS_PORTION_WEIGHT` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D12](../modules/D12.md) |
| subject types | [FoodItem](../nodes/FoodItem.md) |
| object types | (none) |
| literal forms | `valueNumber` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D12-01`, `Q-D12-04`, `Q-D12-19`, `Q-D12-21` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_PORTION_WEIGHT`
