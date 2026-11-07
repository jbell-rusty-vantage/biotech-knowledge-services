---
id: "enum:ConditionKind"
kind: "enum"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L145-L150"]
aliases: ["condition kind"]
capabilities: ["get"]
cardDigest: "sha256:06ffa738b6fd8af6fe2fe1691ea907465e24a299b4a1138553e09ee6c063aad0"
---
# Enum ConditionKind

Kind of Condition (absorbs the pinned RiskFactor as RISK_STATE).

Id `enum:ConditionKind` · module [D2](../modules/D2.md) · 4 values · used by 1 fields · raw SDL [sdl:ConditionKind](../sdl/ConditionKind.graphql)

## Values (4)

| value | description |
| --- | --- |
| `DISEASE` |  |
| `SYNDROME` |  |
| `PHENOTYPE` |  |
| `RISK_STATE` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Condition](../nodes/Condition.md).`conditionKind`
