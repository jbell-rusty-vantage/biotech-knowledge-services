---
id: "rel:CHUNK_OF"
kind: "relationship"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#CHUNK_OF","release:rules/temporal-rules.yaml#CHUNK_OF","release:sdl/modules/D9.graphql#L298-L354 (Chunk)"]
aliases: ["chunk of","rel:FROM_TEXT_VERSION","rel:HAS_CHUNK","rel:HAS_SEGMENTATION","rel:HAS_TEXT_VERSION","rel:TEXT_OF_SNAPSHOT","FROM_TEXT_VERSION","HAS_CHUNK","HAS_SEGMENTATION","HAS_TEXT_VERSION","TEXT_OF_SNAPSHOT"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:51e0aba629e04c6a739257d4210210a3b7c073dcac2abe3ed673d84f71bc8d6c"
---
# Relationship CHUNK_OF



| | |
| --- | --- |
| id | `rel:CHUNK_OF` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D9](../modules/D9.md) |
| stored direction | [Chunk](../nodes/Chunk.md) → [SourceSnapshot](../nodes/SourceSnapshot.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | exactly_one snapshot per chunk |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_CHUNK_OF_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:Chunk)-[:CHUNK_OF]->(:SourceSnapshot)`.
- Fields in the stored direction (OUT): `Chunk.snapshot (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:CHUNK_OF --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Chunk](../nodes/Chunk.md) | [SourceSnapshot](../nodes/SourceSnapshot.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D9-16`, `Q-D9-20`
- [D9/Q-D9-20#entity](../patterns/D9/Q-D9-20--entity.md) (supported)
- [D9/Q-D9-20#vector](../patterns/D9/Q-D9-20--vector.md) (unsupported)
- [QP/P-04a](../patterns/QP/P-04a.md) (unsupported)
- [QP/P-04e](../patterns/QP/P-04e.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:FROM_TEXT_VERSION` (merged): D9: CHUNK_OF: Replaces pinned HAS_CHUNK, FROM_TEXT_VERSION, HAS_TEXT_VERSION, TEXT_OF_SNAPSHOT, HAS_SEGMENTATION (text version and segmentation are chunk prope…
- `rel:HAS_CHUNK` (merged): D9: CHUNK_OF: Replaces pinned HAS_CHUNK, FROM_TEXT_VERSION, HAS_TEXT_VERSION, TEXT_OF_SNAPSHOT, HAS_SEGMENTATION (text version and segmentation are chunk prope…
- `rel:HAS_SEGMENTATION` (merged): D9: CHUNK_OF: Replaces pinned HAS_CHUNK, FROM_TEXT_VERSION, HAS_TEXT_VERSION, TEXT_OF_SNAPSHOT, HAS_SEGMENTATION (text version and segmentation are chunk prope…
- `rel:HAS_TEXT_VERSION` (merged): D9: CHUNK_OF: Replaces pinned HAS_CHUNK, FROM_TEXT_VERSION, HAS_TEXT_VERSION, TEXT_OF_SNAPSHOT, HAS_SEGMENTATION (text version and segmentation are chunk prope…
- `rel:TEXT_OF_SNAPSHOT` (merged): D9: CHUNK_OF: Replaces pinned HAS_CHUNK, FROM_TEXT_VERSION, HAS_TEXT_VERSION, TEXT_OF_SNAPSHOT, HAS_SEGMENTATION (text version and segmentation are chunk prope…

## Source definition

- `release:registers/relationship-register.yaml#CHUNK_OF`
- `release:rules/temporal-rules.yaml#CHUNK_OF`
- `release:sdl/modules/D9.graphql#L298-L354 (Chunk)`
