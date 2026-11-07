---
id: "rel:STATED_IN"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#STATED_IN","release:rules/temporal-rules.yaml#STATED_IN","release:sdl/modules/D3.graphql#L707-L734 (OutcomeDefinition)","release:sdl/modules/D3.graphql#L569-L595 (StudyArm)","release:sdl/modules/D3.graphql#L656-L688 (StudyPopulation)","release:sdl/modules/D3.graphql#L752-L811 (StudyResult)"]
aliases: ["stated in","rel:DEFINED_IN","DEFINED_IN"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:3dd4f8bc6b3a81967d6afb10662534b3f16364d2899abbe4e8f70589b79b51fb"
---
# Relationship STATED_IN



| | |
| --- | --- |
| id | `rel:STATED_IN` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D3](../modules/D3.md) |
| stored direction | [StudyArm](../nodes/StudyArm.md) \| [StudyPopulation](../nodes/StudyPopulation.md) \| [OutcomeDefinition](../nodes/OutcomeDefinition.md) \| [StudyResult](../nodes/StudyResult.md) → [RegistrationVersion](../nodes/RegistrationVersion.md) \| [Publication](../nodes/Publication.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | one_or_more per element (exactly_one for StudyResult) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_STATED_IN_assertion`, `rel_STATED_IN_uid`, `rel_STATED_IN_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:StudyArm)-[:STATED_IN]->(:RegistrationVersion)` (other declared endpoints below).
- Fields in the stored direction (OUT): `OutcomeDefinition.statedIn (OUT)`, `StudyArm.statedIn (OUT)`, `StudyPopulation.statedIn (OUT)`, `StudyResult.statedIn (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (8 declared, 8 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:STATED_IN --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [OutcomeDefinition](../nodes/OutcomeDefinition.md) | [Publication](../nodes/Publication.md) | 1 |
| [OutcomeDefinition](../nodes/OutcomeDefinition.md) | [RegistrationVersion](../nodes/RegistrationVersion.md) | 1 |
| [StudyArm](../nodes/StudyArm.md) | [Publication](../nodes/Publication.md) | 1 |
| [StudyArm](../nodes/StudyArm.md) | [RegistrationVersion](../nodes/RegistrationVersion.md) | 1 |
| [StudyPopulation](../nodes/StudyPopulation.md) | [Publication](../nodes/Publication.md) | 1 |
| [StudyPopulation](../nodes/StudyPopulation.md) | [RegistrationVersion](../nodes/RegistrationVersion.md) | 1 |
| [StudyResult](../nodes/StudyResult.md) | [Publication](../nodes/Publication.md) | 1 |
| [StudyResult](../nodes/StudyResult.md) | [RegistrationVersion](../nodes/RegistrationVersion.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [STATED_IN](../predicates/STATED_IN.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-ST-04`, `CQ-ST-05`, `CQ-ST-06`, `Q-D3-01`, `Q-D3-13`, `Q-D3-15`, `Q-D3-16`, `Q-D3-17`
- [D3/CQ-EV-05#2](../patterns/D3/CQ-EV-05--2.md) (supported)
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported)
- [QP/G-4#1](../patterns/QP/G-4--1.md) (unsupported)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `rel:DEFINED_IN` (renamed): D3: STATED_IN: Replaces pinned DEFINED_IN, the DECLARES_OUTCOME_PRIORITY predicate and the SUPPORTED_BY fields on StudyResult / AdverseEventResult

## Source definition

- `release:registers/relationship-register.yaml#STATED_IN`
- `release:rules/temporal-rules.yaml#STATED_IN`
- `release:sdl/modules/D3.graphql#L707-L734 (OutcomeDefinition)`
- `release:sdl/modules/D3.graphql#L569-L595 (StudyArm)`
- `release:sdl/modules/D3.graphql#L656-L688 (StudyPopulation)`
- `release:sdl/modules/D3.graphql#L752-L811 (StudyResult)`
