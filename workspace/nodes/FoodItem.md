---
id: "node:FoodItem"
kind: "node"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D12.graphql#L165-L210","release:registers/node-register.yaml#FoodItem","release:workspace-inputs/identity-rules.yaml#FoodItem"]
aliases: ["food item","food","fooditem"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:bb5b8b31968a48dab7770784b33ba5c35dc7497f0bfb585de6b45020a539f0bb"
---
# FoodItem

Purpose: a reference food concept as one composition or food-ontology source defines it, at the preparation it names ("Potatoes, russet, flesh and skin, raw", FDC 170027; "…, baked", FDC 170030; "McDONALD'S, french fries", FDC 170721, a frozen SR Legacy record). It is what composition, preparation and category questions join through, and the subject of food claims and target-effect assertions. Anything an organization sells today (a menu item, a packaged food, a branded longevity oil) is a D6 Product that points here through HAS_REFERENCE_FOOD; the two are never merged. Identity rule: (definingSystem, sourceRecordId) whenever the system issues a record id (FDC_ID, NDB number, FNDDS food code, PHENOL_EXPLORER_FOOD id, FoodOn IRI; the id also attaches as a kernel Identifier); only CURATED / OTHER records without an id use (definingSystem, normalized descriptionVerbatim: NFC, case-folded, whitespace-collapsed), so a re-cased or re-suffixed description in a later release never mints a second node. Two records of one system that differ in preparation, part or processing are two FoodItems related by the predicate-only VARIANT_OF Assertion; records of different systems are merged only by an EQUIVALENCE Assessment, never by name. uid token: `food` (hu:food:<opaque>). Questions: Q-D12-01, Q-D12-02, Q-D12-03, Q-D12-04, Q-D12-05, Q-D12-09, Q-D12-11, Q-D12-16, Q-D12-20, Q-D12-21, Q-D12-24, Q-D12-30, Q-D12-34.

## Identity

| | |
| --- | --- |
| id | `node:FoodItem` · raw SDL [sdl:FoodItem](../sdl/FoodItem.graphql) |
| module / domain | [D12](../modules/D12.md) / [Interventions, protocols, safety, food and nutrition](../domains/exposures-and-interventions.md) |
| uid | `hu:food:<opaque>` |
| stored labels | `FoodItem` `Entity` (primary `FoodItem`) |
| archetype | Entity & Subjectable (reference concept) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `definingSystem` + `sourceRecordId` |
| identity keys | `uid`, `name`, `definingSystem`, `sourceRecordId` |
| identifier schemes | `FDC_ID` (disabled), `NDB_NUMBER` (active), `FNDDS_FOOD_CODE` (disabled), `FOODON` (disabled), `PHENOL_EXPLORER_FOOD` (disabled), `WIKIDATA` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (18)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D12.graphql:L169 |
| `uid` | `String!` | yes | create+update |  | D12.graphql:L170 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D12.graphql:L171 |
| `lastWriterRunId` | `String` |  | create+update |  | D12.graphql:L173 |
| `descriptionVerbatim` | `String!` | yes | create+update | The defining source's description, verbatim (identity key only for CURATED / OTHER records without a record id). | D12.graphql:L177 |
| `definingSystem` | [FoodDataSystem](../vocabularies/FoodDataSystem.md) | yes | create+update | The system that defines the record (identity key; filter: Q-D12-24 data type). | D12.graphql:L179 |
| `sourceRecordId` | `String` |  | create+update | Record id issued by the defining system ('170721' for FDC; FoodOn IRI); identity key with definingSystem; null only for CURATED / OTHER. | D12.graphql:L181 |
| `preparationMethod` | [PreparationMethod](../vocabularies/PreparationMethod.md) |  | create+update | Preparation the record names; NOT_STATED when the description names none (filter: Q-D12-02, Q-D12-03). | D12.graphql:L183 |
| `variantKind` | [FoodVariantKind](../vocabularies/FoodVariantKind.md) |  | create+update | How this record differs from the base its VARIANT_OF Assertion names; BASE when it has none (filter: Q-D12-02). | D12.graphql:L185 |
| `processingVerbatim` | `[String!]` |  | create+update | Verbatim processing/preparation descriptors of the source (FDC 'flesh and skin', 'baked', FoodOn process terms). | D12.graphql:L187 |
| `brandNameVerbatim` | `String` |  | create+update | Brand named inside a reference-database record (FDC 170721 'McDONALD'S'); never makes the record a Product. | D12.graphql:L189 |
| `scientificNameVerbatim` | `String` |  | create+update | Scientific name as the source prints it; the taxon link is the predicate FOOD_FROM_TAXON (predicate-only; renamed from DERIVED_FROM_TAXON, which is a… | D12.graphql:L191 |
| `isHistoricalReference` | `Boolean` |  | create+update | Source flags the record as historical / no longer maintained (FDC isHistoricalReference) (filter: Q-D12-24, Q-D12-30). | D12.graphql:L193 |
| `sourcePublishedAt` | `DateTime` |  | create+update | Publication date of the record in its source release (FDC publicationDate) (sort: Q-D12-24). | D12.graphql:L195 |
| `synonyms` | `[String!]` |  | create+update | Synonyms and common names for entity linking ('EVOO'); feeds fulltext index food_item_search (Q-D12-34). | D12.graphql:L197 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D12.graphql:L174 |
| `updatedAt` | `DateTime` |  | create+update |  | D12.graphql:L175 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D12.graphql:L172 |

## Outgoing relationships (5)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:FoodItem --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [FOOD_CONTAINS](../relationships/FOOD_CONTAINS.md) | [ChemicalSubstance](ChemicalSubstance.md) | asserted | recorded-only | [FoodContentProperties](../edge-properties/FoodContentProperties.md) | FoodItem.components (OUT) | `edge.assert` |
| [FOOD_CONTAINS](../relationships/FOOD_CONTAINS.md) | [Constituent](Constituent.md) | asserted | recorded-only | [FoodContentProperties](../edge-properties/FoodContentProperties.md) | FoodItem.components (OUT) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [IN_FOOD_CATEGORY](../relationships/IN_FOOD_CATEGORY.md) | [FoodCategory](FoodCategory.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | FoodItem.categories (OUT) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (14)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ADMINISTERS](../relationships/ADMINISTERS.md) | [InterventionComponent](InterventionComponent.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | InterventionComponent.administers (OUT) | `edge.assert` |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) | [LabelVersion](LabelVersion.md) | asserted | recorded-only | [ComponentLineProperties](../edge-properties/ComponentLineProperties.md) | LabelVersion.components (OUT) | `edge.assert` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_REFERENCE_FOOD](../relationships/HAS_REFERENCE_FOOD.md) | [Product](Product.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | FoodItem.referencedByProducts (IN) | `edge.assert` |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [PATTERN_COMPONENT](../relationships/PATTERN_COMPONENT.md) | [DietaryPattern](DietaryPattern.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | DietaryPattern.components (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (21)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [ADMINISTERS](../predicates/ADMINISTERS.md) | object | authorizing | typed-edge | D3 |
| [CAUSES_ADVERSE_EFFECT](../predicates/CAUSES_ADVERSE_EFFECT.md) | subject | literal | literal | D5 |
| [DECLARES_COMPONENT](../predicates/DECLARES_COMPONENT.md) | object | authorizing | typed-edge | D6 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FOOD_CONTAINS](../predicates/FOOD_CONTAINS.md) | subject | authorizing | typed-edge | D12 |
| [FOOD_FROM_TAXON](../predicates/FOOD_FROM_TAXON.md) | subject | relationship | assertion-only | D12 |
| [FORMS_DURING_PREPARATION](../predicates/FORMS_DURING_PREPARATION.md) | object | relationship | assertion-only | D1 |
| [HAS_ACTION_LEVEL](../predicates/HAS_ACTION_LEVEL.md) | object | literal | literal | D8 |
| [HAS_DATA_QUALITY_WARNING](../predicates/HAS_DATA_QUALITY_WARNING.md) | subject | literal | literal | D12 |
| [HAS_GLYCEMIC_INDEX](../predicates/HAS_GLYCEMIC_INDEX.md) | subject | literal | literal | D12 |
| [HAS_HAZARD_CLASSIFICATION](../predicates/HAS_HAZARD_CLASSIFICATION.md) | subject | literal | literal | D12 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HAS_PORTION_WEIGHT](../predicates/HAS_PORTION_WEIGHT.md) | subject | literal | literal | D12 |
| [HAS_RECIPE_INGREDIENT](../predicates/HAS_RECIPE_INGREDIENT.md) | subject+object | literal | literal | D12 |
| [HAS_REFERENCE_FOOD](../predicates/HAS_REFERENCE_FOOD.md) | object | authorizing | typed-edge | D12 |
| [INTENDED_FOR_TARGET](../predicates/INTENDED_FOR_TARGET.md) | subject | relationship | assertion-only | D5 |
| [IN_FOOD_CATEGORY](../predicates/IN_FOOD_CATEGORY.md) | subject | authorizing | typed-edge | D12 |
| [PATTERN_COMPONENT](../predicates/PATTERN_COMPONENT.md) | object | authorizing | typed-edge | D12 |
| [PREPARATION_CHANGES_CONTENT](../predicates/PREPARATION_CHANGES_CONTENT.md) | subject | literal | literal | D12 |
| [RECOMMENDS_USE](../predicates/RECOMMENDS_USE.md) | subject | literal | literal | D9 |
| [VARIANT_OF](../predicates/VARIANT_OF.md) | subject+object | relationship | assertion-only | D12 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a FoodItem are Assertions with it as subject: `(:FoodItem)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (4)

- [D12/Q-D12-03#option-a](../patterns/D12/Q-D12-03--option-a.md) (supported; Q-D12-03)
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported; Q-D12-06)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported; Q-D6-11)
- [QP/G-8#1](../patterns/QP/G-8--1.md) (unsupported; Q-D12-20)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update; never delete
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `HOLDS_ROLE` does NOT imply `RECOMMENDS_USE`
- `RECEIVES_VALUE_FROM` does NOT imply `RECOMMENDS_USE`
- `CONTENT_SPONSORED_BY` does NOT imply `RECOMMENDS_USE`
- `MEASURED_CONTENT_IN_PRODUCT` does NOT imply `DECLARES_COMPONENT`

## Tasks

(none)

## v1 navigation aliases

- `node:FoodItem` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D12.graphql#L165-L210`
- `release:registers/node-register.yaml#FoodItem`
- `release:workspace-inputs/identity-rules.yaml#FoodItem`
