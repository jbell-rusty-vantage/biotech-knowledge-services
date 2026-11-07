# Runlog — cross-domain fixture 3: claim → mission → report (D9 + D7 + K + D10)

Agent: S team, role "CROSS-DOMAIN FIXTURE 3", 2026-10-09 (UTC). Worktree `biotech-knowledge-services-S`, branch `ft/schema-S`.
Output: `final/fixtures/cross-domain/claim-mission-report/`. Scratch: `scratchpad/synth/xfx-claim/` (captures in `cap/`,
generator `gen.py`, Neo4j load and query scripts). Nothing committed. `.env` not read.

## 1. Inputs read

- `fast-track/00-DIRECTIVE.md` (3.4, 3.8, 3.9, 3.10, section 4), `01-PACKET-CONTRACT.md` (fixture file set), `03-SYNTHESIS.md`.
- `final/schema/kernel.graphql` (Source, SourceSnapshot, SourceLocator, Assertion, Adjudication, Claim, Assessment,
  Report, Activity, Agent, Identifier), `final/schema/D9.graphql` (Channel, MediaWork, Chunk), `final/schema/D7.graphql`
  (Person, Organization, HOLDS_ROLE / HOLDS_STAKE edge properties), `final/schema/D10.graphql` (ReportItem),
  `final/schema/D3.graphql` (Publication), `final/schema/D1.graphql` (ChemicalSubstance, IngredientMaterial).
- `packets/K/03-retrieval-patterns.md` Q-K-04 … Q-K-08 (the four lineage patterns and the evidence-mission pattern).
- `packets/K/07-fixtures/resveratrol-sirt1-evidence-mission/` and `two-run-lineage/` (record conventions).
- `packets/D9/07-fixtures/hl52-transcript-nmn-practice/` and `sinclair-recommendation-disclosure-asof/` (the captured
  episode transcript and the self-disclosure page snapshots this fixture reuses).
- `packets/D10/report-skeletons.md` section 4 (`d10.evidence-report@1`).

## 2. Commands and key output

### 2.1 Choosing the claim (existing D9 captures, hashes re-verified)

```
$ sha256sum ft/D9/cap/hl52-episode.md ft/D9/cap/sinclair-affiliations.md ft/D9/cap4/wb-aff-20211209003848.html ft/D9/cap/yt-hl52.md
3158acee44e12235c743aabb3750c7b0d0a807f560bb16477bef76529b0ae973  hl52-episode.md          (= D9 hl52-web snapshot)
4a360dd31a561a81b4a6fc70ec16f890322f6dcbe860aab7e31b78ff69688f3f  sinclair-affiliations.md (= D9 aff-now)
ce81648413b5dd1dc70f5c6fcd7a4daac4f8abbf4fc649ee15e706f037c1b590  wb-aff-20211209003848.html (= D9 aff-20211209, the verified copy)
e5b79dd9cc6777dd910ac067b72f0f8083cd0f12fd2fb50d83396a98255ee730  yt-hl52.md               (= D9 hl52-youtube)
$ grep -n -i "NMN\|NAD" hl52-episode.md
  line 1033 "... But if you take it for about two weeks, you'll double, on average double your NAD levels in the blood.
  Okay? That's not public information. That's from clinical trials that are not yet published over the last two years."
  line 1073 "... without any exceptions, that if you do what I do, your NAD levels go up by about twofold or more."
  line 1021 "All right. Well, disclaimer is I don't recommend anything, but I talk about what I do."
$ grep -n -i "metro\|edenroc" wb-aff-20211209003848.html
  line 279 "MetroBiotech, an EdenRoc company</a> aka Bauhaus; NAD boosters (2015-present) F,I,E,A,B (EdenRoc),IP"
$ grep -n -i "metro" sinclair-affiliations.md
  line 39 "[MetroBiotech International, an EdenRoc Sciences company](https://www.metrobiotech.com/), NAD boosters (2015-present)"
$ grep -n -i "metro\|disclos" hl52-episode.md
  no MetroBiotech mention in the episode (only the site footer link "Disclaimer & Disclosures")
$ grep -c "" yt-hl52.md -> 3284 lines; the caption track carries no cue times
$ which yt-dlp youtube-dl ffmpeg -> none; python -c "import youtube_transcript_api" -> ModuleNotFoundError (readiness finding)
```

