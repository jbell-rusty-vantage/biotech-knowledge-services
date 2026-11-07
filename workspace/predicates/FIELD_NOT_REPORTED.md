---
id: "pred:FIELD_NOT_REPORTED"
kind: "predicate"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#FIELD_NOT_REPORTED"]
aliases: ["field not reported"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:e71d38fe996f51e6c0c30d7a3b6792dad9b426810ea0a5ffcb9bfbcbe625db8f"
---
# Predicate FIELD_NOT_REPORTED

| | |
| --- | --- |
| id | `pred:FIELD_NOT_REPORTED` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [K](../modules/K.md) |
| subject types | [AlgorithmVersion](../nodes/AlgorithmVersion.md), [AssayVersion](../nodes/AssayVersion.md), [LabelVersion](../nodes/LabelVersion.md), [Metric](../nodes/Metric.md), [Source](../nodes/Source.md), [Study](../nodes/Study.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-04`, `Q-D4-04` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#FIELD_NOT_REPORTED`
