---
id: "enum:ViolationCategory"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L150-L164"]
aliases: ["violation category"]
capabilities: ["get"]
cardDigest: "sha256:fc89944a1317cc91e1b998b64ee13fd8911dd7caf4dfb93adca381c60c816163"
---
# Enum ViolationCategory

Violation category cited by an enforcement record (warning letter, recall, import alert).

Id `enum:ViolationCategory` · module [D8](../modules/D8.md) · 13 values · used by 1 fields · raw SDL [sdl:ViolationCategory](../sdl/ViolationCategory.graphql)

## Values (13)

| value | description |
| --- | --- |
| `UNAPPROVED_NEW_DRUG_CLAIMS` |  |
| `MISBRANDING` |  |
| `CGMP_DIETARY_SUPPLEMENT` |  |
| `CGMP_DRUG` |  |
| `UNDECLARED_ALLERGEN` |  |
| `CONTAMINANT` |  |
| `UNDECLARED_DRUG_INGREDIENT` |  |
| `POTENCY_OR_LABEL_CLAIM` |  |
| `NDI_NOT_NOTIFIED` |  |
| `EXCLUDED_ARTICLE` |  |
| `COMPOUNDING_INELIGIBLE_SUBSTANCE` |  |
| `STERILITY` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [RegulatoryRecord](../nodes/RegulatoryRecord.md).`violationCategories`
