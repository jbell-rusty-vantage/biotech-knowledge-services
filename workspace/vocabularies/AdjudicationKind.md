---
id: "enum:AdjudicationKind"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L305-L308"]
aliases: ["adjudication kind"]
capabilities: ["get"]
cardDigest: "sha256:6681798a4fa35534560b382ac160c81bbfe1c626415dba1f3d9b29fdb3117a04"
---
# Enum AdjudicationKind

CAPTURE_FIDELITY judges the record against its declared span (feeds Assertion.status); SUPPORT judges whether located evidence supports the proposition (world question; never changes status).

Id `enum:AdjudicationKind` · module [K](../modules/K.md) · 2 values · used by 1 fields · raw SDL [sdl:AdjudicationKind](../sdl/AdjudicationKind.graphql)

## Values (2)

| value | description |
| --- | --- |
| `CAPTURE_FIDELITY` |  |
| `SUPPORT` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Adjudication](../nodes/Adjudication.md).`adjudicationKind`
