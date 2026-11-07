---
id: "node:Frontier"
kind: "node"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D13.graphql#L332-L366","release:registers/node-register.yaml#Frontier","release:workspace-inputs/identity-rules.yaml#Frontier"]
aliases: ["frontier"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:deff25ae77043a51ae0d6a107966fb45ed5242c18240ce3911d84a0b35d4bdc7"
---
# Frontier

Purpose: one curated research or therapeutic frontier — a field-level goal the community and investors track and that is not yet reliably achieved in humans ("senolytics in humans", "partial epigenetic reprogramming", "curing pancreatic cancer", "MASH fibrosis resolution"). The bucket every frontier question groups, filters and ranks by; events and studies attach to it by the asserted ON_FRONTIER classification; organizations, compounds and claims reach it only through events, studies and the kernel subject pattern (vocab-frontiers.yaml section 8). About 25 nodes, created only from vocab-frontiers.yaml by a vocabulary version bump. Not stored here: progress, stage, "furthest milestone", breakthrough or hype flags, success probability, market size (computed from ON_FRONTIER events, or Assessments/Reports about the Frontier), lists of organizations or compounds. Hierarchy is the property parentKey (two levels), relevance to D5 targets is the property targetKeys (D5 keys, vocabulary-to-vocabulary relevance, never an effect claim); neither spends a relationship type. `name` holds the vocabulary label. Identity rule: `key` (vocabulary id, e.g. frontier:senolytics-in-humans), never reused or renamed; a DEPRECATED frontier names its successor in replacedBy. External close matches (Wikidata QIDs of anchor concepts) are kernel Identifiers on the anchor entities, not on the Frontier. uid token: `frontier` (hu:frontier:<slug>, slug = key without the `frontier:` prefix). Questions: Q-D13-01, Q-D13-02, Q-D13-03, Q-D13-04, Q-D13-08, Q-D13-09, Q-D13-16, Q-D13-23, Q-D13-28, Q-D13-29, Q-D13-30.

## Identity

| | |
| --- | --- |
| id | `node:Frontier` · raw SDL [sdl:Frontier](../sdl/Frontier.graphql) |
| module / domain | [D13](../modules/D13.md) / [Frontiers, breakthroughs and events](../domains/frontiers-and-events.md) |
| uid | `hu:frontier:<opaque>` |
| stored labels | `Frontier` `Entity` (primary `Frontier`) |
| archetype | Vocabulary |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `key` |
| identity keys | `uid`, `name`, `key` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `key` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (17)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D13.graphql:L336 |
| `uid` | `String!` | yes | create+update |  | D13.graphql:L337 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D13.graphql:L338 |
| `lastWriterRunId` | `String` |  | create+update |  | D13.graphql:L340 |
| `key` | `String!` | yes | create+update | Stable vocabulary key (frontier:<slug>); unique. | D13.graphql:L344 |
| `definition` | `String!` | yes | create+update | One paragraph: the goal, phrased as a capability not yet reliably achieved. | D13.graphql:L346 |
| `level` | `Int!` | yes | create+update | 1 = theme, 2 = frontier (two levels only). | D13.graphql:L348 |
| `parentKey` | `String` |  | create+update | Key of the level-1 theme; null at level 1. | D13.graphql:L350 |
| `granularity` | [FrontierGranularity](../vocabularies/FrontierGranularity.md) | yes | create+update |  | D13.graphql:L351 |
| `synonyms` | `[String!]` |  | create+update | Feeds the fulltext index FrontierSearch(name, synonyms, definition) used to entity-link frontier phrases. | D13.graphql:L353 |
| `targetKeys` | `[String!]` |  | create+update | D5 target keys (packets/D5/vocab-targets.yaml) this frontier is relevant to; Q-D13-09 filters with IN. | D13.graphql:L355 |
| `curationStatus` | [FrontierCurationStatus](../vocabularies/FrontierCurationStatus.md) | yes | create+update |  | D13.graphql:L356 |
| `replacedBy` | `String` |  | create+update | Successor key when DEPRECATED. | D13.graphql:L358 |
| `vocabVersion` | `String!` | yes | create+update | vocab-frontiers.yaml version at creation or last edit. | D13.graphql:L360 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D13.graphql:L341 |
| `updatedAt` | `DateTime` |  | create+update |  | D13.graphql:L342 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D13.graphql:L339 |

## Outgoing relationships (2)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Frontier --direction out --expand`.

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
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [ON_FRONTIER](../relationships/ON_FRONTIER.md) | [Event](Event.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Event.frontiers (OUT) | `edge.assert` |
| [ON_FRONTIER](../relationships/ON_FRONTIER.md) | [Study](Study.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Frontier.studies (IN) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (3)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [ON_FRONTIER](../predicates/ON_FRONTIER.md) | object | authorizing | typed-edge | D13 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Frontier are Assertions with it as subject: `(:Frontier)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (8)

- [D13/Q-D13-04#1](../patterns/D13/Q-D13-04--1.md) (supported; Q-D13-04)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported; Q-D13-12)
- [D13/Q-D13-22#1](../patterns/D13/Q-D13-22--1.md) (supported; Q-D13-22)
- [D9/Q-D9-18](../patterns/D9/Q-D9-18.md) (supported; Q-D9-18)
- [D9/Q-D9-19#projection](../patterns/D9/Q-D9-19--projection.md) (unsupported; Q-D9-19)
- [QP/G-5#1](../patterns/QP/G-5--1.md) (unsupported; Q-D9-19)
- [QP/P-08a](../patterns/QP/P-08a.md) (supported; Q-D10-22, Q-D13-01, Q-D13-02, Q-D13-03)
- [QP/P-08b](../patterns/QP/P-08b.md) (supported; Q-D10-22, Q-D13-01, Q-D13-02, Q-D13-03)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create / update only by a vocabulary version bump; never delete
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

(none)

## Source definition

- `release:sdl/modules/D13.graphql#L332-L366`
- `release:registers/node-register.yaml#Frontier`
- `release:workspace-inputs/identity-rules.yaml#Frontier`
