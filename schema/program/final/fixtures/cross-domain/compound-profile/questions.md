# Cross-domain fixture 1: compound profile (nicotinamide riboside) - questions answered

Compound: nicotinamide riboside (NR), the cation `sub-nr` (UNII 0I8H2M0L7N), sold and tested as the chloride salt `sub-nrcl` (UNII 8XM2XT8VWI) in the branded material NIAGEN (`mat-niagen`).
Record ids refer to `assertions.yaml` (nodes, `a-*` / `f-*` / `m-*` / `c-*` assertions, `ap-*` / `r-*` assessments) and `locators.yaml` (`l-*`).
"Kind" is D10's ruling in `packets/D10/answer-kind-table.md`. "Path" names the walk statement in `walk.md` that returned the answer on the fixture graph
(W = fixture walk, P = `final/query-patterns.md` pattern run unchanged, G = GraphQL document executed against the final SDL).
Every number below is a value in a captured source or the output of a recorded command. Research, not medical advice.

## The cross-domain question

**"For NR: what is it, what do labels declare, what did human trials give and find, which mechanism steps were measured, and what argues against it?"**
W0 answers it in one statement: NR ← HAS_ACTIVE_MOIETY ← NR chloride ← REALIZES_SUBSTANCE ← NIAGEN, then three branches through the material and the moiety:

- D6: Tru Niagen 300 mg label V12.3 declares 300 mg NIAGEN per capsule, SALT_FORM, maximum 3 capsules/day.
- D3: NCT02712593 (1000 mg/d arm: whole blood NAD+ +142 ± 14 % at day 14; 95 AEs in 61 participants across all arms; no serious AEs) and NCT02950441 (1 g/d for 21 days).
- D2: whole blood NAD+ up; in muscle, NAAD up, while NAD+ and protein deacetylation show no change.

## Per-question answers

