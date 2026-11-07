# Fixture sinclair-recommendation-disclosure-asof — source (FC-2 + FC-1 quote 5)

- url: https://sinclair.hms.harvard.edu/david-sinclairs-affiliations
- title: David A. Sinclair’s Affiliations (current, and as archived 2021-12-09, 2021-12-31, 2022-03-08, 2022-05-22 and 2022-08-26)
- retrieved: 2026-10-08
- snapshot digest: sha256:4a360dd31a561a81b4a6fc70ec16f890322f6dcbe860aab7e31b78ff69688f3f
- kind: disconfirmation
- tool: firecrawl CLI 1.23.1 `scrape --only-main-content --max-age 0` (tool:firecrawl-scrape) for the current page (re-fetch identical); curl of Wayback raw `id_` copies and the CDX index (tool:wayback-cdx)
- archive copy 1 (latest before T): https://web.archive.org/web/20211209003848id_/https://sinclair.hms.harvard.edu/david-sinclairs-affiliations · sha256:ce81648413b5dd1dc70f5c6fcd7a4daac4f8abbf4fc649ee15e706f037c1b590, 47,428 B (adversarial review, 2026-10-08: HTTP 200 without redirect, memento-datetime Thu, 09 Dec 2021 00:38:48 GMT, payload SHA1 V4PBTQ6PT7O6VTT4FXU3P76LXQL7DEL2 = CDX digest; re-fetch identical)
- archive copies 2–4 (between T and the Tally Health addition): 20211231130656 (sha256:463ac5e5…), 20220308033751 (sha256:9ba0b8ae…), 20220522133510 (sha256:1efed7f2…), each HTTP 200 with memento-datetime equal to the requested timestamp and payload SHA1 equal to its CDX digest
- archive copy 5: https://web.archive.org/web/20220826113401id_/https://sinclair.hms.harvard.edu/david-sinclairs-affiliations · sha256:77ded8c7db5625178458ea9cce92ded7812f754ca03609807c7afbd80a92e4ae (HTTP 200, memento-datetime and CDX digest checked)
- correction (adversarial review): the fixtures-stage "2021-12-09" capture (sha256:b5e3f745…, 47,151 B) was the 2021-08-16 capture served for that request (its payload SHA1 OICSTY7XDUBCTJ5RYOYQGO2HFFHLEKFP is the CDX digest of row 20210816174031, locator c0); every finding read from it was re-read from the verified copy
- archive index: https://web.archive.org/cdx/search/cdx?url=sinclair.hms.harvard.edu/david-sinclairs-affiliations&collapse=digest&fl=timestamp,statuscode,digest,length (43 rows from 2021-03-02; digest in locators.yaml)
- recommendation span: Huberman Lab ep 52 page (sha256:3158acee44e12235c743aabb3750c7b0d0a807f560bb16477bef76529b0ae973), "Go to doctorsinclair.com …", published 2021-12-27

A guest recommends, on air, a biological-age test he says his lab developed (o5). The self-disclosure page today lists "Tally Health (2021-2024) F,I,E" (founder, investor, equity). The copy of the same page archived 18 days before the episode is self-dated "Updated September 18, 2020"; it lists Levels "(2021-present) E,A" (w3) and InsideTracker, and no Tally Health or Athletic Greens entry. The copies of 2021-12-31, 2022-03-08 and 2022-05-22 are the same in these respects; the copy of 2022-08-26 adds Tally Health "(2021-present) F,I,E," while still self-dated September 18, 2020 (a silent content change). The addition is therefore bounded to (2022-05-22, 2022-08-26], about five to eight months after the statement. The fixture disconfirms "it was disclosed" at statement time: disclosure is a time-indexed finding read from snapshots observed before T, never from today's page. The link from "doctorsinclair.com" to Tally Health is held as a RESOLUTION hypothesis (show-notes link "Aging Test Waitlist" → tallyhealth.com). No wrongdoing is asserted; the page itself warns that some entities may not yet have been added.

## Relationships exercised

OCCURS_IN (o5 → ep 52), APPEARS_IN (Sinclair GUEST), PUBLISHES; D7 HOLDS_ROLE / HOLDS_STAKE / RECEIVES_VALUE_FROM episodes read from dated snapshots of one Source (now, 2021-12-09, 2022-08-26; absence checks on 2021-12-31, 2022-03-08, 2022-05-22); kernel CONFLICT_RELEVANCE and RESOLUTION assessments.
