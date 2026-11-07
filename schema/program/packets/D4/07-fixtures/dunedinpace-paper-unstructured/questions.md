# Fixture dunedinpace-paper-unstructured - questions answered

Kind: unstructured-to-entity (00-DIRECTIVE 3.8). The full path is in `assertions.yaml` → `retrievalPath`; chunk offsets are computed on the derived text (fixed 1,500-character windows, stride 1,300), so they are reproducible from the snapshot bytes.

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| CQ-DX-04 | DunedinPACE as published is AlgorithmVersion `hu:algorithm-version:dunedinpace-belsky-2022` (realization PUBLICATION_REFERENCE, versionBasis PUBLICATION_VERSION: the version is the publication, not a vendor string); it succeeds DunedinPoAm (DERIVED_FROM_ALGORITHM_VERSION, a01) | a01, l7-predecessor |
| Q-D4-22 | the free-text name "DunedinPACE" resolves through the fulltext index to the AlgorithmVersion and its Metric; chunks 11, 12, 16, 39 carry the answer spans | retrievalPath step 1-2 |
| CQ-DX-02 | the value is INFERRED (Metric.defaultResultKind; an algorithm output from DNA methylation, a surrogate for the 20-year Pace of Aging), produced by the publication AlgorithmVersion | a02, l1-epic-age45 |
| Q-D4-16 | Metric `dunedinpace-pace-of-aging` QUANTIFIES Biomarker `pace-of-biological-aging`; any other pace/age metric is a separate Metric of the same Biomarker, never merged into one series | a03, l8-biomarker |
| CQ-DX-05 (input) | reliability source for this version: test-retest ICC = 0.96 [0.93–0.98] on 36 replicate 450k blood samples — consumed by the change-detectability assessment in ../clock-noise-vs-retest-advice | a06, l3-icc, l3b-replicates |
| Q-D4-06 (publication side) | the publication version that a vendor "DunedinPACE™" is DERIVED_FROM; equivalence is not asserted here | ../clock-noise-vs-retest-advice b02 |

Expected inputs answer (CQ-DX-04 / Q-D4-22): "Illumina 450k or EPIC DNA methylation array data from blood; 173 CpG sites; trained on Dunedin Study blood at age 45; test-retest ICC 0.96 [0.93–0.98] (36 replicate 450k samples)", every clause cited to a locator whose bytes hash to the snapshot digest.
