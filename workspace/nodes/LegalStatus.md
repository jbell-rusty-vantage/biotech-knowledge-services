---
id: "node:LegalStatus"
kind: "node"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L456-L486","release:registers/node-register.yaml#LegalStatus","release:workspace-inputs/identity-rules.yaml#LegalStatus"]
aliases: ["legal status","legal-status","legalstatus","node:DrugApproval","node:IpRightStatus","node:OrphanDesignation","node:PatentClaim","node:RegulatoryStatus","DrugApproval","IpRightStatus","OrphanDesignation","PatentClaim","RegulatoryStatus"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:f97fa2693b83e1bf99d86f99484fa5153eadfec744b9ac879da925ef951ea6ba"
---
# LegalStatus

Purpose: one legal standing of one subject — an ingredient's or product's market-access standing in one jurisdiction under one pathway (excluded / not excluded from the supplement definition, no-questions, authorised, licensed, approved), an exclusivity (EU data protection until 2025-02-20), or a patent's standing at claim level (claims 1–3 held invalid while the aggregator says "Active"). The node is immutable; WHEN it holds is the bitemporal episode on STATUS_OF, and WHICH record established it is STATUS_FROM. NMN in the US is two statuses: EXCLUDED_FROM_DEFINITION (valid 2022-10-11 → 2025-09-29, from NDI 1259 response) and NOT_EXCLUDED_FROM_DEFINITION (valid from 2025-09-29, from the FDA-2023-P-0872 response). A device clearance is CLEARED with pathway US_DEVICE_510K, STATUS_OF the D6 Product that DELIVERS the D4 Device (R-72); a prescription-only standing is PRESCRIPTION_ONLY in its jurisdiction (R-88); a designation is DESIGNATED with its programme as pathway (US_BREAKTHROUGH_THERAPY, US_ORPHAN_DESIGNATION, EU_PRIME ...). Merges pinned RegulatoryStatus, DrugApproval, OrphanDesignation, IpRightStatus. Identity rule: (subject uid, jurisdiction, pathway, statusKind, marketStatus, sorted claimNumbers); a change of any of these is a new LegalStatus whose STATUS_OF episode opens as the old one closes. uid token: `legal-status`. Questions: CQ-MF-02, Q-D8-01, CQ-AX-23, Q-D8-12, Q-D8-13, Q-D8-18, Q-D8-20, Q-D8-14, Q-D8-23, CQ-EC-01.

## Identity

| | |
| --- | --- |
| id | `node:LegalStatus` · raw SDL [sdl:LegalStatus](../sdl/LegalStatus.graphql) |
| module / domain | [D8](../modules/D8.md) / [Manufacturing, quality, regulation and intellectual property](../domains/manufacturing-quality-regulatory-ip.md) |
| uid | `hu:legal-status:<opaque>` |
| stored labels | `LegalStatus` `Entity` (primary `LegalStatus`) |
| archetype | Entity & Subjectable (immutable state; time on the STATUS_OF episode) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `statusOf.uid` + `jurisdiction` + `pathway` + `statusKind` + `marketStatus` + `claimNumbers` |
| identity keys | `uid`, `name`, `jurisdiction`, `pathway`, `statusKind`, `marketStatus`, `claimNumbers` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (14)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D8.graphql:L460 |
| `uid` | `String!` | yes | create+update |  | D8.graphql:L461 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D8.graphql:L462 |
| `lastWriterRunId` | `String` |  | create+update |  | D8.graphql:L464 |
| `statusKind` | [LegalStatusKind](../vocabularies/LegalStatusKind.md) | yes | create+update |  | D8.graphql:L467 |
| `statusFamily` | [LegalStatusFamily](../vocabularies/LegalStatusFamily.md) | yes | create+update |  | D8.graphql:L468 |
| `jurisdiction` | `String!` | yes | create+update | ISO 3166-1 alpha-2 code, or EU; for patents the office's country code. | D8.graphql:L470 |
| `pathway` | [RegulatoryPathway](../vocabularies/RegulatoryPathway.md) |  | create+update |  | D8.graphql:L471 |
| `statusVerbatim` | `String` |  | create+update | The status words as the issuer or registry printed them (e.g. 'Licence Status: Active'). | D8.graphql:L473 |
| `marketStatus` | [MarketStatus](../vocabularies/MarketStatus.md) |  | create+update | Licences only: marketed or not, as the registry states. | D8.graphql:L475 |
| `claimNumbers` | `[Int!]` |  | create+update | IP_RIGHT only: the claim numbers the status applies to; empty means the whole patent. | D8.graphql:L477 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D8.graphql:L465 |
| `updatedAt` | `DateTime` |  | create+update |  | D8.graphql:L466 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D8.graphql:L463 |

## Outgoing relationships (7)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:LegalStatus --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [STATUS_FROM](../relationships/STATUS_FROM.md) | [RegulatoryRecord](RegulatoryRecord.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | LegalStatus.establishedBy (OUT) | `edge.assert` |
| [STATUS_OF](../relationships/STATUS_OF.md) | [ChemicalSubstance](ChemicalSubstance.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LegalStatus.statusOf (OUT) | `edge.assert` |
| [STATUS_OF](../relationships/STATUS_OF.md) | [IngredientMaterial](IngredientMaterial.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LegalStatus.statusOf (OUT) | `edge.assert` |
| [STATUS_OF](../relationships/STATUS_OF.md) | [Patent](Patent.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LegalStatus.statusOf (OUT) | `edge.assert` |
| [STATUS_OF](../relationships/STATUS_OF.md) | [Product](Product.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LegalStatus.statusOf (OUT) | `edge.assert` |
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

## Legal predicates (4)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [STATUS_FROM](../predicates/STATUS_FROM.md) | subject | authorizing | typed-edge | D8 |
| [STATUS_OF](../predicates/STATUS_OF.md) | subject | authorizing | typed-edge | D8 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a LegalStatus are Assertions with it as subject: `(:LegalStatus)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (4)

- [D8/Q-D8-13](../patterns/D8/Q-D8-13.md) (supported; Q-D8-13)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported; Q-D8-18)
- [D8/Q-D8-23](../patterns/D8/Q-D8-23.md) (supported; Q-D8-23)
- [D9/Q-D9-21](../patterns/D9/Q-D9-21.md) (supported; Q-D9-21)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`
- Policy: create only (immutable; when it holds is the STATUS_OF episode, a change of any identity key is a new LegalStatus)
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `LICENSED_TO` does NOT imply `STATUS_OF`

## Tasks

- [Ingest a regulatory record (filing, letter, recall, inspection) and the status it establishes](../tasks/ingest-regulatory-filing.md)

## v1 navigation aliases

- `node:DrugApproval` (merged): D8: LegalStatus
- `node:IpRightStatus` (merged): D8: LegalStatus
- `node:OrphanDesignation` (merged): D8: LegalStatus
- `node:PatentClaim` (merged): D8: LegalStatus
- `node:RegulatoryStatus` (merged): D8: LegalStatus

## Source definition

- `release:sdl/modules/D8.graphql#L456-L486`
- `release:registers/node-register.yaml#LegalStatus`
- `release:workspace-inputs/identity-rules.yaml#LegalStatus`
