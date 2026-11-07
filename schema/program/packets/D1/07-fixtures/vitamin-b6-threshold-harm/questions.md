# Fixture vitamin-b6-threshold-harm — questions answered

Assertion ids refer to `assertions.yaml`. Research, not medical advice: thresholds are a regulator's scheduling and labelling rules, quoted as stated.

| question | expected answer (from this fixture) | answered through |
| --- | --- | --- |
| Q-D1-03 | Country Life P-5-P 50 mg: 34.2 mg/d vitamin B6 as pyridoxine equivalent at its maximum (1 tablet) — **not above** the AU 50 mg/d scheduling threshold (from 2027-06-01) but **above** the AU 10 mg/d warning-statement threshold (since 2022-03-01). EuroMedica Magnesium + P-5-P: 40 mg/d as declared (27.4 mg/d if the 10 mg is P5P mass) — same outcome (not above 50 under either reading, above 10 under either reading). A person's stack total is a query-time sum of these per-product values, never stored. | c06, c08, c09, c10a–c10d, d01, d02 |
| Q-D1-04 | Labels that list only "Pyridoxal 5-Phosphate", "pyridoxal 5-phosphate monohydrate" or "pyridoxine hydrochloride" contain vitamin B6: each substance COUNTS_TOWARD_NUTRIENT vitamin B6 (TGA list; ODS: six vitamers incl. the 5'-phosphate esters). TGA notes adverse-event reports show consumers miss B6 when the label gives only the chemical name. | b01–b04, s01 |
| Q-D1-02 | Country Life P-5-P 50 mg delivers 34.2 mg vitamin B6 (as pyridoxine) per serving and per maximum daily dose; the label's own 34 mg agrees (residual −0.23 mg). | c06, c07, c08 |
| CQ-PF-01 | Label 326829 carries two bases for one ingredient: 50 mg P5P "as named" and 34 mg vitamin B6 "as nutrient" (pyridoxine equivalent). Label 309443's "Vitamin B6 10 mg" with form P5P has an **unspecified** basis. | b11, b12, b14 |
| Q-D1-20 | Declared 34 mg vitamin B6 vs 50 mg P5P × 169.1782/247.1422 = 34.23 mg: consistent (check true, residual −0.23 mg). | c07 |
| Q-D1-28 | Evidence or thresholds stated for "vitamin B6" apply to P5P only through the nutrient-equivalence convention (COUNTS_TOWARD_NUTRIENT + the NUTRIENT_EXPRESSED_AS Assertion + rule:nutrient-equivalent.v1); GSRS gives P5P as its own active moiety, so there is no salt→moiety path from P5P to pyridoxine and moiety-level transfer is unsupported. | b07, b05, b01 |
| Q-D1-01 | Pyridoxine HCl (68Y4CF58BV) → pyridoxine (KV2JZ1BI6Z); P5P (F06SGE49M6) → itself. | b06, b07 |
