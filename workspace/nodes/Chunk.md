---
id: "node:Chunk"
kind: "node"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D9.graphql#L298-L354","release:registers/node-register.yaml#Chunk","release:workspace-inputs/identity-rules.yaml#Chunk"]
aliases: ["chunk","node:DocumentTextVersion","node:Segmentation","DocumentTextVersion","Segmentation"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:5eb2f473ac2e2a03ad27c549c90b9bb0fec6ecf2787495a78ff80db211d30205"
---
# Chunk

Purpose: a derived retrieval unit — a span of the text extracted from one captured SourceSnapshot (publisher transcript, caption track, ASR, OCR, HTML or PDF text) with its embedding — used only to find text for a question (vector or fulltext index) and to hop to the located assertions it covers (COVERS_LOCATOR) and the entities it mentions (MENTIONS). Never evidence, never a locator, never a mutation input (00-DIRECTIVE 3.8). Absorbs the pinned DocumentTextVersion (→ textBasis, textVersionHash, extractorVersion, textReviewNote) and Segmentation (→ chunkerVersion) as properties, and the pinned NEXT_CHUNK (→ chunkIndex), HAS_CHUNK / FROM_TEXT_VERSION / TEXT_OF_SNAPSHOT (→ CHUNK_OF). The embedding vector is a store property read by the vector index, not a GraphQL field. Identity rule: (snapshot, textVersionHash, chunkerVersion, chunkIndex). Chunks are projection output (kernel rule for derived structure): a new chunkerVersion or text version makes the projection Activity write new chunks and delete the old ones; nothing is closed or edited, so there is no recordedTo. uid token: `chunk` (hu:chunk:<opaque>). Questions: Q-D9-20, Q-D9-16, CQ-PV-04.

## Identity

| | |
| --- | --- |
| id | `node:Chunk` · raw SDL [sdl:Chunk](../sdl/Chunk.graphql) |
| module / domain | [D9](../modules/D9.md) / [Sources, media, discourse and capture tooling](../domains/sources-documents-and-media.md) |
| uid | `hu:chunk:<opaque>` |
| stored labels | `Chunk` (primary `Chunk`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md) |
| identity rule (register) | `snapshot` + `textVersionHash` + `chunkerVersion` + `chunkIndex` |
| identity keys | `uid`, `name`, `textVersionHash`, `chunkerVersion`, `chunkIndex` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (26)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D9.graphql:L302 |
| `uid` | `String!` | yes | create+update |  | D9.graphql:L303 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D9.graphql:L304 |
| `lastWriterRunId` | `String` |  | create+update |  | D9.graphql:L306 |
| `text` | `String!` | yes | create+update | The chunk text (normalized per normalizationVersion). | D9.graphql:L310 |
| `chunkIndex` | `Int!` | yes | create+update | 0-based order within its text version (replaces NEXT_CHUNK). | D9.graphql:L312 |
| `startOffset` | `Int!` | yes | create+update | [startOffset, endOffset) in the text version, in the offset basis of normalizationVersion. | D9.graphql:L314 |
| `endOffset` | `Int!` | yes | create+update |  | D9.graphql:L315 |
| `mediaStartSeconds` | `Float` |  | create+update | Media time on the rendition's own timeline when the text carries cue times. | D9.graphql:L317 |
| `mediaEndSeconds` | `Float` |  | create+update |  | D9.graphql:L318 |
| `speakerLabelsInSource` | `[String!]` |  | create+update | Speaker labels printed inside the span, in order (what the source printed, not attribution). | D9.graphql:L320 |
| `textBasis` | [TextBasis](../vocabularies/TextBasis.md) | yes | create+update |  | D9.graphql:L321 |
| `textVersionHash` | `String!` | yes | create+update | sha256:<hex> of the full extracted text the offsets refer to (the pinned DocumentTextVersion identity). | D9.graphql:L323 |
| `extractorVersion` | `String!` | yes | create+update | Extractor and version that produced the text (e.g. firecrawl-markdown/1.23, whisper-large-v3, tesseract/5). | D9.graphql:L325 |
| `normalizationVersion` | `String!` | yes | create+update | Text normalization applied before offsets were counted (NFC, NBSP and thin-space handling). | D9.graphql:L327 |
| `chunkerVersion` | `String!` | yes | create+update | Chunking configuration digest or name@version (the pinned Segmentation). | D9.graphql:L329 |
| `tokenCount` | `Int` |  | create+update |  | D9.graphql:L332 |
| `textReviewNote` | `String` |  | create+update | Publisher caveat on the text as captured ('This transcript is currently under human review and may contain errors.'). | D9.graphql:L334 |
| `workUid` | `String` |  | create+update | Denormalized filter keys for in-index vector filtering (written by the chunker from the CHUNK_OF → Source → RENDITION_OF → PUBLISHES path, and re-sta… | D9.graphql:L336 |
| `channelUid` | `String` |  | create+update |  | D9.graphql:L337 |
| `publishedAt` | `DateTime` |  | create+update |  | D9.graphql:L338 |
| `language` | `String` |  | create+update |  | D9.graphql:L339 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D9.graphql:L307 |
| `updatedAt` | `DateTime` |  | create+update |  | D9.graphql:L308 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D9.graphql:L305 |

### Search (derived, never evidence)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `embeddingModel` | `String` |  | create+update | Embedding model of the stored vector (e.g. text-embedding-3-small@1536). | D9.graphql:L331 |

## Outgoing relationships (4)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Chunk --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [CHUNK_OF](../relationships/CHUNK_OF.md) | [SourceSnapshot](SourceSnapshot.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Chunk.snapshot (OUT) | `edge.structural` |
| [COVERS_LOCATOR](../relationships/COVERS_LOCATOR.md) | [SourceLocator](SourceLocator.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.locators (OUT) | read-only |
| [MENTIONS](../relationships/MENTIONS.md) | [Subjectable](../interfaces/Subjectable.md) (56 members) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (0)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

(none)

## Legal predicates (0)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

(none)

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Chunk does not implement Subjectable: no Assertion takes it as subject; its records carry lineage through `WAS_GENERATED_BY`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (8)

- [D9/CQ-PV-04](../patterns/D9/CQ-PV-04.md) (supported; CQ-PV-04)
- [D9/Q-D9-20#entity](../patterns/D9/Q-D9-20--entity.md) (supported; Q-D9-20)
- [D9/Q-D9-20#vector](../patterns/D9/Q-D9-20--vector.md) (unsupported; Q-D9-20)
- [K/CQ-AX-04](../patterns/K/CQ-AX-04.md) (supported; CQ-AX-04)
- [K/Q-K-23](../patterns/K/Q-K-23.md) (supported; Q-K-23)
- [QP/P-04b](../patterns/QP/P-04b.md) (supported; Q-D10-17, Q-D11-03, Q-D13-05, Q-D9-21, Q-K-14)
- [QP/P-04e](../patterns/QP/P-04e.md) (supported; Q-D10-17, Q-D11-03, Q-D13-05, Q-D9-21, Q-K-14)
- [QP/P-10b](../patterns/QP/P-10b.md) (supported; Q-K-03, Q-K-04, Q-K-05, Q-K-06, Q-K-07)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `delete`
- Policy: create; delete
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:Chunk` is unchanged from v1.
- `node:DocumentTextVersion` (merged): K: D9.Chunk properties (textVersionHash, extractorVersion) ‖ D9: Chunk properties (textBasis, textVersionHash, extractorVersion, normalizationVersion)
- `node:Segmentation` (merged): K: D9.Chunk.chunkerVersion ‖ D9: Chunk.chunkerVersion

## Source definition

- `release:sdl/modules/D9.graphql#L298-L354`
- `release:registers/node-register.yaml#Chunk`
- `release:workspace-inputs/identity-rules.yaml#Chunk`
