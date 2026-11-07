---
id: "rel:COUNTS_TOWARD_NUTRIENT"
kind: "relationship"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#COUNTS_TOWARD_NUTRIENT","release:rules/temporal-rules.yaml#COUNTS_TOWARD_NUTRIENT","release:sdl/modules/D1.graphql#L256-L285 (ChemicalSubstance)"]
aliases: ["counts toward nutrient"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:03814e51132d4199b6068928ddb80335006d0fef841ffa5c17c54155862ab980"
---
# Relationship COUNTS_TOWARD_NUTRIENT



| | |
| --- | --- |
| id | `rel:COUNTS_TOWARD_NUTRIENT` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D1](../modules/D1.md) |
| stored direction | [ChemicalSubstance](../nodes/ChemicalSubstance.md) → [Constituent](../nodes/Constituent.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | zero_or_more |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_COUNTS_TOWARD_NUTRIENT_assertion`, `rel_COUNTS_TOWARD_NUTRIENT_uid`, `rel_COUNTS_TOWARD_NUTRIENT_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:ChemicalSubstance)-[:COUNTS_TOWARD_NUTRIENT]->(:Constituent)`.
- Fields in the stored direction (OUT): `ChemicalSubstance.nutrients (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:COUNTS_TOWARD_NUTRIENT --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [ChemicalSubstance](../nodes/ChemicalSubstance.md) | [Constituent](../nodes/Constituent.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [COUNTS_TOWARD_NUTRIENT](../predicates/COUNTS_TOWARD_NUTRIENT.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D1-03`, `Q-D1-04`, `Q-D1-19`, `Q-D1-22`, `Q-D1-28`
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported)
- [D6/CQ-AX-25#1](../patterns/D6/CQ-AX-25--1.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

(none)

## Source definition

- `release:registers/relationship-register.yaml#COUNTS_TOWARD_NUTRIENT`
- `release:rules/temporal-rules.yaml#COUNTS_TOWARD_NUTRIENT`
- `release:sdl/modules/D1.graphql#L256-L285 (ChemicalSubstance)`
