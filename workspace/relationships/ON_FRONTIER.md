---
id: "rel:ON_FRONTIER"
kind: "relationship"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#ON_FRONTIER","release:rules/temporal-rules.yaml#ON_FRONTIER","release:sdl/modules/D13.graphql#L224-L312 (Event)","release:sdl/modules/D13.graphql#L332-L366 (Frontier)"]
aliases: ["on frontier"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:558e76e96e6e06b95b033857f30c8e0cc4432514e1af68a805c0f0ee610a7b20"
---
# Relationship ON_FRONTIER



| | |
| --- | --- |
| id | `rel:ON_FRONTIER` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D13](../modules/D13.md) |
| stored direction | [Event](../nodes/Event.md) \| [Study](../nodes/Study.md) → [Frontier](../nodes/Frontier.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | many; an event or study attaches to 1-2 level-2 frontiers (rarely 3), a level-1 theme only when no child fits |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_ON_FRONTIER_assertion`, `rel_ON_FRONTIER_uid`, `rel_ON_FRONTIER_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Event)-[:ON_FRONTIER]->(:Frontier)` (other declared endpoints below).
- Fields in the stored direction (OUT): `Event.frontiers (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `Frontier.studies (IN)`

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:ON_FRONTIER --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Event](../nodes/Event.md) | [Frontier](../nodes/Frontier.md) | 1 |
| [Study](../nodes/Study.md) | [Frontier](../nodes/Frontier.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [ON_FRONTIER](../predicates/ON_FRONTIER.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D13-01`, `Q-D13-02`, `Q-D13-03`, `Q-D13-04`, `Q-D13-08`, `Q-D13-09`, `Q-D13-16`, `Q-D13-23`, `Q-D13-28`, `Q-D13-29`
- [D13/Q-D13-04#1](../patterns/D13/Q-D13-04--1.md) (supported)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported)
- [D13/Q-D13-22#1](../patterns/D13/Q-D13-22--1.md) (supported)
- [D9/Q-D9-18](../patterns/D9/Q-D9-18.md) (supported)
- [D9/Q-D9-19#projection](../patterns/D9/Q-D9-19--projection.md) (unsupported)
- [QP/G-5#1](../patterns/QP/G-5--1.md) (unsupported)
- [QP/P-08a](../patterns/QP/P-08a.md) (supported)
- [QP/P-08b](../patterns/QP/P-08b.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#ON_FRONTIER`
- `release:rules/temporal-rules.yaml#ON_FRONTIER`
- `release:sdl/modules/D13.graphql#L224-L312 (Event)`
- `release:sdl/modules/D13.graphql#L332-L366 (Frontier)`
