---
id: "node:Person"
kind: "node"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L355-L390","release:registers/node-register.yaml#Person","release:workspace-inputs/identity-rules.yaml#Person"]
aliases: ["person"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:4de17bd51b7e5e41b56280e2727e242f4b2e4582d5d389c011e0c8e7dd26061a"
---
# Person

Purpose: a natural person who is a public actor in sourced material — officer, director, founder, investor, author, investigator, speaker, host, clinician who comments publicly, endorser named by a regulator — and only in that role. The holder of roles, stakes and payments; a possible asserter (ASSERTED_BY) and the speaker whose recommendations reach a financial interest. Never stores date of birth, residence or address, contact details, family members or transaction-level personal payments (privacy rule, 09-reasoning.md); privacyClass must be set (null fails closed). Identity rule: ORCID, SEC_CIK (Form 4 reporting owner) or NPI-1 when present, else (normalized full name, the public role and organization that make the person public); a name match alone never merges two Persons (RESOLUTION / EQUIVALENCE Assessment instead). A handle is not a Person (pseudonymous speakers are D9 accounts; 11-open-questions.md). uid token: `person` (hu:person:<opaque>). Questions: CQ-CL-05, CQ-EC-03, CQ-AX-18, CQ-EC-04, Q-D7-02, Q-D7-03, Q-D7-06, Q-D7-07, Q-D7-08, Q-D7-11, Q-D7-12, Q-D7-17, Q-D7-18, Q-D7-20, Q-D7-24, Q-D7-25.

## Identity

| | |
| --- | --- |
| id | `node:Person` · raw SDL [sdl:Person](../sdl/Person.graphql) |
| module / domain | [D7](../modules/D7.md) / [Organizations, people and money](../domains/actors-and-institutions.md) |
| uid | `hu:person:<opaque>` |
| stored labels | `Person` `Entity` (primary `Person`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `ORCID` + `SEC_CIK (Form 4 reporting owner)` + `NPI (NPI-1)` + `(normalized full name, the public role and organization that make the person public)` |
| identity keys | `uid`, `name` |
| identifier schemes | `ORCID` (active), `SEC_CIK` (active), `NPI` (disabled), `OPENALEX` (active), `WIKIDATA` (active), `NIH_PROFILE_ID` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (13)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D7.graphql:L359 |
| `uid` | `String!` | yes | create+update |  | D7.graphql:L360 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D7.graphql:L361 |
| `lastWriterRunId` | `String` |  | create+update |  | D7.graphql:L363 |
| `publicActorBasis` | [PublicActorBasis](../vocabularies/PublicActorBasis.md)[] |  | create+update | Why this person is a public actor (privacy gate; Q-D7-18, Q-D7-24 filter on it). | D7.graphql:L367 |
| `credentialsVerbatim` | `String` |  | create+update | Post-nominal credentials as printed (MD, PhD, RD); display and filter only, never a role fact. | D7.graphql:L369 |
| `description` | `String` |  | create+update | Display headline; facts in it are not queryable until asserted. | D7.graphql:L371 |
| `influenceScore` | `Float` |  | create+update | Discourse projection cache (R-49, Q-D9-19): influence score of this person over the retelling graph (PageRank class), graph-wide, under influenceMeth… | D7.graphql:L373 |
| `influenceMethodVersion` | `String` |  | create+update | Method version of the influence cache, e.g. d9-influence/pagerank-v1 (R-45 condition 3). | D7.graphql:L375 |
| `influenceDerivedAt` | `DateTime` |  | create+update | When the PROJECTION Activity derived the influence cache (R-45 condition 3). | D7.graphql:L377 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D7.graphql:L364 |
| `updatedAt` | `DateTime` |  | create+update |  | D7.graphql:L365 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D7.graphql:L362 |

## Outgoing relationships (6)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Person --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [APPEARS_IN](../relationships/APPEARS_IN.md) | [MediaWork](MediaWork.md) | asserted | recorded-only | [AppearanceEdgeProperties](../edge-properties/AppearanceEdgeProperties.md) | MediaWork.appearances (IN) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) | [Organization](Organization.md) | asserted | episode | [RoleEdgeProperties](../edge-properties/RoleEdgeProperties.md) | Person.holdsRoles (OUT) | `edge.assert` |
| [HOLDS_STAKE](../relationships/HOLDS_STAKE.md) | [Organization](Organization.md) | asserted | episode | [StakeEdgeProperties](../edge-properties/StakeEdgeProperties.md) | Person.holdsStakes (OUT) | `edge.assert` |
| [RECEIVES_VALUE_FROM](../relationships/RECEIVES_VALUE_FROM.md) | [Organization](Organization.md) | asserted | episode | [ValueEdgeProperties](../edge-properties/ValueEdgeProperties.md) | Person.receivesValueFrom (OUT) | `edge.assert` |
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
| [AWARDED_TO](../relationships/AWARDED_TO.md) | [Award](Award.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Award.recipientPersons (OUT) | `edge.assert` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) | [Study](Study.md) | asserted | episode | [StudyRoleEdgeProperties](../edge-properties/StudyRoleEdgeProperties.md) | Study.roles (OUT) | `edge.assert` |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [INVOLVES](../relationships/INVOLVES.md) | [Event](Event.md) | asserted | recorded-only | [EventRoleEdgeProperties](../edge-properties/EventRoleEdgeProperties.md) | Event.involvedPeople (OUT) | `edge.assert` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (18)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [APPEARS_IN](../predicates/APPEARS_IN.md) | subject | authorizing | typed-edge | D9 |
| [AUTHORED_BY](../predicates/AUTHORED_BY.md) | object | relationship | assertion-only | D3 |
| [AWARDED_TO](../predicates/AWARDED_TO.md) | object | authorizing | typed-edge | D7 |
| [DISCLOSES_INTEREST](../predicates/DISCLOSES_INTEREST.md) | subject | relationship | assertion-only | D9 |
| [DISCLOSES_INTERESTS_OF](../predicates/DISCLOSES_INTERESTS_OF.md) | object | relationship | assertion-only | K |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FAMILY_OR_PERSONAL_RELATIONSHIP](../predicates/FAMILY_OR_PERSONAL_RELATIONSHIP.md) | subject+object | relationship | assertion-only | D7 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HAS_STUDY_ROLE](../predicates/HAS_STUDY_ROLE.md) | object | authorizing | typed-edge | D3 |
| [HOLDS_ROLE](../predicates/HOLDS_ROLE.md) | subject | authorizing | typed-edge | D7 |
| [HOLDS_STAKE](../predicates/HOLDS_STAKE.md) | subject | authorizing | typed-edge | D7 |
| [INVENTOR_ON_PATENT_ASSIGNED_TO](../predicates/INVENTOR_ON_PATENT_ASSIGNED_TO.md) | subject | relationship | assertion-only | D7 |
| [INVOLVES](../predicates/INVOLVES.md) | object | authorizing | typed-edge | D13 |
| [MATERIAL_CONNECTION_NOT_ADEQUATELY_DISCLOSED](../predicates/MATERIAL_CONNECTION_NOT_ADEQUATELY_DISCLOSED.md) | subject | literal | literal | D7 |
| [NOMINATES_DIRECTOR](../predicates/NOMINATES_DIRECTOR.md) | object | relationship | assertion-only | D7 |
| [OPERATED_BY](../predicates/OPERATED_BY.md) | object | relationship | assertion-only | D9 |
| [RECEIVES_VALUE_FROM](../predicates/RECEIVES_VALUE_FROM.md) | subject | authorizing | typed-edge | D7 |
| [TAKES](../predicates/TAKES.md) | subject | relationship | assertion-only | D9 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Person are Assertions with it as subject: `(:Person)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (25)

- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported; Q-D10-21)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported; Q-D5-13)
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported; CQ-CL-05)
- [D7/CQ-EC-04#1](../patterns/D7/CQ-EC-04--1.md) (supported; CQ-EC-04)
- [D7/Q-D7-02#1](../patterns/D7/Q-D7-02--1.md) (supported; Q-D7-02)
- [D7/Q-D7-06#1](../patterns/D7/Q-D7-06--1.md) (supported; Q-D7-06)
- [D7/Q-D7-08#1](../patterns/D7/Q-D7-08--1.md) (supported; Q-D7-08)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported; Q-D7-22)
- [D7/Q-D7-25#1](../patterns/D7/Q-D7-25--1.md) (supported; Q-D7-25)
- [D9/CQ-CL-04](../patterns/D9/CQ-CL-04.md) (supported; CQ-CL-04)
- [D9/CQ-CL-07](../patterns/D9/CQ-CL-07.md) (supported; CQ-CL-07)
- [D9/CQ-CL-08](../patterns/D9/CQ-CL-08.md) (supported; CQ-CL-08)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported; Q-D9-02)
- [D9/Q-D9-13](../patterns/D9/Q-D9-13.md) (supported; Q-D9-13)
- [D9/Q-D9-18](../patterns/D9/Q-D9-18.md) (supported; Q-D9-18)
- [D9/Q-D9-19#projection](../patterns/D9/Q-D9-19--projection.md) (unsupported; Q-D9-19)
- [D9/Q-D9-21](../patterns/D9/Q-D9-21.md) (supported; Q-D9-21)
- [D9/Q-D9-22](../patterns/D9/Q-D9-22.md) (supported; Q-D9-22)
- [D9/Q-D9-23](../patterns/D9/Q-D9-23.md) (supported; Q-D9-23)
- [K/Q-K-15](../patterns/K/Q-K-15.md) (supported; Q-K-15)
- … 5 more: `bks-schema find --kind pattern --label Person`

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `HOLDS_ROLE` does NOT imply `RECOMMENDS_USE`
- `RECEIVES_VALUE_FROM` does NOT imply `RECOMMENDS_USE`
- `HOLDS_STAKE` does NOT imply `OWNS_BRAND`
- `OPERATED_BY` does NOT imply `OWNS_BRAND`

## Tasks

- [Ingest an organization profile (roles, stakes, brands, control)](../tasks/ingest-organization-profile.md)
- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)
- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md)

## v1 navigation aliases

- `node:Person` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D7.graphql#L355-L390`
- `release:registers/node-register.yaml#Person`
- `release:workspace-inputs/identity-rules.yaml#Person`
