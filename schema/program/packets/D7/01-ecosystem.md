# D7 — ecosystem survey: organizations, people and money

Research stage, agent A6, 2026-10-08. Every factual claim carries an S-key; the key list at the end gives URL · title · retrieval date (all retrieved 2026-10-08) and the tool that fetched it. Raw captures live in the session scratch (`scratchpad/ft/D7/cap/`), with sha256 digests for the fixture candidates in `_notes/fixture-candidates.md`. Claims about the BellLabs proposal cite the workspace cards, not the web. Nothing here is medical or investment advice.

## 0. What the domain is about, in one paragraph

Who is who and who pays whom. The people and companies of longevity show up in four kinds of record: what they say about themselves (self-disclosure pages, bios, in-article disclosures), what they are legally required to file (SEC proxy statements, Form D, Forms 3/4/5, Schedules 13D/G, Companies House officers and PSC, GLEIF level 2, NPPES), what third parties are required to report about them (journal competing-interest statements under ICMJE, NIH financial-conflict-of-interest reports, CMS Open Payments, ClinicalTrials.gov sponsor fields, grant databases), and what regulators say when disclosure fails (FTC warning letters under 16 CFR 255). Each kind has different authority, time precision, identifiers and capture difficulty, and the same tie often appears in several of them with different wording and dates. The graph's job is to keep those ties as time-bounded, sourced assertions that a question can traverse from a statement to a reachable financial interest — and to say so honestly when a source was only partly captured.

## 1. Actor types, their processes and the artifacts they produce

### 1.1 Public scientists, clinicians and creators (people with influence)

Processes: found and advise companies, hold equity, license inventions through their institutions, host podcasts and newsletters, recommend products, publish papers, receive grants.

- A Harvard genetics professor publishes a list of "Past and present advisory roles, board positions, funding sources, licensed inventions, investments, funding, and invited talks", stamped "(Updated Oct 8th, 2024)", with a role-code legend "F=Founder; I=Investor; E=Equity; A=Advisor/Consultant; B=Board of Directors; IP=Inventor on licensed patents; L=Funding for laboratory" [S1]. Entries carry company, place, sector words and year ranges, for example "InsideTracker (Segterra), Cambridge, MA B (2011-2017) I,A,IP (2011-present)" and "MetroBiotech International, an EdenRoc Sciences company, NAD boosters (2015-present)" [S1]. The page warns it "is not meant to represent a formal list of affiliations" and "some entities may not have yet been added" [S1].
- A physician-podcaster discloses in the body of an article that recommends CGMs for non-diabetics ("I'm a proponent of continuous glucose monitors, or CGMs, in my patients, even if they don't have diabetes"): "I am a paid advisor to Dexcom; a company that develops, manufactures, and distributes CGMs" [S3]. The article is dated June 20, 2021, but the disclosure is not: the Internet Archive rendition of 2021-06-21 has the recommendation and no disclosure paragraph, and the page metadata gives a revision on 2024-12-09 (article:modified_time), so the disclosure dates from a later revision [S3, S3a]. His own disclosure list, archived on 2025-09-30 from the pre-redirect URL /disclosures/, dates the tie: "Dexcom (September 2020 – Aug 2021)" under "Companies I advise" → "Previous:" [S5a] — the tie held when he wrote the article, the original readers did not see it disclosed, and the present-tense revision restates a role that had ended three years earlier. His members' discount page lists partner companies with per-company lines such as "Disclosure: I am an investor in Kosterina" and states "We do not take a dime from any of these companies" [S4]. The live disclosure list (/disclosures/ now redirects to /about/) sits behind a script-rendered panel that neither Firecrawl nor Tavily captured [S5]; the archived copy [S5a] is the only capture of it.
- A podcast brand's site names its operating company only in a privacy-policy link ("Scicomm Media's Privacy Policy") [S40] — the show, the host and the legal entity are three different things.

Artifacts: self-disclosure page (structured list, year precision, role codes), in-container disclosure sentence (one tie, attached to the content it qualifies), bios. Capturable: yes for static pages [S1, S3, S4]; script-gated lists [S5] not live, but through an Internet Archive copy of the pre-redirect URL [S5a]; a page's revisions through archived renditions [S3a]. Agent-readiness: 1–2 (scrape-only, no identifiers for counterparties, no stable record ids; NBSP characters inside entries [S1] require locator normalization).

### 1.2 Companies: public issuers, private startups, brands and their legal entities

Processes: incorporate, rename, raise money, appoint directors and officers, acquire and dissolve subsidiaries, sign supply and licensing agreements, market brands, contract out manufacturing.

