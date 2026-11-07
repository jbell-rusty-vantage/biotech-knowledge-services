---
id: "union:PatternComponentTarget"
kind: "union"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D12.graphql#L140-L140"]
aliases: ["pattern component target"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:00ede373d5e832f59732e62537ed4350a31350e317db36152183acf6d6455c74"
---
# Union PatternComponentTarget

Members a PATTERN_COMPONENT edge may point at (3: two D12 types and the D1 nutrient concept for 'limit added sugars').

Id `union:PatternComponentTarget` · module [D12](../modules/D12.md) · 3 members · raw SDL [sdl:PatternComponentTarget](../sdl/PatternComponentTarget.graphql)

## Members

- [FoodItem](../nodes/FoodItem.md) — Purpose: a reference food concept as one composition or food-ontology source defines it, at the preparation it names ("…
- [FoodCategory](../nodes/FoodCategory.md) — Purpose: a food group as one classification system defines it (NOVA group 4 "ultra-processed food and drink products";…
- [Constituent](../nodes/Constituent.md) — Purpose: a component concept with no single defined structure — a NUTRIENT with its own declaration convention ("vitami…

## Used by

- [DietaryPattern](../nodes/DietaryPattern.md).`components`
