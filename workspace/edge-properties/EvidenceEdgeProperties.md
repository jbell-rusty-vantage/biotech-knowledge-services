---
id: "edge:EvidenceEdgeProperties"
kind: "edge-properties"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L164-L172"]
aliases: ["evidence edge properties"]
capabilities: ["get"]
cardDigest: "sha256:911fc9f630fea50818b69d6d2ebdb6750ba8ff4a0bbe9963799a49e99cf77eaa"
---
# Edge properties EvidenceEdgeProperties

Kernel-internal. HAS_EVIDENCE qualifier, mirroring verification.v1 EvidenceEdge: `role` (how the located span bears on the record) and `origin` (declared by the producer, or found by the verifier). This is where support and contradiction live: always record → SourceLocator, never document → entity (00-DIRECTIVE 3.8). `authority` and `independence` copy two axes of the verifier's per-evidence SourceAuthorityVector (directness, freshness and applicability stay in the sealed bundle); `facet` is the verification.v1 metric evidence binding (null for non-metric records). All three are written only on an Adjudication's VERIFIER_FOUND edges by the adjudication ingest (an Assessment or Report may copy them onto its own edges); an Assertion's DECLARED edges never carry them, so a verification run never rewrites the extractor's evidence record. Readers take them from the current Adjudications of the assertion, on the spans the assertion declared (03 Q-K-15, Q-K-21).

| | |
| --- | --- |
| id | `edge:EvidenceEdgeProperties` · raw SDL [sdl:EvidenceEdgeProperties](../sdl/EvidenceEdgeProperties.graphql) |
| module | [K](../modules/K.md) |
| used by relationship types | [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) |
| set by the executor | `lastWriterRunId` |

## Properties (7)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `role` | [EvidenceRole](../vocabularies/EvidenceRole.md) | yes | create+update |  | kernel.graphql:L165 |
| `origin` | [EvidenceOrigin](../vocabularies/EvidenceOrigin.md) | yes | create+update |  | kernel.graphql:L166 |
| `expectedSelectedContentDigest` | `String` |  | create+update |  | kernel.graphql:L167 |
| `authority` | [EvidenceAuthority](../vocabularies/EvidenceAuthority.md) |  | create+update |  | kernel.graphql:L168 |
| `independence` | [EvidenceIndependence](../vocabularies/EvidenceIndependence.md) |  | create+update |  | kernel.graphql:L169 |
| `facet` | [EvidenceFacet](../vocabularies/EvidenceFacet.md) |  | create+update |  | kernel.graphql:L170 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L171 |

## Declared on (4 fields)

- [Assertion](../nodes/Assertion.md).`evidence` ([HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md))
- [Adjudication](../nodes/Adjudication.md).`evidence` ([HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md))
- [Assessment](../nodes/Assessment.md).`evidence` ([HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md))
- [Report](../nodes/Report.md).`evidence` ([HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md))

## Source definition

- `release:sdl/modules/kernel.graphql#L164-L172`