- Identity over time: EDGAR lists the issuer's former names with intervals — "ChromaDex Corp." from 2008-06-25 to 2025-03-10 and "CODY RESOURCES, INC." before that — under the current name "Niagen Bioscience, Inc.", SIC "Medicinal Chemicals & Botanical Products", state of incorporation DE [S10]. The 10-K narrates the chain: Cody Resources renamed to ChromaDex Corporation on June 20, 2008; "On March 12, 2017, ChromaDex Corporation acquired Healthspan Research LLC, a consumer product company offering Tru Niagen® branded products"; "On January 15, 2021, Healthspan Research LLC was dissolved" [S11]. It lists the wholly owned subsidiaries (ChromaDex, Inc., ChromaDex International, Inc., ChromaDex Analytics, Inc., ChromaDex Asia Limited, and others) [S11].
- Brand versus legal entity: the 10-K says consumer products are "marketed under the Tru Niagen® brand" [S11]; the brand's own storefront terms page rendered only Shopify chrome, no legal-entity text [S11b tool note]. A longevity-clinic brand appears in NPPES as an "Other Name" ("FOUNTAIN LIFE NY", code 5) of a professional association, "FOREVER YOUNG MEDICAL SERVICES P.A." (NPI 1215617402, taxonomy Clinic/Center, enumerated 2023-07-21), while sibling sites are separate LLCs ("FOUNTAIN LIFE DALLAS, LLC", "FOUNTAIN LIFE ORLANDO, LLC") [S30]. "HUMAN LONGEVITY INC" holds an organizational NPI (1316697386) with six taxonomies, primary Family Medicine [S31].
- Supply and manufacturing ties that the company itself discloses: "We rely on a single manufacturer for the supply of food-grade NRC. We have entered into a long-term supply agreement with W.R. Grace & Co.-Conn. (Grace), pursuant to which Grace is our exclusive supplier … The supply agreement has an initial term through April 30, 2029"; finished products "are manufactured by third-party, FDA-registered contract manufacturers located in the United States" (unnamed) [S11]. The same filing says the company is "independent from the clinics that administer Niagen Plus products" while it "advertise[s] locations where consumers can receive Niagen Plus products" [S11].
- Governance and control (public issuer): the proxy statement gives each director's age, tenure and other boards; for example "Steven D. Rubin, 65, has been a director of the Company since March 2017 … appointed Mr. Rubin as Lead Independent Director" and a director who "serves as the director nominated by Champion River Ventures Limited ('Champion River') pursuant to rights granted to Champion River pursuant to the April 2017 Purchase Agreement" [S6]. The beneficial-ownership table (as of April 27, 2026; 79,644,327 shares outstanding) lists a 24.23 % holder whose footnote unfolds a chain of holding companies (Pioneer Step, Dvorak International, Skyinvest, Champion River, Winsave, Radiant, Brilliant Dynasty, Elgar International) ending in one natural person who "may be deemed to beneficially own" through sole shareholdings, citing a Schedule 13D/A filed August 20, 2024 [S6]. The related-party section describes a supply agreement with Société des Produits Nestlé SA and states Nestlé "met the 5% threshold … at inception of the Securities Purchase Agreement entered into on October 10, 2022; its ownership has since declined and no longer meets that threshold" [S6].
- A clinical-stage longevity biotech's proxy shows venture holders as groups: "Entities affiliated with Andreessen Horowitz" 7.28 %, "Entities affiliated with Cormorant" 7.41 %, "Entities affiliated with Sofinnova Venture Partners XI, L.P." 5.19 % (as of April 16, 2026; 44,397,817 shares) [S7]. The a16z footnote decomposes the group into fund vehicles (AH Bio Fund I, III, IV; Andreessen Horowitz LSV Fund III) and their general partners, whose managing members "may be deemed to hold shared voting and dispositive power" [S7]. The related-party section records a director's tie ending: "Dr. Pande, a member of our Board of Directors, was affiliated with Andreessen Horowitz at the time of this transaction. Dr. Pande departed from Andreessen Horowitz in June 2025" [S7], and lists 5 % holders' purchases in the January 2026 public offering ($115.0 million gross at $19.50 per share) [S7].
- Private financings: Form D for "Life Biosciences LLC" (Delaware LLC) reports total offering amount 31,000,002, all sold, first sale 2025-11-25, 8 investors, and related persons including "David Sinclair" with relationship "Director" [S8]. Form D for "NewLimit, Inc." (Delaware corporation, incorporated 2021, industry Biotechnology) reports 129,999,762 offered, 129,799,764 sold, first sale 2025-05-02, 38 investors, and directors including Brian Armstrong, Blake Byers and Zavain Dar [S9]. EDGAR full-text search found no Form D under "Altos Labs" or "Retro Biosciences" [S15] — absence of a filing is not absence of financing.
- Insider and holder filings: Form 4 carries the reporting owner's SEC CIK and a structured relationship (isDirector, isOfficer, isTenPercentOwner, officerTitle, e.g., "Principal Accounting Officer", "SVP, General Counsel") plus transactions [S12, S13]; Schedule 13G carries the reporting person, "classPercent" (5.03 for BlackRock, Inc. in the biotech), "typeOfReportingPerson" (HC) and the event date [S14].
- UK registries: Companies House shows officers with role, "Appointed on", resignations, nationality, residence and month/year of birth, and persons with significant control with banded "Nature of control" ("Ownership of shares – More than 25% but not more than 50%") and notified/ceased dates [S32]. A UK subsidiary's PSC page shows a corporate PSC (Juvenescence Limited, governed by the "Bvi Business Companies Act 2004", nature of control "Ownership of shares – 75% or more") notified and ceased on 2 August 2018, and an active statement that the company "knows or has reasonable cause to believe that there is no registrable person or registrable relevant legal entity" [S33].
- Legal-entity identifiers: GLEIF returns the biotech's LEI (529900NG0C40250Z7875, jurisdiction US-DE, registered at RA000602) and a reporting exception for its accounting parent with reason "NO_KNOWN_PERSON" [S28]; for Société des Produits Nestlé S.A. it returns a level-2 relationship "IS_DIRECTLY_CONSOLIDATED_BY" another LEI, with a RELATIONSHIP_PERIOD starting 2020-12-18, "corroborationLevel": "FULLY_CORROBORATED" and a link to the corroborating annual report [S29].

