---
id: "rel:HAS_OUTCOME"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_OUTCOME","release:rules/temporal-rules.yaml#HAS_OUTCOME","release:sdl/modules/D3.graphql#L426-L478 (Study)"]
aliases: ["has outcome","rel:DEFINES_OUTCOME","DEFINES_OUTCOME"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:c916e95e223ec6ff40a19413ee3f7844d05dba8364afb6255a03dc9f350d1538"
---
# Relationship HAS_OUTCOME



| | |
| --- | --- |
| id | `rel:HAS_OUTCOME` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D3](../modules/D3.md) |
| stored direction | [Study](../nodes/Study.md) → [OutcomeDefinition](../nodes/OutcomeDefinition.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | many |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_OUTCOME_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:Study)-[:HAS_OUTCOME]->(:OutcomeDefinition)`.
- Fields in the stored direction (OUT): `Study.outcomes (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_OUTCOME --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Study](../nodes/Study.md) | [OutcomeDefinition](../nodes/OutcomeDefinition.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-ST-03`, `CQ-ST-05`, `Q-D3-04`, `Q-D3-16`
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `rel:DEFINES_OUTCOME` (renamed): D3: renamed HAS_OUTCOME

## Source definition

- `release:registers/relationship-register.yaml#HAS_OUTCOME`
- `release:rules/temporal-rules.yaml#HAS_OUTCOME`
- `release:sdl/modules/D3.graphql#L426-L478 (Study)`
