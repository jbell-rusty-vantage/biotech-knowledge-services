---
id: "enum:ReviewAction"
kind: "enum"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L160-L166"]
aliases: ["review action"]
capabilities: ["get"]
cardDigest: "sha256:83bd4d82468345d97a03aa37d814c28c36661fffafe1ba364bb2afa601591971"
---
# Enum ReviewAction

Action a REVIEW step prescribes when its trigger fires (pinned ReviewTriggerAction).

Id `enum:ReviewAction` · module [D5](../modules/D5.md) · 5 values · used by 1 fields · raw SDL [sdl:ReviewAction](../sdl/ReviewAction.graphql)

## Values (5)

| value | description |
| --- | --- |
| `REVIEW` |  |
| `PAUSE_STEP` |  |
| `STOP_PROTOCOL` |  |
| `ADJUST_DOSE` |  |
| `CONTACT_CLINICIAN` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ProtocolStep](../nodes/ProtocolStep.md).`reviewAction`
