---
id: "enum:QuantityComparator"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L199-L212"]
aliases: ["quantity comparator"]
capabilities: ["get"]
cardDigest: "sha256:591068130d4e57e81726ea085667108f9370654163d3e649d2cd8c07a83a47e4"
---
# Enum QuantityComparator

Comparator of a stated quantity — the one comparator enum of the schema (owner D1, R-57). Consumers: D1 ContentEdgeProperties.comparator; D5 ProtocolStep.thresholdComparator and UseConstraint.doseComparator (D5 threshold enum retired); D8 specification fields (D8 spec enum retired: NOT_LESS_THAN -> GTE, NOT_MORE_THAN -> LTE, RANGE -> BETWEEN, EQUALS -> EQ, ABSENT_IN -> ABSENT; mapping in the release migration/v1-map.yaml enums.valueMappings); D12. BETWEEN keeps quantity null and the bounds in the Assertion qualifier range:<low>-<high>. OUTSIDE_REFERENCE_RANGE (D5 thresholds), ABSENT, CONFORMS_TO_DESCRIPTION, REFERENCE_ONLY and UNKNOWN (D8 specifications) carry no point value.

Id `enum:QuantityComparator` · module [D1](../modules/D1.md) · 12 values · used by 4 fields · raw SDL [sdl:QuantityComparator](../sdl/QuantityComparator.graphql)

## Values (12)

| value | description |
| --- | --- |
| `EQ` |  |
| `APPROX` |  |
| `GTE` |  |
| `GT` |  |
| `LTE` |  |
| `LT` |  |
| `BETWEEN` |  |
| `OUTSIDE_REFERENCE_RANGE` |  |
| `ABSENT` |  |
| `CONFORMS_TO_DESCRIPTION` |  |
| `REFERENCE_ONLY` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- `ContentEdgeProperties`.`comparator`
- [ProtocolStep](../nodes/ProtocolStep.md).`thresholdComparator`
- [UseConstraint](../nodes/UseConstraint.md).`doseComparator`
- [QualityResult](../nodes/QualityResult.md).`specComparator`
