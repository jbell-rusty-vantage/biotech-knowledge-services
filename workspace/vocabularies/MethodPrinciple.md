---
id: "enum:MethodPrinciple"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L133-L147"]
aliases: ["method principle"]
capabilities: ["get"]
cardDigest: "sha256:27793b46471b1b3c01b25c62a86a262c42415d9bfa1d3034dcf91a9356342160"
---
# Enum MethodPrinciple

Method principle (absorbs pinned MeasurementMethod).

Id `enum:MethodPrinciple` · module [D4](../modules/D4.md) · 13 values · used by 1 fields · raw SDL [sdl:MethodPrinciple](../sdl/MethodPrinciple.graphql)

## Values (13)

| value | description |
| --- | --- |
| `IMMUNOASSAY_TURBIDIMETRIC` |  |
| `IMMUNOASSAY_OTHER` |  |
| `ION_EXCHANGE_HPLC` |  |
| `BORONATE_AFFINITY` |  |
| `ENZYMATIC` |  |
| `CAPILLARY_ELECTROPHORESIS` |  |
| `LC_MS` |  |
| `DNA_METHYLATION_ARRAY` |  |
| `DNA_METHYLATION_SEQUENCING` |  |
| `GLYCAN_CHROMATOGRAPHY` |  |
| `ELECTROCHEMICAL_SENSOR` |  |
| `OPTICAL_SENSOR` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [AssayVersion](../nodes/AssayVersion.md).`methodPrinciple`
