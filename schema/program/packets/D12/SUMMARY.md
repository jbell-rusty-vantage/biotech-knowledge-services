# D12 — summary

Food and nutrition (new domain), agent A2, 2026-10-08. Research is not medical advice. (Written by the coordinator from the check stage's text; the subagent Write guard refused the file.)

## What the domain is

D12 says what a food is, what it delivers at a named preparation, which group it belongs to and what a dietary pattern contains. Three reference concepts:

- **FoodItem**: a reference food as one source defines it, at the preparation it names (e.g. FDC 170027 raw russet, 170030 baked, 170721 "McDONALD'S, french fries", historical SR Legacy).
- **FoodCategory**: a group as a classification system defines it (NOVA 4, IARC processed meat, WWEIA, FDC categories).
- **DietaryPattern**: a pattern as one source defines it (PREDIMED MedDiet+EVOO, DGA 2025-2030, Hall 2019 diets).

Anything an organization sells (menu item, packaged food, longevity olive oil) is a D6 Product. It points to its reference food through HAS_REFERENCE_FOOD and is never merged with it: the chain's 320 Cal (as of Jan 2022) and FDC's 323 kcal/100 g x 117 g stay two dated, cited statements. Preparation is not a node: it is two records related by the predicate-only VARIANT_OF, the predicate PREPARATION_CHANGES_CONTENT, or the predicate FORMS_DURING_PREPARATION (acrylamide). Composition amounts are typed on FOOD_CONTAINS (D12-local FoodContentProperties: statementKind, quantity, unitCode, amountBasis). No good/bad property: alleged longevity foods are subjects of IMPROVES_TARGET claims, harmful foods are subjects of WORSENS_TARGET or HARM assessments (D5 targets, `population:` qualifier required).

## Headline counts (packet-check ok, after the adversarial review)

- Node types 3/8; relationship types 4/14 (FOOD_CONTAINS, IN_FOOD_CATEGORY, HAS_REFERENCE_FOOD, PATTERN_COMPONENT); pairs 8/35; widest union 3/6; one D12 edge-property type (FoodContentProperties).
- Questions 34 (15 harm, 19 harm or disconfirmation, 10 value-1); 20 answered by a fixture.
- Fixtures 5: unstructured-to-entity Hall 2019 UPF RCT; harm FDA acrylamide (now with the FDA's animal-hazard statement); disconfirmation PREDIMED retraction (dated 2018-06-13, per-authority status); McDonald's fries; olive-oil polyphenols.
- Executable: +81,823 bytes, +46 inputs over A1's reviewed kernel (b2c2b1b0…) + stubs, about 1 s build.

## Five highest-value questions

1. Q-D12-01 composition per basis and preparation, with derivation, n and spread.
2. Q-D12-04 organization O's current prepared-food declaration vs the reference record.
3. Q-D12-08 what to avoid for target T, by what evidence, for whom.
4. Q-D12-26 UPF evidence for target T, RCTs vs cohorts.
5. Q-D12-09 alleged longevity foods, their human evidence, and any retraction or contradiction (PREDIMED 2013 to 2018).

## Three biggest cuts

1. Preparation/PreparationEffect nodes and FoodVariantProperties became an enum and three predicates (VARIANT_OF demoted from a typed edge in the review: no source states it).
2. Derived COMPUTED_FOOD_CATEGORY became a CALCULATED Assertion on IN_FOOD_CATEGORY (saving 8.6 KB and 6 inputs); derived FOOD_SIMILAR_TO became GDS streaming at query time.
3. Pinned Exposure/Lifestyle/FoodCompositionRecord went to D8/D5, D5 Intervention, or the Assertion itself.

## Three biggest risks

1. Amounts now sit on the edge and on the Assertion, and intent v1 can carry neither edge values nor Assertion qualifiers for an edge (OQ-D12-23); the executor cannot write FOOD_CONTAINS lines from an intent until the contract grows.
2. Food entity resolution: a wrong HAS_REFERENCE_FOOD copies reference composition onto a product, and the resolver and NOVA classifier tools do not exist yet (readiness 1).
3. D5 and D12 both model diets (Intervention DIETARY_PATTERN vs DietaryPattern; one synthesis decision, OQ-D12-03), D5 does not yet list FoodCategory as a target-effect subject (OQ-D12-28), and computed NOVA could be read as source-stated if a client skips basisKind (OQ-D12-09).
