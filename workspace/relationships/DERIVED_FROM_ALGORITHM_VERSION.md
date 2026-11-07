---
id: "rel:DERIVED_FROM_ALGORITHM_VERSION"
kind: "relationship"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#DERIVED_FROM_ALGORITHM_VERSION","release:rules/temporal-rules.yaml#DERIVED_FROM_ALGORITHM_VERSION","release:sdl/modules/D4.graphql#L475-L520 (AlgorithmVersion)"]
aliases: ["derived from algorithm version"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert"]
cardDigest: "sha256:d24e680f19872113f3762a80557736c2258b8bbc82b0183a662bdef9e7b6e631"
---
# Relationship DERIVED_FROM_ALGORITHM_VERSION



| | |
| --- | --- |
| id | `rel:DERIVED_FROM_ALGORITHM_VERSION` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D4](../modules/D4.md) |
| stored direction | [AlgorithmVersion](../nodes/AlgorithmVersion.md) → [AlgorithmVersion](../nodes/AlgorithmVersion.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | zero_or_one |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_DERIVED_FROM_ALGORITHM_VERSION_assertion`, `rel_DERIVED_FROM_ALGORITHM_VERSION_uid`, `rel_DERIVED_FROM_ALGORITHM_VERSION_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:AlgorithmVersion)-[:DERIVED_FROM_ALGORITHM_VERSION]->(:AlgorithmVersion)`.
- Fields in the stored direction (OUT): `AlgorithmVersion.derivedFrom (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:DERIVED_FROM_ALGORITHM_VERSION --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [AlgorithmVersion](../nodes/AlgorithmVersion.md) | [AlgorithmVersion](../nodes/AlgorithmVersion.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [DERIVED_FROM_ALGORITHM_VERSION](../predicates/DERIVED_FROM_ALGORITHM_VERSION.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-DX-04`, `Q-D4-06`, `Q-D4-20`
(none)

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `rel:DERIVED_FROM_ALGORITHM_VERSION` is unchanged from v1.
(none)

## Source definition

- `release:registers/relationship-register.yaml#DERIVED_FROM_ALGORITHM_VERSION`
- `release:rules/temporal-rules.yaml#DERIVED_FROM_ALGORITHM_VERSION`
- `release:sdl/modules/D4.graphql#L475-L520 (AlgorithmVersion)`
