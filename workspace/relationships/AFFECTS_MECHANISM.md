---
id: "rel:AFFECTS_MECHANISM"
kind: "relationship"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#AFFECTS_MECHANISM","release:rules/temporal-rules.yaml#AFFECTS_MECHANISM","release:sdl/modules/D2.graphql#L255-L288 (Mechanism)"]
aliases: ["affects mechanism"]
capabilities: ["get","neighbors","slice","find","read-only","pattern"]
cardDigest: "sha256:043cce0e6316b62206044646cd09192b536c05545be7361c0974805f068633bd"
---
# Relationship AFFECTS_MECHANISM



| | |
| --- | --- |
| id | `rel:AFFECTS_MECHANISM` |
| class | **derived** — Regenerable projections (mechanism projection, chunk mentions, associations, constraint resolution). Read-only for intents; the projection Activity writes them with projectionOfAssertionUid / derivationRule / derivedAt. A proposal naming a derived type is rejected with DERIVED_EDGE_READ_ONLY. |
| module | [D2](../modules/D2.md) |
| stored direction | [ChemicalSubstance](../nodes/ChemicalSubstance.md) \| [Intervention](../nodes/Intervention.md) → [Mechanism](../nodes/Mechanism.md) (always from → to) |
| edge properties | [MechanismProjectionProperties](../edge-properties/MechanismProjectionProperties.md) |
| cardinality | many; at most one edge per (modulator, mechanism, derivationRule) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_AFFECTS_MECHANISM_writer` |
| write with | read-only |

## Stored direction and GraphQL fields

- Stored: `(:ChemicalSubstance)-[:AFFECTS_MECHANISM]->(:Mechanism)` (other declared endpoints below).
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `Mechanism.affectedBy (IN)`

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:AFFECTS_MECHANISM --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [ChemicalSubstance](../nodes/ChemicalSubstance.md) | [Mechanism](../nodes/Mechanism.md) | 1 |
| [Intervention](../nodes/Intervention.md) | [Mechanism](../nodes/Mechanism.md) | 1 |

## Authorization and evidence

- Derived projection: computed by a registered method, read-only, never proposed and never evidence.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-MX-05`, `Q-D2-02`, `Q-D2-03`, `Q-D2-06`, `Q-D2-10`, `Q-D2-19`, `Q-D2-26`
- [D2/Q-D2-10](../patterns/D2/Q-D2-10.md) (supported)
- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported)
- [QP/G-6#2](../patterns/QP/G-6--2.md) (unsupported)
- [QP/P-10a.4](../patterns/QP/P-10a.4.md) (supported)
- [QP/P-10c.2](../patterns/QP/P-10c.2.md) (supported)
- [QP/P-12](../patterns/QP/P-12.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Record mechanism evidence (measured vs inferred) for a substance](../tasks/ingest-mechanism-evidence.md)

## v1 navigation aliases

- `rel:AFFECTS_MECHANISM` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#AFFECTS_MECHANISM`
- `release:rules/temporal-rules.yaml#AFFECTS_MECHANISM`
- `release:sdl/modules/D2.graphql#L255-L288 (Mechanism)`
