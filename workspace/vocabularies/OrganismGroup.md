---
id: "enum:OrganismGroup"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L182-L189"]
aliases: ["organism group"]
capabilities: ["get"]
cardDigest: "sha256:9604dbc000d5b9678a252e434e1e69eea1d86b653716425f0ebe9ac4792a1b02"
---
# Enum OrganismGroup

Coarse organism group of a Taxon (filters botanical vs microbial vs animal-source materials).

Id `enum:OrganismGroup` · module [D1](../modules/D1.md) · 6 values · used by 1 fields · raw SDL [sdl:OrganismGroup](../sdl/OrganismGroup.graphql)

## Values (6)

| value | description |
| --- | --- |
| `PLANT` |  |
| `FUNGUS` |  |
| `ALGA` |  |
| `BACTERIUM` |  |
| `ANIMAL` |  |
| `OTHER_ORGANISM` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Taxon](../nodes/Taxon.md).`organismGroup`
