---
id: "node:CertificationListing"
kind: "node"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L598-L633","release:registers/node-register.yaml#CertificationListing","release:workspace-inputs/identity-rules.yaml#CertificationListing"]
aliases: ["certification listing","cert-listing","certificationlisting","node:CertificationProgram","node:CertificationScope","CertificationProgram","CertificationScope"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:76fa42727d755de5b61a60c5fe9c3a2b049c676a6da4f1cc6201702ba5060a14"
---
# CertificationListing

Purpose: one listing record of a certifier (NSF Certified for Sport listing 1451522 'Basis'; an NSF/ANSI 173 listing row; an Informed Sport product page with its batch table). The listing states a programme, a standard and a scope; WHAT it covers and WHEN is the bitemporal episode on COVERS (a lot drops off the batch table = its episode closes). Merges pinned CertificationListing, CertificationProgram (programme and standard properties) and CertificationScope (scopeVerbatim + COVERS). Identity rule: (certifier Organization uid, programme, listingId; else canonical listing URL). uid token: `cert-listing`. Questions: CQ-PF-03a, Q-D8-08, Q-D8-19, CQ-MF-06.

## Identity

| | |
| --- | --- |
| id | `node:CertificationListing` · raw SDL [sdl:CertificationListing](../sdl/CertificationListing.graphql) |
| module / domain | [D8](../modules/D8.md) / [Manufacturing, quality, regulation and intellectual property](../domains/manufacturing-quality-regulatory-ip.md) |
| uid | `hu:cert-listing:<opaque>` |
| stored labels | `CertificationListing` `Entity` (primary `CertificationListing`) |
| archetype | Entity & Subjectable (authority record) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `issuedBy.uid` + `programme` + `listingId (else canonical listing URL)` |
| identity keys | `uid`, `name`, `programme` |
| identifier schemes | `CERT_LISTING` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (15)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D8.graphql:L602 |
| `uid` | `String!` | yes | create+update |  | D8.graphql:L603 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D8.graphql:L604 |
| `lastWriterRunId` | `String` |  | create+update |  | D8.graphql:L606 |
| `programme` | `String!` | yes | create+update | Programme name as printed (e.g. NSF Certified for Sport, Informed Sport, USP Verified). | D8.graphql:L610 |
| `standard` | `String` |  | create+update | Standard or guideline (e.g. NSF/ANSI 173, NSF/ANSI 455-2, NSF Certification Guideline 306). | D8.graphql:L612 |
| `listingId` | `String` |  | create+update | Certifier's listing id when printed (e.g. 1451522). | D8.graphql:L614 |
| `coverageKind` | [CertifiedObjectKind](../vocabularies/CertifiedObjectKind.md) | yes | create+update | What the listing says it certifies. | D8.graphql:L616 |
| `scopeVerbatim` | `String` |  | create+update | Scope sentence verbatim (e.g. 'contain the identity and quantity of dietary ingredients declared on the product label'). | D8.graphql:L618 |
| `certifiedAt` | `DateTime` |  | create+update | Date the certifier says the product was certified. | D8.graphql:L620 |
| `status` | [CertificationListingStatus](../vocabularies/CertificationListingStatus.md) | yes | create+update | Latest observed status (history: COVERS episodes and SourceSnapshots). | D8.graphql:L622 |
| `categoryLabelsVerbatim` | `[String!]` |  | create+update | Certifier's own category or goal labels, verbatim (e.g. 'Sleep Aid'); mapped to D5 targets only by Assertion. | D8.graphql:L624 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D8.graphql:L607 |
| `updatedAt` | `DateTime` |  | create+update |  | D8.graphql:L608 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D8.graphql:L605 |

## Outgoing relationships (6)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:CertificationListing --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [COVERS](../relationships/COVERS.md) | [Lot](Lot.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | CertificationListing.covers (OUT) | `edge.assert` |
| [COVERS](../relationships/COVERS.md) | [Product](Product.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | CertificationListing.covers (OUT) | `edge.assert` |
| [COVERS](../relationships/COVERS.md) | [ProductVariant](ProductVariant.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | CertificationListing.covers (OUT) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [ISSUED_BY](../relationships/ISSUED_BY.md) | [Organization](Organization.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | CertificationListing.issuedBy (OUT) | `edge.assert` |
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

## Legal predicates (7)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [BEARS_SEAL](../predicates/BEARS_SEAL.md) | object | relationship | assertion-only | D6 |
| [COVERS](../predicates/COVERS.md) | subject | authorizing | typed-edge | D8 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [ISSUED_BY](../predicates/ISSUED_BY.md) | subject | authorizing | typed-edge | D8 |
| [LISTING_LOT_SCOPE](../predicates/LISTING_LOT_SCOPE.md) | subject | literal | literal | D8 |
| [LISTING_PACKAGE_SIZES](../predicates/LISTING_PACKAGE_SIZES.md) | subject | literal | literal | D8 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a CertificationListing are Assertions with it as subject: `(:CertificationListing)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (1)

- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported; Q-D8-19)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; latest observed status rewritten under FIELD Assertions (R-14, R-45; history = COVERS episodes and snapshots); never delete
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:CertificationListing` is unchanged from v1.
- `node:CertificationProgram` (merged): D8: CertificationListing
- `node:CertificationScope` (merged): D8: CertificationListing

## Source definition

- `release:sdl/modules/D8.graphql#L598-L633`
- `release:registers/node-register.yaml#CertificationListing`
- `release:workspace-inputs/identity-rules.yaml#CertificationListing`
