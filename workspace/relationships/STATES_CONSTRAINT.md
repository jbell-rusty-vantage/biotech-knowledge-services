---
id: "rel:STATES_CONSTRAINT"
kind: "relationship"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#STATES_CONSTRAINT","release:rules/temporal-rules.yaml#STATES_CONSTRAINT","release:sdl/modules/D5.graphql#L398-L473 (ProtocolStep)"]
aliases: ["states constraint","rel:HAS_CONSTRAINT","HAS_CONSTRAINT"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:2c7365a5d00a4d35b62ba38f5989bb114d0ce2a6765e3dfa5e7416d5f9d5cf09"
---
# Relationship STATES_CONSTRAINT



| | |
| --- | --- |
| id | `rel:STATES_CONSTRAINT` |
| class | **derived** — Regenerable projections (mechanism projection, chunk mentions, associations, constraint resolution). Read-only for intents; the projection Activity writes them with projectionOfAssertionUid / derivationRule / derivedAt. A proposal naming a derived type is rejected with DERIVED_EDGE_READ_ONLY. |
| module | [D5](../modules/D5.md) |
| stored direction | [ProtocolStep](../nodes/ProtocolStep.md) → [UseConstraint](../nodes/UseConstraint.md) (always from → to) |
| edge properties | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) |
| cardinality | many |
| temporal | **recorded-only (derivedAt)** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_STATES_CONSTRAINT_writer` |
| write with | read-only |

## Stored direction and GraphQL fields

- Stored: `(:ProtocolStep)-[:STATES_CONSTRAINT]->(:UseConstraint)`.
- Fields in the stored direction (OUT): `ProtocolStep.statesConstraints (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:STATES_CONSTRAINT --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [ProtocolStep](../nodes/ProtocolStep.md) | [UseConstraint](../nodes/UseConstraint.md) | 1 |

## Authorization and evidence

- Derived projection: computed by a registered method, read-only, never proposed and never evidence.

## Temporal rule

- recorded-only (derivedAt): edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-PR-02`, `Q-D5-03`, `Q-D5-11`
- [QP/P-10a.4](../patterns/QP/P-10a.4.md) (supported)
- [QP/P-10c.2](../patterns/QP/P-10c.2.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:HAS_CONSTRAINT` (renamed): D5: STATES_CONSTRAINT: Replaces pinned HAS_CONSTRAINT -> Constraint and its ConstraintRole edge properties (role is derivable from stepKind + statedLevel)

## Source definition

- `release:registers/relationship-register.yaml#STATES_CONSTRAINT`
- `release:rules/temporal-rules.yaml#STATES_CONSTRAINT`
- `release:sdl/modules/D5.graphql#L398-L473 (ProtocolStep)`
