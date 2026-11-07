---
id: "node:MediaWork"
kind: "node"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D9.graphql#L233-L283","release:registers/node-register.yaml#MediaWork","release:workspace-inputs/identity-rules.yaml#MediaWork"]
aliases: ["media work","media-work","mediawork","node:Document","node:Episode","node:MediaAsset","node:MediaRightsRecord","Document","Episode","MediaAsset","MediaRightsRecord"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:fe12e2b8900e98e676fb60f7acb29a1399e106fee460a11bf631cbacc86cebda"
---
# MediaWork

Purpose: one editorial work — a podcast episode, video, talk recording, newsletter issue, article, protocol page, social post, forum thread, book or image — independent of the renditions it is distributed in. It is the container every Assertion whose evidence is in the work OCCURS_IN, claim occurrences included (who said it where, CQ-CL-01; R-19), the thing sponsors are read in (CONTENT_SPONSORED_BY, per observation window), the unit of re-cuts and clips (republicationKind; the link to the original is a predicate-only REPUBLISHES Assertion, Q-D9-07), and the join between renditions (kernel Sources: publisher page, YouTube video, RSS enclosure, Spotify page, archive copy) whose wording, duration and sponsor reads diverge. Absorbs pinned Episode, EpisodeSegment (→ locators + segment qualifier), MediaAsset (→ workKind IMAGE), MediaVariant (→ kernel Source/SourceSnapshot) and MediaRightsRecord (→ rights properties). Scholarly publications are D3's. Identity rule: (channel, publisher item key): the RSS guid of the item in the channel's own feed when one exists, else the platform item id (YouTube video id, X post id, Substack post id, forum topic id), else the normalized canonical page URL; a re-cut, clip or repost is a new work (republicationKind set, REPUBLISHES Assertion to the original), never a merge. Identifiers (PODCAST_GUID, YOUTUBE_VIDEO, DOI of a book chapter, ISBN) attach through the kernel. Asserter (R-15): a work with several bylines is the ASSERTED_BY target of what it states in its own voice; a bylined web article is asserted by its single named author, else by the site owner, never by "the first of several". uid token: `media-work` (hu:media-work:<opaque>). Questions: CQ-CL-01, CQ-CL-05, CQ-CL-06, CQ-CL-08, CQ-PV-02, Q-D9-01, Q-D9-02, Q-D9-04, Q-D9-06, Q-D9-07, Q-D9-08, Q-D9-10, Q-D9-11, Q-D9-12, Q-D9-16, Q-D9-17, Q-D9-18, Q-D9-21, Q-D9-23.

## Identity

| | |
| --- | --- |
| id | `node:MediaWork` · raw SDL [sdl:MediaWork](../sdl/MediaWork.graphql) |
| module / domain | [D9](../modules/D9.md) / [Sources, media, discourse and capture tooling](../domains/sources-documents-and-media.md) |
| uid | `hu:media-work:<opaque>` |
| stored labels | `MediaWork` `Entity` (primary `MediaWork`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `channel` + `publisherItemKey` |
| identity keys | `uid`, `canonicalUrl`, `name` |
| identifier schemes | `PODCAST_GUID` (active), `YOUTUBE_VIDEO` (disabled), `ISBN` (disabled), `DOI` (active), `WIKIDATA` (active), `X_POST` (disabled), `SUBSTACK_POST` (disabled), `SPOTIFY` (disabled) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (18)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D9.graphql:L237 |
| `uid` | `String!` | yes | create+update |  | D9.graphql:L238 |
| `canonicalUrl` | `String` |  | create+update | Publisher's own page for the work (show-notes page), when it has one. | D9.graphql:L252 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update | Title as published by the channel. | D9.graphql:L240 |
| `lastWriterRunId` | `String` |  | create+update |  | D9.graphql:L242 |
| `workKind` | [WorkKind](../vocabularies/WorkKind.md) | yes | create+update |  | D9.graphql:L245 |
| `publishedAt` | `DateTime` |  | create+update | Issuer's first publication time of this work (RSS pubDate, upload date, post date, byline date). | D9.graphql:L247 |
| `publishedAtPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D9.graphql:L248 |
| `republicationKind` | [RepublicationKind](../vocabularies/RepublicationKind.md) |  | create+update | Set when this work re-publishes another (Essentials re-cut, clip, repost); null on an original. | D9.graphql:L250 |
| `durationSeconds` | `Int` |  | create+update | Duration in seconds as declared by the publisher for its primary rendition (renditions differ; see 11-open-questions.md). | D9.graphql:L254 |
| `episodeNumber` | `Int` |  | create+update |  | D9.graphql:L255 |
| `seasonNumber` | `Int` |  | create+update |  | D9.graphql:L256 |
| `language` | `String` |  | create+update | BCP 47 language tag. | D9.graphql:L258 |
| `generationMode` | [GenerationMode](../vocabularies/GenerationMode.md) |  | create+update | IMAGE and AI-touched works: how the source says it was produced ('made with ChatGPT'). | D9.graphql:L260 |
| `rightsStatementVerbatim` | `String` |  | create+update | Rights or licence statement as captured beside the work ('Figure from the Nature paper', CC BY 4.0); verbatim, not a legal finding. | D9.graphql:L262 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D9.graphql:L243 |
| `updatedAt` | `DateTime` |  | create+update |  | D9.graphql:L244 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D9.graphql:L241 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:MediaWork --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [CONTENT_SPONSORED_BY](../relationships/CONTENT_SPONSORED_BY.md) | [ContentSponsor](../unions/ContentSponsor.md) (2 members) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | MediaWork.sponsors (OUT) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (14)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [APPEARS_IN](../relationships/APPEARS_IN.md) | [Person](Person.md) | asserted | recorded-only | [AppearanceEdgeProperties](../edge-properties/AppearanceEdgeProperties.md) | MediaWork.appearances (IN) | `edge.assert` |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [OCCURS_IN](../relationships/OCCURS_IN.md) | [Assertion](Assertion.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | MediaWork.occurrences (IN) | `edge.structural` |
| [PUBLISHES](../relationships/PUBLISHES.md) | [Channel](Channel.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | MediaWork.channels (IN) | `edge.structural` |
| [RENDITION_OF](../relationships/RENDITION_OF.md) | [Source](Source.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | MediaWork.renditions (IN) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (11)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [APPEARS_IN](../predicates/APPEARS_IN.md) | object | authorizing | typed-edge | D9 |
| [CITES_CONTENT](../predicates/CITES_CONTENT.md) | object | relationship | assertion-only | D9 |
| [CONTENT_SPONSORED_BY](../predicates/CONTENT_SPONSORED_BY.md) | subject | authorizing | typed-edge | D9 |
| [DEPICTS](../predicates/DEPICTS.md) | subject | relationship | assertion-only | D9 |
| [DISCLOSES_INTEREST](../predicates/DISCLOSES_INTEREST.md) | subject | relationship | assertion-only | D9 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [LINKS_TO_OFFER](../predicates/LINKS_TO_OFFER.md) | subject | relationship | assertion-only | D9 |
| [RECORDING_OF](../predicates/RECORDING_OF.md) | subject | relationship | assertion-only | D9 |
| [RENDITION_OF](../predicates/RENDITION_OF.md) | object | authorizing | typed-edge | D3 |
| [REPUBLISHES](../predicates/REPUBLISHES.md) | subject+object | relationship | assertion-only | D9 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a MediaWork are Assertions with it as subject: `(:MediaWork)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (37)

- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported; Q-D10-21)
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported; CQ-CL-05)
- [D7/Q-D7-06#1](../patterns/D7/Q-D7-06--1.md) (supported; Q-D7-06)
- [D9/CQ-CL-01](../patterns/D9/CQ-CL-01.md) (supported; CQ-CL-01)
- [D9/CQ-CL-02](../patterns/D9/CQ-CL-02.md) (supported; CQ-CL-02)
- [D9/CQ-CL-03](../patterns/D9/CQ-CL-03.md) (supported; CQ-CL-03)
- [D9/CQ-CL-04](../patterns/D9/CQ-CL-04.md) (supported; CQ-CL-04)
- [D9/CQ-CL-05](../patterns/D9/CQ-CL-05.md) (supported; CQ-CL-05)
- [D9/CQ-CL-06](../patterns/D9/CQ-CL-06.md) (supported; CQ-CL-06)
- [D9/CQ-CL-07](../patterns/D9/CQ-CL-07.md) (supported; CQ-CL-07)
- [D9/CQ-CL-08](../patterns/D9/CQ-CL-08.md) (supported; CQ-CL-08)
- [D9/CQ-CM-04](../patterns/D9/CQ-CM-04.md) (supported; CQ-CM-04)
- [D9/CQ-PV-04](../patterns/D9/CQ-PV-04.md) (supported; CQ-PV-04)
- [D9/CQ-PV-05](../patterns/D9/CQ-PV-05.md) (supported; CQ-PV-05)
- [D9/CQ-RC-05](../patterns/D9/CQ-RC-05.md) (supported; CQ-RC-05)
- [D9/Q-D9-01](../patterns/D9/Q-D9-01.md) (supported; Q-D9-01)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported; Q-D9-02)
- [D9/Q-D9-04](../patterns/D9/Q-D9-04.md) (supported; Q-D9-04)
- [D9/Q-D9-05](../patterns/D9/Q-D9-05.md) (supported; Q-D9-05)
- [D9/Q-D9-07](../patterns/D9/Q-D9-07.md) (supported; Q-D9-07)
- … 17 more: `bks-schema find --kind pattern --label MediaWork`

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `CONTENT_SPONSORED_BY` does NOT imply `RECOMMENDS_USE`

## Tasks

- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)
- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md)

## v1 navigation aliases

- `node:Document` (split): K: D9 (MediaWork / Source) ‖ D9: K.Source
- `node:Episode` (merged): D9: MediaWork (workKind PODCAST_EPISODE, VIDEO, LIVESTREAM, TALK_RECORDING)
- `node:MediaAsset` (merged): D9: MediaWork (workKind IMAGE)
- `node:MediaRightsRecord` (merged): D9: MediaWork.rightsStatementVerbatim

## Source definition

- `release:sdl/modules/D9.graphql#L233-L283`
- `release:registers/node-register.yaml#MediaWork`
- `release:workspace-inputs/identity-rules.yaml#MediaWork`
