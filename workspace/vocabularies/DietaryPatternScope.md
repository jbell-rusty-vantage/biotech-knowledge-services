---
id: "enum:DietaryPatternScope"
kind: "enum"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D12.graphql#L131-L137"]
aliases: ["dietary pattern scope"]
capabilities: ["get"]
cardDigest: "sha256:abed482fcfdfeb194215943d284c8ad83d6395de931d19d799a7e0f6ab1ba11d"
---
# Enum DietaryPatternScope

Who defines the pattern and for what purpose; a filter, not a judgement.

Id `enum:DietaryPatternScope` · module [D12](../modules/D12.md) · 5 values · used by 1 fields · raw SDL [sdl:DietaryPatternScope](../sdl/DietaryPatternScope.graphql)

## Values (5)

| value | description |
| --- | --- |
| `GUIDELINE` |  |
| `TRIAL_ARM` |  |
| `POPULAR_DIET` |  |
| `COMMERCIAL_PROGRAM` |  |
| `POPULATION_DESCRIPTIVE` |  |

Any value not listed here is not allowed in this release.

## Used by

- [DietaryPattern](../nodes/DietaryPattern.md).`definitionScope`
