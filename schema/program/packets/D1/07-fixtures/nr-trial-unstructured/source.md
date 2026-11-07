# Fixture nr-trial-unstructured — source (directive 3.8 path)

- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6611812/fullTextXML
- title: Conze D, Brenner C, Kruger CL. "Safety and Metabolism of Long-term Administration of NIAGEN (Nicotinamide Riboside Chloride) in a Randomized, Double-Blind, Placebo-controlled Clinical Trial of Healthy Overweight Adults." Sci Rep 2019 — PMID 31278280 · PMCID PMC6611812 · DOI 10.1038/s41598-019-46120-z · licence CC BY (Europe PMC metadata)
- retrieved: 2026-10-08
- snapshot digest: sha256:ae7b5a420c48282b6604bd3c6e22ac818dcd0fc5a9fbaba0d45abf62e34661d2
- kind: unstructured-to-entity
- tool: tool:europepmc-rest (curl 8, JATS full-text XML); registry via tool:ctgov-api-v2
- fixture ids: mission:ft-D1-fixtures / run:ft-D1-nr-trial-unstructured (fixture ids, not live Mission Control ids)

## Companion snapshots (re-captured 2026-10-08)

| snapshot | url | tool | sha256 |
| --- | --- | --- | --- |
| Europe PMC core metadata for PMID 31278280 | https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:31278280%20AND%20SRC:MED&resultType=core&format=json | tool:europepmc-rest | a2310666246d927d02d7c96eebaf8b40f6e0461b2208c975473d4d4cc9654ede |
| ClinicalTrials.gov NCT02712593 (lead sponsor KGK Science Inc.; collaborator ChromaDex, Inc.) | https://clinicaltrials.gov/api/v2/studies/NCT02712593 | tool:ctgov-api-v2 | 120b38f3f0379b5319fbcacce9fa7d3c9f0d265b808a1be0a369d625ebc00e10 |
| ClinicalTrials.gov API v2 for the paper's printed id NCT0271593 — HTTP 404, body "NCT number NCT0271593 not found" | https://clinicaltrials.gov/api/v2/studies/NCT0271593 | tool:ctgov-api-v2 | 9707cbeb19b1c589560a481b948ce6a043990896f5c6402c517123bc0cbef04e |

The JATS bytes are identical to the research capture. The registry JSON's bytes differ from the research capture but its content is identical after key sorting (`jq -S`).

Adversarial review (2026-10-08): (1) the ORCID 0000-0002-4955-3226 formerly attached to the asserter node "Dietrich Conze" is in Charles Brenner's `<contrib>` in this JATS (Conze's contrib has no contrib-id) and resolves to Charles Brenner at `pub.orcid.org`; it was removed, and the fixture checker now requires a Person identifier to cite a locator that contains the person's surname. (2) The paper's study period (screening from 2016-03-01, last visit 2017-03-17, new locator `l-sr-period`) dates t03; the registry's start 2016-03-21 and completion 2017-04 (new JSON_POINTER locators `l-ctgov-start`, `l-ctgov-completion`) date t03b. (3) The 99 % purity is a D3 FIELD Assertion on the administered component (t02), not a MATERIAL_CONTAINS episode on the NIAGEN material.

## Description

A real trial paper (open access, CC BY) whose Methods name the administered material and doses in prose. The question Q-D1-08 ("are the printed 'mg NR' doses salt or cation mass?") cannot be answered from any structured field: the registry lists "Niagen™ 100/300/1000" with no description, and the paper prints "1000 mg NR". The answer sits in two adjacent sentences of the Methods › Study product section: each capsule held 100 or 250 mg **of NR chloride (99% purity)**, and the 1000 mg arm was four 250 mg capsules. The fixture walks the 3.8 path end to end: question → D9 chunk (the `<sec id="Sec6">` span 28532–30482, reached by the derived MENTIONS of "NR chloride" → ChemicalSubstance 8XM2XT8VWI, or by vector search) → COVERS_LOCATOR → the SourceLocators at code-point offsets 28662, 28769 and 29785 (exact quotes with U+2009 thin spaces and one U+00A0) → the Assertions that cite them → the snapshot bytes above; the verifier re-selects the same spans. An APPLICABILITY assessment states the dose basis (SALT_FORM) and a CALCULATED assertion converts 1000 mg salt to 878.0 mg NR cation per day. Disconfirmation branch: the paper's printed registry id "NCT0271593" returns HTTP 404; NCT02712593 matches first-posted date (2016-03-18 = the paper's "March 18, 2016"), product, collaborator and arms. A RESOLUTION assessment links paper and Study; the printed id is kept as printed.

## What it exercises

- 00-DIRECTIVE 3.8 path (assertions.yaml `retrievalPath`, with Cypher) — D9 Chunk / CHUNK_OF / COVERS_LOCATOR / MENTIONS seams, kernel Mention + RESOLUTION.
- `REALIZES_SUBSTANCE` NIAGEN → NR chloride (t01, abstract); FIELD `ADMINISTERED_MATERIAL_PURITY` 99 % on the D3 InterventionComponent (t02; the trial batch, so no D1 edge).
- D3 seam: `ADMINISTERS` InterventionComponent(1000 mg arm) → NIAGEN (t03 with the paper's study period, t03b with the registry's dates).
- APPLICABILITY (ap01), CALCULATED `rule:mw-ratio.v1` (c05, reusing the GSRS inputs of fixture nr-salt-moiety-us-canada), RESOLUTION r01–r03 (r03 = disconfirmation).