The publisher page states chapter media times (`?timestamp=3405` "Resveratrol, NAD, NMN, NR; Dosage, Timing", next chapter
`?timestamp=4150`); no per-sentence media time is capturable with the installed tools, so the claim is located by quote.

Chosen claim: David A. Sinclair, guest on Huberman Lab episode 52 (published 2021-12-27), states that taking NMN for about
two weeks doubles blood NAD on average, citing unpublished clinical trials; his self-disclosure page as archived 18 days
before lists MetroBiotech ("NAD boosters", F,I,E,A,B,IP). The episode does not mention MetroBiotech.

### 2.2 Evidence mission captures (R2): PubMed and PMC through NCBI E-utilities (curl, no key)

```
$ curl -s ".../esearch.fcgi?db=pubmed&term=(nicotinamide mononucleotide[Title] OR NMN[Title] OR MIB-626[Title]) AND (NAD[Title/Abstract]) AND (randomized[Title/Abstract] OR trial[Title/Abstract]) AND human[mh]&retmax=60"
count 19: 42514320 42304075 42056497 41162813 40275690 39185644 39116016 38789831 38430946 38191197 37619764 36797393
          36482258 36002548 35441939 35182418 34238308 33888596 31685720
$ curl -s ".../esearch.fcgi?db=pubmed&term=MIB-626[Title/Abstract] OR (Igarashi M[Author] AND nicotinamide mononucleotide[Title])"
          42603990 40746868 36740954 35927255 35182418
$ for p in 35182418 36740954 36482258 35927255 38430946 42514320 31685720; do curl -s -D hdr-$p.txt ".../efetch.fcgi?db=pubmed&id=$p&retmode=xml" -o pubmed-$p.xml; done
35182418 HTTP 200   8686 B sha256:e0c39a48f89d31cac5c1953d5d45c3126bb98604e4d2fef73be0daa1d2e55829 (Date 2026-10-09T04:18:51Z)
36740954 HTTP 200  34546 B sha256:3d55660e84b1ea5bbe55dc2f20cc903c17aba5d8202fa1fc149ed453a8c60141 (04:18:52Z)
36482258 HTTP 200  22029 B sha256:9094d15aa0110b07463a0c8e7b1dc0f5c1ea087e4d1c24a8973ba22edfc763a7 (04:18:53Z)
35927255 HTTP 200  22955 B sha256:3ecd9ec76b2397933cb5f648db112be599d948c77fc53a4d5fcd41375b141e33 (04:18:54Z; not used)
38430946 HTTP 200   9937 B sha256:2e87e49f1ee3b7c389a4971ba23b9bf4ae4875cf24605bdde303d4c07a5407f4 (04:18:55Z)
42514320 HTTP 200  34659 B sha256:9096e58e926b03013d6d1339738d679a6f3a2f3eb41adc69c3b88f52dc7493b2 (04:18:56Z; not used: abstract reports no NAD outcome)
31685720 HTTP 200  15376 B sha256:a52c4d9cf3d67674cbbe41a1d81ea809a53db3862785fb95968ff741247340dd (04:18:57Z; not used: single dose, blood NAD not reported)
$ for c in 11491622 9735188 9158788; do curl -s -D hdr-pmc$c.txt ".../efetch.fcgi?db=pmc&id=$c&retmode=xml" -o pmc-$c.xml; done
PMC11491622 HTTP 200  19125 B sha256:39e0919b45ad619b9bed469117962048e841550e7e977f1c52081b29f5f53250 (04:19:28Z; front matter and abstract only, no body)
PMC9735188  HTTP 200 132466 B sha256:35cd5da84b36c67d46c219e9219ac334b8fbbe83670955345b515625cadbbd33 (04:19:29Z)
PMC9158788  HTTP 200 115989 B sha256:535652976b1fe80c3b717d1f65d4f7dfbf243f07f6567a5f6ce5c98a025d1199 (04:19:30Z; not used)
$ curl efetch db=pmc PMC9261366, PMC9036060; db=pubmed 35821806, 35479740
PMC9261366  HTTP 200 116618 B sha256:0f1fd6d73d1fae30a802429fee1578e7fea173bd42a3c4fa21b0c46066d61a35 (04:21:41Z)
PMC9036060  HTTP 200 129159 B sha256:7c0c1cd8f7deaf1e65c001d941fb181da04ba0a6158bc06c737acf134d8506de (04:21:43Z)
35821806    HTTP 200  16959 B sha256:544017c9615cedebf1933516f44c7ec93d2b3aacc0ba8e10a16aa622d3d117ac (not used)
35479740    HTTP 200  33334 B sha256:5272e16561b014a24aaddef0b927fa5f7ee800e73bc10da2559b321c2d250661 (not used)
```

