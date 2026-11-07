---
id: "node:FoodCategory"
kind: "node"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D12.graphql#L228-L255","release:registers/node-register.yaml#FoodCategory","release:workspace-inputs/identity-rules.yaml#FoodCategory"]
aliases: ["food category","food-category","foodcategory"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert"]
cardDigest: "sha256:22bb4b2d8c8b873b0d6db9fd8e09bb5ec2983a6ab3386fce2d7d0bd81e946dc7"
---
# FoodCategory

Purpose: a food group as one classification system defines it (NOVA group 4 "ultra-processed food and drink products"; IARC agent "processed meat"; WWEIA 3702 "Burgers"; FDC food category "Fast Foods"; a guideline group such as DGA "highly processed foods"). It is the subject of hazard classifications and of target-effect assertions that are made about a group rather than one food (UPF and cardiometabolic outcomes; processed meat and colorectal cancer), and it lets a question expand from a food or product to the evidence about its group. Hierarchy is the property parentCode (no edge). Membership is IN_FOOD_CATEGORY (asserted when a source states it; a CALCULATED Assertion with a method version when we compute it, e.g. NOVA from ingredient markers). Identity rule: (system, systemVersion, code); label is presentation. uid token: `food-category` (hu:food-category:<system>-<code>). Questions: Q-D12-08, Q-D12-14, Q-D12-15, Q-D12-26, Q-D12-31, Q-D12-11.

## Identity

| | |
| --- | --- |
| id | `node:FoodCategory` · raw SDL [sdl:FoodCategory](../sdl/FoodCategory.graphql) |
| module / domain | [D12](../modules/D12.md) / [Interventions, protocols, safety, food and nutrition](../domains/exposures-and-interventions.md) |
| uid | `hu:food-category:<opaque>` |
| stored labels | `FoodCategory` `Entity` (primary `FoodCategory`) |
| archetype | Entity & Subjectable (classification concept) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `system` + `systemVersion` + `code` |
| identity keys | `uid`, `name`, `label`, `system`, `systemVersion`, `code` |
| identifier schemes | `WWEIA_CATEGORY` (disabled), `FOODEX2` (disabled), `LANGUAL` (disabled) |
| name match (workspace rule) | `name`, `label` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (13)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D12.graphql:L232 |
| `uid` | `String!` | yes | create+update |  | D12.graphql:L233 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D12.graphql:L234 |
| `lastWriterRunId` | `String` |  | create+update |  | D12.graphql:L236 |
| `system` | [FoodCategorySystem](../vocabularies/FoodCategorySystem.md) | yes | create+update | Classification system (identity key; filter: Q-D12-14 NOVA, Q-D12-15 IARC_AGENT). | D12.graphql:L240 |
| `code` | `String!` | yes | create+update | Code within the system ('4' for NOVA group 4; '3702' for WWEIA; 'processed-meat' for an IARC agent) (identity key). | D12.graphql:L242 |
| `systemVersion` | `String` |  | create+update | Version or edition of the system definition (identity key; 'NOVA-2019', 'IARC Vol 114', 'WWEIA 2021-2023'). | D12.graphql:L244 |
| `label` | `String` |  | create+update | Label as the system prints it. | D12.graphql:L246 |
| `definitionVerbatim` | `String` |  | create+update | Definition text of the system, verbatim (the locator lives on the defining Assertion). | D12.graphql:L248 |
| `parentCode` | `String` |  | create+update | Parent code in the same system (hierarchy as a property; no relationship type spent). | D12.graphql:L250 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D12.graphql:L237 |
| `updatedAt` | `DateTime` |  | create+update |  | D12.graphql:L238 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D12.graphql:L235 |

## Outgoing relationships (2)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:FoodCategory --direction out --expand`.

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
| [IN_FOOD_CATEGORY](../relationships/IN_FOOD_CATEGORY.md) | [FoodItem](FoodItem.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | FoodItem.categories (OUT) | `edge.assert` |
| [IN_FOOD_CATEGORY](../relationships/IN_FOOD_CATEGORY.md) | [Product](Product.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | FoodCategory.memberProducts (IN) | `edge.assert` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [PATTERN_COMPONENT](../relationships/PATTERN_COMPONENT.md) | [DietaryPattern](DietaryPattern.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | DietaryPattern.components (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (14)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [CAUSES_ADVERSE_EFFECT](../predicates/CAUSES_ADVERSE_EFFECT.md) | subject | literal | literal | D5 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FORMS_DURING_PREPARATION](../predicates/FORMS_DURING_PREPARATION.md) | object | relationship | assertion-only | D1 |
| [HAS_ACTION_LEVEL](../predicates/HAS_ACTION_LEVEL.md) | object | literal | literal | D8 |
| [HAS_HAZARD_CLASSIFICATION](../predicates/HAS_HAZARD_CLASSIFICATION.md) | subject | literal | literal | D12 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [IMPROVES_TARGET](../predicates/IMPROVES_TARGET.md) | subject | relationship | assertion-only | D5 |
| [INTENDED_FOR_TARGET](../predicates/INTENDED_FOR_TARGET.md) | subject | relationship | assertion-only | D5 |
| [INTERACTS_WITH](../predicates/INTERACTS_WITH.md) | subject | literal | literal | D5 |
| [IN_FOOD_CATEGORY](../predicates/IN_FOOD_CATEGORY.md) | object | authorizing | typed-edge | D12 |
| [MIXED_EFFECT_ON_TARGET](../predicates/MIXED_EFFECT_ON_TARGET.md) | subject | relationship | assertion-only | D5 |
| [NO_EFFECT_ON_TARGET](../predicates/NO_EFFECT_ON_TARGET.md) | subject | relationship | assertion-only | D5 |
| [PATTERN_COMPONENT](../predicates/PATTERN_COMPONENT.md) | object | authorizing | typed-edge | D12 |
| [WORSENS_TARGET](../predicates/WORSENS_TARGET.md) | subject | relationship | assertion-only | D5 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a FoodCategory are Assertions with it as subject: `(:FoodCategory)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
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
- Policy: create; update; never delete
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

(none)

## Source definition

- `release:sdl/modules/D12.graphql#L228-L255`
- `release:registers/node-register.yaml#FoodCategory`
- `release:workspace-inputs/identity-rules.yaml#FoodCategory`
