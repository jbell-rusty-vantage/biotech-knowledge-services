---
id: "enum:PolicyOutcome"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L296-L302"]
aliases: ["policy outcome"]
capabilities: ["get"]
cardDigest: "sha256:636718391855ec63d2a8fd86fcee36305919cd45c72196243cc96d34ca3937ed"
---
# Enum PolicyOutcome

verification.v1 PolicyOutcomeSchema.

Id `enum:PolicyOutcome` · module [K](../modules/K.md) · 5 values · used by 3 fields · raw SDL [sdl:PolicyOutcome](../sdl/PolicyOutcome.graphql)

## Values (5)

| value | description |
| --- | --- |
| `PASS` |  |
| `PASS_WITH_WARNINGS` |  |
| `REVIEW` |  |
| `FAIL` |  |
| `ABSTAIN` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Adjudication](../nodes/Adjudication.md).`policyOutcome`
- [Report](../nodes/Report.md).`policyOutcome`
- [Activity](../nodes/Activity.md).`policyOutcome`