Artifacts: EDGAR submissions JSON, 10-K, DEF 14A, Form D, Forms 3/4/5, Schedule 13D/G, 8-K, Companies House officer and PSC records, GLEIF LEI and relationship records, NPPES organization records, brand storefronts. Capturable: all SEC and GLEIF by API without auth (SEC requires a declared User-Agent) [S10, S41]; Companies House by public web pages only (API key needed) [S39]; OpenCorporates not without a token [S39]. Agent-readiness: SEC structured forms 3; proxy/10-K text 2 (tables and footnotes must be parsed from HTML); GLEIF 3; Companies House web 1, API 3 with a key; NPPES 3.

### 1.3 Investors and funders: venture funds, family offices, foundations, government programs

Processes: invest through fund vehicles with general partners; nominate directors; fund grants, contracts and prizes; announce awardees.

- Venture groups act through many vehicles (fund LPs, "-B" and "-Q" parallel funds, annual funds, GP LLCs) [S7]; holding-company chains route a family office's stake through BVI-style shells [S6].
- NIH grants are fully structured: project number (5R01AG082737-03), fiscal year, award amount (436,002 in FY2025), administering institute (NIA), organization with UEI/DUNS/IPF code, contact PI with a RePORTER profile id, project start/end [S24].
- ARPA-H's PROSPR program "is investing up to $144 million over five years", and "performer teams will not receive a grant, but rather contracts that vary in funding amount per awardee and are contingent upon each team meeting aggressive research milestones"; the release names seven lead organizations (Stanford University, UT Health San Antonio, Columbia Mailman, Apollo Alpha, Cambrian BioPharma, Linnaeus Therapeutics, University of Rochester) with no per-team amount (published February 24, 2026) [S36].
- Hevolution Foundation announces grant recipients as name + institution + project-title lists (HF-AGE: nine recipients, "over $3.4 Million in 2023, with a Projected Total of Over $20 Million Through 2027") without award identifiers [S37]; its HF-GRO announcement lists 49 awardees by person and institution under a "$115 Million Grants Program" [S38].

Artifacts: grant records (structured), award press releases (lists), fund-vehicle footnotes in filings. Agent-readiness: NIH RePORTER 3; government and foundation releases 1–2 (scrape, no award ids, amounts often withheld).

### 1.4 Academic institutions, researchers and journals

Processes: employ researchers, manage institutional conflicts, require competing-interest statements, register and fund trials.

- ORCID records are self-asserted employment/education/funding/distinction entries with organization identifiers: one researcher's four employments at Harvard Medical School and MIT carry Ringgold ids and year precision, and an NIH funding entry carries a FundRef DOI [S25]; another's two employments carry ROR ids and day precision ("Assistant Professor", Yale University, 2018-09-01 → 2022-05-14; "Principal Investigator", Altos Labs, from 2022-05-15) [S26]; a third (an industry CEO) has an empty record [S27]. ORCID holds no board, equity or advisory roles [S25–S27].
- Institution-filed NIH financial-conflict-of-interest reports, published by ProPublica as a dataset "last updated in December 2019", give investigator, institution, company, "Disclosed Value" (e.g., "Value cannot be readily determined"), "Listed Reason" ("Equity Interest - Non-publicly traded entity …"), the linked research project, and a free-text management note ("His financial interests in both companies are being managed by the institution") [S2].
- Journal articles separate funding from competing interests. In an ALS mouse study, the Funding section reads "supported by grants from the Generalitat Valenciana … and from the University of Valencia (Spain) and Elysium Health Inc. (USA)", and the Declaration of competing interest lists financial support from Elysium Health to one author, employment of another by Elysium Health, and "patent #US2022/0160745A1 issued to Elysium Health Inc." (PMID 38241160, PMCID PMC10903100, DOI 10.1016/j.neurot.2023.10.011) [S21]. Note: a US "A1" number is a published application, not an issued patent; the statement's own wording is the asserted text, and the patent status is a D8 question. In the NICE peripheral-artery-disease trial, funding is the American Heart Association (three grant numbers), while "Nicotinamide riboside NR (250 mg pills) and matching placebo were manufactured by ChromaDex" and "ChromaDex provided the nicotinamide riboside"; competing interests name only other companies (PMID 38871717, PMCID PMC11176364, DOI 10.1038/s41467-024-49092-5) [S22].
- The ICMJE disclosure form (updated February 2021) has 13 numbered items: "All support for the present manuscript" (no time limit), then for the past 36 months grants or contracts, royalties or licenses, consulting fees, payment or honoraria, expert testimony, meeting/travel support, patents planned/issued/pending, DSMB or advisory board participation, leadership or fiduciary role, stock or stock options, receipt of equipment/materials/drugs/gifts, and other interests [S20].
- ClinicalTrials.gov names a lead sponsor and collaborators with a class (INDUSTRY, OTHER) as free-text names: of 12 studies matching "ChromaDex", the company is lead sponsor on 3 and collaborator on 9, under the string "ChromaDex, Inc." [S23] — the registry does not say whether a collaborator gave money or material (the NICE paper says material [S22]).

Artifacts: ORCID records, FCOI records, JATS funding / competing-interest sections, ICMJE forms, registry sponsor fields. Agent-readiness: ORCID 3 (but sparse for industry people), Europe PMC JATS 3 (section titles vary by publisher), CT.gov 3 (names, not ids), ProPublica FCOI 1 (frozen, web only).

### 1.5 Clinics and practitioners

Processes: enumerate in NPPES, operate under brand names through professional entities, receive industry payments.

