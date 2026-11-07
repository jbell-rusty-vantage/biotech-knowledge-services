---
id: "enum:StudyKind"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L48-L62"]
aliases: ["study kind"]
capabilities: ["get"]
cardDigest: "sha256:38f1dc409e99d4d6c926ce066f36482adf2db381523f6e47ce3bf2b864c780c1"
---
# Enum StudyKind

Design of a study (identity-level; per-version registry design fields live on RegistrationVersion). A systematic review or meta-analysis is a Study when it reports pooled results; its versions are Publications.

Id `enum:StudyKind` · module [D3](../modules/D3.md) · 13 values · used by 1 fields · raw SDL [sdl:StudyKind](../sdl/StudyKind.graphql)

## Values (13)

| value | description |
| --- | --- |
| `INTERVENTIONAL_RANDOMIZED` |  |
| `INTERVENTIONAL_NONRANDOMIZED` |  |
| `INTERVENTIONAL_SINGLE_GROUP` |  |
| `OBSERVATIONAL_COHORT` |  |
| `OBSERVATIONAL_CASE_CONTROL` |  |
| `CROSS_SECTIONAL` |  |
| `CASE_REPORT` |  |
| `CASE_SERIES` |  |
| `PRECLINICAL_IN_VIVO` |  |
| `PRECLINICAL_IN_VITRO` |  |
| `SYSTEMATIC_REVIEW` |  |
| `META_ANALYSIS` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Study](../nodes/Study.md).`studyKind`
