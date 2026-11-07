---
id: "pred:PERFORMED_WITH_VERSION"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PERFORMED_WITH_VERSION"]
aliases: ["performed with version"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:7af56bbae94a27f5b71e5a2d655319c2c05f6e2d10a4fa03b55bc7cc7350eb3e"
---
# Predicate PERFORMED_WITH_VERSION

| | |
| --- | --- |
| id | `pred:PERFORMED_WITH_VERSION` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [LabTest](../nodes/LabTest.md) |
| object types | [AlgorithmVersion](../nodes/AlgorithmVersion.md), [AssayVersion](../nodes/AssayVersion.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-DX-01`, `CQ-DX-02`, `CQ-DX-03`, `CQ-DX-04`, `Q-D2-03`, `Q-D4-01`, `Q-D4-02`, `Q-D4-04`, `Q-D4-06`, `Q-D4-11`, `Q-D4-20`, `Q-D4-23`, `Q-D4-26` |

## Typed edge or Assertion only

A typed edge exists: [PERFORMED_WITH_VERSION](../relationships/PERFORMED_WITH_VERSION.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'PERFORMED_WITH_VERSION'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#PERFORMED_WITH_VERSION`
