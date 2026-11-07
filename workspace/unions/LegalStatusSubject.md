---
id: "union:LegalStatusSubject"
kind: "union"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L339-L339"]
aliases: ["legal status subject"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:74c05fd93b43e6cad9e6b7f59fe43cc162156927bf9917d6c1edd63a4836814b"
---
# Union LegalStatusSubject

What a legal standing is the standing of. 4 members; a device clearance is the standing of the Product that DELIVERS the Device (R-72).

Id `union:LegalStatusSubject` · module [D8](../modules/D8.md) · 4 members · raw SDL [sdl:LegalStatusSubject](../sdl/LegalStatusSubject.graphql)

## Members

- [ChemicalSubstance](../nodes/ChemicalSubstance.md) — Purpose: a chemical substance at the granularity of its FDA GSRS substance record — salts, esters, hydrates and the fre…
- [IngredientMaterial](../nodes/IngredientMaterial.md) — Purpose: the canonical identity of an actual material used as an ingredient or administered in a study — a supplier's g…
- [Product](../nodes/Product.md) — Purpose: the enduring marketed concept behind every variant, package and listing ("Tru Niagen", "AG1", "Big Mac"): what…
- [Patent](../nodes/Patent.md) — Purpose: one patent publication at one office (application, grant, reissue).

## Used by

- [LegalStatus](../nodes/LegalStatus.md).`statusOf`
