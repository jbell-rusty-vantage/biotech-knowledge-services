---
id: "rel:HAS_STEP"
kind: "relationship"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_STEP","release:rules/temporal-rules.yaml#HAS_STEP","release:sdl/modules/D5.graphql#L353-L382 (ProtocolEdition)"]
aliases: ["has step","rel:HAS_PROTOCOL_STEP","HAS_PROTOCOL_STEP"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:9f43cb96cd9679a9b318aa017c45aa1a062755c8cfb969193bde1ac2b05a306b"
---
# Relationship HAS_STEP



| | |
| --- | --- |
| id | `rel:HAS_STEP` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D5](../modules/D5.md) |
| stored direction | [ProtocolEdition](../nodes/ProtocolEdition.md) → [ProtocolStep](../nodes/ProtocolStep.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | one_or_more (orderIndex = source order) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_STEP_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:ProtocolEdition)-[:HAS_STEP]->(:ProtocolStep)`.
- Fields in the stored direction (OUT): `ProtocolEdition.steps (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_STEP --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [ProtocolEdition](../nodes/ProtocolEdition.md) | [ProtocolStep](../nodes/ProtocolStep.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-PR-01`, `CQ-PR-02`, `Q-D5-10`, `Q-D5-11`, `Q-D5-12`
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported)
- [QP/G-9#1](../patterns/QP/G-9--1.md) (unsupported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:HAS_STEP` is unchanged from v1.
- `rel:HAS_PROTOCOL_STEP` (merged): D5: renamed HAS_STEP

## Source definition

- `release:registers/relationship-register.yaml#HAS_STEP`
- `release:rules/temporal-rules.yaml#HAS_STEP`
- `release:sdl/modules/D5.graphql#L353-L382 (ProtocolEdition)`
