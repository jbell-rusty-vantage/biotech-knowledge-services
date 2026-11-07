---
id: "edge:AppearanceEdgeProperties"
kind: "edge-properties"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D9.graphql#L143-L150"]
aliases: ["appearance edge properties"]
capabilities: ["get"]
cardDigest: "sha256:28fe0479a19b9287c66ab266963dd0754f78ba76451ffbfa52a9a26d84139169"
---
# Edge properties AppearanceEdgeProperties

APPEARS_IN episode, recorded time only: the kernel AssertedRecordedProperties fields verbatim and in order (executor-set, one authorizing Assertion with predicate APPEARS_IN), then the one qualifier a question filters on: the appearance role (host vs guest decides whose interests a sponsor read touches, CQ-CL-08; AUTHOR / PRESENTER feed Q-D9-16 and Q-D9-18). Valid time is not on the edge (00-DIRECTIVE rule 9, kernel M10): the time of an appearance is the work's publishedAt and any stated time stays on the authorizing Assertion. The name as credited is wording, so it stays in the Assertion's qualifiers (`credited-name:<verbatim>`, kernel rule M11.3). Superset rule: kernel 09-reasoning.md "Domain-local edge-property types" (model stage; resolves 11-open-questions D7-3).

| | |
| --- | --- |
| id | `edge:AppearanceEdgeProperties` · raw SDL [sdl:AppearanceEdgeProperties](../sdl/AppearanceEdgeProperties.graphql) |
| module | [D9](../modules/D9.md) |
| used by relationship types | [APPEARS_IN](../relationships/APPEARS_IN.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |

## Properties (6)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | D9.graphql:L144 |
| `assertionUid` | `String!` | yes | create+update |  | D9.graphql:L145 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | D9.graphql:L146 |
| `recordedTo` | `DateTime` |  | create+update |  | D9.graphql:L147 |
| `lastWriterRunId` | `String` |  | create+update |  | D9.graphql:L148 |
| `appearanceRole` | [AppearanceRole](../vocabularies/AppearanceRole.md) | yes | create+update |  | D9.graphql:L149 |

## Declared on (1 fields)

- [MediaWork](../nodes/MediaWork.md).`appearances` ([APPEARS_IN](../relationships/APPEARS_IN.md))

## Source definition

- `release:sdl/modules/D9.graphql#L143-L150`
