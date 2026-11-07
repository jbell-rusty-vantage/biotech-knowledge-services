# Fixture: interested-party claim occurrences and their retellings (harm: authority and independence)

- kind: harm
- url: https://www.activemotif.com/catalog/details/14022/resveratrol
- title: Resveratrol a SIRT1 (Sirtuin) activator (Active Motif catalog page, item 14022)
- retrieved: 2026-10-08
- snapshot digest: sha256:80e67aaf0884fbe002bd824d0a43af3fd09a3afcc856817ede9b44b1156376d1 (fixtures-stage capture, run R2); first capture sha256:a271f178bae756ff70a053908e64d30bcd71e2ec63bd055bb043274ba1c576b0 (research stage, run R1); markdown projection by Firecrawl sha256:0be57c968663ef6da9cb465051e01124bc04a1256c53b623e2e7a22892cd6f39
- tool: tool:http-capture (curl, browser User-Agent; raw HTML used for digests and offsets); tool:firecrawl-scrape (markdown projection, `--only-main-content`, maxAge 0); discovery tool:tavily-search, tool:tavily-extract (research stage)

| url | title | retrieved | snapshot digest | tool |
| --- | --- | --- | --- | --- |
| https://megaresveratrol.net/feeds/blog/resveratrol-sirtuins-longevity | Resveratrol and Sirtuins: Unlocking Longevity Benefits (MegaResveratrol blog, JSON-LD datePublished 2026-09-23T11:55:49Z) | 2026-10-08 | R2 sha256:73ab5671bfc724594743db664cd82b49a449e78c63cb7b3b0e89ed5bb7115040; R1 sha256:38ab3c5178349128fe45e5da65e0639f634c636816241dd0d264ffdfa15e40d4 | tool:http-capture |
| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=12939617&retmode=xml | Howitz et al. 2003 (the work Active Motif cites as ref 2) | 2026-10-08 | sha256:eefeb54674e35dac24d9259fe983e4d00762ddc130e01000f92a1d1f84b82ee5 | tool:ncbi-eutils |
| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=20061378&retmode=xml | Pacholec et al. 2010 (the work MegaResveratrol retells, linked as PMC2832984) | 2026-10-08 | sha256:ef3a2a1ca835bfbcbdac6e1805d5488ca7757cf1d5f5d8e75f40211f7834a381 | tool:ncbi-eutils |
| internal (private repository `Overton77/ai-engineer-knowledge-services`, commit 28c4422228826c41f92dd837f3c5f0b561471b3b; file last changed in bb4892b170cf84a5efb21d473d92fb9013f2c69c): https://github.com/Overton77/ai-engineer-knowledge-services/blob/28c4422228826c41f92dd837f3c5f0b561471b3b/catalog/verification-benchmarks/diagnostics-companies-pilot-v4/artifacts/case-input/gl-interested-comparison-source.json (local checkout `C:/Users/Pinda/Proyectos/aiengineer/ai-engineer-knowledge-services`) | verification.v1 benchmark case input (interested-party comparison) | 2026-10-08 | sha256:d678ff4a908ee4193b1574543f3def6ccb853950356e55453bfbf491e5c36e9c | local read (tool:ks-verification corpus) |
| internal: same repository and commit, …/case-input/gl-interested-comparison-mutated.json | its adversarial twin (transform interested_party_to_independent) | 2026-10-08 | sha256:ed620b7dfc8c6262b85bae31604024f8199070b19b60aa1e0ff6fd571bd41fc6 | local read |

## What the fixture shows

Interested parties restating the proposition tested in `../resveratrol-sirt1-evidence-mission`. Active Motif, which sells the reagent, states "Activates SIRT1 and increases longevity in yeast (ref 2)" and cites Howitz et al. 2003: a retelling (DERIVED_FROM the 2003 occurrence, basisKind CITED_FROM_PRIOR_WORK) that the cited work does support, in 2003, while the page omits the 2005 and 2010 disconfirmation and merges yeast Sir2 with human SIRT1 (RETELLING_FIDELITY assessment). MegaResveratrol, which sells resveratrol supplements ("Browse our full range of pharmaceutical-grade trans-resveratrol supplements online."), accurately retells Pacholec 2010: accuracy and interest are orthogonal, and the verifier still marks both pages' evidence `authority: PROMOTIONAL`, `independence: INTERESTED_PARTY` (on its Adjudications' edges; the occurrences' declared edges carry role and origin only). The page captures change between runs only in per-request tokens (CSRF token, Cloudflare script parameters), so the raw-byte digest changes while every quote re-anchors exactly: run R2 records new snapshots (SILENT_CONTENT_CHANGE) and corrects an R1 occurrence that had used the retrieval date as a publication proxy. The internal verification.v1 benchmark twin shows capture fidelity rejecting the same interested-party statement once it is mutated into "An independent clinical trial establishes …" (NOT_SUPPORTED, policy FAIL → REJECTED), while the faithful version is held for review (DIRECTLY_SUPPORTED, policy REVIEW → PROPOSED). The benchmark's evidence excerpt is rights-restricted and is not reproduced here; only its digest is cited.

## Files

- `locators.yaml`: 8 snapshots, 16 locators (TEXT_QUOTE on raw HTML and XML, JSON_POINTER into the benchmark inputs) (generated)
- `assertions.yaml`: 8 assertions (R1 and R2 occurrences, an offer, an identifier statement, the benchmark twin), 5 adjudications (2 added in the adversarial review for the brand's occurrences), 2 RETELLING_FIDELITY assessments
- `intent.json`: biotech-knowledge-intent.v1 (validated): the R2 writes (3 edge.assert, 1 identifier.attach); R1's writes are `../two-run-lineage/intent.json`
- `questions.md`

Research is not medical advice.
