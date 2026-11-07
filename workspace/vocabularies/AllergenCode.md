---
id: "enum:AllergenCode"
kind: "enum"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L148-L165"]
aliases: ["allergen code"]
capabilities: ["get"]
cardDigest: "sha256:89aac2bceda2dc9765fe6b0bd1d7103c20d1519ec0838092a9a52d7785452fe6"
---
# Enum AllergenCode

Declared allergens (FDA major food allergens plus the EU Annex II list).

Id `enum:AllergenCode` · module [D6](../modules/D6.md) · 16 values · used by 2 fields · raw SDL [sdl:AllergenCode](../sdl/AllergenCode.graphql)

## Values (16)

| value | description |
| --- | --- |
| `MILK` |  |
| `EGG` |  |
| `FISH` |  |
| `CRUSTACEAN_SHELLFISH` |  |
| `TREE_NUTS` |  |
| `PEANUTS` |  |
| `WHEAT` |  |
| `SOYBEANS` |  |
| `SESAME` |  |
| `CEREALS_CONTAINING_GLUTEN` |  |
| `CELERY` |  |
| `MUSTARD` |  |
| `LUPIN` |  |
| `MOLLUSCS` |  |
| `SULPHITES` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [LabelVersion](../nodes/LabelVersion.md).`containsAllergens`
- [LabelVersion](../nodes/LabelVersion.md).`mayContainAllergens`
