---
id: "edge:ControlEdgeProperties"
kind: "edge-properties"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L114-L128"]
aliases: ["control edge properties"]
capabilities: ["get"]
cardDigest: "sha256:5362c2ca46cd097c5e630f2ecdc42502b86b1cb40504917385b2cbc586029e4e"
---
# Edge properties ControlEdgeProperties

PARENT_OF episode: AssertedEdgeProperties plus `controlKind` (consolidation, wholly owned, general partner, group membership as stated) and the stated ownership percent when the source gives one with the control fact.

| | |
| --- | --- |
| id | `edge:ControlEdgeProperties` · raw SDL [sdl:ControlEdgeProperties](../sdl/ControlEdgeProperties.graphql) |
| module | [D7](../modules/D7.md) |
| used by relationship types | [PARENT_OF](../relationships/PARENT_OF.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |

## Properties (13)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | D7.graphql:L115 |
| `assertionUid` | `String!` | yes | create+update |  | D7.graphql:L116 |
| `validFrom` | `DateTime` |  | create+update |  | D7.graphql:L117 |
| `validTo` | `DateTime` |  | create+update |  | D7.graphql:L118 |
| `validFromPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D7.graphql:L119 |
| `validToPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D7.graphql:L120 |
| `validFromBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | D7.graphql:L121 |
| `validToBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | D7.graphql:L122 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | D7.graphql:L123 |
| `recordedTo` | `DateTime` |  | create+update |  | D7.graphql:L124 |
| `lastWriterRunId` | `String` |  | create+update |  | D7.graphql:L125 |
| `controlKind` | [ControlKind](../vocabularies/ControlKind.md) | yes | create+update |  | D7.graphql:L126 |
| `stakePercent` | `Float` |  | create+update |  | D7.graphql:L127 |

## Declared on (1 fields)

- [Organization](../nodes/Organization.md).`subsidiaries` ([PARENT_OF](../relationships/PARENT_OF.md))

## Source definition

- `release:sdl/modules/D7.graphql#L114-L128`
