---
id: "rel:MEASURES"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#MEASURES","release:rules/temporal-rules.yaml#MEASURES","release:sdl/modules/D3.graphql#L707-L734 (OutcomeDefinition)"]
aliases: ["measures","rel:MEASURED_BY_METRIC","rel:MEASURES_BIOMARKER","rel:REFERS_TO_OUTCOME","MEASURED_BY_METRIC","MEASURES_BIOMARKER","REFERS_TO_OUTCOME"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:6644ae9176e75b948d02a4de5841ab94b1fe770f833a75c5d334655117081215"
---
# Relationship MEASURES



| | |
| --- | --- |
| id | `rel:MEASURES` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D3](../modules/D3.md) |
| stored direction | [OutcomeDefinition](../nodes/OutcomeDefinition.md) → [Metric](../nodes/Metric.md) \| [Biomarker](../nodes/Biomarker.md) \| [Outcome](../nodes/Outcome.md) \| [Condition](../nodes/Condition.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | zero_or_one |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_MEASURES_assertion`, `rel_MEASURES_uid`, `rel_MEASURES_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:OutcomeDefinition)-[:MEASURES]->(:Metric)` (other declared endpoints below).
- Fields in the stored direction (OUT): `OutcomeDefinition.measures (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (4 declared, 4 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:MEASURES --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [OutcomeDefinition](../nodes/OutcomeDefinition.md) | [Biomarker](../nodes/Biomarker.md) | 1 |
| [OutcomeDefinition](../nodes/OutcomeDefinition.md) | [Condition](../nodes/Condition.md) | 1 |
| [OutcomeDefinition](../nodes/OutcomeDefinition.md) | [Metric](../nodes/Metric.md) | 1 |
| [OutcomeDefinition](../nodes/OutcomeDefinition.md) | [Outcome](../nodes/Outcome.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [MEASURES](../predicates/MEASURES.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-ST-03`, `CQ-ST-06`, `Q-D3-04`, `Q-D3-05`
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported)
- [QP/P-12](../patterns/QP/P-12.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `rel:MEASURES` is unchanged from v1.
- `rel:MEASURED_BY_METRIC` (merged): D3: MEASURES: Replaces pinned MEASURES_BIOMARKER, MEASURED_BY_METRIC and REFERS_TO_OUTCOME
- `rel:MEASURES_BIOMARKER` (merged): D3: MEASURES: Replaces pinned MEASURES_BIOMARKER, MEASURED_BY_METRIC and REFERS_TO_OUTCOME
- `rel:REFERS_TO_OUTCOME` (merged): D3: MEASURES: Replaces pinned MEASURES_BIOMARKER, MEASURED_BY_METRIC and REFERS_TO_OUTCOME

## Source definition

- `release:registers/relationship-register.yaml#MEASURES`
- `release:rules/temporal-rules.yaml#MEASURES`
- `release:sdl/modules/D3.graphql#L707-L734 (OutcomeDefinition)`
