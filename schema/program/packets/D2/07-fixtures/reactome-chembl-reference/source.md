# Fixture: reactome-chembl-reference (fixtures stage, A3, 2026-10-08)

- url: https://reactome.org/ContentService/data/query/R-HSA-196807
- title: Reactome pathway "Nicotinate metabolism" (R-HSA-196807.8, Homo sapiens; Reactome database version 97)
- retrieved: 2026-10-08
- snapshot digest: sha256:dcb9f006696da212347945542f2ec9cf20e2afa337efdb99e4c147e5f024ed19
- kind: other
- tool: curl → Reactome ContentService (`tool:reactome-content-service`); database version read from https://reactome.org/ContentService/data/database/version (97) on 2026-10-08. Curated structural reference records (category "reference" in the model stage).

## Companion captures (same retrieval run)

| id | url | title | sha256 | tool |
| --- | --- | --- | --- | --- |
| S-reactome-ancestors-R-HSA-196807 | https://reactome.org/ContentService/data/event/R-HSA-196807/ancestors | Reactome event ancestors of R-HSA-196807 | 7b5291bc213956804ae31a1e9842ba598b4ee0a4cb399a973fb4e96bc8ea34aa | curl |
| S-reactome-participants-R-HSA-196807 | https://reactome.org/ContentService/data/participants/R-HSA-196807/referenceEntities | Reactome reference-entity participants of R-HSA-196807 (75) | 6fb2fb339bd8eee2fd9f906453297b7ae3cbfc09f33e645e18fda9be2032d395 | curl |
| S-reactome-R-HSA-165159 | https://reactome.org/ContentService/data/query/R-HSA-165159 | Reactome R-HSA-165159.10 MTOR signalling | e9a2d1a5b150a5f80750156526bf90487d7591c3a3bed08962e405f8b4dc9e00 | curl |
| S-reactome-participants-R-HSA-165159 | https://reactome.org/ContentService/data/participants/R-HSA-165159/referenceEntities | Reactome reference-entity participants of R-HSA-165159 (65) | 5a799c76ffed4706c2b8a3cbc4e56b673fde602365b2554078ab66bbface5fdc | curl |
| S-chembl-mech-CHEMBL413 | https://www.ebi.ac.uk/chembl/api/data/mechanism.json?molecule_chembl_id=CHEMBL413 | ChEMBL 37 mechanism record, CHEMBL413 (sirolimus) | d489e4f77fbebff09c1fe6e46dadbb980c95786cfcb48da7a2398659fe26d1fe | curl (`tool:chembl-rest`) |
| S-pubmed-36599349 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=36599349&retmode=xml | Hallmarks of aging: An expanding universe. López-Otín C et al., Cell 2023;186(2):243-278. PMID 36599349 · DOI 10.1016/j.cell.2022.11.001 | 4921f265511707dde7f02b8573ec05ce73e947c1e67b0d948da12cc8ef4ce37d | curl (`tool:pubmed-eutils`) |

## Description

Versioned authority records that give D2 its structural reference layer, with no evidence of an effect in people. Reactome supplies the pathway hierarchy (Nicotinate metabolism → Metabolism of water-soluble vitamins and cofactors → Metabolism of vitamins and cofactors, read from the ancestors endpoint) and participant lists. Those lists hold genes (NAMPT, NMNAT1, FKBP1A, MTOR) and D1 small molecules (NAD+, NAAD, nicotinamide riboside, and sirolimus as a listed participant of MTOR signalling). Each record carries its stIdVersion as `referenceRelease`. ChEMBL supplies the curated molecular mechanism of action for sirolimus (FKBP1A inhibitor). Together the two records show the chain "compound → molecular target → pathway" without a MechanismChain node. The 2023 hallmarks abstract seeds the BellLabs hallmark vocabulary for the curated PART_OF_MECHANISM mapping (BELLLABS_CURATED, written by a curator agent). Edges exercised: PART_OF_MECHANISM (authority hierarchy and curated hallmark mapping) and PARTICIPATES_IN (MolecularEntity → Mechanism and D1 ChemicalSubstance → Mechanism, with release), both asserted and recorded-only since the adversarial review (one authorizing Assertion per authority record: A-r-ref-01..14); AFFECTS_MECHANISM (derived from the ChEMBL Assertion, via participant FKBP1A).

Files: `locators.yaml` (18), `assertions.yaml` (19 reference entities, 14 asserted reference edges with 14 authorizing Assertions, 1 mechanism Assertion, 1 adjudication, 1 derived edge), `intent.json`, `questions.md`.
