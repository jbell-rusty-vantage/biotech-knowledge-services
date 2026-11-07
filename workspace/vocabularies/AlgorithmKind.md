---
id: "enum:AlgorithmKind"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L193-L202"]
aliases: ["algorithm kind"]
capabilities: ["get"]
cardDigest: "sha256:44c861ce6a10b0d5d509a3a65a22d82b86c44326087b60e41812c06d2b97df74"
---
# Enum AlgorithmKind

Kind of algorithm (absorbs pinned Algorithm family kind and FirmwareVersion).

Id `enum:AlgorithmKind` · module [D4](../modules/D4.md) · 8 values · used by 1 fields · raw SDL [sdl:AlgorithmKind](../sdl/AlgorithmKind.graphql)

## Values (8)

| value | description |
| --- | --- |
| `EPIGENETIC_CLOCK` |  |
| `BLOOD_CHEMISTRY_CLOCK` |  |
| `GLYCAN_CLOCK` |  |
| `RISK_SCORE` |  |
| `WEARABLE_SCORE` |  |
| `SIGNAL_PROCESSING` |  |
| `FIRMWARE` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [AlgorithmVersion](../nodes/AlgorithmVersion.md).`algorithmKind`
