---
id: "node:CaptureAttempt"
kind: "node"
module: "D11"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D11.graphql#L88-L126","release:registers/node-register.yaml#CaptureAttempt","release:workspace-inputs/identity-rules.yaml#CaptureAttempt"]
aliases: ["capture attempt","capture-attempt","captureattempt","node:SourceDiscoveryRecord","SourceDiscoveryRecord"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:0591cfd78cb067c65c356564e5b51a624062085feb5e6f033166b5fc6ef91282"
---
# CaptureAttempt

Purpose: one bounded attempt by a tool to search, fetch, resolve or parse a source for a subject that left no complete capture: a failure (401/403/429, challenge page, timeout, licence wall, parser failure) or a partial capture (truncated page, image-only PDF, lossy rendition). These are the only non-captures the kernel cannot hold: a failed request leaves no SourceSnapshot (often no bytes at all) and no Assertion. An authoritative empty result (search count 0, 404 for an id the source issues) is NOT an attempt: its response is a COMPLETE kernel SourceSnapshot and the statement is the kernel's FIELD_NOT_REPORTED Assertion. K:CQ-AX-04 reads attempts to tell "unknown: blocked" (FAILED / PARTIAL attempts for the subject and tool) from "unknown: never queried" (no attempt, no snapshot). Q-D11-17 lists what failed in a mission's runs and, joined to the registry by toolId, which questions that left unanswerable. Lineage is the kernel's WAS_GENERATED_BY to the run's Activity (declared once on Activity.generated). The subject and the partial snapshot are uid properties, following the kernel precedent (revisesSnapshotUid, supersedesUid): no question traverses past them, and an attempt can concern a subject that is not a graph node yet (queryText only). Not Subjectable: nothing is asserted about an attempt. It is not a second lineage mechanism: it has no run identity of its own (R-41). Stored labels [CaptureAttempt, Occurrence], the K archetype, never :Entity (R-17). Absorbs pinned SourceDiscoveryRecord (W19). Identity rule: uid = hu:capture-attempt:<sha256(runId of the generating Activity | toolId | requestDigest | attemptedAt)>, enforced by the kernel uid uniqueness constraint (runId is not a property: for an immutable attempt lastWriterRunId equals it). requestDigest = sha256 over the normalized request (method, URI with credential parameters api_key / key / token / email removed, body). Immutable; a retry is a new attempt. Privacy: privacyClass is INTERNAL by default (R-41; the kernel PrivacyClass has PUBLIC and INTERNAL only). requestUri, queryText and errorText never carry credentials. When the request names a person (e.g. an NPPES name search), queryText and requestUri store only "sha256:<hex>" of the value. uid token: `capture-attempt` (hu:capture-attempt:<opaque>). Questions: Q-D11-17, CQ-AX-04, Q-D11-01, Q-D11-07, Q-D11-20.

## Identity

| | |
| --- | --- |
| id | `node:CaptureAttempt` · raw SDL [sdl:CaptureAttempt](../sdl/CaptureAttempt.graphql) |
| module / domain | [D11](../modules/D11.md) / [Sources, media, discourse and capture tooling](../domains/sources-documents-and-media.md) |
| uid | `hu:capture-attempt:<opaque>` |
| stored labels | `CaptureAttempt` `Occurrence` (primary `CaptureAttempt`) |
| archetype | Occurrence (implements Entity only; not Subjectable: nothing is asserted about an attempt). Stored labels [CaptureAttempt, Occurrence] per R-17: the :Entity label is only on Subjectable implementers and Identifier |
| interfaces | [Entity](../interfaces/Entity.md) |
| identity rule (register) | `uid` |
| identity keys | `uid`, `name` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (21)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D11.graphql:L92 |
| `uid` | `String!` | yes | create+update |  | D11.graphql:L93 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D11.graphql:L94 |
| `lastWriterRunId` | `String` |  | create+update |  | D11.graphql:L96 |
| `toolId` | `String!` | yes | create+update | Canonical action-space entry id (tooling/action-space.yaml), e.g. ctgov-v2-api, usda-fdc, firecrawl-cli; never a packet-local alias (the registry's t… | D11.graphql:L100 |
| `toolVersion` | `String` |  | create+update | Client, CLI, MCP server or API version used. | D11.graphql:L102 |
| `outcome` | [CaptureOutcome](../vocabularies/CaptureOutcome.md) | yes | create+update |  | D11.graphql:L103 |
| `failureKind` | [CaptureFailureKind](../vocabularies/CaptureFailureKind.md) |  | create+update | Set when outcome is PARTIAL or FAILED. | D11.graphql:L105 |
| `httpStatus` | `Int` |  | create+update | HTTP status when the transport is HTTP; 0 when no response arrived (returned, never filtered: failureKind is the filter). | D11.graphql:L107 |
| `requestUri` | `String` |  | create+update | Requested URI after normalization, credential parameters removed by the executor (never stores a key); person names replaced by their digest. | D11.graphql:L109 |
| `requestDigest` | `String!` | yes | create+update | sha256:<hex> over the normalized request; identity component. | D11.graphql:L111 |
| `queryText` | `String` |  | create+update | Search text or record id requested, as sent; sha256:<hex> only when it names a person (privacyClass INTERNAL). | D11.graphql:L113 |
| `subjectUid` | `String` |  | create+update | uid of the graph entity the attempt was made for, when one exists (indexed; CQ-AX-04 filters on it). | D11.graphql:L115 |
| `responseHash` | `String` |  | create+update | sha256:<hex> of the response bytes when any were received (identical error pages hash identically). | D11.graphql:L117 |
| `snapshotUid` | `String` |  | create+update | uid of the kernel SourceSnapshot (captureCompleteness PARTIAL_EXCERPT) that keeps the bytes of a PARTIAL attempt; null for FAILED. | D11.graphql:L119 |
| `retryAfterSeconds` | `Int` |  | create+update | Server-advised wait (Retry-After) for RATE_LIMITED / QUOTA_EXHAUSTED. | D11.graphql:L121 |
| `attemptedAt` | `DateTime!` | yes | create+update | When the request was sent. | D11.graphql:L123 |
| `errorText` | `String` |  | create+update | Short verbatim error text from the source or client (no credentials, no personal data: person names replaced by their digest). | D11.graphql:L125 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D11.graphql:L97 |
| `updatedAt` | `DateTime` |  | create+update |  | D11.graphql:L98 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D11.graphql:L95 |

## Outgoing relationships (1)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:CaptureAttempt --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (0)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

(none)

## Legal predicates (0)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

(none)

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- CaptureAttempt does not implement Subjectable: no Assertion takes it as subject; its records carry lineage through `WAS_GENERATED_BY`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (2)

- [K/CQ-AX-04](../patterns/K/CQ-AX-04.md) (supported; CQ-AX-04)
- [K/Q-K-23](../patterns/K/Q-K-23.md) (supported; Q-K-23)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`
- Policy: create only (immutable; a retry is a new attempt); never update or delete
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:SourceDiscoveryRecord` (renamed): K: D11.CaptureAttempt (A8; lineage through the kernel WAS_GENERATED_BY) ‖ D11: D11.CaptureAttempt

## Source definition

- `release:sdl/modules/D11.graphql#L88-L126`
- `release:registers/node-register.yaml#CaptureAttempt`
- `release:workspace-inputs/identity-rules.yaml#CaptureAttempt`
