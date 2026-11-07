# D6 — consumer products and commerce: summary

A6, adversarial-review stage, 2026-10-08 (after the check stage). Research is not medical advice.

## What the domain is

The things people can buy, and what each one is. That covers supplements, foods, prepared foods from named organizations (a McDonald's Big Mac), devices and services. For each thing, D6 records what its label declares, who sells it, where and at what price, and how all of that changes over time. The chain is Product → ProductVariant → Package → LabelVersion. The declared composition lines resolve to D1 materials and constituents, or to D12 foods; each line is its own Assertion (who transcribed it, where), which D1's calculated moiety and nutrient amounts cite. On the commerce side, a MerchantListing (a host's catalog entry) carries Offers. Brand, seller and responsible-party roles are edges into D7 Organization and Brand. Prices and availability are kernel Assertions with typed literals and are never stored as nodes; an index price with no seller sits on the priced package, never on an invented offer. A judgment of good or bad is never a property. Harm, change-kind, recall-scope and certification-scope verdicts are kernel Assessments with D6 subkinds.

## Headline counts (packet-check, `ok: true`)

| node types | relationship types | from→to pairs | widest union | questions | fixtures |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 6 / 8 | 9 / 14 | 11 / 35 | 3 / 6 | 37 (14 harm = 38 %) | 7 |

Printed-schema cost against A1's current kernel (790e7244), with 5 seam stubs and D1's MassBasis stubbed: +150,147 bytes, +2,729 lines, +71 input types, ~2 s build (re-measured in the adversarial-review stage on 04 sha256 51452719…). That is 1.8 % of the 4,000-input ceiling and 2.5 % of the 6 MB ceiling. The details are in `09-reasoning.md`.

Episode edges: HAS_LABEL_VERSION, LISTING_FOR, SELLER_OF_RECORD, BRANDED_AS. Asserted with recorded time only: NAMES_RESPONSIBLE_PARTY (`AssertedRecordedProperties`) and DECLARES_COMPONENT (D6-local superset of it, carrying amount, unit, referent, D1 mass basis, %DV). The three structural edges are HAS_VARIANT, HAS_PACKAGE and HAS_OFFER.

## Fixtures (all from real captures; 207 locators, every quote re-checked at its offsets by script)

- `label-versions-truniagen-dsld`: two DSLD label versions on one UPC, a directions and seal change, the same composition. The label's "Distributed by ChromaDex, Inc" resolves to the subsidiary ChromaDex, Inc., not to its parent Niagen Bioscience; DSLD's self-contradictory relation for the pair is kept as a data-quality note.
- `retailer-reformulation-claim-iherb` (disconfirmation): iHerb's "New formulation" claim is NOT_SUPPORTED by composition evidence for the new GTIN that is not iHerb's own copy (the brand's product page and the brand-sold Amazon listing); the DSLD labels carry the old GTIN and are context only.
- `offer-roles-price-kinds-truniagen`: seller of record, price kinds, an archived subscription plan.
- `prepared-food-bigmac-mcdonalds`: a prepared food from a named organization (seam to D12). It covers the menu declaration "as of January 2022" and the Economist index price over time with a method change.
- `recall-moringa-mogo` (harm): a Class I Salmonella recall, with open-container positives in Washington, Tennessee and Florida. The company's channel and testing statements are adjudicated against FDA records, and the commerce follow-up is included.
- `filing-channels-niagen-10k` (unstructured-to-entity, 3.8): 10-K chunks → MENTIONS → assertions → locators → bytes.
- `proprietary-blend-ag1` (harm): ingredient amounts hidden inside a blend, and a formulation plus net-contents change.

## Five highest-value questions

1. **Q-D6-01**: What does this package's label declare per serving now? Since when, and what did the previous version say?
2. **CQ-AX-25**: Which products declare compound C, in which form and amount, valid at date V?
3. **Q-D6-04** (harm): Which products or lots were recalled, for what hazard, which lots, through which channels, and with what class and status?
4. **CQ-CM-03**: Which price and availability were observed, of which price kind, by which observer, and when?
5. **Q-D6-16**: Which products does organization O brand, distribute or sell, as distinct roles, according to which source and when?

## Three biggest cuts

1. **PriceObservation** becomes a kernel typed-literal Assertion on the Offer (predicate `OFFER_PRICE_<KIND>`, `unitCode iso4217:<CODE>`). This removes the highest-volume node type and its edge. The promotion trigger is pre-registered.
2. **FormulationVersion, IngredientComponent, LabelDeclaration, QuantityDeclaration and ServingDefinition** fold into LabelVersion plus DECLARES_COMPONENT lines that carry their amounts. "Formulation changed?" is answered by comparing `compositionDigest`.
3. **CommerceMatch, Bundle, SubscriptionPlan, the host and fulfiller edges, and SELLS_PRODUCT / CONTAINS** become kernel Assessments, properties, predicates or query-time paths. The relationships cut from the pinned proposal and from research are listed in the `deferred` rows of `05`.

## Three biggest risks

1. **Price-as-Assertion latency.** Price patterns scan Assertions by predicate and join to snapshots for the instant. This is untested beyond fixture scale. The mitigations are the `Offer.lastObservedAt` cache and node promotion.
2. **The intent contract cannot carry what the kernel requires (OQ-D6-18).** That includes claim occurrences, Assessments, DERIVED_FROM inputs, qualifiers and asserters on `state.attach`. The fixtures keep these in `assertions.yaml`. Real ingestion needs new proposal kinds.
3. **Package-level scope is not traversable (OQ-D6-13).** D8's CONCERNS, COVERS and LOT_OF do not accept `D6.Package`. Recall and certification scope by package size, such as "30, 60, 90 ct", stays in verbatim fields and D6 Assessments.

Open for the owner: OQ-D6-02 (LabelVersion as Subjectable; a concrete additive kernel amendment is requested from A1), OQ-D6-30 (one Assertion per declared label line: attribution and history versus volume), and OQ-D6-26/27 (D1 keeps the single MassBasis; D8 and D1 own the sample-result and material-origin predicates). OQ-D6-12 and OQ-D6-24 were resolved in the adversarial-review stage. The full list is in `11-open-questions.md`.
