---
id: "enum:CriterionDirection"
kind: "enum"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D10.graphql#L42-L47"]
aliases: ["criterion direction"]
capabilities: ["get"]
cardDigest: "sha256:31dcb924f47e411ef104fc53df22a619e7150cc7d443b19e783f343ce5f0afc6"
---
# Enum CriterionDirection

How a criterion's value orders options. NOT_ORDERED for BLOCK and FILTER criteria.

Id `enum:CriterionDirection` · module [D10](../modules/D10.md) · 4 values · used by 1 fields · raw SDL [sdl:CriterionDirection](../sdl/CriterionDirection.graphql)

## Values (4)

| value | description |
| --- | --- |
| `HIGHER_IS_BETTER` |  |
| `LOWER_IS_BETTER` |  |
| `WITHIN_RANGE` |  |
| `NOT_ORDERED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [DecisionCriterion](../nodes/DecisionCriterion.md).`direction`
