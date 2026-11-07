---
id: "node:Publication"
kind: "node"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L831-L868","release:registers/node-register.yaml#Publication","release:workspace-inputs/identity-rules.yaml#Publication"]
aliases: ["publication","node:ProtocolVersion","ProtocolVersion"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:d0d81bfbdee6b4ac9a6a27cc61db9b0bde60cb60ac5fe739d1768704e0ed581f"
---
# Publication

Purpose: one scholarly work or one version of it — journal article, preprint version, systematic review version, protocol or analysis plan, conference abstract, correction / retraction / expression-of-concern / withdrawal notice — the unit that reports on studies, states arms, outcomes and results, and is corrected, retracted or superseded per asserter (REVISES). Its renditions (PubMed record, PMC JATS, DOI landing page, PDF) are kernel Sources grouped by the kernel-meaning RENDITION_OF (Source -> Publication, asserted, recorded-only; R-43), never by a cross-type join through a shared Identifier (R-42); locators live on their snapshots. Absorbs pinned ProtocolVersion (publicationKind PROTOCOL / ANALYSIS_PLAN). Owner D3 (R-71; D9 MediaWork excludes scholarly works). Authors are predicate-only AUTHORED_BY Assertions → D7 Person | Organization (registered by D3, R-80). Identity rule: DOI (+ versionLabel for preprint versions and review updates such as CD007176.pub2), else PMID, else PMCID, else (venue, title, publishedAt). uid token: `publication`. Questions: CQ-EV-05, Q-D3-03, Q-D3-11, Q-D3-12, CQ-ST-07, Q-D3-13, Q-D3-14, Q-D3-16.

## Identity

| | |
| --- | --- |
| id | `node:Publication` · raw SDL [sdl:Publication](../sdl/Publication.graphql) |
| module / domain | [D3](../modules/D3.md) / [Clinical and preclinical evidence](../domains/studies-and-evidence.md) |
| uid | `hu:publication:<opaque>` |
| stored labels | `Publication` `Entity` (primary `Publication`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `DOI (+ versionLabel for preprint versions and review updates)` + `else PMID` + `else PMCID` + `else (venueName, title, publishedAt)` |
| identity keys | `uid`, `name` |
| identifier schemes | `DOI` (active), `PMID` (active), `PMCID` (active), `OPENALEX` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (16)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D3.graphql:L835 |
| `uid` | `String!` | yes | create+update |  | D3.graphql:L836 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update | Title. | D3.graphql:L838 |
| `lastWriterRunId` | `String` |  | create+update |  | D3.graphql:L840 |
| `publicationKind` | [PublicationKind](../vocabularies/PublicationKind.md) | yes | create+update |  | D3.graphql:L843 |
| `versionLabel` | `String` |  | create+update | Version label (v1…v4 for medRxiv, pub2 for Cochrane). | D3.graphql:L845 |
| `publishedAt` | `DateTime` |  | create+update |  | D3.graphql:L846 |
| `publishedAtPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D3.graphql:L847 |
| `venueName` | `String` |  | create+update | Journal or server name as printed: venue name only, no container node (R-71). | D3.graphql:L849 |
| `citationText` | `String` |  | create+update |  | D3.graphql:L850 |
| `revisionStatus` | [SourceRevisionKind](../vocabularies/SourceRevisionKind.md) |  | create+update | Read-only projection cache over incoming REVISES and kernel HAS_REVISION_STATUS Assertions (method publication-revision-status/v2), typed by the kern… | D3.graphql:L852 |
| `revisionStatusDerivedAt` | `DateTime` |  | create+update |  | D3.graphql:L853 |
| `revisionStatusMethodVersion` | `String` |  | create+update | Method version of the revisionStatus cache (directive rule 8), e.g. publication-revision-status/v2. | D3.graphql:L855 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D3.graphql:L841 |
| `updatedAt` | `DateTime` |  | create+update |  | D3.graphql:L842 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D3.graphql:L839 |

## Outgoing relationships (4)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Publication --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [REPORTS_ON](../relationships/REPORTS_ON.md) | [Study](Study.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Publication.reportsOn (OUT) | `edge.assert` |
| [REVISES](../relationships/REVISES.md) | [Publication](Publication.md) | asserted | recorded-only | [RevisionEdgeProperties](../edge-properties/RevisionEdgeProperties.md) | Publication.revises (OUT) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (15)

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
| [RENDITION_OF](../relationships/RENDITION_OF.md) | [Source](Source.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Publication.renditions (IN) | `edge.assert` |
| [STATED_IN](../relationships/STATED_IN.md) | [OutcomeDefinition](OutcomeDefinition.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | OutcomeDefinition.statedIn (OUT) | `edge.assert` |
| [STATED_IN](../relationships/STATED_IN.md) | [StudyArm](StudyArm.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | StudyArm.statedIn (OUT) | `edge.assert` |
| [STATED_IN](../relationships/STATED_IN.md) | [StudyPopulation](StudyPopulation.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | StudyPopulation.statedIn (OUT) | `edge.assert` |
| [STATED_IN](../relationships/STATED_IN.md) | [StudyResult](StudyResult.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | StudyResult.statedIn (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (14)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [AUTHORED_BY](../predicates/AUTHORED_BY.md) | subject | relationship | assertion-only | D3 |
| [CITED_BY_COUNT](../predicates/CITED_BY_COUNT.md) | subject | literal | literal | D3 |
| [DISCLOSES_INTEREST](../predicates/DISCLOSES_INTEREST.md) | subject | relationship | assertion-only | D9 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FUNDED_BY](../predicates/FUNDED_BY.md) | subject | relationship | assertion-only | D3 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INCLUDED_STUDY_COUNT](../predicates/INCLUDED_STUDY_COUNT.md) | subject | literal | literal | D3 |
| [PUBLICATION_DATE_STATED](../predicates/PUBLICATION_DATE_STATED.md) | subject | literal | literal | D3 |
| [REGISTRY_ID_AS_PRINTED](../predicates/REGISTRY_ID_AS_PRINTED.md) | subject | literal | literal | D3 |
| [RENDITION_OF](../predicates/RENDITION_OF.md) | object | authorizing | typed-edge | D3 |
| [REPORTS_ON](../predicates/REPORTS_ON.md) | subject | authorizing | typed-edge | D3 |
| [REVISES](../predicates/REVISES.md) | subject+object | authorizing | typed-edge | D3 |
| [STATED_IN](../predicates/STATED_IN.md) | object | authorizing | typed-edge | D3 |
| [TITLE_AS_DEPOSITED](../predicates/TITLE_AS_DEPOSITED.md) | subject | literal | literal | D3 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Publication are Assertions with it as subject: `(:Publication)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (17)

- [D11/Q-D11-05](../patterns/D11/Q-D11-05.md) (supported; Q-D11-05)
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported; Q-D11-08)
- [D11/Q-D11-19](../patterns/D11/Q-D11-19.md) (supported; Q-D11-19)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported; Q-D13-14)
- [D3/CQ-EV-05#1](../patterns/D3/CQ-EV-05--1.md) (supported; CQ-EV-05)
- [D3/CQ-EV-05#2](../patterns/D3/CQ-EV-05--2.md) (supported; CQ-EV-05)
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported; Q-D3-04)
- [D7/CQ-EC-04#1](../patterns/D7/CQ-EC-04--1.md) (supported; CQ-EC-04)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported; Q-D7-22)
- [D7/Q-D7-25#1](../patterns/D7/Q-D7-25--1.md) (supported; Q-D7-25)
- [D9/Q-D9-13](../patterns/D9/Q-D9-13.md) (supported; Q-D9-13)
- [K/Q-K-10#1](../patterns/K/Q-K-10--1.md) (supported; Q-K-10)
- [K/Q-K-17](../patterns/K/Q-K-17.md) (supported; Q-K-17)
- [K/Q-K-21](../patterns/K/Q-K-21.md) (supported; Q-K-21)
- [K/Q-K-22](../patterns/K/Q-K-22.md) (supported; Q-K-22)
- [K/Q-K-23](../patterns/K/Q-K-23.md) (supported; Q-K-23)
- [QP/G-4#1](../patterns/QP/G-4--1.md) (unsupported; CQ-ST-07)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `node:Publication` is unchanged from v1.
- `node:ProtocolVersion` (merged): D3: Publication (publicationKind PROTOCOL / ANALYSIS_PLAN; versions chain by REVISES)

## Source definition

- `release:sdl/modules/D3.graphql#L831-L868`
- `release:registers/node-register.yaml#Publication`
- `release:workspace-inputs/identity-rules.yaml#Publication`
