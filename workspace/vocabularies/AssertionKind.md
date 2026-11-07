---
id: "enum:AssertionKind"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L215-L221"]
aliases: ["assertion kind"]
capabilities: ["get"]
cardDigest: "sha256:8f35fe96a5e6f82be1c92a929122e2cedf720c4572fa37dce7ffb11ca683c580"
---
# Enum AssertionKind

verification.v1 AssertionKindSchema minus report_assertion (report assertions live in the sealed report ledger, not the graph). CLAIM = a claim occurrence.

Id `enum:AssertionKind` · module [K](../modules/K.md) · 5 values · used by 1 fields · raw SDL [sdl:AssertionKind](../sdl/AssertionKind.graphql)

## Values (5)

| value | description |
| --- | --- |
| `FIELD` |  |
| `CLAIM` |  |
| `METRIC` |  |
| `RELATIONSHIP` |  |
| `COMPUTATION` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Assertion](../nodes/Assertion.md).`assertionKind`
