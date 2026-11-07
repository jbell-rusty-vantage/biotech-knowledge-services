# D11 — ecosystem survey: the bio-medical tooling action space

Agent A8 · research stage (Wave 1) · retrieval date for every source: 2026-10-08 · not medical advice.

Citations are keys `[Sn]` into the source table at the end; each row gives URL · title · retrieval date · how it was fetched. Raw captures (with sha256) are in the D11 scratch `raw/` folder and listed in `_notes/tool-log.md`. Statements about another packet's findings cite that packet's tool log (sibling worktree, read 2026-10-08).

## 0. What this domain is, and the thread used to test it

D11 is not a slice of biology; it is the set of things an agent can *do* to biomedical sources: search, fetch, parse, resolve, verify, compute. The survey asks, per actor: what process produces the artifact, what the artifact contains, whether an agent can capture it as bytes with a hash, whether a span inside it can be re-selected later (the `SourceLocator` contract), which identifiers it emits, and what breaks.

To keep the survey concrete, one longevity thread was followed through every tool: **nicotinamide riboside (NR)** — the trial NCT02921659, its paper (PMID 29599478 · PMCID PMC5876407 · DOI 10.1038/s41467-018-03421-7), the substance (UNII 8XM2XT8VWI / 0I8H2M0L7N), the consumer product (Tru Niagen, DSLD labels, GTIN), its company (CIK 1386570), adverse-event reports, and the brand's claim. Two side threads supply harm and disconfirmation: a **retracted resveratrol paper** (PMID 12003802) and **sirolimus (rapamycin)** labels with a boxed warning; a regulatory reversal on **NMN** supplies the "status changed, earlier document superseded" case.

Headline finding: of 45 tools exercised first-hand (tally of `tooling/action-space.yaml` entries exercised 2026-10-08, regenerated in the adversarial review after the fixtures stage added `publisher-pages`), 17 are agent-ready (readiness 3), 20 are APIs without stable locators or with identity gaps (2), 5 are scrape-only (1) and 3 are blocked (0) (`tooling/action-space.yaml`). The decisive failures are not "no API" but **missing bridges and missing history**: the NCT↔PMID link for the NR trial exists only inside the paper's full text; ClinicalTrials.gov record history is unreachable to every automated client; a branded supplement ingredient row carries its UNII only on a nested form and never states the mass basis; adverse-event and recall records carry free-text product names.

## 1. Actor group: public literature infrastructure

### 1.1 Actors and processes

| actor | process / operation | artifacts | capturable? | agent-ready? |
| --- | --- | --- | --- | --- |
| NLM / NCBI (PubMed, PMC) | indexes citations (MEDLINE), assigns PMIDs, links corrections and retractions, hosts open-access full text | MEDLINE XML record; PMC JATS full text; ID-converter records | yes, by E-utilities and the PMC ID converter without a key; header `X-Ratelimit-Limit: 3` per second [S1][S6] | 3 for records [S3]; full text only for the OA subset |
| EMBL-EBI Europe PMC | mirrors PubMed/PMC, adds text-mined annotations, grants | core metadata JSON, JATS full text, annotation JSON | yes, REST without key [S7][S8][S9] | 3 for JATS (section and paragraph ids) [S8]; annotations 2 (mislinks, below) |
| Crossref (with Retraction Watch data) | DOI registration agency; publishers deposit metadata and "update" relations | work record JSON incl. `license`, `updated-by`, `update-to` | yes, REST with `mailto` [S13][S14][S15] | 3 for integrity links; deposits are optional per publisher |
| OurResearch (OpenAlex, Unpaywall) | aggregates works, authors, institutions; resolves OA copies | work JSON with `ids`, `is_retracted`, `open_access`; OA location JSON | yes, but OpenAlex is metered: `X-RateLimit-Limit-USD: 0.1` per day without key and each list call costs `0.001` USD [S11][S12][S17] | 2 (aggregator, no locators) |
| Allen Institute for AI (Semantic Scholar) | aggregates papers and citations | paper JSON with `externalIds` | with key only; unkeyed call returned 429 [S18] | 2 |
| openRxiv (bioRxiv, medRxiv) | hosts preprints, records the journal DOI when published | preprint JSON with `published_doi`, JATS source URL | yes [S19][S72] | 2; journal link incomplete (PEARL preprint shows `published: "NA"` though a journal version exists) [S70-D3] |
| Publishers (example: American Physiological Society) | publish retraction and correction notices | notice web page | scrape only (Firecrawl) [S16] | 1 |

### 1.2 Artifact interview: the MEDLINE (PubMed XML) record — 2 instances

Instances: PMID 29599478 (NR trial paper) [S3] and PMID 12003802 (retracted resveratrol paper) [S4]; plus the retraction notice record PMID 22833916 [S5].

Fields observed end to end: `MedlineCitation@Status`, `@IndexingMethod`, `PMID@Version`, `DateCompleted`, `DateRevised` (29599478 revised 2024-03-22), `Journal` (ISSN, volume, issue, `PubDate`), `ArticleTitle`, `Pagination`, `ELocationID@EIdType="doi"`, `Abstract/AbstractText`, `AuthorList` with affiliations, `Language`, `PublicationTypeList` with MeSH UIs, `MeshHeadingList`, `ChemicalList`, `CommentsCorrectionsList`, `PubmedData/History`, `ArticleIdList` (pubmed, doi, pmc).

What matters for the action space:
- Integrity links are first-class: 12003802 carries `PublicationType UI="D016441"` "Retracted Publication" and `CommentsCorrections RefType="RetractionIn"` → PMID 22833916; the notice carries the reverse `RetractionOf` [S4][S5].
- The notice record has a title ("Retraction. Pharmacological preconditioning with resveratrol: role of nitric oxide.") but no abstract: the reason exists only on the publisher page [S5][S16].
- No trial registration link on 29599478: an `[si]` search for NCT02921659 returns 0 hits [S2][S3].
- The PubMed MCP connector returns `article_types` including "Retracted Publication" but drops `CommentsCorrections`, so the notice cannot be reached through it [S63]; A3 found it strips superscripts from abstracts [S70-D2].

