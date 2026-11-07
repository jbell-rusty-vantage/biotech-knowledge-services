# Fixture lifespan-ep4-spermidine-correction — source (FC-3)

- url: https://feeds.megaphone.fm/NUOAC1101959196
- title: Lifespan with Dr. David Sinclair (RSS feed), item "NMN, NR, Resveratrol, Metformin & Other Longevity Molecules | Episode 4" (guid ca1bf790-eba2-4477-a8a8-787b1189dddd)
- retrieved: 2026-10-08
- snapshot digest: sha256:00a162e89013b6f07b225813d130166b4d0d4820b0423ed88f764b768e05adee
- kind: harm
- tool: curl of the RSS feed (tool:podcast-rss; feed URL from the iTunes Search API, tool:itunes-search-api, collectionId 1601709306); re-fetch identical
- companions: iTunes Search API https://itunes.apple.com/search?term=lifespan+david+sinclair&entity=podcast&limit=3 (digest in locators.yaml); Sinclair affiliations page (sha256:4a360dd31a561a81b4a6fc70ec16f890322f6dcbe860aab7e31b78ff69688f3f) for the host's interests in the sponsors, and its Wayback copies of 2021-12-31 (nearest before the episode), 2024-06-22 and 2024-08-28 (Athletic Greens bound), each with served memento-datetime and payload SHA1 checked against the CDX row (adversarial review)
- not captured: the audio enclosure https://traffic.megaphone.fm/NUOAC2502894018.mp3 (the spoken span at 1:07:37)

The publisher (Lifespan Communications LLC, feed copyright and itunes:author) appended a correction to the episode description: at 1:07:37 the host "says he takes 1 gram of Spermidine, but the active ingredient in the capsules is 1-2 milligrams". The audio is unchanged; the correction lives only in show notes, so a listener of the audio receives a quantity 500 to 1000 times the corrected amount. The fixture records the spoken occurrence through a media-time locator on an uncaptured audio rendition (expected verifier verdict SOURCE_UNAVAILABLE, status UNRESOLVED — an infrastructure verdict never rejects), the publisher's CORRECTS occurrence derived from it, the channel's operator (predicate-only OPERATED_BY), the episode's sponsors (Athletic Greens, InsideTracker, Levels — organizations in which the host lists roles or stakes; Levels and InsideTracker were on his self-disclosure page at the episode date, Athletic Greens only from 2024) and a sponsor vanity link recorded as the predicate LINKS_TO_OFFER. The risk finding is about the statement (a corrected quantity), not about spermidine. Research only, not dosing advice.

## Relationships exercised

PUBLISHES, predicate-only OPERATED_BY (op-ls), RENDITION_OF (audio enclosure), OCCURS_IN (o-spoken, o-correct), APPEARS_IN (HOST, CO_HOST), CONTENT_SPONSORED_BY (sp-ag, sp-it, sp-levels), predicate LINKS_TO_OFFER (lk-it), kernel DERIVED_FROM (o-correct → o-spoken, interim CORRECTS), dose-statement risk Assessment (hz-quantity, QUALITY), CONFLICT_RELEVANCE (cr-sponsors).
