# Fixture consumer-panel-and-blood-clock - questions answered

Kind: other. Readiness finding: InsideTracker publishes its panel composition only as an image ("BM List"), so the INCLUDES_TEST episodes are demonstrated on Labcorp 005009, whose LOINC map lists the component results as text.

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| Q-D4-03 | Labcorp 005009 (PANEL) includes, as of 2026-10-08, components RDW (788-0), MCH (785-6), MCHC (786-4), Lymphs % (736-9), Lymphs absolute (731-0), RBC (789-8), Hematocrit (4544-3) [7 of the panel's rows sampled], each MEASURES_METRIC its LOINC Metric; coverage of the 9 sampled InnerAge inputs: 7 by name (RESOLUTION CANDIDATE, not identity), glucose and HbA1c not covered by this panel. | g01-g14, s01-s07 |
| CQ-DX-07 | InnerAge 2.0 (vendor version label "2.0"): inputs 17 (males) / 13 (females), training = "scientific research and InsideTracker’s internal customer database", inputs "may" change, reliability not reported, units/methods of inputs not reported; output InnerAge in years. | g15-g23, g27 |
| Q-D4-16 | The InnerAge output is a separate Metric (ALGORITHM_OUTPUT, INFERRED); its inputs are measured blood metrics; nothing merges it with an epigenetic clock. | g24 |
| Q-D4-22 | Each vendor input name resolves to one LOINC Metric candidate by exact analyte name (conclusionCode CANDIDATE, status PROPOSED); none is RESOLVED because the vendor states no unit, method or code; the lymphocyte line splits by sex into two Metrics. | s01-s08 |
| Q-D4-26 | InnerAge 2.0 REQUIRES_INPUT_METRIC "Hemoglobin A1c" (g16), whose CANDIDATE resolution (s08) is LOINC 4548-4; ../hba1c-two-labs-interference s02 is a HARM SAFETY_SIGNAL on that Metric (elevated HbF > 10 % -> falsely low HbA1c on Labcorp's immunoassay; NGSP: immunoassays generally). Answer: InnerAge 2.0 inherits an interference risk for people with elevated HbF; the direction and size of the effect on InnerAge are not published (input weights not reported), and which lab and method InsideTracker uses is not reported -> "risk inherited, size unknown". | g16, s08; ../hba1c-two-labs-interference s02 |
| Q-D4-25 (input) | The panel -> Metric bipartite set needed for GDS nodeSimilarity is now populated for one panel (005009: 7 sampled Metrics). | g01-g14 |
| Q-D4-05 (contrast) | InsideTracker advises retesting in 3-6 months (g28, a claim occurrence of the Claim "retesting InnerAge in 3-6 months tracks aging"); no reliability source for InnerAge is captured -> same NO_RELIABILITY_SOURCE pattern as ../clock-noise-vs-retest-advice. | g28 |
