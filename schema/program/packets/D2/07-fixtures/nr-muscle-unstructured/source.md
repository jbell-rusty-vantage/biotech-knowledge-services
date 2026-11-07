# Fixture: nr-muscle-unstructured (fixtures stage, A3, 2026-10-08)

- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6702140/fullTextXML
- title: Nicotinamide Riboside Augments the Aged Human Skeletal Muscle NAD+ Metabolome and Induces Transcriptomic and Anti-inflammatory Signatures. Elhassan YS et al., Cell Rep 2019;28(7):1717-1728.e6. PMID 31412242 · PMCID PMC6702140 · DOI 10.1016/j.celrep.2019.07.043 · trial NCT02950441
- retrieved: 2026-10-08
- snapshot digest: sha256:fb1c0ad79ed4a06783c98d48dd51e7ec0a9640f71d8233626bdbd7c245820a03 (raw JATS XML, 189,550 bytes); derived text jats-xml2txt/v1 sha256:f786011bd4898fb819d08921e3be6ba8787e38b794b6509fc14ed1902e48e130 (over the UTF-8 LF text the offsets index; corrected in the adversarial review, the earlier digest covered CRLF bytes)
- kind: unstructured-to-entity
- landing page: https://europepmc.org/article/PMC/PMC6702140
- tool: curl → Europe PMC REST (`tool:europepmc-fulltext`); re-fetched 2026-10-08T21:42:08Z, bytes identical to the research-stage capture. Metadata cross-checked with the PubMed MCP in the research stage.

## Companion captures (same retrieval run)

| id | url | title | sha256 | tool |
| --- | --- | --- | --- | --- |
| S-epmc-annot-PMC6702140 | https://www.ebi.ac.uk/europepmc/annotations_api/annotationsByArticleIds?articleIds=PMC%3A6702140&format=JSON | Europe PMC Annotations API, PMC6702140 (text-mined mentions) | 740de0f5570670c783f3a49a8dd815a658bc6904848982a50858f95902e6281e | curl (`tool:europepmc-annotations`) |
| S-ctgov-NCT02950441 | https://clinicaltrials.gov/api/v2/studies/NCT02950441 | ClinicalTrials.gov v2 record NCT02950441 (lead sponsor University of Birmingham) | 79e06200c9ddbe0d461add746395259ea3995ddfee7f16bf235ee5b2c17fdf48 | curl (`tool:ctgov-v2`) |

## Description

A placebo-controlled crossover trial in 12 aged men (1 g nicotinamide riboside per day for 21 days) that measured several steps of the marketed NR mechanism story in human muscle: the NAD+ metabolome (NAAD up, NAD+ unchanged), muscle protein acetylation (no change, the sirtuin step), mitochondrial respiration (no change) and serum cytokines (IL-6 down vs baseline). It is the packet's directive-3.8 fixture: the question CQ-MX-03 reaches a chunk of the derived text (by MENTIONS or vector search), then the Assertion A-nr-01 built from that span, its TEXT_QUOTE locator L-nr-01 (offsets 20866–21004), the snapshot bytes above and a deterministic CAPTURE_FIDELITY Adjudication. Europe PMC's own text-mined mentions for the same sentence are included to show why MENTIONS is never evidence (NR → NorRed, NAD+ → a wrong ChEBI term). Edges exercised: OBSERVED_IN_CONTEXT, EXPOSED_TO {TESTED}, IN_STUDY_ARM, AFFECTS_MECHANISM (derived, incl. via-participant through `../reactome-chembl-reference`).

Files: `locators.yaml` (14 locators), `assertions.yaml` (6 assertions, 2 contexts, 1 adjudication, 1 D3 seam record, 3 derived edges, the 3.8 walk), `intent.json` (valid biotech-knowledge-intent.v1; gaps listed in its notes), `questions.md`.
