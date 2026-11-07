---
id: "rel:HAS_COMPONENT"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_COMPONENT","release:rules/temporal-rules.yaml#HAS_COMPONENT","release:sdl/modules/D3.graphql#L569-L595 (StudyArm)"]
aliases: ["has component","rel:ASSIGNS_INTERVENTION","rel:HAS_INTERVENTION_COMPONENT","ASSIGNS_INTERVENTION","HAS_INTERVENTION_COMPONENT"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:a36d458babe3fd1443fbadcf851620ae18783a4ad7503a1a6be60e3f8783a1ad"
---
# Relationship HAS_COMPONENT



| | |
| --- | --- |
| id | `rel:HAS_COMPONENT` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D3](../modules/D3.md) |
| stored direction | [StudyArm](../nodes/StudyArm.md) → [InterventionComponent](../nodes/InterventionComponent.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | one_or_more (none for NO_INTERVENTION arms) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_COMPONENT_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:StudyArm)-[:HAS_COMPONENT]->(:InterventionComponent)`.
- Fields in the stored direction (OUT): `StudyArm.components (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_COMPONENT --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [StudyArm](../nodes/StudyArm.md) | [InterventionComponent](../nodes/InterventionComponent.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-ST-01`, `Q-D3-04`, `Q-D3-05`, `Q-D3-06`
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `rel:ASSIGNS_INTERVENTION` (merged): D3: HAS_COMPONENT: Replaces pinned ASSIGNS_INTERVENTION + HAS_INTERVENTION_COMPONENT (StudyIntervention absorbed)
- `rel:HAS_INTERVENTION_COMPONENT` (merged): D3: HAS_COMPONENT: Replaces pinned ASSIGNS_INTERVENTION + HAS_INTERVENTION_COMPONENT (StudyIntervention absorbed)

## Source definition

- `release:registers/relationship-register.yaml#HAS_COMPONENT`
- `release:rules/temporal-rules.yaml#HAS_COMPONENT`
- `release:sdl/modules/D3.graphql#L569-L595 (StudyArm)`
