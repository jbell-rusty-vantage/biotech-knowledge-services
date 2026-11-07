---
id: "enum:AdministrationRoute"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L158-L173"]
aliases: ["administration route"]
capabilities: ["get"]
cardDigest: "sha256:8aeb975728a32b6be749d7e0399da3c132fe00087ecd226efd01f7812969839c"
---
# Enum AdministrationRoute

Route of administration as stated. IN_MEDIUM: added to the culture medium (cell-free and in-vitro work; amount basis MEDIUM_CONCENTRATION, R-58).

Id `enum:AdministrationRoute` · module [D3](../modules/D3.md) · 14 values · used by 2 fields · raw SDL [sdl:AdministrationRoute](../sdl/AdministrationRoute.graphql)

## Values (14)

| value | description |
| --- | --- |
| `ORAL` |  |
| `SUBLINGUAL` |  |
| `DIETARY_ADMIXTURE` |  |
| `INTRAVENOUS` |  |
| `SUBCUTANEOUS` |  |
| `INTRAMUSCULAR` |  |
| `INTRAVITREAL` |  |
| `TOPICAL` |  |
| `INHALED` |  |
| `INTRANASAL` |  |
| `INTRAPERITONEAL` |  |
| `IN_MEDIUM` |  |
| `OTHER` |  |
| `NOT_REPORTED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md).`route`
- [InterventionComponent](../nodes/InterventionComponent.md).`route`
