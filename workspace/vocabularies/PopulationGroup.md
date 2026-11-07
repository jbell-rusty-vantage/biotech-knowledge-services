---
id: "enum:PopulationGroup"
kind: "enum"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L141-L157"]
aliases: ["population group"]
capabilities: ["get"]
cardDigest: "sha256:b6c1bbe4ec28b82fa688fa4096ce920b3b779347cd3000ffba6305de0c4053d6"
---
# Enum PopulationGroup

Non-personal population codes used by step applicability, UseConstraint scope and the mandatory population qualifier of D5 assertions (`population:<CODE>`). Diseases are D2 Conditions, not codes.

Id `enum:PopulationGroup` · module [D5](../modules/D5.md) · 14 values · used by 2 fields · raw SDL [sdl:PopulationGroup](../sdl/PopulationGroup.graphql)

## Values (14)

| value | description |
| --- | --- |
| `UNSPECIFIED` | The source names no population; explicit, never read as 'everyone'. |
| `GENERAL_ADULTS` |  |
| `OLDER_ADULTS` |  |
| `ADOLESCENTS` |  |
| `CHILDREN` |  |
| `INFANTS` |  |
| `PREGNANT` |  |
| `LACTATING` |  |
| `TRYING_TO_CONCEIVE` |  |
| `ATHLETES` |  |
| `PRE_SURGERY` |  |
| `IMMUNOSUPPRESSED` |  |
| `ON_PRESCRIPTION_MEDICATION` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ProtocolStep](../nodes/ProtocolStep.md).`appliesToPopulations`
- [UseConstraint](../nodes/UseConstraint.md).`scopePopulations`
