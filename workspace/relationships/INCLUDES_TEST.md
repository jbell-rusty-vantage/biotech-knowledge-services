---
id: "rel:INCLUDES_TEST"
kind: "relationship"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#INCLUDES_TEST","release:rules/temporal-rules.yaml#INCLUDES_TEST","release:sdl/modules/D4.graphql#L379-L418 (LabTest)"]
aliases: ["includes test","rel:INCLUDES_LABTEST","INCLUDES_LABTEST"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:fe953cb3242e990fe73e2756f2804bccfcb5a91b2a61061227e677884f8eee96"
---
# Relationship INCLUDES_TEST



| | |
| --- | --- |
| id | `rel:INCLUDES_TEST` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D4](../modules/D4.md) |
| stored direction | [LabTest](../nodes/LabTest.md) → [LabTest](../nodes/LabTest.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | many (testKind PANEL only) |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_INCLUDES_TEST_assertion`, `rel_INCLUDES_TEST_uid`, `rel_INCLUDES_TEST_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:LabTest)-[:INCLUDES_TEST]->(:LabTest)`.
- Fields in the stored direction (OUT): `LabTest.components (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:INCLUDES_TEST --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [LabTest](../nodes/LabTest.md) | [LabTest](../nodes/LabTest.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [INCLUDES_TEST](../predicates/INCLUDES_TEST.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D4-03`, `Q-D4-25`
- [QP/G-7#1](../patterns/QP/G-7--1.md) (unsupported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:INCLUDES_LABTEST` (renamed): D4: renamed INCLUDES_TEST (LabTest → LabTest)

## Source definition

- `release:registers/relationship-register.yaml#INCLUDES_TEST`
- `release:rules/temporal-rules.yaml#INCLUDES_TEST`
- `release:sdl/modules/D4.graphql#L379-L418 (LabTest)`
