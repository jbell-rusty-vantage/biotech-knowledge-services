---
id: "rel:PATTERN_COMPONENT"
kind: "relationship"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#PATTERN_COMPONENT","release:rules/temporal-rules.yaml#PATTERN_COMPONENT","release:sdl/modules/D12.graphql#L278-L309 (DietaryPattern)"]
aliases: ["pattern component"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert"]
cardDigest: "sha256:3880e5991e9a6052f7f44dd87f046a3bc30ff017ad778962a639b0a93c199c42"
---
# Relationship PATTERN_COMPONENT



| | |
| --- | --- |
| id | `rel:PATTERN_COMPONENT` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D12](../modules/D12.md) |
| stored direction | [DietaryPattern](../nodes/DietaryPattern.md) → [FoodItem](../nodes/FoodItem.md) \| [FoodCategory](../nodes/FoodCategory.md) \| [Constituent](../nodes/Constituent.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | many (pattern → component; one edge per defining statement) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_PATTERN_COMPONENT_assertion`, `rel_PATTERN_COMPONENT_uid`, `rel_PATTERN_COMPONENT_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:DietaryPattern)-[:PATTERN_COMPONENT]->(:FoodItem)` (other declared endpoints below).
- Fields in the stored direction (OUT): `DietaryPattern.components (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (3 declared, 3 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:PATTERN_COMPONENT --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [DietaryPattern](../nodes/DietaryPattern.md) | [Constituent](../nodes/Constituent.md) | 1 |
| [DietaryPattern](../nodes/DietaryPattern.md) | [FoodCategory](../nodes/FoodCategory.md) | 1 |
| [DietaryPattern](../nodes/DietaryPattern.md) | [FoodItem](../nodes/FoodItem.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [PATTERN_COMPONENT](../predicates/PATTERN_COMPONENT.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D12-08`, `Q-D12-11`, `Q-D12-23`, `Q-D12-25`
(none)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#PATTERN_COMPONENT`
- `release:rules/temporal-rules.yaml#PATTERN_COMPONENT`
- `release:sdl/modules/D12.graphql#L278-L309 (DietaryPattern)`
