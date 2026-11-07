---
id: "enum:RegulatoryRecordKind"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L34-L60"]
aliases: ["regulatory record kind"]
capabilities: ["get"]
cardDigest: "sha256:4c442eba1065c8a1009d35484198437bc9b35ef184796e1d3f7a8716d84fe0af"
---
# Enum RegulatoryRecordKind

Kind of authority-issued record. The kind fixes what the record can establish; the answer layer maps each kind to what it is NOT (03#CQ-AX-23).

Id `enum:RegulatoryRecordKind` · module [D8](../modules/D8.md) · 25 values · used by 1 fields · raw SDL [sdl:RegulatoryRecordKind](../sdl/RegulatoryRecordKind.graphql)

## Values (25)

| value | description |
| --- | --- |
| `NDI_NOTIFICATION` |  |
| `NDI_RESPONSE` |  |
| `GRAS_NOTICE` |  |
| `GRAS_RESPONSE` |  |
| `FOOD_ADDITIVE_PETITION` |  |
| `CITIZEN_PETITION` |  |
| `CITIZEN_PETITION_RESPONSE` |  |
| `NOVEL_FOOD_AUTHORISATION` |  |
| `SCIENTIFIC_OPINION` |  |
| `NHP_LICENCE` |  |
| `DRUG_APPLICATION_ACTION` |  |
| `DEVICE_CLEARANCE` |  |
| `DESIGNATION` |  |
| `REGISTRATION` |  |
| `INSPECTION_CLASSIFICATION` |  |
| `FORM_483` |  |
| `WARNING_LETTER` |  |
| `CLOSE_OUT_LETTER` |  |
| `RECALL` |  |
| `IMPORT_ALERT` |  |
| `SAFETY_COMMUNICATION` |  |
| `COURT_DECISION` |  |
| `PTAB_DECISION` |  |
| `PATENT_OFFICE_ACTION` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [RegulatoryRecord](../nodes/RegulatoryRecord.md).`recordKind`
