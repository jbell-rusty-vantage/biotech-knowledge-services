---
id: "rel:MEASURES_METRIC"
kind: "relationship"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#MEASURES_METRIC","release:rules/temporal-rules.yaml#MEASURES_METRIC","release:sdl/modules/D4.graphql#L379-L418 (LabTest)"]
aliases: ["measures metric"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:35f631f5215243abff3a7a0b2e1aa4c8e5bd4d99e4a51705bb7e9eee2bf02524"
---
# Relationship MEASURES_METRIC



| | |
| --- | --- |
| id | `rel:MEASURES_METRIC` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D4](../modules/D4.md) |
| stored direction | [LabTest](../nodes/LabTest.md) → [Metric](../nodes/Metric.md) (always from → to) |
| edge properties | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |
| cardinality | one_or_more |
| temporal | **episode** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_MEASURES_METRIC_assertion`, `rel_MEASURES_METRIC_uid`, `rel_MEASURES_METRIC_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:LabTest)-[:MEASURES_METRIC]->(:Metric)`.
- Fields in the stored direction (OUT): `LabTest.metrics (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:MEASURES_METRIC --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [LabTest](../nodes/LabTest.md) | [Metric](../nodes/Metric.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [MEASURES_METRIC](../predicates/MEASURES_METRIC.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- episode: edge carries valid time (validFrom/validTo with basis/precision) and recorded time
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-DX-01`, `Q-D4-01`, `Q-D4-03`, `Q-D4-17`, `Q-D4-25`
- [QP/G-7#1](../patterns/QP/G-7--1.md) (unsupported)
- [QP/P-12](../patterns/QP/P-12.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:MEASURES_METRIC` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#MEASURES_METRIC`
- `release:rules/temporal-rules.yaml#MEASURES_METRIC`
- `release:sdl/modules/D4.graphql#L379-L418 (LabTest)`
