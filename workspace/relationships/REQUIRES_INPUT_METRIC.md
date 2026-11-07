---
id: "rel:REQUIRES_INPUT_METRIC"
kind: "relationship"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#REQUIRES_INPUT_METRIC","release:rules/temporal-rules.yaml#REQUIRES_INPUT_METRIC","release:sdl/modules/D4.graphql#L475-L520 (AlgorithmVersion)"]
aliases: ["requires input metric"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural"]
cardDigest: "sha256:0d3b3e44a3e59a73d73dd48d1666e5a387b5d9846d428a88191f4257b93b0421"
---
# Relationship REQUIRES_INPUT_METRIC



| | |
| --- | --- |
| id | `rel:REQUIRES_INPUT_METRIC` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D4](../modules/D4.md) |
| stored direction | [AlgorithmVersion](../nodes/AlgorithmVersion.md) → [Metric](../nodes/Metric.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | many (orderIndex = source order) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_REQUIRES_INPUT_METRIC_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:AlgorithmVersion)-[:REQUIRES_INPUT_METRIC]->(:Metric)`.
- Fields in the stored direction (OUT): `AlgorithmVersion.inputs (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:REQUIRES_INPUT_METRIC --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [AlgorithmVersion](../nodes/AlgorithmVersion.md) | [Metric](../nodes/Metric.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-DX-04`, `CQ-DX-07`, `Q-D4-26`
(none)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:REQUIRES_INPUT_METRIC` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#REQUIRES_INPUT_METRIC`
- `release:rules/temporal-rules.yaml#REQUIRES_INPUT_METRIC`
- `release:sdl/modules/D4.graphql#L475-L520 (AlgorithmVersion)`
