---
id: "enum:ProductKind"
kind: "enum"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L88-L102"]
aliases: ["product kind"]
capabilities: ["get"]
cardDigest: "sha256:fe41858c4bbf2b3bcf6c577ab0bef9d10e5720168db14cef6e3cab0f3ab8c0b8"
---
# Enum ProductKind

What kind of thing is sold. Replaces the pinned ProductKind (adds PREPARED_FOOD, SERVICE; drops BIOLOGIC, which is D8/D3 territory). The pinned drug-pipeline ProductStatus is not used by D6 (market status is assertions on offers and packages).

Id `enum:ProductKind` · module [D6](../modules/D6.md) · 12 values · used by 1 fields · raw SDL [sdl:ProductKind](../sdl/ProductKind.graphql)

## Values (12)

| value | description |
| --- | --- |
| `DIETARY_SUPPLEMENT` |  |
| `CONVENTIONAL_FOOD` |  |
| `PREPARED_FOOD` |  |
| `BEVERAGE` |  |
| `OTC_DRUG` |  |
| `PRESCRIPTION_DRUG` | A prescription drug product with a labeler of record (R-88); prescription-only status is a D8 LegalStatus (PRESCRIPTION_ONLY), scoped by jurisdiction. |
| `CONSUMER_DEVICE` |  |
| `MEDICAL_DEVICE` |  |
| `DIAGNOSTIC_TEST_SERVICE` |  |
| `SERVICE` |  |
| `COSMETIC` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Product](../nodes/Product.md).`productKind`
