---
id: "rel:ADMINISTERS"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#ADMINISTERS","release:rules/temporal-rules.yaml#ADMINISTERS","release:sdl/modules/D3.graphql#L608-L644 (InterventionComponent)"]
aliases: ["administers","rel:FOLLOWS_INTERVENTION_DEFINITION","rel:USES_INTERVENTION_DEVICE","rel:USES_INTERVENTION_MATERIAL","FOLLOWS_INTERVENTION_DEFINITION","USES_INTERVENTION_DEVICE","USES_INTERVENTION_MATERIAL"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:90112710d96ea94104e7ccd4d81c259201a175611d132a3cba8233b0bf977cf3"
---
# Relationship ADMINISTERS



| | |
| --- | --- |
| id | `rel:ADMINISTERS` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D3](../modules/D3.md) |
| stored direction | [InterventionComponent](../nodes/InterventionComponent.md) → [IngredientMaterial](../nodes/IngredientMaterial.md) \| [ProductVariant](../nodes/ProductVariant.md) \| [Intervention](../nodes/Intervention.md) \| [FoodItem](../nodes/FoodItem.md) \| [DietaryPattern](../nodes/DietaryPattern.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | zero_or_one (exactly one once resolved) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_ADMINISTERS_assertion`, `rel_ADMINISTERS_uid`, `rel_ADMINISTERS_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:InterventionComponent)-[:ADMINISTERS]->(:IngredientMaterial)` (other declared endpoints below).
- Fields in the stored direction (OUT): `InterventionComponent.administers (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (5 declared, 5 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:ADMINISTERS --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [InterventionComponent](../nodes/InterventionComponent.md) | [DietaryPattern](../nodes/DietaryPattern.md) | 1 |
| [InterventionComponent](../nodes/InterventionComponent.md) | [FoodItem](../nodes/FoodItem.md) | 1 |
| [InterventionComponent](../nodes/InterventionComponent.md) | [IngredientMaterial](../nodes/IngredientMaterial.md) | 1 |
| [InterventionComponent](../nodes/InterventionComponent.md) | [Intervention](../nodes/Intervention.md) | 1 |
| [InterventionComponent](../nodes/InterventionComponent.md) | [ProductVariant](../nodes/ProductVariant.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [ADMINISTERS](../predicates/ADMINISTERS.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-ST-01`, `CQ-ST-02`, `Q-D3-04`, `Q-D3-05`, `Q-D3-06`
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `rel:FOLLOWS_INTERVENTION_DEFINITION` (merged): D3: ADMINISTERS: Replaces pinned USES_INTERVENTION_MATERIAL, USES_INTERVENTION_DEVICE and FOLLOWS_INTERVENTION_DEFINITION
- `rel:USES_INTERVENTION_DEVICE` (merged): D3: ADMINISTERS: Replaces pinned USES_INTERVENTION_MATERIAL, USES_INTERVENTION_DEVICE and FOLLOWS_INTERVENTION_DEFINITION
- `rel:USES_INTERVENTION_MATERIAL` (merged): D3: ADMINISTERS: Replaces pinned USES_INTERVENTION_MATERIAL, USES_INTERVENTION_DEVICE and FOLLOWS_INTERVENTION_DEFINITION

## Source definition

- `release:registers/relationship-register.yaml#ADMINISTERS`
- `release:rules/temporal-rules.yaml#ADMINISTERS`
- `release:sdl/modules/D3.graphql#L608-L644 (InterventionComponent)`
