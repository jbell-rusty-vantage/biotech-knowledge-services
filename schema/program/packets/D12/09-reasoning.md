# D12 — reasoning

Model stage (Wave 2) by A2, 2026-10-08; check stage (same day) re-measured against A1's current kernel and moved the two recorded-only edges to the kernel's AssertedRecordedProperties; adversarial-review pass (same day, "## Adversarial review changes" at the end) typed the composition amount on FOOD_CONTAINS, demoted VARIANT_OF to predicate-only and re-measured against A1's kernel as revised by its own review. Inputs: research outputs (`01-ecosystem.md`, `02-questions.md`, `_notes/`), A1's published kernel pattern (K/09, K/04, domain template), A5's targets vocabulary 0.1.0 (0.2.1 since the review), sibling research notes for type names (sibling SDLs since the check stage). This file is the decision log the owner reads to trust the packet.

## Size estimate

- node types: **3** (FoodItem, FoodCategory, DietaryPattern) — budget 8.
- relationship types: **4** (FOOD_CONTAINS, IN_FOOD_CATEGORY, HAS_REFERENCE_FOOD, PATTERN_COMPONENT) — budget 14. (5 before the adversarial review: VARIANT_OF is predicate-only now.)
- from→to pairs: **8** — budget 35. Computed as packet-check does (one pair per relationship field, times the union width of its target): FoodItem.components (FoodComponentTarget = ChemicalSubstance | Constituent) 2 + FoodItem.categories 1 + FoodItem.referencedByProducts (IN from Product) 1 + FoodCategory.memberProducts (IN from Product) 1 + DietaryPattern.components (PatternComponentTarget = FoodItem | FoodCategory | Constituent) 3. `node scripts/packet-check.mjs D12` reports the same counts (nodes 3, relationship types 4, pairs 8, questions 34, fixtures 5).
- edge-property types: **1** D12-local (`FoodContentProperties`, superset of kernel AssertedRecordedProperties, kernel M11) + kernel AssertedEdgeProperties / AssertedRecordedProperties.
- widest union target: **3** (PatternComponentTarget); limit 6.
- relationship fields per type: FoodItem 3, FoodCategory 1, DietaryPattern 1 (limit 12).
- enums: 6 (PreparationMethod 21 values, FoodVariantKind 7, FoodDataSystem 9, FoodCategorySystem 8, DietaryPatternKind 4, DietaryPatternScope 5).
- The research estimate was 3 nodes, ~7 relationship types, ~11 pairs; the model stage cut two types (the derived computed-category edge and the similarity edge, see Decisions).

### Measured executable cost (print-schema, @neo4j/graphql 7.6 via `pnpm --filter @bks/graphql-api print-schema`)

**Adversarial-review measurement (current).** Recipe: `<scratch>/ft/D12/compile4/compile.graphql` = A1's kernel SDL as revised by A1's own adversarial review (`K/04-schema-proposal.graphql`, 51,355 bytes, sha256 `b2c2b1b0…`; Mention and Adjudication.considers cut) + scratch stubs (`compile4/stubs.graphql`: D1 ChemicalSubstance, D1 Constituent, D6 Product as empty `Entity & Subjectable` nodes, plus the enums D1 `ContentStatementKind` and D6 `AmountBasis` copied verbatim from their SDLs) + this module; `BKS_SCHEMA_PATH=$(cygpath -w …/compile.graphql) NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema $(cygpath -w …/compile-out.graphql)`; each build ≈ 1 s; output sizes checked (none is the 57.9 MB pinned fallback — one mistyped loop did fall back during this pass and its output was deleted).

