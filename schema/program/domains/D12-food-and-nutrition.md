# D12 — Food and nutrition

Lens: science and economics. Current coverage: `FoodItem`, `Exposure`, `Lifestyle` in W05 (3 node types), `Nutrient` and `Constituent` in W02, `Product` in W04. Added 2026-10-08 on the owner's direction: food is hard to model and the bad is as important as the good.

## Scope

What people eat and what it does: reference foods (composition-database concepts at a named preparation), alleged longevity foods and special foods (olive oil, fermented foods, organ meats, "superfoods"), specific branded food products and prepared foods from specific organizations (a fast-food chain's menu item is a product with a formulation and an organization behind it), preparation techniques and what they do to composition (frying, fermentation, ultra-processing), dietary patterns (Mediterranean, time-restricted eating, carnivore), and the compounds a food delivers in what amount. Harm is first-class: ultra-processed foods, contaminants, additives, glycemic load, allergens. Out of scope: supplements (D1, D6), clinical evidence itself (D3), the organizations beyond the seam (D7).

## Ecosystem to survey

Composition authorities (USDA FoodData Central, EFSA, Phenol-Explorer, Open Food Facts), food classification (NOVA, FoodEx2, LanguaL), nutrition labeling regulation (FDA Nutrition Facts, EU FIC), restaurant and packaged-food disclosure (menu labeling, allergen statements), the longevity food discourse (blue zones, Mediterranean trials such as PREDIMED, fermented-food claims, seed-oil controversy), diet apps and their data models (Cronometer, MyFitnessPal), food-as-medicine companies, how podcasts and influencers rank foods, how recalls and contaminant findings are published.

## Seed questions

- What compounds does this food deliver per serving at this preparation, and how does the preparation change that?
- Which foods and prepared foods from which organizations are associated with harm for target T (sleep, body composition, cardiovascular), by what evidence?
- Which alleged longevity foods have human evidence, and for which outcome?
- Is this branded or restaurant food a Product (formulation, organization, label) or a FoodItem (reference concept), and when do we need both?
- What dietary patterns include or exclude this food, and what do they claim for which target?
- Which foods interact with this compound or drug (seam D5), and which contaminants or additives are reported in which products (seam D8)?

## Retrieval patterns to consider

Food → composition → compound paths joined to D1 amounts; preparation as a transformation on composition; pattern → food membership; harm assessments as assessment nodes with direction of effect on a target; GDS: similarity of foods by composition; vector search over food names and menu descriptions to reference concepts (QS-8).

## Sources and tools to score (with D11)

USDA FoodData Central API, Open Food Facts API, Phenol-Explorer, EFSA databases, menu and nutrition pages of restaurant chains (Firecrawl), packaged-food labels (DSLD does not cover; GS1 and brand sites), NOVA classification references, PubMed for dietary trials.

## Known problems and open questions

Whether FoodItem specializes IngredientMaterial (the proposal's ruling) survives the slim schema; how to represent a preparation without a node per cooking method; the boundary between a food product and a supplement product; how "alleged" claims about foods are kept as claims (D9) rather than facts.

## Deliverables

`../packets/D12/` per the packet contract, with one fixture being a prepared food from a named organization and one a harm case.
