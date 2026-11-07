---
id: "enum:AssessmentStatus"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L473-L478"]
aliases: ["assessment status"]
capabilities: ["get"]
cardDigest: "sha256:60d85d63262fd995cf1423de1af60b2beffa3ca44a0c68b3bab3984476d6948a"
---
# Enum AssessmentStatus

Workflow state of an Assessment or Report record; not a verdict.

Id `enum:AssessmentStatus` · module [K](../modules/K.md) · 4 values · used by 2 fields · raw SDL [sdl:AssessmentStatus](../sdl/AssessmentStatus.graphql)

## Values (4)

| value | description |
| --- | --- |
| `PROPOSED` |  |
| `ACCEPTED` |  |
| `SUPERSEDED` |  |
| `WITHDRAWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Assessment](../nodes/Assessment.md).`status`
- [Report](../nodes/Report.md).`status`
