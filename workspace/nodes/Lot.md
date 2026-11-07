---
id: "node:Lot"
kind: "node"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L495-L516","release:registers/node-register.yaml#Lot","release:workspace-inputs/identity-rules.yaml#Lot"]
aliases: ["lot","node:ProductLot","ProductLot"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:267f002a07fffec0bbd16183a4db0e3b46f0c3212c0d2b685ef5eba0d9569e02"
---
# Lot

Purpose: one production lot (batch) of one product or variant — the join key for "is the thing I hold real and lawful": recall lot lists, COA lot numbers, certifier lot and batch tables, counterfeit reports ('outdated and out-of-market lot numbers'), the consumer's bottle. Renames pinned ProductLot. Identity rule: (product or variant uid, normalized lotCode); the printed form stays in lotCode and the scheme LOT_CODE identifier (issuer = brand or manufacturer). uid token: `lot`. Questions: Q-D8-04, CQ-AX-19, Q-D8-05, Q-D8-07, Q-D8-08, CQ-PF-03a, Q-D8-18.

## Identity

| | |
| --- | --- |
| id | `node:Lot` · raw SDL [sdl:Lot](../sdl/Lot.graphql) |
| module / domain | [D8](../modules/D8.md) / [Manufacturing, quality, regulation and intellectual property](../domains/manufacturing-quality-regulatory-ip.md) |
| uid | `hu:lot:<opaque>` |
| stored labels | `Lot` `Entity` (primary `Lot`) |
| archetype | Entity & Subjectable |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `lotOf.uid` + `lotCode (normalized)` |
| identity keys | `uid`, `name` |
| identifier schemes | `LOT_CODE` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (10)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D8.graphql:L499 |
| `uid` | `String!` | yes | create+update |  | D8.graphql:L500 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D8.graphql:L501 |
| `lastWriterRunId` | `String` |  | create+update |  | D8.graphql:L503 |
| `lotCode` | `String!` | yes | create+update | Lot or batch code as printed (e.g. 216, LNA-199-0715, H26246, P043-01). | D8.graphql:L507 |
| `expiresAt` | `DateTime` |  | create+update | Expiry or best-before date as printed. | D8.graphql:L509 |
| `manufacturedAt` | `DateTime` |  | create+update | Manufacture date when printed. | D8.graphql:L511 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D8.graphql:L504 |
| `updatedAt` | `DateTime` |  | create+update |  | D8.graphql:L505 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D8.graphql:L502 |

## Outgoing relationships (4)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Lot --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [LOT_OF](../relationships/LOT_OF.md) | [Product](Product.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Lot.lotOf (OUT) | `edge.assert` |
| [LOT_OF](../relationships/LOT_OF.md) | [ProductVariant](ProductVariant.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Lot.lotOf (OUT) | `edge.assert` |
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
| [CONCERNS](../relationships/CONCERNS.md) | [RegulatoryRecord](RegulatoryRecord.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | RegulatoryRecord.concerns (OUT) | `edge.assert` |
| [COVERS](../relationships/COVERS.md) | [CertificationListing](CertificationListing.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | CertificationListing.covers (OUT) | `edge.assert` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md) | [QualityResult](QualityResult.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | QualityResult.resultFor (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (8)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [CONCERNS](../predicates/CONCERNS.md) | object | authorizing | typed-edge | D8 |
| [COVERS](../predicates/COVERS.md) | object | authorizing | typed-edge | D8 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [LOT_EXPIRY_AS_PRINTED](../predicates/LOT_EXPIRY_AS_PRINTED.md) | subject | literal | literal | D8 |
| [LOT_OF](../predicates/LOT_OF.md) | subject | authorizing | typed-edge | D8 |
| [QUALITY_RESULT_FOR](../predicates/QUALITY_RESULT_FOR.md) | object | authorizing | typed-edge | D8 |
| [SAMPLE_TESTED_POSITIVE_FOR](../predicates/SAMPLE_TESTED_POSITIVE_FOR.md) | subject | relationship | assertion-only | D8 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Lot are Assertions with it as subject: `(:Lot)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (5)

- [D12/Q-D12-03#option-a](../patterns/D12/Q-D12-03--option-a.md) (supported; Q-D12-03)
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported; Q-D12-06)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported; Q-D8-18)
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported; Q-D8-19)
- [D8/Q-D8-23](../patterns/D8/Q-D8-23.md) (supported; Q-D8-23)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; property caches rewritten under FIELD Assertions (R-14, R-45); never delete
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md)

## v1 navigation aliases

- `node:ProductLot` (renamed): D8: Lot

## Source definition

- `release:sdl/modules/D8.graphql#L495-L516`
- `release:registers/node-register.yaml#Lot`
- `release:workspace-inputs/identity-rules.yaml#Lot`
