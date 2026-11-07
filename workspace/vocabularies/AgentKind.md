---
id: "enum:AgentKind"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L444-L451"]
aliases: ["agent kind"]
capabilities: ["get"]
cardDigest: "sha256:243a70afe4d364544984b305a5c1cb17cb4d8a2dd9c38cee100bce4f7aa71b3c"
---
# Enum AgentKind

Kind of agent (Biolink AgentTypeEnum).

Id `enum:AgentKind` · module [K](../modules/K.md) · 6 values · used by 1 fields · raw SDL [sdl:AgentKind](../sdl/AgentKind.graphql)

## Values (6)

| value | description |
| --- | --- |
| `MANUAL_AGENT` |  |
| `AUTOMATED_AGENT` |  |
| `TEXT_MINING_AGENT` |  |
| `DATA_ANALYSIS_PIPELINE` |  |
| `COMPUTATIONAL_MODEL` |  |
| `MANUAL_VALIDATION_OF_AUTOMATED_AGENT` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Agent](../nodes/Agent.md).`agentKind`
