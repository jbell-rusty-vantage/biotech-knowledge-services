---
id: "enum:AssertionStatus"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L204-L212"]
aliases: ["assertion status"]
capabilities: ["get"]
cardDigest: "sha256:288a88086db15c5c8f41f5025e2434178b86a057cd074f4a83009800a30342b2"
---
# Enum AssertionStatus

Capture-fidelity status of an Assertion (is it an accurate record of what the asserter said at the span); never truth. Projection of CAPTURE_FIDELITY adjudications (see 09-reasoning.md, verdict mapping).

Id `enum:AssertionStatus` · module [K](../modules/K.md) · 7 values · used by 1 fields · raw SDL [sdl:AssertionStatus](../sdl/AssertionStatus.graphql)

## Values (7)

| value | description |
| --- | --- |
| `EXTRACTED` |  |
| `PROPOSED` |  |
| `ACCEPTED` |  |
| `REJECTED` |  |
| `DISPUTED` |  |
| `SUPERSEDED` |  |
| `UNRESOLVED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Assertion](../nodes/Assertion.md).`status`