### 1.3 Artifact interview: JATS full text — 2 instances

Instances: PMC5876407 (Martens et al., NR in middle-aged and older adults) [S8]; PMC6702140 (Elhassan et al., NR in aged muscle) [S10].

Fields observed: `article-meta/article-id` (pmcid, pmcid-ver, pmid, doi, publisher-id), `contrib-group` with ORCID `contrib-id`, `aff`, `pub-date`, `permissions/license` (CC BY), `abstract`, `body/sec@id` (PMC5876407: Sec1–Sec24; PMC6702140: 38 sections with ids like `sec2.1`), `p@id` (PMC5876407: `Par10`, `Par30` …; PMC6702140: 64 paragraph ids), `table-wrap`, `fig`, `ack`, `notes` (competing interests, author contributions), `ref-list` with DOIs and PMIDs, `ext-link@ext-link-type` (`pmc:clinical-trial` for NCT02921659 three times in PMC5876407 and NCT02950441 in PMC6702140; `pmc:entrez-nucleotide`; plain `uri`) [S8][S10].

What matters:
- **Stable section and paragraph ids** make SECTION and TEXT_QUOTE locators re-selectable: the dose sentence lives in `Sec11 / Par30` ("Subjects ingested nicotinamide riboside chloride (NIAGEN®; 500 mg, twice per day; ChromaDex, Inc.) …") and the tolerability sentence in `Sec4 / Par10` [S8].
- **Whitespace is not ASCII**: "500 mg" contains U+2009 (thin space) [S8]; A3 found U+00A0, U+202F and U+2010 in other publishers' JATS [S70-D2]. Quote matching needs a declared normalization.
- **The trial bridge lives here and nowhere else** for this paper: JATS tags NCT02921659; PubMed, Crossref and the registry record do not link the two [S2][S13][S20].
- **Disclosures disagree inside one artifact**: the acknowledgement says "Study pills, NR standards for metabolite analyses and partial funding support were provided by ChromaDex, Inc." while the competing-interests note says "The authors declare no competing interests." [S8]; Crossref has no `funder` field at all [S13]; Europe PMC lists three NIH grants, one of which (P30 DK048520) the acknowledgement does not name [S7][S8].

### 1.4 Artifact interview: Crossref work record — 2 instances (+ notice)

Instances: 10.1038/s41467-018-03421-7 [S13]; 10.1152/ajpheart.01012.2001 [S14]; notice 10.1152/ajpheart.zh4-0450-retr.2012 [S15].

Fields: `DOI`, `URL`, `title`, `container-title`, `ISSN`/`issn-type`, `publisher`, `member`, `prefix`, `type`, `created`/`deposited`/`indexed`/`issued`/`published`, `author` (with ORCID when deposited), `license[]` (`content-version` tdm/vor, start date, URL), `link[]`, `reference[]`, `is-referenced-by-count`, `relation`, `update-policy`, `assertion[]`, and on the retracted paper `updated-by[]` = {DOI of notice, `type: retraction`, `label: Retraction`, `source: retraction-watch`, `updated` 2012-06-01, `record-id: 54`} [S14]; the notice carries the mirror `update-to[]` [S15].

What matters: Crossref is the cheapest integrity authority (one GET per DOI) and names its data source (Retraction Watch), but whether funders, trial numbers or abstracts appear depends on the publisher's deposit (the NR paper has no funder and no clinical-trial-number deposit; an abstract is deposited, re-checked 2026-10-08, tool-log row 51) [S13].

### 1.5 Artifact: text-mined annotations (Europe PMC) — 341 instances in one article

Each annotation has `prefix`, `exact`, `postfix`, `section`, `type` (Chemicals, Gene_Proteins, Diseases, Accession Numbers …), `provider`, `tags[] {name, uri}` [S9]. The shape is a W3C TextQuoteSelector, i.e. locator-compatible. The content is not evidence: "nicotinamide riboside" in the title is tagged `CHEBI_80498` "dihydrozeatin riboside", and "nicotinamide" is tagged RxNorm 7405 "Niacinamide"; the postfix of one annotation repeats part of the exact string [S9]. Accession-number annotations are correct (three `NCT02921659`, subType NCT) [S9]. Position for the model: annotations are candidate `MENTIONS` with a method version, never `HAS_IDENTIFIER` assertions (00-DIRECTIVE 3.8).

## 2. Actor group: trial registries

| actor | process | artifacts | capturable? | readiness |
| --- | --- | --- | --- | --- |
| NLM ClinicalTrials.gov | sponsors register and update; NLM QC; daily data refresh (`dataTimestamp` 2026-10-08T09:00:05, API 2.0.5) [S21] | study JSON (protocolSection, derivedSection, resultsSection) [S20][S26] | yes, v2 API without key | 3 for the current version |
| same, record history | the website's history tab is fed by `/api/int/studies/{nct}/history` | per-version records | **no**: 403 to curl with plain and browser user agents [S22]; Firecrawl's browser renders "Error \| ClinicalTrials.gov" with an embedded 403 [S23]; A4 reproduced it with five tools and three proxy modes [S70-D3] | 0 |
| WHO ICTRP | aggregates registries, computes flags | HTML record page | curl worked once [S24], a second record timed out after 60 s (tool log row) | 1 |
| EMA CTIS | EU clinical trial applications and decisions | search JSON (portal backend) | POST without key worked [S25] | 2 |

### 2.1 Artifact interview: ClinicalTrials.gov v2 study record — 2 instances

