# Fixture resveratrol-retraction — source

- url: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=19071213&retmode=xml
- title: Expression of the longevity proteins by both red and white wines and their cardioprotective components, resveratrol, tyrosol, and hydroxytyrosol. Free Radic Biol Med 2009;46(5):573-8 (PMID 19071213; doi 10.1016/j.freeradbiomed.2008.11.005; OpenAlex W2101407999) — MEDLINE record; retraction notice PMID 23016154 (doi 10.1016/j.freeradbiomed.2012.06.017)
- retrieved: 2026-10-08
- snapshot digest: sha256:88796be4f321d421f90164097cdff3acfa477ea380c25e2f2a1c974f803178ec (MEDLINE XML, 10,889 bytes; identical to the research-stage capture)
- kind: disconfirmation
- also: retraction / correction (packet direction), harm (claims that still rest on the retracted paper)
- tool: curl to NCBI E-utilities efetch (`tool:pubmed-eutils`; the first notice fetch hit the 3 req/s limit and was repeated), curl to Crossref REST (`tool:crossref-rest`, public pool), Crossref Labs (`tool:crossref-labs`; research-stage capture, see below), curl to OpenAlex (`tool:openalex`). Every quote re-selected from these bytes by `../../../../packets/D3/_notes/tools/build_fixtures.py`.
- producedBy (fixture-scoped ids, not real Mission Control runs): mission `mission:ft-D3-fixtures`, run `run:ft-D3-resveratrol-retraction`.

## All snapshots of this fixture

| ref | url | title | digest (raw bytes) | tool |
| --- | --- | --- | --- | --- |
| s-pubmed-19071213 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=19071213&retmode=xml | MEDLINE record of the article ("Retracted Publication", RetractionIn 23016154) | sha256:88796be4f321d421f90164097cdff3acfa477ea380c25e2f2a1c974f803178ec | tool:pubmed-eutils |
| s-pubmed-23016154 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=23016154&retmode=xml | MEDLINE record of the notice ("Retraction Notice", RetractionOf 19071213) | sha256:901a03db450b2c75a2fab5e8b6415279ac8c1ae7a7b9527c04d194e404804c2e | tool:pubmed-eutils |
| s-crossref-article | https://api.crossref.org/works/10.1016/j.freeradbiomed.2008.11.005 | Crossref work: `updated-by` = Retraction Watch `retraction` (record-id 4565), publisher `erratum` (same notice DOI), publisher self-referencing `retraction` 2009-03-01 | sha256:dee9cfe7654c67f96fb111edccea0794d1f3804777eb11b5f11a5c8d94f90609 | tool:crossref-rest |
| s-crossref-notice | https://api.crossref.org/works/10.1016/j.freeradbiomed.2012.06.017 | Crossref work of the notice (`update-to`, original author list) | sha256:d662ee78194227d7dae876d64fbe2bbe49b5ac861c0823489157d3f4207ab43f | tool:crossref-rest |
| s-crossref-labs | https://api.labs.crossref.org/works/10.1016/j.freeradbiomed.2008.11.005 | Crossref Labs work (Retraction Watch reasons, `asserted-by` ROR 005b4k264) | sha256:9b5920ea04544a01e0d555596dc2c2cf752ed861dda51d3d1494e1126598a102 | tool:crossref-labs |
| s-openalex | https://api.openalex.org/works/doi:10.1016/j.freeradbiomed.2008.11.005 | OpenAlex W2101407999 (`is_retracted: true`, cited_by_count 113) | sha256:441dbabb6ecae2fb1c8dfd810d5fa078916bc4cc0617f656b3038fd739502d34 | tool:openalex |
| s-pubmed-das | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=24669285,22414106,19071213,18821770,18789672,18045550,17125593,17015251,12003802&retmode=xml | MEDLINE records of nine papers co-authored by D. K. Das, each typed "Retracted Publication" with a RetractionIn notice | sha256:4c97685f578a4330ca49760f0026e4cc83dd1620ff451fe1053cca3f6ac01b07 | tool:pubmed-eutils |

Capture notes: the Crossref Labs re-fetch in this stage (no `mailto`) returned HTTP 403 `"message-type":"not-polite"`; the same-day research-stage capture is used (no personal e-mail address was sent in this stage — readiness finding in `08-sources-and-tools.md`). The OpenAlex bytes differ from the research capture (`sha256:7b7383…`) only by JSON key order inside `has_content`.

## Description

A longevity-mechanism claim — "Resveratrol increases longevity through SirT1, which is activated with NAD(+) supplied by an anti-aging enzyme PBEF." — stated in the abstract of a 2009 rat feeding study whose paper was retracted in 2012. Three asserters describe the same notice differently: NLM types it "Retraction Notice" with RetractionOf / RetractionIn links; Retraction Watch (carried by Crossref, record 4565) calls it a retraction and gives six reasons, whose first character is missing in the Crossref Labs payload ("alsification/Fabrication of Data"); the publisher's own Crossref deposit labels the same notice DOI an "erratum" and also deposits a self-referencing "retraction" dated 2009-03-01. OpenAlex only flags `is_retracted: true` and counts 113 citations where Crossref counts 97. The fixture stores one REVISES episode per asserter (two RETRACTION, one ERRATUM — kernel SourceRevisionKind values), records OpenAlex's flag as a kernel HAS_REVISION_STATUS Assertion (no notice, so no REVISES), holds the self-loop for review, derives `revisionStatus = RETRACTED`, and walks the kernel CQ-EV-05 path from the claim occurrence to the retraction. Eight further Das papers in PubMed, each with its own NLM retraction notice, feed Q-D3-03 (shared author with retracted work on the same compound).

## What this fixture exercises (assertion refs in `assertions.yaml`)

| relationship / node | exercised by |
| --- | --- |
| Publication (ARTICLE, RETRACTION_NOTICE) + kernel identifiers | pub-article, pub-notice, 8 more articles and 8 notices; a01–a05 PMID / DOI / OPENALEX, a06 DOI on the kernel Source (identifier join) |
| REVISES (RevisionEdgeProperties), one episode per asserter | a07 NLM RETRACTION, a08 Retraction Watch RETRACTION with its six reasons as `Assertion.qualifiers` (`reason:…`), a09 publisher ERRATUM ("erratum"), a10 publisher self-loop held (PROPOSED, not projected); a23–a37 (odd refs) NLM RETRACTION for the eight other Das papers |
| kernel HAS_REVISION_STATUS; literals (asserter disagreement, 05 predicateOnly) | a11 OpenAlex `is_retracted` → HAS_REVISION_STATUS RETRACTION on the DOI-carrying Source; a12 publisher "RETRACTED:" title (TITLE_AS_DEPOSITED); a13–a14 citation counts 97 (Crossref) vs 113 (OpenAlex) (CITED_BY_COUNT); a15–a16 publication date 2008-11-26 vs 2009-03-01 (PUBLICATION_DATE_STATED) |
| REPORTS_ON (Publication → Study) | a17 article → PRECLINICAL_IN_VIVO rat study, asserted by the Publication (not one author); the notice reports on none |
| AUTHORED_BY (predicate-only Assertion) | a18–a20 (NLM and publisher), a22–a36 (even refs) for the eight other papers; PMID 22414106 prints "D K" (resolution needed) |
| kernel CQ-EV-05 path | a21 claim occurrence (assertionKind CLAIM, OCCURRENCE_OF → Claim) about D1 resveratrol, asserted by the Publication, evidence on the PubMed snapshot; `kernelPathCQ_EV_05` in `assertions.yaml` |
