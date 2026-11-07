---
id: "rule:projection-rules"
kind: "rule"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:rules/projection-rules.yaml"]
aliases: ["projection-rules","projection rules"]
capabilities: ["get","slice"]
cardDigest: "sha256:2ac0117ce4a98612b47c530b104966a593e4d51a36ae3d4934f49772e7b0f90d"
---
# Projection rules

Authority: `rules/projection-rules.yaml` of the pinned release.

## Policies (11)

| id | decision | name | rule |
| --- | --- | --- | --- |
| `PR-01` | MD-D10-05 | status-nonimplication/v1 | One versioned status non-implication policy. A status fact never implies another without its own sourced record. |
| `PR-02` | OD-37 | goal-polarity/v1 | Harm, risk, avoidance and disconfirmed benefit are harm-facing; workflow queues, misstatement audits and ranking differences remain neutral. |
| `PR-03` | OD-19 | external-rating-mapping/v1 | Third-party text and scale are preserved. A rating maps to the verdict lattice only through a registered exact (provider, rubric version) row, as that provider's interpretation; it is never a BellLabs adjudication. Unknown rubric versions stay unmapped. Applied at query time (R-31), never stored. |
| `PR-04` | KN-15 | claim-lifecycle-decision-table/v1 | Frozen decision table for Assertion status and current-per-asserter projection. |
| `PR-05` | OD-25 / OD-24 | not-reported/v1 | A value, a missing value and an explicitly inapplicable value are distinct. Types with a notReported list (below) record checked-and-not-reported fields there; other types use the kernel FIELD_NOT_REPORTED Assertion on a COMPLETE snapshot. NOT_APPLICABLE is never inferred from absence; where materi… |
| `PR-06` | MD-D10-01 | nutrient-conversion-tables | Nutrient and mass-basis conversion rules are versioned, source-backed calculation tables distributed with the projection rules, not graph nodes; every derived value cites the rule/table version (rule:mw-ratio.v1, rule:nutrient-equivalent.v1, rule:daily-max.v1, rule:extract-ratio-dhe.v1 named by D1). |
| `PR-07` | MD-D10-02 / MD-D10-03 | decision-criterion-rules | Numeric thresholds live in a versioned typed DecisionCriterion rule artifact (value, unit, comparator, scope); query templates load allowed rules and never parse prose; the exact criteria set is bound by digest/version in the Assessment method/result artifact (no APPLIES_CRITERION edge). |
| `PR-08` | MD-D10-04 | ci-excludes-null | A derived ciExcludesNull is allowed only with interval, scale, null value and derivation evidence; it is not an unreported p-value nor a study-quality judgment. |
| `PR-09` | MD-D13-01 | frontier-anchors | Frontier anchors live in versioned frontier curation config keyed to Mechanism ids (frontiers.yaml); queries resolve the configured mapping and cite its version; no anchorMechanismKeys property. |
| `PR-10` | OD-23 / FU-01 / FU-11 | materialization | Compute first; materialize only when repeated whole-graph work or a measured p95 > 200 ms justifies it, with semantic-equivalence and invalidation proof. Each retained cache has authority, method version, input digest and freshness policy. Per-frontier influence is a versioned D10 ranking Report, n… |
| `PR-11` | OD-42 | hallmark-mapping-authority | A versioned curation Source is authoritative for hallmark mappings; a Report view cites that source and exact mapping version and is not a second authority. |

## Not-reported fields (7 types)

