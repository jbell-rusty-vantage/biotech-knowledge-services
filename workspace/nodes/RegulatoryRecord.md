---
id: "node:RegulatoryRecord"
kind: "node"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L372-L439","release:registers/node-register.yaml#RegulatoryRecord","release:workspace-inputs/identity-rules.yaml#RegulatoryRecord"]
aliases: ["regulatory record","reg-record","regulatoryrecord","node:RegulatoryInspection","node:RegulatoryPathwayVersion","node:RegulatoryResponse","node:RegulatorySubmission","RegulatoryInspection","RegulatoryPathwayVersion","RegulatoryResponse","RegulatorySubmission"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:de3d5573cf6df2b9252fa82207cf17a321541310df769c5008a90aa3ae507c30"
---
# RegulatoryRecord

Purpose: one document-backed act of an authority — regulator, court or patent tribunal — with a record number: an NDI or GRAS response, a citizen-petition response, a novel-food authorisation, an EFSA opinion, a Health Canada licence, a Drugs@FDA action, a device 510(k) / De Novo / PMA decision, a warning letter, a recall, a Form 483, a court or PTAB decision. It is the join point for "what did the authority say, to whom, about what, when" and the record a LegalStatus is established by. Enforcement actions are records of family ENFORCEMENT (the research-stage EnforcementAction type is folded in). Identity rule: (issuer Organization uid, recordKind, normalized recordNumber); a revised letter or a new response is a new record, never an edit (Q-D8-22 dedupes on this key). Identifiers (FDA_NDI, FDA_GRN, FDA_WARNING_LETTER, FDA_RECALL, FDA_DOCKET, CELEX, NPN, FDA_APPLICATION, COURT_DOCKET) attach through the kernel. uid token: `reg-record` (hu:reg-record:<issuer>-<kind>-<number>). Questions: CQ-MF-02, Q-D8-01, CQ-AX-23, CQ-MF-03, CQ-PF-04, Q-D8-02, Q-D8-03, Q-D8-04, Q-D8-12, Q-D8-13, Q-D8-15, Q-D8-16, Q-D8-17, Q-D8-18, Q-D8-20, Q-D8-22, Q-D8-23, CQ-EC-01, CQ-MF-06.

## Identity

| | |
| --- | --- |
| id | `node:RegulatoryRecord` · raw SDL [sdl:RegulatoryRecord](../sdl/RegulatoryRecord.graphql) |
| module / domain | [D8](../modules/D8.md) / [Manufacturing, quality, regulation and intellectual property](../domains/manufacturing-quality-regulatory-ip.md) |
| uid | `hu:reg-record:<opaque>` |
| stored labels | `RegulatoryRecord` `Entity` (primary `RegulatoryRecord`) |
| archetype | Entity & Subjectable (authority record) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `issuedBy.uid` + `recordKind` + `recordNumber` |
| identity keys | `uid`, `name`, `recordKind`, `recordNumber` |
| identifier schemes | `FDA_APPLICATION` (active), `NPN` (active), `FDA_NDI` (active), `FDA_GRN` (active), `FDA_WARNING_LETTER` (disabled), `FDA_RECALL` (active), `FDA_RECALL_EVENT` (active), `FDA_DOCKET` (active), `CELEX` (active), `LNHPD_ID` (disabled), `COURT_DOCKET` (active), `PTAB_TRIAL` (disabled) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (32)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D8.graphql:L376 |
| `uid` | `String!` | yes | create+update |  | D8.graphql:L377 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D8.graphql:L378 |
| `lastWriterRunId` | `String` |  | create+update |  | D8.graphql:L380 |
| `recordKind` | [RegulatoryRecordKind](../vocabularies/RegulatoryRecordKind.md) | yes | create+update | What kind of act this is; fixes what it can and cannot establish. | D8.graphql:L384 |
| `recordFamily` | [RegulatoryRecordFamily](../vocabularies/RegulatoryRecordFamily.md) | yes | create+update | Coarse family of recordKind (stored for one-hop filtering). | D8.graphql:L386 |
| `pathway` | [RegulatoryPathway](../vocabularies/RegulatoryPathway.md) |  | create+update | Programme or legal basis the record sits under. | D8.graphql:L388 |
| `jurisdiction` | `String!` | yes | create+update | ISO 3166-1 alpha-2 code, or EU. | D8.graphql:L390 |
| `recordNumber` | `String!` | yes | create+update | The issuer's own number, as normalized for identity (e.g. 1259, GRN 000635, 724610, H-0483-2026, 32020R0016, 80112429, 2022-1116). | D8.graphql:L392 |
| `docketId` | `String` |  | create+update | Docket the record belongs to (e.g. FDA-2023-P-0872, FDA-2022-S-0023). | D8.graphql:L394 |
| `issuedAt` | `DateTime` |  | create+update | Issuer's date of the act. | D8.graphql:L396 |
| `issuingOffice` | `String` |  | create+update | Issuing office within the authority (e.g. HFP Office of Dietary Supplement Programs, CDER, Fed. Cir.). | D8.graphql:L398 |
| `outcome` | [RegulatoryRecordOutcome](../vocabularies/RegulatoryRecordOutcome.md) |  | create+update | What the issuer decided or did, per the record. | D8.graphql:L400 |
| `outcomeVerbatim` | `String` |  | create+update | The record's own decisive sentence, verbatim (also a SourceLocator exact). | D8.graphql:L402 |
| `scopeLimitVerbatim` | `String` |  | create+update | The record's own scope-limiting sentence, verbatim (e.g. 'This letter is not an affirmation that ... is GRAS'). | D8.graphql:L404 |
| `conditionsVerbatim` | `String` |  | create+update | Conditions of use, dose, food categories, population, as written. | D8.graphql:L406 |
| `authorisedClaimsVerbatim` | `[String!]` |  | create+update | Claims the record authorises (licence purposes), verbatim, one per entry. | D8.graphql:L408 |
| `legalBasisCitation` | `String` |  | create+update | Statutory or regulatory citation the act rests on (e.g. 21 U.S.C. 321(ff)(3)(B)(ii)); replaces pinned RegulatoryPathwayVersion. | D8.graphql:L410 |
| `violationCategories` | [ViolationCategory](../vocabularies/ViolationCategory.md)[] |  | create+update | ENFORCEMENT: violation categories cited. | D8.graphql:L412 |
| `inspectionStartedAt` | `DateTime` |  | create+update | ENFORCEMENT: inspection window the record reports (warning letters state it). | D8.graphql:L414 |
| `inspectionEndedAt` | `DateTime` |  | create+update |  | D8.graphql:L415 |
| `facilityAddressVerbatim` | `String` |  | create+update | ENFORCEMENT: inspected or cited facility as printed (address), and its FDA FEI when printed; stands in for the deferred Facility type. | D8.graphql:L417 |
| `facilityFei` | `String` |  | create+update |  | D8.graphql:L418 |
| `recallClass` | [RecallClass](../vocabularies/RecallClass.md) |  | create+update | RECALL: classification and status as last stated; terminatedAt when stated. | D8.graphql:L420 |
| `recallStatus` | [RecallStatus](../vocabularies/RecallStatus.md) |  | create+update |  | D8.graphql:L421 |
| `terminatedAt` | `DateTime` |  | create+update |  | D8.graphql:L422 |
| `reasonVerbatim` | `String` |  | create+update | RECALL / ENFORCEMENT: reason, product description and lot codes verbatim (openFDA reason_for_recall, product_description, code_info). | D8.graphql:L424 |
| `productDescriptionVerbatim` | `String` |  | create+update |  | D8.graphql:L425 |
| `lotCodesVerbatim` | `String` |  | create+update |  | D8.graphql:L426 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D8.graphql:L381 |
| `updatedAt` | `DateTime` |  | create+update |  | D8.graphql:L382 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D8.graphql:L379 |

## Outgoing relationships (8)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:RegulatoryRecord --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ADDRESSED_TO](../relationships/ADDRESSED_TO.md) | [Organization](Organization.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | RegulatoryRecord.addressedTo (OUT) | `edge.assert` |
| [CONCERNS](../relationships/CONCERNS.md) | [ChemicalSubstance](ChemicalSubstance.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | RegulatoryRecord.concerns (OUT) | `edge.assert` |
| [CONCERNS](../relationships/CONCERNS.md) | [IngredientMaterial](IngredientMaterial.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | RegulatoryRecord.concerns (OUT) | `edge.assert` |
| [CONCERNS](../relationships/CONCERNS.md) | [Lot](Lot.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | RegulatoryRecord.concerns (OUT) | `edge.assert` |
| [CONCERNS](../relationships/CONCERNS.md) | [Product](Product.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | RegulatoryRecord.concerns (OUT) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [ISSUED_BY](../relationships/ISSUED_BY.md) | [Organization](Organization.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | RegulatoryRecord.issuedBy (OUT) | `edge.assert` |
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
| [DOCUMENTED_BY_RECORD](../relationships/DOCUMENTED_BY_RECORD.md) | [Event](Event.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Event.regulatoryRecords (OUT) | `edge.assert` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STATUS_FROM](../relationships/STATUS_FROM.md) | [LegalStatus](LegalStatus.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | LegalStatus.establishedBy (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (21)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [ADDRESSED_TO](../predicates/ADDRESSED_TO.md) | subject | authorizing | typed-edge | D8 |
| [ADJUDICATES_PATENT](../predicates/ADJUDICATES_PATENT.md) | subject | relationship | assertion-only | D8 |
| [CGMP_FINDING](../predicates/CGMP_FINDING.md) | subject | literal | literal | D8 |
| [CHARACTERIZES_REGULATORY_RECORD](../predicates/CHARACTERIZES_REGULATORY_RECORD.md) | object | relationship | assertion-only | D8 |
| [CITED_TRIAL_ID_AS_PARSED](../predicates/CITED_TRIAL_ID_AS_PARSED.md) | subject | literal | literal | D8 |
| [CITES_AS_EVIDENCE](../predicates/CITES_AS_EVIDENCE.md) | subject+object | relationship | assertion-only | D8 |
| [CONCERNS](../predicates/CONCERNS.md) | subject | authorizing | typed-edge | D8 |
| [DOCUMENTED_BY_RECORD](../predicates/DOCUMENTED_BY_RECORD.md) | object | authorizing | typed-edge | D13 |
| [ENTRY_INTO_FORCE_COMPUTED](../predicates/ENTRY_INTO_FORCE_COMPUTED.md) | subject | literal | literal | D8 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FORM_483_ISSUED_AND_RESPONSE](../predicates/FORM_483_ISSUED_AND_RESPONSE.md) | subject | literal | literal | D8 |
| [HAS_CLAIM_CONDITION](../predicates/HAS_CLAIM_CONDITION.md) | subject | literal | literal | D8 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INSPECTION_WINDOW](../predicates/INSPECTION_WINDOW.md) | subject | literal | literal | D8 |
| [ISSUED_AT](../predicates/ISSUED_AT.md) | subject | literal | literal | D8 |
| [ISSUED_AT_AS_PRINTED](../predicates/ISSUED_AT_AS_PRINTED.md) | subject | literal | literal | D8 |
| [ISSUED_BY](../predicates/ISSUED_BY.md) | subject | authorizing | typed-edge | D8 |
| [RECALL_INITIATED_BY_FIRM](../predicates/RECALL_INITIATED_BY_FIRM.md) | subject | literal | literal | D8 |
| [RECALL_STATUS](../predicates/RECALL_STATUS.md) | subject | literal | literal | D8 |
| [REVISES_DETERMINATION_OF](../predicates/REVISES_DETERMINATION_OF.md) | subject+object | relationship | assertion-only | D8 |
| [STATUS_FROM](../predicates/STATUS_FROM.md) | object | authorizing | typed-edge | D8 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a RegulatoryRecord are Assertions with it as subject: `(:RegulatoryRecord)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (7)

- [D13/Q-D13-04#1](../patterns/D13/Q-D13-04--1.md) (supported; Q-D13-04)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported; Q-D13-12)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported; Q-D13-14)
- [D13/Q-D13-22#1](../patterns/D13/Q-D13-22--1.md) (supported; Q-D13-22)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported; Q-D8-18)
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported; Q-D8-19)
- [D8/Q-D8-23](../patterns/D8/Q-D8-23.md) (supported; Q-D8-23)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; property caches rewritten under FIELD Assertions (R-14, R-45); a revised letter or a new response is a new record, never an edit; never delete
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Ingest a regulatory record (filing, letter, recall, inspection) and the status it establishes](../tasks/ingest-regulatory-filing.md)

## v1 navigation aliases

- `node:RegulatoryInspection` (merged): D8: RegulatoryRecord
- `node:RegulatoryPathwayVersion` (merged): D8: RegulatoryRecord.legalBasisCitation
- `node:RegulatoryResponse` (merged): D8: RegulatoryRecord
- `node:RegulatorySubmission` (merged): D8: RegulatoryRecord

## Source definition

- `release:sdl/modules/D8.graphql#L372-L439`
- `release:registers/node-register.yaml#RegulatoryRecord`
- `release:workspace-inputs/identity-rules.yaml#RegulatoryRecord`
