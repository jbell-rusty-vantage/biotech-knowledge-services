---
id: "rel:BLOCKED_BY"
kind: "relationship"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#BLOCKED_BY","release:rules/temporal-rules.yaml#BLOCKED_BY","release:sdl/modules/D10.graphql#L187-L247 (ReportItem)"]
aliases: ["blocked by"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:95023798268e02c1d8e971ec4b155053b99eafe0fa8bcec3450bd5f75d0eb7ea"
---
# Relationship BLOCKED_BY



| | |
| --- | --- |
| id | `rel:BLOCKED_BY` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D10](../modules/D10.md) |
| stored direction | [ReportItem](../nodes/ReportItem.md) → [UseConstraint](../nodes/UseConstraint.md) \| [Assessment](../nodes/Assessment.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | one_or_more when disposition = BLOCKED; none otherwise |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_BLOCKED_BY_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:ReportItem)-[:BLOCKED_BY]->(:UseConstraint)` (other declared endpoints below).
- Fields in the stored direction (OUT): `ReportItem.blockedBy (OUT)`, `ReportItem.blockedByAssessments (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:BLOCKED_BY --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [ReportItem](../nodes/ReportItem.md) | [Assessment](../nodes/Assessment.md) | 1 |
| [ReportItem](../nodes/ReportItem.md) | [UseConstraint](../nodes/UseConstraint.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-RC-06`, `Q-D10-08`
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported)
- [QP/P-05c](../patterns/QP/P-05c.md) (supported)
- [QP/P-07](../patterns/QP/P-07.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#BLOCKED_BY`
- `release:rules/temporal-rules.yaml#BLOCKED_BY`
- `release:sdl/modules/D10.graphql#L187-L247 (ReportItem)`
