---
id: "enum:PurchaseMode"
kind: "enum"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L238-L245"]
aliases: ["purchase mode"]
capabilities: ["get"]
cardDigest: "sha256:8d71f5f450c431f4c1e5b228ac94f163876683f30b5946683ecf06cf5181f0f3"
---
# Enum PurchaseMode

How the offer is bought (absorbs the pinned SubscriptionPlan node and OfferKind PURCHASE/SUBSCRIPTION_ONLY).

Id `enum:PurchaseMode` · module [D6](../modules/D6.md) · 6 values · used by 1 fields · raw SDL [sdl:PurchaseMode](../sdl/PurchaseMode.graphql)

## Values (6)

| value | description |
| --- | --- |
| `ONE_TIME` |  |
| `SUBSCRIPTION` |  |
| `ONE_TIME_OR_SUBSCRIPTION` |  |
| `PREORDER` |  |
| `SERVICE_BOOKING` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Offer](../nodes/Offer.md).`purchaseMode`
