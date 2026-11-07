---
id: "enum:MeasurementPlatform"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L150-L162"]
aliases: ["measurement platform"]
capabilities: ["get"]
cardDigest: "sha256:330f6d4fce0305e60250e8c84321c6af385a2447d783ca9baefa5b06a9e0a6a2"
---
# Enum MeasurementPlatform

Technology platform of a measurement or of an algorithm's required input (absorbs pinned TechnologyPlatform).

Id `enum:MeasurementPlatform` · module [D4](../modules/D4.md) · 11 values · used by 2 fields · raw SDL [sdl:MeasurementPlatform](../sdl/MeasurementPlatform.graphql)

## Values (11)

| value | description |
| --- | --- |
| `ILLUMINA_450K` |  |
| `ILLUMINA_EPIC_V1` |  |
| `ILLUMINA_EPIC_V2` |  |
| `ILLUMINA_MSA` |  |
| `TARGETED_BISULFITE_SEQUENCING` |  |
| `WHOLE_GENOME_BISULFITE_SEQUENCING` |  |
| `LC_MS_TARGETED` |  |
| `CLINICAL_CHEMISTRY_ANALYZER` |  |
| `WEARABLE_PPG` |  |
| `CGM_SENSOR` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [AssayVersion](../nodes/AssayVersion.md).`platform`
- [AlgorithmVersion](../nodes/AlgorithmVersion.md).`inputPlatforms`
