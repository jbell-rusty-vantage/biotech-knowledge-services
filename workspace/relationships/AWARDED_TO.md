---
id: "rel:AWARDED_TO"
kind: "relationship"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#AWARDED_TO","release:rules/temporal-rules.yaml#AWARDED_TO","release:sdl/modules/D7.graphql#L434-L471 (Award)"]
aliases: ["awarded to"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:5061e1ec2f9fff29fb1f4c2a02098d3c0c200104f304cce0ab178a77b0bce341"
---
# Relationship AWARDED_TO



| | |
| --- | --- |
| id | `rel:AWARDED_TO` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D7](../modules/D7.md) |
| stored direction | [Award](../nodes/Award.md) → [Organization](../nodes/Organization.md) \| [Person](../nodes/Person.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | many (recipient institutions; principal / contact investigator or individual recipient) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_AWARDED_TO_assertion`, `rel_AWARDED_TO_uid`, `rel_AWARDED_TO_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Award)-[:AWARDED_TO]->(:Organization)` (other declared endpoints below).
- Fields in the stored direction (OUT): `Award.recipientOrganizations (OUT)`, `Award.recipientPersons (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:AWARDED_TO --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Award](../nodes/Award.md) | [Organization](../nodes/Organization.md) | 1 |
| [Award](../nodes/Award.md) | [Person](../nodes/Person.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [AWARDED_TO](../predicates/AWARDED_TO.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-EC-04`, `Q-D7-05`, `Q-D7-15`, `Q-D7-16`, `Q-D7-25`
- [D7/CQ-EC-04#1](../patterns/D7/CQ-EC-04--1.md) (supported)
- [D7/Q-D7-25#1](../patterns/D7/Q-D7-25--1.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest an organization profile (roles, stakes, brands, control)](../tasks/ingest-organization-profile.md)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#AWARDED_TO`
- `release:rules/temporal-rules.yaml#AWARDED_TO`
- `release:sdl/modules/D7.graphql#L434-L471 (Award)`
