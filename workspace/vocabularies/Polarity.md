---
id: "enum:Polarity"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L242-L247"]
aliases: ["polarity"]
capabilities: ["get"]
cardDigest: "sha256:5eb516498f56f4bdc90026bf117b41f3c71935ae58f6db5f3f8bd8cb22e01a54"
---
# Enum Polarity

Affirms, denies, mixed or unknown; 'not reported' is never NEGATIVE.

Id `enum:Polarity` · module [K](../modules/K.md) · 4 values · used by 1 fields · raw SDL [sdl:Polarity](../sdl/Polarity.graphql)

## Values (4)

| value | description |
| --- | --- |
| `POSITIVE` |  |
| `NEGATIVE` |  |
| `MIXED` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Assertion](../nodes/Assertion.md).`polarity`
