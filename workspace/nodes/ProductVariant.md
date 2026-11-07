---
id: "node:ProductVariant"
kind: "node"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L307-L328","release:registers/node-register.yaml#ProductVariant","release:workspace-inputs/identity-rules.yaml#ProductVariant"]
aliases: ["product variant","product-variant","productvariant"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:f61a7b39a97c3e02284bb42763d2b31af6bdfb5b7b804dbefb317555192ea857"
---
# ProductVariant

Purpose: a consumer-distinguishable realization of a Product — strength per unit, dosage form, flavor or jurisdiction (round-0001 Candidate B) — the level a study administers (D3 seam), a lot belongs to (D8 seam) and a reformulation is compared within. A label-only change (FC-1: directions, seals) or a GTIN/package change (FC-2) never mints a variant. Identity rule: (product uid, strengthVerbatim, dosageForm, flavor, jurisdiction) with nulls as explicit 'unspecified'. uid token: `product-variant` (hu:product-variant:<opaque>). Questions: CQ-ID-01, CQ-ID-02, CQ-ID-05, CQ-AX-17, CQ-AX-25, Q-D6-02.

## Identity

| | |
| --- | --- |
| id | `node:ProductVariant` · raw SDL [sdl:ProductVariant](../sdl/ProductVariant.graphql) |
| module / domain | [D6](../modules/D6.md) / [Products, labels and commerce](../domains/products-and-commerce.md) |
| uid | `hu:product-variant:<opaque>` |
| stored labels | `ProductVariant` `Entity` (primary `ProductVariant`) |
| archetype | enduring identity (realization) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `productUid` + `strengthVerbatim` + `dosageForm` + `flavor` + `jurisdiction` |
| identity keys | `uid`, `name`, `strengthVerbatim`, `dosageForm`, `flavor`, `jurisdiction` |
| identifier schemes | `SKU` (active), `STOREFRONT_VARIANT_ID` (disabled), `NPN` (active), `NDC` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (11)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D6.graphql:L311 |
| `uid` | `String!` | yes | create+update |  | D6.graphql:L312 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D6.graphql:L313 |
| `lastWriterRunId` | `String` |  | create+update |  | D6.graphql:L315 |
| `dosageForm` | [DosageForm](../vocabularies/DosageForm.md) |  | create+update |  | D6.graphql:L318 |
| `strengthVerbatim` | `String` |  | create+update | Strength as printed ('300 mg', '12 g scoop'); the typed amount lives on label component lines. | D6.graphql:L320 |
| `flavor` | `String` |  | create+update |  | D6.graphql:L321 |
| `jurisdiction` | `String` |  | create+update | ISO 3166 market of this variant (US vs UK fries; '500mg (Canada)'). | D6.graphql:L323 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D6.graphql:L316 |
| `updatedAt` | `DateTime` |  | create+update |  | D6.graphql:L317 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D6.graphql:L314 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:ProductVariant --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [HAS_PACKAGE](../relationships/HAS_PACKAGE.md) | [Package](Package.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProductVariant.packages (OUT) | `edge.structural` |
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
| [COVERS](../relationships/COVERS.md) | [CertificationListing](CertificationListing.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | CertificationListing.covers (OUT) | `edge.assert` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [HAS_VARIANT](../relationships/HAS_VARIANT.md) | [Product](Product.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Product.variants (OUT) | `edge.structural` |
| [LOT_OF](../relationships/LOT_OF.md) | [Lot](Lot.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Lot.lotOf (OUT) | `edge.assert` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (10)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [ADMINISTERS](../predicates/ADMINISTERS.md) | object | authorizing | typed-edge | D3 |
| [CONTAINS_UNDECLARED_SUBSTANCE](../predicates/CONTAINS_UNDECLARED_SUBSTANCE.md) | subject | relationship | assertion-only | D6 |
| [COVERS](../predicates/COVERS.md) | object | authorizing | typed-edge | D8 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HAS_VARIANT](../predicates/HAS_VARIANT.md) | object | authorizing | typed-edge | D6 |
| [LOT_OF](../predicates/LOT_OF.md) | object | authorizing | typed-edge | D8 |
| [MARKET_REFERENCE_PRICE](../predicates/MARKET_REFERENCE_PRICE.md) | subject | literal | literal | D6 |
| [MEASURED_CONTENT_IN_PRODUCT](../predicates/MEASURED_CONTENT_IN_PRODUCT.md) | subject | relationship | assertion-only | D6 |
| [PRICE_SERIES_METHOD_CHANGE](../predicates/PRICE_SERIES_METHOD_CHANGE.md) | subject | literal | literal | D6 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a ProductVariant are Assertions with it as subject: `(:ProductVariant)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (15)

- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported; Q-D1-16)
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
- [D9/CQ-CM-04](../patterns/D9/CQ-CM-04.md) (supported; CQ-CM-04)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported; Q-D9-02)
- [QP/P-09](../patterns/QP/P-09.md) (supported; CQ-CL-05, CQ-CL-08, Q-D10-21, Q-D9-01, Q-K-15)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update; never delete
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `MEASURED_CONTENT_IN_PRODUCT` does NOT imply `DECLARES_COMPONENT`

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)
- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md)

## v1 navigation aliases

- `node:ProductVariant` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D6.graphql#L307-L328`
- `release:registers/node-register.yaml#ProductVariant`
- `release:workspace-inputs/identity-rules.yaml#ProductVariant`
