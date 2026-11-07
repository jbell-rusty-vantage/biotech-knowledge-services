---
id: "rel:MATERIAL_CONTAINS"
kind: "relationship"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#MATERIAL_CONTAINS","release:rules/temporal-rules.yaml#MATERIAL_CONTAINS","release:sdl/modules/D1.graphql#L305-L350 (IngredientMaterial)"]
aliases: ["material contains","rel:PROVIDES_CONSTITUENT","rel:QUANTITATIVELY_CONTAINS","PROVIDES_CONSTITUENT","QUANTITATIVELY_CONTAINS"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:fd4ed9df9bc727304184371d1b87930c71992a87ee1e3abfae198a2b21e8753f"
---
# Relationship MATERIAL_CONTAINS



| | |
| --- | --- |
| id | `rel:MATERIAL_CONTAINS` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D1](../modules/D1.md) |
| stored direction | [IngredientMaterial](../nodes/IngredientMaterial.md) → `ChemicalSubstance | Constituent` (always from → to) |
| edge properties | [ContentEdgeProperties](../edge-properties/ContentEdgeProperties.md) |
| cardinality | zero_or_more (one open episode per content statement) |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_MATERIAL_CONTAINS_assertion`, `rel_MATERIAL_CONTAINS_uid`, `rel_MATERIAL_CONTAINS_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:IngredientMaterial)-[:MATERIAL_CONTAINS]->(:ChemicalSubstance | Constituent)`.
- Fields in the stored direction (OUT): `IngredientMaterial.containsConstituents (OUT)`, `IngredientMaterial.containsSubstances (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:MATERIAL_CONTAINS --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [IngredientMaterial](../nodes/IngredientMaterial.md) | [ChemicalSubstance](../nodes/ChemicalSubstance.md) | 1 |
| [IngredientMaterial](../nodes/IngredientMaterial.md) | [Constituent](../nodes/Constituent.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [MATERIAL_CONTAINS](../predicates/MATERIAL_CONTAINS.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-ID-03`, `Q-D1-11`, `Q-D1-13`
- [D1/CQ-ID-03](../patterns/D1/CQ-ID-03.md) (supported)
- [QP/P-12](../patterns/QP/P-12.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:PROVIDES_CONSTITUENT` (merged): D1: merged into MATERIAL_CONTAINS (statementKind QUALITATIVE_PROVIDES, quantity null)
- `rel:QUANTITATIVELY_CONTAINS` (merged): D1: merged into MATERIAL_CONTAINS (statementKind distinguishes declared/standardized/measured/calculated)

## Source definition

- `release:registers/relationship-register.yaml#MATERIAL_CONTAINS`
- `release:rules/temporal-rules.yaml#MATERIAL_CONTAINS`
- `release:sdl/modules/D1.graphql#L305-L350 (IngredientMaterial)`
