---
id: "node:StudyArm"
kind: "node"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L569-L595","release:registers/node-register.yaml#StudyArm","release:workspace-inputs/identity-rules.yaml#StudyArm"]
aliases: ["study arm","study-arm","studyarm","node:StudyIntervention","StudyIntervention"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:a25d59af0366eb6ae7d0b6dda2c41269c58908acf231ddb16916b43738b21044"
---
# StudyArm

Purpose: one arm or group of a study as one source states it (registry arms/groups, paper randomization groups) — the unit results, adverse events and administered components hang on. Absorbs pinned StudyIntervention (arm-level intervention facts are on its InterventionComponents). Registry and paper arms are separate nodes (NCT04313634 has a fisetin arm with a serious adverse event that the paper reports only as dropped), so Q-D3-01 is a set difference. Identity rule: (study, sourceFamily, armKey, payloadHash of arm + components); sourceFamily = registry + registrationId for registry versions, the work's DOI (else PMID) for a publication. Stable: a later version of the same registry that states an identical arm adds a STATED_IN episode to the same node; a changed arm is a new node. uid token: `study-arm`. Questions: CQ-ST-01, CQ-ST-06, Q-D3-01, Q-D3-15, CQ-ST-02.

## Identity

| | |
| --- | --- |
| id | `node:StudyArm` · raw SDL [sdl:StudyArm](../sdl/StudyArm.graphql) |
| module / domain | [D3](../modules/D3.md) / [Clinical and preclinical evidence](../domains/studies-and-evidence.md) |
| uid | `hu:study-arm:<opaque>` |
| stored labels | `StudyArm` `Entity` (primary `StudyArm`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `study` + `sourceFamily (registry + registrationId | the work's DOI, else PMID)` + `armKey` + `payloadHash` |
| identity keys | `uid`, `name`, `armKey`, `payloadHash` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (12)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D3.graphql:L573 |
| `uid` | `String!` | yes | create+update |  | D3.graphql:L574 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update | Arm label as stated (e.g. 'Fisetin Treatment Group'). | D3.graphql:L576 |
| `lastWriterRunId` | `String` |  | create+update |  | D3.graphql:L578 |
| `armType` | [ArmType](../vocabularies/ArmType.md) |  | create+update |  | D3.graphql:L581 |
| `armKey` | `String!` | yes | create+update | Normalized label used to match arms across sources (never identity across sources). | D3.graphql:L583 |
| `plannedSize` | `Int` |  | create+update |  | D3.graphql:L584 |
| `description` | `String` |  | create+update |  | D3.graphql:L585 |
| `payloadHash` | `String!` | yes | create+update |  | D3.graphql:L586 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D3.graphql:L579 |
| `updatedAt` | `DateTime` |  | create+update |  | D3.graphql:L580 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D3.graphql:L577 |

## Outgoing relationships (5)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:StudyArm --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_COMPONENT](../relationships/HAS_COMPONENT.md) | [InterventionComponent](InterventionComponent.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | StudyArm.components (OUT) | `edge.structural` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [STATED_IN](../relationships/STATED_IN.md) | [Publication](Publication.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | StudyArm.statedIn (OUT) | `edge.assert` |
| [STATED_IN](../relationships/STATED_IN.md) | [RegistrationVersion](RegistrationVersion.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | StudyArm.statedIn (OUT) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (13)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [HAS_ARM](../relationships/HAS_ARM.md) | [Study](Study.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Study.arms (OUT) | `edge.structural` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [IN_STUDY_ARM](../relationships/IN_STUDY_ARM.md) | [MechanismEvidenceContext](MechanismEvidenceContext.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | MechanismEvidenceContext.studyArm (OUT) | `edge.structural` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [RESULT_FOR_ARM](../relationships/RESULT_FOR_ARM.md) | [StudyResult](StudyResult.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | StudyResult.arms (OUT) | `edge.structural` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (5)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [ARM_DROPPED_REASON](../predicates/ARM_DROPPED_REASON.md) | subject | literal | literal | D3 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [MOIETY_EQUIVALENT_AMOUNT](../predicates/MOIETY_EQUIVALENT_AMOUNT.md) | subject | computation | computation | D3 |
| [STATED_IN](../predicates/STATED_IN.md) | subject | authorizing | typed-edge | D3 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a StudyArm are Assertions with it as subject: `(:StudyArm)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (3)

- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported; Q-D3-04)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported; Q-D7-22)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported; CQ-RC-05, Q-D10-03, Q-D5-01, Q-D5-02, Q-D5-03)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `node:StudyArm` is unchanged from v1.
- `node:StudyIntervention` (merged): D3: StudyArm (arm-level facts) + InterventionComponent (route, dosageForm, schedule, duration, registry intervention type)

## Source definition

- `release:sdl/modules/D3.graphql#L569-L595`
- `release:registers/node-register.yaml#StudyArm`
- `release:workspace-inputs/identity-rules.yaml#StudyArm`
