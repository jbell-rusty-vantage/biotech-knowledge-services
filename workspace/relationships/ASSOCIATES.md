---
id: "rel:ASSOCIATES"
kind: "relationship"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#ASSOCIATES","release:rules/temporal-rules.yaml#ASSOCIATES","release:sdl/modules/D10.graphql#L271-L314 (Association)"]
aliases: ["associates"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:33d0f81b36f4b41642450fe0435758a4281fd8cf90c429d02d5806d812faff95"
---
# Relationship ASSOCIATES



| | |
| --- | --- |
| id | `rel:ASSOCIATES` |
| class | **derived** — Regenerable projections (mechanism projection, chunk mentions, associations, constraint resolution). Read-only for intents; the projection Activity writes them with projectionOfAssertionUid / derivationRule / derivedAt. A proposal naming a derived type is rejected with DERIVED_EDGE_READ_ONLY. |
| module | [D10](../modules/D10.md) |
| stored direction | [Association](../nodes/Association.md) → [Subjectable](../interfaces/Subjectable.md) (always from → to) |
| edge properties | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) |
| cardinality | exactly_two per Association (anchorUid names the oriented-from member) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | to [Subjectable](../interfaces/Subjectable.md) (56 members, registered-exception) |
| registered | yes (relationship register) |
| required indexes | `rel_ASSOCIATES_writer` |
| write with | read-only |

## Stored direction and GraphQL fields

- Stored: `(:Association)-[:ASSOCIATES]->(:Subjectable)`.
- Fields in the stored direction (OUT): `Association.members (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 56 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:ASSOCIATES --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Association](../nodes/Association.md) | [Subjectable](../interfaces/Subjectable.md) | 56 |

## Authorization and evidence

- Derived projection: computed by a registered method, read-only, never proposed and never evidence.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-EV-02`, `Q-D10-05`, `Q-D10-06`, `Q-D10-19`
- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported)
- [QP/G-0](../patterns/QP/G-0.md) (held)
- [QP/P-10a.4](../patterns/QP/P-10a.4.md) (supported)
- [QP/P-10c.2](../patterns/QP/P-10c.2.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#ASSOCIATES`
- `release:rules/temporal-rules.yaml#ASSOCIATES`
- `release:sdl/modules/D10.graphql#L271-L314 (Association)`
