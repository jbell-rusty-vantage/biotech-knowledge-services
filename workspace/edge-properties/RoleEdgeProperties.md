---
id: "edge:RoleEdgeProperties"
kind: "edge-properties"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L44-L57"]
aliases: ["role edge properties"]
capabilities: ["get"]
cardDigest: "sha256:8c676d04b39fc6f6db2a18eb88d4b21b6f73b43c5c8264e765c026d71de4fbae"
---
# Edge properties RoleEdgeProperties

HOLDS_ROLE episode: AssertedEdgeProperties plus the role qualifier. `roleKind` is the normalized role; the title or code exactly as printed ("B", "Director", "paid advisor", "Chief Executive Officer") is the authorizing Assertion's qualifier `roleText:` (R-30: a field that only reproduces the source's wording stays on the Assertion). When no bound is stated, the bounds stay null (basis OBSERVATION_ONLY / PUBLICATION_PROXY) and the date at which the source states the role held (table as-of date, filing signature date, revision date of a present-tense statement) is the authorizing Assertion's `validObservedAt`, read through `assertionUid`.

| | |
| --- | --- |
| id | `edge:RoleEdgeProperties` · raw SDL [sdl:RoleEdgeProperties](../sdl/RoleEdgeProperties.graphql) |
| module | [D7](../modules/D7.md) |
| used by relationship types | [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |

## Properties (12)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | D7.graphql:L45 |
| `assertionUid` | `String!` | yes | create+update |  | D7.graphql:L46 |
| `validFrom` | `DateTime` |  | create+update |  | D7.graphql:L47 |
| `validTo` | `DateTime` |  | create+update |  | D7.graphql:L48 |
| `validFromPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D7.graphql:L49 |
| `validToPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D7.graphql:L50 |
| `validFromBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | D7.graphql:L51 |
| `validToBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | D7.graphql:L52 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | D7.graphql:L53 |
| `recordedTo` | `DateTime` |  | create+update |  | D7.graphql:L54 |
| `lastWriterRunId` | `String` |  | create+update |  | D7.graphql:L55 |
| `roleKind` | [OrgRoleKind](../vocabularies/OrgRoleKind.md) | yes | create+update |  | D7.graphql:L56 |

## Declared on (1 fields)

- [Person](../nodes/Person.md).`holdsRoles` ([HOLDS_ROLE](../relationships/HOLDS_ROLE.md))

## Source definition

- `release:sdl/modules/D7.graphql#L44-L57`
