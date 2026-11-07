---
id: "rel:OPERATIONALIZED_BY"
kind: "relationship"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#OPERATIONALIZED_BY","release:rules/temporal-rules.yaml#OPERATIONALIZED_BY","release:sdl/modules/D5.graphql#L241-L269 (Target)"]
aliases: ["operationalized by"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:c72e00a19d0d4d312c826b91e61a10ebc9a193c61529b073a87d9724af048284"
---
# Relationship OPERATIONALIZED_BY



| | |
| --- | --- |
| id | `rel:OPERATIONALIZED_BY` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D5](../modules/D5.md) |
| stored direction | [Target](../nodes/Target.md) → [Biomarker](../nodes/Biomarker.md) \| [Metric](../nodes/Metric.md) \| [Outcome](../nodes/Outcome.md) \| [Condition](../nodes/Condition.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | many |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_OPERATIONALIZED_BY_assertion`, `rel_OPERATIONALIZED_BY_uid`, `rel_OPERATIONALIZED_BY_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Target)-[:OPERATIONALIZED_BY]->(:Biomarker)` (other declared endpoints below).
- Fields in the stored direction (OUT): `Target.operationalizedBy (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (4 declared, 4 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:OPERATIONALIZED_BY --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Target](../nodes/Target.md) | [Biomarker](../nodes/Biomarker.md) | 1 |
| [Target](../nodes/Target.md) | [Condition](../nodes/Condition.md) | 1 |
| [Target](../nodes/Target.md) | [Metric](../nodes/Metric.md) | 1 |
| [Target](../nodes/Target.md) | [Outcome](../nodes/Outcome.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [OPERATIONALIZED_BY](../predicates/OPERATIONALIZED_BY.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `Q-D5-01`, `Q-D5-14`, `Q-D5-20`
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported)
- [D5/Q-D5-20](../patterns/D5/Q-D5-20.md) (supported)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:OPERATIONALIZED_BY` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#OPERATIONALIZED_BY`
- `release:rules/temporal-rules.yaml#OPERATIONALIZED_BY`
- `release:sdl/modules/D5.graphql#L241-L269 (Target)`
