---
id: "enum:AwardInstrument"
kind: "enum"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L266-L277"]
aliases: ["award instrument"]
capabilities: ["get"]
cardDigest: "sha256:979637db4c20e6f89136bc889860c7338e4c1f33e02ad95dc38e025937071e90"
---
# Enum AwardInstrument

Funding instrument of an Award (ARPA-H programmes are contracts, NIH projects are grants, a company 'grant' to a lab may be a sponsored research agreement).

Id `enum:AwardInstrument` · module [D7](../modules/D7.md) · 10 values · used by 1 fields · raw SDL [sdl:AwardInstrument](../sdl/AwardInstrument.graphql)

## Values (10)

| value | description |
| --- | --- |
| `GRANT` |  |
| `CONTRACT` |  |
| `COOPERATIVE_AGREEMENT` |  |
| `OTHER_TRANSACTION` |  |
| `SPONSORED_RESEARCH_AGREEMENT` |  |
| `FELLOWSHIP` |  |
| `PRIZE` |  |
| `PHILANTHROPIC_GIFT` |  |
| `IN_KIND` |  |
| `UNSPECIFIED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Award](../nodes/Award.md).`instrument`
