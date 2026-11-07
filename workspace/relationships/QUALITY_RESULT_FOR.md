---
id: "rel:QUALITY_RESULT_FOR"
kind: "relationship"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#QUALITY_RESULT_FOR","release:rules/temporal-rules.yaml#QUALITY_RESULT_FOR","release:sdl/modules/D8.graphql#L531-L588 (QualityResult)"]
aliases: ["quality result for","rel:INTERPRETS_TESTING_OF","rel:PRODUCED_RESULT","rel:SAMPLE_FROM","rel:SUMMARIZES_TESTING","rel:TESTED_SAMPLE","INTERPRETS_TESTING_OF","PRODUCED_RESULT","SAMPLE_FROM","SUMMARIZES_TESTING","TESTED_SAMPLE"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:df1949f6498179d306b67960b28c6934cabdcc3e7055f625e369aa485ba6e39b"
---
# Relationship QUALITY_RESULT_FOR



| | |
| --- | --- |
| id | `rel:QUALITY_RESULT_FOR` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D8](../modules/D8.md) |
| stored direction | [QualityResult](../nodes/QualityResult.md) → [Lot](../nodes/Lot.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | exactly_one |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_QUALITY_RESULT_FOR_assertion`, `rel_QUALITY_RESULT_FOR_uid`, `rel_QUALITY_RESULT_FOR_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:QualityResult)-[:QUALITY_RESULT_FOR]->(:Lot)`.
- Fields in the stored direction (OUT): `QualityResult.resultFor (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:QUALITY_RESULT_FOR --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [QualityResult](../nodes/QualityResult.md) | [Lot](../nodes/Lot.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [QUALITY_RESULT_FOR](../predicates/QUALITY_RESULT_FOR.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-19`, `Q-D8-05`, `Q-D8-06`, `Q-D8-09`, `Q-D8-18`, `Q-D8-19`
- [D12/Q-D12-03#option-a](../patterns/D12/Q-D12-03--option-a.md) (supported)
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported)
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md)

## v1 navigation aliases

- `rel:INTERPRETS_TESTING_OF` (merged): D8: QUALITY_RESULT_FOR: Replaces SAMPLE_FROM, TESTED_SAMPLE, PRODUCED_RESULT, INTERPRETS_TESTING_OF and SUMMARIZES_TESTING
- `rel:PRODUCED_RESULT` (merged): D8: QUALITY_RESULT_FOR: Replaces SAMPLE_FROM, TESTED_SAMPLE, PRODUCED_RESULT, INTERPRETS_TESTING_OF and SUMMARIZES_TESTING
- `rel:SAMPLE_FROM` (merged): D8: QUALITY_RESULT_FOR: Replaces SAMPLE_FROM, TESTED_SAMPLE, PRODUCED_RESULT, INTERPRETS_TESTING_OF and SUMMARIZES_TESTING
- `rel:SUMMARIZES_TESTING` (merged): D8: QUALITY_RESULT_FOR: Replaces SAMPLE_FROM, TESTED_SAMPLE, PRODUCED_RESULT, INTERPRETS_TESTING_OF and SUMMARIZES_TESTING
- `rel:TESTED_SAMPLE` (merged): D8: QUALITY_RESULT_FOR: Replaces SAMPLE_FROM, TESTED_SAMPLE, PRODUCED_RESULT, INTERPRETS_TESTING_OF and SUMMARIZES_TESTING

## Source definition

- `release:registers/relationship-register.yaml#QUALITY_RESULT_FOR`
- `release:rules/temporal-rules.yaml#QUALITY_RESULT_FOR`
- `release:sdl/modules/D8.graphql#L531-L588 (QualityResult)`
