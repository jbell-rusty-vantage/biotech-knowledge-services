---
id: "enum:FrontierCurationStatus"
kind: "enum"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D13.graphql#L148-L153"]
aliases: ["frontier curation status"]
capabilities: ["get"]
cardDigest: "sha256:313b6b36b7425208331339a2fff7e277e33f374ac710f690af147984efd1b0a3"
---
# Enum FrontierCurationStatus

Curation status of a frontier, set only by a vocabulary version bump with a rationale; never a judgment of success. MATURED is a vocabulary-retirement state (the frontier stops admitting new milestone attachments) whose bump rationale must cite an accepted BREAKTHROUGH_JUDGMENT Assessment about the Frontier; it is never set by a progress computation (vocab-frontiers.yaml 0.2.1).

Id `enum:FrontierCurationStatus` · module [D13](../modules/D13.md) · 4 values · used by 1 fields · raw SDL [sdl:FrontierCurationStatus](../sdl/FrontierCurationStatus.graphql)

## Values (4)

| value | description |
| --- | --- |
| `ACTIVE` |  |
| `DORMANT` |  |
| `MATURED` |  |
| `DEPRECATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Frontier](../nodes/Frontier.md).`curationStatus`
