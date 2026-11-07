---
id: "rel:HAS_ANALYTE"
kind: "relationship"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_ANALYTE","release:rules/temporal-rules.yaml#HAS_ANALYTE","release:sdl/modules/D4.graphql#L292-L319 (Biomarker)"]
aliases: ["has analyte"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural","pattern"]
cardDigest: "sha256:54e5a01d6d44c9bc04ac3a4424af6d0e40dd46e082bc32ad1648a3f68277b8b1"
---
# Relationship HAS_ANALYTE



| | |
| --- | --- |
| id | `rel:HAS_ANALYTE` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D4](../modules/D4.md) |
| stored direction | [Biomarker](../nodes/Biomarker.md) → [ChemicalSubstance](../nodes/ChemicalSubstance.md) \| [MolecularEntity](../nodes/MolecularEntity.md) (always from → to) |
| edge properties | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |
| cardinality | zero_or_one per field (two fields, analytes and analyteEntities; 2 pairs) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_ANALYTE_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:Biomarker)-[:HAS_ANALYTE]->(:ChemicalSubstance)` (other declared endpoints below).
- Fields in the stored direction (OUT): `Biomarker.analyteEntities (OUT)`, `Biomarker.analytes (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_ANALYTE --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Biomarker](../nodes/Biomarker.md) | [ChemicalSubstance](../nodes/ChemicalSubstance.md) | 1 |
| [Biomarker](../nodes/Biomarker.md) | [MolecularEntity](../nodes/MolecularEntity.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D4-01`, `Q-D4-16`
- [QP/P-12](../patterns/QP/P-12.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:HAS_ANALYTE` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#HAS_ANALYTE`
- `release:rules/temporal-rules.yaml#HAS_ANALYTE`
- `release:sdl/modules/D4.graphql#L292-L319 (Biomarker)`