Full text of Pencina 2023 (J Gerontol A, PMID 35182418) is not in PMC:

```
$ firecrawl scrape "https://academic.oup.com/biomedgerontology/article/78/1/90/6532484" --only-main-content --max-age 0 -> 601 B (navigation only)
$ firecrawl scrape "https://academic.oup.com/jcem/article/108/8/1968/7027634" --only-main-content --max-age 0 -> 591 B (navigation only)
$ curl -L -A "Mozilla/5.0" ".../article-pdf/78/1/90/48909943/glac049.pdf" -> HTTP/1.1 403 Forbidden (HTML, 5623 B)
$ firecrawl scrape "https://academic.oup.com/biomedgerontology/article-pdf/78/1/90/48909943/glac049.pdf" --max-age 0 -o oup-glac049-pdf.md
  -> 38206 B, Scrape ID 01a11ee3-d060-7382-b3c6-2d234d78d8e7, file time 2026-10-09T04:20:15Z
```

The PDF rendition contains the article text, Table 1, Funding and Conflict of Interest. It also contains Markdown tables
headed "A. NAD", "C. 2-PY" … with round numbers and empty cells that are not article text: the tool's digitization of
Figure 1. They are not used as evidence; the NAD fold change at Day 14 cannot be read from the article text (Table 1
reports baseline-corrected Cmax and AUClast only; the absolute baseline is in the figure).

Key reads (python over the captures; locators are generated on the raw captured strings by `gen.py`, section 2.4):

- Pencina 2023 J Gerontol: 32 adults, 1 000 mg MIB-626 once or twice daily or placebo for 14 days; "MIB-626 treatment was
  associated with substantial dose-related increases in blood NAD levels."; Table 1 NAD Cmax (baseline-corrected, µg/mL)
  placebo 1.36 (74.9), once daily 23.0 (35.1), twice daily 40.4 (40.1); "Received: December 14, 2021"; "This project was
  funded by a research grant from Metro International Biotech."; "S.L. and D.L. are employees of Metro International Biotech."
- Pencina 2023 JCEM (PMID 36740954, PMC11491622): 2 × 500 mg twice daily for 28 days; contributor Sinclair, David A with
  affiliation "Metro International Biotech" (PMC front matter); GrantList Agency "Metro International Biotech".
- Yi 2023 GeroScience (PMID 36482258, PMC9735188): 300 / 600 / 900 mg for 60 days; Table 2 NAD (nM) 600 mg 7.95 ± 3.29 →
  day 30 39.0 ± 12.6 → day 60 45.3 ± 11.8; 900 mg 10.5 ± 6.8 → 43.1 ± 14.3 → 48.5 ± 19.8; serum "NAD+ + NADH"
  (colorimetric kit); first post-baseline sample at day 30; COI: authors employed by Abinopharm and Aba Chemicals.
