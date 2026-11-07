---
id: "enum:OrganizationStatus"
kind: "enum"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L167-L173"]
aliases: ["organization status"]
capabilities: ["get"]
cardDigest: "sha256:086940654c5da9365215507e3d51465969aa3fa89d9dd22d6909176be4df02b0"
---
# Enum OrganizationStatus

Registry or self-declared status of an organization record; the dated history is in Assertions (predicate ORGANIZATION_STATUS).

Id `enum:OrganizationStatus` · module [D7](../modules/D7.md) · 5 values · used by 1 fields · raw SDL [sdl:OrganizationStatus](../sdl/OrganizationStatus.graphql)

## Values (5)

| value | description |
| --- | --- |
| `ACTIVE` |  |
| `INACTIVE` |  |
| `DISSOLVED` |  |
| `MERGED_OR_ACQUIRED` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Organization](../nodes/Organization.md).`status`
