---
id: "rel:RESULT_FOR"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#RESULT_FOR","release:rules/temporal-rules.yaml#RESULT_FOR","release:sdl/modules/D3.graphql#L752-L811 (StudyResult)"]
aliases: ["result for"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:54783b98296a8d95cfec51c88585f219e5a7e0bce0333757b4859cf1446c570b"
---
# Relationship RESULT_FOR



| | |
| --- | --- |
| id | `rel:RESULT_FOR` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D3](../modules/D3.md) |
| stored direction | [StudyResult](../nodes/StudyResult.md) → [OutcomeDefinition](../nodes/OutcomeDefinition.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | exactly_one |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_RESULT_FOR_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:StudyResult)-[:RESULT_FOR]->(:OutcomeDefinition)`.
- Fields in the stored direction (OUT): `StudyResult.outcome (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:RESULT_FOR --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [StudyResult](../nodes/StudyResult.md) | [OutcomeDefinition](../nodes/OutcomeDefinition.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-ST-05`, `CQ-ST-06`, `Q-D3-04`, `Q-D3-05`
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `rel:RESULT_FOR` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#RESULT_FOR`
- `release:rules/temporal-rules.yaml#RESULT_FOR`
- `release:sdl/modules/D3.graphql#L752-L811 (StudyResult)`
