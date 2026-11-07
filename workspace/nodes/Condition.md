---
id: "node:Condition"
kind: "node"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L408-L423","release:registers/node-register.yaml#Condition","release:workspace-inputs/identity-rules.yaml#Condition"]
aliases: ["condition","node:AdverseEffect","node:RiskFactor","AdverseEffect","RiskFactor"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:141ab89bdca2abf7333eaa2306c0f2666dcc77695b6d3aab93b951740986124b"
---
# Condition

Purpose: a disease, syndrome, phenotype or risk state (conditionKind) that mechanisms are linked to and that other modules scope by: D3 studies investigate it, D5 contraindications and adverse effects name it (CAUSES_ADVERSE_EFFECT object, R-84), D4 biomarkers indicate it, D13 frontiers anchor on it. A TargetMeasure member: D5 Target -[:OPERATIONALIZED_BY]-> Condition means the incidence of this condition measures the target (declared by D5, R-70). Absorbs the pinned RiskFactor (RISK_STATE: insulin resistance, obesity); behavioural exposures (smoking, inactivity) are D5 Interventions/exposures. Identity rule: MONDO id when one exists (kernel Identifier MONDO, plus ICD10CM, HPO, SNOMEDCT, MESH bridges), else curated `key` bellabs:<slug>. uid token: `condition` (hu:condition:<opaque>). Questions: Q-D2-14, Q-D2-15, Q-D2-06.

## Identity

| | |
| --- | --- |
| id | `node:Condition` · raw SDL [sdl:Condition](../sdl/Condition.graphql) |
| module / domain | [D2](../modules/D2.md) / [Substances, materials, mechanisms and biology](../domains/substances-and-biology.md) |
| uid | `hu:condition:<opaque>` |
| stored labels | `Condition` `Entity` (primary `Condition`) |
| archetype | vocabulary (MONDO-backed, loaded on demand) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `MONDO identifier when present` + `key` |
| identity keys | `uid`, `name`, `key` |
| identifier schemes | `MONDO` (disabled), `ICD10CM` (active), `HPO` (disabled), `SNOMEDCT` (disabled), `MESH` (active), `WIKIDATA` (active), `ORPHANET` (disabled), `OMIM` (disabled), `EFO` (disabled) |
| name match (workspace rule) | `name` · uid slug from `key` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (11)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D2.graphql:L412 |
| `uid` | `String!` | yes | create+update |  | D2.graphql:L413 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D2.graphql:L414 |
| `lastWriterRunId` | `String` |  | create+update |  | D2.graphql:L416 |
| `key` | `String` |  | create+update |  | D2.graphql:L419 |
| `conditionKind` | [ConditionKind](../vocabularies/ConditionKind.md) |  | create+update |  | D2.graphql:L420 |
| `description` | `String` |  | create+update |  | D2.graphql:L421 |
| `synonyms` | `[String!]` |  | create+update |  | D2.graphql:L422 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D2.graphql:L417 |
| `updatedAt` | `DateTime` |  | create+update |  | D2.graphql:L418 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D2.graphql:L415 |

## Outgoing relationships (2)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Condition --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
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
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [INVESTIGATES](../relationships/INVESTIGATES.md) | [Study](Study.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Study.conditions (OUT) | `edge.assert` |
| [MEASURES](../relationships/MEASURES.md) | [OutcomeDefinition](OutcomeDefinition.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | OutcomeDefinition.measures (OUT) | `edge.assert` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) | [Target](Target.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Target.operationalizedBy (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (18)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [AFFECTS_ORGAN](../predicates/AFFECTS_ORGAN.md) | subject | literal | literal | D2 |
| [CAUSES_ADVERSE_EFFECT](../predicates/CAUSES_ADVERSE_EFFECT.md) | object | literal | literal | D5 |
| [CHARACTERIZES_INCIDENCE](../predicates/CHARACTERIZES_INCIDENCE.md) | object | relationship | assertion-only | D10 |
| [DECREASES_RISK_OF](../predicates/DECREASES_RISK_OF.md) | subject+object | relationship | assertion-only | D2 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_APPROVED_INDICATION](../predicates/HAS_APPROVED_INDICATION.md) | object | relationship | assertion-only | D8 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INCREASES_RISK_OF](../predicates/INCREASES_RISK_OF.md) | subject+object | relationship | assertion-only | D2 |
| [INDICATES_CONDITION](../predicates/INDICATES_CONDITION.md) | object | relationship | assertion-only | D4 |
| [INTERFERES_WITH](../predicates/INTERFERES_WITH.md) | object | literal | literal | D4 |
| [INVESTIGATES](../predicates/INVESTIGATES.md) | object | authorizing | typed-edge | D3 |
| [MEASURES](../predicates/MEASURES.md) | object | authorizing | typed-edge | D3 |
| [MECHANISM_OF](../predicates/MECHANISM_OF.md) | object | relationship | assertion-only | D2 |
| [OPERATIONALIZED_BY](../predicates/OPERATIONALIZED_BY.md) | object | authorizing | typed-edge | D5 |
| [REPORTS_ASSOCIATION_SCORE](../predicates/REPORTS_ASSOCIATION_SCORE.md) | object | relationship | assertion-only | D10 |
| [REPORTS_DISPROPORTIONALITY_SIGNAL](../predicates/REPORTS_DISPROPORTIONALITY_SIGNAL.md) | object | relationship | assertion-only | D10 |
| [REPORTS_REPORT_COUNT](../predicates/REPORTS_REPORT_COUNT.md) | subject+object | relationship | assertion-only | D10 |
| [USE_CONSTRAINED_IN](../predicates/USE_CONSTRAINED_IN.md) | object | literal | literal | D5 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Condition are Assertions with it as subject: `(:Condition)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (5)

- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported; Q-D10-03)
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported; Q-D10-08)
- [D5/Q-D5-20](../patterns/D5/Q-D5-20.md) (supported; Q-D5-20)
- [D9/Q-D9-11](../patterns/D9/Q-D9-11.md) (supported; Q-D9-11)
- [QP/P-07](../patterns/QP/P-07.md) (supported; CQ-RC-06, Q-D10-08, Q-D10-24, Q-D5-02, Q-D5-06, Q-D5-07)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:Condition` is unchanged from v1.
- `node:AdverseEffect` (merged): D5: D2.Condition
- `node:RiskFactor` (merged): D2: Condition

## Source definition

- `release:sdl/modules/D2.graphql#L408-L423`
- `release:registers/node-register.yaml#Condition`
- `release:workspace-inputs/identity-rules.yaml#Condition`
