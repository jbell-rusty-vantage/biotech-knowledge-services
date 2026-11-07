# D4 — fixture candidates (research stage, A3, 2026-10-08)

Raw captures live in the run scratch, not in the repo: `C:\Users\Pinda\AppData\Local\Temp\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\ft\D4\raw\` (all hashes in `..\SHA256SUMS.txt`, produced with `sha256sum`). Every quote below was located in the capture with a script (`bin/q.py`, exact substring match); offsets are 0-based character offsets into the decoded file named in "capture file" (UTF-8; the TruDiagnostic PDF text is Latin-1-decoded `pdftotext -layout` output). Quotes are verbatim, including source typos and markdown escapes. Retrieval date for all: 2026-10-08.

Recommended set for the fixtures stage (contract needs ≥ 3): **FC-3** (unstructured-to-entity), **FC-4** (disconfirmation), **FC-5** (harm), **FC-1 + FC-2** (comparability with a harm branch), **FC-7** (the D2↔D4 compound → mechanism → biomarker → test path; coordinate with the D2 packet's NR fixture).

| id | kind | answers | primary source |
| --- | --- | --- | --- |
| FC-1 | other (comparability / identity of measurand vs test vs method) | CQ-DX-01, CQ-DX-03, CQ-DX-06, Q-D4-19 | Labcorp 001453 + Quest 496 + LOINC 4548-4 |
| FC-2 | **harm** | Q-D4-11, CQ-DX-03, Q-D4-23 | NGSP interference table + certified methods |
| FC-3 | **unstructured-to-entity** | CQ-DX-04, CQ-DX-02, Q-D4-06, Q-D4-16, Q-D4-22 | DunedinPACE eLife full text |
| FC-4 | **disconfirmation** | CQ-DX-05, Q-D4-05, Q-D4-15 | Higgins-Chen 2022 (PC clocks) |
| FC-5 | **harm** | Q-D4-08, Q-D4-09 | FDA safety communication + openFDA recall |
| FC-6 | other (version-as-of / definition change) | CQ-DX-09, Q-D4-07, Q-D4-23, CQ-DX-02 | WHOOP changelog + Oura OpenAPI + Apple HealthKit + WHOOP API |
| FC-7 | other, with **harm** branch (cross-domain path D1→D2→D3→D4, test-and-sell conflict) | Q-D4-01, Q-D4-02, Q-D4-12, Q-D4-13 | Martens 2018 NR trial + NCT02921659 + Jinfiniti |
| FC-8 | other (registry outcome with unresolved algorithm version) | CQ-DX-04, Q-D4-14 | ClinicalTrials.gov NCT07220473 |
| FC-9 | other, with **disconfirmation** branch (vendor implementation vs publication) | Q-D4-04, Q-D4-05, Q-D4-06, Q-D4-20 | TruDiagnostic TruAge page + sample report; Elysium Index |

---

## FC-1 — HbA1c: one measurand, two labs, two methods, two kinds of "range"

- URLs / titles:
  - https://www.labcorp.com/tests/001453/hemoglobin-hb-a1c · Labcorp test menu — Hemoglobin (Hb) A1c, test 001453
  - https://files.labcorp.com/testmenu-d8/sample_reports/001453.pdf · Labcorp SAMPLE REPORT, 001453
  - https://testdirectory.questdiagnostics.com/test/test-detail/496/hemoglobin-a1c?cc=MASTER · Quest Test Directory — Hemoglobin A1c, 496
  - https://loinc.org/4548-4 · LOINC 4548-4 Hemoglobin A1c/Hemoglobin.total in Blood
- Retrieved 2026-10-08 · tools: Firecrawl CLI `scrape --only-main-content` (HTML pages); curl (PDF) + `pdftotext -layout`
- sha256: labcorp-001453.md `0073f5495274f0e65cea44fb39a65206b064925dc17412b4cda3743a4d50e958`; labcorp-001453-sample.pdf `a2d50898e8ab617000a7b93216304b4daba18381ff0c6e8400e12fee4241a1c9`; quest-496.md `1816564448ca5e9165c524b1443ca05ed51ba5b25f158e07e7cf031f2b662aa6`; loinc-4548-4.md `d15f1f233a744677aedea5c6570d279ebf5ae4e990080260ba258bad14d393b9`
- Quotes:
  1. labcorp-001453.md, "Methodology" section, offset 3750–3766: "Roche Tina Quant"
  2. labcorp-001453.md, "LOINC® Map" table, offset 11541–11616: "| 001453 | Hemoglobin A1c | 4548-4 | 001481 | Hemoglobin A1c | % | 4548-4 |"
  3. labcorp-001453.md, "Reference Range" list, offsets 9327–9362 and 9364–9391: "• Hemoglobin (Hb) A1c: 4.8% to 5.6%" / "• Prediabetes: 5.7% to 6.4%"
  4. quest-496.md, "Methodology", offset 1934–1970: "Turbidimetric Inhibition Immunoassay"; and "Reference range(s)", offset 2510–2516: "<5.7 %"
  5. quest-496.md, footer, offset 2703–2834: "Reference ranges are provided as general guidance only. To interpret test results use the reference range in the laboratory report."
  6. loinc-4548-4.md, Reference Information / mapping guidance, offset 4051–4104: "All three protocols produce different numeric values."
- Expected assertions: LabTest(Labcorp 001453) MEASURES_METRIC Metric(LOINC 4548-4); LabTest(Quest 496) MEASURES_METRIC Metric(LOINC 4548-4) [LOINC hidden on Quest page → NOT_REPORTED, or from a second capture with service area]; AssayVersion(Labcorp) usesMethod "immunoassay (Roche Tina-quant)", instrument NOT_REPORTED, softwareVersion NOT_REPORTED; ReferenceIntervalVersion ×4 at Labcorp (REFERENCE_INTERVAL 4.8–5.6; DECISION_LIMIT 5.7–6.4; DECISION_LIMIT ≥6.5; GUIDELINE_TARGET <7.0), derivation NOT_REPORTED; Quest single DECISION_LIMIT-or-RI "<5.7 %" (kind ambiguous → record verbatim).
- Expected answer to CQ-DX-03 for Labcorp vs Quest HbA1c: same Metric (4548-4, NGSP %), both immunoassays, instruments and software NOT_REPORTED → verdict UNKNOWN (or COMPARABLE only if an NGSP certification of both lab methods is attached), never "same test".

## FC-2 — HbA1c method interference (harm)

- URLs / titles: https://ngsp.org/interf.asp · NGSP — HbA1c Assay Interferences ("Updated June 2026"); https://ngsp.org/docs/methods.pdf · NGSP — List of NGSP Certified Methods (updated 10/26)
- Retrieved 2026-10-08 · tool: Firecrawl CLI scrape (HTML; PDF parsed by Firecrawl to markdown)
- sha256: ngsp-interf.md `d7498836c93ec989942fa4265d1ff675cbb10c70a5580da639caf08e41a76215`; ngsp-methods.md `21a24ece3b4dcd8f8294e57a2167d51a9ecf9fa15e78e4a3105234b8cc1dd05c`
- Quotes:
  1. ngsp-interf.md, intro paragraph, offset 565–753: "In people who have hemoglobin variants such as HbS (sickle cell trait), some A1C tests give falsely high or low readings that can lead to the over-treatment or under-treatment of diabetes."
  2. ngsp-interf.md, interference table row, offset 2941–3000: "| Ortho-Clinical Vitros | No | No | No | No | Yes >5% HbF |"
  3. ngsp-interf.md, footnote "$", offset 3850–4027: "$ In the absence of specific method data, it can generally be assumed that immunoassay, boronate affinity and enzymatic methods show interference from elevated HbF levels (2,3)."
  4. ngsp-methods.md, header, offset 761–815: "the certificate of \ntraceability expires after 1 year." (line break inside the quote is in the capture)
  5. Cross-source link (same fixture, FC-1 capture) labcorp-001453.md, "Limitations", offset 6119–6215: "Specimens containing high amounts of HbF (>10 %) may result in lower than expected HbA1c values."
- Harm path: Metric 4548-4 ← AssayVersion(method X) — interference assertion {condition: elevated HbF, direction: lower, threshold >10 %} → a person with high HbF should use a method without HbF interference; the lab's AssayVersion is NOT_REPORTED beyond "Roche Tina Quant" → the graph can only say "risk not excludable".
- Answers Q-D4-11 (falsely high/low under condition), Q-D4-23 (Gen.3 package insert on the Labcorp page vs Gen. IV certification listed by NGSP — a candidate method-change event whose date is unknown).

## FC-3 — DunedinPACE publication: unstructured-to-entity (directive 3.8)

- URL / title: https://doi.org/10.7554/eLife.73420 · Belsky et al. 2022, "DunedinPACE, a DNA methylation biomarker of the pace of aging", eLife 11:e73420 · PMID 35029144 · PMCID PMC8853656
- Retrieved 2026-10-08 · tool: curl Europe PMC REST `https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8853656/fullTextXML` (snapshot = XML bytes); text version = tags stripped, whitespace collapsed (Python), offsets refer to that text
- sha256: snapshot epmc-PMC8853656.xml `dd24c21863993f6398cb4092d746217f145ed6080a75a950123cf0586d0200b7`; derived text epmc-PMC8853656.txt `d136cdf62f3a234b3606d928317977d3fe3884ccd2c6f5e75423fd1f4f5d3765`
- Quotes (Results section "DunedinPACE distills the 20-year pace of aging…", Discussion):
  1. offset 15086–15243: "Using Illumina EPIC array DNA methylation data from blood collected at age 45, we developed DunedinPACE to provide a surrogate for the 20-year Pace of Aging."
  2. offset 15796–15843: "The resulting algorithm included 173 CpG sites."
  3. offset 22035–22114: "For DunedinPACE, reliability was excellent (ICC = 0.96 [0.93–0.98]; Figure 2 )."
  4. offset 50852–50913: "It can be implemented in Illumina 450 k or in EPIC array data"
  5. offset 51055–51141: "Code to compute DunedinPACE is publicly available on GitHub ( Corcoran et al., 2022 )."
- The 3.8 path to demonstrate: user question "Which platform and inputs does DunedinPACE need, and how reliable is it?" (CQ-DX-04, Q-D4-22) → chunks of the DocumentTextVersion found via MENTIONS(Algorithm "DunedinPACE") or vector index → Assertions: AlgorithmVersion(DunedinPACE, versionBasis PUBLICATION_VERSION) VERSION_OF Algorithm(DunedinPACE); requires input platform "Illumina EPIC or 450k methylation array" (predicate value, see research notes); `inputFeatureCount` 173 (property); OUTPUTS_METRIC Metric(pace of aging, years/year, unit `a/a`); reliability ICC 0.96 (a reliability assertion that CQ-DX-05 can consume) → SourceLocator (text-position selector, offsets above, exact quote) → SourceSnapshot (XML sha256 above). The verifier re-selects the same span by exact match on the derived text.
- Also answers Q-D4-06 by contrast with FC-9 (vendor "DunedinPACE™" without version or array).

## FC-4 — Epigenetic clock technical noise (disconfirmation)

- URL / title: https://doi.org/10.1038/s43587-022-00248-2 · Higgins-Chen et al. 2022, "A computational solution for bolstering reliability of epigenetic clocks: Implications for clinical trials and longitudinal tracking", Nature Aging · PMID 36277076 · PMCID PMC9586209
- Retrieved 2026-10-08 · tool: PubMed MCP `get_full_text_article` (Europe PMC `fullTextXML` returned only 150 bytes for this PMCID — readiness finding); snapshot = MCP JSON response bytes; text = `articles[0].full_text`
- sha256: snapshot pubmedmcp-PMC9586209.json `2344777949649a9bc2656192e62fcf0afc9c24925bf5b9612602d1ee208874cc`; text pubmedmcp-PMC9586209.txt `9aec0359d87ead2409cb19ab424fd1c83dc001bb2ece19a6253d156be85e639b`
- Quotes:
  1. Introduction, offset 630–760: "Technical variance generates surprisingly noisy methylation values when the same biological specimens are measured multiple times."
  2. Results "Technical noise reduces epigenetic clock reliability", offset 5383–5511: "The widely used Horvath1 multi-tissue clockshows a median deviation of 1.8 years between replicates, and a maximum of 4.8 years."
  3. same paragraph, offset 5512–5615: "For other clocks, median deviations range from 0.9 to 2.4 years and maxima range from 4.5 to 8.6 years."
  4. same section, offset 5922–6052: "The high reliability of GrimAge (ICC = 0.989) is related to its two-step calculationfrom 7 DNAm-based components, age, and sex ()."
- Disconfirmation pairing (claim side, from FC-9 captures): trudx-sample-report.txt offset 11197–11253 "Be sure to retest every 3 months to track your progress." and elysium-index-science.md offset 2021–2124 "A single sample processed repeatedly can result in epigenetic age estimates that vary up to nine years."
- Expected answer (CQ-DX-05 / Q-D4-05): for original CpG clocks, a between-test change smaller than the replicate deviation documented for that clock is "not established as a change"; the vendor pipeline has no published replicate study → "no reliability source for this pipeline". The verdict is an assessment, never a property of the clock.

## FC-5 — Non-invasive glucose smartwatches and CGM sensor recall (harm)

- URLs / titles: https://www.fda.gov/medical-devices/safety-communications/do-not-use-smartwatches-or-smart-rings-measure-blood-glucose-levels-fda-safety-communication · FDA — Do Not Use Smartwatches or Smart Rings to Measure Blood Glucose Levels: FDA Safety Communication; https://api.fda.gov/device/recall.json?search=product_description:%22FreeStyle+Libre+3%22&limit=3 · openFDA device recall records
- Retrieved 2026-10-08 · tools: Firecrawl CLI scrape (FDA page; found via Tavily CLI search); curl openFDA (no key)
- sha256: fda-smartwatch-glucose.md `a406e0fb4dca30ab1f1916e417146ea39be3a2a2343f875039db9b67e98edb8f`; openfda-recall-libre3.json `4a16676ef1ddb4c15725332f830ba0fb94715a0262fcce58b84cf905d81de6bc`
- Quotes:
  1. fda-smartwatch-glucose.md, header, offset 2260–2294: "**Date Issued: February 21, 2024**"
  2. offset 2748–2898: "The FDA has not authorized, cleared, or approved any smartwatch or smart ring that is intended to measure or estimate blood glucose values on its own."
  3. offset 3125–3277: "Taking too much of these medications can quickly lead to dangerously low glucose, leading to mental confusion, coma, or death within hours of the error."
  4. "Device Description", offset 4417–4494: "These smartwatches and smart rings do not directly test blood glucose levels."
  5. openfda-recall-libre3.json, record res_event_number 98049, `reason_for_recall` (first match offset 5786220–5786350): "Due to a manufacturing process issue that may cause carbon build up in the sensor that may result in incorrect low glucose results"
- Harm path: Claim (seller says "measures blood glucose") → Metric(blood glucose) measurement kind claimed MEASURED → regulator communication says no authorized device measures it → assessment "claimed measurement not authorized". Second branch: Device model (FreeStyle Libre 3 sensor REF 72081-01, UDI-DI 00357599818005, K212132) → recall event 2025-11-24 → affected metric "glucose (interstitial estimate)", direction "incorrect low". Answers Q-D4-08, Q-D4-09.

## FC-6 — Wearable metric definitions and unversioned algorithm changes

- URLs / titles: https://www.whoop.com/us/en/thelocker/2026-whats-new · WHOOP — What's new on WHOOP; https://cloud.ouraring.com/v2/static/json/openapi-1.41.json · Oura API Documentation 2.0 (OpenAPI 1.41); https://developer.apple.com/tutorials/data/documentation/healthkit/hkquantitytypeidentifier/heartratevariabilitysdnn.json · Apple HealthKit heartRateVariabilitySDNN; https://developer.whoop.com/api · WHOOP API reference; https://www.community.whoop.com/t/mg-firmware-50-30-3-0/1502 · WHOOP Community "MG firmware 50.30.3.0"
- Retrieved 2026-10-08 · tools: Firecrawl CLI scrape (WHOOP pages; changelog found via Tavily CLI); curl (Oura OpenAPI JSON, Apple doc JSON)
- sha256: whoop-2026-whats-new.md `d8e63d826d82836051f7884fe06adacb54203dc93a3fe34ae74666b9c29fc7ee`; oura-openapi-1.41.json `2f960162d81034e80d3028af7dcadf56469100730c2aefaed869656f5db8486e`; apple-hk-hrvsdnn.json `09d39d661cdb3262e6d91f76581a5d6b1e6ba926f241e9247d6271d1f11631a1`; whoop-api.md `ad0a088611cfa9022f17196af320d683db1b372f94c93dbd4c8c61d8969ab4aa`; whoop-community-fw.md `236deaf0694793d8da4ec2ef555d2f11521dfc0418f6667c101d1a032afdb7ce`
- Quotes:
  1. whoop-2026-whats-new.md, "February 25" entry, offset 18375–18467: "A new signal processing algorithm improves heart rate tracking across a range of conditions."
  2. whoop-2026-whats-new.md, "July 6" entry, offset 4448–4612: "WHOOP has a new heart rate algorithm that improves accuracy across activities, with the biggest gains in weightlifting, functional fitness, HIIT, cycling, and golf."
  3. oura-openapi-1.41.json, schema PublicSleepAlgorithmVersion, offsets 396957–396995 and 396997–397024: "v1 = original aka legacy aka OSSA 1.0," / "v2 = latest sleep algorithm"
  4. oura-openapi-1.41.json, PublicModifiedSleepModel.average_hrv, offset 370714–370758: "Average heart rate variability during sleep."
  5. apple-hk-hrvsdnn.json, discussion, offset 3411–3453: "HealthKit uses SDNN heart rate variability"; whoop-api.md, recovery example, offset 21528–21556: "\"hrv_rmssd_milli\": 31.813562"
  6. whoop-community-fw.md, first post, offset 1661–1767: "My MG just took a firmware update to 50.30.3.0 but I can not see what is fixed or addressed in the update."
- Expected answers: CQ-DX-09 — WHOOP heart rate (and Strain/Recovery downstream) changed algorithm on 2026-02-25 and 2026-07-06 with no version label → two AlgorithmVersions with versionBasis UNKNOWN pinned by change date; firmware 50.30.3.0 known only from community (asserter = forum member, not vendor). Oura sleep records carry v1/v2 per record. Q-D4-07 — Apple "HRV" = SDNN, WHOOP "HRV" = RMSSD (ms), Oura "average_hrv" method NOT_REPORTED → not comparable.

## FC-7 — Compound → mechanism → biomarker → test: nicotinamide riboside and NAD+ (cross-domain; harm branch)

- URLs / titles: https://doi.org/10.1038/s41467-018-03421-7 · Martens et al. 2018, "Chronic nicotinamide riboside supplementation is well-tolerated and elevates NAD+ in healthy middle-aged and older adults", Nat Commun 9:1286 · PMID 29599478 · PMCID PMC5876407; https://clinicaltrials.gov/api/v2/studies/NCT02921659 · CT.gov NCT02921659; https://www.jinfiniti.com/product/intracellular-nad-test · Jinfiniti — Intracellular NAD® Test
- Retrieved 2026-10-08 · tools: curl Europe PMC fullTextXML; curl CT.gov v2 API; Firecrawl CLI scrape (Jinfiniti; found via Tavily CLI search)
- sha256: epmc-PMC5876407.xml `dd620181966f862df7030f4bb7b09811befd90e8e67c2b94fc90f9c212664794` (derived text epmc-PMC5876407.txt `e954d92dafeffbeeb10f8468b6ff22925020af4f36afb8773798ae57646ad702`); ctg-NCT02921659.json `b723914eeecf73f7f217f05bcebed23b6996f16dfabaad66943bc132a41a4a5c`; jinfiniti-nad.md `edb294193347b80e72a64f5cf58eb2a9b419829e0982eeff43687b66255659b5`
- Quotes:
  1. epmc-PMC5876407.txt, Results, offset 15148–15317: "Oral NR supplementation effectively elevated levels of NAD + in PBMCs by ~60% compared with placebo (mean change = 6.2 pmol per mg protein; one-sided 95% CI (0.074, ∞))."
  2. epmc-PMC5876407.txt, Results, offset 14950–15056: "measurable in circulating peripheral blood mononuclear cells (PBMCs), but undetectable in plasma and urine"
  3. jinfiniti-nad.md, FAQ, offset 21098–21175: "This test measures NAD+ intracellularly, meaning inside your red blood cells."
  4. jinfiniti-nad.md, offset 11972–12167: "Jinfiniti’s clinical data — conducted on our own Vitality↑® NAD+ Booster — found that 85% of participants reached optimal NAD+ levels (40–100 μM) within 4 weeks when dosing was guided by testing."
  5. jinfiniti-nad.md, offset 4305–4443: "Jinfiniti pioneered NAD testing, established the reference ranges and guidelines and generated most of the NAD data relevant to consumers."
- Path for Q-D4-01: ChemicalSubstance NR (D1) → Mechanism "NAD+ biosynthesis / salvage" (D2; the D2 packet's NR muscle-biopsy fixture is the mechanism-side evidence) → Biomarker NAD+ (D4) measured in Study NCT02921659 as PBMC NAD+ by LC-MS, pmol/mg protein (D3 result; note NAD+ is not a registered outcome in the CT.gov record — registry/publication divergence) → Metric "NAD+ in PBMC (pmol/mg protein)" (no LOINC; BellLabs definition) vs Metric "intracellular NAD+ in RBC from finger-prick (μM)" → LabTest(Jinfiniti) → ComparabilityAssessment NOT_COMPARABLE (different compartment, unit, method; method NOT_REPORTED). Harm/conflict branch: the test issuer sells the supplement and set the "optimal" range (Q-D4-12, Q-D4-13).

## FC-8 — Trial outcome names clocks without versions

- URL / title: https://clinicaltrials.gov/api/v2/studies/NCT07220473 · ClinicalTrials.gov — "The Moody Longevity Trial: Tirzepatide to Slow Biological Aging" (UTMB; start 2026-02-27)
- Retrieved 2026-10-08 · tool: curl CT.gov v2 API (found via `query.outc=DunedinPACE`, 9 studies)
- sha256: ctg-NCT07220473.json `1e13e2648d7ca54c47be90f733b14eb348649a3c3c13c9387c36330126388a3f`; search result ctg-dunedinpace.json `869bd0e479c5f56b51ddc9900080bce47b22d444b13e4712bca65ace2546728d`
- Quotes:
  1. ctg-NCT07220473.json, primaryOutcomes[0].description, offset 4501–4664: "Change in biological age as measured by DNA methylation-based aging clocks (DNAmAge, DNAm PhenoAge, DNAm GrimAge, and DunedinPACE) following tirzepatide treatment."
  2. same record, primaryOutcomes[0].measure: "Change in DNA Methylation-Based Biological Age" (field value; locate by JSON pointer `/protocolSection/outcomesModule/primaryOutcomes/0/measure`)
- Expected answer (CQ-DX-04, Q-D4-14): four Algorithm families named; "DNAm GrimAge" unresolved between GrimAge (PMID 30669119) and GrimAge2 (PMID 36516495) → UNRESOLVED assertion with two hypotheses; "DNAmAge" ambiguous (Horvath 2013 or another) → not defaulted. Selector kind: JSON pointer (a locator kind D4 needs from the kernel).

## FC-9 — Vendor clock products vs publications (disconfirmation branch)

- URLs / titles: https://shop.trudiagnostic.com/products/truage-complete-epigenetic-collection · TruDiagnostic — TruAge™ Test; https://cdn.shopify.com/s/files/1/0269/3332/9974/files/ExampleAdvancedTruAge.pdf?v=1749717681 · TruDiagnostic — Advanced TruAge Report (sample); https://www.elysiumhealth.com/pages/science-behind-index · Elysium Health — The Science Behind Index
- Retrieved 2026-10-08 · tools: Firecrawl CLI scrape (pages; found via Tavily CLI); curl + `pdftotext -layout` (PDF)
- sha256: trudx-truage.md `d29bf7c63dfe09bd6d63cc5258df7c7d0cad36437bcdd1d77855a0661387a414`; trudx-sample-report.pdf `b5d7f9798de00dd73dd6f287f95876f0dce09cb085c701e630d99f14bd4f4ea1` (text `f9859cb6fa904885221789b422bf101de915907f31e4ccc42dc167c2d9b2c02f`); elysium-index-science.md `a342e35966b79ea09eb9eccb0f48274312baf9d4e7aab16d72e7ca36f290fed7`
- Quotes:
  1. trudx-truage.md, report list, offset 6228–6256: "Pace of Aging (DunedinPACE™)"
  2. trudx-truage.md, "Epigenetic Biomarkers™" card, offset 12885–12998: "Clinical biomarkers — proteins, metabolites and clinical measures — estimated directly from your DNA methylation."
  3. trudx-sample-report.txt, page 8 (DunedinPACE), offsets 11126–11195 and 11197–11253: "Your Rate of Aging will change based on your lifestyle interventions." / "Be sure to retest every 3 months to track your progress."
  4. elysium-index-science.md, offset 6107–6260: "Index is the most precise and reliable among published epigenetic age measures, achieving agreement across technical replicates within zero to 1.5 years."
- Expected answers: Q-D4-04 — TruAge reports DunedinPACE, OMICmAge, SYMPHONYAge with no version, array or lab named (the string "version" does not occur in the sample report); Q-D4-06 — vendor "DunedinPACE™" is a distinct AlgorithmVersion (versionBasis UNKNOWN) DERIVED_FROM the publication version (FC-3), relation asserted only as "names the publication"; Elysium cites the PC-clock paper (FC-4) for Index's reliability → whether Index is a PC clock is unresolved. Disconfirmation: Q-D4-05 via FC-4.

---

## Not yet captured (for the fixtures stage, if time allows)

- A real NGSP-certified lab's method-change notice with an effective date (would make CQ-DX-03 "before/after" concrete; none found on Labcorp/Quest public pages).
- Oura OSSA 2.0 Sensors paper (2021) and the 2024 Sleep Medicine validation (sciencedirect S1389945724000200) as publication-side versions for FC-6.
- The FDA-NIH BEST glossary (NCBI Bookshelf NBK338448) — blocked by reCAPTCHA for Firecrawl and curl; needed only for biomarker category vocabulary (D3 seam).

---

## Fixtures-stage outcome (A3, 2026-10-08)

- Used: FC-3 → `07-fixtures/dunedinpace-paper-unstructured`; FC-4 + FC-9 → `clock-noise-vs-retest-advice`; FC-5 → `noninvasive-glucose-cgm-recall`; FC-1 + FC-2 → `hba1c-two-labs-interference`; FC-7 → `nr-nad-compound-to-test`; FC-6 → `wearable-hrv-algorithm-changes`; new → `consumer-panel-and-blood-clock` (Labcorp 005009 + InsideTracker InnerAge 2.0).
- Not built as folders: FC-8 (NCT07220473 clock outcomes; the UNRESOLVED GrimAge/GrimAge2 case remains a good D3/D4 seam fixture for the synthesizer).
- Offsets in this file refer to the research-stage captures; four pages changed bytes on re-fetch (TruDiagnostic, Jinfiniti, WHOOP forum, InsideTracker blog). The fixture locators.yaml files are authoritative.
