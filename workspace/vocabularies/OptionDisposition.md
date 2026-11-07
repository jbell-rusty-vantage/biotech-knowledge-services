---
id: "enum:OptionDisposition"
kind: "enum"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D10.graphql#L77-L83"]
aliases: ["option disposition"]
capabilities: ["get"]
cardDigest: "sha256:847c9ace1d5189b3d712ed8abe196557b2a89e275b0d1d51d626f46ccd397d28"
---
# Enum OptionDisposition

Outcome of one option row in a published comparison (CQ-RC-01, CQ-RC-06). BLOCKED rows have rank null and BLOCKED_BY edges; NOT_EVALUATED rows are candidates the method could not score (missing facts).

Id `enum:OptionDisposition` · module [D10](../modules/D10.md) · 5 values · used by 1 fields · raw SDL [sdl:OptionDisposition](../sdl/OptionDisposition.graphql)

## Values (5)

| value | description |
| --- | --- |
| `SELECTED` |  |
| `ALTERNATIVE` |  |
| `REJECTED` |  |
| `BLOCKED` |  |
| `NOT_EVALUATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ReportItem](../nodes/ReportItem.md).`disposition`
