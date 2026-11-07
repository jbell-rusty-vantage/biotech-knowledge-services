---
id: "rel:HAS_ARM"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_ARM","release:rules/temporal-rules.yaml#HAS_ARM","release:sdl/modules/D3.graphql#L426-L478 (Study)"]
aliases: ["has arm","rel:LEGACY_EVALUATES","LEGACY_EVALUATES"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:6b63c3b6d4cbf65b5ac52d507148671bd7c197741b11ab64e0cb26290dd23b1d"
---
# Relationship HAS_ARM



| | |
| --- | --- |
| id | `rel:HAS_ARM` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D3](../modules/D3.md) |
| stored direction | [Study](../nodes/Study.md) → [StudyArm](../nodes/StudyArm.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | many (one per arm per stating source) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_ARM_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:Study)-[:HAS_ARM]->(:StudyArm)`.
- Fields in the stored direction (OUT): `Study.arms (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_ARM --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Study](../nodes/Study.md) | [StudyArm](../nodes/StudyArm.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-ST-01`, `Q-D3-01`, `Q-D3-05`, `Q-D3-06`
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `rel:HAS_ARM` is unchanged from v1.
- `rel:LEGACY_EVALUATES` (merged): D3: legacy 9-member union; replaced by HAS_ARM → HAS_COMPONENT → ADMINISTERS

## Source definition

- `release:registers/relationship-register.yaml#HAS_ARM`
- `release:rules/temporal-rules.yaml#HAS_ARM`
- `release:sdl/modules/D3.graphql#L426-L478 (Study)`
