# Fixture madrigal-pdufa-to-accelerated-approval — source

- url: https://www.sec.gov/Archives/edgar/data/1157601/000119312524068170/d788116d8k.htm
- title: Madrigal Pharmaceuticals, Inc. Form 8-K, Date of Report March 14, 2024 (Items 7.01, 8.01, 9.01; accession 0001193125-24-068170) and Exhibit 99.1 "Madrigal Pharmaceuticals Announces FDA Approval of Rezdiffra™ (resmetirom) …"; with the NDA submission 8-Ks (2023-06-30, 2023-07-17), the NDA-acceptance 8-K and Exhibit 99.1 (2023-09-13), the Q1 2024 results Exhibit 99.1 (2024-05-07) and openFDA Drugs@FDA NDA217785
- retrieved: 2026-10-08
- snapshot digest: sha256:a10314508b7f98d9f5f1f8e52ca60b59cd5ed7ce2d5580721cd9479eb03cc33b (approval 8-K, h2t-v1 projection = snapshot identity, contentHashBasis NORMALIZED_TEXT; session raw-HTML hash a2cdf28c…, not reproducible by re-fetch because sec.gov injects a per-client `<script src>` path)
- kind: other
- tool: curl to SEC EDGAR Archives (`tool:sec-edgar-archives`, User-Agent from `EDGAR_IDENTITY`), filing list from `tool:sec-edgar-submissions`, curl to openFDA drugsfda (`tool:openfda-drugsfda`), h2t-v1 projection; link adjudication expectations for `tool:verification-v1`.
- producedBy (fixture ids): mission `mission:ft-D13-fixtures`, run `run:ft-D13-madrigal-pdufa-to-accelerated-approval`; agents `agent:d13-event-linker`, `agent:d13-frontier-curator`.

## All snapshots of this fixture

| ref | url | session raw-bytes digest (not reproducible for EDGAR HTML) | h2t-v1 projection (snapshot identity for EDGAR HTML) | published |
| --- | --- | --- | --- | --- |
| s-mdgl-8k-2023-06-30 | https://www.sec.gov/Archives/edgar/data/1157601/000119312523179440/d502542d8k.htm | sha256:9a203d0332a52c2231a3ee40c12e760bcbeedcf039aaacc190ae73dd5cf93cb1 | sha256:6e72f14011ba7b7cc59f62eb06762dfac981d3793db03e10f9388f9470e1305e | 2023-06-30 |
| s-mdgl-8k-2023-07-17 | https://www.sec.gov/Archives/edgar/data/1157601/000119312523187698/d508608d8k.htm | sha256:287eab690be66257865c13f7e0db99a715c340aca2bc3b0a68426d3e1d23078e | sha256:d0a12946c92f4cdd7b17d6bb602bb71b626a1f4cc89381bbfca45df40a7ffcf4 | 2023-07-17 |
| s-mdgl-8k-2023-09-13 | https://www.sec.gov/Archives/edgar/data/1157601/000119312523234385/d475156d8k.htm | sha256:b4c2533a0f042cffe8c058ec5787048120ede1764a91c38cfb6b364ef71e0abc | sha256:8f58f7b02d47da79c6a3061dd7f0f6d2d19d0d1cddbaef83a7356a418772a2c5 | 2023-09-13 |
| s-mdgl-ex991-2023-09-13 | https://www.sec.gov/Archives/edgar/data/1157601/000119312523234385/d475156dex991.htm | sha256:ae8decfd67071b79acbdbe5dba3b49e03b75e67b3486fd0fb7a16e9cc0a65349 | sha256:699b9b1ba287dfbdfbf1305a7aaac88488a3465afee78d9d2260cb855fbb185b | 2023-09-13 |
| s-mdgl-8k-2024-03-15 | https://www.sec.gov/Archives/edgar/data/1157601/000119312524068170/d788116d8k.htm | sha256:a2cdf28c99a4c5b87ab9031a22bdb87abdde5e380b0d7d241e302d9b0b681d08 | sha256:a10314508b7f98d9f5f1f8e52ca60b59cd5ed7ce2d5580721cd9479eb03cc33b | 2024-03-15 |
| s-mdgl-ex991-2024-03-14 | https://www.sec.gov/Archives/edgar/data/1157601/000119312524068170/d788116dex991.htm | sha256:6b799adfbfcfde73131d1983d377d07dea47309d7c158a144286d28b4a687764 | sha256:07a6458a6f5c6eff41f8e8bd1b890d1e6ef8b3405c2631a2fdb6b21f751730ce | 2024-03-15 |
| s-openfda-nda217785 | https://api.fda.gov/drug/drugsfda.json?search=openfda.brand_name:%22REZDIFFRA%22&limit=1 | sha256:00ebeded2522cbfe637cca57a3b46d78012ac06db8a64840cbf9a99537d72645 | (JSON) | — |
| s-mdgl-ex991-2024-05-07 | https://www.sec.gov/Archives/edgar/data/1157601/000119312524132559/d828444dex991.htm | sha256:82e0ef5e5e9580082eb78823ced893bfb83aa9d2e1c2804b682454705357a956 | sha256:5ecdb29a2599f9ab058af4d89c2627c283ce3bbcedda7c36fe62954b43baa839 | 2024-05-07 |

