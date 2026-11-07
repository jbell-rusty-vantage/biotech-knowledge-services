---
id: "union:RegulatoryRecordTopic"
kind: "union"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L336-L336"]
aliases: ["regulatory record topic"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:6d61d71ed889d4044b21476efe50932e53721e79c7a85efa96b17c402a38dbdb"
---
# Union RegulatoryRecordTopic

What an authority record is about (besides the addressee): substance, ingredient material, product, lot. 4 members. A device record concerns the D6 Product, which DELIVERS the D4 Device (R-72; Q-D8-23). A court or PTAB decision reaches its patent through the LegalStatus it establishes (STATUS_FROM / STATUS_OF); an infringement-only holding is predicate-only ADJUDICATES_PATENT (D8 register predicateOnly).

Id `union:RegulatoryRecordTopic` · module [D8](../modules/D8.md) · 4 members · raw SDL [sdl:RegulatoryRecordTopic](../sdl/RegulatoryRecordTopic.graphql)

## Members

- [ChemicalSubstance](../nodes/ChemicalSubstance.md) — Purpose: a chemical substance at the granularity of its FDA GSRS substance record — salts, esters, hydrates and the fre…
- [IngredientMaterial](../nodes/IngredientMaterial.md) — Purpose: the canonical identity of an actual material used as an ingredient or administered in a study — a supplier's g…
- [Product](../nodes/Product.md) — Purpose: the enduring marketed concept behind every variant, package and listing ("Tru Niagen", "AG1", "Big Mac"): what…
- [Lot](../nodes/Lot.md) — Purpose: one production lot (batch) of one product or variant — the join key for "is the thing I hold real and lawful":…

## Used by

- [RegulatoryRecord](../nodes/RegulatoryRecord.md).`concerns`
