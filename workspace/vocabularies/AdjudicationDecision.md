---
id: "enum:AdjudicationDecision"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L329-L333"]
aliases: ["adjudication decision"]
capabilities: ["get"]
cardDigest: "sha256:965d449952f3fe2b9a4eabc9134d7d013a97f4a4c1eb2818e0793033b07c0453"
---
# Enum AdjudicationDecision

verification.v1 adjudication decision (human review of a held result).

Id `enum:AdjudicationDecision` · module [K](../modules/K.md) · 3 values · used by 1 fields · raw SDL [sdl:AdjudicationDecision](../sdl/AdjudicationDecision.graphql)

## Values (3)

| value | description |
| --- | --- |
| `AFFIRM` |  |
| `REJECT` |  |
| `DEFER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Adjudication](../nodes/Adjudication.md).`decision`
