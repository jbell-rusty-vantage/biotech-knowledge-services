# Cross-domain fixture 3: claim → mission → report (D9 + D7 + K + D10)

- url: https://www.hubermanlab.com/episode/dr-david-sinclair-the-biology-of-slowing-and-reversing-aging
- title: Dr. David Sinclair: The Biology of Slowing & Reversing Aging (Huberman Lab, episode 52, published 2021-12-27)
- retrieved: 2026-10-08 (D9 capture, reused by contentHash) and 2026-10-09T04:23:37Z (re-capture by the evidence mission)
- snapshot digest: sha256:3158acee44e12235c743aabb3750c7b0d0a807f560bb16477bef76529b0ae973 (Firecrawl markdown of the publisher page with the speaker-labelled transcript; re-capture sha256:85cdbb3355b8f480d473cc293ebbf3fd12237dce8a1116a2e0833aa1960ad77b)
- kind: other — partial support with an undisclosed interest. This is not a disconfirmation: no located span contradicts the claim at its own dose and duration. The verdict is verification.v1 PARTIALLY_SUPPORTED. The fixture does carry a contrary measurement for the broader proposition (blood NAD decreased at 300 mg/day, the only located evidence family independent of NMN makers) and a harm-relevant interest finding.
- tool: Firecrawl CLI 1.23.1 `scrape --max-age 0` (tool:firecrawl-scrape); NCBI E-utilities efetch through curl (tool:ncbi-eutils); curl of the J-STAGE PDF and pdftotext 4.00 (tool:http-capture); Wayback raw copy and CDX checks inherited from D9 (tool:wayback-cdx)

## The statement (D9 container, located span)

David A. Sinclair, guest on Huberman Lab episode 52, transcript as published on the episode page (speaker label "David Sinclair:", chapter "Resveratrol, NAD, NMN, NR; Dosage, Timing", which the page links at `?timestamp=3405`; the next chapter is at `?timestamp=4150`):

> "But if you take it for about two weeks, you'll double, on average double your NAD levels in the blood." … "That's not public information. That's from clinical trials that are not yet published over the last two years."

Locators `l-o1` [69347, 69449) and `l-o1-unpub` [69456, 69566) on the snapshot above. The verifier re-selects `l-o1` on the 2026-10-09 re-capture at [69066, 69168), exact match with context. The YouTube caption rendition carries the same statement in different words (`y-o1`). No caption cue times are capturable with the installed tools, so the claim is located by quote. Its placement inside the 3405–4150 s chapter is inferred from topic and transcript order; the page does not state it. The same answer opens with "disclaimer is I don't recommend anything, but I talk about what I do" (`l-disclaimer`), so the occurrence is STATES, not RECOMMENDS. A second, stronger occurrence ("without any exceptions … your NAD levels go up by about twofold or more", `l-o2`) is a separate Claim, vetted MONITOR.

## Every capture

