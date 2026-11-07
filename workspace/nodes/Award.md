---
id: "node:Award"
kind: "node"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L434-L471","release:registers/node-register.yaml#Award","release:workspace-inputs/identity-rules.yaml#Award"]
aliases: ["award"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:5fbdfdcc18b64de6938d6187ffec4dcbefccbc20fc4a7ec57834327b80216fb0"
---
# Award

Purpose: one funding award — grant, contract, sponsored research agreement, prize, in-kind award — as the join point between a funder, the recipient institution and investigator, and the studies and publications that cite it (D3 declares Study → Award; funding statements in papers cite award numbers, FundRef award ids and NIH project numbers). Without it a paper's "supported by AICO/2021/245" and the funder's own award list cannot meet. Identity rule: the award number with its issuer as printed by the citing or issuing source, as a kernel Identifier (scheme requested: AWARD_NUMBER, issuer = the funder name as printed; NIH_PROJECT for NIH core project numbers); else (normalized title, start year, issuer as printed). Never the funder Organization uid: who funded the award is the asserted AWARDED_BY edge, so a contested funder is two AWARDED_BY episodes plus a RESOLUTION Assessment, not two Award nodes. A D13 AWARD Event (prize or funding announcement) points at the Award (EVENT_ABOUT) and carries no amount. uid token: `award` (hu:award:<opaque>). Questions: Q-D7-05, Q-D7-15, Q-D7-16, CQ-EC-04, Q-D7-22, Q-D7-25.

## Identity

| | |
| --- | --- |
| id | `node:Award` · raw SDL [sdl:Award](../sdl/Award.graphql) |
| module / domain | [D7](../modules/D7.md) / [Organizations, people and money](../domains/actors-and-institutions.md) |
| uid | `hu:award:<opaque>` |
| stored labels | `Award` `Entity` (primary `Award`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `(award number, issuer as printed) as a kernel Identifier (AWARD_NUMBER / NIH_PROJECT)` + `(normalized title, start year, issuer as printed) when no number exists` |
| identity keys | `uid`, `name` |
| identifier schemes | `AWARD_NUMBER` (active), `NIH_PROJECT` (active), `DOI` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (15)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D7.graphql:L438 |
| `uid` | `String!` | yes | create+update |  | D7.graphql:L439 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update | Award title as published. | D7.graphql:L441 |
| `lastWriterRunId` | `String` |  | create+update |  | D7.graphql:L443 |
| `instrument` | [AwardInstrument](../vocabularies/AwardInstrument.md) | yes | create+update |  | D7.graphql:L446 |
| `awardNumberVerbatim` | `String` |  | create+update | Award number exactly as printed by the citing or issuing source (the normalized value is an Identifier). | D7.graphql:L448 |
| `programName` | `String` |  | create+update | Funding programme as named by the funder (e.g. an ARPA-H programme acronym); a programme node is deferred. | D7.graphql:L450 |
| `amount` | `Float` |  | create+update | Total amount as stated by the funder; null when not disclosed (ARPA-H per-team amounts are not public). | D7.graphql:L452 |
| `currency` | `String` |  | create+update | ISO 4217. | D7.graphql:L454 |
| `startDate` | `DateTime` |  | create+update | Award period as stated by the funder's record (the award's own clock, not an episode). | D7.graphql:L456 |
| `endDate` | `DateTime` |  | create+update |  | D7.graphql:L457 |
| `datePrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D7.graphql:L458 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D7.graphql:L444 |
| `updatedAt` | `DateTime` |  | create+update |  | D7.graphql:L445 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D7.graphql:L442 |

## Outgoing relationships (5)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Award --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [AWARDED_BY](../relationships/AWARDED_BY.md) | [Organization](Organization.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Award.funders (OUT) | `edge.assert` |
| [AWARDED_TO](../relationships/AWARDED_TO.md) | [Organization](Organization.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Award.recipientOrganizations (OUT) | `edge.assert` |
| [AWARDED_TO](../relationships/AWARDED_TO.md) | [Person](Person.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Award.recipientPersons (OUT) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
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
| [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) | [Study](Study.md) | asserted | episode | [StudyRoleEdgeProperties](../edge-properties/StudyRoleEdgeProperties.md) | Study.roles (OUT) | `edge.assert` |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (7)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [AWARDED_BY](../predicates/AWARDED_BY.md) | subject | authorizing | typed-edge | D7 |
| [AWARDED_TO](../predicates/AWARDED_TO.md) | subject | authorizing | typed-edge | D7 |
| [AWARD_ACKNOWLEDGED_BY](../predicates/AWARD_ACKNOWLEDGED_BY.md) | subject | relationship | assertion-only | D7 |
| [AWARD_AMOUNT_FISCAL_YEAR](../predicates/AWARD_AMOUNT_FISCAL_YEAR.md) | subject | literal | literal | D7 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HAS_STUDY_ROLE](../predicates/HAS_STUDY_ROLE.md) | object | authorizing | typed-edge | D3 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Award are Assertions with it as subject: `(:Award)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (3)

- [D7/CQ-EC-04#1](../patterns/D7/CQ-EC-04--1.md) (supported; CQ-EC-04)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported; Q-D7-22)
- [D7/Q-D7-25#1](../patterns/D7/Q-D7-25--1.md) (supported; Q-D7-25)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Ingest an organization profile (roles, stakes, brands, control)](../tasks/ingest-organization-profile.md)

## v1 navigation aliases

(none)

## Source definition

- `release:sdl/modules/D7.graphql#L434-L471`
- `release:registers/node-register.yaml#Award`
- `release:workspace-inputs/identity-rules.yaml#Award`
