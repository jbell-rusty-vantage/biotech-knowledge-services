---
id: "node:Brand"
kind: "node"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L402-L419","release:registers/node-register.yaml#Brand","release:workspace-inputs/identity-rules.yaml#Brand"]
aliases: ["brand","node:ConsumerBrand","ConsumerBrand"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:9492dd18fa73ede1b5cf4f54e3122f7e500507c069ad04507927ad20272ac880"
---
# Brand

Purpose: a name under which products, services, clinics or media are presented ('Tru Niagen', 'InsideTracker', a clinic chain name) — kept apart from the legal entity that is accountable for it, because brand ≠ legal entity is the central identity confusion of this domain (CQ-EC-02, Q-D7-19). D6 points Product → Brand; D12 and D9 may point at it for food and media brands. Absorbs the pinned ConsumerBrand. Identity rule: (normalized brand name, brandKind, holder organization at first capture); a renamed brand is the same Brand with a NAME Assertion episode; a brand registered as a trademark keeps the trademark in D8. uid token: `brand` (hu:brand:<opaque>). Questions: CQ-EC-02, Q-D7-06, Q-D7-10, Q-D7-11, Q-D7-19, CQ-CL-05.

## Identity

| | |
| --- | --- |
| id | `node:Brand` · raw SDL [sdl:Brand](../sdl/Brand.graphql) |
| module / domain | [D7](../modules/D7.md) / [Organizations, people and money](../domains/actors-and-institutions.md) |
| uid | `hu:brand:<opaque>` |
| stored labels | `Brand` `Entity` (primary `Brand`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `(normalized brand name, brandKind, holder organization at first capture)` |
| identity keys | `uid`, `name` |
| identifier schemes | `WIKIDATA` (active), `WEB_DOMAIN` (disabled) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (9)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D7.graphql:L406 |
| `uid` | `String!` | yes | create+update |  | D7.graphql:L407 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D7.graphql:L408 |
| `lastWriterRunId` | `String` |  | create+update |  | D7.graphql:L410 |
| `brandKind` | [BrandKind](../vocabularies/BrandKind.md) | yes | create+update |  | D7.graphql:L413 |
| `description` | `String` |  | create+update |  | D7.graphql:L414 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D7.graphql:L411 |
| `updatedAt` | `DateTime` |  | create+update |  | D7.graphql:L412 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D7.graphql:L409 |

## Outgoing relationships (2)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Brand --direction out --expand`.

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
| [BRANDED_AS](../relationships/BRANDED_AS.md) | [Product](Product.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Product.brand (OUT) | `edge.assert` |
| [CONTENT_SPONSORED_BY](../relationships/CONTENT_SPONSORED_BY.md) (via [ContentSponsor](../unions/ContentSponsor.md)) | [MediaWork](MediaWork.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | MediaWork.sponsors (OUT) | `edge.assert` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [OWNS_BRAND](../relationships/OWNS_BRAND.md) | [Organization](Organization.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Brand.owners (IN) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (6)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [AUTHORIZES_CHANNEL](../predicates/AUTHORIZES_CHANNEL.md) | subject | literal | literal | D7 |
| [BRANDED_AS](../predicates/BRANDED_AS.md) | object | authorizing | typed-edge | D6 |
| [CONTENT_SPONSORED_BY](../predicates/CONTENT_SPONSORED_BY.md) | object | authorizing | typed-edge | D9 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [OWNS_BRAND](../predicates/OWNS_BRAND.md) | object | authorizing | typed-edge | D7 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Brand are Assertions with it as subject: `(:Brand)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (9)

- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported; Q-D12-06)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported; Q-D5-13)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported; Q-D6-11)
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported; CQ-CL-05)
- [D7/Q-D7-06#1](../patterns/D7/Q-D7-06--1.md) (supported; Q-D7-06)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported; CQ-MF-01)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported; Q-D9-02)
- [K/Q-K-15](../patterns/K/Q-K-15.md) (supported; Q-K-15)
- [QP/P-09](../patterns/QP/P-09.md) (supported; CQ-CL-05, CQ-CL-08, Q-D10-21, Q-D9-01, Q-K-15)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `CONTENT_SPONSORED_BY` does NOT imply `RECOMMENDS_USE`
- `HOLDS_STAKE` does NOT imply `OWNS_BRAND`
- `OPERATED_BY` does NOT imply `OWNS_BRAND`

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)
- [Ingest an organization profile (roles, stakes, brands, control)](../tasks/ingest-organization-profile.md)
- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md)

## v1 navigation aliases

- `node:ConsumerBrand` (renamed): D7: Brand

## Source definition

- `release:sdl/modules/D7.graphql#L402-L419`
- `release:registers/node-register.yaml#Brand`
- `release:workspace-inputs/identity-rules.yaml#Brand`