Instances: NCT02921659 (NR, Colorado) [S20]; NCT04488601 (PEARL, rapamycin) [S26].

Fields: `identificationModule` (nctId, orgStudyIdInfo, organization, briefTitle, officialTitle), `statusModule` (statusVerifiedDate, overallStatus, startDateStruct, primaryCompletionDateStruct with type ACTUAL/ESTIMATED, studyFirstSubmitDate, studyFirstSubmitQcDate, studyFirstPostDateStruct, lastUpdateSubmitDate, lastUpdatePostDateStruct), `sponsorCollaboratorsModule` (leadSponsor with class, collaborators), `oversightModule`, `descriptionModule`, `conditionsModule`, `designModule`, `armsInterventionsModule` (interventions with type DIETARY_SUPPLEMENT and names such as "Niagen™"), `outcomesModule`, `eligibilityModule`, `contactsLocationsModule`, `referencesModule`, `ipdSharingStatementModule`, `derivedSection`, `hasResults` [S20][S26].

What matters:
- **Both trials were registered after they started**: NCT02921659 start 2015-04, first submitted 2016-09-29, completed 2016-10 [S20]; NCT04488601 start 2020-01-01 (ACTUAL), first submitted 2020-07-13 [S26]. ICTRP states it outright for the first: "Prospective Registration: No" [S24]. The Clinical Trials MCP connector does not return `studyFirstSubmitDate`, so an agent using only the connector cannot see this [S64].
- **No publication back-links**: NCT02921659 `referencesModule` holds only a laboratory URL [S20]; NCT04488601 has no references and `hasResults: false` [S26] although A5/A7 resolved its journal paper (PMID 40188830) [S70-D5].
- Locators are JSON pointers into the record; there are no text offsets to speak of.

### 2.2 Artifact: WHO ICTRP record — 1 instance captured (second timed out)

Fields on the page (NCT02921659): Main ID, Date of registration (29/09/2016), Prospective Registration (No, `span#DataList3_ctl01_Label1`), Primary sponsor, Public title, Secondary ID(s) (14-0475), Source(s) of Monetary Support ("Please refer to primary and secondary sponsors"), Secondary Sponsor(s) (ChromaDex, Inc.), "Last refreshed on: 12 December 2016" [S24]. The mirror is eight years stale for this record, so ICTRP is useful for its computed flag and cross-registry ids, not for current status.

## 3. Actor group: substance, terminology and code authorities

| actor | process | artifacts | readiness |
| --- | --- | --- | --- |
| FDA / NCATS GSRS | registers substances, assigns UNII, curates codes and relationships | substance JSON (view=full) | 3 [S28][S29] |
| NCBI PubChem | aggregates depositor records into compounds (CID) | compound properties, synonyms, xrefs | 3; UNII/CAS only as untyped synonyms [S27] |
| CAS | CAS Registry Numbers | Common Chemistry API | 0: 401 without key [S30] |
| EMBL-EBI ChEBI / OLS | ontology terms | term JSON | 3 [S31] |
| NLM RxNorm | drug concepts, cross-links | RxCUI properties incl. UNII | 3 [S32] |
| UniProt | protein records | entry JSON | 3 [S69] |
| Regenstrief (LOINC, UCUM) | lab and document codes, units | FHIR terminology (account) / NLM Clinical Tables mirror | 2; FHIR route redirects to an account login [S54]; mirror works [S52][S53] |
| CMS / CDC (ICD-10-CM/PCS) | diagnosis and procedure codes, yearly | code records | 3 via MCP [S67] |

### 3.1 Artifact interview: GSRS substance record — 2 instances

Instances: UNII 8XM2XT8VWI "NICOTINAMIDE RIBOSIDE CHLORIDE" (version 18) [S28]; UNII 0I8H2M0L7N "NICOTINAMIDE RIBOSIDE" (version 24) [S29].

Fields: `uuid`, `approvalID` (the UNII), `_name`, `substanceClass`, `status`, `version`, `created`/`lastEdited` (epoch ms), `definitionType`, `definitionLevel`, `names[]` (incl. "EH-301 COMPONENT NICOTINAMIDE RIBOSIDE CHLORIDE", "Nicotinamide riboside chloride [WHO-DD]"), `codes[] {codeSystem, code, type, url}`, `structure {formula, smiles, _inchiKey, stereochemistry, mwt, …}`, `moieties[]`, `relationships[] {type, relatedSubstance.approvalID}`, `references[] {docType, citation}`, `properties`, `notes`, `tags`, `access` [S28][S29].

What matters:
- Codes on the salt: CAS 23111-00-4, PubChem 90480033, NCIt C219230, GRAS notification 635 [S28]. Codes on the moiety: CAS 1341-23-7, PubChem 439924, ChEBI 15927, DrugBank DB14933, two FDA orphan-drug designation numbers, EPA CompTox DTXSID501010039; InChIKey JLEBZPBDRKPWTD-TURQNECASA-O [S29].
- The salt record names its active moiety: `ACTIVE MOIETY` → 0I8H2M0L7N and `PARENT->SALT/SOLVATE` → 0I8H2M0L7N [S28]. This is the only authority route found that supplies the salt→moiety relation (and both structures) needed to convert an amount between bases; whether a label states its amount on the salt or the moiety basis is not recorded anywhere examined.

### 3.2 Artifact interview: PubChem compound — 2 instances

CID 439924 (formula C11H15N2O5+, InChIKey JLEBZPBDRKPWTD-TURQNECASA-O) and CID 90480033 (C11H15ClN2O5, YABIFCKURFRPPO-IVOJBTPCSA-N) [S27]. Fields used: property table (MolecularFormula, InChIKey, IUPACName; `CanonicalSMILES` was requested and came back as `ConnectivitySMILES`), synonyms (68 and 43 strings, including "UNII-0I8H2M0L7N" and "23111-00-4"), xrefs RegistryID (106 and 89 strings) [S27]. Name lookup "nicotinamide riboside" resolves to the cation CID, not to the chloride that trials administer [S27][S8].

