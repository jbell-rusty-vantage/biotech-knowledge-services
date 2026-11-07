---
id: "rel:REALIZES_SUBSTANCE"
kind: "relationship"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#REALIZES_SUBSTANCE","release:rules/temporal-rules.yaml#REALIZES_SUBSTANCE","release:sdl/modules/D1.graphql#L305-L350 (IngredientMaterial)"]
aliases: ["realizes substance","rel:FORM_OF_SUBSTANCE","rel:HAS_CHEMICAL_FORM","FORM_OF_SUBSTANCE","HAS_CHEMICAL_FORM"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:bb6707fa577d29ec23bdcee90fd54ed03723332bbef7ebb47366daba9b64b1b2"
---
# Relationship REALIZES_SUBSTANCE



| | |
| --- | --- |
| id | `rel:REALIZES_SUBSTANCE` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D1](../modules/D1.md) |
| stored direction | [IngredientMaterial](../nodes/IngredientMaterial.md) → [ChemicalSubstance](../nodes/ChemicalSubstance.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | zero_or_more |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_REALIZES_SUBSTANCE_assertion`, `rel_REALIZES_SUBSTANCE_uid`, `rel_REALIZES_SUBSTANCE_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(:ChemicalSubstance)`.
- Fields in the stored direction (OUT): `IngredientMaterial.substances (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:REALIZES_SUBSTANCE --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [IngredientMaterial](../nodes/IngredientMaterial.md) | [ChemicalSubstance](../nodes/ChemicalSubstance.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [REALIZES_SUBSTANCE](../predicates/REALIZES_SUBSTANCE.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-ID-03`, `CQ-ID-06`, `CQ-ST-02`, `Q-D1-05`, `Q-D1-07`, `Q-D1-17`, `Q-D1-26`
- [D1/CQ-ID-03](../patterns/D1/CQ-ID-03.md) (supported)
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported)
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported)
- [D6/CQ-AX-25#1](../patterns/D6/CQ-AX-25--1.md) (supported)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported)
- [D8/Q-D8-10](../patterns/D8/Q-D8-10.md) (supported)
- [D8/Q-D8-13](../patterns/D8/Q-D8-13.md) (supported)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported)
- [QP/P-12](../patterns/QP/P-12.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:REALIZES_SUBSTANCE` is unchanged from v1.
- `rel:FORM_OF_SUBSTANCE` (merged): D1: REALIZES_SUBSTANCE: absorbs FORM_OF_SUBSTANCE / HAS_CHEMICAL_FORM (ChemicalForm cut)
- `rel:HAS_CHEMICAL_FORM` (merged): D1: REALIZES_SUBSTANCE: absorbs FORM_OF_SUBSTANCE / HAS_CHEMICAL_FORM (ChemicalForm cut)

## Source definition

- `release:registers/relationship-register.yaml#REALIZES_SUBSTANCE`
- `release:rules/temporal-rules.yaml#REALIZES_SUBSTANCE`
- `release:sdl/modules/D1.graphql#L305-L350 (IngredientMaterial)`
