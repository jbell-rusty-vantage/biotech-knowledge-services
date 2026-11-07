---
id: "node:Event"
kind: "node"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D13.graphql#L224-L312","release:registers/node-register.yaml#Event","release:workspace-inputs/identity-rules.yaml#Event"]
aliases: ["event"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:bbb721fab0308da119bb531fbf4c14318fbe79e55706fa0c23cfc438afcb860f"
---
# Event

Purpose: one dated public occurrence in biotech that investors, researchers and agents order into timelines and chains: a trial start, a readout, a regulatory submission, acceptance, designation, approval, rejection or clinical hold, a safety signal, a discontinuation, a financing, an acquisition, a partnership, a retraction curated as a frontier milestone. Every timeline, chain, harm and breakthrough question filters by its kind and clocks, joins it to frontiers and participants, and traverses LEADS_TO / RESPONDS_TO through it, so it is a node. Clocks (CQ-TM-03): every time property is MATERIALIZED from one kernel Assertion whose subject is this Event and whose validFrom/validTo carry the time: startedAt/endedAt ← EVENT_OCCURRED (timeAssertionUid); announcedAt ← EVENT_ANNOUNCED (the first public statement by a party; announcementAssertionUid); effectiveFrom ← EVENT_EFFECTIVE (legal or contractual effect, may be an INSTANT with localTimeZone; effectiveAssertionUid); scheduledFrom/scheduledTo ← the latest accepted EVENT_SCHEDULED (a guided or goal window, half-open, e.g. "first half of 2023" = [2023-01-01, 2023-07-01) with MONTH precision on both bounds; scheduleAssertionUid). The filing or acceptance time of the document that reports the event is not an Event clock: it is SourceSnapshot.publishedAt of that document. When two asserters disagree (a registry start date versus the sponsor's "first participant dosed"), both Assertions stay and the materialized value follows the precedence rule named in `clockRule`. History lives in the Assertions (recorded time): a re-guided date, a correction or a cancellation is a new Assertion on the same Event, never an edit and never a new Event. Nothing is required beyond one EVENT_OCCURRED or EVENT_SCHEDULED Assertion with a locator: an event that exists only as a press release (no filing, no registry change) is a valid Event (Q-D13-22 measures corroboration). Records (R-66): a regulatory act is one D8 RegulatoryRecord plus at most one Event, linked by DOCUMENTED_BY_RECORD; its date is one Assertion on one shared locator and the Event clocks are caches. An Event is minted only for a frontier timeline and never re-asserts a date a D3 or D8 record already carries; process chains (submission → acceptance → approval) are computed from the shared D8 application identifier, not from LEADS_TO. Identity rule (adversarial-review pass): `identityKey` is a MINT-TIME key, written once when the executor creates the Event and never recomputed: eventKind | primary subject uid | jurisdiction or '-' | time anchor as first stated (startedAt, or the scheduled window, at its stated precision) | discriminator when required. The primary subject is the object of the one EVENT_ABOUT Assertion carrying the qualifier `primary=true`; for FINANCING it is the ISSUER or BORROWER participant, for ACQUISITION the ACQUIREE, for PARTNERSHIP the party whose asset is licensed (the INVOLVES Assertion carrying `primary=true`). The discriminator is required when one subject can have several events of the same kind on one day (FINANCING: the instrument, e.g. loan-tranche, registered-direct, atm-sales). Matching a new artifact to an existing Event does not compare keys: candidates share eventKind, primary subject and jurisdiction and have overlapping time windows (scheduled window, occurrence at its precision); a sure match attaches the new Assertions to that Event, a doubtful one mints a new Event plus a proposed EQUIVALENCE Assessment, and a merge happens only through an accepted EQUIVALENCE Assessment. So a re-guided window, PLANNED → OCCURRED, or a more precise later date never mints a second Event (Q-D13-11). An 8-K, its press-release exhibit, a registry status change and a regulator record about the same occurrence are several Assertions about ONE Event (an acquisition's agreement and closing are one Event with two clocks). External ids (accession numbers, NCT ids of the subject study) are identifiers of the documents or subjects, not of the Event. uid token: `event` (hu:event:<opaque>). Questions: Q-D13-01, Q-D13-02, Q-D13-03, Q-D13-04, Q-D13-05, Q-D13-06, Q-D13-07, Q-D13-08, Q-D13-10, Q-D13-11, Q-D13-12, CQ-EV-05, Q-D13-14, Q-D13-15, Q-D13-16, Q-D13-17, CQ-TM-03, CQ-TM-01, Q-D13-21, Q-D13-22, Q-D13-25, Q-D13-26, Q-D13-27, Q-D13-30, Q-D13-31, Q-D13-32, Q-D13-33.

## Identity

| | |
| --- | --- |
| id | `node:Event` · raw SDL [sdl:Event](../sdl/Event.graphql) |
| module / domain | [D13](../modules/D13.md) / [Frontiers, breakthroughs and events](../domains/frontiers-and-events.md) |
| uid | `hu:event:<opaque>` |
| stored labels | `Event` `Entity` (primary `Event`) |
| archetype | Occurrence |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `eventKind` + `primarySubjectUid` + `jurisdiction` + `firstStatedTimeAtPrecision` + `discriminator` |
| identity keys | `uid`, `name`, `eventKind`, `jurisdiction` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (38)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D13.graphql:L228 |
| `uid` | `String!` | yes | create+update |  | D13.graphql:L229 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D13.graphql:L230 |
| `lastWriterRunId` | `String` |  | create+update |  | D13.graphql:L232 |
| `eventKind` | [EventKind](../vocabularies/EventKind.md) | yes | create+update | Kind of event; filter key of every D13 question (vocab-frontiers.yaml section 5). | D13.graphql:L236 |
| `eventKindNote` | `String` |  | create+update | Required when eventKind is OTHER: what the source calls it (reviewed for a vocabulary bump). | D13.graphql:L238 |
| `eventStatus` | [EventStatus](../vocabularies/EventStatus.md) | yes | create+update | Materialized from the time Assertions; never truth. | D13.graphql:L240 |
| `identityKey` | `String` |  | create+update | Mint-time key per the identity rule (kind \| primary subject uid \| jurisdiction \| first-stated time at precision \| discriminator); frozen, never recom… | D13.graphql:L242 |
| `summaryText` | `String` |  | create+update | One-paragraph neutral summary written from the cited spans (presentation and retrieval only; never evidence). | D13.graphql:L244 |
| `jurisdiction` | `String` |  | create+update | ISO 3166-1 alpha-2 or region code (US, EU, GB, JP); required for regulatory kinds (vocab-frontiers.yaml `requires`). When a D8 RegulatoryRecord docum… | D13.graphql:L246 |
| `startedAt` | `DateTime` |  | create+update | When it happened (valid-time start, first instant of its precision period) ← EVENT_OCCURRED. | D13.graphql:L248 |
| `startedAtPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D13.graphql:L249 |
| `startedAtBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) |  | create+update |  | D13.graphql:L250 |
| `endedAt` | `DateTime` |  | create+update | When a durative event ended (half-open); null = unknown or instantaneous, never 'ongoing'. | D13.graphql:L252 |
| `endedAtPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D13.graphql:L253 |
| `timeAssertionUid` | `String` |  | create+update | uid of the EVENT_OCCURRED Assertion that startedAt/endedAt materialize. | D13.graphql:L255 |
| `announcedAt` | `DateTime` |  | create+update | First public announcement by a party to the event (press-release dateline or publication instant) ← EVENT_ANNOUNCED. | D13.graphql:L257 |
| `announcedAtPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D13.graphql:L258 |
| `announcementAssertionUid` | `String` |  | create+update |  | D13.graphql:L259 |
| `effectiveFrom` | `DateTime` |  | create+update | When the legal, regulatory or contractual effect begins ← EVENT_EFFECTIVE; never proxied from announcedAt. | D13.graphql:L261 |
| `effectiveFromPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D13.graphql:L262 |
| `effectiveFromBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) |  | create+update |  | D13.graphql:L263 |
| `effectiveAssertionUid` | `String` |  | create+update |  | D13.graphql:L264 |
| `localTimeZone` | `String` |  | create+update | IANA time zone in which the source stated a local time ("5:00 p.m. Eastern Time"); instants are stored in UTC. | D13.graphql:L266 |
| `scheduledFrom` | `DateTime` |  | create+update | Start of the latest accepted scheduled window (half-open) ← EVENT_SCHEDULED; null bound = unknown. | D13.graphql:L268 |
| `scheduledTo` | `DateTime` |  | create+update | Exclusive end of the latest accepted scheduled window (a PDUFA goal date D is [D, D+1 day)). | D13.graphql:L270 |
| `scheduledFromPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D13.graphql:L271 |
| `scheduledToPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D13.graphql:L272 |
| `scheduleAssertionUid` | `String` |  | create+update | uid of the EVENT_SCHEDULED Assertion the window materializes; earlier windows stay as superseded Assertions (Q-D13-11). | D13.graphql:L274 |
| `clockRule` | `String` |  | create+update | Named precedence rule used when several asserters give the same clock, e.g. event-clock/v1 (regulator > registry > filing > sponsor release > press). | D13.graphql:L276 |
| `readoutStage` | [ReadoutStage](../vocabularies/ReadoutStage.md) |  | create+update | READOUT only. | D13.graphql:L278 |
| `primaryEndpointStatement` | [EndpointStatement](../vocabularies/EndpointStatement.md) |  | create+update | READOUT only: what the source states about the primary endpoint(s); a capture, not a judgment. | D13.graphql:L280 |
| `approvalPathway` | [RegulatoryPathway](../vocabularies/RegulatoryPathway.md) |  | create+update | APPROVAL only; D8 vocabulary (R-66, OQ-D8-02 mapping: FULL → US_DRUG_NDA \| US_BLA, ACCELERATED → US_ACCELERATED_APPROVAL, CONDITIONAL → EU_CONDITIONA… | D13.graphql:L282 |
| `designationType` | [RegulatoryPathway](../vocabularies/RegulatoryPathway.md) |  | create+update | REGULATORY_DESIGNATION (and PRIORITY_REVIEW announced with REGULATORY_ACCEPTANCE) only; D8 vocabulary (R-66): the designation programme, e.g. US_BREA… | D13.graphql:L284 |
| `discontinuationScope` | [DiscontinuationScope](../vocabularies/DiscontinuationScope.md) |  | create+update | PROGRAM_DISCONTINUATION only. | D13.graphql:L286 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D13.graphql:L233 |
| `updatedAt` | `DateTime` |  | create+update |  | D13.graphql:L234 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D13.graphql:L231 |

## Outgoing relationships (8)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Event --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [DOCUMENTED_BY_RECORD](../relationships/DOCUMENTED_BY_RECORD.md) | [RegulatoryRecord](RegulatoryRecord.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Event.regulatoryRecords (OUT) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [INVOLVES](../relationships/INVOLVES.md) | [Organization](Organization.md) | asserted | recorded-only | [EventRoleEdgeProperties](../edge-properties/EventRoleEdgeProperties.md) | Event.involvedOrganizations (OUT) | `edge.assert` |
| [INVOLVES](../relationships/INVOLVES.md) | [Person](Person.md) | asserted | recorded-only | [EventRoleEdgeProperties](../edge-properties/EventRoleEdgeProperties.md) | Event.involvedPeople (OUT) | `edge.assert` |
| [LEADS_TO](../relationships/LEADS_TO.md) | [Event](Event.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Event.leadsTo (OUT) | `edge.assert` |
| [ON_FRONTIER](../relationships/ON_FRONTIER.md) | [Frontier](Frontier.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Event.frontiers (OUT) | `edge.assert` |
| [RESPONDS_TO](../relationships/RESPONDS_TO.md) | [Event](Event.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Event.respondsTo (OUT) | `edge.assert` |
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

## Legal predicates (27)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [APPROVAL_PATHWAY](../predicates/APPROVAL_PATHWAY.md) | subject | literal | literal | D13 |
| [CONTINGENT_ON](../predicates/CONTINGENT_ON.md) | subject | relationship | assertion-only | D13 |
| [DATE_OF_FIRST_SALE](../predicates/DATE_OF_FIRST_SALE.md) | subject | literal | literal | D13 |
| [DESIGNATION_TYPE](../predicates/DESIGNATION_TYPE.md) | subject | literal | literal | D13 |
| [DISCONTINUATION_SCOPE](../predicates/DISCONTINUATION_SCOPE.md) | subject | literal | literal | D13 |
| [DOCUMENTED_BY_RECORD](../predicates/DOCUMENTED_BY_RECORD.md) | subject | authorizing | typed-edge | D13 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [EVENT_ANNOUNCED](../predicates/EVENT_ANNOUNCED.md) | subject | relationship | assertion-only | D13 |
| [EVENT_OCCURRED](../predicates/EVENT_OCCURRED.md) | subject | relationship | assertion-only | D13 |
| [EVENT_SCHEDULED](../predicates/EVENT_SCHEDULED.md) | subject | relationship | assertion-only | D13 |
| [FINANCING_AMOUNT](../predicates/FINANCING_AMOUNT.md) | subject | literal | literal | D13 |
| [FIRST_OF_KIND_CLAIM](../predicates/FIRST_OF_KIND_CLAIM.md) | subject | literal | literal | D13 |
| [FORECASTS](../predicates/FORECASTS.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INVESTOR_COUNT](../predicates/INVESTOR_COUNT.md) | subject | literal | literal | D13 |
| [INVOLVES](../predicates/INVOLVES.md) | subject | authorizing | typed-edge | D13 |
| [JURISDICTION](../predicates/JURISDICTION.md) | subject | literal | literal | D13 |
| [LEADS_TO](../predicates/LEADS_TO.md) | subject+object | authorizing | typed-edge | D13 |
| [ON_FRONTIER](../predicates/ON_FRONTIER.md) | subject | authorizing | typed-edge | D13 |
| [PRESENTED_AT_CONFERENCE](../predicates/PRESENTED_AT_CONFERENCE.md) | subject | relationship | assertion-only | D13 |
| [PRIMARY_ENDPOINT_STATEMENT](../predicates/PRIMARY_ENDPOINT_STATEMENT.md) | subject | literal | literal | D13 |
| [READOUT_STAGE](../predicates/READOUT_STAGE.md) | subject | literal | literal | D13 |
| [RECORDING_OF](../predicates/RECORDING_OF.md) | subject+object | relationship | assertion-only | D9 |
| [REPORTED_MARKET_MOVE](../predicates/REPORTED_MARKET_MOVE.md) | subject | relationship | assertion-only | D13 |
| [RESPONDS_TO](../predicates/RESPONDS_TO.md) | subject+object | authorizing | typed-edge | D13 |
| [STATED_CASE_COUNT](../predicates/STATED_CASE_COUNT.md) | subject | literal | literal | D13 |
| [STATED_REASON](../predicates/STATED_REASON.md) | subject | literal | literal | D13 |

## Evidence path

- Provenance requirement: an Activity is one Mission Control run or a native namespaced run (OD-07); lineage via WAS_INFORMED_BY; capture attempts keep sanitized request metadata (EX-03)
- Facts about a Event are Assertions with it as subject: `(:Event)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (10)

- [D13/Q-D13-04#1](../patterns/D13/Q-D13-04--1.md) (supported; Q-D13-04)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported; Q-D13-12)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported; Q-D13-14)
- [D13/Q-D13-22#1](../patterns/D13/Q-D13-22--1.md) (supported; Q-D13-22)
- [D9/Q-D9-18](../patterns/D9/Q-D9-18.md) (supported; Q-D9-18)
- [D9/Q-D9-19#projection](../patterns/D9/Q-D9-19--projection.md) (unsupported; Q-D9-19)
- [QP/G-5#1](../patterns/QP/G-5--1.md) (unsupported; Q-D9-19)
- [QP/P-08a](../patterns/QP/P-08a.md) (supported; Q-D10-22, Q-D13-01, Q-D13-02, Q-D13-03)
- [QP/P-08b](../patterns/QP/P-08b.md) (supported; Q-D10-22, Q-D13-01, Q-D13-02, Q-D13-03)
- [QP/P-08c](../patterns/QP/P-08c.md) (supported; Q-D10-22, Q-D13-01, Q-D13-02, Q-D13-03)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create (node.upsert); re-materialize clocks from Assertions; never delete
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:Event` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D13.graphql#L224-L312`
- `release:registers/node-register.yaml#Event`
- `release:workspace-inputs/identity-rules.yaml#Event`
