---
id: "node:SourceLocator"
kind: "node"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L631-L669","release:registers/node-register.yaml#SourceLocator","release:workspace-inputs/identity-rules.yaml#SourceLocator"]
aliases: ["source locator","locator","sourcelocator","node:FigurePanel","node:MediaAnnotation","node:Mention","node:ProductLabelRegion","FigurePanel","MediaAnnotation","Mention","ProductLabelRegion"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:c15f554b3ec9eae4fc6cd14c5cf13d7042501e56260a46c7bfbdeca4ec983a40"
---
# SourceLocator

Purpose: reproducible selector for the exact span, cell, page region, JSON pointer or media time range of one SourceSnapshot (verification.v1 SourceFragment + selector), the only evidence currency of the graph. A Chunk is never a locator. Identity rule: (snapshot, selectorKind, selectorDigest). uid token: `locator`. Immutable; a newer snapshot gets a new locator (`reanchorsLocatorUid` names the one it re-finds). Questions: Q-K-01, Q-K-10, Q-K-13, Q-K-14, Q-K-20.

## Identity

| | |
| --- | --- |
| id | `node:SourceLocator` · raw SDL [sdl:SourceLocator](../sdl/SourceLocator.graphql) |
| module / domain | [K](../modules/K.md) / [Kernel, identity, time and provenance](../domains/kernel-and-provenance.md) |
| uid | `hu:locator:<opaque>` |
| stored labels | `SourceLocator` `InformationArtifact` (primary `SourceLocator`) |
| archetype | InformationArtifact |
| interfaces | [Entity](../interfaces/Entity.md) |
| identity rule (register) | `snapshot` + `selectorKind` + `selectorDigest` |
| identity keys | `uid`, `name`, `selectorKind`, `selectorDigest` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (22)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | kernel.graphql:L635 |
| `uid` | `String!` | yes | create+update |  | kernel.graphql:L636 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | kernel.graphql:L637 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L639 |
| `selectorKind` | [SelectorKind](../vocabularies/SelectorKind.md) | yes | create+update |  | kernel.graphql:L642 |
| `selectorDigest` | `String!` | yes | create+update | sha256:<hex> over the canonical JSON of the verification.v1 selector; identity with the snapshot. | kernel.graphql:L644 |
| `selectorJson` | `String!` | yes | create+update | Canonical JSON of the full verification.v1 selector (offset basis, normalization, table cell, JSON pointer, bbox); `basis` (projection id@version) is… | kernel.graphql:L646 |
| `exact` | `String` |  | create+update | Verbatim selected text (TextQuoteSelector.exact) when textual. | kernel.graphql:L648 |
| `prefix` | `String` |  | create+update |  | kernel.graphql:L649 |
| `suffix` | `String` |  | create+update |  | kernel.graphql:L650 |
| `quoteHash` | `String` |  | create+update | sha256:<hex> of exact after normalization. | kernel.graphql:L652 |
| `startOffset` | `Int` |  | create+update |  | kernel.graphql:L653 |
| `endOffset` | `Int` |  | create+update |  | kernel.graphql:L654 |
| `page` | `Int` |  | create+update | 1-based page (PDF_TEXT, BOUNDING_BOX). | kernel.graphql:L656 |
| `mediaStartSeconds` | `Float` |  | create+update | Media time on the captured rendition's own timeline (MEDIA_TIMECODE). | kernel.graphql:L658 |
| `mediaEndSeconds` | `Float` |  | create+update |  | kernel.graphql:L659 |
| `speakerLabelInSource` | `String` |  | create+update | Speaker label printed beside the span (what the source printed, not attribution). | kernel.graphql:L661 |
| `reanchorsLocatorUid` | `String` |  | create+update | uid of the older-snapshot locator this one re-finds (exact or fuzzy, in reanchorMatch). | kernel.graphql:L663 |
| `reanchorMatch` | `String` |  | create+update |  | kernel.graphql:L664 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | kernel.graphql:L640 |
| `updatedAt` | `DateTime` |  | create+update |  | kernel.graphql:L641 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | kernel.graphql:L638 |

## Outgoing relationships (1)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:SourceLocator --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (6)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [COVERS_LOCATOR](../relationships/COVERS_LOCATOR.md) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.locators (OUT) | read-only |
| [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | [Adjudication](Adjudication.md) | structural | recorded-only | [EvidenceEdgeProperties](../edge-properties/EvidenceEdgeProperties.md) | Adjudication.evidence (OUT) | planner-emitted (kernel plumbing) |
| [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | [Assertion](Assertion.md) | structural | recorded-only | [EvidenceEdgeProperties](../edge-properties/EvidenceEdgeProperties.md) | Assertion.evidence (OUT) | planner-emitted (kernel plumbing) |
| [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | [Assessment](Assessment.md) | structural | recorded-only | [EvidenceEdgeProperties](../edge-properties/EvidenceEdgeProperties.md) | Assessment.evidence (OUT) | planner-emitted (kernel plumbing) |
| [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | [Report](Report.md) | structural | recorded-only | [EvidenceEdgeProperties](../edge-properties/EvidenceEdgeProperties.md) | Report.evidence (OUT) | planner-emitted (kernel plumbing) |
| [HAS_LOCATOR](../relationships/HAS_LOCATOR.md) | [SourceSnapshot](SourceSnapshot.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | SourceLocator.snapshot (IN) | planner-emitted (kernel plumbing) |

## Legal predicates (0)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

(none)

## Evidence path

- Provenance requirement: captured bytes: SourceSnapshot contentHash and capture Activity; locators reference exactly one snapshot; reports cite locators
- SourceLocator does not implement Subjectable: no Assertion takes it as subject; its records carry lineage through `WAS_GENERATED_BY`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (84)

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
- … 64 more: `bks-schema find --kind pattern --label SourceLocator`

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`
- Policy: create only (immutable)
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [What do we already know about X? (run before every research mission)](../tasks/what-do-we-know-about-entity.md)
- [Should I update an existing node or create a new one?](../tasks/decide-update-or-create.md)
- [Trace an assertion to its source span and adjudication](../tasks/trace-answer-to-source.md)
- [Stage something you found but cannot resolve or place](../tasks/stage-unresolved-mention.md)
- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)

## v1 navigation aliases

- `node:SourceLocator` is unchanged from v1.
- `node:FigurePanel` (merged): D9: K.SourceLocator (BOUNDING_BOX) on an IMAGE work's rendition
- `node:MediaAnnotation` (merged): D9: K.SourceLocator (BOUNDING_BOX / MEDIA_TIMECODE selector)
- `node:Mention` (merged): K: K.SourceLocator (the surface-form span) + K.Assessment RESOLUTION (surfaceForm / normalizedForm / typeHint in facets); derived D9 Chunk MENTIONS
- `node:ProductLabelRegion` (merged): D9: K.SourceLocator on a D6 label snapshot (deferred as a type)

## Source definition

- `release:sdl/modules/kernel.graphql#L631-L669`
- `release:registers/node-register.yaml#SourceLocator`
- `release:workspace-inputs/identity-rules.yaml#SourceLocator`
