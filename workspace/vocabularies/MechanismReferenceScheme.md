---
id: "enum:MechanismReferenceScheme"
kind: "enum"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L52-L58"]
aliases: ["mechanism reference scheme"]
capabilities: ["get"]
cardDigest: "sha256:4b0da0e572bc08d62332db1fcb67cbfcd2e98ee6e84c22bfaf5e1b3c8ab0d212"
---
# Enum MechanismReferenceScheme

Authority whose record a Mechanism mirrors; BELLLABS_CURATED for concepts with no single authority record.

Id `enum:MechanismReferenceScheme` · module [D2](../modules/D2.md) · 5 values · used by 2 fields · raw SDL [sdl:MechanismReferenceScheme](../sdl/MechanismReferenceScheme.graphql)

## Values (5)

| value | description |
| --- | --- |
| `REACTOME` |  |
| `GO` |  |
| `WIKIPATHWAYS` |  |
| `KEGG` |  |
| `BELLLABS_CURATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- `MechanismReferenceProperties`.`referenceScheme`
- [Mechanism](../nodes/Mechanism.md).`referenceScheme`
