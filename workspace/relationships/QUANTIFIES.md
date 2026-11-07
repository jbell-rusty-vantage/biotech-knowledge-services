---
id: "rel:QUANTIFIES"
kind: "relationship"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#QUANTIFIES","release:rules/temporal-rules.yaml#QUANTIFIES","release:sdl/modules/D4.graphql#L330-L368 (Metric)"]
aliases: ["quantifies"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:ae001470c686f2da64d420b364cc5a5c8fbf0244ada7982803a23e0e6af45ff9"
---
# Relationship QUANTIFIES



| | |
| --- | --- |
| id | `rel:QUANTIFIES` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D4](../modules/D4.md) |
| stored direction | [Metric](../nodes/Metric.md) → [Biomarker](../nodes/Biomarker.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | one (each Metric quantifies one Biomarker; a Biomarker has many Metrics) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_QUANTIFIES_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:Metric)-[:QUANTIFIES]->(:Biomarker)`.
- Fields in the stored direction (OUT): `Metric.quantifies (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:QUANTIFIES --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Metric](../nodes/Metric.md) | [Biomarker](../nodes/Biomarker.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-DX-01`, `Q-D4-01`, `Q-D4-03`, `Q-D4-16`, `Q-D4-17`
- [QP/P-12](../patterns/QP/P-12.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:QUANTIFIES` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#QUANTIFIES`
- `release:rules/temporal-rules.yaml#QUANTIFIES`
- `release:sdl/modules/D4.graphql#L330-L368 (Metric)`
