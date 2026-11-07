---
id: "union:MechanismModulator"
kind: "union"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L236-L236"]
aliases: ["mechanism modulator"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:7f779d412e6efc18308a0982803b2247e9a7341d92b4270c11bd11258c75a301"
---
# Union MechanismModulator

Who can be projected as affecting a mechanism: a D1 substance (rolled up to active moiety) or a D5 non-substance intervention.

Id `union:MechanismModulator` · module [D2](../modules/D2.md) · 2 members · raw SDL [sdl:MechanismModulator](../sdl/MechanismModulator.graphql)

## Members

- [ChemicalSubstance](../nodes/ChemicalSubstance.md) — Purpose: a chemical substance at the granularity of its FDA GSRS substance record — salts, esters, hydrates and the fre…
- [Intervention](../nodes/Intervention.md) — Purpose: an intervention CONCEPT that is not simply a substance or a product: a practice (morning sunlight viewing, sau…

## Used by

- [Mechanism](../nodes/Mechanism.md).`affectedBy`
