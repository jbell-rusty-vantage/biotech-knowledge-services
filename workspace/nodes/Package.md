---
id: "node:Package"
kind: "node"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L341-L366","release:registers/node-register.yaml#Package","release:workspace-inputs/identity-rules.yaml#Package"]
aliases: ["package","node:Bundle","node:BundleComponent","node:PackageConfiguration","Bundle","BundleComponent","PackageConfiguration"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:a8a22648ebe322c1ba2ed5b1a39e9d0133b262b11a680d3024f6679b197b6a20"
---
# Package

Purpose: a sellable package configuration of one variant — container of N units or net quantity, multipack, kit, bundle, or one served portion of a prepared food. The unit price-per-dose arithmetic divides by (Q-D6-02), recalls and lots scope to (D8 seam, Q-D6-04/-05), listings resolve to (LISTING_FOR), GTINs identify (kernel HAS_IDENTIFIER with episodes, Q-D6-15) and labels attach to over time (HAS_LABEL_VERSION). Absorbs PackageConfiguration, Bundle, BundleComponent. Identity rule: (variant uid, packageKind, unitCount, netQuantityValue + netQuantityUnit); a GTIN change with the same count and quantity is the same Package with a new identifier episode (FC-2); a net-contents change (AG1 360 g → 350 g) is a new Package. uid token: `package` (hu:package:<opaque>). Questions: Q-D6-01, Q-D6-02, Q-D6-04, Q-D6-05, Q-D6-14, Q-D6-15, CQ-CM-02, CQ-ID-02, CQ-ID-05.

## Identity

| | |
| --- | --- |
| id | `node:Package` · raw SDL [sdl:Package](../sdl/Package.graphql) |
| module / domain | [D6](../modules/D6.md) / [Products, labels and commerce](../domains/products-and-commerce.md) |
| uid | `hu:package:<opaque>` |
| stored labels | `Package` `Entity` (primary `Package`) |
| archetype | enduring identity (sellable configuration) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `variantUid` + `packageKind` + `unitCount` + `netQuantityValue` + `netQuantityUnit` |
| identity keys | `uid`, `name`, `packageKind`, `unitCount`, `netQuantityValue`, `netQuantityUnit` |
| identifier schemes | `GTIN` (active), `SKU` (active), `DSLD` (active), `FDC_ID` (disabled) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (13)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D6.graphql:L345 |
| `uid` | `String!` | yes | create+update |  | D6.graphql:L346 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D6.graphql:L347 |
| `lastWriterRunId` | `String` |  | create+update |  | D6.graphql:L349 |
| `packageKind` | [PackageKind](../vocabularies/PackageKind.md) | yes | create+update |  | D6.graphql:L352 |
| `unitCount` | `Int` |  | create+update | Count of dosage units or served items (30 capsules; 1 sandwich); denominator of price per unit and per dose. | D6.graphql:L354 |
| `unitNoun` | `String` |  | create+update | Unit noun as printed ('Vegetarian Capsules', 'sandwich'). | D6.graphql:L356 |
| `netQuantityValue` | `Float` |  | create+update |  | D6.graphql:L357 |
| `netQuantityUnit` | `String` |  | create+update | UCUM unit of netQuantityValue (g, mL). | D6.graphql:L359 |
| `componentSummary` | `String` |  | create+update | Kits and multipacks: component summary as printed ('2 x 90 capsules'); component edges are predicate-only CONTAINS_PACKAGE. | D6.graphql:L361 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D6.graphql:L350 |
| `updatedAt` | `DateTime` |  | create+update |  | D6.graphql:L351 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D6.graphql:L348 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Package --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [HAS_LABEL_VERSION](../relationships/HAS_LABEL_VERSION.md) | [LabelVersion](LabelVersion.md) | asserted | episode, exclusive | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Package.labelVersions (OUT) | `state.attach` |
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
| [HAS_PACKAGE](../relationships/HAS_PACKAGE.md) | [ProductVariant](ProductVariant.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProductVariant.packages (OUT) | `edge.structural` |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [LISTING_FOR](../relationships/LISTING_FOR.md) | [MerchantListing](MerchantListing.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | MerchantListing.listingFor (OUT) | `edge.assert` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (8)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [CONTAINS_PACKAGE](../predicates/CONTAINS_PACKAGE.md) | subject+object | relationship | assertion-only | D6 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HAS_LABEL_VERSION](../predicates/HAS_LABEL_VERSION.md) | subject | authorizing | typed-edge | D6 |
| [LISTING_FOR](../predicates/LISTING_FOR.md) | object | authorizing | typed-edge | D6 |
| [MARKET_REFERENCE_PRICE](../predicates/MARKET_REFERENCE_PRICE.md) | subject | literal | literal | D6 |
| [PRICE_SERIES_METHOD_CHANGE](../predicates/PRICE_SERIES_METHOD_CHANGE.md) | subject | literal | literal | D6 |
| [SUCCEEDED_BY](../predicates/SUCCEEDED_BY.md) | subject+object | relationship | assertion-only | D6 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Package are Assertions with it as subject: `(:Package)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: [HAS_LABEL_VERSION](../relationships/HAS_LABEL_VERSION.md) — scope: Exclusive (non-overlapping) episodes are scoped to (subject, relationship/predicate slot, asserter): same-asserter overlap is rejected; different asserters coexist and cross-source disagreement is preserved. Separately defined global identity constraints are not weakened. K owns CQ-TM-05 and the exclusivity contract; module register rows supply slot policies (exclusive: true).
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (13)

- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported; Q-D1-16)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported; Q-D12-18)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported; Q-D5-13)
- [D6/CQ-AX-25#1](../patterns/D6/CQ-AX-25--1.md) (supported; CQ-AX-25)
- [D6/Q-D6-01#1](../patterns/D6/Q-D6-01--1.md) (supported; Q-D6-01)
- [D6/Q-D6-08#1](../patterns/D6/Q-D6-08--1.md) (supported; Q-D6-08)
- [D6/Q-D6-10#1](../patterns/D6/Q-D6-10--1.md) (supported; Q-D6-10)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported; Q-D6-11)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported; CQ-MF-01)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported; Q-D8-18)
- [D9/CQ-CM-04](../patterns/D9/CQ-CM-04.md) (supported; CQ-CM-04)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported; Q-D9-02)
- [QP/P-09](../patterns/QP/P-09.md) (supported; CQ-CL-05, CQ-CL-08, Q-D10-21, Q-D9-01, Q-K-15)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update; never delete
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `LISTING_FOR` does NOT imply `SELLER_OF_RECORD`

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)
- [Record an observed price for a listing](../tasks/record-price-observation.md)

## v1 navigation aliases

- `node:Bundle` (merged): D6: Package
- `node:BundleComponent` (merged): D6: Package
- `node:PackageConfiguration` (merged): D6: Package

## Source definition

- `release:sdl/modules/D6.graphql#L341-L366`
- `release:registers/node-register.yaml#Package`
- `release:workspace-inputs/identity-rules.yaml#Package`
