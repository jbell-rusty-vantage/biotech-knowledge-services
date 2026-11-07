---
id: "union:ContextExposure"
kind: "union"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L239-L239"]
aliases: ["context exposure"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:0c180001f564d079ef036713d6a9437e7dd5e28bbbb3d7e9a3a9acd9750cca30"
---
# Union ContextExposure

What an evidence context's group was exposed to.

Id `union:ContextExposure` · module [D2](../modules/D2.md) · 3 members · raw SDL [sdl:ContextExposure](../sdl/ContextExposure.graphql)

## Members

- [ChemicalSubstance](../nodes/ChemicalSubstance.md) — Purpose: a chemical substance at the granularity of its FDA GSRS substance record — salts, esters, hydrates and the fre…
- [IngredientMaterial](../nodes/IngredientMaterial.md) — Purpose: the canonical identity of an actual material used as an ingredient or administered in a study — a supplier's g…
- [Intervention](../nodes/Intervention.md) — Purpose: an intervention CONCEPT that is not simply a substance or a product: a practice (morning sunlight viewing, sau…

## Used by

- [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md).`exposures`