- NPPES organization records give legal business name, other names (DBA), authorized official title, taxonomies, enumeration and update dates [S30, S31]. Search on an organization-name wildcard matches other names, which is how a clinic brand resolves to its operating P.A. [S30].
- CMS Open Payments publishes physician ownership and payment records: the 2025 ownership dataset has 2,646 rows (amount invested, value of interest, "terms_of_interest" such as "50 PERCENT OWNER IN REPORTING ENTITY", interest held by physician or immediate family member, dispute status) and the 2025 general-payment dataset 16,131,856 rows with 91 columns (manufacturer, amount, date, form and nature of payment such as "Gift", associated product names and NDC/PDI) [S34, S35]. It covers manufacturers of covered drugs, devices, biologicals and medical supplies; supplement brands are not reporting entities, so the longevity supplement economy is largely invisible in it [S34].

Agent-readiness: NPPES 3, Open Payments 3 (API, but volume rules out loading transactions as graph edges).

### 1.6 Regulators and norms (the harm side)

- FTC staff sent warning letters on November 13, 2023 (announced November 15, 2023) "to two trade associations and 12 registered dieticians and other online health influencers warning them about the lack of adequate disclosures in their Instagram and TikTok posts promoting the safety of the artificial sweetener aspartame or the consumption of sugar-containing products" [S16]. The letter to the American Beverage Association names ten dieticians and says "It appears that the American Beverage Association paid the dieticians to do so"; it lists five disclosure failures, starting with "some of the posts we reviewed included no disclosures", and states that receipt of the enclosed notice of penalty offenses "could subject the company to civil penalties of up to $50,120 per violation" [S17]. The individual letter to one dietician is a scanned PDF whose OCR text contains errors ("aspaiiame", "tmth") and whose page headers carry a different date (November 6, 2023) from page one (November 13, 2023) [S18].
- 16 CFR 255.5 (version effective 2023-07-26): "When there exists a connection between the endorser and the seller of the advertised product that might materially affect the weight or credibility of the endorsement, and that connection is not reasonably expected by the audience, such connection must be disclosed clearly and conspicuously. Material connections can include a business, family, or personal relationship. They can include monetary payment or the provision of free or discounted products …" [S19]. 255.1(d) makes advertisers liable "for failing to disclose unexpected material connections between themselves and their endorsers" [S19].

Artifacts: warning letters (PDF), press releases, notices of penalty offenses, the CFR text with point-in-time versions. Agent-readiness: eCFR 3 (versioned API, needs compression); FTC 1 (plain HTTP clients get an Akamai "Page Not Found" 404; Firecrawl works).

## 2. Artifact interviews: fields observed in real instances

Each artifact type below was read end to end in at least two real instances (exceptions stated). "→ model" notes say what the field means for D7.

### 2.1 Personal self-disclosure (page or in-container sentence)

Instances: Sinclair affiliations page [S1]; Attia CGM article disclosure [S3] (absent from its 2021 rendition [S3a]); Attia discounts page disclosures [S4]; Attia's full disclosure list, captured from the Internet Archive copy of 2025-09-30 [S5a] (the live list [S5] is script-gated and was not captured; adversarial-review correction — the research stage reported the list as uncapturable because the archive path had not been tried).

| field | S1 | S3/S4 | → model |
| --- | --- | --- | --- |
| discloser | page owner (implicit) | first person "I" | asserter = the Person; one asserter per assertion |
| counterparty | company name + optional URL, place, sector words ("NAD boosters") | "Dexcom", "Kosterina", "Maui Nui Venison" (S5a: 13 companies invested in, 8 present and 3 previous advisory roles) | Organization (name only; no identifier) |
| interest kind | role codes F, I, E, A, B, IP, L (several per entry) | "paid advisor", "investor" | one assertion per (kind, counterparty); `roleTitleVerbatim` keeps the code |
| interval | year ranges, "present", separate ranges per code ("B (2011-2017) I,A,IP (2011-present)") | S3/S4: none (present tense, in a revision dated 2024-12-09, not at the 2021 article date); S5a: month ranges per advisory role ("Dexcom (September 2020 – Aug 2021)", "Eight Sleep (April 2024 – Present)") | valid time with YEAR or MONTH precision as printed; open end = unknown end, not "now"; a present-tense line later than a stated end is a stale title (Q-D7-17) |
| group scope | "EdenRoc Sciences companies F,I,E,A,B, IP" then member companies with own years | — | group-level role ≠ member-level role (V-434) |
| page status | "Updated Oct 8th, 2024"; "not meant to represent a formal list"; "some entities may not have yet been added" | "For a full list of my disclosures, please visit …/about"; S5a: "This list is updated regularly."; "this list does not include investments in companies that have no involvement whatsoever in my sphere of influence or line of work" | capture completeness and source-declared incompleteness feed `disclosureFinding` and the disclosure-coverage Assessment |
| relation to content | none (standalone) | sits in the same article as the recommendation, but only in a later revision (absent on 2021-06-21) | DISCLOSURE TIMING (03): DISCLOSED_IN_CONTAINER only if the rendition carrying it is dated at or before the statement, else DISCLOSED_IN_LATER_REVISION (Attia); the tie's own interval comes from a dated source for the tie (S5a), never from the disclosing rendition |

### 2.2 Institutional financial-conflict-of-interest record (NIH FCOI)

Instance: ProPublica Dollars for Profs, one investigator record [S2] (only one record exists for this investigator; the dataset is frozen at December 2019). Fields: investigator, institution, department, company, disclosed value bucket, listed reason (interest kind taxonomy), free-text management note, linked research project title and narrative. → model: a third-party (institutional) assertion of an equity interest, linked to a funded project (seam D3/grant); value bucket is an enum, not a number.

### 2.3 Proxy statement (SEC DEF 14A)

