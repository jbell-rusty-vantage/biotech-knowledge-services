---
id: "enum:MechanismSetting"
kind: "enum"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L97-L106"]
aliases: ["mechanism setting"]
capabilities: ["get"]
cardDigest: "sha256:1dc3513278ffe03639c23a2539972e408d10e6fbef56bb209ec7a4d165946dfd"
---
# Enum MechanismSetting

Experimental setting of a mechanism evidence context (round 0003 rule: measured where, in what).

Id `enum:MechanismSetting` · module [D2](../modules/D2.md) · 8 values · used by 2 fields · raw SDL [sdl:MechanismSetting](../sdl/MechanismSetting.graphql)

## Values (8)

| value | description |
| --- | --- |
| `IN_SILICO` |  |
| `IN_VITRO_CELL_FREE` |  |
| `IN_VITRO_CELL` |  |
| `EX_VIVO` |  |
| `IN_VIVO_NONMAMMAL` |  |
| `IN_VIVO_MAMMAL` |  |
| `HUMAN_OBSERVATIONAL` |  |
| `HUMAN_INTERVENTIONAL` |  |

Any value not listed here is not allowed in this release.

## Used by

- `MechanismProjectionProperties`.`highestSetting`
- [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md).`setting`
