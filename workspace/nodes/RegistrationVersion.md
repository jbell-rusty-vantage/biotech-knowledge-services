---
id: "node:RegistrationVersion"
kind: "node"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L498-L552","release:registers/node-register.yaml#RegistrationVersion","release:workspace-inputs/identity-rules.yaml#RegistrationVersion"]
aliases: ["registration version","registration-version","registrationversion"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert"]
cardDigest: "sha256:492c27457f612ed64c73db041cb28f7f2f2c91a61c3e45d9db21dbf9f141d956"
---
# RegistrationVersion

Purpose: one version of one registration as a registry stated it at a point in valid time — status, enrollment (actual vs estimated), dates, results posting and submission events, design fields, verbatim sponsor/condition/ intervention names. Two populating modes: OBSERVED (BellLabs captured the registry record; its own snapshot) and RECONSTRUCTED (a past version stated inside a later snapshot, e.g. ISRCTN 'Provided at time of registration' and 'Amended 02/03/2009'), each attached to the Study by a HAS_REGISTRATION_VERSION episode whose Assertion cites the locator. Absorbs pinned TrialRegistration (registry, registrationId) and the registry side of ProtocolVersion. Implements Subjectable (unlike most state payloads) because it is the object of HAS_REGISTRATION_VERSION and STATED_IN Assertions (Assertion.object targets Subjectable). Identity rule: (registry, registrationId, versionNumber) when the registry numbers versions (CTG history index, ISRCTN XML version attribute); else (registry, registrationId, versionDate, populatingMode, payloadHash). Immutable. Field facts are cited by the HAS_REGISTRATION_VERSION attach Assertion, one locator per field (reportsField naming the field: overallStatus, enrollmentCount, masking, studyTypeVerbatim, resultsSubmissionEvents ...), the same rule as STATED_IN; no per-field predicates. Labels `Entity` like every other version type (D4 AssayVersion, D6 LabelVersion); the pinned VersionedState archetype label is dropped (adversarial-review stage). uid token: `registration-version`. Questions: CQ-ST-04, CQ-ST-08, Q-D3-02, Q-D3-16, Q-D3-18, Q-D3-10.

## Identity

| | |
| --- | --- |
| id | `node:RegistrationVersion` · raw SDL [sdl:RegistrationVersion](../sdl/RegistrationVersion.graphql) |
| module / domain | [D3](../modules/D3.md) / [Clinical and preclinical evidence](../domains/studies-and-evidence.md) |
| uid | `hu:registration-version:<opaque>` |
| stored labels | `RegistrationVersion` `Entity` (primary `RegistrationVersion`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `registry` + `registrationId` + `versionNumber when the registry numbers versions, else (versionDate, populatingMode, payloadHash)` |
| identity keys | `uid`, `name`, `registry`, `registrationId` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (44)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D3.graphql:L502 |
| `uid` | `String!` | yes | create+update |  | D3.graphql:L503 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D3.graphql:L504 |
| `lastWriterRunId` | `String` |  | create+update |  | D3.graphql:L506 |
| `registry` | [RegistryKind](../vocabularies/RegistryKind.md) | yes | create+update |  | D3.graphql:L509 |
| `registrationId` | `String!` | yes | create+update | Registration number as issued (NCT01038583, ISRCTN83772183). | D3.graphql:L511 |
| `versionNumber` | `Int` |  | create+update | Registry's own version counter when it has one. | D3.graphql:L513 |
| `versionDate` | `DateTime` |  | create+update | Date the registry says this version took effect (CTG update posted, ISRCTN amendment date). | D3.graphql:L515 |
| `versionDatePrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D3.graphql:L516 |
| `populatingMode` | [VersionPopulatingMode](../vocabularies/VersionPopulatingMode.md) | yes | create+update |  | D3.graphql:L517 |
| `payloadHash` | `String!` | yes | create+update | sha256:<hex> over the normalized version payload. | D3.graphql:L519 |
| `officialTitle` | `String` |  | create+update |  | D3.graphql:L520 |
| `acronym` | `String` |  | create+update |  | D3.graphql:L521 |
| `overallStatus` | [RegistryStatus](../vocabularies/RegistryStatus.md) |  | create+update |  | D3.graphql:L522 |
| `overallStatusVerbatim` | `String` |  | create+update |  | D3.graphql:L523 |
| `studyTypeVerbatim` | `String` |  | create+update | Study type as the registry states it (CTG 'OBSERVATIONAL' for ASPREE vs ISRCTN 'Randomized controlled trial'; Q-D3-15). | D3.graphql:L525 |
| `whyStopped` | `String` |  | create+update |  | D3.graphql:L526 |
| `enrollmentCount` | `Int` |  | create+update |  | D3.graphql:L527 |
| `enrollmentCountType` | [EnrollmentCountType](../vocabularies/EnrollmentCountType.md) |  | create+update |  | D3.graphql:L528 |
| `firstSubmittedDate` | `DateTime` |  | create+update |  | D3.graphql:L529 |
| `startDate` | `DateTime` |  | create+update |  | D3.graphql:L530 |
| `startDateType` | [RegistryDateType](../vocabularies/RegistryDateType.md) |  | create+update |  | D3.graphql:L531 |
| `primaryCompletionDate` | `DateTime` |  | create+update |  | D3.graphql:L532 |
| `primaryCompletionDatePrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D3.graphql:L533 |
| `primaryCompletionDateType` | [RegistryDateType](../vocabularies/RegistryDateType.md) |  | create+update |  | D3.graphql:L534 |
| `completionDate` | `DateTime` |  | create+update |  | D3.graphql:L535 |
| `completionDateType` | [RegistryDateType](../vocabularies/RegistryDateType.md) |  | create+update |  | D3.graphql:L536 |
| `resultsPosted` | `Boolean` |  | create+update |  | D3.graphql:L537 |
| `resultsFirstPostedDate` | `DateTime` |  | create+update |  | D3.graphql:L538 |
| `resultsSubmissionEvents` | `[String!]` |  | create+update | Results submission events as stated (CTG annotation), e.g. RELEASE:2018-03-14, RESET:2018-10-12. | D3.graphql:L540 |
| `phase` | [TrialPhase](../vocabularies/TrialPhase.md)[] |  | create+update |  | D3.graphql:L541 |
| `allocation` | [AllocationKind](../vocabularies/AllocationKind.md) |  | create+update |  | D3.graphql:L542 |
| `masking` | [MaskingKind](../vocabularies/MaskingKind.md) |  | create+update |  | D3.graphql:L543 |
| `primaryPurpose` | `String` |  | create+update |  | D3.graphql:L544 |
| `interventionModel` | `String` |  | create+update |  | D3.graphql:L545 |
| `conditionsVerbatim` | `[String!]` |  | create+update |  | D3.graphql:L546 |
| `interventionNamesVerbatim` | `[String!]` |  | create+update |  | D3.graphql:L547 |
| `sponsorNameVerbatim` | `String` |  | create+update |  | D3.graphql:L548 |
| `collaboratorNamesVerbatim` | `[String!]` |  | create+update |  | D3.graphql:L549 |
| `funderNamesVerbatim` | `[String!]` |  | create+update |  | D3.graphql:L550 |
| `siteCountries` | `[String!]` |  | create+update |  | D3.graphql:L551 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D3.graphql:L507 |
| `updatedAt` | `DateTime` |  | create+update |  | D3.graphql:L508 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D3.graphql:L505 |

## Outgoing relationships (2)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:RegistrationVersion --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (15)

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
| [HAS_REGISTRATION_VERSION](../relationships/HAS_REGISTRATION_VERSION.md) | [Study](Study.md) | asserted | episode, exclusive | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Study.registrationVersions (OUT) | `state.attach` |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STATED_IN](../relationships/STATED_IN.md) | [OutcomeDefinition](OutcomeDefinition.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | OutcomeDefinition.statedIn (OUT) | `edge.assert` |
| [STATED_IN](../relationships/STATED_IN.md) | [StudyArm](StudyArm.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | StudyArm.statedIn (OUT) | `edge.assert` |
| [STATED_IN](../relationships/STATED_IN.md) | [StudyPopulation](StudyPopulation.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | StudyPopulation.statedIn (OUT) | `edge.assert` |
| [STATED_IN](../relationships/STATED_IN.md) | [StudyResult](StudyResult.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | StudyResult.statedIn (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (5)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HAS_REGISTRATION_VERSION](../predicates/HAS_REGISTRATION_VERSION.md) | object | authorizing | typed-edge | D3 |
| [REGISTRY_NOT_MAINTAINED_NOTE](../predicates/REGISTRY_NOT_MAINTAINED_NOTE.md) | subject | literal | literal | D3 |
| [STATED_IN](../predicates/STATED_IN.md) | object | authorizing | typed-edge | D3 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a RegistrationVersion are Assertions with it as subject: `(:RegistrationVersion)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (0)

(none)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`
- Policy: create
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `node:RegistrationVersion` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D3.graphql#L498-L552`
- `release:registers/node-register.yaml#RegistrationVersion`
- `release:workspace-inputs/identity-rules.yaml#RegistrationVersion`
