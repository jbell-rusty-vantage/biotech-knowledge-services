# D9 — Sources, media and discourse

Lens: community. Current fragments: W18 Communities, events and narrative arcs (5 node types: Community, Conference, Event, NarrativeArc, EventImpactAssessment), W21 Narrative media, speakers and claims (11: Platform, Channel, Series, Episode, EpisodeSegment, Claim, ClaimOccurrence, RelationshipAssertion, ClaimEvidenceAssessment, RetellingFidelityAssessment, ConflictRelevanceAssessment), W22 Media assets, depictions and rights (8: MediaAsset, MediaVariant, MediaAnnotation, GraphView, FigurePanel, ProductLabelRegion, MediaSuitabilityAssessment, MediaRightsRecord). Source intelligence (W19) and documents and chunks (W20) sit in the kernel brief; their questions are researched here.

## Scope

Who says what, where: podcasts, YouTube, newsletters, books, conferences, forums, communities; episodes and segments, claims and their occurrences, retellings and fidelity, speaker conflicts, source authority per claim kind, discovery and coverage of sources; media assets, figure panels and label regions as evidence carriers, and rights. The community lens of the ecosystem: who the influential voices are, how claims spread, where the audience is. Out of scope: the truth of the claims (D3 assessments), the speakers' corporate roles (D7 seam), kernel locator mechanics (K).

## Ecosystem to survey

The longevity media landscape (Huberman, Attia, Rhonda Patrick/FoundMyFitness, Bryan Johnson, Dave Asprey, Sinclair/Lifespan, Diamandis, Longevity Summit, RAADfest, ARDD), platforms and their data (YouTube Data API and transcripts, podcast RSS and Podcast Index, Spotify and Apple catalogs, Substack, Reddit, X), the sponsorship and affiliate economy of health media, retelling chains (paper → press release → episode → clip → post), community norms (r/longevity, Longecity, Discords), event calendars, how figures and label images are reused.

## Seed questions

- Who said this claim, in which episode segment, at what timestamp, and is it a retelling of a prior source with what fidelity?
- Which claims about compound X circulate, who originates them, who amplifies them, and which have evidence assessments (seam D3)?
- Does this speaker have a financial interest in what they recommend, and was it disclosed in the segment (seam D7)?
- Which sources are authoritative for which claim kinds, and which are blocked, paywalled or unstable for capture (source intelligence)?
- What happened at this event, who announced what, and which narrative arc does it belong to?
- Which figure panel or label region supports this assertion, under what rights?

## Retrieval patterns to consider

Claim → occurrence → segment → speaker with media-time locators; retelling chains as paths with fidelity edges; independence counting (CQ-AX-05); GDS: influence (PageRank over the retelling and citation graph), community detection over co-appearance, temporal spread of a claim; fulltext and vector search over transcripts and chunks (QS-8).

## Sources and tools to score (with D11)

YouTube Data API and caption endpoints, Podcast Index API, Apple and Spotify podcast catalogs, RSS, Substack, Reddit API (terms), X API (cost), Whisper-class transcription, Firecrawl for pages, the Wayback Machine and archive.today for snapshots, Crossref event data.

## Known problems and open questions

The independence-counting sample; turn-spanning assertions; `ClaimOccurrence` as a second Assertion label (OQ-4.8); whether W22 media assets belong in the first pass at all beyond figure panels and label regions; the `MediaSubjectTarget` union (75 members, 450 pairs) under R1.

## Deliverables

`../packets/D9/` per PLAN 5.1, including the source-authority register for the first 50 sources.
