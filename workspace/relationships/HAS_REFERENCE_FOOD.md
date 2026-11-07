---
id: "rel:HAS_REFERENCE_FOOD"
kind: "relationship"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#HAS_REFERENCE_FOOD","release:rules/temporal-rules.yaml#HAS_REFERENCE_FOOD","release:sdl/modules/D12.graphql#L165-L210 (FoodItem)"]
aliases: ["has reference food"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:034f287e3fc71f8c3ab878cd85d285850d3939c469802641742c67c494c8ab48"
---
# Relationship HAS_REFERENCE_FOOD



| | |
| --- | --- |
| id | `rel:HAS_REFERENCE_FOOD` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D12](../modules/D12.md) |
| stored direction | [Product](../nodes/Product.md) → [FoodItem](../nodes/FoodItem.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | many (a product maps to zero or more reference foods; a reference food to many products) |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_HAS_REFERENCE_FOOD_assertion`, `rel_HAS_REFERENCE_FOOD_uid`, `rel_HAS_REFERENCE_FOOD_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Product)-[:HAS_REFERENCE_FOOD]->(:FoodItem)`.
- Fields in the stored direction (OUT): (none)
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): `FoodItem.referencedByProducts (IN)`

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:HAS_REFERENCE_FOOD --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Product](../nodes/Product.md) | [FoodItem](../nodes/FoodItem.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [HAS_REFERENCE_FOOD](../predicates/HAS_REFERENCE_FOOD.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D12-03`, `Q-D12-04`, `Q-D12-05`, `Q-D12-30`, `Q-D12-34`
- [D12/Q-D12-03#option-a](../patterns/D12/Q-D12-03--option-a.md) (supported)
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#HAS_REFERENCE_FOOD`
- `release:rules/temporal-rules.yaml#HAS_REFERENCE_FOOD`
- `release:sdl/modules/D12.graphql#L165-L210 (FoodItem)`
