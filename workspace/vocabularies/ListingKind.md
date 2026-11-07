---
id: "enum:ListingKind"
kind: "enum"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L229-L235"]
aliases: ["listing kind"]
capabilities: ["get"]
cardDigest: "sha256:900bb9a088daae5e8abd354d6a7f9c85ac16d0b387cfaea22592e55d555eebf9"
---
# Enum ListingKind

What kind of commerce page the listing is.

Id `enum:ListingKind` · module [D6](../modules/D6.md) · 5 values · used by 1 fields · raw SDL [sdl:ListingKind](../sdl/ListingKind.graphql)

## Values (5)

| value | description |
| --- | --- |
| `MARKETPLACE_DETAIL_PAGE` |  |
| `RETAILER_ITEM` |  |
| `DTC_PRODUCT_PAGE` |  |
| `MENU_ITEM_PAGE` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [MerchantListing](../nodes/MerchantListing.md).`listingKind`
