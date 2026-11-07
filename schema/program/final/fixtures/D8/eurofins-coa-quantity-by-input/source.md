# Fixture — a "Certificate of Analysis" whose only results are "Quantity by Input", plus a contrast COA

- url: https://m.media-amazon.com/images/I/614wRFVDiqL.pdf
- title: Eurofins Certificate of Analysis, report 3921057-0 (27-Dec-2022) — Orgabay Liposomal NAD 500 mg Supplement, lot LNA-199-0715
- retrieved: 2026-10-08
- snapshot digest: sha256:402d7c3b68b3f1e8c4f209e698bb004a905fab381e820584115ce1ff2e8c94e8 (raw PDF bytes, 92,542 B, 1 page; byte-identical to the research capture)
- kind: disconfirmation
- tool: curl 8.x (browser User-Agent; Amazon media CDN, i.e. a marketplace listing attachment); text by `pdftotext 4.00 -raw -enc UTF-8`; table rows checked on page renders (`pdftoppm`)
- contrast source: https://m.media-amazon.com/images/I/71N+Qjd8YlL.pdf · Certificate of Analysis — Organic Ashwagandha Extract, lot 2404101ORA (manufactured for Elite Source Products, Inc.) · retrieved 2026-10-08 · sha256:6499603381688ec5e71a52a1f036f99c4998be9e5645841d995552987131ef44 (raw PDF, 221,549 B)
- candidate: FC-3 in `../../../../packets/D8/_notes/fixture-candidates.md`

## What the fixture shows

"This lot has a COA" is disconfirmed as evidence of measurement. The Eurofins document is titled "Certificate of Analysis" and is issued by Eurofins Food Chemistry Testing Madison, Inc., but both result rows (NAD+ 500 mg/serving; trimethylglycine 250 mg/serving) are "Quantity by Input", and the method is "Quantity of ingredients verified through batch record review." Each row becomes a `QualityResult` with `resultBasis: INPUT_VERIFIED`, QUALITY_RESULT_FOR the `Lot` LNA-199-0715 (LOT_OF the product), MEASURES_ANALYTE the D1 substance or ingredient, ISSUED_BY Eurofins. The contrast COA shows the other bases on one page: ingredient amounts as in-process controls with no result column (`IN_PROCESS_CONTROL`, spec "≥ 450 mg"), the withanolide assay as a bare "Conforms" by HPLC (`STATED_WITHOUT_VALUE`), and lead measured by ICP-MS (`MEASURED`, 0.380 µg/serving against "≤ 0.5 µg / serving"). Two kernel QUALITY assessments (subkind D8.coa-classification) classify the documents from their rows. Corrections to research-stage findings: comparator and µ glyphs are not lost when `pdftotext` runs with `-enc UTF-8` (tool-log E4 is an encoding default, now fixed), and every text extraction puts the Eurofins result values one row above their labels, so those locators are TABLE selectors checked on the rendered page. The contrast COA names no issuer at all: its rows are asserted by the executor agent with a qualifier, and ISSUED_BY is absent (open question for QualityResult cardinality).

## Files

- `locators.yaml` — 2 snapshots, 21 locators (PDF_TEXT and TABLE).
- `assertions.yaml` — 18 entities, 15 assertions (QUALITY_RESULT_FOR ×5, MEASURES_ANALYTE ×5, ISSUED_BY ×2, LOT_OF ×2, 1 literal), 2 QUALITY assessments.
- `intent.json` — zod-valid (22 proposals).
- `questions.md` — Q-D8-05, CQ-AX-19, Q-D8-09.
