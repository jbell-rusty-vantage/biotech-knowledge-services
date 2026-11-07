---
id: "node:Outcome"
kind: "node"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L437-L452","release:registers/node-register.yaml#Outcome","release:workspace-inputs/identity-rules.yaml#Outcome"]
aliases: ["outcome"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach"]
cardDigest: "sha256:1c5e7f4bccb35208b0f3ae96089afa557fe48b61e4622863197d7641be7838d0"
---
# Outcome

Purpose: a study-independent endpoint concept (lifespan, all-cause mortality, handgrip strength, VO2max, sleep quality) — the join point where D3 OutcomeDefinitions (MEASURES), D5 Targets (OPERATIONALIZED_BY, declared by D5 in its TargetMeasure union; R-70) and D2 mechanism → outcome Assertions meet, so "which mechanism steps between compound C and outcome O were measured in humans" (Q-D2-26) and "what helps target T by what evidence" (D5) traverse one node instead of per-study strings. Biological proxies (NAD+, HbA1c, p16) are D4 Biomarkers, not Outcomes. Identity rule: curated `key` bellabs:outcome:<slug>; small curated vocabulary (target 50–150 nodes). No LOINC identifier: LOINC belongs to D4 Metric only (R-42, R-70). uid token: `outcome` (hu:outcome:<opaque>). Questions: Q-D2-07, Q-D2-14, Q-D2-20, Q-D2-26.

## Identity

| | |
| --- | --- |
| id | `node:Outcome` · raw SDL [sdl:Outcome](../sdl/Outcome.graphql) |
| module / domain | [D2](../modules/D2.md) / [Substances, materials, mechanisms and biology](../domains/substances-and-biology.md) |
| uid | `hu:outcome:<opaque>` |
| stored labels | `Outcome` `Entity` (primary `Outcome`) |
| archetype | vocabulary (curated, 50–150 nodes) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `key` |
| identity keys | `uid`, `name`, `key` |
| identifier schemes | `WIKIDATA` (active) |
| name match (workspace rule) | `name` · uid slug from `key` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (11)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D2.graphql:L441 |
| `uid` | `String!` | yes | create+update |  | D2.graphql:L442 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D2.graphql:L443 |
| `lastWriterRunId` | `String` |  | create+update |  | D2.graphql:L445 |
| `key` | `String` |  | create+update |  | D2.graphql:L448 |
| `outcomeKind` | [OutcomeKind](../vocabularies/OutcomeKind.md) |  | create+update |  | D2.graphql:L449 |
| `description` | `String` |  | create+update |  | D2.graphql:L450 |
| `synonyms` | `[String!]` |  | create+update |  | D2.graphql:L451 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D2.graphql:L446 |
| `updatedAt` | `DateTime` |  | create+update |  | D2.graphql:L447 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D2.graphql:L444 |

## Outgoing relationships (2)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Outcome --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
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
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MEASURES](../relationships/MEASURES.md) | [OutcomeDefinition](OutcomeDefinition.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | OutcomeDefinition.measures (OUT) | `edge.assert` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) | [Target](Target.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Target.operationalizedBy (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (9)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [DECREASES_LEVEL_OF](../predicates/DECREASES_LEVEL_OF.md) | object | relationship | assertion-only | D2 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INCREASES_LEVEL_OF](../predicates/INCREASES_LEVEL_OF.md) | object | relationship | assertion-only | D2 |
| [MEASURES](../predicates/MEASURES.md) | object | authorizing | typed-edge | D3 |
| [MECHANISM_OF](../predicates/MECHANISM_OF.md) | object | relationship | assertion-only | D2 |
| [MIXED_EFFECT_ON](../predicates/MIXED_EFFECT_ON.md) | object | relationship | assertion-only | D2 |
| [NO_CHANGE_IN](../predicates/NO_CHANGE_IN.md) | object | relationship | assertion-only | D2 |
| [OPERATIONALIZED_BY](../predicates/OPERATIONALIZED_BY.md) | object | authorizing | typed-edge | D5 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Outcome are Assertions with it as subject: `(:Outcome)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
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

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:Outcome` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D2.graphql#L437-L452`
- `release:registers/node-register.yaml#Outcome`
- `release:workspace-inputs/identity-rules.yaml#Outcome`
