---
id: "node:SourceSnapshot"
kind: "node"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L580-L622","release:registers/node-register.yaml#SourceSnapshot","release:workspace-inputs/identity-rules.yaml#SourceSnapshot"]
aliases: ["source snapshot","snapshot","sourcesnapshot","node:SourceRevisionEvent","SourceRevisionEvent"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:72eb7b3ac5bfb5d65826602e18cc414ec4f1c5e61dd9040665a8b90e466e719e"
---
# SourceSnapshot

Purpose: immutable capture of a Source at a retrieval time (verification.v1 VerificationSourceCapture): the bytes that every claim must trace to. Identity rule: (source, contentHash, retrievedAt); a changed page is a new snapshot, never an edit. uid token: `snapshot`. Clocks: `retrievedAt` (BellLabs fetched; lower bound of any citing assertion's recordedAt), `observedAt` (known displayed), `publishedAt` (issuer time). A publisher revision (retraction, erratum) is recorded on the later snapshot (`revisionKind`, `revisesSnapshotUid`). Questions: Q-K-01, Q-K-02, Q-K-10, Q-K-20.

## Identity

| | |
| --- | --- |
| id | `node:SourceSnapshot` · raw SDL [sdl:SourceSnapshot](../sdl/SourceSnapshot.graphql) |
| module / domain | [K](../modules/K.md) / [Kernel, identity, time and provenance](../domains/kernel-and-provenance.md) |
| uid | `hu:snapshot:<opaque>` |
| stored labels | `SourceSnapshot` `InformationArtifact` (primary `SourceSnapshot`) |
| archetype | InformationArtifact |
| interfaces | [Entity](../interfaces/Entity.md) |
| identity rule (register) | `source` + `contentHash` + `retrievedAt` |
| identity keys | `uid`, `name`, `contentHash`, `retrievedAt` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (21)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | kernel.graphql:L584 |
| `uid` | `String!` | yes | create+update |  | kernel.graphql:L585 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | kernel.graphql:L586 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L588 |
| `retrievedAt` | `DateTime!` | yes | create+update | When BellLabs fetched the bytes. | kernel.graphql:L592 |
| `observedAt` | `DateTime` |  | create+update | When the content is known to have been displayed (archive capture time for a late source). | kernel.graphql:L594 |
| `publishedAt` | `DateTime` |  | create+update | Issuer's date for this version. | kernel.graphql:L596 |
| `contentHash` | `String!` | yes | create+update | sha256:<hex> of the captured artifact (verification.v1 contentArtifact digest); snapshot identity. | kernel.graphql:L598 |
| `contentHashBasis` | `String!` | yes | create+update | Input of contentHash (R-35): RAW_BYTES \| CANONICAL_PROJECTION (a registered projection id@version over stored raw bytes) \| TOOL_RENDITION (Firecrawl… | kernel.graphql:L600 |
| `canonicalProjectionHash` | `String` |  | create+update | sha256:<hex> of the canonical projection artifact when the verifier registered one; change detection across snapshots, not identity (R-37). | kernel.graphql:L602 |
| `captureMethod` | `String` |  | create+update | verification.v1 captureMethod and version, e.g. firecrawl-scrape/2. | kernel.graphql:L604 |
| `captureCompleteness` | `String` |  | create+update | COMPLETE \| PARTIAL_EXCERPT \| UNKNOWN; partial captures never support absence claims. | kernel.graphql:L606 |
| `storageUri` | `String` |  | create+update | Durable object-store key of the bytes (internal; R-37). | kernel.graphql:L608 |
| `archiveUri` | `String` |  | create+update | External archive copy (web archive URI). | kernel.graphql:L610 |
| `mimeType` | `String` |  | create+update |  | kernel.graphql:L611 |
| `language` | `String` |  | create+update | BCP 47 language tag. | kernel.graphql:L613 |
| `revisionKind` | [SourceRevisionKind](../vocabularies/SourceRevisionKind.md) |  | create+update | Publisher revision this snapshot records, if any (capture cache; the authority is the REVISES episode or HAS_REVISION_STATUS Assertion, R-44). | kernel.graphql:L615 |
| `revisesSnapshotUid` | `String` |  | create+update | uid of the earlier snapshot this one revises (retraction notice, new version). | kernel.graphql:L617 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | kernel.graphql:L589 |
| `updatedAt` | `DateTime` |  | create+update |  | kernel.graphql:L590 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | kernel.graphql:L587 |

## Outgoing relationships (2)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:SourceSnapshot --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_LOCATOR](../relationships/HAS_LOCATOR.md) | [SourceLocator](SourceLocator.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | SourceLocator.snapshot (IN) | planner-emitted (kernel plumbing) |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (2)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [CHUNK_OF](../relationships/CHUNK_OF.md) | [Chunk](Chunk.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Chunk.snapshot (OUT) | `edge.structural` |
| [HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md) | [Source](Source.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Source.snapshots (OUT); SourceSnapshot.source (IN) | planner-emitted (kernel plumbing) |

## Legal predicates (0)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

(none)

## Evidence path

- Provenance requirement: captured bytes: SourceSnapshot contentHash and capture Activity; locators reference exactly one snapshot; reports cite locators
- SourceSnapshot does not implement Subjectable: no Assertion takes it as subject; its records carry lineage through `WAS_GENERATED_BY`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (78)

- [D1/CQ-ID-03](../patterns/D1/CQ-ID-03.md) (supported; CQ-ID-03)
- [D1/CQ-ID-04](../patterns/D1/CQ-ID-04.md) (supported; CQ-ID-04)
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported; CQ-PF-01)
- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported; Q-D1-16)
- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported; Q-D10-03)
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported; Q-D10-08)
- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported; Q-D10-21)
- [D11/CQ-PV-05](../patterns/D11/CQ-PV-05.md) (supported; CQ-PV-05)
- [D11/Q-D11-05](../patterns/D11/Q-D11-05.md) (supported; Q-D11-05)
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported; Q-D11-08)
- [D11/Q-D11-19](../patterns/D11/Q-D11-19.md) (supported; Q-D11-19)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported; Q-D12-18)
- [D13/Q-D13-04#1](../patterns/D13/Q-D13-04--1.md) (supported; Q-D13-04)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported; Q-D13-12)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported; Q-D13-14)
- [D13/Q-D13-22#1](../patterns/D13/Q-D13-22--1.md) (supported; Q-D13-22)
- [D2/Q-D2-10](../patterns/D2/Q-D2-10.md) (supported; Q-D2-10)
- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported; Q-D2-18)
- [D3/CQ-EV-05#1](../patterns/D3/CQ-EV-05--1.md) (supported; CQ-EV-05)
- [D3/CQ-EV-05#2](../patterns/D3/CQ-EV-05--2.md) (supported; CQ-EV-05)
- … 58 more: `bks-schema find --kind pattern --label SourceSnapshot`

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`
- Policy: create only (immutable)
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Trace an assertion to its source span and adjudication](../tasks/trace-answer-to-source.md)

## v1 navigation aliases

- `node:SourceSnapshot` is unchanged from v1.
- `node:SourceRevisionEvent` (merged): K: K.SourceSnapshot.revisionKind + revisesSnapshotUid (capture cache); identified notice = D3 REVISES; status flag per authority without a notice = HAS_REVISIO…

## Source definition

- `release:sdl/modules/kernel.graphql#L580-L622`
- `release:registers/node-register.yaml#SourceSnapshot`
- `release:workspace-inputs/identity-rules.yaml#SourceSnapshot`
