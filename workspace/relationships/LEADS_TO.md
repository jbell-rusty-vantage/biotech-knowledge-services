---
id: "rel:LEADS_TO"
kind: "relationship"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#LEADS_TO","release:rules/temporal-rules.yaml#LEADS_TO","release:sdl/modules/D13.graphql#L224-L312 (Event)"]
aliases: ["leads to","rel:CAUSED_BY","CAUSED_BY"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:5e057e510e34968ad3c10162ba00e92bf899a5f3719a60522679956521515f1a"
---
# Relationship LEADS_TO



| | |
| --- | --- |
| id | `rel:LEADS_TO` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D13](../modules/D13.md) |
| stored direction | [Event](../nodes/Event.md) → [Event](../nodes/Event.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | many-to-many (earlier enabling event → later enabled event) |
| temporal | **recorded-only** |
| projection gate | `SUPPORT` |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_LEADS_TO_assertion`, `rel_LEADS_TO_uid`, `rel_LEADS_TO_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Event)-[:LEADS_TO]->(:Event)`.
- Fields in the stored direction (OUT): `Event.leadsTo (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:LEADS_TO --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Event](../nodes/Event.md) | [Event](../nodes/Event.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [LEADS_TO](../predicates/LEADS_TO.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D13-01`, `Q-D13-05`, `Q-D13-06`
- [QP/P-08a](../patterns/QP/P-08a.md) (supported)
- [QP/P-08c](../patterns/QP/P-08c.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:CAUSED_BY` (renamed): D13: LEADS_TO: Replaces pinned CAUSED_BY (effect → cause) with the forward direction investors read ("readout leads to filing leads to approval")

## Source definition

- `release:registers/relationship-register.yaml#LEADS_TO`
- `release:rules/temporal-rules.yaml#LEADS_TO`
- `release:sdl/modules/D13.graphql#L224-L312 (Event)`
