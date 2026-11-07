# Fixture dunedinpace-paper-unstructured - source

- kind: unstructured-to-entity
- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8853656/fullTextXML
- title: Belsky et al. 2022, DunedinPACE, a DNA methylation biomarker of the pace of aging, eLife 11:e73420 (Europe PMC JATS XML; PMID 35029144; DOI 10.7554/eLife.73420)
- retrieved: 2026-10-08
- snapshot digest: sha256:dd24c21863993f6398cb4092d746217f145ed6080a75a950123cf0586d0200b7
- tool: curl Europe PMC REST fullTextXML (no key)
- candidate: FC-3 in ../../_notes/fixture-candidates.md

## Description

Belsky et al. 2022 (eLife 11:e73420; PMID 35029144; PMCID PMC8853656; DOI 10.7554/eLife.73420), captured as Europe PMC JATS full-text XML. The fixture walks the 00-DIRECTIVE 3.8 path for one real document: the question 'which platform and inputs does DunedinPACE need, and how reliable is it?' (CQ-DX-04, Q-D4-22) is answered by finding chunks of the derived text (D9 Chunk, via the fulltext/vector index or Chunk -MENTIONS-> AlgorithmVersion), hopping Chunk -COVERS_LOCATOR-> SourceLocator <-HAS_EVIDENCE- Assertion, and verifying each locator against the snapshot bytes (sha256 of the XML; the derived text is re-made by the stated rule and re-selected by offsets and exact quote). It exercises OUTPUTS_METRIC (publication AlgorithmVersion -> Metric 'DunedinPACE pace of aging'), QUANTIFIES (Metric -> Biomarker 'pace of biological aging') and the publication side of DERIVED_FROM_ALGORITHM_VERSION (DunedinPACE -> its predecessor DunedinPoAm; the vendor -> publication side is in ../clock-noise-vs-retest-advice). Quotes are short excerpts of a CC0 article.

## Snapshots

### S1 `snap-epmc-xml`

- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8853656/fullTextXML
- title: Belsky et al. 2022, DunedinPACE, a DNA methylation biomarker of the pace of aging, eLife 11:e73420 (Europe PMC JATS XML; PMID 35029144; DOI 10.7554/eLife.73420)
- retrieved: 2026-10-08 (2026-10-08T17:39:00-04:00)
- snapshot digest: sha256:dd24c21863993f6398cb4092d746217f145ed6080a75a950123cf0586d0200b7 (285200 bytes, application/xml, RAW_BYTES)
- derived text: sha256:d136cdf62f3a234b3606d928317977d3fe3884ccd2c6f5e75423fd1f4f5d3765 (155800 chars) by python: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', xml_utf8))) (tags -> space, entities unescaped, whitespace runs -> one space, no strip)
- tool: curl Europe PMC REST fullTextXML (no key)
- source kind / genre: API / PEER_REVIEWED_PUBLICATION
- research-stage capture: identical (re-fetch returned the same bytes)

## Citation

https://doi.org/10.7554/eLife.73420 · Belsky DW et al., 'DunedinPACE, a DNA methylation biomarker of the pace of aging', eLife 2022;11:e73420 (PMID 35029144, PMCID PMC8853656) · retrieved 2026-10-08 via https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8853656/fullTextXML
