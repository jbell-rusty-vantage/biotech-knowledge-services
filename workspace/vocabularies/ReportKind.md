---
id: "enum:ReportKind"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L507-L514"]
aliases: ["report kind"]
capabilities: ["get"]
cardDigest: "sha256:5856e5ddf09bed8aee7f7e321c9925477019fa0fb05224c221c45a2745a9a6d7"
---
# Enum ReportKind

Kind of published artifact. STUDY_APPRAISAL (R-SV11): the scientific appraisal of one or more studies (the Knowledge Services report kind study_appraisal); reportKindRef carries the versioned kind reference.

Id `enum:ReportKind` · module [K](../modules/K.md) · 6 values · used by 1 fields · raw SDL [sdl:ReportKind](../sdl/ReportKind.graphql)

## Values (6)

| value | description |
| --- | --- |
| `EVIDENCE_REPORT` |  |
| `ANSWER` |  |
| `COMPARISON` |  |
| `PROFILE` |  |
| `RECOMMENDATION` |  |
| `STUDY_APPRAISAL` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Report](../nodes/Report.md).`reportKind`
