---
id: "pred:INTERACTS_WITH"
kind: "predicate"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INTERACTS_WITH"]
aliases: ["interacts with"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:2376d232fb914381d5371797e99f5ae090db69cac19ad5fb31f3afc8441a0325"
---
# Predicate INTERACTS_WITH

| | |
| --- | --- |
| id | `pred:INTERACTS_WITH` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D5](../modules/D5.md) |
| subject types | [FoodCategory](../nodes/FoodCategory.md) |
| object types | [Intervention](../nodes/Intervention.md) |
| literal forms | `valueString` |
| qualifiers | `e.g.`, `exposureChange`, `mechanism`, `never`, `population`, `stance`, `window` · required `population` |
| aliases | (none) |
| questions | `Q-D12-16`, `Q-D5-02`, `Q-D5-03`, `Q-D5-04`, `Q-D5-05`, `Q-D5-11`, `Q-D5-19`, `Q-D5-21`, `Q-D5-24`, `Q-D5-26`, `Q-D5-27` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INTERACTS_WITH`
