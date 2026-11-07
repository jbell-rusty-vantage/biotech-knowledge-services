# Fixture nr-trial-unstructured — questions answered

Assertion ids refer to `assertions.yaml`; the 3.8 trace is `assertions.yaml › retrievalPath`. Research, not medical advice.

| question | expected answer (from this fixture) | answered through |
| --- | --- | --- |
| Q-D1-08 | The printed "100 / 300 / 1000 mg NR" doses are **NR chloride** masses: each capsule held 100 or 250 mg of NR chloride (99 % purity) and "1000 mg NR" = 4 capsules containing 250 mg (Methods › Study product, offsets 28769 and 29785). The 1000 mg arm is ≈ 878 mg/d NR cation. Paper and registry agree on the material (NIAGEN / "Niagen™ 1000") but the registry states no dose basis; the trial id printed in the paper (NCT0271593) does **not** resolve (HTTP 404) — the record is NCT02712593 (first posted 2016-03-18, matching the paper's date). | retrievalPath, t02–t06, ap01, c05, r03 |
| CQ-ID-06 | The study administered NIAGEN (a crystal form of NR chloride), 99 % purity as reported; same branded material as the NIAGEN in Tru Niagen (fixture nr-salt-moiety-us-canada), by name and registry intervention, not by lot. | t01, t03, t03b, r02 |
| CQ-ST-02 | Tru Niagen (US label 323170) shares the **branded material** NIAGEN with NCT02712593's intervention (path: LabelVersion → DECLARES_COMPONENT → NIAGEN ← ADMINISTERS ← InterventionComponent), not only the substance. | t03 + nr-salt-moiety-us-canada a10 |
| Q-D1-01 | NR chloride → NR (moiety), ratio 0.878043 (reused GSRS inputs). | c05 inputs |
| Q-D1-26 | "NR chloride" → NICOTINAMIDE RIBOSIDE CHLORIDE (8XM2XT8VWI); "NIAGEN" / "Niagen™ 1000" → the NIAGEN material. | r01, r02 |
