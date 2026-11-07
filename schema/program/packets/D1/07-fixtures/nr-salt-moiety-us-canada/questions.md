# Fixture nr-salt-moiety-us-canada — questions answered

Assertion ids refer to `assertions.yaml`; every leaf answer cites locators in `locators.yaml`. Research, not medical advice.

| question | expected answer (from this fixture) | answered through |
| --- | --- | --- |
| CQ-PF-01 | US label 323170: "Niagen" 300 mg is the listed branded material as named, on the **salt** basis (form NR chloride, UNII 8XM2XT8VWI). Calculated: 263.4 mg NR cation per capsule, 790.2 mg/d NR and 900 mg/d salt at the 3-capsule maximum. CA licence 80092534: 263.0 mg on the **moiety** basis. | a10, a12, c01–c03 |
| Q-D1-01 | NR chloride (8XM2XT8VWI, GSRS v18) → active moiety nicotinamide riboside (0I8H2M0L7N, GSRS v24); mass ratio 255.2476 / 290.7006 = 0.878043. | a06, a07, a09 |
| Q-D1-02 | Tru Niagen 300 mg (US): 263.4 mg NR per serving, 790.2 mg NR per maximum daily dose (3 servings). | c01, c02 |
| Q-D1-05 | Tru Niagen 300 mg declares NR chloride at 300 mg per serving, 900 mg/d at the label maximum, as declared on the label observed in DSLD (entered 2025-04-24); a dose screen "≥ 500 mg/d of NR in any form" returns it (790.2 mg/d moiety, 900 mg/d salt). | a10, c02, c03 |
| Q-D1-24 | US declares 300 mg salt; Canada declares 263.0 mg moiety with the salt as source material. Under rule:mw-ratio.v1 the US amount is 263.41 mg moiety: residual −0.41 mg (−0.16 %), the two declarations reconcile (implied CA salt amount 299.5 mg). | c04 |
| CQ-ID-03 | The US row declares a **material** (NIAGEN) that realizes the substance NR chloride; the Canadian row declares the **moiety** and names the salt as its source material. | a01, a05, a10, a12 |
| CQ-ID-04 | UNII 8XM2XT8VWI and 0I8H2M0L7N from FDA GSRS (record versions 18 and 24, captured 2026-10-08); DSLD leaves the branded row's uniiCode null and puts the UNII on the form; the LNHPD names the moiety by a CAS-index-style name. | nodes.identifiers, r01, r02 |
| Q-D1-26 | "Niagen" → IngredientMaterial NIAGEN (brand) realizing 8XM2XT8VWI; "Pyridinium, 3-(aminocarbonyl)-1-beta-D-ribofuranosyl-" → the NR **cation** 0I8H2M0L7N (not the salt); "Nicotinamide riboside chloride" → 8XM2XT8VWI. | a01, r01, r02 |
| Q-D1-16 | Branded material NIAGEN; mark: "Niagen and TRU Niagen are trademarks of ChromaDex, Inc." (label); manufacturer/supplier: W.R. Grace, single supplier (10-K FY2025). | p01, p02 |
| Q-D1-17 | Tru Niagen depends on one supplier (W.R. Grace) whose patents on the crystalline form of NR chloride give it exclusive manufacturing rights for certain forms (10-K FY2025, filed 2026-03-04). | a03, p02 |
| Q-D1-07 | NIAGEN and the Canadian licence's NR chloride source material are SAME_SUBSTANCE; SAME_BRANDED_MATERIAL is not supported by the licence record. | e01 |
