---
id: "enum:MetricDefinitionSource"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L89-L94"]
aliases: ["metric definition source"]
capabilities: ["get"]
cardDigest: "sha256:d0c12fa7fff78ac5e2695d61db00a65e6b2bb43016887a82d8eaea566c0705eb"
---
# Enum MetricDefinitionSource

Who defines the Metric: a terminology (LOINC), a vendor, a publication, or BellLabs (when no standard code exists).

Id `enum:MetricDefinitionSource` · module [D4](../modules/D4.md) · 4 values · used by 1 fields · raw SDL [sdl:MetricDefinitionSource](../sdl/MetricDefinitionSource.graphql)

## Values (4)

| value | description |
| --- | --- |
| `LOINC` |  |
| `VENDOR` |  |
| `PUBLICATION` |  |
| `BELLLABS` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Metric](../nodes/Metric.md).`definitionSource`
