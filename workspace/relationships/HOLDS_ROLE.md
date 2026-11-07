---
id: "rel:HOLDS_ROLE"
kind: "relationship"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HOLDS_ROLE","release:rules/temporal-rules.yaml#HOLDS_ROLE","release:sdl/modules/D7.graphql#L355-L390 (Person)"]
aliases: ["holds role","rel:ADVISES_ORGANIZATION","rel:AFFILIATED_WITH","rel:BOARD_MEMBER_OF","rel:EMPLOYED_BY","rel:FOUNDED_ORGANIZATION","ADVISES_ORGANIZATION","AFFILIATED_WITH","BOARD_MEMBER_OF","EMPLOYED_BY","FOUNDED_ORGANIZATION"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:e8f9ec7682bde20376b95851325b7e5a85cd15b3ab430e75ea1f514cdb001c76"
---
# Relationship HOLDS_ROLE



| | |
| --- | --- |
| id | `rel:HOLDS_ROLE` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D7](../modules/D7.md) |
| stored direction | [Person](../nodes/Person.md) → [Organization](../nodes/Organization.md) (always from → to) |
| edge properties | [RoleEdgeProperties](../edge-properties/RoleEdgeProperties.md) |
| cardinality | many (one episode per authorizing Assertion; several roles at one organization are separate episodes) |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HOLDS_ROLE_assertion`, `rel_HOLDS_ROLE_uid`, `rel_HOLDS_ROLE_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Person)-[:HOLDS_ROLE]->(:Organization)`.
- Fields in the stored direction (OUT): `Person.holdsRoles (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HOLDS_ROLE --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Person](../nodes/Person.md) | [Organization](../nodes/Organization.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [HOLDS_ROLE](../predicates/HOLDS_ROLE.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-18`, `CQ-CL-05`, `CQ-EC-01`, `CQ-EC-03`, `CQ-EC-04`, `Q-D7-02`, `Q-D7-03`, `Q-D7-08`, `Q-D7-12`, `Q-D7-14`, `Q-D7-17`, `Q-D7-25`
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported)
- [D7/CQ-EC-04#1](../patterns/D7/CQ-EC-04--1.md) (supported)
- [D7/Q-D7-02#1](../patterns/D7/Q-D7-02--1.md) (supported)
- [D7/Q-D7-06#1](../patterns/D7/Q-D7-06--1.md) (supported)
- [D7/Q-D7-08#1](../patterns/D7/Q-D7-08--1.md) (supported)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported)
- [D7/Q-D7-25#1](../patterns/D7/Q-D7-25--1.md) (supported)
- [D9/CQ-CL-05](../patterns/D9/CQ-CL-05.md) (supported)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported)
- [D9/Q-D9-21](../patterns/D9/Q-D9-21.md) (supported)
- [K/Q-K-15](../patterns/K/Q-K-15.md) (supported)
- [QP/G-10#1](../patterns/QP/G-10--1.md) (unsupported)
- [QP/G-10#2](../patterns/QP/G-10--2.md) (unsupported)
- [QP/P-09](../patterns/QP/P-09.md) (supported)

## Forbidden implications

- `HOLDS_ROLE` does NOT imply `RECOMMENDS_USE`

## Tasks

- [Ingest an organization profile (roles, stakes, brands, control)](../tasks/ingest-organization-profile.md)
- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md)

## v1 navigation aliases

- `rel:ADVISES_ORGANIZATION` (merged): D7: HOLDS_ROLE: Replaces pinned BOARD_MEMBER_OF, EMPLOYED_BY, ADVISES_ORGANIZATION, FOUNDED_ORGANIZATION and the role half of AFFILIATED_WITH
- `rel:AFFILIATED_WITH` (merged): D7: HOLDS_ROLE: Replaces pinned BOARD_MEMBER_OF, EMPLOYED_BY, ADVISES_ORGANIZATION, FOUNDED_ORGANIZATION and the role half of AFFILIATED_WITH
- `rel:BOARD_MEMBER_OF` (merged): D7: HOLDS_ROLE: Replaces pinned BOARD_MEMBER_OF, EMPLOYED_BY, ADVISES_ORGANIZATION, FOUNDED_ORGANIZATION and the role half of AFFILIATED_WITH
- `rel:EMPLOYED_BY` (merged): D7: HOLDS_ROLE: Replaces pinned BOARD_MEMBER_OF, EMPLOYED_BY, ADVISES_ORGANIZATION, FOUNDED_ORGANIZATION and the role half of AFFILIATED_WITH
- `rel:FOUNDED_ORGANIZATION` (merged): D7: HOLDS_ROLE: Replaces pinned BOARD_MEMBER_OF, EMPLOYED_BY, ADVISES_ORGANIZATION, FOUNDED_ORGANIZATION and the role half of AFFILIATED_WITH

## Source definition

- `release:registers/relationship-register.yaml#HOLDS_ROLE`
- `release:rules/temporal-rules.yaml#HOLDS_ROLE`
- `release:sdl/modules/D7.graphql#L355-L390 (Person)`
