---
id: "rel:OUTPUTS_METRIC"
kind: "relationship"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#OUTPUTS_METRIC","release:rules/temporal-rules.yaml#OUTPUTS_METRIC","release:sdl/modules/D4.graphql#L475-L520 (AlgorithmVersion)"]
aliases: ["outputs metric"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural"]
cardDigest: "sha256:db0bc46d5fc5beae614c40220fe3ac0b661236a76de9cde5f966b27c559f93a7"
---
# Relationship OUTPUTS_METRIC



| | |
| --- | --- |
| id | `rel:OUTPUTS_METRIC` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D4](../modules/D4.md) |
| stored direction | [AlgorithmVersion](../nodes/AlgorithmVersion.md) → [Metric](../nodes/Metric.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | one_or_more |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_OUTPUTS_METRIC_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:AlgorithmVersion)-[:OUTPUTS_METRIC]->(:Metric)`.
- Fields in the stored direction (OUT): `AlgorithmVersion.outputs (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:OUTPUTS_METRIC --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [AlgorithmVersion](../nodes/AlgorithmVersion.md) | [Metric](../nodes/Metric.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-DX-02`, `CQ-DX-04`, `Q-D4-07`, `Q-D4-16`, `Q-D4-17`, `Q-D4-26`
(none)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:OUTPUTS_METRIC` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#OUTPUTS_METRIC`
- `release:rules/temporal-rules.yaml#OUTPUTS_METRIC`
- `release:sdl/modules/D4.graphql#L475-L520 (AlgorithmVersion)`
