---
id: "rel:STATUS_FROM"
kind: "relationship"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#STATUS_FROM","release:rules/temporal-rules.yaml#STATUS_FROM","release:sdl/modules/D8.graphql#L456-L486 (LegalStatus)"]
aliases: ["status from","rel:RESULTS_FROM_RESPONSE","rel:SUBMISSION_HAS_RESPONSE","RESULTS_FROM_RESPONSE","SUBMISSION_HAS_RESPONSE"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:6606c949d638cf36953b9beff48d262bfcd329ff3cc6f9ef9e92e37ac68bcee1"
---
# Relationship STATUS_FROM



| | |
| --- | --- |
| id | `rel:STATUS_FROM` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D8](../modules/D8.md) |
| stored direction | [LegalStatus](../nodes/LegalStatus.md) → [RegulatoryRecord](../nodes/RegulatoryRecord.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | one_or_more |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_STATUS_FROM_assertion`, `rel_STATUS_FROM_uid`, `rel_STATUS_FROM_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:LegalStatus)-[:STATUS_FROM]->(:RegulatoryRecord)`.
- Fields in the stored direction (OUT): `LegalStatus.establishedBy (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (1 declared, 1 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:STATUS_FROM --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [LegalStatus](../nodes/LegalStatus.md) | [RegulatoryRecord](../nodes/RegulatoryRecord.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [STATUS_FROM](../predicates/STATUS_FROM.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-23`, `CQ-MF-02`, `CQ-PF-04`, `Q-D8-01`, `Q-D8-12`, `Q-D8-20`, `Q-D8-23`
- [D8/Q-D8-23](../patterns/D8/Q-D8-23.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a regulatory record (filing, letter, recall, inspection) and the status it establishes](../tasks/ingest-regulatory-filing.md)

## v1 navigation aliases

- `rel:RESULTS_FROM_RESPONSE` (merged): D8: STATUS_FROM: Replaces RESULTS_FROM_RESPONSE and SUBMISSION_HAS_RESPONSE
- `rel:SUBMISSION_HAS_RESPONSE` (merged): D8: STATUS_FROM: Replaces RESULTS_FROM_RESPONSE and SUBMISSION_HAS_RESPONSE

## Source definition

- `release:registers/relationship-register.yaml#STATUS_FROM`
- `release:rules/temporal-rules.yaml#STATUS_FROM`
- `release:sdl/modules/D8.graphql#L456-L486 (LegalStatus)`
