---
id: "rel:HAS_POPULATION"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_POPULATION","release:rules/temporal-rules.yaml#HAS_POPULATION","release:sdl/modules/D3.graphql#L426-L478 (Study)"]
aliases: ["has population","rel:HAS_ANALYZED_COHORT","rel:HAS_ELIGIBLE_POPULATION","rel:HAS_ENROLLED_COHORT","HAS_ANALYZED_COHORT","HAS_ELIGIBLE_POPULATION","HAS_ENROLLED_COHORT"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:c7411e78e22d4b6a14894ec04b3e1d659793b97a6bff0a765ef3563b0beada42"
---
# Relationship HAS_POPULATION



| | |
| --- | --- |
| id | `rel:HAS_POPULATION` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D3](../modules/D3.md) |
| stored direction | [Study](../nodes/Study.md) → [StudyPopulation](../nodes/StudyPopulation.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | many (eligible / enrolled / randomized / analyzed per stating source) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_POPULATION_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:Study)-[:HAS_POPULATION]->(:StudyPopulation)`.
- Fields in the stored direction (OUT): `Study.populations (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_POPULATION --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Study](../nodes/Study.md) | [StudyPopulation](../nodes/StudyPopulation.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D3-04`, `Q-D3-06`, `Q-D3-07`, `Q-D3-17`
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `rel:HAS_ANALYZED_COHORT` (merged): D3: HAS_POPULATION: replaces three pinned edges (HAS_ELIGIBLE_POPULATION, HAS_ENROLLED_COHORT, HAS_ANALYZED_COHORT)
- `rel:HAS_ELIGIBLE_POPULATION` (merged): D3: HAS_POPULATION: replaces three pinned edges (HAS_ELIGIBLE_POPULATION, HAS_ENROLLED_COHORT, HAS_ANALYZED_COHORT)
- `rel:HAS_ENROLLED_COHORT` (merged): D3: HAS_POPULATION: replaces three pinned edges (HAS_ELIGIBLE_POPULATION, HAS_ENROLLED_COHORT, HAS_ANALYZED_COHORT)

## Source definition

- `release:registers/relationship-register.yaml#HAS_POPULATION`
- `release:rules/temporal-rules.yaml#HAS_POPULATION`
- `release:sdl/modules/D3.graphql#L426-L478 (Study)`
