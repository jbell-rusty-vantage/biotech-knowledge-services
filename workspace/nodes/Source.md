---
id: "node:Source"
kind: "node"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L546-L570","release:registers/node-register.yaml#Source","release:workspace-inputs/identity-rules.yaml#Source"]
aliases: ["source","node:CertificateOfAnalysis","node:Document","node:LotTestSummary","node:MediaVariant","CertificateOfAnalysis","Document","LotTestSummary","MediaVariant"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:ce42c383ed134a319a1c2b75a91a7edec8aeac964cf12bdd130f2b3e7eb9c710"
---
# Source

Purpose: stable identity of one retrieval endpoint (one normalized canonicalUri): a page, registry record, PDF, API record, feed item or media file. Identity rule: `canonicalUri` (normalized post-redirect endpoint; never an identifier resolver). uid token: `source` (hu:source:<host-path-slug>). Implements Subjectable so identifiers (DOI of the endpoint, NCT of a registry record page) and assertions about the endpoint (retracted, paywalled) attach without a domain type. Editorial containers (MediaWork, Channel) are D9 types; scholarly publications are D3 Publications (R-09, R-71). A Source is grouped with its work by RENDITION_OF (kernel meaning, asserted, recorded time only; declared IN on D9 MediaWork.renditions and D3 Publication.renditions; R-43). Its source family is the OCCURS_IN work of the evidence, else its RENDITION_OF work, else the Source itself. Curation files (target and frontier vocabularies, the D2 hallmark mapping) are Sources with one snapshot per version (R-26). Questions: Q-K-01, Q-K-10, Q-K-20, Q-K-21.

## Identity

| | |
| --- | --- |
| id | `node:Source` · raw SDL [sdl:Source](../sdl/Source.graphql) |
| module / domain | [K](../modules/K.md) / [Kernel, identity, time and provenance](../domains/kernel-and-provenance.md) |
| uid | `hu:source:<opaque>` |
| stored labels | `Source` `Entity` (primary `Source`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `canonicalUri` |
| identity keys | `uid`, `canonicalUri`, `name` |
| identifier schemes | `DOI` (active), `PMID` (active), `PMCID` (active), `NCT` (active), `SEC_ACCESSION` (disabled), `YOUTUBE_VIDEO` (disabled), `PODCAST_GUID` (active), `WIKIDATA` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (11)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | kernel.graphql:L550 |
| `uid` | `String!` | yes | create+update |  | kernel.graphql:L551 |
| `canonicalUri` | `String!` | yes | create+update | Normalized post-redirect endpoint; unique. | kernel.graphql:L559 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update | Title as displayed by the endpoint; presentation only. | kernel.graphql:L553 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L555 |
| `sourceKind` | [SourceKind](../vocabularies/SourceKind.md) | yes | create+update | Capture-level kind (verification.v1). | kernel.graphql:L561 |
| `genre` | `String` |  | create+update | Editorial genre (controlled string from the D9 source register: PEER_REVIEWED_PUBLICATION, TRIAL_REGISTRY_RECORD, PRESS_RELEASE, MARKETING_PAGE, PODC… | kernel.graphql:L563 |
| `logicalIdentity` | `String` |  | create+update | verification.v1 VerificationSource.logicalIdentity when the verifier assigned one. | kernel.graphql:L565 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | kernel.graphql:L556 |
| `updatedAt` | `DateTime` |  | create+update |  | kernel.graphql:L557 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | kernel.graphql:L554 |

## Outgoing relationships (5)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Source --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md) | [SourceSnapshot](SourceSnapshot.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Source.snapshots (OUT); SourceSnapshot.source (IN) | planner-emitted (kernel plumbing) |
| [RENDITION_OF](../relationships/RENDITION_OF.md) | [MediaWork](MediaWork.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | MediaWork.renditions (IN) | `edge.assert` |
| [RENDITION_OF](../relationships/RENDITION_OF.md) | [Publication](Publication.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Publication.renditions (IN) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (10)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (10)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [AWARD_ACKNOWLEDGED_BY](../predicates/AWARD_ACKNOWLEDGED_BY.md) | object | relationship | assertion-only | D7 |
| [DISCLOSES_INTERESTS_OF](../predicates/DISCLOSES_INTERESTS_OF.md) | subject | relationship | assertion-only | K |
| [DOCUMENT_DATE_INCONSISTENT](../predicates/DOCUMENT_DATE_INCONSISTENT.md) | subject | literal | literal | K |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FIELD_NOT_REPORTED](../predicates/FIELD_NOT_REPORTED.md) | subject | literal | literal | K |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HAS_REVISION_STATUS](../predicates/HAS_REVISION_STATUS.md) | subject | literal | literal | K |
| [IMPLEMENTS_PUBLICATION](../predicates/IMPLEMENTS_PUBLICATION.md) | object | relationship | assertion-only | D4 |
| [RECORD_LAST_UPDATED](../predicates/RECORD_LAST_UPDATED.md) | subject | literal | literal | K |
| [RENDITION_OF](../predicates/RENDITION_OF.md) | subject | authorizing | typed-edge | D3 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Source are Assertions with it as subject: `(:Source)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (69)

- [D1/CQ-ID-03](../patterns/D1/CQ-ID-03.md) (supported; CQ-ID-03)
- [D1/CQ-ID-04](../patterns/D1/CQ-ID-04.md) (supported; CQ-ID-04)
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported; CQ-PF-01)
- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported; Q-D1-16)
- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported; Q-D10-03)
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported; Q-D10-08)
- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported; Q-D10-21)
- [D11/CQ-PV-05](../patterns/D11/CQ-PV-05.md) (supported; CQ-PV-05)
- [D11/Q-D11-05](../patterns/D11/Q-D11-05.md) (supported; Q-D11-05)
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported; Q-D11-08)
- [D11/Q-D11-19](../patterns/D11/Q-D11-19.md) (supported; Q-D11-19)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported; Q-D12-18)
- [D13/Q-D13-04#1](../patterns/D13/Q-D13-04--1.md) (supported; Q-D13-04)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported; Q-D13-12)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported; Q-D13-14)
- [D13/Q-D13-22#1](../patterns/D13/Q-D13-22--1.md) (supported; Q-D13-22)
- [D2/Q-D2-10](../patterns/D2/Q-D2-10.md) (supported; Q-D2-10)
- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported; Q-D2-18)
- [D3/CQ-EV-05#1](../patterns/D3/CQ-EV-05--1.md) (supported; CQ-EV-05)
- [D3/CQ-EV-05#2](../patterns/D3/CQ-EV-05--2.md) (supported; CQ-EV-05)
- … 49 more: `bks-schema find --kind pattern --label Source`

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update logicalIdentity/genre; never delete
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)
- [Trace an assertion to its source span and adjudication](../tasks/trace-answer-to-source.md)

## v1 navigation aliases

- `node:Source` is unchanged from v1.
- `node:CertificateOfAnalysis` (merged): D8: K.Source (genre COA) + QualityResult rows
- `node:Document` (split): K: D9 (MediaWork / Source) ‖ D9: K.Source
- `node:LotTestSummary` (merged): D8: K.Source (genre TEST_SUMMARY) + QualityResult rows
- `node:MediaVariant` (merged): D9: K.Source + K.SourceSnapshot (one rendition endpoint, its captures)

## Source definition

- `release:sdl/modules/kernel.graphql#L546-L570`
- `release:registers/node-register.yaml#Source`
- `release:workspace-inputs/identity-rules.yaml#Source`
