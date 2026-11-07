---
id: "pred:DEFINITION_CHANGED"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DEFINITION_CHANGED"]
aliases: ["definition changed"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:7216f403ce675c6e79de88f2abbcf4fee33d5c5c2676e22f7f9dad7c7a36729f"
---
# Predicate DEFINITION_CHANGED

| | |
| --- | --- |
| id | `pred:DEFINITION_CHANGED` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [AlgorithmVersion](../nodes/AlgorithmVersion.md), [Metric](../nodes/Metric.md) |
| object types | (none) |
| literal forms |  |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-DX-09`, `Q-D4-23` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (value fields) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DEFINITION_CHANGED`
