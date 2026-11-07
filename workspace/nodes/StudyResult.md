---
id: "node:StudyResult"
kind: "node"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L752-L811","release:registers/node-register.yaml#StudyResult","release:workspace-inputs/identity-rules.yaml#StudyResult"]
aliases: ["study result","study-result","studyresult","node:AdverseEventResult","AdverseEventResult"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:ae2b392aac61dbc2e72c766d98b888a9401ff712444c4165fed6531dfac680bb"
---
# StudyResult

Purpose: one reported number set for one outcome definition, one arm set, one analysis set, as one source states it (registry results module row, paper table cell, abstract sentence, pooled review estimate). Two sources reporting the same estimate are two nodes (registry 'Full Range' vs paper interquartile range for one median; n analyzed 28 vs 30), so disagreement is visible and nothing is overwritten. Absorbs pinned AdverseEventResult (resultKind ADVERSE_EVENT_COUNT, seriousness, participants affected / at risk, collection method). The STATED_IN Assertion's locators trace every number (Q-D3-13). Filter properties per 02-questions.md: analysisKind, comparisonKind, statisticalConclusion, direction, resultKind, sampleSize, analysisPopulation, dispersionKind (new), subgroupLabel (new), seriousness, collectionMethod, participantsAffected; range comparisons on estimate / intervalLower / intervalUpper only for pooled results (Q-D3-11) and thresholds (CQ-ST-10). Identity rule: (outcome definition, arm set, analysisPopulation, subgroupLabel, timepoint, resultKind, sourceFamily, payloadHash); sourceFamily as for StudyArm, so a later registry version restating identical numbers adds a STATED_IN episode instead of a node. uid token: `study-result`. Questions: CQ-ST-05, CQ-ST-06, CQ-EV-03, Q-D3-01, Q-D3-04, Q-D3-05, Q-D3-06, Q-D3-11, Q-D3-13, Q-D3-15, CQ-ST-10.

## Identity

| | |
| --- | --- |
| id | `node:StudyResult` · raw SDL [sdl:StudyResult](../sdl/StudyResult.graphql) |
| module / domain | [D3](../modules/D3.md) / [Clinical and preclinical evidence](../domains/studies-and-evidence.md) |
| uid | `hu:study-result:<opaque>` |
| stored labels | `StudyResult` `Entity` (primary `StudyResult`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `outcome definition` + `arm set` + `analysisPopulation` + `subgroupLabel` + `timepoint` + `resultKind` + `sourceFamily (as StudyArm)` + `payloadHash` |
| identity keys | `uid`, `name`, `analysisPopulation`, `subgroupLabel`, `resultKind` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (34)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D3.graphql:L756 |
| `uid` | `String!` | yes | create+update |  | D3.graphql:L757 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D3.graphql:L758 |
| `lastWriterRunId` | `String` |  | create+update |  | D3.graphql:L760 |
| `resultKind` | [StudyResultKind](../vocabularies/StudyResultKind.md) | yes | create+update |  | D3.graphql:L763 |
| `analysisKind` | [AnalysisKind](../vocabularies/AnalysisKind.md) | yes | create+update |  | D3.graphql:L764 |
| `comparisonKind` | [ComparisonKind](../vocabularies/ComparisonKind.md) | yes | create+update |  | D3.graphql:L765 |
| `statisticalConclusion` | [StatisticalConclusion](../vocabularies/StatisticalConclusion.md) | yes | create+update |  | D3.graphql:L766 |
| `direction` | [EstimateDirection](../vocabularies/EstimateDirection.md) |  | create+update | Direction of the point estimate (EstimateDirection: neutral, never benefit / harm). | D3.graphql:L768 |
| `analysisPopulation` | [AnalysisSetKind](../vocabularies/AnalysisSetKind.md) |  | create+update |  | D3.graphql:L769 |
| `sampleSize` | `Int` |  | create+update |  | D3.graphql:L770 |
| `estimate` | `Float` |  | create+update |  | D3.graphql:L771 |
| `estimateQualifier` | [EstimateQualifier](../vocabularies/EstimateQualifier.md) |  | create+update |  | D3.graphql:L772 |
| `unitCode` | `String` |  | create+update | UCUM unit of estimate and interval. | D3.graphql:L774 |
| `dispersionKind` | [DispersionKind](../vocabularies/DispersionKind.md) |  | create+update |  | D3.graphql:L775 |
| `dispersionValue` | `Float` |  | create+update | SD or SE value when dispersionKind is STANDARD_DEVIATION or STANDARD_ERROR. | D3.graphql:L777 |
| `intervalLower` | `Float` |  | create+update | Bounds of a CI, IQR or full range (pinned ciLower / ciUpper). | D3.graphql:L779 |
| `intervalUpper` | `Float` |  | create+update |  | D3.graphql:L780 |
| `ciLevel` | `Float` |  | create+update | Confidence level of a CI (0.95). | D3.graphql:L782 |
| `pValue` | `Float` |  | create+update |  | D3.graphql:L783 |
| `pValueText` | `String` |  | create+update | p as printed ('<0.001', '0.611'). | D3.graphql:L785 |
| `multiplicityAdjusted` | `Boolean` |  | create+update |  | D3.graphql:L786 |
| `subgroupLabel` | `String` |  | create+update | Subgroup the result is restricted to, as stated ('female', 'site: UM', 'highest p16 tertile'); null = the whole analysis population (replaces pinned… | D3.graphql:L788 |
| `comparatorArmKey` | `String` |  | create+update | armKey of the reference arm of a BETWEEN_ARM comparison. | D3.graphql:L790 |
| `timepointText` | `String` |  | create+update |  | D3.graphql:L791 |
| `resultText` | `String` |  | create+update | Verbatim result sentence or cell text. | D3.graphql:L793 |
| `seriousness` | [AeSeriousness](../vocabularies/AeSeriousness.md) |  | create+update |  | D3.graphql:L794 |
| `participantsAffected` | `Int` |  | create+update |  | D3.graphql:L795 |
| `participantsAtRisk` | `Int` |  | create+update |  | D3.graphql:L796 |
| `eventCount` | `Int` |  | create+update |  | D3.graphql:L797 |
| `collectionMethod` | [AeCollectionMethod](../vocabularies/AeCollectionMethod.md) |  | create+update |  | D3.graphql:L798 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D3.graphql:L761 |
| `updatedAt` | `DateTime` |  | create+update |  | D3.graphql:L762 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D3.graphql:L759 |

## Outgoing relationships (6)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:StudyResult --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [RESULT_FOR](../relationships/RESULT_FOR.md) | [OutcomeDefinition](OutcomeDefinition.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | StudyResult.outcome (OUT) | `edge.structural` |
| [RESULT_FOR_ARM](../relationships/RESULT_FOR_ARM.md) | [StudyArm](StudyArm.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | StudyResult.arms (OUT) | `edge.structural` |
| [STATED_IN](../relationships/STATED_IN.md) | [Publication](Publication.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | StudyResult.statedIn (OUT) | `edge.assert` |
| [STATED_IN](../relationships/STATED_IN.md) | [RegistrationVersion](RegistrationVersion.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | StudyResult.statedIn (OUT) | `edge.assert` |
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

## Legal predicates (6)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [CLINICALLY_MEANINGFUL](../predicates/CLINICALLY_MEANINGFUL.md) | subject | literal | literal | D3 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INTERPRETATION_CAVEAT](../predicates/INTERPRETATION_CAVEAT.md) | subject | literal | literal | D3 |
| [INTERPRETS_RESULT](../predicates/INTERPRETS_RESULT.md) | subject | literal | literal | D3 |
| [STATED_IN](../predicates/STATED_IN.md) | subject | authorizing | typed-edge | D3 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a StudyResult are Assertions with it as subject: `(:StudyResult)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (3)

- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported; Q-D3-04)
- [QP/G-4#1](../patterns/QP/G-4--1.md) (unsupported; CQ-ST-07)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported; CQ-RC-05, Q-D10-03, Q-D5-01, Q-D5-02, Q-D5-03)

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

- `node:StudyResult` is unchanged from v1.
- `node:AdverseEventResult` (merged): D3: StudyResult (resultKind ADVERSE_EVENT_COUNT; seriousness, participantsAffected/AtRisk, eventCount, collectionMethod) with an OutcomeDefinition of measureKi…

## Source definition

- `release:sdl/modules/D3.graphql#L752-L811`
- `release:registers/node-register.yaml#StudyResult`
- `release:workspace-inputs/identity-rules.yaml#StudyResult`
