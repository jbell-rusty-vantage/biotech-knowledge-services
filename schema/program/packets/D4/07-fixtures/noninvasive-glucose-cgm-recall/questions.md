# Fixture noninvasive-glucose-cgm-recall - questions answered

Kind: harm. Harm is `effectDirection: HARM` on kernel SAFETY_SIGNAL Assessments, never a property of the device or the metric.

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| Q-D4-08 | Smartwatches and smart rings that claim to measure blood glucose without piercing the skin: the FDA (2024-02-21) has not authorized, cleared or approved any such device; they "do not directly test blood glucose levels"; scope: any brand. Verdict on the capability claim: CONTRADICTED, effectDirection HARM. The pattern starts from the SAFETY_SIGNAL Assessment (it ASSESSES the Claim and the Metric); claim occurrences are optional (none captured: FDA only retells the sellers' claim, f4-seller-claim). | s01; c01, c02, c03 (RATES_CLAIM by FDA); f1-date, f2-not-authorized, f5-no-direct-test, f6-scope |
| Q-D4-18 | Same communication answers "which devices marketed for glucose control are unauthorized": the whole class of non-invasive smartwatch/ring glucose claims (no named brand; brands come from D6 listings that make the claim). | s01, f6-scope |
| Q-D4-09 | Device model FreeStyle Libre 3 Sensor (REF 72081-01, UDI-DI 00357599818005, 510(k) K212132), reached by D8 through the Product that DELIVERS it (c04): recall Z-1020-2026 (event 98049), initiated 2025-11-24, reason "carbon build up ... incorrect low glucose results", root cause "Process control", status Open, Classified (openFDA as of 2026-10-05). The path device <- RUNS_ON_DEVICE <- AlgorithmVersion -> OUTPUTS_METRIC reaches the interstitial glucose metric, so values from affected sensors after 2025-11-24 are flagged. | s02; c04-c09; o1-o8 |
| Q-D4-17 | For a metabolic-health target operationalized by glucose, the CGM product that DELIVERS this device is reachable (D6 Product -> Device), and its HARM signal travels with it. | c04, s02 |
| Q-D4-10 (partial) | Regulatory identity of the device: 510(k) K212132 (identifier); clearance status records are D8's. | c09 |

Expected answer to "is my smartwatch glucose reading reliable?": no - the regulator states such devices are not authorized and do not directly test blood glucose; use an FDA-authorized glucose device (located advice, FDA 2024-02-21).
