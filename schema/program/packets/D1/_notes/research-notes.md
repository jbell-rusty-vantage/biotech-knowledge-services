# D1 — research notes for the model stage (A2, RESEARCH, 2026-10-08)

These are observations and options, not decisions. The model stage decides in `09-reasoning.md`. Evidence keys `[Sn]` resolve in `../01-ecosystem.md` § 5; fixture candidates `FC-nn` in `fixture-candidates.md`; questions in `../02-questions.md`.

Kernel status when this was written: A1's `packets/K/09-reasoning.md` had only section headings; the subject/object/identifier/mention pattern was **not yet published**. Draft any any-entity edge against the placeholder interface `Subjectable` and rebase later (contract § Modeling standard).

Budget for this module: ≤ 8 node types, ≤ 14 relationship types, ≤ 35 from→to pairs, union ≤ 6. The brief asks D1 to be the smallest science module. The pinned fragments give D1 12 node types (W02) plus W05's FoodItem/Exposure/Lifestyle, which leave D1 (FoodItem → D12; Exposure, Lifestyle → D5 by the coordinator's default map).

---

## 1. The decision the packet direction asks for: compound vs ingredient vs form

What the evidence says:

1. **Salts, esters, hydrates and free bases are different substances** in every authority we read: GSRS gives separate UNIIs and an `ACTIVE MOIETY` relationship (NR chloride 8XM2XT8VWI → NR 0I8H2M0L7N; pyridoxine HCl → pyridoxine) [S13][S14][S17]; PubChem gives separate CIDs and InChIKeys [S19]. So "form" in the salt/ester/moiety sense is **ChemicalSubstance + a typed moiety edge**, not a separate node type.
2. **Physical forms** (crystal polymorph, micronized grade, "food-grade" vs "pharmaceutical-grade") are not registered as substances by GSRS, but they matter to investors (crystal-form patents and exclusive manufacture [S43]) and to equivalence (CQ-ID-06, Q-D1-07). No D1 question *traverses* through a physical form; Q-D1-17 needs "material → form → patent", which can be "material (with `physicalForm` properties) ← patent (D8)". **Option A (slim, recommended for testing):** drop `ChemicalForm` as a node, carry `physicalFormKind`, `polymorph`, `grade` on IngredientMaterial; D8's patent edge targets IngredientMaterial. **Option B:** keep `ChemicalForm` because patents and specifications attach to a form shared by several suppliers' materials. Decide with A7 (D8).
3. **Ingredient = the material actually used** (a supplier's grade of a substance, a branded material, a botanical preparation, a microbial preparation, a mixture). Labels declare materials ("Niagen" [S1], "KSM-66" [S11], "Lactobacillus rhamnosus GG" [S9]) as often as substances. Keep **IngredientMaterial** as the identity node that D6 (`USES_MATERIAL`) and D3 (`USES_INTERVENTION_MATERIAL`) point at.
4. **Nutrient ≠ substance.** "Vitamin B6" is six vitamers [S41]; PubChem resolves the name "vitamin B6" to one arbitrary phosphate structure [S22]; GSRS does not relate P5P to pyridoxine as active moiety [S16]; labels and regulators nonetheless state amounts "as the equivalent amount of pyridoxine" [S39][S5]. The nutrient is the join point for harm thresholds (Q-D1-03/04) and for food composition (Q-D1-22, D12). Keep a nutrient concept as a node; see § 2 for merging it with Constituent.

### Moiety- and nutrient-equivalent amounts (derived, never declared)

- Every equivalent amount is a **derived Assertion** (`basisKind: CALCULATED`, `derivationRule`, `DERIVED_FROM_ASSERTION` → the declared-amount Assertion and the molecular-weight Assertions from the authority snapshot). This is the closed US rule (OPEN-QUESTIONS Priority 1 item 3) and the evidence extends it to Canada: LNHPD declares the moiety with the salt as `source_material` (263.0 mg NR from NR chloride) [S30] — a *declaration* on moiety basis, so the derived direction reverses (salt mass is derived there).
- Rule ids the model stage should name (proposal): `rule:mw-ratio.v1` (moiety = declared × MW(moiety)/MW(form); inputs must cite which record supplies each MW, because GSRS gives 255.2476 for the NR moiety record but 254.2397 for the neutralized moiety inside the salt record [S13][S14]); `rule:nutrient-equivalent.v1` (vitamer → reference vitamer by a per-nutrient convention table, versioned; the B6 case reproduces the label: 50 mg P5P → 34.2 mg pyridoxine [S5][S15][S16]); `rule:daily-max.v1` (per serving × `maxDailyServings`, the quantity TGA thresholds use [S39][S6]).
- Where the computation lives: a **materialized projection** with a method version (Q-D1-02, Q-D1-03, Q-D1-19, Q-D1-24) — regenerable from the declared assertions; not a stored fact on Product.
- A brand's own nutrient amount on a US label (Country Life "Vitamin B6 34 mg" [S5]) **is a declaration** by the brand (amountReferent NUTRIENT_AS_NUTRIENT); BellLabs' recomputation is a derived check (Q-D1-20) that can disagree with it.

---

## 2. Candidate node types (start: 4–5; budget 8)

| candidate | absorbs (pinned) | why a node (questions that filter / join / traverse through it) | identity | key properties (filterable) |
| --- | --- | --- | --- | --- |
| **ChemicalSubstance** | ChemicalSubstance | Join point across labels, trials, foods, biomarkers (D4 analyte), mechanisms (D2), safety (D5): Q-D1-01, -03, -04, -05, CQ-ID-04, CQ-ST-02, -22, -28 | UNII (GSRS) primary; InChIKey; PubChem CID, CAS, ChEBI as identifiers | `preferredName`, `unii`, `inchikey`, `molecularFormula`, `molecularWeight` (+ source snapshot via assertion), `charge`, `substanceClass` (CHEMICAL, STRUCTURALLY_DIVERSE, PROTEIN, POLYMER, MIXTURE — GSRS classes [S13][S18]) |
| **IngredientMaterial** | IngredientMaterial, BrandedIngredientMaterial, BotanicalPreparation, MicrobialPreparation, MaterialMixture (as `materialKind` + nullable properties) | What labels and trial methods name; target of D6 and D3 edges; carries the harm-relevant preparation facts: Q-D1-07, -11, -12, -14, -16, -17, -26, CQ-ID-06 | materialKind + defining properties (+ supplier/spec owner via D7/D8 assertions); `UNRESOLVED_MATERIAL` stays valid | `materialKind`, `brandName`, `physicalFormKind`/`polymorph`/`grade` (if ChemicalForm is cut), `plantPart` (**enum**; Q-D1-12 filters on it [S40]), `preparationType`, `extractRatioLow/High`, `driedHerbEquivalent` (LNHPD field [S32]), `solvent`, `viabilityState`, `searchText` |
| **Constituent** (renamed if wanted, e.g. `ComponentConcept`) | Constituent + Nutrient | Classes and measurands with no single structure, and nutrients with their own declaration convention: "total withanolides" [S11], "vitamin B6" [S5][S39], "CFU" counts need a measurand too: Q-D1-03, -04, -13, -22, CQ-ID-03 | name + kind; nutrients by an authority list (e.g. 21 CFR 101.9 RDI nutrients — not captured here) | `constituentKind` (NUTRIENT, CHEMICAL_CLASS, ANALYTICAL_MEASURAND, NON_SPECIFIC_FRACTION), `nutrientKind`, `referenceUnit` (e.g. mg pyridoxine) |
| **Taxon** | BotanicalTaxon, MicrobialTaxon, MicrobialStrain | NCBI Taxonomy itself treats a strain as a taxon of rank `strain` (568703 under species 47715) [S25]; one type serves botanical sources and microbial species/strains: Q-D1-11, -14, -15 | NCBI taxid where it exists; strain designation + culture-collection deposit identifiers (ATCC/LMG/DSMZ) as Identifier records | `scientificName`, `rank` (enum incl. STRAIN), `kingdomGroup` (PLANT, FUNGUS, ALGA, BACTERIUM, YEAST…), `ncbiTaxId`, `legacyNames` |
| ChemicalForm (optional) | ChemicalForm | Only if D8 needs patent/spec → form traversal shared across suppliers (Option B in § 1) | form kind + substance | `formKind`, `polymorph`, `hydrationState`, `grade` |

Pinned types D1 does **not** keep: FoodItem → D12; Exposure, Lifestyle → D5 (record in `06-node-register.yaml` `deferred:`/`mergedInto:`).

---

## 3. Candidate relationships (start ~7–8 types; budget 14 / 35 pairs)

| relationship | class | from → to | questions | populated by | notes |
| --- | --- | --- | --- | --- | --- |
| `HAS_ACTIVE_MOIETY` | asserted | ChemicalSubstance → ChemicalSubstance | Q-D1-01, -03, -04, -05, -24 | GSRS relationships [S13][S17] | Timeless chemistry → recorded time only. Cardinality zero_or_one. |
| `COUNTS_AS_NUTRIENT` (name TBD; "vitamer of") | asserted | ChemicalSubstance → Constituent(NUTRIENT) | Q-D1-03, -04, -22, -28 | NIH ODS (six vitamers) [S41]; TGA named forms [S39]; label forms [S5] | The conversion *factor* is not on the edge; it is a derived Assertion under `rule:nutrient-equivalent.v1`. |
| `REALIZES_SUBSTANCE` | asserted | IngredientMaterial → ChemicalSubstance | Q-D1-05, -07, CQ-ST-02, CQ-ID-06 | DSLD forms with UNII [S1]; LNHPD source_material [S30]; 10-K [S43] | Recorded-only: a material's defining substance does not change; a supplier/spec change makes a new material or a D8 spec version. |
| `CONTAINS` (merge of `QUANTITATIVELY_CONTAINS` + `PROVIDES_CONSTITUENT`) | asserted | IngredientMaterial → ChemicalSubstance \| Constituent (union of 2; + Taxon if strain counts go here → 3) | CQ-ID-03, Q-D1-09, -11, -13, -14, -20, -22 | DSLD notes/nested rows [S11][S9]; LNHPD potency fields [S32]; analytical studies [S38]; supplier pages [S42] | Keep the CQ-ID-03 distinction as `contentStatementKind` (add `QUALITATIVE_PROVIDES`; quantity nullable only for that kind) instead of two types — must respect the non-inference rule `PROVIDES_CONSTITUENT ⇏ QUANTITATIVELY_CONTAINS`. **Episode** (valid time): composition changes when a supplier spec changes. D12's FoodItem uses the same edge type from its own side (seam). Edge properties: reuse `QuantitativeContentProperties` minus the food-only fields D12 needs (portionBasis, dataPoints, min/max — D12 declares those on its own edge or they stay). |
| `DERIVED_FROM_TAXON` | asserted | IngredientMaterial → Taxon | Q-D1-11, -12, -14, -15 | DSLD notes (genus/species/plant part) [S12]; LNHPD [S32]; NCBI [S25][S26] | Covers botanical source *and* microbial strain composition (replaces `HAS_STRAIN`); edge property `role` (SOURCE_ORGANISM, STRAIN_COMPONENT) and optional count per strain (or put counts on `CONTAINS` to Taxon). Recorded-only. |
| `PARENT_TAXON` | asserted | Taxon → Taxon | Q-D1-14, -15 | NCBI ParentTaxId/Lineage [S25] | Replaces `STRAIN_OF`; **episode** because reclassification changes parents (genus *Lactobacillus* split 2020 [S27]). |
| `HAS_MIXTURE_COMPONENT` | asserted | IngredientMaterial → IngredientMaterial | Q-D1-21 (weak) | branded complexes | Candidate for **predicate-only**: proprietary blends are D6 nested IngredientComponents; promote only if a branded mixture material question appears. |
| identifiers, mentions | kernel | — | CQ-ID-04, Q-D1-06, -26 | GSRS codes, PubChem, ChEBI, NCBI, deposits | Use A1's pattern; D1 lists schemes: UNII, INCHIKEY, PUBCHEM_CID, CAS, CHEBI, DRUGBANK, NCBI_TAXON, ATCC, LMG, DSMZ, SUPPLIER_CODE, LNHPD_INGREDIENT? (decide), DSLD_INGREDIENT_ID (DSLD `ingredientId` 202160/282346 [S1]). |

Rough pair count with these: HAS_ACTIVE_MOIETY 1, COUNTS_AS_NUTRIENT 1, REALIZES_SUBSTANCE 1, CONTAINS 2–3, DERIVED_FROM_TAXON 1, PARENT_TAXON 1 → **7–8 pairs, 6 types** before seams — well inside budget; leave headroom for the seams other modules declare *into* D1 (those pairs are counted by the declaring module).

### Predicate-only (stay `Assertion.predicate` values; question that would promote them)

- `MARKETED_UNDER_MARK` / mark owner (Q-D1-16) — D8 owns Trademark; label text "Niagen … trademarks of ChromaDex" [S1].
- `SUPPLIES_INGREDIENT_MATERIAL`, `MANUFACTURES_MATERIAL` (Q-D1-16, -17) — D7 organization roles; 10-K [S43].
- `MEASURED_CONTENT_IN_PRODUCT` / `CONTAINS_UNDECLARED_SUBSTANCE` (Q-D1-09, -10) — analytical surveys [S38]; lot-level results are D8 `MeasuredResult`.
- `SAME_MATERIAL_AS`, identity-level judgments (Q-D1-07, CQ-ID-06) — an EquivalenceAssessment / ResolutionHypothesis (kernel), never an edge.
- `MOIETY_EQUIVALENT_AMOUNT`, `NUTRIENT_EQUIVALENT_AMOUNT`, `DAILY_MAX_AMOUNT` — derived Assertions (predicates) feeding the materialized projection.
- `STANDARDIZED_TO` — expressed through `CONTAINS.contentStatementKind = STANDARDIZATION_CLAIM` with comparator GE [S11].
- `PROCESS_ALLERGEN_NOTE` (Q-D1-27) — "Contains: Milk." on a KSM-66 label [S11]; D5 owns risk knowledge.

### Deferred (pinned edges D1 drops; owner)

`GOVERNED_BY_SPECIFICATION`, `PRODUCED_BY_PROCESS`, `CAPABILITY_FOR_MATERIAL`, `INPUTS`, `OUTPUTS` → D8 declares into IngredientMaterial/ChemicalSubstance if needed; `AFFECTS_MECHANISM`, `MODULATES` (derived) → D2; `HAS_SAFETY_SIGNAL` → D5; `MARKETED_UNDER_MARK` → D8/predicate; `HAS_CHEMICAL_FORM`, `FORM_OF_SUBSTANCE` → gone if ChemicalForm is cut; `HAS_STRAIN`, `STRAIN_OF` → replaced by `DERIVED_FROM_TAXON` + `PARENT_TAXON`; `HAS_EXPOSURE_AGENT` → D5.

---

## 4. Enums and properties (from the artifacts)

- `MaterialKind` (slim): CHEMICALLY_DEFINED, BOTANICAL_PREPARATION, MICROBIAL_PREPARATION, MATERIAL_MIXTURE, PROTEIN_OR_ENZYME, UNRESOLVED, OTHER (drop the legacy BRANDED_CHEMICAL_MATERIAL and FOOD — food is D12). Branded = `brandName` non-null.
- `PlantPart` (new enum; DSLD only has free text "PlantPart: root" [S12], LNHPD "Dried root(s)" [S32], 21 CFR 101.36 requires part on botanicals [S35]): ROOT, RHIZOME, LEAF, AERIAL_PARTS, FLOWER, FRUIT, SEED, BARK, WHOLE_PLANT, OTHER.
- `BotanicalPreparationType` (keep pinned values; LNHPD has `extract_type_desc` [S32]).
- `ViabilityState` (keep).
- `TaxonRank` (+ STRAIN).
- `ConstituentKind` (+ NUTRIENT; drop separate `NutrientKind` or keep as a property).
- `ContentStatementKind`: keep STANDARDIZATION_CLAIM, DEFINITIONAL_COMPOSITION, TYPICAL_COMPOSITION_REPORTED, CALCULATED; add QUALITATIVE_PROVIDES and MEASURED_IN_SAMPLE (analytical study, [S38]).
- `ContentBasis`, `QuantityComparator` (keep); `MassBasis` (kernel W00): add NUTRIENT_EQUIVALENT; the US label's B6 34 mg needs it [S5].
- CFU is a count unit (`{CFU}` UCUM annotation) on `CONTAINS` with basis PER_SERVING (D6 serving) or per gram of material.
- `substanceClass` on ChemicalSubstance mirrors GSRS classes, so botanical "structurally diverse" substances (WITHANIA SOMNIFERA ROOT [S18]) can be REALIZES_SUBSTANCE targets for a BotanicalPreparation without inventing a structure.

---

## 5. Bitemporal decision inputs

| edge | valid-time episode? | why |
| --- | --- | --- |
| HAS_ACTIVE_MOIETY, COUNTS_AS_NUTRIENT, REALIZES_SUBSTANCE | recorded-only | chemistry and material definition do not change over valid time; corrections are new assertions |
| CONTAINS (material composition) | **episode** | supplier specification changes composition (CQ-ID-05, Q-D1-25); standardization claims are dated by the source |
| DERIVED_FROM_TAXON | recorded-only | a preparation's source organism is definitional |
| PARENT_TAXON | **episode** | reclassification (2020 genus split [S27]) changes the parent with a real valid-from |

Taxon names are presentation; the legacy name stays searchable (`legacyNames`), the uid does not change on renaming (pinned MicrobialTaxon card says the same).

---

## 6. Retrieval patterns the next stage should write (03-retrieval-patterns.md)

- **Label string → candidates (Q-D1-26, CQ-ID-04):** fulltext index over IngredientMaterial.searchText + ChemicalSubstance names/synonyms; then identifier match (UNII from DSLD `forms[].uniiCode`). Never accept a PubChem name→CID hit without checking salt vs moiety (the "Niagen" → 439924 trap [S21]).
- **Normalize to moiety / nutrient (Q-D1-02/03/04/05):** `(ic:IngredientComponent)-[:USES_MATERIAL]->(m)-[:REALIZES_SUBSTANCE]->(s)` then `(s)-[:HAS_ACTIVE_MOIETY]->(moiety)` and/or `(s)-[:COUNTS_AS_NUTRIENT]->(n)`; amounts read from the materialized derived-amount projection (method version, input assertion digests).
- **Harm threshold scan (Q-D1-03):** projection rows (product, nutrient, derived daily max) joined to threshold assertions (D5/D8) by nutrient and jurisdiction; as-of on label snapshot dates.
- **Strain evidence transfer (Q-D1-14/15):** `(m)-[:DERIVED_FROM_TAXON {role:STRAIN_COMPONENT}]->(t:Taxon {rank:STRAIN})<-[:DERIVED_FROM_TAXON]-(m2)<-[:USES_INTERVENTION_MATERIAL]-(…)` (D3 seam); species-only resolution returns "not strain-matched".
- **Study material vs product material (CQ-ID-06, CQ-ST-02):** path-type classification as in the pinned CQ-ST-02 query (same material / same substance only).
- GDS node similarity over CONTAINS for "materials like this one" — expansion only (value 3), not proposed now.

---

## 7. Seams and contested ownership

Expected seams (edges declared by the other module unless noted):
- D6 `IngredientComponent -USES_MATERIAL-> IngredientMaterial`; D6 owns label declarations, `amountReferent`, serving definitions (needed for daily max).
- D3 `InterventionComponent -USES_INTERVENTION_MATERIAL-> IngredientMaterial`.
- D12 `FoodItem -CONTAINS-> ChemicalSubstance | Constituent` and `FoodItem -DERIVED_FROM_TAXON-> Taxon` (food composition reuses D1 identity; D12 is A2's other packet — coordinate edge properties).
- D4 `Biomarker -HAS_ANALYTE-> ChemicalSubstance`.
- D2 derived substance → mechanism/target projections.
- D5 contraindication/interaction/adverse-effect knowledge with D1 subjects (via kernel subject pattern); thresholds (UL, scheduling bands) as D5 safety knowledge.
- D8 lots/COAs/specifications/patents/regulatory status → IngredientMaterial / ChemicalSubstance.
- D7 supplier/manufacturer/mark-owner roles → IngredientMaterial (assertions).
- D9 recommendations resolved to D1 identities; D13 frontiers attach to substances.
- Shared vocabularies: A5's targets (`packets/D5/vocab-targets.yaml`, e.g. `target:sleep`, `target:longevity`) — D1 consumes only through D5/D10; A7's frontiers.

Contested (write in `11-open-questions.md`):
1. **Nutrient ownership**: D1 (as Constituent kind NUTRIENT, recommended — it is substance identity) vs D12 (nutrition). D12 consumes.
2. **Intake reference values and regulatory thresholds** (UL 100 mg B6 [S41]; TGA bands [S39]): D5 (harm knowledge) vs D8 (regulatory) vs D12 (nutrition reference). D1 needs only the join key (nutrient + basis).
3. **Measured content from analytical surveys** [S38]: D8 (quality) vs D1 (content). Proposal: predicate-only assertion on the D6 product/variant with D1 substance as object; lot-scoped results in D8.
4. **ChemicalForm** node: D1 cut vs D8 need for patents on crystal forms [S43].
5. **Strain counts**: on `CONTAINS → Taxon` (union grows to 3) or on `DERIVED_FROM_TAXON` edge properties.
6. **GSRS structurally diverse substances** (plant parts) as ChemicalSubstance targets vs only Taxon + plantPart.
7. **Taxon vs D2 `Species`**: the pinned MicrobialTaxon card says it "shares identity with the mechanism-module Species when the same taxon plays both roles (W02-SR-06)". One `Taxon` type owned by D1 could also serve D2's species (human, mouse, *C. elegans*) — or D2 keeps Species and D1's Taxon covers source organisms only. Decide with A3.

---

## 8. Open questions (for 11-open-questions.md)

- OQ-L2-02 (salt vs cation mass in PMID 29184669 and PMID 31278280): for **31278280 the full text shows salt basis** (FC-04, quotes at offsets 28769 and 29785); PMID 29184669 not examined in this stage.
- Molecular-weight source policy (OQ-L3-11): PubChem was reachable in this session; GSRS and PubChem agree at 255.25/290.70 but GSRS's in-record normalized moiety differs (254.24). Policy proposal: cite the GSRS *moiety record* `structure.mwt` and pin its `version`.
- Non-US label rules: Canada declares moiety with source material (LNHPD) [S30]; Australia states B6 "as the equivalent amount of pyridoxine" in ARTG summaries [S39]. Each jurisdiction's basis must be an enum value on the declaration (D6), not inferred.
- Equivalence rule (Priority 1 item 1): evidence collected — food-grade vs pharmaceutical-grade Niagen [S43]; Pure Encapsulations names Niagen only in a trademark statement while declaring the generic salt [S2]. Still no COA pair.
- Botanical normalization (Priority 1 item 4): LNHPD's ratio and dried-herb-equivalent fields [S32] are the best structured model found; DSLD keeps standardization in free-text notes [S11].
- Non-viable microorganisms and consortia (Priority 1 item 5): not examined beyond viability enum.
- Proprietary blends (Priority 1 item 6): 21 CFR 101.36(c) requires the blend total; nested amounts unknown — answer shape gives bounds only (Q-D1-21).
- Community lens tooling: Reddit unreachable (Tavily, Firecrawl, curl 403) — D11 decision on API or browser fallback.
