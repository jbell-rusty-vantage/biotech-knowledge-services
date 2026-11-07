---
id: "rel:DOCUMENTED_BY_RECORD"
kind: "relationship"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#DOCUMENTED_BY_RECORD","release:rules/temporal-rules.yaml#DOCUMENTED_BY_RECORD","release:sdl/modules/D13.graphql#L224-L312 (Event)"]
aliases: ["documented by record"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:638f71d60abf53638b578870b87e8c404f132afd30d0ee1a93ee1b8a0b0d0055"
---
# Relationship DOCUMENTED_BY_RECORD



| | |
| --- | --- |
| id | `rel:DOCUMENTED_BY_RECORD` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D13](../modules/D13.md) |
| stored direction | [Event](../nodes/Event.md) → [RegulatoryRecord](../nodes/RegulatoryRecord.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | many (usually one record per regulatory occurrence: Drugs@FDA action, designation, warning letter, recall) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_DOCUMENTED_BY_RECORD_assertion`, `rel_DOCUMENTED_BY_RECORD_uid`, `rel_DOCUMENTED_BY_RECORD_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Event)-[:DOCUMENTED_BY_RECORD]->(:RegulatoryRecord)`.
- Fields in the stored direction (OUT): `Event.regulatoryRecords (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:DOCUMENTED_BY_RECORD --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Event](../nodes/Event.md) | [RegulatoryRecord](../nodes/RegulatoryRecord.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [DOCUMENTED_BY_RECORD](../predicates/DOCUMENTED_BY_RECORD.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D13-12`, `Q-D13-14`, `Q-D13-22`
- [D13/Q-D13-04#1](../patterns/D13/Q-D13-04--1.md) (supported)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported)
- [D13/Q-D13-22#1](../patterns/D13/Q-D13-22--1.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:DOCUMENTED_BY_RECORD` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#DOCUMENTED_BY_RECORD`
- `release:rules/temporal-rules.yaml#DOCUMENTED_BY_RECORD`
- `release:sdl/modules/D13.graphql#L224-L312 (Event)`
