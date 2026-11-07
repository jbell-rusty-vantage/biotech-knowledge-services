---
id: "rel:IN_FOOD_CATEGORY"
kind: "relationship"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#IN_FOOD_CATEGORY","release:rules/temporal-rules.yaml#IN_FOOD_CATEGORY","release:sdl/modules/D12.graphql#L228-L255 (FoodCategory)","release:sdl/modules/D12.graphql#L165-L210 (FoodItem)"]
aliases: ["in food category"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert"]
cardDigest: "sha256:58e871dd5e967acde05f1d3a4c5072974fe80048d531ac045e1e52e0de29fe13"
---
# Relationship IN_FOOD_CATEGORY



| | |
| --- | --- |
| id | `rel:IN_FOOD_CATEGORY` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D12](../modules/D12.md) |
| stored direction | [FoodItem](../nodes/FoodItem.md) \| [Product](../nodes/Product.md) → [FoodCategory](../nodes/FoodCategory.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | many (a food or product belongs to one category per system, several systems) |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_IN_FOOD_CATEGORY_assertion`, `rel_IN_FOOD_CATEGORY_uid`, `rel_IN_FOOD_CATEGORY_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:FoodItem)-[:IN_FOOD_CATEGORY]->(:FoodCategory)` (other declared endpoints below).
- Fields in the stored direction (OUT): `FoodItem.categories (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `FoodCategory.memberProducts (IN)`

## Endpoints (2 declared, 2 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:IN_FOOD_CATEGORY --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [FoodItem](../nodes/FoodItem.md) | [FoodCategory](../nodes/FoodCategory.md) | 1 |
| [Product](../nodes/Product.md) | [FoodCategory](../nodes/FoodCategory.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [IN_FOOD_CATEGORY](../predicates/IN_FOOD_CATEGORY.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D12-08`, `Q-D12-14`, `Q-D12-15`, `Q-D12-26`, `Q-D12-31`
(none)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#IN_FOOD_CATEGORY`
- `release:rules/temporal-rules.yaml#IN_FOOD_CATEGORY`
- `release:sdl/modules/D12.graphql#L228-L255 (FoodCategory)`
- `release:sdl/modules/D12.graphql#L165-L210 (FoodItem)`
