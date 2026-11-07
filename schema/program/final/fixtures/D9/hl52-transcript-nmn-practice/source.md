# Fixture hl52-transcript-nmn-practice — source (FC-1)

- url: https://www.hubermanlab.com/episode/dr-david-sinclair-the-biology-of-slowing-and-reversing-aging
- title: Dr. David Sinclair: The Biology of Slowing & Reversing Aging (Huberman Lab, episode 52)
- retrieved: 2026-10-08
- snapshot digest: sha256:3158acee44e12235c743aabb3750c7b0d0a807f560bb16477bef76529b0ae973
- kind: unstructured-to-entity
- tool: firecrawl CLI 1.23.1 `scrape --max-age 0` (tool:firecrawl-scrape); re-fetched in the fixtures stage (sha256:b9666e66b2495268577b5870996737df7f36da5f375fe34662d0057e7629088a — page chrome changed, every quote re-selected)
- second rendition: https://www.youtube.com/watch?v=n9IxomBusuw · firecrawl scrape · sha256:e5b79dd9cc6777dd910ac067b72f0f8083cd0f12fd2fb50d83396a98255ee730 (re-fetch sha256:408f5145a53ac9aeef3bcf64f5986a27624a4fa24193f6a5ef0a5ccc39faa0bb); oEmbed https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=n9IxomBusuw&format=json · curl (tool:youtube-oembed) · sha256:0cfe162c59af53b0293180e36569ff90abc2932860b73ff7876db7369f827883
- third rendition: RSS item guid 8fd04ec7-dda7-4497-a731-be008c9f2521 in https://feeds.megaphone.fm/hubermanlab · curl (tool:podcast-rss) · sha256:85bb151158692d68a6baa64ef23ebe05d0b25b3302e2b8aef45d8f2528ad44e6 (re-fetch identical)
- raw captures: session scratch `ft/D9/cap/` and `ft/D9/cap2/` (not in the repo; quotes in locators.yaml are short excerpts)

The publisher's episode page carries the show notes, a chapter list with `?timestamp=` media times and a speaker-labelled transcript that the publisher marks as "currently under human review". David Sinclair, the guest, reports that he and his father take a gram of NMN a day, immediately qualifies it ("I'm not the same as everybody else"), states his InsideTracker roles, recommends InsideTracker-type blood testing and, near the end, his own biological-age test. The same work is distributed as a YouTube video (caption track without speaker labels, different wording, sponsor reads for ROKA / InsideTracker / Magic Spoon) and as an RSS audio enclosure re-cut on 2025-05-21 with new sponsors (AG1 / LMNT / Waking Up). The fixture walks the directive 3.8 path: question → chunk (MENTIONS NMN) → COVERS_LOCATOR → accepted claim occurrence → TEXT_QUOTE locator → snapshot digest, and shows the verifier re-selecting the same locator in a later capture whose offsets moved by −145.

## Relationships exercised

PUBLISHES (s-pub), RENDITION_OF (s-ren-web, s-ren-yt, s-ren-audio), OCCURS_IN (o1–o6), APPEARS_IN (a-app-host HOST, a-app-guest GUEST), CONTENT_SPONSORED_BY in two rendition windows (sp-web-* from 2021-12-27; sp-rss-* from 2025-05-21T14:16:15Z), CHUNK_OF / COVERS_LOCATOR / MENTIONS (c52), plus kernel HAS_EVIDENCE (SUPPORTS / QUALIFIES / CONTEXT), DERIVED_FROM (o2 → o1) and D7 HOLDS_ROLE authorized by an in-container occurrence (o3).
