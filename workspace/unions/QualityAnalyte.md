---
id: "union:QualityAnalyte"
kind: "union"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L345-L345"]
aliases: ["quality analyte"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:b6626dd79af0bccfcddcd40846b9d4097671240ed92dd8080b58732a6417a628"
---
# Union QualityAnalyte

What a quality result row measures or states. 3 members.

Id `union:QualityAnalyte` · module [D8](../modules/D8.md) · 3 members · raw SDL [sdl:QualityAnalyte](../sdl/QualityAnalyte.graphql)

## Members

- [ChemicalSubstance](../nodes/ChemicalSubstance.md) — Purpose: a chemical substance at the granularity of its FDA GSRS substance record — salts, esters, hydrates and the fre…
- [IngredientMaterial](../nodes/IngredientMaterial.md) — Purpose: the canonical identity of an actual material used as an ingredient or administered in a study — a supplier's g…
- [Constituent](../nodes/Constituent.md) — Purpose: a component concept with no single defined structure — a NUTRIENT with its own declaration convention ("vitami…

## Used by

- [QualityResult](../nodes/QualityResult.md).`analyte`
