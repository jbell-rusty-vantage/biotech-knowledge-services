# Fixture — NMN excluded from the US supplement definition (2022-10-11), then not excluded (2025-09-29)

- url: https://downloads.regulations.gov/FDA-2023-P-0872-2754/attachment_1.pdf
- title: FDA (Human Foods Program) response to the NPA / ANH-USA citizen petition on β-NMN, Docket FDA-2023-P-0872
- retrieved: 2026-10-08
- snapshot digest: sha256:371a4b936e4cb7dcd5eb87837baa08612ccfb302c01863895e09c33aeb559dc4 (raw PDF bytes, 743,063 B, 26 pages, fetched 2026-10-08T21:38:50Z)
- kind: disconfirmation
- also: harm (a standing that was true as recorded in 2022 is superseded in 2025); bitemporal as-of replay in two ingestion steps
- tool: curl 8.x with browser User-Agent + `Referer: https://www.regulations.gov/` + `Accept: application/pdf` (plain curl gets 403; research stage fell back to Firecrawl); text by `pdftotext 4.00 -raw -enc UTF-8`
- second source: https://downloads.regulations.gov/FDA-2022-S-0023-0051/attachment_1.pdf · FDA letter re NDI 1259 β-NMN (Inner Mongolia Kingdomway), 2022-10-11 · sha256:6321a2bb36896f5d4a0f4037ca688532468e12739bc03eeb8ea37d9611ab5ad2 (raw PDF, 345,052 B; page 2 is an OCR text layer) · same tool
- third source (parser projection, kept for the correction below): same NDI URL via Firecrawl CLI 1.23.1 markdown · sha256:4f600af2e7d70242bc38fb213ca897f451c07b2ce5534f484dccde0c37be8f35 (NORMALIZED_TEXT; identical to the research capture)
- docket metadata: https://api.regulations.gov/v4/documents/FDA-2023-P-0872-2754 · sha256:f20364e08cc7b3dfec391eea256e0b64fe6a9b5b628fd51cf1df0718d5d37fd6; https://api.regulations.gov/v4/documents/FDA-2022-S-0023-0051 · sha256:5dd6548cab88481d503d2281d057e5cc5d6e686894265b4c5cad84c247765415 (regulations.gov API v4, public DEMO_KEY)
- identifier checks: https://clinicaltrials.gov/api/v2/studies/NCT05038488 · sha256:bab34b5909660fbf59beb01742ac8efccc99249c6506dd5b8e6c373413071060; …/NCT05040321 · sha256:0abadb797f5cf3e92eee82323c74c1de2043a51543ae40a7734d387ee23e56a4; …/NCT04817111 · sha256:ecd8140fd8ddf8b96d9256dbbcb75679640d3f4cfab54e7c3aa8fcb7f84497ed
- candidate: FC-1 in `../../../../packets/D8/_notes/fixture-candidates.md`

## What the fixture shows

One subject (β-NMN, D1), one jurisdiction, two `LegalStatus` nodes and three STATUS_OF episodes: EXCLUDED_FROM_DEFINITION valid from 2022-10-11 (step 1, open-ended, from the NDI 1259 response), then — when the 2025 citizen-petition response is ingested (step 2) — that episode is closed by `recordedTo`, a successor episode bounds it to [2022-10-11, 2025-09-29), and NOT_EXCLUDED_FROM_DEFINITION opens on 2025-09-29. STATUS_FROM links each status to the record that established or ended it; ISSUED_BY, ADDRESSED_TO (the notifier; the two petitioners) and CONCERNS cover the two records. The disconfirmation is double. (1) The 2022 "excluded, may not be marketed as a supplement" answer is superseded. (2) Two research-stage readings were wrong and are corrected from the document bytes: the response letter really prints "September 29, 2029" (a typo in the letter, not a parser error as tool-log E5 said) — the date of record, 2025-09-29, comes from the digital-signature timestamp and the docket's postedDate; and FDA's footnote does **not** mis-cite a trial — Firecrawl's projection printed NCT05040321 where the PDF text layer and the rendered page read NCT05038488, whose registry title matches FDA's citation exactly (new finding E6). Assertion n09 records the wrong parser reading and is expected to be REJECTED by verification against the PDF bytes.

## Files

- `locators.yaml` — 8 snapshots, 28 locators (PDF_TEXT with page, TEXT_QUOTE on the projection, JSON_POINTER on docket and registry records).
- `assertions.yaml` — 13 entities, 20 assertions (steps 1 and 2), 1 adjudication, 2 assessments, the bitemporal replay table.
- `intent.json` (step 1) and `intent-step2.json` (step 2, with `edge.close`) — zod-valid.
- `questions.md` — CQ-MF-02, Q-D8-01, CQ-AX-23, Q-D8-15, Q-D8-20.
