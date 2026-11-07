---
id: "enum:JudgeKind"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L311-L318"]
aliases: ["judge kind"]
capabilities: ["get"]
cardDigest: "sha256:0b2794776649e17b9574cdb8270ffa84553620084661cec5f405ee6ca39b50f6"
---
# Enum JudgeKind

verification.v1 JudgmentSchema.judgeKind.

Id `enum:JudgeKind` · module [K](../modules/K.md) · 6 values · used by 1 fields · raw SDL [sdl:JudgeKind](../sdl/JudgeKind.graphql)

## Values (6)

| value | description |
| --- | --- |
| `DETERMINISTIC` |  |
| `NLI` |  |
| `LLM` |  |
| `HUMAN` |  |
| `POLICY` |  |
| `STATISTICAL` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Adjudication](../nodes/Adjudication.md).`judgeKind`
