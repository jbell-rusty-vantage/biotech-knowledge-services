---
id: "enum:CaptureOutcome"
kind: "enum"
module: "D11"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D11.graphql#L28-L33"]
aliases: ["capture outcome"]
capabilities: ["get"]
cardDigest: "sha256:f83530669cbb6bdd9b513b5e426ead272c6bdd08df3d72f88517ac8986ffbf06"
---
# Enum CaptureOutcome

How one attempt ended. Both values mean the attempt left no complete capture; neither supports an absence statement.

Id `enum:CaptureOutcome` · module [D11](../modules/D11.md) · 2 values · used by 1 fields · raw SDL [sdl:CaptureOutcome](../sdl/CaptureOutcome.graphql)

## Values (2)

| value | description |
| --- | --- |
| `PARTIAL` | Bytes were received but not all of the requested content (truncated page, image-only PDF, lossy rendition). When the bytes are kept, snapshotUid names the kernel SourceSnapshot (captureCompleteness P… |
| `FAILED` | No usable content: transport, policy, quota or parser failure (failureKind says which). Usually no snapshot exists. |

Any value not listed here is not allowed in this release.

## Used by

- [CaptureAttempt](../nodes/CaptureAttempt.md).`outcome`
