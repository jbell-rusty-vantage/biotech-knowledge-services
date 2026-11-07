---
id: "enum:RegistryKind"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L77-L89"]
aliases: ["registry kind"]
capabilities: ["get"]
cardDigest: "sha256:30345af9af6f8adfd552254989760263a0cc466a9fc3df545e976c7bfd3af3b9"
---
# Enum RegistryKind

Registry that issued the registration a version belongs to.

Id `enum:RegistryKind` · module [D3](../modules/D3.md) · 11 values · used by 1 fields · raw SDL [sdl:RegistryKind](../sdl/RegistryKind.graphql)

## Values (11)

| value | description |
| --- | --- |
| `CTGOV` |  |
| `ISRCTN` |  |
| `EU_CTR` |  |
| `EUDRACT` |  |
| `ANZCTR` |  |
| `CHICTR` |  |
| `DRKS` |  |
| `JRCT` |  |
| `CTRI` |  |
| `WHO_ICTRP` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [RegistrationVersion](../nodes/RegistrationVersion.md).`registry`
