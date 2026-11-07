---
id: "rel:ADDRESSED_TO"
kind: "relationship"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#ADDRESSED_TO","release:rules/temporal-rules.yaml#ADDRESSED_TO","release:sdl/modules/D8.graphql#L372-L439 (RegulatoryRecord)"]
aliases: ["addressed to","rel:SUBMITTED_BY","SUBMITTED_BY"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:d234cc8ded6f9aad483be916bfdad1f929d54393669c0b056cce4289daaca5b8"
---
# Relationship ADDRESSED_TO



| | |
| --- | --- |
| id | `rel:ADDRESSED_TO` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D8](../modules/D8.md) |
| stored direction | [RegulatoryRecord](../nodes/RegulatoryRecord.md) → [Organization](../nodes/Organization.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | one_or_more |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_ADDRESSED_TO_assertion`, `rel_ADDRESSED_TO_uid`, `rel_ADDRESSED_TO_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:RegulatoryRecord)-[:ADDRESSED_TO]->(:Organization)`.
- Fields in the stored direction (OUT): `RegulatoryRecord.addressedTo (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:ADDRESSED_TO --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [RegulatoryRecord](../nodes/RegulatoryRecord.md) | [Organization](../nodes/Organization.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [ADDRESSED_TO](../predicates/ADDRESSED_TO.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-EC-01`, `CQ-MF-06`, `Q-D8-02`, `Q-D8-03`, `Q-D8-17`
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a regulatory record (filing, letter, recall, inspection) and the status it establishes](../tasks/ingest-regulatory-filing.md)

## v1 navigation aliases

- `rel:SUBMITTED_BY` (renamed): D8: ADDRESSED_TO: Replaces SUBMITTED_BY

## Source definition

- `release:registers/relationship-register.yaml#ADDRESSED_TO`
- `release:rules/temporal-rules.yaml#ADDRESSED_TO`
- `release:sdl/modules/D8.graphql#L372-L439 (RegulatoryRecord)`
