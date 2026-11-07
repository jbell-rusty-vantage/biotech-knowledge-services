---
id: "enum:MechanismKind"
kind: "enum"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L40-L49"]
aliases: ["mechanism kind"]
capabilities: ["get"]
cardDigest: "sha256:0ab2b1804518cac5c27283e4f6a125ed634e6d316742d1a4064220081830c294"
---
# Enum MechanismKind

What kind of mechanism concept a Mechanism node is. Hallmarks and curated pathway records are kinds, not types.

Id `enum:MechanismKind` · module [D2](../modules/D2.md) · 4 values · used by 1 fields · raw SDL [sdl:MechanismKind](../sdl/MechanismKind.graphql)

## Values (4)

| value | description |
| --- | --- |
| `HALLMARK` | One of the twelve hallmarks of aging (Lopez-Otin 2023), BellLabs-curated. |
| `PROCESS` | A biological process (GO biological process scope, e.g. cellular senescence, macroautophagy). |
| `PATHWAY` | A curated pathway record (Reactome, WikiPathways, KEGG) with its own participant list. |
| `MOLECULAR_FUNCTION` | A molecular function or activity (e.g. sirtuin protein deacylation, complex I NADH dehydrogenase activity). |

Any value not listed here is not allowed in this release.

## Used by

- [Mechanism](../nodes/Mechanism.md).`mechanismKind`