- Huang 2022 Front Aging (PMC9261366): 300 mg/day, day 60 NAD+/NADH +38 % vs +14.3 % placebo, "not statistically significant".
- Kuerec 2024 Mech Ageing Dev (PMID 38430946): post-hoc of the Yi trial, "a large coefficient of variation (29.2-113.3%) within group".
- Okabe 2022 Front Nutr (PMC9036060): 250 mg/day for 12 weeks; "the extent of this increase may vary among individuals".

### 2.3 R2 verification re-capture of the episode page

```
$ firecrawl scrape "https://www.hubermanlab.com/episode/dr-david-sinclair-the-biology-of-slowing-and-reversing-aging" --max-age 0 -o hl52-episode-r2.md
  Scrape ID 01a11ee6-fa92-734b-9da5-876755c52e43, 2026-10-09T04:23:37Z, 150589 B,
  sha256:85cdbb3355b8f480d473cc293ebbf3fd12237dce8a1116a2e0833aa1960ad77b
$ grep -c "you'll double, on average double your NAD levels in the blood" hl52-episode-r2.md -> 1
```

### 2.4 More captures added while writing the report

```
$ firecrawl_search (MCP) "Morita Izawa Hirano 'Clinical evaluation of changes in biomarkers by oral intake of NMN' Glycative Stress Research 2022"
  -> J-STAGE article page https://www.jstage.jst.go.jp/article/gsr/9/2/9_33/_article (open access)
$ curl -s -D … -A "Mozilla/5.0" ".../gsr/9/2/9_33/_article" -> HTTP 200, 87305 B, sha256:6ced34eb5737255338fa5be3f65695d3554bdbca997943b7e5fb8c5b5ba4972b (04:29:43Z; not quoted)
$ curl -s -L ".../gsr/9/2/9_33/_pdf/-char/en" -> HTTP 200 application/pdf, 4135873 B, sha256:801b288c4e60ea67eb1d3f7518247871e3e2490fa96058b716303afdcd077124 (04:29:52Z)
$ pdftotext -enc UTF-8 jstage-gsr9-33.pdf (pdftotext 4.00) -> 37134 B, sha256:9c44a7f142cf33146494bfb123490cd636fb369d524824c21148aa79bf7791d7
  line 184: "NAD also showed a significant decrease from 17.4 to 13.7 ng/mL, p < 0.05, while NMN showed no significant change from 1.32 to 1.28 ng/mL."
  "Conflict of Interest Statement / Authors have no conflict of interest in this study."
$ curl efetch db=pmc id=11205942 (review, PMID 38921475) -> HTTP 200, 295427 B, sha256:32103e76b6d993c5f020ac9a3c00b3719039d1a4bb1e8c2f1e011abc44aaed74 (04:36:14Z)
  table cell "NMN: 0.0882 (µg)<break/>NAD: 23.0 (µg)" for "1000 mg NMN 1× Daily n = 12": corroborates the tool-rendered Table 1 of Pencina 2023
COI and funding read from the captures: Yi 2023 "fully funded by Aba Chemicals Co. … and Abinopharm, Inc."; product "AbinoNutra™NMN …
  developed and manufactured by Aba Chemicals"; Huang 2022 "Author HH was employed by Effepharm (Shanghai) Co., Ltd." (no captured
  link between Effepharm and the product -> independence UNKNOWN); Okabe 2022 "funded by Mitsubishi Corporation Life Sciences Limited",
  "employees of Mitsubishi … prepared NMN and the placebo", visits at "0-week … 4-, 8-, 12-week"; Kuerec 2024 affiliations include
  Abinopharm and ABA Chemicals (PubMed AffiliationInfo).
```

### 2.5 Generator (scratch `synth/xfx-claim/`): gen.py → build2.py → emit.py

