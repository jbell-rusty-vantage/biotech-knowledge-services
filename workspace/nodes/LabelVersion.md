---
id: "node:LabelVersion"
kind: "node"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L384-L433","release:registers/node-register.yaml#LabelVersion","release:workspace-inputs/identity-rules.yaml#LabelVersion"]
aliases: ["label version","label-version","labelversion","node:FormulationVersion","node:IngredientComponent","node:LabelDeclaration","node:LabelSnapshot","node:ProductSnapshot","node:QuantityDeclaration","node:ServingDefinition","FormulationVersion","IngredientComponent","LabelDeclaration","LabelSnapshot","ProductSnapshot","QuantityDeclaration","ServingDefinition"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:35d65668d07a0428a1c08ba114569bcb396c5b18ea8f82401bbfd2ae9e59fce1"
---
# LabelVersion

Purpose: one version of what a package's label (or a menu item's declaration) states — the panel, serving definition, directions with min/max daily servings, warnings, allergens, seals and the declared composition lines — as a content node that many kernel SourceSnapshots evidence (DSLD record, retailer Supplement Facts table, brand page). Absorbs the pinned FormulationVersion (composition = DECLARES_COMPONENT lines + compositionDigest), LabelSnapshot (content part; the capture stays a kernel SourceSnapshot), LabelDeclaration, QuantityDeclaration, IngredientComponent, ServingDefinition. Time lives on the HAS_LABEL_VERSION episode, never on this node (except the observation cache fields). Identity rule: (responsible brand/org uid as printed on this version, panelKind, jurisdiction, labelVersionCode when printed — DSLD productVersionCode 'V12.3' — else contentDigest of the normalized panel); a label version is immutable, so its key never changes. Two label versions with equal compositionDigest declare the same formulation (FC-1: label-only change). uid token: `label-version` (hu:label-version:<opaque>). Implements Subjectable under the kernel rule for versioned states (R-18): DSLD identifiers identify it, D1 CALCULATED amounts have it as subject, D6 change-kind and certification-scope Assessments target it. Questions: Q-D6-01, CQ-ID-05, CQ-ID-02, CQ-PF-01, CQ-AX-25, Q-D6-08, Q-D6-09, Q-D6-10, Q-D6-11, Q-D6-12, CQ-PF-03b, CQ-PF-02, Q-D6-21.

## Identity

| | |
| --- | --- |
| id | `node:LabelVersion` · raw SDL [sdl:LabelVersion](../sdl/LabelVersion.graphql) |
| module / domain | [D6](../modules/D6.md) / [Products, labels and commerce](../domains/products-and-commerce.md) |
| uid | `hu:label-version:<opaque>` |
| stored labels | `LabelVersion` `Entity` (primary `LabelVersion`) |
| archetype | versioned state (content payload; time on the HAS_LABEL_VERSION episode) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `responsibleBrandOrOrgUid (as printed on this version)` + `panelKind` + `jurisdiction` + `labelVersionCode (when printed) else contentDigest` |
| identity keys | `uid`, `name`, `panelKind`, `jurisdiction` |
| identifier schemes | `DSLD` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (29)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D6.graphql:L388 |
| `uid` | `String!` | yes | create+update |  | D6.graphql:L389 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D6.graphql:L390 |
| `lastWriterRunId` | `String` |  | create+update |  | D6.graphql:L392 |
| `panelKind` | [PanelKind](../vocabularies/PanelKind.md) | yes | create+update |  | D6.graphql:L395 |
| `labelVersionCode` | `String` |  | create+update | Version code printed on the label or registered by DSLD (productVersionCode). | D6.graphql:L397 |
| `jurisdiction` | `String` |  | create+update |  | D6.graphql:L398 |
| `contentDigest` | `String!` | yes | create+update | sha256:<hex> over the normalized panel (all fields and lines); identity fallback. | D6.graphql:L400 |
| `compositionDigest` | `String!` | yes | create+update | sha256:<hex> over the normalized composition lines only (resolved target uid, amount, unit, referent, basis, parent); equal digest = same formulation… | D6.graphql:L402 |
| `servingSizeValue` | `Float` |  | create+update |  | D6.graphql:L403 |
| `servingSizeUnit` | `String` |  | create+update | UCUM or annotated unit ({capsule}, g). | D6.graphql:L405 |
| `servingSizeVerbatim` | `String` |  | create+update |  | D6.graphql:L406 |
| `servingsPerContainer` | `Float` |  | create+update |  | D6.graphql:L407 |
| `minDailyServings` | `Float` |  | create+update |  | D6.graphql:L408 |
| `maxDailyServings` | `Float` |  | create+update | Maximum suggested daily servings from the directions (Q-D6-09: max declared daily intake = this × line amount). | D6.graphql:L410 |
| `directionsText` | `String` |  | create+update |  | D6.graphql:L411 |
| `warningsText` | `String` |  | create+update |  | D6.graphql:L412 |
| `containsAllergens` | [AllergenCode](../vocabularies/AllergenCode.md)[] |  | create+update |  | D6.graphql:L413 |
| `mayContainAllergens` | [AllergenCode](../vocabularies/AllergenCode.md)[] |  | create+update |  | D6.graphql:L414 |
| `allergenStatementVerbatim` | `String` |  | create+update |  | D6.graphql:L415 |
| `seals` | `[String!]` |  | create+update | Seals and certification marks as printed ('NSF Certified for Sport', 'Alkemist Assured'); scope checks are CQ-PF-03b assessments. | D6.graphql:L417 |
| `responsiblePartyRole` | [ResponsiblePartyRole](../vocabularies/ResponsiblePartyRole.md) |  | create+update |  | D6.graphql:L418 |
| `responsiblePartyVerbatim` | `String` |  | create+update |  | D6.graphql:L419 |
| `asOfStatementVerbatim` | `String` |  | create+update | Declared as-of statement ('correct as of January 2022'), verbatim; the parsed date bounds the episode's valid time. | D6.graphql:L421 |
| `firstObservedAt` | `DateTime` |  | create+update | Observation cache (executor-maintained from evidencing snapshots; read-only semantics): first and last retrievedAt. | D6.graphql:L423 |
| `lastObservedAt` | `DateTime` |  | create+update |  | D6.graphql:L424 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D6.graphql:L393 |
| `updatedAt` | `DateTime` |  | create+update |  | D6.graphql:L394 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D6.graphql:L391 |

