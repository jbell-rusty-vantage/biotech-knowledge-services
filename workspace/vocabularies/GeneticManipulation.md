---
id: "enum:GeneticManipulation"
kind: "enum"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L129-L135"]
aliases: ["genetic manipulation"]
capabilities: ["get"]
cardDigest: "sha256:47a5946050bc181111527e0dc7b2b8688a49b6506c7116dd64b760cc634bc6e4"
---
# Enum GeneticManipulation

Genetic manipulation that defines the context when a gene, not a compound, is the exposure (Q-D2-20).

Id `enum:GeneticManipulation` · module [D2](../modules/D2.md) · 5 values · used by 1 fields · raw SDL [sdl:GeneticManipulation](../sdl/GeneticManipulation.graphql)

## Values (5)

| value | description |
| --- | --- |
| `NONE` |  |
| `LOSS_OF_FUNCTION` |  |
| `KNOCKDOWN` |  |
| `GAIN_OF_FUNCTION` |  |
| `VARIANT_CARRIER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md).`geneticManipulation`
