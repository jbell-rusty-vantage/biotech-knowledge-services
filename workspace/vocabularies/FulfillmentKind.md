---
id: "enum:FulfillmentKind"
kind: "enum"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L248-L254"]
aliases: ["fulfillment kind"]
capabilities: ["get"]
cardDigest: "sha256:087961c083d8455387a82e0cc20ab62db3429840d649b484812e14eedc6374d5"
---
# Enum FulfillmentKind

Who ships the offer, as displayed (replaces the pinned FULFILLS_OFFER edge).

Id `enum:FulfillmentKind` · module [D6](../modules/D6.md) · 5 values · used by 1 fields · raw SDL [sdl:FulfillmentKind](../sdl/FulfillmentKind.graphql)

## Values (5)

| value | description |
| --- | --- |
| `SELLER` |  |
| `HOST` |  |
| `THIRD_PARTY` |  |
| `IN_STORE` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Offer](../nodes/Offer.md).`fulfillmentKind`
