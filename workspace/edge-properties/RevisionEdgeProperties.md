---
id: "edge:RevisionEdgeProperties"
kind: "edge-properties"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L381-L388"]
aliases: ["revision edge properties"]
capabilities: ["get"]
cardDigest: "sha256:2f8cab54812c99693cef162a12258970adc881bcbd4962c2cc5b5e59034a6f56"
---
# Edge properties RevisionEdgeProperties

REVISES episode: AssertedRecordedProperties fields verbatim (no question reads its valid time; the notice date is the revising Publication's publishedAt and the Assertion's valid time) plus the revision kind as this asserter states it, so that one notice labelled 'retraction' by Retraction Watch and 'erratum' by the publisher stays two typed, filterable episodes (CQ-EV-05). The asserter's stated reasons are `Assertion.qualifiers` `reason:<text>`, not an edge field. revisionKind uses the kernel enum SourceRevisionKind (one vocabulary with the kernel's HAS_REVISION_STATUS convention): publisher 'erratum' / correction -> ERRATUM; preprint -> journal version and review pub1 -> pub2 -> NEW_VERSION (the two ends' publicationKind tell them apart). REVISES is recorded when the revising work is identified (a notice or newer version with a DOI or PMID), one episode per asserter; a status flag without an identified notice (OpenAlex is_retracted) is a kernel HAS_REVISION_STATUS Assertion, not a REVISES episode, and one (asserter, notice) is never recorded both ways (R-44).

| | |
| --- | --- |
| id | `edge:RevisionEdgeProperties` · raw SDL [sdl:RevisionEdgeProperties](../sdl/RevisionEdgeProperties.graphql) |
| module | [D3](../modules/D3.md) |
| used by relationship types | [REVISES](../relationships/REVISES.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |

## Properties (6)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | D3.graphql:L382 |
| `assertionUid` | `String!` | yes | create+update |  | D3.graphql:L383 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | D3.graphql:L384 |
| `recordedTo` | `DateTime` |  | create+update |  | D3.graphql:L385 |
| `lastWriterRunId` | `String` |  | create+update |  | D3.graphql:L386 |
| `revisionKind` | [SourceRevisionKind](../vocabularies/SourceRevisionKind.md) | yes | create+update |  | D3.graphql:L387 |

## Declared on (1 fields)

- [Publication](../nodes/Publication.md).`revises` ([REVISES](../relationships/REVISES.md))

## Source definition

- `release:sdl/modules/D3.graphql#L381-L388`
