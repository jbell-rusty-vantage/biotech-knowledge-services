---
id: "enum:ResultBasis"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L236-L242"]
aliases: ["result basis"]
capabilities: ["get"]
cardDigest: "sha256:dcb350c65d418f10e2468808523ed01496908c63069e61fc1a63dfb6fa66b3fb"
---
# Enum ResultBasis

How a reported result row was obtained (the decisive enum from fixture FC-3). MEASURED: an analytical value from a method. INPUT_VERIFIED: 'quantity by input', batch-record review; nothing was measured. IN_PROCESS_CONTROL: a manufacturing control value (IPC). STATED_WITHOUT_VALUE: a bare 'Conforms' or 'Pass'. NOT_REPORTED: the row names the analyte but gives neither value nor statement.

Id `enum:ResultBasis` · module [D8](../modules/D8.md) · 5 values · used by 1 fields · raw SDL [sdl:ResultBasis](../sdl/ResultBasis.graphql)

## Values (5)

| value | description |
| --- | --- |
| `MEASURED` |  |
| `INPUT_VERIFIED` |  |
| `IN_PROCESS_CONTROL` |  |
| `STATED_WITHOUT_VALUE` |  |
| `NOT_REPORTED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [QualityResult](../nodes/QualityResult.md).`resultBasis`
