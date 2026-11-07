# D9 — fixture candidates (research stage)

Agent A8, 2026-10-08. Raw captures are in the session scratch directory `C:\Users\Pinda\AppData\Local\Temp\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\ft\D9\cap\` (file names below). All digests are `sha256` of the captured representation as saved (firecrawl markdown, raw XML/JSON from APIs, or a derived text rendering where stated), computed with `sha256sum` in Git Bash; full list in `..\capture-hashes.txt`. Offsets are 0-based UTF-16 code-unit offsets as computed by Node `String.indexOf` over the saved file (equal to code-point offsets for these files except where noted), `[start, end)`. Quotes are copied verbatim from the capture; where the capture contains a non-breaking space (U+00A0) or thin space (U+2009) it is marked `⍽`.

Summary

| id | candidate | demonstrates | questions |
| --- | --- | --- | --- |
| FC-1 | Huberman Lab ep 52 (Sinclair) publisher transcript + YouTube rendition + RSS item | **unstructured-to-entity path (directive 3.8)**; practice report vs recommendation; sponsor read vs editorial; rendition divergence | CQ-CL-01, CQ-CL-02, CQ-CL-03, CQ-CL-08, CQ-PV-02, CQ-RC-05, Q-D9-01, Q-D9-02, Q-D9-06, Q-D9-20 |
| FC-2 | Sinclair self-disclosure page, now and as archived 2021-12-09 | financial interest reachable at statement time (D7 seam); **disconfirmation of "it was disclosed"** | CQ-CL-05, Q-D9-02, Q-D9-03, Q-D9-16 |
| FC-3 | *Lifespan* ep 4 RSS item with publisher correction and sponsors | **harm case** (spoken dose 1 g vs 1–2 mg); sponsor = equity/advisory tie; affiliate links | Q-D9-04, Q-D9-05, CQ-PV-04, CQ-CL-05, CQ-CM-04 |
| FC-4 | Attia article retelling RAPA-EX-01 + the trial's full text | **disconfirmation case** (negative trial, contested by a retelling); retelling fidelity against an internally inconsistent source; researcher-influencer COI | Q-D9-09, Q-D9-10, CQ-CL-04, CQ-PV-05, Q-D9-13 |
| FC-5 | FTC influencer warning letter + press release + 16 CFR 255.5 | **harm case** (undisclosed paid health promotion); disclosure placement | Q-D9-12, CQ-CL-05 |
| FC-6 | LongeCity thread "NMN + Resveratrol makes me SUPER tired" | **harm case** (community adverse-experience report, pseudonymous asserters, counter-report) | Q-D9-11, CQ-CL-07, CQ-CL-02 |
| FC-7 | Bryan Johnson protocol page + immortals.com + X post | recommendation by a founder-seller; Rx recommendations; lab-report images as evidence carriers | Q-D9-01, Q-D9-02, Q-D9-21, CQ-RC-05, Q-D9-17 |
| FC-8 | Topol Substack post retelling a Nature paper (Crossref) | explicit-citation retelling; figure reuse; AI-generated figure | CQ-PV-05, Q-D9-17, Q-D9-08 |
| FC-9 | NMN.com retelling + HL "Essentials" re-cut RSS item | retelling without citation (BellLabs match) [corrected in the adversarial review: the article cites the Essentials YouTube video at container level, with wrong year and title; link basis EXPLICIT_CITATION], lost qualification, re-cut not independent | CQ-CL-04, CQ-CL-06, Q-D9-07 |

Recommended trio for the fixtures stage: **FC-1** (unstructured-to-entity), **FC-3** (harm) and **FC-4** (disconfirmation), with **FC-2** as the recommendation-with-financial-interest fixture the packet direction asks for (it pairs with FC-1).

---

## FC-1 — Huberman Lab episode 52 with David Sinclair (unstructured-to-entity)

- url: https://www.hubermanlab.com/episode/dr-david-sinclair-the-biology-of-slowing-and-reversing-aging
- title: Dr. David Sinclair: The Biology of Slowing & Reversing Aging (Huberman Lab)
- retrieved: 2026-10-08 · tool: firecrawl CLI `scrape --max-age 0` · capture `hl52-episode.md` (150,870 B)
- sha256: `3158acee44e12235c743aabb3750c7b0d0a807f560bb16477bef76529b0ae973`
- second rendition: https://www.youtube.com/watch?v=n9IxomBusuw · firecrawl scrape · `yt-hl52.md` · sha256 `e5b79dd9cc6777dd910ac067b72f0f8083cd0f12fd2fb50d83396a98255ee730`
- third rendition (RSS): https://feeds.megaphone.fm/hubermanlab · curl · `huberman-feed.xml` · sha256 `85bb151158692d68a6baa64ef23ebe05d0b25b3302e2b8aef45d8f2528ad44e6` (item guid `8fd04ec7-dda7-4497-a731-be008c9f2521`, pubDate Mon, 27 Dec 2021 09:00:00 -0000)
- Quotes (publisher transcript; speaker label on the preceding line):
  1. "My 82 -year-old father, we take a gram of NMN every day." — turn "David Sinclair:", line 1049, offsets [71636, 71692). Practice report (REPORTS_PRACTICE, PERSONAL_EXPERIENCE), not a recommendation.
  2. "Now another important point, which is I'm not the same as everybody else. I have different microbiome, age, sex." — "David Sinclair:", line 1065, [71852, 71964). Qualification (INDIVIDUAL_VARIATION) two turns after quote 1.
  3. "I was one of the first people in InsideTracker as a board member and I'm still their scientific lead guy." — "David Sinclair:", line 1213, [82514, 82619). In-container disclosure of a role.
  4. "InsideTracker is one of them and you just do it a couple of times a year at a minimum." — "David Sinclair:", line 1289, [88338, 88424). Editorial recommendation of a service in which the speaker holds roles.
  5. "Go to doctorsinclair.com. You can get on that and you'll be one of the first people in the world to get this test and see what we're doing." — "David Sinclair:", line 1909, [137517, 137656). RECOMMENDS the speaker's own test (show notes link "Aging Test Waitlist" → tallyhealth.com, line 475).
  6. "ROKA, InsideTracker, Magic Spoon" — chapter "00:03:30" (`?timestamp=210`), line 479, [7784, 7816). Sponsor segment on the web rendition.
- Rendition quotes: YouTube captions "Today's episode is also brought to us by InsideTracker." (`yt-hl52.md` line 203, [9824, 9879)); YouTube description "Previous sponsors mentioned in this podcast episode may no longer be affiliated with us." (line 25, [1805, 1893)); RSS item "00:03:45 Sponsors: AG1, LMNT &amp; Waking Up" (content:encoded of the ep 52 item).
- Page caveat: "This transcript is currently under human review and may contain errors." (line 509, [12316, 12387)).
- 3.8 path to demonstrate: question "What does David Sinclair say he takes for NAD?" → chunk of the transcript text version containing quotes 1–2 (vector or MENTIONS NMN) → ClaimOccurrence (asserter Sinclair, container ep 52, speechAct REPORTS_PRACTICE, subject Sinclair, predicate TAKES, object NMN, literal 1 g/day, basis PERSONAL_EXPERIENCE) → SourceLocator (TextQuote, exact quote 1, offsets in the text version) → SourceSnapshot (sha256 above). Then show the verifier re-selecting the same span, and the YouTube rendition re-anchoring with different wording ("my 82-year-old father," / "a gram resveratrol").
- Answers: CQ-CL-01, CQ-CL-02, CQ-CL-03, CQ-CL-08, CQ-PV-02, CQ-RC-05, Q-D9-01 (quote 5), Q-D9-02 (with FC-2), Q-D9-06, Q-D9-20.
- Caution: speaker labels come from the publisher; the transcript is under review; no per-turn media time exists on this rendition.

## FC-2 — David A. Sinclair's Affiliations, current and as of 2021-12-09 (financial interest; disconfirmation of disclosure)

- url: https://sinclair.hms.harvard.edu/david-sinclairs-affiliations
- title: David A. Sinclair's Affiliations
- retrieved: 2026-10-08 · tool: firecrawl CLI `scrape --only-main-content --max-age 0` · capture `sinclair-affiliations.md` (25,505 B)
- sha256: `4a360dd31a561a81b4a6fc70ec16f890322f6dcbe860aab7e31b78ff69688f3f`
- archived version: https://web.archive.org/web/20211209003848id_/https://sinclair.hms.harvard.edu/david-sinclairs-affiliations · curl (Wayback raw `id_`) · `wb-aff-20211209.html` sha256 `b5e3f745d6f5e5ec18288628986b3df382a91ff4cabd1c4ff08f08d9471110ea`; derived text rendering (tags stripped, one line per text node, by a local Python script) `wb-aff-20211209.txt` sha256 `abd57027939fe7ede6ad44d2e23dc026618f678d9b8584e0a819445ad8b67c3d`
- archive index: Wayback CDX `collapse=digest` (`wb-cdx-aff.json` holds the error page of the first attempt; the successful listing was read on stdout: 40 rows, 2021-03-02 → 2025-12-11)
- Quotes (current page):
  1. "(Updated Oct 8th, 2024)" — header, line 7, [266, 289).
  2. "The year(s) after the company’s name are the years of his involvement, based on available information." — italic caveat, line 9, [659, 761).
  3. "[Tally Health](https://www.tallyhealth.com/)⍽(2021-2024) F,I,E" — "Consumer / Biotracking", line 111, [4889, 4951).
  4. "[Levels](https://www.levelshealth.com/)⍽Health (2021-present) E,A" — "ACTIVE ENGAGEMENTS", line 29, [1458, 1523).
  5. "(Segterra), Cambridge, MA B (2011-2017) I,A,IP (2011-present)" — InsideTracker line, line 33, [1602, 1663).
  6. "Athletic Greens, A" — "Consumer / Biotracking", line 113, [4953, 4971).
- Quotes (2021-12-09 archive, derived text):
  1. "(Updated September 18, 2020)" — line 18, [416, 444).
  2. "(Segterra), Cambridge, MA I,A,IP (2011-present) B(2011-2017)" — line 81, [3251, 3311). No "Tally Health" and no "Levels" line occurs anywhere in this version. [Corrected in the adversarial review: these bytes were the 2021-08-16 capture served for the 2021-12-09 request; the verified 2021-12-09 copy lists Levels "(2021-present) E,A" and still no Tally Health.]
- What it demonstrates: the guest's on-air recommendation of his own test (FC-1 quote 5, 2021-12-27) and his sponsor/affiliate relationships are reachable through D7 role assertions; the role that the current page dates "(2021-2024) F,I,E" was absent from the public page captured eighteen days before the episode. "Disclosed on self-disclosure page" is therefore a time-indexed finding (as-of snapshot), and a later page cannot be used to say it was disclosed then. Also: Caudalie changes from "(2013-present) IP,L" (2021) to "(2013-2023) E,A,IP,L" (2026) — a retroactive role addition (recorded time ≠ valid time).
- Answers: CQ-CL-05, Q-D9-02, Q-D9-03, Q-D9-16.
- Caution: the link between "doctorsinclair.com" (said on air) and Tally Health (show-notes link) is a hypothesis to record, not an identity.

## FC-3 — *Lifespan* episode 4 RSS item: publisher correction of a spoken dose (harm)

- url: https://feeds.megaphone.fm/NUOAC1101959196 (item "NMN, NR, Resveratrol, Metformin & Other Longevity Molecules | Episode 4", guid `ca1bf790-eba2-4477-a8a8-787b1189dddd`)
- title: Lifespan with Dr. David Sinclair (RSS feed)
- retrieved: 2026-10-08 · tool: curl (feed URL from iTunes Search API, collectionId 1601709306) · capture `lifespan-feed.xml` (310,930 B)
- sha256: `00a162e89013b6f07b225813d130166b4d0d4820b0423ed88f764b768e05adee` (item extract `lifespan-ep4-item.xml` sha256 `db1829e216c04001a1a35edf74389be7d20d5818f75f910879dfcc4e5b4cc147`)
- Quotes:
  1. "Correction and clarification: At time point 1:07:37, Dr. Sinclair says he takes 1 gram of Spermidine, but the active ingredient in the capsules is 1-2 milligrams. We apologize for the confusion." — item `description`, line 2964, [245746, 245940) (repeated in itunes:subtitle, itunes:summary, content:encoded).
  2. "(01:02:43) Dr. Sinclair’s Protocol for Longevity Molecules" — chapter list in `description`, line 3039, [247129, 247187).
  3. "<pubDate>Wed, 26 Jan 2022 09:00:00 -0000</pubDate>" — item element, line 3050, [247933, 247983).
  4. "InsideTracker - https://insidetracker.com/sinclair" — ep 4 item `description`, sponsor list after "Thank you to our sponsors:", line 2972, [246029, 246079) (the same item also lists Athletic Greens and Levels).
- What it demonstrates: the publisher disconfirms the speaker's quantity in show notes only (the audio still says "1 gram"); a media-time locator (1:07:37) on one rendition plus a correcting occurrence by a different asserter (the publisher, Lifespan Communications LLC). Sponsors of the container are organizations in which the host holds roles (FC-2 quotes 4–6).
- Answers: Q-D9-04, Q-D9-05, CQ-PV-04, CQ-CL-05, CQ-CM-04.
- Gap: the 1:07:37 span itself is audio; a transcript would need transcription (not done in this stage). Round-0006 recorded YouTube cue text "[1:08:12] … about a gram" for the same episode on 2026-10-03 (internal record, `S32`); not re-captured here.

## FC-4 — Attia's retelling of RAPA-EX-01 vs the trial's own spans (disconfirmation)

- url (retelling): https://peterattiamd.com/rapamycin-plus-exercise-trial
- title: Disappointing results from the first rapamycin-plus-exercise trial
- retrieved: 2026-10-08 · tool: firecrawl CLI scrape · capture `attia-rapa-exercise.md` (26,771 B)
- sha256: `52a977f7617793d3f1a9c8b1f91c2890a4f6566a3b50b9377096ca81a7eb4cbf`
- url (original): https://www.ebi.ac.uk/europepmc/webservices/rest/PMC13082878/fullTextXML · curl · `epmc-rapaex.xml` (174,711 B) · sha256 `9d139b7a222fa364d43cd14bf3dc05e77d5e908646ee830a553b721a60c8cebb`; PMID 41985884, DOI 10.1002/jcsm.70274, PMCID PMC13082878, registration ACTRN12624000790549 (PubMed MCP `get_article_metadata`)
- Quotes (retelling):
  1. "Its conclusion: The drug didn’t enhance functional gains from training, and appears to have modestly blunted them." — para 1, line 444, [7587, 7701).
  2. "and grip strength was −1.19 kg (p=0.344), each favoring the placebo arm over rapamycin" — results para, line 468, [13697, 13783).
  3. "There was a statistically significant but very small increase in HbA1c in the rapamycin group, and one case of pneumonia." — line 470, [14264, 14385).
  4. "My reaction to this study is that it’s interesting but quite limited, and a long way from the death knell for rapamycin that some have framed it as." — line 510, [17394, 17542).
  5. Date "May 2, 2026" — line 436, [7137, 7148).
- Quotes (original, JATS XML):
  1. "and for grip strength was −1.13⍽kg" (abstract; U+2009 before "kg") — [6251, 6282) region (verbatim check against capture: "and for grip strength was −1.13" at [6251, 6282)).
  2. "Grip strength showed a difference of −1.19" — results, [71743, 71785) (continues "kg (95% CI −3.52 to 1.18; p = 0.344; Cohen's d = −0.40)").
  3. "M.K. is the Chief Executive Officer of and holds equity in Optispan Inc." — Conflicts of Interest, [129287, 129359).
  4. "B.S. receives advertising revenue from his YouTube channel and is the founder of MicroVitamin, a dietary supplement company" — Conflicts of Interest, [128936, 129059).
- What it demonstrates: a negative trial (disconfirmation of the "cycling hypothesis") and a prominent retelling that accepts the numbers but contests the implication; the retelling's grip number matches the results span, not the abstract span — fidelity must be assessed against a located span, not "the paper". The HbA1c finding is in the results ("HbA1c (+1.74 mmol/mol; p = 0.030)") but not in the abstract. Authors include a YouTube creator with a supplement company and a company CEO: researcher-influencer seam (D7, D3).
- Answers: Q-D9-09, Q-D9-10, CQ-CL-04, CQ-PV-05, Q-D9-13.

## FC-5 — FTC warning letter to a health influencer (harm)

- url: https://www.ftc.gov/system/files/ftc_gov/pdf/warning-letter-gans.pdf
- title: FTC staff warning letter to Ms. Keri Gans, November 13, 2023
- retrieved: 2026-10-08 · tool: firecrawl CLI scrape (PDF parse); plain curl returned an HTML bot page (`ftc-letter-gans.pdf` is HTML, 1,301 B) · capture `ftc-letter-gans.md` (8,972 B)
- sha256: `f0586d856af2cd6d4470295fb7fa150979584f22a90a7f2081085a5b81577a07`
- companions: press release https://www.ftc.gov/news-events/news/press-releases/2023/11/ftc-warns-two-trade-associations-dozen-influencers-about-social-media-posts-promoting-consumption (`ftc-influencers-2023.md`, sha256 `0b0abcdc7e40a37e83e69f5d3b1b8d363237d2148d922f1d2ca3dba0a4712d69`); 16 CFR 255.5 via eCFR API (`ecfr-255-5.xml`, sha256 `16c0f3a687a32699d62685397f85212965fae18bbbb234f5fd802b68ea1fbda0`)
- Quotes:
  1. "November 13, 2023" — letter date, line 7, [81, 98).
  2. "It appeai-s that you were paid by the American Beverage" — page 1, line 27, [1375, 1430) (OCR error "appeai-s" is in the capture; keep verbatim, record OCR activity).
  3. "may be inadequate in the context of your post, because you did not identify the sponsor of the" — page 2, line 63, [3735, 3829).
  4. "Letters say influencers failed to adequately disclose that they were paid by industry" — press release dek, line 25, [1048, 1133).
  5. "A disclosure of a material connection does not require the complete details of the connection, but it must clearly communicate the nature of the connection sufficiently for consumers to evaluate its significance." — 16 CFR 255.5(a), [1376, 1588) of the XML.
- What it demonstrates: a regulator naming a person, a post (platform, date, format), the paying party and the disclosure deficiency kinds (placement in video vs caption, reliance on the platform tool, sponsor not identified). The graph needs a disclosure finding with placement, and the regulator letter (D8 owns regulatory actions) linking to the container and asserter.
- Answers: Q-D9-12, CQ-CL-05.
- Caution: not longevity-specific (aspartame/sugar); chosen because it is the cleanest primary record of influencer non-disclosure in health claims.

## FC-6 — LongeCity thread: community adverse-experience report (harm)

- url: https://www.longecity.org/forum/topic/116358-nmn-resveratrol-makes-me-super-tired/
- title: NMN + Resveratrol makes me SUPER tired - Regimens - LongeCity Forums
- retrieved: 2026-10-08 · tool: firecrawl CLI scrape · capture `longecity-nmn-tired.md` (32,596 B)
- sha256: `e2e8903f737df4b753840634384aa46ab6d29767509758eb4d980ab67135439a`
- Quotes:
  1. "Posted 22 February 2023 - 05:26 PM" — post #1 (handle Hermuller, permalink `?view=findpost&p=922108`), line 350, [13519, 13553).
  2. "Even a 1.5h evening nap, energy drink and pre-workout (has caffeine) could not keep me awake." — post #1, line 352, [13555, 13648).
  3. "I take it in the afternoon, Resv mixed into protein shake (seems to help absorption) and NMN capsule + water." — post #1, line 356, [13807, 13916).
  4. "Has anyone else experienced such extreme tiredness from this combo? I am unsure which one causes it." — post #1, line 358, [13918, 14018).
  5. "I don't think I noticed anything either way, more or less energy that is." — post #2 (handle Boopy!, `p=929300`, posted 24 February 2024), line 382, [14981, 15054).
- What it demonstrates: pseudonymous asserters, PERSONAL_EXPERIENCE basis, an adverse-effect report on a combination (attribution uncertain by the poster's own words), and a counter-report; a forum page that carries sponsor banners ("Sponsor: CrackAging.com", line 26). Answers must label these as anecdotes, never as evidence.
- Answers: Q-D9-11, CQ-CL-07, CQ-CL-02.

## FC-7 — Bryan Johnson's protocol page, Immortals, and an X post (recommendation by a founder-seller)

- url: https://blueprint.bryanjohnson.com/blogs/news/bryan-johnsons-protocol
- title: Bryan Johnson's Protocol – Blueprint Bryan Johnson
- retrieved: 2026-10-08 · tool: firecrawl CLI scrape · capture `bj-protocol.md` (93,174 B)
- sha256: `bd0f55c943f2b1a74bc0cff496a188cb7261814bdcfcc15added9ffb489b4680`
- companions: https://immortals.com (`immortals-home.md`, sha256 `ca8037a49c181dca737cf3b8dc649b4bac6e3f10e3899b7d4c29c53d123719a5`); https://x.com/bryan_johnson/status/1902044120807567436 (`x-bj.md`, sha256 `23521a20fc77500e78e0e7a169df0e3edd9550dfa240ea1c9a53a0b534764f19`)
- Quotes:
  1. "I promise you, if you implement my protocol, you will feel better than you can remember." — "What is the Blueprint Protocol?", line 418, [34252, 34340).
  2. "[Acarbose](https://immortals.com/products/acarbose "Acarbose") 400 mg daily" — "Rx / Prescriptions", line 1131, [71231, 71306).
  3. "[Jardiance](https://immortals.com/products/jardiance "Jardiance") 10 mg daily - good evidence of SGLT 2 inhibitors as a longevity intervention and calorie restriction mimetic in animal experimentation." — line 1137, [72120, 72321).
  4. Byline "Written by [Bryan Johnson](…)⍽•⍽01.23.2026" — line 221 (U+00A0 around the bullet).
  5. "Trusted by Bryan Johnson" — immortals.com, line 3, [55, 79).
  6. "HBOT ranks as one of the highest value health therapies I’ve done. Results from 60 sessions:" — X post, line 10, [260, 352); posted "2025-03-18T17:07:11.000Z".
- What it demonstrates: a RECOMMENDS occurrence (quote 1) on a page that also reports practice ("I take 5 mg a day", line 715), recommended items that are prescription products linked to a seller presenting itself under the asserter's name, and personal biomarker results shown as images (MediaAsset as evidence carrier, alt text describes lab reports).
- Answers: Q-D9-01, Q-D9-02, Q-D9-21, CQ-RC-05, Q-D9-17.
- Caution: ownership of Immortals by Bryan Johnson is stated on the site's own branding; the legal entity was not established (D7 to resolve).

## FC-8 — Topol's Ground Truths post retelling a Nature paper (explicit citation, figure reuse)

- url: https://erictopol.substack.com/p/loss-of-cell-identity-drives-human (via Substack API `/api/v1/posts/loss-of-cell-identity-drives-human`)
- title: Loss of Cell Identity Drives Human Aging
- retrieved: 2026-10-08 · tool: curl (Substack API) · capture `topol-cellidentity.json` (59,137 B)
- sha256: `3e88cd9db1062b3bf203f4c3799b13d8c3a76472e843d3816812098bf0d89827` (derived plain text `topol-cellidentity.txt` sha256 `b8445bbf6dadd8c1a2936667615ca48aa788dfc2f17482dadde6de5c7b441401`)
- original: DOI 10.1038/s41586-026-10955-0, "Written in development and lost in ageing: the grammar of cellular identity", Nature, published 2026-09-30 (Crossref API, `crossref-nature2026.json` sha256 `4804c4673459747f7e90aea623291c4214a1bc8cc3810abb8a848fe7563fb4a6`)
- Quotes (derived text):
  1. "We don’t know the relative contribution or interdependence of these 2 models in the aging process." — intro, [496, 594).
  2. "Two different models for why cells age, made with ChatGPT" — image caption, [595, 652).
  3. "(Figure from the Nature paper)" — section "Establishing and Maintaining Cellular Identity", [1581, 1611).
- What it demonstrates: same-day retelling with EXPLICIT_CITATION (DOI link in body_html), the retelling's own hedge, figure reuse from the original (rights and depiction), and an AI-generated explanatory image (generation mode).
- Answers: CQ-PV-05, Q-D9-17, Q-D9-08.

## FC-9 — NMN.com retelling of the HL "Essentials" re-cut (retelling without citation; re-cut) [adversarial review: the article does cite the video, container level only]

- url: https://www.nmn.com/news/huberman-lab-essentials-the-biology-of-slowing-reversing-aging-with-david-sinclair
- title: Huberman Lab Essentials: "The Biology of Slowing & Reversing Aging" with David Sinclair
- retrieved: 2026-10-08 · tool: firecrawl CLI scrape · capture `nmncom-retelling.md` (12,472 B)
- sha256: `f255165d628c757f4110e8decb20169185c09cb87d03e1f7631a7ac3dbef1e56`
- re-cut container: HL Essentials RSS item (guid `0c8f2198-b53a-11f0-adf1-ef0fcf25d744`, pubDate Thu, 30 Oct 2025, duration 2347 s, sponsors "AGZ by AG1", "David", "Eight Sleep") in `huberman-feed.xml` (sha256 above)
- Quotes:
  1. "Published: 11:12 am PST Nov 6, 2025" — header, line 50, [1066, 1101).
  2. "Dr. Sinclair personally takes a precursor to NAD+ called NMN (nicotinamide mononucleotide)." — "The Role of Supplements: NMN and NAD+", line 98, [5216, 5307).
  3. "He notes that taking NMN can double NAD+ levels in the blood within about two weeks, fueling the sirtuin defense system." — same paragraph, [5340, 5460).
- What it demonstrates: a retelling with no span citation (link basis BELLLABS_MATCH to the Essentials cut [corrected in the adversarial review: EXPLICIT_CITATION at container level, the reference list cites https://www.youtube.com/watch?v=Ykvkg2Jz3X8], which itself re-publishes the 2021 interview), loss of the original qualification (FC-1 quote 2 absent), and a claim (quote 3) whose original span was not located in this stage (open: verify against the Essentials audio or the 2021 transcript).
- Answers: CQ-CL-04, CQ-CL-06, Q-D9-07.
- Caution: NMN.com's ownership and commercial ties were not established; record as open for D7.
