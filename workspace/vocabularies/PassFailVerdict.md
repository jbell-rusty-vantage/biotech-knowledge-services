---
id: "enum:PassFailVerdict"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L273-L278"]
aliases: ["pass fail verdict"]
capabilities: ["get"]
cardDigest: "sha256:77a99cdcc1bcf96a5d8b986b319e6beb45ea22f5c5afda7139f8b45b5a5ef58a"
---
# Enum PassFailVerdict

Verdict as printed by the source next to a result (pinned PassFailVerdict plus NOT_STATED). An evaluated verdict is a kernel Assessment, never this field.

Id `enum:PassFailVerdict` · module [D8](../modules/D8.md) · 4 values · used by 1 fields · raw SDL [sdl:PassFailVerdict](../sdl/PassFailVerdict.graphql)

## Values (4)

| value | description |
| --- | --- |
| `CONFORMS` |  |
| `DOES_NOT_CONFORM` |  |
| `INDETERMINATE` |  |
| `NOT_STATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [QualityResult](../nodes/QualityResult.md).`statedVerdict`
