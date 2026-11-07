---
id: "edge:StudyRoleEdgeProperties"
kind: "edge-properties"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L354-L367"]
aliases: ["study role edge properties"]
capabilities: ["get"]
cardDigest: "sha256:f3d3bfabe69452b4f11c4e8e715f24eb8482044f1e0c0010dbd3431983282d50"
---
# Edge properties StudyRoleEdgeProperties

HAS_STUDY_ROLE episode: AssertedEdgeProperties fields verbatim (bitemporal, one authorizing Assertion) plus the role a question filters on (Q-D3-08, Q-D3-09, D7 Q-D7-05). Valid time is read (sponsors and funders change; a registry's own record correction, e.g. ISRCTN removing Bayer as funder on 22/08/2018, is record time: it supersedes the listing Assertion and never closes a valid-time episode). The role label as printed ('Lead Sponsor', 'provided the study drug') is `Assertion.qualifiers` `roleText:<label>`, not an edge field. Every field executor-set.

| | |
| --- | --- |
| id | `edge:StudyRoleEdgeProperties` · raw SDL [sdl:StudyRoleEdgeProperties](../sdl/StudyRoleEdgeProperties.graphql) |
| module | [D3](../modules/D3.md) |
| used by relationship types | [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |

## Properties (12)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | D3.graphql:L355 |
| `assertionUid` | `String!` | yes | create+update |  | D3.graphql:L356 |
| `validFrom` | `DateTime` |  | create+update |  | D3.graphql:L357 |
| `validTo` | `DateTime` |  | create+update |  | D3.graphql:L358 |
| `validFromPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D3.graphql:L359 |
| `validToPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D3.graphql:L360 |
| `validFromBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | D3.graphql:L361 |
| `validToBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | D3.graphql:L362 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | D3.graphql:L363 |
| `recordedTo` | `DateTime` |  | create+update |  | D3.graphql:L364 |
| `lastWriterRunId` | `String` |  | create+update |  | D3.graphql:L365 |
| `roleKind` | [StudyRoleKind](../vocabularies/StudyRoleKind.md) | yes | create+update |  | D3.graphql:L366 |

## Declared on (1 fields)

- [Study](../nodes/Study.md).`roles` ([HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md))

## Source definition

- `release:sdl/modules/D3.graphql#L354-L367`