Instances: Niagen Bioscience 2026 [S6]; BioAge Labs 2026 [S7].

| field | observed | → model |
| --- | --- | --- |
| director bios | name, age, "director since" month-year, committees, other boards (current and past with years), employer, nominating holder and agreement | BOARD_MEMBER_OF episodes (month precision); other-board ties as assertions from the same locator; nomination as a qualifier or a separate tie |
| leadership roles | Lead Independent Director, Chair, committee chair | role qualifier enum |
| beneficial-ownership table | holder, shares, percent (or "*" for < 1 %), options exercisable within 60 days, as-of date, shares outstanding | HOLDS_EQUITY_IN with `stakePercent` as stated, as-of date as valid-time basis |
| ownership footnotes | holding-company chains, "may be deemed", sole/shared voting and dispositive power, trusts and family members, 13D/A citation | chain of ownership edges; deemed vs record ownership; family members are private persons — do not ingest |
| group holders | "Entities affiliated with Andreessen Horowitz" decomposed into fund vehicles and GPs | group Organization with member vehicles; never push a group stake onto a member |
| related-party transactions | counterparty, agreement, dates, amounts, threshold status ("no longer meets that threshold"), affiliation end dates ("departed … in June 2025") | money ties with intervals; end dates for affiliations |

### 2.4 Form D (private offering notice)

Instances: Life Biosciences LLC [S8]; NewLimit, Inc. [S9]. Fields: issuer name, CIK, jurisdiction, entity type, year of incorporation (when given), address, related persons (first/last name, address, relationship list: Executive Officer / Director / Promoter, clarification), industry group, revenue range ("Decline to Disclose"), exemption item (06b), new vs amendment, date of first sale, security types, minimum investment, total offering amount, total sold, total remaining, number of investors, sales commissions, use of proceeds, signature date. → model: a financing record (D13 Event of kind financing, with amount and date) plus role assertions for related persons; persons carry no identifier (name + issuer address only) → resolution hypotheses.

### 2.5 Insider and holder forms (Form 4, Schedule 13G)

Instances: BioAge Form 4 [S12]; Niagen Form 4 [S13]; BioAge Schedule 13G [S14] (13D cited in [S6], [S7]). Fields: issuer, reporting owner name and CIK, relationship flags and officer title, transaction date, code (M, S, A), shares, price, acquired/disposed, shares owned after, direct/indirect; 13G: reporting person, class percent, type of reporting person (HC), event date, sole/shared voting and dispositive power. → model: role and holding assertions with day precision and an SEC CIK identifier for persons; transactions stay outside the graph.

### 2.6 Annual report narrative (10-K)

Instance: Niagen 10-K FY2025 [S11]; plus EDGAR submissions JSON for two issuers [S10]. Fields: corporate history with dated renames, mergers, acquisitions, dissolutions; subsidiary list; brands; supplier and contract-manufacturer statements with exclusivity and term; risk factors; former names with from/to (JSON). → model: identity episodes (former names), parent/subsidiary, brand ownership history, supply ties (D1/D8 seam).

### 2.7 Journal funding and competing-interest sections (JATS)

Instances: PMC10903100 [S21]; PMC11176364 [S22]. Fields: funding-group (funder name, FundRef DOI, award ids, principal awardee), Funding section prose, competing-interest prose per author, author affiliations, acknowledgements, materials statements ("manufactured by ChromaDex"). → model: four distinct ties — author employment (affiliation), money (funding), in-kind material supply, patent/IP — never collapsed into "funded by".

### 2.8 Disclosure norms (ICMJE form, 16 CFR 255)

Instances: ICMJE form [S20]; 16 CFR 255.1 and 255.5 (2023-07-26 version) [S19]. Fields: ICMJE's 13 interest categories with time frames; FTC's material-connection kinds (business, family, personal relationship; monetary payment; free or discounted products; other benefits) and the "clear and conspicuous" standard. → model: the controlled vocabulary for financial-interest kinds; disclosure adequacy is an assessment, not a property.

### 2.9 Regulator warning letter

Instances: FTC letters to the American Beverage Association [S17] and to one dietician [S18]; press release [S16]. Fields: date, addressee organization and officer, named endorsers, platforms, product/claim promoted, the regulator's finding phrased with modality ("It appears that …"), numbered deficiencies, penalty notice, response deadline, signatory. → model: a regulator assertion that an Organization paid named Persons (compensation tie, hedged), and a harm event (D8/D13 seam); the endorsers' posts are D9 occurrences.

### 2.10 Registries for identity and roles

| registry | instances read | fields → model |
| --- | --- | --- |
| ClinicalTrials.gov v2 sponsor module | 12 studies [S23] | lead sponsor name + class, collaborators name + class, responsible party (type, investigator, affiliation), overall officials (name, affiliation, role) → D3 roles; organization names are strings needing resolution |
| NIH RePORTER v2 | 3 project-years [S24] | project number, FY, award amount, IC, org (name, UEI, DUNS, IPF), PI (name, profile id, contact flag), dates → funding tie with amount per fiscal year |
| ORCID v3.0 | 3 records [S25–S27] | employments/educations/fundings/distinctions with org name + Ringgold/ROR/GRID/FundRef id, role title, start/end with variable precision, source (self) → EMPLOYED_BY / affiliation, Person identifier ORCID |
| GLEIF v1 | 2 entities + 1 relationship + 1 exception [S28, S29] | LEI, legal name, jurisdiction, legal form, registered-at id, registration status; relationship type, period, corroboration level/document; reporting exception reason → LegalEntity identity, PARENT_OF with episode |
| NPPES (NPI) | 2 organizations [S30, S31] (+2 in search results) | NPI, legal business name, other names (DBA), taxonomies, authorized official title, addresses, dates → clinic operator entity; brand-as-other-name |
| Companies House (web) | 2 companies [S32, S33] | company number, status, type, incorporation date, SIC; officers (role, appointed, resigned); PSC (nature-of-control bands, notified/ceased, corporate PSC governing law); "no registrable person" statements → board/officer episodes, stake bands |
| CMS Open Payments | 2 datasets × 2 rows [S34, S35] | ownership: amount invested, value, terms; general: amount, date, form, nature, product → query-time money facts about public-actor clinicians |

