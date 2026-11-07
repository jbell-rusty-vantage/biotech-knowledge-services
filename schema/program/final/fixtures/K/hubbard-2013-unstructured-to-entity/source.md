# Fixture: Hubbard et al. 2013 full text, unstructured text to entities (00-DIRECTIVE 3.8)

- kind: unstructured-to-entity
- url: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=3799917
- title: Evidence for a Common Mechanism of SIRT1 Regulation by Allosteric Activators (Hubbard BP et al., Science 2013;339(6124):1216-1219; NIH author manuscript in PMC, JATS XML)
- retrieved: 2026-10-08
- snapshot digest: sha256:ced64cfd1261ed0f62b359d7278b9f5d2931f8f814025dba2e45f3f1d31b1c44 (`pmc-3799917.xml`, 51,695 bytes, raw bytes)
- tool: tool:ncbi-eutils (curl, `efetch db=pmc`); discovery tool:pubmed-mcp (research stage)
- ids: PMID 23471411 · DOI 10.1126/science.1231097 · PMCID PMC3799917 · NIHMS504463
- human page: https://pmc.ncbi.nlm.nih.gov/articles/PMC3799917/
- second source: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=23471411&retmode=xml · PubMed record of the same article · retrieved 2026-10-08 · sha256:7dbca2395e1bf0472c1f1fb2012c143c1897715738faa023bc7a3b77f40913a4
- re-fetch: both URLs re-fetched at 2026-10-08T22:09:18Z; bytes identical to the research-stage captures (same sha256); every quote re-selected by `scratch ft/K/fixtures/tools/gen_locators_k.py` (offsets in UTF-8 bytes and code points, unique with prefix/suffix)
- rights: NIH author manuscript (public access); quotes kept to single sentences or shorter

## What the fixture shows

A real full-text paper walked along the directive 3.8 path. A user asks "does resveratrol really activate SIRT1?"; the D9 chunk for JATS paragraph `P10` (bytes [21734, 22809)) is found through the derived MENTIONS projection (both `resveratrol` and `SIRT1` are linked there) or through the vector index; the chunk covers locator `loc-hub-e230k` (bytes [22067, 22213)), the TEXT_QUOTE span "The ability of SIRT1 to be activated by resveratrol was attenuated in one mutant that substituted a lysine for a glutamate at position 230 (E230K)"; that locator is the declared evidence of claim occurrence `a-hub-occ-e230k` (resveratrol → DIRECTLY_ACTIVATES → SIRT1, asserted by the paper's authors, OCCURRENCE_OF the refined Claim reported on in `../resveratrol-sirt1-evidence-mission`: the Glu230 dependence is the allosteric qualification); the locator sits on the snapshot whose sha256 is above; the CAPTURE_FIDELITY Adjudication re-selects the same bytes (expectedSelectedContentDigest = the locator's quoteHash). The debate sentence of paragraph `P3` ("However, the legitimacy of STACs as direct SIRT1 activators has been widely debated.") is CONTEXT evidence on the SUPPORT Adjudication, never an edge from the document to an entity. Surface forms are staged on their own one-word locators (no Mention node since the adversarial review) and resolved by RESOLUTION Assessments that cite the span (role CONTEXT), ASSESS the candidate and carry surfaceForm / normalizedForm / typeHint in facets; the accepted Assessment licenses the chunk's derived MENTIONS. Rendition trap: the abstract's last sentence occurs in both the PMC manuscript and the PubMed record (two Sources, one source family).

## Files

- `locators.yaml`: 2 snapshots, 7 locators, 3 D9 chunks with computed byte ranges and covered locators (generated)
- `assertions.yaml`: 1 claim occurrence, 2 staged surface forms, 2 RESOLUTION assessments (licensing the chunk's derived MENTIONS), 2 adjudications, the walk
- `intent.json`: biotech-knowledge-intent.v1 (validated with `@bks/contracts` IngestionIntent): 1 edge.assert, 2 mention.stage
- `questions.md`

Research is not medical advice.
