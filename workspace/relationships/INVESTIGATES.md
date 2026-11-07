---
id: "rel:INVESTIGATES"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#INVESTIGATES","release:rules/temporal-rules.yaml#INVESTIGATES","release:sdl/modules/D3.graphql#L426-L478 (Study)"]
aliases: ["investigates"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert"]
cardDigest: "sha256:3c1bcd7e53892d4970754b6f26540e2624f30e22297f0c6ebd1cc298f721c9b3"
---
# Relationship INVESTIGATES



| | |
| --- | --- |
| id | `rel:INVESTIGATES` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D3](../modules/D3.md) |
| stored direction | [Study](../nodes/Study.md) → [Condition](../nodes/Condition.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | many |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_INVESTIGATES_assertion`, `rel_INVESTIGATES_uid`, `rel_INVESTIGATES_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Study)-[:INVESTIGATES]->(:Condition)`.
- Fields in the stored direction (OUT): `Study.conditions (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:INVESTIGATES --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Study](../nodes/Study.md) | [Condition](../nodes/Condition.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [INVESTIGATES](../predicates/INVESTIGATES.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D2-06`, `Q-D3-10`
(none)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:INVESTIGATES` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#INVESTIGATES`
- `release:rules/temporal-rules.yaml#INVESTIGATES`
- `release:sdl/modules/D3.graphql#L426-L478 (Study)`