## 3. The four lenses

**Science.** The researcher question is whether the people behind evidence have ties to what they study, and of what kind. Papers already separate funding, material supply, employment and patents [S21, S22]; registries blur them ("collaborator") [S23]; institutional FCOI records link an equity interest to a specific funded project [S2]. ORCID gives clean employment intervals with organization ids but nothing commercial [S25, S26]. The model must keep tie kinds apart and carry the locator into the specific section.

**Economics.** Investors need control, ownership, money flows and identity continuity. Filings are authoritative but layered: percentages are "as stated" at an as-of date, chains run through holding companies and fund vehicles, and "may be deemed" ownership differs from record ownership [S6, S7]. Renames and dissolved brand subsidiaries break naive name matching [S10, S11]. Private financing is visible only when a Form D exists [S8, S9, S15]. Government contracts and foundation grants often withhold amounts [S36, S37].

**Community.** Biohackers meet these people through podcasts, newsletters and social posts. Disclosure is uneven: rich static lists [S1], in-container sentences [S3, S4], lists that cannot be captured live [S5] (an archived copy can be [S5a]), disclosures added in later revisions [S3a], and in the worst cases paid endorsements without adequate disclosure, which the regulator documents [S16, S17]. The FTC standard is about connections "not reasonably expected by the audience" and includes free products and personal relationships [S19] — wider than "financial interest" in the narrow sense.