| ref | url | title | retrieved | snapshot digest |
| --- | --- | --- | --- | --- |
| hl52-web | https://www.hubermanlab.com/episode/dr-david-sinclair-the-biology-of-slowing-and-reversing-aging | Huberman Lab ep 52 page + transcript (D9 capture) | 2026-10-08 | sha256:3158acee44e12235c743aabb3750c7b0d0a807f560bb16477bef76529b0ae973 |
| hl52-web-r2 | same | same, re-captured by the mission | 2026-10-09T04:23:37Z | sha256:85cdbb3355b8f480d473cc293ebbf3fd12237dce8a1116a2e0833aa1960ad77b |
| hl52-youtube | https://www.youtube.com/watch?v=n9IxomBusuw | The Biology of Slowing & Reversing Aging (caption rendition, D9 capture) | 2026-10-08 | sha256:e5b79dd9cc6777dd910ac067b72f0f8083cd0f12fd2fb50d83396a98255ee730 |
| aff-20211209 | https://web.archive.org/web/20211209003848id_/https://sinclair.hms.harvard.edu/david-sinclairs-affiliations | David A. Sinclair's Affiliations, as archived 2021-12-09T00:38:48Z (D9 verified copy) | 2026-10-08 | sha256:ce81648413b5dd1dc70f5c6fcd7a4daac4f8abbf4fc649ee15e706f037c1b590 |
| aff-now | https://sinclair.hms.harvard.edu/david-sinclairs-affiliations | same page, current (D7 capture) | 2026-10-08 | sha256:4a360dd31a561a81b4a6fc70ec16f890322f6dcbe860aab7e31b78ff69688f3f |
| pubmed-35182418 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=35182418&retmode=xml | Pencina KM et al., MIB-626 … Increases Circulating NAD … (J Gerontol A 2023; DOI 10.1093/gerona/glac049) | 2026-10-09T04:18:51Z | sha256:e0c39a48f89d31cac5c1953d5d45c3126bb98604e4d2fef73be0daa1d2e55829 |
| oup-glac049-pdf | https://academic.oup.com/biomedgerontology/article-pdf/78/1/90/48909943/glac049.pdf | same article, publisher PDF as rendered by Firecrawl (direct curl: HTTP 403) | 2026-10-09T04:20:15Z | sha256:574ab99a12f123e7174522b3ef44361c94645ce2265151345d1f6d879259774e (TOOL_RENDITION, PARTIAL_EXCERPT) |
| pubmed-36740954 | …efetch.fcgi?db=pubmed&id=36740954&retmode=xml | Pencina KM et al., NAD Augmentation in Overweight or Obese Middle-Aged and Older Adults (J Clin Endocrinol Metab 2023; DOI 10.1210/clinem/dgad027) | 2026-10-09T04:18:52Z | sha256:3d55660e84b1ea5bbe55dc2f20cc903c17aba5d8202fa1fc149ed453a8c60141 |
| pmc-11491622 | …efetch.fcgi?db=pmc&id=11491622&retmode=xml | same article, PMC front matter (no body) | 2026-10-09T04:19:28Z | sha256:39e0919b45ad619b9bed469117962048e841550e7e977f1c52081b29f5f53250 |
| pubmed-36482258 | …efetch.fcgi?db=pubmed&id=36482258&retmode=xml | Yi L et al., efficacy and safety of NMN … dose-dependent trial (GeroScience 2023; DOI 10.1007/s11357-022-00705-1) | 2026-10-09T04:18:53Z | sha256:9094d15aa0110b07463a0c8e7b1dc0f5c1ea087e4d1c24a8973ba22edfc763a7 |
| pmc-9735188 | …efetch.fcgi?db=pmc&id=9735188&retmode=xml | same article, PMC JATS full text | 2026-10-09T04:19:29Z | sha256:35cd5da84b36c67d46c219e9219ac334b8fbbe83670955345b515625cadbbd33 |
| pmc-9261366 | …efetch.fcgi?db=pmc&id=9261366&retmode=xml | Huang H, … Uthever (NMN Supplement) … in Middle Aged and Older Adults (Front Aging 2022; DOI 10.3389/fragi.2022.851698) | 2026-10-09T04:21:41Z | sha256:0f1fd6d73d1fae30a802429fee1578e7fea173bd42a3c4fa21b0c46066d61a35 |
| pubmed-38430946 | …efetch.fcgi?db=pubmed&id=38430946&retmode=xml | Kuerec AH et al., Towards personalized NMN supplementation: NAD concentration (Mech Ageing Dev 2024; DOI 10.1016/j.mad.2024.111917) | 2026-10-09T04:18:55Z | sha256:2e87e49f1ee3b7c389a4971ba23b9bf4ae4875cf24605bdde303d4c07a5407f4 |
| pmc-9036060 | …efetch.fcgi?db=pmc&id=9036060&retmode=xml | Okabe K et al., Oral administration of NMN is safe and efficiently increases blood NAD … (Front Nutr 2022; DOI 10.3389/fnut.2022.868640) | 2026-10-09T04:21:43Z | sha256:7c0c1cd8f7deaf1e65c001d941fb181da04ba0a6158bc06c737acf134d8506de |
| jstage-gsr9-33-pdf | https://www.jstage.jst.go.jp/article/gsr/9/2/9_33/_pdf/-char/en | Morita Y et al., Clinical evaluation of changes in biomarkers by oral intake of NMN (Glycative Stress Research 2022; DOI 10.24659/gsr.9.2_33) | 2026-10-09T04:29:52Z | sha256:801b288c4e60ea67eb1d3f7518247871e3e2490fa96058b716303afdcd077124 (raw PDF; quoted over pdftotext 4.00 projection sha256:9c44a7f142cf33146494bfb123490cd636fb369d524824c21148aa79bf7791d7) |
| pmc-11205942 | …efetch.fcgi?db=pmc&id=11205942&retmode=xml | NMN Supplementation: Understanding Metabolic Variability and Clinical Implications (Metabolites 2024; PMID 38921475), used only to corroborate the tool-rendered Table 1 values | 2026-10-09T04:36:14Z | sha256:32103e76b6d993c5f020ac9a3c00b3719039d1a4bb1e8c2f1e011abc44aaed74 |

