---
id: "rel:PARENT_OF"
kind: "relationship"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#PARENT_OF","release:rules/temporal-rules.yaml#PARENT_OF","release:sdl/modules/D7.graphql#L308-L340 (Organization)"]
aliases: ["parent of"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:0a1491cd404ee69b69713caf45c6667b606543ab7d6aae899fc5a00ded07c8f2"
---
# Relationship PARENT_OF



| | |
| --- | --- |
| id | `rel:PARENT_OF` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D7](../modules/D7.md) |
| stored direction | [Organization](../nodes/Organization.md) → [Organization](../nodes/Organization.md) (always from → to) |
| edge properties | [ControlEdgeProperties](../edge-properties/ControlEdgeProperties.md) |
| cardinality | many (parent → child; GLEIF direct and ultimate parents are separate episodes) |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_PARENT_OF_assertion`, `rel_PARENT_OF_uid`, `rel_PARENT_OF_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Organization)-[:PARENT_OF]->(:Organization)`.
- Fields in the stored direction (OUT): `Organization.subsidiaries (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:PARENT_OF --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Organization](../nodes/Organization.md) | [Organization](../nodes/Organization.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [PARENT_OF](../predicates/PARENT_OF.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-CL-05`, `CQ-EC-02`, `CQ-EC-03`, `Q-D7-01`, `Q-D7-09`, `Q-D7-13`, `Q-D7-14`, `Q-D7-19`
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported)
- [D7/Q-D7-06#1](../patterns/D7/Q-D7-06--1.md) (supported)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported)
- [QP/P-09](../patterns/QP/P-09.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest an organization profile (roles, stakes, brands, control)](../tasks/ingest-organization-profile.md)

## v1 navigation aliases

- `rel:PARENT_OF` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#PARENT_OF`
- `release:rules/temporal-rules.yaml#PARENT_OF`
- `release:sdl/modules/D7.graphql#L308-L340 (Organization)`
