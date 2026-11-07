---
id: "pred:HAS_CLAIM_CONDITION"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_CLAIM_CONDITION"]
aliases: ["has claim condition"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:03c827ec3bf69a2a2bc5645b3b1f801e2c6dc70c25820d3b9d474f0c0f7fc354"
---
# Predicate HAS_CLAIM_CONDITION

| | |
| --- | --- |
| id | `pred:HAS_CLAIM_CONDITION` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [Claim](../nodes/Claim.md), [RegulatoryRecord](../nodes/RegulatoryRecord.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D12-18` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_CLAIM_CONDITION`
