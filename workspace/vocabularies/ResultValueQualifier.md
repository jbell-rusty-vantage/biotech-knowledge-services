---
id: "enum:ResultValueQualifier"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L245-L253"]
aliases: ["result value qualifier"]
capabilities: ["get"]
cardDigest: "sha256:92119e7b6ce745bdfe44ac6003678a87b78e66e8fbe238445d3adb3f0dfa5047"
---
# Enum ResultValueQualifier

Qualifier of a reported value.

Id `enum:ResultValueQualifier` · module [D8](../modules/D8.md) · 7 values · used by 1 fields · raw SDL [sdl:ResultValueQualifier](../sdl/ResultValueQualifier.graphql)

## Values (7)

| value | description |
| --- | --- |
| `EXACT` |  |
| `APPROXIMATE` |  |
| `NOT_DETECTED` |  |
| `BELOW_DETECTION_LIMIT` |  |
| `BELOW_REPORTING_LIMIT` |  |
| `ABOVE_RANGE` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- [QualityResult](../nodes/QualityResult.md).`valueQualifier`
