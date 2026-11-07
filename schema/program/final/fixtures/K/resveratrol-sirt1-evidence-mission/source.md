# Fixture: "resveratrol directly activates SIRT1", vetting, evidence mission, evidence report (disconfirmation)

- kind: disconfirmation
- url: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=20061378&retmode=xml
- title: SRT1720, SRT2183, SRT1460, and resveratrol are not direct activators of SIRT1 (Pacholec M et al., J Biol Chem 2010;285(11):8340-8351; PMID 20061378; DOI 10.1074/jbc.M109.088682; PMCID PMC2832984) and three further PubMed records below
- retrieved: 2026-10-08
- snapshot digest: sha256:ef3a2a1ca835bfbcbdac6e1805d5488ca7757cf1d5f5d8e75f40211f7834a381 (`pubmed-20061378.xml`, raw bytes)
- tool: tool:ncbi-eutils (curl, `efetch db=pubmed retmode=xml`); discovery tool:pubmed-mcp (research stage)
- re-fetch: all four records re-fetched at 2026-10-08T22:09:18Z, byte-identical to the research-stage captures

| url | title | retrieved | snapshot digest |
| --- | --- | --- | --- |
| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=12939617&retmode=xml | Small molecule activators of sirtuins extend Saccharomyces cerevisiae lifespan (Howitz KT et al., Nature 2003; PMID 12939617; DOI 10.1038/nature01960) | 2026-10-08 | sha256:eefeb54674e35dac24d9259fe983e4d00762ddc130e01000f92a1d1f84b82ee5 |
| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=15684413&retmode=xml | Substrate-specific activation of sirtuins by resveratrol (Kaeberlein M et al., J Biol Chem 2005; PMID 15684413; DOI 10.1074/jbc.M500655200) | 2026-10-08 | sha256:6cc06a1b3791d87a75a2d24add303aba5697869dca3e6d4125b81f4c1ea0fe7d |
| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=20061378&retmode=xml | Pacholec et al. 2010 (above) | 2026-10-08 | sha256:ef3a2a1ca835bfbcbdac6e1805d5488ca7757cf1d5f5d8e75f40211f7834a381 |
| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=23471411&retmode=xml | Evidence for a common mechanism of SIRT1 regulation by allosteric activators (Hubbard BP et al., Science 2013; PMID 23471411; DOI 10.1126/science.1231097) | 2026-10-08 | sha256:7dbca2395e1bf0472c1f1fb2012c143c1897715738faa023bc7a3b77f40913a4 |

## What the fixture shows

The scientific loop of 00-DIRECTIVE 3.4 on one real proposition. Two seller pages (`../seller-claim-occurrences`, run R1) state "resveratrol activates SIRT1"; a VETTING Assessment gives disposition RESEARCH; an EVIDENCE_MISSION Activity (run R2) ASSESSES the Claim and tries to disqualify it from the primary literature: Howitz 2003 supports it (Km lowering in vitro), Kaeberlein 2005 qualifies it (substrate-specific: activation only with a fluorophore-tagged peptide, "no effect on binding and deacetylation of acetylated peptides lacking the fluorophore"), Pacholec 2010 denies it ("Taken together, we conclude that SRT1720, SRT2183, SRT1460, and resveratrol are not direct activators of SIRT1."), Hubbard 2013 supports it with a mechanism and a qualification (hydrophobic motifs, Glu230). The SUPPORT Adjudication records each span's role (SUPPORTS, QUALIFIES, CONTRADICTS, CONTEXT) and the verifier's authority/independence. The general Claim gets an EVIDENCE_REPORT with the verification.v1 verdict MIXED_OR_CONFLICTING; the narrower Claim "… when the substrate carries a hydrophobic motif" is a separate Claim linked by an EQUIVALENCE Assessment (`K.claim-relation`, conclusionCode REFINES, cached in `refinesClaimUid`) and gets its own report with SUPPORTED_WITH_QUALIFICATION. Independence is counted by source family: Howitz 2003 and Hubbard 2013 share three authors (Konrad T Howitz, Dudley W Lamming, David A Sinclair, all in the captured AuthorLists; corrected from "two" in the adversarial review), so the general report counts 3 families, the refined one 1. An EVIDENCE_SYNTHESIS Assessment records that count with its inputs (the occurrences and the retelling and refinement assessments). The disconfirming paper also reports off-target activity (a harm-relevant side finding for D5).

## Files

- `locators.yaml`: 4 snapshots, 11 locators (generated; loc-kaeb-native and loc-kaeb-invivo added in the adversarial review)
- `assertions.yaml`: 2 Claims, 6 assertions (5 occurrences), 3 assessments (VETTING, EQUIVALENCE, EVIDENCE_SYNTHESIS), 8 adjudications (2 SUPPORT, 6 CAPTURE_FIDELITY), 2 EVIDENCE_REPORTs
- `composed-body-general.txt`, `composed-body-refined.txt`: the two report bodies (fixture drafts; bodyDigest in assertions.yaml)
- `intent.json`: biotech-knowledge-intent.v1 (validated): the six R2 assertion writes; claims, assessments, adjudications and reports are not expressible in v1 (notes)
- `questions.md`

Research is not medical advice.
