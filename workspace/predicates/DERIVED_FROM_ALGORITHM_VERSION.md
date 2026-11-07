---
id: "pred:DERIVED_FROM_ALGORITHM_VERSION"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DERIVED_FROM_ALGORITHM_VERSION"]
aliases: ["derived from algorithm version"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:6dfe4d06b36f881f05bba62abac5a25b2657e4b61388d09e074fd8667bfeed36"
---
# Predicate DERIVED_FROM_ALGORITHM_VERSION

| | |
| --- | --- |
| id | `pred:DERIVED_FROM_ALGORITHM_VERSION` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [AlgorithmVersion](../nodes/AlgorithmVersion.md) |
| object types | [AlgorithmVersion](../nodes/AlgorithmVersion.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-DX-04`, `Q-D4-06`, `Q-D4-20` |

## Typed edge or Assertion only

A typed edge exists: [DERIVED_FROM_ALGORITHM_VERSION](../relationships/DERIVED_FROM_ALGORITHM_VERSION.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'DERIVED_FROM_ALGORITHM_VERSION'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DERIVED_FROM_ALGORITHM_VERSION`
