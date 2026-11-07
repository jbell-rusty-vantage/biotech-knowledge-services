# D6 — reasoning

Model stage (Wave 2, part 1), A6, 2026-10-08. Inputs: `01-ecosystem.md`, `02-questions.md` (37 rows), `_notes/research-notes.md`, `_notes/fixture-candidates.md`, A1's published kernel pattern (`packets/K/09-reasoning.md`, `04-schema-proposal.graphql`, `domain-template.graphql`, `identifier-schemes.yaml` in the A1 worktree, read 2026-10-08 17:16), D5's targets and D13's frontiers seam rules, sibling research notes (D1, D7, D8, D12, D3, D5 — no sibling had SDL yet). Skills read: `neo4j-modeling-skill`, `neo4j-graphql-skill` (directive syntax, relationship properties, v7 filters), `neo4j-cypher-skill` conventions for 03.

Check stage (A6, 2026-10-08): re-measured against A1's current kernel (sha256 790e7244…, model stage) and aligned with it and with the sibling SDLs; the changes are listed in "## Check-stage changes" at the end. Adversarial-review stage (A6, 2026-10-08): two independent reviews (evidence integrity, model discipline) answered finding by finding; changes in "## Adversarial-review changes" at the end, re-measured on the current 04 (sha256 prefix 51452719).

## Size estimate

| measure | D6 | budget | how computed |
| --- | ---: | ---: | --- |
| node types | **6** | ≤ 8 | `@node` types in `04-schema-proposal.graphql` (packet-check `nodeTypes`) |
| relationship types | **9** | ≤ 14 | distinct `@relationship(type:)` (packet-check `relationshipTypes`) |
| from→to pairs | **11** | ≤ 35 | one per relationship field, union members counted (8 single-target fields + DECLARES_COMPONENT × 3) |
| widest union target | **3** | ≤ 6 | `DeclaredComponentTarget = IngredientMaterial \| Constituent \| FoodItem` |
| relationship fields on the busiest type | 2 | ≤ 12 | Product, LabelVersion, MerchantListing (2 each) |
| D6-local edge-property types | 1 | — | `ComponentLineProperties`, a superset of the kernel AssertedRecordedProperties (allowed by kernel M11; was a StructuralEdgeProperties superset until the adversarial-review stage) |
| enums | 12 | — | controlled vocabularies declared by D6 (ProductKind … FulfillmentKind; OfferKind removed in the adversarial-review stage); D1's `MassBasis` is referenced, not declared |

**Printed executable (measured, `print-schema`, deployed command, default server options):**

