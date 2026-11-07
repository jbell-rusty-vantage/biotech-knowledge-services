---
id: "enum:PatentPublicationType"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L309-L315"]
aliases: ["patent publication type"]
capabilities: ["get"]
cardDigest: "sha256:94f913470241bb4c8854dd4c025598e86da1a7dd665db0db42d3234df0bfff78"
---
# Enum PatentPublicationType

Publication type of a patent document (merges pinned PatentApplication and GrantedPatent).

Id `enum:PatentPublicationType` · module [D8](../modules/D8.md) · 5 values · used by 1 fields · raw SDL [sdl:PatentPublicationType](../sdl/PatentPublicationType.graphql)

## Values (5)

| value | description |
| --- | --- |
| `APPLICATION` |  |
| `GRANT` |  |
| `REISSUE` |  |
| `REEXAMINATION_CERTIFICATE` |  |
| `UTILITY_MODEL` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Patent](../nodes/Patent.md).`publicationType`
