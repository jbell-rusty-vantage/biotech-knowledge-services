---
id: "pred:REQUIRES_INPUT_METRIC"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REQUIRES_INPUT_METRIC"]
aliases: ["requires input metric"]
capabilities: ["get","neighbors","propose:edge.structural"]
cardDigest: "sha256:f1e60196c3c2923b0fdedeb30d5d9b319b3f787e91967e54d4d75df5dadc97ab"
---
# Predicate REQUIRES_INPUT_METRIC

| | |
| --- | --- |
| id | `pred:REQUIRES_INPUT_METRIC` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [AlgorithmVersion](../nodes/AlgorithmVersion.md) |
| object types | [Metric](../nodes/Metric.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-DX-04`, `CQ-DX-07`, `Q-D4-26` |

## Typed edge or Assertion only

A typed edge exists: [REQUIRES_INPUT_METRIC](../relationships/REQUIRES_INPUT_METRIC.md) (structural). Each stored edge is authorized by one Assertion with `predicate: 'REQUIRES_INPUT_METRIC'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.structural`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REQUIRES_INPUT_METRIC`
