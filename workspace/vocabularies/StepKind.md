---
id: "enum:StepKind"
kind: "enum"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L75-L89"]
aliases: ["step kind"]
capabilities: ["get"]
cardDigest: "sha256:cd79f7287742e2cefc57b2a98fe7ba2c9fbbc9456758bec991fe1c28283be9fc"
---
# Enum StepKind

What a protocol step asks for (pinned ProtocolStepType's 23 values collapsed to what questions filter on; the source word stays in stepKindRaw).

Id `enum:StepKind` · module [D5](../modules/D5.md) · 7 values · used by 1 fields · raw SDL [sdl:StepKind](../sdl/StepKind.graphql)

## Values (7)

| value | description |
| --- | --- |
| `TAKE` | Take or apply a substance or product (ingest, inject, apply, infuse; route in `route`). |
| `PRACTICE` | Do a practice (exercise, light exposure, sleep timing, fasting, eating). |
| `AVOID` | Avoid or limit a means, or avoid it in a population/condition; carries `statedLevel`; its caution Assertion yields STATES_CONSTRAINT (derived). |
| `MEASURE` | Measure or test something (absorbs pinned MeasurementPlan); STEP_USES points at the D4 Metric. |
| `REVIEW` | Review / stop / adjust rule (absorbs pinned ProtocolAdjustmentRule): threshold* and reviewAction. |
| `CONSULT` | Consult a clinician. |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ProtocolStep](../nodes/ProtocolStep.md).`stepKind`
