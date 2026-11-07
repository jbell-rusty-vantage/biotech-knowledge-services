---
id: "rel:IN_STUDY_ARM"
kind: "relationship"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#IN_STUDY_ARM","release:rules/temporal-rules.yaml#IN_STUDY_ARM","release:sdl/modules/D2.graphql#L343-L396 (MechanismEvidenceContext)"]
aliases: ["in study arm"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural"]
cardDigest: "sha256:788d6a049617660dedcf08f7a4eea17d3a2dd0dd909fdfcb2f6800fdce0ad4fa"
---
# Relationship IN_STUDY_ARM



| | |
| --- | --- |
| id | `rel:IN_STUDY_ARM` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D2](../modules/D2.md) |
| stored direction | [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) → [StudyArm](../nodes/StudyArm.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | zero_or_more (usually one; a paper may pool registry arms into one analysed group: Konopka 2019 collapses two NCT02552355 arms per group; check stage 2026-10-08, 11 item 22) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_IN_STUDY_ARM_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:MechanismEvidenceContext)-[:IN_STUDY_ARM]->(:StudyArm)`.
- Fields in the stored direction (OUT): `MechanismEvidenceContext.studyArm (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:IN_STUDY_ARM --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) | [StudyArm](../nodes/StudyArm.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-MX-02`, `Q-D2-04`, `Q-D2-06`, `Q-D2-27`
(none)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:IN_STUDY_ARM` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#IN_STUDY_ARM`
- `release:rules/temporal-rules.yaml#IN_STUDY_ARM`
- `release:sdl/modules/D2.graphql#L343-L396 (MechanismEvidenceContext)`
