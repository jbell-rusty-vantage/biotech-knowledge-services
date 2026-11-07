---
id: "rel:REVISES"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#REVISES","release:rules/temporal-rules.yaml#REVISES","release:sdl/modules/D3.graphql#L831-L868 (Publication)"]
aliases: ["revises","rel:CORRECTS","rel:RETRACTS","CORRECTS","RETRACTS"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:a7cba83745bb5b1484687a75e0f497c19a512da88bb9cd82195da9e855a050d8"
---
# Relationship REVISES



| | |
| --- | --- |
| id | `rel:REVISES` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D3](../modules/D3.md) |
| stored direction | [Publication](../nodes/Publication.md) → [Publication](../nodes/Publication.md) (always from → to) |
| edge properties | [RevisionEdgeProperties](../edge-properties/RevisionEdgeProperties.md) |
| cardinality | many (one episode per asserter) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_REVISES_assertion`, `rel_REVISES_uid`, `rel_REVISES_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Publication)-[:REVISES]->(:Publication)`.
- Fields in the stored direction (OUT): `Publication.revises (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:REVISES --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Publication](../nodes/Publication.md) | [Publication](../nodes/Publication.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [REVISES](../predicates/REVISES.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-EV-05`, `Q-D3-03`, `Q-D3-11`, `Q-D3-12`
- [D11/Q-D11-05](../patterns/D11/Q-D11-05.md) (supported)
- [D11/Q-D11-19](../patterns/D11/Q-D11-19.md) (supported)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported)
- [D3/CQ-EV-05#1](../patterns/D3/CQ-EV-05--1.md) (supported)
- [K/Q-K-10#1](../patterns/K/Q-K-10--1.md) (supported)
- [K/Q-K-17](../patterns/K/Q-K-17.md) (supported)
- [K/Q-K-22](../patterns/K/Q-K-22.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:CORRECTS` (merged): D3: REVISES: Replaces pinned CORRECTS and RETRACTS (+ PublicationRevisionProperties)
- `rel:RETRACTS` (merged): D3: REVISES: Replaces pinned CORRECTS and RETRACTS (+ PublicationRevisionProperties)

## Source definition

- `release:registers/relationship-register.yaml#REVISES`
- `release:rules/temporal-rules.yaml#REVISES`
- `release:sdl/modules/D3.graphql#L831-L868 (Publication)`
