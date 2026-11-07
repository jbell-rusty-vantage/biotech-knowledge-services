# Fixture sirolimus-spl-boxed-warning — source

- url: https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/19880f51-badb-4846-a02a-592a210690ab.xml
- title: SIROLIMUS SOLUTION [VISTAPHARM, LLC] — Structured Product Label set 19880f51-badb-4846-a02a-592a210690ab, versionNumber 11, effectiveTime 20240430 (DailyMed web services v2, SPL XML)
- retrieved: 2026-10-08
- snapshot digest: sha256:78a1edf8dba1144e83c42ad1b06d14f84afa99b125034b7da986143915d1b837
- kind: harm
- also: aggregator rendition vs primary record (CQ-PV-05), three clocks on one label (valid / published / retrieved)
- tool: `dailymed-spl` via curl 8; 412,635 bytes, RAW_BYTES; re-fetched 2026-10-08T21:54:52Z, sha256 equal to the research capture (21:09:57Z). Research, not medical advice.

Sirolimus (rapamycin) is used off-label for longevity, so the label's boxed warning is the authoritative harm statement a biohacker question must reach. The SPL XML carries it as a section with a stable id (`section ID="LINK_b7e90274-8447-41bf-8803-c34d58d232cd"`) and the LOINC section code 34066-1 "BOXED WARNING SECTION", titled "WARNING: IMMUNOSUPPRESSION, USE IS NOT RECOMMENDED IN LIVER OR LUNG TRANSPLANT PATIENTS", and states that "Only physicians experienced in immunosuppressive therapy and management of renal transplant patients should use sirolimus for prophylaxis of organ rejection in patients receiving renal transplants." The fixture attaches label version 11 to the package (NDC 66689-347-02) with D6 `HAS_LABEL_VERSION` valid from the label's effectiveTime 2024-04-30, records the warning as D5's use-constraint predicate `USE_CONSTRAINED_IN` (level NOT_RECOMMENDED, qualifier section:BOXED_WARNING, speechAct CAUTIONS; D11's own `has_boxed_warning` was dropped in the adversarial review) with an HTML locator on the section id plus the LOINC code, and keeps the label's three clocks apart: valid from 2024-04-30, published by DailyMed on Jan 14, 2026 (history.json), retrieved 2026-10-08. The path from a substance identifier runs UNII W36ZG6FT64 → ChemicalSubstance ← `REALIZES_SUBSTANCE` ← IngredientMaterial ← `DECLARES_COMPONENT` ← LabelVersion. **The openFDA record is an aggregator rendition** of the same SPL set (joined by the shared SPL set id): it flattens the full-prescribing and highlights boxed warnings into one string, drops the section id and the LOINC code, and carries its own disclaimer ("Do not rely on openFDA to make decisions regarding medical care.").

Further sources of this fixture:

| url | title | retrieved | digest | tool |
| --- | --- | --- | --- | --- |
| https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/19880f51-badb-4846-a02a-592a210690ab/history.json | DailyMed SPL version history (v11 published "Jan 14, 2026"; v10 "Feb 09, 2024") | 2026-10-08 | sha256:5c40fce91dd7772f3730d8080a5d4a2290d5714f0e65317320aba7d121382f06 | dailymed-spl (curl) |
| https://api.fda.gov/drug/label.json?search=set_id:%2219880f51-badb-4846-a02a-592a210690ab%22&limit=1 | openFDA drug label for the same set id — **aggregator rendition** (meta.last_updated 2026-10-07; version "11", effective_time "20240430") | 2026-10-08 | sha256:db1ab9a37f06a773454f1491ae46cf95c87c6fbd149a997bb11904221a6ceedc | openfda-drug-label (curl) |
