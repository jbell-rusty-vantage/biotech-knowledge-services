---
id: "enum:PackageKind"
kind: "enum"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L121-L133"]
aliases: ["package kind"]
capabilities: ["get"]
cardDigest: "sha256:651b58de5491d383dc8177cf440e6a89d2d86b20786d6a876c4bb9979a0d4dcd"
---
# Enum PackageKind

How a sellable package is composed.

Id `enum:PackageKind` · module [D6](../modules/D6.md) · 6 values · used by 1 fields · raw SDL [sdl:PackageKind](../sdl/PackageKind.graphql)

## Values (6)

| value | description |
| --- | --- |
| `CONTAINER` | One container of one variant (a bottle of 30 capsules, a 350 g pouch). |
| `MULTIPACK` | N identical containers sold as one item (two-bottle supply). |
| `KIT` | A seller-defined kit of different packages (brand SKU '-KIT'). |
| `BUNDLE` | A bundle across products or brands. |
| `SERVED_PORTION` | One served portion of a prepared food (a sandwich, a menu item); no container GTIN. |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Package](../nodes/Package.md).`packageKind`