| schema (review pass, kernel b2c2b1b0…) | bytes | lines | `grep -c '^input '` |
| --- | ---: | ---: | ---: |
| kernel alone | 322,904 | 6,466 | 179 |
| kernel + seam stubs (3 nodes, 2 enums) | 338,233 | 6,721 | 185 |
| kernel + stubs + D12 (this proposal) | **420,056** | **8,287** | **231** |
| D12 marginal over kernel + stubs | **+81,823** | **+1,566** | **+46** |
| check-stage D12 (5 types, 9 pairs, amounts on the Assertion) over the same base | 413,445 | 8,216 | 231 |
| review changes (FoodContentProperties, VARIANT_OF predicate-only, identity fields) | +6,611 | +71 | 0 |

The amount-on-edge change costs +6.6 KB and no input types: removing VARIANT_OF frees one pair's inputs and the `FoodContentProperties` Where/Sort inputs take their place (the `AssertedRecordedProperties` inputs are still paid by PATTERN_COMPONENT). The kernel itself printed 22 KB smaller after its review, so absolute numbers below (check stage) are not comparable with this table; the D12 marginal is.

Check-stage measurement (superseded):

Recipe: `<scratch>/ft/D12/check/compile.graphql` = A1's **current** kernel SDL (`biotech-knowledge-services-A1/schema/program/packets/K/04-schema-proposal.graphql`, 51,377 bytes, sha256 `790e7244…5a8c71`, read 2026-10-08 check stage) + 3 scratch-only stubs for seam targets (`<scratch>/ft/D12/compile/stubs.graphql`: D1 `ChemicalSubstance`, D1 `Constituent`, D6 `Product`, each an empty `Entity & Subjectable` node) + this module; then `BKS_SCHEMA_PATH=<windows path of compile.graphql> pnpm --filter @bks/graphql-api print-schema <out>`. Always check the output size: a wrong path silently falls back to the pinned schema (57.9 MB). Build ≈ 1 s (print-schema's own timer) for every variant, ≈ 4.3 s wall including pnpm/tsx start-up.

| schema (check stage, current kernel) | bytes | lines | `grep -c '^input '` |
| --- | ---: | ---: | ---: |
| kernel alone (A1 K/04 now) | 345,273 | 6,927 | 192 |
| kernel + 3 seam stubs | 360,602 | 7,182 | 198 |
| kernel + stubs + D12 (this proposal) | **435,814** | **8,677** | **244** |
| D12 marginal over kernel + stubs | **+75,212** | **+1,495** | **+46** |
| D12 marginal over kernel alone (incl. stubs) | +90,541 | +1,750 | +52 |
| variant: VARIANT_OF and PATTERN_COMPONENT back on AssertedEdgeProperties | 431,731 | 8,620 | 242 |

Per pair the module costs ≈ 8.4 KB and ≈ 5.1 input types. The +2 inputs / +4,083 bytes of the shipped version over the variant are the shared `AssertedRecordedPropertiesWhere/Sort` inputs that the first user of the kernel's recorded-only type pays (D13 also uses it, so the assembled schema pays them once; OQ-D12-26).

Model-stage measurement (earlier kernel draft, 43,366 bytes; superseded): kernel 326,564 / 6,582 / 185; kernel + stubs 341,893 / 6,837 / 191; + D12 412,936 / 8,275 / 235 (marginal +71,043 bytes, +44 inputs); experiment + derived COMPUTED_FOOD_CATEGORY 421,545 / 8,463 / 241 (+8,609 bytes, +6 inputs for the cut edge). For scale, the same print against the pinned schema (run by accident when an env-var path was mistyped, then deleted) produced 57.9 MB in 33 s — the measured problem in PLAN § 1.

## Decisions (alternatives considered, what was cut and why)

### D-1 What is a FoodItem, what is a Product (directive 3.3)

