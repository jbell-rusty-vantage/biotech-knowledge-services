# Fixture eurofins-coa-quantity-by-input — questions answered

Assertion ids (`c01` …), QualityResult refs (`qr-…`) and assessments are in `assertions.yaml`; locators in `locators.yaml`.

| question | expected answer | rests on |
| --- | --- | --- |
| Q-D8-05 (is this "certificate of analysis" a measurement; per-row basis; who issued) | Eurofins report 3921057-0 (27-Dec-2022), issued by Eurofins Food Chemistry Testing Madison, Inc., for lot LNA-199-0715 of Orgabay Liposomal NAD 500 mg: **no measurement**. Row NAD+ "500 mg/Serving Size" and row trimethylglycine "250 mg/Serving Size" are both `INPUT_VERIFIED` — "Quantity of ingredients verified through batch record review." Document class INPUT_VERIFIED_ONLY (assessment `as-ef-coa-class`, method d8-coa-classification/0.1). Contrast COA lot 2404101ORA: ingredient amount `IN_PROCESS_CONTROL` (no value), withanolide assay `STATED_WITHOUT_VALUE` ("Conforms", HPLC), lead `MEASURED`; issuer not stated → class MIXED (`as-as-coa-class`). | c01–c06, c08–c13; `qr-*` resultBasis; assessments |
| CQ-AX-19 (what do independent measurements say vs label for my lot) | Lot LNA-199-0715: no lot-level measurement of NAD+ in the captured sources; the only document repeats the input amount. The answer must say "no measurement", not "500 mg confirmed". Lot 2404101ORA: no measured label-claim amount; lead 0.380 µg/serving measured. Neither tester is independent of the brand in a way the documents state (D7 financial-interest seam not populated here). | c01, c02, c08–c10 |
| Q-D8-09 (against which specification, set by whom, did it conform) | Lead, lot 2404101ORA: criterion "≤ 0.5 µg / serving" (`specComparator LTE` 0.5 µg; R-57 QuantityComparator), setter not stated (`specBasis NOT_STATED`), period not stated; result 0.380 µg/serving by ICP-MS; no verdict printed for the row (`statedVerdict NOT_STATED`) — an evaluated "within limit" would be a kernel QUALITY Assessment (D8.spec-conformance), never a stored flag. Withanolides: "≥ 2.5% Withanolides", stated verdict CONFORMS with no value. | c10, c13, c09; `qr-as-lead`, `qr-as-assay` |

## Verification

`tools/verify.py` (scratch) re-extracted both PDFs from their bytes with `pdftotext -raw -enc UTF-8`, matched both text hashes and re-selected 21 of 21 locators at their offsets. The TABLE locators for the Eurofins result cells were additionally checked against a page render, because both `-raw` and `-layout` place "500 mg/Serving Size" above the "NAD+" label.
