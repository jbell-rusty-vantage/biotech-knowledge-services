# Fixture resveratrol-retraction-integrity — source

- url: https://api.crossref.org/works/10.1152/ajpheart.01012.2001
- title: Hattori R, Otani H, Maulik N, Das DK. "Pharmacological preconditioning with resveratrol: role of nitric oxide." Am J Physiol Heart Circ Physiol 2002;282(6):H1988-95 — PMID 12003802 · DOI 10.1152/ajpheart.01012.2001 — Crossref work record carrying `updated-by` retraction (source retraction-watch, record-id 54)
- retrieved: 2026-10-08
- snapshot digest: sha256:204eda45b9b835b7caa98e42829476a5ce42b846ed34e95df3cbd5d628896c29
- kind: disconfirmation
- also: harm (claims resting on a retracted source, Q-D11-05), tool rendition of the notice
- tool: `crossref-rest` via curl 8 (mailto polite pool); re-fetched 2026-10-08T21:54:50Z, sha256 equal to the research capture (21:08:11Z).

A 2002 paper reporting that resveratrol pharmacologically preconditions the isolated rat heart through nitric oxide was retracted on 1 June 2012 after "A research misconduct investigation at the University of Connecticut Health Center has determined that images appearing in Fig. 7 A of the paper contain instances of data fabrication." Three asserters state the retraction independently and each becomes its own D3 `REVISES` episode (notice Publication → article Publication, `revisionKind RETRACTION`): Retraction Watch through Crossref (`updated-by` on the article, `update-to` on the notice), NLM through PubMed (`PublicationType` "Retracted Publication", `CommentsCorrections RetractionIn` 22833916 and the reverse `RetractionOf` on the notice record), and the publisher's notice page. DOI and PMID are attached to both works and to the Sources that render them, so the renditions join by shared identifiers. The article's own abstract conclusion becomes a claim occurrence whose locator sits on the retracted record; the Q-D11-05 taint query lists it with the date we learned of the retraction. **The publisher notice is a tool rendition**: plain HTTP to journals.physiology.org returns a Cloudflare challenge (HTTP 403, `<title>Just a moment...</title>`, recorded as CaptureAttempt `ca-aps-notice-curl`, outcome FAILED / BOT_CHALLENGE), so its snapshot is Firecrawl's markdown (contentHashBasis NORMALIZED_TEXT). Two Firecrawl captures 43 minutes apart differ only in a random anchor id, so the rendition hash is not stable while the quoted spans are. Discovery tools (Firecrawl research index, PubMed MCP) return this paper without its retraction link (`_notes/tool-log.md` rows 35–36): the integrity check must read Crossref or MEDLINE XML.

Further sources of this fixture:

| url | title | retrieved | digest | tool |
| --- | --- | --- | --- | --- |
| https://api.crossref.org/works/10.1152/ajpheart.zh4-0450-retr.2012 | Crossref work record of the notice ("Retraction", `update-to` the article) | 2026-10-08 | sha256:351ef651ee5d65dc8ebb1ec365593bfdc41c0176d7711dadf477a0a69a8a0e51 | crossref-rest (curl) |
| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=12003802&retmode=xml | PubMed record 12003802 (Retracted Publication; RetractionIn 22833916) | 2026-10-08 | sha256:c67eb0479a314f26041c83b2ba2a54f7d4e0e9633637e72f2229813e342e9ce9 | ncbi-eutils-pubmed (curl) |
| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=22833916&retmode=xml | PubMed record 22833916 (Retraction Notice; RetractionOf 12003802; PubDate 2012 Jun 01) | 2026-10-08 | sha256:edaad69b7959f554e05ac8f2ca4d965dec8aea3f47f7c1464938e37a8d5fe292 | ncbi-eutils-pubmed (curl) |
| https://journals.physiology.org/doi/10.1152/ajpheart.zh4-0450-retr.2012 | Retraction, Am J Physiol Heart Circ Physiol 302: H2446, 2012 — **tool rendition** (Firecrawl markdown, scrape id 01a11d83-538b-755d-9e38-01c56ae69e46) | 2026-10-08 | sha256:3f85905f6a3bc8527f88bce6284bec97b7603f43edb6ef1a1ed523521fa5b4aa (markdown; research rendition sha256:ad4d8fcaed034959d81baf3d7ea37abdbc12aca65b7aab1969f954188a58c0b8) | firecrawl-cli 1.23.1 |
| https://journals.physiology.org/doi/10.1152/ajpheart.zh4-0450-retr.2012 | same page by curl: Cloudflare challenge, HTTP 403 (failed attempt, no snapshot) | 2026-10-08 | sha256:4e1c452ee099707e1c32980e74e68918be37dbb8f13ec7c07a9a59862f6620d6 (challenge page) | curl 8 |

Uid compatibility: same node and edge names as `final/fixtures/D3/resveratrol-retraction` (A4; PMID 19071213 of the same senior author): `Publication {publicationKind ARTICLE | RETRACTION_NOTICE}`, `REVISES` with `RevisionEdgeProperties {revisionKind, reasonsVerbatim}`, uids `hu:publication:pmid-<PMID>`.
