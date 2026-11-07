# Fixture lesne-2006-retraction — source

- url: https://www.nature.com/articles/s41586-024-07691-8
- title: Nature, "Retraction Note: A specific amyloid-β protein assembly in the brain impairs memory", Nature 631, 240 (2024), published 24 June 2024 (DOI 10.1038/s41586-024-07691-8; PubMed RetractionIn PMID 38914864); retracted article Lesné S. et al., Nature 440:352-7 (2006), DOI 10.1038/nature04533, PMID 16541076
- retrieved: 2026-10-08
- snapshot digest: sha256:9344328de8d70df9deb69c6099e7ad235bc21f52ba462755448dcad143700499 (Firecrawl markdown of the notice; differs from the research-stage capture only by a trailing newline)
- kind: disconfirmation
- tool: `firecrawl scrape --only-main-content` (`tool:firecrawl-scrape`; Tavily cannot fetch nature.com), curl to Crossref REST (`tool:crossref-rest`), curl to NCBI E-utilities efetch (`tool:pubmed-eutils`), Wayback availability API + id_ capture (`tool:wayback-archive`).
- producedBy (fixture ids): mission `mission:ft-D13-fixtures`, run `run:ft-D13-lesne-2006-retraction`; agents `agent:d13-event-linker`, `agent:d13-frontier-curator`.

## All snapshots of this fixture

| ref | url | digest (raw bytes) | note |
| --- | --- | --- | --- |
| s-nature-retraction-note | https://www.nature.com/articles/s41586-024-07691-8 | sha256:9344328de8d70df9deb69c6099e7ad235bc21f52ba462755448dcad143700499 | publisher notice |
| s-crossref-nature04533 | https://api.crossref.org/works/10.1038/nature04533 | sha256:c16a41f932272abe72657f723ed2ba33b11bc3856610886a2de0492ccf13fbe2 | `updated-by`: expression of concern 2022-07-14 (retraction-watch), retraction 2024-06-24 (retraction-watch, record 54364), retraction 2024-06-24 (publisher) |
| s-crossref-retraction-note | https://api.crossref.org/works/10.1038/s41586-024-07691-8 | sha256:60c30270212a8bef9a48e2243f3a2f4858b50962dc6cb17157a2da9ff0c40d45 | publisher name |
| s-pubmed-16541076 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=16541076&retmode=xml | sha256:673d519342b57ebda80152a59c4d5fcb960225e91c6c7a5f6165bc9658734ee3 | "Retracted Publication", RetractionIn PMID 38914864 |
| s-nature04533-wayback-2020 | https://www.nature.com/articles/nature04533 (archive http://web.archive.org/web/20200812221937/https://www.nature.com/articles/nature04533) | sha256:b9b53659a899ed9f1282f6ecd9809956618241d32b598f7bd543e8672569c1b1 | pre-revision snapshot, observedAt 2020-08-12T22:19:37Z; the id_ bytes did not reproduce on re-fetch (2026-10-08: 231,151 bytes, sha256 88986ab6…; same `<title>`, still no "retract"), so the stored artifact is the evidence |
| s-nature04533-current | https://www.nature.com/articles/nature04533 | sha256:3ba3d56c8dd52438bacf30ea6b6fbf8c5a69a325bb6d304e05dde26216b8e845 | revisionKind RETRACTION, revises the 2020 snapshot |

## Description

The disconfirmation case: the 2006 paper that introduced the Aβ*56 amyloid assembly was retracted on 24 June 2024 for image
manipulation, with one author dissenting. The kernel holds the record — the original article's Source has an archived
2020 snapshot without any retraction marker and a 2026 snapshot carrying "This article has been retracted", recorded as
`revisionKind RETRACTION` with `revisesSnapshotUid` → the 2020 snapshot — and D13 projects one RETRACTION Event only because the
frontier curator classifies it as a setback milestone on frontier:alzheimers-disease-modification, citing the same notice
locators. Two asserters state the same occurrence on one Event: the publisher (the notice's "Published: 24 June 2024" and its
own Crossref deposit, source `publisher`) and Retraction Watch (Crossref update source `retraction-watch`, record 54364). The
second is not an independent origin: Crossref documents that the Retraction Watch database "contains retractions gathered from
publisher websites" (S26), so the record carries `derivedFrom` the publisher and Q-D13-22 counts one origin (adversarial-review
pass). The kernel's per-authority HAS_REVISION_STATUS records (publisher, Retraction Watch, NLM via PubMed; kernel M6) are now in
the fixture on the original article's Source (check-stage open item 33).
INVOLVES records the publisher (PUBLISHER) and two authors (AUTHOR, with their stated stance as a qualifier). The earlier
expression of concern (2022-07-14) is metadata only. No CONTRADICTS edge is stored: contradiction of claims that rest on the
paper is a kernel SUPPORT Adjudication / D10 Assessment citing the notice locators with HAS_EVIDENCE role CONTRADICTS. No
RESPONDS_TO is written because the notice names no dated stimulus ("Concerns have been raised …").

Exercises: ON_FRONTIER (ms:setback), INVOLVES (PUBLISHER, AUTHOR ×2), EVENT_OCCURRED with two asserters (one derived), EVENT_ABOUT
(D3 Publication), STATED_REASON, kernel revision snapshot pair, kernel HAS_REVISION_STATUS per authority with derivedFrom origins.
