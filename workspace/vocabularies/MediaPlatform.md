---
id: "enum:MediaPlatform"
kind: "enum"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D9.graphql#L47-L63"]
aliases: ["media platform"]
capabilities: ["get"]
cardDigest: "sha256:8f74ce4e107826548b8edd774302b70f45477c7f71106854ec6e79ca294280e3"
---
# Enum MediaPlatform

Distribution platform of a channel (replaces the pinned Platform node).

Id `enum:MediaPlatform` · module [D9](../modules/D9.md) · 15 values · used by 1 fields · raw SDL [sdl:MediaPlatform](../sdl/MediaPlatform.graphql)

## Values (15)

| value | description |
| --- | --- |
| `RSS` |  |
| `APPLE_PODCASTS` |  |
| `SPOTIFY` |  |
| `YOUTUBE` |  |
| `SUBSTACK` |  |
| `X` |  |
| `INSTAGRAM` |  |
| `TIKTOK` |  |
| `FACEBOOK` |  |
| `LINKEDIN` |  |
| `REDDIT` |  |
| `DISCORD` |  |
| `WEB_FORUM` |  |
| `WEB` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Channel](../nodes/Channel.md).`platform`
