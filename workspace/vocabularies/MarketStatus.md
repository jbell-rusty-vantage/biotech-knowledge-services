---
id: "enum:MarketStatus"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L224-L228"]
aliases: ["market status"]
capabilities: ["get"]
cardDigest: "sha256:612127e236e9b973d5a7f16aa51238cd12018e8a92a22650cf3ef781ec021aa1"
---
# Enum MarketStatus

Licence-level market status, separate from licence status (LNHPD: 'Licence Status: Active' with 'Market status: Not Marketed').

Id `enum:MarketStatus` · module [D8](../modules/D8.md) · 3 values · used by 1 fields · raw SDL [sdl:MarketStatus](../sdl/MarketStatus.graphql)

## Values (3)

| value | description |
| --- | --- |
| `MARKETED` |  |
| `NOT_MARKETED` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- [LegalStatus](../nodes/LegalStatus.md).`marketStatus`