```
$ python -I -X utf8 gen.py cap/ <fixture dir>            (first run 2026-10-09T04:35:02Z, frozen in clock.json)
  snapshots 16 locators 59
  D7 reselect {'loc-sin-metrobiotech': {'rawEqual': False, 'equalAfterNbspToSpace': True}, 'loc-sin-edenroc': {'rawEqual': True, ...},
               'loc-sin-legend': {'rawEqual': False, 'equalAfterNbspToSpace': True}}  D9 w1 True
  (anchor failures fixed along the way: NBSP in the archive copy and in the J Gerontol PDF rendition, thin spaces U+2009 in the PMC
   table cells, "2 months" with NBSP in Huang; each fixed by moving the anchors, never by editing captured text)
$ python -I -X utf8 build2.py <fixture dir>
  records 203 assertions 40 assessments 7 adjudications 28
  families {'pub-pencina-jg': ['INTERESTED_PARTY'], 'pub-yi': ['INTERESTED_PARTY'], 'pub-kuerec': ['INTERESTED_PARTY'],
            'pub-huang': ['UNKNOWN'], 'pub-okabe': ['INTERESTED_PARTY'], 'pub-morita': ['INDEPENDENT']} distinct 6 independent 1
  bodyDigest sha256:f11f7d49e853db7d9dd6654ebceb48fda6da58a3e8c6e0e1f9cdf469c260191f
  bundle     sha256:f5f40226acf0b7f1963d4d3ea17a4627ea4c173c39a3fafa3a115307132bf487  citationCompleteness 0.9444 (17 / 18)
  propositionHash claim-avg       sha256:b63b223b105020831467ea8cc78738597dc447968197abff9653720c6ecb045a
                  claim-universal sha256:b4c5ce44d5bc3f090e628f853c634072e46dcd679f8553484f6568ea8437411f
                  claim-broad     sha256:f038d9ae7df764094a7d2496f18ac78bb25fece2e4e7b1938eaf017744a5f38a
$ python -I -X utf8 emit.py <fixture dir>
  intent.json sha256:a2e811d44b69a8832f40f4cce90507e46e6930bdf7077199356e1597ac8efcfd (2 proposals)
  intent-r2.json sha256:c17ebe5c762349f1ea1054de9f427762e20f5d7e4a6624ec9dddb1c63d250efc (27 proposals)
$ node validate.mjs <worktree> <fixture dir>     (IngestionIntent.safeParse from packages/contracts/dist/ingest.js)
  OK   intent.json: 2 sources, 9 locators, 3 subjects, 2 proposals (edge.assert)
  OK   intent-r2.json: 11 sources, 44 locators, 13 subjects, 27 proposals (edge.assert, assertion.literal, identifier.attach)
```

Modeling corrections made during the run:
- The occurrence predicate was first a new value; it now uses the D2-registered INCREASES_LEVEL_OF with the qualifier
  `compartment: blood`.
- Morita is now DECREASES_LEVEL_OF POSITIVE, with no OCCURRENCE_OF (cardinality zero_or_one), instead of a NEGATIVE occurrence.
- The Morita uid lost its underscore, because the `@bks/contracts` Uid regex rejects `_`.
- Huang's independence moved from INTERESTED_PARTY to UNKNOWN.
- Two report sentences were rewritten after a fact check: Okabe's first sample is at 4 weeks, not at 30 days or later, and
  "maker of the NMN tested" is now stated per trial, only from located spans.

### 2.6 Re-selection from the written files

```
$ python (yaml load of locators.yaml): sha256(selectorJson) == selectorDigest, sha256(NFC exact) == quoteHash, selectorJson.exact == exact
  -> locators 59 snapshots 16 bad 0
$ python (re-select from captures): every snapshot contentHash re-hashed from scratch files; every TEXT_QUOTE re-selected at its
  UTF-16 offsets -> reselected 58 mismatch 0 (+1 WHOLE_SNAPSHOT absence locator)
```

