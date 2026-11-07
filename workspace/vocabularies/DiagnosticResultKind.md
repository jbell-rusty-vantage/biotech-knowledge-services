---
id: "enum:DiagnosticResultKind"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L82-L86"]
aliases: ["diagnostic result kind"]
capabilities: ["get"]
cardDigest: "sha256:33ed17b6cea226835f6a21e07180b7bbd8b87ab26ca62dfa1c536384a1e3696e"
---
# Enum DiagnosticResultKind

Pinned DiagnosticResultKind: is a value measured, calculated from other values, or inferred by a model (DNAm surrogates, PPG-derived estimates).

Id `enum:DiagnosticResultKind` · module [D4](../modules/D4.md) · 3 values · used by 1 fields · raw SDL [sdl:DiagnosticResultKind](../sdl/DiagnosticResultKind.graphql)

## Values (3)

| value | description |
| --- | --- |
| `MEASURED` |  |
| `CALCULATED` |  |
| `INFERRED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Metric](../nodes/Metric.md).`defaultResultKind`
