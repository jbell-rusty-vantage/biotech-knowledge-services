---
id: "enum:CriterionKind"
kind: "enum"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D10.graphql#L34-L39"]
aliases: ["criterion kind"]
capabilities: ["get"]
cardDigest: "sha256:dbf437d4c354bee8d2886a18a17d9df177cbf6428b22f48b66a7db29fa191494"
---
# Enum CriterionKind

Role of a DecisionCriterion in a ranking method (directive 3.5). BLOCK removes an option with a reason (rank null) instead of lowering its score (CQ-RC-06).

Id `enum:CriterionKind` · module [D10](../modules/D10.md) · 4 values · used by 1 fields · raw SDL [sdl:CriterionKind](../sdl/CriterionKind.graphql)

## Values (4)

| value | description |
| --- | --- |
| `SCORE` |  |
| `BLOCK` |  |
| `FILTER` |  |
| `TIEBREAK` |  |

Any value not listed here is not allowed in this release.

## Used by

- [DecisionCriterion](../nodes/DecisionCriterion.md).`criterionKind`
