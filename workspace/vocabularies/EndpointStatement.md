---
id: "enum:EndpointStatement"
kind: "enum"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D13.graphql#L96-L101"]
aliases: ["endpoint statement"]
capabilities: ["get"]
cardDigest: "sha256:1807e5ee4c5501d1a01278d2536f4bec3e2299bdbade0ac5f68974b4879a8217"
---
# Enum EndpointStatement

What the source STATES about the primary endpoint(s) of a READOUT. A capture of the sponsor's or investigator's statement, never BellLabs' judgment of the result (that is a D3 StudyResult or an Assessment).

Id `enum:EndpointStatement` · module [D13](../modules/D13.md) · 4 values · used by 1 fields · raw SDL [sdl:EndpointStatement](../sdl/EndpointStatement.graphql)

## Values (4)

| value | description |
| --- | --- |
| `MET` |  |
| `NOT_MET` |  |
| `MIXED` |  |
| `NOT_STATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Event](../nodes/Event.md).`primaryEndpointStatement`
