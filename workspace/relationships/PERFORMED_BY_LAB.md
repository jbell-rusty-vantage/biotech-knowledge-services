---
id: "rel:PERFORMED_BY_LAB"
kind: "relationship"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#PERFORMED_BY_LAB","release:rules/temporal-rules.yaml#PERFORMED_BY_LAB","release:sdl/modules/D4.graphql#L431-L463 (AssayVersion)"]
aliases: ["performed by lab","rel:ASSAY_OPERATED_BY","ASSAY_OPERATED_BY"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert"]
cardDigest: "sha256:a0c8bc8298a04263fef9b183b4d9c6f1987a746127f8a4cea677924dbcc040c3"
---
# Relationship PERFORMED_BY_LAB



| | |
| --- | --- |
| id | `rel:PERFORMED_BY_LAB` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D4](../modules/D4.md) |
| stored direction | [AssayVersion](../nodes/AssayVersion.md) → [Organization](../nodes/Organization.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | exactly_one |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_PERFORMED_BY_LAB_assertion`, `rel_PERFORMED_BY_LAB_uid`, `rel_PERFORMED_BY_LAB_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:AssayVersion)-[:PERFORMED_BY_LAB]->(:Organization)`.
- Fields in the stored direction (OUT): `AssayVersion.performingLab (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:PERFORMED_BY_LAB --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [AssayVersion](../nodes/AssayVersion.md) | [Organization](../nodes/Organization.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [PERFORMED_BY_LAB](../predicates/PERFORMED_BY_LAB.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-DX-01`, `CQ-DX-03`, `Q-D4-04`
(none)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:PERFORMED_BY_LAB` is unchanged from v1.
- `rel:ASSAY_OPERATED_BY` (merged): D4: renamed PERFORMED_BY_LAB

## Source definition

- `release:registers/relationship-register.yaml#PERFORMED_BY_LAB`
- `release:rules/temporal-rules.yaml#PERFORMED_BY_LAB`
- `release:sdl/modules/D4.graphql#L431-L463 (AssayVersion)`
