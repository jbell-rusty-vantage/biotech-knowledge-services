# D13 — fixture candidates (research stage)

Agent A7, 2026-10-08. Raw captures are in the session scratch dir `C:\Users\Pinda\AppData\Local\Temp\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\ft\D13\a7r\` (paths below are relative to it; not committed). `sha256` is over the raw captured bytes (`sha256sum`). For EDGAR HTML the quotes were verified against a text rendering made by a stdlib HTMLParser script (`ft/D13/a7tools/h2t.py`); that rendering's sha256 is given too, and character offsets refer to it. For Tavily/Firecrawl captures, offsets refer to the saved markdown itself. Every quote below was machine-checked against its capture (`ft/D13/a7tools/qcheck.py` over `ft/D13/a7tools/quotes.json`: all exact except two marked *ws-normalized*, where a line break in the capture was replaced by a space).

Recommended set for the fixtures stage (the brief asks for: readout → approval → launch; financing following a result; retraction contradicting prior claims; plus 3.8 and a harm case):

| fixture slot | candidate | why |
| --- | --- | --- |
| unstructured-to-entity (directive 3.8) | **FC1** (+ FC3 for the chain) | 8-K narrative → chunk → READOUT Event assertions (dates, endpoints met) → locator (Item 8.01 span) → snapshot; registry/approval records corroborate |
| readout → approval → launch | **FC3** (with FC1, FC4) | PDUFA date scheduled (PLANNED), approval occurred on that date, launch stated as expected (PLANNED), all primary, plus BT-list confirmation |
| financing following a result | **FC2** | sponsor states the debt tranche became available "as a result of" the readout announcement — a located LEADS_TO with explicit basis; plus a temporal-only equity raise for the FOLLOWS vs LEADS_TO contrast |
| retraction contradicting prior claims | **FC5** | two asserters (publisher, Retraction Watch) for one retraction; an earlier expression of concern; author dissent; 2410 citing works |
| harm / disconfirmation | **FC7** (senolytics) or **FC6** (safety halt) or **FC8** (GLP-1 in Alzheimer's) | FC7 gives the full harm chain readout-failure → RIF → dissolution with effective time; FC6 gives safety signal → discontinuation → market move; FC8 gives a frontier hypothesis disconfirmed at Phase 3 |

---

## FC1 — Madrigal 8-K, MAESTRO-NASH topline results (unstructured-to-entity)

- url: https://www.sec.gov/Archives/edgar/data/1157601/000119312522307935/d423141d8k.htm
- title: Madrigal Pharmaceuticals, Inc. Form 8-K, Date of Report December 19, 2022 (Items 7.01, 8.01)
- retrieved: 2026-10-08 · tool: curl → SEC EDGAR Archives (User-Agent from EDGAR_IDENTITY) · accession 0001193125-22-307935 (EDGAR `items` "7.01,8.01")
- capture: `mdgl-000119312522307935_d423141d8k.htm` sha256 `fea923127626521e465d528b3bcca911fba9c9626d1bd20d74434f0add314d21`; text rendering `…_d423141d8k.txt` sha256 `6f649070f3986934401e39026512c88143068c856e0691081e7840c572419b8d`
- marks: **unstructured-to-entity path** (question Q-D13-05 → chunks of Item 8.01 retrieved by vector/fulltext on "resmetirom topline" → assertions: READOUT event occurred 2022-12-19, readoutStage TOPLINE, primaryEndpointMet MET as stated by sponsor; PLANNED REGULATORY_SUBMISSION "first half of 2023" → locator = text-position + exact quote inside Item 8.01 → snapshot = the HTML bytes above). Benefit-side, but carries a safety statement.
- quotes (offsets in the .txt rendering):
  1. "On December 19, 2022, Madrigal announced topline results, which are summarized below." — Item 8.01, chars 2819–2904
  2. "Dual Primary Endpoints (52 Weeks) and Key Secondary Endpoint (24 weeks) Were Met" — Item 8.01 "Efficacy Data" sub-heading, chars 2923–3003
  3. "In the first half of 2023, Madrigal Pharmaceuticals intends to file a new drug application seeking Subpart H accelerated approval of resmetirom." — Item 8.01 "New Drug Application Planning", chars 5605–5749
  4. "The frequency of serious adverse events (SAEs) was similar across treatment arms: 11.8%, 12.7% and 12.1% for the 80 mg, 100 mg, and placebo, respectively." — Item 8.01 "Safety Data", chars 4757–4911
- answers: Q-D13-01, Q-D13-02, Q-D13-05, Q-D13-10, CQ-TM-03 (event date = Date of Report; filing date from EDGAR index)
- seam notes: study (MAESTRO-NASH; NCT not stated in this 8-K) is D3; resmetirom is D1; Madrigal is D7.

## FC2 — Madrigal financing following the readout (financing following a result)

- url (8-K): https://www.sec.gov/Archives/edgar/data/1157601/000119312522311537/d434336d8k.htm
- url (EX-99.1): https://www.sec.gov/Archives/edgar/data/1157601/000119312522311537/d434336dex991.htm
- title: Madrigal Form 8-K filed 2022-12-23 (Items 1.01, 5.03, 7.01, 8.01, 9.01); Exhibit 99.1 "Madrigal Pharmaceuticals Announces $300+ Million in Financing Events to Advance Resmetirom Program" (dated December 21, 2022)
- retrieved: 2026-10-08 · tool: curl → SEC EDGAR · accession 0001193125-22-311537
- capture: 8-K html sha256 `416740c759506ea973ec4ae242b6a8707c51972c879a6656be1cdb36e0333536` (text `df177a64af603e65aeb63ca63ddf4ddf48aa9ad69c614946fb61f2e93dc778ff`); EX-99.1 html sha256 `ef32efcdb18957c0f7f254c78fa16b7d703fa4f4222142162d3c8748008b20e5` (text `53434283414f798d2979dc8417c372707bfa31ea498735a928288199c2499c15`)
- marks: LEADS_TO with explicit stated basis (debt milestone) versus temporal/rhetorical "following" (equity) — the FOLLOWS vs LEADS_TO test of the vocabulary. Not a harm case.
- quotes:
  1. "On December 19, 2022, as a result of the Company’s announcement of Phase 3 MAESTRO-NASH clinical trial topline results, the Company received confirmation from Hercules Capital, Inc. (“Hercules”) that it has satisfied the clinical development milestone under the Company’s previously disclosed Loan and Security Agreement" — 8-K Item 8.01 "Borrowing Availability Under Loan Agreement", chars 10401–10721 (45 words)
  2. "As a result of the achievement of the clinical development milestone, the Company is now eligible to borrow up to an additional $50 million under the Loan Agreement." — 8-K Item 8.01, chars 10923–11088
  3. "The gross proceeds from the transaction will be $100 million in the aggregate before estimated transaction expenses" — 8-K Item 1.01, chars 3502–3617
  4. "Madrigal Pharmaceuticals Announces $300+ Million in Financing Events to Advance Resmetirom Program" — EX-99.1 headline, chars 61–159
  5. "“The financings secured following the positive topline readout of our Phase 3 MAESTRO-NASH trial reflect the strong support that Madrigal has established with long-standing strategic and institutional investors." — EX-99.1 CEO quote, *ws-normalized* (line break after "our"), normalized offset 785
- answers: Q-D13-06, Q-D13-01, Q-D13-23, CQ-TM-03 (agreement 2022-12-21, ATM sales 2022-12-19, expected close 2022-12-23, filed 2022-12-23)
- companion (temporal-only financing after approval): 8-K 2024-04-02 https://www.sec.gov/Archives/edgar/data/1157601/000119312524084797/d818318d8k.htm sha256 `b5fff676d815cc33235ad5ace299b6b39e405e442b0942b87efb356caa2534ca` — underwriters' option exercise closing 2024-04-02, "approximately $660.0 million in aggregate for the Offering"; states no causal basis → FOLLOWS only.

## FC3 — Madrigal PDUFA date → accelerated approval → expected launch (readout → approval → launch chain)

- url (NDA acceptance PR, EX-99.1): https://www.sec.gov/Archives/edgar/data/1157601/000119312523234385/d475156dex991.htm
- url (approval 8-K): https://www.sec.gov/Archives/edgar/data/1157601/000119312524068170/d788116d8k.htm
- url (approval PR, EX-99.1): https://www.sec.gov/Archives/edgar/data/1157601/000119312524068170/d788116dex991.htm
- url (Drugs@FDA corroboration): https://api.fda.gov/drug/drugsfda.json?search=openfda.brand_name:%22REZDIFFRA%22&limit=1
- title: EX-99.1 "Madrigal Pharmaceuticals Announces NDA Acceptance and Priority Review …" (2023-09-13); Form 8-K filed 2024-03-15; EX-99.1 "Madrigal Pharmaceuticals Announces FDA Approval of Rezdiffra™ (resmetirom) …" (2024-03-14); openFDA NDA217785
- retrieved: 2026-10-08 · tool: curl → SEC EDGAR; curl → openFDA
- capture: NDA-acceptance EX-99.1 sha256 `ae8decfd67071b79acbdbe5dba3b49e03b75e67b3486fd0fb7a16e9cc0a65349`; approval 8-K sha256 `a2cdf28c99a4c5b87ab9031a22bdb87abdde5e380b0d7d241e302d9b0b681d08`; approval EX-99.1 sha256 `6b799adfbfcfde73131d1983d377d07dea47309d7c158a144286d28b4a687764`; openFDA JSON sha256 `00ebeded2522cbfe637cca57a3b46d78012ac06db8a64840cbf9a99537d72645` (submission ORIG-1 status AP, status_date 20240314, review_priority PRIORITY)
- marks: PLANNED → occurred (PDUFA date met on the day); accelerated approval with stated contingency (risk); launch stated as expected (PLANNED LAUNCH). Self-description "historic moment" as a ClaimOccurrence (Q-D13-17).
- quotes:
  1. "The FDA has granted Priority Review and assigned a Prescription Drug User Fee Act date for resmetirom of March 14, 2024, the target date by which the FDA intends to complete its review and take action on the NDA." — NDA-acceptance EX-99.1 first paragraph, chars 623–835
  2. "On March 14, 2024, the Company announced that the FDA has granted accelerated approval of Rezdiffra™ (resmetirom) in conjunction with diet and exercise for the treatment of adults with noncirrhotic NASH with moderate to advanced liver fibrosis (consistent with stages F2 to F3 fibrosis)." — approval 8-K Item 8.01, chars 3672–3959
  3. "Continued approval for this indication may be contingent upon verification and description of clinical benefit in ongoing confirmatory trials." — approval 8-K Item 8.01, chars 3960–4102
  4. "Rezdiffra is expected to be available to patients in the U.S. in April and will be distributed through a" — approval EX-99.1, chars 6063–6167
  5. "This is a historic moment for the NASH field and represents the best of what our industry is capable of." — approval EX-99.1, CEO quote, chars 1852–1956
- answers: Q-D13-05, Q-D13-10, Q-D13-12, Q-D13-02, Q-D13-17, CQ-TM-03
- gap for the fixtures stage: an actual LAUNCH occurrence statement (e.g. Q1/Q2 2024 10-Q or earnings 8-K Item 2.02) was not captured; the chain currently ends at a PLANNED launch.

## FC4 — FDA CDER Breakthrough Therapy Designation Approvals list (breakthrough by stated definition)

- url: https://www.fda.gov/media/95302/download (linked from https://www.fda.gov/drugs/nda-and-bla-approvals/breakthrough-therapy-approvals)
- title: "CDER Breakthrough Therapy Designation Approvals — Data as of December 31, 2025" (file name "All Breakthrough Approvals thru CY25_12_31_25.pdf")
- retrieved: 2026-10-08 · tools: curl (PDF bytes) + `pdftotext` (layout unusable) and `firecrawl scrape` (row-correct markdown)
- capture: PDF `fda-media-95302.bin` sha256 `901fd6e846c59d88a3106043666c4695319a3329c44e08433e8dfe65de6aeeb6`; Firecrawl markdown `x/fda-bt-all.fc.md` sha256 `30ca1c57da1b081852f991cea91192ffa9021050bf591b838a4d1b2d87d319bc`; pdftotext `fda-bt-all.txt` sha256 `460e4de9216d56c6b68a26e56ea223598bd8c3041687b487140985f34ba78a88`
- marks: the regulator's own definition test for Q-D13-04 (BC-DESIGNATION is satisfied only for approved, designated products; grant dates absent). Locator kind: table row.
- quotes:
  1. "| NDA 217785 | ORIGINAL-1 | REZDIFFRA | RESMETIROM | MADRIGAL PHARMACEUTICALS INC | 14-Mar-2024 |" — Firecrawl markdown table row, chars 74070–74167
  2. "| NDA 215256 | SUPPLEMENT-24 | WEGOVY | SEMAGLUTIDE | NOVO NORDISK INC | 15-Aug-2025 |" — Firecrawl markdown table row, chars 88318–88404
  3. "Total of 337 Approvals" — PDF page 1 header (pdftotext), chars 250–272
- definition companion: FDA "Breakthrough Therapy" page (https://www.fda.gov/patients/fast-track-breakthrough-therapy-accelerated-approval-priority-review/breakthrough-therapy, Tavily extract, capture `fda-btd.json` sha256 `f6b087579e3b30dda2b70a622ca51dbbb97ffcbbe303401be0b5a5ebd20ab8e8`): "Breakthrough Therapy designation is a process designed to expedite the development and review of drugs that are intended to treat a serious condition and preliminary clinical evidence indicates that the drug may demonstrate substantial improvement over available therapy on a clinically significant endpoint(s)." (chars 979–1290 of the JSON file, inside `raw_content`)
- answers: Q-D13-04, Q-D13-17, Q-D13-30, Q-D13-02, Q-D13-24 (count 337 as an asserted aggregate)

## FC5 — Retraction of Lesné et al. 2006 (retraction contradicting prior claims)

- url (notice): https://www.nature.com/articles/s41586-024-07691-8
- url (metadata): https://api.crossref.org/works/10.1038/nature04533 and https://api.crossref.org/works/10.1038/s41586-024-07691-8
- title: Nature, "Retraction Note: A specific amyloid-β protein assembly in the brain impairs memory" (published 2024-06-24); original: "A specific amyloid-beta protein assembly in the brain impairs memory", Nature 440:352-7 (2006), DOI 10.1038/nature04533, PMID 16541076
- retrieved: 2026-10-08 · tools: Firecrawl scrape (notice; Tavily failed), curl → Crossref REST, PubMed MCP (article types include "Retracted Publication")
- capture: notice `x/nature-retraction.fc.md` sha256 `dcfb11fc3fd37481e4ac00748ee76f855c6fdd72c01df00f94ebf16fee26a464`; Crossref original `crossref-nature04533.json` sha256 `c16a41f932272abe72657f723ed2ba33b11bc3856610886a2de0492ccf13fbe2`; Crossref notice `crossref-retraction-notice.json` sha256 `60c30270212a8bef9a48e2243f3a2f4858b50962dc6cb17157a2da9ff0c40d45`
- marks: **disconfirmation case**; two asserters for one revision event (Crossref `source: publisher` and `source: retraction-watch`, both 2024-06-24) plus an earlier expression of concern (2022-07-14, retraction-watch). Frontier: `frontier:alzheimers-disease-modification` (as a scientific-record setback; whether a 2006 mouse paper's retraction is a frontier milestone is an open question — see research notes).
- quotes:
  1. "The authors wish to retract this article. Concerns have been raised regarding figures in this article, including Fig. 2c and Supplementary Fig. 4, which show signs of excessive manipulation, including splicing, duplication and the use of an eraser tool. The data cannot be verified from the records." — notice body, chars 1101–1400 (47 words)
  2. "Sylvain Lesné disagrees with the retraction. Austin Yang has not responded to correspondence from the Editors about this retraction." — notice body, chars 1605–1737
  3. "\"type\":\"expression_of_concern\",\"label\":\"Expression of concern\",\"source\":\"retraction-watch\"" — Crossref JSON `message.updated-by[0]`, chars 235–325 (JSON fragment; the entry's `updated` date is 2022-07-14)
- answers: CQ-EV-05, Q-D13-07, Q-D13-08, Q-D13-22, CQ-TM-01
- seam notes: the revision is the kernel SourceRevisionEvent (OPEN-QUESTIONS item 4, closed); D13 projects a RETRACTION Event only if it is a frontier milestone; CONTRADICTS between the retraction and earlier claims is kernel/D10, never an event edge.

## FC6 — BioAge STRIDES discontinuation (harm: safety signal → discontinuation → market move)

- url: https://ir.bioagelabs.com/news-releases/news-release-details/bioage-labs-announces-discontinuation-strides-phase-2-clinical
- title: "BioAge Labs Announces Discontinuation of STRIDES Phase 2 Clinical Trial Evaluating Azelaprag in Combination with Tirzepatide for the Treatment of Obesity" (December 6, 2024)
- retrieved: 2026-10-08 · tool: Tavily extract · capture `x/bioage.md` sha256 `37feb9da614e41bb7f8cac53e2274207a94395ee6abc3f421ad70c78e38e299b`
- corroboration: ClinicalTrials.gov API v2 NCT06515418 overallStatus TERMINATED, whyStopped (quoted in 01-ecosystem §3); BioPharma Dive article (Tavily, `x/bpdive-bioage.md` sha256 `f454fea8a3302bd5b27acb7bde9804259dc472df618c7f6e0e335d613a72364d`); EDGAR index shows no 8-K for this event (S09)
- marks: **harm case** (SAFETY_SIGNAL → PROGRAM_DISCONTINUATION RESPONDS_TO it; market move reported by a journalist; registry status change). Frontiers: `frontier:muscle-preserving-weight-loss` (and the geroscience theme by the sponsor's framing).
- quotes:
  1. "today announced that the Company has made the decision to discontinue the ongoing STRIDES Phase 2 study of its investigational drug candidate azelaprag as monotherapy and in combination with tirzepatide after liver transaminitis without clinically significant symptoms was observed in some subjects receiving azelaprag." — release body ¶1, chars 1054–1373 (44 words)
  2. "Of 204 subjects enrolled in STRIDES as of today, 11 subjects in the azelaprag treatment groups were observed to have transaminase elevations with no clinically significant symptoms." — release body ¶4, chars 3122–3303
  3. "Shares in BioAge, which closed Friday at just over $20 apiece, plunged by two-thirds in post-market trading Friday." — BioPharma Dive article, chars 4991–5106
- answers: Q-D13-08, Q-D13-14, Q-D13-21, Q-D13-22, Q-D13-26

## FC7 — Unity Biotechnology: senolytic readouts → workforce reduction → dissolution (harm / disconfirmation chain)

- url (2020 readout): https://www.globenewswire.com/news-release/2020/08/17/2079116/0/en/unity-biotechnology-announces-12-week-data-from-ubx0101-phase-2-clinical-study-in-patients-with-painful-osteoarthritis-of-the-knee.html
- url (2025 8-K, RIF): https://www.sec.gov/Archives/edgar/data/1463361/000095017025063167/ubx-20250502.htm
- url (2025 8-K, dissolution): https://www.sec.gov/Archives/edgar/data/1463361/000119312525220778/d190494d8k.htm
- title: "UNITY Biotechnology Announces 12-week data from UBX0101 Phase 2 Clinical Study in Patients with Painful Osteoarthritis of the Knee" (2020-08-17); UNITY Form 8-K filed 2025-05-05 (Items 2.05, 5.02, 8.01); Unity Form 8-K filed 2025-09-26 (Items 1.02, 3.03)
- retrieved: 2026-10-08 · tools: Tavily extract (2020 release), curl → SEC EDGAR (8-Ks)
- capture: `x/unity.md` sha256 `0af2bf0b04cfec332697b1938c4c7c4070adabc6b9836beaf5d23fa6f3fbe00a`; RIF 8-K sha256 `55430cce7fb295ee0c47b36bf546d44179427a57db39661eba62adfa993c97e4` (text `ccdad60288872f6ac1a09d6786acbdf7e8d857dc6d00530124b13f98c01276dc`); dissolution 8-K sha256 `68baca5083eeef76e170f04eee19aa2c12686e643d5978cd1831f20bd41526ed` (text `59a94bb255441f9b6f4f31ac0fd01cca147ec24d1ac027ff900e26f81a30ff83`)
- marks: **harm / disconfirmation case** on `frontier:senolytics-in-humans`; claim persisting after a failed readout ("remains compelling") for Q-D13-07; effectiveFrom clock with time of day (dissolution) for CQ-TM-03; the RIF is stated as following the ASPIRE data (LEADS_TO/RESPONDS_TO candidate). Deregistration Form 15-12G filed 2026-01-02 (EDGAR index S10).
- quotes:
  1. "There was no statistically significant difference between any arm of UBX0101 and placebo at the 12-week endpoint for change from baseline in WOMAC-A, an established measurement of pain in OA." — 2020 release ¶1, chars 705–896
  2. "While these are not the results we had hoped for, the evidence that senescent cells contribute to diseases of aging remains compelling" — 2020 release CEO quote, chars 3239–3373
  3. "approved a plan (the “Operating Plan”) to reduce operating costs and preserve capital following the disclosure of full 36-week data from the Company’s ASPIRE study" — RIF 8-K Item 2.05, chars 2326–2489
  4. "On September 26, 2025, as contemplated by the Plan of Dissolution, the Company filed a certificate of dissolution (the “Certificate of Dissolution”) with the Secretary of the State of Delaware, which became effective as of 5:00 p.m. Eastern Time on September 26, 2025." — dissolution 8-K Item 3.03 area, chars 7599–7867 (43 words)
- answers: Q-D13-08, Q-D13-15, Q-D13-07, Q-D13-14, CQ-TM-03, Q-D13-02

## FC8 — Novo Nordisk evoke / evoke+ (frontier hypothesis disconfirmed at Phase 3)

- url: https://www.biospace.com/press-releases/novo-nordisk-a-s-evoke-phase-3-trials-did-not-demonstrate-a-statistically-significant-reduction-in-alzheimers-disease-progression
- title: "Novo Nordisk A/S: Evoke phase 3 trials did not demonstrate a statistically significant reduction in Alzheimer’s disease progression" (24 November 2025; BioSpace-hosted copy of the company release)
- retrieved: 2026-10-08 · tool: Tavily extract · capture `x/novo-evoke-bs.md` sha256 `62496015c9ebbd9d8a24418b2e896644beef06641063a94f7fa6a52c7269c981`
- caveat: syndicated copy; the fixtures stage should capture the GlobeNewswire/novonordisk.com original (vocab C30) and compare text.
- marks: **disconfirmation case** on `frontier:glp1-beyond-obesity` × `frontier:alzheimers-disease-modification`; stated evidence basis of the program (Q-D13-27); same frontier had a breakthrough-designated approval in 2025 (FC4 row 2).
- quotes:
  1. "The evoke and evoke+ trials did not confirm superiority of semaglutide versus placebo in the reduction of progression of Alzheimer’s disease, as measured by the change in Clinical Dementia Rating – Sum of Boxes (CDR-SB) score compared to baseline." — ¶2, chars 2748–2995
  2. "The decision to pursue an Alzheimer’s disease indication with semaglutide was based on real-world evidence studies, pre-clinical models as well as post-hoc analyses from diabetes and obesity trials." — ¶1, chars 2548–2746
  3. "While treatment with semaglutide resulted in improvement of Alzheimer’s disease-related biomarkers in both trials, this did not translate into a delay of disease progression." — ¶2, chars 2996–3170
- answers: Q-D13-27, Q-D13-07, Q-D13-08, Q-D13-25 (CTAD/AD-PD presentations announced in the same release)

## FC9 — Life Biosciences ER-100: IND clearance and first participant dosed (frontier first-in-human; "first ever" press claim)

- url: https://www.lifebiosciences.com/life-biosciences-announces-fda-clearance-of-ind-application-for-er-100-in-optic-neuropathies ; https://www.lifebiosciences.com/life-biosciences-announces-first-patient-dosed-in-phase-1-trial-of-er-100-for-optic-neuropathies
- title: "Life Biosciences Announces FDA Clearance of IND Application for ER-100 in Optic Neuropathies" (2026-01-28); "Life Biosciences Announces First Patient Dosed in Phase 1 Trial of ER‑100 for Optic Neuropathies" (2026-06-09)
- retrieved: 2026-10-08 · tool: Tavily extract · captures `x/lifebio.md` sha256 `1239e9b84899d7f95dc4366a18b54ad4dad29997b21fe82f57fef5dcc3be83c3`, `x/lifebio-dose.md` sha256 `629d8647f1a26aa1fa78a90908f61612f980844132b82888e6aabb7c1a8e1335`
- corroboration: ClinicalTrials.gov NCT07290244 (MCP): RECRUITING, PHASE1, start date 2026-03-02, enrollment 18 — a different clock from "first dosed" 2026-06-09
- marks: BC-FIRST-IN-HUMAN candidate on `frontier:partial-epigenetic-reprogramming`; the sponsor's "first ever" phrase is a claim to test (Q-D13-17); biohacker avoidance question (Phase 1 safety study in optic neuropathies, not an aging indication) Q-D13-16.
- quotes:
  1. "IND clearance marks the first ever cellular rejuvenation therapy using partial epigenetic reprogramming to reach human clinical trials" — IND release sub-heading, chars 1511–1645
  2. "BOSTON, January 28, 2026 – Life Biosciences, Inc., (“Life Bio”) a biotechnology company pioneering cellular rejuvenation therapies to reverse and prevent multiple diseases of aging, today announced that the U.S. Food and Drug Administration (FDA) has cleared its Investigational New Drug (IND) application for ER-100." — IND release ¶1, chars 1648–1965 (45 words)
  3. "today announced that the first participant has been dosed in its Phase 1 clinical trial of ER‑100" — dosing release ¶1, chars 1802–1899
- answers: Q-D13-02, Q-D13-04, Q-D13-16, Q-D13-17, CQ-TM-03

## FC10 — Loyal LOY-002: guided milestone vs later status (milestone slip; financing alongside a regulatory milestone)

- url: https://loyal.com/posts/loy-002-receives-rxe-from-the-fda ; https://loyal.com/posts/loy-002-tas
- title: "Not just for big dogs! Our senior dog program receives preliminary FDA efficacy acceptance (RXE)" (no date in capture); "One step closer to a dog longevity drug: What LOY-002’s safety milestone means to a practicing vet" (January 13, 2026)
- retrieved: 2026-10-08 · tools: Tavily extract (RXE post), Firecrawl scrape (TAS post; RXE post rawHtml had no publication date field either)
- capture: `x/loyal.md` sha256 `006c3a664818bc73307caf4b0c3e4a2a363835c41c83fd32eaa4ce89728c16b9`; `x/loyal-tas.fc.md` sha256 `8fa0e6aa13631ba420a62ae1a45d20b938369fd6954afbf878b7b567fd32d06d`
- corroboration (secondary): dvm360 article reporting Loyal anticipates the final technical section's review in 2027 (`x/dvm-loyal.md`, Tavily; undated in capture)
- marks: **harm/risk for investors** (guided date "end of 2025" vs status in Jan 2026: manufacturing still in progress) → Q-D13-11; undated primary artifact (RXE date only derivable from a later post's relative phrase) → clock problem; "first-ever" claim → Q-D13-17; financing announced alongside milestone → Q-D13-06. Frontier `frontier:companion-animal-longevity-drugs`.
- quotes:
  1. "We have extensive data supporting both and hope to have completed all the regulatory requirements by the end of 2025, making an FDA-approved longevity drug a reality for millions of dogs in the next year." — RXE post, chars 1336–1540
  2. "While our team was hard at work on this, we also raised an additional $22M as part of a B-2 funding round, bringing total investment in Loyal to over $150M since founding the company back in 2019." — RXE post, chars 1543–1739
  3. "This makes Loyal the likely recipient of both the first- and second-ever RXE acknowledgements from the FDA for longevity drug programs for any species — including humans." — RXE post, chars 978–1148
  4. "the FDA’s Center for Veterinary Medicine has accepted the Target Animal Safety (TAS) section of our Expanded Conditional Approval (XCA) application for LOY-002, Loyal’s lead drug candidate." — TAS post ¶1, chars 829–1018
  5. "In February of last year, the FDA also accepted LOY-002’s Reasonable Expectation of Effectiveness (RXE) package." — TAS post, chars 4489–4601
- answers: Q-D13-11, Q-D13-10, Q-D13-06, Q-D13-17, CQ-TM-03

## FC11 — Forecast artifacts: Metaculus 9592 and Manifold market (expansion; not recommended for the first three fixtures)

- url: https://www.metaculus.com/questions/9592/altos-labs-trials-an-anti-aging-intervention/ ; https://manifold.markets/Natalia/will-altos-labs-trial-an-antiaging
- title: "When will Altos Labs first trial an anti-aging intervention in humans?"; "Will Altos Labs trial an anti-aging intervention in humans by 2030?"
- retrieved: 2026-10-08 · tools: Firecrawl scrape (Metaculus; Tavily failed; API needs token), Tavily extract (Manifold)
- capture: `x/metaculus9592.fc.md` sha256 `99a28504967f54c3870128f4f60fc1b92d8ecae1f91964dddc48214e6b8a1e45`; `x/manifold-altos.md` sha256 `871bd714032ca1a0ef762c8629dbe901022b84eeb310d9152d7a7cd085661d88`
- marks: forecasts are snapshot facts (value at capture time); a community comment carries checkable claims (verified one against FC9).
- quotes:
  1. "# When will Altos Labs first trial an anti-aging intervention in humans?" — Metaculus title, chars 1031–1103
  2. "This resolves to \"YES\" if this Metaculus question" — Manifold resolution criteria, chars 141–190
  3. "Altos hired Joan Mannick as Chief Medical Officer in August 2025, its first clinical leader, but no Altos-sponsored study is listed on ClinicalTrials.gov as of today." — Manifold comment ("Status check, October 2026"), chars 897–1063
- answers: Q-D13-20, Q-D13-22

## FC12 — Longevity.Technology 2024 investment report release (aggregate claim with internal inconsistency)

- url: https://www.prnewswire.com/news-releases/longevity-investment-more-than-doubled-to-8-5bn-in-2024--302453871.html
- title: "Longevity investment more than doubled to $8.5bn in 2024" (Longevity.Technology via PRNewswire, May 13, 2025)
- retrieved: 2026-10-08 · tool: Tavily extract · capture `x/lt-invest.md` sha256 `f74e04c3163f0af2236e9591513b597d62b38efebfa71d57f133fe0437cb5bdf`
- marks: disconfirmation of an aggregate (same release states two deal counts for 2024).
- quotes:
  1. "with total financing reaching USD $8.49 billion across 331 deals." — lede, chars 3449–3514
  2. "2024 Total deal count: 325 deals (down from 331 deals in 2023)." — "Key report highlights", chars 6042–6105
- answers: Q-D13-24, Q-D13-23

---

Other captures available in `a7r/` for the fixtures stage (sha256 in `a7r-sha256.txt`): Cassava ReThink-ALZ release (BioSpace host), Insilico topline and Nature Medicine releases, XPRIZE Healthspan milestone release, Lifespan.io Rejuvenation Roadmap (Firecrawl, 160 KB), EMA PRIME page, ARPA-H PROSPR page, ARDD 2025 page, STAT evoke article (paywalled), Madrigal and Unity and BioAge EDGAR submission indexes.
