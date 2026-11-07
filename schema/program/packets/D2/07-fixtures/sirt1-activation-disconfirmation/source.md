# Fixture: sirt1-activation-disconfirmation (fixtures stage, A3, 2026-10-08)

- url: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=20061378&retmode=xml
- title: SRT1720, SRT2183, SRT1460, and resveratrol are not direct activators of SIRT1. Pacholec M et al., J Biol Chem 2010;285(11):8340-51. PMID 20061378 · PMCID PMC2832984 · DOI 10.1074/jbc.M109.088682
- retrieved: 2026-10-08
- snapshot digest: sha256:ef3a2a1ca835bfbcbdac6e1805d5488ca7757cf1d5f5d8e75f40211f7834a381 (PubMed XML); derived text jats-xml2txt/v1 sha256:48ec71f494687584e60281a066e93e098f49bf89df43bfc25ea66f36bece390f (over the UTF-8 LF text the offsets index; corrected in the adversarial review, the earlier digest covered CRLF bytes)
- kind: disconfirmation
- landing page: https://pubmed.ncbi.nlm.nih.gov/20061378/
- tool: curl → NCBI E-utilities efetch (`tool:pubmed-eutils`); the publisher refuses full-text XML (PMC efetch) and Europe PMC returns HTTP 500 for this PMCID, so the snapshot is the abstract record (captureCompleteness COMPLETE for the record, abstract-only for the paper). Metadata cross-checked with the PubMed MCP `get_article_metadata` on 2026-10-08.

## Companion captures (same retrieval run)

| id | url | title | sha256 | tool |
| --- | --- | --- | --- | --- |
| S-pubmed-12939617 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=12939617&retmode=xml | Small molecule activators of sirtuins extend Saccharomyces cerevisiae lifespan. Howitz KT et al., Nature 2003;425:191-6. PMID 12939617 · DOI 10.1038/nature01960 | eefeb54674e35dac24d9259fe983e4d00762ddc130e01000f92a1d1f84b82ee5 | curl (`tool:pubmed-eutils`) |
| S-kegg-hsa04211 | https://rest.kegg.jp/get/hsa04211 | KEGG PATHWAY hsa04211 Longevity regulating pathway - Homo sapiens (flat file) | 29c83f0fe919a156cbac6685c418c5154730644d6d223a06cc616a60b7f39778 | curl (`tool:kegg-rest`); licence: academic use only |
| S-genage-SIRT1 | https://genomics.senescence.info/genes/entry.php?hgnc=SIRT1 | GenAge (HAGR) human gene entry SIRT1, Build 21 (28/08/2023) | 25258525786d32b5fa9fd2a52550710ce4c97d9581b9267a43d15b8c9a248e09 (HTML); text html2txt/v1 054ecc70761b48d536d0f660672cd3a8ecf32c0bf863a68dc72b5ab7756dacf0 | curl (`tool:hagr-genage`) |
| S-uniprot-Q96EB6 | https://rest.uniprot.org/uniprotkb/Q96EB6.json | UniProtKB Q96EB6 SIRT1_HUMAN (entry version 226) | 111c957ca5753874371e2c72467b5035c323aa13d6faf5c1d03057dea9445834 | curl (`tool:uniprot-rest`) |
| S-chembl-search-SRT1720 | https://www.ebi.ac.uk/chembl/api/data/molecule/search.json?q=SRT1720&limit=5 | ChEMBL molecule search "SRT1720" (CHEMBL257991 free base, CHEMBL4639328 HCl; pref_name null) | d572da700c1b074e7ab373a2c9b2039708d6305fdbfa58e85f06aa768968c208 | curl (`tool:chembl-rest`), adversarial review 2026-10-08 |
| S-pubchem-SRT1720 | https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/SRT1720/property/IUPACName,CanonicalSMILES,MolecularFormula/JSON | PubChem PUG REST name lookup "SRT1720" (CID 25232708, hydrochloride) | b98e6de526d32f055420376d4b91c0b8232df0f960b4efb171584f24b45f956c | curl (`tool:pubchem-rest`), adversarial review 2026-10-08 |

## Description

A mechanism step that was claimed, measured, and then tested again and rejected. Howitz et al. (2003) reported that resveratrol activates SIRT1. KEGG's longevity pathway still says "resveratrol, by activating SIRT1 activity". Pacholec et al. (2010, Pfizer) found that resveratrol and the SRT compounds activate SIRT1 only with a fluorophore-tagged peptide and not with native substrates, and that SRT1720 did not improve mitochondrial capacity in high-fat-diet mice. The disagreement is stored as separate assertions on separate evidence contexts. The context assay text tells the readings apart, and no CONTRADICTS edge links the sources. The derived resveratrol → protein deacetylation projection (via participant SIRT1) is MIXED. GenAge supplies the mechanism → lifespan Assertions that Q-D2-14 and Q-D2-26 read at query time (INFLUENCES_OUTCOME was demoted in the adversarial review): fly and worm homologue gain of function extends lifespan, which other studies have questioned, while moderate overexpression in mice does not extend lifespan, so the hop reads as mixed. KEGG is captured and asserted but held as PROPOSED behind the licence gate (11-open-questions item 11). The projection is MIXED with or without KEGG, and Howitz 2003 covers the reference-claim role if KEGG is refused. SRT1720 resolves in ChEMBL (CHEMBL257991) and PubChem (CID 25232708, HCl) by search and structure; the fixtures stage had tried a pref_name lookup only. Edges exercised: AFFECTS_MECHANISM (derived, direct and via participant), OBSERVED_IN_CONTEXT, EXPOSED_TO, PARTICIPATES_IN (asserted, UniProt GO annotation, A-s-ref-01).

Files: `locators.yaml` (14), `assertions.yaml` (8 assertions + 1 reference-edge Assertion, 7 contexts, 1 adjudication, 2 derived edges), `intent.json`, `questions.md`.
