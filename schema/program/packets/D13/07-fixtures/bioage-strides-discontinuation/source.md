# Fixture bioage-strides-discontinuation — source

- url: https://ir.bioagelabs.com/news-releases/news-release-details/bioage-labs-announces-discontinuation-strides-phase-2-clinical
- title: BioAge Labs Announces Discontinuation of STRIDES Phase 2 Clinical Trial Evaluating Azelaprag in Combination with Tirzepatide for the Treatment of Obesity (press release, December 6, 2024)
- retrieved: 2026-10-08
- snapshot digest: sha256:540f223f57643c498460d8aefa22212b2732d39b16913e2fac03e6a5e647b2f6 (Tavily extract raw_content saved as UTF-8 LF markdown; identical text to the research-stage capture sha256:37feb9da…, which was saved with CRLF line endings)
- kind: harm
- tool: `tvly extract --json` (`tool:tavily-extract`, CLI 0.1.5 with `PYTHONIOENCODING=utf-8 PYTHONUTF8=1`), curl to ClinicalTrials.gov API v2 (`tool:clinicaltrials-gov-v2`), curl to the EDGAR submissions API (`tool:sec-edgar-submissions`), ICD-10 MCP `lookup_code` (`tool:icd10-mcp`) for the adverse-finding concept.
- producedBy (fixture ids): mission `mission:ft-D13-fixtures`, run `run:ft-D13-bioage-strides-discontinuation`; agents `agent:d13-event-linker`, `agent:d13-frontier-curator`.

## All snapshots of this fixture

| ref | url | digest (raw bytes) | note |
| --- | --- | --- | --- |
| s-bioage-release | (above) | sha256:540f223f57643c498460d8aefa22212b2732d39b16913e2fac03e6a5e647b2f6 | sponsor release, the only sponsor document |
| s-ctgov-nct06515418 | https://clinicaltrials.gov/api/v2/studies/NCT06515418 | sha256:54509cf0488ef76039a3ef4fbf80fea3cf4dc2c40116c5b8cfed7972644f61bc | overallStatus TERMINATED, whyStopped, lead sponsor BioAge Labs, Inc. (last update posted 2025-03-13) |
| s-biopharmadive-bioage | https://www.biopharmadive.com/news/bioage-azelaprag-tirzepatide-study-2-stop-obesity/734931/ | sha256:984ccb8fcc64102de5f5cb58e55b718cf026b8d1ced30b07681762dc99348320 | trade press by Gwendolyn Wu (the capture keeps the author's headshot); the Tavily capture drops the date line, publishedAt 2024-12-07 is from the page ("Published Dec. 7, 2024", meta sailthru.date) in a Firecrawl re-scrape of 2026-10-08 (same text as the research capture sha256:f454fea8…, CRLF there) |
| s-bioage-edgar-submissions | https://data.sec.gov/submissions/CIK0001709941.json | sha256:109128693bf2c070576916a511e843c3f978f6f336fc3894df67b8fefcfdd21f | no 8-K filed 2024-12-06..2024-12-31 (one Form 4 on 2024-12-20) |

## Description

The harm case: a safety signal on a longevity-adjacent frontier (muscle-preserving weight loss; azelaprag is an APJ agonist the
sponsor describes as preventing muscle atrophy) and the sponsor's response. The release discloses that 11 of 204 enrolled
subjects in the azelaprag groups had transaminase elevations without clinically significant symptoms (SAFETY_SIGNAL, with a
STATED_CASE_COUNT literal and an EVENT_ABOUT to ICD-10-CM R74.01) and that the STRIDES Phase 2 study is discontinued
(PROGRAM_DISCONTINUATION, scope TRIAL). RESPONDS_TO (discontinuation → signal) is projected from the registry's whyStopped
("discontinued due to observation of liver transaminitis", sponsor-entered) and corroborated by the CEO's "because it became
clear that the emerging safety profile …"; the lede's "after liver transaminitis … was observed" alone is temporal wording and is
recorded as a CONTEXT_ONLY negative test, the same rule as the financing fixture. The share-price fall is a journalist's report
(REPORTED_MARKET_MOVE, asserter BioPharma Dive), never a BellLabs market fact. The event exists as a press release plus a
sponsor-entered registry change with no 8-K, which is the corroboration gap Q-D13-22 measures: one origin (the registry text is the
sponsor's own entry), no authority record (adversarial-review pass: the same independence rule now applies to the retraction
fixture, where Retraction Watch is recorded as derived from the publisher).

Exercises: RESPONDS_TO (positive, corroborating, negative), INVOLVES (SPONSOR), ON_FRONTIER (ms:safety-signal, ms:setback),
EVENT_OCCURRED (PUBLICATION_PROXY basis), EVENT_ANNOUNCED, EVENT_ABOUT (compound, study, condition), STATED_CASE_COUNT,
DISCONTINUATION_SCOPE, STATED_REASON, REPORTED_MARKET_MOVE.
