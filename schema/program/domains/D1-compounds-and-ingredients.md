# D1 — Compounds and ingredients

Lens: science. Current fragments: W02 Substances and materials (12 node types: IngredientMaterial, BrandedIngredientMaterial, BotanicalPreparation, MicrobialPreparation, MaterialMixture, ChemicalSubstance, ChemicalForm, BotanicalTaxon, MicrobialTaxon, MicrobialStrain, Constituent, Nutrient), W05 Food, lifestyle and exposures (3: FoodItem, Exposure, Lifestyle).

## Scope

What a consumer supplement, food or exposure is made of: chemical substances and their forms (salts, esters, isomers), branded ingredient materials and their suppliers, botanical preparations (extract ratio, solvent, standardization), microbial strains and counts, nutrients, constituents and declared amounts. The question "what is in it", from label text to chemical identity. Out of scope: products and labels as commercial objects (D6), evidence about effects (D3), mechanisms (D2), manufacturing of the material (D8).

## Ecosystem to survey

Ingredient suppliers and branded-ingredient companies (ChromaDex/Niagen, Elysium, Kaneka, Lonza, Indena, Sabinsa, Gnosis); the identity authorities and what they actually expose (PubChem, ChEBI, FDA GSRS/UNII, CAS, NCBI Taxonomy, NIH DSLD, USDA FoodData Central, Phenol-Explorer); how brands describe ingredients on labels and in marketing; how formulators think about equivalence (same substance, same form, same material, same lot); probiotic strain naming and deposit practice; botanical standardization practice.

## Seed questions

- What chemical substance is the active moiety of this labeled ingredient, and what is the salt-to-moiety mass basis?
- Which products contain this substance in any form, at or above a dose?
- Are these two branded materials the same substance, analytically equivalent, or merely related (the open Priority-1 equivalence scale)?
- Which botanical preparations of this taxon exist, with what extract ratio and marker standardization?
- Which strains are in this probiotic, at what count, and which studies used the same strain?
- Which food or environmental exposure delivers this compound, and at what typical amount?
- Which identifier schemes resolve this ingredient, and where do they disagree?

## Retrieval patterns to consider

Substance → form → material → component chains with as-of validity; identifier resolution with normalization; similarity of materials by constituent profile (GDS node similarity over QUANTITATIVELY_CONTAINS); taxonomy traversal; fulltext and vector lookup from label strings to candidates (QS-8).

## Sources and tools to score (with D11)

PubChem PUG-REST, ChEBI, GSRS/UNII API, CAS Common Chemistry, NCBI Taxonomy E-utilities, NIH DSLD API, NIH ODS fact sheets, FoodData Central API, supplier spec sheets (PDF), label text (D6 captures), USP monographs, EFSA botanical compendium.

## Known problems and open questions

The open Priority-1 block (ingredient identity and equivalence) is almost entirely undecided: equivalence rule; supplier or specification change creating a new material; botanical normalization; nonviable microorganisms and consortia; proprietary blends with undisclosed amounts. The salt/moiety/label-declared amount rule is closed for US labels only.

## Deliverables

`../packets/D1/` per PLAN 5.1. Size target: this module should be the smallest of the science domains; prefer predicate-only for marketing relations.