**AI (agent-readiness).** SEC (JSON/XML, User-Agent required), GLEIF, NIH RePORTER, ORCID, Europe PMC, ClinicalTrials.gov, NPPES, eCFR and Open Payments are API-ready without keys [S10, S24–S31, S34]. Companies House and OpenCorporates are blocked without keys [S39]; FTC blocks plain HTTP [tool log #7]; script-gated disclosure lists defeat both scrapers [S5] (the Internet Archive id_ copy of the pre-redirect URL recovers them [S5a]). Persons are the hardest identity: Form D names carry no id [S8], Form 4 carries an SEC CIK [S12], ORCID and NPI exist only for researchers and clinicians, and self-disclosure pages carry no counterparty identifiers at all [S1]. Locators must survive NBSP and OCR noise [S1, S18].

## 4. Capturable sources and readiness summary (input to 08-sources-and-tools.md)

| source | access | auth | identifiers emitted | locator kinds | readiness | exercised |
| --- | --- | --- | --- | --- | ---: | --- |
| SEC EDGAR submissions / Archives / EFTS | api (JSON, XML, HTML) | User-Agent with contact (EDGAR_IDENTITY) | CIK, accession number, former names | XML path; HTML text offset | 3 (forms), 2 (proxy/10-K text) | yes (curl) |
| GLEIF API | api | none | LEI, registration authority id | JSON path | 3 | yes (curl) |
| NIH RePORTER v2 | api | none | appl_id, project_num, UEI, DUNS, PI profile id | JSON path | 3 | yes (curl) |
| ORCID public API | api | none | ORCID, Ringgold, ROR, GRID, FundRef | JSON path, put-code | 3 (sparse for industry) | yes (curl) |
| Europe PMC fullTextXML | api | none | PMID, PMCID, DOI, FundRef, award ids | XML element, char offset | 3 | yes (curl) |
| PubMed (MCP) | mcp | none | PMID, PMCID, DOI | — | 3 | yes |
| ClinicalTrials.gov v2 | api | none | NCT id; sponsor names (strings) | JSON path | 3 | yes (curl) |
| NPPES (NPI MCP) | mcp | none | NPI | JSON path | 3 | yes |
| CMS Open Payments | api | none | record_id, NPI, profile id, manufacturer id | row id + column | 3 (volume) | yes (curl) |
| eCFR versioner | api | none (compression required) | CFR section + version date | section path | 3 | yes (curl) |
| Companies House | web; api with key | key for API | company number, officer appointment ids | HTML text | 1 web / 3 api | web only |
| OpenCorporates | api | token | jurisdiction + company number | — | 0 without token | probe (401) |
| FTC press releases and letters | scrape | none, but bot-blocked | none | PDF page + text | 1 | yes (Firecrawl) |
| Self-disclosure pages | scrape | none | none | text quote + offset | 1–2 | yes (Firecrawl, Tavily) |
| ProPublica Dollars for Profs | scrape | none | NIH FCOI record path | text quote | 1 (frozen 2019) | yes (Firecrawl) |
| ARPA-H / Hevolution releases | scrape | none | none | text quote | 1 | yes (Firecrawl) |
| Crunchbase, PitchBook, LinkedIn | licensed / terms-restricted | license | vendor ids | — | 0 (not used) | no |

## 5. Source keys (URL · title · retrieval date · tool)

- S1 · https://sinclair.hms.harvard.edu/david-sinclairs-affiliations · "David A. Sinclair's Affiliations | The Sinclair Lab" · 2026-10-08 · Firecrawl CLI (also Tavily extract)
- S2 · https://projects.propublica.org/dollars-for-profs/disclosures/harvard-medical-school-david-sinclair-nih-7245 · "Dollars for Profs - David Sinclair | ProPublica" · 2026-10-08 · Firecrawl CLI
- S3 · https://peterattiamd.com/are-continuous-glucose-monitors-a-waste-of-time-for-people-without-diabetes/ · "Are continuous glucose monitors a waste of time for people without diabetes?" (Peter Attia MD) · 2026-10-08 · Firecrawl CLI
- S4 · https://peterattiamd.com/members/discounts/ · "Exclusive Member Discounts - Peter Attia MD" · 2026-10-08 · Firecrawl CLI
- S3a · http://web.archive.org/web/20210621202948id_/https://peterattiamd.com/are-continuous-glucose-monitors-a-waste-of-time-for-people-without-diabetes/ · S3 as archived by the Internet Archive 2021-06-21 (no disclosure paragraph) · 2026-10-08 · curl (check stage)
- S5 · https://peterattiamd.com/about/ (and https://peterattiamd.com/disclosures/, which redirects to it) · "About Peter - Peter Attia MD" · 2026-10-08 · Firecrawl CLI, Tavily extract, curl
- S5a · http://web.archive.org/web/20250930172559id_/https://peterattiamd.com/disclosures/ · "Disclosures - Peter Attia" as archived 2025-09-30 (full list: investments, present and previous advisory roles with month ranges) · 2026-10-08 · curl (adversarial-review stage; sha256 b001b739…712c)
- S6 · https://www.sec.gov/Archives/edgar/data/1386570/000138657026000022/cdxc-20260429.htm · Niagen Bioscience, Inc., Schedule 14A definitive proxy statement (filed 2026-04-29, accession 0001386570-26-000022) · 2026-10-08 · curl
- S7 · https://www.sec.gov/Archives/edgar/data/1709941/000119312526166738/bioa-20260421.htm · BioAge Labs, Inc., Schedule 14A definitive proxy statement (filed 2026-04-21, accession 0001193125-26-166738) · 2026-10-08 · curl
- S8 · https://www.sec.gov/Archives/edgar/data/1751806/000175180626000003/primary_doc.xml · Form D, Life Biosciences LLC (filed 2026-04-24, accession 0001751806-26-000003) · 2026-10-08 · curl
- S9 · https://www.sec.gov/Archives/edgar/data/1977037/000197703725000002/primary_doc.xml · Form D, NewLimit, Inc. (accession 0001977037-25-000002, signed 2025-05-14) · 2026-10-08 · curl
- S10 · https://data.sec.gov/submissions/CIK0001386570.json and https://data.sec.gov/submissions/CIK0001709941.json · EDGAR submissions (Niagen Bioscience, Inc.; BioAge Labs, Inc.) · 2026-10-08 · curl
- S11 · https://www.sec.gov/Archives/edgar/data/1386570/000138657026000013/cdxc-20251231.htm · Niagen Bioscience, Inc., Form 10-K for fiscal year 2025 (filed 2026-03-04, accession 0001386570-26-000013) · 2026-10-08 · curl. S11b: https://www.truniagen.com/pages/terms-of-service · Tru Niagen storefront (no legal-entity text rendered) · 2026-10-08 · Firecrawl CLI
- S12 · https://www.sec.gov/Archives/edgar/data/1709941/000183629726000005/form4-07012026_080701.xml · Form 4, BioAge Labs, Inc. (accession 0001836297-26-000005) · 2026-10-08 · curl
- S13 · https://www.sec.gov/Archives/edgar/data/1386570/000204250926000001/wk-form4_1783545518.xml · Form 4, Niagen Bioscience, Inc. (accession 0002042509-26-000001) · 2026-10-08 · curl
- S14 · https://www.sec.gov/Archives/edgar/data/1709941/000201238326001675/primary_doc.xml · Schedule 13G, BioAge Labs, Inc. (accession 0002012383-26-001675) · 2026-10-08 · curl
- S15 · https://efts.sec.gov/LATEST/search-index?q=%22NewLimit%22&forms=D (and the same query for "Life Biosciences", "Altos Labs", "Retro Biosciences", "Loyal") · EDGAR full-text search · 2026-10-08 · curl
- S16 · https://www.ftc.gov/news-events/news/press-releases/2023/11/ftc-warns-two-trade-associations-dozen-influencers-about-social-media-posts-promoting-consumption · "FTC Warns Two Trade Associations and a Dozen Influencers About Social Media Posts Promoting Consumption of Aspartame or Sugar" · 2026-10-08 · Firecrawl MCP search + CLI scrape
- S17 · https://www.ftc.gov/system/files/ftc_gov/pdf/warning-letter-american-bev.pdf · "Warning Letter to American Beverage Association" · 2026-10-08 · Firecrawl (PDF parser)
- S18 · https://www.ftc.gov/system/files/ftc_gov/pdf/warning-letter-bonci.pdf · FTC warning letter to Leslie Bonci · 2026-10-08 · Firecrawl MCP (PDF parser)
- S19 · https://www.ecfr.gov/api/versioner/v1/full/2023-07-26/title-16.xml?part=255&section=255.5 (and section=255.1; versions list https://www.ecfr.gov/api/versioner/v1/versions/title-16.json?part=255) · 16 CFR Part 255, Guides Concerning the Use of Endorsements and Testimonials in Advertising · 2026-10-08 · curl
- S20 · https://www.icmje.org/disclosure-of-interest/ and https://www.icmje.org/downloads/coi_disclosure.docx · "Disclosure of Interest (Updated February 2021)" / ICMJE Disclosure Form · 2026-10-08 · Tavily extract, curl
- S21 · https://www.ebi.ac.uk/europepmc/webservices/rest/PMC10903100/fullTextXML · "Nicotinamide riboside, pterostilbene and ibudilast protect motor neurons and extend survival in ALS mice" (Neurotherapeutics 2023; PMID 38241160; PMCID PMC10903100; DOI 10.1016/j.neurot.2023.10.011) · 2026-10-08 · PubMed MCP (metadata), curl (full text)
- S22 · https://www.ebi.ac.uk/europepmc/webservices/rest/PMC11176364/fullTextXML · "Nicotinamide riboside for peripheral artery disease: the NICE randomized clinical trial" (Nature Communications 2024; PMID 38871717; PMCID PMC11176364; DOI 10.1038/s41467-024-49092-5) · 2026-10-08 · curl (Europe PMC search + full text)
- S23 · https://clinicaltrials.gov/api/v2/studies?query.spons=ChromaDex&pageSize=50&fields=… · ClinicalTrials.gov API v2 sponsor/collaborator fields (e.g., NCT06005350, NCT03562468, NCT04614714, NCT04110028) · 2026-10-08 · curl
- S24 · https://api.reporter.nih.gov/v2/projects/search (POST, pi_names Sinclair David, FY2023–2025) · NIH RePORTER project records R01AG082737 · 2026-10-08 · curl
- S25 · https://pub.orcid.org/v3.0/0000-0002-9936-436X/activities · ORCID record (David Sinclair) · 2026-10-08 · curl
- S26 · https://pub.orcid.org/v3.0/0000-0001-9890-9324/activities · ORCID record (Morgan Levine) · 2026-10-08 · curl
- S27 · https://pub.orcid.org/v3.0/0000-0002-6008-2170/activities · ORCID record (Kristen Fortney; empty) · 2026-10-08 · curl
- S28 · https://api.gleif.org/api/v1/lei-records?filter[entity.legalName]=BioAge%20Labs and https://api.gleif.org/api/v1/lei-records/529900NG0C40250Z7875/direct-parent-reporting-exception · GLEIF LEI record and reporting exception (BioAge Labs, Inc.) · 2026-10-08 · curl
- S29 · https://api.gleif.org/api/v1/lei-records/549300CJIDHZBCKJ7T95/direct-parent-relationship · GLEIF relationship record (Société des Produits Nestlé S.A.) · 2026-10-08 · curl
- S30 · NPPES record NPI 1215617402 (and search "Fountain Life*", NPI-2) via NPI Registry MCP (CMS NPPES API v2.1) · "FOREVER YOUNG MEDICAL SERVICES P.A." · 2026-10-08
- S31 · NPPES record NPI 1316697386 via NPI Registry MCP · "HUMAN LONGEVITY INC" · 2026-10-08
- S32 · https://find-and-update.company-information.service.gov.uk/company/10793871/officers and …/persons-with-significant-control · "SHIFT BIOSCIENCE LIMITED people - Find and update company information - GOV.UK" · 2026-10-08 · curl
- S33 · https://find-and-update.company-information.service.gov.uk/company/11496711 and …/persons-with-significant-control · Juvenescence UK Ltd (Companies House) · 2026-10-08 · curl
- S34 · https://openpaymentsdata.cms.gov/api/1/datastore/query/800aed1b-20ed-4d19-b0c9-dcd10f197ffc/0 · CMS Open Payments "2025 Ownership Payment Data" (metastore modified 2026-06-30) · 2026-10-08 · curl
- S35 · https://openpaymentsdata.cms.gov/api/1/datastore/query/fb0b1734-1410-429d-92f6-3f4b35218e5e/0 · CMS Open Payments "2025 General Payment Data" · 2026-10-08 · curl
- S36 · https://arpa-h.gov/news-and-events/research-teams-add-more-healthy-years-americans-lives-they-age · "ARPA-H awards research teams to add more healthy years to Americans' lives as they age" (published February 24, 2026) · 2026-10-08 · Firecrawl
- S37 · https://hevolution.com/en/web/guest/w/hevolution-foundation-advancing-geroscience-efforts-hf-age-grant-recipients-announced · "Hevolution Foundation Advancing Geroscience Efforts (HF-AGE) Grant Recipients Announced" · 2026-10-08 · Firecrawl
- S38 · https://hevolution.com/press-releases/-/asset_publisher/mdxo/content/hevolution-announces-49-awards-to-catalyze-discovery-in-healthspan-science-through-innovative-115-million-grants-progr-1 · "Hevolution Announces 49 Awards to Catalyze Discovery in Healthspan Science Through Innovative $115 Million Grants Program" · 2026-10-08 · Firecrawl MCP search (excerpt)
- S39 · https://api.company-information.service.gov.uk/search/companies?q=shift%20bioscience (HTTP 401 "Empty Authorization header") and https://api.opencorporates.com/v0.4/companies/search?q=niagen+bioscience (HTTP 401 "Invalid Api Token") · 2026-10-08 · curl
- S40 · https://www.hubermanlab.com/episode/dr-david-sinclair-the-biology-slowing-reversing-aging (page-not-found body; site chrome names "Scicomm Media's Privacy Policy") · 2026-10-08 · Firecrawl CLI
- S41 · https://www.sec.gov/files/company_tickers.json · SEC company tickers (NAGE → CIK 1386570; BIOA → CIK 1709941) · 2026-10-08 · curl