## 4. Actor group: regulators and public safety and label databases

| actor | process | artifacts | readiness |
| --- | --- | --- | --- |
| FDA (labels via SPL, published by NLM DailyMed) | labelers submit SPL; DailyMed publishes versions | SPL XML with LOINC-coded sections, version history JSON | 3 [S40][S41][S42][S43] |
| FDA openFDA | harmonizes FDA datasets into JSON APIs | drug/label, food/event (CAERS), food/enforcement | 2 [S37][S38][S39] |
| FDA dockets on regulations.gov | public display of NDI notifications, petitions, responses | document metadata (API), attachment PDFs | 2 for metadata [S44]; 1 for PDFs (curl 403, Firecrawl ok) [S45]; scanned PDFs need OCR [S46] |
| FDA web (warning letters, ingredient pages) | publishes letters and positions as HTML | pages with client-side tables | 1 [S68] |
| NIH ODS (DSLD) | transcribes supplement labels | label JSON + label PDF/image | 2 [S33][S34][S35] |
| USDA ARS (FoodData Central) | food composition, branded foods | food JSON | 0 today (DEMO_KEY exhausted, 429) [S36]; 3 with a key (A2 used it earlier) [S70-D12] |
| NLM AccessGUDID | device identifiers | device JSON with version | 3 [S55] |

### 4.1 Artifact interview: SPL (structured product label) — 2 instances

Instances: sirolimus oral solution, set id 19880f51-badb-4846-a02a-592a210690ab, version 11, `effectiveTime` 20240430 [S42]; sirolimus set id 09f24e7a-0bea-4e02-b557-c60eb842d41a, version 1, `effectiveTime` 20250630 [S43].

Fields: `setId`, `versionNumber`, `effectiveTime`, document `title` (highlights), `section@ID` (e.g. `LINK_b7e90274-8447-41bf-8803-c34d58d232cd`), section `code` with LOINC code system 2.16.840.1.113883.6.1 (34066-1 BOXED WARNING SECTION, 34067-9 INDICATIONS & USAGE, 34068-7 DOSAGE & ADMINISTRATION, 34070-3 CONTRAINDICATIONS, 34073-7 DRUG INTERACTIONS, 43685-7 WARNINGS AND PRECAUTIONS, 51945-4 PACKAGE LABEL.PRINCIPAL DISPLAY PANEL, and 22 more), `title`, `text` (paragraphs, lists, tables), `manufacturedProduct` [S42].

What matters:
- The boxed warning is a coded section with a stable id: title "WARNING: IMMUNOSUPPRESSION, USE IS NOT RECOMMENDED IN LIVER OR LUNG TRANSPLANT PATIENTS" [S42].
- Version history is an API: 10 published versions of set 19880f51 (1–7, 9–11; no v8 — the history itself shows the gap, which matters for Q-D11-12-style version diffs) with publication dates; version 11 is dated "Jan 14, 2026" by DailyMed while its `effectiveTime` is 2024-04-30 [S41][S42]. Valid time and publication time differ.
- openFDA serves the same labels with sections flattened into strings (`boxed_warning`, `dosage_and_administration` …) and loses section ids and LOINC codes [S38]; it is a search index, not the capture.
- "The sirolimus label" is not one thing: DailyMed lists 28 SPLs for sirolimus across labelers [S40].

### 4.2 Artifact interview: DSLD label — 2 instances (versions of one product)

Instances: label 323170 "Tru Niagen 300 mg" (entered 2025-04-24) [S34] and label 295562 "Tru Niagen 300 mg" (entered 2023-05-24) [S35].

Fields: `id`, `src`, `fullName`, `brandName`, `brandIpSymbol`, `upcSku`, `productVersionCode`, `bundleName`, `nhanesId`, `entryDate`, `offMarket`, `events[]`, `physicalState` (LanguaL), `productType` (LanguaL), `claims[]` (LanguaL), `servingSizes[]` (min/max quantity, min/max daily servings, unit, `inSFB`), `servingsPerContainer`, `netContents[]`, `ingredientRows[] {ingredientId, name, ingredientGroup, category, quantity[] {operator, quantity, unit, dailyValueTargetGroup}, forms, alternateNames, uniiCode, nestedRows}`, `otheringredients`, `statements[] {type, notes}`, `contacts[]`, `labelRelationships[] {type, labelId}`, `targetGroups`, `userGroups`, `percentDvFootnote`, `pdf`, `thumbnail`, `hasOuterCarton` [S34][S35].

What matters:
- Same GTIN on both versions: `upcSku` "8 50015 31111 6" [S34][S35] (normalizes to 00850015311116, check digit valid; computed in this stage).
- The directions changed: 295562 "Suggested use: Adults take one capsule daily or as recommended by your healthcare professional." [S35]; 323170 "Suggested use: Adults take one capsule 1-3 times daily as needed or as recommended by your healthcare professional." [S34]. Maximum daily servings went from 1 to 3 in `servingSizes` [S34][S35].
- Seals changed: 295562 lists "NSF … Certified Sport"; 323170 lists "Alkemist Assured" [S34][S35].
- The NR row is the branded ingredient: `name` "Niagen", `ingredientGroup` "Vitamin B3 (Nicotinamide riboside)", 300 mg per capsule, row-level `uniiCode` null; its nested `forms[0]` is "Nicotinamide Riboside Chloride" with `uniiCode` "8XM2XT8VWI" (group "Niacin") [S34][S35]. The form is identified, but nothing says whether the 300 mg is stated on the chloride salt or on NR (moiety) basis.
- DSLD links versions: "Image difference, same product" and "Package size difference, same product" [S34].

