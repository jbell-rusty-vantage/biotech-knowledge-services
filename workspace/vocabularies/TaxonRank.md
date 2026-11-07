---
id: "enum:TaxonRank"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L169-L179"]
aliases: ["taxon rank"]
capabilities: ["get"]
cardDigest: "sha256:201b4710e19366d892297e84a7f032e188d8f98a57ce29c6122b99422660f32d"
---
# Enum TaxonRank

Taxonomic rank (NCBI Taxonomy treats a strain as rank 'strain', e.g. taxid 568703 under species 47715).

Id `enum:TaxonRank` · module [D1](../modules/D1.md) · 9 values · used by 1 fields · raw SDL [sdl:TaxonRank](../sdl/TaxonRank.graphql)

## Values (9)

| value | description |
| --- | --- |
| `FAMILY` |  |
| `GENUS` |  |
| `SPECIES` |  |
| `SUBSPECIES` |  |
| `VARIETY` |  |
| `FORMA` |  |
| `CULTIVAR` |  |
| `STRAIN` |  |
| `OTHER_RANK` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Taxon](../nodes/Taxon.md).`rank`
