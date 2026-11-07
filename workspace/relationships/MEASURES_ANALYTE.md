---
id: "rel:MEASURES_ANALYTE"
kind: "relationship"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#MEASURES_ANALYTE","release:rules/temporal-rules.yaml#MEASURES_ANALYTE","release:sdl/modules/D8.graphql#L531-L588 (QualityResult)"]
aliases: ["measures analyte"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:6a7ffaf41ab87ca3b4b91516436dcbcc96e83f4aabb2c3659fbd46d97466555c"
---
# Relationship MEASURES_ANALYTE



| | |
| --- | --- |
| id | `rel:MEASURES_ANALYTE` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D8](../modules/D8.md) |
| stored direction | [QualityResult](../nodes/QualityResult.md) → [ChemicalSubstance](../nodes/ChemicalSubstance.md) \| [IngredientMaterial](../nodes/IngredientMaterial.md) \| [Constituent](../nodes/Constituent.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | zero_or_one |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_MEASURES_ANALYTE_assertion`, `rel_MEASURES_ANALYTE_uid`, `rel_MEASURES_ANALYTE_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:QualityResult)-[:MEASURES_ANALYTE]->(:ChemicalSubstance)` (other declared endpoints below).
- Fields in the stored direction (OUT): `QualityResult.analyte (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (3 declared, 3 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:MEASURES_ANALYTE --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [QualityResult](../nodes/QualityResult.md) | [ChemicalSubstance](../nodes/ChemicalSubstance.md) | 1 |
| [QualityResult](../nodes/QualityResult.md) | [Constituent](../nodes/Constituent.md) | 1 |
| [QualityResult](../nodes/QualityResult.md) | [IngredientMaterial](../nodes/IngredientMaterial.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [MEASURES_ANALYTE](../predicates/MEASURES_ANALYTE.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-19`, `Q-D8-06`
- [D12/Q-D12-03#option-a](../patterns/D12/Q-D12-03--option-a.md) (supported)
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#MEASURES_ANALYTE`
- `release:rules/temporal-rules.yaml#MEASURES_ANALYTE`
- `release:sdl/modules/D8.graphql#L531-L588 (QualityResult)`
