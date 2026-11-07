# Fixture: dq-senescence-biomarker-path (fixtures stage, A3 with the D4 packet, 2026-10-08)

- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6796530/fullTextXML
- title: Senolytics decrease senescent cells in humans: Preliminary report from a clinical trial of Dasatinib plus Quercetin in individuals with diabetic kidney disease. Hickson LJ et al., EBioMedicine 2019;47:446-456. PMID 31542391 · PMCID PMC6796530 · DOI 10.1016/j.ebiom.2019.08.069 · trial NCT02848131
- retrieved: 2026-10-08
- snapshot digest: sha256:082579b077477d9807f52160acc1b39d64ab9f5571aead17aba7c1c613ed9fc8 (raw JATS XML); derived text jats-xml2txt/v1 sha256:7461e06e6ebdcb181c2a1ae632596f8bc7788b2cde5c06f30627e9573bb00396 (over the UTF-8 LF text the offsets index; corrected in the adversarial review, the earlier digest covered CRLF bytes)
- kind: other
- tool: curl → Europe PMC REST (`tool:europepmc-fulltext`); re-fetched 2026-10-08T21:42:08Z, bytes identical to the research-stage capture. Cross-domain path fixture (category "seam" in the model stage).

## Companion captures (same retrieval run)

| id | url | title | sha256 | tool |
| --- | --- | --- | --- | --- |
| S-ctgov-NCT02848131 | https://clinicaltrials.gov/api/v2/studies/NCT02848131 | ClinicalTrials.gov v2 record NCT02848131 "Senescence in Chronic Kidney Disease" (lead sponsor Mayo Clinic) | 43a4e7a23925156c9a04dfd25f288943d23e180e4f0fe1918bbe5f7276b404d5 | curl (`tool:ctgov-v2`) |
| S-quickgo-GO0090398 | https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/GO:0090398/complete | QuickGO GO:0090398 cellular senescence | 36579ec872f4feba012ce5a47e8b3f47a0d17b9850b4e5febbd67cc14b1ce881 | curl (`tool:quickgo`) |
| (D4 fixture) | https://www.jinfiniti.com/product/intracellular-nad-test | Intracellular NAD® Test (NR branch "test" end; captured by the D2 and D4 research stages, same sha256) | edb294193347b80e72a64f5cf58eb2a9b419829e0982eeff43687b66255659b5 | Firecrawl CLI (research stage); owned by D4 `nr-nad-compound-to-test` |

## Description

An open-label Phase 1 pilot. Nine people with diabetic kidney disease took a 3-day oral course of dasatinib (100 mg) plus quercetin (1000 mg), and were sampled 11 days after the last dose. Senescent-cell markers in abdominal subcutaneous adipose tissue (p16INK4A+ and SAβgal+ cells) and in skin epidermis decreased, and so did circulating SASP factors. The paper states which markers it reads as senescence. That one source covers the whole compound → mechanism → biomarker → test query pattern (Q-D2-03 / Q-D4-01). The hops are: D+Q → cellular senescence (D2 projection, human measured) → p16INK4A+ cells (D4 Biomarker via REFLECTS_MECHANISM, D4-owned) → an IHC Metric in the same compartment (UBERON:0014455) → no orderable test, only a research assay. The NR branch runs to the consumer blood NAD+ test in the D4 fixture, and the compartment check flags it DIFFERENT_COMPARTMENT. The combination is asserted with the regimen (D5 Intervention) as subject and both drugs as TESTED exposures. It is not projected onto either drug alone. Edges exercised: IN_STUDY_ARM, EXPOSED_TO (two TESTED, ordered), OBSERVED_IN_CONTEXT, AFFECTS_MECHANISM (derived, Intervention modulator), plus the D4 edges REFLECTS_MECHANISM and QUANTIFIES.

Files: `locators.yaml` (14), `assertions.yaml` (7 assertions incl. 2 D4-owned, 3 contexts, 1 adjudication, 2 D3 seam records, 1 derived edge, `crossDomainPath`), `intent.json`, `questions.md`.
