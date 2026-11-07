# Fixture: metformin-exercise-harm (fixtures stage, A3, 2026-10-08)

- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6351883/fullTextXML
- title: Metformin inhibits mitochondrial adaptations to aerobic exercise training in older adults. Konopka AR et al., Aging Cell 2019;18(1):e12880. PMID 30548390 · PMCID PMC6351883 · DOI 10.1111/acel.12880 · trial NCT02552355
- retrieved: 2026-10-08
- snapshot digest: sha256:0db6113a1389bb9e7a0be7cfb90008a02f725c1ad0573fb925ae8d0bb10e1b32 (raw JATS XML); derived text jats-xml2txt/v1 sha256:17019badabe39e089c82f8c9043a26fbf971b5c991edda717b2065b8c4fc963f (over the UTF-8 LF text the offsets index; corrected in the adversarial review, the earlier digest covered CRLF bytes)
- kind: harm
- tool: curl → Europe PMC REST (`tool:europepmc-fulltext`); re-fetched 2026-10-08T21:42:08Z, bytes identical to the research-stage capture.

## Companion captures (same retrieval run)

| id | url | title | sha256 | tool |
| --- | --- | --- | --- | --- |
| S-chembl-mech-CHEMBL1431 | https://www.ebi.ac.uk/chembl/api/data/mechanism.json?parent_molecule_chembl_id=CHEMBL1431 | ChEMBL 37 mechanism records, parent CHEMBL1431 (metformin) | bc010bd9aac21551304d7bf334909658c6f843e3a023341cae655890b0670612 | curl (`tool:chembl-rest`) |
| S-ctgov-NCT02552355 | https://clinicaltrials.gov/api/v2/studies/NCT02552355 | ClinicalTrials.gov v2 record NCT02552355 (lead sponsor Colorado State University; hasResults true) | a2672ee2a974705352a7113bdec076e7e5401bb4a23b450e057d3e5bda941e20 | curl (`tool:ctgov-v2`); also read via the ClinicalTrials.gov MCP |

## Description

A randomized, double-blind trial in older adults (62 ± 1 years). Participants took metformin (titrated to 2000 mg/day) or placebo during 12 weeks of supervised aerobic exercise training. Metformin "abrogated the exercise-mediated increase in skeletal muscle mitochondrial respiration". The full text splits this by protocol: in the ADP-titration protocol AET significantly increased submaximal and maximal CI-linked respiration and Vmax with placebo, and metformin abolished those increases ("Metformin abolished the ~25% increase in maximal CI-linked respiration after AET"); in the SUIT1 protocol the within-placebo increase in CIP and CI+FAOP was only a non-significant trend (p = 0.07), while the change in CI+II&FAOP was greater with placebo than metformin (p < 0.05). All three facts are recorded (A-m-01, A-m-02 scoped to SUIT1, A-m-05 for the ADP titration; adversarial review). The respiration analysis had n = 24 (placebo) and 26 (metformin) of the 26 and 27 randomized (Figure 2 legend). The harm reading lives only in a kernel Assessment (effectDirection HARM on a D5 target) that cites the Assertions. No entity carries a harm property. ChEMBL records two mechanisms for metformin (complex I inhibitor; mitochondrial glycerol-3-phosphate dehydrogenase inhibitor), both on the salt CHEMBL1703 and rolled up to the parent; the fixture asserts `/mechanisms/0` (complex I) only. The paper calls complex I inhibition "a putative role", so the curated mechanism is shown beside the human measurement. The registry splits each group into two feeding arms that the paper pooled. That gives two IN_STUDY_ARM edges per context (cardinality zero_or_more since the check stage), and the dose of record is D3's InterventionComponent per arm (seam records IC-m-01/02), not a context field. The registry text of the "Placebo/Protein" arm also says metformin. Edges exercised: EXPOSED_TO with TESTED metformin + BACKGROUND exercise (D5 Intervention member), IN_STUDY_ARM, OBSERVED_IN_CONTEXT, AFFECTS_MECHANISM (derived, incl. a D5 Intervention modulator: AET → mitochondrial respiration is MIXED); predicate ATTENUATES_INDUCTION_OF.

Files: `locators.yaml` (23), `assertions.yaml` (5 assertions, 2 contexts, 1 adjudication, 1 seam Assessment, 2 D3 seam records, 2 derived edges), `intent.json`, `questions.md`.
