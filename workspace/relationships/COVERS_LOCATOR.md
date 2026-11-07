---
id: "rel:COVERS_LOCATOR"
kind: "relationship"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#COVERS_LOCATOR","release:rules/temporal-rules.yaml#COVERS_LOCATOR","release:sdl/modules/D9.graphql#L298-L354 (Chunk)"]
aliases: ["covers locator","rel:LOCATOR_IN_TEXT_VERSION","rel:RESOLVES_TO_CHUNK","LOCATOR_IN_TEXT_VERSION","RESOLVES_TO_CHUNK"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:0f9208bc9b23e8682e895a5136913949e1a827e04d0edcb71a49d6a9cc564736"
---
# Relationship COVERS_LOCATOR



| | |
| --- | --- |
| id | `rel:COVERS_LOCATOR` |
| class | **derived** — Regenerable projections (mechanism projection, chunk mentions, associations, constraint resolution). Read-only for intents; the projection Activity writes them with projectionOfAssertionUid / derivationRule / derivedAt. A proposal naming a derived type is rejected with DERIVED_EDGE_READ_ONLY. |
| module | [D9](../modules/D9.md) |
| stored direction | [Chunk](../nodes/Chunk.md) → [SourceLocator](../nodes/SourceLocator.md) (always from → to) |
| edge properties | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) |
| cardinality | many (every locator in the same snapshot whose offsets overlap the chunk span in the same text basis) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_COVERS_LOCATOR_writer` |
| write with | read-only |

## Stored direction and GraphQL fields

- Stored: `(:Chunk)-[:COVERS_LOCATOR]->(:SourceLocator)`.
- Fields in the stored direction (OUT): `Chunk.locators (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:COVERS_LOCATOR --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Chunk](../nodes/Chunk.md) | [SourceLocator](../nodes/SourceLocator.md) | 1 |

## Authorization and evidence

- Derived projection: computed by a registered method, read-only, never proposed and never evidence.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-PV-04`, `Q-D9-20`
- [D9/CQ-PV-04](../patterns/D9/CQ-PV-04.md) (supported)
- [D9/Q-D9-20#entity](../patterns/D9/Q-D9-20--entity.md) (supported)
- [D9/Q-D9-20#vector](../patterns/D9/Q-D9-20--vector.md) (unsupported)
- [QP/P-04a](../patterns/QP/P-04a.md) (unsupported)
- [QP/P-04b](../patterns/QP/P-04b.md) (supported)
- [QP/P-04c](../patterns/QP/P-04c.md) (supported)
- [QP/P-10a.4](../patterns/QP/P-10a.4.md) (supported)
- [QP/P-10c.2](../patterns/QP/P-10c.2.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:LOCATOR_IN_TEXT_VERSION` (merged): D9: COVERS_LOCATOR: Replaces pinned LOCATOR_IN_TEXT_VERSION, RESOLVES_TO_CHUNK and SUPPORTED_BY_CHUNK (the last was a document→record support edge, forbidden b…
- `rel:RESOLVES_TO_CHUNK` (merged): D9: COVERS_LOCATOR: Replaces pinned LOCATOR_IN_TEXT_VERSION, RESOLVES_TO_CHUNK and SUPPORTED_BY_CHUNK (the last was a document→record support edge, forbidden b…

## Source definition

- `release:registers/relationship-register.yaml#COVERS_LOCATOR`
- `release:rules/temporal-rules.yaml#COVERS_LOCATOR`
- `release:sdl/modules/D9.graphql#L298-L354 (Chunk)`
