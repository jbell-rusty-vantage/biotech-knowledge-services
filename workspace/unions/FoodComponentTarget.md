---
id: "union:FoodComponentTarget"
kind: "union"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D12.graphql#L143-L143"]
aliases: ["food component target"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:7e4b1641c496c03f3f2ccd22bab3461d633b026b22e2eb4b46098f57b9d74f66"
---
# Union FoodComponentTarget

Composition targets of FOOD_CONTAINS (2, both D1): a structure-defined substance (hydroxytyrosol, acrylamide) or a nutrient/class concept (energy, protein, vitamin B6, total polyphenols).

Id `union:FoodComponentTarget` · module [D12](../modules/D12.md) · 2 members · raw SDL [sdl:FoodComponentTarget](../sdl/FoodComponentTarget.graphql)

## Members

- [ChemicalSubstance](../nodes/ChemicalSubstance.md) — Purpose: a chemical substance at the granularity of its FDA GSRS substance record — salts, esters, hydrates and the fre…
- [Constituent](../nodes/Constituent.md) — Purpose: a component concept with no single defined structure — a NUTRIENT with its own declaration convention ("vitami…

## Used by

- [FoodItem](../nodes/FoodItem.md).`components`
