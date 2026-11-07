---
id: "node:Organization"
kind: "node"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L308-L340","release:registers/node-register.yaml#Organization","release:workspace-inputs/identity-rules.yaml#Organization"]
aliases: ["organization","org","node:LegalEntity","node:OrganizationSnapshot","node:RegulatoryAgency","node:TestingLaboratory","LegalEntity","OrganizationSnapshot","RegulatoryAgency","TestingLaboratory"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:de39dd7e3c04e9ab0cbe1fced5ce2490821c67cbe7697e6bffa25e6072c89fd9"
---
# Organization

Purpose: an organized body as an enduring identity — company, legal entity, corporate group, fund vehicle, university, lab, agency, clinic operator — that holds stakes, controls other organizations, holds brands, funds awards, and is the counterparty of a person's role, stake or payment. Absorbs the pinned LegalEntity (entityKind LEGAL_ENTITY) and the display fields of OrganizationSnapshot; name history is Assertions (predicate LEGAL_NAME / FORMER_NAME with valid time). It declares only its two outgoing ownership/control fields: every other role (sponsor, seller, manufacturer, issuer, event participant, content sponsor) is declared by the domain that asks, on its own type, pointing here. Identity rule: registry identifier first (LEI, SEC_CIK, national company number, NPI-2, ROR), then (normalized legal name, jurisdiction); a brand name never establishes an Organization (that is a Brand); a group named collectively is its own record (entityKind CORPORATE_GROUP), never merged with a member. Identifiers attach through the kernel. uid token: `org` (hu:org:<opaque>). Questions: CQ-CL-05, CQ-EC-01, CQ-EC-02, CQ-EC-03, CQ-EC-04, CQ-MF-01, Q-D7-01, Q-D7-03, Q-D7-04, Q-D7-05, Q-D7-07, Q-D7-09, Q-D7-10, Q-D7-13, Q-D7-14, Q-D7-15, Q-D7-19, Q-D7-21, Q-D7-22.

## Identity

| | |
| --- | --- |
| id | `node:Organization` · raw SDL [sdl:Organization](../sdl/Organization.graphql) |
| module / domain | [D7](../modules/D7.md) / [Organizations, people and money](../domains/actors-and-institutions.md) |
| uid | `hu:org:<opaque>` |
| stored labels | `Organization` `Entity` (primary `Organization`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `registry identifier (LEI | SEC_CIK | COMPANY_NUMBER (requested) | NPI for NPI-2 | ROR)` + `(normalized legal name, jurisdiction)` + `(group name as printed, entityKind CORPORATE_GROUP)` |
| identity keys | `uid`, `legalName`, `name` |
| identifier schemes | `LEI` (active), `SEC_CIK` (active), `ROR` (active), `NPI` (disabled), `WIKIDATA` (active), `OPENALEX` (active), `COMPANY_NUMBER` (disabled), `UEI` (active), `CROSSREF_FUNDER` (disabled), `WEB_DOMAIN` (disabled) |
| name match (workspace rule) | `name`, `legalName` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (14)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D7.graphql:L312 |
| `uid` | `String!` | yes | create+update |  | D7.graphql:L313 |
| `legalName` | `String` |  | create+update | Current registered legal name (display projection of the latest LEGAL_NAME Assertion); null when not a LEGAL_ENTITY. | D7.graphql:L324 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D7.graphql:L314 |
| `lastWriterRunId` | `String` |  | create+update |  | D7.graphql:L316 |
| `entityKind` | [OrganizationEntityKind](../vocabularies/OrganizationEntityKind.md) | yes | create+update | LEGAL_ENTITY, CORPORATE_GROUP, DIVISION_OR_UNIT, PUBLIC_BODY (Q-D7-01, Q-D7-14, Q-D7-19 filter on it). | D7.graphql:L320 |
| `organizationKind` | [OrganizationKind](../vocabularies/OrganizationKind.md) |  | create+update | Coarse kind for filtering (Q-D7-11, Q-D7-13, Q-D7-22); never a role. | D7.graphql:L322 |
| `legalFormVerbatim` | `String` |  | create+update | Legal form as printed (Delaware corporation, LLC, Limited, S.A., P.A.). | D7.graphql:L326 |
| `jurisdiction` | `String` |  | create+update | ISO 3166-1/-2 code of formation (LEGAL_ENTITY) or of authority (PUBLIC_BODY). | D7.graphql:L328 |
| `status` | [OrganizationStatus](../vocabularies/OrganizationStatus.md) |  | create+update | Registry or self-declared status (projection of the latest ORGANIZATION_STATUS Assertion). | D7.graphql:L330 |
| `description` | `String` |  | create+update |  | D7.graphql:L331 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D7.graphql:L317 |
| `updatedAt` | `DateTime` |  | create+update |  | D7.graphql:L318 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D7.graphql:L315 |

## Outgoing relationships (5)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Organization --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [HOLDS_STAKE](../relationships/HOLDS_STAKE.md) | [Organization](Organization.md) | asserted | episode | [StakeEdgeProperties](../edge-properties/StakeEdgeProperties.md) | Organization.holdsStakes (OUT) | `edge.assert` |
| [OWNS_BRAND](../relationships/OWNS_BRAND.md) | [Brand](Brand.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Brand.owners (IN) | `edge.assert` |
| [PARENT_OF](../relationships/PARENT_OF.md) | [Organization](Organization.md) | asserted | episode | [ControlEdgeProperties](../edge-properties/ControlEdgeProperties.md) | Organization.subsidiaries (OUT) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (27)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ADDRESSED_TO](../relationships/ADDRESSED_TO.md) | [RegulatoryRecord](RegulatoryRecord.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | RegulatoryRecord.addressedTo (OUT) | `edge.assert` |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSIGNED_TO](../relationships/ASSIGNED_TO.md) | [Patent](Patent.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Patent.assignees (OUT) | `edge.assert` |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [AWARDED_BY](../relationships/AWARDED_BY.md) | [Award](Award.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Award.funders (OUT) | `edge.assert` |
| [AWARDED_TO](../relationships/AWARDED_TO.md) | [Award](Award.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Award.recipientOrganizations (OUT) | `edge.assert` |
| [CONTENT_SPONSORED_BY](../relationships/CONTENT_SPONSORED_BY.md) (via [ContentSponsor](../unions/ContentSponsor.md)) | [MediaWork](MediaWork.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | MediaWork.sponsors (OUT) | `edge.assert` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) | [Study](Study.md) | asserted | episode | [StudyRoleEdgeProperties](../edge-properties/StudyRoleEdgeProperties.md) | Study.roles (OUT) | `edge.assert` |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) | [Person](Person.md) | asserted | episode | [RoleEdgeProperties](../edge-properties/RoleEdgeProperties.md) | Person.holdsRoles (OUT) | `edge.assert` |
| [HOLDS_STAKE](../relationships/HOLDS_STAKE.md) | [Person](Person.md) | asserted | episode | [StakeEdgeProperties](../edge-properties/StakeEdgeProperties.md) | Person.holdsStakes (OUT) | `edge.assert` |
| [INVOLVES](../relationships/INVOLVES.md) | [Event](Event.md) | asserted | recorded-only | [EventRoleEdgeProperties](../edge-properties/EventRoleEdgeProperties.md) | Event.involvedOrganizations (OUT) | `edge.assert` |
| [ISSUED_BY](../relationships/ISSUED_BY.md) | [CertificationListing](CertificationListing.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | CertificationListing.issuedBy (OUT) | `edge.assert` |
| [ISSUED_BY](../relationships/ISSUED_BY.md) | [QualityResult](QualityResult.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | QualityResult.issuedBy (OUT) | `edge.assert` |
| [ISSUED_BY](../relationships/ISSUED_BY.md) | [RegulatoryRecord](RegulatoryRecord.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | RegulatoryRecord.issuedBy (OUT) | `edge.assert` |
| [LICENSED_TO](../relationships/LICENSED_TO.md) | [Patent](Patent.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Patent.licensees (OUT) | `edge.assert` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md) | [LabelVersion](LabelVersion.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | LabelVersion.responsibleParty (OUT) | `edge.assert` |
| [PERFORMED_BY_LAB](../relationships/PERFORMED_BY_LAB.md) | [AssayVersion](AssayVersion.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | AssayVersion.performingLab (OUT) | `edge.assert` |
| [RECEIVES_VALUE_FROM](../relationships/RECEIVES_VALUE_FROM.md) | [Person](Person.md) | asserted | episode | [ValueEdgeProperties](../edge-properties/ValueEdgeProperties.md) | Person.receivesValueFrom (OUT) | `edge.assert` |
| [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md) | [Offer](Offer.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Offer.sellerOfRecord (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (53)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [ADDRESSED_TO](../predicates/ADDRESSED_TO.md) | object | authorizing | typed-edge | D8 |
| [ASSIGNED_TO](../predicates/ASSIGNED_TO.md) | object | authorizing | typed-edge | D8 |
| [AUTHORED_BY](../predicates/AUTHORED_BY.md) | object | relationship | assertion-only | D3 |
| [AWARDED_BY](../predicates/AWARDED_BY.md) | object | authorizing | typed-edge | D7 |
| [AWARDED_TO](../predicates/AWARDED_TO.md) | object | authorizing | typed-edge | D7 |
| [BEARS_SEAL](../predicates/BEARS_SEAL.md) | object | relationship | assertion-only | D6 |
| [COMMISSIONED_TEST](../predicates/COMMISSIONED_TEST.md) | subject | relationship | assertion-only | D7 |
| [CONTENT_SPONSORED_BY](../predicates/CONTENT_SPONSORED_BY.md) | object | authorizing | typed-edge | D9 |
| [CONTRACT_MANUFACTURES_FOR](../predicates/CONTRACT_MANUFACTURES_FOR.md) | subject+object | relationship | assertion-only | D7 |
| [DEVELOPED_WITH](../predicates/DEVELOPED_WITH.md) | object | relationship | assertion-only | D4 |
| [DEVELOPS_THERAPY_TARGETING](../predicates/DEVELOPS_THERAPY_TARGETING.md) | subject | relationship | assertion-only | D7 |
| [DISCLOSES_INTEREST](../predicates/DISCLOSES_INTEREST.md) | subject+object | relationship | assertion-only | D9 |
| [DISTRIBUTES](../predicates/DISTRIBUTES.md) | subject | relationship | assertion-only | D7 |
| [DOING_BUSINESS_AS](../predicates/DOING_BUSINESS_AS.md) | subject | literal | literal | D7 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FORMER_NAME](../predicates/FORMER_NAME.md) | subject | literal | literal | D7 |
| [FULFILLED_BY](../predicates/FULFILLED_BY.md) | object | relationship | assertion-only | D6 |
| [FUNDED_BY](../predicates/FUNDED_BY.md) | object | relationship | assertion-only | D3 |
| [HAS_CAPABILITY_STAGE](../predicates/HAS_CAPABILITY_STAGE.md) | subject | literal | literal | D7 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HAS_STUDY_ROLE](../predicates/HAS_STUDY_ROLE.md) | object | authorizing | typed-edge | D3 |
| [HOLDS_ROLE](../predicates/HOLDS_ROLE.md) | object | authorizing | typed-edge | D7 |
| [HOLDS_STAKE](../predicates/HOLDS_STAKE.md) | subject+object | authorizing | typed-edge | D7 |
| [HOSTED_BY](../predicates/HOSTED_BY.md) | object | relationship | assertion-only | D6 |
| [INVENTOR_ON_PATENT_ASSIGNED_TO](../predicates/INVENTOR_ON_PATENT_ASSIGNED_TO.md) | object | relationship | assertion-only | D7 |
| [INVOLVES](../predicates/INVOLVES.md) | object | authorizing | typed-edge | D13 |
| [ISSUED_BY](../predicates/ISSUED_BY.md) | object | authorizing | typed-edge | D8 |
| [LEGAL_NAME](../predicates/LEGAL_NAME.md) | subject | literal | literal | D7 |
| [LICENSED_TO](../predicates/LICENSED_TO.md) | object | authorizing | typed-edge | D8 |
| [MANUFACTURER_UNNAMED](../predicates/MANUFACTURER_UNNAMED.md) | subject | literal | literal | D7 |
| [MANUFACTURES](../predicates/MANUFACTURES.md) | subject | relationship | assertion-only | D7 |
| [MATERIAL_CONNECTION_NOT_ADEQUATELY_DISCLOSED](../predicates/MATERIAL_CONNECTION_NOT_ADEQUATELY_DISCLOSED.md) | subject | literal | literal | D7 |
| [MATERIAL_PROVIDED_BY](../predicates/MATERIAL_PROVIDED_BY.md) | object | relationship | assertion-only | D3 |
| [NAMES_RESPONSIBLE_PARTY](../predicates/NAMES_RESPONSIBLE_PARTY.md) | object | authorizing | typed-edge | D6 |
| [NOMINATES_DIRECTOR](../predicates/NOMINATES_DIRECTOR.md) | subject | relationship | assertion-only | D7 |
| [OFFERS_INTERVENTION](../predicates/OFFERS_INTERVENTION.md) | subject | relationship | assertion-only | D6 |
| [OPERATED_BY](../predicates/OPERATED_BY.md) | object | relationship | assertion-only | D9 |
| [ORGANIZATION_STATUS](../predicates/ORGANIZATION_STATUS.md) | subject | literal | literal | D7 |
| [OWNS_BRAND](../predicates/OWNS_BRAND.md) | subject | authorizing | typed-edge | D7 |
| [PARENT_OF](../predicates/PARENT_OF.md) | subject+object | authorizing | typed-edge | D7 |
| [PERFORMED_BY_LAB](../predicates/PERFORMED_BY_LAB.md) | object | authorizing | typed-edge | D4 |
| [RECEIVES_VALUE_FROM](../predicates/RECEIVES_VALUE_FROM.md) | object | authorizing | typed-edge | D7 |
| [RECOMMENDS_RETEST_INTERVAL](../predicates/RECOMMENDS_RETEST_INTERVAL.md) | subject | literal | literal | D4 |
| [REPORTED_MARKET_MOVE](../predicates/REPORTED_MARKET_MOVE.md) | object | relationship | assertion-only | D13 |
| [REPORTS_REPORT_COUNT](../predicates/REPORTS_REPORT_COUNT.md) | subject | relationship | assertion-only | D10 |
| [SELLER_OF_RECORD](../predicates/SELLER_OF_RECORD.md) | object | authorizing | typed-edge | D6 |
| [SETS_REFERENCE_RANGE](../predicates/SETS_REFERENCE_RANGE.md) | subject | literal | literal | D4 |
| [SOLD_THROUGH_CHANNEL](../predicates/SOLD_THROUGH_CHANNEL.md) | subject+object | relationship | assertion-only | D6 |
| [STATES_METHOD_CAVEAT](../predicates/STATES_METHOD_CAVEAT.md) | subject | literal | literal | D7 |
| [STOREFRONT_CATALOG_ITEM_COUNT](../predicates/STOREFRONT_CATALOG_ITEM_COUNT.md) | subject | literal | literal | D7 |
| [SUCCEEDED_BY](../predicates/SUCCEEDED_BY.md) | subject+object | relationship | assertion-only | D6 |
| [SUPPLIES_MATERIAL](../predicates/SUPPLIES_MATERIAL.md) | subject | relationship | assertion-only | D7 |
| [WARNING_LETTERS_SENT](../predicates/WARNING_LETTERS_SENT.md) | subject | literal | literal | D7 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Organization are Assertions with it as subject: `(:Organization)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (27)

- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported; Q-D1-16)
- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported; Q-D10-21)
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported; Q-D12-06)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported; Q-D13-12)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported; Q-D13-14)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported; Q-D5-13)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported; Q-D5-17)
- [D6/Q-D6-11#1](../patterns/D6/Q-D6-11--1.md) (supported; Q-D6-11)
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported; CQ-CL-05)
- [D7/CQ-EC-04#1](../patterns/D7/CQ-EC-04--1.md) (supported; CQ-EC-04)
- [D7/Q-D7-02#1](../patterns/D7/Q-D7-02--1.md) (supported; Q-D7-02)
- [D7/Q-D7-06#1](../patterns/D7/Q-D7-06--1.md) (supported; Q-D7-06)
- [D7/Q-D7-08#1](../patterns/D7/Q-D7-08--1.md) (supported; Q-D7-08)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported; Q-D7-22)
- [D7/Q-D7-25#1](../patterns/D7/Q-D7-25--1.md) (supported; Q-D7-25)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported; CQ-MF-01)
- [D8/Q-D8-10](../patterns/D8/Q-D8-10.md) (supported; Q-D8-10)
- [D8/Q-D8-13](../patterns/D8/Q-D8-13.md) (supported; Q-D8-13)
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported; Q-D8-19)
- [D9/CQ-CL-04](../patterns/D9/CQ-CL-04.md) (supported; CQ-CL-04)
- … 7 more: `bks-schema find --kind pattern --label Organization`

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `HOLDS_ROLE` does NOT imply `RECOMMENDS_USE`
- `RECEIVES_VALUE_FROM` does NOT imply `RECOMMENDS_USE`
- `CONTENT_SPONSORED_BY` does NOT imply `RECOMMENDS_USE`
- `HOLDS_STAKE` does NOT imply `OWNS_BRAND`
- `OPERATED_BY` does NOT imply `OWNS_BRAND`
- `LISTING_FOR` does NOT imply `SELLER_OF_RECORD`
- `LICENSED_TO` does NOT imply `STATUS_OF`

## Tasks

- [Ingest an organization profile (roles, stakes, brands, control)](../tasks/ingest-organization-profile.md)
- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)
- [Ingest a regulatory record (filing, letter, recall, inspection) and the status it establishes](../tasks/ingest-regulatory-filing.md)
- [Record an observed price for a listing](../tasks/record-price-observation.md)
- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md)
- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md)

## v1 navigation aliases

- `node:Organization` is unchanged from v1.
- `node:LegalEntity` (merged): D7: Organization
- `node:OrganizationSnapshot` (merged): D7: Organization
- `node:RegulatoryAgency` (merged): D8: D7.Organization
- `node:TestingLaboratory` (merged): D8: D7.Organization

## Source definition

- `release:sdl/modules/D7.graphql#L308-L340`
- `release:registers/node-register.yaml#Organization`
- `release:workspace-inputs/identity-rules.yaml#Organization`
