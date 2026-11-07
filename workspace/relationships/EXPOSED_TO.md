---
id: "rel:EXPOSED_TO"
kind: "relationship"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#EXPOSED_TO","release:rules/temporal-rules.yaml#EXPOSED_TO","release:sdl/modules/D2.graphql#L343-L396 (MechanismEvidenceContext)"]
aliases: ["exposed to"]
capabilities: ["get","neighbors","slice","find","propose:edge.structural"]
cardDigest: "sha256:988e23cee5d427f3afb3ba74b4c86c7fcc461c51d0dc7ab04ddb225c7e91416f"
---
# Relationship EXPOSED_TO



| | |
| --- | --- |
| id | `rel:EXPOSED_TO` |
| class | **structural** — Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| module | [D2](../modules/D2.md) |
| stored direction | [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) → [ChemicalSubstance](../nodes/ChemicalSubstance.md) \| [IngredientMaterial](../nodes/IngredientMaterial.md) \| [Intervention](../nodes/Intervention.md) (always from → to) |
| edge properties | [ExposureRoleProperties](../edge-properties/ExposureRoleProperties.md) |
| cardinality | one_or_more per context (exactly one TESTED unless geneticManipulation is set; BACKGROUND and COMPARATOR optional; combinations are several TESTED with orderIndex) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_EXPOSED_TO_writer` |
| write with | `edge.structural` |

## Stored direction and GraphQL fields

- Stored: `(:MechanismEvidenceContext)-[:EXPOSED_TO]->(:ChemicalSubstance)` (other declared endpoints below).
- Fields in the stored direction (OUT): `MechanismEvidenceContext.exposures (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (3 declared, 3 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:EXPOSED_TO --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) | [ChemicalSubstance](../nodes/ChemicalSubstance.md) | 1 |
| [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) | [IngredientMaterial](../nodes/IngredientMaterial.md) | 1 |
| [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) | [Intervention](../nodes/Intervention.md) | 1 |

## Authorization and evidence

- Structural: no Assertion authorizes it; it is created with its endpoints (`edge.structural`).

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-MX-02`, `CQ-MX-04`, `Q-D2-04`, `Q-D2-09`
(none)

## Forbidden implications

(none)

## Tasks

- [Record mechanism evidence (measured vs inferred) for a substance](../tasks/ingest-mechanism-evidence.md)

## v1 navigation aliases

- `rel:EXPOSED_TO` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#EXPOSED_TO`
- `release:rules/temporal-rules.yaml#EXPOSED_TO`
- `release:sdl/modules/D2.graphql#L343-L396 (MechanismEvidenceContext)`
