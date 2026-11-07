# D7 fixture candidates (research stage, A6, 2026-10-08)

Raw captures are in the session scratch `C:\Users\Pinda\AppData\Local\Temp\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\ft\D7\cap\` (file name given per candidate); `sha256` is `sha256sum` of that exact file (also listed in `…\ft\D7\sha256.txt`). The fixtures stage should re-capture into the packet's fixture folder and recompute digests; these digests identify what was read today.

Locator hints: `charOffset` is the Python string index (Unicode code points, not bytes) of the first character of the quote in the capture file; for SEC HTML the quote and offset refer to the visible text produced by the scratch converter `scratchpad/ft/h2t.py` (`*.txt` next to the `*.htm`), while the digest is of the original `.htm`. Quotes are copied from the captures; typographic apostrophes and quotes are kept. In FC1 the capture separates link text from the following words with U+00A0 (no-break space), shown here as a plain space inside quotes marked [NBSP]; a locator's normalization step must map U+00A0 to U+0020 or the exact match fails.

Summary

| key | source | role in the packet | questions |
| --- | --- | --- | --- |
| FC1 | Sinclair self-disclosure page | **unstructured-to-entity path (directive 3.8)**; D9 seam (recommender → reachable financial interest) | CQ-CL-05, CQ-EC-03, CQ-AX-18, CQ-EC-01, Q-D7-03, Q-D7-08, Q-D7-11, Q-D7-17, Q-D7-20 |
| FC2 | SEC Form D, Life Biosciences LLC | structured corroboration of an FC1 role (cross-source adjudication) | Q-D7-04, Q-D7-02, Q-D7-08 |
| FC3 | FTC warning letter to the American Beverage Association (+ press release) | **harm case**: paid endorsements with inadequate disclosure | Q-D7-07, CQ-CL-05, Q-D7-06 |
| FC4 | Attia CGM article (+ discounts page) | **financial-interest fixture for the D9 seam** (recommendation and disclosure in one container); second unstructured-to-entity option; disconfirmation of completeness | Q-D7-06, CQ-CL-05, CQ-AX-18, Q-D7-20, Q-D7-24 |
| FC5 | Niagen Bioscience DEF 14A 2026 | ownership chain, nominee director, threshold exit | Q-D7-01, Q-D7-02, Q-D7-19, CQ-EC-01 |
| FC6 | BioAge Labs DEF 14A 2026 | group vs vehicle holders; affiliation end date (disconfirmation of a stale role) | Q-D7-14, Q-D7-03, Q-D7-17, Q-D7-13 |
| FC7 | Europe PMC JATS, PMC10903100 (PMID 38241160) | author employment vs funding vs patent (CQ-EC-04); third unstructured-to-entity option | CQ-EC-04, Q-D7-05 |
| FC8 | Europe PMC JATS, PMC11176364 (PMID 38871717, NICE trial) | in-kind material supply ≠ funding; registry "collaborator" disambiguated | CQ-EC-04, Q-D7-05, CQ-MF-01 |
| FC9 | Niagen Bioscience 10-K FY2025 | identity history (acquired + dissolved brand entity), sole supplier, unnamed CMOs (harm: concentration and opacity) | Q-D7-09, Q-D7-21, CQ-MF-01, CQ-EC-02, Q-D7-19 |
| FC10 | GLEIF relationship record, Société des Produits Nestlé S.A. | PARENT_OF with a relationship period and corroboration level (structured) | Q-D7-01, Q-D7-19 |
| FC11 | Companies House PSC, Shift Bioscience Limited | stake as a band, notified date; privacy boundary (DOB on the same page) | Q-D7-01 |

Recommended trio for the fixtures stage (contract minimum is three): FC1 (unstructured-to-entity, with FC2 as the corroborating structured source), FC3 (harm), FC4 (financial-interest seam to D9). FC5 or FC6 adds the investor lens.

---

## FC1 — Self-disclosure page: "David A. Sinclair's Affiliations"

- URL: https://sinclair.hms.harvard.edu/david-sinclairs-affiliations
- Title: David A. Sinclair's Affiliations | The Sinclair Lab
- Retrieved: 2026-10-08 · tool: Firecrawl CLI `scrape --only-main-content --max-age 0` (Tavily `extract` also captured it: `sinclair_affil.tvly.md`, tab characters became U+FFFD)
- Capture: `cap/sinclair_affil.fc.md` (25,505 bytes) · sha256 `4a360dd31a561a81b4a6fc70ec16f890322f6dcbe860aab7e31b78ff69688f3f`
- Demonstrates: **unstructured-to-entity path (directive 3.8)**. Question "Does the speaker who said X about NMN have a financial interest in an NAD-booster company?" → chunk containing the MetroBiotech entry (found via MENTIONS of MetroBiotech / EdenRoc, or vector search on "NAD boosters") → assertions (Person FOUNDED / HOLDS_EQUITY_IN / ADVISES / BOARD_MEMBER_OF group "EdenRoc Sciences companies"; member company MetroBiotech 2015-present) → locator (text quote + offset) → this snapshot. Also the D9 seam: the recommender's statements (D9 ClaimOccurrence) reach these interests.
- Quotes:
  1. "(Updated Oct 8th, 2024)" — header, charOffset 266. (Source-declared as-of date; not the retrieval date.)
  2. "This list is for information purposes only and is not meant to represent a formal list of affiliations." — italic preamble, charOffset 292. (Source-declared incompleteness; feeds disclosureFinding.)
  3. "F=Founder;  I=Investor;  E=Equity;  A=Advisor/Consultant;  B=Board of Directors;  IP=Inventor on licensed patents;  L=Funding for laboratory" — legend, line 11, charOffset 764 [NBSP after each ";"]. (Role-code vocabulary for `roleTitleVerbatim` → interest kind.)
  4. "[InsideTracker](https://www.insidetracker.com/) (Segterra), Cambridge, MA B (2011-2017) I,A,IP (2011-present)" — ACTIVE ENGAGEMENTS, line 33, charOffset 1555 [NBSP after the link]. (Two episodes for one counterparty: board ended 2017; investor/advisor/IP open.)
  5. "EdenRoc Sciences companies F,I,E,A,B, IP" — line 35, charOffset 1665; followed by "[MetroBiotech International, an EdenRoc Sciences company](https://www.metrobiotech.com/), NAD boosters (2015-present)" — line 39 [NBSP after the link]. (Group-level role vs member company; "NAD boosters" is the bridge to D1 substances.)
  6. "[Life Biosciences](https://lifebiosciences.com/) Boston, MA Longevity technologies, see listed affiliates (2017-present) F,I,E,A,B,IP" — line 23, charOffset 1156 [NBSP after the link]. (Board role corroborated by FC2.)

## FC2 — SEC Form D: Life Biosciences LLC

- URL: https://www.sec.gov/Archives/edgar/data/1751806/000175180626000003/primary_doc.xml (accession 0001751806-26-000003; found via EDGAR full-text search `efts.sec.gov/LATEST/search-index?q="Life Biosciences"&forms=D`)
- Title: Form D — Notice of Exempt Offering of Securities, Life Biosciences LLC (signature date 2026-04-24)
- Retrieved: 2026-10-08 · tool: curl with SEC User-Agent (EDGAR_IDENTITY, not printed)
- Capture: `cap/formd_lifebio_2026.xml` (11,775 bytes) · sha256 `6788d860a7a17a1f19bd9485a3c91751246a9a4435b819337e24861048331287`
- Demonstrates: structured role source that corroborates FC1's "B" for Life Biosciences at a dated point (Q-D7-08 resolves to "agree on kind; Form D gives no start date"); financing record for D13 (amount, date of first sale). Person carries no identifier → resolution hypothesis needed to link "David Sinclair" here to the FC1 page owner.
- Quotes (XML element text):
  1. "<lastName>Sinclair</lastName>" — relatedPersonInfo #6, charOffset 5350; its relationship element "<relationship>Director</relationship>" — charOffset 5854.
  2. "<totalOfferingAmount>31000002</totalOfferingAmount>" — offeringSalesAmounts, charOffset 10011.
  3. "<value>2025-11-25</value>" — dateOfFirstSale, charOffset 8179.
  4. "<entityName>Life Biosciences LLC</entityName>" — primaryIssuer (near the top of the file).

## FC3 — FTC warning letter to the American Beverage Association (harm case)

- URL: https://www.ftc.gov/system/files/ftc_gov/pdf/warning-letter-american-bev.pdf; announcement https://www.ftc.gov/news-events/news/press-releases/2023/11/ftc-warns-two-trade-associations-dozen-influencers-about-social-media-posts-promoting-consumption
- Title: Warning Letter to American Beverage Association (4 pages, dated November 13, 2023); press release "FTC Warns Two Trade Associations and a Dozen Influencers About Social Media Posts Promoting Consumption of Aspartame or Sugar" (November 15, 2023)
- Retrieved: 2026-10-08 · tool: Firecrawl CLI `scrape` (PDF parsed to markdown); plain curl received an Akamai "Page Not Found" (HTTP 404) for both URLs
- Capture: `cap/ftc_ameribev.fc.md` (8,649 bytes) · sha256 `926704067eaf95a170a05324ca457808cde5b31221c02e9c70eed070b9e30cd8`; press release `cap/ftc_pr_aspartame.fc.md` · sha256 `845270a8e7cce8088e677cede47bbedb435dcdf184260df3ef814c69a48f2e20`
- Demonstrates: **harm case**. A regulator asserts, with hedged modality, that an organization paid named endorsers (compensation tie Organization → Person) whose posts lacked adequate disclosure; the question "which experts promoting X were paid by the marketer, per a regulator" is answerable and the endorsers' posts are D9 occurrences. The letter is about a food additive (D12/D1 seam). Personal names of the endorsers appear in the letter; fixture assertions should use the trade association as subject and at most one named endorser who also received an individual letter.
- Quotes:
  1. "## November 13, 2023" — page 1 heading, charOffset 74. (Page headers on pages 2–3 read "November 6, 2023": a dating inconsistency inside the source.)
  2. "It appears that the American Beverage Association paid the dieticians to do so." — page 1, charOffset 1050. (Modality: "It appears" → assertion status/hedge, not a settled fact.)
  3. "Material connections could consist of a business or family relationship, monetary payment, or the provision of free products to the endorser." — page 1, charOffset 1538.
  4. "First, some of the posts we reviewed included no disclosures or any other indication of the dieticians’ apparent material connection to the ABA." — page 2, charOffset 2235.
  5. "could subject the company to civil penalties of up to $50,120 per violation." — page 3, charOffset 6517.
  6. (press release) "Federal Trade Commission staff have sent warning letters to two trade associations and 12 registered dieticians and other online health influencers warning them about the lack of adequate disclosures in their Instagram and TikTok posts promoting the safety of the artificial sweetener aspartame or the consumption of sugar-containing products." — 52 words, line 39.

## FC4 — Recommendation with in-container disclosure: Attia CGM article (financial-interest seam to D9)

- URL: https://peterattiamd.com/are-continuous-glucose-monitors-a-waste-of-time-for-people-without-diabetes/ ; companion https://peterattiamd.com/members/discounts/
- Title: "Are continuous glucose monitors a waste of time for people without diabetes?" (dated June 20, 2021); "Exclusive Member Discounts - Peter Attia MD"
- Retrieved: 2026-10-08 · tool: Firecrawl MCP `firecrawl_search` (discovery) + Firecrawl CLI `scrape --max-age 0`
- Capture: `cap/attia_cgm.fc.md` (25,289 bytes) · sha256 `f07bfddb581c7711c9c599609ee6b6a6d3309906ad5f6b6ed945b79820747546`; `cap/attia_discounts.fc.md` (13,767 bytes) · sha256 `05701ac8c3c108c9773f42622884f1c5cb93aa01078246d427c6a3d553e3ce3a`
- Demonstrates: the packet direction's **financial-interest fixture**. One container holds a pro-CGM position by a person (D9 ClaimOccurrence, speech act close to recommendation for his patients) and that person's disclosure of a paid advisory tie to a CGM maker (D7 RECEIVES_COMPENSATION_FROM / ADVISES Dexcom; Dexcom → CGM device seam D4/D6). CQ-CL-05 answer: relevanceBasis SAME_SERVICE_CATEGORY or SAME_PRODUCT (category of device), temporalOverlap OVERLAPS (tie stated in present tense on the article date), disclosureFinding DISCLOSED_IN_CONTAINER. Also a completeness case (Q-D7-20): the article points to a full disclosure list that could not be captured (see tool log #30) → any "no other interests" claim is NOT_FOUND_IN_PARTIAL_CAPTURE. Second unstructured-to-entity option.
- Quotes:
  1. "June 20, 2021" — article date line, charOffset 7103.
  2. "I’m a proponent of continuous glucose monitors, or CGMs, in my patients, even if they don’t have diabetes." — first paragraph, charOffset 7355.
  3. "I am a paid advisor to Dexcom; a company that develops, manufactures, and distributes CGMs." — closing DISCLOSURE paragraph, charOffset 22908.
  4. "For a full list of my disclosures, please visit" — same paragraph, charOffset 23000.
  5. (discounts page) "_Disclosure: I am an investor in Kosterina_" — charOffset 12857. (Food brand: D12/D6 seam.)
  6. (discounts page) "We do not take a dime from any of these companies." — charOffset 6888. (A self-assertion about sponsorship money that coexists with investor disclosures on the same page: sponsorship ≠ equity.)

## FC5 — SEC proxy: Niagen Bioscience, Inc. DEF 14A (2026-04-29)

- URL: https://www.sec.gov/Archives/edgar/data/1386570/000138657026000022/cdxc-20260429.htm (accession 0001386570-26-000022)
- Title: Niagen Bioscience, Inc. — Schedule 14A definitive proxy statement, 2026 Annual Meeting
- Retrieved: 2026-10-08 · tool: curl (SEC User-Agent); visible text via `h2t.py` → `nage_def14a_2026.txt`
- Capture: `cap/nage_def14a_2026.htm` (766,969 bytes) · sha256 `9efba603f932e4b6c5735391b3fe6c62103525fa246acf30822e59bd59cb86a0`
- Demonstrates: ownership chain behind a 24.23 % holder through holding companies to one natural person ("may be deemed"), citing a 13D/A; nominee director placed by a holder under a 2017 agreement; a former 5 % holder (Nestlé) that "no longer meets that threshold" (end of a holding episode without a date). Investor lens.
- Quotes (visible text; charOffset in the `.txt`):
  1. "Steven D. Rubin, 65, has been a director of the Company since March 2017" — director bios, charOffset 34235.
  2. "Mr. Ng serves as the director nominated by Champion River Ventures Limited (“Champion River”) pursuant to rights granted to Champion River pursuant to the April 2017 Purchase Agreement." — director bios, charOffset 39315.
  3. "its ownership has since declined and no longer meets that threshold." — Certain Relationships and Related Transactions, charOffset 153206.
  4. "(6)Based on beneficial ownership reported on Schedule 13D/A filed with SEC on August 20, 2024," — ownership footnote 6, charOffset 161883.

## FC6 — SEC proxy: BioAge Labs, Inc. DEF 14A (2026-04-21)

- URL: https://www.sec.gov/Archives/edgar/data/1709941/000119312526166738/bioa-20260421.htm (accession 0001193125-26-166738)
- Title: BioAge Labs, Inc. — Schedule 14A definitive proxy statement
- Retrieved: 2026-10-08 · tool: curl (SEC User-Agent); visible text `bioa_def14a_2026.txt`
- Capture: `cap/bioa_def14a_2026.htm` (743,827 bytes) · sha256 `d6c25348e3f7d1ea7ae6c3957ad53222ae86705fdf5fe42102970847fed195f9`
- Demonstrates: venture "entities affiliated with" groups decomposed into fund vehicles and GP LLCs (group ≠ member, V-434); a director's affiliation with an investor that ended in a stated month (disconfirmation of a stale "partner at a16z" title after June 2025).
- Quotes:
  1. "Entities affiliated with Andreessen Horowitz(1)" — beneficial-ownership table, charOffset 81267 (row value 7.28 %).
  2. "The managing members of each of AH EP Bio I, AH EP Bio III, AH EP Bio IV, and AH EP LSV III are Marc Andreessen and Ben Horowitz" — footnote (1), charOffset 84444 (inside the paragraph).
  3. "Dr. Pande departed from Andreessen Horowitz in June 2025." — related-party transactions footnote, charOffset 117245.

## FC7 — Journal funding and competing interests: PMC10903100 (PMID 38241160)

- URL: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC10903100/fullTextXML (article: DOI 10.1016/j.neurot.2023.10.011)
- Title: "Nicotinamide riboside, pterostilbene and ibudilast protect motor neurons and extend survival in ALS mice" (Neurotherapeutics 2023)
- Retrieved: 2026-10-08 · tools: PubMed MCP `get_article_metadata` (affiliations, PMCID); curl Europe PMC (full text)
- Capture: `cap/epmc_PMC10903100.xml` (183,100 bytes) · sha256 `16bc07a4706a4763572deb3369d6405a5622c5fd69f996758b600edb6c0bae29`
- Demonstrates: four tie kinds from one paper — company money (funding), author employment, author financial support, IP — that must not collapse into "funded by" (CQ-EC-04). Unstructured-to-entity option with element-level locators. The quote "patent … issued" names an "A1" publication number (an application); the assertion records the text, and patent status is a D8 check (disconfirmation hook).
- Quotes:
  1. "This research was supported by grants from the Generalitat Valenciana (Spain) (AICO/2021/245) and from the University of Valencia (Spain) and Elysium Health Inc. (USA) (OTR2017-18255INVES and OTR2018-19337INVES)." — `<sec><title>Funding`, charOffset 95527.
  2. "Jose M. Estrela reports financial support was provided by Elysium Health Inc." — Declaration of competing interest, charOffset 96639.
  3. "Ryan W. Dellinger reports a relationship with Elysium Health Inc. that includes: employment." — same section, charOffset 96797.
  4. "Jose M. Estrela has patent #US2022/0160745A1 issued to Elysium Health Inc." — same section, charOffset 96890.

## FC8 — Journal: NICE trial, PMC11176364 (PMID 38871717)

- URL: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC11176364/fullTextXML (article DOI 10.1038/s41467-024-49092-5)
- Title: "Nicotinamide riboside for peripheral artery disease: the NICE randomized clinical trial" (Nature Communications 2024)
- Retrieved: 2026-10-08 · tool: curl Europe PMC (search + full text)
- Capture: `cap/epmc_PMC11176364.xml` (143,670 bytes) · sha256 `cad48659d0071db4a4dc4be1e6e4e234ea9847e63dcc8cbe35b3690b810819b4`
- Demonstrates: material supplier (in kind) vs funder (money) vs competing interests; resolves what ClinicalTrials.gov's "collaborator: ChromaDex, Inc." means for this kind of study (Q-D7-05).
- Quotes:
  1. "ChromaDex provided the nicotinamide riboside." — `<funding-group>` funding statement, charOffset 18019.
  2. "NR (250 mg pills) and matching placebo were manufactured by ChromaDex." — Methods `<sec id="Sec16"><title>Nicotinamide riboside`, paragraph Par27 (charOffset of "were manufactured by ChromaDex" is 82136).
  3. "Dr. McDermott reports research funding from Helixmith and other research support from ArtAssist, and Mars." — Competing interests, charOffset 99754.

## FC9 — SEC 10-K: Niagen Bioscience, Inc., FY2025

- URL: https://www.sec.gov/Archives/edgar/data/1386570/000138657026000013/cdxc-20251231.htm (accession 0001386570-26-000013); former names from https://data.sec.gov/submissions/CIK0001386570.json
- Title: Niagen Bioscience, Inc. Form 10-K for the fiscal year ended December 31, 2025
- Retrieved: 2026-10-08 · tool: curl (SEC User-Agent); visible text `nage_10k_2025.txt`
- Capture: `cap/nage_10k_2025.htm` (2,046,533 bytes) · sha256 `0f823d4988919baf6ee581216ac10a0537edfffb5a0e2c5bdc1d9eb32e6483e6`
- Demonstrates: organization identity over time (rename 2025-03-10 per EDGAR; brand entity acquired 2017 and dissolved 2021), brand-to-entity accountability, sole supplier with term, unnamed contract manufacturers (harm: concentration and opacity, Q-D7-21).
- Quotes:
  1. "On March 12, 2017, ChromaDex Corporation acquired Healthspan Research LLC, a consumer product company offering Tru Niagen® branded products." — Item 1, charOffset 31295.
  2. "On January 15, 2021, Healthspan Research LLC was dissolved." — Item 1, charOffset 31534.
  3. "Our finished consumer products are manufactured by third-party, FDA-registered contract manufacturers located in the United States." — Item 1 manufacturing, charOffset 68648.
  4. "We rely on a single manufacturer for the supply of food-grade NRC." — Item 1 suppliers, charOffset 69689.

## FC10 — GLEIF level-2 relationship record (structured PARENT_OF)

- URL: https://api.gleif.org/api/v1/lei-records/549300CJIDHZBCKJ7T95/direct-parent-relationship
- Title: GLEIF relationship record — Société des Produits Nestlé S.A. IS_DIRECTLY_CONSOLIDATED_BY (end node LEI KY37LUS27QQX7BB93L28)
- Retrieved: 2026-10-08 · tool: curl
- Capture: `cap/gleif_nestle_sa_parent_rel.json` (one line) · sha256 `ccdf0747b2da245e789a8ca438347b4ed01e8b8f6a730473623e82bfb027e542`
- Demonstrates: a parent relationship with its own relationship period, accounting period, corroboration level and corroborating document — the model for PARENT_OF valid time and basis. Pairs with FC5 (Nestlé as former ≥ 5 % holder of a longevity issuer: equity ≠ control).
- Quotes (JSON text):
  1. "\"type\":\"IS_DIRECTLY_CONSOLIDATED_BY\"" — charOffset 417.
  2. "\"startDate\":\"2020-12-18T00:00:00Z\",\"type\":\"RELATIONSHIP_PERIOD\"" — charOffset 581.
  3. "\"corroborationLevel\":\"FULLY_CORROBORATED\"" — charOffset 852.

## FC11 — Companies House persons with significant control: Shift Bioscience Limited (10793871)

- URL: https://find-and-update.company-information.service.gov.uk/company/10793871/persons-with-significant-control
- Title: SHIFT BIOSCIENCE LIMITED persons with significant control - Find and update company information - GOV.UK
- Retrieved: 2026-10-08 · tool: curl (public web; the REST API returned 401 without a key)
- Capture: `cap/ch_10793871_persons-with-significant-control.html` (39,555 bytes) · sha256 `75a968d22a01014a30cd93f607f0a6f32468e6c33f8034ae6bbf0edb4f7c0292`
- Demonstrates: stake recorded as a statutory band, not a percent; the same page carries month/year of birth and residence, which the graph must not store (privacy boundary).
- Quotes (visible text `ch_10793871_persons-with-significant-control.txt`):
  1. "Ownership of shares – More than 25% but not more than 50%" — Nature of control, charOffset 1951.
  2. "Right to appoint or remove directors as a member of a firm" — Nature of control, charOffset 2076.

## Also read, not proposed as fixtures

- ProPublica Dollars for Profs NIH FCOI record (`cap/propublica_sinclair.fc.md`, sha256 `da2621b90e544fc6b320445d40de185225f2b77202454764eab6de5544492e0d`): institution-reported equity interest linked to an NIH project; dataset frozen 2019.
- ARPA-H PROSPR awards release (`cap/arpah_prospr.fc.md`, sha256 `7600bb52606f21d7fd616f0390df26e293a981f6082b215ed4f7e9f958c63727`): funding instrument "contracts" not grants; no per-team amounts.
- NewLimit Form D (`cap/formd_newlimit_2025.xml`, sha256 `6228072ec9e1616423d9aa7498914aa3469b4cc3ecfe1cab16abfef69ad4b2f3`): second Form D instance.
- Juvenescence UK PSC (`cap/ch_11496711_persons-with-significant-control.html`, sha256 `c9773c1a53ffd26c1756645ce0599c2309d3604cd2284a1bc9f6893c13c2db9d`): corporate PSC notified and ceased the same day; "no registrable person" statement.
