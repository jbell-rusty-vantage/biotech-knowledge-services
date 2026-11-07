---
id: "rel:FOOD_CONTAINS"
kind: "relationship"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#FOOD_CONTAINS","release:rules/temporal-rules.yaml#FOOD_CONTAINS","release:sdl/modules/D12.graphql#L165-L210 (FoodItem)"]
aliases: ["food contains"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:6ede03c6c52699b4b826220af70fe657678582079ac8dd4b0ab843ad6bb56ce4"
---
# Relationship FOOD_CONTAINS



| | |
| --- | --- |
| id | `rel:FOOD_CONTAINS` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D12](../modules/D12.md) |
| stored direction | [FoodItem](../nodes/FoodItem.md) → [ChemicalSubstance](../nodes/ChemicalSubstance.md) \| [Constituent](../nodes/Constituent.md) (always from → to) |
| edge properties | [FoodContentProperties](../edge-properties/FoodContentProperties.md) |
| cardinality | many (FoodItem → component; one line per authorizing Assertion; a revised value supersedes through recordedTo, never overwrites) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_FOOD_CONTAINS_assertion`, `rel_FOOD_CONTAINS_uid`, `rel_FOOD_CONTAINS_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:FoodItem)-[:FOOD_CONTAINS]->(:ChemicalSubstance)` (other declared endpoints below).
- Fields in the stored direction (OUT): `FoodItem.components (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:FOOD_CONTAINS --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [FoodItem](../nodes/FoodItem.md) | [ChemicalSubstance](../nodes/ChemicalSubstance.md) | 1 |
| [FoodItem](../nodes/FoodItem.md) | [Constituent](../nodes/Constituent.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [FOOD_CONTAINS](../predicates/FOOD_CONTAINS.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D12-01`, `Q-D12-02`, `Q-D12-20`, `Q-D12-21`, `Q-D12-24`
- [QP/G-8#1](../patterns/QP/G-8--1.md) (unsupported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#FOOD_CONTAINS`
- `release:rules/temporal-rules.yaml#FOOD_CONTAINS`
- `release:sdl/modules/D12.graphql#L165-L210 (FoodItem)`
