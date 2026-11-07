# Fixture product-comparison: the questions it answers

- **Where the ids come from.** Question ids come from the packets' `02-questions.md` files. Record ids refer to `assertions.yaml` (assertions, assessments, reportItems and decisionCriteria) and to `locators.yaml` (`l-*`).
- **What "computed" and "stored" mean.** "Computed" answers come from the read patterns in `walk.md`, run on 2026-10-09 against the loaded fixture. "Stored" answers are records in `assertions.yaml`.
- **Status of the content.** Research only, not medical advice. The criteria set `bl:compare:nr-products@1` is fixture-illustrative, not a BellLabs policy.

## Comparison (D10, D6, D8)

**Q-D6-03.** Rank or compare the products marketed for target T (e.g. NAD+ precursors) on declared dose, form, price per dose, certification scope and recall history, under a named, versioned decision criterion.

- **Expected answer.** Computed under `bl:compare:nr-products@1` at 2026-10-09:
  1. **NiaCel 400: rank 1, SELECTED.** NR hydrogen malate 415 mg per capsule, which is 272.8 mg/d of NR (PROPOSED). NSF Certified for Sport covers 19 named lots; lot score 1.
  2. **Tru Niagen: rank 2, ALTERNATIVE.** NR chloride 300 mg per capsule, which is 790.2 mg/d of NR. NSF Certified for Sport covers the 300 mg capsule with Lot # All; lot score 0.
  3. **Liposomal Nicotinamide Riboside+: NOT_EVALUATED.** 500 mg with the mass basis unstated. It is listed under NSF/ANSI 173 (Product ID All).
- **What is missing.** Price per dose is not computed for any option; see CQ-RC-03. Recall history was not searched, so this fixture has no recall record. The candidate set is not tied to a target: the criteria record no `targetKeys`.
- **Answered through.** walk.md section 3 (W2); `computedComparison`; `crit-*`.

**Q-D10-01.** Which option ranks best under criteria version V, and why, row by row, with each criterion value citing its assertion?

- **Expected answer.** The same three rows as Q-D6-03. Each `cellValues` entry names a criterion uid (with its version) and the Assertion or Assessment it rests on.
  - NiaCel 400: block → `k-nc-covers-414956`, filter → `c-nc-moiety`, lot score → `k-nc-covers-414956`, daily amount → `c-nc-day`, price → `as-price-nc`.
  - Codeage has no daily-amount or price citation, because those values are unknown, not 0.
- **Answered through.** W2; reportItems `cellValues`.

**Q-D10-02.** Show BellLabs' published comparison as of date D: rows, criteria versions, policy version, and the assertions each row rests on.

- **Expected answer.** No published comparison exists. The draft is `hu:report:fx-xfx-pc-comparison-draft-1`:
  - reportKind COMPARISON, skeleton `d10.product-comparison@1`, status PROPOSED, policy `policy:bl-publish@fixture`, `publishedAt` null.
  - bodyDigest sha256:8701c9c5…aa36b.
  - USES_CRITERION → 5 criteria @1.
  - 8 items: SCOPE, CRITERIA, OPTIONS, 3 ROWs, MISSING_OR_DISPUTED and INTERESTS.
  - The rows cite 7, 6 and 4 records.
  - The answer must say "draft, not published".
- **Answered through.** W5; `reports`, `reportItems`.

**Q-D8-19.** Rank or compare products of ingredient X on quality evidence (independent measured content vs claim, certification scope and currency, enforcement history), with the criteria and their versions shown.

- **Expected answer.**
  - **Certification scope and currency:** NiaCel has lot-scoped coverage (19 lots); Tru Niagen has variant-level coverage, all lots; Codeage has product-level coverage, all IDs. All three listings were observed on 2026-10-09 and none states a start date.
  - **Measured content:** no independent measurement of any lot was captured, so the answer says "no measurement", not "label confirmed".
  - **Enforcement history:** not searched.
- **Answered through.** `cl-*`, `k-*-covers`; W2.

**CQ-RC-01.** Why was one option preferred over another for a stated decision context, and which options were rejected or blocked, for which reason?

- **Expected answer.**
  - NiaCel is above Tru Niagen only on `bl:nr:lot-verifiable-certification@1`: 1 against 0.
  - The daily amounts (272.8 against 790.2 mg/d) are a reported column with weight 0 and are not used to order.
  - No option is BLOCKED.
  - Codeage is NOT_EVALUATED by the FILTER `bl:nr:declared-amount-convertible-to-moiety@1`.
