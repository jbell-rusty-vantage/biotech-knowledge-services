---
id: "rel:RESULT_FOR_ARM"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#RESULT_FOR_ARM","release:rules/temporal-rules.yaml#RESULT_FOR_ARM","release:sdl/modules/D3.graphql#L752-L811 (StudyResult)"]
aliases: ["result for arm"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:719d82eaf602a425efacaa49de7a2d3f185e27765fcbfccf652e189723a361bb"
---
# Relationship RESULT_FOR_ARM



| | |
| --- | --- |
| id | `rel:RESULT_FOR_ARM` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D3](../modules/D3.md) |
| stored direction | [StudyResult](../nodes/StudyResult.md) → [StudyArm](../nodes/StudyArm.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | one_or_more (reference arm named by StudyResult.comparatorArmKey) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_RESULT_FOR_ARM_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:StudyResult)-[:RESULT_FOR_ARM]->(:StudyArm)`.
- Fields in the stored direction (OUT): `StudyResult.arms (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:RESULT_FOR_ARM --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [StudyResult](../nodes/StudyResult.md) | [StudyArm](../nodes/StudyArm.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-ST-06`, `Q-D3-01`, `Q-D3-04`
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `rel:RESULT_FOR_ARM` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#RESULT_FOR_ARM`
- `release:rules/temporal-rules.yaml#RESULT_FOR_ARM`
- `release:sdl/modules/D3.graphql#L752-L811 (StudyResult)`
