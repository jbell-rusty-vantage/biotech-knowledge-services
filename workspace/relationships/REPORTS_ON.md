---
id: "rel:REPORTS_ON"
kind: "relationship"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#REPORTS_ON","release:rules/temporal-rules.yaml#REPORTS_ON","release:sdl/modules/D3.graphql#L831-L868 (Publication)"]
aliases: ["reports on","rel:ANALYZES_DATASET","rel:PRODUCED_DATASET","ANALYZES_DATASET","PRODUCED_DATASET"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:895973709dd5c22940dcdc8f60b685eaed56753deb730e093e6933a4639a43a3"
---
# Relationship REPORTS_ON



| | |
| --- | --- |
| id | `rel:REPORTS_ON` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D3](../modules/D3.md) |
| stored direction | [Publication](../nodes/Publication.md) → [Study](../nodes/Study.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | many |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_REPORTS_ON_assertion`, `rel_REPORTS_ON_uid`, `rel_REPORTS_ON_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:Publication)-[:REPORTS_ON]->(:Study)`.
- Fields in the stored direction (OUT): `Publication.reportsOn (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:REPORTS_ON --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [Publication](../nodes/Publication.md) | [Study](../nodes/Study.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [REPORTS_ON](../predicates/REPORTS_ON.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-ST-04`, `CQ-ST-07`, `Q-D3-02`, `Q-D3-03`, `Q-D3-18`
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported)
- [D7/CQ-EC-04#1](../patterns/D7/CQ-EC-04--1.md) (supported)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported)
- [QP/G-4#1](../patterns/QP/G-4--1.md) (unsupported)

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `rel:REPORTS_ON` is unchanged from v1.
- `rel:ANALYZES_DATASET` (merged): D3: REPORTS_ON: replaces pinned ANALYZES_DATASET / PRODUCED_DATASET: a reused cohort is a Study that secondary analyses report on
- `rel:PRODUCED_DATASET` (merged): D3: REPORTS_ON: replaces pinned ANALYZES_DATASET / PRODUCED_DATASET: a reused cohort is a Study that secondary analyses report on

## Source definition

- `release:registers/relationship-register.yaml#REPORTS_ON`
- `release:rules/temporal-rules.yaml#REPORTS_ON`
- `release:sdl/modules/D3.graphql#L831-L868 (Publication)`
