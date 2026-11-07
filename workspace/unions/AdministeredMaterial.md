---
id: "union:AdministeredMaterial"
kind: "union"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L395-L395"]
aliases: ["administered material"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:0211dbc7e75479ee63575439b47bf9b445bfdfc783bea9dbf6c67b9b894daffb"
---
# Union AdministeredMaterial

What an intervention component administered: D1 material, D6 product variant, D5 intervention (lifestyle or named regimen), D12 food or dietary pattern (an eating pattern is administered as a DietaryPattern, R-63). A device used as a trial intervention is a ProductVariant (the D6 Product DELIVERS the D4 Device) or a D5 Intervention (R-72).

Id `union:AdministeredMaterial` · module [D3](../modules/D3.md) · 5 members · raw SDL [sdl:AdministeredMaterial](../sdl/AdministeredMaterial.graphql)

## Members

- [IngredientMaterial](../nodes/IngredientMaterial.md) — Purpose: the canonical identity of an actual material used as an ingredient or administered in a study — a supplier's g…
- [ProductVariant](../nodes/ProductVariant.md) — Purpose: a consumer-distinguishable realization of a Product — strength per unit, dosage form, flavor or jurisdiction (…
- [Intervention](../nodes/Intervention.md) — Purpose: an intervention CONCEPT that is not simply a substance or a product: a practice (morning sunlight viewing, sau…
- [FoodItem](../nodes/FoodItem.md) — Purpose: a reference food concept as one composition or food-ontology source defines it, at the preparation it names ("…
- [DietaryPattern](../nodes/DietaryPattern.md) — Purpose: a dietary pattern as one defining source states it — what foods, groups or nutrients it includes, emphasizes,…

## Used by

- [InterventionComponent](../nodes/InterventionComponent.md).`administers`
