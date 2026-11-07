---
id: "enum:TrialPhase"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L65-L74"]
aliases: ["trial phase"]
capabilities: ["get"]
cardDigest: "sha256:a43051e54d8991e297ad803e6758da797fe5a26ded52b35f94ce8bcdc93f1266"
---
# Enum TrialPhase

Trial phase as registered (ClinicalTrials.gov vocabulary).

Id `enum:TrialPhase` · module [D3](../modules/D3.md) · 8 values · used by 2 fields · raw SDL [sdl:TrialPhase](../sdl/TrialPhase.graphql)

## Values (8)

| value | description |
| --- | --- |
| `NOT_APPLICABLE` |  |
| `EARLY_PHASE_1` |  |
| `PHASE_1` |  |
| `PHASE_1_2` |  |
| `PHASE_2` |  |
| `PHASE_2_3` |  |
| `PHASE_3` |  |
| `PHASE_4` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Study](../nodes/Study.md).`phase`
- [RegistrationVersion](../nodes/RegistrationVersion.md).`phase`