Raw captures are in session scratch `synth/xfx-claim/cap/` (not in the repo). D7 and D9 captures are re-hashed and identical to the digests their packets publish.

## What the fixture shows

The claim lifecycle of 00-DIRECTIVE 3.4 on one real statement, joined to the speaker's financial interest (3.9, the D7 seam) and to the mission lineage of section 4. It uses one fixture mission, `mission:xfx-claim-mission-report`, with four runs:

- `run:xfx-claim-r1-ingest` (INGESTION) writes the two claim occurrences (o1, o2), their Claims and ten locators on the D9 snapshot.
- `run:xfx-claim-r1-vetting` (VETTING) writes the RESEARCH disposition for claim-avg and MONITOR for claim-universal.
- `run:xfx-claim-r2-evidence-mission` (EVIDENCE_MISSION) ASSESSES claim-avg and WAS_INFORMED_BY the vetting run. It writes the following:
  - 10 Sources and 11 snapshots;
  - the broader Claim it refines;
  - six trial findings and eight METRIC assertions;
  - the speaker's interests as observed 18 days before the statement;
  - two RESOLUTION assessments (organization names; the "not yet published" trials), CONFLICT_RELEVANCE and EVIDENCE_SYNTHESIS;
  - the EVIDENCE_REPORT with six D10 ReportItems.
- `run:xfx-claim-r2-verification` (VERIFICATION) writes 27 CAPTURE_FIDELITY adjudications and one SUPPORT adjudication. It moves o1 and o2 to ACCEPTED.

The sibling packets' records it reads are the D7 fixture's Person and Organizations and the D9 fixture's work, channel and snapshots. They keep their own runs (`mission:ft-D7-fixtures`, `mission:ft-D9-fixtures`), so "which missions touched X" crosses missions.

Interest finding: the speaker's self-disclosure page, as archived on 2021-12-09, lists "MetroBiotech, an EdenRoc company … aka Bauhaus; NAD boosters (2015-present) F,I,E,A,B (EdenRoc),IP". The episode page does not mention MetroBiotech, EdenRoc or Bauhaus (absence check, 0 matches each). The 14-day trial at 1 g/day, the best candidate for the "not yet published" trials (received 2021-12-14), was "funded by a research grant from Metro International Biotech", and two of its authors are employees of that company. A 2023 trial of the same formulation lists "Sinclair, David A" with the affiliation "Metro International Biotech". The organization names are linked by a PROPOSED RESOLUTION, never merged. No wrongdoing is asserted.

Evidence finding: the direction and the two-week time course are supported by that one sponsor-funded trial (Day 8 similar to Day 14). The magnitude "double on average" is not stated in any located text: Table 1 reports baseline-corrected increments, and the fold change lives in Figure 1, which the tool digitized and which is not used. Lower doses (250–900 mg/day) raise blood NAD in most trials, but the first samples are at 4 weeks or 30 days, with large between-person variation. At 300 mg/day one placebo-controlled trial found a non-significant +38% and one single-arm study a decrease. Of the six evidence families that support or qualify the claim, one is independent of NMN makers (the single-arm study), one is UNKNOWN, and four are interested parties.

Research, not medical advice.
