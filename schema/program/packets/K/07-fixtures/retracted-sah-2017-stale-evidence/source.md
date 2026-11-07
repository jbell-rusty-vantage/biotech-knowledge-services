# Fixture: Mol Med Rep 2017, retracted 2025: stale assertions, revision snapshot, late-arriving fact (harm)

- kind: harm
- url: https://www.spandidos-publications.com/10.3892/mmr.2017.7773
- title: SIRT1 activation by resveratrol reduces brain edema and neuronal apoptosis in an experimental rat subarachnoid hemorrhage model (Qian C et al., Mol Med Rep 2017;16(6):9627-9635; PMID 29039533; DOI 10.3892/mmr.2017.7773) — publisher article page
- retrieved: 2026-10-08
- snapshot digest: sha256:73e4400a94b52be87a7e30d4af881974f2c008011f0583eb3a54a86f8e3f74ae (live page `spandidos-mmr-2017-7773.html`, 215,575 bytes, revisionKind RETRACTION); earlier snapshot of the same Source: sha256:11dcaf3b6dcbc6da6a3e8dff36a1b9e980773d6366437550d72bf68b2220a71a (Internet Archive capture observed 2024-08-16T06:24:45Z, 149,484 bytes)
- tool: tool:http-capture (curl, browser User-Agent) for the live page; tool:wayback-archive (Internet Archive availability API + `id_` raw replay) for the 2024 capture; tool:ncbi-eutils; tool:crossref-rest
- re-fetch: captured 2026-10-08T22:09:18Z; the PubMed and Crossref records are byte-identical to the research-stage captures

| url | title | retrieved | snapshot digest | tool |
| --- | --- | --- | --- | --- |
| https://web.archive.org/web/20240816062445id_/https://www.spandidos-publications.com/10.3892/mmr.2017.7773 | archived article page (no retraction) | 2026-10-08 | see `snap-pub-page-2024` | tool:wayback-archive |
| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=29039533&retmode=xml | PubMed record of the article (PublicationType "Retracted Publication", RetractionIn PMID 40613201) | 2026-10-08 | sha256:d3f8f6832814df4256aa095f9fc35205b63f7415bc13aab57d351fc307f6711b | tool:ncbi-eutils |
| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=40613201&retmode=xml | [Retracted] … (retraction notice, PMID 40613201, DOI 10.3892/mmr.2025.13603, PMC12235689) | 2026-10-08 | sha256:2a10444d959f30a759e8fb991667b43c78b5340e7cb2c01ce1afed1ddeedbaec | tool:ncbi-eutils |
| https://api.crossref.org/v1/works/10.3892/mmr.2017.7773 | Crossref work record of the article (`updated-by`: retraction, source retraction-watch, record-id 68904, 2025-06-30) | 2026-10-08 | sha256:1235493964e0e94722dea735d983484a2e33cf87df1ad90453c8046116082901 | tool:crossref-rest |
| https://api.crossref.org/v1/works/10.3892/mmr.2025.13603 | Crossref work record of the notice (`update-to`) | 2026-10-08 | sha256:4458c21ac237fbaedf3a541a76940b7c2e3f8754eaaa2255a055371fe643f648 | tool:crossref-rest |

## What the fixture shows

A source that BellLabs would have cited before 2025 and that was retracted afterwards. One `Source` (the publisher page) has two `SourceSnapshot`s: the 2024 archive capture and the 2026 live capture, which records `revisionKind: RETRACTION` and `revisesSnapshotUid`. The occurrences extracted from the 2024 capture (the presupposition "The SIRT1 activator resveratrol (RES)" and the speculation about prognosis in SAH patients) are not deleted and keep capture-fidelity status ACCEPTED (the authors did write them); Q-K-10 lists them as stale, and the evidence report of `../resveratrol-sirt1-evidence-mission` that cites the presupposition is flagged by Q-K-17. Three authorities state the retraction, each as its own `HAS_REVISION_STATUS` Assertion: Retraction Watch via Crossref (valid from 2025-06-30, stated), NLM via PubMed (2025-07-04, the notice's ArticleDate) and the publisher (page banner "Retraction in:", undated). BellLabs records all three on 2026-10-08: a late-arriving fact whose valid time precedes its recorded time (CQ-TM-02). Live PubMed web pages could not be captured by curl, Firecrawl or Tavily (cookie / JavaScript challenge), and the Internet Archive CDX endpoint was intermittently offline; the E-utilities XML and the publisher page carried the evidence.

## Files

- `locators.yaml`: 6 snapshots, 11 locators (TEXT_QUOTE, JSON_POINTER) (generated)
- `assertions.yaml`: 1 Claim, 5 assertions (2 stale occurrences, 3 revision statuses), 1 re-anchor adjudication, the timeline
- `intent.json`: biotech-knowledge-intent.v1 (validated): 2 edge.assert, 3 assertion.literal
- `questions.md`

Research is not medical advice.
