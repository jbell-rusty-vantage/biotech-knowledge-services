---
id: "enum:CalibrationTraceability"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L183-L190"]
aliases: ["calibration traceability"]
capabilities: ["get"]
cardDigest: "sha256:f02800143eff1b12738e47c08ae8664d16dd26e55c9c339ec449db798ca1e343"
---
# Enum CalibrationTraceability

Metrological traceability the calibration claims (absorbs pinned ReferenceSystem).

Id `enum:CalibrationTraceability` · module [D4](../modules/D4.md) · 6 values · used by 1 fields · raw SDL [sdl:CalibrationTraceability](../sdl/CalibrationTraceability.graphql)

## Values (6)

| value | description |
| --- | --- |
| `NGSP` |  |
| `IFCC_RMP` |  |
| `JDS_JSCC` |  |
| `CDC_CRMLN` |  |
| `MANUFACTURER_ONLY` |  |
| `NONE_STATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [AssayVersion](../nodes/AssayVersion.md).`calibrationTraceability`
