---
id: "node:Product"
kind: "node"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L272-L297","release:registers/node-register.yaml#Product","release:workspace-inputs/identity-rules.yaml#Product"]
aliases: ["product"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:e2c1fbcad105b7d932f70bf44207195202f132803d88bdd169a6128882c83720"
---
# Product

Purpose: the enduring marketed concept behind every variant, package and listing ("Tru Niagen", "AG1", "Big Mac"): what a brand presents, what marketing and target claims are made about (kernel Assertions with this as subject), what D8 recalls/certifications, D12 reference foods and D5 protocol steps point at. Prepared foods from a named organization are Products (productKind PREPARED_FOOD) whose brand is that organization's brand (00-DIRECTIVE 3.2, 3.3). Identity rule: (uid of the brand the product was first captured under, normalized marketed name) — jurisdiction joins the key only when the marketed name differs by market; never GTIN (GTINs identify Packages through the kernel). The key is fixed at minting: a later BRANDED_AS episode (acquisition, relaunch under another brand) never re-keys or re-mints the Product. uid token: `product` (hu:product:<opaque>). Questions: Q-D6-16, CQ-AX-25, Q-D6-03, Q-D6-18, Q-D6-19, Q-D6-20, Q-D6-22, Q-D6-11, Q-D6-12, CQ-AX-17.

## Identity

| | |
| --- | --- |
| id | `node:Product` · raw SDL [sdl:Product](../sdl/Product.graphql) |
| module / domain | [D6](../modules/D6.md) / [Products, labels and commerce](../domains/products-and-commerce.md) |
| uid | `hu:product:<opaque>` |
| stored labels | `Product` `Entity` (primary `Product`) |
| archetype | enduring identity (catalog entity) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `firstCapturedBrandUid (the brand the product was first captured under; fixed at minting)` + `marketedName (normalized)` + `jurisdiction (only when the marketed name differs by market)` |
| identity keys | `uid`, `name`, `marketedName` |
| identifier schemes | `STOREFRONT_PRODUCT_ID` (disabled), `WIKIDATA` (active) |
| name match (workspace rule) | `name`, `marketedName` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (10)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D6.graphql:L276 |
| `uid` | `String!` | yes | create+update |  | D6.graphql:L277 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D6.graphql:L278 |
| `lastWriterRunId` | `String` |  | create+update |  | D6.graphql:L280 |
| `productKind` | [ProductKind](../vocabularies/ProductKind.md) | yes | create+update | Filter for every ranking and avoidance question (Q-D6-03, Q-D6-12, Q-D6-22). | D6.graphql:L284 |
| `marketedName` | `String!` | yes | create+update | Marketed name as the brand prints it (identity key with the brand). | D6.graphql:L286 |
| `jurisdiction` | `String` |  | create+update | ISO 3166 code when the product is market-specific; null for multi-market products. | D6.graphql:L288 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D6.graphql:L281 |
| `updatedAt` | `DateTime` |  | create+update |  | D6.graphql:L282 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D6.graphql:L279 |

## Outgoing relationships (8)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Product --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [BRANDED_AS](../relationships/BRANDED_AS.md) | [Brand](Brand.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Product.brand (OUT) | `edge.assert` |
| [DELIVERS](../relationships/DELIVERS.md) | [Device](Device.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Device.products (IN) | `edge.assert` |
| [DELIVERS](../relationships/DELIVERS.md) | [LabTest](LabTest.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | LabTest.products (IN) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [HAS_REFERENCE_FOOD](../relationships/HAS_REFERENCE_FOOD.md) | [FoodItem](FoodItem.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | FoodItem.referencedByProducts (IN) | `edge.assert` |
| [HAS_VARIANT](../relationships/HAS_VARIANT.md) | [ProductVariant](ProductVariant.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Product.variants (OUT) | `edge.structural` |
| [IN_FOOD_CATEGORY](../relationships/IN_FOOD_CATEGORY.md) | [FoodCategory](FoodCategory.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | FoodCategory.memberProducts (IN) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (14)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [CONCERNS](../relationships/CONCERNS.md) | [RegulatoryRecord](RegulatoryRecord.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | RegulatoryRecord.concerns (OUT) | `edge.assert` |
| [COVERS](../relationships/COVERS.md) | [CertificationListing](CertificationListing.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | CertificationListing.covers (OUT) | `edge.assert` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [LOT_OF](../relationships/LOT_OF.md) | [Lot](Lot.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Lot.lotOf (OUT) | `edge.assert` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STATUS_OF](../relationships/STATUS_OF.md) | [LegalStatus](LegalStatus.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LegalStatus.statusOf (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (33)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [BRANDED_AS](../predicates/BRANDED_AS.md) | subject | authorizing | typed-edge | D6 |
| [CAUSES_ADVERSE_EFFECT](../predicates/CAUSES_ADVERSE_EFFECT.md) | subject | literal | literal | D5 |
| [CLAIMS_TO_MEASURE](../predicates/CLAIMS_TO_MEASURE.md) | subject | relationship | assertion-only | D4 |
| [CONCERNS](../predicates/CONCERNS.md) | object | authorizing | typed-edge | D8 |
| [CONTAINS_UNDECLARED_SUBSTANCE](../predicates/CONTAINS_UNDECLARED_SUBSTANCE.md) | subject | relationship | assertion-only | D6 |
| [COVERS](../predicates/COVERS.md) | object | authorizing | typed-edge | D8 |
| [DELIVERS](../predicates/DELIVERS.md) | subject | authorizing | typed-edge | D4 |
| [DISTRIBUTES](../predicates/DISTRIBUTES.md) | object | relationship | assertion-only | D7 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_APPROVED_INDICATION](../predicates/HAS_APPROVED_INDICATION.md) | subject | relationship | assertion-only | D8 |
| [HAS_DATA_QUALITY_WARNING](../predicates/HAS_DATA_QUALITY_WARNING.md) | subject | literal | literal | D12 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HAS_RECIPE_INGREDIENT](../predicates/HAS_RECIPE_INGREDIENT.md) | subject | literal | literal | D12 |
| [HAS_REFERENCE_FOOD](../predicates/HAS_REFERENCE_FOOD.md) | subject | authorizing | typed-edge | D12 |
| [HAS_VARIANT](../predicates/HAS_VARIANT.md) | subject | authorizing | typed-edge | D6 |
| [IN_FOOD_CATEGORY](../predicates/IN_FOOD_CATEGORY.md) | subject | authorizing | typed-edge | D12 |
| [IS_MOST_ADVANCED_AGING_TEST](../predicates/IS_MOST_ADVANCED_AGING_TEST.md) | subject | literal | literal | D6 |
| [LOT_OF](../predicates/LOT_OF.md) | object | authorizing | typed-edge | D8 |
| [MANUFACTURES](../predicates/MANUFACTURES.md) | object | relationship | assertion-only | D7 |
| [MARKED_WITH_PATENT](../predicates/MARKED_WITH_PATENT.md) | subject | relationship | assertion-only | D6 |
| [MARKET_REFERENCE_PRICE](../predicates/MARKET_REFERENCE_PRICE.md) | subject | literal | literal | D6 |
| [MEASURED_CONTENT_IN_PRODUCT](../predicates/MEASURED_CONTENT_IN_PRODUCT.md) | subject | relationship | assertion-only | D6 |
| [OFFERS_INTERVENTION](../predicates/OFFERS_INTERVENTION.md) | subject | relationship | assertion-only | D6 |
| [OFF_MARKET](../predicates/OFF_MARKET.md) | subject | relationship | assertion-only | D6 |
| [PRICE_SERIES_METHOD_CHANGE](../predicates/PRICE_SERIES_METHOD_CHANGE.md) | subject | literal | literal | D6 |
| [PRODUCT_SAFETY_STATEMENT](../predicates/PRODUCT_SAFETY_STATEMENT.md) | subject | literal | literal | D6 |
| [RANKS_OPTION](../predicates/RANKS_OPTION.md) | subject | literal | literal | D10 |
| [RECOMMENDS_USE](../predicates/RECOMMENDS_USE.md) | subject | literal | literal | D9 |
| [RETAINED_SAMPLE_TEST_RESULT](../predicates/RETAINED_SAMPLE_TEST_RESULT.md) | subject | literal | literal | D6 |
| [SAMPLE_TESTED_POSITIVE_FOR](../predicates/SAMPLE_TESTED_POSITIVE_FOR.md) | subject | relationship | assertion-only | D8 |
| [SOLD_THROUGH_CHANNEL](../predicates/SOLD_THROUGH_CHANNEL.md) | subject | relationship | assertion-only | D6 |
| [STATUS_OF](../predicates/STATUS_OF.md) | object | authorizing | typed-edge | D8 |
| [SUCCEEDED_BY](../predicates/SUCCEEDED_BY.md) | subject+object | relationship | assertion-only | D6 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Product are Assertions with it as subject: `(:Product)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (15)

- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported; Q-D12-06)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported; Q-D12-18)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported; Q-D5-13)
- [D6/CQ-AX-25#1](../patterns/D6/CQ-AX-25--1.md) (supported; CQ-AX-25)
- [D6/Q-D6-08#1](../patterns/D6/Q-D6-08--1.md) (supported; Q-D6-08)
- [D6/Q-D6-10#1](../patterns/D6/Q-D6-10--1.md) (supported; Q-D6-10)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported; Q-D6-11)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported; CQ-MF-01)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported; Q-D8-18)
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported; Q-D8-19)
- [D8/Q-D8-23](../patterns/D8/Q-D8-23.md) (supported; Q-D8-23)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported; Q-D9-02)
- [D9/Q-D9-21](../patterns/D9/Q-D9-21.md) (supported; Q-D9-21)
- [QP/P-09](../patterns/QP/P-09.md) (supported; CQ-CL-05, CQ-CL-08, Q-D10-21, Q-D9-01, Q-K-15)
- [QP/P-12](../patterns/QP/P-12.md) (supported; Q-D1-08, Q-D2-02, Q-D2-03, Q-D4-01, Q-D4-17)

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
- `LICENSED_TO` does NOT imply `STATUS_OF`

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)
- [Ingest a regulatory record (filing, letter, recall, inspection) and the status it establishes](../tasks/ingest-regulatory-filing.md)
- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md)

## v1 navigation aliases

- `node:Product` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D6.graphql#L272-L297`
- `release:registers/node-register.yaml#Product`
- `release:workspace-inputs/identity-rules.yaml#Product`
