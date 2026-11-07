---
id: "dom:sources-documents-and-media"
kind: "domain"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/domains.yaml#sources-documents-and-media"]
aliases: ["sources-documents-and-media","sources documents and media"]
capabilities: ["get","slice"]
cardDigest: "sha256:a8e3fa577167aca545570100c9d39630dc1e0c05a46624afa64f3721b56f945f"
---
# Domain: Sources, media, discourse and capture tooling

Id `dom:sources-documents-and-media` · modules [D9](../modules/D9.md), [D11](../modules/D11.md) · 4 node types · 1 internal relationship types · seams to 2 other domains.

Channels (podcasts, video channels, accounts, event series), media works and the text chunks retrieval reads; discourse metrics; capture attempts and the bio-medical tooling action space that produces captured evidence.

## Questions this domain answers

- Who said this claim, in which media work and segment, and is it a retelling (basisKind CITED_FROM_PRIOR_WORK, DERIVED_FROM)?
- Which chunk mentions this entity, and which located span (COVERS_LOCATOR) and accepted assertion does it lead to?
- Which tool captured this source, when, and did the attempt fail (CaptureAttempt outcome)?

## Write guidance

A chunk never supports anything: support is HAS_EVIDENCE from a record to a SourceLocator. A segment (sponsor read, editorial) is the `segment:` qualifier of the occurrence. Every capture attempt, including failures, is recorded.

## Start with these types

- [Channel](../nodes/Channel.md) — Purpose: an editorial container that publishes works over time — a podcast show, a video channel, a newsletter, a site, a forum, or an account/handle…
- [MediaWork](../nodes/MediaWork.md) — Purpose: one editorial work — a podcast episode, video, talk recording, newsletter issue, article, protocol page, social post, forum thread, book or…
- [Chunk](../nodes/Chunk.md) — Purpose: a derived retrieval unit — a span of the text extracted from one captured SourceSnapshot (publisher transcript, caption track, ASR, OCR, HTM…
- [CaptureAttempt](../nodes/CaptureAttempt.md) — Purpose: one bounded attempt by a tool to search, fetch, resolve or parse a source for a subject that left no complete capture: a failure (401/403/42…

## Node types (4)

| type | module | uid token | summary |
| --- | --- | --- | --- |
| [CaptureAttempt](../nodes/CaptureAttempt.md) | D11 | `hu:capture-attempt:` | Purpose: one bounded attempt by a tool to search, fetch, resolve or parse a source for a subject that left no complete capture: a failure (… |
| [Channel](../nodes/Channel.md) | D9 | `hu:channel:` | Purpose: an editorial container that publishes works over time — a podcast show, a video channel, a newsletter, a site, a forum, or an acco… |
| [Chunk](../nodes/Chunk.md) | D9 | `hu:chunk:` | Purpose: a derived retrieval unit — a span of the text extracted from one captured SourceSnapshot (publisher transcript, caption track, ASR… |
| [MediaWork](../nodes/MediaWork.md) | D9 | `hu:media-work:` | Purpose: one editorial work — a podcast episode, video, talk recording, newsletter issue, article, protocol page, social post, forum thread… |

## Relationship types inside the domain (1)

| type | class | temporal | endpoints |
| --- | --- | --- | --- |
| [PUBLISHES](../relationships/PUBLISHES.md) | structural | recorded-only | Channel → MediaWork |

## Seams to other domains

### → [actors-and-institutions](actors-and-institutions.md) (2)

- [APPEARS_IN](../relationships/APPEARS_IN.md) · asserted · Person → MediaWork
- [CONTENT_SPONSORED_BY](../relationships/CONTENT_SPONSORED_BY.md) · asserted · MediaWork → ContentSponsor

### → [kernel-and-provenance](kernel-and-provenance.md) (4)

- [CHUNK_OF](../relationships/CHUNK_OF.md) · structural · Chunk → SourceSnapshot
- [COVERS_LOCATOR](../relationships/COVERS_LOCATOR.md) · derived · Chunk → SourceLocator
- [OCCURS_IN](../relationships/OCCURS_IN.md) · structural · Assertion → MediaWork
- [RENDITION_OF](../relationships/RENDITION_OF.md) · asserted · Source → Publication|MediaWork

## Tasks

- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md) (ingestion)
- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md) (ingestion)

## v1 navigation aliases

(none)