### 4.3 Artifact interview: openFDA CAERS adverse-event report — 3 instances

Reports 2020-CFS-007354, 2020-CFS-003767, 2023-CFS-001304 (34 reports match brand "niagen") [S37]. Fields: `report_number`, `date_created`, `date_started`, `outcomes[]`, `reactions[]` (MedDRA preferred terms), `consumer {age, age_unit, gender}`, `products[] {role SUSPECT/CONCOMITANT, name_brand, industry_code, industry_name}` [S37]. The brand is free text ("CHROMADEX TRU NIAGEN", "TRU NIAGEN"); there is no GTIN, lot or UNII; `meta.last_updated` is 2026-07-07 [S37]. The response carries its own disclaimer: "Submission of an adverse event report does not constitute an admission that a product caused or contributed to an event." [S37].

### 4.4 Artifact interview: openFDA food enforcement (recall) record — 3 instances

H-1135-2026, H-1134-2026, H-0483-2026 [S39]. Fields: `recall_number`, `event_id`, `status`, `classification`, `recalling_firm`, `product_description` (free text, includes "UPC: …"), `reason_for_recall`, `code_info` (lots, expiry), `report_date`, `recall_initiation_date`, `openfda` (empty for food) [S39]. One record's "UPC: PHF-C023" is not a GTIN; another's "UPC:7 38654 00033 5" is a valid UPC-A (check digit verified in this stage) [S39].

### 4.5 Artifact interview: FDA NDI response letter (regulations.gov) — 2 instances

FDA-2022-S-0023-0069 "NDI 1259 - Reinstatement Response Letter from FDA HFP to Inner Mongolia Kingdomway Pharmaceutical Limited regarding NDI 1259 - B-Nicotinamide Mononucleotide (NMN)", posted 2025-12-09 [S44]; its PDF text (via Firecrawl) says FDA "responded to the petition and explained that the agency has reconsidered and changed its interpretation" and that "This communication effectively supersedes our October 11,2022 and November 4,2022 responses to NDIN 1259" [S45]. The extraction lost the Greek letter in the ingredient name ("“-nicotinamide mononucleotide”") [S45]. The sibling document FDA-2022-S-0023-0068 is an image-only PDF: Firecrawl returned only `[Image: ImagePart_4580]` placeholders [S46]. Metadata fields from the API: `agencyId`, `docketId`, `documentType`, `subtype` ("75 Day PreMarket Notification"), `postedDate`, `receiveDate`, `modifyDate`, `title`, `trackingNbr`, `objectId` [S44].

## 5. Actor group: corporate and professional registries

| actor | process | artifacts | readiness |
| --- | --- | --- | --- |
| U.S. SEC EDGAR | filers submit forms; SEC publishes indexes | submissions JSON, company-tickers JSON, filings | 3 with a declared User-Agent; 403 without it [S47][S48] |
| GLEIF | LEI issuance and renewal through local units | LEI record JSON | 3 API; data can be stale [S50] |
| CMS NPPES | providers self-register NPIs | NPI record | 3 by number via MCP; name search returns homonyms [S66] |
| OpenCorporates, Companies House | company registries | company JSON | 0 without keys (A6) [S70-D7] |

### 5.1 Artifact interview: EDGAR submissions — 2 instances

CIK 1386570 "Niagen Bioscience, Inc." (ticker NAGE, SIC 2833 "Medicinal Chemicals & Botanical Products", former name "ChromaDex Corp." until 2025-03-10, `lei` null) [S48]; CIK 1721484 "Longeveron Inc." (ticker LGVN, "Pharmaceutical Preparations", former name "LONGEVERON LLC" until 2021-02-10, `lei` null) [S49]. Fields: `cik`, `entityType`, `sic`, `sicDescription`, `name`, `tickers`, `exchanges`, `ein`, `lei`, `formerNames[] {name, from, to}`, `addresses`, `filings.recent {accessionNumber, filingDate, reportDate, acceptanceDateTime, form, items, primaryDocument, isXBRL, isInlineXBRL, size}` [S48][S49]. 8-K `items` codes (e.g. "2.02,7.01,9.01") classify events without reading the filing [S48].

### 5.2 Artifact interview: GLEIF LEI record — 1 instance found (second company has none)

LEI 529900OPI7B8JPXCVS70: legal name "Chromadex Corporation", jurisdiction US-DE, registeredAs 4564086 at RA000602, entity status ACTIVE, registration status LAPSED, last update 2021-07-19, next renewal 2019-12-18, corroboration FULLY_CORROBORATED [S50]. No LEI exists under "Niagen Bioscience" [S50] and none was found for Longeveron [S51]. EDGAR leaves `lei` null for both [S48][S49]: CIK↔LEI is a name-match hypothesis, never an authority bridge.

## 6. Actor group: commerce and brand sites

The brand page is where consumer claims are made and where the label image lives. Tru Niagen's 300 mg page (Tavily extract, 35,789 characters) states "Our foundational 300mg daily serving is clinically shown to increase NAD+ levels by over 50% in most individuals." and shows the Supplement Facts panel only as an image whose alt text ends "… The label indicates a serving size of one vegetarian capsule, with 30 servings per container. Each serving provides 300 mg of Niagen." [S56] (tail of a longer alt text that begins "A person holding a Tru Niagen bottle, showing the Supplement Facts panel …"; verifiable only in the Tavily capture, scratch `ft/D11/raw/tvly-extract-truniagen.md`, sha256 `4f1ea6f5…2df2`; the alt text depends on the selected variant, 30-ct: the live page now opens on the 180-ct image and Firecrawl resolves the URL to `?variant=41905353883717`; the claim sentence is confirmed verbatim on the live page). No GTIN, price or structured label appears in the extracted text [S56]; A6 found Shopify storefront JSON (`products/<handle>.js`) exposes barcodes [S70-D6]. Readiness 1 for claims and labels from brand pages; the claim is a `ClaimOccurrence` candidate that D10's evidence-mission loop would test against PMC5876407 (whose study dose was 1000 mg per day, and whose discussion says "the dose tested in the present study exceeds the label-recommended dose and should be considered investigational") [S8].

