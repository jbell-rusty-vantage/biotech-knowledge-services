---
id: "enum:ChannelKind"
kind: "enum"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D9.graphql#L29-L44"]
aliases: ["channel kind"]
capabilities: ["get"]
cardDigest: "sha256:7fe14c77b5ccba571526a1efb044f219ca02173d92e4287262ba7fc9e8698008"
---
# Enum ChannelKind

Kind of editorial container. An online community is a FORUM; a handle on any platform (named or pseudonymous) is an ACCOUNT.

Id `enum:ChannelKind` · module [D9](../modules/D9.md) · 8 values · used by 1 fields · raw SDL [sdl:ChannelKind](../sdl/ChannelKind.graphql)

## Values (8)

| value | description |
| --- | --- |
| `SHOW` | Podcast or video series published as numbered or dated works (Huberman Lab, Lifespan). |
| `VIDEO_CHANNEL` | A video platform channel that is not organized as one show. |
| `NEWSLETTER` |  |
| `BLOG_OR_SITE` | A blog, personal site or company education site that publishes articles and protocol pages. |
| `NEWS_OUTLET` |  |
| `ACCOUNT` | A platform account or handle (X, Instagram, TikTok, a forum member). Its operator may be unknown (isPseudonymous). |
| `FORUM` | A discussion community: web forum, subreddit, Discord server. |
| `EVENT_SERIES` | The media channel of a recurring meeting (conference talk recordings). |

Any value not listed here is not allowed in this release.

## Used by

- [Channel](../nodes/Channel.md).`channelKind`
