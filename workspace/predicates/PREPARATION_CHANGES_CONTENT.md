---
id: "pred:PREPARATION_CHANGES_CONTENT"
kind: "predicate"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PREPARATION_CHANGES_CONTENT"]
aliases: ["preparation changes content"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:841288e910b29ec5294b6738339cb5e8c98cfcee54f229e17aa9faf87ce48146"
---
# Predicate PREPARATION_CHANGES_CONTENT

| | |
| --- | --- |
| id | `pred:PREPARATION_CHANGES_CONTENT` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D12](../modules/D12.md) |
| subject types | [FoodItem](../nodes/FoodItem.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Constituent](../nodes/Constituent.md) |
| literal forms | `valueNumber`, `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D12-02` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`, `valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#PREPARATION_CHANGES_CONTENT`