## 7. Actor group: the AI tooling layer (search providers, MCP connectors, community servers)

| actor | role | observed behaviour | readiness |
| --- | --- | --- | --- |
| Anthropic connectors (claude.ai) | hosted MCP connectors for life sciences: "Benchling, 10x Genomics, PubMed, BioRender, Synapse.org, and Wiley Scholar Gateway", later ClinicalTrials.gov, bioRxiv & medRxiv, Open Targets, ChEMBL, ICD-10, NPI and others [S57] | normalized renditions: PubMed drops CommentsCorrections [S63]; Clinical Trials drops submission dates [S64]; research index has no retraction flag and truncates abstracts [S65] | 2 (discovery) |
| Tavily | web search and extraction | worked once output went to a file; Windows console crash `UnicodeEncodeError` on non-cp1252 characters (also A2, A7) [tool log row 40][S70-D13] | 2 |
| Firecrawl | scrape (HTML, PDF), research index, monitors | fetched a regulations.gov PDF and a publisher notice that curl could not [S45][S16]; could not fetch CT.gov history [S23]; refuses Reddit [S70-D1] | 2 |
| Exa | semantic web search | found community MCP servers and write-ups [S58][S59][S60][S61] | 2 |
| Community MCP servers | wrappers over E-utilities, CT.gov, openFDA, DailyMed | e.g. "PubCrawl" registers "12 MCP tools across three domains" over NCBI, PMC, DailyMed, openFDA, eMC, CT.gov [S58]; "mcp-pubmed-evidence" adds provenance metadata and "map_trial_to_publications … when PMIDs are available in ClinicalTrials.gov references" [S59]; "mcp-clinical-evidence" aggregates PubMed, CT.gov, openFDA "for medical necessity arguments in insurance litigation" [S60] | not scored (third-party) |

The pattern across first-party and community tooling is consistent: teams wrap the same five public APIs and add search ergonomics; none of the wrappers examined returns captured bytes, content hashes or re-selectable locators, and the one that maps trials to publications depends on the registry's references field [S59], which is empty for both trials examined here [S20][S26]. A Valyu write-up states the cross-source problem plainly: results "don’t share any common identifiers" [S61]. The BellLabs capability-layer checkpoint reached the same conclusion for trials ("Why this layer must be custom") [S71].

## 8. The four lenses

**Science.** The evidence chain depends on three capabilities that the public infrastructure does not provide uniformly: integrity status (Crossref + PubMed give it; discovery tools do not) [S14][S4][S65]; registry history (blocked) [S22][S23]; and trial↔publication bridges (in full text only for the NR trial) [S8][S2][S20]. Text-mined entity links are noisy enough to be harmful if admitted as identity [S9].

**Economics.** Most authorities are free but increasingly metered or keyed: OpenAlex charges per call against a 0.1 USD daily allowance without a key [S11]; CAS Common Chemistry, LOINC FHIR, USPTO, FDA Data Dashboard, Altmetric and OpenCorporates require keys or accounts [S30][S54][S70-D8][S70-D9][S70-D7]; USDA FDC's shared DEMO_KEY is exhausted by a team on one IP [S36]. Licensed-out sources (DrugBank, Natural Medicines, KEGG commercial use, Crunchbase) stay identifiers-only. For investors the cheap, agent-ready layer is EDGAR (with identity) plus GLEIF, but the two do not bridge [S48][S50].

**Community.** Community and consumer-facing sources (Reddit, brand pages, community MCP servers) are the least agent-ready: Reddit is blocked without OAuth [S70-D1][S70-D9]; brand pages hide labels in images [S56]; community MCP servers are convenience wrappers without provenance [S58][S59][S60].

**AI.** Agents need tools whose outputs are capture-grade: bytes + hash + locator + identifiers. The hosted connectors are discovery-grade [S63][S64][S65]. The minimum agent action families that must be built or wrapped (see `tooling/action-space.yaml` gaps G1–G9): `literature.get_record` / `literature.check_integrity`, `trials.get_record` / `trials.observe_versions`, `substances.resolve` (form-aware), `labels.get_spl` / `labels.get_dsld` with a Supplement Facts parser, `identifiers.normalize` (GTIN, CAS, LEI, NPI check digits), `units.normalize`, and change-tracked `web.capture`.

## 9. What this means for the kernel (handed to research-notes)

- Source kinds that are real: registry record (JSON), bibliographic record (XML), full-text article (JATS), label (SPL XML; DSLD JSON + PDF), regulatory letter (PDF, sometimes scanned), filing (HTML/iXBRL), web page (HTML, JS-rendered), aggregator record (openFDA, OpenAlex), annotation set.
- Locator kinds that are real: TEXT_QUOTE (with declared whitespace normalization), SECTION carrying an XML id or JSON pointer, PDF_PAGE, IMAGE_REGION (label images), WHOLE_SNAPSHOT. MEDIA_TIME is D9's.
- Identifier schemes that are real and their bridges: `identifier-bridges.yaml` (33 schemes, 22 bridges, 7 recorded non-bridges).

## Sources

All retrieved 2026-10-08. "curl" = direct HTTP by the D11 helper; capture file names are in the scratch `raw/` folder.