- **Answered through.** `i-row-options-prod-*` `reason`; `crit-*`.

**CQ-RC-02.** Which evidence, applicability assessments, constraints, price/availability observations and policy version affected the decision?

- **Expected answer.** The input manifest:
  - **criteria:** the 5 @1 records
  - **label lines:** `dc-tn`, `dc-nc`, `dc-cg`
  - **serving maxima:** `f-*-maxdaily`
  - **CALCULATED amounts:** `c-tn-*`, `c-nc-*`
  - **curation:** `r02-realizes-nc`, `g06-moiety-mal`
  - **coverage:** `k-tn-covers`, `k-nc-covers-*`, `k-cg-covers`
  - **price observations:** `p-tn-30`, `p-nc-visible`, `p-nc-ldjson`
  - **assessments:** `as-res-nrhm`, `as-basis-cg`, `as-price-nc`, `as-pkg-tn`, `as-seal-nc`
  - **policy:** `policy:bl-publish@fixture`
  - **evidence:** the 2026-10-09 captures

  No D5 UseConstraint applies; there is no BLOCK by constraint.
- **Answered through.** `reports.citesAssertions` / `citesAssessments`; W3.

**CQ-RC-03.** Which missing or disputed facts could change the ranking?

- **Expected answer.** Five facts:
  1. **Codeage's salt form and mass basis.** The label is silent: `f-cg-massbasis-silent`, `as-basis-cg` INSUFFICIENT_EVIDENCE. A stated basis would admit Codeage to the ranked set, where it would tie with Tru Niagen at lot score 0. There is no tiebreak.
  2. **The NR hydrogen-malate resolution and moiety link.** Both are PROPOSED: `as-res-nrhm`, `g06-moiety-mal`. If either is rejected, NiaCel's moiety amount is withdrawn and NiaCel becomes NOT_EVALUATED.
  3. **The Thorne one-time price.** The page shows $74 and its schema.org markup says 44 USD: `as-price-nc` MIXED_OR_CONFLICTING.
  4. **The Tru Niagen store package.** GTIN 00850015311857 has no label version captured: `as-pkg-tn` INSUFFICIENT_EVIDENCE.
  5. **The certification coverage start dates.** None is stated. As of 2024-06-01, NiaCel's gate is "certification at T unknown" (W2 at T = 2024-06-01).
- **Answered through.** W7; section MISSING_OR_DISPUTED; `missingFactKeys`.

**CQ-RC-05.** Can the system distinguish "evidence favors", "BellLabs recommends", "a source recommends" and "a user selected"?

- **Expected answer.** Partly. The draft's SELECTED row is a BellLabs computed choice under fixture criteria, with status PROPOSED. It is not a publication and not an evidence verdict.
  - **Present:** NSF's coverage Assertions (asserter NSF), which are certifier statements, not recommendations.
  - **Absent:** no third-party ranking (RANKS_OPTION) and no efficacy Assessment were captured.
- **Answered through.** `reports.status`; asserters of `k-*`.

## Declared amounts and identity (D1, D6)

**CQ-PF-01.** Is a declared amount the listed ingredient as named, a nutrient, a blend total, an extract mass, or a marker constituent, and which calculated amounts follow from it with which rule?

- **Expected answer.** All three lines are AS_NAMED, PER_SERVING (1 capsule).
  - **Tru Niagen:** massBasis SALT_FORM (NR chloride). rule:mw-ratio.v1 gives 263.4 mg NR; rule:daily-max.v1 gives 790.2 mg/d.
  - **NiaCel 400:** massBasis SALT_FORM (NR hydrogen malate). It gives 272.8 mg NR and 272.8 mg/d. The previous label (SP654 LSP65403) gives 545.6 mg/d.
  - **Codeage:** massBasis UNSPECIFIED. No calculated amount is derived.
- **Answered through.** `dc-*`; `c-*`; W1.

**Q-D1-01.** What chemical substance is the active moiety of this labeled ingredient or form, and what is the form-to-moiety mass ratio, from which authority record and version?

