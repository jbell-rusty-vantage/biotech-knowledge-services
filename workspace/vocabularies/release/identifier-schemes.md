---
id: "vocab:identifier-schemes"
kind: "vocabulary"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/identifier-schemes.yaml"]
aliases: ["identifier-schemes","identifier schemes"]
capabilities: ["get"]
cardDigest: "sha256:858f461c5f0f344a6881c033b28e578be3cc2db179578d755a790132344b5150"
---
# Vocabulary identifier-schemes

Release vocabulary `vocabularies/identifier-schemes.yaml` (sha256 `52581c038a12a535…`).

113 schemes; 52 write-active in this release (ID-02).

| scheme | name | authority | status | write | used by |
| --- | --- | --- | --- | --- | --- |
| `APPLE_PODCAST` | Apple Podcasts collection or track id | Apple | requested | active | D9.Channel |
| `ASIN` | Amazon Standard Identification Number | Amazon (per marketplace: issuer = marketplace host) | seed | active | D6.MerchantListing |
| `AWARD_NUMBER` | grant or award number | the funder (issuer = funder uid) | requested | active | D7.Award |
| `CAS_RN` | CAS Registry Number | Chemical Abstracts Service | seed | disabled | D1.ChemicalSubstance |
| `CELEX` | EUR-Lex CELEX number | Publications Office of the EU | requested | active | D8.RegulatoryRecord |
| `CERT_LISTING` | certification listing id | the certifier (issuer = certifier uid) | requested | active | D8.CertificationListing |
| `CHEBI` | ChEBI id | EMBL-EBI | seed | active | D1.ChemicalSubstance, D1.Constituent |
| `CHEMBL` | ChEMBL id (compounds and targets share the namespace) | EMBL-EBI ChEMBL | requested | active | D2.MolecularEntity |
| `CHEMSPIDER` | ChemSpider id | Royal Society of Chemistry | requested | disabled |  |
| `COMPANY_NUMBER` | national company registry number | the registry (Companies House, Delaware Division of Corpora… | requested | disabled | D7.Organization |
| `COURT_DOCKET` | court docket number | the court (issuer = court uid) | requested | active | D8.RegulatoryRecord |
| `CPT` | AMA CPT code (storage subject to licence) | American Medical Association | requested | disabled | D4.LabTest |
| `CROSSREF_FUNDER` | Crossref Funder Registry id | Crossref | requested | disabled | D7.Organization |
| `CULTURE_COLLECTION` | strain deposit number | the culture collection (ATCC, DSMZ, LMG, CCUG, NRRL, JCM) | requested | disabled | D1.Taxon |
| `DOI` | Digital Object Identifier | DOI registration agency (Crossref, DataCite, ...) | seed | active | D3.Publication, D5.Protocol, D7.Award, D9.MediaWork, K.Source |
| `DRUGBANK` | DrugBank accession | DrugBank | seed | disabled | D1.ChemicalSubstance |
| `DSLD` | NIH ODS Dietary Supplement Label Database label id | NIH ODS | seed | active | D6.LabelVersion, D6.Package |
| `DSLD_INGREDIENT` | DSLD ingredient id | NIH ODS | requested | disabled | D1.IngredientMaterial |
| `EFO` | Experimental Factor Ontology term | EMBL-EBI | requested | disabled | D2.Condition |
| `EIN` | US Employer Identification Number | U.S. IRS | requested | disabled |  |
| `ENSEMBL_GENE` | Ensembl gene id | Ensembl | seed | disabled | D2.MolecularEntity |
| `EUCT` | EU CT number (CTIS) | European Medicines Agency | seed | disabled | D3.Study |
| `EUDRACT` | EudraCT number | European Medicines Agency | seed | disabled | D3.Study |
| `FDA_510K` | FDA 510(k) number | FDA CDRH | requested | active | D4.Device |
| `FDA_APPLICATION` | FDA application number (NDA, ANDA, BLA) | FDA | seed | active | D8.RegulatoryRecord |
| `FDA_DOCKET` | regulations.gov FDA docket id | FDA | requested | active | D8.RegulatoryRecord |
| `FDA_FEI` | FDA Establishment Identifier | FDA | requested | disabled |  |
| `FDA_GRN` | FDA GRAS notice number | FDA | requested | active | D8.RegulatoryRecord |
| `FDA_NDI` | FDA new dietary ingredient notification number | FDA | requested | active | D8.RegulatoryRecord |
| `FDA_PRODUCT_CODE` | FDA device product code | FDA CDRH | requested | disabled | D4.Device |
| `FDA_RECALL` | FDA recall number | FDA | requested | active | D8.RegulatoryRecord |
| `FDA_RECALL_EVENT` | FDA recall event id | FDA | requested | active | D8.RegulatoryRecord |
| `FDA_WARNING_LETTER` | FDA warning letter (CMS/MARCS) number | FDA | requested | disabled | D8.RegulatoryRecord |
| `FDC_ID` | USDA FoodData Central id | USDA ARS | seed | disabled | D12.FoodItem, D6.Package |
| `FDC_NUTRIENT` | FoodData Central nutrient id or number | USDA ARS | requested | disabled | D1.Constituent |
| `FNDDS_FOOD_CODE` | FNDDS survey food code (with validity window) | USDA ARS (FNDDS) | requested | disabled | D12.FoodItem |
| `FOODEX2` | EFSA FoodEx2 term code | EFSA | requested | disabled | D12.FoodCategory |
| `FOODON` | FoodOn ontology term | FoodOn (OBO Foundry) | requested | disabled | D12.FoodItem |
| `GO` | Gene Ontology term | GO Consortium | seed | active | D2.Mechanism |
| `GTIN` | GS1 Global Trade Item Number (UPC-A | GS1 | seed | active | D6.Package |
| `HGNC` | HGNC gene id | HUGO Gene Nomenclature Committee | seed | active | D2.MolecularEntity |
| `HPO` | Human Phenotype Ontology term | HPO | seed | disabled | D2.Condition |
| `ICD10CM` | ICD-10-CM code | CDC NCHS | seed | active | D2.Condition |
| `INCHIKEY` | InChIKey (computed structure key) | InChI Trust algorithm | seed | active | D1.ChemicalSubstance |
| `ISBN` | International Standard Book Number (13) | ISBN agency | seed | disabled | D5.Protocol, D9.MediaWork |
| `ISRCTN` | ISRCTN registry number | ISRCTN registry | seed | active | D3.Study |
| `ISSN` | International Standard Serial Number | ISSN International Centre | seed | disabled | D9.Channel |
| `KEGG_PATHWAY` | KEGG pathway id (licence-gated) | Kanehisa Laboratories | requested | disabled | D2.Mechanism |
| `LAB_REPORT` | laboratory report / COA number | the laboratory (issuer = lab uid) | requested | disabled | D8.QualityResult |
| `LAB_TEST_CODE` | laboratory test order code | the laboratory (issuer = lab uid) | requested | disabled | D4.LabTest |
| `LANGUAL` | LanguaL facet code | LanguaL (food description thesaurus) | requested | disabled | D12.FoodCategory |
| `LEI` | Legal Entity Identifier | GLEIF | seed | active | D7.Organization |
| `LNHPD_ID` | Health Canada LNHPD product record id | Health Canada | requested | disabled | D8.RegulatoryRecord |
| `LNHPD_INGREDIENT` | Health Canada LNHPD medicinal ingredient id | Health Canada | requested | disabled | D1.IngredientMaterial |
| `LOINC` | LOINC code | Regenstrief Institute | seed | active | D4.Metric |
| `LOT_CODE` | lot or batch code | the brand or manufacturer (issuer = organization uid) | requested | active | D8.Lot |
| `MARKETPLACE_SELLER_ID` | marketplace seller id | the marketplace host | requested | active | D6.Offer |
| `MESH` | MeSH descriptor or supplementary concept | NLM | seed | active | D1.ChemicalSubstance, D1.Constituent, D2.Condition, D2.Mechanism, D5.Intervention, D5.Target |
| `MONDO` | Mondo disease id | Monarch Initiative | seed | disabled | D2.Condition |
| `NANOPUB` | nanopublication trusty URI artifact code | the signing agent | requested | disabled |  |
| `NCBI_GENE` | NCBI Gene id | NCBI | seed | disabled | D2.MolecularEntity |
| `NCBI_TAXON` | NCBI Taxonomy id | NCBI | requested | active | D1.Taxon |
| `NCT` | ClinicalTrials.gov NCT number | NLM ClinicalTrials.gov | seed | active | D3.Study, K.Source |
| `NDB_NUMBER` | USDA SR NDB number | USDA ARS (Standard Reference) | requested | active | D12.FoodItem |
| `NDC` | FDA National Drug Code | FDA | seed | active | D6.ProductVariant |
| `NIHMS` | NIH author manuscript id | NIH | requested | disabled |  |
| `NIH_PROFILE_ID` | NIH RePORTER PI profile id | NIH RePORTER | requested | active | D7.Person |
| `NIH_PROJECT` | NIH core project number | NIH | requested | active | D7.Award |
| `NPI` | US National Provider Identifier | CMS NPPES | seed | disabled | D7.Organization, D7.Person |
| `NPN` | Health Canada Natural Product Number | Health Canada | seed | active | D6.ProductVariant, D8.RegulatoryRecord |
| `OMIM` | OMIM entry number | Johns Hopkins University (OMIM) | requested | disabled | D2.Condition |
| `OPENALEX` | OpenAlex work / author / institution id | OpenAlex | seed | active | D3.Publication, D7.Organization, D7.Person |
| `ORCID` | ORCID iD | ORCID | seed | active | D7.Person |
| `ORG_STUDY_ID` | sponsor's organization study id (registry secondary id) | the sponsor (issuer = sponsor organization uid) | requested | disabled |  |
| `ORPHANET` | Orphanet disease id (ORPHA code) | Orphanet | requested | disabled | D2.Condition |
| `PATENT_APPLICATION` | patent application number | the patent office | requested | disabled | D8.Patent |
| `PATENT_PUB` | patent publication number | the patent office named by the country code (USPTO, EPO, WI… | seed | disabled | D8.Patent |
| `PHENOL_EXPLORER_FOOD` | Phenol-Explorer food id | Phenol-Explorer (phenol-explorer.eu) | requested | disabled | D12.FoodItem |
| `PMCID` | PubMed Central identifier | NLM | seed | active | D3.Publication, K.Source |
| `PMID` | PubMed identifier | NLM | seed | active | D3.Publication, K.Source |
| `PODCAST_GUID` | podcast episode RSS guid | the feed (issuer = feed URL) | seed | active | D9.MediaWork, K.Source |
| `PODCAST_INDEX_FEED` | Podcast Index feed id | Podcast Index | seed | disabled | D9.Channel |
| `PTAB_TRIAL` | USPTO PTAB trial number | USPTO | requested | disabled | D8.RegulatoryRecord |
| `PUBCHEM_CID` | PubChem compound id | NCBI PubChem | seed | active | D1.ChemicalSubstance |
| `REACTOME` | Reactome stable id | Reactome | seed | active | D2.Mechanism |
| `RETAILER_ITEM_ID` | retailer item id | the retailer host domain | requested | disabled | D6.MerchantListing |
| `ROR` | Research Organization Registry id | ROR | seed | active | D7.Organization |
| `RW_RECORD` | Retraction Watch database record id | Retraction Watch (distributed by Crossref) | requested | disabled |  |
| `RXCUI` | RxNorm concept unique id | NLM RxNorm | seed | active | D1.ChemicalSubstance |
| `SEC_ACCESSION` | SEC EDGAR filing accession number | US SEC | requested | disabled | K.Source |
| `SEC_CIK` | SEC Central Index Key | US SEC | seed | active | D7.Organization, D7.Person |
| `SKU` | seller stock-keeping unit | the seller (issuer = seller uid) | seed | active | D6.Package, D6.ProductVariant |
| `SNOMEDCT` | SNOMED CT concept id | SNOMED International | seed | disabled | D2.Condition, D5.Intervention |
| `SPL_SET_ID` | FDA Structured Product Labeling set id (label lineage) | FDA SPL (labeler) | requested | active |  |
| `SPOTIFY` | Spotify show or episode id | Spotify | requested | disabled | D9.Channel, D9.MediaWork |
| `STOREFRONT_PRODUCT_ID` | storefront product id (e.g. Shopify) | the store domain | requested | disabled | D6.MerchantListing, D6.Product |
| `STOREFRONT_VARIANT_ID` | storefront variant id (e.g. Shopify) | the store domain | requested | disabled | D6.ProductVariant |
| `SUBSTACK_POST` | Substack post id or slug | the publication (issuer = publication domain) | requested | disabled | D9.MediaWork |
| `SUPPLIER_CODE` | supplier material code | the supplier (issuer = supplier uid) | requested | disabled | D1.IngredientMaterial |
| `TICKER` | exchange ticker symbol | the exchange (issuer = exchange MIC) | requested | disabled |  |
| `UDI_DI` | device identifier part of a UDI | the issuing agency (GS1, HIBCC, ICCBBA) | requested | active | D4.Device |
| `UEI` | SAM.gov Unique Entity ID | US GSA SAM.gov | requested | active | D7.Organization |
| `UMLS_CUI` | UMLS concept unique id | NLM UMLS | requested | disabled |  |
| `UNII` | FDA Unique Ingredient Identifier | FDA GSRS | seed | active | D1.ChemicalSubstance |
| `UNIPROT` | UniProtKB accession | UniProt | seed | active | D2.MolecularEntity |
| `WEB_DOMAIN` | registrable web domain | DNS (public suffix list) | requested | disabled | D7.Brand, D7.Organization |
| `WIKIDATA` | Wikidata item | Wikimedia Foundation | seed | active | D1.ChemicalSubstance, D1.Taxon, D12.DietaryPattern, D12.FoodItem, D2.Condition, D2.Mechanism, D2.MolecularEntity, D2.Ou… |
| `WIKIPATHWAYS` | WikiPathways id | WikiPathways | requested | disabled | D2.Mechanism |
| `WWEIA_CATEGORY` | WWEIA food category code | USDA ARS (What We Eat in America) | requested | disabled | D12.FoodCategory |
| `X_ACCOUNT` | X (Twitter) account id | X Corp | requested | disabled | D9.Channel |
| `X_POST` | X (Twitter) post id | X Corp | requested | disabled | D9.MediaWork |
| `YOUTUBE_CHANNEL` | YouTube channel id | YouTube | requested | disabled | D9.Channel |
| `YOUTUBE_VIDEO` | YouTube video id | YouTube | seed | disabled | D9.MediaWork, K.Source |
