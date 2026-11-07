---
id: "enum:UseConstraintKind"
kind: "enum"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L192-L205"]
aliases: ["use constraint kind"]
capabilities: ["get"]
cardDigest: "sha256:2d96e2df8080c6ab9d42d67878647929018a347e9f696f92e376715820888f86"
---
# Enum UseConstraintKind

What kind of scoped use concern a UseConstraint identity is.

Id `enum:UseConstraintKind` · module [D5](../modules/D5.md) · 6 values · used by 1 fields · raw SDL [sdl:UseConstraintKind](../sdl/UseConstraintKind.graphql)

## Values (6)

| value | description |
| --- | --- |
| `CONDITION` | Use of S when a D2 Condition is present (contraindication, warning). |
| `POPULATION` | Use of S in a population (pregnant, under 18, pre-surgery). |
| `INTERACTION` | Use of S together with a co-exposure (drug, supplement, food, practice). |
| `DOSE_LIMIT` | Use of S above a dose band (upper limit, monograph maximum). |
| `ROUTE_OR_FORM` | Use of S by a route or in a form. |
| `TIMING` | Use of S at a time or with a separation window (`timingWindow`). |

Any value not listed here is not allowed in this release.

## Used by

- [UseConstraint](../nodes/UseConstraint.md).`constraintKind`
