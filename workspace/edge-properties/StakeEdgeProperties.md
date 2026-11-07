---
id: "edge:StakeEdgeProperties"
kind: "edge-properties"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L67-L85"]
aliases: ["stake edge properties"]
capabilities: ["get"]
cardDigest: "sha256:39ea67b39445245702dccb2c0122caa29eb5abb8710c6528b598cf20e82b61ec"
---
# Edge properties StakeEdgeProperties

HOLDS_STAKE episode: AssertedEdgeProperties plus the ownership qualifiers. `stakePercent` only as stated by the source (never computed; a computed share is a CALCULATED Assertion); `stakeBand` when the source gives a statutory band or a threshold instead of a number; `ownershipBasis` keeps "may be deemed" apart from record ownership; voting and dispositive power as stated. Investment is not control (control is PARENT_OF) and "investor" without an instrument is INVESTOR_UNSPECIFIED, never EQUITY. The class or holding as printed ("1,269,072 shares of common stock", "E", "I") is the authorizing Assertion's qualifier `stakeClass:` (R-30).

| | |
| --- | --- |
| id | `edge:StakeEdgeProperties` · raw SDL [sdl:StakeEdgeProperties](../sdl/StakeEdgeProperties.graphql) |
| module | [D7](../modules/D7.md) |
| used by relationship types | [HOLDS_STAKE](../relationships/HOLDS_STAKE.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |

## Properties (17)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | D7.graphql:L68 |
| `assertionUid` | `String!` | yes | create+update |  | D7.graphql:L69 |
| `validFrom` | `DateTime` |  | create+update |  | D7.graphql:L70 |
| `validTo` | `DateTime` |  | create+update |  | D7.graphql:L71 |
| `validFromPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D7.graphql:L72 |
| `validToPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D7.graphql:L73 |
| `validFromBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | D7.graphql:L74 |
| `validToBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | D7.graphql:L75 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | D7.graphql:L76 |
| `recordedTo` | `DateTime` |  | create+update |  | D7.graphql:L77 |
| `lastWriterRunId` | `String` |  | create+update |  | D7.graphql:L78 |
| `stakeKind` | [StakeKind](../vocabularies/StakeKind.md) | yes | create+update |  | D7.graphql:L79 |
| `stakePercent` | `Float` |  | create+update |  | D7.graphql:L80 |
| `stakeBand` | [StakeBand](../vocabularies/StakeBand.md) |  | create+update |  | D7.graphql:L81 |
| `ownershipBasis` | [OwnershipBasis](../vocabularies/OwnershipBasis.md) |  | create+update |  | D7.graphql:L82 |
| `votingPower` | [HoldingPower](../vocabularies/HoldingPower.md) |  | create+update |  | D7.graphql:L83 |
| `dispositivePower` | [HoldingPower](../vocabularies/HoldingPower.md) |  | create+update |  | D7.graphql:L84 |

## Declared on (2 fields)

- [Organization](../nodes/Organization.md).`holdsStakes` ([HOLDS_STAKE](../relationships/HOLDS_STAKE.md))
- [Person](../nodes/Person.md).`holdsStakes` ([HOLDS_STAKE](../relationships/HOLDS_STAKE.md))

## Source definition

- `release:sdl/modules/D7.graphql#L67-L85`
