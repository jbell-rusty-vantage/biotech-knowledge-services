---
id: "enum:MassBasis"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L230-L236"]
aliases: ["mass basis"]
capabilities: ["get"]
cardDigest: "sha256:3011d233093ace2fc737e80d1189793fdc63c43222549068a510b6033ac51399"
---
# Enum MassBasis

Mass basis of a stated mass — the one shared vocabulary (owner D1; consumed by D3 InterventionComponent.massBasis and D6 ComponentLineProperties.massBasis, adversarial-review stage): the listed salt/ester/hydrate form as named, its active moiety, a nutrient equivalent (e.g. 'as pyridoxine'), the material as is, or not stated. Conversions between bases are CALCULATED Assertions, never a re-declaration. No D1 field uses it since the review (content mass basis is a qualifier).

Id `enum:MassBasis` · module [D1](../modules/D1.md) · 5 values · used by 2 fields · raw SDL [sdl:MassBasis](../sdl/MassBasis.graphql)

## Values (5)

| value | description |
| --- | --- |
| `SALT_FORM` |  |
| `ACTIVE_MOIETY` |  |
| `NUTRIENT_EQUIVALENT` |  |
| `MATERIAL_AS_IS` |  |
| `UNSPECIFIED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [InterventionComponent](../nodes/InterventionComponent.md).`massBasis`
- `ComponentLineProperties`.`massBasis`
