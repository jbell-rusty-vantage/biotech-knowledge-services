# D5 — fixture candidates (research stage, A5, 2026-10-08)

Every candidate below was captured on 2026-10-08. Raw captures live in the session scratch `C:\Users\Pinda\AppData\Local\Temp\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\ft\D5\raw\` (file name given per candidate); `sha256` is `sha256sum` of that file (full list: `ft\D5\sha256.txt`). Every quote is copied verbatim and was re-found by exact substring match by `ft\D5\quotes.py`; the offset is the 0-based character offset of the quote's first character in the named capture (for openFDA JSON: inside the named field string; for PubMed XML: in the tag-stripped, whitespace-normalized text). The fixtures stage should re-capture into a SourceSnapshot (the digest will then be of the stored representation) and keep these quotes as `SourceLocator.exact`.

Markers: **[U2E]** demonstrates the unstructured-to-entity path (directive 3.8: question → chunk → assertion → locator → snapshot); **[HARM]** harm case; **[DISCONF]** disconfirmation case.

Recommended set for `07-fixtures/` (≥ 3 required): FC-01 [U2E], FC-02 [HARM], FC-04 [DISCONF]; strong extras FC-03 (cross-source over-dose computation), FC-05 (conflicting directives). FC-06 to FC-08 are backups.

---

## FC-01 [U2E] — Huberman Lab "Toolkit for Sleep" (current) with its 2021 Wayback edition

- URL (current): https://www.hubermanlab.com/newsletter/toolkit-for-sleep
- title: Toolkit for Sleep
- retrieved: 2026-10-08 · tool: Tavily CLI `tvly extract` (PYTHONUTF8=1)
- capture: `huberman-sleep.md` (raw_content of the extract) · sha256 `a461cecfa7bc3be3531e09c93a892a3209b11e284c5ba419e89e08aa8292b1c0`; full JSON `tvly-huberman-sleep.json` · sha256 `53b2e5e67a7464b75f7f7655012dbffa82ba7675e9bb4d0e35d11d726382d9db`
- second edition: http://web.archive.org/web/20211016002820id_/https://hubermanlab.com/toolkit-for-sleep/ · Internet Archive capture 2021-10-16 · tool: curl (Wayback CDX + `id_` replay) · `wayback-huberman-sleep-20211016.html` sha256 `ac737d4c7a6d11a780377ba039dd0efcd8f52c92d146ad7bbf6268ac26d1ce00`; tag-stripped text `wayback-huberman-sleep-20211016.txt` sha256 `2b1247565dd61890006e715be8af88428c298561629666bc5ca47d68b0e0de01`; CDX index `cdx-huberman-sleep.json` sha256 `88c6b6fb0be1824b376b7d4c8041dc908643914cf34c54c0e2ae76fb8f0fa168`

Quotes (current capture unless stated):
1. "**8) You might consider taking (30-60 min before bed):**" — offset 6026 (step 8 heading: timing relative to bedtime)
2. "145mg Magnesium Threonate or 200mg Magnesium Bisglycinate" — offset 6086 (alternatives with distinct doses: one step, two forms)
3. "(3-4 nights per week I also take 2g of Glycine and 100mg GABA.)" — offset 6183 (cadence as a range of nights per week; personal practice, not a prescription)
4. "Don’t take theanine if you have overly intense dreams, sleep-walk, or have night terrors." — offset 6480 (protocol-stated population constraint, level AVOID)
5. "some people (~5%), get an agitated stomach from magnesium supplementation, in which case, do not take it." — offset 6583 (adverse effect with author-stated frequency + stop rule)
6. 2021 edition, `wayback-…-20211016.txt` offset 4755: "I use supplements from Thorne for all of the above, except the Apigenin, as they don’t make it." — vs current offset 6700: "I use supplements from Momentous for all of the above. You can get 20% off all Momentous supplements" (financial-interest change between editions; doses identical: the 2021 text has "145mg Magnesium Threonate or 200mg Magnesium Bisglycinate" at offset 4088)

Why [U2E]: a single page of unstructured prose yields steps, doses, a sleep target, a constraint, an adverse effect and a financial interest. Path to demonstrate: "what helps sleep, for whom, by what evidence?" → vector/fulltext hit on the chunk containing step 8 → assertions (INTENDED_FOR_TARGET protocol→target:sleep; step USES magnesium threonate 145 mg OR bisglycinate 200 mg, 30–60 min before bed; AVOID theanine for people with intense dreams/sleep-walking/night terrors; adverse effect GI upset ~5%) → locators (quotes 1–5) → snapshot (sha256 above). Also the edition-diff path for CQ-PR-01 (two snapshots, same steps, changed sponsor; page date "September 20, 2021" — offset 1754 — unchanged).

Answers: Q-D5-01, Q-D5-10, CQ-PR-01, CQ-PR-02, Q-D5-11, Q-D5-12, Q-D5-13, Q-D5-07.

---

## FC-02 [HARM] — FDA sirolimus label (NDA021110, Mylan, SPL v22) via openFDA

- URL: https://api.fda.gov/drug/label.json?search=set_id:%225908cd1a-fc5a-462f-99ed-1d8983e253c9%22&limit=1
- title: Sirolimus tablets label — Mylan Pharmaceuticals Inc., NDA021110, SPL set 5908cd1a-fc5a-462f-99ed-1d8983e253c9, SPL id 8f2761f9-9bc3-47c3-8093-6375a39d1034, version 22, effective_time 20260326
- retrieved: 2026-10-08 · tool: curl (openFDA, no key)
- capture: `openfda-label-sirolimus-nda021110.json` · sha256 `ab1a2c2708312dd5b77e7e11a81234f890032d5a24e9555738e40dd0d88451c2`
- companion: DailyMed version history `dailymed-sirolimus-history.json` (v1 2014-01-17 … v22 2026-03-26) · sha256 `70f2dceae4a55c6a5e6eeadc3d672167ae03462dccdaa9bf811c8b844c05b4b5`; repackager label with "Recent Major Changes" `openfda-label-sirolimus.json` · sha256 `68222a6684d657a49a0a5f0ce5f34b40f2a49ee0f82aa1698ce0e0da02f3e3b9`

Quotes (field · offset in field string):
1. `drug_interactions` · 1790: "Because grapefruit juice inhibits the CYP3A4-mediated metabolism of sirolimus, it must not be taken with sirolimus" (food interaction, directive level AVOID/CONTRAINDICATED-strength wording)
2. `drug_interactions` · 2563: "Drugs and other agents that could decrease sirolimus concentrations: Carbamazepine, phenobarbital, phenytoin, rifapentine, St. John's Wort ( Hypericum perforatum )" (supplement perpetrator)
3. `drug_interactions` · 2828: "The blood levels of sirolimus may increase upon concomitant use with cannabidiol." (supplement-adjacent perpetrator; MONITOR)
4. `contraindications` · 20: "Sirolimus is contraindicated in patients with a hypersensitivity to sirolimus" (the only formal contraindication — harm lives elsewhere)
5. `boxed_warning` · 90: "Increased susceptibility to infection and the possible development of lymphoma and other malignancies may result from immunosuppression" (approved-population harm; off-label applicability question)
6. `overdosage` · 14: "Reports of overdose with sirolimus have been received; however, experience has been limited."

Why [HARM]: authoritative interaction, contraindication and warning content for the most-discussed longevity drug; same interaction (grapefruit, St. John's wort) is asserted by other sources (FC-05, NCCIH S11) → tests one-pair-many-asserters. Label versions give a native edition model (Q-D5-24).

Answers: Q-D5-03, Q-D5-04, Q-D5-05, Q-D5-07, Q-D5-09, Q-D5-16, Q-D5-21, Q-D5-23, Q-D5-24, CQ-RC-06.

---

## FC-03 [HARM] — protocol dose vs authoritative upper limit: Blueprint pregnancy section × NIH ODS magnesium UL

- URL A: https://protocol.bryanjohnson.com/ · title: protocol - DON'T DIE · retrieved 2026-10-08 · tool: Tavily CLI `tvly extract` · capture `blueprint-protocol.md` · sha256 `8ef27ce661e452908a86cc405cc6d9435957285e1b9c99e0dd01b11f0debd019`
- URL B: https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/ · title: Magnesium — Fact Sheet for Health Professionals · retrieved 2026-10-08 · tool: Tavily CLI `tvly extract` (ODS API returned 403) · capture `ods-magnesium-hp.md` · sha256 `c481e1ef327d2daf74917e88a7f80321e764bb5cee7d962810b267e3a4d8b6b2` (JSON `tvly-ods-magnesium-hp.json` sha256 `4c14bee877fa643c8454220288555ca4f7fef0dd979c854db38f2f54ec666d48`)

Quotes:
1. A · 38727: "3. Consider **adding** the following supplements:" (section context: pregnancy)
2. A · 38897: "2. Magnesium 500-600 mg daily."
3. A · 38468: "The following supplements included in the Blueprint stack should be **avoided** during pregnancy:" (protocol-stated population constraint list follows at offset 38572)
4. B · 70365: "The Tolerable Upper Intake Level for supplemental magnesium is 350 mg for adults"
5. B · 76867: "| 19–30 years | 350 mg | 350 mg | 350 mg | 350 mg |" (UL table row; columns Male, Female, Pregnant, Lactating)
6. B · 75796: "The ULs only include magnesium from dietary supplements and medications; they do not include magnesium found naturally in food and beverages."

Why [HARM]: the over-dosing question (Q-D5-06) is a query-time computation over two located assertions from two asserters (protocol step dose range for population "pregnant"; UL by life stage with basis "supplemental only"), never a stored "unsafe" flag. Also exercises population scope and the "same section avoids ten stack items" constraint list. Caveat for the fixtures stage: state only that the stated range exceeds the stated UL; no clinical conclusion.

Answers: Q-D5-06, Q-D5-03, Q-D5-09, Q-D5-11, Q-D5-21, Q-D5-13 (own-product links elsewhere on page A).

---

## FC-04 [DISCONF] — antioxidant supplements attenuate exercise adaptation (Ristow 2009; Paulsen 2014)

- URL A: https://pubmed.ncbi.nlm.nih.gov/19433800/ (captured via https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=19433800&retmode=xml) · title: Antioxidants prevent health-promoting effects of physical exercise in humans. PNAS 2009;106(21):8665-70 · PMID 19433800 · DOI 10.1073/pnas.0903485106 · PMCID PMC2680430 · retrieved 2026-10-08 · tool: curl E-utilities (+ PubMed MCP metadata) · capture `pubmed-19433800.xml` · sha256 `2c73c57f9861aadf8237b8413a8afdb579b56625c406a68a73b5081c8411d001`
- URL B: https://pubmed.ncbi.nlm.nih.gov/24492839/ · title: Vitamin C and E supplementation hampers cellular adaptation to endurance training in humans: a double-blind, randomised, controlled trial. J Physiol 2014;592(8):1887-901 · PMID 24492839 · DOI 10.1113/jphysiol.2013.267419 · PMCID PMC4001759 · same tools · capture `pubmed-24492839.xml` · sha256 `451e9ad8aaa45cb865537ac23d959618fd1f97994acdef30b8015b5e3c63ae4a`

Quotes (offset in tag-stripped text):
1. A · 638: "a combination of vitamin C (1000 mg/day) and vitamin E (400 IU/day)" (dose context)
2. A · 1154: "Exercise increased parameters of insulin sensitivity (GIR and plasma adiponectin) only in the absence of antioxidants"
3. A · 2049: "Supplementation with antioxidants may preclude these health-promoting effects of exercise in humans."
4. B · 1872: "Daily vitamin C and E supplementation attenuated increases in markers of mitochondrial biogenesis following endurance training."
5. B · 2000: "However, no clear interactions were detected for improvements in VO2 max and running performance."

Why [DISCONF]: disconfirms the folk claim "antioxidant supplements support training/longevity" and shows a means WORSENS a target (target:glycemic-control via insulin sensitivity; target:endurance at the molecular-marker level) only in combination with another intervention (exercise) — an intervention × intervention interaction on a target. B qualifies A (performance unchanged) → MIXED_EFFECT_ON_TARGET for target:endurance, per-outcome direction. The pair also tests "do not collapse two studies into one fact".

Answers: Q-D5-02, Q-D5-14, Q-D5-04 (lifestyle co-exposure), Q-D5-01 (negative branch), Q-D5-19.

---

## FC-05 [HARM, DISCONF of a practice] — conflicting directives on one interaction: label vs community grapefruit boosting

- URL A: https://www.rapamycin.news/t/improve-bioavailability-of-rapamycin-2/86 · title: Improve Bioavailability of Rapamycin (2) · retrieved 2026-10-08 · tool: Tavily CLI `tvly extract` · capture `rapanews-1.md` · sha256 `0adb5f74ccd52bea286e81bcfb16102a7c4fd3babe55d7a1a325fc7067b53100`
- URL B: https://www.rapamycin.news/t/introduction-ritonavir-for-rapamycin-boosting/12779 · title: Introduction // Ritonavir for rapamycin-boosting · same tool · capture `rapanews-0.md` · sha256 `6e4f5619e1144db61d2ed45afdaacceba12f5812aeba85a98d3e37cfddf8c9cd`
- URL C: the FC-02 label (grapefruit quote, `drug_interactions` · 1790)
- URL D: https://www.agelessrx.com/rapamycin/ · title: Rapamycin | AgelessRx · tool: Tavily CLI · capture `agelessrx-rapamycin.md` · sha256 `35836afc2debf725799112a0f8d16d3499193c5b0f00194cde61cc7e1a3af221`

Quotes:
1. A · 756: "Taking rapamycin with grapefruit juice can dramatically increase the “effective dose” by a factor of 3X to 7X or higher."
2. A · 877: "This is not a recommended protocol for people, but is only offered here for informational purposes."
3. B · 1401: "has anyone had experience with ritonavir to boost"
4. D · 4862: "These include cyclosporine, rifampin, ketoconazole, cidofovir, ritonavir, mifepristone, posaconazole, fluconazole, and grapefruit juice." (clinic lists the same perpetrators as interactions)
5. C · `drug_interactions` 1790: "Because grapefruit juice inhibits the CYP3A4-mediated metabolism of sirolimus, it must not be taken with sirolimus"

Why: one interaction fact (grapefruit/ritonavir raise sirolimus exposure) with opposite directives by three asserter kinds (regulator: must not; clinic: interaction to review; community: deliberate cost-saving use with a disclaimer). Tests Q-D5-05 (disagreement), Q-D5-27 (what people do against warnings), assertionBasis and evidence class.

Answers: Q-D5-05, Q-D5-27, Q-D5-04, Q-D5-23.

---

## FC-06 [DISCONF + financial interest] — PEARL: clinic-sponsored rapamycin trial with a null primary endpoint

- URL A: https://pubmed.ncbi.nlm.nih.gov/40188830/ · title: Influence of rapamycin on safety and healthspan metrics after one year: PEARL trial results. Aging 2025;17(4):908-936 · PMID 40188830 · DOI 10.18632/aging.206235 · PMCID PMC12074816 · retrieved 2026-10-08 · tool: curl E-utilities + PubMed MCP · capture `pubmed-40188830.xml` · sha256 `9edc2c99ca70246cf7f04222de9171962631c804d8a6a4af53dee0a4d5694573`
- URL B: https://clinicaltrials.gov/api/v2/studies/NCT04488601 · title: PEARL (NCT04488601) · tool: curl CT.gov v2 · capture `ctgov-NCT04488601.json` · sha256 `66cb873f0bc554adb1eb5dcd9d80fc04930fb1f208f8d10898acdb91f959a662`
- URL C: AgelessRx page (FC-05 D)

Quotes:
1. A · 419: "Participants received placebo, 5 mg or 10 mg compounded rapamycin weekly."
2. A · 868: "Visceral adiposity did not change significantly"
3. A · 801: "Adverse and serious adverse events were similar across all groups."
4. A · 1743: "AgelessRx, Ann Arbor, MI 48104, USA." (author affiliation)
5. C · 1612: "The trial’s primary measure–visceral fat–didn’t show a significant change" (promoter's own statement of the null)
6. C · 12935: "It is not FDA approved to slow aging, extend lifespan, or improve healthspan."

Why: disconfirmation of the primary claim (target:body-composition / visceral fat), safety at a defined dose/schedule, sponsor = seller (D7 seam), applicability gap vs the clinic's titrated prescription (CQ-EV-04). Overlaps D3 — use only the D5 angle (intervention concept, dose regimen, constraints, target).

Answers: Q-D5-14, CQ-EV-04, Q-D5-13, Q-D5-16, Q-D5-17, Q-D5-25, Q-D5-07.

---

## FC-07 [structured benefit + harm] — Health Canada melatonin (oral) monograph

- URL: https://webprod.hc-sc.gc.ca/nhpid-bdipsn/atReq?atid=melatonin.oral2&lang=eng · title: Natural Health Products Ingredients Database — Melatonin (oral) monograph (Date December 19, 2025) · retrieved 2026-10-08 · tool: curl (URL found with `tvly search`) · capture `hc-melatonin-oral2.html` · sha256 `eac6d74128d51fe9f2043f7e3e544b9620c79f05e212fb8cfed31c03a8ef65d1`; tag-stripped `hc-melatonin-oral2.html.txt` · sha256 `c686adac850e6ec5ef58a055c2e1e7b2defe20215e7481d93a9791116cdeaebb` (offsets below are in the .txt)

Quotes:
1. 3301: "Helps (to) speed up/reduce the time it takes to fall asleep (sleep onset latency aspect of sleep quality)" (target facet)
2. 3986: "All uses except jet lag 0.1-10 milligrams of melatonin, per day" (dose range by use, subpopulation adults 18+)
3. 4516: "Take as needed, 30 to 60 minutes before bedtime"
4. 5706: "When using this product avoid driving or using machinery for 5 hours" (caution with a time window)
5. 6031: "Contraindication(s) Do not use if you are pregnant or breastfeeding (IOM 2004)."
6. 1613: "Date December 19, 2025" (monograph edition date)

Why: the cleanest regulator artifact for "what is it for (target + facet), how much, for whom, who must not". Also a reference range for Q-D5-06 (protocol melatonin doses vs monograph range). Pairs with CAERS/MMWR (FC-08) for the same substance.

Answers: Q-D5-01, Q-D5-15, Q-D5-03, Q-D5-21, Q-D5-06, Q-D5-23.

---

## FC-08 [HARM, signal vs rumour] — pediatric melatonin ingestions (MMWR) with erratum, and CAERS counts

- URL A: https://pubmed.ncbi.nlm.nih.gov/35653284/ · title: Pediatric Melatonin Ingestions — United States, 2012–2021. MMWR 2022;71(22):725-729 · PMID 35653284 · DOI 10.15585/mmwr.mm7122a1 · PMCID PMC9169525 · erratum PMID 35797208 · DOI 10.15585/mmwr.mm7127a4 · retrieved 2026-10-08 · tool: curl E-utilities + PubMed MCP · capture `pubmed-35653284.xml` · sha256 `8a778c6a379fe92e06248e269e98518a54a0d1aa72099a4b3b6cefba7b67780b`
- URL B: https://api.fda.gov/food/event.json?search=products.name_brand:%22melatonin%22&count=reactions.exact&limit=15 · title: openFDA CAERS melatonin reaction counts · tool: curl · capture `openfda-caers-melatonin-reactions.json` · sha256 `54feecc220933f9e9631b1419650a77ac12cbef5b627f7f0e606d125916a3289`

Quotes:
1. A · 1357: "During the 10-year study period, 260,435 pediatric melatonin ingestions were reported to NPDS, and the annual number of ingestions increased 530%."
2. A · 1873: "Five children required mechanical ventilation, and two died."
3. B (JSON values, not prose): `{"term": "INSOMNIA", "count": 22}` and `{"term": "Insomnia", "count": 20}` (report counts for a sleep aid; casing split) — use as data inputs, not as quotes of a claim.

Why: separates an assessment-grade surveillance finding (with a correction record) from raw spontaneous-report counts that cannot establish causality (openFDA states so, S14). Tests Q-D5-08 (signal as assessment), Q-D5-22, Q-D5-26 (erratum), Q-D5-20.

Answers: Q-D5-08, Q-D5-09, Q-D5-20, Q-D5-22, Q-D5-26.

---

## Backups (captured, not fully interviewed)

- LiverTox Ashwagandha — PubMed record PMID 31643854 · `pubmed-31643854.xml` sha256 `515b549c0b7e82286d0c3ef991e3fdd5ce4bdf2a070ccaae10db7c81870d889a`; quote (tag-stripped offset 435): "recently has been implicated in cases of clinically apparent liver injury". Pairs with Blueprint "Ashwagandha 300-600 mg and Rhodiola Rosea 200-400 mg daily" (`blueprint-protocol.md` offset 36717) for Q-D5-11. Bookshelf page blocked by reCAPTCHA.
- NCCIH St. John's wort — https://www.nccih.nih.gov/health/st-johns-wort · `nccih-sjw.md` sha256 `c2bc14a07abbda4ba4ceecf8c5ed911b1f8f1bde45064f48df0b02067312cddb`; quotes: offset 1906 "It has been clearly shown that St. John’s wort can interact in dangerous, sometimes life-threatening ways with a variety of medicines."; offset 3944 "Cyclosporine, which prevents the body from rejecting transplanted organs". Second asserter for the FC-02 interaction class.
- 21 CFR 101.93 — `ecfr-101-93.xml` sha256 `0ba678d562e99a9ee6fe56eb0bd5946687b1eec3183eeb7ff71af333058ce807`; quote (tag-stripped offset 3873): "provided that such statements are not disease claims under paragraph (g) of this section". For Q-D5-15 claim class.
