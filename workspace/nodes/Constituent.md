---
id: "node:Constituent"
kind: "node"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L364-L381","release:registers/node-register.yaml#Constituent","release:workspace-inputs/identity-rules.yaml#Constituent"]
aliases: ["constituent","node:Nutrient","Nutrient"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:e784bfe303e4b77642803d31b57c9ec4241497b31cbb5752a787f4a41e1b1981"
---
# Constituent

Purpose: a component concept with no single defined structure — a NUTRIENT with its own declaration convention ("vitamin B6" = six vitamers, declared "as pyridoxine"; "magnesium" as elemental Mg), a CHEMICAL_CLASS ("total withanolides"), an ANALYTICAL_MEASURAND ("flavonoids calculated as flavone glycosides") or a NON_SPECIFIC_FRACTION. It is the join point for nutrient-basis harm thresholds (TGA B6 > 50 mg per maximum daily dose; UL 100 mg), for "every form of M" expansion, for marker standardization and for food composition (D12). Absorbs the pinned Nutrient node. Identity rule: (constituentKind, normalized name); nutrients by the authority nutrient list they are declared under (21 CFR 101.9 / 101.36 nutrient names; NIH ODS); classes by ChEBI class id when one exists (identifier through the kernel). uid token: `constituent` (hu:constituent:<opaque>; pinned hu:nutrient: uids migrate here). Questions: CQ-PF-01, Q-D1-02, Q-D1-03, Q-D1-04, CQ-ID-03, Q-D1-13, Q-D1-19, Q-D1-20, Q-D1-22, Q-D1-28.

## Identity

| | |
| --- | --- |
| id | `node:Constituent` · raw SDL [sdl:Constituent](../sdl/Constituent.graphql) |
| module / domain | [D1](../modules/D1.md) / [Substances, materials, mechanisms and biology](../domains/substances-and-biology.md) |
| uid | `hu:constituent:<opaque>` |
| stored labels | `Constituent` `Entity` (primary `Constituent`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `constituentKind` + `normalized name (nutrients: authority nutrient list name, e.g. 21 CFR 101.9)` + `CHEBI class id when one exists` |
| identity keys | `uid`, `name`, `constituentKind` |
| identifier schemes | `CHEBI` (active), `MESH` (active), `FDC_NUTRIENT` (disabled) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (11)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D1.graphql:L368 |
| `uid` | `String!` | yes | create+update |  | D1.graphql:L369 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D1.graphql:L370 |
| `lastWriterRunId` | `String` |  | create+update |  | D1.graphql:L372 |
| `constituentKind` | [ConstituentKind](../vocabularies/ConstituentKind.md) | yes | create+update |  | D1.graphql:L375 |
| `nutrientKind` | [NutrientKind](../vocabularies/NutrientKind.md) |  | create+update |  | D1.graphql:L376 |
| `referenceUnitCode` | `String` |  | create+update | UCUM unit the nutrient is conventionally declared in ('mg', 'ug{RAE}', 'mg{NE}', 'ug{DFE}'); NUTRIENT only. | D1.graphql:L378 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D1.graphql:L373 |
| `updatedAt` | `DateTime` |  | create+update |  | D1.graphql:L374 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D1.graphql:L371 |

### Search (derived, never evidence)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `searchText` | `String` |  | create+update | Names and label spellings joined for the fulltext index d1_identity_fulltext (Q-D1-26). | D1.graphql:L380 |

## Outgoing relationships (2)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Constituent --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (16)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [COUNTS_TOWARD_NUTRIENT](../relationships/COUNTS_TOWARD_NUTRIENT.md) | [ChemicalSubstance](ChemicalSubstance.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | ChemicalSubstance.nutrients (OUT) | `edge.assert` |
| [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) | [LabelVersion](LabelVersion.md) | asserted | recorded-only | [ComponentLineProperties](../edge-properties/ComponentLineProperties.md) | LabelVersion.components (OUT) | `edge.assert` |
| [FOOD_CONTAINS](../relationships/FOOD_CONTAINS.md) | [FoodItem](FoodItem.md) | asserted | recorded-only | [FoodContentProperties](../edge-properties/FoodContentProperties.md) | FoodItem.components (OUT) | `edge.assert` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MATERIAL_CONTAINS](../relationships/MATERIAL_CONTAINS.md) | [IngredientMaterial](IngredientMaterial.md) | asserted | episode | [ContentEdgeProperties](../edge-properties/ContentEdgeProperties.md) | IngredientMaterial.containsConstituents (OUT) | `edge.assert` |
| [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md) | [QualityResult](QualityResult.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | QualityResult.analyte (OUT) | `edge.assert` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [PATTERN_COMPONENT](../relationships/PATTERN_COMPONENT.md) | [DietaryPattern](DietaryPattern.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | DietaryPattern.components (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (16)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [CALCULATED_DAILY_MAX_INTAKE](../predicates/CALCULATED_DAILY_MAX_INTAKE.md) | object | computation | computation | D6 |
| [COUNTS_TOWARD_NUTRIENT](../predicates/COUNTS_TOWARD_NUTRIENT.md) | object | authorizing | typed-edge | D1 |
| [DECLARATION_STOICHIOMETRY_CHECK](../predicates/DECLARATION_STOICHIOMETRY_CHECK.md) | object | computation | computation | D6 |
| [DECLARES_COMPONENT](../predicates/DECLARES_COMPONENT.md) | object | authorizing | typed-edge | D6 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FOOD_CONTAINS](../predicates/FOOD_CONTAINS.md) | object | authorizing | typed-edge | D12 |
| [HAS_AUTHORIZED_DOSE_RANGE](../predicates/HAS_AUTHORIZED_DOSE_RANGE.md) | subject | literal | literal | D5 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HAS_UPPER_LIMIT](../predicates/HAS_UPPER_LIMIT.md) | subject | literal | literal | D5 |
| [MATERIAL_CONTAINS](../predicates/MATERIAL_CONTAINS.md) | object | authorizing | typed-edge | D1 |
| [MEASURES_ANALYTE](../predicates/MEASURES_ANALYTE.md) | object | authorizing | typed-edge | D8 |
| [MEMBER_OF_CLASS](../predicates/MEMBER_OF_CLASS.md) | object | relationship | assertion-only | D1 |
| [NUTRIENT_EQUIVALENT_AMOUNT](../predicates/NUTRIENT_EQUIVALENT_AMOUNT.md) | object | computation | computation | D1 |
| [NUTRIENT_EXPRESSED_AS](../predicates/NUTRIENT_EXPRESSED_AS.md) | subject | relationship | assertion-only | D1 |
| [PATTERN_COMPONENT](../predicates/PATTERN_COMPONENT.md) | object | authorizing | typed-edge | D12 |
| [PREPARATION_CHANGES_CONTENT](../predicates/PREPARATION_CHANGES_CONTENT.md) | object | literal | literal | D12 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Constituent are Assertions with it as subject: `(:Constituent)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (2)

- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported; CQ-PF-01)
- [D6/CQ-AX-25#1](../patterns/D6/CQ-AX-25--1.md) (supported; CQ-AX-25)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `MEASURED_CONTENT_IN_PRODUCT` does NOT imply `DECLARES_COMPONENT`

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)

## v1 navigation aliases

- `node:Constituent` is unchanged from v1.
- `node:Nutrient` (merged): D1: Constituent

## Source definition

- `release:sdl/modules/D1.graphql#L364-L381`
- `release:registers/node-register.yaml#Constituent`
- `release:workspace-inputs/identity-rules.yaml#Constituent`