| type | module | field | values |
| --- | --- | --- | --- |
| [AlgorithmVersion](../nodes/AlgorithmVersion.md) | D4 | `notReported` | `METHOD_PRINCIPLE`, `INSTRUMENT_MODEL`, `REAGENT_KIT`, `SOFTWARE_VERSION`, `SPECIMEN`, `CALIBRATION_TRACEABILITY`, `PERFORMING_LAB`, `UNIT`, `MEASURAND_SYSTEM`, `METRIC_METHOD`, `VERSION_LABEL`, `INPUT_PLATFORM`, `INPUT_FEATURES`, `TRAINING_POPULATION`, `RELIABILITY`, `INTERVAL_DERIVATION`, `INTERVAL_PARTITION`, `EFFECTIVE_DATE`, `FIRMWARE_VERSION` |
| [AssayVersion](../nodes/AssayVersion.md) | D4 | `notReported` | `METHOD_PRINCIPLE`, `INSTRUMENT_MODEL`, `REAGENT_KIT`, `SOFTWARE_VERSION`, `SPECIMEN`, `CALIBRATION_TRACEABILITY`, `PERFORMING_LAB`, `UNIT`, `MEASURAND_SYSTEM`, `METRIC_METHOD`, `VERSION_LABEL`, `INPUT_PLATFORM`, `INPUT_FEATURES`, `TRAINING_POPULATION`, `RELIABILITY`, `INTERVAL_DERIVATION`, `INTERVAL_PARTITION`, `EFFECTIVE_DATE`, `FIRMWARE_VERSION` |
| [Device](../nodes/Device.md) | D4 | `notReported` | `METHOD_PRINCIPLE`, `INSTRUMENT_MODEL`, `REAGENT_KIT`, `SOFTWARE_VERSION`, `SPECIMEN`, `CALIBRATION_TRACEABILITY`, `PERFORMING_LAB`, `UNIT`, `MEASURAND_SYSTEM`, `METRIC_METHOD`, `VERSION_LABEL`, `INPUT_PLATFORM`, `INPUT_FEATURES`, `TRAINING_POPULATION`, `RELIABILITY`, `INTERVAL_DERIVATION`, `INTERVAL_PARTITION`, `EFFECTIVE_DATE`, `FIRMWARE_VERSION` |
| [LabTest](../nodes/LabTest.md) | D4 | `notReported` | `METHOD_PRINCIPLE`, `INSTRUMENT_MODEL`, `REAGENT_KIT`, `SOFTWARE_VERSION`, `SPECIMEN`, `CALIBRATION_TRACEABILITY`, `PERFORMING_LAB`, `UNIT`, `MEASURAND_SYSTEM`, `METRIC_METHOD`, `VERSION_LABEL`, `INPUT_PLATFORM`, `INPUT_FEATURES`, `TRAINING_POPULATION`, `RELIABILITY`, `INTERVAL_DERIVATION`, `INTERVAL_PARTITION`, `EFFECTIVE_DATE`, `FIRMWARE_VERSION` |
| [Metric](../nodes/Metric.md) | D4 | `notReported` | `METHOD_PRINCIPLE`, `INSTRUMENT_MODEL`, `REAGENT_KIT`, `SOFTWARE_VERSION`, `SPECIMEN`, `CALIBRATION_TRACEABILITY`, `PERFORMING_LAB`, `UNIT`, `MEASURAND_SYSTEM`, `METRIC_METHOD`, `VERSION_LABEL`, `INPUT_PLATFORM`, `INPUT_FEATURES`, `TRAINING_POPULATION`, `RELIABILITY`, `INTERVAL_DERIVATION`, `INTERVAL_PARTITION`, `EFFECTIVE_DATE`, `FIRMWARE_VERSION` |
| [ProtocolStep](../nodes/ProtocolStep.md) | D5 | `notReportedFields` | field names of the type (strings) |
| [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md) | D4 | `notReported` | `METHOD_PRINCIPLE`, `INSTRUMENT_MODEL`, `REAGENT_KIT`, `SOFTWARE_VERSION`, `SPECIMEN`, `CALIBRATION_TRACEABILITY`, `PERFORMING_LAB`, `UNIT`, `MEASURAND_SYSTEM`, `METRIC_METHOD`, `VERSION_LABEL`, `INPUT_PLATFORM`, `INPUT_FEATURES`, `TRAINING_POPULATION`, `RELIABILITY`, `INTERVAL_DERIVATION`, `INTERVAL_PARTITION`, `EFFECTIVE_DATE`, `FIRMWARE_VERSION` |
