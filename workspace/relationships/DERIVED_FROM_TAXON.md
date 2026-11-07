---
id: "rel:DERIVED_FROM_TAXON"
kind: "relationship"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#DERIVED_FROM_TAXON","release:rules/temporal-rules.yaml#DERIVED_FROM_TAXON","release:sdl/modules/D1.graphql#L305-L350 (IngredientMaterial)"]
aliases: ["derived from taxon","rel:HAS_STRAIN","HAS_STRAIN"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert"]
cardDigest: "sha256:eb8f8588d36f1d549bf15a88d9f896469084abd4cbe08cca7918eb3075e86371"
---
# Relationship DERIVED_FROM_TAXON



| | |
| --- | --- |
| id | `rel:DERIVED_FROM_TAXON` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D1](../modules/D1.md) |
| stored direction | [IngredientMaterial](../nodes/IngredientMaterial.md) → [Taxon](../nodes/Taxon.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | zero_or_more (one per strain of a consortium) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_DERIVED_FROM_TAXON_assertion`, `rel_DERIVED_FROM_TAXON_uid`, `rel_DERIVED_FROM_TAXON_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:IngredientMaterial)-[:DERIVED_FROM_TAXON]->(:Taxon)`.
- Fields in the stored direction (OUT): `IngredientMaterial.sourceTaxa (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:DERIVED_FROM_TAXON --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [IngredientMaterial](../nodes/IngredientMaterial.md) | [Taxon](../nodes/Taxon.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [DERIVED_FROM_TAXON](../predicates/DERIVED_FROM_TAXON.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D1-11`, `Q-D1-12`, `Q-D1-14`, `Q-D1-15`
(none)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:DERIVED_FROM_TAXON` is unchanged from v1.
- `rel:HAS_STRAIN` (merged): D1: DERIVED_FROM_TAXON: replaces pinned HAS_STRAIN)

## Source definition

- `release:registers/relationship-register.yaml#DERIVED_FROM_TAXON`
- `release:rules/temporal-rules.yaml#DERIVED_FROM_TAXON`
- `release:sdl/modules/D1.graphql#L305-L350 (IngredientMaterial)`
