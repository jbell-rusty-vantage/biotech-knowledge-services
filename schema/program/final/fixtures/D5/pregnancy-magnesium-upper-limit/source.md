# Fixture: pregnancy-magnesium-upper-limit

- url: https://protocol.bryanjohnson.com/
- title: protocol - DON'T DIE (Blueprint protocol page by Bryan Johnson; Pregnancy section)
- retrieved: 2026-10-08
- snapshot digest: sha256:da7eb359bcc03470146c4aebaaeb57c177fc6e5ec60ed3d68ea6df67c74bc1c8
- kind: harm
- tool: Tavily CLI `tvly extract` (v0.1.5, `PYTHONUTF8=1`), raw_content markdown (`tool:tavily-extract`) for both pages
- second source: https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/ — Magnesium, Fact Sheet for Health Professionals (NIH Office of Dietary Supplements; "Updated: January 6, 2026") · retrieved 2026-10-08 · snapshot digest sha256:6f0ffe69dd9ed544ab541b462ae696280607d261e6f61c0780a52ca174c96a36 · the ODS API and the fact-sheet page return HTTP 403 to curl's default User-Agent, while the page returns 200 with a browser User-Agent (re-tested in the adversarial review, tool-log); the fixture snapshot is the Tavily extract (source row `src:ods-factsheets`); its contentHash is sha256 over the stored extractor output bytes (basis EXTRACTED_TEXT_BYTES)
- fixture stage: A5, 2026-10-08 (generator `scratch ft/D5/gen/gen_mg.py`; captures `scratch ft/D5/fx/mg/`)

## What the source is

A widely followed public longevity protocol whose Pregnancy section lists ten stack supplements that "should be **avoided** during pregnancy" and a list headed "Consider **adding** the following supplements" that includes "2. Magnesium 500-600 mg daily." The page carries no edition date. The second source is the US federal reference fact sheet whose Table 3 gives the Tolerable Upper Intake Level for supplemental magnesium (350 mg in the Pregnant column for ages 14–18, 19–30 and 31–50) and states that the ULs "only include magnesium from dietary supplements and medications". The fixture shows that the over-dosing question (Q-D5-06) is answered by a query-time comparison of two located assertions from two asserters — a protocol step dose for population PREGNANT and an upper-limit assertion resolved to a DOSE_LIMIT UseConstraint — never by a stored "unsafe" flag. Result of the comparison: the stated range (500–600 mg/day, supplemental) is ABOVE the stated UL (350 mg/day, supplemental, pregnancy); the step does not say whether the amount is elemental magnesium, and the row carries that caveat. No clinical conclusion is drawn.

## What it exercises

HAS_EDITION (one observation, validFrom null with basis OBSERVATION_ONLY), HAS_STEP (33 Pregnancy-section steps, every numbered item of items 1–5: 5 CONSULT, 18 AVOID or limit, 5 TAKE, 5 PRACTICE), STEP_USES (29 edges to D1 substances and materials, D6 products, D12 food items and categories and D5 Interventions; 4 steps name no means), STATES_CONSTRAINT (derived: 18 AVOID / limit steps → 17 POPULATION and 1 DOSE_LIMIT UseConstraints, each from the author's caution assertion citing the step locator), RESOLVES_TO_CONSTRAINT (17 author USE_CONSTRAINED_IN + 1 author HAS_UPPER_LIMIT (caffeine) + 4 ODS HAS_UPPER_LIMIT assertions = 22; the three Pregnant rows resolve to one DOSE_LIMIT UseConstraint), CAUSES_ADVERSE_EFFECT (high-dose magnesium → diarrhea, nausea, abdominal cramping), and the computed, not stored, Q-D5-06 and Q-D5-11 rows (`assertions.yaml` `computedNotStored`). Scope: the edition models the Pregnancy section only, but all of it; other sections of the page are out of scope (fixture limitation, stated in `assertions.yaml`; OQ-D5-35). Adversarial review (2026-10-08): the fixtures stage had modeled 14 of the 33 items (items 1, 2 and 3.2–3.4) and so under-reported the protocol's stated pregnancy constraints (alcohol, caffeine, foods); the section is now complete and the edition payloadHash was recomputed.

Research is not medical advice.
