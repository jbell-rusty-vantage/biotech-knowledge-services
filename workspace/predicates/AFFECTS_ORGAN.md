---
id: "pred:AFFECTS_ORGAN"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#AFFECTS_ORGAN"]
aliases: ["affects organ"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:eb1ef1cf8802d89f83e80a18ed3266c5ea9fe4de8d94ba5f7b226d23e8bd149e"
---
# Predicate AFFECTS_ORGAN

| | |
| --- | --- |
| id | `pred:AFFECTS_ORGAN` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [Condition](../nodes/Condition.md), [Mechanism](../nodes/Mechanism.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#AFFECTS_ORGAN`
