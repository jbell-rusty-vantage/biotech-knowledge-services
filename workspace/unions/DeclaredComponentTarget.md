---
id: "union:DeclaredComponentTarget"
kind: "union"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L81-L81"]
aliases: ["declared component target"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:594af474d465b2f528ae004f0bf21394a7aaa5c52b7a9366192a86e4ad8572f1"
---
# Union DeclaredComponentTarget

What a declared composition line resolves to: a D1 ingredient material (incl. D1's unresolved-material sentinel), a D1 nutrient/constituent, or a D12 food item (prepared-food ingredient statements).

Id `union:DeclaredComponentTarget` · module [D6](../modules/D6.md) · 3 members · raw SDL [sdl:DeclaredComponentTarget](../sdl/DeclaredComponentTarget.graphql)

## Members

- [IngredientMaterial](../nodes/IngredientMaterial.md) — Purpose: the canonical identity of an actual material used as an ingredient or administered in a study — a supplier's g…
- [Constituent](../nodes/Constituent.md) — Purpose: a component concept with no single defined structure — a NUTRIENT with its own declaration convention ("vitami…
- [FoodItem](../nodes/FoodItem.md) — Purpose: a reference food concept as one composition or food-ontology source defines it, at the preparation it names ("…

## Used by

- [LabelVersion](../nodes/LabelVersion.md).`components`
