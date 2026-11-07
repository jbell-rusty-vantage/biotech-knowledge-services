---
id: "pred:UNIT_DOSE_AMOUNT"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#UNIT_DOSE_AMOUNT"]
aliases: ["unit dose amount"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:f7468347793a32003bf99df4e0c48acd469a103ad1385cafd84f746bd20ab3b7"
---
# Predicate UNIT_DOSE_AMOUNT

| | |
| --- | --- |
| id | `pred:UNIT_DOSE_AMOUNT` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [InterventionComponent](../nodes/InterventionComponent.md) |
| object types | (none) |
| literal forms | `valueNumber` (UCUM mass per unit (e.g. mg)) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-ST-02`, `Q-D1-08` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`, unit UCUM mass per unit (e.g. mg)) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#UNIT_DOSE_AMOUNT`
