---
id: "rel:ISSUED_BY"
kind: "relationship"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:registers/relationship-register.yaml#ISSUED_BY","release:rules/temporal-rules.yaml#ISSUED_BY","release:sdl/modules/D8.graphql#L598-L633 (CertificationListing)","release:sdl/modules/D8.graphql#L531-L588 (QualityResult)","release:sdl/modules/D8.graphql#L372-L439 (RegulatoryRecord)"]
aliases: ["issued by","rel:COA_ISSUED_BY","rel:CONDUCTED_BY","COA_ISSUED_BY","CONDUCTED_BY"]
capabilities: ["get","neighbors","slice","find","propose:edge.assert","pattern"]
cardDigest: "sha256:ee0d815ca6f93b9b30441666c79291fce4222e8cb834eeec8edf1aaf9d433ba6"
---
# Relationship ISSUED_BY



| | |
| --- | --- |
| id | `rel:ISSUED_BY` |
| class | **asserted** — One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| module | [D8](../modules/D8.md) |
| stored direction | [RegulatoryRecord](../nodes/RegulatoryRecord.md) \| [QualityResult](../nodes/QualityResult.md) \| [CertificationListing](../nodes/CertificationListing.md) → [Organization](../nodes/Organization.md) (always from → to) |
| edge properties | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) |
| cardinality | exactly_one per RegulatoryRecord and CertificationListing; zero_or_one per QualityResult (a COA can name no issuer, OQ-D8-22) |
| temporal | **recorded-only** |
| projection gate | (none) |
| interface endpoints | (none) |
| registered | yes (relationship register) |
| required indexes | `rel_ISSUED_BY_assertion`, `rel_ISSUED_BY_uid`, `rel_ISSUED_BY_writer` |
| write with | `edge.assert` |

## Stored direction and GraphQL fields

- Stored: `(:RegulatoryRecord)-[:ISSUED_BY]->(:Organization)` (other declared endpoints below).
- Fields in the stored direction (OUT): `CertificationListing.issuedBy (OUT)`, `QualityResult.issuedBy (OUT)`, `RegulatoryRecord.issuedBy (OUT)`
- Inverse GraphQL fields (IN; read the stored edge backwards, never a second edge): (none)

## Endpoints (3 declared, 3 concrete pairs)

Interface and union endpoints are not expanded here; expand with `bks-schema neighbors rel:ISSUED_BY --expand`.

| from | to | concrete pairs |
| --- | --- | --- |
| [CertificationListing](../nodes/CertificationListing.md) | [Organization](../nodes/Organization.md) | 1 |
| [QualityResult](../nodes/QualityResult.md) | [Organization](../nodes/Organization.md) | 1 |
| [RegulatoryRecord](../nodes/RegulatoryRecord.md) | [Organization](../nodes/Organization.md) | 1 |

## Authorization and evidence

- Each stored edge is authorized by exactly one Assertion (`r.assertionUid`) with predicate [ISSUED_BY](../predicates/ISSUED_BY.md) (authorizing); the Assertion cites its evidence: `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.

## Temporal rule

- recorded-only: edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Questions and read patterns

- Questions: `CQ-AX-19`, `CQ-MF-02`, `CQ-PF-03a`, `Q-D8-02`, `Q-D8-05`, `Q-D8-06`, `Q-D8-12`, `Q-D8-22`
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported)
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported)

## Forbidden implications

(none)

## Tasks

- [Ingest a regulatory record (filing, letter, recall, inspection) and the status it establishes](../tasks/ingest-regulatory-filing.md)
- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md)

## v1 navigation aliases

- `rel:ISSUED_BY` is unchanged from v1.
- `rel:COA_ISSUED_BY` (merged): D8: ISSUED_BY: Replaces the pinned RegulatoryAgency and TestingLaboratory node types and COA_ISSUED_BY / PERFORMED_BY_LAB / CONDUCTED_BY
- `rel:CONDUCTED_BY` (merged): D8: ISSUED_BY: Replaces the pinned RegulatoryAgency and TestingLaboratory node types and COA_ISSUED_BY / PERFORMED_BY_LAB / CONDUCTED_BY

## Source definition

- `release:registers/relationship-register.yaml#ISSUED_BY`
- `release:rules/temporal-rules.yaml#ISSUED_BY`
- `release:sdl/modules/D8.graphql#L598-L633 (CertificationListing)`
- `release:sdl/modules/D8.graphql#L531-L588 (QualityResult)`
- `release:sdl/modules/D8.graphql#L372-L439 (RegulatoryRecord)`
