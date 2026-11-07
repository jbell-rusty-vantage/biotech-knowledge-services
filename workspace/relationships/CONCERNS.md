---
id: "rel:CONCERNS"
kind: "relationship"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#CONCERNS","release:rules/temporal-rules.yaml#CONCERNS","release:sdl/modules/D8.graphql#L645-L689 (Patent)","release:sdl/modules/D8.graphql#L372-L439 (RegulatoryRecord)"]
aliases: ["concerns","rel:INSPECTED_FACILITY","rel:LICENSE_COVERS","rel:SUBMISSION_ABOUT","INSPECTED_FACILITY","LICENSE_COVERS","SUBMISSION_ABOUT"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:47f1b3a7f04962a75ca72c3e386a138a4e81cc99426de4dafd42b607f6f2056a"
---
# Relationship CONCERNS



| | |
| --- | --- |
| id | `rel:CONCERNS` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D8](../modules/D8.md) |
| stored direction | [RegulatoryRecord](../nodes/RegulatoryRecord.md) \| [Patent](../nodes/Patent.md) → [ChemicalSubstance](../nodes/ChemicalSubstance.md) \| [IngredientMaterial](../nodes/IngredientMaterial.md) \| [Product](../nodes/Product.md) \| [Lot](../nodes/Lot.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | many (RegulatoryRecord -> union RegulatoryRecordTopic, 4 members; Patent -> D1.ChemicalSubstance only, R-73) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_CONCERNS_assertion`, `rel_CONCERNS_uid`, `rel_CONCERNS_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:RegulatoryRecord)-[:CONCERNS]->(:ChemicalSubstance)` (other declared endpoints below).
- Fields in the stored direction (OUT): `Patent.concerns (OUT)`, `RegulatoryRecord.concerns (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (5 declared, 5 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:CONCERNS --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Patent](../nodes/Patent.md) | [ChemicalSubstance](../nodes/ChemicalSubstance.md) | 1 |
| [RegulatoryRecord](../nodes/RegulatoryRecord.md) | [ChemicalSubstance](../nodes/ChemicalSubstance.md) | 1 |
| [RegulatoryRecord](../nodes/RegulatoryRecord.md) | [IngredientMaterial](../nodes/IngredientMaterial.md) | 1 |
| [RegulatoryRecord](../nodes/RegulatoryRecord.md) | [Lot](../nodes/Lot.md) | 1 |
| [RegulatoryRecord](../nodes/RegulatoryRecord.md) | [Product](../nodes/Product.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [CONCERNS](../predicates/CONCERNS.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-EC-01`, `Q-D8-02`, `Q-D8-04`, `Q-D8-10`, `Q-D8-11`, `Q-D8-13`, `Q-D8-16`, `Q-D8-17`, `Q-D8-18`, `Q-D8-19`, `Q-D8-23`
- [D8/Q-D8-10](../patterns/D8/Q-D8-10.md) (supported)
- [D8/Q-D8-13](../patterns/D8/Q-D8-13.md) (supported)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported)
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported)
- [D8/Q-D8-23](../patterns/D8/Q-D8-23.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a regulatory record (filing, letter, recall, inspection) and the status it establishes](../tasks/ingest-regulatory-filing.md)

## v1 navigation aliases

- `rel:INSPECTED_FACILITY` (merged): D8: CONCERNS: replaces SUBMISSION_ABOUT, INSPECTED_FACILITY's product side, the recall→product/lot links and LICENSE_COVERS' topical half
- `rel:LICENSE_COVERS` (merged): D8: CONCERNS: replaces SUBMISSION_ABOUT, INSPECTED_FACILITY's product side, the recall→product/lot links and LICENSE_COVERS' topical half
- `rel:SUBMISSION_ABOUT` (merged): D8: CONCERNS: replaces SUBMISSION_ABOUT, INSPECTED_FACILITY's product side, the recall→product/lot links and LICENSE_COVERS' topical half

## Source definition

- `release:registers/relationship-register.yaml#CONCERNS`
- `release:rules/temporal-rules.yaml#CONCERNS`
- `release:sdl/modules/D8.graphql#L645-L689 (Patent)`
- `release:sdl/modules/D8.graphql#L372-L439 (RegulatoryRecord)`
