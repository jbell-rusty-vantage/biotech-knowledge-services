---
id: "enum:StakeBand"
kind: "enum"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L202-L210"]
aliases: ["stake band"]
capabilities: ["get"]
cardDigest: "sha256:2f31bc13e4a214a6b2e431733bef618f0819a9f625c1e3a42831224ec65f4e33"
---
# Enum StakeBand

Statutory band or disclosure threshold when the source gives no number (UK PSC bands; SEC 5 % table and 10 % owner thresholds).

Id `enum:StakeBand` · module [D7](../modules/D7.md) · 7 values · used by 1 fields · raw SDL [sdl:StakeBand](../sdl/StakeBand.graphql)

## Values (7)

| value | description |
| --- | --- |
| `OVER_25_TO_50` |  |
| `OVER_50_TO_75` |  |
| `OVER_75` |  |
| `AT_LEAST_5` |  |
| `AT_LEAST_10` |  |
| `BELOW_DISCLOSURE_THRESHOLD` |  |
| `UNSTATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- `StakeEdgeProperties`.`stakeBand`
