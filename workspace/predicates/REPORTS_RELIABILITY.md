---
id: "pred:REPORTS_RELIABILITY"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REPORTS_RELIABILITY"]
aliases: ["reports reliability"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:13c3d90c04649564d3fe3dd3e7f8ab73f3b7caed307fa500b2f6402199df3c13"
---
# Predicate REPORTS_RELIABILITY

| | |
| --- | --- |
| id | `pred:REPORTS_RELIABILITY` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [AlgorithmVersion](../nodes/AlgorithmVersion.md), [AssayVersion](../nodes/AssayVersion.md) |
| object types | (none) |
| literal forms |  |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-DX-05`, `Q-D4-05` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (value fields) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REPORTS_RELIABILITY`
