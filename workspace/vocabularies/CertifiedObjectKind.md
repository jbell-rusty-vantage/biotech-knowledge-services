---
id: "enum:CertifiedObjectKind"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L299-L306"]
aliases: ["certified object kind"]
capabilities: ["get"]
cardDigest: "sha256:4a99665867a2c9531cd1428e4aa410c0e5b44bcb6f09488dd8ac5bc81fe58848"
---
# Enum CertifiedObjectKind

What a listing says it certifies (pinned CertifiedObjectKind plus PRODUCT_ALL_SIZES).

Id `enum:CertifiedObjectKind` · module [D8](../modules/D8.md) · 6 values · used by 1 fields · raw SDL [sdl:CertifiedObjectKind](../sdl/CertifiedObjectKind.graphql)

## Values (6)

| value | description |
| --- | --- |
| `FACILITY` |  |
| `PRODUCT` |  |
| `PRODUCT_ALL_SIZES` |  |
| `LOT` |  |
| `INGREDIENT_MATERIAL` |  |
| `LABORATORY` |  |

Any value not listed here is not allowed in this release.

## Used by

- [CertificationListing](../nodes/CertificationListing.md).`coverageKind`
