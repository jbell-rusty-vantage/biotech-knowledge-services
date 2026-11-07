---
id: "enum:CriterionBasis"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L256-L262"]
aliases: ["criterion basis"]
capabilities: ["get"]
cardDigest: "sha256:82c42901f11655b21aba538eb3fe2511790a553445a66df4cc8e57dcabf64ce3"
---
# Enum CriterionBasis

Who set the criterion (pinned CriterionBasis kept).

Id `enum:CriterionBasis` · module [D8](../modules/D8.md) · 5 values · used by 1 fields · raw SDL [sdl:CriterionBasis](../sdl/CriterionBasis.graphql)

## Values (5)

| value | description |
| --- | --- |
| `INTERNAL` |  |
| `PHARMACOPEIAL` |  |
| `REGULATORY` |  |
| `CERTIFICATION_PROGRAM` |  |
| `NOT_STATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [QualityResult](../nodes/QualityResult.md).`specBasis`
