---
id: "rel:PERFORMED_WITH_VERSION"
kind: "relationship"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#PERFORMED_WITH_VERSION","release:rules/temporal-rules.yaml#PERFORMED_WITH_VERSION","release:sdl/modules/D4.graphql#L379-L418 (LabTest)"]
aliases: ["performed with version","rel:PERFORMED_WITH_ASSAY_VERSION","PERFORMED_WITH_ASSAY_VERSION"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:25d048386029e6fe986acbee63c62f5410f45281a57dc3793803e9076b45d687"
---
# Relationship PERFORMED_WITH_VERSION



| | |
| --- | --- |
| id | `rel:PERFORMED_WITH_VERSION` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D4](../modules/D4.md) |
| stored direction | [LabTest](../nodes/LabTest.md) → [AssayVersion](../nodes/AssayVersion.md) \| [AlgorithmVersion](../nodes/AlgorithmVersion.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | many per target (two fields, assayVersions and algorithmVersions; 2 pairs) |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_PERFORMED_WITH_VERSION_assertion`, `rel_PERFORMED_WITH_VERSION_uid`, `rel_PERFORMED_WITH_VERSION_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:LabTest)-[:PERFORMED_WITH_VERSION]->(:AssayVersion)` (other declared endpoints below).
- Fields in the stored direction (OUT): `LabTest.algorithmVersions (OUT)`, `LabTest.assayVersions (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:PERFORMED_WITH_VERSION --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [LabTest](../nodes/LabTest.md) | [AlgorithmVersion](../nodes/AlgorithmVersion.md) | 1 |
| [LabTest](../nodes/LabTest.md) | [AssayVersion](../nodes/AssayVersion.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [PERFORMED_WITH_VERSION](../predicates/PERFORMED_WITH_VERSION.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-DX-01`, `CQ-DX-02`, `CQ-DX-03`, `CQ-DX-04`, `Q-D4-01`, `Q-D4-02`, `Q-D4-04`, `Q-D4-06`, `Q-D4-11`, `Q-D4-20`, `Q-D4-23`, `Q-D4-26`
- [QP/P-12](../patterns/QP/P-12.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:PERFORMED_WITH_ASSAY_VERSION` (renamed): D4: PERFORMED_WITH_VERSION: Replaces pinned PERFORMED_WITH_ASSAY_VERSION and the LabTest side of the algorithm link with one type and two fields

## Source definition

- `release:registers/relationship-register.yaml#PERFORMED_WITH_VERSION`
- `release:rules/temporal-rules.yaml#PERFORMED_WITH_VERSION`
- `release:sdl/modules/D4.graphql#L379-L418 (LabTest)`
