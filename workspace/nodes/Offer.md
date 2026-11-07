---
id: "node:Offer"
kind: "node"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L487-L517","release:registers/node-register.yaml#Offer","release:workspace-inputs/identity-rules.yaml#Offer"]
aliases: ["offer","node:PriceObservation","node:SubscriptionPlan","PriceObservation","SubscriptionPlan"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:d84cee6e0cbe04fb7f44880961b3a8000664179f0f6adcab30622bf48b4aa5e5"
---
# Offer

Purpose: one party's commercial proposition for one listing's item in one market and purchase mode — the subject of every price and availability Assertion (OFFER_PRICE_<KIND>, OFFER_AVAILABILITY), the holder of the seller-of-record role, and the thing a tracked affiliate link (D9) points at. A reference price with no seller behind it (an index, a tracker's aggregate over third-party sellers) is not an Offer: it is an Assertion on the Package/Variant/Product (MARKET_REFERENCE_PRICE) or on the MerchantListing (tracker aggregate, qualifier sellerClass=THIRD_PARTY_NEW). Identity rule: (listing uid, seller account id as displayed or 'host', purchaseMode, jurisdiction, condition). uid token: `offer` (hu:offer:<opaque>). Questions: CQ-CM-01, CQ-CM-02, CQ-CM-03, CQ-CM-05, CQ-AX-06, Q-D6-02, Q-D6-06, Q-D6-13, Q-D6-17, CQ-CM-04.

## Identity

| | |
| --- | --- |
| id | `node:Offer` · raw SDL [sdl:Offer](../sdl/Offer.graphql) |
| module / domain | [D6](../modules/D6.md) / [Products, labels and commerce](../domains/products-and-commerce.md) |
| uid | `hu:offer:<opaque>` |
| stored labels | `Offer` `Entity` (primary `Offer`) |
| archetype | enduring identity (commercial proposition; prices are Assertions about it) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `listingUid` + `sellerAccountIdVerbatim or 'host'` + `purchaseMode` + `jurisdiction` + `condition` |
| identity keys | `uid`, `name`, `purchaseMode`, `jurisdiction` |
| identifier schemes | `MARKETPLACE_SELLER_ID` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (17)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D6.graphql:L491 |
| `uid` | `String!` | yes | create+update |  | D6.graphql:L492 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D6.graphql:L493 |
| `lastWriterRunId` | `String` |  | create+update |  | D6.graphql:L495 |
| `purchaseMode` | [PurchaseMode](../vocabularies/PurchaseMode.md) | yes | create+update |  | D6.graphql:L498 |
| `jurisdiction` | `String` |  | create+update | ISO 3166 market. | D6.graphql:L500 |
| `sellerAccountIdVerbatim` | `String` |  | create+update | Seller account id as displayed (Amazon 'A1W0QC6JE0QLDF'); also attached as a kernel Identifier. | D6.graphql:L502 |
| `sellerNameAsDisplayed` | `String` |  | create+update |  | D6.graphql:L503 |
| `fulfillmentKind` | [FulfillmentKind](../vocabularies/FulfillmentKind.md) |  | create+update |  | D6.graphql:L504 |
| `fulfillerNameAsDisplayed` | `String` |  | create+update |  | D6.graphql:L505 |
| `subscriptionTermsVerbatim` | `String` |  | create+update | Subscription terms as displayed (absorbs SubscriptionPlan); term changes over time are Assertions (OFFER_SUBSCRIPTION_TERMS). | D6.graphql:L507 |
| `subscriptionApp` | `String` |  | create+update | Platform app administering the plan ('ordergroove-subscribe-and-save'). | D6.graphql:L509 |
| `firstObservedAt` | `DateTime` |  | create+update | Observation cache (executor-maintained, read-only semantics) from the price/availability Assertions: CQ-AX-06, CQ-CM-05. | D6.graphql:L511 |
| `lastObservedAt` | `DateTime` |  | create+update |  | D6.graphql:L512 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D6.graphql:L496 |
| `updatedAt` | `DateTime` |  | create+update |  | D6.graphql:L497 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D6.graphql:L494 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Offer --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md) | [Organization](Organization.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Offer.sellerOfRecord (OUT) | `edge.assert` |
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
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_OFFER](../relationships/HAS_OFFER.md) | [MerchantListing](MerchantListing.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | MerchantListing.offers (OUT) | `edge.structural` |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (15)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FULFILLED_BY](../predicates/FULFILLED_BY.md) | subject+object | relationship | assertion-only | D6 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [LINKS_TO_OFFER](../predicates/LINKS_TO_OFFER.md) | object | relationship | assertion-only | D9 |
| [OFFERS_INTERVENTION](../predicates/OFFERS_INTERVENTION.md) | subject | relationship | assertion-only | D6 |
| [OFFER_AVAILABILITY](../predicates/OFFER_AVAILABILITY.md) | subject | literal | literal | D6 |
| [OFFER_PRICE_LIST](../predicates/OFFER_PRICE_LIST.md) | subject | literal | literal | D6 |
| [OFFER_PRICE_ONE_TIME](../predicates/OFFER_PRICE_ONE_TIME.md) | subject | literal | literal | D6 |
| [OFFER_PRICE_PER_UNIT](../predicates/OFFER_PRICE_PER_UNIT.md) | subject | literal | literal | D6 |
| [OFFER_PRICE_SUBSCRIPTION](../predicates/OFFER_PRICE_SUBSCRIPTION.md) | subject | literal | literal | D6 |
| [OFFER_PRICE_TRACKER_HIGH](../predicates/OFFER_PRICE_TRACKER_HIGH.md) | subject | literal | literal | D6 |
| [OFFER_PRICE_TRACKER_LOW](../predicates/OFFER_PRICE_TRACKER_LOW.md) | subject | literal | literal | D6 |
| [OFFER_SUBSCRIPTION_TERMS](../predicates/OFFER_SUBSCRIPTION_TERMS.md) | subject | literal | literal | D6 |
| [PRICE_SERIES_METHOD_CHANGE](../predicates/PRICE_SERIES_METHOD_CHANGE.md) | subject | literal | literal | D6 |
| [SELLER_OF_RECORD](../predicates/SELLER_OF_RECORD.md) | subject | authorizing | typed-edge | D6 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Offer are Assertions with it as subject: `(:Offer)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (6)

- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported; Q-D5-13)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported; Q-D5-17)
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

- `node:Offer` is unchanged from v1.
- `node:PriceObservation` (merged): D6: Offer
- `node:SubscriptionPlan` (merged): D6: Offer

## Source definition

- `release:sdl/modules/D6.graphql#L487-L517`
- `release:registers/node-register.yaml#Offer`
- `release:workspace-inputs/identity-rules.yaml#Offer`
