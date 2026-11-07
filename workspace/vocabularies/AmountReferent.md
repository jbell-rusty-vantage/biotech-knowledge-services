---
id: "enum:AmountReferent"
kind: "enum"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L193-L200"]
aliases: ["amount referent"]
capabilities: ["get"]
cardDigest: "sha256:9fb11ed89b51ffbe9ef1c98191b5072479c0ee61a221156bcfd43b525f51a982"
---
# Enum AmountReferent

What entity the declared amount refers to (CQ-PF-01). The salt-vs-moiety mass basis is a separate dimension, ComponentLineProperties.massBasis (D1 MassBasis; adversarial-review stage, answers D1 OQ-D1-24).

Id `enum:AmountReferent` · module [D6](../modules/D6.md) · 6 values · used by 1 fields · raw SDL [sdl:AmountReferent](../sdl/AmountReferent.graphql)

## Values (6)

| value | description |
| --- | --- |
| `AS_NAMED` |  |
| `AS_NUTRIENT` |  |
| `AS_EXTRACT_MASS` |  |
| `AS_MARKER_CONSTITUENT` |  |
| `BLEND_TOTAL` |  |
| `NOT_DECLARED` |  |

Any value not listed here is not allowed in this release.

## Used by

- `ComponentLineProperties`.`amountReferent`