| SDL printed | bytes | lines | `grep -c '^input '` | object types | enums | build |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| kernel alone (A1 `04-schema-proposal.graphql`, model stage, sha256 prefix 790e7244) | 345,273 | 6,927 | 192 | 115 | 35 | 1 s (print-schema's own timer; ~4.2 s wall incl. pnpm/tsx start) |
| kernel + 5 seam stubs (Brand, Organization, IngredientMaterial, Constituent, FoodItem; 7 Entity fields each, no relationships) + D1 `MassBasis` enum stub (not printed while unused) | 371,144 | 7,365 | 202 | 130 | 35 | 2 s (print-schema's own timer) |
| kernel + stubs + D6 module (current 04, sha256 prefix 51452719; adversarial-review stage) | 521,291 | 10,094 | 273 | 169 | 48 | 2 s |
| **D6 marginal cost** (vs kernel + stubs) | **+150,147** | **+2,729** | **+71** | +39 | +13 | — |
| *superseded: check-stage measurement (SDL sha256 prefix 9c6cebdb — it differed from the check-stage 04, 90ac8c06, by five relationship docstring lines only)* | *518,550* | *10,068* | *273* | *169* | *48* | *1 s* |

Of the 71 new input types, 13 are enum scalar filters (one per D6 enum plus D1's MassBasis, used on ComponentLineProperties; OfferKind's filter is gone), 6 are first-use inputs of kernel edge-property types (`AssertedEdgePropertiesSort/Where`, `AssertedRecordedPropertiesSort/Where`, `StateEpisodePropertiesSort/Where`; the kernel's own fields use none of them, so the assembled schema pays them once, not once per module), and 2 are D6's own `ComponentLinePropertiesSort/Where`; the rest are per-type `Where/Sort/RelationshipFilters` and per-field `Connection*` inputs. About 24.6 KB and 11.8 inputs per node type, against A1's synthetic 17.7 KB / 12 for a type with three relationships. Projected share of the final ceiling (≤ 4,000 inputs, ≤ 6 MB): 71 inputs (1.8 %), 0.15 MB (2.5 %). The adversarial-review changes cost +2,741 bytes and 0 input types net: ComponentLinePropertiesWhere/Sort gain the five AssertedRecordedProperties fields and massBasis; OfferKind, Offer.offerKind, Offer.currency and LabelVersion.hasUndeclaredBlendAmounts are gone. Model-stage numbers against the Wave 0 kernel (sha256 0ad41559) were +143,101 bytes / +2,643 lines / +69 inputs; the difference is the switch of NAMES_RESPONSIBLE_PARTY to `AssertedRecordedProperties` (+2 inputs, +1 object type) and one enum value. Compile files and outputs of the adversarial-review stage are in scratch `ft/D6adv2/compile/` (kernel = A1's current 04, sha256 790e7244…, unchanged since the check stage); those of the check stage in `ft/D6check/compile/` (`compile.graphql`, `out-*.graphql`, `print-*.log`; command `BKS_SCHEMA_PATH=<abs compile.graphql> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs out>` from the worktree root); stubs live only there.

## Decisions (alternatives considered, what was cut and why)

The directive's default is "no node, no typed relationship". Every D6 element below is argued against the 37 questions; each relationship has a question, a pattern in `03`, populating tools and a named fixture in `05`.

### Nodes kept (6)

1. **Product** — kept. Alternatives: (a) collapse Product into ProductVariant with a `productLine` string; (b) keep both. Chosen (b): marketing and target claims are made about the product line ("Tru Niagen supports…"), composition and study material about the variant; Q-D6-16/-20 (org → brand → products), Q-D6-03/-22 (products marketed for T), Q-D6-18 and the inbound D8/D12/D5 seams join at product level. Pinned `status` (ProductStatus DISCOVERY…APPROVED) dropped: it is a drug-pipeline vocabulary; market status of consumer goods is assertions on offers/packages (discontinued as displayed, recalled lots). `ProductKind` rewritten: adds PREPARED_FOOD (fast-food menu item, directive 3.2/3.3), BEVERAGE, OTC_DRUG, SERVICE; drops BIOLOGIC (D3/D8).
2. **ProductVariant** — kept as the round-0001 Candidate B level (strength, dosage form, flavor, jurisdiction). Alternative: variant as a property bag on Package. Rejected: D3 ADMINISTERS and D8 LOT_OF need a level above package size (a lot fills 30- and 90-count bottles alike), and CQ-ID-01/02 compare "the studied variant" with "the sold variant". Rule from fixtures: a directions/seal change (FC-1) or a GTIN/box change (FC-2) never mints a variant.
3. **Package** — kept; renamed from PackageConfiguration and absorbs Bundle + BundleComponent through `packageKind` (KIT, MULTIPACK, BUNDLE) and a predicate-only CONTAINS_PACKAGE (Q-D6-14 is value 3). Identity excludes GTIN: FC-2 shows the same 30-count bottle under 850015311116 then 850015311857, which is an identifier episode, not a new package; AG1 360 g → 350 g (FC-8) is a new package. Prepared foods get a SERVED_PORTION package (one sandwich) so the same path serves price per item, recall scope and labels.
4. **LabelVersion** — new content node replacing LabelSnapshot-as-SourceSnapshot, and absorbing FormulationVersion, IngredientComponent, LabelDeclaration, QuantityDeclaration and ServingDefinition. Alternatives: (a) pinned design (LabelSnapshot is a snapshot; declarations are nodes) — 6+ node types, and one label seen in four captures becomes four "labels" (FC-1/2/3); (b) LabelVersion + separate FormulationVersion (research draft, 8 nodes); (c) LabelVersion only, composition as lines + `compositionDigest`. Chosen (c). The only evidence of composition D6 has is a declaration (measured content is D8); FC-1's two label versions with the same composition share a `compositionDigest`, which answers CQ-ID-05 ("formulation changed?") without a node, and the HAS_LABEL_VERSION episode answers "which formulation was on sale at V" (CQ-ID-02) without a second episode edge. Promotion trigger recorded in `06 mergedInto` (D3 needs a composition no label declared). Implements `Subjectable` although it is a versioned state (A1's pattern says Entity only for state nodes) because the DSLD label id identifies it (kernel HAS_IDENTIFIER), change-kind / certification-scope / max-intake Assessments are ABOUT it and D1's CALCULATED amounts have it as subject — cost ≈ 0 per A1's lever matrix. Concrete additive kernel amendment requested in OQ-D6-02 (owner A1; the synthesizer decides if unanswered, and must not keep both readings).
5. **MerchantListing** — kept: the host's catalog entry is where offers live, where retailers make their own statements ("New formulation", "Discontinued Item"), and what recall-exposure scans (Q-D6-05). Host organization cut to `hostDomain` (see relationships).
6. **Offer** — kept: one listing carries several offers (buy box vs other sellers; one-time vs Subscribe & Save), and the seller-of-record role and every price are per offer (CQ-CM-01, CQ-CM-03). Absorbs SubscriptionPlan (purchaseMode, terms text, app; term history as assertions). An Offer exists only where a seller proposition exists (adversarial-review stage): a published index price (Economist) is a `MARKET_REFERENCE_PRICE` Assertion on the Product/Variant/Package, and a tracker's aggregate over third-party sellers is a price Assertion on the MerchantListing (qualifier sellerClass=THIRD_PARTY_NEW); `OfferKind` was dropped. Q-D6-13 reads price Assertions by subject at any level.

### Nodes cut

- **PriceObservation → kernel Assertion with a typed literal.** A displayed price is exactly the kernel's atom: one subject (the Offer), one typed literal (valueNumber + currency), one asserter (merchant, tracker or index publisher = "observer"), one locator, a time. Price kind is the predicate (`OFFER_PRICE_ONE_TIME`, `…_SUBSCRIPTION`, `…_TRACKER_LOW`, …; a seller-less index price is `MARKET_REFERENCE_PRICE` on the priced Product/Variant/Package), availability is `OFFER_AVAILABILITY`. A node would double the highest-volume D6 data (each observation would need its node and still an Assertion for attribution). Cost of the cut: instants come from the snapshot when the basis is OBSERVATION_ONLY (kernel rule forces a null valid bound), so price patterns join Assertion → locator → snapshot (03 OBSERVED_AT); currency in `unitCode` as `iso4217:<CODE>` (accepted by the kernel, OQ-D6-06 resolved). Promotion trigger in `05 predicateOnly`.
- **FormulationVersion** — absorbed into LabelVersion (above).
- **InventoryItem, IndividualUnit** — no public source exposes inventory; a tested unit is D8.
- **AffiliateLink** — D9 owns tracked links (published inside pages/episodes) and keeps them predicate-only (`LINKS_TO_OFFER`, MediaWork → Offer | MerchantListing; OQ-D6-07 resolved).
- **CommerceMatch** — kernel Assessment with D6 subkinds (directive 3.6; A1 ownership map).
- **ProductLot** — D8 owns Lot (its recall/COA/certification questions join on it); D8 declares LOT_OF into D6.
- **ProductSnapshot** — R1 compatibility payload dropped.

### Relationships kept (9)

| type | class | alternative considered | why kept |
| --- | --- | --- | --- |
| HAS_VARIANT | structural | product line as property | product-line vs variant split above; identity-defining |
| HAS_PACKAGE | structural | — | identity-defining; price per dose and recall scope |
| HAS_LABEL_VERSION | asserted (StateEpisodeProperties) | label → package edge declared on LabelVersion (LABEL_FOR, pinned); separate HAS_FORMULATION_VERSION | A1's template puts state attachments on the entity side; one episode edge carries both label and composition time |
| DECLARES_COMPONENT | asserted (ComponentLineProperties ⊇ AssertedRecordedProperties; structural until the adversarial-review stage) | (a) IngredientComponent node + USES_MATERIAL (pinned: 3 nodes, 4 edges per line); (b) asserted edge per line with the amount in the Assertion — impossible, an Assertion has an object **or** a literal, not both; (c) structural lines with properties; (d) asserted lines whose own Assertion carries subject, object, asserter and locator while the amount qualifiers ride on the edge | (d) since the adversarial-review stage: resolving a printed row to a D1/D12 record is an attributable judgment (the same argument that makes NAMES_RESPONSIBLE_PARTY asserted), it must be adjudicable and keep recorded-time history when D1 merges or splits materials ("nothing is deleted"), and D1's CALCULATED amounts need one line Assertion to cite in DERIVED_FROM (D1's fixtures already write it). Amounts still sit on the edge for the CQ-AX-25/Q-D6-02/Q-D6-12 filters. Cost: one Assertion per line; volume trade-off in OQ-D6-30 |
| NAMES_RESPONSIBLE_PARTY | asserted | role as three edge types (DISTRIBUTED_BY, MANUFACTURED_FOR, …); predicate only | one edge + `responsiblePartyRole` enum; Q-D6-16 role separation and recall accountability traverse it |
| BRANDED_AS | asserted | pinned Organization → Product `MARKETS_PRODUCT`/`BRAND_OF` | D7 owns Brand and its ownership episodes; Product → Brand is how a prepared food reaches its named organization (FC-4) and how Q-D6-16 reaches brand owners |
| LISTING_FOR | asserted | 5-member ListingTarget union (pinned) | one target (Package): a listing at a family level records `parentHostItemId`; proposed matches are Assessments |
| HAS_OFFER | structural | offer as property of the listing | several offers per listing |
| SELLER_OF_RECORD | asserted | inverse field on Organization (pinned `sellerOfRecordFor`) | D7's split map: commerce role edges are declared on D6 types; no inverse field (hub ≤ 12) |

