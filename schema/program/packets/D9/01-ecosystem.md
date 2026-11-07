# D9 — ecosystem survey: sources, media and discourse

Agent A8, research stage, 2026-10-08. Lens: community (with the science, economics and AI lenses where discourse touches them). Scope per brief: who says what, where, retelling whom, with what authority and what conflict; the containers (podcasts, episodes, videos, newsletters, posts, forums, talks), their renditions, and how a statement travels from a paper or a person to a clip, a post and an agent. Out of scope: whether the claims are true (D3), the speakers' corporate roles as such (D7), kernel locator mechanics (K).

Research is not medical advice. Nothing below assesses whether any intervention works; quotes are evidence of what was *said*, not of what is true.

## How to read this file

Every factual claim carries a source key `[Snn]`; each key resolves in the table below to URL · title · retrieval date. All retrievals were made on **2026-10-08** by agent A8 unless the row says otherwise. Raw captures and their sha256 digests are in scratch (`…\scratchpad\ft\D9\cap\`, listed in `_notes/fixture-candidates.md`); the tool that fetched each is in `_notes/tool-log.md`.

| key | URL | title | retrieved | tool |
| --- | --- | --- | --- | --- |
| S01 | https://www.hubermanlab.com/episode/dr-david-sinclair-the-biology-of-slowing-and-reversing-aging | Dr. David Sinclair: The Biology of Slowing & Reversing Aging (Huberman Lab episode page with show notes, timestamps and transcript) | 2026-10-08 | firecrawl scrape |
| S02 | https://feeds.megaphone.fm/hubermanlab | Huberman Lab (RSS feed, 448 items) | 2026-10-08 | curl |
| S03 | https://www.youtube.com/watch?v=n9IxomBusuw | The Biology of Slowing & Reversing Aging \| Dr. David Sinclair (YouTube) | 2026-10-08 | firecrawl scrape |
| S04 | https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=n9IxomBusuw&format=json | YouTube oEmbed record for n9IxomBusuw | 2026-10-08 | curl |
| S05 | https://open.spotify.com/episode/0vblYxPcynJPfu0Ap1osG9 | The Biology of Slowing & Reversing Aging \| Dr. David Sinclair (Spotify) | 2026-10-08 | firecrawl scrape |
| S06 | https://itunes.apple.com/lookup?id=1545953110&entity=podcastEpisode&limit=200 and https://itunes.apple.com/search?term=lifespan+with+dr+david+sinclair&entity=podcast | iTunes Lookup / Search API results (Huberman Lab; Lifespan with Dr. David Sinclair) | 2026-10-08 | curl |
| S07 | https://feeds.megaphone.fm/NUOAC1101959196 | Lifespan with Dr. David Sinclair (RSS feed, 22 items) | 2026-10-08 | curl |
| S08 | https://sinclair.hms.harvard.edu/david-sinclairs-affiliations | David A. Sinclair's Affiliations ("Updated Oct 8th, 2024") | 2026-10-08 | firecrawl scrape |
| S09 | https://web.archive.org/web/20211209003848id_/https://sinclair.hms.harvard.edu/david-sinclairs-affiliations | Same page as archived by the Internet Archive on 2021-12-09 ("Updated September 18, 2020") | 2026-10-08 (bytes re-fetched and verified in the adversarial review: the research-stage fetch had been served the 2021-08-16 capture) | curl (Wayback raw) |
| S10 | https://web.archive.org/cdx/search/cdx?url=sinclair.hms.harvard.edu/david-sinclairs-affiliations&fl=timestamp,digest,statuscode&collapse=digest | Wayback CDX index for the affiliations page | 2026-10-08 | curl |
| S11 | https://www.nmn.com/news/huberman-lab-essentials-the-biology-of-slowing-reversing-aging-with-david-sinclair | Huberman Lab Essentials: "The Biology of Slowing & Reversing Aging" with David Sinclair (NMN.com) | 2026-10-08 | firecrawl scrape |
| S12 | https://erictopol.substack.com/p/loss-of-cell-identity-drives-human (read via https://erictopol.substack.com/api/v1/posts/loss-of-cell-identity-drives-human) | Loss of Cell Identity Drives Human Aging (Ground Truths, Eric Topol) | 2026-10-08 | Substack API |
| S13 | https://api.crossref.org/works/10.1038/s41586-026-10955-0 | Written in development and lost in ageing: the grammar of cellular identity (Nature, 2026) | 2026-10-08 | Crossref API |
| S14 | https://peterattiamd.com/rapamycin-plus-exercise-trial | Disappointing results from the first rapamycin-plus-exercise trial (Peter Attia MD) | 2026-10-08 | firecrawl scrape |
| S15 | https://pubmed.ncbi.nlm.nih.gov/41985884/ (DOI 10.1002/jcsm.70274, PMCID PMC13082878) | Exercise and Weekly Sirolimus (Rapamycin) in Older Adults: RAPA-EX-01 Randomised, Double-Blind, Placebo-Controlled Trial | 2026-10-08 | PubMed MCP |
| S16 | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC13082878/fullTextXML | RAPA-EX-01 full text (JATS XML) | 2026-10-08 | curl (Europe PMC) |
| S17 | https://blueprint.bryanjohnson.com/blogs/news/bryan-johnsons-protocol | Bryan Johnson's Protocol – Blueprint Bryan Johnson | 2026-10-08 | firecrawl scrape |
| S18 | https://immortals.com | Immortals by Bryan Johnson (home page) | 2026-10-08 | firecrawl scrape |
| S19 | https://x.com/bryan_johnson/status/1902044120807567436 | Post by @bryan_johnson (2025-03-18, HBOT results) | 2026-10-08 | firecrawl scrape |
| S20 | https://www.ftc.gov/news-events/news/press-releases/2023/11/ftc-warns-two-trade-associations-dozen-influencers-about-social-media-posts-promoting-consumption | FTC Warns Two Trade Associations and a Dozen Influencers About Social Media Posts Promoting Consumption of Aspartame or Sugar | 2026-10-08 | firecrawl scrape |
| S21 | https://www.ftc.gov/system/files/ftc_gov/pdf/warning-letter-gans.pdf | FTC staff warning letter to Ms. Keri Gans, November 13, 2023 | 2026-10-08 | firecrawl scrape (PDF parse) |
| S22 | https://www.ecfr.gov/api/versioner/v1/full/2026-10-01/title-16.xml?section=255.5 | 16 CFR § 255.5 Disclosure of material connections | 2026-10-08 | eCFR API |
| S23 | https://www.longecity.org/forum/topic/116358-nmn-resveratrol-makes-me-super-tired/ | NMN + Resveratrol makes me SUPER tired (LongeCity forum) | 2026-10-08 | firecrawl scrape |
| S24 | https://www.reddit.com/r/longevity/search.json?q=NMN%20side%20effects&restrict_sr=1&limit=5 | Reddit JSON endpoint (HTTP 403) | 2026-10-08 | curl |
| S25 | https://www.iab.com/wp-content/uploads/2024/05/IAB_US_Podcast_Advertising_Revenue_Study_FY2023_May_2024.pdf | U.S. Podcast Advertising Revenue Study, FY2023 (IAB / PwC, May 2024) | 2026-10-08 | firecrawl scrape |
| S26 | https://agingpharma.org | ARDD 2026 — 13th Aging Research and Drug Discovery Meeting | 2026-10-08 | firecrawl scrape |
| S27 | https://api.altmetric.com/v1/doi/10.1038/s41586-026-10955-0 | Altmetric Details Page API response (HTTP 403) | 2026-10-08 | curl |
| S28 | https://www.crossref.org/deprecated | This tool is no longer available - Crossref | 2026-10-08 | tvly search (snippet) |
| S29 | https://erictopol.substack.com/api/v1/posts?limit=50 | Ground Truths post list (Substack API) | 2026-10-08 | curl |
| S30 | https://www.reddit.com/r/PeterAttia/comments/1otktry/attia_stops_rapamycin/ | Attia stops Rapamycin? : r/PeterAttia (search hit only; page not readable) | 2026-10-08 | firecrawl search |
| S31 | https://pmc.ncbi.nlm.nih.gov/articles/PMC11335702/ | Evaluation of off-label rapamycin use on oral health - PMC - NIH (search hit only; not read) | 2026-10-08 | firecrawl search |
| S32 | `biotech-meta/docs/schema/ontology-lab/round-0006-claim-and-document-provenance.md` | Ontology Lab Round 0006, Claim and Document Provenance (internal; its captures were made 2026-10-03 via Tavily) | read 2026-10-08 | local read |
| S33 | https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=Ykvkg2Jz3X8&format=json and https://www.youtube.com/watch?v=Ykvkg2Jz3X8 | Essentials: The Biology of Slowing & Reversing Aging \| Dr. David Sinclair (YouTube; oEmbed title / author and watch-page `uploadDate` 2025-10-30T05:01:11-07:00) | 2026-10-08 (adversarial review) | curl |
| S34 | https://web.archive.org/web/<ts>id_/https://sinclair.hms.harvard.edu/david-sinclairs-affiliations for ts = 20211231130656, 20220308033751, 20220413203738, 20220511151911, 20220522133510, 20220826113401, 20240622120817, 20240828162537 | Same page as archived on those dates (each served with HTTP 200, memento-datetime equal to ts and payload SHA1 equal to the CDX digest) | 2026-10-08 (adversarial review) | curl -D, no -L |

## 1. The shape of the ecosystem in one paragraph

A longevity statement is usually born in one of three places — a paper or trial (science), a person's practice or opinion spoken on a show (community), or a company's marketing (economics) — and then travels through **containers** (an episode, a video, a newsletter post, a social post, a forum thread, a conference talk) that are published as several **renditions** on several **platforms** (the publisher's web page with a transcript, an RSS audio enclosure, a YouTube video with captions, a Spotify page). Each hop can be a **retelling** that drops a qualification, changes a quantity, or turns a practice report into a recommendation. Money runs alongside: sponsor reads inside the container, affiliate and discount links in show notes, the speaker's own equity in companies whose products they mention, and stores owned by the person recommending. Regulators (FTC) police whether that money was disclosed, not whether the claim is true. The evidence for every hop exists, but it is scattered across renditions that change in place, and most of the discovery infrastructure that would let an agent follow a claim across hops is closed, keyed, or retired.

## 2. Actors, grouped by type

### 2.1 Creators and speakers (hosts, guests, writers, posters)

| actor | what they do (process) | artifacts they produce | capture notes |
| --- | --- | --- | --- |
| **Huberman Lab** (host Andrew Huberman; publisher listed in RSS and Apple as "Scicomm Media") [S02, S06] | Long-form interviews and solo episodes; reads sponsor messages at the start; publishes an episode page with show notes, chapter timestamps and a transcript; republishes edited "Essentials" cuts years later [S01, S02] | Episode web page (show notes, guest links, chapters with `?timestamp=` seconds, speaker-labelled transcript) [S01]; RSS item [S02]; YouTube video with description and caption track [S03] | The transcript page states: "This transcript is currently under human review and may contain errors." [S01]. Essentials re-cut of the Sinclair interview published 2025-10-30, duration 2,347 s, with sponsors "AGZ by AG1", "David", "Eight Sleep" [S02] |
| **David A. Sinclair** (guest on Huberman Lab; host of *Lifespan*) [S01, S07] | Speaks about his own practice ("what I do and what my father does") and promotes his own projects in guest appearances [S01]; hosts *Lifespan* with co-host Matthew LaPlante [S07]; maintains a self-disclosure page of affiliations with role codes and year bounds [S08] | Utterances in episodes; show notes with sponsor and affiliate links; self-disclosure page "Updated Oct 8th, 2024" [S08] | His affiliations page lists sponsors of his own show as companies in which he holds roles: "InsideTracker (Segterra) … B (2011-2017) I,A,IP (2011-present)", "Levels Health (2021-present) E,A", "Athletic Greens, A" [S08]; *Lifespan* ep 3 and ep 4 thank sponsors Athletic Greens, InsideTracker and Levels [S07] |
| **Lifespan with Dr. David Sinclair** (publisher "Lifespan Communications LLC") [S06, S07] | Weekly show; publishes chapters, sponsor list, Patreon, disclaimers and **corrections** in the RSS description [S07] | RSS item with correction text: "Correction and clarification: At time point 1:07:37, Dr. Sinclair says he takes 1 gram of Spermidine, but the active ingredient in the capsules is 1-2 milligrams. We apologize for the confusion." (ep 4, pubDate 26 Jan 2022) [S07] | The correction lives only in show notes, not in the audio; a media-time locator alone would reproduce the error |
| **Peter Attia** (The Drive; articles and premium newsletter) [S14] | Writes analytical articles on new studies, with numbered references; sells premium membership ("consider becoming a premium member") [S14] | Article "Disappointing results from the first rapamycin-plus-exercise trial", dated May 2, 2026, retelling RAPA-EX-01 and arguing against a negative reading: "My reaction to this study is that it's interesting but quite limited, and a long way from the death knell for rapamycin that some have framed it as." [S14] | Cookie-consent text dominates the scrape; references are machine-readable as text |
| **Eric Topol** (Ground Truths, Substack) [S12, S29] | Researcher-writer retelling new papers within days; links DOIs; reuses figures [S12] | Substack post (title, subtitle, post_date, updated_at, audience, wordcount, bylines, tags, body_html) [S12, S29]; e.g. a post dated 2026-09-30 retelling a Nature paper published 2026-09-30 [S12, S13] | Post includes "(Figure from the Nature paper)" and an image captioned "Two different models for why cells age, made with ChatGPT" [S12] — figure reuse and AI-generated media |
| **Bryan Johnson** (Blueprint; Immortals; X) [S17, S18, S19] | Publishes his personal protocol as a long page with dosages, links products he sells, posts results on X [S17, S19] | Protocol page "Written by Bryan Johnson • 01.23.2026" with prescription list linking to immortals.com product pages [S17]; Immortals home page "Trusted by Bryan Johnson" [S18]; X post 2025-03-18: "HBOT ranks as one of the highest value health therapies I've done. Results from 60 sessions:" [S19] | The protocol page mixes practice report ("I take 5 mg a day") and recommendation ("I promise you, if you implement my protocol, you will feel better than you can remember.") with links to products from a seller carrying his name [S17, S18] |
| **Researcher-influencers** | Trial authors who also run media channels or supplement companies | RAPA-EX-01 conflicts statement: "B.S. receives advertising revenue from his YouTube channel and is the founder of MicroVitamin, a dietary supplement company" and "M.K. is the Chief Executive Officer of and holds equity in Optispan Inc." [S16] | Shows that "speaker" and "study author" are the same Person across D9 and D3; the financial interest is disclosed in the paper, not in the media where the result is retold |
| **Community posters** (pseudonymous) | Report personal experiences, ask peers, counter-report [S23] | Forum posts with handle, location, post count, timestamp, edit stamp [S23] | e.g. "Even a 1.5h evening nap, energy drink and pre-workout (has caffeine) could not keep me awake." (post #1, 22 February 2023) and the reply "I don't think I noticed anything either way, more or less energy that is." (post #2, 24 February 2024) [S23] |
| **Commercial content sites** (e.g. NMN.com) | Publish "news" retellings of episodes about the substance in their name [S11] | Article with byline, "Published: 11:12 am PST Nov 6, 2025 \| Updated:2:10 p.m. PST Nov 19, 2025" [S11] | Retells "Dr. Sinclair personally takes a precursor to NAD+ called NMN" and cites the Essentials re-cut as a YouTube video in its reference list, with a wrong year (2023) and a title that is not the video's [S11, S33], but no span or timestamp [S11]; ownership of the site was not established in this stage (open question) |

### 2.2 Platforms, hosts and directories (where renditions live)

| actor | process / operation | data an agent can get | readiness (0 blocked · 1 scrape-only · 2 API without locators · 3 agent-ready) |
| --- | --- | --- | --- |
| **Megaphone** (podcast hosting; feeds at `feeds.megaphone.fm`) [S02, S07] | Serves RSS and audio enclosures; enclosure URLs carry an `?updated=` epoch that changes when audio is re-cut [S02] | RSS items: title, link, description, content:encoded, pubDate, itunes:season/episode/episodeType/author/duration/explicit/image, guid, enclosure (url, length, type) [S02, S07] | 3 for metadata; audio requires transcription; **no Podcasting 2.0 tags** (`podcast:transcript`, `podcast:chapters`, `podcast:person`) in either feed |
| **Apple Podcasts directory** (iTunes Search/Lookup API) [S06] | Indexes shows and episodes | collectionId, artistName, feedUrl, trackCount; per episode trackId, releaseDate, trackTimeMillis, episodeGuid (equals the RSS guid), episodeUrl [S06] | 3, but episode lookup returns only the 200 most recent episodes (HL ep 52 unreachable) |
| **YouTube** [S03, S04] | Video rendition with its own sponsor reads, description and caption track | oEmbed: title, author, thumbnail only [S04]; page scrape: uploaded date, length, views, likes, category, description, caption transcript without timestamps or speaker names [S03] | 1–2 (no YouTube Data API key in `.env`; scrape works; caption cue times not exposed by the scrape) |
| **Spotify** [S05] | Audio rendition and directory page | title, date "Dec 27, 2021", duration "2 hr 5 min" [S05] | 1 (no API key; metadata only) |
| **Substack** [S12, S29] | Newsletter hosting | Per-post JSON incl. body_html with outbound links [S12, S29] | 3 (undocumented JSON API) |
| **X** [S19] | Short posts and threads | author, posted ISO time, likes, reposts, text, thread [S19] | 1 (firecrawl scrape worked; official API not used; terms risk) |
| **Reddit** [S24] | Subreddit threads (r/longevity, r/Rapamycin, r/PeterAttia) | nothing: JSON endpoints return HTTP 403 without OAuth; firecrawl refuses the domain [S24, tool log] | 0 |
| **LongeCity** (forum) [S23] | Topic threads with tags | thread, posts, permalinks `?view=findpost&p=<id>`, handle, location, post count, timestamps, edit stamps [S23] | 1 (scrape; stable permalinks) |
| **Internet Archive** [S09, S10] | Archives pages; CDX lists captures with content digests | 43 distinct-digest rows (`collapse=digest`) for the Sinclair affiliations page, 2021-03-02 → 2026-08-23, in the listing stored on 2026-10-08 [S10] (the research stage read 40 rows to 2025-12-11 from stdout and did not store them); `id_` raw copies can be served from another capture, so each copy must be checked against its CDX row [S09, S34]; raw snapshot bytes via `id_` [S09] | 3 (CDX), availability API unreliable (returned empty) |

### 2.3 Sponsors, affiliates and sellers (the economics of health media)

- **Sponsor reads are rendition-specific and time-varying.** The HL ep 52 web chapter list says "00:03:30 ROKA, InsideTracker, Magic Spoon" [S01]; the YouTube caption track contains "Today's episode is also brought to us by InsideTracker." [S03]; the current RSS item for the same episode lists "AG1", "LMNT", "Waking Up", "Momentous" with "00:03:45 Sponsors: AG1, LMNT & Waking Up" and an enclosure re-cut stamp `updated=1747836975` (2025-05-21) [S02]. The YouTube description now warns: "Previous sponsors mentioned in this podcast episode may no longer be affiliated with us." [S03]. Durations differ by rendition: YouTube 2:10:42 [S03], RSS 7,556 s [S02], Spotify "2 hr 5 min" [S05].
- **Affiliate and discount links** are personalised per show: "insidetracker.com/sinclair", "athleticgreens.com/sinclair", "levels.link/sinclair" in *Lifespan* show notes [S07]; "athleticgreens.com/huberman" in Huberman Lab notes [S02].
- **Sponsor = financially tied company.** The *Lifespan* sponsors InsideTracker, Levels and Athletic Greens [S07] each appear on the host's own affiliations page with role codes (I,A,IP; E,A; A) [S08]. Sponsorship of content and personal financial interest are two different relationships that can coincide on the same pair.
- **Founder-sellers.** Bryan Johnson's protocol links prescription products ("Acarbose … 400 mg daily", "Jardiance … 10 mg daily") to immortals.com product pages [S17]; immortals.com presents itself as "Trusted by Bryan Johnson" [S18].
- **Market size.** "In 2023, podcast advertising saw a growth deceleration, posting a modest revenue increase of 5% to $1.9 billion" and is "on track to approach the $2.6 billion mark by 2026" [S25]. In the same study the 2023 advertiser category "Pharmaceuticals" includes "Pharmaceuticals (3.4%), Health / Wellness (3.5%)", and Health & Fitness content took 3% of podcast ad revenue in 2023 (2% in 2022) [S25].

### 2.4 Regulators and norms

- **FTC Endorsement Guides, 16 CFR 255.5**: "A disclosure of a material connection does not require the complete details of the connection, but it must clearly communicate the nature of the connection sufficiently for consumers to evaluate its significance." [S22]
- **Enforcement against health influencers.** On November 15, 2023 FTC staff warned two trade associations and 12 influencers; the press release subtitle: "Letters say influencers failed to adequately disclose that they were paid by industry" [S20]. Each letter identified specific posts and placement problems: "inconspicuous placement, ambiguous language, or the failure to clearly identify the sponsor of the posts" [S20]; recipients "could face civil penalties of up to $50,120 per violation" [S20].
- **The letter as an artifact** [S21]: dated "November 13, 2023", addressed to a named person, identifying a "July 13, 2023 post available as both an Instagram Video and a Reel", quoting the post, stating "It appears that you were paid by the American Beverage Association" (OCR text reads "appeai-s"), and grading the disclosure: not in the video itself, reliance on the "Paid partnership" tool, "#ad" in a small-print caption, and "you did not identify the sponsor of the post" [S21]. Disclosure therefore has a **placement** (in-video, audible, caption, built-in tool, elsewhere) and a **sponsor-identification** dimension, not just yes/no.
- **Publisher disclaimers** are in-container text: *Lifespan* notes say the show "is distinct from Dr. Sinclair's teaching and research roles at Harvard Medical School. The information provided in this show is not medical advice" [S07]; Huberman's intro says "this podcast is separate from my teaching and research roles at Stanford" [S01].

### 2.5 Science producers and their retellers (the retelling chain)

| hop | instance | what changes |
| --- | --- | --- |
| paper → paper's own abstract vs results | RAPA-EX-01: abstract "for grip strength was −1.13 kg (95% CI −3.52 to 1.18; p = 0.344)" vs results "Grip strength showed a difference of −1.19 kg (95% CI −3.52 to 1.18; p = 0.344; Cohen's d = −0.40)" [S15, S16] | The source is internally inconsistent; a retelling that quotes one number is faithful to one span and not the other |
| paper → expert newsletter | Attia retells: "and grip strength was −1.19 kg (p=0.344), each favoring the placebo arm over rapamycin"; adds "There was a statistically significant but very small increase in HbA1c in the rapamycin group, and one case of pneumonia." [S14] — the HbA1c result is in the full text ("HbA1c (+1.74 mmol/mol; p = 0.030)") but not in the abstract [S16] | Faithful to the results section; frames the negative trial as limited ("a long way from the death knell") [S14] — a disconfirmation that the retelling actively contests |
| paper → researcher newsletter | Topol retells a Nature paper (DOI 10.1038/s41586-026-10955-0, published 2026-09-30) on the same day, links the DOI, reuses a figure "(Figure from the Nature paper)" and adds an AI-generated schematic [S12, S13] | Explicit citation (link basis EXPLICIT_CITATION); figure reuse raises rights and depiction questions |
| episode → re-cut episode | HL "Essentials" (2025-10-30) re-publishes parts of the 2021 interview under new sponsors [S02] | Same speaker, same words, new container and new commercial context |
| episode → commercial retelling | NMN.com: "Dr. Sinclair personally takes a precursor to NAD+ called NMN … He notes that taking NMN can double NAD+ levels in the blood within about two weeks" [S11] | Container-level citation only: the reference list cites the Essentials re-cut on YouTube (wrong year 2023, different title) [S11, S33], no span or timestamp, so the span match is BellLabs'; the original's qualification ("I'm not the same as everybody else. I have different microbiome, age, sex." [S01]) is absent from the retelling |
| spoken statement → publisher correction | *Lifespan* ep 4 correction of "1 gram of Spermidine" to "1-2 milligrams" [S07] | The publisher itself disconfirms the speaker's quantity; a dosing error of roughly three orders of magnitude if the spoken number were followed |
| community experience → study | A survey paper on off-label rapamycin users and oral health exists (search hit, not read) [S31]; a Reddit thread "Attia stops Rapamycin?" (not readable) [S30] | Community reports become study inputs; community threads discuss a figure's practice change — both unreachable or unread in this stage |

### 2.6 Communities

- **LongeCity** is a long-running forum ("Advocacy & Research for Unlimited Lifespans") with sponsor banners ("Sponsor: CrackAging.com") inside thread pages [S23]. Posts are pseudonymous (handle, location, post count), timestamped, editable ("Edited by Hermuller, 22 February 2023 - 06:23 PM") and carry personal-experience reports including adverse ones [S23].
- **Reddit** (r/longevity, r/Rapamycin, r/PeterAttia) is where much of the current discussion is indexed by search engines [S30, tool log #31], but it is not capturable without an approved API app [S24].
- **Discords** and private groups were not surveyed (no access); they are out of reach for a public-only graph and should be listed as not capturable.

### 2.7 Conferences and talks (seam to D13)

ARDD 2026 (13th Aging Research and Drug Discovery Meeting) lists "Main Program, October 1-3" with forums including a "Longevity Medicine Forum, October 1", corporate sponsor logos (Morgan Stanley, Estée Lauder Companies), and says lectures from the previous meeting "are now available online" with a link to a YouTube channel [S26]. A talk is therefore an Event (D13) with a recording that is an episode-like container on a platform (D9). Talk recordings were not captured in this stage.

### 2.8 Discovery and archive infrastructure (seam to D11)

- **Altmetric** (paper → news/blog/social mentions): "As of 10 November 2025, all users need an API key to access the Altmetric Details Page API." [S27] — no key available.
- **Crossref Event Data**: "The Event Data public API was sunset on 23 April 2026." [S28] — retired; the brief listed it as a source to score.
- **Podcast Index** and **YouTube Data API**: no keys in the repo `.env` (only key names were checked); not exercised.
- **Wayback CDX** works and is the only way found to reconstruct what a self-disclosure page said at the time of a statement [S09, S10].

## 3. Artifact interviews (at least two real instances per artifact type, read end to end)

### 3.1 Podcast episode item (RSS)

Instances: HL ep 52 (guid `8fd04ec7-dda7-4497-a731-be008c9f2521`, pubDate Mon, 27 Dec 2021 09:00:00, itunes:episode 52, duration 7556) [S02]; HL Essentials Sinclair (guid `0c8f2198-b53a-11f0-adf1-ef0fcf25d744`, pubDate Thu, 30 Oct 2025 08:00:00, duration 2347) [S02]; *Lifespan* ep 4 (guid `ca1bf790-eba2-4477-a8a8-787b1189dddd`, pubDate Wed, 26 Jan 2022 09:00:00, itunes:season 1, itunes:episode 4, duration 4210, enclosure length 101086178) [S07].

Fields observed: `title`; `link` (publisher page or Spotify-for-Podcasters URL); `description` and `content:encoded` (free-text summary, **sponsor list with affiliate URLs**, **chapter timestamps**, **corrections**, disclaimers, credits); `pubDate`; `itunes:title`, `itunes:episodeType` (full), `itunes:season`, `itunes:episode` (present on 297 of 448 Huberman Lab items and 10 of 22 Lifespan items; absent on the Essentials item), `itunes:author` (publisher entity: "Scicomm Media", "Lifespan Communications LLC"), `itunes:image`, `itunes:subtitle`, `itunes:summary`, `itunes:duration` (seconds), `itunes:explicit`; `guid` (stable, not a permalink); `enclosure` (url with `?updated=` epoch, length, type). Channel level: title, description, language, copyright, itunes:owner/name/email, itunes:category, itunes:type [S07].

Not present: speaker roles, guest identity, transcript link, structured chapters, structured sponsor list, any identifier of the recording (no ISRC/DOI). Speaker and sponsor facts must be extracted from free text.

### 3.2 Episode web page with transcript (publisher rendition)

Instances: HL ep 52 page [S01]; YouTube watch page for the same episode [S03] (a second rendition of the same work).

HL page fields: title; embedded player links to YouTube, Apple Podcasts (`?i=1000546195888`), Spotify; "About this Guest" links (Lifespan Podcast, Twitter, Instagram, YouTube, book, "Aging Test Waitlist" → tallyhealth.com, Harvard lab site); chapter list with `?timestamp=<seconds>` anchors (30 chapters, first "00:00:00 Dr. David Sinclair, Harvard Medical School", sponsor chapter "00:03:30 ROKA, InsideTracker, Magic Spoon"); review-status banner; transcript as speaker-labelled turns ("Andrew Huberman:", "David Sinclair:", 358 turns) without per-turn time; links to "Disclaimer & Disclosures" [S01].

YouTube page fields: title, visibility, uploader, "Uploaded at: 2021-12-27", length 2:10:42, views 3,717,651, likes 82,185, category, description (with event promotion, sponsor disclaimer, guest links, chapters), caption transcript (line-broken, no speaker names, turn changes as "- ", no timestamps in the scrape) [S03].

Divergences that matter for locators: wording ("My 82 -year-old father" [S01] vs "my 82-year-old father," [S03]; "So it's a gram of resveratrol" [S01] vs "So it's a gram resveratrol" [S03]); sponsor content (see 2.3); duration. A quote locator must name its rendition and normalization; a media-time locator is valid only for one rendition at one observation time.

### 3.3 Self-disclosure page (financial interests)

Instances: Sinclair affiliations page as of 2026-10-08 ("Updated Oct 8th, 2024") [S08]; the same page as archived 2021-12-09 ("Updated September 18, 2020") [S09]. Second instance of a disclosure artifact of a different kind: the RAPA-EX-01 conflicts-of-interest statement [S16].

Fields (page): update date (self-stated), caveat ("This list is for information purposes only and is not meant to represent a formal list of affiliations"; "The year(s) after the company's name are the years of his involvement, based on available information."), legend of role codes ("F=Founder; I=Investor; E=Equity; A=Advisor/Consultant; B=Board of Directors; IP=Inventor on licensed patents; L=Funding for laboratory"), section headings (ACTIVE ENGAGEMENTS / PAST ENGAGEMENTS / by sector), one line per organization with optional link, location, group membership ("an EdenRoc Sciences company"), product scope ("NAD boosters"), year range per role, role codes; an invited-talks list [S08].

Change between versions: the 2021-12-09 capture has no Tally Health line but already lists "Levels (2021-present) E,A"; Tally Health "(2021-present) F,I,E," appears between the copies of 2022-05-22 and 2022-08-26 under an unchanged "Updated September 18, 2020" stamp, and "Athletic Greens, A" between 2024-06-22 and 2024-08-28; the 2026 page has "Tally Health (2021-2024) F,I,E" and "Levels Health (2021-present) E,A"; Caudalie changes from "(2013-present) IP,L" to "(2013-2023) E,A,IP,L" [S08, S09, S34]. (Corrected in the adversarial review: the research stage had read a 2021-08-16 capture served for the 2021-12-09 request and reported Levels as absent.) So a role that started in 2021 (Tally Health) was not on the public page in December 2021, and roles were later added retroactively — valid time and recorded time diverge, and "was it disclosed at the time" needs the archived capture.

Fields (paper COI, [S16]): per-author initials, revenue sources, founder/CEO/equity roles with company names, CRO employment, drug provenance ("purchased commercially from Pfizer; the manufacturer had no input into the trial").

### 3.4 Newsletter / article post

Instances: Topol Substack post [S12]; Attia article [S14]; NMN.com article [S11].

Fields: id (Substack numeric id), canonical URL, title, subtitle/dek, byline(s), post date and update date (Substack ISO; NMN.com "Published … | Updated …"; Attia "May 2, 2026"), audience (Substack "everyone" vs paid), tags, word count, body with outbound links (DOIs, journal URLs), embedded images with captions, numbered reference list (Attia: "1. Stanfield B, Leroux B, Kaeberlein M, Jones J, Lucas R. Exercise and weekly sirolimus (rapamycin) in older adults: RAPA-EX-01 …" [S14]), calls to subscribe or donate. Citation quality ranges from DOI links [S12] to numbered references [S14] to a container-level reference with wrong metadata (year and title of the cited video) [S11, S33].

### 3.5 Short social post and forum post

Instances: X post by @bryan_johnson [S19]; LongeCity posts #1 and #2 [S23]; Instagram post described inside an FTC letter [S21] (the post itself was not captured).

Fields (X): author display name and handle, "Posted: 2025-03-18T17:07:11.000Z", likes, reposts, text (bulleted biomarker claims: "+ telomerase activity of a 12 year old, associated with biological age"), thread continuation [S19]. Fields (forum): thread title, tags (nmn, nad+, resveratrol), post number, permalink with post id (`p=922108`, `p=929300`), handle, member status, post count, location, posted time, edited time, body [S23].

### 3.6 Regulatory letter about media disclosure

Instances: FTC press release [S20]; FTC warning letter to an individual influencer [S21].

Fields: issuing agency, date, addressee, platform(s), post date and format, quoted post text, the paying party ("American Beverage Association"), the deficiency list, enclosed notice of penalty offenses, response deadline ("contact agency staff within 15 days"), staff attorney [S20, S21]. The PDF parse carries OCR errors, so locators must point into a recorded text version with its OCR activity.

### 3.7 Personal protocol / recommendation page

Instances: Bryan Johnson's protocol page [S17]; Sinclair's on-air promotion of his test ("Go to doctorsinclair.com. You can get on that and you'll be one of the first people in the world to get this test and see what we're doing." [S01]).

Fields (page): byline and date, sections (sleep, exercise, diet, supplements, "Rx / Prescriptions", therapies), per item: name, link (often to a store), dose, frequency, rationale with study links, personal results (lab-report images with descriptive alt text), safety notes ("consult your doctor before use if pregnant or breastfeeding") [S17].

### 3.8 Directory records

Instances: iTunes Lookup (show + 200 episodes) [S06]; YouTube oEmbed [S04]; Spotify episode page [S05]. Fields as in 2.2. The cross-platform identity key that actually matches is the RSS `guid` = Apple `episodeGuid` [S02, S06]; YouTube and Spotify ids are only linked from the publisher page [S01].

### 3.9 Archive index record

Instance: Wayback CDX rows `timestamp digest statuscode` for the affiliations page (e.g. `20211209003848 V4PBTQ6PT7O6VTT4FXU3P76LXQL7DEL2 200`) [S10]. A digest change marks a content version; this is a free change-history for pages that version in place.

## 4. Which artifacts are capturable sources, and how agent-ready

| artifact | capturable? | locator kinds that work | readiness | gap (custom tooling needed) |
| --- | --- | --- | --- | --- |
| Podcast RSS item | yes | text quote in description; guid | 3 | parse sponsors/chapters/corrections out of free text |
| Publisher transcript page | yes | text quote + speaker label; chapter seconds | 2 | per-turn media time; review-status tracking |
| YouTube video | partial | text quote in captions | 1–2 | caption cue times; API key for metadata; rendition sponsor reads |
| Audio enclosure | yes (bytes) | media time | 1 | transcription (Whisper-class) with diarization; per-rendition re-cut detection via `?updated=` |
| Spotify / Apple pages | metadata | — | 1 / 3 | — |
| Substack post | yes | text quote; outbound DOI | 3 | — |
| Expert article | yes | text quote; reference list | 2 | boilerplate stripping |
| X post | yes (scrape) | text quote; post id | 1 | terms; images |
| Forum post | yes (LongeCity) / no (Reddit) | text quote; post permalink | 1 / 0 | Reddit API app |
| Self-disclosure page | yes + archive | text quote per line; snapshot digest | 2–3 | role-code parsing; version diffing via CDX |
| Regulator letter (PDF) | yes | page + text quote | 2 | OCR quality; normalization |
| Mention indexes (Altmetric, Crossref Event Data) | no | — | 0 | key / retired; build our own discovery from feeds and search |

## 5. The four lenses

- **Science.** Retellings are where fidelity is lost; even the source paper can be internally inconsistent (abstract −1.13 kg vs results −1.19 kg) [S16]. A claim's "independence" is overstated when re-cuts (Essentials) and retellings (NMN.com) are counted as separate voices.
- **Economics.** Sponsorship, affiliate links, founder-seller stores and equity are all present and often coincide on one pair (host ↔ sponsor ↔ equity holder) [S07, S08, S17, S18]. Podcast advertising is a ~$2B market with health/wellness advertisers present [S25].
- **Community.** Pseudonymous, adverse-experience-rich forums are capturable only where the platform allows (LongeCity yes, Reddit no) [S23, S24]. Community norms include sponsor banners inside forums [S23].
- **AI.** Transcripts are machine-generated or "under human review" [S01]; caption tracks differ from publisher transcripts [S03]; newsletters include AI-generated figures [S12]; PDF parses carry OCR noise [S21]. Agents will mistake practice reports for recommendations unless `speechAct` is extracted (the pinned task already forbids REPORTS_PRACTICE → RECOMMENDS) [S32].

## 6. What this means for the model (summary; details in `_notes/research-notes.md`)

1. Recommendation = an attributed `ClaimOccurrence` with `speechAct = RECOMMENDS` in one container at a located span; the financial interest is reached through D7 role assertions valid at the container's publication time; disclosure is a finding with placement, not a boolean.
2. Container ≠ rendition: sponsorship, duration and media-time locators belong to a rendition observed at a time.
3. Retelling is an edge between occurrences (or occurrence → assertion) with mode and link basis; loss is an assessment.
4. Corrections and re-cuts are first-class discourse events that disconfirm or re-contextualize a spoken claim.
5. Most discovery infrastructure is closed; the graph must record what was looked for and not found (coverage) so "no conflict found" is never read as "no conflict".
