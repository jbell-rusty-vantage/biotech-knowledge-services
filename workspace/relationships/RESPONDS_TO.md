---
id: "rel:RESPONDS_TO"
kind: "relationship"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#RESPONDS_TO","release:rules/temporal-rules.yaml#RESPONDS_TO","release:sdl/modules/D13.graphql#L224-L312 (Event)"]
aliases: ["responds to"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:906c8bf9726d02ae6e527a62560c9f94e7a3a1f225eaf4cf96e24652dbbb0dbd"
---
# Relationship RESPONDS_TO



| | |
| --- | --- |
| id | `rel:RESPONDS_TO` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D13](../modules/D13.md) |
| stored direction | [Event](../nodes/Event.md) → [Event](../nodes/Event.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | many-to-many (responding event → stimulus event) |
| temporal | **recorded-only** |
| projection gate | `SUPPORT` |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_RESPONDS_TO_assertion`, `rel_RESPONDS_TO_uid`, `rel_RESPONDS_TO_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Event)-[:RESPONDS_TO]->(:Event)`.
- Fields in the stored direction (OUT): `Event.respondsTo (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:RESPONDS_TO --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Event](../nodes/Event.md) | [Event](../nodes/Event.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [RESPONDS_TO](../predicates/RESPONDS_TO.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D13-01`, `Q-D13-08`, `Q-D13-14`, `Q-D13-15`, `Q-D13-26`
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported)
- [QP/P-08a](../patterns/QP/P-08a.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#RESPONDS_TO`
- `release:rules/temporal-rules.yaml#RESPONDS_TO`
- `release:sdl/modules/D13.graphql#L224-L312 (Event)`