### Relationships cut (highlights; full list in `05 deferred`)

- **HOSTS_LISTING / HOSTED_BY → `MerchantListing.hostDomain`** (filterable). The host is part of listing identity; host-org traversal has no value-1 question. Predicate-only HOSTED_BY when the domain → organization mapping is disputed.
- **FULFILLS_OFFER → `Offer.fulfillmentKind`** (SELLER, HOST, THIRD_PARTY, IN_STORE) + `fulfillerNameAsDisplayed`. Every captured case is "ships from the host" or "from the seller".
- **HAS_PRICE_OBSERVATION, USES_SUBSCRIPTION_PLAN, HAS_BUNDLE_COMPONENT, COMPONENT_PRODUCT** — follow from the node cuts.
- **CONTAINS / CONTAINS_COMPOUND_FORM / SELLS_PRODUCT** — derived shortcuts; computed at query time by two-hop paths (CQ-AX-25 requires the qualifier-aware path anyway).
- **LISTS_PRODUCT** (legacy live edge) — migration maps it to LISTING_FOR on the listed variant's package (OQ-D6-09).
- **D4/D5/D8 device, panel, pathway, certification, regulatory and safety edges** — owned elsewhere; those modules declare their edges into D6 (seams `in`).

### Prepared foods (coordinator direction; seams D12, D7)

