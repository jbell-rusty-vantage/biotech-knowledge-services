---
id: "pred:HAS_REVISION_STATUS"
kind: "predicate"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_REVISION_STATUS"]
aliases: ["has revision status"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:9e35cda4ec7a09c6738fbc1231dcc70dca39867a98a3401d43cb5f3209d1b642"
---
# Predicate HAS_REVISION_STATUS

| | |
| --- | --- |
| id | `pred:HAS_REVISION_STATUS` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [K](../modules/K.md) |
| subject types | [Source](../nodes/Source.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-EV-05`, `CQ-MX-05`, `CQ-TM-02`, `Q-D12-09`, `Q-D12-10`, `Q-K-17`, `Q-K-22` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_REVISION_STATUS`