## Outgoing relationships (6)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:LabelVersion --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) | [Constituent](Constituent.md) | asserted | recorded-only | [ComponentLineProperties](../edge-properties/ComponentLineProperties.md) | LabelVersion.components (OUT) | `edge.assert` |
| [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) | [FoodItem](FoodItem.md) | asserted | recorded-only | [ComponentLineProperties](../edge-properties/ComponentLineProperties.md) | LabelVersion.components (OUT) | `edge.assert` |
| [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) | [IngredientMaterial](IngredientMaterial.md) | asserted | recorded-only | [ComponentLineProperties](../edge-properties/ComponentLineProperties.md) | LabelVersion.components (OUT) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md) | [Organization](Organization.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | LabelVersion.responsibleParty (OUT) | `edge.assert` |
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
| [HAS_LABEL_VERSION](../relationships/HAS_LABEL_VERSION.md) | [Package](Package.md) | asserted | episode, exclusive | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Package.labelVersions (OUT) | `state.attach` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (12)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [BEARS_SEAL](../predicates/BEARS_SEAL.md) | subject+object | relationship | assertion-only | D6 |
| [CALCULATED_DAILY_MAX_INTAKE](../predicates/CALCULATED_DAILY_MAX_INTAKE.md) | subject | computation | computation | D6 |
| [CALCULATED_SERVING_MASS_TOTAL](../predicates/CALCULATED_SERVING_MASS_TOTAL.md) | subject | literal | literal | D6 |
| [DECLARATION_STOICHIOMETRY_CHECK](../predicates/DECLARATION_STOICHIOMETRY_CHECK.md) | subject | computation | computation | D6 |
| [DECLARES_COMPONENT](../predicates/DECLARES_COMPONENT.md) | subject | authorizing | typed-edge | D6 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FIELD_NOT_REPORTED](../predicates/FIELD_NOT_REPORTED.md) | subject | literal | literal | K |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HAS_LABEL_VERSION](../predicates/HAS_LABEL_VERSION.md) | object | authorizing | typed-edge | D6 |
| [MAX_DAILY_SERVINGS](../predicates/MAX_DAILY_SERVINGS.md) | subject | field | field | D6 |
| [NAMES_RESPONSIBLE_PARTY](../predicates/NAMES_RESPONSIBLE_PARTY.md) | subject | authorizing | typed-edge | D6 |
| [OFF_MARKET](../predicates/OFF_MARKET.md) | subject | relationship | assertion-only | D6 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a LabelVersion are Assertions with it as subject: `(:LabelVersion)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (12)

- [D1/CQ-ID-03](../patterns/D1/CQ-ID-03.md) (supported; CQ-ID-03)
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported; CQ-PF-01)
- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported; Q-D1-16)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported; Q-D12-18)
- [D6/CQ-AX-25#1](../patterns/D6/CQ-AX-25--1.md) (supported; CQ-AX-25)
- [D6/CQ-PF-01#1](../patterns/D6/CQ-PF-01--1.md) (supported; CQ-PF-01)
- [D6/Q-D6-01#1](../patterns/D6/Q-D6-01--1.md) (supported; Q-D6-01)
- [D6/Q-D6-08#1](../patterns/D6/Q-D6-08--1.md) (supported; Q-D6-08)
- [D6/Q-D6-10#1](../patterns/D6/Q-D6-10--1.md) (supported; Q-D6-10)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported; Q-D6-11)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported; CQ-MF-01)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported; Q-D8-18)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update observation cache fields only (content is immutable); never delete
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `MEASURED_CONTENT_IN_PRODUCT` does NOT imply `DECLARES_COMPONENT`

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)
- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md)

## v1 navigation aliases

- `node:FormulationVersion` (merged): D6: LabelVersion
- `node:IngredientComponent` (merged): D6: LabelVersion
- `node:LabelDeclaration` (merged): D6: LabelVersion
- `node:LabelSnapshot` (merged): D6: LabelVersion
- `node:ProductSnapshot` (merged): D6: LabelVersion
- `node:QuantityDeclaration` (merged): D6: LabelVersion
- `node:ServingDefinition` (merged): D6: LabelVersion

## Source definition

- `release:sdl/modules/D6.graphql#L384-L433`
- `release:registers/node-register.yaml#LabelVersion`
- `release:workspace-inputs/identity-rules.yaml#LabelVersion`