- **Expected answer.**
  - **NR chloride** (8XM2XT8VWI, GSRS v18) → NR (0I8H2M0L7N, GSRS v24). The ratio is 255.2476 / 290.7006 = 0.8780429073761802.
  - **NR hydrogen malate** (PubChem CID 146673021, molecular weight 388.33) → NR. The ratio is 255.2476 / 388.33 = 0.657295599103855. The moiety link is BellLabs curation, PROPOSED, over PubChem components [222656, 439924] and the GSRS PUBCHEM code 439924. No authority states ACTIVE MOIETY for this salt.
- **Answered through.** `g01`–`g06`; `l-gsrs*`, `l-pc-*`.

**Q-D1-02.** How much of moiety or nutrient M does product P deliver per serving and per maximum recommended daily dose, normalized across salt forms?

- **Expected answer.**
  - **Tru Niagen:** 263.4 mg per capsule, 790.2 mg/d.
  - **NiaCel 400:** 272.8 mg per capsule, 272.8 mg/d (label SP654 LSP65404).
  - **Codeage:** unknown, because the mass basis is unstated.
- **Answered through.** `c-*-moiety`, `c-*-day`; W1.

**Q-D1-05.** Which products contain substance S in any form at or above dose D per day, as declared on the label observed at date V?

- **Expected answer.** For S = NR and D = 500 mg/d (an example threshold, not a safety reference):
  - **At V = 2026-10-09:** Tru Niagen (790.2 mg/d NR; 900 mg/d of the salt as declared).
  - **At V = 2024-06-01:** NiaCel 400 (545.6 mg/d under its previous label). The other two products had no captured label version on that date.
  - **Codeage:** it cannot be placed. It declares 500 mg once daily, but on an unstated basis.
- **Answered through.** W1 at both dates.

**Q-D1-06.** Where do label databases and identity authorities disagree, so that an automatic match should be rejected?

- **Expected answer.**
  - **Codeage:** DSLD attaches the moiety UNII 0I8H2M0L7N to a row that names no salt. Matching the 500 mg to the moiety would be an unsupported inference, so it is rejected (`as-basis-cg`).
  - **NiaCel:** the row "Nicotinamide Riboside Hydrogen Malate" has no UNII in DSLD and no GSRS record, and PubChem has no exact "hydrogen malate" synonym. The match is held at PROPOSED (`as-res-nrhm`).
- **Answered through.** `as-basis-cg`, `as-res-nrhm`.

**Q-D1-25.** As of date V, what form and amount of substance S did product P's label declare, and when did that declaration change?

- **Expected answer.** NiaCel 400 declares the same line (415 mg NR hydrogen malate) on both captured versions.
  - **SP654 LSP65403** (DSLD entry 2023-10-24): 1–2 capsules a day.
  - **SP654 LSP65404** (DSLD entry 2025-01-23): 1 capsule a day.

  The maximum NR per day falls from 545.6 to 272.8 mg/d. The end of the previous episode is not stated, so "current" means the latest start. DSLD relates the two versions as "Image difference, same product" (`l-nc-relation`).
- **Answered through.** `h-nc0`, `h-nc`; W1 at both dates.

**Q-D1-26.** Given a free-text ingredient string, which candidate substances, forms or materials match, at which identity level, with what evidence?

- **Expected answer.**
  - **"Niagen"** → material NIAGEN, which realizes NR chloride (8XM2XT8VWI). The source is the DSLD form row; the asserter is NIH ODS.
  - **"Nicotinamide Riboside Hydrogen Malate"** → PubChem CID 146673021 by formula and IUPAC components (PROPOSED).
  - **"Nicotinamide Riboside"** (Codeage) → NR cation 0I8H2M0L7N, at identity level only.
- **Answered through.** `r01`–`r03`; `as-res-nrhm`.

**CQ-ID-03.** Does a label declare a chemical substance, a material that realizes it, or a constituent the material is said to provide?

- **Expected answer.** All three labels declare a material that realizes a substance (`REALIZES_SUBSTANCE`). None declares a constituent. Codeage's material sits in a stated "NR - TMG - Pterostilbene phospholipid complex" (`l-cg-complex`), with no amount for the complex.
- **Answered through.** `r01`–`r03`; `mat-*`.

**CQ-ID-04.** Which external identifiers support a substance match, from which authority and release, and where do the authorities disagree?

- **Expected answer.**
  - UNII 8XM2XT8VWI (GSRS v18) and UNII 0I8H2M0L7N (GSRS v24).
  - PubChem CID 439924 on 0I8H2M0L7N, asserted by GSRS.
  - PubChem CID 146673021 for the malate salt, asserted by NCBI PubChem.
  - The salt has no GSRS record (search total 0).
