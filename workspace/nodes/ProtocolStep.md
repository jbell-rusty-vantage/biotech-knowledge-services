---
id: "node:ProtocolStep"
kind: "node"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L398-L473","release:registers/node-register.yaml#ProtocolStep","release:workspace-inputs/identity-rules.yaml#ProtocolStep"]
aliases: ["protocol step","protocol-step","protocolstep","node:MeasurementPlan","node:ProtocolAdjustmentRule","MeasurementPlan","ProtocolAdjustmentRule"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:ac7bbfc0d370c37f04dc1e0ee05c821fa6cfdb1ed24e468cda610c0bb0107294"
---
# ProtocolStep

Purpose: one step of a protocol edition: what to do (stepKind), with what (STEP_USES -> substance, product, food, practice, or the Metric a MEASURE step measures), how much (dose as a range, never a midpoint, with period and intake scope), when (anchor + offset), how often (occurrence range per period), for which target (`targetKeys`: the protocol's own stated purpose, captured content, never an effect claim), for whom (`appliesToPopulations`), under which stated cautions (STATES_CONSTRAINT -> UseConstraint, derived from the author's caution Assertion) and with which review/stop rule (REVIEW steps). One step names one primary means; "A or B" alternatives are sibling steps sharing `alternativeGroup` (Huberman: 145 mg magnesium threonate OR 200 mg bisglycinate). Absorbs pinned MeasurementPlan, ProtocolAdjustmentRule and the numeric Target. Its text is located: `locatorUid` names the SourceLocator (cited by the HAS_EDITION authorizing Assertion) and `exactText` is the verbatim span. Identity rule: (edition, stepKey); stepKey = section slug + normalized action-text hash, aligned across editions by stepKeyAlignmentVersion. uid token: `protocol-step` (hu:protocol-step:<opaque>). Questions: Q-D5-01, Q-D5-06, Q-D5-10, CQ-PR-02, CQ-PR-04, Q-D5-11, Q-D5-12, Q-D5-19, CQ-PR-06.

## Identity

| | |
| --- | --- |
| id | `node:ProtocolStep` · raw SDL [sdl:ProtocolStep](../sdl/ProtocolStep.graphql) |
| module / domain | [D5](../modules/D5.md) / [Interventions, protocols, safety, food and nutrition](../domains/exposures-and-interventions.md) |
| uid | `hu:protocol-step:<opaque>` |
| stored labels | `ProtocolStep` `Entity` (primary `ProtocolStep`) |
| archetype | Entity (component of a VersionedState) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `editionUid` + `stepKey` |
| identity keys | `uid`, `name`, `stepKey` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (45)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D5.graphql:L402 |
| `uid` | `String!` | yes | create+update |  | D5.graphql:L403 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D5.graphql:L404 |
| `lastWriterRunId` | `String` |  | create+update |  | D5.graphql:L406 |
| `stepKey` | `String!` | yes | create+update |  | D5.graphql:L409 |
| `payloadHash` | `String!` | yes | create+update | sha256:<hex> over this step's canonical payload; equal hashes across editions = unchanged step (CQ-PR-01). | D5.graphql:L411 |
| `stepKind` | [StepKind](../vocabularies/StepKind.md) | yes | create+update |  | D5.graphql:L412 |
| `stepKindRaw` | `String` |  | create+update | The source's own verb or heading ('You might consider taking'). | D5.graphql:L414 |
| `sectionLabel` | `String` |  | create+update | Section the step sits in ('Pregnancy', 'Supplements'); Blueprint numbering restarts per section. | D5.graphql:L416 |
| `alternativeGroup` | `String` |  | create+update | Shared by sibling steps that are alternatives of one another ('A or B'). | D5.graphql:L418 |
| `exactText` | `String` |  | create+update | Verbatim span of the step (equals SourceLocator.exact of `locatorUid`). | D5.graphql:L420 |
| `locatorUid` | `String` |  | create+update | uid of the SourceLocator of this step's span on the edition's snapshot. A cache (R-46): the provenance path is the HAS_EDITION authorizing Assertion'… | D5.graphql:L422 |
| `requirementLevel` | [RequirementLevel](../vocabularies/RequirementLevel.md) | yes | create+update |  | D5.graphql:L423 |
| `requirementBasis` | [RequirementBasis](../vocabularies/RequirementBasis.md) | yes | create+update |  | D5.graphql:L424 |
| `speechAct` | [SpeechAct](../vocabularies/SpeechAct.md) |  | create+update | Practice report ('3-4 nights per week I also take') vs recommendation vs caution (kernel SpeechAct). | D5.graphql:L426 |
| `statedLevel` | [ConstraintLevel](../vocabularies/ConstraintLevel.md) |  | create+update | Directive level the protocol itself states for AVOID / REVIEW steps ('Don't take' = AVOID). | D5.graphql:L428 |
| `targetKeys` | `[String!]` |  | create+update | Target keys (vocab-targets.yaml) the protocol states this step is for; captured purpose, never an effect claim. | D5.graphql:L430 |
| `appliesToPopulations` | [PopulationGroup](../vocabularies/PopulationGroup.md)[] |  | create+update | Populations the step is stated for or restricted to; UNSPECIFIED when the source names none. | D5.graphql:L432 |
| `conditionText` | `String` |  | create+update | Verbatim condition for CONDITIONAL steps ('if you have trouble falling asleep'). | D5.graphql:L434 |
| `route` | `String` |  | create+update |  | D5.graphql:L435 |
| `doseMin` | `Float` |  | create+update |  | D5.graphql:L436 |
| `doseMax` | `Float` |  | create+update |  | D5.graphql:L437 |
| `doseUnit` | `String` |  | create+update | UCUM unit of doseMin/doseMax (mg, g, IU, min, lx). | D5.graphql:L439 |
| `dosePeriod` | [AmountBasis](../vocabularies/AmountBasis.md) |  | create+update | Time basis of doseMin/doseMax (D6 AmountBasis, R-58: PER_DOSE, PER_DAY, PER_WEEK, PER_CYCLE, NOT_STATED ...). | D5.graphql:L441 |
| `intakeScope` | [IntakeScope](../vocabularies/IntakeScope.md) |  | create+update |  | D5.graphql:L442 |
| `timeAnchor` | [TimeAnchor](../vocabularies/TimeAnchor.md) |  | create+update |  | D5.graphql:L443 |
| `offsetMinutesMin` | `Int` |  | create+update | Offset from the anchor in minutes; negative = before (30-60 min before bed = -60..-30). | D5.graphql:L445 |
| `offsetMinutesMax` | `Int` |  | create+update |  | D5.graphql:L446 |
| `occurrencesPerPeriodMin` | `Int` |  | create+update |  | D5.graphql:L447 |
| `occurrencesPerPeriodMax` | `Int` |  | create+update |  | D5.graphql:L448 |
| `occurrencePeriodUnit` | [CadenceUnit](../vocabularies/CadenceUnit.md) |  | create+update |  | D5.graphql:L449 |
| `durationDaysMin` | `Int` |  | create+update |  | D5.graphql:L450 |
| `durationDaysMax` | `Int` |  | create+update |  | D5.graphql:L451 |
| `scheduleText` | `String` |  | create+update |  | D5.graphql:L452 |
| `isAsNeeded` | `Boolean` |  | create+update |  | D5.graphql:L453 |
| `thresholdComparator` | [QuantityComparator](../vocabularies/QuantityComparator.md) |  | create+update | MEASURE / REVIEW steps: threshold on the measured Metric (absorbs the pinned numeric Target). D1 QuantityComparator (R-57). | D5.graphql:L455 |
| `thresholdLow` | `Float` |  | create+update |  | D5.graphql:L456 |
| `thresholdHigh` | `Float` |  | create+update |  | D5.graphql:L457 |
| `thresholdUnit` | `String` |  | create+update |  | D5.graphql:L458 |
| `reviewAction` | [ReviewAction](../vocabularies/ReviewAction.md) |  | create+update |  | D5.graphql:L459 |
| `dependsOnStepKeys` | `[String!]` |  | create+update | stepKeys this step depends on within the edition (CQ-PR-02); a property, not an edge. | D5.graphql:L461 |
| `notReportedFields` | `[String!]` |  | create+update | Fields the source does not state (never inferred). | D5.graphql:L463 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D5.graphql:L407 |
| `updatedAt` | `DateTime` |  | create+update |  | D5.graphql:L408 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D5.graphql:L405 |

## Outgoing relationships (4)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:ProtocolStep --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [STATES_CONSTRAINT](../relationships/STATES_CONSTRAINT.md) | [UseConstraint](UseConstraint.md) | derived | recorded-only (derivedAt) | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | ProtocolStep.statesConstraints (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) | [Subjectable](../interfaces/Subjectable.md) (56 members) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |
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
| [HAS_STEP](../relationships/HAS_STEP.md) | [ProtocolEdition](ProtocolEdition.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolEdition.steps (OUT) | `edge.structural` |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |

## Legal predicates (2)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a ProtocolStep are Assertions with it as subject: `(:ProtocolStep)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (3)

- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported; Q-D5-13)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported; Q-D5-17)
- [QP/G-9#1](../patterns/QP/G-9--1.md) (unsupported; Q-D5-19)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`
- Policy: create only; never update or delete (packet: create true, update false, delete false)
- Proposal kinds: `node.upsert`
- Fields a source may explicitly not report: `field names of the type (strings)`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:ProtocolStep` is unchanged from v1.
- `node:MeasurementPlan` (merged): D5: ProtocolStep
- `node:ProtocolAdjustmentRule` (merged): D5: ProtocolStep

## Source definition

- `release:sdl/modules/D5.graphql#L398-L473`
- `release:registers/node-register.yaml#ProtocolStep`
- `release:workspace-inputs/identity-rules.yaml#ProtocolStep`
