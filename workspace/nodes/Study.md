---
id: "node:Study"
kind: "node"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L426-L478","release:registers/node-register.yaml#Study","release:workspace-inputs/identity-rules.yaml#Study"]
aliases: ["study","node:Dataset","node:TrialRegistration","Dataset","TrialRegistration"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:3ad2e15edc9108fbefee524581238104c67763628444bad37d97918eec2b91e3"
---
# Study

Purpose: one investigation (trial, cohort, preclinical experiment, systematic review) independent of how many registrations, versions and papers describe it; the join point of every D3 question (arms, outcomes, results, sponsor, registry history, papers) and the D13 frontier attachment; HAS_STUDY_ROLE and INVESTIGATES make it the entry point from a company, funder, award or condition. Also absorbs pinned TrialRegistration (registration ids are kernel Identifiers; the registry history is RegistrationVersion) and Dataset (a reused cohort or IPD set is a Study of kind OBSERVATIONAL_COHORT that secondary analyses REPORT_ON). Identity rule: any registry identifier (NCT, ISRCTN, EUCT, EUDRACT) attached through the kernel; two registrations of one trial (NCT01038583 = ISRCTN83772183) are two Identifiers on one Study. Unregistered studies: (first reporting publication DOI or PMID, studyKind, normalized design label, e.g. ITP cohort + compound). uid token: `study` (hu:study:<opaque>). Status fields are a read-only projection cache of the latest open HAS_REGISTRATION_VERSION episode (method in projectionMethodVersion, e.g. study-registry-projection/v1; source uid in projectionOfRegistrationVersionUid; written by a PROJECTION Activity at projectionDerivedAt); authority is the RegistrationVersion. Questions: CQ-ST-01, CQ-ST-04, CQ-ST-07, CQ-ST-08, Q-D3-02, Q-D3-04, Q-D3-06, Q-D3-08, Q-D3-09, Q-D3-10, Q-D3-11, Q-D3-18.

## Identity

| | |
| --- | --- |
| id | `node:Study` · raw SDL [sdl:Study](../sdl/Study.graphql) |
| module / domain | [D3](../modules/D3.md) / [Clinical and preclinical evidence](../domains/studies-and-evidence.md) |
| uid | `hu:study:<opaque>` |
| stored labels | `Study` `Entity` (primary `Study`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `registry identifier (NCT | ISRCTN | EUCT | EUDRACT | requested ACTRN` + `CHICTR` + `DRKS` + `CTRI` + `JRCT) via kernel Identifier` + `else (first reporting publication DOI|PMID, studyKind, normalized design label)` |
| identity keys | `uid`, `name` |
| identifier schemes | `NCT` (active), `ISRCTN` (active), `EUCT` (disabled), `EUDRACT` (disabled) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (17)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D3.graphql:L430 |
| `uid` | `String!` | yes | create+update |  | D3.graphql:L431 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D3.graphql:L432 |
| `lastWriterRunId` | `String` |  | create+update |  | D3.graphql:L434 |
| `studyKind` | [StudyKind](../vocabularies/StudyKind.md) | yes | create+update | Design (filter: Q-D3-04 ranking, Q-D3-06 preclinical, CQ-ST-07). | D3.graphql:L438 |
| `acronym` | `String` |  | create+update |  | D3.graphql:L439 |
| `phase` | [TrialPhase](../vocabularies/TrialPhase.md)[] |  | create+update | Projection cache: phase of the latest registry version (Q-D3-10). | D3.graphql:L441 |
| `overallStatus` | [RegistryStatus](../vocabularies/RegistryStatus.md) |  | create+update | Projection cache: status of the latest registry version (Q-D3-02, Q-D3-10, Q-D3-18). | D3.graphql:L443 |
| `primaryCompletionDate` | `DateTime` |  | create+update | Projection cache: expected or actual primary completion of the latest version (Q-D3-02, Q-D3-10). | D3.graphql:L445 |
| `primaryCompletionDateType` | [RegistryDateType](../vocabularies/RegistryDateType.md) |  | create+update |  | D3.graphql:L446 |
| `resultsPosted` | `Boolean` |  | create+update | Projection cache: true when the latest registry version has posted results (Q-D3-02). | D3.graphql:L448 |
| `projectionOfRegistrationVersionUid` | `String` |  | create+update | uid of the RegistrationVersion the cache was projected from. | D3.graphql:L450 |
| `projectionMethodVersion` | `String` |  | create+update | Method version of the projection cache (directive rule 8). | D3.graphql:L452 |
| `projectionDerivedAt` | `DateTime` |  | create+update |  | D3.graphql:L453 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D3.graphql:L435 |
| `updatedAt` | `DateTime` |  | create+update |  | D3.graphql:L436 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D3.graphql:L433 |

## Outgoing relationships (11)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Study --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_ARM](../relationships/HAS_ARM.md) | [StudyArm](StudyArm.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Study.arms (OUT) | `edge.structural` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [HAS_OUTCOME](../relationships/HAS_OUTCOME.md) | [OutcomeDefinition](OutcomeDefinition.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Study.outcomes (OUT) | `edge.structural` |
| [HAS_POPULATION](../relationships/HAS_POPULATION.md) | [StudyPopulation](StudyPopulation.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Study.populations (OUT) | `edge.structural` |
| [HAS_REGISTRATION_VERSION](../relationships/HAS_REGISTRATION_VERSION.md) | [RegistrationVersion](RegistrationVersion.md) | asserted | episode, exclusive | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Study.registrationVersions (OUT) | `state.attach` |
| [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) | [Award](Award.md) | asserted | episode | [StudyRoleEdgeProperties](../edge-properties/StudyRoleEdgeProperties.md) | Study.roles (OUT) | `edge.assert` |
| [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) | [Organization](Organization.md) | asserted | episode | [StudyRoleEdgeProperties](../edge-properties/StudyRoleEdgeProperties.md) | Study.roles (OUT) | `edge.assert` |
| [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) | [Person](Person.md) | asserted | episode | [StudyRoleEdgeProperties](../edge-properties/StudyRoleEdgeProperties.md) | Study.roles (OUT) | `edge.assert` |
| [INVESTIGATES](../relationships/INVESTIGATES.md) | [Condition](Condition.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Study.conditions (OUT) | `edge.assert` |
| [ON_FRONTIER](../relationships/ON_FRONTIER.md) | [Frontier](Frontier.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Frontier.studies (IN) | `edge.assert` |
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
| [REPORTS_ON](../relationships/REPORTS_ON.md) | [Publication](Publication.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Publication.reportsOn (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (17)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [CITES_AS_EVIDENCE](../predicates/CITES_AS_EVIDENCE.md) | object | relationship | assertion-only | D8 |
| [CONTINGENT_ON](../predicates/CONTINGENT_ON.md) | object | relationship | assertion-only | D13 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FIELD_NOT_REPORTED](../predicates/FIELD_NOT_REPORTED.md) | subject | literal | literal | K |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HAS_REGISTRATION_VERSION](../predicates/HAS_REGISTRATION_VERSION.md) | subject | authorizing | typed-edge | D3 |
| [HAS_STUDY_ROLE](../predicates/HAS_STUDY_ROLE.md) | subject | authorizing | typed-edge | D3 |
| [INVESTIGATES](../predicates/INVESTIGATES.md) | subject | authorizing | typed-edge | D3 |
| [MASKING_STATED](../predicates/MASKING_STATED.md) | subject | literal | literal | D3 |
| [ON_FRONTIER](../predicates/ON_FRONTIER.md) | subject | authorizing | typed-edge | D13 |
| [PROSPECTIVE_REGISTRATION_FLAG](../predicates/PROSPECTIVE_REGISTRATION_FLAG.md) | subject | literal | literal | D3 |
| [REGISTERED_RETROSPECTIVELY](../predicates/REGISTERED_RETROSPECTIVELY.md) | subject | literal | literal | D3 |
| [REPORTS_ON](../predicates/REPORTS_ON.md) | object | authorizing | typed-edge | D3 |
| [SHARES_PARTICIPANTS_WITH](../predicates/SHARES_PARTICIPANTS_WITH.md) | subject+object | relationship | assertion-only | D3 |
| [STOPPED_EARLY_REASON](../predicates/STOPPED_EARLY_REASON.md) | subject | literal | literal | D3 |
| [USED_COMPOSITION_DATABASE](../predicates/USED_COMPOSITION_DATABASE.md) | subject | literal | literal | D3 |
| [USED_FOOD_CLASSIFICATION](../predicates/USED_FOOD_CLASSIFICATION.md) | subject | literal | literal | D3 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Study are Assertions with it as subject: `(:Study)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: [HAS_REGISTRATION_VERSION](../relationships/HAS_REGISTRATION_VERSION.md) — scope: Exclusive (non-overlapping) episodes are scoped to (subject, relationship/predicate slot, asserter): same-asserter overlap is rejected; different asserters coexist and cross-source disagreement is preserved. Separately defined global identity constraints are not weakened. K owns CQ-TM-05 and the exclusivity contract; module register rows supply slot policies (exclusive: true).
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (9)

- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported; Q-D11-08)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported; Q-D13-12)
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported; Q-D3-04)
- [D7/CQ-EC-04#1](../patterns/D7/CQ-EC-04--1.md) (supported; CQ-EC-04)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported; Q-D7-22)
- [QP/G-4#1](../patterns/QP/G-4--1.md) (unsupported; CQ-ST-07)
- [QP/P-03](../patterns/QP/P-03.md) (supported; CQ-EV-04, CQ-RC-02)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported; CQ-RC-05, Q-D10-03, Q-D5-01, Q-D5-02, Q-D5-03)
- [QP/P-08b](../patterns/QP/P-08b.md) (supported; Q-D10-22, Q-D13-01, Q-D13-02, Q-D13-03)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `node:Study` is unchanged from v1.
- `node:Dataset` (merged): D3: Study (kind OBSERVATIONAL_COHORT) + REPORTS_ON
- `node:TrialRegistration` (merged): D3: Study (kernel Identifier per registration) + RegistrationVersion.registry / registrationId

## Source definition

- `release:sdl/modules/D3.graphql#L426-L478`
- `release:registers/node-register.yaml#Study`
- `release:workspace-inputs/identity-rules.yaml#Study`
