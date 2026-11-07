---
id: "edge:ValueEdgeProperties"
kind: "edge-properties"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L92-L108"]
aliases: ["value edge properties"]
capabilities: ["get"]
cardDigest: "sha256:ee10074218f52397c93757a156f2bd7548a773988900ba7a9dfadb366b3cb175"
---
# Edge properties ValueEdgeProperties

RECEIVES_VALUE_FROM episode: AssertedEdgeProperties plus what was received. `amount` and `unitCode` (kernel convention `iso4217:<CODE>`, R-30) only when stated; `valueBucket` is a source's own bucket verbatim (e.g. an institution's FCOI value range). A regulator's hedged finding ("It appears that ... paid ...") keeps its modality on the authorizing Assertion, not here.

| | |
| --- | --- |
| id | `edge:ValueEdgeProperties` · raw SDL [sdl:ValueEdgeProperties](../sdl/ValueEdgeProperties.graphql) |
| module | [D7](../modules/D7.md) |
| used by relationship types | [RECEIVES_VALUE_FROM](../relationships/RECEIVES_VALUE_FROM.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |

## Properties (15)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | D7.graphql:L93 |
| `assertionUid` | `String!` | yes | create+update |  | D7.graphql:L94 |
| `validFrom` | `DateTime` |  | create+update |  | D7.graphql:L95 |
| `validTo` | `DateTime` |  | create+update |  | D7.graphql:L96 |
| `validFromPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D7.graphql:L97 |
| `validToPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D7.graphql:L98 |
| `validFromBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | D7.graphql:L99 |
| `validToBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | D7.graphql:L100 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | D7.graphql:L101 |
| `recordedTo` | `DateTime` |  | create+update |  | D7.graphql:L102 |
| `lastWriterRunId` | `String` |  | create+update |  | D7.graphql:L103 |
| `valueKind` | [ValueTransferKind](../vocabularies/ValueTransferKind.md) | yes | create+update |  | D7.graphql:L104 |
| `amount` | `Float` |  | create+update |  | D7.graphql:L105 |
| `unitCode` | `String` |  | create+update |  | D7.graphql:L106 |
| `valueBucket` | `String` |  | create+update |  | D7.graphql:L107 |

## Declared on (1 fields)

- [Person](../nodes/Person.md).`receivesValueFrom` ([RECEIVES_VALUE_FROM](../relationships/RECEIVES_VALUE_FROM.md))

## Source definition

- `release:sdl/modules/D7.graphql#L92-L108`