- **Chosen:** FoodItem (D12) = a reference food concept *as one source defines it, at the preparation it names* (FDC 170027 raw and 170030 baked are two records → two FoodItems). Product (D6) = anything an organization sells: menu items, packaged foods, longevity-food products (Blueprint EVOO), fasting-mimicking kits. A fast-food chain's item is a Product with a formulation, declared nutrition, allergens, an as-of date and an organization behind it.
- **The awkward middle:** brand-named reference records (FDC 170721 "McDONALD'S, french fries", SR Legacy, historical) stay FoodItems (`brandNameVerbatim`, `isHistoricalReference`) and link to the current Product by one asserted edge, HAS_REFERENCE_FOOD. They are never merged: FDC implies ≈ 378 kcal per 117 g medium serving (323 kcal/100 g) and the chain declares 320 Cal "as of January 2022". Two dated statements, both cited.
- **Branded and crowd records with a GTIN** (FDC Branded Foods, Open Food Facts) are D6 Products, not FoodItems (enum FoodDataSystem has no BRANDED value on purpose).
- **Alternatives rejected:** (a) one `Food` type with a `isProduct` flag — mixes organization-owned, time-varying declarations with reference concepts and makes the Product hub's formulation/price/offer edges apply to reference foods; (b) FoodItem as a D1 `IngredientMaterial` specialization (pinned ruling) — D1's research drops MaterialKind FOOD, no question traverses "material" uniformly across foods and supplement ingredients, and the label inheritance re-exposes D1's edges on every food (OQ-D12-02); (c) merging brand-named reference records into the Product — destroys the disagreement Q-D12-30 asks for.

### D-2 Preparation is not a node

- **Chosen:** three shapes, zero node types. (1) Separate reference records per preparation → the predicate-only `VARIANT_OF` Assertion (subject variant, object base; typed edge until the adversarial review, demoted because no source states the link — a curator pairs records — its tool does not exist yet and only Q-D12-02 traverses it) with `variantKind` and `preparationMethod` as properties of the variant (a variant has one base, so the pinned FoodVariantProperties fold into the node). (2) Stated change with conditions (Phenol-Explorer: hydroxytyrosol −40–50 % after 10 min frying at 180 °C) → predicate-only `PREPARATION_CHANGES_CONTENT` (subject FoodItem, object compound, qualifiers for method, temperature, duration, cycles). (3) Preparation-formed hazards (acrylamide; HCA/PAH) → predicate-only `FORMS_DURING_PREPARATION` (subject compound, object FoodItem or FoodCategory).
- **Alternatives rejected:** a `PreparationMethod` node (a 21-value low-cardinality category as a node is the supernode anti-pattern of the modeling skill); a `PreparationEffect` intermediate node (the Assertion already is that intermediate record: value, conditions, asserter, locator, valid time); a typed PREPARED_AS edge FoodItem → FoodItem with method on the edge (needs a domain edge-property type).

### D-3 Composition: FOOD_CONTAINS, amount typed on the edge

- **Chosen (adversarial review):** asserted FOOD_CONTAINS FoodItem → D1 ChemicalSubstance | Constituent with the D12-local `FoodContentProperties` = the five AssertedRecordedProperties fields verbatim + `statementKind` (D1 ContentStatementKind) + `quantity`, `unitCode`, `amountBasis` (D6 AmountBasis). Typed because Q-D12-01/21 filter and rank by component and amount and Q-D12-20 projects it into GDS; FDC and Phenol-Explorer populate it at scale. The derivation code, n, min/max, comparator and range stay on the authorizing Assertion as `key:VALUE` qualifiers (no question filters them). Model and check stages kept the amount on the Assertion only; the review showed that the qualifier strings the patterns filtered on (`'basis:' + $basis`) never matched what the fixtures wrote (`basis: PER_100G`) and that "foods or materials with ≥ A of C" could not be filtered the same way in D1 and D12 — now both edges carry D1's statementKind, and the amount fields are D12's because only D12 questions filter amounts.
- **Alternatives:** (a) Assertion-only (no typed edge) — saves 2 pairs but every composition read becomes two hops through Assertion nodes and GDS projections must go through them; rejected for the backbone of the domain; (b) amounts only on the Assertion (model and check stages) — a threshold query joins ~1M Assertions at FDC scale and GraphQL cannot filter amounts at all; replaced in the review; (c) D1's ContentEdgeProperties as-is — an episode type (valid-time fields) whose valid time would always be null for reference composition; (d) an intermediate `FoodCompositionRecord` node — duplicates the Assertion.
- **Name:** `FOOD_CONTAINS`, not pinned `QUANTITATIVELY_CONTAINS` nor D1's `MATERIAL_CONTAINS`: kernel rule makes relationship names unique per module; a cross-module question uses `[:MATERIAL_CONTAINS|FOOD_CONTAINS]` (OQ-D12-16). The qualitative "provides" statements of the pinned PROVIDES_CONSTITUENT are Assertions without a valueNumber.
- **Portions:** predicate-only `HAS_PORTION_WEIGHT` (FDC states 117 g "medium serving"; the chain does not), so per-serving numbers are computed at query time with `basis-convert/v1` and cite both Assertions.

