---
id: "node:OutcomeDefinition"
kind: "node"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L707-L734","release:registers/node-register.yaml#OutcomeDefinition","release:workspace-inputs/identity-rules.yaml#OutcomeDefinition"]
aliases: ["outcome definition","outcome-definition","outcomedefinition"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:6ac7e3a985d9b30ff10c037f7f61606d5345b022a4841f9b2e84db4c21ea62cf"
---
# OutcomeDefinition

Purpose: one outcome measure at one timepoint with one declared priority (the same measure at 2, 4 and 20 weeks is three definitions; a measure demoted from primary to secondary in a later version is a second definition with the same outcomeKey). Shared across sources (the exception to the per-source rule): every source that declares it gets a STATED_IN episode, so "which versions and which paper declared CTx at 20 weeks as primary" is a traversal, and outcome switching (CQ-ST-04, Q-D3-16) is a group-by on outcomeKey. Adverse event terms are definitions of measureKind ADVERSE_EVENT so every StudyResult has exactly one definition. MEASURES links it to the D4 / D2 concept it measures, which is how study evidence reaches a D5 Target (D5 union TargetMeasure: Target -OPERATIONALIZED_BY-> Metric | Biomarker | D2 Outcome | D2 Condition; R-70). Identity rule: (study, outcomeKey = normalized measure title + normalized timepoint, priority). uid token: `outcome-definition`. Questions: CQ-ST-04, CQ-ST-05, CQ-ST-06, Q-D3-04, Q-D3-05, Q-D3-16, CQ-ST-03, Q-D3-14.

## Identity

| | |
| --- | --- |
| id | `node:OutcomeDefinition` · raw SDL [sdl:OutcomeDefinition](../sdl/OutcomeDefinition.graphql) |
| module / domain | [D3](../modules/D3.md) / [Clinical and preclinical evidence](../domains/studies-and-evidence.md) |
| uid | `hu:outcome-definition:<opaque>` |
| stored labels | `OutcomeDefinition` `Entity` (primary `OutcomeDefinition`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `study` + `outcomeKey (normalized measure + timepoint)` + `priority` |
| identity keys | `uid`, `name`, `priority` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (12)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D3.graphql:L711 |
| `uid` | `String!` | yes | create+update |  | D3.graphql:L712 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update | Measure title as first stated. | D3.graphql:L714 |
| `lastWriterRunId` | `String` |  | create+update |  | D3.graphql:L716 |
| `outcomeKey` | `String!` | yes | create+update | Normalized measure + timepoint; equal across sources and versions for the same measure. | D3.graphql:L720 |
| `priority` | [OutcomePriority](../vocabularies/OutcomePriority.md) | yes | create+update |  | D3.graphql:L721 |
| `measureKind` | [MeasureKind](../vocabularies/MeasureKind.md) | yes | create+update |  | D3.graphql:L722 |
| `timepoint` | `String` |  | create+update | Timepoint or time frame as stated ('20 weeks', 'median 4.7 years'). | D3.graphql:L724 |
| `description` | `String` |  | create+update |  | D3.graphql:L725 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D3.graphql:L717 |
| `updatedAt` | `DateTime` |  | create+update |  | D3.graphql:L718 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D3.graphql:L715 |

## Outgoing relationships (8)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:OutcomeDefinition --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [MEASURES](../relationships/MEASURES.md) | [Biomarker](Biomarker.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | OutcomeDefinition.measures (OUT) | `edge.assert` |
| [MEASURES](../relationships/MEASURES.md) | [Condition](Condition.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | OutcomeDefinition.measures (OUT) | `edge.assert` |
| [MEASURES](../relationships/MEASURES.md) | [Metric](Metric.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | OutcomeDefinition.measures (OUT) | `edge.assert` |
| [MEASURES](../relationships/MEASURES.md) | [Outcome](Outcome.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | OutcomeDefinition.measures (OUT) | `edge.assert` |
| [STATED_IN](../relationships/STATED_IN.md) | [Publication](Publication.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | OutcomeDefinition.statedIn (OUT) | `edge.assert` |
| [STATED_IN](../relationships/STATED_IN.md) | [RegistrationVersion](RegistrationVersion.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | OutcomeDefinition.statedIn (OUT) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (12)

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
| [HAS_OUTCOME](../relationships/HAS_OUTCOME.md) | [Study](Study.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Study.outcomes (OUT) | `edge.structural` |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [RESULT_FOR](../relationships/RESULT_FOR.md) | [StudyResult](StudyResult.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | StudyResult.outcome (OUT) | `edge.structural` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (5)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [MEASURES](../predicates/MEASURES.md) | subject | authorizing | typed-edge | D3 |
| [OUTCOME_MEASURED_WITH](../predicates/OUTCOME_MEASURED_WITH.md) | subject | relationship | assertion-only | D3 |
| [STATED_IN](../predicates/STATED_IN.md) | subject | authorizing | typed-edge | D3 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a OutcomeDefinition are Assertions with it as subject: `(:OutcomeDefinition)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (3)

- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported; Q-D3-04)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported; CQ-RC-05, Q-D10-03, Q-D5-01, Q-D5-02, Q-D5-03)
- [QP/P-12](../patterns/QP/P-12.md) (supported; Q-D1-08, Q-D2-02, Q-D2-03, Q-D4-01, Q-D4-17)

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

- `node:OutcomeDefinition` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D3.graphql#L707-L734`
- `release:registers/node-register.yaml#OutcomeDefinition`
- `release:workspace-inputs/identity-rules.yaml#OutcomeDefinition`
