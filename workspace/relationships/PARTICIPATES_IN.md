---
id: "rel:PARTICIPATES_IN"
kind: "relationship"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#PARTICIPATES_IN","release:rules/temporal-rules.yaml#PARTICIPATES_IN","release:sdl/modules/D2.graphql#L255-L288 (Mechanism)","release:sdl/modules/D2.graphql#L300-L323 (MolecularEntity)"]
aliases: ["participates in"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:166cb9e0ef8d04c05c6e767045b3de38e64da6fc57b61420f75dc2a0f985c3c9"
---
# Relationship PARTICIPATES_IN



| | |
| --- | --- |
| id | `rel:PARTICIPATES_IN` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D2](../modules/D2.md) |
| stored direction | [MolecularEntity](../nodes/MolecularEntity.md) \| [ChemicalSubstance](../nodes/ChemicalSubstance.md) → [Mechanism](../nodes/Mechanism.md) (always from → to) |
| edge properties | [MechanismReferenceProperties](../edge-properties/MechanismReferenceProperties.md) |
| cardinality | many (a gene or metabolite participates in many mechanisms; a pathway has tens to hundreds of participants); one episode per authorizing Assertion |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_PARTICIPATES_IN_assertion`, `rel_PARTICIPATES_IN_uid`, `rel_PARTICIPATES_IN_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:MolecularEntity)-[:PARTICIPATES_IN]->(:Mechanism)` (other declared endpoints below).
- Fields in the stored direction (OUT): `MolecularEntity.participatesIn (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `Mechanism.metaboliteParticipants (IN)`

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:PARTICIPATES_IN --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [ChemicalSubstance](../nodes/ChemicalSubstance.md) | [Mechanism](../nodes/Mechanism.md) | 1 |
| [MolecularEntity](../nodes/MolecularEntity.md) | [Mechanism](../nodes/Mechanism.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [PARTICIPATES_IN](../predicates/PARTICIPATES_IN.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-MX-01`, `Q-D2-03`, `Q-D2-08`, `Q-D2-11`, `Q-D2-13`, `Q-D2-19`
- [QP/P-12](../patterns/QP/P-12.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Record mechanism evidence (measured vs inferred) for a substance](../tasks/ingest-mechanism-evidence.md)

## v1 navigation aliases

- `rel:PARTICIPATES_IN` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#PARTICIPATES_IN`
- `release:rules/temporal-rules.yaml#PARTICIPATES_IN`
- `release:sdl/modules/D2.graphql#L255-L288 (Mechanism)`
- `release:sdl/modules/D2.graphql#L300-L323 (MolecularEntity)`
