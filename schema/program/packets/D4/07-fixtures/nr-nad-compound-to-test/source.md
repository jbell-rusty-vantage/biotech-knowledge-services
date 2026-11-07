# Fixture nr-nad-compound-to-test - source

- kind: other
- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5876407/fullTextXML
- title: Martens et al. 2018, Chronic nicotinamide riboside supplementation is well-tolerated and elevates NAD+ in healthy middle-aged and older adults, Nat Commun 9:1286 (Europe PMC JATS XML; PMID 29599478; DOI 10.1038/s41467-018-03421-7)
- retrieved: 2026-10-08
- snapshot digest: sha256:dd620181966f862df7030f4bb7b09811befd90e8e67c2b94fc90f9c212664794
- tool: curl Europe PMC REST fullTextXML (no key)
- candidate: FC-7 in ../../_notes/fixture-candidates.md (cross-domain D1 -> D2 -> D3 -> D4 path; harm branch NOT_COMPARABLE and test-and-sell); D2 side: ../../../D2/07-fixtures/nr-muscle-unstructured

## Description

The compound -> mechanism -> biomarker -> test path of Q-D4-01 as one query pattern spanning D2 and D4, on real captures. Nicotinamide riboside (D1 ChemicalSubstance) acts on NAD+ metabolism (D2 Mechanism 'Nicotinate metabolism', Reactome R-HSA-196807; the NR -> mechanism hop is D2's AFFECTS_MECHANISM, demonstrated in the D2 fixture nr-muscle-unstructured). D4 supplies the rest: Biomarker NAD+ level and NAAD level REFLECTS_MECHANISM that mechanism (asserted by Martens et al. 2018, Nat Commun 9:1286, PMID 29599478, PMC5876407, NCT02921659), HAS_ANALYTE -> the D1 substances, and two Metrics that QUANTIFY NAD+: 'NAD+ in PBMCs, pmol/mg protein' (trial, LC-MS cited) and 'NAD+ in red blood cells, μM' (Jinfiniti Intracellular NAD® Test, finger prick, method not reported). The test is reached by MEASURES_METRIC, its procedure by PERFORMED_WITH_VERSION, the seller's 'optimal' band by INTERVAL_FOR (intervalKind VENDOR_TARGET, derivation VENDOR_DEFINED), and the purchasable items by DELIVERS (D6 Product -> LabTest). Expected answer: the test exists but is NOT_COMPARABLE with the trial measurement (compartment PBMC vs RBC, unit, method), and the test issuer sells the supplement the test is used to dose (test-and-sell). The registry record of the trial does not list NAD+ as an outcome (registry/publication divergence).

## Snapshots

### S1 `snap-martens`

- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5876407/fullTextXML
- title: Martens et al. 2018, Chronic nicotinamide riboside supplementation is well-tolerated and elevates NAD+ in healthy middle-aged and older adults, Nat Commun 9:1286 (Europe PMC JATS XML; PMID 29599478; DOI 10.1038/s41467-018-03421-7)
- retrieved: 2026-10-08 (2026-10-08T17:39:00-04:00)
- snapshot digest: sha256:dd620181966f862df7030f4bb7b09811befd90e8e67c2b94fc90f9c212664794 (142126 bytes, application/xml, RAW_BYTES)
- derived text: sha256:e954d92dafeffbeeb10f8468b6ff22925020af4f36afb8773798ae57646ad702 (73084 chars) by python: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', xml_utf8))) (tags -> space, entities unescaped, whitespace runs -> one space, no strip)
- tool: curl Europe PMC REST fullTextXML (no key)
- source kind / genre: API / PEER_REVIEWED_PUBLICATION
- research-stage capture: identical (re-fetch returned the same bytes)

### S2 `snap-ctgov`

- url: https://clinicaltrials.gov/api/v2/studies/NCT02921659?fields=protocolSection.identificationModule,protocolSection.outcomesModule
- title: ClinicalTrials.gov API v2 - NCT02921659 (identification and outcomes modules)
- retrieved: 2026-10-08 (2026-10-08T17:39:00-04:00)
- snapshot digest: sha256:b723914eeecf73f7f217f05bcebed23b6996f16dfabaad66943bc132a41a4a5c (1422 bytes, application/json, RAW_BYTES)
- tool: curl ClinicalTrials.gov API v2 (fields filter)
- source kind / genre: REGISTRY / TRIAL_REGISTRY_RECORD
- research-stage capture: identical (re-fetch returned the same bytes)

### S3 `snap-jinfiniti`

- url: https://www.jinfiniti.com/product/intracellular-nad-test
- title: Jinfiniti - Intracellular NAD® Test: At-Home NAD+ Test Kit (product page)
- retrieved: 2026-10-08 (2026-10-08T17:40:00-04:00)
- snapshot digest: sha256:405e28c0e82b77d68ea124b1ec5cb9d3984a80ebb026248fbb0c471bf88832f4 (24544 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0 (found with Tavily CLI search in the research stage)
- source kind / genre: WEB_PAGE / PRODUCT_PAGE
- research-stage capture differed: sha256:edb294193347b80e72a64f5cf58eb2a9b419829e0982eeff43687b66255659b5 (quotes re-verified on this capture; offsets are this capture's)
- note: research-stage capture (shared with the D2 packet) had sha256 edb29419...; the page changed slightly; all quotes re-verified here

## Citation

https://doi.org/10.1038/s41467-018-03421-7 · Martens CR et al., 'Chronic nicotinamide riboside supplementation is well-tolerated and elevates NAD+ in healthy middle-aged and older adults', Nat Commun 2018;9:1286 (PMID 29599478, PMCID PMC5876407) · retrieved 2026-10-08 via Europe PMC fullTextXML; https://clinicaltrials.gov/api/v2/studies/NCT02921659 · ClinicalTrials.gov NCT02921659 · 2026-10-08; https://www.jinfiniti.com/product/intracellular-nad-test · Jinfiniti, Intracellular NAD® Test · 2026-10-08
