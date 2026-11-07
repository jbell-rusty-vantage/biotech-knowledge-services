---
id: "enum:AssociationKind"
kind: "enum"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D10.graphql#L86-L92"]
aliases: ["association kind"]
capabilities: ["get"]
cardDigest: "sha256:5aa823731af57093fada599dd2347773901d7bd9d7fa26c1865f85beebf0356e"
---
# Enum AssociationKind

Kind of materialized association (PLAN 6.1, directive 3.6). External scores (Open Targets, FAERS signals, third-party rankings) are not Associations: they are captured as Assertions by their producer.

Id `enum:AssociationKind` · module [D10](../modules/D10.md) · 5 values · used by 1 fields · raw SDL [sdl:AssociationKind](../sdl/AssociationKind.graphql)

## Values (5)

| value | description |
| --- | --- |
| `EVIDENCE_AGGREGATE` |  |
| `SIGNAL_DISPROPORTIONALITY` |  |
| `CO_OCCURRENCE` |  |
| `SIMILARITY` |  |
| `LINK_PREDICTION` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Association](../nodes/Association.md).`associationKind`