| question | packet · value · polarity | kind | expected answer from this fixture | path |
| --- | --- | --- | --- | --- |
| CQ-AX-25 | D6 · 1 · neutral | retrieved | At V = 2026-10-09, Tru Niagen 300 mg (package GTIN 00850015311116) has label V12.3 valid from 2025-04-24 (PUBLICATION_PROXY, end unknown). The label declares NIAGEN at 300 mg per serving (1 capsule): lineRole DIETARY_INGREDIENT, amountReferent AS_NAMED, massBasis SALT_FORM. NIAGEN realizes NR chloride, whose active moiety is NR. | W2, G1, P-02b |
| CQ-PF-01 | D1 · 1 · neutral | retrieved | The 300 mg is the branded material as named, on the salt basis. The DSLD row is "Niagen" with no UNII, and its form is "Nicotinamide Riboside Chloride" with UNII 8XM2XT8VWI (`a-tn-line-niagen`, l-dsld-row-*). | W2, G1 |
| Q-D1-01 | D1 · 1 · neutral | retrieved | NR chloride (8XM2XT8VWI, GSRS record version 18, MW 290.7006) → ACTIVE MOIETY → NR (0I8H2M0L7N, version 24, MW 255.2476, charge 1) (`a-moiety`, `a-mw-salt`, `a-mw-nr`). The mass ratio under rule:mw-ratio.v1 is 0.878043. | W1 |
| Q-D1-02 | D1 · 1 · neutral | materialized | At the label maximum: 900 mg/d of NR chloride (`c-label-max-salt`, rule:daily-max.v1) = 790.24 mg/d of NR cation (`c-label-max-moiety`, rule:mw-ratio.v1). The per-serving cation figure (263.41 mg) was computed in the runlog but is not stored here; packet D1 `nr-salt-moiety-us-canada` c01 holds it. | W2 |
| Q-D1-05 | D1 · 1 · neutral | retrieved | A screen for "≥ 500 mg/d NR in any form" returns Tru Niagen V12.3 (790.24 mg/d cation, 900 mg/d salt), as declared on the label observed in DSLD (entered 2025-04-24). | W2 |
| Q-D1-08 | D1 · 2 · harm | assessment | Conze 2019's "1000 mg NR" is NR chloride mass: the capsules held 100 or 250 mg of NR chloride (99 % purity), and 1000 mg = 4 × 250 mg (`ap-dose-basis`). The cation equivalent is 878.04 mg/d (`c-moiety-trial`). Paper and registry agree on material (Niagen™ 1000) and arms. The paper's printed registry id NCT0271593 does not exist (HTTP 404, `r-registry-id`). Elhassan 2019 does not state its mass basis (`ap-dose-basis-el`, INSUFFICIENT_EVIDENCE). | W7a, P-02a |
| CQ-ID-04 | D1 · 2 · neutral | retrieved | 22 identifiers, each with its asserter and a locator: UNII, CAS_RN and PUBCHEM_CID for both substances, and CHEBI and DRUGBANK for NR, all from FDA GSRS (record versions 18 and 24); CHEBI:15846 and CHEBI:18304 (EMBL-EBI OLS4); GO:0006476 (QuickGO); PMID/PMCID/DOI for both papers; NCT for both studies; GTIN and DSLD for the label; ORCID for Charles Brenner. | W1 |
| CQ-ID-06 | D1 · 1 · harm | assessment | Both trials administered NIAGEN, the label's material. In Conze 2019 the capsules were NR chloride at 99 % purity (paper and registry both assert ADMINISTERS). In Elhassan 2019 they were "NR chloride (Niagen)" 250-mg capsules provided by ChromaDex (`a-adm-el`, `a-el-role-material`). No lot is stated in either trial. | W3, G2 |
| CQ-ST-01 | D3 · 1 · neutral | retrieved | NCT02712593, 1000 mg arm: NIAGEN 1000 mg/d (4 × 250 mg capsules of NR chloride, 99 %) for 56 days. The 100 mg, 300 mg and placebo components are kept as verbatim text (not resolved here). NCT02950441, NR arm: NIAGEN 1 g/d for 21 days; the paper says capsules and the registry says tablets. | W3, G2 |
| CQ-ST-02 | D1/D3 · 1 · neutral | assessment | The path type is SAME_MATERIAL: DECLARES_COMPONENT and ADMINISTERS both target NIAGEN. Dose: the label maximum of 900 mg/d is below the tested 1000 mg/d on the same salt basis (study/use 1.11). See CQ-EV-04. | P-03, W6 |
| CQ-EV-04 | D3 · 1 · neutral | assessment | `ap-label-vs-trial` (parent UNKNOWN_MISSING_FACTS = weakest dimension), weakest first: outcome UNKNOWN_MISSING_FACTS (missing use-outcome); duration UNKNOWN_MISSING_FACTS (missing use-duration; the study ran 56 days); population APPLIES_WITH_ADJUSTMENT (missing age-range); dose APPLIES (score 1.11); material APPLIES (missing lot). | P-03 |
| CQ-ST-06 | D3 · 1 · harm | retrieved | Conze 2019 (ITT, all four arms): 95 AEs in 61 participants, no serious AEs and no flushing (`sr-cz-ae-any`, `sr-cz-ae-serious`). The AEs are not broken down per arm: Table 2 was not extracted, and "not extracted" does not mean zero. Collection method NOT_DESCRIBED. | W7d, W3, G2 |
| Q-D3-02 | D3 · 2 · harm | retrieved | NCT02712593: COMPLETED, primary completion 2017-03-17, `hasResults` false; a publication exists but is linked only through `r-registry-id`. NCT02950441: overall status UNKNOWN, last known RECRUITING, last update posted 2017-06-07, although the 2019 paper reports a completed trial. | W3, P-02b |
| Q-D3-08 | D3 · 1 · harm | retrieved | NCT02712593: LEAD_SPONSOR KGK Science Inc. (registry), COLLABORATOR ChromaDex, Inc. (registry), FUNDER ChromaDex (paper: "ChromaDex funded the study."). NCT02950441: LEAD_SPONSOR University of Birmingham (registry), MATERIAL_PROVIDER ChromaDex (paper). Charles Brenner: ADVISOR to ChromaDex (both papers) and EQUITY in ChromaDex (Elhassan 2019). The papers' statement that Conze and Kruger are ChromaDex employees is captured in l-cz-coi but not written as HOLDS_ROLE. | W6 |
| Q-D3-09 | D3 · 2 · harm | retrieved | ChromaDex, Inc., distributor of Tru Niagen, collaborated on and funded NCT02712593: no registry results are posted. The registered primary outcome (urinary methylnicotinamide) is not captured here, so whether the primary result was null is unknown in this fixture. The company's own descriptions of these trials are not captured. | W6, W3 |
| Q-D3-13 | D3 · 1 · neutral | retrieved | For each number of `sr-cz-nad-d14`: estimate 142 and dispersion 14 come from l-cz-day14 (TEXT_QUOTE, 48667–48867), the dispersion kind from l-cz-sem (QUALIFIES; Figure 3 caption), and statistical significance from l-cz-abstract-result. All are in snapshot sha256:ae7b5a42…, retrieved 2026-10-09T04:17:00Z. The CAPTURE_FIDELITY adjudication is DIRECTLY_SUPPORTED / PASS, from run run:ft-S-xfx-compound-verify. | P-01b, P-04d, W5, G4 |
| Q-D3-14 | D3 · 2 · neutral | retrieved | Chunk `chunk-cz-sec6` (28532–30482) MENTIONS NR chloride, and `chunk-cz-par26` (47473–49087) MENTIONS NAD(+). Through COVERS_LOCATOR they reach ADMINISTERS, QUANTITY, ADMINISTERED_MATERIAL_PURITY, arm STATED_IN, the day-14 STATED_IN and the INCREASES_LEVEL_OF assertions. The chunk is never the citation. | P-04b, P-04e, W9 |
| Q-D3-15 | D3 · 2 · harm | retrieved | Dosage form of the NCT02950441 component: "tablet" (University of Birmingham, registry) vs "capsule" (Elhassan 2019). Trial id: NCT0271593 (as printed in Conze 2019) vs NCT02712593 (registry). Placebo arm: the registry types it EXPERIMENTAL; the paper calls it placebo. Each pair is kept, with its asserter and locator. | W7c, W7a |
| CQ-MX-01 | D2 · 1 · neutral | retrieved | Per-step basis for NR, all DIRECT_MEASUREMENT in HUMAN_INTERVENTIONAL settings: whole blood NAD+ INCREASES (Conze 2019); muscle NAAD INCREASES (2-fold, p = 0.004); muscle NAD+ NO_CHANGE (p = 0.22); muscle protein deacetylation NO_CHANGE (pan-acetylation proxy). | W4, G3 |
| CQ-MX-02 | D2 · 1 · neutral | retrieved | Two contexts. (1) 12 aged men, vastus lateralis (UBERON:0001379), tested exposure NIAGEN, arm "Nicotinamide Riboside" of NCT02950441, dose of record 1 g/d, P21D. (2) The 1000 mg arm of NCT02712593, whole blood (UBERON:0000178), dose of record 1000 mg/d, P56D. | W4, G3 |
| CQ-MX-03 | D2 · 1 · harm | retrieved | Yes. The sirtuin step was measured in humans and was null: no NR-mediated change in muscle protein acetylation (`m-el-deacetylation`, l-el-acetyl). The derived AFFECTS_MECHANISM NR → protein deacetylation has direction NO_CHANGE, humanMeasured true, nHumanContexts 1, score null. | W4b, P-12 |
| Q-D2-01 | D2 · 1 · neutral | retrieved | The mechanism claims for NR in this fixture come from two peer-reviewed papers (asserter = the Publication, R-15): protein deacetylation (NO_CHANGE) plus the NAD+ metabolome rows of CQ-MX-01. Best basis DIRECT_MEASUREMENT, highest setting HUMAN_INTERVENTIONAL. | W4, W4b |
| Q-D2-04 | D2 · 1 · harm | retrieved | Blood NAD+ rose in the label material's dose-ranging trial. In human muscle, NAD+ itself did not rise, and the one downstream step measured (protein deacetylation) did not change. In the captured evidence, the blood biomarker does not track the muscle steps. | W7b, W4 |
| Q-D2-13 | D2 · 2 · neutral | retrieved | The NAD+ metabolome was measured in human whole blood (Conze 2019) and in human skeletal muscle tissue (Elhassan 2019): there is tissue evidence, not only blood. | W4 |
| Q-D2-21 | D2 · 2 · harm | retrieved | All four mechanism findings come from sources with a disclosed ChromaDex interest. Elhassan 2019: C.B. (= Charles Brenner, `r-cb`) owns ChromaDex stock and advises ChromaDex. Conze 2019: ChromaDex funded the study and Brenner is chief scientific adviser. (R-89 pattern: HOLDS_STAKE / HOLDS_ROLE.) | W6 |
| Q-D2-26 | D2 · 2 · harm | retrieved | For NR → muscle: the NAD+ step measured in muscle shows NAAD up and NAD+ flat, and the sirtuin step is null. The chain breaks at its first muscle step. | W4, P-12 |
| Q-D6-01 | D6 · 1 · neutral | retrieved | Current label V12.3: Niagen (as nicotinamide riboside chloride) 300 mg per 1 vegetarian capsule. "Suggested use: Adults take one capsule 1-3 times daily …" (maxDailyServings 3). Distributed by ChromaDex, Inc. The earlier versions are in packet D6 `label-versions-truniagen-dsld`. | W2, G1 |
| Q-D6-09 | D6 · 2 · harm | retrieved | The maximum declared daily intake is 900 mg/d of NR chloride. No safety reference value (UL) is captured here, so no comparison is made. Context only: the closest tested human dose is 1000 mg/d for 56 days with no serious AEs (one trial, ITT). | W2, W7d |
| Q-D6-15 | D6 · 1 · neutral | assessment | GTIN 00850015311116 (printed "8 50015 31111 6"; mod-10 check digit 6 verified) identifies the 30-count package (asserter NIH ODS). The other GTINs are in packet D6. | W2, P-02b |
| Q-D6-16 | D6 · 1 · neutral | retrieved | For organization ChromaDex, Inc.: label role DISTRIBUTED_BY on Tru Niagen V12.3 (`a-tn-responsible`, asserter NIH ODS). | W6, G1 |
| Q-K-01 | K · 1 · neutral | retrieved | For `a-sr-nad-d14`: asserter Publication pub-conze; 5 located spans (roles SUPPORTS ×3, QUALIFIES, CONTEXT); snapshot sha256:ae7b5a42…; one CAPTURE_FIDELITY adjudication (DIRECTLY_SUPPORTED, PASS). | P-01b, G4 |
| Q-K-03 / Q-K-04 | K · 2 / 1 · neutral | retrieved | Mission mission:ft-S-xfx-fixtures produced 3 runs. The ingest run created 79 Assertions, 12 Assessments, 22 Identifiers, 99 SourceLocators, 13 Sources, 13 SourceSnapshots and the domain nodes. The projection run created 3 CALCULATED Assertions and 2 Chunks and wrote AFFECTS_MECHANISM 1, MENTIONS 3, COVERS_LOCATOR 5. The verify run wrote 82 Adjudications. | P-10a, P-10a.2–4, P-10b |

## Harm and disconfirmation items (at least one required)

1. **Mechanism disconfirmation:** `m-el-deacetylation` (protein deacetylation NO_CHANGE, human muscle) and `m-el-nad` (muscle NAD+ NO_CHANGE). They sit beside `m-cz-nad-blood` (blood NAD+ INCREASES).
2. **Provenance disconfirmation:** `a-cz-printed-id` (NCT0271593, HTTP 404) and `r-registry-id`.
3. **Source disagreement:** `f-el-form-registry` (tablet) vs `f-el-form-paper` (capsule).
4. **Harm reading:** `sr-cz-ae-any` / `sr-cz-ae-serious`. The search for serious harm in this trial found none, which is not the same as no evidence of harm. Every source of the mechanism findings has a disclosed financial interest (Q-D2-21).

## Not answered by this fixture

- Target-centric questions (P-06, P-07), because there is no D5 Target.
- A biomarker test for NAD+ (P-12 hops 2–4): `biomarker` is null and `tests` is `[]`. Packet D4 fixture `nr-nad-compound-to-test` covers those hops.
- Any comparison with a safety reference value.
- The per-arm AE table.