A prepared food from a named organization is `Product {productKind: PREPARED_FOOD}` → `BRANDED_AS` → D7 Brand (owned by the organization) → variant per market → SERVED_PORTION package → MENU_DECLARATION label version (as-of statement, allergens, per-component SUB_COMPONENT lines with nested ingredient lines, NUTRIENT lines with %DV) → lines resolve to D12 FoodItem or D1 IngredientMaterial/Constituent. D12 owns what the food is (FoodItem, HAS_REFERENCE_FOOD, FoodCategory) and what preparation does to composition; D6 owns the sold item, its declaration and its price (FC-4: McDonald's declaration; The Economist's index price as MARKET_REFERENCE_PRICE assertions on the served-portion Package). "Unhealthy" is never a property: Q-D6-12 filters declared %DV at query time; harm verdicts are D10 Assessments with effectDirection.

### Kernel pattern compliance

All six types implement `Entity & Subjectable` and list the seven Entity fields verbatim; no `@id`/`@timestamp`; `@mutation(operations: [])`; every relationship has `aggregate: false`, declared `nestedOperations`, `@filterable(byValue: true, byAggregate: false)` and a class docstring. `ComponentLineProperties` lists StructuralEdgeProperties' two fields first, verbatim and in kernel order (M11). No subject/object/identifier/mention/lineage field is declared; no SUPPORTS/CONTRADICTS edge; no derived relationship (MENTIONS in the 10-K fixture is the kernel/D9 projection, never a D6 field); observation caches (`firstObservedAt`, `lastObservedAt`) are executor-maintained and read-only (every type has `@mutation(operations: [])`); no good/bad/safe/score property (and, since the adversarial-review stage, no stored Boolean about blends at all). Asserted edges use `[CONNECT]` (DECLARES_COMPONENT, now asserted, targets D1/D12 records the executor resolves), structural edges `[CREATE, CONNECT]`.

