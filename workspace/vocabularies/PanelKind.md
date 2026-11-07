---
id: "enum:PanelKind"
kind: "enum"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L136-L145"]
aliases: ["panel kind"]
capabilities: ["get"]
cardDigest: "sha256:4e4e1e67dceaeb64c84c05152c4d1af56db7dd9fff46df962a68f4b74b278e15"
---
# Enum PanelKind

Which regulated or declared panel the label version is.

Id `enum:PanelKind` · module [D6](../modules/D6.md) · 7 values · used by 1 fields · raw SDL [sdl:PanelKind](../sdl/PanelKind.graphql)

## Values (7)

| value | description |
| --- | --- |
| `SUPPLEMENT_FACTS` |  |
| `NUTRITION_FACTS` |  |
| `DRUG_FACTS` |  |
| `PRESCRIBING_INFORMATION` | Prescribing information (SPL / package insert) of a prescription drug (R-88). |
| `MENU_DECLARATION` |  |
| `INGREDIENT_STATEMENT` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [LabelVersion](../nodes/LabelVersion.md).`panelKind`
