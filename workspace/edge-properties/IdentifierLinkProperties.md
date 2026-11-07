---
id: "edge:IdentifierLinkProperties"
kind: "edge-properties"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L138-L151"]
aliases: ["identifier link properties"]
capabilities: ["get"]
cardDigest: "sha256:5b72b10f54c92e7eaf0b65fd4d44fef3ae073318f2c1a5d845b2758dd35eacd9"
---
# Edge properties IdentifierLinkProperties

Kernel-internal. HAS_IDENTIFIER episode: every AssertedEdgeProperties field verbatim and in order, then `isPrimary` (the verbatim-base-prefix rule of 09-reasoning applies to kernel types too). The validity of the ASSIGNMENT of an identifier to a record lives here; the Identifier node holds only the string's own scheme-level validity.

| | |
| --- | --- |
| id | `edge:IdentifierLinkProperties` · raw SDL [sdl:IdentifierLinkProperties](../sdl/IdentifierLinkProperties.graphql) |
| module | [K](../modules/K.md) |
| used by relationship types | [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |

## Properties (12)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | kernel.graphql:L139 |
| `assertionUid` | `String!` | yes | create+update |  | kernel.graphql:L140 |
| `validFrom` | `DateTime` |  | create+update |  | kernel.graphql:L141 |
| `validTo` | `DateTime` |  | create+update |  | kernel.graphql:L142 |
| `validFromPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | kernel.graphql:L143 |
| `validToPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | kernel.graphql:L144 |
| `validFromBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | kernel.graphql:L145 |
| `validToBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | kernel.graphql:L146 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | kernel.graphql:L147 |
| `recordedTo` | `DateTime` |  | create+update |  | kernel.graphql:L148 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L149 |
| `isPrimary` | `Boolean` |  | create+update |  | kernel.graphql:L150 |

## Declared on (1 fields)

- [Identifier](../nodes/Identifier.md).`identifies` ([HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md))

## Source definition

- `release:sdl/modules/kernel.graphql#L138-L151`
