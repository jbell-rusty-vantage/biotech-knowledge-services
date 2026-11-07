---
id: "enum:IntakeScope"
kind: "enum"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L134-L138"]
aliases: ["intake scope"]
capabilities: ["get"]
cardDigest: "sha256:94c56873f88d4fb587dbc3ab97d46c012318162354605cb6d42572a2adb04647"
---
# Enum IntakeScope

Intake scope of a dose or limit: an upper limit for supplemental magnesium is not comparable with total intake (Q-D5-06).

Id `enum:IntakeScope` · module [D5](../modules/D5.md) · 3 values · used by 2 fields · raw SDL [sdl:IntakeScope](../sdl/IntakeScope.graphql)

## Values (3)

| value | description |
| --- | --- |
| `SUPPLEMENTAL_ONLY` |  |
| `TOTAL_INTAKE` |  |
| `NOT_STATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ProtocolStep](../nodes/ProtocolStep.md).`intakeScope`
- [UseConstraint](../nodes/UseConstraint.md).`intakeScope`
