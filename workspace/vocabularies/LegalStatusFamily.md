---
id: "enum:LegalStatusFamily"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L217-L221"]
aliases: ["legal status family"]
capabilities: ["get"]
cardDigest: "sha256:c905bf900cd1bc968362547897fd8d6f8b8039494b775e1fbee4f988e1ec4a64"
---
# Enum LegalStatusFamily

Family of a LegalStatusKind: market access (may it be sold, as what), exclusivity (who else may rely on the data or sell), IP right (patent and claim standing).

Id `enum:LegalStatusFamily` · module [D8](../modules/D8.md) · 3 values · used by 1 fields · raw SDL [sdl:LegalStatusFamily](../sdl/LegalStatusFamily.graphql)

## Values (3)

| value | description |
| --- | --- |
| `MARKET_ACCESS` |  |
| `EXCLUSIVITY` |  |
| `IP_RIGHT` |  |

Any value not listed here is not allowed in this release.

## Used by

- [LegalStatus](../nodes/LegalStatus.md).`statusFamily`
