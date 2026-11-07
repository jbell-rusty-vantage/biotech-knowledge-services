---
id: "enum:SemanticVerdict"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L277-L293"]
aliases: ["semantic verdict"]
capabilities: ["get"]
cardDigest: "sha256:da56f4f5fe149f84c2318afe3c066b2c617d02cbd82bfab7c58d6a8efed88c2a"
---
# Enum SemanticVerdict

verification.v1 SemanticVerdictSchema (the verdict lattice), stored in SCREAMING_SNAKE spelling.

Id `enum:SemanticVerdict` · module [K](../modules/K.md) · 15 values · used by 4 fields · raw SDL [sdl:SemanticVerdict](../sdl/SemanticVerdict.graphql)

## Values (15)

| value | description |
| --- | --- |
| `PENDING_SEMANTIC_REVIEW` |  |
| `DIRECTLY_SUPPORTED` |  |
| `SUPPORTED_WITH_QUALIFICATION` |  |
| `PARTIALLY_SUPPORTED` |  |
| `CONTEXT_ONLY` |  |
| `CONTRADICTED` |  |
| `MIXED_OR_CONFLICTING` |  |
| `NOT_SUPPORTED` |  |
| `INSUFFICIENT_EVIDENCE` |  |
| `UNVERIFIABLE` |  |
| `SOURCE_UNAVAILABLE` |  |
| `LOCATOR_ERROR` |  |
| `PARSER_ERROR` |  |
| `DERIVED_VERIFIED` |  |
| `DERIVED_FAILED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Adjudication](../nodes/Adjudication.md).`verdict`
- [Claim](../nodes/Claim.md).`latestVerdict`
- [Assessment](../nodes/Assessment.md).`verdict`
- [Report](../nodes/Report.md).`verdict`
