---
id: "node:Patent"
kind: "node"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L645-L689","release:registers/node-register.yaml#Patent","release:workspace-inputs/identity-rules.yaml#Patent"]
aliases: ["patent","node:GrantedPatent","node:PatentApplication","node:PatentFamily","node:PatentLicense","GrantedPatent","PatentApplication","PatentFamily","PatentLicense"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:f7ac2cd79dcbbb734a6d999950dde54a6411a6e0a769b2829d0b5d3ad7499aee"
---
# Patent

Purpose: one patent publication at one office (application, grant, reissue). Ownership and licensing are bitemporal episodes on ASSIGNED_TO and LICENSED_TO (Dartmouth assignee; ChromaDex/Niagen exclusive licensee; amended after the litigation); claim-level standing is a LegalStatus (CLAIMS_HELD_INVALID with claimNumbers) established by the court RegulatoryRecord, because the aggregator's 'Active' is an assumption. Merges pinned GrantedPatent, PatentApplication (publicationType), PatentFamily (familyId, familyDefinition), PatentClaim (claim numbers on LegalStatus; claim text stays in the snapshot), PatentLicense (LICENSED_TO episodes + Assertion qualifiers), IpRightStatus (LegalStatus). Identity rule: (office country code, publication number, kind code) = PATENT_PUB identifier. uid token: `patent`. Questions: Q-D8-11, Q-D8-12, Q-D8-13, Q-D8-14, Q-D8-21, CQ-EC-01.

## Identity

| | |
| --- | --- |
| id | `node:Patent` · raw SDL [sdl:Patent](../sdl/Patent.graphql) |
| module / domain | [D8](../modules/D8.md) / [Manufacturing, quality, regulation and intellectual property](../domains/manufacturing-quality-regulatory-ip.md) |
| uid | `hu:patent:<opaque>` |
| stored labels | `Patent` `Entity` (primary `Patent`) |
| archetype | Entity & Subjectable |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `office` + `publicationNumber` + `kindCode` |
| identity keys | `uid`, `name`, `office`, `publicationNumber`, `kindCode` |
| identifier schemes | `PATENT_PUB` (disabled), `PATENT_APPLICATION` (disabled) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (20)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D8.graphql:L649 |
| `uid` | `String!` | yes | create+update |  | D8.graphql:L650 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update | Title. | D8.graphql:L652 |
| `lastWriterRunId` | `String` |  | create+update |  | D8.graphql:L654 |
| `office` | `String!` | yes | create+update | Office country code (US, EP, WO, ...). | D8.graphql:L658 |
| `publicationNumber` | `String!` | yes | create+update | Publication number without country and kind code (e.g. 8197807). | D8.graphql:L660 |
| `kindCode` | `String!` | yes | create+update | Kind code (e.g. B2, A1). | D8.graphql:L662 |
| `publicationType` | [PatentPublicationType](../vocabularies/PatentPublicationType.md) | yes | create+update |  | D8.graphql:L663 |
| `familyId` | `String` |  | create+update | Family id under the stated definition (e.g. DOCDB simple family id). | D8.graphql:L665 |
| `familyDefinition` | `String` |  | create+update | Definition the familyId follows (DOCDB, INPADOC, SOURCE_LIST). | D8.graphql:L667 |
| `priorityDate` | `DateTime` |  | create+update |  | D8.graphql:L668 |
| `filingDate` | `DateTime` |  | create+update |  | D8.graphql:L669 |
| `grantDate` | `DateTime` |  | create+update |  | D8.graphql:L670 |
| `expiresAt` | `DateTime` |  | create+update | Expiry as stated, with its basis; adjudicated or lapsed standing is a LegalStatus. | D8.graphql:L672 |
| `expiryBasis` | [PatentDateBasis](../vocabularies/PatentDateBasis.md) |  | create+update |  | D8.graphql:L673 |
| `aggregatorStatusVerbatim` | `String` |  | create+update | Aggregator legal-status text verbatim (e.g. 'Active , expires 2026-11-19'), never a conclusion. | D8.graphql:L675 |
| `aggregatorStatusObservedAt` | `DateTime` |  | create+update |  | D8.graphql:L676 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D8.graphql:L655 |
| `updatedAt` | `DateTime` |  | create+update |  | D8.graphql:L656 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D8.graphql:L653 |

## Outgoing relationships (5)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Patent --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSIGNED_TO](../relationships/ASSIGNED_TO.md) | [Organization](Organization.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Patent.assignees (OUT) | `edge.assert` |
| [CONCERNS](../relationships/CONCERNS.md) | [ChemicalSubstance](ChemicalSubstance.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Patent.concerns (OUT) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [LICENSED_TO](../relationships/LICENSED_TO.md) | [Organization](Organization.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Patent.licensees (OUT) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (11)

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
| [STATUS_OF](../relationships/STATUS_OF.md) | [LegalStatus](LegalStatus.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LegalStatus.statusOf (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (10)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [ADJUDICATES_PATENT](../predicates/ADJUDICATES_PATENT.md) | object | relationship | assertion-only | D8 |
| [ASSIGNED_TO](../predicates/ASSIGNED_TO.md) | subject | authorizing | typed-edge | D8 |
| [CONCERNS](../predicates/CONCERNS.md) | subject | authorizing | typed-edge | D8 |
| [DISTRICT_COURT_INVALIDITY](../predicates/DISTRICT_COURT_INVALIDITY.md) | subject | literal | literal | D8 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [LICENCE_TERMS_AMENDED](../predicates/LICENCE_TERMS_AMENDED.md) | subject | literal | literal | D8 |
| [LICENSED_TO](../predicates/LICENSED_TO.md) | subject | authorizing | typed-edge | D8 |
| [MARKED_WITH_PATENT](../predicates/MARKED_WITH_PATENT.md) | object | relationship | assertion-only | D6 |
| [STATUS_OF](../predicates/STATUS_OF.md) | object | authorizing | typed-edge | D8 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Patent are Assertions with it as subject: `(:Patent)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (2)

- [D8/Q-D8-10](../patterns/D8/Q-D8-10.md) (supported; Q-D8-10)
- [D8/Q-D8-13](../patterns/D8/Q-D8-13.md) (supported; Q-D8-13)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; aggregator status and expiry caches rewritten under FIELD Assertions (R-14, R-45); never delete
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `LICENSED_TO` does NOT imply `STATUS_OF`

## Tasks

(none)

## v1 navigation aliases

- `node:GrantedPatent` (merged): D8: Patent
- `node:PatentApplication` (merged): D8: Patent
- `node:PatentFamily` (merged): D8: Patent
- `node:PatentLicense` (merged): D8: Patent.licensees (LICENSED_TO episodes; terms as Assertion qualifiers)

## Source definition

- `release:sdl/modules/D8.graphql#L645-L689`
- `release:registers/node-register.yaml#Patent`
- `release:workspace-inputs/identity-rules.yaml#Patent`