## Bitemporal decision per edge

| edge | temporal | why |
| --- | --- | --- |
| HAS_LABEL_VERSION | **episode** (StateEpisodeProperties) | two label versions on one UPC (FC-1); archive captures arrive after later ones; DSLD entry dates are publication proxies; competing declarations (brand vs crowd, FC-9) coexist as separate open episodes |
| LISTING_FOR | **episode** | hosts repoint/merge items (FC-2 discontinued → successor; ASIN merges) |
| SELLER_OF_RECORD | **episode** | seller accounts and resellers change on a living listing |
| BRANDED_AS | **episode** | products move between brands and brand owners rename (ChromaDex → Niagen Bioscience is D7's OWNS_BRAND episode; product relaunches under another brand are BRANDED_AS episodes) |
| NAMES_RESPONSIBLE_PARTY | recorded-only (kernel `AssertedRecordedProperties`, A1 M10; was AssertedEdgeProperties with null valid bounds until the check stage) | the label version's own episode carries the time; the named party cannot change within one label version |
| HAS_VARIANT, HAS_PACKAGE, HAS_OFFER | recorded-only (structural) | identity-defining containment |
| DECLARES_COMPONENT | recorded-only (asserted; ComponentLineProperties ⊇ AssertedRecordedProperties) | the label version's episode carries valid time; a re-resolution closes a line (recordedTo) and opens a new one |
| price / availability / terms (Assertions, not edges) | instant on the Assertion (validFrom when the source states a date, else the snapshot's observedAt) + recorded time on the Assertion | observations are instants; no edge |

Four D6 episode edges out of nine (HAS_LABEL_VERSION, LISTING_FOR, SELLER_OF_RECORD, BRANDED_AS); two asserted recorded-only edges (NAMES_RESPONSIBLE_PARTY, DECLARES_COMPONENT); three structural (HAS_VARIANT, HAS_PACKAGE, HAS_OFFER); plus the kernel's HAS_IDENTIFIER episodes for GTIN/ASIN/SKU validity (Q-D6-15).

## Budget excess

None. No element exceeds the D6 budget (6/8 nodes, 9/14 relationship types, 11/35 pairs, widest union 3/6, busiest type 2/12 relationship fields).

## Risks

1. **D6-local edge-property type.** `ComponentLineProperties` is now allowed by the kernel's superset rule (M11; risk reduced). If the synthesizer still refuses it, the fallback is a `FormulationLine` node (Entity only) with a structural edge from LabelVersion and a structural edge to the D1/D12 target: +1 node, +1 relationship, +3 pairs, and ~20 lines per label as nodes (OQ-D6-01).
2. **Price-as-assertion latency.** Price patterns scan Assertions by predicate and join to snapshots for the instant. Fine at fixture scale; at > 10^6 price assertions the `Assertion(predicate)` index plus HAS_SUBJECT fan-in per Offer must stay selective. Mitigation: Offer.lastObservedAt cache; promotion to a PriceObservation node is pre-registered.
3. **Line re-resolution and volume.** Resolved in the adversarial-review stage: lines are asserted, so a D1 merge or split closes the old line's recorded time and opens a new one with its own Assertion (history kept, nothing deleted). The price is volume: one Assertion per declared line (OQ-D6-30); the fallback (structural lines + `line=<orderIndex>` qualifier) is recorded for the synthesizer.
4. **Seam names** (checked in the check stage): D1's `IngredientMaterial`/`Constituent`, D12's `FoodItem`, D7's `Brand`/`Organization` exist with these names in the sibling SDLs and their 10-seams list D6's edges with D6's field names. Inbound names were corrected in 10-seams and 03 (D8 `RegulatoryRecord` CONCERNS, `LegalStatus` STATUS_OF, `QualityResult` RESULT_FOR; D3 `InterventionComponent` ADMINISTERS; D4 DELIVERS; D9 predicate `LINKS_TO_OFFER`). Residual risk: a later sibling rename is a mechanical edit.
5. **Menu-item identity.** Restaurant items have no GTIN and prices vary by location; jurisdiction-level variants and MARKET_REFERENCE offers are a simplification (OQ-D6-08).
6. **D8 targets.** D8's SDL targets Product / ProductVariant / Lot, not D6.Package (OQ-D6-13 still open): package-size recall and certification scope stay in D8's verbatim fields and D6 Assessments, so Q-D6-05 and CQ-PF-03 answer package scope as assessments, not traversals.

## With twice the budget

- Promote **PriceObservation** to a node (typed priceKind/observerKind/unit-price basis; direct GraphQL filtering) once price volume and FX normalization justify it.
- Keep **FormulationVersion** as a node with HAS_FORMULATION_VERSION on the variant, so D3 can point a study arm at a brand-supplied composition that no retail label declares, and lines would hang off the formulation instead of being repeated per label.
- Add typed **HOSTED_BY** and **FULFILLED_BY** edges for investor channel-concentration questions (host → parent group) and 3PL counterfeit/commingling analysis.
- Add **CONTAINS_PACKAGE** as a structural edge with quantity for kit recall scope.
- A derived **D6 composition-similarity** projection (GDS node similarity over DECLARES_COMPONENT, method-versioned, read-only) for "alternatives to product X".

## Check-stage changes (A6, 2026-10-08)

Counts unchanged (6 node types, 9 relationship types, 11 pairs, widest union 3; packet-check `ok`). What changed, and why:

1. **NAMES_RESPONSIBLE_PARTY → `AssertedRecordedProperties`** (kernel M10, directive rule 9): no question reads its valid time; the label version's episode carries it. 05, 03 (Q-D6-16 filters `recordedTo IS NULL`), 10 `kernel-types`.
2. **`ComponentLineProperties` field order**: `orderIndex, lastWriterRunId` first, verbatim (kernel M11 rule 2).
3. **`AmountReferent` + `AS_ACTIVE_MOIETY`** (superseded in the adversarial-review stage by D1 `massBasis` and per-line Assertions): answers D1 OQ-D1-24 (moiety vs salt basis) with one enum value instead of a `massBasis` field; per-line provenance by a `line=<orderIndex>` qualifier on CALCULATED assertions (OQ-D6-24; label fixture a09/a10).
4. **Kernel fields in fixtures**: `statedAsOf` → `Assertion.validObservedAt` with `validFromBasis: OBSERVATION_ONLY` (10 assertions; A1 change 5); Assessment `verdictValue` → `conclusionCode` (5; A1 M9). 03 OBSERVED_AT coalesces `validFrom, validObservedAt, snapshot observedAt`; prices keep `unitCode: iso4217:<CODE>` (now the kernel convention).
5. **Seams and cross-module patterns** aligned with sibling SDLs (risk 4 above); D10's report shape used for Q-D6-03 and Q-D6-22 (OQ-D6-10 resolved).
6. **Re-measured** (table above).

## Adversarial-review changes (A6, 2026-10-08)

Counts unchanged (6 node types, 9 relationship types, 11 pairs, widest union 3; packet-check `ok`). Re-measured above (+150,147 bytes, +71 inputs). Every finding is answered in `RUNLOG.md` "Adversarial review"; the model changes are:

1. **DECLARES_COMPONENT asserted** (was structural): `ComponentLineProperties` now lists the kernel `AssertedRecordedProperties` fields verbatim first (M11), then the line qualifiers; `nestedOperations: [CONNECT]` unchanged. Fixtures: 34 lines became per-line Assertions (adc01–09, ddc01–14, gdc01–10, edc01; intent `edge.assert` with `edgeProperties` and `asserterRef`); CALCULATED a09/a10 cite their line in DERIVED_FROM. Closes OQ-D6-24(2) with D1's form; trade-off OQ-D6-30.
2. **Mass basis = D1 `MassBasis`** on `ComponentLineProperties.massBasis`; `AmountReferent` loses AS_SALT_FORM / AS_ACTIVE_MOIETY (one dimension per field). OQ-D6-24(1) closed; single-owner request OQ-D6-26.
3. **No Offer without a seller proposition:** `OfferKind` and `Offer.offerKind` removed; Economist index prices are `MARKET_REFERENCE_PRICE` on the US served-portion Package (bigmac d05–d08; method change d09 on the same subject); camelcamelcamel "3rd Party New" values are price Assertions on the Amazon MerchantListing with qualifier sellerClass=THIRD_PARTY_NEW (offer c21–c23). `tool:economist-bigmac-data` left HAS_OFFER's populatedBy.
4. **Slimmer properties:** `LabelVersion.hasUndeclaredBlendAmounts` (repeated the BLEND_MEMBER line filter; OQ-D6-12 closed) and `Offer.currency` (repeated the price Assertion's `unitCode`) removed.
5. **Identity rules:** Product keyed on the brand it was first captured under (later BRANDED_AS episodes never re-key); LabelVersion keys are immutable.
6. **Assessments:** subkind D6.label-claim-match dropped (the kernel SUPPORT Adjudication is the verdict; CQ-PF-02 reads it); `inputAdjudications` removed from fixtures (not a kernel field); D6.seller-account-to-organization, D6.blend-disclosure-rule and D6.recalled-product-harm registered with conclusionCode vocabularies in 10-seams; recalled-product harm without a D5 target uses conclusionCode CONTAMINATION_CONFIRMED, not effectDirection; every categorical outcome is read from `conclusionCode` in 03.
7. **Predicate registry:** OFF_MARKET and OFFERS_INTERVENTION registered (the latter answers D5 OQ-D5-20, OQ-D6-25); SOLE_SUPPLIER_OF replaced by D1/D7 SUPPLIES_MATERIAL + exclusivity=SOLE; SAMPLE_POSITIVE_OUTBREAK_STRAIN and SOURCED_FROM_COUNTRY no longer registered by D6 (requests to D8/D1, OQ-D6-27); MANUFACTURES direction stated as Organization → Product; HAS_LABEL_VERSION stated NON-EXCLUSIVE.
8. **03 against sibling names:** COUNTS_TOWARD_NUTRIENT, HAS_ACTIVE_MOIETY branch (a query for NR returns labels declaring NRC), D1 MOIETY_EQUIVALENT_AMOUNT via DERIVED_FROM for the moiety basis, PRICE_SERIES_METHOD_CHANGE on the price subject, MANUFACTURES subject/object, Q-D6-01 aggregated to DISTINCT LabelVersion, Q-D6-16 reaches label parties through D7 PARENT_OF (the Tru Niagen label names the subsidiary ChromaDex, Inc.).
9. **Seams:** OFFERS_INTERVENTION row; ASSESSES rows for Package and Product; question lists trimmed to patterns that traverse the edge; MassBasis under sharedVocabularies; frontiers and targets notes corrected; D4's DELIVERS accepted (OQ-D6-28).
