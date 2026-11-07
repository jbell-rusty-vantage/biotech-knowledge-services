---
id: "rel:PUBLISHES"
kind: "relationship"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#PUBLISHES","release:rules/temporal-rules.yaml#PUBLISHES","release:sdl/modules/D9.graphql#L233-L283 (MediaWork)"]
aliases: ["publishes","rel:DISTRIBUTES_RENDITION","rel:HAS_EPISODE","rel:HAS_SERIES","rel:ON_PLATFORM","DISTRIBUTES_RENDITION","HAS_EPISODE","HAS_SERIES","ON_PLATFORM"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:5c4e10a7255893860477a8e7c7a59a01b5fe075145306863401283142472e02d"
---
# Relationship PUBLISHES



| | |
| --- | --- |
| id | `rel:PUBLISHES` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D9](../modules/D9.md) |
| stored direction | [Channel](../nodes/Channel.md) → [MediaWork](../nodes/MediaWork.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | one_or_more per work (a cross-posted work is carried by several channels); many per channel |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_PUBLISHES_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:Channel)-[:PUBLISHES]->(:MediaWork)`.
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `MediaWork.channels (IN)`

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:PUBLISHES --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Channel](../nodes/Channel.md) | [MediaWork](../nodes/MediaWork.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-CL-05`, `Q-D9-12`
- [D9/CQ-CL-05](../patterns/D9/CQ-CL-05.md) (supported)
- [D9/CQ-PV-05](../patterns/D9/CQ-PV-05.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)

## v1 navigation aliases

- `rel:DISTRIBUTES_RENDITION` (merged): D9: PUBLISHES: Replaces pinned HAS_EPISODE, HAS_SERIES, DISTRIBUTES_RENDITION, ON_PLATFORM (platform is a Channel property)
- `rel:HAS_EPISODE` (merged): D9: PUBLISHES: Replaces pinned HAS_EPISODE, HAS_SERIES, DISTRIBUTES_RENDITION, ON_PLATFORM (platform is a Channel property)
- `rel:HAS_SERIES` (merged): D9: PUBLISHES: Replaces pinned HAS_EPISODE, HAS_SERIES, DISTRIBUTES_RENDITION, ON_PLATFORM (platform is a Channel property)
- `rel:ON_PLATFORM` (merged): D9: PUBLISHES: Replaces pinned HAS_EPISODE, HAS_SERIES, DISTRIBUTES_RENDITION, ON_PLATFORM (platform is a Channel property)

## Source definition

- `release:registers/relationship-register.yaml#PUBLISHES`
- `release:rules/temporal-rules.yaml#PUBLISHES`
- `release:sdl/modules/D9.graphql#L233-L283 (MediaWork)`
