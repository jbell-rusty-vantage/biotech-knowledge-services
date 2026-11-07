---
id: "rel:MENTIONS"
kind: "relationship"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#MENTIONS","release:rules/temporal-rules.yaml#MENTIONS","release:sdl/modules/D9.graphql#L298-L354 (Chunk)"]
aliases: ["mentions","rel:MENTIONS_ENTITY","MENTIONS_ENTITY"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:b349017377e3f18e1e51f222602e99ffe0b60f5aa07507e653be1d72d42180c3"
---
# Relationship MENTIONS



| | |
| --- | --- |
| id | `rel:MENTIONS` |
| class | **derived** — Regenerable projections (mechanism projection, chunk mentions, associations, constraint resolution). Read-only for intents; the projection Activity writes them with projectionOfAssertionUid / derivationRule / derivedAt. A proposal naming a derived type is rejected with DERIVED_EDGE_READ_ONLY. |
| module | [K](../modules/K.md) |
| stored direction | [Chunk](../nodes/Chunk.md) → [Subjectable](../interfaces/Subjectable.md) (always from → to) |
| edge properties | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) |
| cardinality | many |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | to [Subjectable](../interfaces/Subjectable.md) (56 members, kernel-traversal) |
| registered | yes (relationship register) |
| required indexes | `rel_MENTIONS_writer` |
| write with | read-only |

## Stored direction and GraphQL fields

- Stored: `(:Chunk)-[:MENTIONS]->(:Subjectable)`.
- Fields in the stored direction (OUT): `Chunk.mentions (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 56 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:MENTIONS --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Chunk](../nodes/Chunk.md) | [Subjectable](../interfaces/Subjectable.md) | 56 |

## Authorization and evidence

- Derived projection: computed by a registered method, read-only, never proposed and never evidence.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D9-20`
- [D9/Q-D9-20#entity](../patterns/D9/Q-D9-20--entity.md) (supported)
- [QP/P-04b](../patterns/QP/P-04b.md) (supported)
- [QP/P-10a.4](../patterns/QP/P-10a.4.md) (supported)
- [QP/P-10b](../patterns/QP/P-10b.md) (supported)
- [QP/P-10c.2](../patterns/QP/P-10c.2.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:MENTIONS` is unchanged from v1.
- `rel:MENTIONS_ENTITY` (merged): D9: MENTIONS: Replaces pinned MENTIONS_ENTITY (chunk/episode → EpisodeMentionableTarget union) and the MediaSubjectTarget union (75 members)

## Source definition

- `release:registers/relationship-register.yaml#MENTIONS`
- `release:rules/temporal-rules.yaml#MENTIONS`
- `release:sdl/modules/D9.graphql#L298-L354 (Chunk)`
