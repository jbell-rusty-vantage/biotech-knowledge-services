---
id: "node:MerchantListing"
kind: "node"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L444-L475","release:registers/node-register.yaml#MerchantListing","release:workspace-inputs/identity-rules.yaml#MerchantListing"]
aliases: ["merchant listing","listing","merchantlisting"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:59f6ffc03deed88648f41c34dda94de8ff9d318d6e85469ee1c9d8b872b8df68"
---
# MerchantListing

Purpose: one host's catalog entry for a sellable item (Amazon ASIN detail page, iHerb product id, Shopify product page, restaurant menu-item page): the place offers live, recall-exposure and authorized-channel questions scan, and a retailer's own statements ('New formulation', 'Discontinued Item') are made on. Its resolution to a Package is an asserted episode; an unresolved or disputed match is a kernel Assessment (EQUIVALENCE, subkind D6.listing-to-package). Identity rule: (hostDomain, hostItemId) — e.g. (amazon.com, B07TK5K5TQ), (iherb.com, 162274). uid token: `listing` (hu:listing:<opaque>). Questions: CQ-CM-01, CQ-CM-02, CQ-CM-05, Q-D6-05, Q-D6-06, Q-D6-15, Q-D6-19, Q-D6-20, CQ-PF-02.

## Identity

| | |
| --- | --- |
| id | `node:MerchantListing` · raw SDL [sdl:MerchantListing](../sdl/MerchantListing.graphql) |
| module / domain | [D6](../modules/D6.md) / [Products, labels and commerce](../domains/products-and-commerce.md) |
| uid | `hu:listing:<opaque>` |
| stored labels | `MerchantListing` `Entity` (primary `MerchantListing`) |
| archetype | enduring identity (host catalog entry) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `hostDomain` + `hostItemId` |
| identity keys | `uid`, `canonicalUrl`, `name`, `titleAsDisplayed`, `hostDomain`, `hostItemId` |
| identifier schemes | `ASIN` (active), `RETAILER_ITEM_ID` (disabled), `STOREFRONT_PRODUCT_ID` (disabled) |
| name match (workspace rule) | `name`, `titleAsDisplayed` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (15)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D6.graphql:L448 |
| `uid` | `String!` | yes | create+update |  | D6.graphql:L449 |
| `canonicalUrl` | `String` |  | create+update |  | D6.graphql:L464 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D6.graphql:L450 |
| `lastWriterRunId` | `String` |  | create+update |  | D6.graphql:L452 |
| `listingKind` | [ListingKind](../vocabularies/ListingKind.md) | yes | create+update |  | D6.graphql:L455 |
| `hostDomain` | `String!` | yes | create+update | Registrable domain of the host ('amazon.com', 'iherb.com', 'truniagen.com', 'mcdonalds.com'); the host Organization is reached by D7 domain identifie… | D6.graphql:L457 |
| `hostItemId` | `String!` | yes | create+update | Host's item id (ASIN, iHerb product id, Shopify handle or product id, menu slug). | D6.graphql:L459 |
| `parentHostItemId` | `String` |  | create+update | Host's parent/family id when the host groups items (Amazon parent ASIN, '30-300MG-PARENT'). | D6.graphql:L461 |
| `titleAsDisplayed` | `String` |  | create+update | Title as displayed; a listing statement, never label truth (CQ-PF-02). | D6.graphql:L463 |
| `firstObservedAt` | `DateTime` |  | create+update |  | D6.graphql:L465 |
| `lastObservedAt` | `DateTime` |  | create+update |  | D6.graphql:L466 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D6.graphql:L453 |
| `updatedAt` | `DateTime` |  | create+update |  | D6.graphql:L454 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D6.graphql:L451 |

## Outgoing relationships (4)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:MerchantListing --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [HAS_OFFER](../relationships/HAS_OFFER.md) | [Offer](Offer.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | MerchantListing.offers (OUT) | `edge.structural` |
| [LISTING_FOR](../relationships/LISTING_FOR.md) | [Package](Package.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | MerchantListing.listingFor (OUT) | `edge.assert` |
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

## Legal predicates (13)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HOSTED_BY](../predicates/HOSTED_BY.md) | subject | relationship | assertion-only | D6 |
| [LINKS_TO_OFFER](../predicates/LINKS_TO_OFFER.md) | object | relationship | assertion-only | D9 |
| [LISTING_FOR](../predicates/LISTING_FOR.md) | subject | authorizing | typed-edge | D6 |
| [OFFER_PRICE_ONE_TIME](../predicates/OFFER_PRICE_ONE_TIME.md) | subject | literal | literal | D6 |
| [OFFER_PRICE_TRACKER_HIGH](../predicates/OFFER_PRICE_TRACKER_HIGH.md) | subject | literal | literal | D6 |
| [OFFER_PRICE_TRACKER_LOW](../predicates/OFFER_PRICE_TRACKER_LOW.md) | subject | literal | literal | D6 |
| [PRICE_SCOPE_STATEMENT](../predicates/PRICE_SCOPE_STATEMENT.md) | subject | literal | literal | D6 |
| [PRICE_SERIES_METHOD_CHANGE](../predicates/PRICE_SERIES_METHOD_CHANGE.md) | subject | literal | literal | D6 |
| [RETAILER_DISCONTINUED](../predicates/RETAILER_DISCONTINUED.md) | subject | literal | literal | D6 |
| [RETAILER_REFORMULATION_STATEMENT](../predicates/RETAILER_REFORMULATION_STATEMENT.md) | subject | literal | literal | D6 |
| [SUCCEEDED_BY](../predicates/SUCCEEDED_BY.md) | subject+object | relationship | assertion-only | D6 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a MerchantListing are Assertions with it as subject: `(:MerchantListing)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (5)

- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported; Q-D5-13)
- [D9/CQ-CM-04](../patterns/D9/CQ-CM-04.md) (supported; CQ-CM-04)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported; Q-D9-02)
- [D9/Q-D9-21](../patterns/D9/Q-D9-21.md) (supported; Q-D9-21)
- [QP/P-09](../patterns/QP/P-09.md) (supported; CQ-CL-05, CQ-CL-08, Q-D10-21, Q-D9-01, Q-K-15)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update; never delete
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `LISTING_FOR` does NOT imply `SELLER_OF_RECORD`

## Tasks

- [Record an observed price for a listing](../tasks/record-price-observation.md)

## v1 navigation aliases

- `node:MerchantListing` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D6.graphql#L444-L475`
- `release:registers/node-register.yaml#MerchantListing`
- `release:workspace-inputs/identity-rules.yaml#MerchantListing`
