# D12 research notes for the model stage (2026-10-08)

Inputs: `01-ecosystem.md` (sources S1–S38), `02-questions.md` (Q-D12-01..34), `_notes/fixture-candidates.md` (FC1–FC10), `_notes/tool-log.md`. Kernel pattern status: A1's `packets/K/` is still the skeleton at the time of writing (09-reasoning.md has only headings) → write subject/object/identifier edges against the placeholder interface `Subjectable` and rebase later. Targets vocabulary is published by A5 (`biotech-knowledge-services-A5/schema/program/packets/D5/vocab-targets.yaml`, v0.1.0): node `Target` (`hu:target:<slug>`), effect predicates `INTENDED_FOR_TARGET | IMPROVES_TARGET | WORSENS_TARGET | NO_EFFECT_ON_TARGET | MIXED_EFFECT_ON_TARGET`, population qualifier `APPLIES_TO_POPULATION`, **no typed edge from a means to a Target**. D12 consumes that vocabulary as-is.

## 1. The core decisions the model stage must make (with the evidence that drives each)

### 1.1 What is a FoodItem and what is a Product

- **FoodItem (D12)** = a reference food concept *as one composition or ontology source defines it, at the preparation it names*. Evidence: FDC treats "Potatoes, russet, flesh and skin, raw" (170027) and "…, baked" (170030) as separate records [S2, S3]; Foundation records aggregate analytical samples [S4, S5]; FNDDS foods are recipes over SR ingredients with validity dates [S6]. Identity: (defining system, verbatim description) with the record id as an `Identifier` (FDC_ID, NDB_NUMBER, FNDDS_FOOD_CODE, FOODON_IRI). Keep the pinned rule: an FDC ID identifies a dataset record; two FDC records may resolve to one FoodItem (SR Legacy 170027 vs Foundation 2346401 are *different* foods — with vs without skin — so they do not merge).
- **Product (D6)** = anything sold by an organization: packaged foods (OFF records [S22, S23]), restaurant menu items (McDonald's [S8], Wendy's UK [S9]), longevity-food products (Blueprint EVOO [S15], Prolon kit [S26]). It has a formulation/ingredient statement, declared nutrition with an as-of date, allergens, market/jurisdiction variants, price. A fast-food chain's item is a Product, not a FoodItem.
- **The awkward middle**: reference databases contain brand-named records ("McDONALD'S, french fries", FDC 170721, SR Legacy, historical [S1]). Recommendation: these are **FoodItems** (a reference source's concept, frozen 2019) with a `brandNameVerbatim`-style property, linked to the current D6 Product by one asserted edge (working name `HAS_REFERENCE_FOOD`, Product → FoodItem). Never merge them: the reference record implies ~378 kcal per 117 g medium serving while the chain declares 320 Cal today (our arithmetic over [S1, S8]) — two dated assertions, not one fact.
- Market variants: one GTIN can carry two national formulations in crowd data (Nutella EN 8.7 % vs FR 6.6 % milk powder [S22]); US vs UK fries differ in ingredients and declare sodium vs salt [S8, S9]. That is D6 variant/jurisdiction modeling; D12 only needs `HAS_REFERENCE_FOOD` to point at the right variant.

### 1.2 What a preparation does to composition (no node per cooking method)

Three shapes appear in sources:
1. **Separate reference records per preparation** (FDC raw vs baked [S2, S3]) → two FoodItems + `VARIANT_OF {variantKind: PREPARATION, preparationMethod}` (pinned edge, keep; it already has `FoodVariantProperties`). Q-D12-02 traverses base → variant and compares composition.
2. **Stated change with conditions** ("reduced by 40-50% after 10 minutes frying at 180°C, and by about 90% after six frying operations" [S14]) → an **Assertion** with predicate `PREPARATION_CHANGES_CONTENT` (subject FoodItem, object D1 compound; properties/qualifiers: preparationMethod enum, temperatureC, durationIso, cycles, percentChangeLow/High, direction). No node.
3. **Preparation-formed hazards** ("Acrylamide forms during high-temperature cooking, such as frying, roasting, and baking" [S11]; IARC on high-temperature meat cooking [S18]) → Assertion predicate `FORMS_DURING_PREPARATION` (subject D1 compound, object FoodItem or FoodCategory, qualifier preparationMethod); measured levels in purchased samples are D8 measurement records or composition assertions with `contentStatementKind: MEASURED_SAMPLE` (decide with D8; see 4).
Enum `PreparationMethod` (proposal): RAW, BOILED, STEAMED, BAKED, ROASTED, FRIED_DEEP, FRIED_PAN, GRILLED_OR_BARBECUED, MICROWAVED, SOUS_VIDE, FERMENTED, DRIED, SMOKED, CURED, CANNED, REFINED, PASTEURIZED, STORED, OTHER, NOT_STATED. Keep the source's verbatim descriptor too (`processingMethods` stays).

### 1.3 Composition: what a food delivers, how much, how sure

- Keep a typed asserted edge FoodItem → D1 `Compound`/`Nutrient` (pinned `QUANTITATIVELY_CONTAINS` with `QuantitativeContentProperties`, already carrying W05-SR-04 extensions `portionBasis`, `valueDerivation`, `sourceDerivationCode`, `dataPoints`, `minValue`, `maxValue`). It earns its type: Q-D12-01, 02, 21, 20, 24 filter and traverse it; FDC/Phenol-Explorer populate it; FC2/FC6 are fixtures. Edge properties the questions filter on: amount, unitCode, basis/portionBasis, valueDerivation (ANALYTICAL | CALCULATED | IMPUTED | MANUFACTURER_SUPPLIED | ASSUMED_ZERO; FDC codes A, NC, MA, … [S1]), dataPoints, min/max, plus the source data type (Foundation / SR Legacy historical / survey recipe / crowd) — consider a `FoodDataType` enum on the authorizing Assertion or the Source rather than the edge.
- Portions are properties of the FoodItem (`portions: [name, gramWeight]` as a JSON-ish list or a small embedded string) — FDC gives small 71 g / medium 117 g / large 154 g / kids 31 g [S1]; per-serving answers are computed at query time (basis conversion = derived number with `derivationRule`, PLAN 6.2).
- Polyphenols and contaminants are not in FDC [S4, S1]; Phenol-Explorer [S14] and FDA surveys [S11] populate the same edge (polyphenols) or D8 measurements (contaminants).
- Product (D6) declared nutrition is **not** this edge; it is D6's label declaration. The two meet only through `HAS_REFERENCE_FOOD`.

### 1.4 Food categories, NOVA and hazard groups (one small node)

Questions Q-D12-08, 14, 15, 26, 31 need to filter and traverse through *source-defined food groups*: NOVA group 4 [S36], IARC "processed meat" Group 1 [S17, S18], DGA "highly processed foods" [S19], WWEIA "Burgers" 3702 [S6], FDC SR "Fast Foods" [S1]. Candidate node **`FoodCategory`** (identity = system + code; properties: system enum, code, label, definitionVerbatim, version). Membership:
- source-stated (an FDC record's category; an IARC agent definition) → asserted edge `IN_FOOD_CATEGORY` (FoodItem|Product → FoodCategory);
- computed (NOVA from ingredient markers, as OFF does with `nova_groups_markers` [S22]) → **derived** read-only edge with method version (directive 3.6/R8), never asserted. Consider two relationship types or one with `class` on the edge properties — the model stage decides by the directive's rule that derived edges are `@settable(false)`.
Harm/benefit of a category is never a property: IARC's Group 1 is an Assertion (predicate `HAS_HAZARD_CLASSIFICATION`, subject FoodCategory, value "Group 1", classifier as asserter) and target effects are D5 predicates (`WORSENS_TARGET`) with population qualifiers. Pinned `foodGroup`/`foodGroupSystem` strings on FoodItem become redundant if FoodCategory exists (merge them).

### 1.5 Dietary patterns: D12 node or D5 intervention?

Evidence: patterns are defined by a source and version (DGA 2025–2030 [S19]; PREDIMED arms "Mediterranean diet supplemented with extra-virgin olive oil … or mixed nuts" vs "advice to reduce dietary fat" [S30]; Hall's NOVA-classified 7-day menus [S28]; TRE as a timing rule [S34]). Two kinds: **composition patterns** (what foods, how much: Mediterranean, UPF-avoidance, carnivore) and **timing/behavior patterns** (TRE, fasting-mimicking). Registries mis-type diets as `DIETARY_SUPPLEMENT` [S29].
Recommendation to test: a D12 node **`DietaryPattern`** (identity = defining source + name + version) holding only composition (edge `PATTERN_COMPONENT` DietaryPattern → FoodItem|FoodCategory with `role` enum INCLUDES | EMPHASIZES | LIMITS | EXCLUDES and optional quantity), serving Q-D12-11, 08, 23; timing patterns stay D5 `Protocol`/`Lifestyle`. A D3 arm administers a DietaryPattern through D3's arm→intervention edge (seam). If D5 publishes an Intervention/Protocol node that can carry a composition list, merge DietaryPattern into it and keep only `PATTERN_COMPONENT` in D12 → contest in 11-open-questions.md.

### 1.6 Harm beside the alleged longevity foods (directive 3.2, 3.3)

Every harm in the captures is expressible without "good/bad" properties:
| harm | carrier | owner |
| --- | --- | --- |
| UPF exposure worsens energy balance / mortality associations [S28, S32, S35] | target-effect Assertions (subject FoodCategory NOVA:4 or DietaryPattern) + D10 assessments with grading method (credibility class vs GRADE disagree in the same row [S32]) | D5 predicates, D10 assessment, D12 subject |
| acrylamide formed by frying, brand-level levels [S11] | `FORMS_DURING_PREPARATION` assertion + measured levels (D8) on the D6 Product | D12 + D8 |
| lead/chromium in a packaged food via an ingredient [S12, S13] | D8 measurement + recall/regulatory events; D6 Product; D7 organizations by supply-chain role; D12 only if a FoodItem (cinnamon, ground) is the vehicle | D8 lead, D12 seam |
| processed meat carcinogenicity [S18] | `HAS_HAZARD_CLASSIFICATION` assertion on FoodCategory; quantified risk as an Assertion with portion and outcome | D12 subject, D5/D8 vocabulary |
| grapefruit–drug interaction [S21] | D5 interaction assertion with a FoodItem participant | D5 |
| allergens [S8, S9] | D6 declaration on the Product (formulation) | D6 |
| misleading longevity claims (400 mg/kg "polyphenols" vs EU hydroxytyrosol condition) [S15, S16] | D10 assessment comparing claim measurand to regulatory measurand | D10 + D8 |
| retracted/disconfirmed food evidence (PREDIMED, MCE, TREAT, blue zones) [S27, S30, S33, S34] | Claim/ClaimOccurrence timeline + publication status + vetting assessment | K/D10, D3, D9 |

## 2. Candidate types for D12 (budget ≤ 8 nodes, ≤ 14 relationship types, ≤ 35 pairs)

| candidate | decision to propose | questions that need to filter/join/traverse through it | populated by |
| --- | --- | --- | --- |
| `FoodItem` | **node** (rehome from W05; drop the IngredientMaterial specialization unless D1 needs it — see 4) | Q-D12-01, 02, 04, 05, 21, 24, 30, 34 | FDC API, Phenol-Explorer, FoodOn |
| `FoodCategory` | **node** (new; absorbs `foodGroup`/`foodGroupSystem`, the CQ-FL-C05 "source-defined food group" candidate) | Q-D12-08, 14, 15, 26, 31 | FDC categories, WWEIA, NOVA (computed), IARC, DGA |
| `DietaryPattern` | **node, contested with D5** | Q-D12-08, 11, 12, 23 | guideline PDFs, trial arms, protocol pages |
| Preparation | **enum + Assertion predicates**, no node | Q-D12-02, 03 | FDC variants, Phenol-Explorer, FDA acrylamide |
| Exposure (pinned) | **defer to D5/D8** (characterized exposures such as RfDs are safety; no D12 question filters through it) | — | — |
| Lifestyle (pinned) | **D5** (practice concepts); dietary patterns split out per 1.5 | — | — |
| Nutrient / Constituent / Compound | **D1** (consumed) | — | — |
| Recipe / Meal / person's intake | **out** (private or not asked) | — | — |

Relationship candidates (working names; class; pairs):
| type | from → to | class | questions | pairs |
| --- | --- | --- | --- | ---: |
| `VARIANT_OF` | FoodItem → FoodItem | asserted | Q-D12-02, 01 | 1 |
| `QUANTITATIVELY_CONTAINS` (D12 side) | FoodItem → D1.Compound, D1.Nutrient | asserted | Q-D12-01, 02, 21, 24 | 2 (seam) |
| `IN_FOOD_CATEGORY` | FoodItem, D6.Product → FoodCategory | asserted (source-stated) | Q-D12-14, 15, 26 | 2 |
| `COMPUTED_FOOD_CATEGORY` (or derived flag) | FoodItem, D6.Product → FoodCategory | derived, method-versioned | Q-D12-14, 31 | 2 |
| `PATTERN_COMPONENT` | DietaryPattern → FoodItem, FoodCategory | asserted (or structural for a curated definition) | Q-D12-11, 08 | 2 |
| `HAS_REFERENCE_FOOD` | D6.Product → FoodItem | asserted | Q-D12-04, 05, 30, 34 | 1 (seam) |
| `FOOD_SIMILAR_TO` | FoodItem → FoodItem | derived (GDS), expansion | Q-D12-20 | 1 (defer unless budget is spare) |
Estimated: 3 nodes, 6–7 relationship types, 10–11 pairs, widest union 2. Subject/object/identifier/mention edges come from the kernel pattern (not counted here).

Predicate-only (`Assertion.predicate`) candidates: `PREPARATION_CHANGES_CONTENT`, `FORMS_DURING_PREPARATION`, `HAS_HAZARD_CLASSIFICATION`, `DERIVED_FROM_TAXON` (FoodItem → D1 taxon; promote only if a question traverses it), `CONTAINS_CONTAMINANT` (if D8 does not own measured contaminant levels for reference foods), plus D5's target-effect predicates and D9's recommendation occurrences used as-is.

Properties / enums to propose: FoodItem {descriptionVerbatim, preparationMethod (enum), processingMethods [verbatim], productionType, scientificNameVerbatim, brandNameVerbatim (reference-DB brand records only), portions, sourceDataType (FOUNDATION | LEGACY_REFERENCE | SURVEY_RECIPE | BRANDED | CROWD | OTHER), isHistoricalReference, validFrom/validTo for FNDDS-style validity [S6]}; FoodCategory {system (NOVA | IARC_AGENT | WWEIA | FDC_SR | FOODEX2 | LANGUAL | FOODON | GUIDELINE | SOURCE_DEFINED), code, label, definitionVerbatim, systemVersion}; DietaryPattern {name, definingSourceUid, version, patternKind (COMPOSITION | TIMING | MIXED)}.

Bitemporal: episodes needed on `HAS_REFERENCE_FOOD` (a product's mapping changes with reformulation; McDonald's "as of January 2022" [S8]) and on composition edges whose source revises values (FDC releases; OFF `rev` [S22]); `VARIANT_OF`, `IN_FOOD_CATEGORY` (source-stated), `PATTERN_COMPONENT` (versioned by the pattern's own version) can be recorded-time only. Valid time of a measurement = sampling period (FDA acrylamide 2002–2004 [S11]), not retrieval date.

## 3. Retrieval patterns to carry into 03-retrieval-patterns.md

- Q-D12-01/21: `(f:FoodItem)-[c:QUANTITATIVELY_CONTAINS]->(x)` filtered by x uid and `c.portionBasis`, ordered by amount; trace via `c.assertionUid` → Assertion → SourceLocator (JSON pointer for FDC) → SourceSnapshot.
- Q-D12-02: `(v:FoodItem)-[:VARIANT_OF {variantKind:'PREPARATION'}]->(b:FoodItem)` then both composition sets, plus `PREPARATION_CHANGES_CONTENT` assertions on b; basis-normalised difference is computed at query time (water loss changes per-100 g values).
- Q-D12-04/30: D6 Product declaration (as-of) ∪ `HAS_REFERENCE_FOOD` → FoodItem composition; return both with valid/recorded time; never merge.
- Q-D12-08/26: QP-TARGET-01 from A5 with `$directions = ['WORSENS_TARGET']`, subject ∈ FoodItem ∪ FoodCategory ∪ DietaryPattern ∪ D6 Product, plus D10 assessments; category expansion through `IN_FOOD_CATEGORY`.
- Q-D12-14: derived category edge + its method version + the input ingredient-statement snapshot; source-stated NOVA (OFF) kept as a separate assertion.
- Q-D12-34: fulltext index over FoodItem {name, descriptionVerbatim, synonyms} and D6 Product names; vector index over menu descriptions (QS-8); disambiguate reference vs product by type.
- Directive 3.8 demonstration: FC4 (Hall 2019 JATS) — question Q-D12-26 → chunk via MENTIONS of "ultra-processed diet" → study-result assertion (+508 kcal/d) → TextQuoteSelector → snapshot sha256 `e95aca15…29ae3`.

## 4. Seams and contested ownership

| concept | D12 needs | owner (default) | note |
| --- | --- | --- | --- |
| Compound, Nutrient, Constituent, ingredient form | composition targets; contaminants (lead, chromium, acrylamide) | D1 | A2 owns both D1 and D12: decide jointly whether `FoodItem` stays an `IngredientMaterial` specialization (pinned ruling) or a standalone D12 node referenced by D6 formulations. Proposal: standalone; D6 `uses material` target union includes FoodItem (≤ 6 members). |
| Product, formulation/ingredient statement, declared nutrition, allergens, market variant, price | prepared foods, packaged foods, longevity-food products | D6 | Add a way to mark food-service items (ProductKind value such as `PREPARED_FOOD`/`FOOD_SERVICE_ITEM`, or a property) — D6 decides. `HAS_REFERENCE_FOOD` direction Product → FoodItem; ownership D12 (questions are D12's) — contestable. |
| Organization (chain, brand owner, manufacturer, distributor, processor, retailer) | supply-chain harm path (FC8) | D7 | Firm-name variants across FDA sources ("WanaBana LLC" vs "WANABANA USA LLC"). |
| Target vocabulary, target-effect predicates, interactions, contraindications, Protocol/Lifestyle | harm/benefit for target T; grapefruit interaction; TRE | D5 | Dietary pattern ownership contested (1.5). |
| Study, Arm, administered material, StudyResult | trials of foods/patterns; arms administer a DietaryPattern or FoodItem | D3 | CT.gov types diets as DIETARY_SUPPLEMENT [S29]; PREDIMED is ISRCTN-registered [S30]. |
| Measured contaminant results, lots, recalls, regulatory claims (EU 432/2012, GRAS), warning letters, import alerts | FC3, FC7, FC8 | D8 | Decide whether a reference-food contaminant level (FDA survey row for a brand product) is a D8 MeasuredResult on a Product sample or a D12 composition assertion. Proposal: D8 for product samples; D12 composition edge only for reference-food-level statements. |
| ClaimOccurrence (recommendation), media | Blueprint founder recommending his product [S15] | D9 (+K) | |
| Assessments, rankings, DecisionCriterion, evidence reports | Q-D12-08, 18, 19, 26 | D10/K | Rankings are computed (directive 3.5). |
| Mechanism (CYP3A4, microbiome), Condition | interactions, outcomes | D2 | |
| Biomarker / CGM glucose | glycemic response questions (not in this stage's set) | D4 | |

## 5. Pinned types from the fragments: merge or defer (for 06-node-register `mergedInto`/`deferred`)

- `FoodItem` (W05): keep in D12; drop `IngredientMaterial` label inheritance unless D1 keeps it; `foodGroup`/`foodGroupSystem` → `FoodCategory`; `HAS_SAFETY_SIGNAL` → predicate/D5; `DERIVED_FROM_TAXON` → predicate-only; `HAS_IDENTIFIER` → kernel pattern.
- `Exposure` (W05), `ExposureAgentTarget` union, `HAS_EXPOSURE_AGENT`, enums `ExposureRoute/DurationCategory/Setting`: defer to D5 (or delete) — no D12 question filters through a characterized exposure.
- `Lifestyle` (W05): D5; its derived `AFFECTS_MECHANISM` / `ASSOCIATED_WITH_*` projections are D10 association patterns.
- `FoodVariantProperties`, `FoodVariantKind`: keep (add `preparationMethod`).
- `QuantitativeContentProperties` W05-SR-04 extensions: keep.
- Live `FoodProduct` (already retired into W04 `Product` by the pinned proposal): stays retired.

## 6. Open questions to record in 11-open-questions.md

1. FoodItem as a D1 `IngredientMaterial` specialization vs a standalone D12 node (evidence: whether any D6/D3 question must traverse "material" uniformly across foods and supplement ingredients). Owner: A2 (D1+D12) with D6.
2. DietaryPattern in D12 vs D5 Protocol/Intervention (evidence: whether D5's node can carry composition membership without exceeding its budget). Owner: D5 with D12.
3. Contaminant levels: D8 measurement on a Product sample vs D12 composition assertion (evidence: FDA acrylamide rows are purchased-product samples without lot codes [S11]). Owner: D8.
4. Is "ultra-processed" (NOVA 4) a FoodCategory membership we compute (derived, method-versioned) or only a source-stated assertion? Recommend both, distinguished by edge class; owner: D12 with D10 (method versions).
5. Whether the snapshot of a Firecrawl capture is the rendered markdown (what we hashed) or origin HTML bytes; and NBSP/line-break normalisation in exact-quote matching. Owner: kernel (A1) / verification.v1.
6. Does `ProductKind` get a food-service value, and do allergens live on D6 formulation or as D5 safety facts? Owner: D6.
7. CQ id convention: `CQ-FL-C0n` candidates do not parse in `packet-check.mjs`; should they be promoted into `competency-questions.md` as `CQ-FL-0n`? Owner: owner/biotech-meta.
8. Readiness: FDC needs a real API key for a team run (DEMO_KEY now); FSIS recall API blocked (403); PubMed MCP lacks retraction metadata; Prolon facts need OCR. Owner: D11.