- **Answered through.** `i-sub-*`.

**Q-D6-01.** What does the current label of this package declare per serving (amount, form, serving basis, directions including maximum daily servings, warnings, seals), since when was that label observed, and what did the previous label version say?

- **Expected answer.**
  - **NiaCel 400, 60 capsules** (GTIN 00693749012085):
    - **current, SP654 LSP65404:** 415 mg NR hydrogen malate per capsule, "Take 1 capsule daily…", seal "NSF Certified Sport", "Manufactured … by Thorne Research".
    - **previous, SP654 LSP65403:** the same line, "Take 1 capsule one to two times daily…".
  - **Tru Niagen, 30 capsules** (GTIN 00850015311116), V12.3: Niagen 300 mg as NR chloride, 1–3 capsules a day, seals Crescent M, Star-K and Alkemist Assured (no NSF seal), "Distributed by ChromaDex, Inc".
  - **Codeage, 60 capsules** (GTIN 00850049609210), Nr 23.2304.23L: Nicotinamide Riboside 500 mg, 1 capsule a day, "Caution: Do not exceed recommended dose.", "Manufactured for Codeage LLC".
- **Answered through.** `lv-*` properties and `propertyEvidence`; `f-*-maxdaily`; `n-*`.

**Q-D6-02.** What is the price per effective daily dose of compound C across products available now?

- **Expected answer.** Not computed for any option. Each reason is a stored record:
  - **Thorne:** two prices in one snapshot.
  - **Tru Niagen:** the store package has no label version.
  - **Codeage:** no offer captured.

  The observed prices are Tru Niagen store "30" 49.00 USD (`p-tn-30`) and Thorne 74 or 44 USD (`p-nc-*`, DISPUTED).
- **Answered through.** W7; `as-price-nc`, `as-pkg-tn`.

## Quality records (D8)

**CQ-PF-03.** What does a certification actually cover (product, listed product ID, lot/batch, or facility), under which programme or standard, as of when; and does the label's certification claim fall inside that scope?

- **Expected answer.**
  - **NSF Certified for Sport 1263423:** the variant Tru Niagen 300 mg capsule, all lots, packages 30/60/90, US, observed 2026-10-09T04:19:47Z. The V12.3 label prints no NSF seal.
  - **NSF Certified for Sport 1423140:** 19 lots of NiaCel 400, package 60, US. The label's "NSF Certified Sport" seal is backed for a bottle whose lot is listed (`as-seal-nc` SUPPORTED_WITH_QUALIFICATION).
  - **NSF/ANSI 173:** Codeage "Liposomal Nicotinamide Riboside+", Product ID All, "current as of" 2026-10-09T04:15:00Z.
- **Answered through.** `cl-*`, `k-*-covers`, `k-*-issued`; `as-seal-nc`.

**Q-D8-08.** Is lot or batch L listed by a certifier, with what test date and expiry, and has the listing lapsed or the lot dropped off since it was last observed?

- **Expected answer.**
  - Lots 414956 and 417281 are listed under NSF Certified for Sport 1423140, observed 2026-10-09T04:19:47Z. The page shows no test date and no expiry.
  - Lot 999999 has no record. "No record in NSF 1423140 as of 2026-10-09" is the answer, not "not certified anywhere".
  - Drop-off detection needs a second observation; only one exists.
- **Answered through.** W6.

## Provenance and lineage (K)

**Q-K-03.** Which run wrote this node, edge or assertion, with which agent?

- **Expected answer.**
  - **Label, curation and coverage records:** `run:ft-S-xfx-product-ingest` (INGESTION), with agent `agent-s` associated.
  - **CALCULATED amounts:** `run:ft-S-xfx-product-project` (PROJECTION, d1-amounts/v1), with `agent-proj`.
  - **Criteria and report:** `run:ft-S-xfx-product-compare` (ANSWER, bl-compare/v1), with `agent-cmp`.
- **Answered through.** `generatedBy`; W4.

**Q-K-06.** Which downstream artifacts depend on something mission M produced?

- **Expected answer.** The SELECTED row rests on two runs of `mission:ft-S-xfx`: 32 ingestion records and 2 projection records. Through DERIVED_FROM, every row and the report depend on both runs.
- **Answered through.** W4.
