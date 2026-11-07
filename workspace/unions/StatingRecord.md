---
id: "union:StatingRecord"
kind: "union"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L398-L398"]
aliases: ["stating record"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:9ac938a4f46f98bfd7b5424bc2b7cff4e6777854f64e7a2dacd672d9d6df7be8"
---
# Union StatingRecord

The two kinds of record that state a per-source study element.

Id `union:StatingRecord` · module [D3](../modules/D3.md) · 2 members · raw SDL [sdl:StatingRecord](../sdl/StatingRecord.graphql)

## Members

- [RegistrationVersion](../nodes/RegistrationVersion.md) — Purpose: one version of one registration as a registry stated it at a point in valid time — status, enrollment (actual…
- [Publication](../nodes/Publication.md) — Purpose: one scholarly work or one version of it — journal article, preprint version, systematic review version, protoc…

## Used by

- [StudyArm](../nodes/StudyArm.md).`statedIn`
- [StudyPopulation](../nodes/StudyPopulation.md).`statedIn`
- [OutcomeDefinition](../nodes/OutcomeDefinition.md).`statedIn`
- [StudyResult](../nodes/StudyResult.md).`statedIn`