Four of these were captured for the first time in this stage (the two submission 8-Ks, the acceptance 8-K cover, the Q1 2024
results exhibit); the others are byte-identical to the research-stage captures.

## Description

The readout → filing → acceptance → approval → launch chain for resmetirom (Rezdiffra), every step from a primary artifact.
PLANNED → OCCURRED twice: the acceptance release assigns the PDUFA goal date March 14, 2024 (EVENT_SCHEDULED [2024-03-14,
2024-03-15) DAY on a PLANNED APPROVAL Event), and the approval occurs on that day, asserted by two parties on one Event (the
sponsor's 8-K and the FDA's own Drugs@FDA record: submission ORIG-1 status AP, status date 20240314); the approval release says
the product is expected in the U.S. "in April" (PLANNED LAUNCH, [2024-04-01, 2024-05-01) MONTH) and the Q1 results release
says "In April 2024, product shipped and first patients received Rezdiffra" (OCCURRED, MONTH precision). The approval is
ACCELERATED with the stated contingency "Continued approval for this indication may be contingent upon verification and
description of clinical benefit in ongoing confirmatory trials" (predicate-only CONTINGENT_ON → MAESTRO-NASH). LEADS_TO is
written only where a span states the basis: readout → NDA submission ("The NDA is supported by the positive efficacy
results observed in our pivotal Phase 3 trial") and readout → approval ("The accelerated approval of Rezdiffra was based on
results from the Phase 3 MAESTRO-NASH trial"); submission → acceptance → approval → launch stay computed FOLLOWS. The
submission's occurrence ([2023-06-30, 2023-07-18), started inside, completed 16 days after the guided "first half of 2023"
window) supersedes the in-progress assertion and makes the guidance slip of Q-D13-11 computable.

Adversarial-review pass: the regulator and the applicant of the approval are no longer INVOLVES edges on the Event; the Event
points at the D8 record of the act (DOCUMENTED_BY_RECORD → Drugs@FDA NDA217785 ORIG-1), whose ISSUED_BY, ADDRESSED_TO and issuedAt
D8 owns. The acceptance and the launch gained their EVENT_ABOUT (primary subject, identity rule), and the PLANNED APPROVAL and
LAUNCH Events keep the identity keys minted from their scheduled windows.

Exercises: LEADS_TO, DOCUMENTED_BY_RECORD (→ D8 RegulatoryRecord), ON_FRONTIER (ms:first-approval, ms:launch), EVENT_SCHEDULED,
EVENT_OCCURRED (two asserters), EVENT_ANNOUNCED, APPROVAL_PATHWAY, DESIGNATION_TYPE (two asserters), CONTINGENT_ON,
JURISDICTION, EVENT_ABOUT, a claim occurrence (FIRST_OF_KIND_CLAIM) for Q-D13-17.
