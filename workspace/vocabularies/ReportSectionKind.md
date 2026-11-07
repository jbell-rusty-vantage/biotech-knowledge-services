---
id: "enum:ReportSectionKind"
kind: "enum"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D10.graphql#L56-L74"]
aliases: ["report section kind"]
capabilities: ["get"]
cardDigest: "sha256:310d35c9893ba20fa5b54761f55856cf55af2f12e9f4d9a871700fdae0acc381"
---
# Enum ReportSectionKind

Section of a report skeleton (packets/D10/report-skeletons.md). One skeleton = an ordered subset of these values.

Id `enum:ReportSectionKind` · module [D10](../modules/D10.md) · 17 values · used by 1 fields · raw SDL [sdl:ReportSectionKind](../sdl/ReportSectionKind.graphql)

## Values (17)

| value | description |
| --- | --- |
| `SCOPE` |  |
| `IDENTITY` |  |
| `USES_BY_TARGET` |  |
| `EVIDENCE_FOR` |  |
| `EVIDENCE_AGAINST` |  |
| `HARMS_AND_AVOIDANCE` |  |
| `INTERACTIONS` |  |
| `CRITERIA` |  |
| `OPTIONS` |  |
| `PRODUCTS_AND_QUALITY` |  |
| `PROTOCOL_STEP` |  |
| `CLAIM_UNDER_TEST` |  |
| `VERDICT` |  |
| `MISSING_OR_DISPUTED` |  |
| `INTERESTS` |  |
| `OPEN_QUESTIONS` |  |
| `CHANGES` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ReportItem](../nodes/ReportItem.md).`sectionKind`