### 2.7 Disposable Neo4j (bks-neo4j-synth, 5.26.31, bolt 7691): load and patterns

```
$ docker exec bks-neo4j-synth cypher-shell … "MATCH (n) RETURN labels(n)[0], count(*)"   (pre-existing data of other S agents, untouched)
$ python -I -X utf8 load.py  -> load.cypher (948 statements; every node tagged fx:'xfx-claim', MERGE-free CREATE after
  "MATCH (n {fx:'xfx-claim'}) DETACH DELETE n")
$ docker exec -i bks-neo4j-synth cypher-shell -u neo4j -p *** --format plain < load.cypher   -> exit 0
$ … "MATCH (n {fx:'xfx-claim'}) RETURN count(n)" -> 203 ; relationships between them -> 744 (22 types, all in the assembled SDL:
  checked by grep -c 'type: "<T>"' final_biotech_schema_v2.graphql for each)
$ … < queries.cypher  (K Q-K-04, Q-K-05 x2, Q-K-06 x3, Q-K-07 x3, Q-K-08 x2, Q-K-01 x2, CQ-CL-05 x2, Q-K-21, Q-K-19) -> exit 0, queries.out
$ … < queries2.cypher (Q-K-04 with a deterministic label key) -> 188 distinct records, 195 WAS_GENERATED_BY edges
$ … < queries3.cypher (Q-K-17 citations: HAS_EVIDENCE 27 / DERIVED_FROM 24, changed 0; 3.8 trace; item citation counts 2/11/4/7/2/2)
$ … "CYPHER 25 MATCH (a:Activity {missionId:'x'}) RETURN count(a)" -> "25 is not a valid option for cypher version. Valid options are: 5"
$ … "EXPLAIN MATCH (x:$('Claim') {uid:'u'}) RETURN x" -> plan returned (dynamic labels accepted)
```

The key outputs are quoted in `walk.md` and `questions.md`. One finding: Neo4j returned `labels(n)` as `["Entity", "Claim"]` for a node
created `:Claim:Entity`, so the K pattern's `labels(n)[0]` groups records under "Entity" and "InformationArtifact".

## 3. Files written

`final/fixtures/cross-domain/claim-mission-report/`: source.md, locators.yaml (16 snapshots, 59 locators, 4 referenced sibling
locators), assertions.yaml (7 Activities, 4 Agents, 16 entities, 14 Sources, 3 Claims, 40 Assertions, 7 Assessments, 3 named
Adjudications + 25 CAPTURE_FIDELITY records, 1 Report, 6 ReportItems, lineage index), intent.json, intent-r2.json,
composed-body.txt, questions.md, walk.md. This runlog. Scratch only: captures, gen.py, build2.py, emit.py, load.py, validate.mjs,
queries*.cypher and *.out, stage1.json, stage2.json, clock.json.

## 4. Open items handed back

- F1, F2, F3 and F5 (query-patterns: CYPHER 25 prefix on 5.26; `labels(n)[0]`; no ASSERTED_BY role in Q-K-05; HAS_IDENTIFIER not
  counted by Q-K-04 part 2).
- F4 (D7 locator NBSP) and F6 (D7 `entityKind: UNSPECIFIED`, not a final enum value).
- F7 and F8 (tooling: Firecrawl PDF figure digitization, no caption-timecode tool, OUP 403).
- F9 (D3 StudyResult not instantiated for the metric assertions; fixture metric predicates unregistered; intent v1 expressiveness).
- RESOLUTIONs as-res-metro and as-res-trial stay PROPOSED: no company registry record was captured, and the episode names no trial.

## 5. Cleanup

```
$ docker exec bks-neo4j-synth cypher-shell … "MATCH (n {fx:'xfx-claim'}) DETACH DELETE n RETURN count(*)" -> 203 deleted; remaining 0
  (only this fixture's nodes; other agents' data and the container untouched; reload with load.cypher to re-run walk.md)
```
