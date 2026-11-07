---
id: "enum:ReferenceIntervalDerivation"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L240-L248"]
aliases: ["reference interval derivation"]
capabilities: ["get"]
cardDigest: "sha256:e649308af8486dbc9d52d0f51f5bf436183caf37599080d92ee6aa31b24814c2"
---
# Enum ReferenceIntervalDerivation

Pinned ReferenceIntervalDerivation plus VENDOR_DEFINED.

Id `enum:ReferenceIntervalDerivation` · module [D4](../modules/D4.md) · 7 values · used by 1 fields · raw SDL [sdl:ReferenceIntervalDerivation](../sdl/ReferenceIntervalDerivation.graphql)

## Values (7)

| value | description |
| --- | --- |
| `ESTABLISHED` |  |
| `TRANSFERRED` |  |
| `VERIFIED` |  |
| `ADOPTED_FROM_MANUFACTURER` |  |
| `ADOPTED_FROM_GUIDELINE` |  |
| `VENDOR_DEFINED` |  |
| `NOT_REPORTED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md).`derivation`
