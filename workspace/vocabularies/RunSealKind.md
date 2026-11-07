---
id: "enum:RunSealKind"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L517-L521"]
aliases: ["run seal kind"]
capabilities: ["get"]
cardDigest: "sha256:0a0efb110d28a45b9afa44402fda9b22aa224df1ca3eaacb0fa1a871639dbe87"
---
# Enum RunSealKind

Which sealed snapshot of one Knowledge Services run an Activity references (R-SV10). The verification snapshot seals the run manifest; a decision or admission snapshot is a successor manifest in the same run lineage that references the prior seal. Seals never contain one another.

Id `enum:RunSealKind` · module [K](../modules/K.md) · 3 values · used by 1 fields · raw SDL [sdl:RunSealKind](../sdl/RunSealKind.graphql)

## Values (3)

| value | description |
| --- | --- |
| `VERIFICATION_SNAPSHOT` |  |
| `DECISION_SNAPSHOT` |  |
| `ADMISSION_SNAPSHOT` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Activity](../nodes/Activity.md).`runSealKind`
