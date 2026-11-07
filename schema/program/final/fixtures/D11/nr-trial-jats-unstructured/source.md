# Fixture nr-trial-jats-unstructured — source

- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5876407/fullTextXML
- title: Martens CR, Denman BA, Mazzo MR, et al. "Chronic nicotinamide riboside supplementation is well-tolerated and elevates NAD+ in healthy middle-aged and older adults." Nat Commun 2018;9:1286 — PMID 29599478 · PMCID PMC5876407 · DOI 10.1038/s41467-018-03421-7 · trial NCT02921659 (JATS full text, CC BY)
- retrieved: 2026-10-08
- snapshot digest: sha256:dd620181966f862df7030f4bb7b09811befd90e8e67c2b94fc90f9c212664794
- kind: unstructured-to-entity
- also: one-sided trial link (Q-D11-02), disclosure disagreement (Q-D11-08), kernel FIELD_NOT_REPORTED on a COMPLETE empty-result snapshot (PubMed [si])
- tool: `europepmc-fulltext-jats` via curl 8 (Git Bash), helper `bin/getf.sh` in scratch `ft/D11/`; 142,126 bytes, RAW_BYTES. Re-fetched in the fixtures stage at 2026-10-08T21:54:48Z; the sha256 equals the research capture of 21:07:40Z.

The paper is the 2018 randomized, placebo-controlled crossover trial of nicotinamide riboside chloride in healthy middle-aged and older adults (University of Colorado Boulder; material from ChromaDex). It is the D11 demonstration of the 00-DIRECTIVE 3.8 path on real bytes: the question "what material, form and dose did NCT02921659 administer?" enters through the Study (by its NCT identifier) or through the substance (by UNII 8XM2XT8VWI), follows the derived D9 `MENTIONS` edge to the chunk that holds Methods paragraph `Par30`, reaches the Assertions whose `SourceLocator` the chunk covers (`ADMINISTERS` InterventionComponent → NIAGEN material, 500 mg twice per day, salt form named), and ends on the locator's exact span in the JATS snapshot, which `build_locators.py` re-selected from a fresh capture (offsets in code points; the span keeps `<sup>®</sup>` and a U+2009 thin space, and a normalized form is stored beside it). The same fixture shows that the trial link exists only in the paper text: ClinicalTrials.gov lists no publication and a PubMed `[si]` search returns 0 (kept as a COMPLETE empty-result snapshot), and that the acknowledgements ("Study pills … and partial funding support were provided by ChromaDex, Inc.") and the competing-interests note ("The authors declare no competing interests.") are separate statements to compare. Quotes are short excerpts of a CC BY article.

Further sources of this fixture:

| url | title | retrieved | digest | tool |
| --- | --- | --- | --- | --- |
| https://clinicaltrials.gov/api/v2/studies/NCT02921659 | ClinicalTrials.gov API v2 record NCT02921659 | 2026-10-08 | sha256:b06d8ea18738c62200af055c2d57cf28b54251bf03c59db7b9795ec4614958a0 | ctgov-v2-api (curl) |
| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=NCT02921659%5Bsi%5D&retmode=json | PubMed esearch `NCT02921659[si]` — count 0 (authoritative empty result, kept) | 2026-10-08 | sha256:d6564b024587c2a0c3aac5fd24b0ae9091255596d9aeb019f5ab1a0c2bcad7ad | ncbi-eutils-pubmed (curl) |
| https://pmc.ncbi.nlm.nih.gov/tools/idconv/api/v1/articles/?ids=29599478&format=json&tool=bellLabs-schema-research | PMC ID Converter record (PMID ↔ PMCID ↔ DOI, bridge B01) | 2026-10-08 | sha256:63af8179a2362dab71e1730fa69a53eb7b850a6df3e30a73673814b1e1a69818 | pmc-idconv (curl) |

Files: `locators.yaml` (4 snapshots, 23 locators, 6 D9 chunk spans), `assertions.yaml` (16 assertions, 3 RESOLUTION assessments, 1 CAPTURE_FIDELITY adjudication, the retrieval path and its Cypher), `intent.json` (biotech-knowledge-intent.v1, validated against `@bks/contracts` IngestionIntent), `questions.md`.
