---
id: "enum:SpeechAct"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L250-L258"]
aliases: ["speech act"]
capabilities: ["get"]
cardDigest: "sha256:80e793971f22b5daa12199839734803b78b4dcab72303dc970a033b77914a3d8"
---
# Enum SpeechAct

What the asserter does with the proposition.

Id `enum:SpeechAct` · module [K](../modules/K.md) · 7 values · used by 2 fields · raw SDL [sdl:SpeechAct](../sdl/SpeechAct.graphql)

## Values (7)

| value | description |
| --- | --- |
| `STATES` |  |
| `REPORTS_PRACTICE` |  |
| `RECOMMENDS` |  |
| `CAUTIONS` |  |
| `SPECULATES` |  |
| `QUESTIONS` |  |
| `DENIES` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Assertion](../nodes/Assertion.md).`speechAct`
- [ProtocolStep](../nodes/ProtocolStep.md).`speechAct`