### D-4 FoodCategory (new node)

- **Chosen:** FoodCategory (system + version + code) for NOVA groups, IARC agents, WWEIA, FDC food categories, FoodEx2/LanguaL, guideline groups. It earns a node because group-level harm and benefit is asserted about a group (UPF and cardiometabolic outcomes; processed meat Group 1) — it must be an Assertion subject (Subjectable) and a hop from a food or a menu item to that evidence. Hierarchy is `parentCode` (no edge), as in A5's targets.
- **Membership:** `IN_FOOD_CATEGORY` FoodItem | Product → FoodCategory, asserted. Computed membership (NOVA from ingredient markers) is a **CALCULATED Assertion** (basisKind CALCULATED, derivationRule `nova-markers/v<n>`, DERIVED_FROM the ingredient-statement Assertions, asserter = our classifier Agent) authorizing an ordinary IN_FOOD_CATEGORY episode; a new rule version supersedes it.
- **Cut:** a separate derived `COMPUTED_FOOD_CATEGORY` edge (measured: +8.6 KB, +6 inputs, +2 pairs). Reason: Q-D12-14's "stated or computed, by which method" is answered by `basisKind` and `derivationRule` on the same channel, and the kernel already treats rule-computed values as CALCULATED Assertions (PLAN 6.2 "derived numbers"). The cost of this choice: the GraphQL schema does not stop a client from treating a computed membership as source-stated unless it reads the Assertion; the research note had recommended a derived edge, so the conflict is recorded (OQ-D12-09).
- **Alternatives rejected:** `foodGroup`/`foodGroupSystem` strings on FoodItem (pinned) — cannot be an Assertion subject and cannot carry provenance per membership; one category label per system as Neo4j labels (`:Nova4`) — no provenance, no versioning, and GraphQL cannot express it.

### D-5 DietaryPattern (new node, contested with D5)

