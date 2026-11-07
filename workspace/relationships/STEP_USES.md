---
id: "rel:STEP_USES"
kind: "relationship"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#STEP_USES","release:rules/temporal-rules.yaml#STEP_USES","release:sdl/modules/D5.graphql#L398-L473 (ProtocolStep)"]
aliases: ["step uses","rel:EMPLOYS","rel:USES","EMPLOYS","USES"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:2b338b1772b7ad60a8541b2f9cd0af1876fbe98f8c6e9d5f1777d9341c44f213"
---
# Relationship STEP_USES



| | |
| --- | --- |
| id | `rel:STEP_USES` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D5](../modules/D5.md) |
| stored direction | [ProtocolStep](../nodes/ProtocolStep.md) → [Subjectable](../interfaces/Subjectable.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | zero_or_more per step (one primary means; alternatives are sibling steps sharing alternativeGroup; informational OTHER and CONSULT steps may have none, as fixtures sleep-toolkit-unstructured s09/s12 and pregnancy-magnesium-upper-limit preg-01 show) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | to [Subjectable](../interfaces/Subjectable.md) (56 members, registered-exception) |
| registered | yes (relationship register) |
| required indexes | `rel_STEP_USES_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:ProtocolStep)-[:STEP_USES]->(:Subjectable)`.
- Fields in the stored direction (OUT): `ProtocolStep.uses (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 56 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:STEP_USES --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [ProtocolStep](../nodes/ProtocolStep.md) | [Subjectable](../interfaces/Subjectable.md) | 56 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-PR-04`, `Q-D5-06`, `Q-D5-10`, `Q-D5-11`, `Q-D5-12`, `Q-D5-19`
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [QP/G-9#1](../patterns/QP/G-9--1.md) (unsupported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:EMPLOYS` (merged): D5: merged into STEP_USES (union 6); instruments are D6 Products, measured quantities D4 Metrics
- `rel:USES` (merged): D5: merged into STEP_USES (union 6); instruments are D6 Products, measured quantities D4 Metrics

## Source definition

- `release:registers/relationship-register.yaml#STEP_USES`
- `release:rules/temporal-rules.yaml#STEP_USES`
- `release:sdl/modules/D5.graphql#L398-L473 (ProtocolStep)`
