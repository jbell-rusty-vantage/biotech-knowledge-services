---
id: "rel:HAS_EDITION"
kind: "relationship"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_EDITION","release:rules/temporal-rules.yaml#HAS_EDITION","release:sdl/modules/D5.graphql#L321-L339 (Protocol)"]
aliases: ["has edition","rel:HAS_PROTOCOL_EDITION","HAS_PROTOCOL_EDITION"]
capabilities: ["get","neighbors","slice","find","propose:state.attach","pattern"]
cardDigest: "sha256:6ea5fababd40083c162b708791457ee8b3551b5960a7ac0392c99d686d190a81"
---
# Relationship HAS_EDITION



| | |
| --- | --- |
| id | `rel:HAS_EDITION` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D5](../modules/D5.md) |
| stored direction | [Protocol](../nodes/Protocol.md) → [ProtocolEdition](../nodes/ProtocolEdition.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | one_or_more (EXCLUSIVE per protocol: one open episode in valid x recorded time; register field exclusive: true, R-10) |
| temporal | **episode** · **exclusive** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_EDITION_assertion`, `rel_HAS_EDITION_uid`, `rel_HAS_EDITION_writer` |
| write with | `state.attach` |

## Stored direction and GraphQL fields

- Stored: `(:Protocol)-[:HAS_EDITION]->(:ProtocolEdition)`.
- Fields in the stored direction (OUT): `Protocol.editions (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_EDITION --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Protocol](../nodes/Protocol.md) | [ProtocolEdition](../nodes/ProtocolEdition.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [HAS_EDITION](../predicates/HAS_EDITION.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Exclusivity scope (TM-01): Exclusive (non-overlapping) episodes are scoped to (subject, relationship/predicate slot, asserter): same-asserter overlap is rejected; different asserters coexist and cross-source disagreement is preserved. Separately defined global identity constraints are not weakened. K owns CQ-TM-05 and the exclusivity contract; module register rows supply slot policies (exclusive: true).
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-PR-01`, `Q-D5-10`, `Q-D5-13`, `Q-D5-24`
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported)
- [QP/G-9#1](../patterns/QP/G-9--1.md) (unsupported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:HAS_PROTOCOL_EDITION` (renamed): D5: renamed HAS_EDITION (D5-internal, one meaning)

## Source definition

- `release:registers/relationship-register.yaml#HAS_EDITION`
- `release:rules/temporal-rules.yaml#HAS_EDITION`
- `release:sdl/modules/D5.graphql#L321-L339 (Protocol)`
