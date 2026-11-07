# Fixture hba1c-two-labs-interference - questions answered

Kind: harm (with a comparability core). Expected comparability verdict: **UNKNOWN**.

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| CQ-DX-01 | Labcorp 001453 measures LOINC 4548-4 (Hemoglobin A1c/Hemoglobin.total:MFr:Pt:Bld:Qn), unit %, specimen whole blood (lavender/green/gray-top), method text "Roche Tina Quant", reagent kit as cited "Tina Quant Hemoglobin A1c Gen.3 - Hemolysate application" package insert (2017-06; currency not stated), instrument NOT_REPORTED, software NOT_REPORTED, performing site NOT_REPORTED (organization Labcorp by curator inference), as observed 2026-10-08. | d01, d03, d05, d15; lc-loinc-row, lc-method, lc-kit, ln-name |
| CQ-DX-03 | Labcorp 001453 vs Quest 496: **UNKNOWN** comparability (both immunoassays; instrument, software, calibration and reagent generation in use not reported; Quest LOINC not captured). Never "same test". | s01 |
| CQ-AX-21 | The shared graph answers comparability from the two AssayVersion uids alone (s01), without any personal result. | s01 |
| CQ-DX-06 | Labcorp: reference interval 4.8-5.6 % (REFERENCE_INTERVAL, derivation NOT_REPORTED); prediabetes 5.7-6.4 % and diabetes >=6.5 % (DECISION_LIMIT); <7.0 % (GUIDELINE_TARGET). Quest: "<5.7 %" printed as a reference range with the disclaimer to use the range on the lab report. | d06-d11, d17-d20; lc-ri, lc-prediabetes, lc-diabetes, lc-target, q-ri, q-disclaimer |
| Q-D4-11 | Elevated HbF (>10 %) may give lower than expected HbA1c at Labcorp (lab-stated); NGSP: immunoassays can generally be assumed to show HbF interference ($ row, e.g. Roche Cobas c513); the lab's analyzer is not reported -> **risk not excludable**, effectDirection HARM. | s02; d13, d14 |
| Q-D4-19 | Pre-analytical difference: Labcorp accepts a gray-top (sodium fluoride) tube; Quest rejects sodium fluoride/oxalate gray-top tubes and heparinized plasma. | lc-tubes, q-reject |
| Q-D4-21 | LOINC 4548-4 exists for this metric (identifier on the Metric); LOINC itself warns that NGSP, IFCC and JDS protocols "produce different numeric values". | ln-protocols |
| Q-D4-23 | No dated method change is published by either lab; the PERFORMED_WITH_VERSION episodes are open with validFrom unknown; Labcorp cites a Gen.3 package insert of 2017-06 while NGSP certifies Gen. 3 and Gen. IV cobas c513 applications (a reagent-generation change is possible but undated); NGSP certificates expire yearly. | d03, d04, lc-kit, nm-gen3-c513, nm-gen4-c513, nm-expiry |
| Q-D4-26 (input) | The SAFETY_SIGNAL s02 (elevated HbF -> falsely low HbA1c) is about Metric LOINC 4548-4, which ../consumer-panel-and-blood-clock links to the InnerAge 2.0 HbA1c input by a RESOLUTION candidate: a clock using HbA1c inherits the risk. | s02 |
| Q-D4-16 | Metric 4548-4 QUANTIFIES Biomarker hemoglobin-a1c (other metrics such as IFCC mmol/mol or DNAm logA1C would be separate Metrics of the same Biomarker); the Biomarker's analyte is the D2 MolecularEntity hemoglobin A1c (Biomarker.analyteEntities), not a D1 substance. | d12, d21; ln-name |
