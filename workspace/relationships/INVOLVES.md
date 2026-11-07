---
id: "rel:INVOLVES"
kind: "relationship"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#INVOLVES","release:rules/temporal-rules.yaml#INVOLVES","release:sdl/modules/D13.graphql#L224-L312 (Event)"]
aliases: ["involves","rel:HOSTS_EVENT","HOSTS_EVENT"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:b953f9219897d0d939845b94a59c6d503b99dc1282cc0792dc5a5f3668aab9c7"
---
# Relationship INVOLVES



| | |
| --- | --- |
| id | `rel:INVOLVES` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D13](../modules/D13.md) |
| stored direction | [Event](../nodes/Event.md) → [Organization](../nodes/Organization.md) \| [Person](../nodes/Person.md) (always from → to) |
| edge properties | [EventRoleEdgeProperties](../edge-properties/EventRoleEdgeProperties.md) |
| cardinality | many (one episode per participant and role) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_INVOLVES_assertion`, `rel_INVOLVES_uid`, `rel_INVOLVES_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Event)-[:INVOLVES]->(:Organization)` (other declared endpoints below).
- Fields in the stored direction (OUT): `Event.involvedOrganizations (OUT)`, `Event.involvedPeople (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:INVOLVES --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Event](../nodes/Event.md) | [Organization](../nodes/Organization.md) | 1 |
| [Event](../nodes/Event.md) | [Person](../nodes/Person.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [INVOLVES](../predicates/INVOLVES.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D13-03`, `Q-D13-06`, `Q-D13-14`, `Q-D13-15`, `Q-D13-21`, `Q-D13-23`, `Q-D13-25`, `Q-D13-33`
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported)
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

- `rel:INVOLVES` is unchanged from v1.
- `rel:HOSTS_EVENT` (merged): D13: folded into INVOLVES (no host role needed by any D13 question; Community cut)

## Source definition

- `release:registers/relationship-register.yaml#INVOLVES`
- `release:rules/temporal-rules.yaml#INVOLVES`
- `release:sdl/modules/D13.graphql#L224-L312 (Event)`
