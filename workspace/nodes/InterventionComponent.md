---
id: "node:InterventionComponent"
kind: "node"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L608-L644","release:registers/node-register.yaml#InterventionComponent","release:workspace-inputs/identity-rules.yaml#InterventionComponent"]
aliases: ["intervention component","intervention-component","interventioncomponent"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:26e7bb356c3cd4dd4ababfbec887e7b5892a4ef11b41b8a9794180b0f3f4017d"
---
# InterventionComponent

Purpose: one administered thing inside one arm with its dose as stated — amount, unit, basis (per dose / day / kg diet), mass basis (salt vs moiety), form, route, schedule, duration, verbatim dose text, lot and supplier as stated — and the resolved material it administered (ADMINISTERS). A node rather than edge properties because the kernel edge-property types carry no dose fields and because assertions hang on it: measured delivery (ITP NR diet assayed at 67–89% of nominal), dose equivalence (PEARL compounded 5 mg ≈ 1.43 mg generic), material provider. Absorbs pinned InterventionComponent and the dose half of StudyIntervention. Identity rule: (arm, materialTextVerbatim normalized, componentRole, payloadHash). uid token: `intervention-component`. Questions: CQ-ST-01, CQ-ST-02, CQ-EV-04, Q-D3-04, Q-D3-06, Q-D3-07.

## Identity

| | |
| --- | --- |
| id | `node:InterventionComponent` · raw SDL [sdl:InterventionComponent](../sdl/InterventionComponent.graphql) |
| module / domain | [D3](../modules/D3.md) / [Clinical and preclinical evidence](../domains/studies-and-evidence.md) |
| uid | `hu:intervention-component:<opaque>` |
| stored labels | `InterventionComponent` `Entity` (primary `InterventionComponent`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `arm` + `materialTextVerbatim (normalized)` + `componentRole` + `payloadHash` |
| identity keys | `uid`, `name`, `componentRole`, `payloadHash` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (22)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D3.graphql:L612 |
| `uid` | `String!` | yes | create+update |  | D3.graphql:L613 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D3.graphql:L614 |
| `lastWriterRunId` | `String` |  | create+update |  | D3.graphql:L616 |
| `componentRole` | [ComponentRole](../vocabularies/ComponentRole.md) | yes | create+update |  | D3.graphql:L619 |
| `materialTextVerbatim` | `String!` | yes | create+update | What the source named (e.g. 'Nicotinamide riboside chloride, ChromaDex'). | D3.graphql:L621 |
| `interventionTypeVerbatim` | `String` |  | create+update | Registry intervention type as stated (DRUG, DIETARY_SUPPLEMENT, DEVICE, BEHAVIORAL, ...). | D3.graphql:L623 |
| `quantity` | `Float` |  | create+update |  | D3.graphql:L624 |
| `unitCode` | `String` |  | create+update | UCUM unit of quantity (mg, mg/kg, [ppm]). | D3.graphql:L626 |
| `quantityBasis` | [AmountBasis](../vocabularies/AmountBasis.md) |  | create+update | D6 enum AmountBasis (owner D6, R-58; e.g. PER_DOSE, PER_DAY, PER_KG_DIET, MEDIUM_CONCENTRATION). | D3.graphql:L628 |
| `massBasis` | [MassBasis](../vocabularies/MassBasis.md) |  | create+update | D1 enum MassBasis (owner D1; 10-seams.yaml sharedVocabularies). | D3.graphql:L630 |
| `route` | [AdministrationRoute](../vocabularies/AdministrationRoute.md) |  | create+update |  | D3.graphql:L631 |
| `dosageForm` | `String` |  | create+update |  | D3.graphql:L632 |
| `scheduleText` | `String` |  | create+update |  | D3.graphql:L633 |
| `durationIso` | `String` |  | create+update | ISO 8601 duration of administration (P20W). | D3.graphql:L635 |
| `verbatimDoseText` | `String` |  | create+update |  | D3.graphql:L636 |
| `lotCodeVerbatim` | `String` |  | create+update |  | D3.graphql:L637 |
| `supplierNameVerbatim` | `String` |  | create+update |  | D3.graphql:L638 |
| `payloadHash` | `String!` | yes | create+update |  | D3.graphql:L639 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D3.graphql:L617 |
| `updatedAt` | `DateTime` |  | create+update |  | D3.graphql:L618 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D3.graphql:L615 |

## Outgoing relationships (7)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:InterventionComponent --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ADMINISTERS](../relationships/ADMINISTERS.md) | [DietaryPattern](DietaryPattern.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | InterventionComponent.administers (OUT) | `edge.assert` |
| [ADMINISTERS](../relationships/ADMINISTERS.md) | [FoodItem](FoodItem.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | InterventionComponent.administers (OUT) | `edge.assert` |
| [ADMINISTERS](../relationships/ADMINISTERS.md) | [IngredientMaterial](IngredientMaterial.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | InterventionComponent.administers (OUT) | `edge.assert` |
| [ADMINISTERS](../relationships/ADMINISTERS.md) | [Intervention](Intervention.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | InterventionComponent.administers (OUT) | `edge.assert` |
| [ADMINISTERS](../relationships/ADMINISTERS.md) | [ProductVariant](ProductVariant.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | InterventionComponent.administers (OUT) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (11)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [HAS_COMPONENT](../relationships/HAS_COMPONENT.md) | [StudyArm](StudyArm.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | StudyArm.components (OUT) | `edge.structural` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (14)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [ADMINISTERED_AMOUNT](../predicates/ADMINISTERED_AMOUNT.md) | subject | literal | literal | D3 |
| [ADMINISTERED_MATERIAL_PURITY](../predicates/ADMINISTERED_MATERIAL_PURITY.md) | subject | field | field | D3 |
| [ADMINISTERS](../predicates/ADMINISTERS.md) | subject | authorizing | typed-edge | D3 |
| [DOSAGE_FORM](../predicates/DOSAGE_FORM.md) | subject | field | field | D3 |
| [DOSE_EQUIVALENT_TO](../predicates/DOSE_EQUIVALENT_TO.md) | subject+object | literal | literal | D3 |
| [DOSE_EXCEEDS_LABEL_RECOMMENDATION](../predicates/DOSE_EXCEEDS_LABEL_RECOMMENDATION.md) | subject | literal | literal | D3 |
| [DURATION_ISO](../predicates/DURATION_ISO.md) | subject | field | field | D3 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [MATERIAL_PROVIDED_BY](../predicates/MATERIAL_PROVIDED_BY.md) | subject | relationship | assertion-only | D3 |
| [MEASURED_DELIVERY_FRACTION](../predicates/MEASURED_DELIVERY_FRACTION.md) | subject | literal | literal | D3 |
| [QUANTITY](../predicates/QUANTITY.md) | subject | field | field | D3 |
| [UNIT_DOSE_AMOUNT](../predicates/UNIT_DOSE_AMOUNT.md) | subject | literal | literal | D3 |
| [WELL_TOLERATED_AT_DOSE](../predicates/WELL_TOLERATED_AT_DOSE.md) | subject | literal | literal | D3 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a InterventionComponent are Assertions with it as subject: `(:InterventionComponent)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
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

- `node:InterventionComponent` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D3.graphql#L608-L644`
- `release:registers/node-register.yaml#InterventionComponent`
- `release:workspace-inputs/identity-rules.yaml#InterventionComponent`
