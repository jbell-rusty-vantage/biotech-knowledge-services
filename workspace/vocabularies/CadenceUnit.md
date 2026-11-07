---
id: "enum:CadenceUnit"
kind: "enum"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L125-L131"]
aliases: ["cadence unit"]
capabilities: ["get"]
cardDigest: "sha256:57f4d213ce003100e37f1894caa75519739ff5bf74a518de98129f681c157b05"
---
# Enum CadenceUnit

Period unit for occurrence ranges ('3-4 nights per week' = 3..4 per WEEK). Pinned CadenceUnit trimmed.

Id `enum:CadenceUnit` · module [D5](../modules/D5.md) · 5 values · used by 1 fields · raw SDL [sdl:CadenceUnit](../sdl/CadenceUnit.graphql)

## Values (5)

| value | description |
| --- | --- |
| `DAY` |  |
| `WEEK` |  |
| `MONTH` |  |
| `YEAR` |  |
| `CYCLE` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ProtocolStep](../nodes/ProtocolStep.md).`occurrencePeriodUnit`
