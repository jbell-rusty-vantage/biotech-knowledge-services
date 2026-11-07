---
id: "rel:RESOLVES_TO_CONSTRAINT"
kind: "relationship"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#RESOLVES_TO_CONSTRAINT","release:rules/temporal-rules.yaml#RESOLVES_TO_CONSTRAINT","release:sdl/modules/D5.graphql#L499-L535 (UseConstraint)"]
aliases: ["resolves to constraint"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:5029d4bbf6a0db0dfaf0d94bfd7ab20cb11ff8f48ba42050402d1ebbf81e1a86"
---
# Relationship RESOLVES_TO_CONSTRAINT



| | |
| --- | --- |
| id | `rel:RESOLVES_TO_CONSTRAINT` |
| class | **derived** — Regenerable projections (mechanism projection, chunk mentions, associations, constraint resolution). Read-only for intents; the projection Activity writes them with projectionOfAssertionUid / derivationRule / derivedAt. A proposal naming a derived type is rejected with DERIVED_EDGE_READ_ONLY. |
| module | [D5](../modules/D5.md) |
| stored direction | [Assertion](../nodes/Assertion.md) → [UseConstraint](../nodes/UseConstraint.md) (always from → to) |
| edge properties | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) |
| cardinality | zero_or_one per Assertion; one_or_more per UseConstraint |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_RESOLVES_TO_CONSTRAINT_writer` |
| write with | read-only |

## Stored direction and GraphQL fields

- Stored: `(:Assertion)-[:RESOLVES_TO_CONSTRAINT]->(:UseConstraint)`.
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `UseConstraint.resolvedFrom (IN)`

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:RESOLVES_TO_CONSTRAINT --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Assertion](../nodes/Assertion.md) | [UseConstraint](../nodes/UseConstraint.md) | 1 |

## Authorization and evidence

- Derived projection: computed by a registered method, read-only, never proposed and never evidence.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-RC-06`, `Q-D5-03`, `Q-D5-04`, `Q-D5-05`, `Q-D5-21`, `Q-D5-23`, `Q-D5-24`, `Q-D5-26`
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported)
- [QP/P-07](../patterns/QP/P-07.md) (supported)
- [QP/P-10a.4](../patterns/QP/P-10a.4.md) (supported)
- [QP/P-10c.2](../patterns/QP/P-10c.2.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:RESOLVES_TO_CONSTRAINT` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#RESOLVES_TO_CONSTRAINT`
- `release:rules/temporal-rules.yaml#RESOLVES_TO_CONSTRAINT`
- `release:sdl/modules/D5.graphql#L499-L535 (UseConstraint)`
