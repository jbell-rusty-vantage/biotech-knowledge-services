# Fixture madrigal-maestro-nash-topline-8k — source

- url: https://www.sec.gov/Archives/edgar/data/1157601/000119312522307935/d423141d8k.htm
- title: Madrigal Pharmaceuticals, Inc. Form 8-K, Date of Report December 19, 2022 (Items 7.01, 8.01): MAESTRO-NASH topline results (accession 0001193125-22-307935)
- retrieved: 2026-10-08
- snapshot digest: sha256:41658369e5dfdec68371222e9d10dd46128991b965909913d1836f2128fa4694 (h2t-v1 projection = snapshot identity, contentHashBasis NORMALIZED_TEXT; reproduced by a re-fetch on 2026-10-08). The raw HTML bytes, sha256:fea923127626521e465d528b3bcca911fba9c9626d1bd20d74434f0add314d21, are session-specific: sec.gov injects a per-client `<script src>` path, so a re-fetch gives other raw bytes (024ba839… in the adversarial review) with the same projection.
- kind: unstructured-to-entity
- tool: curl to SEC EDGAR Archives with the User-Agent read in-shell from `EDGAR_IDENTITY` (`tool:sec-edgar-archives`), text projection by `_notes/tools/h2t_v1.py`; filing date and item codes from the EDGAR submissions API (`tool:sec-edgar-submissions`, https://data.sec.gov/submissions/CIK0001157601.json, sha256:6b23ab5df12518ae53921769482dfaf108cc4336e22136b8f944aad7c0297860; selected by accession number, rule edgar-accession/v1); the MAESTRO-NASH registry record from ClinicalTrials.gov API v2 (`tool:clinicaltrials-gov-v2`, https://clinicaltrials.gov/api/v2/studies/NCT03900429, sha256:3cc365aad247c845bb0d55538bc1eace2c735d9b0b28634de35802f42843f45f, captured in the adversarial-review pass). The repo `edgartools` MCP server was not loaded in this session, so the public HTTP API was used (readiness finding).
- producedBy (fixture ids): mission `mission:ft-D13-fixtures`, run `run:ft-D13-madrigal-maestro-nash-topline-8k`; agents `agent:d13-event-linker` (event, clock, role and about assertions) and `agent:d13-frontier-curator` (ON_FRONTIER).

## Description

The sponsor's own current report announcing the Phase 3 MAESTRO-NASH topline results for resmetirom on 2022-12-19. It is the
directive 3.8 effectiveness test for D13: a question about resmetirom's pivotal readout (Q-D13-05) enters through a chunk of
Item 8.01 (vector index or Chunk MENTIONS, D9; the chunks are cut by the named rule item-sections/v2 at the Item headings, a
hand-cut stand-in for D9's chunker with no embedding computed), reaches ten Assertions through the chunk's COVERS_LOCATOR
locators (READOUT occurred, readout stage TOPLINE, primary endpoints stated MET, what the event is about, who sponsors it, its
frontier, and the guided NDA filing window; the announcement assertion a02 cites l02, which lies in the Item 7.01 chunk c01),
and ends at the located spans on the snapshot above, which the builder re-selected from a fresh capture
(`_notes/tools/build_fixtures.py`; every locator `verified.result` is an exact match). It also creates the PLANNED
REGULATORY_SUBMISSION Event whose guided window "first half of 2023" is written as the half-open interval [2023-01-01, 2023-07-01)
at MONTH precision; the fixture madrigal-pdufa-to-accelerated-approval later records its occurrence (started 2023-06-30, completed
2023-07-17) and so exposes a computed guidance slip. The filing date (SourceSnapshot.publishedAt, 2022-12-19) is document time,
not an Event clock.

Exercises: ON_FRONTIER (READOUT → frontier:mash-fibrosis-resolution, vocab 0.2.0, milestone ms:pivotal-readout; and the Study
side, D3 Study MAESTRO-NASH → the same frontier from its registry record, vocab 0.2.1), INVOLVES
(Madrigal SPONSOR of the readout, APPLICANT of the planned submission); predicate-only EVENT_OCCURRED, EVENT_ANNOUNCED,
EVENT_SCHEDULED, EVENT_ABOUT (resmetirom, MAESTRO-NASH NCT03900429), READOUT_STAGE, PRIMARY_ENDPOINT_STATEMENT.
