---
id: "vocab:capture-methods"
kind: "vocabulary"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/capture-methods.yaml"]
aliases: ["capture-methods","capture methods"]
capabilities: ["get"]
cardDigest: "sha256:aeb53e5d22860a63d931fd38e75158484424283389120b4b5a758b7df5a23025"
---
# Vocabulary capture-methods

Release vocabulary `vocabularies/capture-methods.yaml` (sha256 `8d25f04fb302a65d…`).

- **format**: bks-capture-methods.v1
- **releaseId**: biotech-schema-v2.0.0
- **decision**: FU-06 (R-39): a captureMethod is '<registry id>/<version> <free-text human description>'; the id is one of these entries; ambiguous historical values stay errors until adapter evidence names the tool.
- **source**: tooling/action-space.yaml (registry biotech-action-space, version 2)

### entries (167)

| id | class | provider | kind |
| --- | --- | --- | --- |
| ai-answer-engines | external | AI answer engines (Consensus, Elicit result pages) | search, fetch |
| altmetric | external | Altmetric (Digital Science) | fetch |
| amazon-pa-api | external | Amazon Product Advertising API (account required) | search, fetch |
| amazon-pages | external | Amazon.com detail pages | fetch |
| atcc-catalog | external | ATCC product catalog | fetch, resolve |
| bioregistry | external | Bioregistry API | resolve |
| biorxiv-api | external | openRxiv (bioRxiv / medRxiv) | search, fetch, resolve |
| bks-chunker | internal | BellLabs chunker (DocumentTextVersion -> Chunk) | parse |
| bks-claim-extraction | internal | BellLabs claim extraction through the executor | parse |
| bks-comparison-engine | internal | BellLabs comparison engine (DecisionCriterion rules) | compute |
| bks-criteria-registry | internal | BellLabs DecisionCriterion registry | compute |
| bks-curation-agent | internal | BellLabs curation agents writing through intents (D3, D4, D5, D9) | parse, compute |
| bks-entity-link-projection | internal | BellLabs entity-linking projection job (derived MENTIONS) | compute |
| bks-entity-resolution | internal | BellLabs entity-resolution agent (RESOLUTION / EQUIVALENCE assessments) | resolve |
| bks-intent-contract | internal | @bks/contracts biotech-knowledge-intent.v1 (zod IngestionIntent) and validators | verify |
| bks-projection-job | internal | BellLabs executor PROJECTION Activity (method-versioned jobs, e.g. d2.affects-mechanism-v1, use-constraint-key/v2) | resolve, compute |
| bks-report-publish | internal | BellLabs report publication (Report + ReportItems) | compute |
| brand-pages | external | brand and merchant web pages (example truniagen.com) | fetch, parse |
| browser-fallback | external | interactive browser (claude.ai built-in browser, Playwright, agent-browser) | fetch |
| cafc-opinions | external | U.S. Court of Appeals for the Federal Circuit opinions (PDF) | fetch |
| camelcamelcamel | external | camelcamelcamel price tracker | fetch |
| cas-common-chemistry | external | CAS (American Chemical Society) | resolve |
| certification-databases | external | Informed Sport / NSF / USP verified lists | fetch |
| chembl-rest | external | EMBL-EBI ChEMBL REST | fetch, resolve |
| cms-open-payments | external | CMS Open Payments datastore | search, fetch |
| coa-pdf | external | certificates of analysis hosted by brands and marketplaces (PDF) | fetch, parse |
| community-forums | external | community forums (Discourse JSON, IP.Board pages: rapamycin.news, LongeCity) | fetch |
| companies-house | external | UK Companies House (public web; API needs key) | search, fetch |
| company-press-releases | external | sponsor IR pages and newswires | fetch |
| company-report-pdf | external | brand-published market-surveillance reports (PDF) | fetch, parse |
| consumer-test-vendor-pages | external | consumer test vendors (biological-age clocks, DTC panels) | fetch |
| crossref-event-data | external | Crossref Event Data | fetch |
| crossref-labs | external | Crossref Labs (api.labs.crossref.org; unstable keys) | fetch, verify |
| crossref-rest | external | Crossref (incl. Retraction Watch data in update relations) | fetch, resolve, verify |
| ctgov-record-history | external | NLM ClinicalTrials.gov (website-internal /api/int) | fetch |
| ctgov-v2-api | external | NLM ClinicalTrials.gov | search, fetch, resolve |
| d13-event-linker | internal | BellLabs D13 event-linker agent | compute |
| d13-frontier-curator | internal | BellLabs D13 frontier-curator agent (frontier-classification/v1) | resolve |
| d2-hallmark-curation | internal | BellLabs D2 hallmark-map curation (BELLLABS_CURATED) | resolve |
| dailymed-spl | external | NLM DailyMed web services v2 | search, fetch |
| ebi-ols4-chebi | external | EMBL-EBI Ontology Lookup Service | resolve |
| ecfr-versioner | external | eCFR versioner API (GPO / OFR) | fetch |
| economist-bigmac-data | external | The Economist big-mac-data (GitHub CSV, CC BY) | fetch |
| efsa-food-composition | external | EFSA food consumption / composition datasets | fetch |
| efsa-journal-wiley | external | EFSA Journal (Wiley-hosted) | fetch |
| eu-ctis-public | external | EMA Clinical Trials Information System | search, fetch |
| eurlex | external | EUR-Lex (Publications Office of the EU), HTML by CELEX | fetch |
| europepmc-annotations | external | Europe PMC Annotations API (text-mining providers incl. Europe PMC, OntoGene, Open Targets) | parse, resolve |
| europepmc-fulltext-jats | external | EMBL-EBI Europe PMC (PMC OA subset) | search, fetch, parse |
| europepmc-rest | external | EMBL-EBI Europe PMC | search, fetch |
| exa-mcp | external | Exa | search, fetch |
| fda-clia-db | external | FDA CLIA test-complexity database (form POST) | search, fetch |
| fda-data-dashboard | external | FDA Data Dashboard (inspections, 483s) | fetch |
| fda-gras-inventory | external | FDA HFP GRAS Notice Inventory (HTML per notice, PDF letters) | fetch |
| fda-gsrs | external | FDA / NCATS Global Substance Registration System (precision.fda.gov and gsrs.ncats.nih.gov) | fetch, resolve |
| fda-gudid | external | NLM AccessGUDID | fetch, resolve |
| fda-web-pages | external | fda.gov (warning letters, ingredient pages, constituent updates) | fetch |
| federal-register-api | external | Federal Register API | search, fetch |
| firecrawl-change-tracking | external | Firecrawl changeTracking format / monitor | fetch, verify |
| firecrawl-cli | external | Firecrawl (CLI 1.23.1 + MCP) | search, fetch, parse |
| firecrawl-research-index | external | Firecrawl research paper index (MCP firecrawl_research_*) | search, resolve |
| foodon | external | FoodOn ontology (OBO) | resolve |
| forecast-markets | external | forecast markets (Metaculus, Manifold, ...) | fetch |
| fsis-recall-api | external | USDA FSIS recall API | fetch |
| ftc-pages | external | US Federal Trade Commission letters and press releases (PDF/HTML) | fetch |
| funder-award-pages | external | funders' own award releases (ARPA-H, Hevolution, ...) | fetch |
| gleif-lei | external | Global Legal Entity Identifier Foundation | search, resolve |
| google-patents | external | Google Patents | fetch |
| gs1-verified | external | GS1 Verified by GS1 / GEPIR (membership required) | resolve |
| hagr | external | Human Ageing Genomic Resources (GenAge pages, DrugAge bulk zip) | fetch |
| health-canada-lnhpd | external | Health Canada Licensed Natural Health Products Database | fetch |
| health-canada-nhpid | external | Health Canada Natural Health Products Ingredients Database and monographs | fetch |
| html-text-projection | internal | HTML -> visible-text projection scripts (h2t v1/v2, edgar-text/v5) | parse |
| http-capture | external | plain HTTP capture with curl (raw bytes; browser User-Agent where needed) | fetch |
| icd10cm-pcs | external | CMS/CDC ICD-10-CM and ICD-10-PCS (via claude.ai ICD-10 MCP, FY2027 set) | search, resolve |
| iherb-pages | external | iHerb product pages | fetch |
| impact-affiliate-api | external | impact.com affiliate API | fetch |
| in-container-disclosures | external | disclosures inside the content container (article, episode, video) | fetch, parse |
| internet-archive-wayback | external | Internet Archive Wayback Machine (availability API, CDX, id_ raw replay) | search, fetch |
| isrctn | external | ISRCTN registry | fetch |
| itunes-search-api | external | Apple iTunes Search / Lookup API | search, resolve |
| keepa-api | external | Keepa (Amazon price history; key required) | fetch |
| kegg-rest | external | Kanehisa Laboratories KEGG REST (academic use; commercial licence) | fetch |
| kg-executor | internal | BellLabs biotech-knowledge-services intent executor (kg-ops plan/apply) | compute |
| ks-verification | internal | ai-engineer-knowledge-services verification.v1 | verify |
| lab-test-menus | external | laboratory test menus and sample reports (Labcorp, Quest) | fetch |
| licensed-out-sources | external | DrugBank, Natural Medicines, KEGG (commercial use), Crunchbase, Examine (paywalled content) | fetch |
| local-contracts | internal | local repositories (verification.v1 contracts, ADRs) | fetch, parse |
| locator-builder-verifier | internal | locator builders and re-selection verifiers (fixture prototypes in D4, D7, D8, D13) | verify |
| loinc | external | Regenstrief LOINC (fhir.loinc.org) and NLM Clinical Tables mirror | resolve |
| manufacturer-articles | external | ingredient manufacturer articles | fetch |
| mcp-biorxiv | external | claude.ai bioRxiv connector | search, fetch |
| mcp-clinicaltrials | external | claude.ai Clinical Trials connector (ClinicalTrials.gov v2) | search, fetch |
| mcp-pubmed | external | claude.ai PubMed connector | search, fetch, resolve |
| mission-control | internal | BellLabs Mission Control (runs, evidence missions) | compute |
| mpd-itp | external | Mouse Phenome Database, NIA Interventions Testing Program | fetch |
| nanopub-registry | external | Knowledge Pixels nanopub registry | fetch |
| ncbi-bioc-pmcoa | external | NCBI BioNLP BioC PMC OA API | fetch, parse |
| ncbi-bookshelf-livertox | external | NCBI Bookshelf (LiverTox) | fetch |
| ncbi-eutils-pubmed | external | NCBI / NLM | search, fetch, resolve |
| ncbi-web-pages | external | NCBI web UIs (pubmed.ncbi.nlm.nih.gov, pmc.ncbi.nlm.nih.gov article HTML; challenge / proof-of-work pages) | fetch |
| neo4j-gds | internal | Neo4j Graph Data Science (Cypher procedures on the BellLabs graph) | compute |
| ngsp | external | NGSP (HbA1c interference tables, certified methods) | fetch |
| nih-dsld | external | NIH Office of Dietary Supplements — Dietary Supplement Label Database (API v9) | search, fetch |
| nih-ods-api | external | NIH ODS fact sheets API | fetch |
| nih-reporter | external | NIH RePORTER v2 | search, fetch |
| nlm-mesh-rdf | external | NLM MeSH RDF lookup (id.nlm.nih.gov) | resolve |
| nlm-rxnav | external | NLM RxNorm / RxNav | resolve |
| nova-classifier | internal | BellLabs rule nova-markers/v1 | compute |
| nppes-npi | external | CMS NPPES NPI Registry (via claude.ai NPI MCP) | search, resolve |
| open-food-facts | external | Open Food Facts API v2 | search, fetch |
| open-genes | external | Open Genes API | fetch |
| open-targets | external | Open Targets Platform GraphQL | search, fetch |
| openalex | external | OpenAlex (OurResearch) | search, fetch, resolve |
| opencorporates | external | OpenCorporates | search, resolve |
| openfda-caers | external | FDA openFDA food/event (CFSAN Adverse Event Reporting System) | search, fetch |
| openfda-device | external | FDA openFDA device endpoints (recall, 510k, classification) | search, fetch |
| openfda-drug-label | external | FDA openFDA drug/label (derived from SPL) | search, fetch |
| openfda-drugsfda | external | FDA openFDA drug/drugsfda (Drugs@FDA) | search, fetch |
| openfda-faers | external | FDA openFDA drug/event (FAERS) | search, fetch |
| openfda-food-enforcement | external | FDA openFDA food/enforcement (Recall Enterprise System) | search, fetch |
| orcid | external | ORCID public API v3.0 | fetch, resolve |
| patentsview | external | USPTO PatentsView | search, fetch |
| phenol-explorer | external | Phenol-Explorer 3.6 report pages | fetch, parse |
| pmc-idconv | external | NCBI PMC ID Converter API v1 | resolve |
| podcast-rss | external | podcast RSS feeds (show host, e.g. Megaphone) | fetch |
| poppler-pdftoppm | internal | poppler pdftoppm (local page render) | parse, verify |
| poppler-pdftotext | internal | poppler pdftotext 4.00 (local) | parse |
| product-label-contact | external | product label 'distributed by / manufactured for' blocks (via D6 label capture) | parse |
| propublica-dollars-for-profs | external | ProPublica Dollars for Profs | fetch |
| prospero | external | PROSPERO systematic-review register | search, fetch |
| protocol-pages | external | published protocol pages (podcasters, Blueprint, clinics) | fetch |
| pubchem-pug-rest | external | NCBI PubChem | search, resolve |
| publisher-episode-pages | external | show publishers' episode pages (show notes, transcripts) | fetch |
| publisher-pages | external | journal publisher web pages (here: American Physiological Society, journals.physiology.org, Atypon platform behind Cloudflare) | fetch |
| quickgo | external | EMBL-EBI QuickGO | resolve |
| reactome-content-service | external | Reactome ContentService | fetch, resolve |
| reddit | external | Reddit | search, fetch |
| regulations-gov-api | external | GSA regulations.gov API v4 | search, fetch |
| regulations-gov-attachments | external | downloads.regulations.gov | fetch, parse |
| rejuvenation-roadmap | external | Lifespan.io Rejuvenation Roadmap (JS-rendered) | fetch |
| repo-mcp-servers | external | repo .mcp.json servers (pubmed, pubchem, clinicaltrialsgov, edgartools) — not loaded in the coordinator sessions | search, fetch, resolve |
| restaurant-menu-pages | external | restaurant chain menu item pages (mcdonalds.com, wendys.com, ...) | fetch |
| retailer-partner-apis | external | retailer partner APIs (Walmart, iHerb; partnership required) | fetch |
| sec-edgar | external | U.S. SEC EDGAR (data.sec.gov, www.sec.gov/files) | search, fetch |
| self-disclosure-pages | external | self-published disclosure and affiliation pages of people and labs | fetch |
| semantic-scholar | external | Allen Institute for AI | search, resolve |
| shopify-storefront-json | external | Shopify storefront public JSON (/products.json, /products/<handle>.js) | fetch |
| sponsor-affiliate-pages | external | podcast sponsor pages and affiliate-tagged URLs | fetch |
| substack-api | external | Substack public post API | fetch |
| supplier-pages | external | ingredient suppliers' own pages | fetch |
| tavily-cli | external | Tavily (tvly 0.1.5) | search, fetch |
| telehealth-clinic-pages | external | telehealth clinic pages (AgelessRx and peers) | fetch |
| tga-safety-updates | external | Australian TGA Medicine Safety Updates | fetch |
| trade-press | external | trade press (BioPharma Dive, STAT, Endpoints, Fierce) | fetch |
| ucum | external | NLM Clinical Tables UCUM / Regenstrief UCUM | resolve, compute |
| uniprot-rest | external | UniProt Consortium | fetch, resolve |
| unpaywall | external | Unpaywall (OurResearch) | resolve |
| usda-fdc | external | USDA ARS FoodData Central | search, fetch |
| usda-fdc-portal | external | FoodData Central web-app JSON (fdc.nal.usda.gov/portal-data; undocumented) | fetch |
| uspto-tsdr | external | USPTO trademark status | fetch |
| wearable-api-docs | external | wearable vendor API documentation (Oura OpenAPI, WHOOP developer API, Apple developer docs JSON) | fetch |
| wearable-vendor-changelogs | external | wearable vendor changelogs and community posts | fetch |
| who-ictrp | external | WHO International Clinical Trials Registry Platform | search, fetch, resolve |
| wikidata | external | Wikidata (Special:EntityData, wbsearchentities, revisions) | fetch, resolve |
| youtube-oembed | external | YouTube oEmbed | resolve |
| youtube-pages | external | YouTube watch pages and caption tracks | fetch |

