---
id: "enum:WorkKind"
kind: "enum"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D9.graphql#L66-L82"]
aliases: ["work kind"]
capabilities: ["get"]
cardDigest: "sha256:fc86933cbadeb8fde0373f8d1a4d2b0f1c4a0a00a6729eaef48c3e424119b636"
---
# Enum WorkKind

Kind of media work. Scholarly works (articles, preprints, notices) are D3 Publications, not media works.

Id `enum:WorkKind` · module [D9](../modules/D9.md) · 13 values · used by 1 fields · raw SDL [sdl:WorkKind](../sdl/WorkKind.graphql)

## Values (13)

| value | description |
| --- | --- |
| `PODCAST_EPISODE` |  |
| `VIDEO` |  |
| `LIVESTREAM` |  |
| `TALK_RECORDING` |  |
| `NEWSLETTER_ISSUE` |  |
| `ARTICLE` |  |
| `WEB_PAGE` | A protocol, product-education or self-disclosure page that is quoted as a work. |
| `PRESS_RELEASE` |  |
| `SOCIAL_POST` |  |
| `FORUM_THREAD` |  |
| `BOOK` |  |
| `IMAGE` | A still image, chart or figure tracked as a work so its reuse across sources is visible (absorbs MediaAsset). |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [MediaWork](../nodes/MediaWork.md).`workKind`
