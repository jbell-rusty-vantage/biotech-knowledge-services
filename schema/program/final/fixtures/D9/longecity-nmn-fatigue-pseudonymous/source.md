# Fixture longecity-nmn-fatigue-pseudonymous — source (FC-6)

- url: https://www.longecity.org/forum/topic/116358-nmn-resveratrol-makes-me-super-tired/
- title: NMN + Resveratrol makes me SUPER tired - Regimens - LongeCity Forums
- retrieved: 2026-10-08
- snapshot digest: sha256:e2e8903f737df4b753840634384aa46ab6d29767509758eb4d980ab67135439a
- kind: harm
- tool: firecrawl CLI 1.23.1 `scrape --max-age 0` (tool:firecrawl-scrape); re-fetch sha256:4911f993d92fd8d171628d21aaefad950852847ea41509f9ccce15896e15ca9d (forum chrome changed: session ids, breadcrumbs, "Back to top"; every quote re-selected, offsets moved by +348 to +476)

A pseudonymous member of a longevity forum reports extreme tiredness after taking NMN and resveratrol together, says he does not know which one causes it and that he has read of the opposite effect; a second pseudonymous member reports a year later that he noticed nothing either way. The asserters are forum accounts (D9 Channel, channelKind ACCOUNT, isPseudonymous) identified only by handle and member id; no person is linked and no identity hypothesis is recorded. Profile fields (location, age) were deliberately left out of the repo, including from quote context. Answers built on this fixture must present the reports as anecdotes with their count of distinct asserters and the counter-report, never as evidence of an effect. The chunk produced by the fixture chunker over the first capture is not reproduced over the re-fetch while every locator is — the reason answers cite locators, not chunks.

## Relationships exercised

PUBLISHES (forum → thread), RENDITION_OF (thread page), OCCURS_IN (o-practice, o-ae, o-counter), asserters = Channel ACCOUNT nodes (kernel request K-6), CHUNK_OF / COVERS_LOCATOR / MENTIONS (c0 → NMN, resveratrol), D5 predicate CAUSES_ADVERSE_EFFECT (object D2 Condition "fatigue"; basisKind PERSONAL_EXPERIENCE, qualifier sourceKind:COMMUNITY; adversarial review replaced the D9-only REPORTS_ADVERSE_EXPERIENCE).
