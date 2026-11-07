---
id: "node:Target"
kind: "node"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L241-L269","release:registers/node-register.yaml#Target","release:workspace-inputs/identity-rules.yaml#Target"]
aliases: ["target","node:FunctionalGoal","FunctionalGoal"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:dd80f87f6970348c5bbadb3ff531475038382011cc50cba6c1c5ce324f2b3bbd"
---
# Target

Purpose: one curated goal people pursue (sleep, strength, brain fitness, body composition, longevity, energy, mood, recovery ...): the shared targets vocabulary (00-DIRECTIVE 3.1; packets/D5/vocab-targets.yaml). Every "what helps / hurts T" and "what is this for" question starts or ends here. Means never point at a Target with a typed edge or a property: they reach it as the object of a kernel Assertion (predicate INTENDED_FOR_TARGET | IMPROVES_TARGET | WORSENS_TARGET | NO_EFFECT_ON_TARGET | MIXED_EFFECT_ON_TARGET) or of a kernel Assessment (ASSESSES, effectDirection). Hierarchy is the `parentKey` property (2 levels). Not a molecular target (D2), not a Condition (D2), not a Frontier (D13). Identity rule: `key` (target:<slug>), stable, never reused; MeSH / Wikidata ids attach through the kernel. Not a D2 Outcome either: an Outcome is a study-independent endpoint concept (all-cause mortality, handgrip strength, sleep quality as an endpoint) that a Target is OPERATIONALIZED_BY; the Target is what a person pursues, the Outcome how a study scores it (09 D-19). uid token: `target` (hu:target:<slug>). Questions: Q-D5-01, Q-D5-02, Q-D5-03, Q-D5-14, Q-D5-15, Q-D5-18, Q-D5-19, Q-D5-20, Q-D5-28.

## Identity

| | |
| --- | --- |
| id | `node:Target` · raw SDL [sdl:Target](../sdl/Target.graphql) |
| module / domain | [D5](../modules/D5.md) / [Interventions, protocols, safety, food and nutrition](../domains/exposures-and-interventions.md) |
| uid | `hu:target:<opaque>` |
| stored labels | `Target` `Entity` (primary `Target`) |
| archetype | Entity (curated vocabulary) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `key` |
| identity keys | `uid`, `name`, `label`, `key` |
| identifier schemes | `MESH` (active), `WIKIDATA` (active) |
| name match (workspace rule) | `name`, `label` · uid slug from `key` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (16)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D5.graphql:L245 |
| `uid` | `String!` | yes | create+update |  | D5.graphql:L246 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D5.graphql:L247 |
| `lastWriterRunId` | `String` |  | create+update |  | D5.graphql:L249 |
| `key` | `String!` | yes | create+update | Stable vocabulary key, e.g. target:sleep (unique). | D5.graphql:L253 |
| `label` | `String!` | yes | create+update |  | D5.graphql:L254 |
| `definition` | `String!` | yes | create+update |  | D5.graphql:L255 |
| `parentKey` | `String` |  | create+update | Parent key for a level-2 target (target:fat-loss -> target:body-composition); null at top level. | D5.graphql:L257 |
| `level` | `Int` |  | create+update |  | D5.graphql:L258 |
| `synonyms` | `[String!]` |  | create+update | Feeds the fulltext index TargetSearch(label, synonyms, definition) used for entity linking of goal phrases. | D5.graphql:L260 |
| `vocabVersion` | `String!` | yes | create+update | vocab-targets.yaml version at creation or last edit. | D5.graphql:L262 |
| `status` | [TargetStatus](../vocabularies/TargetStatus.md) | yes | create+update |  | D5.graphql:L263 |
| `replacedBy` | `String` |  | create+update |  | D5.graphql:L264 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D5.graphql:L250 |
| `updatedAt` | `DateTime` |  | create+update |  | D5.graphql:L251 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D5.graphql:L248 |

## Outgoing relationships (6)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Target --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) | [Biomarker](Biomarker.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Target.operationalizedBy (OUT) | `edge.assert` |
| [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) | [Condition](Condition.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Target.operationalizedBy (OUT) | `edge.assert` |
| [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) | [Metric](Metric.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Target.operationalizedBy (OUT) | `edge.assert` |
| [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) | [Outcome](Outcome.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Target.operationalizedBy (OUT) | `edge.assert` |
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

## Legal predicates (9)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [IMPROVES_TARGET](../predicates/IMPROVES_TARGET.md) | object | relationship | assertion-only | D5 |
| [INTENDED_FOR_TARGET](../predicates/INTENDED_FOR_TARGET.md) | object | relationship | assertion-only | D5 |
| [MEDIATES_TARGET](../predicates/MEDIATES_TARGET.md) | object | relationship | assertion-only | D2 |
| [MIXED_EFFECT_ON_TARGET](../predicates/MIXED_EFFECT_ON_TARGET.md) | object | relationship | assertion-only | D5 |
| [NO_EFFECT_ON_TARGET](../predicates/NO_EFFECT_ON_TARGET.md) | object | relationship | assertion-only | D5 |
| [OPERATIONALIZED_BY](../predicates/OPERATIONALIZED_BY.md) | subject | authorizing | typed-edge | D5 |
| [WORSENS_TARGET](../predicates/WORSENS_TARGET.md) | object | relationship | assertion-only | D5 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Target are Assertions with it as subject: `(:Target)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (10)

- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported; Q-D10-03)
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported; Q-D10-08)
- [D2/Q-D2-10](../patterns/D2/Q-D2-10.md) (supported; Q-D2-10)
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported; Q-D3-04)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported; Q-D5-17)
- [D5/Q-D5-20](../patterns/D5/Q-D5-20.md) (supported; Q-D5-20)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported; Q-D8-18)
- [QP/P-06a](../patterns/QP/P-06a.md) (supported; CQ-RC-05, Q-D10-03, Q-D5-01, Q-D5-02, Q-D5-03)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported; CQ-RC-05, Q-D10-03, Q-D5-01, Q-D5-02, Q-D5-03)
- [QP/P-07](../patterns/QP/P-07.md) (supported; CQ-RC-06, Q-D10-08, Q-D10-24, Q-D5-02, Q-D5-06, Q-D5-07)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create, update; never delete (packet: create true, update true, delete false)
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:Target` is unchanged from v1.
- `node:FunctionalGoal` (merged): D5: Target

## Source definition

- `release:sdl/modules/D5.graphql#L241-L269`
- `release:registers/node-register.yaml#Target`
- `release:workspace-inputs/identity-rules.yaml#Target`
