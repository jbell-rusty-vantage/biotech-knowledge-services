# D11 — fixture candidates (research stage, 2026-10-08)

All captures are in scratch `C:\Users\Pinda\AppData\Local\Temp\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\ft\D11\raw\` and were hashed with `sha256sum` over the exact bytes saved. Offsets are 0-based **character** offsets into the UTF-8-decoded capture (Python `str.find`), unless marked "byte". Quotes are copied from the capture; where the capture contains markup or escapes inside the span, the raw form is given too. Retrieval date for all: 2026-10-08.

Recommended set for the fixtures stage (≥ 3 required): **FC-1** (unstructured-to-entity), **FC-2** (disconfirmation: retraction), **FC-3** (harm: boxed warning), **FC-4** (identifier bridge), plus FC-5 or FC-7 if budget allows.

---

## FC-1 — JATS full text of the NR trial paper · UNSTRUCTURED-TO-ENTITY (directive 3.8)

- URL: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5876407/fullTextXML
- Title: Chronic nicotinamide riboside supplementation is well-tolerated and elevates NAD+ in healthy middle-aged and older adults (Nat Commun 2018; PMID 29599478 · PMCID PMC5876407 · DOI 10.1038/s41467-018-03421-7; trial NCT02921659)
- Retrieved: 2026-10-08 · tool: curl (Europe PMC REST) · capture `epmc-fulltext-PMC5876407.xml` (142,126 bytes)
- sha256: `dd620181966f862df7030f4bb7b09811befd90e8e67c2b94fc90f9c212664794`
- Licence: CC BY (Europe PMC core record `license: cc by`)
- Quotes:
  1. Methods › "Study design, randomization, and intervention" (`sec` Sec11, `p` Par30), offset 59373 — "Subjects ingested nicotinamide riboside chloride (NIAGEN®; 500 mg, twice per day; ChromaDex, Inc.) and placebo capsules for 6 weeks each in a randomly determined order." — raw form: `NIAGEN<sup>®</sup>; 500\u2009mg` (superscript markup and a U+2009 thin space).
  2. Results › "Treatment-emergent adverse events" (Sec4, Par10), offset 24174 — "NR was well tolerated at the dose tested, and no serious adverse events occurred."
  3. Methods › "Ethical approval, informed consent, and study location" (Sec10), offset 57577 — "The study was registered on ClinicalTrials.gov under the identifier NCT02921659." — raw form wraps the id: `<ext-link … ext-link-type="pmc:clinical-trial" xlink:href="NCT02921659">NCT02921659</ext-link>`.
  4. Discussion (Par27), offset 56171 — "the dose tested in the present study exceeds the label-recommended dose and should be considered investigational until further work can be performed to confirm the safety and efficacy of higher doses for use by the general population"
  5. Acknowledgements (`ack`), offset 81858 — "Study pills, NR standards for metabolite analyses and partial funding support were provided by ChromaDex, Inc."
  6. Competing interests (`notes`), offset 82631 — "The authors declare no competing interests."
- Path to demonstrate: question Q-D11-03 "what NR form and dose did NCT02921659 administer?" → chunks of the JATS DocumentTextVersion found via MENTIONS (NR, NCT02921659) or vector search → chunk containing Par30 → assertion `ADMINISTERED_MATERIAL`-style predicate (study → substance form UNII 8XM2XT8VWI, 500 mg, twice per day) → locator (SECTION `Par30` + TEXT_QUOTE quote 1, normalization folds U+2009) → snapshot sha256 above. The verifier re-selects the same span from the same bytes.
- Also answers: Q-D11-02 (trial link asserted in text, not in index or registry), Q-D11-08 (quotes 5 vs 6: disclosure disagreement), CQ-PV-04 (salt form vs label basis; with FC-5), Q-D11-21 (study dose 1000 mg/day vs label 300 mg; with FC-9), CQ-PV-02, CQ-PV-03.
- Harm aspect: quote 4 is the paper's own caution about dose; quotes 5–6 are a disclosure inconsistency (financial-interest seam to D7).

## FC-2 — Retracted resveratrol paper · DISCONFIRMATION (integrity)

Three captures that together form one fixture.

(a) Crossref work record of the retracted article
- URL: https://api.crossref.org/works/10.1152/ajpheart.01012.2001
- Title: Pharmacological preconditioning with resveratrol: role of nitric oxide (Am J Physiol Heart Circ Physiol 2002; PMID 12003802)
- Retrieved: 2026-10-08 · tool: curl · capture `crossref-retracted-das2002.json`
- sha256: `204eda45b9b835b7caa98e42829476a5ce42b846ed34e95df3cbd5d628896c29`
- Quote (JSON pointer `/message/updated-by/0`), offset 6969 — `"updated-by":[{"DOI":"10.1152\/ajpheart.zh4-0450-retr.2012","type":"retraction","label":"Retraction","source":"retraction-watch"`

(b) PubMed record of the retracted article
- URL: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=12003802&retmode=xml
- Retrieved: 2026-10-08 · tool: curl · capture `eutils-efetch-12003802.xml`
- sha256: `c67eb0479a314f26041c83b2ba2a54f7d4e0e9633637e72f2229813e342e9ce9`
- Quotes: offset 4293 — `<PublicationType UI="D016441">Retracted Publication</PublicationType>`; offset 6196 — `<CommentsCorrections RefType="RetractionIn"><RefSource>Am J Physiol Heart Circ Physiol. 2012 Jun 1;302(11):H2446. doi: 10.1152/ajpheart.zh4-0450-retr.2012.</RefSource><PMID Version="1">22833916</PMID></CommentsCorrections>`

(c) Publisher retraction notice
- URL: https://journals.physiology.org/doi/10.1152/ajpheart.zh4-0450-retr.2012
- Title: Retraction (Am J Physiol Heart Circ Physiol 302: H2446, 2012)
- Retrieved: 2026-10-08 · tool: Firecrawl CLI scrape (markdown rendition; publisher HTML) · capture `fc-retraction-notice.md`
- sha256: `ad4d8fcaed034959d81baf3d7ea37abdbc12aca65b7aab1969f954188a58c0b8` (hash of the markdown rendition, not of the served HTML)
- Quotes: offset 15756 — "A research misconduct investigation at the University of Connecticut Health Center has determined that images appearing in Fig. 7 _A_ of the paper contain instances of data fabrication. Therefore, this article is being retracted by the American Physiological Society." (markdown italics `_A_` in the capture); offset 16025 — "Please note that effort was made to contact all authors."
- Answers: Q-D11-04, Q-D11-05 (any assertion citing PMID 12003802 must be flagged), CQ-PV-05.
- Disconfirmation aspect: the claim "resveratrol pharmacologically preconditions the heart" loses its source; discovery tools (Firecrawl research index, PubMed MCP) return the paper without a retraction link (tool-log rows 35–36).

## FC-3 — Sirolimus SPL boxed warning · HARM

- URL: https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/19880f51-badb-4846-a02a-592a210690ab.xml (history: …/19880f51-badb-4846-a02a-592a210690ab/history.json)
- Title: SIROLIMUS SOLUTION [VISTAPHARM, LLC] — SPL set 19880f51-badb-4846-a02a-592a210690ab, version 11, effectiveTime 20240430
- Retrieved: 2026-10-08 · tool: curl (DailyMed web services v2) · captures `dailymed-spl-19880f51.xml`, `dailymed-history-19880f51.json`
- sha256: SPL `78a1edf8dba1144e83c42ad1b06d14f84afa99b125034b7da986143915d1b837`; history `5c40fce91dd7772f3730d8080a5d4a2290d5714f0e65317320aba7d121382f06`
- Quotes:
  1. offset 11033 — `<section ID="LINK_b7e90274-8447-41bf-8803-c34d58d232cd">` (stable section id)
  2. offset 11170 — `<code code="34066-1" codeSystem="2.16.840.1.113883.6.1" displayName="BOXED WARNING SECTION"/>`
  3. offset 11279 — "WARNING: IMMUNOSUPPRESSION, USE IS NOT RECOMMENDED IN LIVER OR LUNG TRANSPLANT PATIENTS" (inside `<title>`)
  4. offset 11976 — "Only physicians experienced in immunosuppressive therapy and management of renal transplant patients should use sirolimus for prophylaxis of organ rejection in patients receiving renal transplants."
  5. history JSON offset 130 — `"spl_version": 11, "published_date": "Jan 14, 2026"`
- Answers: Q-D11-11, CQ-PV-05 (openFDA rendition `openfda-drug-label-sirolimus.json` flattens this section and loses the id), CQ-PV-02.
- Harm aspect: rapamycin is used off-label for longevity (D5/D13 threads, PEARL NCT04488601); the label's boxed warning is the authoritative harm statement. Valid time (effectiveTime 2024-04-30) differs from DailyMed publication (Jan 14, 2026).

## FC-4 — GSRS substance record for NR chloride · IDENTIFIER BRIDGE (supports harm via quantity basis)

- URL: https://precision.fda.gov/ginas/app/api/v1/substances(8XM2XT8VWI)?view=full (moiety: …/substances(0I8H2M0L7N)?view=full)
- Title: GSRS substance NICOTINAMIDE RIBOSIDE CHLORIDE (UNII 8XM2XT8VWI, record version 18); NICOTINAMIDE RIBOSIDE (UNII 0I8H2M0L7N, version 24)
- Retrieved: 2026-10-08 · tool: curl · captures `gsrs-fda-8XM2XT8VWI.json`, `gsrs-fda-0I8H2M0L7N.json`
- sha256: `ec5e5d2dc8e5a156deb38de9fca4a7f5a212ac42f54f4d769205fbff4f1b3ddd` (salt); `a673c453fcbb047df59dc5ad543e2e08c418061939fc56874f9a735182c7ed24` (moiety)
- Quotes (salt record):
  1. offset 264 — `"version":"18"`
  2. offset 3196 — `"codeSystem":"PUBCHEM","code":"90480033"`
  3. offset 3566 — `"codeSystem":"CAS","code":"23111-00-4"`
  4. offset 4530 — `"codeSystem":"GRAS Notification (GRN No.)","code":"635"`
  5. offset 5980 — `"approvalID":"0I8H2M0L7N","name":"NICOTINAMIDE RIBOSIDE"` followed at offset 6147 by `"type":"ACTIVE MOIETY"`
- Answers: CQ-ID-04, Q-D11-09, CQ-AX-14, Q-D11-10 (authority check that rejects the Europe PMC ChEBI mislink), CQ-PV-04 (with FC-1 and FC-5).
- Locator kind: SECTION with JSON pointer (`/codes/i`, `/relationships/j`) — exercises the open question whether JSON_POINTER becomes its own selector kind.

## FC-5 — DSLD label versions of one product · HARM (dose directions widened under one GTIN)

- URLs: https://api.ods.od.nih.gov/dsld/v9/label/323170 and https://api.ods.od.nih.gov/dsld/v9/label/295562
- Title: Tru Niagen 300 mg (ChromaDex) — DSLD labels 323170 (entered 2025-04-24) and 295562 (entered 2023-05-24)
- Retrieved: 2026-10-08 · tool: curl · captures `dsld-label-323170.json`, `dsld-label-295562.json`
- sha256: 323170 `d90025929a353034c6c549b41eb1558e7673ce3eba2a0109ca48fed9830c003d`; 295562 `499b55edd212d6f2ace5081cbe1ac28266586bd522e6c6d46cf2c39091217ce5`
- Quotes:
  1. 295562 offset 1301 — "Suggested use: Adults take one capsule daily or as recommended by your healthcare professional."
  2. 323170 offset 1497 — "Suggested use: Adults take one capsule 1-3 times daily as needed or as recommended by your healthcare professional."
  3. 295562 offset 1020 — `"maxDailyServings":1`; 323170 offset 1216 — `"maxDailyServings":3`
  4. both: 323170 offset 164 / 295562 offset 165 — `"upcSku":"8 50015 31111 6"` (normalizes to GTIN 00850015311116; check digit valid)
  5. 323170 offset 390 — `"type":"Image difference, same product","labelId":295562`
  6. 323170 offset 3739 — `"name":"Nicotinamide Riboside Chloride"` with `"uniiCode":"8XM2XT8VWI"` at offset 3827 (nested form of the branded row "Niagen", whose row-level `uniiCode` is null)
- Answers: Q-D11-12, CQ-PV-04, Q-D11-13, Q-D11-21.
- Harm aspect: maximum labelled daily servings went from 1 to 3 (computed: up to 3 × 300 mg = 900 mg/day of the branded ingredient) between label versions that share a GTIN; a GTIN-keyed product record would silently merge them. Seals changed too (295562 "NSF … Certified Sport" at offset 1711; 323170 "Alkemist Assured" near offset 1968).

## FC-6 — openFDA CAERS reports naming Tru Niagen · HARM with built-in disconfirmation of causality

- URL: https://api.fda.gov/food/event.json?search=products.name_brand:%22niagen%22&limit=5
- Title: openFDA food adverse event reports (34 matches; meta.last_updated 2026-07-07)
- Retrieved: 2026-10-08 · tool: curl · capture `openfda-caers-nr.json`
- sha256: `1e445898dc0bce4cfd2e169f29107f28de4a5dc2e15cf0731712c5ac76568c75`
- Quotes:
  1. offset 298 — "Submission of an adverse event report does not constitute an admission that a product caused or contributed to an event."
  2. offset 419 — "The information in these reports has not been scientifically or otherwise verified as to a cause and effect relationship and cannot be used to estimate incidence (occurrence rate) or to estimate risk."
  3. offset 856 — `"report_number": "2020-CFS-007354"`; offset 1343 — `"name_brand": "CHROMADEX TRU NIAGEN"`
- Answers: Q-D11-18, CQ-AX-04 (a report is "reported", not "measured"), Q-D11-13 (brand string only, no GTIN).
- Note: report bodies contain consumer age/sex; the fixture should cite report numbers and reactions only (no PHI exists in openFDA, but keep person-level detail out of the graph).

## FC-7 — FDA NDI 1259 reinstatement letter for NMN · DISCONFIRMATION (regulatory reversal; earlier letters superseded)

- URL: https://downloads.regulations.gov/FDA-2022-S-0023-0069/attachment_1.pdf (metadata: https://api.regulations.gov/v4/documents/FDA-2022-S-0023-0069)
- Title: NDI 1259 - Reinstatement Response Letter from FDA HFP to Inner Mongolia Kingdomway Pharmaceutical Limited regarding NDI 1259 - B-Nicotinamide Mononucleotide (NMN) (posted 2025-12-09)
- Retrieved: 2026-10-08 · tool: Firecrawl CLI scrape (curl got 403) · capture `fc-regsgov-FDA-2022-S-0023-0069.md` (markdown rendition of the PDF); metadata `regsgov-api-doc.json`
- sha256: rendition `223e60401c6901a3ff4d0230cfb24517881154629dec1a15d6e3793ec5517e17`; metadata `bddc3a5a00985ac73325de5fcf40b57391639c7741f4782737885e12269d3175`. The PDF bytes themselves were not captured (open item for the fixtures stage: capture via Firecrawl rawHtml/PDF or browser fallback so the snapshot hash is of the issuer's bytes).
- Quotes:
  1. offset 989 — "On September 29, 2025, \nFDA responded to the petition and explained that the agency has reconsidered and changed its \ninterpretation of one aspect of 21 U.S.C. § 321(ff)(3)(B)" (line breaks as captured)
  2. offset 1271 — "Because NMN is not excluded \nfrom the dietary supplement definition, we are setting aside our October 11, 2022 and November \n4, 2022 letters."
  3. offset 2343 — "This communication effectively supersedes our October 11,2022 and November 4,2022 responses to NDIN 1259 and will be placed on public display at www.regulations.gov under NDIN 1259."
- Answers: Q-D11-14 (status timeline with superseded documents), CQ-PV-02 (PDF_PAGE locator; page 1 marker inline), Q-D11-17 (curl 403 is a recorded capture failure).
- Parser finding: the rendition drops the β of "β-nicotinamide mononucleotide" (captured as “-nicotinamide mononucleotide”); the sibling letter FDA-2022-S-0023-0068 is image-only (`fc-regsgov-FDA-2022-S-0023-0068.md`, sha256 `5b8d6611b7c220ec79ce42de905ec4fb29c2185c0e22f8080e6401230721f6f8`, only `[Image: ImagePart_4580]` placeholders) → OCR needed.

## FC-8 — Retrospective registration of NCT02921659 · DISCONFIRMATION (registration quality)

(a) ICTRP record
- URL: https://trialsearch.who.int/Trial2.aspx?TrialID=NCT02921659
- Title: ICTRP trial record NCT02921659 (Safety & Efficacy of Nicotinamide Riboside Supplementation …)
- Retrieved: 2026-10-08 · tool: curl · capture `ictrp-trial.html`
- sha256: `4a631017d0333ff20a7e416d9c49766e026c40d865606c53e8b2494b3bb38dde`
- Quotes: offset 25536 — `<span id="DataList3_ctl01_Label1">No</span>` (row label "Prospective Registration:"); offset 25063 — `<span id="DataList3_ctl01_Date_registrationLabel">29/09/2016</span>`; offset 24164 — `<span id="DataList3_ctl01_Last_updatedLabel">12 December 2016</span>` (row label "Last refreshed on:")

(b) ClinicalTrials.gov v2 record
- URL: https://clinicaltrials.gov/api/v2/studies/NCT02921659
- Retrieved: 2026-10-08 · tool: curl · capture `ctgov-NCT02921659.json`
- sha256: `b06d8ea18738c62200af055c2d57cf28b54251bf03c59db7b9795ec4614958a0`
- Quotes: offset 592 — `"startDateStruct":{"date":"2015-04"}`; offset 752 — `"studyFirstSubmitDate":"2016-09-29"`; offset 1140 — `"collaborators":[{"name":"ChromaDex, Inc."`
- Answers: Q-D11-06, CQ-PV-05 (ICTRP mirror last refreshed 2016), Q-D11-08 (collaborator), Q-D11-02 (no PMID back-link).
- Disconfirmation aspect: the registry date post-dates the start by ~17 months, so the registration cannot have constrained outcome choice; the Clinical Trials MCP connector hides `studyFirstSubmitDate`.

## FC-9 — Brand claim page · claim to be tested (seam D10 evidence mission)

- URL: https://www.truniagen.com/products/tru-niagen-300mg
- Title: Tru Niagen® 300mg | Boost NAD+ Levels By Over 50%
- Retrieved: 2026-10-08 · tool: Tavily CLI extract (markdown rendition) · capture `tvly-extract-truniagen.md`
- sha256: `4f1ea6f5ba35d7d7f615ed58e8ef4a07aaa1affe8a5e5cd2d22640439def2df2` (hash of the extraction, not of served HTML)
- Quotes: offset 10306 — "Our foundational 300mg daily serving is clinically shown to increase NAD+ levels by over 50% in most individuals."; offset 4374 (image alt text of the Supplement Facts photo) — "The label indicates a serving size of one vegetarian capsule, with 30 servings per container. Each serving provides 300 mg of Niagen."
- Answers: Q-D11-21 (claim → which study? FC-1 tested 1000 mg/day, not 300 mg), Q-D11-12.
- Note: the Supplement Facts panel exists only as an image; the alt text is the brand's description, not the label.

---

## Coverage matrix

| candidate | unstructured-to-entity | harm | disconfirmation | questions |
| --- | --- | --- | --- | --- |
| FC-1 | **yes** | partial (dose caution, disclosure) | — | Q-D11-03, Q-D11-02, Q-D11-08, CQ-PV-04, Q-D11-21, CQ-PV-02, CQ-PV-03 |
| FC-2 | — | — | **yes** | Q-D11-04, Q-D11-05, CQ-PV-05 |
| FC-3 | — | **yes** | — | Q-D11-11, CQ-PV-05, CQ-PV-02 |
| FC-4 | — | supports CQ-PV-04 | — | CQ-ID-04, Q-D11-09, CQ-AX-14, Q-D11-10 |
| FC-5 | — | **yes** | — | Q-D11-12, CQ-PV-04, Q-D11-13, Q-D11-21 |
| FC-6 | — | **yes** | yes (causality disclaimer) | Q-D11-18, CQ-AX-04 |
| FC-7 | — | — | **yes** (status reversal) | Q-D11-14, CQ-PV-02, Q-D11-17 |
| FC-8 | — | — | **yes** (retrospective registration) | Q-D11-06, CQ-PV-05, Q-D11-08, Q-D11-02 |
| FC-9 | — | — | test target | Q-D11-21, Q-D11-12 |
