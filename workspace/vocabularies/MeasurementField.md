---
id: "enum:MeasurementField"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L37-L57"]
aliases: ["measurement field"]
capabilities: ["get"]
cardDigest: "sha256:d7216b9e1cbacb7f8933198bf115a6573494e6cf7522c6af8c99b8f85ec68464"
---
# Enum MeasurementField

Which descriptive fields a source was checked for and did NOT report (00-DIRECTIVE finding: 'not reported' is the normal value on public artifacts). A field listed here is null by design; a null field not listed is not yet extracted. Two records whose identity fields are NOT_REPORTED never merge (identity includes the source capture). PERFORMING_LAB means no captured source names the performing laboratory (site); an organization-level PERFORMED_BY_LAB edge may still exist as a curator inference: an asserted edge whose Assertion names the asserter and the rule, basisKind CURATOR_CLASSIFICATION (R-26). Shared by every D4 type: `notReported: [MeasurementField!]`.

Id `enum:MeasurementField` · module [D4](../modules/D4.md) · 19 values · used by 6 fields · raw SDL [sdl:MeasurementField](../sdl/MeasurementField.graphql)

## Values (19)

| value | description |
| --- | --- |
| `METHOD_PRINCIPLE` |  |
| `INSTRUMENT_MODEL` |  |
| `REAGENT_KIT` |  |
| `SOFTWARE_VERSION` |  |
| `SPECIMEN` |  |
| `CALIBRATION_TRACEABILITY` |  |
| `PERFORMING_LAB` |  |
| `UNIT` |  |
| `MEASURAND_SYSTEM` |  |
| `METRIC_METHOD` |  |
| `VERSION_LABEL` |  |
| `INPUT_PLATFORM` |  |
| `INPUT_FEATURES` |  |
| `TRAINING_POPULATION` |  |
| `RELIABILITY` |  |
| `INTERVAL_DERIVATION` |  |
| `INTERVAL_PARTITION` |  |
| `EFFECTIVE_DATE` |  |
| `FIRMWARE_VERSION` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Metric](../nodes/Metric.md).`notReported`
- [LabTest](../nodes/LabTest.md).`notReported`
- [AssayVersion](../nodes/AssayVersion.md).`notReported`
- [AlgorithmVersion](../nodes/AlgorithmVersion.md).`notReported`
- [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md).`notReported`
- [Device](../nodes/Device.md).`notReported`
