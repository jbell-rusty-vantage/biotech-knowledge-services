---
id: "rel:DECLARES_COMPONENT"
kind: "relationship"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#DECLARES_COMPONENT","release:rules/temporal-rules.yaml#DECLARES_COMPONENT","release:sdl/modules/D6.graphql#L384-L433 (LabelVersion)"]
aliases: ["declares component","rel:DECLARATION_IDENTIFIES_MATERIAL","rel:HAS_INGREDIENT_COMPONENT","rel:USES_MATERIAL","DECLARATION_IDENTIFIES_MATERIAL","HAS_INGREDIENT_COMPONENT","USES_MATERIAL"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:3036c287af594bc733a5d9d8d644b63109325248fd6775101483f83dd5353953"
---
# Relationship DECLARES_COMPONENT



| | |
| --- | --- |
| id | `rel:DECLARES_COMPONENT` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D6](../modules/D6.md) |
| stored direction | [LabelVersion](../nodes/LabelVersion.md) → [IngredientMaterial](../nodes/IngredientMaterial.md) \| [Constituent](../nodes/Constituent.md) \| [FoodItem](../nodes/FoodItem.md) (always from → to) |
| edge properties | [ComponentLineProperties](../edge-properties/ComponentLineProperties.md) |
| cardinality | many (one per declared panel line, each authorized by its own Assertion; nested lines via parentOrderIndex) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_DECLARES_COMPONENT_assertion`, `rel_DECLARES_COMPONENT_uid`, `rel_DECLARES_COMPONENT_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:LabelVersion)-[:DECLARES_COMPONENT]->(:IngredientMaterial)` (other declared endpoints below).
- Fields in the stored direction (OUT): `LabelVersion.components (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (3 declared, 3 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:DECLARES_COMPONENT --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [LabelVersion](../nodes/LabelVersion.md) | [Constituent](../nodes/Constituent.md) | 1 |
| [LabelVersion](../nodes/LabelVersion.md) | [FoodItem](../nodes/FoodItem.md) | 1 |
| [LabelVersion](../nodes/LabelVersion.md) | [IngredientMaterial](../nodes/IngredientMaterial.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [DECLARES_COMPONENT](../predicates/DECLARES_COMPONENT.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-25`, `CQ-PF-01`, `Q-D6-02`, `Q-D6-08`, `Q-D6-09`, `Q-D6-11`, `Q-D6-12`, `Q-D6-21`
- [D1/CQ-ID-03](../patterns/D1/CQ-ID-03.md) (supported)
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported)
- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported)
- [D6/CQ-AX-25#1](../patterns/D6/CQ-AX-25--1.md) (supported)
- [D6/CQ-PF-01#1](../patterns/D6/CQ-PF-01--1.md) (supported)
- [D6/Q-D6-01#1](../patterns/D6/Q-D6-01--1.md) (supported)
- [D6/Q-D6-08#1](../patterns/D6/Q-D6-08--1.md) (supported)
- [D6/Q-D6-10#1](../patterns/D6/Q-D6-10--1.md) (supported)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported)

## Forbidden implications

- `MEASURED_CONTENT_IN_PRODUCT` does NOT imply `DECLARES_COMPONENT`

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)
- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md)

## v1 navigation aliases

- `rel:DECLARATION_IDENTIFIES_MATERIAL` (merged): D6: merged into DECLARES_COMPONENT
- `rel:HAS_INGREDIENT_COMPONENT` (merged): D6: IngredientComponent became DECLARES_COMPONENT edge properties
- `rel:USES_MATERIAL` (merged): D6: merged into DECLARES_COMPONENT (target D1 IngredientMaterial)

## Source definition

- `release:registers/relationship-register.yaml#DECLARES_COMPONENT`
- `release:rules/temporal-rules.yaml#DECLARES_COMPONENT`
- `release:sdl/modules/D6.graphql#L384-L433 (LabelVersion)`
