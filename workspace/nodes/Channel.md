---
id: "node:Channel"
kind: "node"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D9.graphql#L179-L211","release:registers/node-register.yaml#Channel","release:workspace-inputs/identity-rules.yaml#Channel"]
aliases: ["channel","node:Community","node:Conference","node:Platform","node:Series","Community","Conference","Platform","Series"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:6d92d44a75bcffb7d5cd6ffbe0e353aeb510170e22298f54d54ebf75be2bed49"
---
# Channel

Purpose: an editorial container that publishes works over time — a podcast show, a video channel, a newsletter, a site, a forum, or an account/handle on a platform (named or pseudonymous). It is what PUBLISHES works, where "the channel's" financial interest (CQ-CL-05) attaches through its operators (predicate-only OPERATED_BY Assertions, subject Channel, object D7 Person or Organization, valid time on the Assertion), what a pseudonymous asserter is (channelKind ACCOUNT, isPseudonymous; admitted by the kernel ASSERTED_BY contract; D7 holds no handles), and the unit of influence and coverage questions. Absorbs the pinned Platform (→ `platform`), Series (→ channelKind SHOW; sub-series such as "Essentials" are works with republicationKind), Community-online (→ channelKind FORUM), ON_PLATFORM (→ `platform`) and HOSTS_CHANNEL / OPERATES_CHANNEL / SERVES_ON_CHANNEL (→ the OPERATED_BY predicate; host role is APPEARS_IN HOST per work). Identity rule: (platform, platformAccountId) when the platform issues one (YouTube channel id, Apple collectionId, Substack subdomain, X handle id, forum member id); else the normalized feed URL (RSS) or home URL. A show carried on several platforms is one Channel per platform account only when a question separates them; by default one Channel per show with its feed as identity and platform ids attached as Identifiers. Identifiers attach through the kernel. uid token: `channel` (hu:channel:<opaque>). Questions: CQ-CL-05, CQ-CL-07, Q-D9-11, Q-D9-12, Q-D9-14, Q-D9-19.

## Identity

| | |
| --- | --- |
| id | `node:Channel` · raw SDL [sdl:Channel](../sdl/Channel.graphql) |
| module / domain | [D9](../modules/D9.md) / [Sources, media, discourse and capture tooling](../domains/sources-documents-and-media.md) |
| uid | `hu:channel:<opaque>` |
| stored labels | `Channel` `Entity` (primary `Channel`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `platform` + `platformAccountId` |
| identity keys | `uid`, `name`, `handle`, `platform`, `platformAccountId` |
| identifier schemes | `PODCAST_INDEX_FEED` (disabled), `ISSN` (disabled), `WIKIDATA` (active), `YOUTUBE_CHANNEL` (disabled), `APPLE_PODCAST` (active), `SPOTIFY` (disabled), `X_ACCOUNT` (disabled) |
| name match (workspace rule) | `name`, `handle` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (18)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D9.graphql:L183 |
| `uid` | `String!` | yes | create+update |  | D9.graphql:L184 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update | Display name of the show, channel, publication, forum or handle. | D9.graphql:L186 |
| `lastWriterRunId` | `String` |  | create+update |  | D9.graphql:L188 |
| `channelKind` | [ChannelKind](../vocabularies/ChannelKind.md) | yes | create+update |  | D9.graphql:L191 |
| `platform` | [MediaPlatform](../vocabularies/MediaPlatform.md) | yes | create+update |  | D9.graphql:L192 |
| `platformAccountId` | `String` |  | create+update | Platform-issued account or collection id (YouTube channel id, Apple collectionId, forum member id). | D9.graphql:L194 |
| `handle` | `String` |  | create+update | Handle as displayed (@bryan_johnson, Hermuller); presentation and lookup, never identity across platforms. | D9.graphql:L196 |
| `feedUrl` | `String` |  | create+update | Normalized RSS/Atom feed URL when the channel has one (joins to the feed's kernel Source.canonicalUri). | D9.graphql:L198 |
| `homeUrl` | `String` |  | create+update | Home page or profile URL. | D9.graphql:L200 |
| `isPseudonymous` | `Boolean` |  | create+update | True when no publicly identified operator stands behind an ACCOUNT (a forum handle). A resolution to a Person is a kernel RESOLUTION Assessment, neve… | D9.graphql:L202 |
| `language` | `String` |  | create+update | BCP 47 language tag of the channel's works. | D9.graphql:L204 |
| `influenceScore` | `Float` |  | create+update | Discourse projection cache (R-49, Q-D9-19): influence score of this channel over the retelling graph (PageRank class), graph-wide, under influenceMet… | D9.graphql:L206 |
| `influenceMethodVersion` | `String` |  | create+update | Method version of the influence cache, e.g. d9-influence/pagerank-v1 (R-45 condition 3). | D9.graphql:L208 |
| `influenceDerivedAt` | `DateTime` |  | create+update | When the PROJECTION Activity derived the influence cache (R-45 condition 3). | D9.graphql:L210 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D9.graphql:L189 |
| `updatedAt` | `DateTime` |  | create+update |  | D9.graphql:L190 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D9.graphql:L187 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Channel --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [PUBLISHES](../relationships/PUBLISHES.md) | [MediaWork](MediaWork.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | MediaWork.channels (IN) | `edge.structural` |
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

## Legal predicates (5)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [OPERATED_BY](../predicates/OPERATED_BY.md) | subject+object | relationship | assertion-only | D9 |
| [PRESENTED_AT_CONFERENCE](../predicates/PRESENTED_AT_CONFERENCE.md) | object | relationship | assertion-only | D13 |
| [TAKES](../predicates/TAKES.md) | subject | relationship | assertion-only | D9 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Channel are Assertions with it as subject: `(:Channel)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (6)

- [D9/CQ-CL-04](../patterns/D9/CQ-CL-04.md) (supported; CQ-CL-04)
- [D9/CQ-CL-05](../patterns/D9/CQ-CL-05.md) (supported; CQ-CL-05)
- [D9/CQ-CL-07](../patterns/D9/CQ-CL-07.md) (supported; CQ-CL-07)
- [D9/CQ-PV-05](../patterns/D9/CQ-PV-05.md) (supported; CQ-PV-05)
- [D9/Q-D9-19#projection](../patterns/D9/Q-D9-19--projection.md) (unsupported; Q-D9-19)
- [QP/G-5#1](../patterns/QP/G-5--1.md) (unsupported; Q-D9-19)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `OPERATED_BY` does NOT imply `OWNS_BRAND`

## Tasks

- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)

## v1 navigation aliases

- `node:Channel` is unchanged from v1.
- `node:Community` (merged): D9: Channel (channelKind FORUM) for online communities; offline deferred
- `node:Conference` (merged): D9: D9 Channel (channelKind EVENT_SERIES) for the recurring meeting + D13 DATA_PRESENTATION Events for presentations with a data claim; edition and session are…
- `node:Platform` (merged): D9: Channel.platform (MediaPlatform enum)
- `node:Series` (merged): D9: Channel (channelKind SHOW); sub-series such as Essentials → MediaWork.republicationKind

## Source definition

- `release:sdl/modules/D9.graphql#L179-L211`
- `release:registers/node-register.yaml#Channel`
- `release:workspace-inputs/identity-rules.yaml#Channel`
