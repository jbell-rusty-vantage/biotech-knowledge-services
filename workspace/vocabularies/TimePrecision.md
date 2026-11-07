---
id: "enum:TimePrecision"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L185-L192"]
aliases: ["time precision"]
capabilities: ["get"]
cardDigest: "sha256:ba8ed4bfffcf4ab2cebc13bba17ee49867c538c61ddc3dbcad726ab1587ac89e"
---
# Enum TimePrecision

Precision of a valid-time bound.

Id `enum:TimePrecision` · module [K](../modules/K.md) · 6 values · used by 30 fields · raw SDL [sdl:TimePrecision](../sdl/TimePrecision.graphql)

## Values (6)

| value | description |
| --- | --- |
| `INSTANT` |  |
| `DAY` |  |
| `MONTH` |  |
| `QUARTER` |  |
| `YEAR` |  |
| `DECADE` |  |

Any value not listed here is not allowed in this release.

## Used by

- `AssertedEdgeProperties`.`validFromPrecision`
- `AssertedEdgeProperties`.`validToPrecision`
- `IdentifierLinkProperties`.`validFromPrecision`
- `IdentifierLinkProperties`.`validToPrecision`
- [Assertion](../nodes/Assertion.md).`validFromPrecision`
- [Assertion](../nodes/Assertion.md).`validToPrecision`
- [Assertion](../nodes/Assertion.md).`validObservedAtPrecision`
- `ContentEdgeProperties`.`validFromPrecision`
- `ContentEdgeProperties`.`validToPrecision`
- `StudyRoleEdgeProperties`.`validFromPrecision`
- `StudyRoleEdgeProperties`.`validToPrecision`
- [RegistrationVersion](../nodes/RegistrationVersion.md).`versionDatePrecision`
- [RegistrationVersion](../nodes/RegistrationVersion.md).`primaryCompletionDatePrecision`
- [Publication](../nodes/Publication.md).`publishedAtPrecision`
- `RoleEdgeProperties`.`validFromPrecision`
- `RoleEdgeProperties`.`validToPrecision`
- `StakeEdgeProperties`.`validFromPrecision`
- `StakeEdgeProperties`.`validToPrecision`
- `ValueEdgeProperties`.`validFromPrecision`
- `ValueEdgeProperties`.`validToPrecision`
- `ControlEdgeProperties`.`validFromPrecision`
- `ControlEdgeProperties`.`validToPrecision`
- [Award](../nodes/Award.md).`datePrecision`
- [MediaWork](../nodes/MediaWork.md).`publishedAtPrecision`
- [Event](../nodes/Event.md).`startedAtPrecision`
- [Event](../nodes/Event.md).`endedAtPrecision`
- [Event](../nodes/Event.md).`announcedAtPrecision`
- [Event](../nodes/Event.md).`effectiveFromPrecision`
- [Event](../nodes/Event.md).`scheduledFromPrecision`
- [Event](../nodes/Event.md).`scheduledToPrecision`
