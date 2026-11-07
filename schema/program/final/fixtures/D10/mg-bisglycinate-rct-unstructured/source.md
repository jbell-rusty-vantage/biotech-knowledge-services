# Fixture: magnesium bisglycinate RCT (unstructured to entity, directive 3.8)

- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC12412596/fullTextXML
- title: Magnesium Bisglycinate Supplementation in Healthy Adults Reporting Poor Sleep: A Randomized, Placebo-Controlled Trial (Schuster J, Cycelskij I, Lopresti A, Hahn A. Nat Sci Sleep 2025;17:2027-2040; epub 2025-08-30)
- retrieved: 2026-10-08
- snapshot digest: sha256:85a35d77b404a5ad50f415f298cb618b90f9aab23d8bcbeb032ebdd8f742343c
- kind: unstructured-to-entity
- tool: tool:europepmc-rest (curl, JATS full text), tool:ncbi-eutils (curl, PubMed XML); discovery tool:pubmed-mcp (research stage)
- ids: PMID 40918053 · PMCID PMC12412596 · DOI 10.2147/NSS.S524348 · trial registry DRKS00031494
- license: CC BY 4.0 (stated in the JATS `<license>` element); quotes kept to single sentences
- secondary source: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=40918053&retmode=xml · PubMed record · retrieved 2026-10-08 · sha256:e1afe765af770185d9a44f62b88c91deef2d7cc167bfa7adc02cbb42741ea6b7
- re-fetch: both URLs re-fetched at 2026-10-08T21:39:08Z; bytes identical to the research-stage captures (same sha256); every quote re-selected at the offsets in `locators.yaml`

## What the fixture shows

An open-access randomized, placebo-controlled trial (JATS XML with section ids) walked through the directive 3.8 path: a user question about magnesium and sleep reaches the chunk for the section "Primary Endpoint: Insomnia Severity Index" (`<sec id="s0003-s2002">`, raw offsets [52697, 56007)) by BM25 keyword retrieval over the 28 leaf sections (executed in the adversarial-review stage: rank 1, score 7.0378, for "Does magnesium bisglycinate reduce insomnia severity compared with placebo?"; a generic "Does magnesium help sleep, and which form?" ranks it 23 of 28, so a generic question needs the MENTIONS or vector hop, which are described, not executed); the chunk covers two located Assertions (the between-group ISI result, `loc-isi-fulltext`, and the effect size, `loc-effect-size`); each locator is a TEXT_QUOTE selector with prefix, suffix, offsets and quote hash into the snapshot whose sha256 is above; a CAPTURE_FIDELITY Adjudication records that the re-fetch re-selected the same span. The same assertions feed a draft compound-profile Report (`composed-body.txt`, sha256:149d7fe6…e74e) whose EVIDENCE_FOR row ASSESSES magnesium bisglycinate (the sleep Target is on the EVIDENCE_FOR section) and DERIVES_FROM the assertions, and whose OPEN_QUESTIONS section records the missing objective sleep measure and the glycine co-delivery (1523 mg/day) as `missingFactKeys`. A RETELLING_FIDELITY Assessment records that MEDLINE indexes this RCT with publication type "Case Reports" (D002363). Also captured: manufacturer of the trial material (Biogena, D6/D7 seam) and an author's disclosed role at a contract research organization (D7 seam).

## Files

- `locators.yaml` (generated from the re-fetch; 9 locators, 2 snapshots) · `assertions.yaml` (9 assertions, 2 adjudications, 1 assessment, 1 report, 3 report items, the retrieval walk) · `intent.json` (biotech-knowledge-intent.v1, validated with `@bks/contracts` IngestionIntent) · `questions.md` · `composed-body.txt` (fixture report body; not a publication)

Research is not medical advice.