- **Chosen:** DietaryPattern identified by (definedBySourceUid, patternKey, version) — the kernel Source uid of the defining document, a non-null key and the edition (review: the earlier (definedBy, name, version) rested on a free-text citation and a nullable name) — Mediterranean + EVOO as PREDIMED defined it, DGA 2025–2030, Hall 2019's two diets, TRE as TREAT defined it. Components by `PATTERN_COMPONENT` → FoodItem | FoodCategory | D1 Constituent (guidelines limit nutrients, not only foods), role INCLUDES / EMPHASIZES / LIMITS / EXCLUDES and stated quantity on the Assertion. D3 arms administer it (seam ADMINISTERS, D3's edge); D5 protocol steps may use it (STEP_USES, D5's edge). A5's research notes already concede "D12 owns dietary pattern composition".
- **Alternatives:** (a) D5 Intervention with a composition list — puts composition into D5's budget and makes the "patterns that exclude food F" traversal cross a module; (b) role-split edge types PATTERN_INCLUDES / PATTERN_LIMITS — clearer GraphQL filtering, but 2 types and 6 pairs (12 with four roles) for a filter that the provenance join already performs; kept as the first thing to add with twice the budget; (c) timing patterns (TRE) only in D5 — TRE is a dietary pattern in every trial registry and paper read, and splitting patterns by kind across modules would double the entity-linking targets; the kind is the enum `patternKind`.

### D-6 HAS_REFERENCE_FOOD direction and target

- Stored Product → FoodItem, **declared on FoodItem with direction IN** (A1's rule for kernel edges, applied to a D6 hub: D6 Product gets no field). Target is `Product`, not `ProductVariant`: reference records are per 100 g and size-independent; if D6 puts jurisdiction on ProductVariant (US vs UK fries differ), the edge retargets to the variant (OQ-D12-06). Match basis on the Assertion (SAME_ITEM_IN_REFERENCE_DB, INGREDIENT_STATEMENT, CURATED_GENERIC).

### D-7 Harm beside the alleged longevity foods (directive 3.2)

- No entity carries good/bad. "Alleged longevity food" = a FoodItem / DietaryPattern / FoodCategory / Product that is the subject of IMPROVES_TARGET or INTENDED_FOR_TARGET Assertions on target:longevity (Q-D12-09); "harmful food" = subject of WORSENS_TARGET Assertions (D5 predicates, population qualifier mandatory) and of kernel Assessments with `effectDirection: HARM`. Hazard classifications are predicate-only `HAS_HAZARD_CLASSIFICATION` with the classifier as asserter. Measured contaminant levels in sold foods are D8 QualityResults reached through HAS_REFERENCE_FOOD; recalls and warning letters are D8 RegulatoryRecords (recordFamily ENFORCEMENT) that CONCERN the Product or Lot. Same channel for benefit and harm, so "what helps" and "what hurts" are one query with a different predicate.
- Disconfirmation is first-class: retractions are SourceSnapshot `revisionKind` values (PREDIMED), contradicting evidence is `HAS_EVIDENCE {role: CONTRADICTS}` on Assessments/Adjudications, null findings are NO_EFFECT_ON_TARGET Assertions (TREAT, Wastyk).

### D-8 Unstructured to entity (directive 3.8)

- D12 declares no MENTIONS, SUPPORTS or CONTRADICTS edges. Chunks reach FoodItem / FoodCategory / DietaryPattern through D9's derived `Chunk.mentions` (kernel MENTIONS against Subjectable); support lives on HAS_EVIDENCE from records to locators. The Hall 2019 fixture (`07-fixtures/upf-diet-rct-unstructured`) carries the full path (03 § Q-D12-26).

### D-9 What else was cut

- FOOD_SIMILAR_TO (derived): Q-D12-20 is value 3; GDS node similarity streams at query time over a Cypher projection; nothing stored.
- Exposure, its union and three enums (pinned W05): no D12 question filters through a characterized exposure; offered to D5/D8.
- Lifestyle (pinned W05): practices → D5 Intervention; diet instances → DietaryPattern.
- FOOD_FROM_TAXON (renamed from DERIVED_FROM_TAXON, a D1 typed-edge name), HAS_RECIPE_INGREDIENT, HAS_GLYCEMIC_INDEX, HAS_DATA_QUALITY_WARNING, USED_FOOD_CLASSIFICATION, USED_COMPOSITION_DATABASE, VARIANT_OF: predicate-only with promotion triggers (05 `predicateOnly`; the last four registered in the review).
- HAS_SAFETY_SIGNAL, HAS_IDENTIFIER, SUPPORTED_BY_DOCUMENT/CHUNK, AFFECTS_MECHANISM, ASSOCIATED_WITH_* (pinned): kernel or D10 patterns, or forbidden by the directive.
- DEFINED_BY DietaryPattern → Source: the defining Assertions already reach the Source through locator → snapshot.

## Bitemporal decision per edge

| edge | temporal | why |
| --- | --- | --- |
| FOOD_CONTAINS | recorded-only (`FoodContentProperties`, superset of AssertedRecordedProperties) | review: all five fixture rows had null valid bounds and no FDC or Phenol-Explorer record read states a sampling period per value; a release revision supersedes in recorded time (recordedTo), which is what Q-D12-24/30 read; a source that states a sampling period puts it on the Assertion (03 returns `a.validFrom`). The FDA acrylamide window (2003-10-01 → 2004-10-07) is a D8 QualityResult's, not a composition row's. |
| HAS_REFERENCE_FOOD | **episode** | a product's reference food stops being valid when the product is reformulated (McDonald's "correct as of January 2022"); Q-D12-04/27/30 need the history. |
| IN_FOOD_CATEGORY | **episode** | a product's NOVA group changes with reformulation; a classifier rule version supersedes computed memberships; IARC classifications are dated (2015). |
| PATTERN_COMPONENT | recorded-only (`AssertedRecordedProperties`) | the version is part of DietaryPattern identity (a new guideline edition is a new node); corrections supersede in recorded time. |

The two episode edges carry the kernel's `AssertedEdgeProperties`; PATTERN_COMPONENT carries the kernel's `AssertedRecordedProperties` and FOOD_CONTAINS its D12 superset (no valid-time fields on either edge). Switching back is additive. Predicate-only facts (VARIANT_OF, preparation effects, hazard classifications, portions) carry their episode on the Assertion.

## Budget excess (one line per element, prefixed EXCESS:)

No element exceeds the D12 budget (3/8 nodes, 4/14 relationship types, 8/35 pairs, widest union 3/6, max 3/12 relationship fields per type). No EXCESS lines.

## Risks

1. **Amount on the edge and on the Assertion.** Since the review Q-D12-21 filters `FOOD_CONTAINS.quantity` directly (GraphQL `componentsConnection.edge.quantity`), so the million-row Assertion join is gone; the cost is that the amount exists twice (edge and authorizing Assertion) and the executor must write both from one intent — which intent v1 cannot express (OQ-D12-23). Range index on the relationship property `FOOD_CONTAINS.quantity` (Neo4j relationship range index).
2. **Cross-module unions.** FoodComponentTarget and PatternComponentTarget list D1 types; if D1 renames `ChemicalSubstance`/`Constituent` or merges them, two unions change; if the synthesizer forbids unions with foreign members, they become two fields each (same pairs). Stubs compile today.
3. **Name drift with siblings.** Q-D12-03/06/07/12/16/22/27/28/32 depend on D3/D5/D6/D7/D8/D9 edges; the check stage resolved the placeholders against the sibling SDLs as of 2026-10-08 (drafts; three model-stage guesses were wrong: CONSTRAINS_USE_OF, FormulationVersion, EnforcementAction); D5's QP-TARGET-01 still uses pinned kernel names (SUPPORTED_BY, HAS_LOCATOR direction, EVALUATES, QUALIFIED_BY) that A1's kernel does not have (OQ-D12-10, OQ-D12-11).
4. **CALCULATED membership vs derived projection.** A client reading only IN_FOOD_CATEGORY could present a computed NOVA group as a source's statement; the answer contract must always read `basisKind` (OQ-D12-09).
5. **Entity resolution of foods.** "EVOO", "blue zone beans", "medium fries" resolve to many candidate FoodItems/Products; wrong HAS_REFERENCE_FOOD links propagate reference composition to products. Mitigation: RESOLUTION Assessments, match basis on the Assertion, never infer measured composition of a Product from its reference food (patterns label it "reference-based").

## With twice the budget

1. Split PATTERN_COMPONENT by polarity (PATTERN_INCLUDES vs PATTERN_LIMITS) so "patterns that tell you to avoid F" is a typed traversal in GraphQL (+1 type, +3 pairs).
2. Promote FORMS_DURING_PREPARATION to a typed asserted edge ChemicalSubstance → FoodItem | FoodCategory for process-contaminant screening across EFSA/FDA tables (+1 type, +2 pairs).
3. Add the derived FOOD_SIMILAR_TO projection (method `food-similarity/v1`) for substitution at latency (+1 type, +1 pair).
4. Add FOOD_FROM_TAXON (FoodItem → D1 Taxon) as a typed edge for "all foods from Olea europaea and their polyphenols" (+1 type, +1 pair); re-type VARIANT_OF once a source publishes base ↔ variant links as data.
5. Type the stated quantity of PATTERN_COMPONENT on the edge as well (a `PatternComponentProperties` superset) if a question filters patterns by amount ("patterns with ≥ 4 tablespoons EVOO per day").

## Assessment subkinds and conclusionCode vocabularies (kernel M9; registered in the adversarial review)

| assessmentSubkind | assessmentKind | conclusionCode values | used by |
| --- | --- | --- | --- |
| `D12.claim-threshold-comparison` | VETTING | `MET` (declared measurand and amount satisfy the regulatory condition), `NOT_MET` (same measurand, amount below), `NOT_COMPARABLE` (different measurand, basis or method: "400 mg/kg polyphenols" vs "5 mg hydroxytyrosol and derivatives per 20 g") | Q-D12-18 |
| `D12.food-equivalence` | EQUIVALENCE | `EQUIVALENT` (two records denote the same food at the same preparation), `NOT_EQUIVALENT`, `PARTIAL` (same food, different preparation or part) | Q-D12-05, Q-D12-34 (merging FDC / Phenol-Explorer / curated records) |
| `food-resolution/v1` (methodVersion of a kernel RESOLUTION Assessment, not a subkind) | RESOLUTION | `RESOLVED`, `AMBIGUOUS`, `UNRESOLVED` | acrylamide fixture `hu:assessment:ft-d12-acr-04`, Q-D12-34 |

## Adversarial review changes (2026-10-08)

Two reviewers (evidence integrity, model discipline) raised 26 findings; RUNLOG "Adversarial review" lists each with its disposition. Structural changes:

1. **FOOD_CONTAINS amount typed on the edge** (`FoodContentProperties`, D-3); recorded-only (bitemporal table). Closes OQ-D12-01.
2. **VARIANT_OF predicate-only** (D-2): −1 relationship type, −1 pair; Q-D12-02 matches subject/object through the Assertion.
3. **Qualifier grammar** (`05 qualifierGrammar`: `key:VALUE`, no space, enum values where the key names an enum, free text only under `…Verbatim` keys); every fixture qualifier rewritten; the dry run (`_notes/dryrun.py`) shows Q-D12-01/02/03/20/21 now return the fixture rows they were written for (all returned 0 before).
4. **Identity rules**: FoodItem (definingSystem, sourceRecordId), description only for CURATED/OTHER; DietaryPattern (definedBySourceUid, patternKey, version).
5. **Predicate registry**: DERIVED_FROM_TAXON → FOOD_FROM_TAXON; HAS_DATA_QUALITY_WARNING, USED_FOOD_CLASSIFICATION, USED_COMPOSITION_DATABASE registered; PUBLICATION_STATUS replaced by the kernel's HAS_REVISION_STATUS (one Assertion per authority).
6. **Patterns** re-based on current sibling SDLs (D3, D6, D8, D10) and the kernel without Mention; Q-D12-08/23 bind PATTERN_COMPONENT and its Assertion in one OPTIONAL MATCH.
7. **Fixtures**: acrylamide gets its hazard assertion (FDA, laboratory animals, high dose) and a reporting window from 2003-10-01 (INFERRED) instead of 2002; PREDIMED's retraction is dated 2018-06-13 (notice captured) with 2018-06-21 as issue-date qualifier; olive-05 cites the sentence that names tyrosol and moves to the grade-unstated oil; the Hall 2019 errata are recorded; the text version is rebuilt by a committed extractor; Firecrawl capture options and origin-HTML siblings are recorded.
