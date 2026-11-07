---
id: "rel:HAS_STUDY_ROLE"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_STUDY_ROLE","release:rules/temporal-rules.yaml#HAS_STUDY_ROLE","release:sdl/modules/D3.graphql#L426-L478 (Study)"]
aliases: ["has study role","rel:INVESTIGATED_BY","rel:OPERATED_BY","rel:SPONSORED_BY","INVESTIGATED_BY","OPERATED_BY","SPONSORED_BY"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:ce48ec37ff2321b453f593cc9f661c1ff5a1daa7b8f41f6ea71cc42c8aaeb7f5"
---
# Relationship HAS_STUDY_ROLE



| | |
| --- | --- |
| id | `rel:HAS_STUDY_ROLE` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D3](../modules/D3.md) |
| stored direction | [Study](../nodes/Study.md) → [Organization](../nodes/Organization.md) \| [Person](../nodes/Person.md) \| [Award](../nodes/Award.md) (always from → to) |
| edge properties | [StudyRoleEdgeProperties](../edge-properties/StudyRoleEdgeProperties.md) |
| cardinality | many (one episode per party, roleKind and asserting registry or paper) |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_STUDY_ROLE_assertion`, `rel_HAS_STUDY_ROLE_uid`, `rel_HAS_STUDY_ROLE_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Study)-[:HAS_STUDY_ROLE]->(:Organization)` (other declared endpoints below).
- Fields in the stored direction (OUT): `Study.roles (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (3 declared, 3 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_STUDY_ROLE --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Study](../nodes/Study.md) | [Award](../nodes/Award.md) | 1 |
| [Study](../nodes/Study.md) | [Organization](../nodes/Organization.md) | 1 |
| [Study](../nodes/Study.md) | [Person](../nodes/Person.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [HAS_STUDY_ROLE](../predicates/HAS_STUDY_ROLE.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D3-02`, `Q-D3-08`, `Q-D3-09`, `Q-D3-10`
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported)
- [D7/CQ-EC-04#1](../patterns/D7/CQ-EC-04--1.md) (supported)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported)
- [QP/P-08b](../patterns/QP/P-08b.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:INVESTIGATED_BY` (merged): D3: HAS_STUDY_ROLE: Replaces pinned derived SPONSORED_BY, OPERATED_BY and INVESTIGATED_BY
- `rel:OPERATED_BY` (merged): D3: HAS_STUDY_ROLE: Replaces pinned derived SPONSORED_BY, OPERATED_BY and INVESTIGATED_BY
- `rel:SPONSORED_BY` (merged): D3: HAS_STUDY_ROLE: Replaces pinned derived SPONSORED_BY, OPERATED_BY and INVESTIGATED_BY

## Source definition

- `release:registers/relationship-register.yaml#HAS_STUDY_ROLE`
- `release:rules/temporal-rules.yaml#HAS_STUDY_ROLE`
- `release:sdl/modules/D3.graphql#L426-L478 (Study)`
