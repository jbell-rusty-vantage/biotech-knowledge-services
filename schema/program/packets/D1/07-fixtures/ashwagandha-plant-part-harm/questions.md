# Fixture ashwagandha-plant-part-harm — questions answered

Assertion ids refer to `assertions.yaml`. Research, not medical advice.

| question | expected answer (from this fixture) | answered through |
| --- | --- | --- |
| Q-D1-12 | Preparations of Withania somnifera (KSM-66 root-only extract; a 1:5 dried-root liquid extract) are subject to the TGA liver-injury signal: avoid in people with existing liver disorders; 11 possible cases reported to TGA. Leaf vs root and extraction ratio change composition, so the signal is evaluated per preparation (plantPart ROOT for both here). The leaf restriction TGA reports (India banned leaves; roots permitted) is signal s03 with facet `plantPart=LEAF`: it returns no preparation here because both are root preparations. | s02, s03, ap02, w01, w02, w06 |
| Q-D1-11 | Preparations of W. somnifera in this fixture: KSM-66 (root only, branded, marker standardization ≥ 5 % total withanolides and < 0.1 % withaferin A per a US label; preparation type and ratio not stated in the captured sources) and a Canadian liquid extract of dried root, ratio 1:5, dried-herb equivalent 3 g per 15 mL dose. | w01–w07, c11 |
| Q-D1-13 | "min. 5% total withanolides" is a STANDARDIZATION_CLAIM with comparator GTE (a minimum), stated by the label brand; "less than 0.1% withaferin A" is a limit (LT). No assay method is stated, and neither is a measured lot result. | w04, w05 |
| Q-D1-06 | DSLD maps the KSM-66 **extract** to the GSRS record of the **root** (V038D626IF, structurally diverse, part root) and puts the sentinel "0" in the branded row's uniiCode: substance-level joins hold, extract-level identity does not. | w03, q01 |
| Q-D1-27 | KSM-66's source-derived risk note is its plant part (root only) — the TGA links composition (and therefore risk assessment) to leaf vs root and extraction ratio. (The milk-allergen note of research FC-08 is not in this fixture's captures.) | w02, ap02 |
| Q-D1-26 | "KSM-66" → IngredientMaterial KSM-66 (brand); "Ashwagandha Root Extract" → V038D626IF; "ashwagandha" → Withania somnifera (NCBI 126910, CommonName). | w03, r04 |
