---
id: "enum:StudyResultKind"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L222-L237"]
aliases: ["study result kind"]
capabilities: ["get"]
cardDigest: "sha256:1bb6a78bafd805549fe212478f3e8091d7b622d0cdeb10087a383ed87a3b0495"
---
# Enum StudyResultKind

Effect measure or summary a result reports.

Id `enum:StudyResultKind` · module [D3](../modules/D3.md) · 14 values · used by 1 fields · raw SDL [sdl:StudyResultKind](../sdl/StudyResultKind.graphql)

## Values (14)

| value | description |
| --- | --- |
| `MEAN` |  |
| `MEDIAN` |  |
| `MEAN_DIFFERENCE` |  |
| `PERCENT_CHANGE` |  |
| `RATIO` |  |
| `RISK_RATIO` |  |
| `ODDS_RATIO` |  |
| `HAZARD_RATIO` |  |
| `RISK_DIFFERENCE` |  |
| `RATE` |  |
| `AREA_UNDER_CURVE` |  |
| `PROPORTION` |  |
| `ADVERSE_EVENT_COUNT` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [StudyResult](../nodes/StudyResult.md).`resultKind`