| key | URL | title | how |
| --- | --- | --- | --- |
| S1 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=nicotinamide+riboside+AND+Martens+CR%5Bau%5D&retmode=json | PubMed ESearch result (8 PMIDs) | curl |
| S2 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=NCT02921659%5Bsi%5D&retmode=json | PubMed ESearch result (0 hits) | curl |
| S3 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=29599478&retmode=xml | Chronic nicotinamide riboside supplementation is well-tolerated and elevates NAD+ in healthy middle-aged and older adults (PubMed record) | curl |
| S4 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=12003802&retmode=xml | Pharmacological preconditioning with resveratrol: role of nitric oxide (PubMed record) | curl |
| S5 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=22833916&retmode=xml | Retraction. Pharmacological preconditioning with resveratrol: role of nitric oxide (PubMed record) | curl |
| S6 | https://pmc.ncbi.nlm.nih.gov/tools/idconv/api/v1/articles/?ids=29599478&format=json | PMC ID Converter response | curl |
| S7 | https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:29599478%20AND%20SRC:MED&resultType=core&format=json | Europe PMC core record for MED/29599478 | curl |
| S8 | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5876407/fullTextXML | Chronic nicotinamide riboside supplementation … (JATS full text) | curl |
| S9 | https://www.ebi.ac.uk/europepmc/annotations_api/annotationsByArticleIds?articleIds=PMC:5876407&format=JSON | Europe PMC annotations for PMC5876407 | curl |
| S10 | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6702140/fullTextXML | Nicotinamide Riboside Augments the Aged Human Skeletal Muscle NAD+ Metabolome and Induces Transcriptomic and Anti-inflammatory Signatures (JATS full text) | curl |
| S11 | https://api.openalex.org/works/doi:10.1038/s41467-018-03421-7 | OpenAlex work W2795014519 | curl |
| S12 | https://api.openalex.org/works?filter=is_retracted:true,title.search:resveratrol | OpenAlex works list (132 retracted) | curl |
| S13 | https://api.crossref.org/works/10.1038/s41467-018-03421-7 | Crossref work record | curl |
| S14 | https://api.crossref.org/works/10.1152/ajpheart.01012.2001 | Crossref work record (updated-by retraction) | curl |
| S15 | https://api.crossref.org/works/10.1152/ajpheart.zh4-0450-retr.2012 | Crossref work record "Retraction" | curl |
| S16 | https://journals.physiology.org/doi/10.1152/ajpheart.zh4-0450-retr.2012 | Retraction (Am J Physiol Heart Circ Physiol 302: H2446) | Firecrawl CLI |
| S17 | https://api.unpaywall.org/v2/10.1038/s41467-018-03421-7 | Unpaywall record | curl |
| S18 | https://api.semanticscholar.org/graph/v1/paper/PMID:29599478 | Semantic Scholar paper record | curl (with and without key) |
| S19 | https://api.biorxiv.org/pubs/biorxiv/10.1101/680462 | bioRxiv published-article link | curl |
| S20 | https://clinicaltrials.gov/api/v2/studies/NCT02921659 | Safety & Efficacy of Nicotinamide Riboside Supplementation for Improving Physiological Function in Middle-Aged and Older Adults | curl |
| S21 | https://clinicaltrials.gov/api/v2/version | ClinicalTrials.gov API version | curl |
| S22 | https://clinicaltrials.gov/api/int/studies/NCT02921659/history | 403 Forbidden | curl |
| S23 | https://clinicaltrials.gov/study/NCT02921659?tab=history | Error \| ClinicalTrials.gov | Firecrawl CLI + MCP |
| S24 | https://trialsearch.who.int/Trial2.aspx?TrialID=NCT02921659 | ICTRP trial record NCT02921659 | curl |
| S25 | https://euclinicaltrials.eu/ctis-public-api/search | CTIS public search (rapamycin) | curl POST |
| S26 | https://clinicaltrials.gov/api/v2/studies/NCT04488601 | Participatory Evaluation (of) Aging (With) Rapamycin (for) Longevity Study | curl |
| S27 | https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/439924,90480033/property/MolecularFormula,InChIKey,IUPACName,CanonicalSMILES/JSON (and /name/…/cids, /cid/…/synonyms, /xrefs/RegistryID) | PubChem PUG REST responses | curl |
| S28 | https://precision.fda.gov/ginas/app/api/v1/substances(8XM2XT8VWI)?view=full | GSRS substance NICOTINAMIDE RIBOSIDE CHLORIDE | curl |
| S29 | https://precision.fda.gov/ginas/app/api/v1/substances(0I8H2M0L7N)?view=full | GSRS substance NICOTINAMIDE RIBOSIDE | curl |
| S30 | https://commonchemistry.cas.org/api/detail?cas_rn=23111-00-4 | {"message":"Unauthorized"} | curl |
| S31 | https://www.ebi.ac.uk/ols4/api/search?q=nicotinamide%20riboside&ontology=chebi | OLS4 search response | curl |
| S32 | https://rxnav.nlm.nih.gov/REST/rxcui.json?name=sirolimus ; …/rxcui/35302/property.json?propName=UNII_CODE | RxNav responses | curl |
| S33 | https://api.ods.od.nih.gov/dsld/v9/search-filter?q=%22Tru%20Niagen%22 | DSLD search (9 labels) | curl |
| S34 | https://api.ods.od.nih.gov/dsld/v9/label/323170 | DSLD label Tru Niagen 300 mg (323170) | curl |
| S35 | https://api.ods.od.nih.gov/dsld/v9/label/295562 | DSLD label Tru Niagen 300 mg (295562) | curl |
| S36 | https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=… | OVER_RATE_LIMIT (429) | curl |
| S37 | https://api.fda.gov/food/event.json?search=products.name_brand:%22niagen%22&limit=5 | openFDA CAERS (34 reports) | curl |
| S38 | https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22sirolimus%22&limit=3 | openFDA drug labels (22) | curl |
| S39 | https://api.fda.gov/food/enforcement.json?search=product_description:%22dietary+supplement%22+AND+reason_for_recall:%22undeclared%22&limit=5&sort=report_date:desc | openFDA food enforcement (87) | curl |
| S40 | https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=sirolimus | DailyMed SPL list (28) | curl |
| S41 | https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/19880f51-badb-4846-a02a-592a210690ab/history.json | SIROLIMUS SOLUTION [VISTAPHARM, LLC] — history | curl |
| S42 | https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/19880f51-badb-4846-a02a-592a210690ab.xml | SPL sirolimus oral solution v11 | curl |
| S43 | https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/09f24e7a-0bea-4e02-b557-c60eb842d41a.xml | SPL sirolimus v1 | curl |
| S44 | https://api.regulations.gov/v4/documents/FDA-2022-S-0023-0069 | NDI 1259 - Reinstatement Response Letter … (metadata) | curl (DEMO_KEY) |
| S45 | https://downloads.regulations.gov/FDA-2022-S-0023-0069/attachment_1.pdf | NDI 1259 reinstatement letter (PDF) | Firecrawl CLI (curl 403) |
| S46 | https://downloads.regulations.gov/FDA-2022-S-0023-0068/attachment_1.pdf | NDI 1259 letter (image-only PDF) | Firecrawl CLI |
| S47 | https://www.sec.gov/files/company_tickers.json | SEC company tickers | curl (identity UA; 403 without) |
| S48 | https://data.sec.gov/submissions/CIK0001386570.json | EDGAR submissions Niagen Bioscience, Inc. | curl |
| S49 | https://data.sec.gov/submissions/CIK0001721484.json | EDGAR submissions Longeveron Inc. | curl |
| S50 | https://api.gleif.org/api/v1/lei-records/529900OPI7B8JPXCVS70 (and filter / fuzzycompletions queries) | GLEIF LEI record Chromadex Corporation | curl |
| S51 | https://api.gleif.org/api/v1/fuzzycompletions?field=entity.legalName&q=Longeveron | GLEIF fuzzy completions (empty) | curl |
| S52 | https://clinicaltables.nlm.nih.gov/api/loinc_items/v3/search?terms=ferritin | NLM Clinical Tables LOINC search | curl |
| S53 | https://clinicaltables.nlm.nih.gov/api/ucum/v3/search?terms=ng/mL | NLM Clinical Tables UCUM search | curl |
| S54 | https://fhir.loinc.org/CodeSystem/$lookup?system=http://loinc.org&code=2276-4 | auth.loinc.org login page | curl |
| S55 | https://accessgudid.nlm.nih.gov/api/v3/devices/lookup.json?di=08717648200274 | AccessGUDID device record | curl |
| S56 | https://www.truniagen.com/products/tru-niagen-300mg | Tru Niagen® 300mg \| Boost NAD+ Levels By Over 50% | Tavily CLI extract |
| S57 | https://www.anthropic.com/news/healthcare-life-sciences | Advancing Claude in healthcare and the life sciences | Tavily CLI extract |
| S58 | https://nickjlamb.github.io/pubcrawl/ | PubCrawl — Code Wiki | Exa MCP (highlights) |
| S59 | https://github.com/Tianyu-Qu/mcp-pubmed-evidence | Tianyu-Qu/mcp-pubmed-evidence | Exa MCP (highlights) |
| S60 | https://github.com/alexandriashai/mcp-clinical-evidence | alexandriashai/mcp-clinical-evidence | Exa MCP (highlights) |
| S61 | https://medium.com/@unicodeveloper/lessons-from-building-ai-agents-for-biomedical-research-850c36147e14 | Lessons from Building AI Agents for Biomedical Research. | Exa MCP (highlights; secondary) |
| S62 | https://www.nutritionaloutlook.com/view/fda-responds-to-citizen-petitions-on-nmn-amending-its-position-on-the-ingredient-s-status-as-a-dietary-ingredient (and 4 other secondary results) | FDA responds to citizen petitions on NMN … | Tavily search (used only to find S44–S46) |
| S63 | PubMed MCP `get_article_metadata` PMID 12003802 | tool response | claude.ai PubMed connector |
| S64 | Clinical Trials MCP `get_trial_details` NCT02921659 | tool response | claude.ai Clinical Trials connector |
| S65 | Firecrawl MCP `firecrawl_research_inspect_paper` pmid:12003802, pmid:29599478 | tool response | claude.ai Firecrawl connector |
| S66 | NPI Registry MCP `npi_search` (exact name of a public figure; results not stored) | tool response | claude.ai NPI connector |
| S67 | ICD-10 MCP `search_codes` "aging"; `lookup_code` R54 as_of 2016-10-01 | tool response | claude.ai ICD-10 connector |
| S68 | https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/compliance-actions-and-activities/warning-letters | Warning Letters \| FDA | curl |
| S69 | https://rest.uniprot.org/uniprotkb/search?query=gene:NAMPT+AND+organism_id:9606+AND+reviewed:true | UniProt search (P43490) | curl |
| S70 | sibling packet tool logs, read 2026-10-08: D1/D12 (A2) `biotech-knowledge-services-A2/schema/program/packets/D1|D12/_notes/tool-log.md`; D2 (A3); D3 (A4); D5 (A5); D6/D7 (A6); D8/D13 (A7); D9 (A8); D10 (A1) | internal tool logs (cited as S70-Dn) | file read |
| S71 | biotech-meta/docs/checkpoints/agent-capability-layers/2026-07-19-biotech-research-agent-capability-layers.md | Biotech Research Agent Capability Layers | file read |
| S72 | bioRxiv MCP `get_preprint` 10.1101/680462 | tool response | claude.ai bioRxiv connector |
