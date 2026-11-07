---
id: "enum:InterventionKind"
kind: "enum"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L42-L56"]
aliases: ["intervention kind"]
capabilities: ["get"]
cardDigest: "sha256:548a7d65d1c22fd0f01e1cbf5a4b743ef86d256424fca5cf38e06612198d8c8b"
---
# Enum InterventionKind

Kind of intervention concept. Collapses pinned Treatment, Procedure, Lifestyle and the practice side of Exposure (Q-D5-28). DIETARY_PATTERN retired in the adversarial review (one diet, one node: D12 DietaryPattern).

Id `enum:InterventionKind` · module [D5](../modules/D5.md) · 8 values · used by 1 fields · raw SDL [sdl:InterventionKind](../sdl/InterventionKind.graphql)

## Values (8)

| value | description |
| --- | --- |
| `DRUG_REGIMEN` | A prescription or OTC drug used as a named regimen (e.g. intermittent low-dose rapamycin). |
| `SUPPLEMENT_REGIMEN` | A named supplement regimen that sources treat as one thing (plain intake of one supplement is NOT an Intervention: a step points at the D1/D6 record). |
| `BIOLOGIC_CELL_OR_GENE` |  |
| `PROCEDURE` | An act performed on or for a person (plasma exchange, laser, IV therapy). |
| `DEVICE_BASED` | A practice whose active element is a device (red-light panel, CPAP, sauna cabin as equipment). |
| `LIFESTYLE_PRACTICE` | A repeatable behaviour (morning sunlight viewing, resistance training, sauna bathing, cold exposure, NSDR). Any eating pattern defined by what, when or how much is eaten (ketogenic, Mediterranean, ti… |
| `COMBINATION` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Intervention](../nodes/Intervention.md).`kind`
